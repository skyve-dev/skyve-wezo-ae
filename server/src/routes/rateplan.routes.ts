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

// Calculate booking options (New booking engine endpoint)
router.post(
  '/properties/:propertyId/calculate-booking',
  ratePlanController.calculateBookingOptions
);

// Toggle rate plan status
router.patch(
  '/rate-plans/:ratePlanId/toggle-status',
  authenticate,
  ratePlanController.toggleRatePlanStatus
);

// Get rate plan statistics
router.get(
  '/rate-plans/:ratePlanId/stats',
  authenticate,
  ratePlanController.getRatePlanStats
);

// Get rate plan metadata
router.get(
  '/rate-plans/metadata/modifier-types',
  ratePlanController.getModifierTypesMetadata
);

export default router;