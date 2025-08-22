# NumberStepperInput Component

The NumberStepperInput component provides an interactive numeric input field with increment/decrement buttons and advanced formatting capabilities. Designed for the Wezo.ae property rental platform, it supports currency formatting, decimal precision, validation, and responsive design.

## Overview

The NumberStepperInput combines the functionality of a text input with stepper buttons, providing multiple ways for users to input numeric values. It supports keyboard navigation, mouse interactions, and touch gestures while maintaining accessibility standards.

## Props Interface

```typescript
interface NumberStepperInputProps extends Pick<BoxProps, 'width' | 'widthSm' | 'widthMd' | 'widthLg' | 'widthXl'
    | 'minWidth' | 'minWidthSm' | 'minWidthMd' | 'minWidthLg' | 'minWidthXl'
    | 'maxWidth' | 'maxWidthSm' | 'maxWidthMd' | 'maxWidthLg' | 'maxWidthXl'> {
    
    // Standard React form props
    value?: number;
    defaultValue?: number;
    onChange?: (value: number) => void;

    // Stepper configuration
    step?: number;
    min?: number;
    max?: number;

    // Formatting options
    format?: 'currency' | 'integer' | 'decimal';
    currency?: string;
    currencyPosition?: 'prefix' | 'suffix';
    decimalPlaces?: number;
    thousandsSeparator?: string;
    decimalSeparator?: string;

    // UI customization
    label?: string;
    icon?: React.ComponentType<any>;
    placeholder?: string;
    disabled?: boolean;
    readOnly?: boolean;
    size?: 'small' | 'medium' | 'large';
    variant?: 'default' | 'outlined' | 'filled';

    // Validation
    required?: boolean;
    error?: boolean;
    helperText?: string;

    // Additional props
    name?: string;
    id?: string;
    className?: string;
    autoFocus?: boolean;
    tabIndex?: number;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
}
```

## Key Features

### 🔢 Advanced Number Formatting
- **Currency Format**: Supports multiple currencies with prefix/suffix positioning
- **Decimal Precision**: Configurable decimal places for precise values
- **Thousands Separator**: Customizable grouping for large numbers
- **Integer Mode**: Whole numbers only with automatic rounding

### ⚡ Interactive Stepper Controls
- **Increment/Decrement Buttons**: Touch-friendly +/- buttons
- **Keyboard Navigation**: Arrow up/down keys for quick adjustments
- **Mouse and Touch**: Optimized for both desktop and mobile interactions
- **Boundary Enforcement**: Automatic min/max constraint handling

### 📱 Responsive Design
- **Multiple Sizes**: Small (36px), Medium (44px), Large (52px)
- **Responsive Width**: Full Box responsive width properties support
- **Visual Variants**: Default, outlined, and filled styles
- **Mobile Optimized**: Touch-friendly button sizes and input behavior

### 🎯 Smart Input Behavior
- **Focus Management**: Raw number display while editing, formatted display when not focused
- **Text Selection**: Automatic text selection on focus for easy replacement
- **Live Validation**: Real-time boundary checking and error feedback
- **Parse/Format Cycle**: Intelligent parsing of user input with formatting on blur

## Size Configuration

```typescript
const sizeConfig = {
    small: {
        height: 36,
        fontSize: '1rem',
        buttonSize: 32,
        padding: 8,
    },
    medium: {
        height: 44,
        fontSize: '1rem',
        buttonSize: 40,
        padding: 10,
    },
    large: {
        height: 52,
        fontSize: '1.125rem',
        buttonSize: 48,
        padding: 12,
    },
};
```

## Usage Examples

### Basic Numeric Input

```tsx
import NumberStepperInput from '@/components/base/NumberStepperInput'

function QuantitySelector() {
  const [quantity, setQuantity] = useState(1)

  return (
    <NumberStepperInput
      label="Number of Guests"
      value={quantity}
      onChange={setQuantity}
      min={1}
      max={10}
      step={1}
      format="integer"
    />
  )
}
```

### Currency Input

