import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle2, Calendar, Download, Filter } from 'lucide-react';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';

export const AttendancePage: React.FC = () => {
  const { role } = useAuth();
  const [selectedClass, setSelectedClass] = useState('Class 10-A');
  const [selectedDate, setSelectedDate] = useState('2025-04-21');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [roster, setRoster] = useState([
    { id: '1', roll: '14', name: 'Aarav Patel', status: 'present' },
    { id: '2', roll: '15', name: 'Diya Sharma', status: 'present' },
    { id: '3', roll: '16', name: 'Ishaan Verma', status: 'late' },
    { id: '4', roll: '17', name: 'Ananya Deshmukh', status: 'present' },
    { id: '5', roll: '18', name: 'Rohan Gupta', status: 'absent' },
  ]);

  const toggleStatus = (id: string, newStatus: string) => {
    setRoster((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportPDF = () => {
    exportToPDF(
      `Daily Attendance Sheet — ${selectedClass} (${selectedDate})`,
      [
        { header: 'Roll No', dataKey: 'roll' },
        { header: 'Student Name', dataKey: 'name' },
        { header: 'Attendance Status', dataKey: 'status' },
      ],
      roster.map((r) => ({
        roll: `#${r.roll}`,
        name: r.name,
        status: r.status.toUpperCase(),
      })),
      `Attendance_${selectedClass}.pdf`
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#232F25] dark:text-[#F0F5F1] tracking-tight">
            Attendance Records & Register
          </h1>
          <p className="text-xs md:text-sm text-[#667768] dark:text-[#9FB1A2] mt-0.5">
            Daily roll-call marking, attendance percentage audit, and monthly sheets
          </p>
        </div>

        <button
          onClick={handleExportPDF}
          className="px-3 py-2 rounded-xl text-xs font-semibold glass-card hover:bg-white/90 text-[#324234] dark:text-[#D1E0D3] border border-white/70 dark:border-white/10 shadow-sm flex items-center gap-1.5 self-start md:self-auto"
        >
          <Download size={14} className="text-[#5B6E5E]" />
          <span>Export Sheet (PDF)</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="px-4 py-3 rounded-xl bg-[#8DA390]/20 border border-[#8DA390]/40 text-[#213123] dark:text-[#E2ECE4] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#5B6E5E]" />
          <span>Daily attendance successfully recorded and stored in audit trail.</span>
        </div>
      )}

      {/* Selector Toolbar */}
      <div className="p-4 rounded-2xl glass-card border border-white/70 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-[#5B6E5E]" />
            <span className="text-xs font-semibold text-[#253227] dark:text-[#E2ECE4]">Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="text-xs bg-white/70 dark:bg-black/20 border border-[#8DA390]/30 rounded-xl px-2.5 py-1 font-medium"
            >
              <option value="Class 10-A">Class 10-A</option>
              <option value="Class 10-B">Class 10-B</option>
              <option value="Class 9-A">Class 9-A</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-[#5B6E5E]" />
            <span className="text-xs font-semibold text-[#253227] dark:text-[#E2ECE4]">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs bg-white/70 dark:bg-black/20 border border-[#8DA390]/30 rounded-xl px-2.5 py-1 font-medium"
            />
          </div>
        </div>

        {['school_admin', 'teacher', 'college_faculty'].includes(role || '') && (
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#5B6E5E] hover:bg-[#4A5B4D] transition-colors shadow-sm"
          >
            Save Daily Attendance
          </button>
        )}
      </div>

      {/* Roster Table */}
      <div className="rounded-2xl glass-card p-5 border border-white/70 dark:border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/5 text-[#657667] dark:text-[#9FB1A2]">
                <th className="pb-3 font-semibold">Roll No</th>
                <th className="pb-3 font-semibold">Student Name</th>
                <th className="pb-3 font-semibold">Current Status</th>
                <th className="pb-3 font-semibold text-right">Action / Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {roster.map((row) => (
                <tr key={row.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3 font-mono font-bold text-[#5B6E5E]">
                    #{row.roll}
                  </td>
                  <td className="py-3 font-bold text-[#232F25] dark:text-[#F0F5F1]">
                    {row.name}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        row.status === 'present'
                          ? 'bg-[#8DA390]/20 text-[#243527] dark:text-[#E2ECE4]'
                          : row.status === 'absent'
                          ? 'bg-[#E57373]/20 text-[#9C3838]'
                          : 'bg-[#F4C062]/20 text-[#8C5D17]'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      {['present', 'absent', 'late'].map((st) => (
                        <button
                          key={st}
                          onClick={() => toggleStatus(row.id, st)}
                          className={`px-2 py-1 rounded text-[10px] font-semibold capitalize ${
                            row.status === st
                              ? 'bg-[#5B6E5E] text-white'
                              : 'bg-white/60 dark:bg-white/5 text-[#5B6E5E]'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
