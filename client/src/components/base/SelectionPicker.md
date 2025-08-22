# SelectionPicker Component

The SelectionPicker component is a versatile selection interface designed for the Wezo.ae property rental platform. It provides both single and multiple selection capabilities with customizable rendering, accessibility features, and responsive design support.

## Overview

The SelectionPicker component offers a flexible solution for selecting items from a list of options. It supports generic typing, custom rendering, disabled states, and keyboard navigation, making it perfect for property amenities, room types, pricing options, and guest preferences.

## Props Interface

```typescript
interface SelectionPickerProps<T> extends Omit<BoxProps<'div'>, 'onChange'> {
    // Data and value management
    data: T[];
    idAccessor: (item: T) => string | number;
    value: string | number | (string | number)[] | null | undefined;
    onChange: (value: string | number | (string | number)[]) => void;
    
    // Selection behavior
    isMultiSelect?: boolean;
    
    // Custom rendering
    renderItem?: (item: T, isSelected: boolean) => React.ReactNode;
    labelAccessor?: (item: T) => string;
    
    // Styling customization
    containerClassName?: string;
    itemClassName?: string;
    selectedItemClassName?: string;
    containerStyles?: CSSProperties;
    itemStyles?: CSSProperties;
    selectedItemStyles?: CSSProperties;
    
    // Disabled states
    disabled?: boolean;
    isItemDisabled?: (item: T) => boolean;
    
    // DOM reference
    containerRef?: React.RefObject<HTMLDivElement>;
}
```

## Key Features

### 🔄 Flexible Selection Modes
- **Single Selection**: Radio button-style selection with circular indicators
- **Multiple Selection**: Checkbox-style selection with square indicators and checkmarks
- **Dynamic Switching**: Toggle between modes with `isMultiSelect` prop
- **Value Normalization**: Handles both single values and arrays consistently

### 🎨 Custom Rendering
- **Default Renderer**: Built-in checkbox/radio indicators with labels
- **Custom Renderer**: Complete control over item appearance with `renderItem`
- **Label Accessor**: Flexible text extraction from complex objects
- **Visual Indicators**: Animated selection states with hover effects

### 🎯 Enhanced Accessibility
- **Keyboard Navigation**: Tab, Space, and Enter key support
- **ARIA Attributes**: Proper role, aria-checked, and aria-disabled states
- **Screen Reader Support**: Semantic HTML structure
- **Focus Management**: Visual focus indicators and logical tab order

### 🚫 Disabled State Management
- **Global Disabled**: Disable entire component with visual feedback
- **Item-Level Disabled**: Conditional disabled states per item
- **Visual Feedback**: Reduced opacity and cursor changes
- **Interaction Prevention**: Blocks selection on disabled items

### 💅 Comprehensive Styling
- **Multiple Style Props**: Container, item, and selected item customization
- **CSS Classes**: Additional className support for each level
- **Responsive Design**: Inherits Box component responsive properties
- **Theme Integration**: Consistent color scheme and animations

## Selection Behavior

### Single Selection Mode
```typescript
// Value: string | number | null | undefined
const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

<SelectionPicker
  data={roomTypes}
  idAccessor={(room) => room.id}
  value={selectedRoom}
  onChange={(value) => setSelectedRoom(value as string)}
  isMultiSelect={false}
/>
```

### Multiple Selection Mode
```typescript
// Value: (string | number)[]
const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

<SelectionPicker
  data={amenities}
  idAccessor={(amenity) => amenity.id}
  value={selectedAmenities}
  onChange={(value) => setSelectedAmenities(value as string[])}
  isMultiSelect={true}
/>
```

## Usage Examples

### Basic Property Amenities Selection

```tsx
import SelectionPicker from '@/components/base/SelectionPicker'

interface Amenity {
  id: string
  name: string
  icon: string
  category: string
}

function AmenitySelector() {
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  
  const amenities: Amenity[] = [
    { id: 'wifi', name: 'Free Wi-Fi', icon: '📶', category: 'connectivity' },
    { id: 'pool', name: 'Swimming Pool', icon: '🏊', category: 'recreation' },
    { id: 'parking', name: 'Free Parking', icon: '🚗', category: 'convenience' },
    { id: 'ac', name: 'Air Conditioning', icon: '❄️', category: 'comfort' }
  ]

  return (
    <SelectionPicker
      data={amenities}
      idAccessor={(amenity) => amenity.id}
      labelAccessor={(amenity) => amenity.name}
      value={selectedAmenities}
      onChange={(value) => setSelectedAmenities(value as string[])}
      isMultiSelect={true}
    />
  )
}
```

