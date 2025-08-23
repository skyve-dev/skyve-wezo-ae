# AppShell Component

A comprehensive and reusable application shell component designed for modern web applications. The AppShell provides a complete navigation framework with splash screen, adaptive layouts, type-safe routing, and integrated dialog system - all optimized for mobile, tablet, and desktop devices.

## Features

- **Splash Screen**: Animated splash screen with circle expansion reveal animation
- **Adaptive Navigation**: Responsive navigation with SlidingDrawer and Tab components
- **Type-Safe Routing**: Internal routing system with full TypeScript type safety
- **Navigation Event Hooks**: Lifecycle hooks for before and after navigation events
- **Dialog System**: Async alert/confirmation dialogs with customizable buttons
- **Responsive Design**: Mobile-first design with adaptive layouts
- **Context Management**: Centralized state management with AppShellContext
- **Portal Rendering**: Proper z-index layering for overlays and dialogs

## Design Rationale

The AppShell component was designed with the following principles:

1. **Type Safety**: Full TypeScript support with compile-time route validation
2. **User Experience**: Smooth animations and responsive design patterns
3. **Accessibility**: Full ARIA support and keyboard navigation
4. **Performance**: Optimized rendering and minimal re-renders
5. **Flexibility**: Configurable components and theming options
6. **Mobile-First**: Progressive enhancement from mobile to desktop

## Basic Usage

```tsx
import React from 'react'
import { AppShell, createRoutes } from './AppShell'
import { FaHome, FaUser, FaCog } from 'react-icons/fa'

// Define your app's components
const HomePage = () => <div>Home Page</div>
const ProfilePage = ({ userId }: { userId: string }) => <div>Profile: {userId}</div>
const SettingsPage = () => <div>Settings Page</div>

// Create type-safe routes
const routes = createRoutes({
  home: {
    component: HomePage,
    icon: <FaHome />,
    label: 'Home'
  },
  profile: {
    component: ProfilePage,
    icon: <FaUser />,
    label: 'Profile'
  },
  settings: {
    component: SettingsPage,
    icon: <FaCog />,
    label: 'Settings'
  }
})

function App() {
  return (
    <AppShell 
      routes={routes}
      initialRoute="home"
      config={{
        splash: {
          duration: 2000,
          logo: <FaHome />,
          text: 'Welcome to MyApp'
        },
        header: {
          title: 'My Application',
          logo: <FaHome />
        }
      }}
    />
  )
}
```

## Type System

### Route Definition

```tsx
interface BaseRoute {
  component: React.ComponentType<any>
  icon?: React.ReactNode
  label: string
  showInNav?: boolean
  showInHeader?: boolean
  showInFooter?: boolean
}
```

### Type-Safe Navigation

```tsx
const { navigateTo } = useAppShell()

// ✅ Type-safe - component expects { userId: string }
navigateTo('profile', { userId: '123' })

// ❌ TypeScript error - missing required props
navigateTo('profile') // Error: Argument missing

// ✅ Type-safe - component expects no props
navigateTo('home')

// ✅ Type-safe - optional props
navigateTo('home', {}) // OK
```

## Configuration

### AppShellConfig Interface

```tsx
interface AppShellConfig {
  splash?: {
    duration?: number          // Splash screen duration (default: 2000ms)
    logo?: React.ReactNode     // Logo to display
    text?: string             // Loading text (default: 'Loading...')
  }
  header?: {
    title?: string            // App title
    logo?: React.ReactNode    // Header logo
    showQuickNav?: boolean    // Show quick navigation tabs
    actions?: React.ReactNode[] // Header action buttons
  }
  footer?: {
    showOnMobile?: boolean    // Show footer on mobile (default: true)
    maxItems?: number         // Max footer items (default: 4)
  }
  breakpoints?: {
    mobile: number           // Mobile breakpoint (default: 768px)
    tablet: number           // Tablet breakpoint (default: 1024px)  
    desktop: number          // Desktop breakpoint (default: 1200px)
  }
  theme?: {
    primaryColor?: string    // Primary theme color
    backgroundColor?: string // Background color
    navBackgroundColor?: string // Navigation background
  }
}
```

