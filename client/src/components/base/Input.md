# Input Component

The Input component is a comprehensive form input field designed for the Wezo.ae property rental platform. It extends HTML input functionality with responsive design, multiple visual variants, validation states, and icon support.

## Overview

The Input component provides a consistent, accessible, and visually appealing text input experience. It supports responsive width properties, multiple sizes, visual variants, error states, and helper text functionality.

## Props Interface

```typescript
interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    Pick<BoxProps, 'width' | 'widthSm' | 'widthMd' | 'widthLg' | 'widthXl'
        | 'minWidth' | 'minWidthSm' | 'minWidthMd' | 'minWidthLg' | 'minWidthXl'
        | 'maxWidth' | 'maxWidthSm' | 'maxWidthMd' | 'maxWidthLg' | 'maxWidthXl'> {
    
    // UI customization
    label?: string;
    icon?: React.ComponentType<any>; // Icon component from react-icons
    size?: 'small' | 'medium' | 'large';
    variant?: 'default' | 'outlined' | 'filled';
    fullWidth?: boolean;
    
    // Validation and helpers
    error?: boolean;
    helperText?: string;
    
    // Additional props
    containerClassName?: string;
    inputClassName?: string;
    labelClassName?: string;
    helperTextClassName?: string;
}
```

## Key Features

### 📐 Responsive Width Control
- **Responsive Props**: Supports all Box width properties (`width`, `widthSm`, `widthMd`, `widthLg`, `widthXl`)
- **Constraints**: `minWidth`/`maxWidth` with responsive variants
- **Full Width**: Optional `fullWidth` prop for 100% width
- **Flexible Sizing**: Adapts to different screen sizes and form layouts

### 🎨 Visual Variants
- **Default**: Clean white background with subtle border
- **Outlined**: Transparent background with prominent blue border
- **Filled**: Gray background for subtle integration
- **Error States**: Red borders and text for validation feedback

### 📏 Size Options
- **Small**: 36px height - Compact forms and tight layouts
- **Medium**: 44px height - Standard form fields (default)
- **Large**: 52px height - Prominent inputs and hero forms

### 🎯 Enhanced Features
- **Icon Support**: Optional leading icons with consistent sizing
- **Label Integration**: Built-in label with required field indicators
- **Helper Text**: Contextual help and error messages
- **Validation States**: Visual error feedback with colored borders/text

## Size Configuration

```typescript
const sizeConfig = {
    small: {
        height: '36px',
        fontSize: '1rem',
        padding: '8px 12px',
        iconSize: '0.875rem',
        gap: '6px',
        labelFontSize: '0.875rem',
    },
    medium: {
        height: '44px',
        fontSize: '1rem',
        padding: '10px 14px',
        iconSize: '1rem',
        gap: '8px',
        labelFontSize: '1rem',
    },
    large: {
        height: '52px',
        fontSize: '1.125rem',
        padding: '12px 16px',
        iconSize: '1.125rem',
        gap: '10px',
        labelFontSize: '1.125rem',
    },
};
```

## Usage Examples

### Basic Text Input

```tsx
import Input from '@/components/base/Input'

function BasicForm() {
  const [name, setName] = useState('')

  return (
    <Input
      label="Property Name"
      value={name}
      onChange={(e) => setName(e.target.value)}
      placeholder="Enter property name"
      required
    />
  )
}
```

### Input with Icon

```tsx
import { FaUser, FaEnvelope, FaPhone } from 'react-icons/fa'

function ContactForm() {
  return (
    <>
      <Input
        label="Full Name"
        icon={FaUser}
        placeholder="John Doe"
        required
      />
      <Input
        label="Email Address"
        icon={FaEnvelope}
        type="email"
        placeholder="john@example.com"
        required
      />
      <Input
        label="Phone Number"
        icon={FaPhone}
        type="tel"
        placeholder="+971 50 123 4567"
      />
    </>
  )
}
```

