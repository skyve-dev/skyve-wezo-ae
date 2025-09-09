import request from 'supertest';
import app from '../app';
import prisma from '../config/database';
import { hashPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { describe, it, beforeAll, afterAll, expect } from '@jest/globals';
import { cleanupDatabase } from './setup';

describe('Booking Details API Integration Tests', () => {
  let managerToken: string;
  let homeOwnerToken: string;
  let tenantToken: string;
  let managerId: string;
  let homeOwnerId: string;
  let tenantId: string;
  let propertyId: string;
  let ratePlanId: string;
  let reservationId: string;

  beforeAll(async () => {
    await cleanupDatabase();
    
    const hashedPassword = await hashPassword('Test@123');
    const timestamp = Date.now();
    
    // Create Manager user
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

    // Create HomeOwner user
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

    // Create Tenant (guest) user
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
      }
    });

    // Create property owned by HomeOwner
    const property = await prisma.property.create({
      data: {
        propertyId: `prop_${timestamp}`,
        name: 'Test Villa for Booking',
        addressId: address.id,
        maximumGuest: 6,
        bathrooms: 2,
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

    // Create rate plan
    const ratePlan = await prisma.ratePlan.create({
      data: {
        name: 'Test Rate Plan',
        description: 'Test rate plan for booking',
        propertyId: propertyId,
        minStay: 1,
        maxStay: 30,
      },
    });
    ratePlanId = ratePlan.id;

    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        propertyId: propertyId,
        ratePlanId: ratePlanId,
        guestId: tenantId,
        checkInDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        checkOutDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        numGuests: 4,
        totalPrice: 3000,
        commissionAmount: 300,
        status: 'Confirmed',
        paymentStatus: 'Paid',
        guestRequests: 'Late check-in requested',
        notes: 'VIP guest',
      },
    });
    reservationId = reservation.id;

    // Create initial message
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

    // Create audit log entries
    await prisma.reservationAuditLog.create({
      data: {
        reservationId: reservationId,
        userId: managerId,
        userRole: 'Manager',
        action: 'created',
        description: 'Reservation created',
      },
    });

    await prisma.reservationAuditLog.create({
      data: {
        reservationId: reservationId,
        userId: managerId,
        userRole: 'Manager',
        action: 'status_changed',
        field: 'status',
        oldValue: 'Pending',
        newValue: 'Confirmed',
        description: 'Status changed from Pending to Confirmed',
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

  describe('GET /api/booking/reservations/:id/details', () => {
    it('should fetch booking details with all includes for Manager', async () => {
      const response = await request(app)
        .get(`/api/booking/reservations/${reservationId}/details?include=property,guest,messages,auditTrail,feeBreakdown`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('booking');
      expect(response.body.booking.id).toBe(reservationId);
      expect(response.body).toHaveProperty('property');
      expect(response.body).toHaveProperty('guest');
      expect(response.body).toHaveProperty('messages');
      expect(response.body).toHaveProperty('auditTrail');
      expect(response.body).toHaveProperty('feeBreakdown');
      expect(response.body.messages).toHaveLength(1);
      expect(response.body.auditTrail.auditLogs).toHaveLength(2);
    });

    it('should fetch booking details for HomeOwner (property owner)', async () => {
      const response = await request(app)
        .get(`/api/booking/reservations/${reservationId}/details`)
        .set('Authorization', `Bearer ${homeOwnerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.booking.id).toBe(reservationId);
      expect(response.body.booking.notes).toBe('VIP guest'); // HomeOwner can see private notes
    });

    it('should fetch booking details for Tenant (guest)', async () => {
      const response = await request(app)
        .get(`/api/booking/reservations/${reservationId}/details`)
        .set('Authorization', `Bearer ${tenantToken}`);

      expect(response.status).toBe(200);
      expect(response.body.booking.id).toBe(reservationId);
      expect(response.body.booking.notes).toBeUndefined(); // Tenant cannot see private notes
    });

    it('should return 404 for non-existent reservation', async () => {
      const response = await request(app)
        .get('/api/booking/reservations/non-existent-id/details')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for unauthorized access', async () => {
      const response = await request(app)
        .get(`/api/booking/reservations/${reservationId}/details`);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/booking/reservations/:id/messages', () => {
    it('should fetch messages for a reservation', async () => {
      const response = await request(app)
        .get(`/api/booking/reservations/${reservationId}/messages`)
        .set('Authorization', `Bearer ${homeOwnerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('messages');
      expect(response.body.messages).toHaveLength(1);
      expect(response.body.messages[0].content).toBe('Hello, looking forward to staying at your property!');
    });

    it('should allow tenant to view their own reservation messages', async () => {
      const response = await request(app)
        .get(`/api/booking/reservations/${reservationId}/messages`)
        .set('Authorization', `Bearer ${tenantToken}`);

      expect(response.status).toBe(200);
      expect(response.body.messages).toHaveLength(1);
    });
  });

  describe('POST /api/booking/reservations/:id/messages', () => {
    it('should send a message as HomeOwner', async () => {
      const response = await request(app)
        .post(`/api/booking/reservations/${reservationId}/messages`)
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .send({
          message: 'Thank you! We are preparing everything for your arrival.',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Message sent successfully');
      expect(response.body.messageData.content).toBe('Thank you! We are preparing everything for your arrival.');
      expect(response.body.messageData.senderId).toBe(homeOwnerId);
    });

    it('should send a message as Tenant', async () => {
      const response = await request(app)
        .post(`/api/booking/reservations/${reservationId}/messages`)
        .set('Authorization', `Bearer ${tenantToken}`)
        .send({
          message: 'Can we have early check-in at 12 PM?',
        });

      expect(response.status).toBe(201);
      expect(response.body.messageData.senderId).toBe(tenantId);
    });

    it('should return 400 for empty message', async () => {
      const response = await request(app)
        .post(`/api/booking/reservations/${reservationId}/messages`)
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .send({
          message: '',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/booking/reservations/:id/audit-log', () => {
    it('should fetch audit trail for Manager', async () => {
      const response = await request(app)
        .get(`/api/booking/reservations/${reservationId}/audit-log`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('auditLogs');
      expect(response.body.auditLogs).toHaveLength(2);
      expect(response.body.pagination).toHaveProperty('totalCount', 2);
    });

    it('should fetch audit trail for HomeOwner', async () => {
      const response = await request(app)
        .get(`/api/booking/reservations/${reservationId}/audit-log`)
        .set('Authorization', `Bearer ${homeOwnerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.auditLogs).toHaveLength(2);
    });

    it('should deny audit trail access for Tenant', async () => {
      const response = await request(app)
        .get(`/api/booking/reservations/${reservationId}/audit-log`)
        .set('Authorization', `Bearer ${tenantToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('cannot view audit');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get(`/api/booking/reservations/${reservationId}/audit-log?page=1&limit=1`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.auditLogs).toHaveLength(1);
      expect(response.body.pagination.limit).toBe(1);
      expect(response.body.pagination.totalPages).toBe(2);
    });
  });

  describe('GET /api/booking/reservations/:id/fee-breakdown', () => {
    it('should fetch fee breakdown for Manager', async () => {
      const response = await request(app)
        .get(`/api/booking/reservations/${reservationId}/fee-breakdown`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('basePrice', 3000);
      expect(response.body).toHaveProperty('cleaningFee', 200);
      expect(response.body).toHaveProperty('platformCommission', 300);
      expect(response.body).toHaveProperty('ownerReceives', 2700);
    });

    it('should fetch fee breakdown for HomeOwner', async () => {
      const response = await request(app)
        .get(`/api/booking/reservations/${reservationId}/fee-breakdown`)
        .set('Authorization', `Bearer ${homeOwnerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ownerReceives).toBe(2700);
    });

    it('should fetch limited fee breakdown for Tenant', async () => {
      const response = await request(app)
        .get(`/api/booking/reservations/${reservationId}/fee-breakdown`)
        .set('Authorization', `Bearer ${tenantToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalGuestPays', 3600);
      // Tenant should not see platform commission
      expect(response.body.platformCommission).toBeUndefined();
    });
  });

  describe('PUT /api/booking/reservations/:id/modify', () => {
    it('should allow Manager to modify reservation', async () => {
      const response = await request(app)
        .put(`/api/booking/reservations/${reservationId}/modify`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          numGuests: 5,
          guestRequests: 'Updated: Late check-in at 11 PM',
        });

      expect(response.status).toBe(200);
      expect(response.body.reservation.numGuests).toBe(5);
      expect(response.body.reservation.guestRequests).toContain('Updated');
      expect(response.body).toHaveProperty('auditLog');
    });

    it('should allow HomeOwner to modify their property reservation', async () => {
      const response = await request(app)
        .put(`/api/booking/reservations/${reservationId}/modify`)
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .send({
          notes: 'Updated VIP notes',
        });

      expect(response.status).toBe(200);
      expect(response.body.reservation.notes).toBe('Updated VIP notes');
    });

    it('should deny Tenant from modifying reservation', async () => {
      const response = await request(app)
        .put(`/api/booking/reservations/${reservationId}/modify`)
        .set('Authorization', `Bearer ${tenantToken}`)
        .send({
          numGuests: 6,
        });

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/booking/reservations/:id/status', () => {
    it('should allow Manager to update reservation status', async () => {
      const response = await request(app)
        .post(`/api/booking/reservations/${reservationId}/status`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          status: 'CheckedIn',
          reason: 'Guest arrived',
        });

      expect(response.status).toBe(200);
      expect(response.body.reservation.status).toBe('CheckedIn');
      expect(response.body).toHaveProperty('auditLog');
      expect(response.body.auditLog.action).toBe('status_changed');
    });

    it('should allow HomeOwner to cancel their reservation', async () => {
      // First change back to Confirmed
      await prisma.reservation.update({
        where: { id: reservationId },
        data: { status: 'Confirmed' },
      });

      const response = await request(app)
        .post(`/api/booking/reservations/${reservationId}/status`)
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .send({
          status: 'Cancelled',
          reason: 'Property maintenance required',
        });

      expect(response.status).toBe(200);
      expect(response.body.reservation.status).toBe('Cancelled');
    });

    it('should deny invalid status transitions', async () => {
      const response = await request(app)
        .post(`/api/booking/reservations/${reservationId}/status`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          status: 'Confirmed', // Cannot go from Cancelled to Confirmed
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid status transition');
    });
  });

  describe('PUT /api/booking/reservations/:id/notes', () => {
    it('should allow Manager to update private notes', async () => {
      const response = await request(app)
        .put(`/api/booking/reservations/${reservationId}/notes`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          notes: 'Updated: VIP guest with special requirements',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Private notes updated successfully');
    });

    it('should allow HomeOwner to update private notes', async () => {
      const response = await request(app)
        .put(`/api/booking/reservations/${reservationId}/notes`)
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .send({
          notes: 'Guest prefers quiet environment',
        });

      expect(response.status).toBe(200);
    });

    it('should deny Tenant from updating private notes', async () => {
      const response = await request(app)
        .put(`/api/booking/reservations/${reservationId}/notes`)
        .set('Authorization', `Bearer ${tenantToken}`)
        .send({
          notes: 'Should not work',
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Only HomeOwners and Managers');
    });
  });

  describe('POST /api/booking/reservations/:id/no-show', () => {
    it('should allow HomeOwner to report no-show', async () => {
      // Reset status to Confirmed
      await prisma.reservation.update({
        where: { id: reservationId },
        data: { 
          status: 'Confirmed',
          checkInDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        },
      });

      const response = await request(app)
        .post(`/api/booking/reservations/${reservationId}/no-show`)
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .send({
          reason: 'guest_didnt_arrive',
          description: 'Guest did not show up and did not respond to messages',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Guest no-show reported successfully');
      expect(response.body.commissionWaived).toBe(true);
      expect(response.body.reservation.isNoShowReported).toBe(true);
    });

    it('should only allow reporting no-show within 48 hours', async () => {
      // Set check-in date to 3 days ago
      await prisma.reservation.update({
        where: { id: reservationId },
        data: { 
          status: 'Confirmed',
          checkInDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          isNoShowReported: false,
        },
      });

      const response = await request(app)
        .post(`/api/booking/reservations/${reservationId}/no-show`)
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .send({
          reason: 'guest_didnt_arrive',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('48 hours');
    });

    it('should deny Tenant from reporting no-show', async () => {
      const response = await request(app)
        .post(`/api/booking/reservations/${reservationId}/no-show`)
        .set('Authorization', `Bearer ${tenantToken}`)
        .send({
          reason: 'test',
        });

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/booking/reservations/:id/payout', () => {
    it('should allow Manager to create payout', async () => {
      // Reset reservation to completed state
      await prisma.reservation.update({
        where: { id: reservationId },
        data: { 
          status: 'Completed',
          paymentStatus: 'Paid',
        },
      });

      const response = await request(app)
        .post(`/api/booking/reservations/${reservationId}/payout`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          amount: 2700,
          payoutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          bankDetails: {
            accountNumber: '1234567890',
            bankName: 'Test Bank',
          },
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Payout created successfully');
      expect(response.body.payout).toHaveProperty('amount', 2700);
    });

    it('should deny HomeOwner from creating payout', async () => {
      const response = await request(app)
        .post(`/api/booking/reservations/${reservationId}/payout`)
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .send({
          amount: 2700,
          payoutDate: new Date().toISOString(),
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Only Managers can create payouts');
    });

    it('should deny payout for pending reservations', async () => {
      await prisma.reservation.update({
        where: { id: reservationId },
        data: { status: 'Pending' },
      });

      const response = await request(app)
        .post(`/api/booking/reservations/${reservationId}/payout`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          amount: 2700,
          payoutDate: new Date().toISOString(),
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('cannot create payout for reservation with status');
    });
  });

  describe('GET /api/booking/reservations/:id/export', () => {
    it('should export reservation data as JSON', async () => {
      const response = await request(app)
        .get(`/api/booking/reservations/${reservationId}/export?format=json`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('reservationId', reservationId);
      expect(response.body).toHaveProperty('reservation');
      expect(response.body).toHaveProperty('exportedAt');
    });

    it('should export reservation data as CSV', async () => {
      const response = await request(app)
        .get(`/api/booking/reservations/${reservationId}/export?format=csv`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('.csv');
    });

    it('should allow HomeOwner to export their reservation', async () => {
      const response = await request(app)
        .get(`/api/booking/reservations/${reservationId}/export`)
        .set('Authorization', `Bearer ${homeOwnerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.reservationId).toBe(reservationId);
    });
  });

  describe('Role-Based Access Control', () => {
    it('should enforce proper access for different user roles', async () => {
      // Create another property and reservation not owned by our homeOwner
      const otherHomeOwner = await prisma.user.create({
        data: {
          username: `other_owner_${Date.now()}`,
          email: `other_${Date.now()}@example.com`,
          password: await hashPassword('Test@123'),
          role: 'HomeOwner',
          isAdmin: false,
        },
      });

      // Create address for other property
      const otherAddress = await prisma.address.create({
        data: {
          countryOrRegion: 'UAE',
          city: 'Dubai',
          zipCode: 54321,
        }
      });

      const otherProperty = await prisma.property.create({
        data: {
          propertyId: `other_prop_${Date.now()}`,
          name: 'Other Villa',
          addressId: otherAddress.id,
          maximumGuest: 4,
          bathrooms: 2,
          allowChildren: true,
          offerCribs: true,
          parking: 'YesFree',
          languages: ['English', 'Arabic'],
          smokingAllowed: false,
          partiesOrEventsAllowed: false,
          petsAllowed: 'No',
          aboutTheProperty: 'Another beautiful villa',
          aboutTheNeighborhood: 'Great neighborhood',
          bookingType: 'BookInstantly',
          paymentType: 'Online',
          ownerId: otherHomeOwner.id,
          status: 'Live',
        },
      });

      const otherReservation = await prisma.reservation.create({
        data: {
          propertyId: otherProperty.propertyId,
          guestId: tenantId,
          checkInDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          checkOutDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
          numGuests: 2,
          totalPrice: 1500,
          status: 'Confirmed',
          paymentStatus: 'Paid',
        },
      });

      // HomeOwner should NOT be able to access other owner's reservation details
      const response = await request(app)
        .get(`/api/booking/reservations/${otherReservation.id}/details`)
        .set('Authorization', `Bearer ${homeOwnerToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found or you do not have permission');

      // Manager should be able to access any reservation
      const managerResponse = await request(app)
        .get(`/api/booking/reservations/${otherReservation.id}/details`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(managerResponse.status).toBe(200);
      expect(managerResponse.body.booking.id).toBe(otherReservation.id);

      // Tenant (guest) should be able to access their own reservation
      const tenantResponse = await request(app)
        .get(`/api/booking/reservations/${otherReservation.id}/details`)
        .set('Authorization', `Bearer ${tenantToken}`);

      expect(tenantResponse.status).toBe(200);
      expect(tenantResponse.body.booking.id).toBe(otherReservation.id);
    });
  });

  describe('Error Handling and Validation', () => {
    it('should handle database errors gracefully', async () => {
      const response = await request(app)
        .get('/api/booking/reservations/invalid-uuid-format/details')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate message content', async () => {
      const response = await request(app)
        .post(`/api/booking/reservations/${reservationId}/messages`)
        .set('Authorization', `Bearer ${homeOwnerToken}`)
        .send({
          // Missing message field
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate status transitions', async () => {
      await prisma.reservation.update({
        where: { id: reservationId },
        data: { status: 'Completed' },
      });

      const response = await request(app)
        .post(`/api/booking/reservations/${reservationId}/status`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          status: 'Pending', // Invalid transition from CheckedOut to Pending
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid status transition');
    });

    it('should handle concurrent modifications safely', async () => {
      // Simulate concurrent updates
      const promises = [
        request(app)
          .put(`/api/booking/reservations/${reservationId}/modify`)
          .set('Authorization', `Bearer ${managerToken}`)
          .send({ numGuests: 3 }),
        request(app)
          .put(`/api/booking/reservations/${reservationId}/modify`)
          .set('Authorization', `Bearer ${managerToken}`)
          .send({ numGuests: 4 }),
        request(app)
          .put(`/api/booking/reservations/${reservationId}/modify`)
          .set('Authorization', `Bearer ${managerToken}`)
          .send({ numGuests: 5 }),
      ];

      const results = await Promise.all(promises);
      
      // All should succeed
      results.forEach(result => {
        expect(result.status).toBe(200);
      });

      // Final state should be consistent
      const finalResponse = await request(app)
        .get(`/api/booking/reservations/${reservationId}/details`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(finalResponse.status).toBe(200);
      expect([3, 4, 5]).toContain(finalResponse.body.booking.numGuests);
    });
  });
});