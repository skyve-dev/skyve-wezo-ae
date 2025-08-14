import React from 'react'
import { WizardFormData } from '../../../types/property'
import { Box } from '../../Box'
import { MobileMultiSelect } from '../../forms/mobile/MobileMultiSelect'
import { MobileCheckbox } from '../../forms/mobile/MobileCheckbox'

interface MobileServicesStepProps {
  data: WizardFormData
  onChange: (updates: Partial<WizardFormData>) => void
  onNext: () => void
  onPrevious: () => void
  onSubmit: () => void
  loading: boolean
  isFirstStep: boolean
  isLastStep: boolean
}

const MobileServicesStep: React.FC<MobileServicesStepProps> = ({
  data,
  onChange,
  onNext,
  onPrevious,
  loading,
  isFirstStep
}) => {
  const safetySecurityServices = [
    { value: 'security_cameras', label: 'Security Cameras', icon: '📹' },
    { value: 'smoke_detector', label: 'Smoke Detector', icon: '🚨' },
    { value: 'carbon_monoxide_detector', label: 'CO Detector', icon: '⚠️' },
    { value: 'fire_extinguisher', label: 'Fire Extinguisher', icon: '🧯' },
    { value: 'first_aid_kit', label: 'First Aid Kit', icon: '🩹' },
    { value: 'security_guard', label: 'Security Guard', icon: '👮' },
  ]

  const cleaningServices = [
    { value: 'daily_cleaning', label: 'Daily Cleaning', icon: '🧹' },
    { value: 'weekly_cleaning', label: 'Weekly Cleaning', icon: '🗓️' },
    { value: 'linen_service', label: 'Linen Service', icon: '🛏️' },
    { value: 'towel_service', label: 'Towel Service', icon: '🏊' },
  ]

  const conciergeServices = [
    { value: 'airport_transfer', label: 'Airport Transfer', icon: '✈️' },
    { value: 'grocery_delivery', label: 'Grocery Delivery', icon: '🛒' },
    { value: 'tour_booking', label: 'Tour Booking', icon: '🗺️' },
    { value: 'restaurant_reservation', label: 'Restaurant Booking', icon: '🍽️' },
    { value: 'car_rental', label: 'Car Rental', icon: '🚗' },
    { value: 'babysitting', label: 'Babysitting', icon: '👶' },
  ]

  const getCurrentServiceValues = (category: string) => {
    return (data.services || [])
      .filter(service => {
        const categoryServices = category === 'safety' ? safetySecurityServices 
          : category === 'cleaning' ? cleaningServices 
          : conciergeServices
        return categoryServices.some(cat => cat.value === service.name.toLowerCase().replace(/\s+/g, '_'))
      })
      .map(service => service.name.toLowerCase().replace(/\s+/g, '_'))
  }

  const updateServices = (category: string, selectedValues: string[]) => {
    const categoryServices = category === 'safety' ? safetySecurityServices 
      : category === 'cleaning' ? cleaningServices 
      : conciergeServices

    const currentServices = data.services || []
    
    // Remove old services from this category
    const otherServices = currentServices.filter(service => {
      return !categoryServices.some(cat => cat.value === service.name.toLowerCase().replace(/\s+/g, '_'))
    })

    // Add new selected services
    const newServices = selectedValues.map(value => {
      const serviceOption = categoryServices.find(opt => opt.value === value)
      return {
        name: serviceOption?.label || value,
        category: category === 'safety' ? 'Safety & Security' : category === 'cleaning' ? 'Cleaning' : 'Concierge'
      }
    })

    onChange({ services: [...otherServices, ...newServices] })
  }

  const totalSelected = (data.services || []).length

  return (
    <Box padding="20px" minHeight="100vh" backgroundColor="#f8fafc">
      {/* Header */}
      <Box marginBottom="32px" textAlign="center">
        <Box fontSize="28px" fontWeight="700" color="#1a202c" marginBottom="8px">
          Services & Features
        </Box>
        <Box fontSize="16px" color="#718096" lineHeight="1.5">
          What services and special features do you offer?
        </Box>
        {totalSelected > 0 && (
          <Box 
            fontSize="14px" 
            color="#3182ce" 
            marginTop="8px"
            fontWeight="600"
          >
            {totalSelected} services selected
          </Box>
        )}
      </Box>

      {/* Form Content */}
      <Box display="flex" flexDirection="column" gap="32px">
        {/* Safety & Security */}
        <MobileMultiSelect
          label="🛡️ Safety & Security"
          options={safetySecurityServices}
          selectedValues={getCurrentServiceValues('safety')}
          onChange={(values) => updateServices('safety', values)}
          maxColumns={2}
        />

        {/* Cleaning Services */}
        <MobileMultiSelect
          label="🧹 Cleaning Services"
          options={cleaningServices}
          selectedValues={getCurrentServiceValues('cleaning')}
          onChange={(values) => updateServices('cleaning', values)}
          maxColumns={2}
        />

        {/* Concierge Services */}
        <MobileMultiSelect
          label="🤝 Concierge Services"
          options={conciergeServices}
          selectedValues={getCurrentServiceValues('concierge')}
          onChange={(values) => updateServices('concierge', values)}
          maxColumns={2}
        />

        {/* Additional Options */}
        <Box>
          <Box 
            fontSize="18px"
            fontWeight="600"
            color="#1a202c"
            marginBottom="16px"
            lineHeight="1.4"
          >
            🏨 Additional Property Features
          </Box>
          
          <Box display="flex" flexDirection="column" gap="16px">
            <MobileCheckbox
              label="Smoking Allowed"
              checked={data.allowSmoking || false}
              onChange={(checked) => onChange({ allowSmoking: checked })}
              description="Guests can smoke inside the property"
              icon="🚬"
            />

            <MobileCheckbox
              label="Pet-Friendly"
              checked={data.allowPets || false}
              onChange={(checked) => onChange({ allowPets: checked })}
              description="Guests can bring their pets"
              icon="🐕"
            />

            <MobileCheckbox
              label="Events Allowed"
              checked={data.allowEvents || false}
              onChange={(checked) => onChange({ allowEvents: checked })}
              description="Guests can host parties or events"
              icon="🎉"
            />

            <MobileCheckbox
              label="Accessible Property"
              checked={data.wheelchairAccessible || false}
              onChange={(checked) => onChange({ wheelchairAccessible: checked })}
              description="Property is wheelchair accessible"
              icon="♿"
            />
          </Box>
        </Box>

        {/* Info Note */}
        <Box 
          backgroundColor="#f0f9ff"
          border="2px solid #0ea5e9"
          borderRadius="12px"
          padding="20px"
          marginBottom="40px"
        >
          <Box fontSize="16px" fontWeight="600" color="#0369a1" marginBottom="8px">
            💡 Service Tips
          </Box>
          <Box fontSize="14px" color="#0369a1" lineHeight="1.5">
            Premium services like cleaning, concierge, and safety features can justify higher rates and attract quality guests who value convenience.
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

export default MobileServicesStep