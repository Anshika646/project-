import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  Search,
  Filter,
  Download,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { DEMO_STUDENT } from '../services/mockData';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';

export const StudentsPage: React.FC = () => {
  const { user, role } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [students, setStudents] = useState([
    DEMO_STUDENT,
    {
      ...DEMO_STUDENT,
      id: 'stud-2',
      roll_number: '15',
      admission_number: 'SIS/2022/1043',
      profile_id: 'user-stud-2',
      profile: { full_name: 'Diya Sharma', email: 'diya.sharma@edunexa.edu', role: 'student' as const },
    },
    {
      ...DEMO_STUDENT,
      id: 'stud-3',
      roll_number: '16',
      admission_number: 'SIS/2022/1044',
      profile_id: 'user-stud-3',
      profile: { full_name: 'Ishaan Verma', email: 'ishaan.verma@edunexa.edu', role: 'student' as const },
    },
    {
      ...DEMO_STUDENT,
      id: 'stud-4',
      roll_number: '17',
      admission_number: 'SIS/2022/1045',
      class_id: 'class-9',
      profile_id: 'user-stud-4',
      profile: { full_name: 'Ananya Deshmukh', email: 'ananya.d@edunexa.edu', role: 'student' as const },
    },
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  const handleSoftDelete = (id: string, name: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setNotification(`Student ${name} was soft-deleted (is_deleted: true) as requested.`);
    setTimeout(() => setNotification(null), 3500);
  };

  const filtered = students.filter((s) => {
    const name = s.profile?.full_name || 'Aarav Patel';
    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      s.admission_number.toLowerCase().includes(search.toLowerCase()) ||
      (s.roll_number && s.roll_number.includes(search));
    const matchesClass = selectedClass === 'All' || (selectedClass === 'Class 10' ? s.class_id === 'class-10' : s.class_id === 'class-9');
    return matchesSearch && matchesClass;
  });

  const handleExportPDF = () => {
    exportToPDF(
      'Student Enrollment Register — Springfield Academy',
      [
        { header: 'Admission No', dataKey: 'adm' },
        { header: 'Roll No', dataKey: 'roll' },
        { header: 'Full Name', dataKey: 'name' },
        { header: 'Class', dataKey: 'cls' },
        { header: 'Emergency Contact', dataKey: 'contact' },
      ],
      filtered.map((s) => ({
        adm: s.admission_number,
        roll: s.roll_number,
        name: s.profile?.full_name || 'Aarav Patel',
        cls: s.class_id === 'class-10' ? 'Class 10-A' : 'Class 9-A',
        contact: s.emergency_contact || '+91 98443 67890',
      })),
      'Students_Register.pdf'
    );
  };

  const handleExportExcel = () => {
    exportToExcel(
      filtered.map((s) => ({
        'Admission Number': s.admission_number,
        'Roll Number': s.roll_number,
        'Full Name': s.profile?.full_name || 'Aarav Patel',
        Class: s.class_id === 'class-10' ? 'Class 10-A' : 'Class 9-A',
        'Emergency Contact': s.emergency_contact,
        Gender: s.gender,
      })),
      'Students_Register.xlsx'
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#232F25] dark:text-[#F0F5F1] tracking-tight">
            Student Management
          </h1>
          <p className="text-xs md:text-sm text-[#667768] dark:text-[#9FB1A2] mt-0.5">
            Admission register, roll allocation, academic records, and soft deletions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="px-3 py-2 rounded-xl text-xs font-semibold glass-card hover:bg-white/90 text-[#324234] dark:text-[#D1E0D3] border border-white/70 dark:border-white/10 shadow-sm flex items-center gap-1.5"
          >
            <Download size={14} className="text-[#5B6E5E]" />
            <span>PDF Export</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="px-3 py-2 rounded-xl text-xs font-semibold glass-card hover:bg-white/90 text-[#324234] dark:text-[#D1E0D3] border border-white/70 dark:border-white/10 shadow-sm flex items-center gap-1.5"
          >
            <Download size={14} className="text-[#5B6E5E]" />
            <span>Excel Export</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="px-4 py-3 rounded-xl bg-[#8DA390]/20 border border-[#8DA390]/40 text-[#213123] dark:text-[#E2ECE4] text-xs font-semibold flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-xs opacity-70">✕</button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl glass-card border border-white/70 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8A7C]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, roll, admission no..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs glass-input"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#455648] dark:text-[#C5D3C6]">
            <Filter size={14} />
            <span>Class:</span>
          </div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs bg-white/70 dark:bg-black/20 border border-[#8DA390]/30 rounded-xl px-3 py-1.5 font-medium text-[#253227] dark:text-white"
          >
            <option value="All">All Classes</option>
            <option value="Class 10">Class 10</option>
            <option value="Class 9">Class 9</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl glass-card p-5 border border-white/70 dark:border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/5 text-[#657667] dark:text-[#9FB1A2]">
                <th className="pb-3 font-semibold">Admission No</th>
                <th className="pb-3 font-semibold">Roll No</th>
                <th className="pb-3 font-semibold">Student Name</th>
                <th className="pb-3 font-semibold">Class & Section</th>
                <th className="pb-3 font-semibold">Emergency Contact</th>
                <th className="pb-3 font-semibold">Status</th>
                {['school_admin', 'super_admin'].includes(role || '') && (
                  <th className="pb-3 font-semibold text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {filtered.map((s) => {
                const name = s.profile?.full_name || 'Aarav Patel';
                return (
                  <tr key={s.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 font-mono font-bold text-[#5B6E5E] dark:text-[#A3B899]">
                      {s.admission_number}
                    </td>
                    <td className="py-3 font-mono font-bold text-[#232F25] dark:text-[#F0F5F1]">
                      #{s.roll_number}
                    </td>
                    <td className="py-3 font-bold text-[#232F25] dark:text-[#F0F5F1]">
                      {name}
                    </td>
                    <td className="py-3">
                      {s.class_id === 'class-10' ? 'Class 10-A' : 'Class 9-A'}
                    </td>
                    <td className="py-3 tabular-nums font-mono text-[#546456] dark:text-[#A0B0A3]">
                      {s.emergency_contact || '+91 98443 67890'}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#8DA390]/20 text-[#2C3B2E] dark:text-[#E2ECE4]">
                        Enrolled Active
                      </span>
                    </td>
                    {['school_admin', 'super_admin'].includes(role || '') && (
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleSoftDelete(s.id, name)}
                          title="Soft delete student (is_deleted: true)"
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
