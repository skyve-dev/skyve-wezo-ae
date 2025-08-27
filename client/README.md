# Wezo Client - Property Management Dashboard 🏠

A modern, responsive React application for property owners to manage villa listings on the Wezo.ae platform. Built with TypeScript, Vite, and featuring a comprehensive property management system with advanced photo upload capabilities.

## 🏗️ Architecture Overview

### Tech Stack
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Full type safety and enhanced developer experience  
- **Vite** - Lightning-fast development server and build tool
- **AppShell Navigation** - Custom type-safe routing with dialog management
- **Redux Toolkit** - Predictable state management with RTK
- **Custom Box Component** - Advanced styling and responsive design system
- **React Leaflet** - Interactive maps for property locations
- **Canvas API** - Client-side image processing and optimization

### Key Features
- **🏡 Property Registration Wizard** - 9-step comprehensive property onboarding
- **📸 Smart Photo Management** - Automatic image resizing to 800px with drag-and-drop
- **🗺️ Interactive Maps** - Location selection with Leaflet integration
- **📱 Mobile-First Design** - Fully responsive across all devices
- **🔐 Secure Authentication** - JWT-based auth with role management
- **⚡ Real-time Updates** - Optimistic UI updates for better UX
- **🎨 Component Library** - Reusable UI components with examples

## 📁 Project Structure

```
client/
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── Box.tsx             # Core polymorphic component system
│   │   ├── Dashboard.tsx       # Main dashboard layout
│   │   ├── PhotoManagement.tsx # Photo library with resizing
│   │   ├── DatePicker.tsx      # Custom date selection
│   │   ├── TimePicker.tsx      # Time selection component
│   │   ├── SelectionPicker.tsx # Multi-select component
│   │   ├── SlidingDrawer.tsx   # Mobile-friendly drawer
│   │   ├── forms/              # Form components
│   │   │   ├── LoginForm.tsx   # Authentication form
│   │   │   └── RegisterForm.tsx # User registration
│   │   └── property/           # Property wizard steps
│   │       ├── BasicInfoStep.tsx
│   │       ├── LocationStep.tsx
│   │       ├── PhotosStep.tsx  # With image resizing
│   │       ├── ServicesStep.tsx
│   │       ├── RulesStep.tsx
│   │       ├── PricingStep.tsx
│   │       └── ReviewStep.tsx
│   │
│   ├── pages/                  # Page components for AppShell routing
│   │   ├── Dashboard.tsx       # Main dashboard page
│   │   ├── LandingPage.tsx     # Landing page
│   │   ├── PropertiesList.tsx  # Property list
│   │   ├── PropertyEdit.tsx    # Property editor
│   │   ├── Availability.tsx    # Calendar management
│   │   ├── Reservations.tsx    # Booking management
│   │   ├── Inbox.tsx          # Messages
│   │   ├── Reviews.tsx        # Reviews management
│   │   ├── Finance.tsx        # Financial reports
│   │   ├── Support.tsx        # Help and support
│   │   └── revenue/           # Revenue management
│   │       ├── RatePlans.tsx  # Rate plan management
│   │       ├── RatePlanCreate.tsx # Create rate plan
│   │       ├── RatePlanEdit.tsx   # Edit rate plan
│   │       └── PricingCalendar.tsx # Pricing calendar
│   │
│   ├── store/                  # Redux state management
│   │   ├── index.ts            # Store configuration
│   │   ├── hooks.ts            # Typed Redux hooks
│   │   └── slices/
│   │       ├── authSlice.ts    # Authentication state
│   │       └── propertySlice.ts # Property management
│   │
│   ├── types/                  # TypeScript definitions
│   │   ├── auth.ts             # Auth types
│   │   ├── property.ts         # Property domain types
│   │   └── box.ts              # Box component types
│   │
│   ├── utils/                  # Utilities and helpers
│   │   ├── api.ts              # API client with interceptors
│   │   ├── globalStyles.ts     # Global styles
│   │   ├── deviceDetection.ts  # Responsive helpers
│   │   └── assetHelpers.ts     # Asset path resolution
│   │
│   ├── components/             # Base UI components
│   │   └── base/
│   │       └── AppShell/       # AppShell routing system
│   │           ├── AppShell.tsx # Main AppShell component
│   │           ├── AppShellContext.tsx # Navigation context
│   │           ├── types.ts    # Type definitions
│   │           └── index.ts    # Exports
│   │
│   ├── Routes.tsx              # Route definitions for AppShell
│   ├── App.tsx                 # Root application
│   ├── AppContent.tsx          # Main app content wrapper
│   └── main.tsx                # Entry point
│
├── public/                     # Static assets
├── .env.example                # Environment template
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite configuration
└── README.md                   # This file
```

