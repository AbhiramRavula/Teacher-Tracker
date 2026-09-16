import {
  MASTER_FACULTY_DATASET,
  findFacultyProfile,
  FACULTY_TIMETABLE_JSON_DICTIONARY,
  MasterFacultyProfile,
  DayKey,
  SlotKey,
} from './masterTimetableData';

export {
  MASTER_FACULTY_DATASET,
  findFacultyProfile,
  FACULTY_TIMETABLE_JSON_DICTIONARY,
};
export type { MasterFacultyProfile, DayKey, SlotKey };

export interface SubjectAllocation {
  code: string;
  name: string;
  abbr: string;
  faculty: string;
  facultyNames: string[]; // parsed clean names
  isLab?: boolean;
}

export interface DayScheduleEntry {
  slot_1: string; // 09:40 - 10:40
  slot_2: string; // 10:40 - 11:40
  slot_3: string; // 11:40 - 12:40
  slot_4: string; // 01:20 - 02:20
  slot_5: string; // 02:20 - 03:20
  slot_6: string; // 03:20 - 04:20
}

export interface ClassTimetable {
  id: string;
  semester: string;
  section: string;
  displayName: string;
  roomNo: string;
  classTeacher: string;
  wef: string;
  subjects: SubjectAllocation[];
  schedule: Record<'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT', DayScheduleEntry>;
}

export interface FacultyMember {
  id: string;
  name: string;
  normalizedName: string;
  title: string;
  department: string;
  isClassTeacherOf?: string;
  primarySubjects: string[];
  workload?: {
    theory: number;
    lab: number;
    crt?: number;
    total: number;
  };
}

export const INSTITUTION_INFO = {
  collegeName: 'Matrusri Engineering College',
  department: 'Department of Information Technology',
  documentTitle: 'Departmental Time Table - ODD Semester (Academic Year 2026-27)',
  dated: '27-07-2026',
};

