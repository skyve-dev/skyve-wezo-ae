import React from 'react'
import { WizardFormData } from '../../../types/property'
import { Box } from '../../Box'
import { MobileInput } from '../../forms/mobile/MobileInput'
import { MobileRadioGroup } from '../../forms/mobile/MobileRadioGroup'

interface MobileLocationStepProps {
  data: WizardFormData
  onChange: (updates: Partial<WizardFormData>) => void
  onNext: () => void
  onPrevious: () => void
  onSubmit: () => void
  loading: boolean
  isFirstStep: boolean
  isLastStep: boolean
}

const MobileLocationStep: React.FC<MobileLocationStepProps> = ({
  data,
  onChange,
  onNext,
  onPrevious,
  loading,
  isFirstStep
}) => {
  const handleInputChange = (field: string, value: string) => {
    onChange({ [field]: value })
  }

  const emirateOptions = [
    { value: 'Abu Dhabi', label: 'Abu Dhabi', icon: '🏛️' },
    { value: 'Dubai', label: 'Dubai', icon: '🏙️' },
    { value: 'Sharjah', label: 'Sharjah', icon: '🏛️' },
    { value: 'Ajman', label: 'Ajman', icon: '🏘️' },
    { value: 'Fujairah', label: 'Fujairah', icon: '🏔️' },
    { value: 'Ras Al Khaimah', label: 'Ras Al Khaimah', icon: '🏖️' },
    { value: 'Umm Al Quwain', label: 'Umm Al Quwain', icon: '🏞️' },
  ]

  const isValid = data.country && data.state && data.city && data.postalCode && data.streetAddress

  return (
    <Box padding="20px" minHeight="100vh" backgroundColor="#f8fafc">
      {/* Header */}
      <Box marginBottom="32px" textAlign="center">
        <Box fontSize="28px" fontWeight="700" color="#1a202c" marginBottom="8px">
          Property Location
        </Box>
        <Box fontSize="16px" color="#718096" lineHeight="1.5">
          Where is your property located?
        </Box>
      </Box>

      {/* Form Content */}
      <Box display="flex" flexDirection="column" gap="8px">
        {/* Country (Fixed for UAE) */}
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
            Country
          </Box>
          <Box
            width="100%"
            minHeight="56px"
            padding="16px 20px"
            fontSize="18px"
            borderRadius="12px"
            border="2px solid #e2e8f0"
            backgroundColor="#f7fafc"
            color="#4a5568"
            display="flex"
            alignItems="center"
            fontWeight="600"
          >
            🇦🇪 United Arab Emirates
          </Box>
          {!data.country && (() => {
            onChange({ country: 'United Arab Emirates' })
            return null
          })()}
        </Box>

        {/* Emirate/State */}
        <MobileRadioGroup
          label="Which Emirate?"
          value={data.state || ''}
          options={emirateOptions}
          onChange={(value) => handleInputChange('state', value)}
          required
        />

        {/* City */}
        <MobileInput
          label="City"
          placeholder="e.g., Al Barsha, Downtown Dubai, Al Ain"
          value={data.city || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            handleInputChange('city', e.target.value)
          }
          required
        />

        {/* Street Address */}
        <MobileInput
          label="Street Address"
          placeholder="Building name, street name, apartment number"
          value={data.streetAddress || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            handleInputChange('streetAddress', e.target.value)
          }
          required
        />

        {/* Postal Code */}
        <MobileInput
          label="Postal Code"
          placeholder="e.g., 12345"
          value={data.postalCode || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            handleInputChange('postalCode', e.target.value)
          }
          required
        />

        {/* Latitude (Optional) */}
        <MobileInput
          label="Latitude (Optional)"
          placeholder="e.g., 25.2048"
          value={data.latitude?.toString() || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = parseFloat(e.target.value)
            onChange({ latitude: isNaN(value) ? undefined : value })
          }}
        />

        {/* Longitude (Optional) */}
        <MobileInput
          label="Longitude (Optional)"
          placeholder="e.g., 55.2708"
          value={data.longitude?.toString() || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = parseFloat(e.target.value)
            onChange({ longitude: isNaN(value) ? undefined : value })
          }}
        />

        {/* Location Info Note */}
        <Box 
          backgroundColor="#f0f9ff"
          border="2px solid #0ea5e9"
          borderRadius="12px"
          padding="20px"
          marginBottom="40px"
        >
          <Box fontSize="16px" fontWeight="600" color="#0369a1" marginBottom="8px">
            📍 Location Tips
          </Box>
          <Box fontSize="14px" color="#0369a1" lineHeight="1.5">
            Providing exact coordinates (lat/lng) helps guests find your property easily and improves your listing's visibility in search results.
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

export default MobileLocationStep