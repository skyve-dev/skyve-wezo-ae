-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('TENANT', 'HOMEOWNER', 'MANAGER');

-- CreateEnum
CREATE TYPE "public"."BedType" AS ENUM ('TwinBed', 'FullBed', 'QueenBed', 'KingBed', 'BunkBed', 'SofaBed', 'FutonBed');

-- CreateEnum
CREATE TYPE "public"."RoomSpaceType" AS ENUM ('Bedroom', 'LivingRoom', 'Kitchen', 'DiningRoom', 'Other');

-- CreateEnum
CREATE TYPE "public"."ParkingType" AS ENUM ('YesFree', 'YesPaid', 'No');

-- CreateEnum
CREATE TYPE "public"."PetPolicy" AS ENUM ('Yes', 'No', 'UponRequest');

-- CreateEnum
CREATE TYPE "public"."BookingType" AS ENUM ('BookInstantly', 'NeedToRequestBook');

-- CreateEnum
CREATE TYPE "public"."PaymentType" AS ENUM ('Online', 'ByCreditCardAtProperty');

-- CreateEnum
CREATE TYPE "public"."Currency" AS ENUM ('AED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'TENANT',
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PropertyGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "PropertyGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Property" (
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,
    "propertyGroupId" TEXT,
    "maximumGuest" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "allowChildren" BOOLEAN NOT NULL,
    "offerCribs" BOOLEAN NOT NULL,
    "propertySizeSqMtr" INTEGER,
    "serveBreakfast" BOOLEAN NOT NULL,
    "parking" "public"."ParkingType" NOT NULL,
    "languages" TEXT[],
    "smokingAllowed" BOOLEAN NOT NULL,
    "partiesOrEventsAllowed" BOOLEAN NOT NULL,
    "petsAllowed" "public"."PetPolicy" NOT NULL,
    "aboutTheProperty" TEXT NOT NULL,
    "aboutTheNeighborhood" TEXT NOT NULL,
    "bookingType" "public"."BookingType" NOT NULL,
    "paymentType" "public"."PaymentType" NOT NULL,
    "firstDateGuestCanCheckIn" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("propertyId")
);

-- CreateTable
CREATE TABLE "public"."Address" (
    "id" TEXT NOT NULL,
    "apartmentOrFloorNumber" TEXT,
    "countryOrRegion" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "zipCode" INTEGER NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LatLong" (
    "id" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "addressId" TEXT NOT NULL,

    CONSTRAINT "LatLong_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Room" (
    "id" TEXT NOT NULL,
    "spaceName" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Bed" (
    "id" TEXT NOT NULL,
    "typeOfBed" "public"."BedType" NOT NULL,
    "numberOfBed" INTEGER NOT NULL,
    "roomId" TEXT NOT NULL,

    CONSTRAINT "Bed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CheckInOutTimes" (
    "id" TEXT NOT NULL,
    "checkInFrom" TEXT NOT NULL,
    "checkInUntil" TEXT NOT NULL,
    "checkOutFrom" TEXT NOT NULL,
    "checkOutUntil" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "CheckInOutTimes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Photo" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT[],
    "propertyId" TEXT,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Amenity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "Amenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Pricing" (
    "id" TEXT NOT NULL,
    "currency" "public"."Currency" NOT NULL,
    "ratePerNight" DOUBLE PRECISION NOT NULL,
    "ratePerNightWeekend" DOUBLE PRECISION,
    "discountPercentageForNonRefundableRatePlan" DOUBLE PRECISION,
    "discountPercentageForWeeklyRatePlan" DOUBLE PRECISION,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "Pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Promotion" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "pricingId" TEXT NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PricePerGroupSize" (
    "id" TEXT NOT NULL,
    "groupSize" INTEGER NOT NULL,
    "ratePerNight" DOUBLE PRECISION NOT NULL,
    "pricingId" TEXT NOT NULL,

    CONSTRAINT "PricePerGroupSize_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Cancellation" (
    "id" TEXT NOT NULL,
    "daysBeforeArrivalFreeToCancel" INTEGER NOT NULL,
    "waiveCancellationFeeAccidentalBookings" BOOLEAN NOT NULL,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "Cancellation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_passwordResetToken_key" ON "public"."User"("passwordResetToken");

-- CreateIndex
CREATE UNIQUE INDEX "Property_addressId_key" ON "public"."Property"("addressId");

-- CreateIndex
CREATE UNIQUE INDEX "LatLong_addressId_key" ON "public"."LatLong"("addressId");

-- CreateIndex
CREATE UNIQUE INDEX "CheckInOutTimes_propertyId_key" ON "public"."CheckInOutTimes"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "Pricing_propertyId_key" ON "public"."Pricing"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "Promotion_pricingId_key" ON "public"."Promotion"("pricingId");

-- CreateIndex
CREATE UNIQUE INDEX "Cancellation_propertyId_key" ON "public"."Cancellation"("propertyId");

-- AddForeignKey
ALTER TABLE "public"."Property" ADD CONSTRAINT "Property_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "public"."Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Property" ADD CONSTRAINT "Property_propertyGroupId_fkey" FOREIGN KEY ("propertyGroupId") REFERENCES "public"."PropertyGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Property" ADD CONSTRAINT "Property_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LatLong" ADD CONSTRAINT "LatLong_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "public"."Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Room" ADD CONSTRAINT "Room_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("propertyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Bed" ADD CONSTRAINT "Bed_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CheckInOutTimes" ADD CONSTRAINT "CheckInOutTimes_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("propertyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Photo" ADD CONSTRAINT "Photo_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("propertyId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Amenity" ADD CONSTRAINT "Amenity_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("propertyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pricing" ADD CONSTRAINT "Pricing_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("propertyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Promotion" ADD CONSTRAINT "Promotion_pricingId_fkey" FOREIGN KEY ("pricingId") REFERENCES "public"."Pricing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PricePerGroupSize" ADD CONSTRAINT "PricePerGroupSize_pricingId_fkey" FOREIGN KEY ("pricingId") REFERENCES "public"."Pricing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cancellation" ADD CONSTRAINT "Cancellation_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("propertyId") ON DELETE RESTRICT ON UPDATE CASCADE;
