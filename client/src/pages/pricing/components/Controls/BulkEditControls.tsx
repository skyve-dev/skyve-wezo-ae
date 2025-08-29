import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '@/store'
import { FaEdit, FaCheck, FaTimes, FaCopy, FaTrash } from 'react-icons/fa'
import { Box } from '@/components'
import Button from '@/components/base/Button'
import NumberStepperInput from '@/components/base/NumberStepperInput'
import SelectionPicker from '@/components/base/SelectionPicker'
import {
  toggleBulkEditMode,
  setBulkEditAmount,
  clearDateSelections,
  bulkUpdatePrices,
  startCopyOperation
} from '@/store/slices/priceSlice'
import { RootState } from '@/store'
import { ApiError } from '@/utils/api'
import useErrorHandler from '@/hooks/useErrorHandler'

const BulkEditControls: React.FC = () => {
  const dispatch = useAppDispatch()
  const { showApiError, showSuccess } = useErrorHandler()
  const {
    selectedDates,
    bulkEditAmount,
    selectedRatePlanIds,
    bulkOperationLoading
  } = useSelector((state: RootState) => state.price)
  
  const { ratePlans } = useSelector((state: RootState) => state.ratePlan)
  
  const [selectedRatePlan, setSelectedRatePlan] = useState<string>(
    selectedRatePlanIds.length === 1 ? selectedRatePlanIds[0] : ''
  )
  const [operation, setOperation] = useState<'set' | 'copy' | 'clear'>('set')
  
  const selectedRatePlanData = ratePlans.find(rp => rp.id === selectedRatePlan)
  
  const handleApplyBulkEdit = async () => {
    if (selectedDates.length === 0 || !selectedRatePlan) return
    
    // Check if any selected dates are in the past
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const pastDates = selectedDates.filter(dateStr => {
      const date = new Date(dateStr)
      date.setHours(0, 0, 0, 0)
      return date < today
    })
    
    if (pastDates.length > 0) {
      await showApiError(
        new ApiError(
          'Cannot modify past dates',
          400,
          undefined,
          `You have selected ${pastDates.length} past date${pastDates.length > 1 ? 's' : ''} which cannot be modified. Please select only future dates.`
        ),
        'Date Validation'
      )
      return
    }
    
    switch (operation) {
      case 'set':
        if (bulkEditAmount <= 0) return
        
        const updates = selectedDates.map(date => ({
          date,
          amount: bulkEditAmount
        }))
        
        try {
          await dispatch(bulkUpdatePrices({
            ratePlanId: selectedRatePlan,
            updates
          })).unwrap()
          
          // Show success message
          await showSuccess(`Successfully updated ${updates.length} price${updates.length > 1 ? 's' : ''}`)
          
          // Clear selections after successful operation
          dispatch(clearDateSelections())
        } catch (error: any) {
          // Error is now a string from rejectWithValue
          const errorMessage = typeof error === 'string' ? error : 'Failed to update prices'
          await showApiError(
            new ApiError('Bulk price update failed', 400, undefined, errorMessage),
            'Bulk Price Update'
          )
        }
        break
        
      case 'copy':
        // For copy operation, we'd need to implement copy logic
        // This would involve selecting source dates first
        if (selectedDates.length >= 2) {
          const sourceStartDate = selectedDates[0]
          const sourceEndDate = selectedDates[selectedDates.length - 1]
          dispatch(startCopyOperation({ sourceStartDate, sourceEndDate }))
        }
        break
        
      case 'clear':
        // Clear prices for selected dates
        // This would require a delete operation
        // Clear operation implementation would go here
        break
    }
  }
  
  const handleExitBulkMode = () => {
    dispatch(toggleBulkEditMode())
    dispatch(clearDateSelections())
  }
  
  const canApply = () => {
    if (selectedDates.length === 0 || !selectedRatePlan) return false
    
    switch (operation) {
      case 'set':
        return bulkEditAmount > 0
      case 'copy':
        return selectedDates.length >= 2
      case 'clear':
        return true
      default:
        return false
    }
  }
  
  const getOperationDescription = () => {
    switch (operation) {
      case 'set':
        return `Set ${bulkEditAmount > 0 ? `AED ${bulkEditAmount.toLocaleString()}` : 'price'} for ${selectedDates.length} selected dates`
      case 'copy':
        return `Copy prices from selected date range to another period`
      case 'clear':
        return `Clear prices for ${selectedDates.length} selected dates`
      default:
        return ''
    }
  }
  
  return (
    <Box 
      padding="1.5rem" 
      backgroundColor="#fef3c7" 
      border="2px solid #f59e0b"
      borderRadius="12px"
    >
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom="1rem">
        <Box display="flex" alignItems="center" gap="0.5rem">
          <FaEdit color="#d97706" size={16} />
          <h4 style={{ fontSize: '1rem', fontWeight: '600', margin: 0, color: '#92400e' }}>
            Bulk Edit Mode
          </h4>
          <Box
            padding="0.25rem 0.5rem"
            backgroundColor="#f59e0b"
            color="white"
            borderRadius="12px"
            fontSize="0.625rem"
            fontWeight="600"
          >
            {selectedDates.length} SELECTED
          </Box>
        </Box>
        
        <Button
          label=""
          icon={<FaTimes />}
          onClick={handleExitBulkMode}
          variant="plain"
          size="small"
          style={{
            color: '#92400e'
          }}
          title="Exit bulk edit mode"
        />
      </Box>
      
      {/* Controls */}
      <Box display="flex" gap="1rem" alignItems="flex-end" flexWrap="wrap" marginBottom="1rem">
        {/* Operation Type */}
        <Box>
          <label style={{ 
            display: 'block', 
            fontSize: '0.75rem', 
            fontWeight: '500', 
            color: '#92400e',
            marginBottom: '0.5rem' 
          }}>
            Operation
          </label>
          <Box display="flex" backgroundColor="white" borderRadius="6px" border="1px solid #fbbf24">
            {[
              { value: 'set', label: 'Set Price', icon: <FaEdit /> },
              { value: 'copy', label: 'Copy', icon: <FaCopy /> },
              { value: 'clear', label: 'Clear', icon: <FaTrash /> }
            ].map((op) => (
              <Button
                key={op.value}
                label={window.innerWidth < 768 ? '' : op.label}
                icon={op.icon}
                onClick={() => setOperation(op.value as any)}
                variant={operation === op.value ? 'promoted' : 'plain'}
                size="small"
                style={{
                  backgroundColor: operation === op.value ? '#f59e0b' : 'transparent',
                  color: operation === op.value ? 'white' : '#92400e',
                  border: 'none',
                  borderRadius: '6px'
                }}
                title={op.label}
              />
            ))}
          </Box>
        </Box>
        
        {/* Rate Plan Selection */}
        <Box minWidth="200px">
          <label style={{ 
            display: 'block', 
            fontSize: '0.75rem', 
            fontWeight: '500', 
            color: '#92400e',
            marginBottom: '0.5rem' 
          }}>
            Rate Plan
          </label>
          <SelectionPicker
            data={ratePlans.filter(rp => rp.isActive)}
            idAccessor={(rp) => rp.id}
            value={selectedRatePlan}
            onChange={(value) => setSelectedRatePlan(value as string)}
            isMultiSelect={false}
            renderItem={(ratePlan, isSelected) => (
              <Box
                padding="0.5rem 0.75rem"
                backgroundColor={isSelected ? '#fbbf24' : 'white'}
                color={isSelected ? 'white' : '#374151'}
                borderRadius="4px"
                fontSize="0.875rem"
                fontWeight={isSelected ? '600' : '400'}
              >
                {ratePlan.name}
              </Box>
            )}
            containerStyles={{
              backgroundColor: 'white',
              border: '1px solid #fbbf24',
              borderRadius: '6px',
              maxHeight: '120px',
              overflow: 'auto'
            }}
          />
        </Box>
        
        {/* Price Input (only for set operation) */}
        {operation === 'set' && (
          <Box minWidth="150px">
            <NumberStepperInput
              label="Price"
              value={bulkEditAmount}
              onChange={(value) => dispatch(setBulkEditAmount(value))}
              min={0}
              max={50000}
              step={100}
              format="currency"
              currency="AED"
              currencyPosition="prefix"
              width="100%"
            />
          </Box>
        )}
        
        {/* Apply Button */}
        <Button
          label={bulkOperationLoading ? 'Processing...' : 'Apply'}
          icon={<FaCheck />}
          onClick={handleApplyBulkEdit}
          variant="promoted"
          disabled={!canApply() || bulkOperationLoading}
          style={{
            backgroundColor: '#059669',
            borderColor: '#059669'
          }}
        />
        
        {/* Clear Selection */}
        {selectedDates.length > 0 && (
          <Button
            label="Clear Selection"
            onClick={() => dispatch(clearDateSelections())}
            variant="plain"
            size="small"
            style={{
              color: '#92400e'
            }}
          />
        )}
      </Box>
      
      {/* Description */}
      <Box 
        padding="0.75rem" 
        backgroundColor="white" 
        borderRadius="6px"
        border="1px solid #fbbf24"
      >
        <Box fontSize="0.875rem" color="#374151">
          <strong>Action:</strong> {getOperationDescription()}
        </Box>
        
        {selectedRatePlanData && (
          <Box fontSize="0.75rem" color="#6b7280" marginTop="0.25rem">
            Target: {selectedRatePlanData.name} ({selectedRatePlanData.type})
          </Box>
        )}
      </Box>
      
      {/* Instructions */}
      {selectedDates.length === 0 && (
        <Box 
          marginTop="1rem" 
          padding="0.75rem" 
          backgroundColor="#fef3c7" 
          borderRadius="6px"
          fontSize="0.75rem" 
          color="#92400e"
          textAlign="center"
        >
          💡 Click on calendar dates to select them for bulk operations
        </Box>
      )}
    </Box>
  )
}

export default BulkEditControls