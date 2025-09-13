import React from 'react'
import { Box } from '../Box'
import { CalendarCellProps } from './BaseCalendar'

interface AvailabilityCellData {
  isAvailable?: boolean
  isBlocked?: boolean
  hasBooking?: boolean
  reason?: string
}

/**
 * Specialized calendar cell for availability calendar
 * Shows availability states and booking information
 */
const AvailabilityCalendarCell: React.FC<CalendarCellProps> = ({
  date,
  dateStr,
  cellData,
  isSelected,
  isToday,
  isPast,
  onCellClick
}) => {
  if (!date) {
    return <Box height="48px" backgroundColor="white" />
  }
  
  const day = date.getDate()
  const availabilityData = cellData as AvailabilityCellData | undefined
  
  // Determine availability state
  const isAvailable = availabilityData?.isAvailable ?? true
  const isBlocked = availabilityData?.isBlocked ?? false
  const hasBooking = availabilityData?.hasBooking ?? false
  
  // Determine cell styling based on state
  const getCellStyles = () => {
    if (isSelected) {
      return {
        backgroundColor: '#3b82f6',
        color: 'white',
        border: '2px solid #1d4ed8'
      }
    }
    
    if (isToday) {
      return {
        backgroundColor: '#dbeafe',
        color: '#1e40af',
        border: '2px solid #3b82f6'
      }
    }
    
    if (hasBooking) {
      return {
        backgroundColor: '#fef3c7',
        color: '#92400e',
        border: '1px solid #f59e0b'
      }
    }
    
    if (isBlocked) {
      return {
        backgroundColor: '#fef2f2',
        color: '#991b1b',
        border: '1px solid #ef4444'
      }
    }
    
    if (!isAvailable) {
      return {
        backgroundColor: '#f3f4f6',
        color: '#6b7280',
        border: '1px solid #d1d5db'
      }
    }
    
    if (isPast) {
      return {
        backgroundColor: '#f9fafb',
        color: '#9ca3af',
        border: '1px solid #e5e7eb'
      }
    }
    
    // Available
    return {
      backgroundColor: '#f0f9ff',
      color: '#075985',
      border: '1px solid #0ea5e9'
    }
  }
  
  const styles = getCellStyles()
  
  // Determine status text
  const getStatusText = () => {
    if (hasBooking) return 'Booked'
    if (isBlocked) return 'Blocked'
    if (!isAvailable) return 'N/A'
    return 'Available'
  }
  
  return (
    <Box
      height="48px"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      cursor="pointer"
      onClick={() => onCellClick(dateStr)}
      fontWeight={isToday ? 'bold' : 'normal'}
      transition="all 0.2s ease"
      position="relative"
      style={styles}
      onMouseEnter={(e) => {
        if (isSelected) {
          e.currentTarget.style.backgroundColor = '#2563eb'
        } else {
          e.currentTarget.style.backgroundColor = '#f3f4f6'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = styles.backgroundColor
      }}
      title={`${day} - ${getStatusText()}${availabilityData?.reason ? `: ${availabilityData.reason}` : ''}`}
    >
      {/* Day number */}
      <Box
        fontSize="0.875rem"
        fontWeight={isToday ? 'bold' : 'medium'}
        textAlign="center"
      >
        {day}
      </Box>
      
      {/* Status indicator */}
      <Box position="absolute" bottom="2px" right="2px" display="flex" gap="2px">
        {hasBooking && (
          <Box
            width="8px"
            height="8px"
            borderRadius="50%"
            backgroundColor="#f59e0b"
            title="Has booking"
          />
        )}
        {isBlocked && (
          <Box
            width="8px"
            height="8px"
            borderRadius="50%"
            backgroundColor="#ef4444"
            title="Blocked"
          />
        )}
        {!isAvailable && !isBlocked && !hasBooking && (
          <Box
            width="8px"
            height="8px"
            borderRadius="50%"
            backgroundColor="#6b7280"
            title="Not available"
          />
        )}
      </Box>
    </Box>
  )
}

export default AvailabilityCalendarCell