import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  UserPlus,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Building,
  Upload,
  Phone,
  Mail,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Sparkles,
  Save,
  Check,
  X,
} from 'lucide-react';
import {
  admissionService,
  AdmissionEnquiry,
  ComprehensiveAdmissionData,
} from '../services/admissionService';
import { academicService } from '../services/academicService';
import { ClassItem, Section } from '../types/database.types';

export const AdmissionsPage: React.FC = () => {
  const { user } = useAuth();
  const institutionId = user?.institution?.id || 'e8b070c0-dacd-4772-85df-0ce93748524c';

  const [activeTab, setActiveTab] = useState<'pipeline' | 'wizard'>('pipeline');
  const [enquiries, setEnquiries] = useState<AdmissionEnquiry[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');

  // Quick Enquiry Modal
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [enqStudentName, setEnqStudentName] = useState('');
  const [enqParentName, setEnqParentName] = useState('');
  const [enqPhone, setEnqPhone] = useState('');
  const [enqEmail, setEnqEmail] = useState('');
  const [enqTargetClass, setEnqTargetClass] = useState('Class 1');
  const [enqNotes, setEnqNotes] = useState('');

  // 7-Step Multi-Step Wizard State
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [wizardData, setWizardData] = useState<ComprehensiveAdmissionData>({
    first_name: '',
    middle_name: '',
    last_name: '',
    dob: '2015-06-10',
    gender: 'Male',
    blood_group: 'B+',
    national_id_aadhaar: '',
    category: 'General',
    mother_tongue: 'English',
    nationality: 'Indian',

    father_name: '',
    father_phone: '',
    father_occupation: 'Professional',
    mother_name: '',
    mother_phone: '',
    mother_occupation: 'Educator',
    primary_email: '',
    residential_address: '',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110070',

    previous_school_name: '',
    previous_board: 'CBSE',
    previous_class: '',
    previous_tc_number: '',
    previous_marks_percentage: '',
    previous_reason_for_leaving: '',

    academic_session: '2025 – 2026',
    class_id: 'class-1',
    section_id: 'sec-class1-a',
    stream: 'Science',
    second_language: 'Hindi',
    roll_number: '',
    transport_required: false,

    doc_birth_certificate: true,
    doc_transfer_certificate: true,
    doc_previous_marksheet: true,
    doc_id_proof: true,
    doc_photographs: true,
    doc_medical_fitness: true,

    emergency_contact_name: '',
    emergency_relationship: 'Father',
    emergency_phone: '',
    known_allergies: 'None',
    family_doctor_name: 'Dr. R. K. Gupta',

    parent_declaration_agreed: true,
    admin_approval_status: 'approved',
    admin_notes: 'Documents verified and verified against age eligibility.',
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [institutionId]);

  const loadData = async () => {
    const enqList = await admissionService.getEnquiries(institutionId);
    setEnquiries(enqList);
    const clsList = await academicService.getClasses(institutionId);
    setClasses(clsList);
    const secList = await academicService.getSections();
    setSections(secList);
  };

  const handleAddEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enqStudentName || !enqParentName || !enqPhone) return;

    await admissionService.addEnquiry({
      institution_id: institutionId,
      student_name: enqStudentName,
      parent_name: enqParentName,
      phone: enqPhone,
      email: enqEmail,
      target_class: enqTargetClass,
      status: 'enquiry',
      notes: enqNotes,
    });

    setIsEnquiryModalOpen(false);
    setEnqStudentName('');
    setEnqParentName('');
    setEnqPhone('');
    setEnqEmail('');
    setEnqNotes('');
    loadData();
    showToast('Enquiry registered successfully.');
  };

  const handleStatusChange = async (id: string, status: AdmissionEnquiry['status']) => {
    await admissionService.updateEnquiryStatus(id, status);
    loadData();
    showToast(`Status updated to ${status.replace('_', ' ')}.`);
  };

  const handleConvertEnquiryToAdmission = (enq: AdmissionEnquiry) => {
    const nameParts = enq.student_name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || 'Student';

    // Find class
    const matchedClass = classes.find((c) => c.name.toLowerCase() === enq.target_class.toLowerCase()) || classes[0];
    const classSecs = sections.filter((s) => s.class_id === matchedClass?.id);

    setWizardData((prev) => ({
      ...prev,
      first_name: firstName,
      last_name: lastName,
      father_name: enq.parent_name,
      father_phone: enq.phone,
      primary_email: enq.email,
      class_id: matchedClass ? matchedClass.id : prev.class_id,
      section_id: classSecs.length > 0 ? classSecs[0].id : prev.section_id,
      previous_school_name: enq.previous_school || '',
    }));

    setActiveTab('wizard');
    setWizardStep(1);
    showToast(`Enquiry converted. Proceed through the 7-step admission form.`);
  };

  const handleWizardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wizardData.first_name || !wizardData.last_name || !wizardData.father_name) {
      showToast('Please complete required fields before final approval.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await admissionService.submitFullAdmission(institutionId, wizardData);
      showToast(`Student formally enrolled! Admission Number: ${result.admissionNumber}`);
      setActiveTab('pipeline');
      setWizardStep(1);
      loadData();
    } catch (err: unknown) {
      showToast('Error admitting student. Please check input values.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    admissionService.saveDraft(wizardData);
    showToast('Application draft saved locally.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredEnquiries = enquiries.filter((e) => {
    const matchesSearch =
      e.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.parent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchesClass = classFilter === 'all' || e.target_class === classFilter;
    return matchesSearch && matchesStatus && matchesClass;
  });

  const wizardSteps = [
    { num: 1, label: 'Student Information', code: 'A' },
    { num: 2, label: 'Parent / Guardian', code: 'B' },
    { num: 3, label: 'Previous School', code: 'C' },
    { num: 4, label: 'Academic Allocation', code: 'D' },
    { num: 5, label: 'Document Checklist', code: 'E' },
    { num: 6, label: 'Emergency Contact', code: 'F' },
    { num: 7, label: 'Review & Approval', code: 'G' },
  ];

  // Filter sections for current class in wizard
  const currentClassSections = sections.filter((s) => s.class_id === wizardData.class_id);
  const selectedClassObj = classes.find((c) => c.id === wizardData.class_id);
  const isHigherSecondary = selectedClassObj?.name === 'Class 11' || selectedClassObj?.name === 'Class 12';

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

      {/* Header & Primary Tab Toggles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Admissions & Student Enrolment
          </h1>
          <p className="text-xs md:text-sm font-medium text-[#64748B] mt-0.5">
            Manage inquiries, applicant interviews, and formal multi-step student admission workflows.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="p-1 rounded-xl bg-white border border-[#E8E4DF] flex items-center gap-1 shadow-2xs">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'pipeline'
                  ? 'bg-[#6D28D9] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Enquiries & Pipeline
            </button>
            <button
              onClick={() => setActiveTab('wizard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'wizard'
                  ? 'bg-[#6D28D9] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Admission Form Wizard
            </button>
          </div>

          {activeTab === 'pipeline' && (
            <button
              onClick={() => setIsEnquiryModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-all shadow-xs flex items-center gap-1.5"
            >
              <UserPlus size={15} />
              <span>New Enquiry</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E8E4DF] shadow-2xs">
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Total Enquiries</span>
          <div className="text-2xl font-extrabold text-[#0F172A] mt-1">{enquiries.length}</div>
          <span className="text-[11px] text-[#6D28D9] font-medium">Session 2025–2026</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#E8E4DF] shadow-2xs">
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Interviews Scheduled</span>
          <div className="text-2xl font-extrabold text-[#0F172A] mt-1">
            {enquiries.filter((e) => e.status === 'interview_scheduled').length}
          </div>
          <span className="text-[11px] text-[#64748B] font-medium">Foundational & Middle</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#E8E4DF] shadow-2xs">
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Formally Admitted</span>
          <div className="text-2xl font-extrabold text-[#059669] mt-1">
            {enquiries.filter((e) => e.status === 'admitted').length + 86}
          </div>
          <span className="text-[11px] text-[#059669] font-medium">Roster Synchronized</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#E8E4DF] shadow-2xs">
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Seats Available</span>
          <div className="text-2xl font-extrabold text-[#0F172A] mt-1">114</div>
          <span className="text-[11px] text-[#64748B] font-medium">Across Nursery–12</span>
        </div>
      </div>

      {/* TAB 1: ENQUIRIES PIPELINE */}
      {activeTab === 'pipeline' && (
        <div className="rounded-2xl bg-white border border-[#E8E4DF] shadow-[0_2px_10px_-2px_rgba(15,23,42,0.03)] p-5 space-y-4">
          {/* Controls Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E8E4DF]">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search applicant, parent name or phone..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#6D28D9]"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-[#0F172A] focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="enquiry">New Enquiry</option>
                <option value="applied">Applied</option>
                <option value="interview_scheduled">Interview Scheduled</option>
                <option value="admitted">Admitted</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-[#0F172A] focus:outline-none"
              >
                <option value="all">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.name}>{cls.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Enquiries Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8E4DF] text-[#64748B] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Applicant Name</th>
                  <th className="py-2.5 px-3">Target Grade</th>
                  <th className="py-2.5 px-3">Parent / Contact</th>
                  <th className="py-2.5 px-3">Previous School</th>
                  <th className="py-2.5 px-3">Enquiry Date</th>
                  <th className="py-2.5 px-3">Current Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E4DF]">
                {filteredEnquiries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#64748B] font-medium">
                      No matching applicant enquiries found.
                    </td>
                  </tr>
                ) : (
                  filteredEnquiries.map((enq) => (
                    <tr key={enq.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3 px-3 font-bold text-[#0F172A]">
                        {enq.student_name}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-[#F5F3FF] text-[#6D28D9] border border-[#DDD6FE]">
                          {enq.target_class}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-[#0F172A]">{enq.parent_name}</div>
                        <div className="text-[11px] text-[#64748B]">{enq.phone}</div>
                      </td>
                      <td className="py-3 px-3 text-[#64748B] font-medium">
                        {enq.previous_school || 'N/A'}
                      </td>
                      <td className="py-3 px-3 text-[#64748B]">
                        {enq.enquiry_date}
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={enq.status}
                          onChange={(e) => handleStatusChange(enq.id, e.target.value as any)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                            enq.status === 'admitted'
                              ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                              : enq.status === 'interview_scheduled'
                              ? 'bg-[#F5F3FF] text-[#6D28D9] border-[#DDD6FE]'
                              : enq.status === 'rejected'
                              ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                              : 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
                          }`}
                        >
                          <option value="enquiry">Enquiry</option>
                          <option value="applied">Applied</option>
                          <option value="interview_scheduled">Interview Scheduled</option>
                          <option value="admitted">Admitted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {enq.status !== 'admitted' ? (
                          <button
                            onClick={() => handleConvertEnquiryToAdmission(enq)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#6D28D9] text-white hover:bg-[#5B21B6] transition-colors"
                          >
                            Process Admission →
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-[#059669]">Admitted ✓</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: COMPREHENSIVE 7-STEP ADMISSION WIZARD */}
      {activeTab === 'wizard' && (
        <div className="rounded-2xl bg-white border border-[#E8E4DF] shadow-[0_2px_10px_-2px_rgba(15,23,42,0.03)] p-6 space-y-6">
          {/* Step Indicator Progress Bar */}
          <div className="border-b border-[#E8E4DF] pb-5">
            <div className="flex items-center justify-between overflow-x-auto pb-2 gap-2">
              {wizardSteps.map((st) => (
                <button
                  key={st.num}
                  type="button"
                  onClick={() => setWizardStep(st.num)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                    wizardStep === st.num
                      ? 'bg-[#6D28D9] text-white shadow-xs'
                      : wizardStep > st.num
                      ? 'bg-[#F5F3FF] text-[#6D28D9] border border-[#DDD6FE]'
                      : 'bg-[#FAF8F5] text-[#64748B] border border-[#E8E4DF]'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    wizardStep === st.num ? 'bg-white text-[#6D28D9]' : 'bg-transparent text-current'
                  }`}>
                    {st.code}
                  </span>
                  <span>{st.label}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleWizardSubmit} className="space-y-6">
            {/* STEP 1: STUDENT INFORMATION */}
            {wizardStep === 1 && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="text-sm font-bold text-[#0F172A] border-b border-[#E8E4DF] pb-2">
                  Section A: Student Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">First Name *</label>
                    <input
                      required
                      type="text"
                      value={wizardData.first_name}
                      onChange={(e) => setWizardData({ ...wizardData, first_name: e.target.value })}
                      placeholder="e.g. Aarav"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Middle Name</label>
                    <input
                      type="text"
                      value={wizardData.middle_name}
                      onChange={(e) => setWizardData({ ...wizardData, middle_name: e.target.value })}
                      placeholder="Optional"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Last Name *</label>
                    <input
                      required
                      type="text"
                      value={wizardData.last_name}
                      onChange={(e) => setWizardData({ ...wizardData, last_name: e.target.value })}
                      placeholder="e.g. Patel"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Date of Birth *</label>
                    <input
                      required
                      type="date"
                      value={wizardData.dob}
                      onChange={(e) => setWizardData({ ...wizardData, dob: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Gender *</label>
                    <select
                      value={wizardData.gender}
                      onChange={(e) => setWizardData({ ...wizardData, gender: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Blood Group</label>
                    <select
                      value={wizardData.blood_group}
                      onChange={(e) => setWizardData({ ...wizardData, blood_group: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">National ID / Aadhaar</label>
                    <input
                      type="text"
                      value={wizardData.national_id_aadhaar}
                      onChange={(e) => setWizardData({ ...wizardData, national_id_aadhaar: e.target.value })}
                      placeholder="12-digit Aadhaar / Passport No."
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Category</label>
                    <select
                      value={wizardData.category}
                      onChange={(e) => setWizardData({ ...wizardData, category: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none"
                    >
                      <option value="General">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="EWS">EWS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Mother Tongue</label>
                    <input
                      type="text"
                      value={wizardData.mother_tongue}
                      onChange={(e) => setWizardData({ ...wizardData, mother_tongue: e.target.value })}
                      placeholder="e.g. Hindi, English"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: PARENT / GUARDIAN INFORMATION */}
            {wizardStep === 2 && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="text-sm font-bold text-[#0F172A] border-b border-[#E8E4DF] pb-2">
                  Section B: Parent & Guardian Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Father's Full Name *</label>
                    <input
                      required
                      type="text"
                      value={wizardData.father_name}
                      onChange={(e) => setWizardData({ ...wizardData, father_name: e.target.value })}
                      placeholder="e.g. Rajesh Patel"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Father's Mobile *</label>
                    <input
                      required
                      type="text"
                      value={wizardData.father_phone}
                      onChange={(e) => setWizardData({ ...wizardData, father_phone: e.target.value })}
                      placeholder="+91 98443 12345"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Mother's Full Name</label>
                    <input
                      type="text"
                      value={wizardData.mother_name}
                      onChange={(e) => setWizardData({ ...wizardData, mother_name: e.target.value })}
                      placeholder="e.g. Sunita Patel"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Primary Email Address *</label>
                    <input
                      required
                      type="email"
                      value={wizardData.primary_email}
                      onChange={(e) => setWizardData({ ...wizardData, primary_email: e.target.value })}
                      placeholder="parent.contact@gmail.com"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Residential Address *</label>
                    <input
                      required
                      type="text"
                      value={wizardData.residential_address}
                      onChange={(e) => setWizardData({ ...wizardData, residential_address: e.target.value })}
                      placeholder="Apartment, Street, Landmark"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">City</label>
                    <input
                      type="text"
                      value={wizardData.city}
                      onChange={(e) => setWizardData({ ...wizardData, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Pincode</label>
                    <input
                      type="text"
                      value={wizardData.pincode}
                      onChange={(e) => setWizardData({ ...wizardData, pincode: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: PREVIOUS SCHOOL INFORMATION */}
            {wizardStep === 3 && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="text-sm font-bold text-[#0F172A] border-b border-[#E8E4DF] pb-2">
                  Section C: Academic History & Previous Institution
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Previous School Name</label>
                    <input
                      type="text"
                      value={wizardData.previous_school_name}
                      onChange={(e) => setWizardData({ ...wizardData, previous_school_name: e.target.value })}
                      placeholder="Leave blank if first admission (Nursery)"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Board of Affiliation</label>
                    <select
                      value={wizardData.previous_board}
                      onChange={(e) => setWizardData({ ...wizardData, previous_board: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none"
                    >
                      <option value="CBSE">CBSE</option>
                      <option value="ICSE">ICSE</option>
                      <option value="State Board">State Board</option>
                      <option value="IB / Cambridge">IB / Cambridge</option>
                      <option value="None">None / Direct Entry</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Last Class Passed</label>
                    <input
                      type="text"
                      value={wizardData.previous_class}
                      onChange={(e) => setWizardData({ ...wizardData, previous_class: e.target.value })}
                      placeholder="e.g. Class 9"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Transfer Certificate (TC) Number</label>
                    <input
                      type="text"
                      value={wizardData.previous_tc_number}
                      onChange={(e) => setWizardData({ ...wizardData, previous_tc_number: e.target.value })}
                      placeholder="TC/2025/..."
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Aggregate Marks / CGPA Percentage</label>
                    <input
                      type="text"
                      value={wizardData.previous_marks_percentage}
                      onChange={(e) => setWizardData({ ...wizardData, previous_marks_percentage: e.target.value })}
                      placeholder="e.g. 88.5%"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Reason for Leaving</label>
                    <input
                      type="text"
                      value={wizardData.previous_reason_for_leaving}
                      onChange={(e) => setWizardData({ ...wizardData, previous_reason_for_leaving: e.target.value })}
                      placeholder="e.g. Parental transfer, Seeking better infrastructure"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: ACADEMIC ALLOCATION */}
            {wizardStep === 4 && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="text-sm font-bold text-[#0F172A] border-b border-[#E8E4DF] pb-2">
                  Section D: Academic Class, Section & Stream Allocation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Academic Session *</label>
                    <input
                      readOnly
                      type="text"
                      value={wizardData.academic_session}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-bold text-[#6D28D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Admitting Class (Nursery to 12) *</label>
                    <select
                      value={wizardData.class_id}
                      onChange={(e) => {
                        const newCls = e.target.value;
                        const secs = sections.filter((s) => s.class_id === newCls);
                        setWizardData({
                          ...wizardData,
                          class_id: newCls,
                          section_id: secs.length > 0 ? secs[0].id : '',
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none"
                    >
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>{cls.name} ({cls.stage})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Section *</label>
                    <select
                      value={wizardData.section_id}
                      onChange={(e) => setWizardData({ ...wizardData, section_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none"
                    >
                      {currentClassSections.map((sec) => (
                        <option key={sec.id} value={sec.id}>Section {sec.name}</option>
                      ))}
                    </select>
                  </div>

                  {isHigherSecondary && (
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">Stream (Class 11/12) *</label>
                      <select
                        value={wizardData.stream}
                        onChange={(e) => setWizardData({ ...wizardData, stream: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none"
                      >
                        <option value="Science">Science (Physics, Chemistry, Maths/Bio)</option>
                        <option value="Commerce">Commerce (Accountancy, Business Studies, Economics)</option>
                        <option value="Humanities">Humanities / Arts (History, Pol Science, Sociology)</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Second Language</label>
                    <select
                      value={wizardData.second_language}
                      onChange={(e) => setWizardData({ ...wizardData, second_language: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none"
                    >
                      <option value="Hindi">Hindi</option>
                      <option value="Sanskrit">Sanskrit</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Roll Number (Optional Auto-Generate)</label>
                    <input
                      type="text"
                      value={wizardData.roll_number}
                      onChange={(e) => setWizardData({ ...wizardData, roll_number: e.target.value })}
                      placeholder="Leave blank for automatic allocation"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: DOCUMENT CHECKLIST */}
            {wizardStep === 5 && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="text-sm font-bold text-[#0F172A] border-b border-[#E8E4DF] pb-2">
                  Section E: Mandatory Verification Documents Checklist
                </h3>
                <p className="text-xs text-[#64748B]">
                  Confirm physically submitted or uploaded credentials required by educational regulatory boards:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { key: 'doc_birth_certificate', label: 'Municipal Birth Certificate' },
                    { key: 'doc_transfer_certificate', label: 'Original Transfer Certificate (TC) from Previous School' },
                    { key: 'doc_previous_marksheet', label: 'Previous Academic Year Report Card / Marksheet' },
                    { key: 'doc_id_proof', label: 'Government ID Proof (Aadhaar / Passport)' },
                    { key: 'doc_photographs', label: '3 Passport Size Photographs' },
                    { key: 'doc_medical_fitness', label: 'Medical Fitness Certificate & Immunization Record' },
                  ].map((doc) => (
                    <label
                      key={doc.key}
                      className="p-3.5 rounded-xl border border-[#E8E4DF] bg-[#FAF8F5] flex items-center justify-between cursor-pointer hover:border-[#DDD6FE] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText size={16} className="text-[#6D28D9]" />
                        <span className="text-xs font-bold text-[#0F172A]">{doc.label}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={(wizardData as any)[doc.key]}
                        onChange={(e) => setWizardData({ ...wizardData, [doc.key]: e.target.checked })}
                        className="w-4 h-4 rounded text-[#6D28D9] border-[#E8E4DF] focus:ring-[#6D28D9]"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 6: EMERGENCY CONTACT & HEALTH */}
            {wizardStep === 6 && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="text-sm font-bold text-[#0F172A] border-b border-[#E8E4DF] pb-2">
                  Section F: Emergency Contact & Medical Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Emergency Contact Person *</label>
                    <input
                      required
                      type="text"
                      value={wizardData.emergency_contact_name || wizardData.father_name}
                      onChange={(e) => setWizardData({ ...wizardData, emergency_contact_name: e.target.value })}
                      placeholder="e.g. Rajesh Patel"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Relationship</label>
                    <input
                      type="text"
                      value={wizardData.emergency_relationship}
                      onChange={(e) => setWizardData({ ...wizardData, emergency_relationship: e.target.value })}
                      placeholder="Father, Guardian, Uncle"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Emergency Mobile Number *</label>
                    <input
                      required
                      type="text"
                      value={wizardData.emergency_phone || wizardData.father_phone}
                      onChange={(e) => setWizardData({ ...wizardData, emergency_phone: e.target.value })}
                      placeholder="+91 98443 12345"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Known Allergies / Chronic Conditions</label>
                    <input
                      type="text"
                      value={wizardData.known_allergies}
                      onChange={(e) => setWizardData({ ...wizardData, known_allergies: e.target.value })}
                      placeholder="None or list specific medications"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 7: REVIEW, DECLARATION & APPROVAL */}
            {wizardStep === 7 && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="text-sm font-bold text-[#0F172A] border-b border-[#E8E4DF] pb-2">
                  Section G: Application Summary, Declaration & Principal Approval
                </h3>

                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] space-y-2 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div>
                      <span className="text-[#64748B]">Student:</span>{' '}
                      <strong className="text-[#0F172A]">{wizardData.first_name} {wizardData.last_name}</strong>
                    </div>
                    <div>
                      <span className="text-[#64748B]">DOB:</span>{' '}
                      <strong className="text-[#0F172A]">{wizardData.dob}</strong>
                    </div>
                    <div>
                      <span className="text-[#64748B]">Admitting Class:</span>{' '}
                      <strong className="text-[#6D28D9]">
                        {classes.find((c) => c.id === wizardData.class_id)?.name || 'Class 1'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#64748B]">Parent Contact:</span>{' '}
                      <strong className="text-[#0F172A]">{wizardData.father_name} ({wizardData.father_phone})</strong>
                    </div>
                    <div>
                      <span className="text-[#64748B]">Session:</span>{' '}
                      <strong className="text-[#0F172A]">{wizardData.academic_session}</strong>
                    </div>
                    <div>
                      <span className="text-[#64748B]">Allergies:</span>{' '}
                      <strong className="text-[#0F172A]">{wizardData.known_allergies || 'None'}</strong>
                    </div>
                  </div>
                </div>

                <label className="p-4 rounded-xl border border-[#DDD6FE] bg-[#F5F3FF] flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wizardData.parent_declaration_agreed}
                    onChange={(e) => setWizardData({ ...wizardData, parent_declaration_agreed: e.target.checked })}
                    className="w-4 h-4 rounded text-[#6D28D9] border-[#E8E4DF] focus:ring-[#6D28D9] mt-0.5"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-[#0F172A]">Parent & School Administrative Declaration</span>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      I certify that all records and previous credentials submitted are true and verifiable. The candidate fulfills the board age requirement for the requested grade level.
                    </p>
                  </div>
                </label>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">Administrative Endorsement Note</label>
                  <textarea
                    rows={2}
                    value={wizardData.admin_notes}
                    onChange={(e) => setWizardData({ ...wizardData, admin_notes: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                  />
                </div>
              </div>
            )}

            {/* Form Wizard Navigation Buttons */}
            <div className="pt-4 border-t border-[#E8E4DF] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('pipeline')}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#6D28D9] bg-[#F5F3FF] hover:bg-[#EDE9FE] border border-[#DDD6FE] flex items-center gap-1.5"
                >
                  <Save size={13} />
                  <span>Save as Draft</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {wizardStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setWizardStep(wizardStep - 1)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#0F172A] bg-[#FAF8F5] border border-[#E8E4DF] hover:bg-white flex items-center gap-1"
                  >
                    <ChevronLeft size={14} />
                    <span>Previous</span>
                  </button>
                )}

                {wizardStep < 7 ? (
                  <button
                    type="button"
                    onClick={() => setWizardStep(wizardStep + 1)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#6D28D9] hover:bg-[#5B21B6] flex items-center gap-1 shadow-xs"
                  >
                    <span>Next Section</span>
                    <ChevronRight size={14} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting || !wizardData.parent_declaration_agreed}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#059669] hover:bg-[#047857] disabled:opacity-50 flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Check size={14} />
                    <span>{isSubmitting ? 'Enrolling Student...' : 'Approve & Formally Admit'}</span>
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      )}

      {/* QUICK ENQUIRY MODAL */}
      {isEnquiryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-2xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#E8E4DF] shadow-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E4DF]">
              <h3 className="text-base font-bold text-[#0F172A]">Register New Enquiry</h3>
              <button onClick={() => setIsEnquiryModalOpen(false)} className="text-[#64748B] hover:text-[#0F172A]">✕</button>
            </div>

            <form onSubmit={handleAddEnquiry} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">Student Candidate Name *</label>
                <input
                  required
                  type="text"
                  value={enqStudentName}
                  onChange={(e) => setEnqStudentName(e.target.value)}
                  placeholder="e.g. Vihaan Singhania"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">Parent / Guardian Name *</label>
                <input
                  required
                  type="text"
                  value={enqParentName}
                  onChange={(e) => setEnqParentName(e.target.value)}
                  placeholder="e.g. Sanjay Singhania"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">Phone Number *</label>
                  <input
                    required
                    type="text"
                    value={enqPhone}
                    onChange={(e) => setEnqPhone(e.target.value)}
                    placeholder="+91 98112 44321"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">Target Class *</label>
                  <select
                    value={enqTargetClass}
                    onChange={(e) => setEnqTargetClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.name}>{cls.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">Parent Email</label>
                <input
                  type="email"
                  value={enqEmail}
                  onChange={(e) => setEnqEmail(e.target.value)}
                  placeholder="sanjay@singhania.com"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">Initial Discussion Notes</label>
                <textarea
                  rows={2}
                  value={enqNotes}
                  onChange={(e) => setEnqNotes(e.target.value)}
                  placeholder="Parent requirements, bus inquiry, previous school background..."
                  className="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E4DF]">
                <button
                  type="button"
                  onClick={() => setIsEnquiryModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#6D28D9] hover:bg-[#5B21B6] shadow-xs"
                >
                  Save Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
