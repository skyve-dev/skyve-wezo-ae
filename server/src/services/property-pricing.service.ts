import prisma from '../config/database';
import { Decimal } from '@prisma/client/runtime/library';

export interface WeeklyPricingData {
  // Full day prices
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
  
  // Half day prices
  halfDayMonday: number;
  halfDayTuesday: number;
  halfDayWednesday: number;
  halfDayThursday: number;
  halfDayFriday: number;
  halfDaySaturday: number;
  halfDaySunday: number;
}

export interface DateOverrideData {
  date: Date;
  price: number;          // Full day price
  halfDayPrice?: number;  // Optional half day price
  reason?: string;        // Optional reason for override
}

export interface PricingCalendarDay {
  date: Date;
  fullDayPrice: number;
  halfDayPrice: number;
  isOverride: boolean;
  reason?: string;
  dayOfWeek: string;
}

export class PropertyPricingService {

  /**
   * Get base price for any date and duration
   */
  async getBasePrice(
    propertyId: string, 
    date: Date, 
    isHalfDay: boolean = false
  ): Promise<number> {
    // 1. Check for date-specific override first
    const override = await prisma.datePriceOverride.findUnique({
      where: {
        propertyId_date: { propertyId, date }
      }
    });
    
    if (override) {
      if (isHalfDay) {
        // Use half-day override or fallback to 70% of full day
        return override.halfDayPrice ? 
          Number(override.halfDayPrice) : 
          Math.round(Number(override.price) * 0.7 * 100) / 100;
      }
      return Number(override.price);
    }
    
    // 2. Use weekly base pricing
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const pricing = await prisma.propertyPricing.findUnique({
      where: { propertyId }
    });
    
    if (!pricing) {
      throw new Error(`No base pricing configured for property ${propertyId}`);
    }
    
    const dayPriceMap: Record<number, Decimal> = {
      0: isHalfDay ? pricing.halfDayPriceSunday : pricing.priceSunday,
      1: isHalfDay ? pricing.halfDayPriceMonday : pricing.priceMonday,
      2: isHalfDay ? pricing.halfDayPriceTuesday : pricing.priceTuesday,
      3: isHalfDay ? pricing.halfDayPriceWednesday : pricing.priceWednesday,
      4: isHalfDay ? pricing.halfDayPriceThursday : pricing.priceThursday,
      5: isHalfDay ? pricing.halfDayPriceFriday : pricing.priceFriday,
      6: isHalfDay ? pricing.halfDayPriceSaturday : pricing.priceSaturday
    };
    
    return Number(dayPriceMap[dayOfWeek]);
  }

  /**
   * Set weekly pricing for both full-day and half-day
   */
  async setWeeklyPricing(
    propertyId: string,
    userId: string,
    prices: WeeklyPricingData
  ): Promise<any> {
    // Verify property ownership
    await this.verifyPropertyOwnership(propertyId, userId);

    // Validate all prices are positive
    const allPrices = Object.values(prices);
    if (allPrices.some(price => price <= 0 || price > 99999.99)) {
      throw new Error('All prices must be between 0.01 and 99,999.99');
    }

    // Validate half-day prices are typically less than full-day prices
    const dayPairs = [
      [prices.monday, prices.halfDayMonday],
      [prices.tuesday, prices.halfDayTuesday],
      [prices.wednesday, prices.halfDayWednesday],
      [prices.thursday, prices.halfDayThursday],
      [prices.friday, prices.halfDayFriday],
      [prices.saturday, prices.halfDaySaturday],
      [prices.sunday, prices.halfDaySunday]
    ];

    for (const [fullDay, halfDay] of dayPairs) {
      if (halfDay > fullDay) {
        throw new Error('Half-day prices should not exceed full-day prices');
      }
    }

    const result = await prisma.propertyPricing.upsert({
      where: { propertyId },
      create: {
        propertyId,
        priceMonday: new Decimal(prices.monday),
        priceTuesday: new Decimal(prices.tuesday),
        priceWednesday: new Decimal(prices.wednesday),
        priceThursday: new Decimal(prices.thursday),
        priceFriday: new Decimal(prices.friday),
        priceSaturday: new Decimal(prices.saturday),
        priceSunday: new Decimal(prices.sunday),
        halfDayPriceMonday: new Decimal(prices.halfDayMonday),
        halfDayPriceTuesday: new Decimal(prices.halfDayTuesday),
        halfDayPriceWednesday: new Decimal(prices.halfDayWednesday),
        halfDayPriceThursday: new Decimal(prices.halfDayThursday),
        halfDayPriceFriday: new Decimal(prices.halfDayFriday),
        halfDayPriceSaturday: new Decimal(prices.halfDaySaturday),
        halfDayPriceSunday: new Decimal(prices.halfDaySunday)
      },
      update: {
        priceMonday: new Decimal(prices.monday),
        priceTuesday: new Decimal(prices.tuesday),
        priceWednesday: new Decimal(prices.wednesday),
        priceThursday: new Decimal(prices.thursday),
        priceFriday: new Decimal(prices.friday),
        priceSaturday: new Decimal(prices.saturday),
        priceSunday: new Decimal(prices.sunday),
        halfDayPriceMonday: new Decimal(prices.halfDayMonday),
        halfDayPriceTuesday: new Decimal(prices.halfDayTuesday),
        halfDayPriceWednesday: new Decimal(prices.halfDayWednesday),
        halfDayPriceThursday: new Decimal(prices.halfDayThursday),
        halfDayPriceFriday: new Decimal(prices.halfDayFriday),
        halfDayPriceSaturday: new Decimal(prices.halfDaySaturday),
        halfDayPriceSunday: new Decimal(prices.halfDaySunday)
      }
    });

    return {
      id: result.id,
      propertyId: result.propertyId,
      fullDay: {
        monday: Number(result.priceMonday),
        tuesday: Number(result.priceTuesday),
        wednesday: Number(result.priceWednesday),
        thursday: Number(result.priceThursday),
        friday: Number(result.priceFriday),
        saturday: Number(result.priceSaturday),
        sunday: Number(result.priceSunday)
      },
      halfDay: {
        monday: Number(result.halfDayPriceMonday),
        tuesday: Number(result.halfDayPriceTuesday),
        wednesday: Number(result.halfDayPriceWednesday),
        thursday: Number(result.halfDayPriceThursday),
        friday: Number(result.halfDayPriceFriday),
        saturday: Number(result.halfDayPriceSaturday),
        sunday: Number(result.halfDayPriceSunday)
      },
      currency: result.currency,
      updatedAt: result.updatedAt
    };
  }

