import React from 'react'
import { WizardFormData } from '../../../types/property'
import { Box } from '../../Box'
import { BookingTypeLabels, PaymentTypeLabels } from '../../../constants/propertyEnums'

interface MobileReviewStepProps {
  data: WizardFormData
  onChange: (updates: Partial<WizardFormData>) => void
  onNext: () => void
  onPrevious: () => void
  onSubmit: () => void
  loading: boolean
  isFirstStep: boolean
  isLastStep: boolean
}

const MobileReviewStep: React.FC<MobileReviewStepProps> = ({
  data,
  onPrevious,
  onSubmit,
  loading,
  isFirstStep
}) => {
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Not set'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatPrice = (amount: number | undefined, currency: string = 'AED') => {
    if (!amount) return `${currency} 0`
    return `${currency} ${amount.toLocaleString()}`
  }

  const getTotalAmenities = () => (data.amenities || []).length
  const getTotalServices = () => (data.services || []).length

  return (
    <Box padding="20px" minHeight="100vh" backgroundColor="#f8fafc">
      {/* Header */}
      <Box marginBottom="32px" textAlign="center">
        <Box fontSize="28px" fontWeight="700" color="#1a202c" marginBottom="8px">
          Review & Submit
        </Box>
        <Box fontSize="16px" color="#718096" lineHeight="1.5">
          Please review your property details before submitting
        </Box>
      </Box>

      {/* Review Content */}
      <Box display="flex" flexDirection="column" gap="24px">
        {/* Basic Information */}
        <Box backgroundColor="#ffffff" borderRadius="16px" padding="20px" border="1px solid #e2e8f0">
          <Box fontSize="20px" fontWeight="700" color="#1a202c" marginBottom="16px" display="flex" alignItems="center" gap="8px">
            🏠 Basic Information
          </Box>
          <Box display="flex" flexDirection="column" gap="12px" fontSize="16px" lineHeight="1.5">
            <Box display="flex" justifyContent="space-between">
              <Box color="#4a5568" fontWeight="600">Property Name:</Box>
              <Box color="#1a202c" textAlign="right" flex="1" marginLeft="16px">{data.name || 'Not set'}</Box>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Box color="#4a5568" fontWeight="600">Booking Type:</Box>
              <Box color="#1a202c" textAlign="right" flex="1" marginLeft="16px">
                {data.bookingType ? BookingTypeLabels[data.bookingType] : 'Not set'}
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Box color="#4a5568" fontWeight="600">Payment:</Box>
              <Box color="#1a202c" textAlign="right" flex="1" marginLeft="16px">
                {data.paymentType ? PaymentTypeLabels[data.paymentType] : 'Not set'}
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Box color="#4a5568" fontWeight="600">Available From:</Box>
              <Box color="#1a202c" textAlign="right" flex="1" marginLeft="16px">
                {formatDate(data.firstDateGuestCanCheckIn)}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Property Layout */}
        <Box backgroundColor="#ffffff" borderRadius="16px" padding="20px" border="1px solid #e2e8f0">
          <Box fontSize="20px" fontWeight="700" color="#1a202c" marginBottom="16px" display="flex" alignItems="center" gap="8px">
            🛏️ Property Layout
          </Box>
          <Box display="flex" flexDirection="column" gap="12px" fontSize="16px" lineHeight="1.5">
            <Box display="flex" justifyContent="space-between">
              <Box color="#4a5568" fontWeight="600">Max Guests:</Box>
              <Box color="#1a202c">{data.maximumGuest || 0} guests</Box>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Box color="#4a5568" fontWeight="600">Bathrooms:</Box>
              <Box color="#1a202c">{data.bathrooms || 0} bathrooms</Box>
            </Box>
            {data.propertySizeSqMtr && (
              <Box display="flex" justifyContent="space-between">
                <Box color="#4a5568" fontWeight="600">Size:</Box>
                <Box color="#1a202c">{data.propertySizeSqMtr} sq m</Box>
              </Box>
            )}
            <Box display="flex" justifyContent="space-between">
              <Box color="#4a5568" fontWeight="600">Children Allowed:</Box>
              <Box color="#1a202c">{data.allowChildren ? 'Yes' : 'No'}</Box>
            </Box>
            {data.allowChildren && (
              <Box display="flex" justifyContent="space-between">
                <Box color="#4a5568" fontWeight="600">Cribs Available:</Box>
                <Box color="#1a202c">{data.offerCribs ? 'Yes' : 'No'}</Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* Location */}
        <Box backgroundColor="#ffffff" borderRadius="16px" padding="20px" border="1px solid #e2e8f0">
          <Box fontSize="20px" fontWeight="700" color="#1a202c" marginBottom="16px" display="flex" alignItems="center" gap="8px">
            📍 Location
          </Box>
          <Box display="flex" flexDirection="column" gap="12px" fontSize="16px" lineHeight="1.5">
            <Box display="flex" justifyContent="space-between">
              <Box color="#4a5568" fontWeight="600">Country:</Box>
              <Box color="#1a202c" textAlign="right" flex="1" marginLeft="16px">{data.country || 'Not set'}</Box>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Box color="#4a5568" fontWeight="600">Emirate:</Box>
              <Box color="#1a202c" textAlign="right" flex="1" marginLeft="16px">{data.state || 'Not set'}</Box>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Box color="#4a5568" fontWeight="600">City:</Box>
              <Box color="#1a202c" textAlign="right" flex="1" marginLeft="16px">{data.city || 'Not set'}</Box>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Box color="#4a5568" fontWeight="600">Address:</Box>
              <Box color="#1a202c" textAlign="right" flex="1" marginLeft="16px">{data.streetAddress || 'Not set'}</Box>
            </Box>
          </Box>
        </Box>

        {/* Amenities & Services */}
        <Box backgroundColor="#ffffff" borderRadius="16px" padding="20px" border="1px solid #e2e8f0">
          <Box fontSize="20px" fontWeight="700" color="#1a202c" marginBottom="16px" display="flex" alignItems="center" gap="8px">
            ✨ Amenities & Services
          </Box>
          <Box display="flex" flexDirection="column" gap="12px" fontSize="16px" lineHeight="1.5">
            <Box display="flex" justifyContent="space-between">
              <Box color="#4a5568" fontWeight="600">Amenities:</Box>
              <Box color="#1a202c">{getTotalAmenities()} selected</Box>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Box color="#4a5568" fontWeight="600">Services:</Box>
              <Box color="#1a202c">{getTotalServices()} selected</Box>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Box color="#4a5568" fontWeight="600">Pet-Friendly:</Box>
              <Box color="#1a202c">{data.allowPets ? 'Yes' : 'No'}</Box>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Box color="#4a5568" fontWeight="600">Smoking Allowed:</Box>
              <Box color="#1a202c">{data.allowSmoking ? 'Yes' : 'No'}</Box>
            </Box>
          </Box>
        </Box>

        {/* House Rules */}
        <Box backgroundColor="#ffffff" borderRadius="16px" padding="20px" border="1px solid #e2e8f0">
          <Box fontSize="20px" fontWeight="700" color="#1a202c" marginBottom="16px" display="flex" alignItems="center" gap="8px">
            📋 House Rules
          </Box>
          <Box display="flex" flexDirection="column" gap="12px" fontSize="16px" lineHeight="1.5">
            <Box display="flex" justifyContent="space-between">
              <Box color="#4a5568" fontWeight="600">Check-in:</Box>
              <Box color="#1a202c">{data.checkInTime || 'Not set'}</Box>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Box color="#4a5568" fontWeight="600">Check-out:</Box>
              <Box color="#1a202c">{data.checkOutTime || 'Not set'}</Box>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Box color="#4a5568" fontWeight="600">Min Stay:</Box>
              <Box color="#1a202c">{data.minimumNights || 1} nights</Box>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Box color="#4a5568" fontWeight="600">Quiet Hours:</Box>
              <Box color="#1a202c">{data.quietHours || 'Not set'}</Box>
            </Box>
          </Box>
        </Box>

        {/* Pricing */}
        <Box backgroundColor="#ffffff" borderRadius="16px" padding="20px" border="1px solid #e2e8f0">
          <Box fontSize="20px" fontWeight="700" color="#1a202c" marginBottom="16px" display="flex" alignItems="center" gap="8px">
            💰 Pricing
          </Box>
          <Box display="flex" flexDirection="column" gap="12px" fontSize="16px" lineHeight="1.5">
            <Box display="flex" justifyContent="space-between">
              <Box color="#4a5568" fontWeight="600">Base Price:</Box>
              <Box color="#1a202c" fontSize="18px" fontWeight="700">
                {formatPrice(data.pricePerNight, data.currency)}/night
              </Box>
            </Box>
            {data.cleaningFee && (
              <Box display="flex" justifyContent="space-between">
                <Box color="#4a5568" fontWeight="600">Cleaning Fee:</Box>
                <Box color="#1a202c">
                  {formatPrice(data.cleaningFee, data.currency)}/{data.cleaningFeeType === 'per_stay' ? 'stay' : 'night'}
                </Box>
              </Box>
            )}
            {data.securityDepositAmount && (
              <Box display="flex" justifyContent="space-between">
                <Box color="#4a5568" fontWeight="600">Security Deposit:</Box>
                <Box color="#1a202c">
                  {formatPrice(data.securityDepositAmount, data.currency)}
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* Final Submit Note */}
        <Box 
          backgroundColor="#f0fff4"
          border="2px solid #38a169"
          borderRadius="12px"
          padding="20px"
          marginBottom="40px"
        >
          <Box fontSize="16px" fontWeight="600" color="#2f855a" marginBottom="8px">
            🎉 Ready to Submit!
          </Box>
          <Box fontSize="14px" color="#2f855a" lineHeight="1.5">
            Your property listing looks great! Once submitted, you can always edit these details later from your dashboard.
          </Box>
        </Box>
      </Box>

      {/* Navigation - Fixed at bottom */}
      <Box
        position="fixed"
        bottom="0"
        left="0"
        right="0"
        backgroundColor="#ffffff"
        borderTop="1px solid #e2e8f0"
        padding="20px"
        zIndex="10"
        style={{ 
          boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
          WebkitBackdropFilter: 'blur(8px)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" gap="16px">
          <Box flex="1">
            {!isFirstStep && (
              <Box
                as="button"
                onClick={onPrevious}
                minHeight="56px"
                padding="0 24px"
                backgroundColor="#f7fafc"
                color="#4a5568"
                border="2px solid #e2e8f0"
                borderRadius="12px"
                fontSize="16px"
                fontWeight="600"
                cursor="pointer"
                width="100%"
                style={{
                  transition: 'all 0.2s ease',
                  WebkitTapHighlightColor: 'transparent',
                }}
                whileHover={{ backgroundColor: '#edf2f7', borderColor: '#cbd5e0' }}
                whileTap={{ transform: 'scale(0.98)' }}
              >
                Previous
              </Box>
            )}
          </Box>

          <Box flex="2">
            <Box
              as="button"
              onClick={onSubmit}
              disabled={loading}
              minHeight="56px"
              padding="0 32px"
              backgroundColor="#38a169"
              color="white"
              border="none"
              borderRadius="12px"
              fontSize="18px"
              fontWeight="700"
              cursor="pointer"
              width="100%"
              style={{
                transition: 'all 0.2s ease',
                WebkitTapHighlightColor: 'transparent',
              }}
              whileHover={{ backgroundColor: '#2f855a' }}
              whileTap={{ transform: 'scale(0.98)' }}
            >
              {loading ? 'Creating Property...' : '🎉 Create Property'}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Bottom spacing to account for fixed navigation */}
      <Box height="100px" />
    </Box>
  )
}

export default MobileReviewStep