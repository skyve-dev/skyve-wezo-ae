import React, { useState, useRef } from 'react'
import SlidingDrawer from './SlidingDrawer'
import SelectionPicker from './SelectionPicker'
import { Box } from './Box'
import useDrawerManager from '../hooks/useDrawerManager'
import { 
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaCheck 
} from 'react-icons/fa'

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

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * DatePicker Component
 * 
 * A controlled input field that opens a SlidingDrawer with a calendar interface
 * when clicked. Supports navigation between months and years.
 */
const DatePicker: React.FC<DatePickerProps> = ({
  value,
  defaultValue,
  onChange,
  placeholder = 'Select a date',
  disabled = false,
  required = false,
  label,
  minDate,
  maxDate
}) => {
  const drawerManager = useDrawerManager()
  const drawerId = useRef(`date-picker-${Math.random().toString(36).substr(2, 9)}`).current
  const yearDrawerId = useRef(`year-picker-${Math.random().toString(36).substr(2, 9)}`).current
  
  // Parse current date or use default
  const currentDate = value ? new Date(value) : (defaultValue ? new Date(defaultValue) : null)
  
  // State for calendar navigation
  const [viewDate, setViewDate] = useState(() => {
    if (currentDate && !isNaN(currentDate.getTime())) {
      return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  })
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(currentDate)

  // Format date for display
  const formatDisplayDate = (date: Date | null) => {
    if (!date || isNaN(date.getTime())) return ''
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Handle input click to open drawer
  const handleInputClick = () => {
    if (disabled) return
    drawerManager.openDrawer(drawerId)
  }

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  // Navigate to next month
  const goToNextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  // Handle year selection
  const handleYearChange = (year: number) => {
    setViewDate(prev => new Date(year, prev.getMonth(), 1))
    drawerManager.closeDrawer(yearDrawerId)
  }

  // Open year selection drawer
  const openYearSelection = () => {
    drawerManager.openDrawer(yearDrawerId)
  }

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  // Confirm date selection
  const handleConfirm = () => {
    if (selectedDate) {
      onChange(selectedDate.toISOString())
    }
    drawerManager.closeDrawer(drawerId)
  }

  // Cancel selection
  const handleCancel = () => {
    setSelectedDate(currentDate)
    drawerManager.closeDrawer(drawerId)
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days: Date[] = []
    const current = new Date(startDate)
    
    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  // Check if date is disabled
  const isDateDisabled = (date: Date) => {
    if (minDate && date < new Date(minDate)) return true
    if (maxDate && date > new Date(maxDate)) return true
    return false
  }

  // Check if date is selected
  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false
    return date.toDateString() === selectedDate.toDateString()
  }

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  // Check if date is in current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === viewDate.getMonth()
  }

  // Generate year options for year picker
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear()
    const years: { id: number; label: string }[] = []
    
    for (let year = currentYear - 50; year <= currentYear + 10; year++) {
      years.push({ id: year, label: year.toString() })
    }
    
    return years
  }

  const calendarDays = generateCalendarDays()
  const yearOptions = generateYearOptions()

  return (
    <>
      {label && (
        <Box
          as="label"
          display="block"
          fontSize="0.875rem"
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
        whileHover={!disabled ? { borderColor: '#3182ce' } : {}}
        whileFocus={{ borderColor: '#3182ce', outline: 'none', boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)' }}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleInputClick()
          }
        }}
      >
        <Box color={selectedDate ? '#374151' : '#9ca3af'}>
          {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
        </Box>
        <Box color="#6b7280" fontSize="1.125rem">
          <FaCalendarAlt />
        </Box>
      </Box>

      <SlidingDrawer
        isOpen={drawerManager.isDrawerOpen(drawerId)}
        onClose={() => drawerManager.closeDrawer(drawerId)}
        side="bottom"
        height="auto"
        zIndex={drawerManager.getDrawerZIndex(drawerId)}
        showCloseButton={false}
        disableBackdropClick
      >
        <Box padding="1.5rem" display={'flex'} flexDirection={'column'} overflow={'auto'}>
          <Box fontSize="1.25rem" fontWeight="600" marginBottom="1.5rem" textAlign="center" color="#1a202c">
            Select Date
          </Box>

          {/* Month/Year Navigation */}
          <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="1.5rem">
            <Box
              as="button"
              onClick={goToPreviousMonth}
              padding="0.5rem"
              backgroundColor="transparent"
              border="none"
              borderRadius="0.375rem"
              cursor="pointer"
              color="#6b7280"
              whileHover={{ backgroundColor: '#f3f4f6', color: '#374151' }}
            >
              <FaChevronLeft />
            </Box>

            <Box display="flex" alignItems="center" gap="1rem">
              <Box fontSize="1.125rem" fontWeight="600" color="#1a202c">
                {MONTHS[viewDate.getMonth()]}
              </Box>
              
              <Box
                as="button"
                onClick={openYearSelection}
                padding="0.5rem 1rem"
                backgroundColor="#f8fafc"
                border="1px solid #e2e8f0"
                borderRadius="0.375rem"
                fontSize="1rem"
                fontWeight="600"
                color="#1a202c"
                cursor="pointer"
                minWidth="80px"
                whileHover={{ 
                  backgroundColor: '#f1f5f9', 
                  borderColor: '#3182ce' 
                }}
                whileFocus={{ 
                  outline: 'none', 
                  borderColor: '#3182ce',
                  boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)' 
                }}
              >
                {viewDate.getFullYear()}
              </Box>
            </Box>

            <Box
              as="button"
              onClick={goToNextMonth}
              padding="0.5rem"
              backgroundColor="transparent"
              border="none"
              borderRadius="0.375rem"
              cursor="pointer"
              color="#6b7280"
              whileHover={{ backgroundColor: '#f3f4f6', color: '#374151' }}
            >
              <FaChevronRight />
            </Box>
          </Box>

          {/* Calendar Grid */}
          <Box marginBottom="1.5rem">
            {/* Day Headers */}
            <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" gap="0.25rem" marginBottom="0.5rem">
              {DAYS.map((day) => (
                <Box
                  key={day}
                  textAlign="center"
                  fontSize="0.75rem"
                  fontWeight="600"
                  color="#6b7280"
                  padding="0.5rem"
                >
                  {day}
                </Box>
              ))}
            </Box>

            {/* Calendar Days */}
            <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" gap="0.25rem">
              {calendarDays.map((date, index) => {
                const disabled = isDateDisabled(date)
                const selected = isDateSelected(date)
                const today = isToday(date)
                const currentMonth = isCurrentMonth(date)

                return (
                  <Box
                    key={index}
                    as="button"
                    onClick={() => !disabled && handleDateSelect(date)}
                    padding="0.75rem"
                    backgroundColor={selected ? '#3182ce' : 'transparent'}
                    color={
                      selected ? 'white' :
                      !currentMonth ? '#d1d5db' :
                      today ? '#3182ce' :
                      disabled ? '#9ca3af' :
                      '#374151'
                    }
                    border={today && !selected ? '1px solid #3182ce' : 'none'}
                    borderRadius="0.375rem"
                    fontSize="0.875rem"
                    fontWeight={today || selected ? '600' : '400'}
                    cursor={disabled ? 'not-allowed' : 'pointer'}
                    opacity={disabled ? 0.5 : 1}
                    whileHover={!disabled && !selected ? { backgroundColor: '#f3f4f6' } : {}}
                    disabled={disabled}
                  >
                    {date.getDate()}
                  </Box>
                )
              })}
            </Box>
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
              fontSize="0.875rem"
              fontWeight="500"
              cursor="pointer"
              whileHover={{ backgroundColor: '#f9fafb', borderColor: '#9ca3af' }}
            >
              Cancel
            </Box>
            <Box
              as="button"
              onClick={handleConfirm}
              flex="1"
              padding="0.75rem"
              backgroundColor={selectedDate ? '#3182ce' : '#9ca3af'}
              color="white"
              border="none"
              borderRadius="0.375rem"
              fontSize="0.875rem"
              fontWeight="500"
              cursor={selectedDate ? 'pointer' : 'not-allowed'}
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap="0.5rem"
              whileHover={selectedDate ? { backgroundColor: '#2563eb' } : {}}
              disabled={!selectedDate}
            >
              <FaCheck />
              Confirm
            </Box>
          </Box>
        </Box>
      </SlidingDrawer>

      {/* Year Selection Drawer */}
      <SlidingDrawer
        isOpen={drawerManager.isDrawerOpen(yearDrawerId)}
        onClose={() => drawerManager.closeDrawer(yearDrawerId)}
        side="bottom"
        height="70vh"
        zIndex={drawerManager.getDrawerZIndex(yearDrawerId)}
        showCloseButton
      >
        <Box padding="1.5rem" display="flex" flexDirection="column" overflow="auto">
          <Box fontSize="1.25rem" fontWeight="600" marginBottom="0.5rem" textAlign="center" color="#1a202c">
            Select Year
          </Box>
          <Box fontSize="0.875rem" color="#6b7280" marginBottom="1.5rem" textAlign="center">
            Choose a year to navigate the calendar
          </Box>

          <SelectionPicker
            data={yearOptions}
            idAccessor={(option) => option.id}
            value={viewDate.getFullYear()}
            onChange={(year) => handleYearChange(year as number)}
            isMultiSelect={false}
            renderItem={(option, isSelected) => (
              <Box
                fontSize="1rem"
                fontWeight={isSelected ? '700' : '500'}
                color={isSelected ? '#3182ce' : '#374151'}
                textAlign="center"
                padding="0.75rem"
                borderRadius="0.375rem"
                backgroundColor={isSelected ? '#eff6ff' : 'transparent'}
                whileHover={{
                  backgroundColor: isSelected ? '#eff6ff' : '#f8fafc'
                }}
              >
                {option.label}
              </Box>
            )}
            containerStyles={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
              gap: '0.5rem',
              maxHeight: '400px',
              overflow: 'auto',
              padding: '0.5rem'
            }}
            selectedItemStyles={{
              borderColor: '#3182ce',
              backgroundColor: '#eff6ff'
            }}
          />

          {/* Quick Year Navigation */}
          <Box marginTop="1.5rem" paddingTop="1rem" borderTop="1px solid #e5e7eb">
            <Box fontSize="0.875rem" fontWeight="600" color="#374151" marginBottom="1rem" textAlign="center">
              Quick Navigation
            </Box>
            <Box display="flex" gap="0.5rem" flexWrap="wrap" justifyContent="center">
              {[
                { label: 'This Year', year: new Date().getFullYear() },
                { label: 'Next Year', year: new Date().getFullYear() + 1 },
                { label: '2025', year: 2025 },
                { label: '2030', year: 2030 }
              ].map((quick, index) => (
                <Box
                  key={index}
                  as="button"
                  onClick={() => handleYearChange(quick.year)}
                  padding="0.5rem 1rem"
                  backgroundColor={viewDate.getFullYear() === quick.year ? '#3182ce' : '#f3f4f6'}
                  color={viewDate.getFullYear() === quick.year ? 'white' : '#374151'}
                  border="none"
                  borderRadius="1rem"
                  fontSize="0.75rem"
                  fontWeight="500"
                  cursor="pointer"
                  whileHover={{
                    backgroundColor: viewDate.getFullYear() === quick.year ? '#2563eb' : '#e5e7eb'
                  }}
                >
                  {quick.label}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </SlidingDrawer>
    </>
  )
}

export default DatePicker