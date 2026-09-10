import { BASE_TIME_SLOTS } from '../constants';
import { PeriodSlotData } from '../types';

/**
 * Normalizes an employee/faculty name for consistent key storage in localStorage.
 * e.g., "Mrs. STVSAV. Ramya" -> "mrs_stvsav_ramya"
 */
export function normalizeDraftName(name: string): string {
  if (!name || !name.trim()) return 'unassigned';
  const clean = name
    .trim()
    .toLowerCase()
    .replace(/amith/g, 'samhith')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  return clean || 'unassigned';
}

/**
 * Generates an isolated localStorage key for a specific slot, keyed strictly by facultyName + date + slot.
 * Example key: `draft_mrs_stvsav_ramya_2026-09-10_slot_1`
 */
export function getSlotDraftKey(employeeName: string, date: string, slotId: string): string {
  const normName = normalizeDraftName(employeeName);
  const cleanDate = (date || '').trim() || 'nodate';
  return `draft_${normName}_${cleanDate}_${slotId}`;
}

/**
 * Key for structured period slot data
 */
export function getStructuredSlotDraftKey(employeeName: string, date: string, slotId: string): string {
  const normName = normalizeDraftName(employeeName);
  const cleanDate = (date || '').trim() || 'nodate';
  return `draft_struct_${normName}_${cleanDate}_${slotId}`;
}

/**
 * Formats a structured PeriodSlotData into a human-readable activity line
 */
export function formatPeriodSummary(data: PeriodSlotData): string {
  const parts: string[] = [];
  if (data.courseName) parts.push(data.courseName);
  if (data.section) parts.push(`Sec: ${data.section}`);
  if (data.credits) parts.push(`${data.credits} Cr`);
  if (data.unitNo) parts.push(`Unit: ${data.unitNo}`);

  const prefix = parts.length > 0 ? `[${parts.join(' | ')}] ` : '';
  return `${prefix}${data.topicName || ''}`.trim();
}

/**
 * Saves a structured draft entry for a specific slot into localStorage in real-time.
 */
export function saveStructuredSlotDraft(
  employeeName: string,
  date: string,
  slotId: string,
  data: PeriodSlotData
): void {
  try {
    if (!date) return;
    const structKey = getStructuredSlotDraftKey(employeeName, date, slotId);
    const plainKey = getSlotDraftKey(employeeName, date, slotId);

    const hasContent = Boolean(
      (data.topicName && data.topicName.trim().length > 0) ||
      (data.courseName && data.courseName.trim().length > 0)
    );

    if (hasContent) {
      localStorage.setItem(structKey, JSON.stringify(data));
      // Also update plain key for backwards compatibility
      localStorage.setItem(plainKey, formatPeriodSummary(data));
    } else {
      localStorage.removeItem(structKey);
      localStorage.removeItem(plainKey);
    }
  } catch (e) {
    console.error('Failed to save structured slot draft:', e);
  }
}

/**
 * Loads all structured draft slot entries for a specific employee and specific date.
 */
export function loadStructuredDraftsForEmployeeAndDate(
  employeeName: string,
  date: string
): Record<string, PeriodSlotData> {
  const result: Record<string, PeriodSlotData> = {};
  if (!date) return result;

  try {
    BASE_TIME_SLOTS.forEach((slot) => {
      if (slot.isLunchBreak) return;
      const structKey = getStructuredSlotDraftKey(employeeName, date, slot.id);
      const raw = localStorage.getItem(structKey);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            result[slot.id] = parsed;
            return;
          }
        } catch {
          // ignore parse error
        }
      }

      // Fallback to plain draft if exists
      const plainKey = getSlotDraftKey(employeeName, date, slot.id);
      const plainVal = localStorage.getItem(plainKey);
      if (plainVal && plainVal.trim().length > 0) {
        result[slot.id] = {
          slot: slot.periodCode || slot.id.replace('slot_', 'P').toUpperCase(),
          courseName: '',
          section: '',
          credits: '3',
          unitNo: '',
          topicName: plainVal,
        };
      }
    });
  } catch (e) {
    console.error('Failed to load structured drafts:', e);
  }

  return result;
}

/**
 * Saves a draft entry for a specific slot into localStorage in real-time as the user types.
 */
export function saveSlotDraft(
  employeeName: string,
  date: string,
  slotId: string,
  text: string
): void {
  try {
    if (!date) return;
    const key = getSlotDraftKey(employeeName, date, slotId);
    if (text !== undefined && text !== null && text.trim().length > 0) {
      localStorage.setItem(key, text);
    } else {
      localStorage.removeItem(key);
    }
  } catch (e) {
    console.error('Failed to save slot draft to localStorage:', e);
  }
}

/**
 * Loads all draft slot entries for a specific employee and specific date.
 * Returns only the draft logs saved for that exact date, preventing carry-over into future days.
 */
export function loadDraftsForEmployeeAndDate(
  employeeName: string,
  date: string
): Record<string, string> {
  const result: Record<string, string> = {};
  if (!date) return result;

  try {
    BASE_TIME_SLOTS.forEach((slot) => {
      if (slot.isLunchBreak) return;
      const key = getSlotDraftKey(employeeName, date, slot.id);
      const val = localStorage.getItem(key);
      if (val !== null && val.trim().length > 0) {
        result[slot.id] = val;
      }
    });
  } catch (e) {
    console.error('Failed to load drafts for employee and date:', e);
  }

  return result;
}

/**
 * Checks if there are any saved draft entries for a given employee on a specific date.
 */
export function hasAnyDraftForEmployeeAndDate(
  employeeName: string,
  date: string
): boolean {
  if (!date) return false;
  try {
    return BASE_TIME_SLOTS.some((slot) => {
      if (slot.isLunchBreak) return false;
      const key = getSlotDraftKey(employeeName, date, slot.id);
      const val = localStorage.getItem(key);
      return Boolean(val && val.trim().length > 0);
    });
  } catch {
    return false;
  }
}

/**
 * Clears draft entries from localStorage for a specific employee on a specific date.
 */
export function clearDraftsForEmployeeAndDate(
  employeeName: string,
  date: string
): void {
  try {
    if (!date) return;
    BASE_TIME_SLOTS.forEach((slot) => {
      if (slot.isLunchBreak) return;
      const plainKey = getSlotDraftKey(employeeName, date, slot.id);
      const structKey = getStructuredSlotDraftKey(employeeName, date, slot.id);
      localStorage.removeItem(plainKey);
      localStorage.removeItem(structKey);
    });
  } catch (e) {
    console.error('Failed to clear drafts from localStorage:', e);
  }
}
