import { Request, Response, NextFunction } from 'express';

export const validateReservationUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { checkInDate, checkOutDate, guestCount, totalPrice, status } = req.body;

  if (checkInDate && !isValidDate(checkInDate)) {
    res.status(400).json({ error: 'Invalid check-in date format' });
    return;
  }

  if (checkOutDate && !isValidDate(checkOutDate)) {
    res.status(400).json({ error: 'Invalid check-out date format' });
    return;
  }

  if (checkInDate && checkOutDate) {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (checkIn >= checkOut) {
      res.status(400).json({ error: 'Check-in date must be before check-out date' });
      return;
    }
  }

  if (guestCount !== undefined && (typeof guestCount !== 'number' || guestCount <= 0)) {
    res.status(400).json({ error: 'Guest count must be a positive number' });
    return;
  }

  if (totalPrice !== undefined && (typeof totalPrice !== 'number' || totalPrice < 0)) {
    res.status(400).json({ error: 'Total price must be a non-negative number' });
    return;
  }

  if (status) {
    const validStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'NoShow'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
      return;
    }
  }

  next();
};

export const validateNoShow = (req: Request, res: Response, next: NextFunction): void => {
  const { reason } = req.body;

  if (!reason || typeof reason !== 'string') {
    res.status(400).json({ error: 'Reason for no-show is required' });
    return;
  }

  if (reason.length < 10) {
    res.status(400).json({ error: 'Reason must be at least 10 characters long' });
    return;
  }

  next();
};

export const validateGuestMessage = (req: Request, res: Response, next: NextFunction): void => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Message content is required' });
    return;
  }

  if (message.trim().length === 0) {
    res.status(400).json({ error: 'Message cannot be empty' });
    return;
  }

  if (message.length > 1000) {
    res.status(400).json({ error: 'Message cannot exceed 1000 characters' });
    return;
  }

  next();
};

export const validateReviewResponse = (req: Request, res: Response, next: NextFunction): void => {
  const { response } = req.body;

  if (!response || typeof response !== 'string') {
    res.status(400).json({ error: 'Response content is required' });
    return;
  }

  if (response.trim().length < 10) {
    res.status(400).json({ error: 'Response must be at least 10 characters long' });
    return;
  }

  if (response.length > 500) {
    res.status(400).json({ error: 'Response cannot exceed 500 characters' });
    return;
  }

  next();
};

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}