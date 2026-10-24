import React from 'react';
import { Menu, Search } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileSidebar }) => {
  const { user } = useAuth();

  // Query health status from backend
  const { data: healthData } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      try {
        return await api.get<{ status: string; database: { status: string } }>('/health');
      } catch {
        return { status: 'degraded', database: { status: 'disconnected' } };
      }
    },
    refetchInterval: 30000,
  });

  const isDbConnected = healthData?.database?.status === 'connected';

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Search placeholder */}
        <div className="relative hidden sm:block w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects, tasks, notes..."
            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Health status indicator */}
        <div
          title={isDbConnected ? 'PostgreSQL Database Connected' : 'Database Status: Disconnected or Initializing'}
          className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/70 border border-slate-700/60 text-xs font-medium"
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isDbConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400'
            }`}
          />
          <span className="hidden sm:inline text-slate-300">
            {isDbConnected ? 'DB Connected' : 'Standby'}
          </span>
        </div>

        {/* User avatar indicator */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-600/20 ring-1 ring-white/10">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <span className="hidden md:inline text-xs font-semibold text-slate-200">
            {user?.name || 'Developer'}
          </span>
        </div>
      </div>
    </header>
  );
};
