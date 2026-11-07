import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full p-8 rounded-3xl bg-[#FFFFFF] border border-[#E8E4DF] shadow-sm space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#FFFFFF] text-[#6D28D9] border border-[#E8E4DF] flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert size={28} />
        </div>
        <h2 className="text-xl font-extrabold text-[#0F172A]">
          Access Restricted
        </h2>
        <p className="text-xs text-[#64748B] leading-relaxed font-medium">
          Your current account role (<span className="font-mono font-bold text-[#0F172A]">{role}</span>) does not have authorization to view this module.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors shadow-sm inline-flex items-center gap-2"
        >
          <ArrowLeft size={15} />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full p-8 rounded-3xl bg-[#FFFFFF] border border-[#E8E4DF] shadow-sm space-y-4">
        <div className="text-4xl font-extrabold text-[#6D28D9]">404</div>
        <h2 className="text-xl font-extrabold text-[#0F172A]">
          Page Not Found
        </h2>
        <p className="text-xs text-[#64748B] font-medium">
          The requested educational resource or page does not exist.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors shadow-sm"
        >
          Back to Safety
        </button>
      </div>
    </div>
  );
};
