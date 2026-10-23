import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { validateBody } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  dueDate: z.string().optional().nullable(),
  projectId: z.string().uuid(),
  assigneeId: z.string().uuid().optional().nullable(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  dueDate: z.string().optional().nullable(),
  assigneeId: z.string().uuid().optional().nullable(),
});

const updateStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
});

const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment text cannot be empty'),
});

// Helper to check user membership in project
async function checkProjectAccess(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { memberships: true },
  });
  if (!project) return false;
  return (
    project.ownerId === userId ||
    project.memberships.some((m) => m.userId === userId)
  );
}

// List tasks with filters (projectId, status, priority, search)
router.get('/', async (req, res) => {
  try {
    const userId = req.user!.id;
    const { projectId, status, priority, search } = req.query;

    // Filter projects accessible to user
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
        return sendError(res, 'Access denied to this project', 403);
      }
      where.projectId = projectId;
    }

    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status;
    }

    if (priority && typeof priority === 'string' && priority !== 'ALL') {
      where.priority = priority;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, key: true } },
        creator: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { comments: true } },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    return sendSuccess(res, tasks);
  } catch (err: any) {
    console.error('List tasks error:', err);
    return sendError(res, err.message || 'Failed to list tasks', 500);
  }
});

// Create task
router.post('/', validateBody(createTaskSchema), async (req, res) => {
  try {
    const userId = req.user!.id;
    const { title, description, status, priority, dueDate, projectId, assigneeId } = req.body;

    const hasAccess = await checkProjectAccess(projectId, userId);
    if (!hasAccess) {
      return sendError(res, 'You do not have access to create tasks in this project', 403);
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        creatorId: userId,
        assigneeId: assigneeId || null,
      },
      include: {
        project: { select: { id: true, name: true, key: true } },
        creator: { select: { id: true, name: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'CREATED_TASK',
        entityType: 'TASK',
        entityId: task.id,
        projectId,
        userId,
        details: JSON.stringify({ title: task.title, status: task.status }),
      },
    });

    return sendSuccess(res, task, 201, 'Task created successfully');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to create task', 500);
  }
});

// Update task status (used by Kanban drag-and-drop)
router.patch('/:id/status', validateBody(updateStatusSchema), async (req, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { status } = req.body;

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) return sendError(res, 'Task not found', 404);

    const hasAccess = await checkProjectAccess(task.projectId, userId);
    if (!hasAccess) return sendError(res, 'Access denied', 403);

    const updated = await prisma.task.update({
      where: { id },
      data: { status },
      include: {
        project: { select: { id: true, name: true, key: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'STATUS_CHANGED',
        entityType: 'TASK',
        entityId: task.id,
        projectId: task.projectId,
        userId,
        details: JSON.stringify({ oldStatus: task.status, newStatus: status }),
      },
    });

    return sendSuccess(res, updated, 200, 'Status updated');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to update status', 500);
  }
});

// Update task details
router.patch('/:id', validateBody(updateTaskSchema), async (req, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return sendError(res, 'Task not found', 404);

    const hasAccess = await checkProjectAccess(task.projectId, userId);
    if (!hasAccess) return sendError(res, 'Access denied', 403);

    const updateData: any = { ...req.body };
    if (updateData.dueDate !== undefined) {
      updateData.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null;
    }

    const updated = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    return sendSuccess(res, updated, 200, 'Task updated');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to update task', 500);
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return sendError(res, 'Task not found', 404);

    const hasAccess = await checkProjectAccess(task.projectId, userId);
    if (!hasAccess) return sendError(res, 'Access denied', 403);

    await prisma.task.delete({ where: { id } });

    return sendSuccess(res, null, 200, 'Task deleted');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to delete task', 500);
  }
});

// Add comment to task
router.post('/:id/comments', validateBody(createCommentSchema), async (req, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { content } = req.body;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return sendError(res, 'Task not found', 404);

    const hasAccess = await checkProjectAccess(task.projectId, userId);
    if (!hasAccess) return sendError(res, 'Access denied', 403);

    const comment = await prisma.comment.create({
      data: {
        content,
        taskId: id,
        authorId: userId,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    return sendSuccess(res, comment, 201, 'Comment added');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to add comment', 500);
  }
});

export const taskRoutes = router;
