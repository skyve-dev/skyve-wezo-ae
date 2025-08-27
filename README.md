# Wezo.ae - Property Rental Platform

A modern property rental platform for villa listings in the UAE, built with TypeScript, React, and PostgreSQL. The platform provides comprehensive property management features similar to Booking.com, tailored for the UAE market.

## 🏗️ Project Structure

This is a monorepo managed with npm workspaces, containing:

```
wezo-monorepo/
├── server/          # Backend API (Node.js, Express, Prisma, PostgreSQL)
├── client/          # Frontend application (React, Vite, TypeScript)
└── docs/            # Requirements documentation and UI mockups
```

## ✨ Key Features

- **🏠 Property Management**: Complete CRUD operations for villa listings
- **📸 Photo Management**: Advanced image upload with automatic resizing (800px optimization)
- **🔐 Authentication**: JWT-based auth with role-based access control
- **🗺️ Location Services**: Interactive maps with Leaflet integration
- **💰 Pricing System**: Flexible pricing and cancellation policies
- **📱 Responsive Design**: Mobile-first design with adaptive layouts
- **🧪 Comprehensive Testing**: Full test coverage with Jest and Supertest

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/skyve-wezo-ae.git
   cd skyve-wezo-ae
   ```

2. Install all dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Server environment
   cd server
   cp .env.example .env
   # Edit .env with your database credentials
   
   # Client environment
   cd ../client
   cp .env.example .env
   # Edit .env if needed
   cd ..
   ```

4. Set up the database:
   ```bash
   cd server
   npm run prisma:migrate
   npm run prisma:seed
   cd ..
   ```

5. Start the development servers:
   ```bash
   # Start both server and client
   npm run dev
   
   # Or start individually:
   npm run dev:server  # Backend on http://localhost:3000
   npm run dev:client  # Frontend on http://localhost:5173
   ```

## 📦 Workspace Commands

Run these commands from the root directory:

| Command | Description |
|---------|-------------|
| `npm install` | Install all workspace dependencies |
| `npm run dev` | Start both server and client in development mode |
| `npm run dev:server` | Start backend server only |
| `npm run dev:client` | Start frontend client only |
| `npm run build` | Build both applications for production |
| `npm run build:server` | Build backend server |
| `npm run build:client` | Build frontend client |
| `npm run test:server` | Run backend tests |
| `npm run lint` | Run linting for both applications |

## 🔗 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login with JWT token
- `POST /api/auth/password-reset/request` - Request password reset
- `POST /api/auth/password-reset/reset` - Reset password with token
- `GET /api/auth/profile` - Get current user profile (protected)
- `PUT /api/auth/update-role` - Update user role (protected)

### Property Management Endpoints
- `POST /api/properties` - Create new property
- `GET /api/properties/my-properties` - List user's properties
- `GET /api/properties/:propertyId` - Get property details
- `PUT /api/properties/:propertyId` - Update property
- `DELETE /api/properties/:propertyId` - Delete property
- `PUT /api/properties/:propertyId/layout` - Update room configuration
- `PUT /api/properties/:propertyId/amenities` - Update amenities
- `PUT /api/properties/:propertyId/services` - Update services
- `PUT /api/properties/:propertyId/rules` - Update house rules
- `PUT /api/properties/:propertyId/pricing` - Update pricing

### Photo Management Endpoints
- `POST /api/photos/upload` - Upload photos with automatic resizing
- `POST /api/photos/attach/:propertyId` - Attach photos to property
- `GET /api/photos/unattached` - Get unattached photos
- `DELETE /api/photos/:photoId` - Delete photo
- `GET /uploads/photos/*` - Public access to uploaded photos

## 🎨 Frontend Features

### Property Registration Wizard
A comprehensive 9-step wizard for property owners:
1. **Basic Information** - Property name, type, and description
2. **Location** - Address and map coordinates
3. **Layout** - Rooms, beds, and capacity configuration
4. **Amenities** - Available facilities and features
5. **Photos** - Image upload with automatic optimization
6. **Services** - Additional services offered
7. **House Rules** - Policies for guests
8. **Pricing** - Rate configuration and payment terms
9. **Review** - Final review before submission

### Photo Management System
- **Automatic Image Resizing**: Images are automatically resized to 800px on the shortest side
- **Bulk Upload**: Support for multiple file uploads
- **Drag & Drop**: Intuitive file upload interface
- **Photo Organization**: Attach/detach photos from properties
- **Gallery View**: Responsive grid layout for photo browsing

### Dashboard Features
- Property listing management
- Photo library management
- Quick property statistics
- Responsive mobile interface

## 🧭 AppShell Navigation System

The application uses a custom AppShell routing system that provides type-safe navigation, dialog management, and UI component mounting capabilities.

### Key Features
- **Type-Safe Routing**: Navigate with compile-time parameter validation
- **Promise-Based Dialogs**: Modal dialogs that return values asynchronously
- **Navigation Guards**: Protect routes with unsaved changes warnings
- **Dynamic Content Mounting**: Dynamically mount header, sidebar, and footer content
- **Loading State Management**: Centralized loading indicators
- **Browser History**: Full browser back/forward navigation support

