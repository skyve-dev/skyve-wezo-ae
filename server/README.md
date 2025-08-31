# Wezo Server 🏠

A robust, scalable TypeScript-based backend server for the Wezo.ae property rental platform. Built with modern architectural patterns, comprehensive testing, and enterprise-grade security features.

## 🏗️ Architecture Overview

### Tech Stack
- **Language**: TypeScript 5.x - Full type safety and modern language features
- **Framework**: Express.js 5.x - Fast, minimalist web framework
- **Database**: PostgreSQL - ACID-compliant relational database
- **ORM**: Prisma - Type-safe database client with migrations
- **Authentication**: JWT - Stateless token-based authentication
- **Password Security**: bcrypt - Adaptive hashing with salt rounds
- **Testing**: Jest + Supertest - Comprehensive test coverage (237 tests, 100% passing)
- **Development**: Nodemon + ts-node - Hot reload development experience

### Design Patterns & Principles

#### 1. **Layered Architecture Pattern**
```typescript
// Clear separation of concerns across layers
Routes → Controllers → Services → Repositories → Database

// ✅ Example: Property creation flow
POST /api/properties
  ↓ property.routes.ts (routing & middleware)
  ↓ property.controller.ts (request/response handling)
  ↓ property.service.ts (business logic)
  ↓ prisma client (data access)
  ↓ PostgreSQL database
```

#### 2. **Repository Pattern with Prisma**
```typescript
// ✅ Clean data access abstraction
export class PropertyService {
  async createProperty(data: CreatePropertyData, ownerId: string) {
    // Business logic validation
    await this.validatePropertyData(data);
    
    // Database operations through Prisma
    return await prisma.property.create({
      data: { ...data, ownerId },
      include: { address: true, layout: true }
    });
  }
}
```

#### 3. **Middleware Chain Pattern**
```typescript
// ✅ Composable middleware for cross-cutting concerns
router.post('/properties',
  authenticateToken,        // Authentication
  validateProperty,         // Input validation
  propertyController.create // Business logic
);
```

#### 4. **Domain-Driven Design (DDD)**
```typescript
// ✅ Rich domain models with behavior
interface Property {
  id: string;
  name: string;
  address: Address;
  layout: PropertyLayout;
  pricing: PricingStrategy;
  
  // Domain methods
  calculateTotalPrice(nights: number): number;
  isAvailableForDates(checkIn: Date, checkOut: Date): boolean;
  updatePricing(newPricing: PricingStrategy): void;
}
```

#### 5. **SOLID Principles Implementation**
- **Single Responsibility**: Each service handles one domain area
- **Open/Closed**: Extensible through interfaces and composition
- **Liskov Substitution**: Consistent interfaces across implementations
- **Interface Segregation**: Focused, specific interfaces
- **Dependency Inversion**: Depend on abstractions, not concrete implementations

## 📁 Project Structure & Organization

