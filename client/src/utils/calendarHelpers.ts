/**
 * Calendar utility functions for date range calculations
 */

export interface DateRange {
  startDate: string
  endDate: string
}

export interface ExpandedDateRange {
  calendarStartDate: string
  calendarEndDate: string
}

/**
 * Helper function to format date without timezone issues
 */
export const formatDateForApi = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Calculate the full calendar grid date range including overflow dates
 * from previous and next months to fill the calendar grid completely
 */
export const calculateCalendarGridRange = (dateRange: DateRange): ExpandedDateRange => {
  const startDate = new Date(dateRange.startDate)
  const year = startDate.getFullYear()
  const month = startDate.getMonth()
  
  // Get first day of month and calculate start padding
  const firstDay = new Date(year, month, 1)
  const startPadding = firstDay.getDay()
  const calendarStartDate = new Date(year, month, -startPadding + 1)
  
  // Get last day of month and calculate end padding
  const lastDay = new Date(year, month + 1, 0)
  const endPadding = 6 - lastDay.getDay()
  const calendarEndDate = new Date(year, month + 1, endPadding)
  
  return {
    calendarStartDate: formatDateForApi(calendarStartDate),
    calendarEndDate: formatDateForApi(calendarEndDate)
  }
}

/**
 * Helper function to format date without timezone issues (for local display)
 */
export const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}