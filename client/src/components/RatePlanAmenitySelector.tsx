import React from 'react'
import { IoIosCheckbox, IoIosSquareOutline, IoIosWifi, IoIosWater } from 'react-icons/io'
import { Box } from './base/Box'
import type { RatePlanFeatures } from '@/store/slices/ratePlanSlice'
import type { Property } from '@/types/property'

interface RatePlanAmenitySelectorProps {
  /**
   * Current property with available amenities
   */
  property: Property | null
  
  /**
   * Current rate plan features (selected amenities)
   */
  features: RatePlanFeatures | undefined
  
  /**
   * Callback when amenity selection changes
   */
  onChange: (features: RatePlanFeatures) => void
  
  /**
   * Rate plan ID for the features
   */
  ratePlanId: string
}

/**
 * RatePlan Amenity Selector Component
 * 
 * Allows selection of property amenities to include with a rate plan.
 * Only amenities available on the property can be selected.
 * 
 * Features:
 * - Multi-select amenities from property's available amenities
 * - Visual indication of included vs excluded amenities
 * - Categorized display of amenities
 * - Real-time updates to rate plan features
 * 
 * @example
 * ```tsx
 * <RatePlanAmenitySelector
 *   property={currentProperty}
 *   features={currentForm.features}
 *   ratePlanId={currentForm.id || 'new'}
 *   onChange={(features) => handleFieldChange('features', features)}
 * />
 * ```
 */
