import { useState } from 'react'
import SelectionPicker from '../SelectionPicker'
import { Box } from '../Box'
import { ParkingType, PetPolicy } from '../../constants/propertyEnums'

/**
 * Example of integrating SelectionPicker with property forms
 * This demonstrates how to use the component for various property-related selections
 */
export function PropertySelectionExamples() {
  // Parking type selection
  const [selectedParking, setSelectedParking] = useState<ParkingType>(ParkingType.No)
  
  // Pet policy selection
  const [selectedPetPolicy, setSelectedPetPolicy] = useState<PetPolicy>(PetPolicy.No)
  
  // Amenities selection (multiple)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  
  // Language selection (multiple)
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English'])
  
  const parkingOptions = [
    { value: ParkingType.No, label: 'No parking available', icon: '🚫' },
    { value: ParkingType.YesFree, label: 'Yes, free parking', icon: '🅿️' },
    { value: ParkingType.YesPaid, label: 'Yes, paid parking', icon: '💰' }
  ]
  
  const petOptions = [
    { value: PetPolicy.No, label: 'No pets allowed', description: 'Pets are not permitted' },
    { value: PetPolicy.UponRequest, label: 'Upon request', description: 'Contact host for approval' },
    { value: PetPolicy.Yes, label: 'Pets allowed', description: 'All pets are welcome' }
  ]
  
  const amenityCategories = [
    { id: 'wifi', name: 'WiFi', category: 'Essential' },
    { id: 'kitchen', name: 'Kitchen', category: 'Essential' },
    { id: 'washer', name: 'Washer', category: 'Essential' },
    { id: 'dryer', name: 'Dryer', category: 'Essential' },
    { id: 'ac', name: 'Air conditioning', category: 'Climate' },
    { id: 'heating', name: 'Heating', category: 'Climate' },
    { id: 'pool', name: 'Swimming pool', category: 'Luxury' },
    { id: 'hottub', name: 'Hot tub', category: 'Luxury' },
    { id: 'gym', name: 'Gym', category: 'Fitness' },
    { id: 'parking', name: 'Free parking', category: 'Convenience' }
  ]
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' }
  ]
  
  return (
    <Box padding="2rem" backgroundColor="#f8fafc">
      <Box maxWidth="800px" margin="0 auto">
        <Box fontSize="1.5rem" fontWeight="600" marginBottom="2rem">
          Property Form Selection Examples
        </Box>
        
        {/* Parking Type Selection */}
        <Box marginBottom="2rem">
          <Box fontSize="0.875rem" fontWeight="500" color="#374151" marginBottom="0.5rem">
            Parking Options
          </Box>
          <SelectionPicker
            data={parkingOptions}
            idAccessor={(option) => option.value}
            value={selectedParking}
            onChange={(value) => setSelectedParking(value as ParkingType)}
            isMultiSelect={false}
            renderItem={(option, isSelected) => (
              <Box display="flex" alignItems="center" gap="0.75rem">
                <Box fontSize="1.25rem">{option.icon}</Box>
                <Box flex="1">
                  <Box fontWeight={isSelected ? '600' : '400'}>{option.label}</Box>
                </Box>
              </Box>
            )}
          />
        </Box>
        
        {/* Pet Policy Selection */}
        <Box marginBottom="2rem">
          <Box fontSize="0.875rem" fontWeight="500" color="#374151" marginBottom="0.5rem">
            Pet Policy
          </Box>
          <SelectionPicker
            data={petOptions}
            idAccessor={(option) => option.value}
            value={selectedPetPolicy}
            onChange={(value) => setSelectedPetPolicy(value as PetPolicy)}
            isMultiSelect={false}
            renderItem={(option, isSelected) => (
              <Box>
                <Box fontWeight={isSelected ? '600' : '400'} color="#1a202c">
                  {option.label}
                </Box>
                <Box fontSize="0.75rem" color="#6b7280" marginTop="0.25rem">
                  {option.description}
                </Box>
              </Box>
            )}
          />
        </Box>
        
        {/* Amenities Selection (Multiple) */}
        <Box marginBottom="2rem">
          <Box fontSize="0.875rem" fontWeight="500" color="#374151" marginBottom="0.5rem">
            Property Amenities (Select all that apply)
          </Box>
          <Box fontSize="0.75rem" color="#6b7280" marginBottom="0.5rem">
            Selected: {selectedAmenities.length} amenities
          </Box>
          <SelectionPicker
            data={amenityCategories}
            idAccessor={(amenity) => amenity.id}
            value={selectedAmenities}
            onChange={(value) => setSelectedAmenities(value as string[])}
            isMultiSelect={true}
            renderItem={(amenity, isSelected) => (
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Box fontWeight={isSelected ? '600' : '400'}>{amenity.name}</Box>
                  <Box fontSize="0.75rem" color="#6b7280">{amenity.category}</Box>
                </Box>
                {isSelected && (
                  <Box color="#10b981" fontSize="1.25rem">✓</Box>
                )}
              </Box>
            )}
            containerStyles={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '0.75rem'
            }}
          />
        </Box>
        
        {/* Languages Selection (Multiple) */}
        <Box marginBottom="2rem">
          <Box fontSize="0.875rem" fontWeight="500" color="#374151" marginBottom="0.5rem">
            Languages Spoken
          </Box>
          <Box fontSize="0.75rem" color="#6b7280" marginBottom="0.5rem">
            Select all languages you or your staff can communicate in
          </Box>
          <SelectionPicker
            data={languages}
            idAccessor={(lang) => lang.code}
            value={selectedLanguages}
            onChange={(value) => setSelectedLanguages(value as string[])}
            isMultiSelect={true}
            renderItem={(lang, isSelected) => (
              <Box display="flex" alignItems="center" gap="0.5rem">
                <Box fontSize="1.5rem">{lang.flag}</Box>
                <Box flex="1" fontWeight={isSelected ? '600' : '400'}>
                  {lang.name}
                </Box>
              </Box>
            )}
            containerStyles={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.5rem'
            }}
          />
        </Box>
        
        {/* Summary */}
        <Box 
          marginTop="2rem" 
          padding="1rem" 
          backgroundColor="white" 
          borderRadius="0.5rem"
          border="1px solid #e5e7eb"
        >
          <Box fontSize="1rem" fontWeight="600" marginBottom="0.75rem">
            Current Selections:
          </Box>
          <Box fontSize="0.875rem" color="#4b5563">
            <Box marginBottom="0.25rem">
              <strong>Parking:</strong> {parkingOptions.find(p => p.value === selectedParking)?.label}
            </Box>
            <Box marginBottom="0.25rem">
              <strong>Pet Policy:</strong> {petOptions.find(p => p.value === selectedPetPolicy)?.label}
            </Box>
            <Box marginBottom="0.25rem">
              <strong>Amenities:</strong> {selectedAmenities.length > 0 ? selectedAmenities.join(', ') : 'None selected'}
            </Box>
            <Box>
              <strong>Languages:</strong> {selectedLanguages.join(', ')}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default PropertySelectionExamples