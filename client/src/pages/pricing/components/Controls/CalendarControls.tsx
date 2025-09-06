import React from 'react'
import { useSelector } from 'react-redux'
import { RootState, useAppDispatch } from '@/store'
import { IoChevronBack, IoChevronForward, IoCalendar, IoPencil } from 'react-icons/io5'
import { Box } from '@/components'
import Button from '@/components/base/Button'
import { setDateRange, toggleBulkEditMode } from '@/store/slices/priceSlice'

const CalendarControls: React.FC = () => {
  const dispatch = useAppDispatch()
  const { dateRange, bulkEditMode, selectedDates } = useSelector((state: RootState) => state.price)
  
  // Helper function to format date without timezone issues
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  // Get current viewing month info
  const getCurrentMonthInfo = () => {
    if (!dateRange.startDate) return { monthYear: 'No Date', canGoPrev: false, canGoNext: true }
    
    const currentDate = new Date(dateRange.startDate)
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    
    const monthYear = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    
    // Don't allow going to past months
    const today = new Date()
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    
    const canGoPrev = currentMonth > thisMonth
    const canGoNext = true // Always allow going forward
    
    return { monthYear, canGoPrev, canGoNext }
  }
  
  const { monthYear, canGoPrev, canGoNext } = getCurrentMonthInfo()
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    if (!dateRange.startDate || !canGoPrev) return
    
    const currentDate = new Date(dateRange.startDate)
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    const lastDayOfPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0)
    
    dispatch(setDateRange({
      startDate: formatDateLocal(prevMonth),
      endDate: formatDateLocal(lastDayOfPrevMonth)
    }))
  }
  
  // Navigate to next month
  const goToNextMonth = () => {
    if (!dateRange.startDate || !canGoNext) return
    
    const currentDate = new Date(dateRange.startDate)
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    const lastDayOfNextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0)
    
    dispatch(setDateRange({
      startDate: formatDateLocal(nextMonth),
      endDate: formatDateLocal(lastDayOfNextMonth)
    }))
  }
  
  // Navigate to current month
  const goToToday = () => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    
    dispatch(setDateRange({
      startDate: formatDateLocal(firstDay),
      endDate: formatDateLocal(lastDay)
    }))
  }
  
  const isMobile = window.innerWidth < 768
  
  return (
    <Box display="flex" gap="1rem" alignItems="center" flexWrap="wrap">
      {/* Month Navigation */}
      <Box display="flex" alignItems="center" gap="0.5rem">
        <Button
          label=""
          icon={<IoChevronBack />}
          onClick={goToPreviousMonth}
          disabled={!canGoPrev}
          variant="plain"
          size="small"
          title="Previous month"
          style={{
            color: canGoPrev ? '#374151' : '#9ca3af',
            cursor: canGoPrev ? 'pointer' : 'not-allowed'
          }}
        />
        
        <Box 
          minWidth={isMobile ? '120px' : '160px'}
          textAlign="center"
          fontSize={isMobile ? '0.875rem' : '1rem'}
          fontWeight="600"
          color="#374151"
        >
          {monthYear}
        </Box>
        
        <Button
          label=""
          icon={<IoChevronForward />}
          onClick={goToNextMonth}
          disabled={!canGoNext}
          variant="plain"
          size="small"
          title="Next month"
          style={{
            color: canGoNext ? '#374151' : '#9ca3af',
            cursor: canGoNext ? 'pointer' : 'not-allowed'
          }}
        />
      </Box>
      
      {/* Today Button */}
      <Button
        label={isMobile ? "" : "Today"}
        icon={<IoCalendar />}
        onClick={goToToday}
        variant="normal"
        size="small"
        title="Go to current month"
      />
      
      {/* Bulk Edit Toggle */}
      <Button
        label={isMobile ? "" : (bulkEditMode ? "Exit Bulk Edit" : "Bulk Edit")}
        icon={<IoPencil />}
        onClick={() => dispatch(toggleBulkEditMode())}
        variant={bulkEditMode ? "promoted" : "normal"}
        size="small"
        title={bulkEditMode ? "Exit bulk edit mode" : "Enter bulk edit mode"}
        style={{
          backgroundColor: bulkEditMode ? '#D52122' : undefined,
          borderColor: bulkEditMode ? '#D52122' : undefined,
          color: bulkEditMode ? 'white' : undefined
        }}
      />
      
      {/* Selected Count (when in bulk edit mode) */}
      {bulkEditMode && selectedDates.length > 0 && (
        <Box
          padding="0.25rem 0.5rem"
          backgroundColor="#f59e0b"
          color="white"
          borderRadius="12px"
          fontSize="0.625rem"
          fontWeight="600"
        >
          {selectedDates.length} SELECTED
        </Box>
      )}
    </Box>
  )
}

export default CalendarControls