const RatePlanAmenitySelector: React.FC<RatePlanAmenitySelectorProps> = ({
  property,
  features,
  onChange
}) => {
  // Get selected amenity IDs
  const selectedAmenityIds = features?.includedAmenityIds || []
  
  // Get available amenities from property
  const availableAmenities = property?.amenities || []
  
  // Group amenities by category
  const amenitiesByCategory = availableAmenities.reduce((acc, amenity) => {
    const category = amenity.category || 'General'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(amenity)
    return acc
  }, {} as Record<string, typeof availableAmenities>)
  
  // Handle amenity toggle
  const handleAmenityToggle = (amenityId: string) => {
    const newSelectedIds = selectedAmenityIds.includes(amenityId)
      ? selectedAmenityIds.filter(id => id !== amenityId)
      : [...selectedAmenityIds, amenityId]
    
    // Only send the data needed by the server, no IDs
    const updatedFeatures: Partial<RatePlanFeatures> = {
      includedAmenityIds: newSelectedIds
    }
    
    onChange(updatedFeatures as RatePlanFeatures)
  }
  
  // Handle select all/none for a category
  const handleCategoryToggle = (_category: string, amenities: typeof availableAmenities) => {
    const categoryAmenityIds = amenities.map(a => a.id!)
    const allSelected = categoryAmenityIds.every(id => selectedAmenityIds.includes(id))
    
    let newSelectedIds: string[]
    if (allSelected) {
      // Remove all category amenities
      newSelectedIds = selectedAmenityIds.filter(id => !categoryAmenityIds.includes(id))
    } else {
      // Add all category amenities
      const idsToAdd = categoryAmenityIds.filter(id => !selectedAmenityIds.includes(id))
      newSelectedIds = [...selectedAmenityIds, ...idsToAdd]
    }
    
    // Only send the data needed by the server, no IDs
    const updatedFeatures: Partial<RatePlanFeatures> = {
      includedAmenityIds: newSelectedIds
    }
    
    onChange(updatedFeatures as RatePlanFeatures)
  }
  
  // Get icon for amenity
  const getAmenityIcon = (amenity: typeof availableAmenities[0]) => {
    const name = amenity.name.toLowerCase()
    if (name.includes('wifi') || name.includes('internet')) return <IoIosWifi />
    if (name.includes('pool') || name.includes('water')) return <IoIosWater />
    return <IoIosCheckbox />
  }
  
  if (!property || availableAmenities.length === 0) {
    return (
      <Box
        padding="2rem"
        textAlign="center"
        backgroundColor="#f9fafb"
        borderRadius="8px"
        border="1px solid #e5e7eb"
      >
        <Box
          fontSize="1rem"
          fontWeight="500"
          color="#6b7280"
          marginBottom="0.5rem"
        >
          No Amenities Available
        </Box>
        <Box fontSize="0.875rem" color="#9ca3af">
          {!property 
            ? 'Please select a property first to choose amenities'
            : 'This property has no amenities configured. Add amenities to the property first.'
          }
        </Box>
      </Box>
    )
  }
  
  return (
    <Box display="flex" flexDirection="column" gap="1.5rem">
      {/* Header with summary */}
      <Box>
        <Box
          fontSize="1rem"
          fontWeight="600"
          color="#374151"
          marginBottom="0.5rem"
        >
          Included Amenities
        </Box>
        <Box fontSize="0.875rem" color="#6b7280">
          Select which amenities are included FREE with this rate plan.
          Unselected amenities will be available at extra cost.
        </Box>
        <Box
          fontSize="0.875rem"
          color="#059669"
          fontWeight="500"
          marginTop="0.25rem"
        >
          {selectedAmenityIds.length} of {availableAmenities.length} amenities included
        </Box>
      </Box>
      
      {/* Amenities by category */}
      {Object.entries(amenitiesByCategory).map(([category, amenities]) => {
        const categoryAmenityIds = amenities.map(a => a.id!)
        const selectedInCategory = categoryAmenityIds.filter(id => selectedAmenityIds.includes(id)).length
        const allSelected = selectedInCategory === categoryAmenityIds.length
        const noneSelected = selectedInCategory === 0
        
        return (
          <Box key={category}>
            {/* Category header */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              marginBottom="0.75rem"
              paddingBottom="0.5rem"
              borderBottom="1px solid #e5e7eb"
            >
              <Box
                fontSize="0.9375rem"
                fontWeight="600"
                color="#374151"
                display="flex"
                alignItems="center"
                gap="0.5rem"
              >
                {category}
                <Box
                  fontSize="0.75rem"
                  fontWeight="400"
                  color="#6b7280"
                  backgroundColor="#f3f4f6"
                  padding="0.125rem 0.375rem"
                  borderRadius="0.25rem"
                >
                  {selectedInCategory}/{amenities.length}
                </Box>
              </Box>
              
              <button
                onClick={() => handleCategoryToggle(category, amenities)}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: allSelected ? '#dc2626' : '#059669',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = allSelected ? '#fee2e2' : '#f0fdf4'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                {allSelected ? 'Exclude All' : noneSelected ? 'Include All' : 'Include All'}
              </button>
            </Box>
            
            {/* Amenity checkboxes */}
            <Box
              display="grid"
              gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))"
              gap="0.75rem"
            >
              {amenities.map((amenity) => {
                const isSelected = selectedAmenityIds.includes(amenity.id!)
                
                return (
                  <Box
                    key={amenity.id}
                    display="flex"
                    alignItems="center"
                    gap="0.75rem"
                    padding="0.75rem"
                    backgroundColor={isSelected ? '#f0fdf4' : '#ffffff'}
                    border={isSelected ? '2px solid #22c55e' : '1px solid #e5e7eb'}
                    borderRadius="8px"
                    cursor="pointer"
                    transition="all 0.2s ease"
                    onClick={() => handleAmenityToggle(amenity.id!)}
                    whileHover={{
                      backgroundColor: isSelected ? '#ecfdf5' : '#f9fafb',
                      borderColor: isSelected ? '#16a34a' : '#d1d5db'
                    }}
                  >
                    {/* Checkbox */}
                    <Box
                      fontSize="1.25rem"
                      color={isSelected ? '#22c55e' : '#9ca3af'}
                      flexShrink={0}
                    >
                      {isSelected ? <IoIosCheckbox /> : <IoIosSquareOutline />}
                    </Box>
                    
                    {/* Amenity icon */}
                    <Box
                      fontSize="1rem"
                      color={isSelected ? '#059669' : '#6b7280'}
                      flexShrink={0}
                    >
                      {getAmenityIcon(amenity)}
                    </Box>
                    
                    {/* Amenity info */}
                    <Box flex="1">
                      <Box
                        fontSize="0.875rem"
                        fontWeight="500"
                        color={isSelected ? '#065f46' : '#374151'}
                        marginBottom="0.125rem"
                      >
                        {amenity.name}
                      </Box>
                    </Box>
                    
                    {/* Status indicator */}
                    <Box
                      fontSize="0.75rem"
                      fontWeight="500"
                      color={isSelected ? '#059669' : '#ef4444'}
                      backgroundColor={isSelected ? '#dcfce7' : '#fee2e2'}
                      padding="0.125rem 0.375rem"
                      borderRadius="0.25rem"
                      flexShrink={0}
                    >
                      {isSelected ? 'FREE' : 'Extra Cost'}
                    </Box>
                  </Box>
                )
              })}
            </Box>
          </Box>
        )
      })}
      
      {/* Help text */}
      <Box
        padding="1rem"
        backgroundColor="#eff6ff"
        borderRadius="8px"
        border="1px solid #bfdbfe"
      >
        <Box
          fontSize="0.875rem"
          color="#1e40af"
          lineHeight="1.4"
        >
          <Box fontWeight="600" marginBottom="0.25rem">💡 Pro Tip:</Box>
          Include popular amenities (WiFi, parking, pool access) to make your rate plan more attractive. 
          Guests prefer knowing what's included upfront rather than paying extra fees later.
        </Box>
      </Box>
    </Box>
  )
}

export default RatePlanAmenitySelector