import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Download } from 'lucide-react';
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
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
            <Calendar className="text-[#6D28D9]" size={28} />
            <span>Institutional Timetable</span>
          </h1>
          <p className="text-xs md:text-sm font-semibold text-[#64748B] mt-0.5">
            Weekly periods schedule, faculty assignments, and conflict-free room routing
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['school_admin', 'super_admin'].includes(role || '') && (
            <button
              onClick={handleTestConflict}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FAF8F5] text-[#0F172A] border border-[#E8E4DF] hover:bg-[#FFFFFF] transition-colors"
            >
              Verify Conflict Rules
            </button>
          )}
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#6D28D9] text-white hover:bg-[#5B21B6] shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Download size={14} />
            <span>Download Timetable (PDF)</span>
          </button>
        </div>
      </div>

      {conflictWarning && (
        <div className="px-4 py-3 rounded-xl bg-[#FFFFFF] border border-[#DDD6FE] text-[#6D28D9] text-xs font-bold">
          {conflictWarning}
        </div>
      )}

      {/* Days Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#E8E4DF]">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedDay === day
                ? 'bg-[#6D28D9] text-white shadow-xs'
                : 'bg-[#FAF8F5] text-[#0F172A] hover:bg-[#FFFFFF] border border-[#E8E4DF]'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Timetable Grid with Light Pink and Cream Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {DEMO_TODAYS_TIMETABLE.map((slot, idx) => {
          const cardBg = idx % 2 === 0 ? 'bg-[#FFFFFF]' : 'bg-[#FAF8F5]';
          return (
            <div
              key={slot.id}
              className={`rounded-2xl ${cardBg} p-5 border border-[#E8E4DF] shadow-[0_4px_20px_-4px_rgba(15, 23, 42, 0.03)] flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-stat text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-white text-[#6D28D9] border border-[#E8E4DF]">
                    Period {slot.period_number}
                  </span>
                  <span className="text-[11px] font-stat font-bold text-[#64748B]">
                    {slot.start_time}
                  </span>
                </div>

                <h3 className="font-heading text-base font-extrabold text-[#0F172A] mt-3">
                  {slot.period_number === 1 ? 'Mathematics' : slot.period_number === 2 ? 'Science' : slot.period_number === 3 ? 'English' : 'Computer Science'}
                </h3>
                <p className="text-xs text-[#6D28D9] font-bold mt-1">
                  {slot.period_number === 1 ? 'Ms. Priya Verma' : slot.period_number === 2 ? 'Dr. Suresh Rao' : slot.period_number === 3 ? 'Mrs. Anita Das' : 'Mr. Alok Nath'}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#E8E4DF] flex items-center justify-between text-xs font-bold text-[#0F172A]">
                <span>Room: {slot.room_number || 'Room 301'}</span>
                <span className="text-[#6D28D9] font-extrabold">Active</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
