// @ts-ignore
import request from 'supertest';
import app from '../app';
import prisma from '../config/database';
import { hashPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { describe, it, beforeAll, expect } from '@jest/globals';
import { cleanupDatabase } from './setup';

describe('Property API Tests', () => {
  let authToken: string;
  let userId: string;

  const createTestProperty = async () => {
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
      firstDateGuestCanCheckIn: new Date('2024-01-01').toISOString(),
    };

    const response = await request(app)
      .post('/api/properties')
      .set('Authorization', `Bearer ${authToken}`)
      .send(propertyData)
      .expect(201);

    // Ensure the property was created with the correct owner
    expect(response.body.property.ownerId).toBe(userId);
    return response.body.property.propertyId;
  };

  beforeAll(async () => {
    await cleanupDatabase();
    
    // Create one user for all tests in this suite
    const hashedPassword = await hashPassword('Test@123');
    const timestamp = Date.now();
    const user = await prisma.user.create({
      data: {
        username: `propertyowner_${timestamp}`,
        email: `owner_${timestamp}@example.com`,
        password: hashedPassword,
        role: 'HomeOwner',
        isAdmin: false,
      },
    });
    
    userId = user.id;
    authToken = generateToken(user);
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
        firstDateGuestCanCheckIn: new Date('2024-01-01').toISOString(),
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
        firstDateGuestCanCheckIn: new Date('2024-01-01').toISOString(),
      };

      const response = await request(app)
        .post('/api/properties')
        .send(propertyData)
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });

    it('should create a property without photos', async () => {
      const propertyData = {
        name: 'Test Villa Without Photos',
        address: {
          apartmentOrFloorNumber: '5B',
          countryOrRegion: 'UAE',
          city: 'Abu Dhabi',
          zipCode: 12345,
        },
        layout: {
          maximumGuest: 4,
          bathrooms: 2,
          allowChildren: true,
          offerCribs: true,
          propertySizeSqMtr: 120,
          rooms: [
            {
              spaceName: 'Bedroom 1',
              beds: [
                {
                  typeOfBed: 'QueenBed',
                  numberOfBed: 1,
                },
              ],
            },
          ],
        },
        amenities: [
          {
            name: 'AC',
            category: 'Essential',
          },
        ],
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
        // Explicitly not including photos field
        bookingType: 'BookInstantly',
        paymentType: 'Online',
        pricing: {
          currency: 'AED',
          ratePerNight: 800,
        },
        aboutTheProperty: 'A villa without photos',
        aboutTheNeighborhood: 'Nice area',
        firstDateGuestCanCheckIn: new Date('2024-01-01').toISOString(),
      };

      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send(propertyData)
        .expect(201);

      expect(response.body.message).toBe('Property created successfully');
      expect(response.body.property).toBeDefined();
      expect(response.body.property.name).toBe('Test Villa Without Photos');
      expect(response.body.property.photos).toEqual([]);
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
        firstDateGuestCanCheckIn: new Date('2024-01-01').toISOString(),
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
        firstDateGuestCanCheckIn: new Date('2024-01-01').toISOString(),
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
      const testPropertyId = await createTestProperty();
      
      const response = await request(app)
        .get(`/api/properties/${testPropertyId}`)
        .expect(200);

      expect(response.body).toHaveProperty('property');
      expect(response.body.property.propertyId).toBe(testPropertyId);
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
      const testPropertyId = await createTestProperty();
      
      const updateData = {
        name: 'Updated Villa Name',
        aboutTheProperty: 'Updated description of the villa',
        aboutTheNeighborhood: 'Updated neighborhood description',
      };

      const response = await request(app)
        .put(`/api/properties/${testPropertyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Property updated successfully');
      expect(response.body.property.name).toBe('Updated Villa Name');
      expect(response.body.property.aboutTheProperty).toBe('Updated description of the villa');
    });

    it('should reject update without authentication', async () => {
      const testPropertyId = await createTestProperty();
      
      const updateData = {
        name: 'Updated Villa Name',
      };

      const response = await request(app)
        .put(`/api/properties/${testPropertyId}`)
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
          role: 'HomeOwner',
          isAdmin: false,
        },
      });
      
      const otherToken = generateToken(otherUser);

      const updateData = {
        name: 'Unauthorized Update',
      };

      const testPropertyId = await createTestProperty();
      
      const response = await request(app)
        .put(`/api/properties/${testPropertyId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.error).toBe('Property not found or you do not have permission to update it');
    });
  });

  describe('PUT /api/properties/:propertyId/layout', () => {
    it('should update property layout', async () => {
      const testPropertyId = await createTestProperty();
      
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
        .put(`/api/properties/${testPropertyId}/layout`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(layoutUpdate)
        .expect(200);

      expect(response.body.message).toBe('Property layout updated successfully');
      expect(response.body.property.maximumGuest).toBe(8);
      expect(response.body.property.rooms).toHaveLength(2);
    });

    it('should reject layout update with invalid data', async () => {
      const testPropertyId = await createTestProperty();
      
      const invalidLayout = {
        maximumGuest: 'not a number',
        bathrooms: 3,
        allowChildren: true,
        offerCribs: true,
      };

      const response = await request(app)
        .put(`/api/properties/${testPropertyId}/layout`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidLayout)
        .expect(400);

      expect(response.body.error).toContain('maximumGuest and bathrooms must be numbers');
    });
  });

  describe('PUT /api/properties/:propertyId/amenities', () => {
    it('should update property amenities', async () => {
      const testPropertyId = await createTestProperty();
      
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
        .put(`/api/properties/${testPropertyId}/amenities`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(amenitiesUpdate)
        .expect(200);

      expect(response.body.message).toBe('Property amenities updated successfully');
      expect(response.body.property.amenities).toHaveLength(3);
    });

    it('should reject amenities update with invalid format', async () => {
      const testPropertyId = await createTestProperty();
      
      const invalidAmenities = {
        amenities: 'not an array',
      };

      const response = await request(app)
        .put(`/api/properties/${testPropertyId}/amenities`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidAmenities)
        .expect(400);

      expect(response.body.error).toBe('Amenities must be an array');
    });

    it('should reject amenities with missing fields', async () => {
      const testPropertyId = await createTestProperty();
      
      const invalidAmenities = {
        amenities: [
          {
            name: 'WiFi',
            // Missing category
          },
        ],
      };

      const response = await request(app)
        .put(`/api/properties/${testPropertyId}/amenities`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidAmenities)
        .expect(400);

      expect(response.body.error).toBe('Each amenity must have a name and category');
    });
  });

  describe('PUT /api/properties/:propertyId/services', () => {
    it('should update property services', async () => {
      const testPropertyId = await createTestProperty();
      
      const servicesUpdate = {
        serveBreakfast: false,
        parking: 'YesPaid',
        languages: ['English', 'Arabic', 'French'],
      };

      const response = await request(app)
        .put(`/api/properties/${testPropertyId}/services`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(servicesUpdate)
        .expect(200);

      expect(response.body.message).toBe('Property services updated successfully');
      expect(response.body.property.serveBreakfast).toBe(false);
      expect(response.body.property.parking).toBe('YesPaid');
    });

    it('should reject services update with invalid parking type', async () => {
      const testPropertyId = await createTestProperty();
      
      const invalidServices = {
        serveBreakfast: true,
        parking: 'InvalidParking',
        languages: ['English'],
      };

      const response = await request(app)
        .put(`/api/properties/${testPropertyId}/services`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidServices)
        .expect(400);

      expect(response.body.error).toContain('Invalid parking type');
    });
  });

  describe('PUT /api/properties/:propertyId/rules', () => {
    it('should update property rules', async () => {
      const testPropertyId = await createTestProperty();
      
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
        .put(`/api/properties/${testPropertyId}/rules`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(rulesUpdate)
        .expect(200);

      expect(response.body.message).toBe('Property rules updated successfully');
      expect(response.body.property.smokingAllowed).toBe(true);
      expect(response.body.property.petsAllowed).toBe('UponRequest');
    });

    it('should reject rules update with invalid pet policy', async () => {
      const testPropertyId = await createTestProperty();
      
      const invalidRules = {
        smokingAllowed: false,
        partiesOrEventsAllowed: false,
        petsAllowed: 'InvalidPolicy',
      };

      const response = await request(app)
        .put(`/api/properties/${testPropertyId}/rules`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidRules)
        .expect(400);

      expect(response.body.error).toContain('Invalid petsAllowed value');
    });
  });

  describe('PUT /api/properties/:propertyId/pricing', () => {
    it('should update property pricing', async () => {
      const testPropertyId = await createTestProperty();
      
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
        .put(`/api/properties/${testPropertyId}/pricing`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(pricingUpdate)
        .expect(200);

      expect(response.body.message).toBe('Property pricing updated successfully');
      expect(response.body.property.pricing.ratePerNight).toBe(1500);
      expect(response.body.property.pricing.promotion.percentage).toBe(15);
    });

    it('should reject pricing update with invalid currency', async () => {
      const testPropertyId = await createTestProperty();
      
      const invalidPricing = {
        currency: 'USD',
        ratePerNight: 1500,
        ratePerNightWeekend: 2000,
      };

      const response = await request(app)
        .put(`/api/properties/${testPropertyId}/pricing`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPricing)
        .expect(400);

      expect(response.body.error).toBe('Currency must be AED');
    });

    it('should reject pricing update with negative rates', async () => {
      const testPropertyId = await createTestProperty();
      
      const invalidPricing = {
        currency: 'AED',
        ratePerNight: -100,
        ratePerNightWeekend: 2000,
      };

      const response = await request(app)
        .put(`/api/properties/${testPropertyId}/pricing`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPricing)
        .expect(400);

      expect(response.body.error).toBe('ratePerNight must be a positive number');
    });
  });

  describe('PUT /api/properties/:propertyId/cancellation', () => {
    it('should update property cancellation policy', async () => {
      const testPropertyId = await createTestProperty();
      
      // Verify the property exists and is owned by the current user
      const propertyCheck = await request(app)
        .get(`/api/properties/${testPropertyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(propertyCheck.body.property.ownerId).toBe(userId);
      
      const cancellationUpdate = {
        daysBeforeArrivalFreeToCancel: 14,
        waiveCancellationFeeAccidentalBookings: false,
      };

      const response = await request(app)
        .put(`/api/properties/${testPropertyId}/cancellation`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(cancellationUpdate)
        .expect(200);

      expect(response.body.message).toBe('Property cancellation policy updated successfully');
      expect(response.body.property.cancellation.daysBeforeArrivalFreeToCancel).toBe(14);
    });

    it('should reject cancellation update with negative days', async () => {
      const testPropertyId = await createTestProperty();
      
      const invalidCancellation = {
        daysBeforeArrivalFreeToCancel: -5,
        waiveCancellationFeeAccidentalBookings: true,
      };

      const response = await request(app)
        .put(`/api/properties/${testPropertyId}/cancellation`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidCancellation)
        .expect(400);

      expect(response.body.error).toBe('daysBeforeArrivalFreeToCancel must be a non-negative number');
    });
  });

  describe('GET /api/properties/my-properties', () => {
    it('should retrieve all properties for authenticated owner', async () => {
      // First create a property
      const propertyData = {
        name: 'Test Property for Owner',
        address: {
          countryOrRegion: 'UAE',
          city: 'Dubai',
          zipCode: 12345,
        },
        layout: {
          maximumGuest: 4,
          bathrooms: 2,
          allowChildren: true,
          offerCribs: false,
        },
        services: {
          serveBreakfast: false,
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
        aboutTheNeighborhood: 'Test area',
        firstDateGuestCanCheckIn: new Date('2024-01-01').toISOString(),
      };

      const createResponse = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send(propertyData)
        .expect(201);

      // Verify the property was created successfully
      expect(createResponse.body.property.ownerId).toBe(userId);

      // Add a small delay to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 100));

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
          role: 'HomeOwner',
          isAdmin: false,
        },
      });
      
      const newToken = generateToken(newUser);

      const response = await request(app)
        .get('/api/properties/my-properties')
        .set('Authorization', `Bearer ${newToken}`)
        .expect(200);

      expect(response.body.properties).toEqual([]);
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
      const testPropertyId = await createTestProperty();
      
      const response = await request(app)
        .delete(`/api/properties/${testPropertyId}`)
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });

    it('should reject deletion from non-owner', async () => {
      const testPropertyId = await createTestProperty();
      
      const otherUser = await prisma.user.create({
        data: {
          username: 'anotheruser',
          email: 'another@example.com',
          password: await hashPassword('Test@123'),
          role: 'HomeOwner',
          isAdmin: false,
        },
      });
      
      const otherToken = generateToken(otherUser);

      const response = await request(app)
        .delete(`/api/properties/${testPropertyId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);

      expect(response.body.error).toBe('Property not found or you do not have permission to delete it');
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

  describe('Photo Management', () => {
    describe('POST /api/properties/:propertyId/photos', () => {
      it('should upload property photos successfully', async () => {
        const testPropertyId = await createTestProperty();
        
        // Create a smaller test buffer that represents an image file to avoid size limits
        const testImageBuffer = Buffer.from('PNG');
        
        const response = await request(app)
          .post(`/api/properties/${testPropertyId}/photos`)
          .set('Authorization', `Bearer ${authToken}`)
          .attach('photos', testImageBuffer, 'test.png')
          .expect(201);

        expect(response.body.message).toBe('Photos uploaded successfully');
        expect(response.body).toHaveProperty('photos');
        expect(Array.isArray(response.body.photos)).toBe(true);
        expect(response.body.photos.length).toBeGreaterThan(0);
        expect(response.body.photos[0]).toHaveProperty('id');
        expect(response.body.photos[0]).toHaveProperty('url');
        // Check if URL is either a file path (uploaded) or the test URL from createTestProperty
        expect(
          response.body.photos[0].url.includes('/uploads/photos/') || 
          response.body.photos[0].url === 'https://example.com/photo1.jpg'
        ).toBe(true);
      });

      it('should upload multiple photos at once', async () => {
        const testPropertyId = await createTestProperty();
        
        const testImageBuffer1 = Buffer.from('PNG1');
        const testImageBuffer2 = Buffer.from('PNG2');
        
        const response = await request(app)
          .post(`/api/properties/${testPropertyId}/photos`)
          .set('Authorization', `Bearer ${authToken}`)
          .attach('photos', testImageBuffer1, 'test1.png')
          .attach('photos', testImageBuffer2, 'test2.png')
          .expect(201);

        expect(response.body.photos).toHaveLength(2);
      });

      it('should reject photo upload without authentication', async () => {
        const testPropertyId = await createTestProperty();
        
        const testImageBuffer = Buffer.from('PNG');
        
        const response = await request(app)
          .post(`/api/properties/${testPropertyId}/photos`)
          .attach('photos', testImageBuffer, 'test.png')
          .expect(401);

        expect(response.body.error).toBe('No token provided');
      });

      it('should reject photo upload for non-owned property', async () => {
        const testPropertyId = await createTestProperty();
        
        // Create another user
        const otherUser = await prisma.user.create({
          data: {
            username: 'photouser',
            email: 'photo@example.com',
            password: await hashPassword('Test@123'),
            role: 'HomeOwner',
            isAdmin: false,
          },
        });
        
        const otherToken = generateToken(otherUser);
        const testImageBuffer = Buffer.from('PNG');
        
        const response = await request(app)
          .post(`/api/properties/${testPropertyId}/photos`)
          .set('Authorization', `Bearer ${otherToken}`)
          .attach('photos', testImageBuffer, 'test.png')
          .expect(404);

        expect(response.body.error).toBe('Property not found or you do not have permission to update it');
      });

      it('should reject upload with no files', async () => {
        const testPropertyId = await createTestProperty();
        
        const response = await request(app)
          .post(`/api/properties/${testPropertyId}/photos`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(400);

        expect(response.body.error).toBe('No files uploaded');
      });

      it('should reject invalid file types', async () => {
        const testPropertyId = await createTestProperty();
        
        const testTextBuffer = Buffer.from('this is not an image');
        
        const response = await request(app)
          .post(`/api/properties/${testPropertyId}/photos`)
          .set('Authorization', `Bearer ${authToken}`)
          .attach('photos', testTextBuffer, 'test.txt')
          .expect(500);

        expect(response.body.error).toBe('Something went wrong!');
      });
    });

    describe('DELETE /api/properties/:propertyId/photos/:photoId', () => {
      it('should delete property photo successfully', async () => {
        const testPropertyId = await createTestProperty();
        
        // First upload a photo
        const testImageBuffer = Buffer.from('fake image data');
        const uploadResponse = await request(app)
          .post(`/api/properties/${testPropertyId}/photos`)
          .set('Authorization', `Bearer ${authToken}`)
          .attach('photos', testImageBuffer, 'test-image.png');

        const photoId = uploadResponse.body.photos[0].id;
        
        const response = await request(app)
          .delete(`/api/properties/${testPropertyId}/photos/${photoId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.message).toBe('Photo deleted successfully');
      });

      it('should reject photo deletion without authentication', async () => {
        const testPropertyId = await createTestProperty();
        const fakePhotoId = 'fake-photo-id';
        
        const response = await request(app)
          .delete(`/api/properties/${testPropertyId}/photos/${fakePhotoId}`)
          .expect(401);

        expect(response.body.error).toBe('No token provided');
      });

      it('should reject photo deletion for non-owned property', async () => {
        const testPropertyId = await createTestProperty();
        
        // Upload a photo first
        const testImageBuffer = Buffer.from('fake image data');
        const uploadResponse = await request(app)
          .post(`/api/properties/${testPropertyId}/photos`)
          .set('Authorization', `Bearer ${authToken}`)
          .attach('photos', testImageBuffer, 'test-image.png');

        const photoId = uploadResponse.body.photos[0].id;
        
        // Create another user
        const otherUser = await prisma.user.create({
          data: {
            username: 'photodelete',
            email: 'photodelete@example.com',
            password: await hashPassword('Test@123'),
            role: 'HomeOwner',
            isAdmin: false,
          },
        });
        
        const otherToken = generateToken(otherUser);
        
        const response = await request(app)
          .delete(`/api/properties/${testPropertyId}/photos/${photoId}`)
          .set('Authorization', `Bearer ${otherToken}`)
          .expect(404);

        expect(response.body.error).toBe('Property or photo not found or you do not have permission');
      });

      it('should return 404 for non-existent photo', async () => {
        const testPropertyId = await createTestProperty();
        const fakePhotoId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
        
        const response = await request(app)
          .delete(`/api/properties/${testPropertyId}/photos/${fakePhotoId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);

        expect(response.body.error).toBe('Property or photo not found or you do not have permission');
      });
    });

    describe('PUT /api/properties/:propertyId/photos/:photoId', () => {
      it('should update photo metadata successfully', async () => {
        const testPropertyId = await createTestProperty();
        
        // First upload a photo
        const testImageBuffer = Buffer.from('fake image data');
        const uploadResponse = await request(app)
          .post(`/api/properties/${testPropertyId}/photos`)
          .set('Authorization', `Bearer ${authToken}`)
          .attach('photos', testImageBuffer, 'test-image.png');

        const photoId = uploadResponse.body.photos[0].id;
        
        const updateData = {
          altText: 'Beautiful villa exterior',
          description: 'Front view of the villa in the morning',
          tags: ['exterior', 'morning', 'front-view']
        };
        
        const response = await request(app)
          .put(`/api/properties/${testPropertyId}/photos/${photoId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.message).toBe('Photo updated successfully');
        expect(response.body.photo.altText).toBe('Beautiful villa exterior');
        expect(response.body.photo.description).toBe('Front view of the villa in the morning');
        expect(response.body.photo.tags).toEqual(['exterior', 'morning', 'front-view']);
      });

      it('should reject photo update without authentication', async () => {
        const testPropertyId = await createTestProperty();
        const fakePhotoId = 'fake-photo-id';
        
        const updateData = {
          altText: 'Test alt text'
        };
        
        const response = await request(app)
          .put(`/api/properties/${testPropertyId}/photos/${fakePhotoId}`)
          .send(updateData)
          .expect(401);

        expect(response.body.error).toBe('No token provided');
      });

      it('should reject photo update for non-owned property', async () => {
        const testPropertyId = await createTestProperty();
        
        // Upload a photo first
        const testImageBuffer = Buffer.from('fake image data');
        const uploadResponse = await request(app)
          .post(`/api/properties/${testPropertyId}/photos`)
          .set('Authorization', `Bearer ${authToken}`)
          .attach('photos', testImageBuffer, 'test-image.png');

        const photoId = uploadResponse.body.photos[0].id;
        
        // Create another user
        const otherUser = await prisma.user.create({
          data: {
            username: 'photoupdate',
            email: 'photoupdate@example.com',
            password: await hashPassword('Test@123'),
            role: 'HomeOwner',
            isAdmin: false,
          },
        });
        
        const otherToken = generateToken(otherUser);
        
        const updateData = {
          altText: 'Unauthorized update'
        };
        
        const response = await request(app)
          .put(`/api/properties/${testPropertyId}/photos/${photoId}`)
          .set('Authorization', `Bearer ${otherToken}`)
          .send(updateData)
          .expect(404);

        expect(response.body.error).toBe('Property or photo not found or you do not have permission');
      });

      it('should return 404 for non-existent photo', async () => {
        const testPropertyId = await createTestProperty();
        const fakePhotoId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
        
        const updateData = {
          altText: 'Test alt text'
        };
        
        const response = await request(app)
          .put(`/api/properties/${testPropertyId}/photos/${fakePhotoId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(404);

        expect(response.body.error).toBe('Property or photo not found or you do not have permission');
      });
    });
  });

  describe('Standalone Photo API Tests', () => {
    describe('Photo Upload and Attachment', () => {
      it('should upload photos independently and attach to existing property', async () => {
        // Step 1: Create a property without photos
        const propertyData = {
          name: 'Villa for Photo Attachment Test',
          address: {
            apartmentOrFloorNumber: '7C',
            countryOrRegion: 'UAE',
            city: 'Dubai',
            zipCode: 11111,
          },
          layout: {
            maximumGuest: 4,
            bathrooms: 2,
            allowChildren: true,
            offerCribs: false,
            propertySizeSqMtr: 100,
            rooms: [
              {
                spaceName: 'Bedroom',
                beds: [
                  {
                    typeOfBed: 'QueenBed',
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
          ],
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
          pricing: {
            currency: 'AED',
            ratePerNight: 500,
          },
          aboutTheProperty: 'Property for testing photo attachment',
          aboutTheNeighborhood: 'Test neighborhood',
          firstDateGuestCanCheckIn: new Date('2024-01-01').toISOString(),
        };

        const propertyResponse = await request(app)
          .post('/api/properties')
          .set('Authorization', `Bearer ${authToken}`)
          .send(propertyData)
          .expect(201);

        const propertyId = propertyResponse.body.property.propertyId;
        expect(propertyResponse.body.property.photos).toEqual([]);

        // Step 2: Upload photos independently (without property attachment)
        const testImageBuffer1 = Buffer.from('test image data 1');
        const testImageBuffer2 = Buffer.from('test image data 2');
        
        const photoUploadResponse = await request(app)
          .post('/api/photos/upload')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('photos', testImageBuffer1, 'test-image-1.png')
          .attach('photos', testImageBuffer2, 'test-image-2.png')
          .expect(201);

        expect(photoUploadResponse.body.message).toBe('Photos uploaded successfully');
        expect(photoUploadResponse.body.photos).toHaveLength(2);
        
        const photoIds = photoUploadResponse.body.photos.map((p: any) => p.id);
        
        // Verify photos are not attached to any property
        photoUploadResponse.body.photos.forEach((photo: any) => {
          expect(photo.propertyId).toBeNull();
        });

        // Step 3: Get unattached photos
        const unattachedResponse = await request(app)
          .get('/api/photos/unattached')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(unattachedResponse.body.photos.length).toBeGreaterThanOrEqual(2);
        
        // Step 4: Attach photos to the property
        const attachResponse = await request(app)
          .post(`/api/photos/attach/${propertyId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ photoIds })
          .expect(200);

        expect(attachResponse.body.message).toBe('Photos attached to property successfully');
        expect(attachResponse.body.photos).toHaveLength(2);
        
        // Verify photos are now attached to the property
        attachResponse.body.photos.forEach((photo: any) => {
          expect(photo.propertyId).toBe(propertyId);
        });

        // Step 5: Verify property now has the attached photos
        const propertyWithPhotosResponse = await request(app)
          .get(`/api/properties/${propertyId}`)
          .expect(200);

        expect(propertyWithPhotosResponse.body.property.photos).toHaveLength(2);
        propertyWithPhotosResponse.body.property.photos.forEach((photo: any) => {
          expect(photo.propertyId).toBe(propertyId);
        });

        // Step 6: Verify unattached photos list is updated
        const updatedUnattachedResponse = await request(app)
          .get('/api/photos/unattached')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        const remainingUnattachedIds = updatedUnattachedResponse.body.photos.map((p: any) => p.id);
        photoIds.forEach((id: string) => {
          expect(remainingUnattachedIds).not.toContain(id);
        });
      });

      it('should reject attaching photos that are already attached to another property', async () => {
        // Create first property
        const property1Response = await request(app)
          .post('/api/properties')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: 'First Property',
            address: {
              countryOrRegion: 'UAE',
              city: 'Dubai',
              zipCode: 22222,
            },
            layout: {
              maximumGuest: 2,
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
            bookingType: 'BookInstantly',
            paymentType: 'Online',
            firstDateGuestCanCheckIn: new Date('2024-01-01').toISOString(),
          })
          .expect(201);

        const property1Id = property1Response.body.property.propertyId;

        // Upload and attach photos to first property
        const testImageBuffer = Buffer.from('test image for attachment conflict');
        
        const photoUploadResponse = await request(app)
          .post('/api/photos/upload')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('photos', testImageBuffer, 'conflict-test.png')
          .expect(201);

        const photoId = photoUploadResponse.body.photos[0].id;

        const attachResponse1 = await request(app)
          .post(`/api/photos/attach/${property1Id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ photoIds: [photoId] })
          .expect(200);
        
        expect(attachResponse1.body.photos[0].propertyId).toBe(property1Id);

        // Create second property
        const property2Response = await request(app)
          .post('/api/properties')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: 'Second Property',
            address: {
              countryOrRegion: 'UAE',
              city: 'Abu Dhabi',
              zipCode: 33333,
            },
            layout: {
              maximumGuest: 3,
              bathrooms: 1,
              allowChildren: true,
              offerCribs: true,
            },
            services: {
              serveBreakfast: true,
              parking: 'YesFree',
              languages: ['English', 'Arabic'],
            },
            rules: {
              smokingAllowed: false,
              partiesOrEventsAllowed: false,
              petsAllowed: 'UponRequest',
            },
            bookingType: 'NeedToRequestBook',
            paymentType: 'ByCreditCardAtProperty',
            firstDateGuestCanCheckIn: new Date('2024-02-01').toISOString(),
          })
          .expect(201);

        const property2Id = property2Response.body.property.propertyId;

        // Try to attach the same photo to second property (should fail)
        const attachResponse = await request(app)
          .post(`/api/photos/attach/${property2Id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ photoIds: [photoId] })
          .expect(404);

        expect(attachResponse.body.error).toBe('Some photos not found or already attached to a property');
      });

      it('should reject attaching non-existent photos', async () => {
        // Create a property
        const propertyResponse = await request(app)
          .post('/api/properties')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: 'Property for Invalid Photo Test',
            address: {
              countryOrRegion: 'UAE',
              city: 'Sharjah',
              zipCode: 44444,
            },
            layout: {
              maximumGuest: 2,
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
              smokingAllowed: true,
              partiesOrEventsAllowed: false,
              petsAllowed: 'No',
            },
            bookingType: 'BookInstantly',
            paymentType: 'Online',
            firstDateGuestCanCheckIn: new Date('2024-01-01').toISOString(),
          })
          .expect(201);

        const propertyId = propertyResponse.body.property.propertyId;
        const fakePhotoIds = ['fake-id-1', 'fake-id-2'];

        // Try to attach non-existent photos
        const attachResponse = await request(app)
          .post(`/api/photos/attach/${propertyId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ photoIds: fakePhotoIds })
          .expect(404);

        expect(attachResponse.body.error).toBe('Some photos not found or already attached to a property');
      });

      it('should reject attaching photos to non-owned property', async () => {
        // Create a property as the main user
        const propertyResponse = await request(app)
          .post('/api/properties')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: 'Property Owned by Main User',
            address: {
              countryOrRegion: 'UAE',
              city: 'Ajman',
              zipCode: 55555,
            },
            layout: {
              maximumGuest: 2,
              bathrooms: 1,
              allowChildren: false,
              offerCribs: false,
            },
            services: {
              serveBreakfast: false,
              parking: 'YesPaid',
              languages: ['English'],
            },
            rules: {
              smokingAllowed: false,
              partiesOrEventsAllowed: true,
              petsAllowed: 'Yes',
            },
            bookingType: 'BookInstantly',
            paymentType: 'Online',
            firstDateGuestCanCheckIn: new Date('2024-01-01').toISOString(),
          })
          .expect(201);

        const propertyId = propertyResponse.body.property.propertyId;

        // Create another user
        const otherUser = await prisma.user.create({
          data: {
            username: `photoattach_${Date.now()}`,
            email: `photoattach_${Date.now()}@example.com`,
            password: await hashPassword('Test@123'),
            role: 'HomeOwner',
            isAdmin: false,
          },
        });
        
        const otherToken = generateToken(otherUser);

        // Upload photos as the other user
        const testImageBuffer = Buffer.from('other user image');
        
        const photoUploadResponse = await request(app)
          .post('/api/photos/upload')
          .set('Authorization', `Bearer ${otherToken}`)
          .attach('photos', testImageBuffer, 'other-user.png')
          .expect(201);

        const photoId = photoUploadResponse.body.photos[0].id;

        // Try to attach to property owned by main user (should fail)
        const attachResponse = await request(app)
          .post(`/api/photos/attach/${propertyId}`)
          .set('Authorization', `Bearer ${otherToken}`)
          .send({ photoIds: [photoId] })
          .expect(404);

        expect(attachResponse.body.error).toBe('Property not found or you do not have permission to update it');
      });
    });
  });

  describe('Role Upgrade Tests', () => {
    it('should upgrade Tenant user to HomeOwner when creating first property', async () => {
      // Create a user with Tenant role
      const hashedPassword = await hashPassword('Test@123');
      const timestamp = Date.now();
      const tenantUser = await prisma.user.create({
        data: {
          username: `tenant_${timestamp}`,
          email: `tenant_${timestamp}@example.com`,
          password: hashedPassword,
          role: 'Tenant', // Start as Tenant
          isAdmin: false,
        },
      });
      
      const tenantToken = generateToken(tenantUser);

      // Verify the user starts as Tenant
      expect(tenantUser.role).toBe('Tenant');

      const propertyData = {
        name: 'First Property',
        address: {
          apartmentOrFloorNumber: '1A',
          countryOrRegion: 'UAE',
          city: 'Dubai',
          zipCode: '12345',
          latLong: {
            latitude: 25.0657,
            longitude: 55.1713,
          },
        },
        layout: {
          maximumGuest: 4,
          bathrooms: 2,
          allowChildren: true,
          offerCribs: false,
          propertySizeSqMtr: 120,
          rooms: [
            {
              spaceName: 'Bedroom',
              beds: [
                {
                  typeOfBed: 'QueenBed',
                  numberOfBed: 1,
                },
              ],
            },
          ],
        },
        amenities: [
          {
            name: 'WiFi',
            category: 'Basic',
          },
        ],
        services: {
          serveBreakfast: false,
          parking: 'No',
          languages: ['English'],
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
        photos: [],
        bookingType: 'BookInstantly',
        paymentType: 'Online',
        pricing: {
          currency: 'AED',
          ratePerNight: 500,
          ratePerNightWeekend: 600,
          discountPercentageForNonRefundableRatePlan: 5,
          discountPercentageForWeeklyRatePlan: 10,
        },
        cancellation: {
          daysBeforeArrivalFreeToCancel: 3,
          waiveCancellationFeeAccidentalBookings: true,
        },
        aboutTheProperty: 'A cozy property for testing',
        aboutTheNeighborhood: 'Great test neighborhood',
        firstDateGuestCanCheckIn: new Date('2024-01-01').toISOString(),
      };

      // Create property as Tenant user
      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${tenantToken}`)
        .send(propertyData)
        .expect(201);

      expect(response.body.message).toBe('Property created successfully');
      expect(response.body.property.ownerId).toBe(tenantUser.id);

      // Verify that the user has been upgraded to HomeOwner in the database
      const updatedUser = await prisma.user.findUnique({
        where: { id: tenantUser.id },
        select: { role: true },
      });

      expect(updatedUser?.role).toBe('HomeOwner');
    });

    it('should not change role if user is already HomeOwner', async () => {
      // Use the existing test user (already HomeOwner)
      const originalUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      expect(originalUser?.role).toBe('HomeOwner');

      // Create another property
      const testPropertyId = await createTestProperty();

      // Verify the property was created successfully
      expect(testPropertyId).toBeDefined();

      // Verify that the user role remains HomeOwner
      const userAfterPropertyCreation = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      expect(userAfterPropertyCreation?.role).toBe('HomeOwner');
    });

    it('should upgrade Manager user to HomeOwner when creating property', async () => {
      // Create a user with Manager role
      const hashedPassword = await hashPassword('Test@123');
      const timestamp = Date.now();
      const managerUser = await prisma.user.create({
        data: {
          username: `manager_${timestamp}`,
          email: `manager_${timestamp}@example.com`,
          password: hashedPassword,
          role: 'Manager', // Start as Manager
          isAdmin: false,
        },
      });
      
      const managerToken = generateToken(managerUser);

      // Verify the user starts as Manager
      expect(managerUser.role).toBe('Manager');

      const propertyData = {
        name: 'Manager Property',
        address: {
          apartmentOrFloorNumber: '2B',
          countryOrRegion: 'UAE',
          city: 'Abu Dhabi',
          zipCode: '54321',
          latLong: {
            latitude: 24.4539,
            longitude: 54.3773,
          },
        },
        layout: {
          maximumGuest: 6,
          bathrooms: 3,
          allowChildren: true,
          offerCribs: true,
          propertySizeSqMtr: 180,
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
            name: 'Pool',
            category: 'Features',
          },
        ],
        services: {
          serveBreakfast: true,
          parking: 'YesFree',
          languages: ['English', 'Arabic'],
        },
        rules: {
          smokingAllowed: false,
          partiesOrEventsAllowed: true,
          petsAllowed: 'UponRequest',
          checkInCheckout: {
            checkInFrom: '15:00',
            checkInUntil: '23:00',
            checkOutFrom: '09:00',
            checkOutUntil: '11:00',
          },
        },
        photos: [],
        bookingType: 'NeedToRequestBook',
        paymentType: 'ByCreditCardAtProperty',
        pricing: {
          currency: 'AED',
          ratePerNight: 800,
          ratePerNightWeekend: 1000,
          discountPercentageForNonRefundableRatePlan: 8,
          discountPercentageForWeeklyRatePlan: 15,
        },
        cancellation: {
          daysBeforeArrivalFreeToCancel: 5,
          waiveCancellationFeeAccidentalBookings: false,
        },
        aboutTheProperty: 'Luxury property managed professionally',
        aboutTheNeighborhood: 'Premium management area',
        firstDateGuestCanCheckIn: new Date('2024-02-01').toISOString(),
      };

      // Create property as Manager user
      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(propertyData)
        .expect(201);

      expect(response.body.message).toBe('Property created successfully');
      expect(response.body.property.ownerId).toBe(managerUser.id);

      // Verify that the user has been upgraded to HomeOwner in the database
      const updatedUser = await prisma.user.findUnique({
        where: { id: managerUser.id },
        select: { role: true },
      });

      expect(updatedUser?.role).toBe('HomeOwner');
    });
  });
});