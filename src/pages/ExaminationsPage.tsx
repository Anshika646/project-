import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Save,
} from 'lucide-react';
import { examService, calculateCBSEGrade } from '../services/examService';
import { academicService } from '../services/academicService';
import { studentService } from '../services/studentService';
import { exportToPDF } from '../utils/exportUtils';
import { ClassItem, Subject, Student } from '../types/database.types';

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
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="text-[#6D28D9]" size={28} />
            <span>Examinations & Marks Ledger</span>
          </h1>
          <p className="text-xs md:text-sm font-semibold text-[#64748B] mt-0.5">
            Theory & practical marks entry, automatic 9-point CBSE/ICSE grading, and schedules
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {canEdit && activeTab === 'ledger' && (
            <button
              onClick={handleSaveLedger}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#6D28D9] text-white hover:bg-[#5B21B6] transition-all shadow-xs flex items-center gap-1.5"
            >
              <Save size={14} />
              <span>Save Marks</span>
            </button>
          )}

          <button
            onClick={handleExportMarks}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FAF8F5] hover:bg-[#FFFFFF] text-[#0F172A] border border-[#E8E4DF] shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Download size={14} className="text-[#6D28D9]" />
            <span>Export Ledger (PDF)</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#DDD6FE] text-[#0F172A] text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={16} className="text-[#6D28D9]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8E4DF] pb-2">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ledger'
              ? 'bg-[#6D28D9] text-white shadow-xs'
              : 'bg-[#FAF8F5] text-[#0F172A] hover:bg-[#FFFFFF] border border-[#E8E4DF]'
          }`}
        >
          Subject Marks Entry Ledger
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'schedule'
              ? 'bg-[#6D28D9] text-white shadow-xs'
              : 'bg-[#FAF8F5] text-[#0F172A] hover:bg-[#FFFFFF] border border-[#E8E4DF]'
          }`}
        >
          Exam Timetable & Schedule
        </button>
      </div>

      {/* LEDGER TAB */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          {/* Class & Subject Selector Filter in Cream Pink */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DF] flex flex-wrap items-center justify-between gap-4 shadow-xs">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-[#0F172A]">Class:</span>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-[#0F172A]">Subject:</span>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <span className="text-xs font-bold text-[#6D28D9] bg-[#FFFFFF] px-3 py-1 rounded-xl">
              Evaluation Scale: 80 Theory + 20 Practical = 100 Marks
            </span>
          </div>

          {/* Editable Ledger Table */}
          <div className="rounded-2xl bg-white overflow-hidden border border-[#E8E4DF] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-[#0F172A] font-extrabold border-b border-[#E8E4DF]">
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
                <tbody className="divide-y divide-[#E8E4DF]">
                  {ledgerRows.map((row) => (
                    <tr key={row.studentId} className="hover:bg-[#FFFFFF]/60 transition-colors">
                      <td className="p-3.5 pl-6 font-stat font-bold text-[#0F172A]">
                        {row.roll}
                      </td>
                      <td className="p-3.5 font-extrabold text-[#0F172A]">{row.name}</td>
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
                            className="w-16 px-2.5 py-1 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-stat font-extrabold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                          />
                        ) : (
                          <span className="font-stat font-bold text-[#0F172A]">{row.theory}</span>
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
                            className="w-16 px-2.5 py-1 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-stat font-extrabold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                          />
                        ) : (
                          <span className="font-stat font-bold text-[#0F172A]">{row.practical}</span>
                        )}
                      </td>
                      <td className="p-3.5 font-stat font-extrabold text-[#0F172A]">{row.total}</td>
                      <td className="p-3.5 font-stat font-extrabold text-[#6D28D9]">{row.pct}%</td>
                      <td className="p-3.5">
                        <span className="font-stat font-extrabold px-2.5 py-0.5 rounded-md bg-[#FFFFFF] text-[#6D28D9]">
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
                            className="w-full px-2.5 py-1 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                          />
                        ) : (
                          <span className="font-semibold text-[#64748B]">{row.remarks}</span>
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
          {upcomingExams.map((exam, idx) => {
            const cardBg = idx % 2 === 0 ? 'bg-[#FFFFFF]' : 'bg-[#FAF8F5]';
            return (
              <div
                key={exam.id}
                className={`rounded-2xl ${cardBg} p-5 border border-[#E8E4DF] shadow-[0_4px_20px_-4px_rgba(15, 23, 42, 0.03)] flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-white text-[#6D28D9] border border-[#E8E4DF]">
                      {exam.class}
                    </span>
                    <span className="text-[10px] font-extrabold text-[#6D28D9] bg-[#FFFFFF] px-2 py-0.5 rounded-md">
                      {exam.inDays}
                    </span>
                  </div>
                  <h3 className="font-heading text-base font-extrabold text-[#0F172A] mt-3">{exam.subject}</h3>
                  <p className="text-xs font-semibold text-[#64748B]">{exam.type}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E8E4DF] flex items-center justify-between text-xs font-bold text-[#0F172A]">
                  <span>{exam.time}</span>
                  <span className="text-[#6D28D9]">{exam.room}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
