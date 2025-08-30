import jwt from 'jsonwebtoken';
import { User, UserRole } from '@prisma/client';
import JWT_CONFIG from '../config/jwt';

// Use centralized JWT configuration
const { secret: JWT_SECRET, expiresIn: JWT_EXPIRES_IN } = JWT_CONFIG;

export interface JWTPayload {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isAdmin: boolean;
}

export const generateToken = (user: Pick<User, 'id' | 'username' | 'email' | 'role' | 'isAdmin'>): string => {
  const payload: JWTPayload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    isAdmin: user.isAdmin,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error: any) {
    throw error;
  }
};

export const generatePasswordResetToken = (userId: string): string => {
  return jwt.sign(
    { userId, type: 'password-reset' }, 
    JWT_SECRET, 
    { expiresIn: JWT_CONFIG.passwordResetExpiresIn } as any
  );
};