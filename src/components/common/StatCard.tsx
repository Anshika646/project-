import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  variant?: 'pink' | 'cream' | 'blush' | 'rose' | 'sage' | 'olive';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  variant = 'pink',
}) => {
  // Pastel light card backgrounds
  const getCardBg = () => {
    switch (variant) {
      case 'cream':
        return 'bg-[#FAF5FF]';
      case 'blush':
        return 'bg-[#EDE9FE]';
      case 'rose':
        return 'bg-[#FDFBFF]';
      case 'pink':
      default:
        return 'bg-[#F5F3FF]';
    }
  };

  const cardBgClass = getCardBg();

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${cardBgClass} p-5 transition-all duration-200 hover:shadow-md border border-[#E9D5FF] shadow-[0_4px_20px_-4px_rgba(139, 92, 246,0.06)] group`}
    >
      {/* Top Header Row with Icon, Title and Three Dots Menu */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/90 text-[#8B5CF6] border border-[#C4B5FD]/40 shadow-xs">
            <Icon size={19} className="stroke-[2.2]" />
          </div>
          <span className="text-xs font-bold text-[#625C60]">
            {title}
          </span>
        </div>

        {/* Delicate three dots indicator */}
        <div className="flex items-center gap-1 text-[#C4B5FD] group-hover:text-[#8B5CF6] transition-colors">
          <span className="w-1 h-1 rounded-full bg-current" />
          <span className="w-1 h-1 rounded-full bg-current" />
          <span className="w-1 h-1 rounded-full bg-current" />
        </div>
      </div>

      {/* Numerical Metric in Bold Black Manrope */}
      <div className="mt-4 relative z-10">
        <div className="font-stat text-2xl lg:text-3xl font-extrabold text-[#171417] tabular-nums tracking-tight">
          {value}
        </div>
        {change && (
          <div className="flex items-center gap-1 text-xs font-bold mt-1.5 text-[#8B5CF6]">
            {isPositive ? <ArrowUpRight size={14} className="stroke-[2.5]" /> : <ArrowDownRight size={14} className="stroke-[2.5]" />}
            <span>{change}</span>
          </div>
        )}
      </div>

      {/* Subtle organic bottom sparkline wave in pink accent */}
      <div className="absolute -bottom-1 left-0 right-0 h-10 opacity-70 pointer-events-none overflow-hidden">
        <svg
          viewBox="0 0 100 25"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id={`grad-${title.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0.18)" />
              <stop offset="100%" stopColor="rgba(139, 92, 246, 0.0)" />
            </linearGradient>
          </defs>
          <path
            d="M0,20 C30,10 50,22 70,12 C85,6 95,14 100,10 L100,25 L0,25 Z"
            fill={`url(#grad-${title.replace(/[^a-zA-Z0-9]/g, '')})`}
          />
          <path
            d="M0,20 C30,10 50,22 70,12 C85,6 95,14 100,10"
            fill="none"
            stroke="#8B5CF6"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
};
