import { ActivityLog } from './types';

export function getInitialTimetableSampleLogs(): ActivityLog[] {
  const todayStr = new Date().toISOString().split('T')[0];
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yesterdayStr = d.toISOString().split('T')[0];

  return [
    {
      id: 'log_ramya_sample_today',
      employeeName: 'MRS. STVSAV. RAMYA',
      role: 'Faculty',
      date: todayStr,
      department: 'Department of Information Technology',
      activities: {
        slot_1: 'Coordinated Web Technologies & OS Practical Lab (U25PC382IT) setup with Ms. Mizna in Computing Lab 2.',
        slot_2: 'Supervised OS Lab (Batch C) on Linux Process Creation and Fork System Calls for B.E III SEM - IT SEC-A (Room N 304).',
        slot_3: 'Verification of III IT Section A attendance registers and student mentoring records in staff room.',
        slot_4: 'Instructional design: Formulated algorithmic trace diagrams for CPU Scheduling (Round Robin & Multi-Level Queue).',
        slot_5: 'Cross-verification of Odd Semester 2026-27 course files with Academic In-charge.',
        slot_6: 'Conducted Operating Systems Lecture (OS - U25PC302IT) on Semaphores and Producer-Consumer problem in Room N 304.',
        slot_closing: 'Updated attendance on Matrusri college automation portal, signed laboratory observation books, and organized tomorrow\'s lecture notes.',
      },
      savedAt: new Date().toISOString(),
      totalFilledSlots: 7,
      hodStatus: 'Approved',
      hodRemarks: 'Accurate logging of B.E III IT-A theory and OS laboratory periods as per Odd Semester 2026-27 master timetable.',
    },
    {
      id: 'log_srinivas_sample_today',
      employeeName: 'DR. J. SRINIVAS',
      role: 'Faculty',
      date: todayStr,
      department: 'Department of Information Technology',
      activities: {
        slot_1: 'Research publication review on Graph Neural Networks and indexed journal paper revisions.',
        slot_2: 'Data Structures using C Lecture (DS - U25PC301IT): Implemented AVL Tree rotations and height balancing for III IT-B in Room N 305.',
        slot_3: 'Conducted Data Structures using C Lab (DS LAB - U25PC381IT) Batch A practical sessions in IT Programming Lab.',
        slot_4: 'Conducted Data Structures using C Theory (DS) for B.E III SEM - IT SEC-A in Room N 304.',
        slot_5: 'Departmental Research Committee (DRC) meeting: Assessed research proposals and student hackathon entries.',
        slot_6: 'Evaluated student lab programs on doubly linked list implementations and signed weekly records.',
        slot_closing: 'Updated course files, verified attendance records in college portal, and planned algorithm exercises for tomorrow.',
      },
      savedAt: new Date(Date.now() - 3600000).toISOString(),
      totalFilledSlots: 7,
      hodStatus: 'Approved',
      hodRemarks: 'Satisfactory completion of III Sem DS theory lectures and laboratory supervision.',
    },
    {
      id: 'log_rajesh_sample_today',
      employeeName: 'MR. A. RAJESH',
      role: 'Faculty',
      date: todayStr,
      department: 'Department of Information Technology',
      activities: {
        slot_1: 'Cyber Security Lecture (CS - PE712ITU23): Asymmetric Encryption, Diffie-Hellman Key Exchange for VII IT-B in Room O 204.',
        slot_2: 'Delivered Cyber Security Lecture (CS) for B.E VII SEM - IT SEC-A in Room O 203.',
        slot_3: 'Mini Project (PW501ITU23) progress evaluation for V Sem Section A batches in IT seminar hall.',
        slot_4: 'Reviewed Project Work-I (PW702ITU23) literature survey documents for final-year students.',
        slot_5: 'Departmental Training & Placement cell meeting regarding upcoming campus recruitment drives.',
        slot_6: 'Class Teacher counseling session for VII IT-A students regarding university semester registration.',
        slot_closing: 'Completed daily attendance entry on college portal, uploaded assignment rubrics to Google Classroom, and verified registers.',
      },
      savedAt: new Date(Date.now() - 7200000).toISOString(),
      totalFilledSlots: 7,
      hodStatus: 'Under Review',
      hodRemarks: '',
    },
    {
      id: 'log_programmer_sample_today',
      employeeName: 'MR. K. RAMESH',
      role: 'Programmer',
      date: todayStr,
      department: 'Department of Information Technology (Systems & Labs)',
      activities: {
        slot_1: 'Department Server Room inspection: Checked uptime of local intranet servers, DHCP pools, and firewall rules.',
        slot_2: 'Configured dual-boot Ubuntu 24.04 and Windows 11 systems in Programming Lab 2 for III Sem OS & DS Lab batches.',
        slot_3: 'Installed GCC/G++ build toolchains, VS Code, and Python 3.12 packages across 65 workstations.',
        slot_4: 'Assisted Dr. K. Durga Prasad & Mrs. G. Shravya in setting up Raspberry Pi 4 boards and sensors for VII Sem IoT Lab.',
        slot_5: 'Resolved network IP address collision issue in Classroom O 205 smart board and audio-visual projector system.',
        slot_6: 'Created automated bash backup script for student laboratory submission directories on department NAS storage.',
        slot_closing: 'Conducted workstation integrity audit, safely powered down non-critical servers, and committed backup logs.',
      },
      savedAt: new Date(Date.now() - 1800000).toISOString(),
      totalFilledSlots: 7,
      hodStatus: 'Approved',
      hodRemarks: 'Computing laboratories and IoT hardware readiness verified for the Odd Semester 2026-27 commencement.',
    },
    {
      id: 'log_aruna_sample_yesterday',
      employeeName: 'MRS. T. ARUNA JYOTHI',
      role: 'Faculty',
      date: yesterdayStr,
      department: 'Department of Information Technology',
      activities: {
        slot_1: 'Delivered Artificial Intelligence Lecture (AI - PC509IT U23) on Heuristic Search & A* Algorithm for B.E V SEM - IT SEC-A in Room O 205.',
        slot_2: 'Monitored V IT-A student CRT (Campus Recruitment Training) readiness and aptitude mock tests.',
        slot_3: 'Laboratory preparation: Tested Python search algorithms and constraint satisfaction problem notebooks.',
        slot_4: 'Class Teacher duties: Addressed V IT-A student attendance queries and communicated feedback to parents.',
        slot_5: 'Conducted Artificial Intelligence Lab (AI LAB - PC556ITU23) Batch A with Mrs. B. Deepa in Advanced AI Lab.',
        slot_6: 'Continued AI Lab Batch A execution: Verified A* Search and 8-Puzzle problem implementation in Python.',
        slot_closing: 'Consolidated V IT-A class attendance, entered daily assessment marks into ERP portal, and prepared slides for Minimax search.',
      },
      savedAt: new Date(Date.now() - 86400000).toISOString(),
      totalFilledSlots: 7,
      hodStatus: 'Approved',
      hodRemarks: 'Excellent alignment with V Sem curriculum and timely execution of AI laboratory sessions.',
    },
  ];
}

