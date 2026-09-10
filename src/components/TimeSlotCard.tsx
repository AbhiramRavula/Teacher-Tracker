import React from 'react';
import { Role, TimeSlotItem } from '../types';
import { getSlotTimeLabel } from '../constants';
import { Clock, Coffee, Sparkles, Check } from 'lucide-react';

interface TimeSlotCardProps {
  slot: TimeSlotItem;
  role: Role;
  value: string;
  onChange: (val: string) => void;
  index: number;
}

export const TimeSlotCard: React.FC<TimeSlotCardProps> = ({
  slot,
  role,
  value,
  onChange,
  index,
}) => {
  const timeLabel = getSlotTimeLabel(slot, role);
  const isFilled = value.trim().length > 0;

  if (slot.isLunchBreak) {
    return (
      <div
        id={`slot-card-${slot.id}`}
        className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <Coffee className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-sm">{timeLabel}</span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300/60">
                Lunch Break
              </span>
            </div>
            <p className="text-xs text-amber-800/80 mt-0.5">
              Scheduled lunch intermission • Duty pause (Disabled / Information Only)
            </p>
          </div>
        </div>

        <div className="text-xs text-amber-700 font-medium bg-white/70 px-3 py-1.5 rounded-lg border border-amber-200/80 self-stretch sm:self-auto text-center">
          No logging required for this slot
        </div>
      </div>
    );
  }

  return (
    <div
      id={`slot-card-${slot.id}`}
      className={`p-4 sm:p-5 rounded-xl border transition-all duration-150 ${
        slot.isClosingSlot
          ? 'bg-gradient-to-br from-white to-blue-50/40 border-blue-200 shadow-xs'
          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 ${
              slot.isClosingSlot
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {index + 1}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {timeLabel}
            </span>

            {slot.isClosingSlot && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                <Sparkles className="w-3 h-3 text-blue-600" />
                Closing Slot ({role})
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {isFilled ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <Check className="w-3 h-3" /> Logged
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">Pending</span>
          )}
        </div>
      </div>

      <div className="relative">
        <textarea
          id={`textarea-${slot.id}`}
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={slot.placeholder[role]}
          className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-slate-50/40 hover:bg-slate-50/80 focus:bg-white rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all placeholder:text-slate-400 leading-relaxed resize-y"
        />
      </div>

      {isFilled && (
        <div className="mt-1.5 flex justify-end">
          <span className="text-[11px] text-slate-400">{value.trim().length} characters</span>
        </div>
      )}
    </div>
  );
};
