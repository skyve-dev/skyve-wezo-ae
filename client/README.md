# Wezo Client 🏠

Frontend application for the Wezo property rental platform - a modern, responsive React application built with TypeScript, Vite, and advanced component architecture.

## 🏗️ Architecture Overview

### Tech Stack
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Full type safety and enhanced developer experience
- **Vite** - Fast development server and build tool
- **TanStack Router** - Type-safe file-based routing
- **Redux Toolkit** - Predictable state management
- **Custom Box Component System** - Advanced styling and responsive design

### Design Patterns

#### 1. **Component Composition Pattern**
```typescript
// ✅ Good: Compose complex UIs from simple, reusable components
<Box display="flex" gap={16}>
  <Box as="button" whileHover={{ transform: 'scale(1.05)' }}>
    Primary Action
  </Box>
  <Box as="button" variant="secondary">
    Secondary Action
  </Box>
</Box>
```

#### 2. **Props-as-Styles Pattern**
The Box component implements a props-as-styles pattern, eliminating the need for CSS classes:
```typescript
// ✅ Instead of CSS classes, use props
<Box 
  backgroundColor="#007bff"
  padding={16}
  borderRadius={8}
  whileHover={{ backgroundColor: '#0056b3' }}
/>
```

#### 3. **Polymorphic Component Pattern**
Components can render as different HTML elements while maintaining type safety:
```typescript
// All of these are type-safe and properly typed
<Box as="button" onClick={handleClick}>Button</Box>
<Box as="input" value={value} onChange={handleChange} />
<Box as="a" href="/example">Link</Box>
```

#### 4. **Mobile-First Responsive Pattern**
```typescript
<Box
  padding={16}        // Mobile: 16px
  paddingMd={24}     // Tablet+: 24px  
  paddingLg={32}     // Laptop+: 32px
  paddingXl={40}     // Desktop+: 40px
/>
```

## 📁 Folder Structure

```
client/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── Box.tsx          # Core Box component (polymorphic, responsive, motion)
│   │   ├── Dashboard.tsx    # Dashboard page component
│   │   ├── forms/           # Form-related components
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   └── examples/        # Example/documentation components
│   │       └── BoxExamplePage.tsx
│   ├── routes/              # File-based routing (TanStack Router)
│   │   ├── __root.tsx       # Root layout component
│   │   ├── index.tsx        # Home page route
│   │   ├── dashboard.tsx    # Dashboard route
│   │   ├── login.tsx        # Login route
│   │   ├── register.tsx     # Register route
│   │   └── example/         # Example routes
│   │       └── Box.tsx      # Box component examples
│   ├── store/               # Redux state management
│   │   ├── index.ts         # Store configuration
│   │   ├── hooks.ts         # Typed Redux hooks
│   │   └── slices/          # Redux Toolkit slices
│   │       └── authSlice.ts # Authentication state
│   ├── types/               # TypeScript type definitions
│   │   ├── auth.ts          # Authentication types
│   │   └── box.ts           # Box component types
│   ├── utils/               # Utility functions and helpers
│   │   ├── api.ts           # API client utilities
│   │   ├── globalStyles.ts  # Global CSS styles
│   │   └── responsive.ts    # Responsive styling utilities
│   ├── App.tsx              # Root App component
│   ├── main.tsx             # Application entry point
│   └── router.tsx           # Router configuration
├── public/                  # Static assets
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite build configuration
└── README.md                # This file
```

## 🎨 Box Component System

The cornerstone of our architecture is the **Box component** - a powerful, polymorphic component that replaces traditional CSS with a prop-based styling system.

### Key Features

#### 🔄 **Polymorphic "as" Prop**
```typescript
// Renders different HTML elements with full TypeScript support
<Box as="button" type="submit" onClick={handleSubmit}>Submit</Box>
<Box as="input" type="email" value={email} onChange={handleChange} />
<Box as="h1" fontSize={32} fontWeight="bold">Title</Box>
```

#### 📱 **Mobile-First Responsive Design**
```typescript
<Box
  // Base (mobile) styles
  fontSize={16}
  padding={8}
  display="block"
  
  // Tablet and up (≥768px)
  fontSizeMd={18}
  paddingMd={12}
  displayMd="flex"
  
  // Laptop and up (≥1024px)
  fontSizeLg={20}
  paddingLg={16}
  
  // Desktop and up (≥1280px)
  fontSizeXl={24}
  paddingXl={20}
/>
```

#### ✨ **Motion-Based Interactions**
```typescript
<Box
  whileHover={{
    // Mobile: subtle effect
    transform: 'translateY(-2px)',
    
    // Desktop: more dramatic
    Lg: {
      transform: 'translateY(-4px) scale(1.05)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    }
  }}
  whileTap={{ transform: 'scale(0.98)' }}
  whileInView={{ opacity: 1 }}
/>
```

### Breakpoint System
- **Default (Mobile)**: Base styles, no suffix
- **Sm (≥640px)**: Small tablets and large phones
- **Md (≥768px)**: Tablets
- **Lg (≥1024px)**: Laptops and small desktops
- **Xl (≥1280px)**: Large desktops

## 🚀 Development Guidelines

### Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type check
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Organization

