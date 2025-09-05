import React, { useState, useMemo, useEffect } from 'react'
import { Box } from './Box'
import { 
  IoIosArrowBack, 
  IoIosArrowForward
} from 'react-icons/io'

interface PriceInfo {
  fullDayPrice: number
  halfDayPrice: number
  currency: string
  isOverride?: boolean
  hasDiscount?: boolean
  originalPrice?: number
  isAvailable?: boolean
}

interface DateRange {
  startDate: Date | null
  endDate: Date | null
}

export interface PricingCalendarProps {
  /**
   * Current selected date range
   */
  value?: DateRange
  
  /**
   * Callback when date range changes
   */
  onChange?: (range: DateRange) => void
  
  /**
   * Pricing data for dates (ISO date string as key)
   */
  priceData?: Record<string, PriceInfo>
  
  /**
   * Default price display mode
   */
  defaultPriceMode?: 'full-day' | 'half-day'
  
  /**
   * Minimum date that can be selected
   */
  minDate?: Date
  
  /**
   * Maximum date that can be selected
   */
  maxDate?: Date
  
  /**
   * Minimum nights for selection
   */
  minNights?: number
  
  /**
   * Maximum nights for selection
   */
  maxNights?: number
  
  /**
   * Whether the calendar is disabled
   */
  disabled?: boolean
  
  /**
   * Loading state
   */
  loading?: boolean
}

/**
 * Pricing Calendar Component
 * 
 * An inline calendar that displays property pricing for each date with the ability
 * to select date ranges. Automatically shows pricing based on booking type.
 * 
 * Features:
 * - Inline calendar display (no drawer)
 * - Price display under each date (driven by booking type)
 * - Smart date selection (single-click for half-day, range for full-stay)
 * - Price highlights (overrides, discounts)
 * - Availability indicators
 * - Month navigation
 * - Mobile responsive
 * 
 * @example
 * ```tsx
 * <PricingCalendar
 *   value={dateRange}
 *   onChange={setDateRange}
 *   priceData={calendarPrices}
 *   defaultPriceMode="full-day"
 *   minNights={1}
 *   maxNights={30}
 * />
 * ```
 */
