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
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#171417] tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#F3E8FF] flex items-center justify-center text-[#8B5CF6]">
              <Building2 size={22} />
            </div>
            <span>Higher Education & College Operations</span>
          </h1>
          <p className="text-xs md:text-sm text-[#625C60] mt-1 font-medium">
            Departments, Degree Courses, Semester SGPA/CGPA evaluation, and Placement drives
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-[#FAF5FF] p-1.5 rounded-2xl border border-[#E9D5FF] self-start md:self-auto overflow-x-auto scrollbar-none shadow-sm">
          <button
            onClick={() => setActiveTab('transcripts')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'transcripts'
                ? 'bg-[#8B5CF6] text-white shadow-sm'
                : 'text-[#171417] hover:bg-[#F5F3FF]'
            }`}
          >
            <Award size={14} />
            <span>SGPA/CGPA Transcripts</span>
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'departments'
                ? 'bg-[#8B5CF6] text-white shadow-sm'
                : 'text-[#171417] hover:bg-[#F5F3FF]'
            }`}
          >
            Departments
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'courses'
                ? 'bg-[#8B5CF6] text-white shadow-sm'
                : 'text-[#171417] hover:bg-[#F5F3FF]'
            }`}
          >
            Courses & Semesters
          </button>
          <button
            onClick={() => setActiveTab('placements')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'placements'
                ? 'bg-[#8B5CF6] text-white shadow-sm'
                : 'text-[#171417] hover:bg-[#F5F3FF]'
            }`}
          >
            <Briefcase size={14} />
            <span>Placements</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-2xl bg-[#F5F3FF] border border-[#E9D5FF] text-[#171417] text-xs font-bold flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 size={16} className="text-[#8B5CF6]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* 1. TRANSCRIPTS & SGPA/CGPA VIEW */}
      {/* ---------------------------------------------------------------------- */}
      {activeTab === 'transcripts' && (
        <div className="space-y-6">
          {/* Student Profile Card */}
          <div className="p-6 rounded-3xl bg-[#F5F3FF] border border-[#E9D5FF] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#F3E8FF] text-[#8B5CF6] border border-[#E9D5FF] flex items-center justify-center font-extrabold text-xl shadow-sm">
                RM
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8B5CF6]">
                  Student Academic Dossier
                </span>
                <h3 className="text-xl font-extrabold text-[#171417]">
                  Rohan Mehta
                </h3>
                <p className="text-xs text-[#625C60] font-medium">
                  Enrollment: 2022/BTECH/CSE/084 • B.Tech Computer Science & Engineering (Semester 6)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[#625C60] block">
                  Cumulative CGPA
                </span>
                <span className="text-2xl font-black text-[#171417]">
                  9.07 / 10.0
                </span>
              </div>
              <button
                onClick={handleDownloadTranscript}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Download size={14} />
                <span>Export Transcript (PDF)</span>
              </button>
            </div>
          </div>

          {/* Semesters Ledger Table */}
          <div className="rounded-2xl bg-[#FAF5FF] overflow-hidden border border-[#E9D5FF] shadow-sm">
            <div className="p-4 border-b border-[#E9D5FF] flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-[#171417]">
                Semester-Wise SGPA & Credit Audit
              </h4>
              <span className="text-xs font-bold text-[#8B5CF6]">
                Active Backlogs: 0
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs bg-white">
                <thead className="bg-[#FAF5FF] text-[#171417] font-extrabold border-b border-[#E9D5FF]">
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
                <tbody className="divide-y divide-[#E9D5FF]">
                  {semesters.map((s) => (
                    <tr key={s.id} className="hover:bg-[#F5F3FF]/50 transition-colors">
                      <td className="p-3.5 pl-6 font-bold text-[#171417]">
                        Semester {s.semester_number}
                      </td>
                      <td className="p-3.5 text-[#625C60] font-medium">{s.term_session}</td>
                      <td className="p-3.5 font-mono text-[#171417]">{s.credits_earned} / 26</td>
                      <td className="p-3.5 font-bold text-[#171417]">{s.sgpa.toFixed(2)}</td>
                      <td className="p-3.5 font-extrabold text-[#8B5CF6]">{s.cgpa.toFixed(2)}</td>
                      <td className="p-3.5 text-[#625C60] font-medium">{s.backlogs === 0 ? 'None' : s.backlogs}</td>
                      <td className="p-3.5 pr-6">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            s.status === 'Passed'
                              ? 'bg-[#F3E8FF] text-[#8B5CF6] border-[#8B5CF6]/30'
                              : 'bg-[#FAF5FF] text-[#171417] border-[#E9D5FF]'
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
          {departments.map((dept, i) => (
            <div
              key={dept.id}
              className={`p-6 rounded-2xl border border-[#E9D5FF] shadow-sm space-y-3 transition-all hover:border-[#8B5CF6]/50 ${
                i % 2 === 0 ? 'bg-[#F5F3FF]' : 'bg-[#FAF5FF]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-lg bg-white border border-[#E9D5FF] text-[#171417]">
                  {dept.code}
                </span>
                <span className="text-xs font-extrabold text-[#8B5CF6]">
                  {dept.faculty_count} Faculty Members
                </span>
              </div>

              <h3 className="text-base font-extrabold text-[#171417]">
                {dept.name}
              </h3>

              <div className="pt-3 border-t border-[#E9D5FF] flex items-center justify-between text-xs text-[#625C60] font-medium">
                <span>Head of Dept: <strong className="text-[#171417] font-bold">{dept.head_of_department}</strong></span>
                <span className="font-bold text-[#171417]">{dept.student_count} Enrolled</span>
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
          {courses.map((crs, i) => (
            <div
              key={crs.id}
              className={`p-5 rounded-2xl border border-[#E9D5FF] shadow-sm space-y-3 flex flex-col justify-between transition-all hover:border-[#8B5CF6]/50 ${
                i % 3 === 0 ? 'bg-[#F5F3FF]' : i % 3 === 1 ? 'bg-[#FAF5FF]' : 'bg-[#FDFBFF]'
              }`}
            >
              <div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-white border border-[#E9D5FF] text-[#8B5CF6]">
                  {crs.degree_level}
                </span>
                <h3 className="text-base font-extrabold text-[#171417] mt-2.5">
                  {crs.name}
                </h3>
                <span className="text-xs text-[#625C60] font-medium">{crs.code}</span>
              </div>

              <div className="pt-3 border-t border-[#E9D5FF] flex items-center justify-between text-xs">
                <span className="text-[#8B5CF6] font-extrabold">{crs.total_semesters} Semesters</span>
                <span className="font-mono text-[#171417] font-bold">{crs.total_credits} Credits</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* 4. PLACEMENTS VIEW */}
      {/* ---------------------------------------------------------------------- */}
      {activeTab === 'placements' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl bg-[#F5F3FF] border border-[#E9D5FF] shadow-sm">
              <span className="text-[10px] uppercase font-bold text-[#625C60]">Highest CTC</span>
              <h3 className="text-2xl font-black text-[#171417] mt-1">₹32.50 LPA</h3>
              <span className="text-xs text-[#625C60] font-medium">Google India Campus Hire</span>
            </div>
            <div className="p-6 rounded-2xl bg-[#FAF5FF] border border-[#E9D5FF] shadow-sm">
              <span className="text-[10px] uppercase font-bold text-[#625C60]">Average CTC</span>
              <h3 className="text-2xl font-black text-[#171417] mt-1">₹14.20 LPA</h3>
              <span className="text-xs text-[#625C60] font-medium">Across Engineering & MCA</span>
            </div>
            <div className="p-6 rounded-2xl bg-[#FDFBFF] border border-[#E9D5FF] shadow-sm">
              <span className="text-[10px] uppercase font-bold text-[#625C60]">Placement Ratio</span>
              <h3 className="text-2xl font-black text-[#171417] mt-1">94.8%</h3>
              <span className="text-xs text-[#625C60] font-medium">Batch of 2025 Placed</span>
            </div>
          </div>

          <div className="rounded-2xl bg-[#FAF5FF] overflow-hidden border border-[#E9D5FF] shadow-sm">
            <table className="w-full text-left text-xs bg-white">
              <thead className="bg-[#FAF5FF] text-[#171417] font-extrabold border-b border-[#E9D5FF]">
                <tr>
                  <th className="p-3.5 pl-6">Company Recruiter</th>
                  <th className="p-3.5">Designation / Role</th>
                  <th className="p-3.5">Compensation (CTC)</th>
                  <th className="p-3.5">Selected Offers</th>
                  <th className="p-3.5 pr-6">Drive Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9D5FF]">
                {placements.map((plc, idx) => (
                  <tr key={idx} className="hover:bg-[#F5F3FF]/50 transition-colors">
                    <td className="p-3.5 pl-6 font-bold text-[#171417]">{plc.company}</td>
                    <td className="p-3.5 text-[#625C60] font-medium">{plc.role}</td>
                    <td className="p-3.5 font-extrabold text-[#8B5CF6]">{plc.package}</td>
                    <td className="p-3.5 font-mono font-bold text-[#171417]">{plc.students_placed} Offers</td>
                    <td className="p-3.5 pr-6 text-[#625C60]">{plc.visit_date}</td>
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
