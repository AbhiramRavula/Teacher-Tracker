import { doc, getDoc, setDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { ActivityLog } from '../types';
import { setStoredSpreadsheetId, setStoredSheetsUrl } from './googleSheets';

export interface DepartmentSettings {
  spreadsheetId?: string;
  spreadsheetTitle?: string;
  sheetsWebAppUrl?: string;
  additionalAdminEmail?: string;
  updatedAt?: string;
  updatedBy?: string;
}

const SETTINGS_DOC_PATH = 'settings/department';

/**
 * Persists departmental Google Sheets and integration configuration to Firestore.
 */
export async function saveDepartmentSettings(
  settings: Partial<DepartmentSettings>,
  updatedBy?: string
): Promise<void> {
  try {
    const settingsDocRef = doc(db, 'settings', 'department');
    const payload: DepartmentSettings = {
      ...settings,
      updatedAt: new Date().toISOString(),
      updatedBy: updatedBy || 'Admin',
    };
    await setDoc(settingsDocRef, payload, { merge: true });

    // Also mirror to local storage
    if (settings.spreadsheetId) {
      setStoredSpreadsheetId(settings.spreadsheetId, settings.spreadsheetTitle);
    }
    if (settings.sheetsWebAppUrl) {
      setStoredSheetsUrl(settings.sheetsWebAppUrl);
    }
  } catch (error) {
    console.warn('Could not persist settings to Firestore (using localStorage fallback):', error);
  }
}

/**
 * Fetches departmental settings from Firestore and syncs them to localStorage.
 */
export async function fetchDepartmentSettings(): Promise<DepartmentSettings | null> {
  try {
    const settingsDocRef = doc(db, 'settings', 'department');
    const snapshot = await getDoc(settingsDocRef);
    if (snapshot.exists()) {
      const data = snapshot.data() as DepartmentSettings;
      if (data.spreadsheetId) {
        setStoredSpreadsheetId(data.spreadsheetId, data.spreadsheetTitle);
      }
      if (data.sheetsWebAppUrl) {
        setStoredSheetsUrl(data.sheetsWebAppUrl);
      }
      return data;
    }
  } catch (error) {
    console.warn('Could not fetch settings from Firestore:', error);
  }
  return null;
}

/**
 * Saves a submitted activity log to Firestore (/activity_logs/{log.id})
 */
export async function saveActivityLogToFirestore(log: ActivityLog): Promise<boolean> {
  try {
    const logDocRef = doc(db, 'activity_logs', log.id);
    await setDoc(logDocRef, {
      ...log,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.warn('Could not save log to Firestore (saved locally):', error);
    return false;
  }
}

/**
 * Fetches recent activity logs from Firestore.
 */
export async function fetchActivityLogsFromFirestore(): Promise<ActivityLog[]> {
  try {
    const logsCol = collection(db, 'activity_logs');
    const q = query(logsCol, orderBy('date', 'desc'), limit(100));
    const querySnapshot = await getDocs(q);
    const logs: ActivityLog[] = [];
    querySnapshot.forEach((docSnap) => {
      logs.push(docSnap.data() as ActivityLog);
    });
    return logs;
  } catch (error) {
    console.warn('Could not fetch logs from Firestore:', error);
    return [];
  }
}
