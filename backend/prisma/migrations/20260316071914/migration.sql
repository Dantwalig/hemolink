/*
  Warnings:

  - A unique constraint covering the columns `[hospital_id,blood_type_code]` on the table `inventory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token]` on the table `notifications` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `token` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "token" TEXT NOT NULL,
ALTER COLUMN "response_status" DROP NOT NULL,
ALTER COLUMN "response_status" SET DEFAULT 'pending';

-- CreateIndex
CREATE UNIQUE INDEX "inventory_hospital_id_blood_type_code_key" ON "inventory"("hospital_id", "blood_type_code");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_token_key" ON "notifications"("token");
