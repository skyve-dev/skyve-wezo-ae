import React from 'react'
import { WizardFormData } from '../../../types/property'
import { Box } from '../../Box'
import { MobileInput } from '../../forms/mobile/MobileInput'
import { MobileNumericInput } from '../../forms/mobile/MobileNumericInput'
import { MobileRadioGroup } from '../../forms/mobile/MobileRadioGroup'
import { MobileCheckbox } from '../../forms/mobile/MobileCheckbox'

interface MobileRulesStepProps {
  data: WizardFormData
  onChange: (updates: Partial<WizardFormData>) => void
  onNext: () => void
  onPrevious: () => void
  onSubmit: () => void
  loading: boolean
  isFirstStep: boolean
  isLastStep: boolean
}

const MobileRulesStep: React.FC<MobileRulesStepProps> = ({
  data,
  onChange,
  onNext,
  onPrevious,
  loading,
  isFirstStep
}) => {
  const checkInTimeOptions = [
    { value: 'flexible', label: 'Flexible', description: 'Guests can check in anytime', icon: '🕐' },
    { value: '14:00', label: '2:00 PM', description: 'Standard hotel check-in time', icon: '🕑' },
    { value: '15:00', label: '3:00 PM', description: 'Most common check-in time', icon: '🕒' },
    { value: '16:00', label: '4:00 PM', description: 'Late afternoon check-in', icon: '🕓' },
  ]

  const checkOutTimeOptions = [
    { value: 'flexible', label: 'Flexible', description: 'Guests can check out anytime', icon: '🕐' },
    { value: '10:00', label: '10:00 AM', description: 'Early checkout for cleaning', icon: '🕙' },
    { value: '11:00', label: '11:00 AM', description: 'Standard hotel checkout', icon: '🕚' },
    { value: '12:00', label: '12:00 PM', description: 'Late morning checkout', icon: '🕛' },
  ]

  const quietHoursOptions = [
    { value: 'none', label: 'No Quiet Hours', description: 'No restrictions on noise', icon: '🔊' },
    { value: '22:00-08:00', label: '10 PM - 8 AM', description: 'Standard quiet hours', icon: '🤫' },
    { value: '21:00-09:00', label: '9 PM - 9 AM', description: 'Extended quiet hours', icon: '😴' },
    { value: 'custom', label: 'Custom Hours', description: 'Set your own quiet hours', icon: '⏰' },
  ]

  const isValid = data.checkInTime && data.checkOutTime

  return (
    <Box padding="20px" minHeight="100vh" backgroundColor="#f8fafc">
      {/* Header */}
      <Box marginBottom="32px" textAlign="center">
        <Box fontSize="28px" fontWeight="700" color="#1a202c" marginBottom="8px">
          House Rules & Policies
        </Box>
        <Box fontSize="16px" color="#718096" lineHeight="1.5">
          Set clear expectations for your guests
        </Box>
      </Box>

      {/* Form Content */}
      <Box display="flex" flexDirection="column" gap="8px">
        {/* Check-in Time */}
        <MobileRadioGroup
          label="Check-in Time"
          value={data.checkInTime || ''}
          options={checkInTimeOptions}
          onChange={(value) => onChange({ checkInTime: value })}
          required
        />

        {/* Check-out Time */}
        <MobileRadioGroup
          label="Check-out Time"
          value={data.checkOutTime || ''}
          options={checkOutTimeOptions}
          onChange={(value) => onChange({ checkOutTime: value })}
          required
        />

        {/* Minimum Stay */}
        <MobileNumericInput
          label="Minimum Stay (Optional)"
          value={data.minimumNights || 1}
          min={1}
          max={30}
          unit="nights"
          onChange={(value) => onChange({ minimumNights: value })}
        />

        {/* Maximum Stay */}
        <MobileNumericInput
          label="Maximum Stay (Optional)"
          value={data.maximumNights || 30}
          min={1}
          max={365}
          unit="nights"
          onChange={(value) => onChange({ maximumNights: value })}
        />

        {/* Quiet Hours */}
        <MobileRadioGroup
          label="Quiet Hours Policy"
          value={data.quietHours || ''}
          options={quietHoursOptions}
          onChange={(value) => onChange({ quietHours: value })}
        />

        {/* Custom Quiet Hours (if selected) */}
        {data.quietHours === 'custom' && (
          <Box marginBottom="24px">
            <Box 
              fontSize="18px"
              fontWeight="600"
              color="#1a202c"
              marginBottom="16px"
              lineHeight="1.4"
            >
              Custom Quiet Hours
            </Box>
            
            <Box display="flex" gap="12px" alignItems="center">
              <Box flex="1">
                <MobileInput
                  label="From"
                  placeholder="22:00"
                  value={data.quietHoursFrom || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    onChange({ quietHoursFrom: e.target.value })
                  }
                />
              </Box>
              <Box fontSize="18px" fontWeight="600" color="#4a5568" paddingTop="20px">
                to
              </Box>
              <Box flex="1">
                <MobileInput
                  label="To"
                  placeholder="08:00"
                  value={data.quietHoursTo || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    onChange({ quietHoursTo: e.target.value })
                  }
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* Additional Rules */}
        <Box marginBottom="24px">
          <Box 
            fontSize="18px"
            fontWeight="600"
            color="#1a202c"
            marginBottom="16px"
            lineHeight="1.4"
          >
            🏠 Additional House Rules
          </Box>
          
          <Box display="flex" flexDirection="column" gap="16px">
            <MobileCheckbox
              label="No Parties or Events"
              checked={data.noParties || false}
              onChange={(checked) => onChange({ noParties: checked })}
              description="Strictly prohibit parties and large gatherings"
              icon="🚫"
            />

            <MobileCheckbox
              label="No Smoking Indoors"
              checked={data.noSmoking || false}
              onChange={(checked) => onChange({ noSmoking: checked })}
              description="Smoking is not allowed inside the property"
              icon="🚭"
            />

            <MobileCheckbox
              label="Require ID Verification"
              checked={data.requireIdVerification || false}
              onChange={(checked) => onChange({ requireIdVerification: checked })}
              description="Guests must provide valid ID upon check-in"
              icon="🆔"
            />

            <MobileCheckbox
              label="No Visitors Policy"
              checked={data.noVisitors || false}
              onChange={(checked) => onChange({ noVisitors: checked })}
              description="Guests cannot have additional visitors"
              icon="👥"
            />
          </Box>
        </Box>

        {/* Additional Rules Text */}
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
            Additional House Rules (Optional)
          </Box>
          <Box
            as="textarea"
            value={data.additionalRules || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
              onChange({ additionalRules: e.target.value })
            }
            placeholder="e.g., Please remove shoes before entering, Keep common areas clean, etc."
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

        {/* Rules Info Note */}
        <Box 
          backgroundColor="#fef5e7"
          border="2px solid #f6ad55"
          borderRadius="12px"
          padding="20px"
          marginBottom="40px"
        >
          <Box fontSize="16px" fontWeight="600" color="#c05621" marginBottom="8px">
            ⚖️ Legal Note
          </Box>
          <Box fontSize="14px" color="#c05621" lineHeight="1.5">
            Clear house rules protect both you and your guests. Make sure your rules comply with local laws and regulations in the UAE.
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

export default MobileRulesStep