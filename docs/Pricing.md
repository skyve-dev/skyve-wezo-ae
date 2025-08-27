# Pricing Architecture - Wezo.ae Property Rental Platform

## Overview
This document explains the comprehensive pricing system used in the Wezo.ae property rental platform. The system provides flexible, dynamic pricing capabilities that allow property owners to implement sophisticated revenue management strategies similar to hotels and airlines.

## Table of Contents
- [Pricing Hierarchy](#pricing-hierarchy)
- [Component Breakdown](#component-breakdown)
- [Price Calculation Flow](#price-calculation-flow)
- [Real-World Scenarios](#real-world-scenarios)
- [Database Implementation](#database-implementation)
- [API Examples](#api-examples)

## Pricing Hierarchy

The pricing system follows a hierarchical structure where each level adds more specificity and control:

```
Property
    ├── Pricing (Base Configuration)
    │   ├── Base rates (weekday/weekend)
    │   ├── Group size variations
    │   └── Promotion (if active)
    │
    └── RatePlans (Multiple Strategies)
        ├── RatePlan 1: Fully Flexible
        │   ├── Daily Prices (date-specific overrides)
        │   └── Restrictions (booking rules)
        ├── RatePlan 2: Non-Refundable
        │   ├── Daily Prices
        │   └── Restrictions
        └── RatePlan 3: Custom (e.g., Long Stay)
            ├── Daily Prices
            └── Restrictions
```

## Component Breakdown

### 1. Pricing Entity (Base Level)
The foundation pricing configuration for a property:

```typescript
interface Pricing {
  currency: Currency;                              // Currently AED only
  ratePerNight: number;                           // Standard weekday rate
  ratePerNightWeekend?: number;                   // Optional weekend premium
  discountPercentageForNonRefundableRatePlan?: number;  // e.g., 15% off
  discountPercentageForWeeklyRatePlan?: number;         // e.g., 20% off for 7+ nights
  pricePerGroupSize: PricePerGroupSize[];         // Variable pricing by guest count
  promotion?: Promotion;                          // Active special offer
}

// Example
{
  currency: "AED",
  ratePerNight: 500,
  ratePerNightWeekend: 650,
  discountPercentageForNonRefundableRatePlan: 15,
  discountPercentageForWeeklyRatePlan: 20,
  pricePerGroupSize: [
    { groupSize: 2, ratePerNight: 500 },
    { groupSize: 4, ratePerNight: 600 },
    { groupSize: 6, ratePerNight: 750 }
  ]
}
```

### 2. RatePlan Entity (Strategy Layer)
Each property can have multiple rate plans targeting different guest segments:

```typescript
interface RatePlan {
  name: string;                    // e.g., "Flexible Cancellation"
  type: RatePlanType;             // FullyFlexible | NonRefundable | Custom
  description?: string;            // Guest-facing description
  cancellationPolicy: string;      // Detailed cancellation terms
  includesBreakfast: boolean;      // Value-add inclusions
  percentage: number;              // Discount/markup percentage
  restrictions: Restriction[];     // Booking rules
  prices: Price[];                // Daily price overrides
}
```

**Common Rate Plan Examples:**
- **Flexible Cancellation**: Free cancellation until 24 hours before arrival
- **Non-Refundable Deal**: 15% cheaper, no cancellation allowed
- **Early Bird Special**: Book 30+ days in advance for 20% off
- **Weekly Stay**: Stay 7+ nights for special rates
- **Business Traveler**: Includes breakfast and late checkout

### 3. Price Entity (Daily Override)
Specific prices per date that override base pricing:

```typescript
interface Price {
  ratePlanId: string;
  date: Date;
  amount: Decimal;  // Exact price for this date
}

// Example: Holiday pricing
[
  { date: "2025-12-24", amount: 1200 },  // Christmas Eve
  { date: "2025-12-25", amount: 1200 },  // Christmas Day
  { date: "2025-12-31", amount: 1500 },  // New Year's Eve
  { date: "2025-01-15", amount: 450 },   // Low season
  { date: "2025-02-14", amount: 800 }    // Valentine's Day
]
```

### 4. Restriction Entity (Booking Rules)
Controls how and when guests can book:

```typescript
interface Restriction {
  type: RestrictionType;
  value: number;
  startDate?: Date;    // When restriction starts
  endDate?: Date;      // When restriction ends
  ratePlanId?: string; // Apply to specific rate plan
  propertyId: string;  // Always linked to property
}

enum RestrictionType {
  MinLengthOfStay,        // Minimum nights required
  MaxLengthOfStay,        // Maximum nights allowed
  NoArrivals,             // No check-ins on specific days
  NoDepartures,           // No check-outs on specific days
  MinAdvancedReservation, // Minimum days before arrival
  MaxAdvancedReservation  // Maximum days in advance
}

// Example restrictions
[
  { type: "MinLengthOfStay", value: 2 },           // Minimum 2 nights
  { type: "MaxLengthOfStay", value: 30 },          // Maximum 30 nights
  { type: "MinAdvancedReservation", value: 1 },    // Book at least 1 day ahead
  { type: "NoArrivals", value: 5 },                // No Friday check-ins (5 = Friday)
]
```

### 5. Promotion Entity (Special Offers)
Temporary discounts or deals:

```typescript
interface Promotion {
  type: string;           // e.g., "Last Minute Deal"
  percentage: number;      // Discount percentage
  description: string;     // Guest-facing description
}

// Examples
{
  type: "Last Minute Deal",
  percentage: 25,
  description: "Book within 48 hours of arrival for 25% off"
}

{
  type: "Summer Special",
  percentage: 30,
  description: "30% off for stays in July and August"
}
```

## Price Calculation Flow

### Step-by-Step Calculation Process

```
STEP 1: Guest Search Input
├── Check-in: January 15, 2025
├── Check-out: January 18, 2025
├── Nights: 3
└── Guests: 4 adults

STEP 2: For Each Available RatePlan
├── Check Restrictions (Can guest book?)
├── Calculate Base Price
├── Apply Date-Specific Overrides
├── Apply Group Size Adjustments
├── Apply Promotions
└── Return Final Price

STEP 3: Present Options to Guest
├── Flexible: 1,650 AED (can cancel)
├── Non-Refundable: 1,447 AED (save 203 AED)
└── Early Bird: Not available (< 30 days)
```

### Detailed Calculation Example

```typescript
function calculatePrice(booking: BookingRequest): PriceOptions[] {
  const results = [];
  
  for (const ratePlan of property.ratePlans) {
    // 1. Check restrictions
    if (!checkRestrictions(ratePlan.restrictions, booking)) {
      continue; // Skip this rate plan
    }
    
    // 2. Calculate base price for each night
    let totalPrice = 0;
    for (const date of booking.dates) {
      // Check for date-specific override
      const dailyPrice = ratePlan.prices.find(p => p.date === date);
      
      if (dailyPrice) {
        totalPrice += dailyPrice.amount;
      } else {
        // Use base pricing
        const isWeekend = isWeekendDate(date);
        const baseRate = isWeekend ? 
          pricing.ratePerNightWeekend : 
          pricing.ratePerNight;
        
        // Apply rate plan percentage
        const adjustedRate = baseRate * (1 - ratePlan.percentage / 100);
        totalPrice += adjustedRate;
      }
    }
    
    // 3. Apply group size adjustment
    const groupAdjustment = calculateGroupSizePrice(booking.guests);
    totalPrice += groupAdjustment * booking.nights;
    
    // 4. Apply promotions if eligible
    if (pricing.promotion && isEligibleForPromotion(booking)) {
      totalPrice = totalPrice * (1 - pricing.promotion.percentage / 100);
    }
    
    results.push({
      ratePlan: ratePlan.name,
      totalPrice: totalPrice,
      pricePerNight: totalPrice / booking.nights,
      cancellationPolicy: ratePlan.cancellationPolicy
    });
  }
  
  return results;
}
```

## Real-World Scenarios

### Scenario A: Peak Season (New Year's Eve)

```typescript
// Property setup
Base Rate: 500 AED/night
New Year's Eve Override: 1,500 AED

// Guest books Dec 30 - Jan 2 (3 nights)
Rate Plan: "Flexible"
├── Dec 30: 500 AED (base rate)
├── Dec 31: 1,500 AED (peak override)
├── Jan 1: 800 AED (holiday override)
Total: 2,800 AED

Rate Plan: "Non-Refundable" (15% off)
├── Dec 30: 425 AED
├── Dec 31: 1,275 AED
├── Jan 1: 680 AED
Total: 2,380 AED (Save 420 AED!)
```

### Scenario B: Long Stay Business Traveler

```typescript
// Guest books 10 nights for business
Rate Plan: "Weekly Stay"
├── Base: 500 AED × 10 = 5,000 AED
├── Weekly discount: -20% = 4,000 AED
├── Includes: Breakfast (valued at 50 AED/day)
├── Restriction check: MinLengthOfStay = 7 ✓
Total: 4,000 AED (effectively 350 AED/night with breakfast)
```

### Scenario C: Last-Minute Weekend Getaway

```typescript
// Guest books tomorrow (Friday-Sunday)
Rate Plan: "Last Minute Deal"
├── Friday: 650 AED (weekend rate)
├── Saturday: 650 AED
├── Promotion: -25% (last minute)
├── Final: 975 AED total (487.50 AED/night)

// But restriction blocks Friday arrivals
Result: Booking not available - suggest Thursday or Saturday arrival
```

### Scenario D: Group Booking

```typescript
// Family of 6 books 4 nights
Base Calculation:
├── Base rate: 500 AED/night
├── Group size 6: +250 AED/night (from PricePerGroupSize)
├── Subtotal: 750 AED × 4 = 3,000 AED

Available Options:
├── Flexible: 3,000 AED
├── Non-Refundable: 2,550 AED (15% off)
├── Weekly Stay: Not eligible (< 7 nights)
```

## Database Implementation

### Schema Relationships

```sql
-- Core pricing tables relationship
Property (1) ─── (1) Pricing
    │                 │
    │                 └─── (0..1) Promotion
    │
    └─── (0..n) RatePlan
            │
            ├─── (0..n) Price (daily overrides)
            │
            └─── (0..n) Restriction (booking rules)
```

### Query Examples

#### Get Available Rate Plans with Prices

```sql
-- Get all rate plans with calculated prices for date range
WITH date_range AS (
  SELECT generate_series(
    '2025-01-15'::date,
    '2025-01-17'::date,
    '1 day'::interval
  )::date AS booking_date
),
calculated_prices AS (
  SELECT 
    rp.id AS rate_plan_id,
    rp.name AS rate_plan_name,
    dr.booking_date,
    COALESCE(
      p.amount,  -- First priority: specific date price
      CASE 
        WHEN EXTRACT(DOW FROM dr.booking_date) IN (0, 6) 
        THEN pr.rate_per_night_weekend
        ELSE pr.rate_per_night
      END * (1 - rp.percentage / 100)
    ) AS price
  FROM Property prop
  CROSS JOIN date_range dr
  JOIN Pricing pr ON pr.property_id = prop.id
  JOIN RatePlan rp ON rp.property_id = prop.id
  LEFT JOIN Price p ON p.rate_plan_id = rp.id 
    AND p.date = dr.booking_date
  WHERE prop.id = :property_id
)
SELECT 
  rate_plan_id,
  rate_plan_name,
  SUM(price) AS total_price,
  AVG(price) AS avg_nightly_rate
FROM calculated_prices
GROUP BY rate_plan_id, rate_plan_name
ORDER BY total_price ASC;
```

#### Check Restrictions

```sql
-- Check if booking meets all restrictions
WITH booking_details AS (
  SELECT 
    3 AS nights_requested,
    '2025-01-15'::date AS check_in_date,
    14 AS days_in_advance,
    5 AS day_of_week  -- Friday
)
SELECT 
  r.type,
  r.value,
  CASE 
    WHEN r.type = 'MinLengthOfStay' AND bd.nights_requested >= r.value THEN 'PASS'
    WHEN r.type = 'MaxLengthOfStay' AND bd.nights_requested <= r.value THEN 'PASS'
    WHEN r.type = 'MinAdvancedReservation' AND bd.days_in_advance >= r.value THEN 'PASS'
    WHEN r.type = 'NoArrivals' AND bd.day_of_week != r.value THEN 'PASS'
    ELSE 'FAIL'
  END AS status
FROM Restriction r
CROSS JOIN booking_details bd
WHERE r.rate_plan_id = :rate_plan_id
  AND (r.start_date IS NULL OR bd.check_in_date >= r.start_date)
  AND (r.end_date IS NULL OR bd.check_in_date <= r.end_date);
```

## API Examples

### Get Pricing for Property

```typescript
// GET /api/properties/:id/pricing?checkIn=2025-01-15&checkOut=2025-01-18&guests=4

{
  "property": {
    "id": "prop_123",
    "name": "Luxury Villa Marina"
  },
  "searchCriteria": {
    "checkIn": "2025-01-15",
    "checkOut": "2025-01-18", 
    "nights": 3,
    "guests": 4
  },
  "availableRates": [
    {
      "ratePlanId": "rp_flex",
      "name": "Flexible Cancellation",
      "totalPrice": 1650.00,
      "avgNightlyRate": 550.00,
      "currency": "AED",
      "cancellationPolicy": "Free cancellation until 24 hours before arrival",
      "includes": [],
      "available": true
    },
    {
      "ratePlanId": "rp_nonref",
      "name": "Non-Refundable Deal",
      "totalPrice": 1447.50,
      "avgNightlyRate": 482.50,
      "currency": "AED",
      "cancellationPolicy": "No refunds",
      "includes": [],
      "available": true,
      "savings": {
        "amount": 202.50,
        "percentage": 12.3
      }
    }
  ],
  "appliedPromotions": [],
  "priceBreakdown": {
    "baseTotal": 1500.00,
    "groupSizeAdjustment": 300.00,
    "discounts": -150.00,
    "taxes": 0.00,
    "finalTotal": 1650.00
  }
}
```

### Update Rate Plan Prices

```typescript
// PUT /api/properties/:id/rate-plans/:ratePlanId/prices

{
  "prices": [
    {
      "date": "2025-12-24",
      "amount": 1200.00
    },
    {
      "date": "2025-12-25", 
      "amount": 1200.00
    },
    {
      "date": "2025-12-31",
      "amount": 1500.00
    }
  ]
}
```

### Set Restrictions

```typescript
// POST /api/properties/:id/restrictions

{
  "ratePlanId": "rp_flex",  // Optional - apply to specific rate plan
  "restrictions": [
    {
      "type": "MinLengthOfStay",
      "value": 2,
      "startDate": "2025-06-01",
      "endDate": "2025-08-31"
    },
    {
      "type": "NoArrivals",
      "value": 5,  // Friday
      "startDate": null,
      "endDate": null
    }
  ]
}
```

## Smart Pricing Strategies

### Revenue Optimization Tactics

1. **Seasonal Pricing**
   - High season: +30-50% on base rates
   - Low season: -20-30% discounts
   - Special events: +100-200% premiums

2. **Length of Stay Optimization**
   - Short stays (1-2 nights): Higher nightly rates
   - Week-long: 15-20% discount
   - Monthly: 30-40% discount

3. **Advance Booking Incentives**
   - Early bird (30+ days): 10-15% off
   - Last minute (< 48 hours): 20-25% off
   - Sweet spot (7-14 days): Base rate

4. **Occupancy-Based Pricing**
   - Low occupancy: Aggressive discounts
   - High occupancy: Premium pricing
   - Near capacity: Highest rates

5. **Guest Segment Targeting**
   - Business travelers: Include amenities, flexible check-in
   - Families: Group discounts, child-friendly perks
   - Couples: Romance packages, late checkout

## Best Practices

### For Property Owners

1. **Start Simple**: Begin with 2-3 rate plans maximum
2. **Monitor Performance**: Track which rate plans convert best
3. **Seasonal Adjustments**: Update prices quarterly
4. **Competitive Analysis**: Check competitor pricing weekly
5. **Test and Learn**: Try different restriction combinations

### For Platform Administrators

1. **Data Analytics**: Track pricing elasticity and demand patterns
2. **Recommendation Engine**: Suggest optimal pricing to owners
3. **Market Reports**: Provide pricing insights and trends
4. **Automated Pricing**: Offer dynamic pricing tools
5. **A/B Testing**: Test pricing strategies across similar properties

## Conclusion

The Wezo.ae pricing architecture provides a robust, flexible system that enables property owners to implement sophisticated revenue management strategies. By combining base pricing, rate plans, daily overrides, restrictions, and promotions, the platform can accommodate any pricing scenario while maintaining data integrity and calculation accuracy.

The system is designed to scale from simple single-rate properties to complex multi-strategy listings, ensuring that both small property owners and large property management companies can effectively manage their pricing and maximize revenue.