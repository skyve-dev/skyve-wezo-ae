import request from 'supertest';
import app from '../app';
import prisma from '../config/database';
import { hashPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { describe, it, beforeAll, expect } from '@jest/globals';
import { cleanupDatabase } from './setup';

describe('Reservation API Tests', () => {
  let homeOwnerToken: string;
  let homeOwnerId: string;
  let guestId: string;
  let propertyId: string;
  let ratePlanId: string;
  let reservationId: string;
  let reviewId: string;

  beforeAll(async () => {
    await cleanupDatabase();
    
    const hashedPassword = await hashPassword('Test@123');
    const timestamp = Date.now();
    
    // Create home owner
    const homeOwner = await prisma.user.create({
      data: {
        username: `reservationowner_${timestamp}`,
        email: `resowner_${timestamp}@example.com`,
        password: hashedPassword,
        role: 'HomeOwner',
        isAdmin: false,
      },
    });
    
    homeOwnerId = homeOwner.id;
    homeOwnerToken = generateToken(homeOwner);

    // Create guest
    const guest = await prisma.user.create({
      data: {
        username: `reservationguest_${timestamp}`,
        email: `guest_${timestamp}@example.com`,
        password: hashedPassword,
        role: 'Tenant',
        isAdmin: false,
      },
    });
    
    guestId = guest.id;

    // Create a test property using propertyService
    const propertyData = {
      name: 'Reservation Test Villa',
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
      aboutTheProperty: 'Test property for reservations',
      aboutTheNeighborhood: 'Test neighborhood',
      firstDateGuestCanCheckIn: '2024-01-01',
    };

    const propertyService = await import('../services/property.service');
    const property = await propertyService.default.createProperty(propertyData, homeOwnerId);
    
    propertyId = property.propertyId;

    // Create a rate plan
    const ratePlan = await prisma.ratePlan.create({
      data: {
        propertyId,
        name: 'Test Rate Plan',
        type: 'FullyFlexible',
        description: 'Test rate plan',
        adjustmentType: 'FixedPrice',
        adjustmentValue: 1200,
        cancellationPolicy: {
          create: {
            tiers: {
              create: [
                {
                  daysBeforeCheckIn: 1,
                  refundPercentage: 100,
                },
                {
                  daysBeforeCheckIn: 0,
                  refundPercentage: 0,
                },
              ],
            },
          },
        },
        includesBreakfast: true,
      },
    });
    
    ratePlanId = ratePlan.id;

    // Create a test reservation
    const reservation = await prisma.reservation.create({
      data: {
        ratePlanId,
        guestId,
        checkInDate: new Date('2024-06-01'),
        checkOutDate: new Date('2024-06-05'),
        numGuests: 2,
        totalPrice: 4000,
        commissionAmount: 400,
        status: 'Confirmed',
        paymentStatus: 'Completed',
      },
    });
    
    reservationId = reservation.id;

    // Create a test review
    const review = await prisma.review.create({
      data: {
        guestId,
        propertyId,
        reservationId,
        rating: 8,
        comment: 'Great stay! The villa was clean and well-equipped.',
      },
    });
    
    reviewId = review.id;
  });

  describe('GET /reservations', () => {
    it('should get all reservations for home owner', async () => {
      const response = await request(app)
        .get('/api/reservations')
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .expect(200);

      expect(response.body.reservations).toHaveLength(1);
      expect(response.body.reservations[0].ratePlan.property.name).toBe('Reservation Test Villa');
      expect(response.body.reservations[0].guest.id).toBe(guestId);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.totalCount).toBe(1);
    });

    it('should filter reservations by status', async () => {
      const response = await request(app)
        .get('/api/reservations')
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .query({ status: 'Confirmed' })
        .expect(200);

      expect(response.body.reservations).toHaveLength(1);
      expect(response.body.reservations[0].status).toBe('Confirmed');
    });

    it('should filter reservations by date range', async () => {
      const response = await request(app)
        .get('/api/reservations')
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .query({
          startDate: '2024-05-01',
          endDate: '2024-07-01',
        })
        .expect(200);

      expect(response.body.reservations).toHaveLength(1);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/reservations')
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });
  });

  describe('GET /reservations/:reservationId', () => {
    it('should get specific reservation details', async () => {
      const response = await request(app)
        .get(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .expect(200);

      expect(response.body.id).toBe(reservationId);
      expect(response.body.property).toBeDefined();
      expect(response.body.ratePlan).toBeDefined();
      expect(response.body.guest).toBeDefined();
      expect(response.body.payment).toBeDefined();
      expect(response.body.review).toBeDefined();
    });

    it('should return 404 for non-existent reservation', async () => {
      const fakeId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
      
      const response = await request(app)
        .get(`/api/reservations/${fakeId}`)
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .expect(404);

      expect(response.body.error).toBe('Reservation not found or you do not have permission to view it');
    });
  });

  describe('PUT /reservations/:reservationId', () => {
    it('should update reservation successfully', async () => {
      // Create a pending reservation for update test
      const pendingReservation = await prisma.reservation.create({
        data: {
            ratePlanId,
          guestId,
          checkInDate: new Date('2024-07-01'),
          checkOutDate: new Date('2024-07-05'),
          numGuests: 3,
          totalPrice: 4500,
          commissionAmount: 450,
          status: 'Pending',
          paymentStatus: 'Pending',
        },
      });

      const updateData = {
        guestCount: 4,
        totalPrice: 5000,
        status: 'Confirmed',
      };

      const response = await request(app)
        .put(`/api/reservations/${pendingReservation.id}`)
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Reservation updated successfully');
      expect(response.body.reservation.numGuests).toBe(4);
      expect(response.body.reservation.totalPrice.toString()).toBe('5000');
      expect(response.body.reservation.status).toBe('Confirmed');
    });

    it('should reject update of confirmed reservation', async () => {
      const response = await request(app)
        .put(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .send({ guestCount: 5 })
        .expect(400);

      expect(response.body.error).toBe('Cannot modify a confirmed or completed reservation');
    });

    it('should reject invalid date range', async () => {
      const pendingReservation = await prisma.reservation.create({
        data: {
            ratePlanId,
          guestId,
          checkInDate: new Date('2024-08-01'),
          checkOutDate: new Date('2024-08-05'),
          numGuests: 2,
          totalPrice: 3000,
          commissionAmount: 300,
          status: 'Pending',
          paymentStatus: 'Pending',
        },
      });

      const response = await request(app)
        .put(`/api/reservations/${pendingReservation.id}`)
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .send({
          checkInDate: '2024-08-10',
          checkOutDate: '2024-08-08',
        })
        .expect(400);

      expect(response.body.errors.checkOutDate).toBe('Check-in date must be before check-out date');
    });
  });

  describe('POST /reservations/:reservationId/no-show', () => {
    it('should report guest no-show successfully', async () => {
      const noShowData = {
        reason: 'Guest did not arrive and did not respond to contact attempts',
        description: 'Guest was expected to check in at 15:00 but never showed up',
      };

      const response = await request(app)
        .post(`/api/reservations/${reservationId}/no-show`)
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .send(noShowData)
        .expect(200);

      expect(response.body.message).toBe('Guest no-show reported successfully');
      expect(response.body.commissionWaived).toBe(true);
      expect(response.body.reservation.status).toBe('NoShow');
    });

    it('should reject no-show report with insufficient reason', async () => {
      const response = await request(app)
        .post(`/api/reservations/${reservationId}/no-show`)
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .send({ reason: 'short' })
        .expect(400);

      expect(response.body.errors.reason).toBe('Reason must be at least 10 characters long');
    });
  });

  describe('POST /reservations/:reservationId/messages', () => {
    it('should send message to guest successfully', async () => {
      const messageData = {
        message: 'Hello! Thank you for your reservation. Please let me know if you have any questions.',
      };

      const response = await request(app)
        .post(`/api/reservations/${reservationId}/messages`)
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .send(messageData)
        .expect(201);

      expect(response.body.message).toBe('Message sent successfully');
      expect(response.body.messageData.content).toBe(messageData.message);
      expect(response.body.messageData.senderType).toBe('HomeOwner');
      expect(response.body.messageData.recipientType).toBe('Tenant');
    });

    it('should reject empty message', async () => {
      const response = await request(app)
        .post(`/api/reservations/${reservationId}/messages`)
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .send({ message: '   ' })
        .expect(400);

      expect(response.body.errors.message).toBe('Message cannot be empty');
    });

    it('should reject message that is too long', async () => {
      const longMessage = 'a'.repeat(1001);

      const response = await request(app)
        .post(`/api/reservations/${reservationId}/messages`)
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .send({ message: longMessage })
        .expect(400);

      expect(response.body.errors.message).toBe('Message cannot exceed 1000 characters');
    });
  });

  describe('GET /reservations/:reservationId/messages', () => {
    it('should get reservation messages', async () => {
      const response = await request(app)
        .get(`/api/reservations/${reservationId}/messages`)
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .expect(200);

      expect(response.body.reservationId).toBe(reservationId);
      expect(Array.isArray(response.body.messages)).toBe(true);
    });
  });

  describe('POST /reviews/:reviewId/response', () => {
    it('should respond to guest review successfully', async () => {
      const responseData = {
        response: 'Thank you for your kind review! We are glad you enjoyed your stay with us.',
      };

      const response = await request(app)
        .post(`/api/reviews/${reviewId}/response`)
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .send(responseData)
        .expect(200);

      expect(response.body.message).toBe('Review response submitted successfully');
      expect(response.body.review.response).toBe(responseData.response);
    });

    it('should reject duplicate response', async () => {
      const responseData = {
        response: 'Another response attempt',
      };

      const response = await request(app)
        .post(`/api/reviews/${reviewId}/response`)
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .send(responseData)
        .expect(400);

      expect(response.body.error).toBe('Review already has a response');
    });

    it('should reject short response', async () => {
      // Create another reservation and review to test with
      const newReservation = await prisma.reservation.create({
        data: {
            ratePlanId,
          guestId,
          checkInDate: new Date('2024-02-01'),
          checkOutDate: new Date('2024-02-05'),
          numGuests: 2,
          totalPrice: 3000,
          status: 'Completed',
        },
      });

      const newReview = await prisma.review.create({
        data: {
          guestId,
          propertyId,
          reservationId: newReservation.id,
          rating: 7,
          comment: 'Good stay overall',
        },
      });

      const response = await request(app)
        .post(`/api/reviews/${newReview.id}/response`)
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .send({ response: 'Thanks' })
        .expect(400);

      expect(response.body.errors.response).toBe('Response must be at least 10 characters long');
    });

    it('should return 404 for non-existent review', async () => {
      const fakeId = 'ffffffff-eeee-dddd-cccc-bbbbbbbbbbbb';
      
      const response = await request(app)
        .post(`/api/reviews/${fakeId}/response`)
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .send({ response: 'Thank you for your review!' })
        .expect(404);

      expect(response.body.error).toBe('Review not found or you do not have permission to respond');
    });
  });
});