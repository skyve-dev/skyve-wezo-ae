import prisma from '../config/database';
import propertyPricingService from './property-pricing.service';
import { ModifierType } from '@prisma/client';
import { addDays, differenceInDays } from 'date-fns';

export interface BookingCriteria {
  propertyId: string;
  checkInDate: Date;
  checkOutDate: Date;
  guestCount: number;
  isHalfDay?: boolean;
}

export interface NightlyPrice {
  date: Date;
  basePrice: number;
  finalPrice: number;
  isOverride: boolean;
  reason?: string;
}

export interface BookingPriceBreakdown {
  nightlyPrices: NightlyPrice[];
  baseTotal: number;
  ratePlanModifier?: {
    type: 'Percentage' | 'FixedAmount';
    value: number;
    description: string;
  };
  finalTotal: number;
  nights: number;
  averagePricePerNight: number;
}

export interface RatePlanOption {
  ratePlan: any | null; // null for direct booking
  name: string;
  description?: string;
  totalPrice: number;
  pricePerNight: number;
  savings: number; // positive = discount, negative = premium
  features?: any;
  cancellationPolicy?: any;
  priceBreakdown: BookingPriceBreakdown;
}

export interface BookingOptions {
  propertyId: string;
  checkInDate: Date;
  checkOutDate: Date;
  nights: number;
  guestCount: number;
  isHalfDay: boolean;
  baseTotal: number;
  options: RatePlanOption[];
}

export class BookingCalculatorService {

  /**
   * Calculate all booking options (direct + rate plans) for a property
   */
  async calculateBookingOptions(criteria: BookingCriteria): Promise<BookingOptions> {
    const { propertyId, checkInDate, checkOutDate, guestCount, isHalfDay = false } = criteria;
    
    // Validate dates
    const nights = differenceInDays(checkOutDate, checkInDate);
    if (nights <= 0) {
      throw new Error('Check-out date must be after check-in date');
    }

    // Validate property exists and is bookable
    const property = await prisma.property.findUnique({
      where: { propertyId },
      include: { 
        pricing: true,
        ratePlans: {
          where: { isActive: true },
          include: {
            features: true,
            cancellationPolicy: true
          },
          orderBy: { priority: 'asc' }
        }
      }
    });

    if (!property) {
      throw new Error('Property not found');
    }

    if (property.status !== 'Live') {
      throw new Error('Property is not available for booking');
    }

    if (!property.pricing) {
      throw new Error('Property pricing not configured');
    }

    // 1. Calculate base pricing for each night
    const nightlyPrices: NightlyPrice[] = [];
    let baseTotal = 0;

    for (let i = 0; i < nights; i++) {
      const date = addDays(checkInDate, i);
      const basePrice = await propertyPricingService.getBasePrice(propertyId, date, isHalfDay);
      
      // Check if this price comes from a date override
      const override = await prisma.datePriceOverride.findUnique({
        where: { propertyId_date: { propertyId, date } }
      });

      nightlyPrices.push({
        date,
        basePrice,
        finalPrice: basePrice, // Will be modified for rate plans
        isOverride: !!override,
        reason: override?.reason || undefined
      });

      baseTotal += basePrice;
    }

    // 2. Create options array starting with direct booking
    const options: RatePlanOption[] = [];

    // Always include "Direct Booking" option (no rate plan)
    options.push({
      ratePlan: null,
      name: 'Standard Rate',
      description: 'Direct property booking with flexible cancellation',
      totalPrice: baseTotal,
      pricePerNight: Math.round((baseTotal / nights) * 100) / 100,
      savings: 0,
      features: null,
      cancellationPolicy: {
        type: 'FullyFlexible',
        description: 'Full refund up to 7 days before check-in'
      },
      priceBreakdown: {
        nightlyPrices: nightlyPrices.map(np => ({ ...np })), // Clone for direct booking
        baseTotal,
        finalTotal: baseTotal,
        nights,
        averagePricePerNight: Math.round((baseTotal / nights) * 100) / 100
      }
    });

    // 3. Add eligible rate plan options
    const daysInAdvance = differenceInDays(checkInDate, new Date());
    
    for (const ratePlan of property.ratePlans) {
      // Check if rate plan is eligible for this booking
      if (!this.isRatePlanEligible(ratePlan, { nights, daysInAdvance, guestCount })) {
        continue;
      }

      // Calculate modified prices for each night
      const modifiedNightlyPrices: NightlyPrice[] = nightlyPrices.map(nightlyPrice => ({
        ...nightlyPrice,
        finalPrice: this.applyRatePlanModifier(nightlyPrice.basePrice, ratePlan)
      }));

      const modifiedTotal = modifiedNightlyPrices.reduce((sum, np) => sum + np.finalPrice, 0);
      const finalTotal = Math.round(modifiedTotal * 100) / 100;
      const savings = Math.round((baseTotal - finalTotal) * 100) / 100;

      options.push({
        ratePlan,
        name: ratePlan.name,
        description: ratePlan.description || undefined,
        totalPrice: finalTotal,
        pricePerNight: Math.round((finalTotal / nights) * 100) / 100,
        savings,
        features: ratePlan.features,
        cancellationPolicy: ratePlan.cancellationPolicy,
        priceBreakdown: {
          nightlyPrices: modifiedNightlyPrices,
          baseTotal,
          ratePlanModifier: {
            type: ratePlan.priceModifierType,
            value: ratePlan.priceModifierValue,
            description: this.getModifierDescription(ratePlan.priceModifierType, ratePlan.priceModifierValue)
          },
          finalTotal,
          nights,
          averagePricePerNight: Math.round((finalTotal / nights) * 100) / 100
        }
      });
    }

    // 4. Sort options by price (cheapest first)
    options.sort((a, b) => a.totalPrice - b.totalPrice);

    return {
      propertyId,
      checkInDate,
      checkOutDate,
      nights,
      guestCount,
      isHalfDay,
      baseTotal,
      options
    };
  }

