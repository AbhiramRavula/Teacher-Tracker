/**
 * Firebase Authentication Module
 *
 * Configured strictly for admin verification (Google Sign-In)
 * without any Firestore or external database.
 */

export {
  auth,
  googleProvider,
  signInWithGoogle,
  signOutCurrentUser,
  subscribeToAuth,
  getCurrentUser,
} from './firebase.ts';
