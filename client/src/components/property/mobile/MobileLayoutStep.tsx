import React from 'react'
import { WizardFormData } from '../../../types/property'
import { Box } from '../../Box'
import { MobileNumericInput } from '../../forms/mobile/MobileNumericInput'
import { MobileCheckbox } from '../../forms/mobile/MobileCheckbox'

interface MobileLayoutStepProps {
  data: WizardFormData
  onChange: (updates: Partial<WizardFormData>) => void
  onNext: () => void
  onPrevious: () => void
  onSubmit: () => void
  loading: boolean
  isFirstStep: boolean
  isLastStep: boolean
}

const MobileLayoutStep: React.FC<MobileLayoutStepProps> = ({
  data,
  onChange,
  onNext,
  onPrevious,
  loading,
  isFirstStep
}) => {
  const isValid = data.maximumGuest > 0 && data.bathrooms > 0

  return (
    <Box padding="20px" minHeight="100vh" backgroundColor="#f8fafc">
      {/* Header */}
      <Box marginBottom="32px" textAlign="center">
        <Box fontSize="28px" fontWeight="700" color="#1a202c" marginBottom="8px">
          Property Layout
        </Box>
        <Box fontSize="16px" color="#718096" lineHeight="1.5">
          Tell us about the size and layout of your property
        </Box>
      </Box>

      {/* Form Content */}
      <Box display="flex" flexDirection="column" gap="8px">
        {/* Maximum Guests */}
        <MobileNumericInput
          label="Maximum Number of Guests"
          value={data.maximumGuest}
          min={1}
          max={20}
          unit="guests"
          onChange={(value) => onChange({ maximumGuest: value })}
          required
        />

        {/* Bathrooms */}
        <MobileNumericInput
          label="Number of Bathrooms"
          value={data.bathrooms}
          min={1}
          max={10}
          unit="bathrooms"
          onChange={(value) => onChange({ bathrooms: value })}
          required
        />

        {/* Property Size */}
        <MobileNumericInput
          label="Property Size (Optional)"
          value={data.propertySizeSqMtr || 0}
          min={0}
          max={2000}
          step={10}
          unit="sq m"
          onChange={(value) => onChange({ propertySizeSqMtr: value > 0 ? value : undefined })}
        />

        {/* Children Policy */}
        <Box marginBottom="24px">
          <Box 
            fontSize="18px"
            fontWeight="600"
            color="#1a202c"
            marginBottom="16px"
            lineHeight="1.4"
          >
            Child-Friendly Options
          </Box>
          
          <MobileCheckbox
            label="Allow Children"
            checked={data.allowChildren}
            onChange={(checked) => onChange({ allowChildren: checked })}
            description="Children of all ages are welcome"
            icon="👶"
          />

          {data.allowChildren && (
            <MobileCheckbox
              label="Offer Cribs"
              checked={data.offerCribs}
              onChange={(checked) => onChange({ offerCribs: checked })}
              description="Baby cribs available upon request"
              icon="🛏️"
            />
          )}
        </Box>

        {/* Room Information Note */}
        <Box 
          backgroundColor="#ebf8ff"
          border="2px solid #3182ce"
          borderRadius="12px"
          padding="20px"
          marginBottom="40px"
        >
          <Box fontSize="16px" fontWeight="600" color="#2c5aa0" marginBottom="8px">
            📝 Room Details
          </Box>
          <Box fontSize="14px" color="#2c5aa0" lineHeight="1.5">
            You'll be able to add detailed room information (bedrooms, bed types, etc.) in the next step.
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

export default MobileLayoutStep