## Context API

### useAppShell Hook

```tsx
const {
  // Navigation
  navigateTo,
  currentRoute,
  
  // UI State
  isSideNavOpen,
  setSideNavOpen,
  
  // Dialog System
  alertDialog,
  
  // Loading State
  isLoading,
  setLoading,
  
  // Routes
  routes
} = useAppShell()
```

### Navigation Functions

```tsx
// Type-safe navigation
navigateTo('routeName', props)

// Open/close side navigation
setSideNavOpen(true)
setSideNavOpen(false)

// Show loading overlay
setLoading(true)
setLoading(false)
```

## Navigation Event Hooks

The AppShell provides powerful navigation lifecycle hooks that allow you to intercept and control navigation events throughout your application.

### onBeforeNavigate Hook

The `onBeforeNavigate` hook is called before every navigation attempt and gives you complete control over whether navigation proceeds, gets redirected, or is blocked entirely. It receives the target and source route information.

```tsx
import { AppShell } from './AppShell'

const handleBeforeNavigate = async (next, target, source) => {
  // Access source and target route information
  console.log('Navigating from:', source.path, source.params)
  console.log('Navigating to:', target.path, target.params)
  
  // Your pre-navigation logic here
  
  // Option 1: Proceed with original navigation
  next()
  
  // Option 2: Redirect to different route
  next('login', { returnUrl: target.path })
  
  // Option 3: Block navigation (don't call next at all)
  // return; // Navigation is blocked
}

function App() {
  return (
    <AppShell
      routes={routes}
      onBeforeNavigate={handleBeforeNavigate}
    />
  )
}
```

### onAfterNavigate Hook

The `onAfterNavigate` hook is called after successful navigation completion, perfect for analytics, cleanup, or other side effects. It receives both the target and source route information.

```tsx
const handleAfterNavigate = async (target, source) => {
  // Post-navigation logic with route information
  console.log('Navigation completed')
  console.log('From:', source.path, 'To:', target.path)
  
  // Analytics tracking with detailed route info
  analytics.track('page_view', {
    from: source.path,
    to: target.path,
    params: target.params,
    timestamp: Date.now()
  })
  
  // Cleanup or setup tasks based on routes
  if (source.path === '/form') {
    clearFormData()
  }
  if (target.path === '/dashboard') {
    loadDashboardData()
  }
}

<AppShell
  routes={routes}
  onAfterNavigate={handleAfterNavigate}
/>
```

### Authentication Guard Example

```tsx
const authGuard = async (next, target, source) => {
  // Check if user is trying to access protected route
  const protectedRoutes = ['/profile', '/settings', '/admin']
  
  if (protectedRoutes.includes(target.path) && !user.isAuthenticated) {
    // Redirect to login with return URL
    next('login', { returnUrl: target.path })
    return
  }
  
  // Continue with original navigation
  next()
}

<AppShell
  routes={routes}
  onBeforeNavigate={authGuard}
/>
```

### Confirmation Dialog Example

```tsx
const confirmationGuard = async (next) => {
  // Show confirmation for destructive actions
  const destructiveRoutes = ['delete-account', 'reset-data']
  const targetRoute = getCurrentNavigationTarget()
  
  if (destructiveRoutes.includes(targetRoute)) {
    const confirmed = await showConfirmDialog(
      'Are you sure?',
      'This action cannot be undone.'
    )
    
    if (!confirmed) {
      return // Block navigation
    }
  }
  
  next() // Proceed
}
```

### Analytics Tracking Example

