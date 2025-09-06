import React from 'react'
import {useSelector} from 'react-redux'
import {RootState, useAppDispatch} from '@/store'
import {FaEdit, FaPlus} from 'react-icons/fa'
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

    // Handle day click
    const handleDayClick = () => {
        if (!day.isCurrentMonth) return
        if (isDisabled) return // Prevent clicks on past dates

        if (bulkEditMode) {
            dispatch(toggleDateSelection(day.dateString))
        } else {
            dispatch(setSelectedDate(day.dateString))

            // Always open date override dialog for property-level pricing
            const existingOverride = prices.find(p => p.isBasePricing && p.hasCustomPrice)
            dispatch(openDateOverrideForm({
                date: day.dateString,
                existingOverride: existingOverride?.price ? {
                    id: existingOverride.price.id,
                    propertyId: '', // Will be filled by the reducer
                    date: existingOverride.price.date,
                    price: existingOverride.price.amount,
                    halfDayPrice: existingOverride.halfDayPrice,
                    reason: existingOverride.reason,
                    createdAt: existingOverride.price.createdAt,
                    updatedAt: existingOverride.price.updatedAt
                } : undefined
            }))
        }
    }

    // Handle price click
    const handlePriceClick = (e: React.MouseEvent, priceData: PriceData) => {
        e.stopPropagation()

        if (isDisabled) return // Prevent editing past dates

        if (!bulkEditMode) {
            if (priceData.isBasePricing) {
                // Handle base pricing - open date override dialog
                const existingOverride = priceData.hasCustomPrice ? {
                    id: priceData.price.id,
                    propertyId: '', // Will be filled by the reducer
                    date: priceData.price.date,
                    price: priceData.price.amount,
                    halfDayPrice: priceData.halfDayPrice, // Get half-day price from PriceData
                    reason: priceData.reason, // Get reason from PriceData
                    createdAt: priceData.price.createdAt,
                    updatedAt: priceData.price.updatedAt
                } : undefined

                dispatch(openDateOverrideForm({
                    date: day.dateString,
                    existingOverride
                }))
            } else if (priceData.ratePlan) {
                // Rate plans are read-only modifiers - open property override instead
                dispatch(openDateOverrideForm({
                    date: day.dateString
                }))
            }
        }
    }

    // Get background color based on state
    const getBackgroundColor = () => {
        if (!day.isCurrentMonth) return '#f9fafb'
        if (isDisabled) return '#f3f4f6' // Gray background for past dates
        if (isSelected && bulkEditMode) return '#dbeafe'
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
            cursor={day.isCurrentMonth && !isDisabled ? 'pointer' : 'not-allowed'}
            opacity={day.isCurrentMonth && !isDisabled ? 1 : 0.5}
            onClick={handleDayClick}
            position="relative"
            transition="all 0.2s"
            whileHover={day.isCurrentMonth ? {backgroundColor: '#f8fafc'} : {}}
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
                {bulkEditMode && day.isCurrentMonth && !isDisabled && (
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

                {/* Override Indicator */}
                {day.isCurrentMonth && prices.some(p => p.isBasePricing && p.hasCustomPrice) && (
                    <Box
                        width="16px"
                        height="16px"
                        borderRadius="4px"
                        backgroundColor="#3182ce"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        title={`Price Override: ${prices.find(p => p.isBasePricing && p.hasCustomPrice)?.reason || 'Custom pricing'}`}
                    >
                        <Box
                            width="8px"
                            height="8px"
                            backgroundColor="white"
                            borderRadius="2px"
                        />
                    </Box>
                )}
                {/* Weekend Label - hidden on tiny mobile to save space */}
                {day.isWeekend && day.isCurrentMonth && !prices.some(p => p.isBasePricing && p.hasCustomPrice) && (
                    <span style={{fontSize: '0.625rem', color: '#92400e', fontWeight: '500'}}>
            WE
          </span>
                )}
            </Box>

            {/* Past Date Indicator */}
            {isDisabled && (
                <Box
                    textAlign="center"
                    fontSize="0.625rem"
                    color="#9ca3af"
                    marginTop="0.5rem"
                >
                    Past Date
                </Box>
            )}

            {/* Price Items */}
            {day.isCurrentMonth && !isDisabled && (
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
                            <FaPlus size={10} style={{marginBottom: '0.25rem'}}/>
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
                                cursor={bulkEditMode ? "default" : "pointer"}
                                onClick={(e) => {
                                    if (!bulkEditMode) {
                                        handlePriceClick(e, priceData)
                                    }
                                    // In bulk mode, let the click propagate to the parent cell
                                }}
                                transition="all 0.2s"
                                title={tooltipText}
                                pointerEvents={bulkEditMode ? "none" : "auto"}
                                opacity={bulkEditMode ? 0.7 : 1}
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

            {/* Edit Indicator */}
            {!bulkEditMode && day.isCurrentMonth && prices.length > 0 && (
                <Box
                    position="absolute"
                    top="0.25rem"
                    right="0.25rem"
                    opacity={0}
                    transition="opacity 0.2s"
                    style={{
                        opacity: 'inherit'
                    }}
                    pointerEvents="none"
                >
                    <FaEdit size={8} color="#6b7280"/>
                </Box>
            )}
        </Box>
    )
}

export default CalendarDay