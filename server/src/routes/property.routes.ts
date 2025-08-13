import { Router } from 'express';
import * as propertyController from '../controllers/property.controller';
import { authenticate } from '../middleware/auth';
import {
  validatePropertyCreation,
  validatePropertyUpdate,
  validateLayoutUpdate,
  validateAmenitiesUpdate,
  validateServicesUpdate,
  validateRulesUpdate,
  validatePricingUpdate,
  validateCancellationUpdate,
} from '../middleware/property.validation';

const router = Router();

router.post('/', authenticate, validatePropertyCreation, propertyController.createProperty);

router.put('/:propertyId', authenticate, validatePropertyUpdate, propertyController.updateProperty);

router.put(
  '/:propertyId/layout',
  authenticate,
  validateLayoutUpdate,
  propertyController.updatePropertyLayout
);

router.put(
  '/:propertyId/amenities',
  authenticate,
  validateAmenitiesUpdate,
  propertyController.updatePropertyAmenities
);

router.put(
  '/:propertyId/services',
  authenticate,
  validateServicesUpdate,
  propertyController.updatePropertyServices
);

router.put(
  '/:propertyId/rules',
  authenticate,
  validateRulesUpdate,
  propertyController.updatePropertyRules
);

router.put(
  '/:propertyId/pricing',
  authenticate,
  validatePricingUpdate,
  propertyController.updatePropertyPricing
);

router.put(
  '/:propertyId/cancellation',
  authenticate,
  validateCancellationUpdate,
  propertyController.updatePropertyCancellation
);

router.get('/my-properties', authenticate, propertyController.getMyProperties);

router.get('/:propertyId', propertyController.getProperty);

router.delete('/:propertyId', authenticate, propertyController.deleteProperty);

export default router;