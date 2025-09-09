import React, {useEffect, useState} from 'react'
import {useAppShell} from '@/components/base/AppShell'
import {useAppDispatch, useAppSelector} from '@/store'
import {fetchPropertyById, setSelectedRatePlan} from '@/store/slices/propertySlice'
import {fetchPublicRatePlans} from '@/store/slices/ratePlanSlice'
import {checkBookingAvailability} from '@/store/slices/availabilitySlice'
import {fetchPublicPricingCalendar} from '@/store/slices/priceSlice'
import {calculateBookingOptions} from '@/store/slices/bookingSlice'
import {Box} from '@/components/base/Box'
import {Button} from '@/components/base/Button'
import {PricingCalendar, ToggleButton} from '@/components'
import BookingRatePlanSelector from '@/components/BookingRatePlanSelector'
import NumberStepperInput from '@/components/base/NumberStepperInput'
import SlidingDrawer from '@/components/base/SlidingDrawer'
import {
    IoIosArrowBack,
    IoIosBed,
    IoIosCalendar,
    IoIosCar,
    IoIosCheckmarkCircle,
    IoIosClose,
    IoIosCloseCircle,
    IoIosGlobe,
    IoIosHappy,
    IoIosHome,
    IoIosPeople,
    IoIosPin,
    IoIosResize,
    IoIosShare,
    IoIosTime,
    IoIosWater
} from 'react-icons/io'
import {resolvePhotoUrl} from '@/utils/api'
import {findAmenityById} from '@/constants/amenities'
import {ParkingTypeLabels, PetPolicyLabels} from '@/constants/propertyEnums'
import {formatDateLocal} from '@/utils/dateUtils'

interface PropertyDetailProps {
    propertyId: string
}

