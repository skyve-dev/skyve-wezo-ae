import request from 'supertest';
import app from '../app';
import prisma from '../config/database';
import { PriceAdjustmentType, RatePlanType } from '@prisma/client';

describe('Price API Endpoints', () => {
  let authToken: string;
  let userId: string;
  let propertyId: string;
  let ratePlanId: string;
  let priceId: string;

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.price.deleteMany({});
    await prisma.ratePlan.deleteMany({});
    await prisma.property.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: 'pricetest@example.com' }
    });

    // Create test user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'pricetest@example.com',
        password: 'TestPassword123!',
        firstName: 'Price',
        lastName: 'Test'
      });

    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;

    // Create test address
    const address = await prisma.address.create({
      data: {
        apartmentOrFloorNumber: '123',
        countryOrRegion: 'UAE',
        city: 'Dubai',
        zipCode: 12345
      }
    });

    // Create test property
    const property = await prisma.property.create({
      data: {
        propertyId: 'test-property-price-' + Date.now(),
        name: 'Test Property for Prices',
        ownerId: userId,
        addressId: address.id,
        maximumGuest: 4,
        bathrooms: 2,
        allowChildren: true,
        offerCribs: false,
        serveBreakfast: false,
        parking: 'Available',
        languages: ['English'],
        smokingAllowed: false,
        partiesOrEventsAllowed: false,
        petsAllowed: 'NotAllowed',
      }
    });
    propertyId = property.propertyId;

    // Create test rate plan
    const ratePlan = await prisma.ratePlan.create({
      data: {
        propertyId,
        name: 'Test Base Rate Plan',
        type: RatePlanType.FullyFlexible,
        adjustmentType: PriceAdjustmentType.FixedPrice,
        adjustmentValue: 200,
        priority: 100,
      }
    });
    ratePlanId = ratePlan.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.price.deleteMany({});
    await prisma.ratePlan.deleteMany({});
    await prisma.property.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: 'pricetest@example.com' }
    });
  });

  describe('GET /api/rate-plans/:ratePlanId/prices', () => {
    it('should get prices for a rate plan', async () => {
      const response = await request(app)
        .get(`/api/rate-plans/${ratePlanId}/prices`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Prices retrieved successfully');
      expect(Array.isArray(response.body.prices)).toBe(true);
      expect(typeof response.body.count).toBe('number');
    });

    it('should get prices with date filtering', async () => {
      const startDate = '2024-12-01';
      const endDate = '2024-12-31';

      const response = await request(app)
        .get(`/api/rate-plans/${ratePlanId}/prices`)
        .query({ startDate, endDate })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.filters.startDate).toBeDefined();
      expect(response.body.filters.endDate).toBeDefined();
    });

    it('should return 400 for invalid date format', async () => {
      const response = await request(app)
        .get(`/api/rate-plans/${ratePlanId}/prices`)
        .query({ startDate: 'invalid-date' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.errors.startDate).toBe('Invalid start date format. Use YYYY-MM-DD format');
    });

    it('should return 404 for non-existent rate plan', async () => {
      const response = await request(app)
        .get('/api/rate-plans/non-existent-id/prices')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/rate-plans/:ratePlanId/prices', () => {
    it('should create a new price', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      const response = await request(app)
        .post(`/api/rate-plans/${ratePlanId}/prices`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: dateStr,
          amount: 150.50
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Price created successfully');
      expect(response.body.price.amount).toBe(150.5);
      expect(response.body.price.date).toBe(`${dateStr}T00:00:00.000Z`);
      
      priceId = response.body.price.id;
    });

    it('should update existing price (upsert)', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      const response = await request(app)
        .post(`/api/rate-plans/${ratePlanId}/prices`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: dateStr,
          amount: 175.75
        });

      expect(response.status).toBe(201);
      expect(response.body.price.amount).toBe(175.75);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post(`/api/rate-plans/${ratePlanId}/prices`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: '2024-12-15'
          // Missing amount
        });

      expect(response.status).toBe(400);
      expect(response.body.errors.amount).toBe('Amount is required');
    });

    it('should return 400 for invalid amount', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      const dateStr = tomorrow.toISOString().split('T')[0];

      const response = await request(app)
        .post(`/api/rate-plans/${ratePlanId}/prices`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: dateStr,
          amount: -50
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('must be greater than 0');
    });

    it('should return 400 for past date', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];

      const response = await request(app)
        .post(`/api/rate-plans/${ratePlanId}/prices`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: dateStr,
          amount: 200
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Cannot set prices for past dates');
    });
  });

  describe('POST /api/rate-plans/:ratePlanId/prices/bulk', () => {
    it('should bulk create multiple prices', async () => {
      const updates = [];
      for (let i = 3; i <= 5; i++) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + i);
        updates.push({
          date: futureDate.toISOString().split('T')[0],
          amount: 200 + (i * 10)
        });
      }

      const response = await request(app)
        .post(`/api/rate-plans/${ratePlanId}/prices/bulk`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ updates });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('All prices updated successfully');
      expect(response.body.summary.successful).toBe(3);
      expect(response.body.summary.failed).toBe(0);
    });

    it('should return 400 for empty updates array', async () => {
      const response = await request(app)
        .post(`/api/rate-plans/${ratePlanId}/prices/bulk`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ updates: [] });

      expect(response.status).toBe(400);
      expect(response.body.errors.updates).toBe('Updates array cannot be empty');
    });

    it('should return 400 for too many updates', async () => {
      const updates = [];
      for (let i = 0; i < 366; i++) {
        updates.push({ date: '2025-01-01', amount: 100 });
      }

      const response = await request(app)
        .post(`/api/rate-plans/${ratePlanId}/prices/bulk`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ updates });

      expect(response.status).toBe(400);
      expect(response.body.errors.updates).toBe('Cannot update more than 365 prices at once');
    });
  });

  describe('PUT /api/prices/:priceId', () => {
    it('should update a specific price', async () => {
      const response = await request(app)
        .put(`/api/prices/${priceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 199.99 });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Price updated successfully');
      expect(response.body.price.amount).toBe(199.99);
    });

    it('should return 400 for missing amount', async () => {
      const response = await request(app)
        .put(`/api/prices/${priceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.errors.amount).toBe('Amount is required');
    });

    it('should return 404 for non-existent price', async () => {
      const response = await request(app)
        .put('/api/prices/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 150 });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/rate-plans/:ratePlanId/prices/stats', () => {
    it('should get price statistics', async () => {
      const response = await request(app)
        .get(`/api/rate-plans/${ratePlanId}/prices/stats`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Price statistics retrieved successfully');
      expect(typeof response.body.statistics.totalPrices).toBe('number');
      expect(typeof response.body.statistics.averagePrice).toBe('number');
      expect(typeof response.body.statistics.minPrice).toBe('number');
      expect(typeof response.body.statistics.maxPrice).toBe('number');
    });
  });

  describe('GET /api/rate-plans/:ratePlanId/prices/gaps', () => {
    it('should get price gaps', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 10);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 20);

      const response = await request(app)
        .get(`/api/rate-plans/${ratePlanId}/prices/gaps`)
        .query({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.gaps)).toBe(true);
      expect(typeof response.body.gapCount).toBe('number');
    });

    it('should return 400 for missing date parameters', async () => {
      const response = await request(app)
        .get(`/api/rate-plans/${ratePlanId}/prices/gaps`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.errors.startDate).toBe('Start date is required');
      expect(response.body.errors.endDate).toBe('End date is required');
    });
  });

  describe('POST /api/rate-plans/:ratePlanId/prices/copy', () => {
    it('should copy prices from one range to another', async () => {
      const sourceStart = new Date();
      sourceStart.setDate(sourceStart.getDate() + 1);
      const sourceEnd = new Date();
      sourceEnd.setDate(sourceEnd.getDate() + 3);
      const targetStart = new Date();
      targetStart.setDate(targetStart.getDate() + 30);

      const response = await request(app)
        .post(`/api/rate-plans/${ratePlanId}/prices/copy`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sourceStartDate: sourceStart.toISOString().split('T')[0],
          sourceEndDate: sourceEnd.toISOString().split('T')[0],
          targetStartDate: targetStart.toISOString().split('T')[0]
        });

      expect(response.status).toBe(200);
      expect(typeof response.body.copiedCount).toBe('number');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post(`/api/rate-plans/${ratePlanId}/prices/copy`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sourceStartDate: '2024-12-01'
          // Missing other required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.errors.sourceEndDate).toBe('Source end date is required');
      expect(response.body.errors.targetStartDate).toBe('Target start date is required');
    });
  });

  describe('DELETE /api/prices/:priceId', () => {
    it('should delete a specific price', async () => {
      const response = await request(app)
        .delete(`/api/prices/${priceId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Price deleted successfully');
    });

    it('should return 404 for non-existent price', async () => {
      const response = await request(app)
        .delete('/api/prices/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/rate-plans/:ratePlanId/prices/bulk', () => {
    it('should bulk delete prices in date range', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 3);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 5);

      const response = await request(app)
        .delete(`/api/rate-plans/${ratePlanId}/prices/bulk`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Successfully deleted');
      expect(typeof response.body.deletedCount).toBe('number');
    });

    it('should return 400 for invalid date range', async () => {
      const response = await request(app)
        .delete(`/api/rate-plans/${ratePlanId}/prices/bulk`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          startDate: '2024-12-31',
          endDate: '2024-12-01' // End before start
        });

      expect(response.status).toBe(400);
      expect(response.body.errors.endDate).toBe('Start date must be before end date');
    });
  });

  describe('Authorization Tests', () => {
    it('should return 401 without authentication token', async () => {
      const response = await request(app)
        .get(`/api/rate-plans/${ratePlanId}/prices`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should return 404 for another user\'s rate plan', async () => {
      // Create another user
      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'otherpriceuser@example.com',
          password: 'TestPassword123!',
          firstName: 'Other',
          lastName: 'User'
        });

      const response = await request(app)
        .get(`/api/rate-plans/${ratePlanId}/prices`)
        .set('Authorization', `Bearer ${otherUserResponse.body.token}`);

      expect(response.status).toBe(404);

      // Clean up other user
      await prisma.user.delete({
        where: { id: otherUserResponse.body.user.id }
      });
    });
  });
});