import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { Layers, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('dev@devflow.local');
    setPassword('Developer123!');
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-950 bg-grid-pattern relative">
      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 translate-x-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-400 items-center justify-center shadow-xl shadow-indigo-600/30 ring-1 ring-white/20 mb-3">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Welcome back to DevFlow</h1>
          <p className="text-sm text-slate-400 mt-1">Sign in to manage your projects, Kanban, and notes</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-7 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
              autoComplete="email"
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
              autoComplete="current-password"
              required
            />

            <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isSubmitting}>
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </form>

          {/* Quick Demo Helper */}
          <div className="mt-5 pt-4 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={fillDemoAccount}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium underline underline-offset-4 cursor-pointer"
            >
              Fill demo credentials (dev@devflow.local)
            </button>
          </div>
        </div>

        {/* Footer link */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
