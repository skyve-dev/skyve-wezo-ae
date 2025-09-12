import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export class FinancialService {
  async getEarningsStats(
    userId: string,
    _filters?: {
      startDate?: string;
      endDate?: string;
    }
  ): Promise<any> {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear(), 11, 31);

    // This month earnings
    const thisMonthEarnings = await this.getEarnings(userId, {
      startDate: thisMonthStart.toISOString().split('T')[0],
      endDate: thisMonthEnd.toISOString().split('T')[0],
    });

    // Year to date earnings
    const yearToDateEarnings = await this.getEarnings(userId, {
      startDate: yearStart.toISOString().split('T')[0],
      endDate: yearEnd.toISOString().split('T')[0],
    });

    // Pending payouts
    const pendingPayouts = await prisma.payout.findMany({
      where: {
        homeOwnerId: userId,
        status: 'Pending',
      },
    });

    const pendingPayoutAmount = pendingPayouts.reduce((sum, payout) => 
      sum + payout.amount.toNumber(), 0
    );

    // Monthly breakdown for the last 12 months
    const monthlyBreakdown = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthEarnings = await this.getEarnings(userId, {
        startDate: monthStart.toISOString().split('T')[0],
        endDate: monthEnd.toISOString().split('T')[0],
      });

      monthlyBreakdown.push({
        month: monthStart.toLocaleDateString('en-AE', { month: 'short', year: 'numeric' }),
        gross: monthEarnings.summary.totalEarnings,
        net: monthEarnings.summary.netEarnings,
        bookingCount: monthEarnings.summary.reservationCount,
      });
    }

    return {
      thisMonth: {
        gross: thisMonthEarnings.summary.totalEarnings,
        net: thisMonthEarnings.summary.netEarnings,
        currency: 'AED',
        bookingCount: thisMonthEarnings.summary.reservationCount,
        averageBookingValue: thisMonthEarnings.summary.reservationCount > 0 
          ? thisMonthEarnings.summary.totalEarnings / thisMonthEarnings.summary.reservationCount 
          : 0,
        growthPercent: 12, // TODO: Calculate actual growth
      },
      yearToDate: {
        gross: yearToDateEarnings.summary.totalEarnings,
        net: yearToDateEarnings.summary.netEarnings,
        currency: 'AED',
        bookingCount: yearToDateEarnings.summary.reservationCount,
        growthPercent: 28, // TODO: Calculate actual growth
      },
      pendingPayout: {
        amount: pendingPayoutAmount,
        currency: 'AED',
        nextPayoutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
        transactionCount: pendingPayouts.length,
      },
      totalEarnings: {
        gross: yearToDateEarnings.summary.totalEarnings,
        net: yearToDateEarnings.summary.netEarnings,
        currency: 'AED',
      },
      monthlyBreakdown,
      topProperties: yearToDateEarnings.byProperty.slice(0, 5),
    };
  }

  async getTransactions(
    userId: string,
    filters: {
      type?: string;
      status?: string;
      propertyId?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<any> {
    const whereClause: any = {
      OR: [
        {
          ratePlan: {
            property: {
              ownerId: userId,
            },
          },
        },
        {
          property: {
            ownerId: userId,
          },
        },
      ],
    };

    if (filters.propertyId) {
      whereClause.OR = [
        {
          ratePlan: {
            property: {
              ownerId: userId,
              propertyId: filters.propertyId,
            },
          },
        },
        {
          property: {
            ownerId: userId,
            propertyId: filters.propertyId,
          },
        },
      ];
    }

    if (filters.startDate || filters.endDate) {
      whereClause.checkInDate = {};
      if (filters.startDate) {
        whereClause.checkInDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        whereClause.checkInDate.lte = new Date(filters.endDate);
      }
    }

    const skip = ((filters.page || 1) - 1) * (filters.limit || 20);
    const take = filters.limit || 20;

    const reservations = await prisma.reservation.findMany({
      where: whereClause,
      skip,
      take,
      include: {
        ratePlan: {
          select: {
            property: {
              select: {
                propertyId: true,
                name: true,
              },
            },
          },
        },
        property: {
          select: {
            propertyId: true,
            name: true,
          },
        },
        guest: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const transactions = reservations.map((reservation) => {
      const property = reservation.ratePlan?.property || reservation.property;
      const commission = reservation.commissionAmount?.toNumber() || 0;
      const gross = reservation.totalPrice.toNumber();
      
      return {
        id: reservation.id,
        type: 'booking' as const,
        description: `Booking - ${property.name}`,
        amount: gross,
        currency: 'AED',
        status: reservation.paymentStatus === 'Completed' ? 'completed' : 'pending',
        reservationId: reservation.id,
        propertyId: property.propertyId,
        propertyName: property.name,
        guestName: `${reservation.guest?.firstName || ''} ${reservation.guest?.lastName || ''}`.trim(),
        bookingReference: reservation.id.slice(-8).toUpperCase(),
        commissionRate: commission > 0 ? (commission / gross) * 100 : 0,
        netAmount: gross - commission,
        createdAt: reservation.createdAt.toISOString(),
        processedAt: reservation.paymentStatus === 'Completed' ? reservation.updatedAt.toISOString() : undefined,
      };
    });

    return {
      transactions,
      total: transactions.length,
    };
  }

  async getEarnings(
    userId: string,
    filters: {
      startDate?: string;
      endDate?: string;
      propertyId?: string;
    }
  ): Promise<any> {
    // Build where clause to handle both rate plan and direct bookings
    const whereClause: any = {
      OR: [
        // Reservations with rate plans
        {
          ratePlan: {
            property: {
              ownerId: userId,
            },
          },
        },
        // Direct property reservations
        {
          property: {
            ownerId: userId,
          },
        },
      ],
      status: {
        in: ['Confirmed', 'Completed'],
      },
    };

    // Apply property filter to both scenarios
    if (filters.propertyId) {
      whereClause.OR = [
        {
          ratePlan: {
            property: {
              ownerId: userId,
              propertyId: filters.propertyId,
            },
          },
        },
        {
          property: {
            ownerId: userId,
            propertyId: filters.propertyId,
          },
        },
      ];
    }

    if (filters.startDate || filters.endDate) {
      whereClause.checkInDate = {};
      if (filters.startDate) {
        whereClause.checkInDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        whereClause.checkInDate.lte = new Date(filters.endDate);
      }
    }

    const reservations = await prisma.reservation.findMany({
      where: whereClause,
      include: {
        ratePlan: {
          select: {
            id: true,
            name: true,
            property: {
              select: {
                propertyId: true,
                name: true,
              },
            },
          },
        },
        property: {
          select: {
            propertyId: true,
            name: true,
          },
        },
      },
    });

    const totalEarnings = reservations.reduce((sum, reservation) => {
      if (reservation.commissionAmount) {
        const netEarning = reservation.totalPrice.toNumber() - reservation.commissionAmount.toNumber();
        return sum + netEarning;
      }
      return sum + reservation.totalPrice.toNumber();
    }, 0);

    const totalCommission = reservations.reduce((sum, reservation) => {
      if (reservation.commissionAmount) {
        return sum + reservation.commissionAmount.toNumber();
      }
      return sum;
    }, 0);

    const earningsByProperty = reservations.reduce((acc: any, reservation) => {
      // Get property info from either rate plan or direct property
      const property = reservation.ratePlan?.property || reservation.property;
      const propertyId = property.propertyId;
      
      if (!acc[propertyId]) {
        acc[propertyId] = {
          propertyId,
          propertyName: property.name,
          totalEarnings: 0,
          totalCommission: 0,
          reservationCount: 0,
        };
      }
      
      const commission = reservation.commissionAmount?.toNumber() || 0;
      const netEarning = reservation.totalPrice.toNumber() - commission;
      acc[propertyId].totalEarnings += netEarning;
      acc[propertyId].totalCommission += commission;
      acc[propertyId].reservationCount++;
      
      return acc;
    }, {});

    return {
      summary: {
        totalEarnings,
        totalCommission,
        netEarnings: totalEarnings - totalCommission,
        reservationCount: reservations.length,
      },
      byProperty: Object.values(earningsByProperty),
      period: {
        startDate: filters.startDate,
        endDate: filters.endDate,
      },
    };
  }

  async getFinancialStatements(
    userId: string,
    year: number,
    month?: number
  ): Promise<any> {
    const startDate = month 
      ? new Date(year, month - 1, 1)
      : new Date(year, 0, 1);
    
    const endDate = month
      ? new Date(year, month, 0)
      : new Date(year, 11, 31);

    const reservations = await prisma.reservation.findMany({
      where: {
        OR: [
          // Reservations with rate plans
          {
            ratePlan: {
              property: {
                ownerId: userId,
              },
            },
          },
          // Direct property reservations
          {
            property: {
              ownerId: userId,
            },
          },
        ],
        checkInDate: {
          gte: startDate,
          lte: endDate,
        },
        paymentStatus: {
          in: ['Completed', 'Pending'],
        },
      },
      include: {
        ratePlan: {
          select: {
            id: true,
            name: true,
            property: {
              select: {
                propertyId: true,
                name: true,
              },
            },
          },
        },
        property: {
          select: {
            propertyId: true,
            name: true,
          },
        },
      },
    });

    const statement = {
      period: {
        year,
        month,
        startDate,
        endDate,
      },
      revenue: {
        gross: 0,
        commission: 0,
        net: 0,
      },
      transactions: [] as any[],
    };

    reservations.forEach((reservation: any) => {
      const gross = reservation.totalPrice.toNumber();
      const commission = reservation.commissionAmount?.toNumber() || 0;
      const net = gross - commission;

      statement.revenue.gross += gross;
      statement.revenue.commission += commission;
      statement.revenue.net += net;

      // Get property info from either rate plan or direct property
      const property = reservation.ratePlan?.property || reservation.property;
      
      statement.transactions.push({
        date: reservation.checkInDate,
        reservationId: reservation.id,
        propertyName: property.name,
        amount: gross,
        commission,
        netAmount: net,
        status: reservation.paymentStatus,
      });
    });

    return statement;
  }

  async getInvoices(
    userId: string,
    status?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    const whereClause: Prisma.InvoiceWhereInput = {
      homeownerId: userId,
    };

    if (status) {
      whereClause.paymentStatus = status;
    }

    const skip = (page - 1) * limit;

    const [invoices, totalCount] = await prisma.$transaction([
      prisma.invoice.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          issueDate: 'desc',
        },
      }),
      prisma.invoice.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      invoices,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
      },
    };
  }

  async getInvoice(invoiceId: string, userId: string): Promise<any> {
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        homeownerId: userId,
      },
    });

    if (!invoice) {
      throw new Error('Invoice not found or you do not have permission to view it');
    }

    return invoice;
  }

  async getBankAccounts(userId: string): Promise<any[]> {
    const bankDetails = await prisma.homeOwnerBankDetails.findUnique({
      where: {
        homeownerId: userId,
      },
    });

    if (!bankDetails) {
      return [];
    }

    // Convert legacy bank details to new format for frontend compatibility
    return [{
      id: bankDetails.id,
      accountHolderName: bankDetails.accountHolderName,
      bankName: bankDetails.bankName,
      iban: `AE${bankDetails.accountNumber}`, // Convert to IBAN format
      accountNumber: `****${bankDetails.accountNumber.slice(-4)}`,
      swiftCode: bankDetails.sortCode,
      currency: bankDetails.currency || 'AED',
      isDefault: true,
      isVerified: true,
      country: 'AE',
      createdAt: bankDetails.createdAt.toISOString(),
      updatedAt: bankDetails.updatedAt.toISOString(),
    }];
  }

  async addBankAccount(userId: string, data: any): Promise<any> {
    // For now, we'll use the existing HomeOwnerBankDetails table
    const bankDetails = await prisma.homeOwnerBankDetails.upsert({
      where: {
        homeownerId: userId,
      },
      update: {
        bankName: data.bankName,
        accountNumber: data.iban?.replace('AE', '') || data.accountNumber,
        accountHolderName: data.accountHolderName,
        sortCode: data.swiftCode || data.sortCode,
        currency: data.currency || 'AED',
      },
      create: {
        homeownerId: userId,
        bankName: data.bankName,
        accountNumber: data.iban?.replace('AE', '') || data.accountNumber,
        accountHolderName: data.accountHolderName,
        sortCode: data.swiftCode || data.sortCode,
        currency: data.currency || 'AED',
      },
    });

    return {
      id: bankDetails.id,
      accountHolderName: bankDetails.accountHolderName,
      bankName: bankDetails.bankName,
      iban: `AE${bankDetails.accountNumber}`,
      accountNumber: `****${bankDetails.accountNumber.slice(-4)}`,
      swiftCode: bankDetails.sortCode,
      currency: bankDetails.currency || 'AED',
      isDefault: true,
      isVerified: true,
      country: 'AE',
      createdAt: bankDetails.createdAt.toISOString(),
      updatedAt: bankDetails.updatedAt.toISOString(),
    };
  }

  async updateBankAccount(userId: string, accountId: string, data: any): Promise<any> {
    const bankDetails = await prisma.homeOwnerBankDetails.update({
      where: {
        id: accountId,
        homeownerId: userId,
      },
      data: {
        bankName: data.bankName,
        accountNumber: data.iban?.replace('AE', '') || data.accountNumber,
        accountHolderName: data.accountHolderName,
        sortCode: data.swiftCode || data.sortCode,
        currency: data.currency,
      },
    });

    return {
      id: bankDetails.id,
      accountHolderName: bankDetails.accountHolderName,
      bankName: bankDetails.bankName,
      iban: `AE${bankDetails.accountNumber}`,
      accountNumber: `****${bankDetails.accountNumber.slice(-4)}`,
      swiftCode: bankDetails.sortCode,
      currency: bankDetails.currency || 'AED',
      isDefault: true,
      isVerified: true,
      country: 'AE',
      createdAt: bankDetails.createdAt.toISOString(),
      updatedAt: bankDetails.updatedAt.toISOString(),
    };
  }

  async deleteBankAccount(userId: string, accountId: string): Promise<void> {
    await prisma.homeOwnerBankDetails.delete({
      where: {
        id: accountId,
        homeownerId: userId,
      },
    });
  }

  async verifyBankAccount(userId: string, accountId: string, _verificationData: any): Promise<any> {
    // For demo purposes, we'll just return the account as verified
    const bankDetails = await prisma.homeOwnerBankDetails.findFirst({
      where: {
        id: accountId,
        homeownerId: userId,
      },
    });

    if (!bankDetails) {
      throw new Error('Bank account not found');
    }

    return {
      id: bankDetails.id,
      accountHolderName: bankDetails.accountHolderName,
      bankName: bankDetails.bankName,
      iban: `AE${bankDetails.accountNumber}`,
      accountNumber: `****${bankDetails.accountNumber.slice(-4)}`,
      swiftCode: bankDetails.sortCode,
      currency: bankDetails.currency || 'AED',
      isDefault: true,
      isVerified: true,
      country: 'AE',
      createdAt: bankDetails.createdAt.toISOString(),
      updatedAt: bankDetails.updatedAt.toISOString(),
    };
  }

  async getPayouts(
    userId: string,
    filters: {
      status?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<any[]> {
    const whereClause: any = {
      homeOwnerId: userId,
    };

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      whereClause.scheduledAt = {};
      if (filters.startDate) {
        whereClause.scheduledAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        whereClause.scheduledAt.lte = new Date(filters.endDate);
      }
    }

    const payouts = await prisma.payout.findMany({
      where: whereClause,
      include: {
        reservation: {
          select: {
            id: true,
            property: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return payouts.map((payout) => ({
      id: payout.id,
      bankAccountId: 'legacy', // Since we don't have proper bank account IDs yet
      amount: payout.amount.toNumber(),
      currency: payout.currency,
      status: payout.status.toLowerCase(),
      scheduledDate: payout.scheduledAt?.toISOString(),
      processedDate: payout.processedAt?.toISOString(),
      transactionIds: [payout.reservationId],
      reference: payout.bankReference || payout.id.slice(-8).toUpperCase(),
      fees: {
        platformFee: 0, // TODO: Calculate from reservation
        processingFee: 0,
        taxAmount: 0,
      },
      failureReason: payout.failureReason,
      createdAt: payout.createdAt.toISOString(),
      updatedAt: payout.updatedAt.toISOString(),
    }));
  }

  async requestPayout(
    userId: string,
    data: {
      bankAccountId: string;
      amount?: number;
    }
  ): Promise<any> {
    // Calculate available balance if no amount specified
    let payoutAmount: number;
    
    if (data.amount) {
      payoutAmount = data.amount;
    } else {
      const earnings = await this.getEarnings(userId, {});
      payoutAmount = earnings.summary.netEarnings;
    }

    if (payoutAmount <= 0) {
      throw new Error('No funds available for payout');
    }

    // Create payout record (we'll need to link to a reservation for now)
    const recentReservation = await prisma.reservation.findFirst({
      where: {
        OR: [
          { ratePlan: { property: { ownerId: userId } } },
          { property: { ownerId: userId } },
        ],
        status: 'Completed',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!recentReservation) {
      throw new Error('No completed reservations found for payout');
    }

    const payout = await prisma.payout.create({
      data: {
        reservationId: recentReservation.id,
        homeOwnerId: userId,
        amount: payoutAmount,
        currency: 'AED',
        status: 'Pending',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      },
    });

    return {
      id: payout.id,
      bankAccountId: data.bankAccountId,
      amount: payout.amount.toNumber(),
      currency: payout.currency,
      status: payout.status.toLowerCase(),
      scheduledDate: payout.scheduledAt?.toISOString(),
      processedDate: payout.processedAt?.toISOString(),
      transactionIds: [payout.reservationId],
      reference: payout.id.slice(-8).toUpperCase(),
      fees: {
        platformFee: 0,
        processingFee: 0,
        taxAmount: 0,
      },
      createdAt: payout.createdAt.toISOString(),
      updatedAt: payout.updatedAt.toISOString(),
    };
  }

  async generateInvoiceDownload(invoiceId: string, userId: string): Promise<string> {
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        homeownerId: userId,
      },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // For demo purposes, return a dummy download URL
    return `https://api.wezo.ae/files/invoices/${invoiceId}.pdf`;
  }

  async settleInvoice(invoiceId: string, userId: string, _paymentReference?: string): Promise<any> {
    const invoice = await prisma.invoice.update({
      where: {
        id: invoiceId,
        homeownerId: userId,
      },
      data: {
        paymentStatus: 'Paid',
        // Note: Prisma schema doesn't have paidDate field, would need to add it
      },
    });

    return invoice;
  }

  async reportSecurityBreach(
    userId: string,
    type: string,
    description: string,
    _affectedData?: any
  ): Promise<any> {
    const report = await prisma.securityReport.create({
      data: {
        homeownerId: userId,
        type: type as any,
        description,
        status: 'OPEN',
      },
    });

    return report;
  }
}

export default new FinancialService();