## 🎨 Component Architecture

### Box Component System

The foundation of our UI is the **Box component** - a powerful, polymorphic component with built-in responsive design and motion capabilities.

#### Key Features

**🔄 Polymorphic Rendering**
```typescript
// Renders as any HTML element with full TypeScript support
<Box as="button" onClick={handleClick}>Click me</Box>
<Box as="input" type="email" value={email} onChange={handleChange} />
<Box as="h1" fontSize={32} fontWeight={700}>Heading</Box>
```

**📱 Mobile-First Responsive Design**
```typescript
<Box
  // Mobile styles (default)
  fontSize={16}
  padding={8}
  
  // Tablet (≥768px)
  fontSizeMd={16}
  paddingMd={12}
  
  // Desktop (≥1024px)
  fontSizeLg={18}
  paddingLg={16}
/>
```

**✨ Motion & Interactions**
```typescript
<Box
  whileHover={{ 
    transform: 'scale(1.05)',
    backgroundColor: '#0056b3' 
  }}
  whileTap={{ transform: 'scale(0.98)' }}
  transition="all 0.2s ease"
/>
```

### Property Registration Wizard

A comprehensive 9-step wizard for property owners to list their villas:

1. **Basic Information** - Property name, type, description
2. **Location** - Address with interactive map selection
3. **Layout** - Rooms, beds, and capacity configuration
4. **Amenities** - Available facilities and features
5. **Photos** - Upload with automatic 800px resizing
6. **Services** - Breakfast, parking, languages
7. **Rules** - Smoking, pets, party policies
8. **Pricing** - Rates and payment configuration
9. **Review** - Final review before submission

### Photo Management System

Advanced photo handling with client-side optimization:

```typescript
// Automatic image resizing before upload
const resizeImage = (file: File): Promise<Blob> => {
  // Resizes images so shortest side = 800px
  // Maintains aspect ratio
  // Converts to JPEG with 85% quality
  // Examples:
  // - 1600x1200 → 1067x800
  // - 1200x1600 → 800x1067
}
```

**Features:**
- **Automatic Resizing** - Images resized to 800px on shortest side
- **Drag & Drop** - Intuitive file upload interface
- **Bulk Operations** - Upload/delete multiple photos
- **Photo Library** - Organize and attach photos to properties
- **Optimization** - JPEG compression for smaller file sizes

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/skyve-wezo-ae.git
cd skyve-wezo-ae/client

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Development

```bash
# Start development server
npm run dev
# Available at http://localhost:5173

# Type checking
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Configuration

### Environment Variables

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_MAPS=true
VITE_ENABLE_PHOTO_RESIZE=true

# Development
VITE_DEBUG_MODE=false
```

### AppShell Navigation System

The client uses a custom routing system with type-safe navigation and dialog management:

```typescript
// Routes.tsx - Define all application routes
export const routes = createRoutes({
  'dashboard': {
    component: Dashboard,
    icon: <FaTachometerAlt />,
    label: 'Dashboard',
    showInNav: true,
    showInHeader: true,
    showInFooter: true
  },
  'rate-plan-edit': {
    component: RatePlanEdit,
    icon: <FaEdit />,
    label: 'Edit Rate Plan',
    showInNav: false,
    showInHeader: false,
    showInFooter: false
  }
})
```

#### Navigation in Components

```typescript
import { useAppShell } from '@/components/base/AppShell'

const MyComponent = () => {
  const { navigateTo, openDialog } = useAppShell()

  // Type-safe navigation with parameters
  const handleEdit = () => {
    navigateTo('rate-plan-edit', { id: ratePlanId })
  }

  // Promise-based confirmation dialog
  const handleDelete = async () => {
    const confirmed = await openDialog<boolean>((close) => (
      <Box padding="2rem" textAlign="center">
        <p>Are you sure you want to delete this rate plan?</p>
        <Button onClick={() => close(true)}>Yes, Delete</Button>
        <Button onClick={() => close(false)}>Cancel</Button>
      </Box>
    ))
    
    if (confirmed) {
      // Proceed with deletion
    }
  }
}
```

