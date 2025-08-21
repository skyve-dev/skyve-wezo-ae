import { Request, Response, NextFunction } from 'express';

export const validateAvailabilityGet = (req: Request, res: Response, next: NextFunction): void => {
  const { startDate, endDate } = req.query;

  if (startDate && !isValidDate(startDate as string)) {
    res.status(400).json({ error: 'Invalid start date format' });
    return;
  }

  if (endDate && !isValidDate(endDate as string)) {
    res.status(400).json({ error: 'Invalid end date format' });
    return;
  }

  if (startDate && endDate) {
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    if (start > end) {
      res.status(400).json({ error: 'Start date must be before end date' });
      return;
    }
  }

  next();
};

export const validateAvailabilityUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { date } = req.params;
  const { isAvailable } = req.body;

  if (!isValidDate(date)) {
    res.status(400).json({ error: 'Invalid date format' });
    return;
  }

  if (typeof isAvailable !== 'boolean') {
    res.status(400).json({ error: 'isAvailable must be a boolean' });
    return;
  }

  next();
};

export const validateBulkAvailabilityUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { updates } = req.body;

  if (!updates) {
    res.status(400).json({ error: 'Updates field is required' });
    return;
  }

  if (!Array.isArray(updates)) {
    res.status(400).json({ error: 'Updates must be an array' });
    return;
  }

  if (updates.length === 0) {
    res.status(400).json({ error: 'Updates array cannot be empty' });
    return;
  }

  if (updates.length > 365) {
    res.status(400).json({ error: 'Cannot update more than 365 days at once' });
    return;
  }

  for (const update of updates) {
    if (!update.date || !isValidDate(update.date)) {
      res.status(400).json({ error: 'Each update must have a valid date' });
      return;
    }
    if (typeof update.isAvailable !== 'boolean') {
      res.status(400).json({ error: 'Each update must have isAvailable as boolean' });
      return;
    }
  }

  next();
};

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}