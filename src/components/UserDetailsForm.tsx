import React from 'react';
import { Role } from '../types';
import { User, Briefcase, Calendar, Building2, Clock, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';
import { FACULTY_DIRECTORY } from '../timetableData';

interface UserDetailsFormProps {
  employeeName: string;
  onEmployeeNameChange: (val: string) => void;
  role: Role;
  onRoleChange: (val: Role) => void;
  date: string;
  onDateChange: (val: string) => void;
  department: string;
  onDepartmentChange: (val: string) => void;
  error?: string;
  onAutoFillFromTimetable?: () => void;
  onOpenTimetableModal?: () => void;
  onSelectSampleProfile?: (sampleKey: 'ramya' | 'srinivas' | 'aruna' | 'rajesh' | 'programmer') => void;
}

export const UserDetailsForm: React.FC<UserDetailsFormProps> = ({
  employeeName,
  onEmployeeNameChange,
  role,
  onRoleChange,
  date,
  onDateChange,
  department,
  onDepartmentChange,
  error,
  onAutoFillFromTimetable,
  onOpenTimetableModal,
  onSelectSampleProfile,
}) => {
  return (
    <div id="user-details-card" className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-semibold text-sm">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 leading-none">Employee Information</h2>
            <p className="text-xs text-slate-500 mt-1">Specify employee identity and role to adjust duty schedules</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {/* Quick Timetable Explorer Button */}
          {onOpenTimetableModal && (
            <button
              type="button"
              onClick={onOpenTimetableModal}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
              title="Open Department Timetable & Master Schedule"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Timetable Explorer</span>
            </button>
          )}

          {/* Dynamic Badge indicating the active role schedule */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Closing Slot:</span>
            <span className="font-semibold text-blue-700">
              {role === 'Faculty' ? '04:20 PM - 04:45 PM' : '04:20 PM - 05:30 PM'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Sample Profiles Bar */}
      {onSelectSampleProfile && (
        <div className="mb-4 pb-3 border-b border-slate-100 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Sample Data Presets:
          </span>
          <button
            type="button"
            onClick={() => onSelectSampleProfile('ramya')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer border ${
              employeeName === 'MRS. STVSAV. RAMYA'
                ? 'bg-blue-50 border-blue-300 text-blue-800 font-semibold'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            Mrs. Ramya (III IT - OS)
          </button>
          <button
            type="button"
            onClick={() => onSelectSampleProfile('srinivas')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer border ${
              employeeName === 'DR. J. SRINIVAS'
                ? 'bg-blue-50 border-blue-300 text-blue-800 font-semibold'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            Dr. J. Srinivas (III IT - DS)
          </button>
          <button
            type="button"
            onClick={() => onSelectSampleProfile('aruna')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer border ${
              employeeName === 'MRS. T. ARUNA JYOTHI'
                ? 'bg-blue-50 border-blue-300 text-blue-800 font-semibold'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            Mrs. Aruna Jyothi (V IT - AI)
          </button>
          <button
            type="button"
            onClick={() => onSelectSampleProfile('rajesh')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer border ${
              employeeName === 'MR. A. RAJESH'
                ? 'bg-blue-50 border-blue-300 text-blue-800 font-semibold'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            Mr. A. Rajesh (VII IT - CS)
          </button>
          <button
            type="button"
            onClick={() => onSelectSampleProfile('programmer')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer border ${
              employeeName === 'MR. K. RAMESH'
                ? 'bg-blue-50 border-blue-300 text-blue-800 font-semibold'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            Mr. K. Ramesh (IT Lab Admin)
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Employee Name with Datalist of Faculty */}
        <div className="md:col-span-5">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="employee-name-input" className="block text-xs font-medium text-slate-700">
              Employee Name <span className="text-rose-500">*</span>
            </label>
            {role === 'Faculty' && (
              <span className="text-[10px] text-slate-400">Select from IT faculty list or type</span>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              id="employee-name-input"
              list="faculty-options"
              type="text"
              value={employeeName}
              onChange={(e) => onEmployeeNameChange(e.target.value)}
              placeholder={role === 'Faculty' ? 'e.g. MRS. STVSAV. RAMYA / DR. J. SRINIVAS' : 'e.g. Alex Rivera'}
              className={`w-full pl-9 pr-3.5 py-2 text-sm text-slate-900 rounded-lg border bg-slate-50/50 focus:bg-white transition-colors focus:outline-none focus:ring-2 ${
                error
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
              }`}
            />
            <datalist id="faculty-options">
              {FACULTY_DIRECTORY.map((f) => (
                <option key={f.id} value={f.name}>
                  {f.title} - {f.primarySubjects.join(', ')}
                </option>
              ))}
            </datalist>
          </div>
          {error && <p className="text-xs text-rose-600 mt-1 font-medium">{error}</p>}
        </div>

        {/* Role Dropdown */}
        <div className="md:col-span-3">
          <label htmlFor="employee-role-select" className="block text-xs font-medium text-slate-700 mb-1.5">
            Role <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Briefcase className="w-4 h-4" />
            </div>
            <select
              id="employee-role-select"
              value={role}
              onChange={(e) => onRoleChange(e.target.value as Role)}
              className="w-full pl-9 pr-8 py-2 text-sm text-slate-900 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-100 cursor-pointer appearance-none"
            >
              <option value="Faculty">Faculty</option>
              <option value="Programmer">Programmer</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* Date Field */}
        <div className="md:col-span-2">
          <label htmlFor="activity-date-input" className="block text-xs font-medium text-slate-700 mb-1.5">
            Date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              id="activity-date-input"
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full pl-9 pr-2 py-2 text-sm text-slate-900 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Department / Unit */}
        <div className="md:col-span-2">
          <label htmlFor="department-input" className="block text-xs font-medium text-slate-700 mb-1.5">
            Department
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Building2 className="w-4 h-4" />
            </div>
            <input
              id="department-input"
              type="text"
              value={department}
              onChange={(e) => onDepartmentChange(e.target.value)}
              placeholder="e.g. IT / CSE"
              className="w-full pl-9 pr-3 py-2 text-sm text-slate-900 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      {/* Role Schedule Notice & Auto-Fill from Timetable Button */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            Operating as <strong className="text-slate-800 font-semibold">{role}</strong>: Closing period is set to{' '}
            <strong className="text-blue-700 font-semibold">
              {role === 'Faculty' ? '04:20 PM - 04:45 PM' : '04:20 PM - 05:30 PM'}
            </strong>.
          </span>
        </div>

        {role === 'Faculty' && onAutoFillFromTimetable && (
          <button
            type="button"
            onClick={onAutoFillFromTimetable}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-2xs cursor-pointer"
            title="Auto-fill time slot activities directly from the official Department Timetable"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span>Auto-fill from Timetable</span>
          </button>
        )}
      </div>
    </div>
  );
};
