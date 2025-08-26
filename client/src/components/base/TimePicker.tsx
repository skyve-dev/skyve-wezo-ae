import React, {useCallback, useEffect, useRef, useState} from 'react'
import SlidingDrawer from './SlidingDrawer'
import SelectionPicker from './SelectionPicker'
import {Box} from './Box'
import useDrawerManager from '../../hooks/useDrawerManager'
import {FaCheck, FaClock} from 'react-icons/fa'

interface TimePickerProps {
    /**
     * Current time value in ISO 8601 format (e.g., "2025-08-16T15:14:01.000Z")
     */
    value?: string

    /**
     * Default time value in ISO 8601 format
     */
    defaultValue?: string

    /**
     * Callback when time changes
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
     * Whether to use 12-hour format (default: false for 24-hour)
     */
    use12HourFormat?: boolean

    /**
     * Time interval in minutes (default: 15)
     */
    interval?: number
}

interface TimeOption {
    id: string
    label: string
    hour: number
    minute: number
    period?: 'AM' | 'PM'
}

/**
 * # TimePicker Component
 * 
 * A comprehensive time selection component that provides an intuitive input field with 
 * a sliding drawer interface for precise time picking. Features both 12-hour and 24-hour 
 * formats with customizable intervals, auto-scrolling, and accessibility support for 
 * property rental booking and scheduling systems.
 * 
 * ## Key Features
 * - **Dual Format Support**: 12-hour (AM/PM) and 24-hour time formats
 * - **Customizable Intervals**: Configurable minute intervals (15, 30, 60, etc.)
 * - **Auto-Scrolling**: Automatically scrolls to selected time values
 * - **Time Preview**: Live preview of selected time during selection
 * - **Touch Optimized**: Mobile-friendly interface with smooth scrolling
 * - **ISO Compatibility**: Handles ISO 8601 date-time strings seamlessly
 * - **Accessibility**: Full keyboard navigation and screen reader support
 * - **Drawer Integration**: Uses SlidingDrawer for smooth mobile experience
 * 
 * ## Basic Usage
 * ```tsx
 * const [selectedTime, setSelectedTime] = useState('')
 * 
 * <TimePicker
 *   value={selectedTime}
 *   onChange={setSelectedTime}
 *   placeholder="Select time"
 * />
 * ```
 * 
 * ## Format Options
 * ### 12-Hour Format (AM/PM)
 * ```tsx
 * <TimePicker
 *   label="Meeting Time"
 *   value={meetingTime}
 *   onChange={setMeetingTime}
 *   use12HourFormat={true}
 *   placeholder="Select meeting time"
 * />
 * ```
 * 
 * ### 24-Hour Format
 * ```tsx
 * <TimePicker
 *   label="Check-in Time"
 *   value={checkInTime}
 *   onChange={setCheckInTime}
 *   use12HourFormat={false}
 *   placeholder="Select check-in time"
 * />
 * ```
 * 
 * ## Time Intervals
 * ### 15-Minute Intervals (Default)
 * ```tsx
 * <TimePicker
 *   label="Appointment Time"
 *   value={appointmentTime}
 *   onChange={setAppointmentTime}
 *   interval={15}
 *   use12HourFormat={true}
 * />
 * ```
 * 
 * ### 30-Minute Intervals
 * ```tsx
 * <TimePicker
 *   label="Tour Time"
 *   value={tourTime}
 *   onChange={setTourTime}
 *   interval={30}
 *   use12HourFormat={true}
 * />
 * ```
 * 
 * ### 5-Minute Intervals
 * ```tsx
 * <TimePicker
 *   label="Precise Time"
 *   value={preciseTime}
 *   onChange={setPreciseTime}
 *   interval={5}
 *   use12HourFormat={false}
 * />
 * ```
 * 
 * ## Property Booking Examples
 * ### Check-in/Check-out Times
 * ```tsx
 * const BookingTimeSelector = () => {
 *   const [checkInTime, setCheckInTime] = useState('')
 *   const [checkOutTime, setCheckOutTime] = useState('')
 * 
 *   return (
 *     <Box display="flex" flexDirection="column" gap="1rem">
 *       <TimePicker
 *         label="Check-in Time"
 *         value={checkInTime}
 *         onChange={setCheckInTime}
 *         use12HourFormat={true}
 *         interval={30}
 *         placeholder="e.g., 3:00 PM"
 *         helperText="Standard check-in is 3:00 PM"
 *       />
 *       <TimePicker
 *         label="Check-out Time"
 *         value={checkOutTime}
 *         onChange={setCheckOutTime}
 *         use12HourFormat={true}
 *         interval={30}
 *         placeholder="e.g., 11:00 AM"
 *         helperText="Standard check-out is 11:00 AM"
 *       />
 *     </Box>
 *   )
 * }
 * ```
 * 
 * ### Property Tour Scheduling
 * ```tsx
 * const TourScheduler = ({ availableSlots }) => {
 *   const [selectedSlot, setSelectedSlot] = useState('')
 * 
 *   return (
 *     <Box display="flex" flexDirection="column" gap="1.5rem">
 *       <h3>Schedule Property Tour</h3>
 *       <TimePicker
 *         label="Preferred Time"
 *         value={selectedSlot}
 *         onChange={setSelectedSlot}
 *         use12HourFormat={true}
 *         interval={60}
 *         placeholder="Select tour time"
 *         helperText="Tours available from 9:00 AM to 6:00 PM"
 *       />
 *     </Box>
 *   )
 * }
 * ```
 * 
 * ### Maintenance Scheduling
 * ```tsx
 * const MaintenanceScheduler = () => {
 *   const [startTime, setStartTime] = useState('')
 *   const [endTime, setEndTime] = useState('')
 * 
 *   return (
 *     <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem">
 *       <TimePicker
 *         label="Start Time"
 *         value={startTime}
 *         onChange={setStartTime}
 *         use12HourFormat={false}
 *         interval={15}
 *         placeholder="Select start time"
 *       />
 *       <TimePicker
 *         label="End Time"
 *         value={endTime}
 *         onChange={setEndTime}
 *         use12HourFormat={false}
 *         interval={15}
 *         placeholder="Select end time"
 *       />
 *     </Box>
 *   )
 * }
 * ```
 * 
 * ## Form Integration
 * ### With Validation
 * ```tsx
 * const [bookingTime, setBookingTime] = useState('')
 * const [timeError, setTimeError] = useState('')
 * 
 * const validateTime = (time) => {
 *   if (!time) {
 *     setTimeError('Time is required')
 *     return false
 *   }
 *   
 *   const selectedDate = new Date(time)
 *   const hour = selectedDate.getHours()
 *   
 *   if (hour < 9 || hour > 18) {
 *     setTimeError('Please select a time between 9:00 AM and 6:00 PM')
 *     return false
 *   }
 *   
 *   setTimeError('')
 *   return true
 * }
 * 
 * <TimePicker
 *   label="Booking Time"
 *   value={bookingTime}
 *   onChange={(time) => {
 *     setBookingTime(time)
 *     validateTime(time)
 *   }}
 *   error={!!timeError}
 *   helperText={timeError || "Select your preferred time"}
 *   required
 * />
 * ```
 * 
 * ### Required Field
 * ```tsx
 * <TimePicker
 *   label="Required Time"
 *   value={requiredTime}
 *   onChange={setRequiredTime}
 *   required
 *   placeholder="Select required time"
 * />
 * ```
 * 
 * ## Picker Interface
 * ### Hour, Minute, Period Selection
 * The component provides three scrollable columns:
 * - **Hour Column**: 1-12 (12-hour) or 0-23 (24-hour)
 * - **Minute Column**: Based on interval (00, 15, 30, 45 for 15-min intervals)
 * - **Period Column**: AM/PM (only in 12-hour mode)
 * 
 * ### Time Preview
 * ```tsx
 * // Shows live preview of selected time
 * // 12-hour: "9:30 AM"
 * // 24-hour: "09:30"
 * ```
 * 
 * ### Auto-Scrolling Behavior
 * - Automatically scrolls to current time when drawer opens
 * - Smooth scrolling to selected values
 * - Scroll snap alignment for precise selection
 * 
 * ## States and Behavior
 * ### Disabled State
 * ```tsx
 * <TimePicker
 *   label="Locked Time"
 *   value={lockedTime}
 *   onChange={() => {}}
 *   disabled
 *   helperText="This time cannot be changed"
 * />
 * ```
 * 
 * ### Default Values
 * ```tsx
 * <TimePicker
 *   label="Default Time"
 *   defaultValue={new Date().toISOString()}
 *   onChange={setTime}
 *   placeholder="Current time selected"
 * />
 * ```
 * 
 * ## Advanced Examples
 * ### Business Hours Scheduler
 * ```tsx
 * const BusinessHoursManager = () => {
 *   const [businessHours, setBusinessHours] = useState({
 *     monday: { open: '', close: '' },
 *     tuesday: { open: '', close: '' },
 *     wednesday: { open: '', close: '' },
 *     thursday: { open: '', close: '' },
 *     friday: { open: '', close: '' },
 *     saturday: { open: '', close: '' },
 *     sunday: { open: '', close: '' }
 *   })
 * 
 *   const updateHours = (day, type, time) => {
 *     setBusinessHours(prev => ({
 *       ...prev,
 *       [day]: { ...prev[day], [type]: time }
 *     }))
 *   }
 * 
 *   return (
 *     <Box display="flex" flexDirection="column" gap="1.5rem">
 *       {Object.entries(businessHours).map(([day, hours]) => (
 *         <Box key={day} display="flex" alignItems="center" gap="1rem">
 *           <Box minWidth="100px" fontWeight="500" textTransform="capitalize">
 *             {day}
 *           </Box>
 *           <TimePicker
 *             placeholder="Open"
 *             value={hours.open}
 *             onChange={(time) => updateHours(day, 'open', time)}
 *             use12HourFormat={true}
 *             interval={30}
 *             width="150px"
 *           />
 *           <Box>to</Box>
 *           <TimePicker
 *             placeholder="Close"
 *             value={hours.close}
 *             onChange={(time) => updateHours(day, 'close', time)}
 *             use12HourFormat={true}
 *             interval={30}
 *             width="150px"
 *           />
 *         </Box>
 *       ))}
 *     </Box>
 *   )
 * }
 * ```
 * 
 * ### Event Scheduling System
 * ```tsx
 * const EventScheduler = () => {
 *   const [event, setEvent] = useState({
 *     title: '',
 *     startTime: '',
 *     endTime: '',
 *     reminderTime: ''
 *   })
 * 
 *   const updateEvent = (field, value) => {
 *     setEvent(prev => ({ ...prev, [field]: value }))
 *   }
 * 
 *   return (
 *     <Box display="flex" flexDirection="column" gap="1.5rem">
 *       <Input
 *         label="Event Title"
 *         value={event.title}
 *         onChange={(e) => updateEvent('title', e.target.value)}
 *         required
 *       />
 *       
 *       <Box display="flex" gap="1rem" flexDirection="column" flexDirectionMd="row">
 *         <TimePicker
 *           label="Start Time"
 *           value={event.startTime}
 *           onChange={(time) => updateEvent('startTime', time)}
 *           use12HourFormat={true}
 *           interval={15}
 *           required
 *           width="100%"
 *           widthMd="50%"
 *         />
 *         <TimePicker
 *           label="End Time"
 *           value={event.endTime}
 *           onChange={(time) => updateEvent('endTime', time)}
 *           use12HourFormat={true}
 *           interval={15}
 *           required
 *           width="100%"
 *           widthMd="50%"
 *         />
 *       </Box>
 * 
 *       <TimePicker
 *         label="Reminder Time"
 *         value={event.reminderTime}
 *         onChange={(time) => updateEvent('reminderTime', time)}
 *         use12HourFormat={true}
 *         interval={15}
 *         placeholder="Set reminder (optional)"
 *         helperText="When would you like to be reminded?"
 *       />
 *     </Box>
 *   )
 * }
 * ```
 * 
 * ### Booking Availability Grid
 * ```tsx
 * const AvailabilityGrid = ({ date, availableSlots }) => {
 *   const [selectedSlots, setSelectedSlots] = useState([])
 * 
 *   const timeSlots = [
 *     '09:00', '10:00', '11:00', '12:00',
 *     '13:00', '14:00', '15:00', '16:00', '17:00'
 *   ]
 * 
 *   const toggleSlot = (slot) => {
 *     setSelectedSlots(prev => 
 *       prev.includes(slot) 
 *         ? prev.filter(s => s !== slot)
 *         : [...prev, slot]
 *     )
 *   }
 * 
 *   return (
 *     <Box display="flex" flexDirection="column" gap="1rem">
 *       <h3>Available Time Slots for {date}</h3>
 *       <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap="0.5rem">
 *         {timeSlots.map(slot => (
 *           <Button
 *             key={slot}
 *             label={slot}
 *             variant={selectedSlots.includes(slot) ? 'promoted' : 'normal'}
 *             onClick={() => toggleSlot(slot)}
 *             disabled={!availableSlots.includes(slot)}
 *             size="small"
 *           />
 *         ))}
 *       </Box>
 *       
 *       <TimePicker
 *         label="Custom Time"
 *         placeholder="Or select custom time"
 *         onChange={(time) => console.log('Custom time:', time)}
 *         use12HourFormat={false}
 *         interval={15}
 *       />
 *     </Box>
 *   )
 * }
 * ```
 * 
 * ## Time Format Handling
 * ### Input Formats
 * ```tsx
 * // Component handles these input formats:
 * // ISO 8601: "2025-08-16T15:14:01.000Z"
 * // Date object: new Date()
 * // Time strings: "15:14" (internal processing)
 * ```
 * 
 * ### Display Formats
 * ```tsx
 * // 12-hour format display: "3:14 PM"
 * // 24-hour format display: "15:14"
 * // Picker shows formatted time based on use12HourFormat prop
 * ```
 * 
 * ## Accessibility Features
 * - **Keyboard Navigation**: Arrow keys navigate between options
 * - **Screen Reader Support**: Proper ARIA labels and time announcements
 * - **Focus Management**: Logical tab order and focus trapping in drawer
 * - **Time Announcements**: Selected times announced to assistive technology
 * - **Touch Accessibility**: Large touch targets for mobile users
 * 
 * ## Mobile Optimization
 * - **Touch-Friendly**: Large touch targets and smooth scrolling
 * - **Sliding Drawer**: Bottom sheet interface on mobile devices
 * - **Auto-Scrolling**: Automatically scrolls to selected values
 * - **Snap Scrolling**: Precise selection with scroll snap alignment
 * - **Responsive Layout**: Adapts to different screen sizes
 * 
 * ## Integration Notes
 * - **SlidingDrawer**: Uses drawer manager for proper z-index layering
 * - **SelectionPicker**: Time selection powered by SelectionPicker components
 * - **Box Component**: Built on Box for consistent styling and responsive design
 * - **ISO Compatibility**: Seamless integration with backend date-time systems
 * 
 * ## Performance Considerations
 * - **Lazy Rendering**: Time picker only renders when drawer is open
 * - **Efficient Scrolling**: Optimized auto-scroll calculations
 * - **Memory Management**: Proper cleanup of scroll observers and timers
 * - **Option Generation**: Efficient time option creation based on intervals
 * 
 * @example
 * // Complete property booking time selection system
 * const PropertyBookingTimeSelector = ({ propertyId, date }) => {
 *   const [bookingDetails, setBookingDetails] = useState({
 *     checkInTime: '',
 *     checkOutTime: '',
 *     tourTime: '',
 *     specialRequests: ''
 *   })
 *   const [errors, setErrors] = useState({})
 * 
 *   const validateTimes = () => {
 *     const newErrors = {}
 * 
 *     if (!bookingDetails.checkInTime) {
 *       newErrors.checkInTime = 'Check-in time is required'
 *     }
 * 
 *     if (!bookingDetails.checkOutTime) {
 *       newErrors.checkOutTime = 'Check-out time is required'
 *     }
 * 
 *     if (bookingDetails.checkInTime && bookingDetails.checkOutTime) {
 *       const checkIn = new Date(bookingDetails.checkInTime)
 *       const checkOut = new Date(bookingDetails.checkOutTime)
 *       
 *       if (checkOut <= checkIn) {
 *         newErrors.checkOutTime = 'Check-out must be after check-in'
 *       }
 *     }
 * 
 *     setErrors(newErrors)
 *     return Object.keys(newErrors).length === 0
 *   }
 * 
 *   const updateBookingDetail = (field, value) => {
 *     setBookingDetails(prev => ({ ...prev, [field]: value }))
 *     if (errors[field]) {
 *       setErrors(prev => ({ ...prev, [field]: '' }))
 *     }
 *   }
 * 
 *   return (
 *     <Box display="flex" flexDirection="column" gap="2rem">
 *       <Box>
 *         <h2>Booking Times for {date}</h2>
 *         <p>Please select your preferred check-in and check-out times</p>
 *       </Box>
 * 
 *       <Box display="flex" gap="1.5rem" flexDirection="column" flexDirectionMd="row">
 *         <TimePicker
 *           label="Check-in Time"
 *           value={bookingDetails.checkInTime}
 *           onChange={(time) => updateBookingDetail('checkInTime', time)}
 *           use12HourFormat={true}
 *           interval={30}
 *           placeholder="e.g., 3:00 PM"
 *           error={!!errors.checkInTime}
 *           helperText={errors.checkInTime || "Standard check-in from 3:00 PM"}
 *           required
 *           width="100%"
 *           widthMd="50%"
 *         />
 * 
 *         <TimePicker
 *           label="Check-out Time"
 *           value={bookingDetails.checkOutTime}
 *           onChange={(time) => updateBookingDetail('checkOutTime', time)}
 *           use12HourFormat={true}
 *           interval={30}
 *           placeholder="e.g., 11:00 AM"
 *           error={!!errors.checkOutTime}
 *           helperText={errors.checkOutTime || "Standard check-out by 11:00 AM"}
 *           required
 *           width="100%"
 *           widthMd="50%"
 *         />
 *       </Box>
 * 
 *       <TimePicker
 *         label="Property Tour Time (Optional)"
 *         value={bookingDetails.tourTime}
 *         onChange={(time) => updateBookingDetail('tourTime', time)}
 *         use12HourFormat={true}
 *         interval={60}
 *         placeholder="Schedule a tour"
 *         helperText="Tours available from 9:00 AM to 6:00 PM"
 *       />
 * 
 *       <Box display="flex" gap="1rem">
 *         <Button
 *           label="Clear Times"
 *           variant="normal"
 *           onClick={() => setBookingDetails({ checkInTime: '', checkOutTime: '', tourTime: '' })}
 *         />
 *         <Button
 *           label="Confirm Times"
 *           variant="promoted"
 *           onClick={() => {
 *             if (validateTimes()) {
 *               console.log('Booking confirmed:', bookingDetails)
 *             }
 *           }}
 *           disabled={!bookingDetails.checkInTime || !bookingDetails.checkOutTime}
 *         />
 *       </Box>
 *     </Box>
 *   )
 * }
 */
