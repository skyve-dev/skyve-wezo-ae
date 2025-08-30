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

  async getPublicAvailability(
    propertyId: string,
    startDate?: string,
    endDate?: string
  ): Promise<any[]> {
    // First verify property exists (no ownership check for public access)
    const property = await prisma.property.findUnique({
      where: { propertyId },
      select: { propertyId: true }
    });

    if (!property) {
      throw new Error('Property not found');
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
      select: {
        date: true,
        isAvailable: true
      }
    });

    return availability;
  }

  async checkBookingAvailability(
    propertyId: string,
    checkInDate: Date,
    checkOutDate: Date,
    numGuests: number
  ): Promise<any> {
    // Verify property exists and check maximum guest capacity
    const property = await prisma.property.findUnique({
      where: { propertyId },
      select: { propertyId: true, maximumGuest: true, name: true }
    });

    if (!property) {
      throw new Error('Property not found');
    }

    if (numGuests > property.maximumGuest) {
      return {
        isAvailable: false,
        reason: `Maximum ${property.maximumGuest} guests allowed`,
        availableFromDate: null,
        suggestedCheckOut: null
      };
    }

    // Check each date in the range for availability
    const dateRange = [];
    const currentDate = new Date(checkInDate);
    while (currentDate < checkOutDate) {
      dateRange.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Get availability for all dates
    const availabilityRecords = await prisma.availability.findMany({
      where: {
        propertyId,
        date: {
          gte: checkInDate,
          lt: checkOutDate
        }
      }
    });

    // Check if all dates are available
    const unavailableDates = [];
    for (const date of dateRange) {
      const availRecord = availabilityRecords.find(av => 
        av.date.toDateString() === date.toDateString()
      );
      
      // If no record exists, assume available. If record exists and isAvailable is false, it's unavailable
      if (availRecord && !availRecord.isAvailable) {
        unavailableDates.push(date.toISOString().split('T')[0]);
      }
    }

    return {
      isAvailable: unavailableDates.length === 0,
      unavailableDates,
      checkInDate: checkInDate.toISOString().split('T')[0],
      checkOutDate: checkOutDate.toISOString().split('T')[0],
      numGuests,
      reason: unavailableDates.length > 0 ? 'Some dates are not available' : null
    };
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