```tsx
const analyticsTracker = async () => {
  const route = getCurrentRoute()
  const user = getCurrentUser()
  
  // Track page view
  analytics.page(route, {
    userId: user.id,
    timestamp: Date.now(),
    referrer: document.referrer
  })
  
  // Track user engagement
  startEngagementTimer()
  
  // Update user activity
  updateLastActiveTime()
}

<AppShell
  routes={routes}
  onAfterNavigate={analyticsTracker}
/>
```

### Complex Navigation Flow

```tsx
const navigationManager = async (next) => {
  const user = getCurrentUser()
  const targetRoute = getCurrentNavigationTarget()
  
  // Step 1: Authentication check
  if (!user.isAuthenticated && isProtectedRoute(targetRoute)) {
    next('login', { returnUrl: targetRoute })
    return
  }
  
  // Step 2: Role-based access control
  if (!hasPermission(user.role, targetRoute)) {
    next('unauthorized', {})
    return
  }
  
  // Step 3: Feature flags check
  if (!isFeatureEnabled(targetRoute)) {
    next('coming-soon', { feature: targetRoute })
    return
  }
  
  // Step 4: Business logic validation
  if (targetRoute === 'checkout' && !hasItemsInCart()) {
    next('cart', { message: 'Add items before checkout' })
    return
  }
  
  // All checks passed
  next()
}

const postNavigationTasks = async () => {
  // Update breadcrumbs
  updateBreadcrumbs()
  
  // Load route-specific data
  await loadRouteData()
  
  // Update document title
  updateDocumentTitle()
  
  // Track analytics
  trackPageView()
  
  // Scroll to top
  window.scrollTo(0, 0)
}

<AppShell
  routes={routes}
  onBeforeNavigate={navigationManager}
  onAfterNavigate={postNavigationTasks}
/>
```

### Hook Function Signatures

```tsx
// Route information passed to hooks
interface RouteInfo {
  path: string                    // The route path (e.g., '/profile')
  params: Record<string, any>     // Route parameters/props
}

// Next function type - controls navigation flow
type NextFunction<T> = <K extends keyof T>(
  path?: K,                              // Optional redirect path
  params?: ComponentProps<T[K]['component']> // Params for redirect target
) => void

// Before navigate hook type
type OnBeforeNavigateFunction<T> = (
  next: NextFunction<T>,
  target: RouteInfo,              // Where navigation is going
  source: RouteInfo               // Where navigation is coming from
) => void | Promise<void>

// After navigate hook type  
type OnAfterNavigateFunction = (
  target: RouteInfo,              // Where navigation went
  source: RouteInfo               // Where navigation came from
) => void | Promise<void>

// AppShell props
interface AppShellProps<T> {
  routes: T
  initialRoute?: keyof T
  onBeforeNavigate?: OnBeforeNavigateFunction<T>
  onAfterNavigate?: OnAfterNavigateFunction
  config?: AppShellConfig
  children?: ReactNode
}
```

### Best Practices

1. **Error Handling**: Always wrap hook logic in try-catch blocks
2. **Performance**: Keep hooks lightweight to avoid blocking navigation
3. **User Experience**: Provide feedback for blocked or redirected navigation
4. **Logging**: Log navigation events for debugging and analytics
5. **Testing**: Test all navigation paths including edge cases

### Common Use Cases

- **Authentication Guards**: Redirect unauthenticated users to login
- **Authorization Checks**: Block access to unauthorized routes
- **Confirmation Dialogs**: Confirm destructive or important actions
- **Analytics Tracking**: Track page views and user behavior
- **Data Loading**: Preload data for target routes
- **Cleanup Tasks**: Clean up resources when leaving routes
- **Error Boundaries**: Handle navigation errors gracefully
- **Feature Flags**: Control access to experimental features
- **A/B Testing**: Route users to different variants
- **Maintenance Mode**: Redirect during maintenance windows

## Dialog System

### Alert Dialog

