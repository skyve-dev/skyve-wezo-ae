# SlidingDrawer Component

The SlidingDrawer component is a robust sliding drawer implementation designed for the Wezo.ae property rental platform. It provides smooth animations, proper layering through React Portals, accessibility features, and multi-directional sliding support for mobile-first user interfaces.

## Overview

The SlidingDrawer component creates an overlay interface that slides in from any side of the screen. It uses React Portals for proper z-index management, includes sophisticated animation handling, prevents body scroll during interaction, and maintains focus management for accessibility compliance.

## Props Interface

```typescript
interface SlidingDrawerProps {
    // Core functionality
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    side: 'left' | 'right' | 'top' | 'bottom';
    
    // Dimensions
    width?: string;
    height?: string;
    
    // Visual styling
    zIndex?: number;
    backdropColor?: string;
    backgroundColor?: string;
    animationDuration?: number;
    
    // Interaction behavior
    disableBackdropClick?: boolean;
    disableEscapeKey?: boolean;
    
    // Customization
    className?: string;
    contentStyles?: React.CSSProperties;
    showCloseButton?: boolean;
    closeButton?: React.ReactNode;
    portalId?: string;
}
```

## Key Features

### 🎭 React Portal Integration
- **Proper Layering**: Uses React Portal for correct z-index stacking
- **Portal Management**: Sophisticated PortalManager handles multiple drawers
- **Body Scroll Control**: Disables scrolling when drawer is active
- **State Synchronization**: Coordinates portal activation with drawer animations

### 🎨 Multi-Directional Sliding
- **Four Directions**: Supports left, right, top, and bottom sliding
- **Smart Sizing**: Automatic dimension calculation based on slide direction
- **Responsive Dimensions**: Customizable width/height per drawer instance
- **Smooth Animations**: CSS transforms with easing functions

### ⚡ Animation System
- **Coordinated Timing**: Portal activation → Animation → Portal cleanup
- **Configurable Duration**: Adjustable animation timing (default: 300ms)
- **Smooth Transitions**: Cubic-bezier easing for professional feel
- **State Management**: Proper animation state handling prevents glitches

### 🎯 Accessibility Features
- **Focus Management**: Automatic focus capture and restoration
- **Keyboard Navigation**: Escape key support (can be disabled)
- **ARIA Attributes**: Proper role="dialog" and aria-modal="true"
- **Screen Reader Support**: Semantic HTML structure and labels

### 🚫 Interaction Control
- **Backdrop Click**: Close on backdrop click (can be disabled)
- **Escape Key**: Close on Escape press (can be disabled)
- **Pointer Events**: Proper event handling for drawer vs backdrop
- **Body Scroll**: Prevents background scrolling during interaction

### 💅 Styling Flexibility
- **Background Colors**: Customizable drawer and backdrop colors
- **Custom Styling**: Additional CSS classes and inline styles
- **Close Button**: Optional built-in close button with custom options
- **Z-Index Control**: Configurable layering for complex layouts

## Default Configurations

### Dimension Defaults
```typescript
// Horizontal drawers (left/right)
const horizontalDefaults = {
  width: '25rem',    // 400px
  height: '100%'     // Full viewport height
}

// Vertical drawers (top/bottom)  
const verticalDefaults = {
  width: '100%',     // Full viewport width
  height: '25rem'    // 400px
}
```

### Animation Settings
```typescript
const animationDefaults = {
  duration: 300,                                    // milliseconds
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',         // Material Design easing
  backdropColor: 'rgba(0, 0, 0, 0.5)',           // Semi-transparent overlay
  backgroundColor: 'white'                         // Drawer background
}
```

## Usage Examples

### Basic Property Filter Drawer