```
server/
├── src/                              # Source code
│   ├── app.ts                        # Express app configuration
│   ├── server.ts                     # Application entry point
│   │
│   ├── config/                       # Configuration modules
│   │   └── database.ts               # Prisma client setup
│   │
│   ├── controllers/                  # Request/Response handlers
│   │   ├── auth.controller.ts        # Authentication endpoints
│   │   ├── property.controller.ts    # Property management endpoints
│   │   ├── property-pricing.controller.ts # Property pricing management
│   │   ├── rateplan.controller.ts    # Rate plan management
│   │   ├── reservation.controller.ts # Reservation management
│   │   ├── review.controller.ts      # Review management
│   │   └── notification.controller.ts # Notification system
│   │
│   ├── services/                     # Business logic layer
│   │   ├── property.service.ts       # Property domain logic
│   │   ├── property-pricing.service.ts # Property pricing calculations
│   │   ├── rateplan.service.ts       # Rate plan business logic
│   │   ├── reservation.service.ts    # Reservation management
│   │   ├── review.service.ts         # Review system
│   │   └── notification.service.ts   # Notification handling
│   │
│   ├── middleware/                   # Cross-cutting concerns
│   │   ├── auth.ts                   # JWT authentication
│   │   ├── validation.ts             # Input validation
│   │   └── property.validation.ts    # Property-specific validation
│   │
│   ├── routes/                       # API route definitions
│   │   ├── index.ts                  # Main router aggregation
│   │   ├── auth.routes.ts            # Authentication routes
│   │   ├── property.routes.ts        # Property management routes
│   │   ├── property-pricing.routes.ts # Property pricing routes
│   │   ├── rateplan.routes.ts        # Rate plan routes
│   │   ├── reservation.routes.ts     # Reservation routes
│   │   ├── review.routes.ts          # Review routes
│   │   └── notification.routes.ts    # Notification routes
│   │
│   ├── utils/                        # Utility functions
│   │   ├── jwt.ts                    # JWT token utilities
│   │   └── password.ts               # Password hashing utilities
│   │
│   ├── types/                        # TypeScript definitions
│   │   └── index.d.ts                # Global type definitions
│   │
│   └── tests/                        # Test suites (237 tests total)
│       ├── setup.ts                  # Test configuration
│       ├── auth.test.ts              # Authentication tests (22 tests)
│       ├── property.test.ts          # Property tests (31 tests)
│       ├── property-pricing.test.ts  # Property pricing tests (23 tests)
│       ├── rateplan.test.ts          # Rate plan tests (30 tests)
│       ├── reservation.test.ts       # Reservation tests (19 tests)
│       ├── review.test.ts            # Review system tests (45 tests)
│       ├── notification.test.ts      # Notification tests (15 tests)
│       ├── static-files.test.ts      # Static file serving tests (12 tests)
│       ├── health.test.ts            # Health check tests (3 tests)
│       └── availability.test.ts      # Availability tests (37 tests)
│
├── prisma/                           # Database layer
│   ├── schema.prisma                 # Database schema definition
│   ├── seed.ts                       # Database seeding
│   └── migrations/                   # Database migration history
│
├── dist/                             # Compiled JavaScript (build output)
├── node_modules/                     # Dependencies
├── package.json                      # Project configuration
├── tsconfig.json                     # TypeScript configuration
├── jest.config.js                    # Jest test configuration
├── nodemon.json                      # Development server configuration
└── README.md                         # This documentation
```

### Folder Organization Principles

#### 1. **Feature-Based Organization**
```typescript
// ✅ Group related functionality together
auth/
  ├── auth.controller.ts
  ├── auth.routes.ts
  ├── auth.middleware.ts
  └── auth.test.ts
```

#### 2. **Layer Separation**
```typescript
// ✅ Clear boundaries between architectural layers
controllers/   # HTTP layer
services/      # Business logic layer  
repositories/  # Data access layer (Prisma)
middleware/    # Cross-cutting concerns
```

#### 3. **Shared Utilities**
```typescript
// ✅ Reusable functions across features
utils/
  ├── jwt.ts      # Token management
  ├── password.ts # Security utilities
  ├── validation.ts # Common validators
  └── helpers.ts  # Generic utilities
```

## 🗄️ Database Architecture & Patterns

### Prisma Schema Design

#### 1. **Relational Data Modeling**
```prisma
// ✅ Well-designed relationships with proper constraints
model User {
  id         String     @id @default(cuid())
  username   String     @unique
  email      String     @unique
  role       UserRole   @default(TENANT)
  properties Property[] // One-to-many relationship
  
  @@map("users")
}

model Property {
  id        String  @id @default(cuid())
  name      String
  owner     User    @relation(fields: [ownerId], references: [id])
  ownerId   String
  address   Address? // One-to-one relationship
  layout    PropertyLayout? // One-to-one relationship
  
  @@map("properties")
}
```

#### 2. **Complex Domain Modeling**
```prisma
// ✅ Rich domain models with embedded objects
model PropertyLayout {
  id               String @id @default(cuid())
  maximumGuest     Int
  bathrooms        Int
  propertySizeSqMtr Float?
  
  // Complex nested relationships
  rooms            Room[]
  property         Property @relation(fields: [propertyId], references: [id])
  propertyId       String   @unique
}

model Room {
  id          String   @id @default(cuid())
  spaceName   String
  beds        Bed[]    // One-to-many relationship
  layout      PropertyLayout @relation(fields: [layoutId], references: [id])
  layoutId    String
}
```

#### 3. **Type Safety with Enums**
```prisma
// ✅ Database-level constraints with TypeScript integration
enum UserRole {
  TENANT
  HOMEOWNER
  MANAGER
}

enum BedType {
  TwinBed
  FullBed
  QueenBed
  KingBed
  BunkBed
  SofaBed
  FutonBed
}

enum BookingType {
  BookInstantly
  NeedToRequestBook
}
```

### Photo Upload System

