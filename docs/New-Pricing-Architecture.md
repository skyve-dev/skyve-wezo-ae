# New Pricing Architecture Documentation

## Overview

This document describes the new simplified pricing architecture for Wezo.ae that separates base pricing from rate plan modifiers. This approach provides clarity, flexibility, and predictability in property pricing management.

## Core Concepts

### 1. Base Pricing
- **Weekly Pricing**: Default prices set for each day of the week (Monday-Sunday)
- **Date Overrides**: Specific date pricing that overrides the weekly default (holidays, events, peak seasons)
- **Always Available**: Every property always has a base price, even without rate plans

### 2. Rate Plans as Modifiers
- **Optional Packages**: Rate plans are optional pricing strategies that modify the base price
- **Feature Bundles**: Include amenities, services, and benefits
- **Price Adjustments**: Apply percentage discounts or fixed amount changes to base price
- **Booking Conditions**: Set restrictions like minimum stay, advance booking requirements

### 3. Pricing Calculation Flow
```
Base Price (from weekly config or date override)
    ↓
Apply Rate Plan Modifier (if selected)
    ↓
Final Price for Guest
```

## Architecture Comparison

### Old System (Complex & Confusing)
```
RatePlan
├── Base Rate Plan (FixedPrice)
│   └── Derived Rate Plans (Percentage based)
│       └── More Derived Plans (nested complexity)
├── Date-specific Prices
├── Restrictions
├── Priority System
└── Adjustment Types (3 different types)

Problems:
- No price without a rate plan
- Rate plans doing double duty (base price + modifiers)
- Complex nested calculations
- Confusing mental model
```

### New System (Simple & Clear)
```
Property
├── Base Pricing
│   ├── Weekly Defaults (Mon-Sun)
│   └── Date Overrides (specific dates)
└── Rate Plans (all independent modifiers)
    ├── Standard (0% modifier)
    ├── Non-Refundable (-15%)
    ├── Premium Package (+25%)
    └── Early Bird Special (-20%)

Benefits:
- Always have a base price
- Rate plans are simple modifiers
- No nested complexity
- Clear mental model
```

## Database Schema

### Core Pricing Tables

```prisma
// Base pricing configuration per property
model PropertyPricing {
  id         String   @id @default(uuid())
  propertyId String   @unique
  property   Property @relation(fields: [propertyId], references: [propertyId])
  
  // Prices for each day of week
  priceMonday     Decimal @db.Decimal(10, 2)
  priceTuesday    Decimal @db.Decimal(10, 2)
  priceWednesday  Decimal @db.Decimal(10, 2)
  priceThursday   Decimal @db.Decimal(10, 2)
  priceFriday     Decimal @db.Decimal(10, 2)
  priceSaturday   Decimal @db.Decimal(10, 2)
  priceSunday     Decimal @db.Decimal(10, 2)
  
  currency   Currency @default(AED)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

// Date-specific price overrides
model DatePriceOverride {
  id         String   @id @default(uuid())
  propertyId String
  property   Property @relation(fields: [propertyId], references: [propertyId])
  
  date       DateTime @db.Date
  price      Decimal  @db.Decimal(10, 2)
  reason     String?  // "New Year's Eve", "Eid Holiday", "Peak Season"
  
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  @@unique([propertyId, date])
  @@index([date])
}

// Simplified rate plans
model RatePlan {
  id         String   @id @default(uuid())
  propertyId String
  property   Property @relation(fields: [propertyId], references: [propertyId])
  
  // Basic Information
  name        String   // "Standard Rate", "Non-Refundable", "Premium Package"
  description String?
  
  // Features & Amenities
  features    RatePlanFeatures?
  
  // Price Modifier
  priceModifierType  ModifierType  // Percentage or FixedAmount
  priceModifierValue Float         // -20 = 20% discount, +50 = add 50 AED
  
  // Booking Conditions (direct columns, no separate table)
  minStay            Int?     // Minimum nights required
  maxStay            Int?     // Maximum nights allowed
  minAdvanceBooking  Int?     // Book at least X days before arrival
  maxAdvanceBooking  Int?     // Book at most X days before arrival
  minGuests          Int?     // Minimum number of guests
  maxGuests          Int?     // Maximum number of guests
  
  // Cancellation Policy
  cancellationPolicy CancellationPolicy?
  
  // Control & Display
  isActive   Boolean  @default(true)
  priority   Int      @default(100)   // For display ordering
  isDefault  Boolean  @default(false) // Auto-selected if no choice made
  
  // Relations
  reservations Reservation[]
  
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

// What's included in the rate plan
model RatePlanFeatures {
  id         String   @id @default(uuid())
  ratePlanId String   @unique
  ratePlan   RatePlan @relation(fields: [ratePlanId], references: [id])
  
  // Meals
  includesBreakfast  Boolean @default(false)
  includesLunch      Boolean @default(false)
  includesDinner     Boolean @default(false)
  
  // Services
  includesParking        Boolean @default(false)
  includesWifi           Boolean @default(false)
  includesAirportPickup  Boolean @default(false)
  includesAirportDropoff Boolean @default(false)
  
  // Amenities
  includesSpa  Boolean @default(false)
  includesGym  Boolean @default(false)
  
  // Flexibility
  earlyCheckIn Boolean @default(false)
  lateCheckOut Boolean @default(false)
}

// Simplified cancellation policy
model CancellationPolicy {
  id         String @id @default(uuid())
  ratePlanId String @unique
  ratePlan   RatePlan @relation(fields: [ratePlanId], references: [id])
  
  type       CancellationType
  
  // For flexible cancellation types
  freeCancellationDays    Int?  // Free cancellation up to X days before
  partialRefundDays       Int?  // 50% refund up to X days before
  
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

// Enums
enum ModifierType {
  Percentage   // Percentage of base price (-20%, +10%)
  FixedAmount  // Fixed amount change (-50 AED, +100 AED)
}

enum CancellationType {
  FullyFlexible   // 100% refund based on days before arrival
  Moderate        // Partial refund based on days before arrival
  NonRefundable   // No refund under any circumstances
}

enum Currency {
  AED  // UAE Dirham
}
```

