import { Request, Response } from 'express';
import availabilityService from '../services/availability.service';

export const getPropertyAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { propertyId } = req.params;
    const { startDate, endDate } = req.query;

    const availability = await availabilityService.getAvailability(
      propertyId,
      req.user.id,
      startDate as string,
      endDate as string
    );

    res.json({
      propertyId,
      startDate,
      endDate,
      availability,
    });
  } catch (error: any) {
    console.error('Get availability error:', error);
    if (error.message === 'Property not found or you do not have permission to view it') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPublicPropertyAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { propertyId } = req.params;
    const { startDate, endDate } = req.query;

    const availability = await availabilityService.getPublicAvailability(
      propertyId,
      startDate as string,
      endDate as string
    );

    res.json({
      propertyId,
      startDate,
      endDate,
      availability,
    });
  } catch (error: any) {
    console.error('Get public availability error:', error);
    if (error.message.includes('not found')) {
      res.status(404).json({ error: 'Property not found' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const checkBookingAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { propertyId } = req.params;
    const { checkInDate, checkOutDate, numGuests } = req.body;

    // Validate required fields
    if (!checkInDate || !checkOutDate || !numGuests) {
      res.status(400).json({ 
        error: 'Missing required fields: checkInDate, checkOutDate, numGuests' 
      });
      return;
    }

    const result = await availabilityService.checkBookingAvailability(
      propertyId,
      new Date(checkInDate),
      new Date(checkOutDate),
      parseInt(numGuests)
    );

    res.json({
      message: 'Availability check completed',
      ...result
    });
  } catch (error: any) {
    console.error('Check booking availability error:', error);
    if (error.message.includes('not found')) {
      res.status(404).json({ error: 'Property not found' });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

export const updateAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { propertyId, date } = req.params;
    const { isAvailable, reason } = req.body;

    const availability = await availabilityService.updateSingleAvailability(
      propertyId,
      req.user.id,
      date,
      isAvailable,
      reason
    );

    res.json({
      message: 'Availability updated successfully',
      availability,
    });
  } catch (error: any) {
    console.error('Update availability error:', error);
    if (error.message === 'Property not found or you do not have permission to update it') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const bulkUpdateAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { propertyId } = req.params;
    const { updates } = req.body;

    const result = await availabilityService.bulkUpdateAvailability(
      propertyId,
      req.user.id,
      updates
    );

    res.json({
      message: 'Bulk availability update completed',
      updated: result.updated,
      failed: result.failed,
    });
  } catch (error: any) {
    console.error('Bulk update availability error:', error);
    if (error.message === 'Property not found or you do not have permission to update it') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};