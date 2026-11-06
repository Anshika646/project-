import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { StatCard } from '../common/StatCard';
import {
  CalendarCheck,
  Award,
  BookOpen,
  Calendar,
  User,
  FileSpreadsheet,
  CalendarDays,
  CheckCircle2,
  Bell,
  MessageSquare,
} from 'lucide-react';
import { DEMO_MARKS, DEMO_NOTICES } from '../../services/mockData';
import { exportToPDF } from '../../utils/exportUtils';

export const ParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeChild, setActiveChild] = useState('aarav');
  const [ptmBooked, setPtmBooked] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM - 10:15 AM');

  const children = [
    { id: 'aarav', name: 'Aarav Patel', class: 'Class 10-A', roll: '14', attendance: '92%', rank: '#3' },
  ];

  const currentChild = children.find((c) => c.id === activeChild) || children[0];

  const handleDownloadChildReport = () => {
    exportToPDF(
      `Edunexa Progress Report — ${currentChild.name} (${currentChild.class})`,
      [
        { header: 'Subject', dataKey: 'subject' },
        { header: 'Marks Obtained', dataKey: 'marks' },
        { header: 'Grade', dataKey: 'grade' },
        { header: 'Remarks', dataKey: 'remarks' },
      ],
      [
        { subject: 'Mathematics', marks: '94/100', grade: 'A1', remarks: 'Outstanding analytical clarity' },
        { subject: 'Science', marks: '88/100', grade: 'A2', remarks: 'Consistent experimental work' },
        { subject: 'English', marks: '91/100', grade: 'A1', remarks: 'Excellent essay articulation' },
      ],
      `${currentChild.name.replace(/\s+/g, '_')}_Progress_Report.pdf`
    );
  };

  const handleBookPTM = () => {
    setPtmBooked(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#232F25] dark:text-[#F0F5F1] tracking-tight">
            Welcome, {user?.profile.full_name || 'Parent'}!
          </h1>
          <p className="text-xs md:text-sm text-[#667768] dark:text-[#9FB1A2] mt-0.5">
            Parent Portal • Springfield International School
          </p>
        </div>

        {/* Child Selector */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl glass-card border border-white/70 dark:border-white/10">
          <User size={16} className="text-[#5B6E5E] ml-2" />
          <span className="text-xs font-semibold text-[#2D3C30] dark:text-[#E2ECE4]">
            Child:
          </span>
          <select
            value={activeChild}
            onChange={(e) => setActiveChild(e.target.value)}
            className="text-xs font-bold bg-white/70 dark:bg-black/20 border border-[#8DA390]/30 rounded-xl px-2.5 py-1 text-[#253227] dark:text-white focus:outline-none"
          >
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.class})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metrics for active child */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance"
          value={currentChild.attendance}
          change="35 / 38 Days"
          isPositive={true}
          icon={CalendarCheck}
          variant="sage"
        />
        <StatCard
          title="Class Standing"
          value={currentChild.rank}
          change="Top 5% of 10-A"
          isPositive={true}
          icon={Award}
          variant="olive"
        />
        <StatCard
          title="Overall Average"
          value="91.0%"
          change="Grade A1"
          isPositive={true}
          icon={FileSpreadsheet}
          variant="pink"
        />
        <StatCard
          title="Upcoming PTM"
          value="Saturday"
          change="26 Apr 2025"
          isPositive={true}
          icon={CalendarDays}
          variant="sage"
        />
      </div>

      {/* Academic Marks & Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Academic Marks Overview */}
        <div className="lg:col-span-7 rounded-2xl glass-card p-5 border border-white/70 dark:border-white/10">
          <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-[#5B6E5E] dark:text-[#A3B899]" />
              <h3 className="text-sm font-bold text-[#232F25] dark:text-[#F0F5F1]">
                {currentChild.name}'s Academic Marks
              </h3>
            </div>
            <button
              onClick={handleDownloadChildReport}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#5B6E5E] text-white hover:bg-[#4D5E50] transition-colors"
            >
              Export PDF
            </button>
          </div>

          <div className="space-y-3 mt-4">
            {[
              { subject: 'Mathematics', score: '94 / 100', grade: 'A1', faculty: 'Ms. Priya Verma', comment: 'Strong problem-solving methodology and speed.' },
              { subject: 'Science', score: '88 / 100', grade: 'A2', faculty: 'Dr. Suresh Rao', comment: 'Good in physics numericals; lab files well maintained.' },
              { subject: 'English', score: '91 / 100', grade: 'A1', faculty: 'Mrs. Anita Das', comment: 'Insightful critical analysis in literature essays.' },
            ].map((sub) => (
              <div
                key={sub.subject}
                className="p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#232F25] dark:text-[#F0F5F1]">
                      {sub.subject}
                    </span>
                    <span className="text-[10px] text-[#6E7F71]">({sub.faculty})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#232F25] dark:text-[#F0F5F1] tabular-nums">
                      {sub.score}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#8DA390]/20 text-[#303E33] dark:text-[#D1E0D3]">
                      {sub.grade}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-[#556658] dark:text-[#A0B0A3] mt-1.5 italic">
                  “{sub.comment}”
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Parent-Teacher Meeting (PTM) Appointment Booking */}
        <div className="lg:col-span-5 rounded-2xl glass-card p-5 border border-white/70 dark:border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2">
                <CalendarDays size={18} className="text-[#5B6E5E] dark:text-[#A3B899]" />
                <h3 className="text-sm font-bold text-[#232F25] dark:text-[#F0F5F1]">
                  PTM Appointment Booking
                </h3>
              </div>
              <span className="text-xs text-[#5B6E5E] font-medium">Saturday, 26 Apr</span>
            </div>

            <p className="text-xs text-[#637466] dark:text-[#95A597] mt-3">
              Book a 15-minute consultation slot with Class Teacher (Ms. Priya Verma).
            </p>

            <div className="grid grid-cols-2 gap-2 mt-4">
              {['09:00 AM - 09:15 AM', '09:30 AM - 09:45 AM', '10:00 AM - 10:15 AM', '11:00 AM - 11:15 AM'].map((slot) => (
                <button
                  key={slot}
                  disabled={ptmBooked}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                    selectedSlot === slot
                      ? 'bg-[#5B6E5E] text-white border-[#5B6E5E] font-bold shadow-sm'
                      : 'bg-white/60 dark:bg-white/5 border-white/60 dark:border-white/10 text-[#303E33] dark:text-[#C5D3C6] hover:bg-white/90'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            {ptmBooked ? (
              <div className="p-3 rounded-xl bg-[#8DA390]/20 text-[#213123] dark:text-[#E2ECE4] text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#5B6E5E]" />
                <span>Slot confirmed for {selectedSlot}! Confirmation sent to your registered email.</span>
              </div>
            ) : (
              <button
                onClick={handleBookPTM}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-[#5B6E5E] hover:bg-[#4D5E50] transition-colors shadow-sm"
              >
                Confirm PTM Slot ({selectedSlot})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* School Notices for Parents */}
      <div className="rounded-2xl glass-card p-5 border border-white/70 dark:border-white/10">
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-[#5B6E5E] dark:text-[#A3B899]" />
            <h3 className="text-sm font-bold text-[#232F25] dark:text-[#F0F5F1]">
              Important School Notices
            </h3>
          </div>
        </div>

        <div className="space-y-3 mt-4">
          {DEMO_NOTICES.map((notice) => (
            <div
              key={notice.id}
              className="p-3.5 rounded-xl bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/5"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#232F25] dark:text-[#F0F5F1]">
                  {notice.title}
                </h4>
                <span className="text-[10px] text-[#7A8A7C]">15 Apr 2025</span>
              </div>
              <p className="text-xs text-[#556658] dark:text-[#A0B0A3] mt-1">
                {notice.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
