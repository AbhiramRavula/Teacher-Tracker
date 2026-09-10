export type Role = 'Faculty' | 'Programmer';

export interface TimeSlotItem {
  id: string;
  timeLabel: string;
  periodCode?: string; // 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'Closing'
  isLunchBreak?: boolean;
  isClosingSlot?: boolean;
  facultyTime?: string;
  programmerTime?: string;
  placeholder: {
    Faculty: string;
    Programmer: string;
  };
}

export interface PeriodSlotData {
  slot: string; // 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'Closing'
  courseName: string; // e.g., 'DS', 'OS', 'AI'
  section: string; // e.g., 'III A', 'V B', 'VII A'
  credits: string; // e.g., '3' or '1'
  unitNo: string; // e.g., '2'
  topicName: string; // e.g., 'Stack using linked list'
  classHour?: string; // e.g., 'P1' or '09:40 AM - 10:40 AM'
}

export interface ActivityLog {
  id: string;
  employeeName: string;
  role: Role;
  date: string;
  department: string;
  employeeId?: string;
  activities: Record<string, string>; // slotId -> formatted text
  periodData?: Record<string, PeriodSlotData>; // slotId -> structured period entries
  savedAt: string;
  totalFilledSlots: number;
  hodRemarks?: string;
  hodStatus?: 'Submitted' | 'Logged' | 'Approved' | 'Under Review' | 'Needs Clarification';
  sheetsSynced?: boolean;
  sheetsSyncedAt?: string;
}

export interface GoogleSheetsLogItem {
  slot: string;
  section?: string;
  courseName?: string;
  credits?: string;
  unitNo?: string;
  topicName?: string;
  activity?: string; // backwards compatibility
}

export interface GoogleSheetsPayload {
  facultyName: string;
  date: string;
  logs: GoogleSheetsLogItem[];
}
