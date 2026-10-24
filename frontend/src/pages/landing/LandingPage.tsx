import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import {
  Layers,
  ArrowRight,
  Columns3,
  FolderKanban,
  FileCode2,
  BarChart3,
  ShieldCheck,
  Database,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
  Terminal,
  ExternalLink,
  Code2,
  Menu,
  X,
} from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background ambient gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[480px] bg-gradient-to-tr from-indigo-600/15 via-violet-600/10 to-blue-500/10 rounded-full blur-3xl opacity-70" />
        <div className="absolute top-[35%] -left-48 w-[480px] h-[480px] bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-[65%] -right-48 w-[480px] h-[480px] bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-400 flex items-center justify-center shadow-lg shadow-indigo-600/25 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white">DevFlow</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PRO
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('preview')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Workspace
            </button>
            <button
              onClick={() => scrollToSection('workflow')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Workflow
            </button>
            <button
              onClick={() => scrollToSection('benefits')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Benefits
            </button>
            <button
              onClick={() => scrollToSection('architecture')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Architecture
            </button>
          </nav>

          {/* Auth Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium text-xs sm:text-sm hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-600/25 transition-all"
              >
                <span>Go to Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm font-semibold hover:bg-indigo-500 shadow-md shadow-indigo-600/25 transition-all"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-6 bg-slate-900 border-b border-slate-800 space-y-3">
            <button
              onClick={() => scrollToSection('features')}
              className="block w-full text-left py-2 text-sm text-slate-300 hover:text-white"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('preview')}
              className="block w-full text-left py-2 text-sm text-slate-300 hover:text-white"
            >
              Workspace Preview
            </button>
            <button
              onClick={() => scrollToSection('workflow')}
              className="block w-full text-left py-2 text-sm text-slate-300 hover:text-white"
            >
              Workflow
            </button>
            <button
              onClick={() => scrollToSection('benefits')}
              className="block w-full text-left py-2 text-sm text-slate-300 hover:text-white"
            >
              Benefits
            </button>
            <button
              onClick={() => scrollToSection('architecture')}
              className="block w-full text-left py-2 text-sm text-slate-300 hover:text-white"
            >
              Architecture
            </button>
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              {user ? (
                <Link
                  to="/dashboard"
                  className="w-full text-center py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full text-center py-2 rounded-xl border border-slate-700 text-slate-200 text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="w-full text-center py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm"
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 text-center">
        {/* Release tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-indigo-300 mb-8 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>Full-Stack Engineering Workspace</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 font-mono">v1.0 Production Ready</span>
        </div>

        {/* Main headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
          Plan Better. Build Faster.{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-sky-300 bg-clip-text text-transparent">
            Deliver Smarter.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          DevFlow is an all-in-one developer productivity platform combining interactive Kanban boards, 
          BOLA-guarded project workspaces, technical runbooks, and real-time delivery metrics.
        </p>

        {/* Hero CTA buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={user ? '/dashboard' : '/register'}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white font-semibold text-base shadow-xl shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500 transition-all cursor-pointer group"
          >
            <span>{user ? 'Continue to Workspace' : 'Get Started Free'}</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <button
            onClick={() => scrollToSection('features')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-200 font-medium text-base hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            <Columns3 className="h-4 w-4 text-indigo-400" />
            <span>Explore Features</span>
          </button>
        </div>

        {/* Tech stack pill strip */}
        <div className="mt-14 pt-8 border-t border-slate-900 max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> React 19 + TypeScript
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" /> Express 4 + ESM
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" /> Prisma ORM 5
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" /> PostgreSQL
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> Tailwind CSS v4
          </span>
        </div>
      </section>

      {/* Interactive Workspace Preview Section */}
      <section id="preview" className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="text-center mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-indigo-400 font-mono">
            Live Workspace Preview
          </h2>
          <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Engineered for High-Velocity Software Delivery
          </p>
        </div>

        {/* Mock Window Container */}
        <div className="rounded-2xl border border-slate-800/90 bg-slate-900/95 shadow-2xl shadow-indigo-950/40 overflow-hidden backdrop-blur-xl">
          {/* Window Titlebar */}
          <div className="h-11 bg-slate-950/80 border-b border-slate-800 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="ml-3 text-xs font-mono text-slate-400">devflow://workspace/kanban-board</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>API: connected</span>
            </div>
          </div>

          {/* Mock Window Body */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Top Mock Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/70">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">DevFlow Core Platform</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    KEY: DF
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Sprint Cycle 4 • 4 Active Collaborators</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  85% Completion Rate
                </span>
                <span className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                  12 Active Tasks
                </span>
              </div>
            </div>

            {/* Kanban Columns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Column 1: To Do */}
              <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3.5 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-slate-400" />
                    To Do
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400">2</span>
                </div>

                {/* Card 1 */}
                <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 space-y-2 hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-indigo-400 font-semibold">DF-104</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                      MEDIUM
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-200">Implement Redis cache for project metrics</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-slate-800/80">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Clock className="h-3 w-3" /> Tomorrow
                    </span>
                    <span className="font-mono text-slate-300">Backend</span>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 space-y-2 hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-indigo-400 font-semibold">DF-105</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">
                      LOW
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-200">Export Kanban tasks to CSV spreadsheet</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-slate-800/80">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Clock className="h-3 w-3" /> Next week
                    </span>
                    <span className="font-mono text-slate-300">Frontend</span>
                  </div>
                </div>
              </div>

              {/* Column 2: In Progress */}
              <div className="rounded-xl bg-slate-950/70 border border-blue-500/30 p-3.5 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-blue-300">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                    In Progress
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-950/60 text-[10px] text-blue-300 border border-blue-800/50">
                    1
                  </span>
                </div>

                <div className="rounded-lg bg-slate-900 border border-blue-500/30 p-3 space-y-2 ring-1 ring-blue-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-indigo-400 font-semibold">DF-102</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-medium">
                      HIGH
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-100">BOLA authorization validation on notes routes</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-slate-800/80">
                    <span className="flex items-center gap-1 text-amber-400">
                      <Clock className="h-3 w-3" /> In Dev
                    </span>
                    <span className="font-mono text-indigo-300 font-semibold">Security</span>
                  </div>
                </div>
              </div>

              {/* Column 3: In Review */}
              <div className="rounded-xl bg-slate-950/70 border border-amber-500/30 p-3.5 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    In Review
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-950/60 text-[10px] text-amber-300 border border-amber-800/50">
                    1
                  </span>
                </div>

                <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 space-y-2 hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-indigo-400 font-semibold">DF-99</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                      MEDIUM
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-200">JWT HTTP-only cookie SameSite configuration</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-slate-800/80">
                    <span className="flex items-center gap-1 text-slate-300">PR #14 Approved</span>
                    <span className="font-mono text-slate-300">DevOps</span>
                  </div>
                </div>
              </div>

              {/* Column 4: Done */}
              <div className="rounded-xl bg-slate-950/70 border border-emerald-500/30 p-3.5 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-300">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Done
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-[10px] text-emerald-300 border border-emerald-800/50">
                    2
                  </span>
                </div>

                <div className="rounded-lg bg-slate-900/80 border border-emerald-500/20 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">DF-88</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <p className="text-xs font-medium text-slate-300 line-through">PostgreSQL 18 initial schema migration</p>
                  <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-800/80">
                    Verified on Render
                  </div>
                </div>

                <div className="rounded-lg bg-slate-900/80 border border-emerald-500/20 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">DF-91</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <p className="text-xs font-medium text-slate-300 line-through">Automated Vitest CI workflow</p>
                  <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-800/80">
                    GitHub Actions: PASS
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-indigo-400 font-mono">
            Platform Capabilities
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            Built From Ground Up for Technical Teams
          </p>
          <p className="text-slate-400 text-sm sm:text-base mt-3">
            Every feature in DevFlow maps to the actual engineering lifecycle without fluff or bloat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 p-6 hover:border-indigo-500/40 transition-all hover:-translate-y-1 group">
            <div className="h-11 w-11 rounded-xl bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Columns3 className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">Interactive Kanban Workflow</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              4-column agile task board with drag-and-drop mechanics, quick status updates, 4 priority tiers, 
              overdue alerts, and discussion comments on task cards.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 p-6 hover:border-violet-500/40 transition-all hover:-translate-y-1 group">
            <div className="h-11 w-11 rounded-xl bg-violet-600/15 text-violet-400 border border-violet-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FolderKanban className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">Project Workspaces & RBAC</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              Organize projects with uppercase codes (`DF`, `API`), role hierarchies (`OWNER`, `ADMIN`, `MEMBER`), 
              and automatic colleague account provisioning on invite.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 p-6 hover:border-sky-500/40 transition-all hover:-translate-y-1 group">
            <div className="h-11 w-11 rounded-xl bg-sky-600/15 text-sky-400 border border-sky-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileCode2 className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">Technical Notes & Runbooks</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              Store architectural decision records (ADRs), deployment runbooks, and API specifications directly 
              inside project scopes with markdown readability.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 p-6 hover:border-emerald-500/40 transition-all hover:-translate-y-1 group">
            <div className="h-11 w-11 rounded-xl bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">Delivery Metrics & Analytics</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              Real-time aggregation queries computing completion rates, overdue counters, status distributions, 
              and user activity audit trails.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 p-6 hover:border-amber-500/40 transition-all hover:-translate-y-1 group">
            <div className="h-11 w-11 rounded-xl bg-amber-600/15 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">BOLA & Cryptographic Security</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              Strict Broken Object-Level Authorization safeguards, Bcrypt salted hashing, JWT tokens, 
              Zod runtime schemas, Helmet headers, and CORS origin enforcement.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 p-6 hover:border-blue-500/40 transition-all hover:-translate-y-1 group">
            <div className="h-11 w-11 rounded-xl bg-blue-600/15 text-blue-400 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">Dual-Database Architecture</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              Zero-friction embedded SQLite for instantaneous local development paired with robust PostgreSQL 
              migrations for production reliability.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works / Workflow Section */}
      <section id="workflow" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-indigo-400 font-mono">
            How DevFlow Works
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            From Project Inception to Production Delivery
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5 space-y-3 relative">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
              1
            </div>
            <h4 className="text-base font-semibold text-white">Create Workspaces</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Register an account, create a project with a short identifier key, and invite teammates with role permissions.
            </p>
          </div>

          <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5 space-y-3 relative">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
              2
            </div>
            <h4 className="text-base font-semibold text-white">Organize Kanban Tasks</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Draft tasks with deadlines and priority badges. Drag cards across columns to reflect live progress.
            </p>
          </div>

          <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5 space-y-3 relative">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
              3
            </div>
            <h4 className="text-base font-semibold text-white">Document & Collaborate</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Author technical runbooks and architecture notes directly alongside tasks without context switching.
            </p>
          </div>

          <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5 space-y-3 relative">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
              4
            </div>
            <h4 className="text-base font-semibold text-white">Track Delivery KPIs</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Monitor sprint completion velocity, overdue warnings, and activity audit trails on the analytics dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-indigo-400 font-mono">
            Designed for Builders
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            Tailored for Every Stage of Engineering
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Benefit 1 */}
          <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 p-6 space-y-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <Terminal className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">For Solo Developers</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Stop losing progress between scattered bookmarks and local notes. Keep your side projects, bugs, 
              and technical decisions structured in one lightning-fast workspace.
            </p>
          </div>

          {/* Benefit 2 */}
          <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 p-6 space-y-4">
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center">
              <Code2 className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">For Student Engineers</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Showcase production-grade full-stack architecture on your engineering resume. Demonstrate clean relational 
              modeling, automated testing, and secure JWT authentication in interviews.
            </p>
          </div>

          {/* Benefit 3 */}
          <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 p-6 space-y-4">
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">For Agile Teams</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Collaborate with strict multi-user access control, invite teammates with auto-provisioning, 
              and review sprint delivery metrics without enterprise Jira complexity.
            </p>
          </div>
        </div>
      </section>

      {/* Architecture Highlights Section */}
      <section id="architecture" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 border-t border-slate-900">
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800/80 p-8 sm:p-12">
          <div className="max-w-3xl">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-indigo-400 font-mono">
              Production Architecture
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Decoupled Cloud Architecture: Vercel + Render + PostgreSQL
            </p>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              The frontend is bundled as an optimized SPA on Vercel's global CDN, communicating with a containerized 
              Express 4 API microservice on Render, backed by managed PostgreSQL with automated Prisma migrations.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 text-xs font-mono">
              <span className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
                Frontend: Vercel Edge Network
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
                API: Node.js 24 ESM on Render
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
                Database: Managed PostgreSQL with SSL
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
                CI/CD: GitHub Actions (Vitest + Lint)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto z-10 text-center">
        <div className="rounded-3xl bg-gradient-to-tr from-indigo-900/40 via-violet-900/30 to-slate-900 border border-indigo-500/30 p-10 sm:p-16 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready to Upgrade Your Developer Workflow?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mt-4">
              Get started with DevFlow today. Free, open, and built for engineering excellence.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                to={user ? '/dashboard' : '/register'}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-slate-950 font-bold text-base hover:bg-slate-100 shadow-xl transition-all cursor-pointer"
              >
                <span>{user ? 'Open Workspace' : 'Create Free Account'}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-xs text-slate-400">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Layers className="h-4 w-4" />
            </div>
            <span className="font-bold text-slate-200 text-sm">DevFlow</span>
            <span className="text-slate-400">| Complete Developer Productivity Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-slate-200 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-slate-200 transition-colors">
              Register
            </Link>
            <a
              href="https://github.com/KiranKishore05/devflow"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-200 transition-colors flex items-center gap-1"
            >
              <span>GitHub</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-900 text-center text-slate-400">
          © {CURRENT_YEAR} DevFlow. Built with React 19, TypeScript, Express, and PostgreSQL.
        </div>
      </footer>
    </div>
  );
};
