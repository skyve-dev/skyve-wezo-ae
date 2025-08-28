import prisma from '../config/database';
import { Decimal } from '@prisma/client/runtime/library';

export interface PriceCreateData {
  date: Date;
  amount: number;
}

export interface PriceBulkCreateData {
  ratePlanId: string;
  prices: PriceCreateData[];
}

export interface PriceUpdateData {
  amount: number;
}

export interface PriceGetParams {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface PriceBulkUpdateData {
  updates: Array<{
    date: Date;
    amount: number;
  }>;
}

export class PriceService {

  /**
   * Get prices for a rate plan within a date range
   */
  async getPricesForRatePlan(
    ratePlanId: string, 
    userId: string, 
    params: PriceGetParams = {}
  ): Promise<any[]> {
    // Verify rate plan ownership through property
    await this.verifyRatePlanOwnership(ratePlanId, userId);

    const { startDate, endDate, limit = 365, offset = 0 } = params;

    // Build where clause for date filtering
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = startDate;
    }
    if (endDate) {
      dateFilter.lte = endDate;
    }

    const prices = await prisma.price.findMany({
      where: {
        ratePlanId,
        ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
      },
      orderBy: { date: 'asc' },
      take: Math.min(limit, 365), // Maximum 365 days
      skip: offset,
      include: {
        ratePlan: {
          select: {
            id: true,
            name: true,
            adjustmentType: true,
            adjustmentValue: true,
            property: {
              select: {
                propertyId: true,
                name: true,
              }
            }
          }
        }
      }
    });

    return prices.map(price => ({
      id: price.id,
      date: price.date,
      amount: parseFloat(price.amount.toString()),
      ratePlan: price.ratePlan,
      createdAt: price.createdAt,
      updatedAt: price.updatedAt,
    }));
  }

  /**
   * Create a single price for a specific date (upsert operation)
   */
  async createPrice(
    ratePlanId: string, 
    userId: string, 
    data: PriceCreateData
  ): Promise<any> {
    // Verify rate plan ownership
    await this.verifyRatePlanOwnership(ratePlanId, userId);

    // Validate amount
    if (data.amount <= 0) {
      throw new Error('Price amount must be greater than 0');
    }

    if (data.amount > 99999.99) {
      throw new Error('Price amount cannot exceed AED 99,999.99');
    }

    // Validate date
    if (data.date < new Date(new Date().setHours(0, 0, 0, 0))) {
      throw new Error('Cannot set prices for past dates');
    }

    // Upsert price (create or update if exists)
    const price = await prisma.price.upsert({
      where: {
        ratePlanId_date: {
          ratePlanId,
          date: data.date,
        },
      },
      update: {
        amount: new Decimal(data.amount),
      },
      create: {
        ratePlanId,
        date: data.date,
        amount: new Decimal(data.amount),
      },
      include: {
        ratePlan: {
          select: {
            id: true,
            name: true,
            adjustmentType: true,
            adjustmentValue: true,
            property: {
              select: {
                propertyId: true,
                name: true,
              }
            }
          }
        }
      }
    });

    return {
      id: price.id,
      date: price.date,
      amount: parseFloat(price.amount.toString()),
      ratePlan: price.ratePlan,
      createdAt: price.createdAt,
      updatedAt: price.updatedAt,
    };
  }

