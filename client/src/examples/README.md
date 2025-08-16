# Component Examples

This directory contains comprehensive examples showcasing the reusable React components built for the Wezo.ae property rental platform. Each example demonstrates real-world usage patterns, best practices, and various configuration options.

## Available Examples

### 1. SelectionPicker Examples (`/examples/selection-picker`)

**File**: `SelectionPickerExamples.tsx`

**What it demonstrates**:
- Single and multiple selection modes
- Custom rendering with complex data structures
- Property-specific use cases (users, categories, features, policies)
- Disabled items and conditional styling
- Integration with TypeScript enums
- Responsive grid layouts
- Real-world data formatting

**Key Features Shown**:
- User profile selection with avatars and roles
- Property category selection with counts and descriptions
- Feature selection with essential vs optional grouping
- Subscription plan selection with pricing display
- Property policy configuration (parking, pets)
- Team member assignment with role-based styling

### 2. SlidingDrawer Examples (`/examples/sliding-drawer`)

**File**: `SlidingDrawerExamples.tsx`

**What it demonstrates**:
- Four slide directions (left, right, top, bottom)
- React Portal implementation for z-index management
- Mobile-friendly bottom sheets and side panels
- Integration with other components (SelectionPicker)
- Form handling within drawers
- Multiple drawer management with useDrawerManager
- Real-world property management use cases

**Key Features Shown**:
- Navigation menu (left slide)
- Property details panel (right slide)
- Notification center (top slide)
- Mobile filter interface (bottom slide)
- Share sheets and quick actions
- Complex form handling
- Z-index stacking demonstration

### 3. Box Component Examples (`/examples/box`)

**File**: `BoxExamples.tsx`

**What it demonstrates**:
- Flexbox and Grid layout systems
- Color palette and design tokens
- Interactive elements and hover states
- Responsive design patterns
- Animation and transition effects
- Form element styling
- Property listing card designs

**Key Features Shown**:
- Property card layouts with flexbox
- Grid-based gallery views
- Complex dashboard layouts
- Color system with brand colors
- Shadow effects and gradients
- Interactive buttons and cards
- Responsive navigation components
- Form elements with validation states

## Navigation and Routing

### Routes Structure
```
/examples/                    # Examples index page
/examples/selection-picker    # SelectionPicker examples
/examples/sliding-drawer      # SlidingDrawer examples
/examples/box                 # Box component examples
```

### Navigation Components
- **ExamplesLayout**: Provides consistent navigation and layout
- **Responsive Navigation**: Desktop header + mobile floating nav
- **Breadcrumb Navigation**: Clear indication of current example
- **Quick Links**: Easy access to main app sections

## Design System Integration

### Colors
All examples use the consistent color palette:
- **Primary Blue**: `#3182ce` - Main brand color
- **Success Green**: `#059669` - Success states, pricing
- **Warning Orange**: `#f59e0b` - Warnings, highlights
- **Error Red**: `#dc2626` - Errors, dangerous actions
- **Purple**: `#8b5cf6` - Secondary accent
- **Pink**: `#ec4899` - Tertiary accent

### Typography
- **Headings**: Bold, clear hierarchy
- **Body Text**: Readable, appropriate contrast
- **Labels**: Consistent sizing and weight

### Spacing
- Consistent padding and margin using rem units
- Responsive spacing that adapts to screen size
- Clear visual hierarchy through spacing

## Real-World Context

### Property Rental Focus
All examples are designed with property rental applications in mind:
- Property listings and management
- Guest and host interactions
- Booking and availability systems
- Reviews and ratings
- Location and amenity filtering

### Mobile-First Approach
- Touch-friendly interface elements
- Responsive layouts for all screen sizes
- Mobile-optimized drawers and sheets
- Gesture-friendly interactions

### Accessibility
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast ratios
- Focus management

## Usage Patterns

### Component Composition
Examples show how to:
- Compose multiple components together
- Pass data between components
- Handle state management
- Implement event handling

### Data Flow
- Props-based configuration
- Controlled component patterns
- Event callbacks and state updates
- Form data handling

### Performance Considerations
- Efficient rendering patterns
- Proper key usage in lists
- Optimized re-rendering
- Portal usage for overlays

## Development Guidelines

### Code Quality
- TypeScript throughout
- Consistent naming conventions
- Clear component interfaces
- Comprehensive error handling

### Testing Approach
- Component isolation
- User interaction testing
- Accessibility testing
- Cross-browser compatibility

### Maintenance
- Version control friendly
- Easy to extend and modify
- Clear documentation
- Consistent patterns

## Getting Started

1. **Navigate to Examples**: Visit `/examples` in your browser
2. **Explore Components**: Browse individual component examples
3. **Interactive Testing**: Try all interactive features
4. **Code Reference**: View source code for implementation details
5. **Copy Patterns**: Use examples as templates for your own implementations

## Integration with Main App

### Shared Components
Examples use the same components as the main application:
- Box component for layout and styling
- Consistent design system
- Shared utility functions
- Common type definitions

### Routing Integration
- Uses TanStack Router like main app
- Consistent URL patterns
- Proper navigation handling
- Back/forward browser support

### State Management
- Redux patterns where applicable
- Local state for component-specific data
- Proper state isolation
- Event handling patterns

## Best Practices Demonstrated

### Component Design
- Single responsibility principle
- Composable and reusable
- Configurable through props
- Consistent API patterns

### User Experience
- Smooth animations and transitions
- Immediate feedback for interactions
- Clear visual states
- Intuitive navigation

### Performance
- Efficient rendering
- Minimal re-renders
- Optimized bundle size
- Fast initial load

### Accessibility
- Semantic HTML structure
- Proper ARIA attributes
- Keyboard navigation
- Screen reader support

## Future Enhancements

### Planned Additions
- Animation library integration
- Advanced responsive patterns
- Enhanced accessibility features
- Performance optimization examples

### Community Contributions
- Example request system
- Community-contributed patterns
- Best practice sharing
- Code review process

---

*These examples serve as both documentation and reference implementation for the Wezo.ae component library. They demonstrate production-ready patterns that can be directly used in property rental applications.*