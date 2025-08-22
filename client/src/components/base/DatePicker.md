# DatePicker Component

The DatePicker component provides a comprehensive date selection interface for the Wezo.ae property rental platform. It features an intuitive input field that opens a sliding drawer with a full calendar interface, supporting month/year navigation and date constraints.

## Overview

The DatePicker is designed for property rental scenarios where users need to select dates for bookings, availability, or property management. It provides a mobile-first approach with touch-friendly interactions and accessibility features.

## Props Interface

```typescript
interface DatePickerProps {
  /**
   * Current date value in ISO 8601 format (e.g., "2025-08-16T15:14:01.000Z")
   */
  value?: string
  
  /**
   * Default date value in ISO 8601 format
   */
  defaultValue?: string
  
  /**
   * Callback when date changes
   */
  onChange: (value: string) => void
  
  /**
   * Placeholder text for the input
   */
  placeholder?: string
  
  /**
   * Whether the input is disabled
   */
  disabled?: boolean
  
  /**
   * Whether the input is required
   */
  required?: boolean
  
  /**
   * Custom label for the input
   */
  label?: string
  
  /**
   * Minimum selectable date in ISO format
   */
  minDate?: string
  
  /**
   * Maximum selectable date in ISO format
   */
  maxDate?: string
}
```

## Key Features

### 📅 Calendar Interface
- **Full Calendar Grid**: 6-week view showing previous/next month dates
- **Month Navigation**: Arrow buttons to navigate between months
- **Year Selection**: Click year to open year picker with quick navigation
- **Today Highlighting**: Current date is visually distinguished

### 📱 Mobile-Optimized
- **Sliding Drawer**: Opens from bottom for better mobile experience
- **Touch-Friendly**: Large touch targets for easy interaction
- **Gesture Support**: Supports keyboard navigation and screen readers

### 🎯 Date Constraints
- **Min/Max Dates**: Restrict selectable date ranges
- **Disabled States**: Visual feedback for unavailable dates
- **Validation**: Built-in date validation and formatting

### ♿ Accessibility
- **Keyboard Navigation**: Full keyboard support with Enter/Space
- **ARIA Labels**: Proper labeling for screen readers
- **Focus Management**: Logical tab order and focus states

## Usage Examples

### Basic Date Selection

```tsx
import DatePicker from '@/components/base/DatePicker'

function BookingForm() {
  const [checkInDate, setCheckInDate] = useState<string>('')

  return (
    <DatePicker
      label="Check-in Date"
      value={checkInDate}
      onChange={setCheckInDate}
      placeholder="Select check-in date"
      required
    />
  )
}
```

### Date Range Restrictions

```tsx
function PropertyAvailability() {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const today = new Date().toISOString()
  const maxDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()

  return (
    <DatePicker
      label="Available Date"
      value={selectedDate}
      onChange={setSelectedDate}
      minDate={today}
      maxDate={maxDate}
      placeholder="Select availability date"
    />
  )
}
```

### Disabled State

```tsx
function ReadOnlyBooking() {
  return (
    <DatePicker
      label="Booking Date"
      value="2025-12-25T00:00:00.000Z"
      onChange={() => {}} // No-op since disabled
      disabled
      placeholder="Date locked"
    />
  )
}
```

## Implementation Details

### State Management
The DatePicker uses several internal state pieces:
- **viewDate**: Controls which month/year is currently displayed
- **selectedDate**: Tracks the user's selection before confirmation
- **drawerManager**: Manages multiple sliding drawer states

### Date Handling
- **ISO Format**: All dates are handled in ISO 8601 format internally
- **Display Format**: Shown to users in localized format (e.g., "January 15, 2025")
- **Timezone**: Works with local timezone, converts to ISO for storage

### Calendar Generation
```typescript
const generateCalendarDays = () => {
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  // Generate 42 days (6 weeks × 7 days) for complete calendar grid
  const days: Date[] = []
  const current = new Date(startDate)
  
  for (let i = 0; i < 42; i++) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  
  return days
}
```

