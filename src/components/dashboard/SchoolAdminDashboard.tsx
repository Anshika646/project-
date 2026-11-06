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
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';

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
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#232F25] dark:text-[#F0F5F1] tracking-tight">
            Good Morning, {user?.profile.full_name || 'Administrator'}!
          </h1>
          <p className="text-xs md:text-sm text-[#667768] dark:text-[#9FB1A2] mt-0.5">
            Here's what's happening at {user?.institution.name || 'your institution'} today.
          </p>
        </div>

        {/* Date Widget Capsule */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl glass-card border border-white/70 dark:border-white/10 text-xs font-semibold text-[#303F32] dark:text-[#D9E6DB] shadow-sm shrink-0 self-start md:self-auto">
          <Calendar size={15} className="text-[#DA5FCE] dark:text-[#A3B899]" />
          <span>Mon, 21 Apr 2025</span>
        </div>
      </div>

      {quickActionNotice && (
        <div className="px-4 py-2.5 rounded-xl bg-[#8DA390]/20 border border-[#8DA390]/40 text-[#213123] dark:text-[#E2ECE4] text-xs font-semibold flex items-center justify-between transition-all">
          <span>{quickActionNotice}</span>
          <button onClick={() => setQuickActionNotice(null)} className="text-xs opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* 4 Stat Cards matching the visual mockup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value="1,240"
          change="5%"
          isPositive={true}
          icon={Users}
          variant="sage"
        />
        <StatCard
          title="Total Teachers"
          value="86"
          change="2%"
          isPositive={true}
          icon={GraduationCap}
          variant="pink"
        />
        <StatCard
          title="Total Classes"
          value="42"
          change="1%"
          isPositive={true}
          icon={Layers}
          variant="olive"
        />
        <StatCard
          title="Attendance Today"
          value="92%"
          change="3%"
          isPositive={true}
          icon={CalendarCheck}
          variant="pink"
        />
      </div>

      {/* Middle Row: Academic Overview, Upcoming Examinations, Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Academic Overview Chart matching Page views / Revenue chart from template */}
        <div className="lg:col-span-5 rounded-2xl glass-card p-5 border border-[#E2DEF0] dark:border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-[#DA5FCE]" />
              <h3 className="text-sm font-bold text-[#061418] dark:text-[#EFF9FB]">
                Academic Overview / Attendance
              </h3>
              {/* Three dots indicator matching image */}
              <div className="flex items-center gap-1 text-[#DA5FCE] ml-1">
                <span className="w-1 h-1 rounded-full bg-[#DA5FCE]" />
                <span className="w-1 h-1 rounded-full bg-[#DA5FCE]" />
                <span className="w-1 h-1 rounded-full bg-[#DA5FCE]" />
              </div>
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs bg-white dark:bg-black/20 border border-[#E2DEF0] rounded-lg px-2.5 py-1 text-[#061418] dark:text-[#EFF9FB] focus:outline-none"
            >
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="This Term">This Term</option>
            </select>
          </div>

          {/* Chart Legend with Cyan and Orchid */}
          <div className="flex items-center justify-end gap-4 text-[11px] font-semibold text-[#616C70] mt-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#3FB3D2]" />
              <span className="text-[#061418] dark:text-white">Attendance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#DA5FCE]" />
              <span className="text-[#061418] dark:text-white">Academics</span>
            </div>
          </div>

          {/* Dual Bar Chart with Cyan (#3FB3D2) and Orchid (#DA5FCE) matching screenshot */}
          <div className="h-44 w-full mt-3 flex items-end justify-between px-2 pt-2 border-b border-[#E2DEF0]">
            {[
              { label: 'W1', cyan: '45%', magenta: '65%' },
              { label: 'W2', cyan: '70%', magenta: '75%' },
              { label: 'W3', cyan: '40%', magenta: '35%' },
              { label: 'W4', cyan: '90%', magenta: '70%' },
              { label: 'W5', cyan: '55%', magenta: '55%' },
              { label: 'W6', cyan: '60%', magenta: '50%' },
              { label: 'W7', cyan: '85%', magenta: '95%' },
            ].map((col, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="flex items-end gap-1.5 h-32">
                  {/* Cyan bar */}
                  <div
                    style={{ height: col.cyan }}
                    className="w-3 sm:w-3.5 bg-[#3FB3D2] rounded-t-sm transition-all duration-500 shadow-xs hover:brightness-110"
                    title={`Attendance: ${col.cyan}`}
                  />
                  {/* Orchid / Magenta bar */}
                  <div
                    style={{ height: col.magenta }}
                    className="w-3 sm:w-3.5 bg-[#DA5FCE] rounded-t-sm transition-all duration-500 shadow-xs hover:brightness-110"
                    title={`Academics: ${col.magenta}`}
                  />
                </div>
                <span className="text-[10px] font-bold text-[#616C70] tabular-nums">
                  {col.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Examinations Card */}
        <div className="lg:col-span-4 rounded-2xl glass-card p-5 border border-[#E2DEF0] dark:border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-[#DA5FCE]" />
              <h3 className="text-sm font-bold text-[#061418] dark:text-[#EFF9FB]">
                Upcoming Examinations
              </h3>
            </div>
            <button
              onClick={() => handleQuickAction('Examinations List')}
              className="text-xs font-semibold text-[#DA5FCE] hover:underline flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight size={13} />
            </button>
          </div>

          <div className="space-y-2.5 mt-3">
            {DEMO_UPCOMING_EXAMS.map((exam) => (
              <div
                key={exam.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-[#E2DEF0] dark:border-white/5 hover:bg-white transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E4DBF5] text-[#DA5FCE] flex flex-col items-center justify-center font-bold leading-none shrink-0">
                    <span className="text-sm font-extrabold">{exam.day}</span>
                    <span className="text-[9px] uppercase tracking-wider">{exam.month}</span>
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-[#061418] dark:text-[#EFF9FB] truncate">
                      {exam.subject}
                    </p>
                    <p className="text-[10px] text-[#616C70] truncate">
                      {exam.class} • {exam.type}
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E4DBF5] text-[#DA5FCE] shrink-0 font-bold">
                  {exam.inDays}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Card (6 Buttons) */}
        <div className="lg:col-span-3 rounded-2xl glass-card p-5 border border-[#E2DEF0] dark:border-white/10 flex flex-col justify-between">
          <div className="flex items-center gap-2 pb-3 border-b border-black/5 dark:border-white/5">
            <span className="text-sm font-bold text-[#061418] dark:text-[#EFF9FB]">
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
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#EFF9FB]/80 dark:bg-white/5 border border-[#E2DEF0] hover:bg-[#E4DBF5]/70 transition-all text-center group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#E4DBF5] text-[#DA5FCE] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                    <Icon size={16} />
                  </div>
                  <span className="text-[10px] font-semibold text-[#061418] dark:text-[#EFF9FB] leading-tight">
                    {btn.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Activities, Class Performance, Quote Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recent Activities Timeline */}
        <div className="lg:col-span-5 rounded-2xl glass-card p-5 border border-[#E2DEF0] dark:border-white/10">
          <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2">
              <Clock size={17} className="text-[#DA5FCE]" />
              <h3 className="text-sm font-bold text-[#061418] dark:text-[#EFF9FB]">
                Recent Activities
              </h3>
            </div>
            <button
              onClick={() => handleQuickAction('Activity Audit Log')}
              className="text-xs font-semibold text-[#DA5FCE] hover:underline flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight size={13} />
            </button>
          </div>

          <div className="space-y-3.5 mt-3">
            {DEMO_RECENT_ACTIVITIES.map((act) => (
              <div key={act.id} className="flex items-start gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#DA5FCE] mt-1 shrink-0" />
                <div className="flex-1 flex items-center justify-between gap-2">
                  <p className="text-xs text-[#061418] dark:text-[#EFF9FB] font-medium leading-snug">
                    {String(act.details?.text || act.action)}
                  </p>
                  <span className="text-[10px] text-[#616C70] shrink-0 tabular-nums">
                    {act.id === 'act-1' ? '2 mins ago' : act.id === 'act-2' ? '10 mins ago' : act.id === 'act-3' ? '1 hour ago' : '2 hours ago'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Class Performance Bar Chart */}
        <div className="lg:col-span-4 rounded-2xl glass-card p-5 border border-[#E2DEF0] dark:border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
            <h3 className="text-sm font-bold text-[#061418] dark:text-[#EFF9FB]">
              Class Performance
            </h3>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="text-xs bg-white dark:bg-black/20 border border-[#E2DEF0] rounded-lg px-2.5 py-1 text-[#061418] dark:text-[#EFF9FB] focus:outline-none"
            >
              <option value="All Classes">All Classes</option>
              <option value="Secondary">Secondary</option>
              <option value="Middle">Middle</option>
            </select>
          </div>

          {/* Bar Chart Visualization with Cyan (#3FB3D2) and Orchid (#DA5FCE) */}
          <div className="flex items-end justify-around h-36 pt-4 pb-1">
            {[
              { label: 'Class 6', val: '95%', height: '95%', color: 'bg-[#3FB3D2]' },
              { label: 'Class 7', val: '92%', height: '92%', color: 'bg-[#DA5FCE]' },
              { label: 'Class 8', val: '89%', height: '89%', color: 'bg-[#3FB3D2]' },
              { label: 'Class 9', val: '94%', height: '94%', color: 'bg-[#DA5FCE]' },
            ].map((bar) => (
              <div key={bar.label} className="flex flex-col items-center gap-1.5 w-12">
                <span className="text-[11px] font-bold text-[#061418] dark:text-[#EFF9FB] tabular-nums">
                  {bar.val}
                </span>
                <div className="w-7 bg-[#E8F1F3] dark:bg-white/5 rounded-t-lg h-24 flex items-end">
                  <div
                    style={{ height: bar.height }}
                    className={`w-full rounded-t-md ${bar.color} transition-all duration-500`}
                  />
                </div>
                <span className="text-[10px] font-semibold text-[#616C70] truncate">
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quote / Institutional Leaf Card */}
        <div className="lg:col-span-3 rounded-2xl glass-card p-5 border border-[#E2DEF0] dark:border-white/10 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-white via-[#EFF9FB]/80 to-[#E8F1F3] dark:from-white/5 dark:to-white/10">
          <div className="text-3xl text-[#DA5FCE] font-serif opacity-40">“</div>
          <div className="relative z-10">
            <p className="text-xs md:text-sm font-semibold text-[#061418] dark:text-[#EFF9FB] leading-relaxed">
              Education is the key to unlocking a brighter future.
            </p>
            <p className="text-[11px] font-bold text-[#DA5FCE] mt-2">
              — Edunexa
            </p>
          </div>

          {/* Decorative subtle botanical leaf accent */}
          <div className="absolute -bottom-2 -right-2 w-20 h-20 opacity-20 pointer-events-none text-[#DA5FCE]">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.5 2 2 6.5 2 12c0 5 3.5 9 8.5 9.8 M12 2c5.5 0 10 4.5 10 10 0 5-3.5 9-8.5 9.8" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
