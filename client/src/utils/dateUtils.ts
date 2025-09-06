/**
 * Date Utilities - Central date formatting and parsing functions
 * 
 * Core Principle: Always use LOCAL timezone for user-facing date operations
 * Only use UTC/ISO for API timestamps that require timezone coordination
 */

/**
 * Format a Date object as a local date string (YYYY-MM-DD)
 * This preserves the local date exactly as the user sees it
 */
export const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parse a local date string (YYYY-MM-DD) as a Date object in local timezone
 * This ensures the Date represents the exact local date, not shifted by timezone
 */
export const parseDateLocal = (dateString: string): Date => {
  // Parse YYYY-MM-DD as local date (not UTC)
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day) // month is 0-indexed
}

/**
 * Get current date as local date string (YYYY-MM-DD)
 */
export const getCurrentDateLocal = (): string => {
  return formatDateLocal(new Date())
}

/**
 * Add days to a date and return as local date string
 */
export const addDaysLocal = (date: Date, days: number): string => {
  const newDate = new Date(date)
  newDate.setDate(newDate.getDate() + days)
  return formatDateLocal(newDate)
}

/**
 * Add days to a date string and return as local date string
 */
export const addDaysToDateString = (dateString: string, days: number): string => {
  const date = parseDateLocal(dateString)
  return addDaysLocal(date, days)
}

/**
 * Validate that a string is a valid date string format
 */
export const isValidDateString = (dateString: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false
  }
  
  const date = parseDateLocal(dateString)
  const formatted = formatDateLocal(date)
  return formatted === dateString && !isNaN(date.getTime())
}

/**
 * Generate an array of date strings between start and end dates (inclusive)
 */
export const getDateRange = (startDate: Date, endDate: Date): string[] => {
  const dates: string[] = []
  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    dates.push(formatDateLocal(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return dates
}

/**
 * Generate an array of date strings between start and end date strings (inclusive)
 */
export const getDateRangeFromStrings = (startDateString: string, endDateString: string): string[] => {
  const startDate = parseDateLocal(startDateString)
  const endDate = parseDateLocal(endDateString)
  return getDateRange(startDate, endDate)
}

/**
 * Check if a date string represents today
 */
export const isToday = (dateString: string): boolean => {
  return dateString === getCurrentDateLocal()
}

/**
 * Check if a date string represents a weekend (Saturday or Sunday)
 */
export const isWeekend = (dateString: string): boolean => {
  const date = parseDateLocal(dateString)
  const dayOfWeek = date.getDay()
  return dayOfWeek === 0 || dayOfWeek === 6 // Sunday = 0, Saturday = 6
}

/**
 * Get the day of week for a date string (0 = Sunday, 6 = Saturday)
 */
export const getDayOfWeek = (dateString: string): number => {
  const date = parseDateLocal(dateString)
  return date.getDay()
}

/**
 * Format date for DatePicker components (same as formatDateLocal for consistency)
 */
export const formatDateForDatePicker = (date: Date): string => {
  return formatDateLocal(date)
}

/**
 * Get a date string for use with DatePicker min/max constraints
 */
export const getDatePickerDate = (date: Date): string => {
  return formatDateLocal(date)
}

/**
 * Compare two date strings (returns -1, 0, or 1 like Array.sort)
 */
export const compareDateStrings = (dateA: string, dateB: string): number => {
  if (dateA < dateB) return -1
  if (dateA > dateB) return 1
  return 0
}

/**
 * Check if dateA is before dateB
 */
export const isBefore = (dateA: string, dateB: string): boolean => {
  return dateA < dateB
}

/**
 * Check if dateA is after dateB
 */
export const isAfter = (dateA: string, dateB: string): boolean => {
  return dateA > dateB
}

/**
 * Check if dateA is same as dateB
 */
export const isSameDate = (dateA: string, dateB: string): boolean => {
  return dateA === dateB
}