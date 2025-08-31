# Villa Rental Pricing Model Documentation

## Overview

The Wezo.ae platform uses a clean, simplified pricing architecture specifically designed for villa rentals. The system separates base pricing from optional rate plan modifiers, supports both full-day and half-day bookings, and provides amenity access control without redundancy.

## Core Concepts

### 1. Base Pricing (Always Available)
- **Weekly Pricing**: Default prices for each day of the week (Monday-Sunday)
- **Half-Day Support**: Separate pricing for 4-6 hour stays alongside full-day pricing
- **Date Overrides**: Specific date pricing that overrides weekly defaults (holidays, events, peak seasons)
- **Guaranteed Availability**: Every property always has a base price, rate plans are optional

### 2. Rate Plans as Optional Modifiers
- **Price Adjustments**: Apply percentage or fixed amount changes to base pricing
- **Amenity Access Control**: Include/exclude property amenities in rate plans
- **Booking Conditions**: Set restrictions like minimum stay, advance booking, guest limits
- **Cancellation Policies**: Flexible, moderate, or non-refundable terms

### 3. Villa-Focused Architecture
- **Property Amenities**: Single source of truth for all villa amenities (pool, gym, WiFi, parking, spa, etc.)
- **Amenity-Based Rate Plans**: Rate plans reference existing property amenities instead of duplicating them
- **No Hotel Features**: No meal services, room service, or hotel-specific amenities
- **House Rules Only**: Custom property rules without redundant policy text fields

### 4. Pricing Calculation Flow
```
1. Get Base Price (weekly default or date override)
   ↓
2. Select Duration (full-day or half-day)
   ↓  
3. Apply Rate Plan Modifier (if selected)
   ↓
4. Determine Amenity Access (based on rate plan)
   ↓
5. Final Price + Clear Amenity Access for Guest
```

## Database Schema

### Core Models

```prisma
// Base weekly and half-day pricing
model PropertyPricing {
  id         String   @id @default(uuid())
  propertyId String   @unique
  property   Property @relation(fields: [propertyId], references: [propertyId])
  
  // Full day prices for each day of week
  priceMonday    Decimal @db.Decimal(10, 2)
  priceTuesday   Decimal @db.Decimal(10, 2)
  priceWednesday Decimal @db.Decimal(10, 2)
  priceThursday  Decimal @db.Decimal(10, 2)
  priceFriday    Decimal @db.Decimal(10, 2)
  priceSaturday  Decimal @db.Decimal(10, 2)
  priceSunday    Decimal @db.Decimal(10, 2)
  
  // Half day prices for each day of week (4-6 hours)
  halfDayPriceMonday    Decimal @db.Decimal(10, 2)
  halfDayPriceTuesday   Decimal @db.Decimal(10, 2)
  halfDayPriceWednesday Decimal @db.Decimal(10, 2)
  halfDayPriceThursday  Decimal @db.Decimal(10, 2)
  halfDayPriceFriday    Decimal @db.Decimal(10, 2)
  halfDayPriceSaturday  Decimal @db.Decimal(10, 2)
  halfDayPriceSunday    Decimal @db.Decimal(10, 2)
  
  currency  Currency @default(AED)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Date-specific price overrides
model DatePriceOverride {
  id         String   @id @default(uuid())
  propertyId String
  property   Property @relation(fields: [propertyId], references: [propertyId])
  
  date         DateTime @db.Date
  price        Decimal  @db.Decimal(10, 2)  // Full day override
  halfDayPrice Decimal? @db.Decimal(10, 2)  // Half day override (optional)
  reason       String?  // "New Year's Eve", "F1 Race Weekend"
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([propertyId, date])
}

// Rate plans as pricing modifiers
model RatePlan {
  id         String   @id @default(uuid())
  propertyId String
  property   Property @relation(fields: [propertyId], references: [propertyId])
  
  name        String   // "Standard Rate", "Non-Refundable", "All-Access"
  description String?
  
  // Price modifier
  priceModifierType  ModifierType @default(Percentage) // Percentage or FixedAmount
  priceModifierValue Float        @default(0)          // -20 = 20% off, +50 = 50 AED extra
  
  // Booking conditions (integrated directly)
  minStay           Int? // Minimum nights
  maxStay           Int? // Maximum nights
  minAdvanceBooking Int? // Days before arrival
  maxAdvanceBooking Int? // Max days before arrival
  minGuests         Int? // Minimum guests
  maxGuests         Int? // Maximum guests
  
  // Control
  isActive  Boolean @default(true)
  isDefault Boolean @default(false)
  priority  Int     @default(100)
  
  // Relations
  features           RatePlanFeatures?
  cancellationPolicy CancellationPolicy?
  reservations       Reservation[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Amenity access control
model RatePlanFeatures {
  id         String   @id @default(uuid())
  ratePlanId String   @unique
  ratePlan   RatePlan @relation(fields: [ratePlanId], references: [id])
  
  // Property amenity references (no duplication)
  includedAmenityIds String[] @default([]) // References Property.amenities[].id
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Simple cancellation policies
model CancellationPolicy {
  id         String            @id @default(uuid())
  ratePlanId String            @unique
  ratePlan   RatePlan          @relation(fields: [ratePlanId], references: [id])
  
  type                 CancellationType @default(FullyFlexible)
  freeCancellationDays Int?  // Days before arrival for 100% refund
  partialRefundDays    Int?  // Days before arrival for 50% refund (Moderate only)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Enums
enum ModifierType {
  Percentage   // -20 = 20% discount, +10 = 10% surcharge
  FixedAmount  // -50 = 50 AED discount, +100 = 100 AED surcharge
}

enum CancellationType {
  FullyFlexible   // Full refund based on days before check-in
  Moderate        // Partial refund based on days before check-in
  NonRefundable   // No refund under any circumstances
}
```

