import { Router, Request, Response } from 'express';
import { authed } from './auth';
import prisma from '../prisma/client';

// Extend Express Request to include the user payload from JWT
interface AuthRequest extends Request {
  user: {
    userId: number;
    nameFirst: string;
  };
}

const router = Router();

router.get('/profile', authed(async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        nameFirst: true,
        nameLast: true,
        email: true,
        createdAt: true,
        _count: {
          select: { favourites: true }  // counts saved restaurants
        }
      }
    });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}));

export default router;