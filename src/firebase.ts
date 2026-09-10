/**
 * Firebase Authentication Configuration & Helpers
 *
 * Configured STRICTLY for admin login verification and Google Sign-In.
 * NO Firebase Firestore or external database is used.
 * Data persistence is handled via Google Apps Script Web App / Google Sheets.
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
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App instance safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication strictly (NO FIRESTORE / NO EXTERNAL DATABASE)
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Signs in a user using Firebase Authentication with Google Popup.
 */
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
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
