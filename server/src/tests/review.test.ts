import request from 'supertest';
import app from '../app';
import prisma from '../config/database';
import { hashPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { describe, it, beforeAll, expect } from '@jest/globals';
import { cleanupDatabase } from './setup';
import propertyService from '../services/property.service';

describe('Review Management API Tests', () => {
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
        username: `reviewowner_${timestamp}`,
        email: `reviewowner_${timestamp}@example.com`,
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
        username: `reviewguest_${timestamp}`,
        email: `reviewguest_${timestamp}@example.com`,
        password: hashedPassword,
        role: 'Tenant',
        isAdmin: false,
      },
    });
    
    guestId = guest.id;

    // Create a test property using propertyService
    const propertyData = {
      name: 'Review Test Villa',
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
      aboutTheProperty: 'Test property for reviews',
      aboutTheNeighborhood: 'Test neighborhood',
      firstDateGuestCanCheckIn: '2024-01-01',
    };

    const property = await propertyService.createProperty(propertyData, homeOwnerId);
    propertyId = property.propertyId;

    // Create rate plan
    const ratePlan = await prisma.ratePlan.create({
      data: {
        propertyId,
        name: 'Standard Rate',
        description: 'Standard flexible rate',
        priceModifierType: 'FixedAmount',
        priceModifierValue: 800,
        cancellationPolicy: {
          create: {
            type: 'Moderate',
            freeCancellationDays: 7,
            partialRefundDays: 3,
          },
        },
      },
    });
    ratePlanId = ratePlan.id;

    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        ratePlanId,
        guestId,
        checkInDate: new Date('2024-01-01'),
        checkOutDate: new Date('2024-01-05'),
        numGuests: 2,
        totalPrice: 2000,
        status: 'Completed',
      },
    });
    reservationId = reservation.id;

    // Create a review
    const review = await prisma.review.create({
      data: {
        guestId,
        propertyId,
        reservationId,
        rating: 8,
        comment: 'Great stay, very clean and comfortable!',
      },
    });
    reviewId = review.id;
  });

  describe('GET /reviews', () => {
    it('should get all reviews for user properties', async () => {
      const response = await request(app)
        .get('/api/reviews')
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .expect(200);

      expect(response.body.reviews).toBeDefined();
      expect(response.body.reviews).toHaveLength(1);
      expect(response.body.reviews[0].rating).toBe(8);
      expect(response.body.reviews[0].comment).toBe('Great stay, very clean and comfortable!');
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter reviews by rating', async () => {
      const response = await request(app)
        .get('/api/reviews?rating=8')
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .expect(200);

      expect(response.body.reviews).toHaveLength(1);
      expect(response.body.reviews[0].rating).toBe(8);
    });

    it('should filter reviews by response status', async () => {
      const response = await request(app)
        .get('/api/reviews?hasResponse=false')
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .expect(200);

      expect(response.body.reviews).toHaveLength(1);
      expect(response.body.reviews[0].response).toBeNull();
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/reviews')
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });
  });

  describe('GET /properties/:propertyId/reviews', () => {
    it('should get reviews for specific property', async () => {
      const response = await request(app)
        .get(`/api/properties/${propertyId}/reviews`)
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .expect(200);

      expect(response.body.reviews).toHaveLength(1);
      expect(response.body.reviews[0].rating).toBe(8);
    });

    it('should reject request for non-owned property', async () => {
      const otherUser = await prisma.user.create({
        data: {
          username: 'otherreviewuser',
          email: 'otherreview@example.com',
          password: await hashPassword('Test@123'),
          role: 'HomeOwner',
          isAdmin: false,
        },
      });
      
      const otherToken = generateToken(otherUser);

      const response = await request(app)
        .get(`/api/properties/${propertyId}/reviews`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);

      expect(response.body.error).toBe('Property not found or you do not have permission to view its reviews');
    });
  });

  describe('GET /reviews/stats', () => {
    it('should get review statistics', async () => {
      const response = await request(app)
        .get('/api/reviews/stats')
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .expect(200);

      expect(response.body.totalReviews).toBe(1);
      expect(response.body.averageRating).toBe(8);
      expect(response.body.responseRate).toBe(0);
      expect(response.body.ratingDistribution).toBeDefined();
      expect(response.body.ratingDistribution).toHaveLength(1);
      expect(response.body.ratingDistribution[0].rating).toBe(8);
    });

    it('should get stats for specific property', async () => {
      const response = await request(app)
        .get(`/api/reviews/stats?propertyId=${propertyId}`)
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .expect(200);

      expect(response.body.totalReviews).toBe(1);
      expect(response.body.averageRating).toBe(8);
    });
  });

  describe('GET /reviews/insights', () => {
    it('should get review insights and trends', async () => {
      const response = await request(app)
        .get('/api/reviews/insights')
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .expect(200);

      expect(response.body.monthlyTrends).toBeDefined();
      expect(response.body.topKeywords).toBeDefined();
      expect(Array.isArray(response.body.monthlyTrends)).toBe(true);
      expect(Array.isArray(response.body.topKeywords)).toBe(true);
    });
  });

  describe('POST /review-management/:reviewId/response', () => {
    it('should respond to review successfully', async () => {
      const responseText = 'Thank you for your wonderful review! We are glad you enjoyed your stay.';
      
      const response = await request(app)
        .post(`/api/review-management/${reviewId}/response`)
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .send({ response: responseText })
        .expect(200);

      expect(response.body.message).toBe('Response added successfully');
      expect(response.body.review.response).toBe(responseText);
    });

    it('should reject response to already responded review', async () => {
      const response = await request(app)
        .post(`/api/review-management/${reviewId}/response`)
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .send({ response: 'Another response' })
        .expect(400);

      expect(response.body.error).toBe('Review already has a response');
    });

    it('should reject short response', async () => {
      // Create another review to test with
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
        .post(`/api/review-management/${newReview.id}/response`)
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .send({ response: 'Thanks' })
        .expect(400);

      expect(response.body.errors.response).toBe('Response must be at least 10 characters long');
    });

    it('should reject response to non-existent review', async () => {
      const response = await request(app)
        .post('/api/review-management/non-existent-id/response')
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .send({ response: 'Thank you for your review!' })
        .expect(404);

      expect(response.body.error).toBe('Review not found or you do not have permission to respond');
    });
  });

  describe('PUT /review-management/:reviewId/response', () => {
    it('should update review response', async () => {
      const updatedResponse = 'Thank you for your amazing review! We truly appreciate your feedback and are delighted you enjoyed your stay.';
      
      const response = await request(app)
        .put(`/api/review-management/${reviewId}/response`)
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .send({ response: updatedResponse })
        .expect(200);

      expect(response.body.message).toBe('Response updated successfully');
      expect(response.body.review.response).toBe(updatedResponse);
    });
  });

  describe('DELETE /review-management/:reviewId/response', () => {
    it('should delete review response', async () => {
      const response = await request(app)
        .delete(`/api/review-management/${reviewId}/response`)
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .expect(200);

      expect(response.body.message).toBe('Response deleted successfully');
      expect(response.body.review.response).toBeNull();
    });

    it('should reject deletion of non-existent response', async () => {
      const response = await request(app)
        .delete(`/api/review-management/${reviewId}/response`)
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .expect(400);

      expect(response.body.error).toBe('Review does not have a response to delete');
    });
  });
});