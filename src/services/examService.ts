import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Mark, Exam } from '../types/database.types';
import { DEMO_MARKS, DEMO_UPCOMING_EXAMS } from './mockData';

const MARKS_STORAGE_KEY = 'edunexa_marks_db';

function getStoredMarks(): Mark[] {
  const data = localStorage.getItem(MARKS_STORAGE_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  localStorage.setItem(MARKS_STORAGE_KEY, JSON.stringify(DEMO_MARKS));
  return DEMO_MARKS;
}

function saveStoredMarks(marks: Mark[]) {
  localStorage.setItem(MARKS_STORAGE_KEY, JSON.stringify(marks));
}

export function calculateCBSEGrade(pct: number): string {
  if (pct >= 91) return 'A1';
  if (pct >= 81) return 'A2';
  if (pct >= 71) return 'B1';
  if (pct >= 61) return 'B2';
  if (pct >= 51) return 'C1';
  if (pct >= 41) return 'C2';
  if (pct >= 33) return 'D';
  return 'E';
}

export const examService = {
  async getUpcomingExams(_institutionId: string) {
    return DEMO_UPCOMING_EXAMS;
  },

  async getStudentMarks(studentId: string): Promise<Mark[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('marks')
        .select('*, exam_subject:exam_subjects(*, subject:subjects(*))')
        .eq('student_id', studentId);
      if (error) throw new Error(error.message);
      return (data as Mark[]) || [];
    }
    return getStoredMarks().filter((m) => m.student_id === studentId);
  },

  async getAllMarks(): Promise<Mark[]> {
    return getStoredMarks();
  },

  async saveBatchMarks(marksList: Array<Omit<Mark, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('marks').upsert(marksList, { onConflict: 'exam_subject_id, student_id' });
      if (error) throw new Error(error.message);
      return;
    }

    const current = getStoredMarks();
    for (const item of marksList) {
      const existingIdx = current.findIndex(
        (m) => m.exam_subject_id === item.exam_subject_id && m.student_id === item.student_id
      );
      const total = (item.theory_marks || 0) + (item.practical_marks || 0) + (item.internal_marks || 0);
      const grade = calculateCBSEGrade(total);

      const markRecord: Mark = {
        ...item,
        id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        total_marks: total,
        grade,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        current[existingIdx] = { ...markRecord, id: current[existingIdx].id };
      } else {
        current.push(markRecord);
      }
    }

    saveStoredMarks(current);
  },
};
