import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BarChart3, Download, FileSpreadsheet, Award, CheckCircle2 } from 'lucide-react';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const reportItems = [
    {
      id: 'rep-1',
      title: 'Class 10-A Cumulative Report Cards',
      category: 'Academic Performance',
      description: 'Term-end grades, subject-wise scores, attendance percentage, and teacher remarks.',
      type: 'PDF',
    },
    {
      id: 'rep-2',
      title: 'Monthly Attendance Analytics',
      category: 'Attendance Audit',
      description: 'Daily presence, leaves, late arrivals, and students below 75% threshold.',
      type: 'Excel/CSV',
    },
    {
      id: 'rep-3',
      title: 'Subject-wise Performance Matrix',
      category: 'Curriculum Analytics',
      description: 'Comparative grade distribution across Mathematics, Science, and English.',
      type: 'PDF',
    },
  ];

  const handleDownload = (item: typeof reportItems[0]) => {
    if (item.type.includes('PDF')) {
      exportToPDF(
        item.title,
        [
          { header: 'Class / Student', dataKey: 'name' },
          { header: 'Metrics / Scores', dataKey: 'score' },
          { header: 'Status / Evaluation', dataKey: 'status' },
        ],
        [
          { name: 'Class 10-A (Aggregate)', score: '91.4% Average', status: 'Exemplary' },
          { name: 'Class 9-A (Aggregate)', score: '88.2% Average', status: 'Good' },
          { name: 'Class 8-B (Aggregate)', score: '86.0% Average', status: 'Satisfactory' },
        ],
        `${item.title.replace(/\s+/g, '_')}.pdf`
      );
    } else {
      exportToExcel(
        [
          { Class: '10-A', 'Total Students': 35, 'Present Avg': '94%', 'Action Required': 'None' },
          { Class: '9-A', 'Total Students': 38, 'Present Avg': '91%', 'Action Required': 'None' },
          { Class: '8-B', 'Total Students': 34, 'Present Avg': '87%', 'Action Required': 'Follow up with 2 parents' },
        ],
        `${item.title.replace(/\s+/g, '_')}.xlsx`
      );
    }

    setDownloadSuccess(`Report "${item.title}" generated successfully!`);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#232F25] dark:text-[#F0F5F1] tracking-tight">
          Institutional Reports & Analytics
        </h1>
        <p className="text-xs md:text-sm text-[#667768] dark:text-[#9FB1A2] mt-0.5">
          Generate formal report cards, compliance sheets, and academic progress exports
        </p>
      </div>

      {downloadSuccess && (
        <div className="px-4 py-3 rounded-xl bg-[#8DA390]/20 border border-[#8DA390]/40 text-[#213123] dark:text-[#E2ECE4] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#5B6E5E]" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {reportItems.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl glass-card p-5 border border-white/70 dark:border-white/10 flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5B6E5E] dark:text-[#A3B899]">
                {item.category}
              </span>
              <h3 className="text-base font-bold text-[#232F25] dark:text-[#F0F5F1] mt-2">
                {item.title}
              </h3>
              <p className="text-xs text-[#637466] dark:text-[#95A597] mt-1.5 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#78897B] font-semibold">
                Format: {item.type}
              </span>
              <button
                onClick={() => handleDownload(item)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#5B6E5E] text-white hover:bg-[#4A5B4D] transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Download size={13} />
                <span>Export Now</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
