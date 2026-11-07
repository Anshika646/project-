import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import {
  Search,
  Bell,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  UserCheck,
  Building,
  Menu,
} from 'lucide-react';
import { NotificationColumn } from './NotificationColumn';

interface HeaderProps {
  onSearchClick?: () => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearchClick, onToggleMobileMenu }) => {
  const { user, role, demoAccounts, loginAsDemo, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setIsRoleSwitcherOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const currentRoleLabel =
    demoAccounts.find((d) => d.role === role)?.roleLabel ||
    role?.replace('_', ' ').toUpperCase() ||
    'Student';

  const userInitials =
    user?.profile.full_name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'AP';

  return (
    <header className="sticky top-0 z-20 h-18 px-4 sm:px-6 flex items-center justify-between border-b border-[#E8E4DF] bg-white">
      {/* Left: Mobile Menu Toggle + Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 rounded-xl text-[#0F172A] hover:bg-[#FAF8F5] border border-[#E8E4DF] md:hidden transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu size={18} />
        </button>

        <div
          onClick={onSearchClick}
          className="relative flex items-center w-full cursor-pointer group"
        >
          <Search
            size={16}
            className="absolute left-3.5 text-[#6D28D9] transition-colors"
          />
          <input
            type="text"
            readOnly
            placeholder="Search courses, assignments, notices..."
            className="w-full pl-9 pr-12 py-2 text-xs md:text-sm font-medium rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-[#0F172A] placeholder-[#94A3B8] cursor-pointer focus:outline-none focus:border-[#6D28D9]"
          />
          <div className="absolute right-3 px-1.5 py-0.5 rounded-md bg-white border border-[#E8E4DF] text-[10px] font-mono text-[#64748B] font-semibold hidden sm:block">
            ⌘ K
          </div>
        </div>
      </div>

      {/* Right Controls & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Role Impersonation / Quick Demo Switcher */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setIsRoleSwitcherOpen(!isRoleSwitcherOpen)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#FAF8F5] hover:bg-[#F5F3FF] text-[#0F172A] border border-[#E8E4DF] transition-colors shadow-2xs"
            title="Switch demo account role"
          >
            <UserCheck size={14} className="text-[#6D28D9]" />
            <span className="hidden sm:inline text-[#64748B]">Role:</span>
            <span className="font-bold text-[#0F172A]">
              {currentRoleLabel}
            </span>
            <ChevronDown size={13} className="text-[#64748B]" />
          </button>

          {isRoleSwitcherOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white p-2.5 shadow-xl border border-[#E8E4DF] z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-[#E8E4DF]">
                <p className="text-xs font-bold text-[#0F172A]">
                  Switch Demo Persona
                </p>
                <p className="text-[11px] font-medium text-[#64748B]">
                  Test isolated role-based views
                </p>
              </div>
              <div className="py-1 max-h-72 overflow-y-auto space-y-1">
                {demoAccounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => {
                      loginAsDemo(account.id);
                      setIsRoleSwitcherOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      account.role === role
                        ? 'bg-[#F5F3FF] text-[#6D28D9] font-bold border border-[#DDD6FE]'
                        : 'hover:bg-[#FAF8F5] text-[#0F172A]'
                    }`}
                  >
                    <div className="flex flex-col truncate pr-2">
                      <span className="font-bold text-[#0F172A] truncate">{account.name}</span>
                      <span className="text-[10px] text-[#64748B] truncate">
                        {account.badge}
                      </span>
                    </div>
                    <span className="px-1.5 py-0.5 text-[9px] rounded-md bg-[#FAF8F5] border border-[#E8E4DF] text-[#6D28D9] uppercase font-mono font-bold shrink-0">
                      {account.roleLabel}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-white border border-[#E8E4DF] hover:bg-[#FAF8F5] text-[#64748B] hover:text-[#0F172A] transition-colors"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} theme`}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-white border border-[#E8E4DF] hover:bg-[#FAF8F5] text-[#64748B] hover:text-[#0F172A] transition-colors hidden md:flex items-center justify-center"
          title="Toggle Fullscreen"
          aria-label="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>

        {/* Notification Bell Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(true)}
            className="p-2 rounded-xl bg-white border border-[#E8E4DF] hover:bg-[#FAF8F5] text-[#64748B] hover:text-[#0F172A] relative transition-colors cursor-pointer"
            aria-label="Open Notifications"
            title="Notifications & Circulars"
          >
            <Bell size={16} className="text-[#6D28D9]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#6D28D9] text-white text-[10px] font-extrabold flex items-center justify-center shadow-2xs">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Dedicated Slide-out Notification Column / Drawer */}
        <NotificationColumn
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          unreadCount={unreadCount}
          onMarkAllRead={() => setUnreadCount(0)}
        />

        {/* User Profile Pill & Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 pl-2 rounded-xl bg-white hover:bg-[#FAF8F5] transition-all border border-[#E8E4DF]"
          >
            <div className="w-7 h-7 rounded-lg bg-[#F5F3FF] border border-[#DDD6FE] text-[#6D28D9] flex items-center justify-center text-xs font-bold shadow-2xs">
              {userInitials}
            </div>
            <div className="hidden lg:flex flex-col text-left pr-1">
              <span className="text-xs font-bold text-[#0F172A] leading-tight">
                {user?.profile.full_name || 'Aarav Patel'}
              </span>
              <span className="text-[10px] text-[#64748B] font-medium leading-tight">
                {currentRoleLabel}
              </span>
            </div>
            <ChevronDown size={13} className="text-[#64748B]" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-2.5 shadow-xl border border-[#E8E4DF] animate-in fade-in zoom-in-95 duration-100 z-50">
              <div className="px-3 py-2 border-b border-[#E8E4DF]">
                <p className="text-sm font-bold text-[#0F172A] truncate">
                  {user?.profile.full_name}
                </p>
                <p className="text-xs text-[#64748B] truncate">
                  {user?.email}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#64748B]">
                  <Building size={13} className="text-[#6D28D9]" />
                  <span className="truncate">{user?.institution.name}</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                >
                  <LogOut size={14} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
