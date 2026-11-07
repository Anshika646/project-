import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { studentService } from './studentService';
import { DEMO_INSTITUTION_ID } from './mockData';

export interface AdmissionEnquiry {
  id: string;
  institution_id: string;
  student_name: string;
  parent_name: string;
  phone: string;
  email: string;
  target_class: string;
  status: 'enquiry' | 'applied' | 'interview_scheduled' | 'admitted' | 'rejected';
  enquiry_date: string;
  notes?: string;
  previous_school?: string;
}

export interface ComprehensiveAdmissionData {
  // A. Student Information
  first_name: string;
  middle_name?: string;
  last_name: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  blood_group: string;
  national_id_aadhaar?: string;
  category: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS';
  mother_tongue: string;
  nationality: string;

  // B. Parent / Guardian Information
  father_name: string;
  father_phone: string;
  father_occupation?: string;
  mother_name: string;
  mother_phone: string;
  mother_occupation?: string;
  primary_email: string;
  residential_address: string;
  city: string;
  state: string;
  pincode: string;

  // C. Previous School Information
  previous_school_name?: string;
  previous_board?: string;
  previous_class?: string;
  previous_tc_number?: string;
  previous_marks_percentage?: string;
  previous_reason_for_leaving?: string;

  // D. Academic Allocation
  academic_session: string;
  class_id: string;
  section_id: string;
  stream?: string;
  second_language?: string;
  roll_number?: string;
  transport_required?: boolean;

  // E. Documents Checklist
  doc_birth_certificate: boolean;
  doc_transfer_certificate: boolean;
  doc_previous_marksheet: boolean;
  doc_id_proof: boolean;
  doc_photographs: boolean;
  doc_medical_fitness: boolean;

  // F. Emergency Contact & Health
  emergency_contact_name: string;
  emergency_relationship: string;
  emergency_phone: string;
  known_allergies?: string;
  family_doctor_name?: string;

  // G. Declaration & Approval
  parent_declaration_agreed: boolean;
  admin_approval_status: 'draft' | 'approved' | 'rejected';
  admin_notes?: string;
}

const ENQUIRIES_KEY = 'edunexa_admissions_enquiries';
const ADMISSIONS_DRAFT_KEY = 'edunexa_admissions_drafts';

