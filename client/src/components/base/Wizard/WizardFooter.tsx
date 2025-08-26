import React from 'react'
import {Box} from '../Box'
import Button from '../Button'
import {FaArrowLeft, FaArrowRight, FaCheck, FaSpinner} from 'react-icons/fa'

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
                                                   }) => {
    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            padding="1rem"
            backgroundColor="#D52122"
            height="4.5rem"
        >
            {/* Left: Previous Button */}
            {canGoPrevious && (
                <Button
                    label="Previous"
                    icon={<FaArrowLeft/>}
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

            {/* Center: Progress and Save Draft */}
            <Box
                padding="0.375rem 0.875rem"
                fontSize="0.875rem"
                fontWeight="500"
                color="white"
            >
                Step {currentStep + 1} of {totalSteps}
            </Box>

            {/* Right: Next/Submit Button */}
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
                        ? <FaSpinner className="spin"/>
                        : isLastStep
                            ? <FaCheck/>
                            : <FaArrowRight/>
                }
                onClick={onNext}
                variant={isLastStep ? "promoted" : "promoted"}
                size="medium"
                disabled={isLoading || (!canGoNext && !isLastStep)}
                style={{
                    backgroundColor: 'transparent',
                    minWidth: isLastStep ? '150px' : '110px',
                    color: 'white',
                    padding: 0,
                    border: 'none',
                    fontWeight: '600'
                }}
            />

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