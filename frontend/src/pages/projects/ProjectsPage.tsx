import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Project, ProjectStatus } from '@/types';
import { useToast } from '@/features/toast/ToastContext';
import {
  FolderKanban,
  Plus,
  Search,
  Users,
  CheckSquare,
  FileText,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { EmptyState } from '@/components/ui/EmptyState';

export const ProjectsPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ProjectStatus>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: projectsData, isLoading, refetch } = useQuery<{
    success: boolean;
    data: Project[];
  }>({
    queryKey: ['projects', statusFilter],
    queryFn: () => {
      const url = statusFilter === 'ALL' ? '/projects' : `/projects?status=${statusFilter}`;
      return api.get(url);
    },
  });

  const projects = projectsData?.data || [];

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !key) return;

    try {
      setIsSubmitting(true);
      await api.post('/projects', {
        name,
        key: key.toUpperCase(),
        description,
      });
      setIsModalOpen(false);
      setName('');
      setKey('');
      setDescription('');
      refetch();
      success(`Project "${name}" created successfully!`, 'Project Created');
    } catch (err: any) {
      toastError(err.message || 'Error creating project', 'Creation Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete project "${name}"? This will delete all its tasks and notes.`)) {
      return;
    }
    try {
      await api.delete(`/projects/${id}`);
      refetch();
      success(`Project "${name}" was deleted.`, 'Project Deleted');
    } catch (err: any) {
      toastError(err.message || 'Failed to delete project', 'Deletion Failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Projects
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Organize workspaces, track deadlines, and collaborate with team members.
          </p>
        </div>
        <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
          New Project
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(['ALL', 'ACTIVE', 'ARCHIVED', 'COMPLETED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {status === 'ALL' ? 'All' : status[0] + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-slate-900/40 border border-slate-800/80 animate-pulse" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-7 w-7" />}
          title={searchTerm ? 'No matching projects found' : 'No projects created yet'}
          description={
            searchTerm
              ? 'Try modifying your search criteria or clearing filters.'
              : 'Create your first project to start creating tasks and technical notes.'
          }
          actionLabel="Create Project"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900/90 transition-all duration-200 flex flex-col justify-between p-5"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {project.key}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="role" role="OWNER">
                      {project.status}
                    </Badge>
                    <button
                      onClick={() => handleDelete(project.id, project.name)}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <Link to={`/projects/${project.id}`}>
                  <h3 className="text-base font-semibold text-slate-100 mt-3 group-hover:text-indigo-300 transition-colors">
                    {project.name}
                  </h3>
                </Link>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {project.description || 'No description provided.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckSquare className="h-3.5 w-3.5 text-indigo-400" />
                  {project._count?.tasks ?? 0} tasks
                </span>
                <span className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-emerald-400" />
                  {project._count?.notes ?? 0} notes
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-sky-400" />
                  {project._count?.memberships ?? 1} members
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Project"
        description="Fill in project details. Project key is used as prefix for task identifiers."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Project Name"
            placeholder="e.g., Cloud API Gateway"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!key) {
                setKey(
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
            label="Project Key (Max 10 chars, uppercase)"
            placeholder="e.g., API"
            value={key}
            onChange={(e) => setKey(e.target.value.toUpperCase())}
            maxLength={10}
            required
          />

          <Textarea
            label="Description"
            placeholder="High-level overview of objectives and architecture..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
