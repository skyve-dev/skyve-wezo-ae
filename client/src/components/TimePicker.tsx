import React, { useState, useRef } from 'react'
import SlidingDrawer from './SlidingDrawer'
import SelectionPicker from './SelectionPicker'
import { Box } from './Box'
import useDrawerManager from '../hooks/useDrawerManager'
import { 
  FaClock,
  FaCheck 
} from 'react-icons/fa'

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
 * TimePicker Component
 * 
 * A controlled input field that opens a SlidingDrawer with time selection
 * when clicked. Supports both 12-hour and 24-hour formats with customizable intervals.
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
  
  // Parse current time or use default
  const currentTime = value ? new Date(value) : (defaultValue ? new Date(defaultValue) : null)
  
  // State for time selection
  const [selectedHour, setSelectedHour] = useState<number>(
    currentTime ? currentTime.getHours() : 9
  )
  const [selectedMinute, setSelectedMinute] = useState<number>(
    currentTime ? Math.floor(currentTime.getMinutes() / interval) * interval : 0
  )
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>(
    use12HourFormat ? (currentTime && currentTime.getHours() >= 12 ? 'PM' : 'AM') : 'AM'
  )

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
          hour,
          minute: 0
        })
      }
    } else {
      for (let hour = 0; hour < 24; hour++) {
        options.push({
          id: `hour-${hour}`,
          label: hour.toString().padStart(2, '0'),
          hour,
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
      { id: 'AM', label: 'AM', hour: 0, minute: 0, period: 'AM' },
      { id: 'PM', label: 'PM', hour: 0, minute: 0, period: 'PM' }
    ]
  }

  // Confirm time selection
  const handleConfirm = () => {
    let hour = selectedHour
    
    if (use12HourFormat) {
      if (selectedPeriod === 'PM' && hour !== 12) {
        hour += 12
      } else if (selectedPeriod === 'AM' && hour === 12) {
        hour = 0
      }
    }
    
    const date = new Date()
    date.setHours(hour, selectedMinute, 0, 0)
    onChange(date.toISOString())
    drawerManager.closeDrawer(drawerId)
  }

  // Cancel selection
  const handleCancel = () => {
    if (currentTime) {
      setSelectedHour(currentTime.getHours())
      setSelectedMinute(Math.floor(currentTime.getMinutes() / interval) * interval)
      setSelectedPeriod(use12HourFormat ? (currentTime.getHours() >= 12 ? 'PM' : 'AM') : 'AM')
    }
    drawerManager.closeDrawer(drawerId)
  }

  // Get display hour for 12-hour format
  const getDisplayHour = () => {
    if (use12HourFormat) {
      return selectedHour === 0 ? 12 : selectedHour > 12 ? selectedHour - 12 : selectedHour
    }
    return selectedHour
  }

  const hourOptions = generateHourOptions()
  const minuteOptions = generateMinuteOptions()
  const periodOptions = generatePeriodOptions()

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
        <Box color={currentTime ? '#374151' : '#9ca3af'}>
          {currentTime ? formatDisplayTime(currentTime) : placeholder}
        </Box>
        <Box color="#6b7280" fontSize="1.125rem">
          <FaClock />
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
          <Box display="grid" gridTemplateColumns={use12HourFormat ? '1fr 1fr 1fr' : '1fr 1fr'} gap="1rem" marginBottom="1.5rem">
            {/* Hour Selector */}
            <Box>
              <Box fontSize="0.875rem" fontWeight="600" color="#374151" marginBottom="0.75rem" textAlign="center">
                Hour
              </Box>
              <SelectionPicker
                data={hourOptions}
                idAccessor={(option) => option.id}
                value={use12HourFormat ? getDisplayHour() : selectedHour}
                onChange={(value) => {
                  const hour = hourOptions.find(opt => (use12HourFormat ? opt.hour : opt.hour) === value)?.hour || 0
                  setSelectedHour(hour)
                }}
                isMultiSelect={false}
                renderItem={(option, isSelected) => (
                  <Box
                    fontSize="1rem"
                    fontWeight={isSelected ? '600' : '400'}
                    color={isSelected ? '#3182ce' : '#374151'}
                    textAlign="center"
                    padding="0.5rem"
                  >
                    {option.label}
                  </Box>
                )}
                containerStyles={{
                  maxHeight: '200px',
                  overflow: 'auto',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem'
                }}
                selectedItemStyles={{
                  backgroundColor: '#eff6ff',
                  borderColor: '#3182ce'
                }}
              />
            </Box>

            {/* Minute Selector */}
            <Box>
              <Box fontSize="0.875rem" fontWeight="600" color="#374151" marginBottom="0.75rem" textAlign="center">
                Minute
              </Box>
              <SelectionPicker
                data={minuteOptions}
                idAccessor={(option) => option.id}
                value={selectedMinute}
                onChange={(value) => setSelectedMinute(value as number)}
                isMultiSelect={false}
                renderItem={(option, isSelected) => (
                  <Box
                    fontSize="1rem"
                    fontWeight={isSelected ? '600' : '400'}
                    color={isSelected ? '#3182ce' : '#374151'}
                    textAlign="center"
                    padding="0.5rem"
                  >
                    {option.label}
                  </Box>
                )}
                containerStyles={{
                  maxHeight: '200px',
                  overflow: 'auto',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem'
                }}
                selectedItemStyles={{
                  backgroundColor: '#eff6ff',
                  borderColor: '#3182ce'
                }}
              />
            </Box>

            {/* Period Selector (AM/PM) */}
            {use12HourFormat && (
              <Box>
                <Box fontSize="0.875rem" fontWeight="600" color="#374151" marginBottom="0.75rem" textAlign="center">
                  Period
                </Box>
                <SelectionPicker
                  data={periodOptions}
                  idAccessor={(option) => option.id}
                  value={selectedPeriod}
                  onChange={(value) => setSelectedPeriod(value as 'AM' | 'PM')}
                  isMultiSelect={false}
                  renderItem={(option, isSelected) => (
                    <Box
                      fontSize="1rem"
                      fontWeight={isSelected ? '600' : '400'}
                      color={isSelected ? '#3182ce' : '#374151'}
                      textAlign="center"
                      padding="0.5rem"
                    >
                      {option.label}
                    </Box>
                  )}
                  containerStyles={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem'
                  }}
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
              backgroundColor="#3182ce"
              color="white"
              border="none"
              borderRadius="0.375rem"
              fontSize="0.875rem"
              fontWeight="500"
              cursor="pointer"
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap="0.5rem"
              whileHover={{ backgroundColor: '#2563eb' }}
            >
              <FaCheck />
              Confirm
            </Box>
          </Box>
        </Box>
      </SlidingDrawer>
    </>
  )
}

export default TimePicker