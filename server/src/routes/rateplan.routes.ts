import { Router } from 'express';
import * as ratePlanController from '../controllers/rateplan.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Create a new rate plan for a property
router.post(
  '/properties/:propertyId/rate-plans',
  authenticate,
  ratePlanController.createRatePlan
);

// Get all rate plans for a property (private - owner/manager only)
router.get(
  '/properties/:propertyId/rate-plans',
  authenticate,
  ratePlanController.getRatePlansForProperty
);

// Get public rate plans for a property (no auth required - for guest browsing)
router.get(
  '/properties/:propertyId/rate-plans/public',
  ratePlanController.getPublicRatePlansForProperty
);

// Get a specific rate plan
router.get(
  '/properties/:propertyId/rate-plans/:ratePlanId',
  authenticate,
  ratePlanController.getRatePlanById
);

// Update a rate plan
router.put(
  '/properties/:propertyId/rate-plans/:ratePlanId',
  authenticate,
  ratePlanController.updateRatePlan
);

// Delete a rate plan
router.delete(
  '/properties/:propertyId/rate-plans/:ratePlanId',
  authenticate,
  ratePlanController.deleteRatePlan
);

// Search for available rates (public endpoint for booking engine)
router.post(
  '/properties/:propertyId/rate-plans/search',
  ratePlanController.searchAvailableRates
);

// Calculate pricing for guest count and date range (public endpoint)
router.post(
  '/properties/:propertyId/rate-plans/calculate',
  ratePlanController.calculateRatePricing
);

// Calculate cancellation refund
router.post(
  '/properties/:propertyId/rate-plans/:ratePlanId/cancellation-refund',
  authenticate,
  ratePlanController.calculateCancellationRefund
);

// Get rate plan metadata
router.get(
  '/rate-plans/metadata/adjustment-types',
  ratePlanController.getAdjustmentTypesMetadata
);

export default router;