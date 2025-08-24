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
    FaSave,
    FaSpinner,
    FaTimes,
    FaWifi
} from 'react-icons/fa'
import {useAppShell} from '@/components/base/AppShell'
import {SecuredPage} from '@/components/SecuredPage.tsx'
import {Box, Tab} from '@/components'
import Button from '@/components/base/Button.tsx'
import {TabItem} from '@/components/base/Tab'
import {useAppDispatch, useAppSelector} from '@/store'
import {
    clearValidationErrors,
    createProperty,
    fetchPropertyById,
    initializeWizardForEdit,
    setCurrentProperty,
    updateProperty,
    updateWizardData,
} from '@/store/slices/propertySlice'
import {WizardFormData} from '@/types/property'

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

interface PropertyEditProps {
    propertyId?: string
    tab?: TabId
    mode?: 'view' | 'edit'
}

const PropertyEdit: React.FC<PropertyEditProps> = (props) => {
    const {navigateTo, currentParams} = useAppShell()

    // Combine props from navigation and URL query parameters
    const params = {...props, ...currentParams}
    const dispatch = useAppDispatch()

    // Redux state
    const {currentProperty, wizardData, loading, error, validationErrors} = useAppSelector((state) => state.property)

    // Local state - initialize from URL params or default to 'details'
    const [activeTab, setActiveTab] = useState<TabId>(params.tab || 'details')
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [formData, setFormData] = useState<Partial<WizardFormData>>({})

    // Scroll to top when tab changes via URL parameters
    useEffect(() => {
        window.scrollTo({top: 0, behavior: 'smooth'})
    }, [activeTab])

    // Fetch property data on mount
    useEffect(() => {
        if (params.propertyId && params.propertyId !== 'new') {
            dispatch(fetchPropertyById(params.propertyId))
        } else if (params.propertyId === 'new') {
            // Clear currentProperty when creating a new property
            dispatch(setCurrentProperty(null))
        }
    }, [dispatch, params.propertyId])

    // Initialize wizard data when property is loaded or changes
    useEffect(() => {
        if (params.propertyId === 'new') {
            // For new property, wizard should already be initialized from PropertiesList
            // Do nothing here to preserve the initialized wizard data
        } else if (currentProperty) {
            dispatch(initializeWizardForEdit({property: currentProperty, mode: 'edit'}))
        }
    }, [currentProperty, params.propertyId, dispatch])

    // Sync wizard data with form data
    useEffect(() => {
        if (wizardData) {
            setFormData(wizardData)
        }
    }, [wizardData])

    // Handle form data updates
    const updateFormData = (updates: Partial<WizardFormData>) => {
        const newData = {...formData, ...updates}
        setFormData(newData)
        dispatch(updateWizardData(updates))
        setHasUnsavedChanges(true)

        // Clear validation errors when user starts editing
        if (validationErrors) {
            dispatch(clearValidationErrors())
        }
    }

    // Handle save property
    const handleSaveProperty = async () => {
        if (params.propertyId === 'new' && wizardData) {
            // Create new property
            const result = await dispatch(createProperty(wizardData))
            if (createProperty.fulfilled.match(result)) {
                setHasUnsavedChanges(false)
                // Navigate to edit mode with the new property ID
                navigateTo('property-edit', {propertyId: result.payload.propertyId})
            }
        } else if (currentProperty?.propertyId && wizardData) {
            // Update existing property
            await dispatch(updateProperty({
                propertyId: currentProperty.propertyId,
                data: wizardData
            }))
            setHasUnsavedChanges(false)
        }
    }

    // Tab configuration using extracted components
    const tabs: TabItem[] = [
        {
            id: 'details',
            label: 'Details',
            icon: <FaBuilding/>,
            content: <DetailsTab formData={formData} updateFormData={updateFormData}
                                 validationErrors={validationErrors}/>
        },
        {
            id: 'location',
            label: 'Location',
            icon: <FaMapMarkerAlt/>,
            content: <LocationTab formData={formData} updateFormData={updateFormData}
                                  validationErrors={validationErrors}/>
        },
        {
            id: 'layout',
            label: 'Layout',
            icon: <FaBed/>,
            content: <LayoutTab formData={formData} updateFormData={updateFormData}
                                validationErrors={validationErrors}/>
        },
        {
            id: 'amenities',
            label: 'Amenities',
            icon: <FaWifi/>,
            content: <AmenitiesTab formData={formData} updateFormData={updateFormData}
                                   validationErrors={validationErrors}/>
        },
        {
            id: 'photos',
            label: 'Photos',
            icon: <FaCamera/>,
            content: <PhotosTab formData={formData} currentProperty={currentProperty} updateFormData={updateFormData}
                                validationErrors={validationErrors}/>
        },
        {
            id: 'services',
            label: 'Services',
            icon: <FaCog/>,
            content: <ServicesTab formData={formData} updateFormData={updateFormData}
                                  validationErrors={validationErrors}/>
        },
        {
            id: 'rules',
            label: 'Rules',
            icon: <FaGavel/>,
            content: <RulesTab formData={formData} updateFormData={updateFormData} validationErrors={validationErrors}/>
        },
        {
            id: 'pricing',
            label: 'Pricing',
            icon: <FaDollarSign/>,
            content: <PricingTab formData={formData} updateFormData={updateFormData}
                                 validationErrors={validationErrors}/>
        }
    ]

    if (loading && params.propertyId !== 'new') {
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

    if (!currentProperty && params.propertyId !== 'new') {
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
                            onClick={() => navigateTo('properties', {})}
                            variant="promoted"
                        />
                    </Box>
                </Box>
            </SecuredPage>
        )
    }

    // For new property, ensure wizard data is initialized
    if (params.propertyId === 'new' && !wizardData) {
        return (
            <SecuredPage>
                <Box padding="2rem" maxWidth="1200px" margin="0 auto">
                    <Box textAlign="center" padding="4rem">
                        <h2 style={{color: '#dc2626', marginBottom: '1rem'}}>Initializing...</h2>
                        <p style={{color: '#666', marginBottom: '2rem'}}>
                            Setting up property creation wizard...
                        </p>
                    </Box>
                </Box>
            </SecuredPage>
        )
    }

    return (
        <SecuredPage>
            <Box padding="1rem" maxWidth="1200px" margin="0 auto">
                {/* Header - Mobile Optimized */}
                <Box marginBottom="1.5rem">
                    <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
                        <Box flex="1">
                            <h1 style={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                margin: 0,
                                lineHeight: '1.2'
                            }}>
                                {params.propertyId === 'new' ? 'Add Property' : `Edit ${currentProperty?.name}`}
                            </h1>
                        </Box>
                    </Box>
                </Box>

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
                        // Update URL with new tab parameter
                        navigateTo('property-edit', {
                            ...params,
                            tab: tabId
                        })
                        // Scroll to top when changing tabs
                        window.scrollTo({top: 0, behavior: 'smooth'})
                    }}
                    orientation={'horizontal'}
                    variant="underline"
                    size="medium"
                    fullWidth={false}
                    tabBarStyle={{
                        backgroundColor: 'white',
                        borderBottom: '1px solid #e5e5e5',
                        justifyContent : 'space-between',
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

                {/* Mobile-Friendly Save Button - Floating for easy access */}
                {hasUnsavedChanges && (
                    <Box
                        position="fixed"
                        bottom="1rem"
                        right="1rem"
                        zIndex={1000}
                    >
                        <Button
                            label=""
                            icon={<FaSave/>}
                            onClick={handleSaveProperty}
                            variant="promoted"
                            size="large"
                            style={{
                                borderRadius: '50%',
                                width: '3.5rem',
                                height: '3.5rem',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                            }}
                        />
                    </Box>
                )}

                {/* Unsaved changes indicator */}
                {hasUnsavedChanges && (
                    <Box
                        position="fixed"
                        bottom="5.5rem"
                        right="1rem"
                        backgroundColor="rgba(220, 38, 38, 0.9)"
                        color="white"
                        padding="0.5rem 1rem"
                        borderRadius="1.5rem"
                        fontSize="0.75rem"
                        fontWeight="500"
                        zIndex={999}
                    >
                        Unsaved changes
                    </Box>
                )}

                {/* Bottom spacing for floating button */}
                <Box height="5rem"/>
            </Box>
        </SecuredPage>
    )
}

export default PropertyEdit