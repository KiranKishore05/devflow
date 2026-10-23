import React, { SelectHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, children, id, ...props }, ref) => {
    const selectId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-medium text-slate-300 mb-1.5">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={twMerge(
            clsx(
              'w-full rounded-lg bg-slate-900 border border-slate-700/80 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:bg-slate-900',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500',
              className
            )
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <p className="mt-1 text-xs text-rose-400 font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
