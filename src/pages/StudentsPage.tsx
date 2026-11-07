import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  Plus,
  Upload,
  Search,
  CheckCircle2,
  Trash2,
  ArrowUpRight,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { studentService, StudentListResponse } from '../services/studentService';
import { academicService } from '../services/academicService';
import { exportToExcel } from '../utils/exportUtils';
import { Student, ClassItem, Section } from '../types/database.types';

export const StudentsPage: React.FC = () => {
  const { role, user } = useAuth();
  const institutionId = user?.institution?.id || 'e8b070c0-dacd-4772-85df-0ce93748524c';

  const [studentData, setStudentData] = useState<StudentListResponse>({
    students: [],
    total: 0,
    page: 1,
    totalPages: 1,
  });

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('all');
  const [page, setPage] = useState(1);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [targetStudent, setTargetStudent] = useState<Student | null>(null);

  // Add Student Form State
  const [fullName, setFullName] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [formClassId, setFormClassId] = useState('class-10');
  const [formSectionId, setFormSectionId] = useState('sec-class10-a');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('2010-05-15');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [emergencyContact, setEmergencyContact] = useState('+91 98443 67890');
  const [parentName, setParentName] = useState('Mr. Rajesh Patel');
  const [address, setAddress] = useState('B-402, Lotus Greens, New Delhi');

  // Promote Form State
  const [promoteClassId, setPromoteClassId] = useState('class-11');
  const [promoteSectionId, setPromoteSectionId] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadMetadata();
  }, [institutionId]);

  useEffect(() => {
    fetchStudents();
  }, [institutionId, searchTerm, selectedClassId, selectedSectionId, page]);

  const loadMetadata = async () => {
    const clsList = await academicService.getClasses(institutionId);
    setClasses(clsList);
    const secList = await academicService.getSections();
    setSections(secList);
  };

  const fetchStudents = async () => {
    const res = await studentService.getStudents({
      institutionId,
      search: searchTerm,
      classId: selectedClassId === 'all' ? undefined : selectedClassId,
      sectionId: selectedSectionId === 'all' ? undefined : selectedSectionId,
      page,
      pageSize: 10,
    });
    setStudentData(res);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !admissionNumber) return;

    await studentService.addStudent({
      fullName,
      admissionNumber,
      rollNumber,
      classId: formClassId,
      sectionId: formSectionId,
      gender,
      dateOfBirth: dob,
      bloodGroup,
      emergencyContact,
      address,
      institutionId,
    });

    await fetchStudents();
    setIsAddModalOpen(false);
    resetForm();
    setToastMessage(`Student "${fullName}" enrolled successfully!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBulkImport = async () => {
    const sampleBatch = [
      { fullName: 'Aditya Kashyap', admissionNumber: 'SIS/2025/1101', rollNumber: '21', classId: 'class-10', sectionId: 'sec-class10-a', gender: 'Male' },
      { fullName: 'Meera Chawla', admissionNumber: 'SIS/2025/1102', rollNumber: '22', classId: 'class-10', sectionId: 'sec-class10-a', gender: 'Female' },
      { fullName: 'Rohan Deshmukh', admissionNumber: 'SIS/2025/1103', rollNumber: '23', classId: 'class-10', sectionId: 'sec-class10-a', gender: 'Male' },
    ];

    const count = await studentService.bulkImportStudents(sampleBatch, institutionId);
    await fetchStudents();
    setIsBulkModalOpen(false);
    setToastMessage(`Bulk import verified: ${count} student records enrolled!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePromoteStudent = async () => {
    if (!targetStudent || !promoteClassId) return;

    await studentService.promoteStudent(
      targetStudent.id,
      promoteClassId,
      promoteSectionId || 'sec-class11-a'
    );

    await fetchStudents();
    setIsPromoteModalOpen(false);
    setToastMessage(`Student ${targetStudent.profile?.full_name} promoted to next academic grade!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSoftDelete = async (id: string, name: string) => {
    if (!window.confirm(`Withdraw / archive student ${name}?`)) return;
    await studentService.softDeleteStudent(id);
    await fetchStudents();
    setToastMessage(`Student ${name} status marked as Withdrawn.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportRoster = () => {
    exportToExcel(
      studentData.students.map((s) => ({
        'Admission Number': s.admission_number,
        'Roll Number': s.roll_number || '1',
        'Student Name': s.profile?.full_name || '',
        'Class': s.class?.name || 'Class 10',
        'Section': s.section?.name || 'A',
        'Gender': s.gender || 'Not Specified',
        'Emergency Contact': s.emergency_contact || '',
      })),
      'Edunexa_Students_Roster.xlsx'
    );
    setToastMessage('Student roster exported to Excel successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const resetForm = () => {
    setFullName('');
    setAdmissionNumber('');
    setRollNumber('');
  };

  const canManage = ['school_admin', 'super_admin', 'college_admin'].includes(role || '');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
            <Users className="text-[#6D28D9]" size={28} />
            <span>Student Management & Enrollment</span>
          </h1>
          <p className="text-xs md:text-sm font-semibold text-[#64748B] mt-0.5">
            Admission profiles, bulk Excel import, class allocation, and academic promotion
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {canManage && (
            <>
              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-[#FAF8F5] hover:bg-[#FFFFFF] text-[#0F172A] border border-[#E8E4DF] shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Upload size={14} className="text-[#6D28D9]" />
                <span>Bulk Import (Excel/CSV)</span>
              </button>

              <button
                onClick={() => {
                  setAdmissionNumber(`SIS/2025/${Math.floor(1000 + Math.random() * 9000)}`);
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#6D28D9] text-white hover:bg-[#5B21B6] transition-all shadow-xs flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Add Student</span>
              </button>
            </>
          )}

          <button
            onClick={handleExportRoster}
            className="p-2 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#0F172A] border border-[#E8E4DF] shadow-xs transition-colors"
            title="Export Roster"
          >
            <Download size={15} className="text-[#6D28D9]" />
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#DDD6FE] text-[#0F172A] text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={16} className="text-[#6D28D9]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Search & Filter Bar in Cream Pink Card */}
      <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DF] flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-2.5 flex-1 min-w-[240px] bg-white px-3.5 py-2 rounded-xl border border-[#E8E4DF]">
          <Search size={16} className="text-[#6D28D9]" />
          <input
            type="text"
            placeholder="Search by student name, roll number, or admission ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs font-bold text-[#0F172A] placeholder-[#94A3B8] outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-extrabold text-[#0F172A]">Class:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
            >
              <option value="all">All Classes (Nursery–12)</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs font-extrabold text-[#6D28D9] bg-[#FFFFFF] px-2.5 py-1 rounded-xl">
            Total: {studentData.total} Students
          </span>
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-2xl bg-white overflow-hidden border border-[#E8E4DF] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#0F172A] font-extrabold border-b border-[#E8E4DF]">
              <tr>
                <th className="p-3.5 pl-6">Admission #</th>
                <th className="p-3.5">Roll</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Class & Section</th>
                <th className="p-3.5">Gender</th>
                <th className="p-3.5">Contact</th>
                <th className="p-3.5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DF]">
              {studentData.students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs font-semibold text-[#64748B]">
                    No student records found matching the query criteria.
                  </td>
                </tr>
              ) : (
                studentData.students.map((student) => (
                  <tr key={student.id} className="hover:bg-[#FFFFFF]/60 transition-colors">
                    <td className="p-3.5 pl-6 font-stat font-extrabold text-[#6D28D9]">
                      {student.admission_number}
                    </td>
                    <td className="p-3.5 font-stat font-bold text-[#0F172A]">{student.roll_number || '1'}</td>
                    <td className="p-3.5 font-extrabold text-[#0F172A]">
                      {student.profile?.full_name}
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-[#0F172A]">
                        {student.class?.name || 'Class 10'} - {student.section?.name || 'A'}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-[#64748B]">{student.gender || 'Not Specified'}</td>
                    <td className="p-3.5 font-stat font-semibold text-[#64748B]">
                      {student.emergency_contact || '—'}
                    </td>
                    <td className="p-3.5 pr-6 text-right">
                      {canManage && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setTargetStudent(student);
                              setIsPromoteModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#FFFFFF] text-[#6D28D9] hover:bg-[#F9D5E2] flex items-center gap-1 transition-colors"
                            title="Promote to Next Class"
                          >
                            <ArrowUpRight size={12} />
                            <span>Promote</span>
                          </button>
                          <button
                            onClick={() =>
                              handleSoftDelete(student.id, student.profile?.full_name || 'Student')
                            }
                            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#6D28D9] transition-colors"
                            title="Withdraw Student"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal in Light Pink Card */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 border border-[#E8E4DF] shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E4DF]">
              <h3 className="font-heading font-extrabold text-lg text-[#0F172A]">
                Enroll New Student
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-xs font-bold text-[#64748B] hover:text-[#0F172A]">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#0F172A] block mb-1">
                    Full Student Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Advait Singhania"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#0F172A] block mb-1">
                    Admission Number
                  </label>
                  <input
                    type="text"
                    value={admissionNumber}
                    onChange={(e) => setAdmissionNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-stat font-extrabold text-[#6D28D9] focus:outline-none focus:border-[#6D28D9]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#0F172A] block mb-1">Roll #</label>
                  <input
                    type="text"
                    placeholder="25"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#0F172A] block mb-1">Class</label>
                  <select
                    value={formClassId}
                    onChange={(e) => setFormClassId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#0F172A] block mb-1">Section</label>
                  <select
                    value={formSectionId}
                    onChange={(e) => setFormSectionId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                  >
                    <option value="sec-class10-a">Section A</option>
                    <option value="sec-class10-b">Section B</option>
                    <option value="sec-class10-c">Section C</option>
                    <option value="sec-class10-d">Section D</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#0F172A] block mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#0F172A] block mb-1">Emergency Phone</label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#0F172A] block mb-1">Parent / Guardian Name</label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#0F172A] block mb-1">Residential Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E4DF]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#6D28D9] text-white hover:bg-[#5B21B6] shadow-xs"
                >
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 border border-[#E8E4DF] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E4DF]">
              <h3 className="font-heading font-extrabold text-lg text-[#0F172A]">
                Bulk Student Import (CSV/Excel)
              </h3>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-xs font-bold text-[#64748B] hover:text-[#0F172A]">
                ✕
              </button>
            </div>

            <div className="p-6 border-2 border-dashed border-[#DDD6FE] bg-[#FAF8F5] rounded-2xl text-center space-y-2">
              <FileSpreadsheet size={28} className="mx-auto text-[#6D28D9]" />
              <p className="text-xs font-extrabold text-[#0F172A]">
                Upload CSV or Excel Spreadsheet (.xlsx, .csv)
              </p>
              <p className="text-[11px] font-semibold text-[#64748B]">
                Columns: Full Name, Admission No, Roll No, Class, Section, Gender, Emergency Phone
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#FAF8F5]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkImport}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#6D28D9] text-white hover:bg-[#5B21B6] shadow-xs"
              >
                Parse & Import 3 Sample Records
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promote Student Modal */}
      {isPromoteModalOpen && targetStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 border border-[#E8E4DF] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E4DF]">
              <h3 className="font-heading font-extrabold text-lg text-[#0F172A]">
                Promote Student to Next Academic Class
              </h3>
              <button onClick={() => setIsPromoteModalOpen(false)} className="text-xs font-bold text-[#64748B] hover:text-[#0F172A]">
                ✕
              </button>
            </div>

            <p className="text-xs font-semibold text-[#64748B]">
              Promote <strong className="text-[#0F172A] font-extrabold">{targetStudent.profile?.full_name}</strong> ({targetStudent.admission_number}) from {targetStudent.class?.name || 'Class 10'} to:
            </p>

            <div>
              <label className="text-xs font-bold text-[#0F172A] block mb-1">Target Class</label>
              <select
                value={promoteClassId}
                onChange={(e) => setPromoteClassId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.stage})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsPromoteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#FAF8F5]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePromoteStudent}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#6D28D9] text-white hover:bg-[#5B21B6] shadow-xs"
              >
                Confirm Promotion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
