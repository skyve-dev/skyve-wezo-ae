import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { authenticate } from '../middleware/auth';
import {
  validateReviewResponse,
  validateReviewFilters,
  validateDateRange,
} from '../middleware/review.validation';

const router = Router();

// Get all reviews for user's properties
router.get(
  '/reviews',
  authenticate,
  validateReviewFilters,
  validateDateRange,
  reviewController.getReviews
);

// Get review statistics
router.get(
  '/reviews/stats',
  authenticate,
  reviewController.getReviewStats
);

// Get review insights and trends
router.get(
  '/reviews/insights',
  authenticate,
  reviewController.getReviewInsights
);

// Get reviews for specific property
router.get(
  '/properties/:propertyId/reviews',
  authenticate,
  validateReviewFilters,
  reviewController.getPropertyReviews
);

// Review management endpoints (separate from reservation review responses)
router.post(
  '/review-management/:reviewId/response',
  authenticate,
  validateReviewResponse,
  reviewController.respondToReview
);

router.put(
  '/review-management/:reviewId/response',
  authenticate,
  validateReviewResponse,
  reviewController.updateResponse
);

router.delete(
  '/review-management/:reviewId/response',
  authenticate,
  reviewController.deleteResponse
);

export default router;