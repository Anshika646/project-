import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FileSpreadsheet, Calendar, Award, Download, CheckCircle2 } from 'lucide-react';
import { DEMO_UPCOMING_EXAMS } from '../services/mockData';
import { exportToPDF } from '../utils/exportUtils';

export const ExaminationsPage: React.FC = () => {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<'schedule' | 'marks'>('schedule');

  const marksData = [
    { roll: '14', name: 'Aarav Patel', math: 94, sci: 88, eng: 91, total: 273, pct: '91.0%', grade: 'A1' },
    { roll: '15', name: 'Diya Sharma', math: 96, sci: 92, eng: 89, total: 277, pct: '92.3%', grade: 'A1' },
    { roll: '16', name: 'Ishaan Verma', math: 82, sci: 78, eng: 85, total: 245, pct: '81.6%', grade: 'A2' },
  ];

  const handleExportMarks = () => {
    exportToPDF(
      'Annual Examination 2025 — Class 10 Marks Ledger',
      [
        { header: 'Roll', dataKey: 'roll' },
        { header: 'Name', dataKey: 'name' },
        { header: 'Math (100)', dataKey: 'math' },
        { header: 'Sci (100)', dataKey: 'sci' },
        { header: 'Eng (100)', dataKey: 'eng' },
        { header: 'Total (300)', dataKey: 'total' },
        { header: 'Percentage', dataKey: 'pct' },
        { header: 'Grade', dataKey: 'grade' },
      ],
      marksData,
      'Class10_Marks_Ledger.pdf'
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#232F25] dark:text-[#F0F5F1] tracking-tight">
            Examinations & Marks Ledger
          </h1>
          <p className="text-xs md:text-sm text-[#667768] dark:text-[#9FB1A2] mt-0.5">
            Exam schedules, theory/practical grading, and term evaluations
          </p>
        </div>

        <button
          onClick={handleExportMarks}
          className="px-3 py-2 rounded-xl text-xs font-semibold glass-card hover:bg-white/90 text-[#324234] dark:text-[#D1E0D3] border border-white/70 dark:border-white/10 shadow-sm flex items-center gap-1.5 self-start md:self-auto"
        >
          <Download size={14} className="text-[#5B6E5E]" />
          <span>Export Marks Ledger (PDF)</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'schedule'
              ? 'bg-[#5B6E5E] text-white shadow-sm'
              : 'text-[#566859] hover:text-[#232F25]'
          }`}
        >
          Exam Timetable & Schedule
        </button>
        <button
          onClick={() => setActiveTab('marks')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'marks'
              ? 'bg-[#5B6E5E] text-white shadow-sm'
              : 'text-[#566859] hover:text-[#232F25]'
          }`}
        >
          Entered Subject Marks
        </button>
      </div>

      {activeTab === 'schedule' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {DEMO_UPCOMING_EXAMS.map((exam) => (
            <div
              key={exam.id}
              className="rounded-2xl glass-card p-5 border border-white/70 dark:border-white/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#8DA390]/20 text-[#303E33] dark:text-[#D1E0D3]">
                    {exam.class}
                  </span>
                  <span className="text-[10px] font-semibold text-[#A64B56] dark:text-[#E8B4B8]">
                    {exam.inDays}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#232F25] dark:text-[#F0F5F1] mt-2">
                  {exam.subject}
                </h3>
                <p className="text-xs text-[#637466] dark:text-[#95A597]">
                  {exam.type}
                </p>
                <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 text-xs text-[#526354] dark:text-[#A0B0A3] space-y-1">
                  <p>📅 Date: {exam.day} {exam.month} 2025</p>
                  <p>⏰ Time: {exam.time}</p>
                  <p>📍 Location: {exam.room}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl glass-card p-5 border border-white/70 dark:border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/5 text-[#657667] dark:text-[#9FB1A2]">
                  <th className="pb-3 font-semibold">Roll</th>
                  <th className="pb-3 font-semibold">Student Name</th>
                  <th className="pb-3 font-semibold">Math</th>
                  <th className="pb-3 font-semibold">Science</th>
                  <th className="pb-3 font-semibold">English</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Percentage</th>
                  <th className="pb-3 font-semibold">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {marksData.map((m) => (
                  <tr key={m.roll} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 font-mono font-bold text-[#5B6E5E]">#{m.roll}</td>
                    <td className="py-3 font-bold text-[#232F25] dark:text-[#F0F5F1]">{m.name}</td>
                    <td className="py-3 tabular-nums">{m.math}</td>
                    <td className="py-3 tabular-nums">{m.sci}</td>
                    <td className="py-3 tabular-nums">{m.eng}</td>
                    <td className="py-3 tabular-nums font-bold">{m.total}</td>
                    <td className="py-3 tabular-nums font-bold text-[#5B6E5E]">{m.pct}</td>
                    <td className="py-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#8DA390]/20 text-[#253628] dark:text-white">
                        {m.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
