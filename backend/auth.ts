import { Router } from 'express';
import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { getData, saveDataToFile } from './dataStore';

const router = Router();

/**
 * Finds the next available unique id for a user using simple arithmetic with the list of users
 */
function getNextUserId(users: { userId: number }[]): number {
    if (users.length === 0) return 1;
    // Math.max expects individual numbers (comma-separated) not an array, so map users into each number.
    return Math.max(...users.map(u => u.userId)) + 1;
}

/**
 * A higher order function which is essentially a function which takes another function as input and returns
 * another function.
 * 
 * An auth middleware function which validates the existence of a token before running the given function.
 *  Steps
 *      - extracts token from header
 *      - checks data.sessions[token]
 *      - if valid runs function otherwise, return 401 and the function requested never runs.
 */
export const authed = (fn: Function) => async (req: Request, res: Response) => {
    const header = req.headers['authorization'] ?? '';
    const token = header.replace('Bearer ', '').trim();

    const data = getData();
    const session = data.sessions[token];

    if (!session) return res.status(401).json({ error: 'Unauthorised!' });

    // Attach the session ({ nameFirst, userId }) onto req so downstream route handlers
    // can access who is making the request via (req as any).user without re-querying the data store.
    // 'as any' is to escape TypeScript since Express's Request type has no built-in .user field.
    (req as any).user = session;
    return fn(req, res);
}

/**
 * Registers a new user by creating a new userId and checking that it is not an existing user through email
 */
router.post('/register', (req: Request, res: Response) => {
  const { nameFirst, nameLast, email, password } = req.body;

  if (!nameFirst || !nameLast || !email || !password)
    return res.status(400).json({ error: 'All fields are required in order to register!' });

  const data = getData();
  const exists = data.users.find((u) => u.email === email);
  if (exists) return res.status(400).json({ error: 'Email already registered!' });

  const newUser = {
    userId: getNextUserId(data.users),
    nameFirst,
    nameLast,
    email,
    password,
  };

  data.users.push(newUser);

  const token = randomUUID();
  data.sessions[token] = { nameFirst: newUser.nameFirst, userId: newUser.userId };

  saveDataToFile(data);

  return res.status(200).json({ token });
});

/**
 * Logins a user and creates a token for the session with nameFirst and userId.
 * Returns the token (created using UUID (Universally Unique Identifier: a 128-bit number. Built in Node.js)).
 */
router.post('/login', (req: Request, res: Response) => {
    const { email, password } = req.body;

    const data = getData();
    const user = data.users.find((u) => u.email === email && u.password === password);

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials!' });
    }

    const token = randomUUID();
    data.sessions[token] = { nameFirst: user.nameFirst, userId: user.userId };
    saveDataToFile(data);

    return res.status(200).json({ token });
});

/**
 * Returns the currently authenticated user's session data (nameFirst and userId).
 *  Use cases:
 *      - Verifies a stored token is still valid when the app loads (i.e. "am I still logged in?").
 *      - Retrieves the logged-in user's info for the frontend (e.g. displaying their name in the UI).
 *      - Acts as a quick sanity-check during development to confirm the auth flow is working.
 *      - Useful for displaying information for the user in their profile page.
 */         
router.get('/me', authed(async (req: Request, res: Response) => {
    const user = (req as any).user;
    res.json({ userId: user.userId, nameFirst: user.nameFirst });
}));

/**
 * Logs out the user by deleting the token.
 */
router.post('/logout', authed(async (req: Request, res: Response) => {
    const token = req.headers['authorization']!.replace('Bearer ', '').trim();
    const data  = getData();
    // delete key-value pair from data.sessions ('delete' is a built-in JavaScript operator)
    delete data.sessions[token];

    saveDataToFile(data);

    return res.status(200).json({ message: 'Logged out' });
}));

export default router;