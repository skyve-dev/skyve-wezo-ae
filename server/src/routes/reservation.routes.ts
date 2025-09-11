import { Router } from 'express';
import * as reservationController from '../controllers/reservation.controller';
import { CancellationController } from '../controllers/cancellation.controller';
import { authenticate } from '../middleware/auth';
import {
  validateReservationUpdate,
  validateNoShow,
  validateGuestMessage,
  validateReviewResponse,
} from '../middleware/reservation.validation';

const router = Router();
const cancellationController = new CancellationController();

router.get(
  '/reservations',
  authenticate,
  reservationController.getAllReservations
);

router.get(
  '/reservations/:reservationId',
  authenticate,
  reservationController.getReservation
);

router.put(
  '/reservations/:reservationId',
  authenticate,
  validateReservationUpdate,
  reservationController.updateReservation
);

router.post(
  '/reservations/:reservationId/no-show',
  authenticate,
  validateNoShow,
  reservationController.reportNoShow
);

router.post(
  '/reservations/:reservationId/messages',
  authenticate,
  validateGuestMessage,
  reservationController.sendGuestMessage
);

router.get(
  '/reservations/:reservationId/messages',
  authenticate,
  reservationController.getReservationMessages
);

router.post(
  '/reviews/:reviewId/response',
  authenticate,
  validateReviewResponse,
  reservationController.respondToReview
);

// Cancellation routes
router.get(
  '/reservations/:id/cancellation-preview',
  authenticate,
  cancellationController.getCancellationPreview
);

router.post(
  '/reservations/:id/cancel',
  authenticate,
  cancellationController.cancelReservation
);

router.get(
  '/cancellations/history',
  authenticate,
  cancellationController.getCancellationHistory
);

export default router;