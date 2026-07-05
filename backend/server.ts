import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import restaurantRouter from './routes/restaurants';
import { loadDataFile } from './dataStore';
import authRouter from './routes/auth';
import favouritesRouter from './routes/favourites';
import profileRouter from './routes/profile';

const app = express();
const port = 5500;

/**
 * CORS — Cross-Origin Resource Sharing
 *
 * Browsers block frontend JavaScript from making requests to a different
 * domain/port unless the server explicitly allows it.
 *
 * - origin: which domain(s) can call your API
 *   In dev: your Vite frontend runs on localhost:5173
 *   In prod: your deployed frontend URL (from env var)
 *
 * - credentials: true — allows cookies/auth headers to be sent cross-origin
 *   Without this, the browser strips Authorization headers on cross-origin requests
 *
 * WHY NOT just use '*'?
 * Because '*' means ANY website can call your API. An attacker's site
 * could trick a logged-in user's browser into making requests to your API
 * and the browser would happily send them (with the user's auth token).
 */
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

/**
 * JSON BODY PARSER with size limit.
 *
 * express.json() parses incoming request bodies as JSON.
 * The `limit` option rejects bodies larger than 10KB with a 413 status.
 *
 * Why 10KB?
 * - A typical login request is ~100 bytes
 * - A register request is ~200 bytes
 * - Even a large profile update is < 2KB
 * - 10KB gives plenty of room while blocking abuse
 *
 * Without this, an attacker could send a 1GB body and crash your server.
 * This is called a "payload-based Denial of Service" attack.
 */
app.use(express.json({ limit: '10kb' }));
app.use('/', authRouter);
app.use('/', restaurantRouter);
app.use('/favourites', favouritesRouter);
app.use('/', profileRouter);

app.get("/", (req, res) => {
  res.send("Backend is running"); // For Debug purposes
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
