// @ts-ignore
import request from 'supertest';
import app from '../app';
import prisma from '../config/database';
import { hashPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { describe, it, beforeAll, afterAll, expect } from '@jest/globals';

describe('Property API Tests', () => {
  let authToken: string;
  let userId: string;
  let propertyId: string;

  beforeAll(async () => {
    // Clean up in correct order to handle foreign key constraints
    await prisma.pricePerGroupSize.deleteMany();
    await prisma.promotion.deleteMany();
    await prisma.pricing.deleteMany();
    await prisma.cancellation.deleteMany();
    await prisma.checkInOutTimes.deleteMany();
    await prisma.bed.deleteMany();
    await prisma.room.deleteMany();
    await prisma.amenity.deleteMany();
    await prisma.photo.deleteMany();
    await prisma.property.deleteMany();
    await prisma.latLong.deleteMany();
    await prisma.address.deleteMany();
    await prisma.user.deleteMany();
    
    const hashedPassword = await hashPassword('Test@123');
    const user = await prisma.user.create({
      data: {
        username: 'propertyowner',
        email: 'owner@example.com',
        password: hashedPassword,
        role: 'HOMEOWNER',
      },
    });
    
    userId = user.id;
    authToken = generateToken(user);
  });

  afterAll(async () => {
    // Clean up in correct order to handle foreign key constraints
    await prisma.pricePerGroupSize.deleteMany();
    await prisma.promotion.deleteMany();
    await prisma.pricing.deleteMany();
    await prisma.cancellation.deleteMany();
    await prisma.checkInOutTimes.deleteMany();
    await prisma.bed.deleteMany();
    await prisma.room.deleteMany();
    await prisma.amenity.deleteMany();
    await prisma.photo.deleteMany();
    await prisma.property.deleteMany();
    await prisma.latLong.deleteMany();
    await prisma.address.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('POST /api/properties', () => {
    it('should create a new property successfully', async () => {
      const propertyData = {
        name: 'Test Villa',
        address: {
          apartmentOrFloorNumber: '10A',
          countryOrRegion: 'UAE',
          city: 'Dubai',
          zipCode: 54321,
          latLong: {
            latitude: 25.0657,
            longitude: 55.1713,
          },
        },
        layout: {
          maximumGuest: 6,
          bathrooms: 2,
          allowChildren: true,
          offerCribs: false,
          propertySizeSqMtr: 150,
          rooms: [
            {
              spaceName: 'Master Bedroom',
              beds: [
                {
                  typeOfBed: 'KingBed',
                  numberOfBed: 1,
                },
              ],
            },
          ],
        },
        amenities: [
          {
            name: 'WiFi',
            category: 'Technology',
          },
          {
            name: 'Pool',
            category: 'Outdoor',
          },
        ],
        services: {
          serveBreakfast: true,
          parking: 'YesFree',
          languages: ['English', 'Arabic'],
        },
        rules: {
          smokingAllowed: false,
          partiesOrEventsAllowed: false,
          petsAllowed: 'No',
          checkInCheckout: {
            checkInFrom: '14:00',
            checkInUntil: '22:00',
            checkOutFrom: '08:00',
            checkOutUntil: '12:00',
          },
        },
        photos: [
          {
            url: 'https://example.com/photo1.jpg',
            altText: 'Villa front',
            description: 'Front view of the villa',
            tags: ['exterior', 'front'],
          },
        ],
        bookingType: 'BookInstantly',
        paymentType: 'Online',
        pricing: {
          currency: 'AED',
          ratePerNight: 1000,
          ratePerNightWeekend: 1200,
          discountPercentageForNonRefundableRatePlan: 10,
          discountPercentageForWeeklyRatePlan: 15,
        },
        cancellation: {
          daysBeforeArrivalFreeToCancel: 7,
          waiveCancellationFeeAccidentalBookings: true,
        },
        aboutTheProperty: 'A beautiful test villa',
        aboutTheNeighborhood: 'Quiet neighborhood',
        firstDateGuestCanCheckIn: '2024-01-01',
      };

      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send(propertyData)
        .expect(201);

      expect(response.body).toHaveProperty('property');
      expect(response.body.message).toBe('Property created successfully');
      expect(response.body.property.name).toBe('Test Villa');
      expect(response.body.property.address.city).toBe('Dubai');
      expect(response.body.property.rooms).toHaveLength(1);
      expect(response.body.property.amenities).toHaveLength(2);
      
      propertyId = response.body.property.propertyId;
    });

    it('should reject property creation without authentication', async () => {
      const propertyData = {
        name: 'Test Villa',
        address: {
          countryOrRegion: 'UAE',
          city: 'Dubai',
          zipCode: 54321,
        },
        layout: {
          maximumGuest: 6,
          bathrooms: 2,
          allowChildren: true,
          offerCribs: false,
        },
        services: {
          serveBreakfast: true,
          parking: 'YesFree',
          languages: ['English'],
        },
        rules: {
          smokingAllowed: false,
          partiesOrEventsAllowed: false,
          petsAllowed: 'No',
        },
        bookingType: 'BookInstantly',
        paymentType: 'Online',
        aboutTheProperty: 'Test property',
        aboutTheNeighborhood: 'Test neighborhood',
        firstDateGuestCanCheckIn: '2024-01-01',
      };

      const response = await request(app)
        .post('/api/properties')
        .send(propertyData)
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });

    it('should reject property creation with missing required fields', async () => {
      const incompleteData = {
        name: 'Test Villa',
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteData)
        .expect(400);

      expect(response.body.error).toContain('Required fields');
    });

    it('should reject property creation with invalid booking type', async () => {
      const propertyData = {
        name: 'Test Villa',
        address: {
          countryOrRegion: 'UAE',
          city: 'Dubai',
          zipCode: 54321,
        },
        layout: {
          maximumGuest: 6,
          bathrooms: 2,
          allowChildren: true,
          offerCribs: false,
        },
        bookingType: 'InvalidType',
        paymentType: 'Online',
        firstDateGuestCanCheckIn: '2024-01-01',
      };

      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send(propertyData)
        .expect(400);

      expect(response.body.error).toContain('Invalid bookingType');
    });

    it('should reject property creation with invalid payment type', async () => {
      const propertyData = {
        name: 'Test Villa',
        address: {
          countryOrRegion: 'UAE',
          city: 'Dubai',
          zipCode: 54321,
        },
        layout: {
          maximumGuest: 6,
          bathrooms: 2,
          allowChildren: true,
          offerCribs: false,
        },
        bookingType: 'BookInstantly',
        paymentType: 'InvalidPayment',
        firstDateGuestCanCheckIn: '2024-01-01',
      };

      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send(propertyData)
        .expect(400);

      expect(response.body.error).toContain('Invalid paymentType');
    });
  });

  describe('GET /api/properties/:propertyId', () => {
    it('should retrieve a property by ID', async () => {
      const response = await request(app)
        .get(`/api/properties/${propertyId}`)
        .expect(200);

      expect(response.body).toHaveProperty('property');
      expect(response.body.property.propertyId).toBe(propertyId);
      expect(response.body.property.name).toBe('Test Villa');
    });

    it('should return 404 for non-existent property', async () => {
      const fakeId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
      
      const response = await request(app)
        .get(`/api/properties/${fakeId}`)
        .expect(404);

      expect(response.body.error).toBe('Property not found');
    });
  });

  describe('PUT /api/properties/:propertyId', () => {
    it('should update property basic information', async () => {
      const updateData = {
        name: 'Updated Villa Name',
        aboutTheProperty: 'Updated description of the villa',
        aboutTheNeighborhood: 'Updated neighborhood description',
      };

      const response = await request(app)
        .put(`/api/properties/${propertyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Property updated successfully');
      expect(response.body.property.name).toBe('Updated Villa Name');
      expect(response.body.property.aboutTheProperty).toBe('Updated description of the villa');
    });

    it('should reject update without authentication', async () => {
      const updateData = {
        name: 'Updated Villa Name',
      };

      const response = await request(app)
        .put(`/api/properties/${propertyId}`)
        .send(updateData)
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });

    it('should reject update from non-owner', async () => {
      const otherUser = await prisma.user.create({
        data: {
          username: 'otheruser',
          email: 'other@example.com',
          password: await hashPassword('Test@123'),
          role: 'HOMEOWNER',
        },
      });
      
      const otherToken = generateToken(otherUser);

      const updateData = {
        name: 'Unauthorized Update',
      };

      const response = await request(app)
        .put(`/api/properties/${propertyId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.error).toBe('Property not found or you do not have permission to update it');

      await prisma.user.delete({ where: { id: otherUser.id } });
    });
  });

  describe('PUT /api/properties/:propertyId/layout', () => {
    it('should update property layout', async () => {
      const layoutUpdate = {
        maximumGuest: 8,
        bathrooms: 3,
        allowChildren: true,
        offerCribs: true,
        propertySizeSqMtr: 200,
        rooms: [
          {
            spaceName: 'Master Suite',
            beds: [
              {
                typeOfBed: 'KingBed',
                numberOfBed: 1,
              },
            ],
          },
          {
            spaceName: 'Guest Room',
            beds: [
              {
                typeOfBed: 'TwinBed',
                numberOfBed: 2,
              },
            ],
          },
        ],
      };

      const response = await request(app)
        .put(`/api/properties/${propertyId}/layout`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(layoutUpdate)
        .expect(200);

      expect(response.body.message).toBe('Property layout updated successfully');
      expect(response.body.property.maximumGuest).toBe(8);
      expect(response.body.property.rooms).toHaveLength(2);
    });

    it('should reject layout update with invalid data', async () => {
      const invalidLayout = {
        maximumGuest: 'not a number',
        bathrooms: 3,
        allowChildren: true,
        offerCribs: true,
      };

      const response = await request(app)
        .put(`/api/properties/${propertyId}/layout`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidLayout)
        .expect(400);

      expect(response.body.error).toContain('maximumGuest and bathrooms must be numbers');
    });
  });

  describe('PUT /api/properties/:propertyId/amenities', () => {
    it('should update property amenities', async () => {
      const amenitiesUpdate = {
        amenities: [
          {
            name: 'High-Speed WiFi',
            category: 'Technology',
          },
          {
            name: 'Swimming Pool',
            category: 'Outdoor',
          },
          {
            name: 'Gym',
            category: 'Fitness',
          },
        ],
      };

      const response = await request(app)
        .put(`/api/properties/${propertyId}/amenities`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(amenitiesUpdate)
        .expect(200);

      expect(response.body.message).toBe('Property amenities updated successfully');
      expect(response.body.property.amenities).toHaveLength(3);
    });

    it('should reject amenities update with invalid format', async () => {
      const invalidAmenities = {
        amenities: 'not an array',
      };

      const response = await request(app)
        .put(`/api/properties/${propertyId}/amenities`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidAmenities)
        .expect(400);

      expect(response.body.error).toBe('Amenities must be an array');
    });

    it('should reject amenities with missing fields', async () => {
      const invalidAmenities = {
        amenities: [
          {
            name: 'WiFi',
            // Missing category
          },
        ],
      };

      const response = await request(app)
        .put(`/api/properties/${propertyId}/amenities`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidAmenities)
        .expect(400);

      expect(response.body.error).toBe('Each amenity must have a name and category');
    });
  });

  describe('PUT /api/properties/:propertyId/services', () => {
    it('should update property services', async () => {
      const servicesUpdate = {
        serveBreakfast: false,
        parking: 'YesPaid',
        languages: ['English', 'Arabic', 'French'],
      };

      const response = await request(app)
        .put(`/api/properties/${propertyId}/services`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(servicesUpdate)
        .expect(200);

      expect(response.body.message).toBe('Property services updated successfully');
      expect(response.body.property.serveBreakfast).toBe(false);
      expect(response.body.property.parking).toBe('YesPaid');
    });

    it('should reject services update with invalid parking type', async () => {
      const invalidServices = {
        serveBreakfast: true,
        parking: 'InvalidParking',
        languages: ['English'],
      };

      const response = await request(app)
        .put(`/api/properties/${propertyId}/services`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidServices)
        .expect(400);

      expect(response.body.error).toContain('Invalid parking type');
    });
  });

  describe('PUT /api/properties/:propertyId/rules', () => {
    it('should update property rules', async () => {
      const rulesUpdate = {
        smokingAllowed: true,
        partiesOrEventsAllowed: false,
        petsAllowed: 'UponRequest',
        checkInCheckout: {
          checkInFrom: '15:00',
          checkInUntil: '23:00',
          checkOutFrom: '07:00',
          checkOutUntil: '11:00',
        },
      };

      const response = await request(app)
        .put(`/api/properties/${propertyId}/rules`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(rulesUpdate)
        .expect(200);

      expect(response.body.message).toBe('Property rules updated successfully');
      expect(response.body.property.smokingAllowed).toBe(true);
      expect(response.body.property.petsAllowed).toBe('UponRequest');
    });

    it('should reject rules update with invalid pet policy', async () => {
      const invalidRules = {
        smokingAllowed: false,
        partiesOrEventsAllowed: false,
        petsAllowed: 'InvalidPolicy',
      };

      const response = await request(app)
        .put(`/api/properties/${propertyId}/rules`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidRules)
        .expect(400);

      expect(response.body.error).toContain('Invalid petsAllowed value');
    });
  });

  describe('PUT /api/properties/:propertyId/pricing', () => {
    it('should update property pricing', async () => {
      const pricingUpdate = {
        currency: 'AED',
        ratePerNight: 1500,
        ratePerNightWeekend: 2000,
        discountPercentageForNonRefundableRatePlan: 20,
        discountPercentageForWeeklyRatePlan: 25,
        promotion: {
          type: 'Early Bird',
          percentage: 15,
          description: 'Book 60 days in advance',
        },
      };

      const response = await request(app)
        .put(`/api/properties/${propertyId}/pricing`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(pricingUpdate)
        .expect(200);

      expect(response.body.message).toBe('Property pricing updated successfully');
      expect(response.body.property.pricing.ratePerNight).toBe(1500);
      expect(response.body.property.pricing.promotion.percentage).toBe(15);
    });

    it('should reject pricing update with invalid currency', async () => {
      const invalidPricing = {
        currency: 'USD',
        ratePerNight: 1500,
        ratePerNightWeekend: 2000,
      };

      const response = await request(app)
        .put(`/api/properties/${propertyId}/pricing`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPricing)
        .expect(400);

      expect(response.body.error).toBe('Currency must be AED');
    });

    it('should reject pricing update with negative rates', async () => {
      const invalidPricing = {
        currency: 'AED',
        ratePerNight: -100,
        ratePerNightWeekend: 2000,
      };

      const response = await request(app)
        .put(`/api/properties/${propertyId}/pricing`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPricing)
        .expect(400);

      expect(response.body.error).toBe('ratePerNight must be a positive number');
    });
  });

  describe('PUT /api/properties/:propertyId/cancellation', () => {
    it('should update property cancellation policy', async () => {
      const cancellationUpdate = {
        daysBeforeArrivalFreeToCancel: 14,
        waiveCancellationFeeAccidentalBookings: false,
      };

      const response = await request(app)
        .put(`/api/properties/${propertyId}/cancellation`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(cancellationUpdate)
        .expect(200);

      expect(response.body.message).toBe('Property cancellation policy updated successfully');
      expect(response.body.property.cancellation.daysBeforeArrivalFreeToCancel).toBe(14);
    });

    it('should reject cancellation update with negative days', async () => {
      const invalidCancellation = {
        daysBeforeArrivalFreeToCancel: -5,
        waiveCancellationFeeAccidentalBookings: true,
      };

      const response = await request(app)
        .put(`/api/properties/${propertyId}/cancellation`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidCancellation)
        .expect(400);

      expect(response.body.error).toBe('daysBeforeArrivalFreeToCancel must be a non-negative number');
    });
  });

  describe('GET /api/properties/my-properties', () => {
    it('should retrieve all properties for authenticated owner', async () => {
      const response = await request(app)
        .get('/api/properties/my-properties')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('properties');
      expect(Array.isArray(response.body.properties)).toBe(true);
      expect(response.body.properties.length).toBeGreaterThan(0);
      expect(response.body.properties[0].ownerId).toBe(userId);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/properties/my-properties')
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });

    it('should return empty array for owner with no properties', async () => {
      const newUser = await prisma.user.create({
        data: {
          username: 'newowner',
          email: 'newowner@example.com',
          password: await hashPassword('Test@123'),
          role: 'HOMEOWNER',
        },
      });
      
      const newToken = generateToken(newUser);

      const response = await request(app)
        .get('/api/properties/my-properties')
        .set('Authorization', `Bearer ${newToken}`)
        .expect(200);

      expect(response.body.properties).toEqual([]);

      await prisma.user.delete({ where: { id: newUser.id } });
    });
  });

  describe('DELETE /api/properties/:propertyId', () => {
    it('should delete property successfully', async () => {
      // Create a new property to delete
      const newPropertyData = {
        name: 'Property to Delete',
        address: {
          countryOrRegion: 'UAE',
          city: 'Abu Dhabi',
          zipCode: 98765,
        },
        layout: {
          maximumGuest: 4,
          bathrooms: 1,
          allowChildren: false,
          offerCribs: false,
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
        bookingType: 'NeedToRequestBook',
        paymentType: 'ByCreditCardAtProperty',
        aboutTheProperty: 'Test property for deletion',
        aboutTheNeighborhood: 'Test neighborhood',
        firstDateGuestCanCheckIn: '2024-02-01',
      };

      const createResponse = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPropertyData);

      const deletePropertyId = createResponse.body.property.propertyId;

      const response = await request(app)
        .delete(`/api/properties/${deletePropertyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Property deleted successfully');

      // Verify property is deleted
      const getResponse = await request(app)
        .get(`/api/properties/${deletePropertyId}`)
        .expect(404);

      expect(getResponse.body.error).toBe('Property not found');
    });

    it('should reject deletion without authentication', async () => {
      const response = await request(app)
        .delete(`/api/properties/${propertyId}`)
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });

    it('should reject deletion from non-owner', async () => {
      const otherUser = await prisma.user.create({
        data: {
          username: 'anotheruser',
          email: 'another@example.com',
          password: await hashPassword('Test@123'),
          role: 'HOMEOWNER',
        },
      });
      
      const otherToken = generateToken(otherUser);

      const response = await request(app)
        .delete(`/api/properties/${propertyId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);

      expect(response.body.error).toBe('Property not found or you do not have permission to delete it');

      await prisma.user.delete({ where: { id: otherUser.id } });
    });

    it('should return 404 for non-existent property', async () => {
      const fakeId = 'ffffffff-eeee-dddd-cccc-bbbbbbbbbbbb';
      
      const response = await request(app)
        .delete(`/api/properties/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toBe('Property not found or you do not have permission to delete it');
    });
  });
});