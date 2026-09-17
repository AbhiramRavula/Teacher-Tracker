import React from 'react';
import { Role } from '../types';
import { User, Briefcase, Calendar, Building2, Clock, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';
import { FACULTY_DIRECTORY, PROGRAMMER_DIRECTORY, isFacultyTransferred } from '../timetableData';

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
  onSelectSampleProfile?: (sampleKey: 'ramya' | 'srinivas' | 'aruna' | 'rajesh' | 'srividya' | 'programmer_srinivas' | 'programmer_ramesh') => void;
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
  const activeFacultyList = React.useMemo(() => {
    return FACULTY_DIRECTORY.filter((f) => !isFacultyTransferred(f.name));
  }, []);

  return (
    <div id="user-details-card" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-semibold text-sm shadow-2xs">
            <User className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-none">Employee Information</h2>
            <p className="text-xs text-slate-500 mt-1">Specify employee identity and role to adjust duty schedules</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {/* Quick Timetable Explorer Button */}
          {onOpenTimetableModal && (
            <button
              type="button"
              onClick={onOpenTimetableModal}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer shadow-2xs"
              title="Open Department Timetable & Master Schedule"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Timetable Explorer</span>
            </button>
          )}

          {/* Dynamic Badge indicating the active role schedule */}
          <div className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Closing Slot:</span>
            <span className="font-bold text-blue-700">
              {role === 'Faculty' ? '04:20 PM - 04:45 PM' : '04:20 PM - 05:30 PM'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Employee Name with Datalist of Faculty or Programmers */}
        <div className="md:col-span-5">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="employee-name-input" className="block text-xs font-bold text-slate-800">
              Staff Name <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] text-slate-400">
              {role === 'Faculty' ? 'Active IT faculty list' : 'IT Programmer list'}
            </span>
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
              placeholder={role === 'Faculty' ? 'e.g. Mrs. M. Srividya / Dr. J. Srinivas' : 'e.g. Srinivas / Ramesh Kumar'}
              className={`w-full min-h-[48px] pl-9 pr-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 rounded-xl border bg-slate-50/50 focus:bg-white transition-colors focus:outline-none focus:ring-2 shadow-2xs ${
                error
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                  : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
              }`}
            />
            <datalist id="faculty-options">
              {role === 'Faculty'
                ? activeFacultyList.map((f) => (
                    <option key={f.id} value={f.name}>
                      {f.title} - {f.primarySubjects.join(', ')}
                    </option>
                  ))
                : PROGRAMMER_DIRECTORY.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.displayName} - {p.title}
                    </option>
                  ))}
            </datalist>
          </div>
          {error && <p className="text-xs text-rose-600 mt-1 font-medium">{error}</p>}
        </div>

        {/* Role Dropdown */}
        <div className="md:col-span-3">
          <label htmlFor="employee-role-select" className="block text-xs font-bold text-slate-800 mb-1.5">
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
              className="w-full min-h-[48px] pl-9 pr-8 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-100 cursor-pointer appearance-none shadow-2xs"
            >
              <option value="Faculty">Faculty (Closes 04:45 PM)</option>
              <option value="Programmer">Programmer (Closes 05:30 PM)</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* Date Field */}
        <div className="md:col-span-2">
          <label htmlFor="activity-date-input" className="block text-xs font-bold text-slate-800 mb-1.5">
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
              className="w-full min-h-[48px] pl-9 pr-2 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-100 shadow-2xs"
            />
          </div>
        </div>

        {/* Department / Unit */}
        <div className="md:col-span-2">
          <label htmlFor="department-input" className="block text-xs font-bold text-slate-800 mb-1.5">
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
              placeholder="e.g. IT / Labs"
              className="w-full min-h-[48px] pl-9 pr-3 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-100 shadow-2xs"
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
