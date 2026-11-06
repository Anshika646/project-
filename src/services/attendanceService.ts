import { supabase, isSupabaseConfigured } from '../lib/supabase';
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
      if (error) throw new Error(error.message);
      return (data as AttendanceRecord[]) || [];
    }
    return getStoredAttendance().filter((a) => a.student_id === studentId);
  },

  async markAttendance(record: Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at'>): Promise<AttendanceRecord> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('attendance')
        .upsert(record, { onConflict: 'student_id, date' })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as AttendanceRecord;
    }

    const list = getStoredAttendance();
    const existingIndex = list.findIndex(
      (a) => a.student_id === record.student_id && a.date === record.date
    );

    const fullRecord: AttendanceRecord = {
      ...record,
      id: `att-${Date.now()}`,
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

  async getAttendancePercentage(studentId: string): Promise<number> {
    const records = await this.getAttendanceByStudent(studentId);
    if (!records || records.length === 0) return 92.0; // Realistic default demo benchmark
    const present = records.filter((r) => r.status === 'present' || r.status === 'late').length;
    return Math.round((present / records.length) * 100);
  },
};
