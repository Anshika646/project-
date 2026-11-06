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
      className={`fixed top-0 left-0 bottom-0 z-30 transition-all duration-300 ease-in-out bg-white border-r border-[#E9D5FF] flex flex-col ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-20 px-5 flex items-center justify-between border-b border-[#E9D5FF] bg-white">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Logo Emblem: Clean Signature Pink */}
          <div className="w-10 h-10 rounded-2xl bg-[#F3E8FF] p-2 flex items-center justify-center shadow-xs shrink-0 border border-[#C4B5FD]/40">
            <svg
              className="w-5 h-5 text-[#8B5CF6]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
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
              <span className="text-xl font-extrabold tracking-tight text-[#171417]">
                Edunexa
              </span>
              <span className="text-[11px] font-bold tracking-wide text-[#8B5CF6]">
                Learn • Grow • Excel
              </span>
            </div>
          )}
        </div>

        {/* Collapse toggle button */}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-xl text-[#625C60] hover:text-[#171417] hover:bg-[#F5F3FF] transition-colors hidden md:block"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Links with Pink Line Icons & Bold Black Labels */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto bg-white">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={`group flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 relative ${
                isActive
                  ? 'bg-[#F5F3FF] text-[#171417] font-bold shadow-xs'
                  : 'text-[#171417] hover:text-[#171417] hover:bg-[#FAF5FF] font-semibold'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              {/* Subtle pink active indicator pill */}
              {isActive && (
                <span className="absolute left-1 top-2.5 bottom-2.5 w-1 rounded-full bg-[#8B5CF6]" />
              )}
              <Icon
                size={19}
                className={`shrink-0 text-[#8B5CF6] ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`}
              />
              {!isCollapsed && (
                <span className="truncate text-[#171417]">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Academic Session Capsule in Warm Cream/Pink Card */}
      {!isCollapsed ? (
        <div className="p-3 mx-3 mb-4 rounded-2xl bg-[#FAF5FF] border border-[#E9D5FF] shadow-xs">
          <div className="flex items-center gap-2.5 text-xs">
            <div className="w-7 h-7 rounded-lg bg-[#F3E8FF] flex items-center justify-center shrink-0">
              <Calendar size={15} className="text-[#8B5CF6]" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-[10px] text-[#8B5CF6] uppercase tracking-wider font-extrabold">
                Academic Session
              </span>
              <span className="font-extrabold text-[#171417] truncate">
                {user?.institution.academic_session || '2025 – 2026'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2 mb-4 flex justify-center text-[#8B5CF6]" title="Session 2025 - 2026">
          <Calendar size={18} />
        </div>
      )}
    </aside>
  );
};