## Service Layer Design

### PropertyPricingService

```typescript
class PropertyPricingService {
  /**
   * Get base price for a specific date
   * First checks for date override, then falls back to day-of-week pricing
   */
  async getBasePrice(propertyId: string, date: Date): Promise<number> {
    // 1. Check for specific date override
    const override = await prisma.datePriceOverride.findUnique({
      where: {
        propertyId_date: {
          propertyId,
          date: date
        }
      }
    })
    
    if (override) {
      return Number(override.price)
    }
    
    // 2. Get day of week pricing
    const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, etc.
    const pricing = await prisma.propertyPricing.findUnique({
      where: { propertyId }
    })
    
    if (!pricing) {
      throw new Error('No base pricing configured for property')
    }
    
    const dayPriceMap = {
      0: pricing.priceSunday,
      1: pricing.priceMonday,
      2: pricing.priceTuesday,
      3: pricing.priceWednesday,
      4: pricing.priceThursday,
      5: pricing.priceFriday,
      6: pricing.priceSaturday
    }
    
    return Number(dayPriceMap[dayOfWeek])
  }
  
  /**
   * Set weekly pricing for all days at once
   */
  async setWeeklyPricing(
    propertyId: string, 
    prices: {
      monday: number
      tuesday: number
      wednesday: number
      thursday: number
      friday: number
      saturday: number
      sunday: number
    }
  ): Promise<PropertyPricing> {
    return await prisma.propertyPricing.upsert({
      where: { propertyId },
      create: {
        propertyId,
        priceMonday: prices.monday,
        priceTuesday: prices.tuesday,
        priceWednesday: prices.wednesday,
        priceThursday: prices.thursday,
        priceFriday: prices.friday,
        priceSaturday: prices.saturday,
        priceSunday: prices.sunday
      },
      update: {
        priceMonday: prices.monday,
        priceTuesday: prices.tuesday,
        priceWednesday: prices.wednesday,
        priceThursday: prices.thursday,
        priceFriday: prices.friday,
        priceSaturday: prices.saturday,
        priceSunday: prices.sunday
      }
    })
  }
  
  /**
   * Set price overrides for specific dates (bulk operation)
   */
  async setDateOverrides(
    propertyId: string,
    overrides: Array<{
      date: Date
      price: number
      reason?: string
    }>
  ): Promise<void> {
    // Use transaction for bulk insert/update
    await prisma.$transaction(
      overrides.map(override => 
        prisma.datePriceOverride.upsert({
          where: {
            propertyId_date: {
              propertyId,
              date: override.date
            }
          },
          create: {
            propertyId,
            date: override.date,
            price: override.price,
            reason: override.reason
          },
          update: {
            price: override.price,
            reason: override.reason
          }
        })
      )
    )
  }
  
  /**
   * Get calendar view of pricing for a month
   */
  async getMonthlyPricingCalendar(
    propertyId: string,
    year: number,
    month: number
  ): Promise<CalendarPricing> {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)
    
    // Get all overrides for the month
    const overrides = await prisma.datePriceOverride.findMany({
      where: {
        propertyId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    })
    
    // Get base weekly pricing
    const weeklyPricing = await prisma.propertyPricing.findUnique({
      where: { propertyId }
    })
    
    // Build calendar with each day's price
    const calendar = []
    for (let day = 1; day <= endDate.getDate(); day++) {
      const date = new Date(year, month - 1, day)
      const override = overrides.find(o => 
        o.date.getDate() === day
      )
      
      if (override) {
        calendar.push({
          date,
          price: Number(override.price),
          isOverride: true,
          reason: override.reason
        })
      } else {
        const basePrice = await this.getBasePrice(propertyId, date)
        calendar.push({
          date,
          price: basePrice,
          isOverride: false
        })
      }
    }
    
    return {
      year,
      month,
      days: calendar
    }
  }
}
```

