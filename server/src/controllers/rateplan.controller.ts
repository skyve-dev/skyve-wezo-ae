import { Request, Response } from 'express';
import ratePlanService from '../services/rateplan.service';

export const createRatePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { propertyId } = req.params;
    const ratePlanData = req.body;

    const ratePlan = await ratePlanService.createRatePlan(
      propertyId,
      req.user.id,
      ratePlanData
    );

    res.status(201).json({
      message: 'Rate plan created successfully',
      ratePlan,
    });
  } catch (error: any) {
    console.error('Create rate plan error:', error);
    if (error.message === 'Property not found or you do not have permission to update it') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRatePlans = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { propertyId } = req.params;

    const ratePlans = await ratePlanService.getRatePlans(propertyId, req.user.id);

    res.json({
      propertyId,
      ratePlans,
    });
  } catch (error: any) {
    console.error('Get rate plans error:', error);
    if (error.message === 'Property not found or you do not have permission to view it') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRatePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { propertyId, ratePlanId } = req.params;

    const ratePlan = await ratePlanService.getRatePlan(
      propertyId,
      ratePlanId,
      req.user.id
    );

    res.json(ratePlan);
  } catch (error: any) {
    console.error('Get rate plan error:', error);
    if (error.message === 'Rate plan not found or you do not have permission to view it') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateRatePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { propertyId, ratePlanId } = req.params;
    const updateData = req.body;

    const ratePlan = await ratePlanService.updateRatePlan(
      propertyId,
      ratePlanId,
      req.user.id,
      updateData
    );

    res.json({
      message: 'Rate plan updated successfully',
      ratePlan,
    });
  } catch (error: any) {
    console.error('Update rate plan error:', error);
    if (error.message === 'Rate plan not found or you do not have permission to update it') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteRatePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { propertyId, ratePlanId } = req.params;

    await ratePlanService.deleteRatePlan(propertyId, ratePlanId, req.user.id);

    res.json({
      message: 'Rate plan deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete rate plan error:', error);
    if (error.message === 'Rate plan not found or you do not have permission to delete it') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateRatePlanPrices = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { propertyId, ratePlanId } = req.params;
    const { prices } = req.body;

    const result = await ratePlanService.updateRatePlanPrices(
      propertyId,
      ratePlanId,
      req.user.id,
      prices
    );

    res.json({
      message: 'Rate plan prices updated successfully',
      updatedCount: result.updatedCount,
      prices: result.prices,
    });
  } catch (error: any) {
    console.error('Update rate plan prices error:', error);
    if (error.message === 'Rate plan not found or you do not have permission to update it') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateRatePlanRestrictions = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { propertyId, ratePlanId } = req.params;
    const { restrictions } = req.body;

    const result = await ratePlanService.updateRatePlanRestrictions(
      propertyId,
      ratePlanId,
      req.user.id,
      restrictions
    );

    res.json({
      message: 'Rate plan restrictions updated successfully',
      restrictions: result.restrictions,
    });
  } catch (error: any) {
    console.error('Update rate plan restrictions error:', error);
    if (error.message === 'Rate plan not found or you do not have permission to update it') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};