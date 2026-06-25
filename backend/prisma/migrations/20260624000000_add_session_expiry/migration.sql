-- Add expiration column to Session table
-- Existing sessions get a default expiry of 24 hours from now
-- New sessions MUST provide an expiresAt value (NOT NULL)
ALTER TABLE "Session" ADD COLUMN "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT now() + interval '24 hours';

-- Optional: Create an index on expiresAt so cleanup queries are fast
-- (useful if you later add a cron job to delete expired sessions)
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
