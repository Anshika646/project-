import React from 'react';

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading institutional records...' }) => (
  <div className="p-8 flex flex-col items-center justify-center gap-3 bg-[#FFFFFF] border border-[#E8E4DF] rounded-2xl shadow-xs">
    <div className="w-8 h-8 border-3 border-[#6D28D9] border-t-transparent rounded-full animate-spin" />
    <span className="text-xs font-bold text-[#6D28D9]">{message}</span>
  </div>
);

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ title, description, actionLabel, onAction }) => (
  <div className="p-10 flex flex-col items-center justify-center text-center bg-[#FAF8F5] rounded-2xl border border-dashed border-[#DDD6FE]">
    <div className="w-12 h-12 rounded-2xl bg-[#FFFFFF] border border-[#DDD6FE]/60 flex items-center justify-center text-xl mb-3 shadow-xs">
      📁
    </div>
    <h3 className="text-sm font-extrabold text-[#0F172A]">{title}</h3>
    <p className="text-xs font-medium text-[#64748B] max-w-sm mt-1">{description}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-all shadow-sm"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

export const ErrorState: React.FC<{
  message: string;
  onRetry?: () => void;
}> = ({ message, onRetry }) => (
  <div className="p-6 flex flex-col items-center justify-center text-center bg-[#FFFFFF] rounded-2xl border border-[#DDD6FE]">
    <span className="text-xs font-bold text-[#6D28D9]">{message}</span>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-3 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-[#6D28D9] border border-[#DDD6FE] hover:bg-[#FFFFFF]"
      >
        Retry
      </button>
    )}
  </div>
);
