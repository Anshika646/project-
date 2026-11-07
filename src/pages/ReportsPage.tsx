import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Award,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Printer,
  Sparkles,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';
import { studentService } from '../services/studentService';
import { academicService } from '../services/academicService';
import { examService } from '../services/examService';
import { Student, ClassItem } from '../types/database.types';

export const ReportsPage: React.FC = () => {
  const { role, user } = useAuth();
  const institutionId = user?.institution?.id || 'e8b070c0-dacd-4772-85df-0ce93748524c';

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('class-10');
  const [selectedStudentId, setSelectedStudentId] = useState('stud-aarav-1');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [institutionId]);

  useEffect(() => {
    loadStudents();
  }, [selectedClassId]);

  const loadData = async () => {
    const clsList = await academicService.getClasses(institutionId);
    setClasses(clsList);
  };

  const loadStudents = async () => {
    const res = await studentService.getStudents({
      institutionId,
      classId: selectedClassId,
      pageSize: 50,
    });
    setStudents(res.students);
    if (res.students.length > 0) {
      setSelectedStudentId(res.students[0].id);
    }
  };

  const activeStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const activeClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  // Individual Report Card PDF Generator
  const handleGenerateIndividualReportCard = () => {
    if (!activeStudent) return;

    const subjectsMarks = [
      { subject: 'Mathematics (Standard)', code: 'MTH-10', max: 100, theory: 74, practical: 20, total: 94, grade: 'A1' },
      { subject: 'Science (Theory & Lab)', code: 'SCI-10', max: 100, theory: 70, practical: 18, total: 88, grade: 'A2' },
      { subject: 'English Language & Lit', code: 'ENG-10', max: 100, theory: 76, practical: 15, total: 91, grade: 'A1' },
      { subject: 'Social Sciences', code: 'SST-10', max: 100, theory: 72, practical: 16, total: 88, grade: 'A2' },
      { subject: 'Information Technology', code: 'CS-10', max: 100, theory: 48, practical: 47, total: 95, grade: 'A1' },
    ];

    exportToPDF(
      `SPRINGFIELD INTERNATIONAL SCHOOL — ANNUAL PROGRESS REPORT CARD`,
      [
        { header: 'Subject & Code', dataKey: 'subject' },
        { header: 'Theory (80)', dataKey: 'theory' },
        { header: 'Practical (20)', dataKey: 'practical' },
        { header: 'Total Marks (100)', dataKey: 'total' },
        { header: 'CBSE Grade', dataKey: 'grade' },
      ],
      subjectsMarks,
      `ReportCard_${activeStudent.profile?.full_name?.replace(/\s+/g, '_') || 'Student'}.pdf`
    );

    setToastMessage(`Official Report Card for ${activeStudent.profile?.full_name} generated successfully!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Class-wide Report Card Ledger PDF Generator
  const handleGenerateClassReportCards = () => {
    exportToPDF(
      `SPRINGFIELD INTERNATIONAL SCHOOL — ${activeClass?.name || 'Class 10'} CUMULATIVE TERM LEDGER`,
      [
        { header: 'Roll', dataKey: 'roll' },
        { header: 'Student Name', dataKey: 'name' },
        { header: 'Admission #', dataKey: 'adm' },
        { header: 'Grand Total (500)', dataKey: 'total' },
        { header: 'Percentage', dataKey: 'pct' },
        { header: 'Final Grade', dataKey: 'grade' },
        { header: 'Attendance %', dataKey: 'att' },
        { header: 'Remarks', dataKey: 'remarks' },
      ],
      students.map((st, idx) => ({
        roll: st.roll_number || String(idx + 1),
        name: st.profile?.full_name || 'Student',
        adm: st.admission_number,
        total: idx === 0 ? '456' : idx === 1 ? '468' : '422',
        pct: idx === 0 ? '91.2%' : idx === 1 ? '93.6%' : '84.4%',
        grade: idx === 0 ? 'A1' : idx === 1 ? 'A1' : 'A2',
        att: idx === 0 ? '94%' : idx === 1 ? '96%' : '88%',
        remarks: idx === 0 ? 'Exemplary reasoning' : 'Diligent learner',
      })),
      `${activeClass?.name || 'Class'}_Cumulative_Ledger.pdf`
    );

    setToastMessage(`Class-wide report ledger for ${activeClass?.name} generated!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FFFFFF] flex items-center justify-center text-[#6D28D9]">
              <Award size={22} />
            </div>
            <span>Official Report Cards & Progress Reports</span>
          </h1>
          <p className="text-xs md:text-sm text-[#64748B] mt-1 font-medium">
            Downloadable print-ready term report cards, grading sheets, and institutional transcripts
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={handleGenerateClassReportCards}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#FAF8F5] hover:bg-[#FFFFFF] text-[#0F172A] border border-[#E8E4DF] shadow-sm flex items-center gap-1.5"
          >
            <Download size={14} className="text-[#6D28D9]" />
            <span>Class Ledger (PDF)</span>
          </button>

          <button
            onClick={handleGenerateIndividualReportCard}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#6D28D9] text-white hover:bg-[#5B21B6] transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Printer size={14} />
            <span>Print Student Report Card</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E8E4DF] text-[#0F172A] text-xs font-bold flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 size={16} className="text-[#6D28D9]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Class & Student Selector Controls */}
      <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DF] flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#0F172A]">Select Class:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.stage})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#0F172A]">Select Student:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.profile?.full_name} (Roll #{s.roll_number})
                </option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-xs font-bold text-[#64748B]">
          Curriculum Standards: CBSE 9-Point Grading Scale (A1 to E)
        </span>
      </div>

      {/* Report Card Preview Layout */}
      {activeStudent && (
        <div className="bg-[#FFFFFF] p-6 sm:p-10 rounded-3xl border border-[#E8E4DF] shadow-sm space-y-6 max-w-4xl mx-auto">
          {/* Institutional Header */}
          <div className="text-center border-b border-[#E8E4DF] pb-6 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6D28D9]">
              Annual Evaluation Dossier • Academic Session 2025–2026
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Springfield International School
            </h2>
            <p className="text-xs text-[#64748B] font-medium">
              Plot 14, Institutional Area, Sector 5, Vasant Kunj, New Delhi • Affiliated to CBSE
            </p>
          </div>

          {/* Student Dossier Information Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-white border border-[#E8E4DF] text-xs shadow-sm">
            <div>
              <span className="text-[#64748B] font-bold block text-[10px] uppercase">Student Name:</span>
              <strong className="text-[#0F172A] text-sm font-extrabold">{activeStudent.profile?.full_name}</strong>
            </div>
            <div>
              <span className="text-[#64748B] font-bold block text-[10px] uppercase">Admission No:</span>
              <span className="font-mono font-bold text-[#0F172A]">{activeStudent.admission_number}</span>
            </div>
            <div>
              <span className="text-[#64748B] font-bold block text-[10px] uppercase">Class & Section:</span>
              <span className="font-bold text-[#0F172A]">{activeClass?.name} - Section A</span>
            </div>
            <div>
              <span className="text-[#64748B] font-bold block text-[10px] uppercase">Roll Number:</span>
              <span className="font-mono font-extrabold text-[#6D28D9]">{activeStudent.roll_number}</span>
            </div>
          </div>

          {/* Marks Breakdown Table */}
          <div className="overflow-hidden rounded-2xl border border-[#E8E4DF] bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#0F172A] font-extrabold border-b border-[#E8E4DF]">
                <tr>
                  <th className="p-3.5 pl-4">Scholastic Subject</th>
                  <th className="p-3.5 text-center">Theory (80)</th>
                  <th className="p-3.5 text-center">Practical (20)</th>
                  <th className="p-3.5 text-center">Total (100)</th>
                  <th className="p-3.5 text-center pr-4">CBSE Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E4DF]">
                <tr>
                  <td className="p-3.5 pl-4 font-bold text-[#0F172A]">Mathematics (Standard)</td>
                  <td className="p-3.5 text-center font-mono font-medium text-[#0F172A]">74</td>
                  <td className="p-3.5 text-center font-mono font-medium text-[#0F172A]">20</td>
                  <td className="p-3.5 text-center font-extrabold text-[#6D28D9]">94</td>
                  <td className="p-3.5 text-center pr-4 font-extrabold text-[#0F172A]">A1</td>
                </tr>
                <tr>
                  <td className="p-3.5 pl-4 font-bold text-[#0F172A]">Science (Physics, Chem, Bio)</td>
                  <td className="p-3.5 text-center font-mono font-medium text-[#0F172A]">70</td>
                  <td className="p-3.5 text-center font-mono font-medium text-[#0F172A]">18</td>
                  <td className="p-3.5 text-center font-extrabold text-[#6D28D9]">88</td>
                  <td className="p-3.5 text-center pr-4 font-extrabold text-[#0F172A]">A2</td>
                </tr>
                <tr>
                  <td className="p-3.5 pl-4 font-bold text-[#0F172A]">English Language & Literature</td>
                  <td className="p-3.5 text-center font-mono font-medium text-[#0F172A]">76</td>
                  <td className="p-3.5 text-center font-mono font-medium text-[#0F172A]">15</td>
                  <td className="p-3.5 text-center font-extrabold text-[#6D28D9]">91</td>
                  <td className="p-3.5 text-center pr-4 font-extrabold text-[#0F172A]">A1</td>
                </tr>
                <tr>
                  <td className="p-3.5 pl-4 font-bold text-[#0F172A]">Social Sciences</td>
                  <td className="p-3.5 text-center font-mono font-medium text-[#0F172A]">72</td>
                  <td className="p-3.5 text-center font-mono font-medium text-[#0F172A]">16</td>
                  <td className="p-3.5 text-center font-extrabold text-[#6D28D9]">88</td>
                  <td className="p-3.5 text-center pr-4 font-extrabold text-[#0F172A]">A2</td>
                </tr>
                <tr>
                  <td className="p-3.5 pl-4 font-bold text-[#0F172A]">Information Technology / CS</td>
                  <td className="p-3.5 text-center font-mono font-medium text-[#0F172A]">48</td>
                  <td className="p-3.5 text-center font-mono font-medium text-[#0F172A]">47</td>
                  <td className="p-3.5 text-center font-extrabold text-[#6D28D9]">95</td>
                  <td className="p-3.5 text-center pr-4 font-extrabold text-[#0F172A]">A1</td>
                </tr>
                <tr className="bg-[#FAF8F5] font-black text-xs">
                  <td className="p-3.5 pl-4 text-[#0F172A]">Cumulative Grand Total</td>
                  <td className="p-3.5 text-center font-mono text-[#0F172A]">340</td>
                  <td className="p-3.5 text-center font-mono text-[#0F172A]">116</td>
                  <td className="p-3.5 text-center font-extrabold text-[#0F172A]">456 / 500</td>
                  <td className="p-3.5 text-center pr-4 text-[#6D28D9] font-extrabold">A1 (91.2%)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Academic Indicators & Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#E8E4DF] space-y-2 text-xs shadow-sm">
              <span className="font-extrabold text-[10px] uppercase text-[#6D28D9] block">
                Attendance & Conduct
              </span>
              <p className="text-[#0F172A] leading-relaxed font-medium">
                Attendance: <strong className="font-bold">94.2%</strong> (188 / 200 Working Days). Exemplary classroom discipline and punctual submission of investigative projects.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E8E4DF] space-y-2 text-xs shadow-sm">
              <span className="font-extrabold text-[10px] uppercase text-[#6D28D9] block">
                Class Teacher Remarks
              </span>
              <p className="text-[#0F172A] leading-relaxed font-medium">
                "Outstanding mathematical aptitude. Has represented institution in Inter-School Science Quiz. Promoted to Senior Secondary with Distinction."
              </p>
            </div>
          </div>

          {/* Signatures Footer */}
          <div className="pt-8 border-t border-[#E8E4DF] flex items-center justify-between text-xs text-[#64748B] font-bold">
            <div className="text-center">
              <div className="w-32 border-b-2 border-[#0F172A]/20 mb-1.5" />
              <span>Class Teacher</span>
            </div>
            <div className="text-center">
              <div className="w-32 border-b-2 border-[#0F172A]/20 mb-1.5" />
              <span>Exam Controller</span>
            </div>
            <div className="text-center">
              <div className="w-32 border-b-2 border-[#0F172A]/20 mb-1.5" />
              <span>Principal</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
