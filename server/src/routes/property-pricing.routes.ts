import { Router } from 'express';
import * as propertyPricingController from '../controllers/property-pricing.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Set weekly base pricing for a property
router.put(
  '/properties/:propertyId/pricing/weekly',
  authenticate,
  propertyPricingController.setWeeklyPricing
);

// Get weekly base pricing for a property
router.get(
  '/properties/:propertyId/pricing/weekly',
  authenticate,
  propertyPricingController.getWeeklyPricing
);

// Set date-specific price overrides
router.post(
  '/properties/:propertyId/pricing/overrides',
  authenticate,
  propertyPricingController.setDateOverrides
);

// Get pricing calendar for a date range
router.get(
  '/properties/:propertyId/pricing/calendar',
  authenticate,
  propertyPricingController.getPricingCalendar
);

// Delete specific date overrides
router.delete(
  '/properties/:propertyId/pricing/overrides',
  authenticate,
  propertyPricingController.deleteDateOverrides
);

// Get base price for a specific date (public endpoint)
router.get(
  '/properties/:propertyId/pricing/base-price',
  propertyPricingController.getBasePrice
);

export default router;