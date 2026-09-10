export type DayKey = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT';
export type SlotKey = 'slot_1' | 'slot_2' | 'slot_3' | 'slot_4' | 'slot_5' | 'slot_6';

export interface FacultyWorkload {
  theory: number;
  lab: number;
  crt?: number;
  total: number;
}

export interface SlotEntryDetail {
  codeOrAbbr: string;
  fullDetail: string;
  isLab: boolean;
  isCrt?: boolean;
}

export type DaySchedule = Record<SlotKey, SlotEntryDetail | null>;

export interface MasterFacultyProfile {
  id: string;
  name: string;
  aliases: string[];
  designation: string;
  workload: FacultyWorkload;
  primarySubjects: string[];
  schedule: Record<DayKey, DaySchedule>;
  rawScheduleText: Record<DayKey, string>;
}

// Complete Official Master Faculty Timetable AY 2026-27 ODD SEM
export const MASTER_FACULTY_DATASET: MasterFacultyProfile[] = [
  // 1. Dr. J. Srinivas (Th: 6, Lab: 6, Total: 12)
  {
    id: 'fac_srinivas',
    name: 'Dr. J. Srinivas',
    aliases: ['DR. J. SRINIVAS', 'J. SRINIVAS', 'J SRINIVAS', 'SRINIVAS'],
    designation: 'Professor / Associate Professor',
    workload: { theory: 6, lab: 6, total: 12 },
    primarySubjects: ['Data Structures using C (DS)', 'DS Lab'],
    rawScheduleText: {
      MON: 'Slot III: DS-A',
      TUE: 'Slot I-II: DS LAB (B) SEC-B',
      WED: 'Slot II: DS-B | Slot V: DS LAB (A) SEC-B',
      THU: 'Slot III: DS-A',
      FRI: 'Slot I: DS-B | Slot IV: DS-A',
      SAT: 'Slot I: DS-B | Slot IV-V: DS LAB (C) SEC-B',
    },
    schedule: {
      MON: {
        slot_1: null,
        slot_2: null,
        slot_3: { codeOrAbbr: 'DS-A', fullDetail: 'Lecture: DS-A (Data Structures using C - Sec A)', isLab: false },
        slot_4: null,
        slot_5: null,
        slot_6: null,
      },
      TUE: {
        slot_1: { codeOrAbbr: 'DS LAB (B) SEC-B', fullDetail: 'Lab Session: DS LAB (B) SEC-B (Data Structures Lab)', isLab: true },
        slot_2: { codeOrAbbr: 'DS LAB (B) SEC-B', fullDetail: 'Lab Session: DS LAB (B) SEC-B (Data Structures Lab)', isLab: true },
        slot_3: null,
        slot_4: null,
        slot_5: null,
        slot_6: null,
      },
      WED: {
        slot_1: null,
        slot_2: { codeOrAbbr: 'DS-B', fullDetail: 'Lecture: DS-B (Data Structures using C - Sec B)', isLab: false },
        slot_3: null,
        slot_4: null,
        slot_5: { codeOrAbbr: 'DS LAB (A) SEC-B', fullDetail: 'Lab Session: DS LAB (A) SEC-B (Data Structures Lab)', isLab: true },
        slot_6: null,
      },
      THU: {
        slot_1: null,
        slot_2: null,
        slot_3: { codeOrAbbr: 'DS-A', fullDetail: 'Lecture: DS-A (Data Structures using C - Sec A)', isLab: false },
        slot_4: null,
        slot_5: null,
        slot_6: null,
      },
      FRI: {
        slot_1: { codeOrAbbr: 'DS-B', fullDetail: 'Lecture: DS-B (Data Structures using C - Sec B)', isLab: false },
        slot_2: null,
        slot_3: null,
        slot_4: { codeOrAbbr: 'DS-A', fullDetail: 'Lecture: DS-A (Data Structures using C - Sec A)', isLab: false },
        slot_5: null,
        slot_6: null,
      },
      SAT: {
        slot_1: { codeOrAbbr: 'DS-B', fullDetail: 'Lecture: DS-B (Data Structures using C - Sec B)', isLab: false },
        slot_2: null,
        slot_3: null,
        slot_4: { codeOrAbbr: 'DS LAB (C) SEC-B', fullDetail: 'Lab Session: DS LAB (C) SEC-B (Data Structures Lab)', isLab: true },
        slot_5: { codeOrAbbr: 'DS LAB (C) SEC-B', fullDetail: 'Lab Session: DS LAB (C) SEC-B (Data Structures Lab)', isLab: true },
        slot_6: null,
      },
    },
  },

  // 2. MRS. Y. SIRISHA (Th: 9, Lab: 8, Total: 17)
  {
    id: 'fac_sirisha',
    name: 'Mrs. Y. Sirisha',
    aliases: ['MRS. Y. SIRISHA', 'Y. SIRISHA', 'Y SIRISHA', 'SIRISHA'],
    designation: 'Assistant Professor',
    workload: { theory: 9, lab: 8, total: 17 },
    primarySubjects: ['OOAD-B', 'BDA-A & B', 'OS LAB', 'IOT LAB'],
    rawScheduleText: {
      MON: 'Slot I: OOAD-B | Slot III: OS LAB (C) SEC-B | Slot V: IOT LAB (A) SEC-A',
      TUE: 'Slot I-II: OS LAB (A) SEC-B | Slot III: BDA-B | Slot IV: BDA-A',
      WED: 'Slot I: OOAD-B | Slot IV: BDA-B',
      THU: 'Slot I: BDA-A | Slot III: BDA-B | Slot V: OOAD-B',
      FRI: 'Slot II: BDA-A',
      SAT: 'Slot IV-V: OS LAB (B) SEC-B',
    },
    schedule: {
      MON: {
        slot_1: { codeOrAbbr: 'OOAD-B', fullDetail: 'Lecture: OOAD-B (Object Oriented Analysis & Design - Sec B)', isLab: false },
        slot_2: null,
        slot_3: { codeOrAbbr: 'OS LAB (C) SEC-B', fullDetail: 'Lab Session: OS LAB (C) SEC-B (Operating Systems Lab)', isLab: true },
        slot_4: null,
        slot_5: { codeOrAbbr: 'IOT LAB (A) SEC-A', fullDetail: 'Lab Session: IOT LAB (A) SEC-A (Internet of Things Lab)', isLab: true },
        slot_6: null,
      },
      TUE: {
        slot_1: { codeOrAbbr: 'OS LAB (A) SEC-B', fullDetail: 'Lab Session: OS LAB (A) SEC-B (Operating Systems Lab)', isLab: true },
        slot_2: { codeOrAbbr: 'OS LAB (A) SEC-B', fullDetail: 'Lab Session: OS LAB (A) SEC-B (Operating Systems Lab)', isLab: true },
        slot_3: { codeOrAbbr: 'BDA-B', fullDetail: 'Lecture: BDA-B (Big Data Analytics - Sec B)', isLab: false },
        slot_4: { codeOrAbbr: 'BDA-A', fullDetail: 'Lecture: BDA-A (Big Data Analytics - Sec A)', isLab: false },
        slot_5: null,
        slot_6: null,
      },
      WED: {
        slot_1: { codeOrAbbr: 'OOAD-B', fullDetail: 'Lecture: OOAD-B (Object Oriented Analysis & Design - Sec B)', isLab: false },
        slot_2: null,
        slot_3: null,
        slot_4: { codeOrAbbr: 'BDA-B', fullDetail: 'Lecture: BDA-B (Big Data Analytics - Sec B)', isLab: false },
        slot_5: null,
        slot_6: null,
      },
      THU: {
        slot_1: { codeOrAbbr: 'BDA-A', fullDetail: 'Lecture: BDA-A (Big Data Analytics - Sec A)', isLab: false },
        slot_2: null,
        slot_3: { codeOrAbbr: 'BDA-B', fullDetail: 'Lecture: BDA-B (Big Data Analytics - Sec B)', isLab: false },
        slot_4: null,
        slot_5: { codeOrAbbr: 'OOAD-B', fullDetail: 'Lecture: OOAD-B (Object Oriented Analysis & Design - Sec B)', isLab: false },
        slot_6: null,
      },
      FRI: {
        slot_1: null,
        slot_2: { codeOrAbbr: 'BDA-A', fullDetail: 'Lecture: BDA-A (Big Data Analytics - Sec A)', isLab: false },
        slot_3: null,
        slot_4: null,
        slot_5: null,
        slot_6: null,
      },
      SAT: {
        slot_1: null,
        slot_2: null,
        slot_3: null,
        slot_4: { codeOrAbbr: 'OS LAB (B) SEC-B', fullDetail: 'Lab Session: OS LAB (B) SEC-B (Operating Systems Lab)', isLab: true },
        slot_5: { codeOrAbbr: 'OS LAB (B) SEC-B', fullDetail: 'Lab Session: OS LAB (B) SEC-B (Operating Systems Lab)', isLab: true },
        slot_6: null,
      },
    },
  },

  // 3. Mrs. STVSAV Ramya (Th: 12, Lab: 12, Total: 24)
  {
    id: 'fac_ramya',
    name: 'Mrs. STVSAV Ramya',
    aliases: ['MRS. STVSAV. RAMYA', 'MRS. STVSAV RAMYA', 'STVSAV RAMYA', 'RAMYA'],
    designation: 'Assistant Professor & Class Teacher (III IT-A)',
    workload: { theory: 12, lab: 12, total: 24 },
    primarySubjects: ['OS-A', 'OS-B', 'OS-AIML', 'OS LAB'],
    rawScheduleText: {
      MON: 'Slot II: OS-B | Slot III-IV: OS LAB (C) SEC-B | Slot VI: OS-AIML',
      TUE: 'Slot III: OS-A | Slot V: OS-B',
      WED: 'Slot III: OS-A | Slot III-IV: OS LAB (C) SEC-A | Slot V: OS-AIML',
      THU: 'Slot I-II: OS LAB (B) SEC-A | Slot III: OS-B | Slot V: OS-AIML',
      FRI: 'Slot I: OS-AIML | Slot III: OS-B | Slot V: OS-A',
      SAT: 'Slot I-II: OS LAB (A) SEC-A | Slot III: OS-A',
    },
    schedule: {
      MON: {
        slot_1: null,
        slot_2: { codeOrAbbr: 'OS-B', fullDetail: 'Lecture: OS-B (Operating Systems - Sec B)', isLab: false },
        slot_3: { codeOrAbbr: 'OS LAB (C) SEC-B', fullDetail: 'Lab Session: OS LAB (C) SEC-B (Operating Systems Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'OS LAB (C) SEC-B', fullDetail: 'Lab Session: OS LAB (C) SEC-B (Operating Systems Lab)', isLab: true },
        slot_5: null,
        slot_6: { codeOrAbbr: 'OS-AIML', fullDetail: 'Lecture: OS-AIML (Operating Systems for AI & ML)', isLab: false },
      },
      TUE: {
        slot_1: null,
        slot_2: null,
        slot_3: { codeOrAbbr: 'OS-A', fullDetail: 'Lecture: OS-A (Operating Systems - Sec A)', isLab: false },
        slot_4: null,
        slot_5: { codeOrAbbr: 'OS-B', fullDetail: 'Lecture: OS-B (Operating Systems - Sec B)', isLab: false },
        slot_6: null,
      },
      WED: {
        slot_1: null,
        slot_2: null,
        slot_3: { codeOrAbbr: 'OS-A / OS LAB', fullDetail: 'Lecture: OS-A | Lab: OS LAB (C) SEC-A', isLab: false },
        slot_4: { codeOrAbbr: 'OS LAB (C) SEC-A', fullDetail: 'Lab Session: OS LAB (C) SEC-A (Operating Systems Lab)', isLab: true },
        slot_5: { codeOrAbbr: 'OS-AIML', fullDetail: 'Lecture: OS-AIML (Operating Systems for AI & ML)', isLab: false },
        slot_6: null,
      },
      THU: {
        slot_1: { codeOrAbbr: 'OS LAB (B) SEC-A', fullDetail: 'Lab Session: OS LAB (B) SEC-A (Operating Systems Lab)', isLab: true },
        slot_2: { codeOrAbbr: 'OS LAB (B) SEC-A', fullDetail: 'Lab Session: OS LAB (B) SEC-A (Operating Systems Lab)', isLab: true },
        slot_3: { codeOrAbbr: 'OS-B', fullDetail: 'Lecture: OS-B (Operating Systems - Sec B)', isLab: false },
        slot_4: null,
        slot_5: { codeOrAbbr: 'OS-AIML', fullDetail: 'Lecture: OS-AIML (Operating Systems for AI & ML)', isLab: false },
        slot_6: null,
      },
      FRI: {
        slot_1: { codeOrAbbr: 'OS-AIML', fullDetail: 'Lecture: OS-AIML (Operating Systems for AI & ML)', isLab: false },
        slot_2: null,
        slot_3: { codeOrAbbr: 'OS-B', fullDetail: 'Lecture: OS-B (Operating Systems - Sec B)', isLab: false },
        slot_4: null,
        slot_5: { codeOrAbbr: 'OS-A', fullDetail: 'Lecture: OS-A (Operating Systems - Sec A)', isLab: false },
        slot_6: null,
      },
      SAT: {
        slot_1: { codeOrAbbr: 'OS LAB (A) SEC-A', fullDetail: 'Lab Session: OS LAB (A) SEC-A (Operating Systems Lab)', isLab: true },
        slot_2: { codeOrAbbr: 'OS LAB (A) SEC-A', fullDetail: 'Lab Session: OS LAB (A) SEC-A (Operating Systems Lab)', isLab: true },
        slot_3: { codeOrAbbr: 'OS-A', fullDetail: 'Lecture: OS-A (Operating Systems - Sec A)', isLab: false },
        slot_4: null,
        slot_5: null,
        slot_6: null,
      },
    },
  },

  // 4. Mrs. T. Aruna Jyothi (Th: 6, Lab: 14, CRT: 2, Total: 22)
  {
    id: 'fac_aruna',
    name: 'Mrs. T. Aruna Jyothi',
    aliases: ['MRS. T. ARUNA JYOTHI', 'T. ARUNA JYOTHI', 'T ARUNA JYOTHI', 'ARUNA JYOTHI'],
    designation: 'Assistant Professor & Class Teacher (V IT-A)',
    workload: { theory: 6, lab: 14, crt: 2, total: 22 },
    primarySubjects: ['AI-A', 'AI-B', 'AI LAB', 'AIML DV LAB', 'CRT V SEM'],
    rawScheduleText: {
      MON: 'Slot I: AI-A | Slot III-IV: AI LAB (A) SEC-B | Slot V-VI: AI LAB (A) SEC-A',
      TUE: 'Slot I-II: CRT- IT V SEM A | Slot V-VI: AIML DV LAB (C)',
      WED: 'Slot II: AI-A | Slot IV: AI-B',
      THU: 'Slot I: AI-B | Slot III-IV: AI LAB (B) SEC-B | Slot V-VI: AI LAB (B) SEC-A',
      FRI: 'Slot I: AI-B | Slot III-IV: AI LAB (C) SEC-B | Slot VI: AI-A',
      SAT: 'Slot III-IV: AI LAB (C) SEC-A',
    },
    schedule: {
      MON: {
        slot_1: { codeOrAbbr: 'AI-A', fullDetail: 'Lecture: AI-A (Artificial Intelligence - Sec A)', isLab: false },
        slot_2: null,
        slot_3: { codeOrAbbr: 'AI LAB (A) SEC-B', fullDetail: 'Lab Session: AI LAB (A) SEC-B (Artificial Intelligence Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'AI LAB (A) SEC-B', fullDetail: 'Lab Session: AI LAB (A) SEC-B (Artificial Intelligence Lab)', isLab: true },
        slot_5: { codeOrAbbr: 'AI LAB (A) SEC-A', fullDetail: 'Lab Session: AI LAB (A) SEC-A (Artificial Intelligence Lab)', isLab: true },
        slot_6: { codeOrAbbr: 'AI LAB (A) SEC-A', fullDetail: 'Lab Session: AI LAB (A) SEC-A (Artificial Intelligence Lab)', isLab: true },
      },
      TUE: {
        slot_1: { codeOrAbbr: 'CRT- IT V SEM A', fullDetail: 'CRT Session: CRT- IT V SEM A (Campus Recruitment Training)', isLab: false, isCrt: true },
        slot_2: { codeOrAbbr: 'CRT- IT V SEM A', fullDetail: 'CRT Session: CRT- IT V SEM A (Campus Recruitment Training)', isLab: false, isCrt: true },
        slot_3: null,
        slot_4: null,
        slot_5: { codeOrAbbr: 'AIML DV LAB (C)', fullDetail: 'Lab Session: AIML DV LAB (C) (Data Visualization Lab)', isLab: true },
        slot_6: { codeOrAbbr: 'AIML DV LAB (C)', fullDetail: 'Lab Session: AIML DV LAB (C) (Data Visualization Lab)', isLab: true },
      },
      WED: {
        slot_1: null,
        slot_2: { codeOrAbbr: 'AI-A', fullDetail: 'Lecture: AI-A (Artificial Intelligence - Sec A)', isLab: false },
        slot_3: null,
        slot_4: { codeOrAbbr: 'AI-B', fullDetail: 'Lecture: AI-B (Artificial Intelligence - Sec B)', isLab: false },
        slot_5: null,
        slot_6: null,
      },
      THU: {
        slot_1: { codeOrAbbr: 'AI-B', fullDetail: 'Lecture: AI-B (Artificial Intelligence - Sec B)', isLab: false },
        slot_2: null,
        slot_3: { codeOrAbbr: 'AI LAB (B) SEC-B', fullDetail: 'Lab Session: AI LAB (B) SEC-B (Artificial Intelligence Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'AI LAB (B) SEC-B', fullDetail: 'Lab Session: AI LAB (B) SEC-B (Artificial Intelligence Lab)', isLab: true },
        slot_5: { codeOrAbbr: 'AI LAB (B) SEC-A', fullDetail: 'Lab Session: AI LAB (B) SEC-A (Artificial Intelligence Lab)', isLab: true },
        slot_6: { codeOrAbbr: 'AI LAB (B) SEC-A', fullDetail: 'Lab Session: AI LAB (B) SEC-A (Artificial Intelligence Lab)', isLab: true },
      },
      FRI: {
        slot_1: { codeOrAbbr: 'AI-B', fullDetail: 'Lecture: AI-B (Artificial Intelligence - Sec B)', isLab: false },
        slot_2: null,
        slot_3: { codeOrAbbr: 'AI LAB (C) SEC-B', fullDetail: 'Lab Session: AI LAB (C) SEC-B (Artificial Intelligence Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'AI LAB (C) SEC-B', fullDetail: 'Lab Session: AI LAB (C) SEC-B (Artificial Intelligence Lab)', isLab: true },
        slot_5: null,
        slot_6: { codeOrAbbr: 'AI-A', fullDetail: 'Lecture: AI-A (Artificial Intelligence - Sec A)', isLab: false },
      },
      SAT: {
        slot_1: null,
        slot_2: null,
        slot_3: { codeOrAbbr: 'AI LAB (C) SEC-A', fullDetail: 'Lab Session: AI LAB (C) SEC-A (Artificial Intelligence Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'AI LAB (C) SEC-A', fullDetail: 'Lab Session: AI LAB (C) SEC-A (Artificial Intelligence Lab)', isLab: true },
        slot_5: null,
        slot_6: null,
      },
    },
  },

  // 5. Mrs. S. Nagajyothi (Th: 9, Lab: 12, Total: 21)
  {
    id: 'fac_nagajyothi',
    name: 'Mrs. S. Nagajyothi',
    aliases: ['MRS. S. NAGAJYOTHI', 'S. NAGAJYOTHI', 'S NAGAJYOTHI', 'NAGAJYOTHI'],
    designation: 'Assistant Professor & Class Teacher (VII IT-B)',
    workload: { theory: 9, lab: 12, total: 21 },
    primarySubjects: ['AT&CD', 'OS-A', 'OS-B', 'OS LAB'],
    rawScheduleText: {
      MON: 'Slot II: AT&CD | Slot III-IV: OS LAB (B) SEC-B | Slot V-VI: OS LAB (B) SEC-A',
      TUE: 'Slot V-VI: AT&CD',
      WED: 'Slot I: OS-A | Slot III: AT&CD | Slot V: OS-B',
      THU: 'Slot III-IV: OS LAB (C) SEC-B | Slot V-VI: OS LAB (C) SEC-A',
      FRI: 'Slot III: OS-A | Slot V: OS-B',
      SAT: 'Slot I: OS-B | Slot III-IV: OS LAB (A) SEC-B | Slot V: OS-A',
    },
    schedule: {
      MON: {
        slot_1: null,
        slot_2: { codeOrAbbr: 'AT&CD', fullDetail: 'Lecture: AT&CD (Automata Theory & Compiler Design)', isLab: false },
        slot_3: { codeOrAbbr: 'OS LAB (B) SEC-B', fullDetail: 'Lab Session: OS LAB (B) SEC-B (Operating Systems Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'OS LAB (B) SEC-B', fullDetail: 'Lab Session: OS LAB (B) SEC-B (Operating Systems Lab)', isLab: true },
        slot_5: { codeOrAbbr: 'OS LAB (B) SEC-A', fullDetail: 'Lab Session: OS LAB (B) SEC-A (Operating Systems Lab)', isLab: true },
        slot_6: { codeOrAbbr: 'OS LAB (B) SEC-A', fullDetail: 'Lab Session: OS LAB (B) SEC-A (Operating Systems Lab)', isLab: true },
      },
      TUE: {
        slot_1: null,
        slot_2: null,
        slot_3: null,
        slot_4: null,
        slot_5: { codeOrAbbr: 'AT&CD', fullDetail: 'Lecture: AT&CD (Automata Theory & Compiler Design)', isLab: false },
        slot_6: { codeOrAbbr: 'AT&CD', fullDetail: 'Lecture: AT&CD (Automata Theory & Compiler Design)', isLab: false },
      },
      WED: {
        slot_1: { codeOrAbbr: 'OS-A', fullDetail: 'Lecture: OS-A (Operating Systems - Sec A)', isLab: false },
        slot_2: null,
        slot_3: { codeOrAbbr: 'AT&CD', fullDetail: 'Lecture: AT&CD (Automata Theory & Compiler Design)', isLab: false },
        slot_4: null,
        slot_5: { codeOrAbbr: 'OS-B', fullDetail: 'Lecture: OS-B (Operating Systems - Sec B)', isLab: false },
        slot_6: null,
      },
      THU: {
        slot_1: null,
        slot_2: null,
        slot_3: { codeOrAbbr: 'OS LAB (C) SEC-B', fullDetail: 'Lab Session: OS LAB (C) SEC-B (Operating Systems Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'OS LAB (C) SEC-B', fullDetail: 'Lab Session: OS LAB (C) SEC-B (Operating Systems Lab)', isLab: true },
        slot_5: { codeOrAbbr: 'OS LAB (C) SEC-A', fullDetail: 'Lab Session: OS LAB (C) SEC-A (Operating Systems Lab)', isLab: true },
        slot_6: { codeOrAbbr: 'OS LAB (C) SEC-A', fullDetail: 'Lab Session: OS LAB (C) SEC-A (Operating Systems Lab)', isLab: true },
      },
      FRI: {
        slot_1: null,
        slot_2: null,
        slot_3: { codeOrAbbr: 'OS-A', fullDetail: 'Lecture: OS-A (Operating Systems - Sec A)', isLab: false },
        slot_4: null,
        slot_5: { codeOrAbbr: 'OS-B', fullDetail: 'Lecture: OS-B (Operating Systems - Sec B)', isLab: false },
        slot_6: null,
      },
      SAT: {
        slot_1: { codeOrAbbr: 'OS-B', fullDetail: 'Lecture: OS-B (Operating Systems - Sec B)', isLab: false },
        slot_2: null,
        slot_3: { codeOrAbbr: 'OS LAB (A) SEC-B', fullDetail: 'Lab Session: OS LAB (A) SEC-B (Operating Systems Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'OS LAB (A) SEC-B', fullDetail: 'Lab Session: OS LAB (A) SEC-B (Operating Systems Lab)', isLab: true },
        slot_5: { codeOrAbbr: 'OS-A', fullDetail: 'Lecture: OS-A (Operating Systems - Sec A)', isLab: false },
        slot_6: null,
      },
    },
  },

  // 6. Mrs. M. Srividya (Th: 9, Lab: 8, Total: 17)
  {
    id: 'fac_srividya',
    name: 'Mrs. M. Srividya',
    aliases: ['MRS. M. SRIVIDYA', 'M. SRIVIDYA', 'M SRIVIDYA', 'SRIVIDYA'],
    designation: 'Assistant Professor',
    workload: { theory: 9, lab: 8, total: 17 },
    primarySubjects: ['PPL-A & B', 'CME HCI', 'DS LAB', 'IOT LAB'],
    rawScheduleText: {
      MON: 'Slot I-II: DS LAB (C) SEC-A | Slot III: PPL-A | Slot V-VI: PPL-B',
      TUE: 'Slot III-IV: CME HCI',
      WED: 'Slot I-II: CME HCI | Slot III-IV: DS LAB (A) SEC-A | Slot V-VI: IOT LAB (B) SEC-B',
      THU: 'Slot I-II: CME HCI | Slot V: PPL-A',
      FRI: 'Slot III-IV: PPL-A',
      SAT: 'Slot I-II: DS LAB (B) SEC-A | Slot V: PPL-B',
    },
    schedule: {
      MON: {
        slot_1: { codeOrAbbr: 'DS LAB (C) SEC-A', fullDetail: 'Lab Session: DS LAB (C) SEC-A (Data Structures Lab)', isLab: true },
        slot_2: { codeOrAbbr: 'DS LAB (C) SEC-A', fullDetail: 'Lab Session: DS LAB (C) SEC-A (Data Structures Lab)', isLab: true },
        slot_3: { codeOrAbbr: 'PPL-A', fullDetail: 'Lecture: PPL-A (Principles of Programming Languages - Sec A)', isLab: false },
        slot_4: null,
        slot_5: { codeOrAbbr: 'PPL-B', fullDetail: 'Lecture: PPL-B (Principles of Programming Languages - Sec B)', isLab: false },
        slot_6: { codeOrAbbr: 'PPL-B', fullDetail: 'Lecture: PPL-B (Principles of Programming Languages - Sec B)', isLab: false },
      },
      TUE: {
        slot_1: null,
        slot_2: null,
        slot_3: { codeOrAbbr: 'CME HCI', fullDetail: 'Lecture: CME HCI (Human-Computer Interaction - CME)', isLab: false },
        slot_4: { codeOrAbbr: 'CME HCI', fullDetail: 'Lecture: CME HCI (Human-Computer Interaction - CME)', isLab: false },
        slot_5: null,
        slot_6: null,
      },
      WED: {
        slot_1: { codeOrAbbr: 'CME HCI', fullDetail: 'Lecture: CME HCI (Human-Computer Interaction - CME)', isLab: false },
        slot_2: { codeOrAbbr: 'CME HCI', fullDetail: 'Lecture: CME HCI (Human-Computer Interaction - CME)', isLab: false },
        slot_3: { codeOrAbbr: 'DS LAB (A) SEC-A', fullDetail: 'Lab Session: DS LAB (A) SEC-A (Data Structures Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'DS LAB (A) SEC-A', fullDetail: 'Lab Session: DS LAB (A) SEC-A (Data Structures Lab)', isLab: true },
        slot_5: { codeOrAbbr: 'IOT LAB (B) SEC-B', fullDetail: 'Lab Session: IOT LAB (B) SEC-B (Internet of Things Lab)', isLab: true },
        slot_6: { codeOrAbbr: 'IOT LAB (B) SEC-B', fullDetail: 'Lab Session: IOT LAB (B) SEC-B (Internet of Things Lab)', isLab: true },
      },
      THU: {
        slot_1: { codeOrAbbr: 'CME HCI', fullDetail: 'Lecture: CME HCI (Human-Computer Interaction - CME)', isLab: false },
        slot_2: { codeOrAbbr: 'CME HCI', fullDetail: 'Lecture: CME HCI (Human-Computer Interaction - CME)', isLab: false },
        slot_3: null,
        slot_4: null,
        slot_5: { codeOrAbbr: 'PPL-A', fullDetail: 'Lecture: PPL-A (Principles of Programming Languages - Sec A)', isLab: false },
        slot_6: null,
      },
      FRI: {
        slot_1: null,
        slot_2: null,
        slot_3: { codeOrAbbr: 'PPL-A', fullDetail: 'Lecture: PPL-A (Principles of Programming Languages - Sec A)', isLab: false },
        slot_4: { codeOrAbbr: 'PPL-A', fullDetail: 'Lecture: PPL-A (Principles of Programming Languages - Sec A)', isLab: false },
        slot_5: null,
        slot_6: null,
      },
      SAT: {
        slot_1: { codeOrAbbr: 'DS LAB (B) SEC-A', fullDetail: 'Lab Session: DS LAB (B) SEC-A (Data Structures Lab)', isLab: true },
        slot_2: { codeOrAbbr: 'DS LAB (B) SEC-A', fullDetail: 'Lab Session: DS LAB (B) SEC-A (Data Structures Lab)', isLab: true },
        slot_3: null,
        slot_4: null,
        slot_5: { codeOrAbbr: 'PPL-B', fullDetail: 'Lecture: PPL-B (Principles of Programming Languages - Sec B)', isLab: false },
        slot_6: null,
      },
    },
  },

  // 7. Dr. K. Durga Prasad (Th: 11, Lab: 8, CRT: 2, Total: 21)
  {
    id: 'fac_durga_prasad',
    name: 'Dr. K. Durga Prasad',
    aliases: ['DR. K. DURGA PRASAD', 'K. DURGA PRASAD', 'K DURGA PRASAD', 'DURGA PRASAD'],
    designation: 'Associate Professor',
    workload: { theory: 11, lab: 8, crt: 2, total: 21 },
    primarySubjects: ['SE-CME', 'DELD-A & B', 'IOT LAB', 'CME ML LAB', 'CRT CME'],
    rawScheduleText: {
      MON: 'Slot I-II: IOT LAB (A) SEC-B | Slot V-VI: CME ML LAB (A & B)',
      TUE: 'Slot I: SE-CME | Slot III: DELD-A | Slot V: DELD-B',
      WED: 'Slot I: DELD-A | Slot V-VI: IOT LAB (B) SEC-B',
      THU: 'Slot I-II: CRT-CME V SEM | Slot III-IV: IOT LAB (B) SEC-A | Slot V: DELD-B | Slot VI: DELD-A',
      FRI: 'Slot II: DELD-B | Slot III: SE-CME | Slot V: DELD-A',
      SAT: 'Slot II: SE-CME | Slot III: DELD-B',
    },
    schedule: {
      MON: {
        slot_1: { codeOrAbbr: 'IOT LAB (A) SEC-B', fullDetail: 'Lab Session: IOT LAB (A) SEC-B (Internet of Things Lab)', isLab: true },
        slot_2: { codeOrAbbr: 'IOT LAB (A) SEC-B', fullDetail: 'Lab Session: IOT LAB (A) SEC-B (Internet of Things Lab)', isLab: true },
        slot_3: null,
        slot_4: null,
        slot_5: { codeOrAbbr: 'CME ML LAB (A & B)', fullDetail: 'Lab Session: CME ML LAB (A & B) (Machine Learning Lab)', isLab: true },
        slot_6: { codeOrAbbr: 'CME ML LAB (A & B)', fullDetail: 'Lab Session: CME ML LAB (A & B) (Machine Learning Lab)', isLab: true },
      },
      TUE: {
        slot_1: { codeOrAbbr: 'SE-CME', fullDetail: 'Lecture: SE-CME (Software Engineering - CME)', isLab: false },
        slot_2: null,
        slot_3: { codeOrAbbr: 'DELD-A', fullDetail: 'Lecture: DELD-A (Digital Electronics & Logic Design - Sec A)', isLab: false },
        slot_4: null,
        slot_5: { codeOrAbbr: 'DELD-B', fullDetail: 'Lecture: DELD-B (Digital Electronics & Logic Design - Sec B)', isLab: false },
        slot_6: null,
      },
      WED: {
        slot_1: { codeOrAbbr: 'DELD-A', fullDetail: 'Lecture: DELD-A (Digital Electronics & Logic Design - Sec A)', isLab: false },
        slot_2: null,
        slot_3: null,
        slot_4: null,
        slot_5: { codeOrAbbr: 'IOT LAB (B) SEC-B', fullDetail: 'Lab Session: IOT LAB (B) SEC-B (Internet of Things Lab)', isLab: true },
        slot_6: { codeOrAbbr: 'IOT LAB (B) SEC-B', fullDetail: 'Lab Session: IOT LAB (B) SEC-B (Internet of Things Lab)', isLab: true },
      },
      THU: {
        slot_1: { codeOrAbbr: 'CRT-CME V SEM', fullDetail: 'CRT Session: CRT-CME V SEM (Campus Recruitment Training)', isLab: false, isCrt: true },
        slot_2: { codeOrAbbr: 'CRT-CME V SEM', fullDetail: 'CRT Session: CRT-CME V SEM (Campus Recruitment Training)', isLab: false, isCrt: true },
        slot_3: { codeOrAbbr: 'IOT LAB (B) SEC-A', fullDetail: 'Lab Session: IOT LAB (B) SEC-A (Internet of Things Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'IOT LAB (B) SEC-A', fullDetail: 'Lab Session: IOT LAB (B) SEC-A (Internet of Things Lab)', isLab: true },
        slot_5: { codeOrAbbr: 'DELD-B', fullDetail: 'Lecture: DELD-B (Digital Electronics & Logic Design - Sec B)', isLab: false },
        slot_6: { codeOrAbbr: 'DELD-A', fullDetail: 'Lecture: DELD-A (Digital Electronics & Logic Design - Sec A)', isLab: false },
      },
      FRI: {
        slot_1: null,
        slot_2: { codeOrAbbr: 'DELD-B', fullDetail: 'Lecture: DELD-B (Digital Electronics & Logic Design - Sec B)', isLab: false },
        slot_3: { codeOrAbbr: 'SE-CME', fullDetail: 'Lecture: SE-CME (Software Engineering - CME)', isLab: false },
        slot_4: null,
        slot_5: { codeOrAbbr: 'DELD-A', fullDetail: 'Lecture: DELD-A (Digital Electronics & Logic Design - Sec A)', isLab: false },
        slot_6: null,
      },
      SAT: {
        slot_1: null,
        slot_2: { codeOrAbbr: 'SE-CME', fullDetail: 'Lecture: SE-CME (Software Engineering - CME)', isLab: false },
        slot_3: { codeOrAbbr: 'DELD-B', fullDetail: 'Lecture: DELD-B (Digital Electronics & Logic Design - Sec B)', isLab: false },
        slot_4: null,
        slot_5: null,
        slot_6: null,
      },
    },
  },

  // 8. Mrs. K. Mounika (Th: 6, Lab: 12, CRT: 2, Total: 20)
  {
    id: 'fac_mounika',
    name: 'Mrs. K. Mounika',
    aliases: ['MRS. K. MOUNIKA', 'K. MOUNIKA', 'K MOUNIKA', 'MOUNIKA'],
    designation: 'Assistant Professor & Class Teacher (V IT-B)',
    workload: { theory: 6, lab: 12, crt: 2, total: 20 },
    primarySubjects: ['FSD-A & B', 'FSD LAB', 'CRT V SEM B'],
    rawScheduleText: {
      MON: 'Slot II: FSD-A | Slot III-IV: FSD LAB (C) SEC-B | Slot V-VI: FSD LAB (C) SEC-A',
      TUE: 'Slot I-II: CRT-IT V SEM B',
      WED: 'Slot II: FSD-B | Slot IV: FSD-A',
      THU: 'Slot II: FSD-B | Slot III-IV: FSD LAB (A) SEC-B | Slot V-VI: FSD LAB (A) SEC-A',
      FRI: 'Slot I: FSD-A | Slot III-IV: FSD LAB (B) SEC-B',
      SAT: 'Slot III-IV: FSD LAB (B) SEC-A',
    },
    schedule: {
      MON: {
        slot_1: null,
        slot_2: { codeOrAbbr: 'FSD-A', fullDetail: 'Lecture: FSD-A (Full Stack Development - Sec A)', isLab: false },
        slot_3: { codeOrAbbr: 'FSD LAB (C) SEC-B', fullDetail: 'Lab Session: FSD LAB (C) SEC-B (Full Stack Development Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'FSD LAB (C) SEC-B', fullDetail: 'Lab Session: FSD LAB (C) SEC-B (Full Stack Development Lab)', isLab: true },
        slot_5: { codeOrAbbr: 'FSD LAB (C) SEC-A', fullDetail: 'Lab Session: FSD LAB (C) SEC-A (Full Stack Development Lab)', isLab: true },
        slot_6: { codeOrAbbr: 'FSD LAB (C) SEC-A', fullDetail: 'Lab Session: FSD LAB (C) SEC-A (Full Stack Development Lab)', isLab: true },
      },
      TUE: {
        slot_1: { codeOrAbbr: 'CRT-IT V SEM B', fullDetail: 'CRT Session: CRT-IT V SEM B (Campus Recruitment Training)', isLab: false, isCrt: true },
        slot_2: { codeOrAbbr: 'CRT-IT V SEM B', fullDetail: 'CRT Session: CRT-IT V SEM B (Campus Recruitment Training)', isLab: false, isCrt: true },
        slot_3: null,
        slot_4: null,
        slot_5: null,
        slot_6: null,
      },
      WED: {
        slot_1: null,
        slot_2: { codeOrAbbr: 'FSD-B', fullDetail: 'Lecture: FSD-B (Full Stack Development - Sec B)', isLab: false },
        slot_3: null,
        slot_4: { codeOrAbbr: 'FSD-A', fullDetail: 'Lecture: FSD-A (Full Stack Development - Sec A)', isLab: false },
        slot_5: null,
        slot_6: null,
      },
      THU: {
        slot_1: null,
        slot_2: { codeOrAbbr: 'FSD-B', fullDetail: 'Lecture: FSD-B (Full Stack Development - Sec B)', isLab: false },
        slot_3: { codeOrAbbr: 'FSD LAB (A) SEC-B', fullDetail: 'Lab Session: FSD LAB (A) SEC-B (Full Stack Development Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'FSD LAB (A) SEC-B', fullDetail: 'Lab Session: FSD LAB (A) SEC-B (Full Stack Development Lab)', isLab: true },
        slot_5: { codeOrAbbr: 'FSD LAB (A) SEC-A', fullDetail: 'Lab Session: FSD LAB (A) SEC-A (Full Stack Development Lab)', isLab: true },
        slot_6: { codeOrAbbr: 'FSD LAB (A) SEC-A', fullDetail: 'Lab Session: FSD LAB (A) SEC-A (Full Stack Development Lab)', isLab: true },
      },
      FRI: {
        slot_1: { codeOrAbbr: 'FSD-A', fullDetail: 'Lecture: FSD-A (Full Stack Development - Sec A)', isLab: false },
        slot_2: null,
        slot_3: { codeOrAbbr: 'FSD LAB (B) SEC-B', fullDetail: 'Lab Session: FSD LAB (B) SEC-B (Full Stack Development Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'FSD LAB (B) SEC-B', fullDetail: 'Lab Session: FSD LAB (B) SEC-B (Full Stack Development Lab)', isLab: true },
        slot_5: null,
        slot_6: null,
      },
      SAT: {
        slot_1: null,
        slot_2: null,
        slot_3: { codeOrAbbr: 'FSD LAB (B) SEC-A', fullDetail: 'Lab Session: FSD LAB (B) SEC-A (Full Stack Development Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'FSD LAB (B) SEC-A', fullDetail: 'Lab Session: FSD LAB (B) SEC-A (Full Stack Development Lab)', isLab: true },
        slot_5: null,
        slot_6: null,
      },
    },
  },

  // 9. Mr. A. Rajesh (Th: 9, Lab: 10, CRT: 2, Total: 21)
  {
    id: 'fac_rajesh',
    name: 'Mr. A. Rajesh',
    aliases: ['MR. A. RAJESH', 'A. RAJESH', 'A RAJESH', 'RAJESH'],
    designation: 'Assistant Professor & Class Teacher (VII IT-A)',
    workload: { theory: 9, lab: 10, crt: 2, total: 21 },
    primarySubjects: ['CS-A & B', 'CS-CME', 'CME CD LAB', 'AIML DS LAB', 'CRT V SEM B', 'OS LAB'],
    rawScheduleText: {
      MON: 'Slot I: CS-CME | Slot IV: CS-A | Slot V-VI: CME ML LAB (A & B)',
      TUE: 'Slot I-II: CS-A | Slot III-IV: CME CD LAB (A) | Slot V-VI: CRT-IT V SEM B',
      WED: 'Slot I-II: CS-B | Slot V: CS-CME',
      THU: 'Slot III: CS-A | Slot V: CS-B',
      FRI: 'Slot III-IV: CME CD LAB (B) | Slot V-VI: AIML DS LAB (A)',
      SAT: 'Slot I-II: OS LAB (A) SEC-A | Slot V: CS-CME',
    },
    schedule: {
      MON: {
        slot_1: { codeOrAbbr: 'CS-CME', fullDetail: 'Lecture: CS-CME (Cyber Security - CME)', isLab: false },
        slot_2: null,
        slot_3: null,
        slot_4: { codeOrAbbr: 'CS-A', fullDetail: 'Lecture: CS-A (Cyber Security - Sec A)', isLab: false },
        slot_5: { codeOrAbbr: 'CME ML LAB (A & B)', fullDetail: 'Lab Session: CME ML LAB (A & B) (Machine Learning Lab)', isLab: true },
        slot_6: { codeOrAbbr: 'CME ML LAB (A & B)', fullDetail: 'Lab Session: CME ML LAB (A & B) (Machine Learning Lab)', isLab: true },
      },
      TUE: {
        slot_1: { codeOrAbbr: 'CS-A', fullDetail: 'Lecture: CS-A (Cyber Security - Sec A)', isLab: false },
        slot_2: { codeOrAbbr: 'CS-A', fullDetail: 'Lecture: CS-A (Cyber Security - Sec A)', isLab: false },
        slot_3: { codeOrAbbr: 'CME CD LAB (A)', fullDetail: 'Lab Session: CME CD LAB (A) (Compiler Design Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'CME CD LAB (A)', fullDetail: 'Lab Session: CME CD LAB (A) (Compiler Design Lab)', isLab: true },
        slot_5: { codeOrAbbr: 'CRT-IT V SEM B', fullDetail: 'CRT Session: CRT-IT V SEM B (Campus Recruitment Training)', isLab: false, isCrt: true },
        slot_6: { codeOrAbbr: 'CRT-IT V SEM B', fullDetail: 'CRT Session: CRT-IT V SEM B (Campus Recruitment Training)', isLab: false, isCrt: true },
      },
      WED: {
        slot_1: { codeOrAbbr: 'CS-B', fullDetail: 'Lecture: CS-B (Cyber Security - Sec B)', isLab: false },
        slot_2: { codeOrAbbr: 'CS-B', fullDetail: 'Lecture: CS-B (Cyber Security - Sec B)', isLab: false },
        slot_3: null,
        slot_4: null,
        slot_5: { codeOrAbbr: 'CS-CME', fullDetail: 'Lecture: CS-CME (Cyber Security - CME)', isLab: false },
        slot_6: null,
      },
      THU: {
        slot_1: null,
        slot_2: null,
        slot_3: { codeOrAbbr: 'CS-A', fullDetail: 'Lecture: CS-A (Cyber Security - Sec A)', isLab: false },
        slot_4: null,
        slot_5: { codeOrAbbr: 'CS-B', fullDetail: 'Lecture: CS-B (Cyber Security - Sec B)', isLab: false },
        slot_6: null,
      },
      FRI: {
        slot_1: null,
        slot_2: null,
        slot_3: { codeOrAbbr: 'CME CD LAB (B)', fullDetail: 'Lab Session: CME CD LAB (B) (Compiler Design Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'CME CD LAB (B)', fullDetail: 'Lab Session: CME CD LAB (B) (Compiler Design Lab)', isLab: true },
        slot_5: { codeOrAbbr: 'AIML DS LAB (A)', fullDetail: 'Lab Session: AIML DS LAB (A) (Data Science Lab)', isLab: true },
        slot_6: { codeOrAbbr: 'AIML DS LAB (A)', fullDetail: 'Lab Session: AIML DS LAB (A) (Data Science Lab)', isLab: true },
      },
      SAT: {
        slot_1: { codeOrAbbr: 'OS LAB (A) SEC-A', fullDetail: 'Lab Session: OS LAB (A) SEC-A (Operating Systems Lab)', isLab: true },
        slot_2: { codeOrAbbr: 'OS LAB (A) SEC-A', fullDetail: 'Lab Session: OS LAB (A) SEC-A (Operating Systems Lab)', isLab: true },
        slot_3: null,
        slot_4: null,
        slot_5: { codeOrAbbr: 'CS-CME', fullDetail: 'Lecture: CS-CME (Cyber Security - CME)', isLab: false },
        slot_6: null,
      },
    },
  },

  // 10. MS. J. Nagalaxmi (Th: 3, Lab: 15, CRT: 2, Total: 20)
  {
    id: 'fac_nagalaxmi',
    name: 'Ms. J. Nagalaxmi',
    aliases: ['MS. J. NAGALAXMI', 'J. NAGALAXMI', 'J NAGALAXMI', 'NAGALAXMI'],
    designation: 'Assistant Professor',
    workload: { theory: 3, lab: 15, crt: 2, total: 20 },
    primarySubjects: ['WT LAB', 'CME ML', 'AIML', 'AIML DS LAB', 'CRT-CME'],
    rawScheduleText: {
      MON: 'Slot I-II: WT LAB (A) SEC-A | Slot IV: CME ML | Slot V-VI: CME ML LAB (A & B)',
      TUE: 'Slot I-II: WT LAB (C) SEC-B | Slot III: AIML | Slot V-VI: AIML DS LAB (B)',
      WED: 'Slot III-IV: WT LAB (B) SEC-A | Slot V-VI: WT LAB (B) SEC-B',
      THU: 'Slot I-II: WT LAB (C) SEC-A | Slot III-IV: CRT-CME V SEM',
      FRI: 'Slot III: CME ML',
      SAT: 'No scheduled teaching periods',
    },
    schedule: {
      MON: {
        slot_1: { codeOrAbbr: 'WT LAB (A) SEC-A', fullDetail: 'Lab Session: WT LAB (A) SEC-A (Web Technologies Lab)', isLab: true },
        slot_2: { codeOrAbbr: 'WT LAB (A) SEC-A', fullDetail: 'Lab Session: WT LAB (A) SEC-A (Web Technologies Lab)', isLab: true },
        slot_3: null,
        slot_4: { codeOrAbbr: 'CME ML', fullDetail: 'Lecture: CME ML (Machine Learning - CME)', isLab: false },
        slot_5: { codeOrAbbr: 'CME ML LAB (A & B)', fullDetail: 'Lab Session: CME ML LAB (A & B) (Machine Learning Lab)', isLab: true },
        slot_6: { codeOrAbbr: 'CME ML LAB (A & B)', fullDetail: 'Lab Session: CME ML LAB (A & B) (Machine Learning Lab)', isLab: true },
      },
      TUE: {
        slot_1: { codeOrAbbr: 'WT LAB (C) SEC-B', fullDetail: 'Lab Session: WT LAB (C) SEC-B (Web Technologies Lab)', isLab: true },
        slot_2: { codeOrAbbr: 'WT LAB (C) SEC-B', fullDetail: 'Lab Session: WT LAB (C) SEC-B (Web Technologies Lab)', isLab: true },
        slot_3: { codeOrAbbr: 'AIML', fullDetail: 'Lecture: AIML (Artificial Intelligence & Machine Learning)', isLab: false },
        slot_4: null,
        slot_5: { codeOrAbbr: 'AIML DS LAB (B)', fullDetail: 'Lab Session: AIML DS LAB (B) (Data Science Lab)', isLab: true },
        slot_6: { codeOrAbbr: 'AIML DS LAB (B)', fullDetail: 'Lab Session: AIML DS LAB (B) (Data Science Lab)', isLab: true },
      },
      WED: {
        slot_1: null,
        slot_2: null,
        slot_3: { codeOrAbbr: 'WT LAB (B) SEC-A', fullDetail: 'Lab Session: WT LAB (B) SEC-A (Web Technologies Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'WT LAB (B) SEC-A', fullDetail: 'Lab Session: WT LAB (B) SEC-A (Web Technologies Lab)', isLab: true },
        slot_5: { codeOrAbbr: 'WT LAB (B) SEC-B', fullDetail: 'Lab Session: WT LAB (B) SEC-B (Web Technologies Lab)', isLab: true },
        slot_6: { codeOrAbbr: 'WT LAB (B) SEC-B', fullDetail: 'Lab Session: WT LAB (B) SEC-B (Web Technologies Lab)', isLab: true },
      },
      THU: {
        slot_1: { codeOrAbbr: 'WT LAB (C) SEC-A', fullDetail: 'Lab Session: WT LAB (C) SEC-A (Web Technologies Lab)', isLab: true },
        slot_2: { codeOrAbbr: 'WT LAB (C) SEC-A', fullDetail: 'Lab Session: WT LAB (C) SEC-A (Web Technologies Lab)', isLab: true },
        slot_3: { codeOrAbbr: 'CRT-CME V SEM', fullDetail: 'CRT Session: CRT-CME V SEM (Campus Recruitment Training)', isLab: false, isCrt: true },
        slot_4: { codeOrAbbr: 'CRT-CME V SEM', fullDetail: 'CRT Session: CRT-CME V SEM (Campus Recruitment Training)', isLab: false, isCrt: true },
        slot_5: null,
        slot_6: null,
      },
      FRI: {
        slot_1: null,
        slot_2: null,
        slot_3: { codeOrAbbr: 'CME ML', fullDetail: 'Lecture: CME ML (Machine Learning - CME)', isLab: false },
        slot_4: null,
        slot_5: null,
        slot_6: null,
      },
      SAT: {
        slot_1: null,
        slot_2: null,
        slot_3: null,
        slot_4: null,
        slot_5: null,
        slot_6: null,
      },
    },
  },

  // 11. MS. MIZNA (Th: 6, Lab: 16, CRT: 2, Total: 24)
  {
    id: 'fac_mizna',
    name: 'Ms. Mizna',
    aliases: ['MS. MIZNA', 'MIZNA', 'MS MIZNA'],
    designation: 'Assistant Professor',
    workload: { theory: 6, lab: 16, crt: 2, total: 24 },
    primarySubjects: ['IOT-A & B', 'FSD LAB', 'OS LAB', 'CRT V SEM A'],
    rawScheduleText: {
      MON: 'Slot II: IOT-A | Slot III-IV: FSD LAB (C) SEC-B | Slot V-VI: FSD LAB (C) SEC-A',
      TUE: 'Slot I: IOT-B | Slot II: IOT-A | Slot V-VI: CRT-IT V SEM A',
      WED: 'Slot I: IOT-A | Slot II: IOT-B | Slot III-IV: OS LAB (C) SEC-A',
      THU: 'Slot III-IV: OS LAB (B) SEC-A | Slot V-VI: FSD LAB (A) SEC-A',
      FRI: 'Slot I-II: IOT-B | Slot III-IV: FSD LAB (B) SEC-B',
      SAT: 'No scheduled teaching periods',
    },
    schedule: {
      MON: {
        slot_1: null,
        slot_2: { codeOrAbbr: 'IOT-A', fullDetail: 'Lecture: IOT-A (Internet of Things - Sec A)', isLab: false },
        slot_3: { codeOrAbbr: 'FSD LAB (C) SEC-B', fullDetail: 'Lab Session: FSD LAB (C) SEC-B (Full Stack Development Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'FSD LAB (C) SEC-B', fullDetail: 'Lab Session: FSD LAB (C) SEC-B (Full Stack Development Lab)', isLab: true },
        slot_5: { codeOrAbbr: 'FSD LAB (C) SEC-A', fullDetail: 'Lab Session: FSD LAB (C) SEC-A (Full Stack Development Lab)', isLab: true },
        slot_6: { codeOrAbbr: 'FSD LAB (C) SEC-A', fullDetail: 'Lab Session: FSD LAB (C) SEC-A (Full Stack Development Lab)', isLab: true },
      },
      TUE: {
        slot_1: { codeOrAbbr: 'IOT-B', fullDetail: 'Lecture: IOT-B (Internet of Things - Sec B)', isLab: false },
        slot_2: { codeOrAbbr: 'IOT-A', fullDetail: 'Lecture: IOT-A (Internet of Things - Sec A)', isLab: false },
        slot_3: null,
        slot_4: null,
        slot_5: { codeOrAbbr: 'CRT-IT V SEM A', fullDetail: 'CRT Session: CRT-IT V SEM A (Campus Recruitment Training)', isLab: false, isCrt: true },
        slot_6: { codeOrAbbr: 'CRT-IT V SEM A', fullDetail: 'CRT Session: CRT-IT V SEM A (Campus Recruitment Training)', isLab: false, isCrt: true },
      },
      WED: {
        slot_1: { codeOrAbbr: 'IOT-A', fullDetail: 'Lecture: IOT-A (Internet of Things - Sec A)', isLab: false },
        slot_2: { codeOrAbbr: 'IOT-B', fullDetail: 'Lecture: IOT-B (Internet of Things - Sec B)', isLab: false },
        slot_3: { codeOrAbbr: 'OS LAB (C) SEC-A', fullDetail: 'Lab Session: OS LAB (C) SEC-A (Operating Systems Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'OS LAB (C) SEC-A', fullDetail: 'Lab Session: OS LAB (C) SEC-A (Operating Systems Lab)', isLab: true },
        slot_5: null,
        slot_6: null,
      },
      THU: {
        slot_1: null,
        slot_2: null,
        slot_3: { codeOrAbbr: 'OS LAB (B) SEC-A', fullDetail: 'Lab Session: OS LAB (B) SEC-A (Operating Systems Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'OS LAB (B) SEC-A', fullDetail: 'Lab Session: OS LAB (B) SEC-A (Operating Systems Lab)', isLab: true },
        slot_5: { codeOrAbbr: 'FSD LAB (A) SEC-A', fullDetail: 'Lab Session: FSD LAB (A) SEC-A (Full Stack Development Lab)', isLab: true },
        slot_6: { codeOrAbbr: 'FSD LAB (A) SEC-A', fullDetail: 'Lab Session: FSD LAB (A) SEC-A (Full Stack Development Lab)', isLab: true },
      },
      FRI: {
        slot_1: { codeOrAbbr: 'IOT-B', fullDetail: 'Lecture: IOT-B (Internet of Things - Sec B)', isLab: false },
        slot_2: { codeOrAbbr: 'IOT-B', fullDetail: 'Lecture: IOT-B (Internet of Things - Sec B)', isLab: false },
        slot_3: { codeOrAbbr: 'FSD LAB (B) SEC-B', fullDetail: 'Lab Session: FSD LAB (B) SEC-B (Full Stack Development Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'FSD LAB (B) SEC-B', fullDetail: 'Lab Session: FSD LAB (B) SEC-B (Full Stack Development Lab)', isLab: true },
        slot_5: null,
        slot_6: null,
      },
      SAT: {
        slot_1: null,
        slot_2: null,
        slot_3: null,
        slot_4: null,
        slot_5: null,
        slot_6: null,
      },
    },
  },

  // 12. Ms. T. Vijayalaxmi (Th: 3, Lab: 16, CRT: 2, Total: 21)
  {
    id: 'fac_vijayalaxmi',
    name: 'Ms. T. Vijayalaxmi',
    aliases: ['MS. T. VIJAYALAXMI', 'MS. T. VIJAYA LAXMI', 'T. VIJAYALAXMI', 'VIJAYALAXMI'],
    designation: 'Assistant Professor',
    workload: { theory: 3, lab: 16, crt: 2, total: 21 },
    primarySubjects: ['WT LAB', 'CME BDA', 'AIML DS LAB', 'CRT CME'],
    rawScheduleText: {
      MON: 'Slot I-II: WT LAB (A) SEC-B | Slot III-IV: WT LAB (A) SEC-A | Slot V-VI: CME ML LAB (A & B)',
      TUE: 'Slot I-II: WT LAB (C) SEC-B | Slot IV: CME BDA',
      WED: 'Slot III-IV: AIML DS LAB (C) | Slot V-VI: WT LAB (B) SEC-A | Slot VI: WT LAB (B) SEC-B',
      THU: 'Slot I-II: WT LAB (C) SEC-A | Slot IV: CME BDA | Slot V-VI: CRT-CME V SEM',
      FRI: 'Slot IV: CME BDA',
      SAT: 'No scheduled teaching periods',
    },
    schedule: {
      MON: {
        slot_1: { codeOrAbbr: 'WT LAB (A) SEC-B', fullDetail: 'Lab Session: WT LAB (A) SEC-B (Web Technologies Lab)', isLab: true },
        slot_2: { codeOrAbbr: 'WT LAB (A) SEC-B', fullDetail: 'Lab Session: WT LAB (A) SEC-B (Web Technologies Lab)', isLab: true },
        slot_3: { codeOrAbbr: 'WT LAB (A) SEC-A', fullDetail: 'Lab Session: WT LAB (A) SEC-A (Web Technologies Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'WT LAB (A) SEC-A', fullDetail: 'Lab Session: WT LAB (A) SEC-A (Web Technologies Lab)', isLab: true },
        slot_5: { codeOrAbbr: 'CME ML LAB (A & B)', fullDetail: 'Lab Session: CME ML LAB (A & B) (Machine Learning Lab)', isLab: true },
        slot_6: { codeOrAbbr: 'CME ML LAB (A & B)', fullDetail: 'Lab Session: CME ML LAB (A & B) (Machine Learning Lab)', isLab: true },
      },
      TUE: {
        slot_1: { codeOrAbbr: 'WT LAB (C) SEC-B', fullDetail: 'Lab Session: WT LAB (C) SEC-B (Web Technologies Lab)', isLab: true },
        slot_2: { codeOrAbbr: 'WT LAB (C) SEC-B', fullDetail: 'Lab Session: WT LAB (C) SEC-B (Web Technologies Lab)', isLab: true },
        slot_3: null,
        slot_4: { codeOrAbbr: 'CME BDA', fullDetail: 'Lecture: CME BDA (Big Data Analytics - CME)', isLab: false },
        slot_5: null,
        slot_6: null,
      },
      WED: {
        slot_1: null,
        slot_2: null,
        slot_3: { codeOrAbbr: 'AIML DS LAB (C)', fullDetail: 'Lab Session: AIML DS LAB (C) (Data Science Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'AIML DS LAB (C)', fullDetail: 'Lab Session: AIML DS LAB (C) (Data Science Lab)', isLab: true },
        slot_5: { codeOrAbbr: 'WT LAB (B) SEC-A', fullDetail: 'Lab Session: WT LAB (B) SEC-A (Web Technologies Lab)', isLab: true },
        slot_6: { codeOrAbbr: 'WT LAB (B) SEC-B', fullDetail: 'Lab Session: WT LAB (B) SEC-B (Web Technologies Lab)', isLab: true },
      },
      THU: {
        slot_1: { codeOrAbbr: 'WT LAB (C) SEC-A', fullDetail: 'Lab Session: WT LAB (C) SEC-A (Web Technologies Lab)', isLab: true },
        slot_2: { codeOrAbbr: 'WT LAB (C) SEC-A', fullDetail: 'Lab Session: WT LAB (C) SEC-A (Web Technologies Lab)', isLab: true },
        slot_3: null,
        slot_4: { codeOrAbbr: 'CME BDA', fullDetail: 'Lecture: CME BDA (Big Data Analytics - CME)', isLab: false },
        slot_5: { codeOrAbbr: 'CRT-CME V SEM', fullDetail: 'CRT Session: CRT-CME V SEM (Campus Recruitment Training)', isLab: false, isCrt: true },
        slot_6: { codeOrAbbr: 'CRT-CME V SEM', fullDetail: 'CRT Session: CRT-CME V SEM (Campus Recruitment Training)', isLab: false, isCrt: true },
      },
      FRI: {
        slot_1: null,
        slot_2: null,
        slot_3: null,
        slot_4: { codeOrAbbr: 'CME BDA', fullDetail: 'Lecture: CME BDA (Big Data Analytics - CME)', isLab: false },
        slot_5: null,
        slot_6: null,
      },
      SAT: {
        slot_1: null,
        slot_2: null,
        slot_3: null,
        slot_4: null,
        slot_5: null,
        slot_6: null,
      },
    },
  },

  // 13. Mrs. BJ. Praveena (Th: 9, Lab: 8, Total: 17)
  {
    id: 'fac_praveena',
    name: 'Mrs. BJ. Praveena',
    aliases: ['MRS. BJ. PRAVEENA', 'MRS. B.J. PRAVEENA', 'BJ PRAVEENA', 'PRAVEENA'],
    designation: 'Assistant Professor',
    workload: { theory: 9, lab: 8, total: 17 },
    primarySubjects: ['BCT-A & B', 'CN-CME', 'CME AI LAB', 'AIML JAVA LAB'],
    rawScheduleText: {
      MON: 'Slot II: BCT-B | Slot V: CN-CME',
      TUE: 'Slot II: BCT-A | Slot III-IV: CME AI LAB (B) | Slot V-VI: AIML JAVA LAB (A)',
      WED: 'Slot II: BCT-A | Slot V: CN-CME',
      THU: 'Slot II: BCT-B',
      FRI: 'Slot I-II: CME AI LAB (A) | Slot III: BCT-B | Slot V-VI: AIML JAVA LAB (C)',
      SAT: 'Slot V: CN-CME',
    },
    schedule: {
      MON: {
        slot_1: null,
        slot_2: { codeOrAbbr: 'BCT-B', fullDetail: 'Lecture: BCT-B (Blockchain Technologies - Sec B)', isLab: false },
        slot_3: null,
        slot_4: null,
        slot_5: { codeOrAbbr: 'CN-CME', fullDetail: 'Lecture: CN-CME (Computer Networks - CME)', isLab: false },
        slot_6: null,
      },
      TUE: {
        slot_1: null,
        slot_2: { codeOrAbbr: 'BCT-A', fullDetail: 'Lecture: BCT-A (Blockchain Technologies - Sec A)', isLab: false },
        slot_3: { codeOrAbbr: 'CME AI LAB (B)', fullDetail: 'Lab Session: CME AI LAB (B) (Artificial Intelligence Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'CME AI LAB (B)', fullDetail: 'Lab Session: CME AI LAB (B) (Artificial Intelligence Lab)', isLab: true },
        slot_5: { codeOrAbbr: 'AIML JAVA LAB (A)', fullDetail: 'Lab Session: AIML JAVA LAB (A) (Java Programming Lab)', isLab: true },
        slot_6: { codeOrAbbr: 'AIML JAVA LAB (A)', fullDetail: 'Lab Session: AIML JAVA LAB (A) (Java Programming Lab)', isLab: true },
      },
      WED: {
        slot_1: null,
        slot_2: { codeOrAbbr: 'BCT-A', fullDetail: 'Lecture: BCT-A (Blockchain Technologies - Sec A)', isLab: false },
        slot_3: null,
        slot_4: null,
        slot_5: { codeOrAbbr: 'CN-CME', fullDetail: 'Lecture: CN-CME (Computer Networks - CME)', isLab: false },
        slot_6: null,
      },
      THU: {
        slot_1: null,
        slot_2: { codeOrAbbr: 'BCT-B', fullDetail: 'Lecture: BCT-B (Blockchain Technologies - Sec B)', isLab: false },
        slot_3: null,
        slot_4: null,
        slot_5: null,
        slot_6: null,
      },
      FRI: {
        slot_1: { codeOrAbbr: 'CME AI LAB (A)', fullDetail: 'Lab Session: CME AI LAB (A) (Artificial Intelligence Lab)', isLab: true },
        slot_2: { codeOrAbbr: 'CME AI LAB (A)', fullDetail: 'Lab Session: CME AI LAB (A) (Artificial Intelligence Lab)', isLab: true },
        slot_3: { codeOrAbbr: 'BCT-B', fullDetail: 'Lecture: BCT-B (Blockchain Technologies - Sec B)', isLab: false },
        slot_4: null,
        slot_5: { codeOrAbbr: 'AIML JAVA LAB (C)', fullDetail: 'Lab Session: AIML JAVA LAB (C) (Java Programming Lab)', isLab: true },
        slot_6: { codeOrAbbr: 'AIML JAVA LAB (C)', fullDetail: 'Lab Session: AIML JAVA LAB (C) (Java Programming Lab)', isLab: true },
      },
      SAT: {
        slot_1: null,
        slot_2: null,
        slot_3: null,
        slot_4: null,
        slot_5: { codeOrAbbr: 'CN-CME', fullDetail: 'Lecture: CN-CME (Computer Networks - CME)', isLab: false },
        slot_6: null,
      },
    },
  },

  // 13B. Mr. Samhith (Corrected from Amith; Active IT Faculty)
  {
    id: 'fac_samhith',
    name: 'Mr. Samhith',
    aliases: ['MR. SAMHITH', 'SAMHITH', 'AMITH', 'MR. AMITH'],
    designation: 'Assistant Professor',
    workload: { theory: 8, lab: 10, total: 18 },
    primarySubjects: ['WT', 'WT LAB', 'Web Technologies'],
    rawScheduleText: {
      MON: 'Slot I: WT (III-A) | Slot IV-V: WT LAB (III-A Batch 1)',
      TUE: 'Slot II: WT (III-B) | Slot V-VI: WT LAB (III-B Batch 1)',
      WED: 'Slot III: WT (III-A)',
      THU: 'Slot II: WT (III-B) | Slot IV-V: WT LAB (III-A Batch 2)',
      FRI: 'Slot I: WT (III-A) | Slot III: WT (III-B)',
      SAT: 'Slot II: WT (III-B) | Slot IV-V: WT LAB (III-B Batch 2)',
    },
    schedule: {
      MON: {
        slot_1: { codeOrAbbr: 'WT', fullDetail: 'Lecture: WT (Web Technologies - III IT-A)', isLab: false },
        slot_2: null,
        slot_3: null,
        slot_4: { codeOrAbbr: 'WT LAB', fullDetail: 'Lab Session: WT LAB (Web Technologies Lab - III IT-A Batch 1)', isLab: true },
        slot_5: { codeOrAbbr: 'WT LAB', fullDetail: 'Lab Session: WT LAB (Web Technologies Lab - III IT-A Batch 1)', isLab: true },
        slot_6: null,
      },
      TUE: {
        slot_1: null,
        slot_2: { codeOrAbbr: 'WT', fullDetail: 'Lecture: WT (Web Technologies - III IT-B)', isLab: false },
        slot_3: null,
        slot_4: null,
        slot_5: { codeOrAbbr: 'WT LAB', fullDetail: 'Lab Session: WT LAB (Web Technologies Lab - III IT-B Batch 1)', isLab: true },
        slot_6: { codeOrAbbr: 'WT LAB', fullDetail: 'Lab Session: WT LAB (Web Technologies Lab - III IT-B Batch 1)', isLab: true },
      },
      WED: {
        slot_1: null,
        slot_2: null,
        slot_3: { codeOrAbbr: 'WT', fullDetail: 'Lecture: WT (Web Technologies - III IT-A)', isLab: false },
        slot_4: null,
        slot_5: null,
        slot_6: null,
      },
      THU: {
        slot_1: null,
        slot_2: { codeOrAbbr: 'WT', fullDetail: 'Lecture: WT (Web Technologies - III IT-B)', isLab: false },
        slot_3: null,
        slot_4: { codeOrAbbr: 'WT LAB', fullDetail: 'Lab Session: WT LAB (Web Technologies Lab - III IT-A Batch 2)', isLab: true },
        slot_5: { codeOrAbbr: 'WT LAB', fullDetail: 'Lab Session: WT LAB (Web Technologies Lab - III IT-A Batch 2)', isLab: true },
        slot_6: null,
      },
      FRI: {
        slot_1: { codeOrAbbr: 'WT', fullDetail: 'Lecture: WT (Web Technologies - III IT-A)', isLab: false },
        slot_2: null,
        slot_3: { codeOrAbbr: 'WT', fullDetail: 'Lecture: WT (Web Technologies - III IT-B)', isLab: false },
        slot_4: null,
        slot_5: null,
        slot_6: null,
      },
      SAT: {
        slot_1: null,
        slot_2: { codeOrAbbr: 'WT', fullDetail: 'Lecture: WT (Web Technologies - III IT-B)', isLab: false },
        slot_3: null,
        slot_4: { codeOrAbbr: 'WT LAB', fullDetail: 'Lab Session: WT LAB (Web Technologies Lab - III IT-B Batch 2)', isLab: true },
        slot_5: { codeOrAbbr: 'WT LAB', fullDetail: 'Lab Session: WT LAB (Web Technologies Lab - III IT-B Batch 2)', isLab: true },
        slot_6: null,
      },
    },
  },

  // 14. Mr. K. Vikram Reddy (Th: 10, Lab: 10, Total: 20)
  {
    id: 'fac_vikram',
    name: 'Mr. K. Vikram Reddy',
    aliases: ['MR. K. VIKRAM REDDY', 'K. VIKRAM REDDY', 'VIKRAM REDDY'],
    designation: 'Assistant Professor',
    workload: { theory: 10, lab: 10, total: 20 },
    primarySubjects: ['CAD', 'DAA', 'JAVA', 'CME CD LAB', 'AIML JAVA LAB'],
    rawScheduleText: {
      MON: 'Slot I-II: CAD | Slot IV: DAA | Slot VI: JAVA',
      TUE: 'Slot I-II: CAD | Slot III-IV: CME CD LAB (A) | Slot V-VI: AIML JAVA LAB (A)',
      WED: 'Slot I-II: AIML JAVA LAB (B) | Slot V: JAVA',
      THU: 'Slot I: JAVA | Slot IV: CAD',
      FRI: 'Slot I-II: CME CD LAB (B) | Slot IV: DAA | Slot V-VI: AIML JAVA LAB (C)',
      SAT: 'Slot I: DAA | Slot IV: JAVA',
    },
    schedule: {
      MON: {
        slot_1: { codeOrAbbr: 'CAD', fullDetail: 'Lecture: CAD (Computer Aided Design / Engineering)', isLab: false },
        slot_2: { codeOrAbbr: 'CAD', fullDetail: 'Lecture: CAD (Computer Aided Design / Engineering)', isLab: false },
        slot_3: null,
        slot_4: { codeOrAbbr: 'DAA', fullDetail: 'Lecture: DAA (Design & Analysis of Algorithms)', isLab: false },
        slot_5: null,
        slot_6: { codeOrAbbr: 'JAVA', fullDetail: 'Lecture: JAVA (Java Programming)', isLab: false },
      },
      TUE: {
        slot_1: { codeOrAbbr: 'CAD', fullDetail: 'Lecture: CAD (Computer Aided Design / Engineering)', isLab: false },
        slot_2: { codeOrAbbr: 'CAD', fullDetail: 'Lecture: CAD (Computer Aided Design / Engineering)', isLab: false },
        slot_3: { codeOrAbbr: 'CME CD LAB (A)', fullDetail: 'Lab Session: CME CD LAB (A) (Compiler Design Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'CME CD LAB (A)', fullDetail: 'Lab Session: CME CD LAB (A) (Compiler Design Lab)', isLab: true },
        slot_5: { codeOrAbbr: 'AIML JAVA LAB (A)', fullDetail: 'Lab Session: AIML JAVA LAB (A) (Java Programming Lab)', isLab: true },
        slot_6: { codeOrAbbr: 'AIML JAVA LAB (A)', fullDetail: 'Lab Session: AIML JAVA LAB (A) (Java Programming Lab)', isLab: true },
      },
      WED: {
        slot_1: { codeOrAbbr: 'AIML JAVA LAB (B)', fullDetail: 'Lab Session: AIML JAVA LAB (B) (Java Programming Lab)', isLab: true },
        slot_2: { codeOrAbbr: 'AIML JAVA LAB (B)', fullDetail: 'Lab Session: AIML JAVA LAB (B) (Java Programming Lab)', isLab: true },
        slot_3: null,
        slot_4: null,
        slot_5: { codeOrAbbr: 'JAVA', fullDetail: 'Lecture: JAVA (Java Programming)', isLab: false },
        slot_6: null,
      },
      THU: {
        slot_1: { codeOrAbbr: 'JAVA', fullDetail: 'Lecture: JAVA (Java Programming)', isLab: false },
        slot_2: null,
        slot_3: null,
        slot_4: { codeOrAbbr: 'CAD', fullDetail: 'Lecture: CAD (Computer Aided Design / Engineering)', isLab: false },
        slot_5: null,
        slot_6: null,
      },
      FRI: {
        slot_1: { codeOrAbbr: 'CME CD LAB (B)', fullDetail: 'Lab Session: CME CD LAB (B) (Compiler Design Lab)', isLab: true },
        slot_2: { codeOrAbbr: 'CME CD LAB (B)', fullDetail: 'Lab Session: CME CD LAB (B) (Compiler Design Lab)', isLab: true },
        slot_3: null,
        slot_4: { codeOrAbbr: 'DAA', fullDetail: 'Lecture: DAA (Design & Analysis of Algorithms)', isLab: false },
        slot_5: { codeOrAbbr: 'AIML JAVA LAB (C)', fullDetail: 'Lab Session: AIML JAVA LAB (C) (Java Programming Lab)', isLab: true },
        slot_6: { codeOrAbbr: 'AIML JAVA LAB (C)', fullDetail: 'Lab Session: AIML JAVA LAB (C) (Java Programming Lab)', isLab: true },
      },
      SAT: {
        slot_1: { codeOrAbbr: 'DAA', fullDetail: 'Lecture: DAA (Design & Analysis of Algorithms)', isLab: false },
        slot_2: null,
        slot_3: null,
        slot_4: { codeOrAbbr: 'JAVA', fullDetail: 'Lecture: JAVA (Java Programming)', isLab: false },
        slot_5: null,
        slot_6: null,
      },
    },
  },

  // 15. MR. G. BHANU PRASAD (Th: 3, Lab: 18, Total: 21)
  {
    id: 'fac_bhanu',
    name: 'Mr. G. Bhanu Prasad',
    aliases: ['MR. G. BHANU PRASAD', 'G. BHANU PRASAD', 'G BHANU PRASAD', 'BHANU PRASAD'],
    designation: 'Assistant Professor & Class Teacher (III IT-B)',
    workload: { theory: 3, lab: 18, total: 21 },
    primarySubjects: ['DS LAB', 'OOAD-A', 'AIML DV LAB'],
    rawScheduleText: {
      MON: 'Slot I-II: DS LAB (C) SEC-A | Slot IV: OOAD-A',
      TUE: 'Slot I-II: DS LAB (B) SEC-B | Slot V-VI: AIML DV LAB (C)',
      WED: 'Slot I-II: AIML DV LAB (A) | Slot III-IV: DS LAB (A) SEC-A | Slot V-VI: DS LAB (A) SEC-B',
      THU: 'Slot IV: OOAD-A',
      FRI: 'Slot V-VI: AIML DV LAB (B) | Slot VI: DS LAB (C) SEC-B',
      SAT: 'Slot I-II: DS LAB (B) SEC-A',
    },
    schedule: {
      MON: {
        slot_1: { codeOrAbbr: 'DS LAB (C) SEC-A', fullDetail: 'Lab Session: DS LAB (C) SEC-A (Data Structures Lab)', isLab: true },
        slot_2: { codeOrAbbr: 'DS LAB (C) SEC-A', fullDetail: 'Lab Session: DS LAB (C) SEC-A (Data Structures Lab)', isLab: true },
        slot_3: null,
        slot_4: { codeOrAbbr: 'OOAD-A', fullDetail: 'Lecture: OOAD-A (Object Oriented Analysis & Design - Sec A)', isLab: false },
        slot_5: null,
        slot_6: null,
      },
      TUE: {
        slot_1: { codeOrAbbr: 'DS LAB (B) SEC-B', fullDetail: 'Lab Session: DS LAB (B) SEC-B (Data Structures Lab)', isLab: true },
        slot_2: { codeOrAbbr: 'DS LAB (B) SEC-B', fullDetail: 'Lab Session: DS LAB (B) SEC-B (Data Structures Lab)', isLab: true },
        slot_3: null,
        slot_4: null,
        slot_5: { codeOrAbbr: 'AIML DV LAB (C)', fullDetail: 'Lab Session: AIML DV LAB (C) (Data Visualization Lab)', isLab: true },
        slot_6: { codeOrAbbr: 'AIML DV LAB (C)', fullDetail: 'Lab Session: AIML DV LAB (C) (Data Visualization Lab)', isLab: true },
      },
      WED: {
        slot_1: { codeOrAbbr: 'AIML DV LAB (A)', fullDetail: 'Lab Session: AIML DV LAB (A) (Data Visualization Lab)', isLab: true },
        slot_2: { codeOrAbbr: 'AIML DV LAB (A)', fullDetail: 'Lab Session: AIML DV LAB (A) (Data Visualization Lab)', isLab: true },
        slot_3: { codeOrAbbr: 'DS LAB (A) SEC-A', fullDetail: 'Lab Session: DS LAB (A) SEC-A (Data Structures Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'DS LAB (A) SEC-A', fullDetail: 'Lab Session: DS LAB (A) SEC-A (Data Structures Lab)', isLab: true },
        slot_5: { codeOrAbbr: 'DS LAB (A) SEC-B', fullDetail: 'Lab Session: DS LAB (A) SEC-B (Data Structures Lab)', isLab: true },
        slot_6: { codeOrAbbr: 'DS LAB (A) SEC-B', fullDetail: 'Lab Session: DS LAB (A) SEC-B (Data Structures Lab)', isLab: true },
      },
      THU: {
        slot_1: null,
        slot_2: null,
        slot_3: null,
        slot_4: { codeOrAbbr: 'OOAD-A', fullDetail: 'Lecture: OOAD-A (Object Oriented Analysis & Design - Sec A)', isLab: false },
        slot_5: null,
        slot_6: null,
      },
      FRI: {
        slot_1: null,
        slot_2: null,
        slot_3: null,
        slot_4: null,
        slot_5: { codeOrAbbr: 'AIML DV LAB (B)', fullDetail: 'Lab Session: AIML DV LAB (B) (Data Visualization Lab)', isLab: true },
        slot_6: { codeOrAbbr: 'AIML DV LAB (B) / DS LAB', fullDetail: 'Lab Session: AIML DV LAB (B) / DS LAB (C) SEC-B', isLab: true },
      },
      SAT: {
        slot_1: { codeOrAbbr: 'DS LAB (B) SEC-A', fullDetail: 'Lab Session: DS LAB (B) SEC-A (Data Structures Lab)', isLab: true },
        slot_2: { codeOrAbbr: 'DS LAB (B) SEC-A', fullDetail: 'Lab Session: DS LAB (B) SEC-A (Data Structures Lab)', isLab: true },
        slot_3: null,
        slot_4: null,
        slot_5: null,
        slot_6: null,
      },
    },
  },

  // 16. Mrs. G. SHRAVYA (Th: 4, Lab: 16, CRT: 2, Total: 22)
  {
    id: 'fac_shravya',
    name: 'Mrs. G. Shravya',
    aliases: ['MRS. G. SHRAVYA', 'G. SHRAVYA', 'G SHRAVYA', 'SHRAVYA'],
    designation: 'Assistant Professor',
    workload: { theory: 4, lab: 16, crt: 2, total: 22 },
    primarySubjects: ['DS-AIML', 'IOT LAB', 'WT LAB', 'AIML DS LAB', 'CRT V SEM A'],
    rawScheduleText: {
      MON: 'Slot I-II: IOT LAB (A) SEC-B | Slot III: DS-AIML | Slot IV-V: WT LAB (A) SEC-B',
      TUE: 'Slot II: DS-AIML | Slot IV-V: CRT-IT V SEM A | Slot VI: AIML DS LAB (B)',
      WED: 'Slot I-II: AIML DS LAB (C) | Slot V-VI: IOT LAB (B) SEC-A',
      THU: 'Slot III: DS-AIML | Slot IV-V: IOT LAB (A) SEC-A',
      FRI: 'Slot II: DS-AIML | Slot IV-V: AIML DS LAB (A)',
      SAT: 'No scheduled teaching periods',
    },
    schedule: {
      MON: {
        slot_1: { codeOrAbbr: 'IOT LAB (A) SEC-B', fullDetail: 'Lab Session: IOT LAB (A) SEC-B (Internet of Things Lab)', isLab: true },
        slot_2: { codeOrAbbr: 'IOT LAB (A) SEC-B', fullDetail: 'Lab Session: IOT LAB (A) SEC-B (Internet of Things Lab)', isLab: true },
        slot_3: { codeOrAbbr: 'DS-AIML', fullDetail: 'Lecture: DS-AIML (Data Science for AI & ML)', isLab: false },
        slot_4: { codeOrAbbr: 'WT LAB (A) SEC-B', fullDetail: 'Lab Session: WT LAB (A) SEC-B (Web Technologies Lab)', isLab: true },
        slot_5: { codeOrAbbr: 'WT LAB (A) SEC-B', fullDetail: 'Lab Session: WT LAB (A) SEC-B (Web Technologies Lab)', isLab: true },
        slot_6: null,
      },
      TUE: {
        slot_1: null,
        slot_2: { codeOrAbbr: 'DS-AIML', fullDetail: 'Lecture: DS-AIML (Data Science for AI & ML)', isLab: false },
        slot_3: null,
        slot_4: { codeOrAbbr: 'CRT-IT V SEM A', fullDetail: 'CRT Session: CRT-IT V SEM A (Campus Recruitment Training)', isLab: false, isCrt: true },
        slot_5: { codeOrAbbr: 'CRT-IT V SEM A', fullDetail: 'CRT Session: CRT-IT V SEM A (Campus Recruitment Training)', isLab: false, isCrt: true },
        slot_6: { codeOrAbbr: 'AIML DS LAB (B)', fullDetail: 'Lab Session: AIML DS LAB (B) (Data Science Lab)', isLab: true },
      },
      WED: {
        slot_1: { codeOrAbbr: 'AIML DS LAB (C)', fullDetail: 'Lab Session: AIML DS LAB (C) (Data Science Lab)', isLab: true },
        slot_2: { codeOrAbbr: 'AIML DS LAB (C)', fullDetail: 'Lab Session: AIML DS LAB (C) (Data Science Lab)', isLab: true },
        slot_3: null,
        slot_4: null,
        slot_5: { codeOrAbbr: 'IOT LAB (B) SEC-A', fullDetail: 'Lab Session: IOT LAB (B) SEC-A (Internet of Things Lab)', isLab: true },
        slot_6: { codeOrAbbr: 'IOT LAB (B) SEC-A', fullDetail: 'Lab Session: IOT LAB (B) SEC-A (Internet of Things Lab)', isLab: true },
      },
      THU: {
        slot_1: null,
        slot_2: null,
        slot_3: { codeOrAbbr: 'DS-AIML', fullDetail: 'Lecture: DS-AIML (Data Science for AI & ML)', isLab: false },
        slot_4: { codeOrAbbr: 'IOT LAB (A) SEC-A', fullDetail: 'Lab Session: IOT LAB (A) SEC-A (Internet of Things Lab)', isLab: true },
        slot_5: { codeOrAbbr: 'IOT LAB (A) SEC-A', fullDetail: 'Lab Session: IOT LAB (A) SEC-A (Internet of Things Lab)', isLab: true },
        slot_6: null,
      },
      FRI: {
        slot_1: null,
        slot_2: { codeOrAbbr: 'DS-AIML', fullDetail: 'Lecture: DS-AIML (Data Science for AI & ML)', isLab: false },
        slot_3: null,
        slot_4: { codeOrAbbr: 'AIML DS LAB (A)', fullDetail: 'Lab Session: AIML DS LAB (A) (Data Science Lab)', isLab: true },
        slot_5: { codeOrAbbr: 'AIML DS LAB (A)', fullDetail: 'Lab Session: AIML DS LAB (A) (Data Science Lab)', isLab: true },
        slot_6: null,
      },
      SAT: {
        slot_1: null,
        slot_2: null,
        slot_3: null,
        slot_4: null,
        slot_5: null,
        slot_6: null,
      },
    },
  },

  // 17. MS. G. AKSHARA (Th: 3, Lab: 16, CRT: 2, Total: 21)
  {
    id: 'fac_akshara',
    name: 'Ms. G. Akshara',
    aliases: ['MS. G. AKSHARA', 'G. AKSHARA', 'G AKSHARA', 'AKSHARA'],
    designation: 'Assistant Professor',
    workload: { theory: 3, lab: 16, crt: 2, total: 21 },
    primarySubjects: ['SE-A', 'OS LAB', 'AIML DV LAB', 'CRT V SEM B'],
    rawScheduleText: {
      MON: 'Slot I-II: OS LAB (A) SEC-B | Slot V-VI: OS LAB (B) SEC-B',
      TUE: 'Slot IV: CRT-IT V SEM B',
      WED: 'Slot I-II: AIML DV LAB (A) | Slot IV: SE-A',
      THU: 'Slot I: SE-A | Slot III-IV: OS LAB (C) SEC-B | Slot V-VI: OS LAB (C) SEC-A',
      FRI: 'Slot III-IV: OS LAB (A) SEC-B | Slot V-VI: AIML DV LAB (B)',
      SAT: 'Slot II: SE-A | Slot III-IV: OS LAB (B) SEC-A',
    },
    schedule: {
      MON: {
        slot_1: { codeOrAbbr: 'OS LAB (A) SEC-B', fullDetail: 'Lab Session: OS LAB (A) SEC-B (Operating Systems Lab)', isLab: true },
        slot_2: { codeOrAbbr: 'OS LAB (A) SEC-B', fullDetail: 'Lab Session: OS LAB (A) SEC-B (Operating Systems Lab)', isLab: true },
        slot_3: null,
        slot_4: null,
        slot_5: { codeOrAbbr: 'OS LAB (B) SEC-B', fullDetail: 'Lab Session: OS LAB (B) SEC-B (Operating Systems Lab)', isLab: true },
        slot_6: { codeOrAbbr: 'OS LAB (B) SEC-B', fullDetail: 'Lab Session: OS LAB (B) SEC-B (Operating Systems Lab)', isLab: true },
      },
      TUE: {
        slot_1: null,
        slot_2: null,
        slot_3: null,
        slot_4: { codeOrAbbr: 'CRT-IT V SEM B', fullDetail: 'CRT Session: CRT-IT V SEM B (Campus Recruitment Training)', isLab: false, isCrt: true },
        slot_5: null,
        slot_6: null,
      },
      WED: {
        slot_1: { codeOrAbbr: 'AIML DV LAB (A)', fullDetail: 'Lab Session: AIML DV LAB (A) (Data Visualization Lab)', isLab: true },
        slot_2: { codeOrAbbr: 'AIML DV LAB (A)', fullDetail: 'Lab Session: AIML DV LAB (A) (Data Visualization Lab)', isLab: true },
        slot_3: null,
        slot_4: { codeOrAbbr: 'SE-A', fullDetail: 'Lecture: SE-A (Software Engineering - Sec A)', isLab: false },
        slot_5: null,
        slot_6: null,
      },
      THU: {
        slot_1: { codeOrAbbr: 'SE-A', fullDetail: 'Lecture: SE-A (Software Engineering - Sec A)', isLab: false },
        slot_2: null,
        slot_3: { codeOrAbbr: 'OS LAB (C) SEC-B', fullDetail: 'Lab Session: OS LAB (C) SEC-B (Operating Systems Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'OS LAB (C) SEC-B', fullDetail: 'Lab Session: OS LAB (C) SEC-B (Operating Systems Lab)', isLab: true },
        slot_5: { codeOrAbbr: 'OS LAB (C) SEC-A', fullDetail: 'Lab Session: OS LAB (C) SEC-A (Operating Systems Lab)', isLab: true },
        slot_6: { codeOrAbbr: 'OS LAB (C) SEC-A', fullDetail: 'Lab Session: OS LAB (C) SEC-A (Operating Systems Lab)', isLab: true },
      },
      FRI: {
        slot_1: null,
        slot_2: null,
        slot_3: { codeOrAbbr: 'OS LAB (A) SEC-B', fullDetail: 'Lab Session: OS LAB (A) SEC-B (Operating Systems Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'OS LAB (A) SEC-B', fullDetail: 'Lab Session: OS LAB (A) SEC-B (Operating Systems Lab)', isLab: true },
        slot_5: { codeOrAbbr: 'AIML DV LAB (B)', fullDetail: 'Lab Session: AIML DV LAB (B) (Data Visualization Lab)', isLab: true },
        slot_6: { codeOrAbbr: 'AIML DV LAB (B)', fullDetail: 'Lab Session: AIML DV LAB (B) (Data Visualization Lab)', isLab: true },
      },
      SAT: {
        slot_1: null,
        slot_2: { codeOrAbbr: 'SE-A', fullDetail: 'Lecture: SE-A (Software Engineering - Sec A)', isLab: false },
        slot_3: { codeOrAbbr: 'OS LAB (B) SEC-A', fullDetail: 'Lab Session: OS LAB (B) SEC-A (Operating Systems Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'OS LAB (B) SEC-A', fullDetail: 'Lab Session: OS LAB (B) SEC-A (Operating Systems Lab)', isLab: true },
        slot_5: null,
        slot_6: null,
      },
    },
  },

  // 18. MRS. B. DEEPA (Th: 6, Lab: 16, Total: 22)
  {
    id: 'fac_deepa',
    name: 'Mrs. B. Deepa',
    aliases: ['MRS. B. DEEPA', 'B. DEEPA', 'B DEEPA', 'DEEPA'],
    designation: 'Assistant Professor',
    workload: { theory: 6, lab: 16, total: 22 },
    primarySubjects: ['SE-B', 'AI-CME', 'AI LAB', 'CME AI LAB'],
    rawScheduleText: {
      MON: 'Slot II: SE-B | Slot III-IV: AI LAB (B) SEC-B | Slot V-VI: AI LAB (A) SEC-A',
      TUE: 'Slot II: AI-CME | Slot III-IV: CME AI LAB (B)',
      WED: 'Slot II: AI-CME | Slot VI: SE-B',
      THU: 'Slot III-IV: AI LAB (B) SEC-B | Slot V-VI: AI LAB (B) SEC-A',
      FRI: 'Slot I-II: CME AI LAB (A) | Slot III-IV: AI LAB (C) SEC-B | Slot V: AI-CME',
      SAT: 'Slot III-IV: AI LAB (C) SEC-A | Slot V: SE-B',
    },
    schedule: {
      MON: {
        slot_1: null,
        slot_2: { codeOrAbbr: 'SE-B', fullDetail: 'Lecture: SE-B (Software Engineering - Sec B)', isLab: false },
        slot_3: { codeOrAbbr: 'AI LAB (B) SEC-B', fullDetail: 'Lab Session: AI LAB (B) SEC-B (Artificial Intelligence Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'AI LAB (B) SEC-B', fullDetail: 'Lab Session: AI LAB (B) SEC-B (Artificial Intelligence Lab)', isLab: true },
        slot_5: { codeOrAbbr: 'AI LAB (A) SEC-A', fullDetail: 'Lab Session: AI LAB (A) SEC-A (Artificial Intelligence Lab)', isLab: true },
        slot_6: { codeOrAbbr: 'AI LAB (A) SEC-A', fullDetail: 'Lab Session: AI LAB (A) SEC-A (Artificial Intelligence Lab)', isLab: true },
      },
      TUE: {
        slot_1: null,
        slot_2: { codeOrAbbr: 'AI-CME', fullDetail: 'Lecture: AI-CME (Artificial Intelligence - CME)', isLab: false },
        slot_3: { codeOrAbbr: 'CME AI LAB (B)', fullDetail: 'Lab Session: CME AI LAB (B) (Artificial Intelligence Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'CME AI LAB (B)', fullDetail: 'Lab Session: CME AI LAB (B) (Artificial Intelligence Lab)', isLab: true },
        slot_5: null,
        slot_6: null,
      },
      WED: {
        slot_1: null,
        slot_2: { codeOrAbbr: 'AI-CME', fullDetail: 'Lecture: AI-CME (Artificial Intelligence - CME)', isLab: false },
        slot_3: null,
        slot_4: null,
        slot_5: null,
        slot_6: { codeOrAbbr: 'SE-B', fullDetail: 'Lecture: SE-B (Software Engineering - Sec B)', isLab: false },
      },
      THU: {
        slot_1: null,
        slot_2: null,
        slot_3: { codeOrAbbr: 'AI LAB (B) SEC-B', fullDetail: 'Lab Session: AI LAB (B) SEC-B (Artificial Intelligence Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'AI LAB (B) SEC-B', fullDetail: 'Lab Session: AI LAB (B) SEC-B (Artificial Intelligence Lab)', isLab: true },
        slot_5: { codeOrAbbr: 'AI LAB (B) SEC-A', fullDetail: 'Lab Session: AI LAB (B) SEC-A (Artificial Intelligence Lab)', isLab: true },
        slot_6: { codeOrAbbr: 'AI LAB (B) SEC-A', fullDetail: 'Lab Session: AI LAB (B) SEC-A (Artificial Intelligence Lab)', isLab: true },
      },
      FRI: {
        slot_1: { codeOrAbbr: 'CME AI LAB (A)', fullDetail: 'Lab Session: CME AI LAB (A) (Artificial Intelligence Lab)', isLab: true },
        slot_2: { codeOrAbbr: 'CME AI LAB (A)', fullDetail: 'Lab Session: CME AI LAB (A) (Artificial Intelligence Lab)', isLab: true },
        slot_3: { codeOrAbbr: 'AI LAB (C) SEC-B', fullDetail: 'Lab Session: AI LAB (C) SEC-B (Artificial Intelligence Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'AI LAB (C) SEC-B', fullDetail: 'Lab Session: AI LAB (C) SEC-B (Artificial Intelligence Lab)', isLab: true },
        slot_5: { codeOrAbbr: 'AI-CME', fullDetail: 'Lecture: AI-CME (Artificial Intelligence - CME)', isLab: false },
        slot_6: null,
      },
      SAT: {
        slot_1: null,
        slot_2: null,
        slot_3: { codeOrAbbr: 'AI LAB (C) SEC-A', fullDetail: 'Lab Session: AI LAB (C) SEC-A (Artificial Intelligence Lab)', isLab: true },
        slot_4: { codeOrAbbr: 'AI LAB (C) SEC-A', fullDetail: 'Lab Session: AI LAB (C) SEC-A (Artificial Intelligence Lab)', isLab: true },
        slot_5: { codeOrAbbr: 'SE-B', fullDetail: 'Lecture: SE-B (Software Engineering - Sec B)', isLab: false },
        slot_6: null,
      },
    },
  },
];

// Helper: Normalize string for comparison
function cleanCompare(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Finds a faculty profile by matching name or aliases
 */
export function findFacultyProfile(nameOrAlias: string): MasterFacultyProfile | undefined {
  if (!nameOrAlias || !nameOrAlias.trim()) return undefined;
  
  // Correction: Amith -> Samhith
  const normalizedInput = nameOrAlias.toLowerCase().replace(/amith/g, 'samhith');
  const target = cleanCompare(normalizedInput);

  // Exact or alias match
  return MASTER_FACULTY_DATASET.find((f) => {
    if (cleanCompare(f.name) === target) return true;
    if (f.aliases.some((a) => cleanCompare(a) === target)) return true;
    // Substring match for names like "Srinivas" inside "Dr. J. Srinivas"
    if (f.name.toLowerCase().includes(normalizedInput)) return true;
    if (target.length >= 4 && cleanCompare(f.name).includes(target)) return true;
    return false;
  });
}

/**
 * JSON dictionary representation of all 18 faculty schedules mapped by name, day, and time slots
 */
export const FACULTY_TIMETABLE_JSON_DICTIONARY = MASTER_FACULTY_DATASET.reduce(
  (acc, faculty) => {
    acc[faculty.name] = {
      id: faculty.id,
      designation: faculty.designation,
      workload: faculty.workload,
      primarySubjects: faculty.primarySubjects,
      schedules: {
        MON: faculty.schedule.MON,
        TUE: faculty.schedule.TUE,
        WED: faculty.schedule.WED,
        THU: faculty.schedule.THU,
        FRI: faculty.schedule.FRI,
        SAT: faculty.schedule.SAT,
      },
      rawSummary: faculty.rawScheduleText,
    };
    return acc;
  },
  {} as Record<string, unknown>
);
