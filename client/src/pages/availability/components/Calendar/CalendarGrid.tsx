import React from 'react'
import { Box } from '@/components'
import { CalendarMonth } from '@/store/slices/availabilitySlice'
import { DateCell } from './DateCell'

interface CalendarGridProps {
  availability: CalendarMonth[]
  currentMonth: { year: number; month: number }
  loading: boolean
  isMobile: boolean
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  availability,
  currentMonth,
  loading,
  isMobile
}) => {
  // Get current month data
  const currentMonthData = availability.find(
    month => month.year === currentMonth.year && month.month === currentMonth.month
  )

  // Generate calendar grid
  const generateCalendarDays = () => {
    const year = currentMonth.year
    const month = currentMonth.month - 1 // Convert to 0-based for Date constructor
    
    // First day of the month
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // Start from Sunday of the week containing the first day
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    // End on Saturday of the week containing the last day
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))
    
    const days = []
    const current = new Date(startDate)
    
    while (current <= endDate) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  const calendarDays = generateCalendarDays()
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Get availability data for a specific date
  const getAvailabilityForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    const foundAvailability = currentMonthData?.days.find(day => day.date === dateString)
    
    return foundAvailability
  }

  if (loading) {
    return (
      <Box 
        padding="3rem" 
        textAlign="center" 
        backgroundColor="white" 
        borderRadius="8px"
        boxShadow="0 1px 3px rgba(0,0,0,0.1)"
      >
        <Box 
          width="40px" 
          height="40px" 
          border="4px solid #f3f4f6" 
          borderTop="4px solid #3b82f6" 
          borderRadius="50%" 
          margin="0 auto 1rem auto"
          style={{ animation: 'spin 1s linear infinite' }}
        />
        <p style={{ color: '#6b7280', margin: 0 }}>Loading availability...</p>
      </Box>
    )
  }

  return (
    <Box 
      backgroundColor="white" 
      borderRadius="8px" 
      boxShadow="0 1px 3px rgba(0,0,0,0.1)"
      overflow="hidden"
    >
      {/* Calendar Header - Week Days */}
      <Box 
        display="grid" 
        gridTemplateColumns="repeat(7, 1fr)"
        backgroundColor="#f8fafc"
        borderBottom="1px solid #e2e8f0"
      >
        {weekDays.map(day => (
          <Box 
            key={day}
            padding="0.75rem 0.5rem"
            textAlign="center"
            borderRight="1px solid #e2e8f0"
          >
            <span style={{
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              fontWeight: '600',
              color: '#475569'
            }}>
              {isMobile ? day.charAt(0) : day}
            </span>
          </Box>
        ))}
      </Box>

      {/* Calendar Body - Date Cells */}
      <Box 
        display="grid" 
        gridTemplateColumns="repeat(7, 1fr)"
      >
        {calendarDays.map((date, index) => {
          const availability = getAvailabilityForDate(date)
          const isCurrentMonth = date.getMonth() === (currentMonth.month - 1)
          
          return (
            <DateCell
              key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
              date={date}
              availability={availability}
              isCurrentMonth={isCurrentMonth}
              isMobile={isMobile}
              isFirstRow={index < 7}
            />
          )
        })}
      </Box>
    </Box>
  )
}