#### Key Features
- **Type-Safe Navigation** - Compile-time parameter validation
- **Promise-Based Dialogs** - Modal dialogs that return values asynchronously
- **Navigation Guards** - Protect routes with unsaved changes warnings
- **Browser History** - Full back/forward button support
- **Dynamic Content Mounting** - Mount header/sidebar/footer content dynamically

#### Editing Page UI Pattern

For editing pages (Property Edit, Rate Plan Edit, etc.), the application follows a consistent pattern:

**Custom Header + Conditional Footer:**
```typescript
// Always mount custom minimal header
const unmountHeader = mountHeader(
  <CustomEditHeader title="Edit Rate Plan" onBack={handleBack} />
)

// Mount footer ONLY when there are unsaved changes
if (hasUnsavedChanges) {
  unmountFooter = mountFooter(
    <CustomEditFooter 
      onSave={handleSave} 
      onDiscard={handleDiscard}
      isSaving={isSaving}
    />
  )
}
```

**Features:**
- **Minimal Header** - Custom red header with back button and title
- **Conditional Footer** - Save/Discard buttons only when changes exist
- **Navigation Guards** - Automatic protection against data loss
- **Smart Back Button** - Offers to save changes before leaving
- **Loading States** - Visual feedback during save operations
- **Consistent Styling** - Brand red color (`#D52122`) for all editing UI

### Unified Manager Pattern

**CRITICAL**: For features requiring both Create and Edit functionality, always use the Unified Manager Pattern to eliminate code duplication and ensure consistency.

#### Pattern Structure
```typescript
// Single component handles both create and edit modes
const ComponentManager: React.FC<{ itemId?: string }> = ({ itemId }) => {
  // Mode detection: 'new' = create, actual ID = edit
  const isCreateMode = itemId === 'new'
  const isEditMode = !isCreateMode && itemId
  
  // All state managed in Redux (NO local formData)
  const { currentForm, hasUnsavedChanges, isSaving } = useSelector(state => state.slice)
  
  // Unified save logic
  const handleSave = async () => {
    if (isCreateMode) {
      await dispatch(createItemAsync(currentForm))
    } else {
      await dispatch(updateItemAsync({ id: itemId, data: currentForm }))
    }
  }
}
```

#### Key Benefits
- **✅ Single Source of Truth** - One component, no duplication
- **✅ Redux Integration** - Centralized state management  
- **✅ Consistent UX** - Identical behavior for create/edit
- **✅ Easy Maintenance** - Fix bugs once, works everywhere
- **✅ Type Safety** - Unified interface and validation

#### Implementation Rules
1. **Never create separate Create/Edit components**
2. **Use parameter-based mode detection (`itemId === 'new'`)**
3. **All form state in Redux, never local formData**
4. **Single unified save handler with mode branching**
5. **Shared header/footer components for both modes**

## 📱 Responsive Design

### Breakpoint System
- **Mobile** (default): Base styles, no suffix
- **Sm** (≥640px): Large phones
- **Md** (≥768px): Tablets
- **Lg** (≥1024px): Laptops
- **Xl** (≥1280px): Desktops

### Usage Example
```typescript
<Box
  display="block"        // Mobile: Stack vertically
  displayMd="flex"       // Tablet+: Horizontal layout
  gap={8}                // Mobile: Small gap
  gapLg={16}            // Desktop: Larger gap
  flexDirection="column" // Mobile: Column
  flexDirectionLg="row"  // Desktop: Row
/>
```

## 🛠️ State Management

### Redux Toolkit Structure

```typescript
// Authentication State
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// Property State  
interface PropertyState {
  properties: Property[];
  currentProperty: Property | null;
  wizardData: WizardFormData;
  loading: boolean;
  error: string | null;
}
```

### API Integration

```typescript
// Centralized API client with interceptors
import { api } from '@/utils/api';

// Automatic token attachment
api.get('/api/properties/my-properties');

// File upload with progress
api.post('/api/photos/upload', formData, {
  onUploadProgress: (progress) => {
    console.log(`Upload: ${progress.loaded}/${progress.total}`);
  }
});
```

## 📐 CSS Unit Standards & Design System

