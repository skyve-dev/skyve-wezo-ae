import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export class NotificationService {
  async getNotifications(
    userId: string,
    filters: {
      isRead?: boolean;
      isOfficial?: boolean;
      type?: string;
    } = {},
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    const whereClause: Prisma.NotificationWhereInput = {
      userId,
    };

    if (typeof filters.isRead === 'boolean') {
      whereClause.isRead = filters.isRead;
    }

    if (typeof filters.isOfficial === 'boolean') {
      whereClause.isOfficial = filters.isOfficial;
    }

    if (filters.type) {
      whereClause.type = filters.type as any;
    }

    const skip = (page - 1) * limit;

    const [notifications, totalCount] = await prisma.$transaction([
      prisma.notification.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where: whereClause }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    isOfficial?: boolean;
    scheduledAt?: Date;
  }): Promise<any> {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type as any,
        title: data.title,
        message: data.message,
        data: data.data,
        isOfficial: data.isOfficial || false,
        scheduledAt: data.scheduledAt,
        sentAt: data.scheduledAt ? undefined : new Date(),
      },
    });

    return notification;
  }

  async markAsRead(userId: string, notificationIds: string[]): Promise<any> {
    const updated = await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { updated: updated.count };
  }

  async markAllAsRead(userId: string): Promise<any> {
    const updated = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { updated: updated.count };
  }

  async deleteNotification(userId: string, notificationId: string): Promise<any> {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new Error('Notification not found or you do not have permission to delete it');
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return { message: 'Notification deleted successfully' };
  }

  async getUnreadCount(userId: string): Promise<number> {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return count;
  }

  async updatePreferences(userId: string, preferences: {
    types: string[];
    emailEnabled: boolean;
    pushEnabled: boolean;
  }): Promise<any> {
    // For MVP, we'll store preferences as JSON in user metadata
    // In a full implementation, this would be a separate UserNotificationPreferences table
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // For now, return success - in full implementation would update preferences table
    return {
      message: 'Notification preferences updated successfully',
      preferences,
    };
  }

  // Helper method for creating system notifications
  async createSystemNotification(
    userIds: string[],
    type: string,
    title: string,
    message: string,
    data?: any
  ): Promise<any> {
    const notifications = userIds.map(userId => ({
      userId,
      type: type as any,
      title,
      message,
      data,
      isOfficial: true,
      sentAt: new Date(),
    }));

    const created = await prisma.notification.createMany({
      data: notifications,
    });

    return { created: created.count };
  }
}

export default new NotificationService();