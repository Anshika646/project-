import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  GraduationCap,
  Search,
  Download,
  Trash2,
  Mail,
  Phone,
  Plus,
  CheckCircle2,
  BookOpen,
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#232F25] dark:text-[#F0F5F1] tracking-tight flex items-center gap-2">
            <GraduationCap className="text-[#DA5FCE]" size={28} />
            <span>Faculty & Teacher Management</span>
          </h1>
          <p className="text-xs md:text-sm text-[#667768] dark:text-[#9FB1A2] mt-0.5">
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
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#DA5FCE] text-white hover:bg-[#C64EBA] transition-colors shadow-sm flex items-center gap-1.5"
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
            className="px-3 py-2 rounded-xl text-xs font-semibold glass-card hover:bg-white/90 text-[#324234] dark:text-[#D1E0D3] border border-white/70 shadow-sm flex items-center gap-1.5"
          >
            <Download size={14} className="text-[#DA5FCE]" />
            <span>Export Directory (PDF)</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-[#8DA390]/20 border border-[#8DA390]/40 text-[#213123] dark:text-[#E2ECE4] text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 size={16} className="text-[#DA5FCE]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="p-4 rounded-2xl glass-card border border-white/70 flex items-center gap-2">
        <Search size={16} className="text-[#8DA390]" />
        <input
          type="text"
          placeholder="Search by faculty name, designation, specialization, or employee code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs text-[#232F25] dark:text-[#F0F5F1] outline-none"
        />
      </div>

      {/* Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((teacher) => {
          const name = teacher.profile?.full_name || 'Faculty Member';
          const email = teacher.profile?.email || 'faculty@edunexa.edu';

          return (
            <div
              key={teacher.id}
              className="rounded-3xl glass-card p-5 border border-white/70 dark:border-white/10 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-[#DA5FCE]/15 text-[#DA5FCE] font-black text-sm flex items-center justify-center">
                    {name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(-2)
                      .join('')}
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[#DA5FCE]">
                    {teacher.employee_code}
                  </span>
                </div>

                <div className="mt-3.5">
                  <h3 className="text-base font-extrabold text-[#232F25] dark:text-[#F0F5F1]">
                    {name}
                  </h3>
                  <p className="text-xs font-bold text-[#DA5FCE] dark:text-[#A3B899] mt-0.5">
                    {teacher.designation}
                  </p>
                  <p className="text-[11px] text-[#718273] mt-1">
                    {teacher.qualification}
                  </p>
                  {teacher.specialization && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] text-[11px] text-[#556757] dark:text-[#BACBBF]">
                      <span className="font-semibold text-[10px] uppercase block text-[#8DA390]">
                        Specialization:
                      </span>
                      {teacher.specialization}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-[#718273]">
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-[#8DA390]" />
                  <span className="text-[11px] truncate max-w-[160px]">{email}</span>
                </div>

                {canManage && (
                  <button
                    onClick={() => handleSoftDelete(teacher.id, name)}
                    className="p-1 rounded text-[#9AA89C] hover:text-[#A64B56]"
                    title="Archive Faculty"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Teacher Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-white/80 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <h3 className="font-extrabold text-lg text-[#232F25]">
                Onboard Faculty Member
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-xs text-[#667768]">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#C64EBA] block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Alistair Roy"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl glass-input text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#C64EBA] block mb-1">
                    Employee Code
                  </label>
                  <input
                    type="text"
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl glass-input text-xs font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#C64EBA] block mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PGT Biology"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl glass-input text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#C64EBA] block mb-1">
                  Academic Qualification
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ph.D Molecular Biology, B.Ed"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#C64EBA] block mb-1">
                  Subject Specialization
                </label>
                <input
                  type="text"
                  placeholder="e.g. Genetics, Biotechnology, Cellular Physiology"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#DA5FCE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#DA5FCE] text-white hover:bg-[#C64EBA]"
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
