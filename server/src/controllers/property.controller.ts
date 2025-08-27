import { Request, Response } from 'express';
import propertyService from '../services/property.service';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check if user has HomeOwner role, if not, upgrade them
    if (req.user.role !== 'HomeOwner') {
      try {
        await prisma.user.update({
          where: { id: req.user.id },
          data: { role: 'HomeOwner' },
        });
        
        // Update the user object in the request for immediate use
        req.user.role = 'HomeOwner';
      } catch (roleUpdateError: any) {
        // If user doesn't exist, the JWT token is invalid
        if (roleUpdateError.code === 'P2025') {
          res.status(401).json({ error: 'User not found' });
          return;
        }
        // Re-throw other errors
        throw roleUpdateError;
      }
    }

    const property = await propertyService.createProperty(req.body, req.user.id);

    res.status(201).json({
      message: 'Property created successfully',
      property,
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { propertyId } = req.params;
    const property = await propertyService.updateProperty(propertyId, req.body, req.user.id);

    res.json({
      message: 'Property updated successfully',
      property,
    });
  } catch (error: any) {
    console.error('Update property error:', error);
    if (error.message === 'Property not found or you do not have permission to update it') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePropertyLayout = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { propertyId } = req.params;
    const property = await propertyService.updatePropertyLayout(
      propertyId,
      req.body,
      req.user.id
    );

    res.json({
      message: 'Property layout updated successfully',
      property,
    });
  } catch (error: any) {
    console.error('Update property layout error:', error);
    if (error.message === 'Property not found or you do not have permission to update it') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePropertyAmenities = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { propertyId } = req.params;
    const property = await propertyService.updatePropertyAmenities(
      propertyId,
      req.body.amenities,
      req.user.id
    );

    res.json({
      message: 'Property amenities updated successfully',
      property,
    });
  } catch (error: any) {
    console.error('Update property amenities error:', error);
    if (error.message === 'Property not found or you do not have permission to update it') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePropertyServices = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { propertyId } = req.params;
    const property = await propertyService.updatePropertyServices(
      propertyId,
      req.body,
      req.user.id
    );

    res.json({
      message: 'Property services updated successfully',
      property,
    });
  } catch (error: any) {
    console.error('Update property services error:', error);
    if (error.message === 'Property not found or you do not have permission to update it') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePropertyRules = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { propertyId } = req.params;
    const property = await propertyService.updatePropertyRules(
      propertyId,
      req.body,
      req.user.id
    );

    res.json({
      message: 'Property rules updated successfully',
      property,
    });
  } catch (error: any) {
    console.error('Update property rules error:', error);
    if (error.message === 'Property not found or you do not have permission to update it') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePropertyPricing = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { propertyId } = req.params;
    const property = await propertyService.updatePropertyPricing(
      propertyId,
      req.body,
      req.user.id
    );

    res.json({
      message: 'Property pricing updated successfully',
      property,
    });
  } catch (error: any) {
    console.error('Update property pricing error:', error);
    if (error.message === 'Property not found or you do not have permission to update it') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// updatePropertyCancellation removed - cancellation policies now managed through rate plans

export const getProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { propertyId } = req.params;
    const property = await propertyService.getPropertyById(propertyId);

    if (!property) {
      res.status(404).json({ error: 'Property not found' });
      return;
    }

    res.json({ property });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const properties = await propertyService.getPropertiesByOwner(req.user.id);

    res.json({ properties });
  } catch (error) {
    console.error('Get my properties error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { propertyId } = req.params;
    const result = await propertyService.deleteProperty(propertyId, req.user.id);

    res.json(result);
  } catch (error: any) {
    console.error('Delete property error:', error);
    if (error.message === 'Property not found or you do not have permission to delete it') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const uploadPropertyPhotos = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { propertyId } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    // Create uploads directory if it doesn't exist
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

    const result = await propertyService.addPropertyPhotos(propertyId, photos, req.user.id);

    res.status(201).json({
      message: 'Photos uploaded successfully',
      photos: result
    });
  } catch (error: any) {
    console.error('Upload photos error:', error);
    if (error.message === 'Property not found or you do not have permission to update it') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePropertyPhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { propertyId, photoId } = req.params;
    const result = await propertyService.deletePropertyPhoto(propertyId, photoId, req.user.id);

    res.json({
      message: 'Photo deleted successfully',
      result
    });
  } catch (error: any) {
    console.error('Delete photo error:', error);
    if (error.message === 'Property or photo not found or you do not have permission') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePropertyPhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { propertyId, photoId } = req.params;
    const { altText, description, tags } = req.body;

    const result = await propertyService.updatePropertyPhoto(
      propertyId, 
      photoId, 
      { altText, description, tags }, 
      req.user.id
    );

    res.json({
      message: 'Photo updated successfully',
      photo: result
    });
  } catch (error: any) {
    console.error('Update photo error:', error);
    if (error.message === 'Property or photo not found or you do not have permission') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};