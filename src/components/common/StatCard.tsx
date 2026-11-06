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
  // Styles based on variant using image palette (Orchid #DA5FCE, Cyan #3FB3D2, Lavender #E4DBF5)
  const getVariantStyles = () => {
    switch (variant) {
      case 'pink':
        return {
          iconBg: 'bg-white/80 dark:bg-white/10 text-[#DA5FCE]',
          accentColor: '#DA5FCE',
          trendColor: 'text-[#DA5FCE]',
          waveColor: '#DA5FCE',
          waveGlow: 'rgba(218, 95, 206, 0.25)',
        };
      case 'olive':
        return {
          iconBg: 'bg-white/80 dark:bg-white/10 text-[#3FB3D2]',
          accentColor: '#3FB3D2',
          trendColor: 'text-[#3FB3D2]',
          waveColor: '#3FB3D2',
          waveGlow: 'rgba(63, 179, 210, 0.25)',
        };
      case 'sage':
      default:
        return {
          iconBg: 'bg-white/80 dark:bg-white/10 text-[#DA5FCE]',
          accentColor: '#DA5FCE',
          trendColor: 'text-[#DA5FCE]',
          waveColor: '#3FB3D2',
          waveGlow: 'rgba(63, 179, 210, 0.25)',
        };
    }
  };

  const { iconBg, trendColor, waveColor, waveGlow } = getVariantStyles();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#E4DBF5] dark:bg-[#1E192B] p-5 transition-all duration-200 hover:shadow-md border border-[#DA5FCE]/15 dark:border-white/10 group">
      {/* Top Header Row with Title, Icon and Three Dots Menu like image template */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg} shadow-xs`}>
            <Icon size={19} />
          </div>
          <span className="text-xs font-semibold text-[#616C70] dark:text-[#C5BED8]">
            {title}
          </span>
        </div>

        {/* Three dots menu indicator matching screenshot */}
        <div className="flex items-center gap-1 text-[#DA5FCE] opacity-70 group-hover:opacity-100 transition-opacity">
          <span className="w-1 h-1 rounded-full bg-[#DA5FCE]" />
          <span className="w-1 h-1 rounded-full bg-[#DA5FCE]" />
          <span className="w-1 h-1 rounded-full bg-[#DA5FCE]" />
        </div>
      </div>

      {/* Numerical Metric */}
      <div className="mt-4 relative z-10">
        <div className="text-2xl lg:text-3xl font-extrabold text-[#061418] dark:text-[#EFF9FB] tabular-nums tracking-tight">
          {value}
        </div>
        {change && (
          <div className={`flex items-center gap-0.5 text-xs font-bold mt-1.5 ${trendColor}`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{change}</span>
          </div>
        )}
      </div>

      {/* Subtle organic bottom wave accent */}
      <div className="absolute -bottom-1 left-0 right-0 h-10 opacity-60 pointer-events-none overflow-hidden">
        <svg
          viewBox="0 0 100 25"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id={`grad-${title.replace(/\s+/g, '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={waveGlow} />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            d="M0,20 C30,10 50,22 70,12 C85,5 95,14 100,10 L100,25 L0,25 Z"
            fill={`url(#grad-${title.replace(/\s+/g, '')})`}
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
