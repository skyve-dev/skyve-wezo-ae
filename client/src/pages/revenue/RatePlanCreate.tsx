import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { FaSave, FaTimes, FaInfoCircle } from 'react-icons/fa'
import { SecuredPage } from '@/components/SecuredPage'
import { Box } from '@/components'
import Button from '@/components/base/Button'
import Input from '@/components/base/Input'
import SelectionPicker from '@/components/base/SelectionPicker'
import NumberStepperInput from '@/components/base/NumberStepperInput'
import { useAppShell } from '@/components/base/AppShell'
import { createRatePlan } from '@/store/slices/ratePlanSlice'

const RatePlanCreate: React.FC = () => {
  const dispatch = useDispatch()
  const { openDialog, registerNavigationGuard, navigateTo } = useAppShell()
  
  const [formData, setFormData] = useState<{
    name: string
    type: 'FullyFlexible' | 'NonRefundable' | 'Custom'
    description: string
    cancellationPolicy: string
    includesBreakfast: boolean
    percentage: number
  }>({
    name: '',
    type: 'FullyFlexible',
    description: '',
    cancellationPolicy: '',
    includesBreakfast: false,
    percentage: 0
  })
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Register navigation guard for unsaved changes
  React.useEffect(() => {
    if (!hasUnsavedChanges) return

    const cleanup = registerNavigationGuard(async () => {
      const shouldLeave = await openDialog<boolean>((close) => (
        <Box padding="2rem" textAlign="center">
          <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#f59e0b">
            Unsaved Changes
          </Box>
          <Box marginBottom="2rem" color="#374151">
            You have unsaved changes. Are you sure you want to leave?
          </Box>
          <Box display="flex" gap="1rem" justifyContent="center">
            <Button 
              label="Stay"
              onClick={() => close(false)}
              variant="normal"
            />
            <Button 
              label="Yes, Leave"
              onClick={() => close(true)}
              variant="promoted"
            />
          </Box>
        </Box>
      ))
      return shouldLeave
    })

    return cleanup
  }, [hasUnsavedChanges, openDialog, registerNavigationGuard])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await dispatch(createRatePlan('demo', formData) as any)
      setHasUnsavedChanges(false)
      
      // Show success dialog
      await openDialog<void>((close) => (
        <Box padding="2rem" textAlign="center">
          <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#059669">
            Success!
          </Box>
          <Box marginBottom="2rem" color="#374151">
            Rate plan "{formData.name}" has been created successfully.
          </Box>
          <Button 
            label="Continue"
            onClick={() => close()}
            variant="promoted"
          />
        </Box>
      ))
      
      navigateTo('rate-plans', {})
    } catch (error) {
      console.error('Failed to create rate plan:', error)
      
      // Show error dialog
      await openDialog<void>((close) => (
        <Box padding="2rem" textAlign="center">
          <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#dc2626">
            Error
          </Box>
          <Box marginBottom="2rem" color="#374151">
            Failed to create rate plan. Please try again.
          </Box>
          <Button 
            label="Close"
            onClick={() => close()}
            variant="normal"
          />
        </Box>
      ))
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = async () => {
    if (hasUnsavedChanges) {
      const shouldLeave = await openDialog<boolean>((close) => (
        <Box padding="2rem" textAlign="center">
          <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#f59e0b">
            Discard Changes?
          </Box>
          <Box marginBottom="2rem" color="#374151">
            Are you sure you want to discard your changes?
          </Box>
          <Box display="flex" gap="1rem" justifyContent="center">
            <Button 
              label="Keep Editing"
              onClick={() => close(false)}
              variant="normal"
            />
            <Button 
              label="Discard"
              onClick={() => close(true)}
              variant="promoted"
            />
          </Box>
        </Box>
      ))
      
      if (shouldLeave) {
        navigateTo('rate-plans', {})
      }
    } else {
      navigateTo('rate-plans', {})
    }
  }

  const ratePlanTypes = [
    { value: 'FullyFlexible', label: 'Fully Flexible', description: 'Guests can cancel anytime with full refund' },
    { value: 'NonRefundable', label: 'Non-Refundable', description: 'No refunds, but offer lower pricing' },
    { value: 'Custom', label: 'Custom Policy', description: 'Define your own cancellation terms' }
  ]

  return (
    <SecuredPage>
      <Box 
        padding="1rem" 
        paddingMd="2rem" 
        maxWidth="800px" 
        margin="0 auto"
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="start" marginBottom="2rem">
          <Box>
            <h1 style={{ 
              fontSize: window.innerWidth < 480 ? '1.5rem' : '2rem', 
              fontWeight: 'bold', 
              marginBottom: '0.5rem' 
            }}>
              Create Rate Plan
            </h1>
            <p style={{ 
              color: '#6b7280',
              fontSize: window.innerWidth < 480 ? '0.875rem' : '1rem'
            }}>
              Configure a new pricing strategy for your property
            </p>
          </Box>

          <Box display="flex" gap="0.5rem">
            <Button
              label={window.innerWidth < 480 ? "Cancel" : "Cancel"}
              icon={<FaTimes />}
              variant="normal"
              onClick={handleCancel}
              size={window.innerWidth < 480 ? "small" : "medium"}
            />
            <Button
              label={window.innerWidth < 480 ? "Save" : "Save Rate Plan"}
              icon={<FaSave />}
              variant="promoted"
              onClick={handleSave}
              disabled={!formData.name || !formData.cancellationPolicy || isSaving}
              loading={isSaving}
              size={window.innerWidth < 480 ? "small" : "medium"}
            />
          </Box>
        </Box>

        {/* Form Content */}
        <Box display="flex" flexDirection="column" gap="2rem">
          
          {/* Basic Information */}
          <Box>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Basic Information
            </h2>
            
            <Box display="flex" flexDirection="column" gap="1.5rem">
              <Input
                label="Rate Plan Name *"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Flexible Cancellation, Early Bird Special"
                required
                helperText="Choose a clear name that guests will understand"
              />

              <Box>
                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                  Rate Plan Type *
                </label>
                <SelectionPicker
                  data={ratePlanTypes}
                  idAccessor={(item) => item.value}
                  value={formData.type}
                  onChange={(value) => handleInputChange('type', value)}
                  renderItem={(item, _isSelected) => (
                    <Box>
                      <Box fontWeight="500">{item.label}</Box>
                      <Box fontSize="0.875rem" color="#6b7280">{item.description}</Box>
                    </Box>
                  )}
                />
              </Box>

              <Box>
                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description that will be shown to guests"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    resize: 'vertical'
                  }}
                />
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  Optional: Help guests understand what makes this rate plan special
                </p>
              </Box>
            </Box>
          </Box>

          {/* Pricing Configuration */}
          <Box>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Pricing Configuration
            </h2>
            
            <Box display="flex" flexDirection="column" gap="1.5rem">
              <NumberStepperInput
                label="Discount Percentage"
                value={formData.percentage}
                onChange={(value) => handleInputChange('percentage', value)}
                min={0}
                max={50}
                step={5}
                format="integer"
                helperText="Percentage discount applied to base room rates"
                width="200px"
              />

              <Box display="flex" alignItems="center" gap="1rem">
                <input
                  type="checkbox"
                  id="includesBreakfast"
                  checked={formData.includesBreakfast}
                  onChange={(e) => handleInputChange('includesBreakfast', e.target.checked)}
                  style={{ transform: 'scale(1.2)' }}
                />
                <label htmlFor="includesBreakfast" style={{ cursor: 'pointer', fontWeight: '500' }}>
                  Include breakfast with this rate plan
                </label>
              </Box>

              {formData.type === 'NonRefundable' && (
                <Box padding="1rem" backgroundColor="#fef3c7" borderRadius="8px">
                  <Box display="flex" alignItems="start" gap="0.5rem">
                    <FaInfoCircle color="#f59e0b" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <Box>
                      <Box fontWeight="500" color="#92400e" marginBottom="0.25rem">
                        Non-Refundable Rate Plan
                      </Box>
                      <Box fontSize="0.875rem" color="#92400e">
                        This rate plan will automatically apply the discount percentage to encourage bookings, 
                        but guests won't be able to cancel for a refund after booking.
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          {/* Cancellation Policy */}
          <Box>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Cancellation Policy
            </h2>
            
            <Box>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                Cancellation Policy *
              </label>
              <textarea
                value={formData.cancellationPolicy}
                onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
                placeholder={
                  formData.type === 'FullyFlexible' ? 
                  "Free cancellation up to 24 hours before check-in. After that, the first night is non-refundable." :
                  formData.type === 'NonRefundable' ?
                  "This booking is non-refundable. No cancellations or changes allowed after booking confirmation." :
                  "Describe your custom cancellation terms clearly..."
                }
                rows={4}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  resize: 'vertical'
                }}
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                Be clear and specific about your cancellation terms. This will be shown to guests during booking.
              </p>
            </Box>
          </Box>

        </Box>
      </Box>
    </SecuredPage>
  )
}

export default RatePlanCreate