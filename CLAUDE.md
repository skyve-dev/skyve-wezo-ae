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

### Editing Page UI Pattern

**CRITICAL**: For editing pages (Property Edit, Rate Plan Edit, etc.), follow the established pattern used in PropertyEditor:

#### 1. Custom Header + Conditional Footer Pattern

```typescript
// In editing components like RatePlanEdit, PropertyEdit
const { mountHeader, mountFooter, registerNavigationGuard } = useAppShell()
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
const [isSaving, setIsSaving] = useState(false)

// Mount header and footer using AppShell
useEffect(() => {
  // Always mount custom header
  const unmountHeader = mountHeader(
    <CustomEditHeader
      title="Edit Rate Plan"
      onBack={handleBack}
    />
  )

  // Mount footer ONLY when there are unsaved changes
  let unmountFooter: (() => void) | null = null
  if (hasUnsavedChanges) {
    unmountFooter = mountFooter(
      <CustomEditFooter
        onSave={handleSave}
        onDiscard={handleDiscard}
        isSaving={isSaving}
        hasErrors={!!validationErrors}
      />,
      { visibility: 'persistent' }
    )
  }

  // Cleanup on unmount or dependency changes
  return () => {
    unmountHeader()
    unmountFooter?.()
  }
}, [hasUnsavedChanges, isSaving, validationErrors, ...])
```

#### 2. Header Component Pattern

Create dedicated header components following this structure:

```typescript
// RatePlanEditHeader.tsx (based on PropertyEditHeader.tsx)
const RatePlanEditHeader: React.FC<{
  title: string
  onBack: () => void
}> = ({ title, onBack }) => (
  <Box
    display="flex"
    alignItems="center"
    padding="1rem 1.5rem"
    backgroundColor="#D52122"  // Brand red color
    height="4rem"
  >
    <Box display="flex" alignItems="center" gap="1rem" flex="1">
      <Button
        label=""
        icon={<FaArrowLeft />}
        onClick={onBack}
        variant="normal"
        size="small"
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          color: 'white'
        }}
        title="Back"
      />
      <Box display="flex" alignItems="center" gap="0.75rem">
        <FaTags color="white" />
        <h2 style={{
          margin: 0,
          fontSize: '1.125rem',
          fontWeight: '600',
          color: 'white'
        }}>
          {title}
        </h2>
      </Box>
    </Box>
  </Box>
)
```

#### 3. Footer Component Pattern

Create save/discard footers following this structure:

```typescript
// RatePlanEditFooter.tsx (based on SaveFooter.tsx)
const RatePlanEditFooter: React.FC<{
  onSave: () => void
  onDiscard?: () => void
  isSaving?: boolean
  hasErrors?: boolean
}> = ({ onSave, onDiscard, isSaving = false, hasErrors = false }) => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="flex-end"
    padding="1rem 1.5rem"
    backgroundColor="#D52122"  // Same brand color as header
    height="4.5rem"
  >
    <Box display="flex" alignItems="center" gap="0.75rem" flexGrow="1">
      {onDiscard && (
        <Button
          label="Discard"
          icon={<FaUndo />}
          onClick={onDiscard}
          disabled={isSaving}
          style={{
            backgroundColor: 'transparent',
            color: 'white'
          }}
        />
      )}
      <Box flexGrow="1" />
      <Button
        label={isSaving ? "Saving..." : "Save Changes"}
        icon={isSaving ? <FaSpinner className="spin" /> : <FaSave />}
        onClick={onSave}
        disabled={isSaving || hasErrors}
        style={{
          backgroundColor: 'transparent',
          color: 'white',
          fontWeight: '600'
        }}
      />
    </Box>
  </Box>
)
```

#### 4. Smart Back Button Handling

Always implement smart back button logic for editing pages:

```typescript
const handleBack = async () => {
  if (hasUnsavedChanges) {
    const shouldSaveAndLeave = await openDialog<boolean>((close) => (
      <Box padding="2rem" textAlign="center">
        <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#f59e0b">
          Unsaved Changes
        </Box>
        <Box marginBottom="2rem">
          Do you want to save your changes before leaving?
        </Box>
        <Box display="flex" gap="1rem" justifyContent="center">
          <Button onClick={() => close(false)}>Leave Without Saving</Button>
          <Button onClick={() => close(true)} variant="promoted">Save & Leave</Button>
        </Box>
      </Box>
    ))

    if (shouldSaveAndLeave) {
      await handleSave()
    }
    navigateTo('rate-plans', {})
  } else {
    navigateTo('rate-plans', {})
  }
}
```

#### 5. Key Rules for Editing Pages

