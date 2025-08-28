import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '@/store'
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaCalendarCheck, 
  FaEdit,
  FaFilter
} from 'react-icons/fa'
import { Box } from '@/components'
import Button from '@/components/base/Button'
import SelectionPicker from '@/components/base/SelectionPicker'
import SlidingDrawer from '@/components/base/SlidingDrawer'
import {
  setDateRange,
  toggleBulkEditMode,
  setSelectedRatePlans,
  fetchPricesForRatePlan
} from '@/store/slices/priceSlice'
import { RootState } from '@/store'

const CalendarControls: React.FC = () => {
  const dispatch = useAppDispatch()
  const {
    dateRange,
    bulkEditMode,
    selectedRatePlanIds
  } = useSelector((state: RootState) => state.price)
  
  const { ratePlans } = useSelector((state: RootState) => state.ratePlan)
  
  const [ratePlanDrawerOpen, setRatePlanDrawerOpen] = useState(false)
  
  // Get current month info
  const currentDate = dateRange.startDate ? new Date(dateRange.startDate) : new Date()
  const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  
  // Navigation handlers
  const handlePreviousMonth = () => {
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    const endOfMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0)
    
    const newRange = {
      startDate: prevMonth.toISOString().split('T')[0],
      endDate: endOfMonth.toISOString().split('T')[0]
    }
    
    dispatch(setDateRange(newRange))
    
    // Refresh prices for new date range
    selectedRatePlanIds.forEach(ratePlanId => {
      dispatch(fetchPricesForRatePlan({
        ratePlanId,
        startDate: newRange.startDate,
        endDate: newRange.endDate
      }))
    })
  }
  
  const handleNextMonth = () => {
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    const endOfMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 2, 0)
    
    const newRange = {
      startDate: nextMonth.toISOString().split('T')[0],
      endDate: endOfMonth.toISOString().split('T')[0]
    }
    
    dispatch(setDateRange(newRange))
    
    // Refresh prices for new date range
    selectedRatePlanIds.forEach(ratePlanId => {
      dispatch(fetchPricesForRatePlan({
        ratePlanId,
        startDate: newRange.startDate,
        endDate: newRange.endDate
      }))
    })
  }
  
  // Rate plan selection handlers
  const handleRatePlanSelection = (value: string | number | (string | number)[]) => {
    const selectedIds = Array.isArray(value) ? value as string[] : [value as string]
    dispatch(setSelectedRatePlans(selectedIds))
    
    // Load prices for newly selected rate plans
    if (dateRange.startDate && dateRange.endDate) {
      selectedIds.forEach(ratePlanId => {
        dispatch(fetchPricesForRatePlan({
          ratePlanId,
          startDate: dateRange.startDate!,
          endDate: dateRange.endDate!
        }))
      })
    }
    
    setRatePlanDrawerOpen(false)
  }
  
  const selectedRatePlans = ratePlans.filter(rp => selectedRatePlanIds.includes(rp.id))
  
  return (
    <Box>
      {/* Main Controls Row */}
      <Box 
        display="flex" 
        gap="1rem" 
        alignItems="center" 
        marginBottom="1rem" 
        flexWrap="wrap"
        justifyContent="space-between"
      >
        {/* Month Navigation */}
        <Box display="flex" alignItems="center" gap="0.5rem">
          <Button
            label=""
            icon={<FaChevronLeft />}
            onClick={handlePreviousMonth}
            variant="plain"
            size="small"
            title="Previous month"
          />
          
          <Box 
            minWidth="160px" 
            textAlign="center"
            fontSize="1rem"
            fontWeight="600"
            color="#374151"
          >
            {currentMonth}
          </Box>
          
          <Button
            label=""
            icon={<FaChevronRight />}
            onClick={handleNextMonth}
            variant="plain"
            size="small"
            title="Next month"
          />
        </Box>
        
        {/* Action Buttons */}
        <Box display="flex" gap="0.5rem" alignItems="center" flexWrap="wrap">
          {/* Rate Plan Filter */}
          <Button
            label={window.innerWidth < 768 ? '' : `${selectedRatePlans.length} Plans`}
            icon={<FaFilter />}
            onClick={() => setRatePlanDrawerOpen(true)}
            variant="plain"
            size="small"
            style={{
              backgroundColor: selectedRatePlans.length > 0 ? '#f0f9ff' : undefined,
              border: selectedRatePlans.length > 0 ? '1px solid #0369a1' : undefined,
              color: selectedRatePlans.length > 0 ? '#0369a1' : undefined
            }}
            title="Filter rate plans"
          />
          
          {/* Bulk Edit Toggle */}
          <Button
            label={window.innerWidth < 768 ? '' : (bulkEditMode ? 'Exit Bulk Edit' : 'Bulk Edit')}
            icon={<FaEdit />}
            onClick={() => dispatch(toggleBulkEditMode())}
            variant={bulkEditMode ? 'promoted' : 'plain'}
            size="small"
            title={bulkEditMode ? 'Exit bulk edit mode' : 'Enter bulk edit mode'}
          />
        </Box>
      </Box>
      
      {/* Selected Rate Plans Preview */}
      {selectedRatePlans.length > 0 && (
        <Box marginBottom="1rem">
          <Box display="flex" flexWrap="wrap" gap="0.5rem">
            {selectedRatePlans.slice(0, 4).map(ratePlan => (
              <Box
                key={ratePlan.id}
                padding="0.25rem 0.75rem"
                backgroundColor="#f0fdf4"
                border="1px solid #bbf7d0"
                borderRadius="16px"
                fontSize="0.75rem"
                fontWeight="500"
                color="#166534"
                display="flex"
                alignItems="center"
                gap="0.25rem"
              >
                <Box
                  width="8px"
                  height="8px"
                  borderRadius="50%"
                  backgroundColor={`hsl(${ratePlan.id.charCodeAt(0) * 137.508}deg, 70%, 50%)`}
                />
                {ratePlan.name}
              </Box>
            ))}
            
            {selectedRatePlans.length > 4 && (
              <Box
                padding="0.25rem 0.75rem"
                backgroundColor="#f3f4f6"
                borderRadius="16px"
                fontSize="0.75rem"
                color="#6b7280"
              >
                +{selectedRatePlans.length - 4} more
              </Box>
            )}
          </Box>
        </Box>
      )}
      
      {/* Rate Plan Selection Drawer */}
      <SlidingDrawer
        isOpen={ratePlanDrawerOpen}
        onClose={() => setRatePlanDrawerOpen(false)}
        side="bottom"
        height="60vh"
        showCloseButton={true}
        backgroundColor="white"
        contentStyles={{
          borderRadius: '1rem 1rem 0 0',
          overflow: 'hidden'
        }}
      >
        <Box padding="1.5rem" height="100%" display="flex" flexDirection="column">
          <Box marginBottom="1.5rem">
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Select Rate Plans
            </h3>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Choose which rate plans to display in the calendar
            </p>
          </Box>
          
          <Box flex="1" overflow="auto">
            <SelectionPicker
              data={ratePlans.filter(rp => rp.isActive)}
              idAccessor={(rp) => rp.id}
              value={selectedRatePlanIds}
              onChange={handleRatePlanSelection}
              isMultiSelect={true}
              renderItem={(ratePlan, isSelected) => (
                <Box
                  display="flex"
                  alignItems="center"
                  gap="0.75rem"
                  padding="0.75rem"
                  backgroundColor={isSelected ? '#f0f9ff' : 'transparent'}
                  borderRadius="6px"
                  border={isSelected ? '1px solid #0369a1' : '1px solid #e5e7eb'}
                  cursor="pointer"
                  transition="all 0.2s"
                >
                  <Box
                    width="12px"
                    height="12px"
                    borderRadius="50%"
                    backgroundColor={`hsl(${ratePlan.id.charCodeAt(0) * 137.508}deg, 70%, 50%)`}
                  />
                  
                  <Box flex="1">
                    <Box fontWeight="500" marginBottom="0.25rem">
                      {ratePlan.name}
                    </Box>
                    <Box fontSize="0.75rem" color="#6b7280">
                      {ratePlan.type} • {ratePlan.adjustmentType}
                      {ratePlan.adjustmentType !== 'FixedPrice' && (
                        <span> ({ratePlan.adjustmentValue}{ratePlan.adjustmentType === 'Percentage' ? '%' : ''})</span>
                      )}
                    </Box>
                  </Box>
                  
                  {isSelected && (
                    <FaCalendarCheck size={14} color="#0369a1" />
                  )}
                </Box>
              )}
              containerStyles={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            />
          </Box>
        </Box>
      </SlidingDrawer>
    </Box>
  )
}

export default CalendarControls