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
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#232F25] dark:text-[#F0F5F1] tracking-tight">
            Institutional Notices & Broadcasts
          </h1>
          <p className="text-xs md:text-sm text-[#667768] dark:text-[#9FB1A2] mt-0.5">
            Administrative announcements, academic alerts, and parent circulars
          </p>
        </div>

        {canPublish && (
          <button
            onClick={() => setModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#DA5FCE] text-white hover:bg-[#C64EBA] transition-colors shadow-sm flex items-center gap-1.5 self-start md:self-auto"
          >
            <Plus size={15} />
            <span>Publish New Notice</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notices.map((n) => (
          <div
            key={n.id}
            className="rounded-2xl glass-card p-5 border border-white/70 dark:border-white/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    n.priority === 'urgent'
                      ? 'bg-[#E57373]/20 text-[#A63C3C]'
                      : 'bg-[#8DA390]/20 text-[#2B3B2E] dark:text-[#E2ECE4]'
                  }`}
                >
                  {n.priority} Notice
                </span>
                <span className="text-[11px] text-[#7A8A7C]">
                  {new Date(n.published_at).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-base font-bold text-[#232F25] dark:text-[#F0F5F1] mt-2">
                {n.title}
              </h3>
              <p className="text-xs text-[#526354] dark:text-[#A0B0A3] mt-2 leading-relaxed">
                {n.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <form
            onSubmit={handleCreateNotice}
            className="max-w-md w-full p-6 rounded-3xl glass-panel border border-white/80 dark:border-white/10 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-[#232F25] dark:text-[#F0F5F1]">
              Publish Institutional Notice
            </h3>

            <div>
              <label className="block text-xs font-semibold mb-1">Notice Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Schedule for Sports Day"
                className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Detailed Circular</label>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Full notice message to be sent to portal feeds..."
                className="w-full p-2.5 rounded-xl text-xs glass-input"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'normal' | 'urgent')}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white/70 dark:bg-black/20 border border-[#8DA390]/30"
              >
                <option value="normal">Normal Priority</option>
                <option value="urgent">Urgent / Important Alert</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-[#566859]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-[#DA5FCE] hover:bg-[#C64EBA]"
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