```tsx
import { FaDollarSign } from 'react-icons/fa'

function PriceInput() {
  const [price, setPrice] = useState(0)

  return (
    <NumberStepperInput
      label="Nightly Rate"
      icon={FaDollarSign}
      value={price}
      onChange={setPrice}
      format="currency"
      currency="AED"
      currencyPosition="prefix"
      decimalPlaces={2}
      min={0}
      max={10000}
      step={50}
      helperText="Price per night in UAE Dirhams"
    />
  )
}
```

### Percentage Input

```tsx
function DiscountInput() {
  const [discount, setDiscount] = useState(0)

  return (
    <NumberStepperInput
      label="Discount Percentage"
      value={discount}
      onChange={setDiscount}
      format="decimal"
      decimalPlaces={1}
      currency="%"
      currencyPosition="suffix"
      min={0}
      max={100}
      step={0.5}
      helperText="Discount applied to base rate"
    />
  )
}
```

### Room Configuration

```tsx
function RoomSelector() {
  const [bedrooms, setBedrooms] = useState(2)
  const [bathrooms, setBathrooms] = useState(1)

  return (
    <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem">
      <NumberStepperInput
        label="Bedrooms"
        icon={FaBed}
        value={bedrooms}
        onChange={setBedrooms}
        min={1}
        max={10}
        step={1}
        format="integer"
        size="large"
      />
      <NumberStepperInput
        label="Bathrooms"
        icon={FaBath}
        value={bathrooms}
        onChange={setBathrooms}
        min={1}
        max={8}
        step={0.5}
        format="decimal"
        decimalPlaces={1}
        size="large"
      />
    </Box>
  )
}
```

### Different Sizes and Variants

```tsx
function VariantShowcase() {
  const [value1, setValue1] = useState(100)
  const [value2, setValue2] = useState(250)
  const [value3, setValue3] = useState(500)

  return (
    <>
      {/* Size Variants */}
      <NumberStepperInput 
        label="Small Size" 
        size="small" 
        value={value1} 
        onChange={setValue1}
      />
      <NumberStepperInput 
        label="Medium Size" 
        size="medium" 
        value={value2} 
        onChange={setValue2}
      />
      <NumberStepperInput 
        label="Large Size" 
        size="large" 
        value={value3} 
        onChange={setValue3}
      />
      
      {/* Style Variants */}
      <NumberStepperInput 
        label="Default Variant" 
        variant="default" 
        value={value1} 
        onChange={setValue1}
      />
      <NumberStepperInput 
        label="Outlined Variant" 
        variant="outlined" 
        value={value2} 
        onChange={setValue2}
      />
      <NumberStepperInput 
        label="Filled Variant" 
        variant="filled" 
        value={value3} 
        onChange={setValue3}
      />
    </>
  )
}
```

### Responsive Width Control

```tsx
function ResponsiveNumberInputs() {
  const [mobilePrice, setMobilePrice] = useState(1500)

  return (
    <NumberStepperInput
      label="Property Price"
      value={mobilePrice}
      onChange={setMobilePrice}
      format="currency"
      currency="AED"
      // Full width on mobile, constrained on larger screens
      width="100%"
      maxWidth="300px"
      maxWidthLg="400px"
      helperText="Price adapts to screen size"
    />
  )
}
```

## Number Formatting Details

### Currency Formatting
```typescript
// Currency with prefix
format="currency"
currency="$"
currencyPosition="prefix"
// Result: $1,234.56

// Currency with suffix  
format="currency"
currency=" AED"
currencyPosition="suffix"
// Result: 1,234.56 AED
```

### Decimal Formatting
```typescript
// Decimal with custom separators
format="decimal"
decimalPlaces={3}
thousandsSeparator=","
decimalSeparator="."
// Result: 1,234.567
```

### Integer Formatting
```typescript
// Integer with thousands separator
format="integer"
thousandsSeparator=","
// Result: 1,234 (automatic rounding)
```

## Advanced Use Cases

### Property Booking Calculator

