# TimePicker Component

The TimePicker component is a sophisticated time selection interface designed for the Wezo.ae property rental platform. It provides an elegant sliding drawer interface with customizable time intervals, support for both 12-hour and 24-hour formats, and smooth scrolling selection wheels.

## Overview

The TimePicker component renders as an input field that opens a sliding drawer when clicked. The drawer contains scrollable time selection wheels with automatic centering, visual preview of selected time, and smooth animations. It's perfect for booking times, check-in/check-out schedules, and appointment selections.

## Props Interface

```typescript
interface TimePickerProps {
    // Value management
    value?: string;                    // Current time in ISO 8601 format
    defaultValue?: string;             // Default time in ISO 8601 format
    onChange: (value: string) => void; // Callback when time changes
    
    // UI customization
    placeholder?: string;              // Placeholder text for input
    label?: string;                   // Label for the input field
    disabled?: boolean;               // Whether input is disabled
    required?: boolean;               // Whether field is required
    
    // Time format options
    use12HourFormat?: boolean;        // Use 12-hour format (default: false)
    interval?: number;                // Time interval in minutes (default: 15)
}
```

## Key Features

### 🕐 Flexible Time Formats
- **24-Hour Format**: Default format with hours 00-23
- **12-Hour Format**: Hours 1-12 with AM/PM selection
- **Format Switching**: Dynamic format changes with proper value conversion
- **ISO 8601 Output**: Standardized time format for backend integration

### ⏱️ Customizable Intervals
- **Minute Intervals**: Configurable minute increments (15, 30, 60 minutes)
- **Smart Rounding**: Automatically rounds existing times to nearest interval
- **Smooth Selection**: Optimized for common booking scenarios
- **Flexible Precision**: Adaptable to different use case requirements

### 🎨 Smooth Selection Interface
- **Scrollable Wheels**: iOS-style time picker with smooth scrolling
- **Auto-Centering**: Selected values automatically scroll into view
- **Visual Feedback**: Real-time preview of selected time
- **Snap-to-Grid**: CSS scroll snap for precise selection alignment

### 📱 Mobile-Optimized Design
- **Touch-Friendly**: Large touch targets and smooth scrolling
- **Responsive Layout**: Adapts to different screen sizes
- **Slide-Up Drawer**: Native mobile interaction pattern
- **Accessibility**: Full keyboard and screen reader support

### 🔧 Advanced State Management
- **Drawer Manager**: Sophisticated portal and z-index management
- **State Persistence**: Maintains selection during drawer interactions
- **Error Handling**: Robust validation and error recovery
- **Performance Optimized**: Efficient rendering and minimal re-renders

## Time Format Handling

### 24-Hour Format (Default)
```typescript
// Input: "2024-03-15T14:30:00.000Z"
// Display: "14:30"
// Selection: Hours 00-23, Minutes based on interval

<TimePicker
  value={timeValue}
  onChange={setTimeValue}
  use12HourFormat={false}
  interval={15}
/>
```

### 12-Hour Format
```typescript
// Input: "2024-03-15T14:30:00.000Z" 
// Display: "2:30 PM"
// Selection: Hours 1-12, Minutes based on interval, AM/PM

<TimePicker
  value={timeValue}
  onChange={setTimeValue}
  use12HourFormat={true}
  interval={30}
/>
```

## Usage Examples

### Basic Booking Time Selection

```tsx
import TimePicker from '@/components/base/TimePicker'

function BookingTimeForm() {
  const [checkInTime, setCheckInTime] = useState<string>('')
  const [checkOutTime, setCheckOutTime] = useState<string>('')

  return (
    <Box display="flex" flexDirection="column" gap="1.5rem">
      <TimePicker
        label="Check-in Time"
        value={checkInTime}
        onChange={setCheckInTime}
        placeholder="Select check-in time"
        use12HourFormat={true}
        interval={30}
        required
      />
      
      <TimePicker
        label="Check-out Time"
        value={checkOutTime}
        onChange={setCheckOutTime}
        placeholder="Select check-out time"
        use12HourFormat={true}
        interval={30}
        required
      />
    </Box>
  )
}
```

