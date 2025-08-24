import React, {useEffect, useState} from 'react'
import {FaBath, FaBed, FaCalendarAlt, FaEdit, FaEye, FaMapMarkerAlt, FaPlus, FaTrash} from 'react-icons/fa'
import {useAppShell} from '@/components/base/AppShell'
import {SecuredPage} from '@/components/SecuredPage.tsx'
import {Box} from '@/components'
import Button from '@/components/base/Button.tsx'
import {useAppDispatch, useAppSelector} from '@/store'
import {clearError, deleteProperty, fetchMyProperties, setCurrentProperty, initializeWizard} from '@/store/slices/propertySlice'
import {Property} from '@/types/property'
import {resolvePhotoUrl} from '@/utils/api'

const PropertiesList: React.FC = () => {
    const {navigateTo} = useAppShell()
    const dispatch = useAppDispatch()

    // Redux state
    const {properties, loading, error} = useAppSelector((state) => state.property)

    // Local state
    const [searchTerm, setSearchTerm] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; property: Property | null }>({
        isOpen: false,
        property: null
    })

    // Fetch properties on component mount
    useEffect(() => {
        dispatch(fetchMyProperties())
    }, [dispatch])

    // Clear errors when component unmounts
    useEffect(() => {
        return () => {
            dispatch(clearError())
        }
    }, [dispatch])

    // Filter properties
    const filteredProperties = React.useMemo(() => {
        if (!searchTerm) return properties

        return properties.filter(property =>
            property.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            property.address?.city?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [properties, searchTerm])

    // Handle property deletion
    const handleDeleteProperty = async () => {
        if (deleteDialog.property?.propertyId) {
            await dispatch(deleteProperty(deleteDialog.property.propertyId))
            setDeleteDialog({isOpen: false, property: null})
        }
    }

    // Handle property navigation
    const handleEditProperty = (property: Property, tab?: string) => {
        dispatch(setCurrentProperty(property))
        navigateTo('property-edit', {
            propertyId: property.propertyId,
            ...(tab && {tab})
        })
    }

    const handleViewProperty = (property: Property) => {
        dispatch(setCurrentProperty(property))
        navigateTo('property-view', {propertyId: property.propertyId})
    }

    const handleManageAvailability = (property: Property) => {
        dispatch(setCurrentProperty(property))
        navigateTo('availability', {propertyId: property.propertyId})
    }

    const renderPropertyCard = (property: Property) => (
        <Box
            key={property.propertyId}
            padding="1.5rem"
            backgroundColor="white"
            borderRadius="8px"
            boxShadow="0 2px 4px rgba(0,0,0,0.1)"
            position="relative"
        >
            {/* Property Photo */}
            {property.photos && property.photos.length > 0 ? (
                <Box
                    height="200px"
                    marginBottom="1rem"
                    borderRadius="8px"
                    overflow="hidden"
                    backgroundImage={`url(${resolvePhotoUrl(property.photos[0].url)})`}
                    backgroundSize="cover"
                    backgroundPosition="center"
                    position="relative"
                >
                    <Box
                        position="absolute"
                        top="8px"
                        right="8px"
                        backgroundColor="rgba(0,0,0,0.7)"
                        color="white"
                        padding="0.25rem 0.5rem"
                        borderRadius="4px"
                        fontSize="0.75rem"
                    >
                        {property.photos.length} photos
                    </Box>
                </Box>
            ) : (
                <Box
                    height="200px"
                    marginBottom="1rem"
                    borderRadius="8px"
                    backgroundColor="#f3f4f6"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="#9ca3af"
                >
                    <FaMapMarkerAlt size={48}/>
                </Box>
            )}

            {/* Property Info */}
            <Box marginBottom="1rem">
                <h3 style={{fontSize: '1.25rem', fontWeight: '600', margin: '0 0 0.5rem 0'}}>
                    {property.name}
                </h3>

                <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem" color="#666">
                    <FaMapMarkerAlt/>
                    <span>{property.address?.city ? `${property.address.city}, ` : ''}{property.address?.countryOrRegion || 'Location not set'}</span>
                </Box>

                <Box display="flex" gap="1rem" marginBottom="1rem" color="#666" fontSize="0.875rem">
                    <Box display="flex" alignItems="center" gap="0.25rem">
                        <FaBed/>
                        <span>Max {property.maximumGuest} guests</span>
                    </Box>
                    <Box display="flex" alignItems="center" gap="0.25rem">
                        <FaBath/>
                        <span>{property.bathrooms} bathrooms</span>
                    </Box>
                </Box>

                {/* Pricing */}
                {property.pricing && (
                    <Box marginBottom="1rem">
            <span style={{fontSize: '1.125rem', fontWeight: '600', color: '#059669'}}>
              {property.pricing.currency} {property.pricing.ratePerNight}
            </span>
                        <span style={{fontSize: '0.875rem', color: '#666', marginLeft: '0.25rem'}}>
              per night
            </span>
                    </Box>
                )}
            </Box>

            {/* Action Buttons */}
            <Box display="flex" gap="0.5rem" flexWrap={'wrap'}>
                <Button
                    label="View"
                    icon={<FaEye/>}
                    onClick={() => handleViewProperty(property)}
                    variant="normal"
                    size="small"
                />
                <Button
                    label="Edit"
                    icon={<FaEdit/>}
                    onClick={() => handleEditProperty(property)}
                    variant="normal"
                    size="small"
                />
                <Button
                    label="Edit Photos"
                    icon={<FaEdit/>}
                    onClick={() => handleEditProperty(property, 'photos')}
                    variant="normal"
                    size="small"
                    style={{fontSize: '0.75rem'}}
                />
                <Button
                    label="Calendar"
                    icon={<FaCalendarAlt/>}
                    onClick={() => handleManageAvailability(property)}
                    variant="normal"
                    size="small"
                />

                <Button
                    label=""
                    icon={<FaTrash/>}
                    onClick={() => setDeleteDialog({isOpen: true, property})}
                    variant="normal"
                    size="small"
                    style={{color: '#dc2626'}}
                />
            </Box>
        </Box>
    )

    if (loading) {
        return (
            <SecuredPage>
                <Box padding="2rem" maxWidth="1200px" margin="0 auto">
                    <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                        <div>Loading properties...</div>
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
                        <h1 style={{fontSize: '2rem', fontWeight: 'bold', margin: 0}}>My Properties</h1>
                        <p style={{color: '#666', margin: '0.5rem 0 0 0'}}>
                            Manage your property listings and track their performance
                        </p>
                    </Box>
                    <Button
                        label="Add New Property"
                        icon={<FaPlus/>}
                        onClick={() => {
                            dispatch(initializeWizard({}))
                            navigateTo('property-edit', { propertyId: 'new' })
                        }}
                        variant="promoted"
                    />
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

                {/* Search and View Toggle */}
                <Box
                    padding="1.5rem"
                    backgroundColor="white"
                    borderRadius="8px"
                    boxShadow="0 2px 4px rgba(0,0,0,0.1)"
                    marginBottom="2rem"
                >
                    <Box display="flex" gap="1rem" alignItems="center" flexWrap="wrap">
                        <Box flex="1" minWidth="300px">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search properties by name or location..."
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </Box>

                        <Box display="flex" gap="0.5rem">
                            <Button
                                label="Grid"
                                variant={viewMode === 'grid' ? 'promoted' : 'normal'}
                                size="small"
                                onClick={() => setViewMode('grid')}
                            />
                            <Button
                                label="List"
                                variant={viewMode === 'list' ? 'promoted' : 'normal'}
                                size="small"
                                onClick={() => setViewMode('list')}
                            />
                        </Box>
                    </Box>
                </Box>

                {/* Properties Count */}
                <Box marginBottom="1rem">
                    <p style={{color: '#666', margin: 0}}>
                        {filteredProperties.length} of {properties.length} properties
                    </p>
                </Box>

                {/* Properties Grid */}
                {filteredProperties.length === 0 ? (
                    <Box
                        padding="4rem 2rem"
                        textAlign="center"
                        backgroundColor="white"
                        borderRadius="8px"
                        boxShadow="0 2px 4px rgba(0,0,0,0.1)"
                    >
                        <Box color="#9ca3af" marginBottom="1rem">
                            <FaMapMarkerAlt size={48}/>
                        </Box>
                        <h3 style={{margin: '0 0 1rem 0', color: '#4b5563'}}>
                            {properties.length === 0 ? 'No properties yet' : 'No properties match your search'}
                        </h3>
                        <p style={{color: '#6b7280', marginBottom: '1.5rem'}}>
                            {properties.length === 0
                                ? 'Start by adding your first property to begin managing your listings'
                                : 'Try adjusting your search criteria'
                            }
                        </p>
                        {properties.length === 0 && (
                            <Button
                                label="Add Your First Property"
                                icon={<FaPlus/>}
                                onClick={() => {
                                    dispatch(initializeWizard({}))
                                    navigateTo('property-edit', { propertyId: 'new' })
                                }}
                                variant="promoted"
                            />
                        )}
                    </Box>
                ) : (
                    <Box
                        display="grid"
                        gridTemplateColumns="repeat(auto-fill, minmax(350px, 1fr))"
                        gap="1.5rem"
                    >
                        {filteredProperties.map(property => renderPropertyCard(property))}
                    </Box>
                )}
            </Box>

            {/* Delete Confirmation Dialog */}
            {deleteDialog.isOpen && (
                <Box
                    position="fixed"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    backgroundColor="rgba(0,0,0,0.5)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    style={{zIndex: 1000}}
                >
                    <Box
                        backgroundColor="white"
                        borderRadius="8px"
                        padding="2rem"
                        maxWidth="400px"
                        width="90%"
                    >
                        <h3 style={{marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600'}}>
                            Delete Property
                        </h3>
                        <p style={{marginBottom: '1.5rem', color: '#666'}}>
                            Are you sure you want to delete "{deleteDialog.property?.name}"?
                            This action cannot be undone and will remove all associated data.
                        </p>
                        <Box display="flex" gap="1rem" justifyContent="flex-end">
                            <Button
                                label="Cancel"
                                onClick={() => setDeleteDialog({isOpen: false, property: null})}
                                variant="normal"
                            />
                            <Button
                                label="Delete Property"
                                onClick={handleDeleteProperty}
                                variant="promoted"
                                style={{backgroundColor: '#dc2626'}}
                            />
                        </Box>
                    </Box>
                </Box>
            )}
        </SecuredPage>
    )
}

export default PropertiesList