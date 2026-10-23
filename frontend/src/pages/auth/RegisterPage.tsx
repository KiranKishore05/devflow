import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { Layers, Mail, Lock, User as UserIcon, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await register(email, password, name);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Email might already be taken.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-950 bg-grid-pattern relative">
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 translate-x-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-400 items-center justify-center shadow-xl shadow-indigo-600/30 ring-1 ring-white/20 mb-3">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Create your DevFlow account</h1>
          <p className="text-sm text-slate-400 mt-1">Start collaborating with projects, tasks, and tech notes</p>
        </div>

        <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-7 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<UserIcon className="h-4 w-4" />}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="alex@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
              autoComplete="email"
              required
            />

            <Input
              label="Password (min. 8 characters)"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
              autoComplete="new-password"
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
              autoComplete="new-password"
              required
            />

            <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isSubmitting}>
              <span>Create Account</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
