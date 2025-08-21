import { Request, Response, NextFunction } from 'express';

export const validateRatePlanCreation = (req: Request, res: Response, next: NextFunction): void => {
  const { name, type, cancellationPolicy } = req.body;

  if (!name || typeof name !== 'string') {
    res.status(400).json({ error: 'Rate plan name is required' });
    return;
  }

  const validTypes = ['FullyFlexible', 'NonRefundable', 'Custom'];
  if (!type || !validTypes.includes(type)) {
    res.status(400).json({ error: `Type must be one of: ${validTypes.join(', ')}` });
    return;
  }

  if (!cancellationPolicy || typeof cancellationPolicy !== 'string') {
    res.status(400).json({ error: 'Cancellation policy is required' });
    return;
  }

  next();
};

export const validateRatePlanUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { name, type, cancellationPolicy } = req.body;

  if (name && typeof name !== 'string') {
    res.status(400).json({ error: 'Rate plan name must be a string' });
    return;
  }

  if (type) {
    const validTypes = ['FullyFlexible', 'NonRefundable', 'Custom'];
    if (!validTypes.includes(type)) {
      res.status(400).json({ error: `Type must be one of: ${validTypes.join(', ')}` });
      return;
    }
  }

  if (cancellationPolicy && typeof cancellationPolicy !== 'string') {
    res.status(400).json({ error: 'Cancellation policy must be a string' });
    return;
  }

  next();
};

export const validatePriceUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { prices } = req.body;

  if (!Array.isArray(prices)) {
    res.status(400).json({ error: 'Prices must be an array' });
    return;
  }

  if (prices.length === 0) {
    res.status(400).json({ error: 'Prices array cannot be empty' });
    return;
  }

  for (const price of prices) {
    if (!price.date || !isValidDate(price.date)) {
      res.status(400).json({ error: 'Each price must have a valid date' });
      return;
    }
    if (typeof price.basePrice !== 'number' || price.basePrice <= 0) {
      res.status(400).json({ error: 'Each price must have a positive basePrice' });
      return;
    }
    if (price.currency && price.currency !== 'AED') {
      res.status(400).json({ error: 'Currency must be AED' });
      return;
    }
  }

  next();
};

export const validateRestrictionUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { restrictions } = req.body;

  if (!Array.isArray(restrictions)) {
    res.status(400).json({ error: 'Restrictions must be an array' });
    return;
  }

  const validTypes = [
    'MinLengthOfStay',
    'MaxLengthOfStay',
    'NoArrivals',
    'NoDepartures',
    'MinAdvancedReservation',
    'MaxAdvancedReservation',
  ];

  for (const restriction of restrictions) {
    if (!restriction.type || !validTypes.includes(restriction.type)) {
      res.status(400).json({ error: `Restriction type must be one of: ${validTypes.join(', ')}` });
      return;
    }
    if (typeof restriction.value !== 'number' || restriction.value < 0) {
      res.status(400).json({ error: 'Restriction value must be a non-negative number' });
      return;
    }
    if (restriction.startDate && !isValidDate(restriction.startDate)) {
      res.status(400).json({ error: 'Invalid restriction start date' });
      return;
    }
    if (restriction.endDate && !isValidDate(restriction.endDate)) {
      res.status(400).json({ error: 'Invalid restriction end date' });
      return;
    }
  }

  next();
};

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}