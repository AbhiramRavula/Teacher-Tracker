import React, { useState, useEffect, useMemo } from 'react';
import { Role, ActivityLog } from './types';
import { BASE_TIME_SLOTS, STORAGE_KEY, getSlotTimeLabel } from './constants';
import {
  FACULTY_DIRECTORY,
  INSTITUTION_INFO,
  getFacultyDaySlotsDetailed,
  SlotScheduleDetail,
} from './timetableData';
import { INITIAL_TIMETABLE_SAMPLE_LOGS, DEFAULT_FACULTY_SAMPLE_ACTIVITY } from './sampleData';
import { MobileFacultySelector } from './components/MobileFacultySelector';
import { DaySelector, DayOfWeek, DAYS_LIST } from './components/DaySelector';
import { MobileTimeSlotCard } from './components/MobileTimeSlotCard';
import { HodDashboardView } from './components/HodDashboardView';
import { HodReportModal } from './components/HodReportModal';
import { HodReportDocument } from './components/HodReportDocument';
import { TimetableModal } from './components/TimetableModal';
import { GoogleSheetsSettingsModal } from './components/GoogleSheetsSettingsModal';
import {
  getStoredSheetsUrl,
  submitLogToGoogleSheets,
  buildSheetsPayload,
  dispatchLogToGoogleSheets,
  getStoredSpreadsheetId,
  getStoredSpreadsheetTitle,
} from './utils/googleSheets';
import {
  Save,
  Printer,
  RotateCcw,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  ChevronRight,
  Sparkles,
  BookOpen,
  Briefcase,
  Layers,
  Clock,
  Trash2,
  History,
  Check,
  FileSpreadsheet,
  Send,
  Loader2,
  CloudUpload,
  ExternalLink,
} from 'lucide-react';

