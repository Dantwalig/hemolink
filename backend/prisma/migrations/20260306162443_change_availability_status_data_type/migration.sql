/*
  Warnings:

  - You are about to drop the column `availability_status` on the `donors` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "donors" DROP COLUMN "availability_status",
ADD COLUMN     "available" BOOLEAN NOT NULL DEFAULT true;
