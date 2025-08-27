import React, { useState, useEffect } from 'react'
import { FaInfoCircle } from 'react-icons/fa'
import { SecuredPage } from '@/components/SecuredPage'
import { Box } from '@/components'
import Input from '@/components/base/Input'
import SelectionPicker from '@/components/base/SelectionPicker'
import NumberStepperInput from '@/components/base/NumberStepperInput'
import { useAppShell } from '@/components/base/AppShell'
import { useAppDispatch, useAppSelector } from '@/store'
import { 
  fetchRatePlans,
  createRatePlanAsync,
  updateRatePlanAsync,
  initializeFormForCreate,
  initializeFormForEdit,
  updateFormField,
  resetFormToOriginal,
  clearForm
} from '@/store/slices/ratePlanSlice'
import { fetchMyProperties, setCurrentProperty } from '@/store/slices/propertySlice'
import RatePlanManagerHeader from './RatePlanManagerHeader'
import RatePlanManagerFooter from './RatePlanManagerFooter'

interface RatePlanManagerProps {
  ratePlanId?: string  // 'new' for create mode, actual ID for edit mode
}

const RatePlanManager: React.FC<RatePlanManagerProps> = ({ ratePlanId }) => {
  const dispatch = useAppDispatch()
  const { currentParams } = useAppShell()
  const params = { ratePlanId, ...currentParams }
  
  // Mode detection following PropertyEdit pattern
  const isCreateMode = params.ratePlanId === 'new'
  const isEditMode = !isCreateMode && params.ratePlanId
  
  // Redux state (NO local formData - use Redux for everything)
  const {
    ratePlans,
    currentForm,
    hasUnsavedChanges,
    formValidationErrors,
    isSaving,
    loading,
    error
  } = useAppSelector((state) => state.ratePlan)
  
  // Get property context
  const { currentProperty, properties } = useAppSelector((state) => state.property)
  const propertyId = currentProperty?.propertyId
  
  const { openDialog, registerNavigationGuard, navigateTo, mountHeader, mountFooter } = useAppShell()
  const [isLoading, setIsLoading] = useState(true)
  
  // Load user's properties for selection
  useEffect(() => {
    if (properties.length === 0) {
      dispatch(fetchMyProperties())
    }
  }, [dispatch, properties.length])
  
  // Initialize form based on mode
  useEffect(() => {
    const initialize = async () => {
      if (!propertyId) {
        console.error('No current property found - rate plans require property context')
        setIsLoading(false)
        return
      }
      
      if (isCreateMode) {
        dispatch(initializeFormForCreate(propertyId))
      } else if (isEditMode && params.ratePlanId) {
        // Load rate plans if not in store or property changed
        if (ratePlans.length === 0) {
          try {
            await dispatch(fetchRatePlans(propertyId)).unwrap()
          } catch (error) {
            console.error('Failed to fetch rate plans:', error)
          }
        }
        
        // Find existing rate plan
        const existingPlan = ratePlans.find(plan => plan.id === params.ratePlanId)
        if (existingPlan) {
          dispatch(initializeFormForEdit(existingPlan))
        }
      }
      setIsLoading(false)
    }
    
    initialize()
  }, [isCreateMode, isEditMode, params.ratePlanId, ratePlans, currentProperty, dispatch])
  
  // Mount header and footer using AppShell
  useEffect(() => {
    const title = isCreateMode ? 'Create Rate Plan' : `Edit ${currentForm?.name || 'Rate Plan'}`
    
    const unmountHeader = mountHeader(
      <RatePlanManagerHeader title={title} onBack={handleBack} />
    )
    
    let unmountFooter: (() => void) | null = null
    if (hasUnsavedChanges) {
      unmountFooter = mountFooter(
        <RatePlanManagerFooter
          onSave={handleSave}
          onDiscard={handleDiscard}
          isSaving={isSaving}
          hasErrors={Object.keys(formValidationErrors).length > 0 || !isFormValid()}
        />,
        { visibility: 'persistent' }
      )
    }
    
    return () => {
      unmountHeader()
      unmountFooter?.()
    }
  }, [hasUnsavedChanges, isSaving, formValidationErrors, currentForm, isCreateMode])
  
  // Navigation guard for unsaved changes
  useEffect(() => {
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
            <Box>
              <button 
                onClick={() => close(false)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                Stay
              </button>
            </Box>
            <Box>
              <button 
                onClick={() => close(true)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                Yes, Leave
              </button>
            </Box>
          </Box>
        </Box>
      ))
      return shouldLeave
    })
    
    return cleanup
  }, [hasUnsavedChanges, registerNavigationGuard, openDialog])
  
  // Form validation
  const isFormValid = () => {
    if (!currentForm) return false
    if (!propertyId) return false // Must have property selected
    return !!(currentForm.name && currentForm.cancellationPolicy)
  }
  
  // Unified save handler
  const handleSave = async () => {
    if (!currentForm) return
    
    try {
      if (isCreateMode) {
        await dispatch(createRatePlanAsync({ 
          propertyId: propertyId!,
          data: currentForm 
        })).unwrap()
      } else if (isEditMode && params.ratePlanId) {
        await dispatch(updateRatePlanAsync({ 
          propertyId: propertyId!,
          ratePlanId: params.ratePlanId, 
          data: currentForm 
        })).unwrap()
      }
      
      // Show success dialog
      await openDialog<void>((close) => (
        <Box padding="2rem" textAlign="center">
          <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#059669">
            Success!
          </Box>
          <Box marginBottom="2rem" color="#374151">
            Rate plan "{currentForm.name}" has been {isCreateMode ? 'created' : 'updated'} successfully.
          </Box>
          <Box>
            <button
              onClick={() => close()}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
            >
              Continue
            </button>
          </Box>
        </Box>
      ))
      
      navigateTo('rate-plans', {})
    } catch (error) {
      // Error dialog will be shown by Redux state
    }
  }
  
  // Smart back button
  const handleBack = async () => {
    if (hasUnsavedChanges) {
      const shouldSaveAndLeave = await openDialog<boolean>((close) => (
        <Box padding="2rem" textAlign="center">
          <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#f59e0b">
            Unsaved Changes
          </Box>
          <Box marginBottom="2rem" color="#374151">
            Do you want to save your changes before leaving?
          </Box>
          <Box display="flex" gap="1rem" justifyContent="center">
            <Box>
              <button 
                onClick={() => close(false)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                Leave Without Saving
              </button>
            </Box>
            <Box>
              <button 
                onClick={() => close(true)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                Save & Leave
              </button>
            </Box>
          </Box>
        </Box>
      ))
      
      if (shouldSaveAndLeave) {
        await handleSave()
        return
      }
    }
    
    dispatch(clearForm())
    navigateTo('rate-plans', {})
  }
  
  // Handle discard changes
  const handleDiscard = async () => {
    const shouldDiscard = await openDialog<boolean>((close) => (
      <Box padding="2rem" textAlign="center">
        <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#f59e0b">
          Discard Changes?
        </Box>
        <Box marginBottom="2rem" color="#374151">
          Are you sure you want to discard all unsaved changes?
        </Box>
        <Box display="flex" gap="1rem" justifyContent="center">
          <Box>
            <button 
              onClick={() => close(false)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
            >
              Keep Editing
            </button>
          </Box>
          <Box>
            <button 
              onClick={() => close(true)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
            >
              Discard
            </button>
          </Box>
        </Box>
      </Box>
    ))
    
    if (shouldDiscard) {
      dispatch(resetFormToOriginal())
    }
  }
  
  // Handle form field changes
  const handleFieldChange = (field: string, value: any) => {
    dispatch(updateFormField({ [field]: value }))
  }

  // Handle property selection
  const handlePropertyChange = (value: string | number | (string | number)[]) => {
    const selectedPropertyId = value as string
    const selectedProperty = properties.find(p => p.propertyId === selectedPropertyId)
    if (selectedProperty) {
      dispatch(setCurrentProperty(selectedProperty))
      // Re-initialize form for the new property
      if (isCreateMode) {
        dispatch(initializeFormForCreate(selectedPropertyId))
      }
    }
  }
  
  const ratePlanTypes = [
    { value: 'FullyFlexible', label: 'Fully Flexible', description: 'Guests can cancel anytime with full refund' },
    { value: 'NonRefundable', label: 'Non-Refundable', description: 'No refunds, but offer lower pricing' },
    { value: 'Custom', label: 'Custom Policy', description: 'Define your own cancellation terms' }
  ]
  
  if (isLoading || loading) {
    return (
      <SecuredPage>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Box textAlign="center">
            <Box fontSize="1.125rem" marginBottom="0.5rem">Loading...</Box>
            <Box color="#6b7280">
              {isCreateMode ? 'Setting up form for new rate plan' : 'Loading rate plan details'}
            </Box>
          </Box>
        </Box>
      </SecuredPage>
    )
  }

  if (!propertyId) {
    return (
      <SecuredPage>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Box textAlign="center">
            <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#dc2626">
              No Property Selected
            </Box>
            <Box marginBottom="2rem" color="#374151">
              Rate plans must be linked to a property. Please select a property first.
            </Box>
            <Box>
              <button
                onClick={() => navigateTo('properties', {})}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                Select Property
              </button>
            </Box>
          </Box>
        </Box>
      </SecuredPage>
    )
  }
  
  if (isEditMode && !currentForm) {
    return (
      <SecuredPage>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Box textAlign="center">
            <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#dc2626">
              Rate Plan Not Found
            </Box>
            <Box marginBottom="2rem" color="#374151">
              The rate plan you're looking for doesn't exist.
            </Box>
            <Box>
              <button
                onClick={() => navigateTo('rate-plans', {})}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                Back to Rate Plans
              </button>
            </Box>
          </Box>
        </Box>
      </SecuredPage>
    )
  }
  
  if (!currentForm) {
    return null
  }
  
  // Render unified form (same for both create/edit)
  return (
    <SecuredPage>
      <Box padding="1rem" paddingMd="2rem" maxWidth="800px" margin="0 auto">
        {/* Error Display */}
        {error && (
          <Box
            marginBottom="2rem"
            padding="1rem"
            backgroundColor="#fee2e2"
            color="#dc2626"
            borderRadius="8px"
            fontSize="0.875rem"
          >
            <Box fontWeight="600" marginBottom="0.5rem">Error</Box>
            <Box>{error}</Box>
          </Box>
        )}
        
        {/* Form sections */}
        <Box display="flex" flexDirection="column" gap="2rem">
          
          {/* Basic Information */}
          <Box>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Basic Information
            </h2>
            
            <Box display="flex" flexDirection="column" gap="1.5rem">
              {/* Property Selection */}
              <Box>
                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                  Property *
                </label>
                <SelectionPicker
                  data={properties}
                  idAccessor={(property) => property.propertyId!}
                  value={(propertyId ?? '') as string}
                  onChange={handlePropertyChange}
                  disabled={!!isEditMode} // Can't change property in edit mode
                  renderItem={(property, _isSelected) => (
                    <Box>
                      <Box fontWeight="500">{property.name}</Box>
                      <Box fontSize="0.875rem" color="#6b7280">
                        {property.address?.city && `${property.address.city}, `}
                        {property.address?.countryOrRegion || 'No address'}
                      </Box>
                    </Box>
                  )}
                />
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  {isCreateMode 
                    ? 'Choose which property this rate plan will be attached to'
                    : 'Property associated with this rate plan'
                  }
                </p>
              </Box>

              <Input
                label="Rate Plan Name *"
                value={currentForm.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
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
                  value={currentForm.type}
                  onChange={(value) => handleFieldChange('type', value)}
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
                  value={currentForm.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
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
                value={currentForm.percentage}
                onChange={(value) => handleFieldChange('percentage', value)}
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
                  checked={currentForm.includesBreakfast}
                  onChange={(e) => handleFieldChange('includesBreakfast', e.target.checked)}
                  style={{ transform: 'scale(1.2)' }}
                />
                <label htmlFor="includesBreakfast" style={{ cursor: 'pointer', fontWeight: '500' }}>
                  Include breakfast with this rate plan
                </label>
              </Box>

              {currentForm.type === 'NonRefundable' && (
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
                value={currentForm.cancellationPolicy}
                onChange={(e) => handleFieldChange('cancellationPolicy', e.target.value)}
                placeholder={
                  currentForm.type === 'FullyFlexible' ? 
                  "Free cancellation up to 24 hours before check-in. After that, the first night is non-refundable." :
                  currentForm.type === 'NonRefundable' ?
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

export default RatePlanManager