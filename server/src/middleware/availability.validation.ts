import { Request, Response, NextFunction } from 'express';
import { validateAndCollectErrors, returnValidationResponse } from './validation-helpers';

export const validateAvailabilityGet = (req: Request, res: Response, next: NextFunction): void => {
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

export const validateAvailabilityUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { date } = req.params;
  const { isAvailable } = req.body;

  const validations = [
    () => !isValidDate(date) ? 'date: Invalid date format' : null,
    () => typeof isAvailable !== 'boolean' ? 'isAvailable: isAvailable must be a boolean' : null,
  ];

  const errors = validateAndCollectErrors(validations);
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  next();
};

export const validateBulkAvailabilityUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { updates } = req.body;

  const validations = [
    () => !updates ? 'updates: Updates field is required' : null,
    () => updates && !Array.isArray(updates) ? 'updates: Updates must be an array' : null,
    () => updates && Array.isArray(updates) && updates.length === 0 ? 'updates: Updates array cannot be empty' : null,
    () => updates && Array.isArray(updates) && updates.length > 365 ? 'updates: Cannot update more than 365 days at once' : null,
  ];

  const errors = validateAndCollectErrors(validations);
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  // Additional validation for each update item
  if (updates && Array.isArray(updates)) {
    for (const update of updates) {
      if (!update.date || !isValidDate(update.date)) {
        returnValidationResponse(res, { updates: 'Each update must have a valid date' });
        return;
      }
      if (typeof update.isAvailable !== 'boolean') {
        returnValidationResponse(res, { updates: 'Each update must have isAvailable as boolean' });
        return;
      }
    }
  }

  next();
};

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}