### Basic Usage

#### 1. Define Routes
```typescript
// Routes.tsx
import { createRoutes } from '@/components/base/AppShell'

export const routes = createRoutes({
  'dashboard': {
    component: Dashboard,
    icon: <FaTachometerAlt />,
    label: 'Dashboard',
    showInNav: true,
    showInHeader: true
  },
  'property-edit': {
    component: PropertyEdit,
    icon: <FaEdit />,
    label: 'Edit Property', 
    showInNav: false,
    showInHeader: false
  }
})
```

#### 2. Navigation in Components
```typescript
import { useAppShell } from '@/components/base/AppShell'

const MyComponent = () => {
  const { navigateTo, openDialog, registerNavigationGuard } = useAppShell()

  // Type-safe navigation with parameters
  const handleEdit = () => {
    navigateTo('property-edit', { propertyId: '123' })
  }

  // Promise-based confirmation dialog
  const handleDelete = async () => {
    const confirmed = await openDialog<boolean>((close) => (
      <Box>
        <p>Are you sure you want to delete this property?</p>
        <Button onClick={() => close(true)}>Yes, Delete</Button>
        <Button onClick={() => close(false)}>Cancel</Button>
      </Box>
    ))
    
    if (confirmed) {
      // Proceed with deletion
    }
  }

  // Navigation guard for unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges) return

    const cleanup = registerNavigationGuard(async () => {
      const shouldLeave = await openDialog<boolean>((close) => (
        // Unsaved changes warning dialog
      ))
      return shouldLeave
    })

    return cleanup
  }, [hasUnsavedChanges])
}
```

#### 3. Available AppShell Functions

| Function | Description |
|----------|-------------|
| `navigateTo(route, params)` | Navigate to a route with type-safe parameters |
| `navigateBack()` | Go back to previous route |
| `canNavigateBack` | Boolean indicating if back navigation is possible |
| `openDialog<T>(content)` | Show modal dialog and return promise with result |
| `registerNavigationGuard(guard)` | Register function to protect navigation |
| `mountHeader(content, options?)` | Dynamically mount header content |
| `mountSideNav(content, options?)` | Dynamically mount sidebar content |
| `mountFooter(content, options?)` | Dynamically mount footer content |
| `setLoading(boolean)` | Show/hide global loading indicator |
| `currentRoute` | Current active route key |
| `currentParams` | Current route parameters |

### Advanced Features

#### Dialog Stacking
Multiple dialogs can be opened simultaneously and stack properly:
```typescript
const result1 = await openDialog(/* first dialog */)
const result2 = await openDialog(/* second dialog on top */)
```

#### Dynamic Content Mounting
```typescript
// Mount temporary header content
const cleanup = mountHeader(
  <CustomHeader title="Special Mode" />,
  { visibility: 'persistent' }
)

// Clean up when done
cleanup()
```

#### Navigation History
- Full browser history support with proper URL updates
- Back button integration
- Route parameter preservation
- Deep linking support

## 🔐 Default Admin Account

After running the seed script:
- **Username:** admin
- **Email:** admin@wezo.ae
- **Password:** Admin@123456

⚠️ **Important:** Change the admin password after first login!

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js v5
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **File Upload**: Multer with image optimization
- **Testing**: Jest with Supertest
- **Validation**: Express Validator

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: Custom AppShell routing system with type safety
- **State Management**: Redux Toolkit
- **Styling**: CSS Modules with responsive design system
- **Maps**: Leaflet with React Leaflet
- **Icons**: React Icons
- **Image Processing**: Canvas API for client-side resizing
- **Navigation**: AppShell context with dialog management

## 📁 Project Files

### Important Documentation
- `docs/homeowner-onboarding-villa-registration/Requirement.MD` - Complete functional requirements
- `docs/homeowner-onboarding-villa-registration/*.png` - UI mockups (30+ screens)
- `CLAUDE.md` - AI assistant guidance and project context

### Configuration Files
- `server/.env.example` - Backend environment template
- `client/.env.example` - Frontend environment template
- `server/prisma/schema.prisma` - Database schema

## 🧪 Testing

The project includes comprehensive testing:

```bash
# Run backend tests
cd server
npm test

# Tests include:
# - API endpoint testing
# - Authentication flow testing
# - Database operations testing
# - File upload testing
```

Tests are configured for sequential execution to prevent race conditions.

## 🚢 Deployment

### Production Build

```bash
# Build both applications
npm run build

# Backend build output: server/dist
# Frontend build output: client/dist
```

### Environment Configuration
- Configure production database in `server/.env`
- Set production API URL in `client/.env`
- Configure file upload directory permissions
- Set up reverse proxy for API and static files

## 📄 License

ISC

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For issues and questions, please open an issue on GitHub or contact the development team.

---

Built with ❤️ for the UAE property rental market