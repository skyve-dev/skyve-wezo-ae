import React from 'react'
import { Box } from '../Box'
import { CalendarCellProps } from './BaseCalendar'

/**
 * Default calendar cell component
 * Provides basic styling and click handling
 */
const BaseCalendarCell: React.FC<CalendarCellProps> = ({
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
    
    if (isPast) {
      return {
        backgroundColor: '#f9fafb',
        color: '#9ca3af',
        border: '1px solid #e5e7eb'
      }
    }
    
    return {
      backgroundColor: 'white',
      color: '#374151',
      border: '1px solid #e5e7eb'
    }
  }
  
  const styles = getCellStyles()
  
  return (
    <Box
      height="48px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      cursor="pointer"
      onClick={() => onCellClick(dateStr)}
      fontWeight={isToday ? 'bold' : 'normal'}
      fontSize="0.875rem"
      transition="all 0.2s ease"
      position="relative"
      style={{
        ...styles
      }}
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
    >
      {day}
      
      {/* Optional indicator for custom data */}
      {cellData && (
        <Box
          position="absolute"
          top="2px"
          right="2px"
          width="6px"
          height="6px"
          borderRadius="50%"
          backgroundColor="#ef4444"
        />
      )}
    </Box>
  )
}

export default BaseCalendarCell