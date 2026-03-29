-- AlterTable
ALTER TABLE "notifications"
ALTER COLUMN "response_status" DROP NOT NULL,
ALTER COLUMN "response_status" SET DEFAULT 'pending';
