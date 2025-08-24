import prisma from '../config/database';

export class RatePlanService {
  async createRatePlan(propertyId: string, userId: string, data: any): Promise<any> {
    const property = await prisma.property.findFirst({
      where: {
        propertyId,
        ownerId: userId,
      },
    });

    if (!property) {
      throw new Error('Property not found or you do not have permission to update it');
    }

    const ratePlan = await prisma.ratePlan.create({
      data: {
        propertyId,
        name: data.name,
        type: data.type,
        description: data.description,
        cancellationPolicy: data.cancellationPolicy,
        includesBreakfast: data.includesBreakfast || false,
        percentage: data.percentage || 0,
        restrictions: data.restrictions
          ? {
              create: data.restrictions.map((r: any) => ({
                propertyId,
                type: r.type,
                value: r.value,
                startDate: r.startDate ? new Date(r.startDate) : undefined,
                endDate: r.endDate ? new Date(r.endDate) : undefined,
              })),
            }
          : undefined,
        prices: data.prices
          ? {
              create: data.prices.map((p: any) => ({
                date: new Date(p.date),
                amount: p.basePrice,
              })),
            }
          : undefined,
      },
      include: {
        restrictions: true,
        prices: {
          take: 10,
          orderBy: { date: 'asc' },
        },
      },
    });

    return ratePlan;
  }

  async getRatePlans(propertyId: string, userId: string): Promise<any[]> {
    const property = await prisma.property.findFirst({
      where: {
        propertyId,
        ownerId: userId,
      },
    });

    if (!property) {
      throw new Error('Property not found or you do not have permission to view it');
    }

    const ratePlans = await prisma.ratePlan.findMany({
      where: { propertyId },
      include: {
        restrictions: true,
        prices: {
          take: 30,
          orderBy: { date: 'asc' },
        },
        _count: {
          select: { reservations: true },
        },
      },
    });

    return ratePlans;
  }

  async getRatePlan(propertyId: string, ratePlanId: string, userId: string): Promise<any> {
    const ratePlan = await prisma.ratePlan.findFirst({
      where: {
        id: ratePlanId,
        propertyId,
        property: {
          ownerId: userId,
        },
      },
      include: {
        restrictions: true,
        prices: {
          orderBy: { date: 'asc' },
        },
        _count: {
          select: { reservations: true },
        },
      },
    });

    if (!ratePlan) {
      throw new Error('Rate plan not found or you do not have permission to view it');
    }

    return ratePlan;
  }

  async updateRatePlan(
    propertyId: string,
    ratePlanId: string,
    userId: string,
    data: any
  ): Promise<any> {
    const existingRatePlan = await prisma.ratePlan.findFirst({
      where: {
        id: ratePlanId,
        propertyId,
        property: {
          ownerId: userId,
        },
      },
    });

    if (!existingRatePlan) {
      throw new Error('Rate plan not found or you do not have permission to update it');
    }

    const ratePlan = await prisma.ratePlan.update({
      where: { id: ratePlanId },
      data: {
        name: data.name,
        type: data.type,
        description: data.description,
        cancellationPolicy: data.cancellationPolicy,
        includesBreakfast: data.includesBreakfast,
        percentage: data.percentage,
      },
      include: {
        restrictions: true,
        prices: {
          take: 30,
          orderBy: { date: 'asc' },
        },
      },
    });

    return ratePlan;
  }

  async deleteRatePlan(propertyId: string, ratePlanId: string, userId: string): Promise<void> {
    const ratePlan = await prisma.ratePlan.findFirst({
      where: {
        id: ratePlanId,
        propertyId,
        property: {
          ownerId: userId,
        },
      },
      include: {
        _count: {
          select: { reservations: true },
        },
      },
    });

    if (!ratePlan) {
      throw new Error('Rate plan not found or you do not have permission to delete it');
    }

    if (ratePlan._count.reservations > 0) {
      throw new Error('Cannot delete rate plan with existing reservations');
    }

    await prisma.$transaction([
      prisma.price.deleteMany({ where: { ratePlanId } }),
      prisma.restriction.deleteMany({ where: { ratePlanId } }),
      prisma.ratePlan.delete({ where: { id: ratePlanId } }),
    ]);
  }

  async updateRatePlanPrices(
    propertyId: string,
    ratePlanId: string,
    userId: string,
    prices: Array<{ date: string; basePrice: number; currency?: string }>
  ): Promise<any> {
    const ratePlan = await prisma.ratePlan.findFirst({
      where: {
        id: ratePlanId,
        propertyId,
        property: {
          ownerId: userId,
        },
      },
    });

    if (!ratePlan) {
      throw new Error('Rate plan not found or you do not have permission to update it');
    }

    const priceUpdates = [];
    for (const price of prices) {
      const dateObj = new Date(price.date);
      dateObj.setUTCHours(0, 0, 0, 0);

      priceUpdates.push(
        prisma.price.upsert({
          where: {
            ratePlanId_date: {
              ratePlanId,
              date: dateObj,
            },
          },
          update: {
            amount: price.basePrice,
          },
          create: {
            ratePlanId,
            date: dateObj,
            amount: price.basePrice,
          },
        })
      );
    }

    const updatedPrices = await prisma.$transaction(priceUpdates);

    return {
      updatedCount: updatedPrices.length,
      prices: updatedPrices,
    };
  }

  async updateRatePlanRestrictions(
    propertyId: string,
    ratePlanId: string,
    userId: string,
    restrictions: Array<{
      type: string;
      value: number;
      startDate?: string;
      endDate?: string;
    }>
  ): Promise<any> {
    const ratePlan = await prisma.ratePlan.findFirst({
      where: {
        id: ratePlanId,
        propertyId,
        property: {
          ownerId: userId,
        },
      },
    });

    if (!ratePlan) {
      throw new Error('Rate plan not found or you do not have permission to update it');
    }

    await prisma.restriction.deleteMany({
      where: { ratePlanId },
    });

    await prisma.restriction.createMany({
      data: restrictions.map((r) => ({
        ratePlanId,
        propertyId,
        type: r.type as any,
        value: r.value,
        startDate: r.startDate ? new Date(r.startDate) : undefined,
        endDate: r.endDate ? new Date(r.endDate) : undefined,
      })),
    });

    const updatedRestrictions = await prisma.restriction.findMany({
      where: { ratePlanId },
    });

    return {
      restrictions: updatedRestrictions,
    };
  }
}

export default new RatePlanService();