import * as XLSX from 'xlsx';
import { ActivityLog, PeriodSlotData } from '../types';
import { BASE_TIME_SLOTS } from '../constants';

export interface FlattenedDutyRecord {
  sno: number;
  date: string;
  facultyName: string;
  section: string;
  courseName: string;
  credits: string;
  classHour: string;
  unitNo: string;
  topicName: string;
  status?: string;
  sectionCategory: string; // e.g. 'III SEM IT A CLASS REPORT', 'V SEM IT A CLASS REPORT', etc.
  sortOrder: number;
}

/**
 * Standard class report section categories matching Matrusri Engineering College IT Dept.
 */
export const CLASS_REPORT_SECTIONS = [
  'III SEM IT A CLASS REPORT',
  'V SEM IT A CLASS REPORT',
  'VII SEM IT A CLASS REPORT',
  'III SEM IT B CLASS REPORT',
  'V SEM IT B CLASS REPORT',
  'VII SEM IT B CLASS REPORT',
  'DEPARTMENTAL & LAB DUTIES REPORT',
] as const;

/**
 * Categorize an individual period entry into its designated class report section.
 */
export function determineSectionCategory(section: string, courseName: string, slot: string): { category: string; sortOrder: number } {
  const normSec = (section || '').toUpperCase().trim();
  const normCourse = (courseName || '').toUpperCase().trim();

  // III SEM IT A
  if (
    (normSec.includes('III') && (normSec.includes('A') || normSec.includes('SEC-A'))) ||
    normCourse.includes('WTLAB') ||
    normCourse.includes('WT LAB') ||
    (normSec.startsWith('3') && normSec.includes('A'))
  ) {
    return { category: 'III SEM IT A CLASS REPORT', sortOrder: 1 };
  }

  // V SEM IT A
  if (
    (normSec.includes('V') && !normSec.includes('VII') && (normSec.includes('A') || normSec.includes('SEC-A'))) ||
    normCourse === 'SE' ||
    (normCourse.includes('PPL') && !normSec.includes('B')) ||
    normCourse.includes('DISASTER') ||
    (normSec.startsWith('5') && normSec.includes('A'))
  ) {
    return { category: 'V SEM IT A CLASS REPORT', sortOrder: 2 };
  }

  // VII SEM IT A
  if (
    (normSec.includes('VII') && (normSec.includes('A') || normSec.includes('SEC-A'))) ||
    (normSec.startsWith('7') && normSec.includes('A'))
  ) {
    return { category: 'VII SEM IT A CLASS REPORT', sortOrder: 3 };
  }

  // III SEM IT B
  if (
    (normSec.includes('III') && (normSec.includes('B') || normSec.includes('SEC-B'))) ||
    normCourse === 'F&A' ||
    normCourse === 'MFIT' ||
    normCourse.includes('F&A') ||
    (normSec.startsWith('3') && normSec.includes('B'))
  ) {
    return { category: 'III SEM IT B CLASS REPORT', sortOrder: 4 };
  }

  // V SEM IT B
  if (
    (normSec.includes('V') && !normSec.includes('VII') && (normSec.includes('B') || normSec.includes('SEC-B'))) ||
    normCourse === 'AI' ||
    normCourse === 'FSD' ||
    normCourse === 'OOAD' ||
    (normSec.startsWith('5') && normSec.includes('B'))
  ) {
    return { category: 'V SEM IT B CLASS REPORT', sortOrder: 5 };
  }

  // VII SEM IT B
  if (
    (normSec.includes('VII') && (normSec.includes('B') || normSec.includes('SEC-B'))) ||
    (normSec.startsWith('7') && normSec.includes('B'))
  ) {
    return { category: 'VII SEM IT B CLASS REPORT', sortOrder: 6 };
  }

  // Default / Other departmental or closing
  return { category: 'DEPARTMENTAL & LAB DUTIES REPORT', sortOrder: 7 };
}