export const CLASSES_TIMETABLE: ClassTimetable[] = [
  // 1. B.E III SEM - IT SEC-A
  {
    id: 'III_IT_A',
    semester: 'B.E III SEM',
    section: 'SEC-A',
    displayName: 'B.E III SEM - IT SEC-A',
    roomNo: 'N 304',
    classTeacher: 'MRS. STVSAV. RAMYA',
    wef: '03/08/2026',
    subjects: [
      { code: 'U25HSN01CO', name: 'Finance and Accounting', abbr: 'FA', faculty: 'MR. M. SURESH KUMAR', facultyNames: ['MR. M. SURESH KUMAR'] },
      { code: 'U25ES301IT', name: 'Electronic Devices and Sensors', abbr: 'EDS', faculty: 'DR. J. SHAILAJA', facultyNames: ['DR. J. SHAILAJA'] },
      { code: 'U25PC301IT', name: 'Data Structures using C', abbr: 'DS', faculty: 'DR. J. SRINIVAS', facultyNames: ['DR. J. SRINIVAS'] },
      { code: 'U25PC302IT', name: 'Operating Systems', abbr: 'OS', faculty: 'MRS. STVSAV RAMYA', facultyNames: ['MRS. STVSAV. RAMYA', 'MRS. STVSAV RAMYA'] },
      { code: 'U25PC303IT', name: 'Mathematical Foundation for Information Technology', abbr: 'MFIT', faculty: 'MS. R. MADHAVI', facultyNames: ['MS. R. MADHAVI'] },
      { code: 'U25ES302IT', name: 'Digital Electronics and Logic Design', abbr: 'DELD', faculty: 'DR. K. DURGA PRASAD', facultyNames: ['DR. K. DURGA PRASAD'] },
      { code: 'U25MCN01PO', name: 'Indian Constitution', abbr: 'IC', faculty: 'MR. M. SURESH KUMAR', facultyNames: ['MR. M. SURESH KUMAR'] },
      { code: 'U25ES381IT', name: 'Electronic Devices and Sensors Lab', abbr: 'EDS LAB', faculty: 'DR. A. KOTESWARA RAO / Mr. A. ABHISHEK REDDY / DR. N. SRIBALA', facultyNames: ['DR. A. KOTESWARA RAO', 'MR. A. ABHISHEK REDDY', 'DR. N. SRIBALA'], isLab: true },
      { code: 'U25PC381IT', name: 'Data Structures using C Lab', abbr: 'DS LAB', faculty: 'MR. G. BHANU PRASAD / MRS. M. SRIVIDYA', facultyNames: ['MR. G. BHANU PRASAD', 'MRS. M. SRIVIDYA'], isLab: true },
      { code: 'U25PC382IT', name: 'Operating Systems Lab', abbr: 'OS LAB', faculty: 'MRS. STVSAV RAMYA / MS. MIZNA / Mrs. G. SHRAVYA', facultyNames: ['MRS. STVSAV. RAMYA', 'MRS. STVSAV RAMYA', 'MS. MIZNA', 'MRS. G. SHRAVYA'], isLab: true },
      { code: 'U25PC383IT', name: 'Web Technologies Lab', abbr: 'WT LAB', faculty: 'MS. T. VIJAYA LAXMI / MS. J. NAGALAXMI', facultyNames: ['MS. T. VIJAYA LAXMI', 'MS. J. NAGALAXMI'], isLab: true },
    ],
    schedule: {
      MON: {
        slot_1: 'WT LAB(A) / EDS LAB(B) / DS LAB(C)',
        slot_2: 'WT LAB(A) / EDS LAB(B) / DS LAB(C)',
        slot_3: 'IC',
        slot_4: 'MFIT',
        slot_5: 'DELD',
        slot_6: 'OS',
      },
      TUE: {
        slot_1: 'FA',
        slot_2: 'OS',
        slot_3: 'DS LAB(A) / WT LAB(B) / OS LAB(C)',
        slot_4: 'DS',
        slot_5: 'DELD',
        slot_6: 'DS LAB(A) / WT LAB(B) / OS LAB(C)',
      },
      WED: {
        slot_1: 'MFIT',
        slot_2: 'EDS',
        slot_3: 'FA',
        slot_4: 'LIB',
        slot_5: 'LIB',
        slot_6: 'EDS',
      },
      THU: {
        slot_1: 'EDS LAB(A) / OS LAB(B) / WT LAB(C)',
        slot_2: 'EDS LAB(A) / OS LAB(B) / WT LAB(C)',
        slot_3: 'DS',
        slot_4: 'FA',
        slot_5: 'EDS',
        slot_6: 'DELD',
      },
      FRI: {
        slot_1: 'FA',
        slot_2: 'EDS',
        slot_3: 'MFIT',
        slot_4: 'DS',
        slot_5: 'OS',
        slot_6: 'DELD',
      },
      SAT: {
        slot_1: 'OS LAB(A) / DS LAB(B) / EDS LAB(C)',
        slot_2: 'OS',
        slot_3: 'OS LAB(A) / DS LAB(B) / EDS LAB(C)',
        slot_4: 'IC',
        slot_5: 'MFIT',
        slot_6: 'IC',
      },
    },
  },

  // 2. B.E III SEM - IT SEC-B
  {
    id: 'III_IT_B',
    semester: 'B.E III SEM',
    section: 'SEC-B',
    displayName: 'B.E III SEM - IT SEC-B',
    roomNo: 'N 305',
    classTeacher: 'MR. G. BHANU PRASAD',
    wef: '03/08/2026',
    subjects: [
      { code: 'U25HSN01CO', name: 'Finance and Accounting', abbr: 'FA', faculty: 'MR. M. SURESH KUMAR', facultyNames: ['MR. M. SURESH KUMAR'] },
      { code: 'U25ES301IT', name: 'Electronic Devices and Sensors', abbr: 'EDS', faculty: 'DR. J. SHAILAJA', facultyNames: ['DR. J. SHAILAJA'] },
      { code: 'U25PC301IT', name: 'Data Structures using C', abbr: 'DS', faculty: 'DR. J. SRINIVAS', facultyNames: ['DR. J. SRINIVAS'] },
      { code: 'U25PC302IT', name: 'Operating Systems', abbr: 'OS', faculty: 'MRS. STVSAV RAMYA', facultyNames: ['MRS. STVSAV. RAMYA', 'MRS. STVSAV RAMYA'] },
      { code: 'U25PC303IT', name: 'Mathematical Foundation for Information Technology', abbr: 'MFIT', faculty: 'MS. R. MADHAVI', facultyNames: ['MS. R. MADHAVI'] },
      { code: 'U25ES302IT', name: 'Digital Electronics and Logic Design', abbr: 'DELD', faculty: 'DR. K. DURGA PRASAD', facultyNames: ['DR. K. DURGA PRASAD'] },
      { code: 'U25MCN01PO', name: 'Indian Constitution', abbr: 'IC', faculty: 'MR. M. SURESH KUMAR', facultyNames: ['MR. M. SURESH KUMAR'] },
      { code: 'U25ES381IT', name: 'Electronic Devices and Sensors Lab', abbr: 'EDS LAB', faculty: 'DR. PALLAVI KHARE / MR. P. RAVI KUMAR REDDY / DR. J. SHAILAJA', facultyNames: ['DR. PALLAVI KHARE', 'MR. P. RAVI KUMAR REDDY', 'DR. J. SHAILAJA'], isLab: true },
      { code: 'U25PC381IT', name: 'Data Structures using C Lab', abbr: 'DS LAB', faculty: 'MR. G. BHANU PRASAD / DR. J. SRINIVAS', facultyNames: ['MR. G. BHANU PRASAD', 'DR. J. SRINIVAS'], isLab: true },
      { code: 'U25PC382IT', name: 'Operating Systems Lab', abbr: 'OS LAB', faculty: 'MRS. STVSAV RAMYA / MRS. Y. SIRISHA', facultyNames: ['MRS. STVSAV. RAMYA', 'MRS. STVSAV RAMYA', 'MRS. Y. SIRISHA'], isLab: true },
      { code: 'U25PC383IT', name: 'Web Technologies Lab', abbr: 'WT LAB', faculty: 'MS. T. VIJAYA LAXMI / MS. J. NAGALAXMI / MRS. G. SHRAVYA', facultyNames: ['MS. T. VIJAYA LAXMI', 'MS. J. NAGALAXMI', 'MRS. G. SHRAVYA'], isLab: true },
    ],
    schedule: {
      MON: {
        slot_1: 'OS',
        slot_2: 'IC',
        slot_3: 'OS LAB(A) / DS LAB(B) / WT LAB(C)',
        slot_4: 'OS LAB(A) / DS LAB(B) / WT LAB(C)',
        slot_5: 'MFIT',
        slot_6: 'DS',
      },
      TUE: {
        slot_1: 'WT LAB(A) / EDS LAB(B) / OS LAB(C)',
        slot_2: 'FA',
        slot_3: 'FA',
        slot_4: 'WT LAB(A) / EDS LAB(B) / OS LAB(C)',
        slot_5: 'MFIT',
        slot_6: 'EDS',
      },
      WED: {
        slot_1: 'LIB',
        slot_2: 'OS',
        slot_3: 'LIB',
        slot_4: 'DELD',
        slot_5: 'WT LAB(B) / DS LAB(A) / EDS LAB(C)',
        slot_6: 'WT LAB(B) / DS LAB(A) / EDS LAB(C)',
      },
      THU: {
        slot_1: 'MFIT',
        slot_2: 'FA',
        slot_3: 'OS',
        slot_4: 'EDS',
        slot_5: 'DELD',
        slot_6: 'IC',
      },
      FRI: {
        slot_1: 'DELD',
        slot_2: 'DS',
        slot_3: 'OS',
        slot_4: 'EDS',
        slot_5: 'FA',
        slot_6: 'IC',
      },
      SAT: {
        slot_1: 'DS',
        slot_2: 'MFIT',
        slot_3: 'EDS',
        slot_4: 'DELD',
        slot_5: 'DS LAB(C) / OS LAB(B) / EDS LAB(A)',
        slot_6: 'DS LAB(C) / OS LAB(B) / EDS LAB(A)',
      },
    },
  },

  // 3. B.E V SEM - IT SEC-A
  {
    id: 'V_IT_A',
    semester: 'B.E V SEM',
    section: 'SEC-A',
    displayName: 'B.E V SEM - IT SEC-A',
    roomNo: 'O 205',
    classTeacher: 'MRS. T. ARUNA JYOTHI',
    wef: '29/07/2026',
    subjects: [
      { code: 'PC508ITU23', name: 'Principles of Programming Languages', abbr: 'PPL', faculty: 'MRS. M. SRIVIDYA', facultyNames: ['MRS. M. SRIVIDYA'] },
      { code: 'PC509IT U23', name: 'Artificial Intelligence', abbr: 'AI', faculty: 'MRS. T. ARUNA JYOTHI', facultyNames: ['MRS. T. ARUNA JYOTHI'] },
      { code: 'PC510IT U23', name: 'Operating Systems', abbr: 'OS', faculty: 'MRS. S. NAGAJYOTHI', facultyNames: ['MRS. S. NAGAJYOTHI'] },
      { code: 'PC511IT U23', name: 'Software Engineering', abbr: 'SE', faculty: 'MS. G. AKSHARA', facultyNames: ['MS. G. AKSHARA'] },
      { code: 'PC512IT U23', name: 'Full Stack Development', abbr: 'FSD', faculty: 'MRS. K. MOUNIKA', facultyNames: ['MRS. K. MOUNIKA'] },
      { code: 'PE501ITU23', name: 'Object Oriented Analysis and Design', abbr: 'OOAD', faculty: 'MR. G. BHANU PRASAD', facultyNames: ['MR. G. BHANU PRASAD'] },
      { code: 'OE501CEU23', name: 'Disaster Management', abbr: 'DM', faculty: 'MRS. K. SMITHA SUGUNA LEELA', facultyNames: ['MRS. K. SMITHA SUGUNA LEELA'] },
      { code: 'PC556ITU23', name: 'Artificial Intelligence Lab', abbr: 'AI LAB', faculty: 'MRS. T. ARUNA JYOTHI / MRS. B. DEEPA', facultyNames: ['MRS. T. ARUNA JYOTHI', 'MRS. B. DEEPA'], isLab: true },
      { code: 'PC557ITU23', name: 'Operating Systems Lab', abbr: 'OS LAB', faculty: 'MRS. S. NAGAJYOTHI / MS. G. AKSHARA', facultyNames: ['MRS. S. NAGAJYOTHI', 'MS. G. AKSHARA'], isLab: true },
      { code: 'PC558ITU23', name: 'Full Stack Development Lab', abbr: 'FSD LAB', faculty: 'MRS. K. MOUNIKA / MS. MIZNA', facultyNames: ['MRS. K. MOUNIKA', 'MS. MIZNA'], isLab: true },
      { code: 'PW501ITU23', name: 'Mini Project', abbr: 'Mini Project', faculty: 'MR. A. RAJESH', facultyNames: ['MR. A. RAJESH'] },
    ],
    schedule: {
      MON: {
        slot_1: 'AI',
        slot_2: 'FSD',
        slot_3: 'PPL',
        slot_4: 'OOAD',
        slot_5: 'AI LAB(A) / OS LAB(B) / FSD LAB(C)',
        slot_6: 'AI LAB(A) / OS LAB(B) / FSD LAB(C)',
      },
      TUE: {
        slot_1: '-',
        slot_2: 'CRT',
        slot_3: '-',
        slot_4: 'CRT',
        slot_5: 'FSD',
        slot_6: 'LIB',
      },
      WED: {
        slot_1: 'OS',
        slot_2: 'AI',
        slot_3: 'DM',
        slot_4: 'SE',
        slot_5: 'PPL',
        slot_6: 'AI LAB(B) / OS LAB(C) / FSD LAB(A)',
      },
      THU: {
        slot_1: 'SE',
        slot_2: 'OOAD',
        slot_3: 'DM',
        slot_4: 'PPL',
        slot_5: 'AI',
        slot_6: 'LIB',
      },
      FRI: {
        slot_1: 'FSD',
        slot_2: 'OS',
        slot_3: 'OOAD',
        slot_4: 'AI LAB(C) / OS LAB(A) / FSD LAB(B)',
        slot_5: 'SPORTS',
        slot_6: 'OS',
      },
      SAT: {
        slot_1: 'DM',
        slot_2: 'SE',
        slot_3: 'AI LAB(C) / OS LAB(A) / FSD LAB(B)',
        slot_4: '-',
        slot_5: '-',
        slot_6: '-',
      },
    },
  },

  // 4. B.E V SEM - IT SEC-B
  {
    id: 'V_IT_B',
    semester: 'B.E V SEM',
    section: 'SEC-B',
    displayName: 'B.E V SEM - IT SEC-B',
    roomNo: 'O 206',
    classTeacher: 'MRS. K. MOUNIKA',
    wef: '29/07/2026',
    subjects: [
      { code: 'PC508ITU23', name: 'Principles of Programming Languages', abbr: 'PPL', faculty: 'MRS. M. SRIVIDYA', facultyNames: ['MRS. M. SRIVIDYA'] },
      { code: 'PC509IT U23', name: 'Artificial Intelligence', abbr: 'AI', faculty: 'MRS. T. ARUNA JYOTHI', facultyNames: ['MRS. T. ARUNA JYOTHI'] },
      { code: 'PC510IT U23', name: 'Operating Systems', abbr: 'OS', faculty: 'MRS. S. NAGAJYOTHI', facultyNames: ['MRS. S. NAGAJYOTHI'] },
      { code: 'PC511IT U23', name: 'Software Engineering', abbr: 'SE', faculty: 'MRS. B. DEEPA', facultyNames: ['MRS. B. DEEPA'] },
      { code: 'PC512IT U23', name: 'Full Stack Development', abbr: 'FSD', faculty: 'MRS. K. MOUNIKA', facultyNames: ['MRS. K. MOUNIKA'] },
      { code: 'PE501ITU23', name: 'Object Oriented Analysis and Design', abbr: 'OOAD', faculty: 'MRS. Y. SIRISHA', facultyNames: ['MRS. Y. SIRISHA'] },
      { code: 'OE501CEU23', name: 'Disaster Management', abbr: 'DM', faculty: 'MR. RAJA RAMANA', facultyNames: ['MR. RAJA RAMANA'] },
      { code: 'PC556ITU23', name: 'Artificial Intelligence Lab', abbr: 'AI LAB', faculty: 'MRS. T. ARUNA JYOTHI / MRS. B. DEEPA', facultyNames: ['MRS. T. ARUNA JYOTHI', 'MRS. B. DEEPA'], isLab: true },
      { code: 'PC557ITU23', name: 'Operating Systems Lab', abbr: 'OS LAB', faculty: 'MRS. S. NAGAJYOTHI / MS. G. AKSHARA', facultyNames: ['MRS. S. NAGAJYOTHI', 'MS. G. AKSHARA'], isLab: true },
      { code: 'PC558ITU23', name: 'Full Stack Development Lab', abbr: 'FSD LAB', faculty: 'MRS. K. MOUNIKA / MS. MIZNA', facultyNames: ['MRS. K. MOUNIKA', 'MS. MIZNA'], isLab: true },
      { code: 'PW501ITU23', name: 'Mini Project', abbr: 'Mini Project', faculty: 'DR. K. DURGA PRASAD', facultyNames: ['DR. K. DURGA PRASAD'] },
    ],
    schedule: {
      MON: {
        slot_1: 'OOAD',
        slot_2: 'SE',
        slot_3: 'AI LAB(A) / OS LAB(B) / FSD LAB(C)',
        slot_4: 'AI LAB(A) / OS LAB(B) / FSD LAB(C)',
        slot_5: 'PPL',
        slot_6: 'DM',
      },
      TUE: {
        slot_1: 'OOAD',
        slot_2: 'CRT',
        slot_3: 'DM',
        slot_4: 'AI',
        slot_5: 'CRT',
        slot_6: 'SE',
      },
      WED: {
        slot_1: 'AI',
        slot_2: 'FSD',
        slot_3: 'AI LAB(B) / OS LAB(C) / FSD LAB(A)',
        slot_4: 'AI LAB(B) / OS LAB(C) / FSD LAB(A)',
        slot_5: 'OS',
        slot_6: 'LIB',
      },
      THU: {
        slot_1: 'AI',
        slot_2: 'FSD',
        slot_3: 'AI LAB(C) / OS LAB(A) / FSD LAB(B)',
        slot_4: 'AI LAB(C) / OS LAB(A) / FSD LAB(B)',
        slot_5: 'OOAD',
        slot_6: 'LIB',
      },
      FRI: {
        slot_1: 'PPL',
        slot_2: 'PPL',
        slot_3: 'AI LAB(C) / OS LAB(A) / FSD LAB(B)',
        slot_4: 'AI LAB(C) / OS LAB(A) / FSD LAB(B)',
        slot_5: 'OS',
        slot_6: '-',
      },
      SAT: {
        slot_1: 'OS',
        slot_2: 'FSD',
        slot_3: 'DM',
        slot_4: 'PPL',
        slot_5: 'SE',
        slot_6: 'SPORTS',
      },
    },
  },

  // 5. B.E VII SEM - IT SEC-A
  {
    id: 'VII_IT_A',
    semester: 'B.E VII SEM',
    section: 'SEC-A',
    displayName: 'B.E VII SEM - IT SEC-A',
    roomNo: 'O 203',
    classTeacher: 'MR. A. RAJESH',
    wef: '29/07/2026',
    subjects: [
      { code: 'PC717ITU23', name: 'Internet of Things', abbr: 'IOT', faculty: 'MS. MIZNA', facultyNames: ['MS. MIZNA'] },
      { code: 'PC718ITU23', name: 'Big Data Analytics', abbr: 'BDA', faculty: 'MRS. Y. SIRISHA', facultyNames: ['MRS. Y. SIRISHA'] },
      { code: 'PE712ITU23', name: 'Cyber Security', abbr: 'CS', faculty: 'MR. A. RAJESH', facultyNames: ['MR. A. RAJESH'] },
      { code: 'PE718ITU23', name: 'Block chain Technologies', abbr: 'BCT', faculty: 'MRS. B.J. PRAVEENA', facultyNames: ['MRS. B.J. PRAVEENA'] },
      { code: 'OE703EEU23', name: 'Non-Conventional Energy Sources', abbr: 'NCES', faculty: 'MRS. SARITHA', facultyNames: ['MRS. SARITHA'] },
      { code: 'PC761ITU23', name: 'Internet Of Things Lab', abbr: 'IOT LAB', faculty: 'MRS. G. SHRAVYA / DR. K. DURGA PRASAD / MRS. Y. SIRISHA', facultyNames: ['MRS. G. SHRAVYA', 'DR. K. DURGA PRASAD', 'MRS. Y. SIRISHA'], isLab: true },
      { code: 'PW702ITU23', name: 'Project Work-I', abbr: 'PW-I', faculty: 'MRS. M. SRIVIDYA', facultyNames: ['MRS. M. SRIVIDYA'] },
    ],
    schedule: {
      MON: {
        slot_1: 'BCT',
        slot_2: 'IOT',
        slot_3: 'NCES',
        slot_4: 'CS',
        slot_5: 'IOT LAB(A)',
        slot_6: 'SPORTS',
      },
      TUE: {
        slot_1: 'CS',
        slot_2: 'BCT',
        slot_3: 'IOT',
        slot_4: 'BDA',
        slot_5: 'PW-I',
        slot_6: 'LIB',
      },
      WED: {
        slot_1: 'IOT',
        slot_2: 'BCT',
        slot_3: 'NCES',
        slot_4: 'PW-I',
        slot_5: 'LIB',
        slot_6: '-',
      },
      THU: {
        slot_1: 'BDA',
        slot_2: 'CS',
        slot_3: 'IOT LAB(B)',
        slot_4: 'IOT LAB(B)',
        slot_5: 'LIB',
        slot_6: '-',
      },
      FRI: {
        slot_1: 'NCES',
        slot_2: 'BDA',
        slot_3: 'PW-I',
        slot_4: 'PW-I',
        slot_5: '-',
        slot_6: '-',
      },
      SAT: {
        slot_1: '-',
        slot_2: '-',
        slot_3: '-',
        slot_4: '-',
        slot_5: '-',
        slot_6: '-',
      },
    },
  },

  // 6. B.E VII SEM - IT SEC-B
  {
    id: 'VII_IT_B',
    semester: 'B.E VII SEM',
    section: 'SEC-B',
    displayName: 'B.E VII SEM - IT SEC-B',
    roomNo: 'O 204',
    classTeacher: 'MRS. S. NAGAJYOTHI',
    wef: '29/07/2026',
    subjects: [
      { code: 'PC717ITU23', name: 'Internet of Things', abbr: 'IOT', faculty: 'MS. MIZNA', facultyNames: ['MS. MIZNA'] },
      { code: 'PC718ITU23', name: 'Big Data Analytics', abbr: 'BDA', faculty: 'MRS. Y. SIRISHA', facultyNames: ['MRS. Y. SIRISHA'] },
      { code: 'PE712ITU23', name: 'Cyber Security', abbr: 'CS', faculty: 'MR. A. RAJESH', facultyNames: ['MR. A. RAJESH'] },
      { code: 'PE718ITU23', name: 'Block chain Technologies', abbr: 'BCT', faculty: 'MRS. B.J. PRAVEENA', facultyNames: ['MRS. B.J. PRAVEENA'] },
      { code: 'OE703EEU23', name: 'Non-Conventional Energy Sources', abbr: 'NCES', faculty: 'MR. M V SUBRAMANYAM', facultyNames: ['MR. M V SUBRAMANYAM'] },
      { code: 'PC761ITU23', name: 'Internet Of Things Lab', abbr: 'IOT LAB', faculty: 'MRS. G. SHRAVYA / DR. K. DURGA PRASAD / MRS. M. SRIVIDYA', facultyNames: ['MRS. G. SHRAVYA', 'DR. K. DURGA PRASAD', 'MRS. M. SRIVIDYA'], isLab: true },
      { code: 'PW702ITU23', name: 'Project Work-I', abbr: 'PW-I', faculty: 'MRS. Y. SIRISHA', facultyNames: ['MRS. Y. SIRISHA'] },
    ],
    schedule: {
      MON: {
        slot_1: '-',
        slot_2: 'IOT LAB(A)',
        slot_3: 'BCT',
        slot_4: 'PW-I',
        slot_5: 'LIB',
        slot_6: '-',
      },
      TUE: {
        slot_1: 'IOT',
        slot_2: 'NES', // NCES
        slot_3: 'BDA',
        slot_4: 'PW-I',
        slot_5: 'LIB',
        slot_6: '-',
      },
      WED: {
        slot_1: 'CS',
        slot_2: 'IOT',
        slot_3: 'CS',
        slot_4: 'BDA',
        slot_5: 'IOT LAB(B)',
        slot_6: 'LIB',
      },
      THU: {
        slot_1: 'BCT',
        slot_2: 'NES',
        slot_3: 'BDA',
        slot_4: 'CS',
        slot_5: '-',
        slot_6: '-',
      },
      FRI: {
        slot_1: 'IOT',
        slot_2: 'NES',
        slot_3: 'BCT',
        slot_4: 'SPORTS',
        slot_5: '-',
        slot_6: '-',
      },
      SAT: {
        slot_1: '-',
        slot_2: '-',
        slot_3: '-',
        slot_4: '-',
        slot_5: '-',
        slot_6: '-',
      },
    },
  },
];

