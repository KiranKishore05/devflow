import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Task, TaskStatus, TaskPriority, Project, TaskComment } from '@/types';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  MessageSquare,
  Clock,
  CheckCircle2,
  MoreHorizontal,
  Trash2,
  Send,
  User as UserIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';

const COLUMNS: { id: TaskStatus; label: string; accentColor: string }[] = [
  { id: 'TODO', label: 'To Do', accentColor: 'border-slate-700' },
  { id: 'IN_PROGRESS', label: 'In Progress', accentColor: 'border-blue-500/40' },
  { id: 'IN_REVIEW', label: 'In Review', accentColor: 'border-amber-500/40' },
  { id: 'DONE', label: 'Done', accentColor: 'border-emerald-500/40' },
];

export const KanbanBoardPage: React.FC = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | TaskPriority>('ALL');

  // Task creation modal state
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('TODO');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('MEDIUM');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskProjectId, setNewTaskProjectId] = useState('');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // Task details / comments modal state
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  // Fetch projects list for filter & task creation
  const { data: projectsData } = useQuery<{ success: boolean; data: Project[] }>({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects'),
  });

  const projects = projectsData?.data || [];

  // Fetch tasks
  const { data: tasksData, refetch: refetchTasks } = useQuery<{ success: boolean; data: Task[] }>({
    queryKey: ['tasks', selectedProjectId, priorityFilter],
    queryFn: () => {
      let url = '/tasks?';
      if (selectedProjectId !== 'ALL') url += `projectId=${selectedProjectId}&`;
      if (priorityFilter !== 'ALL') url += `priority=${priorityFilter}&`;
      return api.get(url);
    },
  });

  const tasks = tasksData?.data || [];

  const filteredTasks = tasks.filter((t) => {
    return (
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Handle Drag & Drop
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      refetchTasks();
    } catch (err: any) {
      alert(err.message || 'Failed to update task status');
    }
  };

  const handleQuickStatusChange = async (taskId: string, newStatus: TaskStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      refetchTasks();
      if (activeTask && activeTask.id === taskId) {
        setActiveTask({ ...activeTask, status: newStatus });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update task status');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const projId = newTaskProjectId || (projects.length > 0 ? projects[0].id : '');
    if (!projId) {
      alert('Please create a project first before adding tasks.');
      return;
    }
    if (!newTaskTitle) return;

    try {
      setIsSubmittingTask(true);
      await api.post('/tasks', {
        title: newTaskTitle,
        description: newTaskDesc,
        status: newTaskStatus,
        priority: newTaskPriority,
        dueDate: newTaskDueDate || undefined,
        projectId: projId,
      });

      setIsNewTaskModalOpen(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskDueDate('');
      refetchTasks();
    } catch (err: any) {
      alert(err.message || 'Error creating task');
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleDeleteTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      if (activeTask?.id === id) setActiveTask(null);
      refetchTasks();
    } catch (err: any) {
      alert(err.message || 'Failed to delete task');
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask || !commentContent.trim()) return;

    try {
      setIsPostingComment(true);
      const res = await api.post<{ success: boolean; data: TaskComment }>(
        `/tasks/${activeTask.id}/comments`,
        { content: commentContent }
      );
      setCommentContent('');
      // update active task comments
      setActiveTask({
        ...activeTask,
        comments: [...(activeTask.comments || []), res.data],
      });
      refetchTasks();
    } catch (err: any) {
      alert(err.message || 'Failed to post comment');
    } finally {
      setIsPostingComment(false);
    }
  };

  const isOverdue = (dateStr?: string | null) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Kanban Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Kanban Board</h1>
          <p className="text-sm text-slate-400 mt-1">
            Drag cards between columns or click a task to view comments and progress.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => {
            setNewTaskStatus('TODO');
            if (projects.length > 0 && !newTaskProjectId) {
              setNewTaskProjectId(selectedProjectId !== 'ALL' ? selectedProjectId : projects[0].id);
            }
            setIsNewTaskModalOpen(true);
          }}
        >
          Add Task
        </Button>
      </div>

      {/* Filters and Project Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          {/* Project filter */}
          <div className="w-48">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.key} - {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-1">
            {(['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  priorityFilter === p
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {p === 'ALL' ? 'All Priorities' : p}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* 4 Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {COLUMNS.map((column) => {
          const colTasks = filteredTasks.filter((t) => t.status === column.id);

          return (
            <div
              key={column.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
              className={`flex flex-col rounded-2xl bg-slate-900/40 border ${column.accentColor} min-h-[500px] p-3 transition-colors`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 px-1 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                    {column.label}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setNewTaskStatus(column.id);
                    if (projects.length > 0 && !newTaskProjectId) {
                      setNewTaskProjectId(selectedProjectId !== 'ALL' ? selectedProjectId : projects[0].id);
                    }
                    setIsNewTaskModalOpen(true);
                  }}
                  className="p-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                  title={`Add task to ${column.label}`}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Task Cards List */}
              <div className="flex-1 space-y-3 pt-3 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Drop items here
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const overdue = isOverdue(task.dueDate) && task.status !== 'DONE';

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => setActiveTask(task)}
                        className="group relative rounded-xl bg-slate-900/90 border border-slate-800 p-4 shadow-sm hover:border-indigo-500/40 hover:bg-slate-800/90 transition-all duration-150 cursor-grab active:cursor-grabbing"
                      >
                        {/* Top: Project Key & Priority Badge */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                            {task.project?.key || 'DF'}
                          </span>
                          <Badge variant="priority" priority={task.priority} />
                        </div>

                        {/* Title */}
                        <h4 className="text-sm font-semibold text-slate-200 mt-2.5 leading-snug group-hover:text-indigo-300 transition-colors">
                          {task.title}
                        </h4>

                        {/* Description snippet */}
                        {task.description && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Footer: Due date, comments, quick status switcher */}
                        <div className="mt-4 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                          <div className="flex items-center gap-3">
                            {task.dueDate && (
                              <span
                                className={`flex items-center gap-1 font-mono ${
                                  overdue ? 'text-rose-400 font-semibold' : 'text-slate-400'
                                }`}
                                title={overdue ? 'Overdue Deadline!' : 'Due Date'}
                              >
                                <Calendar className="h-3 w-3" />
                                {new Date(task.dueDate).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            )}

                            <span className="flex items-center gap-1 text-slate-400">
                              <MessageSquare className="h-3 w-3" />
                              {task._count?.comments ?? task.comments?.length ?? 0}
                            </span>
                          </div>

                          {/* Quick transition selector */}
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            {COLUMNS.filter((c) => c.id !== task.status).map((col) => (
                              <button
                                key={col.id}
                                onClick={(e) => handleQuickStatusChange(task.id, col.id, e)}
                                title={`Move to ${col.label}`}
                                className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 hover:bg-indigo-600 hover:text-white transition-colors"
                              >
                                {col.label[0]}
                              </button>
                            ))}
                            <button
                              onClick={(e) => handleDeleteTask(task.id, e)}
                              className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors"
                              title="Delete task"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        title="Create New Task"
        description="Add a task or bug report with priority, due date, and assign it to a project."
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Select
            label="Project"
            value={newTaskProjectId}
            onChange={(e) => setNewTaskProjectId(e.target.value)}
            required
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.key} - {p.name}
              </option>
            ))}
          </Select>

          <Input
            label="Task Title"
            placeholder="e.g., Implement OAuth callback handler"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            required
          />

          <Textarea
            label="Description"
            placeholder="Steps to reproduce, technical specs, or acceptance criteria..."
            value={newTaskDesc}
            onChange={(e) => setNewTaskDesc(e.target.value)}
            rows={3}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Status"
              value={newTaskStatus}
              onChange={(e) => setNewTaskStatus(e.target.value as TaskStatus)}
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="DONE">Done</option>
            </Select>

            <Select
              label="Priority"
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </Select>

            <Input
              label="Due Date"
              type="date"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsNewTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingTask}>
              Create Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Task Detail & Comments Modal */}
      {activeTask && (
        <Modal
          isOpen={!!activeTask}
          onClose={() => setActiveTask(null)}
          title={activeTask.title}
          description={`Project: ${activeTask.project?.name || 'DevFlow'}`}
          maxWidth="lg"
        >
          <div className="space-y-5">
            {/* Badges and metadata bar */}
            <div className="flex flex-wrap items-center gap-3 pb-3 border-b border-slate-800">
              <Badge variant="status" status={activeTask.status} />
              <Badge variant="priority" priority={activeTask.priority} />
              {activeTask.dueDate && (
                <span className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Calendar className="h-3.5 w-3.5" />
                  Due: {new Date(activeTask.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono mb-1.5">
                Description
              </h5>
              <p className="text-sm text-slate-200 whitespace-pre-wrap bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                {activeTask.description || 'No description provided.'}
              </p>
            </div>

            {/* Comments Thread */}
            <div>
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono mb-2 flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
                Comments & Discussion ({activeTask.comments?.length || 0})
              </h5>

              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {activeTask.comments && activeTask.comments.length > 0 ? (
                  activeTask.comments.map((comment) => (
                    <div key={comment.id} className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-indigo-300">
                          {comment.author?.name || 'Collaborator'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-2">No comments yet on this task.</p>
                )}
              </div>

              {/* Add Comment input */}
              <form onSubmit={handlePostComment} className="mt-3 flex gap-2">
                <Input
                  placeholder="Write a technical note or progress update..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="text-xs"
                />
                <Button type="submit" size="sm" variant="primary" isLoading={isPostingComment} icon={<Send className="h-3.5 w-3.5" />}>
                  Post
                </Button>
              </form>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
