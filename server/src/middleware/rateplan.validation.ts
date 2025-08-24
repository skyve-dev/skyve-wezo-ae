import { Request, Response, NextFunction } from 'express';
import { validateAndCollectErrors, returnValidationResponse, ValidationErrors } from './validation-helpers';

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

const validRatePlanTypes = ['FullyFlexible', 'NonRefundable', 'Custom'];
const validRestrictionTypes = [
  'MinLengthOfStay',
  'MaxLengthOfStay',
  'NoArrivals',
  'NoDepartures',
  'MinAdvancedReservation',
  'MaxAdvancedReservation',
];

export const validateRatePlanCreation = (req: Request, res: Response, next: NextFunction): void => {
  const { name, type, cancellationPolicy } = req.body;

  const validations = [
    () => !name ? 'name: Rate plan name is required' : null,
    () => typeof name !== 'string' ? 'name: Rate plan name must be text' : null,
    () => !type ? 'type: Rate plan type is required' : null,
    () => type && !validRatePlanTypes.includes(type) ? `type: Must be one of: ${validRatePlanTypes.join(', ')}` : null,
    () => !cancellationPolicy ? 'cancellationPolicy: Cancellation policy is required' : null,
    () => typeof cancellationPolicy !== 'string' ? 'cancellationPolicy: Cancellation policy must be text' : null,
  ];

  const errors = validateAndCollectErrors(validations);
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  next();
};

export const validateRatePlanUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { name, type, cancellationPolicy } = req.body;

  const validations = [
    () => name && typeof name !== 'string' ? 'name: Rate plan name must be text' : null,
    () => type && !validRatePlanTypes.includes(type) ? `type: Must be one of: ${validRatePlanTypes.join(', ')}` : null,
    () => cancellationPolicy && typeof cancellationPolicy !== 'string' ? 'cancellationPolicy: Cancellation policy must be text' : null,
  ];

  const errors = validateAndCollectErrors(validations);
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  next();
};

export const validatePriceUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { prices } = req.body;
  const errors: ValidationErrors = {};

  if (!Array.isArray(prices)) {
    errors['prices'] = 'Must be an array';
  } else if (prices.length === 0) {
    errors['prices'] = 'Cannot be empty';
  } else {
    // Check each price entry
    prices.forEach((price, index) => {
      if (!price.date || !isValidDate(price.date)) {
        errors[`prices[${index}].date`] = 'Must have a valid date';
      }
      if (typeof price.basePrice !== 'number' || price.basePrice <= 0) {
        errors[`prices[${index}].basePrice`] = 'Must be a positive number';
      }
      if (price.currency && price.currency !== 'AED') {
        errors[`prices[${index}].currency`] = 'Currency must be AED';
      }
    });
  }
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  next();
};

export const validateRestrictionUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { restrictions } = req.body;
  const errors: ValidationErrors = {};

  if (!Array.isArray(restrictions)) {
    errors['restrictions'] = 'Must be an array';
  } else {
    // Check each restriction
    restrictions.forEach((restriction, index) => {
      if (!restriction.type) {
        errors[`restrictions[${index}].type`] = 'Restriction type is required';
      } else if (!validRestrictionTypes.includes(restriction.type)) {
        errors[`restrictions[${index}].type`] = `Must be one of: ${validRestrictionTypes.join(', ')}`;
      }
      
      if (typeof restriction.value !== 'number' || restriction.value < 0) {
        errors[`restrictions[${index}].value`] = 'Must be a non-negative number';
      }
      
      if (restriction.startDate && !isValidDate(restriction.startDate)) {
        errors[`restrictions[${index}].startDate`] = 'Invalid start date format';
      }
      
      if (restriction.endDate && !isValidDate(restriction.endDate)) {
        errors[`restrictions[${index}].endDate`] = 'Invalid end date format';
      }
    });
  }
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  next();
};