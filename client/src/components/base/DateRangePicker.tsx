import React, { useRef, useState, useEffect, useMemo } from 'react'
import SlidingDrawer from './SlidingDrawer'
import { Box } from './Box'
import useDrawerManager from '../../hooks/useDrawerManager'
import { IoIosCalendar, IoIosCheckmark, IoIosArrowBack, IoIosArrowForward, IoIosClose } from 'react-icons/io'

interface DateRange {
  startDate: Date | null
  endDate: Date | null
}

interface DateRenderContext {
  date: Date
  isSelected: boolean
  isInRange: boolean
  isStartDate: boolean
  isEndDate: boolean
  isDisabled: boolean
  isToday: boolean
  isWeekend: boolean
  price?: PriceInfo
}

interface PriceInfo {
  amount: number
  currency: string
  isOverride?: boolean
  hasDiscount?: boolean
  originalAmount?: number
}

interface DateRangePickerProps {
  /**
   * Current date range value
   */
  value?: DateRange

  /**
   * Default date range value
   */
  defaultValue?: DateRange

  /**
   * Callback when date range changes (fires when both dates are selected)
   */
  onChange?: (range: DateRange) => void

  /**
   * Callback when range selection is complete (both dates selected)
   */
  onComplete?: (range: DateRange) => void

  /**
   * Placeholder text for the inputs
   */
  placeholder?: {
    start?: string
    end?: string
  }

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
   * Minimum selectable date
   */
  minDate?: Date

  /**
   * Maximum selectable date
   */
  maxDate?: Date

  /**
   * Whether to show a clear button
   */
  clearable?: boolean

  /**
   * Whether the input has an error
   */
  error?: boolean

  /**
   * Helper text to display below the input
   */
  helperText?: string

  /**
   * Custom renderer for date cells
   */
  renderDate?: (date: Date, context: DateRenderContext) => React.ReactNode

  /**
   * Price data for dates (date string -> price info)
   */
  priceData?: Record<string, PriceInfo>

  /**
   * Whether to show prices on dates
   */
  showPrices?: boolean

  /**
   * Minimum number of nights required
   */
  minNights?: number

  /**
   * Maximum number of nights allowed
   */
  maxNights?: number

