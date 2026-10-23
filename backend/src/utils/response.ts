import { Response } from 'express';

export function sendSuccess<T = any>(
  res: Response,
  data: T,
  statusCode: number = 200,
  message?: string
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendError(
  res: Response,
  error: string,
  statusCode: number = 400,
  details?: any
) {
  return res.status(statusCode).json({
    success: false,
    error,
    details,
  });
}
