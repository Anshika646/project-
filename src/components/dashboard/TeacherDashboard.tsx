import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { StatCard } from '../common/StatCard';
import {
  Users,
  CheckCircle2,
  BookOpen,
  Calendar,
  FileSpreadsheet,
  Award,
  Upload,
  Send,
} from 'lucide-react';
import { DEMO_TODAYS_TIMETABLE, DEMO_NOTES } from '../../services/mockData';
import { attendanceService } from '../../services/attendanceService';
import { exportToPDF } from '../../utils/exportUtils';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Record<string, 'present' | 'absent' | 'late'>>({
    'stud-1': 'present',
    'stud-2': 'present',
    'stud-3': 'late',
  });
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const studentsInClass = [
    { id: 'stud-1', name: 'Aarav Patel', roll: '14', status: selectedStatus['stud-1'] },
    { id: 'stud-2', name: 'Diya Sharma', roll: '15', status: selectedStatus['stud-2'] },
    { id: 'stud-3', name: 'Ishaan Verma', roll: '16', status: selectedStatus['stud-3'] },
  ];

  const handleStatusChange = (id: string, status: 'present' | 'absent' | 'late') => {
    setSelectedStatus((prev) => ({ ...prev, [id]: status }));
  };

  const handleSaveAttendance = async () => {
    setAttendanceMarked(true);
    setNoticeMessage('Attendance successfully saved to institutional records.');
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  const handleDownloadClassReport = () => {
    exportToPDF(
      'Class 10-A Mathematics Progress Summary',
      [
        { header: 'Roll No', dataKey: 'roll' },
        { header: 'Student Name', dataKey: 'name' },
        { header: 'Unit Test 1', dataKey: 'ut1' },
        { header: 'Unit Test 2', dataKey: 'ut2' },
        { header: 'Grade', dataKey: 'grade' },
      ],
      [
        { roll: '14', name: 'Aarav Patel', ut1: '48/50', ut2: '46/50', grade: 'A1' },
        { roll: '15', name: 'Diya Sharma', ut1: '44/50', ut2: '47/50', grade: 'A1' },
        { roll: '16', name: 'Ishaan Verma', ut1: '39/50', ut2: '41/50', grade: 'B1' },
      ],
      'Class-10A-Math-Progress.pdf'
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#232F25] dark:text-[#F0F5F1] tracking-tight">
            Welcome back, {user?.profile.full_name || 'Faculty'}!
          </h1>
          <p className="text-xs md:text-sm text-[#667768] dark:text-[#9FB1A2] mt-0.5">
            Senior Mathematics Faculty • Class Teacher: 10-A
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadClassReport}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold glass-card hover:bg-white/90 text-[#324234] dark:text-[#D1E0D3] border border-white/70 dark:border-white/10 shadow-sm flex items-center gap-2"
          >
            <FileSpreadsheet size={15} className="text-[#5B6E5E]" />
            <span>Download Progress Report</span>
          </button>
        </div>
      </div>

      {noticeMessage && (
        <div className="px-4 py-2.5 rounded-xl bg-[#8DA390]/20 border border-[#8DA390]/40 text-[#213123] dark:text-[#E2ECE4] text-xs font-semibold">
          {noticeMessage}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Students"
          value="142"
          change="3 classes"
          isPositive={true}
          icon={Users}
          variant="sage"
        />
        <StatCard
          title="Periods Today"
          value="4"
          change="Room 301, Lab 1"
          isPositive={true}
          icon={Calendar}
          variant="olive"
        />
        <StatCard
          title="Class 10-A Attendance"
          value="94%"
          change="31 / 33 Present"
          isPositive={true}
          icon={CheckCircle2}
          variant="pink"
        />
        <StatCard
          title="Study Notes Published"
          value="18"
          change="Latest: Trig Proofs"
          isPositive={true}
          icon={BookOpen}
          variant="sage"
        />
      </div>

      {/* Main Grid: Today's Timetable + Rapid Attendance Marking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Today's Timetable */}
        <div className="lg:col-span-7 rounded-2xl glass-card p-5 border border-white/70 dark:border-white/10">
          <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-[#5B6E5E] dark:text-[#A3B899]" />
              <h3 className="text-sm font-bold text-[#232F25] dark:text-[#F0F5F1]">
                Today's Teaching Schedule
              </h3>
            </div>
            <span className="text-xs font-mono text-[#5B6E5E] dark:text-[#A3B899]">
              Monday
            </span>
          </div>

          <div className="space-y-3 mt-4">
            {DEMO_TODAYS_TIMETABLE.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-10 rounded-lg bg-[#8DA390]/20 text-[#303E33] dark:text-[#D1E0D3] flex flex-col items-center justify-center font-mono text-xs font-bold shrink-0">
                    <span>P{slot.period_number}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#232F25] dark:text-[#F0F5F1]">
                      {slot.period_number === 1 ? 'Class 10-A • Mathematics' : slot.period_number === 2 ? 'Class 9-A • Mathematics' : slot.period_number === 3 ? 'Class 10-B • Remedial Math' : 'Class 9-B • Practical Math'}
                    </p>
                    <p className="text-[11px] text-[#637466] dark:text-[#95A597]">
                      {slot.start_time} - {slot.end_time} • {slot.room_number}
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#DEE7DF] dark:bg-[#28352A] text-[#3E5241] dark:text-[#C2D8C2]">
                  Upcoming
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rapid Attendance Marking Widget */}
        <div className="lg:col-span-5 rounded-2xl glass-card p-5 border border-white/70 dark:border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
              <h3 className="text-sm font-bold text-[#232F25] dark:text-[#F0F5F1]">
                Quick Attendance • Class 10-A
              </h3>
              <span className="text-[11px] text-[#667768] dark:text-[#9FB1A2]">
                Today
              </span>
            </div>

            <div className="space-y-2 mt-4">
              {studentsInClass.map((stud) => (
                <div
                  key={stud.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/50 dark:bg-white/5 border border-white/50 dark:border-white/5"
                >
                  <div>
                    <span className="text-xs font-bold text-[#232F25] dark:text-[#F0F5F1]">
                      #{stud.roll} {stud.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {(['present', 'absent', 'late'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(stud.id, status)}
                        className={`px-2 py-1 rounded-md text-[10px] font-semibold capitalize transition-all ${
                          stud.status === status
                            ? status === 'present'
                              ? 'bg-[#5B6E5E] text-white shadow-sm'
                              : status === 'absent'
                              ? 'bg-[#E57373] text-white shadow-sm'
                              : 'bg-[#E5A855] text-white shadow-sm'
                            : 'bg-white/60 dark:bg-white/10 text-[#556658] dark:text-[#B4C4B6]'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveAttendance}
            disabled={attendanceMarked}
            className="w-full mt-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#5B6E5E] hover:bg-[#4D5E50] disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={15} />
            <span>{attendanceMarked ? 'Attendance Saved' : 'Confirm & Save Attendance'}</span>
          </button>
        </div>
      </div>

      {/* Notes & Study Material Library Preview */}
      <div className="rounded-2xl glass-card p-5 border border-white/70 dark:border-white/10">
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-[#5B6E5E] dark:text-[#A3B899]" />
            <h3 className="text-sm font-bold text-[#232F25] dark:text-[#F0F5F1]">
              Recent Study Material & Notes
            </h3>
          </div>
          <span className="text-xs text-[#5B6E5E] font-medium">Chapter-wise Library</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {DEMO_NOTES.map((note) => (
            <div
              key={note.id}
              className="p-4 rounded-xl bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/5 flex flex-col justify-between"
            >
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#8DA390]/20 text-[#303E33] dark:text-[#D1E0D3]">
                  Class 10 • {note.file_type?.toUpperCase()}
                </span>
                <h4 className="text-xs font-bold text-[#232F25] dark:text-[#F0F5F1] mt-2">
                  {note.title}
                </h4>
                <p className="text-[11px] text-[#637466] dark:text-[#95A597] line-clamp-2 mt-1">
                  {note.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-black/5 dark:border-white/5 text-[10px] text-[#78897B]">
                <span>Published to Student Portal</span>
                <span className="text-[#5B6E5E] font-semibold">Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