```tsx
import SlidingDrawer from '@/components/base/SlidingDrawer'
import { FaFilter, FaHome, FaMapMarkerAlt } from 'react-icons/fa'

function PropertyListWithFilter() {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    priceRange: '',
    propertyType: '',
    amenities: []
  })

  return (
    <>
      {/* Main Content */}
      <Box padding="1rem">
        <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="2rem">
          <Box fontSize="1.5rem" fontWeight="600">
            Dubai Properties
          </Box>
          <Box
            as="button"
            display="flex"
            alignItems="center"
            gap="0.5rem"
            padding="0.75rem 1rem"
            backgroundColor="#3b82f6"
            color="white"
            border="none"
            borderRadius="0.5rem"
            cursor="pointer"
            onClick={() => setIsFilterOpen(true)}
          >
            <FaFilter />
            Filters
          </Box>
        </Box>
        
        {/* Property listings would go here */}
      </Box>

      {/* Filter Drawer */}
      <SlidingDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        side="left"
        width="320px"
        showCloseButton={true}
      >
        <Box padding="1.5rem" display="flex" flexDirection="column" gap="1.5rem">
          <Box fontSize="1.25rem" fontWeight="600" marginBottom="1rem">
            Filter Properties
          </Box>
          
          {/* Price Range Filter */}
          <Box>
            <Box fontSize="1rem" fontWeight="500" marginBottom="0.5rem">
              Price Range (AED/night)
            </Box>
            <Box display="flex" gap="0.5rem">
              <input
                type="number"
                placeholder="Min price"
                style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', flex: 1 }}
              />
              <input
                type="number"
                placeholder="Max price"
                style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', flex: 1 }}
              />
            </Box>
          </Box>

          {/* Property Type Filter */}
          <Box>
            <Box fontSize="1rem" fontWeight="500" marginBottom="0.5rem">
              Property Type
            </Box>
            <Box display="flex" flexDirection="column" gap="0.5rem">
              {['Villa', 'Apartment', 'Hotel', 'Resort'].map(type => (
                <Box key={type} display="flex" alignItems="center" gap="0.5rem">
                  <input type="checkbox" />
                  <Box>{type}</Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Apply Filters Button */}
          <Box
            as="button"
            padding="0.75rem"
            backgroundColor="#059669"
            color="white"
            border="none"
            borderRadius="0.5rem"
            fontSize="1rem"
            fontWeight="500"
            cursor="pointer"
            marginTop="1rem"
            onClick={() => {
              // Apply filters logic
              setIsFilterOpen(false)
            }}
          >
            Apply Filters
          </Box>
        </Box>
      </SlidingDrawer>
    </>
  )
}
```

### Property Booking Details Drawer

