import request from 'supertest';
import app from '../app';
import prisma from '../config/database';
import { hashPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { describe, it, beforeAll, expect } from '@jest/globals';
import { cleanupDatabase } from './setup';

describe('Support System API Tests', () => {
  let userToken: string;
  let userId: string;
  let ticketId: string;
  let faqId: string;
  let guideId: string;

  beforeAll(async () => {
    await cleanupDatabase();
    
    // Clean FAQ and Guide tables explicitly
    await prisma.fAQ.deleteMany({});
    await prisma.guide.deleteMany({});
    
    const hashedPassword = await hashPassword('Test@123');
    const timestamp = Date.now();
    
    // Create test user
    const user = await prisma.user.create({
      data: {
        username: `supportuser_${timestamp}`,
        email: `supportuser_${timestamp}@example.com`,
        password: hashedPassword,
        role: 'HomeOwner',
        isAdmin: false,
      },
    });
    
    userId = user.id;
    userToken = generateToken(user);

    // Create test FAQ
    const faq = await prisma.fAQ.create({
      data: {
        question: 'How do I reset my password?',
        answer: 'You can reset your password by clicking on the "Forgot Password" link on the login page.',
        category: 'Technical',
        tags: ['password', 'reset', 'login'],
        isPublished: true,
        orderIndex: 1,
        viewCount: 0,
        helpCount: 0,
      },
    });
    faqId = faq.id;

    // Create test guide
    const guide = await prisma.guide.create({
      data: {
        title: 'Getting Started with Property Management',
        description: 'A comprehensive guide to managing your properties on Wezo.ae',
        content: 'This guide will walk you through the basics of property management...',
        category: 'PropertyManagement',
        tags: ['property', 'management', 'guide'],
        isPublished: true,
        orderIndex: 1,
        viewCount: 0,
        likeCount: 0,
      },
    });
    guideId = guide.id;
  });

  describe('POST /support/tickets', () => {
    it('should create a support ticket successfully', async () => {
      const ticketData = {
        subject: 'Unable to upload property photos',
        description: 'I am having trouble uploading photos for my property listing. The upload keeps failing.',
        category: 'Technical',
        priority: 'Medium',
        metadata: { browser: 'Chrome', version: '91.0' },
      };

      const response = await request(app)
        .post('/api/support/tickets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(ticketData)
        .expect(201);

      expect(response.body.message).toBe('Support ticket created successfully');
      expect(response.body.ticket.subject).toBe(ticketData.subject);
      expect(response.body.ticket.category).toBe(ticketData.category);
      expect(response.body.ticket.priority).toBe(ticketData.priority);
      expect(response.body.ticket.status).toBe('Open');
      
      ticketId = response.body.ticket.id;
    });

    it('should reject ticket with invalid data', async () => {
      const response = await request(app)
        .post('/api/support/tickets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          subject: 'Hi',
          description: 'Help',
          category: 'InvalidCategory',
        })
        .expect(400);

      expect(response.body.errors.subject).toBe('Subject must be between 5 and 200 characters');
    });

    it('should reject unauthorized request', async () => {
      const response = await request(app)
        .post('/api/support/tickets')
        .send({
          subject: 'Test ticket',
          description: 'Test description',
          category: 'Technical',
        })
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });
  });

  describe('GET /support/tickets', () => {
    it('should get user tickets with pagination', async () => {
      const response = await request(app)
        .get('/api/support/tickets')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.tickets).toBeDefined();
      expect(response.body.tickets).toHaveLength(1);
      expect(response.body.tickets[0].subject).toBe('Unable to upload property photos');
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter tickets by status', async () => {
      const response = await request(app)
        .get('/api/support/tickets?status=Open')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.tickets).toHaveLength(1);
      expect(response.body.tickets[0].status).toBe('Open');
    });

    it('should filter tickets by category', async () => {
      const response = await request(app)
        .get('/api/support/tickets?category=Technical')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.tickets).toHaveLength(1);
      expect(response.body.tickets[0].category).toBe('Technical');
    });
  });

  describe('GET /support/tickets/:ticketId', () => {
    it('should get specific ticket with messages', async () => {
      const response = await request(app)
        .get(`/api/support/tickets/${ticketId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.id).toBe(ticketId);
      expect(response.body.subject).toBe('Unable to upload property photos');
      expect(response.body.messages).toBeDefined();
      expect(response.body.messages).toHaveLength(1); // System message
    });

    it('should reject request for non-existent ticket', async () => {
      const response = await request(app)
        .get('/api/support/tickets/non-existent-id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.error).toBe('Support ticket not found or you do not have permission to view it');
    });
  });

  describe('POST /support/tickets/:ticketId/messages', () => {
    it('should add message to ticket', async () => {
      const messageData = {
        content: 'I tried clearing my browser cache but the issue persists.',
        attachments: ['screenshot.png'],
      };

      const response = await request(app)
        .post(`/api/support/tickets/${ticketId}/messages`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(messageData)
        .expect(201);

      expect(response.body.message).toBe('Message added successfully');
      expect(response.body.messageData.content).toBe(messageData.content);
      expect(response.body.messageData.senderType).toBe('User');
    });

    it('should reject empty message', async () => {
      const response = await request(app)
        .post(`/api/support/tickets/${ticketId}/messages`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ content: '' })
        .expect(400);

      expect(response.body.errors.content).toBe('Message content is required');
    });
  });

  describe('PUT /support/tickets/:ticketId', () => {
    it('should update ticket details', async () => {
      const updateData = {
        subject: 'Unable to upload property photos - Updated',
        priority: 'High',
      };

      const response = await request(app)
        .put(`/api/support/tickets/${ticketId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Support ticket updated successfully');
      expect(response.body.ticket.subject).toBe(updateData.subject);
      expect(response.body.ticket.priority).toBe(updateData.priority);
    });

    it('should reject invalid priority', async () => {
      const response = await request(app)
        .put(`/api/support/tickets/${ticketId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ priority: 'InvalidPriority' })
        .expect(400);

      expect(response.body.errors.priority).toContain('Must be one of');
    });
  });

  describe('POST /support/tickets/:ticketId/close', () => {
    it('should close ticket with resolution', async () => {
      const closeData = {
        resolution: 'Issue was resolved by updating the browser and clearing cache completely.',
      };

      const response = await request(app)
        .post(`/api/support/tickets/${ticketId}/close`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(closeData)
        .expect(200);

      expect(response.body.message).toBe('Support ticket closed successfully');
      expect(response.body.ticket.status).toBe('Closed');
      expect(response.body.ticket.resolution).toBe(closeData.resolution);
    });

    it('should close ticket without resolution', async () => {
      // Create another ticket to test closing without resolution
      const newTicket = await prisma.supportTicket.create({
        data: {
          userId,
          subject: 'Test closing ticket',
          description: 'Test description for closing',
          category: 'General',
          priority: 'Low',
        },
      });

      const response = await request(app)
        .post(`/api/support/tickets/${newTicket.id}/close`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(200);

      expect(response.body.ticket.status).toBe('Closed');
    });
  });

  describe('POST /support/tickets/:ticketId/satisfaction', () => {
    it('should rate satisfaction for closed ticket', async () => {
      const ratingData = { satisfaction: 4 };

      const response = await request(app)
        .post(`/api/support/tickets/${ticketId}/satisfaction`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(ratingData)
        .expect(200);

      expect(response.body.message).toBe('Satisfaction rating submitted successfully');
      expect(response.body.ticket.satisfaction).toBe(4);
    });

    it('should reject satisfaction rating for open ticket', async () => {
      // Create an open ticket
      const openTicket = await prisma.supportTicket.create({
        data: {
          userId,
          subject: 'Open ticket for testing',
          description: 'This ticket should remain open',
          category: 'General',
          priority: 'Medium',
          status: 'Open',
        },
      });

      const response = await request(app)
        .post(`/api/support/tickets/${openTicket.id}/satisfaction`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ satisfaction: 5 })
        .expect(400);

      expect(response.body.error).toBe('Can only rate satisfaction for resolved or closed tickets');
    });

    it('should reject invalid satisfaction rating', async () => {
      const response = await request(app)
        .post(`/api/support/tickets/${ticketId}/satisfaction`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ satisfaction: 6 })
        .expect(400);

      expect(response.body.errors.satisfaction).toBe('Satisfaction rating must be between 1 and 5');
    });
  });

  describe('GET /support/faqs', () => {
    it('should get all published FAQs', async () => {
      const response = await request(app)
        .get('/api/support/faqs')
        .expect(200);

      expect(response.body.faqs).toBeDefined();
      expect(response.body.totalCount).toBe(1);
      expect(response.body.faqs.Technical).toBeDefined();
      expect(response.body.faqs.Technical).toHaveLength(1);
      expect(response.body.faqs.Technical[0].question).toBe('How do I reset my password?');
    });

    it('should filter FAQs by category', async () => {
      const response = await request(app)
        .get('/api/support/faqs?category=Technical')
        .expect(200);

      expect(response.body.faqs.Technical).toHaveLength(1);
    });

    it('should search FAQs by keyword', async () => {
      const response = await request(app)
        .get('/api/support/faqs?search=password')
        .expect(200);

      expect(response.body.totalCount).toBe(1);
      expect(response.body.faqs.Technical[0].question).toContain('password');
    });
  });

  describe('POST /support/faqs/:faqId/view', () => {
    it('should increment FAQ view count', async () => {
      const response = await request(app)
        .post(`/api/support/faqs/${faqId}/view`)
        .expect(200);

      expect(response.body.viewCount).toBe(1);
    });

    it('should reject request for non-existent FAQ', async () => {
      const response = await request(app)
        .post('/api/support/faqs/00000000-0000-0000-0000-000000000000/view')
        .expect(400);

      expect(response.body.errors.faqId).toBe('Invalid FAQ ID format');
    });
  });

  describe('POST /support/faqs/:faqId/helpful', () => {
    it('should mark FAQ as helpful', async () => {
      const response = await request(app)
        .post(`/api/support/faqs/${faqId}/helpful`)
        .expect(200);

      expect(response.body.message).toBe('Thank you for your feedback!');
    });
  });

  describe('GET /support/guides', () => {
    it('should get all published guides', async () => {
      const response = await request(app)
        .get('/api/support/guides')
        .expect(200);

      expect(response.body.guides).toBeDefined();
      expect(response.body.totalCount).toBe(1);
      expect(response.body.guides.PropertyManagement).toBeDefined();
      expect(response.body.guides.PropertyManagement).toHaveLength(1);
      expect(response.body.guides.PropertyManagement[0].title).toBe('Getting Started with Property Management');
    });

    it('should filter guides by category', async () => {
      const response = await request(app)
        .get('/api/support/guides?category=PropertyManagement')
        .expect(200);

      expect(response.body.guides.PropertyManagement).toHaveLength(1);
    });

    it('should search guides by keyword', async () => {
      const response = await request(app)
        .get('/api/support/guides?search=property')
        .expect(200);

      expect(response.body.totalCount).toBe(1);
      expect(response.body.guides.PropertyManagement[0].title).toContain('Property');
    });
  });

  describe('GET /support/guides/:guideId', () => {
    it('should get guide content and increment view count', async () => {
      const response = await request(app)
        .get(`/api/support/guides/${guideId}`)
        .expect(200);

      expect(response.body.title).toBe('Getting Started with Property Management');
      expect(response.body.content).toBe('This guide will walk you through the basics of property management...');
      expect(response.body.viewCount).toBe(1);
    });

    it('should reject request for non-existent guide', async () => {
      const response = await request(app)
        .get('/api/support/guides/00000000-0000-0000-0000-000000000000')
        .expect(400);

      expect(response.body.errors.guideId).toBe('Invalid guide ID format');
    });
  });

  describe('POST /support/guides/:guideId/like', () => {
    it('should like guide and increment like count', async () => {
      const response = await request(app)
        .post(`/api/support/guides/${guideId}/like`)
        .expect(200);

      expect(response.body.message).toBe('Thank you for your feedback!');
    });

    it('should reject request for non-existent guide', async () => {
      const response = await request(app)
        .post('/api/support/guides/00000000-0000-0000-0000-000000000000/like')
        .expect(400);

      expect(response.body.errors.guideId).toBe('Invalid guide ID format');
    });
  });
});