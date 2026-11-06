import React from 'react';

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading institutional records...' }) => (
  <div className="p-8 flex flex-col items-center justify-center gap-3 glass-card rounded-2xl">
    <div className="w-8 h-8 border-2 border-[#8DA390] border-t-transparent rounded-full animate-spin" />
    <span className="text-xs font-medium text-[#5B6E5E] dark:text-[#A3B899]">{message}</span>
  </div>
);

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ title, description, actionLabel, onAction }) => (
  <div className="p-10 flex flex-col items-center justify-center text-center glass-card rounded-2xl border border-dashed border-[#8DA390]/30">
    <div className="w-12 h-12 rounded-2xl bg-[#8DA390]/15 flex items-center justify-center text-[#5B6E5E] dark:text-[#A3B899] mb-3">
      📁
    </div>
    <h3 className="text-sm font-bold text-[#232D25] dark:text-[#E2ECE4]">{title}</h3>
    <p className="text-xs text-[#637466] dark:text-[#95A597] max-w-sm mt-1">{description}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#5B6E5E] hover:bg-[#4A5B4D] transition-colors shadow-sm"
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
  <div className="p-6 flex flex-col items-center justify-center text-center glass-card rounded-2xl border border-red-300 dark:border-red-900/50 bg-red-50/40 dark:bg-red-950/20">
    <span className="text-xs font-semibold text-red-700 dark:text-red-400">{message}</span>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-white/10 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
      >
        Retry
      </button>
    )}
  </div>
);