/**
 * Parses all activity logs into flat, structured duty records.
 */
export function extractStructuredDutyRecords(logs: ActivityLog[]): FlattenedDutyRecord[] {
  const records: FlattenedDutyRecord[] = [];

  logs.forEach((log) => {
    const faculty = log.employeeName;
    const dateFormatted = formatDateForDisplay(log.date);

    // Look at structured periodData first
    if (log.periodData && Object.keys(log.periodData).length > 0) {
      Object.entries(log.periodData).forEach(([slotId, struct]) => {
        if (!struct) return;
        const hasContent = Boolean(
          (struct.topicName && struct.topicName.trim().length > 0) ||
          (struct.courseName && struct.courseName.trim().length > 0)
        );
        if (!hasContent) return;

        const slotCode = struct.slot || slotId.replace('slot_', 'P').toUpperCase();
        const section = struct.section || (log.role === 'Programmer' ? 'IT Labs' : 'III A');
        const course = struct.courseName || (log.role === 'Programmer' ? 'Systems Lab' : 'Theory/Lab');
        const credits = struct.credits || (slotId === 'slot_closing' ? '0' : '3');
        const unitNo = struct.unitNo || (course.toLowerCase().includes('lab') ? 'Exp' : '1');
        const topic = struct.topicName || log.activities[slotId] || '';

        const { category, sortOrder } = determineSectionCategory(section, course, slotCode);

        records.push({
          sno: 0, // will be assigned per group
          date: dateFormatted,
          facultyName: faculty,
          section,
          courseName: course,
          credits,
          classHour: struct.classHour || slotCode,
          unitNo,
          topicName: topic,
          status: log.hodStatus || 'Approved',
          sectionCategory: category,
          sortOrder,
        });
      });
    } else {
      // Fallback: parse from plain activities text
      BASE_TIME_SLOTS.forEach((slot) => {
        if (slot.isLunchBreak) return;
        const text = log.activities[slot.id];
        if (!text || !text.trim()) return;

        // Try extracting [Course | Sec | Cr | Unit] prefix
        let course = 'IT Course';
        let section = 'III A';
        let credits = slot.isClosingSlot ? '0' : '3';
        let unitNo = '1';
        let topic = text.trim();

        const match = text.match(/^\[(.*?)(?: \| Sec: (.*?))?(?: \| (.*?) Cr)?(?: \| Unit: (.*?))?\]\s*(.*)$/);
        if (match) {
          course = match[1] || course;
          section = match[2] || section;
          credits = match[3] || credits;
          unitNo = match[4] || unitNo;
          topic = match[5] || topic;
        }

        const slotCode = slot.periodCode || slot.id.replace('slot_', 'P').toUpperCase();
        const { category, sortOrder } = determineSectionCategory(section, course, slotCode);

        records.push({
          sno: 0,
          date: dateFormatted,
          facultyName: faculty,
          section,
          courseName: course,
          credits,
          classHour: slotCode,
          unitNo,
          topicName: topic,
          status: log.hodStatus || 'Approved',
          sectionCategory: category,
          sortOrder,
        });
      });
    }
  });

  return records;
}

/**
 * Format ISO date string (YYYY-MM-DD) to college format (e.g., '10-9-26' or '10-09-2026')
 */
export function formatDateForDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    const shortYear = year.length === 4 ? year.substring(2) : year;
    return `${day}-${month}-${shortYear}`;
  }
  return dateStr;
}

/**
 * Sanitize a string to be a valid Excel worksheet title (max 31 chars, no invalid characters)
 */
export function sanitizeSheetTitle(name: string): string {
  const clean = name
    .replace(/[\\/?*[\]:]/g, '')
    .trim();
  return clean.substring(0, 31) || 'Faculty Tab';
}

/**
 * Generates and downloads the multi-tab Excel Workbook:
 * - Tab 1: "Grand_Daily_Report" (exact layout as in the user's uploaded image)
 * - Tabs 2..N: Dedicated tab for each teacher
 */
