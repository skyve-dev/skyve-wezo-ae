import { BedType, ParkingType, PetPolicy, BookingType, PaymentType, Currency } from '../constants/propertyEnums'

export interface Address {
  apartmentOrFloorNumber?: string
  countryOrRegion: string
  city: string
  zipCode: number
  latLong?: {
    latitude: number
    longitude: number
  }
}

export interface Bed {
  typeOfBed: BedType
  numberOfBed: number
}

export interface Room {
  spaceName: string
  beds?: Bed[]
}

export interface Layout {
  maximumGuest: number
  bathrooms: number
  allowChildren: boolean
  offerCribs: boolean
  propertySizeSqMtr?: number
  rooms?: Room[]
}

export interface Amenity {
  id?: string
  name: string
  category: string
}

export interface Services {
  serveBreakfast: boolean
  parking: ParkingType
  languages: string[]
}

export interface CheckInCheckout {
  checkInFrom: string
  checkInUntil: string
  checkOutFrom: string
  checkOutUntil: string
}

export interface Rules {
  smokingAllowed: boolean
  partiesOrEventsAllowed: boolean
  petsAllowed: PetPolicy
  checkInCheckout?: CheckInCheckout
}

export interface Photo {
  id?: string
  url: string
  altText?: string
  description?: string
  tags?: string[]
}

export interface Promotion {
  type: string
  percentage: number
  description?: string
}

export interface PricePerGroupSize {
  groupSize: number
  ratePerNight: number
}

export interface Pricing {
  currency: Currency
  ratePerNight: number
  ratePerNightWeekend?: number
  discountPercentageForNonRefundableRatePlan?: number
  discountPercentageForWeeklyRatePlan?: number
  promotion?: Promotion
  pricePerGroupSize?: PricePerGroupSize[]
}

export interface Cancellation {
  daysBeforeArrivalFreeToCancel: number
  waiveCancellationFeeAccidentalBookings: boolean
}

export interface Property {
  propertyId?: string
  name: string
  address: Address
  
  // Layout fields (flattened)
  maximumGuest: number
  bathrooms: number
  allowChildren: boolean
  offerCribs: boolean
  propertySizeSqMtr?: number
  rooms?: Room[]
  
  amenities?: Amenity[]
  
  // Services fields (flattened)
  serveBreakfast: boolean
  parking: ParkingType
  languages?: string[]
  
  // Rules fields (flattened)
  smokingAllowed: boolean
  partiesOrEventsAllowed: boolean
  petsAllowed: PetPolicy
  checkInCheckout?: CheckInCheckout
  
  photos?: Photo[]
  bookingType: BookingType
  paymentType: PaymentType
  pricing?: Pricing
  cancellation?: Cancellation
  aboutTheProperty?: string
  aboutTheNeighborhood?: string
  firstDateGuestCanCheckIn?: string
  ownerId?: string
  createdAt?: string
  updatedAt?: string
}

export interface WizardFormData extends Property {
  currentStep: number
  isComplete: boolean
  lastSaved?: string
  mode?: 'create' | 'edit'
}

export enum WizardStep {
  BASIC_INFO = 1,
  LOCATION = 2,
  LAYOUT = 3,
  AMENITIES = 4,
  PHOTOS = 5,
  SERVICES = 6,
  RULES = 7,
  PRICING = 8,
  REVIEW = 9
}

export interface ValidationErrors {
  [fieldName: string]: string
}

export interface PropertyState {
  properties: Property[]
  currentProperty: Property | null
  wizardData: WizardFormData | null
  loading: boolean
  error: string | null
  validationErrors: ValidationErrors | null
}