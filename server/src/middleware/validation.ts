import { Request, Response, NextFunction } from 'express';
import { logMiddleware } from './logger';

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

export const validateRegistration = (req: Request, res: Response, next: NextFunction): void => {
  logMiddleware('validateRegistration')(req, res, () => {});
  const { username, email, password } = req.body;

  const validations = [
    () => !username ? 'username: Username is required' : null,
    () => !email ? 'email: Email is required' : null,
    () => !password ? 'password: Password is required' : null,
    () => username && username.length < 3 ? 'username: Username must be at least 3 characters long' : null,
    () => {
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(email) ? 'email: Invalid email format' : null;
      }
      return null;
    },
    () => password && password.length < 6 ? 'password: Password must be at least 6 characters long' : null,
  ];

  const errors = validateAndCollectErrors(validations);
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  logMiddleware('validateLogin')(req, res, () => {});
  const { username, password } = req.body;

  const validations = [
    () => !username ? 'username: Username is required' : null,
    () => !password ? 'password: Password is required' : null,
  ];

  const errors = validateAndCollectErrors(validations);
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  next();
};

export const validatePasswordReset = (req: Request, res: Response, next: NextFunction): void => {
  logMiddleware('validatePasswordReset')(req, res, () => {});
  const { email } = req.body;

  const validations = [
    () => !email ? 'email: Email is required' : null,
    () => {
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(email) ? 'email: Invalid email format' : null;
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

export const validateNewPassword = (req: Request, res: Response, next: NextFunction): void => {
  logMiddleware('validateNewPassword')(req, res, () => {});
  const { token, newPassword } = req.body;

  const validations = [
    () => !token ? 'token: Token is required' : null,
    () => !newPassword ? 'newPassword: New password is required' : null,
    () => newPassword && newPassword.length < 6 ? 'newPassword: Password must be at least 6 characters long' : null,
  ];

  const errors = validateAndCollectErrors(validations);
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  next();
};