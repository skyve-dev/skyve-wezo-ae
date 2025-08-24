import request from 'supertest';
import app from '../app';
import prisma from '../config/database';
import { hashPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { describe, it, beforeAll, expect } from '@jest/globals';
import { cleanupDatabase } from './setup';

describe('Rate Plan API Tests', () => {
  let authToken: string;
  let userId: string;
  let propertyId: string;
  let ratePlanId: string;

  beforeAll(async () => {
    await cleanupDatabase();
    
    const hashedPassword = await hashPassword('Test@123');
    const timestamp = Date.now();
    const user = await prisma.user.create({
      data: {
        username: `rateplanowner_${timestamp}`,
        email: `rateplan_${timestamp}@example.com`,
        password: hashedPassword,
        role: 'HomeOwner',
        isAdmin: false,
      },
    });
    
    userId = user.id;
    authToken = generateToken(user);

    // Create a test property using propertyService
    const propertyData = {
      name: 'Rate Plan Test Villa',
      address: {
        countryOrRegion: 'UAE',
        city: 'Dubai',
        zipCode: '12345',
      },
      layout: {
        maximumGuest: 4,
        bathrooms: 2,
        allowChildren: true,
        offerCribs: false,
        propertySizeSqMtr: 100,
      },
      services: {
        serveBreakfast: false,
        parking: 'No',
        languages: ['English'],
      },
      rules: {
        smokingAllowed: false,
        partiesOrEventsAllowed: false,
        petsAllowed: 'No',
      },
      bookingType: 'BookInstantly',
      paymentType: 'Online',
      aboutTheProperty: 'Test property for rate plans',
      aboutTheNeighborhood: 'Test neighborhood',
      firstDateGuestCanCheckIn: '2024-01-01',
    };

    const propertyService = await import('../services/property.service');
    const property = await propertyService.default.createProperty(propertyData, userId);
    
    propertyId = property.propertyId;
  });

  describe('POST /properties/:propertyId/rate-plans', () => {
    it('should create a new rate plan successfully', async () => {
      const ratePlanData = {
        name: 'Standard Flexible Rate',
        type: 'FullyFlexible',
        description: 'Fully flexible rate with free cancellation',
        cancellationPolicy: 'Free cancellation up to 24 hours before check-in',
        includesBreakfast: true,
        restrictions: [
          {
            type: 'MinLengthOfStay',
            value: 2,
            startDate: '2024-01-01',
            endDate: '2024-12-31',
          },
        ],
        prices: [
          {
            date: '2024-01-01',
            basePrice: 1000,
            currency: 'AED',
          },
          {
            date: '2024-01-02',
            basePrice: 1200,
            currency: 'AED',
          },
        ],
      };

      const response = await request(app)
        .post(`/api/properties/${propertyId}/rate-plans`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(ratePlanData)
        .expect(201);

      expect(response.body.message).toBe('Rate plan created successfully');
      expect(response.body.ratePlan.name).toBe('Standard Flexible Rate');
      expect(response.body.ratePlan.type).toBe('FullyFlexible');
      expect(response.body.ratePlan.restrictions).toHaveLength(1);
      expect(response.body.ratePlan.prices).toHaveLength(2);
      
      ratePlanId = response.body.ratePlan.id;
    });

    it('should reject rate plan creation without required fields', async () => {
      const response = await request(app)
        .post(`/api/properties/${propertyId}/rate-plans`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Invalid Rate Plan',
        })
        .expect(400);

      expect(response.body.errors.type).toBe('Rate plan type is required');
    });

    it('should reject invalid rate plan type', async () => {
      const response = await request(app)
        .post(`/api/properties/${propertyId}/rate-plans`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Rate',
          type: 'InvalidType',
          cancellationPolicy: 'Test policy',
        })
        .expect(400);

      expect(response.body.errors.type).toContain('Must be one of');
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .post(`/api/properties/${propertyId}/rate-plans`)
        .send({
          name: 'Test Rate',
          type: 'FullyFlexible',
          cancellationPolicy: 'Test policy',
        })
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });
  });

  describe('GET /properties/:propertyId/rate-plans', () => {
    it('should get all rate plans for property', async () => {
      const response = await request(app)
        .get(`/api/properties/${propertyId}/rate-plans`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.propertyId).toBe(propertyId);
      expect(response.body.ratePlans).toHaveLength(1);
      expect(response.body.ratePlans[0].name).toBe('Standard Flexible Rate');
    });

    it('should reject request for non-owned property', async () => {
      const otherUser = await prisma.user.create({
        data: {
          username: 'otherrateuser',
          email: 'otherrate@example.com',
          password: await hashPassword('Test@123'),
          role: 'HomeOwner',
          isAdmin: false,
        },
      });
      
      const otherToken = generateToken(otherUser);

      const response = await request(app)
        .get(`/api/properties/${propertyId}/rate-plans`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);

      expect(response.body.error).toBe('Property not found or you do not have permission to view it');
    });
  });

  describe('GET /properties/:propertyId/rate-plans/:ratePlanId', () => {
    it('should get specific rate plan details', async () => {
      const response = await request(app)
        .get(`/api/properties/${propertyId}/rate-plans/${ratePlanId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(ratePlanId);
      expect(response.body.name).toBe('Standard Flexible Rate');
      expect(response.body.restrictions).toBeDefined();
      expect(response.body.prices).toBeDefined();
    });

    it('should return 404 for non-existent rate plan', async () => {
      const fakeId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
      
      const response = await request(app)
        .get(`/api/properties/${propertyId}/rate-plans/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toBe('Rate plan not found or you do not have permission to view it');
    });
  });

  describe('PUT /properties/:propertyId/rate-plans/:ratePlanId', () => {
    it('should update rate plan successfully', async () => {
      const updateData = {
        name: 'Updated Flexible Rate',
        description: 'Updated description with new terms',
        includesBreakfast: false,
      };

      const response = await request(app)
        .put(`/api/properties/${propertyId}/rate-plans/${ratePlanId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Rate plan updated successfully');
      expect(response.body.ratePlan.name).toBe('Updated Flexible Rate');
      expect(response.body.ratePlan.description).toBe('Updated description with new terms');
      expect(response.body.ratePlan.includesBreakfast).toBe(false);
    });
  });

  describe('PUT /properties/:propertyId/rate-plans/:ratePlanId/prices', () => {
    it('should update rate plan prices', async () => {
      const priceData = {
        prices: [
          {
            date: '2024-03-01',
            basePrice: 1500,
            currency: 'AED',
          },
          {
            date: '2024-03-02',
            basePrice: 1800,
            currency: 'AED',
          },
        ],
      };

      const response = await request(app)
        .put(`/api/properties/${propertyId}/rate-plans/${ratePlanId}/prices`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(priceData)
        .expect(200);

      expect(response.body.message).toBe('Rate plan prices updated successfully');
      expect(response.body.updatedCount).toBe(2);
      expect(response.body.prices).toHaveLength(2);
    });

    it('should reject invalid price data', async () => {
      const response = await request(app)
        .put(`/api/properties/${propertyId}/rate-plans/${ratePlanId}/prices`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          prices: [
            {
              date: 'invalid-date',
              basePrice: 1000,
            },
          ],
        })
        .expect(400);

      expect(response.body.errors['prices[0].date']).toBe('Must have a valid date');
    });

    it('should reject negative prices', async () => {
      const response = await request(app)
        .put(`/api/properties/${propertyId}/rate-plans/${ratePlanId}/prices`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          prices: [
            {
              date: '2024-04-01',
              basePrice: -100,
            },
          ],
        })
        .expect(400);

      expect(response.body.errors['prices[0].basePrice']).toBe('Must be a positive number');
    });
  });

  describe('PUT /properties/:propertyId/rate-plans/:ratePlanId/restrictions', () => {
    it('should update rate plan restrictions', async () => {
      const restrictionData = {
        restrictions: [
          {
            type: 'MinLengthOfStay',
            value: 3,
            startDate: '2024-06-01',
            endDate: '2024-08-31',
          },
          {
            type: 'MinAdvancedReservation',
            value: 7,
          },
        ],
      };

      const response = await request(app)
        .put(`/api/properties/${propertyId}/rate-plans/${ratePlanId}/restrictions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(restrictionData)
        .expect(200);

      expect(response.body.message).toBe('Rate plan restrictions updated successfully');
      expect(response.body.restrictions).toHaveLength(2);
    });

    it('should reject invalid restriction type', async () => {
      const response = await request(app)
        .put(`/api/properties/${propertyId}/rate-plans/${ratePlanId}/restrictions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          restrictions: [
            {
              type: 'InvalidType',
              value: 1,
            },
          ],
        })
        .expect(400);

      expect(response.body.errors['restrictions[0].type']).toContain('Must be one of');
    });
  });

  describe('DELETE /properties/:propertyId/rate-plans/:ratePlanId', () => {
    it('should delete rate plan successfully', async () => {
      // Create another rate plan to delete
      const ratePlan = await prisma.ratePlan.create({
        data: {
          propertyId,
          name: 'Rate Plan to Delete',
          type: 'NonRefundable',
          description: 'Test rate plan for deletion',
          cancellationPolicy: 'No cancellation allowed',
          includesBreakfast: false,
        },
      });

      const response = await request(app)
        .delete(`/api/properties/${propertyId}/rate-plans/${ratePlan.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Rate plan deleted successfully');
      
      // Verify it's deleted
      const deletedRatePlan = await prisma.ratePlan.findUnique({
        where: { id: ratePlan.id },
      });
      expect(deletedRatePlan).toBeNull();
    });

    it('should return 404 for non-existent rate plan', async () => {
      const fakeId = 'ffffffff-eeee-dddd-cccc-bbbbbbbbbbbb';
      
      const response = await request(app)
        .delete(`/api/properties/${propertyId}/rate-plans/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toBe('Rate plan not found or you do not have permission to delete it');
    });
  });
});