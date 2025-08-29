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
    console.log('=== CALENDAR VIEW - dateRange changed ===')
    console.log('New dateRange:', dateRange)
  }, [dateRange])
  
  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    console.log('=== CALENDAR VIEW - GENERATING DAYS ===')
    console.log('dateRange:', dateRange)
    
    if (!dateRange.startDate || !dateRange.endDate) {
      console.log('No date range, returning empty array')
      return []
    }
    
    const startDate = new Date(dateRange.startDate)
    const year = startDate.getFullYear()
    const month = startDate.getMonth()
    
    console.log('Start date:', startDate)
    console.log('Year:', year, 'Month:', month)
    
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
    
    console.log('Total days generated:', days.length)
    console.log('First day:', days[0]?.dateString)
    console.log('Last day:', days[days.length - 1]?.dateString)
    
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
  
  // Get pricing data for display
  const getPricesForDate = (dateString: string) => {
    const prices = []
    
    for (const ratePlan of selectedRatePlans) {
      const ratePlanPrices = pricesByRatePlan[ratePlan.id] || []
      const priceForDate = ratePlanPrices.find(p => p.date === dateString)
      
      if (priceForDate) {
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