  /**
   * Set holiday/event date overrides
   */
  async setDateOverrides(
    propertyId: string,
    userId: string,
    overrides: DateOverrideData[]
  ): Promise<any[]> {
    // Verify property ownership
    await this.verifyPropertyOwnership(propertyId, userId);

    if (!overrides || overrides.length === 0) {
      throw new Error('No override data provided');
    }

    if (overrides.length > 365) {
      throw new Error('Cannot set more than 365 date overrides at once');
    }

    // Validate all overrides
    for (const override of overrides) {
      if (override.price <= 0 || override.price > 99999.99) {
        throw new Error(`Price for ${override.date.toDateString()} must be between 0.01 and 99,999.99`);
      }
      
      if (override.halfDayPrice && (override.halfDayPrice <= 0 || override.halfDayPrice > 99999.99)) {
        throw new Error(`Half-day price for ${override.date.toDateString()} must be between 0.01 and 99,999.99`);
      }

      if (override.halfDayPrice && override.halfDayPrice > override.price) {
        throw new Error(`Half-day price for ${override.date.toDateString()} should not exceed full-day price`);
      }

      // Prevent setting overrides for past dates
      if (override.date < new Date(new Date().setHours(0, 0, 0, 0))) {
        throw new Error(`Cannot set price override for past date: ${override.date.toDateString()}`);
      }
    }

    const results = await prisma.$transaction(
      overrides.map(override =>
        prisma.datePriceOverride.upsert({
          where: {
            propertyId_date: { propertyId, date: override.date }
          },
          create: {
            propertyId,
            date: override.date,
            price: new Decimal(override.price),
            halfDayPrice: override.halfDayPrice ? new Decimal(override.halfDayPrice) : null,
            reason: override.reason
          },
          update: {
            price: new Decimal(override.price),
            halfDayPrice: override.halfDayPrice ? new Decimal(override.halfDayPrice) : null,
            reason: override.reason
          }
        })
      )
    );

    return results.map(result => ({
      id: result.id,
      date: result.date,
      price: Number(result.price),
      halfDayPrice: result.halfDayPrice ? Number(result.halfDayPrice) : null,
      reason: result.reason,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    }));
  }

