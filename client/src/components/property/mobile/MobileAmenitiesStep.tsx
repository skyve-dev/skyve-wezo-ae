import React from 'react'
import { WizardFormData } from '../../../types/property'
import { Box } from '../../Box'
import { MobileMultiSelect } from '../../forms/mobile/MobileMultiSelect'

interface MobileAmenitiesStepProps {
  data: WizardFormData
  onChange: (updates: Partial<WizardFormData>) => void
  onNext: () => void
  onPrevious: () => void
  onSubmit: () => void
  loading: boolean
  isFirstStep: boolean
  isLastStep: boolean
}

const MobileAmenitiesStep: React.FC<MobileAmenitiesStepProps> = ({
  data,
  onChange,
  onNext,
  onPrevious,
  loading,
  isFirstStep
}) => {
  const essentialAmenities = [
    { value: 'wifi', label: 'WiFi', icon: '📶' },
    { value: 'kitchen', label: 'Kitchen', icon: '🍳' },
    { value: 'parking', label: 'Parking', icon: '🚗' },
    { value: 'air_conditioning', label: 'AC', icon: '❄️' },
    { value: 'heating', label: 'Heating', icon: '🔥' },
    { value: 'washer', label: 'Washer', icon: '🧺' },
  ]

  const comfortAmenities = [
    { value: 'tv', label: 'TV', icon: '📺' },
    { value: 'balcony', label: 'Balcony', icon: '🏞️' },
    { value: 'garden', label: 'Garden', icon: '🌳' },
    { value: 'terrace', label: 'Terrace', icon: '🏡' },
    { value: 'fireplace', label: 'Fireplace', icon: '🔥' },
    { value: 'workspace', label: 'Workspace', icon: '💻' },
  ]

  const luxuryAmenities = [
    { value: 'pool', label: 'Pool', icon: '🏊' },
    { value: 'gym', label: 'Gym', icon: '💪' },
    { value: 'spa', label: 'Spa', icon: '🧖' },
    { value: 'sauna', label: 'Sauna', icon: '🔥' },
    { value: 'jacuzzi', label: 'Jacuzzi', icon: '🛁' },
    { value: 'tennis', label: 'Tennis', icon: '🎾' },
  ]

  const getCurrentAmenityValues = (category: string) => {
    return (data.amenities || [])
      .filter(amenity => {
        const categoryAmenities = category === 'essential' ? essentialAmenities 
          : category === 'comfort' ? comfortAmenities 
          : luxuryAmenities
        return categoryAmenities.some(cat => cat.value === amenity.name.toLowerCase().replace(/\s+/g, '_'))
      })
      .map(amenity => amenity.name.toLowerCase().replace(/\s+/g, '_'))
  }

  const updateAmenities = (category: string, selectedValues: string[]) => {
    const categoryAmenities = category === 'essential' ? essentialAmenities 
      : category === 'comfort' ? comfortAmenities 
      : luxuryAmenities

    const currentAmenities = data.amenities || []
    
    // Remove old amenities from this category
    const otherAmenities = currentAmenities.filter(amenity => {
      return !categoryAmenities.some(cat => cat.value === amenity.name.toLowerCase().replace(/\s+/g, '_'))
    })

    // Add new selected amenities
    const newAmenities = selectedValues.map(value => {
      const amenityOption = categoryAmenities.find(opt => opt.value === value)
      return {
        name: amenityOption?.label || value,
        category: category === 'essential' ? 'Essential' : category === 'comfort' ? 'Comfort' : 'Luxury'
      }
    })

    onChange({ amenities: [...otherAmenities, ...newAmenities] })
  }

  const totalSelected = (data.amenities || []).length

  return (
    <Box padding="20px" minHeight="100vh" backgroundColor="#f8fafc">
      {/* Header */}
      <Box marginBottom="32px" textAlign="center">
        <Box fontSize="28px" fontWeight="700" color="#1a202c" marginBottom="8px">
          Property Amenities
        </Box>
        <Box fontSize="16px" color="#718096" lineHeight="1.5">
          What amenities does your property offer?
        </Box>
        {totalSelected > 0 && (
          <Box 
            fontSize="14px" 
            color="#3182ce" 
            marginTop="8px"
            fontWeight="600"
          >
            {totalSelected} amenities selected
          </Box>
        )}
      </Box>

      {/* Form Content */}
      <Box display="flex" flexDirection="column" gap="32px">
        {/* Essential Amenities */}
        <MobileMultiSelect
          label="🏠 Essential Amenities"
          options={essentialAmenities}
          selectedValues={getCurrentAmenityValues('essential')}
          onChange={(values) => updateAmenities('essential', values)}
          maxColumns={2}
        />

        {/* Comfort Amenities */}
        <MobileMultiSelect
          label="✨ Comfort & Entertainment"
          options={comfortAmenities}
          selectedValues={getCurrentAmenityValues('comfort')}
          onChange={(values) => updateAmenities('comfort', values)}
          maxColumns={2}
        />

        {/* Luxury Amenities */}
        <MobileMultiSelect
          label="🌟 Luxury Features"
          options={luxuryAmenities}
          selectedValues={getCurrentAmenityValues('luxury')}
          onChange={(values) => updateAmenities('luxury', values)}
          maxColumns={2}
        />

        {/* Info Note */}
        <Box 
          backgroundColor="#f0f9ff"
          border="2px solid #0ea5e9"
          borderRadius="12px"
          padding="20px"
          marginBottom="40px"
        >
          <Box fontSize="16px" fontWeight="600" color="#0369a1" marginBottom="8px">
            💡 Pro Tip
          </Box>
          <Box fontSize="14px" color="#0369a1" lineHeight="1.5">
            Selecting more amenities helps your property stand out and attract more guests. You can always update these later.
          </Box>
        </Box>
      </Box>

      {/* Navigation - Fixed at bottom */}
      <Box
        position="fixed"
        bottom="0"
        left="0"
        right="0"
        backgroundColor="#ffffff"
        borderTop="1px solid #e2e8f0"
        padding="20px"
        zIndex="10"
        style={{ 
          boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
          WebkitBackdropFilter: 'blur(8px)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" gap="16px">
          <Box flex="1">
            {!isFirstStep && (
              <Box
                as="button"
                onClick={onPrevious}
                minHeight="56px"
                padding="0 24px"
                backgroundColor="#f7fafc"
                color="#4a5568"
                border="2px solid #e2e8f0"
                borderRadius="12px"
                fontSize="16px"
                fontWeight="600"
                cursor="pointer"
                width="100%"
                style={{
                  transition: 'all 0.2s ease',
                  WebkitTapHighlightColor: 'transparent',
                }}
                whileHover={{ backgroundColor: '#edf2f7', borderColor: '#cbd5e0' }}
                whileTap={{ transform: 'scale(0.98)' }}
              >
                Previous
              </Box>
            )}
          </Box>

          <Box flex="2">
            <Box
              as="button"
              onClick={onNext}
              disabled={loading}
              minHeight="56px"
              padding="0 32px"
              backgroundColor="#3182ce"
              color="white"
              border="none"
              borderRadius="12px"
              fontSize="18px"
              fontWeight="700"
              cursor="pointer"
              width="100%"
              style={{
                transition: 'all 0.2s ease',
                WebkitTapHighlightColor: 'transparent',
              }}
              whileHover={{ backgroundColor: '#2c5aa0' }}
              whileTap={{ transform: 'scale(0.98)' }}
            >
              {loading ? 'Saving...' : 'Next'}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Bottom spacing to account for fixed navigation */}
      <Box height="100px" />
    </Box>
  )
}

export default MobileAmenitiesStep