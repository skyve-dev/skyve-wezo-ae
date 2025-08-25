# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wezo.ae is a property rental platform (similar to Booking.com) focusing on villa listings in the UAE. The project is structured as a **monorepo** using npm workspaces to manage multiple applications.

## Project Structure

```
wezo-monorepo/
├── server/            # Backend server (TypeScript, Express, Prisma)
└── docs/              # Requirements and UI mockups
```

## Development Setup

### Initial Setup

1. Install all workspace dependencies:
   ```bash
   npm install
   ```

### Server Setup

1. Navigate to server and set up database:
   ```bash
   cd server
   npm run db:setup
   ```

2. Start the server (from root):
   ```bash
   npm run dev:server
   ```

### Workspace Commands (from root)

- `npm run dev` - Start both client and server in development mode
- `npm run dev:server` - Start server in development mode
- `npm run dev:client` - Start client in development mode
- `npm run build:server` - Build server
- `npm run test:server` - Run server tests
- `npm install` - Install all workspace dependencies

### Direct Server Commands (from server/)

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript  
- `npm start` - Start production server
- `npm test` - Run tests (configured for sequential execution to avoid race conditions)
- `npm run lint` - Check TypeScript types
- `npm run prisma:seed` - Seed database with admin user

## Backend Architecture

### Technology Stack
- **TypeScript** with Node.js and Express.js
- **SQLite** database with Prisma ORM
- **JWT** authentication
- **bcrypt** for password hashing
- **Jest** and Supertest for testing

### API Endpoints

#### Public Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `POST /api/auth/password-reset/request` - Request password reset
- `POST /api/auth/password-reset/reset` - Reset password
- `GET /api/health` - Health check
- `GET /uploads/photos/*` - Static photo files (public access, no authentication)

#### Protected Endpoints (require JWT)
- `GET /api/auth/profile` - Get user profile

### File Upload System
- **Upload Directory**: `server/uploads/photos/`
- **Public Access**: All uploaded photos are publicly accessible via `/uploads/photos/filename`
- **No Authentication Required**: Static files bypass all authentication middleware
- **CORS Enabled**: Cross-origin access allowed for all uploaded files
- **Cache Headers**: Files served with 1-day cache for optimal performance
- **Supported Formats**: JPEG, PNG, WebP with proper MIME type headers

### Default Admin Account
- Username: `admin`
- Email: `admin@wezo.ae`
- Password: `Admin@123456`


## Important Files

- `docs/homeowner-onboarding-villa-registration/Requirement.MD` - Complete functional requirements
- `docs/homeowner-onboarding-villa-registration/*.png` - UI mockups for all screens

## Development Guidelines

When implementing features:
1. Follow established patterns and maintain code quality
2. Ensure proper error handling and validation
3. Write comprehensive tests for new functionality
4. Document APIs and complex business logic

### Testing Guidelines
- Jest is configured for **sequential execution** (`maxWorkers: 1`, `maxConcurrency: 1`)
- This prevents race conditions between tests that share database state
- All tests must pass when run individually AND when run together
- Use proper test isolation and cleanup in `beforeAll`/`afterAll` hooks