export default function App() {
  const todayStr = new Date().toISOString().split('T')[0];

  // Active top view tab: 'tracker' (Faculty / Staff Tracker) vs 'hod' (HoD Dashboard)
  const [activeTab, setActiveTab] = useState<'tracker' | 'hod'>('tracker');

  // Determine current day of week (1=Mon ... 6=Sat, 0=Sun maps to MON)
  const initialDayOfWeek: DayOfWeek = useMemo(() => {
    const dayIdx = new Date().getDay();
    const map: DayOfWeek[] = ['MON', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return map[dayIdx] || 'MON';
  }, []);

  // Form states
  const [employeeName, setEmployeeName] = useState<string>(DEFAULT_FACULTY_SAMPLE_ACTIVITY.employeeName);
  const [role, setRole] = useState<Role>(DEFAULT_FACULTY_SAMPLE_ACTIVITY.role);
  const [date, setDate] = useState<string>(todayStr);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(initialDayOfWeek);
  const [department, setDepartment] = useState<string>(DEFAULT_FACULTY_SAMPLE_ACTIVITY.department);
  const [activities, setActivities] = useState<Record<string, string>>(DEFAULT_FACULTY_SAMPLE_ACTIVITY.activities);
  const [formError, setFormError] = useState<string>('');

  // Modals
  const [isFacultySelectorOpen, setIsFacultySelectorOpen] = useState<boolean>(false);
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState<boolean>(false);
  const [isHodModalOpen, setIsHodModalOpen] = useState<boolean>(false);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState<boolean>(false);
  const [selectedReportLog, setSelectedReportLog] = useState<ActivityLog | null>(null);

  // Google Sheets integration state
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState<string>(() => getStoredSheetsUrl());
  const [spreadsheetId, setSpreadsheetId] = useState<string>(() => getStoredSpreadsheetId());
  const [spreadsheetTitle, setSpreadsheetTitle] = useState<string>(() => getStoredSpreadsheetTitle());
  const [isSubmittingToSheets, setIsSubmittingToSheets] = useState<boolean>(false);

  const isGoogleSheetsConfigured = Boolean(spreadsheetId || googleSheetsUrl.trim());

  // Print mode tracking
  const [isDailySummaryPrint, setIsDailySummaryPrint] = useState<boolean>(false);

  // Logs History state (persisted in localStorage)
  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasOldGenericData = parsed.some(
            (l: ActivityLog) => l.employeeName?.includes('Jenkins') || l.department?.includes('Computer Science &')
          );
          if (!hasOldGenericData) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.error('Failed to load logs from localStorage', e);
    }
    return INITIAL_TIMETABLE_SAMPLE_LOGS;
  });

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'info' | 'error';
    link?: string;
    linkText?: string;
  } | null>(null);

  // Persist logs
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save logs to localStorage', e);
    }
  }, [logs]);

  // Toast timeout
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Handle faculty selection from modal
  const handleSelectFaculty = (name: string, title?: string) => {
    setEmployeeName(name);
    if (role === 'Programmer') {
      setDepartment('Department of Information Technology (Systems & Labs)');
    } else {
      setDepartment('Department of Information Technology');
    }
    setFormError('');
  };

  // Detailed timetable slot mappings for currently selected faculty and day
  const scheduleSlotsDetailed = useMemo(() => {
    if (role !== 'Faculty' || !employeeName.trim()) {
      return {};
    }
    return getFacultyDaySlotsDetailed(employeeName, selectedDay);
  }, [employeeName, selectedDay, role]);

  // Count classes per day for this faculty (for the day pills)
  const dayClassCounts = useMemo(() => {
    if (role !== 'Faculty' || !employeeName.trim()) {
      return undefined;
    }
    const counts: Record<DayOfWeek, number> = {
      MON: 0,
      TUE: 0,
      WED: 0,
      THU: 0,
      FRI: 0,
      SAT: 0,
    };
    DAYS_LIST.forEach((d) => {
      const daySlots = getFacultyDaySlotsDetailed(employeeName, d.key);
      const filledCount = Object.values(daySlots).filter((s) => s.hasSchedule).length;
      counts[d.key] = filledCount;
    });
    return counts;
  }, [employeeName, role]);

  const handleActivityChange = (slotId: string, val: string) => {
    setActivities((prev) => ({
      ...prev,
      [slotId]: val,
    }));
  };

  const handleApplyScheduleHint = (slotId: string, hint: string) => {
    setActivities((prev) => ({
      ...prev,
      [slotId]: hint,
    }));
    setToastMessage({
      text: `Timetable class filled into slot!`,
      type: 'info',
    });
  };

  // Auto-fill all timetable slots for this day with one tap
  const handleAutoFillAllScheduled = () => {
    const newActs = { ...activities };
    let filledCount = 0;
    (['slot_1', 'slot_2', 'slot_3', 'slot_4', 'slot_5', 'slot_6'] as const).forEach((sKey) => {
      const detail = scheduleSlotsDetailed[sKey];
      if (detail && detail.fullDetail) {
        newActs[sKey] = detail.fullDetail;
        filledCount++;
      }
    });

    if (role === 'Faculty') {
      newActs['slot_closing'] = 'Class register attendance updated, verified lab records, and submitted daily sign-off.';
    } else {
      newActs['slot_closing'] = 'Lab systems health check completed, servers safely backed up, and power safely shutdown.';
    }

    setActivities(newActs);
    setToastMessage({
      text: `Auto-populated ${filledCount} scheduled periods from master timetable for ${selectedDay}!`,
      type: 'success',
    });
  };

  // Count filled slots (excluding lunch)
  const filledSlotsCount = BASE_TIME_SLOTS.filter(
    (slot) => !slot.isLunchBreak && activities[slot.id] && activities[slot.id].trim().length > 0
  ).length;

  // Build current log object
  const getCurrentLogObject = (): ActivityLog => {
    return {
      id: 'current_draft_' + Date.now(),
      employeeName: employeeName.trim() || 'Employee Name',
      role,
      date,
      department: department.trim() || 'Department of Information Technology',
      activities: { ...activities },
      savedAt: new Date().toISOString(),
      totalFilledSlots: filledSlotsCount,
      hodStatus: 'Under Review',
    };
  };

  // Save current log locally
  const handleSaveLog = () => {
    if (!employeeName.trim()) {
      setFormError('Please select or enter the staff member name.');
      setIsFacultySelectorOpen(true);
      return;
    }
    setFormError('');

    const newLog: ActivityLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      employeeName: employeeName.trim(),
      role,
      date,
      department: department.trim() || 'Department of Information Technology',
      activities: { ...activities },
      savedAt: new Date().toISOString(),
      totalFilledSlots: filledSlotsCount,
      hodStatus: 'Under Review',
      sheetsSynced: false,
    };

    setLogs((prev) => [newLog, ...prev]);
    setToastMessage({
      text: `Daily activity log for ${employeeName.trim()} on ${date} saved locally!`,
      type: 'success',
    });
  };

  // Submit Today's Log to Google Sheets via Apps Script Web App URL and save locally
  const handleSubmitTodaysLog = async () => {
    if (!employeeName.trim()) {
      setFormError('Please select or enter the staff member name.');
      setIsFacultySelectorOpen(true);
      return;
    }
    setFormError('');

    if (filledSlotsCount === 0) {
      setFormError('Please fill at least one duty or activity slot before submitting.');
      setToastMessage({
        text: 'Please enter activities for today before submitting.',
        type: 'info',
      });
      return;
    }

    // Compile payload according to user specification:
    // {
    //   "facultyName": "Mrs. Stvsav Ramya",
    //   "date": "2026-09-09",
    //   "logs": [
    //     { "slot": "09:40 AM - 10:40 AM", "activity": "Covered Operating Systems process scheduling" },
    //     { "slot": "10:40 AM - 11:40 AM", "activity": "Conducted OS Lab batch evaluations" }
    //   ]
    // }
    const payload = buildSheetsPayload(employeeName, date, activities, role);

    const newLogId = 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newLog: ActivityLog = {
      id: newLogId,
      employeeName: employeeName.trim(),
      role,
      date,
      department: department.trim() || 'Department of Information Technology',
      activities: { ...activities },
      savedAt: new Date().toISOString(),
      totalFilledSlots: filledSlotsCount,
      hodStatus: 'Under Review',
      sheetsSynced: false,
    };

    const isConfigured = Boolean(getStoredSpreadsheetId() || googleSheetsUrl.trim());

    // If neither Direct Google Sheet nor Google Apps Script Web App URL is configured
    if (!isConfigured) {
      setLogs((prev) => [newLog, ...prev]);
      setToastMessage({
        text: `Log saved locally! Connect your Google Sheet to sync faculty tabs directly.`,
        type: 'info',
      });
      setIsSheetsModalOpen(true);
      return;
    }

    // Dispatches log via Direct Google Sheets API v4 or Apps Script Web App
    setIsSubmittingToSheets(true);
    setToastMessage({
      text: `Syncing activity log to Google Sheet for ${employeeName.trim()}...`,
      type: 'info',
    });

    try {
      const result = await dispatchLogToGoogleSheets(payload);
      const updatedLog: ActivityLog = {
        ...newLog,
        sheetsSynced: result.success,
        sheetsSyncedAt: result.success ? new Date().toISOString() : undefined,
      };

      setLogs((prev) => [updatedLog, ...prev]);

      if (result.success) {
        setToastMessage({
          text: result.message || `Submitted to Google Sheet tab "${employeeName.trim()}"!`,
          type: 'success',
          link: result.spreadsheetUrl,
          linkText: 'Open in Sheets',
        });
      } else {
        setToastMessage({
          text: `Saved locally. Google Sheets: ${result.message}`,
          type: 'info',
        });
        if (result.method === 'none') {
          setIsSheetsModalOpen(true);
        }
      }
    } catch (err: unknown) {
      setLogs((prev) => [newLog, ...prev]);
      const errorMsg = err instanceof Error ? err.message : String(err);
      setToastMessage({
        text: `Saved locally. Note: ${errorMsg}`,
        type: 'info',
      });
    } finally {
      setIsSubmittingToSheets(false);
    }
  };

  // Sync an existing log from HoD dashboard to Google Sheets
  const handleSyncLogToSheets = async (log: ActivityLog) => {
    const isConfigured = Boolean(getStoredSpreadsheetId() || googleSheetsUrl.trim());
    if (!isConfigured) {
      setIsSheetsModalOpen(true);
      setToastMessage({
        text: 'Please connect your Google Sheet or paste Apps Script URL first.',
        type: 'info',
      });
      return;
    }

    const payload = buildSheetsPayload(log.employeeName, log.date, log.activities, log.role);
    setToastMessage({
      text: `Sending ${log.employeeName}'s log to Google Sheets...`,
      type: 'info',
    });

    const result = await dispatchLogToGoogleSheets(payload);
    if (result.success) {
      setLogs((prev) =>
        prev.map((l) =>
          l.id === log.id
            ? { ...l, sheetsSynced: true, sheetsSyncedAt: new Date().toISOString() }
            : l
        )
      );
      setToastMessage({
        text: result.message || `Synced ${log.employeeName}'s log to sheet tab!`,
        type: 'success',
        link: result.spreadsheetUrl,
        linkText: 'Open in Sheets',
      });
    } else {
      setToastMessage({
        text: result.message,
        type: 'info',
      });
    }
  };

  // Export current draft to PDF / Print
  const handleOpenPrintReport = () => {
    if (!employeeName.trim()) {
      setFormError('Please select or enter staff name before printing.');
      setIsFacultySelectorOpen(true);
      return;
    }
    setFormError('');
    setIsDailySummaryPrint(false);
    setSelectedReportLog(getCurrentLogObject());
    setIsHodModalOpen(true);
  };

  // Print individual log from HoD Dashboard
  const handlePrintIndividualLog = (log: ActivityLog) => {
    setIsDailySummaryPrint(false);
    setSelectedReportLog(log);
    setIsHodModalOpen(true);
  };

  // Print master daily sign-off summary
  const handlePrintDailySummary = () => {
    setIsDailySummaryPrint(true);
    setSelectedReportLog(null);
    setIsHodModalOpen(true);
  };

  // Update log status by HoD
  const handleUpdateLogStatus = (
    logId: string,
    status: 'Approved' | 'Under Review' | 'Needs Clarification',
    remarks?: string
  ) => {
    setLogs((prev) =>
      prev.map((log) => {
        if (log.id === logId) {
          return {
            ...log,
            hodStatus: status,
            hodRemarks: remarks !== undefined ? remarks : log.hodRemarks,
          };
        }
        return log;
      })
    );
    setToastMessage({
      text: `Submission status updated to "${status}".`,
      type: 'success',
    });
  };

  // Restore sample logs
  const handleRestoreSamples = () => {
    setLogs(INITIAL_TIMETABLE_SAMPLE_LOGS);
    setToastMessage({
      text: 'Departmental timetable sample submissions restored.',
      type: 'info',
    });
  };

  // Filter logs submitted today for pending badge in tabs
  const todaySubmittedCount = useMemo(
    () => logs.filter((l) => l.date === todayStr).length,
    [logs, todayStr]
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex justify-center selection:bg-blue-600 selection:text-white antialiased">
      {/* Mobile-First Container (max-w-md centered on desktop, 100% width on smartphone) */}
      <div className="w-full max-w-md min-h-screen bg-slate-50 flex flex-col shadow-2xl border-x border-slate-200/80">
        
        {/* Sticky App Header */}
        <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md">
          {/* Top Brand Bar */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
                IT
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-white leading-tight">
                  Matrusri Engineering College
                </h1>
                <p className="text-[11px] text-slate-300">
                  Dept of Information Technology • Activity Tracker
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsSheetsModalOpen(true)}
                className={`px-2.5 py-1 text-[11px] font-semibold border rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 ${
                  isGoogleSheetsConfigured
                    ? 'text-emerald-300 hover:text-white bg-slate-800 hover:bg-slate-700 border-emerald-500/40'
                    : 'text-amber-300 hover:text-white bg-slate-800 hover:bg-slate-700 border-amber-500/40'
                }`}
                title="Configure Google Sheets Live Sync"
              >
                <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                <span>Sheets</span>
                {isGoogleSheetsConfigured ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                )}
              </button>

              <button
                onClick={() => setIsTimetableModalOpen(true)}
                className="px-2.5 py-1 text-[11px] font-semibold text-blue-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                title="View Master Timetable Document"
              >
                <BookOpen className="w-3 h-3" />
                <span>Timetable</span>
              </button>
            </div>
          </div>

          {/* Role Switcher Tabs (Faculty Login vs HoD Dashboard) */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-950 text-xs font-semibold gap-1">
            <button
              id="tab-faculty-login"
              onClick={() => setActiveTab('tracker')}
              className={`min-h-[44px] rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'tracker'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Faculty / Staff Portal</span>
            </button>

            <button
              id="tab-hod-dashboard"
              onClick={() => setActiveTab('hod')}
              className={`min-h-[44px] rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
                activeTab === 'hod'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>HoD Dashboard</span>
              {todaySubmittedCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center ml-0.5">
                  {todaySubmittedCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Main Body Content */}
        <main className="flex-1 p-3.5 space-y-3.5 pb-28">
          {activeTab === 'tracker' ? (
            <>
              {/* Google Sheets Tab Link Info Banner */}
              <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-800 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate min-w-0">
                    <span className="text-[10px] text-slate-500 block leading-tight truncate">
                      {spreadsheetTitle ? `Target Sheet: ${spreadsheetTitle}` : 'Google Sheet Target Tab'}
                    </span>
                    <span className="font-bold text-slate-900 truncate font-mono text-[11px] block">
                      Tab: {employeeName.trim() || 'Faculty Name'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {spreadsheetId && (
                    <a
                      href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg font-bold text-[11px] transition-colors inline-flex items-center gap-1"
                      title="Open Google Sheet in new tab"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsSheetsModalOpen(true)}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer shrink-0"
                  >
                    {isGoogleSheetsConfigured ? 'Sync Setup' : 'Connect Sheet'}
                  </button>
                </div>
              </div>

              {/* Staff Selector Card & Role Toggle */}
              <section className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
                    <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                    <span>Staff Profile & Role</span>
                  </div>

                  {/* Role Switcher Pill */}
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setRole('Faculty')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                        role === 'Faculty'
                          ? 'bg-white text-blue-900 shadow-2xs font-bold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Faculty
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRole('Programmer');
                        if (employeeName === DEFAULT_FACULTY_SAMPLE_ACTIVITY.employeeName) {
                          setEmployeeName('MR. K. RAMESH');
                          setDepartment('Department of Information Technology (Systems & Labs)');
                        }
                      }}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                        role === 'Programmer'
                          ? 'bg-white text-emerald-900 shadow-2xs font-bold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Programmer
                    </button>
                  </div>
                </div>

                {/* Staff Name & Search Selector Button */}
                <button
                  type="button"
                  onClick={() => setIsFacultySelectorOpen(true)}
                  className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-between gap-2 min-h-[50px] cursor-pointer group"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Selected {role}
                    </span>
                    <div className="text-sm font-extrabold text-slate-900 truncate">
                      {employeeName || 'Tap to choose staff member'}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {department}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:text-blue-700 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                    <span>Change</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                {formError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Date Picker Input */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Duty Date:</span>
                  </div>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                  />
                </div>
              </section>

              {/* Day Selector (Mon - Sat) */}
              <section>
                <DaySelector
                  selectedDay={selectedDay}
                  onSelectDay={setSelectedDay}
                  dayClassCounts={dayClassCounts}
                />
              </section>

              {/* Auto-fill Quick Banner */}
              {role === 'Faculty' && (
                <div className="flex items-center justify-between bg-blue-50/90 border border-blue-200 rounded-xl p-2.5 text-xs text-blue-900">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-medium">
                      Matched <strong>{Object.values(scheduleSlotsDetailed).filter((s) => Boolean((s as SlotScheduleDetail)?.hasSchedule)).length}</strong> classes on <strong>{selectedDay}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillAllScheduled}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-2xs cursor-pointer active:scale-95 transition-all"
                  >
                    Auto-Fill Day
                  </button>
                </div>
              )}

              {/* Hourly Time-Slot Cards List */}
              <section className="space-y-3">
                <div className="flex items-center justify-between px-1 text-xs">
                  <span className="font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    Hourly Duty Schedule
                  </span>
                  <span className="font-semibold text-slate-500">
                    {filledSlotsCount} / 7 Completed
                  </span>
                </div>

                {BASE_TIME_SLOTS.map((slot, idx) => (
                  <MobileTimeSlotCard
                    key={slot.id}
                    slot={slot}
                    role={role}
                    value={activities[slot.id] || ''}
                    onChange={(val) => handleActivityChange(slot.id, val)}
                    index={idx}
                    scheduleDetail={scheduleSlotsDetailed[slot.id]}
                    onApplyScheduleHint={(hint) => handleApplyScheduleHint(slot.id, hint)}
                  />
                ))}
              </section>

              {/* Saved History for this Employee */}
              <section className="mt-6 bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5 uppercase tracking-wide">
                    <History className="w-3.5 h-3.5 text-blue-600" />
                    Recent Submissions ({logs.length})
                  </span>
                  <button
                    onClick={() => setActiveTab('hod')}
                    className="text-blue-600 hover:text-blue-700 text-xs font-semibold inline-flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>HoD View</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {logs.slice(0, 3).map((log) => (
                    <div key={log.id} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">
                          {log.employeeName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {log.date} • {log.totalFilledSlots}/7 slots
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            log.hodStatus === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {log.hodStatus || 'Under Review'}
                        </span>
                        <button
                          onClick={() => handlePrintIndividualLog(log)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-100 rounded-lg cursor-pointer"
                          title="Print sheet"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            /* HoD Dashboard View */
            <HodDashboardView
              logs={logs}
              onUpdateLogStatus={handleUpdateLogStatus}
              onPrintLog={handlePrintIndividualLog}
              onPrintDailySummary={handlePrintDailySummary}
              onRestoreSamples={handleRestoreSamples}
              onOpenGoogleSheetsSettings={() => setIsSheetsModalOpen(true)}
              onSyncLogToSheets={handleSyncLogToSheets}
              isGoogleSheetsConfigured={Boolean(googleSheetsUrl.trim())}
            />
          )}
        </main>

        {/* Sticky Thumb-Friendly Bottom Action Bar (in Tracker mode) */}
        {activeTab === 'tracker' && (
          <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center pointer-events-none p-3 pb-4">
            <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl border border-slate-300/80 shadow-2xl p-2.5 flex items-center gap-2 pointer-events-auto">
              {/* Reset entries button */}
              <button
                type="button"
                onClick={() => {
                  if (confirm('Clear current inputs?')) {
                    setActivities({});
                    setToastMessage({ text: 'Inputs reset.', type: 'info' });
                  }
                }}
                className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer shrink-0"
                title="Reset activities"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Sheets Settings Button */}
              <button
                type="button"
                onClick={() => setIsSheetsModalOpen(true)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-colors cursor-pointer shrink-0 ${
                  googleSheetsUrl.trim()
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                }`}
                title="Google Sheets Sync Settings"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>

              {/* Print / Export Report Button */}
              <button
                type="button"
                onClick={handleOpenPrintReport}
                className="min-h-[46px] px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
                title="Print official report"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">PDF</span>
              </button>

              {/* Main Thumb Action: Submit Today's Log */}
              <button
                id="submit-todays-log-button"
                type="button"
                disabled={isSubmittingToSheets}
                onClick={handleSubmitTodaysLog}
                className="min-h-[46px] flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 disabled:opacity-75 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                {isSubmittingToSheets ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span className="truncate">Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Submit Today&apos;s Log ({filledSlotsCount}/7)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Toast Feedback Notification */}
        {toastMessage && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <div
              className={`p-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center justify-between gap-2 ${
                toastMessage.type === 'success'
                  ? 'bg-slate-900 text-white border-slate-800'
                  : toastMessage.type === 'error'
                  ? 'bg-rose-900 text-white border-rose-800'
                  : 'bg-blue-600 text-white border-blue-700'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {toastMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Check className="w-4 h-4 text-blue-200 shrink-0" />
                )}
                <span className="leading-snug truncate">{toastMessage.text}</span>
              </div>
              {toastMessage.link && (
                <a
                  href={toastMessage.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-md text-[11px] shrink-0 inline-flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <span>{toastMessage.linkText || 'Open'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Google Sheets Settings & Apps Script Modal */}
        <GoogleSheetsSettingsModal
          isOpen={isSheetsModalOpen}
          onClose={() => setIsSheetsModalOpen(false)}
          logs={logs}
          onConfigChanged={() => {
            setGoogleSheetsUrl(getStoredSheetsUrl());
            setSpreadsheetId(getStoredSpreadsheetId());
            setSpreadsheetTitle(getStoredSpreadsheetTitle());
          }}
        />

        {/* Searchable Mobile Faculty Directory Selector Modal */}
        <MobileFacultySelector
          isOpen={isFacultySelectorOpen}
          onClose={() => setIsFacultySelectorOpen(false)}
          selectedName={employeeName}
          onSelectFaculty={handleSelectFaculty}
          role={role}
        />

        {/* Department Timetable Document Modal */}
        <TimetableModal
          isOpen={isTimetableModalOpen}
          onClose={() => setIsTimetableModalOpen(false)}
          onSelectFaculty={(facName) => {
            setEmployeeName(facName);
            setRole('Faculty');
            setDepartment('Department of Information Technology');
            setToastMessage({
              text: `Selected ${facName} from master timetable!`,
              type: 'success',
            });
          }}
        />

        {/* HoD Printable Modal Preview */}
        <HodReportModal
          isOpen={isHodModalOpen}
          onClose={() => setIsHodModalOpen(false)}
          log={
            isDailySummaryPrint
              ? undefined
              : selectedReportLog || getCurrentLogObject()
          }
          dailyLogs={isDailySummaryPrint ? logs.filter((l) => l.date === todayStr) : undefined}
          reportDate={todayStr}
        />

        {/* Hidden Printable Document for Browser Print Media Queries */}
        <div id="print-document-container" className="hidden print:block print:w-full">
          <HodReportDocument
            log={
              isDailySummaryPrint
                ? undefined
                : selectedReportLog || getCurrentLogObject()
            }
            dailyLogs={isDailySummaryPrint ? logs.filter((l) => l.date === todayStr) : undefined}
            reportDate={todayStr}
          />
        </div>
      </div>
    </div>
  );
}