  /**
   * Get pricing calendar for a date range
   */
  async getPricingCalendar(
    propertyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<PricingCalendarDay[]> {
    // Validate date range
    if (startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }

    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 365) {
      throw new Error('Cannot retrieve pricing for more than 365 days at once');
    }

    // Get property base pricing
    const basePricing = await prisma.propertyPricing.findUnique({
      where: { propertyId }
    });

    if (!basePricing) {
      throw new Error(`No base pricing configured for property ${propertyId}`);
    }

    // Get all date overrides in the range
    const overrides = await prisma.datePriceOverride.findMany({
      where: {
        propertyId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Create override lookup map
    const overrideMap = new Map(
      overrides.map(override => [
        override.date.toDateString(), 
        {
          price: Number(override.price),
          halfDayPrice: override.halfDayPrice ? Number(override.halfDayPrice) : null,
          reason: override.reason
        }
      ])
    );

    // Generate calendar days
    const calendar: PricingCalendarDay[] = [];
    const currentDate = new Date(startDate);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    while (currentDate <= endDate) {
      const dateStr = currentDate.toDateString();
      const dayOfWeek = currentDate.getDay();
      const override = overrideMap.get(dateStr);

      let fullDayPrice: number;
      let halfDayPrice: number;

      if (override) {
        // Use override pricing
        fullDayPrice = override.price;
        halfDayPrice = override.halfDayPrice || Math.round(override.price * 0.7 * 100) / 100;
      } else {
        // Use weekly base pricing
        const dayPriceMap: Record<number, [Decimal, Decimal]> = {
          0: [basePricing.priceSunday, basePricing.halfDayPriceSunday],
          1: [basePricing.priceMonday, basePricing.halfDayPriceMonday],
          2: [basePricing.priceTuesday, basePricing.halfDayPriceTuesday],
          3: [basePricing.priceWednesday, basePricing.halfDayPriceWednesday],
          4: [basePricing.priceThursday, basePricing.halfDayPriceThursday],
          5: [basePricing.priceFriday, basePricing.halfDayPriceFriday],
          6: [basePricing.priceSaturday, basePricing.halfDayPriceSaturday]
        };

        const [fullPrice, halfPrice] = dayPriceMap[dayOfWeek];
        fullDayPrice = Number(fullPrice);
        halfDayPrice = Number(halfPrice);
      }

      calendar.push({
        date: new Date(currentDate),
        fullDayPrice,
        halfDayPrice,
        isOverride: !!override,
        reason: override?.reason || undefined,
        dayOfWeek: dayNames[dayOfWeek]
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return calendar;
  }

  /**
   * Delete date overrides
   */
  async deleteDateOverrides(
    propertyId: string,
    userId: string,
    dates: Date[]
  ): Promise<{ deletedCount: number }> {
    // Verify property ownership
    await this.verifyPropertyOwnership(propertyId, userId);

    if (!dates || dates.length === 0) {
      throw new Error('No dates provided for deletion');
    }

    // Prevent deleting overrides for past dates
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const pastDates = dates.filter(date => date < today);
    if (pastDates.length > 0) {
      throw new Error('Cannot delete price overrides for past dates');
    }

    const result = await prisma.datePriceOverride.deleteMany({
      where: {
        propertyId,
        date: { in: dates }
      }
    });

    return { deletedCount: result.count };
  }

  /**
   * Get weekly pricing for a property
   */
  async getWeeklyPricing(propertyId: string): Promise<any> {
    const pricing = await prisma.propertyPricing.findUnique({
      where: { propertyId }
    });

    if (!pricing) {
      throw new Error(`No pricing configured for property ${propertyId}`);
    }

    return {
      id: pricing.id,
      propertyId: pricing.propertyId,
      fullDay: {
        monday: Number(pricing.priceMonday),
        tuesday: Number(pricing.priceTuesday),
        wednesday: Number(pricing.priceWednesday),
        thursday: Number(pricing.priceThursday),
        friday: Number(pricing.priceFriday),
        saturday: Number(pricing.priceSaturday),
        sunday: Number(pricing.priceSunday)
      },
      halfDay: {
        monday: Number(pricing.halfDayPriceMonday),
        tuesday: Number(pricing.halfDayPriceTuesday),
        wednesday: Number(pricing.halfDayPriceWednesday),
        thursday: Number(pricing.halfDayPriceThursday),
        friday: Number(pricing.halfDayPriceFriday),
        saturday: Number(pricing.halfDayPriceSaturday),
        sunday: Number(pricing.halfDayPriceSunday)
      },
      currency: pricing.currency,
      createdAt: pricing.createdAt,
      updatedAt: pricing.updatedAt
    };
  }

  /**
   * Verify property ownership
   */
  private async verifyPropertyOwnership(propertyId: string, userId: string): Promise<void> {
    const property = await prisma.property.findFirst({
      where: {
        propertyId,
        ownerId: userId
      }
    });

    if (!property) {
      throw new Error('Property not found or you do not have permission to manage it');
    }
  }
}

export default new PropertyPricingService();