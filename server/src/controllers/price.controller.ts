import { Request, Response } from 'express';
import priceService, { PriceCreateData, PriceUpdateData, PriceBulkUpdateData, PriceGetParams } from '../services/price.service';

/**
 * Get prices for a rate plan within a date range
 * GET /api/rate-plans/:ratePlanId/prices
 */
export const getPricesForRatePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { ratePlanId } = req.params;
    const { startDate, endDate, limit, offset } = req.query;

    // Parse query parameters
    const params: PriceGetParams = {};
    
    if (startDate) {
      const parsedStartDate = new Date(startDate as string);
      if (isNaN(parsedStartDate.getTime())) {
        res.status(400).json({ error: 'Invalid startDate format. Use YYYY-MM-DD format' });
        return;
      }
      params.startDate = parsedStartDate;
    }

    if (endDate) {
      const parsedEndDate = new Date(endDate as string);
      if (isNaN(parsedEndDate.getTime())) {
        res.status(400).json({ error: 'Invalid endDate format. Use YYYY-MM-DD format' });
        return;
      }
      params.endDate = parsedEndDate;
    }

    if (limit) {
      const parsedLimit = parseInt(limit as string);
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 365) {
        res.status(400).json({ error: 'Limit must be between 1 and 365' });
        return;
      }
      params.limit = parsedLimit;
    }

    if (offset) {
      const parsedOffset = parseInt(offset as string);
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        res.status(400).json({ error: 'Offset must be a non-negative integer' });
        return;
      }
      params.offset = parsedOffset;
    }

    // Validate date range
    if (params.startDate && params.endDate && params.startDate >= params.endDate) {
      res.status(400).json({ error: 'Start date must be before end date' });
      return;
    }

    const prices = await priceService.getPricesForRatePlan(ratePlanId, req.user.id, params);

    res.json({
      message: 'Prices retrieved successfully',
      prices,
      count: prices.length,
      filters: {
        startDate: params.startDate,
        endDate: params.endDate,
        limit: params.limit || 365,
        offset: params.offset || 0,
      },
    });
  } catch (error: any) {
    console.error('Get prices error:', error);
    
    if (error.message.includes('not found') || error.message.includes('permission')) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes('Invalid') || error.message.includes('must be')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Create or update a price for a specific date (upsert operation)
 * POST /api/rate-plans/:ratePlanId/prices
 */
export const createPrice = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { ratePlanId } = req.params;
    const { date, amount } = req.body;

    // Validate required fields
    if (!date || amount === undefined) {
      res.status(400).json({ 
        error: 'Missing required fields: date and amount' 
      });
      return;
    }

    console.log('=== PRICE CONTROLLER DEBUG ===');
    console.log('Raw date from request:', date);
    console.log('Raw amount from request:', amount);
    
    // Parse and validate date
    const parsedDate = new Date(date);
    console.log('Parsed date:', parsedDate);
    console.log('Parsed date ISO:', parsedDate.toISOString());
    console.log('Is date valid:', !isNaN(parsedDate.getTime()));
    
    if (isNaN(parsedDate.getTime())) {
      res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD format' });
      return;
    }

    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      res.status(400).json({ error: 'Amount must be a valid number' });
      return;
    }

    const priceData: PriceCreateData = {
      date: parsedDate,
      amount: parsedAmount,
    };

    const price = await priceService.createPrice(ratePlanId, req.user.id, priceData);

    res.status(201).json({
      message: 'Price created successfully',
      price,
    });
  } catch (error: any) {
    console.error('Create price error:', error);
    
    if (error.message.includes('not found') || error.message.includes('permission')) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes('must be') || error.message.includes('Cannot')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Bulk create or update prices for multiple dates
 * POST /api/rate-plans/:ratePlanId/prices/bulk
 */
export const bulkCreatePrices = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { ratePlanId } = req.params;
    const { updates } = req.body;

    // Validate updates array
    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      res.status(400).json({ 
        error: 'Updates field is required and must be a non-empty array' 
      });
      return;
    }

    if (updates.length > 365) {
      res.status(400).json({ 
        error: 'Cannot update more than 365 prices at once' 
      });
      return;
    }

    // Validate each update item
    const validatedUpdates: Array<{ date: Date; amount: number }> = [];
    
    for (let i = 0; i < updates.length; i++) {
      const update = updates[i];
      
      if (!update.date || update.amount === undefined) {
        res.status(400).json({ 
          error: `Update at index ${i}: missing required fields date and amount` 
        });
        return;
      }

      const parsedDate = new Date(update.date);
      if (isNaN(parsedDate.getTime())) {
        res.status(400).json({ 
          error: `Update at index ${i}: invalid date format. Use YYYY-MM-DD format` 
        });
        return;
      }

      const parsedAmount = parseFloat(update.amount);
      if (isNaN(parsedAmount)) {
        res.status(400).json({ 
          error: `Update at index ${i}: amount must be a valid number` 
        });
        return;
      }

      validatedUpdates.push({ date: parsedDate, amount: parsedAmount });
    }

    const bulkData: PriceBulkUpdateData = { updates: validatedUpdates };
    const result = await priceService.bulkCreatePrices(ratePlanId, req.user.id, bulkData);

    // Determine response status based on results
    const hasErrors = result.errors.length > 0;
    const hasSuccesses = result.success > 0;

    let status = 200;
    let message = 'Bulk price update completed';

    if (!hasSuccesses && hasErrors) {
      status = 400;
      message = 'All price updates failed';
    } else if (hasSuccesses && hasErrors) {
      status = 207; // Multi-status
      message = 'Bulk price update completed with some errors';
    } else if (hasSuccesses && !hasErrors) {
      status = 201;
      message = 'All prices updated successfully';
    }

    res.status(status).json({
      message,
      summary: {
        total: updates.length,
        successful: result.success,
        skipped: result.skipped,
        failed: result.errors.length,
      },
      prices: result.prices,
      errors: result.errors,
    });
  } catch (error: any) {
    console.error('Bulk create prices error:', error);
    
    if (error.message.includes('not found') || error.message.includes('permission')) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes('Cannot') || error.message.includes('must be')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Update a specific price
 * PUT /api/prices/:priceId
 */
export const updatePrice = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { priceId } = req.params;
    const { amount } = req.body;

    // Validate amount
    if (amount === undefined) {
      res.status(400).json({ error: 'Amount is required' });
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      res.status(400).json({ error: 'Amount must be a valid number' });
      return;
    }

    const updateData: PriceUpdateData = { amount: parsedAmount };
    const price = await priceService.updatePrice(priceId, req.user.id, updateData);

    res.json({
      message: 'Price updated successfully',
      price,
    });
  } catch (error: any) {
    console.error('Update price error:', error);
    
    if (error.message.includes('not found') || error.message.includes('permission')) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes('must be') || error.message.includes('Cannot')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Delete a specific price
 * DELETE /api/prices/:priceId
 */
export const deletePrice = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { priceId } = req.params;
    await priceService.deletePrice(priceId, req.user.id);

    res.json({
      message: 'Price deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete price error:', error);
    
    if (error.message.includes('not found') || error.message.includes('permission')) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes('Cannot')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Bulk delete prices for a date range
 * DELETE /api/rate-plans/:ratePlanId/prices/bulk
 */
export const bulkDeletePrices = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { ratePlanId } = req.params;
    const { startDate, endDate } = req.body;

    // Validate required fields
    if (!startDate || !endDate) {
      res.status(400).json({ 
        error: 'Missing required fields: startDate and endDate' 
      });
      return;
    }

    // Parse and validate dates
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      res.status(400).json({ 
        error: 'Invalid date format. Use YYYY-MM-DD format' 
      });
      return;
    }

    const result = await priceService.bulkDeletePrices(
      ratePlanId, 
      req.user.id, 
      parsedStartDate, 
      parsedEndDate
    );

    res.json({
      message: `Successfully deleted ${result.deletedCount} price${result.deletedCount !== 1 ? 's' : ''}`,
      deletedCount: result.deletedCount,
      dateRange: {
        startDate: parsedStartDate,
        endDate: parsedEndDate,
      },
    });
  } catch (error: any) {
    console.error('Bulk delete prices error:', error);
    
    if (error.message.includes('not found') || error.message.includes('permission')) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes('Cannot') || error.message.includes('must be')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Get price statistics for a rate plan
 * GET /api/rate-plans/:ratePlanId/prices/stats
 */
export const getPriceStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { ratePlanId } = req.params;
    const { startDate, endDate } = req.query;

    // Parse optional date filters
    let parsedStartDate: Date | undefined;
    let parsedEndDate: Date | undefined;

    if (startDate) {
      parsedStartDate = new Date(startDate as string);
      if (isNaN(parsedStartDate.getTime())) {
        res.status(400).json({ error: 'Invalid startDate format. Use YYYY-MM-DD format' });
        return;
      }
    }

    if (endDate) {
      parsedEndDate = new Date(endDate as string);
      if (isNaN(parsedEndDate.getTime())) {
        res.status(400).json({ error: 'Invalid endDate format. Use YYYY-MM-DD format' });
        return;
      }
    }

    // Validate date range
    if (parsedStartDate && parsedEndDate && parsedStartDate >= parsedEndDate) {
      res.status(400).json({ error: 'Start date must be before end date' });
      return;
    }

    const statistics = await priceService.getPriceStatistics(
      ratePlanId, 
      req.user.id, 
      parsedStartDate, 
      parsedEndDate
    );

    res.json({
      message: 'Price statistics retrieved successfully',
      statistics,
      filters: {
        startDate: parsedStartDate,
        endDate: parsedEndDate,
      },
    });
  } catch (error: any) {
    console.error('Get price statistics error:', error);
    
    if (error.message.includes('not found') || error.message.includes('permission')) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes('must be')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Get price gaps (dates without specific pricing) for a rate plan
 * GET /api/rate-plans/:ratePlanId/prices/gaps
 */
export const getPriceGaps = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { ratePlanId } = req.params;
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

    const gaps = await priceService.getPriceGaps(
      ratePlanId, 
      req.user.id, 
      parsedStartDate, 
      parsedEndDate
    );

    res.json({
      message: gaps.length > 0 
        ? `Found ${gaps.length} date${gaps.length !== 1 ? 's' : ''} without specific pricing`
        : 'All dates in the range have specific pricing set',
      gaps,
      gapCount: gaps.length,
      dateRange: {
        startDate: parsedStartDate,
        endDate: parsedEndDate,
      },
    });
  } catch (error: any) {
    console.error('Get price gaps error:', error);
    
    if (error.message.includes('not found') || error.message.includes('permission')) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes('Cannot') || error.message.includes('must be')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Copy prices from one date range to another
 * POST /api/rate-plans/:ratePlanId/prices/copy
 */
export const copyPrices = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { ratePlanId } = req.params;
    const { sourceStartDate, sourceEndDate, targetStartDate } = req.body;

    // Validate required fields
    if (!sourceStartDate || !sourceEndDate || !targetStartDate) {
      res.status(400).json({ 
        error: 'Missing required fields: sourceStartDate, sourceEndDate, targetStartDate' 
      });
      return;
    }

    // Parse and validate dates
    const parsedSourceStartDate = new Date(sourceStartDate);
    const parsedSourceEndDate = new Date(sourceEndDate);
    const parsedTargetStartDate = new Date(targetStartDate);

    if (isNaN(parsedSourceStartDate.getTime()) || 
        isNaN(parsedSourceEndDate.getTime()) || 
        isNaN(parsedTargetStartDate.getTime())) {
      res.status(400).json({ 
        error: 'Invalid date format. Use YYYY-MM-DD format' 
      });
      return;
    }

    const result = await priceService.copyPrices(
      ratePlanId, 
      req.user.id, 
      parsedSourceStartDate, 
      parsedSourceEndDate, 
      parsedTargetStartDate
    );

    // Determine response status
    const hasErrors = result.errors.length > 0;
    const hasSuccesses = result.copiedCount > 0;

    let status = 200;
    let message = 'Price copy operation completed';

    if (!hasSuccesses && hasErrors) {
      status = 400;
      message = 'Failed to copy any prices';
    } else if (hasSuccesses && hasErrors) {
      status = 207; // Multi-status
      message = 'Price copy completed with some errors';
    } else if (hasSuccesses && !hasErrors) {
      status = 200;
      message = 'All prices copied successfully';
    }

    res.status(status).json({
      message,
      copiedCount: result.copiedCount,
      errors: result.errors,
      sourceRange: {
        startDate: parsedSourceStartDate,
        endDate: parsedSourceEndDate,
      },
      targetStartDate: parsedTargetStartDate,
    });
  } catch (error: any) {
    console.error('Copy prices error:', error);
    
    if (error.message.includes('not found') || error.message.includes('permission')) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes('Cannot') || error.message.includes('must be') || error.message.includes('No prices found')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};