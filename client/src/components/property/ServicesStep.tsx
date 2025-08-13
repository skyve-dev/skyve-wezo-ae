import React from 'react'
import { WizardFormData } from '../../types/property'
import { Box } from '../Box'
import { ParkingType, ParkingTypeLabels } from '../../constants/propertyEnums'

interface ServicesStepProps {
  data: WizardFormData
  onChange: (updates: Partial<WizardFormData>) => void
  onNext: () => void
  onPrevious: () => void
  onSubmit: () => void
  loading: boolean
  isFirstStep: boolean
  isLastStep: boolean
}

const languageOptions = [
  'English',
  'Arabic', 
  'Hindi',
  'Urdu',
  'French',
  'Spanish',
  'German',
  'Russian',
  'Chinese',
  'Japanese'
]

const ServicesStep: React.FC<ServicesStepProps> = ({
  data,
  onChange,
  onNext,
  onPrevious,
  loading
}) => {
  const handleServiceChange = (field: string, value: any) => {
    onChange({
      [field]: value
    })
  }

  const toggleLanguage = (language: string) => {
    const currentLanguages = data.languages || []
    const hasLanguage = currentLanguages.includes(language)
    
    if (hasLanguage) {
      handleServiceChange('languages', currentLanguages.filter((l: string) => l !== language))
    } else {
      handleServiceChange('languages', [...currentLanguages, language])
    }
  }

  return (
    <Box padding="2rem">
      <Box marginBottom="2rem">
        <Box fontSize="1.5rem" fontWeight="600" color="#1a202c" marginBottom="0.5rem">
          What services do you offer?
        </Box>
        <Box color="#718096">
          Tell guests about the services you provide
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap="2rem">
        {/* Breakfast Service */}
        <Box>
          <Box fontSize="1rem" fontWeight="500" color="#374151" marginBottom="1rem">
            Food & Dining
          </Box>
          <Box display="flex" alignItems="center" gap="0.75rem">
            <Box
              as="input"
              type="checkbox"
              checked={data.serveBreakfast}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                handleServiceChange('serveBreakfast', e.target.checked)
              }
              accentColor="#3182ce"
            />
            <Box>
              <Box fontSize="0.875rem" color="#374151" fontWeight="500">
                Serve breakfast
              </Box>
              <Box fontSize="0.75rem" color="#6b7280">
                Provide breakfast for guests (additional charges may apply)
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Parking */}
        <Box>
          <Box fontSize="1rem" fontWeight="500" color="#374151" marginBottom="1rem">
            Parking Options
          </Box>
          <Box display="flex" flexDirection="column" gap="0.75rem">
            {Object.values(ParkingType).map((parkingType) => (
              <Box
                key={parkingType}
                as="label"
                display="flex"
                alignItems="flex-start"
                gap="0.75rem"
                padding="1rem"
                border="2px solid"
                borderColor={data.parking === parkingType ? '#3182ce' : '#e5e7eb'}
                borderRadius="0.5rem"
                cursor="pointer"
                whileHover={{ borderColor: '#3182ce' }}
              >
                <Box
                  as="input"
                  type="radio"
                  name="parking"
                  value={parkingType}
                  checked={data.parking === parkingType}
                  onChange={() => handleServiceChange('parking', parkingType)}
                  accentColor="#3182ce"
                />
                <Box>
                  <Box fontSize="0.875rem" color="#374151" fontWeight="500">
                    {ParkingTypeLabels[parkingType]}
                  </Box>
                  <Box fontSize="0.75rem" color="#6b7280">
                    {parkingType === ParkingType.YesFree && 'Guests can park their vehicle free of charge'}
                    {parkingType === ParkingType.YesPaid && 'Paid parking is available for guests'}
                    {parkingType === ParkingType.No && 'No parking is available at the property'}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Languages */}
        <Box>
          <Box fontSize="1rem" fontWeight="500" color="#374151" marginBottom="1rem">
            Languages You Speak
          </Box>
          <Box fontSize="0.75rem" color="#6b7280" marginBottom="1rem">
            Select all languages you can communicate with guests in
          </Box>
          <Box display="grid" gridTemplateColumns={{ Sm: '1fr 1fr', Md: '1fr 1fr 1fr' }} gap="0.75rem">
            {languageOptions.map((language) => {
              const isSelected = data.languages?.includes(language)
              return (
                <Box
                  key={language}
                  as="label"
                  display="flex"
                  alignItems="center"
                  gap="0.75rem"
                  padding="0.75rem"
                  border="2px solid"
                  borderColor={isSelected ? '#3182ce' : '#e5e7eb'}
                  borderRadius="0.5rem"
                  cursor="pointer"
                  backgroundColor={isSelected ? '#eff6ff' : 'white'}
                  whileHover={{ borderColor: '#3182ce', backgroundColor: isSelected ? '#eff6ff' : '#f8fafc' }}
                >
                  <Box
                    as="input"
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleLanguage(language)}
                    accentColor="#3182ce"
                  />
                  <Box fontSize="0.875rem" color="#374151">
                    {language}
                  </Box>
                </Box>
              )
            })}
          </Box>
        </Box>
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

export default ServicesStep