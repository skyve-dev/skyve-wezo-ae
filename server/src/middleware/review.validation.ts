import { Request, Response, NextFunction } from 'express';

export const validateReviewResponse = (req: Request, res: Response, next: NextFunction): void => {
  const { response } = req.body;

  if (!response) {
    res.status(400).json({ error: 'response is required' });
    return;
  }

  if (typeof response !== 'string') {
    res.status(400).json({ error: 'response must be a string' });
    return;
  }

  if (response.trim().length === 0) {
    res.status(400).json({ error: 'response cannot be empty' });
    return;
  }

  if (response.length < 10) {
    res.status(400).json({ error: 'Response must be at least 10 characters long' });
    return;
  }

  if (response.length > 1000) {
    res.status(400).json({ error: 'Response cannot exceed 1000 characters' });
    return;
  }

  next();
};

export const validateReviewFilters = (req: Request, res: Response, next: NextFunction): void => {
  const { rating, hasResponse, page, limit } = req.query;

  if (rating) {
    const ratingNum = parseInt(rating as string);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 10) {
      res.status(400).json({ error: 'rating must be a number between 1 and 10' });
      return;
    }
  }

  if (hasResponse && typeof hasResponse === 'string') {
    if (!['true', 'false'].includes(hasResponse)) {
      res.status(400).json({ error: 'hasResponse must be true or false' });
      return;
    }
  }

  if (page) {
    const pageNum = parseInt(page as string);
    if (isNaN(pageNum) || pageNum < 1) {
      res.status(400).json({ error: 'page must be a positive number' });
      return;
    }
  }

  if (limit) {
    const limitNum = parseInt(limit as string);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      res.status(400).json({ error: 'limit must be a number between 1 and 100' });
      return;
    }
  }

  next();
};

export const validateDateRange = (req: Request, res: Response, next: NextFunction): void => {
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

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}