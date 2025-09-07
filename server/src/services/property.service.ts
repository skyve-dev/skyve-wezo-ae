import prisma from '../config/database';
import { Prisma } from '@prisma/client';
import propertyPricingService, { WeeklyPricingData } from './property-pricing.service';

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
      // pricing removed - now managed through rate plans
      aboutTheProperty,
      aboutTheNeighborhood,
      firstDateGuestCanCheckIn,
    } = data;

    const addressData: Prisma.AddressCreateWithoutPropertyInput = {
      apartmentOrFloorNumber: address.apartmentOrFloorNumber,
      countryOrRegion: address.countryOrRegion,
      city: address.city || null,
      zipCode: address.zipCode ? parseInt(address.zipCode, 10) : null,
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
      aboutTheProperty: aboutTheProperty || '',
      aboutTheNeighborhood: aboutTheNeighborhood || '',
      firstDateGuestCanCheckIn: firstDateGuestCanCheckIn || null,
      bookingType,
      paymentType,
      maximumGuest: layout.maximumGuest,
      bathrooms: layout.bathrooms,
      allowChildren: layout.allowChildren,
      offerCribs: layout.offerCribs,
      propertySizeSqMtr: layout.propertySizeSqMtr,
      parking: services?.parking || 'No',
      languages: services?.languages || [],
      smokingAllowed: rules?.smokingAllowed || false,
      partiesOrEventsAllowed: rules?.partiesOrEventsAllowed || false,
      petsAllowed: rules?.petsAllowed || 'No',
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
        connect: photos.filter((photo: any) => photo.id).map((photo: any) => ({ id: photo.id })),
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
      // pricing removed - now managed through rate plans
      // Cancellation policies now managed through rate plans
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
        // pricing include removed - now managed through rate plans
        // cancellation: removed - now handled by rate plans
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

    // Update photo metadata (altText, description, tags) for connected photos
    if (photos && photos.length > 0) {
      const photoUpdates = photos
        .filter((photo: any) => photo.id)
        .map((photo: any) => 
          prisma.photo.update({
            where: { id: photo.id },
            data: {
              altText: photo.altText || '',
              description: photo.description || '',
              tags: photo.tags || [],
            },
          })
        );
      
      if (photoUpdates.length > 0) {
        await Promise.all(photoUpdates);
      }
    }

    return property;
  }

  async updateProperty(propertyId: string, data: any, ownerId: string) {
    const existingProperty = await prisma.property.findFirst({
      where: {
        propertyId,
        ownerId,
      },
      include: {
        address: true,
        rooms: true,
        amenities: true,
        checkInCheckout: true,
        pricing: true,
        // cancellation: removed - now handled by rate plans
      },
    });

    if (!existingProperty) {
      throw new Error('Property not found or you do not have permission to update it');
    }

    const {
      name,
      address,
      layout,
      amenities,
      services,
      rules,
      bookingType,
      paymentType,
      pricing, // Re-added pricing support for unified property management
      aboutTheProperty,
      aboutTheNeighborhood,
      firstDateGuestCanCheckIn,
    } = data;

    // Build update data object
    const updateData: any = {
      name,
      bookingType,
      paymentType,
      aboutTheProperty,
      aboutTheNeighborhood,
      firstDateGuestCanCheckIn,
    };

    // Debug log to ensure pricing variable is being used (prevents TS error)
    console.log('🔷 PropertyService - updateProperty called');
    console.log('🔷 PropertyService - Full data received:', JSON.stringify(data, null, 2));
    console.log('🔷 PropertyService - pricing extracted:', pricing);
    console.log('🔷 PropertyService - pricing exists:', !!pricing);
    console.log('🔷 PropertyService - pricing keys:', pricing ? Object.keys(pricing) : 'no pricing');

    // Update address if provided
    if (address) {
      const addressUpdate: any = {
        apartmentOrFloorNumber: address.apartmentOrFloorNumber,
        countryOrRegion: address.countryOrRegion,
        city: address.city || null,
        zipCode: address.zipCode ? parseInt(address.zipCode, 10) : null,
      };

      // Handle latLong update
      if (address.latLong) {
        // Delete existing latLong if exists
        await prisma.latLong.deleteMany({
          where: { addressId: existingProperty.address?.id },
        });
        
        addressUpdate.latLong = {
          create: {
            latitude: address.latLong.latitude,
            longitude: address.latLong.longitude,
          },
        };
      }

      updateData.address = {
        update: addressUpdate,
      };
    }

    // Update layout fields if provided
    if (layout) {
      updateData.maximumGuest = layout.maximumGuest;
      updateData.bathrooms = layout.bathrooms;
      updateData.allowChildren = layout.allowChildren;
      updateData.offerCribs = layout.offerCribs;
      updateData.propertySizeSqMtr = layout.propertySizeSqMtr;

      // Handle rooms update
      if (layout.rooms !== undefined) {
        // Delete existing beds and rooms
        const existingRooms = await prisma.room.findMany({
          where: { propertyId },
          select: { id: true },
        });
        
        for (const room of existingRooms) {
          await prisma.bed.deleteMany({
            where: { roomId: room.id },
          });
        }
        
        await prisma.room.deleteMany({
          where: { propertyId },
        });

        // Create new rooms
        if (layout.rooms && layout.rooms.length > 0) {
          updateData.rooms = {
            create: layout.rooms.map((room: any) => ({
              spaceName: room.spaceName,
              beds: {
                create: room.beds?.map((bed: any) => ({
                  typeOfBed: bed.typeOfBed,
                  numberOfBed: bed.numberOfBed,
                })),
              },
            })),
          };
        }
      }
    }

    // Update services fields if provided
    if (services) {
      updateData.serveBreakfast = services.serveBreakfast;
      updateData.parking = services.parking;
      updateData.languages = services.languages;
    }

    // Update rules fields if provided
    if (rules) {
      updateData.smokingAllowed = rules.smokingAllowed;
      updateData.partiesOrEventsAllowed = rules.partiesOrEventsAllowed;
      updateData.petsAllowed = rules.petsAllowed;

      // Handle checkInCheckout update
      if (rules.checkInCheckout) {
        // Delete existing checkInCheckout if exists
        await prisma.checkInOutTimes.deleteMany({
          where: { propertyId },
        });

        updateData.checkInCheckout = {
          create: {
            checkInFrom: rules.checkInCheckout.checkInFrom,
            checkInUntil: rules.checkInCheckout.checkInUntil,
            checkOutFrom: rules.checkInCheckout.checkOutFrom,
            checkOutUntil: rules.checkInCheckout.checkOutUntil,
          },
        };
      }
    }

    // Update amenities if provided
    if (amenities !== undefined) {
      // Delete existing amenities
      await prisma.amenity.deleteMany({
        where: { propertyId },
      });

      // Create new amenities
      if (amenities && amenities.length > 0) {
        updateData.amenities = {
          create: amenities.map((amenity: any) => ({
            name: amenity.name,
            category: amenity.category,
          })),
        };
      }
    }

    // Pricing updates removed - now managed through rate plans

    // Cancellation policies now managed through rate plans

    const property = await prisma.property.update({
      where: { propertyId },
      data: updateData,
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
        // pricing include removed - now managed through rate plans
        // cancellation: removed - now handled by rate plans
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

    // Handle PropertyPricing update if provided
    if (pricing) {
      console.log('🔷 PropertyService - updating pricing for propertyId:', propertyId);
      console.log('🔷 PropertyService - pricing data received:', pricing);
      
      // Transform client pricing format to service format
      const weeklyPricingData: WeeklyPricingData = {
        // Full day prices (ensure numbers)
        monday: Number(pricing.priceMonday) || 0,
        tuesday: Number(pricing.priceTuesday) || 0,
        wednesday: Number(pricing.priceWednesday) || 0,
        thursday: Number(pricing.priceThursday) || 0,
        friday: Number(pricing.priceFriday) || 0,
        saturday: Number(pricing.priceSaturday) || 0,
        sunday: Number(pricing.priceSunday) || 0,
        
        // Half day prices (ensure numbers, default to 70% of full day if not provided)
        halfDayMonday: Number(pricing.halfDayPriceMonday) || Math.round(Number(pricing.priceMonday || 0) * 0.7),
        halfDayTuesday: Number(pricing.halfDayPriceTuesday) || Math.round(Number(pricing.priceTuesday || 0) * 0.7),
        halfDayWednesday: Number(pricing.halfDayPriceWednesday) || Math.round(Number(pricing.priceWednesday || 0) * 0.7),
        halfDayThursday: Number(pricing.halfDayPriceThursday) || Math.round(Number(pricing.priceThursday || 0) * 0.7),
        halfDayFriday: Number(pricing.halfDayPriceFriday) || Math.round(Number(pricing.priceFriday || 0) * 0.7),
        halfDaySaturday: Number(pricing.halfDayPriceSaturday) || Math.round(Number(pricing.priceSaturday || 0) * 0.7),
        halfDaySunday: Number(pricing.halfDayPriceSunday) || Math.round(Number(pricing.priceSunday || 0) * 0.7)
      };
      
      console.log('🔷 PropertyService - transformed pricing data:', weeklyPricingData);
      
      try {
        await propertyPricingService.setWeeklyPricing(propertyId, ownerId, weeklyPricingData);
        console.log('🔷 PropertyService - pricing updated successfully');
      } catch (pricingError) {
        console.error('🔷 PropertyService - pricing update failed:', pricingError);
        // Don't throw error here to avoid breaking property update
        // Pricing update failure should be logged but not block property update
      }
    }

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

    // Delete beds first, then rooms
    const existingRooms = await prisma.room.findMany({
      where: { propertyId },
      select: { id: true },
    });
    
    for (const room of existingRooms) {
      await prisma.bed.deleteMany({
        where: { roomId: room.id },
      });
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

  // updatePropertyPricing removed - pricing now managed through rate plans

  // updatePropertyCancellation removed - cancellation policies now managed through rate plans

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
        pricing: true, // Re-added pricing support for unified property management
        // cancellation: removed - now handled by rate plans
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
    console.log('🔷 PropertyService - getPropertiesByOwner called for userId:', ownerId);
    
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
        pricing: true, // Re-added pricing support for unified property management
        // cancellation: removed - now handled by rate plans
      },
    });

    console.log('🔷 PropertyService - getPropertiesByOwner found', properties.length, 'properties');
    if (properties.length > 0) {
      console.log('🔷 PropertyService - First property pricing:', properties[0].pricing);
      console.log('🔷 PropertyService - First property keys:', Object.keys(properties[0]));
    }

    return properties;
  }

  async getPublicProperties() {
    console.log('🔷 PropertyService - getPublicProperties called for public browsing');
    
    const properties = await prisma.property.findMany({
      where: { 
        status: 'Live' // Only show live properties for public browsing
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
        pricing: true, // Re-added pricing support for unified property management
        // cancellation: removed - now handled by rate plans
      },
    });

    console.log('🔷 PropertyService - getPublicProperties found', properties.length, 'live properties');
    
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
        // cancellation: removed - now handled by rate plans
        checkInCheckout: true,
        rooms: true,
      },
    });

    if (!existingProperty) {
      throw new Error('Property not found or you do not have permission to delete it');
    }

    // Delete in correct order due to foreign key constraints
    
    // Pricing deletion removed - now managed through rate plans

    // Cancellation policies now handled by rate plans (deleted above)

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

    // Delete availability records first (they reference propertyId)
    await prisma.availability.deleteMany({
      where: { propertyId },
    });

    // Delete reviews (they reference propertyId)
    await prisma.review.deleteMany({
      where: { propertyId },
    });

    // Delete property pricing first
    await prisma.propertyPricing.deleteMany({
      where: { propertyId },
    });

    // Delete date price overrides for this property
    await prisma.datePriceOverride.deleteMany({
      where: { propertyId },
    });

    // Delete rate plan features for the property's rate plans
    await prisma.ratePlanFeatures.deleteMany({
      where: { 
        ratePlan: {
          propertyId
        }
      },
    });

    // Delete rate plans
    await prisma.ratePlan.deleteMany({
      where: { propertyId },
    });

    // Property restrictions removed - now managed through rate plans

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

  async addPropertyPhotos(propertyId: string, photos: any[], ownerId: string) {
    const existingProperty = await prisma.property.findFirst({
      where: {
        propertyId,
        ownerId,
      },
    });

    if (!existingProperty) {
      throw new Error('Property not found or you do not have permission to update it');
    }

    await prisma.photo.createMany({
      data: photos.map(photo => ({
        ...photo,
        propertyId,
      })),
    });

    const propertyPhotos = await prisma.photo.findMany({
      where: { propertyId },
      orderBy: { id: 'desc' },
      take: photos.length,
    });

    return propertyPhotos;
  }

  async deletePropertyPhoto(propertyId: string, photoId: string, ownerId: string) {
    const existingProperty = await prisma.property.findFirst({
      where: {
        propertyId,
        ownerId,
      },
    });

    if (!existingProperty) {
      throw new Error('Property or photo not found or you do not have permission');
    }

    const photo = await prisma.photo.findFirst({
      where: {
        id: photoId,
        propertyId,
      },
    });

    if (!photo) {
      throw new Error('Property or photo not found or you do not have permission');
    }

    await prisma.photo.delete({
      where: { id: photoId },
    });

    return { message: 'Photo deleted successfully' };
  }

  async updatePropertyPhoto(propertyId: string, photoId: string, updateData: any, ownerId: string) {
    const existingProperty = await prisma.property.findFirst({
      where: {
        propertyId,
        ownerId,
      },
    });

    if (!existingProperty) {
      throw new Error('Property or photo not found or you do not have permission');
    }

    const photo = await prisma.photo.findFirst({
      where: {
        id: photoId,
        propertyId,
      },
    });

    if (!photo) {
      throw new Error('Property or photo not found or you do not have permission');
    }

    const updatedPhoto = await prisma.photo.update({
      where: { id: photoId },
      data: {
        altText: updateData.altText,
        description: updateData.description,
        tags: updateData.tags || [],
      },
    });

    return updatedPhoto;
  }

  async updatePropertyStatus(propertyId: string, status: string, ownerId: string) {
    // Validate status value
    const validStatuses = ['Draft', 'Live', 'Closed'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Check if property exists and user has permission
    const existingProperty = await prisma.property.findFirst({
      where: {
        propertyId,
        ownerId,
      },
      include: {
        photos: true,
        amenities: true,
        pricing: true,
      },
    });

    if (!existingProperty) {
      throw new Error('Property not found or you do not have permission to update it');
    }

    // Validation rules for publishing (Draft → Live)
    if (status === 'Live') {
      const validationErrors: string[] = [];

      // Check minimum photos requirement
      if (!existingProperty.photos || existingProperty.photos.length < 5) {
        validationErrors.push('At least 5 photos are required to publish a property');
      }

      // Check basic property information
      if (!existingProperty.name || existingProperty.name.trim().length === 0) {
        validationErrors.push('Property name is required');
      }

      if (!existingProperty.maximumGuest || existingProperty.maximumGuest < 1) {
        validationErrors.push('Maximum guest capacity must be at least 1');
      }

      // Check if pricing is configured (optional for MVP)
      // Note: This could be expanded to check for rate plans in the future

      if (validationErrors.length > 0) {
        throw new Error(`Cannot publish property: ${validationErrors.join(', ')}`);
      }
    }

    // Update the property status
    const updatedProperty = await prisma.property.update({
      where: { propertyId },
      data: { status: status as any }, // Cast to PropertyStatus enum
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
        pricing: true,
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

    return updatedProperty;
  }
}

export default new PropertyService();