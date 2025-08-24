import { Request, Response, NextFunction } from 'express';
import { validateAndCollectErrors, returnValidationResponse } from './validation-helpers';

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

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

export const validateBankDetails = (req: Request, res: Response, next: NextFunction): void => {
  const { bankName, accountNumber, accountHolderName, sortCode, currency } = req.body;

  const validations = [
    () => !bankName ? 'bankName: Bank name is required' : null,
    () => typeof bankName !== 'string' ? 'bankName: Bank name must be text' : null,
    () => !accountNumber ? 'accountNumber: Account number is required' : null,
    () => typeof accountNumber !== 'string' ? 'accountNumber: Account number must be text' : null,
    () => accountNumber && (accountNumber.length < 8 || accountNumber.length > 20) ? 'accountNumber: Account number must be between 8 and 20 characters' : null,
    () => !accountHolderName ? 'accountHolderName: Account holder name is required' : null,
    () => typeof accountHolderName !== 'string' ? 'accountHolderName: Account holder name must be text' : null,
    () => sortCode && typeof sortCode !== 'string' ? 'sortCode: Sort code must be text' : null,
    () => {
      if (currency) {
        const validCurrencies = ['AED', 'USD', 'EUR', 'GBP'];
        return !validCurrencies.includes(currency) ? `currency: Must be one of: ${validCurrencies.join(', ')}` : null;
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