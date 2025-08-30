import prisma from '../config/database';
import { PriceAdjustmentType, RatePlanType, RatePlanRestrictionType } from '@prisma/client';

export interface RatePlanCreateData {
  name: string;
  type: RatePlanType;
  description?: string;
  includesBreakfast?: boolean;
  adjustmentType: PriceAdjustmentType;
  adjustmentValue: number;
  baseRatePlanId?: string;
  priority?: number;
  allowConcurrentRates?: boolean;
  isActive?: boolean;
  activeDays?: number[];
  restrictions?: RatePlanRestrictionData[];
  cancellationPolicy?: CancellationPolicyData;
}

export interface RatePlanRestrictionData {
  type: RatePlanRestrictionType;
  value?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface CancellationPolicyData {
  tiers: CancellationTierData[];
}

export interface CancellationTierData {
  daysBeforeCheckIn: number;
  refundPercentage: number;
  description?: string;
}

export interface RateSearchCriteria {
  propertyId: string;
  checkInDate: Date;
  checkOutDate: Date;
  numGuests: number;
  bookingDate?: Date;
}

export interface RateSearchResult {
  ratePlan: any;
  totalPrice: number;
  nightlyRates: { date: Date; rate: number }[];
  averageNightlyRate: number;
  cancellationPolicy?: any;
  includesBreakfast: boolean;
  savings?: {
    amount: number;
    percentage: number;
    comparedTo: string;
  };
}

export class RatePlanService {
  
  /**
   * Create a new rate plan for a property
   */
  async createRatePlan(propertyId: string, userId: string, data: RatePlanCreateData): Promise<any> {
    // Verify property ownership
    const property = await prisma.property.findFirst({
      where: {
        propertyId,
        ownerId: userId,
      },
    });

    if (!property) {
      throw new Error('Property not found or you do not have permission to update it');
    }

    // Validate base rate plan reference for percentage adjustments
    if (data.adjustmentType === PriceAdjustmentType.Percentage) {
      if (!data.baseRatePlanId) {
        throw new Error('baseRatePlanId is required for percentage-based rate plans');
      }

      const baseRatePlan = await prisma.ratePlan.findFirst({
        where: {
          id: data.baseRatePlanId,
          propertyId,
          adjustmentType: PriceAdjustmentType.FixedPrice,
        },
      });

      if (!baseRatePlan) {
        throw new Error('Base rate plan must be a FixedPrice type and belong to the same property');
      }
    }

    // Validate activeDays array
    const activeDays = data.activeDays || [0, 1, 2, 3, 4, 5, 6];
    if (!Array.isArray(activeDays) || activeDays.some(day => day < 0 || day > 6)) {
      throw new Error('activeDays must be an array of integers between 0-6');
    }

    // Create rate plan with related data
    const ratePlan = await prisma.ratePlan.create({
      data: {
        propertyId,
        name: data.name,
        type: data.type,
        description: data.description,
        includesBreakfast: data.includesBreakfast || false,
        adjustmentType: data.adjustmentType,
        adjustmentValue: data.adjustmentValue,
        baseRatePlanId: data.baseRatePlanId,
        priority: data.priority || 100,
        allowConcurrentRates: data.allowConcurrentRates ?? true,
        activeDays,
        
        // Create restrictions if provided
        ratePlanRestrictions: data.restrictions ? {
          create: data.restrictions.map(r => ({
            type: r.type,
            value: r.value || 0,
            startDate: r.startDate,
            endDate: r.endDate,
          })),
        } : undefined,

        // Create cancellation policy if provided
        cancellationPolicy: data.cancellationPolicy ? {
          create: {
            tiers: {
              create: data.cancellationPolicy.tiers.map(tier => ({
                daysBeforeCheckIn: tier.daysBeforeCheckIn,
                refundPercentage: tier.refundPercentage,
                description: tier.description,
              })),
            },
          },
        } : undefined,
      },
      include: {
        baseRatePlan: true,
        derivedRatePlans: true,
        ratePlanRestrictions: true,
        cancellationPolicy: {
          include: {
            tiers: {
              orderBy: { daysBeforeCheckIn: 'desc' }
            }
          }
        },
        prices: {
          take: 30,
          orderBy: { date: 'asc' },
          where: {
            date: {
              gte: new Date(),
            }
          }
        },
      },
    });

    return ratePlan;
  }

