// Enums that match the Prisma schema exactly
// These should be used throughout the client application

export enum BedType {
  TwinBed = 'TwinBed',
  FullBed = 'FullBed',
  QueenBed = 'QueenBed',
  KingBed = 'KingBed',
  BunkBed = 'BunkBed',
  SofaBed = 'SofaBed',
  FutonBed = 'FutonBed'
}

export enum RoomSpaceType {
  Bedroom = 'Bedroom',
  LivingRoom = 'LivingRoom',
  Kitchen = 'Kitchen',
  DiningRoom = 'DiningRoom',
  Other = 'Other'
}

export enum ParkingType {
  YesFree = 'YesFree',
  YesPaid = 'YesPaid',
  No = 'No'
}

export enum PetPolicy {
  Yes = 'Yes',
  No = 'No',
  UponRequest = 'UponRequest'
}

export enum BookingType {
  BookInstantly = 'BookInstantly',
  NeedToRequestBook = 'NeedToRequestBook'
}

export enum PaymentType {
  Online = 'Online',
  ByCreditCardAtProperty = 'ByCreditCardAtProperty'
}

export enum Currency {
  AED = 'AED'
}

// Display labels for user-friendly UI
export const BedTypeLabels: Record<BedType, string> = {
  [BedType.TwinBed]: 'Twin Bed',
  [BedType.FullBed]: 'Full Bed',
  [BedType.QueenBed]: 'Queen Bed',
  [BedType.KingBed]: 'King Bed',
  [BedType.BunkBed]: 'Bunk Bed',
  [BedType.SofaBed]: 'Sofa Bed',
  [BedType.FutonBed]: 'Futon Bed'
}

export const RoomSpaceTypeLabels: Record<RoomSpaceType, string> = {
  [RoomSpaceType.Bedroom]: 'Bedroom',
  [RoomSpaceType.LivingRoom]: 'Living Room',
  [RoomSpaceType.Kitchen]: 'Kitchen',
  [RoomSpaceType.DiningRoom]: 'Dining Room',
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