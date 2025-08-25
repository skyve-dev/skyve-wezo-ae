import React from 'react'
import { Box } from '../Box'
import Button from '../Button'
import { 
    FaArrowLeft, 
    FaArrowRight, 
    FaCheck, 
    FaSave,
    FaSpinner 
} from 'react-icons/fa'

interface WizardFooterProps {
    currentStep: number
    totalSteps: number
    canGoPrevious: boolean
    canGoNext: boolean
    isLastStep: boolean
    isLoading?: boolean
    onPrevious: () => void
    onNext: () => void
    onSave: () => void
}

const WizardFooter: React.FC<WizardFooterProps> = ({
    currentStep,
    totalSteps,
    canGoPrevious,
    canGoNext,
    isLastStep,
    isLoading = false,
    onPrevious,
    onNext,
    onSave
}) => {
    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            padding="1rem 1.5rem"
            backgroundColor="#D52122"
            height="4.5rem"
        >
            {/* Left: Previous Button */}
            <Box flex="1" display="flex" justifyContent="flex-start">
                {canGoPrevious && (
                    <Button
                        label="Previous"
                        icon={<FaArrowLeft />}
                        onClick={onPrevious}
                        variant="normal"
                        size="medium"
                        disabled={isLoading}
                        style={{
                            backgroundColor: 'transparent',
                            color: 'white',
                            minWidth: '110px'
                        }}
                    />
                )}
            </Box>

            {/* Center: Progress and Save Draft */}
            <Box 
                flex="1" 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
                gap="1rem"
            >
                {/* Save Draft Button */}
                <Button
                    label=""
                    icon={<FaSave />}
                    onClick={onSave}
                    variant="normal"
                    size="small"
                    disabled={isLoading}
                    style={{
                        backgroundColor: 'transparent',
                        color: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '50%',
                        padding: '0.5rem',
                        minWidth: 'unset',
                        width: '2.25rem',
                        height: '2.25rem'
                    }}
                    title="Save Draft"
                />
                
                {/* Step Progress */}
                <Box

                    padding="0.375rem 0.875rem"
                    fontSize="0.875rem"
                    fontWeight="500"
                    color="white"
                >
                    Step {currentStep + 1} of {totalSteps}
                </Box>
            </Box>

            {/* Right: Next/Submit Button */}
            <Box flex="1" display="flex" justifyContent="flex-end">
                <Button
                    label={
                        isLoading 
                            ? "Processing..." 
                            : isLastStep 
                                ? "Create Property" 
                                : "Next"
                    }
                    icon={
                        isLoading 
                            ? <FaSpinner className="spin" />
                            : isLastStep 
                                ? <FaCheck /> 
                                : <FaArrowRight />
                    }
                    onClick={onNext}
                    variant={isLastStep ? "promoted" : "promoted"}
                    size="medium"
                    disabled={isLoading || (!canGoNext && !isLastStep)}
                    style={{
                        minWidth: isLastStep ? '150px' : '110px',
                        color: 'white',
                        padding : 0,
                        border: 'none',
                        fontWeight: '600'
                    }}
                />
            </Box>

            {/* Loading spinner animation */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </Box>
    )
}

export default WizardFooter