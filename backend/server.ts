import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import { generalLimiter, authLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import restaurantRouter from './routes/restaurants';
import { loadDataFile } from './dataStore';
import authRouter from './routes/auth';
import favouritesRouter from './routes/favourites';
import profileRouter from './routes/profile';

loadDataFile();
const app = express();

/**
 * PORT from environment variable — essential for deployment.
 *
 * Hosting platforms (Railway, Render, Heroku, AWS) dynamically assign
 * a port via the PORT env var. If you hardcode 5500, your deployed app
 * will listen on the WRONG port and never receive traffic.
 *
 * Locally, we fall back to 5500 so you don't need to set anything up.
 */
const port = process.env.PORT || 5500;

/**
 * HELMET — Sets security-related HTTP headers on every response.
 * Must be one of the FIRST middleware so all responses get the headers.
 *
 * What it sets (among others):
 * - Content-Security-Policy: restricts where scripts/styles/images can load from
 * - X-Content-Type-Options: nosniff — prevents MIME type sniffing attacks
 * - X-Frame-Options: SAMEORIGIN — prevents clickjacking via iframes
 * - Strict-Transport-Security — forces HTTPS on subsequent visits
 * - X-DNS-Prefetch-Control — controls browser DNS prefetching
 * - Referrer-Policy — controls how much URL info is shared with other sites
 *
 * You can override individual headers if needed:
 *   helmet({ contentSecurityPolicy: false }) — disables CSP if it breaks your frontend
 */
app.use(helmet());

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

// Apply the general rate limiter to ALL routes first
app.use(generalLimiter);

// Apply the stricter auth limiter ONLY to login and register
app.use('/login', authLimiter);
app.use('/register', authLimiter);

app.use('/', authRouter);
app.use('/', restaurantRouter);
app.use('/favourites', favouritesRouter);
app.use('/', profileRouter);

app.get("/", (req, res) => {
  res.send("Backend is running"); // For Debug purposes
});

/**
 * HEALTH CHECK — Used by hosting platforms, load balancers, and monitoring.
 *
 * Railway/Render/AWS periodically hit this endpoint to check if your app
 * is alive. If it stops responding, they restart the container.
 *
 * Returns: { status: "ok", timestamp: "..." }
 */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

/**
 * GLOBAL ERROR HANDLER — must be LAST middleware (after all routes).
 * Express identifies it as an error handler because it has 4 parameters.
 * Catches any unhandled errors and returns a clean response.
 */
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
});
