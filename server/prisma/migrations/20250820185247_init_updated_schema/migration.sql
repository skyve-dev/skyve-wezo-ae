-- CreateEnum
CREATE TYPE "public"."PropertyStatus" AS ENUM ('Draft', 'Live', 'Closed');

-- CreateEnum
CREATE TYPE "public"."RatePlanType" AS ENUM ('FullyFlexible', 'NonRefundable', 'Custom');

-- CreateEnum
CREATE TYPE "public"."RestrictionType" AS ENUM ('MinLengthOfStay', 'MaxLengthOfStay', 'NoArrivals', 'NoDepartures', 'MinAdvancedReservation', 'MaxAdvancedReservation');

-- CreateEnum
CREATE TYPE "public"."ReservationStatus" AS ENUM ('Confirmed', 'Pending', 'Modified', 'Cancelled', 'NoShow', 'Completed');

-- CreateEnum
CREATE TYPE "public"."KyuStatus" AS ENUM ('PendingSubmission', 'Submitted', 'Verified', 'Rejected');

-- CreateEnum
CREATE TYPE "public"."KyuEntityType" AS ENUM ('Individual', 'Business');

-- CreateEnum
CREATE TYPE "public"."KyuDocumentType" AS ENUM ('GovernmentId', 'ProofOfAddress', 'BusinessRegistration', 'Other');

-- CreateEnum
CREATE TYPE "public"."SecurityReportType" AS ENUM ('SuspiciousActivity', 'SecurityBreach', 'PhishingAttempt', 'SocialEngineeringAttempt', 'FraudulentBooking', 'Other');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('Tenant', 'HomeOwner', 'Manager');

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
    "firstName" TEXT,
    "lastName" TEXT,
    "password" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'Tenant',
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
    "status" "public"."PropertyStatus" NOT NULL DEFAULT 'Draft',
    "minPhotosRequired" INTEGER NOT NULL DEFAULT 5,
    "reservationPolicy" TEXT,
    "paymentPolicy" TEXT,
    "cancellationPolicyType" "public"."RatePlanType",
    "houseRules" TEXT,

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
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

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

-- CreateTable
CREATE TABLE "public"."Availability" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RatePlan" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."RatePlanType" NOT NULL,
    "description" TEXT,
    "cancellationPolicy" TEXT NOT NULL,
    "includesBreakfast" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RatePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Price" (
    "id" TEXT NOT NULL,
    "ratePlanId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Restriction" (
    "id" TEXT NOT NULL,
    "ratePlanId" TEXT,
    "propertyId" TEXT NOT NULL,
    "type" "public"."RestrictionType" NOT NULL,
    "value" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Restriction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Reservation" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "ratePlanId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "checkInDate" TIMESTAMP(3) NOT NULL,
    "checkOutDate" TIMESTAMP(3) NOT NULL,
    "numGuests" INTEGER NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "commissionAmount" DECIMAL(10,2),
    "status" "public"."ReservationStatus" NOT NULL DEFAULT 'Confirmed',
    "paymentStatus" TEXT,
    "guestRequests" TEXT,
    "isNoShowReported" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT,
    "senderId" TEXT NOT NULL,
    "senderType" "public"."UserRole" NOT NULL,
    "recipientId" TEXT NOT NULL,
    "recipientType" "public"."UserRole" NOT NULL,
    "content" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Review" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "response" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HomeOwnerBankDetails" (
    "id" TEXT NOT NULL,
    "homeownerId" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountHolderName" TEXT NOT NULL,
    "sortCode" TEXT,
    "currency" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeOwnerBankDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Invoice" (
    "id" TEXT NOT NULL,
    "homeownerId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "description" TEXT,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."KyuForm" (
    "id" TEXT NOT NULL,
    "homeownerId" TEXT NOT NULL,
    "status" "public"."KyuStatus" NOT NULL DEFAULT 'PendingSubmission',
    "entityType" "public"."KyuEntityType" NOT NULL,
    "individualFullName" TEXT,
    "individualDateOfBirth" TIMESTAMP(3),
    "individualResidentialAddress" TEXT,
    "businessLegalName" TEXT,
    "businessRegisteredAddress" TEXT,
    "businessRegistrationNumber" TEXT,
    "businessDateOfRegistration" TIMESTAMP(3),
    "businessTaxIdNumber" TEXT,
    "ultimateBeneficialOwners" JSONB,
    "submittedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KyuForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."KyuDocument" (
    "id" TEXT NOT NULL,
    "kyuFormId" TEXT NOT NULL,
    "documentType" "public"."KyuDocumentType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KyuDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SecurityReport" (
    "id" TEXT NOT NULL,
    "homeownerId" TEXT NOT NULL,
    "type" "public"."SecurityReportType" NOT NULL,
    "description" TEXT NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecurityReport_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "Availability_propertyId_date_key" ON "public"."Availability"("propertyId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Price_ratePlanId_date_key" ON "public"."Price"("ratePlanId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Review_reservationId_key" ON "public"."Review"("reservationId");

-- CreateIndex
CREATE UNIQUE INDEX "HomeOwnerBankDetails_homeownerId_key" ON "public"."HomeOwnerBankDetails"("homeownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "public"."Invoice"("invoiceNumber");

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

-- AddForeignKey
ALTER TABLE "public"."Availability" ADD CONSTRAINT "Availability_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("propertyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RatePlan" ADD CONSTRAINT "RatePlan_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("propertyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Price" ADD CONSTRAINT "Price_ratePlanId_fkey" FOREIGN KEY ("ratePlanId") REFERENCES "public"."RatePlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Restriction" ADD CONSTRAINT "Restriction_ratePlanId_fkey" FOREIGN KEY ("ratePlanId") REFERENCES "public"."RatePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Restriction" ADD CONSTRAINT "Restriction_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("propertyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reservation" ADD CONSTRAINT "Reservation_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("propertyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reservation" ADD CONSTRAINT "Reservation_ratePlanId_fkey" FOREIGN KEY ("ratePlanId") REFERENCES "public"."RatePlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reservation" ADD CONSTRAINT "Reservation_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "public"."Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("propertyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "public"."Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HomeOwnerBankDetails" ADD CONSTRAINT "HomeOwnerBankDetails_homeownerId_fkey" FOREIGN KEY ("homeownerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_homeownerId_fkey" FOREIGN KEY ("homeownerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KyuForm" ADD CONSTRAINT "KyuForm_homeownerId_fkey" FOREIGN KEY ("homeownerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KyuDocument" ADD CONSTRAINT "KyuDocument_kyuFormId_fkey" FOREIGN KEY ("kyuFormId") REFERENCES "public"."KyuForm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SecurityReport" ADD CONSTRAINT "SecurityReport_homeownerId_fkey" FOREIGN KEY ("homeownerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
