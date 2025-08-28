# Rate and Pricing Model Documentation

## Overview

The Wezo.ae platform uses a sophisticated RatePlan-based pricing system that provides maximum flexibility for property owners to create complex pricing strategies. All pricing logic is centralized through the RatePlan model with support for percentage discounts, fixed amounts, absolute pricing, and comprehensive booking restrictions.

## Core Models

### RatePlan Model
```typescript
model RatePlan {
  id                   String
  propertyId           String
  name                 String                // "Standard Rate", "Early Bird Special"
  type                 RatePlanType          // FullyFlexible/NonRefundable/Custom
  description          String?               // Guest-facing description
  includesBreakfast    Boolean               // Breakfast inclusion
  adjustmentType       PriceAdjustmentType   // How pricing is calculated
  adjustmentValue      Float                 // Numeric value for adjustment
  baseRatePlanId       String?               // Required for Percentage type
  priority             Int                   // Priority for conflict resolution (lower = higher priority)
  allowConcurrentRates Boolean               // Can coexist with other rates (false = exclusive override)
  isActive             Boolean               // Enable/disable rate plan
  activeDays           Int[]                 // Days of week [0-6] when active
  
  // Relations
  baseRatePlan         RatePlan?             // Base rate for percentage calculations
  derivedRatePlans     RatePlan[]            // Plans using this as base
  cancellationPolicy   CancellationPolicy?   // Structured cancellation rules
  ratePlanRestrictions RatePlanRestriction[] // Booking restrictions
  prices               Price[]               // Date-specific pricing
  reservations         Reservation[]         // Bookings under this plan
}
```

### PriceAdjustmentType Enum
```typescript
enum PriceAdjustmentType {
  Percentage    // Apply percentage adjustment (20 = 20% discount)
  FixedDiscount // Apply fixed amount discount per night (50 = AED 50 off)
  FixedPrice    // Set absolute price per night (200 = AED 200 total)
}
```

### RatePlanRestrictionType Enum
```typescript
enum RatePlanRestrictionType {
  MinLengthOfStay        // Minimum nights required
  MaxLengthOfStay        // Maximum nights allowed
  MinAdvancedReservation // Minimum days before arrival
  MaxAdvancedReservation // Maximum days before arrival
  MinGuests              // Minimum guests required
  MaxGuests              // Maximum guests allowed
  NoArrivals             // Block arrivals on specific dates
  NoDepartures           // Block departures on specific dates
  SeasonalDateRange      // Rate active only within specific date range
}
```

## Priority System and Rate Plan Conflicts

### How Priority System Works

The platform handles overlapping rate plans through a sophisticated priority system that gives property owners complete control over guest experience:

#### Priority Levels (Convention)
```typescript
Priority 1-49:   VIP/Exclusive rates (highest priority)
Priority 50-99:  Seasonal/Holiday rates  
Priority 100-199: Standard base rates
Priority 200-299: Promotional rates
Priority 300+:    Special offers (lowest priority)
```

#### Concurrent vs Exclusive Rates

**Concurrent Rates** (`allowConcurrentRates: true`):
- Multiple rate plans shown to guest
- Guest chooses based on price, flexibility, features
- Creates competitive options and upselling opportunities

**Exclusive Rates** (`allowConcurrentRates: false`):
- Overrides all lower priority rates
- Forces specific pricing during key periods
- Simplifies guest experience during peak demand

#### Conflict Resolution Examples

**Scenario A: All Concurrent Rates**
```
Available: Standard (100), Non-Refundable (100), Early Bird (200)
Result: Guest sees all 3 options, chooses based on preference
```

**Scenario B: Exclusive High Season**
```  
Available: High Season (50, exclusive), Standard (100), Non-Refundable (100)
Result: Only High Season shown (others hidden by priority)
```

**Scenario C: Mixed Priority**
```
Available: VIP (25, exclusive), Premium (75), Standard (100), Promo (200)  
Result: Only VIP and Premium shown (Standard/Promo hidden)
```

#### Business Benefits

1. **Revenue Optimization**: Force premium pricing when demand is high
2. **Inventory Control**: Combine with restrictions for strategic availability
3. **Guest Experience**: Simple choices during complex periods
4. **Operational Efficiency**: Automated rate management based on conditions

## Pricing Scenarios and Data Examples

### Scenario 1: Base Rate Plan (Fixed Price)

