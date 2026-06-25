import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

/**
 * ZOD VALIDATION SCHEMAS
 *
 * Zod lets you define the EXACT shape of valid data.
 * If the incoming data doesn't match, Zod returns helpful error messages.
 *
 * Key concepts:
 * - z.string() — must be a string (rejects numbers, arrays, objects)
 * - .min(1) — at least 1 character (rejects empty strings)
 * - .max(50) — at most 50 chars (prevents DB overflow)
 * - .email() — must match email pattern (uses RFC 5322 regex internally)
 * - .trim() — strips leading/trailing whitespace BEFORE validating
 *
 * The schema acts as both:
 * 1. A VALIDATOR — rejects bad data with clear error messages
 * 2. A TYPE DEFINITION — TypeScript infers the type automatically
 */

// ─── Auth Schemas ──────────────────────────────────────────────────────

export const registerSchema = z.object({
  nameFirst: z
    .string({ required_error: 'First name is required' })
    .trim()
    .min(1, 'First name cannot be empty')
    .max(50, 'First name must be 50 characters or less'),

  nameLast: z
    .string({ required_error: 'Last name is required' })
    .trim()
    .min(1, 'Last name cannot be empty')
    .max(50, 'Last name must be 50 characters or less'),

  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Must be a valid email address')
    .max(255, 'Email must be 255 characters or less')
    .toLowerCase(),  // Normalize: "John@Gmail.COM" → "john@gmail.com"

  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be 128 characters or less'),
    // NOTE: We don't trim passwords — spaces might be intentional
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Must be a valid email address')
    .toLowerCase(),

  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
    // Don't enforce min length on LOGIN — the user already set it during registration
    // We just need to know it's not empty before hitting bcrypt
});

// ─── Validation Middleware Factory ─────────────────────────────────────

/**
 * validate() is a MIDDLEWARE FACTORY — a function that RETURNS a middleware.
 *
 * Usage:  router.post('/register', validate(registerSchema), handler)
 *
 * How it works:
 * 1. Takes a Zod schema as input
 * 2. Returns a middleware function (req, res, next)
 * 3. That middleware runs schema.safeParse(req.body)
 * 4. If valid → calls next() (continues to your route handler)
 * 5. If invalid → returns 400 with the error details
 *
 * Why safeParse instead of parse?
 * - parse() THROWS an error on failure (would crash without try/catch)
 * - safeParse() RETURNS { success: false, error: ... } (no exception needed)
 */
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // Format Zod errors into a clean response
      // result.error.issues = [{ path: ['email'], message: 'Must be valid email' }, ...]
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),   // e.g. "email" or "nameFirst"
        message: issue.message,         // e.g. "Must be a valid email address"
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details: errors,
      });
    }

    // Replace req.body with the PARSED data (trimmed, lowercased, etc.)
    // This ensures your route handler gets clean, validated data
    req.body = result.data;
    next();
  };
};

// ─── Type exports (for use in route handlers) ──────────────────────────
// These are inferred FROM the schema — no manual type definitions needed!
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
