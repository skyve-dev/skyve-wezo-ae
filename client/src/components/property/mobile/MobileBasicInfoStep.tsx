import React from 'react'
import { WizardFormData } from '../../../types/property'
import { Box } from '../../Box'
import { MobileInput } from '../../forms/mobile/MobileInput'
import { MobileRadioGroup } from '../../forms/mobile/MobileRadioGroup'
import { BookingType, PaymentType, BookingTypeLabels, PaymentTypeLabels } from '../../../constants/propertyEnums'

interface MobileBasicInfoStepProps {
  data: WizardFormData
  onChange: (updates: Partial<WizardFormData>) => void
  onNext: () => void
  onPrevious: () => void
  onSubmit: () => void
  loading: boolean
  isFirstStep: boolean
  isLastStep: boolean
}

const MobileBasicInfoStep: React.FC<MobileBasicInfoStepProps> = ({
  data,
  onChange,
  onNext,
  loading,
  isFirstStep
}) => {
  const handleInputChange = (field: string, value: string) => {
    onChange({ [field]: value })
  }

  const handleBookingTypeChange = (value: string) => {
    onChange({ bookingType: value as BookingType })
  }

  const handlePaymentTypeChange = (value: string) => {
    onChange({ paymentType: value as PaymentType })
  }

  const isValid = data.name.trim().length >= 3 && data.firstDateGuestCanCheckIn

  const bookingOptions = [
    {
      value: BookingType.BookInstantly,
      label: BookingTypeLabels[BookingType.BookInstantly],
      description: "Guests can book immediately without waiting for approval",
      icon: "⚡"
    },
    {
      value: BookingType.NeedToRequestBook,
      label: BookingTypeLabels[BookingType.NeedToRequestBook],
      description: "You review and approve each booking request before confirmation",
      icon: "👤"
    }
  ]

  const paymentOptions = [
    {
      value: PaymentType.Online,
      label: PaymentTypeLabels[PaymentType.Online],
      description: "Collect the entire amount when guests book online",
      icon: "💳"
    },
    {
      value: PaymentType.ByCreditCardAtProperty,
      label: PaymentTypeLabels[PaymentType.ByCreditCardAtProperty],
      description: "Guests pay with credit card when they arrive at the property",
      icon: "🏠"
    }
  ]

  return (
    <Box padding="20px" minHeight="100vh" backgroundColor="#f8fafc">
      {/* Header */}
      <Box marginBottom="32px" textAlign="center">
        <Box fontSize="28px" fontWeight="700" color="#1a202c" marginBottom="8px">
          Tell us about your property
        </Box>
        <Box fontSize="16px" color="#718096" lineHeight="1.5">
          Let's start with the basics - what should guests call your place?
        </Box>
      </Box>

      {/* Form Content */}
      <Box display="flex" flexDirection="column" gap="8px">
        {/* Property Name */}
        <MobileInput
          label="Property Name"
          placeholder="e.g., Cozy Downtown Villa with Pool"
          value={data.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            handleInputChange('name', e.target.value)
          }
          required
        />
        
        <Box fontSize="14px" color="#6b7280" marginBottom="24px" paddingX="4px">
          Minimum 3 characters. This will be the first thing guests see.
        </Box>

        {/* Booking Type */}
        <MobileRadioGroup
          label="How do you want to handle bookings?"
          value={data.bookingType}
          options={bookingOptions}
          onChange={handleBookingTypeChange}
          required
        />

        {/* Payment Type */}
        <MobileRadioGroup
          label="Payment Collection"
          value={data.paymentType}
          options={paymentOptions}
          onChange={handlePaymentTypeChange}
          required
        />

        {/* First Available Date */}
        <Box marginBottom="24px">
          <Box 
            as="label"
            display="block"
            fontSize="18px"
            fontWeight="600"
            color="#1a202c"
            marginBottom="12px"
            lineHeight="1.4"
          >
            First Available Date for Guests
            <Box as="span" color="#e53e3e" marginLeft="4px" fontSize="18px">
              *
            </Box>
          </Box>
          <Box
            as="input"
            type="date"
            value={data.firstDateGuestCanCheckIn ? new Date(data.firstDateGuestCanCheckIn).toISOString().split('T')[0] : ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              onChange({ firstDateGuestCanCheckIn: new Date(e.target.value) })
            }
            min={new Date().toISOString().split('T')[0]}
            width="100%"
            minHeight="56px"
            padding="16px 20px"
            fontSize="18px"
            borderRadius="12px"
            border="2px solid #e2e8f0"
            backgroundColor="#ffffff"
            style={{
              outline: 'none',
              transition: 'all 0.2s ease',
              WebkitAppearance: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3182ce';
              e.target.style.boxShadow = '0 0 0 4px rgba(49, 130, 206, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.boxShadow = 'none';
            }}
          />
          <Box fontSize="14px" color="#6b7280" marginTop="8px" paddingX="4px">
            Select the earliest date guests can check in to your property
          </Box>
        </Box>

        {/* About the Property */}
        <Box marginBottom="24px">
          <Box 
            as="label"
            display="block"
            fontSize="18px"
            fontWeight="600"
            color="#1a202c"
            marginBottom="12px"
            lineHeight="1.4"
          >
            About Your Property (Optional)
          </Box>
          <Box
            as="textarea"
            value={data.aboutTheProperty || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
              handleInputChange('aboutTheProperty', e.target.value)
            }
            placeholder="Describe what makes your property special, unique features, recent renovations, etc."
            width="100%"
            minHeight="120px"
            padding="16px 20px"
            fontSize="16px"
            borderRadius="12px"
            border="2px solid #e2e8f0"
            backgroundColor="#ffffff"
            resize="vertical"
            style={{
              outline: 'none',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
              lineHeight: '1.5',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3182ce';
              e.target.style.boxShadow = '0 0 0 4px rgba(49, 130, 206, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.boxShadow = 'none';
            }}
          />
        </Box>

        {/* About the Neighborhood */}
        <Box marginBottom="40px">
          <Box 
            as="label"
            display="block"
            fontSize="18px"
            fontWeight="600"
            color="#1a202c"
            marginBottom="12px"
            lineHeight="1.4"
          >
            About the Neighborhood (Optional)
          </Box>
          <Box
            as="textarea"
            value={data.aboutTheNeighborhood || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
              handleInputChange('aboutTheNeighborhood', e.target.value)
            }
            placeholder="Tell guests about the area - nearby attractions, restaurants, transportation, etc."
            width="100%"
            minHeight="120px"
            padding="16px 20px"
            fontSize="16px"
            borderRadius="12px"
            border="2px solid #e2e8f0"
            backgroundColor="#ffffff"
            resize="vertical"
            style={{
              outline: 'none',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
              lineHeight: '1.5',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3182ce';
              e.target.style.boxShadow = '0 0 0 4px rgba(49, 130, 206, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.boxShadow = 'none';
            }}
          />
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
                onClick={() => {}}
                minHeight="56px"
                padding="0 24px"
                backgroundColor="#f7fafc"
                color="#4a5568"
                border="2px solid #e2e8f0"
                borderRadius="12px"
                fontSize="16px"
                fontWeight="600"
                cursor="not-allowed"
                opacity={0.5}
                width="100%"
                style={{ transition: 'all 0.2s ease' }}
              >
                Previous
              </Box>
            )}
          </Box>

          <Box flex="2">
            <Box
              as="button"
              onClick={onNext}
              disabled={!isValid || loading}
              minHeight="56px"
              padding="0 32px"
              backgroundColor={isValid ? '#3182ce' : '#a0aec0'}
              color="white"
              border="none"
              borderRadius="12px"
              fontSize="18px"
              fontWeight="700"
              cursor={isValid ? 'pointer' : 'not-allowed'}
              width="100%"
              style={{
                transition: 'all 0.2s ease',
                WebkitTapHighlightColor: 'transparent',
              }}
              whileHover={isValid ? { backgroundColor: '#2c5aa0' } : {}}
              whileTap={isValid ? { transform: 'scale(0.98)' } : {}}
            >
              {loading ? 'Saving...' : 'Next'}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Bottom spacing to account for fixed navigation */}
      <Box height="100px" />
    </Box>
  )
}

export default MobileBasicInfoStep