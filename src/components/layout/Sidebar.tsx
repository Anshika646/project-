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
  X,
  Sparkles,
  UserPlus,
  ClipboardCheck,
  Trophy,
  ArrowUpRight,
  Archive,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { role, user } = useAuth();
  const location = useLocation();

  // Role-based navigation items
  const getNavItems = () => {
    switch (role) {
      case 'student':
      case 'college_student':
        return [
          { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
          { label: 'Schedule & Timetable', icon: Calendar, path: '/timetable' },
          { label: 'My Attendance', icon: CheckCircle2, path: '/attendance' },
          { label: 'Exams & Grades', icon: FileSpreadsheet, path: '/examinations' },
          { label: 'Assignments', icon: FileText, path: '/homework' },
          { label: 'Study Material', icon: BookOpen, path: '/notes' },
          { label: 'Daily Quiz', icon: Award, path: '/quizzes' },
          { label: 'Report Cards', icon: Sparkles, path: '/reports' },
          { label: 'Announcements', icon: Bell, path: '/notices' },
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
      case 'super_admin':
        return [
          { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
          { label: 'Institutions', icon: Building2, path: '/institutions' },
          { label: 'Subscriptions', icon: ShieldCheck, path: '/subscriptions' },
          { label: 'System Analytics', icon: BarChart3, path: '/analytics' },
          { label: 'Support Tickets', icon: HelpCircle, path: '/tickets' },
          { label: 'Settings', icon: Settings, path: '/settings' },
        ];
      case 'school_admin':
      default:
        // EXACT SEQUENCE SPECIFIED BY USER (1 TO 19):
        return [
          { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
          { label: 'Admissions & Enquiries', icon: UserPlus, path: '/admissions' },
          { label: 'Student Management', icon: Users, path: '/students' },
          { label: 'Staff & Teacher Management', icon: GraduationCap, path: '/teachers' },
          { label: 'Academic Setup', icon: Sparkles, path: '/academic-setup' },
          { label: 'Classes & Sections', icon: Layers, path: '/classes' },
          { label: 'Subjects & Syllabus', icon: BookOpen, path: '/subjects' },
          { label: 'Timetable & Calendar', icon: Calendar, path: '/timetable' },
          { label: 'Attendance', icon: CheckCircle2, path: '/attendance' },
          { label: 'Examinations & Results', icon: FileSpreadsheet, path: '/examinations' },
          { label: 'Report Cards', icon: Award, path: '/reports' },
          { label: 'Notes & Study Material', icon: FileText, path: '/notes' },
          { label: 'Homework & Assignments', icon: ClipboardCheck, path: '/homework' },
          { label: 'Quizzes & Leaderboard', icon: Trophy, path: '/quizzes' },
          { label: 'Notices & Communication', icon: Bell, path: '/notices' },
          { label: 'Student Promotion & TC', icon: ArrowUpRight, path: '/promotions' },
          { label: 'Reports & Analytics', icon: BarChart3, path: '/analytics' },
          { label: 'Academic Session Closing', icon: Archive, path: '/session-lifecycle' },
          { label: 'Settings', icon: Settings, path: '/settings' },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-[#0F172A]/30 backdrop-blur-xs z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Fixed White Left Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 transition-all duration-300 ease-in-out bg-white border-r border-[#E8E4DF] flex flex-col ${
          isCollapsed ? 'md:w-20' : 'md:w-64'
        } ${
          isMobileOpen
            ? 'w-64 translate-x-0 shadow-2xl'
            : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Area */}
        <div className="h-18 px-5 flex items-center justify-between border-b border-[#E8E4DF] bg-white shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE] flex items-center justify-center shrink-0 shadow-xs">
              <svg
                className="w-5 h-5 text-[#6D28D9]"
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

            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col truncate">
                <span className="text-base font-extrabold tracking-tight text-[#0F172A]">
                  Edunexa
                </span>
                <span className="text-[11px] font-medium text-[#64748B]">
                  School ERP
                </span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#FAF8F5] transition-colors hidden md:block"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          {/* Mobile close toggle */}
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#FAF8F5] transition-colors md:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Clear Navigation Labels with Simple Outline Icons */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto bg-white scrollbar-thin">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={() => {
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`group flex items-center gap-3 px-3 py-2 rounded-xl text-xs md:text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-[#6D28D9] text-white font-semibold shadow-xs'
                    : 'text-[#0F172A] hover:text-[#6D28D9] hover:bg-[#FAF8F5] font-medium'
                }`}
                title={isCollapsed && !isMobileOpen ? `${index + 1}. ${item.label}` : undefined}
              >
                <Icon
                  size={17}
                  className={`shrink-0 transition-colors ${
                    isActive
                      ? 'text-white stroke-[2.2]'
                      : 'text-[#64748B] group-hover:text-[#6D28D9] stroke-[1.8]'
                  }`}
                />
                {(!isCollapsed || isMobileOpen) && (
                  <span className="truncate">{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom User / Session Capsule */}
        {(!isCollapsed || isMobileOpen) ? (
          <div className="p-3 mx-3 mb-3 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] shrink-0">
            <div className="flex items-center gap-2.5 text-xs">
              <div className="w-8 h-8 rounded-lg bg-[#F5F3FF] border border-[#DDD6FE] flex items-center justify-center shrink-0 text-[#6D28D9]">
                <Calendar size={14} />
              </div>
              <div className="flex flex-col truncate">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  Active Session
                </span>
                <span className="font-bold text-[#0F172A] truncate">
                  {user?.institution.academic_session || '2025 – 2026'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2 mb-3 flex justify-center text-[#6D28D9] shrink-0" title="Active Session">
            <Calendar size={18} />
          </div>
        )}
      </aside>
    </>
  );
};
