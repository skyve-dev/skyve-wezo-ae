import React from 'react'
import { WizardFormData } from '../../types/property'
import { Box } from '../Box'

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

const amenityCategories = {
  'Basic': [
    'WiFi',
    'Air conditioning', 
    'Kitchen',
    'Free parking',
    'Washer',
    'Dryer',
    'TV',
    'Heating'
  ],
  'Features': [
    'Pool',
    'Hot tub',
    'Gym',
    'BBQ grill',
    'Fire pit',
    'Outdoor furniture',
    'Indoor fireplace',
    'Piano'
  ],
  'Location': [
    'Beachfront',
    'Waterfront',
    'Ski-in/Ski-out',
    'Mountain view',
    'Ocean view',
    'Lake view',
    'City view',
    'Garden view'
  ],
  'Safety': [
    'Smoke alarm',
    'Carbon monoxide alarm',
    'First aid kit',
    'Fire extinguisher',
    'Security cameras',
    'Lockbox',
    'Safe',
    'Private entrance'
  ]
}

const AmenitiesStep: React.FC<AmenitiesStepProps> = ({
  data,
  onChange,
  onNext,
  onPrevious,
  loading
}) => {
  const selectedAmenities = data.amenities || []

  const toggleAmenity = (name: string, category: string) => {
    const exists = selectedAmenities.find(a => a.name === name)
    if (exists) {
      onChange({
        amenities: selectedAmenities.filter(a => a.name !== name)
      })
    } else {
      onChange({
        amenities: [...selectedAmenities, { name, category }]
      })
    }
  }

  const isSelected = (name: string) => {
    return selectedAmenities.some(a => a.name === name)
  }

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

      <Box display="flex" flexDirection="column" gap="2rem">
        {Object.entries(amenityCategories).map(([category, amenities]) => (
          <Box key={category}>
            <Box fontSize="1.125rem" fontWeight="500" color="#374151" marginBottom="1rem">
              {category}
            </Box>
            <Box display="grid" gridTemplateColumns={{ Sm: '1fr 1fr', Md: '1fr 1fr 1fr' }} gap="0.75rem">
              {amenities.map((amenity) => (
                <Box
                  key={amenity}
                  as="label"
                  display="flex"
                  alignItems="center"
                  gap="0.75rem"
                  padding="0.75rem"
                  border="2px solid"
                  borderColor={isSelected(amenity) ? '#3182ce' : '#e5e7eb'}
                  borderRadius="0.5rem"
                  cursor="pointer"
                  backgroundColor={isSelected(amenity) ? '#eff6ff' : 'white'}
                  whileHover={{ borderColor: '#3182ce', backgroundColor: isSelected(amenity) ? '#eff6ff' : '#f8fafc' }}
                >
                  <Box
                    as="input"
                    type="checkbox"
                    checked={isSelected(amenity)}
                    onChange={() => toggleAmenity(amenity, category)}
                    accentColor="#3182ce"
                  />
                  <Box fontSize="0.875rem" color="#374151">
                    {amenity}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>

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