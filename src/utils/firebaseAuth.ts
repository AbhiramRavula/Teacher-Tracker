import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Google Workspace Scopes
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

// Flag to indicate if we are in the middle of a sign-in flow
let isSigningIn = false;
// Cache the access token in memory with sessionStorage fallback for page refreshes
const TOKEN_SESSION_KEY = 'matrusri_it_oauth_token_v1';
let cachedAccessToken: string | null = null;

// Initialize auth state listener. Call this on app load.
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      const activeToken = cachedAccessToken || (await getAccessToken());
      if (activeToken) {
        cachedAccessToken = activeToken;
        if (onAuthSuccess) onAuthSuccess(user, activeToken);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      setCachedAccessToken(null);
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Must be called from a button click or user interaction
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google Sign-In');
    }

    setCachedAccessToken(credential.accessToken);
    return { user: result.user, accessToken: credential.accessToken };
  } catch (error: unknown) {
    console.error('Google Sign-In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  if (cachedAccessToken) return cachedAccessToken;
  try {
    const sessionToken = sessionStorage.getItem(TOKEN_SESSION_KEY);
    if (sessionToken) {
      cachedAccessToken = sessionToken;
      return sessionToken;
    }
  } catch {
    // Ignore storage issues
  }
  return null;
};

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
  try {
    if (token) {
      sessionStorage.setItem(TOKEN_SESSION_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_SESSION_KEY);
    }
  } catch {
    // Ignore storage issues
  }
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
  setCachedAccessToken(null);
};
