export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ProjectRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type ProjectStatus = 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface ProjectMembership {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  user: User;
  joinedAt: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string | null;
  status: ProjectStatus;
  ownerId: string;
  owner?: User;
  memberships?: ProjectMembership[];
  _count?: {
    tasks: number;
    notes: number;
    memberships: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  author: User;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  order: number;
  projectId: string;
  creatorId: string;
  assigneeId?: string | null;
  project?: {
    id: string;
    name: string;
    key: string;
  };
  creator?: User;
  assignee?: User | null;
  comments?: TaskComment[];
  _count?: {
    comments: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProjectNote {
  id: string;
  title: string;
  content: string;
  projectId: string;
  authorId: string;
  author?: User;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, any> | null;
  userId: string;
  user?: User;
  projectId?: string | null;
  createdAt: string;
}

export interface DashboardMetrics {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  tasksByStatus: {
    TODO: number;
    IN_PROGRESS: number;
    IN_REVIEW: number;
    DONE: number;
  };
  tasksByPriority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  recentActivities: ActivityLog[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}
