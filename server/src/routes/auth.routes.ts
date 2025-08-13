import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import {
  validateRegistration,
  validateLogin,
  validatePasswordReset,
  validateNewPassword,
} from '../middleware/validation';

const router = Router();

router.post('/register', validateRegistration, authController.register);

router.post('/login', validateLogin, authController.login);

router.post('/password-reset/request', validatePasswordReset, authController.requestPasswordReset);

router.post('/password-reset/reset', validateNewPassword, authController.resetPassword);

router.get('/profile', authenticate, authController.getProfile);

router.put('/update-role', authenticate, authController.updateUserRole);

export default router;