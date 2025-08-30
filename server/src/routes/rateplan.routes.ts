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

// Get all rate plans for a property
router.get(
  '/properties/:propertyId/rate-plans',
  authenticate,
  ratePlanController.getRatePlansForProperty
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