### Different Sizes and Variants

```tsx
function VariantShowcase() {
  return (
    <>
      {/* Size Variants */}
      <Input label="Small Input" size="small" placeholder="Small size" />
      <Input label="Medium Input" size="medium" placeholder="Medium size (default)" />
      <Input label="Large Input" size="large" placeholder="Large size" />
      
      {/* Style Variants */}
      <Input label="Default Variant" variant="default" placeholder="White background" />
      <Input label="Outlined Variant" variant="outlined" placeholder="Blue outline" />
      <Input label="Filled Variant" variant="filled" placeholder="Gray background" />
    </>
  )
}
```

### Responsive Width Control

```tsx
function ResponsiveInputs() {
  return (
    <>
      {/* Full width on mobile, 50% on tablet and above */}
      <Input
        label="Responsive Input"
        fullWidth
        widthMd="50%"
        placeholder="Responsive width"
      />
      
      {/* Different widths across breakpoints */}
      <Input
        label="Multi-breakpoint Input"
        width="100%"
        widthSm="300px"
        widthMd="400px"
        widthLg="500px"
        placeholder="Changes width at each breakpoint"
      />
      
      {/* Constrained width */}
      <Input
        label="Constrained Width"
        minWidth="200px"
        maxWidth="400px"
        placeholder="Minimum and maximum width"
      />
    </>
  )
}
```

### Validation and Error States

```tsx
function ValidationExample() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  
  const validateEmail = (value: string) => {
    if (!value.includes('@')) {
      setError('Please enter a valid email address')
    } else {
      setError('')
    }
  }

  return (
    <Input
      label="Email Address"
      type="email"
      value={email}
      onChange={(e) => {
        setEmail(e.target.value)
        validateEmail(e.target.value)
      }}
      error={!!error}
      helperText={error || 'We\'ll never share your email address'}
      placeholder="Enter your email"
      required
    />
  )
}
```

### Form Integration

```tsx
function PropertyRegistrationForm() {
  const [formData, setFormData] = useState({
    propertyName: '',
    address: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
  })

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <Box as="form" display="grid" gap="1.5rem">
      <Input
        label="Property Name"
        value={formData.propertyName}
        onChange={handleChange('propertyName')}
        placeholder="e.g., Luxury Villa Marina"
        required
        size="large"
      />
      
      <Input
        label="Property Address"
        value={formData.address}
        onChange={handleChange('address')}
        placeholder="Full property address"
        required
      />
      
      <Input
        label="Description"
        value={formData.description}
        onChange={handleChange('description')}
        placeholder="Brief property description"
        helperText="Describe the main features of your property"
      />
      
      <Box 
        display="grid" 
        gridTemplateColumns="1fr"
        gridTemplateColumnsMd="1fr 1fr"
        gap="1rem"
      >
        <Input
          label="Contact Email"
          type="email"
          icon={FaEnvelope}
          value={formData.contactEmail}
          onChange={handleChange('contactEmail')}
          placeholder="contact@example.com"
          required
        />
        
        <Input
          label="Contact Phone"
          type="tel"
          icon={FaPhone}
          value={formData.contactPhone}
          onChange={handleChange('contactPhone')}
          placeholder="+971 50 123 4567"
        />
      </Box>
    </Box>
  )
}
```

## Styling and Theming

### Variant Styles

```typescript
const getVariantStyles = (variant: InputProps['variant'], error?: boolean, disabled?: boolean) => {
    switch (variant) {
        case 'outlined':
            return {
                backgroundColor: 'transparent',
                border: error ? '2px solid #ef4444' : '2px solid #3b82f6',
            };
        case 'filled':
            return {
                backgroundColor: disabled ? '#e5e7eb' : '#f3f4f6',
                border: error ? '1px solid #ef4444' : '1px solid transparent',
            };
        default:
            return {
                backgroundColor: disabled ? '#f5f5f5' : '#ffffff',
                border: error ? '1px solid #ef4444' : '1px solid #d1d5db',
            };
    }
};
```