#### **Architecture**
```typescript
// ✅ Multer-based file upload with validation
export const uploadPhotos = multer({
  storage: multer.diskStorage({
    destination: 'uploads/photos/',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  }
});

// ✅ Static file serving with proper headers
app.use('/uploads/photos', express.static('uploads/photos', {
  maxAge: '1d',
  setHeaders: (res, path) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cache-Control', 'public, max-age=86400');
  }
}));
```

#### **Photo API Endpoints**
- `POST /api/photos/upload` - Upload multiple photos (client-side resizing to 800px)
- `POST /api/photos/attach/:propertyId` - Attach photos to property
- `GET /api/photos/unattached` - Get all unattached photos
- `DELETE /api/photos/:photoId` - Delete photo and file
- `PUT /api/photos/:photoId` - Update photo metadata
- `DELETE /api/properties/:propertyId/photos/:photoId` - Detach photo from property

### Advanced Pricing & Booking System

#### **Dynamic Pricing Engine**
```typescript
// ✅ Flexible pricing with base rates + modifiers
interface WeeklyPricingData {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
  halfDayMonday: number;
  halfDayTuesday: number;
  // ... additional half-day rates
}

interface DatePriceOverride {
  date: Date;
  price: number;
  halfDayPrice?: number;
  reason?: string; // "Holiday Premium", "Special Event", etc.
}
```

#### **Rate Plan System**
```typescript
// ✅ Sophisticated rate plan management
interface RatePlan {
  id: string;
  name: string;
  description?: string;
  priceModifierType: 'Percentage' | 'FixedAmount';
  priceModifierValue: number; // e.g., -20 for 20% discount, 100 for 100 AED surcharge
  priority: number; // Higher priority plans displayed first
  isActive: boolean;
  isDefault: boolean;
  
  // Booking restrictions
  minStay?: number;
  maxStay?: number;
  minAdvanceBooking?: number;
  maxAdvanceBooking?: number;
  minGuests?: number;
  maxGuests?: number;
  
  // Features and amenities
  features?: {
    includedAmenityIds: string[];
    extraCostAmenityIds: string[];
  };
  
  // Cancellation policy
  cancellationPolicy?: {
    type: 'FullyFlexible' | 'Moderate' | 'NonRefundable';
    freeCancellationDays?: number;
    partialRefundDays?: number;
  };
}
```

#### **Pricing API Endpoints**
```typescript
// Property Base Pricing
PUT    /api/properties/:propertyId/pricing/weekly     # Set weekly base pricing
GET    /api/properties/:propertyId/pricing/weekly     # Get weekly base pricing
POST   /api/properties/:propertyId/pricing/overrides  # Set date-specific overrides
DELETE /api/properties/:propertyId/pricing/overrides  # Delete date overrides
GET    /api/properties/:propertyId/pricing/calendar   # Get pricing calendar
GET    /api/properties/:propertyId/pricing/base-price # Get base price for specific date

// Rate Plan Management
POST   /api/properties/:propertyId/rate-plans         # Create rate plan
GET    /api/properties/:propertyId/rate-plans         # Get all rate plans for property
GET    /api/properties/:propertyId/rate-plans/public  # Get public rate plans (no auth)
GET    /api/rate-plans/:ratePlanId                     # Get specific rate plan
PUT    /api/rate-plans/:ratePlanId                     # Update rate plan
DELETE /api/rate-plans/:ratePlanId                     # Delete rate plan (smart deletion)
PATCH  /api/rate-plans/:ratePlanId/toggle-status      # Toggle active/inactive
GET    /api/rate-plans/:ratePlanId/stats              # Get rate plan analytics

// Booking Engine
POST   /api/properties/:propertyId/calculate-booking  # Calculate all booking options
GET    /api/rate-plans/metadata/modifier-types        # Get pricing metadata
```

#### **Smart Booking Calculation**
```typescript
// ✅ Advanced booking options calculation
interface BookingSearchCriteria {
  propertyId: string;
  checkInDate: Date;
  checkOutDate?: Date;
  isHalfDay?: boolean;
  guestCount: number;
  bookingDate?: Date;
}

interface BookingOption {
  ratePlan: {
    id: string;
    name: string;
    description?: string;
  };
  pricing: {
    basePrice: number;
    modifier: number;
    totalPrice: number;
    pricePerNight: number;
    savings: number; // Negative for surcharges
  };
  isEligible: boolean;
  ineligibilityReasons: string[];
  duration: {
    nights: number;
    isHalfDay: boolean;
  };
  restrictions: {
    minStay?: number;
    maxStay?: number;
    minAdvanceBooking?: number;
    maxAdvanceBooking?: number;
    minGuests?: number;
    maxGuests?: number;
  };
  amenities: {
    included: Amenity[];
    extraCost: Amenity[];
  };
  cancellation: {
    type: string;
    description: string;
    freeCancellationDays?: number;
    partialRefundDays?: number;
  };
}
```

