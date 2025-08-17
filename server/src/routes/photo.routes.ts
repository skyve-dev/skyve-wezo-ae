import { Router } from 'express';
import * as photoController from '../controllers/photo.controller';
import { authenticate } from '../middleware/auth';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/photos/');
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `photo-${uniqueSuffix}${path.extname(file.originalname)}`);
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

router.post('/upload', authenticate, upload.array('photos', 20), photoController.uploadPhotos);

router.post('/attach/:propertyId', authenticate, photoController.attachPhotosToProperty);

router.get('/unattached', authenticate, photoController.getUnattachedPhotos);

router.delete('/:photoId', authenticate, photoController.deletePhoto);

router.put('/:photoId', authenticate, photoController.updatePhoto);

export default router;