**Use Case:** Standard property rate serving as foundation for other plans

**Data:**
```json
{
  "id": "rp_standard_001",
  "propertyId": "prop_villa_123",
  "name": "Standard Rate",
  "type": "FullyFlexible",
  "description": "Standard flexible rate with free cancellation",
  "adjustmentType": "FixedPrice",
  "adjustmentValue": 250.0,
  "baseRatePlanId": null,
  "priority": 100,
  "allowConcurrentRates": true,
  "isActive": true,
  "activeDays": [0,1,2,3,4,5,6],
  "cancellationPolicy": {
    "tiers": [
      {"daysBeforeCheckIn": 1, "refundPercentage": 100}
    ]
  },
  "ratePlanRestrictions": []
}
```

**Booking Engine Logic:**
- Direct pricing: AED 250 per night
- Available all days of the week
- No restrictions apply

---

### Scenario 2: Percentage-Based Discount

**Use Case:** Early booking discount referencing base rate

**Data:**
```json
{
  "id": "rp_early_bird_001",
  "propertyId": "prop_villa_123", 
  "name": "Early Bird 20% Off",
  "type": "Custom",
  "description": "Book 30+ days in advance and save 20%",
  "adjustmentType": "Percentage",
  "adjustmentValue": 20.0,
  "baseRatePlanId": "rp_standard_001",
  "isActive": true,
  "activeDays": [0,1,2,3,4,5,6],
  "ratePlanRestrictions": [
    {
      "type": "MinAdvancedReservation",
      "value": 30
    }
  ]
}
```

**Booking Engine Logic:**
1. Check if booking is ≥30 days in advance
2. Fetch base rate plan (rp_standard_001) = AED 250
3. Calculate: 250 - (250 × 20%) = AED 200 per night
4. Available all days if advance booking requirement met

---

### Scenario 3: Fixed Amount Discount

**Use Case:** Manager special with fixed discount amount

**Data:**
```json
{
  "id": "rp_manager_special_001",
  "propertyId": "prop_villa_123",
  "name": "Manager Special AED 75 Off",
  "type": "Custom", 
  "description": "Exclusive manager discount",
  "adjustmentType": "FixedDiscount",
  "adjustmentValue": 75.0,
  "baseRatePlanId": "rp_standard_001",
  "isActive": true,
  "activeDays": [1,2,3,4,5],
  "ratePlanRestrictions": [
    {
      "type": "MaxGuests",
      "value": 2
    }
  ]
}
```

**Booking Engine Logic:**
1. Check if booking is for ≤2 guests
2. Check if arrival day is Monday-Friday
3. Fetch base rate plan = AED 250  
4. Calculate: 250 - 75 = AED 175 per night
5. Only available weekdays for couples

---

### Scenario 4: Weekend Premium Pricing

**Use Case:** Higher rates for weekend stays

**Data:**
```json
{
  "id": "rp_weekend_premium_001",
  "propertyId": "prop_villa_123",
  "name": "Weekend Premium",
  "type": "FullyFlexible",
  "description": "Weekend rate with premium pricing",
  "adjustmentType": "FixedPrice", 
  "adjustmentValue": 350.0,
  "baseRatePlanId": null,
  "isActive": true,
  "activeDays": [0,6],
  "ratePlanRestrictions": [
    {
      "type": "MinLengthOfStay",
      "value": 2
    }
  ]
}
```

**Booking Engine Logic:**
1. Check if arrival day is Saturday (6) or Sunday (0)
2. Check if stay is ≥2 nights
3. Direct pricing: AED 350 per night
4. Only available for weekend arrivals with minimum 2-night stays

---

### Scenario 5: Non-Refundable Discount

**Use Case:** Lower price with strict cancellation policy

**Data:**
```json
{
  "id": "rp_non_refundable_001",
  "propertyId": "prop_villa_123",
  "name": "Non-Refundable 15% Off", 
  "type": "NonRefundable",
  "description": "Save 15% with no refund policy",
  "adjustmentType": "Percentage",
  "adjustmentValue": 15.0,
  "baseRatePlanId": "rp_standard_001",
  "isActive": true,
  "activeDays": [0,1,2,3,4,5,6],
  "cancellationPolicy": {
    "tiers": [
      {"daysBeforeCheckIn": 0, "refundPercentage": 0}
    ]
  },
  "ratePlanRestrictions": []
}
```

