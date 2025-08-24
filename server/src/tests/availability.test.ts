import request from 'supertest';
import app from '../app';
import prisma from '../config/database';
import { hashPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { describe, it, beforeAll, expect } from '@jest/globals';
import { cleanupDatabase } from './setup';
import propertyService from '../services/property.service';

describe('Availability API Tests', () => {
  let authToken: string;
  let userId: string;
  let propertyId: string;

  beforeAll(async () => {
    await cleanupDatabase();
    
    const hashedPassword = await hashPassword('Test@123');
    const timestamp = Date.now();
    const user = await prisma.user.create({
      data: {
        username: `availabilityowner_${timestamp}`,
        email: `availability_${timestamp}@example.com`,
        password: hashedPassword,
        role: 'HomeOwner',
        isAdmin: false,
      },
    });
    
    userId = user.id;
    authToken = generateToken(user);

    // Create a test property using propertyService
    const propertyData = {
      name: 'Availability Test Villa',
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
      aboutTheProperty: 'Test property for availability',
      aboutTheNeighborhood: 'Test neighborhood',
      firstDateGuestCanCheckIn: '2024-01-01',
    };

    const property = await propertyService.createProperty(propertyData, userId);
    propertyId = property.propertyId;
  });

  describe('GET /properties/:propertyId/availability', () => {
    it('should get property availability for date range', async () => {
      // First, add some availability data
      await prisma.availability.createMany({
        data: [
          {
            propertyId,
            date: new Date('2024-01-01'),
            isAvailable: true,
          },
          {
            propertyId,
            date: new Date('2024-01-02'),
            isAvailable: false,
          },
          {
            propertyId,
            date: new Date('2024-01-03'),
            isAvailable: true,
          },
        ],
      });

      const response = await request(app)
        .get(`/api/properties/${propertyId}/availability`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-03',
        })
        .expect(200);

      expect(response.body.propertyId).toBe(propertyId);
      expect(response.body.availability).toHaveLength(3);
      expect(response.body.availability[0].isAvailable).toBe(true);
      expect(response.body.availability[1].isAvailable).toBe(false);
      expect(response.body.availability[2].isAvailable).toBe(true);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get(`/api/properties/${propertyId}/availability`)
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });

    it('should reject request for non-owned property', async () => {
      const otherUser = await prisma.user.create({
        data: {
          username: 'otheravailuser',
          email: 'otheravail@example.com',
          password: await hashPassword('Test@123'),
          role: 'HomeOwner',
          isAdmin: false,
        },
      });
      
      const otherToken = generateToken(otherUser);

      const response = await request(app)
        .get(`/api/properties/${propertyId}/availability`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);

      expect(response.body.error).toBe('Property not found or you do not have permission to view it');
    });
  });

  describe('PUT /properties/:propertyId/availability/:date', () => {
    it('should update single day availability', async () => {
      const testDate = '2024-02-01';
      
      const response = await request(app)
        .put(`/api/properties/${propertyId}/availability/${testDate}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          isAvailable: false,
          reason: 'Property maintenance',
        })
        .expect(200);

      expect(response.body.message).toBe('Availability updated successfully');
      expect(response.body.availability.isAvailable).toBe(false);
    });

    it('should reject invalid date format', async () => {
      const response = await request(app)
        .put(`/api/properties/${propertyId}/availability/invalid-date`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ isAvailable: false })
        .expect(400);

      expect(response.body.errors.date).toBe('Invalid date format');
    });

    it('should reject invalid isAvailable value', async () => {
      const response = await request(app)
        .put(`/api/properties/${propertyId}/availability/2024-02-02`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ isAvailable: 'not-boolean' })
        .expect(400);

      expect(response.body.errors.isAvailable).toBe('isAvailable must be a boolean');
    });
  });

  describe('PUT /properties/:propertyId/availability/bulk', () => {
    it('should bulk update availability', async () => {
      const updates = [
        { date: '2024-03-01', isAvailable: true },
        { date: '2024-03-02', isAvailable: false },
        { date: '2024-03-03', isAvailable: true },
      ];

      const response = await request(app)
        .put(`/api/properties/${propertyId}/availability/bulk`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ updates });

      console.log('Bulk update response:', response.status, response.body);
      expect(response.status).toBe(200);

      expect(response.body.message).toBe('Bulk availability update completed');
      expect(response.body.updated).toBe(3);
      expect(response.body.failed).toHaveLength(0);
    });

    it('should reject empty updates array', async () => {
      const response = await request(app)
        .put(`/api/properties/${propertyId}/availability/bulk`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ updates: [] })
        .expect(400);

      expect(response.body.errors.updates).toBe('Updates array cannot be empty');
    });

    it('should reject non-array updates', async () => {
      const response = await request(app)
        .put(`/api/properties/${propertyId}/availability/bulk`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ updates: 'not-array' })
        .expect(400);

      expect(response.body.errors.updates).toBe('Updates must be an array');
    });

    it('should reject too many updates', async () => {
      const updates = Array.from({ length: 366 }, (_, i) => ({
        date: `2024-01-${i + 1}`,
        isAvailable: true,
      }));

      const response = await request(app)
        .put(`/api/properties/${propertyId}/availability/bulk`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ updates })
        .expect(400);

      expect(response.body.errors.updates).toBe('Cannot update more than 365 days at once');
    });
  });
});