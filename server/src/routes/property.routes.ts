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
  validateStatusUpdate,
} from '../middleware/property.validation';
import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/photos/');
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `property-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  }
});

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
  '/:propertyId/status',
  authenticate,
  validateStatusUpdate,
  propertyController.updatePropertyStatus
);

// Pricing route removed - pricing now managed through rate plans
// Cancellation route removed - cancellation policies now managed through rate plans

router.get('/my-properties', authenticate, propertyController.getMyProperties);

router.get('/public', propertyController.getPublicProperties);

router.get('/:propertyId', propertyController.getProperty);

router.delete('/:propertyId', authenticate, propertyController.deleteProperty);

// Photo upload routes
router.post('/:propertyId/photos', authenticate, upload.array('photos', 20), propertyController.uploadPropertyPhotos);
router.delete('/:propertyId/photos/:photoId', authenticate, propertyController.deletePropertyPhoto);
router.put('/:propertyId/photos/:photoId', authenticate, propertyController.updatePropertyPhoto);

export default router;