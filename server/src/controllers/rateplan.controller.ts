import { Request, Response } from 'express';
import ratePlanService, { RatePlanCreateData, RateSearchCriteria } from '../services/rateplan.service';
import { PriceAdjustmentType, RatePlanType, RatePlanRestrictionType } from '@prisma/client';

/**
 * Create a new rate plan for a property
 * POST /api/properties/:propertyId/rateplans
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
    if (!ratePlanData.name || !ratePlanData.adjustmentType || ratePlanData.adjustmentValue === undefined) {
      res.status(400).json({ 
        error: 'Missing required fields: name, adjustmentType, adjustmentValue' 
      });
      return;
    }

    // Validate adjustment type and base rate plan reference
    if (ratePlanData.adjustmentType === PriceAdjustmentType.Percentage && !ratePlanData.baseRatePlanId) {
      res.status(400).json({ 
        error: 'baseRatePlanId is required for percentage-based rate plans' 
      });
      return;
    }

    // Validate adjustment value (negative values allowed only for percentage adjustments)
    if (ratePlanData.adjustmentValue < 0 && ratePlanData.adjustmentType !== PriceAdjustmentType.Percentage) {
      res.status(400).json({ 
        error: 'adjustmentValue must be a positive number for FixedPrice and FixedDiscount rate plans' 
      });
      return;
    }

    // Validate percentage values bounds
    if (ratePlanData.adjustmentType === PriceAdjustmentType.Percentage) {
      if (ratePlanData.adjustmentValue > 100) {
        res.status(400).json({ 
          error: 'Percentage adjustment cannot exceed 100%' 
        });
        return;
      }
      if (ratePlanData.adjustmentValue < -100) {
        res.status(400).json({ 
          error: 'Percentage adjustment cannot be less than -100%' 
        });
        return;
      }
    }

    // Validate priority if provided
    if (ratePlanData.priority !== undefined && (ratePlanData.priority < 1 || ratePlanData.priority > 999)) {
      res.status(400).json({ 
        error: 'Priority must be between 1 and 999' 
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
    } else if (error.message.includes('required') || error.message.includes('must be') || error.message.includes('Invalid value for argument')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Get all rate plans for a property
 * GET /api/properties/:propertyId/rateplans
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
 * GET /api/rateplans/:ratePlanId
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
 * PUT /api/rateplans/:ratePlanId
 */
