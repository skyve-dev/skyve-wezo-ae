import { Request, Response } from 'express';
import ratePlanService, { RatePlanCreateData, BookingSearchCriteria } from '../services/rateplan.service';
import { ModifierType, CancellationType } from '@prisma/client';

/**
 * Create a new rate plan for a property
 * POST /api/properties/:propertyId/rate-plans
 */
export const createRatePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { propertyId } = req.params;
    const ratePlanData: RatePlanCreateData = req.body;

    // Validate required fields
    if (!ratePlanData.name || !ratePlanData.priceModifierType || ratePlanData.priceModifierValue === undefined) {
      res.status(400).json({ 
        error: 'Missing required fields: name, priceModifierType, priceModifierValue' 
      });
      return;
    }

    // Validate modifier type
    if (!Object.values(ModifierType).includes(ratePlanData.priceModifierType)) {
      res.status(400).json({ 
        error: 'Invalid priceModifierType. Must be Percentage or FixedAmount' 
      });
      return;
    }

    // Validate cancellation policy type if provided
    if (ratePlanData.cancellationPolicy?.type && !Object.values(CancellationType).includes(ratePlanData.cancellationPolicy.type)) {
      res.status(400).json({ 
        error: 'Invalid cancellation policy type. Must be FullyFlexible, Moderate, or NonRefundable' 
      });
      return;
    }

    const ratePlan = await ratePlanService.createRatePlan(propertyId, req.user.id, ratePlanData);

    res.status(201).json({
      message: 'Rate plan created successfully',
      ratePlan,
    });
  } catch (error: any) {
    console.error('Create rate plan error:', error);
    
    if (error.message.includes('not found') || error.message.includes('permission')) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes('required') || error.message.includes('must be') || error.message.includes('cannot exceed')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Get all rate plans for a property
 * GET /api/properties/:propertyId/rate-plans
 */
export const getRatePlansForProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { propertyId } = req.params;
    const ratePlans = await ratePlanService.getRatePlansForProperty(propertyId, req.user.id);

    res.json({
      message: 'Rate plans retrieved successfully',
      ratePlans,
      count: ratePlans.length,
    });
  } catch (error: any) {
    console.error('Get rate plans error:', error);
    
    if (error.message.includes('not found') || error.message.includes('permission')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Get public rate plans for a property (no authentication required)
 * GET /api/properties/:propertyId/rate-plans/public
 */
export const getPublicRatePlansForProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { propertyId } = req.params;
    
    // Get only active, public rate plans for guest browsing
    const ratePlans = await ratePlanService.getPublicRatePlansForProperty(propertyId);

    res.json({
      message: 'Public rate plans retrieved successfully',
      ratePlans,
      count: ratePlans.length,
    });
  } catch (error: any) {
    console.error('Get public rate plans error:', error);
    
    if (error.message.includes('not found')) {
      res.status(404).json({ error: 'Property not found or has no available rate plans' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Get a single rate plan by ID
 * GET /api/rate-plans/:ratePlanId
 */
export const getRatePlanById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { ratePlanId } = req.params;
    const ratePlan = await ratePlanService.getRatePlanById(ratePlanId, req.user.id);

    res.json({
      message: 'Rate plan retrieved successfully',
      ratePlan,
    });
  } catch (error: any) {
    console.error('Get rate plan error:', error);
    
    if (error.message.includes('not found') || error.message.includes('permission')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Update a rate plan
 * PUT /api/rate-plans/:ratePlanId
 */
export const updateRatePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { ratePlanId } = req.params;
    const updateData = req.body;

    // Validate modifier type if provided
    if (updateData.priceModifierType && !Object.values(ModifierType).includes(updateData.priceModifierType)) {
      res.status(400).json({ 
        error: 'Invalid priceModifierType. Must be Percentage or FixedAmount' 
      });
      return;
    }

    const ratePlan = await ratePlanService.updateRatePlan(ratePlanId, req.user.id, updateData);

    res.json({
      message: 'Rate plan updated successfully',
      ratePlan,
    });
  } catch (error: any) {
    console.error('Update rate plan error:', error);
    
    if (error.message.includes('not found') || error.message.includes('permission')) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes('required') || error.message.includes('must be') || error.message.includes('cannot exceed')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Delete a rate plan (smart deletion - hard/soft/blocked based on dependencies)
 * DELETE /api/rate-plans/:ratePlanId
 */
export const deleteRatePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { ratePlanId } = req.params;
    const result = await ratePlanService.deleteRatePlan(ratePlanId, req.user.id);

    // Handle blocked deletion (409 Conflict)
    if (result.type === 'blocked') {
      res.status(409).json({
        error: result.message,
        type: result.type,
        details: result.details
      });
      return;
    }

    // Handle successful deletion (hard or soft)
    res.json({
      message: result.message,
      type: result.type,
      details: result.details
    });
  } catch (error: any) {
    console.error('Delete rate plan error:', error);
    
    if (error.message.includes('not found') || error.message.includes('permission')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Calculate booking options for property (New booking engine endpoint)
 * POST /api/properties/:propertyId/calculate-booking
 */
export const calculateBookingOptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { propertyId } = req.params;
    const { 
      checkInDate, 
      checkOutDate, 
      isHalfDay,
      guestCount, 
      bookingDate 
    } = req.body;

    // Validate required parameters
    if (!checkInDate || !guestCount) {
      res.status(400).json({ 
        error: 'Missing required fields: checkInDate and guestCount' 
      });
      return;
    }

    // Validate checkOutDate for full-day bookings
    if (!isHalfDay && !checkOutDate) {
      res.status(400).json({ 
        error: 'checkOutDate is required for full-day bookings' 
      });
      return;
    }

    // Parse and validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = checkOutDate ? new Date(checkOutDate) : undefined;
    const booking = bookingDate ? new Date(bookingDate) : new Date();

    if (isNaN(checkIn.getTime()) || (checkOut && isNaN(checkOut.getTime()))) {
      res.status(400).json({ 
        error: 'Invalid date format. Use YYYY-MM-DD format' 
      });
      return;
    }

    if (checkOut && checkIn >= checkOut) {
      res.status(400).json({ 
        error: 'Check-in date must be before check-out date' 
      });
      return;
    }

    if (checkIn < new Date(new Date().setHours(0, 0, 0, 0))) {
      res.status(400).json({ 
        error: 'Check-in date cannot be in the past' 
      });
      return;
    }

    // Parse and validate number of guests
    const guests = parseInt(guestCount);
    if (isNaN(guests) || guests < 1 || guests > 20) {
      res.status(400).json({ 
        error: 'Number of guests must be between 1 and 20' 
      });
      return;
    }

    const criteria: BookingSearchCriteria = {
      propertyId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      isHalfDay: Boolean(isHalfDay),
      guestCount: guests,
      bookingDate: booking,
    };

    const results = await ratePlanService.calculateBookingOptions(criteria);

    res.json({
      message: results.options.length > 0 ? 'Booking options calculated successfully' : 'No booking options available for the selected criteria',
      ...results
    });
  } catch (error: any) {
    console.error('Calculate booking options error:', error);
    
    if (error.message.includes('not found') || error.message.includes('not available')) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes('must be') || error.message.includes('cannot be') || error.message.includes('required')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Toggle rate plan activation status
 * PATCH /api/rate-plans/:ratePlanId/toggle-status
 */
export const toggleRatePlanStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { ratePlanId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      res.status(400).json({ error: 'isActive must be a boolean value' });
      return;
    }

    const ratePlan = await ratePlanService.updateRatePlan(ratePlanId, req.user.id, { isActive });

    res.json({
      message: `Rate plan ${isActive ? 'activated' : 'deactivated'} successfully`,
      ratePlan: {
        id: ratePlan.id,
        name: ratePlan.name,
        isActive: ratePlan.isActive,
      },
    });
  } catch (error: any) {
    console.error('Toggle rate plan status error:', error);
    
    if (error.message.includes('not found') || error.message.includes('permission')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Get rate plan statistics and analytics
 * GET /api/rate-plans/:ratePlanId/stats
 */
export const getRatePlanStats = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { ratePlanId } = req.params;
    const ratePlan = await ratePlanService.getRatePlanById(ratePlanId, req.user.id);

    // Calculate basic statistics
    const stats = {
      ratePlan: {
        id: ratePlan.id,
        name: ratePlan.name,
        priceModifierType: ratePlan.priceModifierType,
        priceModifierValue: ratePlan.priceModifierValue,
        priority: ratePlan.priority,
        isActive: ratePlan.isActive,
        isDefault: ratePlan.isDefault,
      },
      usage: {
        totalReservations: ratePlan.stats?.reservationCount || 0,
      },
      configuration: {
        hasFeatures: !!ratePlan.features,
        hasCancellationPolicy: !!ratePlan.cancellationPolicy,
        includedAmenitiesCount: ratePlan.features?.includedAmenityIds?.length || 0,
      },
      restrictions: {
        minStay: ratePlan.minStay,
        maxStay: ratePlan.maxStay,
        minAdvanceBooking: ratePlan.minAdvanceBooking,
        maxAdvanceBooking: ratePlan.maxAdvanceBooking,
        minGuests: ratePlan.minGuests,
        maxGuests: ratePlan.maxGuests,
      }
    };

    res.json({
      message: 'Rate plan statistics retrieved successfully',
      stats,
    });
  } catch (error: any) {
    console.error('Get rate plan stats error:', error);
    
    if (error.message.includes('not found') || error.message.includes('permission')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Get available modifier types and validation rules
 * GET /api/rate-plans/metadata/modifier-types
 */
export const getModifierTypesMetadata = async (_req: Request, res: Response): Promise<void> => {
  try {
    const metadata = {
      modifierTypes: [
        {
          value: ModifierType.Percentage,
          label: 'Percentage Modifier',
          description: 'Apply percentage change to base price (e.g., -20% = 20% discount, +30% = 30% surcharge)',
          valueValidation: {
            min: -100,
            max: 100,
            unit: '%',
          },
          examples: [
            { value: -20, description: '20% discount from base price' },
            { value: 0, description: 'No change from base price' },
            { value: 30, description: '30% surcharge on base price' }
          ]
        },
        {
          value: ModifierType.FixedAmount,
          label: 'Fixed Amount Modifier',
          description: 'Apply fixed AED amount change to base price (e.g., -50 = 50 AED discount, +100 = 100 AED surcharge)',
          valueValidation: {
            min: -99999.99,
            max: 99999.99,
            unit: 'AED',
          },
          examples: [
            { value: -50, description: '50 AED discount per night' },
            { value: 0, description: 'No change from base price' },
            { value: 100, description: '100 AED surcharge per night' }
          ]
        },
      ],
      cancellationTypes: [
        {
          value: CancellationType.FullyFlexible,
          label: 'Fully Flexible',
          description: 'Full refund based on days before check-in',
        },
        {
          value: CancellationType.Moderate,
          label: 'Moderate',
          description: 'Partial refund based on days before check-in',
        },
        {
          value: CancellationType.NonRefundable,
          label: 'Non-Refundable',
          description: 'No refund under any circumstances',
        },
      ],
      restrictionRanges: {
        minStay: { min: 1, max: 365, unit: 'nights' },
        maxStay: { min: 1, max: 365, unit: 'nights' },
        minAdvanceBooking: { min: 0, max: 365, unit: 'days' },
        maxAdvanceBooking: { min: 0, max: 365, unit: 'days' },
        minGuests: { min: 1, max: 20, unit: 'guests' },
        maxGuests: { min: 1, max: 20, unit: 'guests' },
        priority: { min: 1, max: 999, unit: 'priority level' }
      }
    };

    res.json({
      message: 'Rate plan metadata retrieved successfully',
      metadata,
    });
  } catch (error: any) {
    console.error('Get metadata error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};