import React from 'react'
import { Box } from '../Box'
import { useWizard } from './WizardProvider'
import { WizardStep } from './types'
import { FaCheck } from 'react-icons/fa'

interface WizardStepsProps {
    steps: WizardStep[]
    className?: string
    style?: React.CSSProperties
}

const WizardSteps: React.FC<WizardStepsProps> = ({ 
    steps, 
    className,
    style 
}) => {
    const { currentStep, isStepCompleted } = useWizard()

    const getStepStatus = (stepIndex: number) => {
        if (stepIndex < currentStep) {
            return isStepCompleted(stepIndex) ? 'completed' : 'passed'
        } else if (stepIndex === currentStep) {
            return 'current'
        } else {
            return 'upcoming'
        }
    }

    const getStepStyles = (status: string) => {
        switch (status) {
            case 'completed':
                return {
                    backgroundColor: '#10b981',
                    color: 'white',
                    borderColor: '#10b981'
                }
            case 'current':
                return {
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    borderColor: '#3b82f6'
                }
            case 'passed':
                return {
                    backgroundColor: '#f3f4f6',
                    color: '#6b7280',
                    borderColor: '#d1d5db'
                }
            default: // upcoming
                return {
                    backgroundColor: '#f9fafb',
                    color: '#9ca3af',
                    borderColor: '#e5e7eb'
                }
        }
    }

    const getConnectorStyles = (stepIndex: number) => {
        const isActive = stepIndex < currentStep || isStepCompleted(stepIndex)
        return {
            backgroundColor: isActive ? '#10b981' : '#e5e7eb',
            height: '2px'
        }
    }

    return (
        <Box 
            className={className}
            style={style}
            padding="1rem"
            backgroundColor="white"
        >
            {/* Progress Summary */}
            <Box 
                display="flex" 
                justifyContent="space-between" 
                alignItems="center" 
                marginBottom="1.5rem"
            >
                <Box>
                    <h2 style={{
                        margin: 0,
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#1f2937'
                    }}>
                        {steps[currentStep]?.title || 'Property Creation'}
                    </h2>
                    <p style={{
                        margin: '0.25rem 0 0 0',
                        fontSize: '0.875rem',
                        color: '#6b7280'
                    }}>
                        Step {currentStep + 1} of {steps.length}
                    </p>
                </Box>
                
                {/* Progress Percentage */}
                <Box
                    fontSize="0.875rem"
                    fontWeight="600"
                    color="#3b82f6"
                    backgroundColor="#eff6ff"
                    padding="0.25rem 0.75rem"
                    borderRadius="1rem"
                >
                    {Math.round(((currentStep + 1) / steps.length) * 100)}%
                </Box>
            </Box>

            {/* Step Description */}
            {steps[currentStep]?.description && (
                <Box
                    fontSize="0.9375rem"
                    color="#4b5563"
                    marginBottom="1.5rem"
                    lineHeight="1.5"
                >
                    {steps[currentStep].description}
                </Box>
            )}

            {/* Desktop: Horizontal Step Indicator */}
            <Box 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
                className="hidden-mobile"
                style={{ display: 'none' }}
            >
                {steps.map((step, index) => {
                    const status = getStepStatus(index)
                    const stepStyles = getStepStyles(status)
                    
                    return (
                        <React.Fragment key={step.id}>
                            {/* Step Circle */}
                            <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                width="2.5rem"
                                height="2.5rem"
                                borderRadius="50%"
                                border="2px solid"
                                fontSize="0.875rem"
                                fontWeight="600"
                                transition="all 0.2s ease"
                                style={stepStyles}
                            >
                                {status === 'completed' ? (
                                    <FaCheck size="0.875rem" />
                                ) : (
                                    index + 1
                                )}
                            </Box>
                            
                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <Box
                                    width="3rem"
                                    style={getConnectorStyles(index)}
                                    transition="all 0.2s ease"
                                />
                            )}
                        </React.Fragment>
                    )
                })}
            </Box>

            {/* Mobile: Compact Progress Bar */}
            <Box 
                className="mobile-only"
                display="flex"
                alignItems="center"
                gap="0.75rem"
            >
                {/* Progress Bar */}
                <Box 
                    flex="1" 
                    height="4px" 
                    backgroundColor="#e5e7eb" 
                    borderRadius="2px"
                    overflow="hidden"
                >
                    <Box
                        height="100%"
                        backgroundColor="#3b82f6"
                        borderRadius="2px"
                        transition="all 0.3s ease"
                        style={{
                            width: `${((currentStep + 1) / steps.length) * 100}%`
                        }}
                    />
                </Box>
                
                {/* Current Step Icon */}
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    width="2rem"
                    height="2rem"
                    borderRadius="50%"
                    backgroundColor="#3b82f6"
                    color="white"
                    fontSize="0.875rem"
                    fontWeight="600"
                >
                    {steps[currentStep]?.icon || (currentStep + 1)}
                </Box>
            </Box>

            {/* CSS for responsive visibility */}
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
                        display: flex !important;
                    }
                }
            `}</style>
        </Box>
    )
}

export default WizardSteps