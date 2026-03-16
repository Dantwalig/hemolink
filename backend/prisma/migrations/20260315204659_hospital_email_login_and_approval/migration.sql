/*
  Warnings:

  - A unique constraint covering the columns `[hospital_id,blood_type_code]` on the table `inventory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token]` on the table `notifications` will be added. If there are existing duplicate values, this will fail.
  - Made the column `email` on table `hospitals` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `token` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: add is_approved if it doesn't exist yet
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hospitals' AND column_name='is_approved') THEN
    ALTER TABLE "hospitals" ADD COLUMN "is_approved" BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;
ALTER TABLE "hospitals" ALTER COLUMN "email" SET NOT NULL;

-- AlterTable: add token only if it doesn't exist yet
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='token') THEN
    ALTER TABLE "notifications" ADD COLUMN "token" TEXT NOT NULL;
  END IF;
END $$;
ALTER TABLE "notifications" ALTER COLUMN "response_status" DROP NOT NULL;
ALTER TABLE "notifications" ALTER COLUMN "response_status" SET DEFAULT 'pending';

-- CreateIndex (safe)
CREATE UNIQUE INDEX IF NOT EXISTS "inventory_hospital_id_blood_type_code_key" ON "inventory"("hospital_id", "blood_type_code");

-- CreateIndex (safe)
CREATE UNIQUE INDEX IF NOT EXISTS "notifications_token_key" ON "notifications"("token");
