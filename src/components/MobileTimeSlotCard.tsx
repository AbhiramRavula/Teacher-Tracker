import React from 'react';
import { Role, TimeSlotItem, PeriodSlotData } from '../types';
import { getSlotTimeLabel, getSlotPeriodCode } from '../constants';
import { SlotScheduleDetail } from '../timetableData';
import {
  Clock,
  Coffee,
  Sparkles,
  Check,
  BookOpen,
  MapPin,
  Calendar,
  Layers,
  GraduationCap,
  Hash,
  FileText,
  RotateCcw,
} from 'lucide-react';

interface MobileTimeSlotCardProps {
  slot: TimeSlotItem;
  role: Role;
  value: string;
  periodData?: PeriodSlotData;
  onPeriodDataChange?: (data: PeriodSlotData) => void;
  onChange: (val: string) => void;
  index: number;
  scheduleDetail?: SlotScheduleDetail;
  onApplyScheduleHint?: (hint: string) => void;
}

export const MobileTimeSlotCard: React.FC<MobileTimeSlotCardProps> = ({
  slot,
  role,
  value,
  periodData,
  onPeriodDataChange,
  onChange,
  index,
  scheduleDetail,
}) => {
  const timeLabel = getSlotTimeLabel(slot, role);
  const defaultPeriodCode = getSlotPeriodCode(slot);

  // Derive current values from periodData or fallback to legacy value
  const currentSlotCode = periodData?.slot || defaultPeriodCode;
  const currentCourse = periodData?.courseName ?? (scheduleDetail?.subjectAbbr || '');
  const currentSection = periodData?.section ?? (scheduleDetail?.section || 'III A');
  const currentCredits =
    periodData?.credits ?? (slot.isClosingSlot ? '0' : scheduleDetail?.isLab ? '1' : '3');
  const currentUnit = periodData?.unitNo ?? '1';
  const currentTopic = periodData?.topicName ?? value ?? '';

  const isFilled = Boolean(
    (currentTopic && currentTopic.trim().length > 0) ||
    (currentCourse && currentCourse.trim().length > 0 && currentTopic.trim().length > 0)
  );

  const handleFieldUpdate = (field: keyof PeriodSlotData, val: string) => {
    const updated: PeriodSlotData = {
      slot: currentSlotCode,
      courseName: currentCourse,
      section: currentSection,
      credits: currentCredits,
      unitNo: currentUnit,
      topicName: currentTopic,
      classHour: timeLabel,
      [field]: val,
    };

    if (onPeriodDataChange) {
      onPeriodDataChange(updated);
    }

    // Keep parent string value in sync
    const summary = updated.topicName || '';
    onChange(summary);
  };

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
                Departmental Lunch Interval • No classes scheduled
              </p>
            </div>
          </div>
          <div className="text-[11px] font-semibold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-lg border border-amber-300/60 shrink-0">
            Pause
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id={`slot-card-${slot.id}`}
      className={`rounded-2xl border transition-all duration-150 p-3.5 sm:p-4 shadow-2xs space-y-3 ${
        isFilled
          ? 'bg-white border-emerald-300 ring-1 ring-emerald-100/80'
          : slot.isClosingSlot
          ? 'bg-gradient-to-b from-white to-blue-50/20 border-blue-200'
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Top Slot Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs ${
              isFilled
                ? 'bg-emerald-600 text-white'
                : slot.isClosingSlot
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 text-white'
            }`}
          >
            {slot.isClosingSlot ? 'C' : currentSlotCode}
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

      {/* Dynamic Timetable Reference Label (as requested) */}
      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Timetable Reference:</span>
            {scheduleDetail && scheduleDetail.hasSchedule ? (
              <span className="text-blue-950 font-bold">
                {scheduleDetail.subjectAbbr || scheduleDetail.subjectName}
                {scheduleDetail.section ? ` (${scheduleDetail.section})` : ''}
              </span>
            ) : (
              <span className="text-slate-500 font-normal italic">
                {slot.isClosingSlot
                  ? 'Attendance & Lab Closing Responsibilities'
                  : 'Free / Mentoring / Lab Prep'}
              </span>
            )}
          </div>

          {scheduleDetail && scheduleDetail.hasSchedule && (
            <div className="flex items-center gap-1 shrink-0">
              {scheduleDetail.isLab && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 border border-purple-200">
                  LAB
                </span>
              )}
              {scheduleDetail.roomNo && (
                <span className="text-[10px] font-medium text-slate-600 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                  {scheduleDetail.roomNo}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Department Official Report Layout: Structured Fields */}
      {role === 'Faculty' && !slot.isClosingSlot ? (
        <div className="space-y-3 pt-1">
          {/* Row 1: Grid of 5 Report Fields (Course Name, Section, Credits, Period, Unit No) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {/* 1. Course Name */}
            <div className="col-span-2 sm:col-span-2 space-y-1">
              <label
                htmlFor={`course-${slot.id}`}
                className="text-[11px] font-bold text-slate-700 flex items-center gap-1"
              >
                <BookOpen className="w-3 h-3 text-blue-600" />
                <span>Course Name</span>
              </label>
              <input
                id={`course-${slot.id}`}
                type="text"
                value={currentCourse}
                onChange={(e) => handleFieldUpdate('courseName', e.target.value)}
                placeholder="e.g. DS, OS, AI, WT, SE"
                className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-900 bg-white rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* 2. Section */}
            <div className="space-y-1">
              <label
                htmlFor={`section-${slot.id}`}
                className="text-[11px] font-bold text-slate-700 flex items-center gap-1"
              >
                <GraduationCap className="w-3 h-3 text-slate-500" />
                <span>Section</span>
              </label>
              <input
                id={`section-${slot.id}`}
                type="text"
                value={currentSection}
                onChange={(e) => handleFieldUpdate('section', e.target.value)}
                placeholder="e.g. III A"
                className="w-full px-2.5 py-1.5 text-xs text-slate-900 bg-white rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* 3. Credits */}
            <div className="space-y-1">
              <label
                htmlFor={`credits-${slot.id}`}
                className="text-[11px] font-bold text-slate-700 flex items-center gap-1"
              >
                <Layers className="w-3 h-3 text-slate-500" />
                <span>Credits</span>
              </label>
              <input
                id={`credits-${slot.id}`}
                type="text"
                value={currentCredits}
                onChange={(e) => handleFieldUpdate('credits', e.target.value)}
                placeholder="e.g. 3"
                className="w-full px-2.5 py-1.5 text-xs text-slate-900 bg-white rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* 4. Unit No */}
            <div className="space-y-1">
              <label
                htmlFor={`unit-${slot.id}`}
                className="text-[11px] font-bold text-slate-700 flex items-center gap-1"
              >
                <Hash className="w-3 h-3 text-slate-500" />
                <span>Unit No</span>
              </label>
              <input
                id={`unit-${slot.id}`}
                type="text"
                value={currentUnit}
                onChange={(e) => handleFieldUpdate('unitNo', e.target.value)}
                placeholder="e.g. 2"
                className="w-full px-2.5 py-1.5 text-xs text-slate-900 bg-white rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 2: Topic Name / Description Covered Today */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor={`topic-${slot.id}`}
                className="text-[11px] font-bold text-slate-700 flex items-center gap-1"
              >
                <FileText className="w-3 h-3 text-emerald-600" />
                <span>Topic Name / Description Covered Today</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400">
                {currentTopic.trim().length > 0 ? `${currentTopic.trim().length} chars` : 'Clean entry'}
              </span>
            </div>
            <textarea
              id={`topic-${slot.id}`}
              rows={2}
              value={currentTopic}
              onChange={(e) => handleFieldUpdate('topicName', e.target.value)}
              placeholder="e.g., Stack using linked list, Binary tree traversal, Process synchronization..."
              className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50/50 hover:bg-slate-50 focus:bg-white rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all placeholder:text-slate-400 leading-relaxed resize-none"
            />
          </div>
        </div>
      ) : (
        /* Closing Slot or Programmer Role View */
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label
              htmlFor={`textarea-${slot.id}`}
              className="text-[11px] font-bold text-slate-700 flex items-center gap-1"
            >
              <FileText className="w-3 h-3 text-blue-600" />
              <span>
                {slot.isClosingSlot ? 'End-of-Day Duties & Attendance Entry' : 'Task / Activity Description'}
              </span>
            </label>
            {isFilled && (
              <span className="text-[10px] text-slate-400 font-medium">
                {currentTopic.trim().length} chars
              </span>
            )}
          </div>
          <textarea
            id={`textarea-${slot.id}`}
            rows={2}
            value={currentTopic}
            onChange={(e) => handleFieldUpdate('topicName', e.target.value)}
            placeholder={
              slot.isClosingSlot
                ? 'e.g., Student attendance entry in Matrusri automation portal, verified lab records, prepared tomorrow slides'
                : slot.placeholder[role]
            }
            className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50/50 hover:bg-slate-50 focus:bg-white rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all placeholder:text-slate-400 leading-relaxed resize-none"
          />
        </div>
      )}
    </div>
  );
};
