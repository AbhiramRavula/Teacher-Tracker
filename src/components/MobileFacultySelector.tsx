import React, { useState, useMemo } from 'react';
import { Search, X, User, Check, Sparkles, Building2, BookOpen } from 'lucide-react';
import { FACULTY_DIRECTORY, FacultyMember, isFacultyTransferred } from '../timetableData';

interface MobileFacultySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedName: string;
  onSelectFaculty: (name: string, title?: string) => void;
  role: 'Faculty' | 'Programmer';
}

export const MobileFacultySelector: React.FC<MobileFacultySelectorProps> = ({
  isOpen,
  onClose,
  selectedName,
  onSelectFaculty,
  role,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'III Sem' | 'V Sem' | 'VII Sem' | 'Core IT'>('All');

  // Programmer Staff List
  const programmerStaff = useMemo(
    () => [
      {
        id: 'prog_ramesh',
        name: 'MR. K. RAMESH',
        title: 'IT Systems & Programming Lab Administrator',
        department: 'IT Systems & Computing Labs',
        primarySubjects: ['Programming Labs 1 & 2', 'Linux Server Admin', 'IoT Hardware Setups'],
      },
      {
        id: 'prog_suresh',
        name: 'MR. P. SURESH',
        title: 'Senior Hardware & Network Technician',
        department: 'Department Network Infrastructure',
        primarySubjects: ['Network Switches', 'NAS Storage', 'Workstation Maintenance'],
      },
      {
        id: 'prog_anitha',
        name: 'MRS. V. ANITHA',
        title: 'Assistant Programmer & Lab In-charge',
        department: 'Computing Facilities',
        primarySubjects: ['Compiler Toolchains', 'Python/Java Lab Environments'],
      },
    ],
    []
  );

  const filteredFaculty = useMemo(() => {
    if (role === 'Programmer') {
      return programmerStaff.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const normalizedQuery = searchQuery.toLowerCase().replace(/amith/g, 'samhith');

    return FACULTY_DIRECTORY.filter((faculty) => {
      // Exclude transferred faculty completely (effective Sep 15, 2026)
      if (isFacultyTransferred(faculty.name)) return false;

      const matchesSearch =
        faculty.name.toLowerCase().includes(normalizedQuery) ||
        faculty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faculty.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faculty.primarySubjects.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (faculty.isClassTeacherOf && faculty.isClassTeacherOf.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (activeFilter === 'All') return true;
      if (activeFilter === 'III Sem') {
        return (
          faculty.isClassTeacherOf?.includes('III') ||
          faculty.primarySubjects.some((s) => s.includes('III') || s.includes('DS') || s.includes('OS') || s.includes('EDS'))
        );
      }
      if (activeFilter === 'V Sem') {
        return (
          faculty.isClassTeacherOf?.includes('V') ||
          faculty.primarySubjects.some((s) => s.includes('V') || s.includes('AI') || s.includes('SE') || s.includes('FSD'))
        );
      }
      if (activeFilter === 'VII Sem') {
        return (
          faculty.isClassTeacherOf?.includes('VII') ||
          faculty.primarySubjects.some((s) => s.includes('VII') || s.includes('CS') || s.includes('IOT') || s.includes('BCT'))
        );
      }
      if (activeFilter === 'Core IT') {
        return faculty.department.includes('Information Technology');
      }

      return true;
    });
  }, [searchQuery, activeFilter, role, programmerStaff]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 transition-all">
      <div
        className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[80vh] border border-slate-200 overflow-hidden animate-in slide-in-from-bottom duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div>
            <h2 className="text-sm font-semibold tracking-wide">
              {role === 'Faculty' ? 'Select Faculty Member' : 'Select Technical Staff / Programmer'}
            </h2>
            <p className="text-[11px] text-slate-300">
              Department of Information Technology • Matrusri Engg College
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 shrink-0 space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                role === 'Faculty'
                  ? 'Search by name, subject (OS, DS, AI), room...'
                  : 'Search by staff name or role...'
              }
              className="w-full pl-9 pr-8 py-2.5 bg-white text-sm text-slate-900 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none placeholder:text-slate-400"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills for Faculty */}
          {role === 'Faculty' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {(['All', 'III Sem', 'V Sem', 'VII Sem', 'Core IT'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition-colors cursor-pointer ${
                    activeFilter === filter
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Faculty List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-100">
          {filteredFaculty.length === 0 ? (
            <div className="py-12 text-center text-slate-400 px-4">
              <User className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="text-sm font-medium text-slate-600">No staff found</p>
              <p className="text-xs text-slate-400 mt-0.5">Try searching with a different name or course code</p>
            </div>
          ) : (
            filteredFaculty.map((item) => {
              const isSelected = selectedName.toUpperCase() === item.name.toUpperCase();
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectFaculty(item.name, item.title);
                    onClose();
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-start justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/80 border border-blue-200 text-blue-900'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 tracking-tight">
                        {item.name}
                      </span>
                      {('isClassTeacherOf' in item && item.isClassTeacherOf) && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                          {item.isClassTeacherOf}
                        </span>
                      )}
                      {('workload' in item && item.workload) && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Th: {item.workload.theory}, Lab: {item.workload.lab}{item.workload.crt ? `, CRT: ${item.workload.crt}` : ''} (Total: {item.workload.total}h)
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 mt-0.5 font-medium line-clamp-1">
                      {item.title}
                    </p>

                    <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-600">
                      <BookOpen className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {item.primarySubjects.slice(0, 3).join(' • ')}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 pt-0.5">
                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-slate-200 group-hover:border-slate-300" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>{filteredFaculty.length} staff members listed</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
