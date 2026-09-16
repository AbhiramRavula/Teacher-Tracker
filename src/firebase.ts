/**
 * Firebase Authentication & Firestore Configuration & Helpers
 *
 * Configured for admin login verification, Google Sheets OAuth scopes,
 * and persistent departmental settings in Firestore.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { setCachedAccessToken } from './utils/firebaseAuth';

// Initialize Firebase App instance safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firebase Firestore with designated database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

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

