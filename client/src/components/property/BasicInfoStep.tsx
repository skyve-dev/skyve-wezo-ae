import React from 'react'
import { WizardFormData } from '../../types/property'
import { Box } from '../Box'
import { BookingType, PaymentType, BookingTypeLabels, PaymentTypeLabels } from '../../constants/propertyEnums'

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

  const handleBookingTypeChange = (value: BookingType) => {
    onChange({ bookingType: value })
  }

  const handlePaymentTypeChange = (value: PaymentType) => {
    onChange({ paymentType: value })
  }

  const isValid = data.name.trim().length >= 3 && data.firstDateGuestCanCheckIn

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
              borderColor={data.bookingType === BookingType.BookInstantly ? '#3182ce' : '#e5e7eb'}
              borderRadius="0.5rem"
              cursor="pointer"
              whileHover={{ borderColor: '#3182ce' }}
            >
              <Box
                as="input"
                type="radio"
                name="bookingType"
                value={BookingType.BookInstantly}
                checked={data.bookingType === BookingType.BookInstantly}
                onChange={() => handleBookingTypeChange(BookingType.BookInstantly)}
                accentColor="#3182ce"
              />
              <Box>
                <Box fontWeight="500" color="#374151">
                  {BookingTypeLabels[BookingType.BookInstantly]}
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
              borderColor={data.bookingType === BookingType.NeedToRequestBook ? '#3182ce' : '#e5e7eb'}
              borderRadius="0.5rem"
              cursor="pointer"
              whileHover={{ borderColor: '#3182ce' }}
            >
              <Box
                as="input"
                type="radio"
                name="bookingType"
                value={BookingType.NeedToRequestBook}
                checked={data.bookingType === BookingType.NeedToRequestBook}
                onChange={() => handleBookingTypeChange(BookingType.NeedToRequestBook)}
                accentColor="#3182ce"
              />
              <Box>
                <Box fontWeight="500" color="#374151">
                  {BookingTypeLabels[BookingType.NeedToRequestBook]}
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
              borderColor={data.paymentType === PaymentType.Online ? '#3182ce' : '#e5e7eb'}
              borderRadius="0.5rem"
              cursor="pointer"
              whileHover={{ borderColor: '#3182ce' }}
            >
              <Box
                as="input"
                type="radio"
                name="paymentType"
                value={PaymentType.Online}
                checked={data.paymentType === PaymentType.Online}
                onChange={() => handlePaymentTypeChange(PaymentType.Online)}
                accentColor="#3182ce"
              />
              <Box>
                <Box fontWeight="500" color="#374151">
                  {PaymentTypeLabels[PaymentType.Online]}
                </Box>
                <Box fontSize="0.875rem" color="#6b7280">
                  Collect the entire amount when guests book online
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
              borderColor={data.paymentType === PaymentType.ByCreditCardAtProperty ? '#3182ce' : '#e5e7eb'}
              borderRadius="0.5rem"
              cursor="pointer"
              whileHover={{ borderColor: '#3182ce' }}
            >
              <Box
                as="input"
                type="radio"
                name="paymentType"
                value={PaymentType.ByCreditCardAtProperty}
                checked={data.paymentType === PaymentType.ByCreditCardAtProperty}
                onChange={() => handlePaymentTypeChange(PaymentType.ByCreditCardAtProperty)}
                accentColor="#3182ce"
              />
              <Box>
                <Box fontWeight="500" color="#374151">
                  {PaymentTypeLabels[PaymentType.ByCreditCardAtProperty]}
                </Box>
                <Box fontSize="0.875rem" color="#6b7280">
                  Guests pay with credit card when they arrive at the property
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* First Available Date */}
        <Box>
          <Box
            as="label"
            display="block"
            fontSize="0.875rem"
            fontWeight="500"
            color="#374151"
            marginBottom="0.5rem"
          >
            First Available Date for Guests *
          </Box>
          <Box
            as="input"
            type="date"
            value={data.firstDateGuestCanCheckIn ? data.firstDateGuestCanCheckIn.split('T')[0] : ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              onChange({ firstDateGuestCanCheckIn: e.target.value })
            }
            min={new Date().toISOString().split('T')[0]}
            width="100%"
            padding="0.75rem"
            border="1px solid #d1d5db"
            borderRadius="0.375rem"
            fontSize="1rem"
            whileFocus={{ borderColor: '#3182ce', outline: 'none', boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)' }}
          />
          <Box fontSize="0.75rem" color="#6b7280" marginTop="0.25rem">
            Select the earliest date guests can check in to your property
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