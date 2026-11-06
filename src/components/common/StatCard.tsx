import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  variant?: 'sage' | 'pink' | 'olive';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  variant = 'sage',
}) => {
  // Styles based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'pink':
        return {
          iconBg: 'bg-[#F4D3D6] text-[#A64B56] dark:bg-[#4D282D] dark:text-[#E8B4B8]',
          waveColor: '#E8B4B8',
          waveGlow: 'rgba(232, 180, 184, 0.25)',
        };
      case 'olive':
        return {
          iconBg: 'bg-[#D2DDD3] text-[#3D5240] dark:bg-[#2F3D32] dark:text-[#C2D8C2]',
          waveColor: '#7D9D85',
          waveGlow: 'rgba(125, 157, 133, 0.25)',
        };
      case 'sage':
      default:
        return {
          iconBg: 'bg-[#DEE7DF] text-[#405443] dark:bg-[#28352A] dark:text-[#A3B899]',
          waveColor: '#8DA390',
          waveGlow: 'rgba(141, 163, 144, 0.25)',
        };
    }
  };

  const { iconBg, waveColor, waveGlow } = getVariantStyles();

  return (
    <div className="relative overflow-hidden rounded-2xl glass-card p-5 transition-all duration-200 hover:shadow-lg border border-white/70 dark:border-white/10 group">
      {/* Top Header Row with Icon and Trend Indicator */}
      <div className="flex items-center justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg} shadow-sm`}>
          <Icon size={22} />
        </div>

        {change && (
          <div className="flex items-center gap-0.5 text-xs font-semibold text-[#44684A] dark:text-[#88C492]">
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{change}</span>
          </div>
        )}
      </div>

      {/* Numerical Metric & Title */}
      <div className="mt-4 relative z-10">
        <div className="text-2xl lg:text-3xl font-extrabold text-[#232D25] dark:text-[#F3F7F4] tabular-nums tracking-tight">
          {value}
        </div>
        <div className="text-xs font-medium text-[#657667] dark:text-[#9FB1A2] mt-0.5">
          {title}
        </div>
      </div>

      {/* Organic Wave Graphic at bottom matching mockup */}
      <div className="absolute -bottom-1 left-0 right-0 h-10 opacity-70 pointer-events-none overflow-hidden">
        <svg
          viewBox="0 0 100 25"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id={`grad-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={waveGlow} />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            d="M0,20 C30,10 50,22 70,12 C85,5 95,14 100,10 L100,25 L0,25 Z"
            fill={`url(#grad-${title})`}
          />
          <path
            d="M0,20 C30,10 50,22 70,12 C85,5 95,14 100,10"
            fill="none"
            stroke={waveColor}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
};
