import React from 'react';
import { Role, TimeSlotItem } from '../types';
import { getSlotTimeLabel } from '../constants';
import { SlotScheduleDetail } from '../timetableData';
import { Clock, Coffee, Sparkles, Check, BookOpen, MapPin, Plus, ArrowDownLeft } from 'lucide-react';

interface MobileTimeSlotCardProps {
  slot: TimeSlotItem;
  role: Role;
  value: string;
  onChange: (val: string) => void;
  index: number;
  scheduleDetail?: SlotScheduleDetail;
  onApplyScheduleHint?: (hint: string) => void;
}

export const MobileTimeSlotCard: React.FC<MobileTimeSlotCardProps> = ({
  slot,
  role,
  value,
  onChange,
  index,
  scheduleDetail,
  onApplyScheduleHint,
}) => {
  const timeLabel = getSlotTimeLabel(slot, role);
  const isFilled = value.trim().length > 0;

  // Visual Lunch Break Divider Card
  if (slot.isLunchBreak) {
    return (
      <div
        id={`slot-card-${slot.id}`}
        className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50/50 p-4 transition-all shadow-2xs"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0 shadow-2xs">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-sm">{timeLabel}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 border border-amber-300">
                  Lunch Break
                </span>
              </div>
              <p className="text-[11px] text-amber-800/90 mt-0.5">
                Departmental Lunch Interval • Disabled for input
              </p>
            </div>
          </div>
          <div className="text-[11px] font-semibold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-lg border border-amber-300/60 shrink-0">
            Duty Pause
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id={`slot-card-${slot.id}`}
      className={`rounded-2xl border transition-all duration-150 p-4 shadow-2xs ${
        isFilled
          ? 'bg-white border-emerald-200 ring-1 ring-emerald-100'
          : slot.isClosingSlot
          ? 'bg-gradient-to-b from-white to-blue-50/30 border-blue-200'
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Top Slot Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
              isFilled
                ? 'bg-emerald-600 text-white shadow-2xs'
                : slot.isClosingSlot
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 text-white'
            }`}
          >
            {index + 1}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-bold text-slate-900 tracking-tight">
              {timeLabel}
            </span>

            {slot.isClosingSlot && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                <Sparkles className="w-2.5 h-2.5 text-blue-600" />
                Closing ({role === 'Faculty' ? '04:45' : '05:30'})
              </span>
            )}
          </div>
        </div>

        {/* Status indicator badge */}
        <div>
          {isFilled ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <Check className="w-3 h-3 stroke-[2.5]" /> Logged
            </span>
          ) : (
            <span className="text-[11px] font-medium text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
              Pending
            </span>
          )}
        </div>
      </div>

      {/* Timetable Scheduled Info Banner (if mapped from academic timetable) */}
      {scheduleDetail && scheduleDetail.hasSchedule ? (
        <div className="mb-2.5 p-2.5 rounded-xl bg-blue-50/80 border border-blue-200/90 text-xs">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-blue-950 text-xs">
                  {scheduleDetail.subjectName || scheduleDetail.subjectAbbr}
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-blue-200/80 text-blue-900">
                  {scheduleDetail.subjectAbbr}
                </span>
                {scheduleDetail.isLab && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-800 border border-purple-200">
                    LAB
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-blue-800 flex-wrap">
                {scheduleDetail.section && (
                  <span className="inline-flex items-center gap-1 font-medium">
                    <BookOpen className="w-3 h-3 text-blue-600 shrink-0" />
                    {scheduleDetail.section}
                  </span>
                )}
                {scheduleDetail.roomNo && (
                  <span className="inline-flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                    Room {scheduleDetail.roomNo}
                  </span>
                )}
              </div>
            </div>

            {/* Tap to pre-fill button */}
            {onApplyScheduleHint && scheduleDetail.fullDetail && (
              <button
                type="button"
                onClick={() => onApplyScheduleHint(scheduleDetail.fullDetail!)}
                className="shrink-0 inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-blue-700 bg-white hover:bg-blue-100 border border-blue-300 rounded-lg transition-colors cursor-pointer active:scale-95 shadow-2xs"
                title="Click to copy scheduled details into text area"
              >
                <ArrowDownLeft className="w-3 h-3" />
                <span>Fill</span>
              </button>
            )}
          </div>
        </div>
      ) : role === 'Faculty' && !slot.isClosingSlot ? (
        <div className="mb-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] text-slate-500 flex items-center justify-between">
          <span>No lecture assigned in master timetable</span>
          <span className="text-[10px] text-slate-400 font-medium">Lab / Prep / Mentoring</span>
        </div>
      ) : null}

      {/* Mobile-friendly Textarea */}
      <div className="relative">
        <textarea
          id={`textarea-${slot.id}`}
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            scheduleDetail?.fullDetail
              ? `E.g., Delivered lecture on ${scheduleDetail.subjectAbbr}; covered key theorems and solved examples...`
              : slot.placeholder[role]
          }
          className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-slate-50/50 hover:bg-slate-50/90 focus:bg-white rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all placeholder:text-slate-400 leading-relaxed resize-none min-h-[72px]"
        />
      </div>

      {/* Character count & Quick helper */}
      <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400 px-0.5">
        <span>
          {isFilled ? 'Activity registered' : 'Tap to describe tasks / lecture topics'}
        </span>
        {isFilled && <span className="font-medium text-slate-500">{value.trim().length} chars</span>}
      </div>
    </div>
  );
};