1. **Always use custom headers** - Never use default AppShell header for editing
2. **Conditional footer mounting** - Footer only appears when `hasUnsavedChanges = true`
3. **Consistent colors** - Use brand red `#D52122` for header and footer
4. **Navigation guards** - Always implement unsaved changes protection
5. **Smart back button** - Offer to save changes before leaving
6. **Loading states** - Show spinner during save operations
7. **Error handling** - Disable save when validation errors exist

#### 6. Files to Reference

- **PropertyEditHeader.tsx** - Header component pattern
- **SaveFooter.tsx** - Footer component pattern  
- **TabMode.tsx** - AppShell mounting implementation
- All editing pages must follow this exact pattern for consistency

## Unified Manager Pattern (Create + Edit)

**CRITICAL**: When building features that need both Create and Edit functionality, always use the Unified Manager Pattern to avoid code duplication and maintenance issues.

### Pattern Overview

Instead of creating separate `ComponentCreate.tsx` and `ComponentEdit.tsx`, create a single `ComponentManager.tsx` that handles both modes using parameter-based detection, following the PropertyEdit pattern.

### 1. **Manager Component Pattern**

```typescript
// ComponentManager.tsx - Unified Create/Edit Component
interface ComponentManagerProps {
  itemId?: string  // 'new' for create mode, actual ID for edit mode
}

const ComponentManager: React.FC<ComponentManagerProps> = ({ itemId }) => {
  const { currentParams } = useAppShell()
  const params = { itemId, ...currentParams }
  
  // Mode detection following PropertyEdit pattern
  const isCreateMode = params.itemId === 'new'
  const isEditMode = !isCreateMode && params.itemId
  
  // Redux state (NO local formData - use Redux for everything)
  const {
    currentForm,
    originalForm,
    hasUnsavedChanges,
    formValidationErrors,
    isSaving,
    loading,
    error,
    items
  } = useSelector((state: RootState) => state.componentSlice)
  
  const dispatch = useDispatch()
  const { mountHeader, mountFooter, navigateTo, openDialog, registerNavigationGuard } = useAppShell()
  
  // Initialize form based on mode
  useEffect(() => {
    if (isCreateMode) {
      dispatch(initializeFormForCreate(propertyId))
    } else if (isEditMode && params.itemId) {
      const existingItem = items.find(item => item.id === params.itemId)
      if (existingItem) {
        dispatch(initializeFormForEdit(existingItem))
      } else {
        // Load item if not in store
        dispatch(fetchItemById(params.itemId))
      }
    }
  }, [isCreateMode, isEditMode, params.itemId, items, dispatch])
  
  // Mount header and footer using AppShell
  useEffect(() => {
    const title = isCreateMode ? 'Create Item' : `Edit ${currentForm?.name || 'Item'}`
    
    const unmountHeader = mountHeader(
      <ComponentManagerHeader title={title} onBack={handleBack} />
    )
    
    let unmountFooter: (() => void) | null = null
    if (hasUnsavedChanges) {
      unmountFooter = mountFooter(
        <ComponentManagerFooter
          onSave={handleSave}
          onDiscard={handleDiscard}
          isSaving={isSaving}
          hasErrors={Object.keys(formValidationErrors).length > 0}
        />,
        { visibility: 'persistent' }
      )
    }
    
    return () => {
      unmountHeader()
      unmountFooter?.()
    }
  }, [hasUnsavedChanges, isSaving, formValidationErrors, currentForm, isCreateMode])
  
  // Navigation guard for unsaved changes
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
  }, [hasUnsavedChanges, registerNavigationGuard, openDialog])
  
  // Unified save handler
  const handleSave = async () => {
    if (!currentForm) return
    
    try {
      if (isCreateMode) {
        await dispatch(createItemAsync({ propertyId, data: currentForm }))
      } else if (isEditMode && params.itemId) {
        await dispatch(updateItemAsync({ itemId: params.itemId, data: currentForm }))
      }
      
      // Show success dialog
      await openDialog<void>((close) => (
        <Box padding="2rem" textAlign="center">
          <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#059669">
            Success!
          </Box>
          <Box marginBottom="2rem">
            Item has been {isCreateMode ? 'created' : 'updated'} successfully.
          </Box>
          <Button onClick={() => close()} variant="promoted">Continue</Button>
        </Box>
      ))
      
      navigateTo('items-list', {})
    } catch (error) {
      // Error handling with dialog
    }
  }
  
  // Smart back button
  const handleBack = async () => {
    if (hasUnsavedChanges) {
      const shouldSaveAndLeave = await openDialog<boolean>((close) => (
        <Box padding="2rem" textAlign="center">
          <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#f59e0b">
            Unsaved Changes
          </Box>
          <Box marginBottom="2rem">
            Do you want to save your changes before leaving?
          </Box>
          <Box display="flex" gap="1rem" justifyContent="center">
            <Button onClick={() => close(false)}>Leave Without Saving</Button>
            <Button onClick={() => close(true)} variant="promoted">Save & Leave</Button>
          </Box>
        </Box>
      ))
      
      if (shouldSaveAndLeave) {
        await handleSave()
      }
    }
    navigateTo('items-list', {})
  }
  
  // Handle form field changes
  const handleFieldChange = (field: string, value: any) => {
    dispatch(updateFormField({ [field]: value }))
  }
  
  if (loading) {
    return <LoadingState />
  }
  
  if (isEditMode && !currentForm) {
    return <NotFoundState />
  }
  
  // Render unified form (same for both create/edit)
  return (
    <SecuredPage>
      <Box padding="1rem" paddingMd="2rem" maxWidth="800px" margin="0 auto">
        {/* Form sections */}
        <Box display="flex" flexDirection="column" gap="2rem">
          <FormSection1 data={currentForm} onChange={handleFieldChange} />
          <FormSection2 data={currentForm} onChange={handleFieldChange} />
          <FormSection3 data={currentForm} onChange={handleFieldChange} />
        </Box>
      </Box>
    </SecuredPage>
  )
}

export default ComponentManager
```

