import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Project, Task, ProjectNote, TaskStatus, TaskPriority, ProjectRole } from '@/types';
import {
  ArrowLeft,
  Columns3,
  ListTodo,
  FileCode2,
  Users,
  Plus,
  Calendar,
  Trash2,
  MessageSquare,
  Shield,
  UserPlus,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [activeTab, setActiveTab] = useState<'KANBAN' | 'TASKS' | 'NOTES' | 'MEMBERS'>('KANBAN');

  // New task modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('TODO');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('MEDIUM');
  const [taskDueDate, setTaskDueDate] = useState('');

  // New note modal
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // Add member modal
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState<ProjectRole>('MEMBER');

  // Query Project
  const { data: projectData, refetch: refetchProject } = useQuery<{ success: boolean; data: Project }>({
    queryKey: ['project', projectId],
    queryFn: () => api.get(`/projects/${projectId}`),
    enabled: !!projectId,
  });

  // Query Tasks
  const { data: tasksData, refetch: refetchTasks } = useQuery<{ success: boolean; data: Task[] }>({
    queryKey: ['project-tasks', projectId],
    queryFn: () => api.get(`/tasks?projectId=${projectId}`),
    enabled: !!projectId,
  });

  // Query Notes
  const { data: notesData, refetch: refetchNotes } = useQuery<{ success: boolean; data: ProjectNote[] }>({
    queryKey: ['project-notes', projectId],
    queryFn: () => api.get(`/notes?projectId=${projectId}`),
    enabled: !!projectId,
  });

  const project = projectData?.data;
  const tasks = tasksData?.data || [];
  const notes = notesData?.data || [];

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !projectId) return;
    try {
      await api.post('/tasks', {
        title: taskTitle,
        description: taskDesc,
        status: taskStatus,
        priority: taskPriority,
        dueDate: taskDueDate || undefined,
        projectId,
      });
      setIsTaskModalOpen(false);
      setTaskTitle('');
      setTaskDesc('');
      setTaskDueDate('');
      refetchTasks();
      refetchProject();
    } catch (err: any) {
      alert(err.message || 'Error creating task');
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle || !projectId) return;
    try {
      await api.post('/notes', {
        title: noteTitle,
        content: noteContent,
        projectId,
      });
      setIsNoteModalOpen(false);
      setNoteTitle('');
      setNoteContent('');
      refetchNotes();
      refetchProject();
    } catch (err: any) {
      alert(err.message || 'Error creating note');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberEmail || !projectId) return;
    try {
      await api.post(`/projects/${projectId}/members`, {
        email: memberEmail,
        role: memberRole,
      });
      setIsMemberModalOpen(false);
      setMemberEmail('');
      refetchProject();
    } catch (err: any) {
      alert(err.message || 'Error adding project member');
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      refetchTasks();
    } catch (err: any) {
      alert(err.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      refetchTasks();
      refetchProject();
    } catch (err: any) {
      alert(err.message || 'Failed to delete task');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Delete this note?')) return;
    try {
      await api.delete(`/notes/${noteId}`);
      refetchNotes();
      refetchProject();
    } catch (err: any) {
      alert(err.message || 'Failed to delete note');
    }
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        Loading project details...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 mb-2 transition-colors font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Projects
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {project.key}
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white">{project.name}</h1>
            <Badge variant="role" role="OWNER">
              {project.status}
            </Badge>
          </div>
          {project.description && (
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">{project.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setIsNoteModalOpen(true)}>
            Add Note
          </Button>
          <Button variant="primary" size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setIsTaskModalOpen(true)}>
            New Task
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-px">
        <button
          onClick={() => setActiveTab('KANBAN')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'KANBAN'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Columns3 className="h-3.5 w-3.5" /> Kanban Board ({tasks.length})
        </button>

        <button
          onClick={() => setActiveTab('TASKS')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'TASKS'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ListTodo className="h-3.5 w-3.5" /> Tasks List
        </button>

        <button
          onClick={() => setActiveTab('NOTES')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'NOTES'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode2 className="h-3.5 w-3.5" /> Tech Notes ({notes.length})
        </button>

        <button
          onClick={() => setActiveTab('MEMBERS')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'MEMBERS'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="h-3.5 w-3.5" /> Team ({project.memberships?.length || 1})
        </button>
      </div>

      {/* Tab 1: Kanban Board */}
      {activeTab === 'KANBAN' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as TaskStatus[]).map((col) => {
            const colTasks = tasks.filter((t) => t.status === col);
            return (
              <div key={col} className="rounded-xl bg-slate-900/40 border border-slate-800 p-3 min-h-[400px]">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono font-bold text-slate-300">
                  <span>{col.replace('_', ' ')}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px]">{colTasks.length}</span>
                </div>
                <div className="mt-3 space-y-2.5">
                  {colTasks.map((t) => (
                    <div key={t.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 shadow-sm">
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <Badge variant="priority" priority={t.priority} />
                        <button
                          onClick={() => handleDeleteTask(t.id)}
                          className="text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-200">{t.title}</h4>
                      {t.description && <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{t.description}</p>}
                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                        {t.dueDate && (
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="h-2.5 w-2.5" />
                            {new Date(t.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        <select
                          value={t.status}
                          onChange={(e) => handleTaskStatusChange(t.id, e.target.value as TaskStatus)}
                          className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[9px] text-slate-300"
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="IN_REVIEW">In Review</option>
                          <option value="DONE">Done</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Tasks List Table */}
      {activeTab === 'TASKS' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Task Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No tasks found in this project.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      <div>{task.title}</div>
                      {task.description && (
                        <div className="text-[11px] text-slate-400 truncate max-w-md">{task.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="status" status={task.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="priority" priority={task.priority} />
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Tech Notes */}
      {activeTab === 'NOTES' && (
        <div className="space-y-4">
          {notes.length === 0 ? (
            <EmptyState
              icon={<FileCode2 className="h-6 w-6" />}
              title="No Technical Notes"
              description="Store architecture decisions, API specs, database schemas, or deployment runbooks."
              actionLabel="Add First Note"
              onAction={() => setIsNoteModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notes.map((note) => (
                <div key={note.id} className="rounded-xl bg-slate-900 border border-slate-800 p-4 relative group">
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm font-semibold text-slate-100">{note.title}</h3>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <pre className="mt-3 text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-lg border border-slate-800/80 overflow-x-auto whitespace-pre-wrap">
                    {note.content}
                  </pre>
                  <p className="mt-2 text-[10px] text-slate-400 font-mono">
                    Updated {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Members & Roles */}
      {activeTab === 'MEMBERS' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-200">Team Collaborators</h3>
            <Button size="sm" variant="secondary" icon={<UserPlus className="h-3.5 w-3.5" />} onClick={() => setIsMemberModalOpen(true)}>
              Invite Member
            </Button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 divide-y divide-slate-800">
            {project.memberships?.map((m) => (
              <div key={m.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    {m.user?.name ? m.user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-100">{m.user?.name || 'User'}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{m.user?.email}</p>
                  </div>
                </div>
                <Badge variant="role" role={m.role}>
                  {m.role}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Create Task in this Project">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input label="Task Title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required />
          <Textarea label="Description" value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} rows={3} />
          <div className="grid grid-cols-3 gap-3">
            <Select label="Status" value={taskStatus} onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="DONE">Done</option>
            </Select>
            <Select label="Priority" value={taskPriority} onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </Select>
            <Input label="Due Date" type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsTaskModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Task</Button>
          </div>
        </form>
      </Modal>

      {/* Create Note Modal */}
      <Modal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} title="Add Technical Note">
        <form onSubmit={handleCreateNote} className="space-y-4">
          <Input label="Note Title" placeholder="e.g., API Architecture & Schema" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} required />
          <Textarea label="Content (Markdown supported)" placeholder="Write technical notes, endpoints, curl commands, design docs..." value={noteContent} onChange={(e) => setNoteContent(e.target.value)} rows={6} required />
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsNoteModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Note</Button>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} title="Invite Project Member">
        <form onSubmit={handleAddMember} className="space-y-4">
          <Input label="User Email" type="email" placeholder="colleague@company.com" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} required />
          <Select label="Role" value={memberRole} onChange={(e) => setMemberRole(e.target.value as ProjectRole)}>
            <option value="MEMBER">Member (Create & Edit Tasks)</option>
            <option value="ADMIN">Admin (Manage Tasks & Members)</option>
          </Select>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsMemberModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Add Member</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
