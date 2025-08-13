# Wezo Server

A TypeScript-based backend server for the Wezo.ae property rental platform, built with Express.js, Prisma ORM, and PostgreSQL database.

## Features

### Authentication & User Management
- **User Authentication**: JWT-based authentication system with role support
- **User Registration**: Create new user accounts with username, email, and role
- **User Login**: Authenticate users with username/email and receive JWT tokens
- **Password Reset**: Secure password reset flow with time-limited tokens
- **Protected Routes**: Middleware for securing API endpoints
- **Role-based Access**: Support for TENANT, HOMEOWNER, and MANAGER roles

### Property Management
- **Property CRUD**: Complete property lifecycle management
- **Property Creation**: Single endpoint for creating properties with all details
- **Property Updates**: General updates and specialized endpoints for specific sections
- **Layout Management**: Rooms, beds, guest capacity, and property specifications
- **Amenities & Services**: Comprehensive amenity and service management
- **Rules & Policies**: Property rules, check-in/out times, and restrictions
- **Pricing & Cancellation**: Flexible pricing with promotions and cancellation policies
- **Photo Management**: Property photo upload and management
- **Owner Management**: Property ownership and permission controls

### Additional Features
- **Health Monitoring**: System health check endpoints
- **Admin Seeding**: Automatic admin account creation
- **Database Migrations**: Automated schema management

## Tech Stack

- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Testing**: Jest & Supertest with comprehensive test coverage

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
   Configure your PostgreSQL database connection in the `.env` file.

4. Set up the database:
   ```bash
   npm run db:setup
   ```
   This will run Prisma migrations and set up your database schema.

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

#### Get Property by ID
```
GET /api/properties/:propertyId
```

### Protected Endpoints (Require Authentication)

#### Authentication

##### Get User Profile
```
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Property Management

##### Create Property
```
POST /api/properties
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string",
  "address": {
    "apartmentOrFloorNumber": "string",
    "countryOrRegion": "string",
    "city": "string",
    "zipCode": number,
    "latLong": {
      "latitude": number,
      "longitude": number
    }
  },
  "layout": {
    "maximumGuest": number,
    "bathrooms": number,
    "allowChildren": boolean,
    "offerCribs": boolean,
    "propertySizeSqMtr": number,
    "rooms": [
      {
        "spaceName": "string",
        "beds": [
          {
            "typeOfBed": "TwinBed|FullBed|QueenBed|KingBed|BunkBed|SofaBed|FutonBed",
            "numberOfBed": number
          }
        ]
      }
    ]
  },
  "amenities": [
    {
      "name": "string",
      "category": "string"
    }
  ],
  "services": {
    "serveBreakfast": boolean,
    "parking": "YesFree|YesPaid|No",
    "languages": ["string"]
  },
  "rules": {
    "smokingAllowed": boolean,
    "partiesOrEventsAllowed": boolean,
    "petsAllowed": "Yes|No|UponRequest",
    "checkInCheckout": {
      "checkInFrom": "string",
      "checkInUntil": "string",
      "checkOutFrom": "string",
      "checkOutUntil": "string"
    }
  },
  "photos": [
    {
      "url": "string",
      "altText": "string",
      "description": "string",
      "tags": ["string"]
    }
  ],
  "bookingType": "BookInstantly|NeedToRequestBook",
  "paymentType": "Online|ByCreditCardAtProperty",
  "pricing": {
    "currency": "AED",
    "ratePerNight": number,
    "ratePerNightWeekend": number,
    "discountPercentageForNonRefundableRatePlan": number,
    "discountPercentageForWeeklyRatePlan": number,
    "promotion": {
      "type": "string",
      "percentage": number,
      "description": "string"
    }
  },
  "cancellation": {
    "daysBeforeArrivalFreeToCancel": number,
    "waiveCancellationFeeAccidentalBookings": boolean
  },
  "aboutTheProperty": "string",
  "aboutTheNeighborhood": "string",
  "firstDateGuestCanCheckIn": "string"
}
```

##### Update Property
```
PUT /api/properties/:propertyId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string",
  "aboutTheProperty": "string",
  "aboutTheNeighborhood": "string",
  // ... other updatable fields
}
```

##### Update Property Layout
```
PUT /api/properties/:propertyId/layout
Authorization: Bearer <token>
Content-Type: application/json

{
  "maximumGuest": number,
  "bathrooms": number,
  "allowChildren": boolean,
  "offerCribs": boolean,
  "propertySizeSqMtr": number,
  "rooms": [...]
}
```

##### Update Property Amenities
```
PUT /api/properties/:propertyId/amenities
Authorization: Bearer <token>
Content-Type: application/json

{
  "amenities": [
    {
      "name": "string",
      "category": "string"
    }
  ]
}
```

##### Update Property Services
```
PUT /api/properties/:propertyId/services
Authorization: Bearer <token>
Content-Type: application/json

