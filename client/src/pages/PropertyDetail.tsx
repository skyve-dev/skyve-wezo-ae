import React, { useEffect, useState } from 'react'
import { useAppShell } from '@/components/base/AppShell'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchPropertyById } from '@/store/slices/propertySlice'
import { fetchPublicRatePlans, calculateRatePricing } from '@/store/slices/ratePlanSlice'
import { checkBookingAvailability } from '@/store/slices/availabilitySlice'
import { Box } from '@/components/base/Box'
import { Button } from '@/components/base/Button'
import DatePicker from '@/components/base/DatePicker'
import NumberStepperInput from '@/components/base/NumberStepperInput'
import { 
  FaArrowLeft, 
  FaMapMarkerAlt, 
  FaBath, 
  FaUsers,
  FaCalendarAlt,
  FaWifi,
  FaShare
} from 'react-icons/fa'
import { resolvePhotoUrl } from '@/utils/api'

interface PropertyDetailProps {
  propertyId: string
}

const PropertyDetail: React.FC<PropertyDetailProps> = ({ propertyId }) => {
  const { navigateBack, canNavigateBack, navigateTo, currentParams } = useAppShell()
  const dispatch = useAppDispatch()
  
  // Get propertyId from props or route params (route uses 'id' parameter)
  const actualPropertyId = propertyId || (currentParams as any)?.id
  
  // Debug logging
  console.log('🔍 PropertyDetail Debug:', {
    propPropertyId: propertyId,
    currentParams,
    actualPropertyId
  })
  
  // Redux state
  const { currentProperty, loading, error } = useAppSelector((state) => state.property)
  const { currentRoleMode } = useAppSelector((state) => state.auth)
  const { ratePlans } = useAppSelector((state) => state.ratePlan)
  
  // Local state for booking widget
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [numGuests, setNumGuests] = useState(1)
  const [pricingCalculation, setPricingCalculation] = useState<any>(null)

  // Fetch property data on mount
  useEffect(() => {
    if (actualPropertyId && actualPropertyId !== 'new') {
      // Use regular API since it's already public (no auth required)
      dispatch(fetchPropertyById(actualPropertyId))
      dispatch(fetchPublicRatePlans(actualPropertyId))
    }
  }, [actualPropertyId, dispatch])

  // Calculate pricing when dates or guest count changes
  useEffect(() => {
    if (actualPropertyId && checkInDate && checkOutDate && numGuests) {
      dispatch(calculateRatePricing({
        propertyId: actualPropertyId,
        checkInDate,
        checkOutDate,
        numGuests
      })).then((result) => {
        if (result.meta.requestStatus === 'fulfilled') {
          setPricingCalculation(result.payload)
        }
      })
    }
  }, [actualPropertyId, checkInDate, checkOutDate, numGuests, dispatch])

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
      alert('Property not found. Please try again.')
      return
    }
    
    if (!checkInDate || !checkOutDate || !numGuests) {
      alert('Please select check-in date, check-out date, and number of guests')
      return
    }
    
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
          navigateTo('booking-checkout', {
            propertyId: actualPropertyId,
            checkInDate,
            checkOutDate,
            numGuests
          })
        } else {
          alert(availability.reason || 'Selected dates are not available')
        }
      }
    } catch (error) {
      alert('Error checking availability. Please try again.')
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
          icon={<FaArrowLeft />}
          onClick={handleBack}
          variant="normal"
        />
      </Box>
    )
  }

  const property = currentProperty
  const isGuestMode = currentRoleMode === 'Tenant'

  return (
    <Box>
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
          icon={<FaArrowLeft />}
          onClick={handleBack}
          variant="normal"
          size="small"
          style={{ backgroundColor: 'transparent', border: 'none' }}
        />
        <Box flex="1" marginLeft="1rem">
          <h1 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
            {property.name}
          </h1>
        </Box>
        <Button
          label=""
          icon={<FaShare />}
          onClick={() => navigator.share?.({ 
            title: property.name, 
            url: window.location.href 
          })}
          variant="normal"
          size="small"
          style={{ backgroundColor: 'transparent', border: 'none' }}
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
                style={{ scrollSnapType: 'x mandatory' }}
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
                    style={{ scrollSnapAlign: 'start' }}
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
            <FaMapMarkerAlt size={48} />
          </Box>
        )}
      </Box>

      {/* Main Content with Booking Widget */}
      <Box display="flex" flexDirection="column" flexDirectionMd="row" gap="2rem" padding="2rem">
        {/* Left Content */}
        <Box flex="1">
          {/* Property Basic Info */}
          <Box marginBottom="2rem">
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
              {property.name}
            </h1>
            
            <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="1rem" color="#666">
              <FaMapMarkerAlt />
              <span>
                {property.address?.city ? `${property.address.city}, ` : ''}
                {property.address?.countryOrRegion || 'Location not set'}
              </span>
            </Box>

            <Box display="flex" gap="1.5rem" marginBottom="1rem" color="#666" fontSize="0.875rem">
              <Box display="flex" alignItems="center" gap="0.25rem">
                <FaUsers />
                <span>Up to {property.maximumGuest} guests</span>
              </Box>
              <Box display="flex" alignItems="center" gap="0.25rem">
                <FaBath />
                <span>{property.bathrooms} bathrooms</span>
              </Box>
              {property.propertySizeSqMtr && (
                <Box display="flex" alignItems="center" gap="0.25rem">
                  <span>{property.propertySizeSqMtr} m²</span>
                </Box>
              )}
            </Box>
          </Box>

          {/* Rate Plans Comparison Table */}
          {ratePlans.length > 0 && checkInDate && checkOutDate && (
            <Box marginBottom="2rem">
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 1rem 0' }}>
                Available Rate Plans
              </h3>
              <Box 
                border="1px solid #e5e7eb" 
                borderRadius="8px" 
                overflow="hidden"
                backgroundColor="white"
              >
                {/* Table Header */}
                <Box 
                  display="grid" 
                  gridTemplateColumns="2fr 1fr 1fr 1fr" 
                  gap="1rem" 
                  padding="1rem"
                  backgroundColor="#f9fafb"
                  borderBottom="1px solid #e5e7eb"
                  fontSize="0.875rem"
                  fontWeight="600"
                  color="#374151"
                >
                  <Box>Rate Plan</Box>
                  <Box textAlign="center">Price/Night</Box>
                  <Box textAlign="center">Total Price</Box>
                  <Box textAlign="center">Includes</Box>
                </Box>
                
                {/* Table Rows */}
                {pricingCalculation?.ratePlans?.map((ratePlan: any, index: number) => (
                  <Box 
                    key={ratePlan.ratePlanId || index}
                    display="grid" 
                    gridTemplateColumns="2fr 1fr 1fr 1fr" 
                    gap="1rem" 
                    padding="1rem"
                    borderBottom={index < pricingCalculation.ratePlans.length - 1 ? "1px solid #e5e7eb" : "none"}
                    backgroundColor={index === 0 ? "#f0f9ff" : "white"}
                  >
                    <Box>
                      <Box fontWeight="600" marginBottom="0.25rem">
                        {ratePlan.name}
                      </Box>
                      <Box fontSize="0.75rem" color="#666">
                        {ratePlan.type}
                      </Box>
                      {index === 0 && (
                        <Box fontSize="0.75rem" color="#059669" fontWeight="600" marginTop="0.25rem">
                          Best Value
                        </Box>
                      )}
                    </Box>
                    
                    <Box textAlign="center">
                      <Box fontWeight="600">
                        AED {Math.round(ratePlan.pricePerNight || 0)}
                      </Box>
                    </Box>
                    
                    <Box textAlign="center">
                      <Box fontWeight="600" color="#059669">
                        AED {Math.round(ratePlan.totalPrice || 0)}
                      </Box>
                    </Box>
                    
                    <Box textAlign="center">
                      <Box fontSize="0.75rem" color="#666">
                        {ratePlan.includesBreakfast ? 'Breakfast' : 'Room Only'}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* About Property */}
          {property.aboutTheProperty && (
            <Box marginBottom="2rem">
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 1rem 0' }}>
                About this property
              </h3>
              <p style={{ color: '#666', lineHeight: 1.6, margin: 0 }}>
                {property.aboutTheProperty}
              </p>
            </Box>
          )}

          {/* Amenities Preview */}
          {property.amenities && property.amenities.length > 0 && (
            <Box marginBottom="2rem">
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 1rem 0' }}>
                Amenities
              </h3>
              <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="0.5rem">
                {property.amenities.slice(0, 6).map((amenity, index) => (
                  <Box key={amenity.id || index} display="flex" alignItems="center" gap="0.5rem" color="#666">
                    <FaWifi size={16} />
                    <span>{amenity.name}</span>
                  </Box>
                ))}
                {property.amenities.length > 6 && (
                  <Box color="#059669" fontSize="0.875rem">
                    +{property.amenities.length - 6} more amenities
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Box>

        {/* Right Sidebar: Booking Widget (Desktop) */}
        <Box
          width="100%"
          widthMd="350px"
          display="none"
          displayMd="block"
        >
          <Box
            backgroundColor="white"
            borderRadius="12px"
            boxShadow="0 4px 6px rgba(0,0,0,0.1)"
            padding="1.5rem"
            position="sticky"
            top="6rem"
          >
            <Box marginBottom="1.5rem">
              <Box fontSize="1.5rem" fontWeight="bold" color="#059669">
                {pricingCalculation ? (
                  `AED ${Math.round(pricingCalculation.totalStayPrice || 0)}`
                ) : ratePlans.length > 0 ? (
                  `From AED ${Math.round((ratePlans[0] as any).adjustmentValue || 0)}`
                ) : (
                  'Price on request'
                )}
              </Box>
              <Box fontSize="0.875rem" color="#666">
                {pricingCalculation ? 
                  `for ${pricingCalculation.stayDuration || 1} night${(pricingCalculation.stayDuration || 1) > 1 ? 's' : ''}` : 
                  'per night'
                }
              </Box>
            </Box>

            {/* Date Selection */}
            <Box marginBottom="1rem">
              <DatePicker
                label="Check-in"
                value={checkInDate}
                onChange={setCheckInDate}
                placeholder="Select check-in date"
                minDate={new Date().toISOString()}
                required
              />
            </Box>

            <Box marginBottom="1rem">
              <DatePicker
                label="Check-out"
                value={checkOutDate}
                onChange={setCheckOutDate}
                placeholder="Select check-out date"
                minDate={checkInDate || new Date().toISOString()}
                required
              />
            </Box>

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
              label="Check Availability"
              icon={<FaCalendarAlt />}
              onClick={handleBookNow}
              variant="promoted"
              size="large"
              style={{ width: '100%' }}
            />

            <Box fontSize="0.75rem" color="#666" textAlign="center" marginTop="1rem">
              You won't be charged yet
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Mobile Sticky Booking Bar */}
      {isGuestMode && (
        <Box
          display="block"
          displayMd="none"
          position="fixed"
          bottom="0"
          left="0"
          right="0"
          backgroundColor="white"
          borderTop="1px solid #e5e7eb"
          padding="1rem"
          zIndex="20"
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Box fontSize="1.125rem" fontWeight="bold" color="#059669">
                {pricingCalculation ? (
                  `AED ${Math.round(pricingCalculation.totalStayPrice || 0)}`
                ) : ratePlans.length > 0 ? (
                  `From AED ${Math.round((ratePlans[0] as any).adjustmentValue || 0)}`
                ) : (
                  'Price on request'
                )}
              </Box>
              <Box fontSize="0.75rem" color="#666">
                {pricingCalculation ? 
                  `for ${pricingCalculation.stayDuration || 1} night${(pricingCalculation.stayDuration || 1) > 1 ? 's' : ''}` : 
                  'per night'
                }
              </Box>
            </Box>
            <Button
              label="Book Now"
              onClick={handleBookNow}
              variant="promoted"
              size="medium"
            />
          </Box>
        </Box>
      )}

      {/* Bottom padding for mobile sticky bar */}
      <Box height="100px" display="block" displayMd="none" />
    </Box>
  )
}

export default PropertyDetail