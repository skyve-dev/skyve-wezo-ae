import { BedType, ParkingType, PetPolicy, BookingType, PaymentType, Currency } from '../constants/propertyEnums'
import {PropertyStatus} from "@/store/slices/propertySlice.ts";

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

// DEPRECATED: Pricing and Cancellation are now managed through RatePlan model
// These interfaces are kept for backward compatibility but should not be used for new features
// @deprecated Use RatePlan model for pricing and cancellation policies
export interface Pricing {
  currency: Currency
  ratePerNight: number
  ratePerNightWeekend?: number
  discountPercentageForNonRefundableRatePlan?: number
  discountPercentageForWeeklyRatePlan?: number
  promotion?: Promotion
  pricePerGroupSize?: PricePerGroupSize[]
}

// @deprecated Use RatePlan.cancellationPolicy instead
export interface Cancellation {
  daysBeforeArrivalFreeToCancel: number
  waiveCancellationFeeAccidentalBookings: boolean
}

// New PropertyPricing interface matching Prisma schema
export interface PropertyPricing {
  id?: string
  propertyId?: string
  
  // Full day base prices for each day of the week
  priceMonday: number
  priceTuesday: number
  priceWednesday: number
  priceThursday: number
  priceFriday: number
  priceSaturday: number
  priceSunday: number
  
  // Half day base prices for each day of the week (4-6 hours)
  halfDayPriceMonday: number
  halfDayPriceTuesday: number
  halfDayPriceWednesday: number
  halfDayPriceThursday: number
  halfDayPriceFriday: number
  halfDayPriceSaturday: number
  halfDayPriceSunday: number
  
  currency: Currency
  createdAt?: string
  updatedAt?: string
}

export interface Property {
  status: PropertyStatus;
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
  
  // New PropertyPricing relationship
  pricing?: PropertyPricing // Weekly pricing setup
  
  // Photo IDs for independent photo upload
  photoIds?: string[] // Store uploaded photo IDs before property creation
  
  // New relationships from updated schema
  ratePlans?: any[] // Associated rate plans
  propertyGroupId?: string // Optional property group
  
  // @deprecated These fields are kept for backward compatibility but are not used by backend
  legacyPricing?: Pricing // Renamed to avoid confusion with new pricing
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
  // NOTE: PRICING step is deprecated - pricing is now managed through RatePlan creation
  PRICING = 8, // Keep for backward compatibility but should redirect to rate plan creation
  REVIEW = 9
}

export interface ValidationErrors {
  [fieldName: string]: string
}

export interface PropertyState {
  properties: Property[]
  currentProperty: Property | null
  wizardData: WizardFormData | null
  originalWizardData: WizardFormData | null // Baseline data for change detection
  
  // Form management (following RatePlanManager pattern)
  currentForm: Property | null
  originalForm: Property | null
  hasUnsavedChanges: boolean
  formValidationErrors: Record<string, string>
  isSaving: boolean
  
  // Rate plan selection for PropertyDetail page
  selectedRatePlan: any | null // Import RatePlan type when available
  
  loading: boolean
  error: string | null
  validationErrors: ValidationErrors | null
}