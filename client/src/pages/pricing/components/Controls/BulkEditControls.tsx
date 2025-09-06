import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState, useAppDispatch } from '@/store'
import { IoPencil, IoClose, IoTrash } from 'react-icons/io5'
import { Box } from '@/components'
import Button from '@/components/base/Button'
import NumberStepperInput from '@/components/base/NumberStepperInput'
import { 
  clearDateSelections, 
  toggleBulkEditMode,
  openDateOverrideForm
} from '@/store/slices/priceSlice'

const BulkEditControls: React.FC = () => {
  const dispatch = useAppDispatch()
  const { selectedDates } = useSelector((state: RootState) => state.price)
  
  const [bulkPrice, setBulkPrice] = useState<number>(0)
  const [bulkHalfDayPrice, setBulkHalfDayPrice] = useState<number>(0)
  
  const handleEditSelectedDates = () => {
    if (selectedDates.length === 0) return
    
    // Open the DateOverrideDialog in bulk mode
    const primaryDate = selectedDates[0]
    
    dispatch(openDateOverrideForm({
      date: primaryDate,
      existingOverride: undefined,
      bulkMode: true,
      selectedDates: selectedDates
    }))
  }
  
  const handleQuickBulkEdit = () => {
    if (selectedDates.length === 0 || bulkPrice <= 0) return
    
    // Open DateOverrideDialog with pre-filled values for bulk editing
    const primaryDate = selectedDates[0]
    
    dispatch(openDateOverrideForm({
      date: primaryDate,
      existingOverride: {
        id: 'bulk-temp',
        propertyId: '',
        date: primaryDate,
        price: bulkPrice,
        halfDayPrice: bulkHalfDayPrice || Math.round(bulkPrice * 0.6),
        reason: 'Bulk price update',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      bulkMode: true,
      selectedDates: selectedDates
    }))
  }
  
  const handleExitBulkMode = () => {
    dispatch(toggleBulkEditMode())
    dispatch(clearDateSelections())
  }
  
  const handleClearSelection = () => {
    dispatch(clearDateSelections())
  }
  
  return (
    <Box 
      padding="1.5rem" 
      backgroundColor="#fef3c7" 
      border="2px solid #f59e0b"
      borderRadius="12px"
      marginBottom="1rem"
    >
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom="1rem">
        <Box display="flex" alignItems="center" gap="0.5rem">
          <IoPencil color="#d97706" size={16} />
          <h4 style={{ fontSize: '1rem', fontWeight: '600', margin: 0, color: '#92400e' }}>
            Bulk Edit Mode - Property Pricing
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
          icon={<IoClose />}
          onClick={handleExitBulkMode}
          variant="plain"
          size="small"
          style={{
            color: '#92400e'
          }}
          title="Exit bulk edit mode"
        />
      </Box>
      
      {/* Quick Bulk Edit Section */}
      <Box marginBottom="1rem">
        <Box 
          fontSize="0.875rem" 
          fontWeight="600" 
          color="#92400e" 
          marginBottom="0.75rem"
        >
          Quick Bulk Price Update
        </Box>
        
        <Box display="flex" gap="1rem" alignItems="flex-end" flexWrap="wrap">
          {/* Bulk Price Input */}
          <Box minWidth="150px">
            <NumberStepperInput
              label="Full Day Price"
              value={bulkPrice}
              onChange={setBulkPrice}
              min={0}
              max={50000}
              step={100}
              format="currency"
              currency="AED"
              currencyPosition="prefix"
              width="100%"
            />
          </Box>
          
          {/* Half Day Price Input */}
          <Box minWidth="150px">
            <NumberStepperInput
              label="Half Day Price"
              value={bulkHalfDayPrice}
              onChange={setBulkHalfDayPrice}
              min={0}
              max={50000}
              step={50}
              format="currency"
              currency="AED"
              currencyPosition="prefix"
              width="100%"
            />
          </Box>
          
          {/* Quick Apply Button */}
          <Button
            label="Quick Apply"
            icon={<IoPencil />}
            onClick={handleQuickBulkEdit}
            variant="promoted"
            disabled={selectedDates.length === 0 || bulkPrice <= 0}
            style={{
              backgroundColor: '#059669',
              borderColor: '#059669'
            }}
            title="Apply prices to selected dates quickly"
          />
        </Box>
      </Box>
      
      {/* Advanced Bulk Edit Section */}
      <Box marginBottom="1rem">
        <Box 
          fontSize="0.875rem" 
          fontWeight="600" 
          color="#92400e" 
          marginBottom="0.75rem"
        >
          Advanced Options
        </Box>
        
        <Box display="flex" gap="1rem" alignItems="flex-end" flexWrap="wrap">
          {/* Advanced Edit Button */}
          <Button
            label="Edit Selected Dates"
            icon={<IoPencil />}
            onClick={handleEditSelectedDates}
            variant="promoted"
            disabled={selectedDates.length === 0}
            style={{
              backgroundColor: '#3182ce',
              borderColor: '#3182ce'
            }}
            title="Open advanced editing dialog for selected dates"
          />
          
          {/* Clear Selection Button */}
          <Button
            label="Clear Selection"
            icon={<IoTrash />}
            onClick={handleClearSelection}
            variant="plain"
            disabled={selectedDates.length === 0}
            style={{
              color: '#92400e'
            }}
            title="Clear all selected dates"
          />
        </Box>
      </Box>
      
      {/* Info Section */}
      <Box 
        padding="0.75rem" 
        backgroundColor="white" 
        borderRadius="6px"
        border="1px solid #fbbf24"
      >
        <Box fontSize="0.875rem" color="#374151" marginBottom="0.5rem">
          <strong>Selected Dates:</strong> {selectedDates.length === 0 
            ? 'No dates selected' 
            : `${selectedDates.length} date${selectedDates.length > 1 ? 's' : ''} selected`
          }
        </Box>
        
        <Box fontSize="0.75rem" color="#6b7280">
          <strong>Mode:</strong> Property Base Pricing - Create date-specific price overrides
        </Box>
        
        {selectedDates.length === 0 && (
          <Box 
            marginTop="0.75rem" 
            fontSize="0.75rem" 
            color="#92400e"
            textAlign="center"
            padding="0.5rem"
            backgroundColor="#fef3c7"
            borderRadius="4px"
          >
            💡 Click on calendar dates to select them for bulk operations
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default BulkEditControls