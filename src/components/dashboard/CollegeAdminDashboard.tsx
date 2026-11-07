import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { StatCard } from '../common/StatCard';
import {
  GraduationCap,
  Building2,
  Layers,
  Award,
} from 'lucide-react';

export const CollegeAdminDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          College Academic Console
        </h1>
        <p className="text-xs md:text-sm font-semibold text-[#64748B] mt-0.5">
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
          variant="pink"
        />
        <StatCard
          title="Enrolled Undergrads"
          value="3,850"
          change="+8% Enrollment"
          isPositive={true}
          icon={GraduationCap}
          variant="cream"
        />
        <StatCard
          title="Active Faculty"
          value="210"
          change="Ph.D Faculty: 64%"
          isPositive={true}
          icon={Layers}
          variant="rose"
        />
        <StatCard
          title="Campus Placement Rate"
          value="89.4%"
          change="Average: 9.8 LPA"
          isPositive={true}
          icon={Award}
          variant="blush"
        />
      </div>

      <div className="rounded-2xl bg-[#FAF8F5] p-5 border border-[#E8E4DF] shadow-[0_4px_20px_-4px_rgba(15, 23, 42, 0.03)]">
        <h3 className="font-heading text-sm font-extrabold text-[#0F172A] mb-3">
          Undergraduate Departments & Course Credits
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { dept: 'Computer Science & Engineering', code: 'B.Tech CSE', credits: '160 Credits', hod: 'Dr. Ramesh Sundaram' },
            { dept: 'Artificial Intelligence & Data Science', code: 'B.Tech AI/DS', credits: '164 Credits', hod: 'Dr. Ananya Sen' },
            { dept: 'Electronics & Communication', code: 'B.Tech ECE', credits: '158 Credits', hod: 'Prof. K. Venkatesh' },
          ].map((d) => (
            <div key={d.code} className="p-3.5 rounded-xl bg-white border border-[#E8E4DF] hover:border-[#DDD6FE] transition-colors">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FFFFFF] text-[#6D28D9]">
                {d.code}
              </span>
              <h4 className="font-heading text-xs font-extrabold text-[#0F172A] mt-2">
                {d.dept}
              </h4>
              <p className="text-[11px] font-semibold text-[#64748B] mt-1">
                HOD: {d.hod} • Total: {d.credits}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
