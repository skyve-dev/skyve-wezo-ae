# SlidingDrawer Component

A robust and reusable React component that creates a full-screen overlay sliding drawer, perfect for mobile-like user experiences. The component uses React Portal for proper z-index management and supports sliding from all four directions.

## Features

- ✅ **React Portal Integration**: Renders outside the main DOM tree to prevent z-index conflicts
- ✅ **Four Slide Directions**: Support for 'left', 'right', 'top', and 'bottom' slide-in animations
- ✅ **Smooth Animations**: CSS transitions with customizable duration and easing
- ✅ **Backdrop Management**: Semi-transparent backdrop with click-to-close functionality
- ✅ **Accessibility**: ARIA attributes, keyboard navigation (Escape key), and focus management
- ✅ **Customizable Styling**: Flexible width, height, colors, and z-index configuration
- ✅ **TypeScript Support**: Fully typed with comprehensive interface definitions
- ✅ **Body Scroll Lock**: Prevents background scrolling when drawer is open
- ✅ **Close Button**: Optional built-in or custom close button support

## Basic Usage

```tsx
import SlidingDrawer from './components/SlidingDrawer'
import { useState } from 'react'

function MyComponent() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsDrawerOpen(true)}>
        Open Drawer
      </button>

      <SlidingDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        side="right"
        showCloseButton
      >
        <div style={{ padding: '2rem' }}>
          <h2>Drawer Content</h2>
          <p>Your content goes here...</p>
        </div>
      </SlidingDrawer>
    </>
  )
}
```

## Props Reference

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Controlled prop that determines the drawer's visibility |
| `onClose` | `() => void` | Callback function executed when the drawer should be closed |
| `children` | `React.ReactNode` | Content to be rendered inside the drawer |
| `side` | `'left' \| 'right' \| 'top' \| 'bottom'` | Direction from which the drawer slides in |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `string` | `'400px'` (sides) / `'100%'` (top/bottom) | Width for left/right drawers |
| `height` | `string` | `'100%'` (sides) / `'400px'` (top/bottom) | Height for top/bottom drawers |
| `zIndex` | `number` | `9999` | Z-index for the drawer |
| `backdropColor` | `string` | `'rgba(0, 0, 0, 0.5)'` | Backdrop color |
| `backgroundColor` | `string` | `'white'` | Drawer background color |
| `animationDuration` | `number` | `300` | Animation duration in milliseconds |
| `disableBackdropClick` | `boolean` | `false` | Disable backdrop click to close |
| `disableEscapeKey` | `boolean` | `false` | Disable escape key to close |
| `className` | `string` | - | Custom class name for drawer content |
| `contentStyles` | `React.CSSProperties` | `{}` | Custom styles for drawer content |
| `showCloseButton` | `boolean` | `false` | Show built-in close button |
| `closeButton` | `React.ReactNode` | - | Custom close button component |
| `portalId` | `string` | `'drawer-root'` | Portal container ID |

## Portal Setup

The component automatically creates a portal container if it doesn't exist. However, you can pre-create it in your HTML:

```html
<!-- In your index.html -->
<body>
  <div id="root"></div>
  <div id="drawer-root"></div> <!-- Portal container -->
</body>
```

## Advanced Examples

### Mobile-Style Bottom Sheet

```tsx
<SlidingDrawer
  isOpen={isOpen}
  onClose={onClose}
  side="bottom"
  height="60vh"
  showCloseButton
  animationDuration={250}
>
  <SelectionPicker
    data={options}
    idAccessor={(item) => item.id}
    value={selectedValues}
    onChange={setSelectedValues}
    isMultiSelect={true}
  />
</SlidingDrawer>
```

### Navigation Sidebar

```tsx
<SlidingDrawer
  isOpen={isMenuOpen}
  onClose={() => setIsMenuOpen(false)}
  side="left"
  width="280px"
  backgroundColor="#1f2937"
>
  <NavigationMenu onItemClick={() => setIsMenuOpen(false)} />
</SlidingDrawer>
```

