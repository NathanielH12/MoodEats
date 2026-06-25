import { Router } from 'express';
import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import prisma from '../prisma/client';
import { validate, registerSchema, loginSchema } from '../middleware/validation';

/**
 * SALT_ROUNDS controls how computationally expensive the hash is.
 * Each increment roughly doubles the time:
 *   10 = ~10 hashes/sec (fast, dev-friendly)
 *   12 = ~2-3 hashes/sec (good balance for production)
 *   14 = very slow (high security, but users wait longer)
 *
 * 12 is the industry standard sweet spot.
 */
const SALT_ROUNDS = 12;

const router = Router();

/**
 * Higher order auth middleware — same logic as before, but instead of
 * looking up the token in data.sessions (a JS object), we query the
 * Session table in PostgreSQL via Prisma.
 *
 * prisma.session.findUnique finds exactly one row where token = the header value.
 * include: { user: true } is a JOIN — it fetches the related User row at the
 * same time so we get nameFirst and userId without a second query.
 */
export const authed = (fn: Function) => async (req: Request, res: Response) => {
  const header = req.headers['authorization'] ?? '';
  const token = header.replace('Bearer ', '').trim();

  // findUnique returns null if no matching row — replaces data.sessions[token]
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true }, // JOIN: also fetch the User this session belongs to
  });

  if (!session) return res.status(401).json({ error: 'Unauthorised!' });

  /**
   * Check if the session has expired.
   * Even if the token exists in the DB, it's useless after expiresAt.
   * We delete it (cleanup) and tell the client to re-authenticate.
   */
  if (session.expiresAt < new Date()) {
    // Clean up the expired session from the database
    await prisma.session.delete({ where: { token } }).catch(() => {});
    return res.status(401).json({ error: 'Session expired — please log in again.' });
  }

  // session.user is the full User row thanks to include: { user: true }
  (req as any).user = {
    userId: session.user.id,
    nameFirst: session.user.nameFirst,
  };

  return fn(req, res);
};

/**
 * Register — Validation happens BEFORE this handler runs (via validate middleware).
 * By the time we get here, req.body is guaranteed to have:
 * - nameFirst: trimmed string, 1-50 chars
 * - nameLast: trimmed string, 1-50 chars
 * - email: valid email, lowercased, max 255 chars
 * - password: string, 8-128 chars
 */
router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  const { nameFirst, nameLast, email, password } = req.body;

  // No need to check if fields exist — Zod already guaranteed that!

  // replaces: data.users.find(u => u.email === email)
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(400).json({ error: 'Email already registered!' });

  /**
   * bcrypt.hash(password, SALT_ROUNDS) does two things:
   * 1. Generates a random "salt" (random bytes mixed into the hash)
   * 2. Runs the bcrypt algorithm 2^SALT_ROUNDS times (intentionally slow)
   *
   * The result looks like: "$2b$12$LJ3m5eQxRZkVn..." (60 chars)
   * It contains: algorithm version + cost + salt + hash — all in one string
   */
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Store the HASH, never the original password
  const newUser = await prisma.user.create({
    data: { nameFirst, nameLast, email, password: hashedPassword },
  });

  // replaces: data.sessions[token] = { nameFirst, userId } + saveDataToFile()
  const token = randomUUID();

  /**
   * Session expires in 24 hours.
   * Date.now() = current time in milliseconds
   * 24 * 60 * 60 * 1000 = 86,400,000 ms = 24 hours
   * new Date(...) converts ms back to a Date object for Prisma/PostgreSQL
   */
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      token,
      userId: newUser.id,
      nameFirst: newUser.nameFirst,
      expiresAt,
    },
  });

  return res.status(200).json({ token });
});

/**
 * Login — Validation ensures email is valid and password is not empty.
 * We use a LESS strict schema here (no min length on password) because
 * we're checking against what's already in the DB, not setting a new one.
 */
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // findUnique returns null if no row matches — replaces data.users.find()
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) return res.status(401).json({ error: 'Invalid credentials!' });

  /**
   * bcrypt.compare(plaintextInput, storedHash) does:
   * 1. Extracts the salt from the stored hash string
   * 2. Hashes the input using that same salt
   * 3. Compares the result — returns true/false
   *
   * IMPORTANT: We check user existence FIRST, then compare.
   * We use the same error message for "user not found" and "wrong password"
   * so attackers can't tell which emails exist (enumeration protection).
   */
  const passwordValid = await bcrypt.compare(password, user.password);
  if (!passwordValid) return res.status(401).json({ error: 'Invalid credentials!' });

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h from now

  // replaces: data.sessions[token] = {...} + saveDataToFile()
  await prisma.session.create({
    data: {
      token,
      userId: user.id,
      nameFirst: user.nameFirst,
      expiresAt,
    },
  });

  return res.status(200).json({ token });
});

/**
 * /me — identical logic, just reads from req.user which authed() now
 * populates from the Prisma session query instead of the data file.
 */
router.get('/me', authed(async (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({ userId: user.userId, nameFirst: user.nameFirst });
}));

/**
 * Logout — replaces delete data.sessions[token] + saveDataToFile()
 * with prisma.session.delete().
 * .catch(() => {}) silently ignores if the token didn't exist
 * (same behaviour as deleting a key that doesn't exist in a JS object).
 */
router.post('/logout', authed(async (req: Request, res: Response) => {
  const token = req.headers['authorization']!.replace('Bearer ', '').trim();

  // replaces: delete data.sessions[token] + saveDataToFile()
  await prisma.session.delete({ where: { token } }).catch(() => {});

  return res.status(200).json({ message: 'Logged out' });
}));

export default router;