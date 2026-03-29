-- Add created_at to donors table with default of now() for existing rows
ALTER TABLE "donors" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
