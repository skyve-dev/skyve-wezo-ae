import React, { useState } from 'react'
import { Box } from './base/Box'
import { Button } from './base/Button'
import SelectionPicker from './base/SelectionPicker'
import { NumberStepperInput } from './base/NumberStepperInput'
import DatePicker from './base/DatePicker'
import Dialog from './base/Dialog'
import SlidingDrawer from './base/SlidingDrawer'
import { FaPlus, FaTrash, FaCalendarAlt, FaClock, FaBan, FaInfoCircle, FaEye } from 'react-icons/fa'
import { RatePlanRestriction } from '@/store/slices/ratePlanSlice'

interface RatePlanRestrictionsBuilderProps {
  restrictions: RatePlanRestriction[]
  onChange: (restrictions: RatePlanRestriction[]) => void
  ratePlanId: string
}

type RestrictionType = 'MinLengthOfStay' | 'MaxLengthOfStay' | 'NoArrivals' | 'NoDepartures' | 
                      'MinAdvancedReservation' | 'MaxAdvancedReservation' | 'SeasonalDateRange'

interface RestrictionTypeConfig {
  type: RestrictionType
  label: string
  description: string
  icon: React.ReactNode
  valueLabel: string
  valueUnit: string
  min: number
  max: number
  step: number
  requiresDates: boolean
  examples: string[]
}

