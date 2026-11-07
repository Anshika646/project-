import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Settings,
  Building,
  ShieldCheck,
  Clock,
  Save,
  CheckCircle2,
  Lock,
  UserCheck,
} from 'lucide-react';
import { DEMO_RECENT_ACTIVITIES } from '../services/mockData';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  const [schoolName, setSchoolName] = useState(user?.institution?.name || 'Springfield International School');
  const [boardAffiliation, setBoardAffiliation] = useState('CBSE-2130842');
  const [schoolCode, setSchoolCode] = useState('SIS-DELHI-08914');
  const [officialEmail, setOfficialEmail] = useState('contact@springfield.edunexa.edu');
  const [officialPhone, setOfficialPhone] = useState('+91 (011) 4892-0199');
  const [campusAddress, setCampusAddress] = useState('Plot 14, Institutional Area, Sector 5, Vasant Kunj, New Delhi - 110070');

  // Operational Rules
  const [attendanceCutoff, setAttendanceCutoff] = useState('09:15 AM');
  const [minAttendancePercent, setMinAttendancePercent] = useState(75);
  const [passingPercent, setPassingPercent] = useState(33);
  const [periodsPerDay, setPeriodsPerDay] = useState(8);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage('Institutional settings updated and persisted successfully.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-white border border-[#DDD6FE] text-[#0F172A] text-xs font-semibold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={16} className="text-[#6D28D9]" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-[#64748B] hover:text-[#0F172A]">✕</button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Institutional Settings & Governance
        </h1>
        <p className="text-xs md:text-sm font-medium text-[#64748B] mt-0.5">
          General school information, academic attendance rules, role policies, and audit history.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* School Profile Card */}
        <div className="rounded-2xl bg-white border border-[#E8E4DF] shadow-[0_2px_10px_-2px_rgba(15,23,42,0.03)] p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#E8E4DF]">
            <Building size={18} className="text-[#6D28D9]" />
            <h2 className="text-sm font-bold text-[#0F172A]">Institutional Identity</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">School Legal Name</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">Board Affiliation Number</label>
              <input
                type="text"
                value={boardAffiliation}
                onChange={(e) => setBoardAffiliation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">Institutional Code</label>
              <input
                type="text"
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">Official Contact Email</label>
              <input
                type="email"
                value={officialEmail}
                onChange={(e) => setOfficialEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">Official Telephone</label>
              <input
                type="text"
                value={officialPhone}
                onChange={(e) => setOfficialPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">Campus Address</label>
              <input
                type="text"
                value={campusAddress}
                onChange={(e) => setCampusAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
              />
            </div>
          </div>
        </div>

        {/* Operational & Academic Thresholds */}
        <div className="rounded-2xl bg-white border border-[#E8E4DF] shadow-[0_2px_10px_-2px_rgba(15,23,42,0.03)] p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#E8E4DF]">
            <Clock size={18} className="text-[#6D28D9]" />
            <h2 className="text-sm font-bold text-[#0F172A]">Operational Policies & Thresholds</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">Daily Attendance Cutoff</label>
              <input
                type="text"
                value={attendanceCutoff}
                onChange={(e) => setAttendanceCutoff(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">Min Attendance Required (%)</label>
              <input
                type="number"
                value={minAttendancePercent}
                onChange={(e) => setMinAttendancePercent(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">Passing Aggregate Threshold (%)</label>
              <input
                type="number"
                value={passingPercent}
                onChange={(e) => setPassingPercent(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">Periods Per Day</label>
              <input
                type="number"
                value={periodsPerDay}
                onChange={(e) => setPeriodsPerDay(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-all shadow-xs flex items-center gap-1.5"
            >
              <Save size={14} />
              <span>Save Policy Modifications</span>
            </button>
          </div>
        </div>
      </form>

      {/* Administrative Audit Trail */}
      <div className="rounded-2xl bg-white border border-[#E8E4DF] shadow-[0_2px_10px_-2px_rgba(15,23,42,0.03)] p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#E8E4DF]">
          <ShieldCheck size={18} className="text-[#6D28D9]" />
          <h2 className="text-sm font-bold text-[#0F172A]">Administrative Audit Trail & Access History</h2>
        </div>

        <div className="space-y-3">
          {DEMO_RECENT_ACTIVITIES.map((act) => (
            <div
              key={act.id}
              className="p-3 rounded-xl border border-[#E8E4DF] bg-[#FAF8F5] flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#6D28D9]" />
                <div>
                  <span className="font-bold text-[#0F172A]">{String(act.details?.text || act.action)}</span>
                  <p className="text-[11px] text-[#64748B]">Staff: {act.actor_name || 'System Administrator'} • IP: 192.168.1.104</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-[#64748B]">
                {new Date(act.created_at).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
