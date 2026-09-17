import { GoogleSheetsPayload } from '../types';

export const SPREADSHEET_ID_STORAGE_KEY = 'it_dept_google_spreadsheet_id';
export const SPREADSHEET_TITLE_STORAGE_KEY = 'it_dept_google_spreadsheet_title';

export interface SpreadsheetInfo {
  spreadsheetId: string;
  title: string;
  sheets: {
    sheetId: number;
    title: string;
  }[];
  spreadsheetUrl: string;
}

/**
 * Executes a fetch request with automatic exponential backoff retry for HTTP 429 (Rate Limit / Quota Exceeded)
 * and transient server errors (500, 503).
 */
export async function fetchSheetsWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 4,
  baseDelayMs = 2000
): Promise<Response> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const response = await fetch(url, options);

      // Handle 429 Rate Limit Exceeded
      if (response.status === 429 || response.status === 503) {
        attempt++;
        if (attempt >= maxRetries) {
          return response;
        }

        const retryAfterHeader = response.headers.get('Retry-After');
        const retryAfterSeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 0;
        const delay = retryAfterSeconds > 0
          ? retryAfterSeconds * 1000
          : baseDelayMs * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 800);

        console.warn(
          `[GoogleSheets API] Rate limit (HTTP ${response.status}) hit. Backing off for ${Math.round(
            delay
          )}ms (Attempt ${attempt}/${maxRetries})...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      return response;
    } catch (networkErr) {
      attempt++;
      if (attempt >= maxRetries) {
        throw networkErr;
      }
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return fetch(url, options);
}

/**
 * Parses either a full Google Sheets URL or a raw Spreadsheet ID.
 */
export function extractSpreadsheetId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // Match /spreadsheets/d/([a-zA-Z0-9-_]+)
  const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }

  // If already looks like a valid spreadsheet ID (alphanumeric, dashes, underscores, length >= 20)
  if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

export function getStoredSpreadsheetId(): string {
  try {
    const fromStorage = localStorage.getItem(SPREADSHEET_ID_STORAGE_KEY);
    if (fromStorage && fromStorage.trim()) {
      return fromStorage.trim();
    }
    const fromEnv = (import.meta.env.VITE_SPREADSHEET_ID || '') as string;
    if (fromEnv && fromEnv.trim()) {
      return fromEnv.trim();
    }
    return '1A5y47v00hJahMnb8NKQDbXIVlSeXvH5vDS0g9mWwreI';
  } catch {
    return '1A5y47v00hJahMnb8NKQDbXIVlSeXvH5vDS0g9mWwreI';
  }
}

export function setStoredSpreadsheetId(id: string, title?: string): void {
  try {
    if (id) {
      localStorage.setItem(SPREADSHEET_ID_STORAGE_KEY, id.trim());
      if (title) {
        localStorage.setItem(SPREADSHEET_TITLE_STORAGE_KEY, title.trim());
      }
    } else {
      localStorage.removeItem(SPREADSHEET_ID_STORAGE_KEY);
      localStorage.removeItem(SPREADSHEET_TITLE_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to write spreadsheet ID to localStorage', e);
  }
}

export function getStoredSpreadsheetTitle(): string {
  try {
    return localStorage.getItem(SPREADSHEET_TITLE_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function formatA1Range(sheetTitle: string, cellRange?: string): string {
  // Strip single quotes to prevent A1 notation quote parsing conflicts
  const clean = sheetTitle.replace(/'/g, '').trim();
  const rangePart = cellRange ? `!${cellRange}` : '!A1:J';
  return encodeURIComponent(`'${clean}'${rangePart}`);
}

/**
 * Fetch metadata for an existing Google Sheet with retry
 */
export async function fetchSpreadsheetMetadata(
  accessToken: string,
  spreadsheetId: string
): Promise<SpreadsheetInfo> {
  const response = await fetchSheetsWithRetry(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=spreadsheetId,properties.title,sheets.properties(sheetId,title)`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    let msg = `Failed to access spreadsheet (HTTP ${response.status})`;
    try {
      const parsed = JSON.parse(errorBody);
      if (parsed.error?.message) {
        msg = parsed.error.message;
      }
    } catch {
      // Keep generic msg
    }
    throw new Error(msg);
  }

  const data = await response.json();
  const sheets = (data.sheets || []).map(
    (s: { properties: { sheetId: number; title: string } }) => ({
      sheetId: s.properties.sheetId,
      title: s.properties.title,
    })
  );

  return {
    spreadsheetId: data.spreadsheetId,
    title: data.properties?.title || 'Untitled Spreadsheet',
    sheets,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
  };
}

