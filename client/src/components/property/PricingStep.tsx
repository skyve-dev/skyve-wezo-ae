import React from 'react'
import { WizardFormData, Pricing } from '../../types/property'
import { Box } from '../Box'

interface PricingStepProps {
  data: WizardFormData
  onChange: (updates: Partial<WizardFormData>) => void
  onNext: () => void
  onPrevious: () => void
  onSubmit: () => void
  loading: boolean
  isFirstStep: boolean
  isLastStep: boolean
}

const PricingStep: React.FC<PricingStepProps> = ({
  data,
  onChange,
  onNext,
  onPrevious,
  loading
}) => {
  const pricing = data.pricing || {
    currency: 'AED',
    ratePerNight: 0
  }

  const handlePricingChange = (field: keyof Pricing, value: any) => {
    onChange({
      pricing: {
        ...pricing,
        [field]: value
      }
    })
  }

  const isValid = pricing.ratePerNight > 0

  return (
    <Box padding="2rem">
      <Box marginBottom="2rem">
        <Box fontSize="1.5rem" fontWeight="600" color="#1a202c" marginBottom="0.5rem">
          Set your pricing
        </Box>
        <Box color="#718096">
          You can always change your prices later
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap="2rem">
        {/* Basic Pricing */}
        <Box>
          <Box fontSize="1rem" fontWeight="500" color="#374151" marginBottom="1rem">
            Base Rate
          </Box>
          <Box display="grid" gridTemplateColumns={{ Sm: '100px 1fr' }} gap="1rem">
            <Box>
              <Box fontSize="0.875rem" color="#374151" marginBottom="0.5rem">
                Currency
              </Box>
              <Box
                as="select"
                value={pricing.currency}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                  handlePricingChange('currency', e.target.value)
                }
                width="100%"
                padding="0.75rem"
                border="1px solid #d1d5db"
                borderRadius="0.375rem"
                fontSize="1rem"
                backgroundColor="white"
                whileFocus={{ borderColor: '#3182ce', outline: 'none' }}
              >
                <option value="AED">AED</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </Box>
            </Box>
            <Box>
              <Box fontSize="0.875rem" color="#374151" marginBottom="0.5rem">
                Rate per night *
              </Box>
              <Box
                as="input"
                type="number"
                min="0"
                step="0.01"
                value={pricing.ratePerNight || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handlePricingChange('ratePerNight', parseFloat(e.target.value) || 0)
                }
                placeholder="e.g., 350"
                width="100%"
                padding="0.75rem"
                border="1px solid #d1d5db"
                borderRadius="0.375rem"
                fontSize="1rem"
                whileFocus={{ borderColor: '#3182ce', outline: 'none' }}
              />
            </Box>
          </Box>
        </Box>

        {/* Weekend Rate */}
        <Box>
          <Box fontSize="1rem" fontWeight="500" color="#374151" marginBottom="1rem">
            Weekend Rate (Optional)
          </Box>
          <Box>
            <Box fontSize="0.875rem" color="#374151" marginBottom="0.5rem">
              Weekend rate per night
            </Box>
            <Box
              as="input"
              type="number"
              min="0"
              step="0.01"
              value={pricing.ratePerNightWeekend || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                handlePricingChange('ratePerNightWeekend', parseFloat(e.target.value) || undefined)
              }
              placeholder="Leave empty to use base rate"
              width="100%"
              padding="0.75rem"
              border="1px solid #d1d5db"
              borderRadius="0.375rem"
              fontSize="1rem"
              whileFocus={{ borderColor: '#3182ce', outline: 'none' }}
            />
            <Box fontSize="0.75rem" color="#6b7280" marginTop="0.25rem">
              Higher rate for Friday-Saturday nights
            </Box>
          </Box>
        </Box>

        {/* Discounts */}
        <Box>
          <Box fontSize="1rem" fontWeight="500" color="#374151" marginBottom="1rem">
            Discounts (Optional)
          </Box>
          <Box display="grid" gridTemplateColumns={{ Sm: '1fr', Md: '1fr 1fr' }} gap="1rem">
            <Box>
              <Box fontSize="0.875rem" color="#374151" marginBottom="0.5rem">
                Weekly stay discount (%)
              </Box>
              <Box
                as="input"
                type="number"
                min="0"
                max="50"
                value={pricing.discountPercentageForWeeklyRatePlan || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handlePricingChange('discountPercentageForWeeklyRatePlan', parseInt(e.target.value) || undefined)
                }
                placeholder="e.g., 10"
                width="100%"
                padding="0.75rem"
                border="1px solid #d1d5db"
                borderRadius="0.375rem"
                fontSize="1rem"
                whileFocus={{ borderColor: '#3182ce', outline: 'none' }}
              />
            </Box>

            <Box>
              <Box fontSize="0.875rem" color="#374151" marginBottom="0.5rem">
                Non-refundable discount (%)
              </Box>
              <Box
                as="input"
                type="number"
                min="0"
                max="30"
                value={pricing.discountPercentageForNonRefundableRatePlan || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handlePricingChange('discountPercentageForNonRefundableRatePlan', parseInt(e.target.value) || undefined)
                }
                placeholder="e.g., 5"
                width="100%"
                padding="0.75rem"
                border="1px solid #d1d5db"
                borderRadius="0.375rem"
                fontSize="1rem"
                whileFocus={{ borderColor: '#3182ce', outline: 'none' }}
              />
            </Box>
          </Box>
        </Box>

        {/* Pricing Preview */}
        {pricing.ratePerNight > 0 && (
          <Box
            backgroundColor="#f0f9ff"
            border="1px solid #0ea5e9"
            borderRadius="0.5rem"
            padding="1.5rem"
          >
            <Box fontSize="1rem" fontWeight="500" color="#0369a1" marginBottom="1rem">
              Pricing Preview
            </Box>
            <Box display="flex" flexDirection="column" gap="0.5rem" fontSize="0.875rem" color="#0c4a6e">
              <Box display="flex" justifyContent="space-between">
                <Box>Base rate (weeknight):</Box>
                <Box fontWeight="500">{pricing.currency} {pricing.ratePerNight.toFixed(2)}</Box>
              </Box>
              {pricing.ratePerNightWeekend && (
                <Box display="flex" justifyContent="space-between">
                  <Box>Weekend rate:</Box>
                  <Box fontWeight="500">{pricing.currency} {pricing.ratePerNightWeekend.toFixed(2)}</Box>
                </Box>
              )}
              {pricing.discountPercentageForWeeklyRatePlan && (
                <Box display="flex" justifyContent="space-between">
                  <Box>7+ nights (weekly discount):</Box>
                  <Box fontWeight="500">
                    {pricing.currency} {(pricing.ratePerNight * (1 - pricing.discountPercentageForWeeklyRatePlan / 100)).toFixed(2)} 
                    <Box as="span" fontSize="0.75rem" color="#6b7280"> (-{pricing.discountPercentageForWeeklyRatePlan}%)</Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        )}
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
          <Box
            as="button"
            onClick={onPrevious}
            padding="0.75rem 1.5rem"
            backgroundColor="transparent"
            color="#6b7280"
            border="1px solid #d1d5db"
            borderRadius="0.375rem"
            fontSize="1rem"
            cursor="pointer"
            whileHover={{ borderColor: '#9ca3af', backgroundColor: '#f9fafb' }}
          >
            Previous
          </Box>
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

export default PricingStep