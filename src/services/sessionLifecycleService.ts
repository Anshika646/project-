import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DEMO_INSTITUTION_ID } from './mockData';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface AcademicSessionRecord {
  id: string;
  institution_id: string;
  name: string; // e.g. "2025 – 2026"
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'closed';
  terms_count: number;
  total_working_days: number;
  is_locked: boolean;
  archived_at?: string | null;
  created_at: string;
}

export interface StudentPromotionRecord {
  id: string;
  student_id: string;
  student_name: string;
  roll_number: string;
  from_session: string;
  from_class: string;
  from_section: string;
  to_session: string;
  to_class: string;
  to_section: string;
  final_percentage: number;
  final_grade: string;
  attendance_percentage: number;
  promotion_status: 'promoted' | 'retained' | 'tc_issued';
  promoted_at: string;
}

export interface TransferCertificateRecord {
  id: string;
  tc_number: string;
  student_id: string;
  student_name: string;
  admission_number: string;
  father_name: string;
  mother_name: string;
  nationality: string;
  dob: string;
  last_class_studied: string;
  school_board_annual_exam_result: 'Passed' | 'Failed' | 'Qualified for Higher Class';
  promoted_to_higher_class: boolean;
  promoted_to_class_name?: string;
  fee_dues_paid: boolean;
  date_of_application: string;
  date_of_issue: string;
  reason_for_leaving: string;
  total_working_days: number;
  total_days_present: number;
  general_conduct: 'Exemplary' | 'Very Good' | 'Good' | 'Satisfactory';
}

const SESSIONS_KEY = 'edunexa_academic_sessions_db';
const PROMOTIONS_KEY = 'edunexa_promotions_db';
const TCS_KEY = 'edunexa_tcs_db';

export const INITIAL_SESSIONS: AcademicSessionRecord[] = [
  {
    id: 'ses-2024-2025',
    institution_id: DEMO_INSTITUTION_ID,
    name: '2024 – 2025',
    start_date: '2024-04-01',
    end_date: '2025-03-31',
    status: 'closed',
    terms_count: 2,
    total_working_days: 220,
    is_locked: true,
    archived_at: '2025-04-02T10:00:00Z',
    created_at: '2024-03-01T00:00:00Z',
  },
  {
    id: 'ses-2025-2026',
    institution_id: DEMO_INSTITUTION_ID,
    name: '2025 – 2026',
    start_date: '2025-04-01',
    end_date: '2026-03-31',
    status: 'active',
    terms_count: 2,
    total_working_days: 224,
    is_locked: false,
    archived_at: null,
    created_at: '2025-02-15T00:00:00Z',
  },
  {
    id: 'ses-2026-2027',
    institution_id: DEMO_INSTITUTION_ID,
    name: '2026 – 2027',
    start_date: '2026-04-01',
    end_date: '2027-03-31',
    status: 'draft',
    terms_count: 2,
    total_working_days: 222,
    is_locked: false,
    archived_at: null,
    created_at: '2026-01-10T00:00:00Z',
  },
];

export const INITIAL_TCS: TransferCertificateRecord[] = [
  {
    id: 'tc-001',
    tc_number: 'SIS/TC/2025/081',
    student_id: 'std-tc-1',
    student_name: 'Devansh Kulkarni',
    admission_number: 'ADM-2021-042',
    father_name: 'Sudhir Kulkarni',
    mother_name: 'Anjali Kulkarni',
    nationality: 'Indian',
    dob: '2008-08-14',
    last_class_studied: 'Class 10',
    school_board_annual_exam_result: 'Passed',
    promoted_to_higher_class: true,
    promoted_to_class_name: 'Class 11',
    fee_dues_paid: true,
    date_of_application: '2025-05-10',
    date_of_issue: '2025-05-15',
    reason_for_leaving: 'Parental transfer to London, UK',
    total_working_days: 218,
    total_days_present: 206,
    general_conduct: 'Exemplary',
  },
  {
    id: 'tc-002',
    tc_number: 'SIS/TC/2025/082',
    student_id: 'std-tc-2',
    student_name: 'Rhea Sen',
    admission_number: 'ADM-2023-112',
    father_name: 'Dr. Debabrata Sen',
    mother_name: 'Sharmila Sen',
    nationality: 'Indian',
    dob: '2012-11-20',
    last_class_studied: 'Class 6',
    school_board_annual_exam_result: 'Passed',
    promoted_to_higher_class: true,
    promoted_to_class_name: 'Class 7',
    fee_dues_paid: true,
    date_of_application: '2025-06-02',
    date_of_issue: '2025-06-08',
    reason_for_leaving: 'Admission into boarding school',
    total_working_days: 220,
    total_days_present: 211,
    general_conduct: 'Very Good',
  },
];

