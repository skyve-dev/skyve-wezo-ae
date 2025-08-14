import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAppDispatch, useAppSelector } from '../store'
import { initializeWizard, updateWizardData, setWizardStep, clearWizardData, createProperty } from '../store/slices/propertySlice'
import { WizardStep } from '../types/property'
import { Box } from '../components/Box'

// Import mobile wizard step components
import MobileBasicInfoStep from '../components/property/mobile/MobileBasicInfoStep'
import MobileLocationStep from '../components/property/mobile/MobileLocationStep'
import MobileLayoutStep from '../components/property/mobile/MobileLayoutStep'
import MobileAmenitiesStep from '../components/property/mobile/MobileAmenitiesStep'
import MobileServicesStep from '../components/property/mobile/MobileServicesStep'
import MobileRulesStep from '../components/property/mobile/MobileRulesStep'
import MobilePricingStep from '../components/property/mobile/MobilePricingStep'
import MobileReviewStep from '../components/property/mobile/MobileReviewStep'

export const Route = createFileRoute('/register-property-mobile')({
  component: MobilePropertyWizard,
})

const mobileStepComponents = {
  [WizardStep.BASIC_INFO]: MobileBasicInfoStep,
  [WizardStep.LOCATION]: MobileLocationStep,
  [WizardStep.LAYOUT]: MobileLayoutStep,
  [WizardStep.AMENITIES]: MobileAmenitiesStep,
  // Skip PHOTOS step for mobile (WizardStep.PHOTOS = 5)
  [WizardStep.SERVICES]: MobileServicesStep,
  [WizardStep.RULES]: MobileRulesStep,
  [WizardStep.PRICING]: MobilePricingStep,
  [WizardStep.REVIEW]: MobileReviewStep,
}

const stepTitles = {
  [WizardStep.BASIC_INFO]: 'Basic Info',
  [WizardStep.LOCATION]: 'Location',
  [WizardStep.LAYOUT]: 'Layout',
  [WizardStep.AMENITIES]: 'Amenities',
  // Skip PHOTOS step for mobile
  [WizardStep.SERVICES]: 'Services',
  [WizardStep.RULES]: 'Rules',
  [WizardStep.PRICING]: 'Pricing',
  [WizardStep.REVIEW]: 'Review',
}

