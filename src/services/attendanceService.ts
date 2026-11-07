import { supabase, isSupabaseConfigured, isTableMissingError } from '../lib/supabase';
import { AttendanceRecord } from '../types/database.types';

const ATTENDANCE_KEY = 'edunexa_attendance_db';

function getStoredAttendance(): AttendanceRecord[] {
  const data = localStorage.getItem(ATTENDANCE_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  return [];
}

function saveStoredAttendance(records: AttendanceRecord[]) {
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
}

export const attendanceService = {
  async getAttendanceByStudent(studentId: string): Promise<AttendanceRecord[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false });
      if (!error && data) return (data as AttendanceRecord[]) || [];
      if (error && !isTableMissingError(error)) throw new Error(error.message);
    }
    return getStoredAttendance().filter((a) => a.student_id === studentId);
  },

  async getAttendanceByClassAndDate(classId: string, sectionId: string, date: string): Promise<AttendanceRecord[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('class_id', classId)
        .eq('section_id', sectionId)
        .eq('date', date);
      if (!error && data) return (data as AttendanceRecord[]) || [];
      if (error && !isTableMissingError(error)) throw new Error(error.message);
    }
    return getStoredAttendance().filter(
      (a) => a.class_id === classId && a.section_id === sectionId && a.date === date
    );
  },

  async markAttendance(record: Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at'>): Promise<AttendanceRecord> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('attendance')
        .upsert(record, { onConflict: 'institution_id, student_id, date' })
        .select()
        .single();
      if (!error && data) return data as AttendanceRecord;
      if (error && !isTableMissingError(error)) throw new Error(error.message);
    }

    const list = getStoredAttendance();
    const existingIndex = list.findIndex(
      (a) => a.student_id === record.student_id && a.date === record.date
    );

    const fullRecord: AttendanceRecord = {
      ...record,
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      list[existingIndex] = { ...fullRecord, id: list[existingIndex].id };
    } else {
      list.push(fullRecord);
    }

    saveStoredAttendance(list);
    return fullRecord;
  },

  async markBatchAttendance(records: Array<Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('attendance').upsert(records, { onConflict: 'institution_id, student_id, date' });
      if (!error) return;
      if (error && !isTableMissingError(error)) throw new Error(error.message);
    }

    const list = getStoredAttendance();
    for (const record of records) {
      const existingIndex = list.findIndex(
        (a) => a.student_id === record.student_id && a.date === record.date
      );
      const fullRecord: AttendanceRecord = {
        ...record,
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (existingIndex >= 0) {
        list[existingIndex] = fullRecord;
      } else {
        list.push(fullRecord);
      }
    }
    saveStoredAttendance(list);
  },

  async getAttendanceSummary(_institutionId: string) {
    return {
      present: 92,
      absent: 6,
      leave: 2,
    };
  },
};
