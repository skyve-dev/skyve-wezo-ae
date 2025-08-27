import React, { useState, useEffect } from 'react'
import { Box } from './base/Box'
import { Button } from './base/Button'
import Tab from './base/Tab'
import { NumberStepperInput } from './base/NumberStepperInput'
import { Input } from './base/Input'
import Dialog from './base/Dialog'
import { FaPlus, FaTrash, FaEye, FaClock, FaPercentage, FaCalendarAlt } from 'react-icons/fa'
import { CancellationPolicy, CancellationTier } from '@/store/slices/ratePlanSlice'

interface CancellationPolicyBuilderProps {
  policy?: CancellationPolicy | null
  onChange: (policy: CancellationPolicy | null) => void
  ratePlanId: string
}

type PolicyPreset = 'flexible' | 'moderate' | 'strict' | 'custom'

const POLICY_PRESETS: Record<PolicyPreset, { label: string; tiers: Omit<CancellationTier, 'id'>[] }> = {
  flexible: {
    label: 'Flexible',
    tiers: [
      { daysBeforeCheckIn: 1, refundPercentage: 100, description: 'Free cancellation until 24 hours before check-in' }
    ]
  },
  moderate: {
    label: 'Moderate',
    tiers: [
      { daysBeforeCheckIn: 7, refundPercentage: 50, description: 'Partial refund up to 7 days before' },
      { daysBeforeCheckIn: 1, refundPercentage: 25, description: 'Limited refund until 24 hours before' }
    ]
  },
  strict: {
    label: 'Strict',
    tiers: [
      { daysBeforeCheckIn: 14, refundPercentage: 50, description: 'Partial refund up to 2 weeks before' },
      { daysBeforeCheckIn: 0, refundPercentage: 0, description: 'Non-refundable within 2 weeks' }
    ]
  },
  custom: {
    label: 'Custom',
    tiers: []
  }
}

