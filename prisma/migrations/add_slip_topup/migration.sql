-- Add new fields to TopUp table
ALTER TABLE "TopUp" ADD COLUMN IF NOT EXISTS "reference" TEXT;
ALTER TABLE "TopUp" ADD COLUMN IF NOT EXISTS "slipUrl" TEXT;
ALTER TABLE "TopUp" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'SUCCESS';

-- Create unique index on reference
CREATE UNIQUE INDEX IF NOT EXISTS "TopUp_reference_key" ON "TopUp"("reference");

-- Create Settings table
CREATE TABLE IF NOT EXISTS "Settings" (
    "id" TEXT NOT NULL,
    "truemoneyPhone" TEXT,
    "truemoneyApiKey" TEXT,
    "slipApiKey" TEXT,
    "bankReceiverName" TEXT DEFAULT 'พันวิลา',
    "bankAccountNumber" TEXT,
    "promptpayNumber" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);
