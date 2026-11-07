import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  X,
  CheckCheck,
  Megaphone,
  ArrowRight,
} from 'lucide-react';
import { DEMO_NOTICES } from '../../services/mockData';

interface NotificationColumnProps {
  isOpen: boolean;
  onClose: () => void;
  unreadCount?: number;
  onMarkAllRead?: () => void;
}

export const NotificationColumn: React.FC<NotificationColumnProps> = ({
  isOpen,
  onClose,
  onMarkAllRead,
}) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'urgent' | 'academic' | 'circulars'>('all');
  const [notices, setNotices] = useState(
    DEMO_NOTICES.map((n, idx) => ({
      ...n,
      isRead: idx >= 3,
      timeAgo: idx === 0 ? '10 mins ago' : idx === 1 ? '1 hour ago' : idx === 2 ? '3 hours ago' : 'Yesterday',
    }))
  );

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleMarkAll = () => {
    setNotices((prev) => prev.map((n) => ({ ...n, isRead: true })));
    if (onMarkAllRead) {
      onMarkAllRead();
    }
  };

  const handleItemClick = (id: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const filteredNotices = notices.filter((n) => {
    if (filter === 'urgent') return n.priority === 'urgent';
    if (filter === 'academic') return n.title.toLowerCase().includes('exam') || n.title.toLowerCase().includes('result') || n.content.toLowerCase().includes('academic');
    if (filter === 'circulars') return n.target_audience === 'all' || n.target_audience === 'parents';
    return true;
  });

  const activeUnreadCount = notices.filter((n) => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" aria-modal="true" role="dialog">
      {/* Dimmed Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#0F172A]/30 backdrop-blur-2xs transition-opacity duration-200"
      />

      {/* Slide-out Notification Column / Drawer */}
      <aside className="relative w-full max-w-md bg-white h-full shadow-2xl border-l border-[#E8E4DF] flex flex-col z-10 animate-in slide-in-from-right duration-200 ease-out">
        {/* Column Header */}
        <div className="p-5 border-b border-[#E8E4DF] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] text-[#6D28D9] flex items-center justify-center border border-[#DDD6FE] shadow-2xs">
              <Bell size={18} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#0F172A]">
                  Notifications
                </h2>
                {activeUnreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#6D28D9] text-white">
                    {activeUnreadCount} new
                  </span>
                )}
              </div>
              <p className="text-xs text-[#64748B] font-medium mt-0.5">
                Announcements, deadlines & alerts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#FAF8F5] hover:bg-[#F5F3FF] border border-[#E8E4DF] text-[#64748B] hover:text-[#0F172A] flex items-center justify-center transition-colors font-bold"
            aria-label="Close notifications"
          >
            <X size={16} />
          </button>
        </div>

        {/* Filter tabs & Mark All as Read */}
        <div className="px-5 py-3 border-b border-[#E8E4DF] bg-[#FAF8F5] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            {[
              { id: 'all', label: 'All' },
              { id: 'urgent', label: 'Urgent' },
              { id: 'academic', label: 'Academic' },
              { id: 'circulars', label: 'Circulars' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  filter === t.id
                    ? 'bg-[#6D28D9] text-white shadow-2xs'
                    : 'bg-white text-[#64748B] border border-[#E8E4DF] hover:text-[#0F172A]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {activeUnreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              className="text-[11px] font-bold text-[#6D28D9] hover:underline flex items-center gap-1 shrink-0"
              title="Mark all as read"
            >
              <CheckCheck size={14} />
              <span className="hidden sm:inline">Mark read</span>
            </button>
          )}
        </div>

        {/* Notification Cards List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF8F5]">
          {filteredNotices.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-[#64748B]">
              <div className="w-12 h-12 rounded-xl bg-white text-[#6D28D9] flex items-center justify-center mb-2 border border-[#E8E4DF]">
                <Bell size={20} />
              </div>
              <p className="text-sm font-bold text-[#0F172A]">No notifications</p>
              <p className="text-xs mt-1">You are all caught up with your updates.</p>
            </div>
          ) : (
            filteredNotices.map((notice) => (
              <div
                key={notice.id}
                onClick={() => handleItemClick(notice.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative bg-white ${
                  notice.isRead
                    ? 'border-[#E8E4DF] hover:border-[#DDD6FE]'
                    : 'border-[#DDD6FE] shadow-2xs'
                }`}
              >
                {!notice.isRead && (
                  <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#6D28D9]" />
                )}

                <div className="flex items-center gap-2 mb-1.5 text-xs text-[#64748B]">
                  <span className="font-semibold text-[#6D28D9]">
                    {notice.priority === 'urgent' ? '🚨 Urgent Alert' : '📢 Notice'}
                  </span>
                  <span>·</span>
                  <span>{notice.timeAgo}</span>
                </div>

                <h3 className="text-xs font-bold text-[#0F172A] leading-snug">
                  {notice.title}
                </h3>
                <p className="text-xs text-[#64748B] font-medium mt-1 leading-relaxed line-clamp-2">
                  {notice.content}
                </p>

                <div className="mt-3 pt-2.5 border-t border-[#E8E4DF] flex items-center justify-between text-[11px]">
                  <span className="text-[#94A3B8] font-medium">
                    Target: <strong className="text-[#0F172A] font-semibold uppercase">{notice.target_audience}</strong>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                      navigate('/notices');
                    }}
                    className="font-semibold text-[#6D28D9] hover:underline flex items-center gap-1"
                  >
                    <span>View</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#E8E4DF] bg-white flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => {
              onClose();
              navigate('/notices');
            }}
            className="flex-1 py-2 px-4 rounded-xl text-xs font-semibold text-white bg-[#6D28D9] hover:bg-[#5B21B6] shadow-2xs flex items-center justify-center gap-2 transition-colors"
          >
            <Megaphone size={14} />
            <span>Open Notice Board</span>
          </button>
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl text-xs font-semibold text-[#0F172A] bg-[#FAF8F5] border border-[#E8E4DF] hover:bg-[#F5F3FF] transition-colors"
          >
            Close
          </button>
        </div>
      </aside>
    </div>
  );
};
