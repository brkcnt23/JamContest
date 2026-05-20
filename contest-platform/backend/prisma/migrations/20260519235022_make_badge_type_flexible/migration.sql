-- Change Badge.type from enum to text (preserves existing data)
ALTER TABLE "Badge" ALTER COLUMN "type" TYPE TEXT;

-- Add new columns
ALTER TABLE "Badge" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Badge" ADD COLUMN IF NOT EXISTS "createdBy" TEXT;

-- Ensure unique index on type
CREATE UNIQUE INDEX IF NOT EXISTS "Badge_type_key" ON "Badge"("type");

-- Index on createdBy
CREATE INDEX IF NOT EXISTS "Badge_createdBy_idx" ON "Badge"("createdBy");
