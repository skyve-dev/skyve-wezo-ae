import { Response } from 'express';

// Helper interface for validation errors
export interface ValidationErrors {
  [field: string]: string;
}

// Helper function to collect and return validation errors
export const validateAndCollectErrors = (validations: Array<() => string | null>): ValidationErrors => {
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
export const returnValidationResponse = (res: Response, errors: ValidationErrors): void => {
  if (Object.keys(errors).length > 0) {
    res.status(400).json({ errors });
  }
};