## Pricing Examples and Scenarios

### Scenario 1: Luxury Villa with Pool and Gym

#### Property Setup
```typescript
const villa = {
  id: "villa_001",
  name: "Luxury Dubai Villa",
  
  // Base weekly pricing
  pricing: {
    // Full day prices
    priceMonday: 400,      // Weekday rate
    priceTuesday: 400,
    priceWednesday: 400,
    priceThursday: 400,
    priceFriday: 600,      // Weekend premium
    priceSaturday: 700,    // Peak weekend
    priceSunday: 550,
    
    // Half day prices (typically 60-70% of full day)
    halfDayPriceMonday: 280,
    halfDayPriceTuesday: 280,
    halfDayPriceWednesday: 280,
    halfDayPriceThursday: 280,
    halfDayPriceFriday: 420,
    halfDayPriceSaturday: 490,
    halfDayPriceSunday: 385
  },
  
  // Property amenities (single source of truth)
  amenities: [
    { id: 'wifi', name: 'Free WiFi', category: 'Technology' },
    { id: 'pool', name: 'Private Pool', category: 'Recreation' },
    { id: 'gym', name: 'Home Gym', category: 'Fitness' },
    { id: 'parking', name: 'Private Parking', category: 'Services' },
    { id: 'spa', name: 'Private Spa', category: 'Wellness' },
    { id: 'kitchen', name: 'Fully Equipped Kitchen', category: 'Amenities' },
    { id: 'balcony', name: 'Ocean View Balcony', category: 'Views' }
  ],
  
  // Holiday pricing overrides
  dateOverrides: [
    {
      date: "2024-12-31", // New Year's Eve
      price: 1200,        // Full day
      halfDayPrice: 800,  // Half day
      reason: "New Year's Eve Premium"
    },
    {
      date: "2024-12-25", // Christmas
      price: 1000,
      halfDayPrice: 700,
      reason: "Christmas Day"
    }
  ]
}
```

