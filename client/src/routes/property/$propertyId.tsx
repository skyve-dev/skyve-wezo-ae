import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAppDispatch, useAppSelector } from '../../store'
import { fetchPropertyById, clearError } from '../../store/slices/propertySlice'
import { Box } from '../../components/Box'
import { resolvePhotoUrl } from '../../utils/api'
import { 
  FaUserFriends, 
  FaBath, 
  FaRulerCombined, 
  FaHome,
  FaCreditCard,
  FaChild,
  FaBaby,
  FaSmokingBan,
  FaSmoking,
  FaGlassCheers,
  FaBan,
  FaPaw,
  FaQuestionCircle,
  FaUtensils,
  FaCar,
  FaGlobe,
  FaDollarSign,
  FaTag,
  FaConciergeBell,
  FaMapMarkerAlt,
  FaStar,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa'

export const Route = createFileRoute('/property/$propertyId')({
  component: PropertyDetailsPage,
})

function PropertyDetailsPage() {
  const { propertyId } = Route.useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { currentProperty, loading, error } = useAppSelector((state) => state.property)
  const { user } = useAppSelector((state) => state.auth)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (!user) {
      navigate({ to: '/login' })
      return
    }

    if (propertyId) {
      dispatch(fetchPropertyById(propertyId))
    }
  }, [user, propertyId, dispatch, navigate])

  useEffect(() => {
    if (error) {
      dispatch(clearError())
    }
  }, [])

  const handleEdit = () => {
    navigate({ to: `/edit-property/${propertyId}` })
  }

  const handleBack = () => {
    navigate({ to: '/dashboard/my-properties' })
  }

  const nextImage = () => {
    if (currentProperty?.photos && currentProperty.photos.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === currentProperty.photos!.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (currentProperty?.photos && currentProperty.photos.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? currentProperty.photos!.length - 1 : prev - 1
      )
    }
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <Box minHeight="100vh" backgroundColor="#f8fafc">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <Box textAlign="center">
            <Box fontSize="1.125rem" color="#718096">
              Loading property details...
            </Box>
          </Box>
        </Box>
      </Box>
    )
  }

  if (error) {
    return (
      <Box minHeight="100vh" backgroundColor="#f8fafc">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <Box textAlign="center">
            <Box fontSize="1.5rem" fontWeight="600" color="#dc2626" marginBottom="1rem">
              Error Loading Property
            </Box>
            <Box fontSize="1rem" color="#718096" marginBottom="2rem">
              {error}
            </Box>
            <Box
              as="button"
              onClick={handleBack}
              padding="0.75rem 1.5rem"
              backgroundColor="#3182ce"
              color="white"
              border="none"
              borderRadius="0.375rem"
              cursor="pointer"
            >
              Back to My Properties
            </Box>
          </Box>
        </Box>
      </Box>
    )
  }

  if (!currentProperty) {
    return (
      <Box minHeight="100vh" backgroundColor="#f8fafc">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <Box textAlign="center">
            <Box fontSize="1.5rem" fontWeight="600" color="#374151" marginBottom="1rem">
              Property Not Found
            </Box>
            <Box fontSize="1rem" color="#718096" marginBottom="2rem">
              The property you're looking for doesn't exist or you don't have permission to view it.
            </Box>
            <Box
              as="button"
              onClick={handleBack}
              padding="0.75rem 1.5rem"
              backgroundColor="#3182ce"
              color="white"
              border="none"
              borderRadius="0.375rem"
              cursor="pointer"
            >
              Back to My Properties
            </Box>
          </Box>
        </Box>
      </Box>
    )
  }

  const property = currentProperty

  return (
    <Box minHeight="100vh" backgroundColor="#f8fafc">
      {/* Header */}
      <Box 
        backgroundColor="white" 
        borderBottom="1px solid #e2e8f0"
        padding="1rem 0"
        position="sticky"
        top="0"
        zIndex={10}
      >
        <Box maxWidth="1200px" margin="0 auto" padding="0 1rem">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap="1rem">
              <Box
                as="button"
                onClick={handleBack}
                padding="0.5rem 1rem"
                backgroundColor="transparent"
                color="#718096"
                border="1px solid #e2e8f0"
                borderRadius="0.375rem"
                cursor="pointer"
                whileHover={{ backgroundColor: '#f7fafc' }}
              >
                ← Back
              </Box>
              <Box>
                <Box fontSize="1.5rem" fontWeight="600" color="#1a202c">
                  {property.name}
                </Box>
                <Box fontSize="0.875rem" color="#718096">
                  {property.address.city}, {property.address.countryOrRegion}
                </Box>
              </Box>
            </Box>
            <Box>
              <Box
                as="button"
                onClick={handleEdit}
                padding="0.75rem 1.5rem"
                backgroundColor="#3182ce"
                color="white"
                border="none"
                borderRadius="0.375rem"
                fontSize="1rem"
                cursor="pointer"
                whileHover={{ backgroundColor: '#2c5aa0' }}
              >
                Edit Property
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box maxWidth="1200px" margin="0 auto" padding="2rem 1rem">
        <Box display="grid" gridTemplateColumnsSm="1fr" gridTemplateColumnsLg="2fr 1fr" gap="2rem">
          
          {/* Left Column - Photos and Description */}
          <Box>
            {/* Photo Gallery */}
            <Box marginBottom="2rem">
              <Box position="relative" borderRadius="0.75rem" overflow="hidden" backgroundColor="white">
                {property.photos && property.photos.length > 0 ? (
                  <>
                    <Box
                      as="img"
                      src={resolvePhotoUrl(property.photos[currentImageIndex]?.url || '')}
                      alt={property.photos[currentImageIndex]?.altText || property.name}
                      width="100%"
                      height="400px"
                      objectFit="cover"
                    />
                    
                    {property.photos.length > 1 && (
                      <>
                        <Box
                          as="button"
                          onClick={prevImage}
                          position="absolute"
                          left="1rem"
                          top="50%"
                          transform="translateY(-50%)"
                          width="3rem"
                          height="3rem"
                          backgroundColor="rgba(255, 255, 255, 0.9)"
                          border="none"
                          borderRadius="50%"
                          cursor="pointer"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontSize="1.25rem"
                          color="#374151"
                          whileHover={{ backgroundColor: 'white' }}
                        >
                          ←
                        </Box>
                        <Box
                          as="button"
                          onClick={nextImage}
                          position="absolute"
                          right="1rem"
                          top="50%"
                          transform="translateY(-50%)"
                          width="3rem"
                          height="3rem"
                          backgroundColor="rgba(255, 255, 255, 0.9)"
                          border="none"
                          borderRadius="50%"
                          cursor="pointer"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontSize="1.25rem"
                          color="#374151"
                          whileHover={{ backgroundColor: 'white' }}
                        >
                          →
                        </Box>
                        
                        {/* Image Counter */}
                        <Box
                          position="absolute"
                          bottom="1rem"
                          right="1rem"
                          backgroundColor="rgba(0, 0, 0, 0.7)"
                          color="white"
                          padding="0.25rem 0.75rem"
                          borderRadius="1rem"
                          fontSize="0.875rem"
                        >
                          {currentImageIndex + 1} / {property.photos.length}
                        </Box>
                      </>
                    )}
                  </>
                ) : (
                  <Box
                    width="100%"
                    height="400px"
                    backgroundColor="#f3f4f6"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexDirection="column"
                    fontSize="4rem"
                    color="#d1d5db"
                  >
                    🏠
                    <Box fontSize="1rem" marginTop="1rem">
                      No photos available
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Thumbnail Strip */}
              {property.photos && property.photos.length > 1 && (
                <Box display="flex" gap="0.5rem" marginTop="1rem" overflowX="auto" padding="0.5rem 0">
                  {property.photos.map((photo, index) => (
                    <Box
                      key={photo.id || index}
                      as="button"
                      onClick={() => setCurrentImageIndex(index)}
                      border={currentImageIndex === index ? "2px solid #3182ce" : "1px solid #e2e8f0"}
                      borderRadius="0.375rem"
                      overflow="hidden"
                      cursor="pointer"
                      flexShrink={0}
                    >
                      <Box
                        as="img"
                        src={resolvePhotoUrl(photo.url)}
                        alt={photo.altText}
                        width="80px"
                        height="60px"
                        objectFit="cover"
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {/* Description Section */}
            <Box backgroundColor="white" borderRadius="0.75rem" padding="2rem" marginBottom="2rem">
              <Box fontSize="1.25rem" fontWeight="600" color="#1a202c" marginBottom="1rem">
                About this property
              </Box>
              <Box fontSize="1rem" color="#4b5563" lineHeight="1.6" marginBottom="1.5rem">
                {property.aboutTheProperty || 'No description available.'}
              </Box>
              
              {property.aboutTheNeighborhood && (
                <>
                  <Box fontSize="1.125rem" fontWeight="600" color="#1a202c" marginBottom="0.75rem">
                    About the neighborhood
                  </Box>
                  <Box fontSize="1rem" color="#4b5563" lineHeight="1.6">
                    {property.aboutTheNeighborhood}
                  </Box>
                </>
              )}
            </Box>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <Box backgroundColor="white" borderRadius="0.75rem" padding="2rem" marginBottom="2rem">
                <Box display="flex" alignItems="center" gap="0.5rem" fontSize="1.25rem" fontWeight="600" color="#1a202c" marginBottom="1rem">
                  <FaStar color="#3182ce" />
                  Amenities
                </Box>
                <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap="0.75rem">
                  {property.amenities.map((amenity) => (
                    <Box
                      key={amenity.id}
                      display="flex"
                      alignItems="center"
                      gap="0.75rem"
                      padding="0.75rem"
                      backgroundColor="#f9fafb"
                      borderRadius="0.375rem"
                    >
                      <FaCheckCircle color="#10b981" size="1rem" />
                      <Box fontSize="0.875rem" color="#374151">
                        {amenity.name}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* House Rules */}
            <Box backgroundColor="white" borderRadius="0.75rem" padding="2rem">
              <Box display="flex" alignItems="center" gap="0.5rem" fontSize="1.25rem" fontWeight="600" color="#1a202c" marginBottom="1rem">
                <FaHome color="#3182ce" />
                House Rules
              </Box>
              <Box display="flex" flexDirection="column" gap="0.75rem">
                <Box display="flex" alignItems="center" gap="0.75rem">
                  {property.smokingAllowed ? (
                    <FaSmoking color="#f59e0b" size="1rem" />
                  ) : (
                    <FaSmokingBan color="#ef4444" size="1rem" />
                  )}
                  <Box fontSize="0.875rem" color="#374151">
                    Smoking {property.smokingAllowed ? 'allowed' : 'not allowed'}
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap="0.75rem">
                  {property.partiesOrEventsAllowed ? (
                    <FaGlassCheers color="#10b981" size="1rem" />
                  ) : (
                    <FaBan color="#ef4444" size="1rem" />
                  )}
                  <Box fontSize="0.875rem" color="#374151">
                    Parties or events {property.partiesOrEventsAllowed ? 'allowed' : 'not allowed'}
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap="0.75rem">
                  {property.petsAllowed === 'Yes' ? (
                    <FaPaw color="#10b981" size="1rem" />
                  ) : property.petsAllowed === 'No' ? (
                    <FaBan color="#ef4444" size="1rem" />
                  ) : (
                    <FaQuestionCircle color="#f59e0b" size="1rem" />
                  )}
                  <Box fontSize="0.875rem" color="#374151">
                    Pets: {property.petsAllowed === 'Yes' ? 'Allowed' : property.petsAllowed === 'No' ? 'Not allowed' : 'Upon request'}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Right Column - Property Details and Pricing */}
          <Box>
            {/* Property Overview */}
            <Box backgroundColor="white" borderRadius="0.75rem" padding="2rem" marginBottom="1.5rem">
              <Box fontSize="1.25rem" fontWeight="600" color="#1a202c" marginBottom="1rem">
                Property Overview
              </Box>
              
              <Box display="flex" flexDirection="column" gap="1rem">
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap="0.5rem" color="#6b7280">
                    <FaUserFriends color="#3182ce" />
                    Guests
                  </Box>
                  <Box fontWeight="500">{property.maximumGuest}</Box>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap="0.5rem" color="#6b7280">
                    <FaBath color="#3182ce" />
                    Bathrooms
                  </Box>
                  <Box fontWeight="500">{property.bathrooms}</Box>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap="0.5rem" color="#6b7280">
                    <FaRulerCombined color="#3182ce" />
                    Property Size
                  </Box>
                  <Box fontWeight="500">{property.propertySizeSqMtr} sqm</Box>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap="0.5rem" color="#6b7280">
                    <FaCalendarAlt color="#3182ce" />
                    Booking Type
                  </Box>
                  <Box fontWeight="500">{property.bookingType}</Box>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap="0.5rem" color="#6b7280">
                    <FaCreditCard color="#3182ce" />
                    Payment
                  </Box>
                  <Box fontWeight="500">{property.paymentType}</Box>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap="0.5rem" color="#6b7280">
                    <FaChild color="#3182ce" />
                    Children
                  </Box>
                  <Box fontWeight="500">{property.allowChildren ? 'Allowed' : 'Not allowed'}</Box>
                </Box>
                {property.offerCribs && (
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap="0.5rem" color="#6b7280">
                      <FaBaby color="#3182ce" />
                      Cribs
                    </Box>
                    <Box fontWeight="500">Available</Box>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Pricing */}
            {property.pricing && (
              <Box backgroundColor="white" borderRadius="0.75rem" padding="2rem" marginBottom="1.5rem">
                <Box display="flex" alignItems="center" gap="0.5rem" fontSize="1.25rem" fontWeight="600" color="#1a202c" marginBottom="1rem">
                  <FaDollarSign color="#3182ce" />
                  Pricing
                </Box>
                
                <Box display="flex" flexDirection="column" gap="1rem">
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap="0.5rem" color="#6b7280">
                      <FaDollarSign color="#10b981" size="0.875rem" />
                      Rate per night
                    </Box>
                    <Box fontSize="1.125rem" fontWeight="600" color="#059669">
                      {property.pricing.currency} {property.pricing.ratePerNight}
                    </Box>
                  </Box>
                  
                  {property.pricing.ratePerNightWeekend && (
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center" gap="0.5rem" color="#6b7280">
                        <FaDollarSign color="#f59e0b" size="0.875rem" />
                        Weekend rate
                      </Box>
                      <Box fontSize="1.125rem" fontWeight="600" color="#059669">
                        {property.pricing.currency} {property.pricing.ratePerNightWeekend}
                      </Box>
                    </Box>
                  )}

                  {property.pricing.discountPercentageForWeeklyRatePlan && (
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center" gap="0.5rem" color="#6b7280">
                        <FaTag color="#dc2626" size="0.875rem" />
                        Weekly discount
                      </Box>
                      <Box fontSize="0.875rem" fontWeight="500" color="#dc2626">
                        -{property.pricing.discountPercentageForWeeklyRatePlan}%
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {/* Services */}
            <Box backgroundColor="white" borderRadius="0.75rem" padding="2rem" marginBottom="1.5rem">
              <Box display="flex" alignItems="center" gap="0.5rem" fontSize="1.25rem" fontWeight="600" color="#1a202c" marginBottom="1rem">
                <FaConciergeBell color="#3182ce" />
                Services
              </Box>
              
              <Box display="flex" flexDirection="column" gap="0.75rem">
                <Box display="flex" alignItems="center" gap="0.75rem">
                  {property.serveBreakfast ? (
                    <FaCheckCircle color="#10b981" size="1rem" />
                  ) : (
                    <FaTimesCircle color="#ef4444" size="1rem" />
                  )}
                  <FaUtensils color="#3182ce" size="0.875rem" />
                  <Box fontSize="0.875rem" color="#374151">
                    Breakfast {property.serveBreakfast ? 'included' : 'not included'}
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap="0.75rem">
                  {property.parking === 'YesFree' ? (
                    <FaCheckCircle color="#10b981" size="1rem" />
                  ) : property.parking === 'YesPaid' ? (
                    <FaCheckCircle color="#f59e0b" size="1rem" />
                  ) : (
                    <FaTimesCircle color="#ef4444" size="1rem" />
                  )}
                  <FaCar color="#3182ce" size="0.875rem" />
                  <Box fontSize="0.875rem" color="#374151">
                    Parking: {property.parking === 'YesFree' ? 'Free' : property.parking === 'YesPaid' ? 'Paid' : 'Not available'}
                  </Box>
                </Box>
                {property.languages && property.languages.length > 0 && (
                  <Box display="flex" alignItems="center" gap="0.75rem">
                    <FaCheckCircle color="#10b981" size="1rem" />
                    <FaGlobe color="#3182ce" size="0.875rem" />
                    <Box fontSize="0.875rem" color="#374151">
                      Languages: {property.languages.join(', ')}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Address */}
            <Box backgroundColor="white" borderRadius="0.75rem" padding="2rem">
              <Box display="flex" alignItems="center" gap="0.5rem" fontSize="1.25rem" fontWeight="600" color="#1a202c" marginBottom="1rem">
                <FaMapMarkerAlt color="#3182ce" />
                Location
              </Box>
              
              <Box display="flex" flexDirection="column" gap="0.5rem">
                <Box fontSize="0.875rem" color="#374151">
                  {property.address.apartmentOrFloorNumber && (
                    <Box>{property.address.apartmentOrFloorNumber}</Box>
                  )}
                  <Box>{property.address.city}</Box>
                  <Box>{property.address.countryOrRegion}</Box>
                  {property.address.zipCode && (
                    <Box>ZIP: {property.address.zipCode}</Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default PropertyDetailsPage