-- Add visibility and health check fields to VpnServer
ALTER TABLE "VpnServer" ADD COLUMN IF NOT EXISTS "isHidden" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "VpnServer" ADD COLUMN IF NOT EXISTS "healthStatus" TEXT NOT NULL DEFAULT 'unknown';
ALTER TABLE "VpnServer" ADD COLUMN IF NOT EXISTS "lastHealthCheck" TIMESTAMP(3);
