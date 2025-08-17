import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAppDispatch, useAppSelector } from '../store'
import { initializeWizard, updateWizardData, setWizardStep, clearWizardData, createProperty } from '../store/slices/propertySlice'
import { WizardStep } from '../types/property'
import { Box } from '../components/Box'

// Import wizard step components (to be created)
import BasicInfoStep from '../components/property/BasicInfoStep'
import LocationStep from '../components/property/LocationStep'
import LayoutStep from '../components/property/LayoutStep'
import AmenitiesStep from '../components/property/AmenitiesStep'
import PhotosStep from '../components/property/PhotosStep'
import ServicesStep from '../components/property/ServicesStep'
import RulesStep from '../components/property/RulesStep'
import PricingStep from '../components/property/PricingStep'
import ReviewStep from '../components/property/ReviewStep'

export const Route = createFileRoute('/register-property')({
  component: RegisterPropertyWizard,
})

const stepComponents = {
  [WizardStep.BASIC_INFO]: BasicInfoStep,
  [WizardStep.LOCATION]: LocationStep,
  [WizardStep.LAYOUT]: LayoutStep,
  [WizardStep.AMENITIES]: AmenitiesStep,
  [WizardStep.PHOTOS]: PhotosStep,
  [WizardStep.SERVICES]: ServicesStep,
  [WizardStep.RULES]: RulesStep,
  [WizardStep.PRICING]: PricingStep,
  [WizardStep.REVIEW]: ReviewStep,
}

const stepTitles = {
  [WizardStep.BASIC_INFO]: 'Basic Information',
  [WizardStep.LOCATION]: 'Property Location',
  [WizardStep.LAYOUT]: 'Layout & Rooms',
  [WizardStep.AMENITIES]: 'Amenities',
  [WizardStep.PHOTOS]: 'Photos',
  [WizardStep.SERVICES]: 'Services',
  [WizardStep.RULES]: 'House Rules',
  [WizardStep.PRICING]: 'Pricing',
  [WizardStep.REVIEW]: 'Review & Submit',
}

function RegisterPropertyWizard() {
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
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Box>Loading wizard...</Box>
      </Box>
    )
  }

  const currentStep = wizardData.currentStep
  const CurrentStepComponent = stepComponents[currentStep as WizardStep]
  const totalSteps = Object.keys(stepComponents).length

  const handleNext = () => {
    if (currentStep < totalSteps) {
      dispatch(setWizardStep(currentStep + 1))
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      dispatch(setWizardStep(currentStep - 1))
    }
  }

  const handleStepClick = (step: number) => {
    dispatch(setWizardStep(step))
  }

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All progress will be lost.')) {
      dispatch(clearWizardData())
      navigate({ to: '/dashboard' })
    }
  }

  const handleSubmit = async () => {
    try {
      // Data is already in the correct format with proper enums
      await dispatch(createProperty(wizardData)).unwrap()

      navigate({ to: '/dashboard/my-properties', search: { success: 'Property created successfully!' } })
    } catch (error) {
      console.error('Failed to create property:', error)
    }
  }

  const progress = (currentStep / totalSteps) * 100

  return (
    <Box minHeight="100vh" backgroundColor="#f8fafc">
      {/* Header */}
      <Box 
        backgroundColor="white" 
        borderBottom="1px solid #e2e8f0"
        padding="1rem 0"
        position="sticky"
        top="0"
        zIndex='10'
      >
        <Box maxWidth="1200px" margin="0 auto" padding="0 1rem">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Box fontSize="1.5rem" fontWeight="600" color="#1a202c">
                Register Your Property
              </Box>
              <Box fontSize="0.875rem" color="#718096">
                Step {currentStep} of {totalSteps}: {stepTitles[currentStep as WizardStep]}
              </Box>
            </Box>
            <Box>
              <Box
                as="button"
                onClick={handleCancel}
                padding="0.5rem 1rem"
                backgroundColor="transparent"
                color="#718096"
                border="1px solid #e2e8f0"
                borderRadius="0.375rem"
                cursor="pointer"
                whileHover={{ backgroundColor: '#f7fafc' }}
              >
                Cancel
              </Box>
            </Box>
          </Box>
          
          {/* Progress Bar */}
          <Box marginTop="1rem">
            <Box
              width="100%"
              height="0.5rem"
              backgroundColor="#e2e8f0"
              borderRadius="0.25rem"
              overflow="hidden"
            >
              <Box
                width={`${progress}%`}
                height="100%"
                backgroundColor="#3182ce"
                transition="width 0.3s ease"
              />
            </Box>
          </Box>
          
          {/* Step Navigator */}
          <Box 
            display="flex" 
            justifyContent="center" 
            marginTop="1rem"
            gap="0.5rem"
            flexWrap="wrap"
          >
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <Box
                key={step}
                as="button"
                onClick={() => handleStepClick(step)}
                width="2rem"
                height="2rem"
                borderRadius="50%"
                border="2px solid"
                borderColor={step <= currentStep ? '#3182ce' : '#e2e8f0'}
                backgroundColor={step === currentStep ? '#3182ce' : step < currentStep ? '#3182ce' : 'white'}
                color={step <= currentStep ? 'white' : '#718096'}
                fontSize="0.875rem"
                fontWeight="600"
                cursor="pointer"
                display="flex"
                alignItems="center"
                justifyContent="center"
                whileHover={{ transform: 'scale(1.1)' }}
              >
                {step}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box maxWidth="800px" margin="0 auto" padding="2rem 1rem">
        {error && (
          <Box
            backgroundColor="#fed7d7"
            color="#c53030"
            padding="1rem"
            borderRadius="0.375rem"
            marginBottom="2rem"
            border="1px solid #feb2b2"
          >
            {error}
          </Box>
        )}

        <Box
          backgroundColorMd="white"
          borderRadius="0.5rem"
          boxShadowMd="0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
          overflow="hidden"
        >
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
    </Box>
  )
}

export default RegisterPropertyWizard