import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Building2,
  ShieldCheck,
  BarChart3,
  Users,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingUp,
  CreditCard,
  Settings,
  Sparkles,
} from 'lucide-react';
import { learningService } from '../services/learningService';

export const SuperAdminPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'institutions' | 'subscriptions' | 'analytics' | 'tickets'>('institutions');
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const insts = await learningService.getTenantInstitutions();
    setInstitutions(insts);
    const subPlans = await learningService.getSubscriptionPlans();
    setPlans(subPlans);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    await learningService.toggleInstitutionStatus(id, nextStatus as any);
    await loadData();
    setToastMessage(`Institution status updated to ${nextStatus.toUpperCase()}!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleApprove = async (id: string, name: string) => {
    await learningService.approveInstitution(id);
    await loadData();
    setToastMessage(`Institutional onboarding for "${name}" approved successfully!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#171417] tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#F3E8FF] flex items-center justify-center text-[#8B5CF6]">
              <ShieldCheck size={22} />
            </div>
            <span>Super Admin & Multi-Tenant SaaS Control</span>
          </h1>
          <p className="text-xs md:text-sm text-[#625C60] mt-1 font-medium">
            Cross-tenant institutional oversight, SaaS subscription tiers, platform metrics, and approvals
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-[#FAF5FF] p-1.5 rounded-2xl border border-[#E9D5FF] self-start md:self-auto overflow-x-auto scrollbar-none shadow-sm">
          <button
            onClick={() => setActiveTab('institutions')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'institutions'
                ? 'bg-[#8B5CF6] text-white shadow-sm'
                : 'text-[#171417] hover:bg-[#F5F3FF]'
            }`}
          >
            <Building2 size={14} />
            <span>Tenant Institutions</span>
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'subscriptions'
                ? 'bg-[#8B5CF6] text-white shadow-sm'
                : 'text-[#171417] hover:bg-[#F5F3FF]'
            }`}
          >
            <CreditCard size={14} />
            <span>SaaS Plans</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-[#8B5CF6] text-white shadow-sm'
                : 'text-[#171417] hover:bg-[#F5F3FF]'
            }`}
          >
            <BarChart3 size={14} />
            <span>SaaS Analytics</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-2xl bg-[#F5F3FF] border border-[#E9D5FF] text-[#171417] text-xs font-bold flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 size={16} className="text-[#8B5CF6]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* 1. TENANT INSTITUTIONS LIST & APPROVALS */}
      {/* ---------------------------------------------------------------------- */}
      {activeTab === 'institutions' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#F5F3FF] border border-[#E9D5FF] shadow-sm">
              <span className="text-[10px] uppercase font-bold text-[#625C60]">Total Onboarded</span>
              <h3 className="text-xl font-black text-[#171417] mt-1">{institutions.length} Tenants</h3>
            </div>
            <div className="p-5 rounded-2xl bg-[#FAF5FF] border border-[#E9D5FF] shadow-sm">
              <span className="text-[10px] uppercase font-bold text-[#625C60]">Active Students</span>
              <h3 className="text-xl font-black text-[#171417] mt-1">6,400+ Total</h3>
            </div>
            <div className="p-5 rounded-2xl bg-[#FDFBFF] border border-[#E9D5FF] shadow-sm">
              <span className="text-[10px] uppercase font-bold text-[#625C60]">Active Faculty</span>
              <h3 className="text-xl font-black text-[#171417] mt-1">377 Teachers</h3>
            </div>
            <div className="p-5 rounded-2xl bg-[#F3E8FF] border border-[#E9D5FF] shadow-sm">
              <span className="text-[10px] uppercase font-bold text-[#625C60]">Platform Uptime</span>
              <h3 className="text-xl font-black text-[#8B5CF6] mt-1">99.98%</h3>
            </div>
          </div>

          <div className="rounded-2xl bg-[#FAF5FF] overflow-hidden border border-[#E9D5FF] shadow-sm">
            <div className="p-4 border-b border-[#E9D5FF] flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-[#171417]">
                Institutional Tenants Directory
              </h4>
              <span className="text-xs text-[#625C60] font-medium">PostgreSQL Isolated RLS</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs bg-white">
                <thead className="bg-[#FAF5FF] text-[#171417] font-extrabold border-b border-[#E9D5FF]">
                  <tr>
                    <th className="p-3.5 pl-6">Institution Name</th>
                    <th className="p-3.5">Tenant Code</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5">Users (Students/Staff)</th>
                    <th className="p-3.5">SaaS Plan</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9D5FF]">
                  {institutions.map((inst) => (
                    <tr key={inst.id} className="hover:bg-[#F5F3FF]/50 transition-colors">
                      <td className="p-3.5 pl-6 font-bold text-[#171417]">
                        {inst.name}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-[#8B5CF6]">{inst.code}</td>
                      <td className="p-3.5 uppercase text-[10px] font-extrabold text-[#625C60]">{inst.type}</td>
                      <td className="p-3.5 text-[#625C60] font-medium">{inst.city}, {inst.state}</td>
                      <td className="p-3.5 font-mono font-bold text-[#171417]">{inst.students_count} / {inst.teachers_count}</td>
                      <td className="p-3.5 font-extrabold text-[#8B5CF6]">{inst.plan}</td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            inst.status === 'active'
                              ? 'bg-[#F3E8FF] text-[#8B5CF6] border-[#8B5CF6]/30'
                              : inst.status === 'pending_approval'
                              ? 'bg-[#FAF5FF] text-[#171417] border-[#E9D5FF]'
                              : 'bg-white text-[#A78BFA] border-[#E9D5FF]'
                          }`}
                        >
                          {inst.status}
                        </span>
                      </td>
                      <td className="p-3.5 pr-6">
                        {inst.status === 'pending_approval' ? (
                          <button
                            onClick={() => handleApprove(inst.id, inst.name)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#8B5CF6] text-white hover:bg-[#7C3AED] shadow-sm"
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(inst.id, inst.status)}
                            className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#FAF5FF] border border-[#E9D5FF] text-[#171417] hover:bg-[#F5F3FF]"
                          >
                            {inst.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* 2. SAAS SUBSCRIPTION PLANS */}
      {/* ---------------------------------------------------------------------- */}
      {activeTab === 'subscriptions' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-3xl border border-[#E9D5FF] shadow-sm flex flex-col justify-between space-y-4 ${
                idx === 1 ? 'bg-[#F5F3FF] border-2 border-[#8B5CF6]/40' : 'bg-[#FAF5FF]'
              }`}
            >
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8B5CF6]">
                  Tier {idx + 1}
                </span>
                <h3 className="text-xl font-extrabold text-[#171417] mt-1">{p.name}</h3>
                <span className="text-2xl font-black text-[#171417] block mt-2">{p.price}</span>
                <p className="text-xs text-[#625C60] mt-1 font-medium">
                  Supports up to {p.max_students} students and {p.max_teachers} teachers.
                </p>

                <div className="mt-4 pt-3 border-t border-[#E9D5FF] space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#625C60] block">Included Features:</span>
                  {p.features.map((f: string, fIdx: number) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs text-[#171417] font-medium">
                      <CheckCircle2 size={13} className="text-[#8B5CF6]" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#8B5CF6] text-white hover:bg-[#7C3AED] shadow-sm">
                Configure Plan Entitlements
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* 3. PLATFORM USAGE ANALYTICS */}
      {/* ---------------------------------------------------------------------- */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl bg-[#F5F3FF] border border-[#E9D5FF] shadow-sm">
              <span className="text-[10px] uppercase font-bold text-[#625C60]">Monthly Recurring Revenue</span>
              <h3 className="text-2xl font-black text-[#171417] mt-1">₹1,70,000 / mo</h3>
              <span className="text-xs text-[#8B5CF6] font-bold">+18.5% growth this quarter</span>
            </div>
            <div className="p-6 rounded-2xl bg-[#FAF5FF] border border-[#E9D5FF] shadow-sm">
              <span className="text-[10px] uppercase font-bold text-[#625C60]">Daily Active Users (DAU)</span>
              <h3 className="text-2xl font-black text-[#171417] mt-1">4,820 DAU</h3>
              <span className="text-xs text-[#625C60] font-medium">Across 4 active institutions</span>
            </div>
            <div className="p-6 rounded-2xl bg-[#FDFBFF] border border-[#E9D5FF] shadow-sm">
              <span className="text-[10px] uppercase font-bold text-[#625C60]">Database Storage</span>
              <h3 className="text-2xl font-black text-[#171417] mt-1">4.2 GB / 50 GB</h3>
              <span className="text-xs text-[#625C60] font-medium">High performance PostgreSQL</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
