import React from 'react';
import { ActivityLog } from '../types';
import { HodReportDocument } from './HodReportDocument';
import { Printer, X, FileText } from 'lucide-react';

interface HodReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  log?: ActivityLog | null;
  dailyLogs?: ActivityLog[];
  reportDate?: string;
}

export const HodReportModal: React.FC<HodReportModalProps> = ({
  isOpen,
  onClose,
  log,
  dailyLogs,
  reportDate,
}) => {
  if (!isOpen || (!log && (!dailyLogs || dailyLogs.length === 0))) return null;

  const handlePrint = () => {
    window.print();
  };

  const isDepartmentSummary = !!(dailyLogs && dailyLogs.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Toolbar (hidden on print) */}
        <div className="no-print px-4 sm:px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold leading-tight">
                {isDepartmentSummary ? 'HoD Departmental Daily Summary' : 'HoD Activity Review Sheet'}
              </h3>
              <p className="text-xs text-slate-400">
                {isDepartmentSummary
                  ? 'Master sign-off sheet of all departmental submissions'
                  : 'Formal summary formatted for Head of Department scrutiny'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="modal-print-button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Sheet Canvas */}
        <div className="overflow-y-auto p-2 sm:p-6 bg-slate-100 flex-1">
          <div className="bg-white mx-auto max-w-4xl rounded-xl shadow-md border border-slate-300 overflow-hidden">
            <HodReportDocument
              log={log}
              dailyLogs={dailyLogs}
              reportDate={reportDate}
            />
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="no-print px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Formatted for standard A4 portrait/landscape printing</span>
          <button
            onClick={onClose}
            className="px-3 py-1 font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
