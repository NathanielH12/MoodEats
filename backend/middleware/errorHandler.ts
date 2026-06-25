import type { Request, Response, NextFunction } from 'express';

/**
 * GLOBAL ERROR HANDLER — The safety net for your entire app.
 *
 * How Express error handling works:
 * - Normal middleware: (req, res, next) — 3 params
 * - Error middleware:  (err, req, res, next) — 4 params ← THIS
 *
 * Express knows this is an error handler because it has FOUR parameters.
 * It MUST be the LAST middleware registered (after all routes).
 *
 * When does it trigger?
 * 1. Any middleware/route calls next(error)
 * 2. Any async route throws an unhandled error
 * 3. Express encounters a malformed request (e.g., invalid JSON)
 *
 * What it does:
 * - Logs the full error (for YOU to debug in server logs)
 * - Sends a GENERIC message to the client (no stack traces leaked!)
 * - Returns appropriate status codes
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the full error for debugging (visible in your server logs / hosting dashboard)
  console.error('─── Unhandled Error ───');
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.error(err.stack || err);
  console.error('───────────────────────');

  // Handle specific known error types
  if (err.type === 'entity.too.large') {
    // Triggered by express.json({ limit: '10kb' }) when body exceeds limit
    return res.status(413).json({
      error: 'Request body too large — maximum 10KB allowed.',
    });
  }

  if (err.status === 400 && err.type === 'entity.parse.failed') {
    // Triggered when the body is not valid JSON (syntax error)
    return res.status(400).json({
      error: 'Invalid JSON in request body.',
    });
  }

  // Generic fallback for unexpected errors
  // NEVER send err.message to the client in production (could leak DB info, file paths, etc.)
  const statusCode = err.status || err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    error: isProduction
      ? 'An unexpected error occurred. Please try again later.'
      : err.message || 'Internal server error',  // Show details only in development
  });
};
