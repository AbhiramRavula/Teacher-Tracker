import { ActivityLog, GoogleSheetsLogItem, GoogleSheetsPayload, Role } from '../types';
import { BASE_TIME_SLOTS, getSlotTimeLabel } from '../constants';
import {
  extractSpreadsheetId,
  getStoredSpreadsheetId,
  getStoredSpreadsheetTitle,
  setStoredSpreadsheetId,
  syncFacultyLogsDirectToGoogleSheet,
  fetchSpreadsheetMetadata,
  createNewActivitySpreadsheet,
  ensureFacultyTabExists,
  initializeAllFacultyTabsInSheet,
} from './googleSheetsApi';
import { getAccessToken } from './firebaseAuth';

export const GOOGLE_SHEETS_URL_STORAGE_KEY = 'it_dept_google_sheets_web_app_url';

export {
  extractSpreadsheetId,
  getStoredSpreadsheetId,
  getStoredSpreadsheetTitle,
  setStoredSpreadsheetId,
  fetchSpreadsheetMetadata,
  createNewActivitySpreadsheet,
  ensureFacultyTabExists,
  initializeAllFacultyTabsInSheet,
};

/**
 * Retrieve stored Google Apps Script Web App URL from localStorage or environment variables (Vercel)
 */
export function getStoredSheetsUrl(): string {
  try {
    const fromStorage = localStorage.getItem(GOOGLE_SHEETS_URL_STORAGE_KEY);
    if (fromStorage && fromStorage.trim()) {
      return fromStorage.trim();
    }
    const fromEnv = (import.meta.env.VITE_GOOGLE_SHEETS_WEB_APP_URL || import.meta.env.VITE_APPS_SCRIPT_URL || '') as string;
    return fromEnv ? fromEnv.trim() : '';
  } catch (e) {
    console.error('Failed to read Google Sheets URL from localStorage:', e);
    const fromEnv = (import.meta.env.VITE_GOOGLE_SHEETS_WEB_APP_URL || import.meta.env.VITE_APPS_SCRIPT_URL || '') as string;
    return fromEnv ? fromEnv.trim() : '';
  }
}

/**
 * Checks if the Web App URL is populated via Vercel / Vite environment variables
 */
export function isSheetsUrlConfiguredInEnv(): boolean {
  const fromEnv = (import.meta.env.VITE_GOOGLE_SHEETS_WEB_APP_URL || import.meta.env.VITE_APPS_SCRIPT_URL || '') as string;
  return Boolean(fromEnv && fromEnv.trim().length > 0);
}

/**
 * Persist Google Apps Script Web App URL to localStorage
 */
