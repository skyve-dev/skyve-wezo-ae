import React from 'react'
import { BaseCalendar, PricingCalendarCell } from './Calendar'
import type { CalendarCellData } from './Calendar'

export interface PricingData {
  date: string // YYYY-MM-DD format
  price: number
  currency: string
  isOverride?: boolean
  hasBooking?: boolean
}

interface PricingCalendarProps {
  /**
   * Array of pricing data for different dates
   */
  pricingData: PricingData[]
  
  /**
   * Currently selected date in YYYY-MM-DD format
   */
  selectedDate?: string
  
  /**
   * Callback when a date is selected
   */
  onDateSelect?: (date: string) => void
  
  /**
   * Callback when a date is clicked for price editing
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
 * Unified pricing calendar component using the base calendar system
 * Replaces the old PricingCalendar.tsx and pricing-specific calendar components
 */
const PricingCalendarUnified: React.FC<PricingCalendarProps> = ({
  pricingData,
  selectedDate,
  onDateSelect,
  onDateClick,
  initialMonth,
  minDate,
  maxDate,
  showNavigation = true,
  height,
  className
}) => {
  // Convert pricing data array to calendar data format
  const calendarData: Record<string, CalendarCellData> = {}
  
  pricingData.forEach(item => {
    calendarData[item.date] = {
      date: item.date,
      price: item.price,
      currency: item.currency,
      isOverride: item.isOverride,
      hasBooking: item.hasBooking
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
      cellRenderer={PricingCalendarCell}
      showNavigation={showNavigation}
      showHeader={true}
      height={height}
      className={className}
    />
  )
}

export default PricingCalendarUnified