### RatePlanService

```typescript
class RatePlanService {
  /**
   * Calculate final price after applying rate plan modifier
   */
  calculateFinalPrice(
    basePrice: number,
    ratePlan: RatePlan
  ): number {
    if (!ratePlan) {
      return basePrice // No rate plan = base price
    }
    
    if (ratePlan.priceModifierType === ModifierType.Percentage) {
      // Apply percentage change
      const multiplier = 1 + (ratePlan.priceModifierValue / 100)
      return basePrice * multiplier
    } else {
      // Apply fixed amount change
      return Math.max(0, basePrice + ratePlan.priceModifierValue)
    }
  }
  
  /**
   * Check if booking meets rate plan conditions
   */
  isEligible(
    ratePlan: RatePlan,
    criteria: {
      nights: number
      daysInAdvance: number
      guestCount: number
    }
  ): boolean {
    // Check minimum stay
    if (ratePlan.minStay && criteria.nights < ratePlan.minStay) {
      return false
    }
    
    // Check maximum stay
    if (ratePlan.maxStay && criteria.nights > ratePlan.maxStay) {
      return false
    }
    
    // Check advance booking requirements
    if (ratePlan.minAdvanceBooking && 
        criteria.daysInAdvance < ratePlan.minAdvanceBooking) {
      return false
    }
    
    if (ratePlan.maxAdvanceBooking && 
        criteria.daysInAdvance > ratePlan.maxAdvanceBooking) {
      return false
    }
    
    // Check guest count
    if (ratePlan.minGuests && criteria.guestCount < ratePlan.minGuests) {
      return false
    }
    
    if (ratePlan.maxGuests && criteria.guestCount > ratePlan.maxGuests) {
      return false
    }
    
    return true
  }
  
  /**
   * Get all eligible rate plans for a booking
   */
  async getEligibleRatePlans(
    propertyId: string,
    criteria: BookingCriteria
  ): Promise<RatePlan[]> {
    // Get all active rate plans
    const ratePlans = await prisma.ratePlan.findMany({
      where: {
        propertyId,
        isActive: true
      },
      include: {
        features: true,
        cancellationPolicy: true
      },
      orderBy: {
        priority: 'asc'
      }
    })
    
    // Filter by eligibility
    return ratePlans.filter(plan => 
      this.isEligible(plan, criteria)
    )
  }
}
```

### BookingCalculatorService

