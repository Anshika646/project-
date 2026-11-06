import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { StatCard } from '../common/StatCard';
import {
  Building2,
  Users,
  ShieldCheck,
  Activity,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { DEMO_INSTITUTION, DEMO_COLLEGE } from '../../services/mockData';

export const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const institutionsList = [
    { ...DEMO_INSTITUTION, students: '1,240', teachers: '86', plan: 'Enterprise SaaS', status: 'Active' },
    { ...DEMO_COLLEGE, students: '3,850', teachers: '210', plan: 'University Suite', status: 'Active' },
    {
      id: 'inst-3',
      name: 'St. Xavier Global Academy',
      code: 'SXGA-MUM',
      type: 'school',
      students: '980',
      teachers: '64',
      plan: 'Institutional Standard',
      status: 'Active',
      academic_session: '2025 - 2026',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#232F25] dark:text-[#F0F5F1] tracking-tight">
          Super Admin Platform Console
        </h1>
        <p className="text-xs md:text-sm text-[#667768] dark:text-[#9FB1A2] mt-0.5">
          Edunexa Multi-Tenant Network • System-wide Tenant Governance
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Institutions"
          value="48"
          change="+3 this month"
          isPositive={true}
          icon={Building2}
          variant="sage"
        />
        <StatCard
          title="Total Platform Users"
          value="58,420"
          change="+12% YoY"
          isPositive={true}
          icon={Users}
          variant="olive"
        />
        <StatCard
          title="Multi-Tenant Health"
          value="99.98%"
          change="Isolated RLS Active"
          isPositive={true}
          icon={ShieldCheck}
          variant="sage"
        />
        <StatCard
          title="Daily Active Sessions"
          value="24.8k"
          change="Peak: 09:30 AM"
          isPositive={true}
          icon={Activity}
          variant="pink"
        />
      </div>

      {/* Tenant Institutions Table */}
      <div className="rounded-2xl glass-card p-5 border border-white/70 dark:border-white/10">
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-[#5B6E5E] dark:text-[#A3B899]" />
            <h3 className="text-sm font-bold text-[#232F25] dark:text-[#F0F5F1]">
              Provisioned Institutions & Workspaces
            </h3>
          </div>
          <span className="text-xs font-semibold text-[#5B6E5E]">3 Active Workspaces</span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/5 text-[#657667] dark:text-[#9FB1A2]">
                <th className="pb-3 font-semibold">Institution Name</th>
                <th className="pb-3 font-semibold">Tenant Code</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Enrolled Students</th>
                <th className="pb-3 font-semibold">Faculty</th>
                <th className="pb-3 font-semibold">Subscription Tier</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {institutionsList.map((inst) => (
                <tr key={inst.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3 font-bold text-[#232F25] dark:text-[#F0F5F1]">
                    {inst.name}
                  </td>
                  <td className="py-3 font-mono text-[#5B6E5E] dark:text-[#A3B899]">
                    {inst.code}
                  </td>
                  <td className="py-3 capitalize">
                    {inst.type}
                  </td>
                  <td className="py-3 tabular-nums font-medium">
                    {inst.students}
                  </td>
                  <td className="py-3 tabular-nums font-medium">
                    {inst.teachers}
                  </td>
                  <td className="py-3 font-medium text-[#465749] dark:text-[#C5D4C7]">
                    {inst.plan}
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#8DA390]/20 text-[#2B3B2E] dark:text-[#E2ECE4]">
                      <CheckCircle2 size={11} className="text-[#5B6E5E]" />
                      <span>{inst.status}</span>
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
