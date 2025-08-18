# Wezo Client - Property Management Dashboard 🏠

A modern, responsive React application for property owners to manage villa listings on the Wezo.ae platform. Built with TypeScript, Vite, and featuring a comprehensive property management system with advanced photo upload capabilities.

## 🏗️ Architecture Overview

### Tech Stack
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Full type safety and enhanced developer experience  
- **Vite** - Lightning-fast development server and build tool
- **TanStack Router** - Type-safe file-based routing
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
│   ├── routes/                 # TanStack Router pages
│   │   ├── __root.tsx          # Root layout
│   │   ├── index.tsx           # Landing page
│   │   ├── login.tsx           # Login page
│   │   ├── register.tsx        # Registration page
│   │   ├── dashboard/          # Dashboard routes
│   │   │   ├── index.tsx       # Dashboard home
│   │   │   ├── my-properties.tsx # Property list
│   │   │   └── photos.tsx      # Photo management
│   │   ├── property/           # Property routes
│   │   │   ├── $propertyId.tsx # Property details
│   │   │   └── $propertyId/
│   │   │       └── edit.tsx    # Property editor
│   │   └── examples/           # Component demos
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
│   ├── App.tsx                 # Root application
│   ├── main.tsx                # Entry point
│   └── router.tsx              # Router configuration
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

### Routing Configuration

Routes are automatically generated from the file structure:
- `/dashboard` → `src/routes/dashboard/index.tsx`
- `/property/:id` → `src/routes/property/$propertyId.tsx`
- `/examples/box` → `src/routes/examples/box.tsx`

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