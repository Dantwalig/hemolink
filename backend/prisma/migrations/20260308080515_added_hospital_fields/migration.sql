/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `hospitals` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `hospitals` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cell` to the `hospitals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `district_code` to the `hospitals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `hospitals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province_code` to the `hospitals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sector` to the `hospitals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `village` to the `hospitals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "hospitals" ADD COLUMN     "cell" TEXT NOT NULL,
ADD COLUMN     "district_code" TEXT NOT NULL,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "province_code" TEXT NOT NULL,
ADD COLUMN     "sector" TEXT NOT NULL,
ADD COLUMN     "village" TEXT NOT NULL,
ALTER COLUMN "latitude" DROP NOT NULL,
ALTER COLUMN "longitude" DROP NOT NULL;

-- CreateTable
CREATE TABLE "provinces" (
    "province_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "provinces_pkey" PRIMARY KEY ("province_code")
);

-- CreateTable
CREATE TABLE "districts" (
    "district_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "province_code" TEXT NOT NULL,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("district_code")
);

-- CreateIndex
CREATE UNIQUE INDEX "hospitals_phone_key" ON "hospitals"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "hospitals_email_key" ON "hospitals"("email");

-- AddForeignKey
ALTER TABLE "districts" ADD CONSTRAINT "districts_province_code_fkey" FOREIGN KEY ("province_code") REFERENCES "provinces"("province_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospitals" ADD CONSTRAINT "hospitals_province_code_fkey" FOREIGN KEY ("province_code") REFERENCES "provinces"("province_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospitals" ADD CONSTRAINT "hospitals_district_code_fkey" FOREIGN KEY ("district_code") REFERENCES "districts"("district_code") ON DELETE RESTRICT ON UPDATE CASCADE;
