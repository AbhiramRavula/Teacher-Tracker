import React, { useState, useEffect, useMemo } from 'react';
import { Role, ActivityLog, PeriodSlotData } from './types';
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
import { HodAuthModal } from './components/HodAuthModal';
import { TimetableTabContent } from './components/TimetableTabContent';
import { SubmissionsHistoryTabContent } from './components/SubmissionsHistoryTabContent';
import { exportMultiTabGrandExcel } from './utils/excelExport';
import {
  fetchDepartmentSettings,
  saveActivityLogToFirestore,
  fetchActivityLogsFromFirestore,
} from './utils/firestoreService';
import {
  saveSlotDraft,
  loadDraftsForEmployeeAndDate,
  clearDraftsForEmployeeAndDate,
  saveStructuredSlotDraft,
  loadStructuredDraftsForEmployeeAndDate,
  formatPeriodSummary,
} from './utils/draftStorage';
import {
  getStoredHodAuthEmail,
  setStoredHodAuthEmail,
  isEmailAuthorized,
  PRIMARY_HOD_EMAIL,
} from './utils/hodAuth';
import {
  getStoredSheetsUrl,
  submitLogToGoogleSheets,
  buildSheetsPayload,
  dispatchLogToGoogleSheets,
  getStoredSpreadsheetId,
  getStoredSpreadsheetTitle,
} from './utils/googleSheets';
import {
  subscribeToAuth,
  signOutCurrentUser,
} from './firebase';
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
  ChevronLeft,
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
  ShieldCheck,
  Lock,
  Download,
  X,
  ArrowLeft,
} from 'lucide-react';