/**
 * Standard faculty activity tab headers
 */
export const FACULTY_TAB_HEADERS = [
  'Timestamp',
  'Date',
  'Day of Week',
  'Period Slot',
  'Course Name',
  'Section',
  'Credits',
  'Unit No',
  'Topic / Activity',
  'Submission Status',
];

/**
 * Creates a brand new Google Sheet in the user's Google Drive titled "IT Dept - Faculty Daily Activity Register"
 */
export async function createNewActivitySpreadsheet(
  accessToken: string,
  customTitle?: string
): Promise<SpreadsheetInfo> {
  const title =
    customTitle || `IT Dept - Faculty Daily Activity Register (${new Date().getFullYear()})`;

  const response = await fetchSheetsWithRetry('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: 'Overview & Index',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to create spreadsheet: ${errorBody}`);
  }

  const data = await response.json();

  // Add initial welcome header to Overview sheet
  try {
    const rangeUrl = `https://sheets.googleapis.com/v4/spreadsheets/${data.spreadsheetId}/values/${formatA1Range(
      'Overview & Index',
      'A1:D1'
    )}?valueInputOption=USER_ENTERED`;
    await fetchSheetsWithRetry(rangeUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [
          [
            'IT Dept Daily Activity Register',
            'Created by Employee Activity Tracker',
            'Each faculty member receives their own dedicated tab',
            new Date().toISOString(),
          ],
        ],
      }),
    });
  } catch (e) {
    console.warn('Overview sheet header init note:', e);
  }

  return {
    spreadsheetId: data.spreadsheetId,
    title: data.properties?.title || title,
    sheets: [{ sheetId: 0, title: 'Overview & Index' }],
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
  };
}

/**
 * Ensures that a dedicated tab exists for the faculty member.
 * If missing, creates the tab, adds frozen header row, and sets column styles.
 * Uses fetchSheetsWithRetry to safely respect rate limits.
 */
