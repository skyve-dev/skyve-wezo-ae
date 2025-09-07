/*
  Warnings:

  - Added the required column `propertyId` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Reservation" DROP CONSTRAINT "Reservation_ratePlanId_fkey";

-- AlterTable
ALTER TABLE "public"."Reservation" ADD COLUMN     "propertyId" TEXT NOT NULL,
ALTER COLUMN "ratePlanId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Reservation" ADD CONSTRAINT "Reservation_ratePlanId_fkey" FOREIGN KEY ("ratePlanId") REFERENCES "public"."RatePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reservation" ADD CONSTRAINT "Reservation_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("propertyId") ON DELETE RESTRICT ON UPDATE CASCADE;