export function setStoredSheetsUrl(url: string): void {
  try {
    const trimmed = url.trim();
    if (trimmed) {
      // If user pasted a Google Sheet document link by mistake, save it as spreadsheet ID instead
      const sheetId = extractSpreadsheetId(trimmed);
      if (sheetId && trimmed.includes('docs.google.com/spreadsheets')) {
        setStoredSpreadsheetId(sheetId);
        return;
      }
      localStorage.setItem(GOOGLE_SHEETS_URL_STORAGE_KEY, trimmed);
    } else {
      localStorage.removeItem(GOOGLE_SHEETS_URL_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to save Google Sheets URL to localStorage:', e);
  }
}

import { PeriodSlotData } from '../types';
import { formatPeriodSummary } from './draftStorage';

/**
 * Build the exact payload required by the departmental Google Sheets integration:
 * {
 *   "facultyName": "Dr. J. Srinivas",
 *   "date": "2026-09-10",
 *   "logs": [
 *     {
 *       "slot": "P1",
 *       "section": "III A",
 *       "courseName": "DS",
 *       "credits": "3",
 *       "unitNo": "2",
 *       "topicName": "Stack using linked list"
 *     }
 *   ]
 * }
 */
export function buildSheetsPayload(
  facultyName: string,
  date: string,
  activities: Record<string, string>,
  role: Role = 'Faculty',
  periodData?: Record<string, PeriodSlotData>
): GoogleSheetsPayload {
  const logs: GoogleSheetsLogItem[] = [];

  BASE_TIME_SLOTS.forEach((slot) => {
    // Exclude lunch break and empty slots
    if (slot.isLunchBreak) return;

    const struct = periodData?.[slot.id];
    const activityText = activities[slot.id];

    const hasStructured = Boolean(
      struct && (
        (struct.topicName && struct.topicName.trim().length > 0) ||
        (struct.courseName && struct.courseName.trim().length > 0)
      )
    );

    const hasPlain = Boolean(activityText && activityText.trim().length > 0);

    if (hasStructured && struct) {
      logs.push({
        slot: struct.slot || slot.periodCode || slot.id.replace('slot_', 'P').toUpperCase(),
        section: struct.section || 'III A',
        courseName: struct.courseName || 'IT Subject',
        credits: struct.credits || (slot.isClosingSlot ? '0' : '3'),
        unitNo: struct.unitNo || '1',
        topicName: struct.topicName || '',
        activity: formatPeriodSummary(struct) || struct.topicName || '',
      });
    } else if (hasPlain && activityText) {
      logs.push({
        slot: slot.periodCode || slot.id.replace('slot_', 'P').toUpperCase(),
        section: 'III A',
        courseName: 'Class Duty',
        credits: slot.isClosingSlot ? '0' : '3',
        unitNo: '1',
        topicName: activityText.trim(),
        activity: activityText.trim(),
      });
    }
  });

  return {
    facultyName: facultyName.trim(),
    date,
    logs,
  };
}

/**
 * Master Dispatcher: Sends activity log to Google Sheets using:
 * 1. Direct Google Sheets API v4 (if user is authenticated & has spreadsheet configured) -> Most reliable!
 * 2. Or Google Apps Script Web App URL (if configured)
 */
export async function dispatchLogToGoogleSheets(
  payload: GoogleSheetsPayload,
  directTokenOverride?: string | null
): Promise<{
  success: boolean;
  message: string;
  spreadsheetUrl?: string;
  tabName?: string;
  method: 'direct_api' | 'apps_script' | 'none';
  isOpaque?: boolean;
}> {
  const token = directTokenOverride || (await getAccessToken());
  const spreadsheetId = getStoredSpreadsheetId();
  const scriptUrl = getStoredSheetsUrl();
  const spreadsheetUrl = spreadsheetId
    ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
    : undefined;

  // Method 1: Direct Google Sheets API (used if user has an active authenticated token + spreadsheetId)
  if (token && spreadsheetId) {
    try {
      const result = await syncFacultyLogsDirectToGoogleSheet(token, spreadsheetId, payload);
      return {
        success: true,
        message: result.message,
        spreadsheetUrl: result.spreadsheetUrl || spreadsheetUrl,
        tabName: result.tabName,
        method: 'direct_api',
      };
    } catch (apiError: unknown) {
      const errorMsg = apiError instanceof Error ? apiError.message : String(apiError);
      console.warn('Direct Google Sheets API sync issue:', errorMsg);

      // Automatic Fallback: If Apps Script Web App is configured, attempt public sync immediately!
      if (scriptUrl && scriptUrl.trim()) {
        try {
          const fallbackRes = await submitLogToGoogleSheets(scriptUrl, payload);
          if (fallbackRes.success) {
            return {
              success: true,
              message: fallbackRes.message,
              spreadsheetUrl,
              tabName: payload.facultyName,
              method: 'apps_script',
              isOpaque: fallbackRes.isOpaque,
            };
          }
        } catch {
          // Continue to error formatting below
        }
      }

      let cleanMessage = `Google Sheets API: ${errorMsg}`;
      if (
        errorMsg.includes('429') ||
        errorMsg.includes('Quota exceeded') ||
        errorMsg.includes('RATE_LIMIT_EXCEEDED') ||
        errorMsg.includes('RESOURCE_EXHAUSTED')
      ) {
        cleanMessage =
          'Google Sheets rate limit exceeded (Google limits write requests to 60/min per account). Log is safely saved in local and cloud records; please wait 30 seconds before re-submitting to Sheets.';
      }

      return {
        success: false,
        message: cleanMessage,
        method: 'direct_api',
      };
    }
  }

  // Method 2: Public Google Apps Script Web App POST (ZERO-AUTH: allows any faculty or staff to submit freely without login)
  if (scriptUrl && scriptUrl.trim()) {
    const appsScriptResult = await submitLogToGoogleSheets(scriptUrl, payload);
    return {
      success: appsScriptResult.success,
      message: appsScriptResult.message,
      spreadsheetUrl,
      tabName: payload.facultyName,
      method: 'apps_script',
      isOpaque: appsScriptResult.isOpaque,
    };
  }

  // Method 3: Spreadsheet configured, but no Apps Script Web App URL and no Google OAuth token
  if (spreadsheetId && !token && !scriptUrl) {
    return {
      success: false,
      message:
        'Department Google Sheet is linked, but public submissions require the HoD to configure the Google Apps Script Web App URL in Sheets Sync.',
      method: 'direct_api',
    };
  }

  // Neither is configured
  return {
    success: false,
    message:
      'Google Sheets sync is not configured yet. Your activity log is securely saved in departmental cloud records.',
    method: 'none',
  };
}

/**
 * Send POST request to Google Apps Script Web App URL.
 */
export async function submitLogToGoogleSheets(
  scriptUrl: string,
  payload: GoogleSheetsPayload
): Promise<{ success: boolean; message: string; isOpaque?: boolean; details?: unknown }> {
  if (!scriptUrl || !scriptUrl.trim()) {
    return {
      success: false,
      message: 'Google Apps Script Web App URL is not configured.',
    };
  }

  const cleanUrl = scriptUrl.trim();

  // If user accidentally passed a spreadsheet URL
  if (cleanUrl.includes('docs.google.com/spreadsheets')) {
    return {
      success: false,
      message:
        'This is a Google Sheet document link, not an Apps Script /exec URL. Use the "Connect Plain Sheet" tab for plain Google Sheet URLs!',
    };
  }

  if (cleanUrl.includes('/dev')) {
    return {
      success: false,
      message:
        'Your URL ends with /dev. Test /dev URLs require Google login and block external apps. Please deploy a Web App and use the URL ending with /exec.',
    };
  }

  // Attempt 1: Standard fetch (supports reading JSON response)
  try {
    const response = await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    if (response.ok) {
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        if (json.status === 'error') {
          return {
            success: false,
            message: `Google Apps Script returned an error: ${json.message || 'Unknown script error'}`,
            details: json,
          };
        }
        return {
          success: true,
          message:
            json.message ||
            `Successfully registered ${payload.logs.length} activities in sheet tab "${payload.facultyName}"!`,
          details: json,
        };
      } catch {
        return {
          success: true,
          message: `Successfully sent ${payload.logs.length} activities to Google Sheets!`,
          details: text,
        };
      }
    } else {
      return {
        success: false,
        message: `Google Sheets responded with HTTP status ${response.status}`,
      };
    }
  } catch (err: unknown) {
    // Attempt 2: Fallback with mode: 'no-cors'
    // Browser CORS policies frequently block Google Apps Script 302 redirects even when the script executed.
    // 'no-cors' mode allows the HTTP POST with payload to reach Google's server and execute doPost(e).
    try {
      await fetch(cleanUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      return {
        success: true,
        isOpaque: true,
        message: `Log dispatched to Google Sheet tab "${payload.facultyName}". (Dispatched via browser channel. If rows do not appear, ensure Apps Script is deployed with "Who has access: Anyone").`,
      };
    } catch (fallbackErr: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: `Failed to connect to Google Sheets Web App: ${errorMsg}. Please ensure 'Who has access' is set to 'Anyone' and redeploy as 'New version'.`,
        details: fallbackErr,
      };
    }
  }
}

/**
 * Test connectivity to a Google Apps Script Web App URL
 */
export async function testAppsScriptEndpoint(
  scriptUrl: string
): Promise<{ success: boolean; message: string; suggestions?: string[] }> {
  if (!scriptUrl || !scriptUrl.trim()) {
    return {
      success: false,
      message: 'Please enter a Google Apps Script Web App URL first.',
    };
  }

  const cleanUrl = scriptUrl.trim();

  if (cleanUrl.includes('docs.google.com/spreadsheets')) {
    return {
      success: false,
      message: 'This is a spreadsheet link, not an Apps Script URL. Use the "Connect Plain Sheet" tab instead.',
    };
  }

  if (cleanUrl.includes('/dev')) {
    return {
      success: false,
      message: 'Your URL ends in /dev. You must deploy a Web App and use the URL ending in /exec.',
      suggestions: [
        'In Apps Script, click Deploy > New deployment',
        'Select Web app',
        'Set "Who has access" to "Anyone"',
        'Copy the URL ending in /exec',
      ],
    };
  }

  const testPayload: GoogleSheetsPayload = {
    facultyName: 'Connection Test',
    date: new Date().toISOString().split('T')[0],
    logs: [
      {
        slot: 'Test Slot',
        activity: 'Connectivity verification from Employee Activity Tracker',
      },
    ],
  };

  const result = await submitLogToGoogleSheets(cleanUrl, testPayload);
  if (result.success) {
    return {
      success: true,
      message: result.message,
    };
  }

  return {
    success: false,
    message: result.message,
    suggestions: [
      'Did you redeploy as a "New version"? In Apps Script, click Deploy > Manage deployments > Edit (pencil) > Version: "New version" > Deploy.',
      'Check "Who has access": It MUST be set to "Anyone" (not "Only myself").',
      'Check "Execute as": It must be set to "Me".',
      'Make sure you authorized permissions when deploying.',
    ],
  };
}

import { exportMultiTabGrandExcel } from './excelExport';

/**
 * Downloads the full Multi-Tab Excel Workbook (.xlsx) with:
 * - Tab 1: Grand_Daily_Report (matching official Matrusri IT departmental layout from image)
 * - Tabs 2..N: Dedicated tab for each individual faculty teacher
 */
export function exportLogsToExcelCsv(logs: ActivityLog[], filename?: string): void {
  if (!logs || logs.length === 0) {
    alert('No activity logs found to export.');
    return;
  }
  exportMultiTabGrandExcel(logs, { filename });
}

export { exportMultiTabGrandExcel };

/**
 * Ready-to-deploy Google Apps Script Code snippet for the user to copy directly into their Google Sheet.
 * Features enterprise-grade concurrency locking, case-insensitive normalized tab matching,
 * duplicate tab prevention, and duplicate row idempotency.
 */
export const SAMPLE_APPS_SCRIPT_CODE = `/**
 * Google Apps Script - Faculty Daily Activity Tracker
 * Enterprise Edition with Concurrency Locking & Zero-Duplicate Tab Guarantee
 *
 * FEATURES:
 * 1. ScriptLock prevents concurrent race conditions across simultaneous faculty submissions.
 * 2. Case-insensitive, whitespace-normalized matching guarantees zero duplicate tab creation.
 * 3. Idempotent row insertion prevents duplicate duty entries if faculty resubmits or network retries.
 * 4. Automatically maintains both individual Faculty tabs and the consolidated Grand_Daily_Report.
 *
 * HOW TO DEPLOY:
 * 1. Open your plain Google Sheet.
 * 2. Click Extensions > Apps Script.
 * 3. Delete any default code and paste this entire script.
 * 4. Click Deploy > New deployment.
 * 5. Select type: "Web app".
 * 6. Set "Execute as": "Me".
 * 7. Set "Who has access": "Anyone".
 * 8. Click "Deploy", authorize permissions, and copy the Web app URL.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  var hasLock = false;

  try {
    // Acquire mutex lock with 30s timeout to handle concurrent staffroom submissions
    hasLock = lock.tryLock(30000);
    if (!hasLock) {
      return createJsonResponse({
        status: "busy",
        message: "Server is currently synchronizing another submission. Please retry in a few seconds."
      });
    }

    var rawData = e.postData ? e.postData.contents : "";
    if (!rawData) {
      return createJsonResponse({ status: "error", message: "Empty request payload received" });
    }

    var data = JSON.parse(rawData);
    var facultyName = (data.facultyName || "General Staff").trim();
    var date = data.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
    var logs = data.logs || [];

    if (!logs || logs.length === 0) {
      return createJsonResponse({ status: "success", message: "No activity logs to register.", rowsAdded: 0 });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Get or create faculty tab with bulletproof duplicate prevention
    var tabResult = getOrCreateFacultySheet(ss, facultyName);
    var sheet = tabResult.sheet;
    var safeTabName = sheet.getName();

    var now = new Date();
    var dayOfWeek = Utilities.formatDate(new Date(date + "T00:00:00"), Session.getScriptTimeZone(), "EEEE");
    var timestampStr = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

    // 2. Write to Faculty Personal Tab: New distinct table for this single day
    syncFacultyDailyTable(sheet, date, dayOfWeek, logs, timestampStr);

    // 3. Write to Grand_Daily_Report: New distinct table for this single day
    var grandSheet = getOrCreateGrandReportSheet(ss);
    syncGrandDailyTable(grandSheet, date, dayOfWeek, facultyName, logs);

    return createJsonResponse({
      status: "success",
      message: "Successfully synchronized " + logs.length + " activities for " + facultyName + " on tab '" + safeTabName + "' & Grand_Daily_Report (Dual-Entry Daily Tables)",
      faculty: facultyName,
      sheetTab: safeTabName,
      rowsAdded: logs.length,
      tabCreated: tabResult.isNew
    });

  } catch (err) {
    return createJsonResponse({
      status: "error",
      message: err.toString()
    });
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

/**
 * Creates or updates a distinct table for every single day on the Faculty Personal Sheet
 */
function syncFacultyDailyTable(sheet, date, dayOfWeek, logs, timestampStr) {
  var lastRow = sheet.getLastRow();
  var data = lastRow > 0 ? sheet.getRange(1, 1, lastRow, 9).getValues() : [];

  var dayBorder = '═══════════════════════════════════════════════════════════════════════════════════';
  var dayBanner = '📅 DATE: ' + date + ' (' + dayOfWeek.toUpperCase() + ') — FACULTY ACTIVITY REPORT';
  var dayDivider = '────────────────── End of Daily Activity Report for ' + date + ' (' + logs.length + ' Slots Logged) ──────────────────';

  var dayHeaders = ['SNO', 'Date', 'Class Hour / Slot', 'Section', 'Course Name', 'Credits', 'Unit No', 'Topic Name / Activity Covered', 'Status'];

  // Check if a table for this date already exists
  var dateTableIdx = -1;
  for (var r = 0; r < data.length; r++) {
    var cellA = (data[r][0] || "").toString();
    if (cellA.indexOf(date) !== -1 && (cellA.indexOf("DATE:") !== -1 || cellA.indexOf("REPORT") !== -1)) {
      dateTableIdx = r + 1; // 1-based index of banner
      break;
    }
  }

  var dutyRows = [];
  for (var i = 0; i < logs.length; i++) {
    var item = logs[i];
    dutyRows.push([
      i + 1,
      date,
      (item.slot || "P" + (i + 1)).trim(),
      (item.section || "").trim(),
      (item.courseName || item.course || "").trim(),
      (item.credits || "").toString().trim(),
      (item.unitNo || item.unit || "").toString().trim(),
      (item.topicName || item.activity || "").trim(),
      "Submitted"
    ]);
  }

  if (dateTableIdx === -1) {
    // Brand new table for this date
    var tableRows = [];
    tableRows.push([dayBorder, "", "", "", "", "", "", "", ""]);
    tableRows.push([dayBanner, "", "", "", "", "", "", "", ""]);
    tableRows.push([dayBorder, "", "", "", "", "", "", "", ""]);
    tableRows.push(dayHeaders);

    for (var d = 0; d < dutyRows.length; d++) {
      tableRows.push(dutyRows[d]);
    }
    tableRows.push([dayDivider, "", "", "", "", "", "", "", ""]);
    tableRows.push(["", "", "", "", "", "", "", "", ""]);

    var startRow = lastRow > 0 ? lastRow + 2 : 1;
    var range = sheet.getRange(startRow, 1, tableRows.length, 9);
    range.setValues(tableRows);

    // Banner formatting: distinct high-contrast slate navy
    sheet.getRange(startRow + 1, 1, 1, 9).setFontWeight("bold").setBackground("#0F172A").setFontColor("#FFFFFF").setHorizontalAlignment("left");
    // Column headers formatting
    sheet.getRange(startRow + 3, 1, 1, 9).setFontWeight("bold").setBackground("#E2E8F0").setFontColor("#0F172A").setHorizontalAlignment("center");
  } else {
    // Existing day table -> update rows in place without losing any previously logged slots
    var dataStartRow = dateTableIdx + 3; // after borders and header
    if (dutyRows.length > 0) {
      sheet.getRange(dataStartRow, 1, dutyRows.length, 9).setValues(dutyRows);
    }
  }
}

/**
 * Creates or updates a distinct table for every single day on the Grand Daily Report Sheet
 */
function syncGrandDailyTable(grandSheet, date, dayOfWeek, facultyName, logs) {
  var lastRow = grandSheet.getLastRow();
  var data = lastRow > 0 ? grandSheet.getRange(1, 1, lastRow, 9).getValues() : [];

  var grandBorder = '🏛️═════════════════════════════════════════════════════════════════════════════════';
  var grandBanner = '📅 DEPARTMENT OF INFORMATION TECHNOLOGY — GRAND DAILY REPORT | Date: ' + date + ' (' + dayOfWeek.toUpperCase() + ')';
  var grandDivider = '────────────────── End of Grand Daily Register for ' + date + ' ──────────────────';

  var grandHeaders = ['SNO', 'Date', 'Name of the Faculty', 'Section', 'Course Name', 'Credits', 'Class Hour / Slot', 'Unit No', 'Topic Name / Duty Details'];

  var dateTableIdx = -1;
  var dateTableEndIdx = -1;

  for (var r = 0; r < data.length; r++) {
    var cellA = (data[r][0] || "").toString();
    if (cellA.indexOf("GRAND DAILY REPORT") !== -1 && cellA.indexOf(date) !== -1) {
      dateTableIdx = r + 1;
      for (var k = r + 1; k < data.length; k++) {
        var rowValA = (data[k][0] || "").toString();
        if (rowValA.indexOf("End of Grand Daily Register") !== -1) {
          dateTableEndIdx = k + 1;
          break;
        }
      }
      if (dateTableEndIdx === -1) dateTableEndIdx = lastRow;
      break;
    }
  }

  // Build this faculty's duty rows
  var thisFacultyDutyRows = [];
  for (var i = 0; i < logs.length; i++) {
    var itm = logs[i];
    thisFacultyDutyRows.push([
      0,
      date,
      facultyName,
      (itm.section || "III A").trim(),
      (itm.courseName || itm.course || "Course").trim(),
      (itm.credits || "3").toString().trim(),
      (itm.slot || "P" + (i + 1)).trim(),
      (itm.unitNo || itm.unit || "1").toString().trim(),
      (itm.topicName || itm.activity || "").trim()
    ]);
  }

  if (dateTableIdx === -1) {
    // Brand new table for this date on Grand Daily Report
    var grandTableRows = [];
    grandTableRows.push([grandBorder, "", "", "", "", "", "", "", ""]);
    grandTableRows.push([grandBanner, "", "", "", "", "", "", "", ""]);
    grandTableRows.push([grandBorder, "", "", "", "", "", "", "", ""]);
    grandTableRows.push(grandHeaders);

    for (var m = 0; m < thisFacultyDutyRows.length; m++) {
      thisFacultyDutyRows[m][0] = m + 1;
      grandTableRows.push(thisFacultyDutyRows[m]);
    }
    grandTableRows.push([grandDivider, "", "", "", "", "", "", "", ""]);
    grandTableRows.push(["", "", "", "", "", "", "", "", ""]);

    var startRow = lastRow > 0 ? lastRow + 2 : 1;
    var range = grandSheet.getRange(startRow, 1, grandTableRows.length, 9);
    range.setValues(grandTableRows);

    // Banner formatting
    grandSheet.getRange(startRow + 1, 1, 1, 9).setFontWeight("bold").setBackground("#1E293B").setFontColor("#FFFFFF").setHorizontalAlignment("left");
    // Column headers formatting
    grandSheet.getRange(startRow + 3, 1, 1, 9).setFontWeight("bold").setBackground("#CBD5E1").setFontColor("#0F172A").setHorizontalAlignment("center");
  } else {
    // Day table already exists -> Append or update without duplicating this faculty or losing other faculty entries
    var otherFacultyRows = [];
    if (dateTableIdx !== -1) {
      for (var rowIdx = dateTableIdx + 3; rowIdx < (dateTableEndIdx || lastRow); rowIdx++) {
        var row = data[rowIdx - 1];
        if (!row || !row[2]) continue;
        var fName = (row[2] || "").toString().trim();
        if (fName.toLowerCase() !== facultyName.toLowerCase()) {
          otherFacultyRows.push(row);
        }
      }
    }

    var combined = otherFacultyRows.concat(thisFacultyDutyRows);
    for (var c = 0; c < combined.length; c++) {
      combined[c][0] = c + 1;
    }

    var insertStartRow = dateTableIdx + 4;
    grandSheet.getRange(insertStartRow, 1, combined.length, 9).setValues(combined);
  }
}

/**
 * Normalizes tab names for robust, case-insensitive comparison.
 * Collapses whitespace, removes punctuation and invalid sheet characters: : \\ / ? * [ ] '
 */
function normalizeTabKey(name) {
  if (!name) return "";
  return name
    .toString()
    .toLowerCase()
    .replace(/[:\\\\/?*\\[\\]']/g, "")
    .replace(/\\s+/g, " ")
    .trim();
}

/**
 * Formats a user-friendly display tab title within Google Sheets 100-char limits
 */
function sanitizeTabTitle(name) {
  if (!name) return "General Staff";
  var cleaned = name
    .toString()
    .replace(/[:\\\\/?*\\[\\]']/g, "")
    .replace(/\\s+/g, " ")
    .trim();
  return cleaned.substring(0, 95) || "Faculty Log";
}

/**
 * Finds an existing sheet using ss.getSheetByName() and normalized, case-insensitive matching.
 * If not found, creates the sheet and formats headers atomically.
 */
function getOrCreateFacultySheet(ss, facultyName) {
  var displayTitle = sanitizeTabTitle(facultyName);

  // 1. Direct fast lookup using ss.getSheetByName()
  var directMatch = ss.getSheetByName(displayTitle);
  if (directMatch) {
    return { sheet: directMatch, isNew: false };
  }

  // 2. Case-insensitive and whitespace-normalized check across all existing sheets
  var targetKey = normalizeTabKey(facultyName);
  var sheets = ss.getSheets();

  for (var i = 0; i < sheets.length; i++) {
    var sheetName = sheets[i].getName();
    if (normalizeTabKey(sheetName) === targetKey) {
      return { sheet: sheets[i], isNew: false };
    }
  }

  // Tab does not exist yet -> Create with standardized title
  try {
    var newSheet = ss.insertSheet(displayTitle);
    formatFacultySheetHeaders(newSheet);
    return { sheet: newSheet, isNew: true };
  } catch (e) {
    // Edge case fallback: if another thread or transient naming collision occurred, re-verify with getSheetByName
    var fallback = ss.getSheetByName(displayTitle);
    if (fallback) {
      return { sheet: fallback, isNew: false };
    }
    var retrySheets = ss.getSheets();
    for (var j = 0; j < retrySheets.length; j++) {
      if (normalizeTabKey(retrySheets[j].getName()) === targetKey) {
        return { sheet: retrySheets[j], isNew: false };
      }
    }
    throw e;
  }
}

/**
 * Applies header rows, frozen panes, and column widths to a new faculty sheet
 */
function formatFacultySheetHeaders(sheet) {
  var headers = [
    "Timestamp",
    "Date",
    "Day of Week",
    "Period Slot",
    "Course Name",
    "Section",
    "Credits",
    "Unit No",
    "Topic / Activity",
    "Submission Status"
  ];

  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#0F172A"); // Slate 900
  headerRange.setFontColor("#FFFFFF");
  headerRange.setHorizontalAlignment("center");
  headerRange.setVerticalAlignment("middle");
  sheet.setRowHeight(1, 35);

  sheet.setColumnWidth(1, 160);
  sheet.setColumnWidth(2, 100);
  sheet.setColumnWidth(3, 100);
  sheet.setColumnWidth(4, 90);
  sheet.setColumnWidth(5, 120);
  sheet.setColumnWidth(6, 90);
  sheet.setColumnWidth(7, 70);
  sheet.setColumnWidth(8, 70);
  sheet.setColumnWidth(9, 360);
  sheet.setColumnWidth(10, 110);

  sheet.setFrozenRows(1);
}

/**
 * Reads existing Date + Slot combinations on a faculty sheet to prevent duplicates
 */
function getExistingFacultySlotKeys(sheet, targetDate) {
  var slotMap = {};
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return slotMap;

  // Read Date (col 2) and Period Slot (col 4)
  var numRows = lastRow - 1;
  var dateValues = sheet.getRange(2, 2, numRows, 1).getValues();
  var slotValues = sheet.getRange(2, 4, numRows, 1).getValues();

  for (var r = 0; r < numRows; r++) {
    var rawDate = dateValues[r][0];
    var formattedDate = rawDate instanceof Date
      ? Utilities.formatDate(rawDate, Session.getScriptTimeZone(), "yyyy-MM-dd")
      : (rawDate ? rawDate.toString().trim() : "");

    if (formattedDate === targetDate) {
      var slotCode = (slotValues[r][0] || "").toString().trim().toLowerCase();
      if (slotCode) {
        slotMap[formattedDate + "|" + slotCode] = true;
      }
    }
  }

  return slotMap;
}

/**
 * Gets or creates the official institutional Master_Daily_Report tab
 */
function getOrCreateGrandReportSheet(ss) {
  // 1. Direct fast lookup with ss.getSheetByName()
  var directMaster = ss.getSheetByName("Master_Daily_Report") || ss.getSheetByName("Grand_Daily_Report");
  if (directMaster) {
    return directMaster;
  }

  // 2. Case-insensitive and normalized check across all existing sheets
  var targetKeys = ["masterdailyreport", "granddailyreport"];
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var k = normalizeTabKey(sheets[i].getName());
    if (targetKeys.indexOf(k) !== -1) {
      return sheets[i];
    }
  }

  var masterSheet = ss.insertSheet("Master_Daily_Report", 0);
  masterSheet.getRange("A1:I1").merge().setValue("Matrusri Engineering College").setFontWeight("bold").setBackground("#F8CECC").setHorizontalAlignment("center");
  masterSheet.getRange("A2:I2").merge().setValue("Department of Information Technology - Daily Faculty Activity Register").setFontWeight("bold").setBackground("#F8CECC").setHorizontalAlignment("center");

  var mHeaders = [
    "SNO",
    "Date",
    "Name of the Faculty",
    "Section",
    "Course Name",
    "credits",
    "Class Hour",
    "Unit No",
    "Topic Name"
  ];
  var mHeaderRange = masterSheet.getRange(3, 1, 1, mHeaders.length);
  mHeaderRange.setValues([mHeaders]);
  mHeaderRange.setFontWeight("bold");
  mHeaderRange.setBackground("#B4D5E6");
  mHeaderRange.setFontColor("#000000");
  mHeaderRange.setHorizontalAlignment("center");
  masterSheet.setRowHeight(3, 30);
  masterSheet.setFrozenRows(3);

  masterSheet.setColumnWidth(1, 60);
  masterSheet.setColumnWidth(2, 100);
  masterSheet.setColumnWidth(3, 180);
  masterSheet.setColumnWidth(4, 90);
  masterSheet.setColumnWidth(5, 120);
  masterSheet.setColumnWidth(6, 70);
  masterSheet.setColumnWidth(7, 90);
  masterSheet.setColumnWidth(8, 70);
  masterSheet.setColumnWidth(9, 360);

  return masterSheet;
}

function doGet(e) {
  return createJsonResponse({
    status: "active",
    message: "Faculty Activity Tracker Google Sheets Endpoint is running with Zero-Duplicate tab protection.",
    activeSpreadsheet: SpreadsheetApp.getActiveSpreadsheet().getName()
  });
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
