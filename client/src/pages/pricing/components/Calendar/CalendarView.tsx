import React, {useEffect, useMemo} from 'react'
import {useSelector} from 'react-redux'
import CalendarGrid from './CalendarGrid'
import DateOverrideDialog from '../Controls/DateOverrideDialog'
import {RootState, useAppDispatch} from '@/store'
import {Box} from '@/components'
import { fetchPricingCalendar } from '@/store/slices/priceSlice'

const CalendarView: React.FC = () => {
  const dispatch = useAppDispatch()
  const {
    dateRange,
    selectedRatePlanIds,
    pricesByRatePlan,
    propertyPricing,
    pricingCalendar
  } = useSelector((state: RootState) => state.price)
  
  // Debug logging for component state
  console.log('🔍 CalendarView render state:', {
    dateRange,
    selectedRatePlanIds,
    selectedRatePlanIdsLength: selectedRatePlanIds.length,
    propertyPricing,
    pricesByRatePlan
  })
  
  const { ratePlans } = useSelector((state: RootState) => state.ratePlan)
  const { currentProperty } = useSelector((state: RootState) => state.property)
  
  // Fetch pricing calendar when date range changes and no rate plans are selected (base pricing mode)
  useEffect(() => {
    if (
      dateRange.startDate && 
      dateRange.endDate && 
      selectedRatePlanIds.length === 0 && 
      currentProperty?.propertyId
    ) {
      console.log('🔄 Fetching pricing calendar for base pricing mode')
      dispatch(fetchPricingCalendar({
        propertyId: currentProperty.propertyId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }))
    }
  }, [dateRange.startDate, dateRange.endDate, selectedRatePlanIds.length, currentProperty?.propertyId, dispatch])
  
  // Helper function to format date without timezone issues
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  // Monitor dateRange changes
  useEffect(() => {
    // dateRange changed - component will re-render
  }, [dateRange])
  
  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    if (!dateRange.startDate || !dateRange.endDate) {
      return []
    }
    
    const startDate = new Date(dateRange.startDate)
    const year = startDate.getFullYear()
    const month = startDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []
    
    // Add padding days from previous month
    const startPadding = firstDay.getDay()
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i)
      days.push({
        date,
        dateString: formatDateLocal(date),
        isCurrentMonth: false,
        isToday: false,
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      })
    }
    
    // Add days of current month
    const today = formatDateLocal(new Date())
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i)
      const dateString = formatDateLocal(date)
      days.push({
        date,
        dateString,
        isCurrentMonth: true,
        isToday: dateString === today,
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      })
    }
    
    // Add padding days from next month
    const endPadding = 6 - lastDay.getDay()
    for (let i = 1; i <= endPadding; i++) {
      const date = new Date(year, month + 1, i)
      days.push({
        date,
        dateString: formatDateLocal(date),
        isCurrentMonth: false,
        isToday: false,
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      })
    }
    
    return days
  }, [dateRange])
  
  // Get current month info for filtering (used by other components)
  // const currentDate = dateRange.startDate ? new Date(dateRange.startDate) : new Date()
  
  // Filter rate plans based on seasonal restrictions for the current month
  const getFilteredRatePlansForMonth = () => {
    return ratePlans.filter(rp => {
      if (!rp.isActive) return false
      
      // Note: Seasonal restrictions feature not yet implemented in current schema
      // This will be added in future versions
      // For now, show all active rate plans
      return true
    })
  }

  // Get selected rate plans with color assignments
  const selectedRatePlans = useMemo(() => {
    return getFilteredRatePlansForMonth()
      .filter(rp => selectedRatePlanIds.includes(rp.id))
      .map((rp, index) => ({
        ...rp,
        color: `hsl(${(index * 137.508) % 360}deg, 70%, 50%)`,
        lightColor: `hsl(${(index * 137.508) % 360}deg, 70%, 95%)`
      }))
  }, [ratePlans, selectedRatePlanIds, dateRange.startDate])
  
  // Helper function to normalize date for comparison
  const normalizeDate = (date: string): string => {
    // Handle both 'YYYY-MM-DD' and 'YYYY-MM-DDTHH:mm:ss.sssZ' formats
    return date.split('T')[0]
  }
  
  // Helper function to get base price from PropertyPricing for a specific day
  const getBasePriceFromPropertyPricing = (dayOfWeek: number): number | null => {
    console.log('🔍 getBasePriceFromPropertyPricing called:', {
      dayOfWeek,
      propertyPricing: propertyPricing,
      propertyPricingKeys: propertyPricing ? Object.keys(propertyPricing) : 'null',
      propertyPricingValues: propertyPricing ? Object.values(propertyPricing) : 'null'
    })
    
    if (!propertyPricing) {
      console.log('❌ No propertyPricing data available')
      return null
    }
    
    // Map day of week to PropertyPricing field names
    const dayFieldMap = {
      0: 'priceSunday',     // Sunday
      1: 'priceMonday',     // Monday
      2: 'priceTuesday',    // Tuesday
      3: 'priceWednesday',  // Wednesday
      4: 'priceThursday',   // Thursday
      5: 'priceFriday',     // Friday
      6: 'priceSaturday'    // Saturday
    }
    
    const fieldName = dayFieldMap[dayOfWeek as keyof typeof dayFieldMap]
    console.log('🔍 Day field mapping:', { dayOfWeek, fieldName })
    
    if (!fieldName) {
      console.log('❌ No field name found for dayOfWeek:', dayOfWeek)
      return null
    }
    
    const basePrice = propertyPricing[fieldName as keyof typeof propertyPricing] as number
    console.log('🔍 Base price lookup:', { fieldName, basePrice })
    
    const result = basePrice > 0 ? basePrice : null
    console.log('🔍 Final result:', result)
    
    return result
  }
  
  // Get pricing data for display
  const getPricesForDate = (dateString: string) => {
    console.log('🔍 getPricesForDate called for date:', dateString)
    const prices = []
    
    // Get day of week for the date (0=Sunday, 1=Monday, ..., 6=Saturday)
    const date = new Date(dateString)
    const dayOfWeek = date.getDay()
    
    console.log('🔍 Date info:', { dateString, date, dayOfWeek })
    console.log('🔍 Selected rate plans count:', selectedRatePlans.length)
    
    // If rate plans are selected, process them
    if (selectedRatePlans.length > 0) {
      for (const ratePlan of selectedRatePlans) {
        // Note: activeDays feature not yet implemented in current schema
        // This will be added in future versions to support day-specific rate plans
        
        const ratePlanPrices = pricesByRatePlan[ratePlan.id] || []
        // Fix: Normalize both stored date and search date for comparison
        const priceForDate = ratePlanPrices.find(p => normalizeDate(p.date) === dateString)
        
        if (priceForDate) {
          // Show custom price if available
          prices.push({
            ratePlan,
            price: priceForDate,
            hasCustomPrice: true,
            isBasePricing: false
          })
        } else if (ratePlan.priceModifierType === 'FixedAmount' && ratePlan.priceModifierValue > 0) {
          // Show base price for fixed price rate plans
          prices.push({
            ratePlan,
            price: {
              id: `base-${ratePlan.id}-${dateString}`,
              ratePlanId: ratePlan.id,
              date: dateString,
              amount: ratePlan.priceModifierValue,
              createdAt: '',
              updatedAt: ''
            },
            hasCustomPrice: false,
            isBasePricing: false
          })
        } else if (ratePlan.priceModifierType === 'Percentage') {
          // Show percentage rate plans
          // Note: baseRatePlanId feature not yet implemented in current schema
          // For now, we'll apply percentage to PropertyPricing base rates
          const basePrice = getBasePriceFromPropertyPricing(dayOfWeek)
          
          if (basePrice !== null && basePrice > 0) {
            

            let calculatedAmount = basePrice
            
            if (ratePlan.priceModifierType === 'Percentage') {
              // Apply percentage adjustment 
              // Positive values: +10% = 110% of base price (basePrice * 1.10)
              // Negative values: -15% = 85% of base price (basePrice * 0.85)
              calculatedAmount = basePrice * (1 + ratePlan.priceModifierValue / 100)
            }
              
            if (calculatedAmount > 0) {
              prices.push({
                ratePlan,
                price: {
                  id: `calculated-${ratePlan.id}-${dateString}`,
                  ratePlanId: ratePlan.id,
                  date: dateString,
                  amount: calculatedAmount,
                  createdAt: '',
                  updatedAt: ''
                },
                hasCustomPrice: false,
                isBasePricing: false
              })
            }
          }
        } else {
          // Fallback to PropertyPricing base rates when no custom price exists
          // and rate plan doesn't have fixed adjustments
          const basePrice = getBasePriceFromPropertyPricing(dayOfWeek)
          
          if (basePrice !== null && basePrice > 0) {
            let calculatedAmount = basePrice
            
            // Apply rate plan modifiers to base price
            if ((ratePlan.priceModifierType as string) === 'Percentage') {
              calculatedAmount = basePrice * (1 + ratePlan.priceModifierValue / 100)
            } else {
              // FixedAmount type - use the fixed value directly
              calculatedAmount = ratePlan.priceModifierValue
            }
            
            if (calculatedAmount > 0) {
              prices.push({
                ratePlan,
                price: {
                  id: `property-base-${ratePlan.id}-${dateString}`,
                  ratePlanId: ratePlan.id,
                  date: dateString,
                  amount: calculatedAmount,
                  createdAt: '',
                  updatedAt: ''
                },
                hasCustomPrice: false,
                isBasePricing: false
              })
            }
          }
        }
      }
    } else {
      // Base pricing mode - use pricing calendar if available, otherwise fallback to PropertyPricing
      console.log('🟡 BASE PRICING MODE: No rate plans selected for date:', dateString)
      
      // First, check if we have pricing calendar data
      const calendarDay = pricingCalendar.find(day => normalizeDate(day.date) === dateString)
      
      if (calendarDay) {
        console.log('✅ Using pricing calendar data for date:', dateString, 'price:', calendarDay.fullDayPrice, 'halfDay:', calendarDay.halfDayPrice, 'isOverride:', calendarDay.isOverride)
        prices.push({
          ratePlan: undefined, // No rate plan for base pricing
          price: {
            id: calendarDay.isOverride ? `override-${dateString}` : `base-pricing-${dateString}`,
            ratePlanId: undefined,
            date: dateString,
            amount: calendarDay.fullDayPrice,
            createdAt: '',
            updatedAt: ''
          },
          hasCustomPrice: calendarDay.isOverride,
          isBasePricing: true,
          reason: calendarDay.reason, // Add reason for overrides
          halfDayPrice: calendarDay.halfDayPrice // Add half-day price from calendar data
        })
      } else {
        // Fallback to PropertyPricing when no calendar data available
        console.log('🟡 FALLBACK: Using PropertyPricing for date:', dateString, 'dayOfWeek:', dayOfWeek)
        
        const basePrice = getBasePriceFromPropertyPricing(dayOfWeek)
        
        if (basePrice !== null && basePrice > 0) {
          console.log('✅ Adding base pricing entry for date:', dateString, 'amount:', basePrice)
          prices.push({
            ratePlan: undefined, // No rate plan for base pricing
            price: {
              id: `base-pricing-${dateString}`,
              ratePlanId: undefined,
              date: dateString,
              amount: basePrice,
              createdAt: '',
              updatedAt: ''
            },
            hasCustomPrice: false,
            isBasePricing: true
          })
        } else {
          console.log('❌ No valid base price found for date:', dateString, 'dayOfWeek:', dayOfWeek)
        }
      }
    }
    
    console.log('🔍 Final prices array for date:', dateString, 'count:', prices.length, 'prices:', prices)
    return prices
  }
  
  if (!dateRange.startDate) {
    return (
      <Box 
        textAlign="center" 
        padding="3rem" 
        backgroundColor="#f9fafb" 
        borderRadius="8px"
      >
        <p style={{ color: '#6b7280', fontSize: '1rem' }}>
          Select a date range to view the calendar
        </p>
      </Box>
    )
  }
  
  // Show pricing mode indicator
  const pricingModeMessage = selectedRatePlanIds.length === 0 
    ? 'Showing base property pricing (no rate plans selected)'
    : `Showing pricing for ${selectedRatePlanIds.length} selected rate plan${selectedRatePlanIds.length > 1 ? 's' : ''}`
  
  return (
    <Box>
      {/* Pricing mode indicator */}
      <Box 
        marginBottom="1rem" 
        padding="0.75rem" 
        backgroundColor={selectedRatePlanIds.length === 0 ? "#fef3c7" : "#e0f2fe"}
        borderRadius="8px"
        fontSize="0.875rem"
        color={selectedRatePlanIds.length === 0 ? "#92400e" : "#0c4a6e"}
        fontWeight="500"
      >
        {pricingModeMessage}
      </Box>
      
      <CalendarGrid
        calendarDays={calendarDays}
        selectedRatePlans={selectedRatePlans}
        getPricesForDate={getPricesForDate}
      />
      
      {/* Date Override Dialog */}
      <DateOverrideDialog />
    </Box>
  )
}

export default CalendarView