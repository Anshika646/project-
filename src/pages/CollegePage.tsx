import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Building2,
  Layers,
  GraduationCap,
  Award,
  Download,
  Briefcase,
  BookOpen,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { learningService } from '../services/learningService';
import { exportToPDF } from '../utils/exportUtils';
import {
  Department,
  CollegeCourse,
  CollegeStudentSemester,
} from '../types/database.types';

export const CollegePage: React.FC = () => {
  const { role, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'departments' | 'courses' | 'transcripts' | 'placements'>('transcripts');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<CollegeCourse[]>([]);
  const [semesters, setSemesters] = useState<CollegeStudentSemester[]>([]);
  const [placements, setPlacements] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const depts = await learningService.getDepartments();
    setDepartments(depts);
    const crs = await learningService.getCollegeCourses();
    setCourses(crs);
    const sems = await learningService.getStudentCollegeSemesters(user?.id || 'user-college-student-1');
    setSemesters(sems);
    const plc = await learningService.getCollegePlacements();
    setPlacements(plc);
  };

  const handleDownloadTranscript = () => {
    exportToPDF(
      'Apex Institute of Technology & Science — Official Academic Transcript',
      [
        { header: 'Semester', dataKey: 'sem' },
        { header: 'Session / Term', dataKey: 'term' },
        { header: 'Credits Earned', dataKey: 'credits' },
        { header: 'SGPA', dataKey: 'sgpa' },
        { header: 'Cumulative CGPA', dataKey: 'cgpa' },
        { header: 'Backlogs', dataKey: 'backlogs' },
        { header: 'Evaluation Status', dataKey: 'status' },
      ],
      semesters.map((s) => ({
        sem: `Semester ${s.semester_number}`,
        term: s.term_session,
        credits: `${s.credits_earned} Credits`,
        sgpa: s.sgpa.toFixed(2),
        cgpa: s.cgpa.toFixed(2),
        backlogs: s.backlogs === 0 ? 'Nil' : `${s.backlogs} Active`,
        status: s.status,
      })),
      'Official_Transcript_Rohan_Mehta.pdf'
    );
    setToastMessage('Official Academic Transcript PDF generated successfully!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#232F25] dark:text-[#F0F5F1] tracking-tight flex items-center gap-2">
            <Building2 className="text-[#DA5FCE]" size={28} />
            <span>Higher Education & College Operations</span>
          </h1>
          <p className="text-xs md:text-sm text-[#667768] dark:text-[#9FB1A2] mt-0.5">
            Departments, Degree Courses, Semester SGPA/CGPA evaluation, and Placement drives
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 glass-card px-2 py-1.5 rounded-xl border border-white/70 dark:border-white/10 self-start md:self-auto overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('transcripts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'transcripts'
                ? 'bg-[#DA5FCE] text-white shadow-sm'
                : 'text-[#4F6052] dark:text-[#BACBBF] hover:bg-black/5'
            }`}
          >
            <Award size={13} />
            <span>SGPA/CGPA Transcripts</span>
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'departments'
                ? 'bg-[#DA5FCE] text-white shadow-sm'
                : 'text-[#4F6052] dark:text-[#BACBBF] hover:bg-black/5'
            }`}
          >
            Departments
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'courses'
                ? 'bg-[#DA5FCE] text-white shadow-sm'
                : 'text-[#4F6052] dark:text-[#BACBBF] hover:bg-black/5'
            }`}
          >
            Courses & Semesters
          </button>
          <button
            onClick={() => setActiveTab('placements')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'placements'
                ? 'bg-[#DA5FCE] text-white shadow-sm'
                : 'text-[#4F6052] dark:text-[#BACBBF] hover:bg-black/5'
            }`}
          >
            <Briefcase size={13} />
            <span>Placements</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-[#8DA390]/20 border border-[#8DA390]/40 text-[#213123] dark:text-[#E2ECE4] text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 size={16} className="text-[#DA5FCE]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* 1. TRANSCRIPTS & SGPA/CGPA VIEW */}
      {/* ---------------------------------------------------------------------- */}
      {activeTab === 'transcripts' && (
        <div className="space-y-6">
          {/* Student Profile Card */}
          <div className="p-6 rounded-3xl glass-panel border border-white/70 dark:border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#DA5FCE]/15 text-[#DA5FCE] flex items-center justify-center font-black text-xl">
                RM
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#DA5FCE] dark:text-[#A3B899]">
                  Student Academic Dossier
                </span>
                <h3 className="text-xl font-extrabold text-[#232F25] dark:text-[#F0F5F1]">
                  Rohan Mehta
                </h3>
                <p className="text-xs text-[#667768] dark:text-[#9FB1A2]">
                  Enrollment: 2022/BTECH/CSE/084 • B.Tech Computer Science & Engineering (Semester 6)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[#8DA390] block">
                  Cumulative CGPA
                </span>
                <span className="text-2xl font-black text-[#232F25] dark:text-white">
                  9.07 / 10.0
                </span>
              </div>
              <button
                onClick={handleDownloadTranscript}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#DA5FCE] text-white hover:bg-[#C64EBA] transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Download size={14} />
                <span>Export Transcript (PDF)</span>
              </button>
            </div>
          </div>

          {/* Semesters Ledger Table */}
          <div className="rounded-3xl glass-panel overflow-hidden border border-white/70 dark:border-white/10 shadow-sm">
            <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-[#232F25] dark:text-[#F0F5F1]">
                Semester-Wise SGPA & Credit Audit
              </h4>
              <span className="text-xs font-semibold text-[#DA5FCE] dark:text-[#A3B899]">
                Active Backlogs: 0
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/[0.02] dark:bg-white/[0.02] text-[#667768] dark:text-[#9FB1A2] font-semibold border-b border-black/5 dark:border-white/5">
                  <tr>
                    <th className="p-3.5 pl-6">Semester</th>
                    <th className="p-3.5">Term Session</th>
                    <th className="p-3.5">Earned Credits</th>
                    <th className="p-3.5">SGPA</th>
                    <th className="p-3.5">Cumulative CGPA</th>
                    <th className="p-3.5">Backlogs</th>
                    <th className="p-3.5 pr-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {semesters.map((s) => (
                    <tr key={s.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                      <td className="p-3.5 pl-6 font-bold text-[#232F25] dark:text-[#F0F5F1]">
                        Semester {s.semester_number}
                      </td>
                      <td className="p-3.5 text-[#556757] dark:text-[#B6C8B8]">{s.term_session}</td>
                      <td className="p-3.5 font-mono">{s.credits_earned} / 26</td>
                      <td className="p-3.5 font-bold text-[#232F25] dark:text-white">{s.sgpa.toFixed(2)}</td>
                      <td className="p-3.5 font-bold text-[#DA5FCE] dark:text-[#A3B899]">{s.cgpa.toFixed(2)}</td>
                      <td className="p-3.5 text-[#667768]">{s.backlogs === 0 ? 'None' : s.backlogs}</td>
                      <td className="p-3.5 pr-6">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            s.status === 'Passed'
                              ? 'bg-[#8DA390]/25 text-[#253A27]'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* 2. DEPARTMENTS VIEW */}
      {/* ---------------------------------------------------------------------- */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="p-5 rounded-3xl glass-card border border-white/70 dark:border-white/10 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#8DA390]/20 text-[#303E33]">
                  {dept.code}
                </span>
                <span className="text-xs font-semibold text-[#DA5FCE]">
                  {dept.faculty_count} Faculty Members
                </span>
              </div>

              <h3 className="text-base font-extrabold text-[#232F25] dark:text-[#F0F5F1]">
                {dept.name}
              </h3>

              <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-[#667768] dark:text-[#9FB1A2]">
                <span>Head of Dept: <strong className="text-[#232F25] dark:text-white">{dept.head_of_department}</strong></span>
                <span>{dept.student_count} Enrolled</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* 3. COURSES VIEW */}
      {/* ---------------------------------------------------------------------- */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {courses.map((crs) => (
            <div
              key={crs.id}
              className="p-5 rounded-3xl glass-card border border-white/70 dark:border-white/10 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E8B4B8]/20 text-[#8C3B44]">
                  {crs.degree_level}
                </span>
                <h3 className="text-base font-extrabold text-[#232F25] dark:text-[#F0F5F1] mt-2">
                  {crs.name}
                </h3>
                <span className="text-xs text-[#667768]">{crs.code}</span>
              </div>

              <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs">
                <span className="text-[#DA5FCE] font-bold">{crs.total_semesters} Semesters</span>
                <span className="font-mono text-[#667768]">{crs.total_credits} Credits</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* 4. PLACEMENTS VIEW */}
      {/* ---------------------------------------------------------------------- */}
      {activeTab === 'placements' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-3xl glass-card border border-white/70">
              <span className="text-[10px] uppercase font-bold text-[#8DA390]">Highest CTC</span>
              <h3 className="text-2xl font-black text-[#232F25] mt-1">₹32.50 LPA</h3>
              <span className="text-xs text-[#667768]">Google India Campus Hire</span>
            </div>
            <div className="p-5 rounded-3xl glass-card border border-white/70">
              <span className="text-[10px] uppercase font-bold text-[#8DA390]">Average CTC</span>
              <h3 className="text-2xl font-black text-[#232F25] mt-1">₹14.20 LPA</h3>
              <span className="text-xs text-[#667768]">Across Engineering & MCA</span>
            </div>
            <div className="p-5 rounded-3xl glass-card border border-white/70">
              <span className="text-[10px] uppercase font-bold text-[#8DA390]">Placement Ratio</span>
              <h3 className="text-2xl font-black text-[#232F25] mt-1">94.8%</h3>
              <span className="text-xs text-[#667768]">Batch of 2025 Placed</span>
            </div>
          </div>

          <div className="rounded-3xl glass-panel overflow-hidden border border-white/70 shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/[0.02] text-[#667768] font-semibold border-b border-black/5">
                <tr>
                  <th className="p-3.5 pl-6">Company Recruiter</th>
                  <th className="p-3.5">Designation / Role</th>
                  <th className="p-3.5">Compensation (CTC)</th>
                  <th className="p-3.5">Selected Offers</th>
                  <th className="p-3.5 pr-6">Drive Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {placements.map((plc, idx) => (
                  <tr key={idx} className="hover:bg-white/40 transition-colors">
                    <td className="p-3.5 pl-6 font-bold text-[#232F25]">{plc.company}</td>
                    <td className="p-3.5 text-[#556757]">{plc.role}</td>
                    <td className="p-3.5 font-bold text-[#DA5FCE]">{plc.package}</td>
                    <td className="p-3.5 font-mono">{plc.students_placed} Offers</td>
                    <td className="p-3.5 pr-6 text-[#718273]">{plc.visit_date}</td>
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
