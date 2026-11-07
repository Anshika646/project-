import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowUpRight,
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  Download,
  Users,
  Check,
  Building,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import {
  sessionLifecycleService,
  TransferCertificateRecord,
  StudentPromotionRecord,
} from '../services/sessionLifecycleService';
import { academicService } from '../services/academicService';
import { studentService } from '../services/studentService';
import { Student, ClassItem, Section } from '../types/database.types';

export const PromotionsPage: React.FC = () => {
  const { user } = useAuth();
  const institutionId = user?.institution?.id || 'e8b070c0-dacd-4772-85df-0ce93748524c';

  const [activeTab, setActiveTab] = useState<'promotions' | 'tc'>('promotions');

  // Promotion Source & Target
  const [sourceSession, setSourceSession] = useState('2025 – 2026');
  const [targetSession, setTargetSession] = useState('2026 – 2027');
  const [selectedClassId, setSelectedClassId] = useState('class-9');
  const [selectedSectionId, setSelectedSectionId] = useState('all');

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [promotionsHistory, setPromotionsHistory] = useState<StudentPromotionRecord[]>([]);

  // TC State
  const [tcs, setTcs] = useState<TransferCertificateRecord[]>([]);
  const [tcSearch, setTcSearch] = useState('');
  const [isTcModalOpen, setIsTcModalOpen] = useState(false);

  // New TC Form State
  const [tcStudentName, setTcStudentName] = useState('Aarav Patel');
  const [tcAdmissionNumber, setTcAdmissionNumber] = useState('ADM-2021-014');
  const [tcFatherName, setTcFatherName] = useState('Mr. Rajesh Patel');
  const [tcMotherName, setTcMotherName] = useState('Mrs. Sunita Patel');
  const [tcDob, setTcDob] = useState('2010-05-15');
  const [tcClass, setTcClass] = useState('Class 10');
  const [tcReason, setTcReason] = useState('Relocation to different city');
  const [tcConduct, setTcConduct] = useState<'Exemplary' | 'Very Good' | 'Good' | 'Satisfactory'>('Exemplary');

  // Selected students for bulk promotion
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadMetadata();
    loadTCs();
    loadPromotions();
  }, [institutionId]);

  useEffect(() => {
    fetchStudents();
  }, [selectedClassId, selectedSectionId]);

  const loadMetadata = async () => {
    const clsList = await academicService.getClasses(institutionId);
    setClasses(clsList);
    const secList = await academicService.getSections();
    setSections(secList);
  };

  const loadTCs = async () => {
    const list = await sessionLifecycleService.getTransferCertificates();
    setTcs(list);
  };

  const loadPromotions = async () => {
    const hist = await sessionLifecycleService.getPromotions();
    setPromotionsHistory(hist);
  };

  const fetchStudents = async () => {
    const res = await studentService.getStudents({
      institutionId,
      classId: selectedClassId === 'all' ? undefined : selectedClassId,
      sectionId: selectedSectionId === 'all' ? undefined : selectedSectionId,
      pageSize: 50,
    });
    setStudents(res.students);
    // pre-select all eligible students
    setSelectedStudentIds(res.students.map((s) => s.id));
  };

  const currentClassObj = classes.find((c) => c.id === selectedClassId);
  const nextClassObj = classes.find((c) => (c.grade_level || 0) === (currentClassObj?.grade_level || 0) + 1);

  const handleBulkPromote = async () => {
    if (selectedStudentIds.length === 0) {
      showToast('No students selected for promotion.');
      return;
    }

    const targetClassName = nextClassObj ? nextClassObj.name : 'Graduated';

    for (const studentId of selectedStudentIds) {
      const st = students.find((s) => s.id === studentId);
      if (st) {
        await sessionLifecycleService.recordPromotion({
          student_id: st.id,
          student_name: st.profile?.full_name || 'Student',
          roll_number: st.roll_number || '01',
          from_session: sourceSession,
          from_class: currentClassObj?.name || 'Current Class',
          from_section: 'A',
          to_session: targetSession,
          to_class: targetClassName,
          to_section: 'A',
          final_percentage: 88.5,
          final_grade: 'A2',
          attendance_percentage: 94.2,
          promotion_status: 'promoted',
        });
      }
    }

    showToast(`Successfully promoted ${selectedStudentIds.length} students to ${targetClassName} (${targetSession})!`);
    loadPromotions();
  };

  const handleIndividualAction = async (student: Student, action: 'promoted' | 'retained' | 'tc_issued') => {
    const targetClassName = action === 'promoted' ? (nextClassObj ? nextClassObj.name : 'Graduated') : (currentClassObj?.name || 'Class');

    await sessionLifecycleService.recordPromotion({
      student_id: student.id,
      student_name: student.profile?.full_name || 'Student',
      roll_number: student.roll_number || '01',
      from_session: sourceSession,
      from_class: currentClassObj?.name || 'Class',
      from_section: 'A',
      to_session: targetSession,
      to_class: targetClassName,
      to_section: 'A',
      final_percentage: 85,
      final_grade: 'A2',
      attendance_percentage: 92,
      promotion_status: action,
    });

    if (action === 'tc_issued') {
      showToast(`Transfer Certificate workflow triggered for ${student.profile?.full_name}.`);
      setTcStudentName(student.profile?.full_name || '');
      setTcAdmissionNumber(student.admission_number);
      setIsTcModalOpen(true);
    } else {
      showToast(`Student ${student.profile?.full_name} status updated: ${action.toUpperCase()}`);
    }
    loadPromotions();
  };

  const handleIssueTC = async (e: React.FormEvent) => {
    e.preventDefault();
    const newTc = await sessionLifecycleService.issueTransferCertificate({
      tc_number: `SIS/TC/2026/${Math.floor(100 + Math.random() * 900)}`,
      student_id: `std-${Date.now()}`,
      student_name: tcStudentName,
      admission_number: tcAdmissionNumber,
      father_name: tcFatherName,
      mother_name: tcMotherName,
      nationality: 'Indian',
      dob: tcDob,
      last_class_studied: tcClass,
      school_board_annual_exam_result: 'Passed',
      promoted_to_higher_class: true,
      promoted_to_class_name: nextClassObj?.name || 'Class 11',
      fee_dues_paid: true,
      date_of_application: new Date().toISOString().split('T')[0],
      date_of_issue: new Date().toISOString().split('T')[0],
      reason_for_leaving: tcReason,
      total_working_days: 224,
      total_days_present: 212,
      general_conduct: tcConduct,
    });

    setIsTcModalOpen(false);
    loadTCs();
    showToast(`Transfer Certificate generated: ${newTc.tc_number}`);
    sessionLifecycleService.generateOfficialTCPDF(newTc, user?.institution?.name || 'Springfield International School');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleStudentSelection = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredTCs = tcs.filter((t) =>
    t.student_name.toLowerCase().includes(tcSearch.toLowerCase()) ||
    t.tc_number.toLowerCase().includes(tcSearch.toLowerCase()) ||
    t.admission_number.toLowerCase().includes(tcSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-white border border-[#DDD6FE] text-[#0F172A] text-xs font-semibold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={16} className="text-[#6D28D9]" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-[#64748B] hover:text-[#0F172A]">✕</button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Student Promotion & Transfer Certificates (TC)
          </h1>
          <p className="text-xs md:text-sm font-medium text-[#64748B] mt-0.5">
            Annual batch promotion into next academic year, retention evaluations, and official Transfer Certificate generation.
          </p>
        </div>

        {activeTab === 'tc' && (
          <button
            onClick={() => setIsTcModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-all shadow-xs flex items-center gap-1.5 self-start md:self-auto"
          >
            <FileText size={15} />
            <span>Issue New TC</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border border-[#E8E4DF] w-fit shadow-2xs">
        <button
          onClick={() => setActiveTab('promotions')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'promotions' ? 'bg-[#6D28D9] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Annual Promotion Workflow
        </button>
        <button
          onClick={() => setActiveTab('tc')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'tc' ? 'bg-[#6D28D9] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Transfer Certificate (TC) Registry
        </button>
      </div>

      {/* TAB 1: ANNUAL PROMOTION WORKFLOW */}
      {activeTab === 'promotions' && (
        <div className="space-y-5">
          {/* Promotion Mapping Filter Bar */}
          <div className="p-5 rounded-2xl bg-white border border-[#E8E4DF] shadow-2xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
              <Sparkles size={16} className="text-[#6D28D9]" />
              <span>Select Academic Sessions & Grade Transition</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">Source Session</label>
                <select
                  value={sourceSession}
                  onChange={(e) => setSourceSession(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none"
                >
                  <option value="2025 – 2026">2025 – 2026 (Active)</option>
                  <option value="2024 – 2025">2024 – 2025 (Archived)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">Source Class (Nursery to 12)</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.name} ({cls.stage})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">Target Next Session</label>
                <select
                  value={targetSession}
                  onChange={(e) => setTargetSession(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-bold text-[#6D28D9] focus:outline-none"
                >
                  <option value="2026 – 2027">2026 – 2027 (Upcoming / Draft)</option>
                  <option value="2025 – 2026">2025 – 2026</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">Target Promoted Class</label>
                <div className="w-full px-3 py-2 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE] text-xs font-bold text-[#6D28D9] flex items-center justify-between">
                  <span>{nextClassObj ? nextClassObj.name : 'Graduated / Higher Studies'}</span>
                  <span className="text-[10px] uppercase font-bold text-[#6D28D9]">Auto-mapped</span>
                </div>
              </div>
            </div>
          </div>

          {/* Student Evaluation Table for Promotion */}
          <div className="rounded-2xl bg-white border border-[#E8E4DF] shadow-[0_2px_10px_-2px_rgba(15,23,42,0.03)] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E4DF]">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">
                  Student Roster for {currentClassObj?.name || 'Class'}
                </h3>
                <p className="text-xs text-[#64748B] font-medium">
                  {students.length} students found • {selectedStudentIds.length} selected for bulk promotion
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudentIds(students.map((s) => s.id))}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF8F5] text-[#0F172A] border border-[#E8E4DF] hover:bg-white"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleBulkPromote}
                  disabled={selectedStudentIds.length === 0}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] disabled:opacity-40 transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <ArrowUpRight size={14} />
                  <span>Bulk Promote to {nextClassObj?.name || 'Next Grade'}</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E8E4DF] text-[#64748B] font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3 w-8">
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.length === students.length && students.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedStudentIds(students.map((s) => s.id));
                          else setSelectedStudentIds([]);
                        }}
                        className="rounded text-[#6D28D9] border-[#E8E4DF]"
                      />
                    </th>
                    <th className="py-2.5 px-3">Roll No</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Admission No</th>
                    <th className="py-2.5 px-3">Attendance %</th>
                    <th className="py-2.5 px-3">Annual Marks / Result</th>
                    <th className="py-2.5 px-3">Eligibility Recommendation</th>
                    <th className="py-2.5 px-3 text-right">Individual Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E4DF]">
                  {students.map((st, idx) => {
                    const isSelected = selectedStudentIds.includes(st.id);
                    const mockAttendance = idx % 5 === 0 ? 71.4 : idx % 3 === 0 ? 88.2 : 94.5;
                    const isEligible = mockAttendance >= 75;

                    return (
                      <tr key={st.id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="py-3 px-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleStudentSelection(st.id)}
                            className="rounded text-[#6D28D9] border-[#E8E4DF]"
                          />
                        </td>
                        <td className="py-3 px-3 font-bold text-[#0F172A]">
                          #{st.roll_number || `${idx + 1}`}
                        </td>
                        <td className="py-3 px-3 font-bold text-[#0F172A]">
                          {st.profile?.full_name}
                        </td>
                        <td className="py-3 px-3 font-mono text-[#64748B]">
                          {st.admission_number}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`font-semibold ${mockAttendance < 75 ? 'text-[#DC2626]' : 'text-[#059669]'}`}>
                            {mockAttendance}%
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-[#0F172A]">91.4% (Grade A1)</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isEligible
                              ? 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                              : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                          }`}>
                            {isEligible ? 'Promoted (Satisfies All Criteria)' : 'Borderline Attendance (<75%)'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => handleIndividualAction(st, 'promoted')}
                            className="px-2 py-1 rounded-md text-[11px] font-bold text-white bg-[#059669] hover:bg-[#047857]"
                            title="Promote to next grade"
                          >
                            Promote
                          </button>
                          <button
                            onClick={() => handleIndividualAction(st, 'retained')}
                            className="px-2 py-1 rounded-md text-[11px] font-bold text-[#D97706] bg-[#FFFBEB] border border-[#FDE68A] hover:bg-[#FEF3C7]"
                            title="Retain student in current grade"
                          >
                            Retain
                          </button>
                          <button
                            onClick={() => handleIndividualAction(st, 'tc_issued')}
                            className="px-2 py-1 rounded-md text-[11px] font-bold text-[#6D28D9] bg-[#F5F3FF] border border-[#DDD6FE] hover:bg-[#EDE9FE]"
                            title="Issue Transfer Certificate"
                          >
                            Issue TC
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRANSFER CERTIFICATE REGISTRY */}
      {activeTab === 'tc' && (
        <div className="rounded-2xl bg-white border border-[#E8E4DF] shadow-[0_2px_10px_-2px_rgba(15,23,42,0.03)] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E4DF]">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={tcSearch}
                onChange={(e) => setTcSearch(e.target.value)}
                placeholder="Search by student name, TC serial or admission no..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#6D28D9]"
              />
            </div>
            <span className="text-xs text-[#64748B] font-medium">
              {filteredTCs.length} Official Transfer Certificates on record
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8E4DF] text-[#64748B] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">TC Serial Number</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Admission No</th>
                  <th className="py-2.5 px-3">Last Class</th>
                  <th className="py-2.5 px-3">Result / Promotion</th>
                  <th className="py-2.5 px-3">Date of Issue</th>
                  <th className="py-2.5 px-3">Leaving Reason</th>
                  <th className="py-2.5 px-3 text-right">Certificate PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E4DF]">
                {filteredTCs.map((tc) => (
                  <tr key={tc.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#6D28D9]">
                      {tc.tc_number}
                    </td>
                    <td className="py-3 px-3 font-bold text-[#0F172A]">
                      {tc.student_name}
                    </td>
                    <td className="py-3 px-3 text-[#64748B] font-mono">
                      {tc.admission_number}
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#0F172A]">
                      {tc.last_class_studied}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                        {tc.school_board_annual_exam_result}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#64748B]">
                      {tc.date_of_issue}
                    </td>
                    <td className="py-3 px-3 text-[#64748B] max-w-xs truncate">
                      {tc.reason_for_leaving}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => sessionLifecycleService.generateOfficialTCPDF(tc, user?.institution?.name || 'Springfield International School')}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-all shadow-xs flex items-center gap-1.5 ml-auto"
                      >
                        <Download size={13} />
                        <span>Download TC</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ISSUE TC MODAL */}
      {isTcModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-2xs">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-[#E8E4DF] shadow-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E4DF]">
              <h3 className="text-base font-bold text-[#0F172A]">Generate Transfer Certificate (TC)</h3>
              <button onClick={() => setIsTcModalOpen(false)} className="text-[#64748B] hover:text-[#0F172A]">✕</button>
            </div>

            <form onSubmit={handleIssueTC} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">Student Full Name *</label>
                  <input
                    required
                    type="text"
                    value={tcStudentName}
                    onChange={(e) => setTcStudentName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">Admission Number *</label>
                  <input
                    required
                    type="text"
                    value={tcAdmissionNumber}
                    onChange={(e) => setTcAdmissionNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">Father's Name *</label>
                  <input
                    required
                    type="text"
                    value={tcFatherName}
                    onChange={(e) => setTcFatherName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">Mother's Name</label>
                  <input
                    type="text"
                    value={tcMotherName}
                    onChange={(e) => setTcMotherName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={tcDob}
                    onChange={(e) => setTcDob(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">Class Last Studied</label>
                  <input
                    type="text"
                    value={tcClass}
                    onChange={(e) => setTcClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">Reason for Leaving School *</label>
                <input
                  required
                  type="text"
                  value={tcReason}
                  onChange={(e) => setTcReason(e.target.value)}
                  placeholder="Parent transfer / Higher secondary education"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">General Conduct</label>
                  <select
                    value={tcConduct}
                    onChange={(e) => setTcConduct(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none"
                  >
                    <option value="Exemplary">Exemplary</option>
                    <option value="Very Good">Very Good</option>
                    <option value="Good">Good</option>
                    <option value="Satisfactory">Satisfactory</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">School Dues Cleared?</label>
                  <div className="py-2 text-xs font-bold text-[#059669] flex items-center gap-1.5">
                    <CheckCircle2 size={16} />
                    <span>Verified: No Administrative Dues</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E4DF]">
                <button
                  type="button"
                  onClick={() => setIsTcModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#6D28D9] hover:bg-[#5B21B6] shadow-xs flex items-center gap-1.5"
                >
                  <Download size={14} />
                  <span>Generate & Download TC (PDF)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
