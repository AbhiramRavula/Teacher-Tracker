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

  const now = new Date();
  const timestampStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(
    2,
    '0'
  )}:${String(now.getSeconds()).padStart(2, '0')}`;

  // 3. FACULTY PERSONAL TAB: Strictly APPEND new rows to the bottom (Zero Data Loss)
  const facultyRowsToAppend: (string | number)[][] = payload.logs.map((item, idx) => [
    timestampStr,
    payload.date,
    dayOfWeek,
    (item.slot || `P${idx + 1}`).trim(),
    (item.courseName || '').trim(),
    (item.section || '').trim(),
    (item.credits || '').toString().trim(),
    (item.unitNo || '').toString().trim(),
    (item.topicName || item.activity || '').trim(),
    'Submitted',
  ]);

  try {
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${formatA1Range(
      cleanTabName,
      'A:J'
    )}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    await fetchSheetsWithRetry(appendUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: facultyRowsToAppend,
      }),
    });
  } catch (facultyErr) {
    console.warn('[GoogleSheets] Faculty personal tab append note:', facultyErr);
  }

  // 4. MASTER DAILY REPORT SHEET: Strictly APPEND new rows to the bottom (Zero Data Loss)
  let grandTabName = 'Master_Daily_Report';
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

    // Read current row count to calculate sequential S.No
    let currentLastRow = 3;
    try {
      const grandCheckRes = await fetchSheetsWithRetry(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${formatA1Range(
          grandTabName,
          'A:A'
        )}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (grandCheckRes.ok) {
        const rows = ((await grandCheckRes.json()).values as string[][]) || [];
        currentLastRow = Math.max(3, rows.length);
      }
    } catch {
      currentLastRow = 3;
    }

    const startSno = Math.max(1, currentLastRow - 2);

    const masterRowsToAppend: (string | number)[][] = payload.logs.map((item, idx) => [
      startSno + idx,
      timestampStr,
      payload.date,
      payload.facultyName,
      (item.section || '').trim(),
      (item.courseName || '').trim(),
      (item.credits || '3').toString().trim(),
      (item.slot || `P${idx + 1}`).trim(),
      (item.unitNo || '').toString().trim(),
      (item.topicName || item.activity || '').trim(),
    ]);
    const grandAppendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${formatA1Range(
      grandTabName,
      'A:J'
    )}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    await fetchSheetsWithRetry(grandAppendUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: masterRowsToAppend,
      }),
    });
  } catch (grandErr) {
    console.warn('[GoogleSheets] Master Daily Report append note:', grandErr);
  }

  return {
    success: true,
    message: `Successfully appended ${payload.logs.length} activities for ${payload.facultyName} on tab "${cleanTabName}" and Master_Daily_Report (Append-Only)!`,
    tabName: cleanTabName,
    rowsAdded: payload.logs.length,
    spreadsheetUrl: tabInfo.tabUrl,
  };
}

