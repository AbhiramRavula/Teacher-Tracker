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
        message: `Log dispatched to Google Sheet for tab "${payload.facultyName}"! (If rows do not appear, redeploy Apps Script with "Who has access: Anyone")`,
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

    var now = new Date();
    var dayOfWeek = Utilities.formatDate(new Date(date + "T00:00:00"), Session.getScriptTimeZone(), "EEEE");

    var rowsToAdd = [];
    var masterRowsToAdd = [];

    for (var i = 0; i < logs.length; i++) {
      var item = logs[i];
      var slotCode = item.slot || "P" + (i + 1);
      var course = item.courseName || item.course || "";
      var section = item.section || "";
      var credits = item.credits || "";
      var unitNo = item.unitNo || item.unit || "";
      var topic = item.topicName || item.activity || "";

      // Faculty tab row
      rowsToAdd.push([
        Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss"),
        date,
        dayOfWeek,
        slotCode,
        course,
        section,
        credits,
        unitNo,
        topic,
        "Submitted"
      ]);

      // Consolidated Master_Daily_Report row
      masterRowsToAdd.push([
        Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss"),
        facultyName,
        date,
        dayOfWeek,
        slotCode,
        course,
        section,
        credits,
        unitNo,
        topic,
        "Submitted"
      ]);
    }

    if (rowsToAdd.length > 0) {
      var startRow = sheet.getLastRow() + 1;
      var dataRange = sheet.getRange(startRow, 1, rowsToAdd.length, rowsToAdd[0].length);
      dataRange.setValues(rowsToAdd);
      dataRange.setVerticalAlignment("middle");
      dataRange.setWrap(true);

      // Append to Master_Daily_Report
      var masterSheet = ss.getSheetByName("Master_Daily_Report");
      if (!masterSheet) {
        masterSheet = ss.insertSheet("Master_Daily_Report", 0);
        var mHeaders = [
          "Timestamp",
          "Faculty Name",
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
        var mHeaderRange = masterSheet.getRange(1, 1, 1, mHeaders.length);
        mHeaderRange.setValues([mHeaders]);
        mHeaderRange.setFontWeight("bold");
        mHeaderRange.setBackground("#1E3A8A"); // Blue 900
        mHeaderRange.setFontColor("#FFFFFF");
        mHeaderRange.setHorizontalAlignment("center");
        masterSheet.setRowHeight(1, 35);
        masterSheet.setFrozenRows(1);
      }
      var mStartRow = masterSheet.getLastRow() + 1;
      var mRange = masterSheet.getRange(mStartRow, 1, masterRowsToAdd.length, masterRowsToAdd[0].length);
      mRange.setValues(masterRowsToAdd);
      mRange.setVerticalAlignment("middle");
      mRange.setWrap(true);
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