  /**
   * Disabled dates
   */
  disabledDates?: Date[]
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * # DateRangePicker Component
 * 
 * A comprehensive date range selection component that combines input fields with a calendar
 * interface for selecting check-in and check-out dates. Features price display, custom
 * rendering, and validation for booking systems.
 * 
 * ## Key Features
 * - **Unified Date Range Selection**: Single component for start and end dates
 * - **Price Display**: Optional price display with custom rendering
 * - **Range Validation**: Min/max nights, disabled dates, availability
 * - **Mobile Optimized**: Touch-friendly interface with responsive design
 * - **Custom Renderers**: Flexible date cell rendering for complex UIs
 * - **Controlled Component**: Standard React patterns (value, onChange)
 * 
 * ## Basic Usage
 * ```tsx
 * const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null })
 * 
 * <DateRangePicker
 *   value={dateRange}
 *   onChange={setDateRange}
 *   placeholder={{ start: "Check-in", end: "Check-out" }}
 *   clearable
 * />
 * ```
 * 
 * ## With Price Display
 * ```tsx
 * <DateRangePicker
 *   value={bookingDates}
 *   onChange={setBookingDates}
 *   showPrices
 *   priceData={propertyPrices}
 *   renderDate={(date, context) => (
 *     <Box textAlign="center">
 *       <Box>{date.getDate()}</Box>
 *       {context.price && <Box fontSize="0.75rem">AED {context.price.amount}</Box>}
 *     </Box>
 *   )}
 * />
 * ```
 */
const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  defaultValue,
  onChange,
  onComplete,
  placeholder = { start: 'Check-in', end: 'Check-out' },
  disabled = false,
  required = false,
  label,
  minDate,
  maxDate,
  clearable = false,
  error = false,
  helperText,
  renderDate,
  priceData,
  showPrices = false,
  minNights = 1,
  maxNights,
  disabledDates = []
}) => {
  const drawerManager = useDrawerManager()
  const drawerId = useRef(`date-range-picker-${Math.random().toString(36).substr(2, 9)}`).current

  // Initialize with controlled value or default value
  const [internalRange, setInternalRange] = useState<DateRange>(() => {
    return value || defaultValue || { startDate: null, endDate: null }
  })

  // Calendar navigation state
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  
  // Selection state
  const [selectionStep, setSelectionStep] = useState<'start' | 'end'>('start')
  
  // Update internal state when controlled value changes
  useEffect(() => {
    if (value) {
      console.log('🔄 Controlled value changed:', value)
      setInternalRange(value)
    }
  }, [value])
  
  // Debug log internal range changes
  useEffect(() => {
    console.log('📊 Internal range updated:', internalRange)
  }, [internalRange])

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return ''
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    })
  }

  // Check if date is disabled
  const isDateDisabled = (date: Date) => {
    if (disabled) return true
    
    // Check min/max dates
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    
    // Check disabled dates
    if (disabledDates.some(disabledDate => 
      date.toDateString() === disabledDate.toDateString()
    )) return true
    
    // For end date selection, check min nights constraint
    if (selectionStep === 'end' && internalRange.startDate) {
      const daysDiff = Math.ceil((date.getTime() - internalRange.startDate.getTime()) / (1000 * 60 * 60 * 24))
      if (daysDiff < minNights) return true
      if (maxNights && daysDiff > maxNights) return true
    }
    
    return false
  }

  // Check if date is in selected range
  const isDateInRange = (date: Date) => {
    if (!internalRange.startDate || !internalRange.endDate) return false
    return date >= internalRange.startDate && date <= internalRange.endDate
  }

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const currentDate = new Date(startDate)
    
    // Generate 6 weeks of days
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return days
  }, [currentMonth, currentYear])

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date)) return

    console.log('🔍 handleDateSelect called:', {
      selectedDate: date.toDateString(),
      selectionStep,
      currentRange: internalRange
    })

    const newRange = { ...internalRange }
    
    if (selectionStep === 'start' || !internalRange.startDate) {
      // Select start date
      console.log('📅 Setting start date:', date.toDateString())
      newRange.startDate = date
      newRange.endDate = null
      setSelectionStep('end')
    } else {
      // Select end date
      if (date < internalRange.startDate) {
        // If selected date is before start date, make it the new start date
        console.log('📅 Date before start, making it new start:', date.toDateString())
        newRange.startDate = date
        newRange.endDate = null
        setSelectionStep('end')
      } else {
        // Complete the range selection
        newRange.endDate = date
        setSelectionStep('start')
        
        // Call onComplete if both dates are selected
        if (onComplete) {
          onComplete(newRange)
        }
      }
    }
    
    console.log('✅ Setting new range:', newRange)
    setInternalRange(newRange)
    
    // Call onChange if both dates are selected
    if (newRange.startDate && newRange.endDate && onChange) {
      console.log('📡 Calling onChange with complete range')
      onChange(newRange)
    }
  }

  // Handle clear
  const handleClear = () => {
    const clearedRange = { startDate: null, endDate: null }
    setInternalRange(clearedRange)
    setSelectionStep('start')
    
    if (onChange) {
      onChange(clearedRange)
    }
  }

  // Open drawer
  const handleOpen = () => {
    if (disabled) return
    drawerManager.openDrawer(drawerId)
  }

  // Close drawer
  const handleClose = () => {
    drawerManager.closeDrawer(drawerId)
  }

  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11)
        setCurrentYear(currentYear - 1)
      } else {
        setCurrentMonth(currentMonth - 1)
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0)
        setCurrentYear(currentYear + 1)
      } else {
        setCurrentMonth(currentMonth + 1)
      }
    }
  }

  // Render default date cell
  const renderDefaultDate = (date: Date, context: DateRenderContext) => {
    const dateString = date.toISOString().split('T')[0]
    const price = priceData?.[dateString]
    
    return (
      <Box textAlign="center" width="100%" position="relative">
        {/* Date number */}
        <Box 
          fontSize="1rem" 
          fontWeight={context.isSelected ? "600" : "400"}
          color={context.isDisabled ? "#9ca3af" : (context.isSelected ? "white" : "#374151")}
        >
          {date.getDate()}
        </Box>
        
        {/* Price display */}
        {showPrices && price && !context.isDisabled && (
          <Box 
            fontSize="0.75rem" 
            color={context.isSelected ? "white" : (price.isOverride ? "#3182ce" : "#6b7280")}
            fontWeight={price.isOverride ? "600" : "400"}
            marginTop="2px"
          >
            {price.currency} {price.amount.toLocaleString()}
          </Box>
        )}
      </Box>
    )
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <Box>
      {label && (
        <Box 
          marginBottom="0.5rem" 
          fontSize="0.875rem" 
          fontWeight="500" 
          color={error ? "#dc2626" : "#374151"}
        >
          {label}
          {required && <span style={{ color: '#dc2626' }}>*</span>}
        </Box>
      )}
      
      {/* Input Display */}
      <Box 
        display="flex" 
        gap="0.5rem" 
        alignItems="center"
        border={`2px solid ${error ? '#fecaca' : '#e5e7eb'}`}
        borderRadius="8px"
        backgroundColor={disabled ? '#f9fafb' : 'white'}
        padding="0.75rem"
        cursor={disabled ? 'not-allowed' : 'pointer'}
        onClick={handleOpen}
        transition="all 0.2s"
      >
        <IoIosCalendar size={20} color={disabled ? '#9ca3af' : '#6b7280'} />
        
        <Box flex="1" display="flex" gap="0.75rem" alignItems="center">
          {/* Start Date */}
          <Box flex="1">
            <Box fontSize="0.75rem" color="#6b7280" marginBottom="0.125rem">
              {placeholder.start}
            </Box>
            <Box 
              fontSize="0.875rem" 
              color={internalRange.startDate ? '#374151' : '#9ca3af'}
              fontWeight="500"
            >
              {internalRange.startDate ? formatDate(internalRange.startDate) : 'Select date'}
            </Box>
          </Box>
          
          {/* Separator */}
          <Box width="12px" height="1px" backgroundColor="#d1d5db" />
          
          {/* End Date */}
          <Box flex="1">
            <Box fontSize="0.75rem" color="#6b7280" marginBottom="0.125rem">
              {placeholder.end}
            </Box>
            <Box 
              fontSize="0.875rem" 
              color={internalRange.endDate ? '#374151' : '#9ca3af'}
              fontWeight="500"
            >
              {internalRange.endDate ? formatDate(internalRange.endDate) : 'Select date'}
            </Box>
          </Box>
        </Box>
        
        {/* Clear Button */}
        {clearable && (internalRange.startDate || internalRange.endDate) && !disabled && (
          <Box
            cursor="pointer"
            padding="0.25rem"
            borderRadius="4px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            onClick={(e) => {
              e.stopPropagation()
              handleClear()
            }}
          >
            <IoIosClose size={16} color="#6b7280" />
          </Box>
        )}
      </Box>
      
      {helperText && (
        <Box 
          marginTop="0.25rem" 
          fontSize="0.75rem" 
          color={error ? "#dc2626" : "#6b7280"}
        >
          {helperText}
        </Box>
      )}

      {/* Calendar Drawer */}
      <SlidingDrawer
        isOpen={drawerManager.isDrawerOpen(drawerId)}
        onClose={handleClose}
        side="bottom"
        height="75vh"
        showCloseButton={false}
        backgroundColor="white"
        contentStyles={{
          maxWidth: 600,
          marginLeft: 'auto',
          marginRight: 'auto',
          borderTopLeftRadius: '1rem',
          borderTopRightRadius: '1rem',
          overflow: 'hidden'
        }}
      >
        <Box padding="0" height="100%" display="flex" flexDirection="column">
          {/* Header */}
          <Box 
            padding="1.5rem" 
            backgroundColor="#D52122" 
            color="white"
            borderBottom="1px solid #b91c1c"
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0, marginBottom: '0.5rem' }}>
                  Select Date Range
                </h3>
                <Box display="flex" alignItems="center" gap="0.5rem" fontSize="0.875rem" opacity="0.9">
                  <IoIosCalendar size={12} />
                  <span>
                    {selectionStep === 'start' ? 'Choose check-in date' : 'Choose check-out date'}
                  </span>
                  {internalRange.startDate && !internalRange.endDate && (
                    <Box
                      padding="0.125rem 0.5rem"
                      backgroundColor="#3182ce"
                      borderRadius="12px"
                      fontSize="0.625rem"
                      fontWeight="600"
                    >
                      FROM {formatDate(internalRange.startDate)}
                    </Box>
                  )}
                </Box>
              </Box>
              
              <Box
                cursor="pointer"
                padding="0.5rem"
                borderRadius="4px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                onClick={handleClose}
              >
                <IoIosClose size={24} />
              </Box>
            </Box>
          </Box>
          
          {/* Calendar Content */}
          <Box flex="1" overflow="auto" padding="1.5rem">
            {/* Month Navigation */}
            <Box display="flex" alignItems="center" justifyContent="between" marginBottom="1.5rem">
              <Box
                cursor="pointer"
                padding="0.5rem"
                borderRadius="4px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                onClick={() => navigateMonth('prev')}
              >
                <IoIosArrowBack size={20} color="#6b7280" />
              </Box>
              
              <Box fontSize="1.125rem" fontWeight="600" color="#374151">
                {MONTHS[currentMonth]} {currentYear}
              </Box>
              
              <Box
                cursor="pointer"
                padding="0.5rem"
                borderRadius="4px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                onClick={() => navigateMonth('next')}
              >
                <IoIosArrowForward size={20} color="#6b7280" />
              </Box>
            </Box>
            
            {/* Days Header */}
            <Box 
              display="grid" 
              gridTemplateColumns="repeat(7, 1fr)" 
              gap="1px" 
              marginBottom="0.5rem"
            >
              {DAYS.map(day => (
                <Box
                  key={day}
                  textAlign="center"
                  fontSize="0.75rem"
                  fontWeight="600"
                  color="#6b7280"
                  padding="0.75rem 0"
                >
                  {day}
                </Box>
              ))}
            </Box>
            
            {/* Calendar Grid */}
            <Box 
              display="grid" 
              gridTemplateColumns="repeat(7, 1fr)" 
              gap="1px"
              backgroundColor="#f3f4f6"
              borderRadius="8px"
              overflow="hidden"
            >
              {calendarDays.map((date, index) => {
                const isCurrentMonth = date.getMonth() === currentMonth
                const isToday = date.toDateString() === today.toDateString()
                const isDisabled = isDateDisabled(date)
                const isSelected = !!(internalRange.startDate && date.toDateString() === internalRange.startDate.toDateString()) ||
                                 !!(internalRange.endDate && date.toDateString() === internalRange.endDate.toDateString())
                const isInRange = isDateInRange(date)
                const isStartDate = !!(internalRange.startDate && date.toDateString() === internalRange.startDate.toDateString())
                const isEndDate = !!(internalRange.endDate && date.toDateString() === internalRange.endDate.toDateString())
                
                // Debug logging for selection state
                if (isSelected) {
                  console.log('🎯 Date is selected:', {
                    date: date.toDateString(),
                    isStartDate,
                    isEndDate,
                    isDisabled,
                    internalRange
                  })
                }
                const isWeekend = date.getDay() === 0 || date.getDay() === 6
                
                const context: DateRenderContext = {
                  date,
                  isSelected,
                  isInRange,
                  isStartDate: isStartDate,
                  isEndDate: isEndDate,
                  isDisabled,
                  isToday,
                  isWeekend,
                  price: priceData?.[date.toISOString().split('T')[0]]
                }
                
                let backgroundColor = 'white'
                if (!isCurrentMonth) backgroundColor = '#f9fafb'
                else if (isSelected) backgroundColor = '#3182ce'  // ✅ SELECTED gets priority
                else if (isDisabled) backgroundColor = '#f3f4f6'  // ❌ Disabled comes after selected
                else if (isInRange) backgroundColor = '#dbeafe'
                else if (isToday) backgroundColor = '#eff6ff'
                
                return (
                  <Box
                    key={index}
                    minHeight="60px"
                    backgroundColor={backgroundColor}
                    cursor={!isCurrentMonth || isDisabled ? 'not-allowed' : 'pointer'}
                    opacity={!isCurrentMonth || isDisabled ? 0.5 : 1}
                    onClick={() => isCurrentMonth && handleDateSelect(date)}
                    padding="0.5rem"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    transition="all 0.2s"
                  >
                    {renderDate ? renderDate(date, context) : renderDefaultDate(date, context)}
                  </Box>
                )
              })}
            </Box>
          </Box>
          
          {/* Footer */}
          {(internalRange.startDate || internalRange.endDate) && (
            <Box 
              padding="1.5rem" 
              backgroundColor="#f9fafb" 
              borderTop="1px solid #e5e7eb"
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box fontSize="0.875rem" color="#6b7280">
                  {internalRange.startDate && internalRange.endDate ? (
                    <>
                      {Math.ceil((internalRange.endDate.getTime() - internalRange.startDate.getTime()) / (1000 * 60 * 60 * 24))} night{Math.ceil((internalRange.endDate.getTime() - internalRange.startDate.getTime()) / (1000 * 60 * 60 * 24)) !== 1 ? 's' : ''}
                    </>
                  ) : internalRange.startDate ? (
                    'Select check-out date'
                  ) : (
                    'Select check-in date'
                  )}
                </Box>
                
                {internalRange.startDate && internalRange.endDate && (
                  <Box
                    cursor="pointer"
                    padding="0.75rem 1.5rem"
                    backgroundColor="#3182ce"
                    color="white"
                    borderRadius="6px"
                    fontSize="0.875rem"
                    fontWeight="600"
                    onClick={handleClose}
                    display={'flex'}
                  >
                    <IoIosCheckmark size={16} style={{ marginRight: '0.5rem' }} />
                    Done
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </SlidingDrawer>
    </Box>
  )
}

export default DateRangePicker