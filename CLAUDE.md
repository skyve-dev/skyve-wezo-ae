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

## Code Modification Guidelines

When making code changes, Claude must:
1. **Analyze** - First analyze the issue or request thoroughly
2. **Explain** - Clearly explain findings and the proposed solution
3. **Present Plan** - Detail what changes will be made and why
4. **Wait for Confirmation** - Only proceed after explicit approval (e.g., "please do it", "confirm", "yes", "go ahead")
5. **Never execute without permission** - Do not make changes until the user confirms the plan

This ensures clear communication and prevents unwanted modifications.

## Component and UI Guidelines

When building UI features:
1. **Reuse existing components** - Always use components from `src/components/base` instead of creating new ones
2. **Understand before using** - Fully understand how existing components work before implementation
3. **Avoid creativity** - Stick to established patterns and component APIs, don't introduce new patterns
4. **Use react-icons** - Always use icons from `react-icons` library that are relevant to the functionality
5. **Maintain consistency** - Follow the existing UI patterns and styling approaches in the codebase

This ensures UI consistency and maintainability across the application.

## State Management Guidelines

When managing application state:
1. **Redux as primary state manager** - Always use Redux for application state management
2. **Use slices** - Organize all state logic in Redux slices using Redux Toolkit
3. **Business logic in slices** - Put all functionality and business logic inside slice reducers and actions
4. **Use async thunks** - Handle all async operations with createAsyncThunk
5. **Minimize local state** - Only use useState or Context for micro state management (e.g., UI toggles, form inputs)
6. **No prop drilling** - Use Redux selectors instead of passing props through multiple components

This ensures predictable state management and centralized business logic.

## Frontend Architecture & Navigation System

### AppShell Navigation System

**CRITICAL**: The application uses a **custom AppShell routing system**, NOT React Router or TanStack Router. Always use the AppShell system for all navigation.

#### Core Navigation Pattern

```typescript
// ✅ CORRECT - Always use this pattern
import { useAppShell } from '@/components/base/AppShell'

const MyComponent = () => {
  const { navigateTo, openDialog } = useAppShell()
  
  // Navigate to routes defined in Routes.tsx
  const handleNavigation = () => {
    navigateTo('rate-plan-edit', { id: ratePlanId })
  }
  
  return <Button onClick={handleNavigation}>Edit Rate Plan</Button>
}

// ❌ WRONG - Never use these
import { useNavigate } from '@tanstack/react-router'
import { useRouter } from 'next/router'
```

#### Available AppShell Functions

| Function | Usage | Example |
|----------|--------|---------|
| `navigateTo(route, params)` | Navigate between pages | `navigateTo('property-edit', { id: '123' })` |
| `navigateBack()` | Go to previous page | `<Button onClick={navigateBack}>Back</Button>` |
| `canNavigateBack` | Check if back is possible | `{canNavigateBack && <BackButton />}` |
| `openDialog<T>(content)` | Show modal dialog | `const confirmed = await openDialog<boolean>(...)` |
| `registerNavigationGuard(fn)` | Protect unsaved changes | `registerNavigationGuard(async () => ...)` |
| `currentRoute` | Get current route | `if (currentRoute === 'dashboard') {...}` |
| `currentParams` | Get route parameters | `const { id } = currentParams` |

#### Route Definitions

All routes are defined in `client/src/Routes.tsx` using the `createRoutes()` function:

```typescript
export const routes = createRoutes({
  'dashboard': {
    component: Dashboard,
    icon: <FaTachometerAlt />,
    label: 'Dashboard',
    showInNav: true,
    showInHeader: true,
    showInFooter: true
  },
  'rate-plan-create': {
    component: RatePlanCreate,
    icon: <FaPlus />,
    label: 'Create Rate Plan',
    showInNav: false,
    showInHeader: false,
    showInFooter: false
  }
})
```

#### Promise-Based Dialog System

The AppShell provides a powerful dialog system that returns promises:

```typescript
// Confirmation dialogs
const confirmed = await openDialog<boolean>((close) => (
  <Box padding="2rem" textAlign="center">
    <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem">
      Delete Rate Plan?
    </Box>
    <Box marginBottom="2rem">
      This action cannot be undone.
    </Box>
    <Box display="flex" gap="1rem" justifyContent="center">
      <Button onClick={() => close(false)}>Cancel</Button>
      <Button onClick={() => close(true)} variant="promoted">Delete</Button>
    </Box>
  </Box>
))

if (confirmed) {
  // Proceed with deletion
}

// Success/Error dialogs
await openDialog<void>((close) => (
  <Box padding="2rem" textAlign="center">
    <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#059669">
      Success!
    </Box>
    <Box marginBottom="2rem">Operation completed successfully.</Box>
    <Button onClick={() => close()}>Continue</Button>
  </Box>
))
```

#### Navigation Guards for Unsaved Changes

Protect users from losing unsaved work:

```typescript
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
const { registerNavigationGuard } = useAppShell()

useEffect(() => {
  if (!hasUnsavedChanges) return

  const cleanup = registerNavigationGuard(async () => {
    const shouldLeave = await openDialog<boolean>((close) => (
      <Box padding="2rem" textAlign="center">
        <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#f59e0b">
          Unsaved Changes
        </Box>
        <Box marginBottom="2rem">
          You have unsaved changes. Are you sure you want to leave?
        </Box>
        <Box display="flex" gap="1rem" justifyContent="center">
          <Button onClick={() => close(false)}>Stay</Button>
          <Button onClick={() => close(true)} variant="promoted">Yes, Leave</Button>
        </Box>
      </Box>
    ))
    return shouldLeave
  })

  return cleanup
}, [hasUnsavedChanges, registerNavigationGuard])
```

#### Common Navigation Patterns

```typescript
// 1. Simple navigation
navigateTo('dashboard', {})

// 2. Navigation with parameters
navigateTo('property-edit', { propertyId: currentProperty.id })

// 3. Conditional navigation with confirmation
const handleCancel = async () => {
  if (hasUnsavedChanges) {
    const shouldLeave = await openDialog<boolean>(/* confirmation dialog */)
    if (shouldLeave) {
      navigateTo('properties', {})
    }
  } else {
    navigateTo('properties', {})
  }
}

// 4. Back navigation with fallback
const handleBack = () => {
  if (canNavigateBack) {
    navigateBack()
  } else {
    navigateTo('dashboard', {})
  }
}
```

#### Dynamic Content Mounting

The AppShell allows dynamic mounting of header, sidebar, and footer content:

```typescript
const { mountHeader, mountSideNav, mountFooter } = useAppShell()

// Mount temporary header content
const cleanup = mountHeader(
  <CustomHeader title="Special Mode" />,
  { visibility: 'persistent' }
)

// Clean up when component unmounts
useEffect(() => cleanup, [])
```

### Mobile-First Responsive Design

All components must support mobile devices from 320px width:

```typescript
// Use responsive styling with window.innerWidth checks
const buttonSize = window.innerWidth < 480 ? "small" : "medium"
const fontSize = window.innerWidth < 480 ? '1.5rem' : '2rem'

// Use responsive Box props
<Box 
  padding="1rem" 
  paddingMd="2rem"
  gridTemplateColumns="1fr"
  gridTemplateColumnsSm="1fr 1fr" 
  gridTemplateColumnsMd="repeat(3, 1fr)"
/>
```

### Testing Guidelines
- Jest is configured for **sequential execution** (`maxWorkers: 1`, `maxConcurrency: 1`)
- This prevents race conditions between tests that share database state
- All tests must pass when run individually AND when run together
- Use proper test isolation and cleanup in `beforeAll`/`afterAll` hooks