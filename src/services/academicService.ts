import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  ClassItem,
  Section,
  Subject,
  Chapter,
  TimetableSlot,
  CurriculumBoard,
} from '../types/database.types';
import {
  DEMO_CLASSES,
  DEMO_SECTIONS,
  DEMO_SUBJECTS,
  DEMO_CHAPTERS,
  DEMO_TODAYS_TIMETABLE,
  DEMO_INSTITUTION_ID,
} from './mockData';

const CLASSES_KEY = 'edunexa_classes_db';
const SECTIONS_KEY = 'edunexa_sections_db';
const SUBJECTS_KEY = 'edunexa_subjects_db';
const CHAPTERS_KEY = 'edunexa_chapters_db';
const TIMETABLE_KEY = 'edunexa_timetable_db';
const BOARD_KEY = 'edunexa_curriculum_board';

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

export const academicService = {
  // --------------------------------------------------------------------------
  // CLASSES
  // --------------------------------------------------------------------------
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
    const all = getStored(CLASSES_KEY, DEMO_CLASSES);
    return all.filter((c) => c.institution_id === institutionId || c.institution_id === DEMO_INSTITUTION_ID);
  },

  async addClass(classItem: Omit<ClassItem, 'id' | 'created_at' | 'updated_at'>): Promise<ClassItem> {
    const newClass: ClassItem = {
      ...classItem,
      id: `class-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('classes').insert(newClass).select().single();
      if (error) throw new Error(error.message);
      return data as ClassItem;
    }

    const list = getStored(CLASSES_KEY, DEMO_CLASSES);
    list.push(newClass);
    saveStored(CLASSES_KEY, list);
    return newClass;
  },

  // --------------------------------------------------------------------------
  // SECTIONS
  // --------------------------------------------------------------------------
  async getSections(classId?: string): Promise<Section[]> {
    if (isSupabaseConfigured) {
      let query = supabase.from('sections').select('*');
      if (classId) query = query.eq('class_id', classId);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return (data as Section[]) || [];
    }
    const all = getStored(SECTIONS_KEY, DEMO_SECTIONS);
    if (classId) return all.filter((s) => s.class_id === classId);
    return all;
  },

  async addSection(section: Omit<Section, 'id' | 'created_at' | 'updated_at'>): Promise<Section> {
    const newSec: Section = {
      ...section,
      id: `sec-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('sections').insert(newSec).select().single();
      if (error) throw new Error(error.message);
      return data as Section;
    }

    const list = getStored(SECTIONS_KEY, DEMO_SECTIONS);
    list.push(newSec);
    saveStored(SECTIONS_KEY, list);
    return newSec;
  },

  async updateSection(id: string, updates: Partial<Section>): Promise<Section> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('sections')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Section;
    }

    const list = getStored(SECTIONS_KEY, DEMO_SECTIONS);
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Section not found');
    list[index] = { ...list[index], ...updates, updated_at: new Date().toISOString() };
    saveStored(SECTIONS_KEY, list);
    return list[index];
  },

  // --------------------------------------------------------------------------
  // SUBJECTS
  // --------------------------------------------------------------------------
  async getSubjects(institutionId: string): Promise<Subject[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('institution_id', institutionId);
      if (error) throw new Error(error.message);
      return (data as Subject[]) || [];
    }
    const all = getStored(SUBJECTS_KEY, DEMO_SUBJECTS);
    return all.filter((s) => s.institution_id === institutionId || s.institution_id === DEMO_INSTITUTION_ID);
  },

  async addSubject(subject: Omit<Subject, 'id' | 'created_at' | 'updated_at'>): Promise<Subject> {
    const newSub: Subject = {
      ...subject,
      id: `sub-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('subjects').insert(newSub).select().single();
      if (error) throw new Error(error.message);
      return data as Subject;
    }

    const list = getStored(SUBJECTS_KEY, DEMO_SUBJECTS);
    list.push(newSub);
    saveStored(SUBJECTS_KEY, list);
    return newSub;
  },

  async deleteSubject(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('subjects').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return;
    }

    const list = getStored(SUBJECTS_KEY, DEMO_SUBJECTS);
    const filtered = list.filter((s) => s.id !== id);
    saveStored(SUBJECTS_KEY, filtered);
  },

  // --------------------------------------------------------------------------
  // CHAPTERS & SYLLABUS
  // --------------------------------------------------------------------------
  async getChapters(subjectId?: string, classId?: string): Promise<Chapter[]> {
    if (isSupabaseConfigured) {
      let query = supabase.from('chapters').select('*').order('chapter_number', { ascending: true });
      if (subjectId) query = query.eq('subject_id', subjectId);
      if (classId) query = query.eq('class_id', classId);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return (data as Chapter[]) || [];
    }

    let all = getStored(CHAPTERS_KEY, DEMO_CHAPTERS);
    if (subjectId) all = all.filter((c) => c.subject_id === subjectId);
    if (classId) all = all.filter((c) => c.class_id === classId);
    return all;
  },

  async addChapter(chapter: Omit<Chapter, 'id' | 'created_at' | 'updated_at'>): Promise<Chapter> {
    const newCh: Chapter = {
      ...chapter,
      id: `ch-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('chapters').insert(newCh).select().single();
      if (error) throw new Error(error.message);
      return data as Chapter;
    }

    const list = getStored(CHAPTERS_KEY, DEMO_CHAPTERS);
    list.push(newCh);
    saveStored(CHAPTERS_KEY, list);
    return newCh;
  },

  // --------------------------------------------------------------------------
  // CURRICULUM & BOARD CONFIGURATION
  // --------------------------------------------------------------------------
  getCurriculumBoard(): CurriculumBoard {
    return (localStorage.getItem(BOARD_KEY) as CurriculumBoard) || 'CBSE';
  },

  setCurriculumBoard(board: CurriculumBoard): void {
    localStorage.setItem(BOARD_KEY, board);
  },

  // --------------------------------------------------------------------------
  // TIMETABLE
  // --------------------------------------------------------------------------
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
    return getStored(TIMETABLE_KEY, DEMO_TODAYS_TIMETABLE);
  },
};
