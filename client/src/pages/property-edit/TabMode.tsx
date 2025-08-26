import React, {useEffect, useState} from 'react'
import {
    FaArrowLeft,
    FaBed,
    FaBuilding,
    FaCamera,
    FaCog,
    FaDollarSign,
    FaExclamationTriangle,
    FaGavel,
    FaMapMarkerAlt,
    FaSpinner,
    FaTimes,
    FaWifi
} from 'react-icons/fa'
import {SecuredPage} from '@/components/SecuredPage.tsx'
import {Box, Tab} from '@/components'
import Button from '@/components/base/Button.tsx'
import {TabItem} from '@/components/base/Tab'
import {useAppDispatch, useAppSelector, store} from '@/store'
import {
    clearValidationErrors,
    fetchPropertyById,
    initializeWizardForEdit,
    updateProperty,
    updateWizardData,
    resetToOriginalWizardData
} from '@/store/slices/propertySlice'
import {WizardFormData} from '@/types/property'
import {useAppShell} from '@/components/base/AppShell'
import ConfirmationDialog from '@/components/base/ConfirmationDialog'
import {changeDetection, editStorage} from '@/utils/wizardStorage'
import PropertyEditHeader from './PropertyEditHeader'
import SaveFooter from './SaveFooter'

// Import tab components
import DetailsTab from './DetailsTab'
import LocationTab from './LocationTab'
import LayoutTab from './LayoutTab'
import AmenitiesTab from './AmenitiesTab'
import PhotosTab from './PhotosTab'
import ServicesTab from './ServicesTab'
import RulesTab from './RulesTab'
import PricingTab from './PricingTab'

type TabId = 'details' | 'location' | 'layout' | 'amenities' | 'photos' | 'services' | 'rules' | 'pricing'

interface TabModeProps {
    propertyId: string
    initialTab?: TabId
    onBack?: () => void
}

