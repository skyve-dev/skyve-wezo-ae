import React, { useState, useEffect } from 'react'
import { 
  IoIosBuild, IoIosPricetags, IoIosCalculator, 
  IoIosArrowUp, IoIosCash, IoIosPeople,
  IoIosCalendar, IoIosTime, IoIosBusiness, IoIosPin
} from 'react-icons/io'
import { SecuredPage } from '@/components/SecuredPage'
import { Box } from '@/components'
import Input from '@/components/base/Input'
import Button from '@/components/base/Button'
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
import { fetchMyProperties } from '@/store/slices/propertySlice'
import { ApiError, resolvePhotoUrl } from '@/utils/api'
import useErrorHandler from '@/hooks/useErrorHandler'
import { useDialogs } from '@/hooks/useDialogs'
import RatePlanManagerHeader from './RatePlanManagerHeader'
import RatePlanManagerFooter from './RatePlanManagerFooter'
import CancellationPolicyBuilder from '@/components/CancellationPolicyBuilder'
import RatePlanAmenitySelector from '@/components/RatePlanAmenitySelector'
import RatePlanPricingPreview from '@/components/RatePlanPricingPreview'

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
  
  // Get property context - prefer propertyId from params, fallback to currentProperty
  const { currentProperty, properties } = useAppSelector((state) => state.property)
  const propertyId = currentProperty?.propertyId
  
  const { openDialog, navigateTo, mountHeader, mountFooter } = useAppShell()
  const dialogs = useDialogs()
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
        // No property selected - will be handled by PropertySelector UI
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
  
  // Navigation guard removed - no more annoying confirmations
  
  // Form validation
  const isFormValid = () => {
    if (!currentForm) return false
    if (!propertyId) return false // Must have property selected
    
    // Check required fields: name and priceModifierType
    if (!currentForm.name) return false
    if (!currentForm.priceModifierType) return false
    
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
      
      // Clear the form immediately after successful save
      // This will trigger the useEffect to clean up the navigation guard
      dispatch(clearForm())
      
      // Show success dialog
      await showSuccess(`Rate plan "${currentForm.name}" has been ${isCreateMode ? 'created' : 'updated'} successfully.`)
      
      // Navigate away
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
  
  // Simple back navigation - no more confirmations
  const handleBack = () => {
    navigateTo('rate-plans', {})
  }
  
  // Handle discard changes - no more confirmations
  const handleDiscard = () => {
    dispatch(resetFormToOriginal())
  }
  
  // Handle form field changes
  const handleFieldChange = (field: string, value: any) => {
    dispatch(updateFormField({ [field]: value }))
  }

  
  const modifierTypeOptions = [
    { 
      value: 'Percentage', 
      label: 'Percentage Modifier', 
      description: 'Adjust base prices by percentage (+10% or -15%)',
      icon: <IoIosCalculator style={{ color: '#3b82f6' }} />
    },
    { 
      value: 'FixedAmount', 
      label: 'Fixed Amount Modifier', 
      description: 'Add or subtract fixed amount (+100 AED or -50 AED)',
      icon: <IoIosCash style={{ color: '#059669' }} />
    }
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
        <Box padding="2rem" maxWidth="600px" margin="0 auto">
          <Box textAlign="center" marginBottom="3rem">
            <Box fontSize="2rem" fontWeight="bold" marginBottom="0.5rem">
              No Property Selected
            </Box>
            <Box color="#6b7280" marginBottom="2rem">
              Please select a property first to create rate plans.
            </Box>
            <Button 
              label="Go to Properties" 
              onClick={() => navigateTo('properties', {})} 
              variant="promoted"
            />
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
            <Button 
              label="Back to Rate Plans" 
              onClick={() => navigateTo('rate-plans', {})} 
              variant="promoted" 
            />
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
      <Box padding="1rem" paddingMd="2rem" maxWidth="1000px" margin="0 auto">
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
              {/* Property Information (Read-only) */}
              <Box>
                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                  <Box display="flex" alignItems="center" gap="0.5rem">
                    <IoIosBuild style={{color: '#374151', fontSize: '0.875rem'}} />
                    Property
                  </Box>
                </label>
                <Box
                  padding="1rem"
                  border="2px solid #e5e7eb"
                  borderRadius="8px"
                  backgroundColor="#f9fafb"
                >
                  <Box display="flex" alignItems="center" gap="1rem">
                    {/* Property Photo */}
                    {currentProperty?.photos?.[0] ? (
                      <Box
                        width="48px"
                        height="48px"
                        borderRadius="6px"
                        overflow="hidden"
                        flexShrink="0"
                      >
                        <img
                          src={resolvePhotoUrl(currentProperty.photos[0].url)}
                          alt={currentProperty.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </Box>
                    ) : (
                      <Box
                        width="48px"
                        height="48px"
                        borderRadius="6px"
                        backgroundColor="#e5e7eb"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink="0"
                      >
                        <IoIosBusiness size={20} color="#9ca3af" />
                      </Box>
                    )}
                    
                    {/* Property Details */}
                    <Box flex="1">
                      <Box fontWeight="600" fontSize="1.1rem" marginBottom="0.25rem">
                        {currentProperty?.name}
                      </Box>
                      <Box display="flex" alignItems="center" gap="0.5rem" color="#6b7280" fontSize="0.875rem">
                        <IoIosPin size={14} />
                        <span>
                          {currentProperty?.address?.city && `${currentProperty.address.city}, `}
                          {currentProperty?.address?.countryOrRegion || 'No address'}
                        </span>
                      </Box>
                    </Box>
                  </Box>
                </Box>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  This rate plan will be created for the property shown above
                </p>
              </Box>

              <Input
                label="Rate Plan Name *"
                icon={IoIosPricetags}
                value={currentForm.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="e.g., Early Bird Special, Last Minute Deal, Premium Package"
                required
                helperText="Choose a clear name that guests will understand"
              />

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
              {/* Price Modifier Type Selection */}
              <Box>
                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                  <Box display="flex" alignItems="center" gap="0.5rem">
                    <IoIosCalculator style={{color: '#374151', fontSize: '0.875rem'}} />
                    Price Modifier Type *
                  </Box>
                </label>
                <SelectionPicker
                  data={modifierTypeOptions}
                  idAccessor={(item) => item.value}
                  value={currentForm.priceModifierType}
                  onChange={(value) => handleFieldChange('priceModifierType', value)}
                  renderItem={(item, _isSelected) => (
                    <Box display="flex" alignItems="center" gap="0.75rem">
                      <Box fontSize="1.25rem" flexShrink={0}>
                        {item.icon}
                      </Box>
                      <Box>
                        <Box fontWeight="500">{item.label}</Box>
                        <Box fontSize="0.875rem" color="#6b7280">{item.description}</Box>
                      </Box>
                    </Box>
                  )}
                />
              </Box>
              
              {/* Price Modifier Value */}
              <NumberStepperInput
                label={currentForm.priceModifierType === 'Percentage' ? 'Percentage Modifier (%)' : 'Fixed Amount Modifier (AED)'}
                icon={currentForm.priceModifierType === 'Percentage' ? IoIosCalculator : IoIosCash}
                value={currentForm.priceModifierValue}
                onChange={(value) => handleFieldChange('priceModifierValue', value)}
                min={currentForm.priceModifierType === 'Percentage' ? -100 : -10000}
                max={currentForm.priceModifierType === 'Percentage' ? 100 : 10000}
                step={currentForm.priceModifierType === 'Percentage' ? 5 : 50}
                format={currentForm.priceModifierType === 'Percentage' ? 'integer' : 'currency'}
                currency={currentForm.priceModifierType === 'Percentage' ? undefined : 'AED'}
                currencyPosition={currentForm.priceModifierType === 'Percentage' ? undefined : 'prefix'}
                helperText={
                  currentForm.priceModifierType === 'Percentage' 
                    ? 'Positive % increases base prices, negative % decreases base prices' 
                    : 'Positive amount adds to base prices, negative amount subtracts from base prices'
                }
                width="250px"
              />
            </Box>
          </Box>

          {/* Pricing Preview */}
          <Box>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Pricing Preview
            </h2>
            
            <RatePlanPricingPreview
              ratePlan={currentForm}
              property={currentProperty}
            />
          </Box>

          {/* Booking Conditions */}
          <Box>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Booking Conditions
            </h2>
            
            <Box display="flex" flexDirection="column" gap="1.5rem">
              {/* Stay Length Restrictions */}
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
                  display="flex"
                  alignItems="center"
                  gap="0.5rem"
                >
                  <IoIosTime style={{ fontSize: '1rem', color: '#059669' }} />
                  Stay Length Requirements
                </Box>
                
                <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem">
                  <NumberStepperInput
                    label="Minimum Stay (nights)"
                    value={currentForm.minStay || 1}
                    onChange={(value) => handleFieldChange('minStay', value > 0 ? value : undefined)}
                    min={1}
                    max={30}
                    step={1}
                    format="integer"
                    helperText="Minimum nights guests must book"
                    width="100%"
                  />
                  
                  <NumberStepperInput
                    label="Maximum Stay (nights)"
                    value={currentForm.maxStay || 30}
                    onChange={(value) => handleFieldChange('maxStay', value > 0 ? value : undefined)}
                    min={1}
                    max={365}
                    step={1}
                    format="integer"
                    helperText="Maximum nights guests can book"
                    width="100%"
                  />
                </Box>
              </Box>

              {/* Advance Booking Restrictions */}
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
                  display="flex"
                  alignItems="center"
                  gap="0.5rem"
                >
                  <IoIosCalendar style={{ fontSize: '1rem', color: '#3b82f6' }} />
                  Advance Booking Requirements
                </Box>
                
                <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem">
                  <NumberStepperInput
                    label="Minimum Advance Booking (days)"
                    value={currentForm.minAdvanceBooking || 0}
                    onChange={(value) => handleFieldChange('minAdvanceBooking', value > 0 ? value : undefined)}
                    min={0}
                    max={365}
                    step={1}
                    format="integer"
                    helperText="Days before arrival guests must book"
                    width="100%"
                  />
                  
                  <NumberStepperInput
                    label="Maximum Advance Booking (days)"
                    value={currentForm.maxAdvanceBooking || 365}
                    onChange={(value) => handleFieldChange('maxAdvanceBooking', value > 0 ? value : undefined)}
                    min={1}
                    max={730}
                    step={7}
                    format="integer"
                    helperText="Maximum days in advance guests can book"
                    width="100%"
                  />
                </Box>
              </Box>

              {/* Guest Count Restrictions */}
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
                  display="flex"
                  alignItems="center"
                  gap="0.5rem"
                >
                  <IoIosPeople style={{ fontSize: '1rem', color: '#f59e0b' }} />
                  Guest Count Requirements
                </Box>
                
                <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem">
                  <NumberStepperInput
                    label="Minimum Guests"
                    value={currentForm.minGuests || 1}
                    onChange={(value) => handleFieldChange('minGuests', (value >= 1 && value <= 20) ? value : 1)}
                    min={1}
                    max={Math.min(currentProperty?.maximumGuest || 20, 20)}
                    step={1}
                    format="integer"
                    helperText="Minimum number of guests required (1-20)"
                    width="100%"
                  />
                  
                  <NumberStepperInput
                    label="Maximum Guests"
                    value={currentForm.maxGuests || Math.min(currentProperty?.maximumGuest || 8, 20)}
                    onChange={(value) => handleFieldChange('maxGuests', (value >= 1 && value <= 20) ? value : Math.min(currentProperty?.maximumGuest || 8, 20))}
                    min={Math.max(currentForm.minGuests || 1, 1)}
                    max={Math.min(currentProperty?.maximumGuest || 20, 20)}
                    step={1}
                    format="integer"
                    helperText="Maximum number of guests allowed (1-20)"
                    width="100%"
                  />
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Rate Plan Settings */}
          <Box>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Rate Plan Settings
            </h2>
            
            <Box display="flex" flexDirection="column" gap="1.5rem">
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem">
                <NumberStepperInput
                  label="Priority"
                  icon={IoIosArrowUp}
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
                    Status Settings
                  </label>
                  <Box display="flex" flexDirection="column" gap="0.75rem">
                    <Box display="flex" alignItems="center" gap="1rem">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={currentForm.isActive}
                        onChange={(e) => handleFieldChange('isActive', e.target.checked)}
                        style={{ transform: 'scale(1.2)' }}
                      />
                      <label htmlFor="isActive" style={{ cursor: 'pointer', fontWeight: '500' }}>
                        Active (available for booking)
                      </label>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap="1rem">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={currentForm.isDefault}
                        onChange={(e) => handleFieldChange('isDefault', e.target.checked)}
                        style={{ transform: 'scale(1.2)' }}
                      />
                      <label htmlFor="isDefault" style={{ cursor: 'pointer', fontWeight: '500' }}>
                        Default rate plan (auto-selected)
                      </label>
                    </Box>
                  </Box>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                    Default rate plan will be pre-selected for guests
                  </p>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Included Amenities */}
          <Box>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Included Amenities
            </h2>
            
            <RatePlanAmenitySelector
              property={currentProperty}
              features={currentForm.features}
              ratePlanId={currentForm.id || 'new'}
              onChange={(features) => handleFieldChange('features', features)}
            />
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

        </Box>
      </Box>
    </SecuredPage>
  )
}

export default RatePlanManager