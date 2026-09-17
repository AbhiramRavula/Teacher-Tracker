/**
 * Firebase Authentication & Firestore Configuration & Helpers
 *
 * Configured for admin login verification, Google Sheets OAuth scopes,
 * and persistent departmental settings in Firestore.
 */

import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import fallbackFirebaseConfig from '../firebase-applet-config.json';
import { setCachedAccessToken } from './utils/firebaseAuth';

// Priority 1: Vercel / Vite environment variables (prefixed with VITE_FIREBASE_*)
// Priority 2: Injected fallback firebase-applet-config.json for preview & dev container
export const resolvedFirebaseConfig: Record<string, string> = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY || fallbackFirebaseConfig.apiKey || '').trim(),
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || fallbackFirebaseConfig.authDomain || '').trim(),
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID || fallbackFirebaseConfig.projectId || '').trim(),
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || fallbackFirebaseConfig.storageBucket || '').trim(),
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || fallbackFirebaseConfig.messagingSenderId || '').trim(),
  appId: (import.meta.env.VITE_FIREBASE_APP_ID || fallbackFirebaseConfig.appId || '').trim(),
  measurementId: (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || fallbackFirebaseConfig.measurementId || '').trim(),
  firestoreDatabaseId: (
    import.meta.env.VITE_FIREBASE_DATABASE_ID ||
    import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID ||
    fallbackFirebaseConfig.firestoreDatabaseId ||
    ''
  ).trim(),
  oAuthClientId: (import.meta.env.VITE_FIREBASE_OAUTH_CLIENT_ID || fallbackFirebaseConfig.oAuthClientId || '').trim(),
};

// Initialize Firebase App instance safely
export const app = getApps().length > 0 ? getApp() : initializeApp(resolvedFirebaseConfig as FirebaseOptions);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firebase Firestore with designated database ID if provided
export const db = resolvedFirebaseConfig.firestoreDatabaseId
  ? getFirestore(app, resolvedFirebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
// Request Google Workspace Sheets & Drive scopes for direct live sync
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Signs in a user using Firebase Authentication with Google Popup
 * and captures the OAuth accessToken for Google Sheets API v4.
 */
export async function signInWithGoogle(): Promise<{ user: User; accessToken?: string } | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;
    if (accessToken) {
      setCachedAccessToken(accessToken);
    }
    return { user: result.user, accessToken };
  } catch (error) {
    console.error('Firebase Google Sign-In failed:', error);
    throw error;
  }
}

/**
 * Signs out the current user from Firebase Authentication immediately.
 */
export async function signOutCurrentUser(): Promise<void> {
  try {
    await signOut(auth);
    setCachedAccessToken(null);
  } catch (error) {
    console.error('Firebase Sign-Out error:', error);
  }
}

/**
 * Subscribes to Firebase Authentication state changes.
 */
export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Retrieves the current authenticated Firebase user if any.
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