### Custom Rendered Room Types

```tsx
import { FaBed, FaCouch, FaHome } from 'react-icons/fa'

interface RoomType {
  id: string
  name: string
  description: string
  capacity: number
  pricePerNight: number
  available: boolean
}

function RoomTypeSelector() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  
  const roomTypes: RoomType[] = [
    {
      id: 'master',
      name: 'Master Suite',
      description: 'Spacious room with private bathroom and balcony',
      capacity: 2,
      pricePerNight: 300,
      available: true
    },
    {
      id: 'guest',
      name: 'Guest Room',
      description: 'Comfortable room with shared bathroom',
      capacity: 2,
      pricePerNight: 200,
      available: true
    },
    {
      id: 'studio',
      name: 'Studio Apartment',
      description: 'Self-contained unit with kitchenette',
      capacity: 4,
      pricePerNight: 400,
      available: false
    }
  ]

  const renderRoomType = (room: RoomType, isSelected: boolean) => (
    <Box display="flex" alignItems="center" width="100%">
      <Box marginRight="1rem" fontSize="1.5rem">
        {room.id === 'master' && <FaBed />}
        {room.id === 'guest' && <FaCouch />}
        {room.id === 'studio' && <FaHome />}
      </Box>
      
      <Box flex="1">
        <Box 
          fontSize="1.125rem" 
          fontWeight="600" 
          color={isSelected ? '#1e40af' : '#111827'}
        >
          {room.name}
        </Box>
        <Box fontSize="0.875rem" color="#6b7280" marginBottom="0.25rem">
          {room.description}
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box fontSize="0.875rem" color="#374151">
            Up to {room.capacity} guests
          </Box>
          <Box 
            fontSize="1rem" 
            fontWeight="600" 
            color={room.available ? '#059669' : '#dc2626'}
          >
            {room.available ? `AED ${room.pricePerNight}/night` : 'Unavailable'}
          </Box>
        </Box>
      </Box>
    </Box>
  )

  return (
    <SelectionPicker
      data={roomTypes}
      idAccessor={(room) => room.id}
      value={selectedRoom}
      onChange={(value) => setSelectedRoom(value as string)}
      renderItem={renderRoomType}
      isItemDisabled={(room) => !room.available}
      isMultiSelect={false}
      itemStyles={{ padding: '1.5rem' }}
      gap="1rem"
    />
  )
}
```

### Property Type Selection with Categories

```tsx
interface PropertyType {
  id: string
  name: string
  category: 'villa' | 'apartment' | 'hotel'
  minGuests: number
  maxGuests: number
  features: string[]
}

function PropertyTypeSelector() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  
  const propertyTypes: PropertyType[] = [
    {
      id: 'luxury-villa',
      name: 'Luxury Villa',
      category: 'villa',
      minGuests: 6,
      maxGuests: 12,
      features: ['Private Pool', 'Garden', 'Multiple Bedrooms']
    },
    {
      id: 'beach-villa',
      name: 'Beachfront Villa',
      category: 'villa',
      minGuests: 4,
      maxGuests: 8,
      features: ['Beach Access', 'Ocean View', 'BBQ Area']
    },
    {
      id: 'city-apartment',
      name: 'City Apartment',
      category: 'apartment',
      minGuests: 2,
      maxGuests: 4,
      features: ['Downtown Location', 'Modern Amenities']
    },
    {
      id: 'hotel-suite',
      name: 'Hotel Suite',
      category: 'hotel',
      minGuests: 2,
      maxGuests: 6,
      features: ['Room Service', 'Concierge', 'Daily Housekeeping']
    }
  ]

  const renderPropertyType = (property: PropertyType, isSelected: boolean) => (
    <Box display="flex" alignItems="start" width="100%">
      <Box flex="1">
        <Box display="flex" alignItems="center" marginBottom="0.5rem">
          <Box 
            fontSize="1.125rem" 
            fontWeight="600" 
            color={isSelected ? '#1e40af' : '#111827'}
            marginRight="0.5rem"
          >
            {property.name}
          </Box>
          <Box
            fontSize="0.75rem"
            backgroundColor={
              property.category === 'villa' ? '#fef3c7' : 
              property.category === 'apartment' ? '#dbeafe' : '#f3e8ff'
            }
            color={
              property.category === 'villa' ? '#92400e' : 
              property.category === 'apartment' ? '#1e40af' : '#6b21a8'
            }
            padding="0.25rem 0.5rem"
            borderRadius="0.375rem"
            textTransform="uppercase"
            fontWeight="600"
          >
            {property.category}
          </Box>
        </Box>
        
        <Box fontSize="0.875rem" color="#6b7280" marginBottom="0.5rem">
          Accommodates {property.minGuests}-{property.maxGuests} guests
        </Box>
        
        <Box display="flex" flexWrap="wrap" gap="0.25rem">
          {property.features.map((feature) => (
            <Box
              key={feature}
              fontSize="0.75rem"
              backgroundColor="#f3f4f6"
              color="#374151"
              padding="0.125rem 0.375rem"
              borderRadius="0.25rem"
            >
              {feature}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )

  return (
    <SelectionPicker
      data={propertyTypes}
      idAccessor={(property) => property.id}
      value={selectedTypes}
      onChange={(value) => setSelectedTypes(value as string[])}
      renderItem={renderPropertyType}
      isMultiSelect={true}
      itemStyles={{ 
        padding: '1.5rem',
        minHeight: '120px'
      }}
      gap="1rem"
    />
  )
}
```