**Booking Engine Logic:**
1. Fetch base rate = AED 250
2. Calculate: 250 - (250 × 15%) = AED 212.50 per night
3. Available all days
4. No refunds allowed once booked

---

### Scenario 6: Group Size Pricing

**Use Case:** Different rates based on occupancy

**Family Rate Data:**
```json
{
  "id": "rp_family_rate_001", 
  "propertyId": "prop_villa_123",
  "name": "Family Package",
  "type": "FullyFlexible",
  "description": "Special rate for families with children",
  "adjustmentType": "FixedPrice",
  "adjustmentValue": 400.0,
  "baseRatePlanId": null,
  "isActive": true,
  "activeDays": [0,1,2,3,4,5,6],
  "ratePlanRestrictions": [
    {
      "type": "MinGuests", 
      "value": 4
    },
    {
      "type": "MaxGuests",
      "value": 6
    }
  ]
}
```

**Solo Traveler Rate Data:**
```json
{
  "id": "rp_solo_rate_001",
  "propertyId": "prop_villa_123", 
  "name": "Solo Traveler Rate",
  "type": "FullyFlexible",
  "description": "Discounted rate for single occupancy",
  "adjustmentType": "FixedPrice",
  "adjustmentValue": 180.0,
  "baseRatePlanId": null,
  "isActive": true,
  "activeDays": [0,1,2,3,4,5,6],
  "ratePlanRestrictions": [
    {
      "type": "MaxGuests",
      "value": 1
    }
  ]
}
```

**Booking Engine Logic:**
- 1 guest: Shows Solo Traveler Rate (AED 180)
- 2-3 guests: Shows Standard Rate (AED 250)  
- 4-6 guests: Shows Family Package (AED 400)
- 7+ guests: No applicable rates (blocked)

---

### Scenario 7: Seasonal Rate with Date Restrictions

**Use Case:** High season rate with arrival/departure restrictions

**Data:**
```json
{
  "id": "rp_high_season_001",
  "propertyId": "prop_villa_123",
  "name": "High Season Rate",
  "type": "FullyFlexible", 
  "description": "Peak season pricing",
  "adjustmentType": "FixedPrice",
  "adjustmentValue": 450.0,
  "baseRatePlanId": null,
  "isActive": true,
  "activeDays": [0,1,2,3,4,5,6],
  "ratePlanRestrictions": [
    {
      "type": "MinLengthOfStay",
      "value": 7
    },
    {
      "type": "NoArrivals",
      "startDate": "2024-12-24",
      "endDate": "2024-12-26"
    },
    {
      "type": "NoDepartures", 
      "startDate": "2024-12-31",
      "endDate": "2024-01-02" 
    }
  ]
}
```

**Booking Engine Logic:**
1. Check minimum 7-night stay
2. Block arrivals Dec 24-26 (Christmas period)
3. Block departures Dec 31 - Jan 2 (New Year period)
4. Direct pricing: AED 450 per night
5. Forces longer stays during peak periods

---

### Scenario 8: Business Traveler Rate

**Use Case:** Weekday-only rate with flexible terms

**Data:**
```json
{
  "id": "rp_business_001",
  "propertyId": "prop_villa_123",
  "name": "Business Traveler Rate",
  "type": "FullyFlexible",
  "description": "Weekday rate for business guests",
  "adjustmentType": "Percentage",
  "adjustmentValue": 10.0,
  "baseRatePlanId": "rp_standard_001", 
  "isActive": true,
  "activeDays": [1,2,3,4,5],
  "includesBreakfast": true,
  "ratePlanRestrictions": [
    {
      "type": "MaxGuests",
      "value": 2
    },
    {
      "type": "MaxLengthOfStay",
      "value": 5
    }
  ]
}
```

**Booking Engine Logic:**
1. Check arrival day is Monday-Friday only
2. Check ≤2 guests and ≤5 nights
3. Calculate: 250 - (250 × 10%) = AED 225 per night
4. Includes breakfast
5. Perfect for business travelers

---

### Scenario 9: Last Minute Deal

**Use Case:** Discounted rate for bookings within 48 hours