```typescript
class BookingCalculatorService {
  /**
   * Calculate all pricing options for a booking
   */
  async calculateBookingOptions(
    criteria: {
      propertyId: string
      checkInDate: Date
      checkOutDate: Date
      guestCount: number
    }
  ): Promise<BookingPricingOptions> {
    const nights = differenceInDays(
      criteria.checkOutDate,
      criteria.checkInDate
    )
    
    // 1. Calculate base total (sum of each night's base price)
    let baseTotal = 0
    const nightlyPrices = []
    
    for (let i = 0; i < nights; i++) {
      const date = addDays(criteria.checkInDate, i)
      const price = await pricingService.getBasePrice(
        criteria.propertyId,
        date
      )
      baseTotal += price
      nightlyPrices.push({ date, price })
    }
    
    // 2. Get eligible rate plans
    const eligibleRatePlans = await ratePlanService.getEligibleRatePlans(
      criteria.propertyId,
      {
        nights,
        daysInAdvance: differenceInDays(
          criteria.checkInDate,
          new Date()
        ),
        guestCount: criteria.guestCount
      }
    )
    
    // 3. Calculate price for each rate plan
    const options = []
    
    // Always include "No Rate Plan" option
    options.push({
      ratePlan: null,
      ratePlanName: 'Standard Rate',
      totalPrice: baseTotal,
      pricePerNight: baseTotal / nights,
      savings: 0,
      features: [],
      cancellationPolicy: 'Standard'
    })
    
    // Add each eligible rate plan
    for (const ratePlan of eligibleRatePlans) {
      const finalTotal = ratePlanService.calculateFinalPrice(
        baseTotal,
        ratePlan
      )
      
      options.push({
        ratePlan: ratePlan,
        ratePlanName: ratePlan.name,
        totalPrice: finalTotal,
        pricePerNight: finalTotal / nights,
        savings: baseTotal - finalTotal,
        features: ratePlan.features,
        cancellationPolicy: ratePlan.cancellationPolicy
      })
    }
    
    // 4. Sort by price (cheapest first)
    options.sort((a, b) => a.totalPrice - b.totalPrice)
    
    return {
      checkIn: criteria.checkInDate,
      checkOut: criteria.checkOutDate,
      nights,
      guestCount: criteria.guestCount,
      baseTotal,
      nightlyBreakdown: nightlyPrices,
      options
    }
  }
  
  /**
   * Calculate refund based on cancellation policy
   */
  async calculateCancellationRefund(
    reservationId: string,
    cancellationDate: Date
  ): Promise<RefundCalculation> {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        ratePlan: {
          include: {
            cancellationPolicy: true
          }
        }
      }
    })
    
    if (!reservation) {
      throw new Error('Reservation not found')
    }
    
    const daysUntilCheckIn = differenceInDays(
      reservation.checkInDate,
      cancellationDate
    )
    
    const policy = reservation.ratePlan?.cancellationPolicy
    
    if (!policy) {
      // Default policy - full refund if 7+ days before
      if (daysUntilCheckIn >= 7) {
        return {
          refundAmount: reservation.totalPrice,
          refundPercentage: 100,
          description: 'Full refund (7+ days before check-in)'
        }
      } else {
        return {
          refundAmount: 0,
          refundPercentage: 0,
          description: 'No refund (less than 7 days before check-in)'
        }
      }
    }
    
    // Apply specific cancellation policy
    switch (policy.type) {
      case CancellationType.NonRefundable:
        return {
          refundAmount: 0,
          refundPercentage: 0,
          description: 'Non-refundable rate'
        }
        
      case CancellationType.FullyFlexible:
        if (daysUntilCheckIn >= policy.freeCancellationDays) {
          return {
            refundAmount: reservation.totalPrice,
            refundPercentage: 100,
            description: `Full refund (${daysUntilCheckIn} days before check-in)`
          }
        } else {
          return {
            refundAmount: 0,
            refundPercentage: 0,
            description: `No refund (less than ${policy.freeCancellationDays} days before check-in)`
          }
        }
        
      case CancellationType.Moderate:
        if (daysUntilCheckIn >= policy.freeCancellationDays) {
          return {
            refundAmount: reservation.totalPrice,
            refundPercentage: 100,
            description: `Full refund (${daysUntilCheckIn} days before check-in)`
          }
        } else if (daysUntilCheckIn >= policy.partialRefundDays) {
          const refundAmount = reservation.totalPrice * 0.5
          return {
            refundAmount,
            refundPercentage: 50,
            description: `50% refund (${daysUntilCheckIn} days before check-in)`
          }
        } else {
          return {
            refundAmount: 0,
            refundPercentage: 0,
            description: `No refund (less than ${policy.partialRefundDays} days before check-in)`
          }
        }
    }
  }
}
```

