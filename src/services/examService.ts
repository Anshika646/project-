import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Mark, Exam } from '../types/database.types';
import { DEMO_MARKS, DEMO_UPCOMING_EXAMS } from './mockData';

export const examService = {
  async getUpcomingExams(institutionId: string) {
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
    return DEMO_MARKS.filter((m) => m.student_id === studentId);
  },
};
