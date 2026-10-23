import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { validateBody } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  key: z
    .string()
    .min(2, 'Project key must be at least 2 characters')
    .max(10, 'Project key max 10 characters')
    .regex(/^[A-Z0-9]+$/, 'Project key must be uppercase alphanumeric'),
  description: z.string().optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED', 'COMPLETED']).optional(),
});

const addMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
});

// List projects accessible to current user
router.get('/', async (req, res) => {
  try {
    const userId = req.user!.id;
    const { status, limit } = req.query;

    const whereClause: any = {
      OR: [
        { ownerId: userId },
        { memberships: { some: { userId } } },
      ],
    };

    if (status && typeof status === 'string' && status !== 'ALL') {
      whereClause.status = status;
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: {
            tasks: true,
            notes: true,
            memberships: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit ? parseInt(String(limit), 10) : undefined,
    });

    return sendSuccess(res, projects);
  } catch (err: any) {
    console.error('List projects error:', err);
    return sendError(res, err.message || 'Failed to list projects', 500);
  }
});

// Create new project
router.post('/', validateBody(createProjectSchema), async (req, res) => {
  try {
    const userId = req.user!.id;
    const { name, key, description } = req.body;

    const existingKey = await prisma.project.findUnique({
      where: { key: key.toUpperCase() },
    });

    if (existingKey) {
      return sendError(res, `Project key "${key}" is already in use. Please pick another.`, 409);
    }

    const project = await prisma.$transaction(async (tx) => {
      const proj = await tx.project.create({
        data: {
          name,
          key: key.toUpperCase(),
          description,
          ownerId: userId,
          status: 'ACTIVE',
        },
      });

      // Automatically add creator as OWNER member
      await tx.projectMembership.create({
        data: {
          projectId: proj.id,
          userId,
          role: 'OWNER',
        },
      });

      // Log activity
      await tx.activityLog.create({
        data: {
          action: 'CREATED_PROJECT',
          entityType: 'PROJECT',
          entityId: proj.id,
          projectId: proj.id,
          userId,
          details: JSON.stringify({ name: proj.name, key: proj.key }),
        },
      });

      return proj;
    });

    return sendSuccess(res, project, 201, 'Project created successfully');
  } catch (err: any) {
    console.error('Create project error:', err);
    return sendError(res, err.message || 'Failed to create project', 500);
  }
});

// Get single project details (with BOLA authorization check)
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        memberships: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        _count: {
          select: { tasks: true, notes: true, memberships: true },
        },
      },
    });

    if (!project) {
      return sendError(res, 'Project not found', 404);
    }

    // Verify user is owner or member
    const isMember =
      project.ownerId === userId ||
      project.memberships.some((m) => m.userId === userId);

    if (!isMember) {
      return sendError(res, 'You do not have permission to view this project', 403);
    }

    return sendSuccess(res, project);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to fetch project', 500);
  }
});

// Update project
router.patch('/:id', validateBody(updateProjectSchema), async (req, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: { memberships: true },
    });

    if (!project) {
      return sendError(res, 'Project not found', 404);
    }

    const membership = project.memberships.find((m) => m.userId === userId);
    const hasAdminAccess = project.ownerId === userId || membership?.role === 'ADMIN' || membership?.role === 'OWNER';

    if (!hasAdminAccess) {
      return sendError(res, 'Only project owners and admins can update project settings', 403);
    }

    const updated = await prisma.project.update({
      where: { id },
      data: req.body,
    });

    await prisma.activityLog.create({
      data: {
        action: 'UPDATED_PROJECT',
        entityType: 'PROJECT',
        entityId: id,
        projectId: id,
        userId,
        details: JSON.stringify(req.body),
      },
    });

    return sendSuccess(res, updated, 200, 'Project updated successfully');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to update project', 500);
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return sendError(res, 'Project not found', 404);
    }

    if (project.ownerId !== userId) {
      return sendError(res, 'Only the project owner can delete this project', 403);
    }

    await prisma.project.delete({ where: { id } });

    return sendSuccess(res, null, 200, 'Project deleted successfully');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to delete project', 500);
  }
});

// Add member to project
router.post('/:id/members', validateBody(addMemberSchema), async (req, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { email, role } = req.body;

    const project = await prisma.project.findUnique({
      where: { id },
      include: { memberships: true },
    });

    if (!project) return sendError(res, 'Project not found', 404);

    const membership = project.memberships.find((m) => m.userId === userId);
    if (project.ownerId !== userId && membership?.role !== 'ADMIN' && membership?.role !== 'OWNER') {
      return sendError(res, 'You do not have permission to invite members', 403);
    }

    const invitedUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!invitedUser) {
      return sendError(res, `No registered DevFlow account with email "${email}".`, 404);
    }

    const existingMember = await prisma.projectMembership.findUnique({
      where: {
        projectId_userId: {
          projectId: id,
          userId: invitedUser.id,
        },
      },
    });

    if (existingMember) {
      return sendError(res, 'User is already a member of this project', 409);
    }

    const newMember = await prisma.projectMembership.create({
      data: {
        projectId: id,
        userId: invitedUser.id,
        role,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return sendSuccess(res, newMember, 201, 'Member added successfully');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to add member', 500);
  }
});

export const projectRoutes = router;
