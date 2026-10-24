import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ProjectNote, Project } from '@/types';
import { FileCode2, Plus, Search, Trash2, Edit3, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/features/toast/ToastContext';

export const NotesPage: React.FC = () => {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<ProjectNote | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [projectId, setProjectId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Projects list
  const { data: projectsData } = useQuery<{ success: boolean; data: Project[] }>({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects'),
  });

  const projects = projectsData?.data || [];

  // Notes list
  const { data: notesData, refetch } = useQuery<{ success: boolean; data: ProjectNote[] }>({
    queryKey: ['notes', selectedProjectId],
    queryFn: () => {
      const url = selectedProjectId === 'ALL' ? '/notes' : `/notes?projectId=${selectedProjectId}`;
      return api.get(url);
    },
  });

  const notes = notesData?.data || [];

  const filteredNotes = notes.filter((n) => {
    return (
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleOpenCreate = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setProjectId(selectedProjectId !== 'ALL' ? selectedProjectId : projects[0]?.id || '');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (note: ProjectNote) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setProjectId(note.projectId);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !projectId) return;

    try {
      setIsSubmitting(true);
      if (editingNote) {
        await api.put(`/notes/${editingNote.id}`, { title, content });
        toast.success('Technical note updated');
      } else {
        await api.post('/notes', { title, content, projectId });
        toast.success('Technical note saved');
      }
      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this technical note?')) return;
    try {
      await api.delete(`/notes/${id}`);
      refetch();
      toast.success('Technical note deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete note');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Technical Notes & Runbooks
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Store architecture specs, API guidelines, troubleshooting steps, and design records.
          </p>
        </div>
        <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={handleOpenCreate}>
          New Note
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes content or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="w-full sm:w-64">
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
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <EmptyState
          icon={<FileCode2 className="h-7 w-7" />}
          title={search ? 'No matching notes found' : 'No technical notes recorded'}
          description="Document architecture decisions, API payloads, or setup guides for your team."
          actionLabel="Create First Note"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="group rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 p-5 flex flex-col justify-between transition-all duration-200 shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
                    {note.title}
                  </h3>
                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(note)}
                      className="p-1 rounded text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                      title="Edit note"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <pre className="mt-3 text-xs text-slate-300 font-mono bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </pre>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="h-3 w-3" />
                  {new Date(note.updatedAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span className="text-indigo-400 font-medium">
                  {note.author?.name || 'Author'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Note Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingNote ? 'Edit Technical Note' : 'Create Technical Note'}
        description="Write Markdown-friendly technical documentation associated with a project."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingNote && (
            <Select
              label="Associated Project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.key} - {p.name}
                </option>
              ))}
            </Select>
          )}

          <Input
            label="Note Title"
            placeholder="e.g., PostgreSQL Cluster Replication & Failover Specs"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Textarea
            label="Content (Markdown)"
            placeholder="Write architecture notes, diagrams, code snippets, or configuration parameters..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingNote ? 'Update Note' : 'Save Note'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
