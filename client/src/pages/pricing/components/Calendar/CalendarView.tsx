import React, { useMemo, useEffect } from 'react'
import { useSelector } from 'react-redux'
import CalendarGrid from './CalendarGrid'
import { RootState } from '@/store'
import { Box } from '@/components'

const CalendarView: React.FC = () => {
  const {
    dateRange,
    selectedRatePlanIds,
    pricesByRatePlan
  } = useSelector((state: RootState) => state.price)
  
  const { ratePlans } = useSelector((state: RootState) => state.ratePlan)
  
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
  
  // Get selected rate plans with color assignments
  const selectedRatePlans = useMemo(() => {
    return ratePlans
      .filter(rp => selectedRatePlanIds.includes(rp.id))
      .map((rp, index) => ({
        ...rp,
        color: `hsl(${(index * 137.508) % 360}deg, 70%, 50%)`,
        lightColor: `hsl(${(index * 137.508) % 360}deg, 70%, 95%)`
      }))
  }, [ratePlans, selectedRatePlanIds])
  
  // Helper function to normalize date for comparison
  const normalizeDate = (date: string): string => {
    // Handle both 'YYYY-MM-DD' and 'YYYY-MM-DDTHH:mm:ss.sssZ' formats
    return date.split('T')[0]
  }
  
  // Get pricing data for display
  const getPricesForDate = (dateString: string) => {
    const prices = []
    
    // Get day of week for the date (0=Sunday, 1=Monday, ..., 6=Saturday)
    const date = new Date(dateString)
    const dayOfWeek = date.getDay()
    
    for (const ratePlan of selectedRatePlans) {
      // Check if rate plan is active for this day of week
      if (ratePlan.activeDays && ratePlan.activeDays.length > 0) {
        if (!ratePlan.activeDays.includes(dayOfWeek)) {
          continue // Skip this rate plan for this day
        }
      }
      
      const ratePlanPrices = pricesByRatePlan[ratePlan.id] || []
      // Fix: Normalize both stored date and search date for comparison
      const priceForDate = ratePlanPrices.find(p => normalizeDate(p.date) === dateString)
      
      if (priceForDate) {
        // Show custom price if available
        prices.push({
          ratePlan,
          price: priceForDate,
          hasCustomPrice: true
        })
      } else if (ratePlan.adjustmentType === 'FixedPrice' && ratePlan.adjustmentValue > 0) {
        // Show base price for fixed price rate plans
        prices.push({
          ratePlan,
          price: {
            id: `base-${ratePlan.id}-${dateString}`,
            ratePlanId: ratePlan.id,
            date: dateString,
            amount: ratePlan.adjustmentValue,
            createdAt: '',
            updatedAt: ''
          },
          hasCustomPrice: false
        })
      } else if (ratePlan.adjustmentType === 'Percentage' || ratePlan.adjustmentType === 'FixedDiscount') {
        // Show percentage/discount rate plans (like weekly plans)
        // These need a base rate plan to calculate from
        if (ratePlan.baseRatePlanId && ratePlan.adjustmentValue !== undefined) {
          const baseRatePlan = selectedRatePlans.find(rp => rp.id === ratePlan.baseRatePlanId)
          if (baseRatePlan) {
            // Get base price from the base rate plan
            const baseRatePlanPrices = pricesByRatePlan[baseRatePlan.id] || []
            const basePriceForDate = baseRatePlanPrices.find(p => normalizeDate(p.date) === dateString)
            
            let baseAmount = basePriceForDate?.amount || baseRatePlan.adjustmentValue || 0
            let calculatedAmount = baseAmount
            
            if (ratePlan.adjustmentType === 'Percentage') {
              // Apply percentage adjustment (e.g., 85% of base price for weekly discount)
              calculatedAmount = baseAmount * (ratePlan.adjustmentValue / 100)
            } else if (ratePlan.adjustmentType === 'FixedDiscount') {
              // Apply fixed discount (e.g., base price minus fixed amount)
              calculatedAmount = baseAmount - ratePlan.adjustmentValue
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
                hasCustomPrice: false
              })
            }
          }
        }
      }
    }
    
    return prices
  }
  
  if (!dateRange.startDate || selectedRatePlanIds.length === 0) {
    return (
      <Box 
        textAlign="center" 
        padding="3rem" 
        backgroundColor="#f9fafb" 
        borderRadius="8px"
      >
        <p style={{ color: '#6b7280', fontSize: '1rem' }}>
          {!dateRange.startDate 
            ? 'Select a date range to view the calendar'
            : 'Select rate plans to view pricing'
          }
        </p>
      </Box>
    )
  }
  
  return (
    <Box>
      <CalendarGrid
        calendarDays={calendarDays}
        selectedRatePlans={selectedRatePlans}
        getPricesForDate={getPricesForDate}
      />
    </Box>
  )
}

export default CalendarView