```tsx
function BookingCalculator() {
  const [nights, setNights] = useState(3)
  const [guests, setGuests] = useState(2)
  const [baseRate, setBaseRate] = useState(450)
  const [discount, setDiscount] = useState(0)

  const subtotal = nights * baseRate
  const discountAmount = (subtotal * discount) / 100
  const total = subtotal - discountAmount

  return (
    <Box display="grid" gap="1.5rem">
      <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem">
        <NumberStepperInput
          label="Number of Nights"
          icon={FaCalendarAlt}
          value={nights}
          onChange={setNights}
          min={1}
          max={30}
          format="integer"
        />
        
        <NumberStepperInput
          label="Number of Guests"
          icon={FaUser}
          value={guests}
          onChange={setGuests}
          min={1}
          max={12}
          format="integer"
        />
      </Box>
      
      <NumberStepperInput
        label="Base Rate per Night"
        icon={FaDollarSign}
        value={baseRate}
        onChange={setBaseRate}
        format="currency"
        currency="AED"
        min={100}
        max={5000}
        step={50}
        size="large"
      />
      
      <NumberStepperInput
        label="Discount Percentage"
        icon={FaPercent}
        value={discount}
        onChange={setDiscount}
        format="decimal"
        decimalPlaces={1}
        currency="%"
        currencyPosition="suffix"
        min={0}
        max={50}
        step={0.5}
      />
      
      {/* Booking Summary */}
      <Box 
        backgroundColor="#f8fafc" 
        padding="1rem" 
        borderRadius="0.5rem"
        border="1px solid #e2e8f0"
      >
        <Box fontWeight="600" marginBottom="0.5rem">Booking Summary:</Box>
        <Box>Subtotal: AED {subtotal.toLocaleString()}</Box>
        <Box>Discount: -AED {discountAmount.toLocaleString()}</Box>
        <Box fontWeight="600" color="#059669">
          Total: AED {total.toLocaleString()}
        </Box>
      </Box>
    </Box>
  )
}
```

### Property Amenities Counter

```tsx
function AmenitiesCounter() {
  const [amenities, setAmenities] = useState({
    parking: 2,
    pools: 1,
    gyms: 0,
    elevators: 1
  })

  const handleAmenityChange = (key: string) => (value: number) => {
    setAmenities(prev => ({ ...prev, [key]: value }))
  }

  return (
    <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="1rem">
      <NumberStepperInput
        label="Parking Spaces"
        icon={FaCar}
        value={amenities.parking}
        onChange={handleAmenityChange('parking')}
        min={0}
        max={20}
        format="integer"
        helperText="Available parking spots"
      />
      
      <NumberStepperInput
        label="Swimming Pools"
        icon={FaSwimmingPool}
        value={amenities.pools}
        onChange={handleAmenityChange('pools')}
        min={0}
        max={5}
        format="integer"
        helperText="Number of pools"
      />
      
      <NumberStepperInput
        label="Fitness Centers"
        icon={FaDumbbell}
        value={amenities.gyms}
        onChange={handleAmenityChange('gyms')}
        min={0}
        max={3}
        format="integer"
        helperText="Gym facilities"
      />
      
      <NumberStepperInput
        label="Elevators"
        icon={FaBuilding}
        value={amenities.elevators}
        onChange={handleAmenityChange('elevators')}
        min={0}
        max={8}
        format="integer"
        helperText="Number of elevators"
      />
    </Box>
  )
}
```

## Validation and Error Handling

```tsx
function ValidatedNumberInput() {
  const [value, setValue] = useState(0)
  const [error, setError] = useState('')

  const handleChange = (newValue: number) => {
    setValue(newValue)
    
    // Custom validation
    if (newValue < 100) {
      setError('Minimum value is 100')
    } else if (newValue > 5000) {
      setError('Maximum value is 5000')
    } else {
      setError('')
    }
  }

  return (
    <NumberStepperInput
      label="Property Value"
      value={value}
      onChange={handleChange}
      format="currency"
      currency="AED"
      min={0}
      max={10000}
      error={!!error}
      helperText={error || 'Enter property value in AED'}
      required
    />
  )
}
```

## Styling and Theming

### Variant Styles

```typescript
const variantStyles = {
    default: {
        backgroundColor: disabled ? '#f5f5f5' : '#ffffff',
        border: error ? '1px solid #ef4444' : '1px solid #d1d5db',
    },
    outlined: {
        backgroundColor: 'transparent',
        border: error ? '2px solid #ef4444' : '2px solid #3b82f6',
    },
    filled: {
        backgroundColor: disabled ? '#e5e7eb' : '#f3f4f6',
        border: error ? '1px solid #ef4444' : '1px solid transparent',
    },
};
```

