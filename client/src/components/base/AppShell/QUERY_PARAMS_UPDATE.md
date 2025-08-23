# AppShell Query Parameters Update

## Overview
The AppShell routing mechanism has been enhanced to support URL query parameters, enabling seamless data passing between routes and maintaining state across page refreshes and direct URL access.

## Key Features

### 1. Automatic Parameter Serialization
When calling `navigateTo(routeKey, params)`, the params object is automatically serialized into URL query parameters:

```typescript
// Navigate with parameters
await navigateTo('user-profile', {
  userId: '123',
  tab: 'settings',
  filters: { status: 'active', role: 'admin' }
})

// Results in URL: /user-profile?userId=123&tab=settings&filters=%7B%22status%22%3A%22active%22%2C%22role%22%3A%22admin%22%7D
```

### 2. Intelligent Parameter Parsing
URL query parameters are automatically parsed and converted to appropriate JavaScript types:

- `?active=true` → `{ active: true }` (boolean)
- `?count=42` → `{ count: 42 }` (number)
- `?user={"name":"John"}` → `{ user: { name: "John" } }` (object)
- `?name=John` → `{ name: "John" }` (string)

### 3. Unified Parameter Object
Components receive a unified params object that combines:
- Parameters passed via `navigateTo()`
- Query parameters from direct URL visits
- Both have the same structure and behavior

### 4. URL State Preservation
- Page refresh maintains parameters
- Copy/paste URLs work correctly
- Browser back/forward navigation preserves parameters
- Deep linking with parameters works seamlessly

## API Changes

### Updated urlUtils.ts Functions

#### New Functions
- `parseQueryParams(search?: string): Record<string, any>` - Parse URL query string into object
- `serializeQueryParams(params: Record<string, any>): string` - Convert object to query string
- `getCurrentUrl(): { path: string; params: Record<string, any> }` - Get current path and params
- `pathToRouteKeyWithParams(fullPath: string): { routeKey: string; params: Record<string, any> }` - Extract route and params from full path

#### Updated Functions
- `navigateToUrl(path: string, params?: Record<string, any>, replace?: boolean): void` - Now accepts params parameter
- `isSamePath(path1: string, path2: string): boolean` - Now ignores query parameters when comparing paths

### AppShell Context Updates

#### New Properties
- `currentParams: Record<string, any>` - Current route parameters from URL

#### Updated Hook
```typescript
const { navigateTo, currentRoute, currentParams } = useAppShell()
```

### Component Integration

Components automatically receive URL parameters as props:

```typescript
interface MyComponentProps {
  userId?: string
  tab?: string
  settings?: { theme: string }
}

const MyComponent: React.FC<MyComponentProps> = (props) => {
  const { currentParams } = useAppShell()
  
  // Unified params from both navigation and URL
  const allParams = { ...props, ...currentParams }
  
  return <div>Current user: {allParams.userId}</div>
}
```

## Usage Examples

### Basic Navigation with Parameters
```typescript
// Simple parameters
await navigateTo('user-profile', { userId: '123', tab: 'settings' })

// Complex parameters
await navigateTo('search', {
  query: 'properties',
  filters: {
    priceRange: [100, 500],
    location: 'Dubai',
    amenities: ['wifi', 'parking']
  },
  page: 1,
  sortBy: 'price'
})
```

### Reading Parameters in Components
```typescript
const UserProfile: React.FC<{ userId?: string; tab?: string }> = (props) => {
  const { currentParams } = useAppShell()
  
  // Get userId from either navigation or URL
  const userId = props.userId || currentParams.userId
  const activeTab = props.tab || currentParams.tab || 'overview'
  
  useEffect(() => {
    if (userId) {
      fetchUserData(userId)
    }
  }, [userId])
  
  return <div>User {userId} - Tab: {activeTab}</div>
}
```

### Direct URL Access
Users can now access URLs directly with parameters:
- `https://app.com/user-profile?userId=123&tab=settings`
- `https://app.com/search?query=villa&location=Dubai&priceRange=[100,500]`

## Migration Guide

### For Existing Code
No breaking changes for existing navigation calls without parameters:
```typescript
// Still works as before
await navigateTo('dashboard')
```

### For New Parameter Usage
1. Add parameter interfaces to your components
2. Use the new `currentParams` from `useAppShell()`
3. Parameters are automatically available as props and in context

## Technical Implementation

### Parameter Serialization Strategy
1. **Primitives**: Strings, numbers, booleans → Direct URL encoding
2. **Objects/Arrays**: JSON.stringify() → URL encoding
3. **Undefined/null**: Omitted from query string
4. **Parsing**: Automatic type detection with fallback to string

### URL Structure
```
/route-path?param1=value1&param2=value2&complexParam={"key":"value"}
```

### State Synchronization
- URL changes trigger parameter updates
- Component re-renders receive new parameters
- Browser history maintains parameter state
- SSR compatibility maintained

## Benefits

1. **Deep Linking**: Share URLs with application state
2. **Bookmarking**: Users can bookmark specific application states
3. **SEO Friendly**: Search engines can index parameterized pages
4. **User Experience**: Page refresh doesn't lose context
5. **Developer Experience**: Simple API with automatic handling
6. **Type Safety**: Full TypeScript support maintained

## Performance Considerations

- Parameter serialization is optimized for small to medium objects
- Large objects should be stored in application state, not URL
- Automatic debouncing prevents excessive URL updates
- JSON parsing is cached for repeated access

## Browser Compatibility

- Full support in all modern browsers
- Uses standard URLSearchParams API
- Graceful fallback for edge cases
- Works with both client-side and server-side routing