#### Rate Plan Options
```typescript
const ratePlans = [
  {
    name: "Essential Stay",
    description: "Basic villa access with essential amenities",
    priceModifierType: 'Percentage',
    priceModifierValue: -25,  // 25% discount
    features: {
      includedAmenityIds: ['wifi', 'parking', 'kitchen']  // Basic amenities only
    },
    minStay: 3,  // Minimum 3 nights for discount
    cancellationPolicy: {
      type: 'NonRefundable'  // No refunds for discount rate
    }
  },
  
  {
    name: "Standard Villa",
    description: "Complete villa experience with most amenities",
    priceModifierType: 'Percentage',
    priceModifierValue: 0,  // No price change
    features: {
      includedAmenityIds: ['wifi', 'parking', 'kitchen', 'pool', 'balcony']
    },
    isDefault: true,  // Auto-selected option
    cancellationPolicy: {
      type: 'Moderate',
      freeCancellationDays: 7,  // Free cancellation up to 7 days
      partialRefundDays: 3      // 50% refund up to 3 days
    }
  },
  
  {
    name: "Luxury All-Access",
    description: "Premium experience with all amenities and flexibility",
    priceModifierType: 'Percentage',
    priceModifierValue: 30,  // 30% premium
    features: {
      includedAmenityIds: ['wifi', 'parking', 'kitchen', 'pool', 'gym', 'spa', 'balcony']  // Everything
    },
    cancellationPolicy: {
      type: 'FullyFlexible',
      freeCancellationDays: 1  // Free cancellation until 1 day before
    }
  },
  
  {
    name: "Weekend Escape",
    description: "Perfect for short weekend getaways",
    priceModifierType: 'Percentage',
    priceModifierValue: -10,  // 10% discount
    features: {
      includedAmenityIds: ['wifi', 'parking', 'kitchen', 'pool']
    },
    minStay: 2,
    maxStay: 3,  // Weekend stays only
    cancellationPolicy: {
      type: 'Moderate',
      freeCancellationDays: 5,
      partialRefundDays: 2
    }
  },
  
  {
    name: "Early Bird Special",
    description: "Fixed discount for bookings made 30+ days in advance",
    priceModifierType: 'FixedAmount',
    priceModifierValue: -100,  // 100 AED discount per night
    features: {
      includedAmenityIds: ['wifi', 'parking', 'kitchen', 'pool', 'balcony']
    },
    minAdvanceBooking: 30,  // Must book at least 30 days ahead
    cancellationPolicy: {
      type: 'Moderate',
      freeCancellationDays: 14,
      partialRefundDays: 7
    }
  },
  
  {
    name: "Local Resident Rate",
    description: "Special fixed rate for UAE residents",
    priceModifierType: 'FixedAmount',
    priceModifierValue: -150,  // 150 AED discount per night
    features: {
      includedAmenityIds: ['wifi', 'parking', 'kitchen', 'pool']
    },
    cancellationPolicy: {
      type: 'FullyFlexible',
      freeCancellationDays: 3
    }
  }
]
```

### Guest Booking Flow Examples

#### Example 1: Weekday Full-Day Booking
**Guest Search**: Tuesday-Thursday (2 nights), 4 guests

**Base Price Calculation**:
- Tuesday (full day): 400 AED
- Wednesday (full day): 400 AED
- **Base Total**: 800 AED

**Available Rate Plan Options** (sorted by price):
```typescript
[
  {
    ratePlan: "Essential Stay",
    totalPrice: 600,      // 800 × 0.75 (25% off)
    pricePerNight: 300,
    savings: 200,
    amenitiesIncluded: ["WiFi", "Parking", "Kitchen"],
    amenitiesExtraCost: ["Pool", "Gym", "Spa", "Balcony"],
    cancellation: "Non-refundable",
    restrictions: "Minimum 3 nights" // NOT ELIGIBLE - only 2 nights
  },
  {
    ratePlan: "Local Resident Rate",
    totalPrice: 500,      // 800 - (150 × 2 nights) = 500 AED fixed discount
    pricePerNight: 250,
    savings: 300,
    modifierType: "Fixed Amount (-150 AED per night)",
    amenitiesIncluded: ["WiFi", "Parking", "Kitchen", "Pool"],
    amenitiesExtraCost: ["Gym", "Spa", "Balcony"],
    cancellation: "Free until 3 days before",
    restrictions: "UAE residents only"
  },
  {
    ratePlan: "Weekend Escape", 
    totalPrice: 720,      // 800 × 0.9 (10% off)
    pricePerNight: 360,
    savings: 80,
    modifierType: "Percentage (-10%)",
    amenitiesIncluded: ["WiFi", "Parking", "Kitchen", "Pool"],
    amenitiesExtraCost: ["Gym", "Spa", "Balcony"],
    cancellation: "Free until 5 days before",
    restrictions: "2-3 nights only" // ELIGIBLE
  },
  {
    ratePlan: "Standard Villa",
    totalPrice: 800,      // Base price
    pricePerNight: 400,
    savings: 0,
    modifierType: "Percentage (0%)",
    amenitiesIncluded: ["WiFi", "Parking", "Kitchen", "Pool", "Balcony"],
    amenitiesExtraCost: ["Gym", "Spa"],
    cancellation: "Free until 7 days before"
  },
  {
    ratePlan: "Luxury All-Access",
    totalPrice: 1040,     // 800 × 1.3 (30% premium)
    pricePerNight: 520,
    savings: -240,
    modifierType: "Percentage (+30%)",
    amenitiesIncluded: ["All Amenities"],
    amenitiesExtraCost: [],
    cancellation: "Free until 1 day before"
  }
]
```

#### Example 2: Half-Day Weekend Booking
**Guest Search**: Saturday half-day (4-6 hours), 2 guests

**Base Price Calculation**:
- Saturday (half day): 490 AED
- **Base Total**: 490 AED

