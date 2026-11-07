import { supabase, isSupabaseConfigured, isTableMissingError } from '../lib/supabase';
import { Student, Profile } from '../types/database.types';
import { DEMO_STUDENTS, DEMO_CLASSES, DEMO_SECTIONS } from './mockData';

const STUDENTS_STORAGE_KEY = 'edunexa_students_db';

function getStoredStudents(): Student[] {
  const data = localStorage.getItem(STUDENTS_STORAGE_KEY);
  if (data) {
    try {
      const parsed: Student[] = JSON.parse(data);
      // Re-link class and section pointers if needed
      return parsed.map((s) => ({
        ...s,
        class: s.class || DEMO_CLASSES.find((c) => c.id === s.class_id),
        section: s.section || DEMO_SECTIONS.find((sec) => sec.id === s.section_id),
      }));
    } catch (e) {
      console.error(e);
    }
  }
  localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(DEMO_STUDENTS));
  return DEMO_STUDENTS;
}

function saveStoredStudents(students: Student[]) {
  localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
}

export interface StudentListQuery {
  institutionId: string;
  search?: string;
  classId?: string;
  sectionId?: string;
  page?: number;
  pageSize?: number;
  includeDeleted?: boolean;
}

export interface StudentListResponse {
  students: Student[];
  total: number;
  page: number;
  totalPages: number;
}