```tsx
const { alertDialog } = useAppShell()

// Simple confirmation
await alertDialog({
  icon: <FaExclamationTriangle />,
  title: 'Confirm Action',
  text: 'Are you sure you want to delete this item?',
  buttons: [
    {
      label: 'Cancel',
      variant: 'normal',
      onClick: async () => {
        // Cancel logic
      }
    },
    {
      label: 'Delete',
      variant: 'danger', 
      onClick: async () => {
        // Delete logic
        await deleteItem()
      }
    }
  ]
})

console.log('Dialog closed')
```

### Async Button Handlers

```tsx
await alertDialog({
  title: 'Save Changes',
  text: 'Do you want to save your changes?',
  buttons: [
    {
      label: 'Save',
      variant: 'primary',
      onClick: async () => {
        setLoading(true)
        try {
          await saveData()
          // Show success message
        } catch (error) {
          // Handle error
        } finally {
          setLoading(false)
        }
      }
    },
    {
      label: 'Discard',
      onClick: async () => {
        // Discard changes
      }
    }
  ]
})
```

## Responsive Behavior

### Mobile Layout
- Header with hamburger menu and title
- Footer navigation with up to 4 items
- Side drawer for full navigation
- Touch-optimized interactions

### Tablet Layout
- Header with logo, title, and quick navigation tabs
- No footer navigation
- Side drawer for full navigation
- Hybrid touch/mouse interactions

### Desktop Layout
- Full header with navigation tabs
- No footer navigation
- Side drawer for detailed navigation
- Mouse and keyboard optimized

## Splash Screen Animation

The splash screen features a distinctive circle expansion animation:

1. **Loading Phase**: Shows logo, text, and loading spinner
2. **Expanding Phase**: Circle contracts to center and expands outward
3. **Complete Phase**: Reveals main application content

```tsx
// Custom splash configuration
config={{
  splash: {
    duration: 3000,
    logo: <MyLogo />,
    text: 'Initializing Application...'
  }
}}
```

## Advanced Examples

### Custom Route Components

```tsx
// Component with props
interface UserProfileProps {
  userId: string
  tab?: 'info' | 'settings' | 'activity'
}

const UserProfile: React.FC<UserProfileProps> = ({ userId, tab = 'info' }) => {
  return (
    <div>
      <h1>User Profile: {userId}</h1>
      <div>Active Tab: {tab}</div>
    </div>
  )
}

// Route definition
const routes = createRoutes({
  userProfile: {
    component: UserProfile,
    icon: <FaUser />,
    label: 'Profile'
  }
})

// Type-safe navigation with props
const { navigateTo } = useAppShell()
navigateTo('userProfile', { userId: '123', tab: 'settings' })
```

### Conditional Navigation Items

```tsx
const routes = createRoutes({
  home: {
    component: HomePage,
    icon: <FaHome />,
    label: 'Home',
    showInNav: true,
    showInHeader: true,
    showInFooter: true
  },
  admin: {
    component: AdminPage,
    icon: <FaShield />,
    label: 'Admin',
    showInNav: user.isAdmin,
    showInHeader: false,
    showInFooter: false
  },
  settings: {
    component: SettingsPage,
    icon: <FaCog />,
    label: 'Settings',
    showInNav: true,
    showInHeader: false,
    showInFooter: true
  }
})
```

### Complex Dialog Workflows

```tsx
const handleComplexWorkflow = async () => {
  // Step 1: Confirm action
  await alertDialog({
    title: 'Start Process',
    text: 'This will begin a multi-step process.',
    buttons: [
      { label: 'Cancel', onClick: async () => {} },
      { label: 'Continue', variant: 'primary', onClick: async () => {} }
    ]
  })

  // Step 2: Show progress
  setLoading(true)
  
  try {
    await longRunningProcess()
    
    // Step 3: Show success
    await alertDialog({
      icon: <FaCheckCircle />,
      title: 'Success',
      text: 'The process completed successfully.',
      buttons: [
        { label: 'OK', variant: 'primary', onClick: async () => {} }
      ]
    })
  } catch (error) {
    // Step 3: Show error
    await alertDialog({
      icon: <FaExclamationTriangle />,
      title: 'Error',
      text: 'The process failed. Please try again.',
      buttons: [
        { label: 'Retry', variant: 'primary', onClick: async () => handleComplexWorkflow() },
        { label: 'Cancel', onClick: async () => {} }
      ]
    })
  } finally {
    setLoading(false)
  }
}
```

