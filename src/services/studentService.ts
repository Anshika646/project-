import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Student } from '../types/database.types';
import { DEMO_STUDENT } from './mockData';

const STUDENTS_STORAGE_KEY = 'edunexa_students_db';

function getStoredStudents(): Student[] {
  const data = localStorage.getItem(STUDENTS_STORAGE_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  // Initialize with initial student
  const initial = [DEMO_STUDENT];
  localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(initial));
  return initial;
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

      if (error) throw new Error(error.message);
      return {
        students: (data as Student[]) || [],
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    }

    // Local reactive storage
    let list = getStoredStudents().filter((s) => s.institution_id === query.institutionId);

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
          (s.roll_number && s.roll_number.includes(q))
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

  async softDeleteStudent(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('students')
        .update({ is_deleted: true })
        .eq('id', id);
      if (error) throw new Error(error.message);
      return;
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
