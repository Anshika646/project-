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
  Clock,
  Download,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { exportToPDF } from '../../utils/exportUtils';
import { DEMO_MARKS, DEMO_NOTICES, DEMO_UPCOMING_EXAMS } from '../../services/mockData';

export const ParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeChildId, setActiveChildId] = useState<'aarav' | 'ananya'>('aarav');
  const [ptmBooked, setPtmBooked] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM - 10:15 AM');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Multi-children linked to Rajesh Patel (user-parent-1)
  const childrenData = {
    aarav: {
      id: 'aarav',
      name: 'Aarav Patel',
      class: 'Class 10-A',
      roll: '14',
      admissionNo: 'SIS/2022/1042',
      attendance: '94.2%',
      presentDays: '188 / 200 Days',
      rank: '#2 in Class 10-A',
      overallGrade: 'A1 (91.2%)',
      teacherRemarks: 'Exemplary reasoning and mathematical problem-solving skills.',
      homeworkPending: 1,
      absenceAlerts: 0,
      marks: [
        { subject: 'Mathematics (Standard)', score: '94 / 100', grade: 'A1', remarks: 'Exceptional proof derivations' },
        { subject: 'Science (Theory + Lab)', score: '88 / 100', grade: 'A2', remarks: 'Good practical notebook' },
        { subject: 'English Language & Lit', score: '91 / 100', grade: 'A1', remarks: 'Great vocabulary' },
        { subject: 'Social Sciences', score: '88 / 100', grade: 'A2', remarks: 'Well-drawn map representations' },
        { subject: 'Information Technology', score: '95 / 100', grade: 'A1', remarks: 'Clean code logic' },
      ],
      upcomingExams: [
        { subject: 'Mathematics (Standard)', date: '24 Apr', time: '09:00 AM - 12:00 PM', room: 'Hall A' },
        { subject: 'Science (Physics, Chem, Bio)', date: '26 Apr', time: '09:00 AM - 12:00 PM', room: 'Lab 2 & Hall A' },
      ],
      homework: [
        { title: 'Chapter 6 Exercise 6.3: Trigonometric Identities', status: 'Submitted', due: '22 Apr' },
        { title: 'Physics Practical Journal: Ray Diagrams', status: 'Pending', due: '25 Apr' },
      ],
    },
    ananya: {
      id: 'ananya',
      name: 'Ananya Patel',
      class: 'Class 6-B',
      roll: '08',
      admissionNo: 'SIS/2024/2108',
      attendance: '96.0%',
      presentDays: '192 / 200 Days',
      rank: '#4 in Class 6-B',
      overallGrade: 'A1 (92.0%)',
      teacherRemarks: 'Very attentive, artistic, and enthusiastic in science lab activities.',
      homeworkPending: 0,
      absenceAlerts: 0,
      marks: [
        { subject: 'General Science', score: '92 / 100', grade: 'A1', remarks: 'Curious questions in biology' },
        { subject: 'Mathematics', score: '89 / 100', grade: 'A2', remarks: 'Good arithmetic speed' },
        { subject: 'English', score: '94 / 100', grade: 'A1', remarks: 'Expressive storytelling' },
        { subject: 'Social Studies', score: '90 / 100', grade: 'A1', remarks: 'Active in group discussions' },
        { subject: 'Sanskrit', score: '95 / 100', grade: 'A1', remarks: 'Excellent shloka recitation' },
      ],
      upcomingExams: [
        { subject: 'General Science', date: '29 Apr', time: '10:00 AM - 12:00 PM', room: 'Room 204' },
        { subject: 'Mathematics', date: '02 May', time: '10:00 AM - 12:00 PM', room: 'Room 204' },
      ],
      homework: [
        { title: 'Leaf Venation Activity Scrapbook', status: 'Submitted', due: '23 Apr' },
        { title: 'English Creative Essay: My Favorite Season', status: 'Submitted', due: '24 Apr' },
      ],
    },
  };

  const currentChild = childrenData[activeChildId];

  const handleDownloadChildReport = () => {
    exportToPDF(
      `Springfield International School — Academic Progress Report for ${currentChild.name}`,
      [
        { header: 'Subject', dataKey: 'subject' },
        { header: 'Score Obtained', dataKey: 'score' },
        { header: 'Grade', dataKey: 'grade' },
        { header: 'Teacher Evaluation & Remarks', dataKey: 'remarks' },
      ],
      currentChild.marks,
      `${currentChild.name.replace(/\s+/g, '_')}_Official_Report.pdf`
    );
    setToastMessage(`Downloaded official report card for ${currentChild.name}!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBookPTM = () => {
    setPtmBooked(true);
    setToastMessage(`PTM Discussion Slot confirmed with Class Teacher for ${currentChild.name}!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Greeting & Multi-Child Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#232F25] dark:text-[#F0F5F1] tracking-tight">
            Welcome, {user?.profile?.full_name || 'Mr. Rajesh Patel'}!
          </h1>
          <p className="text-xs md:text-sm text-[#667768] dark:text-[#9FB1A2] mt-0.5">
            Parent Portal • Springfield International School (Multi-Child Dossier)
          </p>
        </div>

        {/* Multi-Child Selector */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl glass-card border border-white/70 dark:border-white/10 self-start md:self-auto">
          <User size={16} className="text-[#DA5FCE] ml-2" />
          <span className="text-xs font-semibold text-[#2D3C30] dark:text-[#E2ECE4]">
            Select Child:
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveChildId('aarav')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                activeChildId === 'aarav'
                  ? 'bg-[#DA5FCE] text-white shadow-sm'
                  : 'text-[#4F6052] hover:bg-black/5'
              }`}
            >
              Aarav (Class 10-A)
            </button>
            <button
              onClick={() => setActiveChildId('ananya')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                activeChildId === 'ananya'
                  ? 'bg-[#DA5FCE] text-white shadow-sm'
                  : 'text-[#4F6052] hover:bg-black/5'
              }`}
            >
              Ananya (Class 6-B)
            </button>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-[#8DA390]/20 border border-[#8DA390]/40 text-[#213123] dark:text-[#E2ECE4] text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 size={16} className="text-[#DA5FCE]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Child Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance Rate"
          value={currentChild.attendance}
          change={currentChild.presentDays}
          isPositive={true}
          icon={CalendarCheck}
          variant="sage"
        />
        <StatCard
          title="Academic Standing"
          value={currentChild.rank}
          change="Distinction Tier"
          isPositive={true}
          icon={Award}
          variant="pink"
        />
        <StatCard
          title="Cumulative Grade"
          value={currentChild.overallGrade}
          change="All Subjects Cleared"
          isPositive={true}
          icon={BookOpen}
          variant="olive"
        />
        <StatCard
          title="Homework Tasks"
          value={currentChild.homeworkPending === 0 ? 'All Done' : `${currentChild.homeworkPending} Pending`}
          change="Updated this week"
          isPositive={currentChild.homeworkPending === 0}
          icon={Calendar}
          variant="sage"
        />
      </div>

      {/* Main Split: Academic Marks + Teacher Remarks & PTM Booking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Academic Subject Scores */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl glass-panel p-6 border border-white/70 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#DA5FCE]">
                  Academic Evaluation
                </span>
                <h3 className="text-lg font-extrabold text-[#232F25] dark:text-[#F0F5F1]">
                  {currentChild.name} — Term 2 Marks Breakdown
                </h3>
              </div>

              <button
                onClick={handleDownloadChildReport}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#DA5FCE] text-white hover:bg-[#C64EBA] transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Download size={13} />
                <span>Download Report Card</span>
              </button>
            </div>

            <div className="space-y-3">
              {currentChild.marks.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl glass-card border border-white/70 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-extrabold text-xs text-[#232F25] dark:text-[#F0F5F1]">
                      {m.subject}
                    </h4>
                    <p className="text-[11px] text-[#667768] dark:text-[#9FB1A2] mt-0.5">
                      {m.remarks}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-xs text-[#232F25] dark:text-white block">
                      {m.score}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-[#8DA390]/25 text-[#253928]">
                      {m.grade}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Teacher Remarks Box */}
            <div className="p-4 rounded-2xl bg-[#8DA390]/15 border border-[#8DA390]/30 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#DA5FCE] block">
                Class Teacher Official Feedback:
              </span>
              <p className="text-xs text-[#232F25] dark:text-[#E2ECE4] leading-relaxed">
                "{currentChild.teacherRemarks}"
              </p>
            </div>
          </div>

          {/* Homework & Upcoming Deadlines */}
          <div className="rounded-3xl glass-panel p-6 border border-white/70 shadow-sm space-y-3">
            <h4 className="font-extrabold text-sm text-[#232F25] dark:text-[#F0F5F1]">
              Recent Homework Tasks
            </h4>
            <div className="space-y-2">
              {currentChild.homework.map((hw, idx) => (
                <div key={idx} className="p-3 rounded-xl glass-card border flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#232F25]">{hw.title}</span>
                    <span className="text-[11px] text-[#718273] block">Due Date: {hw.due}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      hw.status === 'Submitted'
                        ? 'bg-[#8DA390]/25 text-[#253A27]'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {hw.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: PTM Booking + Upcoming Exams */}
        <div className="lg:col-span-5 space-y-6">
          {/* PTM Booking Card */}
          <div className="rounded-3xl glass-panel p-6 border border-white/70 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="text-[#DA5FCE]" size={20} />
              <h3 className="font-extrabold text-base text-[#232F25] dark:text-[#F0F5F1]">
                Parent-Teacher Meeting (PTM)
              </h3>
            </div>
            <p className="text-xs text-[#667768] dark:text-[#9FB1A2] leading-relaxed">
              Book a 15-minute slot with {currentChild.name}'s class teacher to review Term 2 academic progression.
            </p>

            {ptmBooked ? (
              <div className="p-4 rounded-2xl bg-[#8DA390]/20 border border-[#8DA390]/40 text-xs font-semibold text-[#213123] space-y-1">
                <div className="flex items-center gap-1.5 text-[#DA5FCE]">
                  <CheckCircle2 size={16} />
                  <strong>Confirmed Appointment</strong>
                </div>
                <p>Date: Saturday, April 26, 2025</p>
                <p>Time Slot: {selectedSlot}</p>
                <p className="text-[11px] text-[#556757] mt-1">Classroom: Room 301, Academic Block</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[#C64EBA] block mb-1">
                    Available Time Slot:
                  </label>
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-semibold"
                  >
                    <option value="10:00 AM - 10:15 AM">10:00 AM - 10:15 AM</option>
                    <option value="10:30 AM - 10:45 AM">10:30 AM - 10:45 AM</option>
                    <option value="11:00 AM - 11:15 AM">11:00 AM - 11:15 AM</option>
                    <option value="11:30 AM - 11:45 AM">11:30 AM - 11:45 AM</option>
                  </select>
                </div>

                <button
                  onClick={handleBookPTM}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#DA5FCE] text-white hover:bg-[#C64EBA] transition-colors shadow-sm"
                >
                  Reserve Meeting Slot
                </button>
              </div>
            )}
          </div>

          {/* Upcoming Examinations */}
          <div className="rounded-3xl glass-panel p-6 border border-white/70 shadow-sm space-y-3">
            <h4 className="font-extrabold text-sm text-[#232F25] dark:text-[#F0F5F1]">
              Upcoming Examinations ({currentChild.class})
            </h4>

            <div className="space-y-2.5">
              {currentChild.upcomingExams.map((ex, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl glass-card border border-white/60 text-xs flex items-center justify-between">
                  <div>
                    <h5 className="font-extrabold text-[#232F25]">{ex.subject}</h5>
                    <span className="text-[11px] text-[#718273]">{ex.time} • {ex.room}</span>
                  </div>
                  <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-xl bg-[#E8B4B8]/20 text-[#8C3B44]">
                    {ex.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
