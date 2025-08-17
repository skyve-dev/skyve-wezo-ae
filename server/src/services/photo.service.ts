import prisma from '../config/database';

export class PhotoService {
  async uploadPhotos(photos: any[]) {
    await prisma.photo.createMany({
      data: photos.map(photo => ({
        url: photo.url,
        altText: photo.altText || '',
        description: photo.description || null,
        tags: photo.tags || [],
        propertyId: null,
      })),
    });

    const createdPhotos = await prisma.photo.findMany({
      orderBy: { id: 'desc' },
      take: photos.length,
    });

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