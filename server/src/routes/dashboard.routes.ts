import express from 'express';
import {
  getDashboardStats,
  getQuickActions,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  dismissQuickAction
} from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticate);

// Dashboard stats
router.get('/stats', getDashboardStats);

// Quick actions
router.get('/quick-actions', getQuickActions);
router.delete('/quick-actions/:actionId', dismissQuickAction);

// Notifications
router.get('/notifications', getNotifications);
router.patch('/notifications/:notificationId/read', markNotificationAsRead);
router.patch('/notifications/mark-all-read', markAllNotificationsAsRead);

export default router;