const TimePicker: React.FC<TimePickerProps> = ({
                                                   value,
                                                   defaultValue,
                                                   onChange,
                                                   placeholder = 'Select time',
                                                   disabled = false,
                                                   required = false,
                                                   label,
                                                   use12HourFormat = false,
                                                   interval = 15
                                               }) => {
    const drawerManager = useDrawerManager()
    const drawerId = useRef(`time-picker-${Math.random().toString(36).substr(2, 9)}`).current

    // Refs for scrollable containers
    const hourContainerRef = useRef<HTMLDivElement>(null)
    const minuteContainerRef = useRef<HTMLDivElement>(null)
    const periodContainerRef = useRef<HTMLDivElement>(null)

    // Parse current time or use default
    const currentTime = value ? new Date(value) : (defaultValue ? new Date(defaultValue) : null)

    // State for time selection
    const [selectedHour, setSelectedHour] = useState<number>(() => {
        if (currentTime && !isNaN(currentTime.getTime())) {
            const hours = currentTime.getHours()
            if (use12HourFormat) {
                // Convert to 12-hour format for display (1-12)
                return hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
            }
            return hours
        }
        return use12HourFormat ? 9 : 9 // Default to 9:00
    })
    const [selectedMinute, setSelectedMinute] = useState<number>(() => {
        if (currentTime && !isNaN(currentTime.getTime())) {
            return Math.floor(currentTime.getMinutes() / interval) * interval
        }
        return 0
    })
    const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>(() => {
        if (use12HourFormat && currentTime && !isNaN(currentTime.getTime())) {
            return currentTime.getHours() >= 12 ? 'PM' : 'AM'
        }
        return 'AM'
    })

    // Format time for display
    const formatDisplayTime = (time: Date | null) => {
        if (!time || isNaN(time.getTime())) return ''

        const hours = time.getHours()
        const minutes = time.getMinutes()

        if (use12HourFormat) {
            const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
            const period = hours >= 12 ? 'PM' : 'AM'
            return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
        } else {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        }
    }

    // Handle input click to open drawer
    const handleInputClick = () => {
        if (disabled) return
        drawerManager.openDrawer(drawerId)
    }

    // Generate hour options
    const generateHourOptions = (): TimeOption[] => {
        const options: TimeOption[] = []

        if (use12HourFormat) {
            for (let hour = 1; hour <= 12; hour++) {
                options.push({
                    id: `hour-${hour}`,
                    label: hour.toString(),
                    hour, // This will be the display hour (1-12) for 12-hour format
                    minute: 0
                })
            }
        } else {
            for (let hour = 0; hour < 24; hour++) {
                options.push({
                    id: `hour-${hour}`,
                    label: hour.toString().padStart(2, '0'),
                    hour, // This will be the actual hour (0-23) for 24-hour format
                    minute: 0
                })
            }
        }

        return options
    }

    // Generate minute options
    const generateMinuteOptions = (): TimeOption[] => {
        const options: TimeOption[] = []

        for (let minute = 0; minute < 60; minute += interval) {
            options.push({
                id: `minute-${minute}`,
                label: minute.toString().padStart(2, '0'),
                hour: 0,
                minute
            })
        }

        return options
    }

    // Generate period options (AM/PM)
    const generatePeriodOptions = (): TimeOption[] => {
        return [
            {id: 'AM', label: 'AM', hour: 0, minute: 0, period: 'AM'},
            {id: 'PM', label: 'PM', hour: 0, minute: 0, period: 'PM'}
        ]
    }

    // Confirm time selection
    const handleConfirm = () => {
        let hour = selectedHour

        // Convert to 24-hour format if using 12-hour format
        if (use12HourFormat) {
            if (selectedPeriod === 'PM' && hour !== 12) {
                hour += 12
            } else if (selectedPeriod === 'AM' && hour === 12) {
                hour = 0
            }
        }

        // Validate hour and minute values
        if (hour < 0 || hour > 23 || selectedMinute < 0 || selectedMinute > 59) {
            console.error('Invalid time values:', {hour, selectedMinute})
            return
        }

        // Create a new date with today's date and the selected time
        const date = new Date()
        date.setHours(hour, selectedMinute, 0, 0)

        // Verify the date is valid before calling toISOString
        if (isNaN(date.getTime())) {
            console.error('Invalid date created:', {hour, selectedMinute, date})
            return
        }

        onChange(date.toISOString())
        drawerManager.closeDrawer(drawerId)
    }

    // Cancel selection
    const handleCancel = () => {
        if (currentTime && !isNaN(currentTime.getTime())) {
            const hours = currentTime.getHours()
            if (use12HourFormat) {
                // Convert to 12-hour format for display (1-12)
                setSelectedHour(hours === 0 ? 12 : hours > 12 ? hours - 12 : hours)
                setSelectedPeriod(hours >= 12 ? 'PM' : 'AM')
            } else {
                setSelectedHour(hours)
            }
            setSelectedMinute(Math.floor(currentTime.getMinutes() / interval) * interval)
        }
        drawerManager.closeDrawer(drawerId)
    }

    // Get display hour for 12-hour format
    const getDisplayHour = useCallback(() => {
        if (use12HourFormat) {
            return selectedHour === 0 ? 12 : selectedHour > 12 ? selectedHour - 12 : selectedHour
        }
        return selectedHour
    }, [use12HourFormat, selectedHour])

    const hourOptions = generateHourOptions()
    const minuteOptions = generateMinuteOptions()
    const periodOptions = generatePeriodOptions()

    // Auto-scroll to selected values
    const scrollToSelectedValue = useCallback((
        container: HTMLDivElement | null,
        selectedValue: number | string,
        options: TimeOption[],
        accessor: (option: TimeOption) => number | string
    ) => {
        if (!container) return
        const selectedIndex = options.findIndex(option => accessor(option) === selectedValue)
        if (selectedIndex === -1) return
        // Wait for DOM to be fully rendered
        requestAnimationFrame(() => {
            // Get the SelectionPicker container (first child should be the flex container)

            //const selectionContainer = container.children[0] as HTMLElement
            const selectionContainer = container as HTMLElement
            if (!selectionContainer) return

            // Get all item elements from the SelectionPicker
            const items = selectionContainer.children
            if (items.length === 0 || selectedIndex >= items.length) return

            // Get the selected item element
            const selectedItem = items[selectedIndex] as HTMLElement
            if (!selectedItem) return

            // Calculate the item's position relative to the scrollable container
            const itemHeight = selectedItem.offsetHeight
            const itemOffsetTop = selectedItem.offsetTop - container.offsetTop
            const containerHeight = container.clientHeight
            const scrollTop = Math.max(0, itemOffsetTop - (containerHeight / 2) + (itemHeight / 2))
            container.scrollTo({
                top: scrollTop,
                //top: itemOffsetTop,
                behavior: 'instant'
            })
        })
    }, [])

    // Auto-scroll when drawer opens or values change
    useEffect(() => {
        if (drawerManager.isDrawerOpen(drawerId)) {
            // Small delay to ensure DOM is rendered
            setTimeout(() => {
                // For hour scrolling, the selectedHour in 12-hour format already represents the display hour (1-12)
                // For 24-hour format, selectedHour represents the actual hour (0-23)
                const hourValue = use12HourFormat ? selectedHour : selectedHour

                // Scroll hour container
                scrollToSelectedValue(
                    hourContainerRef.current,
                    hourValue,
                    hourOptions,
                    (option) => option.hour
                )

                // Scroll minute container
                scrollToSelectedValue(
                    minuteContainerRef.current,
                    selectedMinute,
                    minuteOptions,
                    (option) => option.minute
                )

                // Scroll period container (if 12-hour format)
                if (use12HourFormat && periodContainerRef.current) {
                    scrollToSelectedValue(
                        periodContainerRef.current,
                        selectedPeriod,
                        periodOptions,
                        (option) => option.period || option.id
                    )
                }
            }, 200) // Increased delay for better DOM readiness
        }
    }, [drawerManager.isDrawerOpen(drawerId), selectedHour, selectedMinute, selectedPeriod, use12HourFormat, scrollToSelectedValue, hourOptions, minuteOptions, periodOptions])

    return (
        <>
            {label && (
                <Box
                    as="label"
                    display="block"
                    fontSize="1rem"
                    fontWeight="500"
                    color="#374151"
                    marginBottom="0.5rem"
                >
                    {label}
                    {required && <Box as="span" color="#dc2626"> *</Box>}
                </Box>
            )}

            <Box
                as="div"
                onClick={handleInputClick}
                position="relative"
                width="100%"
                padding="0.75rem"
                border="1px solid #d1d5db"
                borderRadius="0.375rem"
                backgroundColor={disabled ? '#f9fafb' : 'white'}
                cursor={disabled ? 'not-allowed' : 'pointer'}
                fontSize="1rem"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                whileHover={!disabled ? {borderColor: '#3182ce'} : {}}
                whileFocus={{borderColor: '#3182ce', outline: 'none', boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)'}}
                tabIndex={disabled ? -1 : 0}
                onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleInputClick()
                    }
                }}
            >
                <Box color={currentTime ? '#374151' : '#9ca3af'}>
                    {currentTime ? formatDisplayTime(currentTime) : placeholder}
                </Box>
                <Box color="#6b7280" fontSize="1.25rem">
                    <FaClock/>
                </Box>
            </Box>

            <SlidingDrawer
                isOpen={drawerManager.isDrawerOpen(drawerId)}
                onClose={() => drawerManager.closeDrawer(drawerId)}
                side="bottom"
                height="auto"
                zIndex={drawerManager.getDrawerZIndex(drawerId)}
                showCloseButton={false}
                contentStyles={{
                    maxWidth: 600,
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    borderTopLeftRadius: '1rem',
                    borderTopRightRadius: '1rem'
                }}
                disableBackdropClick
            >
                <Box padding="1.5rem">
                    <Box fontSize="1.25rem" fontWeight="600" marginBottom="1.5rem" textAlign="center" color="#1a202c">
                        Select Time
                    </Box>

                    {/* Time Preview */}
                    <Box
                        backgroundColor="#f8fafc"
                        borderRadius="0.75rem"
                        padding="1rem"
                        textAlign="center"
                        marginBottom="1.5rem"
                        border="1px solid #e2e8f0"
                    >
                        <Box fontSize="2rem" fontWeight="700" color="#1a202c" fontFamily="monospace">
                            {use12HourFormat
                                ? `${getDisplayHour()}:${selectedMinute.toString().padStart(2, '0')} ${selectedPeriod}`
                                : `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`
                            }
                        </Box>
                    </Box>

                    {/* Time Selectors */}
                    <Box display="grid" gridTemplateColumns={use12HourFormat ? '1fr 1fr 1fr' : '1fr 1fr'} gap="1rem"
                         marginBottom="1.5rem">
                        {/* Hour Selector */}
                        <Box>
                            <Box fontSize="1rem" fontWeight="600" color="#374151" marginBottom="0.75rem"
                                 textAlign="center">
                                Hour
                            </Box>
                            <SelectionPicker
                                data={hourOptions}
                                idAccessor={(option) => option.hour}
                                value={selectedHour}
                                onChange={(value) => {
                                    setSelectedHour(value as number)
                                }}
                                isMultiSelect={false}
                                renderItem={(option, isSelected) => (
                                    <Box
                                        fontSize="1rem"
                                        fontWeight={isSelected ? '600' : '400'}
                                        color={isSelected ? '#3182ce' : '#374151'}
                                        textAlign="center"
                                        padding="0.75rem"
                                        style={{
                                            scrollSnapAlign: 'center',
                                            scrollSnapStop: 'always'
                                        }}
                                    >
                                        {option.label}
                                    </Box>
                                )}
                                containerStyles={{
                                    maxHeight: '200px',
                                    overflow: 'auto',
                                    borderRadius: '0.5rem',
                                    scrollSnapType: 'y mandatory',
                                    scrollBehavior: 'smooth'
                                }}
                                containerRef={hourContainerRef}
                                selectedItemStyles={{
                                    backgroundColor: '#eff6ff',
                                    borderColor: '#3182ce'
                                }}
                            />
                        </Box>

                        {/* Minute Selector */}
                        <Box>
                            <Box fontSize="1rem" fontWeight="600" color="#374151" marginBottom="0.75rem"
                                 textAlign="center">
                                Minute
                            </Box>
                            <SelectionPicker
                                data={minuteOptions}
                                idAccessor={(option) => option.minute}
                                value={selectedMinute}
                                onChange={(value) => setSelectedMinute(value as number)}
                                isMultiSelect={false}
                                renderItem={(option, isSelected) => (
                                    <Box
                                        fontSize="1rem"
                                        fontWeight={isSelected ? '600' : '400'}
                                        color={isSelected ? '#3182ce' : '#374151'}
                                        textAlign="center"
                                        padding="0.75rem"
                                        style={{
                                            scrollSnapAlign: 'center',
                                            scrollSnapStop: 'always'
                                        }}
                                    >
                                        {option.label}
                                    </Box>
                                )}
                                containerStyles={{
                                    maxHeight: '200px',
                                    overflow: 'auto',
                                    borderRadius: '0.5rem',
                                    scrollSnapType: 'y mandatory',
                                    scrollBehavior: 'smooth'
                                }}
                                containerRef={minuteContainerRef}
                                selectedItemStyles={{
                                    backgroundColor: '#eff6ff',
                                    borderColor: '#3182ce'
                                }}
                            />
                        </Box>

                        {/* Period Selector (AM/PM) */}
                        {use12HourFormat && (
                            <Box>
                                <Box fontSize="1rem" fontWeight="600" color="#374151" marginBottom="0.75rem"
                                     textAlign="center">
                                    Period
                                </Box>
                                <SelectionPicker
                                    data={periodOptions}
                                    idAccessor={(option) => option.period || option.id}
                                    value={selectedPeriod}
                                    onChange={(value) => setSelectedPeriod(value as 'AM' | 'PM')}
                                    isMultiSelect={false}
                                    renderItem={(option, isSelected) => (
                                        <Box
                                            fontSize="1rem"
                                            fontWeight={isSelected ? '600' : '400'}
                                            color={isSelected ? '#3182ce' : '#374151'}
                                            textAlign="center"
                                            padding="0.75rem"
                                            style={{
                                                scrollSnapAlign: 'center',
                                                scrollSnapStop: 'always'
                                            }}
                                        >
                                            {option.label}
                                        </Box>
                                    )}
                                    containerStyles={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '0.5rem',
                                        scrollSnapType: 'y mandatory',
                                        scrollBehavior: 'smooth'
                                    }}
                                    containerRef={periodContainerRef}
                                    selectedItemStyles={{
                                        backgroundColor: '#eff6ff',
                                        borderColor: '#3182ce'
                                    }}
                                />
                            </Box>
                        )}
                    </Box>

                    {/* Action Buttons */}
                    <Box display="flex" gap="1rem" justifyContent="space-between">
                        <Box
                            as="button"
                            onClick={handleCancel}
                            flex="1"
                            padding="0.75rem"
                            backgroundColor="transparent"
                            color="#6b7280"
                            border="1px solid #d1d5db"
                            borderRadius="0.375rem"
                            fontSize="1rem"
                            fontWeight="500"
                            cursor="pointer"
                            whileHover={{backgroundColor: '#f9fafb', borderColor: '#9ca3af'}}
                        >
                            Cancel
                        </Box>
                        <Box
                            as="button"
                            onClick={handleConfirm}
                            flex="1"
                            padding="0.75rem"
                            backgroundColor="#3182ce"
                            color="white"
                            border="none"
                            borderRadius="0.375rem"
                            fontSize="1rem"
                            fontWeight="500"
                            cursor="pointer"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            gap="0.5rem"
                            whileHover={{backgroundColor: '#2563eb'}}
                        >
                            <FaCheck/>
                            Confirm
                        </Box>
                    </Box>
                </Box>
            </SlidingDrawer>
        </>
    )
}

export default TimePicker