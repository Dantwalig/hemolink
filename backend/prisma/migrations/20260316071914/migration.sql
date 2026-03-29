-- AlterTable
ALTER TABLE "notifications"
ALTER COLUMN "response_status" DROP NOT NULL,
ALTER COLUMN "response_status" SET DEFAULT 'pending';

-- CreateIndex
CREATE UNIQUE INDEX "inventory_hospital_id_blood_type_code_key" ON "inventory"("hospital_id", "blood_type_code");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_token_key" ON "notifications"("token");