import React from 'react'
import { WizardFormData } from '../../types/property'
import { Box } from '../Box'

interface BasicInfoStepProps {
  data: WizardFormData
  onChange: (updates: Partial<WizardFormData>) => void
  onNext: () => void
  onPrevious: () => void
  onSubmit: () => void
  loading: boolean
  isFirstStep: boolean
  isLastStep: boolean
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  data,
  onChange,
  onNext,
  loading,
  isFirstStep
}) => {
  const handleInputChange = (field: string, value: string) => {
    onChange({ [field]: value })
  }

  const handleBookingTypeChange = (value: 'INSTANT' | 'REQUEST') => {
    onChange({ bookingType: value })
  }

  const handlePaymentTypeChange = (value: 'FULL' | 'PARTIAL') => {
    onChange({ paymentType: value })
  }

  const isValid = data.name.trim().length >= 3

  return (
    <Box padding="2rem">
      <Box marginBottom="2rem">
        <Box fontSize="1.5rem" fontWeight="600" color="#1a202c" marginBottom="0.5rem">
          Tell us about your property
        </Box>
        <Box color="#718096">
          Let's start with the basics - what should guests call your place?
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap="1.5rem">
        {/* Property Name */}
        <Box>
          <Box
            as="label"
            display="block"
            fontSize="0.875rem"
            fontWeight="500"
            color="#374151"
            marginBottom="0.5rem"
          >
            Property Name *
          </Box>
          <Box
            as="input"
            type="text"
            value={data.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handleInputChange('name', e.target.value)
            }
            placeholder="e.g., Cozy Downtown Villa with Pool"
            width="100%"
            padding="0.75rem"
            border="1px solid #d1d5db"
            borderRadius="0.375rem"
            fontSize="1rem"
            whileFocus={{ borderColor: '#3182ce', outline: 'none', boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)' }}
          />
          <Box fontSize="0.75rem" color="#6b7280" marginTop="0.25rem">
            Minimum 3 characters. This will be the first thing guests see.
          </Box>
        </Box>

        {/* Booking Type */}
        <Box>
          <Box
            as="label"
            display="block"
            fontSize="0.875rem"
            fontWeight="500"
            color="#374151"
            marginBottom="0.5rem"
          >
            How do you want to handle bookings? *
          </Box>
          <Box display="flex" flexDirection="column" gap="0.75rem">
            <Box
              as="label"
              display="flex"
              alignItems="flex-start"
              gap="0.75rem"
              padding="1rem"
              border="2px solid"
              borderColor={data.bookingType === 'INSTANT' ? '#3182ce' : '#e5e7eb'}
              borderRadius="0.5rem"
              cursor="pointer"
              whileHover={{ borderColor: '#3182ce' }}
            >
              <Box
                as="input"
                type="radio"
                name="bookingType"
                value="INSTANT"
                checked={data.bookingType === 'INSTANT'}
                onChange={() => handleBookingTypeChange('INSTANT')}
                accentColor="#3182ce"
              />
              <Box>
                <Box fontWeight="500" color="#374151">
                  Instant Book
                </Box>
                <Box fontSize="0.875rem" color="#6b7280">
                  Guests can book immediately without waiting for approval
                </Box>
              </Box>
            </Box>

            <Box
              as="label"
              display="flex"
              alignItems="flex-start"
              gap="0.75rem"
              padding="1rem"
              border="2px solid"
              borderColor={data.bookingType === 'REQUEST' ? '#3182ce' : '#e5e7eb'}
              borderRadius="0.5rem"
              cursor="pointer"
              whileHover={{ borderColor: '#3182ce' }}
            >
              <Box
                as="input"
                type="radio"
                name="bookingType"
                value="REQUEST"
                checked={data.bookingType === 'REQUEST'}
                onChange={() => handleBookingTypeChange('REQUEST')}
                accentColor="#3182ce"
              />
              <Box>
                <Box fontWeight="500" color="#374151">
                  Request to Book
                </Box>
                <Box fontSize="0.875rem" color="#6b7280">
                  You review and approve each booking request before confirmation
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Payment Type */}
        <Box>
          <Box
            as="label"
            display="block"
            fontSize="0.875rem"
            fontWeight="500"
            color="#374151"
            marginBottom="0.5rem"
          >
            Payment Collection *
          </Box>
          <Box display="flex" flexDirection="column" gap="0.75rem">
            <Box
              as="label"
              display="flex"
              alignItems="flex-start"
              gap="0.75rem"
              padding="1rem"
              border="2px solid"
              borderColor={data.paymentType === 'FULL' ? '#3182ce' : '#e5e7eb'}
              borderRadius="0.5rem"
              cursor="pointer"
              whileHover={{ borderColor: '#3182ce' }}
            >
              <Box
                as="input"
                type="radio"
                name="paymentType"
                value="FULL"
                checked={data.paymentType === 'FULL'}
                onChange={() => handlePaymentTypeChange('FULL')}
                accentColor="#3182ce"
              />
              <Box>
                <Box fontWeight="500" color="#374151">
                  Full Payment at Booking
                </Box>
                <Box fontSize="0.875rem" color="#6b7280">
                  Collect the entire amount when guests book
                </Box>
              </Box>
            </Box>

            <Box
              as="label"
              display="flex"
              alignItems="flex-start"
              gap="0.75rem"
              padding="1rem"
              border="2px solid"
              borderColor={data.paymentType === 'PARTIAL' ? '#3182ce' : '#e5e7eb'}
              borderRadius="0.5rem"
              cursor="pointer"
              whileHover={{ borderColor: '#3182ce' }}
            >
              <Box
                as="input"
                type="radio"
                name="paymentType"
                value="PARTIAL"
                checked={data.paymentType === 'PARTIAL'}
                onChange={() => handlePaymentTypeChange('PARTIAL')}
                accentColor="#3182ce"
              />
              <Box>
                <Box fontWeight="500" color="#374151">
                  Partial Payment (50% at booking, 50% later)
                </Box>
                <Box fontSize="0.875rem" color="#6b7280">
                  Collect half upfront and half before check-in
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* About the Property */}
        <Box>
          <Box
            as="label"
            display="block"
            fontSize="0.875rem"
            fontWeight="500"
            color="#374151"
            marginBottom="0.5rem"
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
            padding="0.75rem"
            border="1px solid #d1d5db"
            borderRadius="0.375rem"
            fontSize="1rem"
            resize="vertical"
            whileFocus={{ borderColor: '#3182ce', outline: 'none', boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)' }}
          />
        </Box>

        {/* About the Neighborhood */}
        <Box>
          <Box
            as="label"
            display="block"
            fontSize="0.875rem"
            fontWeight="500"
            color="#374151"
            marginBottom="0.5rem"
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
            padding="0.75rem"
            border="1px solid #d1d5db"
            borderRadius="0.375rem"
            fontSize="1rem"
            resize="vertical"
            whileFocus={{ borderColor: '#3182ce', outline: 'none', boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)' }}
          />
        </Box>
      </Box>

      {/* Navigation */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginTop="3rem"
        paddingTop="2rem"
        borderTop="1px solid #e5e7eb"
      >
        <Box>
          {!isFirstStep && (
            <Box
              as="button"
              onClick={() => {}}
              padding="0.75rem 1.5rem"
              backgroundColor="transparent"
              color="#6b7280"
              border="1px solid #d1d5db"
              borderRadius="0.375rem"
              fontSize="1rem"
              cursor="not-allowed"
              opacity={0.5}
            >
              Previous
            </Box>
          )}
        </Box>

        <Box>
          <Box
            as="button"
            onClick={onNext}
            disabled={!isValid || loading}
            padding="0.75rem 2rem"
            backgroundColor={isValid ? '#3182ce' : '#9ca3af'}
            color="white"
            border="none"
            borderRadius="0.375rem"
            fontSize="1rem"
            fontWeight="500"
            cursor={isValid ? 'pointer' : 'not-allowed'}
            whileHover={isValid ? { backgroundColor: '#2c5aa0' } : {}}
          >
            {loading ? 'Saving...' : 'Next'}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default BasicInfoStep