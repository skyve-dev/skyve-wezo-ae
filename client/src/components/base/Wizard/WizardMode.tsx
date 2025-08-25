import React, { useEffect, useCallback } from 'react'
import { Box } from '../Box'
import { WizardProvider, useWizard } from './WizardProvider'
import WizardSteps from './WizardSteps'
import WizardHeader from './WizardHeader'
import WizardFooter from './WizardFooter'
import { WizardStep } from './types'
import { useAppShell } from '../AppShell'
import ConfirmationDialog from '../ConfirmationDialog'
import useDependencyTracker from "@/utils/useDependencyTracker.ts";

interface WizardModeProps {
    steps: WizardStep[]
    propertyId: string
    onComplete?: (propertyId: string) => void
    onBack?: () => void
    onCancel?: () => void
    className?: string
    style?: React.CSSProperties
}

// Internal component that uses the wizard context
const WizardContent: React.FC<{
    steps: WizardStep[]
    onBack?: () => void
    onCancel?: () => void
}> = ({ steps, onBack, onCancel }) => {
    const { 
        currentStep, 
        totalSteps,
        formData, 
        updateFormData,
        canGoNext,
        canGoPrevious,
        previousStep,
        nextStep,
        saveDraft,
        submitFinal,
        beginProgrammaticCancel
    } = useWizard()
    const { openDialog, mountHeader, mountFooter } = useAppShell()
    
    const currentStepConfig = steps[currentStep]
    const CurrentStepComponent = currentStepConfig?.component
    const isLastStep = currentStep === totalSteps - 1

    const handleBack = useCallback(() => {
        onBack?.()
    }, [onBack])

    const handleCancel = useCallback(async () => {
        const shouldCancel = await openDialog<boolean>((close) => (
            <ConfirmationDialog
                title="Cancel Property Creation?"
                message="This will delete all progress and any uploaded photos. This action cannot be undone."
                confirmLabel="Yes, Cancel"
                cancelLabel="Continue Editing"
                onConfirm={() => close(true)}
                onCancel={() => close(false)}
                variant="destructive"
            />
        ))

        if (shouldCancel) {
            // Set flag to skip navigation guard for this programmatic navigation
            beginProgrammaticCancel()
            onCancel?.()
        }
    }, [onCancel, openDialog, beginProgrammaticCancel])

    const handleNext = useCallback(async () => {
        console.log('🔄 handleNext called', { isLastStep, currentStep, totalSteps })
        if (isLastStep) {
            console.log('🏁 Last step - calling submitFinal')
            await submitFinal()
        } else {
            console.log('➡️ Not last step - calling nextStep')
            await nextStep()
        }
    }, [isLastStep, submitFinal, nextStep])

    // Mount header and footer using AppShell
    useEffect(() => {
        // Mount header
        const unmountHeader = mountHeader(
            <WizardHeader
                title="Add New Property"
                subtitle={`Step ${currentStep + 1}: ${currentStepConfig?.title}`}
                onBack={handleBack}
                onCancel={handleCancel}
            />
        )

        // Mount footer
        const unmountFooter = mountFooter(
            <WizardFooter
                currentStep={currentStep}
                totalSteps={totalSteps}
                canGoPrevious={canGoPrevious}
                canGoNext={canGoNext}
                isLastStep={isLastStep}
                isLoading={false}
                onPrevious={previousStep}
                onNext={handleNext}
                onSave={saveDraft}
            />
        )

        // Cleanup on unmount or when dependencies change
        return () => {
            unmountHeader()
            unmountFooter()
        }
    }, [
        currentStep, 
        totalSteps, 
        canGoPrevious, 
        canGoNext, 
        isLastStep,
        steps,
        handleBack,
        handleCancel,
        handleNext,
        previousStep,
        saveDraft,
        mountHeader,
        mountFooter
    ])
    useDependencyTracker({currentStep,
        totalSteps,
        canGoPrevious,
        canGoNext,
        isLastStep,
        steps,
        handleBack,
        handleCancel,
        handleNext,
        previousStep,
        saveDraft,
        mountHeader,
        mountFooter})

    return (
        <Box display="flex" flexDirection="column" minHeight="100vh" backgroundColor="#fafafa">
            {/* Progress Steps */}
            <WizardSteps 
                steps={steps}
                style={{
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: 'white'
                }}
            />

            {/* Main Content Area */}
            <Box
                flex="1"
                backgroundColor="#fafafa"
                paddingTop="1rem"
            >
                <Box maxWidth="1200px" margin="0 auto">
                    {CurrentStepComponent && (
                        <CurrentStepComponent
                            formData={formData}
                            updateFormData={updateFormData}
                            validationErrors={null}
                        />
                    )}
                </Box>
            </Box>
        </Box>
    )
}

// Main WizardMode component that provides the context
const WizardMode: React.FC<WizardModeProps> = ({
    steps,
    propertyId,
    onComplete,
    onBack,
    onCancel,
    className,
    style
}) => {
    return (
        <Box className={className} style={style}>
            <WizardProvider
                steps={steps}
                propertyId={propertyId}
                onComplete={onComplete}
                onCancel={onCancel}
            >
                <WizardContent 
                    steps={steps}
                    onBack={onBack}
                    onCancel={onCancel}
                />
            </WizardProvider>
        </Box>
    )
}

export default WizardMode