### Reservation Management System

#### **Reservation Lifecycle**
```typescript
// ✅ Complete reservation workflow
enum ReservationStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  CANCELLED = 'Cancelled',
  COMPLETED = 'Completed',
  NO_SHOW = 'NoShow'
}

interface Reservation {
  id: string;
  ratePlanId: string;
  guestId: string;
  propertyId: string;
  
  // Booking details
  checkInDate: Date;
  checkOutDate?: Date;
  isHalfDay: boolean;
  guestCount: number;
  
  // Pricing
  basePrice: number;
  modifier: number;
  totalPrice: number;
  commissionAmount: number;
  
  // Status tracking
  status: ReservationStatus;
  paymentStatus: 'Pending' | 'Paid' | 'Refunded';
  
  // Communication
  messages: ReservationMessage[];
  noShowReason?: string;
  
  // Review system
  review?: Review;
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### **Reservation API Endpoints**
```typescript
GET    /api/reservations                           # List reservations with filters
GET    /api/reservations/:id                       # Get specific reservation
PUT    /api/reservations/:id                       # Update reservation
POST   /api/reservations/:id/no-show              # Report guest no-show
POST   /api/reservations/:id/messages             # Send message to guest
GET    /api/reservations/:id/messages             # Get conversation history
POST   /api/reviews/:reviewId/response            # Respond to guest review
```

### Database Best Practices

#### 1. **Migration Strategy**
```bash
# ✅ Version-controlled schema changes
npm run prisma:migrate  # Create and apply migrations
npm run prisma:generate # Generate type-safe client
npm run db:setup        # Full setup (migrate + seed)
```

#### 2. **Seeding Strategy**
```typescript
// ✅ Consistent development data
// prisma/seed.ts
async function seedAdmin() {
  await prisma.user.upsert({
    where: { email: 'admin@wezo.ae' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@wezo.ae',
      password: await hashPassword('Admin@123456'),
      role: 'MANAGER',
      isAdmin: true
    }
  });
}
```

## 🔐 Security Architecture

### Authentication & Authorization

#### 1. **JWT-Based Authentication**
```typescript
// ✅ Stateless token-based authentication
interface JWTPayload {
  userId: string;
  username: string;
  role: UserRole;
  isAdmin: boolean;
}

// Token creation
const token = jwt.sign(payload, JWT_SECRET, {
  expiresIn: JWT_EXPIRES_IN,
  issuer: 'wezo-server',
  audience: 'wezo-client'
});
```

#### 2. **Password Security**
```typescript
// ✅ Secure password handling
const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string, 
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}
```

#### 3. **Role-Based Access Control**
```typescript
// ✅ Flexible authorization middleware
export const requireRole = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

