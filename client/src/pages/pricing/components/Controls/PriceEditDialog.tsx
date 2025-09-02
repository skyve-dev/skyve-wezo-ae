import React, {useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {RootState, useAppDispatch} from '@/store'
import {FaCalendarAlt, FaDollarSign, FaSave, FaTags, FaTimes} from 'react-icons/fa'
import {Box} from '@/components'
import Button from '@/components/base/Button'
import NumberStepperInput from '@/components/base/NumberStepperInput'
import SlidingDrawer from '@/components/base/SlidingDrawer'
import {closePriceEditForm, createOrUpdatePrice, updatePriceEditAmount} from '@/store/slices/priceSlice'
import {ApiError} from '@/utils/api'
import useErrorHandler from '@/hooks/useErrorHandler'

const PriceEditDialog: React.FC = () => {
  const dispatch = useAppDispatch()
  const {
    priceEditForm,
    loading
  } = useSelector((state: RootState) => state.price)
  
  const { ratePlans } = useSelector((state: RootState) => state.ratePlan)
  const { showApiError, showSuccess } = useErrorHandler()
  
  const [localAmount, setLocalAmount] = useState(priceEditForm.amount)
  const [hasChanges, setHasChanges] = useState(false)
  
  // Update local state when form opens
  useEffect(() => {
    setLocalAmount(priceEditForm.amount)
    setHasChanges(false)
  }, [priceEditForm.amount, priceEditForm.isOpen])
  
  // Track changes
  useEffect(() => {
    setHasChanges(localAmount !== priceEditForm.originalAmount)
  }, [localAmount, priceEditForm.originalAmount])
  
  const selectedRatePlan = ratePlans.find(rp => rp.id === priceEditForm.ratePlanId)
  
  const handleClose = () => {
    if (hasChanges) {
      // Could show confirmation dialog here
      // For now, just close
    }
    dispatch(closePriceEditForm())
  }
  
  const handleSave = async () => {
    if (!priceEditForm.date || !priceEditForm.ratePlanId || localAmount < 0) return
    
    // Check if the date is in the past
    const selectedDate = new Date(priceEditForm.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    selectedDate.setHours(0, 0, 0, 0)
    
    if (selectedDate < today) {
      await showApiError(
        new ApiError(
          'Cannot modify past dates', 
          400, 
          undefined, 
          'You cannot modify prices for dates that have already passed. Please select a future date.'
        ),
        'Date Validation'
      )
      return
    }
    
    try {
      await dispatch(createOrUpdatePrice({
        ratePlanId: priceEditForm.ratePlanId,
        date: priceEditForm.date,
        amount: localAmount
      })).unwrap()
      
      // Show success message
      await showSuccess('Price has been updated successfully.')
      
      // Form will be closed automatically by the reducer
    } catch (error: any) {
      // Error is now a string from rejectWithValue
      const errorMessage = typeof error === 'string' ? error : 'Failed to update price'
      await showApiError(
        new ApiError('Price update failed', 400, undefined, errorMessage),
        'Price Update'
      )
    }
  }
  
  const handleAmountChange = (value: number) => {
    setLocalAmount(value)
    dispatch(updatePriceEditAmount(value))
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const isWeekend = (dateString: string) => {
    const date = new Date(dateString)
    return date.getDay() === 0 || date.getDay() === 6
  }
  
  // Calculate derived price if this is a percentage-based rate plan
  const calculateDerivedPrice = () => {
    if (!selectedRatePlan || selectedRatePlan.priceModifierType === 'FixedAmount') {
      return null
    }
    
    // This would need base rate plan data in a real implementation
    // For now, we'll show a placeholder
    return {
      baseAmount: 1000, // Placeholder
      adjustedAmount: selectedRatePlan.priceModifierType === 'Percentage' 
        ? 1000 * (1 + selectedRatePlan.priceModifierValue / 100)
        : selectedRatePlan.priceModifierValue
    }
  }
  
  const derivedPrice = calculateDerivedPrice()
  
  return (
    <SlidingDrawer
      isOpen={priceEditForm.isOpen}
      onClose={handleClose}
      side="bottom"
      height="60vh"
      showCloseButton={false}
      backgroundColor="white"
      contentStyles={{
        borderRadius: '1rem 1rem 0 0',
        overflow: 'hidden'
      }}
    >
      <Box padding="0" height="100%" display="flex" flexDirection="column">
        {/* Header */}
        <Box 
          padding="1.5rem" 
          backgroundColor="#D52122" 
          color="white"
          borderBottom="1px solid #b91c1c"
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0, marginBottom: '0.5rem' }}>
                Edit Price
              </h3>
              {priceEditForm.date && (
                <Box display="flex" alignItems="center" gap="0.5rem" fontSize="0.875rem" opacity="0.9">
                  <FaCalendarAlt size={12} />
                  <span>{formatDate(priceEditForm.date)}</span>
                  {isWeekend(priceEditForm.date) && (
                    <Box
                      padding="0.125rem 0.5rem"
                      backgroundColor="#f59e0b"
                      borderRadius="12px"
                      fontSize="0.625rem"
                      fontWeight="600"
                    >
                      WEEKEND
                    </Box>
                  )}
                </Box>
              )}
            </Box>
            
            <Button
              label=""
              icon={<FaTimes />}
              onClick={handleClose}
              variant="plain"
              size="small"
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                border: 'none'
              }}
            />
          </Box>
        </Box>
        
        {/* Content */}
        <Box padding="1.5rem" flex="1" overflow="auto">
          {selectedRatePlan && (
            <Box marginBottom="1.5rem">
              <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
                <FaTags size={14} color="#6b7280" />
                <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>
                  Rate Plan
                </span>
              </Box>
              
              <Box 
                padding="0.75rem 1rem" 
                backgroundColor="#f9fafb" 
                borderRadius="8px"
                border="1px solid #e5e7eb"
              >
                <Box fontSize="1rem" fontWeight="600" color="#374151" marginBottom="0.25rem">
                  {selectedRatePlan.name}
                </Box>
                <Box fontSize="0.75rem" color="#6b7280">
                  Rate Plan • {selectedRatePlan.priceModifierType}
                  {selectedRatePlan.priceModifierType === 'Percentage' && (
                    <span>
                      {' '}({selectedRatePlan.priceModifierValue}%)
                    </span>
                  )}
                </Box>
              </Box>
            </Box>
          )}
          
          {/* Price Input */}
          <Box marginBottom="1.5rem">
            <NumberStepperInput
              label="Price Amount"
              value={localAmount}
              onChange={handleAmountChange}
              min={0}
              max={50000}
              step={100}
              format="currency"
              currency="AED"
              currencyPosition="prefix"
              helperText="Set the specific price for this date"
              width="100%"
            />
          </Box>
          
          {/* Derived Price Display */}
          {derivedPrice && (
            <Box 
              marginBottom="1.5rem"
              padding="1rem"
              backgroundColor="#eff6ff"
              border="1px solid #dbeafe"
              borderRadius="8px"
            >
              <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
                <FaDollarSign size={14} color="#3b82f6" />
                <span style={{ fontSize: '0.875rem', color: '#3b82f6', fontWeight: '600' }}>
                  Pricing Calculation
                </span>
              </Box>
              
              <Box display="flex" gap="1rem" alignItems="center" fontSize="0.875rem">
                <Box textAlign="center">
                  <Box color="#6b7280" marginBottom="0.25rem">Base Rate</Box>
                  <Box fontWeight="600" color="#374151">
                    AED {derivedPrice.baseAmount.toLocaleString()}
                  </Box>
                </Box>
                
                <Box color="#6b7280">→</Box>
                
                <Box textAlign="center">
                  <Box color="#6b7280" marginBottom="0.25rem">
                    {selectedRatePlan?.priceModifierType} Applied
                  </Box>
                  <Box fontWeight="600" color="#3b82f6">
                    AED {derivedPrice.adjustedAmount.toLocaleString()}
                  </Box>
                </Box>
                
                <Box color="#6b7280">→</Box>
                
                <Box textAlign="center">
                  <Box color="#6b7280" marginBottom="0.25rem">Your Price</Box>
                  <Box fontWeight="700" color="#D52122" fontSize="1rem">
                    AED {localAmount.toLocaleString()}
                  </Box>
                </Box>
              </Box>
              
              {Math.abs(localAmount - derivedPrice.adjustedAmount) > 0.01 && (
                <Box 
                  marginTop="0.75rem" 
                  padding="0.5rem" 
                  backgroundColor="#fef3c7" 
                  borderRadius="6px"
                  fontSize="0.75rem"
                  color="#92400e"
                >
                  <strong>Override:</strong> You're setting a custom price different from the calculated rate 
                  ({localAmount > derivedPrice.adjustedAmount ? 'higher' : 'lower'} by 
                  AED {Math.abs(localAmount - derivedPrice.adjustedAmount).toLocaleString()})
                </Box>
              )}
            </Box>
          )}
          
          {/* Historical Context (Placeholder) */}
          <Box 
            padding="1rem"
            backgroundColor="#f8fafc"
            border="1px solid #e2e8f0"
            borderRadius="8px"
          >
            <Box fontSize="0.875rem" color="#6b7280" marginBottom="0.5rem" fontWeight="500">
              Pricing Context
            </Box>
            <Box fontSize="0.75rem" color="#6b7280">
              • Last year same date: AED 1,200 (placeholder)
              • Average for this month: AED 1,100 (placeholder)
              • Competitor average: AED 1,150 (placeholder)
            </Box>
          </Box>
        </Box>
        
        {/* Footer */}
        <Box 
          padding="1.5rem" 
          backgroundColor="#f9fafb" 
          borderTop="1px solid #e5e7eb"
        >
          <Box display="flex" gap="1rem" justifyContent="flex-end">
            <Button
              label="Cancel"
              onClick={handleClose}
              variant="plain"
              disabled={loading}
            />
            
            <Button
              label={loading ? 'Saving...' : 'Save Price'}
              icon={<FaSave />}
              onClick={handleSave}
              variant="promoted"
              disabled={loading || !hasChanges || localAmount < 0}
            />
          </Box>
          
          {hasChanges && (
            <Box 
              marginTop="0.75rem" 
              fontSize="0.75rem" 
              color="#6b7280" 
              textAlign="right"
            >
              Changes will be saved for {selectedRatePlan?.name} on {priceEditForm.date}
            </Box>
          )}
        </Box>
      </Box>
    </SlidingDrawer>
  )
}

export default PriceEditDialog