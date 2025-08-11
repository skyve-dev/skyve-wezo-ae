# Wezo Server

A TypeScript-based backend server built with Express.js, Prisma ORM, and SQLite database.

## Features

- **User Authentication**: JWT-based authentication system
- **User Registration**: Create new user accounts with username and email
- **User Login**: Authenticate users and receive JWT tokens
- **Password Reset**: Request and reset forgotten passwords
- **Protected Routes**: Middleware for securing API endpoints
- **Admin Seeding**: Automatic admin account creation

## Tech Stack

- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: SQLite
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Testing**: Jest & Supertest

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

4. Set up the database:
   ```bash
   npm run db:setup
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run prisma:seed` - Seed database with admin user
- `npm run lint` - Check TypeScript types

## API Endpoints

### Public Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "string", // or email
  "password": "string"
}
```

#### Request Password Reset
```
POST /api/auth/password-reset/request
Content-Type: application/json

{
  "email": "string"
}
```

#### Reset Password
```
POST /api/auth/password-reset/reset
Content-Type: application/json

{
  "token": "string",
  "newPassword": "string"
}
```

#### Health Check
```
GET /api/health
```

### Protected Endpoints

#### Get User Profile
```
GET /api/auth/profile
Authorization: Bearer <token>
```

## Default Admin Account

After running the seed script, an admin account is created with:
- **Username**: admin
- **Email**: admin@wezo.ae
- **Password**: Admin@123456

⚠️ **Important**: Change the admin password after first login!

## Environment Variables

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
PASSWORD_RESET_TOKEN_EXPIRES_IN=1h
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4200
```

## Project Structure

```
src/
├── app.ts                 # Express application setup
├── server.ts              # Server entry point
├── config/
│   └── database.ts        # Prisma client configuration
├── controllers/
│   └── auth.controller.ts # Authentication logic
├── middleware/
│   ├── auth.ts            # JWT authentication middleware
│   └── validation.ts      # Request validation middleware
├── routes/
│   ├── auth.routes.ts     # Authentication routes
│   └── index.ts           # Main router
├── utils/
│   ├── jwt.ts             # JWT utilities
│   └── password.ts        # Password hashing utilities
├── types/
│   └── express.d.ts       # TypeScript type definitions
└── tests/
    ├── setup.ts           # Test setup
    └── auth.test.ts       # Authentication tests
```

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT token expiration
- CORS configuration
- Input validation middleware
- Environment variable configuration
- SQL injection protection via Prisma ORM

## Testing

The project includes comprehensive test coverage for all authentication endpoints:
- User registration validation
- Login with username/email
- Password reset flow
- Protected route access
- Input validation

Run tests with:
```bash
npm test
```

## License

ISC