export const INITIAL_ENQUIRIES: AdmissionEnquiry[] = [
  {
    id: 'enq-101',
    institution_id: DEMO_INSTITUTION_ID,
    student_name: 'Vihaan Singhania',
    parent_name: 'Sanjay Singhania',
    phone: '+91 98112 44321',
    email: 'sanjay.singhania@gmail.com',
    target_class: 'Class 1',
    status: 'interview_scheduled',
    enquiry_date: '2026-03-01',
    notes: 'Relocated from Mumbai. Interested in foundational CBSE curriculum.',
    previous_school: 'St. Mary Pre-Primary',
  },
  {
    id: 'enq-102',
    institution_id: DEMO_INSTITUTION_ID,
    student_name: 'Meera Nambiar',
    parent_name: 'Dr. Vivek Nambiar',
    phone: '+91 97401 22889',
    email: 'vivek.nambiar@hospital.org',
    target_class: 'Class 11',
    status: 'applied',
    enquiry_date: '2026-03-05',
    notes: 'Opting for Science Stream (PCB) with 94% in Class 10 Board prelims.',
    previous_school: 'Delhi Public School',
  },
  {
    id: 'enq-103',
    institution_id: DEMO_INSTITUTION_ID,
    student_name: 'Kabir Malhotra',
    parent_name: 'Ritu Malhotra',
    phone: '+91 98200 55412',
    email: 'ritu.malhotra@yahoo.com',
    target_class: 'Nursery',
    status: 'enquiry',
    enquiry_date: '2026-03-10',
    notes: 'Parent requested school tour and foundational activity center demo.',
    previous_school: 'N/A',
  },
  {
    id: 'enq-104',
    institution_id: DEMO_INSTITUTION_ID,
    student_name: 'Ananya Deshmukh',
    parent_name: 'Prakash Deshmukh',
    phone: '+91 99304 88711',
    email: 'prakash.deshmukh@tcs.com',
    target_class: 'Class 6',
    status: 'admitted',
    enquiry_date: '2026-02-15',
    notes: 'Admission approved and enrolled in Section 6-B.',
    previous_school: 'Kendriya Vidyalaya',
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

export const admissionService = {
  async getEnquiries(institutionId: string): Promise<AdmissionEnquiry[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('admission_enquiries')
        .select('*')
        .eq('institution_id', institutionId)
        .order('enquiry_date', { ascending: false });
      if (!error && data) return data as AdmissionEnquiry[];
    }
    const all = getStored(ENQUIRIES_KEY, INITIAL_ENQUIRIES);
    return all.filter((e) => e.institution_id === institutionId || e.institution_id === DEMO_INSTITUTION_ID);
  },

  async addEnquiry(enquiry: Omit<AdmissionEnquiry, 'id' | 'enquiry_date'>): Promise<AdmissionEnquiry> {
    const newEnquiry: AdmissionEnquiry = {
      ...enquiry,
      id: `enq-${Date.now()}`,
      enquiry_date: new Date().toISOString().split('T')[0],
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('admission_enquiries').insert(newEnquiry).select().single();
      if (!error && data) return data as AdmissionEnquiry;
    }

    const list = getStored(ENQUIRIES_KEY, INITIAL_ENQUIRIES);
    list.unshift(newEnquiry);
    saveStored(ENQUIRIES_KEY, list);
    return newEnquiry;
  },

  async updateEnquiryStatus(id: string, status: AdmissionEnquiry['status']): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('admission_enquiries').update({ status }).eq('id', id);
    }
    const list = getStored(ENQUIRIES_KEY, INITIAL_ENQUIRIES);
    const updated = list.map((item) => (item.id === id ? { ...item, status } : item));
    saveStored(ENQUIRIES_KEY, updated);
  },

  async submitFullAdmission(institutionId: string, form: ComprehensiveAdmissionData): Promise<{ studentId: string; admissionNumber: string }> {
    const admissionNumber = `ADM-2025-${Math.floor(1000 + Math.random() * 9000)}`;
    const studentFullName = `${form.first_name} ${form.middle_name ? form.middle_name + ' ' : ''}${form.last_name}`.trim();

    // Add student to system
    const student = await studentService.addStudent({
      fullName: studentFullName,
      admissionNumber,
      rollNumber: form.roll_number || `${Math.floor(1 + Math.random() * 45)}`,
      classId: form.class_id,
      sectionId: form.section_id,
      dateOfBirth: form.dob,
      gender: form.gender,
      bloodGroup: form.blood_group,
      emergencyContact: form.emergency_phone,
      address: `${form.residential_address}, ${form.city}, ${form.state} - ${form.pincode}`,
      institutionId,
    });

    if (isSupabaseConfigured) {
      const activeSession = await supabase.from('academic_sessions').select('id').eq('institution_id', institutionId).eq('status', 'active').maybeSingle();
      const appId = `APP-2025-${Math.floor(1000 + Math.random() * 9000)}`;
      await supabase.from('admission_applications').insert({
        institution_id: institutionId,
        application_number: appId,
        session_id: activeSession.data?.id,
        target_class_id: form.class_id,
        target_stream: form.stream || null,
        form_data: form,
        status: 'enrolled',
        submitted_at: new Date().toISOString(),
      });
    }

    return {
      studentId: student.id,
      admissionNumber,
    };
  },

  getDrafts(): ComprehensiveAdmissionData[] {
    return getStored<ComprehensiveAdmissionData>(ADMISSIONS_DRAFT_KEY, []);
  },

  saveDraft(draft: ComprehensiveAdmissionData) {
    const drafts = this.getDrafts();
    drafts.push(draft);
    saveStored(ADMISSIONS_DRAFT_KEY, drafts);
  },
};