export async function ensureFacultyTabExists(
  accessToken: string,
  spreadsheetId: string,
  facultyName: string
): Promise<{
  created: boolean;
  tabName: string;
  tabId: number;
  tabUrl: string;
}> {
  const cleanTabName =
    facultyName.replace(/[:\\/?*\[\]']/g, '').trim().substring(0, 95) || 'Staff Activity';

  const meta = await fetchSpreadsheetMetadata(accessToken, spreadsheetId);
  const existingTab = meta.sheets.find(
    (s) => s.title.toLowerCase().trim() === cleanTabName.toLowerCase().trim()
  );

  let targetSheetId: number;
  let created = false;

  if (!existingTab) {
    // 1. Create the tab
    const addSheetResponse = await fetchSheetsWithRetry(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              addSheet: {
                properties: {
                  title: cleanTabName,
                  gridProperties: {
                    frozenRowCount: 1,
                  },
                },
              },
            },
          ],
        }),
      }
    );

    if (!addSheetResponse.ok) {
      const errText = await addSheetResponse.text();
      if (errText.includes('already exists')) {
        const reMeta = await fetchSpreadsheetMetadata(accessToken, spreadsheetId);
        const found = reMeta.sheets.find(
          (s) => s.title.toLowerCase().trim() === cleanTabName.toLowerCase().trim()
        );
        targetSheetId = found?.sheetId ?? 0;
      } else {
        throw new Error(`Failed to create sheet tab for ${cleanTabName}: ${errText}`);
      }
    } else {
      created = true;
      const addSheetData = await addSheetResponse.json();
      targetSheetId =
        addSheetData.replies?.[0]?.addSheet?.properties?.sheetId ?? Math.floor(Math.random() * 10000);

      // 2. Write headers
      const putHeaderUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${formatA1Range(
        cleanTabName,
        'A1:J1'
      )}?valueInputOption=USER_ENTERED`;

      await fetchSheetsWithRetry(putHeaderUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: [FACULTY_TAB_HEADERS] }),
      });

      // 3. Format header styling and width (non-blocking)
      try {
        await fetchSheetsWithRetry(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              requests: [
                {
                  repeatCell: {
                    range: {
                      sheetId: targetSheetId,
                      startRowIndex: 0,
                      endRowIndex: 1,
                      startColumnIndex: 0,
                      endColumnIndex: 10,
                    },
                    cell: {
                      userEnteredFormat: {
                        backgroundColor: { red: 0.058, green: 0.09, blue: 0.165 },
                        textFormat: {
                          foregroundColor: { red: 1, green: 1, blue: 1 },
                          bold: true,
                          fontSize: 10,
                        },
                        horizontalAlignment: 'CENTER',
                        verticalAlignment: 'MIDDLE',
                      },
                    },
                    fields:
                      'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
                  },
                },
                {
                  updateDimensionProperties: {
                    range: {
                      sheetId: targetSheetId,
                      dimension: 'COLUMNS',
                      startIndex: 8,
                      endIndex: 9,
                    },
                    properties: { pixelSize: 380 },
                    fields: 'pixelSize',
                  },
                },
              ],
            }),
          }
        );
      } catch {
        // Non-blocking
      }
    }
  } else {
    targetSheetId = existingTab.sheetId;
  }

  const tabUrl = `${meta.spreadsheetUrl}#gid=${targetSheetId}`;

  return {
    created,
    tabName: cleanTabName,
    tabId: targetSheetId,
    tabUrl,
  };
}

/**
 * Efficiently batches the creation of tabs for all faculty members in the department.
 * Uses batchUpdate and values:batchUpdate to minimize API write requests down to 2-3 calls total,
 * preventing HTTP 429 Quota Exceeded errors.
 */
