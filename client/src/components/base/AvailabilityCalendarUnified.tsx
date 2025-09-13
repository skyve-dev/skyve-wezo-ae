import React from 'react'
import { BaseCalendar, AvailabilityCalendarCell } from './Calendar'
import type { CalendarCellData } from './Calendar'

export interface AvailabilityData {
  date: string // YYYY-MM-DD format
  isAvailable: boolean
  isBlocked?: boolean
  hasBooking?: boolean
  reason?: string
}

interface AvailabilityCalendarProps {
  /**
   * Array of availability data for different dates
   */
  availabilityData: AvailabilityData[]
  
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
   * Enable multi-select mode
   */
  multiSelect?: boolean
  
  /**
   * Show navigation arrows
   */
  showNavigation?: boolean
  
  /**
   * Custom height for the calendar
   */
  height?: string
  
  /**
   * CSS class name
   */
  className?: string
}

/**
 * Unified availability calendar component using the base calendar system
 * Replaces the old availability-specific calendar components
 */
const AvailabilityCalendarUnified: React.FC<AvailabilityCalendarProps> = ({
  availabilityData,
  selectedDate,
  onDateSelect,
  onDateClick,
  initialMonth,
  minDate,
  maxDate,
  multiSelect = false,
  showNavigation = true,
  height,
  className
}) => {
  // Convert availability data array to calendar data format
  const calendarData: Record<string, CalendarCellData> = {}
  
  availabilityData.forEach(item => {
    calendarData[item.date] = {
      date: item.date,
      isAvailable: item.isAvailable,
      isBlocked: item.isBlocked,
      hasBooking: item.hasBooking,
      reason: item.reason
    }
  })
  
  return (
    <BaseCalendar
      data={calendarData}
      selectedDate={selectedDate}
      onDateSelect={onDateSelect}
      onDateClick={onDateClick}
      initialMonth={initialMonth}
      minDate={minDate}
      maxDate={maxDate}
      cellRenderer={AvailabilityCalendarCell}
      showNavigation={showNavigation}
      showHeader={true}
      multiSelect={multiSelect}
      height={height}
      className={className}
    />
  )
}

export default AvailabilityCalendarUnified