  /**
   * Update an existing rate plan
   */
  async updateRatePlan(ratePlanId: string, userId: string, data: Partial<RatePlanCreateData>): Promise<any> {
    // Verify ownership through property
    const existingRatePlan = await prisma.ratePlan.findFirst({
      where: {
        id: ratePlanId,
        property: {
          ownerId: userId,
        },
      },
      include: {
        property: true,
      },
    });

    if (!existingRatePlan) {
      throw new Error('Rate plan not found or you do not have permission to update it');
    }

    // Validate adjustment value for negative values (only allowed for percentage adjustments)
    if (data.adjustmentValue !== undefined && data.adjustmentValue < 0) {
      const finalAdjustmentType = data.adjustmentType || existingRatePlan.adjustmentType;
      if (finalAdjustmentType !== PriceAdjustmentType.Percentage) {
        throw new Error('adjustmentValue must be a positive number for FixedPrice and FixedDiscount rate plans');
      }
    }

    // Validate base rate plan if changing to percentage type
    if (data.adjustmentType === PriceAdjustmentType.Percentage && data.baseRatePlanId) {
      const baseRatePlan = await prisma.ratePlan.findFirst({
        where: {
          id: data.baseRatePlanId,
          propertyId: existingRatePlan.propertyId,
          adjustmentType: PriceAdjustmentType.FixedPrice,
        },
      });

      if (!baseRatePlan) {
        throw new Error('Base rate plan must be a FixedPrice type and belong to the same property');
      }
    }

    // Update rate plan
    const updatedRatePlan = await prisma.ratePlan.update({
      where: { id: ratePlanId },
      data: {
        name: data.name,
        type: data.type,
        description: data.description,
        includesBreakfast: data.includesBreakfast,
        adjustmentType: data.adjustmentType,
        adjustmentValue: data.adjustmentValue,
        baseRatePlanId: data.baseRatePlanId,
        priority: data.priority,
        allowConcurrentRates: data.allowConcurrentRates,
        activeDays: data.activeDays,
      },
      include: {
        baseRatePlan: true,
        derivedRatePlans: true,
        ratePlanRestrictions: true,
        cancellationPolicy: {
          include: {
            tiers: {
              orderBy: { daysBeforeCheckIn: 'desc' }
            }
          }
        },
        prices: {
          take: 30,
          orderBy: { date: 'asc' },
          where: {
            date: {
              gte: new Date(),
            }
          }
        },
      },
    });

    return updatedRatePlan;
  }

  /**
   * Get all rate plans for a property
   */
  async getRatePlansForProperty(propertyId: string, userId: string): Promise<any[]> {
    // Verify property ownership
    const property = await prisma.property.findFirst({
      where: {
        propertyId,
        ownerId: userId,
      },
    });

    if (!property) {
      throw new Error('Property not found or you do not have permission to view it');
    }

    const ratePlans = await prisma.ratePlan.findMany({
      where: { propertyId },
      include: {
        baseRatePlan: {
          select: {
            id: true,
            name: true,
            adjustmentValue: true,
          }
        },
        derivedRatePlans: {
          select: {
            id: true,
            name: true,
            adjustmentValue: true,
          }
        },
        ratePlanRestrictions: true,
        cancellationPolicy: {
          include: {
            tiers: {
              orderBy: { daysBeforeCheckIn: 'desc' }
            }
          }
        },
        _count: {
          select: {
            reservations: true,
            prices: true,
          }
        }
      },
      orderBy: [
        { priority: 'asc' },
        { name: 'asc' }
      ],
    });

    return ratePlans;
  }

  /**
   * Get a single rate plan by ID
   */
  async getRatePlanById(ratePlanId: string, userId: string): Promise<any> {
    const ratePlan = await prisma.ratePlan.findFirst({
      where: {
        id: ratePlanId,
        property: {
          ownerId: userId,
        },
      },
      include: {
        property: {
          select: {
            propertyId: true,
            name: true,
          }
        },
        baseRatePlan: true,
        derivedRatePlans: true,
        ratePlanRestrictions: true,
        cancellationPolicy: {
          include: {
            tiers: {
              orderBy: { daysBeforeCheckIn: 'desc' }
            }
          }
        },
        prices: {
          take: 90,
          orderBy: { date: 'asc' },
          where: {
            date: {
              gte: new Date(),
            }
          }
        },
        _count: {
          select: {
            reservations: true,
          }
        }
      },
    });

    if (!ratePlan) {
      throw new Error('Rate plan not found or you do not have permission to view it');
    }

    return ratePlan;
  }

