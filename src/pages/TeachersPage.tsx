import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, Search, Download, Trash2, Mail, Phone } from 'lucide-react';
import { DEMO_TEACHER } from '../services/mockData';
import { exportToPDF } from '../utils/exportUtils';

export const TeachersPage: React.FC = () => {
  const { role } = useAuth();
  const [search, setSearch] = useState('');
  const [teachers, setTeachers] = useState([
    DEMO_TEACHER,
    {
      ...DEMO_TEACHER,
      id: 'teach-2',
      employee_code: 'EMP-T-043',
      designation: 'PGT Science & Physics',
      qualification: 'M.Sc Physics',
      specialization: 'Optics, Mechanics & Electromagnetism',
      profile: { full_name: 'Dr. Suresh Rao', email: 'suresh.rao@edunexa.edu', role: 'teacher' as const },
    },
    {
      ...DEMO_TEACHER,
      id: 'teach-3',
      employee_code: 'EMP-T-044',
      designation: 'TGT English & Literature',
      qualification: 'M.A English, B.Ed',
      specialization: 'Shakespearean Drama & Grammar',
      profile: { full_name: 'Mrs. Anita Das', email: 'anita.das@edunexa.edu', role: 'teacher' as const },
    },
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  const handleSoftDelete = (id: string, name: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
    setNotification(`Teacher ${name} was soft-deleted (is_deleted: true).`);
    setTimeout(() => setNotification(null), 3000);
  };

  const filtered = teachers.filter((t) => {
    const name = t.profile?.full_name || 'Ms. Priya Verma';
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      t.employee_code.toLowerCase().includes(search.toLowerCase()) ||
      (t.specialization && t.specialization.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#232F25] dark:text-[#F0F5F1] tracking-tight">
            Faculty & Teacher Management
          </h1>
          <p className="text-xs md:text-sm text-[#667768] dark:text-[#9FB1A2] mt-0.5">
            Teaching staff directory, subject allocation, and qualifications
          </p>
        </div>

        <button
          onClick={() => {
            exportToPDF(
              'Faculty Staff Directory — Springfield Academy',
              [
                { header: 'Emp Code', dataKey: 'code' },
                { header: 'Name', dataKey: 'name' },
                { header: 'Designation', dataKey: 'desig' },
                { header: 'Specialization', dataKey: 'spec' },
              ],
              filtered.map((t) => ({
                code: t.employee_code,
                name: t.profile?.full_name || 'Ms. Priya Verma',
                desig: t.designation || 'Faculty',
                spec: t.specialization || 'General',
              })),
              'Faculty_Directory.pdf'
            );
          }}
          className="px-3 py-2 rounded-xl text-xs font-semibold glass-card hover:bg-white/90 text-[#324234] dark:text-[#D1E0D3] border border-white/70 dark:border-white/10 shadow-sm flex items-center gap-1.5 self-start md:self-auto"
        >
          <Download size={14} className="text-[#5B6E5E]" />
          <span>Export Directory (PDF)</span>
        </button>
      </div>

      {notification && (
        <div className="px-4 py-3 rounded-xl bg-[#8DA390]/20 border border-[#8DA390]/40 text-[#213123] dark:text-[#E2ECE4] text-xs font-semibold">
          {notification}
        </div>
      )}

      {/* Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {filtered.map((teacher) => {
          const name = teacher.profile?.full_name || 'Ms. Priya Verma';
          const email = teacher.profile?.email || 'priya.verma@edunexa.edu';

          return (
            <div
              key={teacher.id}
              className="rounded-2xl glass-card p-5 border border-white/70 dark:border-white/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7D9D85] to-[#4D5E50] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#8DA390]/15 text-[#303E33] dark:text-[#D1E0D3]">
                    {teacher.employee_code}
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-bold text-[#232F25] dark:text-[#F0F5F1]">
                    {name}
                  </h3>
                  <p className="text-xs font-semibold text-[#5B6E5E] dark:text-[#A3B899] mt-0.5">
                    {teacher.designation}
                  </p>
                  <p className="text-[11px] text-[#637466] dark:text-[#95A597] mt-2">
                    {teacher.qualification} • {teacher.specialization}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#556658] dark:text-[#A0B0A3] truncate max-w-[180px]">
                  {email}
                </span>
                {['school_admin', 'super_admin'].includes(role || '') && (
                  <button
                    onClick={() => handleSoftDelete(teacher.id, name)}
                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-500/10 transition-colors"
                    title="Soft delete teacher"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