### Responsive Property Filter

```tsx
function PropertyFilterSelector() {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  
  const filters = [
    { id: 'instant-book', name: 'Instant Book', description: 'Book immediately' },
    { id: 'free-cancellation', name: 'Free Cancellation', description: 'Cancel up to 24h before' },
    { id: 'pet-friendly', name: 'Pet Friendly', description: 'Pets allowed' },
    { id: 'family-friendly', name: 'Family Friendly', description: 'Great for kids' },
    { id: 'business-ready', name: 'Business Ready', description: 'Wi-Fi and workspace' }
  ]

  return (
    <SelectionPicker
      data={filters}
      idAccessor={(filter) => filter.id}
      labelAccessor={(filter) => filter.name}
      value={selectedFilters}
      onChange={(value) => setSelectedFilters(value as string[])}
      isMultiSelect={true}
      // Responsive layout
      width="100%"
      widthMd="400px"
      widthLg="500px"
      maxWidth="600px"
      // Custom styling
      itemStyles={{
        padding: '1rem',
        borderRadius: '0.75rem'
      }}
      selectedItemStyles={{
        borderColor: '#059669',
        backgroundColor: '#ecfdf5'
      }}
      gap="0.75rem"
    />
  )
}
```

## Styling and Theming

### Default Item Styles

```typescript
const baseItemStyles = {
  display: 'flex',
  alignItems: 'center',
  padding: '0.75rem 1rem',
  borderRadius: '0.5rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
  border: '2px solid',
  borderColor: '#e5e7eb', // Default border
  backgroundColor: 'white'
}

const selectedItemStyles = {
  borderColor: '#3182ce', // Blue border when selected
  backgroundColor: '#ebf8ff' // Light blue background
}
```

### Custom Styling Options

```tsx
// Individual style props
<SelectionPicker
  containerStyles={{ backgroundColor: '#f8fafc' }}
  itemStyles={{ 
    borderRadius: '1rem',
    padding: '1.25rem' 
  }}
  selectedItemStyles={{ 
    borderColor: '#10b981',
    backgroundColor: '#d1fae5' 
  }}
/>

// CSS classes for complex styling
<SelectionPicker
  containerClassName="property-selector"
  itemClassName="property-item"
  selectedItemClassName="property-item--selected"
/>
```

### Responsive Design Integration

```tsx
// Inherits Box responsive properties
<SelectionPicker
  width="100%"
  widthSm="300px"
  widthMd="400px"
  widthLg="500px"
  maxWidth="600px"
  padding="1rem"
  paddingMd="1.5rem"
  gap="0.5rem"
  gapMd="0.75rem"
/>
```

## Accessibility Features

### Keyboard Navigation
- **Tab Navigation**: Move between selectable items
- **Space/Enter**: Toggle selection on focused item
- **Focus Indicators**: Visual feedback for keyboard users

### Screen Reader Support
- **Semantic Roles**: `radio` for single selection, `checkbox` for multiple
- **ARIA States**: `aria-checked` reflects selection state
- **ARIA Disabled**: `aria-disabled` for unavailable items

