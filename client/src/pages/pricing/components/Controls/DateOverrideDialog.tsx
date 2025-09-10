import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState, useAppDispatch } from '@/store'
import { 
  IoIosCalendar, 
  IoIosCash, 
  IoIosSave, 
  IoIosClose, 
  IoIosTrash,
  IoIosInformationCircle,
  IoIosClock
} from 'react-icons/io'
import { Box } from '@/components'
import Button from '@/components/base/Button'
import NumberStepperInput from '@/components/base/NumberStepperInput'
import SlidingDrawer from '@/components/base/SlidingDrawer'
import SelectionPicker from '@/components/base/SelectionPicker'
import { 
  closeDateOverrideForm, 
  saveDateOverride,
  deleteDateOverrides,
  fetchPublicPricingCalendar
} from '@/store/slices/priceSlice'
import { ApiError } from '@/utils/api'
import useErrorHandler from '@/hooks/useErrorHandler'
import { useAppShell } from '@/components/base/AppShell'

interface ReasonOption {
  id: string
  label: string
  description?: string
}

const PRESET_REASONS: ReasonOption[] = [
  { id: 'holiday', label: 'Holiday', description: 'Public holiday or religious observance' },
  { id: 'event', label: 'Special Event', description: 'Local event or festival' },
  { id: 'peak', label: 'Peak Season', description: 'High demand period' },
  { id: 'offpeak', label: 'Off Season', description: 'Low demand period' },
  { id: 'weekend', label: 'Weekend Special', description: 'Weekend pricing adjustment' },
  { id: 'custom', label: 'Custom', description: 'Custom pricing reason' }
]