### Property Service Scheduling

```tsx
function PropertyServiceScheduler() {
  const [maintenanceTime, setMaintenanceTime] = useState<string>('')
  const [cleaningTime, setCleaningTime] = useState<string>('')
  const [inspectionTime, setInspectionTime] = useState<string>('')

  return (
    <Box as="form" display="flex" flexDirection="column" gap="2rem">
      <Box>
        <Box fontSize="1.25rem" fontWeight="600" marginBottom="1rem">
          Schedule Property Services
        </Box>
        <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
          Select preferred times for property maintenance and services
        </Box>
      </Box>

      <Box display="grid" gridTemplateColumns="1fr" gridTemplateColumnsMd="1fr 1fr" gap="1.5rem">
        <TimePicker
          label="Maintenance Window Start"
          value={maintenanceTime}
          onChange={setMaintenanceTime}
          placeholder="e.g., 9:00 AM"
          use12HourFormat={true}
          interval={60}
        />
        
        <TimePicker
          label="Cleaning Service Time"
          value={cleaningTime}
          onChange={setCleaningTime}
          placeholder="e.g., 2:00 PM"
          use12HourFormat={true}
          interval={30}
        />
      </Box>

      <TimePicker
        label="Property Inspection"
        value={inspectionTime}
        onChange={setInspectionTime}
        placeholder="Select inspection time"
        use12HourFormat={false}
        interval={15}
      />
    </Box>
  )
}
```

### Guest Communication Hours

```tsx
function GuestCommunicationSettings() {
  const [availableFromTime, setAvailableFromTime] = useState<string>('')
  const [availableToTime, setAvailableToTime] = useState<string>('')
  const [emergencyContactTime, setEmergencyContactTime] = useState<string>('')

  return (
    <Box padding="1.5rem" backgroundColor="white" borderRadius="0.75rem" border="1px solid #e5e7eb">
      <Box fontSize="1.125rem" fontWeight="600" marginBottom="1rem">
        Host Availability Hours
      </Box>
      <Box fontSize="0.875rem" color="#6b7280" marginBottom="1.5rem">
        Set your preferred hours for guest communication and support
      </Box>

      <Box display="grid" gap="1.5rem">
        <Box>
          <Box fontSize="1rem" fontWeight="500" marginBottom="1rem">
            Regular Support Hours
          </Box>
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem">
            <TimePicker
              label="Available From"
              value={availableFromTime}
              onChange={setAvailableFromTime}
              placeholder="Start time"
              use12HourFormat={true}
              interval={30}
            />
            <TimePicker
              label="Available Until"
              value={availableToTime}
              onChange={setAvailableToTime}
              placeholder="End time"
              use12HourFormat={true}
              interval={30}
            />
          </Box>
        </Box>

        <TimePicker
          label="Emergency Contact Cutoff"
          value={emergencyContactTime}
          onChange={setEmergencyContactTime}
          placeholder="Latest emergency contact time"
          use12HourFormat={true}
          interval={15}
        />
      </Box>
    </Box>
  )
}
```

### Event Booking System

