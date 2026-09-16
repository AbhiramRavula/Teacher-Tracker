import { ActivityLog } from './types';

export function getInitialTimetableSampleLogs(): ActivityLog[] {
  const todayStr = new Date().toISOString().split('T')[0];
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yesterdayStr = d.toISOString().split('T')[0];
  // Target date from official departmental report image: 10-9-26 (2026-09-10)
  const reportDateStr = '2026-09-10';

  const baseLogs: ActivityLog[] = [
    // 1. Ms. T. Vijaya Laxmi (III SEM IT A - WTLAB)
    {
      id: 'log_vijayalaxmi_10_9',
      employeeName: 'Ms. T. Vijaya Laxmi',
      role: 'Faculty',
      date: todayStr,
      department: 'Department of Information Technology',
      periodData: {
        slot_1: {
          slot: 'P1,P2',
          section: 'III A',
          courseName: 'WTLAB',
          credits: '1',
          unitNo: 'Exp.6,7',
          topicName: 'design CSS Box model , Design registration form using form table tags',
          classHour: 'P1,P2',
        },
        slot_closing: {
          slot: 'Closing',
          section: 'III A',
          courseName: 'WT LAB',
          credits: '0',
          unitNo: 'Exp.6,7',
          topicName: 'Evaluated student lab observation books and committed code repos',
          classHour: 'Closing',
        },
      },
      activities: {
        slot_1: '[WTLAB | Sec: III A | 1 Cr | Unit: Exp.6,7] design CSS Box model , Design registration form using form table tags',
        slot_closing: 'Evaluated student lab observation books and committed code repos',
      },
      savedAt: '2026-09-10T16:20:00.000Z',
      totalFilledSlots: 2,
      hodStatus: 'Approved',
      hodRemarks: 'Lab experiments 6 and 7 evaluated successfully.',
    },

    // 2. Dr. J. Srinivas (III SEM IT A - DS)
    {
      id: 'log_srinivas_10_9',
      employeeName: 'Dr. J. Srinivas',
      role: 'Faculty',
      date: todayStr,
      department: 'Department of Information Technology',
      periodData: {
        slot_3: {
          slot: 'P3',
          section: 'III A',
          courseName: 'DS',
          credits: '3',
          unitNo: '2',
          topicName: 'stack using linked list',
          classHour: 'P3',
        },
        slot_closing: {
          slot: 'Closing',
          section: 'III A',
          courseName: 'DS Lab / Dept',
          credits: '0',
          unitNo: '2',
          topicName: 'Updated course file and verified lab submissions',
          classHour: 'Closing',
        },
      },
      activities: {
        slot_3: '[DS | Sec: III A | 3 Cr | Unit: 2] stack using linked list',
        slot_closing: 'Updated course file and verified lab submissions',
      },
      savedAt: '2026-09-10T16:25:00.000Z',
      totalFilledSlots: 2,
      hodStatus: 'Approved',
      hodRemarks: 'Accurate logging for DS theory.',
    },

    // 3. Mr. M. Suresh Kumar (III A FA, III-B F&A, III-B IC)
    {
      id: 'log_sureshkumar_10_9',
      employeeName: 'Mr. M. Suresh Kumar',
      role: 'Faculty',
      date: todayStr,
      department: 'Department of Information Technology',
      periodData: {
        slot_1: {
          slot: 'P1',
          section: 'III-B',
          courseName: 'F&A',
          credits: '3',
          unitNo: '2',
          topicName: 'Exercise problems on Final Accounts',
          classHour: 'P1',
        },
        slot_4: {
          slot: 'P4',
          section: 'III A',
          courseName: 'FA',
          credits: '3',
          unitNo: '2',
          topicName: 'Exercise problems on Final Accounts',
          classHour: 'P4',
        },
        slot_6: {
          slot: 'P6',
          section: 'III-B',
          courseName: 'IC',
          credits: '0',
          unitNo: '3',
          topicName: 'Powers and functions of Lok Sabha',
          classHour: 'P6',
        },
      },
      activities: {
        slot_1: '[F&A | Sec: III-B | 3 Cr | Unit: 2] Exercise problems on Final Accounts',
        slot_4: '[FA | Sec: III A | 3 Cr | Unit: 2] Exercise problems on Final Accounts',
        slot_6: '[IC | Sec: III-B | 0 Cr | Unit: 3] Powers and functions of Lok Sabha',
      },
      savedAt: '2026-09-10T16:30:00.000Z',
      totalFilledSlots: 3,
      hodStatus: 'Approved',
      hodRemarks: 'FA and Constitution periods logged properly.',
    },

    // 4. Dr. J. Shailaja (III A EDS, III-B EDS)
    {
      id: 'log_shailaja_10_9',
      employeeName: 'Dr. J. Shailaja',
      role: 'Faculty',
      date: todayStr,
      department: 'Department of Information Technology',
      periodData: {
        slot_4: {
          slot: 'P4',
          section: 'III-B',
          courseName: 'EDS',
          credits: '3',
          unitNo: '3',
          topicName: 'Input resistance and output resistance',
          classHour: 'P4',
        },
        slot_5: {
          slot: 'P5',
          section: 'III A',
          courseName: 'EDS',
          credits: '3',
          unitNo: '3',
          topicName: 'Input resistance and output resistance',
          classHour: 'P5',
        },
      },
      activities: {
        slot_4: '[EDS | Sec: III-B | 3 Cr | Unit: 3] Input resistance and output resistance',
        slot_5: '[EDS | Sec: III A | 3 Cr | Unit: 3] Input resistance and output resistance',
      },
      savedAt: '2026-09-10T16:32:00.000Z',
      totalFilledSlots: 2,
      hodStatus: 'Approved',
    },

    // 5. Dr. K. Durga Prasad (III A DELD, III-B DELD)
    {
      id: 'log_durgaprasad_10_9',
      employeeName: 'Dr. K. Durga Prasad',
      role: 'Faculty',
      date: todayStr,
      department: 'Department of Information Technology',
      periodData: {
        slot_5: {
          slot: 'P5',
          section: 'III-B',
          courseName: 'DELD',
          credits: '3',
          unitNo: '2',
          topicName: 'QUINEMCCLUSKEY METHOD',
          classHour: 'P5',
        },
        slot_6: {
          slot: 'P6',
          section: 'III A',
          courseName: 'DELD',
          credits: '3',
          unitNo: '2',
          topicName: 'QUINEMCCLUSKEY METHOD',
          classHour: 'P6',
        },
      },
      activities: {
        slot_5: '[DELD | Sec: III-B | 3 Cr | Unit: 2] QUINEMCCLUSKEY METHOD',
        slot_6: '[DELD | Sec: III A | 3 Cr | Unit: 2] QUINEMCCLUSKEY METHOD',
      },
      savedAt: '2026-09-10T16:35:00.000Z',
      totalFilledSlots: 2,
      hodStatus: 'Approved',
    },

    // 6. MS. G. Akshara (V IT A SE)
    {
      id: 'log_akshara_10_9',
      employeeName: 'MS. G. Akshara',
      role: 'Faculty',
      date: todayStr,
      department: 'Department of Information Technology',
      periodData: {
        slot_1: {
          slot: 'P 1',
          section: 'V IT A',
          courseName: 'SE',
          credits: '3',
          unitNo: '2',
          topicName: 'Assessing Alternative Architecture Designs',
          classHour: 'P 1',
        },
      },
      activities: {
        slot_1: '[SE | Sec: V IT A | 3 Cr | Unit: 2] Assessing Alternative Architecture Designs',
      },
      savedAt: '2026-09-10T16:40:00.000Z',
      totalFilledSlots: 1,
      hodStatus: 'Approved',
    },

    // 7. Mrs. M. Srividya (V IT A PPL)
    {
      id: 'log_srividya_10_9',
      employeeName: 'Mrs. M. Srividya',
      role: 'Faculty',
      date: todayStr,
      department: 'Department of Information Technology',
      periodData: {
        slot_2: {
          slot: 'p2',
          section: 'V IT A',
          courseName: 'PPL',
          credits: '3',
          unitNo: '2',
          topicName: 'Names, Variables and Concept of Binding',
          classHour: 'p2',
        },
        slot_4: {
          slot: 'p4',
          section: 'V IT A',
          courseName: 'PPL',
          credits: '3',
          unitNo: '2',
          topicName: 'default parameters',
          classHour: 'p4',
        },
      },
      activities: {
        slot_2: '[PPL | Sec: V IT A | 3 Cr | Unit: 2] Names, Variables and Concept of Binding',
        slot_4: '[PPL | Sec: V IT A | 3 Cr | Unit: 2] default parameters',
      },
      savedAt: '2026-09-10T16:42:00.000Z',
      totalFilledSlots: 2,
      hodStatus: 'Approved',
    },

    // 8. Ms. K. Smitha (V IT A Disaster Management)
    {
      id: 'log_smitha_10_9',
      employeeName: 'Ms. K. Smitha',
      role: 'Faculty',
      date: todayStr,
      department: 'Department of Information Technology',
      periodData: {
        slot_3: {
          slot: 'P3',
          section: 'V IT A',
          courseName: 'Disaster Management',
          credits: '3',
          unitNo: '2',
          topicName: 'Emerging risks in Disasters- Climate change and urban disasters',
          classHour: 'P3',
        },
      },
      activities: {
        slot_3: '[Disaster Management | Sec: V IT A | 3 Cr | Unit: 2] Emerging risks in Disasters- Climate change and urban disasters',
      },
      savedAt: '2026-09-10T16:45:00.000Z',
      totalFilledSlots: 1,
      hodStatus: 'Approved',
    },

    // 9. Mrs. T. Aruna Jyothi (V IT A AI Lab, V-B AI, V B AI Lab)
    {
      id: 'log_aruna_10_9',
      employeeName: 'Mrs. T. Aruna Jyothi',
      role: 'Faculty',
      date: todayStr,
      department: 'Department of Information Technology',
      periodData: {
        slot_1: {
          slot: 'P1',
          section: 'V-B',
          courseName: 'AI',
          credits: '3',
          unitNo: '3',
          topicName: 'probability reasoning:Probability',
          classHour: 'P1',
        },
        slot_3: {
          slot: 'P3,p4',
          section: 'V B',
          courseName: 'AI Lab',
          credits: '3',
          unitNo: '2',
          topicName: '2.a Greedy best First search(informed Search)',
          classHour: 'P3,p4',
        },
        slot_5: {
          slot: 'P5,p6',
          section: 'V IT A',
          courseName: 'AI Lab',
          credits: '3',
          unitNo: 'ex2.a',
          topicName: 'Greedy best first search',
          classHour: 'P5,p6',
        },
      },
      activities: {
        slot_1: '[AI | Sec: V-B | 3 Cr | Unit: 3] probability reasoning:Probability',
        slot_3: '[AI Lab | Sec: V B | 3 Cr | Unit: 2] 2.a Greedy best First search(informed Search)',
        slot_5: '[AI Lab | Sec: V IT A | 3 Cr | Unit: ex2.a] Greedy best first search',
      },
      savedAt: '2026-09-10T16:48:00.000Z',
      totalFilledSlots: 3,
      hodStatus: 'Approved',
    },

    // 10. Mrs. Y. Sirisha (VII IT A BDA, V B OOAD, VII B BDA)
    {
      id: 'log_sirisha_10_9',
      employeeName: 'Mrs. Y. Sirisha',
      role: 'Faculty',
      date: todayStr,
      department: 'Department of Information Technology',
      periodData: {
        slot_1: {
          slot: 'P1',
          section: 'VII IT A',
          courseName: 'BDA',
          credits: '3',
          unitNo: '3',
          topicName: 'schema less databases',
          classHour: 'P1',
        },
        slot_2: {
          slot: 'P2',
          section: 'VII B',
          courseName: 'BDA',
          credits: '3',
          unitNo: '',
          topicName: 'Attended Motivational Event',
          classHour: 'P2',
        },
        slot_3: {
          slot: 'P3',
          section: 'VII B',
          courseName: 'BDA',
          credits: '3',
          unitNo: '',
          topicName: 'Attended Motivational Event',
          classHour: 'P3',
        },
        slot_5: {
          slot: 'P5',
          section: 'V B',
          courseName: 'OOAD',
          credits: '3',
          unitNo: '2',
          topicName: 'state chart diagrams',
          classHour: 'P5',
        },
      },
      activities: {
        slot_1: '[BDA | Sec: VII IT A | 3 Cr | Unit: 3] schema less databases',
        slot_2: '[BDA | Sec: VII B | 3 Cr | Unit: ] Attended Motivational Event',
        slot_3: '[BDA | Sec: VII B | 3 Cr | Unit: ] Attended Motivational Event',
        slot_5: '[OOAD | Sec: V B | 3 Cr | Unit: 2] state chart diagrams',
      },
      savedAt: '2026-09-10T16:50:00.000Z',
      totalFilledSlots: 4,
      hodStatus: 'Approved',
    },

    // 11. Ms. Pushpa (VII IT A CS, VII B CS)
    {
      id: 'log_pushpa_10_9',
      employeeName: 'Ms. Pushpa',
      role: 'Faculty',
      date: todayStr,
      department: 'Department of Information Technology',
      periodData: {
        slot_1: {
          slot: 'P1',
          section: 'VII B',
          courseName: 'CS',
          credits: '3',
          unitNo: '2',
          topicName: 'digital forensics of E mail',
          classHour: 'P1',
        },
        slot_2: {
          slot: 'p2',
          section: 'VII IT A',
          courseName: 'CS',
          credits: '3',
          unitNo: '3',
          topicName: 'Attended Motivational Event',
          classHour: 'p2',
        },
        slot_4: {
          slot: 'P4',
          section: 'VII B',
          courseName: 'CS',
          credits: '3',
          unitNo: '',
          topicName: 'computer forensics of investigation',
          classHour: 'P4',
        },
      },
      activities: {
        slot_1: '[CS | Sec: VII B | 3 Cr | Unit: 2] digital forensics of E mail',
        slot_2: '[CS | Sec: VII IT A | 3 Cr | Unit: 3] Attended Motivational Event',
        slot_4: '[CS | Sec: VII B | 3 Cr | Unit: ] computer forensics of investigation',
      },
      savedAt: '2026-09-10T16:52:00.000Z',
      totalFilledSlots: 3,
      hodStatus: 'Approved',
    },

    // 12. Ms. R. Madhavi (III-B MFIT)
    {
      id: 'log_madhavi_10_9',
      employeeName: 'Ms. R. Madhavi',
      role: 'Faculty',
      date: todayStr,
      department: 'Department of Information Technology',
      periodData: {
        slot_2: {
          slot: 'P2',
          section: 'III-B',
          courseName: 'MFIT',
          credits: '3',
          unitNo: '2',
          topicName: 'Lattice and its properties',
          classHour: 'P2',
        },
      },
      activities: {
        slot_2: '[MFIT | Sec: III-B | 3 Cr | Unit: 2] Lattice and its properties',
      },
      savedAt: '2026-09-10T16:55:00.000Z',
      totalFilledSlots: 1,
      hodStatus: 'Approved',
    },

    // 13. Mrs. STVSAV. Ramya (III-B OS)
    {
      id: 'log_ramya_10_9',
      employeeName: 'Mrs. STVSAV. Ramya',
      role: 'Faculty',
      date: todayStr,
      department: 'Department of Information Technology',
      periodData: {
        slot_3: {
          slot: 'P3',
          section: 'III-B',
          courseName: 'OS',
          credits: '3',
          unitNo: '2',
          topicName: 'Deadlock avoidance and detection',
          classHour: 'P3',
        },
        slot_closing: {
          slot: 'Closing',
          section: 'III-B',
          courseName: 'OS Lab / Attendance',
          credits: '0',
          unitNo: '2',
          topicName: 'Updated student attendance registers and lab evaluation sheets',
          classHour: 'Closing',
        },
      },
      activities: {
        slot_3: '[OS | Sec: III-B | 3 Cr | Unit: 2] Deadlock avoidance and detection',
        slot_closing: 'Updated student attendance registers and lab evaluation sheets',
      },
      savedAt: '2026-09-10T16:58:00.000Z',
      totalFilledSlots: 2,
      hodStatus: 'Approved',
    },

    // 14. Mrs. K. Mounika (V B FSD)
    {
      id: 'log_mounika_10_9',
      employeeName: 'Mrs. K. Mounika',
      role: 'Faculty',
      date: todayStr,
      department: 'Department of Information Technology',
      periodData: {
        slot_2: {
          slot: 'P2',
          section: 'V B',
          courseName: 'FSD',
          credits: '3',
          unitNo: '2',
          topicName: 'Render',
          classHour: 'P2',
        },
      },
      activities: {
        slot_2: '[FSD | Sec: V B | 3 Cr | Unit: 2] Render',
      },
      savedAt: '2026-09-10T17:00:00.000Z',
      totalFilledSlots: 1,
      hodStatus: 'Approved',
    },
  ];

  // Also duplicate for reportDateStr (2026-09-10) if reportDateStr !== todayStr so history is preserved
  if (reportDateStr !== todayStr) {
    const historicalLogs = baseLogs.map((l) => ({
      ...l,
      id: `${l.id}_hist`,
      date: reportDateStr,
    }));
    return [...baseLogs, ...historicalLogs];
  }

  return baseLogs;
}

export const INITIAL_TIMETABLE_SAMPLE_LOGS: ActivityLog[] = getInitialTimetableSampleLogs();

export const DEFAULT_FACULTY_SAMPLE_ACTIVITY = {
  employeeName: 'Mrs. STVSAV. Ramya',
  role: 'Faculty' as const,
  department: 'Department of Information Technology',
  activities: {
    slot_1: '[OS LAB | Sec: III A | 1 Cr | Unit: 2] Supervised OS Lab on Linux Process Creation and Fork System Calls',
    slot_2: '[OS LAB | Sec: III A | 1 Cr | Unit: 2] Linux Thread Synchronization and Mutex Semaphores',
    slot_3: '[OS | Sec: III-B | 3 Cr | Unit: 2] Deadlock avoidance and detection algorithms',
    slot_4: 'Class Teacher student attendance verification and counseling for III IT-A',
    slot_5: 'Curriculum pacing review and mid-term exam question bank formulation',
    slot_6: '[OS | Sec: III A | 3 Cr | Unit: 2] Critical Section Problem and Peterson Algorithm',
    slot_closing: 'Recorded daily attendance into Matrusri automation portal and verified lab observation books',
  },
};
