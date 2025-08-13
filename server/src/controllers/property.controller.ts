import { Request, Response } from 'express';
import propertyService from '../services/property.service';

export const createProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
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

export const updatePropertyCancellation = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { propertyId } = req.params;
    const property = await propertyService.updatePropertyCancellation(
      propertyId,
      req.body,
      req.user.id
    );

    res.json({
      message: 'Property cancellation policy updated successfully',
      property,
    });
  } catch (error: any) {
    console.error('Update property cancellation error:', error);
    if (error.message === 'Property not found or you do not have permission to update it') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

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