const TabMode: React.FC<TabModeProps> = ({ propertyId, initialTab = 'details', onBack }) => {
    const dispatch = useAppDispatch()
    const { openDialog, registerNavigationGuard, mountHeader, mountFooter } = useAppShell()
    
    // Redux state
    const {currentProperty, wizardData, originalWizardData, loading, error, validationErrors} = useAppSelector((state) => state.property)
    const [isSaving, setIsSaving] = useState(false)

    // Local state
    const [activeTab, setActiveTab] = useState<TabId>(initialTab)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    // Scroll to top when tab changes
    useEffect(() => {
        window.scrollTo({top: 0, behavior: 'instant'})
    }, [activeTab])

    // Fetch property data on mount
    useEffect(() => {
        if (propertyId && propertyId !== 'new') {
            dispatch(fetchPropertyById(propertyId))
        }
    }, [dispatch, propertyId])

    // Initialize wizard data when property is loaded
    useEffect(() => {
        if (currentProperty) {
            dispatch(initializeWizardForEdit({property: currentProperty, mode: 'edit'}))
        }
    }, [currentProperty, dispatch])

    // Detect changes using Redux state
    useEffect(() => {
        if (wizardData && originalWizardData) {
            const { hasChanges } = changeDetection.detectChanges(originalWizardData, wizardData)
            setHasUnsavedChanges(hasChanges)
        } else {
            setHasUnsavedChanges(false)
        }
    }, [wizardData, originalWizardData])
    // Navigation guard to prevent accidental exit with unsaved changes
    useEffect(() => {
        if (!hasUnsavedChanges) return

        const cleanup = registerNavigationGuard(async () => {
            const shouldLeave = await openDialog<boolean>((close) => (
                <ConfirmationDialog
                    title="Unsaved Changes"
                    message="You have unsaved changes to this property. Are you sure you want to leave?"
                    confirmLabel="Yes, Leave"
                    cancelLabel="Stay"
                    onConfirm={() => close(true)}
                    onCancel={() => close(false)}
                    variant="warning"
                >
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.5rem 0 0 0' }}>
                        Your changes will be lost if you don't save them.
                    </p>
                </ConfirmationDialog>
            ))
            return shouldLeave
        })

        return cleanup
    }, [hasUnsavedChanges, registerNavigationGuard, openDialog])

    // Save last active tab to localStorage
    useEffect(() => {
        editStorage.updateLastActiveTab(propertyId, activeTab)
    }, [propertyId, activeTab])

    // Restore last active tab on mount
    useEffect(() => {
        const stored = editStorage.load(propertyId)
        if (stored && stored.lastActiveTab !== initialTab) {
            setActiveTab(stored.lastActiveTab)
        }
    }, [propertyId, initialTab])

    // Mount header and footer using AppShell
    useEffect(() => {
        // Mount header
        const unmountHeader = mountHeader(
            <PropertyEditHeader
                title={currentProperty?.name || 'Edit Property'}
                onBack={handleBack}
            />
        )

        // Mount footer only when there are unsaved changes
        let unmountFooter: (() => void) | null = null
        if (hasUnsavedChanges) {
            unmountFooter = mountFooter(
                <SaveFooter
                    onSave={handleSaveProperty}
                    onDiscard={handleDiscardChanges}
                    isSaving={isSaving}
                    hasErrors={!!validationErrors && Object.keys(validationErrors).length > 0}
                />,
                { visibility: 'persistent' }
            )
        }

        // Cleanup on unmount or when dependencies change
        return () => {
            unmountHeader()
            unmountFooter?.()
        }
    }, [
        currentProperty,
        propertyId,
        hasUnsavedChanges,
        isSaving,
        validationErrors,
        error,
        mountHeader,
        mountFooter
    ])

    // Handle form data updates
    const updateFormData = (updates: Partial<WizardFormData>) => {
        console.log('📝 TabMode updateFormData called with:', updates)
        console.log('📝 Current wizardData before update:', wizardData)
        dispatch(updateWizardData(updates))
        if (validationErrors) {
            dispatch(clearValidationErrors())
        }
    }

    // Handle save property
    const handleSaveProperty = async () => {
        if (currentProperty?.propertyId) {
            // Get fresh wizardData directly from Redux store to avoid stale closure
            const currentWizardData = store.getState().property.wizardData
            
            if (currentWizardData) {
                console.log('💾 Saving property with fresh wizardData:', currentWizardData)
                setIsSaving(true)
                const result = await dispatch(updateProperty({
                    propertyId: currentProperty.propertyId,
                    data: currentWizardData
                }))
                
                // Show success or failure dialog
                if (updateProperty.fulfilled.match(result)) {
                    // Success: Show success dialog
                    // Note: originalWizardData is automatically updated in the Redux slice
                    await openDialog<void>((close) => (
                        <ConfirmationDialog
                            title="Changes Saved Successfully!"
                            message="Your property has been updated with the latest changes."
                            confirmLabel="Continue Editing"
                            onConfirm={() => close()}
                            onCancel={() => close()}
                            variant="success"
                        />
                    ))
                } else {
                    // Failure: Show error dialog
                    const errorMessage = (result.payload as any)?.message || 'Failed to save changes. Please try again.'
                    await openDialog<void>((close) => (
                        <ConfirmationDialog
                            title="Save Failed"
                            message={errorMessage}
                            confirmLabel="Try Again"
                            onConfirm={() => close()}
                            onCancel={() => close()}
                            variant="destructive"
                        >
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.5rem 0 0 0' }}>
                                Your changes have not been saved. Please review any validation errors and try again.
                            </p>
                        </ConfirmationDialog>
                    ))
                    // Keep unsaved changes state so user can try again
                }
                setIsSaving(false)
            }
        }
    }

    // Handle discard changes
    const handleDiscardChanges = async () => {
        const shouldDiscard = await openDialog<boolean>((close) => (
            <ConfirmationDialog
                title="Discard Changes?"
                message="Are you sure you want to discard all unsaved changes?"
                confirmLabel="Yes, Discard"
                cancelLabel="Keep Editing"
                onConfirm={() => close(true)}
                onCancel={() => close(false)}
                variant="warning"
            />
        ))

        if (shouldDiscard) {
            // Reset to original data using Redux action
            dispatch(resetToOriginalWizardData())
        }
    }

    const handleBack = async () => {
        if (hasUnsavedChanges) {
            const shouldSaveAndLeave = await openDialog<boolean>((close) => (
                <ConfirmationDialog
                    title="Unsaved Changes"
                    message="You have unsaved changes. Do you want to save them before leaving?"
                    confirmLabel="Save & Leave"
                    cancelLabel="Leave Without Saving"
                    onConfirm={() => close(true)}
                    onCancel={() => close(false)}
                    variant="warning"
                />
            ))

            if (shouldSaveAndLeave) {
                await handleSaveProperty()
            }
            onBack?.()
        } else {
            onBack?.()
        }
    }

    // Tab configuration using extracted components
    const tabs: TabItem[] = [
        {
            id: 'details',
            label: 'Details',
            icon: <FaBuilding/>,
            content: <DetailsTab formData={wizardData || {}} updateFormData={updateFormData}
                                 validationErrors={validationErrors}/>
        },
        {
            id: 'location',
            label: 'Location',
            icon: <FaMapMarkerAlt/>,
            content: <LocationTab formData={wizardData || {}} updateFormData={updateFormData}
                                  validationErrors={validationErrors}/>
        },
        {
            id: 'layout',
            label: 'Layout',
            icon: <FaBed/>,
            content: <LayoutTab formData={wizardData || {}} updateFormData={updateFormData}
                                validationErrors={validationErrors}/>
        },
        {
            id: 'amenities',
            label: 'Amenities',
            icon: <FaWifi/>,
            content: <AmenitiesTab formData={wizardData || {}} updateFormData={updateFormData}
                                   validationErrors={validationErrors}/>
        },
        {
            id: 'photos',
            label: 'Photos',
            icon: <FaCamera/>,
            content: <PhotosTab formData={wizardData || {}} currentProperty={currentProperty} updateFormData={updateFormData}
                                validationErrors={validationErrors}/>
        },
        {
            id: 'services',
            label: 'Services',
            icon: <FaCog/>,
            content: <ServicesTab formData={wizardData || {}} updateFormData={updateFormData}
                                  validationErrors={validationErrors}/>
        },
        {
            id: 'rules',
            label: 'Rules',
            icon: <FaGavel/>,
            content: <RulesTab formData={wizardData || {}} updateFormData={updateFormData} validationErrors={validationErrors}/>
        },
        {
            id: 'pricing',
            label: 'Pricing',
            icon: <FaDollarSign/>,
            content: <PricingTab formData={wizardData || {}} updateFormData={updateFormData}
                                 validationErrors={validationErrors}/>
        }
    ]

    if (loading) {
        return (
            <SecuredPage>
                <Box padding="2rem" maxWidth="1200px" margin="0 auto">
                    <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                        <Box display="flex" alignItems="center" gap="0.5rem">
                            <FaSpinner/>
                            <span>Loading property...</span>
                        </Box>
                    </Box>
                </Box>
            </SecuredPage>
        )
    }

    if (!currentProperty) {
        return (
            <SecuredPage>
                <Box padding="2rem" maxWidth="1200px" margin="0 auto">
                    <Box textAlign="center" padding="4rem">
                        <h2 style={{color: '#dc2626', marginBottom: '1rem'}}>Property Not Found</h2>
                        <p style={{color: '#666', marginBottom: '2rem'}}>
                            The property you're looking for doesn't exist or you don't have permission to edit it.
                        </p>
                        <Button
                            label="Back to Properties"
                            icon={<FaArrowLeft/>}
                            onClick={handleBack}
                            variant="promoted"
                        />
                    </Box>
                </Box>
            </SecuredPage>
        )
    }

    return (
        <SecuredPage>
            <Box maxWidth="1200px" margin="0 auto">

                {/* Error Display */}
                {error && (
                    <Box
                        marginBottom="1rem"
                        padding="1rem"
                        backgroundColor="#fee2e2"
                        color="#dc2626"
                        borderRadius="8px"
                        fontSize="0.875rem"
                    >
                        <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
                            {validationErrors ? <FaExclamationTriangle style={{color: '#dc2626'}}/> :
                                <FaTimes style={{color: '#dc2626'}}/>}
                            <h4 style={{margin: 0, fontWeight: '600'}}>
                                {validationErrors ? 'Validation Errors' : 'Error'}
                            </h4>
                        </Box>
                        <p style={{margin: '0 0 1rem 0'}}>{error}</p>
                        {validationErrors && (
                            <Box
                                backgroundColor="rgba(255,255,255,0.7)"
                                padding="0.75rem"
                                borderRadius="6px"
                                fontSize="0.8125rem"
                            >
                                <strong style={{display: 'block', marginBottom: '0.5rem'}}>
                                    Please fix these issues:
                                </strong>
                                <ul style={{margin: '0', paddingLeft: '1.25rem', lineHeight: '1.4'}}>
                                    {Object.entries(validationErrors).map(([field, message]) => (
                                        <li key={field}>
                                            <strong>{field}:</strong> {message}
                                        </li>
                                    ))}
                                </ul>
                            </Box>
                        )}
                    </Box>
                )}

                {/* Mobile-Optimized Tabs */}
                <Tab
                    items={tabs}
                    activeTab={activeTab}
                    onTabChange={(tabId) => {
                        setActiveTab(tabId as TabId)
                        window.scrollTo({top: 0, behavior: 'instant'})
                    }}
                    orientation={'horizontal'}
                    variant="pills"
                    size="medium"
                    fullWidth={false}
                    tabBarStyle={{
                        backgroundColor: 'white',
                        borderBottom: '1px solid #e5e5e5',
                        paddingBottom: '1rem',
                        paddingTop:'1rem',
                        marginBottom:'2rem',
                        borderRadius : 0,
                    }}
                    style={{
                        marginBottom: '1rem',
                        overflowX: 'auto',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}
                />

            </Box>
        </SecuredPage>
    )
}

export default TabMode