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
};

/**
 * Retrieve stored Google Apps Script Web App URL from localStorage
 */
export function getStoredSheetsUrl(): string {
  try {
    return localStorage.getItem(GOOGLE_SHEETS_URL_STORAGE_KEY) || '';
  } catch (e) {
    console.error('Failed to read Google Sheets URL from localStorage:', e);
    return '';
  }
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
 * Build the exact payload required by the Google Sheets integration:
 * {
 *   "facultyName": "Mrs. Stvsav Ramya",
 *   "date": "2026-09-09",
 *   "logs": [
 *     { "slot": "09:40 AM - 10:40 AM", "activity": "Covered Operating Systems process scheduling" },
 *     { "slot": "10:40 AM - 11:40 AM", "activity": "Conducted OS Lab batch evaluations" }
 *   ]
 * }
 */
export function buildSheetsPayload(
  facultyName: string,
  date: string,
  activities: Record<string, string>,
  role: Role
): GoogleSheetsPayload {
  const logs: GoogleSheetsLogItem[] = [];

  BASE_TIME_SLOTS.forEach((slot) => {
    // Exclude lunch break and empty slots
    if (slot.isLunchBreak) return;

    const activityText = activities[slot.id];
    if (activityText && activityText.trim().length > 0) {
      logs.push({
        slot: getSlotTimeLabel(slot, role),
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
}> {
  const token = directTokenOverride || (await getAccessToken());
  const spreadsheetId = getStoredSpreadsheetId();
  const scriptUrl = getStoredSheetsUrl();

  // Method 1: Direct Google Sheets API (preferred if token + spreadsheetId are available)
  if (token && spreadsheetId) {
    try {
      const result = await syncFacultyLogsDirectToGoogleSheet(token, spreadsheetId, payload);
      return {
        success: true,
        message: result.message,
        spreadsheetUrl: result.spreadsheetUrl,
        tabName: result.tabName,
        method: 'direct_api',
      };
    } catch (apiError: unknown) {
      const errorMsg = apiError instanceof Error ? apiError.message : String(apiError);
      console.warn('Direct Google Sheets API sync had an issue, checking fallback:', errorMsg);
      // If error indicates auth expired or not found, report clearly
      return {
        success: false,
        message: `Google Sheets API: ${errorMsg}`,
        method: 'direct_api',
      };
    }
  }

  // Method 2: Google Apps Script Web App POST
  if (scriptUrl && scriptUrl.trim()) {
    const appsScriptResult = await submitLogToGoogleSheets(scriptUrl, payload);
    return {
      success: appsScriptResult.success,
      message: appsScriptResult.message,
      method: 'apps_script',
    };
  }

  // Neither is configured
  return {
    success: false,
    message:
      'Google Sheets is not connected yet. Click "Connect Sheet" to sign in with Google or enter your spreadsheet link.',
    method: 'none',
  };
}

/**
 * Send POST request to Google Apps Script Web App URL.
 */
export async function submitLogToGoogleSheets(
  scriptUrl: string,
  payload: GoogleSheetsPayload
): Promise<{ success: boolean; message: string; details?: unknown }> {
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
        'This is a Google Sheet document link, not an Apps Script /exec URL. Use the "Direct Google Sign-In" option for plain Google Sheet URLs!',
    };
  }

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
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Failed to connect to Google Sheets Web App: ${errorMsg}`,
      details: err,
    };
  }
}

/**
 * Export logs to CSV file formatted for Excel with per-faculty grouping
 */
export function exportLogsToExcelCsv(logs: ActivityLog[], filename?: string): void {
  if (!logs || logs.length === 0) return;

  const headers = [
    'Log ID',
    'Faculty / Staff Name',
    'Role',
    'Date',
    'Department',
    'Time Slot',
    'Duty & Activity Log',
    'HoD Status',
    'HoD Remarks',
    'Saved At',
  ];

  const csvRows: string[][] = [headers];

  logs.forEach((item) => {
    Object.entries(item.activities).forEach(([slotId, text]) => {
      if (!text || text.trim().length === 0 || slotId === 'slot_lunch') return;

      const slotObj = BASE_TIME_SLOTS.find((s) => s.id === slotId);
      const slotLabel = slotObj ? getSlotTimeLabel(slotObj, item.role) : slotId;

      csvRows.push([
        item.id,
        item.employeeName,
        item.role,
        item.date,
        item.department,
        slotLabel,
        text.replace(/\r?\n|\r/g, ' '),
        item.hodStatus || 'Under Review',
        (item.hodRemarks || '').replace(/\r?\n|\r/g, ' '),
        item.savedAt,
      ]);
    });
  });

  const csvContent =
    'data:text/csv;charset=utf-8,\uFEFF' +
    csvRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', filename || `IT_Dept_Faculty_Activity_Register_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Ready-to-deploy Google Apps Script Code snippet for the user to copy directly into their Google Sheet
 */
export const SAMPLE_APPS_SCRIPT_CODE = `/**
 * Google Apps Script - Faculty Daily Activity Tracker
 *
 * Automatically creates a dedicated tab (sheet) for each faculty member
 * and appends their daily activities with styled headers and formatting.
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
  try {
    lock.waitLock(30000);

    var rawData = e.postData ? e.postData.contents : "";
    if (!rawData) {
      return createJsonResponse({ status: "error", message: "Empty request payload received" });
    }

    var data = JSON.parse(rawData);
    var facultyName = (data.facultyName || "General Staff").trim();
    var date = data.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
    var logs = data.logs || [];

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // Clean sheet tab name
    var safeTabName = facultyName.replace(/[:\\/?*\\[\\]]/g, "").trim().substring(0, 95);
    var sheet = ss.getSheetByName(safeTabName);

    // If tab doesn't exist for this faculty, create it and add formatted headers
    if (!sheet) {
      sheet = ss.insertSheet(safeTabName);

      var headers = [
        "Timestamp",
        "Date",
        "Day of Week",
        "Time Slot",
        "Duty / Activity / Topics Covered",
        "Submission Status",
        "Device / Channel"
      ];

      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setValues([headers]);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#0F172A"); // Slate 900
      headerRange.setFontColor("#FFFFFF");
      headerRange.setHorizontalAlignment("center");
      headerRange.setVerticalAlignment("middle");
      sheet.setRowHeight(1, 35);

      // Set column widths
      sheet.setColumnWidth(1, 175);
      sheet.setColumnWidth(2, 110);
      sheet.setColumnWidth(3, 110);
      sheet.setColumnWidth(4, 185);
      sheet.setColumnWidth(5, 450);
      sheet.setColumnWidth(6, 140);
      sheet.setColumnWidth(7, 160);

      sheet.setFrozenRows(1);
    }

    var now = new Date();
    var dayOfWeek = Utilities.formatDate(new Date(date + "T00:00:00"), Session.getScriptTimeZone(), "EEEE");

    var rowsToAdd = [];
    for (var i = 0; i < logs.length; i++) {
      var item = logs[i];
      rowsToAdd.push([
        Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss"),
        date,
        dayOfWeek,
        item.slot || "Duty Slot",
        item.activity || "",
        "Submitted",
        "Mobile Activity Tracker"
      ]);
    }

    if (rowsToAdd.length > 0) {
      var startRow = sheet.getLastRow() + 1;
      var dataRange = sheet.getRange(startRow, 1, rowsToAdd.length, rowsToAdd[0].length);
      dataRange.setValues(rowsToAdd);
      dataRange.setVerticalAlignment("middle");
      dataRange.setWrap(true);
    }

    return createJsonResponse({
      status: "success",
      message: "Successfully registered " + logs.length + " activities for " + facultyName + " on tab '" + safeTabName + "'",
      faculty: facultyName,
      sheetTab: safeTabName,
      rowsAdded: rowsToAdd.length
    });

  } catch (err) {
    return createJsonResponse({
      status: "error",
      message: err.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return createJsonResponse({
    status: "active",
    message: "Faculty Activity Tracker Google Sheets Endpoint is running.",
    activeSpreadsheet: SpreadsheetApp.getActiveSpreadsheet().getName()
  });
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
