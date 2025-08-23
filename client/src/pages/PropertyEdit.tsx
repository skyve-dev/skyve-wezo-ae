import React, {useEffect, useState} from 'react'
import {FaArrowLeft, FaBed, FaBuilding, FaCamera, FaMapMarkerAlt, FaSave, FaSpinner, FaWifi} from 'react-icons/fa'
import {useAppShell} from '@/components/base/AppShell'
import {SecuredPage} from '@/components/SecuredPage.tsx'
import {Box, Tab} from '@/components'
import Button from '@/components/base/Button.tsx'
import Input from '@/components/base/Input.tsx'
import {TabItem} from '@/components/base/Tab'
import {useAppDispatch, useAppSelector} from '@/store'
import {
    fetchPropertyById,
    initializeWizardForEdit,
    updateProperty,
    updateWizardData,
} from '@/store/slices/propertySlice'
import {WizardFormData} from '@/types/property'

type TabId = 'details' | 'location' | 'layout' | 'amenities' | 'photos'

interface PropertyEditProps {
    propertyId?: string
    tab?: TabId
    mode?: 'view' | 'edit'
}

const PropertyEdit: React.FC<PropertyEditProps> = (props) => {
    const {navigateTo, currentParams} = useAppShell()
    
    // Combine props from navigation and URL query parameters
    const params = { ...props, ...currentParams }
    const dispatch = useAppDispatch()

    // Redux state
    const {currentProperty, wizardData, loading, error} = useAppSelector((state) => state.property)

    // Local state - initialize from URL params or default to 'details'
    const [activeTab, setActiveTab] = useState<TabId>(params.tab || 'details')
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [formData, setFormData] = useState<Partial<WizardFormData>>({})

    // Tab configuration
    const tabs: TabItem[] = [
        {
            id: 'details', 
            label: 'Basic Details', 
            icon: <FaBuilding/>,
            content: (
                <Box>
                    <h3 style={{marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600'}}>
                        Basic Property Information
                    </h3>
                    <Box display="grid" gap="1.5rem">
                        <Input
                            label="Property Name"
                            value={formData.name || ''}
                            onChange={(e) => updateFormData({name: e.target.value})}
                            placeholder="Enter a descriptive name for your property"
                        />

                        <Box>
                            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                                About Your Property
                            </label>
                            <textarea
                                value={formData.aboutTheProperty || ''}
                                onChange={(e) => updateFormData({aboutTheProperty: e.target.value})}
                                placeholder="Describe your property in detail..."
                                rows={6}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    fontSize: '0.875rem',
                                    resize: 'vertical'
                                }}
                            />
                        </Box>
                    </Box>
                </Box>
            )
        },
        {
            id: 'location', 
            label: 'Location', 
            icon: <FaMapMarkerAlt/>,
            content: (
                <Box>
                    <h3 style={{marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600'}}>
                        Property Location
                    </h3>
                    <Box display="grid" gap="1.5rem">
                        <Input
                            label="Country/Region"
                            value={formData.address?.countryOrRegion || 'UAE'}
                            onChange={(e) => updateFormData({
                                address: {
                                    countryOrRegion: e.target.value,
                                    city: formData.address?.city || '',
                                    zipCode: formData.address?.zipCode || 0
                                }
                            })}
                            placeholder="Enter country or region"
                        />

                        <Input
                            label="City"
                            value={formData.address?.city || ''}
                            onChange={(e) => updateFormData({
                                address: {
                                    countryOrRegion: formData.address?.countryOrRegion || 'UAE',
                                    city: e.target.value,
                                    zipCode: formData.address?.zipCode || 0
                                }
                            })}
                            placeholder="Enter city name"
                        />

                        <Input
                            label="Zip Code"
                            value={formData.address?.zipCode?.toString() || ''}
                            onChange={(e) => updateFormData({
                                address: {
                                    countryOrRegion: formData.address?.countryOrRegion || 'UAE',
                                    city: formData.address?.city || '',
                                    zipCode: parseInt(e.target.value) || 0
                                }
                            })}
                            placeholder="Enter zip code"
                            type="number"
                        />
                    </Box>
                </Box>
            )
        },
        {
            id: 'layout', 
            label: 'Layout', 
            icon: <FaBed/>,
            content: (
                <Box>
                    <h3 style={{marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600'}}>
                        Layout & Capacity
                    </h3>
                    <Box display="grid" gap="1.5rem">
                        <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem">
                            <Input
                                label="Maximum Guests"
                                value={formData.maximumGuest?.toString() || '1'}
                                onChange={(e) => updateFormData({maximumGuest: parseInt(e.target.value) || 1})}
                                type="number"
                                min="1"
                            />

                            <Input
                                label="Number of Bathrooms"
                                value={formData.bathrooms?.toString() || '1'}
                                onChange={(e) => updateFormData({bathrooms: parseInt(e.target.value) || 1})}
                                type="number"
                                min="1"
                            />
                        </Box>

                        <Input
                            label="Property Size (sq. meters) - Optional"
                            value={formData.propertySizeSqMtr?.toString() || ''}
                            onChange={(e) => updateFormData({propertySizeSqMtr: parseInt(e.target.value) || undefined})}
                            type="number"
                            placeholder="Enter property size"
                        />
                    </Box>
                </Box>
            )
        },
        {
            id: 'amenities', 
            label: 'Amenities', 
            icon: <FaWifi/>,
            content: (
                <Box>
                    <h3 style={{marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600'}}>
                        Property Amenities
                    </h3>
                    <p style={{color: '#666', marginBottom: '2rem'}}>
                        List the amenities available at your property. These help guests find your property in
                        search results.
                    </p>

                    <Box>
                        <label style={{display: 'block', marginBottom: '1rem', fontWeight: '500'}}>
                            Available Amenities ({formData.amenities?.length || 0})
                        </label>

                        {formData.amenities && formData.amenities.length > 0 ? (
                            <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(200px, 1fr))"
                                 gap="0.5rem">
                                {formData.amenities.map((amenity, index) => (
                                    <Box
                                        key={index}
                                        padding="0.75rem"
                                        border="1px solid #d1d5db"
                                        borderRadius="4px"
                                        textAlign="center"
                                    >
                                        {amenity.name}
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            <Box
                                padding="2rem"
                                textAlign="center"
                                border="2px dashed #d1d5db"
                                borderRadius="4px"
                                color="#666"
                            >
                                No amenities configured. Add amenities in the property creation wizard.
                            </Box>
                        )}
                    </Box>
                </Box>
            )
        },
        {
            id: 'photos', 
            label: 'Photos', 
            icon: <FaCamera/>,
            content: (
                <Box>
                    <h3 style={{marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600'}}>
                        Property Photos
                    </h3>
                    <p style={{color: '#666', marginBottom: '2rem'}}>
                        Upload high-quality photos to showcase your property. Minimum 5 photos recommended.
                    </p>

                    {currentProperty?.photos && currentProperty.photos.length > 0 ? (
                        <Box>
                            <label style={{display: 'block', marginBottom: '1rem', fontWeight: '500'}}>
                                Current Photos ({currentProperty.photos.length})
                            </label>

                            <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(200px, 1fr))"
                                 gap="1rem">
                                {currentProperty.photos.map((photo, index) => (
                                    <Box
                                        key={photo.id || index}
                                        borderRadius="8px"
                                        overflow="hidden"
                                        height="150px"
                                        backgroundImage={`url(${photo.url})`}
                                        backgroundSize="cover"
                                        backgroundPosition="center"
                                        position="relative"
                                    >
                                        {index === 0 && (
                                            <Box
                                                position="absolute"
                                                bottom="8px"
                                                left="8px"
                                                backgroundColor="rgba(0,0,0,0.7)"
                                                color="white"
                                                padding="0.25rem 0.5rem"
                                                borderRadius="4px"
                                                fontSize="0.75rem"
                                            >
                                                Main Photo
                                            </Box>
                                        )}
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    ) : (
                        <Box
                            padding="4rem 2rem"
                            textAlign="center"
                            border="2px dashed #d1d5db"
                            borderRadius="8px"
                            color="#666"
                        >
                            <FaCamera size={48} style={{marginBottom: '1rem', color: '#9ca3af'}}/>
                            <h4 style={{margin: '0 0 0.5rem 0', color: '#4b5563'}}>No photos uploaded</h4>
                            <p style={{margin: 0}}>Photos can be uploaded using the property creation wizard</p>
                        </Box>
                    )}
                </Box>
            )
        }
    ]

    // Fetch property data on mount
    useEffect(() => {
        if (params.propertyId && params.propertyId !== 'new') {
            dispatch(fetchPropertyById(params.propertyId))
        }
    }, [dispatch, params.propertyId])

    // Initialize wizard data when property is loaded
    useEffect(() => {
        if (currentProperty && !wizardData) {
            dispatch(initializeWizardForEdit({property: currentProperty, mode: 'edit'}))
        }
    }, [currentProperty, wizardData, dispatch])

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
    }

    // Handle save property
    const handleSaveProperty = async () => {
        if (currentProperty?.propertyId && wizardData) {
            await dispatch(updateProperty({
                propertyId: currentProperty.propertyId,
                data: wizardData
            }))
            setHasUnsavedChanges(false)
        }
    }


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

    return (
        <SecuredPage>
            <Box padding="2rem" maxWidth="1200px" margin="0 auto">
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="2rem">
                    <Box>
                        <Box display="flex" alignItems="center" gap="1rem" marginBottom="0.5rem">
                            <Button
                                label=""
                                icon={<FaArrowLeft/>}
                                onClick={() => navigateTo('properties', {})}
                                variant="normal"
                                size="small"
                            />
                            <h1 style={{fontSize: '2rem', fontWeight: 'bold', margin: 0}}>
                                {params.propertyId === 'new' ? 'Add New Property' : `Edit ${currentProperty?.name}`}
                            </h1>
                        </Box>
                        <p style={{color: '#666', margin: 0}}>
                            Update your property information and policies
                        </p>
                    </Box>

                    <Box display="flex" gap="1rem">
                        <Button
                            label="Save Changes"
                            icon={<FaSave/>}
                            onClick={handleSaveProperty}
                            variant="promoted"
                            disabled={!hasUnsavedChanges}
                        />
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
                    >
                        {error}
                    </Box>
                )}

                {/* Tabs */}
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
                    }}
                    variant="underline"
                    size="medium"
                    style={{ marginBottom: '2rem' }}
                />

                {/* Bottom Actions */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        {hasUnsavedChanges && (
                            <span style={{color: '#dc2626', fontSize: '0.875rem'}}>
                You have unsaved changes
              </span>
                        )}
                    </Box>

                    <Box display="flex" gap="1rem">
                        <Button
                            label="Cancel"
                            onClick={() => navigateTo('properties', {})}
                            variant="normal"
                        />
                        <Button
                            label="Save Property"
                            icon={<FaSave/>}
                            onClick={handleSaveProperty}
                            variant="promoted"
                            disabled={!hasUnsavedChanges}
                        />
                    </Box>
                </Box>
            </Box>
        </SecuredPage>
    )
}

export default PropertyEdit