import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { DashboardMetrics, Project } from '@/types';
import { useToast } from '@/features/toast/ToastContext';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

export const DashboardPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectKey, setProjectKey] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // Fetch Dashboard Analytics
  const { data: metricsData, isLoading: isMetricsLoading, refetch: refetchMetrics } = useQuery<{
    success: boolean;
    data: DashboardMetrics;
  }>({
    queryKey: ['dashboard-metrics'],
    queryFn: () => api.get('/analytics/dashboard'),
  });

  // Fetch Recent Projects
  const { data: projectsData, refetch: refetchProjects } = useQuery<{
    success: boolean;
    data: Project[];
  }>({
    queryKey: ['recent-projects'],
    queryFn: () => api.get('/projects?limit=5'),
  });

  const metrics = metricsData?.data;
  const projects = projectsData?.data || [];

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName || !projectKey) return;
    try {
      setIsCreatingProject(true);
      await api.post('/projects', {
        name: projectName,
        key: projectKey.toUpperCase(),
        description: projectDescription,
      });
      setIsNewProjectModalOpen(false);
      setProjectName('');
      setProjectKey('');
      setProjectDescription('');
      refetchProjects();
      refetchMetrics();
      success(`Project "${projectName}" created successfully!`, 'Project Created');
    } catch (err: any) {
      toastError(err.message || 'Failed to create project', 'Creation Failed');
    } finally {
      setIsCreatingProject(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Developer Workspace
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time tracking of projects, Kanban tasks, tech notes, and delivery metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setIsNewProjectModalOpen(true)}
          >
            New Project
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card flex items-center justify-between p-5">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">
              Total Projects
            </p>
            <p className="text-3xl font-bold text-slate-100 mt-1.5">
              {isMetricsLoading ? '—' : metrics?.totalProjects ?? 0}
            </p>
            <p className="text-[11px] text-indigo-400 mt-1 flex items-center gap-1 font-medium">
              <FolderKanban className="h-3 w-3" /> Managed Repos & Spaces
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Layers className="h-6 w-6" />
          </div>
        </Card>

        <Card className="glass-card flex items-center justify-between p-5">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">
              Completed Tasks
            </p>
            <p className="text-3xl font-bold text-emerald-400 mt-1.5">
              {isMetricsLoading ? '—' : metrics?.completedTasks ?? 0}
            </p>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="h-3 w-3" /> {metrics?.completionRate ?? 0}% Completion Rate
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </Card>

        <Card className="glass-card flex items-center justify-between p-5">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">
              In Flight Tasks
            </p>
            <p className="text-3xl font-bold text-sky-400 mt-1.5">
              {isMetricsLoading ? '—' : metrics?.pendingTasks ?? 0}
            </p>
            <p className="text-[11px] text-sky-400 mt-1 flex items-center gap-1 font-medium">
              <Clock className="h-3 w-3" /> Active Development
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
        </Card>

        <Card className="glass-card flex items-center justify-between p-5">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">
              Overdue / Critical
            </p>
            <p className="text-3xl font-bold text-rose-400 mt-1.5">
              {isMetricsLoading ? '—' : metrics?.overdueTasks ?? 0}
            </p>
            <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
              <AlertTriangle className="h-3 w-3" /> Needs Attention
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </Card>
      </div>

      {/* Main Grid: Projects Overview & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-200">Active Projects</h2>
            <Link
              to="/projects"
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.length === 0 ? (
              <div className="col-span-2 p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center">
                <FolderKanban className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-300">No projects yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Create your first project to start tracking tasks and notes.
                </p>
                <Button
                  size="sm"
                  variant="primary"
                  className="mt-4"
                  onClick={() => setIsNewProjectModalOpen(true)}
                >
                  Create Project
                </Button>
              </div>
            ) : (
              projects.map((proj) => (
                <Link
                  key={proj.id}
                  to={`/projects/${proj.id}`}
                  className="group rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 hover:border-indigo-500/40 hover:bg-slate-900 transition-all duration-200 block"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {proj.key}
                      </span>
                      <h3 className="text-sm font-semibold text-slate-100 mt-2 group-hover:text-indigo-300 transition-colors">
                        {proj.name}
                      </h3>
                    </div>
                    <Badge variant="role" role="OWNER">
                      {proj.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {proj.description || 'No description provided.'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                    <span>{proj._count?.tasks ?? 0} tasks</span>
                    <span>{proj._count?.notes ?? 0} notes</span>
                    <span>{proj._count?.memberships ?? 1} members</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Activity Feed (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-400" /> Recent Activity
            </h2>
          </div>

          <Card className="glass-card divide-y divide-slate-800/60 p-0 overflow-hidden">
            {metrics?.recentActivities && metrics.recentActivities.length > 0 ? (
              metrics.recentActivities.slice(0, 6).map((activity) => (
                <div key={activity.id} className="p-3.5 flex items-start gap-3 hover:bg-slate-800/30 transition-colors">
                  <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs shrink-0 mt-0.5">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-200">
                      <span className="font-semibold text-slate-100">{activity.user?.name || 'User'}</span>{' '}
                      {activity.action.toLowerCase().replace('_', ' ')}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {new Date(activity.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                No recent activity recorded yet.
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* New Project Modal */}
      <Modal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        title="Create New Project"
        description="A project groups tasks, Kanban boards, and technical documentation."
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <Input
            label="Project Name"
            placeholder="DevFlow Core Platform"
            value={projectName}
            onChange={(e) => {
              setProjectName(e.target.value);
              if (!projectKey) {
                setProjectKey(
                  e.target.value
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 4)
                    .toUpperCase()
                );
              }
            }}
            required
          />

          <Input
            label="Project Key (e.g., DF, API, WEB)"
            placeholder="DF"
            value={projectKey}
            onChange={(e) => setProjectKey(e.target.value.toUpperCase())}
            maxLength={10}
            required
          />

          <Textarea
            label="Description (Optional)"
            placeholder="High-level goals, repository links, or architecture notes"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            rows={3}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNewProjectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isCreatingProject}>
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
