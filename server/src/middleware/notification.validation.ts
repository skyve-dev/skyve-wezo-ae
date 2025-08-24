import { Request, Response, NextFunction } from 'express';
import { validateAndCollectErrors, returnValidationResponse, ValidationErrors } from './validation-helpers';

const validNotificationTypes = [
  'ReservationConfirmed',
  'ReservationCancelled',
  'ReservationModified',
  'PaymentReceived',
  'ReviewReceived',
  'PropertyApproved',
  'PropertyRejected',
  'SystemMaintenance',
  'SecurityAlert',
  'PromotionalOffer',
  'PolicyUpdate',
  'Other',
];

export const validateCreateNotification = (req: Request, res: Response, next: NextFunction): void => {
  const { userId, type, title, message } = req.body;

  const validations = [
    () => !userId ? 'userId: User ID is required' : null,
    () => !type ? 'type: Notification type is required' : null,
    () => type && !validNotificationTypes.includes(type) ? `type: Must be one of: ${validNotificationTypes.join(', ')}` : null,
    () => !title ? 'title: Title is required' : null,
    () => title && title.trim().length === 0 ? 'title: Title cannot be empty' : null,
    () => title && title.length > 100 ? 'title: Title cannot exceed 100 characters' : null,
    () => !message ? 'message: Message is required' : null,
    () => message && message.trim().length === 0 ? 'message: Message cannot be empty' : null,
    () => message && message.length > 500 ? 'message: Message cannot exceed 500 characters' : null,
  ];

  const errors = validateAndCollectErrors(validations);
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  next();
};

export const validateMarkAsRead = (req: Request, res: Response, next: NextFunction): void => {
  const { notificationIds } = req.body;
  const errors: ValidationErrors = {};

  if (!notificationIds) {
    errors['notificationIds'] = 'Notification IDs are required';
  } else if (!Array.isArray(notificationIds)) {
    errors['notificationIds'] = 'Must be an array';
  } else if (notificationIds.length === 0) {
    errors['notificationIds'] = 'Cannot be empty';
  } else if (notificationIds.length > 100) {
    errors['notificationIds'] = 'Cannot mark more than 100 notifications at once';
  } else {
    // Check individual notification IDs
    notificationIds.forEach((id, index) => {
      if (typeof id !== 'string' || id.trim().length === 0) {
        errors[`notificationIds[${index}]`] = 'Must be a non-empty string';
      }
    });
  }
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  next();
};

export const validateUpdatePreferences = (req: Request, res: Response, next: NextFunction): void => {
  const { types, emailEnabled, pushEnabled } = req.body;
  const errors: ValidationErrors = {};

  if (types !== undefined) {
    if (!Array.isArray(types)) {
      errors['types'] = 'Must be an array';
    } else {
      // Check each type
      types.forEach((type, index) => {
        if (!validNotificationTypes.includes(type)) {
          errors[`types[${index}]`] = `Invalid notification type: ${type}`;
        }
      });
    }
  }

  if (emailEnabled !== undefined && typeof emailEnabled !== 'boolean') {
    errors['emailEnabled'] = 'Must be true or false';
  }

  if (pushEnabled !== undefined && typeof pushEnabled !== 'boolean') {
    errors['pushEnabled'] = 'Must be true or false';
  }
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  next();
};