export function exportMultiTabGrandExcel(
  logs: ActivityLog[],
  options?: {
    filename?: string;
    targetDate?: string;
    collegeName?: string;
    departmentName?: string;
  }
): void {
  const collegeName = options?.collegeName || 'Matrusri Engineering College';
  const departmentName = options?.departmentName || 'Department of Information Technology';
  const targetDate = options?.targetDate;

  // Filter by target date if specified
  const effectiveLogs = targetDate
    ? logs.filter((l) => l.date === targetDate)
    : logs;

  if (effectiveLogs.length === 0) {
    alert('No activity logs found to export for the selected date.');
    return;
  }

  // Create new Excel workbook
  const wb = XLSX.utils.book_new();

  // -------------------------------------------------------------
  // 1. BUILD GRAND TAB ("Grand_Daily_Report")
  // -------------------------------------------------------------
  const allRecords = extractStructuredDutyRecords(effectiveLogs);

  // Group records by sectionCategory
  const groupOrder = [
    'III SEM IT A CLASS REPORT',
    'V SEM IT A CLASS REPORT',
    'VII SEM IT A CLASS REPORT',
    'III SEM IT B CLASS REPORT',
    'V SEM IT B CLASS REPORT',
    'VII SEM IT B CLASS REPORT',
    'DEPARTMENTAL & LAB DUTIES REPORT',
  ];

  const grandRows: (string | number)[][] = [];

  // Row 0: Empty spacer
  grandRows.push([]);

  // Row 1 (Index 1): College Name Banner
  grandRows.push(['', collegeName, '', '', '', '', '', '', '']);

  // Row 2 (Index 2): Department Name Banner
  grandRows.push(['', departmentName, '', '', '', '', '', '', '']);

  // Row 3 (Index 3): Table Headers
  const tableHeaders = [
    'SNO',
    'Date',
    'Name of the Faculty',
    'Section',
    'Course Name',
    'credits',
    'Class Hour',
    'Unit No',
    'Topic Name',
  ];
  grandRows.push(tableHeaders);

  // Row 4: Spacer
  grandRows.push([]);

  // Merges tracking
  const merges: XLSX.Range[] = [
    // College Name: cols B to I (or A to I)
    { s: { r: 1, c: 1 }, e: { r: 1, c: 8 } },
    // Dept Name: cols B to I
    { s: { r: 2, c: 1 }, e: { r: 2, c: 8 } },
  ];

  let isFirstSectionB = true;

  // Render each section group
  groupOrder.forEach((groupName) => {
    const groupRecords = allRecords.filter((r) => r.sectionCategory === groupName);
    if (groupRecords.length === 0) return;

    // If switching to Section B groups, repeat table headers as shown in image row 25
    if (groupName.includes('B CLASS REPORT') && isFirstSectionB) {
      isFirstSectionB = false;
      // Add spacer
      grandRows.push([]);
      // Repeat table header row
      grandRows.push([...tableHeaders]);
      grandRows.push([]);
    }

    // Section Banner row
    const bannerRowIdx = grandRows.length;
    grandRows.push(['', '', groupName, '', '', '', '', '', '']);
    // Merge across cols C to I (or A to I)
    merges.push({ s: { r: bannerRowIdx, c: 0 }, e: { r: bannerRowIdx, c: 8 } });

    // Rows under this section
    groupRecords.forEach((item, idx) => {
      grandRows.push([
        idx + 1, // SNO restarts at 1 per section as in image
        item.date,
        item.facultyName,
        item.section,
        item.courseName,
        item.credits,
        item.classHour,
        item.unitNo,
        item.topicName,
      ]);
    });

    // Small spacer after group
    grandRows.push([]);
  });

  const grandWs = XLSX.utils.aoa_to_sheet(grandRows);
  grandWs['!merges'] = merges;
  grandWs['!cols'] = [
    { wch: 8 },  // SNO
    { wch: 14 }, // Date
    { wch: 26 }, // Name of the Faculty
    { wch: 14 }, // Section
    { wch: 22 }, // Course Name
    { wch: 10 }, // credits
    { wch: 14 }, // Class Hour
    { wch: 14 }, // Unit No
    { wch: 55 }, // Topic Name
  ];

  XLSX.utils.book_append_sheet(wb, grandWs, 'Grand_Daily_Report');

  // -------------------------------------------------------------
  // 2. BUILD SEPARATE TAB FOR EACH TEACHER
  // -------------------------------------------------------------
  // Group logs by employeeName
  const facultyGroups: Record<string, ActivityLog[]> = {};
  effectiveLogs.forEach((l) => {
    const fName = l.employeeName.trim();
    if (!facultyGroups[fName]) {
      facultyGroups[fName] = [];
    }
    facultyGroups[fName].push(l);
  });

  // Unique tab names set to avoid collisions
  const usedTabNames = new Set<string>(['grand_daily_report']);

  Object.entries(facultyGroups).forEach(([fName, facultyLogs]) => {
    // Generate clean unique tab name
    let baseTabName = sanitizeSheetTitle(fName);
    let tabName = baseTabName;
    let counter = 1;
    while (usedTabNames.has(tabName.toLowerCase())) {
      const suffix = `_${counter}`;
      tabName = baseTabName.substring(0, 31 - suffix.length) + suffix;
      counter++;
    }
    usedTabNames.add(tabName.toLowerCase());

    const teacherRows: (string | number)[][] = [];
    teacherRows.push([]);
    teacherRows.push(['', collegeName, '', '', '', '', '', '', '']);
    teacherRows.push(['', `${departmentName} - Faculty Activity Register`, '', '', '', '', '', '', '']);
    teacherRows.push(['', `Faculty: ${fName}`, '', '', '', '', '', '', '']);

    const teacherHeaders = [
      'SNO',
      'Date',
      'Class Hour',
      'Section',
      'Course Name',
      'credits',
      'Unit No',
      'Topic Name / Activity Covered',
      'HoD Status',
    ];
    teacherRows.push(teacherHeaders);
    teacherRows.push([]);

    const teacherMerges: XLSX.Range[] = [
      { s: { r: 1, c: 1 }, e: { r: 1, c: 8 } },
      { s: { r: 2, c: 1 }, e: { r: 2, c: 8 } },
      { s: { r: 3, c: 1 }, e: { r: 3, c: 8 } },
    ];

    const teacherRecords = extractStructuredDutyRecords(facultyLogs);
    teacherRecords.forEach((item, idx) => {
      teacherRows.push([
        idx + 1,
        item.date,
        item.classHour,
        item.section,
        item.courseName,
        item.credits,
        item.unitNo,
        item.topicName,
        item.status || 'Approved',
      ]);
    });

    const teacherWs = XLSX.utils.aoa_to_sheet(teacherRows);
    teacherWs['!merges'] = teacherMerges;
    teacherWs['!cols'] = [
      { wch: 8 },  // SNO
      { wch: 14 }, // Date
      { wch: 14 }, // Class Hour
      { wch: 14 }, // Section
      { wch: 22 }, // Course Name
      { wch: 10 }, // credits
      { wch: 14 }, // Unit No
      { wch: 55 }, // Topic Name / Activity
      { wch: 16 }, // Status
    ];

    XLSX.utils.book_append_sheet(wb, teacherWs, tabName);
  });

  // -------------------------------------------------------------
  // 3. TRIGGER BROWSER DOWNLOAD (.xlsx)
  // -------------------------------------------------------------
  const dateTag = targetDate || new Date().toISOString().split('T')[0];
  const downloadName = options?.filename || `Matrusri_IT_Dept_Faculty_Activity_Report_${dateTag}.xlsx`;

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = downloadName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}