## API Endpoints

### Property Pricing Management

#### Get Weekly Pricing
```http
GET /api/properties/:propertyId/pricing/weekly

Response:
{
  "propertyId": "prop_123",
  "currency": "AED",
  "prices": {
    "monday": 200,
    "tuesday": 200,
    "wednesday": 200,
    "thursday": 200,
    "friday": 250,
    "saturday": 300,
    "sunday": 250
  }
}
```

#### Update Weekly Pricing
```http
PUT /api/properties/:propertyId/pricing/weekly

Request Body:
{
  "prices": {
    "monday": 220,
    "tuesday": 220,
    "wednesday": 220,
    "thursday": 220,
    "friday": 280,
    "saturday": 350,
    "sunday": 280
  }
}
```

#### Get Calendar Pricing
```http
GET /api/properties/:propertyId/pricing/calendar?year=2024&month=12

Response:
{
  "year": 2024,
  "month": 12,
  "days": [
    {
      "date": "2024-12-01",
      "price": 250,
      "isOverride": false,
      "dayOfWeek": "Sunday"
    },
    {
      "date": "2024-12-25",
      "price": 500,
      "isOverride": true,
      "reason": "Christmas Day"
    },
    {
      "date": "2024-12-31",
      "price": 750,
      "isOverride": true,
      "reason": "New Year's Eve"
    }
  ]
}
```

#### Set Date Overrides
```http
POST /api/properties/:propertyId/pricing/overrides

Request Body:
{
  "overrides": [
    {
      "date": "2024-12-25",
      "price": 500,
      "reason": "Christmas Day"
    },
    {
      "date": "2024-12-31",
      "price": 750,
      "reason": "New Year's Eve"
    }
  ]
}
```

#### Delete Date Overrides
```http
DELETE /api/properties/:propertyId/pricing/overrides

Request Body:
{
  "dates": ["2024-12-25", "2024-12-31"]
}
```

### Rate Plan Management

#### List Rate Plans
```http
GET /api/properties/:propertyId/rate-plans

Response:
{
  "ratePlans": [
    {
      "id": "rp_001",
      "name": "Standard Rate",
      "description": "Flexible cancellation",
      "priceModifierType": "Percentage",
      "priceModifierValue": 0,
      "isActive": true,
      "isDefault": true,
      "features": {
        "includesBreakfast": false,
        "includesParking": true,
        "includesWifi": true
      },
      "cancellationPolicy": {
        "type": "FullyFlexible",
        "freeCancellationDays": 7
      }
    },
    {
      "id": "rp_002",
      "name": "Non-Refundable Special",
      "description": "Save 15% with no refund policy",
      "priceModifierType": "Percentage",
      "priceModifierValue": -15,
      "isActive": true,
      "minStay": 2,
      "features": {
        "includesBreakfast": false,
        "includesParking": true,
        "includesWifi": true
      },
      "cancellationPolicy": {
        "type": "NonRefundable"
      }
    }
  ]
}
```

#### Create Rate Plan
```http
POST /api/properties/:propertyId/rate-plans

Request Body:
{
  "name": "Early Bird Special",
  "description": "Book 30 days in advance and save 20%",
  "priceModifierType": "Percentage",
  "priceModifierValue": -20,
  "minAdvanceBooking": 30,
  "features": {
    "includesBreakfast": true,
    "includesParking": true,
    "includesWifi": true
  },
  "cancellationPolicy": {
    "type": "Moderate",
    "freeCancellationDays": 14,
    "partialRefundDays": 7
  }
}
```

#### Update Rate Plan
```http
PUT /api/properties/:propertyId/rate-plans/:ratePlanId

Request Body:
{
  "name": "Updated Early Bird",
  "priceModifierValue": -25,
  "minAdvanceBooking": 21
}
```

