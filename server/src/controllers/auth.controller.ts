import { Request, Response } from 'express';
import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import crypto from 'crypto';
import { logControllerAction, logError } from '../middleware/logger';

export const register = async (req: Request, res: Response): Promise<void> => {
  logControllerAction('AuthController', 'register', req);
  try {
    const { username, email, password } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      res.status(409).json({ error: 'Username or email already exists' });
      return;
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isAdmin: true,
        createdAt: true,
      },
    });

    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    logError(error as Error, req);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  logControllerAction('AuthController', 'login', req);
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email: username }],
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    logError(error as Error, req);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  logControllerAction('AuthController', 'requestPasswordReset', req);
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.json({ message: 'If the email exists, a password reset link has been sent' });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetExpires = new Date(Date.now() + 3600000); 

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: resetExpires,
      },
    });

    res.json({
      message: 'If the email exists, a password reset link has been sent',
      resetToken,
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    logError(error as Error, req);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  logControllerAction('AuthController', 'resetPassword', req);
  try {
    const { token, newPassword } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      res.status(400).json({ error: 'Invalid or expired reset token' });
      return;
    }

    const hashedPassword = await hashPassword(newPassword);

    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });

      res.json({ message: 'Password has been reset successfully' });
    } catch (updateError: any) {
      // If user was deleted after we found them, treat as invalid token
      if (updateError.code === 'P2025') {
        res.status(400).json({ error: 'Invalid or expired reset token' });
        return;
      }
      throw updateError;
    }
  } catch (error) {
    console.error('Password reset error:', error);
    logError(error as Error, req);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  logControllerAction('AuthController', 'getProfile', req);
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    logError(error as Error, req);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  logControllerAction('AuthController', 'updateUserRole', req);
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { role } = req.body;

    // Validate role
    if (!['Tenant', 'HomeOwner', 'Manager'].includes(role)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }

    // For security, only allow upgrading to HomeOwner when user creates first property
    // Manager role should only be set by admins (not implemented in this basic version)
    if (role === 'HomeOwner') {
      // Check if user has at least one property
      const propertyCount = await prisma.property.count({
        where: { ownerId: req.user.id }
      });

      if (propertyCount === 0) {
        res.status(400).json({ error: 'Can only upgrade to HomeOwner role after creating a property' });
        return;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { role },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate new token with updated role
    const token = generateToken(updatedUser);

    res.json({
      message: 'Role updated successfully',
      user: updatedUser,
      token
    });
  } catch (error) {
    console.error('Update role error:', error);
    logError(error as Error, req);
    res.status(500).json({ error: 'Internal server error' });
  }
};