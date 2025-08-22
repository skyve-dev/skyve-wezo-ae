# Button Component

The Button component is a comprehensive, accessible button implementation designed for the Wezo.ae property rental platform. It provides consistent styling, multiple variants, loading states, and can render as either a button or link while maintaining the same visual appearance and behavior.

## Overview

The Button component serves as the primary interactive element for user actions throughout the property rental platform. It offers two main variants (promoted/primary and normal/secondary), three sizes that align with Input component heights, loading states, icon support, and the flexibility to render as either a button or anchor tag.

## Props Interface

```typescript
interface ButtonProps extends Omit<BoxProps<'button'>, 'onClick' | 'as' | 'size'> {
  // Core functionality
  label: string;                                    // Text displayed inside the button
  icon?: React.ReactNode;                          // Optional icon element
  onClick?: (event: React.MouseEvent) => void;     // Click handler function
  
  // Visual variants
  variant?: 'promoted' | 'normal';                 // Style variant (default: 'normal')
  size?: 'small' | 'medium' | 'large';            // Size variant (default: 'medium')
  
  // States  
  disabled?: boolean;                              // Disabled state (default: false)
  loading?: boolean;                               // Loading state (default: false)
  fullWidth?: boolean;                             // Full width behavior (default: false)
  
  // Link behavior
  href?: string;                                   // URL for link behavior
  target?: string;                                 // Link target attribute
  rel?: string;                                    // Link rel attribute
  
  // Form functionality
  type?: 'button' | 'submit' | 'reset';           // Button type (default: 'submit')
  
  // Additional styling
  className?: string;                              // Additional CSS classes
}
```

## Key Features

### 🎨 Visual Variants
- **Promoted** (`promoted`): Primary action button with blue background and white text
- **Normal** (`normal`): Secondary action button with white background and border
- **Consistent Heights**: All sizes align perfectly with Input component heights
- **Hover Effects**: Subtle elevation and color changes on hover

### 📏 Size Options  
- **Small**: 36px height - Compact interfaces and secondary actions
- **Medium**: 44px height - Standard form buttons and primary actions (default)
- **Large**: 52px height - Prominent call-to-action buttons and hero sections

### ⚡ Interactive States
- **Loading State**: Animated spinner replaces content when `loading={true}`
- **Disabled State**: Reduced opacity and disabled cursor when `disabled={true}`  
- **Hover Effects**: Smooth transitions with elevation and color changes
- **Active States**: Visual feedback during button press

### 🔗 Dual Rendering
- **Button Mode**: Standard `<button>` element for form submissions and actions
- **Link Mode**: Renders as `<a>` tag when `href` prop is provided
- **Consistent Styling**: Same visual appearance regardless of underlying element

### ♿ Accessibility Features
- **ARIA Attributes**: Proper `aria-disabled`, `aria-busy`, and `role` attributes
- **Keyboard Navigation**: Full keyboard support with proper tab order
- **Screen Reader Support**: Semantic HTML and descriptive labels
- **Focus Management**: Clear focus indicators and logical focus flow

## Size Configuration

```typescript
const sizeConfig = {
  small: {
    height: '36px',        // Matches Input small size
    fontSize: '0.875rem',  // 14px
    padding: '8px 12px',
    iconSize: '0.875rem',
    gap: '0.375rem'        // 6px between icon and text
  },
  medium: {
    height: '44px',        // Matches Input medium size  
    fontSize: '1rem',      // 16px
    padding: '10px 16px',
    iconSize: '1rem',
    gap: '0.5rem'          // 8px between icon and text
  },
  large: {
    height: '52px',        // Matches Input large size
    fontSize: '1.125rem',  // 18px  
    padding: '12px 20px',
    iconSize: '1.125rem',
    gap: '0.625rem'        // 10px between icon and text
  }
}
```

## Usage Examples

### Basic Button Usage

```tsx
import Button from '@/components/base/Button'
import { FaSave, FaPlus, FaTrash } from 'react-icons/fa'

function BasicButtons() {
  return (
    <Box display="flex" gap="1rem" alignItems="center">
      {/* Primary action button */}
      <Button
        label="Save Property"
        variant="promoted"
        icon={<FaSave />}
        onClick={() => handleSave()}
      />
      
      {/* Secondary action button */}
      <Button
        label="Cancel"
        variant="normal"
        onClick={() => handleCancel()}
      />
      
      {/* Icon-only style */}
      <Button
        label="Add"
        variant="promoted"
        size="small"
        icon={<FaPlus />}
        onClick={() => handleAdd()}
      />
    </Box>
  )
}
```

### Different Sizes and Variants