### Visual States
- **Default**: Clean appearance with subtle borders
- **Focus**: Automatic focus styles with smooth transitions
- **Error**: Red borders and helper text
- **Disabled**: Grayed out appearance with reduced interactivity
- **Required**: Red asterisk indicator in label

## Integration with Property Rental Features

### Guest Information Forms
```tsx
function GuestDetailsForm() {
  return (
    <>
      <Input
        label="Guest Name"
        icon={FaUser}
        placeholder="Primary guest name"
        required
        size="large"
      />
      <Input
        label="Email Address"
        icon={FaEnvelope}
        type="email"
        placeholder="For booking confirmations"
        required
      />
      <Input
        label="Phone Number"
        icon={FaPhone}
        type="tel"
        placeholder="For urgent communications"
        helperText="Include country code for international numbers"
      />
    </>
  )
}
```

### Property Search
```tsx
function PropertySearchForm() {
  return (
    <Box display="flex" gap="1rem">
      <Input
        placeholder="Search by location, property name..."
        fullWidth
        size="large"
        icon={FaSearch}
      />
      <Input
        placeholder="Max price"
        type="number"
        width="150px"
        size="large"
      />
    </Box>
  )
}
```

### Property Management
```tsx
function PropertySettingsForm() {
  return (
    <>
      <Input
        label="Property Title"
        placeholder="How guests will see your property"
        helperText="Keep it descriptive and appealing"
        maxLength={60}
      />
      <Input
        label="Nightly Rate"
        type="number"
        placeholder="0"
        helperText="Base price per night in AED"
        icon={FaMoneyBillWave}
      />
    </>
  )
}
```

## Best Practices

### 1. Label and Placeholder Usage
```tsx
// ✅ Good - Clear label with helpful placeholder
<Input
  label="Property Name"
  placeholder="e.g., Beachfront Villa Dubai"
  helperText="This will be displayed to potential guests"
/>

// ❌ Avoid - Redundant label and placeholder
<Input
  label="Name"
  placeholder="Name"
/>
```

### 2. Validation Feedback
```tsx
// ✅ Good - Clear error states and helpful messages
<Input
  label="Email Address"
  type="email"
  error={!isValidEmail(email)}
  helperText={emailError || "We'll send booking confirmations here"}
/>

// ❌ Avoid - Generic error messages
<Input
  label="Email"
  error={hasError}
  helperText="Invalid"
/>
```

### 3. Responsive Design
```tsx
// ✅ Good - Responsive width for different layouts
<Input
  label="Search Properties"
  fullWidth
  widthLg="400px"
  placeholder="Location, property type, amenities..."
/>
```

### 4. Icon Usage
```tsx
// ✅ Good - Icons that enhance understanding
<Input
  label="Contact Email"
  icon={FaEnvelope}
  type="email"
/>

// ❌ Avoid - Decorative icons that don't add meaning
<Input
  label="Property Description"
  icon={FaStar} // Stars don't relate to text input
/>
```

## Accessibility Features

### Keyboard Navigation
- Full keyboard support with tab navigation
- Enter key submits forms when appropriate
- Proper focus management and visual indicators

### Screen Reader Support
- Semantic HTML structure with proper labels
- ARIA attributes for validation states
- Descriptive helper text associations

### Color Accessibility
- Sufficient color contrast for all states
- Visual indicators beyond color (borders, icons)
- Support for high contrast mode

## Related Components

- **Box**: Provides the underlying layout and responsive capabilities
- **DatePicker**: Specialized input for date selection
- **TimePicker**: Specialized input for time selection
- **NumberStepperInput**: Specialized input for numeric values

The Input component serves as the foundation for form interactions in the property rental platform, providing consistent, accessible, and responsive text input capabilities.