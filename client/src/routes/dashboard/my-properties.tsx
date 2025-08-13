import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../store'
import { fetchMyProperties, deleteProperty, clearError } from '../../store/slices/propertySlice'
import { Box } from '../../components/Box'

export const Route = createFileRoute('/dashboard/my-properties')({
  component: MyPropertiesPage,
})

function MyPropertiesPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { properties, loading, error } = useSelector((state: RootState) => state.property)
  const { user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    // Redirect if not authenticated
    if (!user) {
      navigate({ to: '/login' })
      return
    }

    // Fetch user's properties
    dispatch(fetchMyProperties())
  }, [user, dispatch, navigate])

  useEffect(() => {
    // Clear any errors when component mounts
    if (error) {
      dispatch(clearError())
    }
  }, [])

  const handleDeleteProperty = async (propertyId: string) => {
    if (confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      try {
        await dispatch(deleteProperty(propertyId)).unwrap()
      } catch (error) {
        console.error('Failed to delete property:', error)
      }
    }
  }

  const handleStartRegistration = () => {
    navigate({ to: '/register-property' })
  }

  if (!user) {
    return null
  }

  return (
    <Box minHeight="100vh" backgroundColor="#f8fafc">
      {/* Header */}
      <Box 
        backgroundColor="white" 
        borderBottom="1px solid #e2e8f0"
        padding="2rem 0"
      >
        <Box maxWidth="1200px" margin="0 auto" padding="0 1rem">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Box fontSize="2rem" fontWeight="600" color="#1a202c">
                My Properties
              </Box>
              <Box fontSize="1rem" color="#718096" marginTop="0.25rem">
                Manage your property listings
              </Box>
            </Box>
            <Box>
              <Box
                as="button"
                onClick={handleStartRegistration}
                padding="0.75rem 1.5rem"
                backgroundColor="#3182ce"
                color="white"
                border="none"
                borderRadius="0.375rem"
                fontSize="1rem"
                fontWeight="500"
                cursor="pointer"
                whileHover={{ backgroundColor: '#2c5aa0' }}
              >
                + Add New Property
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box maxWidth="1200px" margin="0 auto" padding="2rem 1rem">
        {error && (
          <Box
            backgroundColor="#fed7d7"
            color="#c53030"
            padding="1rem"
            borderRadius="0.375rem"
            marginBottom="2rem"
            border="1px solid #feb2b2"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>{error}</Box>
            <Box
              as="button"
              onClick={() => dispatch(clearError())}
              backgroundColor="transparent"
              border="none"
              color="#c53030"
              fontSize="1.25rem"
              cursor="pointer"
              padding="0 0.5rem"
            >
              ×
            </Box>
          </Box>
        )}

        {loading && properties.length === 0 ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
          >
            <Box textAlign="center">
              <Box fontSize="1.125rem" color="#718096">
                Loading your properties...
              </Box>
            </Box>
          </Box>
        ) : properties.length === 0 ? (
          // Empty State
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
            textAlign="center"
          >
            <Box
              width="120px"
              height="120px"
              backgroundColor="#f3f4f6"
              borderRadius="50%"
              display="flex"
              alignItems="center"
              justifyContent="center"
              marginBottom="2rem"
              fontSize="3rem"
              color="#9ca3af"
            >
              🏠
            </Box>
            <Box fontSize="1.5rem" fontWeight="600" color="#374151" marginBottom="1rem">
              No properties yet
            </Box>
            <Box fontSize="1rem" color="#6b7280" marginBottom="2rem" maxWidth="400px">
              Start earning by listing your first property. It only takes a few minutes to get started.
            </Box>
            <Box
              as="button"
              onClick={handleStartRegistration}
              padding="1rem 2rem"
              backgroundColor="#3182ce"
              color="white"
              border="none"
              borderRadius="0.5rem"
              fontSize="1.125rem"
              fontWeight="500"
              cursor="pointer"
              whileHover={{ backgroundColor: '#2c5aa0' }}
            >
              List Your First Property
            </Box>
          </Box>
        ) : (
          // Properties Grid
          <Box>
            <Box
              display="grid"
              gridTemplateColumns={{ 
                Sm: '1fr', 
                Md: '1fr 1fr', 
                Lg: '1fr 1fr 1fr' 
              }}
              gap="1.5rem"
            >
              {properties.map((property) => (
                <Box
                  key={property.propertyId}
                  backgroundColor="white"
                  borderRadius="0.5rem"
                  boxShadow="0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
                  overflow="hidden"
                  whileHover={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                >
                  {/* Property Image */}
                  <Box position="relative">
                    {property.photos && property.photos.length > 0 ? (
                      <Box
                        as="img"
                        src={property.photos[0].url}
                        alt={property.photos[0].altText || property.name}
                        width="100%"
                        height="200px"
                        objectFit="cover"
                      />
                    ) : (
                      <Box
                        width="100%"
                        height="200px"
                        backgroundColor="#f3f4f6"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="3rem"
                        color="#d1d5db"
                      >
                        🏠
                      </Box>
                    )}
                    
                    {/* Status Badge */}
                    <Box
                      position="absolute"
                      top="1rem"
                      left="1rem"
                      backgroundColor="rgba(16, 185, 129, 0.9)"
                      color="white"
                      padding="0.25rem 0.75rem"
                      borderRadius="1rem"
                      fontSize="0.75rem"
                      fontWeight="500"
                    >
                      Active
                    </Box>
                  </Box>

                  {/* Property Details */}
                  <Box padding="1.5rem">
                    <Box marginBottom="1rem">
                      <Box fontSize="1.125rem" fontWeight="600" color="#1a202c" marginBottom="0.25rem">
                        {property.name}
                      </Box>
                      <Box fontSize="0.875rem" color="#6b7280">
                        {property.address.city}, {property.address.countryOrRegion}
                      </Box>
                    </Box>

                    <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom="1rem">
                      <Box display="flex" alignItems="center" gap="1rem" fontSize="0.875rem" color="#6b7280">
                        <Box>👥 {property.maximumGuest} guests</Box>
                        <Box>🚿 {property.bathrooms} baths</Box>
                      </Box>
                      {property.pricing && (
                        <Box fontSize="1rem" fontWeight="600" color="#059669">
                          {property.pricing.currency} {property.pricing.ratePerNight}/night
                        </Box>
                      )}
                    </Box>

                    {/* Quick Stats */}
                    <Box 
                      display="flex" 
                      justifyContent="space-between" 
                      marginBottom="1.5rem"
                      padding="1rem"
                      backgroundColor="#f9fafb"
                      borderRadius="0.375rem"
                    >
                      <Box textAlign="center">
                        <Box fontSize="1.25rem" fontWeight="600" color="#1a202c">0</Box>
                        <Box fontSize="0.75rem" color="#6b7280">Bookings</Box>
                      </Box>
                      <Box textAlign="center">
                        <Box fontSize="1.25rem" fontWeight="600" color="#1a202c">
                          {property.amenities?.length || 0}
                        </Box>
                        <Box fontSize="0.75rem" color="#6b7280">Amenities</Box>
                      </Box>
                      <Box textAlign="center">
                        <Box fontSize="1.25rem" fontWeight="600" color="#1a202c">
                          {property.photos?.length || 0}
                        </Box>
                        <Box fontSize="0.75rem" color="#6b7280">Photos</Box>
                      </Box>
                    </Box>

                    {/* Action Buttons */}
                    <Box display="flex" gap="0.75rem">
                      <Box
                        as="button"
                        onClick={() => navigate({ to: `/property/${property.propertyId}` })}
                        flex="1"
                        padding="0.5rem"
                        backgroundColor="#3182ce"
                        color="white"
                        border="none"
                        borderRadius="0.375rem"
                        fontSize="0.875rem"
                        cursor="pointer"
                        whileHover={{ backgroundColor: '#2c5aa0' }}
                      >
                        View
                      </Box>
                      <Box
                        as="button"
                        onClick={() => navigate({ to: `/property/${property.propertyId}/edit` })}
                        flex="1"
                        padding="0.5rem"
                        backgroundColor="transparent"
                        color="#6b7280"
                        border="1px solid #d1d5db"
                        borderRadius="0.375rem"
                        fontSize="0.875rem"
                        cursor="pointer"
                        whileHover={{ borderColor: '#9ca3af', backgroundColor: '#f9fafb' }}
                      >
                        Edit
                      </Box>
                      <Box
                        as="button"
                        onClick={() => handleDeleteProperty(property.propertyId!)}
                        padding="0.5rem 0.75rem"
                        backgroundColor="transparent"
                        color="#dc2626"
                        border="1px solid #fca5a5"
                        borderRadius="0.375rem"
                        fontSize="0.875rem"
                        cursor="pointer"
                        whileHover={{ backgroundColor: '#fee2e2', borderColor: '#f87171' }}
                      >
                        Delete
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Load More (if needed in future) */}
            <Box display="flex" justifyContent="center" marginTop="3rem">
              <Box fontSize="0.875rem" color="#6b7280">
                Showing {properties.length} propert{properties.length === 1 ? 'y' : 'ies'}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default MyPropertiesPage