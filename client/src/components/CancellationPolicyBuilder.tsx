import React, { useState, useEffect } from 'react'
import { Box } from './base/Box'
import { Button } from './base/Button'
import SelectionPicker from './base/SelectionPicker'
import { NumberStepperInput } from './base/NumberStepperInput'
import { IoIosCheckmark, IoIosClose, IoIosInformationCircle, IoIosEye } from 'react-icons/io'
import type { CancellationPolicy } from '@/store/slices/ratePlanSlice'

interface CancellationPolicyBuilderProps {
  policy?: CancellationPolicy | null
  onChange: (policy: CancellationPolicy | null) => void
  ratePlanId: string
}

type PolicyType = 'FullyFlexible' | 'Moderate' | 'NonRefundable'

interface PolicyTypeOption {
  value: PolicyType
  label: string
  description: string
  icon: React.ReactNode
  defaultValues: {
    freeCancellationDays?: number
    partialRefundDays?: number
  }
}

const POLICY_TYPES: PolicyTypeOption[] = [
  {
    value: 'FullyFlexible',
    label: 'Fully Flexible',
    description: 'Full refund based on days before check-in',
    icon: <IoIosCheckmark style={{ color: '#22c55e' }} />,
    defaultValues: {
      freeCancellationDays: 1
    }
  },
  {
    value: 'Moderate',
    label: 'Moderate',
    description: 'Partial refund based on days before check-in',
    icon: <IoIosInformationCircle style={{ color: '#f59e0b' }} />,
    defaultValues: {
      freeCancellationDays: 7,
      partialRefundDays: 3
    }
  },
  {
    value: 'NonRefundable',
    label: 'Non-Refundable',
    description: 'No refunds under any circumstances',
    icon: <IoIosClose style={{ color: '#ef4444' }} />,
    defaultValues: {}
  }
]

/**
 * Simplified CancellationPolicyBuilder Component
 * 
 * Builds cancellation policies using the new simplified schema:
 * - type: FullyFlexible | Moderate | NonRefundable
 * - freeCancellationDays: Days before arrival for 100% refund
 * - partialRefundDays: Days before arrival for 50% refund (Moderate only)
 * 
 * Features:
 * - Policy type selection with presets
 * - Configurable cancellation days
 * - Guest preview of policy
 * - Real-time validation
 * 
 * @example
 * ```tsx
 * <CancellationPolicyBuilder
 *   policy={currentForm.cancellationPolicy}
 *   onChange={(policy) => handleFieldChange('cancellationPolicy', policy)}
 *   ratePlanId={currentForm.id || 'new'}
 * />
 * ```
 */