const DateOverrideDialog: React.FC = () => {
  const dispatch = useAppDispatch()
  const { openDialog } = useAppShell()
  
  const {
    dateOverrideForm,
    propertyPricing,
    loading,
    dateRange
  } = useSelector((state: RootState) => state.price)
  
  const { currentProperty } = useSelector((state: RootState) => state.property)
  const { showApiError, showSuccess } = useErrorHandler()
  
  const [localPrice, setLocalPrice] = useState(dateOverrideForm.price)
  const [localHalfDayPrice, setLocalHalfDayPrice] = useState(dateOverrideForm.halfDayPrice)
  const [localReason, setLocalReason] = useState(dateOverrideForm.reason)
  const [selectedReasonId, setSelectedReasonId] = useState<string>('custom')
  const [hasChanges, setHasChanges] = useState(false)
  
  // Update local state when form opens
  useEffect(() => {
    setLocalPrice(dateOverrideForm.price)
    setLocalHalfDayPrice(dateOverrideForm.halfDayPrice)
    setLocalReason(dateOverrideForm.reason)
    
    // Try to match reason with preset
    const matchedReason = PRESET_REASONS.find(r => 
      r.label.toLowerCase() === dateOverrideForm.reason?.toLowerCase()
    )
    setSelectedReasonId(matchedReason?.id || 'custom')
    
    setHasChanges(false)
  }, [dateOverrideForm.isOpen, dateOverrideForm.price, dateOverrideForm.halfDayPrice, dateOverrideForm.reason])
  
  // Track changes
  useEffect(() => {
    const priceChanged = localPrice !== dateOverrideForm.price
    const halfDayChanged = localHalfDayPrice !== dateOverrideForm.halfDayPrice
    const reasonChanged = localReason !== dateOverrideForm.reason
    
    setHasChanges(priceChanged || halfDayChanged || reasonChanged)
  }, [localPrice, localHalfDayPrice, localReason, dateOverrideForm])
  
  const handleClose = () => {
    if (hasChanges) {
      // Could show confirmation dialog here
    }
    dispatch(closeDateOverrideForm())
  }
  
  const handleSave = async () => {
    if (!dateOverrideForm.date || !currentProperty?.propertyId || localPrice < 0) return
    
    // For bulk mode, use selected dates; otherwise use single date
    const targetDates = dateOverrideForm.bulkMode && dateOverrideForm.selectedDates.length > 0
      ? dateOverrideForm.selectedDates 
      : [dateOverrideForm.date]
    
    // Check if any dates are in the past
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const pastDates = targetDates.filter(dateStr => {
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
          `You cannot set price overrides for ${pastDates.length} past date${pastDates.length > 1 ? 's' : ''}. Please select only future dates.`
        )
      )
      return
    }
    
    // Validate half-day price
    if (localHalfDayPrice > localPrice) {
      await showApiError(
        new ApiError(
          'Invalid half-day price', 
          400, 
          undefined, 
          'Half-day price cannot be higher than full-day price.'
        )
      )
      return
    }
    
    try {
      // For bulk mode, save multiple overrides
      if (dateOverrideForm.bulkMode && targetDates.length > 1) {
        const overrides = targetDates.map(date => ({
          date,
          price: localPrice,
          halfDayPrice: localHalfDayPrice,
          reason: localReason
        }))
        
        // Save each override (we could enhance the backend to support bulk saves later)
        for (const override of overrides) {
          await dispatch(saveDateOverride({
            propertyId: currentProperty.propertyId,
            override
          })).unwrap()
        }
        
        await showSuccess(`Successfully saved price overrides for ${targetDates.length} dates.`)
      } else {
        // Single date override
        await dispatch(saveDateOverride({
          propertyId: currentProperty.propertyId,
          override: {
            date: dateOverrideForm.date,
            price: localPrice,
            halfDayPrice: localHalfDayPrice,
            reason: localReason
          }
        })).unwrap()
        
        await showSuccess('Date override has been saved successfully.')
      }
      
      // Refresh pricing calendar if date range is set
      if (dateRange.startDate && dateRange.endDate) {
        dispatch(fetchPublicPricingCalendar({
          propertyId: currentProperty.propertyId,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }))
      }
      
      // Form will be closed automatically by the reducer
    } catch (error: any) {
      const errorMessage = typeof error === 'string' ? error : 'Failed to save date override'
      await showApiError(
        new ApiError('Save failed', 400, undefined, errorMessage)
      )
    }
  }
  
  const handleDelete = async () => {
    if (!dateOverrideForm.date || !currentProperty?.propertyId) return
    
    const confirmed = await openDialog<boolean>((close) => (
      <Box padding="2rem" textAlign="center">
        <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#dc2626">
          Delete Price Override?
        </Box>
        <Box marginBottom="2rem" color="#6b7280">
          This will remove the custom pricing for {dateOverrideForm.date ? formatDate(dateOverrideForm.date) : 'the selected date'} 
          and revert to the weekly default price.
        </Box>
        <Box display="flex" gap="1rem" justifyContent="center">
          <Button onClick={() => close(false)}>Cancel</Button>
          <Button onClick={() => close(true)} variant="promoted">Delete Override</Button>
        </Box>
      </Box>
    ))
    
    if (!confirmed) return
    
    try {
      await dispatch(deleteDateOverrides({
        propertyId: currentProperty.propertyId,
        dates: [dateOverrideForm.date]
      })).unwrap()
      
      await showSuccess('Date override has been deleted.')
      
      // Refresh pricing calendar
      if (dateRange.startDate && dateRange.endDate) {
        dispatch(fetchPublicPricingCalendar({
          propertyId: currentProperty.propertyId,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }))
      }
      
      dispatch(closeDateOverrideForm())
    } catch (error: any) {
      const errorMessage = typeof error === 'string' ? error : 'Failed to delete override'
      await showApiError(
        new ApiError('Delete failed', 400, undefined, errorMessage)
      )
    }
  }
  
  const handleReasonSelect = (value: string | number | (string | number)[]) => {
    const reasonId = Array.isArray(value) ? value[0] : value
    setSelectedReasonId(reasonId as string)
    const reason = PRESET_REASONS.find(r => r.id === reasonId)
    if (reason && reasonId !== 'custom') {
      setLocalReason(reason.label)
    }
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
  
  // Get the weekly default price for comparison
  const getWeeklyDefaultPrice = () => {
    if (!propertyPricing || !dateOverrideForm.date) return null
    
    const date = new Date(dateOverrideForm.date)
    const dayOfWeek = date.getDay()
    const dayMap = {
      0: 'Sunday',
      1: 'Monday',
      2: 'Tuesday',
      3: 'Wednesday',
      4: 'Thursday',
      5: 'Friday',
      6: 'Saturday'
    }
    
    const dayName = dayMap[dayOfWeek as keyof typeof dayMap]
    const fullDayPrice = propertyPricing[`price${dayName}` as keyof typeof propertyPricing] as number
    const halfDayPrice = propertyPricing[`halfDayPrice${dayName}` as keyof typeof propertyPricing] as number
    
    return { fullDay: fullDayPrice, halfDay: halfDayPrice }
  }
  
  const weeklyDefault = getWeeklyDefaultPrice()
  const isExistingOverride = !!dateOverrideForm.originalOverride
  
  return (
    <SlidingDrawer
      isOpen={dateOverrideForm.isOpen}
      onClose={handleClose}
      side="bottom"
      height="75vh"
      showCloseButton={false}
      backgroundColor="white"
      contentStyles={{
        maxWidth: 600,
        marginLeft: 'auto',
        marginRight: 'auto',
        borderTopLeftRadius: '1rem',
        borderTopRightRadius: '1rem',
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
                {dateOverrideForm.bulkMode 
                  ? `Bulk Edit Price Overrides (${dateOverrideForm.selectedDates.length} dates)`
                  : (isExistingOverride ? 'Edit Price Override' : 'Set Price Override')
                }
              </h3>
              
              {dateOverrideForm.bulkMode ? (
                <Box display="flex" alignItems="center" gap="0.5rem" fontSize="0.875rem" opacity="0.9">
                  <IoIosCalendar size={12} />
                  <span>
                    Applying to {dateOverrideForm.selectedDates.length} selected date{dateOverrideForm.selectedDates.length > 1 ? 's' : ''}
                  </span>
                  <Box
                    padding="0.125rem 0.5rem"
                    backgroundColor="#3182ce"
                    borderRadius="12px"
                    fontSize="0.625rem"
                    fontWeight="600"
                  >
                    BULK MODE
                  </Box>
                </Box>
              ) : (
                dateOverrideForm.date && (
                  <Box display="flex" alignItems="center" gap="0.5rem" fontSize="0.875rem" opacity="0.9">
                    <IoIosCalendar size={12} />
                    <span>{formatDate(dateOverrideForm.date)}</span>
                    {isWeekend(dateOverrideForm.date) && (
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
                )
              )}
            </Box>
            
            <Button
              label=""
              icon={<IoIosClose />}
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
          {/* Weekly Default Reference */}
          {weeklyDefault && (
            <Box 
              marginBottom="1.5rem"
              padding="1rem"
              backgroundColor="#f0fdf4"
              border="1px solid #86efac"
              borderRadius="8px"
            >
              <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
                <IoIosInformationCircle size={14} color="#22c55e" />
                <span style={{ fontSize: '0.875rem', color: '#22c55e', fontWeight: '600' }}>
                  Weekly Default Pricing
                </span>
              </Box>
              
              <Box display="flex" gap="2rem" fontSize="0.875rem">
                <Box>
                  <Box color="#6b7280" marginBottom="0.25rem">Full Day</Box>
                  <Box fontWeight="600" color="#374151">
                    AED {weeklyDefault.fullDay.toLocaleString()}
                  </Box>
                </Box>
                <Box>
                  <Box color="#6b7280" marginBottom="0.25rem">Half Day</Box>
                  <Box fontWeight="600" color="#374151">
                    AED {weeklyDefault.halfDay.toLocaleString()}
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
          
          {/* Price Inputs */}
          <Box display="flex" gap="1rem" marginBottom="1.5rem">
            <Box flex="1">
              <NumberStepperInput
                label="Full Day Price"
                value={localPrice}
                onChange={setLocalPrice}
                min={0}
                max={50000}
                step={50}
                format="currency"
                currency="AED"
                currencyPosition="prefix"
                helperText="Override price for full day booking"
                width="100%"
              />
            </Box>
            
            <Box flex="1">
              <NumberStepperInput
                label="Half Day Price"
                value={localHalfDayPrice}
                onChange={setLocalHalfDayPrice}
                min={0}
                max={localPrice}
                step={50}
                format="currency"
                currency="AED"
                currencyPosition="prefix"
                helperText="Override price for half day booking"
                width="100%"
              />
            </Box>
          </Box>
          
          {/* Reason Selection */}
          <Box marginBottom="1.5rem">
            <Box fontSize="0.875rem" fontWeight="500" color="#374151" marginBottom="0.5rem">
              Reason for Override
            </Box>
            
            <SelectionPicker
              data={PRESET_REASONS}
              idAccessor={(item) => item.id}
              value={selectedReasonId}
              onChange={handleReasonSelect}
              isMultiSelect={false}
              renderItem={(item, isSelected) => (
                <Box padding="0.75rem">
                  <Box 
                    fontSize="0.875rem" 
                    fontWeight={isSelected ? '600' : '500'}
                    color={isSelected ? '#3182ce' : '#374151'}
                    marginBottom="0.25rem"
                  >
                    {item.label}
                  </Box>
                  {item.description && (
                    <Box fontSize="0.75rem" color="#6b7280">
                      {item.description}
                    </Box>
                  )}
                </Box>
              )}
              containerStyles={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}
              itemStyles={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: 'white'
              }}
              selectedItemStyles={{
                borderColor: '#3182ce',
                backgroundColor: '#eff6ff'
              }}
            />
            
            {/* Custom reason input */}
            {selectedReasonId === 'custom' && (
              <Box>
                <Box
                  as="input"
                  type="text"
                  value={localReason}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalReason(e.target.value)}
                  placeholder="Enter custom reason..."
                  padding="0.75rem"
                  width="100%"
                  border="1px solid #d1d5db"
                  borderRadius="0.375rem"
                  fontSize="1rem"
                  whileFocus={{
                    borderColor: '#3182ce',
                    outline: 'none',
                    boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)'
                  }}
                />
              </Box>
            )}
          </Box>
          
          {/* Price Comparison */}
          {weeklyDefault && (localPrice !== weeklyDefault.fullDay || localHalfDayPrice !== weeklyDefault.halfDay) && (
            <Box 
              marginBottom="1.5rem"
              padding="1rem"
              backgroundColor="#eff6ff"
              border="1px solid #dbeafe"
              borderRadius="8px"
            >
              <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
                <IoIosCash size={14} color="#3b82f6" />
                <span style={{ fontSize: '0.875rem', color: '#3b82f6', fontWeight: '600' }}>
                  Price Difference
                </span>
              </Box>
              
              <Box display="flex" gap="2rem" fontSize="0.875rem">
                <Box>
                  <Box color="#6b7280" marginBottom="0.25rem">Full Day</Box>
                  <Box fontWeight="600" color={localPrice > weeklyDefault.fullDay ? '#dc2626' : '#059669'}>
                    {localPrice > weeklyDefault.fullDay ? '+' : ''}
                    AED {(localPrice - weeklyDefault.fullDay).toLocaleString()}
                    {' '}({Math.round(((localPrice - weeklyDefault.fullDay) / weeklyDefault.fullDay) * 100)}%)
                  </Box>
                </Box>
                <Box>
                  <Box color="#6b7280" marginBottom="0.25rem">Half Day</Box>
                  <Box fontWeight="600" color={localHalfDayPrice > weeklyDefault.halfDay ? '#dc2626' : '#059669'}>
                    {localHalfDayPrice > weeklyDefault.halfDay ? '+' : ''}
                    AED {(localHalfDayPrice - weeklyDefault.halfDay).toLocaleString()}
                    {' '}({Math.round(((localHalfDayPrice - weeklyDefault.halfDay) / weeklyDefault.halfDay) * 100)}%)
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
          
          {/* Info Note */}
          <Box 
            padding="1rem"
            backgroundColor="#f8fafc"
            border="1px solid #e2e8f0"
            borderRadius="8px"
            fontSize="0.875rem"
            color="#6b7280"
          >
            <Box display="flex" alignItems="flex-start" gap="0.5rem">
              <IoIosClock size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
              <Box>
                <Box marginBottom="0.5rem">
                  <strong>About Price Overrides:</strong>
                </Box>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  <li>Overrides take priority over weekly default pricing</li>
                  <li>Perfect for holidays, events, or seasonal adjustments</li>
                  <li>Rate plans will apply their modifiers to override prices</li>
                  <li>You can delete an override to revert to weekly pricing</li>
                </ul>
              </Box>
            </Box>
          </Box>
        </Box>
        
        {/* Footer */}
        <Box 
          padding="1.5rem" 
          backgroundColor="#f9fafb" 
          borderTop="1px solid #e5e7eb"
        >
          <Box display="flex" gap="1rem" justifyContent="space-between">
            {/* Delete button on the left for existing overrides (not in bulk mode) */}
            <Box>
              {isExistingOverride && !dateOverrideForm.bulkMode && (
                <Button
                  label="Delete Override"
                  icon={<IoIosTrash />}
                  onClick={handleDelete}
                  variant="plain"
                  disabled={loading}
                  style={{ color: '#dc2626' }}
                />
              )}
            </Box>
            
            {/* Save/Cancel on the right */}
            <Box display="flex" gap="1rem">
              <Button
                label="Cancel"
                onClick={handleClose}
                variant="plain"
                disabled={loading}
              />
              
              <Button
                label={loading 
                  ? 'Saving...' 
                  : dateOverrideForm.bulkMode 
                    ? `Save for ${dateOverrideForm.selectedDates.length} Dates`
                    : (isExistingOverride ? 'Update Override' : 'Save Override')
                }
                icon={<IoIosSave />}
                onClick={handleSave}
                variant="promoted"
                disabled={loading || localPrice < 0 || localHalfDayPrice < 0}
              />
            </Box>
          </Box>
          
          {hasChanges && (
            <Box 
              marginTop="0.75rem" 
              fontSize="0.75rem" 
              color="#6b7280" 
              textAlign="right"
            >
              {dateOverrideForm.bulkMode 
                ? `Changes will override the weekly defaults for ${dateOverrideForm.selectedDates.length} selected dates`
                : `Changes will override the weekly default for ${dateOverrideForm.date}`
              }
            </Box>
          )}
        </Box>
      </Box>
    </SlidingDrawer>
  )
}

export default DateOverrideDialog