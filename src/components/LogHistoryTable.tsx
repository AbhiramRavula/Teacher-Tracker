import React, { useState } from 'react';
import { ActivityLog } from '../types';
import { History, Eye, Printer, Trash2, Search, Calendar, Briefcase, FileSpreadsheet, PlusCircle } from 'lucide-react';

interface LogHistoryTableProps {
  logs: ActivityLog[];
  onLoadLog: (log: ActivityLog) => void;
  onViewReport: (log: ActivityLog) => void;
  onDeleteLog: (id: string) => void;
  onClearAll: () => void;
  onLoadSample: () => void;
  onRestoreSamples?: () => void;
}

export const LogHistoryTable: React.FC<LogHistoryTableProps> = ({
  logs,
  onLoadLog,
  onViewReport,
  onDeleteLog,
  onClearAll,
  onLoadSample,
  onRestoreSamples,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'Faculty' | 'Programmer'>('All');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.date.includes(searchTerm) ||
      (log.department && log.department.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'All' || log.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div id="local-history-section" className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Header & Controls */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <History className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900 leading-none">Saved Activity Log History</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {logs.length} Records
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Local archive of Matrusri IT Department activity logs with HoD scrutiny status
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onRestoreSamples && (
            <button
              onClick={onRestoreSamples}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200 transition-colors cursor-pointer"
              title="Reset history to authentic Matrusri Engineering College IT timetable sample logs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Load Timetable Samples</span>
            </button>
          )}

          {logs.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs text-slate-500 hover:text-rose-600 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
            >
              Clear All Logs
            </button>
          )}

          {logs.length === 0 && !onRestoreSamples && (
            <button
              onClick={onLoadSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium border border-blue-200 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Load Sample Log
            </button>
          )}
        </div>
      </div>

      {/* Filter bar */}
      {logs.length > 0 && (
        <div className="px-5 py-3 bg-slate-50/60 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, date, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs text-slate-600">
            <span className="text-[11px] text-slate-400 font-medium">Filter Role:</span>
            {(['All', 'Faculty', 'Programmer'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  roleFilter === r
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto">
        {filteredLogs.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-[1.5]" />
            <p className="text-sm font-medium text-slate-600">
              {logs.length === 0 ? 'No activity logs saved yet' : 'No logs match your search filter'}
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {logs.length === 0
                ? 'Fill out your employee details and time slot entries above, then click "Save Log" to record it here.'
                : 'Try adjusting your search terms or clearing the filter.'}
            </p>
            {logs.length === 0 && (
              <button
                onClick={onLoadSample}
                className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-medium rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                Populate with a Sample Activity Log
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-100">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-center">Active Slots Logged</th>
                <th className="py-3 px-4">Saved Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => {
                const filledCount = Object.values(log.activities).filter((txt): txt is string => typeof txt === 'string' && txt.trim().length > 0).length;

                return (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {log.date}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{log.employeeName}</div>
                      {log.department && (
                        <div className="text-[11px] text-slate-400">{log.department}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                          log.role === 'Faculty'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {log.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                        {filledCount} / 7 slots
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                      {new Date(log.savedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                      {new Date(log.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onLoadLog(log)}
                          title="Load this log into editor"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-slate-500" />
                          <span>Load</span>
                        </button>
                        <button
                          onClick={() => onViewReport(log)}
                          title="View and Print HoD Report"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors cursor-pointer"
                        >
                          <Printer className="w-3 h-3 text-blue-600" />
                          <span>HoD Report</span>
                        </button>
                        <button
                          onClick={() => onDeleteLog(log.id)}
                          title="Delete entry"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