export async function initializeAllFacultyTabsInSheet(
  accessToken: string,
  spreadsheetId: string,
  facultyList: string[]
): Promise<{
  createdTabs: string[];
  existingTabs: string[];
  spreadsheetUrl: string;
}> {
  const meta = await fetchSpreadsheetMetadata(accessToken, spreadsheetId);
  const existingMap = new Map<string, number>();
  for (const s of meta.sheets) {
    existingMap.set(s.title.toLowerCase().trim(), s.sheetId);
  }

  const alreadyExistingTabs: string[] = [];
  const missingTabs: string[] = [];

  for (const name of facultyList) {
    const clean = name.replace(/[:\\/?*\[\]']/g, '').trim().substring(0, 95);
    if (!clean) continue;

    if (existingMap.has(clean.toLowerCase())) {
      alreadyExistingTabs.push(clean);
    } else {
      missingTabs.push(clean);
    }
  }

  // If all tabs already exist, no writes needed!
  if (missingTabs.length === 0) {
    return {
      createdTabs: [],
      existingTabs: alreadyExistingTabs,
      spreadsheetUrl: meta.spreadsheetUrl,
    };
  }

  console.log(`[GoogleSheets] Batch-creating ${missingTabs.length} missing faculty tabs...`);

  // Step 1: Batch-create all missing sheets in a SINGLE API call
  const addSheetRequests = missingTabs.map((title) => ({
    addSheet: {
      properties: {
        title,
        gridProperties: {
          frozenRowCount: 1,
        },
      },
    },
  }));

  const addBatchRes = await fetchSheetsWithRetry(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests: addSheetRequests }),
    }
  );

  const createdTabs: string[] = [];
  const createdSheetIds: number[] = [];

  if (addBatchRes.ok) {
    const addBatchData = await addBatchRes.json();
    const replies = addBatchData.replies || [];
    for (let i = 0; i < replies.length; i++) {
      const sheetProps = replies[i]?.addSheet?.properties;
      if (sheetProps) {
        createdTabs.push(sheetProps.title);
        createdSheetIds.push(sheetProps.sheetId);
      }
    }
  } else {
    // If batch creation failed (e.g. some tabs exist), fallback to individual check
    const errText = await addBatchRes.text();
    console.warn('[GoogleSheets] Batch tab creation notice:', errText);
    for (const name of missingTabs) {
      try {
        const res = await ensureFacultyTabExists(accessToken, spreadsheetId, name);
        if (res.created) createdTabs.push(name);
      } catch (e) {
        console.warn(`Fallback tab creation error for ${name}:`, e);
      }
    }
    return {
      createdTabs,
      existingTabs: alreadyExistingTabs,
      spreadsheetUrl: meta.spreadsheetUrl,
    };
  }

  // Step 2: Write headers to ALL newly created sheets in a SINGLE values:batchUpdate call
  if (createdTabs.length > 0) {
    try {
      const batchValuesData = createdTabs.map((tabName) => ({
        range: `${formatA1Range(tabName, 'A1:J1')}`,
        values: [FACULTY_TAB_HEADERS],
      }));

      await fetchSheetsWithRetry(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            valueInputOption: 'USER_ENTERED',
            data: batchValuesData,
          }),
        }
      );
    } catch (headerBatchErr) {
      console.warn('Batch header write note:', headerBatchErr);
    }
  }

  // Step 3: Format headers for all newly created tabs in a SINGLE batchUpdate call
  if (createdSheetIds.length > 0) {
    try {
      const stylingRequests = createdSheetIds.flatMap((sheetId) => [
        {
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: 10,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.058, green: 0.09, blue: 0.165 },
                textFormat: {
                  foregroundColor: { red: 1, green: 1, blue: 1 },
                  bold: true,
                  fontSize: 10,
                },
                horizontalAlignment: 'CENTER',
                verticalAlignment: 'MIDDLE',
              },
            },
            fields:
              'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
          },
        },
        {
          updateDimensionProperties: {
            range: {
              sheetId,
              dimension: 'COLUMNS',
              startIndex: 8,
              endIndex: 9,
            },
            properties: { pixelSize: 380 },
            fields: 'pixelSize',
          },
        },
      ]);

      await fetchSheetsWithRetry(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ requests: stylingRequests }),
        }
      );
    } catch (styleBatchErr) {
      console.warn('Batch style note:', styleBatchErr);
    }
  }

  return {
    createdTabs,
    existingTabs: alreadyExistingTabs,
    spreadsheetUrl: meta.spreadsheetUrl,
  };
}

/**
 * Direct Google Sheets API sync:
 * 1. Checks if a tab for facultyName exists; creates it if missing.
 * 2. Appends duty log rows using fetchSheetsWithRetry.
 * 3. Appends to Grand_Daily_Report with rate limit safeguards.
 */
export async function syncFacultyLogsDirectToGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  payload: GoogleSheetsPayload
): Promise<{
  success: boolean;
  message: string;
  tabName: string;
  rowsAdded: number;
  spreadsheetUrl: string;
  updatedRange?: string;
}> {
  const cleanTabName =
    payload.facultyName.replace(/[:\\/?*\[\]']/g, '').trim().substring(0, 95) || 'Staff Activity';

  // 1. Ensure faculty tab exists
  const tabInfo = await ensureFacultyTabExists(accessToken, spreadsheetId, cleanTabName);

  // 2. Format duty rows for this single day
  const dateObj = new Date(payload.date + 'T00:00:00');
  const dayOfWeek = isNaN(dateObj.getTime())
    ? 'Weekday'
    : dateObj.toLocaleDateString('en-US', { weekday: 'long' });

  if (payload.logs.length === 0) {
    return {
      success: true,
      message: `No active duty slots to append for ${cleanTabName}.`,
      tabName: cleanTabName,
      rowsAdded: 0,
      spreadsheetUrl: tabInfo.tabUrl,
    };
  }

  // 3. FACULTY PERSONAL TAB: Create or update a distinct, easily distinguishable table for every single day
  let updatedRange = `${cleanTabName}!A1:I`;

  try {
    // Read existing content on faculty tab to inspect date tables
    const existingCheckUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${formatA1Range(
      cleanTabName,
      'A:I'
    )}`;
    const existingRes = await fetchSheetsWithRetry(existingCheckUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const existingRows: string[][] = existingRes.ok
      ? ((await existingRes.json()).values as string[][]) || []
      : [];

    // Format this day's distinct table block:
    // 1. Top visual border
    // 2. High-visibility Date banner with day of week & faculty name
    // 3. Sub-border
    // 4. Clear uppercase column headers
    // 5..N. Data rows
    // N+1. Clean closing divider
    // N+2. Empty spacer row
    const dayBorder = '═══════════════════════════════════════════════════════════════════════════════════';
    const dayBanner = `📅 DATE: ${payload.date} (${dayOfWeek.toUpperCase()}) — FACULTY ACTIVITY REPORT: ${cleanTabName.toUpperCase()}`;
    const dayDivider = `────────────────── End of Daily Activity Report for ${payload.date} (${payload.logs.length} Slots Logged) ──────────────────`;

    const dayHeaders = [
      'SNO',
      'Date',
      'Class Hour / Slot',
      'Section',
      'Course Name',
      'Credits',
      'Unit No',
      'Topic Name / Activity Covered',
      'Status',
    ];

    // Build incoming duty rows mapped by slot
    const incomingSlotsMap: Record<string, typeof payload.logs[0]> = {};
    payload.logs.forEach((item) => {
      const slotKey = (item.slot || '').trim().toLowerCase();
      incomingSlotsMap[slotKey] = item;
    });

    // Locate existing date table if present
    let bannerRowIdx = -1; // 0-based
    let endRowIdx = -1;    // 0-based

    for (let r = 0; r < existingRows.length; r++) {
      const cellA = (existingRows[r]?.[0] || '').toString();
      if (cellA.includes(payload.date) && (cellA.includes('DATE:') || cellA.includes('REPORT'))) {
        bannerRowIdx = r;
        // Find end of this day's section (next banner or end divider or next date)
        for (let k = r + 1; k < existingRows.length; k++) {
          const nextCellA = (existingRows[k]?.[0] || '').toString();
          if (nextCellA.includes('End of Daily Activity Report') || nextCellA.includes('End of Report')) {
            endRowIdx = k + 1; // include divider
            break;
          }
          if (nextCellA.includes('DATE:') && nextCellA.includes('REPORT')) {
            endRowIdx = k - 1;
            break;
          }
        }
        if (endRowIdx === -1) endRowIdx = existingRows.length - 1;
        break;
      }
    }

    // Prepare final duty rows for this day (merging existing slots so no entered slot is ever lost)
    const finalDutyRows: (string | number)[][] = [];

    payload.logs.forEach((item, idx) => {
      finalDutyRows.push([
        idx + 1,
        payload.date,
        item.slot,
        item.section || '',
        item.courseName || '',
        item.credits || '',
        item.unitNo || '',
        item.topicName || item.activity || '',
        'Submitted',
      ]);
    });

    const newDayTable: (string | number)[][] = [
      [dayBorder, '', '', '', '', '', '', '', ''],
      [dayBanner, '', '', '', '', '', '', '', ''],
      [dayBorder, '', '', '', '', '', '', '', ''],
      dayHeaders,
      ...finalDutyRows,
      [dayDivider, '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', ''],
    ];

    let fullFacultyRows: (string | number)[][] = [];

    if (bannerRowIdx === -1) {
      // Append new day table cleanly at the end of existing rows
      fullFacultyRows = [...existingRows];
      if (fullFacultyRows.length > 0) {
        // Ensure separation from previous day
        fullFacultyRows.push(['', '', '', '', '', '', '', '', '']);
      }
      fullFacultyRows.push(...newDayTable);
    } else {
      // Replace existing day section in-place, preserving other days before and after
      const topSection = existingRows.slice(0, Math.max(0, bannerRowIdx - 1)); // keep before top border
      const bottomSection = existingRows.slice(endRowIdx + 1);
      fullFacultyRows = [...topSection, ...newDayTable, ...bottomSection];
    }

    // Write full updated faculty tab content
    const writeUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${formatA1Range(
      cleanTabName,
      `A1:I${fullFacultyRows.length}`
    )}?valueInputOption=USER_ENTERED`;

    await fetchSheetsWithRetry(writeUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: `'${cleanTabName}'!A1:I${fullFacultyRows.length}`,
        majorDimension: 'ROWS',
        values: fullFacultyRows,
      }),
    });

    updatedRange = `'${cleanTabName}'!A1:I${fullFacultyRows.length}`;
  } catch (facultyErr) {
    console.warn('[GoogleSheets] Faculty personal tab write note:', facultyErr);
  }

  // 4. GRAND DAILY REPORT SHEET: Create or update distinct table for every single day
  let grandTabName = 'Grand_Daily_Report';
  try {
    const meta = await fetchSpreadsheetMetadata(accessToken, spreadsheetId).catch(() => null);
    if (meta && meta.sheets) {
      const foundMaster = meta.sheets.find((s) => {
        const normalized = s.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        return normalized === 'granddailyreport' || normalized === 'masterdailyreport';
      });
      if (foundMaster) {
        grandTabName = foundMaster.title;
      }
    }

    // Read all existing rows on Grand Daily Report
    let existingGrandRows: string[][] = [];
    try {
      const grandCheckRes = await fetchSheetsWithRetry(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${formatA1Range(
          grandTabName,
          'A:I'
        )}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (grandCheckRes.ok) {
        existingGrandRows = ((await grandCheckRes.json()).values as string[][]) || [];
      }
    } catch {
      existingGrandRows = [];
    }

    const grandBorder = '🏛️═════════════════════════════════════════════════════════════════════════════════';
    const grandBanner = `📅 DEPARTMENT OF INFORMATION TECHNOLOGY — GRAND DAILY REPORT | Date: ${payload.date} (${dayOfWeek.toUpperCase()})`;
    const grandDivider = `────────────────── End of Grand Daily Register for ${payload.date} ──────────────────`;

    const grandHeaders = [
      'SNO',
      'Date',
      'Name of the Faculty',
      'Section',
      'Course Name',
      'Credits',
      'Class Hour / Slot',
      'Unit No',
      'Topic Name / Duty Details',
    ];

    // Find if a section for payload.date already exists in Grand Daily Report
    let grandDateBannerIdx = -1; // 0-based
    let grandDateEndIdx = -1;    // 0-based

    for (let r = 0; r < existingGrandRows.length; r++) {
      const cellA = (existingGrandRows[r]?.[0] || '').toString();
      if (cellA.includes('GRAND DAILY REPORT') && cellA.includes(payload.date)) {
        grandDateBannerIdx = r;
        for (let k = r + 1; k < existingGrandRows.length; k++) {
          const nextCellA = (existingGrandRows[k]?.[0] || '').toString();
          if (nextCellA.includes('End of Grand Daily Register')) {
            grandDateEndIdx = k + 1;
            break;
          }
          if (nextCellA.includes('GRAND DAILY REPORT')) {
            grandDateEndIdx = k - 1;
            break;
          }
        }
        if (grandDateEndIdx === -1) grandDateEndIdx = existingGrandRows.length - 1;
        break;
      }
    }

    // Extract all rows for this date, preserving other faculty members' entries
    const otherFacultyRows: (string | number)[][] = [];

    if (grandDateBannerIdx !== -1) {
      for (let r = grandDateBannerIdx + 2; r <= grandDateEndIdx; r++) {
        const row = existingGrandRows[r];
        if (!row || row.length === 0) continue;
        const cellA = (row[0] || '').toString();
        const facultyInRow = (row[2] || '').toString().trim();
        // Skip headers, dividers, borders
        if (cellA.includes('SNO') || cellA.includes('════') || cellA.includes('──────') || !facultyInRow) {
          continue;
        }
        // If it belongs to a different faculty, KEEP IT 100%!
        if (facultyInRow.toLowerCase() !== payload.facultyName.toLowerCase()) {
          otherFacultyRows.push(row);
        }
      }
    }

    // Build this faculty's rows
    const thisFacultyRows: (string | number)[][] = payload.logs.map((item) => [
      0, // SNO will be assigned sequentially
      payload.date,
      payload.facultyName,
      item.section || 'III A',
      item.courseName || 'Course',
      item.credits || '3',
      item.slot,
      item.unitNo || '1',
      item.topicName || item.activity || '',
    ]);

    // Combine all faculty rows for this date and re-index SNO sequentially 1..N
    const allDateRows = [...otherFacultyRows, ...thisFacultyRows];
    allDateRows.forEach((row, i) => {
      row[0] = i + 1;
    });

    const grandDayTable: (string | number)[][] = [
      [grandBorder, '', '', '', '', '', '', '', ''],
      [grandBanner, '', '', '', '', '', '', '', ''],
      [grandBorder, '', '', '', '', '', '', '', ''],
      grandHeaders,
      ...allDateRows,
      [grandDivider, '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', ''],
    ];

    let fullGrandRows: (string | number)[][] = [];

    if (grandDateBannerIdx === -1) {
      // Brand new date table appended to Grand Daily Report
      fullGrandRows = [...existingGrandRows];
      if (fullGrandRows.length > 0) {
        fullGrandRows.push(['', '', '', '', '', '', '', '', '']);
      }
      fullGrandRows.push(...grandDayTable);
    } else {
      // Replace existing date block in-place, preserving other days before and after
      const topSection = existingGrandRows.slice(0, Math.max(0, grandDateBannerIdx - 1));
      const bottomSection = existingGrandRows.slice(grandDateEndIdx + 1);
      fullGrandRows = [...topSection, ...grandDayTable, ...bottomSection];
    }

    const grandWriteUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${formatA1Range(
      grandTabName,
      `A1:I${fullGrandRows.length}`
    )}?valueInputOption=USER_ENTERED`;

    const grandPutRes = await fetchSheetsWithRetry(grandWriteUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: `'${grandTabName}'!A1:I${fullGrandRows.length}`,
        majorDimension: 'ROWS',
        values: fullGrandRows,
      }),
    });

    // If tab doesn't exist yet, create and write
    if (!grandPutRes.ok && (grandPutRes.status === 400 || grandPutRes.status === 404)) {
      await fetchSheetsWithRetry(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                addSheet: {
                  properties: {
                    title: grandTabName,
                    index: 0,
                  },
                },
              },
            ],
          }),
        }
      );

      await fetchSheetsWithRetry(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${formatA1Range(
          grandTabName,
          `A1:I${fullGrandRows.length}`
        )}?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            range: `'${grandTabName}'!A1:I${fullGrandRows.length}`,
            majorDimension: 'ROWS',
            values: fullGrandRows,
          }),
        }
      );
    }
  } catch (grandErr) {
    console.warn('Non-blocking note on Grand Daily Report sync:', grandErr);
  }

  return {
    success: true,
    message: `Successfully synchronized ${payload.logs.length} activities to "${cleanTabName}" (${updatedRange}) & ${grandTabName}!`,
    tabName: cleanTabName,
    rowsAdded: payload.logs.length,
    spreadsheetUrl: tabInfo.tabUrl,
    updatedRange,
  };
}
