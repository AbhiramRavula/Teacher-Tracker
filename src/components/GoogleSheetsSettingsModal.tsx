import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  Send,
  Loader2,
  FileDown,
  Info,
  Layers,
  Sparkles,
  ShieldCheck,
  LogOut,
  RefreshCw,
  PlusCircle,
  Link2,
} from 'lucide-react';
import {
  getStoredSheetsUrl,
  setStoredSheetsUrl,
  SAMPLE_APPS_SCRIPT_CODE,
  exportLogsToExcelCsv,
  extractSpreadsheetId,
  getStoredSpreadsheetId,
  setStoredSpreadsheetId,
  getStoredSpreadsheetTitle,
  fetchSpreadsheetMetadata,
  createNewActivitySpreadsheet,
  submitLogToGoogleSheets,
} from '../utils/googleSheets';
import { syncFacultyLogsDirectToGoogleSheet } from '../utils/googleSheetsApi';
import {
  googleSignIn,
  initAuth,
  logout,
  getAccessToken,
} from '../utils/firebaseAuth';
import { User } from 'firebase/auth';
import { ActivityLog } from '../types';

interface GoogleSheetsSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs?: ActivityLog[];
  onConfigChanged?: () => void;
}

export const GoogleSheetsSettingsModal: React.FC<GoogleSheetsSettingsModalProps> = ({
  isOpen,
  onClose,
  logs = [],
  onConfigChanged,
}) => {
  const [activeTab, setActiveTab] = useState<'direct' | 'script' | 'plainSheetInfo'>('direct');

  // Firebase Auth user & token
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentAccessToken, setCurrentAccessToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Spreadsheet State
  const [spreadsheetInput, setSpreadsheetInput] = useState('');
  const [currentSpreadsheetId, setCurrentSpreadsheetId] = useState('');
  const [currentSpreadsheetTitle, setCurrentSpreadsheetTitle] = useState('');
  const [isVerifyingSheet, setIsVerifyingSheet] = useState(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);

  // Test & Feedback
  const [isTestingWrite, setIsTestingWrite] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    link?: string;
  } | null>(null);

  // Apps Script Web App fallback state
  const [appsScriptUrlInput, setAppsScriptUrlInput] = useState('');
  const [hasCopiedCode, setHasCopiedCode] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Load initial stored values
    const storedId = getStoredSpreadsheetId();
    setCurrentSpreadsheetId(storedId);
    setSpreadsheetInput(
      storedId ? `https://docs.google.com/spreadsheets/d/${storedId}/edit` : ''
    );
    setCurrentSpreadsheetTitle(getStoredSpreadsheetTitle());

    const storedAppsScript = getStoredSheetsUrl();
    setAppsScriptUrlInput(storedAppsScript);

    // Initialize Firebase Auth listener
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setCurrentAccessToken(token);
      },
      () => {
        setCurrentUser(null);
        setCurrentAccessToken(null);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setStatusFeedback(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setCurrentAccessToken(res.accessToken);
        setStatusFeedback({
          type: 'success',
          message: `Signed in as ${res.user.displayName || res.user.email}!`,
        });

        // If spreadsheet ID is already configured, fetch title
        if (currentSpreadsheetId) {
          try {
            const meta = await fetchSpreadsheetMetadata(res.accessToken, currentSpreadsheetId);
            setCurrentSpreadsheetTitle(meta.title);
            setStoredSpreadsheetId(meta.spreadsheetId, meta.title);
          } catch {
            // Ignore background title lookup
          }
        }
      }
    } catch (err: unknown) {
      const errText = err instanceof Error ? err.message : String(err);
      setStatusFeedback({
        type: 'error',
        message: `Sign in failed: ${errText}`,
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    await logout();
    setCurrentUser(null);
    setCurrentAccessToken(null);
    setStatusFeedback({
      type: 'info',
      message: 'Signed out of Google account.',
    });
  };

  // Connect user's existing plain Google Sheet link or ID
  const handleConnectSpreadsheet = async () => {
    const raw = spreadsheetInput.trim();
    if (!raw) {
      setStatusFeedback({
        type: 'error',
        message: 'Please paste your Google Sheet link or ID.',
      });
      return;
    }

    const id = extractSpreadsheetId(raw);
    if (!id) {
      setStatusFeedback({
        type: 'error',
        message:
          'Could not find a valid Google Spreadsheet ID. Please paste a full link like: https://docs.google.com/spreadsheets/d/...',
      });
      return;
    }

    setIsVerifyingSheet(true);
    setStatusFeedback(null);

    try {
      const token = currentAccessToken || (await getAccessToken());
      if (!token) {
        // User not signed in yet
        setStoredSpreadsheetId(id);
        setCurrentSpreadsheetId(id);
        setStatusFeedback({
          type: 'info',
          message:
            'Spreadsheet saved! Please click "Sign in with Google" so the tracker can write activity tabs to it.',
        });
        if (onConfigChanged) onConfigChanged();
        setIsVerifyingSheet(false);
        return;
      }

      // Verify with Google Sheets API
      const meta = await fetchSpreadsheetMetadata(token, id);
      setStoredSpreadsheetId(meta.spreadsheetId, meta.title);
      setCurrentSpreadsheetId(meta.spreadsheetId);
      setCurrentSpreadsheetTitle(meta.title);

      setStatusFeedback({
        type: 'success',
        message: `Connected to "${meta.title}" (${meta.sheets.length} tab(s) found)!`,
        link: meta.spreadsheetUrl,
      });

      if (onConfigChanged) onConfigChanged();
    } catch (err: unknown) {
      const errText = err instanceof Error ? err.message : String(err);
      setStatusFeedback({
        type: 'error',
        message: `Could not connect to this sheet: ${errText}. Please make sure you are signed in with the Google account that has permission to access it.`,
      });
    } finally {
      setIsVerifyingSheet(false);
    }
  };

  // Create a brand new Google Sheet in the user's Drive
  const handleCreateNewSheet = async () => {
    const token = currentAccessToken || (await getAccessToken());
    if (!token) {
      setStatusFeedback({
        type: 'error',
        message: 'Please click "Sign in with Google" first before creating a sheet.',
      });
      return;
    }

    setIsCreatingSheet(true);
    setStatusFeedback(null);

    try {
      const newSheet = await createNewActivitySpreadsheet(token);
      setStoredSpreadsheetId(newSheet.spreadsheetId, newSheet.title);
      setCurrentSpreadsheetId(newSheet.spreadsheetId);
      setCurrentSpreadsheetTitle(newSheet.title);
      setSpreadsheetInput(newSheet.spreadsheetUrl);

      setStatusFeedback({
        type: 'success',
        message: `Created new Google Sheet "${newSheet.title}" in your Google Drive!`,
        link: newSheet.spreadsheetUrl,
      });

      if (onConfigChanged) onConfigChanged();
    } catch (err: unknown) {
      const errText = err instanceof Error ? err.message : String(err);
      setStatusFeedback({
        type: 'error',
        message: `Failed to create Google Sheet: ${errText}`,
      });
    } finally {
      setIsCreatingSheet(false);
    }
  };

  // Send a test write row to prove connection
  const handleSendTestWrite = async () => {
    const token = currentAccessToken || (await getAccessToken());
    if (!token) {
      setStatusFeedback({
        type: 'error',
        message: 'Please sign in with Google to test writing to your sheet.',
      });
      return;
    }

    if (!currentSpreadsheetId) {
      setStatusFeedback({
        type: 'error',
        message: 'Please select or paste your Google Sheet link first.',
      });
      return;
    }

    setIsTestingWrite(true);
    setStatusFeedback(null);

    try {
      const testFaculty = currentUser?.displayName || 'Test Faculty';
      const todayStr = new Date().toISOString().split('T')[0];

      const testPayload = {
        facultyName: testFaculty,
        date: todayStr,
        logs: [
          {
            slot: '09:40 AM - 10:40 AM',
            activity: 'Conducted live system test from Employee Activity Tracker',
          },
        ],
      };

      const res = await syncFacultyLogsDirectToGoogleSheet(
        token,
        currentSpreadsheetId,
        testPayload
      );

      setStatusFeedback({
        type: 'success',
        message: `Tab "${res.tabName}" created/updated with test activity! Look at the bottom tabs of your Google Sheet.`,
        link: res.spreadsheetUrl,
      });

      if (onConfigChanged) onConfigChanged();
    } catch (err: unknown) {
      const errText = err instanceof Error ? err.message : String(err);
      setStatusFeedback({
        type: 'error',
        message: `Test write failed: ${errText}`,
      });
    } finally {
      setIsTestingWrite(false);
    }
  };

  // Apps Script Web App save
  const handleSaveAppsScriptUrl = () => {
    const trimmed = appsScriptUrlInput.trim();
    setStoredSheetsUrl(trimmed);
    setStatusFeedback({
      type: 'success',
      message: trimmed
        ? 'Apps Script Web App URL saved!'
        : 'Apps Script Web App URL cleared.',
    });
    if (onConfigChanged) onConfigChanged();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(SAMPLE_APPS_SCRIPT_CODE);
    setHasCopiedCode(true);
    setTimeout(() => setHasCopiedCode(false), 3000);
  };

  const isConnected = Boolean(currentSpreadsheetId && currentAccessToken);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">Google Sheets Live Sync</h2>
                {isConnected ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Setup Required
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                Log faculty activities directly into plain Google Sheets tabs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold px-4 pt-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('direct');
              setStatusFeedback(null);
            }}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'direct'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Connect Plain Sheet (Easiest)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('plainSheetInfo');
              setStatusFeedback(null);
            }}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'plainSheetInfo'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Info className="w-3.5 h-3.5 text-blue-600" />
            <span>Where is the data in Excel?</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('script');
              setStatusFeedback(null);
            }}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'script'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-slate-600" />
            <span>Apps Script Web App</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Status Feedback Banner */}
          {statusFeedback && (
            <div
              className={`p-3.5 rounded-xl border flex items-start justify-between gap-2.5 ${
                statusFeedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : statusFeedback.type === 'error'
                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                  : 'bg-blue-50 border-blue-300 text-blue-900'
              }`}
            >
              <div className="flex items-start gap-2">
                {statusFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : statusFeedback.type === 'error' ? (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="font-semibold text-xs leading-relaxed">{statusFeedback.message}</p>
                  {statusFeedback.link && (
                    <a
                      href={statusFeedback.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:underline pt-0.5"
                    >
                      <span>Open in Google Sheets</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStatusFeedback(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TAB 1: DIRECT GOOGLE SHEETS CONNECTION */}
          {activeTab === 'direct' && (
            <div className="space-y-4">
              {/* Step 1: Sign in with Google */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                      1
                    </span>
                    <span className="font-bold text-slate-900">Google Account Authorization</span>
                  </div>

                  {currentUser && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      <Check className="w-3 h-3" />
                      Authorized
                    </span>
                  )}
                </div>

                {currentUser ? (
                  <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-2.5">
                    <div className="flex items-center gap-2.5">
                      {currentUser.photoURL ? (
                        <img
                          src={currentUser.photoURL}
                          alt={currentUser.displayName || ''}
                          className="w-8 h-8 rounded-full border border-slate-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                          {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-900 text-xs">
                          {currentUser.displayName || 'Google Account'}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">{currentUser.email}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-md transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Switch</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-slate-600 text-xs">
                      Sign in with your Google account so the tracker has permission to add faculty tabs and write duty rows to your sheet.
                    </p>

                    {/* Official GSI Material Button specification */}
                    <button
                      type="button"
                      disabled={isSigningIn}
                      onClick={handleGoogleSignIn}
                      className="inline-flex items-center gap-3 px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSigningIn ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                      ) : (
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                          <path
                            fill="#EA4335"
                            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                          />
                          <path
                            fill="#4285F4"
                            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                          />
                          <path
                            fill="#34A853"
                            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                          />
                        </svg>
                      )}
                      <span>Sign in with Google</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Step 2: Target Google Sheet */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                      2
                    </span>
                    <span className="font-bold text-slate-900">Choose Target Google Sheet</span>
                  </div>

                  {currentSpreadsheetId && (
                    <a
                      href={`https://docs.google.com/spreadsheets/d/${currentSpreadsheetId}/edit`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline"
                    >
                      <span>Open Sheet</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-slate-700 font-medium">
                    Paste your plain Google Sheet Link or Spreadsheet ID:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={spreadsheetInput}
                      onChange={(e) => setSpreadsheetInput(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5.../edit"
                      className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      disabled={isVerifyingSheet || !spreadsheetInput.trim()}
                      onClick={handleConnectSpreadsheet}
                      className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 shrink-0"
                    >
                      {isVerifyingSheet ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Link2 className="w-3.5 h-3.5" />
                      )}
                      <span>Connect</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">Don&apos;t have a sheet ready yet?</span>
                    <button
                      type="button"
                      disabled={isCreatingSheet || !currentUser}
                      onClick={handleCreateNewSheet}
                      className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold text-[11px] cursor-pointer disabled:opacity-40"
                    >
                      {isCreatingSheet ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <PlusCircle className="w-3 h-3" />
                      )}
                      <span>✨ Create New Sheet in my Google Drive</span>
                    </button>
                  </div>
                </div>

                {/* Connected Sheet Preview Card */}
                {currentSpreadsheetId && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-800 truncate">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <span className="font-bold text-slate-900 block truncate">
                          {currentSpreadsheetTitle || 'Connected Google Sheet'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ID: {currentSpreadsheetId.substring(0, 16)}...
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isTestingWrite}
                      onClick={handleSendTestWrite}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-bold text-[11px] transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1.5"
                    >
                      {isTestingWrite ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Send className="w-3 h-3" />
                      )}
                      <span>Send Test Row</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Step 3: Plain Sheet Explanation Card */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-bold">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>How plain Google Sheets work with this tracker</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  When you open a new plain Google Sheet, it only has a blank tab called <strong>&ldquo;Sheet1&rdquo;</strong>.
                  When any faculty member clicks <strong>&ldquo;Submit Today&apos;s Log&rdquo;</strong>:
                </p>
                <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-1 pl-1">
                  <li>
                    The app creates a dedicated bottom tab named after the faculty (e.g. <strong>&ldquo;Mrs. Stvsav Ramya&rdquo;</strong>).
                  </li>
                  <li>
                    It formats bold table headers: <em>Timestamp, Date, Day, Time Slot, Duty &amp; Activity Log</em>.
                  </li>
                  <li>
                    Every time they submit, new rows are appended to their tab.
                  </li>
                  <li>
                    <strong>Check the bottom tabs</strong> of your Google Sheet to find each faculty member&apos;s register!
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: EXPLANATION OF PLAIN SHEETS & EXCEL REGISTRATION */}
          {activeTab === 'plainSheetInfo' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Why wasn&apos;t anything visible in your sheet?</span>
                </h3>

                <p className="text-slate-700 leading-relaxed">
                  Here is what happened and how to see your data immediately:
                </p>

                <div className="space-y-3 pt-1">
                  <div className="border border-slate-200 bg-white rounded-lg p-3 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                        1
                      </span>
                      <span>Google Sheet is organized by Bottom Tabs (Sheets)</span>
                    </div>
                    <p className="text-slate-600 pl-7 text-[11px]">
                      A plain Google Sheet opens to <strong>&ldquo;Sheet1&rdquo;</strong>. When the tracker submits faculty logs, it creates a <strong>new tab at the bottom</strong> named after the faculty member (e.g. <em>&ldquo;Mrs. Stvsav Ramya&rdquo;</em>, <em>&ldquo;Mr. G. Rajesh&rdquo;</em>). Click the tabs at the bottom bar of your Google Sheet!
                    </p>
                  </div>

                  <div className="border border-slate-200 bg-white rounded-lg p-3 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                        2
                      </span>
                      <span>Authorization is Required to Write into Your Sheet</span>
                    </div>
                    <p className="text-slate-600 pl-7 text-[11px]">
                      Google does not allow web apps to write to your personal spreadsheet without your permission.
                      Click <strong>&ldquo;Sign in with Google&rdquo;</strong> on the first tab of this modal, then paste your plain sheet URL.
                    </p>
                  </div>

                  <div className="border border-slate-200 bg-white rounded-lg p-3 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">
                        3
                      </span>
                      <span>Direct Excel File Download (.csv)</span>
                    </div>
                    <p className="text-slate-600 pl-7 text-[11px]">
                      If you want an immediate Excel spreadsheet on your computer right now without connecting Google Drive, click the button below:
                    </p>
                    <div className="pl-7 pt-1">
                      <button
                        type="button"
                        onClick={() => exportLogsToExcelCsv(logs)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>Download Excel Spreadsheet (.csv)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: APPS SCRIPT WEB APP METHOD */}
          {activeTab === 'script' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    Google Apps Script Web App URL (Alternative)
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-[11px] font-semibold text-slate-700 cursor-pointer"
                  >
                    {hasCopiedCode ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-500" />
                    )}
                    <span>{hasCopiedCode ? 'Copied Code!' : 'Copy Script Code'}</span>
                  </button>
                </div>

                <p className="text-slate-600 text-[11px]">
                  If your institution requires using an anonymous Apps Script Web App instead of Google Sign-In, paste the deployed Web App URL below:
                </p>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={appsScriptUrlInput}
                    onChange={(e) => setAppsScriptUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleSaveAppsScriptUrl}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    Save URL
                  </button>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-[11px] text-amber-800">
                  ⚠️ <strong>Important:</strong> Do NOT paste a <code>docs.google.com/spreadsheets</code> link here. This field is only for deployed Apps Script <code>/exec</code> URLs. For plain Google Sheets, use the first tab <strong>&ldquo;Connect Plain Sheet&rdquo;</strong>!
                </div>
              </div>

              {/* Instructions list */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 text-[11px] text-slate-600">
                <h4 className="font-bold text-slate-900">How to deploy Google Apps Script:</h4>
                <ol className="list-decimal list-inside space-y-1">
                  <li>In your Google Sheet, click <strong>Extensions &gt; Apps Script</strong>.</li>
                  <li>Click <strong>Copy Script Code</strong> above and paste it, replacing everything.</li>
                  <li>Click <strong>Deploy &gt; New deployment</strong>.</li>
                  <li>Select type: <strong>Web app</strong>.</li>
                  <li>Set <em>Execute as</em>: <strong>Me</strong>.</li>
                  <li>Set <em>Who has access</em>: <strong>Anyone</strong>.</li>
                  <li>Click <strong>Deploy</strong> and paste the Web app URL here.</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            {currentSpreadsheetTitle ? (
              <span>Target: <strong>{currentSpreadsheetTitle}</strong></span>
            ) : (
              <span>No spreadsheet connected yet</span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