// Usage
router.get('/admin/users', requireRole(['MANAGER']), getUsersList);
```

#### 4. **Input Validation & Sanitization**
```typescript
// ✅ Comprehensive input validation
export const validateProperty = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  const { name, address, layout } = req.body;
  
  // Required field validation
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Property name is required' });
  }
  
  // Complex object validation
  if (address && !isValidAddress(address)) {
    return res.status(400).json({ error: 'Invalid address format' });
  }
  
  next();
};
```

## 🧪 Testing Architecture

### Test Strategy & Coverage

#### 1. **Test Pyramid Implementation**
```typescript
// ✅ Comprehensive test coverage (46+ tests)
tests/
├── unit/           # Fast, isolated tests
├── integration/    # API endpoint tests  
└── e2e/           # End-to-end workflows
```

#### 2. **Database Testing Patterns**
```typescript
// ✅ Isolated test database per suite
beforeEach(async () => {
  // Clean database state
  await prisma.$executeRaw`TRUNCATE TABLE users, properties CASCADE`;
  
  // Set up test data
  testUser = await createTestUser();
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

#### 3. **API Testing with Supertest**
```typescript
// ✅ Complete request/response testing
describe('POST /api/properties', () => {
  it('should create property with valid data', async () => {
    const propertyData = {
      name: 'Test Villa',
      address: { city: 'Dubai', countryOrRegion: 'UAE' }
    };
    
    const response = await request(app)
      .post('/api/properties')
      .set('Authorization', `Bearer ${authToken}`)
      .send(propertyData)
      .expect(201);
      
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(propertyData.name);
  });
});
```

## 🚀 Development Guidelines

### Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Configure DATABASE_URL and other variables

# 3. Set up database
npm run db:setup

# 4. Start development server
npm run dev

# 5. Run tests
npm test
```

### Code Quality Standards

#### 1. **TypeScript Best Practices**
```typescript
// ✅ Strict typing with proper interfaces
interface CreatePropertyRequest {
  name: string;
  address: AddressInput;
  layout?: PropertyLayoutInput;
  amenities?: AmenityInput[];
}

// ✅ Generic types for reusability
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ✅ Utility types for transformations
type CreatePropertyData = Omit<Property, 'id' | 'createdAt' | 'updatedAt'>;
type UpdatePropertyData = Partial<CreatePropertyData>;
```

#### 2. **Error Handling Patterns**
```typescript
// ✅ Consistent error handling across the application
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Usage in controllers
export const createProperty = async (req: Request, res: Response) => {
  try {
    const property = await propertyService.create(req.body, req.user.id);
    res.status(201).json({ success: true, data: property });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code
      });
    }
    
    // Unexpected errors
    console.error('Unexpected error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
```

#### 3. **Async/Await Best Practices**
```typescript
// ✅ Proper async error handling
export const getPropertyById = async (id: string): Promise<Property | null> => {
  try {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        address: true,
        layout: {
          include: {
            rooms: {
              include: { beds: true }
            }
          }
        },
        amenities: true,
        pricing: true
      }
    });
    
    return property;
  } catch (error) {
    console.error(`Error fetching property ${id}:`, error);
    throw new AppError('Failed to fetch property', 500);
  }
};
```

## ✅ Do's and Don'ts

### ✅ **DO's**

#### API Design
- **DO** use RESTful conventions for endpoint design
- **DO** implement proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- **DO** use consistent response formats across all endpoints
- **DO** implement comprehensive input validation
- **DO** use meaningful error messages

```typescript
// ✅ Good: RESTful endpoint design
GET    /api/properties           # List properties
POST   /api/properties           # Create property
GET    /api/properties/:id       # Get specific property
PUT    /api/properties/:id       # Update property
DELETE /api/properties/:id       # Delete property

// ✅ Good: Consistent response format
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

#### Database Operations
- **DO** use Prisma transactions for multi-table operations
- **DO** implement proper database indexing for performance
- **DO** use database-level constraints for data integrity
- **DO** implement soft deletes for important entities

```typescript
// ✅ Good: Transaction for complex operations
await prisma.$transaction(async (tx) => {
  const property = await tx.property.create({ data: propertyData });
  await tx.address.create({ data: { ...addressData, propertyId: property.id } });
  await tx.propertyLayout.create({ data: { ...layoutData, propertyId: property.id } });
  
  return property;
});
```

#### Security
- **DO** validate all inputs on the server side
- **DO** use environment variables for sensitive configuration
- **DO** implement rate limiting for API endpoints
- **DO** log security-related events

```typescript
// ✅ Good: Input validation
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ✅ Good: Environment variable usage
const config = {
  jwtSecret: process.env.JWT_SECRET!,
  dbUrl: process.env.DATABASE_URL!,
  port: parseInt(process.env.PORT || '3000')
};
```

#### Testing
- **DO** write tests for all business logic
- **DO** test both success and error scenarios
- **DO** use descriptive test names
- **DO** maintain high test coverage (>80%)

```typescript
// ✅ Good: Descriptive test cases
describe('Property Service', () => {
  describe('createProperty', () => {
    it('should create property with valid data and return property with generated ID', async () => {
      // Test implementation
    });
    
    it('should throw validation error when required fields are missing', async () => {
      // Test implementation
    });
    
    it('should throw authorization error when user is not property owner', async () => {
      // Test implementation
    });
  });
});
```

### ❌ **DON'Ts**

#### API Design
- **DON'T** expose internal implementation details in API responses
- **DON'T** use generic endpoints for everything (avoid `/api/data`)
- **DON'T** ignore HTTP status codes (don't return 200 for errors)
- **DON'T** skip input validation

```typescript
// ❌ Bad: Exposing internal details
res.json({
  user: {
    id: user.id,
    password: user.hashedPassword, // Never expose passwords!
    internalFlags: user.systemFlags // Don't expose internal data
  }
});

// ❌ Bad: Generic endpoints
POST /api/data?type=user
POST /api/data?type=property

// ✅ Good: Specific endpoints
POST /api/users
POST /api/properties
```