**Available Options**:
```typescript
[
  {
    ratePlan: "Weekend Escape",
    totalPrice: 441,      // 490 × 0.9 (10% off)
    duration: "Half day (4-6 hours)",
    amenitiesIncluded: ["WiFi", "Parking", "Kitchen", "Pool"],
    amenitiesExtraCost: ["Gym", "Spa", "Balcony"],
    cancellation: "Free until 5 days before",
    restrictions: "NOT ELIGIBLE - 2 night minimum"
  },
  {
    ratePlan: "Standard Villa",
    totalPrice: 490,      // Base price
    duration: "Half day (4-6 hours)",
    amenitiesIncluded: ["WiFi", "Parking", "Kitchen", "Pool", "Balcony"],
    amenitiesExtraCost: ["Gym", "Spa"],
    cancellation: "Free until 7 days before"
  },
  {
    ratePlan: "Luxury All-Access",
    totalPrice: 637,      // 490 × 1.3 (30% premium)
    duration: "Half day (4-6 hours)",
    amenitiesIncluded: ["All Amenities"],
    amenitiesExtraCost: [],
    cancellation: "Free until 1 day before"
  }
]
```

#### Example 3: Holiday Premium Booking
**Guest Search**: New Year's Eve (Dec 31), full day, 6 guests

**Base Price Calculation**:
- December 31 (date override): 1200 AED (instead of Sunday 550 AED)
- **Base Total**: 1200 AED

**Available Options**:
```typescript
[
  {
    ratePlan: "Standard Villa",
    totalPrice: 1200,     // Base holiday price
    pricePerNight: 1200,
    amenitiesIncluded: ["WiFi", "Parking", "Kitchen", "Pool", "Balcony"],
    amenitiesExtraCost: ["Gym", "Spa"],
    cancellation: "Free until 7 days before",
    note: "New Year's Eve Premium Pricing"
  },
  {
    ratePlan: "Luxury All-Access", 
    totalPrice: 1560,     // 1200 × 1.3 (30% premium)
    pricePerNight: 1560,
    amenitiesIncluded: ["All Amenities"],
    amenitiesExtraCost: [],
    cancellation: "Free until 1 day before",
    note: "Ultimate New Year's Experience"
  }
]
```

### Scenario 2: Budget Beach Villa

#### Property Setup
```typescript
const beachVilla = {
  id: "villa_002", 
  name: "Cozy Beach Villa",
  
  // More affordable weekly pricing
  pricing: {
    // Full day prices
    priceMonday: 180,
    priceTuesday: 180, 
    priceWednesday: 180,
    priceThursday: 180,
    priceFriday: 250,
    priceSaturday: 300,
    priceSunday: 220,
    
    // Half day prices
    halfDayPriceMonday: 120,
    halfDayPriceTuesday: 120,
    halfDayPriceWednesday: 120, 
    halfDayPriceThursday: 120,
    halfDayPriceFriday: 175,
    halfDayPriceSaturday: 210,
    halfDayPriceSunday: 154
  },
  
  // Simpler amenities
  amenities: [
    { id: 'wifi', name: 'WiFi', category: 'Technology' },
    { id: 'parking', name: 'Free Parking', category: 'Services' },
    { id: 'kitchen', name: 'Kitchen', category: 'Amenities' },
    { id: 'beach_access', name: 'Direct Beach Access', category: 'Location' },
    { id: 'terrace', name: 'Sea View Terrace', category: 'Views' }
  ]
}
```

#### Simplified Rate Plans
```typescript
const budgetRatePlans = [
  {
    name: "Beach Basic",
    description: "Essential beach villa experience",
    priceModifierType: 'Percentage',
    priceModifierValue: -15,  // 15% discount
    features: {
      includedAmenityIds: ['wifi', 'parking', 'kitchen']  // No beach access or terrace
    },
    minStay: 5,  // Longer stay for discount
    cancellationPolicy: { type: 'NonRefundable' }
  },
  
  {
    name: "Full Beach Access",
    description: "Complete beach villa with all amenities", 
    priceModifierType: 'Percentage',
    priceModifierValue: 0,  // Standard price
    features: {
      includedAmenityIds: ['wifi', 'parking', 'kitchen', 'beach_access', 'terrace']  // Everything
    },
    isDefault: true,
    cancellationPolicy: {
      type: 'Moderate',
      freeCancellationDays: 3,
      partialRefundDays: 1
    }
  }
]
```

## Service Layer Implementation

### PropertyPricingService

