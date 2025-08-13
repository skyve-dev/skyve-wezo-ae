
// @ts-ignore
import request from 'supertest';
import app from '../app';
import prisma from '../config/database';
import { hashPassword } from '../utils/password';
import { describe, it, beforeAll, beforeEach, expect } from '@jest/globals';
import { cleanupDatabase } from './setup';

describe('Authentication Tests', () => {
  beforeAll(async () => {
    await cleanupDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const timestamp = Date.now();
      const newUser = {
        username: `testuser_${timestamp}`,
        email: `test_${timestamp}@example.com`,
        password: 'Test@123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe(newUser.username);
      expect(response.body.user.email).toBe(newUser.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject registration with existing username', async () => {
      const timestamp = Date.now();
      const existingUser = {
        username: `existinguser_${timestamp}`,
        email: `existing_${timestamp}@example.com`,
        password: await hashPassword('Test@123'),
        isAdmin: false,
      };

      await prisma.user.create({ data: existingUser });

      const newUser = {
        username: `existinguser_${timestamp}`,
        email: `new_${timestamp}@example.com`,
        password: 'Test@123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(409);

      expect(response.body.error).toBe('Username or email already exists');
    });

    it('should reject registration with invalid email', async () => {
      const timestamp = Date.now();
      const newUser = {
        username: `testuser_${timestamp}`,
        email: 'invalidemail',
        password: 'Test@123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(400);

      expect(response.body.error).toBe('Invalid email format');
    });

    it('should reject registration with short password', async () => {
      const timestamp = Date.now();
      const newUser = {
        username: `testuser_${timestamp}`,
        email: `test_${timestamp}@example.com`,
        password: 'short',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(400);

      expect(response.body.error).toBe('Password must be at least 6 characters long');
    });
  });

  describe('POST /api/auth/login', () => {
    let loginUser: any;
    
    beforeEach(async () => {
      const hashedPassword = await hashPassword('Test@123');
      const timestamp = Date.now();
      loginUser = await prisma.user.create({
        data: {
          username: `testuser_${timestamp}`,
          email: `test_${timestamp}@example.com`,
          password: hashedPassword,
          isAdmin: false,
        },
      });
    });

    it('should login with valid credentials (username)', async () => {
      const credentials = {
        username: loginUser.username,
        password: 'Test@123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe(loginUser.username);
    });

    it('should login with valid credentials (email)', async () => {
      const credentials = {
        username: loginUser.email,
        password: 'Test@123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginUser.email);
    });

    it('should reject login with invalid password', async () => {
      const credentials = {
        username: loginUser.username,
        password: 'wrongpassword',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject login with non-existent user', async () => {
      const credentials = {
        username: 'nonexistent',
        password: 'Test@123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/profile', () => {
    let token: string;

    beforeEach(async () => {
      const timestamp = Date.now();
      const newUser = {
        username: `testuser_${timestamp}`,
        email: `test_${timestamp}@example.com`,
        password: 'Test@123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      token = response.body.token;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toContain('testuser_');
      expect(response.body.user.email).toContain('@example.com');
    });

    it('should reject profile request without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });

    it('should reject profile request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);

      expect(response.body.error).toBe('Invalid or expired token');
    });
  });

  describe('Password Reset', () => {
    let resetUser: any;
    
    beforeEach(async () => {
      const timestamp = Date.now();
      resetUser = await prisma.user.create({
        data: {
          username: `testuser_${timestamp}`,
          email: `test_${timestamp}@example.com`,
          password: await hashPassword('OldPassword123'),
          isAdmin: false,
        },
      });
    });

    it('should request password reset successfully', async () => {
      const response = await request(app)
        .post('/api/auth/password-reset/request')
        .send({ email: resetUser.email })
        .expect(200);

      expect(response.body.message).toBe('If the email exists, a password reset link has been sent');
      expect(response.body).toHaveProperty('resetToken');
    });

    it('should handle password reset request for non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/password-reset/request')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body.message).toBe('If the email exists, a password reset link has been sent');
    });

    it('should reset password with valid token', async () => {
      // Create a fresh user for this test
      await prisma.user.create({
        data: {
          username: 'resetuser',
          email: 'reset@example.com',
          password: await hashPassword('OldPassword123'),
          isAdmin: false,
        },
      });

      const resetResponse = await request(app)
        .post('/api/auth/password-reset/request')
        .send({ email: 'reset@example.com' });

      const { resetToken } = resetResponse.body;

      const response = await request(app)
        .post('/api/auth/password-reset/reset')
        .send({
          token: resetToken,
          newPassword: 'NewPassword123',
        })
        .expect(200);

      expect(response.body.message).toBe('Password has been reset successfully');

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'resetuser',
          password: 'NewPassword123',
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('token');
    });

    it('should reject password reset with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/password-reset/reset')
        .send({
          token: 'invalidtoken',
          newPassword: 'NewPassword123',
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid or expired reset token');
    });
  });
});