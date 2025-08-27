import request from 'supertest';
import app from '../app';
import prisma from '../config/database';
import { hashPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { describe, it, beforeAll, expect } from '@jest/globals';
import { cleanupDatabase } from './setup';

describe('Financial API Tests', () => {
  let authToken: string;
  let userId: string;
  let propertyId: string;
  let invoiceId: string;

  beforeAll(async () => {
    await cleanupDatabase();
    
    const hashedPassword = await hashPassword('Test@123');
    const timestamp = Date.now();
    const user = await prisma.user.create({
      data: {
        username: `financialowner_${timestamp}`,
        email: `financial_${timestamp}@example.com`,
        password: hashedPassword,
        role: 'HomeOwner',
        isAdmin: false,
      },
    });
    
    userId = user.id;
    authToken = generateToken(user);

    // Create a test property using propertyService
    const propertyData = {
      name: 'Financial Test Villa',
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
      aboutTheProperty: 'Test property for financial operations',
      aboutTheNeighborhood: 'Test neighborhood',
      firstDateGuestCanCheckIn: '2024-01-01',
    };

    const propertyService = await import('../services/property.service');
    const property = await propertyService.default.createProperty(propertyData, userId);
    
    propertyId = property.propertyId;

    // Create a guest user
    const guest = await prisma.user.create({
      data: {
        username: `financialguest_${timestamp}`,
        email: `finguest_${timestamp}@example.com`,
        password: hashedPassword,
        role: 'Tenant',
        isAdmin: false,
      },
    });

    // Create rate plan
    const ratePlan = await prisma.ratePlan.create({
      data: {
        propertyId,
        name: 'Financial Test Rate',
        type: 'FullyFlexible',
        description: 'Test rate plan',
        adjustmentType: 'FixedPrice',
        adjustmentValue: 1000,
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

    // Create reservations with payments for earnings test
    await prisma.reservation.create({
      data: {
        ratePlanId: ratePlan.id,
        guestId: guest.id,
        checkInDate: new Date('2024-03-01'),
        checkOutDate: new Date('2024-03-05'),
        numGuests: 2,
        totalPrice: 4000,
        commissionAmount: 400,
        status: 'Completed',
        paymentStatus: 'Completed',
      },
    });
    

    // Create another completed reservation
    await prisma.reservation.create({
      data: {
        ratePlanId: ratePlan.id,
        guestId: guest.id,
        checkInDate: new Date('2024-03-10'),
        checkOutDate: new Date('2024-03-12'),
        numGuests: 3,
        totalPrice: 2400,
        commissionAmount: 240,
        status: 'Completed',
        paymentStatus: 'Completed',
      },
    });

    // Create test invoice
    const invoice = await prisma.invoice.create({
      data: {
        homeownerId: userId,
        invoiceNumber: 'INV-001',
        amount: 640,
        currency: 'AED',
        issueDate: new Date('2024-03-15'),
        dueDate: new Date('2024-04-15'),
        paymentStatus: 'Pending',
        description: 'Commission charges for March 2024',
      },
    });
    
    invoiceId = invoice.id;
  });

  describe('GET /financial/earnings', () => {
    it('should get earnings summary', async () => {
      const response = await request(app)
        .get('/api/financial/earnings')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          startDate: '2024-03-01',
          endDate: '2024-03-31',
        })
        .expect(200);

      expect(response.body.summary).toBeDefined();
      expect(response.body.summary.totalEarnings).toBe(5760); // 4000 + 2400 - 400 - 240
      expect(response.body.summary.totalCommission).toBe(640); // 400 + 240
      expect(response.body.summary.reservationCount).toBe(2);
      expect(response.body.byProperty).toHaveLength(1);
      expect(response.body.byProperty[0].propertyName).toBe('Financial Test Villa');
    });

    it('should filter earnings by property', async () => {
      const response = await request(app)
        .get('/api/financial/earnings')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ propertyId })
        .expect(200);

      expect(response.body.byProperty).toHaveLength(1);
      expect(response.body.byProperty[0].propertyId).toBe(propertyId);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/financial/earnings')
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });
  });

  describe('GET /financial/statements', () => {
    it('should get financial statements for a specific month', async () => {
      const response = await request(app)
        .get('/api/financial/statements')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          year: 2024,
          month: 3,
        })
        .expect(200);

      expect(response.body.period.year).toBe(2024);
      expect(response.body.period.month).toBe(3);
      expect(response.body.revenue).toBeDefined();
      expect(response.body.revenue.gross).toBe(6400); // 4000 + 2400
      expect(response.body.revenue.commission).toBe(640); // 400 + 240
      expect(response.body.revenue.net).toBe(5760); // 6400 - 640
      expect(response.body.transactions).toHaveLength(2);
    });

    it('should get financial statements for full year', async () => {
      const response = await request(app)
        .get('/api/financial/statements')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ year: 2024 })
        .expect(200);

      expect(response.body.period.year).toBe(2024);
      expect(response.body.period.month).toBeUndefined();
      expect(response.body.transactions).toHaveLength(2);
    });
  });

  describe('GET /financial/invoices', () => {
    it('should get all invoices', async () => {
      const response = await request(app)
        .get('/api/financial/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.invoices).toHaveLength(1);
      expect(response.body.invoices[0].invoiceNumber).toBe('INV-001');
      expect(response.body.invoices[0].amount.toString()).toBe('640');
      expect(response.body.invoices[0].paymentStatus).toBe('Pending');
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter invoices by status', async () => {
      const response = await request(app)
        .get('/api/financial/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ status: 'Pending' })
        .expect(200);

      expect(response.body.invoices).toHaveLength(1);
      expect(response.body.invoices[0].paymentStatus).toBe('Pending');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/financial/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          page: 1,
          limit: 10,
        })
        .expect(200);

      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });
  });

  describe('GET /financial/invoices/:invoiceId', () => {
    it('should get specific invoice details', async () => {
      const response = await request(app)
        .get(`/api/financial/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(invoiceId);
      expect(response.body.invoiceNumber).toBe('INV-001');
      expect(response.body.amount.toString()).toBe('640');
      expect(response.body.description).toBe('Commission charges for March 2024');
    });

    it('should return 404 for non-existent invoice', async () => {
      const fakeId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
      
      const response = await request(app)
        .get(`/api/financial/invoices/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toBe('Invoice not found or you do not have permission to view it');
    });
  });

  describe('GET /financial/bank-details', () => {
    it('should return null for no bank details', async () => {
      const response = await request(app)
        .get('/api/financial/bank-details')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeNull();
    });
  });

  describe('PUT /financial/bank-details', () => {
    it('should create new bank details successfully', async () => {
      const bankDetailsData = {
        bankName: 'Emirates NBD',
        accountNumber: '1234567890123456',
        accountHolderName: 'John Doe',
        sortCode: 'EBILAEAD',
        currency: 'AED',
      };

      const response = await request(app)
        .put('/api/financial/bank-details')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bankDetailsData)
        .expect(200);

      expect(response.body.message).toBe('Bank details updated successfully');
      expect(response.body.bankDetails.bankName).toBe('Emirates NBD');
      expect(response.body.bankDetails.accountHolderName).toBe('John Doe');
      expect(response.body.bankDetails.accountNumber).toBe('****3456'); // Masked
    });

    it('should update existing bank details', async () => {
      const updatedData = {
        bankName: 'ADCB Bank',
        accountNumber: '9876543210987654',
        accountHolderName: 'John Smith',
        currency: 'AED',
      };

      const response = await request(app)
        .put('/api/financial/bank-details')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.bankDetails.bankName).toBe('ADCB Bank');
      expect(response.body.bankDetails.accountHolderName).toBe('John Smith');
      expect(response.body.bankDetails.accountNumber).toBe('****7654'); // Masked
    });

    it('should reject invalid account number length', async () => {
      const response = await request(app)
        .put('/api/financial/bank-details')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bankName: 'Test Bank',
          accountNumber: '123', // Too short
          accountHolderName: 'Test User',
        })
        .expect(400);

      expect(response.body.errors.accountNumber).toBe('Account number must be between 8 and 20 characters');
    });

    it('should reject missing required fields', async () => {
      const response = await request(app)
        .put('/api/financial/bank-details')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bankName: 'Test Bank',
        })
        .expect(400);

      expect(response.body.errors.accountNumber).toBe('Account number must be text');
    });

    it('should reject invalid currency', async () => {
      const response = await request(app)
        .put('/api/financial/bank-details')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bankName: 'Test Bank',
          accountNumber: '1234567890',
          accountHolderName: 'Test User',
          currency: 'INVALID',
        })
        .expect(400);

      expect(response.body.errors.currency).toContain('Must be one of');
    });
  });

  describe('GET /financial/bank-details (after creation)', () => {
    it('should get masked bank details', async () => {
      const response = await request(app)
        .get('/api/financial/bank-details')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).not.toBeNull();
      expect(response.body.bankName).toBe('ADCB Bank');
      expect(response.body.accountHolderName).toBe('John Smith');
      expect(response.body.accountNumber).toBe('****7654'); // Masked
    });
  });

  describe('POST /security/report', () => {
    it('should create security breach report successfully', async () => {
      const reportData = {
        type: 'SecurityBreach',
        description: 'Suspected unauthorized access to guest payment information during checkout process.',
        affectedData: {
          dataTypes: ['payment_info', 'guest_details'],
          estimatedRecords: 5,
          timeframe: '2024-03-15 10:00 - 10:30',
        },
      };

      const response = await request(app)
        .post('/api/security/report')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reportData)
        .expect(201);

      expect(response.body.message).toBe('Security breach reported successfully');
      expect(response.body.reportId).toBeDefined();
      expect(response.body.status).toBe('OPEN');
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .post('/api/security/report')
        .send({
          type: 'SecurityBreach',
          description: 'Test security report',
        })
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });
  });
});