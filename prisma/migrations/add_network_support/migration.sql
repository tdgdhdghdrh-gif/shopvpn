-- Add supported networks columns to VpnServer
ALTER TABLE "VpnServer" ADD COLUMN IF NOT EXISTS "supportsAis" BOOLEAN DEFAULT true;
ALTER TABLE "VpnServer" ADD COLUMN IF NOT EXISTS "supportsTrue" BOOLEAN DEFAULT true;
ALTER TABLE "VpnServer" ADD COLUMN IF NOT EXISTS "supportsDtac" BOOLEAN DEFAULT true;