  /**
   * Delete a rate plan (smart deletion - hard delete if clean, soft delete if has history, block if has dependencies)
   */
  async deleteRatePlan(ratePlanId: string, userId: string): Promise<{
    type: 'hard' | 'soft' | 'blocked',
    message: string,
    details: {
      reservationCount?: number,
      derivedRatePlansCount?: number,
      derivedRatePlanNames?: string[]
    }
  }> {
    // Check if rate plan exists and user has permission
    const ratePlan = await prisma.ratePlan.findFirst({
      where: {
        id: ratePlanId,
        property: {
          ownerId: userId,
        },
      },
      include: {
        derivedRatePlans: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            reservations: true, // All reservations (active and historical)
            prices: true,
            ratePlanRestrictions: true
          }
        }
      },
    });

    if (!ratePlan) {
      throw new Error('Rate plan not found or you do not have permission to delete it');
    }

    const reservationCount = ratePlan._count.reservations;
    const derivedRatePlansCount = ratePlan.derivedRatePlans.length;
    const derivedRatePlanNames = ratePlan.derivedRatePlans.map(rp => rp.name);

    // BLOCKED: Has dependent rate plans - cannot delete at all
    if (derivedRatePlansCount > 0) {
      return {
        type: 'blocked',
        message: `Cannot delete rate plan because ${derivedRatePlansCount} other rate plan${derivedRatePlansCount > 1 ? 's' : ''} depend${derivedRatePlansCount === 1 ? 's' : ''} on it for percentage calculations`,
        details: {
          reservationCount,
          derivedRatePlansCount,
          derivedRatePlanNames
        }
      };
    }

    // HARD DELETE: No reservations at all - can permanently delete
    if (reservationCount === 0) {
      await prisma.ratePlan.delete({
        where: { id: ratePlanId },
      });

      return {
        type: 'hard',
        message: 'Rate plan permanently deleted - no booking history existed',
        details: {
          reservationCount,
          derivedRatePlansCount
        }
      };
    }

    // SOFT DELETE: Has reservations - deactivate to preserve history
    await prisma.ratePlan.update({
      where: { id: ratePlanId },
      data: { isActive: false },
    });