```tsx
function PropertyBookingDrawer() {
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState(null)
  
  const openBookingDrawer = (property) => {
    setSelectedProperty(property)
    setIsBookingOpen(true)
  }

  return (
    <SlidingDrawer
      isOpen={isBookingOpen}
      onClose={() => setIsBookingOpen(false)}
      side="right"
      width="400px"
      showCloseButton={true}
      backgroundColor="#f9fafb"
    >
      {selectedProperty && (
        <Box padding="1.5rem" display="flex" flexDirection="column" gap="1.5rem">
          {/* Property Header */}
          <Box>
            <Box 
              fontSize="1.5rem" 
              fontWeight="700" 
              color="#111827" 
              marginBottom="0.5rem"
            >
              {selectedProperty.name}
            </Box>
            <Box display="flex" alignItems="center" gap="0.25rem" color="#6b7280">
              <FaMapMarkerAlt size="0.875rem" />
              <Box fontSize="0.875rem">{selectedProperty.location}</Box>
            </Box>
          </Box>

          {/* Property Image */}
          <Box
            width="100%"
            height="200px"
            backgroundColor="#e5e7eb"
            borderRadius="0.5rem"
            backgroundImage={`url(${selectedProperty.image})`}
            backgroundSize="cover"
            backgroundPosition="center"
          />

          {/* Booking Details */}
          <Box 
            padding="1rem" 
            backgroundColor="white" 
            borderRadius="0.5rem"
            border="1px solid #e5e7eb"
          >
            <Box fontSize="1.125rem" fontWeight="600" marginBottom="1rem">
              Booking Details
            </Box>
            
            <Box display="flex" justifyContent="space-between" marginBottom="0.5rem">
              <Box color="#6b7280">Check-in:</Box>
              <Box fontWeight="500">Mar 15, 2024</Box>
            </Box>
            
            <Box display="flex" justifyContent="space-between" marginBottom="0.5rem">
              <Box color="#6b7280">Check-out:</Box>
              <Box fontWeight="500">Mar 18, 2024</Box>
            </Box>
            
            <Box display="flex" justifyContent="space-between" marginBottom="0.5rem">
              <Box color="#6b7280">Guests:</Box>
              <Box fontWeight="500">4 adults</Box>
            </Box>
            
            <Box 
              borderTop="1px solid #e5e7eb" 
              paddingTop="0.75rem" 
              marginTop="0.75rem"
            >
              <Box display="flex" justifyContent="space-between" fontSize="1.125rem" fontWeight="600">
                <Box>Total (3 nights):</Box>
                <Box color="#059669">AED 2,100</Box>
              </Box>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box display="flex" flexDirection="column" gap="0.75rem" marginTop="auto">
            <Box
              as="button"
              padding="0.75rem"
              backgroundColor="#3b82f6"
              color="white"
              border="none"
              borderRadius="0.5rem"
              fontSize="1rem"
              fontWeight="500"
              cursor="pointer"
            >
              Book Now
            </Box>
            <Box
              as="button"
              padding="0.75rem"
              backgroundColor="transparent"
              color="#6b7280"
              border="1px solid #d1d5db"
              borderRadius="0.5rem"
              fontSize="1rem"
              cursor="pointer"
            >
              Save to Wishlist
            </Box>
          </Box>
        </Box>
      )}
    </SlidingDrawer>
  )
}
```

### Mobile Navigation Menu

```tsx
import { FaHome, FaSearch, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa'

function MobileNavigationDrawer() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigationItems = [
    { icon: FaHome, label: 'Home', path: '/' },
    { icon: FaSearch, label: 'Search Properties', path: '/search' },
    { icon: FaUser, label: 'Profile', path: '/profile' },
    { icon: FaCog, label: 'Settings', path: '/settings' }
  ]

  return (
    <SlidingDrawer
      isOpen={isMobileMenuOpen}
      onClose={() => setIsMobileMenuOpen(false)}
      side="left"
      width="280px"
      backgroundColor="white"
      animationDuration={250}
    >
      <Box display="flex" flexDirection="column" height="100%">
        {/* Header */}
        <Box 
          padding="1.5rem" 
          backgroundColor="#3b82f6" 
          color="white"
        >
          <Box fontSize="1.25rem" fontWeight="600">
            Wezo.ae
          </Box>
          <Box fontSize="0.875rem" opacity="0.9">
            Property Rentals
          </Box>
        </Box>

        {/* Navigation Items */}
        <Box flex="1" padding="1rem">
          {navigationItems.map((item) => {
            const IconComponent = item.icon
            return (
              <Box
                key={item.label}
                display="flex"
                alignItems="center"
                gap="0.75rem"
                padding="0.75rem"
                borderRadius="0.5rem"
                cursor="pointer"
                whileHover={{ backgroundColor: '#f3f4f6' }}
                onClick={() => {
                  // Navigate to path
                  
                  setIsMobileMenuOpen(false)
                }}
              >
                <IconComponent size="1.25rem" color="#6b7280" />
                <Box fontSize="1rem" color="#111827">
                  {item.label}
                </Box>
              </Box>
            )
          })}
        </Box>

        {/* Footer */}
        <Box 
          padding="1rem" 
          borderTop="1px solid #e5e7eb"
        >
          <Box
            display="flex"
            alignItems="center"
            gap="0.75rem"
            padding="0.75rem"
            borderRadius="0.5rem"
            cursor="pointer"
            whileHover={{ backgroundColor: '#fef2f2' }}
            onClick={() => {
              // Sign out logic
              setIsMobileMenuOpen(false)
            }}
          >
            <FaSignOutAlt size="1.25rem" color="#dc2626" />
            <Box fontSize="1rem" color="#dc2626">
              Sign Out
            </Box>
          </Box>
        </Box>
      </Box>
    </SlidingDrawer>
  )
}
```

