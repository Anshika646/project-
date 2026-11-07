import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { StatCard } from '../common/StatCard';
import {
  Building2,
  Users,
  ShieldCheck,
  Activity,
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
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Super Admin Platform Console
        </h1>
        <p className="text-xs md:text-sm font-semibold text-[#64748B] mt-0.5">
          Edunexa Multi-Tenant Network • System-wide Tenant Governance
        </p>
      </div>

      {/* Metrics in Light Pink and Cream */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Institutions"
          value="48"
          change="+3 this month"
          isPositive={true}
          icon={Building2}
          variant="pink"
        />
        <StatCard
          title="Total Platform Users"
          value="58,420"
          change="+12% YoY"
          isPositive={true}
          icon={Users}
          variant="cream"
        />
        <StatCard
          title="Multi-Tenant Health"
          value="99.98%"
          change="Isolated RLS Active"
          isPositive={true}
          icon={ShieldCheck}
          variant="rose"
        />
        <StatCard
          title="Daily Active Sessions"
          value="24.8k"
          change="Peak: 09:30 AM"
          isPositive={true}
          icon={Activity}
          variant="blush"
        />
      </div>

      {/* Tenant Institutions Table */}
      <div className="rounded-2xl bg-[#FAF8F5] p-5 border border-[#E8E4DF] shadow-[0_4px_20px_-4px_rgba(15, 23, 42, 0.03)]">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DF]">
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-[#6D28D9]" />
            <h3 className="font-heading text-sm font-extrabold text-[#0F172A]">
              Provisioned Institutions & Workspaces
            </h3>
          </div>
          <span className="text-xs font-bold text-[#6D28D9] bg-[#FFFFFF] px-2.5 py-0.5 rounded-full">
            3 Active Workspaces
          </span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E8E4DF] text-[#64748B]">
                <th className="pb-3 font-extrabold text-[#0F172A]">Institution Name</th>
                <th className="pb-3 font-extrabold text-[#0F172A]">Tenant Code</th>
                <th className="pb-3 font-extrabold text-[#0F172A]">Type</th>
                <th className="pb-3 font-extrabold text-[#0F172A]">Enrolled Students</th>
                <th className="pb-3 font-extrabold text-[#0F172A]">Faculty</th>
                <th className="pb-3 font-extrabold text-[#0F172A]">Subscription Tier</th>
                <th className="pb-3 font-extrabold text-[#0F172A]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DF]">
              {institutionsList.map((inst) => (
                <tr key={inst.id} className="hover:bg-white/60 transition-colors">
                  <td className="py-3 font-extrabold text-[#0F172A]">
                    {inst.name}
                  </td>
                  <td className="py-3 font-mono font-bold text-[#6D28D9]">
                    {inst.code}
                  </td>
                  <td className="py-3 capitalize font-semibold text-[#64748B]">
                    {inst.type}
                  </td>
                  <td className="py-3 tabular-nums font-bold text-[#0F172A]">
                    {inst.students}
                  </td>
                  <td className="py-3 tabular-nums font-bold text-[#0F172A]">
                    {inst.teachers}
                  </td>
                  <td className="py-3 font-semibold text-[#64748B]">
                    {inst.plan}
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFFFFF] text-[#6D28D9]">
                      <CheckCircle2 size={12} className="text-[#6D28D9]" />
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