### Theme Customization

```tsx
const config: AppShellConfig = {
  theme: {
    primaryColor: '#10b981',
    backgroundColor: '#f0fdf4',
    navBackgroundColor: '#ffffff'
  },
  header: {
    title: 'Green Theme App',
    logo: <FaLeaf />
  },
  breakpoints: {
    mobile: 640,
    tablet: 1024,
    desktop: 1280
  }
}
```

## Helper Functions

### createRoutes

Creates a type-safe route definition object:

```tsx
const routes = createRoutes({
  // Your routes here
})
```

### createAppShell

Creates a pre-configured AppShell with typed routes:

```tsx
const { Provider, useAppShell } = createAppShell(routes)

function App() {
  return (
    <Provider initialRoute="home">
      <AppShell routes={routes} />
    </Provider>
  )
}
```

## Best Practices

1. **Route Organization**: Group related routes and use consistent naming
2. **Type Safety**: Always use the provided TypeScript types
3. **Performance**: Use React.memo for route components when appropriate
4. **Loading States**: Show loading indicators for async operations
5. **Error Handling**: Always handle errors in dialog button handlers
6. **Accessibility**: Provide meaningful labels and icons for navigation items
7. **Mobile-First**: Design for mobile and enhance for larger screens

## Accessibility Features

- **ARIA Attributes**: Proper labeling for navigation and dialogs
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Focus Management**: Proper focus handling in dialogs and navigation
- **Screen Reader Support**: Meaningful announcements and labels
- **Touch Targets**: Appropriate sizing for touch interactions

## Performance Considerations

- **Lazy Loading**: Consider lazy loading route components
- **Memoization**: Use React.memo for expensive route components
- **Bundle Splitting**: Split routes into separate bundles when appropriate
- **Animation Performance**: Hardware-accelerated animations using transforms
- **Memory Management**: Proper cleanup of event listeners and timers

## Browser Support

The AppShell component supports all modern browsers:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Migration Guide

### From Traditional Routing

```tsx
// Before: React Router
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// After: AppShell
import { AppShell, createRoutes } from './AppShell'

const routes = createRoutes({
  home: { component: HomePage, label: 'Home', icon: <FaHome /> },
  about: { component: AboutPage, label: 'About', icon: <FaInfo /> }
})
```

### State Management Integration

```tsx
// With Redux/Zustand
const MyApp = () => {
  const user = useSelector(state => state.user)
  
  const routes = createRoutes({
    profile: {
      component: ProfilePage,
      label: 'Profile',
      showInNav: !!user
    }
  })
  
  return <AppShell routes={routes} />
}
```

## Troubleshooting

### Common Issues

1. **TypeScript Errors**: Ensure route props match component props exactly
2. **Navigation Not Working**: Check that routes are properly defined
3. **Dialog Not Showing**: Verify AppShell component is properly configured
4. **Responsive Issues**: Check breakpoint configuration
5. **Animation Problems**: Ensure CSS transforms are supported

### Debug Mode

```tsx
// Enable debug logging
const routes = createRoutes({
  // Your routes
})

// Add debugging
console.log('Routes:', routes)
console.log('Current route:', currentRoute)
```

## Examples Repository

Check the AppShell.example.tsx file for comprehensive examples including:
- Basic setup
- Type-safe navigation
- Complex dialog workflows
- Responsive design patterns
- Theme customization
- Error handling patterns