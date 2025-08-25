import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { useAppShell } from '@/components/base/AppShell'
import { 
    createProperty, 
    updateWizardData, 
    clearValidationErrors,
    setCurrentProperty 
} from '@/store/slices/propertySlice'
import { WizardFormData } from '@/types/property'
import { 
    WizardContextType, 
    WizardStorage, 
    StepValidationFunction,
    WizardStep
} from './types'
import { wizardStorage, changeDetection } from '@/utils/wizardStorage'
import ConfirmationDialog from '../ConfirmationDialog'

interface WizardProviderProps {
    children: React.ReactNode
    steps: WizardStep[]
    propertyId: string
    onComplete?: (propertyId: string) => void
    onCancel?: () => void
}

const WizardContext = createContext<WizardContextType | undefined>(undefined)

export const WizardProvider: React.FC<WizardProviderProps> = ({
    children,
    steps,
    propertyId,
    onComplete
}) => {
    const dispatch = useAppDispatch()
    const { validationErrors } = useAppSelector((state) => state.property)
    const { openDialog, registerNavigationGuard } = useAppShell()
    
    // Local state
    const [currentStep, setCurrentStep] = useState(0)
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
    const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
    const [formData, setFormData] = useState<Partial<WizardFormData>>({})
    const [originalFormData, setOriginalFormData] = useState<Partial<WizardFormData>>({})
    
    // Track if we're initializing to prevent unnecessary saves
    const initializingRef = useRef(true)
    // Track if we're in the process of programmatic cancellation to skip navigation guard
    const isCancellingRef = useRef(false)
    const hasChanges = changeDetection.detectChanges(originalFormData, formData).hasChanges

    // Initialize wizard from localStorage or empty state
    useEffect(() => {
        if (propertyId === 'new') {
            const stored = wizardStorage.load()
            if (stored) {
                setCurrentStep(stored.currentStep)
                setCompletedSteps(stored.completedSteps)
                setUploadedPhotos(stored.uploadedPhotos)
                setFormData(stored.formData)
                setOriginalFormData(stored.formData)
                dispatch(updateWizardData(stored.formData))
            } else {
                // Initialize empty wizard state
                const initialData: Partial<WizardFormData> = {}
                setFormData(initialData)
                setOriginalFormData(initialData)
                dispatch(updateWizardData(initialData))
            }
        }
        initializingRef.current = false
    }, [propertyId, dispatch])

    // Navigation guard to prevent accidental exit
    useEffect(() => {
        if (!hasChanges) return

        const cleanup = registerNavigationGuard(async () => {
            // Skip navigation guard if user is explicitly cancelling
            if (isCancellingRef.current) {
                return true // Allow navigation without confirmation
            }

            const shouldLeave = await openDialog<boolean>((close) => (
                <ConfirmationDialog
                    title="Unsaved Changes"
                    message="You have unsaved changes in your property draft. Are you sure you want to leave?"
                    confirmLabel="Yes, Leave"
                    cancelLabel="Stay"
                    onConfirm={() => close(true)}
                    onCancel={() => close(false)}
                    variant="warning"
                >
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.5rem 0 0 0' }}>
                        Your progress will be saved and you can resume later.
                    </p>
                </ConfirmationDialog>
            ))
            return shouldLeave
        })

        return cleanup
    }, [hasChanges, registerNavigationGuard, openDialog])

    // Auto-save to localStorage when form data changes (but not during initialization)
    useEffect(() => {
        if (initializingRef.current || propertyId !== 'new') return

        const storage: WizardStorage = {
            currentStep,
            formData,
            uploadedPhotos,
            completedSteps,
            lastSaveTime: Date.now(),
            propertyId
        }
        wizardStorage.save(storage)
    }, [formData, currentStep, completedSteps, uploadedPhotos, propertyId])

    // Validation functions for each step
    const getStepValidationFunction = useCallback((): StepValidationFunction => {
        // Return validation functions based on step
        // These will be implemented based on your existing validation logic
        return async () => {
            // For now, return null (no validation errors)
            // This will be expanded with actual validation logic
            return null
        }
    }, [])

    const updateFormData = useCallback((updates: Partial<WizardFormData>) => {
        console.log('📝 updateFormData called with:', updates)
        setFormData(prev => {
            const newFormData = { ...prev, ...updates }
            console.log('📝 formData updated from:', prev, 'to:', newFormData)
            return newFormData
        })
        dispatch(updateWizardData(updates))
        
        // Clear validation errors when user starts editing
        if (validationErrors) {
            dispatch(clearValidationErrors())
        }
    }, [dispatch, validationErrors])

    const validateCurrentStep = async () => {
        const step = steps[currentStep]
        if (!step) return null

        const validationFn = getStepValidationFunction()
        return await validationFn(formData)
    }

    const isCurrentStepValid = async () => {
        const errors = await validateCurrentStep()
        return errors === null || Object.keys(errors).length === 0
    }

    const markStepCompleted = useCallback((stepIndex: number) => {
        setCompletedSteps(prev => {
            const newSet = new Set(prev)
            newSet.add(stepIndex)
            return newSet
        })
    }, [])

    const goToStep = useCallback((stepIndex: number) => {
        if (stepIndex < 0 || stepIndex >= steps.length) return
        setCurrentStep(stepIndex)
    }, [steps.length])

    const nextStep = useCallback(async () => {
        // Validate current step
        const isValid = await isCurrentStepValid()
        if (!isValid) {
            // Show validation errors but don't prevent navigation for now
            // This can be made stricter based on requirements
            console.warn('Current step has validation errors')
        }

        // Mark current step as completed
        markStepCompleted(currentStep)

        // Move to next step
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
        }
    }, [currentStep, steps.length, markStepCompleted])

    const previousStep = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }, [currentStep])

    const saveDraft = useCallback(() => {
        if (propertyId === 'new') {
            // Use current state values directly instead of dependencies
            const storage: WizardStorage = {
                currentStep,
                formData,
                uploadedPhotos,
                completedSteps,
                lastSaveTime: Date.now(),
                propertyId
            }
            wizardStorage.save(storage)
        }
    }, [propertyId])

    const clearDraft = useCallback(() => {
        wizardStorage.clear()
        setCurrentStep(0)
        setCompletedSteps(new Set())
        setUploadedPhotos([])
        setFormData({})
        setOriginalFormData({})
        dispatch(setCurrentProperty(null))
    }, [dispatch])

    const addUploadedPhoto = useCallback((photoId: string) => {
        setUploadedPhotos(prev => {
            if (!prev.includes(photoId)) {
                return [...prev, photoId]
            }
            return prev
        })
    }, [])

    const removeUploadedPhoto = useCallback((photoId: string) => {
        setUploadedPhotos(prev => prev.filter(id => id !== photoId))
    }, [])

    // This will be used later when implementing cancel functionality
    // const handleCancel = useCallback(async () => {
    //     const shouldCancel = await openDialog<boolean>((close) => (
    //         <ConfirmationDialog
    //             title="Cancel Property Creation?"
    //             message="This will delete all progress and any uploaded photos. This action cannot be undone."
    //             confirmLabel="Yes, Cancel"
    //             cancelLabel="Continue Editing"
    //             onConfirm={() => close(true)}
    //             onCancel={() => close(false)}
    //             variant="destructive"
    //         />
    //     ))

    //     if (shouldCancel) {
    //         // TODO: Call photo deletion API for uploadedPhotos
    //         // await deleteUploadedPhotos(uploadedPhotos)
            
    //         clearDraft()
    //         onCancel?.()
    //     }
    // }, [openDialog, uploadedPhotos, clearDraft, onCancel])

    const submitFinal = useCallback(async () => {
        console.log('🚀 submitFinal called', { propertyId, formData })
        if (propertyId === 'new' && formData) {
            console.log('📤 Dispatching createProperty with:', formData)
            const result = await dispatch(createProperty(formData as WizardFormData))
            console.log('📥 createProperty result:', result)
            
            if (createProperty.fulfilled.match(result)) {
                console.log('✅ Property created successfully:', result.payload)
                // Clear draft after successful creation
                clearDraft()
                onComplete?.(result.payload.propertyId || '')
            } else {
                console.log('❌ Property creation failed:', result)
            }
        } else {
            console.log('❌ submitFinal conditions not met:', { propertyId, formDataExists: !!formData })
        }
    }, [propertyId, dispatch, clearDraft, onComplete])

    const isStepCompleted = useCallback((stepIndex: number) => {
        return completedSteps.has(stepIndex)
    }, [completedSteps])

    const beginProgrammaticCancel = useCallback(() => {
        isCancellingRef.current = true
        // Reset the flag after a short delay to prevent it from affecting future navigations
        setTimeout(() => {
            isCancellingRef.current = false
        }, 100)
    }, [])

    const canGoNext = currentStep < steps.length - 1
    const canGoPrevious = currentStep > 0

    const contextValue: WizardContextType = {
        // Current state
        currentStep,
        totalSteps: steps.length,
        formData,
        uploadedPhotos,
        completedSteps,
        
        // Navigation capabilities
        canGoNext,
        canGoPrevious,
        isCurrentStepValid: false, // This will be computed asynchronously
        isStepCompleted,
        
        // Actions
        goToStep,
        nextStep,
        previousStep,
        updateFormData,
        markStepCompleted,
        
        // Storage operations
        saveDraft,
        clearDraft,
        
        // Photo management
        addUploadedPhoto,
        removeUploadedPhoto,
        
        // Validation
        validateCurrentStep,
        
        // Final submission
        submitFinal,
        
        // Navigation guard control
        beginProgrammaticCancel
    }

    return (
        <WizardContext.Provider value={contextValue}>
            {children}
        </WizardContext.Provider>
    )
}

export const useWizard = (): WizardContextType => {
    const context = useContext(WizardContext)
    if (!context) {
        throw new Error('useWizard must be used within a WizardProvider')
    }
    return context
}

export default WizardProvider