// Enums that match the Prisma schema exactly
// These should be used throughout the client application

export enum BedType {
  QueenBed = 'QueenBed',
  KingBed = 'KingBed',
  TwinBed = 'TwinBed',
  FullBed = 'FullBed',
  BunkBed = 'BunkBed',
  SofaBed = 'SofaBed',
  FutonBed = 'FutonBed'
}

export enum RoomSpaceType {
  MasterBedroom = 'MasterBedroom',
  Bedroom = 'Bedroom',
  LivingRoom = 'LivingRoom',
  Other = 'Other'
}

export enum ParkingType {
  YesFree = 'YesFree',
  YesPaid = 'YesPaid',
  No = 'No',
  Free = 'YesFree',
  Paid = 'YesPaid'
}

export enum PetPolicy {
  Yes = 'Yes',
  No = 'No',
  UponRequest = 'UponRequest',
  YesWithFee = 'UponRequest'
}

export enum BookingType {
  BookInstantly = 'BookInstantly',
  NeedToRequestBook = 'NeedToRequestBook',
  CanBookInstantly = 'BookInstantly'
}

export enum PaymentType {
  Online = 'Online',
  ByCreditCardAtProperty = 'ByCreditCardAtProperty',
  OnArrival = 'ByCreditCardAtProperty'
}

export enum Currency {
  AED = 'AED',
  USD = 'USD',
  EUR = 'EUR'
}

// Display labels for user-friendly UI
export const BedTypeLabels: Record<BedType, string> = {
  [BedType.QueenBed]: 'Queen Bed',
  [BedType.KingBed]: 'King Bed',
  [BedType.FullBed]: 'Single Bed',
  [BedType.TwinBed]: 'Twin Single Bed',
  [BedType.BunkBed]: 'Bunk Bed',
  [BedType.SofaBed]: 'Sofa Bed',
  [BedType.FutonBed]: 'Futon Bed'
}

export const RoomSpaceTypeLabels: Record<RoomSpaceType, string> = {
  [RoomSpaceType.Bedroom]: 'Bedroom',
  [RoomSpaceType.LivingRoom]: 'Living Room',
  [RoomSpaceType.MasterBedroom]: 'Master Bedroom',
  [RoomSpaceType.Other]: 'Other'
}

export const ParkingTypeLabels: Record<ParkingType, string> = {
  [ParkingType.YesFree]: 'Yes, Free Parking',
  [ParkingType.YesPaid]: 'Yes, Paid Parking',
  [ParkingType.No]: 'No Parking Available'
}

export const PetPolicyLabels: Record<PetPolicy, string> = {
  [PetPolicy.Yes]: 'Pets Allowed',
  [PetPolicy.No]: 'No Pets Allowed',
  [PetPolicy.UponRequest]: 'Pets Upon Request'
}

export const BookingTypeLabels: Record<BookingType, string> = {
  [BookingType.BookInstantly]: 'Instant Book',
  [BookingType.NeedToRequestBook]: 'Request to Book'
}

export const PaymentTypeLabels: Record<PaymentType, string> = {
  [PaymentType.Online]: 'Online Payment',
  [PaymentType.ByCreditCardAtProperty]: 'Pay at Property (Credit Card)'
}

export const CurrencyLabels: Record<Currency, string> = {
  [Currency.AED]: 'AED (UAE Dirham)',
  [Currency.USD]: 'USD (US Dollar)',
  [Currency.EUR]: 'EUR (Euro)'
}