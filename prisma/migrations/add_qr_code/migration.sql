-- Add qrCodeImage column to Settings
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "qrCodeImage" TEXT;