function MobilePropertyWizard() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { wizardData, loading, error } = useAppSelector((state) => state.property)
  const { user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    // Redirect if not authenticated
    if (!user) {
      navigate({ to: '/login' })
      return
    }

    // Initialize wizard if no data exists
    if (!wizardData) {
      dispatch(initializeWizard({}))
    }
  }, [user, wizardData, dispatch, navigate])

  if (!user) {
    return null
  }

  if (!wizardData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh" backgroundColor="#f8fafc">
        <Box
          backgroundColor="#ffffff"
          padding="32px"
          borderRadius="16px"
          fontSize="18px"
          fontWeight="600"
          color="#1a202c"
          boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        >
          Loading wizard...
        </Box>
      </Box>
    )
  }

  const currentStep = wizardData.currentStep
  const getCurrentStepComponent = () => {
    const component = mobileStepComponents[currentStep as keyof typeof mobileStepComponents]
    return component || null
  }
  const CurrentStepComponent = getCurrentStepComponent()
  const totalSteps = Object.keys(mobileStepComponents).length

  const handleNext = () => {
    let nextStep = currentStep + 1
    // Skip PHOTOS step (step 5) in mobile version
    if (nextStep === WizardStep.PHOTOS) {
      nextStep = WizardStep.SERVICES
    }
    if (nextStep <= totalSteps) {
      dispatch(setWizardStep(nextStep))
    }
  }

  const handlePrevious = () => {
    let previousStep = currentStep - 1
    // Skip PHOTOS step (step 5) in mobile version
    if (previousStep === WizardStep.PHOTOS) {
      previousStep = WizardStep.AMENITIES
    }
    if (previousStep >= 1) {
      dispatch(setWizardStep(previousStep))
    }
  }

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All progress will be lost.')) {
      dispatch(clearWizardData())
      navigate({ to: '/dashboard' })
    }
  }

  const handleSubmit = async () => {
    try {
      await dispatch(createProperty(wizardData)).unwrap()
      navigate({ to: '/dashboard/my-properties', search: { success: 'Property created successfully!' } })
    } catch (error) {
      console.error('Failed to create property:', error)
    }
  }

  // Calculate progress accounting for skipped PHOTOS step
  const getMobileStepProgress = () => {
    const steps = [WizardStep.BASIC_INFO, WizardStep.LOCATION, WizardStep.LAYOUT, WizardStep.AMENITIES, WizardStep.SERVICES, WizardStep.RULES, WizardStep.PRICING, WizardStep.REVIEW]
    const currentIndex = steps.indexOf(currentStep as WizardStep)
    return currentIndex >= 0 ? ((currentIndex + 1) / steps.length) * 100 : 0
  }
  
  const progress = getMobileStepProgress()

  return (
    <Box minHeight="100vh" backgroundColor="#f8fafc">
      {/* Mobile Header - Fixed at top */}
      <Box 
        backgroundColor="#ffffff" 
        borderBottom="1px solid #e2e8f0"
        padding="16px 20px"
        position="fixed"
        top="0"
        left="0"
        right="0"
        zIndex="20"
        style={{
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          WebkitBackdropFilter: 'blur(8px)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="12px">
          <Box>
            <Box fontSize="20px" fontWeight="700" color="#1a202c">
              Register Property
            </Box>
            <Box fontSize="14px" color="#718096">
              Step {[WizardStep.BASIC_INFO, WizardStep.LOCATION, WizardStep.LAYOUT, WizardStep.AMENITIES, WizardStep.SERVICES, WizardStep.RULES, WizardStep.PRICING, WizardStep.REVIEW].indexOf(currentStep as WizardStep) + 1} of 8: {stepTitles[currentStep as keyof typeof stepTitles] || 'Unknown Step'}
            </Box>
          </Box>
          <Box
            as="button"
            onClick={handleCancel}
            minHeight="40px"
            padding="0 16px"
            backgroundColor="transparent"
            color="#718096"
            border="2px solid #e2e8f0"
            borderRadius="8px"
            fontSize="14px"
            fontWeight="600"
            cursor="pointer"
            style={{
              transition: 'all 0.2s ease',
              WebkitTapHighlightColor: 'transparent',
            }}
            whileHover={{ backgroundColor: '#f7fafc', borderColor: '#cbd5e0' }}
            whileTap={{ transform: 'scale(0.95)' }}
          >
            Cancel
          </Box>
        </Box>
        
        {/* Mobile Progress Bar */}
        <Box
          width="100%"
          height="4px"
          backgroundColor="#e2e8f0"
          borderRadius="2px"
          overflow="hidden"
        >
          <Box
            width={`${progress}%`}
            height="100%"
            backgroundColor="#3182ce"
            transition="width 0.3s ease"
            borderRadius="2px"
          />
        </Box>
        
        {/* Mobile Step Dots */}
        <Box 
          display="flex" 
          justifyContent="center" 
          marginTop="12px"
          gap="8px"
        >
          {[WizardStep.BASIC_INFO, WizardStep.LOCATION, WizardStep.LAYOUT, WizardStep.AMENITIES, WizardStep.SERVICES, WizardStep.RULES, WizardStep.PRICING, WizardStep.REVIEW].map((step) => (
            <Box
              key={step}
              width="8px"
              height="8px"
              borderRadius="50%"
              backgroundColor={step <= currentStep ? '#3182ce' : '#e2e8f0'}
              transition="background-color 0.3s ease"
            />
          ))}
        </Box>
      </Box>

      {/* Main Content with top padding for fixed header */}
      <Box paddingTop="100px">
        {error && (
          <Box
            margin="20px"
            backgroundColor="#fed7d7"
            color="#c53030"
            padding="16px"
            borderRadius="12px"
            border="1px solid #feb2b2"
            fontSize="16px"
            fontWeight="500"
          >
            {error}
          </Box>
        )}

        {CurrentStepComponent && (
          <CurrentStepComponent
            data={wizardData}
            onChange={(updates: any) => dispatch(updateWizardData(updates))}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSubmit={handleSubmit}
            loading={loading}
            isFirstStep={currentStep === 1}
            isLastStep={currentStep === totalSteps}
          />
        )}
      </Box>
    </Box>
  )
}

export default MobilePropertyWizard