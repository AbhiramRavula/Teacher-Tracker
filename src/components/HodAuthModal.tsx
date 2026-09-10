import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  AlertOctagon,
  ArrowRight,
  X,
  Sparkles,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Loader2,
  UserCheck,
} from 'lucide-react';
import {
  isEmailAuthorized,
  PRIMARY_HOD_EMAIL,
  DEV_ADMIN_EMAIL,
  getAdditionalAdminEmail,
  getAdminRole,
} from '../utils/hodAuth';
import { signInWithGoogle, signOutCurrentUser } from '../firebase';

interface HodAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (email: string) => void;
}

export const HodAuthModal: React.FC<HodAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
}) => {
  const [emailInput, setEmailInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attemptedEmail, setAttemptedEmail] = useState<string>('');
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    try {
      const user = await signInWithGoogle();
      if (user && user.email) {
        const clean = user.email.toLowerCase();
        if (isEmailAuthorized(clean)) {
          onSuccessLogin(clean);
        } else {
          // Immediately sign out unauthorized user from Firebase Auth
          await signOutCurrentUser();
          setAttemptedEmail(user.email);
          setErrorMessage(
            `Access Denied: The account "${user.email}" is not authorized. Access is strictly restricted to HoD (${PRIMARY_HOD_EMAIL}), Dev (${DEV_ADMIN_EMAIL}), and the authorized AHoD.`
          );
        }
      }
    } catch (error) {
      console.error('Google Sign-in failed', error);
      const msg = error instanceof Error ? error.message : 'Google authentication failed.';
      setErrorMessage(msg);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const clean = emailInput.trim().toLowerCase();
    if (!clean) {
      setErrorMessage('Please enter an authorized administrator email address.');
      return;
    }

    if (isEmailAuthorized(clean)) {
      setErrorMessage(null);
      onSuccessLogin(clean);
    } else {
      setAttemptedEmail(emailInput.trim());
      setErrorMessage(
        `Access Denied: "${emailInput.trim()}" is not an authorized administrator. Only HoD, Dev, and AHoD accounts have access.`
      );
    }
  };

  const handleQuickLogin = (email: string) => {
    setEmailInput(email);
    setErrorMessage(null);
    onSuccessLogin(email.toLowerCase());
  };

  const ahodAdminEmail = getAdditionalAdminEmail();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header with Matrusri Departmental Branding */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close and return to Faculty Tracker"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/90 border border-blue-400/40 flex items-center justify-center text-white shadow-xs shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Firebase Auth Restricted
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-1 leading-tight">
                Admin & HoD Verification
              </h2>
              <p className="text-[11px] text-slate-300">
                Department of Information Technology • Matrusri Engineering College
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            The Head of Department (HoD) Dashboard contains confidential staff logs, approval controls, and master sheet synchronizations. Verification is restricted to the 3 authorized administrator roles.
          </p>

          {/* Access Denied Alert Banner */}
          {errorMessage && (
            <div
              id="hod-access-denied-banner"
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs animate-in fade-in slide-in-from-top-1 duration-150 space-y-2"
            >
              <div className="flex items-center gap-2 font-bold text-rose-800">
                <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Access Denied</span>
                {attemptedEmail && (
                  <span className="ml-auto font-mono text-[10px] bg-rose-200/80 px-1.5 py-0.5 rounded text-rose-900 truncate max-w-[150px]">
                    {attemptedEmail}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-rose-700 leading-snug">
                {errorMessage}
              </p>
              <div className="text-[10px] text-rose-600 pt-1.5 border-t border-rose-200 flex items-center justify-between">
                <span>User automatically signed out.</span>
                <span className="font-semibold">Security Enforced</span>
              </div>
            </div>
          )}

          {/* One-Click Google Authentication via Firebase */}
          <div>
            <button
              id="hod-google-login-btn"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full min-h-[44px] rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all border border-slate-300 shadow-xs cursor-pointer hover:border-slate-400 disabled:opacity-60"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  <span>Verifying via Firebase Auth...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign in with Google (Firebase Auth)</span>
                </>
              )}
            </button>
            <div className="relative my-3 flex items-center justify-center">
              <div className="border-t border-slate-200 w-full"></div>
              <span className="bg-white px-2.5 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                Or verify by email address
              </span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label
                htmlFor="hod-admin-email-input"
                className="block text-xs font-bold text-slate-700 mb-1.5"
              >
                Administrator Email ID <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="hod-admin-email-input"
                  type="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="hodit@matrusri.edu.in or abhiramravula7@gmail.com"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 bg-slate-50 hover:bg-slate-50/80 focus:bg-white rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            <button
              id="hod-login-submit-btn"
              type="submit"
              className="w-full min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-blue-200" />
              <span>Verify & Access HoD Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Authorized Accounts Selector */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Authorized Whitelist (3 Roles):
              </span>
              <span className="text-[10px] text-slate-400">Quick select</span>
            </div>

            <div className="space-y-1.5">
              {/* HoD Role */}
              <button
                type="button"
                onClick={() => handleQuickLogin(PRIMARY_HOD_EMAIL)}
                className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-colors flex items-center justify-between gap-2 text-xs group cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800 group-hover:text-blue-900 text-[11px] truncate">
                      {PRIMARY_HOD_EMAIL}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                      HoD
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">Head of Department (Official)</div>
                </div>
                <span className="text-[10px] font-bold text-blue-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                  Select
                </span>
              </button>

              {/* Dev Role */}
              <button
                type="button"
                onClick={() => handleQuickLogin(DEV_ADMIN_EMAIL)}
                className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-colors flex items-center justify-between gap-2 text-xs group cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800 group-hover:text-blue-900 text-[11px] truncate">
                      {DEV_ADMIN_EMAIL}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Dev
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">Systems & Developer Admin</div>
                </div>
                <span className="text-[10px] font-bold text-blue-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                  Select
                </span>
              </button>

              {/* AHoD Role */}
              {ahodAdminEmail && ahodAdminEmail.trim() && (
                <button
                  type="button"
                  onClick={() => handleQuickLogin(ahodAdminEmail)}
                  className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-colors flex items-center justify-between gap-2 text-xs group cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 group-hover:text-blue-900 text-[11px] truncate">
                        {ahodAdminEmail}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                        AHoD
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">Assistant HoD (Configurable)</div>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Select
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer with return option */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Staff Tracker</span>
          </button>
          <span className="text-[10px] text-slate-400">Matrusri IT Dept</span>
        </div>
      </div>
    </div>
  );
};
