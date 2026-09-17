/**
 * HoD / Admin Authentication & Access Control System
 *
 * Enforces strict email authorization for the Department Head (HoD) Dashboard
 * and administrative configuration portal via Firebase Authentication (without database).
 *
 * Strict 3-Role Whitelist:
 * 1. HoD: hodit@matrusri.edu.in
 * 2. Dev: abhiramravula7@gmail.com
 * 3. AHoD: Configurable slot initialized/updated by HoD (stored in browser localStorage)
 */

export const PRIMARY_HOD_EMAIL = 'hodit@matrusri.edu.in';
export const ADMIN_EMAIL_2 = 'abhiramravula7@gmail.com';
export const DEV_ADMIN_EMAIL = 'abhiramravula7@gmail.com';
export const DEFAULT_AHOD_EMAIL = 'ahodit@matrusri.edu.in';

export const HOD_AUTH_EMAIL_KEY = 'matrusri_it_hod_auth_email_v1';
export const HOD_ADDITIONAL_EMAIL_KEY = 'matrusri_it_hod_additional_admin_email_v1';

export type AdminRole = 'HoD' | 'Dev' | 'AHoD';

/**
 * Retrieves the configurable AHoD (3rd slot) administrator email from localStorage.
 */
export function getAdditionalAdminEmail(): string {
  try {
    const stored = localStorage.getItem(HOD_ADDITIONAL_EMAIL_KEY);
    if (stored !== null && stored.trim()) {
      return stored.trim();
    }
    const fromEnv = (import.meta.env.VITE_AHOD_EMAIL || '') as string;
    if (fromEnv && fromEnv.trim()) {
      return fromEnv.trim();
    }
    return DEFAULT_AHOD_EMAIL;
  } catch {
    return DEFAULT_AHOD_EMAIL;
  }
}

export const getAhodEmail = getAdditionalAdminEmail;

/**
 * Updates the configurable AHoD administrator email slot in localStorage.
 */
export function setAdditionalAdminEmail(email: string): void {
  try {
    const trimmed = email.trim();
    if (trimmed) {
      localStorage.setItem(HOD_ADDITIONAL_EMAIL_KEY, trimmed);
    } else {
      localStorage.removeItem(HOD_ADDITIONAL_EMAIL_KEY);
    }
  } catch (e) {
    console.error('Failed to persist AHoD admin email:', e);
  }
}

export const setAhodEmail = setAdditionalAdminEmail;

/**
 * Returns the current list of authorized administrator emails with roles.
 */
export function getAuthorizedAdminEmails(): {
  email: string;
  role: AdminRole;
  label: string;
  locked: boolean;
}[] {
  const ahod = getAdditionalAdminEmail();
  return [
    {
      email: PRIMARY_HOD_EMAIL,
      role: 'HoD',
      label: 'Head of Department (HoD) Official Account',
      locked: true,
    },
    {
      email: DEV_ADMIN_EMAIL,
      role: 'Dev',
      label: 'Systems & Software Developer (Dev)',
      locked: true,
    },
    {
      email: ahod || '(Unconfigured / Open AHoD Slot)',
      role: 'AHoD',
      label: 'Assistant Head of Department (AHoD - Configurable by HoD)',
      locked: false,
    },
  ];
}

/**
 * Returns the administrative role for a given email, or null if unauthorized.
 */
export function getAdminRole(email: string): AdminRole | null {
  if (!email || !email.trim()) return null;
  const clean = email.trim().toLowerCase();

  if (clean === PRIMARY_HOD_EMAIL.toLowerCase()) return 'HoD';
  if (clean === DEV_ADMIN_EMAIL.toLowerCase()) return 'Dev';

  const ahod = getAdditionalAdminEmail().trim().toLowerCase();
  if (ahod && clean === ahod) return 'AHoD';

  return null;
}

/**
 * Verifies if an email address is authorized for HoD Dashboard access.
 */
export function isEmailAuthorized(email: string): boolean {
  return getAdminRole(email) !== null;
}

/**
 * Retrieves the currently authenticated HoD/Admin email from storage.
 * If the stored email is no longer authorized, it returns null.
 */
export function getStoredHodAuthEmail(): string | null {
  try {
    const saved = localStorage.getItem(HOD_AUTH_EMAIL_KEY);
    if (saved && isEmailAuthorized(saved)) {
      return saved.trim();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Persists or clears the active HoD authentication session.
 */
export function setStoredHodAuthEmail(email: string | null): void {
  try {
    if (email && isEmailAuthorized(email)) {
      localStorage.setItem(HOD_AUTH_EMAIL_KEY, email.trim());
    } else {
      localStorage.removeItem(HOD_AUTH_EMAIL_KEY);
    }
  } catch (e) {
    console.error('Failed to save HoD session email:', e);
  }
}
