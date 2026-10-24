import React from 'react';
import { clsx } from 'clsx';

export interface DevFlowLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showBadge?: boolean;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  animated?: boolean;
}

export const DevFlowLogo: React.FC<DevFlowLogoProps> = ({
  size = 'md',
  showText = false,
  showBadge = false,
  className = '',
  iconClassName = '',
  textClassName = '',
  animated = true,
}) => {
  // Size mapping for icon container
  const sizeMap = {
    xs: { box: 'h-6 w-6 rounded-lg', svg: 24, text: 'text-sm', badge: 'text-[9px] px-1 py-0.2' },
    sm: { box: 'h-8 w-8 rounded-xl', svg: 32, text: 'text-base', badge: 'text-[10px] px-1.5 py-0.5' },
    md: { box: 'h-9 w-9 rounded-xl', svg: 36, text: 'text-lg', badge: 'text-[10px] px-1.5 py-0.5' },
    lg: { box: 'h-11 w-11 rounded-2xl', svg: 44, text: 'text-xl', badge: 'text-[11px] px-2 py-0.5' },
    xl: { box: 'h-14 w-14 rounded-2xl', svg: 56, text: 'text-2xl', badge: 'text-xs px-2.5 py-1' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={clsx('inline-flex items-center gap-3 select-none', className)}>
      {/* Logo Icon with Rounded-Square Glass Container */}
      <div
        className={clsx(
          currentSize.box,
          'relative flex items-center justify-center shrink-0 overflow-hidden',
          'bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900',
          'border border-slate-700/60 shadow-lg shadow-indigo-950/40',
          'backdrop-blur-md',
          animated && 'transition-all duration-300 group-hover:scale-105 group-hover:border-indigo-500/50 group-hover:shadow-indigo-500/20',
          iconClassName
        )}
      >
        {/* Subtle ambient back-glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-violet-500/15 to-pink-500/15 opacity-70 group-hover:opacity-100 transition-opacity" />

        {/* Vector SVG Mark (D + Lightning Bolt) */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5 relative z-10"
        >
          <defs>
            {/* Left Spine: Cyan to Electric Blue to Indigo Lightning */}
            <linearGradient id="logo-lightning" x1="22" y1="18" x2="54" y2="82" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00f2fe" />
              <stop offset="35%" stopColor="#38bdf8" />
              <stop offset="75%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>

            {/* Right Arc: Violet to Magenta to Hot Pink D-Wing */}
            <linearGradient id="logo-arc" x1="48" y1="18" x2="84" y2="82" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#d946ef" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>

            {/* Ambient Core Glow */}
            <radialGradient id="logo-core" cx="48" cy="48" r="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#070b14" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Central Radial Glow */}
          <circle cx="50" cy="50" r="40" fill="url(#logo-core)" />

          {/* Left Lightning Spine (Speed & Productivity) */}
          <path
            d="M46 18 L24 49 L42 49 L28 82 L58 45 L40 45 L54 18 Z"
            fill="url(#logo-lightning)"
            className={clsx(animated && 'transition-transform duration-300 group-hover:-translate-x-0.5')}
          />

          {/* Right Aerodynamic D-Flow Arc */}
          <path
            d="M54 18 C71 18 84 31 84 50 C84 69 71 82 54 82 L46 82 L53 72 C65 72 73 63 73 50 C73 37 65 28 53 28 L47 28 L54 18 Z"
            fill="url(#logo-arc)"
            className={clsx(animated && 'transition-transform duration-300 group-hover:translate-x-0.5')}
          />
        </svg>
      </div>

      {/* Brand Text Lockup */}
      {showText && (
        <div className="flex items-center gap-1.5">
          <span className={clsx('font-bold tracking-tight text-white', currentSize.text, textClassName)}>
            Dev<span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-500 bg-clip-text text-transparent">Flow</span>
          </span>
          {showBadge && (
            <span
              className={clsx(
                'font-bold uppercase tracking-wider rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30',
                currentSize.badge
              )}
            >
              PRO
            </span>
          )}
        </div>
      )}
    </div>
  );
};
