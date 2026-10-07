import { Request, Response, NextFunction } from 'express';
import pino from 'pino';

const logger = pino({ name: 'error-handler' });

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Global Express error handler.
 * Must be registered as the LAST middleware in index.ts (4-argument signature).
 * Catches all errors forwarded via next(err) and formats them into a consistent
 * JSON response so the client never receives a raw HTML stack trace.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode ?? 500;
  const code = err.code ?? 'INTERNAL_SERVER_ERROR';

  logger.error({ err, statusCode, code }, err.message);

  res.status(statusCode).json({
    error: err.message ?? 'An unexpected error occurred',
    code,
  });
};
