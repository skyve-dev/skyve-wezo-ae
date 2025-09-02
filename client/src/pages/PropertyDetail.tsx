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
import SelectionPicker from '@/components/base/SelectionPicker'
import SlidingDrawer from '@/components/base/SlidingDrawer'
import { 
  IoIosArrowBack, 
  IoIosPin, 
  IoIosWater, 
  IoIosPeople,
  IoIosCalendar,
  IoIosShare,
  IoIosBed,
  IoIosHome,
  IoIosCar,
  IoIosCloseCircle,
  IoIosTime,
  IoIosGlobe,
  IoIosResize,
  IoIosHappy,
  IoIosCheckmarkCircle,
  IoIosClose
} from 'react-icons/io'
import { resolvePhotoUrl } from '@/utils/api'
import { findAmenityById } from '@/constants/amenities'
import { ParkingTypeLabels, PetPolicyLabels } from '@/constants/propertyEnums'

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
  const [selectedRatePlanId, setSelectedRatePlanId] = useState<string>('')
  
  // Mobile booking form state
  const [showMobileBookingForm, setShowMobileBookingForm] = useState(false)

  // Get selected rate plan pricing
  const selectedRatePlan = pricingCalculation?.availableRateOptions?.find(
    (option: any) => option.ratePlanId === selectedRatePlanId
  )
  const selectedTotalPrice = selectedRatePlan?.totalPrice || pricingCalculation?.totalPrice || 0
  const selectedPricePerNight = selectedRatePlan?.pricePerNight || pricingCalculation?.pricePerNight || 0

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
          // Auto-select the first (cheapest) rate plan
          if (result.payload?.availableRateOptions?.length > 0) {
            setSelectedRatePlanId(result.payload.availableRateOptions[0].ratePlanId)
          }
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

    if (!selectedRatePlanId) {
      alert('Please select a rate plan')
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
            numGuests,
            ratePlanId: selectedRatePlanId,
            totalPrice: selectedTotalPrice,
            pricePerNight: selectedPricePerNight
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
          icon={<IoIosArrowBack />}
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
          icon={<IoIosArrowBack />}
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
          icon={<IoIosShare />}
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
            <IoIosPin size={48} />
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
              <IoIosPin />
              <span>
                {property.address?.city ? `${property.address.city}, ` : ''}
                {property.address?.countryOrRegion || 'Location not set'}
              </span>
            </Box>

            <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(150px, 1fr))" gap="1rem" marginBottom="2rem">
              <Box display="flex" alignItems="center" gap="0.5rem" color="#666">
                <IoIosPeople style={{color: '#059669'}} />
                <span>Up to {property.maximumGuest} guests</span>
              </Box>
              <Box display="flex" alignItems="center" gap="0.5rem" color="#666">
                <IoIosWater style={{color: '#059669'}} />
                <span>{property.bathrooms} bathrooms</span>
              </Box>
              {property.rooms && property.rooms.length > 0 && (
                <Box display="flex" alignItems="center" gap="0.5rem" color="#666">
                  <IoIosBed style={{color: '#059669'}} />
                  <span>{property.rooms.length} rooms</span>
                </Box>
              )}
              {property.propertySizeSqMtr && (
                <Box display="flex" alignItems="center" gap="0.5rem" color="#666">
                  <IoIosResize style={{color: '#059669'}} />
                  <span>{property.propertySizeSqMtr} m²</span>
                </Box>
              )}
            </Box>
          </Box>

          {/* Rate Plan Selection */}
          {pricingCalculation?.availableRateOptions?.length > 0 && (
            <Box marginBottom="2rem">
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 1rem 0' }}>
                Choose Your Rate Plan
              </h3>
              
              <Box marginBottom="1rem">
                <SelectionPicker
                  data={pricingCalculation.availableRateOptions}
                  idAccessor={(option: any) => option.ratePlanId}
                  value={selectedRatePlanId}
                  onChange={(value) => setSelectedRatePlanId(value as string)}
                  isMultiSelect={false}
                  renderItem={(ratePlan: any, isSelected) => (
                    <Box
                      display="flex"
                      alignItems="center"
                      gap="1rem"
                      padding="1rem"
                      backgroundColor={isSelected ? "#f0f9ff" : "white"}
                      borderRadius="6px"
                      border={isSelected ? "2px solid #0369a1" : "1px solid #e5e7eb"}
                      cursor="pointer"
                      transition="all 0.2s"
                    >
                      <Box flex="1">
                        <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
                          <Box fontWeight="600" fontSize="1rem">
                            {ratePlan.name}
                          </Box>
                          {ratePlan.adjustmentType === 'Percentage' && (
                            <Box 
                              fontSize="0.75rem" 
                              padding="0.25rem 0.5rem"
                              backgroundColor="#fef3c7"
                              color="#92400e"
                              borderRadius="12px"
                              fontWeight="500"
                            >
                              Special Rate
                            </Box>
                          )}
                        </Box>
                        <Box fontSize="0.875rem" color="#666" marginBottom="0.5rem">
                          {ratePlan.type} • {ratePlan.includesBreakfast ? 'Includes Breakfast' : 'Room Only'}
                        </Box>
                        <Box display="flex" alignItems="center" gap="1rem">
                          <Box>
                            <Box fontSize="0.75rem" color="#666">Per Night</Box>
                            <Box fontWeight="600" fontSize="1rem">
                              AED {Math.round(ratePlan.pricePerNight || 0)}
                            </Box>
                          </Box>
                          <Box>
                            <Box fontSize="0.75rem" color="#666">Total Stay</Box>
                            <Box fontWeight="600" fontSize="1.125rem" color="#059669">
                              AED {Math.round(ratePlan.totalPrice || 0)}
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                      
                      {isSelected && (
                        <Box
                          width="20px"
                          height="20px"
                          borderRadius="50%"
                          backgroundColor="#0369a1"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Box fontSize="0.75rem" color="white">✓</Box>
                        </Box>
                      )}
                    </Box>
                  )}
                  containerStyles={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                />
              </Box>
              
              {pricingCalculation.message && (
                <Box 
                  fontSize="0.875rem" 
                  color="#666" 
                  textAlign="center" 
                  padding="0.5rem"
                  backgroundColor="#f9fafb"
                  borderRadius="6px"
                >
                  {pricingCalculation.message}
                </Box>
              )}
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

          {/* Comprehensive Amenities Section */}
          {property.amenities && property.amenities.length > 0 && (
            <Box marginBottom="2rem">
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 1rem 0' }}>
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
                    <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap="0.75rem">
                      {amenities.map((amenity, index) => {
                        const amenityDef = findAmenityById(amenity.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
                        const icon = amenityDef?.icon || <IoIosHome size={18} />
                        
                        return (
                          <Box key={amenity.id || index} display="flex" alignItems="center" gap="0.75rem" padding="0.5rem">
                            <Box color="#059669" fontSize="18px">
                              {icon}
                            </Box>
                            <span style={{color: '#374151', fontSize: '0.875rem'}}>{amenity.name}</span>
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
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 1rem 0' }}>
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
                      <IoIosBed style={{color: '#059669'}} />
                      <Box fontWeight="600" color="#374151">{room.spaceName}</Box>
                    </Box>
                    {room.beds && room.beds.length > 0 && (
                      <Box>
                        {room.beds.map((bed, bedIndex) => (
                          <Box key={bedIndex} fontSize="0.875rem" color="#666" marginBottom="0.25rem">
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 1rem 0' }}>
              House rules
            </h3>
            <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="1rem">
              <Box display="flex" alignItems="center" gap="0.5rem">
                {property.smokingAllowed ? (
                  <IoIosCheckmarkCircle style={{color: '#059669'}} />
                ) : (
                  <IoIosCloseCircle style={{color: '#dc2626'}} />
                )}
                <span style={{color: '#374151', fontSize: '0.875rem'}}>
                  {property.smokingAllowed ? 'Smoking allowed' : 'No smoking'}
                </span>
              </Box>
              
              <Box display="flex" alignItems="center" gap="0.5rem">
                {property.partiesOrEventsAllowed ? (
                  <IoIosCheckmarkCircle style={{color: '#059669'}} />
                ) : (
                  <IoIosClose style={{color: '#dc2626'}} />
                )}
                <span style={{color: '#374151', fontSize: '0.875rem'}}>
                  {property.partiesOrEventsAllowed ? 'Events allowed' : 'No parties or events'}
                </span>
              </Box>
              
              <Box display="flex" alignItems="center" gap="0.5rem">
                {property.petsAllowed !== 'No' ? (
                  <IoIosCheckmarkCircle style={{color: '#059669'}} />
                ) : (
                  <IoIosClose style={{color: '#dc2626'}} />
                )}
                <span style={{color: '#374151', fontSize: '0.875rem'}}>
                  {PetPolicyLabels[property.petsAllowed]}
                </span>
              </Box>
              
              {property.allowChildren && (
                <Box display="flex" alignItems="center" gap="0.5rem">
                  <IoIosCheckmarkCircle style={{color: '#059669'}} />
                  <span style={{color: '#374151', fontSize: '0.875rem'}}>
                    Children welcome
                  </span>
                </Box>
              )}
              
              {property.checkInCheckout && (
                <Box>
                  <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.25rem">
                    <IoIosTime style={{color: '#059669'}} />
                    <span style={{color: '#374151', fontSize: '0.875rem', fontWeight: '600'}}>Check-in/out</span>
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 1rem 0' }}>
              Services & Facilities
            </h3>
            <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="1rem">
              <Box display="flex" alignItems="center" gap="0.5rem">
                <IoIosCar style={{color: '#059669'}} />
                <span style={{color: '#374151', fontSize: '0.875rem'}}>
                  {ParkingTypeLabels[property.parking]}
                </span>
              </Box>
              
              {property.languages && property.languages.length > 0 && (
                <Box>
                  <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.25rem">
                    <IoIosGlobe style={{color: '#059669'}} />
                    <span style={{color: '#374151', fontSize: '0.875rem', fontWeight: '600'}}>Languages spoken</span>
                  </Box>
                  <Box fontSize="0.75rem" color="#666" marginLeft="1.5rem">
                    {property.languages.join(', ')}
                  </Box>
                </Box>
              )}
              
              {property.offerCribs && (
                <Box display="flex" alignItems="center" gap="0.5rem">
                  <IoIosHappy style={{color: '#059669'}} />
                  <span style={{color: '#374151', fontSize: '0.875rem'}}>Cribs available</span>
                </Box>
              )}
            </Box>
          </Box>
          
          {/* About the neighborhood */}
          {property.aboutTheNeighborhood && (
            <Box marginBottom="2rem">
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 1rem 0' }}>
                About the neighborhood
              </h3>
              <p style={{ color: '#666', lineHeight: 1.6, margin: 0 }}>
                {property.aboutTheNeighborhood}
              </p>
            </Box>
          )}
        </Box>

        {/* Right Sidebar: Booking Widget (Mobile & Desktop) */}
        <Box
          width="100%"
          widthMd="350px"
          display="block"
          marginBottom="2rem"
          marginBottomMd="0"
        >
          <Box
            backgroundColor="white"
            borderRadius="12px"
            boxShadow="0 4px 6px rgba(0,0,0,0.1)"
            padding="1.5rem"
            position="static"
            positionMd="sticky"
            top="6rem"
          >
            <Box marginBottom="1.5rem">
              <Box fontSize="1.5rem" fontWeight="bold" color="#059669">
                {pricingCalculation ? (
                  `AED ${Math.round(selectedTotalPrice)}`
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
              icon={<IoIosCalendar />}
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

          {/* Rate Plan Selection */}
          {pricingCalculation?.availableRateOptions?.length > 0 && (
            <Box marginBottom="1.5rem">
              <Box fontSize="1rem" fontWeight="600" marginBottom="0.75rem">
                Choose Your Rate Plan
              </Box>
              
              <SelectionPicker
                data={pricingCalculation.availableRateOptions}
                idAccessor={(option: any) => option.ratePlanId}
                value={selectedRatePlanId}
                onChange={(value) => setSelectedRatePlanId(value as string)}
                isMultiSelect={false}
                renderItem={(ratePlan: any, isSelected) => (
                  <Box
                    display="flex"
                    alignItems="center"
                    gap="0.75rem"
                    padding="0.75rem"
                    backgroundColor={isSelected ? "#f0f9ff" : "white"}
                    borderRadius="6px"
                    border={isSelected ? "2px solid #0369a1" : "1px solid #e5e7eb"}
                    cursor="pointer"
                  >
                    <Box flex="1">
                      <Box fontWeight="600" fontSize="0.875rem" marginBottom="0.25rem">
                        {ratePlan.name}
                      </Box>
                      <Box fontSize="0.75rem" color="#666" marginBottom="0.5rem">
                        {ratePlan.type} • {ratePlan.includesBreakfast ? 'Includes Breakfast' : 'Room Only'}
                      </Box>
                      <Box display="flex" alignItems="center" gap="1rem">
                        <Box>
                          <Box fontSize="0.75rem" color="#666">Per Night</Box>
                          <Box fontWeight="600" fontSize="0.875rem">
                            AED {Math.round(ratePlan.pricePerNight || 0)}
                          </Box>
                        </Box>
                        <Box>
                          <Box fontSize="0.75rem" color="#666">Total</Box>
                          <Box fontWeight="600" fontSize="1rem" color="#059669">
                            AED {Math.round(ratePlan.totalPrice || 0)}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                    
                    {isSelected && (
                      <Box
                        width="16px"
                        height="16px"
                        borderRadius="50%"
                        backgroundColor="#0369a1"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Box fontSize="0.75rem" color="white">✓</Box>
                      </Box>
                    )}
                  </Box>
                )}
                containerStyles={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              />
            </Box>
          )}

          {/* Price Summary */}
          {pricingCalculation && (
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
                for {pricingCalculation.stayDuration || 1} night{(pricingCalculation.stayDuration || 1) > 1 ? 's' : ''}
              </Box>
            </Box>
          )}

          {/* Action Buttons */}
          <Box marginTop="auto" paddingTop="1rem">
            <Button
              label="Check Availability"
              icon={<IoIosCalendar />}
              onClick={handleBookNow}
              variant="promoted"
              size="large"
              style={{ width: '100%', marginBottom: '0.5rem' }}
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