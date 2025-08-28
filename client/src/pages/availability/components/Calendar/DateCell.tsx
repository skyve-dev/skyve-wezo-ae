import React, { useCallback } from 'react'
import { Box } from '@/components'
import { useAppDispatch } from '@/store'
import { blockDates, unblockDates } from '@/store/slices/availabilitySlice'
import { AvailabilitySlot } from '@/store/slices/availabilitySlice'

interface DateCellProps {
  date: Date
  availability?: AvailabilitySlot
  isCurrentMonth: boolean
  isMobile: boolean
  isFirstRow: boolean
}

export const DateCell: React.FC<DateCellProps> = ({
  date,
  availability,
  isCurrentMonth,
  isMobile,
  isFirstRow
}) => {
  const dispatch = useAppDispatch()
  
  const dateString = date.toISOString().split('T')[0]
  const dayNumber = date.getDate()
  const isToday = new Date().toDateString() === date.toDateString()
  const isWeekend = date.getDay() === 0 || date.getDay() === 6
  
  // Determine cell status
  const getStatus = () => {
    if (!availability) return 'available' // Default to available if no data
    return availability.status
  }
  
  const status = getStatus()
  
  // Handle cell click - toggle availability
  const handleClick = useCallback(() => {
    console.log('=== DateCell Click Debug ===')
    console.log('Date clicked:', dateString)
    console.log('isCurrentMonth:', isCurrentMonth)
    console.log('availability object:', availability)
    console.log('status:', status)
    console.log('dayNumber:', dayNumber)
    
    if (!isCurrentMonth) {
      console.log('❌ Click ignored: Not current month')
      return
    }
    
    // Get propertyId from availability object, fallback to checking if it exists at all
    const propertyId = availability?.propertyId
    if (!propertyId) {
      console.log('❌ Click ignored: No propertyId available')
      console.log('availability?.propertyId:', availability?.propertyId)
      return
    }
    
    const isCurrentlyBlocked = status === 'blocked'
    const dates = [dateString]
    
    console.log('✅ Processing click:')
    console.log('- isCurrentlyBlocked:', isCurrentlyBlocked)
    console.log('- dates to toggle:', dates)
    console.log('- propertyId:', propertyId)
    
    if (isCurrentlyBlocked) {
      console.log('🔄 Dispatching unblockDates...')
      dispatch(unblockDates({ propertyId, dates }))
    } else {
      console.log('🔄 Dispatching blockDates...')
      dispatch(blockDates({ 
        propertyId, 
        dates,
        reason: 'Blocked by host'
      }))
    }
  }, [dispatch, availability, status, dateString, isCurrentMonth, dayNumber])
  
  // Status styling
  const getStatusStyles = () => {
    const baseStyles = {
      cursor: isCurrentMonth ? 'pointer' : 'default',
      transition: 'all 0.2s ease',
      opacity: isCurrentMonth ? 1 : 0.4
    }
    
    if (!isCurrentMonth) {
      return {
        ...baseStyles,
        backgroundColor: '#f8fafc',
        color: '#94a3b8'
      }
    }
    
    switch (status) {
      case 'blocked':
      case 'maintenance':
        return {
          ...baseStyles,
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          borderColor: '#fecaca'
        }
      case 'booked':
        return {
          ...baseStyles,
          backgroundColor: '#fef3c7',
          color: '#d97706',
          borderColor: '#fed7aa'
        }
      case 'available':
      default:
        return {
          ...baseStyles,
          backgroundColor: '#f0fdf4',
          color: '#16a34a',
          borderColor: '#bbf7d0',
          ':hover': {
            backgroundColor: '#dcfce7'
          }
        }
    }
  }
  
  // Today indicator styles
  const todayStyles = isToday ? {
    fontWeight: 'bold',
    position: 'relative' as const,
    '::after': {
      content: '""',
      position: 'absolute' as const,
      bottom: '2px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '4px',
      height: '4px',
      backgroundColor: '#3b82f6',
      borderRadius: '50%'
    }
  } : {}
  
  const cellStyles = getStatusStyles()
  
  return (
    <Box
      padding={isMobile ? "0.5rem 0.25rem" : "0.75rem 0.5rem"}
      textAlign="center"
      borderRight="1px solid #e2e8f0"
      borderBottom={isFirstRow ? "none" : "1px solid #e2e8f0"}
      minHeight={isMobile ? "44px" : "60px"}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      onClick={handleClick}
      style={{
        ...cellStyles,
        ...todayStyles
      }}
      title={
        isCurrentMonth 
          ? `${date.toLocaleDateString()} - ${status} (Click to toggle)`
          : date.toLocaleDateString()
      }
    >
      {/* Day Number */}
      <span style={{
        fontSize: isMobile ? '0.875rem' : '1rem',
        lineHeight: '1.2'
      }}>
        {dayNumber}
      </span>
      
      {/* Status Indicator */}
      {isCurrentMonth && status !== 'available' && (
        <Box
          marginTop="0.125rem"
          width="4px"
          height="4px"
          borderRadius="50%"
          backgroundColor={status === 'blocked' ? '#dc2626' : '#d97706'}
        />
      )}
      
      {/* Weekend Indicator */}
      {isCurrentMonth && isWeekend && status === 'available' && (
        <Box
          marginTop="0.125rem"
          fontSize="0.625rem"
          color="#6b7280"
        >
          •
        </Box>
      )}
    </Box>
  )
}