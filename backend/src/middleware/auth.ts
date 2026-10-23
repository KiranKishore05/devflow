import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { prisma } from '../utils/prisma.js';
import { sendError } from '../utils/response.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies?.auth_token) {
      token = req.cookies.auth_token;
    }

    if (!token) {
      return sendError(res, 'Authentication required. Please log in.', 401);
    }

    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return sendError(res, 'Invalid or expired authentication session.', 401);
    }

    // Try finding user in database
    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, name: true, avatarUrl: true },
      });

      if (!user) {
        return sendError(res, 'User account no longer exists.', 401);
      }

      req.user = user;
      return next();
    } catch (dbErr) {
      // In case database is temporarily disconnected but token is valid
      req.user = {
        id: payload.userId,
        email: payload.email,
        name: payload.email.split('@')[0],
      };
      return next();
    }
  } catch (err: any) {
    return sendError(res, 'Authentication failed', 401, err.message);
  }
};
