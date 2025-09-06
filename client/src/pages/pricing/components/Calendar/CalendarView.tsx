import React, {useEffect, useMemo} from 'react'
import {useSelector} from 'react-redux'
import CalendarGrid from './CalendarGrid'
import DateOverrideDialog from '../Controls/DateOverrideDialog'
import {RootState, useAppDispatch} from '@/store'
import {Box} from '@/components'
import {fetchPricingCalendar} from '@/store/slices/priceSlice'

interface RatePlanWithColor {
  id: string
  propertyId: string
  name: string
  description?: string
  priceModifierType: 'Percentage' | 'FixedAmount'
  priceModifierValue: number
  minStay?: number
  maxStay?: number
  minAdvanceBooking?: number
  maxAdvanceBooking?: number
  minGuests?: number
  maxGuests?: number
  isActive: boolean
  isDefault: boolean
  priority: number
  createdAt: string
  updatedAt: string
  color: string
  lightColor: string
}

interface PriceData {
  ratePlan?: RatePlanWithColor
  price: {
    id: string
    ratePlanId?: string
    date: string
    amount: number
    createdAt: string
    updatedAt: string
  }
  hasCustomPrice: boolean
  isBasePricing?: boolean
  reason?: string
  halfDayPrice?: number
}

const CalendarView: React.FC = () => {
    const dispatch = useAppDispatch()
    const {
        dateRange,
        selectedRatePlanIds,
        propertyPricing,
        pricingCalendar
    } = useSelector((state: RootState) => state.price)

    // Debug logging for component state
    console.log('🔍 CalendarView render state:', {
        dateRange,
        selectedRatePlanIds,
        selectedRatePlanIdsLength: selectedRatePlanIds.length,
        propertyPricing
    })

    const {ratePlans} = useSelector((state: RootState) => state.ratePlan)
    const {currentProperty} = useSelector((state: RootState) => state.property)

    // Fetch pricing calendar when date range changes (unified pricing source)
    useEffect(() => {
        if (
            dateRange.startDate &&
            dateRange.endDate &&
            currentProperty?.propertyId
        ) {
            console.log('🔄 Fetching pricing calendar for unified pricing calculations')
            dispatch(fetchPricingCalendar({
                propertyId: currentProperty.propertyId,
                startDate: dateRange.startDate,
                endDate: dateRange.endDate
            }))
        }
    }, [dateRange.startDate, dateRange.endDate, currentProperty?.propertyId, dispatch])

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


    // Generate calendar days - week view for tiny mobile, month view for larger screens
    const calendarDays = useMemo(() => {
        if (!dateRange.startDate || !dateRange.endDate) {
            return []
        }

        const startDate = new Date(dateRange.startDate)
        const today = new Date()

        // Full month view for larger screens
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
        const todayString = formatDateLocal(today)
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const date = new Date(year, month, i)
            const dateString = formatDateLocal(date)
            days.push({
                date,
                dateString,
                isCurrentMonth: true,
                isToday: dateString === todayString,
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

    // Unified function to get effective base price for any date (includes overrides)
    const getEffectiveBasePriceForDate = (dateString: string): { price: number | null; isOverride: boolean; reason?: string } => {
        console.log('🔍 getEffectiveBasePriceForDate called for date:', dateString)
        
        // First, check if we have pricing calendar data for this date
        const calendarDay = pricingCalendar.find(day => normalizeDate(day.date) === dateString)
        
        if (calendarDay) {
            console.log('✅ Using pricing calendar data for date:', dateString, 'price:', calendarDay.fullDayPrice, 'isOverride:', calendarDay.isOverride)
            return {
                price: calendarDay.fullDayPrice > 0 ? calendarDay.fullDayPrice : null,
                isOverride: calendarDay.isOverride,
                reason: calendarDay.reason
            }
        }
        
        // Fallback to PropertyPricing weekly rates if no calendar data
        if (!propertyPricing) {
            console.log('❌ No pricing data available for date:', dateString)
            return { price: null, isOverride: false }
        }
        
        const date = new Date(dateString)
        const dayOfWeek = date.getDay()
        
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
        if (!fieldName) {
            console.log('❌ No field name found for dayOfWeek:', dayOfWeek)
            return { price: null, isOverride: false }
        }
        
        const basePrice = propertyPricing[fieldName as keyof typeof propertyPricing] as number
        console.log('🔍 Fallback to PropertyPricing for date:', dateString, 'dayOfWeek:', dayOfWeek, 'price:', basePrice)
        
        return {
            price: basePrice > 0 ? basePrice : null,
            isOverride: false
        }
    }

    // Unified pricing calculation for all modes
    const getPricesForDate = (dateString: string): PriceData[] => {
        console.log('🔍 getPricesForDate called for date:', dateString)
        const prices: PriceData[] = []

        console.log('🔍 Selected rate plans count:', selectedRatePlans.length)

        // Get the effective base price for this date (includes any overrides)
        const effectivePriceData = getEffectiveBasePriceForDate(dateString)
        
        if (effectivePriceData.price === null || effectivePriceData.price <= 0) {
            console.log('❌ No valid base price found for date:', dateString)
            return prices
        }

        // If rate plans are selected, apply them as modifiers to the effective base price
        if (selectedRatePlans.length > 0) {
            console.log('🔵 RATE PLAN MODE: Applying modifiers to effective base price:', effectivePriceData.price)
            
            for (const ratePlan of selectedRatePlans) {
                let calculatedAmount = effectivePriceData.price

                if (ratePlan.priceModifierType === 'Percentage') {
                    // Apply percentage adjustment to the effective base price (includes overrides!)
                    calculatedAmount = effectivePriceData.price * (1 + ratePlan.priceModifierValue / 100)
                } else if (ratePlan.priceModifierType === 'FixedAmount') {
                    // Apply fixed amount adjustment
                    calculatedAmount = effectivePriceData.price + ratePlan.priceModifierValue
                }

                if (calculatedAmount > 0) {
                    console.log('✅ Rate plan calculation:', {
                        ratePlan: ratePlan.name,
                        basePrice: effectivePriceData.price,
                        modifier: `${ratePlan.priceModifierType} ${ratePlan.priceModifierValue}`,
                        calculatedAmount,
                        isOverride: effectivePriceData.isOverride
                    })
                    
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
                        hasCustomPrice: effectivePriceData.isOverride, // Mark as custom if base was override
                        isBasePricing: false,
                        reason: effectivePriceData.reason
                    })
                }
            }
        } else {
            // Base pricing mode - show the effective price directly
            console.log('🟡 BASE PRICING MODE: Using effective base price:', effectivePriceData.price)
            
            prices.push({
                ratePlan: undefined,
                price: {
                    id: effectivePriceData.isOverride ? `override-${dateString}` : `base-pricing-${dateString}`,
                    ratePlanId: undefined,
                    date: dateString,
                    amount: effectivePriceData.price,
                    createdAt: '',
                    updatedAt: ''
                },
                hasCustomPrice: effectivePriceData.isOverride,
                isBasePricing: true,
                reason: effectivePriceData.reason
            })
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
                <p style={{color: '#6b7280', fontSize: '1rem'}}>
                    Select a date range to view the calendar
                </p>
            </Box>
        )
    }

    // Show pricing mode and view mode indicators  
    const pricingModeMessage = selectedRatePlanIds.length === 0
        ? 'Showing base property pricing (includes date overrides)'
        : `Showing rate plan pricing for ${selectedRatePlanIds.length} plan${selectedRatePlanIds.length > 1 ? 's' : ''} (applied to effective base prices including overrides)`

    const viewModeMessage = '• Month View'

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
                {pricingModeMessage}{viewModeMessage}
            </Box>

            <CalendarGrid
                calendarDays={calendarDays}
                selectedRatePlans={selectedRatePlans}
                getPricesForDate={getPricesForDate}
            />

            {/* Date Override Dialog */}
            <DateOverrideDialog/>
        </Box>
    )
}

export default CalendarView