```tsx
function SizeAndVariantShowcase() {
  return (
    <Box display="flex" flexDirection="column" gap="2rem">
      {/* Size variations */}
      <Box>
        <Box fontSize="1.125rem" fontWeight="600" marginBottom="1rem">
          Size Variations
        </Box>
        <Box display="flex" gap="1rem" alignItems="center">
          <Button label="Small" size="small" variant="promoted" />
          <Button label="Medium" size="medium" variant="promoted" />
          <Button label="Large" size="large" variant="promoted" />
        </Box>
      </Box>
      
      {/* Variant comparison */}
      <Box>
        <Box fontSize="1.125rem" fontWeight="600" marginBottom="1rem">
          Variant Comparison
        </Box>
        <Box display="flex" gap="1rem" alignItems="center">
          <Button label="Promoted" variant="promoted" />
          <Button label="Normal" variant="normal" />
        </Box>
      </Box>
    </Box>
  )
}
```

### Property Booking Actions

```tsx
function PropertyBookingActions() {
  const [isLoading, setIsLoading] = useState(false)
  
  const handleBooking = async () => {
    setIsLoading(true)
    try {
      await bookProperty()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box display="flex" flexDirection="column" gap="1rem">
      {/* Primary booking action */}
      <Button
        label="Book This Villa"
        variant="promoted"
        size="large"
        fullWidth
        loading={isLoading}
        onClick={handleBooking}
        icon={<FaCalendarCheck />}
      />
      
      {/* Secondary actions */}
      <Box display="flex" gap="1rem">
        <Button
          label="Save to Wishlist"
          variant="normal"
          icon={<FaHeart />}
          onClick={handleWishlist}
          fullWidth
        />
        <Button
          label="Share Property"
          variant="normal"
          icon={<FaShare />}
          onClick={handleShare}
          fullWidth
        />
      </Box>
    </Box>
  )
}
```

### Form Integration

```tsx
function PropertyRegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await submitProperty(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box as="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap="1.5rem">
      {/* Form fields would go here */}
      
      {/* Form actions */}
      <Box display="flex" gap="1rem" justifyContent="flex-end">
        <Button
          label="Cancel"
          variant="normal"
          type="button"
          onClick={() => router.back()}
        />
        <Button
          label="Register Property"
          variant="promoted"
          type="submit"
          loading={isSubmitting}
          icon={<FaHome />}
        />
      </Box>
    </Box>
  )
}
```

### Link Button Usage

```tsx
function NavigationButtons() {
  return (
    <Box display="flex" gap="1rem" alignItems="center">
      {/* External link */}
      <Button
        label="View on Google Maps"
        variant="normal"
        href="https://maps.google.com/property-location"
        target="_blank"
        rel="noopener noreferrer"
        icon={<FaExternalLinkAlt />}
      />
      
      {/* Internal navigation */}
      <Button
        label="Browse All Properties"
        variant="promoted"
        href="/properties"
        icon={<FaSearch />}
      />
      
      {/* Contact link */}
      <Button
        label="Call Host"
        variant="normal"
        href="tel:+971501234567"
        icon={<FaPhone />}
      />
    </Box>
  )
}
```

### Loading and Disabled States

```tsx
function StatesDemonstration() {
  const [isProcessing, setIsProcessing] = useState(false)
  
  return (
    <Box display="flex" flexDirection="column" gap="2rem">
      {/* Loading states */}
      <Box>
        <Box fontSize="1.125rem" fontWeight="600" marginBottom="1rem">
          Loading States
        </Box>
        <Box display="flex" gap="1rem" alignItems="center">
          <Button
            label="Processing Payment"
            variant="promoted"
            loading={true}
          />
          <Button
            label="Uploading Photos"
            variant="normal"
            loading={true}
            icon={<FaUpload />}
          />
        </Box>
      </Box>
      
      {/* Disabled states */}
      <Box>
        <Box fontSize="1.125rem" fontWeight="600" marginBottom="1rem">
          Disabled States
        </Box>
        <Box display="flex" gap="1rem" alignItems="center">
          <Button
            label="Unavailable Dates"
            variant="promoted"
            disabled={true}
            icon={<FaCalendarTimes />}
          />
          <Button
            label="Out of Stock"
            variant="normal"
            disabled={true}
          />
        </Box>
      </Box>
    </Box>
  )
}
```

### Full Width and Responsive Layout

