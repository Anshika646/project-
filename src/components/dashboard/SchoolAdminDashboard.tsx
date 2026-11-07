import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { StatCard } from '../common/StatCard';
import {
  Users,
  GraduationCap,
  Layers,
  CalendarCheck,
  Calendar,
  CheckCircle,
  Megaphone,
  FileText,
  HelpCircle,
  UploadCloud,
  Clock,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { DEMO_UPCOMING_EXAMS, DEMO_RECENT_ACTIVITIES } from '../../services/mockData';
import { exportToPDF } from '../../utils/exportUtils';

export const SchoolAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState('This Month');
  const [selectedClassFilter, setSelectedClassFilter] = useState('All Classes');
  const [quickActionNotice, setQuickActionNotice] = useState<string | null>(null);

  const handleQuickAction = (actionName: string) => {
    if (actionName === 'Generate Report') {
      exportToPDF(
        'Springfield Academy — Academic Summary Report',
        [
          { header: 'Class', dataKey: 'class' },
          { header: 'Attendance %', dataKey: 'attendance' },
          { header: 'Pass %', dataKey: 'pass' },
        ],
        [
          { class: 'Class 6', attendance: '95%', pass: '98%' },
          { class: 'Class 7', attendance: '92%', pass: '96%' },
          { class: 'Class 8', attendance: '89%', pass: '94%' },
          { class: 'Class 9', attendance: '94%', pass: '97%' },
          { class: 'Class 10', attendance: '96%', pass: '99%' },
        ],
        'Edunexa-Academic-Report.pdf'
      );
      setQuickActionNotice('Academic report PDF downloaded successfully!');
      setTimeout(() => setQuickActionNotice(null), 3500);
      return;
    }

    setQuickActionNotice(`Quick Action "${actionName}" opened in active workspace.`);
    setTimeout(() => setQuickActionNotice(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Greeting Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Good Morning, {user?.profile.full_name || 'Dr. Rajesh Sharma'}!
          </h1>
          <p className="text-xs md:text-sm font-semibold text-[#64748B] mt-0.5">
            Here's what's happening at {user?.institution.name || 'Springfield International School'} today.
          </p>
        </div>

        {/* Date Widget Capsule */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-bold text-[#0F172A] shadow-xs shrink-0 self-start md:self-auto">
          <Calendar size={16} className="text-[#6D28D9]" />
          <span>Mon, 21 Apr 2025</span>
        </div>
      </div>

      {quickActionNotice && (
        <div className="px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#DDD6FE] text-[#0F172A] text-xs font-bold flex items-center justify-between transition-all shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#6D28D9]" />
            <span>{quickActionNotice}</span>
          </div>
          <button onClick={() => setQuickActionNotice(null)} className="text-xs font-bold text-[#6D28D9] hover:text-[#0F172A]">✕</button>
        </div>
      )}

      {/* 4 Beautiful KPI Cards in Light Pink with Cream Touch */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value="1,240"
          change="5%"
          isPositive={true}
          icon={Users}
          variant="pink"
        />
        <StatCard
          title="Total Teachers"
          value="86"
          change="2%"
          isPositive={true}
          icon={GraduationCap}
          variant="cream"
        />
        <StatCard
          title="Total Classes"
          value="42"
          change="1%"
          isPositive={true}
          icon={Layers}
          variant="rose"
        />
        <StatCard
          title="Attendance Today"
          value="94.2%"
          change="3%"
          isPositive={true}
          icon={CalendarCheck}
          variant="blush"
        />
      </div>

      {/* Middle Row: Academic Overview Chart, Upcoming Examinations, Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Academic Overview Chart with Refined Pink & Cream Palette */}
        <div className="lg:col-span-5 rounded-2xl bg-[#FFFFFF] p-5 border border-[#E8E4DF] shadow-[0_4px_20px_-4px_rgba(15, 23, 42, 0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DF]">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-[#6D28D9]" />
              <h3 className="font-heading text-sm font-extrabold text-[#0F172A]">
                Attendance & Academic Trends
              </h3>
              <div className="flex items-center gap-1 text-[#DDD6FE] ml-1">
                <span className="w-1 h-1 rounded-full bg-current" />
                <span className="w-1 h-1 rounded-full bg-current" />
                <span className="w-1 h-1 rounded-full bg-current" />
              </div>
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs bg-white border border-[#E8E4DF] rounded-lg px-2.5 py-1 text-[#0F172A] font-semibold focus:outline-none focus:border-[#6D28D9]"
            >
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="This Term">This Term</option>
            </select>
          </div>

          {/* Chart Legend with Restrained Pink & Neutral Tones */}
          <div className="flex items-center justify-end gap-4 text-[11px] font-bold text-[#64748B] mt-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#6D28D9]" />
              <span className="text-[#0F172A]">Attendance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#DDD6FE]" />
              <span className="text-[#0F172A]">Academics</span>
            </div>
          </div>

          {/* Dual Bar Chart with Signature Pink (#6D28D9) and Soft Pink (#DDD6FE) */}
          <div className="h-44 w-full mt-3 flex items-end justify-between px-2 pt-2 border-b border-[#E8E4DF]">
            {[
              { label: 'W1', attendance: '65%', academics: '55%' },
              { label: 'W2', attendance: '80%', academics: '72%' },
              { label: 'W3', attendance: '70%', academics: '68%' },
              { label: 'W4', attendance: '92%', academics: '88%' },
              { label: 'W5', attendance: '85%', academics: '78%' },
              { label: 'W6', attendance: '90%', academics: '84%' },
              { label: 'W7', attendance: '95%', academics: '90%' },
            ].map((col, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="flex items-end gap-1.5 h-32">
                  {/* Attendance Bar */}
                  <div
                    style={{ height: col.attendance }}
                    className="w-3 sm:w-3.5 bg-[#6D28D9] rounded-t-sm transition-all duration-500 shadow-xs hover:brightness-110"
                    title={`Attendance: ${col.attendance}`}
                  />
                  {/* Academics Bar */}
                  <div
                    style={{ height: col.academics }}
                    className="w-3 sm:w-3.5 bg-[#DDD6FE] rounded-t-sm transition-all duration-500 shadow-xs hover:brightness-110"
                    title={`Academics: ${col.academics}`}
                  />
                </div>
                <span className="text-[10px] font-extrabold text-[#0F172A] tabular-nums">
                  {col.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Examinations Card in Secondary Cream Pink */}
        <div className="lg:col-span-4 rounded-2xl bg-[#FAF8F5] p-5 border border-[#E8E4DF] shadow-[0_4px_20px_-4px_rgba(15, 23, 42, 0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DF]">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-[#6D28D9]" />
              <h3 className="font-heading text-sm font-extrabold text-[#0F172A]">
                Upcoming Examinations
              </h3>
            </div>
            <button
              onClick={() => handleQuickAction('Examinations List')}
              className="text-xs font-bold text-[#6D28D9] hover:underline flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight size={13} />
            </button>
          </div>

          <div className="space-y-2.5 mt-3">
            {DEMO_UPCOMING_EXAMS.map((exam) => (
              <div
                key={exam.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E8E4DF] hover:border-[#DDD6FE] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFFFFF] text-[#6D28D9] flex flex-col items-center justify-center font-bold leading-none shrink-0 border border-[#DDD6FE]/40">
                    <span className="text-sm font-extrabold">{exam.day}</span>
                    <span className="text-[9px] uppercase tracking-wider font-bold">{exam.month}</span>
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-extrabold text-[#0F172A] truncate">
                      {exam.subject}
                    </p>
                    <p className="text-[10px] font-semibold text-[#64748B] truncate">
                      {exam.class} • {exam.type}
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FFFFFF] text-[#6D28D9] border border-[#DDD6FE]/50 shrink-0">
                  {exam.inDays}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Card (6 Buttons in Cream Pink) */}
        <div className="lg:col-span-3 rounded-2xl bg-[#FFFFFF] p-5 border border-[#E8E4DF] shadow-[0_4px_20px_-4px_rgba(15, 23, 42, 0.03)] flex flex-col justify-between">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E8E4DF]">
            <span className="font-heading text-sm font-extrabold text-[#0F172A]">
              ⚡ Quick Actions
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { label: 'Mark Attendance', icon: CheckCircle, action: 'Mark Attendance' },
              { label: 'Add Notice', icon: Megaphone, action: 'Add Notice' },
              { label: 'Generate Report', icon: FileText, action: 'Generate Report' },
              { label: 'Create Quiz', icon: HelpCircle, action: 'Create Quiz' },
              { label: 'Upload Notes', icon: UploadCloud, action: 'Upload Notes' },
              { label: 'View Timetable', icon: Calendar, action: 'View Timetable' },
            ].map((btn) => {
              const Icon = btn.icon;
              return (
                <button
                  key={btn.label}
                  onClick={() => handleQuickAction(btn.action)}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white border border-[#E8E4DF] hover:bg-[#FFFFFF] hover:border-[#DDD6FE] transition-all text-center group shadow-2xs"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#FFFFFF] text-[#6D28D9] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                    <Icon size={16} className="stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-extrabold text-[#0F172A] leading-tight">
                    {btn.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Activities, Class Performance, School Motto */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recent Activities Timeline */}
        <div className="lg:col-span-5 rounded-2xl bg-[#FFFFFF] p-5 border border-[#E8E4DF] shadow-[0_4px_20px_-4px_rgba(15, 23, 42, 0.03)]">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DF]">
            <div className="flex items-center gap-2">
              <Clock size={17} className="text-[#6D28D9]" />
              <h3 className="font-heading text-sm font-extrabold text-[#0F172A]">
                Recent Activities
              </h3>
            </div>
            <button
              onClick={() => handleQuickAction('Activity Audit Log')}
              className="text-xs font-bold text-[#6D28D9] hover:underline flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight size={13} />
            </button>
          </div>

          <div className="space-y-3.5 mt-3">
            {DEMO_RECENT_ACTIVITIES.map((act) => (
              <div key={act.id} className="flex items-start gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6D28D9] mt-1 shrink-0" />
                <div className="flex-1 flex items-center justify-between gap-2">
                  <p className="text-xs text-[#0F172A] font-bold leading-snug">
                    {String(act.details?.text || act.action)}
                  </p>
                  <span className="text-[10px] font-semibold text-[#64748B] shrink-0 tabular-nums">
                    {act.id === 'act-1' ? '2 mins ago' : act.id === 'act-2' ? '10 mins ago' : act.id === 'act-3' ? '1 hour ago' : '2 hours ago'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Class Performance Bar Chart */}
        <div className="lg:col-span-4 rounded-2xl bg-[#FAF8F5] p-5 border border-[#E8E4DF] shadow-[0_4px_20px_-4px_rgba(15, 23, 42, 0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DF]">
            <h3 className="font-heading text-sm font-extrabold text-[#0F172A]">
              Class-Wise Academic Distribution
            </h3>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="text-xs bg-white border border-[#E8E4DF] rounded-lg px-2.5 py-1 text-[#0F172A] font-semibold focus:outline-none focus:border-[#6D28D9]"
            >
              <option value="All Classes">All Classes</option>
              <option value="Secondary">Secondary</option>
              <option value="Middle">Middle</option>
            </select>
          </div>

          {/* Bar Chart Visualization with Restrained Pink Tones */}
          <div className="flex items-end justify-around h-36 pt-4 pb-1">
            {[
              { label: 'Class 6', val: '95%', height: '95%', color: 'bg-[#6D28D9]' },
              { label: 'Class 7', val: '92%', height: '92%', color: 'bg-[#DDD6FE]' },
              { label: 'Class 8', val: '89%', height: '89%', color: 'bg-[#8B5CF6]' },
              { label: 'Class 9', val: '94%', height: '94%', color: 'bg-[#6D28D9]' },
            ].map((bar) => (
              <div key={bar.label} className="flex flex-col items-center gap-1.5 w-12">
                <span className="font-stat text-[11px] font-extrabold text-[#0F172A] tabular-nums">
                  {bar.val}
                </span>
                <div className="w-7 bg-white rounded-t-lg h-24 flex items-end border border-b-0 border-[#E8E4DF]">
                  <div
                    style={{ height: bar.height }}
                    className={`w-full rounded-t-md ${bar.color} transition-all duration-500`}
                  />
                </div>
                <span className="text-[10px] font-bold text-[#64748B] truncate">
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Institutional Motto Card in Soft Cream Pink */}
        <div className="lg:col-span-3 rounded-2xl bg-[#FFFFFF] p-5 border border-[#E8E4DF] shadow-[0_4px_20px_-4px_rgba(15, 23, 42, 0.03)] flex flex-col justify-between relative overflow-hidden">
          <div className="text-3xl text-[#6D28D9] font-serif opacity-30">“</div>
          <div className="relative z-10">
            <p className="text-xs md:text-sm font-extrabold text-[#0F172A] leading-relaxed">
              Education is the key to unlocking a brighter tomorrow for every child.
            </p>
            <p className="text-[11px] font-extrabold text-[#6D28D9] mt-2 tracking-wide">
              — Springfield Academy • Edunexa
            </p>
          </div>

          <div className="absolute -bottom-2 -right-2 w-20 h-20 opacity-15 pointer-events-none text-[#6D28D9]">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.5 2 2 6.5 2 12c0 5 3.5 9 8.5 9.8 M12 2c5.5 0 10 4.5 10 10 0 5-3.5 9-8.5 9.8" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
