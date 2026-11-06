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
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#171417] tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#F3E8FF] flex items-center justify-center text-[#8B5CF6]">
              <FileText size={22} />
            </div>
            <span>Homework & Assignments</span>
          </h1>
          <p className="text-xs md:text-sm text-[#625C60] mt-1 font-medium">
            Class assignments, question sets, and student submission tracking
          </p>
        </div>

        {isTeacher && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition-colors shadow-sm flex items-center gap-1.5 self-start md:self-auto"
          >
            <Plus size={14} />
            <span>Assign Homework</span>
          </button>
        )}
      </div>

      {toastMessage && (
        <div className="p-4 rounded-2xl bg-[#F5F3FF] border border-[#E9D5FF] text-[#171417] text-xs font-bold flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 size={16} className="text-[#8B5CF6]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Homework Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {homeworkList.map((hw, i) => {
          const isDone = submittedIds.includes(hw.id);
          const sub = subjects.find((s) => s.id === hw.subject_id);

          return (
            <div
              key={hw.id}
              className={`rounded-2xl p-5 border border-[#E9D5FF] shadow-sm flex flex-col justify-between transition-all hover:border-[#8B5CF6]/50 ${
                i % 3 === 0 ? 'bg-[#F5F3FF]' : i % 3 === 1 ? 'bg-[#FAF5FF]' : 'bg-[#FDFBFF]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-white border border-[#E9D5FF] text-[#171417]">
                    {sub?.name || 'Academic Core'}
                  </span>
                  <span className="text-[10px] font-bold text-[#8B5CF6] bg-[#F3E8FF] px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Calendar size={11} />
                    <span>Due: {hw.due_date}</span>
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-[#171417] mt-3">
                  {hw.title}
                </h3>
                <p className="text-xs text-[#625C60] mt-1.5 leading-relaxed line-clamp-3 font-medium">
                  {hw.instructions}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#E9D5FF] flex items-center justify-between">
                <span className="text-[11px] text-[#625C60] font-medium">
                  By: <strong className="text-[#171417]">{hw.created_by}</strong>
                </span>

                {isTeacher ? (
                  <span className="text-xs font-extrabold text-[#8B5CF6]">
                    32 Submissions
                  </span>
                ) : isDone ? (
                  <span className="px-3 py-1 rounded-xl bg-white border border-[#E9D5FF] text-[#171417] text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#8B5CF6]" />
                    <span>Submitted</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleStudentSubmit(hw.id)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition-colors shadow-sm flex items-center gap-1.5"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 border border-[#E9D5FF] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9D5FF]">
              <h3 className="font-extrabold text-lg text-[#171417]">
                Assign Homework Task
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-sm font-bold text-[#625C60] hover:text-[#171417]">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateHomework} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#171417] block mb-1">
                  Subject
                </label>
                <select
                  value={selectedSubId}
                  onChange={(e) => setSelectedSubId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] text-xs font-medium text-[#171417] focus:outline-none focus:border-[#8B5CF6]"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#171417] block mb-1">
                  Assignment Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 6 Exercise Questions 5-10"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] text-xs font-medium text-[#171417] focus:outline-none focus:border-[#8B5CF6]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#171417] block mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] text-xs font-medium text-[#171417] focus:outline-none focus:border-[#8B5CF6]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#171417] block mb-1">
                  Instructions & Guidelines
                </label>
                <textarea
                  rows={3}
                  placeholder="Required format, diagrams to draw, page numbers..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] text-xs font-medium text-[#171417] focus:outline-none focus:border-[#8B5CF6]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#625C60] hover:text-[#171417]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#8B5CF6] text-white hover:bg-[#7C3AED] shadow-sm"
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