{
  "serveBreakfast": boolean,
  "parking": "YesFree|YesPaid|No",
  "languages": ["string"]
}
```

##### Update Property Rules
```
PUT /api/properties/:propertyId/rules
Authorization: Bearer <token>
Content-Type: application/json

{
  "smokingAllowed": boolean,
  "partiesOrEventsAllowed": boolean,
  "petsAllowed": "Yes|No|UponRequest",
  "checkInCheckout": { ... }
}
```

##### Update Property Pricing
```
PUT /api/properties/:propertyId/pricing
Authorization: Bearer <token>
Content-Type: application/json

{
  "currency": "AED",
  "ratePerNight": number,
  "ratePerNightWeekend": number,
  // ... other pricing fields
}
```

##### Update Property Cancellation Policy
```
PUT /api/properties/:propertyId/cancellation
Authorization: Bearer <token>
Content-Type: application/json

{
  "daysBeforeArrivalFreeToCancel": number,
  "waiveCancellationFeeAccidentalBookings": boolean
}
```

##### Get Owner's Properties
```
GET /api/properties/my-properties
Authorization: Bearer <token>
```

##### Delete Property
```
DELETE /api/properties/:propertyId
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
DATABASE_URL="postgresql://username:password@localhost:5432/wezo_db"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
PASSWORD_RESET_TOKEN_EXPIRES_IN=1h
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4200
```

**Important**: 
- Use PostgreSQL for production deployments
- The DATABASE_URL should point to your PostgreSQL instance
- Change JWT_SECRET to a secure random string in production
- Configure ALLOWED_ORIGINS for your frontend domains

## Project Structure

```
src/
├── app.ts                          # Express application setup
├── server.ts                       # Server entry point
├── config/
│   └── database.ts                 # Prisma client configuration
├── controllers/
│   ├── auth.controller.ts          # Authentication logic
│   └── property.controller.ts      # Property management logic
├── middleware/
│   ├── auth.ts                     # JWT authentication middleware
│   └── property.validation.ts     # Property validation middleware
├── routes/
│   ├── auth.routes.ts              # Authentication routes
│   ├── property.routes.ts          # Property management routes
│   └── index.ts                    # Main router
├── services/
│   └── property.service.ts         # Property business logic
├── utils/
│   ├── jwt.ts                      # JWT utilities
│   └── password.ts                 # Password hashing utilities
├── types/
│   └── express.d.ts                # TypeScript type definitions
└── tests/
    ├── setup.ts                    # Test configuration and database cleanup
    ├── auth.test.ts                # Authentication tests (15 tests)
    └── property.test.ts            # Property API tests (31 tests)

prisma/
├── schema.prisma                   # Database schema definition
└── seed.ts                         # Database seeding script
```

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT token expiration
- CORS configuration
- Input validation middleware
- Environment variable configuration
- SQL injection protection via Prisma ORM

## Testing

The project includes comprehensive test coverage with **46 tests** across all API endpoints:

### Authentication Tests (15 tests)
- User registration validation and edge cases
- Login with username/email authentication
- Password reset flow with token validation
- Protected route access and JWT validation
- Input validation and error handling

### Property Management Tests (31 tests)
- Property creation with full data validation
- Property retrieval and ownership verification
- Property updates (general and specialized endpoints)
- Layout management (rooms, beds, guest capacity)
- Amenities and services management
- Rules and policies configuration
- Pricing and cancellation policy management
- Owner-specific property listing
- Property deletion with permission checks
- Comprehensive error handling and edge cases

### Test Architecture
- **Database Isolation**: Each test suite starts with a clean database state
- **Dynamic Test Data**: Unique identifiers prevent constraint violations
- **Comprehensive Coverage**: Tests cover success cases, error conditions, and edge cases
- **Performance Optimized**: Uses PostgreSQL TRUNCATE for efficient cleanup

Run tests with:
```bash
npm test                 # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
```

**Test Results**: 46/46 tests passing ✅

## Data Models

The application uses a comprehensive data model designed for property rental platforms:

### Core Models
- **User**: Authentication and role management (TENANT, HOMEOWNER, MANAGER)
- **Property**: Main property entity with all rental details
- **Address**: Property location with optional coordinates
- **Room & Bed**: Detailed layout specification
- **Amenity**: Property amenities with categorization
- **Photo**: Property image management
- **Pricing**: Flexible pricing with promotions and group rates
- **Cancellation**: Configurable cancellation policies

### Key Features
- **Complex Relationships**: Proper foreign key relationships with cascade operations
- **Enum Support**: Type-safe enums for booking types, payment methods, bed types, etc.
- **Flexible Pricing**: Support for weekend rates, group pricing, and promotional offers
- **Rich Property Data**: Comprehensive property information including layout, amenities, rules
- **Geographic Data**: Address with optional latitude/longitude coordinates

### Database Schema
The complete schema is defined in `prisma/schema.prisma` with proper relationships and constraints to ensure data integrity.

## License

ISC