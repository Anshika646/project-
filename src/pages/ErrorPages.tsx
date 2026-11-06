import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  return (
    <div className="min-h-screen bg-[#F6F5F0] dark:bg-[#151B16] bg-ambient-glow flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full p-8 rounded-3xl glass-panel border border-white/80 dark:border-white/10 shadow-2xl space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto">
          <ShieldAlert size={28} />
        </div>
        <h2 className="text-xl font-extrabold text-[#232F25] dark:text-[#F0F5F1]">
          Access Restricted
        </h2>
        <p className="text-xs text-[#637466] dark:text-[#95A597] leading-relaxed">
          Your current account role (<span className="font-mono font-bold text-[#232F25] dark:text-[#E2ECE4]">{role}</span>) does not have authorization to view this module.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#5B6E5E] hover:bg-[#4A5B4D] transition-colors shadow-sm inline-flex items-center gap-2"
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
    <div className="min-h-screen bg-[#F6F5F0] dark:bg-[#151B16] bg-ambient-glow flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full p-8 rounded-3xl glass-panel border border-white/80 dark:border-white/10 shadow-2xl space-y-4">
        <div className="text-4xl font-extrabold text-[#5B6E5E]">404</div>
        <h2 className="text-xl font-bold text-[#232F25] dark:text-[#F0F5F1]">
          Page Not Found
        </h2>
        <p className="text-xs text-[#637466] dark:text-[#95A597]">
          The requested educational resource or page does not exist.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#5B6E5E] hover:bg-[#4A5B4D] transition-colors shadow-sm"
        >
          Back to Safety
        </button>
      </div>
    </div>
  );
};
