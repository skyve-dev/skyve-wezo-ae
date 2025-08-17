import prisma from '../config/database';

export class PhotoService {
  async uploadPhotos(photos: any[]) {
    // Create photos individually to get their IDs
    const createdPhotos = [];
    for (const photo of photos) {
      const created = await prisma.photo.create({
        data: {
          url: photo.url,
          altText: photo.altText || '',
          description: photo.description || null,
          tags: photo.tags || [],
          propertyId: null,
        },
      });
      createdPhotos.push(created);
    }

    return createdPhotos;
  }

  async attachPhotosToProperty(photoIds: string[], propertyId: string, ownerId: string) {
    const property = await prisma.property.findFirst({
      where: {
        propertyId,
        ownerId,
      },
    });

    if (!property) {
      throw new Error('Property not found or you do not have permission to update it');
    }

    const photos = await prisma.photo.findMany({
      where: {
        id: { in: photoIds },
        propertyId: null,
      },
    });

    if (photos.length !== photoIds.length) {
      throw new Error('Some photos not found or already attached to a property');
    }

    await prisma.photo.updateMany({
      where: {
        id: { in: photoIds },
      },
      data: {
        propertyId,
      },
    });

    const updatedPhotos = await prisma.photo.findMany({
      where: {
        id: { in: photoIds },
      },
    });

    return updatedPhotos;
  }

  async getUnattachedPhotos() {
    const unattachedPhotos = await prisma.photo.findMany({
      where: {
        propertyId: null,
      },
    });

    return unattachedPhotos;
  }

  async deletePhoto(photoId: string) {
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      throw new Error('Photo not found');
    }

    await prisma.photo.delete({
      where: { id: photoId },
    });

    return { message: 'Photo deleted successfully' };
  }

  async updatePhoto(photoId: string, updateData: any) {
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      throw new Error('Photo not found');
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
}

export default new PhotoService();