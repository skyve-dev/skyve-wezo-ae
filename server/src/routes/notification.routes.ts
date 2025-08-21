import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';
import {
  validateCreateNotification,
  validateMarkAsRead,
  validateUpdatePreferences,
} from '../middleware/notification.validation';

const router = Router();

// Get user notifications
router.get(
  '/notifications',
  authenticate,
  notificationController.getNotifications
);

// Get unread notification count
router.get(
  '/notifications/unread-count',
  authenticate,
  notificationController.getUnreadCount
);

// Create notification (admin/system use)
router.post(
  '/notifications',
  authenticate,
  validateCreateNotification,
  notificationController.createNotification
);

// Mark notifications as read
router.post(
  '/notifications/mark-read',
  authenticate,
  validateMarkAsRead,
  notificationController.markNotificationsAsRead
);

// Mark all notifications as read
router.post(
  '/notifications/mark-all-read',
  authenticate,
  notificationController.markAllAsRead
);

// Delete notification
router.delete(
  '/notifications/:notificationId',
  authenticate,
  notificationController.deleteNotification
);

// Update notification preferences
router.put(
  '/notifications/preferences',
  authenticate,
  validateUpdatePreferences,
  notificationController.updateNotificationPreferences
);

export default router;