  /**
   * Apply rate plan modifier to a base price
   */
  private applyRatePlanModifier(basePrice: number, ratePlan: any): number {
    if (ratePlan.priceModifierType === ModifierType.Percentage) {
      const multiplier = 1 + (ratePlan.priceModifierValue / 100);
      return Math.round(basePrice * multiplier * 100) / 100;
    } else {
      // FixedAmount
      return Math.max(0, Math.round((basePrice + ratePlan.priceModifierValue) * 100) / 100);
    }
  }

  /**
   * Check if a rate plan is eligible for the booking criteria
   */
  private isRatePlanEligible(
    ratePlan: any,
    criteria: { nights: number; daysInAdvance: number; guestCount: number }
  ): boolean {
    const { nights, daysInAdvance, guestCount } = criteria;

    // Check minimum stay
    if (ratePlan.minStay && nights < ratePlan.minStay) {
      return false;
    }

    // Check maximum stay
    if (ratePlan.maxStay && nights > ratePlan.maxStay) {
      return false;
    }

    // Check advance booking requirements
    if (ratePlan.minAdvanceBooking && daysInAdvance < ratePlan.minAdvanceBooking) {
      return false;
    }

    if (ratePlan.maxAdvanceBooking && daysInAdvance > ratePlan.maxAdvanceBooking) {
      return false;
    }

    // Check guest count
    if (ratePlan.minGuests && guestCount < ratePlan.minGuests) {
      return false;
    }

    if (ratePlan.maxGuests && guestCount > ratePlan.maxGuests) {
      return false;
    }

    return true;
  }

  /**
   * Get human-readable description of rate plan modifier
   */
  private getModifierDescription(type: ModifierType, value: number): string {
    if (type === ModifierType.Percentage) {
      if (value > 0) {
        return `+${value}% premium`;
      } else if (value < 0) {
        return `${Math.abs(value)}% discount`;
      } else {
        return 'No price adjustment';
      }
    } else {
      // FixedAmount
      if (value > 0) {
        return `+AED ${value} per night`;
      } else if (value < 0) {
        return `AED ${Math.abs(value)} discount per night`;
      } else {
        return 'No price adjustment';
      }
    }
  }

  /**
   * Calculate booking price for a specific rate plan (or direct booking)
   */
  async calculateBookingPrice(
    criteria: BookingCriteria,
    ratePlanId?: string
  ): Promise<RatePlanOption> {
    const options = await this.calculateBookingOptions(criteria);
    
    if (!ratePlanId) {
      // Return direct booking option (first one, which is always direct)
      return options.options[0];
    }

    // Find the specific rate plan option
    const selectedOption = options.options.find(opt => 
      opt.ratePlan && opt.ratePlan.id === ratePlanId
    );

    if (!selectedOption) {
      throw new Error('Selected rate plan not available for this booking');
    }

    return selectedOption;
  }
}

export default new BookingCalculatorService();