import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface TokenPayload {
  userId: string;
  email: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}
