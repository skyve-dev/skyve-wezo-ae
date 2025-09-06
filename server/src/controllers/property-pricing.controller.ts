import { Request, Response } from 'express';
import propertyPricingService, { WeeklyPricingData, DateOverrideData } from '../services/property-pricing.service';

/**
 * Set weekly base pricing for a property
 * PUT /api/properties/:propertyId/pricing/weekly
 */
export const setWeeklyPricing = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { propertyId } = req.params;
    const { fullDay, halfDay } = req.body;

    // Validate required fields
    if (!fullDay || !halfDay) {
      res.status(400).json({ 
        error: 'Missing required fields: fullDay and halfDay pricing objects' 
      });
      return;
    }

    // Validate fullDay pricing structure
    const requiredFullDayFields = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const missingFullDayFields = requiredFullDayFields.filter(field => fullDay[field] === undefined);
    if (missingFullDayFields.length > 0) {
      res.status(400).json({ 
        error: `Missing full day pricing fields: ${missingFullDayFields.join(', ')}` 
      });
      return;
    }

    // Validate halfDay pricing structure
    const requiredHalfDayFields = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const missingHalfDayFields = requiredHalfDayFields.filter(field => halfDay[field] === undefined);
    if (missingHalfDayFields.length > 0) {
      res.status(400).json({ 
        error: `Missing half day pricing fields: ${missingHalfDayFields.join(', ')}` 
      });
      return;
    }

    // Combine into WeeklyPricingData format
    const weeklyPricing: WeeklyPricingData = {
      monday: parseFloat(fullDay.monday),
      tuesday: parseFloat(fullDay.tuesday),
      wednesday: parseFloat(fullDay.wednesday),
      thursday: parseFloat(fullDay.thursday),
      friday: parseFloat(fullDay.friday),
      saturday: parseFloat(fullDay.saturday),
      sunday: parseFloat(fullDay.sunday),
      halfDayMonday: parseFloat(halfDay.monday),
      halfDayTuesday: parseFloat(halfDay.tuesday),
      halfDayWednesday: parseFloat(halfDay.wednesday),
      halfDayThursday: parseFloat(halfDay.thursday),
      halfDayFriday: parseFloat(halfDay.friday),
      halfDaySaturday: parseFloat(halfDay.saturday),
      halfDaySunday: parseFloat(halfDay.sunday)
    };

    // Validate that all values are valid numbers
    const allPrices = Object.values(weeklyPricing);
    if (allPrices.some(price => isNaN(price))) {
      res.status(400).json({ error: 'All pricing values must be valid numbers' });
      return;
    }

    const result = await propertyPricingService.setWeeklyPricing(propertyId, req.user.id, weeklyPricing);

    res.json({
      message: 'Weekly pricing updated successfully',
      pricing: result
    });
  } catch (error: any) {
    console.error('Set weekly pricing error:', error);
    
    if (error.message.includes('not found') || error.message.includes('permission')) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes('must be') || error.message.includes('should not')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Get weekly base pricing for a property
 * GET /api/properties/:propertyId/pricing/weekly
 */
export const getWeeklyPricing = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { propertyId } = req.params;
    const pricing = await propertyPricingService.getWeeklyPricing(propertyId);

    res.json({
      message: 'Weekly pricing retrieved successfully',
      pricing
    });
  } catch (error: any) {
    console.error('Get weekly pricing error:', error);
    
    if (error.message.includes('not found') || error.message.includes('No pricing configured')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Set date-specific price overrides
 * POST /api/properties/:propertyId/pricing/overrides
 */
export const setDateOverrides = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { propertyId } = req.params;
    const { overrides } = req.body;

    // Validate overrides array
    if (!overrides || !Array.isArray(overrides) || overrides.length === 0) {
      res.status(400).json({ 
        error: 'Overrides field is required and must be a non-empty array' 
      });
      return;
    }

    if (overrides.length > 365) {
      res.status(400).json({ 
        error: 'Cannot set more than 365 date overrides at once' 
      });
      return;
    }

    // Validate and parse each override
    const validatedOverrides: DateOverrideData[] = [];
    
    for (let i = 0; i < overrides.length; i++) {
      const override = overrides[i];
      
      if (!override.date || override.price === undefined) {
        res.status(400).json({ 
          error: `Override at index ${i}: missing required fields date and price` 
        });
        return;
      }

      const parsedDate = new Date(override.date);
      if (isNaN(parsedDate.getTime())) {
        res.status(400).json({ 
          error: `Override at index ${i}: invalid date format. Use YYYY-MM-DD format` 
        });
        return;
      }

      const parsedPrice = parseFloat(override.price);
      if (isNaN(parsedPrice)) {
        res.status(400).json({ 
          error: `Override at index ${i}: price must be a valid number` 
        });
        return;
      }

      let parsedHalfDayPrice: number | undefined;
      if (override.halfDayPrice !== undefined) {
        parsedHalfDayPrice = parseFloat(override.halfDayPrice);
        if (isNaN(parsedHalfDayPrice)) {
          res.status(400).json({ 
            error: `Override at index ${i}: halfDayPrice must be a valid number` 
          });
          return;
        }
      }

      validatedOverrides.push({
        date: parsedDate,
        price: parsedPrice,
        halfDayPrice: parsedHalfDayPrice,
        reason: override.reason
      });
    }

    const result = await propertyPricingService.setDateOverrides(propertyId, req.user.id, validatedOverrides);

    res.status(201).json({
      message: `${result.length} date override${result.length > 1 ? 's' : ''} set successfully`,
      overrides: result,
      count: result.length
    });
  } catch (error: any) {
    console.error('Set date overrides error:', error);
    
    if (error.message.includes('not found') || error.message.includes('permission')) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes('must be') || error.message.includes('Cannot set') || error.message.includes('should not exceed')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Get pricing calendar for a date range
 * GET /api/properties/:propertyId/pricing/calendar
 */
export const getPricingCalendar = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { propertyId } = req.params;
    const { startDate, endDate } = req.query;

    // Validate required parameters
    if (!startDate || !endDate) {
      res.status(400).json({ 
        error: 'Missing required query parameters: startDate and endDate' 
      });
      return;
    }

    // Parse and validate dates
    const parsedStartDate = new Date(startDate as string);
    const parsedEndDate = new Date(endDate as string);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      res.status(400).json({ 
        error: 'Invalid date format. Use YYYY-MM-DD format' 
      });
      return;
    }

    if (parsedStartDate >= parsedEndDate) {
      res.status(400).json({ error: 'Start date must be before end date' });
      return;
    }

    const calendar = await propertyPricingService.getPricingCalendar(propertyId, parsedStartDate, parsedEndDate);

    res.json({
      message: 'Pricing calendar retrieved successfully',
      calendar,
      dateRange: {
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        totalDays: calendar.length
      }
    });
  } catch (error: any) {
    console.error('Get pricing calendar error:', error);
    
    if (error.message.includes('not found') || error.message.includes('No base pricing configured')) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes('must be') || error.message.includes('Cannot retrieve')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Delete specific date overrides
 * DELETE /api/properties/:propertyId/pricing/overrides
 */
export const deleteDateOverrides = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { propertyId } = req.params;
    const { dates } = req.body;

    // Validate dates array
    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      res.status(400).json({ 
        error: 'Dates field is required and must be a non-empty array' 
      });
      return;
    }

    // Parse and validate dates
    const parsedDates: Date[] = [];
    
    for (let i = 0; i < dates.length; i++) {
      const parsedDate = new Date(dates[i]);
      if (isNaN(parsedDate.getTime())) {
        res.status(400).json({ 
          error: `Date at index ${i}: invalid date format. Use YYYY-MM-DD format` 
        });
        return;
      }
      parsedDates.push(parsedDate);
    }

    const result = await propertyPricingService.deleteDateOverrides(propertyId, req.user.id, parsedDates);

    res.json({
      message: `${result.deletedCount} date override${result.deletedCount !== 1 ? 's' : ''} deleted successfully`,
      deletedCount: result.deletedCount,
      requestedDates: dates.length
    });
  } catch (error: any) {
    console.error('Delete date overrides error:', error);
    
    if (error.message.includes('not found') || error.message.includes('permission')) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes('Cannot delete')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Get base price for a specific date and duration
 * GET /api/properties/:propertyId/pricing/base-price
 */
export const getBasePrice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { propertyId } = req.params;
    const { date, isHalfDay } = req.query;

    // Validate required parameters
    if (!date) {
      res.status(400).json({ 
        error: 'Missing required query parameter: date' 
      });
      return;
    }

    // Parse and validate date
    const parsedDate = new Date(date as string);
    if (isNaN(parsedDate.getTime())) {
      res.status(400).json({ 
        error: 'Invalid date format. Use YYYY-MM-DD format' 
      });
      return;
    }

    // Parse isHalfDay flag
    const halfDay = isHalfDay === 'true';

    const basePrice = await propertyPricingService.getBasePrice(propertyId, parsedDate, halfDay);

    res.json({
      message: 'Base price retrieved successfully',
      basePrice,
      date: parsedDate,
      isHalfDay: halfDay,
      dayOfWeek: parsedDate.toLocaleDateString('en-US', { weekday: 'long' })
    });
  } catch (error: any) {
    console.error('Get base price error:', error);
    
    if (error.message.includes('not found') || error.message.includes('No base pricing configured')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Get public pricing calendar for a property (no authentication required)
 * GET /api/properties/:propertyId/pricing/public-calendar
 */
export const getPublicPricingCalendar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { propertyId } = req.params;
    const { startDate, endDate } = req.query;

    // Validate required parameters
    if (!startDate || !endDate) {
      res.status(400).json({ 
        error: 'Missing required query parameters: startDate and endDate' 
      });
      return;
    }

    // Parse and validate dates
    const parsedStartDate = new Date(startDate as string);
    const parsedEndDate = new Date(endDate as string);
    
    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      res.status(400).json({ 
        error: 'Invalid date format. Use YYYY-MM-DD format for both startDate and endDate' 
      });
      return;
    }

    if (parsedStartDate >= parsedEndDate) {
      res.status(400).json({ 
        error: 'startDate must be before endDate' 
      });
      return;
    }

    // Limit the date range to prevent abuse (max 90 days)
    const diffTime = parsedEndDate.getTime() - parsedStartDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 90) {
      res.status(400).json({ 
        error: 'Date range cannot exceed 90 days' 
      });
      return;
    }

    // Get pricing calendar from service
    const calendar = await propertyPricingService.getPricingCalendar(propertyId, parsedStartDate, parsedEndDate);

    // Get availability data for the same date range
    const availabilityService = require('../services/availability.service').default;
    const availability = await availabilityService.getPublicAvailability(
      propertyId,
      startDate as string,
      endDate as string
    );

    // Create availability lookup map for efficient access
    const availabilityMap = new Map(
      availability.map((avail: any) => [
        // Normalize date string for comparison
        new Date(avail.date).toISOString().split('T')[0],
        avail.isAvailable
      ])
    );

    // Transform calendar data to include both pricing and availability
    const transformedCalendar: Record<string, any> = {};
    
    calendar.forEach(dayData => {
      // Use timezone-safe date formatting to avoid UTC conversion issues
      const year = dayData.date.getFullYear();
      const month = String(dayData.date.getMonth() + 1).padStart(2, '0');
      const day = String(dayData.date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      // Check availability for this date
      const isDateAvailable = availabilityMap.get(dateString) !== false; // Default to true if no record
      
      transformedCalendar[dateString] = {
        fullDayPrice: dayData.fullDayPrice,
        halfDayPrice: dayData.halfDayPrice,
        currency: 'AED',
        isOverride: dayData.isOverride,
        reason: dayData.reason, // Include override reason if available
        hasDiscount: false, // This would need additional logic to determine discounts
        originalPrice: undefined, // Not available in current interface
        isAvailable: isDateAvailable, // Now includes real availability data
        availabilityStatus: isDateAvailable ? 'available' : 'unavailable'
      };
    });

    res.json({
      message: 'Public pricing calendar with availability retrieved successfully',
      calendar: transformedCalendar,
      dateRange: {
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        totalDays: calendar.length
      },
      availabilityIncluded: true
    });
  } catch (error: any) {
    console.error('Get public pricing calendar error:', error);
    
    if (error.message.includes('not found') || error.message.includes('No base pricing configured')) {
      res.status(404).json({ 
        error: 'Property pricing not available. Please contact the property owner to set up pricing.' 
      });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};