```tsx
function EventBookingForm() {
  const [eventStartTime, setEventStartTime] = useState<string>('')
  const [eventEndTime, setEventEndTime] = useState<string>('')
  const [setupTime, setSetupTime] = useState<string>('')
  const [cleanupTime, setCleanupTime] = useState<string>('')

  // Calculate duration
  const calculateDuration = () => {
    if (!eventStartTime || !eventEndTime) return ''
    
    const start = new Date(eventStartTime)
    const end = new Date(eventEndTime)
    const diffMs = end.getTime() - start.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${diffHours}h ${diffMinutes}m`
  }

  return (
    <Box as="form" display="flex" flexDirection="column" gap="2rem">
      <Box>
        <Box fontSize="1.5rem" fontWeight="600" marginBottom="0.5rem">
          Villa Event Booking
        </Box>
        <Box fontSize="1rem" color="#6b7280">
          Schedule your private event with setup and cleanup times
        </Box>
      </Box>

      {/* Main Event Times */}
      <Box 
        padding="1.5rem" 
        backgroundColor="#f8fafc" 
        borderRadius="0.75rem"
        border="1px solid #e2e8f0"
      >
        <Box fontSize="1.125rem" fontWeight="600" marginBottom="1rem">
          Event Schedule
        </Box>
        
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem" marginBottom="1rem">
          <TimePicker
            label="Event Start Time"
            value={eventStartTime}
            onChange={setEventStartTime}
            placeholder="When does your event start?"
            use12HourFormat={true}
            interval={15}
            required
          />
          
          <TimePicker
            label="Event End Time"
            value={eventEndTime}
            onChange={setEventEndTime}
            placeholder="When does your event end?"
            use12HourFormat={true}
            interval={15}
            required
          />
        </Box>

        {eventStartTime && eventEndTime && (
          <Box 
            padding="0.75rem 1rem"
            backgroundColor="white"
            borderRadius="0.5rem"
            border="1px solid #d1d5db"
          >
            <Box fontSize="0.875rem" color="#6b7280">Event Duration</Box>
            <Box fontSize="1.125rem" fontWeight="600" color="#059669">
              {calculateDuration()}
            </Box>
          </Box>
        )}
      </Box>

      {/* Setup and Cleanup */}
      <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1.5rem">
        <Box 
          padding="1rem" 
          backgroundColor="white" 
          borderRadius="0.5rem"
          border="1px solid #e5e7eb"
        >
          <TimePicker
            label="Setup Start Time"
            value={setupTime}
            onChange={setSetupTime}
            placeholder="When can setup begin?"
            use12HourFormat={true}
            interval={30}
          />
          <Box fontSize="0.75rem" color="#6b7280" marginTop="0.5rem">
            Setup typically requires 1-2 hours before event start
          </Box>
        </Box>

        <Box 
          padding="1rem" 
          backgroundColor="white" 
          borderRadius="0.5rem"
          border="1px solid #e5e7eb"
        >
          <TimePicker
            label="Cleanup Complete By"
            value={cleanupTime}
            onChange={setCleanupTime}
            placeholder="Cleanup deadline"
            use12HourFormat={true}
            interval={30}
          />
          <Box fontSize="0.75rem" color="#6b7280" marginTop="0.5rem">
            All cleanup must be completed by this time
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
```

## Interval Configuration

### Common Interval Settings

```tsx
// 15-minute intervals (default) - Good for general bookings
<TimePicker interval={15} /> // 9:00, 9:15, 9:30, 9:45, 10:00...

// 30-minute intervals - Common for appointments  
<TimePicker interval={30} /> // 9:00, 9:30, 10:00, 10:30...

// 60-minute intervals - For hourly bookings
<TimePicker interval={60} /> // 9:00, 10:00, 11:00, 12:00...

// 5-minute intervals - Precise scheduling
<TimePicker interval={5} />  // 9:00, 9:05, 9:10, 9:15...
```

### Dynamic Interval Based on Context

```tsx
function DynamicIntervalTimePicker() {
  const [bookingType, setBookingType] = useState('standard')
  const [appointmentTime, setAppointmentTime] = useState('')

  const getInterval = () => {
    switch (bookingType) {
      case 'hourly': return 60
      case 'precise': return 5  
      case 'standard': return 15
      case 'halfhour': return 30
      default: return 15
    }
  }

  return (
    <Box display="flex" flexDirection="column" gap="1rem">
      <Box>
        <Box fontSize="1rem" fontWeight="500" marginBottom="0.5rem">
          Booking Type
        </Box>
        <Box as="select" 
          value={bookingType} 
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setBookingType(e.target.value)}
          padding="0.5rem"
          border="1px solid #d1d5db"
          borderRadius="0.375rem"
        >
          <option value="standard">Standard (15 min)</option>
          <option value="halfhour">Half Hour (30 min)</option>
          <option value="hourly">Hourly (60 min)</option>
          <option value="precise">Precise (5 min)</option>
        </Box>
      </Box>

      <TimePicker
        label="Appointment Time"
        value={appointmentTime}
        onChange={setAppointmentTime}
        interval={getInterval()}
        use12HourFormat={true}
      />
    </Box>
  )
}
```

## Advanced Usage Patterns

### Time Range Validation

```tsx
function TimeRangeValidator() {
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (startTime && endTime) {
      const start = new Date(startTime)
      const end = new Date(endTime)
      
      if (end <= start) {
        setError('End time must be after start time')
      } else if ((end.getTime() - start.getTime()) < (30 * 60 * 1000)) {
        setError('Minimum booking duration is 30 minutes')
      } else {
        setError('')
      }
    }
  }, [startTime, endTime])

  return (
    <Box display="flex" flexDirection="column" gap="1rem">
      <TimePicker
        label="Start Time"
        value={startTime}
        onChange={setStartTime}
        use12HourFormat={true}
        interval={15}
      />
      
      <TimePicker
        label="End Time"
        value={endTime}
        onChange={setEndTime}
        use12HourFormat={true}
        interval={15}
      />
      
      {error && (
        <Box color="#dc2626" fontSize="0.875rem" padding="0.5rem" backgroundColor="#fef2f2" borderRadius="0.375rem">
          {error}
        </Box>
      )}
    </Box>
  )
}
```

### Business Hours Constraints

```tsx
function BusinessHoursTimePicker() {
  const [selectedTime, setSelectedTime] = useState('')
  
  const businessHours = {
    start: 9,  // 9 AM
    end: 17    // 5 PM
  }

  const isWithinBusinessHours = (time: string) => {
    if (!time) return true
    
    const date = new Date(time)
    const hour = date.getHours()
    return hour >= businessHours.start && hour < businessHours.end
  }

  const handleTimeChange = (time: string) => {
    if (isWithinBusinessHours(time)) {
      setSelectedTime(time)
    } else {
      // Could show a warning or adjust to nearest business hour
      alert('Please select a time during business hours (9 AM - 5 PM)')
    }
  }

  return (
    <Box>
      <TimePicker
        label="Meeting Time"
        value={selectedTime}
        onChange={handleTimeChange}
        use12HourFormat={true}
        interval={30}
      />
      
      <Box fontSize="0.75rem" color="#6b7280" marginTop="0.5rem">
        Business hours: 9:00 AM - 5:00 PM
      </Box>
    </Box>
  )
}
```

## Styling and Customization

### Input Field Styling
The TimePicker input inherits standard form input styling:
- Border radius: 0.375rem (6px)
- Padding: 0.75rem (12px)
- Border color: #d1d5db (hover: #3182ce)
- Background: white (disabled: #f9fafb)

### Drawer Styling
The selection drawer features:
- Bottom slide animation with smooth easing
- Rounded top corners for modern appearance  
- Time preview with large monospace font
- Scrollable selection wheels with snap behavior

### Custom Styling Example

```tsx
// Custom styled TimePicker wrapper
function StyledTimePicker({ ...props }) {
  return (
    <Box 
      className="custom-time-picker"
      // Add custom CSS classes for advanced styling
    >
      <TimePicker {...props} />
      
      <style jsx>{`
        .custom-time-picker [data-drawer] {
          backdrop-filter: blur(8px);
        }
        
        .custom-time-picker [data-time-preview] {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
      `}</style>
    </Box>
  )
}
```

## Integration with Property Rental Features

### Villa Booking Check-in Times
```tsx
function VillaCheckInScheduler() {
  const [checkInTime, setCheckInTime] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')

  return (
    <Box>
      <Box fontSize="1.125rem" fontWeight="600" marginBottom="1rem">
        Preferred Check-in Time
      </Box>
      
      <TimePicker
        label="Check-in Time"
        value={checkInTime}
        onChange={setCheckInTime}
        placeholder="Standard check-in: 3:00 PM"
        use12HourFormat={true}
        interval={30}
      />
      
      <Box fontSize="0.875rem" color="#6b7280" marginTop="0.5rem" marginBottom="1rem">
        Standard check-in is at 3:00 PM. Early check-in may be available upon request.
      </Box>
      
      {checkInTime && (
        <Box padding="1rem" backgroundColor="#f0f9ff" borderRadius="0.5rem" border="1px solid #0ea5e9">
          <Box fontSize="0.875rem" color="#0369a1">
            <strong>Note:</strong> Check-in before 3:00 PM may incur additional fees. 
            Our concierge will contact you to arrange early access.
          </Box>
        </Box>
      )}
    </Box>
  )
}
```

### Property Service Coordination
```tsx
function PropertyServiceCoordination() {
  const [cleaningTime, setCleaningTime] = useState('')
  const [maintenanceTime, setMaintenanceTime] = useState('')
  const [guestCheckOut, setGuestCheckOut] = useState('')

  return (
    <Box display="flex" flexDirection="column" gap="2rem">
      <Box>
        <Box fontSize="1.25rem" fontWeight="600" marginBottom="0.5rem">
          Service Coordination Schedule
        </Box>
        <Box fontSize="1rem" color="#6b7280">
          Coordinate cleaning and maintenance around guest bookings
        </Box>
      </Box>

      <Box display="grid" gridTemplateColumns="1fr" gridTemplateColumnsLg="repeat(3, 1fr)" gap="1.5rem">
        <TimePicker
          label="Guest Check-out"
          value={guestCheckOut}
          onChange={setGuestCheckOut}
          use12HourFormat={true}
          interval={30}
        />
        
        <TimePicker
          label="Cleaning Start"
          value={cleaningTime}
          onChange={setCleaningTime}
          use12HourFormat={true}
          interval={15}
        />
        
        <TimePicker
          label="Maintenance Window"
          value={maintenanceTime}
          onChange={setMaintenanceTime}
          use12HourFormat={true}
          interval={60}
        />
      </Box>
    </Box>
  )
}
```

## Accessibility Features

### Keyboard Navigation
- **Tab Access**: Input field is fully keyboard accessible
- **Enter/Space**: Opens time selection drawer
- **Escape**: Closes drawer (inherited from SlidingDrawer)
- **Focus Management**: Automatic focus handling in drawer

### Screen Reader Support
- **ARIA Labels**: Proper labeling for time selection wheels
- **Live Regions**: Time preview updates announced to screen readers  
- **Semantic Structure**: Clear hierarchy and relationships
- **Value Announcements**: Selected time values properly announced

### Visual Accessibility
- **High Contrast**: Sufficient contrast ratios for all text
- **Focus Indicators**: Clear visual focus states
- **Large Touch Targets**: Minimum 44px touch areas for mobile
- **Clear Typography**: Readable fonts with appropriate sizing

## Performance Considerations

### Optimization Features
- **Lazy Rendering**: Drawer content only renders when opened
- **Smooth Scrolling**: Hardware-accelerated CSS transforms
- **Efficient Updates**: Minimal re-renders with proper memoization
- **Portal Management**: Sophisticated z-index and overlay handling

### Memory Management
- **Event Cleanup**: Automatic removal of scroll event listeners
- **Component Unmounting**: Proper cleanup of refs and timers
- **State Optimization**: Minimal state updates during scrolling

## Related Components

- **Box**: Provides underlying layout capabilities for time picker UI
- **SlidingDrawer**: Container for time selection interface
- **SelectionPicker**: Time value selection wheels
- **DatePicker**: Complementary date selection component

The TimePicker component provides sophisticated time selection capabilities essential for property rental booking flows, service scheduling, and guest coordination interfaces.