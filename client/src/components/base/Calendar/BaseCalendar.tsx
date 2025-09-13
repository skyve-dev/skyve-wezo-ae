import React, { useState } from 'react'
import { Box } from '../Box'
import BaseCalendarGrid from './BaseCalendarGrid'
import BaseCalendarHeader from './BaseCalendarHeader'

export interface CalendarCellData {
  date: string // YYYY-MM-DD format
  [key: string]: any // Allow custom data properties
}

export interface CalendarCellProps {
  date: Date | null
  dateStr: string
  cellData?: CalendarCellData
  isSelected: boolean
  isToday: boolean
  isPast: boolean
  onCellClick: (dateStr: string) => void
  customRenderer?: React.ComponentType<CalendarCellProps>
}

interface BaseCalendarProps {
  /**
   * Calendar data - maps date strings to data objects
   */
  data?: Record<string, CalendarCellData>
  
  /**
   * Currently selected date(s) in YYYY-MM-DD format
   */
  selectedDate?: string | string[]
  
  /**
   * Callback when a date is selected
   */
  onDateSelect?: (date: string) => void
  
  /**
   * Callback when a date is clicked
   */
  onDateClick?: (date: string) => void
  
  /**
   * Initial month to display (defaults to current month)
   */
  initialMonth?: Date
  
  /**
   * Minimum date that can be selected
   */
  minDate?: Date
  
  /**
   * Maximum date that can be selected
   */
  maxDate?: Date
  
  /**
   * Custom cell renderer component
   */
  cellRenderer?: React.ComponentType<CalendarCellProps>
  
  /**
   * Show navigation arrows
   */
  showNavigation?: boolean
  
  /**
   * Show month/year header
   */
  showHeader?: boolean
  
  /**
   * Custom header component
   */
  headerRenderer?: React.ComponentType<{ currentDate: Date; onNavigate: (date: Date) => void }>
  
  /**
   * Multi-select mode
   */
  multiSelect?: boolean
  
  /**
   * CSS classes for styling
   */
  className?: string
  
  /**
   * Calendar height
   */
  height?: string
}

/**
 * Unified base calendar component that can be configured for different use cases
 * Supports pricing calendar, availability calendar, and other calendar types
 */
const BaseCalendar: React.FC<BaseCalendarProps> = ({
  data = {},
  selectedDate,
  onDateSelect,
  onDateClick,
  initialMonth = new Date(),
  minDate,
  maxDate,
  cellRenderer,
  showNavigation = true,
  showHeader = true,
  headerRenderer,
  // multiSelect = false, // TODO: Implement multi-select functionality
  className,
  height = 'auto'
}) => {
  const [currentDate, setCurrentDate] = useState(initialMonth)
  
  // Helper function to format date as YYYY-MM-DD
  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  // Helper function to check if date is selected
  const isDateSelected = (dateStr: string): boolean => {
    if (!selectedDate) return false
    if (Array.isArray(selectedDate)) {
      return selectedDate.includes(dateStr)
    }
    return selectedDate === dateStr
  }
  
  // Navigation handlers
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }
  
  // Handle date click
  const handleDateClick = (dateStr: string) => {
    // Check date constraints
    const clickedDate = new Date(dateStr)
    if (minDate && clickedDate < minDate) return
    if (maxDate && clickedDate > maxDate) return
    
    // Call callbacks
    onDateSelect?.(dateStr)
    onDateClick?.(dateStr)
  }
  
  return (
    <Box className={className} height={height}>
      {/* Calendar Header */}
      {showHeader && (
        headerRenderer ? (
          React.createElement(headerRenderer, {
            currentDate,
            onNavigate: setCurrentDate
          })
        ) : (
          <BaseCalendarHeader
            currentDate={currentDate}
            onNavigate={navigateMonth}
            showNavigation={showNavigation}
          />
        )
      )}
      
      {/* Day Labels */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(7, 1fr)"
        gap="1px"
        marginBottom="8px"
      >
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Box
            key={day}
            textAlign="center"
            fontSize="0.875rem"
            fontWeight="600"
            color="#6b7280"
            padding="8px 4px"
          >
            {day}
          </Box>
        ))}
      </Box>
      
      {/* Calendar Grid */}
      <BaseCalendarGrid
        currentDate={currentDate}
        data={data}
        onDateClick={handleDateClick}
        cellRenderer={cellRenderer}
        formatDate={formatDate}
        isDateSelected={isDateSelected}
      />
    </Box>
  )
}

export default BaseCalendar