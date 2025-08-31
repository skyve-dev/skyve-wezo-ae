// @ts-ignore
import request from 'supertest';
import app from '../app';
import prisma from '../config/database';
import { hashPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { describe, test, beforeAll, afterAll, expect } from '@jest/globals';
import { cleanupDatabase } from './setup';
import ratePlanService from '../services/rateplan.service';
import { ModifierType, CancellationType } from '@prisma/client';

describe('Rate Plan API', () => {
  let authToken: string;
  let propertyId: string;
  let userId: string;
  let ratePlanId: string;

  beforeAll(async () => {
    await cleanupDatabase();
    
    // Create test user
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

    // Create test property
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
    
    // Set property status to Live for booking tests
    await prisma.property.update({
      where: { propertyId },
      data: { status: 'Live' }
    });
    
    // Set up basic weekly pricing for booking tests
    await request(app)
      .put(`/api/properties/${propertyId}/pricing/weekly`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        fullDay: {
          monday: 300, tuesday: 300, wednesday: 300, thursday: 300,
          friday: 450, saturday: 500, sunday: 400
        },
        halfDay: {
          monday: 210, tuesday: 210, wednesday: 210, thursday: 210,
          friday: 315, saturday: 350, sunday: 280
        }
      });
  });

  afterAll(async () => {
    await cleanupDatabase();
  });

  describe('Rate Plan CRUD Operations', () => {
    test('should create a percentage discount rate plan successfully', async () => {
      const ratePlanData = {
        name: 'Early Bird Discount',
        priceModifierType: ModifierType.Percentage,
        priceModifierValue: -20,
        description: 'Book 30 days in advance for 20% off',
        priority: 1,
        minAdvanceBooking: 30,
        isActive: true
      };

      const response = await request(app)
        .post(`/api/properties/${propertyId}/rate-plans`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(ratePlanData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Rate plan created successfully');
      expect(response.body.ratePlan).toHaveProperty('name', 'Early Bird Discount');
      expect(response.body.ratePlan).toHaveProperty('priceModifierType', 'Percentage');
      expect(response.body.ratePlan).toHaveProperty('priceModifierValue', -20);
      expect(response.body.ratePlan).toHaveProperty('priority', 1);
      expect(response.body.ratePlan).toHaveProperty('minAdvanceBooking', 30);
      
      ratePlanId = response.body.ratePlan.id;
    });

    test('should create a fixed amount surcharge rate plan', async () => {
      const ratePlanData = {
        name: 'Premium Service',
        priceModifierType: ModifierType.FixedAmount,
        priceModifierValue: 100,
        description: 'Premium cleaning and concierge service',
        priority: 2,
        features: {
          includedAmenityIds: ['amenity-1', 'amenity-2'],
          specialFeatures: ['Premium cleaning', 'Concierge service']
        },
        cancellationPolicy: {
          type: CancellationType.Moderate,
          rules: [
            { daysBeforeCheckIn: 7, refundPercentage: 100 },
            { daysBeforeCheckIn: 3, refundPercentage: 50 },
            { daysBeforeCheckIn: 0, refundPercentage: 0 }
          ]
        }
      };

      const response = await request(app)
        .post(`/api/properties/${propertyId}/rate-plans`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(ratePlanData)
        .expect(201);

      expect(response.body.ratePlan).toHaveProperty('name', 'Premium Service');
      expect(response.body.ratePlan).toHaveProperty('priceModifierType', 'FixedAmount');
      expect(response.body.ratePlan).toHaveProperty('priceModifierValue', 100);
      expect(response.body.ratePlan.features).toHaveProperty('includedAmenityIds');
      expect(response.body.ratePlan.cancellationPolicy).toHaveProperty('type', 'Moderate');
    });

    test('should get all rate plans for property', async () => {
      const response = await request(app)
        .get(`/api/properties/${propertyId}/rate-plans`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Rate plans retrieved successfully');
      expect(response.body.ratePlans).toHaveLength(2);
      expect(response.body).toHaveProperty('count', 2);
    });

    test('should get public rate plans for property', async () => {
      const response = await request(app)
        .get(`/api/properties/${propertyId}/rate-plans/public`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Public rate plans retrieved successfully');
      expect(response.body.ratePlans.length).toBeGreaterThanOrEqual(2);
      
      // All returned rate plans should be active
      response.body.ratePlans.forEach((ratePlan: any) => {
        expect(ratePlan.isActive).toBe(true);
      });
    });

    test('should get specific rate plan by ID', async () => {
      const response = await request(app)
        .get(`/api/properties/${propertyId}/rate-plans/${ratePlanId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Rate plan retrieved successfully');
      expect(response.body.ratePlan).toHaveProperty('id', ratePlanId);
      expect(response.body.ratePlan).toHaveProperty('name', 'Early Bird Discount');
    });

    test('should update rate plan successfully', async () => {
      const updateData = {
        name: 'Updated Early Bird',
        priceModifierValue: -25,
        description: 'Updated description with better discount'
      };

      const response = await request(app)
        .put(`/api/properties/${propertyId}/rate-plans/${ratePlanId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Rate plan updated successfully');
      expect(response.body.ratePlan).toHaveProperty('name', 'Updated Early Bird');
      expect(response.body.ratePlan).toHaveProperty('priceModifierValue', -25);
    });

    test('should toggle rate plan status', async () => {
      const response = await request(app)
        .patch(`/api/rate-plans/${ratePlanId}/toggle-status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ isActive: false })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Rate plan deactivated successfully');
      expect(response.body.ratePlan).toHaveProperty('isActive', false);

      // Toggle back to active
      await request(app)
        .patch(`/api/rate-plans/${ratePlanId}/toggle-status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ isActive: true })
        .expect(200);
    });

    test('should get rate plan statistics', async () => {
      const response = await request(app)
        .get(`/api/rate-plans/${ratePlanId}/stats`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Rate plan statistics retrieved successfully');
      expect(response.body.stats).toHaveProperty('ratePlan');
      expect(response.body.stats).toHaveProperty('usage');
      expect(response.body.stats).toHaveProperty('configuration');
      expect(response.body.stats).toHaveProperty('restrictions');
    });

    test('should delete rate plan successfully', async () => {
      // Create a test rate plan to delete
      const testRatePlan = await request(app)
        .post(`/api/properties/${propertyId}/rate-plans`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Delete Test Plan',
          priceModifierType: ModifierType.Percentage,
          priceModifierValue: -10,
          priority: 99
        });

      const deleteResponse = await request(app)
        .delete(`/api/properties/${propertyId}/rate-plans/${testRatePlan.body.ratePlan.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(['hard', 'soft'].includes(deleteResponse.body.type)).toBe(true);
      expect(deleteResponse.body).toHaveProperty('message');
    });
  });

  describe('Booking Options Calculation', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    test('should calculate booking options for full-day booking', async () => {
      const bookingData = {
        checkInDate: tomorrow.toISOString().split('T')[0],
        checkOutDate: dayAfterTomorrow.toISOString().split('T')[0],
        isHalfDay: false,
        guestCount: 2,
        bookingDate: new Date().toISOString()
      };

      const response = await request(app)
        .post(`/api/properties/${propertyId}/calculate-booking`)
        .send(bookingData)
        .expect(200);

      expect(response.body).toHaveProperty('options');
      expect(response.body).toHaveProperty('basePricing');
      expect(response.body.basePricing).toHaveProperty('total');
      expect(response.body).toHaveProperty('booking');
      expect(response.body.booking).toHaveProperty('nights');
      
      // Note: Without rate plans, options array will be empty
      // This is correct behavior - base pricing is still calculated
      expect(Array.isArray(response.body.options)).toBe(true);
    });

    test('should calculate booking options for half-day booking', async () => {
      const bookingData = {
        checkInDate: tomorrow.toISOString().split('T')[0],
        isHalfDay: true,
        guestCount: 2
      };

      const response = await request(app)
        .post(`/api/properties/${propertyId}/calculate-booking`)
        .send(bookingData)
        .expect(200);

      expect(response.body).toHaveProperty('options');
      expect(response.body).toHaveProperty('booking');
      expect(response.body.booking).toHaveProperty('isHalfDay', true);
      expect(Array.isArray(response.body.options)).toBe(true);
    });

    test('should filter options based on advance booking requirements', async () => {
      // Create a rate plan with 30-day advance booking requirement
      const advanceBookingPlan = await request(app)
        .post(`/api/properties/${propertyId}/rate-plans`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Advance Booking Required',
          priceModifierType: ModifierType.Percentage,
          priceModifierValue: -30,
          minAdvanceBooking: 30,
          priority: 1
        });

      // Try to book for tomorrow (should not include the 30-day advance plan)
      const bookingData = {
        checkInDate: tomorrow.toISOString().split('T')[0],
        checkOutDate: dayAfterTomorrow.toISOString().split('T')[0],
        isHalfDay: false,
        guestCount: 2
      };

      const response = await request(app)
        .post(`/api/properties/${propertyId}/calculate-booking`)
        .send(bookingData)
        .expect(200);

      // The 30-day advance plan should not be in the options
      const hasAdvancePlan = response.body.options.some((option: any) => 
        option.ratePlan.name === 'Advance Booking Required'
      );
      expect(hasAdvancePlan).toBe(false);

      // Clean up
      await request(app)
        .delete(`/api/properties/${propertyId}/rate-plans/${advanceBookingPlan.body.ratePlan.id}`)
        .set('Authorization', `Bearer ${authToken}`);
    });

    test('should handle guest count restrictions', async () => {
      // Create a rate plan with guest restrictions
      const guestRestrictedPlan = await request(app)
        .post(`/api/properties/${propertyId}/rate-plans`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Small Group Only',
          priceModifierType: ModifierType.FixedAmount,
          priceModifierValue: -50,
          maxGuests: 2,
          priority: 1
        });

      // Test with 4 guests (should not include the max-2 plan)
      const bookingData = {
        checkInDate: tomorrow.toISOString().split('T')[0],
        checkOutDate: dayAfterTomorrow.toISOString().split('T')[0],
        isHalfDay: false,
        guestCount: 4
      };

      const response = await request(app)
        .post(`/api/properties/${propertyId}/calculate-booking`)
        .send(bookingData)
        .expect(200);

      const hasRestrictedPlan = response.body.options.some((option: any) => 
        option.ratePlan.name === 'Small Group Only'
      );
      expect(hasRestrictedPlan).toBe(false);

      // Test with 2 guests (should include the plan)
      const bookingData2 = {
        ...bookingData,
        guestCount: 2
      };

      const response2 = await request(app)
        .post(`/api/properties/${propertyId}/calculate-booking`)
        .send(bookingData2)
        .expect(200);

      const hasRestrictedPlan2 = response2.body.options.some((option: any) => 
        option.ratePlan.name === 'Small Group Only'
      );
      expect(hasRestrictedPlan2).toBe(true);

      // Clean up
      await request(app)
        .delete(`/api/properties/${propertyId}/rate-plans/${guestRestrictedPlan.body.ratePlan.id}`)
        .set('Authorization', `Bearer ${authToken}`);
    });

    test('should return no options when property has no base pricing', async () => {
      // Create a new property without pricing
      const propertyService = await import('../services/property.service');
      const newProperty = await propertyService.default.createProperty({
        name: 'No Pricing Property',
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
        aboutTheProperty: 'Test property without pricing',
        aboutTheNeighborhood: 'Test neighborhood',
        firstDateGuestCanCheckIn: tomorrow.toISOString().split('T')[0],
      }, userId);
      const newPropertyId = newProperty.propertyId;
      
      // Update property status to Live so it can be used for booking calculations
      await prisma.property.update({
        where: { propertyId: newPropertyId },
        data: { status: 'Live' }
      });
      
      const bookingData = {
        checkInDate: tomorrow.toISOString().split('T')[0],
        checkOutDate: dayAfterTomorrow.toISOString().split('T')[0],
        isHalfDay: false,
        guestCount: 2
      };

      const response = await request(app)
        .post(`/api/properties/${newPropertyId}/calculate-booking`)
        .send(bookingData)
        .expect(200);

      expect(response.body.options).toHaveLength(0);
      expect(response.body.message).toContain('No booking options available');
    });
  });

  describe('Validation and Error Handling', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    test('should reject rate plan without required fields', async () => {
      await request(app)
        .post(`/api/properties/${propertyId}/rate-plans`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Incomplete Plan'
          // Missing priceModifierType and priceModifierValue
        })
        .expect(400);
    });

    test('should reject invalid modifier type', async () => {
      await request(app)
        .post(`/api/properties/${propertyId}/rate-plans`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Invalid Modifier',
          priceModifierType: 'InvalidType',
          priceModifierValue: 10
        })
        .expect(400);
    });

    test('should reject invalid cancellation policy type', async () => {
      await request(app)
        .post(`/api/properties/${propertyId}/rate-plans`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Invalid Cancellation',
          priceModifierType: ModifierType.Percentage,
          priceModifierValue: -10,
          cancellationPolicy: {
            type: 'InvalidType'
          }
        })
        .expect(400);
    });

    test('should reject booking calculation with invalid dates', async () => {
      await request(app)
        .post(`/api/properties/${propertyId}/calculate-booking`)
        .send({
          checkInDate: 'invalid-date',
          checkOutDate: tomorrow.toISOString().split('T')[0],
          guestCount: 2
        })
        .expect(400);
    });

    test('should reject booking with check-in after check-out', async () => {
      await request(app)
        .post(`/api/properties/${propertyId}/calculate-booking`)
        .send({
          checkInDate: dayAfterTomorrow.toISOString().split('T')[0],
          checkOutDate: tomorrow.toISOString().split('T')[0],
          guestCount: 2
        })
        .expect(400);
    });

    test('should reject booking with past check-in date', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await request(app)
        .post(`/api/properties/${propertyId}/calculate-booking`)
        .send({
          checkInDate: yesterday.toISOString().split('T')[0],
          checkOutDate: tomorrow.toISOString().split('T')[0],
          guestCount: 2
        })
        .expect(400);
    });

    test('should reject booking with invalid guest count', async () => {
      await request(app)
        .post(`/api/properties/${propertyId}/calculate-booking`)
        .send({
          checkInDate: tomorrow.toISOString().split('T')[0],
          checkOutDate: dayAfterTomorrow.toISOString().split('T')[0],
          guestCount: 0
        })
        .expect(400);

      await request(app)
        .post(`/api/properties/${propertyId}/calculate-booking`)
        .send({
          checkInDate: tomorrow.toISOString().split('T')[0],
          checkOutDate: dayAfterTomorrow.toISOString().split('T')[0],
          guestCount: 25
        })
        .expect(400);
    });

    test('should reject missing checkOutDate for full-day booking', async () => {
      await request(app)
        .post(`/api/properties/${propertyId}/calculate-booking`)
        .send({
          checkInDate: tomorrow.toISOString().split('T')[0],
          isHalfDay: false,
          guestCount: 2
        })
        .expect(400);
    });

    test('should reject unauthorized requests', async () => {
      await request(app)
        .post(`/api/properties/${propertyId}/rate-plans`)
        .send({
          name: 'Unauthorized',
          priceModifierType: ModifierType.Percentage,
          priceModifierValue: -10
        })
        .expect(401);
    });

    test('should reject access to non-existent property', async () => {
      const nonExistentId = 'non-existent-property-id';

      await request(app)
        .get(`/api/properties/${nonExistentId}/rate-plans`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    test('should reject access to other user\'s property', async () => {
      // Create another test user
      const hashedPassword = await hashPassword('Test@123');
      const timestamp = Date.now();
      const otherUser = await prisma.user.create({
        data: {
          username: `otherrateplanuser_${timestamp}`,
          email: `other.rateplan_${timestamp}@example.com`,
          password: hashedPassword,
          role: 'HomeOwner',
          isAdmin: false,
        },
      });
      
      const otherUserToken = generateToken(otherUser);

      await request(app)
        .get(`/api/properties/${propertyId}/rate-plans`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(404);
    });
  });

  describe('Rate Plan Service Unit Tests', () => {
    test('should validate rate plan data correctly', async () => {
      const validData = {
        name: 'Service Test Plan',
        priceModifierType: ModifierType.Percentage,
        priceModifierValue: -15,
        description: 'Test plan for service validation'
      };

      await expect(
        ratePlanService.createRatePlan(propertyId, userId, validData)
      ).resolves.toBeDefined();
    });

    test('should reject invalid modifier values', async () => {
      const invalidData = {
        name: 'Invalid Plan',
        priceModifierType: ModifierType.Percentage,
        priceModifierValue: -150, // Invalid percentage
        description: 'This should fail'
      };

      await expect(
        ratePlanService.createRatePlan(propertyId, userId, invalidData)
      ).rejects.toThrow();
    });

    test('should calculate booking options correctly', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

      const criteria = {
        propertyId,
        checkInDate: tomorrow,
        checkOutDate: dayAfterTomorrow,
        isHalfDay: false,
        guestCount: 2,
        bookingDate: new Date()
      };

      const result = await ratePlanService.calculateBookingOptions(criteria);
      
      expect(result).toHaveProperty('options');
      expect(result).toHaveProperty('basePricing');
      expect(result).toHaveProperty('booking');
      expect(result).toHaveProperty('property');
      expect(Array.isArray(result.options)).toBe(true);
      expect(result.basePricing).toHaveProperty('total');
      expect(result.basePricing).toHaveProperty('breakdown');
    });

    test('should handle non-existent property gracefully', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

      const criteria = {
        propertyId: 'non-existent-id',
        checkInDate: tomorrow,
        checkOutDate: dayAfterTomorrow,
        isHalfDay: false,
        guestCount: 2,
        bookingDate: new Date()
      };

      await expect(
        ratePlanService.calculateBookingOptions(criteria)
      ).rejects.toThrow('not found');
    });
  });

  describe('Metadata Endpoints', () => {
    test('should get modifier types metadata', async () => {
      const response = await request(app)
        .get('/api/rate-plans/metadata/modifier-types')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Rate plan metadata retrieved successfully');
      expect(response.body.metadata).toHaveProperty('modifierTypes');
      expect(response.body.metadata).toHaveProperty('cancellationTypes');
      expect(response.body.metadata).toHaveProperty('restrictionRanges');
      
      const modifierTypes = response.body.metadata.modifierTypes;
      expect(modifierTypes).toHaveLength(2);
      expect(modifierTypes.find((mt: any) => mt.value === 'Percentage')).toBeDefined();
      expect(modifierTypes.find((mt: any) => mt.value === 'FixedAmount')).toBeDefined();
    });
  });
});