### Drawer Architecture
The DatePicker uses two sliding drawers:
1. **Main Calendar Drawer**: Primary date selection interface
2. **Year Picker Drawer**: Secondary drawer for year selection

## Styling and Theming

### Visual States
- **Default**: Clean white background with subtle border
- **Hover**: Blue border highlight on hover
- **Focus**: Blue border with subtle shadow
- **Selected**: Blue background for selected dates
- **Today**: Blue border outline for current date
- **Disabled**: Grayed out with reduced opacity

### Responsive Design
- **Mobile**: Full-width drawer from bottom
- **Desktop**: Optimized for mouse interactions
- **Touch**: Larger touch targets for mobile devices

## Integration with Property Rental Features

### Booking Scenarios
```tsx
// Check-in/Check-out Date Selection
function BookingDates() {
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')

  return (
    <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem">
      <DatePicker
        label="Check-in"
        value={checkIn}
        onChange={setCheckIn}
        minDate={new Date().toISOString()}
      />
      <DatePicker
        label="Check-out"
        value={checkOut}
        onChange={setCheckOut}
        minDate={checkIn || new Date().toISOString()}
      />
    </Box>
  )
}
```

### Availability Management
```tsx
// Property Availability Settings
function AvailabilityCalendar() {
  const [availableFrom, setAvailableFrom] = useState('')
  const [availableUntil, setAvailableUntil] = useState('')

  return (
    <Box>
      <DatePicker
        label="Available From"
        value={availableFrom}
        onChange={setAvailableFrom}
        placeholder="Start of availability period"
      />
      <DatePicker
        label="Available Until"
        value={availableUntil}
        onChange={setAvailableUntil}
        minDate={availableFrom}
        placeholder="End of availability period"
      />
    </Box>
  )
}
```

## Best Practices

### 1. Date Validation
Always validate date ranges and provide clear feedback:

```tsx
const validateDates = (checkIn: string, checkOut: string) => {
  if (!checkIn || !checkOut) return { isValid: false, message: 'Both dates required' }
  if (new Date(checkOut) <= new Date(checkIn)) {
    return { isValid: false, message: 'Check-out must be after check-in' }
  }
  return { isValid: true }
}
```

### 2. User Experience
- Provide clear labels and placeholders
- Set appropriate min/max date constraints
- Use required prop for mandatory fields
- Consider default values for better UX

### 3. Error Handling
```tsx
function DatePickerWithValidation() {
  const [date, setDate] = useState('')
  const [error, setError] = useState('')

  const handleDateChange = (value: string) => {
    setDate(value)
    setError('') // Clear error on change
    
    // Custom validation
    if (new Date(value) < new Date()) {
      setError('Please select a future date')
    }
  }

  return (
    <>
      <DatePicker
        value={date}
        onChange={handleDateChange}
        label="Future Date"
        minDate={new Date().toISOString()}
      />
      {error && <Box color="red" fontSize="0.875rem">{error}</Box>}
    </>
  )
}
```

### 4. Performance Considerations
- The component generates calendar days dynamically
- Year picker includes 60 years by default (customizable)
- Drawer state is managed efficiently to prevent memory leaks

## Accessibility Features

### Keyboard Support
- **Tab**: Navigate between interactive elements
- **Enter/Space**: Open calendar, select dates, confirm selection
- **Escape**: Close drawers (handled by SlidingDrawer)
- **Arrow Keys**: Navigate calendar grid (planned enhancement)

### Screen Reader Support
- Semantic HTML structure with proper roles
- Descriptive labels for all interactive elements
- Date announcements in accessible format
- Status updates for selection changes

## Related Components

- **SlidingDrawer**: Provides the drawer functionality
- **SelectionPicker**: Used for year selection
- **Box**: Base component for layout and styling

The DatePicker component provides a robust, accessible, and user-friendly date selection experience optimized for property rental workflows and mobile-first design principles.