```tsx
function ResponsiveButtonLayout() {
  return (
    <Box display="flex" flexDirection="column" gap="2rem">
      {/* Mobile-first full-width buttons */}
      <Box>
        <Box fontSize="1.125rem" fontWeight="600" marginBottom="1rem">
          Mobile Layout
        </Box>
        <Box display="flex" flexDirection="column" gap="0.75rem">
          <Button
            label="Book Now - AED 750/night"
            variant="promoted"
            size="large"
            fullWidth
            icon={<FaCalendarCheck />}
          />
          <Button
            label="Request Information"
            variant="normal"
            fullWidth
            icon={<FaEnvelope />}
          />
        </Box>
      </Box>
      
      {/* Desktop side-by-side layout */}
      <Box>
        <Box fontSize="1.125rem" fontWeight="600" marginBottom="1rem">
          Desktop Layout
        </Box>
        <Box 
          display="grid" 
          gridTemplateColumns="1fr 1fr" 
          gap="1rem"
          gridTemplateColumnsMd="auto auto"
          justifyContentMd="flex-start"
        >
          <Button
            label="Book Villa"
            variant="promoted"
            size="large"
            icon={<FaHome />}
          />
          <Button
            label="Contact Host"
            variant="normal"
            size="large"
            icon={<FaPhone />}
          />
        </Box>
      </Box>
    </Box>
  )
}
```

## Styling and Theming

### Variant Styles

```typescript
// Promoted variant (primary)
const promotedStyles = {
  backgroundColor: '#3b82f6',    // Blue-500
  color: '#ffffff',              // White text
  border: 'none',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  
  // Hover state
  '&:hover': {
    backgroundColor: '#2563eb',  // Blue-600
    boxShadow: '0 4px 8px 0 rgba(59, 130, 246, 0.3)',
    transform: 'translateY(-1px)'
  },
  
  // Active state  
  '&:active': {
    backgroundColor: '#1d4ed8',  // Blue-700
    transform: 'translateY(0px)'
  }
}

// Normal variant (secondary)
const normalStyles = {
  backgroundColor: '#ffffff',    // White background
  color: '#374151',              // Gray-700 text
  border: '1px solid #d1d5db',   // Gray-300 border
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  
  // Hover state
  '&:hover': {
    backgroundColor: '#f9fafb',  // Gray-50
    borderColor: '#9ca3af',      // Gray-400
    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.1)',
    transform: 'translateY(-1px)'
  },
  
  // Active state
  '&:active': {
    backgroundColor: '#f3f4f6',  // Gray-100  
    borderColor: '#6b7280'       // Gray-500
  }
}
```

### Loading Spinner

```typescript
const LoadingSpinner = ({ size }) => (
  <div
    style={{
      width: sizeMap[size],
      height: sizeMap[size], 
      border: '2px solid currentColor',
      borderTopColor: 'transparent',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}
  />
)
```

## Integration with Property Rental Features

### Property Listing Actions

```tsx
function PropertyCard({ property }) {
  return (
    <Box 
      backgroundColor="white"
      borderRadius="0.75rem"
      padding="1.5rem"
      boxShadow="0 2px 8px rgba(0,0,0,0.1)"
    >
      {/* Property details */}
      <Box marginBottom="1.5rem">
        <Box fontSize="1.25rem" fontWeight="600" marginBottom="0.5rem">
          {property.name}
        </Box>
        <Box color="#6b7280" marginBottom="1rem">
          {property.location}
        </Box>
        <Box fontSize="1.125rem" fontWeight="600" color="#059669">
          AED {property.pricePerNight}/night
        </Box>
      </Box>
      
      {/* Action buttons */}
      <Box display="flex" flexDirection="column" gap="0.75rem">
        <Button
          label="Book This Property"
          variant="promoted"
          fullWidth
          icon={<FaCalendarCheck />}
          onClick={() => handleBooking(property.id)}
        />
        
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap="0.75rem">
          <Button
            label="Save"
            variant="normal"
            icon={<FaHeart />}
            onClick={() => handleWishlist(property.id)}
          />
          <Button
            label="Share"
            variant="normal" 
            icon={<FaShare />}
            onClick={() => handleShare(property)}
          />
        </Box>
      </Box>
    </Box>
  )
}
```

### Booking Flow Navigation

