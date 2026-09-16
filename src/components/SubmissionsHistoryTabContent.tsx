import React, { useState } from 'react';
import { ActivityLog } from '../types';
import {
  History,
  FileSpreadsheet,
  Search,
  Calendar,
  User,
  Printer,
  ExternalLink,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  Download,
  UploadCloud,
} from 'lucide-react';
import { exportMultiTabGrandExcel } from '../utils/excelExport';
import { getStoredSpreadsheetId } from '../utils/googleSheets';

interface SubmissionsHistoryTabContentProps {
  logs: ActivityLog[];
  isAdmin: boolean;
  onViewReport: (log: ActivityLog) => void;
  onPrintLog: (log: ActivityLog) => void;
  onSyncLog?: (log: ActivityLog) => Promise<void> | void;
}

export const SubmissionsHistoryTabContent: React.FC<SubmissionsHistoryTabContentProps> = ({
  logs,
  isAdmin,
  onViewReport,
  onPrintLog,
  onSyncLog,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'synced' | 'local'>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  const spreadsheetId = getStoredSpreadsheetId();
  const globalSheetUrl = spreadsheetId
    ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
    : undefined;

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.date.includes(searchTerm) ||
      (log.department && log.department.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType =
      filterType === 'all'
        ? true
        : filterType === 'synced'
        ? Boolean(log.sheetsSynced)
        : !log.sheetsSynced;

    const matchesDate = selectedDate ? log.date === selectedDate : true;

    return matchesSearch && matchesType && matchesDate;
  });

  const syncedCount = logs.filter((l) => l.sheetsSynced).length;
  const unsyncedLogs = logs.filter((l) => !l.sheetsSynced);

  const handleSyncAll = async () => {
    if (!onSyncLog || unsyncedLogs.length === 0 || isSyncingAll) return;
    setIsSyncingAll(true);
    try {
      for (const log of unsyncedLogs) {
        setSyncingId(log.id);
        await onSyncLog(log);
        // Small rate-limit safety pause between sequential sheet syncs
        await new Promise((r) => setTimeout(r, 1200));
      }
    } finally {
      setSyncingId(null);
      setIsSyncingAll(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Banner & Stats */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                Department Activity Submissions
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {logs.length} Records
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified records with live status, one-click sheet sync, and multi-tab Excel export
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onSyncLog && unsyncedLogs.length > 0 && (
            <button
              type="button"
              disabled={isSyncingAll}
              onClick={handleSyncAll}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Push all unsynced submissions directly to Google Sheets"
            >
              <UploadCloud className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-bounce' : ''}`} />
              <span>{isSyncingAll ? 'Syncing...' : `Sync All Unsynced (${unsyncedLogs.length})`}</span>
            </button>
          )}

          {globalSheetUrl && (
            <a
              href={globalSheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer"
              title="Open the connected department Google Spreadsheet"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Open Google Sheet</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => exportMultiTabGrandExcel(logs)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Download multi-tab Excel workbook with Grand Report and faculty tabs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Text search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search faculty name, activity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter by sync status */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`flex-1 py-1 text-center font-bold rounded-lg transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All ({logs.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('synced')}
              className={`flex-1 py-1 text-center font-bold rounded-lg transition-colors cursor-pointer ${
                filterType === 'synced'
                  ? 'bg-white text-emerald-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sheets Synced ({syncedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('local')}
              className={`flex-1 py-1 text-center font-bold rounded-lg transition-colors cursor-pointer ${
                filterType === 'local'
                  ? 'bg-white text-amber-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Local ({logs.length - syncedCount})
            </button>
          </div>

          {/* Date filter */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate('')}
                className="px-2.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Log items list */}
      <div className="space-y-2.5">
        {filteredLogs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 text-xs">
            No activity submissions match the current filters.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isSynced = Boolean(log.sheetsSynced);
            const cardSheetUrl = log.sheetsSpreadsheetUrl || globalSheetUrl;
            return (
              <div
                key={log.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:border-blue-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {log.employeeName}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {log.role}
                    </span>

                    {/* Sync Status Badge */}
                    {isSynced ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>
                          {log.sheetsSyncedMethod === 'apps_script'
                            ? 'Apps Script Synced'
                            : 'Direct Sheet Synced'}
                        </span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Local Device Storage</span>
                      </span>
                    )}

                    {log.sheetsTargetTab && (
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                        Tab: {log.sheetsTargetTab}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <strong>{log.date}</strong>
                    </span>
                    <span>•</span>
                    <span>{log.totalFilledSlots || 0} / 7 periods filled</span>
                    <span>•</span>
                    <span>{log.department}</span>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 flex-wrap">
                  {/* Re-sync / Sync button accessible to all users */}
                  {onSyncLog && (
                    <button
                      type="button"
                      disabled={syncingId === log.id || isSyncingAll}
                      onClick={async () => {
                        setSyncingId(log.id);
                        try {
                          await onSyncLog(log);
                        } finally {
                          setSyncingId(null);
                        }
                      }}
                      className={`px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer flex items-center gap-1 ${
                        isSynced
                          ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                      }`}
                      title={
                        isSynced
                          ? 'Force re-sync this log directly to Google Sheet tab'
                          : 'Sync this log directly to Google Sheets'
                      }
                    >
                      <RefreshCw
                        className={`w-3 h-3 ${syncingId === log.id ? 'animate-spin text-blue-600' : ''}`}
                      />
                      <span>
                        {syncingId === log.id ? 'Syncing...' : isSynced ? 'Re-sync' : 'Sync to Sheets'}
                      </span>
                    </button>
                  )}

                  {cardSheetUrl && (
                    <a
                      href={cardSheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 transition-colors cursor-pointer flex items-center justify-center"
                      title="Open Google Sheet in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => onViewReport(log)}
                    className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                    title="View Full Report"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onPrintLog(log)}
                    className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                    title="Print Individual Sheet"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