```typescript
class PropertyPricingService {
  /**
   * Get base price for any date and duration
   */
  async getBasePrice(
    propertyId: string, 
    date: Date, 
    isHalfDay: boolean = false
  ): Promise<number> {
    // 1. Check for date-specific override
    const override = await prisma.datePriceOverride.findUnique({
      where: {
        propertyId_date: { propertyId, date }
      }
    })
    
    if (override) {
      if (isHalfDay) {
        // Use half-day override or fallback to 70% of full day
        return Number(override.halfDayPrice) || (Number(override.price) * 0.7)
      }
      return Number(override.price)
    }
    
    // 2. Use weekly base pricing
    const dayOfWeek = date.getDay()
    const pricing = await prisma.propertyPricing.findUnique({
      where: { propertyId }
    })
    
    if (!pricing) {
      throw new Error('No base pricing configured for property')
    }
    
    const dayPriceMap = {
      0: isHalfDay ? pricing.halfDayPriceSunday : pricing.priceSunday,
      1: isHalfDay ? pricing.halfDayPriceMonday : pricing.priceMonday,
      2: isHalfDay ? pricing.halfDayPriceTuesday : pricing.priceTuesday,
      3: isHalfDay ? pricing.halfDayPriceWednesday : pricing.priceWednesday,
      4: isHalfDay ? pricing.halfDayPriceThursday : pricing.priceThursday,
      5: isHalfDay ? pricing.halfDayPriceFriday : pricing.priceFriday,
      6: isHalfDay ? pricing.halfDayPriceSaturday : pricing.priceSaturday
    }
    
    return Number(dayPriceMap[dayOfWeek])
  }
  
  /**
   * Set weekly pricing for both full-day and half-day
   */
  async setWeeklyPricing(
    propertyId: string,
    prices: {
      // Full day prices
      monday: number, tuesday: number, wednesday: number, thursday: number,
      friday: number, saturday: number, sunday: number,
      // Half day prices  
      halfDayMonday: number, halfDayTuesday: number, halfDayWednesday: number,
      halfDayThursday: number, halfDayFriday: number, halfDaySaturday: number, halfDaySunday: number
    }
  ) {
    return await prisma.propertyPricing.upsert({
      where: { propertyId },
      create: { propertyId, ...prices },
      update: prices
    })
  }
  
  /**
   * Set holiday/event date overrides
   */
  async setDateOverrides(
    propertyId: string,
    overrides: Array<{
      date: Date
      price: number          // Full day price
      halfDayPrice?: number  // Optional half day price
      reason?: string
    }>
  ) {
    await prisma.$transaction(
      overrides.map(override =>
        prisma.datePriceOverride.upsert({
          where: {
            propertyId_date: { propertyId, date: override.date }
          },
          create: {
            propertyId,
            date: override.date,
            price: override.price,
            halfDayPrice: override.halfDayPrice,
            reason: override.reason
          },
          update: {
            price: override.price,
            halfDayPrice: override.halfDayPrice,
            reason: override.reason
          }
        })
      )
    )
  }
}
```

### BookingCalculatorService