**Data:**
```json
{
  "id": "rp_last_minute_001",
  "propertyId": "prop_villa_123",
  "name": "Last Minute Deal 25% Off",
  "type": "NonRefundable",
  "description": "Book within 48 hours and save big",
  "adjustmentType": "Percentage", 
  "adjustmentValue": 25.0,
  "baseRatePlanId": "rp_standard_001",
  "isActive": true,
  "activeDays": [0,1,2,3,4,5,6],
  "ratePlanRestrictions": [
    {
      "type": "MaxAdvancedReservation",
      "value": 2
    }
  ],
  "cancellationPolicy": {
    "tiers": [
      {"daysBeforeCheckIn": 0, "refundPercentage": 0}
    ]
  }
}
```

**Booking Engine Logic:**
1. Check if booking is ≤2 days before arrival
2. Calculate: 250 - (250 × 25%) = AED 187.50 per night  
3. Non-refundable once booked
4. Great for filling last-minute availability

---

### Scenario 10: High Season Exclusive Rate (Priority System)

**Use Case:** Seasonal rate that overrides all other rates during peak periods

**High Season Rate Data:**
```json
{
  "id": "rp_high_season_001",
  "propertyId": "prop_villa_123",
  "name": "High Season Premium",
  "type": "FullyFlexible",
  "description": "Premium pricing for peak season with exclusive availability",
  "adjustmentType": "FixedPrice",
  "adjustmentValue": 450.0,
  "baseRatePlanId": null,
  "priority": 50,
  "allowConcurrentRates": false,
  "isActive": true,
  "activeDays": [0,1,2,3,4,5,6],
  "ratePlanRestrictions": [
    {
      "type": "SeasonalDateRange",
      "startDate": "2024-12-15",
      "endDate": "2024-01-15"
    },
    {
      "type": "MinLengthOfStay",
      "value": 7
    }
  ]
}
```

**Standard Rate Data (for comparison):**
```json
{
  "id": "rp_standard_001",
  "propertyId": "prop_villa_123",
  "name": "Standard Rate",
  "adjustmentType": "FixedPrice",
  "adjustmentValue": 250.0,
  "priority": 100,
  "allowConcurrentRates": true
}
```

**Non-Refundable Rate Data (for comparison):**
```json
{
  "id": "rp_non_refundable_001",
  "propertyId": "prop_villa_123", 
  "name": "Non-Refundable 15% Off",
  "adjustmentType": "Percentage",
  "adjustmentValue": 15.0,
  "baseRatePlanId": "rp_standard_001",
  "priority": 100,
  "allowConcurrentRates": true
}
```

**Booking Engine Logic - Outside High Season (e.g., Nov 1-14):**
1. High Season rate not applicable (outside date range)
2. Shows multiple concurrent options:
   ```
   Available rates:
   ✓ Non-Refundable: AED 212.50/night (15% off)
   ✓ Standard Rate: AED 250/night
   ```
3. Guest can choose based on flexibility vs savings

**Booking Engine Logic - During High Season (Dec 15 - Jan 15):**
1. High Season rate is applicable (within date range)
2. Priority 50 (higher than others at 100)
3. `allowConcurrentRates: false` = **EXCLUSIVE**
4. **Hides all lower priority rates**
5. Shows only:
   ```
   Available rates:
   ✓ High Season Premium: AED 450/night (minimum 7 nights)
   ```
6. Standard and Non-Refundable rates are **completely hidden**

**Advanced Priority Logic:**
```typescript
// During Dec 15 - Jan 15
const applicableRates = [
  { name: "High Season", priority: 50, allowConcurrentRates: false },
  { name: "Standard", priority: 100, allowConcurrentRates: true },
  { name: "Non-Refundable", priority: 100, allowConcurrentRates: true }
]

// Step 1: Find highest priority exclusive rate
const exclusiveRate = applicableRates
  .filter(rate => !rate.allowConcurrentRates)
  .sort((a, b) => a.priority - b.priority)[0] // High Season (50)

// Step 2: Hide all lower priority rates  
const visibleRates = applicableRates.filter(rate => 
  rate.priority <= exclusiveRate.priority // Only priority ≤ 50
)

// Result: Only "High Season Premium" is shown
```

**Business Benefits:**
- **Revenue Optimization**: Forces premium pricing during peak demand
- **Inventory Control**: Minimum 7-night stays during busy periods  
- **Simple Management**: Property owners just toggle `isActive` on/off
- **Guest Clarity**: No confusing multiple options during peak times

---

### Scenario 11: Complex Multi-Restriction Rate

