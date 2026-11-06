import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { StatCard } from '../common/StatCard';
import {
  GraduationCap,
  Building2,
  Layers,
  Award,
  BookOpen,
} from 'lucide-react';

export const CollegeAdminDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#232F25] dark:text-[#F0F5F1] tracking-tight">
          College Academic Console
        </h1>
        <p className="text-xs md:text-sm text-[#667768] dark:text-[#9FB1A2] mt-0.5">
          {user?.institution.name || 'Apex Institute of Technology'} • Semester 6 Academic Session
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Departments"
          value="6"
          change="CSE, ECE, ME, Civil, AI, DS"
          isPositive={true}
          icon={Building2}
          variant="sage"
        />
        <StatCard
          title="Enrolled Undergrads"
          value="3,850"
          change="+8% Enrollment"
          isPositive={true}
          icon={GraduationCap}
          variant="olive"
        />
        <StatCard
          title="Active Faculty"
          value="210"
          change="Ph.D Faculty: 64%"
          isPositive={true}
          icon={Layers}
          variant="pink"
        />
        <StatCard
          title="Campus Placement Rate"
          value="89.4%"
          change="Average: 9.8 LPA"
          isPositive={true}
          icon={Award}
          variant="sage"
        />
      </div>

      <div className="rounded-2xl glass-card p-5 border border-white/70 dark:border-white/10">
        <h3 className="text-sm font-bold text-[#232F25] dark:text-[#F0F5F1] mb-3">
          Undergraduate Departments & Course Credits
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { dept: 'Computer Science & Engineering', code: 'B.Tech CSE', credits: '160 Credits', hod: 'Dr. Ramesh Sundaram' },
            { dept: 'Artificial Intelligence & Data Science', code: 'B.Tech AI/DS', credits: '164 Credits', hod: 'Dr. Ananya Sen' },
            { dept: 'Electronics & Communication', code: 'B.Tech ECE', credits: '158 Credits', hod: 'Prof. K. Venkatesh' },
          ].map((d) => (
            <div key={d.code} className="p-3.5 rounded-xl bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/5">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#8DA390]/20 text-[#2B3B2E] dark:text-[#C2D8C2]">
                {d.code}
              </span>
              <h4 className="text-xs font-bold text-[#232F25] dark:text-[#F0F5F1] mt-2">
                {d.dept}
              </h4>
              <p className="text-[11px] text-[#637466] dark:text-[#95A597] mt-1">
                HOD: {d.hod} • Total: {d.credits}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
