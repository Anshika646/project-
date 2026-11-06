import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ClassItem, Section, Subject, TimetableSlot } from '../types/database.types';
import {
  DEMO_CLASSES,
  DEMO_SECTIONS,
  DEMO_SUBJECTS,
  DEMO_TODAYS_TIMETABLE,
} from './mockData';

export const academicService = {
  async getClasses(institutionId: string): Promise<ClassItem[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('institution_id', institutionId)
        .order('grade_level', { ascending: true });
      if (error) throw new Error(error.message);
      return (data as ClassItem[]) || [];
    }
    return DEMO_CLASSES.filter((c) => c.institution_id === institutionId);
  },

  async getSections(classId?: string): Promise<Section[]> {
    if (isSupabaseConfigured) {
      let query = supabase.from('sections').select('*');
      if (classId) query = query.eq('class_id', classId);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return (data as Section[]) || [];
    }
    if (classId) return DEMO_SECTIONS.filter((s) => s.class_id === classId);
    return DEMO_SECTIONS;
  },

  async getSubjects(institutionId: string): Promise<Subject[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('institution_id', institutionId);
      if (error) throw new Error(error.message);
      return (data as Subject[]) || [];
    }
    return DEMO_SUBJECTS.filter((s) => s.institution_id === institutionId);
  },

  async getTimetableSlots(institutionId: string, _classId?: string): Promise<TimetableSlot[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('timetable_slots')
        .select('*, subject:subjects(*), teacher:profiles(*)')
        .eq('institution_id', institutionId)
        .order('period_number', { ascending: true });
      if (error) throw new Error(error.message);
      return (data as TimetableSlot[]) || [];
    }
    return DEMO_TODAYS_TIMETABLE.filter((t) => t.institution_id === institutionId);
  },
};
