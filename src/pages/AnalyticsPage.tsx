import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  BarChart3,
  TrendingUp,
  Users,
  Award,
  Download,
  Calendar,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedSession, setSelectedSession] = useState('2025 – 2026');

  const enrollmentBreakdown = [
    { stage: 'Foundational (Nursery, LKG, UKG)', students: 168, sections: 12, ratio: '1:14', passRate: '100%' },
    { stage: 'Primary (Classes 1 to 5)', students: 480, sections: 20, ratio: '1:18', passRate: '98.5%' },
    { stage: 'Middle (Classes 6 to 8)', students: 312, sections: 12, ratio: '1:20', passRate: '96.2%' },
    { stage: 'Secondary (Classes 9 & 10)', students: 180, sections: 8, ratio: '1:22', passRate: '97.8%' },
    { stage: 'Senior Secondary (Classes 11 & 12)', students: 100, sections: 6, ratio: '1:16', passRate: '99.0%' },
  ];

  const handleExportPDF = () => {
    exportToPDF(
      'Edunexa Institutional Academic & Operational Report',
      [
        { header: 'Academic Stage', dataKey: 'stage' },
        { header: 'Enrolled Students', dataKey: 'students' },
        { header: 'Active Sections', dataKey: 'sections' },
        { header: 'Teacher:Student Ratio', dataKey: 'ratio' },
        { header: 'Annual Pass %', dataKey: 'passRate' },
      ],
      enrollmentBreakdown,
      'Edunexa-Institutional-Analytics.pdf'
    );
  };

  const handleExportExcel = () => {
    exportToExcel(
      enrollmentBreakdown.map((item) => ({
        Stage: item.stage,
        Students: item.students,
        Sections: item.sections,
        Ratio: item.ratio,
        PassPercentage: item.passRate,
      })),
      'Edunexa-Institutional-Analytics'
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Institutional Reports & Analytics
          </h1>
          <p className="text-xs md:text-sm font-medium text-[#64748B] mt-0.5">
            Stage-wise enrollment distribution, academic pass percentages, and teacher workload ratios.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-all shadow-xs flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>Export Summary (PDF)</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#0F172A] bg-white border border-[#E8E4DF] hover:bg-[#FAF8F5] transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <FileSpreadsheet size={14} />
            <span>Export (Excel)</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E8E4DF] shadow-2xs">
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Total Enrolled Pupils</span>
          <div className="text-3xl font-extrabold text-[#0F172A] mt-2">1,240</div>
          <span className="text-xs text-[#059669] font-semibold mt-1 block">↑ 5.2% vs previous session</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[#E8E4DF] shadow-2xs">
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Average Attendance</span>
          <div className="text-3xl font-extrabold text-[#0F172A] mt-2">94.2%</div>
          <span className="text-xs text-[#6D28D9] font-semibold mt-1 block">Across all 58 sections</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[#E8E4DF] shadow-2xs">
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Institutional Pass Rate</span>
          <div className="text-3xl font-extrabold text-[#0F172A] mt-2">98.4%</div>
          <span className="text-xs text-[#059669] font-semibold mt-1 block">Qualifying board criteria</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[#E8E4DF] shadow-2xs">
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Faculty to Student Ratio</span>
          <div className="text-3xl font-extrabold text-[#0F172A] mt-2">1:16</div>
          <span className="text-xs text-[#64748B] font-semibold mt-1 block">86 Full-time educators</span>
        </div>
      </div>

      {/* Breakdown by Academic Stage (Nursery to Class 12) */}
      <div className="rounded-2xl bg-white border border-[#E8E4DF] shadow-[0_2px_10px_-2px_rgba(15,23,42,0.03)] p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DF]">
          <div>
            <h2 className="text-sm font-bold text-[#0F172A]">
              Stage-Wise Student & Section Distribution (Nursery to Class 12)
            </h2>
            <p className="text-xs text-[#64748B]">
              National Education Policy stage alignment with active class teacher allocations
            </p>
          </div>
          <span className="text-xs font-bold text-[#6D28D9] bg-[#F5F3FF] px-2.5 py-1 rounded-lg border border-[#DDD6FE]">
            Session {selectedSession}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E8E4DF] text-[#64748B] font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Curricular Stage</th>
                <th className="py-2.5 px-3">Enrolled Pupils</th>
                <th className="py-2.5 px-3">Class Sections</th>
                <th className="py-2.5 px-3">Pupil-Teacher Ratio</th>
                <th className="py-2.5 px-3">Annual Pass Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DF]">
              {enrollmentBreakdown.map((row) => (
                <tr key={row.stage} className="hover:bg-[#FAF8F5]">
                  <td className="py-3 px-3 font-bold text-[#0F172A]">
                    {row.stage}
                  </td>
                  <td className="py-3 px-3 font-extrabold text-[#0F172A]">
                    {row.students} Students
                  </td>
                  <td className="py-3 px-3 text-[#64748B] font-semibold">
                    {row.sections} Sections (A–D)
                  </td>
                  <td className="py-3 px-3 text-[#64748B]">
                    {row.ratio}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                      {row.passRate}
                    </span>
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
