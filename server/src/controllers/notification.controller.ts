import { Request, Response } from 'express';
import notificationService from '../services/notification.service';

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { isRead, isOfficial, type, page = 1, limit = 20 } = req.query;

    const filters: any = {};
    if (typeof isRead === 'string') {
      filters.isRead = isRead === 'true';
    }
    if (typeof isOfficial === 'string') {
      filters.isOfficial = isOfficial === 'true';
    }
    if (type) {
      filters.type = type as string;
    }

    const result = await notificationService.getNotifications(
      userId,
      filters,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json(result);
  } catch (error: any) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, type, title, message, data, isOfficial, scheduledAt } = req.body;

    const notification = await notificationService.createNotification({
      userId,
      type,
      title,
      message,
      data,
      isOfficial,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
    });

    res.status(201).json({
      message: 'Notification created successfully',
      notification,
    });
  } catch (error: any) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markNotificationsAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { notificationIds } = req.body;

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      res.status(400).json({ error: 'notificationIds must be a non-empty array' });
      return;
    }

    const result = await notificationService.markAsRead(userId, notificationIds);

    res.json({
      message: 'Notifications marked as read',
      ...result,
    });
  } catch (error: any) {
    console.error('Mark notifications as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const result = await notificationService.markAllAsRead(userId);

    res.json({
      message: 'All notifications marked as read',
      ...result,
    });
  } catch (error: any) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { notificationId } = req.params;

    const result = await notificationService.deleteNotification(userId, notificationId);

    res.json(result);
  } catch (error: any) {
    console.error('Delete notification error:', error);
    if (error.message === 'Notification not found or you do not have permission to delete it') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const count = await notificationService.getUnreadCount(userId);

    res.json({ unreadCount: count });
  } catch (error: any) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateNotificationPreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { types, emailEnabled, pushEnabled } = req.body;

    const result = await notificationService.updatePreferences(userId, {
      types,
      emailEnabled,
      pushEnabled,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};