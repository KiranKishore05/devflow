import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Columns3,
  FileCode2,
  BarChart3,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { DevFlowLogo } from '@/components/ui/DevFlowLogo';
import { clsx } from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', path: '/projects', icon: FolderKanban },
    { label: 'Kanban Board', path: '/kanban', icon: Columns3 },
    { label: 'Tech Notes', path: '/notes', icon: FileCode2 },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-slate-900/90 border-r border-slate-800/80 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand / Logo */}
        <Link to="/dashboard" className="flex items-center px-5 h-16 border-b border-slate-800/80 hover:bg-slate-800/30 transition-colors group">
          <DevFlowLogo size="md" showText showBadge />
        </Link>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-300 tracking-wider uppercase font-mono">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  clsx(
                    'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={clsx(
                        'h-4 w-4 transition-transform group-hover:scale-110',
                        isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-300'
                      )}
                    />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="h-3.5 w-3.5 text-indigo-400" />}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* System status pill */}
        <div className="px-4 py-3 mx-3 my-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-slate-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Engine Online
            </span>
            <span className="text-[11px] font-mono text-slate-300 font-semibold">PostgreSQL</span>
          </div>
        </div>

        {/* Current User & Logout */}
        <div className="p-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 flex items-center justify-center font-semibold text-xs shrink-0">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'DF'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Developer'}</p>
                <p className="text-[11px] text-slate-300 truncate font-mono">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
