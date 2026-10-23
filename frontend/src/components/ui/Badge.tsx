import React from 'react';
import { TaskStatus, TaskPriority, ProjectRole } from '@/types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'status' | 'priority' | 'role' | 'default';
  status?: TaskStatus;
  priority?: TaskPriority;
  role?: ProjectRole;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  status,
  priority,
  role,
  className,
}) => {
  let styleClasses = 'bg-slate-800 text-slate-300 border-slate-700';
  let label = children;

  if (variant === 'status' && status) {
    switch (status) {
      case 'TODO':
        styleClasses = 'bg-slate-800/80 text-slate-300 border-slate-700/60';
        label = label || 'To Do';
        break;
      case 'IN_PROGRESS':
        styleClasses = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
        label = label || 'In Progress';
        break;
      case 'IN_REVIEW':
        styleClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
        label = label || 'In Review';
        break;
      case 'DONE':
        styleClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
        label = label || 'Done';
        break;
    }
  } else if (variant === 'priority' && priority) {
    switch (priority) {
      case 'LOW':
        styleClasses = 'bg-slate-800 text-slate-400 border-slate-700';
        label = label || 'Low';
        break;
      case 'MEDIUM':
        styleClasses = 'bg-sky-500/10 text-sky-400 border-sky-500/30';
        label = label || 'Medium';
        break;
      case 'HIGH':
        styleClasses = 'bg-orange-500/10 text-orange-400 border-orange-500/30';
        label = label || 'High';
        break;
      case 'CRITICAL':
        styleClasses = 'bg-rose-500/15 text-rose-400 border-rose-500/40 font-semibold animate-pulse';
        label = label || 'Critical';
        break;
    }
  } else if (variant === 'role' && role) {
    switch (role) {
      case 'OWNER':
        styleClasses = 'bg-purple-500/10 text-purple-400 border-purple-500/30 font-medium';
        label = label || 'Owner';
        break;
      case 'ADMIN':
        styleClasses = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 font-medium';
        label = label || 'Admin';
        break;
      case 'MEMBER':
        styleClasses = 'bg-slate-800 text-slate-300 border-slate-700';
        label = label || 'Member';
        break;
    }
  }

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border font-medium tracking-wide',
          styleClasses,
          className
        )
      )}
    >
      {label}
    </span>
  );
};
