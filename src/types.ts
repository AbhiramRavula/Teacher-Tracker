export type Role = 'Faculty' | 'Programmer';

export interface TimeSlotItem {
  id: string;
  timeLabel: string;
  isLunchBreak?: boolean;
  isClosingSlot?: boolean;
  facultyTime?: string;
  programmerTime?: string;
  placeholder: {
    Faculty: string;
    Programmer: string;
  };
}

export interface ActivityLog {
  id: string;
  employeeName: string;
  role: Role;
  date: string;
  department: string;
  employeeId?: string;
  activities: Record<string, string>; // slotId -> text
  savedAt: string;
  totalFilledSlots: number;
  hodRemarks?: string;
  hodStatus?: 'Approved' | 'Under Review' | 'Needs Clarification';
  sheetsSynced?: boolean;
  sheetsSyncedAt?: string;
}

export interface GoogleSheetsLogItem {
  slot: string;
  activity: string;
}

export interface GoogleSheetsPayload {
  facultyName: string;
  date: string;
  logs: GoogleSheetsLogItem[];
}
