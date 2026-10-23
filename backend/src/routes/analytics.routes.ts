import { Router } from 'express';
import { prisma } from '../utils/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user!.id;

    // Find all projects accessible to the user
    const accessibleProjects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { memberships: { some: { userId } } },
        ],
      },
      select: { id: true },
    });

    const projectIds = accessibleProjects.map((p) => p.id);
    const totalProjects = projectIds.length;

    // Get all tasks across these projects
    const tasks = await prisma.task.findMany({
      where: {
        projectId: { in: projectIds },
      },
      select: {
        id: true,
        status: true,
        priority: true,
        dueDate: true,
      },
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'DONE').length;
    const pendingTasks = totalTasks - completedTasks;

    const now = new Date();
    const overdueTasks = tasks.filter(
      (t) => t.status !== 'DONE' && t.dueDate && new Date(t.dueDate) < now
    ).length;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const tasksByStatus = {
      TODO: tasks.filter((t) => t.status === 'TODO').length,
      IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      IN_REVIEW: tasks.filter((t) => t.status === 'IN_REVIEW').length,
      DONE: completedTasks,
    };

    const tasksByPriority = {
      LOW: tasks.filter((t) => t.priority === 'LOW').length,
      MEDIUM: tasks.filter((t) => t.priority === 'MEDIUM').length,
      HIGH: tasks.filter((t) => t.priority === 'HIGH').length,
      CRITICAL: tasks.filter((t) => t.priority === 'CRITICAL').length,
    };

    // Get recent activity logs for user's projects or user's actions
    const recentActivities = await prisma.activityLog.findMany({
      where: {
        OR: [
          { projectId: { in: projectIds } },
          { userId },
        ],
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return sendSuccess(res, {
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      completionRate,
      tasksByStatus,
      tasksByPriority,
      recentActivities,
    });
  } catch (err: any) {
    console.error('Analytics computation error:', err);
    return sendError(res, err.message || 'Failed to compute analytics', 500);
  }
});

export const analyticsRoutes = router;
