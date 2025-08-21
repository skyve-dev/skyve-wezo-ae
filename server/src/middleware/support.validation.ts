import { Request, Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';

export const validateCreateTicket = [
  body('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['Technical', 'Billing', 'General', 'PropertyManagement', 'BookingIssues'])
    .withMessage('Invalid category'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Urgent'])
    .withMessage('Invalid priority'),
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object'),
  handleValidationErrors,
];

export const validateTicketFilters = [
  query('status')
    .optional()
    .isIn(['Open', 'InProgress', 'Resolved', 'Closed'])
    .withMessage('Invalid status filter'),
  query('category')
    .optional()
    .isIn(['Technical', 'Billing', 'General', 'PropertyManagement', 'BookingIssues'])
    .withMessage('Invalid category filter'),
  query('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Urgent'])
    .withMessage('Invalid priority filter'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors,
];

export const validateAddMessage = [
  param('ticketId')
    .notEmpty()
    .withMessage('Ticket ID is required')
    .isUUID()
    .withMessage('Invalid ticket ID format'),
  body('content')
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message content must be between 1 and 2000 characters'),
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array'),
  handleValidationErrors,
];

export const validateUpdateTicket = [
  param('ticketId')
    .notEmpty()
    .withMessage('Ticket ID is required')
    .isUUID()
    .withMessage('Invalid ticket ID format'),
  body('subject')
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Urgent'])
    .withMessage('Invalid priority'),
  body('status')
    .optional()
    .isIn(['Open', 'InProgress', 'Resolved', 'Closed'])
    .withMessage('Invalid status'),
  handleValidationErrors,
];

export const validateCloseTicket = [
  param('ticketId')
    .notEmpty()
    .withMessage('Ticket ID is required')
    .isUUID()
    .withMessage('Invalid ticket ID format'),
  body('resolution')
    .optional()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Resolution must be between 10 and 1000 characters'),
  handleValidationErrors,
];

export const validateSatisfactionRating = [
  param('ticketId')
    .notEmpty()
    .withMessage('Ticket ID is required')
    .isUUID()
    .withMessage('Invalid ticket ID format'),
  body('satisfaction')
    .notEmpty()
    .withMessage('Satisfaction rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Satisfaction rating must be between 1 and 5'),
  handleValidationErrors,
];

export const validateFAQFilters = [
  query('category')
    .optional()
    .isString()
    .withMessage('Category must be a string'),
  query('search')
    .optional()
    .isString()
    .withMessage('Search term must be a string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Search term must be between 2 and 100 characters'),
  handleValidationErrors,
];

export const validateGuideFilters = [
  query('category')
    .optional()
    .isString()
    .withMessage('Category must be a string'),
  query('search')
    .optional()
    .isString()
    .withMessage('Search term must be a string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Search term must be between 2 and 100 characters'),
  handleValidationErrors,
];

export const validateGuideId = [
  param('guideId')
    .notEmpty()
    .withMessage('Guide ID is required')
    .isUUID()
    .withMessage('Invalid guide ID format'),
  handleValidationErrors,
];

export const validateFAQId = [
  param('faqId')
    .notEmpty()
    .withMessage('FAQ ID is required')
    .isUUID()
    .withMessage('Invalid FAQ ID format'),
  handleValidationErrors,
];

function handleValidationErrors(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
    return;
  }
  next();
}