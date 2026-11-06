import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Send,
  Sparkles,
} from 'lucide-react';
import { learningService } from '../services/learningService';
import { academicService } from '../services/academicService';
import { HomeworkItem, Subject } from '../types/database.types';

export const HomeworkPage: React.FC = () => {
  const { role, user } = useAuth();
  const institutionId = user?.institution?.id || 'e8b070c0-dacd-4772-85df-0ce93748524c';

  const [homeworkList, setHomeworkList] = useState<HomeworkItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [selectedSubId, setSelectedSubId] = useState('sub-math');
  const [dueDate, setDueDate] = useState('2025-04-25');

  // Student submission state
  const [submittedIds, setSubmittedIds] = useState<string[]>(['hw-1']);

  useEffect(() => {
    loadData();
  }, [institutionId]);

  const loadData = async () => {
    const list = await learningService.getHomework(institutionId);
    setHomeworkList(list);
    const subs = await academicService.getSubjects(institutionId);
    setSubjects(subs);
  };

  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    await learningService.addHomework({
      institution_id: institutionId,
      class_id: 'class-10',
      section_id: 'sec-class10-a',
      subject_id: selectedSubId,
      title,
      instructions,
      due_date: dueDate,
      created_by: user?.profile?.full_name || 'Ms. Priya Verma',
    });

    await loadData();
    setIsModalOpen(false);
    setTitle('');
    setInstructions('');
    setToastMessage('Homework assigned to Class 10-A students!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStudentSubmit = (hwId: string) => {
    setSubmittedIds((prev) => [...prev, hwId]);
    setToastMessage('Homework response submitted successfully for teacher review!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const isTeacher = ['teacher', 'school_admin', 'college_faculty', 'college_admin'].includes(role || '');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#232F25] dark:text-[#F0F5F1] tracking-tight flex items-center gap-2">
            <FileText className="text-[#DA5FCE]" size={28} />
            <span>Homework & Assignments</span>
          </h1>
          <p className="text-xs md:text-sm text-[#667768] dark:text-[#9FB1A2] mt-0.5">
            Class assignments, question sets, and student submission tracking
          </p>
        </div>

        {isTeacher && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#DA5FCE] text-white hover:bg-[#C64EBA] transition-colors shadow-sm flex items-center gap-1.5 self-start md:self-auto"
          >
            <Plus size={14} />
            <span>Assign Homework</span>
          </button>
        )}
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-[#8DA390]/20 border border-[#8DA390]/40 text-[#213123] dark:text-[#E2ECE4] text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 size={16} className="text-[#DA5FCE]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Homework Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {homeworkList.map((hw) => {
          const isDone = submittedIds.includes(hw.id);
          const sub = subjects.find((s) => s.id === hw.subject_id);

          return (
            <div
              key={hw.id}
              className="rounded-3xl glass-card p-5 border border-white/70 dark:border-white/10 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#8DA390]/20 text-[#303E33] dark:text-[#D1E0D3]">
                    {sub?.name || 'Academic Core'}
                  </span>
                  <span className="text-[10px] font-semibold text-[#8C3B44] dark:text-[#F4C7CB] flex items-center gap-1">
                    <Calendar size={11} />
                    <span>Due: {hw.due_date}</span>
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-[#232F25] dark:text-[#F0F5F1] mt-2.5">
                  {hw.title}
                </h3>
                <p className="text-xs text-[#637466] dark:text-[#95A597] mt-1.5 leading-relaxed line-clamp-3">
                  {hw.instructions}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-[#718273]">
                  By: {hw.created_by}
                </span>

                {isTeacher ? (
                  <span className="text-xs font-bold text-[#DA5FCE]">
                    32 Submissions
                  </span>
                ) : isDone ? (
                  <span className="px-3 py-1 rounded-lg bg-[#8DA390]/25 text-[#253928] text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-[#DA5FCE]" />
                    <span>Submitted</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleStudentSubmit(hw.id)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#DA5FCE] text-white hover:bg-[#C64EBA] transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <Send size={12} />
                    <span>Submit</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-white/80 dark:border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <h3 className="font-extrabold text-lg text-[#232F25] dark:text-[#F0F5F1]">
                Assign Homework Task
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-xs text-[#667768]">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateHomework} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#C64EBA] block mb-1">
                  Subject
                </label>
                <select
                  value={selectedSubId}
                  onChange={(e) => setSelectedSubId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#C64EBA] block mb-1">
                  Assignment Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 6 Exercise Questions 5-10"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#C64EBA] block mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#C64EBA] block mb-1">
                  Instructions & Guidelines
                </label>
                <textarea
                  rows={3}
                  placeholder="Required format, diagrams to draw, page numbers..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#DA5FCE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#DA5FCE] text-white hover:bg-[#C64EBA]"
                >
                  Assign to Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
