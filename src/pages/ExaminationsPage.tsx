import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  FileSpreadsheet,
  Calendar,
  Award,
  Download,
  CheckCircle2,
  Save,
  Filter,
} from 'lucide-react';
import { examService, calculateCBSEGrade } from '../services/examService';
import { academicService } from '../services/academicService';
import { studentService } from '../services/studentService';
import { exportToPDF } from '../utils/exportUtils';
import { Exam, ClassItem, Subject, Student, Mark } from '../types/database.types';

export const ExaminationsPage: React.FC = () => {
  const { role, user } = useAuth();
  const institutionId = user?.institution?.id || 'e8b070c0-dacd-4772-85df-0ce93748524c';

  const [activeTab, setActiveTab] = useState<'schedule' | 'ledger'>('ledger');
  const [upcomingExams, setUpcomingExams] = useState<any[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // Filter States
  const [selectedClassId, setSelectedClassId] = useState('class-10');
  const [selectedSubjectId, setSelectedSubjectId] = useState('sub-math');

  // Ledger editable rows
  const [ledgerRows, setLedgerRows] = useState<Array<{
    studentId: string;
    roll: string;
    name: string;
    theory: number;
    practical: number;
    internal: number;
    total: number;
    pct: number;
    grade: string;
    remarks: string;
  }>>([]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadMetadata();
  }, [institutionId]);

  useEffect(() => {
    loadLedgerData();
  }, [selectedClassId, selectedSubjectId]);

  const loadMetadata = async () => {
    const exams = await examService.getUpcomingExams(institutionId);
    setUpcomingExams(exams);
    const clsList = await academicService.getClasses(institutionId);
    setClasses(clsList);
    const subList = await academicService.getSubjects(institutionId);
    setSubjects(subList);
  };

  const loadLedgerData = async () => {
    const res = await studentService.getStudents({
      institutionId,
      classId: selectedClassId,
      pageSize: 50,
    });
    setStudents(res.students);

    const allMarks = await examService.getAllMarks();

    const rows = res.students.map((st) => {
      const existing = allMarks.find(
        (m) => m.student_id === st.id && (m.exam_subject_id === 'es-1' || m.exam_subject_id.includes(selectedSubjectId))
      );

      const theory = existing?.theory_marks ?? (st.id === 'stud-aarav-1' ? 74 : st.id === 'stud-diya-2' ? 76 : 68);
      const practical = existing?.practical_marks ?? 20;
      const internal = existing?.internal_marks ?? 0;
      const total = theory + practical + internal;
      const pct = Math.round((total / 100) * 100);
      const grade = calculateCBSEGrade(pct);

      return {
        studentId: st.id,
        roll: st.roll_number || '1',
        name: st.profile?.full_name || 'Student',
        theory,
        practical,
        internal,
        total,
        pct,
        grade,
        remarks: existing?.remarks || 'Good performance',
      };
    });

    setLedgerRows(rows);
  };

  const handleScoreChange = (
    studentId: string,
    field: 'theory' | 'practical' | 'internal' | 'remarks',
    value: string | number
  ) => {
    setLedgerRows((prev) =>
      prev.map((row) => {
        if (row.studentId !== studentId) return row;

        const updated = { ...row, [field]: value };
        if (field !== 'remarks') {
          const t = Number(field === 'theory' ? value : row.theory) || 0;
          const p = Number(field === 'practical' ? value : row.practical) || 0;
          const i = Number(field === 'internal' ? value : row.internal) || 0;
          updated.total = t + p + i;
          updated.pct = Math.round((updated.total / 100) * 100);
          updated.grade = calculateCBSEGrade(updated.pct);
        }
        return updated;
      })
    );
  };

  const handleSaveLedger = async () => {
    const marksToSave = ledgerRows.map((r) => ({
      institution_id: institutionId,
      exam_subject_id: `es-${selectedSubjectId}`,
      student_id: r.studentId,
      theory_marks: r.theory,
      practical_marks: r.practical,
      internal_marks: r.internal,
      total_marks: r.total,
      grade: r.grade,
      is_absent: false,
      remarks: r.remarks,
      graded_by: user?.id || 'user-teacher-1',
    }));

    await examService.saveBatchMarks(marksToSave);
    setToastMessage('Evaluation ledger saved successfully to institution records!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportMarks = () => {
    const activeSub = subjects.find((s) => s.id === selectedSubjectId);
    const activeCls = classes.find((c) => c.id === selectedClassId);

    exportToPDF(
      `${activeCls?.name || 'Class 10'} — ${activeSub?.name || 'Mathematics'} Official Evaluation Ledger`,
      [
        { header: 'Roll', dataKey: 'roll' },
        { header: 'Student Name', dataKey: 'name' },
        { header: 'Theory (80)', dataKey: 'theory' },
        { header: 'Practical (20)', dataKey: 'practical' },
        { header: 'Total (100)', dataKey: 'total' },
        { header: 'Percentage', dataKey: 'pct' },
        { header: 'CBSE Grade', dataKey: 'grade' },
        { header: 'Teacher Remarks', dataKey: 'remarks' },
      ],
      ledgerRows.map((r) => ({
        roll: r.roll,
        name: r.name,
        theory: r.theory,
        practical: r.practical,
        total: r.total,
        pct: `${r.pct}%`,
        grade: r.grade,
        remarks: r.remarks,
      })),
      `${activeCls?.name || 'Class'}_Marks_Ledger.pdf`
    );
    setToastMessage('Marks ledger PDF exported successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const canEdit = ['teacher', 'school_admin', 'college_faculty', 'college_admin'].includes(role || '');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#232F25] dark:text-[#F0F5F1] tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="text-[#DA5FCE]" size={28} />
            <span>Examinations & Marks Ledger</span>
          </h1>
          <p className="text-xs md:text-sm text-[#667768] dark:text-[#9FB1A2] mt-0.5">
            Theory & practical marks entry, automatic 9-point CBSE/ICSE grade grading, and schedules
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {canEdit && activeTab === 'ledger' && (
            <button
              onClick={handleSaveLedger}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#DA5FCE] text-white hover:bg-[#C64EBA] transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Save size={14} />
              <span>Save Marks</span>
            </button>
          )}

          <button
            onClick={handleExportMarks}
            className="px-3 py-2 rounded-xl text-xs font-semibold glass-card hover:bg-white/90 text-[#324234] dark:text-[#D1E0D3] border border-white/70 dark:border-white/10 shadow-sm flex items-center gap-1.5"
          >
            <Download size={14} className="text-[#DA5FCE]" />
            <span>Export Ledger (PDF)</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-[#8DA390]/20 border border-[#8DA390]/40 text-[#213123] dark:text-[#E2ECE4] text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 size={16} className="text-[#DA5FCE]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ledger'
              ? 'bg-[#DA5FCE] text-white shadow-sm'
              : 'text-[#566859] hover:bg-black/5'
          }`}
        >
          Subject Marks Entry Ledger
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'schedule'
              ? 'bg-[#DA5FCE] text-white shadow-sm'
              : 'text-[#566859] hover:bg-black/5'
          }`}
        >
          Exam Timetable & Schedule
        </button>
      </div>

      {/* LEDGER TAB */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          {/* Class & Subject Selector Filter */}
          <div className="p-4 rounded-2xl glass-card border border-white/70 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#DA5FCE]">Class:</span>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl glass-input text-xs font-bold"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#DA5FCE]">Subject:</span>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl glass-input text-xs font-bold"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <span className="text-xs text-[#718273]">
              Evaluation Scale: 80 Theory + 20 Practical = 100 Marks
            </span>
          </div>

          {/* Editable Ledger Table */}
          <div className="rounded-3xl glass-panel overflow-hidden border border-white/70 dark:border-white/10 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/[0.02] text-[#667768] font-semibold border-b border-black/5">
                  <tr>
                    <th className="p-3.5 pl-6">Roll #</th>
                    <th className="p-3.5">Student Name</th>
                    <th className="p-3.5">Theory (Max 80)</th>
                    <th className="p-3.5">Practical (Max 20)</th>
                    <th className="p-3.5">Total (100)</th>
                    <th className="p-3.5">Percentage</th>
                    <th className="p-3.5">Grade</th>
                    <th className="p-3.5 pr-6">Teacher Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {ledgerRows.map((row) => (
                    <tr key={row.studentId} className="hover:bg-white/40 transition-colors">
                      <td className="p-3.5 pl-6 font-mono font-bold text-[#232F25]">
                        {row.roll}
                      </td>
                      <td className="p-3.5 font-bold text-[#232F25]">{row.name}</td>
                      <td className="p-3.5">
                        {canEdit ? (
                          <input
                            type="number"
                            min={0}
                            max={80}
                            value={row.theory}
                            onChange={(e) =>
                              handleScoreChange(row.studentId, 'theory', Number(e.target.value))
                            }
                            className="w-16 px-2 py-1 rounded-lg glass-input text-xs font-bold"
                          />
                        ) : (
                          <span>{row.theory}</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        {canEdit ? (
                          <input
                            type="number"
                            min={0}
                            max={20}
                            value={row.practical}
                            onChange={(e) =>
                              handleScoreChange(row.studentId, 'practical', Number(e.target.value))
                            }
                            className="w-16 px-2 py-1 rounded-lg glass-input text-xs font-bold"
                          />
                        ) : (
                          <span>{row.practical}</span>
                        )}
                      </td>
                      <td className="p-3.5 font-bold text-[#232F25]">{row.total}</td>
                      <td className="p-3.5 font-bold text-[#DA5FCE]">{row.pct}%</td>
                      <td className="p-3.5">
                        <span className="font-mono font-bold px-2 py-0.5 rounded bg-[#8DA390]/25 text-[#253A27]">
                          {row.grade}
                        </span>
                      </td>
                      <td className="p-3.5 pr-6">
                        {canEdit ? (
                          <input
                            type="text"
                            value={row.remarks}
                            onChange={(e) =>
                              handleScoreChange(row.studentId, 'remarks', e.target.value)
                            }
                            className="w-full px-2 py-1 rounded-lg glass-input text-xs"
                          />
                        ) : (
                          <span>{row.remarks}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE TAB */}
      {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {upcomingExams.map((exam) => (
            <div
              key={exam.id}
              className="rounded-3xl glass-card p-5 border border-white/70 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#8DA390]/20 text-[#303E33]">
                    {exam.class}
                  </span>
                  <span className="text-[10px] font-semibold text-[#A64B56]">
                    {exam.inDays}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#232F25] mt-2">{exam.subject}</h3>
                <p className="text-xs text-[#637466]">{exam.type}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-xs text-[#718273]">
                <span>{exam.time}</span>
                <span>{exam.room}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