export const FACULTY_DIRECTORY: FacultyMember[] = [
  // 1. Dr. J. Srinivas (Th: 6, Lab: 6, Total: 12)
  {
    id: 'fac_srinivas',
    name: 'Dr. J. Srinivas',
    normalizedName: 'J SRINIVAS',
    title: 'Professor / Associate Professor',
    department: 'Department of Information Technology',
    primarySubjects: ['Data Structures using C (DS)', 'DS Lab'],
    workload: { theory: 6, lab: 6, total: 12 },
  },
  // 2. MRS. Y. SIRISHA (Th: 9, Lab: 8, Total: 17)
  {
    id: 'fac_sirisha',
    name: 'Mrs. Y. Sirisha',
    normalizedName: 'Y SIRISHA',
    title: 'Assistant Professor',
    department: 'Department of Information Technology',
    primarySubjects: ['OOAD-B', 'BDA-A & B', 'OS Lab', 'IOT Lab'],
    workload: { theory: 9, lab: 8, total: 17 },
  },
  // 3. Mrs. STVSAV Ramya (Th: 12, Lab: 12, Total: 24)
  {
    id: 'fac_ramya',
    name: 'Mrs. STVSAV Ramya',
    normalizedName: 'STVSAV RAMYA',
    title: 'Assistant Professor & Class Teacher (III IT-A)',
    department: 'Department of Information Technology',
    isClassTeacherOf: 'B.E III SEM - IT SEC-A (Room N 304)',
    primarySubjects: ['Operating Systems (OS-A, OS-B, OS-AIML)', 'OS Lab'],
    workload: { theory: 12, lab: 12, total: 24 },
  },
  // 4. Mrs. T. Aruna Jyothi (Th: 6, Lab: 14, CRT: 2, Total: 22)
  {
    id: 'fac_aruna',
    name: 'Mrs. T. Aruna Jyothi',
    normalizedName: 'T ARUNA JYOTHI',
    title: 'Assistant Professor & Class Teacher (V IT-A)',
    department: 'Department of Information Technology',
    isClassTeacherOf: 'B.E V SEM - IT SEC-A (Room O 205)',
    primarySubjects: ['Artificial Intelligence (AI-A & B)', 'AI Lab', 'CRT V SEM A'],
    workload: { theory: 6, lab: 14, crt: 2, total: 22 },
  },
  // 5. Mrs. S. Nagajyothi (Th: 9, Lab: 12, Total: 21)
  {
    id: 'fac_nagajyothi',
    name: 'Mrs. S. Nagajyothi',
    normalizedName: 'S NAGAJYOTHI',
    title: 'Assistant Professor & Class Teacher (VII IT-B)',
    department: 'Department of Information Technology',
    isClassTeacherOf: 'B.E VII SEM - IT SEC-B (Room O 204)',
    primarySubjects: ['AT&CD', 'OS-A & B', 'OS Lab'],
    workload: { theory: 9, lab: 12, total: 21 },
  },
  // 6. Mrs. M. Srividya (Th: 9, Lab: 8, Total: 17)
  {
    id: 'fac_srividya',
    name: 'Mrs. M. Srividya',
    normalizedName: 'M SRIVIDYA',
    title: 'Assistant Professor',
    department: 'Department of Information Technology',
    primarySubjects: ['Principles of Programming Languages (PPL)', 'CME HCI', 'DS Lab', 'IOT Lab'],
    workload: { theory: 9, lab: 8, total: 17 },
  },
  // 7. Dr. K. Durga Prasad (Th: 11, Lab: 8, CRT: 2, Total: 21)
  {
    id: 'fac_durga_prasad',
    name: 'Dr. K. Durga Prasad',
    normalizedName: 'K DURGA PRASAD',
    title: 'Associate Professor',
    department: 'Department of Information Technology',
    primarySubjects: ['Digital Electronics & Logic Design (DELD)', 'SE-CME', 'IOT Lab', 'CRT CME'],
    workload: { theory: 11, lab: 8, crt: 2, total: 21 },
  },
  // 8. Mrs. K. Mounika (Th: 6, Lab: 12, CRT: 2, Total: 20)
  {
    id: 'fac_mounika',
    name: 'Mrs. K. Mounika',
    normalizedName: 'K MOUNIKA',
    title: 'Assistant Professor & Class Teacher (V IT-B)',
    department: 'Department of Information Technology',
    isClassTeacherOf: 'B.E V SEM - IT SEC-B (Room O 206)',
    primarySubjects: ['Full Stack Development (FSD-A & B)', 'FSD Lab', 'CRT V SEM B'],
    workload: { theory: 6, lab: 12, crt: 2, total: 20 },
  },
  // 9. Mr. A. Rajesh (Th: 9, Lab: 10, CRT: 2, Total: 21)
  {
    id: 'fac_rajesh',
    name: 'Mr. A. Rajesh',
    normalizedName: 'A RAJESH',
    title: 'Assistant Professor & Class Teacher (VII IT-A)',
    department: 'Department of Information Technology',
    isClassTeacherOf: 'B.E VII SEM - IT SEC-A (Room O 203)',
    primarySubjects: ['Cyber Security (CS-A & B, CME)', 'CME CD Lab', 'AIML DS Lab', 'CRT V SEM B'],
    workload: { theory: 9, lab: 10, crt: 2, total: 21 },
  },
  // 10. MS. J. Nagalaxmi (Th: 3, Lab: 15, CRT: 2, Total: 20)
  {
    id: 'fac_nagalaxmi',
    name: 'Ms. J. Nagalaxmi',
    normalizedName: 'J NAGALAXMI',
    title: 'Assistant Professor',
    department: 'Department of Information Technology',
    primarySubjects: ['Web Technologies Lab (WT LAB)', 'CME ML', 'AIML', 'AIML DS Lab', 'CRT CME'],
    workload: { theory: 3, lab: 15, crt: 2, total: 20 },
  },
  // 11. MS. MIZNA (Th: 6, Lab: 16, CRT: 2, Total: 24)
  {
    id: 'fac_mizna',
    name: 'Ms. Mizna',
    normalizedName: 'MIZNA',
    title: 'Assistant Professor',
    department: 'Department of Information Technology',
    primarySubjects: ['Internet of Things (IOT-A & B)', 'FSD Lab', 'OS Lab', 'CRT V SEM A'],
    workload: { theory: 6, lab: 16, crt: 2, total: 24 },
  },
  // 12. Ms. T. Vijayalaxmi (Th: 3, Lab: 16, CRT: 2, Total: 21)
  {
    id: 'fac_vijayalaxmi',
    name: 'Ms. T. Vijayalaxmi',
    normalizedName: 'T VIJAYALAXMI',
    title: 'Assistant Professor',
    department: 'Department of Information Technology',
    primarySubjects: ['Web Technologies Lab (WT LAB)', 'CME BDA', 'AIML DS Lab', 'CRT CME'],
    workload: { theory: 3, lab: 16, crt: 2, total: 21 },
  },
  // 13. Mr. Samhith (Corrected from Amith; Active IT Faculty)
  {
    id: 'fac_samhith',
    name: 'Mr. Samhith',
    normalizedName: 'SAMHITH',
    title: 'Assistant Professor',
    department: 'Department of Information Technology',
    primarySubjects: ['Web Technologies (WT)', 'WT Lab', 'Programming Systems'],
    workload: { theory: 8, lab: 10, total: 18 },
  },
  // 14. MR. G. BHANU PRASAD (Th: 3, Lab: 18, Total: 21)
  {
    id: 'fac_bhanu',
    name: 'Mr. G. Bhanu Prasad',
    normalizedName: 'G BHANU PRASAD',
    title: 'Assistant Professor & Class Teacher (III IT-B)',
    department: 'Department of Information Technology',
    isClassTeacherOf: 'B.E III SEM - IT SEC-B (Room N 305)',
    primarySubjects: ['Data Structures Lab (DS LAB)', 'OOAD-A', 'AIML DV Lab'],
    workload: { theory: 3, lab: 18, total: 21 },
  },
  // 15. Mrs. G. SHRAVYA (Th: 4, Lab: 16, CRT: 2, Total: 22)
  {
    id: 'fac_shravya',
    name: 'Mrs. G. Shravya',
    normalizedName: 'G SHRAVYA',
    title: 'Assistant Professor',
    department: 'Department of Information Technology',
    primarySubjects: ['DS-AIML', 'IOT Lab', 'WT Lab', 'AIML DS Lab', 'CRT V SEM A'],
    workload: { theory: 4, lab: 16, crt: 2, total: 22 },
  },
  // 16. MS. G. AKSHARA (Th: 3, Lab: 16, CRT: 2, Total: 21)
  {
    id: 'fac_akshara',
    name: 'Ms. G. Akshara',
    normalizedName: 'G AKSHARA',
    title: 'Assistant Professor',
    department: 'Department of Information Technology',
    primarySubjects: ['Software Engineering (SE-A)', 'OS Lab', 'AIML DV Lab', 'CRT V SEM B'],
    workload: { theory: 3, lab: 16, crt: 2, total: 21 },
  },

  // Inter-departmental & Visiting Faculty
  {
    id: 'fac_shailaja',
    name: 'DR. J. SHAILAJA',
    normalizedName: 'J SHAILAJA',
    title: 'Associate Professor',
    department: 'ECE / IT Labs',
    primarySubjects: ['Electronic Devices and Sensors (EDS)', 'EDS Lab'],
  },
  {
    id: 'fac_madhavi',
    name: 'MS. R. MADHAVI',
    normalizedName: 'R MADHAVI',
    title: 'Assistant Professor (Mathematics / S&H)',
    department: 'Science & Humanities / IT',
    primarySubjects: ['Mathematical Foundation for IT (MFIT)'],
  },
  {
    id: 'fac_suresh_kumar',
    name: 'MR. M. SURESH KUMAR',
    normalizedName: 'M SURESH KUMAR',
    title: 'Assistant Professor (Management / S&H)',
    department: 'Science & Humanities / Management',
    primarySubjects: ['Finance and Accounting (FA)', 'Indian Constitution (IC)'],
  },
  {
    id: 'fac_koteswara',
    name: 'DR. A. KOTESWARA RAO',
    normalizedName: 'A KOTESWARA RAO',
    title: 'Professor (ECE)',
    department: 'ECE / IT Labs',
    primarySubjects: ['Electronic Devices and Sensors Lab (EDS LAB)'],
  },
  {
    id: 'fac_abhishek',
    name: 'MR. A. ABHISHEK REDDY',
    normalizedName: 'A ABHISHEK REDDY',
    title: 'Assistant Professor (ECE)',
    department: 'ECE / IT Labs',
    primarySubjects: ['Electronic Devices and Sensors Lab (EDS LAB)'],
  },
  {
    id: 'fac_sribala',
    name: 'DR. N. SRIBALA',
    normalizedName: 'N SRIBALA',
    title: 'Associate Professor (ECE)',
    department: 'ECE / IT Labs',
    primarySubjects: ['Electronic Devices and Sensors Lab (EDS LAB)'],
  },
  {
    id: 'fac_pallavi',
    name: 'DR. PALLAVI KHARE',
    normalizedName: 'PALLAVI KHARE',
    title: 'Associate Professor (ECE)',
    department: 'ECE / IT Labs',
    primarySubjects: ['Electronic Devices and Sensors Lab (EDS LAB)'],
  },
  {
    id: 'fac_ravi_kumar',
    name: 'MR. P. RAVI KUMAR REDDY',
    normalizedName: 'P RAVI KUMAR REDDY',
    title: 'Assistant Professor (ECE)',
    department: 'ECE / IT Labs',
    primarySubjects: ['Electronic Devices and Sensors Lab (EDS LAB)'],
  },
  {
    id: 'fac_smitha',
    name: 'MRS. K. SMITHA SUGUNA LEELA',
    normalizedName: 'K SMITHA SUGUNA LEELA',
    title: 'Assistant Professor (Civil Engg)',
    department: 'Civil Engineering / Open Elective',
    primarySubjects: ['Disaster Management (DM V IT-A)'],
  },
  {
    id: 'fac_raja_ramana',
    name: 'MR. RAJA RAMANA',
    normalizedName: 'RAJA RAMANA',
    title: 'Assistant Professor (Civil Engg)',
    department: 'Civil Engineering / Open Elective',
    primarySubjects: ['Disaster Management (DM V IT-B)'],
  },
  {
    id: 'fac_saritha',
    name: 'MRS. SARITHA',
    normalizedName: 'SARITHA',
    title: 'Assistant Professor (EEE)',
    department: 'EEE / Open Elective',
    primarySubjects: ['Non-Conventional Energy Sources (NCES VII IT-A)'],
  },
  {
    id: 'fac_subramanyam',
    name: 'MR. M V SUBRAMANYAM',
    normalizedName: 'M V SUBRAMANYAM',
    title: 'Assistant Professor (EEE)',
    department: 'EEE / Open Elective',
    primarySubjects: ['Non-Conventional Energy Sources (NCES VII IT-B)'],
  },
];