    return {
      type: 'soft',
      message: `Rate plan deactivated because ${reservationCount} booking${reservationCount > 1 ? 's' : ''} exist${reservationCount === 1 ? 's' : ''} - preserving historical data`,
      details: {
        reservationCount,
        derivedRatePlansCount
      }
    };
  }

  /**
   * Search available rates for booking (Main booking engine)
   */
  async searchAvailableRates(criteria: RateSearchCriteria): Promise<RateSearchResult[]> {
    const {
      propertyId,
      checkInDate,
      checkOutDate,
      numGuests,
      bookingDate = new Date()
    } = criteria;

    // Validate dates
    if (checkInDate >= checkOutDate) {
      throw new Error('Check-in date must be before check-out date');
    }

    if (checkInDate < new Date()) {
      throw new Error('Check-in date cannot be in the past');
    }

    // Check property availability
    const unavailableDates = await this.getUnavailableDates(propertyId, checkInDate, checkOutDate);
    if (unavailableDates.length > 0) {
      return []; // Property not available
    }

    // Get all active rate plans for property
    const ratePlans = await prisma.ratePlan.findMany({
      where: {
        propertyId,
        isActive: true,
      },
      include: {
        baseRatePlan: true,
        ratePlanRestrictions: true,
        cancellationPolicy: {
          include: {
            tiers: {
              orderBy: { daysBeforeCheckIn: 'desc' }
            }
          }
        },
        prices: {
          where: {
            date: {
              gte: checkInDate,
              lt: checkOutDate,
            }
          }
        },
      },
    });

    // Filter applicable rate plans
    const applicableRatePlans = await this.filterApplicableRatePlans(
      ratePlans,
      checkInDate,
      checkOutDate,
      numGuests,
      bookingDate
    );

    // Apply priority logic
    const visibleRatePlans = this.applyPriorityLogic(applicableRatePlans);

    // Calculate pricing for each visible rate plan
    const results: RateSearchResult[] = [];

    for (const ratePlan of visibleRatePlans) {
      try {
        const nightlyRates = await this.calculateNightlyRates(ratePlan, checkInDate, checkOutDate);
        const totalPrice = nightlyRates.reduce((sum, night) => sum + night.rate, 0);
        const averageNightlyRate = totalPrice / nightlyRates.length;

        results.push({
          ratePlan: {
            id: ratePlan.id,
            name: ratePlan.name,
            type: ratePlan.type,
            description: ratePlan.description,
            priority: ratePlan.priority,
            adjustmentType: ratePlan.adjustmentType,
            adjustmentValue: ratePlan.adjustmentValue,
          },
          totalPrice,
          nightlyRates,
          averageNightlyRate,
          cancellationPolicy: ratePlan.cancellationPolicy,
          includesBreakfast: ratePlan.includesBreakfast,
        });
      } catch (error) {
        console.error(`Error calculating price for rate plan ${ratePlan.id}:`, error);
        continue; // Skip this rate plan
      }
    }

    // Sort by total price (cheapest first)
    results.sort((a, b) => a.totalPrice - b.totalPrice);

    // Add savings information
    if (results.length > 1) {
      const mostExpensive = Math.max(...results.map(r => r.totalPrice));
      results.forEach(result => {
        if (result.totalPrice < mostExpensive) {
          const savings = mostExpensive - result.totalPrice;
          result.savings = {
            amount: savings,
            percentage: Math.round((savings / mostExpensive) * 100),
            comparedTo: 'highest rate'
          };
        }
      });
    }

    return results;
  }

  /**
   * Filter rate plans based on restrictions and criteria
   */
  private async filterApplicableRatePlans(
    ratePlans: any[],
    checkInDate: Date,
    checkOutDate: Date,
    numGuests: number,
    bookingDate: Date
  ): Promise<any[]> {
    const dayOfWeek = checkInDate.getDay();
    const lengthOfStay = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysInAdvance = Math.ceil((checkInDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));

    return ratePlans.filter(ratePlan => {
      // Check day of week availability
      if (!ratePlan.activeDays.includes(dayOfWeek)) {
        return false;
      }

      // Check all restrictions
      for (const restriction of ratePlan.ratePlanRestrictions) {
        switch (restriction.type) {
          case RatePlanRestrictionType.MinLengthOfStay:
            if (lengthOfStay < restriction.value) return false;
            break;

          case RatePlanRestrictionType.MaxLengthOfStay:
            if (lengthOfStay > restriction.value) return false;
            break;

          case RatePlanRestrictionType.MinGuests:
            if (numGuests < restriction.value) return false;
            break;

          case RatePlanRestrictionType.MaxGuests:
            if (numGuests > restriction.value) return false;
            break;

          case RatePlanRestrictionType.MinAdvancedReservation:
            if (daysInAdvance < restriction.value) return false;
            break;

          case RatePlanRestrictionType.MaxAdvancedReservation:
            if (daysInAdvance > restriction.value) return false;
            break;

          case RatePlanRestrictionType.NoArrivals:
            if (this.isDateInRange(checkInDate, restriction.startDate, restriction.endDate)) {
              return false;
            }
            break;

          case RatePlanRestrictionType.NoDepartures:
            if (this.isDateInRange(checkOutDate, restriction.startDate, restriction.endDate)) {
              return false;
            }
            break;

          case RatePlanRestrictionType.SeasonalDateRange:
            if (!this.isDateInRange(checkInDate, restriction.startDate, restriction.endDate)) {
              return false;
            }
            break;
        }
      }

      return true;
    });
  }

  /**
   * Apply priority logic for concurrent vs exclusive rates
   */
  private applyPriorityLogic(ratePlans: any[]): any[] {
    // Find highest priority exclusive rate
    const exclusiveRates = ratePlans
      .filter(plan => !plan.allowConcurrentRates)
      .sort((a, b) => a.priority - b.priority);

    if (exclusiveRates.length > 0) {
      const highestPriorityExclusive = exclusiveRates[0];
      
      // Show only exclusive rate and higher/equal priority concurrent rates
      return ratePlans
        .filter(plan => plan.priority <= highestPriorityExclusive.priority)
        .sort((a, b) => a.priority - b.priority);
    }

    // No exclusive rates - show all concurrent rates
    return ratePlans.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Calculate nightly rates for a rate plan over a date range
   */
  private async calculateNightlyRates(
    ratePlan: any,
    checkInDate: Date,
    checkOutDate: Date
  ): Promise<{ date: Date; rate: number }[]> {
    const nights = this.getDateRange(checkInDate, checkOutDate);
    const nightlyRates: { date: Date; rate: number }[] = [];

    for (const night of nights) {
      const rate = await this.calculateRateForDate(ratePlan, night);
      nightlyRates.push({ date: night, rate });
    }

    return nightlyRates;
  }

  /**
   * Calculate rate for a specific date
   */
  private async calculateRateForDate(ratePlan: any, date: Date): Promise<number> {
    // Check for date-specific pricing first
    const specificPrice = ratePlan.prices.find((price: any) => 
      this.isSameDay(price.date, date)
    );
    if (specificPrice) {
      return parseFloat(specificPrice.amount);
    }

    // Calculate based on adjustment type
    switch (ratePlan.adjustmentType) {
      case PriceAdjustmentType.FixedPrice:
        return ratePlan.adjustmentValue;

      case PriceAdjustmentType.FixedDiscount:
        const baseRateForDiscount = await this.getBaseRateForDate(ratePlan.baseRatePlan, date);
        return Math.max(0, baseRateForDiscount - ratePlan.adjustmentValue);

      case PriceAdjustmentType.Percentage:
        const baseAmount = await this.getBaseRateForDate(ratePlan.baseRatePlan, date);
        const discount = baseAmount * (ratePlan.adjustmentValue / 100);
        return Math.max(0, baseAmount - discount);

      default:
        throw new Error(`Unknown adjustment type: ${ratePlan.adjustmentType}`);
    }
  }

  /**
   * Get base rate for a specific date (recursive for nested percentage plans)
   */
  private async getBaseRateForDate(baseRatePlan: any, date: Date): Promise<number> {
    if (!baseRatePlan) {
      throw new Error('Base rate plan not found for percentage calculation');
    }
    
    return this.calculateRateForDate(baseRatePlan, date);
  }

  /**
   * Get unavailable dates for a property
   */
  private async getUnavailableDates(
    propertyId: string,
    checkInDate: Date,
    checkOutDate: Date
  ): Promise<Date[]> {
    const unavailableSlots = await prisma.availability.findMany({
      where: {
        propertyId,
        date: {
          gte: checkInDate,
          lt: checkOutDate,
        },
        isAvailable: false,
      },
      select: {
        date: true,
      },
    });

    return unavailableSlots.map(slot => slot.date);
  }

  /**
   * Utility: Check if date is within a range
   */
  private isDateInRange(date: Date, startDate: Date | null, endDate: Date | null): boolean {
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  }

  /**
   * Utility: Check if two dates are the same day
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  /**
   * Utility: Generate date range (excluding checkout date)
   */
  private getDateRange(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);

    while (currentDate < endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  /**
   * Calculate refund amount based on cancellation policy
   */
  async calculateCancellationRefund(
    reservationId: string,
    cancellationDate: Date
  ): Promise<{ refundAmount: number; refundPercentage: number; description: string }> {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        ratePlan: {
          include: {
            cancellationPolicy: {
              include: {
                tiers: {
                  orderBy: { daysBeforeCheckIn: 'desc' }
                }
              }
            }
          }
        }
      }
    });

    if (!reservation) {
      throw new Error('Reservation not found');
    }

    const daysUntilCheckIn = Math.ceil(
      (reservation.checkInDate.getTime() - cancellationDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const cancellationPolicy = reservation.ratePlan.cancellationPolicy;
    if (!cancellationPolicy || !cancellationPolicy.tiers.length) {
      return {
        refundAmount: 0,
        refundPercentage: 0,
        description: 'No refund policy defined'
      };
    }

    // Find applicable tier (highest daysBeforeCheckIn that user qualifies for)
    const applicableTier = cancellationPolicy.tiers
      .filter(tier => daysUntilCheckIn >= tier.daysBeforeCheckIn)
      .sort((a, b) => b.daysBeforeCheckIn - a.daysBeforeCheckIn)[0];

    if (!applicableTier) {
      // Default to the most restrictive tier
      const mostRestrictive = cancellationPolicy.tiers
        .sort((a, b) => a.daysBeforeCheckIn - b.daysBeforeCheckIn)[0];
      
      return {
        refundAmount: (parseFloat(reservation.totalPrice.toString()) * mostRestrictive.refundPercentage) / 100,
        refundPercentage: mostRestrictive.refundPercentage,
        description: mostRestrictive.description || `${mostRestrictive.refundPercentage}% refund`
      };
    }

    const refundAmount = (parseFloat(reservation.totalPrice.toString()) * applicableTier.refundPercentage) / 100;

    return {
      refundAmount,
      refundPercentage: applicableTier.refundPercentage,
      description: applicableTier.description || `${applicableTier.refundPercentage}% refund`
    };
  }
}

export default new RatePlanService();