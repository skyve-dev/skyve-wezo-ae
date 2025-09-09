-- CreateEnum
CREATE TYPE "public"."PayoutStatus" AS ENUM ('Pending', 'Processing', 'Completed', 'Failed', 'Cancelled');

-- CreateTable
CREATE TABLE "public"."ReservationAuditLog" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userRole" "public"."UserRole" NOT NULL,
    "action" TEXT NOT NULL,
    "field" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReservationAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReservationFeeBreakdown" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "nights" INTEGER NOT NULL,
    "cleaningFee" DECIMAL(10,2),
    "serviceFee" DECIMAL(10,2),
    "taxAmount" DECIMAL(10,2),
    "securityDeposit" DECIMAL(10,2),
    "platformCommission" DECIMAL(10,2),
    "paymentProcessingFee" DECIMAL(10,2),
    "totalGuestPays" DECIMAL(10,2) NOT NULL,
    "ownerReceives" DECIMAL(10,2) NOT NULL,
    "platformRevenue" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReservationFeeBreakdown_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payout" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "homeOwnerId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "status" "public"."PayoutStatus" NOT NULL DEFAULT 'Pending',
    "scheduledAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "bankReference" TEXT,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MessageAttachment" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReservationAuditLog_reservationId_idx" ON "public"."ReservationAuditLog"("reservationId");

-- CreateIndex
CREATE INDEX "ReservationAuditLog_userId_idx" ON "public"."ReservationAuditLog"("userId");

-- CreateIndex
CREATE INDEX "ReservationAuditLog_createdAt_idx" ON "public"."ReservationAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "ReservationAuditLog_action_idx" ON "public"."ReservationAuditLog"("action");

-- CreateIndex
CREATE UNIQUE INDEX "ReservationFeeBreakdown_reservationId_key" ON "public"."ReservationFeeBreakdown"("reservationId");

-- CreateIndex
CREATE INDEX "ReservationFeeBreakdown_reservationId_idx" ON "public"."ReservationFeeBreakdown"("reservationId");

-- CreateIndex
CREATE UNIQUE INDEX "Payout_reservationId_key" ON "public"."Payout"("reservationId");

-- CreateIndex
CREATE INDEX "Payout_reservationId_idx" ON "public"."Payout"("reservationId");

-- CreateIndex
CREATE INDEX "Payout_homeOwnerId_idx" ON "public"."Payout"("homeOwnerId");

-- CreateIndex
CREATE INDEX "Payout_status_idx" ON "public"."Payout"("status");

-- CreateIndex
CREATE INDEX "Payout_scheduledAt_idx" ON "public"."Payout"("scheduledAt");

-- CreateIndex
CREATE INDEX "MessageAttachment_messageId_idx" ON "public"."MessageAttachment"("messageId");

-- AddForeignKey
ALTER TABLE "public"."ReservationAuditLog" ADD CONSTRAINT "ReservationAuditLog_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "public"."Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReservationAuditLog" ADD CONSTRAINT "ReservationAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReservationFeeBreakdown" ADD CONSTRAINT "ReservationFeeBreakdown_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "public"."Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payout" ADD CONSTRAINT "Payout_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "public"."Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payout" ADD CONSTRAINT "Payout_homeOwnerId_fkey" FOREIGN KEY ("homeOwnerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MessageAttachment" ADD CONSTRAINT "MessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "public"."Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