```typescript
class BookingCalculatorService {
  /**
   * Calculate all available booking options
   */
  async calculateBookingOptions(criteria: {
    propertyId: string
    checkInDate: Date
    checkOutDate?: Date  // Optional for half-day bookings
    isHalfDay?: boolean
    guestCount: number
  }) {
    const { propertyId, checkInDate, checkOutDate, isHalfDay = false, guestCount } = criteria
    
    // Calculate base pricing
    let baseTotal = 0
    const dates = isHalfDay ? [checkInDate] : getDateRange(checkInDate, checkOutDate!)
    
    for (const date of dates) {
      const dayPrice = await pricingService.getBasePrice(propertyId, date, isHalfDay)
      baseTotal += dayPrice
    }
    
    // Get property amenities
    const property = await prisma.property.findUnique({
      where: { propertyId },
      include: { amenities: true }
    })
    
    // Get eligible rate plans
    const ratePlans = await prisma.ratePlan.findMany({
      where: { 
        propertyId, 
        isActive: true 
      },
      include: { 
        features: true, 
        cancellationPolicy: true 
      }
    })
    
    // Filter eligible rate plans based on restrictions
    const eligiblePlans = ratePlans.filter(plan => {
      const nights = isHalfDay ? 1 : Math.ceil((checkOutDate!.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (plan.minStay && nights < plan.minStay) return false
      if (plan.maxStay && nights > plan.maxStay) return false
      if (plan.minGuests && guestCount < plan.minGuests) return false
      if (plan.maxGuests && guestCount > plan.maxGuests) return false
      // Add more restriction checks...
      
      return true
    })
    
    // Calculate pricing for each rate plan
    const options = eligiblePlans.map(plan => {
      // Apply price modifier
      let finalPrice = baseTotal
      if (plan.priceModifierType === 'Percentage') {
        finalPrice = baseTotal * (1 + plan.priceModifierValue / 100)
      } else {
        finalPrice = baseTotal + plan.priceModifierValue
      }
      
      // Get included amenities
      const includedAmenities = property!.amenities.filter(amenity =>
        plan.features?.includedAmenityIds.includes(amenity.id)
      )
      
      const excludedAmenities = property!.amenities.filter(amenity =>
        !plan.features?.includedAmenityIds.includes(amenity.id)
      )
      
      return {
        ratePlan: {
          id: plan.id,
          name: plan.name,
          description: plan.description
        },
        pricing: {
          totalPrice: Math.round(finalPrice),
          basePrice: baseTotal,
          modifier: plan.priceModifierValue,
          savings: baseTotal - finalPrice
        },
        duration: {
          isHalfDay,
          nights: isHalfDay ? 0 : dates.length
        },
        amenities: {
          included: includedAmenities.map(a => ({ id: a.id, name: a.name, category: a.category })),
          extraCost: excludedAmenities.map(a => ({ id: a.id, name: a.name, category: a.category }))
        },
        cancellation: {
          type: plan.cancellationPolicy?.type || 'FullyFlexible',
          freeCancellationDays: plan.cancellationPolicy?.freeCancellationDays,
          partialRefundDays: plan.cancellationPolicy?.partialRefundDays
        },
        restrictions: {
          minStay: plan.minStay,
          maxStay: plan.maxStay,
          minGuests: plan.minGuests,
          maxGuests: plan.maxGuests
        }
      }
    })
    
    // Sort by price (cheapest first)
    options.sort((a, b) => a.pricing.totalPrice - b.pricing.totalPrice)
    
    return {
      property: {
        id: property!.propertyId,
        name: property!.name
      },
      booking: {
        checkIn: checkInDate,
        checkOut: checkOutDate,
        isHalfDay,
        guests: guestCount
      },
      basePricing: {
        total: baseTotal,
        breakdown: dates.map(async date => ({
          date,
          price: await pricingService.getBasePrice(propertyId, date, isHalfDay)
        }))
      },
      options
    }
  }
}
```

## API Endpoints

### Property Pricing Management

```typescript
// Set weekly base pricing
PUT /api/properties/:id/pricing/weekly
{
  "fullDay": {
    "monday": 300, "tuesday": 300, "wednesday": 300, "thursday": 300,
    "friday": 450, "saturday": 500, "sunday": 400
  },
  "halfDay": {
    "monday": 200, "tuesday": 200, "wednesday": 200, "thursday": 200,
    "friday": 315, "saturday": 350, "sunday": 280
  }
}

// Set holiday/event overrides
POST /api/properties/:id/pricing/overrides
{
  "overrides": [
    {
      "date": "2024-12-31",
      "price": 1200,        // Full day
      "halfDayPrice": 800,  // Half day
      "reason": "New Year's Eve"
    }
  ]
}

// Get pricing calendar
GET /api/properties/:id/pricing/calendar?year=2024&month=12
{
  "year": 2024,
  "month": 12,
  "days": [
    {
      "date": "2024-12-01",
      "fullDayPrice": 400,
      "halfDayPrice": 280,
      "isOverride": false,
      "dayOfWeek": "Sunday"
    },
    {
      "date": "2024-12-31",
      "fullDayPrice": 1200,
      "halfDayPrice": 800,
      "isOverride": true,
      "reason": "New Year's Eve"
    }
  ]
}
```

### Rate Plan Management

```typescript
// Create rate plan with amenity references
POST /api/properties/:id/rate-plans
{
  "name": "All-Access Premium",
  "description": "Complete villa experience with all amenities",
  "priceModifierType": "Percentage",
  "priceModifierValue": 25,  // 25% premium
  "minStay": 2,
  "features": {
    "includedAmenityIds": ["wifi", "pool", "gym", "spa", "parking", "kitchen"]
  },
  "cancellationPolicy": {
    "type": "FullyFlexible",
    "freeCancellationDays": 3
  }
}

// List rate plans with amenity details
GET /api/properties/:id/rate-plans
{
  "ratePlans": [
    {
      "id": "rp_001",
      "name": "Standard Villa",
      "priceModifierType": "Percentage",
      "priceModifierValue": 0,
      "features": {
        "includedAmenityIds": ["wifi", "parking", "kitchen", "pool"],
        "includedAmenities": [
          { "id": "wifi", "name": "Free WiFi", "category": "Technology" },
          { "id": "parking", "name": "Free Parking", "category": "Services" },
          { "id": "kitchen", "name": "Full Kitchen", "category": "Amenities" },
          { "id": "pool", "name": "Private Pool", "category": "Recreation" }
        ],
        "excludedAmenities": [
          { "id": "gym", "name": "Home Gym", "category": "Fitness" },
          { "id": "spa", "name": "Private Spa", "category": "Wellness" }
        ]
      }
    }
  ]
}
```