### Visual Accessibility
- **Color Contrast**: Sufficient contrast ratios for all states
- **Multiple Indicators**: Color, borders, and icons for selection states
- **Focus Styles**: Clear visual focus indicators

## Integration with Property Rental Features

### Guest Preferences Selection
```tsx
function GuestPreferencesForm() {
  const preferences = [
    { id: 'quiet-area', name: 'Quiet Area', category: 'environment' },
    { id: 'city-center', name: 'City Center', category: 'location' },
    { id: 'beach-nearby', name: 'Beach Nearby', category: 'location' },
    { id: 'restaurants-walking', name: 'Restaurants Walking Distance', category: 'dining' }
  ]

  return (
    <Box>
      <Box fontSize="1.125rem" fontWeight="600" marginBottom="1rem">
        What's important to you?
      </Box>
      <SelectionPicker
        data={preferences}
        idAccessor={(pref) => pref.id}
        labelAccessor={(pref) => pref.name}
        value={selectedPreferences}
        onChange={setSelectedPreferences}
        isMultiSelect={true}
      />
    </Box>
  )
}
```

### Property Amenities Management
```tsx
function PropertyAmenitiesManager() {
  const amenityCategories = {
    essential: ['Wi-Fi', 'Air Conditioning', 'Heating'],
    kitchen: ['Full Kitchen', 'Microwave', 'Coffee Maker', 'Dishwasher'],
    entertainment: ['TV', 'Sound System', 'Game Console'],
    outdoor: ['Swimming Pool', 'Garden', 'BBQ Area', 'Balcony']
  }

  return (
    <Box display="grid" gap="2rem">
      {Object.entries(amenityCategories).map(([category, amenities]) => (
        <Box key={category}>
          <Box fontSize="1rem" fontWeight="600" marginBottom="0.75rem" textTransform="capitalize">
            {category} Amenities
          </Box>
          <SelectionPicker
            data={amenities.map(name => ({ id: name.toLowerCase().replace(/\s+/g, '-'), name }))}
            idAccessor={(amenity) => amenity.id}
            labelAccessor={(amenity) => amenity.name}
            value={selectedAmenities[category] || []}
            onChange={(value) => setSelectedAmenities(prev => ({
              ...prev,
              [category]: value
            }))}
            isMultiSelect={true}
            gap="0.5rem"
          />
        </Box>
      ))}
    </Box>
  )
}
```

## Best Practices

### 1. Data Structure Consistency
```tsx
// ✅ Good - Consistent data structure
interface SelectableItem {
  id: string
  name: string
  description?: string
  available: boolean
}

// ❌ Avoid - Inconsistent or unclear structure
const mixedData = ['item1', { id: 2, title: 'Item 2' }, 'item3']
```

### 2. Value Management
```tsx
// ✅ Good - Clear value type handling
const [singleSelection, setSingleSelection] = useState<string | null>(null)
const [multiSelection, setMultiSelection] = useState<string[]>([])

// ❌ Avoid - Unclear or mixed value types
const [selection, setSelection] = useState<any>(null)
```

### 3. Disabled State Logic
```tsx
// ✅ Good - Clear disabled logic
<SelectionPicker
  data={rooms}
  isItemDisabled={(room) => !room.available || room.maintenanceMode}
  disabled={isFormSubmitting}
/>

// ❌ Avoid - Complex disabled logic in render
<SelectionPicker
  data={rooms.filter(room => room.available && !room.maintenanceMode)}
/>
```

### 4. Custom Rendering
```tsx
// ✅ Good - Semantic and accessible custom rendering
const renderRoom = (room: Room, isSelected: boolean) => (
  <Box role="option" aria-selected={isSelected}>
    <Box fontWeight={isSelected ? '600' : '400'}>
      {room.name}
    </Box>
    <Box fontSize="0.875rem" color="#6b7280">
      {room.capacity} guests • AED {room.price}/night
    </Box>
  </Box>
)

// ❌ Avoid - Non-accessible or unclear rendering
const renderRoom = (room: Room) => <div>{room.name}</div>
```

## Related Components

- **Box**: Provides the underlying layout and responsive capabilities
- **SlidingDrawer**: Can contain SelectionPicker for mobile-friendly selection
- **Input**: Complementary form input component
- **DatePicker**: Specialized selection for dates

The SelectionPicker component provides flexible and accessible selection capabilities essential for property rental interfaces, from amenity selection to room type choices.