export default function App() {
  const todayStr = new Date().toISOString().split('T')[0];

  // Active top view tab: 'tracker' (Daily Tracker) | 'schedule' (Master Timetable) | 'history' (Submissions Archive) | 'hod' (HoD Dashboard)
  const [activeTab, setActiveTab] = useState<'tracker' | 'schedule' | 'history' | 'hod'>('tracker');

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
  const [activities, setActivities] = useState<Record<string, string>>(() => {
    const drafts = loadDraftsForEmployeeAndDate(DEFAULT_FACULTY_SAMPLE_ACTIVITY.employeeName, todayStr);
    if (Object.keys(drafts).length > 0) {
      return drafts;
    }
    return DEFAULT_FACULTY_SAMPLE_ACTIVITY.activities;
  });
  const [periodData, setPeriodData] = useState<Record<string, PeriodSlotData>>(() => {
    return loadStructuredDraftsForEmployeeAndDate(DEFAULT_FACULTY_SAMPLE_ACTIVITY.employeeName, todayStr);
  });
  const [formError, setFormError] = useState<string>('');

  // HoD & Admin Authentication state
  const [hodAdminEmail, setHodAdminEmail] = useState<string | null>(() => getStoredHodAuthEmail());
  const [isHodAuthModalOpen, setIsHodAuthModalOpen] = useState<boolean>(false);
  const [pendingAdminAction, setPendingAdminAction] = useState<'hod_tab' | 'sheets_config' | null>(null);

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

  // Persist logs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save logs to localStorage', e);
    }
  }, [logs]);

  // Load remote department settings from Firestore on mount
  useEffect(() => {
    fetchDepartmentSettings()
      .then((settings) => {
        if (settings) {
          if (settings.spreadsheetId) setSpreadsheetId(settings.spreadsheetId);
          if (settings.spreadsheetTitle) setSpreadsheetTitle(settings.spreadsheetTitle);
          if (settings.sheetsWebAppUrl) setGoogleSheetsUrl(settings.sheetsWebAppUrl);
        }
      })
      .catch((err) => console.warn('Could not load remote department settings:', err));
  }, []);

  // Fetch submitted logs from Firestore on mount to sync across all department staff
  useEffect(() => {
    fetchActivityLogsFromFirestore()
      .then((remoteLogs) => {
        if (remoteLogs && remoteLogs.length > 0) {
          setLogs((prev) => {
            const map = new Map<string, ActivityLog>();
            prev.forEach((l) => map.set(l.id, l));
            remoteLogs.forEach((l) => map.set(l.id, l));
            return Array.from(map.values()).sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
          });
        }
      })
      .catch((err) => console.warn('Could not load Firestore logs:', err));
  }, []);

  // Listen to Firebase Auth state for HoD / Admin verification
  useEffect(() => {
    const unsubAuth = subscribeToAuth((user) => {
      if (user?.email) {
        if (isEmailAuthorized(user.email)) {
          setStoredHodAuthEmail(user.email);
          setHodAdminEmail(user.email);
        } else {
          // Keep user signed in for Google Sheets live sync, but don't grant HoD role
          setStoredHodAuthEmail(null);
          setHodAdminEmail(null);
        }
      } else {
        setStoredHodAuthEmail(null);
        setHodAdminEmail(null);
      }
    });
    return () => unsubAuth();
  }, []);

  // Toast timeout (5 seconds for comfortable reading)
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Handle faculty selection from modal
  const handleSelectFaculty = (name: string, title?: string, roleOverride?: Role) => {
    const effectiveRole = roleOverride || role;
    if (roleOverride && roleOverride !== role) {
      setRole(roleOverride);
    }
    setEmployeeName(name);
    if (effectiveRole === 'Programmer') {
      setDepartment('Department of Information Technology (Systems & Labs)');
    } else {
      setDepartment('Department of Information Technology');
    }
    setFormError('');

    // Strictly separate logs by selected date and faculty:
    // Check if there are draft activities or previously saved logs for this faculty on this date
    const existingDrafts = loadDraftsForEmployeeAndDate(name, date);
    const existingStructDrafts = loadStructuredDraftsForEmployeeAndDate(name, date);

    // Look for any existing saved/submitted log in memory/Firestore for this faculty and date
    const existingSavedLog = logs.find(
      (l) =>
        l.employeeName.trim().toLowerCase() === name.trim().toLowerCase() &&
        l.date === date
    );

    const mergedActs = { ...(existingSavedLog?.activities || {}), ...existingDrafts };
    const mergedStruct = { ...(existingSavedLog?.periodData || {}), ...existingStructDrafts };

    if (Object.keys(mergedActs).length > 0 || Object.keys(mergedStruct).length > 0) {
      setActivities(mergedActs);
      setPeriodData(mergedStruct);
      setToastMessage({
        text: `Restored saved activities for ${name} on ${date}.`,
        type: 'info',
      });
      return;
    }

    // If no draft saved yet for this date, auto-populate scheduled periods from the master timetable
    if (effectiveRole === 'Faculty') {
      const daySlots = getFacultyDaySlotsDetailed(name, selectedDay);
      const newActs: Record<string, string> = {};
      const newStruct: Record<string, PeriodSlotData> = {};
      let filledCount = 0;

      (['slot_1', 'slot_2', 'slot_3', 'slot_4', 'slot_5', 'slot_6'] as const).forEach((sKey) => {
        const detail = daySlots[sKey];
        if (detail && detail.fullDetail) {
          newActs[sKey] = detail.fullDetail;
          saveSlotDraft(name, date, sKey, detail.fullDetail);

          const structItem: PeriodSlotData = {
            slot: sKey.replace('slot_', 'P').toUpperCase(),
            courseName: detail.subjectAbbr || detail.subjectName || '',
            section: detail.section || 'III A',
            credits: detail.isLab ? '1' : '3',
            unitNo: '1',
            topicName: '',
            classHour: detail.roomNo ? `Room ${detail.roomNo}` : '',
          };
          newStruct[sKey] = structItem;
          saveStructuredSlotDraft(name, date, sKey, structItem);
          filledCount++;
        }
      });
      if (filledCount > 0) {
        const closingText = 'Class register attendance updated, verified lab records, and submitted daily sign-off.';
        newActs['slot_closing'] = closingText;
        saveSlotDraft(name, date, 'slot_closing', closingText);

        const closingStruct: PeriodSlotData = {
          slot: 'Closing',
          courseName: 'Department Sign-off',
          section: 'IT Dept',
          credits: '0',
          unitNo: '0',
          topicName: closingText,
          classHour: 'Closing Duty',
        };
        newStruct['slot_closing'] = closingStruct;
        saveStructuredSlotDraft(name, date, 'slot_closing', closingStruct);

        setActivities(newActs);
        setPeriodData(newStruct);
        setToastMessage({
          text: `Loaded ${name}'s schedule: ${filledCount} classes auto-filled for ${selectedDay}!`,
          type: 'success',
        });
      } else {
        setActivities({});
        setPeriodData({});
      }
    } else {
      // Programmer role
      const programmerClosingText =
        'Lab systems health check completed, servers verified, and workstations secured (Duty schedule: 05:30 PM).';
      const progActs: Record<string, string> = { slot_closing: programmerClosingText };
      saveSlotDraft(name, date, 'slot_closing', programmerClosingText);
      setActivities(progActs);
      setPeriodData({});
      setToastMessage({
        text: `Selected programmer ${name} (closing slot dynamically extended to 05:30 PM).`,
        type: 'info',
      });
    }
  };

  // Handle duty date change with strict date isolation
  const handleDateChange = (newDate: string) => {
    setDate(newDate);

    // Sync day of week based on newDate
    if (newDate) {
      const parts = newDate.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        const map: DayOfWeek[] = ['MON', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const dow = map[d.getDay()] || 'MON';
        setSelectedDay(dow);
      }
    }

    // Separate logs strictly by selected date (YYYY-MM-DD)
    // Changing date loads drafts specifically saved for that date, or previously submitted logs
    const dateDrafts = loadDraftsForEmployeeAndDate(employeeName, newDate);
    const dateStructDrafts = loadStructuredDraftsForEmployeeAndDate(employeeName, newDate);

    // Look for any existing saved/submitted log in memory/Firestore for this faculty and date
    const existingSavedLog = logs.find(
      (l) =>
        l.employeeName.trim().toLowerCase() === employeeName.trim().toLowerCase() &&
        l.date === newDate
    );

    const mergedActs = { ...(existingSavedLog?.activities || {}), ...dateDrafts };
    const mergedStruct = { ...(existingSavedLog?.periodData || {}), ...dateStructDrafts };

    setActivities(mergedActs);
    setPeriodData(mergedStruct);

    if (Object.keys(mergedActs).length > 0 || Object.keys(mergedStruct).length > 0) {
      setToastMessage({
        text: `Loaded saved activities for ${newDate}.`,
        type: 'info',
      });
    }
  };

  // Quick 1-click previous / next day navigation
  const handlePrevDate = () => {
    const d = new Date(date + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    const newDateStr = d.toISOString().split('T')[0];
    handleDateChange(newDateStr);
  };

  const handleNextDate = () => {
    const d = new Date(date + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    const newDateStr = d.toISOString().split('T')[0];
    handleDateChange(newDateStr);
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

  // Real-time slot text change with instant localStorage persistence
  const handleActivityChange = (slotId: string, val: string) => {
    setActivities((prev) => ({
      ...prev,
      [slotId]: val,
    }));
    // Real-time persistence keyed strictly by facultyName + date + slot
    saveSlotDraft(employeeName, date, slotId, val);
  };

  const handlePeriodDataChange = (slotId: string, data: PeriodSlotData) => {
    setPeriodData((prev) => ({
      ...prev,
      [slotId]: data,
    }));
    saveStructuredSlotDraft(employeeName, date, slotId, data);
  };

  const handleApplyScheduleHint = (slotId: string, hint: string) => {
    setActivities((prev) => ({
      ...prev,
      [slotId]: hint,
    }));
    saveSlotDraft(employeeName, date, slotId, hint);
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
        saveSlotDraft(employeeName, date, sKey, detail.fullDetail);
        filledCount++;
      }
    });

    const closingText =
      role === 'Faculty'
        ? 'Class register attendance updated, verified lab records, and submitted daily sign-off.'
        : 'Lab systems health check completed, servers safely backed up, and power safely shutdown (closing 05:30 PM).';

    newActs['slot_closing'] = closingText;
    saveSlotDraft(employeeName, date, 'slot_closing', closingText);

    setActivities(newActs);
    setToastMessage({
      text: `Auto-populated ${filledCount} scheduled periods from master timetable for ${selectedDay}!`,
      type: 'success',
    });
  };

  // Reset inputs and clear drafts for this employee + date
  const handleResetCurrentActivities = () => {
    if (window.confirm(`Clear draft activities for ${employeeName} on ${date}?`)) {
      setActivities({});
      setPeriodData({});
      clearDraftsForEmployeeAndDate(employeeName, date);
      setToastMessage({
        text: `Cleared draft activities for ${date}.`,
        type: 'info',
      });
    }
  };

  // HoD Authentication Handlers
  const handleSwitchToHodTab = () => {
    const authed = getStoredHodAuthEmail();
    if (authed && isEmailAuthorized(authed)) {
      setHodAdminEmail(authed);
      setActiveTab('hod');
    } else {
      setPendingAdminAction('hod_tab');
      setIsHodAuthModalOpen(true);
    }
  };

  const handleOpenSheetsConfig = () => {
    const authed = getStoredHodAuthEmail();
    if (authed && isEmailAuthorized(authed)) {
      setHodAdminEmail(authed);
      setIsSheetsModalOpen(true);
    } else {
      setPendingAdminAction('sheets_config');
      setIsHodAuthModalOpen(true);
      setToastMessage({
        text: 'Administrator access required to configure Google Sheets integration.',
        type: 'info',
      });
    }
  };

  const handleHodLoginSuccess = (email: string) => {
    setStoredHodAuthEmail(email);
    setHodAdminEmail(email);
    setIsHodAuthModalOpen(false);
    if (pendingAdminAction === 'sheets_config') {
      setIsSheetsModalOpen(true);
      setToastMessage({
        text: `Authorized session: ${email}. Opening Google Sheets configuration.`,
        type: 'success',
      });
    } else {
      setActiveTab('hod');
      setToastMessage({
        text: `Welcome! Authorized HoD session: ${email}`,
        type: 'success',
      });
    }
    setPendingAdminAction(null);
  };

  const handleHodLogout = () => {
    signOutCurrentUser().catch((err) => console.warn('Firebase sign out note:', err));
    setStoredHodAuthEmail(null);
    setHodAdminEmail(null);
    setActiveTab('tracker');
    setToastMessage({
      text: 'HoD administrative session logged out.',
      type: 'info',
    });
  };

  // Count filled slots (excluding lunch)
  const filledSlotsCount = BASE_TIME_SLOTS.filter((slot) => {
    if (slot.isLunchBreak) return false;
    const hasPlain = Boolean(activities[slot.id] && activities[slot.id].trim().length > 0);
    const pData = periodData[slot.id];
    const hasStruct = Boolean(pData && (pData.topicName?.trim() || pData.courseName?.trim()));
    return hasPlain || hasStruct;
  }).length;

  // Build current log object
  const getCurrentLogObject = (): ActivityLog => {
    return {
      id: 'current_draft_' + Date.now(),
      employeeName: employeeName.trim() || 'Employee Name',
      role,
      date,
      department: department.trim() || 'Department of Information Technology',
      activities: { ...activities },
      periodData: { ...periodData },
      savedAt: new Date().toISOString(),
      totalFilledSlots: filledSlotsCount,
      hodStatus: 'Submitted',
    };
  };

  // Save current log (directly updates in Google Sheets without requiring HoD approval)
  const handleSaveLog = async () => {
    if (!employeeName.trim()) {
      setFormError('Please select or enter the staff member name.');
      setIsFacultySelectorOpen(true);
      return;
    }
    setFormError('');
    await handleSubmitTodaysLog();
  };

  // Submit Today's Log directly to Google Sheets and save locally
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

    // Compile payload according to user specification
    const payload = buildSheetsPayload(employeeName, date, activities, role, periodData);

    const newLogId = 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newLog: ActivityLog = {
      id: newLogId,
      employeeName: employeeName.trim(),
      role,
      date,
      department: department.trim() || 'Department of Information Technology',
      activities: { ...activities },
      periodData: { ...periodData },
      savedAt: new Date().toISOString(),
      totalFilledSlots: filledSlotsCount,
      hodStatus: 'Submitted',
      sheetsSynced: false,
    };

    const isAdmin = Boolean(hodAdminEmail && isEmailAuthorized(hodAdminEmail));

    // Immediately persist locally and to Firestore to guarantee zero data loss
    setLogs((prev) => [newLog, ...prev]);
    saveActivityLogToFirestore(newLog).catch((err) => console.warn('Firestore log persist note:', err));

    // Check if Sheets sync is configured; if missing locally, refresh from Firestore settings
    let currentSheetsUrl = googleSheetsUrl.trim();
    let currentSheetId = getStoredSpreadsheetId();

    if (!currentSheetsUrl && !currentSheetId) {
      try {
        const remoteSettings = await fetchDepartmentSettings();
        if (remoteSettings) {
          if (remoteSettings.sheetsWebAppUrl) {
            currentSheetsUrl = remoteSettings.sheetsWebAppUrl.trim();
            setGoogleSheetsUrl(currentSheetsUrl);
          }
          if (remoteSettings.spreadsheetId) {
            currentSheetId = remoteSettings.spreadsheetId.trim();
            setSpreadsheetId(currentSheetId);
          }
          if (remoteSettings.spreadsheetTitle) {
            setSpreadsheetTitle(remoteSettings.spreadsheetTitle);
          }
        }
      } catch (err) {
        console.warn('Could not refresh remote department settings before submit:', err);
      }
    }

    const isConfigured = Boolean(currentSheetId || currentSheetsUrl);

    // If neither Direct Google Sheet nor Google Apps Script Web App URL is configured
    if (!isConfigured) {
      setToastMessage({
        text: `Activity log recorded! ${filledSlotsCount} duties for ${employeeName.trim()} safely saved to department records. (Google Sheets sync pending HoD setup).`,
        type: 'success',
      });
      // Only prompt the sheets modal if user is an authorized Admin
      if (isAdmin) {
        setIsSheetsModalOpen(true);
      }
      return;
    }

    // Dispatches log via Public Google Apps Script Web App (zero auth) or Direct API
    setIsSubmittingToSheets(true);
    setToastMessage({
      text: `Syncing ${filledSlotsCount} duties for ${employeeName.trim()} to personal tab & Grand Daily Report (new daily table)...`,
      type: 'info',
    });

    try {
      const result = await dispatchLogToGoogleSheets(payload);
      const updatedLog: ActivityLog = {
        ...newLog,
        sheetsSynced: result.success,
        sheetsSyncedAt: result.success ? new Date().toISOString() : undefined,
        sheetsSyncedMethod: result.method,
        sheetsTargetTab: result.tabName,
        sheetsSpreadsheetUrl: result.spreadsheetUrl,
      };

      setLogs((prev) => prev.map((l) => (l.id === newLogId ? updatedLog : l)));
      saveActivityLogToFirestore(updatedLog).catch((err) => console.warn('Firestore log persist note:', err));

      if (result.success) {
        setToastMessage({
          text: `Daily log saved & synced! Recorded ${filledSlotsCount} activities for ${employeeName.trim()} in personal tab "${result.tabName || employeeName.trim()}" & Grand Daily Report (New table for ${date})!`,
          type: 'success',
          link: result.spreadsheetUrl,
          linkText: 'Open in Sheets',
        });
      } else {
        setToastMessage({
          text: `Log safely recorded in department records! Note: ${result.message}`,
          type: 'info',
        });
        // Only open the configuration modal if the user is an Admin
        if (isAdmin && (result.method === 'none' || result.message.includes('authorization is required') || result.message.includes('not connected') || result.message.includes('permission'))) {
          setIsSheetsModalOpen(true);
        }
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setToastMessage({
        text: `Log safely recorded in department records. Note: ${errorMsg}`,
        type: 'info',
      });
    } finally {
      setIsSubmittingToSheets(false);
    }
  };

  // Sync an existing log from HoD dashboard or History to Google Sheets
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

    const payload = buildSheetsPayload(log.employeeName, log.date, log.activities, log.role, log.periodData);
    setToastMessage({
      text: `Sending ${log.employeeName}'s log to Google Sheets...`,
      type: 'info',
    });

    const result = await dispatchLogToGoogleSheets(payload);
    if (result.success) {
      const updatedLog: ActivityLog = {
        ...log,
        sheetsSynced: true,
        sheetsSyncedAt: new Date().toISOString(),
        sheetsSyncedMethod: result.method,
        sheetsTargetTab: result.tabName,
        sheetsSpreadsheetUrl: result.spreadsheetUrl,
      };
      setLogs((prev) => prev.map((l) => (l.id === log.id ? updatedLog : l)));
      saveActivityLogToFirestore(updatedLog).catch((err) => console.warn('Firestore log persist note:', err));
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
      {/* Responsive Container: comfortable max-w-5xl on desktop/tablets, 100% on smartphone */}
      <div className="w-full max-w-5xl mx-auto min-h-screen bg-slate-50 flex flex-col shadow-xl border-x border-slate-200/80">
        
        {/* Sticky App Header */}
        <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md">
          {/* Top Brand Bar */}
          <div className="px-3.5 sm:px-5 py-3 flex items-center justify-between border-b border-slate-800 gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
                IT
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-bold tracking-tight text-white leading-tight truncate">
                  Matrusri Engineering College
                </h1>
                <p className="text-[11px] text-slate-300 truncate">
                  Dept of Information Technology • Daily Activity Tracker
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Quick Excel (.xlsx) Download */}
              <button
                type="button"
                onClick={() => {
                  exportMultiTabGrandExcel(logs);
                  setToastMessage({
                    text: 'Generated departmental multi-tab Excel workbook (.xlsx)!',
                    type: 'success',
                  });
                }}
                className="px-2.5 py-1 text-[11px] font-semibold text-emerald-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-emerald-500/40 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                title="Download complete multi-tab departmental Excel (.xlsx)"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Excel (.xlsx)</span>
              </button>

              {/* Google Sheets Sync status & configuration trigger (Only visible to authenticated HoD / Admin) */}
              {hodAdminEmail && (
                <button
                  type="button"
                  onClick={handleOpenSheetsConfig}
                  className={`px-2.5 py-1 text-[11px] font-semibold border rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                    isGoogleSheetsConfigured
                      ? 'text-emerald-300 hover:text-white bg-slate-800 hover:bg-slate-700 border-emerald-500/40'
                      : 'text-amber-300 hover:text-white bg-slate-800 hover:bg-slate-700 border-amber-500/40'
                  }`}
                  title={
                    isGoogleSheetsConfigured
                      ? `Google Sheets Live Sync Connected: ${spreadsheetTitle || 'Active'}`
                      : 'Connect Google Sheet to enable automatic faculty tab registration'
                  }
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="hidden sm:inline">Sheets Sync</span>
                  <span className="sm:hidden">Sheets</span>
                  {isGoogleSheetsConfigured ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  )}
                </button>
              )}

              {/* Admin status / Login badge */}
              {hodAdminEmail ? (
                <button
                  type="button"
                  onClick={handleHodLogout}
                  className="px-2 py-1 text-[11px] font-medium text-slate-300 hover:text-rose-300 bg-slate-800/90 border border-slate-700 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                  title={`Signed in as Admin (${hodAdminEmail}). Click to sign out.`}
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span className="hidden md:inline">Admin</span>
                  <span className="text-[10px] text-slate-400 hover:text-rose-300">Exit</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setPendingAdminAction('hod_tab');
                    setIsHodAuthModalOpen(true);
                  }}
                  className="px-2 py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800/80 border border-slate-700 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                  title="Sign in with authorized Google account for Admin / HoD access"
                >
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span className="hidden sm:inline">Admin Login</span>
                </button>
              )}
            </div>
          </div>

          {/* Navigation Segmented Tabs (4 tabs for effortless navigation) */}
          <div className="grid grid-cols-4 p-1.5 bg-slate-950 text-xs font-semibold gap-1">
            <button
              id="tab-faculty-tracker"
              onClick={() => setActiveTab('tracker')}
              className={`min-h-[44px] rounded-xl flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer px-1 text-center ${
                activeTab === 'tracker'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
              title="Daily Activity Tracker"
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span className="truncate">Tracker</span>
            </button>

            <button
              id="tab-timetable-schedule"
              onClick={() => setActiveTab('schedule')}
              className={`min-h-[44px] rounded-xl flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer px-1 text-center ${
                activeTab === 'schedule'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
              title="Master Department Timetable & Faculty Schedules"
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="truncate">Timetable</span>
            </button>

            <button
              id="tab-submissions-history"
              onClick={() => setActiveTab('history')}
              className={`min-h-[44px] rounded-xl flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer px-1 text-center relative ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
              title="View all submitted activity logs and synced reports"
            >
              <History className="w-4 h-4 shrink-0" />
              <span className="truncate">Submissions</span>
              {logs.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-slate-700 text-slate-200 text-[10px] font-bold flex items-center justify-center ml-0.5">
                  {logs.length}
                </span>
              )}
            </button>

            <button
              id="tab-hod-dashboard"
              onClick={handleSwitchToHodTab}
              className={`min-h-[44px] rounded-xl flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer px-1 text-center relative ${
                activeTab === 'hod'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
              title={hodAdminEmail ? `Authorized: ${hodAdminEmail}` : 'Restricted Admin Access'}
            >
              <FileCheck2 className="w-4 h-4 shrink-0" />
              <span className="truncate">HoD Portal</span>
              {hodAdminEmail ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
              ) : (
                <Lock className="w-3 h-3 text-amber-400/80 shrink-0" />
              )}
              {todaySubmittedCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center ml-0.5">
                  {todaySubmittedCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Main Body Content */}
        <main className="flex-1 p-3.5 sm:p-5 space-y-4 pb-28">
          {activeTab === 'tracker' && (
            <>
              {/* Google Sheets Tab Link Info Banner */}
              {isGoogleSheetsConfigured ? (
                <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-800 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div className="truncate min-w-0">
                      <span className="text-[10px] text-emerald-700 font-semibold block leading-tight truncate">
                        {spreadsheetTitle ? `Connected Sheet: ${spreadsheetTitle}` : 'Google Sheets Live Sync Active'}
                      </span>
                      <span className="font-bold text-slate-900 truncate font-mono text-[11px] block">
                        Target Tab: &ldquo;{employeeName.trim() || 'Faculty Name'}&rdquo;
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {spreadsheetId && (
                      <a
                        href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold text-[11px] transition-colors inline-flex items-center gap-1 shadow-2xs"
                        title="Open Google Sheet in new tab"
                      >
                        <span>Open Sheet</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {hodAdminEmail && (
                      <button
                        type="button"
                        onClick={handleOpenSheetsConfig}
                        className="px-2.5 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-semibold text-[11px] transition-colors cursor-pointer shrink-0 shadow-2xs"
                        title="Configure Google Sheets sync parameters (Requires Admin authentication)"
                      >
                        Tab &amp; Sync Settings
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-3 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-800 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-2xs">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div className="truncate min-w-0">
                      <span className="font-bold text-slate-900 text-xs block">
                        Google Sheets Sync: Pending Admin Setup
                      </span>
                      <span className="text-[11px] text-slate-600 truncate block">
                        All duty entries are securely saved to department cloud records.
                      </span>
                    </div>
                  </div>

                  {hodAdminEmail ? (
                    <button
                      type="button"
                      onClick={handleOpenSheetsConfig}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold text-[11px] transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1 shadow-2xs"
                      title="Connect Google Sheet (Requires Admin authentication)"
                    >
                      <span>Connect Sheet</span>
                    </button>
                  ) : (
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300/80 rounded-lg text-[10px] font-semibold">
                      Auto-Logged
                    </span>
                  )}
                </div>
              )}

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

                {/* Date Picker Input with Prev / Next day quick navigation */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                      <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Duty Date & Log Day:</span>
                    </div>
                    {date !== todayStr && (
                      <button
                        type="button"
                        onClick={() => handleDateChange(todayStr)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                        title="Jump back to current date"
                      >
                        Jump to Today
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handlePrevDate}
                      className="min-h-[44px] px-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shrink-0 shadow-2xs"
                      title="Previous Day"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden xs:inline">Prev</span>
                    </button>

                    <input
                      type="date"
                      value={date}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="flex-1 min-h-[44px] px-3 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-100 focus:outline-none cursor-pointer transition-all shadow-2xs text-center"
                    />

                    <button
                      type="button"
                      onClick={handleNextDate}
                      className="min-h-[44px] px-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shrink-0 shadow-2xs"
                      title="Next Day"
                    >
                      <span className="hidden xs:inline">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </section>

              {/* Programmer Timing Notice Banner */}
              {role === 'Programmer' && (
                <div className="flex items-center justify-between bg-emerald-50/90 border border-emerald-200 rounded-xl p-2.5 text-xs text-emerald-900">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="font-medium text-[11px] leading-tight">
                      <strong>Programmer Duty Timings:</strong> Final closing slot extends to <strong>05:30 PM</strong> (04:20 PM – 05:30 PM) for lab maintenance and server backups.
                    </span>
                  </div>
                </div>
              )}

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
                    periodData={periodData[slot.id]}
                    onPeriodDataChange={(pData) => handlePeriodDataChange(slot.id, pData)}
                    onChange={(val) => handleActivityChange(slot.id, val)}
                    index={idx}
                    scheduleDetail={scheduleSlotsDetailed[slot.id]}
                    onApplyScheduleHint={(hint) => handleApplyScheduleHint(slot.id, hint)}
                  />
                ))}
              </section>

              {/* Complete Log Submission Primary Banner */}
              <section className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-4 text-white shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                      <Save className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold leading-tight">Save &amp; Sync Daily Log</h3>
                      <p className="text-[11px] text-emerald-100">
                        {filledSlotsCount}/7 slots completed for {date}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                    2 Sheets Sync Active
                  </span>
                </div>

                <p className="text-[11px] text-emerald-50 leading-relaxed">
                  Clicking <strong>Save Log</strong> immediately syncs your entries to Google Sheets with two dedicated records: your <strong>Faculty Personal Tab</strong> and the <strong>Grand Daily Report</strong> sheet (creating a dedicated new table for every single day).
                </p>

                <button
                  type="button"
                  id="primary-save-log-btn"
                  disabled={isSubmittingToSheets}
                  onClick={handleSaveLog}
                  className="w-full py-3 bg-white hover:bg-emerald-50 text-emerald-950 font-extrabold text-xs rounded-xl transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSubmittingToSheets ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                      <span>Syncing Both Sheets Immediately...</span>
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                      <span>Save Log &amp; Sync to Sheets Immediately</span>
                    </>
                  )}
                </button>
              </section>

              {/* Quick Navigation Cards to Timetable & Submissions Archive */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('schedule')}
                  className="p-3.5 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-left transition-colors flex items-center justify-between cursor-pointer group shadow-2xs"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Master Timetable</span>
                    <span className="text-[11px] text-slate-500 block">View faculty schedule grid</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className="p-3.5 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-left transition-colors flex items-center justify-between cursor-pointer group shadow-2xs"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Submissions Log</span>
                    <span className="text-[11px] text-slate-500 block">{logs.length} archived entries</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </>
          )}

          {/* Tab 2: Master Timetable */}
          {activeTab === 'schedule' && (
            <TimetableTabContent
              currentFacultyName={employeeName}
              onSelectFaculty={(name) => handleSelectFaculty(name)}
              onApplySlotToToday={(slotId, text) => {
                handleApplyScheduleHint(slotId, text);
                setActiveTab('tracker');
              }}
              onSwitchToTracker={() => setActiveTab('tracker')}
            />
          )}

          {/* Tab 3: Submissions History & Reports */}
          {activeTab === 'history' && (
            <SubmissionsHistoryTabContent
              logs={logs}
              isAdmin={Boolean(hodAdminEmail && isEmailAuthorized(hodAdminEmail))}
              onViewReport={(log) => handlePrintIndividualLog(log)}
              onPrintLog={(log) => handlePrintIndividualLog(log)}
              onSyncLog={(log) => handleSyncLogToSheets(log)}
            />
          )}

          {/* Tab 4: HoD & Administrative Portal */}
          {activeTab === 'hod' && (
            !hodAdminEmail ? (
              /* HoD Protected Access Gate */
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm text-center space-y-4 my-6 max-w-md mx-auto relative">
                {/* Top-Right Close Button for immediate exit if opened by mistake */}
                <button
                  type="button"
                  onClick={() => setActiveTab('tracker')}
                  className="absolute top-3.5 right-3.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer border border-transparent hover:border-slate-200 shadow-2xs"
                  title="Close and return to Faculty Tracker"
                  aria-label="Close and return to Faculty Tracker"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
                  <FileCheck2 className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">HoD & Administrative Access</h2>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Access to departmental approvals, verification, and Google Sheets integration setup is restricted to verified administrators via Google Firebase.
                  </p>
                </div>

                {/* Authorized Roles Notice (no emails displayed) */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 text-left space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Authorized Roles Only</span>
                  </div>
                  <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-0.5">
                    <li>Head of Department (HoD)</li>
                    <li>Systems & Software Developer (Dev)</li>
                    <li>Assistant Head of Department (AHoD)</li>
                  </ul>
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsHodAuthModalOpen(true)}
                    className="w-full min-h-[48px] px-4 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2.5"
                  >
                    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3" viewBox="0 0 24 24">
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
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('tracker')}
                    className="w-full min-h-[48px] px-4 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 border border-slate-200 shadow-2xs"
                  >
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                    <span>Close &amp; Return to Faculty Tracker</span>
                  </button>
                </div>
              </div>
            ) : (
              /* HoD Dashboard View */
              <HodDashboardView
                logs={logs}
                adminEmail={hodAdminEmail}
                onLogoutHod={handleHodLogout}
                onUpdateLogStatus={handleUpdateLogStatus}
                onPrintLog={handlePrintIndividualLog}
                onPrintDailySummary={handlePrintDailySummary}
                onRestoreSamples={handleRestoreSamples}
                onOpenGoogleSheetsSettings={() => setIsSheetsModalOpen(true)}
                onSyncLogToSheets={handleSyncLogToSheets}
                isGoogleSheetsConfigured={Boolean(googleSheetsUrl.trim())}
                googleSheetsUrl={googleSheetsUrl}
              />
            )
          )}
        </main>

        {/* Sticky Thumb-Friendly Bottom Action Bar (in Tracker mode) */}
        {activeTab === 'tracker' && (
          <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center pointer-events-none p-3 pb-4">
            <div className="w-full max-w-xl bg-white/95 backdrop-blur-md rounded-2xl border border-slate-300/80 shadow-2xl p-2.5 flex items-center gap-2 pointer-events-auto">
              {/* Reset entries button */}
              <button
                type="button"
                onClick={handleResetCurrentActivities}
                className="w-12 min-h-[48px] rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer shrink-0"
                title="Reset draft activities for this date"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Sheets Settings Button (STRICTLY for logged-in Admin/HoD only) */}
              {Boolean(hodAdminEmail && isEmailAuthorized(hodAdminEmail)) && (
                <button
                  type="button"
                  onClick={() => setIsSheetsModalOpen(true)}
                  className={`w-12 min-h-[48px] rounded-xl flex items-center justify-center border transition-colors cursor-pointer shrink-0 ${
                    isGoogleSheetsConfigured
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                  }`}
                  title="Google Sheets Sync Settings (Admin Only)"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                </button>
              )}

              {/* Print / Export Report Button */}
              <button
                type="button"
                onClick={handleOpenPrintReport}
                className="min-h-[48px] px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
                title="Print official report"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">PDF</span>
              </button>

              {/* Main Thumb Action: Save Log & Sync */}
              <button
                id="submit-todays-log-button"
                type="button"
                disabled={isSubmittingToSheets}
                onClick={handleSaveLog}
                className="min-h-[48px] flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 disabled:opacity-75 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer px-3"
              >
                {isSubmittingToSheets ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span className="truncate">Syncing to Sheets...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Save Log &amp; Sync ({filledSlotsCount}/{BASE_TIME_SLOTS.length} Slots)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Toast Feedback Notification */}
        {toastMessage && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-in fade-in slide-in-from-top-2 duration-200">
            <div
              className={`p-3.5 rounded-2xl shadow-xl border text-xs font-semibold flex items-start justify-between gap-2.5 ${
                toastMessage.type === 'success'
                  ? 'bg-slate-900 text-white border-slate-700 shadow-emerald-950/20'
                  : toastMessage.type === 'error'
                  ? 'bg-rose-950 text-rose-100 border-rose-800 shadow-rose-950/20'
                  : 'bg-slate-900 text-slate-100 border-blue-600 shadow-blue-950/20'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                {toastMessage.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : toastMessage.type === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <CloudUpload className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="leading-relaxed break-words text-[12px]">{toastMessage.text}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 self-start">
                {toastMessage.link && (
                  <a
                    href={toastMessage.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-[11px] shrink-0 inline-flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <span>{toastMessage.linkText || 'Open'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setToastMessage(null)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Dismiss notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Google Sheets Settings & Apps Script Modal */}
        <GoogleSheetsSettingsModal
          isOpen={isSheetsModalOpen}
          onClose={() => setIsSheetsModalOpen(false)}
          logs={logs}
          currentFacultyName={employeeName.trim()}
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

        {/* HoD Admin Authentication Gate Modal */}
        <HodAuthModal
          isOpen={isHodAuthModalOpen}
          onClose={() => {
            setIsHodAuthModalOpen(false);
            setPendingAdminAction(null);
            if (activeTab === 'hod' && !hodAdminEmail) {
              setActiveTab('tracker');
            }
          }}
          onSuccessLogin={handleHodLoginSuccess}
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
