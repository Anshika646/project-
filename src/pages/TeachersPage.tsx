import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  GraduationCap,
  Search,
  Download,
  Trash2,
  Mail,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { teacherService } from '../services/teacherService';
import { exportToPDF } from '../utils/exportUtils';
import { Teacher } from '../types/database.types';

export const TeachersPage: React.FC = () => {
  const { role, user } = useAuth();
  const institutionId = user?.institution?.id || 'e8b070c0-dacd-4772-85df-0ce93748524c';

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [designation, setDesignation] = useState('PGT Faculty');
  const [qualification, setQualification] = useState('');
  const [specialization, setSpecialization] = useState('');

  useEffect(() => {
    loadTeachers();
  }, [institutionId]);

  const loadTeachers = async () => {
    const list = await teacherService.getTeachers(institutionId);
    setTeachers(list);
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !employeeCode) return;

    await teacherService.addTeacher({
      fullName,
      email: email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@springfield.edunexa.edu`,
      phone: phone || '+91 98000 00000',
      employeeCode,
      designation,
      qualification,
      specialization,
      institutionId,
    });

    await loadTeachers();
    setIsAddModalOpen(false);
    setFullName('');
    setEmail('');
    setEmployeeCode('');
    setToastMessage(`Faculty member "${fullName}" onboarded successfully!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSoftDelete = (id: string, name: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
    setToastMessage(`Teacher ${name} status marked as archived.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filtered = teachers.filter((t) => {
    const name = t.profile?.full_name || '';
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      t.employee_code.toLowerCase().includes(search.toLowerCase()) ||
      (t.specialization && t.specialization.toLowerCase().includes(search.toLowerCase())) ||
      (t.designation && t.designation.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const canManage = ['school_admin', 'super_admin', 'college_admin'].includes(role || '');

  return (
    <div className="space-y-6 max-w-7xl mx-auto bg-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-[#171417] tracking-tight flex items-center gap-2">
            <GraduationCap className="text-[#8B5CF6]" size={28} />
            <span>Faculty & Teacher Management</span>
          </h1>
          <p className="text-xs md:text-sm font-semibold text-[#625C60] mt-0.5">
            Teaching staff directory, subject allocation, designations, and qualifications
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {canManage && (
            <button
              onClick={() => {
                setEmployeeCode(`EMP-T-${Math.floor(100 + Math.random() * 900)}`);
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Add Faculty Member</span>
            </button>
          )}

          <button
            onClick={() => {
              exportToPDF(
                'Faculty Staff Directory — Springfield International School',
                [
                  { header: 'Emp Code', dataKey: 'code' },
                  { header: 'Faculty Name', dataKey: 'name' },
                  { header: 'Designation', dataKey: 'desig' },
                  { header: 'Qualification', dataKey: 'qual' },
                  { header: 'Specialization', dataKey: 'spec' },
                ],
                filtered.map((t) => ({
                  code: t.employee_code,
                  name: t.profile?.full_name || 'Faculty Member',
                  desig: t.designation || 'Teacher',
                  qual: t.qualification || 'M.Sc, B.Ed',
                  spec: t.specialization || 'General',
                })),
                'Faculty_Directory.pdf'
              );
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FAF5FF] hover:bg-[#F5F3FF] text-[#171417] border border-[#E9D5FF] shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Download size={14} className="text-[#8B5CF6]" />
            <span>Export Directory (PDF)</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-[#F5F3FF] border border-[#C4B5FD] text-[#171417] text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={16} className="text-[#8B5CF6]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Search Input in Cream Pink */}
      <div className="p-4 rounded-2xl bg-[#FAF5FF] border border-[#E9D5FF] flex items-center gap-2.5 shadow-xs">
        <Search size={16} className="text-[#8B5CF6]" />
        <input
          type="text"
          placeholder="Search by faculty name, designation, specialization, or employee code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs font-bold text-[#171417] placeholder-[#858087] outline-none"
        />
      </div>

      {/* Directory Cards in Light Pink and Cream */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((teacher, idx) => {
          const name = teacher.profile?.full_name || 'Faculty Member';
          const email = teacher.profile?.email || 'faculty@edunexa.edu';
          const cardBg = idx % 2 === 0 ? 'bg-[#F5F3FF]' : 'bg-[#FAF5FF]';

          return (
            <div
              key={teacher.id}
              className={`rounded-2xl ${cardBg} p-5 border border-[#E9D5FF] shadow-[0_4px_20px_-4px_rgba(139, 92, 246,0.05)] flex flex-col justify-between hover:shadow-md transition-all`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-white text-[#8B5CF6] border border-[#C4B5FD]/40 font-extrabold text-sm flex items-center justify-center shadow-xs">
                    {name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(-2)
                      .join('')}
                  </div>
                  <span className="text-[10px] font-stat font-extrabold px-2.5 py-0.5 rounded-full bg-white text-[#8B5CF6] border border-[#E9D5FF]">
                    {teacher.employee_code}
                  </span>
                </div>

                <div className="mt-3.5">
                  <h3 className="font-heading text-base font-extrabold text-[#171417]">
                    {name}
                  </h3>
                  <p className="text-xs font-bold text-[#8B5CF6] mt-0.5">
                    {teacher.designation}
                  </p>
                  <p className="text-[11px] font-semibold text-[#625C60] mt-1">
                    {teacher.qualification}
                  </p>
                  {teacher.specialization && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-white border border-[#E9D5FF] text-[11px] text-[#171417]">
                      <span className="font-extrabold text-[10px] uppercase block text-[#8B5CF6]">
                        Specialization:
                      </span>
                      {teacher.specialization}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#E9D5FF] flex items-center justify-between text-xs text-[#625C60]">
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-[#8B5CF6]" />
                  <span className="text-[11px] font-semibold truncate max-w-[160px] text-[#171417]">{email}</span>
                </div>

                {canManage && (
                  <button
                    onClick={() => handleSoftDelete(teacher.id, name)}
                    className="p-1 rounded text-[#858087] hover:text-[#8B5CF6] transition-colors"
                    title="Archive Faculty"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Teacher Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 border border-[#E9D5FF] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E9D5FF]">
              <h3 className="font-heading font-extrabold text-lg text-[#171417]">
                Onboard Faculty Member
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-xs font-bold text-[#625C60] hover:text-[#171417]">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#171417] block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Alistair Roy"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] text-xs font-bold text-[#171417] focus:outline-none focus:border-[#8B5CF6]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#171417] block mb-1">
                    Employee Code
                  </label>
                  <input
                    type="text"
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] text-xs font-stat font-extrabold text-[#8B5CF6] focus:outline-none focus:border-[#8B5CF6]"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#171417] block mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PGT Biology"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] text-xs font-bold text-[#171417] focus:outline-none focus:border-[#8B5CF6]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#171417] block mb-1">
                  Academic Qualification
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ph.D Molecular Biology, B.Ed"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] text-xs font-bold text-[#171417] focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#171417] block mb-1">
                  Subject Specialization
                </label>
                <input
                  type="text"
                  placeholder="e.g. Genetics, Biotechnology, Cellular Physiology"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] text-xs font-bold text-[#171417] focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E9D5FF]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#625C60] hover:bg-[#FAF5FF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#8B5CF6] text-white hover:bg-[#7C3AED] shadow-xs"
                >
                  Save Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
