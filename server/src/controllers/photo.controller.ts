import { Request, Response } from 'express';
import photoService from '../services/photo.service';
import fs from 'fs';
import path from 'path';

export const uploadPhotos = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    const uploadDir = path.join(process.cwd(), 'uploads', 'photos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const photos = files.map(file => ({
      url: `/uploads/photos/${file.filename}`,
      altText: '',
      description: '',
      tags: []
    }));

    const result = await photoService.uploadPhotos(photos);

    res.status(201).json({
      message: 'Photos uploaded successfully',
      photos: result
    });
  } catch (error) {
    console.error('Upload photos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const attachPhotosToProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { propertyId } = req.params;
    const { photoIds } = req.body;

    if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
      res.status(400).json({ error: 'photoIds array is required' });
      return;
    }

    const result = await photoService.attachPhotosToProperty(photoIds, propertyId, req.user.id);

    res.json({
      message: 'Photos attached to property successfully',
      photos: result
    });
  } catch (error: any) {
    console.error('Attach photos error:', error);
    if (error.message === 'Property not found or you do not have permission to update it' ||
        error.message === 'Some photos not found or already attached to a property') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUnattachedPhotos = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const photos = await photoService.getUnattachedPhotos();

    res.json({ photos });
  } catch (error) {
    console.error('Get unattached photos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { photoId } = req.params;
    const result = await photoService.deletePhoto(photoId);

    res.json(result);
  } catch (error: any) {
    console.error('Delete photo error:', error);
    if (error.message === 'Photo not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { photoId } = req.params;
    const { altText, description, tags } = req.body;

    const result = await photoService.updatePhoto(photoId, { altText, description, tags });

    res.json({
      message: 'Photo updated successfully',
      photo: result
    });
  } catch (error: any) {
    console.error('Update photo error:', error);
    if (error.message === 'Photo not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};