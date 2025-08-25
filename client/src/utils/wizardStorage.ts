import { WizardStorage, EditStorage, TabId } from '@/components/base/Wizard/types'
import { WizardFormData } from '@/types/property'

// Storage keys
const WIZARD_STORAGE_KEY = 'property-wizard-draft'
const EDIT_STORAGE_KEY = 'property-edit-state'

/**
 * Wizard Storage Utilities for Creation Mode
 */
export class WizardStorageManager {
    private static serializeSet<T>(set: Set<T>): T[] {
        return Array.from(set)
    }
    
    private static deserializeSet<T>(array: T[] | undefined): Set<T> {
        return new Set(array || [])
    }

    static save(data: WizardStorage): void {
        try {
            const serializedData = {
                ...data,
                completedSteps: this.serializeSet(data.completedSteps),
                lastSaveTime: Date.now()
            }
            localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(serializedData))
        } catch (error) {
            console.error('Failed to save wizard data to localStorage:', error)
        }
    }

    static load(): WizardStorage | null {
        try {
            const stored = localStorage.getItem(WIZARD_STORAGE_KEY)
            if (!stored) return null

            const parsed = JSON.parse(stored)
            return {
                ...parsed,
                completedSteps: this.deserializeSet(parsed.completedSteps)
            }
        } catch (error) {
            console.error('Failed to load wizard data from localStorage:', error)
            return null
        }
    }

    static clear(): void {
        try {
            localStorage.removeItem(WIZARD_STORAGE_KEY)
        } catch (error) {
            console.error('Failed to clear wizard data from localStorage:', error)
        }
    }

    static updateFormData(updates: Partial<WizardFormData>): void {
        const existing = this.load()
        if (!existing) return

        const updated: WizardStorage = {
            ...existing,
            formData: { ...existing.formData, ...updates },
            lastSaveTime: Date.now()
        }
        this.save(updated)
    }

    static updateCurrentStep(step: number): void {
        const existing = this.load()
        if (!existing) return

        const updated: WizardStorage = {
            ...existing,
            currentStep: step,
            lastSaveTime: Date.now()
        }
        this.save(updated)
    }

    static addCompletedStep(stepIndex: number): void {
        const existing = this.load()
        if (!existing) return

        const completedSteps = new Set(existing.completedSteps)
        completedSteps.add(stepIndex)

        const updated: WizardStorage = {
            ...existing,
            completedSteps,
            lastSaveTime: Date.now()
        }
        this.save(updated)
    }

    static addUploadedPhoto(photoId: string): void {
        const existing = this.load()
        if (!existing) return

        const uploadedPhotos = [...existing.uploadedPhotos]
        if (!uploadedPhotos.includes(photoId)) {
            uploadedPhotos.push(photoId)
        }

        const updated: WizardStorage = {
            ...existing,
            uploadedPhotos,
            lastSaveTime: Date.now()
        }
        this.save(updated)
    }

    static removeUploadedPhoto(photoId: string): void {
        const existing = this.load()
        if (!existing) return

        const updated: WizardStorage = {
            ...existing,
            uploadedPhotos: existing.uploadedPhotos.filter(id => id !== photoId),
            lastSaveTime: Date.now()
        }
        this.save(updated)
    }

    static hasStoredData(): boolean {
        return localStorage.getItem(WIZARD_STORAGE_KEY) !== null
    }

    static getLastSaveTime(): number | null {
        const stored = this.load()
        return stored?.lastSaveTime || null
    }
}

/**
 * Edit Mode Storage Utilities
 */
export class EditStorageManager {
    static save(data: EditStorage): void {
        try {
            localStorage.setItem(EDIT_STORAGE_KEY, JSON.stringify({
                ...data,
                lastEditTime: Date.now()
            }))
        } catch (error) {
            console.error('Failed to save edit state to localStorage:', error)
        }
    }

    static load(propertyId: string): EditStorage | null {
        try {
            const stored = localStorage.getItem(EDIT_STORAGE_KEY)
            if (!stored) return null

            const parsed: EditStorage = JSON.parse(stored)
            
            // Only return data if it's for the same property
            if (parsed.propertyId === propertyId) {
                return parsed
            }
            
            return null
        } catch (error) {
            console.error('Failed to load edit state from localStorage:', error)
            return null
        }
    }

    static clear(): void {
        try {
            localStorage.removeItem(EDIT_STORAGE_KEY)
        } catch (error) {
            console.error('Failed to clear edit state from localStorage:', error)
        }
    }

    static updateLastActiveTab(propertyId: string, tab: TabId): void {
        const data: EditStorage = {
            lastActiveTab: tab,
            lastEditTime: Date.now(),
            propertyId
        }
        this.save(data)
    }
}

/**
 * Change Detection Utilities
 */
export class ChangeDetectionManager {
    static detectChanges(original: Partial<WizardFormData>, current: Partial<WizardFormData>): {
        hasChanges: boolean
        changedFields: string[]
    } {
        const changedFields: string[] = []
        
        // Get all unique keys from both objects
        const allKeys = new Set([
            ...Object.keys(original || {}),
            ...Object.keys(current || {})
        ])

        for (const key of allKeys) {
            const originalValue = original?.[key as keyof WizardFormData]
            const currentValue = current?.[key as keyof WizardFormData]

            // Deep comparison for arrays and objects
            if (!this.deepEqual(originalValue, currentValue)) {
                changedFields.push(key)
            }
        }

        return {
            hasChanges: changedFields.length > 0,
            changedFields
        }
    }

    private static deepEqual(a: any, b: any): boolean {
        if (a === b) return true
        if (a === null || b === null) return a === b
        if (a === undefined || b === undefined) return a === b
        
        if (typeof a !== typeof b) return false
        
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) return false
            return a.every((item, index) => this.deepEqual(item, b[index]))
        }
        
        if (typeof a === 'object' && typeof b === 'object') {
            const aKeys = Object.keys(a)
            const bKeys = Object.keys(b)
            
            if (aKeys.length !== bKeys.length) return false
            
            return aKeys.every(key => 
                bKeys.includes(key) && this.deepEqual(a[key], b[key])
            )
        }
        
        return false
    }
}

// Utility functions for external use
export const wizardStorage = {
    save: WizardStorageManager.save.bind(WizardStorageManager),
    load: WizardStorageManager.load.bind(WizardStorageManager),
    clear: WizardStorageManager.clear.bind(WizardStorageManager),
    hasStoredData: WizardStorageManager.hasStoredData.bind(WizardStorageManager),
    updateFormData: WizardStorageManager.updateFormData.bind(WizardStorageManager),
    updateCurrentStep: WizardStorageManager.updateCurrentStep.bind(WizardStorageManager),
    addCompletedStep: WizardStorageManager.addCompletedStep.bind(WizardStorageManager),
    addUploadedPhoto: WizardStorageManager.addUploadedPhoto.bind(WizardStorageManager),
    removeUploadedPhoto: WizardStorageManager.removeUploadedPhoto.bind(WizardStorageManager),
}

export const editStorage = {
    save: EditStorageManager.save.bind(EditStorageManager),
    load: EditStorageManager.load.bind(EditStorageManager),
    clear: EditStorageManager.clear.bind(EditStorageManager),
    updateLastActiveTab: EditStorageManager.updateLastActiveTab.bind(EditStorageManager),
}

export const changeDetection = {
    detectChanges: ChangeDetectionManager.detectChanges.bind(ChangeDetectionManager),
}