import React, { useState } from 'react';
import {
  CLASSES_TIMETABLE,
  FACULTY_DIRECTORY,
  INSTITUTION_INFO,
  ClassTimetable,
  FacultyMember,
  getFacultyDaySchedule,
} from '../timetableData';
import {
  X,
  Calendar,
  Users,
  Building2,
  BookOpen,
  Clock,
  Search,
  CheckCircle,
  FileSpreadsheet,
  Layers,
  Sparkles,
} from 'lucide-react';

interface TimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFacultyForTracker?: (facultyName: string) => void;
}

export const TimetableModal: React.FC<TimetableModalProps> = ({
  isOpen,
  onClose,
  onSelectFacultyForTracker,
}) => {
  const [activeTab, setActiveTab] = useState<'classes' | 'faculty' | 'dayMaster' | 'analytics'>('classes');
  const [selectedClassId, setSelectedClassId] = useState<string>('III_IT_A');
  const [facultySearch, setFacultySearch] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT'>('MON');

  if (!isOpen) return null;

  const currentClass = CLASSES_TIMETABLE.find((c) => c.id === selectedClassId) || CLASSES_TIMETABLE[0];

  const days: ('MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT')[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const filteredFaculty = FACULTY_DIRECTORY.filter(
    (f) =>
      f.name.toLowerCase().includes(facultySearch.toLowerCase()) ||
      f.title.toLowerCase().includes(facultySearch.toLowerCase()) ||
      f.primarySubjects.some((s) => s.toLowerCase().includes(facultySearch.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {INSTITUTION_INFO.department}
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  W.E.F. Odd Sem 2026-27
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {INSTITUTION_INFO.collegeName} • Official Timetable Database (Dated: {INSTITUTION_INFO.dated})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1 py-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('classes')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'classes'
                  ? 'bg-white text-blue-700 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Section Timetables (6 Classes)</span>
            </button>

            <button
              onClick={() => setActiveTab('faculty')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'faculty'
                  ? 'bg-white text-blue-700 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Faculty Master Directory ({FACULTY_DIRECTORY.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('dayMaster')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'dayMaster'
                  ? 'bg-white text-blue-700 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Day-Wise Department Grid</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-white text-blue-700 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Academic Analysis & Rooms</span>
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
          {/* TAB 1: SECTION TIMETABLES */}
          {activeTab === 'classes' && (
            <div className="space-y-5">
              {/* Class Selector Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {CLASSES_TIMETABLE.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClassId(cls.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer border ${
                      selectedClassId === cls.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div>{cls.displayName}</div>
                    <div className={`text-[10px] font-normal ${selectedClassId === cls.id ? 'text-blue-100' : 'text-slate-400'}`}>
                      Room: {cls.roomNo}
                    </div>
                  </button>
                ))}
              </div>

              {/* Class Header Banner */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-sm">
                    {currentClass.section}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{currentClass.displayName}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-0.5">
                      <span><strong>Room No:</strong> {currentClass.roomNo}</span>
                      <span><strong>Class Teacher:</strong> <span className="text-blue-700 font-semibold">{currentClass.classTeacher}</span></span>
                      <span><strong>W.E.F:</strong> {currentClass.wef}</span>
                    </div>
                  </div>
                </div>

                {onSelectFacultyForTracker && (
                  <button
                    onClick={() => {
                      onSelectFacultyForTracker(currentClass.classTeacher);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer self-start md:self-auto"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Track as {currentClass.classTeacher}</span>
                  </button>
                )}
              </div>

              {/* Weekly Schedule Matrix Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-700 flex items-center justify-between">
                  <span>Weekly Period Schedule (09:40 AM - 04:20 PM)</span>
                  <span className="text-[11px] text-slate-500 font-normal">Lunch Break: 12:40 PM - 01:20 PM</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100/75 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
                        <th className="py-2.5 px-3 border-r border-slate-200 w-16 text-center">Day</th>
                        <th className="py-2.5 px-3 border-r border-slate-200 text-center">
                          <div>Period 1</div>
                          <div className="text-[10px] text-slate-500 font-normal">09:40 - 10:40</div>
                        </th>
                        <th className="py-2.5 px-3 border-r border-slate-200 text-center">
                          <div>Period 2</div>
                          <div className="text-[10px] text-slate-500 font-normal">10:40 - 11:40</div>
                        </th>
                        <th className="py-2.5 px-3 border-r border-slate-200 text-center">
                          <div>Period 3</div>
                          <div className="text-[10px] text-slate-500 font-normal">11:40 - 12:40</div>
                        </th>
                        <th className="py-2.5 px-2 bg-amber-50/50 border-r border-slate-200 text-center w-20 text-amber-800">
                          <div>Recess</div>
                          <div className="text-[9px] font-normal">12:40 - 01:20</div>
                        </th>
                        <th className="py-2.5 px-3 border-r border-slate-200 text-center">
                          <div>Period 4</div>
                          <div className="text-[10px] text-slate-500 font-normal">01:20 - 02:20</div>
                        </th>
                        <th className="py-2.5 px-3 border-r border-slate-200 text-center">
                          <div>Period 5</div>
                          <div className="text-[10px] text-slate-500 font-normal">02:20 - 03:20</div>
                        </th>
                        <th className="py-2.5 px-3 text-center">
                          <div>Period 6</div>
                          <div className="text-[10px] text-slate-500 font-normal">03:20 - 04:20</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {days.map((day) => {
                        const sched = currentClass.schedule[day];
                        return (
                          <tr key={day} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3 font-bold text-slate-800 border-r border-slate-200 text-center bg-slate-50/40">
                              {day}
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-200 text-center font-medium text-slate-800">
                              <span className={sched.slot_1.includes('LAB') ? 'text-indigo-700 font-semibold' : ''}>
                                {sched.slot_1}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-200 text-center font-medium text-slate-800">
                              <span className={sched.slot_2.includes('LAB') ? 'text-indigo-700 font-semibold' : ''}>
                                {sched.slot_2}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-200 text-center font-medium text-slate-800">
                              <span className={sched.slot_3.includes('LAB') ? 'text-indigo-700 font-semibold' : ''}>
                                {sched.slot_3}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 bg-amber-50/30 border-r border-slate-200 text-center text-[11px] text-amber-900 font-medium">
                              Lunch
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-200 text-center font-medium text-slate-800">
                              <span className={sched.slot_4.includes('LAB') ? 'text-indigo-700 font-semibold' : ''}>
                                {sched.slot_4}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-200 text-center font-medium text-slate-800">
                              <span className={sched.slot_5.includes('LAB') ? 'text-indigo-700 font-semibold' : ''}>
                                {sched.slot_5}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-medium text-slate-800">
                              <span className={sched.slot_6.includes('LAB') ? 'text-indigo-700 font-semibold' : ''}>
                                {sched.slot_6}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Subjects & Faculty Allocation List */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Course Syllabus & Faculty Allocations ({currentClass.subjects.length} Subjects)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {currentClass.subjects.map((subj, idx) => (
                    <div
                      key={subj.code + idx}
                      className={`p-3 rounded-lg border text-xs flex flex-col justify-between ${
                        subj.isLab
                          ? 'bg-indigo-50/40 border-indigo-200/80'
                          : 'bg-slate-50/60 border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{subj.name}</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-200 text-slate-700">
                              {subj.abbr}
                            </span>
                            {subj.isLab && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                                Laboratory
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">{subj.code}</div>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-200/60 text-slate-700 text-[11px] flex items-center justify-between">
                        <div>
                          <span className="text-slate-400">Faculty:</span>{' '}
                          <span className="font-medium text-slate-900">{subj.faculty}</span>
                        </div>
                        {onSelectFacultyForTracker && subj.facultyNames.length > 0 && (
                          <button
                            onClick={() => {
                              onSelectFacultyForTracker(subj.facultyNames[0]);
                              onClose();
                            }}
                            className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline ml-2 shrink-0"
                          >
                            Track
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FACULTY MASTER DIRECTORY */}
          {activeTab === 'faculty' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={facultySearch}
                    onChange={(e) => setFacultySearch(e.target.value)}
                    placeholder="Search faculty name, subject, or role..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="text-xs text-slate-500">
                  Showing {filteredFaculty.length} of {FACULTY_DIRECTORY.length} Faculty Members
                </div>
              </div>

              {/* Faculty Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredFaculty.map((f) => (
                  <div
                    key={f.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-blue-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-xs text-slate-900">{f.name}</h4>
                        {f.isClassTeacherOf && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            Class Teacher
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-blue-700 font-medium mt-0.5">{f.title}</p>
                      <p className="text-[10px] text-slate-400">{f.department}</p>

                      {f.isClassTeacherOf && (
                        <div className="mt-2 text-[11px] bg-slate-50 p-1.5 rounded border border-slate-100 text-slate-600">
                          {f.isClassTeacherOf}
                        </div>
                      )}

                      <div className="mt-3">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                          Subjects & Labs
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {f.primarySubjects.map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">IT Department</span>
                      {onSelectFacultyForTracker && (
                        <button
                          onClick={() => {
                            onSelectFacultyForTracker(f.name);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                        >
                          Select in Tracker
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DAY-WISE MASTER GRID */}
          {activeTab === 'dayMaster' && (
            <div className="space-y-4">
              {/* Day Selector */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {days.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedDay === d
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {d === 'MON' ? 'Monday' : d === 'TUE' ? 'Tuesday' : d === 'WED' ? 'Wednesday' : d === 'THU' ? 'Thursday' : d === 'FRI' ? 'Friday' : 'Saturday'}
                  </button>
                ))}
              </div>

              {/* Day Master Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-800 flex items-center justify-between">
                  <span>Department Master Day View — {selectedDay}</span>
                  <span className="text-slate-500 text-[11px]">All 6 Sections Running Simultaneously</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100/75 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
                        <th className="py-2.5 px-3 border-r border-slate-200 w-36">Class & Room</th>
                        <th className="py-2.5 px-3 border-r border-slate-200 text-center">P1 (09:40-10:40)</th>
                        <th className="py-2.5 px-3 border-r border-slate-200 text-center">P2 (10:40-11:40)</th>
                        <th className="py-2.5 px-3 border-r border-slate-200 text-center">P3 (11:40-12:40)</th>
                        <th className="py-2.5 px-2 bg-amber-50/50 border-r border-slate-200 text-center w-16 text-amber-800">Lunch</th>
                        <th className="py-2.5 px-3 border-r border-slate-200 text-center">P4 (01:20-02:20)</th>
                        <th className="py-2.5 px-3 border-r border-slate-200 text-center">P5 (02:20-03:20)</th>
                        <th className="py-2.5 px-3 text-center">P6 (03:20-04:20)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {CLASSES_TIMETABLE.map((cls) => {
                        const sched = cls.schedule[selectedDay];
                        return (
                          <tr key={cls.id} className="hover:bg-slate-50/80">
                            <td className="py-3 px-3 font-bold text-slate-900 border-r border-slate-200 bg-slate-50/40">
                              <div>{cls.displayName}</div>
                              <div className="text-[10px] text-blue-700 font-normal">Room: {cls.roomNo}</div>
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-200 text-center">{sched.slot_1}</td>
                            <td className="py-2.5 px-3 border-r border-slate-200 text-center">{sched.slot_2}</td>
                            <td className="py-2.5 px-3 border-r border-slate-200 text-center">{sched.slot_3}</td>
                            <td className="py-2.5 px-2 bg-amber-50/30 border-r border-slate-200 text-center text-amber-900 text-[10px]">12:40-01:20</td>
                            <td className="py-2.5 px-3 border-r border-slate-200 text-center">{sched.slot_4}</td>
                            <td className="py-2.5 px-3 border-r border-slate-200 text-center">{sched.slot_5}</td>
                            <td className="py-2.5 px-3 text-center">{sched.slot_6}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACADEMIC ANALYSIS & ROOMS */}
          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Room Allocations */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Designated Classrooms & Occupancy</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">Room N 304</span>
                        <p className="text-[11px] text-slate-500">B.E III SEM - IT SEC-A</p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">W.E.F 03/08/2026</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">Room N 305</span>
                        <p className="text-[11px] text-slate-500">B.E III SEM - IT SEC-B</p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">W.E.F 03/08/2026</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">Room O 205</span>
                        <p className="text-[11px] text-slate-500">B.E V SEM - IT SEC-A</p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">W.E.F 29/07/2026</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">Room O 206</span>
                        <p className="text-[11px] text-slate-500">B.E V SEM - IT SEC-B</p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">W.E.F 29/07/2026</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">Room O 203</span>
                        <p className="text-[11px] text-slate-500">B.E VII SEM - IT SEC-A</p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">W.E.F 29/07/2026</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">Room O 204</span>
                        <p className="text-[11px] text-slate-500">B.E VII SEM - IT SEC-B</p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">W.E.F 29/07/2026</span>
                    </div>
                  </div>
                </div>

                {/* Lab Batch Structure */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>Laboratory 3-Batch Rotation Structure</span>
                  </h4>
                  <div className="space-y-2.5 text-xs text-slate-600">
                    <div className="p-3 bg-indigo-50/40 rounded-lg border border-indigo-100">
                      <div className="font-semibold text-indigo-900 mb-1">Semester III Practical Labs</div>
                      <p className="text-[11px] text-slate-600">
                        Divided into Batches A, B, and C rotating across WT LAB, EDS LAB, OS LAB, and DS LAB with 2 to 3 faculty members per laboratory session.
                      </p>
                    </div>

                    <div className="p-3 bg-indigo-50/40 rounded-lg border border-indigo-100">
                      <div className="font-semibold text-indigo-900 mb-1">Semester V Practical Labs</div>
                      <p className="text-[11px] text-slate-600">
                        Concurrent execution of AI LAB, OS LAB, and FSD LAB across batches A, B, C with cross-faculty supervision (Mrs. T. Aruna Jyothi, Mrs. B. Deepa, Mrs. S. Nagajyothi, Ms. G. Akshara, Mrs. K. Mounika, Ms. Mizna).
                      </p>
                    </div>

                    <div className="p-3 bg-indigo-50/40 rounded-lg border border-indigo-100">
                      <div className="font-semibold text-indigo-900 mb-1">Semester VII Project Work & IoT</div>
                      <p className="text-[11px] text-slate-600">
                        Dedicated IoT Lab blocks (Batch A & B) and continuous Project Work-I (PW-I) allocation for final-year deliverables.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Department of Information Technology • Matrusri Engineering College</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
