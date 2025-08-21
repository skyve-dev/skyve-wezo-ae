import prisma from '../config/database';

export class AvailabilityService {
  async getAvailability(
    propertyId: string,
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<any[]> {
    const property = await prisma.property.findFirst({
      where: {
        propertyId,
        ownerId: userId,
      },
    });

    if (!property) {
      throw new Error('Property not found or you do not have permission to view it');
    }

    const whereClause: any = { propertyId };

    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      whereClause.date = {
        gte: new Date(startDate),
      };
    }

    const availability = await prisma.availability.findMany({
      where: whereClause,
      orderBy: { date: 'asc' },
    });

    return availability;
  }

  async updateSingleAvailability(
    propertyId: string,
    userId: string,
    date: string,
    isAvailable: boolean,
    _reason?: string
  ): Promise<any> {
    const property = await prisma.property.findFirst({
      where: {
        propertyId,
        ownerId: userId,
      },
    });

    if (!property) {
      throw new Error('Property not found or you do not have permission to update it');
    }

    const dateObj = new Date(date);
    dateObj.setUTCHours(0, 0, 0, 0);

    const availability = await prisma.availability.upsert({
      where: {
        propertyId_date: {
          propertyId,
          date: dateObj,
        },
      },
      update: {
        isAvailable,
      },
      create: {
        propertyId,
        date: dateObj,
        isAvailable,
      },
    });

    return availability;
  }

  async bulkUpdateAvailability(
    propertyId: string,
    userId: string,
    updates: Array<{ date: string; isAvailable: boolean; reason?: string }>
  ): Promise<{ updated: number; failed: any[] }> {
    const property = await prisma.property.findFirst({
      where: {
        propertyId,
        ownerId: userId,
      },
    });

    if (!property) {
      throw new Error('Property not found or you do not have permission to update it');
    }

    let updated = 0;
    const failed: any[] = [];

    for (const update of updates) {
      try {
        const dateObj = new Date(update.date);
        dateObj.setUTCHours(0, 0, 0, 0);

        await prisma.availability.upsert({
          where: {
            propertyId_date: {
              propertyId,
              date: dateObj,
            },
          },
          update: {
            isAvailable: update.isAvailable,
          },
          create: {
            propertyId,
            date: dateObj,
            isAvailable: update.isAvailable,
          },
        });
        updated++;
      } catch (error) {
        failed.push({ date: update.date, error: 'Failed to update' });
      }
    }

    return { updated, failed };
  }
}

export default new AvailabilityService();