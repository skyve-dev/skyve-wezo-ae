import { useState } from 'react'
import SlidingDrawer from '../SlidingDrawer'
import SelectionPicker from '../SelectionPicker'
import { Box } from '../Box'
import { ParkingType, PetPolicy, Currency } from '../../constants/propertyEnums'
import useDrawerManager from '../../hooks/useDrawerManager'

interface FilterState {
  priceRange: [number, number]
  amenities: string[]
  parking: ParkingType | null
  petPolicy: PetPolicy | null
  bedrooms: number | null
  bathrooms: number | null
  propertyTypes: string[]
  currency: Currency
}

/**
 * Mobile-optimized property filters using SlidingDrawer and SelectionPicker
 */
export function MobilePropertyFilters() {
  const drawerManager = useDrawerManager()
  
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [100, 2000],
    amenities: [],
    parking: null,
    petPolicy: null,
    bedrooms: null,
    bathrooms: null,
    propertyTypes: [],
    currency: Currency.AED
  })
  
  const amenityOptions = [
    { id: 'wifi', name: 'WiFi', icon: '📶', category: 'Essential' },
    { id: 'kitchen', name: 'Full Kitchen', icon: '🍳', category: 'Essential' },
    { id: 'parking', name: 'Parking', icon: '🚗', category: 'Convenience' },
    { id: 'pool', name: 'Swimming Pool', icon: '🏊', category: 'Luxury' },
    { id: 'gym', name: 'Gym/Fitness Center', icon: '💪', category: 'Fitness' },
    { id: 'spa', name: 'Spa', icon: '💆', category: 'Luxury' },
    { id: 'beach', name: 'Beach Access', icon: '🏖️', category: 'Location' },
    { id: 'balcony', name: 'Balcony/Terrace', icon: '🌅', category: 'Features' },
    { id: 'ac', name: 'Air Conditioning', icon: '❄️', category: 'Climate' },
    { id: 'heating', name: 'Heating', icon: '🔥', category: 'Climate' },
    { id: 'washer', name: 'Washer', icon: '👕', category: 'Laundry' },
    { id: 'dryer', name: 'Dryer', icon: '🌀', category: 'Laundry' }
  ]
  
  const parkingOptions = [
    { value: ParkingType.YesFree, label: 'Free Parking Available', description: 'No additional cost' },
    { value: ParkingType.YesPaid, label: 'Paid Parking Available', description: 'Additional charges may apply' },
    { value: ParkingType.No, label: 'No Parking', description: 'Street parking only' }
  ]
  
  const petPolicyOptions = [
    { value: PetPolicy.Yes, label: 'Pets Welcome', description: 'All pets are allowed' },
    { value: PetPolicy.UponRequest, label: 'Pets Upon Request', description: 'Contact host for approval' },
    { value: PetPolicy.No, label: 'No Pets', description: 'Pets are not allowed' }
  ]
  
  const propertyTypeOptions = [
    { id: 'villa', name: 'Villa', icon: '🏡' },
    { id: 'apartment', name: 'Apartment', icon: '🏢' },
    { id: 'townhouse', name: 'Townhouse', icon: '🏘️' },
    { id: 'penthouse', name: 'Penthouse', icon: '🏙️' },
    { id: 'studio', name: 'Studio', icon: '🏠' },
    { id: 'loft', name: 'Loft', icon: '🏭' }
  ]
  
  const bedroomOptions = [1, 2, 3, 4, 5].map(num => ({
    value: num,
    label: num === 5 ? '5+ Bedrooms' : `${num} Bedroom${num > 1 ? 's' : ''}`
  }))
  
  const bathroomOptions = [1, 2, 3, 4].map(num => ({
    value: num,
    label: num === 4 ? '4+ Bathrooms' : `${num} Bathroom${num > 1 ? 's' : ''}`
  }))
  
  const updateFilters = (updates: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }))
  }
  
  const clearAllFilters = () => {
    setFilters({
      priceRange: [100, 2000],
      amenities: [],
      parking: null,
      petPolicy: null,
      bedrooms: null,
      bathrooms: null,
      propertyTypes: [],
      currency: Currency.AED
    })
  }
  
  const getActiveFilterCount = () => {
    let count = 0
    if (filters.amenities.length > 0) count++
    if (filters.parking) count++
    if (filters.petPolicy) count++
    if (filters.bedrooms) count++
    if (filters.bathrooms) count++
    if (filters.propertyTypes.length > 0) count++
    if (filters.priceRange[0] !== 100 || filters.priceRange[1] !== 2000) count++
    return count
  }
  
  return (
    <Box padding="1rem">
      <Box maxWidth="400px" margin="0 auto">
        {/* Filter Trigger Buttons */}
        <Box
          display="grid"
          gridTemplateColumns="repeat(2, 1fr)"
          gap="0.75rem"
          marginBottom="1.5rem"
        >
          <Box
            as="button"
            onClick={() => drawerManager.openDrawer('amenities')}
            padding="0.75rem"
            backgroundColor="white"
            border="1px solid #e5e7eb"
            borderRadius="0.5rem"
            cursor="pointer"
            textAlign="left"
            whileHover={{ borderColor: '#3182ce' }}
          >
            <Box fontSize="0.875rem" fontWeight="500" color="#374151">
              Amenities
              {filters.amenities.length > 0 && (
                <Box
                  as="span"
                  marginLeft="0.5rem"
                  padding="0.125rem 0.5rem"
                  backgroundColor="#3182ce"
                  color="white"
                  borderRadius="1rem"
                  fontSize="0.75rem"
                >
                  {filters.amenities.length}
                </Box>
              )}
            </Box>
          </Box>
          
          <Box
            as="button"
            onClick={() => drawerManager.openDrawer('property-type')}
            padding="0.75rem"
            backgroundColor="white"
            border="1px solid #e5e7eb"
            borderRadius="0.5rem"
            cursor="pointer"
            textAlign="left"
            whileHover={{ borderColor: '#3182ce' }}
          >
            <Box fontSize="0.875rem" fontWeight="500" color="#374151">
              Property Type
              {filters.propertyTypes.length > 0 && (
                <Box
                  as="span"
                  marginLeft="0.5rem"
                  padding="0.125rem 0.5rem"
                  backgroundColor="#3182ce"
                  color="white"
                  borderRadius="1rem"
                  fontSize="0.75rem"
                >
                  {filters.propertyTypes.length}
                </Box>
              )}
            </Box>
          </Box>
          
          <Box
            as="button"
            onClick={() => drawerManager.openDrawer('rooms')}
            padding="0.75rem"
            backgroundColor="white"
            border="1px solid #e5e7eb"
            borderRadius="0.5rem"
            cursor="pointer"
            textAlign="left"
            whileHover={{ borderColor: '#3182ce' }}
          >
            <Box fontSize="0.875rem" fontWeight="500" color="#374151">
              Bedrooms & Baths
              {(filters.bedrooms || filters.bathrooms) && (
                <Box
                  as="span"
                  marginLeft="0.5rem"
                  width="0.5rem"
                  height="0.5rem"
                  backgroundColor="#3182ce"
                  borderRadius="50%"
                  display="inline-block"
                />
              )}
            </Box>
          </Box>
          
          <Box
            as="button"
            onClick={() => drawerManager.openDrawer('policies')}
            padding="0.75rem"
            backgroundColor="white"
            border="1px solid #e5e7eb"
            borderRadius="0.5rem"
            cursor="pointer"
            textAlign="left"
            whileHover={{ borderColor: '#3182ce' }}
          >
            <Box fontSize="0.875rem" fontWeight="500" color="#374151">
              Parking & Pets
              {(filters.parking || filters.petPolicy) && (
                <Box
                  as="span"
                  marginLeft="0.5rem"
                  width="0.5rem"
                  height="0.5rem"
                  backgroundColor="#3182ce"
                  borderRadius="50%"
                  display="inline-block"
                />
              )}
            </Box>
          </Box>
        </Box>
        
        {/* Active Filters Summary */}
        {getActiveFilterCount() > 0 && (
          <Box
            backgroundColor="white"
            border="1px solid #e5e7eb"
            borderRadius="0.5rem"
            padding="1rem"
            marginBottom="1rem"
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="0.5rem">
              <Box fontSize="0.875rem" fontWeight="600" color="#374151">
                Active Filters ({getActiveFilterCount()})
              </Box>
              <Box
                as="button"
                onClick={clearAllFilters}
                fontSize="0.75rem"
                color="#3182ce"
                backgroundColor="transparent"
                border="none"
                cursor="pointer"
              >
                Clear All
              </Box>
            </Box>
            <Box display="flex" flexWrap="wrap" gap="0.5rem">
              {filters.amenities.slice(0, 3).map(amenityId => {
                const amenity = amenityOptions.find(a => a.id === amenityId)
                return amenity ? (
                  <Box
                    key={amenityId}
                    padding="0.25rem 0.5rem"
                    backgroundColor="#dbeafe"
                    color="#1e40af"
                    borderRadius="0.25rem"
                    fontSize="0.75rem"
                  >
                    {amenity.icon} {amenity.name}
                  </Box>
                ) : null
              })}
              {filters.amenities.length > 3 && (
                <Box
                  padding="0.25rem 0.5rem"
                  backgroundColor="#f3f4f6"
                  color="#6b7280"
                  borderRadius="0.25rem"
                  fontSize="0.75rem"
                >
                  +{filters.amenities.length - 3} more
                </Box>
              )}
            </Box>
          </Box>
        )}
        
        {/* Search Results Button */}
        <Box
          as="button"
          width="100%"
          padding="1rem"
          backgroundColor="#3182ce"
          color="white"
          border="none"
          borderRadius="0.5rem"
          fontSize="1rem"
          fontWeight="600"
          cursor="pointer"
          whileHover={{ backgroundColor: '#2563eb' }}
        >
          Search Properties
        </Box>
      </Box>
      
      {/* Amenities Drawer */}
      <SlidingDrawer
        isOpen={drawerManager.isDrawerOpen('amenities')}
        onClose={() => drawerManager.closeDrawer('amenities')}
        side="bottom"
        height="80vh"
        zIndex={drawerManager.getDrawerZIndex('amenities')}
        showCloseButton
      >
        <Box padding="1.5rem">
          <Box fontSize="1.5rem" fontWeight="bold" marginBottom="0.5rem">
            Amenities
          </Box>
          <Box fontSize="0.875rem" color="#6b7280" marginBottom="1.5rem">
            Select amenities you'd like in your property
          </Box>
          
          <SelectionPicker
            data={amenityOptions}
            idAccessor={(amenity) => amenity.id}
            value={filters.amenities}
            onChange={(value) => updateFilters({ amenities: value as string[] })}
            isMultiSelect={true}
            renderItem={(amenity, isSelected) => (
              <Box display="flex" alignItems="center" gap="0.75rem">
                <Box fontSize="1.5rem">{amenity.icon}</Box>
                <Box flex="1">
                  <Box fontWeight={isSelected ? '600' : '400'}>
                    {amenity.name}
                  </Box>
                  <Box fontSize="0.75rem" color="#6b7280">
                    {amenity.category}
                  </Box>
                </Box>
                {isSelected && (
                  <Box color="#10b981" fontSize="1.25rem">✓</Box>
                )}
              </Box>
            )}
            containerStyles={{
              maxHeight: '50vh',
              overflow: 'auto'
            }}
          />
          
          <Box
            display="flex"
            gap="1rem"
            marginTop="2rem"
            paddingTop="1rem"
            borderTop="1px solid #e5e7eb"
          >
            <Box
              as="button"
              flex="1"
              padding="0.75rem"
              backgroundColor="#f3f4f6"
              color="#374151"
              border="none"
              borderRadius="0.375rem"
              cursor="pointer"
              onClick={() => updateFilters({ amenities: [] })}
            >
              Clear
            </Box>
            <Box
              as="button"
              flex="1"
              padding="0.75rem"
              backgroundColor="#3182ce"
              color="white"
              border="none"
              borderRadius="0.375rem"
              cursor="pointer"
              onClick={() => drawerManager.closeDrawer('amenities')}
            >
              Apply ({filters.amenities.length})
            </Box>
          </Box>
        </Box>
      </SlidingDrawer>
      
      {/* Property Type Drawer */}
      <SlidingDrawer
        isOpen={drawerManager.isDrawerOpen('property-type')}
        onClose={() => drawerManager.closeDrawer('property-type')}
        side="bottom"
        height="60vh"
        zIndex={drawerManager.getDrawerZIndex('property-type')}
        showCloseButton
      >
        <Box padding="1.5rem">
          <Box fontSize="1.5rem" fontWeight="bold" marginBottom="0.5rem">
            Property Type
          </Box>
          <Box fontSize="0.875rem" color="#6b7280" marginBottom="1.5rem">
            What type of property are you looking for?
          </Box>
          
          <SelectionPicker
            data={propertyTypeOptions}
            idAccessor={(type) => type.id}
            value={filters.propertyTypes}
            onChange={(value) => updateFilters({ propertyTypes: value as string[] })}
            isMultiSelect={true}
            renderItem={(type, isSelected) => (
              <Box display="flex" alignItems="center" gap="1rem">
                <Box fontSize="2rem">{type.icon}</Box>
                <Box flex="1" fontWeight={isSelected ? '600' : '400'}>
                  {type.name}
                </Box>
                {isSelected && (
                  <Box color="#10b981" fontSize="1.25rem">✓</Box>
                )}
              </Box>
            )}
          />
          
          <Box
            display="flex"
            gap="1rem"
            marginTop="2rem"
            paddingTop="1rem"
            borderTop="1px solid #e5e7eb"
          >
            <Box
              as="button"
              flex="1"
              padding="0.75rem"
              backgroundColor="#f3f4f6"
              color="#374151"
              border="none"
              borderRadius="0.375rem"
              cursor="pointer"
              onClick={() => updateFilters({ propertyTypes: [] })}
            >
              Clear
            </Box>
            <Box
              as="button"
              flex="1"
              padding="0.75rem"
              backgroundColor="#3182ce"
              color="white"
              border="none"
              borderRadius="0.375rem"
              cursor="pointer"
              onClick={() => drawerManager.closeDrawer('property-type')}
            >
              Apply ({filters.propertyTypes.length})
            </Box>
          </Box>
        </Box>
      </SlidingDrawer>
      
      {/* Rooms Drawer */}
      <SlidingDrawer
        isOpen={drawerManager.isDrawerOpen('rooms')}
        onClose={() => drawerManager.closeDrawer('rooms')}
        side="bottom"
        height="60vh"
        zIndex={drawerManager.getDrawerZIndex('rooms')}
        showCloseButton
      >
        <Box padding="1.5rem">
          <Box fontSize="1.5rem" fontWeight="bold" marginBottom="1.5rem">
            Bedrooms & Bathrooms
          </Box>
          
          <Box marginBottom="2rem">
            <Box fontSize="1rem" fontWeight="600" marginBottom="1rem">
              Bedrooms
            </Box>
            <SelectionPicker
              data={bedroomOptions}
              idAccessor={(option) => option.value.toString()}
              value={filters.bedrooms?.toString() || ''}
              onChange={(value) => updateFilters({ bedrooms: value ? parseInt(value as string) : null })}
              isMultiSelect={false}
              labelAccessor={(option) => option.label}
            />
          </Box>
          
          <Box>
            <Box fontSize="1rem" fontWeight="600" marginBottom="1rem">
              Bathrooms
            </Box>
            <SelectionPicker
              data={bathroomOptions}
              idAccessor={(option) => option.value.toString()}
              value={filters.bathrooms?.toString() || ''}
              onChange={(value) => updateFilters({ bathrooms: value ? parseInt(value as string) : null })}
              isMultiSelect={false}
              labelAccessor={(option) => option.label}
            />
          </Box>
          
          <Box
            display="flex"
            gap="1rem"
            marginTop="2rem"
            paddingTop="1rem"
            borderTop="1px solid #e5e7eb"
          >
            <Box
              as="button"
              flex="1"
              padding="0.75rem"
              backgroundColor="#f3f4f6"
              color="#374151"
              border="none"
              borderRadius="0.375rem"
              cursor="pointer"
              onClick={() => updateFilters({ bedrooms: null, bathrooms: null })}
            >
              Clear
            </Box>
            <Box
              as="button"
              flex="1"
              padding="0.75rem"
              backgroundColor="#3182ce"
              color="white"
              border="none"
              borderRadius="0.375rem"
              cursor="pointer"
              onClick={() => drawerManager.closeDrawer('rooms')}
            >
              Apply
            </Box>
          </Box>
        </Box>
      </SlidingDrawer>
      
      {/* Policies Drawer */}
      <SlidingDrawer
        isOpen={drawerManager.isDrawerOpen('policies')}
        onClose={() => drawerManager.closeDrawer('policies')}
        side="bottom"
        height="70vh"
        zIndex={drawerManager.getDrawerZIndex('policies')}
        showCloseButton
      >
        <Box padding="1.5rem">
          <Box fontSize="1.5rem" fontWeight="bold" marginBottom="1.5rem">
            Parking & Pet Policies
          </Box>
          
          <Box marginBottom="2rem">
            <Box fontSize="1rem" fontWeight="600" marginBottom="1rem">
              Parking Options
            </Box>
            <SelectionPicker
              data={parkingOptions}
              idAccessor={(option) => option.value}
              value={filters.parking || ''}
              onChange={(value) => updateFilters({ parking: value as ParkingType || null })}
              isMultiSelect={false}
              renderItem={(option, isSelected) => (
                <Box>
                  <Box fontWeight={isSelected ? '600' : '400'}>
                    {option.label}
                  </Box>
                  <Box fontSize="0.75rem" color="#6b7280" marginTop="0.25rem">
                    {option.description}
                  </Box>
                </Box>
              )}
            />
          </Box>
          
          <Box>
            <Box fontSize="1rem" fontWeight="600" marginBottom="1rem">
              Pet Policy
            </Box>
            <SelectionPicker
              data={petPolicyOptions}
              idAccessor={(option) => option.value}
              value={filters.petPolicy || ''}
              onChange={(value) => updateFilters({ petPolicy: value as PetPolicy || null })}
              isMultiSelect={false}
              renderItem={(option, isSelected) => (
                <Box>
                  <Box fontWeight={isSelected ? '600' : '400'}>
                    {option.label}
                  </Box>
                  <Box fontSize="0.75rem" color="#6b7280" marginTop="0.25rem">
                    {option.description}
                  </Box>
                </Box>
              )}
            />
          </Box>
          
          <Box
            display="flex"
            gap="1rem"
            marginTop="2rem"
            paddingTop="1rem"
            borderTop="1px solid #e5e7eb"
          >
            <Box
              as="button"
              flex="1"
              padding="0.75rem"
              backgroundColor="#f3f4f6"
              color="#374151"
              border="none"
              borderRadius="0.375rem"
              cursor="pointer"
              onClick={() => updateFilters({ parking: null, petPolicy: null })}
            >
              Clear
            </Box>
            <Box
              as="button"
              flex="1"
              padding="0.75rem"
              backgroundColor="#3182ce"
              color="white"
              border="none"
              borderRadius="0.375rem"
              cursor="pointer"
              onClick={() => drawerManager.closeDrawer('policies')}
            >
              Apply
            </Box>
          </Box>
        </Box>
      </SlidingDrawer>
    </Box>
  )
}

export default MobilePropertyFilters