#### 1. **Component Structure**
```typescript
// ✅ Good: Well-structured component with clear separation
import React from 'react';
import { Box } from '@/components/Box';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  // Hooks at the top
  const dispatch = useAppDispatch();
  const state = useAppSelector(selectSomeState);
  
  // Event handlers
  const handleClick = () => {
    // Handle logic
    onAction();
  };
  
  // Render
  return (
    <Box padding={20} backgroundColor="white" borderRadius={8}>
      <Box as="h2" fontSize={24} marginBottom={16}>{title}</Box>
      <Box as="button" onClick={handleClick}>Action</Box>
    </Box>
  );
};
```

#### 2. **State Management**
```typescript
// ✅ Use Redux Toolkit for global state
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const featureSlice = createSlice({
  name: 'feature',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});
```

#### 3. **Routing**
```typescript
// ✅ File-based routing with TanStack Router
import { createFileRoute } from '@tanstack/react-router'
import { MyPageComponent } from '@/components/MyPageComponent'

export const Route = createFileRoute('/my-page')({
  component: MyPageComponent,
})
```

## ✅ Do's and Don'ts

### ✅ **DO's**

#### Component Design
- **DO** use the Box component for all layout and styling needs
- **DO** implement responsive design with mobile-first approach
- **DO** use motion props for interactive feedback
- **DO** leverage polymorphic `as` prop for semantic HTML
- **DO** compose complex UIs from simple components

```typescript
// ✅ Good: Using Box for responsive, interactive design
<Box
  as="button"
  padding={12}
  backgroundColor="#007bff"
  color="white"
  borderRadius={6}
  whileHover={{ backgroundColor: '#0056b3' }}
  whileTap={{ transform: 'scale(0.98)' }}
>
  Click me!
</Box>
```

#### State Management
- **DO** use Redux for global application state
- **DO** use local component state for UI-only state
- **DO** use typed selectors and actions
- **DO** normalize complex data structures

```typescript
// ✅ Good: Typed Redux usage
const user = useAppSelector(selectUser);
const dispatch = useAppDispatch();
dispatch(updateUser({ name: 'New Name' }));
```

#### TypeScript
- **DO** leverage full TypeScript capabilities
- **DO** define proper interfaces for props and data
- **DO** use strict TypeScript configuration
- **DO** type your API responses

```typescript
// ✅ Good: Well-typed component props
interface UserCardProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
  onEdit: (userId: string) => void;
  variant?: 'default' | 'compact';
}
```

### ❌ **DON'Ts**

#### Component Design
- **DON'T** use traditional CSS classes (use Box props instead)
- **DON'T** create components without responsive considerations
- **DON'T** ignore accessibility (use semantic HTML via `as` prop)
- **DON'T** create overly complex single components

```typescript
// ❌ Bad: Using CSS classes instead of Box props
<div className="button primary large">
  Click me
</div>

// ❌ Bad: Non-responsive design
<Box fontSize={24}> // Only works on large screens
  Text
</Box>

// ✅ Good: Responsive design
<Box fontSize={16} fontSizeMd={20} fontSizeLg={24}>
  Responsive Text
</Box>
```

#### State Management
- **DON'T** put all state in Redux (use local state when appropriate)
- **DON'T** mutate state directly (Redux Toolkit handles this)
- **DON'T** use Redux for derived/computed values (use selectors)

```typescript
// ❌ Bad: Everything in Redux
const [isModalOpen, setIsModalOpen] = useAppSelector(selectModalState);

// ✅ Good: Local UI state
const [isModalOpen, setIsModalOpen] = useState(false);
```

#### File Organization
- **DON'T** put everything in one file
- **DON'T** create deep folder nesting (max 3 levels)
- **DON'T** mix business logic with UI components
- **DON'T** import from parent directories (use absolute imports)

```typescript
// ❌ Bad: Relative imports
import { Box } from '../../../components/Box';

// ✅ Good: Absolute imports
import { Box } from '@/components/Box';
```

## 🎯 Best Practices

### Performance
1. **Lazy Loading**: Use dynamic imports for large components
2. **Memoization**: Memoize expensive calculations and components
3. **Bundle Splitting**: Leverage Vite's automatic code splitting
4. **Image Optimization**: Use appropriate image formats and sizes

### Accessibility
1. **Semantic HTML**: Use appropriate HTML elements via `as` prop
2. **ARIA Labels**: Include proper ARIA attributes
3. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
4. **Focus Management**: Handle focus states properly

### Testing Strategy
1. **Unit Tests**: Test individual component logic
2. **Integration Tests**: Test component interactions
3. **E2E Tests**: Test complete user workflows
4. **Visual Testing**: Test responsive design across breakpoints

## 📚 Key Resources

- **Box Component Examples**: Visit `/example/Box` for comprehensive demos
- **TanStack Router**: [Official Documentation](https://tanstack.com/router)
- **Redux Toolkit**: [Official Documentation](https://redux-toolkit.js.org/)
- **TypeScript**: [Official Documentation](https://www.typescriptlang.org/)
- **Vite**: [Official Documentation](https://vitejs.dev/)

## 🤝 Contributing

1. Follow the established patterns and conventions
2. Write TypeScript with strict typing
3. Use the Box component system for all styling
4. Implement responsive design from the start
5. Add motion effects where appropriate
6. Write comprehensive tests
7. Update documentation for new features

## 📞 Support

For questions about the architecture, patterns, or Box component system, refer to:
- Live examples at `/example/Box`
- Component source code in `src/components/Box.tsx`
- Type definitions in `src/types/box.ts`
- Utility functions in `src/utils/responsive.ts`

---

Built with ❤️ using modern React patterns and the powerful Box component system.