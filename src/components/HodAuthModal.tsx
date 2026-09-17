import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  AlertOctagon,
  X,
  Sparkles,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Loader2,
  UserCheck,
  GraduationCap,
  Terminal,
  Users,
} from 'lucide-react';
import {
  isEmailAuthorized,
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  // Allow closing via Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    try {
      const { user } = await signInWithGoogle();
      if (user && user.email) {
        const clean = user.email.toLowerCase();
        if (isEmailAuthorized(clean)) {
          onSuccessLogin(clean);
        } else {
          // Immediately sign out unauthorized user from Firebase Auth
          await signOutCurrentUser();
          setErrorMessage(
            'Access Denied: This Google account is not recognized as an authorized administrator. Access is strictly restricted to authenticated accounts holding one of the 3 administrative roles.'
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

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-150">
        {/* Header with Matrusri Departmental Branding */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 relative pr-14">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-300 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer shadow-xs"
            title="Close and return to Faculty Tracker"
            aria-label="Close authentication dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/90 border border-blue-400/40 flex items-center justify-center text-white shadow-xs shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Firebase Authentication
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
            The Head of Department (HoD) Dashboard provides departmental activity oversight, staff approvals, and Google Sheets integration setup. Admin access is strictly restricted to the three authorized administrative roles via Google Firebase Authentication.
          </p>

          {/* Access Denied Alert Banner */}
          {errorMessage && (
            <div
              id="hod-access-denied-banner"
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs animate-in fade-in slide-in-from-top-1 duration-150 space-y-2"
            >
              <div className="flex items-center gap-2 font-bold text-rose-800">
                <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Authentication Failed</span>
              </div>
              <p className="text-[11px] text-rose-700 leading-snug">
                {errorMessage}
              </p>
              <div className="text-[10px] text-rose-600 pt-1.5 border-t border-rose-200 flex items-center justify-between">
                <span>Account automatically signed out</span>
                <span className="font-semibold">Security Enforced</span>
              </div>
            </div>
          )}

          {/* Authorized Roles Notice (Emails hidden as requested) */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Roles with Administrative Access</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Only Google accounts officially assigned to one of the following roles are granted entry:
            </p>

            <div className="space-y-1.5 pt-1">
              {/* Role 1: Head of Department */}
              <div className="p-2.5 rounded-lg bg-white border border-slate-200/90 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0 font-bold text-xs">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Head of Department (HoD)</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                      Primary Admin
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    Academic in-charge, logs approval, and master report authorization
                  </div>
                </div>
              </div>

              {/* Role 2: Systems & Software Developer */}
              <div className="p-2.5 rounded-lg bg-white border border-slate-200/90 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 font-bold text-xs">
                  <Terminal className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Systems & Software Developer (Dev)</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Tech Admin
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    Technical maintenance, sync infrastructure, and system configuration
                  </div>
                </div>
              </div>

              {/* Role 3: Assistant Head of Department */}
              <div className="p-2.5 rounded-lg bg-white border border-slate-200/90 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 font-bold text-xs">
                  <Users className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Assistant HoD (AHoD)</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                      Admin Slot
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    Configurable departmental administration and attendance verification
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sole Access Method: Google Firebase Authentication */}
          <div className="pt-2">
            <button
              id="hod-google-login-btn"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full min-h-[50px] rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-md cursor-pointer border border-slate-800 disabled:opacity-60"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  <span>Verifying via Firebase Auth...</span>
                </>
              ) : (
                <>
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
                  </div>
                  <span>Sign in with Google (Firebase Auth)</span>
                </>
              )}
            </button>

            {/* In-body Cancel / Close button for immediate dismissal if opened by mistake */}
            <button
              type="button"
              onClick={onClose}
              className="w-full min-h-[46px] rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-200 mt-2.5 shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Cancel &amp; Return to Faculty Tracker</span>
            </button>

            <p className="text-[11px] text-center text-slate-500 mt-2">
              Sign in using the Google account authorized for your HoD, Dev, or AHoD role.
            </p>
          </div>
        </div>

        {/* Footer with return option */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-semibold inline-flex items-center gap-1.5 cursor-pointer min-h-[44px] px-2 rounded-lg hover:bg-slate-200/50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Staff Portal</span>
          </button>
          <span className="text-[10px] font-semibold text-slate-400">Department of IT</span>
        </div>
      </div>
    </div>
  );
};

