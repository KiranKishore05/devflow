import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
      <div className="p-3.5 rounded-2xl bg-slate-800/80 text-indigo-400 mb-4 shadow-inner ring-1 ring-white/10">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-200">{title}</h3>
      <p className="text-sm text-slate-400 mt-1 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="mt-5" variant="secondary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