### Property Image Gallery

```tsx
function PropertyImageGallery() {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  
  const propertyImages = [
    { url: '/images/property1.jpg', caption: 'Living Room' },
    { url: '/images/property2.jpg', caption: 'Master Bedroom' },
    { url: '/images/property3.jpg', caption: 'Kitchen' },
    { url: '/images/property4.jpg', caption: 'Pool Area' }
  ]

  return (
    <SlidingDrawer
      isOpen={isGalleryOpen}
      onClose={() => setIsGalleryOpen(false)}
      side="bottom"
      height="80vh"
      backgroundColor="#000000"
      backdropColor="rgba(0, 0, 0, 0.9)"
      showCloseButton={true}
      closeButton={
        <Box
          as="button"
          position="absolute"
          top="1rem"
          right="1rem"
          padding="0.5rem"
          backgroundColor="rgba(255, 255, 255, 0.1)"
          color="white"
          border="none"
          borderRadius="50%"
          cursor="pointer"
          onClick={() => setIsGalleryOpen(false)}
        >
          ✕
        </Box>
      }
    >
      <Box 
        display="flex" 
        flexDirection="column" 
        height="100%" 
        color="white"
      >
        {/* Main Image Display */}
        <Box 
          flex="1" 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
          position="relative"
        >
          <Box
            width="90%"
            height="90%"
            backgroundImage={`url(${propertyImages[selectedImageIndex].url})`}
            backgroundSize="contain"
            backgroundPosition="center"
            backgroundRepeat="no-repeat"
          />
          
          {/* Navigation Arrows */}
          <Box
            as="button"
            position="absolute"
            left="2rem"
            padding="1rem"
            backgroundColor="rgba(255, 255, 255, 0.2)"
            color="white"
            border="none"
            borderRadius="50%"
            cursor="pointer"
            onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
            disabled={selectedImageIndex === 0}
          >
            ←
          </Box>
          
          <Box
            as="button"
            position="absolute"
            right="2rem"
            padding="1rem"
            backgroundColor="rgba(255, 255, 255, 0.2)"
            color="white"
            border="none"
            borderRadius="50%"
            cursor="pointer"
            onClick={() => setSelectedImageIndex(Math.min(propertyImages.length - 1, selectedImageIndex + 1))}
            disabled={selectedImageIndex === propertyImages.length - 1}
          >
            →
          </Box>
        </Box>

        {/* Thumbnail Strip */}
        <Box 
          padding="1rem" 
          backgroundColor="rgba(0, 0, 0, 0.5)"
        >
          <Box display="flex" gap="0.5rem" justifyContent="center" overflowX="auto">
            {propertyImages.map((image, index) => (
              <Box
                key={index}
                width="80px"
                height="60px"
                backgroundImage={`url(${image.url})`}
                backgroundSize="cover"
                backgroundPosition="center"
                borderRadius="0.25rem"
                cursor="pointer"
                border={selectedImageIndex === index ? '2px solid #3b82f6' : '2px solid transparent'}
                opacity={selectedImageIndex === index ? 1 : 0.7}
                onClick={() => setSelectedImageIndex(index)}
              />
            ))}
          </Box>
          
          <Box 
            textAlign="center" 
            marginTop="0.5rem" 
            fontSize="0.875rem" 
            color="rgba(255, 255, 255, 0.8)"
          >
            {propertyImages[selectedImageIndex].caption} ({selectedImageIndex + 1} of {propertyImages.length})
          </Box>
        </Box>
      </Box>
    </SlidingDrawer>
  )
}
```

