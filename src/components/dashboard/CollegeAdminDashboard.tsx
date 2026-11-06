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
    <div className="space-y-6 max-w-7xl mx-auto bg-white">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-[#171417] tracking-tight">
          College Academic Console
        </h1>
        <p className="text-xs md:text-sm font-semibold text-[#625C60] mt-0.5">
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

      <div className="rounded-2xl bg-[#FAF5FF] p-5 border border-[#E9D5FF] shadow-[0_4px_20px_-4px_rgba(139, 92, 246,0.05)]">
        <h3 className="font-heading text-sm font-extrabold text-[#171417] mb-3">
          Undergraduate Departments & Course Credits
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { dept: 'Computer Science & Engineering', code: 'B.Tech CSE', credits: '160 Credits', hod: 'Dr. Ramesh Sundaram' },
            { dept: 'Artificial Intelligence & Data Science', code: 'B.Tech AI/DS', credits: '164 Credits', hod: 'Dr. Ananya Sen' },
            { dept: 'Electronics & Communication', code: 'B.Tech ECE', credits: '158 Credits', hod: 'Prof. K. Venkatesh' },
          ].map((d) => (
            <div key={d.code} className="p-3.5 rounded-xl bg-white border border-[#E9D5FF] hover:border-[#C4B5FD] transition-colors">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#F3E8FF] text-[#8B5CF6]">
                {d.code}
              </span>
              <h4 className="font-heading text-xs font-extrabold text-[#171417] mt-2">
                {d.dept}
              </h4>
              <p className="text-[11px] font-semibold text-[#625C60] mt-1">
                HOD: {d.hod} • Total: {d.credits}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
