import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { validateBody } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { env } from '../config/env.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email address is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

// Set secure cookie options
const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

// Register
router.post('/register', validateBody(registerSchema), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return sendError(res, 'An account with this email address already exists.', 409);
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    const token = signToken({ userId: user.id, email: user.email });

    // Set cookie
    res.cookie('auth_token', token, getCookieOptions());

    // Log Activity
    try {
      await prisma.activityLog.create({
        data: {
          action: 'REGISTERED_ACCOUNT',
          entityType: 'USER',
          entityId: user.id,
          userId: user.id,
        },
      });
    } catch (ignore) {}

    return sendSuccess(res, { user, token }, 201, 'Registration successful');
  } catch (err: any) {
    console.error('Registration error:', err);
    return sendError(res, err.message || 'Registration failed', 500);
  }
});

// Login
router.post('/login', validateBody(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    const token = signToken({ userId: user.id, email: user.email });

    res.cookie('auth_token', token, getCookieOptions());

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };

    return sendSuccess(res, { user: safeUser, token }, 200, 'Login successful');
  } catch (err: any) {
    console.error('Login error:', err);
    return sendError(res, err.message || 'Login failed', 500);
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('auth_token', getCookieOptions());
  return sendSuccess(res, null, 200, 'Logged out successfully');
});

// Current User Profile
router.get('/me', requireAuth, async (req, res) => {
  return sendSuccess(res, req.user);
});

export const authRoutes = router;