#### Delete Rate Plan
```http
DELETE /api/properties/:propertyId/rate-plans/:ratePlanId

Response:
{
  "success": true,
  "message": "Rate plan deleted successfully"
}
```

### Booking Price Calculation

#### Calculate Booking Options
```http
POST /api/properties/:propertyId/calculate-price

Request Body:
{
  "checkInDate": "2024-12-20",
  "checkOutDate": "2024-12-25",
  "guestCount": 2
}

Response:
{
  "checkIn": "2024-12-20",
  "checkOut": "2024-12-25",
  "nights": 5,
  "guestCount": 2,
  "baseTotal": 1250,
  "nightlyBreakdown": [
    { "date": "2024-12-20", "price": 250 },
    { "date": "2024-12-21", "price": 300 },
    { "date": "2024-12-22", "price": 250 },
    { "date": "2024-12-23", "price": 200 },
    { "date": "2024-12-24", "price": 250 }
  ],
  "options": [
    {
      "ratePlanName": "Non-Refundable Special",
      "totalPrice": 1062.50,
      "pricePerNight": 212.50,
      "savings": 187.50,
      "features": {
        "includesBreakfast": false,
        "includesParking": true
      },
      "cancellationPolicy": {
        "type": "NonRefundable"
      }
    },
    {
      "ratePlanName": "Standard Rate",
      "totalPrice": 1250,
      "pricePerNight": 250,
      "savings": 0,
      "features": {
        "includesParking": true
      },
      "cancellationPolicy": {
        "type": "FullyFlexible",
        "freeCancellationDays": 7
      }
    }
  ]
}
```

## Migration Plan

### Phase 1: Database Migration

1. **Create new tables**
   ```sql
   -- Create PropertyPricing table
   CREATE TABLE property_pricing (
     id UUID PRIMARY KEY,
     property_id UUID UNIQUE REFERENCES properties(property_id),
     price_monday DECIMAL(10,2),
     price_tuesday DECIMAL(10,2),
     price_wednesday DECIMAL(10,2),
     price_thursday DECIMAL(10,2),
     price_friday DECIMAL(10,2),
     price_saturday DECIMAL(10,2),
     price_sunday DECIMAL(10,2),
     currency VARCHAR(3) DEFAULT 'AED',
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   
   -- Create DatePriceOverride table
   CREATE TABLE date_price_override (
     id UUID PRIMARY KEY,
     property_id UUID REFERENCES properties(property_id),
     date DATE,
     price DECIMAL(10,2),
     reason TEXT,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW(),
     UNIQUE(property_id, date)
   );
   ```

2. **Migrate existing data**
   ```typescript
   // For each property with existing rate plans
   async function migrateProperty(propertyId: string) {
     // Find the base rate plan (usually FixedPrice type)
     const baseRatePlan = await prisma.ratePlan.findFirst({
       where: {
         propertyId,
         adjustmentType: 'FixedPrice'
       },
       orderBy: {
         priority: 'asc'
       }
     })
     
     if (baseRatePlan) {
       // Use its price as the default for all days
       await prisma.propertyPricing.create({
         data: {
           propertyId,
           priceMonday: baseRatePlan.adjustmentValue,
           priceTuesday: baseRatePlan.adjustmentValue,
           priceWednesday: baseRatePlan.adjustmentValue,
           priceThursday: baseRatePlan.adjustmentValue,
           priceFriday: baseRatePlan.adjustmentValue * 1.2, // 20% weekend markup
           priceSaturday: baseRatePlan.adjustmentValue * 1.3, // 30% weekend markup
           priceSunday: baseRatePlan.adjustmentValue * 1.1
         }
       })
     }
     
     // Convert other rate plans to modifiers
     const otherRatePlans = await prisma.ratePlan.findMany({
       where: {
         propertyId,
         adjustmentType: { not: 'FixedPrice' }
       }
     })
     
     for (const plan of otherRatePlans) {
       // Update to new structure
       await prisma.ratePlan.update({
         where: { id: plan.id },
         data: {
           priceModifierType: 'Percentage',
           priceModifierValue: plan.adjustmentValue,
           // Clear old fields
           adjustmentType: undefined,
           adjustmentValue: undefined,
           baseRatePlanId: undefined
         }
       })
     }
   }
   ```

