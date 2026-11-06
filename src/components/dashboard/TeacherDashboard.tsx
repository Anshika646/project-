import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { StatCard } from '../common/StatCard';
import {
  Users,
  CheckCircle2,
  BookOpen,
  Calendar,
  FileSpreadsheet,
} from 'lucide-react';
import { DEMO_TODAYS_TIMETABLE, DEMO_NOTES } from '../../services/mockData';
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
    <div className="space-y-6 max-w-7xl mx-auto bg-white">
      {/* Top Banner Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-[#171417] tracking-tight">
            Welcome back, {user?.profile.full_name || 'Faculty Member'}!
          </h1>
          <p className="text-xs md:text-sm font-semibold text-[#625C60] mt-0.5">
            Senior Mathematics Faculty • Class Teacher: 10-A • Springfield Academy
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadClassReport}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#F5F3FF] hover:bg-[#F3E8FF] text-[#8B5CF6] border border-[#C4B5FD] shadow-xs flex items-center gap-2 transition-all"
          >
            <FileSpreadsheet size={15} className="text-[#8B5CF6]" />
            <span>Download Progress Report</span>
          </button>
        </div>
      </div>

      {noticeMessage && (
        <div className="px-4 py-2.5 rounded-xl bg-[#F5F3FF] border border-[#C4B5FD] text-[#171417] text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={16} className="text-[#8B5CF6]" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* Metric Cards in Light Pink and Cream */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Students"
          value="142"
          change="3 classes"
          isPositive={true}
          icon={Users}
          variant="pink"
        />
        <StatCard
          title="Periods Today"
          value="4"
          change="Room 301, Lab 1"
          isPositive={true}
          icon={Calendar}
          variant="cream"
        />
        <StatCard
          title="Class 10-A Attendance"
          value="94%"
          change="31 / 33 Present"
          isPositive={true}
          icon={CheckCircle2}
          variant="rose"
        />
        <StatCard
          title="Study Notes Published"
          value="18"
          change="Latest: Trig Proofs"
          isPositive={true}
          icon={BookOpen}
          variant="blush"
        />
      </div>

      {/* Main Grid: Today's Timetable + Rapid Attendance Marking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Today's Timetable in Cream Card */}
        <div className="lg:col-span-7 rounded-2xl bg-[#FAF5FF] p-5 border border-[#E9D5FF] shadow-[0_4px_20px_-4px_rgba(139, 92, 246,0.05)]">
          <div className="flex items-center justify-between pb-3 border-b border-[#E9D5FF]">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-[#8B5CF6]" />
              <h3 className="font-heading text-sm font-extrabold text-[#171417]">
                Today's Teaching Schedule
              </h3>
            </div>
            <span className="text-xs font-bold text-[#8B5CF6] bg-[#F3E8FF] px-2.5 py-0.5 rounded-full">
              Monday
            </span>
          </div>

          <div className="space-y-3 mt-4">
            {DEMO_TODAYS_TIMETABLE.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E9D5FF] hover:border-[#C4B5FD] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-10 rounded-xl bg-[#F3E8FF] text-[#8B5CF6] border border-[#C4B5FD]/40 flex flex-col items-center justify-center font-stat text-xs font-extrabold shrink-0">
                    <span>P{slot.period_number}</span>
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-[#171417]">
                      {slot.period_number === 1 ? 'Class 10-A • Mathematics' : slot.period_number === 2 ? 'Class 9-A • Mathematics' : slot.period_number === 3 ? 'Class 10-B • Remedial Math' : 'Class 9-B • Practical Math'}
                    </p>
                    <p className="text-[11px] font-semibold text-[#625C60]">
                      {slot.start_time} - {slot.end_time} • {slot.room_number}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#F5F3FF] text-[#8B5CF6] border border-[#C4B5FD]/50">
                  Upcoming
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rapid Attendance Marking Widget in Light Pink Card */}
        <div className="lg:col-span-5 rounded-2xl bg-[#F5F3FF] p-5 border border-[#E9D5FF] shadow-[0_4px_20px_-4px_rgba(139, 92, 246,0.05)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E9D5FF]">
              <h3 className="font-heading text-sm font-extrabold text-[#171417]">
                Quick Attendance • Class 10-A
              </h3>
              <span className="text-[11px] font-bold text-[#8B5CF6]">
                Today
              </span>
            </div>

            <div className="space-y-2.5 mt-4">
              {studentsInClass.map((stud) => (
                <div
                  key={stud.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E9D5FF]"
                >
                  <div>
                    <span className="text-xs font-extrabold text-[#171417]">
                      #{stud.roll} {stud.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {(['present', 'absent', 'late'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(stud.id, status)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold capitalize transition-all ${
                          stud.status === status
                            ? status === 'present'
                              ? 'bg-[#8B5CF6] text-white shadow-xs'
                              : status === 'absent'
                              ? 'bg-[#171417] text-white shadow-xs'
                              : 'bg-[#A78BFA] text-white shadow-xs'
                            : 'bg-[#FAF5FF] text-[#625C60] hover:bg-[#F3E8FF]'
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
            className="w-full mt-4 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={16} />
            <span>{attendanceMarked ? 'Attendance Saved' : 'Confirm & Save Attendance'}</span>
          </button>
        </div>
      </div>

      {/* Notes & Study Material Library Preview */}
      <div className="rounded-2xl bg-[#FDFBFF] p-5 border border-[#E9D5FF] shadow-[0_4px_20px_-4px_rgba(139, 92, 246,0.05)]">
        <div className="flex items-center justify-between pb-3 border-b border-[#E9D5FF]">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-[#8B5CF6]" />
            <h3 className="font-heading text-sm font-extrabold text-[#171417]">
              Recent Study Material & Notes
            </h3>
          </div>
          <span className="text-xs text-[#8B5CF6] font-bold">Chapter-wise Library</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {DEMO_NOTES.map((note) => (
            <div
              key={note.id}
              className="p-4 rounded-xl bg-white border border-[#E9D5FF] flex flex-col justify-between hover:border-[#C4B5FD] transition-colors"
            >
              <div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#F3E8FF] text-[#8B5CF6] border border-[#C4B5FD]/40">
                  Class 10 • {note.file_type?.toUpperCase()}
                </span>
                <h4 className="text-xs font-extrabold text-[#171417] mt-2">
                  {note.title}
                </h4>
                <p className="text-[11px] font-medium text-[#625C60] line-clamp-2 mt-1">
                  {note.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#E9D5FF] text-[10px] font-semibold text-[#858087]">
                <span>Published to Student Portal</span>
                <span className="text-[#8B5CF6] font-extrabold">Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
