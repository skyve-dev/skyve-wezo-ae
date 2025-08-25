import React from 'react'
import { Box } from '../Box'
import Button from '../Button'
import { useWizard } from './WizardProvider'
import { FaArrowLeft, FaArrowRight, FaCheck, FaSave } from 'react-icons/fa'

interface WizardNavigationProps {
    className?: string
    style?: React.CSSProperties
}

const WizardNavigation: React.FC<WizardNavigationProps> = ({
    className,
    style
}) => {
    const {
        currentStep,
        totalSteps,
        canGoNext,
        canGoPrevious,
        previousStep,
        nextStep,
        submitFinal,
        saveDraft
    } = useWizard()

    const isLastStep = currentStep === totalSteps - 1

    const handleNext = async () => {
        if (isLastStep) {
            await submitFinal()
        } else {
            await nextStep()
        }
    }

    const handlePrevious = () => {
        previousStep()
    }

    const handleSaveDraft = () => {
        saveDraft()
    }

    return (
        <Box
            className={className}
            style={style}
            position="fixed"
            bottom="0"
            left="0"
            right="0"
            backgroundColor="white"
            borderTop="1px solid #e5e7eb"
            padding="1rem"
            zIndex="50"
            boxShadow="0 -4px 6px -1px rgba(0, 0, 0, 0.1)"
        >
            <Box
                maxWidth="1200px"
                margin="0 auto"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                gap="1rem"
            >
                {/* Previous Button */}
                <Box flex="1" display="flex" justifyContent="flex-start">
                    {canGoPrevious && (
                        <Button
                            label="Previous"
                            icon={<FaArrowLeft />}
                            onClick={handlePrevious}
                            variant="normal"
                            size="medium"
                            style={{
                                backgroundColor: '#f8fafc',
                                color: '#475569',
                                border: '1px solid #e2e8f0',
                                minWidth: '100px'
                            }}
                        />
                    )}
                </Box>

                {/* Center Actions - Save Draft */}
                <Box display="flex" alignItems="center" gap="0.5rem">
                    <Button
                        label=""
                        icon={<FaSave />}
                        onClick={handleSaveDraft}
                        variant="normal"
                        size="small"
                        style={{
                            backgroundColor: 'transparent',
                            color: '#6b7280',
                            border: 'none',
                            padding: '0.5rem',
                            borderRadius: '50%',
                            minWidth: 'unset',
                            width: '2.5rem',
                            height: '2.5rem'
                        }}
                        title="Save Draft"
                    />
                    
                    {/* Progress indicator */}
                    <Box
                        fontSize="0.75rem"
                        color="#6b7280"
                        fontWeight="500"
                        display="flex"
                        alignItems="center"
                        gap="0.25rem"
                        className="hidden-mobile"
                        style={{ display: 'none' }}
                    >
                        {currentStep + 1} / {totalSteps}
                    </Box>
                </Box>

                {/* Next Button */}
                <Box flex="1" display="flex" justifyContent="flex-end">
                    <Button
                        label={isLastStep ? "Create Property" : "Next"}
                        icon={isLastStep ? <FaCheck /> : <FaArrowRight />}
                        onClick={handleNext}
                        variant="promoted"
                        size="medium"
                        disabled={!canGoNext && !isLastStep}
                        style={{
                            minWidth: isLastStep ? '140px' : '100px',
                            backgroundColor: isLastStep ? '#059669' : undefined,
                            boxShadow: isLastStep ? '0 4px 12px rgba(5, 150, 105, 0.4)' : undefined
                        }}
                    />
                </Box>
            </Box>

            {/* Step Progress for Mobile */}
            <Box 
                className="mobile-only"
                marginTop="0.75rem"
                display="flex"
                justifyContent="center"
            >
                <Box
                    fontSize="0.75rem"
                    color="#6b7280"
                    fontWeight="500"
                    backgroundColor="#f8fafc"
                    padding="0.25rem 0.75rem"
                    borderRadius="1rem"
                >
                    Step {currentStep + 1} of {totalSteps}
                </Box>
            </Box>

            {/* Responsive CSS */}
            <style>{`
                @media (min-width: 768px) {
                    .hidden-mobile {
                        display: flex !important;
                    }
                    .mobile-only {
                        display: none !important;
                    }
                }
                @media (max-width: 767px) {
                    .mobile-only {
                        display: block !important;
                    }
                }
            `}</style>
        </Box>
    )
}

export default WizardNavigation