import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAppDispatch, useAppSelector } from '../../../store'
import { fetchPropertyById, updateProperty, clearError } from '../../../store/slices/propertySlice'
import { Box } from '../../../components/Box'
import { Property } from '../../../types/property'
import { 
  BookingType, 
  PaymentType, 
  ParkingType, 
  PetPolicy, 
  Currency,
  BookingTypeLabels,
  PaymentTypeLabels,
  ParkingTypeLabels,
  PetPolicyLabels,
  CurrencyLabels
} from '../../../constants/propertyEnums'

export const Route = createFileRoute('/property/$propertyId/edit')({
  component: PropertyEditPage,
})

function PropertyEditPage() {
  const { propertyId } = Route.useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { currentProperty, loading, error } = useAppSelector((state) => state.property)
  const { user } = useAppSelector((state) => state.auth)

  const [formData, setFormData] = useState<Partial<Property> | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)

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
    if (currentProperty) {
      setFormData(currentProperty)
    }
  }, [currentProperty])

  useEffect(() => {
    if (error) {
      dispatch(clearError())
    }
  }, [])

  const handleSave = async () => {
    if (!formData || !propertyId) return

    try {
      setSaveLoading(true)
      await dispatch(updateProperty({ propertyId, data: formData })).unwrap()
      setHasChanges(false)
      navigate({ to: `/property/${propertyId}` })
    } catch (error) {
      console.error('Failed to update property:', error)
    } finally {
      setSaveLoading(false)
    }
  }

  const handleCancel = () => {
    if (hasChanges && confirm('You have unsaved changes. Are you sure you want to leave?')) {
      navigate({ to: `/property/${propertyId}` })
    } else if (!hasChanges) {
      navigate({ to: `/property/${propertyId}` })
    }
  }

  const updateFormData = (updates: Partial<Property>) => {
    setFormData(prev => prev ? { ...prev, ...updates } : null)
    setHasChanges(true)
  }

  const updateNestedField = (path: string, value: any) => {
    setFormData(prev => {
      if (!prev) return null
      
      const keys = path.split('.')
      const newData = { ...prev }
      let current: any = newData
      
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i]
        current[key] = { ...current[key] }
        current = current[key]
      }
      
      current[keys[keys.length - 1]] = value
      return newData
    })
    setHasChanges(true)
  }

  if (!user) {
    return null
  }

  if (loading && !formData) {
    return (
      <Box minHeight="100vh" backgroundColor="#f8fafc">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <Box textAlign="center">
            <Box fontSize="1.125rem" color="#718096">
              Loading property for editing...
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
              onClick={() => navigate({ to: '/dashboard/my-properties' })}
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

  if (!formData) {
    return (
      <Box minHeight="100vh" backgroundColor="#f8fafc">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <Box textAlign="center">
            <Box fontSize="1.5rem" fontWeight="600" color="#374151" marginBottom="1rem">
              Property Not Found
            </Box>
            <Box fontSize="1rem" color="#718096" marginBottom="2rem">
              The property you're trying to edit doesn't exist or you don't have permission to edit it.
            </Box>
            <Box
              as="button"
              onClick={() => navigate({ to: '/dashboard/my-properties' })}
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
                onClick={handleCancel}
                padding="0.5rem 1rem"
                backgroundColor="transparent"
                color="#718096"
                border="1px solid #e2e8f0"
                borderRadius="0.375rem"
                cursor="pointer"
              >
                ← Cancel
              </Box>
              <Box>
                <Box fontSize="1.5rem" fontWeight="600" color="#1a202c">
                  Edit {formData.name}
                </Box>
                <Box fontSize="0.875rem" color="#718096">
                  {formData.address?.city}, {formData.address?.countryOrRegion}
                </Box>
              </Box>
            </Box>
            <Box display="flex" gap="0.75rem">
              <Box
                as="button"
                onClick={() => navigate({ to: `/property/${propertyId}` })}
                padding="0.75rem 1.5rem"
                backgroundColor="transparent"
                color="#6b7280"
                border="1px solid #d1d5db"
                borderRadius="0.375rem"
                cursor="pointer"
              >
                View Property
              </Box>
              <Box
                as="button"
                onClick={handleSave}
                disabled={!hasChanges || saveLoading}
                padding="0.75rem 1.5rem"
                backgroundColor={hasChanges && !saveLoading ? "#3182ce" : "#9ca3af"}
                color="white"
                border="none"
                borderRadius="0.375rem"
                fontSize="1rem"
                cursor={hasChanges && !saveLoading ? "pointer" : "not-allowed"}
              >
                {saveLoading ? 'Saving...' : 'Save Changes'}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box maxWidth="1200px" margin="0 auto" padding="2rem 1rem">
        <Box display="grid" gridTemplateColumns={{ Sm: '1fr', Lg: '2fr 1fr' }} gap="2rem">
          
          {/* Left Column - Main Details */}
          <Box>
            {/* Basic Information */}
            <Box backgroundColor="white" borderRadius="0.75rem" padding="2rem" marginBottom="2rem">
              <Box fontSize="1.25rem" fontWeight="600" color="#1a202c" marginBottom="1.5rem">
                Basic Information
              </Box>
              
              <Box display="flex" flexDirection="column" gap="1.5rem">
                <Box>
                  <Box fontSize="0.875rem" fontWeight="500" color="#374151" marginBottom="0.5rem">
                    Property Name
                  </Box>
                  <Box
                    as="input"
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => updateFormData({ name: e.target.value })}
                    width="100%"
                    padding="0.75rem"
                    border="1px solid #d1d5db"
                    borderRadius="0.375rem"
                    fontSize="1rem"
                  />
                </Box>

                <Box>
                  <Box fontSize="0.875rem" fontWeight="500" color="#374151" marginBottom="0.5rem">
                    Property Size (sqm)
                  </Box>
                  <Box
                    as="input"
                    type="number"
                    value={formData.propertySizeSqMtr || ''}
                    onChange={(e) => updateFormData({ propertySizeSqMtr: parseInt(e.target.value, 10) })}
                    width="100%"
                    padding="0.75rem"
                    border="1px solid #d1d5db"
                    borderRadius="0.375rem"
                    fontSize="1rem"
                  />
                </Box>
              </Box>
            </Box>

            {/* Address */}
            <Box backgroundColor="white" borderRadius="0.75rem" padding="2rem" marginBottom="2rem">
              <Box fontSize="1.25rem" fontWeight="600" color="#1a202c" marginBottom="1.5rem">
                Address
              </Box>
              
              <Box display="flex" flexDirection="column" gap="1.5rem">
                <Box>
                  <Box fontSize="0.875rem" fontWeight="500" color="#374151" marginBottom="0.5rem">
                    City
                  </Box>
                  <Box
                    as="input"
                    type="text"
                    value={formData.address?.city || ''}
                    onChange={(e) => updateNestedField('address.city', e.target.value)}
                    width="100%"
                    padding="0.75rem"
                    border="1px solid #d1d5db"
                    borderRadius="0.375rem"
                    fontSize="1rem"
                  />
                </Box>

                <Box>
                  <Box fontSize="0.875rem" fontWeight="500" color="#374151" marginBottom="0.5rem">
                    Country/Region
                  </Box>
                  <Box
                    as="input"
                    type="text"
                    value={formData.address?.countryOrRegion || ''}
                    onChange={(e) => updateNestedField('address.countryOrRegion', e.target.value)}
                    width="100%"
                    padding="0.75rem"
                    border="1px solid #d1d5db"
                    borderRadius="0.375rem"
                    fontSize="1rem"
                  />
                </Box>

                <Box>
                  <Box fontSize="0.875rem" fontWeight="500" color="#374151" marginBottom="0.5rem">
                    ZIP Code
                  </Box>
                  <Box
                    as="input"
                    type="number"
                    value={formData.address?.zipCode || ''}
                    onChange={(e) => updateNestedField('address.zipCode', parseInt(e.target.value, 10) || 0)}
                    width="100%"
                    padding="0.75rem"
                    border="1px solid #d1d5db"
                    borderRadius="0.375rem"
                    fontSize="1rem"
                  />
                </Box>

                {formData.address?.apartmentOrFloorNumber !== undefined && (
                  <Box>
                    <Box fontSize="0.875rem" fontWeight="500" color="#374151" marginBottom="0.5rem">
                      Apartment/Floor Number
                    </Box>
                    <Box
                      as="input"
                      type="text"
                      value={formData.address?.apartmentOrFloorNumber || ''}
                      onChange={(e) => updateNestedField('address.apartmentOrFloorNumber', e.target.value)}
                      width="100%"
                      padding="0.75rem"
                      border="1px solid #d1d5db"
                      borderRadius="0.375rem"
                      fontSize="1rem"
                    />
                  </Box>
                )}
              </Box>
            </Box>

            {/* Description */}
            <Box backgroundColor="white" borderRadius="0.75rem" padding="2rem" marginBottom="2rem">
              <Box fontSize="1.25rem" fontWeight="600" color="#1a202c" marginBottom="1.5rem">
                Description
              </Box>
              
              <Box display="flex" flexDirection="column" gap="1.5rem">
                <Box>
                  <Box fontSize="0.875rem" fontWeight="500" color="#374151" marginBottom="0.5rem">
                    About the Property
                  </Box>
                  <Box
                    as="textarea"
                    value={formData.aboutTheProperty || ''}
                    onChange={(e) => updateFormData({ aboutTheProperty: e.target.value })}
                    width="100%"
                    minHeight="120px"
                    padding="0.75rem"
                    border="1px solid #d1d5db"
                    borderRadius="0.375rem"
                    fontSize="1rem"
                    resize="vertical"
                  />
                </Box>

                <Box>
                  <Box fontSize="0.875rem" fontWeight="500" color="#374151" marginBottom="0.5rem">
                    About the Neighborhood
                  </Box>
                  <Box
                    as="textarea"
                    value={formData.aboutTheNeighborhood || ''}
                    onChange={(e) => updateFormData({ aboutTheNeighborhood: e.target.value })}
                    width="100%"
                    minHeight="120px"
                    padding="0.75rem"
                    border="1px solid #d1d5db"
                    borderRadius="0.375rem"
                    fontSize="1rem"
                    resize="vertical"
                  />
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Right Column - Settings */}
          <Box>
            {/* Capacity & Layout */}
            <Box backgroundColor="white" borderRadius="0.75rem" padding="2rem" marginBottom="1.5rem">
              <Box fontSize="1.25rem" fontWeight="600" color="#1a202c" marginBottom="1.5rem">
                Capacity & Layout
              </Box>
              
              <Box display="flex" flexDirection="column" gap="1.5rem">
                <Box>
                  <Box fontSize="0.875rem" fontWeight="500" color="#374151" marginBottom="0.5rem">
                    Maximum Guests
                  </Box>
                  <Box
                    as="input"
                    type="number"
                    value={formData.maximumGuest || ''}
                    onChange={(e) => updateFormData({ maximumGuest: parseInt(e.target.value, 10) })}
                    width="100%"
                    padding="0.75rem"
                    border="1px solid #d1d5db"
                    borderRadius="0.375rem"
                    fontSize="1rem"
                    min="1"
                  />
                </Box>

                <Box>
                  <Box fontSize="0.875rem" fontWeight="500" color="#374151" marginBottom="0.5rem">
                    Bathrooms
                  </Box>
                  <Box
                    as="input"
                    type="number"
                    value={formData.bathrooms || ''}
                    onChange={(e) => updateFormData({ bathrooms: parseInt(e.target.value, 10) })}
                    width="100%"
                    padding="0.75rem"
                    border="1px solid #d1d5db"
                    borderRadius="0.375rem"
                    fontSize="1rem"
                    min="1"
                  />
                </Box>

                <Box display="flex" alignItems="center" gap="0.75rem">
                  <Box
                    as="input"
                    type="checkbox"
                    checked={formData.allowChildren || false}
                    onChange={(e) => updateFormData({ allowChildren: e.target.checked })}
                  />
                  <Box fontSize="0.875rem" color="#374151">
                    Allow children
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap="0.75rem">
                  <Box
                    as="input"
                    type="checkbox"
                    checked={formData.offerCribs || false}
                    onChange={(e) => updateFormData({ offerCribs: e.target.checked })}
                  />
                  <Box fontSize="0.875rem" color="#374151">
                    Offer cribs
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Pricing */}
            {formData.pricing && (
              <Box backgroundColor="white" borderRadius="0.75rem" padding="2rem" marginBottom="1.5rem">
                <Box fontSize="1.25rem" fontWeight="600" color="#1a202c" marginBottom="1.5rem">
                  Pricing
                </Box>
                
                <Box display="flex" flexDirection="column" gap="1.5rem">
                  <Box>
                    <Box fontSize="0.875rem" fontWeight="500" color="#374151" marginBottom="0.5rem">
                      Currency
                    </Box>
                    <Box
                      as="select"
                      value={formData.pricing.currency || Currency.AED}
                      onChange={(e) => updateNestedField('pricing.currency', e.target.value as Currency)}
                      width="100%"
                      padding="0.75rem"
                      border="1px solid #d1d5db"
                      borderRadius="0.375rem"
                      fontSize="1rem"
                    >
                      {Object.entries(CurrencyLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </Box>
                  </Box>

                  <Box>
                    <Box fontSize="0.875rem" fontWeight="500" color="#374151" marginBottom="0.5rem">
                      Rate per Night
                    </Box>
                    <Box
                      as="input"
                      type="number"
                      value={formData.pricing.ratePerNight || ''}
                      onChange={(e) => updateNestedField('pricing.ratePerNight', parseFloat(e.target.value))}
                      width="100%"
                      padding="0.75rem"
                      border="1px solid #d1d5db"
                      borderRadius="0.375rem"
                      fontSize="1rem"
                      min="0"
                      step="0.01"
                    />
                  </Box>

                  <Box>
                    <Box fontSize="0.875rem" fontWeight="500" color="#374151" marginBottom="0.5rem">
                      Weekend Rate (optional)
                    </Box>
                    <Box
                      as="input"
                      type="number"
                      value={formData.pricing.ratePerNightWeekend || ''}
                      onChange={(e) => updateNestedField('pricing.ratePerNightWeekend', parseFloat(e.target.value) || undefined)}
                      width="100%"
                      padding="0.75rem"
                      border="1px solid #d1d5db"
                      borderRadius="0.375rem"
                      fontSize="1rem"
                      min="0"
                      step="0.01"
                    />
                  </Box>
                </Box>
              </Box>
            )}

            {/* Booking & Payment */}
            <Box backgroundColor="white" borderRadius="0.75rem" padding="2rem" marginBottom="1.5rem">
              <Box fontSize="1.25rem" fontWeight="600" color="#1a202c" marginBottom="1.5rem">
                Booking & Payment
              </Box>
              
              <Box display="flex" flexDirection="column" gap="1.5rem">
                <Box>
                  <Box fontSize="0.875rem" fontWeight="500" color="#374151" marginBottom="0.5rem">
                    Booking Type
                  </Box>
                  <Box
                    as="select"
                    value={formData.bookingType || BookingType.NeedToRequestBook}
                    onChange={(e) => updateFormData({ bookingType: e.target.value as BookingType })}
                    width="100%"
                    padding="0.75rem"
                    border="1px solid #d1d5db"
                    borderRadius="0.375rem"
                    fontSize="1rem"
                  >
                    {Object.entries(BookingTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Box>
                </Box>

                <Box>
                  <Box fontSize="0.875rem" fontWeight="500" color="#374151" marginBottom="0.5rem">
                    Payment Type
                  </Box>
                  <Box
                    as="select"
                    value={formData.paymentType || PaymentType.Online}
                    onChange={(e) => updateFormData({ paymentType: e.target.value as PaymentType })}
                    width="100%"
                    padding="0.75rem"
                    border="1px solid #d1d5db"
                    borderRadius="0.375rem"
                    fontSize="1rem"
                  >
                    {Object.entries(PaymentTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Services & Rules */}
            <Box backgroundColor="white" borderRadius="0.75rem" padding="2rem">
              <Box fontSize="1.25rem" fontWeight="600" color="#1a202c" marginBottom="1.5rem">
                Services & Rules
              </Box>
              
              <Box display="flex" flexDirection="column" gap="1.5rem">
                <Box display="flex" alignItems="center" gap="0.75rem">
                  <Box
                    as="input"
                    type="checkbox"
                    checked={formData.serveBreakfast || false}
                    onChange={(e) => updateFormData({ serveBreakfast: e.target.checked })}
                  />
                  <Box fontSize="0.875rem" color="#374151">
                    Serve breakfast
                  </Box>
                </Box>

                <Box>
                  <Box fontSize="0.875rem" fontWeight="500" color="#374151" marginBottom="0.5rem">
                    Parking
                  </Box>
                  <Box
                    as="select"
                    value={formData.parking || ParkingType.No}
                    onChange={(e) => updateFormData({ parking: e.target.value as ParkingType })}
                    width="100%"
                    padding="0.75rem"
                    border="1px solid #d1d5db"
                    borderRadius="0.375rem"
                    fontSize="1rem"
                  >
                    {Object.entries(ParkingTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Box>
                </Box>

                <Box>
                  <Box fontSize="0.875rem" fontWeight="500" color="#374151" marginBottom="0.5rem">
                    Pet Policy
                  </Box>
                  <Box
                    as="select"
                    value={formData.petsAllowed || PetPolicy.No}
                    onChange={(e) => updateFormData({ petsAllowed: e.target.value as PetPolicy })}
                    width="100%"
                    padding="0.75rem"
                    border="1px solid #d1d5db"
                    borderRadius="0.375rem"
                    fontSize="1rem"
                  >
                    {Object.entries(PetPolicyLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap="0.75rem">
                  <Box
                    as="input"
                    type="checkbox"
                    checked={formData.smokingAllowed || false}
                    onChange={(e) => updateFormData({ smokingAllowed: e.target.checked })}
                  />
                  <Box fontSize="0.875rem" color="#374151">
                    Allow smoking
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap="0.75rem">
                  <Box
                    as="input"
                    type="checkbox"
                    checked={formData.partiesOrEventsAllowed || false}
                    onChange={(e) => updateFormData({ partiesOrEventsAllowed: e.target.checked })}
                  />
                  <Box fontSize="0.875rem" color="#374151">
                    Allow parties or events
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default PropertyEditPage