### Booking Calculation

```typescript
// Calculate full-day booking options
POST /api/properties/:id/calculate-booking
{
  "checkInDate": "2024-12-20",
  "checkOutDate": "2024-12-23",
  "guestCount": 4,
  "isHalfDay": false
}

// Response
{
  "property": {
    "id": "villa_001",
    "name": "Luxury Dubai Villa"
  },
  "booking": {
    "checkIn": "2024-12-20",
    "checkOut": "2024-12-23", 
    "nights": 3,
    "guests": 4,
    "isHalfDay": false
  },
  "basePricing": {
    "total": 1500,
    "breakdown": [
      { "date": "2024-12-20", "dayOfWeek": "Friday", "price": 600 },
      { "date": "2024-12-21", "dayOfWeek": "Saturday", "price": 700 },
      { "date": "2024-12-22", "dayOfWeek": "Sunday", "price": 550 }
    ]
  },
  "options": [
    {
      "ratePlan": {
        "id": "rp_essential",
        "name": "Essential Stay",
        "description": "Basic villa with essential amenities"
      },
      "pricing": {
        "totalPrice": 1125,  // 1500 × 0.75 (25% off)
        "basePrice": 1500,
        "modifier": -25,
        "savings": 375,
        "pricePerNight": 375
      },
      "amenities": {
        "included": [
          { "id": "wifi", "name": "Free WiFi", "category": "Technology" },
          { "id": "parking", "name": "Free Parking", "category": "Services" },
          { "id": "kitchen", "name": "Full Kitchen", "category": "Amenities" }
        ],
        "extraCost": [
          { "id": "pool", "name": "Private Pool", "category": "Recreation" },
          { "id": "gym", "name": "Home Gym", "category": "Fitness" },
          { "id": "spa", "name": "Private Spa", "category": "Wellness" }
        ]
      },
      "cancellation": {
        "type": "NonRefundable",
        "description": "No refunds allowed"
      },
      "restrictions": {
        "minStay": 3,
        "message": "Minimum 3-night stay required"
      }
    },
    {
      "ratePlan": {
        "id": "rp_standard",
        "name": "Standard Villa",
        "description": "Complete villa experience"
      },
      "pricing": {
        "totalPrice": 1500,  // Base price
        "basePrice": 1500,
        "modifier": 0,
        "savings": 0,
        "pricePerNight": 500
      },
      "amenities": {
        "included": [
          { "id": "wifi", "name": "Free WiFi", "category": "Technology" },
          { "id": "parking", "name": "Free Parking", "category": "Services" },
          { "id": "kitchen", "name": "Full Kitchen", "category": "Amenities" },
          { "id": "pool", "name": "Private Pool", "category": "Recreation" },
          { "id": "balcony", "name": "Ocean View Balcony", "category": "Views" }
        ],
        "extraCost": [
          { "id": "gym", "name": "Home Gym", "category": "Fitness" },
          { "id": "spa", "name": "Private Spa", "category": "Wellness" }
        ]
      },
      "cancellation": {
        "type": "Moderate",
        "freeCancellationDays": 7,
        "partialRefundDays": 3,
        "description": "Free cancellation up to 7 days before check-in"
      }
    }
  ]
}

// Calculate half-day booking options  
POST /api/properties/:id/calculate-booking
{
  "checkInDate": "2024-12-21",  // Saturday
  "guestCount": 2,
  "isHalfDay": true,
  "duration": "4-6 hours"
}

// Response
{
  "booking": {
    "checkIn": "2024-12-21",
    "guests": 2,
    "isHalfDay": true,
    "duration": "4-6 hours"
  },
  "basePricing": {
    "total": 490,  // Saturday half-day price
    "breakdown": [
      { "date": "2024-12-21", "dayOfWeek": "Saturday", "price": 490, "duration": "Half day" }
    ]
  },
  "options": [
    {
      "ratePlan": {
        "name": "Standard Villa",
        "description": "4-6 hour villa access with core amenities"
      },
      "pricing": {
        "totalPrice": 490,
        "duration": "Half day (4-6 hours)"
      },
      "amenities": {
        "included": ["WiFi", "Parking", "Kitchen", "Pool", "Balcony"],
        "extraCost": ["Gym", "Spa"]
      }
    }
  ]
}
```

## Migration from Old System

### Data Migration Strategy

