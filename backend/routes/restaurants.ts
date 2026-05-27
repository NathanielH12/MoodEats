import { Router, Request, Response } from 'express';
import axios from 'axios';
import { authed } from './auth';

const router = Router();
const moodMap: Record<string, string[]> = {
  happy:       ['italian', 'mexican', 'dessert bar'],
  sad:         ['ramen', 'comfort food', 'pizza'],
  stressed:    ['sushi', 'salad', 'smoothie bar'],
  adventurous: ['thai', 'ethiopian', 'peruvian'],
  romantic:    ['french', 'tapas', 'steakhouse'],
  lazy:        ['burgers', 'pizza', 'chinese'],
};

router.get('/restaurants', authed(async (req: Request, res: Response) => {

  // 2. Validate inputs
  const { mood, lat, lng } = req.query as Record<string, string>;
  if (!mood || !lat || !lng) 
    return res.status(400).json({ error: 'mood, lat, and lng are all required' });

  const cuisines = moodMap[mood.toLowerCase()];
  if (!cuisines) 
    return res.status(400).json({ error: `Unknown mood. Valid moods: ${Object.keys(moodMap).join(', ')}` });

  // 3. Call Places API (New) — Nearby Search
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  const searchTerm = cuisines[0]; // use top cuisine match

  try {
    const googleRes = await axios.post(
      'https://places.googleapis.com/v1/places:searchNearby',
      {
        includedTypes: ['restaurant'],
        maxResultCount: 10,
        locationRestriction: {
          circle: {
            center: { latitude: parseFloat(lat), longitude: parseFloat(lng) },
            radius: 2000.0, // 2km
          },
        },
        rankPreference: 'DISTANCE',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask': 'places.displayName,places.rating,places.formattedAddress,places.currentOpeningHours,places.priceLevel,places.id',
        },
        params: { textQuery: searchTerm }, // filter by cuisine keyword
      }
    );

    const restaurants = (googleRes.data.places || []).map((place: any) => ({
      id: place.id,
      name: place.displayName?.text,
      rating: place.rating,
      address: place.formattedAddress,
      openNow: place.currentOpeningHours?.openNow ?? null,
      priceLevel: place.priceLevel ?? null,
      cuisine: searchTerm,
    }));

    return res.status(200).json({ mood, cuisines, restaurants });

  } catch (err: any) {
    console.error('Google Places error:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
}));

export default router;