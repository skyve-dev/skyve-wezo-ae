import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export class PropertyService {
  async createProperty(data: any, ownerId: string): Promise<any> {
    const {
      name,
      address,
      layout,
      amenities,
      services,
      rules,
      photos,
      bookingType,
      paymentType,
      pricing,
      cancellation,
      aboutTheProperty,
      aboutTheNeighborhood,
      firstDateGuestCanCheckIn,
    } = data;

    const addressData: Prisma.AddressCreateWithoutPropertyInput = {
      apartmentOrFloorNumber: address.apartmentOrFloorNumber,
      countryOrRegion: address.countryOrRegion,
      city: address.city,
      zipCode: address.zipCode,
    };

    if (address.latLong) {
      addressData.latLong = {
        create: {
          latitude: address.latLong.latitude,
          longitude: address.latLong.longitude,
        },
      };
    }

    const propertyData: Prisma.PropertyCreateInput = {
      name,
      owner: {
        connect: { id: ownerId },
      },
      aboutTheProperty,
      aboutTheNeighborhood,
      firstDateGuestCanCheckIn,
      bookingType,
      paymentType,
      maximumGuest: layout.maximumGuest,
      bathrooms: layout.bathrooms,
      allowChildren: layout.allowChildren,
      offerCribs: layout.offerCribs,
      propertySizeSqMtr: layout.propertySizeSqMtr,
      serveBreakfast: services.serveBreakfast,
      parking: services.parking,
      languages: services.languages,
      smokingAllowed: rules.smokingAllowed,
      partiesOrEventsAllowed: rules.partiesOrEventsAllowed,
      petsAllowed: rules.petsAllowed,
      address: {
        create: addressData,
      },
      rooms: layout.rooms ? {
        create: layout.rooms.map((room: any) => ({
          spaceName: room.spaceName,
          beds: {
            create: room.beds?.map((bed: any) => ({
              typeOfBed: bed.typeOfBed,
              numberOfBed: bed.numberOfBed,
            })),
          },
        })),
      } : undefined,
      amenities: amenities ? {
        create: amenities.map((amenity: any) => ({
          name: amenity.name,
          category: amenity.category,
        })),
      } : undefined,
      photos: photos ? {
        create: photos.map((photo: any) => ({
          url: photo.url,
          altText: photo.altText,
          description: photo.description,
          tags: photo.tags || [],
        })),
      } : undefined,
      checkInCheckout: rules?.checkInCheckout
        ? {
            create: {
              checkInFrom: rules.checkInCheckout.checkInFrom,
              checkInUntil: rules.checkInCheckout.checkInUntil,
              checkOutFrom: rules.checkInCheckout.checkOutFrom,
              checkOutUntil: rules.checkInCheckout.checkOutUntil,
            },
          }
        : undefined,
      pricing: pricing
        ? {
            create: {
              currency: pricing.currency,
              ratePerNight: pricing.ratePerNight,
              ratePerNightWeekend: pricing.ratePerNightWeekend,
              discountPercentageForNonRefundableRatePlan:
                pricing.discountPercentageForNonRefundableRatePlan,
              discountPercentageForWeeklyRatePlan:
                pricing.discountPercentageForWeeklyRatePlan,
              promotion: pricing.promotion
                ? {
                    create: {
                      type: pricing.promotion.type,
                      percentage: pricing.promotion.percentage,
                      description: pricing.promotion.description,
                    },
                  }
                : undefined,
              pricePerGroupSize: pricing.pricePerGroupSize
                ? {
                    create: pricing.pricePerGroupSize.map((pgs: any) => ({
                      groupSize: pgs.groupSize,
                      ratePerNight: pgs.ratePerNight,
                    })),
                  }
                : undefined,
            },
          }
        : undefined,
      cancellation: cancellation
        ? {
            create: {
              daysBeforeArrivalFreeToCancel: cancellation.daysBeforeArrivalFreeToCancel,
              waiveCancellationFeeAccidentalBookings:
                cancellation.waiveCancellationFeeAccidentalBookings,
            },
          }
        : undefined,
    };

    const property = await prisma.property.create({
      data: propertyData,
      include: {
        address: {
          include: {
            latLong: true,
          },
        },
        rooms: {
          include: {
            beds: true,
          },
        },
        amenities: true,
        photos: true,
        checkInCheckout: true,
        pricing: {
          include: {
            promotion: true,
            pricePerGroupSize: true,
          },
        },
        cancellation: true,
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return property;
  }

  async updateProperty(propertyId: string, data: any, ownerId: string) {
    const existingProperty = await prisma.property.findFirst({
      where: {
        propertyId,
        ownerId,
      },
    });

    if (!existingProperty) {
      throw new Error('Property not found or you do not have permission to update it');
    }

    const {
      name,
      bookingType,
      paymentType,
      aboutTheProperty,
      aboutTheNeighborhood,
      firstDateGuestCanCheckIn,
    } = data;

    const property = await prisma.property.update({
      where: { propertyId },
      data: {
        name,
        bookingType,
        paymentType,
        aboutTheProperty,
        aboutTheNeighborhood,
        firstDateGuestCanCheckIn,
      },
      include: {
        address: {
          include: {
            latLong: true,
          },
        },
        rooms: {
          include: {
            beds: true,
          },
        },
        amenities: true,
        photos: true,
        checkInCheckout: true,
        pricing: {
          include: {
            promotion: true,
            pricePerGroupSize: true,
          },
        },
        cancellation: true,
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return property;
  }

  async updatePropertyLayout(propertyId: string, layout: any, ownerId: string) {
    const existingProperty = await prisma.property.findFirst({
      where: {
        propertyId,
        ownerId,
      },
      include: {
        rooms: true,
      },
    });

    if (!existingProperty) {
      throw new Error('Property not found or you do not have permission to update it');
    }

    await prisma.room.deleteMany({
      where: { propertyId },
    });

    const property = await prisma.property.update({
      where: { propertyId },
      data: {
        maximumGuest: layout.maximumGuest,
        bathrooms: layout.bathrooms,
        allowChildren: layout.allowChildren,
        offerCribs: layout.offerCribs,
        propertySizeSqMtr: layout.propertySizeSqMtr,
        rooms: {
          create: layout.rooms?.map((room: any) => ({
            spaceName: room.spaceName,
            beds: {
              create: room.beds?.map((bed: any) => ({
                typeOfBed: bed.typeOfBed,
                numberOfBed: bed.numberOfBed,
              })),
            },
          })),
        },
      },
      include: {
        rooms: {
          include: {
            beds: true,
          },
        },
      },
    });

    return property;
  }

  async updatePropertyAmenities(propertyId: string, amenities: any[], ownerId: string) {
    const existingProperty = await prisma.property.findFirst({
      where: {
        propertyId,
        ownerId,
      },
    });

    if (!existingProperty) {
      throw new Error('Property not found or you do not have permission to update it');
    }

    await prisma.amenity.deleteMany({
      where: { propertyId },
    });

    const property = await prisma.property.update({
      where: { propertyId },
      data: {
        amenities: {
          create: amenities.map((amenity) => ({
            name: amenity.name,
            category: amenity.category,
          })),
        },
      },
      include: {
        amenities: true,
      },
    });

    return property;
  }

  async updatePropertyServices(propertyId: string, services: any, ownerId: string) {
    const existingProperty = await prisma.property.findFirst({
      where: {
        propertyId,
        ownerId,
      },
    });

    if (!existingProperty) {
      throw new Error('Property not found or you do not have permission to update it');
    }

    const property = await prisma.property.update({
      where: { propertyId },
      data: {
        serveBreakfast: services.serveBreakfast,
        parking: services.parking,
        languages: services.languages,
      },
    });

    return property;
  }

  async updatePropertyRules(propertyId: string, rules: any, ownerId: string) {
    const existingProperty = await prisma.property.findFirst({
      where: {
        propertyId,
        ownerId,
      },
    });

    if (!existingProperty) {
      throw new Error('Property not found or you do not have permission to update it');
    }

    if (rules.checkInCheckout) {
      await prisma.checkInOutTimes.deleteMany({
        where: { propertyId },
      });
    }

    const property = await prisma.property.update({
      where: { propertyId },
      data: {
        smokingAllowed: rules.smokingAllowed,
        partiesOrEventsAllowed: rules.partiesOrEventsAllowed,
        petsAllowed: rules.petsAllowed,
        checkInCheckout: rules.checkInCheckout
          ? {
              create: {
                checkInFrom: rules.checkInCheckout.checkInFrom,
                checkInUntil: rules.checkInCheckout.checkInUntil,
                checkOutFrom: rules.checkInCheckout.checkOutFrom,
                checkOutUntil: rules.checkInCheckout.checkOutUntil,
              },
            }
          : undefined,
      },
      include: {
        checkInCheckout: true,
      },
    });

    return property;
  }

  async updatePropertyPricing(propertyId: string, pricing: any, ownerId: string) {
    const existingProperty = await prisma.property.findFirst({
      where: {
        propertyId,
        ownerId,
      },
      include: {
        pricing: true,
      },
    });

    if (!existingProperty) {
      throw new Error('Property not found or you do not have permission to update it');
    }

    // Delete existing pricing and related records in correct order
    if (existingProperty.pricing) {
      await prisma.pricePerGroupSize.deleteMany({
        where: { pricingId: existingProperty.pricing.id },
      });
      await prisma.promotion.deleteMany({
        where: { pricingId: existingProperty.pricing.id },
      });
      await prisma.pricing.delete({
        where: { id: existingProperty.pricing.id },
      });
    }

    const property = await prisma.property.update({
      where: { propertyId },
      data: {
        pricing: {
          create: {
            currency: pricing.currency,
            ratePerNight: pricing.ratePerNight,
            ratePerNightWeekend: pricing.ratePerNightWeekend,
            discountPercentageForNonRefundableRatePlan:
              pricing.discountPercentageForNonRefundableRatePlan,
            discountPercentageForWeeklyRatePlan:
              pricing.discountPercentageForWeeklyRatePlan,
            promotion: pricing.promotion
              ? {
                  create: {
                    type: pricing.promotion.type,
                    percentage: pricing.promotion.percentage,
                    description: pricing.promotion.description,
                  },
                }
              : undefined,
            pricePerGroupSize: pricing.pricePerGroupSize
              ? {
                  create: pricing.pricePerGroupSize.map((pgs: any) => ({
                    groupSize: pgs.groupSize,
                    ratePerNight: pgs.ratePerNight,
                  })),
                }
              : undefined,
          },
        },
      },
      include: {
        pricing: {
          include: {
            promotion: true,
            pricePerGroupSize: true,
          },
        },
      },
    });

    return property;
  }

  async updatePropertyCancellation(propertyId: string, cancellation: any, ownerId: string) {
    const existingProperty = await prisma.property.findFirst({
      where: {
        propertyId,
        ownerId,
      },
      include: {
        cancellation: true,
      },
    });

    if (!existingProperty) {
      throw new Error('Property not found or you do not have permission to update it');
    }

    // Delete existing cancellation if exists
    if (existingProperty.cancellation) {
      await prisma.cancellation.delete({
        where: { id: existingProperty.cancellation.id },
      });
    }

    const property = await prisma.property.update({
      where: { propertyId },
      data: {
        cancellation: {
          create: {
            daysBeforeArrivalFreeToCancel: cancellation.daysBeforeArrivalFreeToCancel,
            waiveCancellationFeeAccidentalBookings:
              cancellation.waiveCancellationFeeAccidentalBookings,
          },
        },
      },
      include: {
        cancellation: true,
      },
    });

    return property;
  }

  async getPropertyById(propertyId: string) {
    const property = await prisma.property.findUnique({
      where: { propertyId },
      include: {
        address: {
          include: {
            latLong: true,
          },
        },
        rooms: {
          include: {
            beds: true,
          },
        },
        amenities: true,
        photos: true,
        checkInCheckout: true,
        pricing: {
          include: {
            promotion: true,
            pricePerGroupSize: true,
          },
        },
        cancellation: true,
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return property;
  }

  async getPropertiesByOwner(ownerId: string) {
    const properties = await prisma.property.findMany({
      where: { ownerId },
      include: {
        address: {
          include: {
            latLong: true,
          },
        },
        rooms: {
          include: {
            beds: true,
          },
        },
        amenities: true,
        photos: true,
        checkInCheckout: true,
        pricing: {
          include: {
            promotion: true,
            pricePerGroupSize: true,
          },
        },
        cancellation: true,
      },
    });

    return properties;
  }

  async deleteProperty(propertyId: string, ownerId: string) {
    const existingProperty = await prisma.property.findFirst({
      where: {
        propertyId,
        ownerId,
      },
      include: {
        address: true,
        pricing: true,
        cancellation: true,
        checkInCheckout: true,
        rooms: true,
      },
    });

    if (!existingProperty) {
      throw new Error('Property not found or you do not have permission to delete it');
    }

    // Delete in correct order due to foreign key constraints
    
    // Delete pricing and related records
    if (existingProperty.pricing) {
      await prisma.pricePerGroupSize.deleteMany({
        where: { pricingId: existingProperty.pricing.id },
      });
      await prisma.promotion.deleteMany({
        where: { pricingId: existingProperty.pricing.id },
      });
      await prisma.pricing.delete({
        where: { id: existingProperty.pricing.id },
      });
    }

    // Delete cancellation
    if (existingProperty.cancellation) {
      await prisma.cancellation.delete({
        where: { id: existingProperty.cancellation.id },
      });
    }

    // Delete check-in/out times
    if (existingProperty.checkInCheckout) {
      await prisma.checkInOutTimes.delete({
        where: { id: existingProperty.checkInCheckout.id },
      });
    }

    // Delete beds and rooms
    for (const room of existingProperty.rooms) {
      await prisma.bed.deleteMany({
        where: { roomId: room.id },
      });
    }
    await prisma.room.deleteMany({
      where: { propertyId },
    });

    // Delete amenities
    await prisma.amenity.deleteMany({
      where: { propertyId },
    });

    // Delete photos
    await prisma.photo.deleteMany({
      where: { propertyId },
    });

    // Delete property
    await prisma.property.delete({
      where: { propertyId },
    });

    // Delete address and latLong
    if (existingProperty.address) {
      await prisma.latLong.deleteMany({
        where: { addressId: existingProperty.address.id },
      });
      await prisma.address.delete({
        where: { id: existingProperty.address.id },
      });
    }

    return { message: 'Property deleted successfully' };
  }
}

export default new PropertyService();