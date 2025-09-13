import React from 'react'
import { Box } from '../Box'
import { IoIosAdd } from 'react-icons/io'
import { CalendarCellProps } from './BaseCalendar'

interface PricingCellData {
  price?: number
  currency?: string
  isOverride?: boolean
  hasBooking?: boolean
}

/**
 * Specialized calendar cell for pricing calendar
 * Shows price, currency, and pricing states
 */
const PricingCalendarCell: React.FC<CalendarCellProps> = ({
  date,
  dateStr,
  cellData,
  isSelected,
  isToday,
  isPast,
  onCellClick
}) => {
  if (!date) {
    return <Box height="64px" backgroundColor="white" />
  }
  
  const day = date.getDate()
  const pricingData = cellData as PricingCellData | undefined
  
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
    
    if (pricingData?.hasBooking) {
      return {
        backgroundColor: '#fef3c7',
        color: '#92400e',
        border: '1px solid #f59e0b'
      }
    }
    
    if (pricingData?.isOverride) {
      return {
        backgroundColor: '#ecfdf5',
        color: '#065f46',
        border: '1px solid #10b981'
      }
    }
    
    if (isPast) {
      return {
        backgroundColor: pricingData?.price ? '#f9fafb' : '#fcfcfc',
        color: '#9ca3af',
        border: '1px solid #e5e7eb',
        cursor: 'not-allowed',
        opacity: 0.85
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
      height="64px"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      cursor={isPast ? "not-allowed" : "pointer"}
      onClick={() => !isPast && onCellClick(dateStr)}
      fontWeight={isToday ? 'bold' : 'normal'}
      transition="all 0.2s ease"
      position="relative"
      style={styles}
      onMouseEnter={(e) => {
        if (!isPast) {
          if (isSelected) {
            e.currentTarget.style.backgroundColor = '#2563eb'
          } else {
            e.currentTarget.style.backgroundColor = '#f3f4f6'
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!isPast) {
          e.currentTarget.style.backgroundColor = styles.backgroundColor
        }
      }}
    >
      {/* Day number */}
      <Box
        fontSize="0.875rem"
        fontWeight={isToday ? 'bold' : 'medium'}
        marginBottom="2px"
      >
        {day}
      </Box>
      
      {/* Price, Add button, or past date indicator */}
      {pricingData?.price ? (
        <Box
          fontSize="0.75rem"
          fontWeight="600"
          textAlign="center"
          color={isPast ? '#9ca3af' : (isSelected ? 'white' : '#059669')}
          style={{ opacity: isPast ? 0.7 : 1 }}
        >
          {pricingData.currency || '$'}{pricingData.price}
        </Box>
      ) : isPast ? (
        <Box
          fontSize="0.75rem"
          color="#9ca3af"
          style={{ opacity: 0.5 }}
        >
          —
        </Box>
      ) : (
        <Box
          fontSize="0.75rem"
          color={isSelected ? 'white' : '#6b7280'}
          style={{ opacity: 0.6 }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.6'
          }}
        >
          <IoIosAdd size={14} />
        </Box>
      )}
      
      {/* Indicators */}
      <Box position="absolute" top="2px" right="2px" display="flex" gap="2px">
        {pricingData?.hasBooking && (
          <Box
            width="6px"
            height="6px"
            borderRadius="50%"
            backgroundColor="#f59e0b"
            title="Has booking"
          />
        )}
        {pricingData?.isOverride && (
          <Box
            width="6px"
            height="6px"
            borderRadius="50%"
            backgroundColor="#10b981"
            title="Price override"
          />
        )}
      </Box>
    </Box>
  )
}

export default PricingCalendarCell