const PricingCalendar: React.FC<PricingCalendarProps> = ({
  value,
  onChange,
  priceData = {},
  defaultPriceMode = 'full-day',
  minDate,
  maxDate,
  minNights = 1,
  maxNights = 30,
  disabled = false,
  loading = false
}) => {
  
  // Internal state
  const [internalRange, setInternalRange] = useState<DateRange>(value || { startDate: null, endDate: null })
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectionStep, setSelectionStep] = useState<'start' | 'end'>('start')
  
  // Use defaultPriceMode directly instead of internal state
  const priceMode = defaultPriceMode
  
  // Update internal range when controlled value changes
  useEffect(() => {
    if (value) {
      setInternalRange(value)
    }
  }, [value])
  
  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    
    // Start from the beginning of the week containing the first day
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const currentDate = new Date(startDate)
    
    // Generate 6 weeks of days (42 days total)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return days
  }, [currentMonth, currentYear])
  
  // Navigation functions
  const navigateMonth = (direction: 'prev' | 'next') => {
    if (disabled) return
    
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11)
        setCurrentYear(currentYear - 1)
      } else {
        setCurrentMonth(currentMonth - 1)
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0)
        setCurrentYear(currentYear + 1)
      } else {
        setCurrentMonth(currentMonth + 1)
      }
    }
  }
  
  // Check if date is disabled
  const isDateDisabled = (date: Date) => {
    if (disabled) return true
    
    // Check min/max dates
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    
    // For end date selection, check min/max nights constraint
    if (selectionStep === 'end' && internalRange.startDate) {
      const diffTime = date.getTime() - internalRange.startDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < minNights || diffDays > maxNights) return true
    }
    
    // Check availability from price data
    const dateString = date.toISOString().split('T')[0]
    const priceInfo = priceData[dateString]
    if (priceInfo && priceInfo.isAvailable === false) return true
    
    return false
  }
  
  // Check if date is in selected range
  const isDateInRange = (date: Date) => {
    if (!internalRange.startDate || !internalRange.endDate) return false
    
    return date >= internalRange.startDate && date <= internalRange.endDate
  }
  
  // Handle date selection
  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date)) return
    
    const newRange = { ...internalRange }
    const isHalfDayMode = minNights === 0 || defaultPriceMode === 'half-day'
    
    if (isHalfDayMode) {
      // Half-day mode: single click completes selection
      newRange.startDate = date
      newRange.endDate = date // Same date for half-day
      setSelectionStep('start') // Reset for next selection
    } else {
      // Full-stay mode: two-step selection process
      if (selectionStep === 'start' || !internalRange.startDate) {
        // Select start date
        newRange.startDate = date
        newRange.endDate = null
        setSelectionStep('end')
      } else {
        // Select end date
        if (date < internalRange.startDate) {
          // If selected date is before start date, make it the new start date
          newRange.startDate = date
          newRange.endDate = null
          setSelectionStep('end')
        } else {
          // Complete the range selection
          newRange.endDate = date
          setSelectionStep('start')
        }
      }
    }
    
    setInternalRange(newRange)
    
    // Call onChange callback
    if (onChange) {
      onChange(newRange)
    }
  }
  
  // Get price for a specific date
  const getPriceForDate = (date: Date): PriceInfo | null => {
    const dateString = date.toISOString().split('T')[0]
    return priceData[dateString] || null
  }
  
  // Format price display
  const formatPrice = (price: PriceInfo): string => {
    const displayPrice = priceMode === 'half-day' ? price.halfDayPrice : price.fullDayPrice
    return `${price.currency} ${Math.round(displayPrice)}`
  }
  
  // Calculate total price for selected range
  const calculateTotalPrice = (): { total: number, nights: number, currency: string } => {
    if (!internalRange.startDate || !internalRange.endDate) {
      return { total: 0, nights: 0, currency: 'AED' }
    }
    
    const diffTime = internalRange.endDate.getTime() - internalRange.startDate.getTime()
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    let total = 0
    let currency = 'AED'
    
    // Calculate price for each night
    const currentDate = new Date(internalRange.startDate)
    for (let i = 0; i < nights; i++) {
      const priceInfo = getPriceForDate(currentDate)
      if (priceInfo) {
        total += priceMode === 'half-day' ? priceInfo.halfDayPrice : priceInfo.fullDayPrice
        currency = priceInfo.currency
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return { total, nights, currency }
  }
  
  const { total: totalPrice, nights: totalNights, currency } = calculateTotalPrice()
  const today = new Date()
  
  if (loading) {
    return (
      <Box padding="2rem" textAlign="center" color="#6b7280">
        Loading pricing calendar...
      </Box>
    )
  }
  
  return (
    <Box>
      
      {/* Calendar Header */}
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="space-between" 
        marginBottom="1.5rem"
        padding="1rem"
        paddingMd="1.25rem"
        backgroundColor="#f9fafb"
        borderRadius="12px"
      >
        <Box
          cursor="pointer"
          padding="0.5rem"
          borderRadius="4px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          onClick={() => navigateMonth('prev')}
          style={{ 
            opacity: disabled ? 0.5 : 1
          }}
        >
          <IoIosArrowBack size={20} color="#6b7280" />
        </Box>
        
        <Box fontSize="1rem" fontWeight="600" color="#374151">
          {new Date(currentYear, currentMonth).toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          })}
        </Box>
        
        <Box
          cursor="pointer"
          padding="0.5rem"
          borderRadius="4px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          onClick={() => navigateMonth('next')}
          style={{ 
            opacity: disabled ? 0.5 : 1
          }}
        >
          <IoIosArrowForward size={20} color="#6b7280" />
        </Box>
      </Box>
      
      {/* Days of Week Header */}
      <Box 
        display="grid" 
        gridTemplateColumns="repeat(7, 1fr)" 
        gap="1px"
        marginBottom="0.5rem"
      >
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Box
            key={day}
            textAlign="center"
            fontSize="0.875rem"
            fontWeight="600"
            color="#6b7280"
            padding="0.75rem 0"
            paddingMd="1rem 0"
          >
            {day}
          </Box>
        ))}
      </Box>
      
      {/* Calendar Grid */}
      <Box 
        display="grid" 
        gridTemplateColumns="repeat(7, 1fr)" 
        gap="1px"
        backgroundColor="#e5e7eb"
        borderRadius="12px"
        overflow="hidden"
        marginBottom="1.5rem"
      >
        {calendarDays.map((date, index) => {
          const isCurrentMonth = date.getMonth() === currentMonth
          const isToday = date.toDateString() === today.toDateString()
          const isDisabled = isDateDisabled(date)
          const isSelected = (internalRange.startDate && date.toDateString() === internalRange.startDate.toDateString()) ||
                           (internalRange.endDate && date.toDateString() === internalRange.endDate.toDateString())
          const isInRange = isDateInRange(date)
          // const isStartDate = internalRange.startDate && date.toDateString() === internalRange.startDate.toDateString()
          // const isEndDate = internalRange.endDate && date.toDateString() === internalRange.endDate.toDateString()
          const priceInfo = getPriceForDate(date)
          
          let backgroundColor = 'white'
          if (!isCurrentMonth) backgroundColor = '#f9fafb'
          else if (isSelected) backgroundColor = '#3182ce'
          else if (isDisabled) backgroundColor = '#f3f4f6'
          else if (isInRange) backgroundColor = '#dbeafe'
          else if (isToday) backgroundColor = '#eff6ff'
          
          return (
            <Box
              key={index}
              backgroundColor={backgroundColor}
              cursor={!isCurrentMonth || isDisabled ? 'not-allowed' : 'pointer'}
              opacity={!isCurrentMonth || isDisabled ? 0.5 : 1}
              onClick={() => isCurrentMonth && !isDisabled && handleDateSelect(date)}
              padding="0.75rem"
              paddingMd="1rem"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="space-between"
              transition="all 0.2s"
              textAlign="center"
              position="relative"
            >
              {/* Date number */}
              <Box 
                fontSize="1rem"
                fontWeight={isSelected ? "600" : "500"}
                color={isDisabled ? "#9ca3af" : (isSelected ? "white" : "#374151")}
                marginBottom="0.5rem"
              >
                {date.getDate()}
              </Box>
              
              {/* Price display */}
              {priceInfo && isCurrentMonth && !isDisabled && (
                <Box
                  fontSize="0.75rem"
                  fontWeight="700"
                  color={isSelected ? "white" : (priceInfo.isOverride ? "#3182ce" : "#059669")}
                  textAlign="center"
                  lineHeight="1.2"
                >
                  {formatPrice(priceInfo)}
                </Box>
              )}
              
              {/* Special indicators */}
              {priceInfo?.hasDiscount && (
                <Box 
                  position="absolute" 
                  top="4px" 
                  right="4px" 
                  width="6px" 
                  height="6px" 
                  backgroundColor="#22c55e" 
                  borderRadius="50%" 
                />
              )}
              {priceInfo?.isOverride && (
                <Box 
                  position="absolute" 
                  top="4px" 
                  left="4px" 
                  width="6px" 
                  height="6px" 
                  backgroundColor="#3182ce" 
                  borderRadius="50%" 
                />
              )}
            </Box>
          )
        })}
      </Box>
      
      {/* Selection Summary */}
      {(internalRange.startDate || internalRange.endDate) && (
        <Box 
          padding="1rem" 
          backgroundColor="#f0f9ff" 
          border="1px solid #bfdbfe"
          borderRadius="8px"
          marginBottom="1rem"
        >
          <Box fontSize="0.875rem" fontWeight="600" color="#1e40af" marginBottom="0.5rem">
            Selection Summary
          </Box>
          <Box fontSize="0.875rem" color="#1e3a8a">
            {internalRange.startDate && internalRange.endDate ? (
              <>
                {internalRange.startDate.toLocaleDateString()} - {internalRange.endDate.toLocaleDateString()}
                <br />
                {totalNights} night{totalNights !== 1 ? 's' : ''} • {currency} {totalPrice.toLocaleString()}
              </>
            ) : internalRange.startDate ? (
              <>
                Check-in: {internalRange.startDate.toLocaleDateString()}
                <br />
                <span style={{ color: '#6b7280' }}>Select check-out date</span>
              </>
            ) : (
              'Select your dates'
            )}
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default PricingCalendar