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

// GET all favourites for logged-in user
router.get('/', authed(async (req: AuthRequest, res: Response) => {
  try {
    const favourites = await prisma.favourite.findMany({
      where: { userId: req.user.userId }
    });
    res.json(favourites);
  } catch {
    res.status(500).json({ error: 'Failed to fetch favourites' });
  }
}));

// POST — save a restaurant
router.post('/', authed(async (req: AuthRequest, res: Response) => {
  const { placeId, name, address, rating } = req.body as {
    placeId: string;
    name: string;
    address: string;
    rating?: number;
  };

  try {
    const fav = await prisma.favourite.create({
      data: { userId: req.user.userId, placeId, name, address, rating }
    });
    res.json(fav);
  } catch {
    res.status(400).json({ error: 'Already saved' });
  }
}));

// DELETE — remove a favourite
router.delete('/:placeId', authed(async (req: AuthRequest, res: Response) => {
  try {
    await prisma.favourite.deleteMany({
      where: { userId: req.user.userId, placeId: String(req.params.placeId) }
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to remove favourite' });
  }
}));

export default router;