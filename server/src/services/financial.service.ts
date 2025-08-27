import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export class FinancialService {
  async getEarnings(
    userId: string,
    filters: {
      startDate?: string;
      endDate?: string;
      propertyId?: string;
    }
  ): Promise<any> {
    const whereClause: any = {
      ratePlan: {
        property: {
          ownerId: userId,
        },
      },
      status: {
        in: ['Confirmed', 'Completed'],
      },
    };

    if (filters.propertyId) {
      whereClause.ratePlan.property.propertyId = filters.propertyId;
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
      const propertyId = reservation.ratePlan.property.propertyId;
      if (!acc[propertyId]) {
        acc[propertyId] = {
          propertyId,
          propertyName: reservation.ratePlan.property.name,
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
        ratePlan: {
          property: {
            ownerId: userId,
          },
        },
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

      statement.transactions.push({
        date: reservation.checkInDate,
        reservationId: reservation.id,
        propertyName: reservation.ratePlan.property.name,
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

  async getBankDetails(userId: string): Promise<any> {
    const bankDetails = await prisma.homeOwnerBankDetails.findUnique({
      where: {
        homeownerId: userId,
      },
    });

    if (!bankDetails) {
      return null;
    }

    return {
      ...bankDetails,
      accountNumber: `****${bankDetails.accountNumber.slice(-4)}`,
    };
  }

  async updateBankDetails(userId: string, data: any): Promise<any> {
    const bankDetails = await prisma.homeOwnerBankDetails.upsert({
      where: {
        homeownerId: userId,
      },
      update: {
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountHolderName: data.accountHolderName,
        sortCode: data.sortCode,
        currency: data.currency,
      },
      create: {
        homeownerId: userId,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountHolderName: data.accountHolderName,
        sortCode: data.sortCode,
        currency: data.currency,
      },
    });

    return bankDetails;
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