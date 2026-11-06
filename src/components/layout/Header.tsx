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
} from 'lucide-react';
import { DEMO_NOTICES } from '../../services/mockData';

interface HeaderProps {
  onSearchClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearchClick }) => {
  const { user, role, demoAccounts, loginAsDemo, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
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
    'User';

  const userInitials =
    user?.profile.full_name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'EX';

  return (
    <header className="sticky top-0 z-20 h-20 px-6 flex items-center justify-between border-b border-white/40 dark:border-white/5 bg-[#FDFCF7]/80 dark:bg-[#1A211B]/80 backdrop-blur-xl">
      {/* Search Input Bar */}
      <div className="flex-1 max-w-md">
        <div
          onClick={onSearchClick}
          className="relative flex items-center w-full cursor-pointer group"
        >
          <Search
            size={18}
            className="absolute left-3.5 text-[#6E7E72] dark:text-[#9BAA9E] group-hover:text-[#465448] transition-colors"
          />
          <input
            type="text"
            readOnly
            placeholder="Search anything... (students, reports, notices)"
            className="w-full pl-10 pr-12 py-2 text-xs md:text-sm font-medium rounded-full glass-input text-[#28382C] dark:text-[#E2ECE4] placeholder-[#7F8F82] cursor-pointer"
          />
          <div className="absolute right-3 px-1.5 py-0.5 rounded bg-white/70 dark:bg-white/10 border border-[#8DA390]/30 text-[10px] font-mono text-[#5B6E5E] dark:text-[#A3B899]">
            ⌘ K
          </div>
        </div>
      </div>

      {/* Action Controls & Profile Bar */}
      <div className="flex items-center gap-3">
        {/* Role Impersonation / Quick Demo Switcher */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setIsRoleSwitcherOpen(!isRoleSwitcherOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#8DA390]/20 hover:bg-[#8DA390]/30 text-[#304133] dark:text-[#D1E0D3] border border-[#8DA390]/30 transition-colors"
            title="Switch demo account role"
          >
            <UserCheck size={14} className="text-[#5B6E5E] dark:text-[#A3B899]" />
            <span className="hidden sm:inline">Role:</span>
            <span className="font-bold text-[#203023] dark:text-[#F0F5F1]">
              {currentRoleLabel}
            </span>
            <ChevronDown size={13} className="opacity-70" />
          </button>

          {isRoleSwitcherOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl glass-panel p-2 shadow-xl border border-white/60 dark:border-white/10 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-black/5 dark:border-white/5">
                <p className="text-xs font-bold text-[#2C3B2E] dark:text-[#E2ECE4]">
                  Development Demo Accounts
                </p>
                <p className="text-[11px] text-[#69796C] dark:text-[#9BAA9E]">
                  Select any persona to test isolated role views
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
                        ? 'bg-[#8DA390]/25 text-[#1E2922] dark:text-[#FFFFFF] font-semibold'
                        : 'hover:bg-black/5 dark:hover:bg-white/5 text-[#425244] dark:text-[#C5D3C6]'
                    }`}
                  >
                    <div className="flex flex-col truncate pr-2">
                      <span className="font-medium truncate">{account.name}</span>
                      <span className="text-[10px] text-[#6E7E72] dark:text-[#8D9C90] truncate">
                        {account.badge}
                      </span>
                    </div>
                    <span className="px-1.5 py-0.5 text-[9px] rounded-md bg-white/70 dark:bg-white/10 border border-[#8DA390]/30 text-[#435345] dark:text-[#C2D8C2] uppercase font-mono shrink-0">
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
          className="p-2 rounded-full glass-card hover:bg-white/90 text-[#4A594D] dark:text-[#C2D8C2] transition-colors"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} theme`}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Fullscreen Toggle Button */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-full glass-card hover:bg-white/90 text-[#4A594D] dark:text-[#C2D8C2] transition-colors hidden md:flex items-center justify-center"
          title="Toggle Fullscreen"
          aria-label="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 rounded-full glass-card hover:bg-white/90 text-[#4A594D] dark:text-[#C2D8C2] relative transition-colors"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E57373] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
              3
            </span>
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel p-3 shadow-xl border border-white/60 dark:border-white/10 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5">
                <span className="text-xs font-bold text-[#2A372C] dark:text-[#E2ECE4]">
                  Recent Notices & Alerts
                </span>
                <span className="text-[10px] text-[#69796C] dark:text-[#9BAA9E]">
                  3 unread
                </span>
              </div>
              <div className="py-2 space-y-2 max-h-64 overflow-y-auto">
                {DEMO_NOTICES.map((notice) => (
                  <div
                    key={notice.id}
                    className="p-2 rounded-xl bg-white/60 dark:bg-white/5 border border-white/40 dark:border-white/5 text-xs"
                  >
                    <p className="font-semibold text-[#28382C] dark:text-[#E2ECE4]">
                      {notice.title}
                    </p>
                    <p className="text-[11px] text-[#556658] dark:text-[#A0B0A3] line-clamp-2 mt-0.5">
                      {notice.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill & Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-full glass-card hover:bg-white/90 transition-all border border-white/80 dark:border-white/10"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4D5E50] to-[#252E27] text-white flex items-center justify-center text-xs font-bold shadow-sm">
              {userInitials}
            </div>
            <div className="hidden lg:flex flex-col text-left pr-1">
              <span className="text-xs font-bold text-[#28382C] dark:text-[#E2ECE4] leading-tight">
                {currentRoleLabel}
              </span>
              <span className="text-[10px] text-[#6F7F72] dark:text-[#97A79A] leading-tight truncate max-w-[110px]">
                {user?.profile.full_name}
              </span>
            </div>
            <ChevronDown size={14} className="text-[#6E7E72] dark:text-[#97A79A]" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-panel p-2 shadow-2xl border border-white/60 dark:border-white/10 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-black/5 dark:border-white/5">
                <p className="text-sm font-bold text-[#253227] dark:text-white truncate">
                  {user?.profile.full_name}
                </p>
                <p className="text-xs text-[#5E6E61] dark:text-[#A3B899] truncate">
                  {user?.email}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#566559] dark:text-[#B4C4B6]">
                  <Building size={13} className="text-[#7D9D85]" />
                  <span className="truncate">{user?.institution.name}</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#D32F2F] hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={15} />
                  <span>Sign out of Edunexa</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
