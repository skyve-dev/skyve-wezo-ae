import { Request, Response, NextFunction } from 'express';

// Helper interface for validation errors
interface ValidationErrors {
  [field: string]: string;
}

// Helper function to collect and return validation errors
const validateAndCollectErrors = (validations: Array<() => string | null>): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  validations.forEach(validation => {
    const result = validation();
    if (result) {
      const [field, message] = result.split(':', 2);
      errors[field] = message.trim();
    }
  });
  
  return errors;
};

// Helper function to return validation response
const returnValidationResponse = (res: Response, errors: ValidationErrors): void => {
  if (Object.keys(errors).length > 0) {
    res.status(400).json({ errors });
  }
};

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

export const validateReservationUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { checkInDate, checkOutDate, guestCount, totalPrice, status } = req.body;

  const validations = [
    () => checkInDate && !isValidDate(checkInDate) ? 'checkInDate: Invalid check-in date format' : null,
    () => checkOutDate && !isValidDate(checkOutDate) ? 'checkOutDate: Invalid check-out date format' : null,
    () => {
      if (checkInDate && checkOutDate) {
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        return checkIn >= checkOut ? 'checkOutDate: Check-in date must be before check-out date' : null;
      }
      return null;
    },
    () => guestCount !== undefined && (typeof guestCount !== 'number' || guestCount <= 0) ? 'guestCount: Must be a positive number' : null,
    () => totalPrice !== undefined && (typeof totalPrice !== 'number' || totalPrice < 0) ? 'totalPrice: Must be a non-negative number' : null,
    () => {
      if (status) {
        const validStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'NoShow'];
        return !validStatuses.includes(status) ? `status: Must be one of: ${validStatuses.join(', ')}` : null;
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

export const validateNoShow = (req: Request, res: Response, next: NextFunction): void => {
  const { reason } = req.body;

  const validations = [
    () => !reason ? 'reason: Reason for no-show is required' : null,
    () => typeof reason !== 'string' ? 'reason: Reason must be text' : null,
    () => reason && reason.length < 10 ? 'reason: Reason must be at least 10 characters long' : null,
  ];

  const errors = validateAndCollectErrors(validations);
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  next();
};

export const validateGuestMessage = (req: Request, res: Response, next: NextFunction): void => {
  const { message } = req.body;

  const validations = [
    () => !message ? 'message: Message content is required' : null,
    () => typeof message !== 'string' ? 'message: Message must be text' : null,
    () => message && message.trim().length === 0 ? 'message: Message cannot be empty' : null,
    () => message && message.length > 1000 ? 'message: Message cannot exceed 1000 characters' : null,
  ];

  const errors = validateAndCollectErrors(validations);
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  next();
};

export const validateReviewResponse = (req: Request, res: Response, next: NextFunction): void => {
  const { response } = req.body;

  const validations = [
    () => !response ? 'response: Response content is required' : null,
    () => typeof response !== 'string' ? 'response: Response must be text' : null,
    () => response && response.trim().length < 10 ? 'response: Response must be at least 10 characters long' : null,
    () => response && response.length > 500 ? 'response: Response cannot exceed 500 characters' : null,
  ];

  const errors = validateAndCollectErrors(validations);
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  next();
};