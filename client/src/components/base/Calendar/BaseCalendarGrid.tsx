import React from 'react'
import { Box } from '../Box'
import BaseCalendarCell from './BaseCalendarCell'
import { CalendarCellData, CalendarCellProps } from './BaseCalendar'

interface BaseCalendarGridProps {
  currentDate: Date
  data: Record<string, CalendarCellData>
  onDateClick: (dateStr: string) => void
  cellRenderer?: React.ComponentType<CalendarCellProps>
  formatDate: (date: Date) => string
  isDateSelected: (dateStr: string) => boolean
}

const BaseCalendarGrid: React.FC<BaseCalendarGridProps> = ({
  currentDate,
  data,
  onDateClick,
  cellRenderer,
  formatDate,
  isDateSelected
}) => {
  // Get the first day of the month and day of week it starts on
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const startDay = firstDay.getDay() // 0 = Sunday
  
  // Get the number of days in the current month
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  
  // Create an array of date objects for the month
  const dates: (Date | null)[] = []
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startDay; i++) {
    dates.push(null)
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    dates.push(date)
  }
  
  // Get today's date for comparison
  const today = new Date()
  const todayStr = formatDate(today)
  
  return (
    <Box
      display="grid"
      gridTemplateColumns="repeat(7, 1fr)"
      gap="1px"
      backgroundColor="#f3f4f6"
      border="1px solid #e5e7eb"
      borderRadius="8px"
      overflow="hidden"
    >
      {dates.map((date, index) => {
        if (!date) {
          // Empty cell for padding
          return (
            <Box 
              key={`empty-${index}`} 
              height="48px" 
              backgroundColor="white"
            />
          )
        }
        
        const dateStr = formatDate(date)
        const cellData = data[dateStr]
        const isSelected = isDateSelected(dateStr)
        const isToday = dateStr === todayStr
        const isPast = date < today
        
        const cellProps: CalendarCellProps = {
          date,
          dateStr,
          cellData,
          isSelected,
          isToday,
          isPast,
          onCellClick: onDateClick
        }
        
        // Use custom renderer if provided, otherwise use default
        const CellComponent = cellRenderer || BaseCalendarCell
        
        return (
          <CellComponent key={dateStr} {...cellProps} />
        )
      })}
    </Box>
  )
}

export default BaseCalendarGrid