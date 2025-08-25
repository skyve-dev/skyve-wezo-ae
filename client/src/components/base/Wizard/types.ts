import React from 'react'
import { WizardFormData, ValidationErrors } from '@/types/property'

// Tab ID type from PropertyEdit
export type TabId = 'details' | 'location' | 'layout' | 'amenities' | 'photos' | 'services' | 'rules' | 'pricing'

// Wizard step configuration
export interface WizardStep {
    id: TabId
    title: string
    description?: string
    icon: React.ReactNode
    component: React.ComponentType<any>
    isOptional?: boolean
    isRequired?: boolean
}

// Wizard state for localStorage persistence
export interface WizardStorage {
    currentStep: number
    formData: Partial<WizardFormData>
    uploadedPhotos: string[] // Track photo IDs for cleanup on cancel
    lastSaveTime: number
    completedSteps: Set<number> // Use Set for easier manipulation, will be serialized as array
    propertyId?: string // 'new' or actual property ID
}

// Edit mode state for localStorage
export interface EditStorage {
    lastActiveTab: TabId
    lastEditTime: number
    propertyId: string
}

// Wizard context type
export interface WizardContextType {
    // Current state
    currentStep: number
    totalSteps: number
    formData: Partial<WizardFormData>
    uploadedPhotos: string[]
    completedSteps: Set<number>
    
    // Navigation capabilities
    canGoNext: boolean
    canGoPrevious: boolean
    isCurrentStepValid: boolean
    isStepCompleted: (stepIndex: number) => boolean
    
    // Actions
    goToStep: (stepIndex: number) => void
    nextStep: () => Promise<void>
    previousStep: () => void
    updateFormData: (updates: Partial<WizardFormData>) => void
    markStepCompleted: (stepIndex: number) => void
    
    // Storage operations
    saveDraft: () => void
    clearDraft: () => void
    
    // Photo management
    addUploadedPhoto: (photoId: string) => void
    removeUploadedPhoto: (photoId: string) => void
    
    // Validation
    validateCurrentStep: () => Promise<ValidationErrors | null>
    
    // Final submission
    submitFinal: () => Promise<void>
    
    // Navigation guard control
    beginProgrammaticCancel: () => void
}

// Change detection utilities
export interface ChangeDetectionResult {
    hasChanges: boolean
    changedFields: string[]
}

// Validation function type for each step
export type StepValidationFunction = (formData: Partial<WizardFormData>) => Promise<ValidationErrors | null>

// Navigation guard function for wizard
export type WizardNavigationGuard = () => Promise<boolean>