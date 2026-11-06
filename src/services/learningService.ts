import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { NoteItem, QuizItem, NoticeItem, ActivityLogItem } from '../types/database.types';
import {
  DEMO_NOTES,
  DEMO_QUIZZES,
  DEMO_NOTICES,
  DEMO_RECENT_ACTIVITIES,
} from './mockData';

export const learningService = {
  async getNotes(institutionId: string, classId?: string): Promise<NoteItem[]> {
    if (isSupabaseConfigured) {
      let query = supabase.from('notes').select('*').eq('institution_id', institutionId);
      if (classId) query = query.eq('class_id', classId);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return (data as NoteItem[]) || [];
    }
    if (classId) return DEMO_NOTES.filter((n) => n.class_id === classId);
    return DEMO_NOTES;
  },

  async getQuizzes(institutionId: string): Promise<QuizItem[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('institution_id', institutionId);
      if (error) throw new Error(error.message);
      return (data as QuizItem[]) || [];
    }
    return DEMO_QUIZZES;
  },
};

export const communicationService = {
  async getNotices(institutionId: string): Promise<NoticeItem[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .eq('institution_id', institutionId)
        .order('published_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data as NoticeItem[]) || [];
    }
    return DEMO_NOTICES;
  },

  async getActivityLogs(institutionId: string): Promise<ActivityLogItem[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw new Error(error.message);
      return (data as ActivityLogItem[]) || [];
    }
    return DEMO_RECENT_ACTIVITIES;
  },
};
