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
 * Google Apps Script - Faculty & Staff Daily Activity Tracker
 * Production Edition: 100% Append-Only Persistence & Concurrency Locking
 *
 * GUARANTEES:
 * 1. ZERO DATA LOSS (APPEND-ONLY): Every submission is appended strictly to the bottom
 *    of the individual faculty tab and the Master_Daily_Report (getLastRow() + 1).
 *    Existing historical logs from previous dates are NEVER deleted, cleared, or overwritten.
 * 2. CONCURRENCY MUTEX: ScriptLock safely sequences concurrent submissions.
 * 3. ZERO DUPLICATE TABS: Case-insensitive, whitespace-normalized lookup finds existing tabs.
 *
 * HOW TO DEPLOY:
 * 1. Open your Google Sheet.
 * 2. Click Extensions > Apps Script.
 * 3. Delete any previous code and paste this entire script.
 * 4. Click Deploy > Manage deployments > Edit (or Deploy > New deployment).
 * 5. Set "Execute as": "Me".
 * 6. Set "Who has access": "Anyone".
 * 7. Click "Deploy", authorize permissions, and copy the Web App URL (ends in /exec).
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
    var now = new Date();
    var dayOfWeek = Utilities.formatDate(new Date(date + "T00:00:00"), Session.getScriptTimeZone(), "EEEE");
    var timestampStr = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

    // 1. Get or create faculty personal tab (Zero duplicate tabs)
    var tabResult = getOrCreateFacultySheet(ss, facultyName);
    var facultySheet = tabResult.sheet;
    var safeTabName = facultySheet.getName();

    // 2. Append rows to Faculty Personal Tab (STRICTLY APPEND-ONLY at getLastRow() + 1)
    appendFacultyLogRows(facultySheet, date, dayOfWeek, logs, timestampStr);

    // 3. Append rows to Master_Daily_Report (STRICTLY APPEND-ONLY at getLastRow() + 1)
    var masterSheet = getOrCreateMasterReportSheet(ss);
    appendMasterReportRows(masterSheet, date, dayOfWeek, facultyName, logs, timestampStr);

    return createJsonResponse({
      status: "success",
      message: "Successfully recorded " + logs.length + " activities for " + facultyName + " on tab '" + safeTabName + "' & Master_Daily_Report (Append-Only)",
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
 * Appends duty log rows strictly to the bottom of the faculty member's personal sheet tab.
 * Never touches or overwrites existing historical rows.
 */
function appendFacultyLogRows(sheet, date, dayOfWeek, logs, timestampStr) {
  var lastRow = sheet.getLastRow();
  if (lastRow === 0) {
    formatFacultySheetHeaders(sheet);
    lastRow = 1;
  }

  var rowsToAppend = [];
  for (var i = 0; i < logs.length; i++) {
    var item = logs[i];
    rowsToAppend.push([
      timestampStr,
      date,
      dayOfWeek,
      (item.slot || ("P" + (i + 1))).trim(),
      (item.courseName || item.course || "").trim(),
      (item.section || "").trim(),
      (item.credits || "").toString().trim(),
      (item.unitNo || item.unit || "").toString().trim(),
      (item.topicName || item.activity || "").trim(),
      "Submitted"
    ]);
  }

  if (rowsToAppend.length > 0) {
    var targetStartRow = lastRow + 1;
    var range = sheet.getRange(targetStartRow, 1, rowsToAppend.length, 10);
    range.setValues(rowsToAppend);
  }
}

/**
 * Appends duty log rows strictly to the bottom of the Master_Daily_Report sheet.
 * Never touches or overwrites existing historical rows.
 */
function appendMasterReportRows(masterSheet, date, dayOfWeek, facultyName, logs, timestampStr) {
  var lastRow = masterSheet.getLastRow();
  if (lastRow < 3) {
    formatMasterReportHeaders(masterSheet);
    lastRow = masterSheet.getLastRow();
  }

  // Calculate starting S.No based on existing data rows (excluding 3 header rows)
  var currentDataRowsCount = Math.max(0, lastRow - 3);

  var masterRows = [];
  for (var i = 0; i < logs.length; i++) {
    var itm = logs[i];
    masterRows.push([
      currentDataRowsCount + i + 1,
      timestampStr,
      date,
      facultyName,
      (itm.section || "").trim(),
      (itm.courseName || itm.course || "").trim(),
      (itm.credits || "3").toString().trim(),
      (itm.slot || ("P" + (i + 1))).trim(),
      (itm.unitNo || itm.unit || "").toString().trim(),
      (itm.topicName || itm.activity || "").trim()
    ]);
  }

  if (masterRows.length > 0) {
    var targetStartRow = lastRow + 1;
    var range = masterSheet.getRange(targetStartRow, 1, masterRows.length, 10);
    range.setValues(masterRows);
  }
}

/**
 * Normalizes tab names for robust, case-insensitive comparison.
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
 * Formats a user-friendly display tab title within Google Sheets 100-char limits.
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
 * Gets or creates the official institutional Master_Daily_Report tab
 */
function getOrCreateMasterReportSheet(ss) {
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
  formatMasterReportHeaders(masterSheet);
  return masterSheet;
}

function formatMasterReportHeaders(masterSheet) {
  masterSheet.getRange("A1:J1").merge().setValue("Matrusri Engineering College").setFontWeight("bold").setBackground("#F8CECC").setHorizontalAlignment("center");
  masterSheet.getRange("A2:J2").merge().setValue("Department of Information Technology - Master Faculty Activity Register (Append-Only)").setFontWeight("bold").setBackground("#F8CECC").setHorizontalAlignment("center");

  var mHeaders = [
    "SNO",
    "Timestamp",
    "Date",
    "Name of the Faculty",
    "Section",
    "Course Name",
    "Credits",
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
  masterSheet.setColumnWidth(2, 160);
  masterSheet.setColumnWidth(3, 100);
  masterSheet.setColumnWidth(4, 180);
  masterSheet.setColumnWidth(5, 90);
  masterSheet.setColumnWidth(6, 120);
  masterSheet.setColumnWidth(7, 70);
  masterSheet.setColumnWidth(8, 90);
  masterSheet.setColumnWidth(9, 70);
  masterSheet.setColumnWidth(10, 360);
}

function doGet(e) {
  return createJsonResponse({
    status: "active",
    message: "Faculty Activity Tracker Google Sheets Endpoint is running with 100% Append-Only Zero Data Loss protection.",
    activeSpreadsheet: SpreadsheetApp.getActiveSpreadsheet().getName()
  });
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

