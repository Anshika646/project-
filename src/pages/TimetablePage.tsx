import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, Download, Plus, CheckCircle2 } from 'lucide-react';
import { DEMO_TODAYS_TIMETABLE } from '../services/mockData';
import { exportToPDF } from '../utils/exportUtils';
import { hasTimetableConflict } from '../utils/calculations';

export const TimetablePage: React.FC = () => {
  const { role } = useAuth();
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const handleExportPDF = () => {
    exportToPDF(
      'Weekly Class Timetable — Class 10-A',
      [
        { header: 'Period', dataKey: 'p' },
        { header: 'Timing', dataKey: 'timing' },
        { header: 'Subject', dataKey: 'subject' },
        { header: 'Faculty', dataKey: 'faculty' },
        { header: 'Room', dataKey: 'room' },
      ],
      DEMO_TODAYS_TIMETABLE.map((t) => ({
        p: `Period ${t.period_number}`,
        timing: `${t.start_time} - ${t.end_time}`,
        subject: t.period_number === 1 ? 'Mathematics' : t.period_number === 2 ? 'Science' : t.period_number === 3 ? 'English' : 'Computer Science',
        faculty: 'Faculty Assigned',
        room: t.room_number || 'Room 301',
      })),
      'Class_10A_Timetable.pdf'
    );
  };

  const handleTestConflict = () => {
    // Demonstrating the conflict detection engine
    const res = hasTimetableConflict(
      [
        {
          dayOfWeek: 'Monday',
          startTime: '08:30 AM',
          endTime: '09:15 AM',
          teacherId: 'teacher-1',
          roomNumber: 'Room 301',
        },
      ],
      {
        dayOfWeek: 'Monday',
        startTime: '08:45 AM',
        endTime: '09:30 AM',
        teacherId: 'teacher-1',
        roomNumber: 'Room 402',
      }
    );

    if (res.conflict) {
      setConflictWarning(`Conflict detected by validation engine: ${res.reason}`);
      setTimeout(() => setConflictWarning(null), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#232F25] dark:text-[#F0F5F1] tracking-tight">
            Institutional Timetable
          </h1>
          <p className="text-xs md:text-sm text-[#667768] dark:text-[#9FB1A2] mt-0.5">
            Weekly periods schedule, faculty assignments, and conflict-free room routing
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['school_admin', 'super_admin'].includes(role || '') && (
            <button
              onClick={handleTestConflict}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#8DA390]/20 text-[#253628] dark:text-[#E2ECE4] border border-[#8DA390]/30 hover:bg-[#8DA390]/30 transition-colors"
            >
              Verify Conflict Rules
            </button>
          )}
          <button
            onClick={handleExportPDF}
            className="px-3 py-2 rounded-xl text-xs font-semibold glass-card hover:bg-white/90 text-[#324234] dark:text-[#D1E0D3] border border-white/70 dark:border-white/10 shadow-sm flex items-center gap-1.5"
          >
            <Download size={14} className="text-[#DA5FCE]" />
            <span>Download Timetable (PDF)</span>
          </button>
        </div>
      </div>

      {conflictWarning && (
        <div className="px-4 py-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-semibold">
          {conflictWarning}
        </div>
      )}

      {/* Days Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              selectedDay === day
                ? 'bg-[#DA5FCE] text-white shadow-sm'
                : 'glass-card text-[#4F6052] dark:text-[#C5D3C6] hover:bg-white/90'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Timetable Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {DEMO_TODAYS_TIMETABLE.map((slot) => (
          <div
            key={slot.id}
            className="rounded-2xl glass-card p-5 border border-white/70 dark:border-white/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#8DA390]/20 text-[#263729] dark:text-[#E2ECE4]">
                  Period {slot.period_number}
                </span>
                <span className="text-[11px] font-mono text-[#667768] dark:text-[#9FB1A2]">
                  {slot.start_time}
                </span>
              </div>

              <h3 className="text-base font-bold text-[#232F25] dark:text-[#F0F5F1] mt-3">
                {slot.period_number === 1 ? 'Mathematics' : slot.period_number === 2 ? 'Science' : slot.period_number === 3 ? 'English' : 'Computer Science'}
              </h3>
              <p className="text-xs text-[#DA5FCE] dark:text-[#A3B899] font-medium mt-0.5">
                {slot.period_number === 1 ? 'Ms. Priya Verma' : slot.period_number === 2 ? 'Dr. Suresh Rao' : slot.period_number === 3 ? 'Mrs. Anita Das' : 'Mr. Alok Nath'}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-[#637466] dark:text-[#95A597]">
              <span>Room: {slot.room_number || 'Room 301'}</span>
              <span className="font-semibold text-[#DA5FCE]">Active</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
