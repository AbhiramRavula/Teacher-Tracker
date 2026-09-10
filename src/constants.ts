import { Role, TimeSlotItem } from './types';

export const STORAGE_KEY = 'employee_daily_activity_logs_v1';

export const BASE_TIME_SLOTS: TimeSlotItem[] = [
  {
    id: 'slot_1',
    timeLabel: '09:40 AM - 10:40 AM',
    placeholder: {
      Faculty: 'e.g., Artificial Intelligence (AI - PC509IT U23) lecture for B.E V SEM IT-A in Room O 205',
      Programmer: 'e.g., Server room health check, tested DHCP scopes, and inspected Linux Lab 2 workstations',
    },
  },
  {
    id: 'slot_2',
    timeLabel: '10:40 AM - 11:40 AM',
    placeholder: {
      Faculty: 'e.g., Data Structures using C (DS - U25PC301IT) lecture: Binary search trees and AVL rotations',
      Programmer: 'e.g., Configured GCC/G++ build toolchains and VS Code environment for III Sem DS Lab',
    },
  },
  {
    id: 'slot_3',
    timeLabel: '11:40 AM - 12:40 PM',
    placeholder: {
      Faculty: 'e.g., Departmental curriculum pacing review & NBA criteria documentation meeting with HoD',
      Programmer: 'e.g., Assisted in Raspberry Pi 4 and sensor connectivity verification for VII Sem IoT Lab',
    },
  },
  {
    id: 'slot_lunch',
    timeLabel: '12:40 PM - 01:20 PM',
    isLunchBreak: true,
    placeholder: {
      Faculty: 'Lunch Break - Scheduled Pause (12:40 PM - 01:20 PM)',
      Programmer: 'Lunch Break - Scheduled Pause (12:40 PM - 01:20 PM)',
    },
  },
  {
    id: 'slot_4',
    timeLabel: '01:20 PM - 02:20 PM',
    placeholder: {
      Faculty: 'e.g., Cyber Security (CS - PE712ITU23) lecture: Public Key Cryptography in Room O 203',
      Programmer: 'e.g., Resolved network IP collision on Classroom O 205 smart board and audio system',
    },
  },
  {
    id: 'slot_5',
    timeLabel: '02:20 PM - 03:20 PM',
    placeholder: {
      Faculty: 'e.g., Supervised Operating Systems Lab (OS LAB - U25PC382IT) Batch B on Linux process creation',
      Programmer: 'e.g., Network switch cabling audit and automated backup script run on department NAS',
    },
  },
  {
    id: 'slot_6',
    timeLabel: '03:20 PM - 04:20 PM',
    placeholder: {
      Faculty: 'e.g., Operating Systems Lecture (OS - U25PC302IT): Semaphores and Deadlock Avoidance in Room N 304',
      Programmer: 'e.g., End-of-day workstation antivirus scanning and classroom system shutdown verification',
    },
  },
  {
    id: 'slot_closing',
    timeLabel: 'Dynamic Closing Slot',
    isClosingSlot: true,
    facultyTime: '04:20 PM - 04:45 PM',
    programmerTime: '04:20 PM - 05:30 PM',
    placeholder: {
      Faculty: 'e.g., Student attendance entry in Matrusri automation portal, verified lab records, prepared tomorrow slides',
      Programmer: 'e.g., Safe shutdown of auxiliary lab servers, committed configuration backups, secured server rack',
    },
  },
];

export function getSlotTimeLabel(slot: TimeSlotItem, role: Role): string {
  if (slot.isClosingSlot) {
    return role === 'Faculty'
      ? (slot.facultyTime || '04:20 PM - 04:45 PM')
      : (slot.programmerTime || '04:20 PM - 05:30 PM');
  }
  return slot.timeLabel;
}
