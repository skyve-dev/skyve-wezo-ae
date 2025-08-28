import { Router } from 'express';
import * as priceController from '../controllers/price.controller';
import { authenticate } from '../middleware/auth';
import {
  validatePriceGet,
  validatePriceCreate,
  validatePriceUpdate,
  validateBulkPriceUpdate,
  validateBulkPriceDelete,
  validatePriceStats,
  validatePriceGaps,
  validatePriceCopy,
} from '../middleware/price.validation';

const router = Router();

// =======================
// RATE PLAN PRICE ROUTES
// =======================

/**
 * Get all prices for a rate plan within an optional date range
 * GET /api/rate-plans/:ratePlanId/prices
 * Query params: startDate?, endDate?, limit?, offset?
 */
router.get(
  '/rate-plans/:ratePlanId/prices',
  authenticate,
  validatePriceGet,
  priceController.getPricesForRatePlan
);

/**
 * Create or update a price for a specific date (upsert operation)
 * POST /api/rate-plans/:ratePlanId/prices
 * Body: { date: string, amount: number }
 */
router.post(
  '/rate-plans/:ratePlanId/prices',
  authenticate,
  validatePriceCreate,
  priceController.createPrice
);

/**
 * Bulk create/update prices for multiple dates
 * POST /api/rate-plans/:ratePlanId/prices/bulk
 * Body: { updates: Array<{ date: string, amount: number }> }
 */
router.post(
  '/rate-plans/:ratePlanId/prices/bulk',
  authenticate,
  validateBulkPriceUpdate,
  priceController.bulkCreatePrices
);

/**
 * Bulk delete prices for a date range
 * DELETE /api/rate-plans/:ratePlanId/prices/bulk
 * Body: { startDate: string, endDate: string }
 */
router.delete(
  '/rate-plans/:ratePlanId/prices/bulk',
  authenticate,
  validateBulkPriceDelete,
  priceController.bulkDeletePrices
);

/**
 * Get price statistics for a rate plan
 * GET /api/rate-plans/:ratePlanId/prices/stats
 * Query params: startDate?, endDate?
 */
router.get(
  '/rate-plans/:ratePlanId/prices/stats',
  authenticate,
  validatePriceStats,
  priceController.getPriceStatistics
);

/**
 * Get price gaps (dates without specific pricing) for a rate plan
 * GET /api/rate-plans/:ratePlanId/prices/gaps
 * Query params: startDate (required), endDate (required)
 */
router.get(
  '/rate-plans/:ratePlanId/prices/gaps',
  authenticate,
  validatePriceGaps,
  priceController.getPriceGaps
);

/**
 * Copy prices from one date range to another
 * POST /api/rate-plans/:ratePlanId/prices/copy
 * Body: { sourceStartDate: string, sourceEndDate: string, targetStartDate: string }
 */
router.post(
  '/rate-plans/:ratePlanId/prices/copy',
  authenticate,
  validatePriceCopy,
  priceController.copyPrices
);

// =====================
// INDIVIDUAL PRICE ROUTES
// =====================

/**
 * Update a specific price by price ID
 * PUT /api/prices/:priceId
 * Body: { amount: number }
 */
router.put(
  '/prices/:priceId',
  authenticate,
  validatePriceUpdate,
  priceController.updatePrice
);

/**
 * Delete a specific price by price ID
 * DELETE /api/prices/:priceId
 */
router.delete(
  '/prices/:priceId',
  authenticate,
  priceController.deletePrice
);

export default router;