export const TRANSFERRED_FACULTY_NAMES = [
  'Vikram',
  'Mr. K. Vikram Reddy',
  'BJ Praveena',
  'Mrs. BJ. Praveena',
  'Pushpa',
  'Deepa',
  'Mrs. B. Deepa',
] as const;

/**
 * Checks if a faculty member has transferred out of the department (effective Sep 15, 2026)
 */
export function isFacultyTransferred(name: string): boolean {
  if (!name) return false;
  const upper = name.toUpperCase();
  return (
    upper.includes('VIKRAM') ||
    upper.includes('PRAVEENA') ||
    upper.includes('PUSHPA') ||
    upper.includes('DEEPA')
  );
}

/**
 * Standardizes faculty name and corrects legacy/typo entries (e.g. Amith -> Samhith)
 */
export function standardizeFacultyName(name: string): string {
  if (!name) return '';
  const trimmed = name.trim();
  if (trimmed.toLowerCase() === 'amith' || trimmed.toLowerCase() === 'mr. amith') {
    return 'Mr. Samhith';
  }
  return trimmed;
}

// Helper to normalize strings for comparison
function cleanStr(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Returns scheduled activities for a given faculty member on a specific day of week
 */
export function getFacultyDaySchedule(
  facultyName: string,
  dayOfWeek: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT'
): { slot_1?: string; slot_2?: string; slot_3?: string; slot_4?: string; slot_5?: string; slot_6?: string; summary: string[] } {
  const result: { slot_1?: string; slot_2?: string; slot_3?: string; slot_4?: string; slot_5?: string; slot_6?: string; summary: string[] } = {
    summary: [],
  };

  const targetClean = cleanStr(facultyName);
  if (!targetClean) return result;

  // 1. Check Master Faculty Dataset (Official AY 2026-27 ODD Sem)
  const prof = findFacultyProfile(facultyName);
  if (prof && prof.schedule[dayOfWeek]) {
    const daySched = prof.schedule[dayOfWeek];
    const slots: (keyof DayScheduleEntry)[] = ['slot_1', 'slot_2', 'slot_3', 'slot_4', 'slot_5', 'slot_6'];
    for (const slotKey of slots) {
      const entry = daySched[slotKey as keyof typeof daySched];
      if (entry) {
        result[slotKey] = entry.fullDetail;
        result.summary.push(`${slotKey.toUpperCase()}: ${entry.codeOrAbbr}`);
      }
    }
    return result;
  }

  // 2. Fallback to CLASSES_TIMETABLE
  const slots: (keyof DayScheduleEntry)[] = ['slot_1', 'slot_2', 'slot_3', 'slot_4', 'slot_5', 'slot_6'];

  // Check each class
  for (const cls of CLASSES_TIMETABLE) {
    const daySched = cls.schedule[dayOfWeek];
    if (!daySched) continue;

    for (const slotKey of slots) {
      const entry = daySched[slotKey];
      if (!entry || entry === '-' || entry === '[Blank]') continue;

      // Check if any subject taught by this faculty matches entry
      for (const subj of cls.subjects) {
        const matchesSubject = entry.toUpperCase().includes(subj.abbr.toUpperCase());
        const matchesFaculty = subj.facultyNames.some((fn) => cleanStr(fn).includes(targetClean) || targetClean.includes(cleanStr(fn)));

        if (matchesSubject && matchesFaculty) {
          const detail = `${subj.isLab ? 'Lab Session' : 'Lecture'}: ${subj.name} (${subj.abbr} - ${subj.code}) for ${cls.displayName} in Room ${cls.roomNo}. Scheduled: "${entry}"`;
          if (!result[slotKey]) {
            result[slotKey] = detail;
          } else {
            result[slotKey] += ` | ${detail}`;
          }
          result.summary.push(`${slotKey.toUpperCase()}: ${subj.abbr} (${cls.displayName}, Rm: ${cls.roomNo})`);
        }
      }
    }
  }

  return result;
}

export interface SlotScheduleDetail {
  hasSchedule: boolean;
  subjectName?: string;
  subjectAbbr?: string;
  code?: string;
  section?: string;
  roomNo?: string;
  isLab?: boolean;
  rawEntry?: string;
  fullDetail?: string;
}

/**
 * Returns structured details for each slot for a given faculty member on a specific day of the week
 */
export function getFacultyDaySlotsDetailed(
  facultyName: string,
  dayOfWeek: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT'
): Record<string, SlotScheduleDetail> {
  const result: Record<string, SlotScheduleDetail> = {
    slot_1: { hasSchedule: false },
    slot_2: { hasSchedule: false },
    slot_3: { hasSchedule: false },
    slot_4: { hasSchedule: false },
    slot_5: { hasSchedule: false },
    slot_6: { hasSchedule: false },
    slot_closing: { hasSchedule: false },
  };

  const targetClean = cleanStr(facultyName);
  if (!targetClean) return result;

  // 1. Check Master Faculty Dataset (Official AY 2026-27 ODD Sem)
  const prof = findFacultyProfile(facultyName);
  if (prof && prof.schedule[dayOfWeek]) {
    const daySched = prof.schedule[dayOfWeek];
    const slots: (keyof DayScheduleEntry)[] = ['slot_1', 'slot_2', 'slot_3', 'slot_4', 'slot_5', 'slot_6'];
    for (const slotKey of slots) {
      const entry = daySched[slotKey as keyof typeof daySched];
      if (entry) {
        result[slotKey] = {
          hasSchedule: true,
          subjectName: entry.codeOrAbbr,
          subjectAbbr: entry.codeOrAbbr,
          code: entry.codeOrAbbr,
          isLab: entry.isLab,
          rawEntry: entry.codeOrAbbr,
          fullDetail: entry.fullDetail,
        };
      }
    }
    return result;
  }

  // 2. Fallback to CLASSES_TIMETABLE
  const slots: (keyof DayScheduleEntry)[] = ['slot_1', 'slot_2', 'slot_3', 'slot_4', 'slot_5', 'slot_6'];

  for (const cls of CLASSES_TIMETABLE) {
    const daySched = cls.schedule[dayOfWeek];
    if (!daySched) continue;

    for (const slotKey of slots) {
      const entry = daySched[slotKey];
      if (!entry || entry === '-' || entry === '[Blank]') continue;

      for (const subj of cls.subjects) {
        const matchesSubject = entry.toUpperCase().includes(subj.abbr.toUpperCase());
        const matchesFaculty = subj.facultyNames.some((fn) => cleanStr(fn).includes(targetClean) || targetClean.includes(cleanStr(fn)));

        if (matchesSubject && matchesFaculty) {
          result[slotKey] = {
            hasSchedule: true,
            subjectName: subj.name,
            subjectAbbr: subj.abbr,
            code: subj.code,
            section: cls.displayName,
            roomNo: cls.roomNo,
            isLab: !!subj.isLab,
            rawEntry: entry,
            fullDetail: `${subj.isLab ? 'Lab Session' : 'Lecture'}: ${subj.name} (${subj.abbr}) for ${cls.displayName} in Room ${cls.roomNo}`,
          };
          break;
        }
      }
    }
  }

  return result;
}
