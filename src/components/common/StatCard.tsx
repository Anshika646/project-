import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  variant?: 'purple' | 'cream' | 'blush' | 'rose' | 'pink' | 'sage' | 'olive';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-5 transition-all duration-200 hover:shadow-md border border-[#E8E4DF] shadow-[0_2px_10px_-2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
      {/* Top Header Row with Softly Colored Icon Tile & Uppercase Label */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-wider uppercase text-[#64748B]">
          {title}
        </span>
        <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] text-[#6D28D9] border border-[#DDD6FE] flex items-center justify-center shadow-2xs">
          <Icon size={18} className="stroke-[2.2]" />
        </div>
      </div>

      {/* Large Bold Navy Number & Subtext */}
      <div className="mt-3">
        <div className="font-heading text-2xl lg:text-3xl font-extrabold text-[#0F172A] tabular-nums tracking-tight">
          {value}
        </div>
        {change && (
          <div className="flex items-center gap-1 text-xs font-semibold mt-1.5 text-[#6D28D9]">
            {isPositive ? (
              <ArrowUpRight size={14} className="stroke-[2.5]" />
            ) : (
              <ArrowDownRight size={14} className="stroke-[2.5]" />
            )}
            <span>{change}</span>
          </div>
        )}
      </div>
    </div>
  );
};
