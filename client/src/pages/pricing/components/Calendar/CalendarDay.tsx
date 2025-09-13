import React from 'react'
import {useSelector} from 'react-redux'
import {RootState, useAppDispatch} from '@/store'
import {IoIosAdd} from 'react-icons/io'
import {IoIosCheckmark} from 'react-icons/io'
import {Box} from '@/components'
import {openDateOverrideForm, setSelectedDate, toggleDateSelection} from '@/store/slices/priceSlice'

interface CalendarDayData {
    date: Date
    dateString: string
    isCurrentMonth: boolean
    isToday: boolean
    isWeekend: boolean
}

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
    ratePlan?: RatePlanWithColor  // Optional for base pricing
    price: {
        id: string
        ratePlanId?: string  // Optional for base pricing
        date: string
        amount: number
        createdAt: string
        updatedAt: string
    }
    hasCustomPrice: boolean
    isBasePricing?: boolean  // NEW: Flag for base PropertyPricing
    isAvailable?: boolean  // Availability status for the date
    reason?: string  // Optional reason for overrides
    halfDayPrice?: number  // Optional half-day price for overrides
}

interface CalendarDayProps {
    day: CalendarDayData
    prices: PriceData[]
    selectedRatePlans: RatePlanWithColor[]
}

const CalendarDay: React.FC<CalendarDayProps> = ({
                                                     day,
                                                     prices,
                                                     selectedRatePlans
                                                 }) => {
    const dispatch = useAppDispatch()
    const {
        bulkEditMode,
        selectedDates
    } = useSelector((state: RootState) => state.price)


    const isSelected = selectedDates.includes(day.dateString)

    // Check if the date is in the past
    const isPastDate = () => {
        const dayDate = new Date(day.dateString)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        dayDate.setHours(0, 0, 0, 0)
        return dayDate < today
    }

    const isDisabled = isPastDate()

    // Helper function to get availability status
    const getAvailabilityStatus = () => {
        // Check availability from any price data that includes availability info
        const priceWithAvailability = prices.find(p => p.isAvailable !== undefined)
        if (priceWithAvailability) {
            return priceWithAvailability.isAvailable
        }
        // Default to available if no explicit availability info
        return true
    }

    const isAvailable = getAvailabilityStatus()

    // Helper function to detect existing override for unified pricing
    const getExistingOverride = () => {
        // Check if any price data indicates there's a custom override
        const overridePrice = prices.find(p => p.hasCustomPrice)
        
        if (!overridePrice) return undefined
        
        // For base pricing mode, the override data is directly available
        if (overridePrice.isBasePricing) {
            return {
                id: overridePrice.price.id,
                propertyId: '', // Will be filled by the reducer
                date: overridePrice.price.date,
                price: overridePrice.price.amount,
                halfDayPrice: overridePrice.halfDayPrice || Math.round(overridePrice.price.amount * 0.6), // Use stored halfDayPrice or calculate 60%
                reason: overridePrice.reason,
                createdAt: overridePrice.price.createdAt,
                updatedAt: overridePrice.price.updatedAt
            }
        }
        
        // For rate plan mode, we need to extract the base override data
        // The rate plan price is calculated from the effective base price (which includes overrides)
        if (overridePrice.ratePlan && overridePrice.hasCustomPrice) {
            // Calculate the original override price from the rate plan price
            let originalOverridePrice = overridePrice.price.amount
            let originalHalfDayPrice = overridePrice.halfDayPrice
            
            if (overridePrice.ratePlan.priceModifierType === 'Percentage') {
                // Reverse the percentage calculation: displayPrice / (1 + modifier/100) = originalPrice
                const modifier = overridePrice.ratePlan.priceModifierValue / 100
                originalOverridePrice = overridePrice.price.amount / (1 + modifier)
                
                // If we have halfDayPrice, reverse calculate it too, otherwise use 60% of full day
                if (originalHalfDayPrice) {
                    originalHalfDayPrice = originalHalfDayPrice / (1 + modifier)
                } else {
                    originalHalfDayPrice = originalOverridePrice * 0.6
                }
            } else if (overridePrice.ratePlan.priceModifierType === 'FixedAmount') {
                // Reverse the fixed amount calculation: displayPrice - modifier = originalPrice
                const modifier = overridePrice.ratePlan.priceModifierValue
                originalOverridePrice = overridePrice.price.amount - modifier
                
                // For fixed amount, half day price is not affected by the modifier
                // Use stored halfDayPrice or calculate 60% of the original price
                originalHalfDayPrice = originalHalfDayPrice || (originalOverridePrice * 0.6)
            }
            
            return {
                id: `override-${day.dateString}`, // Generate ID for override
                propertyId: '', // Will be filled by the reducer
                date: day.dateString,
                price: Math.round(originalOverridePrice), // Round to avoid floating point issues
                halfDayPrice: originalHalfDayPrice ? Math.round(originalHalfDayPrice) : undefined, // Always provide a half day price
                reason: overridePrice.reason,
                createdAt: overridePrice.price.createdAt,
                updatedAt: overridePrice.price.updatedAt
            }
        }
        
        return undefined
    }

    // Handle day click
    const handleDayClick = () => {
        // Allow clicks on other month dates, just not past dates or unavailable dates
        if (isDisabled) return // Prevent clicks on past dates
        if (!isAvailable) {
            // For unavailable dates, we could show a message but allow admin to edit pricing
            // For now, allow clicks to maintain admin functionality
        }

        if (bulkEditMode) {
            dispatch(toggleDateSelection(day.dateString))
        } else {
            dispatch(setSelectedDate(day.dateString))

            // Use unified override detection for both base pricing and rate plan modes
            const existingOverride = getExistingOverride()
            dispatch(openDateOverrideForm({
                date: day.dateString,
                existingOverride
            }))
        }
    }

    // Handle price click
    const handlePriceClick = (e: React.MouseEvent) => {
        e.stopPropagation()

        if (isDisabled) return // Prevent editing past dates

        if (!bulkEditMode) {
            // Always open property override dialog with unified override detection
            // Both base pricing and rate plans should allow editing the underlying property price
            const existingOverride = getExistingOverride()
            dispatch(openDateOverrideForm({
                date: day.dateString,
                existingOverride
            }))
        }
    }

    // Get background color based on state
    const getBackgroundColor = () => {
        if (isDisabled) return '#f3f4f6' // Gray background for past dates (highest priority)
        if (!isAvailable && !isDisabled) return '#fef2f2' // Light red background for unavailable dates
        if (isSelected && bulkEditMode) return '#dbeafe'
        if (!day.isCurrentMonth) return '#fafafa' // Very subtle gray for other month dates
        if (day.isToday) return '#eff6ff'
        if (day.isWeekend) return '#fffbeb'
        return 'white'
    }


    // Format currency with enhanced mobile formatting
    const formatPrice = (amount: number) => {
        return `${amount.toLocaleString()}`
    }

    return (
        <Box
            backgroundColor={getBackgroundColor()}
            cursor={!isDisabled && isAvailable ? 'pointer' : 'not-allowed'}
            opacity={!isDisabled ? 1 : 0.6}
            onClick={handleDayClick}
            position="relative"
            transition="all 0.2s"
            whileHover={!isDisabled && isAvailable ? {backgroundColor: '#f8fafc'} : {}}
        >
            {/* Day Number */}
            <Box
                display="flex"
                padding={'0.25rem'}
                gap={'0.25rem'}
                alignItems="center"
            >
        <span
            style={{
                fontWeight: day.isToday ? '600' : '500',
                fontSize: '1rem',
                color: isDisabled ? '#9ca3af' : (day.isToday ? '#1d4ed8' : (day.isCurrentMonth ? '#374151' : '#9ca3af'))
            }}
        >
          {day.date.getDate()}
        </span>

                {/* Bulk Edit Selection Indicator */}
                {bulkEditMode && !isDisabled && (
                    <Box
                        width="20px"
                        height="20px"
                        borderRadius="4px"
                        backgroundColor={isSelected ? '#22c55e' : 'transparent'}
                        border={`2px solid ${isSelected ? '#22c55e' : '#d1d5db'}`}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        {isSelected && (
                            <IoIosCheckmark size={16} color="white"/>
                        )}
                    </Box>
                )}

                {/* Weekend Label - hidden on tiny mobile to save space */}
                {day.isWeekend && !isDisabled && !prices.some(p => p.isBasePricing && p.hasCustomPrice) && (
                    <span style={{fontSize: '0.625rem', color: '#92400e', fontWeight: '500'}}>
            WE
          </span>
                )}
            </Box>

            {/* Price Items - Show for all dates including past dates */}
            {(
                <Box display="flex" flexDirection="column" flex="1">
                    {prices.length === 0 && selectedRatePlans.length > 0 && (
                        <Box
                            textAlign="center"
                            padding="0.25rem"
                            backgroundColor="#f3f4f6"
                            borderRadius="4px"
                            border="1px dashed #9ca3af"
                            cursor="pointer"
                            fontSize="0.75rem"
                            color="#6b7280"
                            onClick={(e) => {
                                e.stopPropagation()
                                // Open property pricing override dialog
                                dispatch(openDateOverrideForm({
                                    date: day.dateString
                                }))
                            }}
                        >
                            <IoIosAdd size={10} style={{marginBottom: '0.25rem'}}/>
                            <div>Set Price</div>
                        </Box>
                    )}

                    {prices.slice(0, 4).map((priceData, index) => {
                        const isBasePricing = priceData.isBasePricing
                        const isOverride = isBasePricing && priceData.hasCustomPrice

                        // Enhanced styling for overrides
                        let backgroundColor, borderColor, textColor
                        if (isOverride) {
                            backgroundColor = '#eff6ff'  // Blue background for overrides
                            borderColor = '#3182ce'     // Blue border for overrides
                            textColor = '#1e40af'       // Blue text for overrides
                        } else if (isBasePricing) {
                            backgroundColor = '#fef3c7'  // Yellow background for base pricing
                            borderColor = '#f59e0b'     // Yellow border for base pricing
                            textColor = '#92400e'       // Brown text for base pricing
                        } else {
                            backgroundColor = priceData.hasCustomPrice ? '#f0fdf4' : '#f8fafc'
                            borderColor = priceData.hasCustomPrice ? '#bbf7d0' : '#e2e8f0'
                            textColor = priceData.hasCustomPrice ? '#166534' : '#475569'
                        }

                        // Apply muted styling for past dates
                        if (isDisabled) {
                            backgroundColor = '#f9fafb'
                            borderColor = '#e5e7eb'
                            textColor = '#9ca3af'
                        }

                        const ratePlanName = isBasePricing ? (isOverride ? 'Override' : 'Base') : (priceData.ratePlan?.name || 'Unknown')
                        const ratePlanColor = isBasePricing ? (isOverride ? '#3182ce' : '#f59e0b') : (priceData.ratePlan?.color || '#6b7280')

                        // Create tooltip text for overrides
                        const tooltipText = isOverride && priceData.reason
                            ? `Price Override: ${priceData.reason}`
                            : isBasePricing
                                ? 'Base property pricing'
                                : `${ratePlanName} pricing`

                        return (
                            <Box
                                key={isBasePricing ? `base-pricing-${index}` : `${priceData.ratePlan?.id || 'unknown'}-${index}`}
                                padding={"0.25rem"}
                                backgroundColor={backgroundColor}
                                borderTop={`1px solid ${borderColor}`}
                                fontSize={'0.75rem'}
                                cursor={bulkEditMode ? "default" : (isDisabled ? "not-allowed" : "pointer")}
                                onClick={(e) => {
                                    if (!bulkEditMode && !isDisabled) {
                                        handlePriceClick(e)
                                    }
                                    // In bulk mode or for disabled dates, let the click propagate to the parent cell
                                }}
                                transition="all 0.2s"
                                title={tooltipText}
                                pointerEvents={bulkEditMode || isDisabled ? "none" : "auto"}
                                opacity={bulkEditMode ? 0.7 : (isDisabled ? 0.6 : 1)}
                                whileHover={!bulkEditMode ? {backgroundColor: isOverride ? '#dbeafe' : (isBasePricing ? '#fef3c7' : '#f1f5f9')} : {}}
                            >

                                <Box display="flex"  alignItems="center" justifyContent="space-between">
                                    <Box display="flex" alignItems="center" gap="0.25rem">
                                        <Box
                                            width="6px"
                                            height="6px"
                                            borderRadius="50%"
                                            backgroundColor={ratePlanColor}
                                        />
                                    </Box>
                                    <Box
                                        fontWeight="500"
                                        fontSize={'1rem'}
                                        color={textColor}
                                        textAlign={'center'}
                                    >
                                        {formatPrice(priceData.price.amount)}
                                    </Box>
                                </Box>
                            </Box>
                        )
                    })}

                    {/* Show count if more prices exist */}
                    {prices.length > 4 && (
                        <Box
                            textAlign="center"
                            fontSize={'0.625rem'}
                            color="#6b7280"
                            padding={'0.25rem'}
                            backgroundColor="#f9fafb"
                            borderRadius="4px"
                        >
                            +{prices.length - 4} more
                        </Box>
                    )}
                </Box>
            )}

        </Box>
    )
}

export default CalendarDay