import React, { useState } from 'react'
import { WizardFormData } from '../../types/property'
import { Box } from '../Box'
import SelectionPicker from '../SelectionPicker'
import SlidingDrawer from '../SlidingDrawer'
import useDrawerManager from '../../hooks/useDrawerManager'
import { 
  PROPERTY_AMENITIES, 
  getSelectionPattern, 
  shouldShowSearch, 
  getDrawerHeight 
} from '../../utils/selectionUtils'
import { FaHome, FaSearch, FaFilter } from 'react-icons/fa'

interface AmenitiesStepProps {
  data: WizardFormData
  onChange: (updates: Partial<WizardFormData>) => void
  onNext: () => void
  onPrevious: () => void
  onSubmit: () => void
  loading: boolean
  isFirstStep: boolean
  isLastStep: boolean
}

// Group amenities by category for organized display
const amenityCategories = PROPERTY_AMENITIES.reduce((acc, amenity) => {
  if (!acc[amenity.category]) {
    acc[amenity.category] = []
  }
  acc[amenity.category].push(amenity)
  return acc
}, {} as Record<string, typeof PROPERTY_AMENITIES>)

const AmenitiesStep: React.FC<AmenitiesStepProps> = ({
  data,
  onChange,
  onNext,
  onPrevious,
  loading
}) => {
  const selectedAmenities = data.amenities || []
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const drawerManager = useDrawerManager()
  
  // Determine selection pattern
  const selectionPattern = getSelectionPattern(PROPERTY_AMENITIES.length)
  const showSearch = shouldShowSearch(PROPERTY_AMENITIES.length)
  
  // Filter amenities based on search and category
  const filteredAmenities = PROPERTY_AMENITIES.filter(amenity => {
    const matchesSearch = amenity.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || amenity.category === selectedCategory
    return matchesSearch && matchesCategory
  })
  
  const categories = ['All', ...Object.keys(amenityCategories)]

  // Legacy functions kept for compatibility (unused in new implementation)
  // const toggleAmenity = (amenityId: string) => { ... }
  // const isSelected = (amenityId: string) => { ... }
  
  const handleAmenitySelection = (selectedIds: string[]) => {
    const newAmenities = selectedIds.map(id => {
      const amenity = PROPERTY_AMENITIES.find(a => a.id === id)
      return amenity ? { name: amenity.name, category: amenity.category } : null
    }).filter(Boolean) as { name: string; category: string }[]
    
    onChange({ amenities: newAmenities })
  }
  
  const selectedAmenityIds = selectedAmenities.map(a => {
    const amenity = PROPERTY_AMENITIES.find(prop => prop.name === a.name)
    return amenity?.id
  }).filter(Boolean) as string[]

  return (
    <Box padding="2rem">
      <Box marginBottom="2rem">
        <Box fontSize="1.5rem" fontWeight="600" color="#1a202c" marginBottom="0.5rem">
          What amenities do you offer?
        </Box>
        <Box color="#718096">
          Select all the amenities your guests will have access to
        </Box>
      </Box>

      {selectionPattern === 'inline' ? (
        <Box display="flex" flexDirection="column" gap="2rem">
          {Object.entries(amenityCategories).map(([category, amenities]) => (
            <Box key={category}>
              <Box fontSize="1.125rem" fontWeight="500" color="#374151" marginBottom="1rem">
                {category}
              </Box>
              <SelectionPicker
                data={amenities}
                idAccessor={(amenity) => amenity.id}
                value={selectedAmenityIds}
                onChange={(values) => handleAmenitySelection(values as string[])}
                isMultiSelect={true}
                renderItem={(amenity, isSelected) => (
                  <Box display="flex" alignItems="center" gap="0.75rem" width="100%">
                    <Box
                      fontSize="0.875rem"
                      fontWeight={isSelected ? '600' : '400'}
                      color={amenity.essential ? '#f59e0b' : '#374151'}
                      flex="1"
                    >
                      {amenity.name}
                      {amenity.essential && (
                        <Box
                          as="span"
                          fontSize="0.625rem"
                          fontWeight="700"
                          color="#f59e0b"
                          backgroundColor="#fef3c7"
                          padding="0.125rem 0.375rem"
                          borderRadius="0.75rem"
                          marginLeft="0.5rem"
                        >
                          ESSENTIAL
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}
                containerStyles={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '0.75rem'
                }}
                selectedItemStyles={{
                  borderColor: '#3182ce',
                  backgroundColor: '#eff6ff'
                }}
              />
            </Box>
          ))}
        </Box>
      ) : (
        <Box>
          <Box
            as="div"
            onClick={() => drawerManager.openDrawer('amenities-selection')}
            width="100%"
            padding="1rem"
            border="2px dashed #d1d5db"
            borderRadius="0.75rem"
            backgroundColor="#f9fafb"
            cursor="pointer"
            textAlign="center"
            whileHover={{ borderColor: '#3182ce', backgroundColor: '#f8fafc' }}
          >
            <Box display="flex" flexDirection="column" alignItems="center" gap="0.5rem">
              <Box fontSize="2rem" color="#6b7280">
                <FaHome />
              </Box>
              <Box fontSize="1rem" fontWeight="600" color="#374151">
                {selectedAmenities.length === 0 
                  ? 'Select Amenities' 
                  : `${selectedAmenities.length} amenities selected`
                }
              </Box>
              <Box fontSize="0.875rem" color="#6b7280">
                {selectedAmenities.length === 0 
                  ? 'Tap to choose from over 30 available amenities'
                  : 'Tap to modify your selection'
                }
              </Box>
              {selectedAmenities.length > 0 && (
                <Box display="flex" flexWrap="wrap" gap="0.5rem" marginTop="0.5rem" justifyContent="center">
                  {selectedAmenities.slice(0, 6).map((amenity, index) => (
                    <Box
                      key={index}
                      fontSize="0.75rem"
                      backgroundColor="#3182ce"
                      color="white"
                      padding="0.25rem 0.5rem"
                      borderRadius="0.375rem"
                    >
                      {amenity.name}
                    </Box>
                  ))}
                  {selectedAmenities.length > 6 && (
                    <Box
                      fontSize="0.75rem"
                      backgroundColor="#6b7280"
                      color="white"
                      padding="0.25rem 0.5rem"
                      borderRadius="0.375rem"
                    >
                      +{selectedAmenities.length - 6} more
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Box>
          
          <SlidingDrawer
            isOpen={drawerManager.isDrawerOpen('amenities-selection')}
            onClose={() => drawerManager.closeDrawer('amenities-selection')}
            side="bottom"
            height={getDrawerHeight(PROPERTY_AMENITIES.length)}
            zIndex={drawerManager.getDrawerZIndex('amenities-selection')}
            showCloseButton
          >
            <Box padding="1.5rem" display={'flex'} flexDirection={'column'} overflow={'auto'} >
              <Box fontSize="1.25rem" fontWeight="600" marginBottom="0.5rem" textAlign="center">
                Select Amenities
              </Box>
              <Box fontSize="0.875rem" color="#6b7280" marginBottom="1.5rem" textAlign="center">
                Choose all amenities your guests will have access to
              </Box>
              
              {showSearch && (
                <Box marginBottom="1rem">
                  <Box position="relative">
                    <Box
                      as="input"
                      type="text"
                      placeholder="Search amenities..."
                      value={searchQuery}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                      width="100%"
                      padding="0.75rem 0.75rem 0.75rem 2.5rem"
                      border="1px solid #d1d5db"
                      borderRadius="0.5rem"
                      fontSize="0.875rem"
                    />
                    <Box
                      position="absolute"
                      left="0.75rem"
                      top="50%"
                      transform="translateY(-50%)"
                      color="#6b7280"
                    >
                      <FaSearch />
                    </Box>
                  </Box>
                </Box>
              )}
              
              <Box marginBottom="1rem">
                <Box display="flex" gap="0.5rem" flexWrap="wrap">
                  {categories.map((category) => (
                    <Box
                      key={category}
                      as="button"
                      onClick={() => setSelectedCategory(category)}
                      padding="0.5rem 1rem"
                      fontSize="0.75rem"
                      fontWeight="500"
                      backgroundColor={selectedCategory === category ? '#3182ce' : '#f3f4f6'}
                      color={selectedCategory === category ? 'white' : '#374151'}
                      border="none"
                      borderRadius="1rem"
                      cursor="pointer"
                      whileHover={{
                        backgroundColor: selectedCategory === category ? '#2563eb' : '#e5e7eb'
                      }}
                    >
                      <Box display="flex" alignItems="center" gap="0.25rem">
                        <FaFilter />
                        {category}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
              
              <SelectionPicker
                data={filteredAmenities}
                idAccessor={(amenity) => amenity.id}
                value={selectedAmenityIds}
                onChange={(values) => handleAmenitySelection(values as string[])}
                isMultiSelect={true}
                renderItem={(amenity, isSelected) => (
                  <Box display="flex" alignItems="center" gap="0.75rem" width="100%">
                    <Box
                      fontSize="0.875rem"
                      fontWeight={isSelected ? '600' : '400'}
                      color={amenity.essential ? '#f59e0b' : '#374151'}
                      flex="1"
                    >
                      {amenity.name}
                      {amenity.essential && (
                        <Box
                          as="span"
                          fontSize="0.625rem"
                          fontWeight="700"
                          color="#f59e0b"
                          backgroundColor="#fef3c7"
                          padding="0.125rem 0.375rem"
                          borderRadius="0.75rem"
                          marginLeft="0.5rem"
                        >
                          ESSENTIAL
                        </Box>
                      )}
                    </Box>
                    <Box fontSize="0.75rem" color="#6b7280">
                      {amenity.category}
                    </Box>
                  </Box>
                )}
                containerStyles={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '0.75rem',
                  maxHeight: '400px',
                  overflow: 'auto'
                }}
                selectedItemStyles={{
                  borderColor: '#3182ce',
                  backgroundColor: '#eff6ff'
                }}
              />
              
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                marginTop="1.5rem"
                paddingTop="1rem"
                borderTop="1px solid #e5e7eb"
              >
                <Box fontSize="0.875rem" color="#6b7280">
                  {selectedAmenities.length} selected
                </Box>
                <Box
                  as="button"
                  onClick={() => drawerManager.closeDrawer('amenities-selection')}
                  padding="0.75rem 1.5rem"
                  backgroundColor="#3182ce"
                  color="white"
                  border="none"
                  borderRadius="0.375rem"
                  fontSize="0.875rem"
                  fontWeight="600"
                  cursor="pointer"
                  whileHover={{ backgroundColor: '#2563eb' }}
                >
                  Done
                </Box>
              </Box>
            </Box>
          </SlidingDrawer>
        </Box>
      )}

      {/* Navigation */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginTop="3rem"
        paddingTop="2rem"
        borderTop="1px solid #e5e7eb"
      >
        <Box>
          <Box
            as="button"
            onClick={onPrevious}
            padding="0.75rem 1.5rem"
            backgroundColor="transparent"
            color="#6b7280"
            border="1px solid #d1d5db"
            borderRadius="0.375rem"
            fontSize="1rem"
            cursor="pointer"
            whileHover={{ borderColor: '#9ca3af', backgroundColor: '#f9fafb' }}
          >
            Previous
          </Box>
        </Box>

        <Box>
          <Box
            as="button"
            onClick={onNext}
            disabled={loading}
            padding="0.75rem 2rem"
            backgroundColor="#3182ce"
            color="white"
            border="none"
            borderRadius="0.375rem"
            fontSize="1rem"
            fontWeight="500"
            cursor="pointer"
            whileHover={{ backgroundColor: '#2c5aa0' }}
          >
            {loading ? 'Saving...' : 'Next'}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default AmenitiesStep