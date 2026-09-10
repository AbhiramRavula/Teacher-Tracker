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
 * Parses either a full Google Sheets URL or a raw Spreadsheet ID.
 * Examples:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
 */
export function extractSpreadsheetId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // Match /spreadsheets/d/([a-zA-Z0-9-_]+)
  const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }

  // If already looks like a valid spreadsheet ID (alphanumeric, dashes, underscores, length >= 25)
  if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

export function getStoredSpreadsheetId(): string {
  try {
    return localStorage.getItem(SPREADSHEET_ID_STORAGE_KEY) || '';
  } catch {
    return '';
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

/**
 * Fetch metadata for an existing Google Sheet
 */
export async function fetchSpreadsheetMetadata(
  accessToken: string,
  spreadsheetId: string
): Promise<SpreadsheetInfo> {
  const response = await fetch(
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
  const sheets = (data.sheets || []).map((s: { properties: { sheetId: number; title: string } }) => ({
    sheetId: s.properties.sheetId,
    title: s.properties.title,
  }));

  return {
    spreadsheetId: data.spreadsheetId,
    title: data.properties?.title || 'Untitled Spreadsheet',
    sheets,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
  };
}

/**
 * Creates a brand new Google Sheet in the user's Google Drive titled "IT Dept - Faculty Daily Activity Register"
 */
export async function createNewActivitySpreadsheet(
  accessToken: string,
  customTitle?: string
): Promise<SpreadsheetInfo> {
  const title =
    customTitle || `IT Dept - Faculty Daily Activity Register (${new Date().getFullYear()})`;

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
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
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${data.spreadsheetId}/values/Overview%20%26%20Index!A1:D1?valueInputOption=USER_ENTERED`,
      {
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
      }
    );
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
 * Direct Google Sheets API sync:
 * 1. Checks if a tab for facultyName exists in the plain or active Google Sheet.
 * 2. If not, creates the tab and styles the header row.
 * 3. Appends all logs from payload.
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
}> {
  const cleanTabName =
    payload.facultyName.replace(/[:\\/?*\[\]]/g, '').trim().substring(0, 95) || 'Staff Activity';

  // 1. Fetch existing tabs in spreadsheet
  const meta = await fetchSpreadsheetMetadata(accessToken, spreadsheetId);
  const existingTab = meta.sheets.find(
    (s) => s.title.toLowerCase().trim() === cleanTabName.toLowerCase().trim()
  );

  let targetSheetId: number;

  if (!existingTab) {
    // 2. Create the tab for this faculty member
    const addSheetResponse = await fetch(
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
      throw new Error(`Failed to create sheet tab for ${cleanTabName}: ${errText}`);
    }

    const addSheetData = await addSheetResponse.json();
    targetSheetId =
      addSheetData.replies?.[0]?.addSheet?.properties?.sheetId ?? Math.floor(Math.random() * 10000);

    // 3. Write and format header row on new tab
    const headers = [
      'Timestamp',
      'Date',
      'Day of Week',
      'Time Slot',
      'Duty / Activity / Topics Covered',
      'Submission Status',
      'Source Device',
    ];

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(
        cleanTabName
      )}'!A1:G1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [headers],
        }),
      }
    );

    // Format header row style (Slate 900 background #0F172A, bold white text, column widths)
    try {
      await fetch(
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
                    endColumnIndex: 7,
                  },
                  cell: {
                    userEnteredFormat: {
                      backgroundColor: { red: 0.058, green: 0.09, blue: 0.165 }, // Slate 900
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
                    startIndex: 4, // Activity column
                    endIndex: 5,
                  },
                  properties: {
                    pixelSize: 420,
                  },
                  fields: 'pixelSize',
                },
              },
            ],
          }),
        }
      );
    } catch (styleErr) {
      console.warn('Non-blocking header styling note:', styleErr);
    }
  } else {
    targetSheetId = existingTab.sheetId;
  }

  // 4. Format rows to append
  const now = new Date();
  const dateObj = new Date(payload.date + 'T00:00:00');
  const dayOfWeek = isNaN(dateObj.getTime())
    ? 'Weekday'
    : dateObj.toLocaleDateString('en-US', { weekday: 'long' });

  const rowsToAppend = payload.logs.map((item) => [
    now.toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'medium' }),
    payload.date,
    dayOfWeek,
    item.slot,
    item.activity,
    'Submitted',
    'Mobile Activity Tracker',
  ]);

  if (rowsToAppend.length === 0) {
    return {
      success: true,
      message: `No active duty slots to append for ${cleanTabName}.`,
      tabName: cleanTabName,
      rowsAdded: 0,
      spreadsheetUrl: meta.spreadsheetUrl,
    };
  }

  // 5. Append rows to the faculty tab
  const appendResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(
      cleanTabName
    )}'!A:G:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rowsToAppend,
      }),
    }
  );

  if (!appendResponse.ok) {
    const errText = await appendResponse.text();
    throw new Error(`Failed to append logs to sheet: ${errText}`);
  }

  const directUrl = `${meta.spreadsheetUrl}#gid=${targetSheetId}`;

  return {
    success: true,
    message: `Successfully registered ${rowsToAppend.length} activities in tab "${cleanTabName}"!`,
    tabName: cleanTabName,
    rowsAdded: rowsToAppend.length,
    spreadsheetUrl: directUrl,
  };
}
