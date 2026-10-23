import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DashboardMetrics } from '@/types';
import { BarChart3, TrendingUp, CheckCircle2, Clock, AlertTriangle, Activity, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export const AnalyticsPage: React.FC = () => {
  const { data: metricsData, isLoading } = useQuery<{ success: boolean; data: DashboardMetrics }>({
    queryKey: ['analytics-metrics'],
    queryFn: () => api.get('/analytics/dashboard'),
  });

  const metrics = metricsData?.data;

  const total = metrics?.totalTasks || 0;
  const statusCounts = metrics?.tasksByStatus || { TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 };
  const priorityCounts = metrics?.tasksByPriority || { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };

  const getPercent = (count: number) => {
    if (!total) return 0;
    return Math.round((count / total) * 100);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Engineering Analytics & Productivity
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Quantitative insights derived from actual project deliverables, task velocities, and status distributions.
        </p>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card p-5">
          <p className="text-xs font-mono uppercase text-slate-400">Completion Velocity</p>
          <p className="text-3xl font-bold text-emerald-400 mt-2">{metrics?.completionRate ?? 0}%</p>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics?.completionRate ?? 0}%` }}
            />
          </div>
        </Card>

        <Card className="glass-card p-5">
          <p className="text-xs font-mono uppercase text-slate-400">Total Work Items</p>
          <p className="text-3xl font-bold text-slate-100 mt-2">{total}</p>
          <p className="text-xs text-slate-400 mt-3 font-mono">
            {metrics?.totalProjects ?? 0} active repositories & spaces
          </p>
        </Card>

        <Card className="glass-card p-5">
          <p className="text-xs font-mono uppercase text-slate-400">In Active Development</p>
          <p className="text-3xl font-bold text-sky-400 mt-2">{metrics?.pendingTasks ?? 0}</p>
          <p className="text-xs text-sky-400 mt-3 font-mono">
            {statusCounts.IN_PROGRESS} coding, {statusCounts.IN_REVIEW} in review
          </p>
        </Card>

        <Card className="glass-card p-5">
          <p className="text-xs font-mono uppercase text-slate-400">Overdue SLA Warning</p>
          <p className="text-3xl font-bold text-rose-400 mt-2">{metrics?.overdueTasks ?? 0}</p>
          <p className="text-xs text-rose-400 mt-3 font-mono">
            {priorityCounts.CRITICAL} critical priority items
          </p>
        </Card>
      </div>

      {/* Breakdown Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card className="glass-card p-6">
          <h2 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-400" />
            Task Status Breakdown
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                <span>To Do</span>
                <span className="font-mono text-slate-400">{statusCounts.TODO} ({getPercent(statusCounts.TODO)}%)</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-slate-500 h-full rounded-full" style={{ width: `${getPercent(statusCounts.TODO)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                <span>In Progress</span>
                <span className="font-mono text-slate-400">{statusCounts.IN_PROGRESS} ({getPercent(statusCounts.IN_PROGRESS)}%)</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${getPercent(statusCounts.IN_PROGRESS)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                <span>In Review</span>
                <span className="font-mono text-slate-400">{statusCounts.IN_REVIEW} ({getPercent(statusCounts.IN_REVIEW)}%)</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${getPercent(statusCounts.IN_REVIEW)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                <span>Done</span>
                <span className="font-mono text-slate-400">{statusCounts.DONE} ({getPercent(statusCounts.DONE)}%)</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${getPercent(statusCounts.DONE)}%` }} />
              </div>
            </div>
          </div>
        </Card>

        {/* Priority Distribution */}
        <Card className="glass-card p-6">
          <h2 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-indigo-400" />
            Task Priority Distribution
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                <span>Critical</span>
                <span className="font-mono text-rose-400 font-bold">{priorityCounts.CRITICAL} items</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${getPercent(priorityCounts.CRITICAL)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                <span>High</span>
                <span className="font-mono text-orange-400 font-bold">{priorityCounts.HIGH} items</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full" style={{ width: `${getPercent(priorityCounts.HIGH)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                <span>Medium</span>
                <span className="font-mono text-sky-400 font-bold">{priorityCounts.MEDIUM} items</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full" style={{ width: `${getPercent(priorityCounts.MEDIUM)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                <span>Low</span>
                <span className="font-mono text-slate-400 font-bold">{priorityCounts.LOW} items</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-slate-600 h-full rounded-full" style={{ width: `${getPercent(priorityCounts.LOW)}%` }} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Complete Activity History Feed */}
      <Card className="glass-card p-6">
        <h2 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-indigo-400" />
          Audit & Activity History
        </h2>

        <div className="divide-y divide-slate-800/70">
          {metrics?.recentActivities && metrics.recentActivities.length > 0 ? (
            metrics.recentActivities.map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-200">{act.user?.name || 'User'}</span>
                  <span className="text-slate-400">{act.action}</span>
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-indigo-400">
                    {act.entityType}
                  </span>
                </div>
                <span className="font-mono text-slate-400 text-[11px]">
                  {new Date(act.createdAt).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">No audit activities recorded.</p>
          )}
        </div>
      </Card>
    </div>
  );
};
