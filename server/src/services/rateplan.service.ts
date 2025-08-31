import prisma from '../config/database';
import { ModifierType, CancellationType } from '@prisma/client';
import propertyPricingService from './property-pricing.service';

export interface RatePlanCreateData {
  name: string;
  description?: string;
  priceModifierType: ModifierType;
  priceModifierValue: number;
  minStay?: number;
  maxStay?: number;
  minAdvanceBooking?: number;
  maxAdvanceBooking?: number;
  minGuests?: number;
  maxGuests?: number;
  isActive?: boolean;
  isDefault?: boolean;
  priority?: number;
  features?: {
    includedAmenityIds: string[];
  };
  cancellationPolicy?: {
    type: CancellationType;
    freeCancellationDays?: number;
    partialRefundDays?: number;
  };
}

export interface RatePlanUpdateData {
  name?: string;
  description?: string;
  priceModifierType?: ModifierType;
  priceModifierValue?: number;
  minStay?: number;
  maxStay?: number;
  minAdvanceBooking?: number;
  maxAdvanceBooking?: number;
  minGuests?: number;
  maxGuests?: number;
  isActive?: boolean;
  isDefault?: boolean;
  priority?: number;
}

export interface BookingSearchCriteria {
  propertyId: string;
  checkInDate: Date;
  checkOutDate?: Date;  // Optional for half-day bookings
  isHalfDay?: boolean;
  guestCount: number;
  bookingDate?: Date;   // When the booking is being made (for advance booking restrictions)
}

export interface BookingOption {
  ratePlan: {
    id: string;
    name: string;
    description?: string;
  };
  pricing: {
    totalPrice: number;
    basePrice: number;
    modifier: number;
    savings: number;
    pricePerNight?: number;  // For multi-night stays
  };
  duration: {
    isHalfDay: boolean;
    nights: number;
  };
  amenities: {
    included: Array<{ id: string; name: string; category: string }>;
    extraCost: Array<{ id: string; name: string; category: string }>;
  };
  cancellation: {
    type: CancellationType;
    freeCancellationDays?: number;
    partialRefundDays?: number;
    description: string;
  };
  restrictions: {
    minStay?: number;
    maxStay?: number;
    minGuests?: number;
    maxGuests?: number;
    minAdvanceBooking?: number;
    maxAdvanceBooking?: number;
  };
  isEligible: boolean;
  ineligibilityReasons: string[];
}

export class RatePlanService {

