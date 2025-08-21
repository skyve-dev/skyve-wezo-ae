import { Request, Response, NextFunction } from 'express';

export const validateCreateNotification = (req: Request, res: Response, next: NextFunction): void => {
  const { userId, type, title, message } = req.body;

  if (!userId) {
    res.status(400).json({ error: 'userId is required' });
    return;
  }

  if (!type) {
    res.status(400).json({ error: 'type is required' });
    return;
  }

  const validTypes = [
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

  if (!validTypes.includes(type)) {
    res.status(400).json({ error: `type must be one of: ${validTypes.join(', ')}` });
    return;
  }

  if (!title || title.trim().length === 0) {
    res.status(400).json({ error: 'title is required and cannot be empty' });
    return;
  }

  if (!message || message.trim().length === 0) {
    res.status(400).json({ error: 'message is required and cannot be empty' });
    return;
  }

  if (title.length > 100) {
    res.status(400).json({ error: 'title cannot exceed 100 characters' });
    return;
  }

  if (message.length > 500) {
    res.status(400).json({ error: 'message cannot exceed 500 characters' });
    return;
  }

  next();
};

export const validateMarkAsRead = (req: Request, res: Response, next: NextFunction): void => {
  const { notificationIds } = req.body;

  if (!notificationIds) {
    res.status(400).json({ error: 'notificationIds is required' });
    return;
  }

  if (!Array.isArray(notificationIds)) {
    res.status(400).json({ error: 'notificationIds must be an array' });
    return;
  }

  if (notificationIds.length === 0) {
    res.status(400).json({ error: 'notificationIds cannot be empty' });
    return;
  }

  if (notificationIds.length > 100) {
    res.status(400).json({ error: 'Cannot mark more than 100 notifications at once' });
    return;
  }

  for (const id of notificationIds) {
    if (typeof id !== 'string' || id.trim().length === 0) {
      res.status(400).json({ error: 'All notification IDs must be non-empty strings' });
      return;
    }
  }

  next();
};

export const validateUpdatePreferences = (req: Request, res: Response, next: NextFunction): void => {
  const { types, emailEnabled, pushEnabled } = req.body;

  if (types !== undefined) {
    if (!Array.isArray(types)) {
      res.status(400).json({ error: 'types must be an array' });
      return;
    }

    const validTypes = [
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

    for (const type of types) {
      if (!validTypes.includes(type)) {
        res.status(400).json({ error: `Invalid notification type: ${type}` });
        return;
      }
    }
  }

  if (emailEnabled !== undefined && typeof emailEnabled !== 'boolean') {
    res.status(400).json({ error: 'emailEnabled must be a boolean' });
    return;
  }

  if (pushEnabled !== undefined && typeof pushEnabled !== 'boolean') {
    res.status(400).json({ error: 'pushEnabled must be a boolean' });
    return;
  }

  next();
};