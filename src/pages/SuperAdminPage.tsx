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
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#232F25] dark:text-[#F0F5F1] tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-[#DA5FCE]" size={28} />
            <span>Super Admin & Multi-Tenant SaaS Control</span>
          </h1>
          <p className="text-xs md:text-sm text-[#667768] dark:text-[#9FB1A2] mt-0.5">
            Cross-tenant institutional oversight, SaaS subscription tiers, platform metrics, and approvals
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 glass-card px-2 py-1.5 rounded-xl border border-white/70 dark:border-white/10 self-start md:self-auto overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('institutions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'institutions'
                ? 'bg-[#DA5FCE] text-white shadow-sm'
                : 'text-[#4F6052] dark:text-[#BACBBF] hover:bg-black/5'
            }`}
          >
            <Building2 size={13} />
            <span>Tenant Institutions</span>
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'subscriptions'
                ? 'bg-[#DA5FCE] text-white shadow-sm'
                : 'text-[#4F6052] dark:text-[#BACBBF] hover:bg-black/5'
            }`}
          >
            <CreditCard size={13} />
            <span>SaaS Plans</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'analytics'
                ? 'bg-[#DA5FCE] text-white shadow-sm'
                : 'text-[#4F6052] dark:text-[#BACBBF] hover:bg-black/5'
            }`}
          >
            <BarChart3 size={13} />
            <span>SaaS Analytics</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-[#8DA390]/20 border border-[#8DA390]/40 text-[#213123] dark:text-[#E2ECE4] text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 size={16} className="text-[#DA5FCE]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* 1. TENANT INSTITUTIONS LIST & APPROVALS */}
      {/* ---------------------------------------------------------------------- */}
      {activeTab === 'institutions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl glass-card border border-white/70">
              <span className="text-[10px] uppercase font-bold text-[#8DA390]">Total Onboarded</span>
              <h3 className="text-xl font-black text-[#232F25] mt-0.5">{institutions.length} Tenants</h3>
            </div>
            <div className="p-4 rounded-2xl glass-card border border-white/70">
              <span className="text-[10px] uppercase font-bold text-[#8DA390]">Active Students</span>
              <h3 className="text-xl font-black text-[#232F25] mt-0.5">6,400+ Total</h3>
            </div>
            <div className="p-4 rounded-2xl glass-card border border-white/70">
              <span className="text-[10px] uppercase font-bold text-[#8DA390]">Active Faculty</span>
              <h3 className="text-xl font-black text-[#232F25] mt-0.5">377 Teachers</h3>
            </div>
            <div className="p-4 rounded-2xl glass-card border border-white/70">
              <span className="text-[10px] uppercase font-bold text-[#8DA390]">Platform Uptime</span>
              <h3 className="text-xl font-black text-[#DA5FCE] mt-0.5">99.98%</h3>
            </div>
          </div>

          <div className="rounded-3xl glass-panel overflow-hidden border border-white/70 dark:border-white/10 shadow-sm">
            <div className="p-4 border-b border-black/5 flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-[#232F25] dark:text-[#F0F5F1]">
                Institutional Tenants Directory
              </h4>
              <span className="text-xs text-[#718273]">PostgreSQL Isolated RLS</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/[0.02] text-[#667768] font-semibold border-b border-black/5">
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
                <tbody className="divide-y divide-black/5">
                  {institutions.map((inst) => (
                    <tr key={inst.id} className="hover:bg-white/40 transition-colors">
                      <td className="p-3.5 pl-6 font-bold text-[#232F25] dark:text-[#F0F5F1]">
                        {inst.name}
                      </td>
                      <td className="p-3.5 font-mono text-[#DA5FCE]">{inst.code}</td>
                      <td className="p-3.5 uppercase text-[10px] font-bold text-[#718273]">{inst.type}</td>
                      <td className="p-3.5 text-[#556757]">{inst.city}, {inst.state}</td>
                      <td className="p-3.5 font-mono">{inst.students_count} / {inst.teachers_count}</td>
                      <td className="p-3.5 font-bold text-[#DA5FCE]">{inst.plan}</td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            inst.status === 'active'
                              ? 'bg-[#8DA390]/25 text-[#253A27]'
                              : inst.status === 'pending_approval'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-red-100 text-red-900'
                          }`}
                        >
                          {inst.status}
                        </span>
                      </td>
                      <td className="p-3.5 pr-6">
                        {inst.status === 'pending_approval' ? (
                          <button
                            onClick={() => handleApprove(inst.id, inst.name)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#DA5FCE] text-white hover:bg-[#C64EBA]"
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(inst.id, inst.status)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold glass-card hover:bg-black/5"
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
              className="p-6 rounded-3xl glass-card border border-white/70 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#DA5FCE]">
                  Tier {idx + 1}
                </span>
                <h3 className="text-xl font-extrabold text-[#232F25] mt-1">{p.name}</h3>
                <span className="text-2xl font-black text-[#DA5FCE] block mt-2">{p.price}</span>
                <p className="text-xs text-[#718273] mt-1">
                  Supports up to {p.max_students} students and {p.max_teachers} teachers.
                </p>

                <div className="mt-4 pt-3 border-t border-black/5 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#8DA390] block">Included Features:</span>
                  {p.features.map((f: string, fIdx: number) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs text-[#303E33]">
                      <CheckCircle2 size={13} className="text-[#DA5FCE]" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#DA5FCE] text-white hover:bg-[#C64EBA]">
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
            <div className="p-5 rounded-3xl glass-card border border-white/70">
              <span className="text-[10px] uppercase font-bold text-[#8DA390]">Monthly Recurring Revenue</span>
              <h3 className="text-2xl font-black text-[#232F25] mt-1">₹1,70,000 / mo</h3>
              <span className="text-xs text-[#DA5FCE] font-semibold">+18.5% growth this quarter</span>
            </div>
            <div className="p-5 rounded-3xl glass-card border border-white/70">
              <span className="text-[10px] uppercase font-bold text-[#8DA390]">Daily Active Users (DAU)</span>
              <h3 className="text-2xl font-black text-[#232F25] mt-1">4,820 DAU</h3>
              <span className="text-xs text-[#667768]">Across 4 active institutions</span>
            </div>
            <div className="p-5 rounded-3xl glass-card border border-white/70">
              <span className="text-[10px] uppercase font-bold text-[#8DA390]">Database Storage</span>
              <h3 className="text-2xl font-black text-[#232F25] mt-1">4.2 GB / 50 GB</h3>
              <span className="text-xs text-[#667768]">High performance PostgreSQL</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
