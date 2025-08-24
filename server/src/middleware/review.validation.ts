import { Request, Response, NextFunction } from 'express';
import { validateAndCollectErrors, returnValidationResponse } from './validation-helpers';

export const validateReviewResponse = (req: Request, res: Response, next: NextFunction): void => {
  const { response } = req.body;

  const validations = [
    () => !response ? 'response: Response is required' : null,
    () => response && typeof response !== 'string' ? 'response: Response must be a string' : null,
    () => response && response.trim().length === 0 ? 'response: Response cannot be empty' : null,
    () => response && response.length < 10 ? 'response: Response must be at least 10 characters long' : null,
    () => response && response.length > 1000 ? 'response: Response cannot exceed 1000 characters' : null,
  ];

  const errors = validateAndCollectErrors(validations);
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  next();
};

export const validateReviewFilters = (req: Request, res: Response, next: NextFunction): void => {
  const { rating, hasResponse, page, limit } = req.query;

  const validations = [
    () => {
      if (rating) {
        const ratingNum = parseInt(rating as string);
        return (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 10) ? 'rating: Rating must be a number between 1 and 10' : null;
      }
      return null;
    },
    () => {
      if (hasResponse && typeof hasResponse === 'string') {
        return !['true', 'false'].includes(hasResponse) ? 'hasResponse: HasResponse must be true or false' : null;
      }
      return null;
    },
    () => {
      if (page) {
        const pageNum = parseInt(page as string);
        return (isNaN(pageNum) || pageNum < 1) ? 'page: Page must be a positive number' : null;
      }
      return null;
    },
    () => {
      if (limit) {
        const limitNum = parseInt(limit as string);
        return (isNaN(limitNum) || limitNum < 1 || limitNum > 100) ? 'limit: Limit must be a number between 1 and 100' : null;
      }
      return null;
    },
  ];

  const errors = validateAndCollectErrors(validations);
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  next();
};

export const validateDateRange = (req: Request, res: Response, next: NextFunction): void => {
  const { startDate, endDate } = req.query;

  const validations = [
    () => startDate && !isValidDate(startDate as string) ? 'startDate: Invalid start date format' : null,
    () => endDate && !isValidDate(endDate as string) ? 'endDate: Invalid end date format' : null,
    () => {
      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        return start > end ? 'endDate: Start date must be before end date' : null;
      }
      return null;
    },
  ];

  const errors = validateAndCollectErrors(validations);
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  next();
};

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}