import React, { useState } from 'react';
import {
  CLASSES_TIMETABLE,
  INSTITUTION_INFO,
  MASTER_FACULTY_DATASET,
  DayKey,
  SlotKey,
  ClassTimetable,
} from '../timetableData';
import {
  Users,
  Clock,
  Search,
  Layers,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

interface TimetableTabContentProps {
  currentFacultyName?: string;
  onSelectFaculty?: (name: string) => void;
  onApplySlotToToday?: (slotId: string, text: string) => void;
  onSwitchToTracker?: () => void;
}

const DAYS: DayKey[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const TIME_SLOT_LABELS: Record<SlotKey, { label: string; time: string }> = {
  slot_1: { label: 'Period 1', time: '09:40 - 10:40' },
  slot_2: { label: 'Period 2', time: '10:40 - 11:40' },
  slot_3: { label: 'Period 3', time: '11:40 - 12:40' },
  slot_4: { label: 'Period 4', time: '01:20 - 02:20' },
  slot_5: { label: 'Period 5', time: '02:20 - 03:20' },
  slot_6: { label: 'Period 6', time: '03:20 - 04:20' },
};

export const TimetableTabContent: React.FC<TimetableTabContentProps> = ({
  currentFacultyName,
  onSelectFaculty,
  onApplySlotToToday,
  onSwitchToTracker,
}) => {
  const [subTab, setSubTab] = useState<'mySchedule' | 'allClasses' | 'facultyDirectory'>('mySchedule');
  const [selectedClassId, setSelectedClassId] = useState<string>('III_IT_A');
  const [facultySearch, setFacultySearch] = useState<string>('');

  // Initial faculty profile matching currentFacultyName or default to first
  const initialProfile =
    MASTER_FACULTY_DATASET.find(
      (f) =>
        f.name.toLowerCase() === (currentFacultyName || '').toLowerCase() ||
        f.aliases.some((a) => a.toLowerCase() === (currentFacultyName || '').toLowerCase())
    ) || MASTER_FACULTY_DATASET[0];

  const [selectedFacultyId, setSelectedFacultyId] = useState<string>(initialProfile.id);

  const currentFaculty =
    MASTER_FACULTY_DATASET.find((f) => f.id === selectedFacultyId) || MASTER_FACULTY_DATASET[0];

  const currentClass: ClassTimetable =
    CLASSES_TIMETABLE.find((c) => c.id === selectedClassId) || CLASSES_TIMETABLE[0];

  const filteredFaculty = MASTER_FACULTY_DATASET.filter((f) => {
    const q = facultySearch.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.designation.toLowerCase().includes(q) ||
      f.primarySubjects.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Sub navigation pills */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setSubTab('mySchedule')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'mySchedule'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Faculty Weekly Schedule</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('allClasses')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'allClasses'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Class Timetables (6 Sections)</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('facultyDirectory')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'facultyDirectory'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Faculty Directory ({MASTER_FACULTY_DATASET.length})</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 font-medium px-2 hidden sm:block">
          {INSTITUTION_INFO.documentTitle}
        </div>
      </div>

      {/* Subtab 1: Faculty Weekly Schedule */}
      {subTab === 'mySchedule' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  {currentFaculty.name}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {currentFaculty.designation}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                <span>Theory: {currentFaculty.workload.theory} hrs</span>
                <span>•</span>
                <span>Lab: {currentFaculty.workload.lab} hrs</span>
                <span>•</span>
                <span className="font-bold text-slate-700">Total: {currentFaculty.workload.total} hrs/week</span>
              </div>
            </div>

            {/* Quick faculty switcher dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 shrink-0">Switch Faculty:</span>
              <select
                value={selectedFacultyId}
                onChange={(e) => {
                  setSelectedFacultyId(e.target.value);
                  const selected = MASTER_FACULTY_DATASET.find((f) => f.id === e.target.value);
                  if (selected && onSelectFaculty) {
                    onSelectFaculty(selected.name);
                  }
                }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[240px]"
              >
                {MASTER_FACULTY_DATASET.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Weekly Schedule Grid */}
          <div className="space-y-3">
            {DAYS.map((day) => {
              const daySchedule = currentFaculty.schedule[day] || {};
              const slotKeys: SlotKey[] = ['slot_1', 'slot_2', 'slot_3', 'slot_4', 'slot_5', 'slot_6'];
              const scheduledCount = slotKeys.filter((k) => !!daySchedule[k]).length;

              return (
                <div
                  key={day}
                  className={`rounded-xl border p-3 transition-all ${
                    scheduledCount > 0
                      ? 'bg-slate-50/70 border-slate-200'
                      : 'bg-white border-slate-100 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider px-2 py-0.5 bg-slate-200 rounded-md">
                        {day}
                      </span>
                      {currentFaculty.rawScheduleText[day] && (
                        <span className="text-[11px] text-slate-500 font-mono hidden md:inline truncate max-w-md">
                          {currentFaculty.rawScheduleText[day]}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">
                      {scheduledCount} Scheduled Periods
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {slotKeys.map((slotKey, idx) => {
                      const entry = daySchedule[slotKey];
                      const timeInfo = TIME_SLOT_LABELS[slotKey];

                      return (
                        <div
                          key={slotKey}
                          className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between min-h-[85px] ${
                            !entry
                              ? 'bg-white/60 border-dashed border-slate-200 text-slate-400'
                              : entry.isLab
                              ? 'bg-emerald-50/60 border-emerald-300 shadow-2xs'
                              : 'bg-white border-blue-200 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500">
                              P{idx + 1}
                            </span>
                            {entry && (
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                  entry.isLab
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}
                              >
                                {entry.isLab ? 'LAB' : 'THEORY'}
                              </span>
                            )}
                          </div>

                          <div className="my-1">
                            {!entry ? (
                              <span className="text-[11px] italic text-slate-400">Department / Prep</span>
                            ) : (
                              <div>
                                <div className="font-extrabold text-slate-900 leading-tight">
                                  {entry.codeOrAbbr}
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                                  {entry.fullDetail}
                                </div>
                              </div>
                            )}
                          </div>

                          {entry && onApplySlotToToday && (
                            <button
                              type="button"
                              onClick={() => {
                                onApplySlotToToday(
                                  slotKey,
                                  entry.fullDetail || entry.codeOrAbbr
                                );
                                if (onSwitchToTracker) onSwitchToTracker();
                              }}
                              className="mt-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer self-start"
                              title="Insert into today's activity tracker"
                            >
                              <span>Insert</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subtab 2: Class Timetables (6 Sections) */}
      {subTab === 'allClasses' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {CLASSES_TIMETABLE.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedClassId(c.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedClassId === c.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.displayName}
              </button>
            ))}
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex flex-wrap gap-4 justify-between items-center">
            <div>
              <span className="text-slate-500">Section: </span>
              <span className="font-bold text-slate-900">{currentClass.displayName}</span>
            </div>
            <div>
              <span className="text-slate-500">Room: </span>
              <span className="font-bold text-slate-900">{currentClass.roomNo}</span>
            </div>
            <div>
              <span className="text-slate-500">Class Teacher: </span>
              <span className="font-bold text-slate-900">{currentClass.classTeacher}</span>
            </div>
            <div>
              <span className="text-slate-500">w.e.f: </span>
              <span className="font-bold text-slate-900">{currentClass.wef}</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-white font-bold">
                <tr>
                  <th className="p-3">Day</th>
                  <th className="p-3 text-center">P1 (09:40-10:40)</th>
                  <th className="p-3 text-center">P2 (10:40-11:40)</th>
                  <th className="p-3 text-center">P3 (11:40-12:40)</th>
                  <th className="p-3 text-center bg-slate-800 text-slate-400">Lunch (12:40-01:20)</th>
                  <th className="p-3 text-center">P4 (01:20-02:20)</th>
                  <th className="p-3 text-center">P5 (02:20-03:20)</th>
                  <th className="p-3 text-center">P6 (03:20-04:20)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {DAYS.map((day) => {
                  const entry = currentClass.schedule[day];
                  return (
                    <tr key={day} className="hover:bg-slate-50/80">
                      <td className="p-3 font-extrabold text-slate-900 bg-slate-50 w-20">
                        {day}
                      </td>
                      <td className="p-3 text-center text-slate-800">{entry?.slot_1 || '—'}</td>
                      <td className="p-3 text-center text-slate-800">{entry?.slot_2 || '—'}</td>
                      <td className="p-3 text-center text-slate-800">{entry?.slot_3 || '—'}</td>
                      <td className="p-3 text-center bg-slate-50 text-slate-400 text-[10px]">Lunch Break</td>
                      <td className="p-3 text-center text-slate-800">{entry?.slot_4 || '—'}</td>
                      <td className="p-3 text-center text-slate-800">{entry?.slot_5 || '—'}</td>
                      <td className="p-3 text-center text-slate-800">{entry?.slot_6 || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 3: Faculty Directory */}
      {subTab === 'facultyDirectory' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search faculty by name, designation, subject..."
              value={facultySearch}
              onChange={(e) => setFacultySearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredFaculty.map((f) => (
              <div
                key={f.id}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors bg-white shadow-2xs flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="font-extrabold text-slate-900 text-sm">{f.name}</div>
                  <div className="text-[11px] text-blue-600 font-semibold">{f.designation}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Workload: {f.workload.total} hrs ({f.workload.theory} Th + {f.workload.lab} Lab)
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                    {f.primarySubjects.slice(0, 2).join(', ')}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFacultyId(f.id);
                      if (onSelectFaculty) onSelectFaculty(f.name);
                      setSubTab('mySchedule');
                    }}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] rounded-lg cursor-pointer transition-colors shrink-0"
                  >
                    View Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
