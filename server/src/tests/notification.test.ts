import request from 'supertest';
import app from '../app';
import prisma from '../config/database';
import { hashPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { describe, it, beforeAll, expect } from '@jest/globals';
import { cleanupDatabase } from './setup';

describe('Notification API Tests', () => {
  let authToken: string;
  let userId: string;
  let notificationId: string;

  beforeAll(async () => {
    await cleanupDatabase();
    
    const hashedPassword = await hashPassword('Test@123');
    const timestamp = Date.now();
    const user = await prisma.user.create({
      data: {
        username: `notifowner_${timestamp}`,
        email: `notif_${timestamp}@example.com`,
        password: hashedPassword,
        role: 'HomeOwner',
        isAdmin: false,
      },
    });
    
    userId = user.id;
    authToken = generateToken(user);

    // Create a test notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        type: 'ReservationConfirmed',
        title: 'New Reservation',
        message: 'You have a new reservation',
        isOfficial: false,
        sentAt: new Date(),
      },
    });
    
    notificationId = notification.id;
  });

  describe('GET /notifications', () => {
    it('should get user notifications', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.notifications).toBeDefined();
      expect(response.body.notifications).toHaveLength(1);
      expect(response.body.notifications[0].title).toBe('New Reservation');
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter notifications by read status', async () => {
      const response = await request(app)
        .get('/api/notifications?isRead=false')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.notifications).toHaveLength(1);
      expect(response.body.notifications[0].isRead).toBe(false);
    });

    it('should filter notifications by type', async () => {
      const response = await request(app)
        .get('/api/notifications?type=ReservationConfirmed')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.notifications).toHaveLength(1);
      expect(response.body.notifications[0].type).toBe('ReservationConfirmed');
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });
  });

  describe('GET /notifications/unread-count', () => {
    it('should get unread notification count', async () => {
      const response = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.unreadCount).toBe(1);
    });
  });

  describe('POST /notifications', () => {
    it('should create notification successfully', async () => {
      const notificationData = {
        userId,
        type: 'PaymentReceived',
        title: 'Payment Received',
        message: 'Your payment has been processed',
        isOfficial: false,
      };

      const response = await request(app)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(notificationData)
        .expect(201);

      expect(response.body.message).toBe('Notification created successfully');
      expect(response.body.notification.title).toBe('Payment Received');
      expect(response.body.notification.type).toBe('PaymentReceived');
    });

    it('should reject notification with invalid type', async () => {
      const response = await request(app)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId,
          type: 'InvalidType',
          title: 'Test',
          message: 'Test message',
        })
        .expect(400);

      expect(response.body.error).toContain('type must be one of');
    });

    it('should reject notification without required fields', async () => {
      const response = await request(app)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId,
          type: 'Other',
        })
        .expect(400);

      expect(response.body.error).toBe('title is required and cannot be empty');
    });
  });

  describe('POST /notifications/mark-read', () => {
    it('should mark notifications as read', async () => {
      const response = await request(app)
        .post('/api/notifications/mark-read')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ notificationIds: [notificationId] })
        .expect(200);

      expect(response.body.message).toBe('Notifications marked as read');
      expect(response.body.updated).toBe(1);

      // Verify notification is marked as read
      const updatedNotification = await prisma.notification.findUnique({
        where: { id: notificationId },
      });
      expect(updatedNotification?.isRead).toBe(true);
    });

    it('should reject invalid notification IDs', async () => {
      const response = await request(app)
        .post('/api/notifications/mark-read')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ notificationIds: [] })
        .expect(400);

      expect(response.body.error).toBe('notificationIds cannot be empty');
    });
  });

  describe('POST /notifications/mark-all-read', () => {
    it('should mark all notifications as read', async () => {
      // Create another unread notification
      await prisma.notification.create({
        data: {
          userId,
          type: 'ReviewReceived',
          title: 'New Review',
          message: 'You received a new review',
          isOfficial: false,
          sentAt: new Date(),
        },
      });

      const response = await request(app)
        .post('/api/notifications/mark-all-read')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('All notifications marked as read');
      expect(response.body.updated).toBeGreaterThanOrEqual(1);
    });
  });

  describe('DELETE /notifications/:notificationId', () => {
    it('should delete notification successfully', async () => {
      // Create notification to delete
      const notificationToDelete = await prisma.notification.create({
        data: {
          userId,
          type: 'Other',
          title: 'Test Delete',
          message: 'This will be deleted',
          isOfficial: false,
          sentAt: new Date(),
        },
      });

      const response = await request(app)
        .delete(`/api/notifications/${notificationToDelete.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Notification deleted successfully');

      // Verify notification is deleted
      const deletedNotification = await prisma.notification.findUnique({
        where: { id: notificationToDelete.id },
      });
      expect(deletedNotification).toBeNull();
    });

    it('should reject deletion of non-existent notification', async () => {
      const response = await request(app)
        .delete('/api/notifications/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toBe('Notification not found or you do not have permission to delete it');
    });
  });

  describe('PUT /notifications/preferences', () => {
    it('should update notification preferences', async () => {
      const preferences = {
        types: ['ReservationConfirmed', 'PaymentReceived'],
        emailEnabled: true,
        pushEnabled: false,
      };

      const response = await request(app)
        .put('/api/notifications/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send(preferences)
        .expect(200);

      expect(response.body.message).toBe('Notification preferences updated successfully');
      expect(response.body.preferences).toEqual(preferences);
    });

    it('should reject invalid notification types', async () => {
      const response = await request(app)
        .put('/api/notifications/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          types: ['InvalidType'],
          emailEnabled: true,
          pushEnabled: true,
        })
        .expect(400);

      expect(response.body.error).toContain('Invalid notification type');
    });
  });
});