import React from 'react';
import { Calendar, Clock } from 'lucide-react';

export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT';

interface DaySelectorProps {
  selectedDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
  dayClassCounts?: Record<DayOfWeek, number>;
}

export const DAYS_LIST: { key: DayOfWeek; label: string; full: string }[] = [
  { key: 'MON', label: 'Mon', full: 'Monday' },
  { key: 'TUE', label: 'Tue', full: 'Tuesday' },
  { key: 'WED', label: 'Wed', full: 'Wednesday' },
  { key: 'THU', label: 'Thu', full: 'Thursday' },
  { key: 'FRI', label: 'Fri', full: 'Friday' },
  { key: 'SAT', label: 'Sat', full: 'Saturday' },
];

export const DaySelector: React.FC<DaySelectorProps> = ({
  selectedDay,
  onSelectDay,
  dayClassCounts,
}) => {
  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>Timetable Day</span>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">
          Tap day to load scheduled timetable
        </span>
      </div>

      <div className="grid grid-cols-6 gap-1.5">
        {DAYS_LIST.map((item) => {
          const isSelected = selectedDay === item.key;
          const count = dayClassCounts ? dayClassCounts[item.key] || 0 : undefined;

          return (
            <button
              key={item.key}
              onClick={() => onSelectDay(item.key)}
              className={`min-h-[46px] rounded-xl flex flex-col items-center justify-center transition-all p-1 cursor-pointer active:scale-95 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs ring-2 ring-slate-900 ring-offset-1'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
              }`}
            >
              <span className="text-xs font-bold tracking-tight uppercase leading-none">
                {item.label}
              </span>

              {count !== undefined && (
                <span
                  className={`text-[10px] font-semibold mt-1 px-1.5 py-0.2 rounded-full leading-tight ${
                    isSelected
                      ? count > 0
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-800 text-slate-400'
                      : count > 0
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-slate-400'
                  }`}
                >
                  {count > 0 ? `${count} class` : '—'}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
