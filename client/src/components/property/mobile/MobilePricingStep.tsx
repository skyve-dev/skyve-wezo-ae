import React from 'react'
import { WizardFormData } from '../../../types/property'
import { Box } from '../../Box'
import { MobileNumericInput } from '../../forms/mobile/MobileNumericInput'
import { MobileRadioGroup } from '../../forms/mobile/MobileRadioGroup'
import { MobileCheckbox } from '../../forms/mobile/MobileCheckbox'

interface MobilePricingStepProps {
  data: WizardFormData
  onChange: (updates: Partial<WizardFormData>) => void
  onNext: () => void
  onPrevious: () => void
  onSubmit: () => void
  loading: boolean
  isFirstStep: boolean
  isLastStep: boolean
}

const MobilePricingStep: React.FC<MobilePricingStepProps> = ({
  data,
  onChange,
  onNext,
  onPrevious,
  loading,
  isFirstStep
}) => {
  const currencyOptions = [
    { value: 'AED', label: 'AED (Dirham)', description: 'United Arab Emirates Dirham', icon: '🇦🇪' },
    { value: 'USD', label: 'USD (Dollar)', description: 'US Dollar', icon: '🇺🇸' },
    { value: 'EUR', label: 'EUR (Euro)', description: 'European Euro', icon: '🇪🇺' },
  ]

  const cleaningFeeOptions = [
    { value: 'none', label: 'No Cleaning Fee', description: 'Include cleaning in base price', icon: '🆓' },
    { value: 'per_stay', label: 'Per Stay', description: 'One-time fee per booking', icon: '🧹' },
    { value: 'per_night', label: 'Per Night', description: 'Add to each night\'s rate', icon: '🗓️' },
  ]

  const securityDepositOptions = [
    { value: 'none', label: 'No Security Deposit', description: 'Trust-based approach', icon: '🤝' },
    { value: 'refundable', label: 'Refundable Deposit', description: 'Returned after checkout', icon: '💰' },
    { value: 'authorization', label: 'Card Authorization', description: 'Hold amount on card', icon: '💳' },
  ]

  const calculateTotalPrice = () => {
    const basePrice = data.pricePerNight || 0
    const cleaning = data.cleaningFeeType === 'per_night' ? (data.cleaningFee || 0) : 0
    return basePrice + cleaning
  }

  const isValid = data.pricePerNight && data.pricePerNight > 0 && data.currency

  return (
    <Box padding="20px" minHeight="100vh" backgroundColor="#f8fafc">
      {/* Header */}
      <Box marginBottom="32px" textAlign="center">
        <Box fontSize="28px" fontWeight="700" color="#1a202c" marginBottom="8px">
          Pricing & Fees
        </Box>
        <Box fontSize="16px" color="#718096" lineHeight="1.5">
          Set your rates and additional fees
        </Box>
        {data.pricePerNight && (
          <Box 
            fontSize="24px" 
            fontWeight="700" 
            color="#3182ce" 
            marginTop="12px"
          >
            {data.currency || 'AED'} {calculateTotalPrice()}/night
          </Box>
        )}
      </Box>

      {/* Form Content */}
      <Box display="flex" flexDirection="column" gap="8px">
        {/* Currency Selection */}
        <MobileRadioGroup
          label="Currency"
          value={data.currency || ''}
          options={currencyOptions}
          onChange={(value) => onChange({ currency: value })}
          required
        />

        {/* Base Price per Night */}
        <MobileNumericInput
          label="Base Price per Night"
          value={data.pricePerNight || 0}
          min={50}
          max={10000}
          step={25}
          unit={`${data.currency || 'AED'}/night`}
          onChange={(value) => onChange({ pricePerNight: value })}
          required
        />

        {/* Cleaning Fee Type */}
        <MobileRadioGroup
          label="Cleaning Fee Structure"
          value={data.cleaningFeeType || ''}
          options={cleaningFeeOptions}
          onChange={(value) => onChange({ cleaningFeeType: value })}
        />

        {/* Cleaning Fee Amount (if not none) */}
        {data.cleaningFeeType && data.cleaningFeeType !== 'none' && (
          <MobileNumericInput
            label={`Cleaning Fee ${data.cleaningFeeType === 'per_stay' ? '(One-time)' : '(Per Night)'}`}
            value={data.cleaningFee || 0}
            min={0}
            max={1000}
            step={25}
            unit={data.currency || 'AED'}
            onChange={(value) => onChange({ cleaningFee: value })}
          />
        )}

        {/* Security Deposit */}
        <MobileRadioGroup
          label="Security Deposit Policy"
          value={data.securityDepositType || ''}
          options={securityDepositOptions}
          onChange={(value) => onChange({ securityDepositType: value })}
        />

        {/* Security Deposit Amount (if not none) */}
        {data.securityDepositType && data.securityDepositType !== 'none' && (
          <MobileNumericInput
            label="Security Deposit Amount"
            value={data.securityDepositAmount || 0}
            min={0}
            max={5000}
            step={100}
            unit={data.currency || 'AED'}
            onChange={(value) => onChange({ securityDepositAmount: value })}
          />
        )}

        {/* Extra Guest Fee */}
        <Box marginBottom="24px">
          <MobileCheckbox
            label="Charge for Extra Guests"
            checked={data.chargeExtraGuests || false}
            onChange={(checked) => onChange({ chargeExtraGuests: checked })}
            description="Add fee for guests beyond base occupancy"
            icon="👥"
          />

          {data.chargeExtraGuests && (
            <Box marginTop="16px">
              <MobileNumericInput
                label="Extra Guest Fee (per person/night)"
                value={data.extraGuestFee || 0}
                min={0}
                max={200}
                step={25}
                unit={`${data.currency || 'AED'}/person`}
                onChange={(value) => onChange({ extraGuestFee: value })}
              />
            </Box>
          )}
        </Box>

        {/* Weekly/Monthly Discounts */}
        <Box marginBottom="24px">
          <Box 
            fontSize="18px"
            fontWeight="600"
            color="#1a202c"
            marginBottom="16px"
            lineHeight="1.4"
          >
            📊 Long Stay Discounts
          </Box>
          
          <Box display="flex" flexDirection="column" gap="16px">
            <MobileCheckbox
              label="Weekly Discount (7+ nights)"
              checked={data.offerWeeklyDiscount || false}
              onChange={(checked) => onChange({ offerWeeklyDiscount: checked })}
              description="Attract longer stays with discounted rates"
              icon="📅"
            />

            {data.offerWeeklyDiscount && (
              <MobileNumericInput
                label="Weekly Discount Percentage"
                value={data.weeklyDiscountPercent || 0}
                min={5}
                max={50}
                step={5}
                unit="%"
                onChange={(value) => onChange({ weeklyDiscountPercent: value })}
              />
            )}

            <MobileCheckbox
              label="Monthly Discount (30+ nights)"
              checked={data.offerMonthlyDiscount || false}
              onChange={(checked) => onChange({ offerMonthlyDiscount: checked })}
              description="Significant discounts for extended stays"
              icon="🗓️"
            />

            {data.offerMonthlyDiscount && (
              <MobileNumericInput
                label="Monthly Discount Percentage"
                value={data.monthlyDiscountPercent || 0}
                min={10}
                max={70}
                step={5}
                unit="%"
                onChange={(value) => onChange({ monthlyDiscountPercent: value })}
              />
            )}
          </Box>
        </Box>

        {/* Pricing Summary */}
        {data.pricePerNight && (
          <Box 
            backgroundColor="#f0fff4"
            border="2px solid #38a169"
            borderRadius="12px"
            padding="20px"
            marginBottom="40px"
          >
            <Box fontSize="16px" fontWeight="600" color="#2f855a" marginBottom="12px">
              💰 Pricing Summary
            </Box>
            <Box fontSize="14px" color="#2f855a" lineHeight="1.6">
              <Box marginBottom="4px">
                <strong>Base Rate:</strong> {data.currency || 'AED'} {data.pricePerNight}/night
              </Box>
              {data.cleaningFee && data.cleaningFeeType === 'per_night' && (
                <Box marginBottom="4px">
                  <strong>+ Cleaning:</strong> {data.currency || 'AED'} {data.cleaningFee}/night
                </Box>
              )}
              {data.cleaningFee && data.cleaningFeeType === 'per_stay' && (
                <Box marginBottom="4px">
                  <strong>+ Cleaning:</strong> {data.currency || 'AED'} {data.cleaningFee}/stay
                </Box>
              )}
              {data.extraGuestFee && data.chargeExtraGuests && (
                <Box marginBottom="4px">
                  <strong>+ Extra Guest:</strong> {data.currency || 'AED'} {data.extraGuestFee}/person
                </Box>
              )}
              <Box marginTop="8px" fontSize="16px" fontWeight="700">
                <strong>Total per night:</strong> {data.currency || 'AED'} {calculateTotalPrice()}
              </Box>
            </Box>
          </Box>
        )}
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

export default MobilePricingStep