  /**
   * Create a new rate plan for a property
   */
  async createRatePlan(
    propertyId: string,
    userId: string,
    ratePlanData: RatePlanCreateData
  ): Promise<any> {
    // Verify property ownership
    await this.verifyPropertyOwnership(propertyId, userId);

    // Validate rate plan data
    this.validateRatePlanData(ratePlanData);

    // If this is set as default, unset other defaults first
    if (ratePlanData.isDefault) {
      await prisma.ratePlan.updateMany({
        where: { propertyId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const ratePlan = await prisma.$transaction(async (tx) => {
      // Create the rate plan
      const createdRatePlan = await tx.ratePlan.create({
        data: {
          propertyId,
          name: ratePlanData.name,
          description: ratePlanData.description,
          priceModifierType: ratePlanData.priceModifierType,
          priceModifierValue: ratePlanData.priceModifierValue,
          minStay: ratePlanData.minStay,
          maxStay: ratePlanData.maxStay,
          minAdvanceBooking: ratePlanData.minAdvanceBooking,
          maxAdvanceBooking: ratePlanData.maxAdvanceBooking,
          minGuests: ratePlanData.minGuests,
          maxGuests: ratePlanData.maxGuests,
          isActive: ratePlanData.isActive ?? true,
          isDefault: ratePlanData.isDefault ?? false,
          priority: ratePlanData.priority ?? 100
        }
      });

      // Create features if provided
      if (ratePlanData.features) {
        await tx.ratePlanFeatures.create({
          data: {
            ratePlanId: createdRatePlan.id,
            includedAmenityIds: ratePlanData.features.includedAmenityIds
          }
        });
      }

      // Create cancellation policy if provided
      if (ratePlanData.cancellationPolicy) {
        await tx.cancellationPolicy.create({
          data: {
            ratePlanId: createdRatePlan.id,
            type: ratePlanData.cancellationPolicy.type,
            freeCancellationDays: ratePlanData.cancellationPolicy.freeCancellationDays,
            partialRefundDays: ratePlanData.cancellationPolicy.partialRefundDays
          }
        });
      }

      return createdRatePlan;
    });

    // Return with relations
    return await this.getRatePlanById(ratePlan.id, userId);
  }

  /**
   * Update a rate plan
   */
  async updateRatePlan(
    ratePlanId: string,
    userId: string,
    updateData: RatePlanUpdateData
  ): Promise<any> {
    // Verify rate plan ownership
    await this.verifyRatePlanOwnership(ratePlanId, userId);

    // Validate update data
    if (Object.keys(updateData).length === 0) {
      throw new Error('No update data provided');
    }

    // Validate rate plan data if pricing fields are being updated
    if (updateData.priceModifierType || updateData.priceModifierValue !== undefined) {
      const tempData = { ...updateData } as RatePlanCreateData;
      if (!tempData.name) tempData.name = 'temp'; // Required for validation
      this.validateRatePlanData(tempData);
    }

    // If setting as default, unset other defaults first
    if (updateData.isDefault) {
      const ratePlan = await prisma.ratePlan.findUnique({
        where: { id: ratePlanId },
        select: { propertyId: true }
      });
      
      if (ratePlan) {
        await prisma.ratePlan.updateMany({
          where: { 
            propertyId: ratePlan.propertyId,
            id: { not: ratePlanId },
            isDefault: true 
          },
          data: { isDefault: false }
        });
      }
    }

    await prisma.ratePlan.update({
      where: { id: ratePlanId },
      data: updateData
    });

    return await this.getRatePlanById(ratePlanId, userId);
  }

  /**
   * Get all rate plans for a property
   */
  async getRatePlansForProperty(propertyId: string, userId: string): Promise<any[]> {
    // Verify property ownership
    await this.verifyPropertyOwnership(propertyId, userId);

    const ratePlans = await prisma.ratePlan.findMany({
      where: { propertyId },
      include: {
        features: true,
        cancellationPolicy: true,
        _count: { select: { reservations: true } }
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // Get property amenities for reference
    const property = await prisma.property.findUnique({
      where: { propertyId },
      include: { amenities: true }
    });

    return ratePlans.map(ratePlan => this.formatRatePlanResponse(ratePlan, property?.amenities || []));
  }

  /**
   * Get public rate plans for a property (no auth required)
   */
  async getPublicRatePlansForProperty(propertyId: string): Promise<any[]> {
    // Verify property exists and is active
    const property = await prisma.property.findFirst({
      where: { 
        propertyId,
        status: 'Live' // Only show rate plans for live properties
      },
      include: { amenities: true }
    });

    if (!property) {
      throw new Error('Property not found or not available for booking');
    }

    const ratePlans = await prisma.ratePlan.findMany({
      where: { 
        propertyId,
        isActive: true
      },
      include: {
        features: true,
        cancellationPolicy: true
      },
      orderBy: [
        { priority: 'asc' },
        { priceModifierValue: 'asc' } // Show cheapest first
      ]
    });

    return ratePlans.map(ratePlan => this.formatRatePlanResponse(ratePlan, property.amenities));
  }

  /**
   * Get a single rate plan by ID
   */
  async getRatePlanById(ratePlanId: string, userId: string): Promise<any> {
    // Verify rate plan ownership
    await this.verifyRatePlanOwnership(ratePlanId, userId);

    const ratePlan = await prisma.ratePlan.findUnique({
      where: { id: ratePlanId },
      include: {
        property: { include: { amenities: true } },
        features: true,
        cancellationPolicy: true,
        _count: { select: { reservations: true } }
      }
    });

    if (!ratePlan) {
      throw new Error('Rate plan not found');
    }

    return this.formatRatePlanResponse(ratePlan, ratePlan.property.amenities);
  }

  /**
   * Delete a rate plan
   */
  async deleteRatePlan(ratePlanId: string, userId: string): Promise<any> {
    // Verify rate plan ownership
    const ratePlan = await this.verifyRatePlanOwnership(ratePlanId, userId);

    // Check for active reservations
    const reservationCount = await prisma.reservation.count({
      where: { 
        ratePlanId,
        status: { in: ['Confirmed', 'Pending'] }
      }
    });

    if (reservationCount > 0) {
      return {
        type: 'blocked',
        message: 'Cannot delete rate plan with active reservations',
        details: { activeReservations: reservationCount }
      };
    }

    // Check if it's the only rate plan for the property
    const propertyRatePlansCount = await prisma.ratePlan.count({
      where: { 
        propertyId: ratePlan.propertyId,
        id: { not: ratePlanId }
      }
    });

    if (propertyRatePlansCount === 0) {
      return {
        type: 'blocked',
        message: 'Cannot delete the last rate plan for a property',
        details: { reason: 'At least one rate plan must exist per property' }
      };
    }

    // Perform cascading deletion
    await prisma.$transaction(async (tx) => {
      // Delete related records (CASCADE should handle this, but being explicit)
      await tx.ratePlanFeatures.deleteMany({ where: { ratePlanId } });
      await tx.cancellationPolicy.deleteMany({ where: { ratePlanId } });
      
      // Delete the rate plan
      await tx.ratePlan.delete({ where: { id: ratePlanId } });
    });

    return {
      type: 'hard',
      message: 'Rate plan deleted successfully',
      details: { ratePlanId, ratePlanName: ratePlan.name }
    };
  }

  /**
   * Calculate all booking options for a property and criteria
   */
  async calculateBookingOptions(criteria: BookingSearchCriteria): Promise<{
    property: { id: string; name: string };
    booking: {
      checkIn: Date;
      checkOut?: Date;
      isHalfDay: boolean;
      nights: number;
      guests: number;
    };
    basePricing: {
      total: number;
      breakdown: Array<{ date: Date; price: number; isHalfDay: boolean }>;
    };
    options: BookingOption[];
  }> {
    const { propertyId, checkInDate, checkOutDate, isHalfDay = false, guestCount, bookingDate = new Date() } = criteria;

    // Verify property exists and is active
    const property = await prisma.property.findFirst({
      where: { 
        propertyId,
        status: 'Live'
      },
      include: { amenities: true }
    });

    if (!property) {
      throw new Error('Property not found or not available for booking');
    }

    // Calculate dates and duration
    let dates: Date[];
    let nights: number;

    if (isHalfDay) {
      dates = [checkInDate];
      nights = 0;
    } else {
      if (!checkOutDate) {
        throw new Error('Check-out date is required for full-day bookings');
      }
      dates = this.getDateRange(checkInDate, checkOutDate);
      nights = dates.length;
    }

    // Calculate base pricing
    let baseTotal = 0;
    let hasBasePrice = true;
    const priceBreakdown: Array<{ date: Date; price: number; isHalfDay: boolean }> = [];

    try {
      for (const date of dates) {
        const dayPrice = await propertyPricingService.getBasePrice(propertyId, date, isHalfDay);
        baseTotal += dayPrice;
        priceBreakdown.push({
          date: new Date(date),
          price: dayPrice,
          isHalfDay
        });
      }
    } catch (error: any) {
      // If no base pricing is configured, return empty options
      if (error.message.includes('No base pricing configured')) {
        hasBasePrice = false;
      } else {
        throw error; // Re-throw other errors
      }
    }

    // If no base pricing, return empty options
    if (!hasBasePrice) {
      return {
        property: {
          id: property.propertyId,
          name: property.name
        },
        booking: {
          checkIn: checkInDate,
          checkOut: checkOutDate,
          isHalfDay,
          nights,
          guests: guestCount
        },
        basePricing: {
          total: 0,
          breakdown: []
        },
        options: []
      };
    }

    // Get all rate plans for the property
    const ratePlans = await prisma.ratePlan.findMany({
      where: { 
        propertyId,
        isActive: true
      },
      include: {
        features: true,
        cancellationPolicy: true
      },
      orderBy: [
        { priority: 'asc' }
      ]
    });

    // Calculate options for each rate plan
    const options: BookingOption[] = [];

    for (const ratePlan of ratePlans) {
      const option = await this.calculateRatePlanOption(
        ratePlan,
        property,
        baseTotal,
        nights,
        guestCount,
        bookingDate,
        checkInDate,
        isHalfDay
      );
      // Only include eligible rate plans in the options
      if (option.isEligible) {
        options.push(option);
      }
    }

    // Sort options by price (cheapest eligible first)
    options.sort((a, b) => {
      if (a.isEligible && !b.isEligible) return -1;
      if (!a.isEligible && b.isEligible) return 1;
      return a.pricing.totalPrice - b.pricing.totalPrice;
    });

    return {
      property: {
        id: property.propertyId,
        name: property.name
      },
      booking: {
        checkIn: checkInDate,
        checkOut: checkOutDate,
        isHalfDay,
        nights,
        guests: guestCount
      },
      basePricing: {
        total: baseTotal,
        breakdown: priceBreakdown
      },
      options
    };
  }

  /**
   * Calculate pricing for a specific rate plan option
   */
  private async calculateRatePlanOption(
    ratePlan: any,
    property: any,
    baseTotal: number,
    nights: number,
    guestCount: number,
    bookingDate: Date,
    checkInDate: Date,
    isHalfDay: boolean
  ): Promise<BookingOption> {
    // Apply price modifier
    let finalPrice = baseTotal;
    if (ratePlan.priceModifierType === ModifierType.Percentage) {
      finalPrice = baseTotal * (1 + ratePlan.priceModifierValue / 100);
    } else if (ratePlan.priceModifierType === ModifierType.FixedAmount) {
      if (isHalfDay) {
        finalPrice = baseTotal + ratePlan.priceModifierValue;
      } else {
        // For multi-night stays, apply fixed amount per night
        finalPrice = baseTotal + (ratePlan.priceModifierValue * nights);
      }
    }

    // Ensure price is not negative
    finalPrice = Math.max(0, finalPrice);

    // Check eligibility
    const { isEligible, reasons } = this.checkRatePlanEligibility(
      ratePlan,
      nights,
      guestCount,
      bookingDate,
      checkInDate,
      isHalfDay
    );

    // Get included and excluded amenities
    const includedAmenityIds = ratePlan.features?.includedAmenityIds || [];
    const includedAmenities = property.amenities.filter((amenity: any) =>
      includedAmenityIds.includes(amenity.id)
    );
    const excludedAmenities = property.amenities.filter((amenity: any) =>
      !includedAmenityIds.includes(amenity.id)
    );

    // Format cancellation policy
    const cancellationDescription = this.formatCancellationPolicy(ratePlan.cancellationPolicy);

    return {
      ratePlan: {
        id: ratePlan.id,
        name: ratePlan.name,
        description: ratePlan.description
      },
      pricing: {
        totalPrice: Math.round(finalPrice * 100) / 100,
        basePrice: baseTotal,
        modifier: ratePlan.priceModifierValue,
        savings: baseTotal - finalPrice,
        pricePerNight: nights > 0 ? Math.round((finalPrice / nights) * 100) / 100 : undefined
      },
      duration: {
        isHalfDay,
        nights
      },
      amenities: {
        included: includedAmenities.map((amenity: any) => ({
          id: amenity.id,
          name: amenity.name,
          category: amenity.category
        })),
        extraCost: excludedAmenities.map((amenity: any) => ({
          id: amenity.id,
          name: amenity.name,
          category: amenity.category
        }))
      },
      cancellation: {
        type: ratePlan.cancellationPolicy?.type || CancellationType.FullyFlexible,
        freeCancellationDays: ratePlan.cancellationPolicy?.freeCancellationDays,
        partialRefundDays: ratePlan.cancellationPolicy?.partialRefundDays,
        description: cancellationDescription
      },
      restrictions: {
        minStay: ratePlan.minStay,
        maxStay: ratePlan.maxStay,
        minGuests: ratePlan.minGuests,
        maxGuests: ratePlan.maxGuests,
        minAdvanceBooking: ratePlan.minAdvanceBooking,
        maxAdvanceBooking: ratePlan.maxAdvanceBooking
      },
      isEligible,
      ineligibilityReasons: reasons
    };
  }

  /**
   * Check if a rate plan is eligible for the booking criteria
   */
  private checkRatePlanEligibility(
    ratePlan: any,
    nights: number,
    guestCount: number,
    bookingDate: Date,
    checkInDate: Date,
    isHalfDay: boolean
  ): { isEligible: boolean; reasons: string[] } {
    const reasons: string[] = [];

    // Check minimum stay (only for multi-night bookings)
    if (!isHalfDay && ratePlan.minStay && nights < ratePlan.minStay) {
      reasons.push(`Minimum ${ratePlan.minStay} night${ratePlan.minStay > 1 ? 's' : ''} required`);
    }

    // Check maximum stay (only for multi-night bookings)
    if (!isHalfDay && ratePlan.maxStay && nights > ratePlan.maxStay) {
      reasons.push(`Maximum ${ratePlan.maxStay} night${ratePlan.maxStay > 1 ? 's' : ''} allowed`);
    }

    // Check guest count
    if (ratePlan.minGuests && guestCount < ratePlan.minGuests) {
      reasons.push(`Minimum ${ratePlan.minGuests} guest${ratePlan.minGuests > 1 ? 's' : ''} required`);
    }

    if (ratePlan.maxGuests && guestCount > ratePlan.maxGuests) {
      reasons.push(`Maximum ${ratePlan.maxGuests} guest${ratePlan.maxGuests > 1 ? 's' : ''} allowed`);
    }

    // Check advance booking requirements
    const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (ratePlan.minAdvanceBooking && daysUntilCheckIn < ratePlan.minAdvanceBooking) {
      reasons.push(`Must book at least ${ratePlan.minAdvanceBooking} day${ratePlan.minAdvanceBooking > 1 ? 's' : ''} in advance`);
    }

    if (ratePlan.maxAdvanceBooking && daysUntilCheckIn > ratePlan.maxAdvanceBooking) {
      reasons.push(`Cannot book more than ${ratePlan.maxAdvanceBooking} day${ratePlan.maxAdvanceBooking > 1 ? 's' : ''} in advance`);
    }

    return {
      isEligible: reasons.length === 0,
      reasons
    };
  }

  /**
   * Generate date range between two dates
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
   * Format cancellation policy description
   */
  private formatCancellationPolicy(policy: any): string {
    if (!policy) {
      return 'Fully flexible cancellation';
    }

    switch (policy.type) {
      case CancellationType.NonRefundable:
        return 'Non-refundable - no refunds allowed';
      
      case CancellationType.Moderate:
        if (policy.freeCancellationDays && policy.partialRefundDays) {
          return `Free cancellation up to ${policy.freeCancellationDays} days before check-in, 50% refund up to ${policy.partialRefundDays} days before`;
        }
        return 'Moderate cancellation policy';
      
      case CancellationType.FullyFlexible:
      default:
        if (policy.freeCancellationDays) {
          return `Free cancellation up to ${policy.freeCancellationDays} day${policy.freeCancellationDays > 1 ? 's' : ''} before check-in`;
        }
        return 'Fully flexible cancellation';
    }
  }

  /**
   * Format rate plan response with amenity details
   */
  private formatRatePlanResponse(ratePlan: any, propertyAmenities: any[]): any {
    const includedAmenityIds = ratePlan.features?.includedAmenityIds || [];
    
    const includedAmenities = propertyAmenities.filter(amenity =>
      includedAmenityIds.includes(amenity.id)
    );
    
    const excludedAmenities = propertyAmenities.filter(amenity =>
      !includedAmenityIds.includes(amenity.id)
    );

    return {
      id: ratePlan.id,
      name: ratePlan.name,
      description: ratePlan.description,
      priceModifierType: ratePlan.priceModifierType,
      priceModifierValue: ratePlan.priceModifierValue,
      minStay: ratePlan.minStay,
      maxStay: ratePlan.maxStay,
      minAdvanceBooking: ratePlan.minAdvanceBooking,
      maxAdvanceBooking: ratePlan.maxAdvanceBooking,
      minGuests: ratePlan.minGuests,
      maxGuests: ratePlan.maxGuests,
      isActive: ratePlan.isActive,
      isDefault: ratePlan.isDefault,
      priority: ratePlan.priority,
      features: {
        includedAmenityIds,
        includedAmenities: includedAmenities.map(amenity => ({
          id: amenity.id,
          name: amenity.name,
          category: amenity.category
        })),
        excludedAmenities: excludedAmenities.map(amenity => ({
          id: amenity.id,
          name: amenity.name,
          category: amenity.category
        }))
      },
      cancellationPolicy: ratePlan.cancellationPolicy ? {
        type: ratePlan.cancellationPolicy.type,
        freeCancellationDays: ratePlan.cancellationPolicy.freeCancellationDays,
        partialRefundDays: ratePlan.cancellationPolicy.partialRefundDays,
        description: this.formatCancellationPolicy(ratePlan.cancellationPolicy)
      } : null,
      stats: {
        reservationCount: ratePlan._count?.reservations || 0
      },
      createdAt: ratePlan.createdAt,
      updatedAt: ratePlan.updatedAt
    };
  }

  /**
   * Validate rate plan data
   */
  private validateRatePlanData(data: RatePlanCreateData): void {
    // Validate required fields
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Rate plan name is required');
    }

    if (data.name.length > 100) {
      throw new Error('Rate plan name cannot exceed 100 characters');
    }

    if (data.description && data.description.length > 500) {
      throw new Error('Rate plan description cannot exceed 500 characters');
    }

    // Validate price modifier
    if (data.priceModifierType === ModifierType.Percentage) {
      if (data.priceModifierValue > 100) {
        throw new Error('Percentage modifier cannot exceed 100%');
      }
      if (data.priceModifierValue < -100) {
        throw new Error('Percentage modifier cannot be less than -100%');
      }
    }

    if (data.priceModifierType === ModifierType.FixedAmount) {
      if (data.priceModifierValue < -99999.99 || data.priceModifierValue > 99999.99) {
        throw new Error('Fixed amount modifier must be between -99,999.99 and 99,999.99');
      }
    }

    // Validate stay restrictions
    if (data.minStay !== undefined && (data.minStay < 1 || data.minStay > 365)) {
      throw new Error('Minimum stay must be between 1 and 365 nights');
    }

    if (data.maxStay !== undefined && (data.maxStay < 1 || data.maxStay > 365)) {
      throw new Error('Maximum stay must be between 1 and 365 nights');
    }

    if (data.minStay && data.maxStay && data.minStay > data.maxStay) {
      throw new Error('Minimum stay cannot exceed maximum stay');
    }

    // Validate guest restrictions
    if (data.minGuests !== undefined && (data.minGuests < 1 || data.minGuests > 20)) {
      throw new Error('Minimum guests must be between 1 and 20');
    }

    if (data.maxGuests !== undefined && (data.maxGuests < 1 || data.maxGuests > 20)) {
      throw new Error('Maximum guests must be between 1 and 20');
    }

    if (data.minGuests && data.maxGuests && data.minGuests > data.maxGuests) {
      throw new Error('Minimum guests cannot exceed maximum guests');
    }

    // Validate advance booking restrictions
    if (data.minAdvanceBooking !== undefined && (data.minAdvanceBooking < 0 || data.minAdvanceBooking > 365)) {
      throw new Error('Minimum advance booking must be between 0 and 365 days');
    }

    if (data.maxAdvanceBooking !== undefined && (data.maxAdvanceBooking < 0 || data.maxAdvanceBooking > 365)) {
      throw new Error('Maximum advance booking must be between 0 and 365 days');
    }

    if (data.minAdvanceBooking && data.maxAdvanceBooking && data.minAdvanceBooking > data.maxAdvanceBooking) {
      throw new Error('Minimum advance booking cannot exceed maximum advance booking');
    }

    // Validate priority
    if (data.priority !== undefined && (data.priority < 1 || data.priority > 999)) {
      throw new Error('Priority must be between 1 and 999');
    }
  }

  /**
   * Verify property ownership
   */
  private async verifyPropertyOwnership(propertyId: string, userId: string): Promise<any> {
    const property = await prisma.property.findFirst({
      where: {
        propertyId,
        ownerId: userId
      }
    });

    if (!property) {
      throw new Error('Property not found or you do not have permission to access it');
    }

    return property;
  }

  /**
   * Verify rate plan ownership
   */
  private async verifyRatePlanOwnership(ratePlanId: string, userId: string): Promise<any> {
    const ratePlan = await prisma.ratePlan.findFirst({
      where: {
        id: ratePlanId,
        property: {
          ownerId: userId
        }
      }
    });

    if (!ratePlan) {
      throw new Error('Rate plan not found or you do not have permission to access it');
    }

    return ratePlan;
  }
}

export default new RatePlanService();