### 2. **Enhanced Redux Slice Pattern**

```typescript
// componentSlice.ts - Redux state management for Manager
interface ComponentState {
  items: Item[]
  selectedItem: Item | null
  
  // Form management (CRITICAL: No local formData)
  currentForm: Item | null
  originalForm: Item | null  // For change detection
  hasUnsavedChanges: boolean
  formValidationErrors: Record<string, string>
  
  // Loading states
  isSaving: boolean
  loading: boolean
  error: string | null
  
  filters: {
    propertyId?: string
    isActive?: boolean
  }
}

const componentSlice = createSlice({
  name: 'component',
  initialState,
  reducers: {
    // Form management actions
    initializeFormForCreate: (state, action: PayloadAction<string>) => {
      const propertyId = action.payload
      state.currentForm = {
        id: '', // Will be generated on save
        propertyId,
        name: '',
        description: '',
        // ... other default fields
      } as Item
      state.originalForm = { ...state.currentForm }
      state.hasUnsavedChanges = false
      state.formValidationErrors = {}
    },
    
    initializeFormForEdit: (state, action: PayloadAction<Item>) => {
      state.currentForm = { ...action.payload }
      state.originalForm = { ...action.payload }
      state.hasUnsavedChanges = false
      state.formValidationErrors = {}
    },
    
    updateFormField: (state, action: PayloadAction<Partial<Item>>) => {
      if (state.currentForm) {
        state.currentForm = { ...state.currentForm, ...action.payload }
        // Detect changes
        state.hasUnsavedChanges = JSON.stringify(state.currentForm) !== JSON.stringify(state.originalForm)
      }
    },
    
    resetFormToOriginal: (state) => {
      if (state.originalForm) {
        state.currentForm = { ...state.originalForm }
        state.hasUnsavedChanges = false
        state.formValidationErrors = {}
      }
    },
    
    clearForm: (state) => {
      state.currentForm = null
      state.originalForm = null
      state.hasUnsavedChanges = false
      state.formValidationErrors = {}
    },
    
    setFormValidationErrors: (state, action: PayloadAction<Record<string, string>>) => {
      state.formValidationErrors = action.payload
    },
    
    // ... other existing actions
  },
  
  extraReducers: (builder) => {
    // Handle async thunk results
    builder
      .addCase(createItemAsync.fulfilled, (state, action) => {
        state.items.push(action.payload)
        state.currentForm = action.payload
        state.originalForm = { ...action.payload }
        state.hasUnsavedChanges = false
        state.isSaving = false
        state.error = null
      })
      .addCase(updateItemAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        state.currentForm = action.payload
        state.originalForm = { ...action.payload }
        state.hasUnsavedChanges = false
        state.isSaving = false
        state.error = null
      })
      // ... error cases
  }
})

// Async thunks with proper API integration
export const createItemAsync = createAsyncThunk(
  'component/create',
  async (params: { propertyId: string; data: Partial<Item> }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/properties/${params.propertyId}/items`, params.data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create item')
    }
  }
)

