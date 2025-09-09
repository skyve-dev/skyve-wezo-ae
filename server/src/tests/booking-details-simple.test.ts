import request from 'supertest';
import app from '../app';
import prisma from '../config/database';
import { hashPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { describe, it, beforeAll, afterAll, expect } from '@jest/globals';
import { cleanupDatabase } from './setup';

describe('Booking Details API - Simple Integration Tests', () => {
  let managerToken: string;
  let homeOwnerToken: string;
  let tenantToken: string;
  let managerId: string;
  let homeOwnerId: string;
  let tenantId: string;
  let propertyId: string;
  let reservationId: string;

  beforeAll(async () => {
    await cleanupDatabase();
    
    const hashedPassword = await hashPassword('Test@123');
    const timestamp = Date.now();
    
    // Create users
    const manager = await prisma.user.create({
      data: {
        username: `manager_${timestamp}`,
        email: `manager_${timestamp}@example.com`,
        password: hashedPassword,
        role: 'Manager',
        isAdmin: true,
      },
    });
    managerId = manager.id;
    managerToken = generateToken(manager);

    const homeOwner = await prisma.user.create({
      data: {
        username: `homeowner_${timestamp}`,
        email: `homeowner_${timestamp}@example.com`,
        password: hashedPassword,
        role: 'HomeOwner',
        isAdmin: false,
      },
    });
    homeOwnerId = homeOwner.id;
    homeOwnerToken = generateToken(homeOwner);

    const tenant = await prisma.user.create({
      data: {
        username: `tenant_${timestamp}`,
        email: `tenant_${timestamp}@example.com`,
        password: hashedPassword,
        role: 'Tenant',
        isAdmin: false,
      },
    });
    tenantId = tenant.id;
    tenantToken = generateToken(tenant);

    // Create address first
    const address = await prisma.address.create({
      data: {
        countryOrRegion: 'UAE',
        city: 'Dubai',
        zipCode: 12345,
      },
    });

    // Create property with all required fields
    const property = await prisma.property.create({
      data: {
        propertyId: `prop_${timestamp}`,
        name: 'Test Villa for Booking',
        addressId: address.id,
        maximumGuest: 6,
        bathrooms: 3,
        allowChildren: true,
        offerCribs: true,
        parking: 'YesFree',
        languages: ['English', 'Arabic'],
        smokingAllowed: false,
        partiesOrEventsAllowed: false,
        petsAllowed: 'No',
        aboutTheProperty: 'Beautiful test villa',
        aboutTheNeighborhood: 'Great neighborhood',
        bookingType: 'BookInstantly',
        paymentType: 'Online',
        ownerId: homeOwnerId,
        status: 'Live',
      },
    });
    propertyId = property.propertyId;

    // Create pricing for the property
    await prisma.propertyPricing.create({
      data: {
        propertyId: propertyId,
        priceMonday: 1000,
        priceTuesday: 1000,
        priceWednesday: 1000,
        priceThursday: 1000,
        priceFriday: 1200,
        priceSaturday: 1200,
        priceSunday: 1200,
        halfDayPriceMonday: 500,
        halfDayPriceTuesday: 500,
        halfDayPriceWednesday: 500,
        halfDayPriceThursday: 500,
        halfDayPriceFriday: 600,
        halfDayPriceSaturday: 600,
        halfDayPriceSunday: 600,
      },
    });

    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        propertyId: propertyId,
        guestId: tenantId,
        checkInDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        checkOutDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        numGuests: 4,
        totalPrice: 3000,
        status: 'Confirmed',
        paymentStatus: 'Paid',
        guestRequests: 'Late check-in requested',
        notes: 'VIP guest',
      },
    });
    reservationId = reservation.id;

    // Create a message
    await prisma.message.create({
      data: {
        reservationId: reservationId,
        senderId: tenantId,
        senderType: 'Tenant',
        recipientId: homeOwnerId,
        recipientType: 'HomeOwner',
        content: 'Hello, looking forward to staying at your property!',
        isRead: false,
      },
    });

    // Create audit log
    await prisma.reservationAuditLog.create({
      data: {
        reservationId: reservationId,
        userId: managerId,
        userRole: 'Manager',
        action: 'created',
        description: 'Reservation created',
      },
    });

    // Create fee breakdown
    await prisma.reservationFeeBreakdown.create({
      data: {
        reservationId: reservationId,
        basePrice: 3000,
        nights: 3,
        cleaningFee: 200,
        serviceFee: 150,
        taxAmount: 250,
        platformCommission: 300,
        totalGuestPays: 3600,
        ownerReceives: 2700,
        platformRevenue: 450,
      },
    });
  });

  afterAll(async () => {
    await cleanupDatabase();
  });

  describe('Core Booking Details Endpoints', () => {
    it('should fetch booking details for Manager', async () => {
      const response = await request(app)
        .get(`/api/booking/reservations/${reservationId}/details`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('booking');
      expect(response.body.booking.id).toBe(reservationId);
    });

    it('should fetch booking details for HomeOwner', async () => {
      const response = await request(app)
        .get(`/api/booking/reservations/${reservationId}/details`)
        .set('Authorization', `Bearer ${homeOwnerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.booking.id).toBe(reservationId);
      expect(response.body.booking.notes).toBe('VIP guest');
    });

    it('should fetch booking details for Tenant', async () => {
      const response = await request(app)
        .get(`/api/booking/reservations/${reservationId}/details`)
        .set('Authorization', `Bearer ${tenantToken}`);

      expect(response.status).toBe(200);
      expect(response.body.booking.id).toBe(reservationId);
      // Tenant should not see private notes
      expect(response.body.booking.notes).toBeUndefined();
    });
  });

  describe('Messages API', () => {
    it('should fetch messages for a reservation', async () => {
      const response = await request(app)
        .get(`/api/booking/reservations/${reservationId}/messages`)
        .set('Authorization', `Bearer ${homeOwnerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('messages');
      expect(Array.isArray(response.body.messages)).toBe(true);
      if (response.body.messages.length > 0) {
        expect(response.body.messages[0]).toHaveProperty('content');
      }
    });

    it('should send a message', async () => {
      const response = await request(app)
        .post(`/api/booking/reservations/${reservationId}/messages`)
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .send({
          message: 'Thank you for your booking!',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Message sent successfully');
      expect(response.body.messageData).toHaveProperty('content');
    });
  });

  describe('Audit Trail API', () => {
    it('should fetch audit trail for Manager', async () => {
      const response = await request(app)
        .get(`/api/booking/reservations/${reservationId}/audit-log`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('auditLogs');
      expect(Array.isArray(response.body.auditLogs)).toBe(true);
    });

    it('should deny audit trail access for Tenant', async () => {
      const response = await request(app)
        .get(`/api/booking/reservations/${reservationId}/audit-log`)
        .set('Authorization', `Bearer ${tenantToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('Fee Breakdown API', () => {
    it('should fetch fee breakdown', async () => {
      const response = await request(app)
        .get(`/api/booking/reservations/${reservationId}/fee-breakdown`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('basePrice');
      expect(response.body).toHaveProperty('totalGuestPays');
    });
  });

  describe('Status Updates', () => {
    it('should update reservation status', async () => {
      const response = await request(app)
        .post(`/api/booking/reservations/${reservationId}/status`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          status: 'Modified',
          reason: 'Guest requested change',
        });

      expect(response.status).toBe(200);
      expect(response.body.reservation).toHaveProperty('status', 'Modified');
    });
  });

  describe('Private Notes', () => {
    it('should update private notes as Manager', async () => {
      const response = await request(app)
        .put(`/api/booking/reservations/${reservationId}/notes`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          notes: 'Updated VIP notes',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Private notes updated successfully');
    });

    it('should deny Tenant from updating private notes', async () => {
      const response = await request(app)
        .put(`/api/booking/reservations/${reservationId}/notes`)
        .set('Authorization', `Bearer ${tenantToken}`)
        .send({
          notes: 'Should not work',
        });

      expect(response.status).toBe(403);
    });
  });

  describe('Authorization Tests', () => {
    it('should return 401 for unauthorized requests', async () => {
      const response = await request(app)
        .get(`/api/booking/reservations/${reservationId}/details`);

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent reservation', async () => {
      const response = await request(app)
        .get('/api/booking/reservations/non-existent-id/details')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(404);
    });
  });
});