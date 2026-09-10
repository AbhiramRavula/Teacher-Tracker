import React from 'react';
import { ActivityLog } from '../types';
import { BASE_TIME_SLOTS, getSlotTimeLabel } from '../constants';

interface HodReportDocumentProps {
  log?: ActivityLog | null;
  dailyLogs?: ActivityLog[];
  reportDate?: string;
}

export const HodReportDocument: React.FC<HodReportDocumentProps> = ({
  log,
  dailyLogs,
  reportDate,
}) => {
  // 1. Consolidated Departmental Daily Sign-Off Summary Sheet
  if (dailyLogs && dailyLogs.length > 0) {
    const formattedDate = reportDate
      ? new Date(reportDate + 'T00:00:00').toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'Today';

    return (
      <div className="bg-white p-8 sm:p-12 text-slate-900 font-sans max-w-5xl mx-auto">
        {/* Institutional Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center">
          <div className="inline-block px-3 py-1 bg-slate-900 text-white text-[11px] font-bold tracking-wider uppercase rounded mb-2">
            Matrusri Engineering College • Department of Information Technology
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
            DEPARTMENTAL DAILY ACTIVITY & SCRUTINY SUMMARY
          </h1>
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mt-1">
            Official Master Sign-Off Sheet for Principal / Academic Dean Review
          </p>
          <div className="flex items-center justify-between text-xs text-slate-600 mt-3 pt-2 border-t border-slate-200 px-2">
            <span><strong>Date:</strong> {formattedDate}</span>
            <span><strong>Total Submissions:</strong> {dailyLogs.length} Staff Members</span>
            <span><strong>Status:</strong> Scrutinized by Head of Department</span>
          </div>
        </div>

        {/* Master Table of Staff Daily Submissions */}
        <div className="mb-6">
          <div className="border border-slate-400 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-400 text-slate-900">
                  <th className="py-2.5 px-3 font-bold w-10 text-center border-r border-slate-300">#</th>
                  <th className="py-2.5 px-3 font-bold w-48 border-r border-slate-300">Staff Name & Role</th>
                  <th className="py-2.5 px-3 font-bold border-r border-slate-300">Hourly Activities Summary</th>
                  <th className="py-2.5 px-3 font-bold w-24 text-center border-r border-slate-300">Slots Logged</th>
                  <th className="py-2.5 px-3 font-bold w-28 text-center">HoD Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {dailyLogs.map((item, idx) => {
                  const activities = Object.entries(item.activities)
                    .filter(([k, v]) => typeof v === 'string' && v.trim().length > 0 && k !== 'slot_lunch')
                    .map(([slotId, text]) => {
                      const slotObj = BASE_TIME_SLOTS.find((s) => s.id === slotId);
                      const tLabel = slotObj ? getSlotTimeLabel(slotObj, item.role) : slotId;
                      return `${tLabel}: ${text}`;
                    });

                  return (
                    <tr key={item.id} className="page-break-avoid">
                      <td className="py-2.5 px-3 text-center border-r border-slate-300 font-bold text-slate-700">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-300 align-top">
                        <div className="font-bold text-slate-900 uppercase text-[11px]">
                          {item.employeeName}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                          {item.role} • {item.department}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-300 text-[11px] text-slate-800 leading-relaxed align-top">
                        <ul className="list-disc pl-3.5 space-y-1">
                          {activities.slice(0, 4).map((act, aIdx) => (
                            <li key={aIdx}>{act}</li>
                          ))}
                          {activities.length > 4 && (
                            <li className="text-slate-500 italic">
                              + {activities.length - 4} additional periods registered
                            </li>
                          )}
                        </ul>
                        {item.hodRemarks && (
                          <div className="mt-1.5 p-1 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600">
                            <strong>HoD Remarks:</strong> {item.hodRemarks}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center border-r border-slate-300 align-top font-bold text-slate-700">
                        {item.totalFilledSlots} / 7
                      </td>
                      <td className="py-2.5 px-3 text-center align-top">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold border border-slate-400 bg-slate-50 text-slate-800">
                          {item.hodStatus || 'Approved'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Verification and Signatures */}
        <div className="grid grid-cols-2 gap-16 pt-8 border-t border-slate-400 page-break-avoid">
          <div className="text-center">
            <div className="border-b border-slate-500 h-16 mb-2 flex items-end justify-center pb-1">
              <span className="font-serif italic text-slate-800 text-sm font-semibold">Academic In-Charge</span>
            </div>
            <p className="text-xs font-bold text-slate-900">Academic Coordinator</p>
            <p className="text-[11px] text-slate-600 mt-0.5">Timetable & Pacing Verification</p>
          </div>

          <div className="text-center">
            <div className="border-b border-slate-500 h-16 mb-2 flex items-end justify-center pb-1">
              <span className="font-serif italic text-slate-800 text-sm font-semibold">Head of Department (HoD)</span>
            </div>
            <p className="text-xs font-bold text-slate-900">Head of Department</p>
            <p className="text-[11px] text-slate-600 mt-0.5">Department of Information Technology</p>
          </div>
        </div>

        {/* Document Footer */}
        <div className="mt-8 pt-3 border-t border-slate-300 text-center text-[10px] text-slate-500">
          Matrusri Engineering College • Department of Information Technology • Master Activity Archives
        </div>
      </div>
    );
  }

  // 2. Individual Staff Daily Activity Report
  if (!log) {
    return (
      <div className="p-8 text-center text-slate-400">
        No log selected for printing.
      </div>
    );
  }

  const formattedDate = log.date
    ? new Date(log.date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not Specified';

  return (
    <div className="bg-white p-8 sm:p-12 text-slate-900 font-sans max-w-4xl mx-auto">
      {/* Institutional Header */}
      <div className="border-b-2 border-slate-900 pb-5 mb-6 text-center">
        <div className="inline-block px-3 py-1 bg-slate-900 text-white text-[11px] font-bold tracking-wider uppercase rounded mb-2">
          Matrusri Engineering College • Department of Information Technology
        </div>
        <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
          FACULTY & STAFF DAILY ACTIVITY REPORT
        </h1>
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mt-1">
          Submitted for Scrutiny & Verification by Head of Department (HoD)
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          Ref Code: DAR-{log.date ? log.date.replace(/-/g, '') : 'NA'}-{log.id.slice(0, 6).toUpperCase()}
        </p>
      </div>

      {/* Metadata Box */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-300 mb-6 text-xs">
        <div>
          <span className="block text-[11px] uppercase tracking-wider text-slate-500 font-medium">
            Employee Name
          </span>
          <span className="text-sm font-bold text-slate-900 block mt-0.5">
            {log.employeeName || 'Unspecified'}
          </span>
        </div>
        <div>
          <span className="block text-[11px] uppercase tracking-wider text-slate-500 font-medium">
            Designation / Role
          </span>
          <span className="inline-block mt-0.5 px-2 py-0.5 text-xs font-bold rounded bg-slate-200 text-slate-900 border border-slate-300">
            {log.role}
          </span>
        </div>
        <div>
          <span className="block text-[11px] uppercase tracking-wider text-slate-500 font-medium">
            Date of Activity
          </span>
          <span className="text-xs font-semibold text-slate-800 block mt-0.5">
            {formattedDate}
          </span>
        </div>
        <div>
          <span className="block text-[11px] uppercase tracking-wider text-slate-500 font-medium">
            Department / Unit
          </span>
          <span className="text-xs font-semibold text-slate-800 block mt-0.5">
            {log.department || 'Academic & Tech Operations'}
          </span>
        </div>
      </div>

      {/* Structured Activity Log Table */}
      <div className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
          1. Itemized Schedule of Work Undertaken
        </h2>

        <div className="border border-slate-400 rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-400 text-slate-800">
                <th className="py-2.5 px-3 font-bold w-12 text-center border-r border-slate-300">S.No</th>
                <th className="py-2.5 px-3 font-bold w-48 border-r border-slate-300">Time Interval</th>
                <th className="py-2.5 px-4 font-bold">Activity Description & Key Deliverables</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {BASE_TIME_SLOTS.map((slot, idx) => {
                const timeStr = getSlotTimeLabel(slot, log.role);
                const actText = log.activities[slot.id] || '';

                if (slot.isLunchBreak) {
                  return (
                    <tr key={slot.id} className="bg-slate-50 text-slate-700">
                      <td className="py-2.5 px-3 text-center border-r border-slate-300 font-medium text-slate-400">
                        -
                      </td>
                      <td className="py-2.5 px-3 font-semibold border-r border-slate-300 whitespace-nowrap">
                        {timeStr}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 italic">
                        Lunch Break / Mid-Day Recess (Institutional Recess Period)
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={slot.id} className="page-break-avoid">
                    <td className="py-3 px-3 text-center border-r border-slate-300 font-semibold text-slate-700">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3 border-r border-slate-300 font-bold text-slate-800 whitespace-nowrap align-top">
                      {timeStr}
                      {slot.isClosingSlot && (
                        <span className="block text-[10px] text-blue-700 font-normal mt-0.5">
                          (Closing Duty - {log.role})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-900 leading-relaxed align-top">
                      {actText ? (
                        <span className="whitespace-pre-wrap">{actText}</span>
                      ) : (
                        <span className="text-slate-400 italic">No entry recorded for this period</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* HoD Review & Endorsement Box */}
      <div className="border border-slate-400 rounded-lg p-4 bg-slate-50 mb-8 page-break-avoid">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
          2. Head of Department (HoD) Scrutiny & Remarks
        </h2>

        <div className="min-h-[50px] text-xs text-slate-800 mb-3 border-b border-dashed border-slate-300 pb-2">
          {log.hodRemarks ? (
            <p className="italic">"{log.hodRemarks}"</p>
          ) : (
            <p className="text-slate-400 italic">
              Routine daily duties verified and found consistent with institutional guidelines and odd semester academic pacing.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-slate-800 pt-1">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-1.5">
              <span className="inline-block w-3.5 h-3.5 border border-slate-500 rounded-xs text-center leading-none text-[10px]">
                {log.hodStatus === 'Approved' ? '✓' : ''}
              </span>
              <span className="font-medium">Verified & Approved</span>
            </label>
            <label className="flex items-center gap-1.5">
              <span className="inline-block w-3.5 h-3.5 border border-slate-500 rounded-xs">
                {log.hodStatus === 'Under Review' ? '✓' : ''}
              </span>
              <span>Under Review</span>
            </label>
            <label className="flex items-center gap-1.5">
              <span className="inline-block w-3.5 h-3.5 border border-slate-500 rounded-xs">
                {log.hodStatus === 'Needs Clarification' ? '✓' : ''}
              </span>
              <span>Clarification Requested</span>
            </label>
          </div>
          <div className="text-[11px] text-slate-500">
            Logged: {new Date(log.savedAt).toLocaleDateString()} {new Date(log.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Signatures Row */}
      <div className="grid grid-cols-2 gap-16 pt-8 border-t border-slate-400 page-break-avoid">
        <div className="text-center">
          <div className="border-b border-slate-500 h-16 mb-2 flex items-end justify-center pb-1">
            <span className="font-serif italic text-slate-800 text-sm font-semibold">{log.employeeName}</span>
          </div>
          <p className="text-xs font-bold text-slate-900">Employee Signature</p>
          <p className="text-[11px] text-slate-600 mt-0.5">Designation: {log.role}</p>
        </div>

        <div className="text-center">
          <div className="border-b border-slate-500 h-16 mb-2 flex items-end justify-center pb-1">
            <span className="text-[11px] text-slate-400 italic">Signature & Departmental Seal</span>
          </div>
          <p className="text-xs font-bold text-slate-900">Head of Department (HoD)</p>
          <p className="text-[11px] text-slate-600 mt-0.5">Department of Information Technology</p>
        </div>
      </div>

      {/* Document Footer */}
      <div className="mt-8 pt-3 border-t border-slate-300 text-center text-[10px] text-slate-500">
        Institutional Record • Daily Activity & Duty Accountability Report • Retain in Departmental Archives
      </div>
    </div>
  );
};