export const updateItemAsync = createAsyncThunk(
  'component/update',
  async (params: { itemId: string; data: Partial<Item> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/items/${params.itemId}`, params.data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update item')
    }
  }
)
```

### 3. **Route Configuration Pattern**

```typescript
// Routes.tsx - Single component for both modes
'item-create': {
  component: () => <ComponentManager itemId="new" />,
  icon: <FaPlus />,
  label: 'Create Item',
  showInNav: false,
  showInHeader: false,
  showInFooter: false
},
'item-edit': {
  component: ({ id }: { id: string }) => <ComponentManager itemId={id} />,
  icon: <FaEdit />,
  label: 'Edit Item',
  showInNav: false,
  showInHeader: false,
  showInFooter: false
}
```

### 4. **Header/Footer Components Pattern**

```typescript
// ComponentManagerHeader.tsx
const ComponentManagerHeader: React.FC<{
  title: string
  onBack: () => void
}> = ({ title, onBack }) => (
  <Box
    display="flex"
    alignItems="center"
    padding="1rem 1.5rem"
    backgroundColor="#D52122"
    height="4rem"
  >
    <Box display="flex" alignItems="center" gap="1rem" flex="1">
      <Button
        label=""
        icon={<FaArrowLeft />}
        onClick={onBack}
        variant="normal"
        size="small"
        style={{ backgroundColor: 'transparent', color: 'white' }}
      />
      <Box display="flex" alignItems="center" gap="0.75rem">
        <FaIcon color="white" />
        <h2 style={{ color: 'white', fontSize: '1.125rem', fontWeight: '600' }}>
          {title}
        </h2>
      </Box>
    </Box>
  </Box>
)

// ComponentManagerFooter.tsx
const ComponentManagerFooter: React.FC<{
  onSave: () => void
  onDiscard?: () => void
  isSaving?: boolean
  hasErrors?: boolean
}> = ({ onSave, onDiscard, isSaving, hasErrors }) => (
  <Box
    display="flex"
    alignItems="center"
    padding="1rem 1.5rem"
    backgroundColor="#D52122"
    height="4.5rem"
  >
    <Box display="flex" alignItems="center" gap="0.75rem" flexGrow="1">
      {onDiscard && (
        <Button
          label="Discard Changes"
          icon={<FaUndo />}
          onClick={onDiscard}
          disabled={isSaving}
          style={{ backgroundColor: 'transparent', color: 'white' }}
        />
      )}
      <Box flexGrow="1" />
      <Button
        label={isSaving ? "Saving..." : "Save Changes"}
        icon={isSaving ? <FaSpinner className="spin" /> : <FaSave />}
        onClick={onSave}
        disabled={isSaving || hasErrors}
        style={{ backgroundColor: 'transparent', color: 'white', fontWeight: '600' }}
      />
    </Box>
  </Box>
)
```

### 5. **Critical Rules for Manager Pattern**

1. **Single Component** - Never create separate Create/Edit components
2. **Parameter Detection** - Use `itemId === 'new'` for create mode detection
3. **Redux State Only** - Never use local formData, always use Redux
4. **Mode-Based Initialization** - Initialize form differently for create vs edit
5. **Unified Save Logic** - Single handler that branches on mode
6. **Smart Back Button** - Always offer to save changes before leaving
7. **AppShell Integration** - Always use mountHeader/mountFooter pattern
8. **Navigation Guards** - Always protect against unsaved changes
9. **Async Thunks** - Use createAsyncThunk with proper API integration
10. **Change Detection** - Compare currentForm vs originalForm in Redux

### 6. **Implementation Checklist**

- [ ] Create single `ComponentManager.tsx` (not separate Create/Edit)
- [ ] Enhance Redux slice with form management state
- [ ] Implement `initializeFormForCreate` and `initializeFormForEdit` actions
- [ ] Create `updateFormField` action for form changes
- [ ] Add change detection logic (`hasUnsavedChanges`)
- [ ] Convert to `createAsyncThunk` with real API calls
- [ ] Create shared `ComponentManagerHeader.tsx`
- [ ] Create shared `ComponentManagerFooter.tsx`  
- [ ] Update routes to use single component with parameters
- [ ] Implement AppShell mounting in useEffect
- [ ] Add navigation guards for unsaved changes
- [ ] Test both create and edit modes thoroughly

### 7. **Benefits of Manager Pattern**

1. **✅ DRY Principle** - Single source of truth, no code duplication
2. **✅ Consistent UX** - Identical behavior between create/edit modes  
3. **✅ Easier Maintenance** - Fix bugs once, works everywhere
4. **✅ Redux Integration** - Centralized state management
5. **✅ Type Safety** - Single interface for both modes
6. **✅ Better Testing** - Test one component for both scenarios
7. **✅ Reduced Bundle Size** - Less duplicate code
8. **✅ Established Pattern** - Follows PropertyEdit precedent

### 8. **Files Reference**

- **PropertyEdit.tsx** - Original pattern implementation
- **TabMode.tsx** - AppShell mounting pattern
- **ratePlanSlice.ts** - Redux form management example
- This documentation section for complete guidance

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