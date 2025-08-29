import React, { useState, useEffect } from 'react'
import { 
  FaInfoCircle, FaBuilding, FaTags, FaCalculator, FaLayerGroup, 
  FaTag, FaDollarSign, FaSortNumericUp, FaUndo, FaBan, FaPercent
} from 'react-icons/fa'
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
  clearForm,
  type CancellationPolicy
} from '@/store/slices/ratePlanSlice'
import { fetchMyProperties, setCurrentProperty } from '@/store/slices/propertySlice'
import { ApiError } from '@/utils/api'
import useErrorHandler from '@/hooks/useErrorHandler'
import RatePlanManagerHeader from './RatePlanManagerHeader'
import RatePlanManagerFooter from './RatePlanManagerFooter'
import CancellationPolicyBuilder from '@/components/CancellationPolicyBuilder'
import RatePlanRestrictionsBuilder from '@/components/RatePlanRestrictionsBuilder'

interface RatePlanManagerProps {
  ratePlanId?: string  // 'new' for create mode, actual ID for edit mode
}

const RatePlanManager: React.FC<RatePlanManagerProps> = ({ ratePlanId }) => {
  const dispatch = useAppDispatch()
  const { showApiError, showSuccess } = useErrorHandler()
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
  
  const { openDialog, navigateTo, mountHeader, mountFooter } = useAppShell()
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
            if (error instanceof ApiError) {
              await showApiError(error, 'Rate Plans Loading')
            } else {
              await showApiError(
                new ApiError('Failed to load rate plans', 500, undefined, 'Unable to fetch rate plans'),
                'Rate Plans Loading'
              )
            }
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
  
  
  // Form validation
  const isFormValid = () => {
    if (!currentForm) return false
    if (!propertyId) return false // Must have property selected
    
    // Check required fields
    if (!currentForm.name) return false
    
    // Check cancellation policy has at least one tier
    const policy = currentForm.cancellationPolicy as CancellationPolicy | null
    if (!policy || !policy.tiers || policy.tiers.length === 0) return false
    
    return true
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
      
      // IMPORTANT: Wait a brief moment for Redux state to update (hasUnsavedChanges = false)
      // This ensures the navigation guard cleanup happens before navigation
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Show success dialog
      await showSuccess(`Rate plan "${currentForm.name}" has been ${isCreateMode ? 'created' : 'updated'} successfully.`)
      
      // Navigation guard should now be automatically removed since hasUnsavedChanges = false
      navigateTo('rate-plans', {})
    } catch (error) {
      // Handle different types of errors
      if (error instanceof ApiError) {
        await showApiError(error, `Rate Plan ${isCreateMode ? 'Creation' : 'Update'}`)
      } else if (typeof error === 'string') {
        await showApiError(new ApiError(error, 400, undefined, error), `Rate Plan ${isCreateMode ? 'Creation' : 'Update'}`)
      } else {
        await showApiError(
          new ApiError('An unexpected error occurred', 500, undefined, `Failed to ${isCreateMode ? 'create' : 'update'} rate plan`),
          `Rate Plan ${isCreateMode ? 'Creation' : 'Update'}`
        )
      }
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
                  <Box display="flex" alignItems="center" gap="0.5rem">
                    <FaBuilding style={{color: '#374151', fontSize: '0.875rem'}} />
                    Property *
                  </Box>
                </label>
                <SelectionPicker
                  data={properties}
                  idAccessor={(property) => property.propertyId!}
                  value={(propertyId ?? '') as string}
                  onChange={handlePropertyChange}
                  disabled={!!isEditMode} // Can't change property in edit mode
                  renderItem={(property, _isSelected) => (
                    <Box display="flex" alignItems="center" gap="0.75rem">
                      <FaBuilding style={{color: '#6b7280', fontSize: '1rem'}} />
                      <Box>
                        <Box fontWeight="500">{property.name}</Box>
                        <Box fontSize="0.875rem" color="#6b7280">
                          {property.address?.city && `${property.address.city}, `}
                          {property.address?.countryOrRegion || 'No address'}
                        </Box>
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
                icon={FaTag}
                value={currentForm.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="e.g., Flexible Cancellation, Early Bird Special"
                required
                helperText="Choose a clear name that guests will understand"
              />

              <Box>
                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                  <Box display="flex" alignItems="center" gap="0.5rem">
                    <FaTags style={{color: '#374151', fontSize: '0.875rem'}} />
                    Rate Plan Type *
                  </Box>
                </label>
                <SelectionPicker
                  data={ratePlanTypes}
                  idAccessor={(item) => item.value}
                  value={currentForm.type}
                  onChange={(value) => handleFieldChange('type', value)}
                  renderItem={(item, _isSelected) => (
                    <Box display="flex" alignItems="center" gap="0.75rem">
                      {item.value === 'Flexible' ? (
                        <FaUndo style={{color: '#10b981', fontSize: '1rem'}} />
                      ) : (
                        <FaBan style={{color: '#ef4444', fontSize: '1rem'}} />
                      )}
                      <Box>
                        <Box fontWeight="500">{item.label}</Box>
                        <Box fontSize="0.875rem" color="#6b7280">{item.description}</Box>
                      </Box>
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

          {/* Pricing Configuration - Updated for new backend schema */}
          <Box>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Pricing Configuration
            </h2>
            
            <Box display="flex" flexDirection="column" gap="1.5rem">
              {/* Adjustment Type Selection */}
              <Box>
                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                  <Box display="flex" alignItems="center" gap="0.5rem">
                    <FaCalculator style={{color: '#374151', fontSize: '0.875rem'}} />
                    Pricing Type *
                  </Box>
                </label>
                <SelectionPicker
                  data={[
                    { value: 'FixedPrice', label: 'Fixed Price', description: 'Set a specific price amount' },
                    { value: 'Percentage', label: 'Percentage Adjustment', description: 'Percentage increase/decrease from base rate plan' },
                    { value: 'FixedDiscount', label: 'Fixed Discount', description: 'Fixed amount discount from base rate plan' }
                  ]}
                  idAccessor={(item) => item.value}
                  value={currentForm.adjustmentType}
                  onChange={(value) => handleFieldChange('adjustmentType', value)}
                  renderItem={(item, _isSelected) => (
                    <Box display="flex" alignItems="center" gap="0.75rem">
                      {item.value === 'FixedPrice' ? (
                        <FaDollarSign style={{color: '#10b981', fontSize: '1rem'}} />
                      ) : item.value === 'Percentage' ? (
                        <FaPercent style={{color: '#3b82f6', fontSize: '1rem'}} />
                      ) : (
                        <FaTag style={{color: '#f59e0b', fontSize: '1rem'}} />
                      )}
                      <Box>
                        <Box fontWeight="500">{item.label}</Box>
                        <Box fontSize="0.875rem" color="#6b7280">{item.description}</Box>
                      </Box>
                    </Box>
                  )}
                />
              </Box>
              
              {/* Base Rate Plan Selection (only for Percentage and FixedDiscount) */}
              {(currentForm.adjustmentType === 'Percentage' || currentForm.adjustmentType === 'FixedDiscount') && (
                <Box>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                    <Box display="flex" alignItems="center" gap="0.5rem">
                      <FaLayerGroup style={{color: '#374151', fontSize: '0.875rem'}} />
                      Base Rate Plan *
                    </Box>
                  </label>
                  <SelectionPicker
                    data={ratePlans.filter(rp => rp.adjustmentType === 'FixedPrice' && rp.id !== currentForm.id)}
                    idAccessor={(rp) => rp.id}
                    value={currentForm.baseRatePlanId || ''}
                    onChange={(value) => handleFieldChange('baseRatePlanId', value)}
                    renderItem={(ratePlan, _isSelected) => (
                      <Box display="flex" alignItems="center" gap="0.75rem">
                        <FaLayerGroup style={{color: '#6b7280', fontSize: '1rem'}} />
                        <Box>
                          <Box fontWeight="500">{ratePlan.name}</Box>
                          <Box fontSize="0.875rem" color="#6b7280">Priority: {ratePlan.priority}</Box>
                        </Box>
                      </Box>
                    )}
                  />
                  {ratePlans.filter(rp => rp.adjustmentType === 'FixedPrice').length === 0 && (
                    <Box padding="0.75rem" backgroundColor="#fef3c7" borderRadius="6px" marginTop="0.5rem">
                      <Box fontSize="0.875rem" color="#92400e">
                        ⚠️ You need to create a Fixed Price rate plan first before creating percentage-based plans.
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
              
              {/* Adjustment Value */}
              <NumberStepperInput
                label={currentForm.adjustmentType === 'FixedPrice' ? 'Price per Night (AED)' : 
                       currentForm.adjustmentType === 'Percentage' ? 'Percentage Adjustment (%)' : 
                       'Discount Amount (AED)'}
                icon={currentForm.adjustmentType === 'FixedPrice' ? FaDollarSign :
                      currentForm.adjustmentType === 'Percentage' ? FaPercent : FaTag}
                value={currentForm.adjustmentValue}
                onChange={(value) => handleFieldChange('adjustmentValue', value)}
                min={currentForm.adjustmentType === 'Percentage' ? -100 : 0}
                max={currentForm.adjustmentType === 'FixedPrice' ? 50000 : 
                     currentForm.adjustmentType === 'Percentage' ? 100 : 10000}
                step={currentForm.adjustmentType === 'FixedPrice' ? 100 : 
                      currentForm.adjustmentType === 'Percentage' ? 5 : 100}
                format={currentForm.adjustmentType === 'Percentage' ? 'integer' : 'currency'}
                currency={currentForm.adjustmentType === 'Percentage' ? undefined : 'AED'}
                currencyPosition={currentForm.adjustmentType === 'Percentage' ? undefined : 'prefix'}
                helperText={
                  currentForm.adjustmentType === 'FixedPrice' ? 'Base price per night for this rate plan' :
                  currentForm.adjustmentType === 'Percentage' ? 'Positive % increases price, negative % decreases price' :
                  'Fixed amount to discount from the base rate plan'
                }
                width="250px"
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
              
              {/* Priority and Concurrency Settings */}
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem">
                <NumberStepperInput
                  label="Priority"
                  icon={FaSortNumericUp}
                  value={currentForm.priority}
                  onChange={(value) => handleFieldChange('priority', value)}
                  min={1}
                  max={1000}
                  step={10}
                  format="integer"
                  helperText="Lower numbers = higher priority (1 = highest)"
                  width="150px"
                />
                
                <Box>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                    Rate Plan Availability
                  </label>
                  <Box display="flex" alignItems="center" gap="1rem">
                    <input
                      type="checkbox"
                      id="allowConcurrentRates"
                      checked={currentForm.allowConcurrentRates}
                      onChange={(e) => handleFieldChange('allowConcurrentRates', e.target.checked)}
                      style={{ transform: 'scale(1.2)' }}
                    />
                    <label htmlFor="allowConcurrentRates" style={{ cursor: 'pointer', fontWeight: '400' }}>
                      Allow with other rate plans
                    </label>
                  </Box>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    When unchecked, this rate plan will override all others
                  </p>
                </Box>
              </Box>
              
              {/* Active Days Selection */}
              <Box>
                <label style={{display: 'block', marginBottom: '0.75rem', fontWeight: '500'}}>
                  Active Days *
                </label>
                <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" gap="0.5rem" maxWidth="400px">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <Box key={day} textAlign="center">
                      <label style={{ cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}>
                        <input
                          type="checkbox"
                          checked={currentForm.activeDays.includes(index)}
                          onChange={(e) => {
                            const newActiveDays = e.target.checked
                              ? [...currentForm.activeDays, index]
                              : currentForm.activeDays.filter(d => d !== index)
                            handleFieldChange('activeDays', newActiveDays.sort())
                          }}
                          style={{ marginBottom: '0.25rem', transform: 'scale(1.1)' }}
                        />
                        <br />
                        {day}
                      </label>
                    </Box>
                  ))}
                </Box>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  Select the days when this rate plan is available for booking
                </p>
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
                        This rate plan will automatically apply the pricing adjustment to encourage bookings, 
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
            
            <CancellationPolicyBuilder
              policy={currentForm.cancellationPolicy as CancellationPolicy | null}
              onChange={(policy) => handleFieldChange('cancellationPolicy', policy)}
              ratePlanId={currentForm.id || 'new'}
            />
          </Box>

          {/* Rate Plan Restrictions */}
          <Box>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Booking Restrictions
            </h2>
            
            <RatePlanRestrictionsBuilder
              restrictions={currentForm.ratePlanRestrictions || []}
              onChange={(restrictions) => handleFieldChange('ratePlanRestrictions', restrictions)}
              ratePlanId={currentForm.id || 'new'}
            />
          </Box>

        </Box>
      </Box>
    </SecuredPage>
  )
}

export default RatePlanManager