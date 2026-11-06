import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Layers,
  BookOpen,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  Bell,
  BarChart3,
  Settings,
  FileText,
  HelpCircle,
  Award,
  CalendarDays,
  Building2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { role, user } = useAuth();
  const location = useLocation();

  // Role-based navigation items
  const getNavItems = () => {
    switch (role) {
      case 'super_admin':
        return [
          { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
          { label: 'Institutions', icon: Building2, path: '/institutions' },
          { label: 'Subscriptions', icon: ShieldCheck, path: '/subscriptions' },
          { label: 'System Analytics', icon: BarChart3, path: '/analytics' },
          { label: 'Support Tickets', icon: HelpCircle, path: '/tickets' },
          { label: 'Settings', icon: Settings, path: '/settings' },
        ];
      case 'teacher':
      case 'college_faculty':
        return [
          { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
          { label: 'My Students', icon: Users, path: '/students' },
          { label: 'Attendance', icon: CheckCircle2, path: '/attendance' },
          { label: 'Marks & Exams', icon: FileSpreadsheet, path: '/examinations' },
          { label: 'Report Cards', icon: Award, path: '/reports' },
          { label: 'Study Notes', icon: BookOpen, path: '/notes' },
          { label: 'Homework', icon: FileText, path: '/homework' },
          { label: 'Quizzes', icon: Award, path: '/quizzes' },
          { label: 'Timetable', icon: Calendar, path: '/timetable' },
          { label: 'Notices', icon: Bell, path: '/notices' },
        ];
      case 'student':
      case 'college_student':
        return [
          { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
          { label: 'Timetable', icon: Calendar, path: '/timetable' },
          { label: 'My Attendance', icon: CheckCircle2, path: '/attendance' },
          { label: 'Academics & Marks', icon: FileSpreadsheet, path: '/examinations' },
          { label: 'Report Cards', icon: Award, path: '/reports' },
          { label: 'Study Material', icon: BookOpen, path: '/notes' },
          { label: 'Daily Quiz', icon: Award, path: '/quizzes' },
          { label: 'Homework', icon: FileText, path: '/homework' },
          { label: 'Notices', icon: Bell, path: '/notices' },
        ];
      case 'parent':
        return [
          { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
          { label: 'Child Attendance', icon: CheckCircle2, path: '/attendance' },
          { label: 'Academic Marks', icon: FileSpreadsheet, path: '/examinations' },
          { label: 'Report Cards', icon: Award, path: '/reports' },
          { label: 'Homework', icon: FileText, path: '/homework' },
          { label: 'Study Material', icon: BookOpen, path: '/notes' },
          { label: 'PTM Booking', icon: CalendarDays, path: '/ptm' },
          { label: 'School Notices', icon: Bell, path: '/notices' },
        ];
      case 'college_admin':
        return [
          { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
          { label: 'Departments', icon: Building2, path: '/departments' },
          { label: 'Courses & Semesters', icon: Layers, path: '/courses' },
          { label: 'Faculty', icon: GraduationCap, path: '/teachers' },
          { label: 'Students', icon: Users, path: '/students' },
          { label: 'Exams & SGPA', icon: FileSpreadsheet, path: '/examinations' },
          { label: 'Transcripts', icon: Award, path: '/reports' },
          { label: 'Notices', icon: Bell, path: '/notices' },
          { label: 'Settings', icon: Settings, path: '/settings' },
        ];
      case 'school_admin':
      default:
        return [
          { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
          { label: 'Students', icon: Users, path: '/students' },
          { label: 'Teachers', icon: GraduationCap, path: '/teachers' },
          { label: 'Classes', icon: Layers, path: '/classes' },
          { label: 'Subjects', icon: BookOpen, path: '/subjects' },
          { label: 'Timetable', icon: Calendar, path: '/timetable' },
          { label: 'Attendance', icon: CheckCircle2, path: '/attendance' },
          { label: 'Examinations', icon: FileSpreadsheet, path: '/examinations' },
          { label: 'Notices', icon: Bell, path: '/notices' },
          { label: 'Reports', icon: BarChart3, path: '/reports' },
          { label: 'Settings', icon: Settings, path: '/settings' },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-30 transition-all duration-300 ease-in-out glass-sidebar flex flex-col ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-24 px-5 flex items-center justify-between border-b border-[#E2DEF0] dark:border-white/10">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Logo Emblem: Gradient from Orchid to Cyan */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#DA5FCE] to-[#3FB3D2] p-2 flex items-center justify-center shadow-md shrink-0">
            <svg
              className="w-6 h-6 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2C6.5 2 2 6.5 2 12c0 5 3.5 9 8.5 9.8" />
              <path d="M12 2c5.5 0 10 4.5 10 10 0 5-3.5 9-8.5 9.8" />
              <path d="M12 22V12" />
              <path d="M12 12c-3-2.5-4-5-4-7" />
              <path d="M12 12c3-2.5 4-5 4-7" />
            </svg>
          </div>

          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="text-xl font-bold tracking-tight text-[#061418] dark:text-[#EFF9FB]">
                Edunexa
              </span>
              <span className="text-[11px] font-medium tracking-wide text-[#DA5FCE] dark:text-[#E099DD]">
                Learn • Grow • Excel
              </span>
            </div>
          )}
        </div>

        {/* Collapse toggle button */}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-[#616C70] hover:text-[#061418] hover:bg-[#E4DBF5]/60 transition-colors hidden md:block"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Links matching the Image Template */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-[#E4DBF5] text-[#061418] shadow-sm font-bold'
                  : 'text-[#616C70] hover:text-[#061418] hover:bg-[#E4DBF5]/40 font-medium'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                size={19}
                className={`shrink-0 ${
                  isActive ? 'text-[#DA5FCE]' : 'text-[#DA5FCE]/80'
                }`}
              />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Session Box */}
      {!isCollapsed ? (
        <div className="p-3 mx-3 mb-4 rounded-xl bg-white/80 dark:bg-white/5 border border-[#E2DEF0] dark:border-white/10 shadow-xs">
          <div className="flex items-center gap-2.5 text-xs text-[#616C70] dark:text-[#CEE7EE]">
            <Calendar size={15} className="text-[#DA5FCE] shrink-0" />
            <div className="flex flex-col truncate">
              <span className="text-[10px] text-[#DA5FCE] uppercase tracking-wider font-semibold">
                Academic Session
              </span>
              <span className="font-semibold text-[#061418] dark:text-white truncate">
                {user?.institution.academic_session || '2025 – 2026'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2 mb-4 flex justify-center text-[#DA5FCE]" title="Session 2025 - 2026">
          <Calendar size={18} />
        </div>
      )}
    </aside>
  );
};
