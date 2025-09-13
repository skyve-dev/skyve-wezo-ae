import { Request, Response } from 'express';
import dashboardService from '../services/dashboard.service';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { startDate, endDate, propertyIds, includeInactive } = req.query;

    const filters: {
      dateRange?: { start: string; end: string };
      propertyIds?: string[];
      includeInactive?: boolean;
    } = {};

    if (startDate && endDate) {
      filters.dateRange = {
        start: startDate as string,
        end: endDate as string
      };
    }

    if (propertyIds) {
      const ids = (propertyIds as string).split(',').filter(id => id.trim());
      if (ids.length > 0) {
        filters.propertyIds = ids;
      }
    }

    if (includeInactive !== undefined) {
      filters.includeInactive = includeInactive === 'true';
    }

    const stats = await dashboardService.getDashboardStats(req.user.id, filters);

    res.json({ stats });
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getQuickActions = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const quickActions = await dashboardService.getQuickActions(req.user.id);

    res.json({ quickActions });
  } catch (error: any) {
    console.error('Get quick actions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { unreadOnly, category, limit } = req.query;

    const filters: {
      unreadOnly?: boolean;
      category?: string;
      limit?: number;
    } = {};

    if (unreadOnly) {
      filters.unreadOnly = unreadOnly === 'true';
    }

    if (category) {
      filters.category = category as string;
    }

    if (limit) {
      filters.limit = parseInt(limit as string, 10);
    }

    const notifications = await dashboardService.getNotifications(req.user.id, filters);

    res.json({ notifications });
  } catch (error: any) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { notificationId } = req.params;
    const { markAllRead = false } = req.body;

    const updatedIds = await dashboardService.markNotificationAsRead(
      req.user.id,
      notificationId,
      markAllRead
    );

    res.json({ updatedIds });
  } catch (error: any) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markAllNotificationsAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const updatedIds = await dashboardService.markNotificationAsRead(
      req.user.id,
      undefined,
      true
    );

    res.json({ updatedIds });
  } catch (error: any) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const dismissQuickAction = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { actionId } = req.params;

    await dashboardService.dismissQuickAction(req.user.id, actionId);

    res.json({ message: 'Quick action dismissed successfully' });
  } catch (error: any) {
    console.error('Dismiss quick action error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};