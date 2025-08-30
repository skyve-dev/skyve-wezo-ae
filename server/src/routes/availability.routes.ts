import { Router } from 'express';
import * as availabilityController from '../controllers/availability.controller';
import { authenticate } from '../middleware/auth';
import {
  validateAvailabilityGet,
  validateAvailabilityUpdate,
  validateBulkAvailabilityUpdate,
} from '../middleware/availability.validation';

const router = Router();

// Get property availability (private - owner/manager only)
router.get(
  '/properties/:propertyId/availability',
  authenticate,
  validateAvailabilityGet,
  availabilityController.getPropertyAvailability
);

// Get public availability for a property (no auth required - for guest browsing)
router.get(
  '/properties/:propertyId/availability/public',
  validateAvailabilityGet,
  availabilityController.getPublicPropertyAvailability
);

// Check availability for booking validation (public endpoint)
router.post(
  '/properties/:propertyId/availability/check',
  availabilityController.checkBookingAvailability
);

router.put(
  '/properties/:propertyId/availability/bulk',
  authenticate,
  validateBulkAvailabilityUpdate,
  availabilityController.bulkUpdateAvailability
);

router.put(
  '/properties/:propertyId/availability/:date',
  authenticate,
  validateAvailabilityUpdate,
  availabilityController.updateAvailability
);

export default router;