const RESTRICTION_TYPES: Record<RestrictionType, RestrictionTypeConfig> = {
  MinLengthOfStay: {
    type: 'MinLengthOfStay',
    label: 'Minimum Length of Stay',
    description: 'Require guests to book a minimum number of nights',
    icon: <FaClock />,
    valueLabel: 'Minimum Nights',
    valueUnit: 'nights',
    min: 1,
    max: 30,
    step: 1,
    requiresDates: false,
    examples: ['Weekend bookings must be 2+ nights', '3-night minimum during peak season']
  },
  MaxLengthOfStay: {
    type: 'MaxLengthOfStay',
    label: 'Maximum Length of Stay',
    description: 'Limit the maximum number of nights guests can book',
    icon: <FaClock />,
    valueLabel: 'Maximum Nights',
    valueUnit: 'nights',
    min: 1,
    max: 365,
    step: 1,
    requiresDates: false,
    examples: ['Business travelers: 7-night maximum', 'Prevent long-term stays: 14-night limit']
  },
  NoArrivals: {
    type: 'NoArrivals',
    label: 'No Arrivals (Day of Week)',
    description: 'Block check-ins on specific days of the week',
    icon: <FaBan />,
    valueLabel: 'Day of Week',
    valueUnit: '(0=Sun, 1=Mon, ..., 6=Sat)',
    min: 0,
    max: 6,
    step: 1,
    requiresDates: false,
    examples: ['No Sunday arrivals', 'Block Monday check-ins for cleaning']
  },
  NoDepartures: {
    type: 'NoDepartures',
    label: 'No Departures (Day of Week)',
    description: 'Block check-outs on specific days of the week',
    icon: <FaBan />,
    valueLabel: 'Day of Week',
    valueUnit: '(0=Sun, 1=Mon, ..., 6=Sat)',
    min: 0,
    max: 6,
    step: 1,
    requiresDates: false,
    examples: ['No Friday departures', 'Block Saturday check-outs']
  },
  MinAdvancedReservation: {
    type: 'MinAdvancedReservation',
    label: 'Minimum Advance Booking',
    description: 'Require bookings to be made X days in advance',
    icon: <FaCalendarAlt />,
    valueLabel: 'Days in Advance',
    valueUnit: 'days',
    min: 0,
    max: 365,
    step: 1,
    requiresDates: false,
    examples: ['Book at least 3 days ahead', '1-week advance booking required']
  },
  MaxAdvancedReservation: {
    type: 'MaxAdvancedReservation',
    label: 'Maximum Advance Booking',
    description: 'Limit how far in advance guests can book',
    icon: <FaCalendarAlt />,
    valueLabel: 'Days in Advance',
    valueUnit: 'days',
    min: 1,
    max: 730,
    step: 1,
    requiresDates: false,
    examples: ['Book maximum 365 days ahead', '6-month booking window']
  },
  SeasonalDateRange: {
    type: 'SeasonalDateRange',
    label: 'Seasonal Date Range',
    description: 'Apply special restrictions during specific date ranges',
    icon: <FaCalendarAlt />,
    valueLabel: 'Minimum Nights (for season)',
    valueUnit: 'nights',
    min: 1,
    max: 30,
    step: 1,
    requiresDates: true,
    examples: ['Holiday season: 5-night minimum', 'Summer restrictions: 7-night minimum']
  }
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const RatePlanRestrictionsBuilder: React.FC<RatePlanRestrictionsBuilderProps> = ({
  restrictions,
  onChange,
  ratePlanId
}) => {
  const [showAddRestriction, setShowAddRestriction] = useState(false)
  const [selectedRestrictionType, setSelectedRestrictionType] = useState<RestrictionType>('MinLengthOfStay')
  const [newRestriction, setNewRestriction] = useState<Partial<RatePlanRestriction>>({
    type: 'MinLengthOfStay',
    value: 2,
    startDate: '',
    endDate: ''
  })
  const [restrictionToDelete, setRestrictionToDelete] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const updateRestrictions = (updatedRestrictions: RatePlanRestriction[]) => {
    onChange(updatedRestrictions)
  }

  const addRestriction = () => {
    const restriction: RatePlanRestriction = {
      id: `restriction_${Date.now()}`,
      ratePlanId,
      type: newRestriction.type as RestrictionType,
      value: newRestriction.value || 1,
      startDate: newRestriction.startDate,
      endDate: newRestriction.endDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    updateRestrictions([...restrictions, restriction])
    setShowAddRestriction(false)
    resetNewRestriction()
  }

  const updateRestriction = (restrictionId: string, updates: Partial<RatePlanRestriction>) => {
    const updatedRestrictions = restrictions.map(restriction =>
      restriction.id === restrictionId 
        ? { ...restriction, ...updates, updatedAt: new Date().toISOString() }
        : restriction
    )
    updateRestrictions(updatedRestrictions)
  }

  const deleteRestriction = (restrictionId: string) => {
    const updatedRestrictions = restrictions.filter(restriction => restriction.id !== restrictionId)
    updateRestrictions(updatedRestrictions)
    setRestrictionToDelete(null)
  }

  const resetNewRestriction = () => {
    setNewRestriction({
      type: 'MinLengthOfStay',
      value: 2,
      startDate: '',
      endDate: ''
    })
    setSelectedRestrictionType('MinLengthOfStay')
  }

  const handleRestrictionTypeChange = (type: RestrictionType) => {
    setSelectedRestrictionType(type)
    const config = RESTRICTION_TYPES[type]
    setNewRestriction({
      type,
      value: config.min,
      startDate: config.requiresDates ? '' : undefined,
      endDate: config.requiresDates ? '' : undefined
    })
  }

  const getRestrictionDisplay = (restriction: RatePlanRestriction) => {
    const config = RESTRICTION_TYPES[restriction.type]
    const dayName = (restriction.type === 'NoArrivals' || restriction.type === 'NoDepartures') 
      ? DAY_NAMES[restriction.value] 
      : null

    let valueDisplay = dayName || `${restriction.value} ${config.valueUnit}`
    
    if (restriction.type === 'SeasonalDateRange' && restriction.startDate && restriction.endDate) {
      const startDate = new Date(restriction.startDate).toLocaleDateString()
      const endDate = new Date(restriction.endDate).toLocaleDateString()
      valueDisplay += ` (${startDate} - ${endDate})`
    }

    return {
      label: config.label,
      value: valueDisplay,
      icon: config.icon,
      description: config.description
    }
  }

  const canAddRestriction = () => {
    const config = RESTRICTION_TYPES[selectedRestrictionType]
    if (config.requiresDates) {
      return newRestriction.startDate && newRestriction.endDate && 
             newRestriction.startDate < newRestriction.endDate
    }
    return newRestriction.value !== undefined && newRestriction.value >= config.min
  }

  const getRestrictionTypeOptions = () => {
    return Object.values(RESTRICTION_TYPES).map(config => ({
      id: config.type,
      label: config.label,
      description: config.description,
      icon: config.icon
    }))
  }

  return (
    <Box display="flex" flexDirection="column" gap="1.5rem">
      {/* Header */}
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom="0.75rem">
          <Box fontSize="1rem" fontWeight="600" color="#374151">
            Rate Plan Restrictions ({restrictions.length})
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
              label="Add Restriction"
              icon={<FaPlus />}
              onClick={() => setShowAddRestriction(true)}
              variant="normal"
              size="small"
            />
          </Box>
        </Box>
        
        <Box fontSize="0.875rem" color="#6b7280">
          Control when and how guests can make reservations with booking restrictions
        </Box>
      </Box>

      {/* Current Restrictions */}
      <Box>
        {restrictions.length > 0 ? (
          <Box display="flex" flexDirection="column" gap="1rem">
            {restrictions.map((restriction) => {
              const display = getRestrictionDisplay(restriction)
              return (
                <Box
                  key={restriction.id}
                  padding="1.5rem"
                  backgroundColor="#f9fafb"
                  borderRadius="12px"
                  border="1px solid #e5e7eb"
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom="0.75rem">
                    <Box display="flex" alignItems="center" gap="0.75rem">
                      <Box color="#2563eb">{display.icon}</Box>
                      <Box>
                        <Box fontSize="1rem" fontWeight="600" color="#374151">
                          {display.label}
                        </Box>
                        <Box fontSize="0.875rem" color="#6b7280">
                          {display.description}
                        </Box>
                      </Box>
                    </Box>
                    
                    <Button
                      label=""
                      icon={<FaTrash />}
                      onClick={() => setRestrictionToDelete(restriction.id)}
                      variant="plain"
                      size="small"
                      style={{ color: '#dc2626' }}
                    />
                  </Box>
                  
                  <Box
                    padding="1rem"
                    backgroundColor="white"
                    borderRadius="8px"
                    border="1px solid #e5e7eb"
                  >
                    <Box fontSize="1rem" fontWeight="500" color="#059669">
                      {display.value}
                    </Box>
                  </Box>
                  
                  {/* Editable fields for this restriction */}
                  <Box marginTop="1rem" display="flex" flexDirection="column" gap="1rem">
                    <NumberStepperInput
                      label={RESTRICTION_TYPES[restriction.type].valueLabel}
                      value={restriction.value}
                      onChange={(value) => updateRestriction(restriction.id, { value })}
                      min={RESTRICTION_TYPES[restriction.type].min}
                      max={RESTRICTION_TYPES[restriction.type].max}
                      step={RESTRICTION_TYPES[restriction.type].step}
                      format="integer"
                      helperText={`Range: ${RESTRICTION_TYPES[restriction.type].min}-${RESTRICTION_TYPES[restriction.type].max} ${RESTRICTION_TYPES[restriction.type].valueUnit}`}
                      width="200px"
                    />
                    
                    {RESTRICTION_TYPES[restriction.type].requiresDates && (
                      <Box display="grid" gridTemplateColumns="1fr 1fr" gridTemplateColumnsSm="1fr" gap="1rem">
                        <DatePicker
                          label="Start Date"
                          value={restriction.startDate || ''}
                          onChange={(date: string) => updateRestriction(restriction.id, { startDate: date })}
                        />
                        <DatePicker
                          label="End Date"
                          value={restriction.endDate || ''}
                          onChange={(date: string) => updateRestriction(restriction.id, { endDate: date })}
                        />
                      </Box>
                    )}
                  </Box>
                </Box>
              )
            })}
          </Box>
        ) : (
          <Box
            padding="2rem"
            textAlign="center"
            backgroundColor="#f3f4f6"
            borderRadius="12px"
            border="2px dashed #d1d5db"
          >
            <Box fontSize="1rem" color="#6b7280" marginBottom="0.5rem">
              No restrictions configured
            </Box>
            <Box fontSize="0.875rem" color="#9ca3af" marginBottom="1.5rem">
              Add restrictions to control how guests can book your property
            </Box>
            <Button
              label="Add First Restriction"
              icon={<FaPlus />}
              onClick={() => setShowAddRestriction(true)}
              variant="normal"
              size="medium"
            />
          </Box>
        )}
      </Box>

      {/* Booking Impact Preview */}
      {showPreview && (
        <Box
          padding="1.5rem"
          backgroundColor="#eff6ff"
          borderRadius="12px"
          border="1px solid #bfdbfe"
        >
          <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1rem">
            <FaInfoCircle color="#2563eb" />
            <Box fontSize="1rem" fontWeight="600" color="#1e40af">
              Booking Impact Preview
            </Box>
          </Box>
          
          <Box fontSize="0.875rem" color="#374151" marginBottom="1rem">
            How these restrictions affect guest bookings:
          </Box>
          
          <Box display="flex" flexDirection="column" gap="0.5rem">
            {restrictions.length === 0 ? (
              <Box fontSize="0.875rem" color="#6b7280" fontStyle="italic">
                No restrictions - guests can book with standard rules
              </Box>
            ) : (
              restrictions.map((restriction) => {
                let impactText = ''
                
                switch (restriction.type) {
                  case 'MinLengthOfStay':
                    impactText = `Guests must book at least ${restriction.value} night${restriction.value > 1 ? 's' : ''}`
                    break
                  case 'MaxLengthOfStay':
                    impactText = `Guests cannot book more than ${restriction.value} night${restriction.value > 1 ? 's' : ''}`
                    break
                  case 'NoArrivals':
                    impactText = `Guests cannot check in on ${DAY_NAMES[restriction.value]}s`
                    break
                  case 'NoDepartures':
                    impactText = `Guests cannot check out on ${DAY_NAMES[restriction.value]}s`
                    break
                  case 'MinAdvancedReservation':
                    impactText = `Guests must book at least ${restriction.value} day${restriction.value > 1 ? 's' : ''} in advance`
                    break
                  case 'MaxAdvancedReservation':
                    impactText = `Guests cannot book more than ${restriction.value} day${restriction.value > 1 ? 's' : ''} in advance`
                    break
                  case 'SeasonalDateRange':
                    const startDate = restriction.startDate ? new Date(restriction.startDate).toLocaleDateString() : 'Start'
                    const endDate = restriction.endDate ? new Date(restriction.endDate).toLocaleDateString() : 'End'
                    impactText = `During ${startDate} - ${endDate}: minimum ${restriction.value} night${restriction.value > 1 ? 's' : ''}`
                    break
                }
                
                return (
                  <Box key={restriction.id} display="flex" alignItems="start" gap="0.5rem">
                    <Box color="#2563eb" marginTop="0.125rem">•</Box>
                    <Box fontSize="0.875rem" color="#374151">
                      {impactText}
                    </Box>
                  </Box>
                )
              })
            )}
          </Box>
        </Box>
      )}

      {/* Add Restriction Drawer */}
      <SlidingDrawer
        isOpen={showAddRestriction}
        onClose={() => setShowAddRestriction(false)}
        side="bottom"
        height="75vh"
        backgroundColor="#f9fafb"
        showCloseButton={true}
      >
        <Box padding="1.5rem" display="flex" flexDirection="column" height="100%">
          {/* Header */}
          <Box marginBottom="1.5rem">
            <Box fontSize="1.25rem" fontWeight="600" color="#374151" marginBottom="0.5rem">
              Add New Restriction
            </Box>
            <Box fontSize="0.875rem" color="#6b7280">
              Configure booking rules to control when and how guests can make reservations
            </Box>
          </Box>
          
          {/* Scrollable Content with Horizontal Layout */}
          <Box flex="1" overflow="auto" paddingRight="0.5rem">
            <Box display="grid" gridTemplateColumns="320px 1fr" gridTemplateColumnsSm="1fr" gap="2rem" height="100%">
              {/* Left Column: Restriction Type Selection */}
              <Box display="flex" flexDirection="column" gap="1.5rem">
                <Box>
                  <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', fontSize: '1rem' }}>
                    Choose Restriction Type
                  </label>
                  <SelectionPicker
                    data={getRestrictionTypeOptions()}
                    idAccessor={(item: any) => item.id}
                    value={selectedRestrictionType}
                    onChange={(value: string | number | (string | number)[]) => handleRestrictionTypeChange(value as RestrictionType)}
                    renderItem={(item: any, _isSelected: boolean) => (
                      <Box>
                        <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="0.5rem">
                          <Box color="#2563eb">{item.icon}</Box>
                          <Box fontWeight="600" fontSize="0.875rem">{item.label}</Box>
                        </Box>
                        <Box fontSize="0.8125rem" color="#6b7280">
                          {item.description}
                        </Box>
                      </Box>
                    )}
                  />
                </Box>
                
                {/* Examples Section - Moved to Left Column */}
                <Box>
                  <Box fontSize="0.875rem" fontWeight="600" color="#374151" marginBottom="0.5rem">
                    Examples
                  </Box>
                  <Box
                    padding="1rem"
                    backgroundColor="#f0f9ff"
                    borderRadius="8px"
                    border="1px solid #bae6fd"
                  >
                    <Box display="flex" flexDirection="column" gap="0.5rem">
                      {RESTRICTION_TYPES[selectedRestrictionType].examples.map((example, index) => (
                        <Box key={index} display="flex" alignItems="start" gap="0.5rem">
                          <Box color="#2563eb" marginTop="0.125rem" fontSize="0.75rem">●</Box>
                          <Box fontSize="0.8125rem" color="#0369a1" lineHeight="1.3">
                            {example}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Box>
              
              {/* Right Column: Configuration */}
              <Box display="flex" flexDirection="column" gap="1.5rem">
                {/* Current Restriction Preview */}
                <Box
                  padding="1.5rem"
                  backgroundColor="white"
                  borderRadius="12px"
                  border="1px solid #e5e7eb"
                >
                  <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1rem">
                    <Box color="#2563eb" fontSize="1.25rem">
                      {RESTRICTION_TYPES[selectedRestrictionType].icon}
                    </Box>
                    <Box>
                      <Box fontSize="1rem" fontWeight="600" color="#374151">
                        {RESTRICTION_TYPES[selectedRestrictionType].label}
                      </Box>
                      <Box fontSize="0.875rem" color="#6b7280">
                        {RESTRICTION_TYPES[selectedRestrictionType].description}
                      </Box>
                    </Box>
                  </Box>
                  
                  {/* Live Preview of Current Settings */}
                  <Box
                    padding="1rem"
                    backgroundColor="#f3f4f6"
                    borderRadius="8px"
                    border="1px solid #d1d5db"
                  >
                    <Box fontSize="0.875rem" fontWeight="500" color="#374151" marginBottom="0.5rem">
                      Current Configuration:
                    </Box>
                    <Box fontSize="0.875rem" color="#6b7280">
                      {selectedRestrictionType === 'NoArrivals' || selectedRestrictionType === 'NoDepartures' 
                        ? `${DAY_NAMES[newRestriction.value || 0]}s` 
                        : `${newRestriction.value || RESTRICTION_TYPES[selectedRestrictionType].min} ${RESTRICTION_TYPES[selectedRestrictionType].valueUnit}`
                      }
                      {RESTRICTION_TYPES[selectedRestrictionType].requiresDates && newRestriction.startDate && newRestriction.endDate && (
                        <Box marginTop="0.25rem">
                          📅 {new Date(newRestriction.startDate).toLocaleDateString()} → {new Date(newRestriction.endDate).toLocaleDateString()}
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
                
                {/* Value Configuration */}
                <Box
                  padding="1.5rem"
                  backgroundColor="white"
                  borderRadius="12px"
                  border="1px solid #e5e7eb"
                >
                  <Box fontSize="1rem" fontWeight="600" color="#374151" marginBottom="1rem">
                    Configure Value
                  </Box>
                  
                  <NumberStepperInput
                    label={RESTRICTION_TYPES[selectedRestrictionType].valueLabel}
                    value={newRestriction.value || RESTRICTION_TYPES[selectedRestrictionType].min}
                    onChange={(value) => setNewRestriction(prev => ({ ...prev, value }))}
                    min={RESTRICTION_TYPES[selectedRestrictionType].min}
                    max={RESTRICTION_TYPES[selectedRestrictionType].max}
                    step={RESTRICTION_TYPES[selectedRestrictionType].step}
                    format="integer"
                    helperText={`${RESTRICTION_TYPES[selectedRestrictionType].valueUnit} (Range: ${RESTRICTION_TYPES[selectedRestrictionType].min}-${RESTRICTION_TYPES[selectedRestrictionType].max})`}
                    width="250px"
                  />
                  
                  {/* Day of Week Helper for No Arrivals/Departures */}
                  {(selectedRestrictionType === 'NoArrivals' || selectedRestrictionType === 'NoDepartures') && (
                    <Box marginTop="1rem">
                      <Box fontSize="0.875rem" fontWeight="500" color="#374151" marginBottom="0.5rem">
                        Day of Week Reference:
                      </Box>
                      <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap="0.5rem">
                        {DAY_NAMES.map((day, index) => (
                          <Box
                            key={index}
                            padding="0.5rem"
                            backgroundColor={index === (newRestriction.value || 0) ? '#2563eb' : '#f3f4f6'}
                            color={index === (newRestriction.value || 0) ? 'white' : '#374151'}
                            borderRadius="6px"
                            textAlign="center"
                            fontSize="0.75rem"
                            fontWeight="500"
                            cursor="pointer"
                            onClick={() => setNewRestriction(prev => ({ ...prev, value: index }))}
                          >
                            {index}: {day.slice(0, 3)}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
                
                {/* Optimized Date Range for Seasonal Restrictions */}
                {RESTRICTION_TYPES[selectedRestrictionType].requiresDates && (
                  <Box
                    padding="1.5rem"
                    backgroundColor="white"
                    borderRadius="12px"
                    border="1px solid #e5e7eb"
                  >
                    <Box fontSize="1rem" fontWeight="600" color="#374151" marginBottom="1rem">
                      Seasonal Date Range
                    </Box>
                    
                    {/* Compact Date Picker Layout */}
                    <Box display="flex" flexDirection="column" gap="1rem">
                      <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem">
                        <DatePicker
                          label="From"
                          value={newRestriction.startDate || ''}
                          onChange={(date: string) => setNewRestriction(prev => ({ ...prev, startDate: date }))}
                        />
                        <DatePicker
                          label="Until"
                          value={newRestriction.endDate || ''}
                          onChange={(date: string) => setNewRestriction(prev => ({ ...prev, endDate: date }))}
                        />
                      </Box>

                      <Box
                        padding="1rem"
                        backgroundColor="#f0f9ff"
                        borderRadius="8px"
                        border="1px solid #bae6fd"
                      >
                        <Box fontSize="0.8125rem" color="#0369a1">
                          💡 This restriction will only apply during the selected date range. Normal booking rules apply outside these dates.
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
          
          {/* Fixed Footer with Actions */}
          <Box
            marginTop="1.5rem"
            paddingTop="1rem"
            borderTop="1px solid #e5e7eb"
            backgroundColor="#f9fafb"
            marginLeft="-1.5rem"
            marginRight="-1.5rem"
            paddingLeft="1.5rem"
            paddingRight="1.5rem"
            paddingBottom="1rem"
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              {/* Validation Message */}
              <Box>
                {!canAddRestriction() && (
                  <Box fontSize="0.8125rem" color="#dc2626">
                    {RESTRICTION_TYPES[selectedRestrictionType].requiresDates 
                      ? '⚠️ Please select valid start and end dates'
                      : '⚠️ Please configure the restriction value'
                    }
                  </Box>
                )}
              </Box>
              
              {/* Action Buttons */}
              <Box display="flex" gap="0.75rem">
                <Button
                  label="Cancel"
                  onClick={() => setShowAddRestriction(false)}
                  variant="plain"
                  size="medium"
                />
                <Button
                  label="Add Restriction"
                  onClick={addRestriction}
                  disabled={!canAddRestriction()}
                  variant="promoted"
                  size="medium"
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </SlidingDrawer>

      {/* Delete Confirmation Dialog */}
      {restrictionToDelete && (
        <Dialog
          isOpen={true}
          onClose={() => setRestrictionToDelete(null)}
          width="400px"
        >
          <Box padding="2rem">
            <Box fontSize="1.25rem" fontWeight="600" marginBottom="1rem">
              Delete Restriction
            </Box>
            <Box marginBottom="2rem">
              Are you sure you want to delete this restriction? This action cannot be undone.
            </Box>
            <Box display="flex" gap="0.75rem" justifyContent="flex-end">
              <Button
                label="Cancel"
                onClick={() => setRestrictionToDelete(null)}
                variant="plain"
              />
              <Button
                label="Delete"
                onClick={() => deleteRestriction(restrictionToDelete)}
                style={{ backgroundColor: '#dc2626', color: 'white' }}
              />
            </Box>
          </Box>
        </Dialog>
      )}
    </Box>
  )
}

export default RatePlanRestrictionsBuilder