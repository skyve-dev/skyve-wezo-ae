import { Request, Response, NextFunction } from 'express';

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

export const validateBankDetails = (req: Request, res: Response, next: NextFunction): void => {
  const { bankName, accountNumber, accountHolderName, sortCode, currency } = req.body;

  if (!bankName || typeof bankName !== 'string') {
    res.status(400).json({ error: 'Bank name is required' });
    return;
  }

  if (!accountNumber || typeof accountNumber !== 'string') {
    res.status(400).json({ error: 'Account number is required' });
    return;
  }

  if (accountNumber.length < 8 || accountNumber.length > 20) {
    res.status(400).json({ error: 'Account number must be between 8 and 20 characters' });
    return;
  }

  if (!accountHolderName || typeof accountHolderName !== 'string') {
    res.status(400).json({ error: 'Account holder name is required' });
    return;
  }

  if (sortCode && typeof sortCode !== 'string') {
    res.status(400).json({ error: 'Sort code must be a string' });
    return;
  }

  if (currency) {
    const validCurrencies = ['AED', 'USD', 'EUR', 'GBP'];
    if (!validCurrencies.includes(currency)) {
      res.status(400).json({ error: `Currency must be one of: ${validCurrencies.join(', ')}` });
      return;
    }
  }

  next();
};

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}