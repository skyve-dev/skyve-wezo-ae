import React, {useEffect, useMemo} from 'react'
import {useSelector} from 'react-redux'
import CalendarGrid from './CalendarGrid'
import DateOverrideDialog from '../Controls/DateOverrideDialog'
import {RootState, useAppDispatch} from '@/store'
import {Box} from '@/components'
import {fetchPublicPricingCalendar} from '@/store/slices/priceSlice'

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
  isAvailable?: boolean
  reason?: string
  halfDayPrice?: number
}

const CalendarView: React.FC = () => {
    const dispatch = useAppDispatch()
    const {
        dateRange,
        selectedRatePlanIds,
        propertyPricing,
        publicPricingCalendar
    } = useSelector((state: RootState) => state.price)

    // Debug logging for component state


    const {ratePlans} = useSelector((state: RootState) => state.ratePlan)
    const {currentProperty} = useSelector((state: RootState) => state.property)

    // Fetch pricing calendar with availability when date range changes (unified pricing source)
    useEffect(() => {
        if (
            dateRange.startDate &&
            dateRange.endDate &&
            currentProperty?.propertyId
        ) {

            dispatch(fetchPublicPricingCalendar({
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
    // const normalizeDate = (date: string): string => {
    //     // Handle both 'YYYY-MM-DD' and 'YYYY-MM-DDTHH:mm:ss.sssZ' formats
    //     return date.split('T')[0]
    // }

    // Unified function to get effective base price for any date (includes overrides and availability)
    const getEffectiveBasePriceForDate = (dateString: string): { 
        price: number | null; 
        halfDayPrice: number | null; 
        isOverride: boolean; 
        isAvailable: boolean;
        reason?: string 
    } => {

        
        // First, check if we have public pricing calendar data for this date (includes availability)
        const publicCalendarDay = publicPricingCalendar[dateString]
        
        if (publicCalendarDay) {

            return {
                price: publicCalendarDay.fullDayPrice > 0 ? publicCalendarDay.fullDayPrice : null,
                halfDayPrice: publicCalendarDay.halfDayPrice > 0 ? publicCalendarDay.halfDayPrice : null,
                isOverride: publicCalendarDay.isOverride || false,
                isAvailable: publicCalendarDay.isAvailable !== false, // Default to true if not specified
                reason: publicCalendarDay.isOverride ? 'Date override' : undefined
            }
        }
        
        // Fallback to PropertyPricing weekly rates if no public calendar data
        if (!propertyPricing) {

            return { price: null, halfDayPrice: null, isOverride: false, isAvailable: true }
        }
        
        const date = new Date(dateString)
        const dayOfWeek = date.getDay()
        
        const dayFieldMap = {
            0: { fullDay: 'priceSunday', halfDay: 'halfDayPriceSunday' },     // Sunday
            1: { fullDay: 'priceMonday', halfDay: 'halfDayPriceMonday' },     // Monday
            2: { fullDay: 'priceTuesday', halfDay: 'halfDayPriceTuesday' },    // Tuesday
            3: { fullDay: 'priceWednesday', halfDay: 'halfDayPriceWednesday' },  // Wednesday
            4: { fullDay: 'priceThursday', halfDay: 'halfDayPriceThursday' },   // Thursday
            5: { fullDay: 'priceFriday', halfDay: 'halfDayPriceFriday' },     // Friday
            6: { fullDay: 'priceSaturday', halfDay: 'halfDayPriceSaturday' }    // Saturday
        }
        
        const fieldNames = dayFieldMap[dayOfWeek as keyof typeof dayFieldMap]
        if (!fieldNames) {

            return { price: null, halfDayPrice: null, isOverride: false, isAvailable: true }
        }
        
        const basePrice = propertyPricing[fieldNames.fullDay as keyof typeof propertyPricing] as number
        const baseHalfDayPrice = propertyPricing[fieldNames.halfDay as keyof typeof propertyPricing] as number

        
        return {
            price: basePrice > 0 ? basePrice : null,
            halfDayPrice: baseHalfDayPrice > 0 ? baseHalfDayPrice : null,
            isOverride: false,
            isAvailable: true // Default to available for fallback pricing
        }
    }

    // Unified pricing calculation for all modes
    const getPricesForDate = (dateString: string): PriceData[] => {

        const prices: PriceData[] = []



        // Get the effective base price for this date (includes any overrides)
        const effectivePriceData = getEffectiveBasePriceForDate(dateString)
        
        if (effectivePriceData.price === null || effectivePriceData.price <= 0) {

            return prices
        }

        // If rate plans are selected, apply them as modifiers to the effective base price
        if (selectedRatePlans.length > 0) {

            
            for (const ratePlan of selectedRatePlans) {
                let calculatedAmount = effectivePriceData.price
                let calculatedHalfDayAmount = effectivePriceData.halfDayPrice

                if (ratePlan.priceModifierType === 'Percentage') {
                    // Apply percentage adjustment to the effective base price (includes overrides!)
                    const multiplier = 1 + ratePlan.priceModifierValue / 100
                    calculatedAmount = effectivePriceData.price * multiplier
                    if (calculatedHalfDayAmount) {
                        calculatedHalfDayAmount = calculatedHalfDayAmount * multiplier
                    }
                } else if (ratePlan.priceModifierType === 'FixedAmount') {
                    // Apply fixed amount adjustment
                    calculatedAmount = effectivePriceData.price + ratePlan.priceModifierValue
                    // For fixed amount, half day price is not adjusted by the modifier
                    calculatedHalfDayAmount = effectivePriceData.halfDayPrice
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
                        hasCustomPrice: effectivePriceData.isOverride, // Mark as custom if base was override
                        isBasePricing: false,
                        isAvailable: effectivePriceData.isAvailable, // Pass through availability status
                        reason: effectivePriceData.reason,
                        halfDayPrice: calculatedHalfDayAmount || undefined // Pass through calculated half day price
                    })
                }
            }
        } else {
            // Base pricing mode - show the effective price directly

            
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
                isAvailable: effectivePriceData.isAvailable, // Pass through availability status
                reason: effectivePriceData.reason,
                halfDayPrice: effectivePriceData.halfDayPrice || undefined // Pass through half day price
            })
        }


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