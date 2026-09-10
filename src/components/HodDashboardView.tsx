import React, { useState, useMemo } from 'react';
import { ActivityLog } from '../types';
import { BASE_TIME_SLOTS, getSlotTimeLabel } from '../constants';
import { FACULTY_DIRECTORY } from '../timetableData';
import { exportLogsToExcelCsv } from '../utils/googleSheets';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Printer,
  Calendar,
  FileCheck2,
  Check,
  MessageSquare,
  Sparkles,
  RotateCcw,
  BookOpen,
  FileSpreadsheet,
  FileDown,
  Settings,
  CloudUpload,
} from 'lucide-react';

interface HodDashboardViewProps {
  logs: ActivityLog[];
  onUpdateLogStatus: (
    logId: string,
    status: 'Approved' | 'Under Review' | 'Needs Clarification',
    remarks?: string
  ) => void;
  onPrintLog: (log: ActivityLog) => void;
  onPrintDailySummary: () => void;
  onRestoreSamples?: () => void;
  onOpenGoogleSheetsSettings?: () => void;
  onSyncLogToSheets?: (log: ActivityLog) => void;
  isGoogleSheetsConfigured?: boolean;
}

export const HodDashboardView: React.FC<HodDashboardViewProps> = ({
  logs,
  onUpdateLogStatus,
  onPrintLog,
  onPrintDailySummary,
  onRestoreSamples,
  onOpenGoogleSheetsSettings,
  onSyncLogToSheets,
  isGoogleSheetsConfigured = false,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Filters
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSemFilter, setSelectedSemFilter] = useState<'All' | 'III Sem' | 'V Sem' | 'VII Sem' | 'Programmer'>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'All' | 'Approved' | 'Pending Review'>('All');

  // Expanded card tracking
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Editable remarks state: logId -> text
  const [remarksState, setRemarksState] = useState<Record<string, string>>({});

  // Active faculty total count
  const totalFacultyCount = FACULTY_DIRECTORY.length + 3; // including technical staff

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Date filter (if selectedDate is set)
      if (selectedDate && log.date !== selectedDate) {
        return false;
      }

      // Search Query
      if (
        searchQuery &&
        !log.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !log.department.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Semester / Role Filter
      if (selectedSemFilter !== 'All') {
        if (selectedSemFilter === 'Programmer') {
          if (log.role !== 'Programmer') return false;
        } else {
          // Check if faculty has primary subjects in that semester or activities match
          const activitiesText = Object.values(log.activities).join(' ');
          if (!activitiesText.toLowerCase().includes(selectedSemFilter.toLowerCase())) {
            return false;
          }
        }
      }

      // Status filter
      if (selectedStatusFilter !== 'All') {
        if (selectedStatusFilter === 'Approved' && log.hodStatus !== 'Approved') return false;
        if (selectedStatusFilter === 'Pending Review' && log.hodStatus === 'Approved') return false;
      }

      return true;
    });
  }, [logs, selectedDate, searchQuery, selectedSemFilter, selectedStatusFilter]);

  // Today stats
  const todayLogs = useMemo(() => logs.filter((l) => l.date === todayStr), [logs, todayStr]);
  const todaySubmittedCount = todayLogs.length;
  const todayPendingCount = Math.max(0, totalFacultyCount - todaySubmittedCount);
  const approvedCount = todayLogs.filter((l) => l.hodStatus === 'Approved').length;
  const reviewCount = todayLogs.filter((l) => l.hodStatus !== 'Approved').length;

  const toggleExpand = (id: string) => {
    setExpandedLogId((prev) => (prev === id ? null : id));
  };

  const handleQuickApprove = (log: ActivityLog) => {
    const remark = remarksState[log.id] ?? log.hodRemarks ?? 'Reviewed and approved as per timetable.';
    onUpdateLogStatus(log.id, 'Approved', remark);
  };

  const handleRequestClarification = (log: ActivityLog) => {
    const remark = remarksState[log.id] ?? log.hodRemarks ?? 'Please clarify duties recorded for afternoon laboratory period.';
    onUpdateLogStatus(log.id, 'Needs Clarification', remark);
  };

  return (
    <div className="space-y-4">
      {/* Top HoD Status Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-800">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">HoD Administrative Overview</h2>
              <p className="text-[11px] text-slate-400">Department of Information Technology</p>
            </div>
          </div>

          <button
            onClick={onPrintDailySummary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs cursor-pointer transition-all active:scale-95"
            title="Download Daily HoD Sign-Off Sheet (PDF/Print)"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Daily Sign-Off PDF</span>
          </button>
        </div>

        {/* 3 Summary Bento Cards */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
          <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/60 text-center">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">
              Submitted Today
            </span>
            <div className="text-lg font-extrabold text-emerald-400 mt-0.5">
              {todaySubmittedCount} <span className="text-xs font-normal text-slate-400">/ {totalFacultyCount}</span>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/60 text-center">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">
              Approved
            </span>
            <div className="text-lg font-extrabold text-blue-400 mt-0.5">
              {approvedCount}
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/60 text-center">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">
              Pending Today
            </span>
            <div className="text-lg font-extrabold text-amber-400 mt-0.5">
              {todayPendingCount}
            </div>
          </div>
        </div>
      </div>

      {/* Google Sheets & Excel Export Status Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900">Google Sheets Integration</h3>
                {isGoogleSheetsConfigured ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    Live Sync Ready
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    Setup Required
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Registers each faculty member into their own dedicated sheet tab
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenGoogleSheetsSettings && (
              <button
                type="button"
                onClick={onOpenGoogleSheetsSettings}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-slate-500" />
                <span>Configure Web App URL</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => exportLogsToExcelCsv(filteredLogs)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
              title="Download filtered activity register as CSV file compatible with Excel"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Excel (.csv)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 space-y-2.5 shadow-2xs">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Filter Staff Submissions</span>
          </div>
          {onRestoreSamples && (
            <button
              onClick={onRestoreSamples}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Samples</span>
            </button>
          )}
        </div>

        {/* Date Selector & Search Input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Date Picker */}
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 text-xs font-semibold text-slate-800 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search faculty name..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Semester & Role Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {(['All', 'III Sem', 'V Sem', 'VII Sem', 'Programmer'] as const).map((sem) => (
            <button
              key={sem}
              onClick={() => setSelectedSemFilter(sem)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition-colors cursor-pointer ${
                selectedSemFilter === sem
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {sem}
            </button>
          ))}
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 text-xs pt-1 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Status:</span>
          {(['All', 'Pending Review', 'Approved'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatusFilter(st)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                selectedStatusFilter === st
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Submitted Staff Logs (Collapsible Cards) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-medium">
          <span>{filteredLogs.length} submissions found for {selectedDate || 'all dates'}</span>
          <span>Tap card to view hourly log</span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700">No logs for this filter</p>
            <p className="text-xs text-slate-400 mt-1">
              Select another date or tap "Reset Samples" above to populate realistic timetable submissions.
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const isApproved = log.hodStatus === 'Approved';
            const isNeedsClarification = log.hodStatus === 'Needs Clarification';

            return (
              <div
                key={log.id}
                className={`rounded-2xl border transition-all overflow-hidden bg-white shadow-2xs ${
                  isApproved
                    ? 'border-slate-200'
                    : isNeedsClarification
                    ? 'border-rose-300 ring-1 ring-rose-100'
                    : 'border-amber-300 ring-1 ring-amber-100'
                }`}
              >
                {/* Collapsible Card Header (Tap to Expand) */}
                <div
                  onClick={() => toggleExpand(log.id)}
                  className="p-3.5 cursor-pointer hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-2"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">
                        {log.employeeName}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                          log.role === 'Faculty'
                            ? 'bg-blue-100 text-blue-900 border border-blue-200'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        }`}
                      >
                        {log.role}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {log.department}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5">
                      <span className="font-semibold text-slate-700">{log.date}</span>
                      <span>•</span>
                      <span>{log.totalFilledSlots}/7 slots logged</span>
                    </div>
                  </div>

                  {/* Status chip & toggle arrow */}
                  <div className="flex items-center gap-2 shrink-0 pt-0.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isApproved
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : isNeedsClarification
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      {log.hodStatus || 'Under Review'}
                    </span>

                    <button
                      type="button"
                      className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Hourly Timeline View */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-4 animate-in fade-in-50 duration-150">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900 pb-1 border-b border-slate-200">
                        <span>Hourly Duty Timeline</span>
                        <span className="text-[11px] text-slate-500 font-normal">
                          Submitted at: {new Date(log.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Stack of hourly logged entries */}
                      <div className="space-y-2 pt-1">
                        {BASE_TIME_SLOTS.map((slot, sIdx) => {
                          const timeLabel = getSlotTimeLabel(slot, log.role);
                          const text = log.activities[slot.id];

                          if (slot.isLunchBreak) {
                            return (
                              <div
                                key={slot.id}
                                className="px-3 py-1.5 rounded-xl bg-amber-100/60 border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between"
                              >
                                <span className="font-semibold">{timeLabel}</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider">Lunch Break</span>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={slot.id}
                              className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1 shadow-2xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                  <span className="w-5 h-5 rounded-md bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">
                                    {sIdx + 1}
                                  </span>
                                  {timeLabel}
                                </span>
                                {slot.isClosingSlot && (
                                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                    Closing Duty
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-700 text-xs leading-relaxed pl-6">
                                {text ? text : <span className="text-slate-400 italic">No activity entered</span>}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* HoD Action & Remarks Section */}
                    <div className="pt-3 border-t border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                          <span>Head of Department Review & Remarks</span>
                        </span>
                      </div>

                      <textarea
                        rows={2}
                        value={remarksState[log.id] ?? log.hodRemarks ?? ''}
                        onChange={(e) =>
                          setRemarksState((prev) => ({ ...prev, [log.id]: e.target.value }))
                        }
                        placeholder="Type formal remarks or instructions to staff member..."
                        className="w-full p-2.5 text-xs text-slate-900 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                      />

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onPrintLog(log)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 cursor-pointer shadow-2xs"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-500" />
                            <span>Print Individual Sheet</span>
                          </button>

                          {onSyncLogToSheets && (
                            <button
                              onClick={() => onSyncLogToSheets(log)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 cursor-pointer"
                              title="Send this log to Google Sheets"
                            >
                              <CloudUpload className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Push to Sheets</span>
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleRequestClarification(log)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 cursor-pointer"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Clarify</span>
                          </button>

                          <button
                            onClick={() => handleQuickApprove(log)}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs cursor-pointer active:scale-95"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Approve Log</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