const CancellationPolicyBuilder: React.FC<CancellationPolicyBuilderProps> = ({
  policy,
  onChange,
  ratePlanId
}) => {
  const [currentType, setCurrentType] = useState<PolicyType>('FullyFlexible')
  const [freeCancellationDays, setFreeCancellationDays] = useState<number>(1)
  const [partialRefundDays, setPartialRefundDays] = useState<number>(3)
  const [showPreview, setShowPreview] = useState(false)

  // Initialize from existing policy
  useEffect(() => {
    if (policy) {
      setCurrentType(policy.type)
      setFreeCancellationDays(policy.freeCancellationDays || 1)
      setPartialRefundDays(policy.partialRefundDays || 3)
    } else {
      // Apply default values
      applyPolicyType('FullyFlexible')
    }
  }, [policy])

  // Apply policy type with defaults
  const applyPolicyType = (type: PolicyType) => {
    const policyConfig = POLICY_TYPES.find(p => p.value === type)!
    
    setCurrentType(type)
    
    if (policyConfig.defaultValues.freeCancellationDays !== undefined) {
      setFreeCancellationDays(policyConfig.defaultValues.freeCancellationDays)
    }
    
    if (policyConfig.defaultValues.partialRefundDays !== undefined) {
      setPartialRefundDays(policyConfig.defaultValues.partialRefundDays)
    }

    updatePolicy(type, policyConfig.defaultValues.freeCancellationDays, policyConfig.defaultValues.partialRefundDays)
  }

  // Update the policy object
  const updatePolicy = (type?: PolicyType, freeDays?: number, partialDays?: number) => {
    const finalType = type ?? currentType
    const finalFreeDays = freeDays ?? freeCancellationDays
    const finalPartialDays = partialDays ?? partialRefundDays

    // For NonRefundable, we don't need any days
    if (finalType === 'NonRefundable') {
      const newPolicy: CancellationPolicy = {
        id: policy?.id || `policy_${Date.now()}`,
        ratePlanId,
        type: finalType
      }
      onChange(newPolicy)
      return
    }

    // For FullyFlexible and Moderate
    const newPolicy: CancellationPolicy = {
      id: policy?.id || `policy_${Date.now()}`,
      ratePlanId,
      type: finalType,
      freeCancellationDays: finalFreeDays,
      ...(finalType === 'Moderate' && { partialRefundDays: finalPartialDays })
    }
    
    onChange(newPolicy)
  }

  // Handle policy type change
  const handlePolicyTypeChange = (value: string | number | (string | number)[]) => {
    applyPolicyType(value as PolicyType)
  }

  // Handle free cancellation days change
  const handleFreeCancellationDaysChange = (days: number) => {
    setFreeCancellationDays(days)
    updatePolicy(undefined, days, undefined)
  }

  // Handle partial refund days change
  const handlePartialRefundDaysChange = (days: number) => {
    setPartialRefundDays(days)
    updatePolicy(undefined, undefined, days)
  }

  // Get current policy configuration
  const currentPolicyConfig = POLICY_TYPES.find(p => p.value === currentType)!

  // Generate policy description for guests
  const getPolicyDescription = () => {
    switch (currentType) {
      case 'FullyFlexible':
        return `Full refund if cancelled ${freeCancellationDays} or more days before check-in. No refund for later cancellations.`
      
      case 'Moderate':
        return `Full refund if cancelled ${freeCancellationDays} or more days before check-in. 50% refund if cancelled ${partialRefundDays} or more days before check-in. No refund for later cancellations.`
      
      case 'NonRefundable':
        return 'This booking is non-refundable. No refunds will be provided under any circumstances.'
      
      default:
        return ''
    }
  }

  return (
    <Box display="flex" flexDirection="column" gap="1.5rem">
      {/* Policy Type Selection */}
      <Box>
        <Box
          fontSize="1rem"
          fontWeight="600"
          marginBottom="0.75rem"
          color="#374151"
        >
          Cancellation Policy Type *
        </Box>
        
        <SelectionPicker
          data={POLICY_TYPES}
          idAccessor={(option) => option.value}
          value={currentType}
          onChange={handlePolicyTypeChange}
          renderItem={(option, _isSelected) => (
            <Box display="flex" alignItems="center" gap="0.75rem">
              <Box fontSize="1.25rem" flexShrink={0}>
                {option.icon}
              </Box>
              <Box flex="1">
                <Box
                  fontSize="0.9375rem"
                  fontWeight="600"
                  color="#374151"
                  marginBottom="0.125rem"
                >
                  {option.label}
                </Box>
                <Box
                  fontSize="0.8125rem"
                  color="#6b7280"
                  lineHeight="1.3"
                >
                  {option.description}
                </Box>
              </Box>
            </Box>
          )}
        />
      </Box>

      {/* Policy Configuration */}
      {currentType !== 'NonRefundable' && (
        <Box
          padding="1.5rem"
          backgroundColor="#f9fafb"
          borderRadius="12px"
          border="1px solid #e5e7eb"
        >
          <Box
            fontSize="0.9375rem"
            fontWeight="600"
            color="#374151"
            marginBottom="1rem"
          >
            Policy Configuration
          </Box>

          <Box display="flex" flexDirection="column" gap="1rem">
            {/* Free Cancellation Days */}
            <NumberStepperInput
              label="Free Cancellation Period (days)"
              value={freeCancellationDays}
              onChange={handleFreeCancellationDaysChange}
              min={0}
              max={30}
              step={1}
              format="integer"
              helperText={`Guests get 100% refund if they cancel ${freeCancellationDays} or more days before check-in`}
              width="200px"
            />

            {/* Partial Refund Days (Moderate only) */}
            {currentType === 'Moderate' && (
              <NumberStepperInput
                label="Partial Refund Period (days)"
                value={partialRefundDays}
                onChange={handlePartialRefundDaysChange}
                min={0}
                max={freeCancellationDays - 1}
                step={1}
                format="integer"
                helperText={`Guests get 50% refund if they cancel ${partialRefundDays} or more days before check-in`}
                width="200px"
              />
            )}
          </Box>
        </Box>
      )}

      {/* Non-Refundable Warning */}
      {currentType === 'NonRefundable' && (
        <Box
          padding="1.5rem"
          backgroundColor="#fef2f2"
          borderRadius="12px"
          border="1px solid #fecaca"
        >
          <Box display="flex" alignItems="start" gap="0.75rem">
            <IoIosInformationCircle 
              color="#dc2626" 
              style={{ fontSize: '1.25rem', flexShrink: 0, marginTop: '0.125rem' }} 
            />
            <Box>
              <Box
                fontSize="0.9375rem"
                fontWeight="600"
                color="#dc2626"
                marginBottom="0.5rem"
              >
                Non-Refundable Policy
              </Box>
              <Box
                fontSize="0.875rem"
                color="#b91c1c"
                lineHeight="1.4"
              >
                Guests will not receive any refund if they cancel their booking. 
                Consider offering a lower price to compensate for this strict policy.
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Preview Toggle */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box
          fontSize="1rem"
          fontWeight="600"
          color="#374151"
        >
          Guest Preview
        </Box>
        
        <Button
          label={showPreview ? 'Hide Preview' : 'Show Preview'}
          icon={<IoIosEye />}
          onClick={() => setShowPreview(!showPreview)}
          variant="plain"
          size="small"
        />
      </Box>

      {/* Guest Preview Panel */}
      {showPreview && (
        <Box
          padding="1.5rem"
          backgroundColor="#eff6ff"
          borderRadius="12px"
          border="1px solid #bfdbfe"
        >
          <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1rem">
            <IoIosEye color="#2563eb" style={{ fontSize: '1.25rem' }} />
            <Box
              fontSize="1rem"
              fontWeight="600"
              color="#1e40af"
            >
              What Guests Will See
            </Box>
          </Box>
          
          <Box
            padding="1rem"
            backgroundColor="white"
            borderRadius="8px"
            border="1px solid #e0e7ff"
          >
            <Box
              fontSize="0.875rem"
              fontWeight="600"
              color="#374151"
              marginBottom="0.5rem"
            >
              Cancellation Policy: {currentPolicyConfig.label}
            </Box>
            
            <Box
              fontSize="0.875rem"
              color="#4b5563"
              lineHeight="1.4"
            >
              {getPolicyDescription()}
            </Box>
          </Box>
          
          <Box
            fontSize="0.75rem"
            color="#6366f1"
            marginTop="0.75rem"
            fontStyle="italic"
          >
            This policy will be displayed during the booking process and in confirmation emails.
          </Box>
        </Box>
      )}

      {/* Help Text */}
      <Box
        padding="1rem"
        backgroundColor="#f0fdf4"
        borderRadius="8px"
        border="1px solid #bbf7d0"
      >
        <Box
          fontSize="0.875rem"
          color="#065f46"
          lineHeight="1.4"
        >
          <Box fontWeight="600" marginBottom="0.25rem">💡 Policy Tips:</Box>
          • <strong>Fully Flexible:</strong> Attracts more bookings but higher cancellation risk<br/>
          • <strong>Moderate:</strong> Good balance between flexibility and revenue protection<br/>
          • <strong>Non-Refundable:</strong> Lowest risk but may require competitive pricing
        </Box>
      </Box>
    </Box>
  )
}

export default CancellationPolicyBuilder