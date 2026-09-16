import React, { useState, useMemo } from 'react';
import { ActivityLog } from '../types';
import {
  extractStructuredDutyRecords,
  determineSectionCategory,
  exportMultiTabGrandExcel,
  CLASS_REPORT_SECTIONS,
  FlattenedDutyRecord,
} from '../utils/excelExport';
import {
  FileSpreadsheet,
  Download,
  X,
  Printer,
  Calendar,
  Layers,
  Users,
  CheckCircle2,
} from 'lucide-react';

interface GrandReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ActivityLog[];
  initialDate?: string;
}

export const GrandReportPreviewModal: React.FC<GrandReportPreviewModalProps> = ({
  isOpen,
  onClose,
  logs,
  initialDate,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || todayStr);
  const [filterMode, setFilterMode] = useState<'selected_date' | 'all_dates'>('selected_date');

  const distinctDates = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => {
      if (l.date) set.add(l.date);
    });
    return Array.from(set).sort().reverse();
  }, [logs]);

  const activeLogs = useMemo(() => {
    if (filterMode === 'all_dates') return logs;
    return logs.filter((l) => l.date === selectedDate);
  }, [logs, selectedDate, filterMode]);

  const flattenedRecords = useMemo(() => {
    return extractStructuredDutyRecords(activeLogs);
  }, [activeLogs]);

  // Group by sections
  const groupedSections = useMemo(() => {
    const groups: { title: string; records: FlattenedDutyRecord[] }[] = [];

    CLASS_REPORT_SECTIONS.forEach((secTitle) => {
      const recs = flattenedRecords.filter((r) => r.sectionCategory === secTitle);
      if (recs.length > 0) {
        groups.push({ title: secTitle, records: recs });
      }
    });

    return groups;
  }, [flattenedRecords]);

  // Count distinct faculty
  const facultyCount = useMemo(() => {
    const set = new Set<string>();
    activeLogs.forEach((l) => set.add(l.employeeName.trim()));
    return set.size;
  }, [activeLogs]);

  const handleExportExcel = () => {
    exportMultiTabGrandExcel(activeLogs, {
      targetDate: filterMode === 'selected_date' ? selectedDate : undefined,
      filename: `Matrusri_IT_Dept_Grand_Report_${filterMode === 'selected_date' ? selectedDate : 'All_Dates'}.xlsx`,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="truncate">
              <h2 className="text-sm sm:text-base font-bold tracking-tight truncate">
                Grand Daily Activity Register (Excel Master Format)
              </h2>
              <p className="text-[11px] text-slate-400 truncate">
                Official layout with Grand Tab + separate teacher tabs matching departmental format
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-95"
              title="Download full Excel Workbook with all tabs"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Excel (.xlsx)</span>
              <span className="sm:hidden">Excel</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Print view"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Report Date:</span>
            </span>

            <select
              value={filterMode === 'all_dates' ? 'ALL' : selectedDate}
              onChange={(e) => {
                if (e.target.value === 'ALL') {
                  setFilterMode('all_dates');
                } else {
                  setFilterMode('selected_date');
                  setSelectedDate(e.target.value);
                }
              }}
              className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              <option value="ALL">All Recorded Dates (Consolidated)</option>
              {distinctDates.map((d) => (
                <option key={d} value={d}>
                  {d} {d === todayStr ? '(Today)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-600">
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-lg font-semibold">
              <Users className="w-3 h-3 text-blue-600" />
              <span>{facultyCount} Faculty Members</span>
            </span>
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded-lg font-semibold">
              <Layers className="w-3 h-3 text-emerald-600" />
              <span>{flattenedRecords.length} Duty Slots Logged</span>
            </span>
          </div>
        </div>

        {/* Spreadsheet Table Viewport */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-100/70">
          <div className="bg-white rounded-xl border border-slate-300 shadow-xs overflow-hidden max-w-full text-[11px]">
            {/* Sheet Tabs Header Visual */}
            <div className="bg-slate-200 px-3 py-1.5 border-b border-slate-300 flex items-center gap-1 overflow-x-auto text-[11px]">
              <span className="px-3 py-1 bg-white font-bold text-slate-900 rounded-t-lg border-t-2 border-emerald-600 shadow-2xs shrink-0 flex items-center gap-1">
                <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                <span>Grand_Daily_Report</span>
              </span>
              <span className="text-[10px] text-slate-500 italic px-2 shrink-0">
                + {facultyCount} individual faculty tabs in exported .xlsx workbook
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left font-sans">
                <tbody>
                  {/* Top Banner Row 1: College Name */}
                  <tr>
                    <td
                      colSpan={9}
                      className="py-2 px-4 text-center font-bold text-slate-900 text-xs sm:text-sm tracking-wide border border-rose-200"
                      style={{ backgroundColor: '#F8CECC' }}
                    >
                      Matrusri Engineering College
                    </td>
                  </tr>

                  {/* Top Banner Row 2: Department */}
                  <tr>
                    <td
                      colSpan={9}
                      className="py-1.5 px-4 text-center font-semibold text-slate-800 text-xs border border-rose-200"
                      style={{ backgroundColor: '#F8CECC' }}
                    >
                      Department of Information Technology
                    </td>
                  </tr>

                  {/* Column Headers (Row 4 in Excel) */}
                  <tr style={{ backgroundColor: '#B4D5E6' }} className="text-slate-900 font-bold border-b border-slate-300">
                    <th className="py-2 px-2 text-center border border-slate-300 w-12">SNO</th>
                    <th className="py-2 px-2.5 text-center border border-slate-300 w-20">Date</th>
                    <th className="py-2 px-3 border border-slate-300 w-44">Name of the Faculty</th>
                    <th className="py-2 px-2 text-center border border-slate-300 w-20">Section</th>
                    <th className="py-2 px-3 border border-slate-300 w-32">Course Name</th>
                    <th className="py-2 px-2 text-center border border-slate-300 w-16">credits</th>
                    <th className="py-2 px-2 text-center border border-slate-300 w-20">Class Hour</th>
                    <th className="py-2 px-2 text-center border border-slate-300 w-20">Unit No</th>
                    <th className="py-2 px-3 border border-slate-300 min-w-[240px]">Topic Name</th>
                  </tr>

                  {/* Empty Spacer */}
                  <tr className="h-2 bg-white">
                    <td colSpan={9} className="border-x border-slate-200"></td>
                  </tr>

                  {/* Render Section Groups */}
                  {groupedSections.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-500 italic">
                        No activity records found for this date. Use the date selector above or submit logs in the Faculty Tracker.
                      </td>
                    </tr>
                  ) : (
                    groupedSections.map((group, gIdx) => {
                      const isSectionB = group.title.includes('B CLASS REPORT');
                      const showSectionBHeader = isSectionB && (gIdx === 0 || !groupedSections[gIdx - 1].title.includes('B CLASS REPORT'));

                      return (
                        <React.Fragment key={group.title}>
                          {/* Repeat headers for Section B as shown in original image row 25 */}
                          {showSectionBHeader && (
                            <>
                              <tr className="h-3 bg-white">
                                <td colSpan={9} className="border-x border-slate-200"></td>
                              </tr>
                              <tr style={{ backgroundColor: '#B4D5E6' }} className="text-slate-900 font-bold border-b border-slate-300">
                                <th className="py-1.5 px-2 text-center border border-slate-300">SNO</th>
                                <th className="py-1.5 px-2.5 text-center border border-slate-300">Date</th>
                                <th className="py-1.5 px-3 border border-slate-300">Name of the Faculty</th>
                                <th className="py-1.5 px-2 text-center border border-slate-300">Section</th>
                                <th className="py-1.5 px-3 border border-slate-300">Course Name</th>
                                <th className="py-1.5 px-2 text-center border border-slate-300">credits</th>
                                <th className="py-1.5 px-2 text-center border border-slate-300">Class Hour</th>
                                <th className="py-1.5 px-2 text-center border border-slate-300">Unit No</th>
                                <th className="py-1.5 px-3 border border-slate-300">Topic Name</th>
                              </tr>
                            </>
                          )}

                          {/* Section Header Banner */}
                          <tr>
                            <td
                              colSpan={9}
                              className="py-1.5 px-3 text-center font-bold text-slate-900 border border-slate-300 tracking-wider text-[11px] uppercase"
                              style={{ backgroundColor: '#FAD2CF' }}
                            >
                              {group.title}
                            </td>
                          </tr>

                          {/* Data Rows under Section */}
                          {group.records.map((rec, rIdx) => (
                            <tr
                              key={`${group.title}_${rIdx}`}
                              className="hover:bg-slate-50 transition-colors border-b border-slate-200"
                            >
                              <td className="py-1.5 px-2 text-center border border-slate-300 font-mono text-slate-700">
                                {rIdx + 1}
                              </td>
                              <td className="py-1.5 px-2.5 text-center border border-slate-300 whitespace-nowrap text-slate-700">
                                {rec.date}
                              </td>
                              <td className="py-1.5 px-3 border border-slate-300 font-semibold text-slate-900">
                                {rec.facultyName}
                              </td>
                              <td className="py-1.5 px-2 text-center border border-slate-300 text-slate-800 font-medium">
                                {rec.section}
                              </td>
                              <td className="py-1.5 px-3 border border-slate-300 font-semibold text-slate-900">
                                {rec.courseName}
                              </td>
                              <td className="py-1.5 px-2 text-center border border-slate-300 text-slate-700">
                                {rec.credits}
                              </td>
                              <td className="py-1.5 px-2 text-center border border-slate-300 font-mono text-slate-700">
                                {rec.classHour}
                              </td>
                              <td className="py-1.5 px-2 text-center border border-slate-300 text-slate-700">
                                {rec.unitNo}
                              </td>
                              <td className="py-1.5 px-3 border border-slate-300 text-slate-800">
                                {rec.topicName}
                              </td>
                            </tr>
                          ))}

                          {/* Spacer between groups */}
                          <tr className="h-2 bg-white">
                            <td colSpan={9} className="border-x border-slate-200"></td>
                          </tr>
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <div className="text-[11px] text-slate-500">
            Export generates an official <strong>.xlsx Excel Workbook</strong> with the <strong>Grand_Daily_Report</strong> master tab + <strong>individual tabs</strong> for each teacher.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Multi-Tab Excel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