#### Database Operations
- **DON'T** write raw SQL queries unless absolutely necessary
- **DON'T** ignore database constraints and relationships
- **DON'T** perform N+1 queries (use Prisma's include/select)
- **DON'T** store sensitive data in plain text

```typescript
// ❌ Bad: N+1 query problem
const properties = await prisma.property.findMany();
for (const property of properties) {
  property.owner = await prisma.user.findUnique({ where: { id: property.ownerId } });
}

// ✅ Good: Single query with relations
const properties = await prisma.property.findMany({
  include: { owner: true }
});
```

#### Error Handling
- **DON'T** expose stack traces to clients in production
- **DON'T** ignore errors or fail silently
- **DON'T** use generic error messages
- **DON'T** log sensitive information

```typescript
// ❌ Bad: Exposing stack traces
catch (error) {
  res.status(500).json({ error: error.stack }); // Security risk!
}

// ❌ Bad: Generic error messages
catch (error) {
  res.status(500).json({ error: 'Something went wrong' }); // Not helpful
}

// ✅ Good: Proper error handling
catch (error) {
  console.error('Property creation failed:', error);
  res.status(400).json({
    error: 'Failed to create property',
    message: 'Please check your input data and try again'
  });
}
```

#### Security
- **DON'T** store passwords in plain text
- **DON'T** use weak JWT secrets
- **DON'T** skip authentication on protected routes
- **DON'T** trust client-side validation only

```typescript
// ❌ Bad: Weak security
const JWT_SECRET = '123456'; // Too simple!
const password = req.body.password; // Store plain text - NEVER!

// ❌ Bad: Missing authentication
router.delete('/api/properties/:id', deleteProperty); // No auth check!

// ✅ Good: Proper security
const JWT_SECRET = process.env.JWT_SECRET; // Strong, environment-based
const hashedPassword = await bcrypt.hash(password, 10); // Properly hashed
router.delete('/api/properties/:id', authenticateToken, deleteProperty);
```

## 🎯 Performance Best Practices

### Database Optimization
1. **Indexing Strategy**: Index frequently queried columns
2. **Query Optimization**: Use select/include judiciously
3. **Connection Pooling**: Configure Prisma connection limits
4. **Caching**: Implement Redis for frequently accessed data

### API Performance
1. **Pagination**: Implement cursor-based pagination for large datasets
2. **Rate Limiting**: Protect against abuse with express-rate-limit
3. **Compression**: Use gzip compression for responses
4. **Monitoring**: Implement logging and metrics collection

## 📚 Key Resources & Documentation

- **API Documentation**: All 80+ endpoints with comprehensive examples
- **Database Schema**: Complete Prisma schema with advanced relationships
- **Test Coverage**: 237 tests covering all functionality (100% passing)
- **Environment Setup**: Complete configuration guide
- **Security Guidelines**: JWT, bcrypt, and validation patterns

## 🤝 Contributing Guidelines

1. **Code Standards**: Follow TypeScript strict mode and ESLint rules
2. **Testing**: Write tests for all new features (aim for >80% coverage)
3. **Documentation**: Update README and API docs for new endpoints
4. **Security**: Follow security best practices for all changes
5. **Database**: Create proper migrations for schema changes
6. **Review Process**: All changes require code review and passing tests

## 📞 Support & Troubleshooting

### Common Issues
1. **Database Connection**: Check DATABASE_URL and PostgreSQL service
2. **JWT Issues**: Verify JWT_SECRET and token expiration settings
3. **Test Failures**: Ensure clean database state between test runs
4. **Migration Errors**: Check Prisma schema syntax and constraints

### Development Tools
- **Database Browser**: Use Prisma Studio (`npx prisma studio`)
- **API Testing**: Postman collection available for all endpoints  
- **Logs**: Check server logs for detailed error information
- **Health Check**: Use `/api/health` endpoint for service status

---

## 📈 Current Status

✅ **237/237 Tests Passing (100% Success Rate)**  
✅ **Comprehensive API Coverage (80+ endpoints)**  
✅ **Advanced Pricing & Booking Engine**  
✅ **Complete Reservation Management System**  
✅ **Production-Ready Security**  
✅ **Type-Safe Database Layer**  
✅ **Enterprise Architecture Patterns**

Built with ❤️ using modern Node.js patterns, enterprise architecture principles, and comprehensive testing strategies.