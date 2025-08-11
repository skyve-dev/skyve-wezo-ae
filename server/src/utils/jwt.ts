import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
}

export const generateToken = (user: Pick<User, 'id' | 'username' | 'email' | 'isAdmin'>): string => {
  const payload: JWTPayload = {
    id: user.id,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};

export const generatePasswordResetToken = (userId: string): string => {
  return jwt.sign(
    { userId, type: 'password-reset' }, 
    JWT_SECRET, 
    { expiresIn: process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN || '1h' } as any
  );
};