### **MANDATORY CSS Unit Rules**
All styling properties must follow these strict guidelines:

#### **📏 Font Size Rules**
- **MINIMUM**: `fontSize: '1rem'` (16px baseline)
- **ALLOWED VALUES**: `1rem`, `1.125rem`, `1.25rem`, `1.5rem`, `2rem`, etc.
- **NEVER USE**: Sub-1rem values like `0.875rem`, `0.75rem`, `14px`

```typescript
// ✅ CORRECT
<Box fontSize="1rem">Standard text</Box>
<Box fontSize="1.25rem">Large text</Box>
<Box fontSize="2rem">Heading text</Box>

// ❌ INCORRECT  
<Box fontSize="0.875rem">Too small</Box>
<Box fontSize="14px">Wrong unit</Box>
```

#### **📦 Spacing Rules (padding, margin, width, height)**
- **UNIT**: Must use `rem` units only
- **SCALE**: Must be multiples of `0.25rem`
- **ALLOWED VALUES**: `0.25rem`, `0.5rem`, `0.75rem`, `1rem`, `1.25rem`, `1.5rem`, `2rem`, etc.

```typescript
// ✅ CORRECT
<Box padding="1rem" margin="0.5rem" width="10rem">Content</Box>
<Box paddingMd="1.5rem" marginLg="2rem">Responsive</Box>

// ❌ INCORRECT
<Box padding="12px" margin="8px">Wrong units</Box>
<Box padding="0.3rem" margin="0.6rem">Not 0.25rem multiples</Box>
```

#### **🎯 Design System Scale**

| **Property** | **Values** | **Examples** |
|-------------|------------|--------------|
| **fontSize** | `≥1rem` in any increment | `1rem`, `1.125rem`, `1.25rem`, `1.5rem`, `2rem` |
| **Spacing** | `0.25rem` multiples | `0.25rem`, `0.5rem`, `0.75rem`, `1rem`, `1.5rem`, `2rem` |
| **Width/Height** | `0.25rem` multiples | `1rem`, `2.5rem`, `5rem`, `10rem`, `20rem` |

## ✅ Best Practices

### CSS & Styling
- ✅ **ALWAYS use rem units** for all measurements
- ✅ **fontSize minimum 1rem** for accessibility
- ✅ **0.25rem spacing scale** for consistency
- ✅ Use Box component for all styling needs
- ✅ Implement responsive design from the start
- ✅ Add motion effects for better UX
- ✅ Use semantic HTML via `as` prop

### Component Development
- ✅ Compose complex UIs from simple components
- ✅ Follow established rem-based patterns
- ✅ Use TypeScript for prop validation
- ✅ Implement proper error boundaries

### State Management
- ✅ Use Redux for global application state
- ✅ Use local state for UI-only concerns
- ✅ Implement optimistic updates
- ✅ Normalize complex data structures

### TypeScript
- ✅ Define interfaces for all props
- ✅ Use strict TypeScript configuration
- ✅ Type API responses properly
- ✅ Leverage utility types

### Performance
- ✅ Lazy load large components
- ✅ Memoize expensive calculations
- ✅ Optimize images before upload
- ✅ Use virtual scrolling for long lists

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📦 Build & Deployment

```bash
# Production build
npm run build

# Output directory: dist/
# Optimized for production with:
# - Code splitting
# - Tree shaking
# - Minification
# - Asset optimization
```

### Deployment Checklist
- [ ] Set production environment variables
- [ ] Configure API endpoints
- [ ] Enable HTTPS
- [ ] Set up CDN for static assets
- [ ] Configure error tracking
- [ ] Set up monitoring

## 🤝 Contributing

1. Follow established patterns and conventions
2. Use TypeScript with strict typing
3. Implement responsive design
4. Add appropriate motion effects
5. Write comprehensive tests
6. Update documentation

## 📚 Resources

- **Live Examples**: `/examples` routes for component demos
- **API Documentation**: See server README
- **Design System**: Box component documentation
- **UI Mockups**: `docs/homeowner-onboarding-villa-registration/*.png`

## 📞 Support

For questions or issues:
- Component examples: `/examples` routes
- API integration: `src/utils/api.ts`
- State management: `src/store/`
- Routing: `src/routes/`

---

Built with ❤️ for the UAE property rental market using modern React patterns and best practices.