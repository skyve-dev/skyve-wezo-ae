import { Router } from 'express';
import * as ratePlanController from '../controllers/rateplan.controller';
import { authenticate } from '../middleware/auth';
import {
  validateRatePlanCreation,
  validateRatePlanUpdate,
  validatePriceUpdate,
  validateRestrictionUpdate,
} from '../middleware/rateplan.validation';

const router = Router();

router.post(
  '/properties/:propertyId/rate-plans',
  authenticate,
  validateRatePlanCreation,
  ratePlanController.createRatePlan
);

router.get(
  '/properties/:propertyId/rate-plans',
  authenticate,
  ratePlanController.getRatePlans
);

router.get(
  '/properties/:propertyId/rate-plans/:ratePlanId',
  authenticate,
  ratePlanController.getRatePlan
);

router.put(
  '/properties/:propertyId/rate-plans/:ratePlanId',
  authenticate,
  validateRatePlanUpdate,
  ratePlanController.updateRatePlan
);

router.delete(
  '/properties/:propertyId/rate-plans/:ratePlanId',
  authenticate,
  ratePlanController.deleteRatePlan
);

router.put(
  '/properties/:propertyId/rate-plans/:ratePlanId/prices',
  authenticate,
  validatePriceUpdate,
  ratePlanController.updateRatePlanPrices
);

router.put(
  '/properties/:propertyId/rate-plans/:ratePlanId/restrictions',
  authenticate,
  validateRestrictionUpdate,
  ratePlanController.updateRatePlanRestrictions
);

export default router;