const PropertyDetail: React.FC<PropertyDetailProps> = ({propertyId}) => {
    const {navigateBack, canNavigateBack, navigateTo, currentParams, addToast} = useAppShell()
    const dispatch = useAppDispatch()

    // Get propertyId from props or route params (route uses 'id' parameter)
    const actualPropertyId = propertyId || (currentParams as any)?.id

    // Debug logging


    // Redux state
    const {currentProperty, selectedRatePlan, loading, error} = useAppSelector((state) => state.property)
    const {currentRoleMode} = useAppSelector((state) => state.auth)
    const {ratePlans} = useAppSelector((state) => state.ratePlan)
    const {publicPricingCalendar, loading: pricingLoading} = useAppSelector((state) => state.price)
    const {selectedRatePlanOption, calculatingOptions} = useAppSelector((state: any) => state.booking)

    // Local state for booking widget
    const [bookingType, setBookingType] = useState<'half-day' | 'full-stay'>('full-stay')
    const [dateRange, setDateRange] = useState<{ startDate: Date | null, endDate: Date | null }>({
        startDate: null,
        endDate: null
    })
    const [singleDate, setSingleDate] = useState<Date | null>(null)
    const [numGuests, setNumGuests] = useState(1)
    const [calendarLoaded, setCalendarLoaded] = useState(false)

    // Mobile booking form state
    const [showMobileBookingForm, setShowMobileBookingForm] = useState(false)

    // Calculate actual base price from calendar data
    const calculateBasePriceFromCalendar = () => {
        const checkInDateObj = bookingType === 'half-day' ? singleDate : dateRange.startDate
        const checkOutDateObj = bookingType === 'half-day' ? singleDate : dateRange.endDate
        
        if (!checkInDateObj) return { totalBasePrice: 0, nights: 0 }
        
        if (bookingType === 'half-day') {
            // Use consistent local date formatting
            const dateString = formatDateLocal(checkInDateObj)
            
            const priceInfo = publicPricingCalendar?.[dateString]
            return {
                totalBasePrice: priceInfo?.halfDayPrice || 0,
                nights: 0.5
            }
        }
        
        if (!checkOutDateObj) return { totalBasePrice: 0, nights: 0 }
        
        let totalBasePrice = 0
        let nights = 0
        const currentDate = new Date(checkInDateObj)
        
        // Calculate day-by-day pricing from calendar
        while (currentDate < checkOutDateObj) {
            // Use consistent local date formatting
            const dateString = formatDateLocal(currentDate)
            
            const priceInfo = publicPricingCalendar?.[dateString]
            
            if (priceInfo) {
                totalBasePrice += priceInfo.fullDayPrice
            }
            
            nights++
            currentDate.setDate(currentDate.getDate() + 1)
        }
        
        return { totalBasePrice, nights }
    }

    // Calculate pricing using the new booking system
    const calculatePricing = () => {
        if (selectedRatePlanOption) {
            return {
                totalPrice: selectedRatePlanOption.totalPrice,
                pricePerNight: selectedRatePlanOption.pricePerNight
            }
        }
        
        // Fallback to calendar-based pricing if no booking options yet
        const { totalBasePrice, nights } = calculateBasePriceFromCalendar()
        return {
            totalPrice: totalBasePrice,
            pricePerNight: nights > 0 ? totalBasePrice / nights : 0
        }
    }

    const pricing = calculatePricing()
    const selectedTotalPrice = pricing.totalPrice
    const selectedPricePerNight = pricing.pricePerNight

    // Helper function to format dates for API
    const formatDateForAPI = (date: Date | null): string => {
        return date ? formatDateLocal(date) : ''
    }

    // Helper to get dates based on booking type
    const getBookingDates = () => {
        if (bookingType === 'half-day' && singleDate) {
            const formattedDate = formatDateForAPI(singleDate)
            return {
                checkInDate: formattedDate,
                checkOutDate: formattedDate // Same day for half-day
            }
        } else if (bookingType === 'full-stay' && dateRange.startDate && dateRange.endDate) {
            return {
                checkInDate: formatDateForAPI(dateRange.startDate),
                checkOutDate: formatDateForAPI(dateRange.endDate)
            }
        }
        return {checkInDate: '', checkOutDate: ''}
    }

    // Validate date range for availability
    const validateDateRangeAvailability = (startDate: Date | null, endDate: Date | null): { isValid: boolean; unavailableDates: string[] } => {
        if (!startDate || !publicPricingCalendar) {
            return { isValid: true, unavailableDates: [] }
        }

        const unavailableDates: string[] = []
        const checkEndDate = endDate || startDate

        // Check each date in the range
        const currentDate = new Date(startDate)
        while (currentDate <= checkEndDate) {
            const dateString = formatDateLocal(currentDate)
            
            const priceInfo = publicPricingCalendar[dateString]
            
            // Check if date is unavailable
            if (priceInfo && priceInfo.isAvailable === false) {
                unavailableDates.push(dateString)
            }
            
            currentDate.setDate(currentDate.getDate() + 1)
        }

        return {
            isValid: unavailableDates.length === 0,
            unavailableDates
        }
    }

    // Handle pricing calendar selection
    const handleCalendarSelection = (range: { startDate: Date | null, endDate: Date | null }) => {
        if (bookingType === 'half-day') {
            // For half-day, validate single date
            const validation = validateDateRangeAvailability(range.startDate, range.startDate)
            
            if (!validation.isValid) {
                addToast('The selected date is not available for booking.', { 
                    type: 'error', 
                    autoHide: true, 
                    duration: 4000 
                })
                return
            }
            
            // For half-day, only use the start date
            setSingleDate(range.startDate)
            setDateRange({startDate: null, endDate: null})
        } else {
            // For full-stay, validate the full range
            const validation = validateDateRangeAvailability(range.startDate, range.endDate)
            
            if (!validation.isValid) {
                const formattedDates = validation.unavailableDates.join(', ')
                addToast(`The following dates in your selected range are not available: ${formattedDates}. Please select a different date range without unavailable dates.`, { 
                    type: 'error', 
                    autoHide: true, 
                    duration: 5000 
                })
                return
            }
            
            // For full-stay, use the full range
            setDateRange(range)
            setSingleDate(null)
        }
    }

    // Rate plan selection is now handled by BookingRatePlanSelector internally

    // Fetch property data on mount
    useEffect(() => {
        if (actualPropertyId && actualPropertyId !== 'new') {
            // Use regular API since it's already public (no auth required)
            dispatch(fetchPropertyById(actualPropertyId))
            dispatch(fetchPublicRatePlans(actualPropertyId))
        }
    }, [actualPropertyId, dispatch])

    // Fetch pricing calendar data for next 90 days
    useEffect(() => {
        if (actualPropertyId && actualPropertyId !== 'new' && !calendarLoaded) {
            const startDate = new Date()
            const endDate = new Date()
            endDate.setDate(startDate.getDate() + 90) // Next 90 days

            dispatch(fetchPublicPricingCalendar({
                propertyId: actualPropertyId,
                startDate: formatDateLocal(startDate),
                endDate: formatDateLocal(endDate)
            })).then(() => {
                setCalendarLoaded(true)
            })
        }
    }, [actualPropertyId, calendarLoaded, dispatch])

    // Auto-select best eligible rate plan when conditions change
    useEffect(() => {
        // Use actual Date objects instead of formatted strings for calculations
        const checkInDateObj = bookingType === 'half-day' ? singleDate : dateRange.startDate
        const checkOutDateObj = bookingType === 'half-day' ? singleDate : dateRange.endDate

        // Ensure complete date selection based on booking type
        const hasCompleteDates = bookingType === 'half-day'
            ? checkInDateObj
            : (checkInDateObj && checkOutDateObj)

        if (ratePlans.length > 0 && hasCompleteDates && numGuests) {
            // Check eligibility for each rate plan
            const eligiblePlans = ratePlans.filter(plan => {
                if (!plan.isActive) return false

                // Check stay length
                // @ts-ignore
                const nights = bookingType === 'half-day' ? 0.5 : checkOutDateObj ? Math.ceil((checkOutDateObj.getTime() - checkInDateObj.getTime()) / (1000 * 60 * 60 * 24)) : 1
                if (plan.minStay && nights < plan.minStay) return false
                if (plan.maxStay && nights > plan.maxStay) return false

                // Check guest count
                if (plan.minGuests && numGuests < plan.minGuests) return false
                if (plan.maxGuests && numGuests > plan.maxGuests) return false

                // Check advance booking
                if (plan.minAdvanceBooking) {
                    // @ts-ignore
                    const daysAhead = Math.ceil((checkInDateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    if (daysAhead < plan.minAdvanceBooking) return false
                }

                return true
            })

            // Find best eligible plan (highest discount/lowest final price)
            const bestPlan = eligiblePlans.sort((a, b) => {
                // Prioritize percentage discounts, then fixed amount discounts
                if (a.priceModifierValue < 0 && b.priceModifierValue >= 0) return -1
                if (b.priceModifierValue < 0 && a.priceModifierValue >= 0) return 1
                if (a.priceModifierValue < 0 && b.priceModifierValue < 0) {
                    return a.priceModifierValue - b.priceModifierValue // More negative = better discount
                }
                return a.priority - b.priority // Default to priority order
            })[0]

            // Auto-select best plan if no plan is currently selected or if current plan is not eligible
            if (bestPlan && (!selectedRatePlan || !eligiblePlans.find(p => p.id === selectedRatePlan.id))) {
                dispatch(setSelectedRatePlan(bestPlan))
            } else if (!bestPlan && selectedRatePlan) {
                // Clear selected rate plan if no eligible plans exist but one is still selected
                dispatch(setSelectedRatePlan(null))
            }
        } else {
            // Clear selected rate plan if dates are incomplete
            if (selectedRatePlan) {
                dispatch(setSelectedRatePlan(null))
            }
        }
    }, [dateRange.startDate, dateRange.endDate, singleDate, bookingType, numGuests, selectedRatePlan, ratePlans, dispatch])

    // Calculate booking options when dates/guests change (new booking system)
    useEffect(() => {
        const checkInDateObj = bookingType === 'half-day' ? singleDate : dateRange.startDate
        const checkOutDateObj = bookingType === 'half-day' ? singleDate : dateRange.endDate
        
        const hasCompleteDates = bookingType === 'half-day'
            ? checkInDateObj
            : (checkInDateObj && checkOutDateObj)
        
        if (actualPropertyId && hasCompleteDates && numGuests) {
            dispatch(calculateBookingOptions({
                propertyId: actualPropertyId,
                checkInDate: formatDateForAPI(checkInDateObj),
                checkOutDate: formatDateForAPI(checkOutDateObj),
                guestCount: numGuests,
                isHalfDay: bookingType === 'half-day'
            }))
        }
    }, [actualPropertyId, dateRange.startDate, dateRange.endDate, singleDate, bookingType, numGuests, dispatch])

    // Smart back navigation
    const handleBack = () => {
        if (canNavigateBack) {
            navigateBack()
        } else {
            navigateTo('properties', {})
        }
    }

    // Handle booking flow
    const handleBookNow = async () => {
        if (!actualPropertyId) {
            addToast('Property not found. Please try again.', { 
                type: 'error', 
                autoHide: true, 
                duration: 4000 
            })
            return
        }

        const {checkInDate, checkOutDate} = getBookingDates()

        if (!checkInDate || !checkOutDate || !numGuests) {
            const dateLabel = bookingType === 'half-day' ? 'booking date' : 'check-in and check-out dates'
            addToast(`Please select ${dateLabel} and number of guests`, { 
                type: 'warning', 
                autoHide: true, 
                duration: 4000 
            })
            return
        }

        // Rate plan is now optional for direct property booking

        // Check availability first
        try {

            const availabilityResult = await dispatch(checkBookingAvailability({
                propertyId: actualPropertyId,
                checkInDate,
                checkOutDate,
                numGuests
            }))

            if (availabilityResult.meta.requestStatus === 'fulfilled') {
                const availability = availabilityResult.payload as any
                if (availability.isAvailable) {
                    navigateTo('booking-confirmation', {
                        propertyId: actualPropertyId,
                        checkInDate,
                        checkOutDate,
                        numGuests,
                        ratePlanId: selectedRatePlanOption?.ratePlan?.id || null, // Optional for direct booking
                        totalPrice: selectedTotalPrice,
                        pricePerNight: selectedPricePerNight
                    })
                } else {
                    addToast(availability.reason || 'Selected dates are not available', { 
                        type: 'error', 
                        autoHide: true, 
                        duration: 4000 
                    })
                }
            }
        } catch (error) {
            addToast('Error checking availability. Please try again.', { 
                type: 'error', 
                autoHide: true, 
                duration: 4000 
            })
        }
    }

    if (loading) {
        return (
            <Box padding="2rem" display="flex" justifyContent="center" alignItems="center" height="400px">
                <div>Loading property details...</div>
            </Box>
        )
    }

    if (error || !currentProperty) {
        return (
            <Box padding="2rem" textAlign="center">
                <Box color="#dc2626" marginBottom="1rem">
                    {error || 'Property not found'}
                </Box>
                <Button
                    label="Back to Properties"
                    icon={<IoIosArrowBack/>}
                    onClick={handleBack}
                    variant="normal"
                />
            </Box>
        )
    }

    const property = currentProperty
    // const isGuestMode = currentRoleMode === 'Tenant'
    // Silence unused variable warning
    void currentRoleMode

    return (
        <Box maxWidth={1024} margin="0 auto">
            {/* Header with Back Button */}
            <Box
                display="flex"
                alignItems="center"
                padding="1rem 1.5rem"
                backgroundColor="white"
                borderBottom="1px solid #e5e7eb"
                position="sticky"
                top="0"
                zIndex="10"
            >
                <Button
                    label=""
                    icon={<IoIosArrowBack/>}
                    onClick={handleBack}
                    variant="normal"
                    size="small"
                    style={{backgroundColor: 'transparent', border: 'none'}}
                />
                <Box flex="1" marginLeft="1rem">
                    <Box display="flex" alignItems="center" gap="0.5rem">
                        <h1 style={{fontSize: '1.125rem', fontWeight: '600', margin: 0}}>
                            {property.name}
                        </h1>
                        {/* Mobile Status Indicator */}
                        <Box
                            backgroundColor={property.status === 'Live' ? '#dcfdf7' : '#fef3cd'}
                            color={property.status === 'Live' ? '#059669' : '#d97706'}
                            padding="0.125rem 0.5rem"
                            borderRadius="12px"
                            fontSize="0.625rem"
                            fontWeight="600"
                            border={`1px solid ${property.status === 'Live' ? '#a7f3d0' : '#fde68a'}`}
                            textTransform="uppercase"
                            style={{letterSpacing: '0.5px'}}
                        >
                            {property.status === 'Live' ? '🟢' : '🟡'}
                        </Box>
                    </Box>
                </Box>
                <Button
                    label=""
                    icon={<IoIosShare/>}
                    onClick={() => navigator.share?.({
                        title: property.name,
                        url: window.location.href
                    })}
                    variant="normal"
                    size="small"
                    style={{backgroundColor: 'transparent', border: 'none'}}
                />
            </Box>

            {/* Photo Gallery */}
            <Box position="relative">
                {property.photos && property.photos.length > 0 ? (
                    <Box>
                        {/* Mobile: Scrollable Gallery */}
                        <Box
                            display="block"
                            displayMd="none"
                            overflow="hidden"
                        >
                            <Box
                                display="flex"
                                overflowX="auto"
                                style={{scrollSnapType: 'x mandatory'}}
                            >
                                {property.photos.map((photo, index) => (
                                    <Box
                                        key={photo.id || index}
                                        flexShrink="0"
                                        width="100vw"
                                        height="250px"
                                        backgroundImage={`url(${resolvePhotoUrl(photo.url)})`}
                                        backgroundSize="cover"
                                        backgroundPosition="center"
                                        style={{scrollSnapAlign: 'start'}}
                                    />
                                ))}
                            </Box>
                            {/* Photo indicator dots */}
                            <Box
                                position="absolute"
                                bottom="1rem"
                                left="50%"
                                transform="translateX(-50%)"
                                display="flex"
                                gap="0.5rem"
                            >
                                {property.photos.slice(0, 5).map((_, index) => (
                                    <Box
                                        key={index}
                                        width="8px"
                                        height="8px"
                                        borderRadius="50%"
                                        backgroundColor={index === 0 ? 'white' : 'rgba(255,255,255,0.5)'}
                                    />
                                ))}
                            </Box>
                        </Box>

                        {/* Desktop: Grid Layout (Top 5 Photos) */}
                        <Box
                            display="none"
                            displayMd="grid"
                            gridTemplateColumns="2fr 1fr 1fr"
                            gridTemplateRows="200px 200px"
                            gap="8px"
                            height="408px"
                        >
                            {/* Main photo */}
                            <Box
                                gridRow="1 / 3"
                                backgroundImage={`url(${resolvePhotoUrl(property.photos[0].url)})`}
                                backgroundSize="cover"
                                backgroundPosition="center"
                                borderRadius="8px 0 0 8px"
                            />
                            {/* Secondary photos */}
                            {property.photos.slice(1, 5).map((photo, index) => (
                                <Box
                                    key={photo.id || index}
                                    backgroundImage={`url(${resolvePhotoUrl(photo.url)})`}
                                    backgroundSize="cover"
                                    backgroundPosition="center"
                                    borderRadius={index === 1 ? "0 8px 0 0" : index === 3 ? "0 0 8px 0" : "0"}
                                />
                            ))}
                        </Box>
                    </Box>
                ) : (
                    <Box
                        height="250px"
                        backgroundColor="#f3f4f6"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="#9ca3af"
                    >
                        <IoIosPin size={48}/>
                    </Box>
                )}
            </Box>

            {/* Main Content with Booking Widget */}
            <Box display="flex" flexDirection="column" gap="2rem" padding="2rem">
                {/* Left Content */}
                <Box flex="1">
                    {/* Property Basic Info */}
                    <Box marginBottom="2rem">
                        <Box display="flex" alignItems="center" gap="1rem" marginBottom="0.5rem">
                            <h1 style={{fontSize: '2rem', fontWeight: 'bold', margin: 0}}>
                                {property.name}
                            </h1>
                            {/* Property Status Indicator */}
                            <Box
                                backgroundColor={property.status === 'Live' ? '#dcfdf7' : '#fef3cd'}
                                color={property.status === 'Live' ? '#059669' : '#d97706'}
                                padding="0.25rem 0.75rem"
                                borderRadius="20px"
                                fontSize="0.75rem"
                                fontWeight="600"
                                border={`1px solid ${property.status === 'Live' ? '#a7f3d0' : '#fde68a'}`}
                                textTransform="uppercase"
                                style={{letterSpacing: '0.5px'}}
                            >
                                {property.status === 'Live' ? '🟢 Live' : '🟡 Draft'}
                            </Box>
                        </Box>
                        {/* Status explanation for draft properties */}
                        {property.status !== 'Live' && (
                            <Box
                                backgroundColor="#fef3cd"
                                color="#92400e"
                                padding="0.75rem 1rem"
                                borderRadius="8px"
                                fontSize="0.875rem"
                                marginBottom="1rem"
                                border="1px solid #fde68a"
                                display="flex"
                                alignItems="center"
                                gap="0.5rem"
                            >
                                <span>ℹ️</span>
                                <span>
                  This property is in draft mode. Rate plans are available for pricing simulation only. 
                  Actual booking is not available until the property goes live.
                </span>
                            </Box>
                        )}

                        <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="1rem" color="#666">
                            <IoIosPin/>
                            <span>
                {property.address?.city ? `${property.address.city}, ` : ''}
                                {property.address?.countryOrRegion || 'Location not set'}
              </span>
                        </Box>

                        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(150px, 1fr))" gap="1rem"
                             marginBottom="2rem">
                            <Box display="flex" alignItems="center" gap="0.5rem" color="#666">
                                <IoIosPeople style={{color: '#059669'}}/>
                                <span>Up to {property.maximumGuest} guests</span>
                            </Box>
                            <Box display="flex" alignItems="center" gap="0.5rem" color="#666">
                                <IoIosWater style={{color: '#059669'}}/>
                                <span>{property.bathrooms} bathrooms</span>
                            </Box>
                            {property.rooms && property.rooms.length > 0 && (
                                <Box display="flex" alignItems="center" gap="0.5rem" color="#666">
                                    <IoIosBed style={{color: '#059669'}}/>
                                    <span>{property.rooms.length} rooms</span>
                                </Box>
                            )}
                            {property.propertySizeSqMtr && (
                                <Box display="flex" alignItems="center" gap="0.5rem" color="#666">
                                    <IoIosResize style={{color: '#059669'}}/>
                                    <span>{property.propertySizeSqMtr} m²</span>
                                </Box>
                            )}
                        </Box>
                    </Box>


                    {/* About Property */}
                    {property.aboutTheProperty && (
                        <Box marginBottom="2rem">
                            <h3 style={{fontSize: '1.25rem', fontWeight: '600', margin: '0 0 1rem 0'}}>
                                About this property
                            </h3>
                            <p style={{color: '#666', lineHeight: 1.6, margin: 0}}>
                                {property.aboutTheProperty}
                            </p>
                        </Box>
                    )}

                    {/* Comprehensive Amenities Section */}
                    {property.amenities && property.amenities.length > 0 && (
                        <Box marginBottom="2rem">
                            <h3 style={{fontSize: '1.25rem', fontWeight: '600', margin: '0 0 1rem 0'}}>
                                What this place offers
                            </h3>

                            {/* Group amenities by category */}
                            {(() => {
                                const amenitiesByCategory: Record<string, any[]> = {}
                                property.amenities?.forEach(amenity => {
                                    if (!amenitiesByCategory[amenity.category]) {
                                        amenitiesByCategory[amenity.category] = []
                                    }
                                    amenitiesByCategory[amenity.category].push(amenity)
                                })

                                return Object.entries(amenitiesByCategory).slice(0, 4).map(([category, amenities]) => (
                                    <Box key={category} marginBottom="1.5rem">
                                        <Box fontSize="1rem" fontWeight="600" color="#374151" marginBottom="0.75rem">
                                            {category}
                                        </Box>
                                        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
                                             gap="0.75rem">
                                            {amenities.map((amenity, index) => {
                                                const amenityDef = findAmenityById(amenity.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
                                                const icon = amenityDef?.icon || <IoIosHome size={18}/>

                                                return (
                                                    <Box key={amenity.id || index} display="flex" alignItems="center"
                                                         gap="0.75rem" padding="0.5rem">
                                                        <Box color="#059669" fontSize="18px">
                                                            {icon}
                                                        </Box>
                                                        <span style={{
                                                            color: '#374151',
                                                            fontSize: '0.875rem'
                                                        }}>{amenity.name}</span>
                                                    </Box>
                                                )
                                            })}
                                        </Box>
                                    </Box>
                                ))
                            })()}

                            {property.amenities.length > 16 && (
                                <Box
                                    padding="0.75rem 1rem"
                                    border="1px solid #d1d5db"
                                    borderRadius="8px"
                                    textAlign="center"
                                    color="#059669"
                                    fontWeight="500"
                                    cursor="pointer"
                                >
                                    Show all {property.amenities.length} amenities
                                </Box>
                            )}
                        </Box>
                    )}

                    {/* Room Details */}
                    {property.rooms && property.rooms.length > 0 && (
                        <Box marginBottom="2rem">
                            <h3 style={{fontSize: '1.25rem', fontWeight: '600', margin: '0 0 1rem 0'}}>
                                Sleeping arrangements
                            </h3>
                            <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap="1rem">
                                {property.rooms.map((room, index) => (
                                    <Box
                                        key={index}
                                        padding="1rem"
                                        border="1px solid #e5e7eb"
                                        borderRadius="8px"
                                        backgroundColor="#fafafa"
                                    >
                                        <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.75rem">
                                            <IoIosBed style={{color: '#059669'}}/>
                                            <Box fontWeight="600" color="#374151">{room.spaceName}</Box>
                                        </Box>
                                        {room.beds && room.beds.length > 0 && (
                                            <Box>
                                                {room.beds.map((bed, bedIndex) => (
                                                    <Box key={bedIndex} fontSize="0.875rem" color="#666"
                                                         marginBottom="0.25rem">
                                                        {bed.numberOfBed} × {bed.typeOfBed.replace(/([A-Z])/g, ' $1').trim()}
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* House Rules */}
                    <Box marginBottom="2rem">
                        <h3 style={{fontSize: '1.25rem', fontWeight: '600', margin: '0 0 1rem 0'}}>
                            House rules
                        </h3>
                        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="1rem">
                            <Box display="flex" alignItems="center" gap="0.5rem">
                                {property.smokingAllowed ? (
                                    <IoIosCheckmarkCircle style={{color: '#059669'}}/>
                                ) : (
                                    <IoIosCloseCircle style={{color: '#dc2626'}}/>
                                )}
                                <span style={{color: '#374151', fontSize: '0.875rem'}}>
                  {property.smokingAllowed ? 'Smoking allowed' : 'No smoking'}
                </span>
                            </Box>

                            <Box display="flex" alignItems="center" gap="0.5rem">
                                {property.partiesOrEventsAllowed ? (
                                    <IoIosCheckmarkCircle style={{color: '#059669'}}/>
                                ) : (
                                    <IoIosClose style={{color: '#dc2626'}}/>
                                )}
                                <span style={{color: '#374151', fontSize: '0.875rem'}}>
                  {property.partiesOrEventsAllowed ? 'Events allowed' : 'No parties or events'}
                </span>
                            </Box>

                            <Box display="flex" alignItems="center" gap="0.5rem">
                                {property.petsAllowed !== 'No' ? (
                                    <IoIosCheckmarkCircle style={{color: '#059669'}}/>
                                ) : (
                                    <IoIosClose style={{color: '#dc2626'}}/>
                                )}
                                <span style={{color: '#374151', fontSize: '0.875rem'}}>
                  {PetPolicyLabels[property.petsAllowed]}
                </span>
                            </Box>

                            {property.allowChildren && (
                                <Box display="flex" alignItems="center" gap="0.5rem">
                                    <IoIosCheckmarkCircle style={{color: '#059669'}}/>
                                    <span style={{color: '#374151', fontSize: '0.875rem'}}>
                    Children welcome
                  </span>
                                </Box>
                            )}

                            {property.checkInCheckout && (
                                <Box>
                                    <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.25rem">
                                        <IoIosTime style={{color: '#059669'}}/>
                                        <span style={{
                                            color: '#374151',
                                            fontSize: '0.875rem',
                                            fontWeight: '600'
                                        }}>Check-in/out</span>
                                    </Box>
                                    <Box fontSize="0.75rem" color="#666" marginLeft="1.5rem">
                                        Check-in: {property.checkInCheckout.checkInFrom} - {property.checkInCheckout.checkInUntil}
                                    </Box>
                                    <Box fontSize="0.75rem" color="#666" marginLeft="1.5rem">
                                        Check-out: {property.checkInCheckout.checkOutFrom} - {property.checkInCheckout.checkOutUntil}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Box>

                    {/* Additional Services */}
                    <Box marginBottom="2rem">
                        <h3 style={{fontSize: '1.25rem', fontWeight: '600', margin: '0 0 1rem 0'}}>
                            Services & Facilities
                        </h3>
                        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="1rem">
                            <Box display="flex" alignItems="center" gap="0.5rem">
                                <IoIosCar style={{color: '#059669'}}/>
                                <span style={{color: '#374151', fontSize: '0.875rem'}}>
                  {ParkingTypeLabels[property.parking]}
                </span>
                            </Box>

                            {property.languages && property.languages.length > 0 && (
                                <Box>
                                    <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.25rem">
                                        <IoIosGlobe style={{color: '#059669'}}/>
                                        <span style={{color: '#374151', fontSize: '0.875rem', fontWeight: '600'}}>Languages spoken</span>
                                    </Box>
                                    <Box fontSize="0.75rem" color="#666" marginLeft="1.5rem">
                                        {property.languages.join(', ')}
                                    </Box>
                                </Box>
                            )}

                            {property.offerCribs && (
                                <Box display="flex" alignItems="center" gap="0.5rem">
                                    <IoIosHappy style={{color: '#059669'}}/>
                                    <span style={{color: '#374151', fontSize: '0.875rem'}}>Cribs available</span>
                                </Box>
                            )}
                        </Box>
                    </Box>

                    {/* About the neighborhood */}
                    {property.aboutTheNeighborhood && (
                        <Box marginBottom="2rem">
                            <h3 style={{fontSize: '1.25rem', fontWeight: '600', margin: '0 0 1rem 0'}}>
                                About the neighborhood
                            </h3>
                            <p style={{color: '#666', lineHeight: 1.6, margin: 0}}>
                                {property.aboutTheNeighborhood}
                            </p>
                        </Box>
                    )}
                </Box>

                {/* Right Sidebar: Booking Widget (Mobile & Desktop) */}
                <Box
                    width="100%"
                    display="block"
                    marginBottom="2rem"
                    marginBottomMd="0"
                >
                    <Box
                        backgroundColor="white"
                        borderRadius="8px"
                        top="6rem"
                    >
                        <Box marginBottom="1.5rem">
                            <Box fontSize="1.5rem" fontWeight="bold" color="#059669">
                                {selectedTotalPrice > 0 ? (
                                    `AED ${Math.round(selectedTotalPrice)}`
                                ) : (
                                    'Select dates for pricing'
                                )}
                            </Box>
                            <Box fontSize="0.875rem" color="#666">
                                {selectedTotalPrice > 0 ?
                                    `for your stay` :
                                    'per night'
                                }
                            </Box>
                        </Box>

                        {/* Booking Type Toggle */}
                        <Box marginBottom="1rem">
                            <Box fontSize="0.875rem" fontWeight="600" color="#374151" marginBottom="0.5rem">
                                Booking Type
                            </Box>
                            <ToggleButton
                                options={[
                                    {
                                        value: 'half-day',
                                        label: 'Half Day',
                                        icon: <IoIosTime/>
                                    },
                                    {
                                        value: 'full-stay',
                                        label: 'Full Stay',
                                        icon: <IoIosCalendar/>
                                    }
                                ]}
                                value={bookingType}
                                onChange={setBookingType}
                                variant="segmented"
                                fullWidth
                            />
                        </Box>

                        {/* Pricing Calendar */}
                        <Box marginBottom="1rem">
                            <Box fontSize="0.875rem" fontWeight="600" color="#374151" marginBottom="0.5rem">
                                Select Your Dates & View Prices
                            </Box>
                            <PricingCalendar
                                value={bookingType === 'half-day' ? {
                                    startDate: singleDate,
                                    endDate: singleDate
                                } : dateRange}
                                onChange={handleCalendarSelection}
                                priceData={publicPricingCalendar}
                                defaultPriceMode={bookingType === 'half-day' ? 'half-day' : 'full-day'}
                                minDate={new Date()}
                                minNights={bookingType === 'half-day' ? 0 : 1}
                                maxNights={30}
                                loading={pricingLoading}
                            />
                        </Box>
                        {/* Booking Rate Plan Selector */}
                        <BookingRatePlanSelector
                            loading={calculatingOptions}
                        />

                        <Box marginBottom="1.5rem">
                            <NumberStepperInput
                                label="Guests"
                                value={numGuests}
                                onChange={setNumGuests}
                                step={1}
                                min={1}
                                max={property.maximumGuest}
                                format="integer"
                                required
                            />
                        </Box>

                        <Button
                            label="Book Now"
                            icon={<IoIosCalendar/>}
                            onClick={handleBookNow}
                            variant="promoted"
                            size="large"
                            style={{width: '100%'}}
                        />

                        <Box fontSize="0.75rem" color="#666" textAlign="center" marginTop="1rem">
                            You won't be charged yet
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Mobile Sticky Booking Bar - Hidden since booking widget is now visible on mobile */}
            {/* Removed to prevent duplication with the now-visible booking widget */}

            {/* Mobile Booking Form Drawer */}
            <SlidingDrawer
                isOpen={showMobileBookingForm}
                onClose={() => setShowMobileBookingForm(false)}
                side="bottom"
                height="80%"
                showCloseButton={true}
            >
                <Box padding="1.5rem" display="flex" flexDirection="column" height="100%" overflow="auto">
                    {/* Header */}
                    <Box marginBottom="1.5rem">
                        <Box fontSize="1.25rem" fontWeight="600" marginBottom="0.5rem" textAlign="center">
                            Book your stay
                        </Box>
                        <Box fontSize="0.875rem" color="#666" textAlign="center">
                            {property.name}
                        </Box>
                    </Box>

                    {/* Booking Type Toggle */}
                    <Box marginBottom="1rem">
                        <Box fontSize="0.875rem" fontWeight="600" color="#374151" marginBottom="0.5rem">
                            Booking Type
                        </Box>
                        <ToggleButton
                            options={[
                                {
                                    value: 'half-day',
                                    label: 'Half Day',
                                    icon: <IoIosTime/>
                                },
                                {
                                    value: 'full-stay',
                                    label: 'Full Stay',
                                    icon: <IoIosCalendar/>
                                }
                            ]}
                            value={bookingType}
                            onChange={setBookingType}
                            variant="segmented"
                            fullWidth
                        />
                    </Box>

                    {/* Pricing Calendar */}
                    <Box marginBottom="1rem">
                        <Box fontSize="0.875rem" fontWeight="600" color="#374151" marginBottom="0.5rem">
                            Select Your Dates & View Prices
                        </Box>
                        <PricingCalendar
                            value={bookingType === 'half-day' ? {
                                startDate: singleDate,
                                endDate: singleDate
                            } : dateRange}
                            onChange={handleCalendarSelection}
                            priceData={publicPricingCalendar}
                            defaultPriceMode={bookingType === 'half-day' ? 'half-day' : 'full-day'}
                            minDate={new Date()}
                            minNights={bookingType === 'half-day' ? 0 : 1}
                            maxNights={30}
                            loading={pricingLoading}
                        />
                    </Box>

                    {/* Booking Rate Plan Selector */}
                    <BookingRatePlanSelector
                        loading={calculatingOptions}
                    />

                    <Box marginBottom="1.5rem">
                        <NumberStepperInput
                            label="Guests"
                            value={numGuests}
                            onChange={setNumGuests}
                            step={1}
                            min={1}
                            max={property.maximumGuest}
                            format="integer"
                            required
                        />
                    </Box>

                    {/* Price Summary */}
                    {selectedTotalPrice > 0 && (
                        <Box
                            marginBottom="1.5rem"
                            padding="1rem"
                            backgroundColor="#f8f9fa"
                            borderRadius="8px"
                        >
                            <Box fontSize="1.125rem" fontWeight="bold" color="#059669" marginBottom="0.25rem">
                                AED {Math.round(selectedTotalPrice)}
                            </Box>
                            <Box fontSize="0.875rem" color="#666">
                                for your stay
                            </Box>
                        </Box>
                    )}

                    {/* Action Buttons */}
                    <Box marginTop="auto" paddingTop="1rem">
                        <Button
                            label="Book Now"
                            icon={<IoIosCalendar/>}
                            onClick={handleBookNow}
                            variant="promoted"
                            size="large"
                            style={{width: '100%', marginBottom: '0.5rem'}}
                        />

                        <Box fontSize="0.75rem" color="#666" textAlign="center">
                            You won't be charged yet
                        </Box>
                    </Box>
                </Box>
            </SlidingDrawer>
        </Box>
    )
}

export default PropertyDetail