```typescript
// Migrate existing rate plans to new structure
async function migrateExistingData() {
  const properties = await prisma.property.findMany({
    include: { ratePlans: true }
  })
  
  for (const property of properties) {
    // 1. Create base weekly pricing from lowest-priced FixedPrice rate plan
    const baseRatePlan = property.ratePlans.find(rp => 
      rp.adjustmentType === 'FixedPrice'
    )
    
    if (baseRatePlan) {
      const basePrice = baseRatePlan.adjustmentValue
      await prisma.propertyPricing.create({
        data: {
          propertyId: property.propertyId,
          priceMonday: basePrice,
          priceTuesday: basePrice,
          priceWednesday: basePrice,
          priceThursday: basePrice,
          priceFriday: basePrice * 1.2,     // 20% weekend markup
          priceSaturday: basePrice * 1.4,   // 40% weekend markup
          priceSunday: basePrice * 1.1,     // 10% weekend markup
          
          // Half-day pricing (70% of full day)
          halfDayPriceMonday: basePrice * 0.7,
          halfDayPriceTuesday: basePrice * 0.7,
          halfDayPriceWednesday: basePrice * 0.7,
          halfDayPriceThursday: basePrice * 0.7,
          halfDayPriceFriday: basePrice * 1.2 * 0.7,
          halfDayPriceSaturday: basePrice * 1.4 * 0.7,
          halfDayPriceSunday: basePrice * 1.1 * 0.7
        }
      })
    }
    
    // 2. Convert percentage-based rate plans to modifiers
    const percentagePlans = property.ratePlans.filter(rp => 
      rp.adjustmentType === 'Percentage'
    )
    
    for (const plan of percentagePlans) {
      await prisma.ratePlan.update({
        where: { id: plan.id },
        data: {
          priceModifierType: 'Percentage',
          priceModifierValue: plan.adjustmentValue,
          // Convert existing restrictions
          minStay: plan.ratePlanRestrictions.find(r => r.type === 'MinLengthOfStay')?.value,
          maxStay: plan.ratePlanRestrictions.find(r => r.type === 'MaxLengthOfStay')?.value,
          // ... other restrictions
          
          // Create features based on existing includes
          features: {
            create: {
              includedAmenityIds: determineIncludedAmenities(plan)
            }
          }
        }
      })
    }
    
    // 3. Clean up old models
    await prisma.price.deleteMany({ where: { ratePlan: { propertyId: property.propertyId } } })
    await prisma.ratePlanRestriction.deleteMany({ where: { ratePlan: { propertyId: property.propertyId } } })
  }
}

function determineIncludedAmenities(ratePlan: any): string[] {
  // Convert old boolean includes to amenity ID references
  const included = []
  if (ratePlan.includesBreakfast) included.push('restaurant')  // If property has restaurant
  if (ratePlan.includesWifi) included.push('wifi')
  if (ratePlan.includesParking) included.push('parking')
  // ... convert other fields
  return included
}
```

## Benefits Summary

### For Property Owners
- ✅ **Simple Pricing**: Set weekly base prices + optional date overrides
- ✅ **Half-Day Revenue**: Capture short-stay bookings for better utilization
- ✅ **Flexible Rate Plans**: Create pricing strategies as simple modifiers
- ✅ **Amenity Control**: Include/exclude amenities per rate plan
- ✅ **No Duplication**: Manage amenities in one place, reference everywhere
- ✅ **Clear Rules**: Structured booking conditions instead of free text

### For Guests
- ✅ **Transparent Pricing**: See base price + clear modifier explanations
- ✅ **Duration Options**: Choose full-day or half-day stays
- ✅ **Clear Amenities**: Know exactly what's included vs extra cost
- ✅ **Fair Comparison**: Easy to compare rate plan options
- ✅ **Flexible Cancellation**: Choose preferred cancellation terms

### For Developers
- ✅ **Clean Architecture**: Separation of concerns, no complex nested logic
- ✅ **Easy Maintenance**: Single source of truth for amenities
- ✅ **Predictable Logic**: Base price + modifier = final price
- ✅ **Villa-Focused**: No irrelevant hotel features
- ✅ **Scalable Design**: Easy to add new amenities or rate plan types

## Conclusion

This villa rental pricing architecture provides a clean, maintainable, and villa-appropriate solution for property pricing management. The separation of base pricing, half-day support, and amenity-based rate plans creates a system that is both powerful and easy to understand.

Key innovations:
- **Always-available base pricing** with weekly defaults and date overrides
- **Half-day booking support** for better property utilization
- **Amenity-based rate plans** that reference property amenities instead of duplicating them
- **Villa-focused features** without irrelevant hotel-style services
- **Clean, maintainable code** with predictable pricing calculations

This system scales well and can accommodate future requirements while maintaining simplicity and clarity for all users.