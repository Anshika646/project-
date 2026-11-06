import React from 'react';

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading institutional records...' }) => (
  <div className="p-8 flex flex-col items-center justify-center gap-3 bg-[#F5F3FF] border border-[#E9D5FF] rounded-2xl shadow-xs">
    <div className="w-8 h-8 border-3 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
    <span className="text-xs font-bold text-[#8B5CF6]">{message}</span>
  </div>
);

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ title, description, actionLabel, onAction }) => (
  <div className="p-10 flex flex-col items-center justify-center text-center bg-[#FAF5FF] rounded-2xl border border-dashed border-[#C4B5FD]">
    <div className="w-12 h-12 rounded-2xl bg-[#F3E8FF] border border-[#C4B5FD]/60 flex items-center justify-center text-xl mb-3 shadow-xs">
      📁
    </div>
    <h3 className="text-sm font-extrabold text-[#171417]">{title}</h3>
    <p className="text-xs font-medium text-[#625C60] max-w-sm mt-1">{description}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] transition-all shadow-sm"
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
  <div className="p-6 flex flex-col items-center justify-center text-center bg-[#F5F3FF] rounded-2xl border border-[#C4B5FD]">
    <span className="text-xs font-bold text-[#8B5CF6]">{message}</span>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-3 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-[#8B5CF6] border border-[#C4B5FD] hover:bg-[#F3E8FF]"
      >
        Retry
      </button>
    )}
  </div>
);
