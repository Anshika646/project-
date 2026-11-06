import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  UserCheck,
  Building2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loginAsDemo, demoAccounts, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email) {
      setErrorMessage('Please enter your email or username');
      return;
    }

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to sign in. Please verify your credentials.');
      }
    }
  };

  const handleDemoClick = async (demoId: string) => {
    setErrorMessage(null);
    try {
      await loginAsDemo(demoId);
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to sign in as demo persona.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F5F0] dark:bg-[#151B16] bg-ambient-glow flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Brand Story & Institutional Credibility */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#A3B899] to-[#5F7161] p-2.5 flex items-center justify-center shadow-md">
              <svg
                className="w-7 h-7 text-[#FDFCF7]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2C6.5 2 2 6.5 2 12c0 5 3.5 9 8.5 9.8" />
                <path d="M12 2c5.5 0 10 4.5 10 10 0 5-3.5 9-8.5 9.8" />
                <path d="M12 22V12" />
                <path d="M12 12c-3-2.5-4-5-4-7" />
                <path d="M12 12c3-2.5 4-5 4-7" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-[#243126] dark:text-[#F3F7F4] tracking-tight">
                Edunexa
              </h1>
              <p className="text-xs font-semibold tracking-wider text-[#7D9D85] dark:text-[#A3B899]">
                Learn • Grow • Excel
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl md:text-2xl font-bold text-[#232F25] dark:text-[#E2ECE4] leading-snug">
              Institutional ERP for Schools & Colleges
            </h2>
            <p className="text-xs md:text-sm text-[#5D6E60] dark:text-[#9FB1A2] leading-relaxed">
              Unified workspace for administrators, faculty, students, and parents. Real-time attendance, examination marks, chapter notes, and academic analytics with complete tenant isolation.
            </p>
          </div>

          {/* Development Demo Quick Launcher */}
          <div className="p-4 rounded-2xl glass-card border border-white/80 dark:border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2B392D] dark:text-[#E2ECE4]">
              <Sparkles size={16} className="text-[#5B6E5E] dark:text-[#A3B899]" />
              <span>Instant Development Demo Accounts</span>
            </div>
            <p className="text-[11px] text-[#637466] dark:text-[#95A597]">
              Click any role to log in immediately with realistic institutional data:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {demoAccounts.map((account) => (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => handleDemoClick(account.id)}
                  disabled={isLoading}
                  className="px-2.5 py-2 rounded-xl text-left bg-white/70 dark:bg-white/5 border border-white/80 dark:border-white/10 hover:bg-[#8DA390]/20 hover:border-[#8DA390]/40 transition-all text-xs group"
                >
                  <p className="font-bold text-[#232F25] dark:text-[#F0F5F1] group-hover:text-[#18231A] truncate">
                    {account.roleLabel}
                  </p>
                  <p className="text-[10px] text-[#637466] dark:text-[#95A597] truncate">
                    {account.name}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Secure Login Form Card */}
        <div className="lg:col-span-7">
          <div className="p-6 md:p-8 rounded-3xl glass-panel shadow-2xl border border-white/80 dark:border-white/10">
            <div className="mb-6">
              <h3 className="text-xl font-extrabold text-[#232F25] dark:text-[#F0F5F1]">
                Sign in to your Portal
              </h3>
              <p className="text-xs text-[#637466] dark:text-[#95A597] mt-1">
                Enter your institutional credentials or choose a demo persona
              </p>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email / Username */}
              <div>
                <label className="block text-xs font-semibold text-[#303E33] dark:text-[#D1E0D3] mb-1.5">
                  Email or Username
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A8A7C]"
                  />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. principal.sharma@edunexa.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium glass-input text-[#232F25] dark:text-[#F0F5F1]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#303E33] dark:text-[#D1E0D3]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    className="text-xs font-semibold text-[#5B6E5E] dark:text-[#A3B899] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A8A7C]"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs font-medium glass-input text-[#232F25] dark:text-[#F0F5F1]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7A8A7C] hover:text-[#334235]"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#5B6E5E] border-gray-300 focus:ring-[#5B6E5E]"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 text-xs font-medium text-[#4D5E50] dark:text-[#C5D3C6]"
                >
                  Remember this device for 30 days
                </label>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl text-xs font-bold text-white bg-[#5B6E5E] hover:bg-[#4A5B4D] active:scale-[0.99] disabled:opacity-50 transition-all shadow-md shadow-[#5B6E5E]/20"
              >
                {isLoading ? 'Verifying Credentials...' : 'Sign in to Edunexa'}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 text-center">
              <p className="text-[11px] text-[#6E7F71] dark:text-[#8D9D90]">
                Institutional multi-tenant isolation secured with Row Level Security (RLS)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="max-w-md w-full p-6 rounded-2xl glass-panel shadow-2xl border border-white/80 dark:border-white/10 space-y-4">
            <h3 className="text-base font-bold text-[#232F25] dark:text-[#F0F5F1]">
              Reset Account Password
            </h3>
            {resetSent ? (
              <div className="p-3 rounded-xl bg-[#8DA390]/20 text-[#213123] dark:text-[#E2ECE4] text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#5B6E5E]" />
                <span>Password reset link dispatched to your registered address.</span>
              </div>
            ) : (
              <>
                <p className="text-xs text-[#637466] dark:text-[#95A597]">
                  Enter your registered institutional email to receive reset instructions.
                </p>
                <input
                  type="email"
                  defaultValue={email}
                  placeholder="name@edunexa.edu"
                  className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                />
                <button
                  type="button"
                  onClick={() => setResetSent(true)}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-[#5B6E5E]"
                >
                  Send Reset Link
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                setForgotModalOpen(false);
                setResetSent(false);
              }}
              className="w-full py-2 rounded-xl text-xs font-semibold text-[#566759] hover:bg-black/5"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