3. **Drop old tables**
   ```sql
   DROP TABLE price CASCADE;
   DROP TABLE rate_plan_restriction CASCADE;
   DROP TABLE cancellation_tier CASCADE;
   ```

### Phase 2: Service Layer Update

1. Replace old pricing logic with new services
2. Update all endpoints to use new calculation methods
3. Remove complex nested rate plan logic

### Phase 3: UI Update

1. Create new pricing management interface
2. Add calendar view for date overrides
3. Simplify rate plan creation/editing forms

### Phase 4: Testing & Validation

1. Unit tests for pricing calculations
2. Integration tests for booking flow
3. Load testing for performance validation

## Examples and Use Cases

### Example 1: Standard Hotel Pricing

```typescript
// Weekly base pricing
{
  monday: 200,     // Weekday rate
  tuesday: 200,
  wednesday: 200,
  thursday: 200,
  friday: 250,     // Weekend starts
  saturday: 300,   // Peak weekend
  sunday: 250      // Weekend rate
}

// Holiday overrides
[
  { date: "2024-12-31", price: 800, reason: "New Year's Eve" },
  { date: "2025-01-01", price: 600, reason: "New Year's Day" }
]

// Rate plans
[
  { name: "Standard", modifier: 0 },
  { name: "Non-Refundable", modifier: -15 },
  { name: "Premium Package", modifier: +25, includesBreakfast: true }
]
```

### Example 2: Guest Booking Flow

1. Guest selects dates: Dec 20-25 (5 nights)
2. System calculates base price:
   - Dec 20 (Fri): 250
   - Dec 21 (Sat): 300
   - Dec 22 (Sun): 250
   - Dec 23 (Mon): 200
   - Dec 24 (Tue): 200
   - **Base Total: 1200 AED**

3. System shows rate plan options:
   - **Non-Refundable**: 1020 AED (Save 180 AED)
   - **Standard**: 1200 AED
   - **Premium Package**: 1500 AED (Includes breakfast)

4. Guest selects "Non-Refundable" and books

### Example 3: Property Owner Updates Pricing

```typescript
// Owner wants to increase weekend prices by 20%
await pricingService.setWeeklyPricing(propertyId, {
  monday: 200,
  tuesday: 200,
  wednesday: 200,
  thursday: 200,
  friday: 300,    // Was 250, now 300
  saturday: 360,  // Was 300, now 360
  sunday: 300     // Was 250, now 300
})

// Owner sets special event pricing
await pricingService.setDateOverrides(propertyId, [
  { date: new Date('2024-12-20'), price: 500, reason: 'F1 Race Weekend' },
  { date: new Date('2024-12-21'), price: 500, reason: 'F1 Race Weekend' },
  { date: new Date('2024-12-22'), price: 500, reason: 'F1 Race Weekend' }
])
```

## Benefits Summary

### For Property Owners
- **Clear Control**: Set base prices by day of week
- **Easy Overrides**: Click on calendar to set special dates
- **Simple Strategies**: Rate plans are just discounts/premiums
- **Predictable**: Always know the base price

### For Developers
- **Clean Architecture**: Separation of concerns
- **Simple Logic**: No nested calculations
- **Maintainable**: Easy to debug and extend
- **Performant**: Straightforward queries

### For Guests
- **Transparent Pricing**: See base price and modifications
- **Clear Options**: Understand what each rate plan offers
- **Fair Comparison**: Easy to compare options

## Conclusion

This new pricing architecture provides a clean, maintainable, and user-friendly approach to property pricing. By separating base pricing from rate plan modifiers, we achieve clarity and flexibility while eliminating the complexity of the previous system.

The migration path is straightforward, and the benefits are immediate:
- Property owners can easily manage their pricing
- Developers work with clean, understandable code
- Guests see transparent, logical pricing options

This architecture scales well and can easily accommodate future requirements such as:
- Seasonal pricing rules
- Dynamic pricing based on occupancy
- Package deals and promotions
- Multi-property pricing strategies