**Use Case:** VIP package with multiple requirements

**Data:**
```json
{
  "id": "rp_vip_package_001",
  "propertyId": "prop_villa_123",
  "name": "VIP Experience Package",
  "type": "Custom",
  "description": "Luxury VIP experience with exclusive amenities",
  "adjustmentType": "FixedPrice",
  "adjustmentValue": 750.0,
  "baseRatePlanId": null,
  "isActive": true,
  "activeDays": [0,6],
  "includesBreakfast": true,
  "ratePlanRestrictions": [
    {
      "type": "MinGuests",
      "value": 2
    },
    {
      "type": "MaxGuests", 
      "value": 4
    },
    {
      "type": "MinLengthOfStay",
      "value": 3
    },
    {
      "type": "MinAdvancedReservation",
      "value": 14
    },
    {
      "type": "NoArrivals",
      "startDate": "2024-01-14",
      "endDate": "2024-01-14"
    }
  ]
}
```

**Booking Engine Logic:**
1. Check weekend arrival only (Sat/Sun)
2. Check 2-4 guests
3. Check minimum 3-night stay
4. Check booking ≥14 days in advance
5. Block arrivals on Jan 14 (maintenance day)
6. Direct pricing: AED 750 per night
7. Includes breakfast and VIP amenities

---

## Booking Engine Algorithm

### Rate Plan Selection Process

```typescript
function getApplicableRatePlans(
  propertyId: string,
  checkInDate: Date,
  checkOutDate: Date, 
  numGuests: number,
  bookingDate: Date
): RatePlan[] {
  
  const property = await getProperty(propertyId)
  const dayOfWeek = checkInDate.getDay()
  const lengthOfStay = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))
  const daysInAdvance = Math.ceil((checkInDate - bookingDate) / (1000 * 60 * 60 * 24))
  
  const applicableRatePlans = property.ratePlans.filter(ratePlan => {
    // 1. Check if rate plan is active
    if (!ratePlan.isActive) return false
    
    // 2. Check day of week availability  
    if (!ratePlan.activeDays.includes(dayOfWeek)) return false
    
    // 3. Check all restrictions
    for (const restriction of ratePlan.ratePlanRestrictions) {
      switch (restriction.type) {
        case 'MinLengthOfStay':
          if (lengthOfStay < restriction.value) return false
          break
          
        case 'MaxLengthOfStay':
          if (lengthOfStay > restriction.value) return false
          break
          
        case 'MinGuests':
          if (numGuests < restriction.value) return false
          break
          
        case 'MaxGuests':
          if (numGuests > restriction.value) return false
          break
          
        case 'MinAdvancedReservation':
          if (daysInAdvance < restriction.value) return false
          break
          
        case 'MaxAdvancedReservation': 
          if (daysInAdvance > restriction.value) return false
          break
          
        case 'NoArrivals':
          if (isDateInRange(checkInDate, restriction.startDate, restriction.endDate)) {
            return false
          }
          break
          
        case 'NoDepartures':
          if (isDateInRange(checkOutDate, restriction.startDate, restriction.endDate)) {
            return false
          }
          break
          
        case 'SeasonalDateRange':
          if (!isDateInRange(checkInDate, restriction.startDate, restriction.endDate)) {
            return false
          }
          break
      }
    }
    
    return true
  })
  
  // Apply priority and concurrent rate logic
  return applyPriorityLogic(applicableRatePlans)
}

function applyPriorityLogic(ratePlans: RatePlan[]): RatePlan[] {
  // Find highest priority exclusive rate
  const exclusiveRates = ratePlans
    .filter(plan => !plan.allowConcurrentRates)
    .sort((a, b) => a.priority - b.priority)
  
  if (exclusiveRates.length > 0) {
    const highestPriorityExclusive = exclusiveRates[0]
    
    // Show only exclusive rate and higher/equal priority concurrent rates
    return ratePlans.filter(plan => 
      plan.priority <= highestPriorityExclusive.priority
    ).sort((a, b) => a.priority - b.priority)
  }
  
  // No exclusive rates - show all concurrent rates sorted by price
  return ratePlans.sort((a, b) => {
    const priceA = calculateTotalPrice(a, checkInDate, checkOutDate)
    const priceB = calculateTotalPrice(b, checkInDate, checkOutDate)
    return priceA - priceB
  })
}
```

### Price Calculation Process

