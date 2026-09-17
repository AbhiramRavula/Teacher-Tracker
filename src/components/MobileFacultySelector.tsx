import React, { useState, useMemo } from 'react';
import { Search, X, User, Check, Sparkles, Building2, BookOpen, Briefcase } from 'lucide-react';
import {
  FACULTY_DIRECTORY,
  PROGRAMMER_DIRECTORY,
  FacultyMember,
  ProgrammerMember,
  isFacultyTransferred,
} from '../timetableData';

interface MobileFacultySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedName: string;
  onSelectFaculty: (name: string, title?: string, role?: 'Faculty' | 'Programmer') => void;
  role: 'Faculty' | 'Programmer';
}

function cleanStr(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export const MobileFacultySelector: React.FC<MobileFacultySelectorProps> = ({
  isOpen,
  onClose,
  selectedName,
  onSelectFaculty,
  role,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRole, setActiveRole] = useState<'Faculty' | 'Programmer'>(role);
  const [activeFilter, setActiveFilter] = useState<'All' | 'III Sem' | 'V Sem' | 'VII Sem' | 'Core IT'>('All');

  // Keep activeRole in sync when opened with a different prop
  React.useEffect(() => {
    setActiveRole(role);
  }, [role, isOpen]);

  // Clean, case-insensitive, trimmed query
  const trimmedQuery = searchQuery.toLowerCase().trim();
  const normalizedCleanQuery = cleanStr(trimmedQuery).replace(/amith/g, 'samhith');

  // Filtered Programmers (Srinivas, Ramesh Kumar, Girija, Krishna Mohan, Mounika)
  const filteredProgrammers = useMemo(() => {
    if (!trimmedQuery) return PROGRAMMER_DIRECTORY;

    return PROGRAMMER_DIRECTORY.filter((p) => {
      const nameMatch = p.name.toLowerCase().trim().includes(trimmedQuery);
      const displayMatch = p.displayName.toLowerCase().trim().includes(trimmedQuery);
      const titleMatch = p.title.toLowerCase().trim().includes(trimmedQuery);
      const cleanMatch = cleanStr(p.name).includes(normalizedCleanQuery) || cleanStr(p.displayName).includes(normalizedCleanQuery);
      const dutyMatch = p.primaryDuties.some((d) => d.toLowerCase().trim().includes(trimmedQuery));
      const subjectMatch = p.primarySubjects.some((s) => s.toLowerCase().trim().includes(trimmedQuery));

      return nameMatch || displayMatch || titleMatch || cleanMatch || dutyMatch || subjectMatch;
    });
  }, [trimmedQuery, normalizedCleanQuery]);

  // Filtered Faculty (includes Mrs. M. Srividya; strictly excludes Vikram, BJ Praveena, Pushpa, Deepa)
  const filteredFaculty = useMemo(() => {
    return FACULTY_DIRECTORY.filter((faculty) => {
      // Exclude transferred faculty completely
      if (isFacultyTransferred(faculty.name)) return false;

      if (trimmedQuery) {
        const nameMatch = faculty.name.toLowerCase().trim().includes(trimmedQuery);
        const normNameMatch = faculty.normalizedName.toLowerCase().trim().includes(trimmedQuery);
        const titleMatch = faculty.title.toLowerCase().trim().includes(trimmedQuery);
        const cleanMatch = cleanStr(faculty.name).includes(normalizedCleanQuery);
        const subjectMatch = faculty.primarySubjects.some((s) => s.toLowerCase().trim().includes(trimmedQuery));
        const classTeacherMatch = Boolean(
          faculty.isClassTeacherOf && faculty.isClassTeacherOf.toLowerCase().trim().includes(trimmedQuery)
        );

        const matches = nameMatch || normNameMatch || titleMatch || cleanMatch || subjectMatch || classTeacherMatch;
        if (!matches) return false;
      }

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
  }, [trimmedQuery, normalizedCleanQuery, activeFilter]);

  if (!isOpen) return null;

  const isShowingProgrammers = activeRole === 'Programmer';
  const listItems = isShowingProgrammers ? filteredProgrammers : filteredFaculty;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 transition-all">
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] border border-slate-200 overflow-hidden animate-in slide-in-from-bottom duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div>
            <h2 className="text-sm font-bold tracking-wide">
              {isShowingProgrammers ? 'Select IT Programmer / Staff' : 'Select Faculty Member'}
            </h2>
            <p className="text-[11px] text-slate-300">
              Department of Information Technology • Matrusri Engg College
            </p>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Switcher Tab Pills (Allows 1-tap switching between Faculty and Programmers) */}
        <div className="p-2.5 bg-slate-100 border-b border-slate-200 shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveRole('Faculty');
              setActiveFilter('All');
            }}
            className={`flex-1 min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeRole === 'Faculty'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Faculty Teachers ({FACULTY_DIRECTORY.filter((f) => !isFacultyTransferred(f.name)).length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRole('Programmer');
            }}
            className={`flex-1 min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeRole === 'Programmer'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Programmers ({PROGRAMMER_DIRECTORY.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 shrink-0 space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isShowingProgrammers
                  ? 'Search programmer: Srinivas, Ramesh Kumar, Girija...'
                  : 'Search faculty: Srividya, Srinivas, Ramya, OS, DS...'
              }
              className="w-full min-h-[48px] pl-10 pr-10 py-2.5 bg-white text-sm text-slate-900 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none placeholder:text-slate-400 shadow-2xs font-medium"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Pills for Faculty */}
          {!isShowingProgrammers && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {(['All', 'III Sem', 'V Sem', 'VII Sem', 'Core IT'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`min-h-[36px] px-3 py-1 rounded-full whitespace-nowrap font-bold transition-colors cursor-pointer ${
                    activeFilter === filter
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Staff List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 divide-y divide-slate-100">
          {listItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 px-4 space-y-2">
              <User className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No matching staff found</p>
              <p className="text-xs text-slate-500">
                {isShowingProgrammers
                  ? 'Try searching: Srinivas, Ramesh Kumar, Girija, Krishna Mohan, Mounika'
                  : 'Try searching: Srividya, Ramya, Aruna Jyothi, Srinivas'}
              </p>
              {/* Quick switch button if user typed something that matches the other role */}
              {isShowingProgrammers ? (
                <button
                  type="button"
                  onClick={() => setActiveRole('Faculty')}
                  className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200 cursor-pointer"
                >
                  Search in Faculty Members instead
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveRole('Programmer')}
                  className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 cursor-pointer"
                >
                  Search in Programmers instead
                </button>
              )}
            </div>
          ) : (
            listItems.map((item) => {
              const isSelected =
                cleanStr(selectedName) === cleanStr(item.name) ||
                ('displayName' in item && cleanStr(selectedName) === cleanStr(item.displayName));

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectFaculty(
                      item.name,
                      item.title,
                      isShowingProgrammers ? 'Programmer' : 'Faculty'
                    );
                    onClose();
                  }}
                  className={`w-full min-h-[56px] text-left p-3.5 rounded-xl transition-all flex items-start justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? isShowingProgrammers
                        ? 'bg-emerald-50 border border-emerald-300 text-emerald-950 shadow-2xs'
                        : 'bg-blue-50 border border-blue-300 text-blue-950 shadow-2xs'
                      : 'hover:bg-slate-50 border border-transparent active:bg-slate-100'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-extrabold text-slate-900 tracking-tight">
                        {'displayName' in item ? item.displayName : item.name}
                      </span>
                      {isShowingProgrammers && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Programmer (Closing 05:30 PM)
                        </span>
                      )}
                      {'isClassTeacherOf' in item && item.isClassTeacherOf && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                          {item.isClassTeacherOf}
                        </span>
                      )}
                      {'workload' in item && item.workload && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Th: {item.workload.theory}, Lab: {item.workload.lab}
                          {item.workload.crt ? `, CRT: ${item.workload.crt}` : ''} (Total: {item.workload.total}h)
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mt-1 font-medium line-clamp-1">
                      {item.title}
                    </p>

                    <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500">
                      <BookOpen className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {item.primarySubjects.slice(0, 3).join(' • ')}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 pt-0.5">
                    {isSelected ? (
                      <div
                        className={`w-6 h-6 rounded-full text-white flex items-center justify-center ${
                          isShowingProgrammers ? 'bg-emerald-600' : 'bg-blue-600'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-slate-300" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <span className="font-semibold">
            {listItems.length} {isShowingProgrammers ? 'programmers' : 'faculty'} available
          </span>
          <button
            onClick={onClose}
            className="min-h-[44px] px-4 font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 cursor-pointer shadow-2xs"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
