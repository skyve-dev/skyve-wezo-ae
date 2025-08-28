import { Request, Response, NextFunction } from 'express';
import { validateAndCollectErrors, returnValidationResponse } from './validation-helpers';

/**
 * Validate query parameters for getting prices
 */
export const validatePriceGet = (req: Request, res: Response, next: NextFunction): void => {
  const { startDate, endDate, limit, offset } = req.query;

  const validations = [
    () => startDate && !isValidDate(startDate as string) ? 'startDate: Invalid start date format. Use YYYY-MM-DD format' : null,
    () => endDate && !isValidDate(endDate as string) ? 'endDate: Invalid end date format. Use YYYY-MM-DD format' : null,
    () => {
      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        return start >= end ? 'endDate: Start date must be before end date' : null;
      }
      return null;
    },
    () => {
      if (limit) {
        const parsedLimit = parseInt(limit as string);
        return isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 365 
          ? 'limit: Limit must be between 1 and 365' 
          : null;
      }
      return null;
    },
    () => {
      if (offset) {
        const parsedOffset = parseInt(offset as string);
        return isNaN(parsedOffset) || parsedOffset < 0 
          ? 'offset: Offset must be a non-negative integer' 
          : null;
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

/**
 * Validate single price creation/update data
 */
export const validatePriceCreate = (req: Request, res: Response, next: NextFunction): void => {
  const { date, amount } = req.body;

  const validations = [
    () => !date ? 'date: Date is required' : null,
    () => date && !isValidDate(date) ? 'date: Invalid date format. Use YYYY-MM-DD format' : null,
    () => amount === undefined ? 'amount: Amount is required' : null,
    () => amount !== undefined && isNaN(parseFloat(amount)) ? 'amount: Amount must be a valid number' : null,
    () => {
      if (amount !== undefined) {
        const parsedAmount = parseFloat(amount);
        return parsedAmount <= 0 ? 'amount: Amount must be greater than 0' : null;
      }
      return null;
    },
    () => {
      if (amount !== undefined) {
        const parsedAmount = parseFloat(amount);
        return parsedAmount > 99999.99 ? 'amount: Amount cannot exceed AED 99,999.99' : null;
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

/**
 * Validate price update data
 */
export const validatePriceUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { amount } = req.body;

  const validations = [
    () => amount === undefined ? 'amount: Amount is required' : null,
    () => amount !== undefined && isNaN(parseFloat(amount)) ? 'amount: Amount must be a valid number' : null,
    () => {
      if (amount !== undefined) {
        const parsedAmount = parseFloat(amount);
        return parsedAmount <= 0 ? 'amount: Amount must be greater than 0' : null;
      }
      return null;
    },
    () => {
      if (amount !== undefined) {
        const parsedAmount = parseFloat(amount);
        return parsedAmount > 99999.99 ? 'amount: Amount cannot exceed AED 99,999.99' : null;
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

/**
 * Validate bulk price operations
 */
export const validateBulkPriceUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { updates } = req.body;

  const validations = [
    () => !updates ? 'updates: Updates field is required' : null,
    () => updates && !Array.isArray(updates) ? 'updates: Updates must be an array' : null,
    () => updates && Array.isArray(updates) && updates.length === 0 ? 'updates: Updates array cannot be empty' : null,
    () => updates && Array.isArray(updates) && updates.length > 365 ? 'updates: Cannot update more than 365 prices at once' : null,
  ];

  const errors = validateAndCollectErrors(validations);
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  // Additional validation for each update item
  if (updates && Array.isArray(updates)) {
    for (let i = 0; i < updates.length; i++) {
      const update = updates[i];
      
      if (!update.date) {
        returnValidationResponse(res, { updates: `Update at index ${i}: date is required` });
        return;
      }
      
      if (!isValidDate(update.date)) {
        returnValidationResponse(res, { updates: `Update at index ${i}: invalid date format. Use YYYY-MM-DD format` });
        return;
      }
      
      if (update.amount === undefined) {
        returnValidationResponse(res, { updates: `Update at index ${i}: amount is required` });
        return;
      }
      
      const parsedAmount = parseFloat(update.amount);
      if (isNaN(parsedAmount)) {
        returnValidationResponse(res, { updates: `Update at index ${i}: amount must be a valid number` });
        return;
      }
      
      if (parsedAmount <= 0) {
        returnValidationResponse(res, { updates: `Update at index ${i}: amount must be greater than 0` });
        return;
      }
      
      if (parsedAmount > 99999.99) {
        returnValidationResponse(res, { updates: `Update at index ${i}: amount cannot exceed AED 99,999.99` });
        return;
      }
    }
  }

  next();
};

/**
 * Validate bulk delete parameters
 */
export const validateBulkPriceDelete = (req: Request, res: Response, next: NextFunction): void => {
  const { startDate, endDate } = req.body;

  const validations = [
    () => !startDate ? 'startDate: Start date is required' : null,
    () => !endDate ? 'endDate: End date is required' : null,
    () => startDate && !isValidDate(startDate) ? 'startDate: Invalid start date format. Use YYYY-MM-DD format' : null,
    () => endDate && !isValidDate(endDate) ? 'endDate: Invalid end date format. Use YYYY-MM-DD format' : null,
    () => {
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return start >= end ? 'endDate: Start date must be before end date' : null;
      }
      return null;
    },
    () => {
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff > 365 ? 'endDate: Cannot delete prices for more than 365 days at once' : null;
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

/**
 * Validate price statistics query parameters
 */
export const validatePriceStats = (req: Request, res: Response, next: NextFunction): void => {
  const { startDate, endDate } = req.query;

  const validations = [
    () => startDate && !isValidDate(startDate as string) ? 'startDate: Invalid start date format. Use YYYY-MM-DD format' : null,
    () => endDate && !isValidDate(endDate as string) ? 'endDate: Invalid end date format. Use YYYY-MM-DD format' : null,
    () => {
      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        return start >= end ? 'endDate: Start date must be before end date' : null;
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

/**
 * Validate price gaps query parameters
 */
export const validatePriceGaps = (req: Request, res: Response, next: NextFunction): void => {
  const { startDate, endDate } = req.query;

  const validations = [
    () => !startDate ? 'startDate: Start date is required' : null,
    () => !endDate ? 'endDate: End date is required' : null,
    () => startDate && !isValidDate(startDate as string) ? 'startDate: Invalid start date format. Use YYYY-MM-DD format' : null,
    () => endDate && !isValidDate(endDate as string) ? 'endDate: Invalid end date format. Use YYYY-MM-DD format' : null,
    () => {
      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        return start >= end ? 'endDate: Start date must be before end date' : null;
      }
      return null;
    },
    () => {
      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff > 365 ? 'endDate: Cannot check price gaps for more than 365 days at once' : null;
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

/**
 * Validate price copy parameters
 */
export const validatePriceCopy = (req: Request, res: Response, next: NextFunction): void => {
  const { sourceStartDate, sourceEndDate, targetStartDate } = req.body;

  const validations = [
    () => !sourceStartDate ? 'sourceStartDate: Source start date is required' : null,
    () => !sourceEndDate ? 'sourceEndDate: Source end date is required' : null,
    () => !targetStartDate ? 'targetStartDate: Target start date is required' : null,
    () => sourceStartDate && !isValidDate(sourceStartDate) ? 'sourceStartDate: Invalid source start date format. Use YYYY-MM-DD format' : null,
    () => sourceEndDate && !isValidDate(sourceEndDate) ? 'sourceEndDate: Invalid source end date format. Use YYYY-MM-DD format' : null,
    () => targetStartDate && !isValidDate(targetStartDate) ? 'targetStartDate: Invalid target start date format. Use YYYY-MM-DD format' : null,
    () => {
      if (sourceStartDate && sourceEndDate) {
        const start = new Date(sourceStartDate);
        const end = new Date(sourceEndDate);
        return start >= end ? 'sourceEndDate: Source start date must be before source end date' : null;
      }
      return null;
    },
    () => {
      if (sourceStartDate && sourceEndDate) {
        const start = new Date(sourceStartDate);
        const end = new Date(sourceEndDate);
        const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff > 365 ? 'sourceEndDate: Cannot copy prices for more than 365 days at once' : null;
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

/**
 * Utility function to validate date strings
 */
function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}