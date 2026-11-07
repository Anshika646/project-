import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Megaphone, Plus, Calendar, CheckCircle2 } from 'lucide-react';
import { DEMO_NOTICES } from '../services/mockData';

export const NoticesPage: React.FC = () => {
  const { role } = useAuth();
  const [notices, setNotices] = useState(DEMO_NOTICES);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');

  const canPublish = ['school_admin', 'teacher', 'college_admin', 'super_admin'].includes(role || '');

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    const newNotice = {
      id: `not-${Date.now()}`,
      institution_id: notices[0].institution_id,
      title,
      content,
      target_audience: 'all' as const,
      priority,
      published_at: new Date().toISOString(),
      created_by: 'current-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setNotices([newNotice, ...notices]);
    setModalOpen(false);
    setTitle('');
    setContent('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FFFFFF] flex items-center justify-center text-[#6D28D9]">
              <Megaphone size={22} />
            </div>
            <span>Institutional Notices & Broadcasts</span>
          </h1>
          <p className="text-xs md:text-sm text-[#64748B] mt-1 font-medium">
            Administrative announcements, academic alerts, and parent circulars
          </p>
        </div>

        {canPublish && (
          <button
            onClick={() => setModalOpen(true)}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#6D28D9] text-white hover:bg-[#5B21B6] transition-colors shadow-sm flex items-center gap-1.5 self-start md:self-auto"
          >
            <Plus size={15} />
            <span>Publish New Notice</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notices.map((n, i) => (
          <div
            key={n.id}
            className={`rounded-2xl p-6 border border-[#E8E4DF] shadow-sm flex flex-col justify-between transition-all hover:border-[#6D28D9]/50 ${
              i % 3 === 0 ? 'bg-[#FFFFFF]' : i % 3 === 1 ? 'bg-[#FAF8F5]' : 'bg-[#FFFFFF]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                    n.priority === 'urgent'
                      ? 'bg-[#FFFFFF] text-[#6D28D9] border-[#6D28D9]/40'
                      : 'bg-white text-[#0F172A] border-[#E8E4DF]'
                  }`}
                >
                  {n.priority} Notice
                </span>
                <span className="text-xs font-bold text-[#64748B]">
                  {new Date(n.published_at).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-lg font-extrabold text-[#0F172A] mt-3">
                {n.title}
              </h3>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed font-medium">
                {n.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form
            onSubmit={handleCreateNotice}
            className="max-w-md w-full p-6 rounded-3xl bg-white border border-[#E8E4DF] shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DF]">
              <h3 className="text-lg font-extrabold text-[#0F172A]">
                Publish Institutional Notice
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-sm font-bold text-[#64748B] hover:text-[#0F172A]"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">Notice Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Schedule for Sports Day"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium bg-[#FAF8F5] border border-[#E8E4DF] text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">Detailed Circular</label>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Full notice message to be sent to portal feeds..."
                className="w-full p-3 rounded-xl text-xs font-medium bg-[#FAF8F5] border border-[#E8E4DF] text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'normal' | 'urgent')}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium bg-[#FAF8F5] border border-[#E8E4DF] text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
              >
                <option value="normal">Normal Priority</option>
                <option value="urgent">Urgent / Important Alert</option>
              </select>
            </div>

            <div className="flex items-center gap-2.5 pt-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-[#64748B] hover:text-[#0F172A]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] shadow-sm"
              >
                Publish Notice
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