export const INITIAL_TIMETABLE_SAMPLE_LOGS: ActivityLog[] = getInitialTimetableSampleLogs();

export const DEFAULT_FACULTY_SAMPLE_ACTIVITY = {
  employeeName: 'MRS. STVSAV. RAMYA',
  role: 'Faculty' as const,
  department: 'Department of Information Technology',
  activities: {
    slot_1: 'Operating Systems Lab (OS LAB - U25PC382IT): Batch A laboratory session supervision with Ms. Mizna / Mrs. G. Shravya in Room N 304.',
    slot_2: 'Supervised OS Lab experimentation: Process creation, fork(), and thread synchronization in Linux.',
    slot_3: 'Class Teacher Administration: Verified student attendance records for B.E III SEM - IT SEC-A.',
    slot_4: 'Student Mentoring & Doubt Clarification: Addressed student queries regarding process scheduling algorithms.',
    slot_5: 'Curriculum Pacing Review: Checked syllabus progression and question bank alignment for Mid-Term Exams.',
    slot_6: 'Conducted Operating Systems Lecture (OS - U25PC302IT) on Semaphores, Critical Section Problem, and Deadlocks in Room N 304.',
    slot_closing: 'Recorded daily attendance into Matrusri automation portal, verified lab observation notebooks, and organized tomorrow\'s lecture materials.',
  },
};