### Interactive States
- **Default**: Clean white background with subtle border
- **Hover**: Button backgrounds change on hover
- **Focus**: Input field shows raw number for editing
- **Disabled**: Grayed out with reduced opacity
- **Error**: Red borders and helper text
- **Boundary**: Buttons disabled when min/max reached

## Integration with Property Rental Features

### Pricing Configuration
```tsx
function PricingSettings() {
  return (
    <>
      <NumberStepperInput
        label="Base Nightly Rate"
        format="currency"
        currency="AED"
        min={100}
        max={10000}
        step={50}
        helperText="Starting price per night"
        size="large"
      />
      <NumberStepperInput
        label="Cleaning Fee"
        format="currency"
        currency="AED"
        min={0}
        max={500}
        step={25}
        helperText="One-time cleaning charge"
      />
      <NumberStepperInput
        label="Security Deposit"
        format="currency"
        currency="AED"
        min={0}
        max={5000}
        step={100}
        helperText="Refundable security deposit"
      />
    </>
  )
}
```

### Property Specifications
```tsx
function PropertySpecs() {
  return (
    <>
      <NumberStepperInput
        label="Total Area"
        format="decimal"
        decimalPlaces={0}
        currency=" sqm"
        currencyPosition="suffix"
        min={50}
        max={2000}
        step={10}
        helperText="Property area in square meters"
      />
      <NumberStepperInput
        label="Maximum Occupancy"
        format="integer"
        min={1}
        max={20}
        helperText="Maximum number of guests allowed"
      />
    </>
  )
}
```

## Accessibility Features

### Keyboard Support
- **Tab Navigation**: Sequential focus through stepper buttons and input
- **Arrow Keys**: Up/down arrows increment/decrement value
- **Enter/Space**: Activates focused stepper buttons
- **Number Input**: Direct numeric input with formatting

### Screen Reader Support
- **Semantic Labels**: Proper labeling for all interactive elements
- **Value Announcements**: Changes announced to screen readers
- **Button Roles**: Clear button roles for increment/decrement actions
- **Error States**: ARIA attributes for validation feedback

### Focus Management
- **Visual Indicators**: Clear focus outlines for all interactive elements
- **Logical Tab Order**: Input field first, then stepper buttons
- **Auto-Selection**: Text selection on focus for easy editing

## Performance Considerations

### Formatting Optimization
- Memoized formatting functions to prevent unnecessary recalculations
- Efficient parse/format cycle with minimal regex operations
- Debounced onChange events for smooth real-time updates

### Rendering Optimization
- Minimal re-renders through proper state management
- Optimized button states based on current value and boundaries
- Efficient event handler binding with useCallback

## Best Practices

### 1. Choose Appropriate Step Values
```tsx
// ✅ Good - Logical step increments
<NumberStepperInput step={0.5} min={0} max={5} /> // Half-star ratings
<NumberStepperInput step={50} min={100} max={5000} /> // Price ranges

// ❌ Avoid - Impractical step values
<NumberStepperInput step={0.01} min={0} max={1000} /> // Too precise for UI
```

### 2. Set Meaningful Boundaries
```tsx
// ✅ Good - Realistic constraints
<NumberStepperInput 
  label="Number of Guests" 
  min={1} 
  max={12} 
  helperText="Maximum occupancy: 12 guests"
/>

// ❌ Avoid - Unlimited ranges without context
<NumberStepperInput label="Price" min={0} max={Infinity} />
```

### 3. Use Appropriate Formatting
```tsx
// ✅ Good - Format matches data type
<NumberStepperInput format="currency" currency="AED" /> // Money
<NumberStepperInput format="integer" /> // Whole quantities
<NumberStepperInput format="decimal" decimalPlaces={1} /> // Ratings

// ❌ Avoid - Mismatched formatting
<NumberStepperInput format="currency" currency="guests" /> // Not currency
```

## Related Components

- **Input**: Base text input component
- **Box**: Provides responsive and styling capabilities
- **DatePicker**: For date-based numeric input
- **SelectionPicker**: For predefined numeric options

The NumberStepperInput component provides precise numeric input control with rich formatting options, making it ideal for property rental scenarios requiring accurate pricing, quantity, and specification inputs.