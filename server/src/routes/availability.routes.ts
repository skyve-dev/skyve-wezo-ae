import { Router } from 'express';
import * as availabilityController from '../controllers/availability.controller';
import { authenticate } from '../middleware/auth';
import {
  validateAvailabilityGet,
  validateAvailabilityUpdate,
  validateBulkAvailabilityUpdate,
} from '../middleware/availability.validation';

const router = Router();

router.get(
  '/properties/:propertyId/availability',
  authenticate,
  validateAvailabilityGet,
  availabilityController.getPropertyAvailability
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