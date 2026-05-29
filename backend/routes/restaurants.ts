import { Router, Request, Response } from 'express';
import axios from 'axios';
import { authed } from './auth';

/**
 * Frontend sends GET /restaurants?mood=happy&lat=-33.94&lng=151.20
  → authed checks token is valid
  → mood mapped to ["italian", "mexican", "dessert bar"]
  → Google Places called with "italian restaurants" near Sydney
  → Google returns 10 nearby places
  → places transformed into clean objects
  → { mood, cuisines, restaurants } sent back to frontend
 */

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
  // e.g when the frontends calls 'GET /restaurants?mood=happy&lat=-33.94&lng=151.20'
  // Express parses that into req.query = { mood: "happy", lat: "-33.94", lng: "151.20" }.
  const { mood, lat, lng } = req.query as Record<string, string>;
  if (!mood || !lat || !lng) 
    return res.status(400).json({ error: 'mood, lat, and lng are all required' });

  const cuisines = moodMap[mood.toLowerCase()];
  if (!cuisines) 
    return res.status(400).json({ error: `Unknown mood. Valid moods: ${Object.keys(moodMap).join(', ')}` });

  // 3. Call Places API (New) — Nearby Search
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  const searchTerm = cuisines[Math.floor(Math.random() * cuisines.length)]; // use top cuisine match

  /**
   * process.env.GOOGLE_API_KEY reads from your .env file

    cuisines[0] takes the first cuisine in the array for that mood

    axios.post takes three arguments: URL, request body, config (headers etc.)

    textQuery is the search string Google uses — like typing into Google Maps

    locationBias tells Google to prioritise results near the user's coordinates within 2km

    parseFloat(lat) converts the string "-33.94" to the number -33.94 that Google expects

    X-Goog-FieldMask is how the new Places API works — you must explicitly list which fields you want back, otherwise Google returns nothing. This also reduces cost since you only pay for fields you request
   */
  try {
    const googleRes = await axios.post(
    'https://places.googleapis.com/v1/places:searchText',
    {
      textQuery: `${searchTerm} restaurants`,
      maxResultCount: 15,
      locationBias: {
        circle: {
          center: { latitude: parseFloat(lat), longitude: parseFloat(lng) },
          radius: 2000.0,
        },
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'places.displayName,places.rating,places.formattedAddress,places.currentOpeningHours,places.priceLevel,places.id',
      },
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