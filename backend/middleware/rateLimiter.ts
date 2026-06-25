import rateLimit from 'express-rate-limit';

/**
 * RATE LIMITING — How it works:
 *
 * express-rate-limit tracks how many requests each IP address makes
 * within a time window. If they exceed the max, it responds with 429
 * (Too Many Requests) and blocks further attempts until the window resets.
 *
 * It stores the count in memory by default (fine for single-server apps).
 * For multi-server deployments, you'd use a Redis store instead.
 *
 * The "windowMs" is a sliding window — it resets after the time period.
 */

/**
 * AUTH LIMITER — Applied to /login and /register only.
 * Strict because these are the most targeted endpoints for:
 * - Brute-force attacks (trying many passwords)
 * - Credential stuffing (trying leaked email/password combos)
 * - Account creation spam (bots registering fake accounts)
 *
 * 10 attempts per 15 minutes is generous for real users
 * (who rarely fail login more than 3 times) but blocks automated attacks.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes (in milliseconds)
  max: 10,                      // max 10 requests per windowMs per IP
  message: {
    error: 'Too many attempts — please try again in 15 minutes.',
  },
  standardHeaders: true,        // Send `RateLimit-*` headers (lets frontend show countdown)
  legacyHeaders: false,         // Disable old `X-RateLimit-*` headers (deprecated)
});

/**
 * GENERAL LIMITER — Applied to ALL routes.
 * More relaxed — prevents abuse but doesn't interfere with normal usage.
 * 100 requests per 15 minutes = ~6-7 requests per minute, which is
 * plenty for a normal user browsing the app.
 *
 * Protects against:
 * - DoS (Denial of Service) — flooding your server with requests
 * - Scraping — automated tools harvesting your data
 * - API abuse — someone hammering your endpoints
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 100,                     // max 100 requests per windowMs per IP
  message: {
    error: 'Too many requests — please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