```typescript
function calculateRatePlanPrice(ratePlan: RatePlan, date: Date): number {
  // 1. Check for date-specific pricing first
  const specificPrice = ratePlan.prices.find(price => 
    isSameDay(price.date, date)
  )
  if (specificPrice) {
    return specificPrice.amount
  }
  
  // 2. Calculate based on adjustment type
  switch (ratePlan.adjustmentType) {
    case 'FixedPrice':
      return ratePlan.adjustmentValue
      
    case 'FixedDiscount':
      const baseRate = getBaseRateForDate(ratePlan.baseRatePlan, date)
      return Math.max(0, baseRate - ratePlan.adjustmentValue)
      
    case 'Percentage':
      const baseAmount = getBaseRateForDate(ratePlan.baseRatePlan, date)
      const discount = baseAmount * (ratePlan.adjustmentValue / 100)
      return Math.max(0, baseAmount - discount)
      
    default:
      throw new Error(`Unknown adjustment type: ${ratePlan.adjustmentType}`)
  }
}

function getBaseRateForDate(baseRatePlan: RatePlan, date: Date): number {
  // Recursively calculate base rate (handles nested percentage plans)
  return calculateRatePlanPrice(baseRatePlan, date)
}
```

### Complete Booking Flow

```typescript
async function searchRatesForProperty(searchCriteria: {
  propertyId: string
  checkInDate: Date
  checkOutDate: Date
  numGuests: number
  bookingDate: Date
}): Promise<RateSearchResult[]> {
  
  // 1. Get applicable rate plans
  const applicableRatePlans = await getApplicableRatePlans(
    searchCriteria.propertyId,
    searchCriteria.checkInDate,
    searchCriteria.checkOutDate,
    searchCriteria.numGuests,
    searchCriteria.bookingDate
  )
  
  // 2. Calculate pricing for each rate plan
  const results = await Promise.all(
    applicableRatePlans.map(async ratePlan => {
      const nights = getDateRange(searchCriteria.checkInDate, searchCriteria.checkOutDate)
      let totalPrice = 0
      const nightlyRates = []
      
      for (const night of nights) {
        const nightlyRate = await calculateRatePlanPrice(ratePlan, night)
        nightlyRates.push({ date: night, rate: nightlyRate })
        totalPrice += nightlyRate
      }
      
      return {
        ratePlan,
        totalPrice,
        nightlyRates,
        averageNightlyRate: totalPrice / nights.length,
        cancellationPolicy: ratePlan.cancellationPolicy,
        includesBreakfast: ratePlan.includesBreakfast
      }
    })
  )
  
  // 3. Sort by price (cheapest first) and return
  return results.sort((a, b) => a.totalPrice - b.totalPrice)
}
```

## Integration with Other Models

### Availability Checking
Before showing any rate plans, check property availability:

```typescript
const unavailableDates = await getUnavailableDates(propertyId, checkInDate, checkOutDate)
if (unavailableDates.length > 0) {
  return [] // Property not available
}
```

### Reservation Creation
When guest selects a rate plan:

```typescript
const reservation = await createReservation({
  ratePlanId: selectedRatePlan.id,
  guestId: guest.id,
  checkInDate,
  checkOutDate,
  numGuests,
  totalPrice: calculatedTotalPrice
})
```

## Best Practices

### 1. Rate Plan Hierarchy
- Always have at least one FixedPrice base rate plan
- Use percentage-based plans for discounts off the base
- Limit nesting depth (avoid percentage plans referencing other percentage plans)

### 2. Restriction Design
- Combine multiple restrictions for complex scenarios
- Use NoArrivals/NoDepartures sparingly (prefer Availability blocking for true unavailability)
- Test restriction combinations thoroughly

### 3. Performance Optimization
- Index rate plans by propertyId and isActive
- Cache base rate calculations
- Pre-calculate prices for high-traffic date ranges

### 4. Business Logic Validation
- Ensure percentage-based plans always reference FixedPrice base plans
- Validate that activeDays arrays contain valid values (0-6)
- Check restriction value constraints (positive integers where applicable)

### 5. Guest Experience
- Display rate plans in logical order (price, popularity, features)
- Show clear savings amounts and percentages
- Highlight included amenities and restrictions upfront

This comprehensive rate and pricing model provides the flexibility needed for sophisticated revenue management while maintaining clear business logic and optimal guest experience.