## Advanced Configuration

### Custom Portal Management

```tsx
// Multiple drawers with different portal containers
function MultiDrawerApp() {
  return (
    <>
      {/* Main navigation drawer */}
      <SlidingDrawer
        isOpen={navDrawerOpen}
        onClose={() => setNavDrawerOpen(false)}
        side="left"
        portalId="navigation-portal"
        zIndex={9999}
      >
        <NavigationContent />
      </SlidingDrawer>

      {/* Settings drawer (higher z-index) */}
      <SlidingDrawer
        isOpen={settingsDrawerOpen}
        onClose={() => setSettingsDrawerOpen(false)}
        side="right"
        portalId="settings-portal"
        zIndex={10000}
      >
        <SettingsContent />
      </SlidingDrawer>
    </>
  )
}
```

### Custom Styling and Animation

```tsx
function StyledDrawer() {
  return (
    <SlidingDrawer
      isOpen={isOpen}
      onClose={onClose}
      side="right"
      width="450px"
      animationDuration={400}
      backdropColor="rgba(59, 130, 246, 0.1)"
      backgroundColor="#f8fafc"
      contentStyles={{
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        borderLeft: '3px solid #3b82f6'
      }}
      className="custom-drawer"
      disableBackdropClick={true}
      showCloseButton={true}
      closeButton={
        <CustomCloseButton onClose={onClose} />
      }
    >
      <CustomDrawerContent />
    </SlidingDrawer>
  )
}
```

## Responsive Design Integration

### Mobile-First Approach

```tsx
function ResponsivePropertyDrawer() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <SlidingDrawer
      isOpen={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      side={isMobile ? 'bottom' : 'right'}
      width={isMobile ? '100%' : '400px'}
      height={isMobile ? '70vh' : '100%'}
      animationDuration={isMobile ? 250 : 300}
    >
      <PropertyDetailsContent />
    </SlidingDrawer>
  )
}
```

### Breakpoint-Aware Configuration

```tsx
function BreakpointAwareDrawer() {
  const getDrawerConfig = () => {
    const width = window.innerWidth
    
    if (width >= 1024) {
      // Desktop: right drawer
      return { side: 'right', width: '500px', height: '100%' }
    } else if (width >= 768) {
      // Tablet: right drawer, narrower
      return { side: 'right', width: '400px', height: '100%' }
    } else {
      // Mobile: bottom drawer
      return { side: 'bottom', width: '100%', height: '80vh' }
    }
  }
  
  const config = getDrawerConfig()
  
  return (
    <SlidingDrawer
      isOpen={isOpen}
      onClose={onClose}
      {...config}
    >
      <ResponsiveContent />
    </SlidingDrawer>
  )
}
```

## Accessibility Best Practices

### Focus Management

```tsx
function AccessibleDrawer() {
  const drawerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      // Focus first interactive element
      const firstFocusable = drawerRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement
      
      if (firstFocusable) {
        firstFocusable.focus()
      }
    }
  }, [isOpen])

  return (
    <SlidingDrawer
      isOpen={isOpen}
      onClose={onClose}
      side="right"
      contentStyles={{ padding: '0' }}
    >
      <Box ref={drawerRef} padding="1.5rem" tabIndex={-1}>
        <Box fontSize="1.25rem" fontWeight="600" marginBottom="1rem" tabIndex={0}>
          Drawer Title
        </Box>
        <button>First Interactive Element</button>
        {/* More content */}
      </Box>
    </SlidingDrawer>
  )
}
```

### Screen Reader Support

