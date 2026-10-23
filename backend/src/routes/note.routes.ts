import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { validateBody } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  projectId: z.string().uuid(),
});

const updateNoteSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
});

// List notes accessible to user
router.get('/', async (req, res) => {
  try {
    const userId = req.user!.id;
    const { projectId, search } = req.query;

    const accessibleProjects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { memberships: { some: { userId } } },
        ],
      },
      select: { id: true },
    });

    const accessibleProjectIds = accessibleProjects.map((p) => p.id);

    const where: any = {
      projectId: { in: accessibleProjectIds },
    };

    if (projectId && typeof projectId === 'string') {
      if (!accessibleProjectIds.includes(projectId)) {
        return sendError(res, 'Access denied', 403);
      }
      where.projectId = projectId;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const notes = await prisma.projectNote.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true, key: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return sendSuccess(res, notes);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to list notes', 500);
  }
});

// Create note
router.post('/', validateBody(createNoteSchema), async (req, res) => {
  try {
    const userId = req.user!.id;
    const { title, content, projectId } = req.body;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { memberships: true },
    });

    if (!project) return sendError(res, 'Project not found', 404);

    const hasAccess =
      project.ownerId === userId ||
      project.memberships.some((m) => m.userId === userId);

    if (!hasAccess) return sendError(res, 'Access denied', 403);

    const note = await prisma.projectNote.create({
      data: {
        title,
        content,
        projectId,
        authorId: userId,
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'CREATED_NOTE',
        entityType: 'NOTE',
        entityId: note.id,
        projectId,
        userId,
        details: JSON.stringify({ title: note.title }),
      },
    });

    return sendSuccess(res, note, 201, 'Note saved');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to create note', 500);
  }
});

// Update note
router.put('/:id', validateBody(updateNoteSchema), async (req, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const note = await prisma.projectNote.findUnique({
      where: { id },
      include: { project: { include: { memberships: true } } },
    });

    if (!note) return sendError(res, 'Note not found', 404);

    const hasAccess =
      note.project.ownerId === userId ||
      note.project.memberships.some((m) => m.userId === userId);

    if (!hasAccess) return sendError(res, 'Access denied', 403);

    const updated = await prisma.projectNote.update({
      where: { id },
      data: req.body,
    });

    return sendSuccess(res, updated, 200, 'Note updated');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to update note', 500);
  }
});

// Delete note
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const note = await prisma.projectNote.findUnique({
      where: { id },
      include: { project: { include: { memberships: true } } },
    });

    if (!note) return sendError(res, 'Note not found', 404);

    const hasAccess =
      note.authorId === userId ||
      note.project.ownerId === userId;

    if (!hasAccess) return sendError(res, 'Access denied', 403);

    await prisma.projectNote.delete({ where: { id } });

    return sendSuccess(res, null, 200, 'Note deleted');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to delete note', 500);
  }
});

export const noteRoutes = router;