export const updateRatePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { ratePlanId } = req.params;
    const updateData = req.body;

    // Validate adjustment value if provided (negative values allowed only for percentage adjustments)
    if (updateData.adjustmentValue !== undefined && updateData.adjustmentValue < 0) {
      // If adjustmentType is also being updated, check that
      // Otherwise, let the service layer handle validation with existing data
      if (updateData.adjustmentType && updateData.adjustmentType !== PriceAdjustmentType.Percentage) {
        res.status(400).json({ 
          error: 'adjustmentValue must be a positive number for FixedPrice and FixedDiscount rate plans' 
        });
        return;
      }
      // Note: If only adjustmentValue is being updated without adjustmentType,
      // we let the service layer validate against the existing adjustmentType
    }

    // Validate percentage values bounds
    if (updateData.adjustmentType === PriceAdjustmentType.Percentage && 
        updateData.adjustmentValue !== undefined) {
      if (updateData.adjustmentValue > 100) {
        res.status(400).json({ 
          error: 'Percentage adjustment cannot exceed 100%' 
        });
        return;
      }
      if (updateData.adjustmentValue < -100) {
        res.status(400).json({ 
          error: 'Percentage adjustment cannot be less than -100%' 
        });
        return;
      }
    }

    // Validate priority if provided
    if (updateData.priority !== undefined && (updateData.priority < 1 || updateData.priority > 999)) {
      res.status(400).json({ 
        error: 'Priority must be between 1 and 999' 
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
    } else if (error.message.includes('required') || error.message.includes('must be') || error.message.includes('Invalid value for argument')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Delete a rate plan (smart deletion - hard/soft/blocked based on dependencies)
 * DELETE /api/properties/:propertyId/rate-plans/:ratePlanId
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
 * Search available rates for booking (Main booking engine endpoint)
 * GET /api/properties/:propertyId/search-rates
 */
export const searchAvailableRates = async (req: Request, res: Response): Promise<void> => {
  try {
    const { propertyId } = req.params;
    const { 
      checkInDate, 
      checkOutDate, 
      numGuests, 
      bookingDate 
    } = req.query;

    // Validate required parameters
    if (!checkInDate || !checkOutDate || !numGuests) {
      res.status(400).json({ 
        error: 'Missing required query parameters: checkInDate, checkOutDate, numGuests' 
      });
      return;
    }

    // Parse and validate dates
    const checkIn = new Date(checkInDate as string);
    const checkOut = new Date(checkOutDate as string);
    const booking = bookingDate ? new Date(bookingDate as string) : new Date();

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      res.status(400).json({ 
        error: 'Invalid date format. Use YYYY-MM-DD format' 
      });
      return;
    }

    if (checkIn >= checkOut) {
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
    const guests = parseInt(numGuests as string);
    if (isNaN(guests) || guests < 1 || guests > 20) {
      res.status(400).json({ 
        error: 'Number of guests must be between 1 and 20' 
      });
      return;
    }

    const criteria: RateSearchCriteria = {
      propertyId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numGuests: guests,
      bookingDate: booking,
    };

    const results = await ratePlanService.searchAvailableRates(criteria);

    res.json({
      message: results.length > 0 ? 'Available rates found' : 'No rates available for the selected dates',
      searchCriteria: {
        propertyId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numGuests: guests,
        numNights: Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)),
      },
      availableRates: results,
      count: results.length,
    });
  } catch (error: any) {
    console.error('Search rates error:', error);
    
    if (error.message.includes('must be') || error.message.includes('cannot be')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Calculate rate pricing for guest count and date range (public endpoint)
 * POST /api/properties/:propertyId/rate-plans/calculate
 */
export const calculateRatePricing = async (req: Request, res: Response): Promise<void> => {
  try {
    const { propertyId } = req.params;
    const { checkInDate, checkOutDate, numGuests } = req.body;

    // Validate required fields
    if (!checkInDate || !checkOutDate || !numGuests) {
      res.status(400).json({ 
        error: 'Missing required fields: checkInDate, checkOutDate, numGuests' 
      });
      return;
    }

    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      res.status(400).json({ 
        error: 'Invalid date format. Use YYYY-MM-DD format' 
      });
      return;
    }

    if (checkIn >= checkOut) {
      res.status(400).json({ 
        error: 'Check-out date must be after check-in date' 
      });
      return;
    }

    const calculation = await ratePlanService.calculatePricingForStay(
      propertyId,
      checkIn,
      checkOut,
      parseInt(numGuests)
    );

    res.json({
      message: 'Pricing calculated successfully',
      calculation
    });
  } catch (error: any) {
    console.error('Calculate rate pricing error:', error);
    if (error.message.includes('not found')) {
      res.status(404).json({ error: 'Property not found' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Calculate cancellation refund for a reservation
 * POST /api/reservations/:reservationId/calculate-refund
 */
export const calculateCancellationRefund = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { reservationId } = req.params;
    const { cancellationDate } = req.body;

    if (!cancellationDate) {
      res.status(400).json({ error: 'cancellationDate is required' });
      return;
    }

    const cancelDate = new Date(cancellationDate);
    if (isNaN(cancelDate.getTime())) {
      res.status(400).json({ error: 'Invalid cancellationDate format' });
      return;
    }

    const refundDetails = await ratePlanService.calculateCancellationRefund(
      reservationId, 
      cancelDate
    );

    res.json({
      message: 'Refund calculation completed',
      cancellationDate: cancelDate,
      refundDetails,
    });
  } catch (error: any) {
    console.error('Calculate refund error:', error);
    
    if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Toggle rate plan activation status
 * PATCH /api/rateplans/:ratePlanId/toggle-status
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
 * GET /api/rateplans/:ratePlanId/stats
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
        type: ratePlan.type,
        priority: ratePlan.priority,
        isActive: ratePlan.isActive,
      },
      usage: {
        totalReservations: ratePlan._count?.reservations || 0,
        totalPricesSet: ratePlan._count?.prices || 0,
        hasBaseRatePlan: !!ratePlan.baseRatePlan,
        derivedRatePlansCount: ratePlan.derivedRatePlans?.length || 0,
        restrictionsCount: ratePlan.ratePlanRestrictions?.length || 0,
      },
      configuration: {
        adjustmentType: ratePlan.adjustmentType,
        adjustmentValue: ratePlan.adjustmentValue,
        allowConcurrentRates: ratePlan.allowConcurrentRates,
        includesBreakfast: ratePlan.includesBreakfast,
        activeDaysCount: ratePlan.activeDays?.length || 0,
        hasCancellationPolicy: !!ratePlan.cancellationPolicy,
      },
      relationships: {
        baseRatePlan: ratePlan.baseRatePlan ? {
          id: ratePlan.baseRatePlan.id,
          name: ratePlan.baseRatePlan.name,
          adjustmentValue: ratePlan.baseRatePlan.adjustmentValue,
        } : null,
        derivedRatePlans: ratePlan.derivedRatePlans?.map((derived: any) => ({
          id: derived.id,
          name: derived.name,
          adjustmentValue: derived.adjustmentValue,
        })) || [],
      },
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
 * Get available adjustment types and validation rules
 * GET /api/rateplans/metadata/adjustment-types
 */
export const getAdjustmentTypesMetadata = async (_req: Request, res: Response): Promise<void> => {
  try {
    const metadata = {
      adjustmentTypes: [
        {
          value: PriceAdjustmentType.FixedPrice,
          label: 'Fixed Price',
          description: 'Set absolute price per night (e.g., AED 200 per night)',
          requiresBaseRate: false,
          valueValidation: {
            min: 1,
            max: 10000,
            unit: 'AED',
          }
        },
        {
          value: PriceAdjustmentType.FixedDiscount,
          label: 'Fixed Discount',
          description: 'Apply fixed amount discount per night (e.g., AED 50 off per night)',
          requiresBaseRate: true,
          valueValidation: {
            min: 1,
            max: 1000,
            unit: 'AED',
          }
        },
        {
          value: PriceAdjustmentType.Percentage,
          label: 'Percentage Discount',
          description: 'Apply percentage discount (e.g., 20% off base rate)',
          requiresBaseRate: true,
          valueValidation: {
            min: 1,
            max: 100,
            unit: '%',
          }
        },
      ],
      ratePlanTypes: [
        {
          value: RatePlanType.FullyFlexible,
          label: 'Fully Flexible',
          description: 'Offers guests flexibility for cancellations (typically at higher price)',
        },
        {
          value: RatePlanType.NonRefundable,
          label: 'Non-Refundable',
          description: 'Secures guaranteed bookings and revenue (typically at lower price)',
        },
        {
          value: RatePlanType.Custom,
          label: 'Custom',
          description: 'Allows unique rate plans for specific guest segments or special discounts',
        },
      ],
      restrictionTypes: [
        {
          value: RatePlanRestrictionType.MinLengthOfStay,
          label: 'Minimum Length of Stay',
          description: 'Minimum number of nights required for booking',
          requiresValue: true,
          valueUnit: 'nights',
        },
        {
          value: RatePlanRestrictionType.MaxLengthOfStay,
          label: 'Maximum Length of Stay',
          description: 'Maximum number of nights allowed for booking',
          requiresValue: true,
          valueUnit: 'nights',
        },
        {
          value: RatePlanRestrictionType.MinGuests,
          label: 'Minimum Guests',
          description: 'Minimum number of guests required',
          requiresValue: true,
          valueUnit: 'guests',
        },
        {
          value: RatePlanRestrictionType.MaxGuests,
          label: 'Maximum Guests',
          description: 'Maximum number of guests allowed',
          requiresValue: true,
          valueUnit: 'guests',
        },
        {
          value: RatePlanRestrictionType.MinAdvancedReservation,
          label: 'Minimum Advanced Reservation',
          description: 'Minimum days before arrival for booking',
          requiresValue: true,
          valueUnit: 'days',
        },
        {
          value: RatePlanRestrictionType.MaxAdvancedReservation,
          label: 'Maximum Advanced Reservation',
          description: 'Maximum days before arrival for booking',
          requiresValue: true,
          valueUnit: 'days',
        },
        {
          value: RatePlanRestrictionType.NoArrivals,
          label: 'No Arrivals',
          description: 'Block arrivals on specific dates',
          requiresValue: false,
          requiresDates: true,
        },
        {
          value: RatePlanRestrictionType.NoDepartures,
          label: 'No Departures',
          description: 'Block departures on specific dates',
          requiresValue: false,
          requiresDates: true,
        },
        {
          value: RatePlanRestrictionType.SeasonalDateRange,
          label: 'Seasonal Date Range',
          description: 'Rate plan active only within specific date range',
          requiresValue: false,
          requiresDates: true,
        },
      ],
      priorityLevels: {
        vipExclusive: { range: [1, 49], label: 'VIP/Exclusive rates (highest priority)' },
        seasonal: { range: [50, 99], label: 'Seasonal/Holiday rates' },
        standard: { range: [100, 199], label: 'Standard base rates' },
        promotional: { range: [200, 299], label: 'Promotional rates' },
        special: { range: [300, 999], label: 'Special offers (lowest priority)' },
      },
      activeDays: [
        { value: 0, label: 'Sunday' },
        { value: 1, label: 'Monday' },
        { value: 2, label: 'Tuesday' },
        { value: 3, label: 'Wednesday' },
        { value: 4, label: 'Thursday' },
        { value: 5, label: 'Friday' },
        { value: 6, label: 'Saturday' },
      ],
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