```tsx
function ScreenReaderFriendlyDrawer() {
  const [drawerTitle] = useState("Property Booking Details")
  
  return (
    <SlidingDrawer
      isOpen={isOpen}
      onClose={onClose}
      side="right"
      showCloseButton={true}
      closeButton={
        <button
          onClick={onClose}
          aria-label={`Close ${drawerTitle} drawer`}
          className="sr-close-button"
        >
          ✕
        </button>
      }
    >
      <Box
        role="document"
        aria-labelledby="drawer-title"
        padding="1.5rem"
      >
        <Box 
          id="drawer-title"
          fontSize="1.25rem" 
          fontWeight="600" 
          marginBottom="1rem"
        >
          {drawerTitle}
        </Box>
        
        {/* Drawer content with semantic HTML */}
        <main>
          <section aria-labelledby="booking-summary">
            <h2 id="booking-summary" className="visually-hidden">
              Booking Summary
            </h2>
            {/* Booking details */}
          </section>
          
          <section aria-labelledby="payment-info">
            <h2 id="payment-info" className="visually-hidden">
              Payment Information
            </h2>
            {/* Payment form */}
          </section>
        </main>
      </Box>
    </SlidingDrawer>
  )
}
```

## Integration with Property Rental Features

### Property Comparison Drawer
```tsx
function PropertyComparisonDrawer() {
  const [selectedProperties, setSelectedProperties] = useState([])

  return (
    <SlidingDrawer
      isOpen={comparisonOpen}
      onClose={() => setComparisonOpen(false)}
      side="bottom"
      height="60vh"
      backgroundColor="white"
    >
      <Box padding="1.5rem">
        <Box display="flex" justifyContent="between" alignItems="center" marginBottom="1.5rem">
          <Box fontSize="1.25rem" fontWeight="600">
            Compare Properties ({selectedProperties.length})
          </Box>
          <button onClick={() => setSelectedProperties([])}>
            Clear All
          </button>
        </Box>
        
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem" overflowX="auto">
          {selectedProperties.map(property => (
            <PropertyComparisonCard key={property.id} property={property} />
          ))}
        </Box>
      </Box>
    </SlidingDrawer>
  )
}
```

### Guest Communication Center
```tsx
function GuestCommunicationDrawer() {
  return (
    <SlidingDrawer
      isOpen={chatOpen}
      onClose={() => setChatOpen(false)}
      side="right"
      width="400px"
      backgroundColor="#f9fafb"
    >
      <Box display="flex" flexDirection="column" height="100%">
        <Box padding="1rem" backgroundColor="white" borderBottom="1px solid #e5e7eb">
          <Box fontSize="1.125rem" fontWeight="600">Host Communication</Box>
          <Box fontSize="0.875rem" color="#6b7280">Villa Marina - Dubai</Box>
        </Box>
        
        <Box flex="1" padding="1rem" overflowY="auto">
          {/* Chat messages */}
        </Box>
        
        <Box padding="1rem" backgroundColor="white" borderTop="1px solid #e5e7eb">
          <Box display="flex" gap="0.5rem">
            <input 
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem'
              }}
            />
            <button
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem'
              }}
            >
              Send
            </button>
          </Box>
        </Box>
      </Box>
    </SlidingDrawer>
  )
}
```

## Performance Considerations

### Portal Management
The SlidingDrawer uses a sophisticated PortalManager class to handle multiple concurrent drawers:

```typescript
// Automatic portal creation and cleanup
// Coordinated z-index management  
// Body scroll state management
// Animation timing synchronization
```

### Memory Optimization
- **Lazy Rendering**: Drawer content only renders when needed
- **Event Cleanup**: Automatic removal of event listeners
- **Portal Cleanup**: Proper portal container management
- **Animation State**: Efficient state transitions

## Related Components

- **Box**: Provides the underlying layout capabilities for drawer content
- **DatePicker**: Often used within drawers for booking date selection  
- **SelectionPicker**: Common drawer content for amenity/preference selection
- **Input**: Frequently used in drawer forms and search interfaces

The SlidingDrawer component provides the foundation for mobile-first interfaces in the property rental platform, enabling smooth, accessible overlay experiences across all device types.