```tsx
function BookingSteps({ currentStep, onNext, onPrevious, onCancel }) {
  const steps = [
    { id: 1, label: 'Select Dates', completed: currentStep > 1 },
    { id: 2, label: 'Guest Details', completed: currentStep > 2 },
    { id: 3, label: 'Payment', completed: currentStep > 3 },
    { id: 4, label: 'Confirmation', completed: false }
  ]
  
  return (
    <Box 
      display="flex" 
      justifyContent="space-between" 
      alignItems="center"
      padding="1.5rem"
      borderTop="1px solid #e5e7eb"
    >
      {/* Previous button */}
      <Button
        label="Previous"
        variant="normal"
        onClick={onPrevious}
        disabled={currentStep === 1}
        icon={<FaArrowLeft />}
      />
      
      {/* Cancel button */}
      <Button
        label="Cancel Booking"
        variant="normal"
        size="small"
        onClick={onCancel}
      />
      
      {/* Next/Complete button */}
      <Button
        label={currentStep === steps.length ? 'Complete Booking' : 'Continue'}
        variant="promoted"
        onClick={onNext}
        icon={currentStep === steps.length ? <FaCheck /> : <FaArrowRight />}
      />
    </Box>
  )
}
```

### Property Management Dashboard

```tsx
function PropertyManagementActions({ property }) {
  const [isUpdating, setIsUpdating] = useState(false)
  
  return (
    <Box 
      display="flex" 
      gap="1rem" 
      alignItems="center"
      flexWrap="wrap"
    >
      {/* Primary actions */}
      <Button
        label="Edit Property"
        variant="promoted"
        icon={<FaEdit />}
        href={`/dashboard/properties/${property.id}/edit`}
      />
      
      {/* Secondary actions */}
      <Button
        label="View Calendar"
        variant="normal"
        icon={<FaCalendar />}
        href={`/dashboard/properties/${property.id}/calendar`}
      />
      
      <Button
        label="Manage Photos"
        variant="normal"
        icon={<FaImages />}
        onClick={() => handlePhotoManager(property.id)}
      />
      
      {/* Status toggle */}
      <Button
        label={property.isActive ? 'Deactivate' : 'Activate'}
        variant="normal"
        size="small"
        loading={isUpdating}
        onClick={() => handleToggleStatus(property.id)}
        icon={property.isActive ? <FaPause /> : <FaPlay />}
      />
    </Box>
  )
}
```

## Best Practices

### 1. Action Hierarchy
```tsx
// ✅ Good - Clear visual hierarchy
<Box display="flex" gap="1rem">
  <Button label="Primary Action" variant="promoted" />
  <Button label="Secondary" variant="normal" />  
  <Button label="Tertiary" variant="normal" size="small" />
</Box>

// ❌ Avoid - Multiple primary buttons competing for attention
<Box display="flex" gap="1rem">
  <Button label="Save" variant="promoted" />
  <Button label="Submit" variant="promoted" />
  <Button label="Publish" variant="promoted" />
</Box>
```

### 2. Loading States
```tsx
// ✅ Good - Consistent loading behavior
const [isSubmitting, setIsSubmitting] = useState(false)

<Button 
  label="Submit Form"
  variant="promoted"
  loading={isSubmitting}
  onClick={handleSubmit}
/>

// ❌ Avoid - Manual disabled state management
<Button 
  label="Submit Form" 
  disabled={isLoading}
  onClick={isLoading ? undefined : handleSubmit}
/>
```

### 3. Icon Usage
```tsx  
// ✅ Good - Icons that enhance understanding
<Button 
  label="Download Receipt"
  icon={<FaDownload />}
  variant="normal"
/>

// ❌ Avoid - Decorative icons that add no meaning
<Button 
  label="Continue"
  icon={<FaStar />}  // Star doesn't relate to continuation
  variant="promoted"
/>
```

### 4. Link vs Button Usage
```tsx
// ✅ Good - Use href for navigation
<Button 
  label="View Property Details"
  href={`/properties/${property.id}`}
  variant="normal"
/>

// ✅ Good - Use onClick for actions
<Button 
  label="Save Changes"
  onClick={handleSave}
  variant="promoted"
/>

// ❌ Avoid - Using href for actions that don't navigate
<Button 
  label="Delete Item"
  href="#"
  onClick={handleDelete}  // This should be onClick only
/>
```

## Accessibility Features

### Keyboard Navigation
- Full keyboard support with Enter and Space activation
- Proper tab order and focus management
- Clear visual focus indicators with outline styles

### Screen Reader Support  
- Semantic HTML with proper button/link elements
- ARIA attributes for state communication (`aria-disabled`, `aria-busy`)
- Descriptive labels and meaningful text content

### Color and Contrast
- WCAG AA compliant color contrast ratios
- Visual state indicators beyond color (elevation, borders)
- Support for high contrast and dark mode themes

## Related Components

- **Box**: Provides underlying layout and responsive capabilities
- **Input**: Matching heights and consistent form field styling  
- **SlidingDrawer**: Often contains buttons for actions and navigation
- **SelectionPicker**: May include button-style selection options

The Button component serves as the foundation for user interactions throughout the property rental platform, providing consistent, accessible, and visually appealing call-to-action elements.