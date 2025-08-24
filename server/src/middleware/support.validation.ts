import { Request, Response, NextFunction } from 'express';
import { validateAndCollectErrors, returnValidationResponse } from './validation-helpers';

const validCategories = ['Technical', 'Billing', 'General', 'PropertyManagement', 'BookingIssues'];
const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
const validStatuses = ['Open', 'InProgress', 'Resolved', 'Closed'];

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export const validateCreateTicket = (req: Request, res: Response, next: NextFunction): void => {
  const { subject, description, category, priority, attachments, metadata } = req.body;

  const validations = [
    () => !subject ? 'subject: Subject is required' : null,
    () => subject && (subject.length < 5 || subject.length > 200) ? 'subject: Subject must be between 5 and 200 characters' : null,
    () => !description ? 'description: Description is required' : null,
    () => description && (description.length < 10 || description.length > 2000) ? 'description: Description must be between 10 and 2000 characters' : null,
    () => !category ? 'category: Category is required' : null,
    () => category && !validCategories.includes(category) ? `category: Must be one of: ${validCategories.join(', ')}` : null,
    () => priority && !validPriorities.includes(priority) ? `priority: Must be one of: ${validPriorities.join(', ')}` : null,
    () => attachments && !Array.isArray(attachments) ? 'attachments: Must be an array' : null,
    () => metadata && typeof metadata !== 'object' ? 'metadata: Must be an object' : null,
  ];

  const errors = validateAndCollectErrors(validations);
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  next();
};

export const validateTicketFilters = (req: Request, res: Response, next: NextFunction): void => {
  const { status, category, priority, page, limit } = req.query;

  const validations = [
    () => status && !validStatuses.includes(status as string) ? 'status: Invalid status filter' : null,
    () => category && !validCategories.includes(category as string) ? 'category: Invalid category filter' : null,
    () => priority && !validPriorities.includes(priority as string) ? 'priority: Invalid priority filter' : null,
    () => page && (isNaN(Number(page)) || Number(page) < 1) ? 'page: Page must be a positive integer' : null,
    () => limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100) ? 'limit: Limit must be between 1 and 100' : null,
  ];

  const errors = validateAndCollectErrors(validations);
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  next();
};

export const validateAddMessage = (req: Request, res: Response, next: NextFunction): void => {
  const { ticketId } = req.params;
  const { content, attachments } = req.body;

  const validations = [
    () => !ticketId ? 'ticketId: Ticket ID is required' : null,
    () => ticketId && !isValidUUID(ticketId) ? 'ticketId: Invalid ticket ID format' : null,
    () => !content ? 'content: Message content is required' : null,
    () => content && (content.length < 1 || content.length > 2000) ? 'content: Message content must be between 1 and 2000 characters' : null,
    () => attachments && !Array.isArray(attachments) ? 'attachments: Must be an array' : null,
  ];

  const errors = validateAndCollectErrors(validations);
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  next();
};

export const validateUpdateTicket = (req: Request, res: Response, next: NextFunction): void => {
  const { ticketId } = req.params;
  const { subject, priority, status } = req.body;

  const validations = [
    () => !ticketId ? 'ticketId: Ticket ID is required' : null,
    () => ticketId && !isValidUUID(ticketId) ? 'ticketId: Invalid ticket ID format' : null,
    () => subject && (subject.length < 5 || subject.length > 200) ? 'subject: Subject must be between 5 and 200 characters' : null,
    () => priority && !validPriorities.includes(priority) ? `priority: Must be one of: ${validPriorities.join(', ')}` : null,
    () => status && !validStatuses.includes(status) ? `status: Must be one of: ${validStatuses.join(', ')}` : null,
  ];

  const errors = validateAndCollectErrors(validations);
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  next();
};

export const validateCloseTicket = (req: Request, res: Response, next: NextFunction): void => {
  const { ticketId } = req.params;
  const { resolution } = req.body;

  const validations = [
    () => !ticketId ? 'ticketId: Ticket ID is required' : null,
    () => ticketId && !isValidUUID(ticketId) ? 'ticketId: Invalid ticket ID format' : null,
    () => resolution && (resolution.length < 10 || resolution.length > 1000) ? 'resolution: Resolution must be between 10 and 1000 characters' : null,
  ];

  const errors = validateAndCollectErrors(validations);
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  next();
};

export const validateSatisfactionRating = (req: Request, res: Response, next: NextFunction): void => {
  const { ticketId } = req.params;
  const { satisfaction } = req.body;

  const validations = [
    () => !ticketId ? 'ticketId: Ticket ID is required' : null,
    () => ticketId && !isValidUUID(ticketId) ? 'ticketId: Invalid ticket ID format' : null,
    () => !satisfaction ? 'satisfaction: Satisfaction rating is required' : null,
    () => satisfaction && (typeof satisfaction !== 'number' || satisfaction < 1 || satisfaction > 5) ? 'satisfaction: Satisfaction rating must be between 1 and 5' : null,
  ];

  const errors = validateAndCollectErrors(validations);
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  next();
};

export const validateFAQFilters = (req: Request, res: Response, next: NextFunction): void => {
  const { category, search } = req.query;

  const validations = [
    () => category && typeof category !== 'string' ? 'category: Category must be text' : null,
    () => search && typeof search !== 'string' ? 'search: Search term must be text' : null,
    () => {
      if (search && typeof search === 'string') {
        return (search.length < 2 || search.length > 100) ? 'search: Search term must be between 2 and 100 characters' : null;
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

export const validateGuideFilters = (req: Request, res: Response, next: NextFunction): void => {
  const { category, search } = req.query;

  const validations = [
    () => category && typeof category !== 'string' ? 'category: Category must be text' : null,
    () => search && typeof search !== 'string' ? 'search: Search term must be text' : null,
    () => {
      if (search && typeof search === 'string') {
        return (search.length < 2 || search.length > 100) ? 'search: Search term must be between 2 and 100 characters' : null;
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

export const validateGuideId = (req: Request, res: Response, next: NextFunction): void => {
  const { guideId } = req.params;

  const validations = [
    () => !guideId ? 'guideId: Guide ID is required' : null,
    () => guideId && !isValidUUID(guideId) ? 'guideId: Invalid guide ID format' : null,
  ];

  const errors = validateAndCollectErrors(validations);
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  next();
};

export const validateFAQId = (req: Request, res: Response, next: NextFunction): void => {
  const { faqId } = req.params;

  const validations = [
    () => !faqId ? 'faqId: FAQ ID is required' : null,
    () => faqId && !isValidUUID(faqId) ? 'faqId: Invalid FAQ ID format' : null,
  ];

  const errors = validateAndCollectErrors(validations);
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  next();
};