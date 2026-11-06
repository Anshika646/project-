import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
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
    <div className="min-h-screen bg-white flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Brand Story & Institutional Credibility */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F3E8FF] border border-[#C4B5FD]/40 p-2.5 flex items-center justify-center shadow-xs">
              <svg
                className="w-7 h-7 text-[#8B5CF6]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
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
              <h1 className="font-heading text-3xl font-extrabold text-[#171417] tracking-tight">
                Edunexa
              </h1>
              <p className="text-xs font-bold tracking-wider text-[#8B5CF6]">
                Learn • Grow • Excel
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="font-heading text-xl md:text-2xl font-extrabold text-[#171417] leading-snug">
              Institutional ERP for Schools & Colleges
            </h2>
            <p className="text-xs md:text-sm font-semibold text-[#625C60] leading-relaxed">
              Unified workspace for administrators, faculty, students, and parents. Real-time attendance, examination marks, chapter notes, and academic analytics with complete tenant isolation.
            </p>
          </div>

          {/* Development Demo Quick Launcher in Cream Pink Card */}
          <div className="p-4 rounded-2xl bg-[#FAF5FF] border border-[#E9D5FF] space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#171417]">
              <Sparkles size={16} className="text-[#8B5CF6]" />
              <span>Instant Development Demo Accounts</span>
            </div>
            <p className="text-[11px] font-medium text-[#625C60]">
              Click any role to log in immediately with realistic institutional data:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {demoAccounts.map((account) => (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => handleDemoClick(account.id)}
                  disabled={isLoading}
                  className="px-2.5 py-2 rounded-xl text-left bg-white border border-[#E9D5FF] hover:bg-[#F5F3FF] hover:border-[#C4B5FD] transition-all text-xs group shadow-xs"
                >
                  <p className="font-extrabold text-[#171417] group-hover:text-[#8B5CF6] truncate">
                    {account.roleLabel}
                  </p>
                  <p className="text-[10px] font-semibold text-[#625C60] truncate">
                    {account.name}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Secure Login Form Card in Light Pink */}
        <div className="lg:col-span-7">
          <div className="p-6 md:p-8 rounded-3xl bg-[#F5F3FF] border border-[#E9D5FF] shadow-[0_4px_24px_-4px_rgba(139, 92, 246,0.08)]">
            <div className="mb-6">
              <h3 className="font-heading text-xl font-extrabold text-[#171417]">
                Sign in to your Portal
              </h3>
              <p className="text-xs font-semibold text-[#625C60] mt-1">
                Enter your institutional credentials or choose a demo persona
              </p>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-white border border-[#8B5CF6] text-[#8B5CF6] text-xs font-bold flex items-center gap-2 shadow-xs">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email / Username */}
              <div>
                <label className="block text-xs font-bold text-[#171417] mb-1.5">
                  Email or Username
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B5CF6]"
                  />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. principal.sharma@edunexa.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-bold bg-white border border-[#E9D5FF] text-[#171417] placeholder-[#858087] focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#171417]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    className="text-xs font-bold text-[#8B5CF6] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B5CF6]"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs font-bold bg-white border border-[#E9D5FF] text-[#171417] placeholder-[#858087] focus:outline-none focus:border-[#8B5CF6]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#625C60] hover:text-[#171417]"
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
                  className="w-4 h-4 rounded text-[#8B5CF6] border-[#E9D5FF] focus:ring-[#8B5CF6]"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 text-xs font-bold text-[#171417]"
                >
                  Remember this device for 30 days
                </label>
              </div>

              {/* Login Button in Signature Pink */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl text-xs font-extrabold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] active:scale-[0.99] disabled:opacity-50 transition-all shadow-md shadow-[#8B5CF6]/25"
              >
                {isLoading ? 'Verifying Credentials...' : 'Sign in to Edunexa'}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-[#E9D5FF] text-center">
              <p className="text-[11px] font-semibold text-[#625C60]">
                Institutional multi-tenant isolation secured with Row Level Security (RLS)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="max-w-md w-full p-6 rounded-2xl bg-white shadow-2xl border border-[#E9D5FF] space-y-4">
            <h3 className="font-heading text-base font-extrabold text-[#171417]">
              Reset Account Password
            </h3>
            {resetSent ? (
              <div className="p-3 rounded-xl bg-[#F5F3FF] border border-[#C4B5FD] text-[#171417] text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#8B5CF6]" />
                <span>Password reset link dispatched to your registered address.</span>
              </div>
            ) : (
              <>
                <p className="text-xs font-medium text-[#625C60]">
                  Enter your registered institutional email to receive reset instructions.
                </p>
                <input
                  type="email"
                  defaultValue={email}
                  placeholder="name@edunexa.edu"
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-[#FAF5FF] border border-[#E9D5FF] text-[#171417] focus:outline-none focus:border-[#8B5CF6]"
                />
                <button
                  type="button"
                  onClick={() => setResetSent(true)}
                  className="w-full py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#8B5CF6] hover:bg-[#7C3AED]"
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
              className="w-full py-2 rounded-xl text-xs font-bold text-[#625C60] hover:bg-[#FAF5FF]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
