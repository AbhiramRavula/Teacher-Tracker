import { ActivityLog, GoogleSheetsLogItem, GoogleSheetsPayload, PeriodSlotData, Role } from '../types';
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

/**
 * Strips any leaked bracketed metadata strings like `[OS LAB | Sec: III A | 3 Cr | Unit: 1]`
 * or Markdown markers from topic text to ensure clean Google Sheets cell values.
 */
export function cleanTopicString(raw?: string): string {
  if (!raw) return '';
  return raw
    .toString()
    .replace(/^\[.*?\]\s*/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .trim();
}

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
    // Exclude lunch break
    if (slot.isLunchBreak) return;

    const struct = periodData?.[slot.id];
    const activityText = activities[slot.id];

    const rawTopic = struct?.topicName?.trim() || activityText?.trim() || '';
    const cleanTopic = cleanTopicString(rawTopic);

    // Only include slot if it has actual entered content
    const hasContent = Boolean(
      cleanTopic.length > 0 ||
      (struct?.courseName && struct.courseName.trim().length > 0)
    );

    if (hasContent) {
      const cleanCourse = struct?.courseName?.trim() || (role === 'Programmer' ? 'Systems & Labs Support' : 'Class Duty');
      const cleanSection = struct?.section?.trim() || (role === 'Programmer' ? '-' : 'III A');
      const cleanCredits = struct?.credits?.trim() || (slot.isClosingSlot ? '0' : '3');
      const cleanUnit = struct?.unitNo?.trim() || (slot.isClosingSlot ? '-' : '1');
      const slotCode = struct?.slot?.trim() || slot.periodCode || slot.id.replace('slot_', 'P').toUpperCase();

      logs.push({
        slot: slotCode,
        section: cleanSection,
        courseName: cleanCourse,
        credits: cleanCredits,
        unitNo: cleanUnit,
        topicName: cleanTopic || (role === 'Programmer' ? 'Lab systems maintenance' : 'Departmental duty'),
        activity: cleanTopic || (role === 'Programmer' ? 'Lab systems maintenance' : 'Departmental duty'),
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
 * =========================================================================================
 * Faculty & Staff Daily Activity Tracker - Production Backend
 * Matrusri Engineering College | Department of Information Technology
 * Edition: Institutional Sectional Master Report Layout & Same-Day Upsert Logic
 * =========================================================================================
 *
 * ARCHITECTURAL FEATURES:
 * 1. INSTITUTIONAL MASTER_DAILY_REPORT SECTIONAL LAYOUT:
 *    - Replicates the official MECS IT Dept layout with colored institutional banners:
 *      • Top Headers: "Matrusri Engineering College" & "Department of Information Technology"
 *      • Grid: [SNO, Date, Name of the Faculty, Section, Course Name, credits, Class Hour, Unit No, Topic Name]
 *      • Grouped Sub-Tables:
 *        - III SEM IT A CLASS REPORT
 *        - V SEM IT A CLASS REPORT
 *        - VII SEM IT A CLASS REPORT
 *        - III SEM IT B CLASS REPORT
 *        - V SEM IT B CLASS REPORT
 *        - VII SEM IT B CLASS REPORT
 *        - DEPARTMENTAL & LAB DUTIES REPORT
 *
 * 2. SAME-DAY SMART UPSERT (ZERO DUPLICATE DAYS):
 *    - Faculty Tab: If submissions for that Date already exist, they are replaced in-place.
 *    - Master Report: If entries for that (Date + Faculty + Slot) exist, they are updated in-place.
 *    - Allows faculty to edit/re-submit daily logs anytime to fix mistakes with zero duplicate clutter.
 *
 * 3. INDIVIDUAL FACULTY TAB LAYOUT:
 *    - Dedicated personal activity registers with college header banners and sequential SNO.
 *
 * 4. CONCURRENCY MUTEX LOCK:
 *    - LockService.getScriptLock() (30s timeout) sequences concurrent staff submissions.
 * =========================================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  var hasLock = false;

  try {
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
    var dateIso = data.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
    var logs = data.logs || [];

    if (!logs || logs.length === 0) {
      return createJsonResponse({ status: "success", message: "No activity logs to register.", rowsUpdated: 0 });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var displayDate = formatDisplayDate(dateIso);

    // 1. Process Individual Faculty Tab (Same-Day Upsert)
    var facultyTab = getOrCreateFacultySheet(ss, facultyName);
    var facultyUpsertCount = upsertFacultyTabRows(facultyTab, displayDate, dateIso, facultyName, logs);

    // 2. Process Master_Daily_Report (Sectional Layout + Same-Day Upsert)
    var masterSheet = getOrCreateMasterReportSheet(ss);
    var masterUpsertCount = upsertMasterReportRows(masterSheet, displayDate, dateIso, facultyName, logs);

    return createJsonResponse({
      status: "success",
      message: "Successfully synchronized " + logs.length + " activities for " + facultyName + " on " + displayDate + " (Tab: '" + facultyTab.getName() + "' & Master_Daily_Report).",
      faculty: facultyName,
      date: displayDate,
      facultyTab: facultyTab.getName(),
      facultyRowsUpdated: facultyUpsertCount,
      masterRowsUpdated: masterUpsertCount
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
 * Formats YYYY-MM-DD into college display format D-M-YY (e.g. "10-9-26")
 */
function formatDisplayDate(isoDateStr) {
  if (!isoDateStr) return "";
  var parts = isoDateStr.split("-");
  if (parts.length === 3) {
    var year = parts[0];
    var month = parseInt(parts[1], 10);
    var day = parseInt(parts[2], 10);
    var shortYear = year.length === 4 ? year.substring(2) : year;
    return day + "-" + month + "-" + shortYear;
  }
  return isoDateStr;
}

/**
 * Strips bracketed metadata strings (e.g. [OS LAB | Sec: III A]) and markdown asterisks
 */
function sanitizeTopicContent(raw) {
  if (!raw) return "";
  return raw
    .toString()
    .replace(/^\\[.*?\\]\\s*/g, "")
    .replace(/\\*\\*/g, "")
    .replace(/\\*/g, "")
    .trim();
}

/**
 * Categorizes an individual slot entry into its designated class report section.
 */
function determineSectionCategory(section, courseName, slot) {
  var sec = (section || "").toString().toUpperCase().trim();
  var crs = (courseName || "").toString().toUpperCase().trim();

  // III SEM IT A
  if (
    (sec.indexOf("III") !== -1 && (sec.indexOf("A") !== -1 || sec.indexOf("SEC-A") !== -1)) ||
    crs.indexOf("WTLAB") !== -1 || crs.indexOf("WT LAB") !== -1 ||
    (sec.indexOf("3") === 0 && sec.indexOf("A") !== -1)
  ) {
    return "III SEM IT A CLASS REPORT";
  }

  // V SEM IT A
  if (
    (sec.indexOf("V") !== -1 && sec.indexOf("VII") === -1 && (sec.indexOf("A") !== -1 || sec.indexOf("SEC-A") !== -1)) ||
    crs === "SE" || (crs.indexOf("PPL") !== -1 && sec.indexOf("B") === -1) ||
    crs.indexOf("DISASTER") !== -1 ||
    (sec.indexOf("5") === 0 && sec.indexOf("A") !== -1)
  ) {
    return "V SEM IT A CLASS REPORT";
  }

  // VII SEM IT A
  if (
    (sec.indexOf("VII") !== -1 && (sec.indexOf("A") !== -1 || sec.indexOf("SEC-A") !== -1)) ||
    (sec.indexOf("7") === 0 && sec.indexOf("A") !== -1)
  ) {
    return "VII SEM IT A CLASS REPORT";
  }

  // III SEM IT B
  if (
    (sec.indexOf("III") !== -1 && (sec.indexOf("B") !== -1 || sec.indexOf("SEC-B") !== -1)) ||
    crs === "F&A" || crs === "MFIT" || crs.indexOf("F&A") !== -1 ||
    (sec.indexOf("3") === 0 && sec.indexOf("B") !== -1)
  ) {
    return "III SEM IT B CLASS REPORT";
  }

  // V SEM IT B
  if (
    (sec.indexOf("V") !== -1 && sec.indexOf("VII") === -1 && (sec.indexOf("B") !== -1 || sec.indexOf("SEC-B") !== -1)) ||
    crs === "AI" || crs === "FSD" || crs === "OOAD" ||
    (sec.indexOf("5") === 0 && sec.indexOf("B") !== -1)
  ) {
    return "V SEM IT B CLASS REPORT";
  }

  // VII SEM IT B
  if (
    (sec.indexOf("VII") !== -1 && (sec.indexOf("B") !== -1 || sec.indexOf("SEC-B") !== -1)) ||
    (sec.indexOf("7") === 0 && sec.indexOf("B") !== -1)
  ) {
    return "VII SEM IT B CLASS REPORT";
  }

  // Default Departmental & Lab Duties
  return "DEPARTMENTAL & LAB DUTIES REPORT";
}

/**
 * Section order list matching reference sheet
 */
var SECTION_ORDER = [
  "III SEM IT A CLASS REPORT",
  "V SEM IT A CLASS REPORT",
  "VII SEM IT A CLASS REPORT",
  "III SEM IT B CLASS REPORT",
  "V SEM IT B CLASS REPORT",
  "VII SEM IT B CLASS REPORT",
  "DEPARTMENTAL & LAB DUTIES REPORT"
];

/**
 * =========================================================================================
 * 1. MASTER DAILY REPORT LOGIC (SECTIONAL GROUPING + SAME-DAY UPSERT)
 * =========================================================================================
 */

function getOrCreateMasterReportSheet(ss) {
  var targetNames = ["Master_Daily_Report", "Grand_Daily_Report"];
  for (var t = 0; t < targetNames.length; t++) {
    var s = ss.getSheetByName(targetNames[t]);
    if (s) return s;
  }

  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var k = sheets[i].getName().toLowerCase().replace(/[\\s_]/g, "");
    if (k === "masterdailyreport" || k === "granddailyreport") {
      return sheets[i];
    }
  }

  // Build new master sheet with institutional styling
  var master = ss.insertSheet("Master_Daily_Report", 0);
  initializeMasterReportTemplate(master);
  return master;
}

/**
 * Initializes the entire institutional template on Master_Daily_Report if empty
 */
function initializeMasterReportTemplate(sheet) {
  sheet.clear();

  var pinkBg = "#FCE8E6";   // Soft peach/pink
  var tealBg = "#8EA9DB";   // Soft institutional teal/slate
  var darkText = "#000000";

  // Row 1: Spacer
  sheet.setRowHeight(1, 15);

  // Row 2: College Name Banner
  sheet.getRange(2, 1, 1, 9).merge()
    .setValue("Matrusri Engineering College")
    .setFontWeight("bold")
    .setFontSize(13)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBackground(pinkBg);
  sheet.setRowHeight(2, 30);

  // Row 3: Department Name Banner
  sheet.getRange(3, 1, 1, 9).merge()
    .setValue("Department of Information Technology")
    .setFontWeight("bold")
    .setFontSize(11)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBackground(pinkBg);
  sheet.setRowHeight(3, 25);

  // Row 4: Column Headers (Section A)
  var headers = ["SNO", "Date", "Name of the Faculty", "Section", "Course Name", "credits", "Class Hour", "Unit No", "Topic Name"];
  sheet.getRange(4, 1, 1, 9)
    .setValues([headers])
    .setFontWeight("bold")
    .setFontSize(10)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBackground(tealBg)
    .setFontColor(darkText);
  sheet.setRowHeight(4, 28);

  // Set column widths
  sheet.setColumnWidth(1, 55);  // SNO
  sheet.setColumnWidth(2, 85);  // Date
  sheet.setColumnWidth(3, 180); // Name of the Faculty
  sheet.setColumnWidth(4, 85);  // Section
  sheet.setColumnWidth(5, 170); // Course Name
  sheet.setColumnWidth(6, 65);  // credits
  sheet.setColumnWidth(7, 95);  // Class Hour
  sheet.setColumnWidth(8, 85);  // Unit No
  sheet.setColumnWidth(9, 380); // Topic Name

  var curRow = 5;

  // Insert section headers with placeholder rows
  for (var i = 0; i < SECTION_ORDER.length; i++) {
    var secName = SECTION_ORDER[i];

    // If switching to Section B, repeat column header bar
    if (secName === "III SEM IT B CLASS REPORT") {
      sheet.getRange(curRow, 1, 1, 9).setValues([headers])
        .setFontWeight("bold")
        .setFontSize(10)
        .setHorizontalAlignment("center")
        .setVerticalAlignment("middle")
        .setBackground(tealBg)
        .setFontColor(darkText);
      sheet.setRowHeight(curRow, 28);
      curRow++;
    }

    // Section Title Banner
    sheet.getRange(curRow, 1, 1, 9).merge()
      .setValue(secName)
      .setFontWeight("bold")
      .setFontSize(10)
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle")
      .setBackground(pinkBg);
    sheet.setRowHeight(curRow, 24);
    curRow++;
  }
}

/**
 * Upserts submitted duty rows into Master_Daily_Report under their appropriate section blocks.
 * If same-day entries exist for that Faculty + Date + Slot, updates them in-place.
 */
function upsertMasterReportRows(sheet, displayDate, dateIso, facultyName, logs) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 4) {
    initializeMasterReportTemplate(sheet);
    lastRow = sheet.getLastRow();
  }

  // Scan all rows to identify section boundaries and existing faculty entries
  var numRows = sheet.getLastRow();
  var col1Values = sheet.getRange(1, 1, numRows, 1).getValues();
  var col2Values = sheet.getRange(1, 2, numRows, 1).getValues();
  var col3Values = sheet.getRange(1, 3, numRows, 1).getValues();
  var col7Values = sheet.getRange(1, 7, numRows, 1).getValues();

  var updatedCount = 0;

  for (var i = 0; i < logs.length; i++) {
    var item = logs[i];
    var cleanSlot = (item.slot || ("P" + (i + 1))).trim();
    var cleanCourse = (item.courseName || item.course || "-").trim();
    var cleanSection = (item.section || "-").trim();
    var cleanCredits = (item.credits || "3").toString().trim();
    var cleanUnit = (item.unitNo || item.unit || "-").toString().trim();
    var cleanTopic = sanitizeTopicContent(item.topicName || item.activity || "");

    var targetSection = determineSectionCategory(cleanSection, cleanCourse, cleanSlot);

    // Find section banner row
    var sectionHeaderRow = -1;
    var nextSectionRow = -1;

    for (var r = 1; r <= numRows; r++) {
      var cellVal = (col1Values[r - 1][0] || "").toString().trim();
      if (cellVal === targetSection) {
        sectionHeaderRow = r;
        break;
      }
    }

    // If section banner not found, create it at bottom
    if (sectionHeaderRow === -1) {
      sectionHeaderRow = sheet.getLastRow() + 1;
      sheet.getRange(sectionHeaderRow, 1, 1, 9).merge()
        .setValue(targetSection)
        .setFontWeight("bold")
        .setFontSize(10)
        .setHorizontalAlignment("center")
        .setVerticalAlignment("middle")
        .setBackground("#FCE8E6");
      sheet.setRowHeight(sectionHeaderRow, 24);
      numRows = sectionHeaderRow;
    }

    // Find next section boundary
    for (var n = sectionHeaderRow + 1; n <= numRows; n++) {
      var checkVal = (col1Values[n - 1][0] || "").toString().trim();
      var checkHeader = (col1Values[n - 1][0] || "").toString().toUpperCase();
      if (checkHeader === "SNO" || SECTION_ORDER.indexOf(checkVal) !== -1) {
        nextSectionRow = n;
        break;
      }
    }
    if (nextSectionRow === -1) {
      nextSectionRow = numRows + 1;
    }

    // Check if matching row already exists within this section (Same-Day Upsert)
    var existingRowIdx = -1;
    for (var scan = sectionHeaderRow + 1; scan < nextSectionRow; scan++) {
      var rowDate = (col2Values[scan - 1][0] || "").toString().trim();
      var rowFaculty = (col3Values[scan - 1][0] || "").toString().trim().toLowerCase();
      var rowSlot = (col7Values[scan - 1][0] || "").toString().trim().toLowerCase();

      var isDateMatch = (rowDate === displayDate || rowDate === dateIso);
      var isFacultyMatch = (rowFaculty === facultyName.toLowerCase());
      var isSlotMatch = (rowSlot === cleanSlot.toLowerCase());

      if (isDateMatch && isFacultyMatch && isSlotMatch) {
        existingRowIdx = scan;
        break;
      }
    }

    var rowValues = [
      1, // Temporary SNO, re-indexed below
      displayDate,
      facultyName,
      cleanSection,
      cleanCourse,
      cleanCredits,
      cleanSlot,
      cleanUnit,
      cleanTopic
    ];

    if (existingRowIdx !== -1) {
      // UPDATE in place (preserve SNO)
      var oldSno = sheet.getRange(existingRowIdx, 1).getValue() || 1;
      rowValues[0] = oldSno;
      sheet.getRange(existingRowIdx, 1, 1, 9).setValues([rowValues]);
      updatedCount++;
    } else {
      // INSERT new row right before next section boundary
      sheet.insertRowBefore(nextSectionRow);
      sheet.getRange(nextSectionRow, 1, 1, 9).setValues([rowValues])
        .setFontSize(10)
        .setVerticalAlignment("middle")
        .setHorizontalAlignment("left");
      sheet.getRange(nextSectionRow, 1, 1, 2).setHorizontalAlignment("center");
      sheet.getRange(nextSectionRow, 4, 1, 1).setHorizontalAlignment("center");
      sheet.getRange(nextSectionRow, 6, 1, 3).setHorizontalAlignment("center");
      sheet.setRowHeight(nextSectionRow, 22);

      // Refresh cached arrays for next slot in loop
      numRows = sheet.getLastRow();
      col1Values = sheet.getRange(1, 1, numRows, 1).getValues();
      col2Values = sheet.getRange(1, 2, numRows, 1).getValues();
      col3Values = sheet.getRange(1, 3, numRows, 1).getValues();
      col7Values = sheet.getRange(1, 7, numRows, 1).getValues();
      updatedCount++;
    }

    // Re-index SNO sequentially (1, 2, 3...) for this section
    reindexSectionSno(sheet, targetSection);
  }

  return updatedCount;
}

/**
 * Re-indexes S.No sequentially (1, 2, 3...) for a given section block in Master_Daily_Report
 */
function reindexSectionSno(sheet, sectionName) {
  var numRows = sheet.getLastRow();
  var col1Values = sheet.getRange(1, 1, numRows, 1).getValues();

  var startRow = -1;
  var endRow = -1;

  for (var r = 1; r <= numRows; r++) {
    if ((col1Values[r - 1][0] || "").toString().trim() === sectionName) {
      startRow = r + 1;
      break;
    }
  }

  if (startRow === -1) return;

  for (var e = startRow; e <= numRows; e++) {
    var val = (col1Values[e - 1][0] || "").toString().trim();
    if (SECTION_ORDER.indexOf(val) !== -1 || val.toUpperCase() === "SNO") {
      endRow = e - 1;
      break;
    }
  }
  if (endRow === -1) endRow = numRows;

  var sno = 1;
  for (var row = startRow; row <= endRow; row++) {
    var checkDate = sheet.getRange(row, 2).getValue();
    if (checkDate) {
      sheet.getRange(row, 1).setValue(sno).setHorizontalAlignment("center");
      sno++;
    }
  }
}

/**
 * =========================================================================================
 * 2. INDIVIDUAL FACULTY TAB LOGIC (SAME-DAY UPSERT)
 * =========================================================================================
 */

function getOrCreateFacultySheet(ss, facultyName) {
  var cleanTitle = (facultyName || "General Staff").toString().replace(/[:\\\\/?*\\[\\]']/g, "").trim().substring(0, 95);
  var sheet = ss.getSheetByName(cleanTitle);
  if (sheet) return sheet;

  // Normalized search
  var targetKey = cleanTitle.toLowerCase().replace(/\\s+/g, "");
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName().toLowerCase().replace(/\\s+/g, "") === targetKey) {
      return sheets[i];
    }
  }

  var newSheet = ss.insertSheet(cleanTitle);
  initializeFacultyTabHeaders(newSheet, facultyName);
  return newSheet;
}

/**
 * Initializes clean institutional headers on an individual faculty member's tab
 */
function initializeFacultyTabHeaders(sheet, facultyName) {
  sheet.clear();

  var pinkBg = "#FCE8E6";
  var tealBg = "#8EA9DB";

  // Row 1: Spacer
  sheet.setRowHeight(1, 12);

  // Row 2: College Name Banner
  sheet.getRange(2, 1, 1, 9).merge()
    .setValue("Matrusri Engineering College")
    .setFontWeight("bold")
    .setFontSize(12)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBackground(pinkBg);
  sheet.setRowHeight(2, 28);

  // Row 3: Department & Faculty Banner
  sheet.getRange(3, 1, 1, 9).merge()
    .setValue("Department of Information Technology - Activity Log: " + facultyName)
    .setFontWeight("bold")
    .setFontSize(10)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBackground(pinkBg);
  sheet.setRowHeight(3, 24);

  // Row 4: Column Headers
  var headers = ["SNO", "Date", "Class Hour", "Section", "Course Name", "credits", "Unit No", "Topic Name / Activity Covered", "Status"];
  sheet.getRange(4, 1, 1, 9)
    .setValues([headers])
    .setFontWeight("bold")
    .setFontSize(10)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBackground(tealBg);
  sheet.setRowHeight(4, 28);

  // Set widths
  sheet.setColumnWidth(1, 55);  // SNO
  sheet.setColumnWidth(2, 90);  // Date
  sheet.setColumnWidth(3, 90);  // Class Hour
  sheet.setColumnWidth(4, 85);  // Section
  sheet.setColumnWidth(5, 170); // Course Name
  sheet.setColumnWidth(6, 65);  // credits
  sheet.setColumnWidth(7, 85);  // Unit No
  sheet.setColumnWidth(8, 380); // Topic Name
  sheet.setColumnWidth(9, 100); // Status

  sheet.setFrozenRows(4);
}

/**
 * Upserts daily logs into the faculty's personal tab:
 * If entries for this date already exist, replaces them in-place with the latest submission.
 */
function upsertFacultyTabRows(sheet, displayDate, dateIso, facultyName, logs) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 4) {
    initializeFacultyTabHeaders(sheet, facultyName);
    lastRow = sheet.getLastRow();
  }

  var numRows = sheet.getLastRow();
  var dateValues = sheet.getRange(1, 2, numRows, 1).getValues();

  // Find range of existing rows for this date
  var firstDateRow = -1;
  var lastDateRow = -1;

  for (var r = 5; r <= numRows; r++) {
    var d = (dateValues[r - 1][0] || "").toString().trim();
    if (d === displayDate || d === dateIso) {
      if (firstDateRow === -1) firstDateRow = r;
      lastDateRow = r;
    }
  }

  // If old rows exist for this date, delete them to insert the fresh, updated set cleanly
  if (firstDateRow !== -1 && lastDateRow !== -1) {
    var countToDelete = lastDateRow - firstDateRow + 1;
    sheet.deleteRows(firstDateRow, countToDelete);
  }

  // Calculate insertion start row
  var insertStartRow = firstDateRow !== -1 ? firstDateRow : sheet.getLastRow() + 1;
  var rowsToInsert = [];

  for (var i = 0; i < logs.length; i++) {
    var item = logs[i];
    var cleanSlot = (item.slot || ("P" + (i + 1))).trim();
    var cleanCourse = (item.courseName || item.course || "-").trim();
    var cleanSection = (item.section || "-").trim();
    var cleanCredits = (item.credits || "3").toString().trim();
    var cleanUnit = (item.unitNo || item.unit || "-").toString().trim();
    var cleanTopic = sanitizeTopicContent(item.topicName || item.activity || "");

    rowsToInsert.push([
      i + 1, // SNO restarts per date block or continues sequentially
      displayDate,
      cleanSlot,
      cleanSection,
      cleanCourse,
      cleanCredits,
      cleanUnit,
      cleanTopic,
      "Submitted"
    ]);
  }

  if (rowsToInsert.length > 0) {
    if (firstDateRow !== -1) {
      sheet.insertRowsBefore(insertStartRow, rowsToInsert.length);
    }
    var targetRange = sheet.getRange(insertStartRow, 1, rowsToInsert.length, 9);
    targetRange.setValues(rowsToInsert)
      .setFontSize(10)
      .setVerticalAlignment("middle");
    sheet.getRange(insertStartRow, 1, rowsToInsert.length, 2).setHorizontalAlignment("center");
    sheet.getRange(insertStartRow, 3, rowsToInsert.length, 2).setHorizontalAlignment("center");
    sheet.getRange(insertStartRow, 6, rowsToInsert.length, 2).setHorizontalAlignment("center");
    sheet.getRange(insertStartRow, 9, rowsToInsert.length, 1).setHorizontalAlignment("center");

    for (var k = 0; k < rowsToInsert.length; k++) {
      sheet.setRowHeight(insertStartRow + k, 22);
    }
  }

  // Re-index all S.No across the faculty tab
  var finalRows = sheet.getLastRow();
  var snoCount = 1;
  for (var f = 5; f <= finalRows; f++) {
    var hasEntry = sheet.getRange(f, 2).getValue();
    if (hasEntry) {
      sheet.getRange(f, 1).setValue(snoCount).setHorizontalAlignment("center");
      snoCount++;
    }
  }

  return rowsToInsert.length;
}

function doGet(e) {
  return createJsonResponse({
    status: "active",
    message: "Faculty Activity Tracker Google Sheets Endpoint is running with Institutional Sectional Master Layout & Same-Day Upsert.",
    activeSpreadsheet: SpreadsheetApp.getActiveSpreadsheet().getName()
  });
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