const CancellationPolicyBuilder: React.FC<CancellationPolicyBuilderProps> = ({
  policy,
  onChange,
  ratePlanId
}) => {
  const [selectedPreset, setSelectedPreset] = useState<PolicyPreset>('flexible')
  const [tiers, setTiers] = useState<CancellationTier[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [tierToDelete, setTierToDelete] = useState<string | null>(null)

  // Initialize tiers based on existing policy or preset
  useEffect(() => {
    if (policy && policy.tiers.length > 0) {
      setTiers(policy.tiers)
      setSelectedPreset('custom')
    } else {
      // Apply default preset
      applyPreset('flexible')
    }
  }, [policy])

  const applyPreset = (preset: PolicyPreset) => {
    setSelectedPreset(preset)
    
    if (preset === 'custom') {
      // Keep existing tiers for custom
      return
    }

    const presetConfig = POLICY_PRESETS[preset]
    const newTiers: CancellationTier[] = presetConfig.tiers.map((tier, index) => ({
      ...tier,
      id: `tier_${Date.now()}_${index}`
    }))
    
    setTiers(newTiers)
    updatePolicy(newTiers)
  }

  const updatePolicy = (updatedTiers: CancellationTier[]) => {
    // Sort tiers by days descending (furthest from check-in first)
    const sortedTiers = [...updatedTiers].sort((a, b) => b.daysBeforeCheckIn - a.daysBeforeCheckIn)
    
    setTiers(sortedTiers)
    
    if (sortedTiers.length === 0) {
      onChange(null)
    } else {
      const newPolicy: CancellationPolicy = {
        id: policy?.id || `policy_${Date.now()}`,
        ratePlanId,
        tiers: sortedTiers
      }
      onChange(newPolicy)
    }
  }

  const addTier = () => {
    const newTier: CancellationTier = {
      id: `tier_${Date.now()}`,
      daysBeforeCheckIn: 3,
      refundPercentage: 75,
      description: 'Custom cancellation tier'
    }
    
    const updatedTiers = [...tiers, newTier]
    updatePolicy(updatedTiers)
    setSelectedPreset('custom')
  }

  const updateTier = (tierId: string, field: keyof CancellationTier, value: any) => {
    const updatedTiers = tiers.map(tier => 
      tier.id === tierId ? { ...tier, [field]: value } : tier
    )
    updatePolicy(updatedTiers)
    setSelectedPreset('custom')
  }

  const deleteTier = (tierId: string) => {
    const updatedTiers = tiers.filter(tier => tier.id !== tierId)
    updatePolicy(updatedTiers)
    setTierToDelete(null)
    
    // If no tiers left, switch to flexible
    if (updatedTiers.length === 0) {
      setTimeout(() => applyPreset('flexible'), 100)
    }
  }

  const tabData = [
    { id: 'flexible', label: 'Flexible', icon: <FaClock /> },
    { id: 'moderate', label: 'Moderate', icon: <FaCalendarAlt /> },
    { id: 'strict', label: 'Strict', icon: <FaPercentage /> },
    { id: 'custom', label: 'Custom', icon: <FaPlus /> }
  ]

  return (
    <Box display="flex" flexDirection="column" gap="1.5rem">
      {/* Policy Type Selector */}
      <Box>
        <Box fontSize="1rem" fontWeight="600" marginBottom="0.75rem" color="#374151">
          Cancellation Policy Type
        </Box>
        
        <Tab
          items={tabData.map(item => ({
            id: item.id,
            label: item.label,
            icon: item.icon,
            content: <div /> // Not needed for our use case
          }))}
          activeTab={selectedPreset}
          onTabChange={(preset: string) => applyPreset(preset as PolicyPreset)}
          variant="pills"
          size="small"
        />
        
        <Box fontSize="0.875rem" color="#6b7280" marginTop="0.5rem">
          {selectedPreset !== 'custom' && POLICY_PRESETS[selectedPreset].tiers.length > 0 && 
            `${POLICY_PRESETS[selectedPreset].tiers.length} tier${POLICY_PRESETS[selectedPreset].tiers.length > 1 ? 's' : ''} - Choose Custom to modify`
          }
          {selectedPreset === 'custom' && 'Build your own cancellation policy with custom tiers'}
        </Box>
      </Box>

      {/* Tiers Section */}
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom="1rem">
          <Box fontSize="1rem" fontWeight="600" color="#374151">
            Cancellation Tiers ({tiers.length})
          </Box>
          
          <Box display="flex" alignItems="center" gap="0.75rem">
            <Button
              label={showPreview ? 'Hide Preview' : 'Preview'}
              icon={<FaEye />}
              onClick={() => setShowPreview(!showPreview)}
              variant="plain"
              size="small"
            />
            
            <Button
              label="Add Tier"
              icon={<FaPlus />}
              onClick={addTier}
              variant="normal"
              size="small"
            />
          </Box>
        </Box>

        {/* Tier Cards */}
        <Box display="flex" flexDirection="column" gap="1rem">
          {tiers.map((tier, index) => (
            <Box
              key={tier.id}
              padding="1.5rem"
              backgroundColor="#f9fafb"
              borderRadius="12px"
              border="1px solid #e5e7eb"
            >
              <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom="1rem">
                <Box display="flex" alignItems="center" gap="0.5rem">
                  <Box
                    backgroundColor="#2563eb"
                    color="white"
                    padding="0.25rem 0.75rem"
                    borderRadius="16px"
                    fontSize="0.75rem"
                    fontWeight="600"
                  >
                    Tier {index + 1}
                  </Box>
                  <Box fontSize="0.875rem" color="#6b7280">
                    {tier.daysBeforeCheckIn === 0 
                      ? 'Same day cancellation' 
                      : `${tier.daysBeforeCheckIn}+ days before check-in`
                    }
                  </Box>
                </Box>
                
                {tiers.length > 1 && (
                  <Button
                    label=""
                    icon={<FaTrash />}
                    onClick={() => setTierToDelete(tier.id)}
                    variant="plain"
                    size="small"
                    style={{ color: '#dc2626', borderColor: '#dc2626' }}
                  />
                )}
              </Box>
              
              <Box display="grid" gridTemplateColumns="1fr 1fr" gridTemplateColumnsSm="1fr" gap="1rem" marginBottom="1rem">
                <NumberStepperInput
                  label="Days Before Check-in"
                  value={tier.daysBeforeCheckIn}
                  onChange={(value) => updateTier(tier.id, 'daysBeforeCheckIn', value)}
                  min={0}
                  max={365}
                  step={1}
                  format="integer"
                  helperText="0 = same day, 1 = 24 hours before"
                  width="100%"
                />
                
                <NumberStepperInput
                  label="Refund Percentage"
                  value={tier.refundPercentage}
                  onChange={(value) => updateTier(tier.id, 'refundPercentage', value)}
                  min={0}
                  max={100}
                  step={5}
                  format="integer"
                  helperText="0% = no refund, 100% = full refund"
                  width="100%"
                />
              </Box>
              
              <Input
                label="Description (Optional)"
                value={tier.description || ''}
                onChange={(value) => updateTier(tier.id, 'description', value)}
                placeholder="Explain this cancellation tier to guests..."
                helperText="This will be shown to guests during booking"
              />
            </Box>
          ))}
          
          {tiers.length === 0 && (
            <Box
              padding="2rem"
              textAlign="center"
              backgroundColor="#f3f4f6"
              borderRadius="12px"
              border="2px dashed #d1d5db"
            >
              <Box fontSize="1rem" color="#6b7280" marginBottom="1rem">
                No cancellation tiers configured
              </Box>
              <Button
                label="Add First Tier"
                icon={<FaPlus />}
                onClick={addTier}
                variant="normal"
                size="medium"
              />
            </Box>
          )}
        </Box>
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
            <FaEye color="#2563eb" />
            <Box fontSize="1rem" fontWeight="600" color="#1e40af">
              Guest View Preview
            </Box>
          </Box>
          
          <Box fontSize="0.875rem" color="#374151" marginBottom="1rem">
            "If you cancel your booking:"
          </Box>
          
          <Box display="flex" flexDirection="column" gap="0.5rem">
            {tiers.map((tier) => (
              <Box key={tier.id} display="flex" alignItems="start" gap="0.5rem">
                <Box color="#2563eb" marginTop="0.125rem">•</Box>
                <Box fontSize="0.875rem" color="#374151">
                  <strong>
                    {tier.daysBeforeCheckIn === 0 
                      ? 'Same day: ' 
                      : `${tier.daysBeforeCheckIn}+ days before: `
                    }
                  </strong>
                  {tier.refundPercentage === 0 && 'No refund'}
                  {tier.refundPercentage === 100 && 'Full refund'}
                  {tier.refundPercentage > 0 && tier.refundPercentage < 100 && `${tier.refundPercentage}% refund`}
                  {tier.description && (
                    <Box fontSize="0.8125rem" color="#6b7280" marginTop="0.25rem">
                      {tier.description}
                    </Box>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
          
          {tiers.length === 0 && (
            <Box fontSize="0.875rem" color="#6b7280" fontStyle="italic">
              No cancellation policy configured
            </Box>
          )}
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      {tierToDelete && (
        <Dialog
          isOpen={true}
          onClose={() => setTierToDelete(null)}
          width="400px"
        >
          <Box padding="2rem">
            <Box fontSize="1.25rem" fontWeight="600" marginBottom="1rem">
              Delete Cancellation Tier
            </Box>
            <Box marginBottom="2rem">
              Are you sure you want to delete this cancellation tier? This action cannot be undone.
            </Box>
            <Box display="flex" gap="0.75rem" justifyContent="flex-end">
              <Button
                label="Cancel"
                onClick={() => setTierToDelete(null)}
                variant="plain"
              />
              <Button
                label="Delete Tier"
                onClick={() => deleteTier(tierToDelete)}
                style={{ backgroundColor: '#dc2626', color: 'white' }}
              />
            </Box>
          </Box>
        </Dialog>
      )}
    </Box>
  )
}

export default CancellationPolicyBuilder