  /**
   * Bulk create/update prices for multiple dates
   */
  async bulkCreatePrices(
    ratePlanId: string, 
    userId: string, 
    data: PriceBulkUpdateData
  ): Promise<{
    success: number;
    skipped: number;
    errors: Array<{ date: Date; error: string }>;
    prices: any[];
  }> {
    // Verify rate plan ownership
    await this.verifyRatePlanOwnership(ratePlanId, userId);

    if (!data.updates || data.updates.length === 0) {
      throw new Error('No price updates provided');
    }

    if (data.updates.length > 365) {
      throw new Error('Cannot update more than 365 prices at once');
    }

    const results: any[] = [];
    const errors: Array<{ date: Date; error: string }> = [];
    let successCount = 0;
    let skippedCount = 0;

    // Validate all updates first
    for (const update of data.updates) {
      try {
        // Validate amount
        if (update.amount <= 0) {
          errors.push({ date: update.date, error: 'Amount must be greater than 0' });
          continue;
        }

        if (update.amount > 99999.99) {
          errors.push({ date: update.date, error: 'Amount cannot exceed AED 99,999.99' });
          continue;
        }

        // Validate date
        if (update.date < new Date(new Date().setHours(0, 0, 0, 0))) {
          errors.push({ date: update.date, error: 'Cannot set prices for past dates' });
          continue;
        }

        // Perform upsert operation
        const price = await prisma.price.upsert({
          where: {
            ratePlanId_date: {
              ratePlanId,
              date: update.date,
            },
          },
          update: {
            amount: new Decimal(update.amount),
          },
          create: {
            ratePlanId,
            date: update.date,
            amount: new Decimal(update.amount),
          },
          include: {
            ratePlan: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        });

        results.push({
          id: price.id,
          date: price.date,
          amount: parseFloat(price.amount.toString()),
          ratePlan: price.ratePlan,
          createdAt: price.createdAt,
          updatedAt: price.updatedAt,
        });

        successCount++;
      } catch (error: any) {
        errors.push({ date: update.date, error: error.message || 'Unknown error' });
      }
    }

    return {
      success: successCount,
      skipped: skippedCount,
      errors,
      prices: results,
    };
  }

  /**
   * Update a specific price
   */
  async updatePrice(
    priceId: string, 
    userId: string, 
    data: PriceUpdateData
  ): Promise<any> {
    // Verify ownership through price -> ratePlan -> property
    const existingPrice = await prisma.price.findFirst({
      where: {
        id: priceId,
        ratePlan: {
          property: {
            ownerId: userId,
          },
        },
      },
      include: {
        ratePlan: {
          include: {
            property: {
              select: {
                propertyId: true,
                name: true,
                ownerId: true,
              }
            }
          }
        }
      }
    });

    if (!existingPrice) {
      throw new Error('Price not found or you do not have permission to update it');
    }

    // Validate amount
    if (data.amount <= 0) {
      throw new Error('Price amount must be greater than 0');
    }

    if (data.amount > 99999.99) {
      throw new Error('Price amount cannot exceed AED 99,999.99');
    }

    // Validate date (cannot update prices for past dates)
    if (existingPrice.date < new Date(new Date().setHours(0, 0, 0, 0))) {
      throw new Error('Cannot update prices for past dates');
    }

    const updatedPrice = await prisma.price.update({
      where: { id: priceId },
      data: {
        amount: new Decimal(data.amount),
      },
      include: {
        ratePlan: {
          select: {
            id: true,
            name: true,
            adjustmentType: true,
            adjustmentValue: true,
            property: {
              select: {
                propertyId: true,
                name: true,
              }
            }
          }
        }
      }
    });

    return {
      id: updatedPrice.id,
      date: updatedPrice.date,
      amount: parseFloat(updatedPrice.amount.toString()),
      ratePlan: updatedPrice.ratePlan,
      createdAt: updatedPrice.createdAt,
      updatedAt: updatedPrice.updatedAt,
    };
  }

  /**
   * Delete a specific price
   */
  async deletePrice(priceId: string, userId: string): Promise<void> {
    // Verify ownership through price -> ratePlan -> property
    const existingPrice = await prisma.price.findFirst({
      where: {
        id: priceId,
        ratePlan: {
          property: {
            ownerId: userId,
          },
        },
      },
    });

    if (!existingPrice) {
      throw new Error('Price not found or you do not have permission to delete it');
    }

    // Validate date (cannot delete prices for past dates)
    if (existingPrice.date < new Date(new Date().setHours(0, 0, 0, 0))) {
      throw new Error('Cannot delete prices for past dates');
    }

    await prisma.price.delete({
      where: { id: priceId },
    });
  }

  /**
   * Bulk delete prices for a date range
   */
  async bulkDeletePrices(
    ratePlanId: string, 
    userId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<{ deletedCount: number }> {
    // Verify rate plan ownership
    await this.verifyRatePlanOwnership(ratePlanId, userId);

    // Validate dates
    if (startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }

    if (startDate < new Date(new Date().setHours(0, 0, 0, 0))) {
      throw new Error('Cannot delete prices for past dates');
    }

    // Calculate date range to prevent excessive deletions
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 365) {
      throw new Error('Cannot delete prices for more than 365 days at once');
    }

    const deleteResult = await prisma.price.deleteMany({
      where: {
        ratePlanId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return { deletedCount: deleteResult.count };
  }

  /**
   * Get price statistics for a rate plan
   */
  async getPriceStatistics(
    ratePlanId: string, 
    userId: string, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<{
    totalPrices: number;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    priceRange: {
      start: Date | null;
      end: Date | null;
    };
  }> {
    // Verify rate plan ownership
    await this.verifyRatePlanOwnership(ratePlanId, userId);

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = startDate;
    }
    if (endDate) {
      dateFilter.lte = endDate;
    }

    const aggregateResult = await prisma.price.aggregate({
      where: {
        ratePlanId,
        ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
      },
      _count: true,
      _avg: { amount: true },
      _min: { amount: true, date: true },
      _max: { amount: true, date: true },
    });

    return {
      totalPrices: aggregateResult._count || 0,
      averagePrice: aggregateResult._avg.amount ? parseFloat(aggregateResult._avg.amount.toString()) : 0,
      minPrice: aggregateResult._min.amount ? parseFloat(aggregateResult._min.amount.toString()) : 0,
      maxPrice: aggregateResult._max.amount ? parseFloat(aggregateResult._max.amount.toString()) : 0,
      priceRange: {
        start: aggregateResult._min.date,
        end: aggregateResult._max.date,
      },
    };
  }

  /**
   * Get price gaps (dates without specific pricing) for a rate plan
   */
  async getPriceGaps(
    ratePlanId: string, 
    userId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<Date[]> {
    // Verify rate plan ownership
    await this.verifyRatePlanOwnership(ratePlanId, userId);

    // Validate dates
    if (startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }

    // Calculate date range to prevent excessive processing
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 365) {
      throw new Error('Cannot check price gaps for more than 365 days at once');
    }

    // Get existing prices in the date range
    const existingPrices = await prisma.price.findMany({
      where: {
        ratePlanId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: { date: true },
    });

    // Create a set of existing price dates for fast lookup
    const existingDates = new Set(
      existingPrices.map(price => price.date.toDateString())
    );

    // Generate all dates in range and find gaps
    const gaps: Date[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      if (!existingDates.has(currentDate.toDateString())) {
        gaps.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return gaps;
  }

  /**
   * Copy prices from one date range to another (useful for seasonal patterns)
   */
  async copyPrices(
    ratePlanId: string, 
    userId: string, 
    sourceStartDate: Date, 
    sourceEndDate: Date, 
    targetStartDate: Date
  ): Promise<{ copiedCount: number; errors: Array<{ date: Date; error: string }> }> {
    // Verify rate plan ownership
    await this.verifyRatePlanOwnership(ratePlanId, userId);

    // Validate dates
    if (sourceStartDate >= sourceEndDate) {
      throw new Error('Source start date must be before source end date');
    }

    // Calculate target end date
    const daysDiff = Math.ceil((sourceEndDate.getTime() - sourceStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const targetEndDate = new Date(targetStartDate);
    targetEndDate.setDate(targetEndDate.getDate() + daysDiff);

    // Prevent copying to past dates
    if (targetStartDate < new Date(new Date().setHours(0, 0, 0, 0))) {
      throw new Error('Cannot copy prices to past dates');
    }

    // Get source prices
    const sourcePrices = await prisma.price.findMany({
      where: {
        ratePlanId,
        date: {
          gte: sourceStartDate,
          lte: sourceEndDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    if (sourcePrices.length === 0) {
      throw new Error('No prices found in the source date range');
    }

    let copiedCount = 0;
    const errors: Array<{ date: Date; error: string }> = [];

    // Copy each price to the corresponding target date
    for (const sourcePrice of sourcePrices) {
      try {
        // Calculate target date
        const dayOffset = Math.ceil((sourcePrice.date.getTime() - sourceStartDate.getTime()) / (1000 * 60 * 60 * 24));
        const targetDate = new Date(targetStartDate);
        targetDate.setDate(targetDate.getDate() + dayOffset);

        // Upsert the price
        await prisma.price.upsert({
          where: {
            ratePlanId_date: {
              ratePlanId,
              date: targetDate,
            },
          },
          update: {
            amount: sourcePrice.amount,
          },
          create: {
            ratePlanId,
            date: targetDate,
            amount: sourcePrice.amount,
          },
        });

        copiedCount++;
      } catch (error: any) {
        errors.push({ 
          date: sourcePrice.date, 
          error: error.message || 'Unknown error during copy operation' 
        });
      }
    }

    return { copiedCount, errors };
  }

  /**
   * Verify rate plan ownership through property
   */
  private async verifyRatePlanOwnership(ratePlanId: string, userId: string): Promise<any> {
    const ratePlan = await prisma.ratePlan.findFirst({
      where: {
        id: ratePlanId,
        property: {
          ownerId: userId,
        },
      },
      include: {
        property: {
          select: {
            propertyId: true,
            name: true,
            ownerId: true,
          }
        }
      }
    });

    if (!ratePlan) {
      throw new Error('Rate plan not found or you do not have permission to access it');
    }

    return ratePlan;
  }
}

export default new PriceService();