export const studentService = {
  async getStudents(query: StudentListQuery): Promise<StudentListResponse> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;

    if (isSupabaseConfigured) {
      let req = supabase
        .from('students')
        .select('*, profile:profiles(*), class:classes(*), section:sections(*)', { count: 'exact' })
        .eq('institution_id', query.institutionId);

      if (!query.includeDeleted) {
        req = req.eq('is_deleted', false);
      }
      if (query.classId) {
        req = req.eq('class_id', query.classId);
      }
      if (query.sectionId) {
        req = req.eq('section_id', query.sectionId);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, count, error } = await req.range(from, to);

      if (!error && data) {
        return {
          students: (data as Student[]) || [],
          total: count || 0,
          page,
          totalPages: Math.ceil((count || 0) / pageSize),
        };
      }
      if (error && !isTableMissingError(error)) {
        throw new Error(error.message);
      }
      // Gracefully fall back to local persistent dataset if remote table is not yet created in schema cache
    }

    // Local persistent storage
    let list = getStoredStudents().filter((s) => s.institution_id === query.institutionId || s.institution_id === DEMO_STUDENTS[0].institution_id);

    if (!query.includeDeleted) {
      list = list.filter((s) => !s.is_deleted);
    }
    if (query.classId) {
      list = list.filter((s) => s.class_id === query.classId);
    }
    if (query.sectionId) {
      list = list.filter((s) => s.section_id === query.sectionId);
    }
    if (query.search) {
      const q = query.search.toLowerCase();
      list = list.filter(
        (s) =>
          s.admission_number.toLowerCase().includes(q) ||
          (s.roll_number && s.roll_number.toLowerCase().includes(q)) ||
          (s.profile && s.profile.full_name.toLowerCase().includes(q))
      );
    }

    const total = list.length;
    const start = (page - 1) * pageSize;
    const paginated = list.slice(start, start + pageSize);

    return {
      students: paginated,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  },

  async getStudentById(id: string): Promise<Student | null> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('students')
        .select('*, profile:profiles(*), class:classes(*), section:sections(*)')
        .eq('id', id)
        .single();
      if (error) return null;
      return data as Student;
    }
    return getStoredStudents().find((s) => s.id === id) || null;
  },

  async addStudent(studentData: {
    fullName: string;
    admissionNumber: string;
    rollNumber: string;
    classId: string;
    sectionId: string;
    gender: string;
    dateOfBirth?: string;
    bloodGroup?: string;
    emergencyContact?: string;
    address?: string;
    institutionId: string;
  }): Promise<Student> {
    const studentId = `stud-${Date.now()}`;
    const profileId = `user-stud-${Date.now()}`;

    const profileRecord: Profile = {
      id: profileId,
      institution_id: studentData.institutionId,
      role: 'student',
      full_name: studentData.fullName,
      email: `${studentData.fullName.toLowerCase().replace(/\s+/g, '.')}@springfield.edunexa.edu`,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newStudent: Student = {
      id: studentId,
      institution_id: studentData.institutionId,
      profile_id: profileId,
      admission_number: studentData.admissionNumber,
      roll_number: studentData.rollNumber,
      class_id: studentData.classId,
      section_id: studentData.sectionId,
      date_of_birth: studentData.dateOfBirth || '2010-01-01',
      gender: studentData.gender,
      blood_group: studentData.bloodGroup || 'O+',
      emergency_contact: studentData.emergencyContact || '+91 98000 00000',
      address: studentData.address || 'Address provided on admission form',
      admission_date: new Date().toISOString().split('T')[0],
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile: profileRecord,
      class: DEMO_CLASSES.find((c) => c.id === studentData.classId),
      section: DEMO_SECTIONS.find((s) => s.id === studentData.sectionId),
    };

    if (isSupabaseConfigured) {
      const nameParts = studentData.fullName.trim().split(' ');
      const firstName = nameParts[0] || 'Student';
      const lastName = nameParts.slice(1).join(' ') || firstName;

      await supabase.from('profiles').insert(profileRecord);
      const { data, error } = await supabase.from('students').insert({
        id: newStudent.id,
        institution_id: newStudent.institution_id,
        profile_id: newStudent.profile_id,
        first_name: firstName,
        last_name: lastName,
        admission_number: newStudent.admission_number,
        roll_number: newStudent.roll_number,
        class_id: newStudent.class_id,
        section_id: newStudent.section_id,
        date_of_birth: newStudent.date_of_birth,
        gender: newStudent.gender,
        blood_group: newStudent.blood_group,
        emergency_contact: newStudent.emergency_contact,
        residential_address: newStudent.address || 'Address provided on admission',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        is_deleted: false,
      }).select().single();
      if (!error && data) return data as Student;
      if (error && !isTableMissingError(error)) throw new Error(error.message);
    }

    const list = getStoredStudents();
    list.unshift(newStudent);
    saveStoredStudents(list);
    return newStudent;
  },

  async bulkImportStudents(students: Array<{
    fullName: string;
    admissionNumber: string;
    rollNumber: string;
    classId: string;
    sectionId: string;
    gender: string;
  }>, institutionId: string): Promise<number> {
    const list = getStoredStudents();
    let count = 0;

    for (const item of students) {
      const studentId = `stud-${Date.now()}-${count}`;
      const profileId = `user-stud-${Date.now()}-${count}`;
      const newStudent: Student = {
        id: studentId,
        institution_id: institutionId,
        profile_id: profileId,
        admission_number: item.admissionNumber,
        roll_number: item.rollNumber,
        class_id: item.classId,
        section_id: item.sectionId,
        gender: item.gender || 'Not Specified',
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile: {
          id: profileId,
          institution_id: institutionId,
          role: 'student',
          full_name: item.fullName,
          email: `${item.fullName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@edunexa.edu`,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        class: DEMO_CLASSES.find((c) => c.id === item.classId),
        section: DEMO_SECTIONS.find((s) => s.id === item.sectionId),
      };
      list.push(newStudent);
      count++;
    }

    saveStoredStudents(list);
    return count;
  },

  async promoteStudent(id: string, targetClassId: string, targetSectionId: string): Promise<void> {
    const list = getStoredStudents();
    const student = list.find((s) => s.id === id);
    if (student) {
      student.class_id = targetClassId;
      student.section_id = targetSectionId;
      student.class = DEMO_CLASSES.find((c) => c.id === targetClassId);
      student.section = DEMO_SECTIONS.find((s) => s.id === targetSectionId);
      student.updated_at = new Date().toISOString();
      saveStoredStudents(list);
    }
  },

  async softDeleteStudent(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('students')
        .update({ is_deleted: true })
        .eq('id', id);
      if (!error) return;
      if (error && !isTableMissingError(error)) throw new Error(error.message);
    }

    const list = getStoredStudents();
    const target = list.find((s) => s.id === id);
    if (target) {
      target.is_deleted = true;
      target.updated_at = new Date().toISOString();
      saveStoredStudents(list);
    }
  },
};
