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
          <Calendar size={15} className="text-[#5B6E5E] dark:text-[#A3B899]" />
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
        {/* Academic Overview Chart */}
        <div className="lg:col-span-5 rounded-2xl glass-card p-5 border border-white/70 dark:border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-[#5B6E5E] dark:text-[#A3B899]" />
              <h3 className="text-sm font-bold text-[#232F25] dark:text-[#F0F5F1]">
                Academic Overview
              </h3>
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs bg-white/70 dark:bg-black/20 border border-[#8DA390]/30 rounded-lg px-2 py-1 text-[#334235] dark:text-[#D1E0D3] focus:outline-none"
            >
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="This Term">This Term</option>
            </select>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center justify-end gap-4 text-[11px] font-medium text-[#657667] dark:text-[#9FB1A2] mt-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5B6E5E]" />
              <span>Attendance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E8B4B8]" />
              <span>Performance</span>
            </div>
          </div>

          {/* Simulated SVG Wave Chart matching mockup aesthetic */}
          <div className="h-44 w-full mt-2 relative">
            <svg viewBox="0 0 400 160" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7D9D85" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#7D9D85" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="chartPink" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E8B4B8" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#E8B4B8" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="30" y1="20" x2="390" y2="20" stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3" />
              <line x1="30" y1="60" x2="390" y2="60" stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3" />
              <line x1="30" y1="100" x2="390" y2="100" stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3" />
              <line x1="30" y1="140" x2="390" y2="140" stroke="rgba(0,0,0,0.08)" />

              {/* Y Axis labels */}
              <text x="5" y="24" fontSize="9" fill="#88988A" fontFamily="sans-serif">100%</text>
              <text x="5" y="64" fontSize="9" fill="#88988A" fontFamily="sans-serif">75%</text>
              <text x="5" y="104" fontSize="9" fill="#88988A" fontFamily="sans-serif">50%</text>
              <text x="5" y="144" fontSize="9" fill="#88988A" fontFamily="sans-serif">0%</text>

              {/* Pink Performance Curve */}
              <path
                d="M 50 115 C 130 95, 230 75, 300 60 C 340 50, 360 48, 380 45 L 380 140 L 50 140 Z"
                fill="url(#chartPink)"
              />
              <path
                d="M 50 115 C 130 95, 230 75, 300 60 C 340 50, 360 48, 380 45"
                fill="none"
                stroke="#E8B4B8"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="50" cy="115" r="3.5" fill="#E8B4B8" />
              <circle cx="160" cy="98" r="3.5" fill="#E8B4B8" />
              <circle cx="270" cy="68" r="3.5" fill="#E8B4B8" />
              <circle cx="380" cy="45" r="3.5" fill="#E8B4B8" />

              {/* Green Attendance Curve */}
              <path
                d="M 50 90 C 130 55, 230 50, 300 45 C 340 40, 360 38, 380 32 L 380 140 L 50 140 Z"
                fill="url(#chartGreen)"
              />
              <path
                d="M 50 90 C 130 55, 230 50, 300 45 C 340 40, 360 38, 380 32"
                fill="none"
                stroke="#5B6E5E"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="50" cy="90" r="3.5" fill="#5B6E5E" />
              <circle cx="160" cy="55" r="3.5" fill="#5B6E5E" />
              <circle cx="270" cy="48" r="3.5" fill="#5B6E5E" />
              <circle cx="380" cy="32" r="3.5" fill="#5B6E5E" />

              {/* X Axis labels */}
              <text x="40" y="155" fontSize="9" fill="#88988A" fontFamily="sans-serif">Week 1</text>
              <text x="150" y="155" fontSize="9" fill="#88988A" fontFamily="sans-serif">Week 2</text>
              <text x="260" y="155" fontSize="9" fill="#88988A" fontFamily="sans-serif">Week 3</text>
              <text x="360" y="155" fontSize="9" fill="#88988A" fontFamily="sans-serif">Week 4</text>
            </svg>
          </div>
        </div>

        {/* Upcoming Examinations Card */}
        <div className="lg:col-span-4 rounded-2xl glass-card p-5 border border-white/70 dark:border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-[#5B6E5E] dark:text-[#A3B899]" />
              <h3 className="text-sm font-bold text-[#232F25] dark:text-[#F0F5F1]">
                Upcoming Examinations
              </h3>
            </div>
            <button
              onClick={() => handleQuickAction('Examinations List')}
              className="text-xs font-semibold text-[#5B6E5E] dark:text-[#A3B899] hover:underline flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight size={13} />
            </button>
          </div>

          <div className="space-y-2.5 mt-3">
            {DEMO_UPCOMING_EXAMS.map((exam) => (
              <div
                key={exam.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/5 hover:bg-white/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#DEE7DF] dark:bg-[#28352A] text-[#3E5241] dark:text-[#C2D8C2] flex flex-col items-center justify-center font-bold leading-none shrink-0">
                    <span className="text-sm">{exam.day}</span>
                    <span className="text-[9px] uppercase tracking-wider">{exam.month}</span>
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-[#232F25] dark:text-[#F0F5F1] truncate">
                      {exam.subject}
                    </p>
                    <p className="text-[10px] text-[#637466] dark:text-[#95A597] truncate">
                      {exam.class} • {exam.type}
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F4D3D6]/70 text-[#9C3E4A] dark:bg-[#4D282D] dark:text-[#E8B4B8] shrink-0">
                  {exam.inDays}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Card (6 Buttons) */}
        <div className="lg:col-span-3 rounded-2xl glass-card p-5 border border-white/70 dark:border-white/10 flex flex-col justify-between">
          <div className="flex items-center gap-2 pb-3 border-b border-black/5 dark:border-white/5">
            <span className="text-sm font-bold text-[#232F25] dark:text-[#F0F5F1]">
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
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-white/80 dark:border-white/10 hover:bg-[#8DA390]/15 dark:hover:bg-white/10 transition-all text-center group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#8DA390]/15 dark:bg-[#8DA390]/25 text-[#425545] dark:text-[#C2D8C2] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                    <Icon size={16} />
                  </div>
                  <span className="text-[10px] font-semibold text-[#303E33] dark:text-[#D1E0D3] leading-tight">
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
        <div className="lg:col-span-5 rounded-2xl glass-card p-5 border border-white/70 dark:border-white/10">
          <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2">
              <Clock size={17} className="text-[#5B6E5E] dark:text-[#A3B899]" />
              <h3 className="text-sm font-bold text-[#232F25] dark:text-[#F0F5F1]">
                Recent Activities
              </h3>
            </div>
            <button
              onClick={() => handleQuickAction('Activity Audit Log')}
              className="text-xs font-semibold text-[#5B6E5E] dark:text-[#A3B899] hover:underline flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight size={13} />
            </button>
          </div>

          <div className="space-y-3.5 mt-3">
            {DEMO_RECENT_ACTIVITIES.map((act) => (
              <div key={act.id} className="flex items-start gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5B6E5E] dark:bg-[#8DA390] mt-1 shrink-0" />
                <div className="flex-1 flex items-center justify-between gap-2">
                  <p className="text-xs text-[#2A372C] dark:text-[#E2ECE4] font-medium leading-snug">
                    {String(act.details?.text || act.action)}
                  </p>
                  <span className="text-[10px] text-[#78897B] dark:text-[#8D9C90] shrink-0 tabular-nums">
                    {act.id === 'act-1' ? '2 mins ago' : act.id === 'act-2' ? '10 mins ago' : act.id === 'act-3' ? '1 hour ago' : '2 hours ago'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Class Performance Bar Chart */}
        <div className="lg:col-span-4 rounded-2xl glass-card p-5 border border-white/70 dark:border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
            <h3 className="text-sm font-bold text-[#232F25] dark:text-[#F0F5F1]">
              Class Performance
            </h3>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="text-xs bg-white/70 dark:bg-black/20 border border-[#8DA390]/30 rounded-lg px-2 py-1 text-[#334235] dark:text-[#D1E0D3] focus:outline-none"
            >
              <option value="All Classes">All Classes</option>
              <option value="Secondary">Secondary</option>
              <option value="Middle">Middle</option>
            </select>
          </div>

          {/* Bar Chart Visualization */}
          <div className="flex items-end justify-around h-36 pt-4 pb-1">
            {[
              { label: 'Class 6', val: '95%', height: '95%', color: 'bg-[#5B6E5E]' },
              { label: 'Class 7', val: '92%', height: '92%', color: 'bg-[#E8B4B8]' },
              { label: 'Class 8', val: '89%', height: '89%', color: 'bg-[#E2C7B8]' },
              { label: 'Class 9', val: '94%', height: '94%', color: 'bg-[#7D9D85]' },
            ].map((bar) => (
              <div key={bar.label} className="flex flex-col items-center gap-1.5 w-12">
                <span className="text-[11px] font-bold text-[#232F25] dark:text-[#F0F5F1] tabular-nums">
                  {bar.val}
                </span>
                <div className="w-7 bg-black/5 dark:bg-white/5 rounded-t-lg h-24 flex items-end">
                  <div
                    style={{ height: bar.height }}
                    className={`w-full rounded-t-md ${bar.color} transition-all duration-500`}
                  />
                </div>
                <span className="text-[10px] font-medium text-[#657667] dark:text-[#9FB1A2] truncate">
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quote / Institutional Leaf Card */}
        <div className="lg:col-span-3 rounded-2xl glass-card p-5 border border-white/70 dark:border-white/10 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-white/80 via-[#F9F8F4] to-[#F1ECE3] dark:from-white/5 dark:to-white/10">
          <div className="text-3xl text-[#5B6E5E] font-serif opacity-40">“</div>
          <div className="relative z-10">
            <p className="text-xs md:text-sm font-semibold text-[#253227] dark:text-[#E2ECE4] leading-relaxed">
              Education is the key to unlocking a brighter future.
            </p>
            <p className="text-[11px] font-medium text-[#7D9D85] dark:text-[#A3B899] mt-2">
              — Edunexa
            </p>
          </div>

          {/* Decorative subtle botanical leaf accent */}
          <div className="absolute -bottom-2 -right-2 w-20 h-20 opacity-20 pointer-events-none text-[#5B6E5E]">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.5 2 2 6.5 2 12c0 5 3.5 9 8.5 9.8 M12 2c5.5 0 10 4.5 10 10 0 5-3.5 9-8.5 9.8" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