### Form Modal from Right

```tsx
<SlidingDrawer
  isOpen={isFormOpen}
  onClose={() => setIsFormOpen(false)}
  side="right"
  width="500px"
  showCloseButton
  disableBackdropClick
>
  <ContactForm onSubmit={handleSubmit} />
</SlidingDrawer>
```

### Notification Bar from Top

```tsx
<SlidingDrawer
  isOpen={showNotification}
  onClose={() => setShowNotification(false)}
  side="top"
  height="auto"
  backgroundColor="#fef3c7"
  backdropColor="transparent"
  disableBackdropClick
>
  <NotificationBanner />
</SlidingDrawer>
```

## Integration with useDrawerManager Hook

For managing multiple drawers with proper z-index stacking:

```tsx
import { useDrawerManager } from '../hooks/useDrawerManager'

function MultiDrawerExample() {
  const drawerManager = useDrawerManager()

  return (
    <>
      <button onClick={() => drawerManager.openDrawer('menu')}>
        Open Menu
      </button>
      <button onClick={() => drawerManager.openDrawer('filters')}>
        Open Filters
      </button>

      <SlidingDrawer
        isOpen={drawerManager.isDrawerOpen('menu')}
        onClose={() => drawerManager.closeDrawer('menu')}
        side="left"
        zIndex={drawerManager.getDrawerZIndex('menu')}
      >
        <MenuContent />
      </SlidingDrawer>

      <SlidingDrawer
        isOpen={drawerManager.isDrawerOpen('filters')}
        onClose={() => drawerManager.closeDrawer('filters')}
        side="bottom"
        zIndex={drawerManager.getDrawerZIndex('filters')}
      >
        <FilterContent />
      </SlidingDrawer>
    </>
  )
}
```

## Accessibility Features

The SlidingDrawer component includes several accessibility features:

- **ARIA Attributes**: Uses `role="dialog"` and `aria-modal="true"`
- **Focus Management**: Focuses the drawer when opened and restores focus when closed
- **Keyboard Navigation**: Escape key closes the drawer (unless disabled)
- **Screen Reader Support**: Proper labeling and structure for assistive technologies

## Styling and Customization

### Custom Close Button

```tsx
const customCloseButton = (
  <button 
    onClick={onClose}
    style={{
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer'
    }}
  >
    ✕
  </button>
)

<SlidingDrawer
  isOpen={isOpen}
  onClose={onClose}
  side="right"
  closeButton={customCloseButton}
>
  <Content />
</SlidingDrawer>
```

### Custom Styling

```tsx
<SlidingDrawer
  isOpen={isOpen}
  onClose={onClose}
  side="right"
  contentStyles={{
    borderRadius: '1rem 0 0 1rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  }}
  className="custom-drawer"
>
  <Content />
</SlidingDrawer>
```

## Performance Considerations

- The component uses `React.memo` internally for optimal re-rendering
- Animations are hardware-accelerated using CSS transforms
- Portal rendering prevents unnecessary re-renders of parent components
- Body scroll lock is applied/removed efficiently

## Browser Support

- Modern browsers with CSS transform and transition support
- Mobile browsers (iOS Safari, Android Chrome)
- Desktop browsers (Chrome, Firefox, Safari, Edge)

## Common Use Cases

1. **Mobile Navigation Menus**: Side sliding navigation for mobile responsive design
2. **Filter Panels**: Bottom sheets for filtering and selection on mobile
3. **Form Modals**: Side panels for detailed forms and data entry
4. **Settings Panels**: Right-side configuration and preference panels
5. **Notification Bars**: Top sliding notifications and alerts
6. **Shopping Carts**: Side panels for e-commerce cart management

## Integration with Property Forms

The SlidingDrawer pairs excellently with the SelectionPicker component for mobile-friendly property filtering interfaces. See `MobilePropertyFilters.tsx` for a complete implementation example.