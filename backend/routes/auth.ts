import { Router } from 'express';
import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import prisma from '../prisma/client';

// Salt rounds refer to the number of iterations the bcrypt algorithm uses to hash 
// the password. It determines how computationally expensive the hash is.
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

  // session.user is the full User row thanks to include: { user: true }
  (req as any).user = {
    userId: session.user.id,
    nameFirst: session.user.nameFirst,
  };

  return fn(req, res);
};

/**
 * Register — same logic, but:
 * - prisma.user.findUnique replaces data.users.find()
 * - prisma.user.create replaces data.users.push() + saveDataToFile()
 * - prisma.session.create replaces data.sessions[token] = {...} + saveDataToFile()
 * - No more getNextUserId() — PostgreSQL auto-increments the id via @default(autoincrement())
 */
router.post('/register', async (req: Request, res: Response) => {
  const { nameFirst, nameLast, email, password } = req.body;

  
  if (!nameFirst || !nameLast || !email || !password)
    return res.status(400).json({ error: 'All fields are required in order to register!' });
  
  const normalizedEmail = email.toLowerCase().trim();

  // replaces: data.users.find(u => u.email === email)
  const exists = await prisma.user.findUnique({ where: { email: normalizedEmail } });
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

  // replaces: data.users.push(newUser) + saveDataToFile()
  // Prisma inserts the row and returns the created object (including the auto-generated id)
  const newUser = await prisma.user.create({
    data: { nameFirst, nameLast, email: normalizedEmail, password: hashedPassword },
  });

  // replaces: data.sessions[token] = { nameFirst, userId } + saveDataToFile()
  const token = randomUUID();
  await prisma.session.create({
    data: {
      token,
      userId: newUser.id,    // newUser.id is the auto-incremented id PostgreSQL assigned
      nameFirst: newUser.nameFirst,
    },
  });

  return res.status(200).json({ token });
});

/**
 * Login — same logic:
 * - prisma.user.findUnique replaces data.users.find()
 * - prisma.session.create replaces data.sessions[token] = {...} + saveDataToFile()
 */
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required!' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // findUnique returns null if no row matches — replaces data.users.find()
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user) return res.status(401).json({ error: 'Invalid credentials!' });

  /**
   * bcrypt.compare(plaintextInput, storedHash) does:
   * 1. Extracts the salt from the stored hash string
   * 2. Hashes the input using that same salt
   * 3. Compares the result — returns true/false
   */
  const passwordValid = await bcrypt.compare(password, user.password);
  if (!passwordValid) return res.status(401).json({ error: 'Invalid credentials!' });

  const token = randomUUID();

  // replaces: data.sessions[token] = {...} + saveDataToFile()
  await prisma.session.create({
    data: {
      token,
      userId: user.id,
      nameFirst: user.nameFirst,
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