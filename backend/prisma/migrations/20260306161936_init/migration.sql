-- CreateTable
CREATE TABLE "hospitals" (
    "hospital_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "hospitals_pkey" PRIMARY KEY ("hospital_id")
);

-- CreateTable
CREATE TABLE "blood_types" (
    "blood_type_code" TEXT NOT NULL,

    CONSTRAINT "blood_types_pkey" PRIMARY KEY ("blood_type_code")
);

-- CreateTable
CREATE TABLE "donors" (
    "donor_id" SERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "blood_type_code" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "availability_status" TEXT NOT NULL,
    "consent_sms" BOOLEAN NOT NULL,

    CONSTRAINT "donors_pkey" PRIMARY KEY ("donor_id")
);

-- CreateTable
CREATE TABLE "inventory" (
    "inventory_id" SERIAL NOT NULL,
    "hospital_id" INTEGER NOT NULL,
    "blood_type_code" TEXT NOT NULL,
    "units_available" INTEGER NOT NULL,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("inventory_id")
);

-- CreateTable
CREATE TABLE "request_status" (
    "status_code" TEXT NOT NULL,

    CONSTRAINT "request_status_pkey" PRIMARY KEY ("status_code")
);

-- CreateTable
CREATE TABLE "notification_status" (
    "delivery_status_code" TEXT NOT NULL,

    CONSTRAINT "notification_status_pkey" PRIMARY KEY ("delivery_status_code")
);

-- CreateTable
CREATE TABLE "blood_requests" (
    "request_id" SERIAL NOT NULL,
    "hospital_id" INTEGER NOT NULL,
    "blood_type_code" TEXT NOT NULL,
    "units_needed" INTEGER NOT NULL,
    "urgency_level" TEXT NOT NULL,
    "status_code" TEXT NOT NULL,
    "needed_by" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blood_requests_pkey" PRIMARY KEY ("request_id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "notification_id" SERIAL NOT NULL,
    "request_id" INTEGER NOT NULL,
    "donor_id" INTEGER NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL,
    "delivery_status_code" TEXT NOT NULL,
    "response_status" TEXT NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("notification_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "donors_phone_key" ON "donors"("phone");

-- AddForeignKey
ALTER TABLE "donors" ADD CONSTRAINT "donors_blood_type_code_fkey" FOREIGN KEY ("blood_type_code") REFERENCES "blood_types"("blood_type_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("hospital_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_blood_type_code_fkey" FOREIGN KEY ("blood_type_code") REFERENCES "blood_types"("blood_type_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blood_requests" ADD CONSTRAINT "blood_requests_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("hospital_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blood_requests" ADD CONSTRAINT "blood_requests_blood_type_code_fkey" FOREIGN KEY ("blood_type_code") REFERENCES "blood_types"("blood_type_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blood_requests" ADD CONSTRAINT "blood_requests_status_code_fkey" FOREIGN KEY ("status_code") REFERENCES "request_status"("status_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "blood_requests"("request_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_donor_id_fkey" FOREIGN KEY ("donor_id") REFERENCES "donors"("donor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_delivery_status_code_fkey" FOREIGN KEY ("delivery_status_code") REFERENCES "notification_status"("delivery_status_code") ON DELETE RESTRICT ON UPDATE CASCADE;
