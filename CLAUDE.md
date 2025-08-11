# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wezo.ae is a property rental platform (similar to Booking.com) focusing on villa listings in the UAE. The project is structured as a **monorepo** using npm workspaces to manage multiple applications.

## Project Structure

```
wezo-monorepo/
├── api-server/        # Backend API server (TypeScript, Express, Prisma)
├── homeowner-client/  # Frontend for property owners (planned)
├── tenant-client/     # Frontend for tenants/guests (planned)
├── manager-client/    # Management dashboard (planned)
└── docs/              # Requirements and UI mockups
```

## Development Setup

### Initial Setup

1. Install all workspace dependencies:
   ```bash
   npm install
   ```

### API Server Setup

1. Navigate to api-server and set up database:
   ```bash
   cd api-server
   npm run db:setup
   ```

2. Start the API server (from root):
   ```bash
   npm run dev:api
   ```

### Workspace Commands (from root)

- `npm run dev:api` - Start API server in development mode
- `npm run build:api` - Build API server
- `npm run test:api` - Run API server tests
- `npm install` - Install all workspace dependencies

### Direct API Server Commands (from api-server/)

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript  
- `npm start` - Start production server
- `npm test` - Run tests
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

#### Protected Endpoints (require JWT)
- `GET /api/auth/profile` - Get user profile

### Default Admin Account
- Username: `admin`
- Email: `admin@wezo.ae`
- Password: `Admin@123456`

## Frontend Architecture (Planned)

### Planned Features (from requirements)

The application will implement a 6-step villa registration wizard:
1. **Property Type & Location** - Google Maps integration for address autocomplete
2. **Villa Details** - Property specifications, amenities, host information
3. **Pricing & Policies** - Multi-rate pricing (base, weekly, non-refundable)
4. **Promotions & Availability** - Interactive calendar management
5. **House Rules & Cancellation** - Policy configuration
6. **Photos & Review** - Image upload with optimization

### Key Technical Requirements

- **Mapping Integration**: Google Maps API for location services
- **Image Processing**: Upload, optimization, and gallery management
- **Calendar System**: Availability management with blackout dates
- **Multi-language Support**: Host communication in multiple languages
- **Form Validation**: Multi-step wizard with progress tracking

### UI/UX Reference

The interface follows Booking.com patterns. UI mockups in `docs/homeowner-onboarding-villa-registration/` show:
- Clean, step-by-step wizard interface
- Toggle switches for amenities selection
- Interactive calendar for availability
- Drag-and-drop photo upload
- Real-time form validation

## Important Files

- `docs/homeowner-onboarding-villa-registration/Requirement.MD` - Complete functional requirements
- `docs/homeowner-onboarding-villa-registration/*.png` - UI mockups for all screens

## Development Guidelines

When implementing features:
1. Follow the UI mockups closely - they represent approved designs
2. Implement proper form validation for each wizard step
3. Ensure all data models support the fields specified in requirements
4. Build with internationalization in mind (multi-language support required)