function getStored<T>(key: string, fallback: T[]): T[] {
  const data = localStorage.getItem(key);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  localStorage.setItem(key, JSON.stringify(fallback));
  return fallback;
}

function saveStored<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

export const sessionLifecycleService = {
  // SESSIONS
  async getSessions(institutionId: string): Promise<AcademicSessionRecord[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('academic_sessions')
        .select('*')
        .eq('institution_id', institutionId)
        .order('start_date', { ascending: false });
      if (!error && data) return data as AcademicSessionRecord[];
    }
    const all = getStored(SESSIONS_KEY, INITIAL_SESSIONS);
    return all.filter((s) => s.institution_id === institutionId || s.institution_id === DEMO_INSTITUTION_ID);
  },

  async createSession(session: Omit<AcademicSessionRecord, 'id' | 'created_at' | 'is_locked' | 'archived_at'>): Promise<AcademicSessionRecord> {
    const newSession: AcademicSessionRecord = {
      ...session,
      id: `ses-${Date.now()}`,
      is_locked: false,
      archived_at: null,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('academic_sessions').insert(newSession).select().single();
      if (!error && data) return data as AcademicSessionRecord;
    }

    const list = getStored(SESSIONS_KEY, INITIAL_SESSIONS);
    list.unshift(newSession);
    saveStored(SESSIONS_KEY, list);
    return newSession;
  },

  async activateSession(sessionId: string): Promise<void> {
    const list = getStored(SESSIONS_KEY, INITIAL_SESSIONS);
    const updated = list.map((s) => {
      if (s.id === sessionId) {
        return { ...s, status: 'active' as const, is_locked: false };
      }
      if (s.status === 'active') {
        return { ...s, status: 'closed' as const, is_locked: true, archived_at: new Date().toISOString() };
      }
      return s;
    });
    saveStored(SESSIONS_KEY, updated);
  },

  async closeAndArchiveSession(sessionId: string): Promise<void> {
    const list = getStored(SESSIONS_KEY, INITIAL_SESSIONS);
    const updated = list.map((s) => {
      if (s.id === sessionId) {
        return {
          ...s,
          status: 'closed' as const,
          is_locked: true,
          archived_at: new Date().toISOString(),
        };
      }
      return s;
    });
    saveStored(SESSIONS_KEY, updated);
  },

  // PROMOTIONS
  async getPromotions(): Promise<StudentPromotionRecord[]> {
    return getStored<StudentPromotionRecord>(PROMOTIONS_KEY, []);
  },

  async recordPromotion(record: Omit<StudentPromotionRecord, 'id' | 'promoted_at'>): Promise<StudentPromotionRecord> {
    const newRecord: StudentPromotionRecord = {
      ...record,
      id: `prom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      promoted_at: new Date().toISOString(),
    };
    const list = getStored<StudentPromotionRecord>(PROMOTIONS_KEY, []);
    list.unshift(newRecord);
    saveStored(PROMOTIONS_KEY, list);
    return newRecord;
  },

  // TRANSFER CERTIFICATES
  async getTransferCertificates(): Promise<TransferCertificateRecord[]> {
    return getStored<TransferCertificateRecord>(TCS_KEY, INITIAL_TCS);
  },

  async issueTransferCertificate(tcData: Omit<TransferCertificateRecord, 'id'>): Promise<TransferCertificateRecord> {
    const newTc: TransferCertificateRecord = {
      ...tcData,
      id: `tc-${Date.now()}`,
    };
    const list = getStored<TransferCertificateRecord>(TCS_KEY, INITIAL_TCS);
    list.unshift(newTc);
    saveStored(TCS_KEY, list);
    return newTc;
  },

  generateOfficialTCPDF(tc: TransferCertificateRecord, institutionName = 'Springfield International School') {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Page styling
    doc.setDrawColor(109, 40, 217); // Rich purple border
    doc.setLineWidth(1.5);
    doc.rect(8, 8, 194, 281);
    doc.setLineWidth(0.4);
    doc.rect(10, 10, 190, 277);

    // Header Emblem & School Details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42); // Dark navy
    doc.text(institutionName.toUpperCase(), 105, 24, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Affiliated to CBSE, New Delhi • Affiliation No: 2130842 • School Code: 08914', 105, 30, { align: 'center' });
    doc.text('Plot 14, Institutional Area, Sector 5, Vasant Kunj, New Delhi - 110070', 105, 35, { align: 'center' });

    doc.setDrawColor(232, 228, 223);
    doc.line(16, 40, 194, 40);

    // Certificate Title Banner
    doc.setFillColor(245, 243, 255);
    doc.roundedRect(45, 45, 120, 10, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(109, 40, 217);
    doc.text('TRANSFER CERTIFICATE', 105, 52, { align: 'center' });

    // Meta Row: TC Number & Admission Number
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`TC Number: ${tc.tc_number}`, 16, 64);
    doc.text(`Admission No: ${tc.admission_number}`, 140, 64);

    // Data table rows
    const rows = [
      ['1.', 'Name of Pupil', tc.student_name],
      ['2.', 'Father\'s / Guardian\'s Name', tc.father_name],
      ['3.', 'Mother\'s Name', tc.mother_name],
      ['4.', 'Nationality', tc.nationality],
      ['5.', 'Date of Birth (in Christian Era)', `${tc.dob}`],
      ['6.', 'Class in which pupil last studied', tc.last_class_studied],
      ['7.', 'School / Board Annual Examination Result', tc.school_board_annual_exam_result],
      ['8.', 'Whether qualified for promotion to higher class', tc.promoted_to_higher_class ? `Yes, promoted to ${tc.promoted_to_class_name || 'Higher Class'}` : 'No'],
      ['9.', 'Whether student has paid all school dues', tc.fee_dues_paid ? 'Yes, All Dues Cleared' : 'Pending Clearance'],
      ['10.', 'Total Number of Working Days in Session', `${tc.total_working_days} Days`],
      ['11.', 'Total Number of Days Pupil was Present', `${tc.total_days_present} Days`],
      ['12.', 'General Conduct and Character', tc.general_conduct],
      ['13.', 'Date of Application for Certificate', tc.date_of_application],
      ['14.', 'Date of Actual Issue of Certificate', tc.date_of_issue],
      ['15.', 'Reason for Leaving the Institution', tc.reason_for_leaving],
    ];

    autoTable(doc, {
      startY: 70,
      head: [],
      body: rows,
      theme: 'plain',
      styles: {
        fontSize: 9,
        cellPadding: 3.2,
        textColor: [15, 23, 42],
      },
      columnStyles: {
        0: { cellWidth: 10, fontStyle: 'bold', textColor: [100, 116, 139] },
        1: { cellWidth: 80, fontStyle: 'bold' },
        2: { cellWidth: 90, textColor: [15, 23, 42] },
      },
    });

    // Verification & Signatures Footer
    const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 30 : 230;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);

    doc.text('Prepared By', 25, finalY);
    doc.text('Class Teacher', 90, finalY);
    doc.text('Principal & Head Administrator', 150, finalY);

    doc.setDrawColor(200, 200, 200);
    doc.line(20, finalY - 8, 48, finalY - 8);
    doc.line(82, finalY - 8, 115, finalY - 8);
    doc.line(145, finalY - 8, 190, finalY - 8);

    doc.setFontSize(8);
    doc.text('Official Institutional Seal', 105, finalY + 16, { align: 'center' });

    doc.save(`${tc.student_name.replace(/\s+/g, '_')}_TC.pdf`);
  },
};
