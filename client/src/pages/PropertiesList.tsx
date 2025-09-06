import React, {useEffect, useState} from 'react'
import {IoIosWater, IoIosBed, IoIosCalendar, IoIosCreate, IoIosEye, IoIosPin, IoIosAdd, IoIosTrash} from 'react-icons/io'
import {useAppShell} from '@/components/base/AppShell'
import {Box, Input} from '@/components'
import Button from '@/components/base/Button.tsx'
import ConfirmationDialog from '@/components/base/ConfirmationDialog'
import {useAppDispatch, useAppSelector} from '@/store'
import {clearError, deleteProperty, fetchMyProperties, fetchPublicProperties, setCurrentProperty} from '@/store/slices/propertySlice'
import {Property} from '@/types/property'
import {resolvePhotoUrl} from '@/utils/api'

const PropertiesList: React.FC = () => {
    const {navigateTo, openDialog} = useAppShell()
    const dispatch = useAppDispatch()

    // Redux state
    const {properties, loading, error} = useAppSelector((state) => state.property)
    const {currentRoleMode, isAuthenticated, user} = useAppSelector((state) => state.auth)

    // Local state
    const [searchTerm, setSearchTerm] = useState('')
    
    // Role-based permissions - non-authenticated users are read-only
    const canManageProperties = isAuthenticated && (currentRoleMode === 'HomeOwner' || currentRoleMode === 'Manager')
    const isReadOnlyMode = !isAuthenticated || currentRoleMode === 'Tenant'

    // Fetch properties on component mount - use smart fetching logic
    useEffect(() => {
        if (isAuthenticated && user) {
            // Authenticated user: fetch their properties
            dispatch(fetchMyProperties())
        } else {
            // Non-authenticated user: fetch public properties
            dispatch(fetchPublicProperties())
        }
    }, [dispatch, isAuthenticated, user])

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
    const handleDeleteProperty = async (property: Property) => {
        const shouldDelete = await openDialog<boolean>((close) => (
            <ConfirmationDialog
                title="Delete Property"
                message={`Are you sure you want to delete "${property.name}"? This action cannot be undone and will remove all associated data.`}
                confirmLabel="Delete Property"
                cancelLabel="Cancel"
                onConfirm={() => close(true)}
                onCancel={() => close(false)}
                variant="destructive"
            />
        ))

        if (shouldDelete && property.propertyId) {
            try {
                const result = await dispatch(deleteProperty(property.propertyId))
                
                if (deleteProperty.fulfilled.match(result)) {
                    // Success: Show success message
                    await openDialog<void>((close) => (
                        <ConfirmationDialog
                            title="Property Deleted"
                            message={`"${property.name}" has been successfully deleted.`}
                            confirmLabel="OK"
                            onConfirm={() => close()}
                            onCancel={() => close()}
                            variant="success"
                        />
                    ))
                } else {
                    // Error: Show detailed error message
                    const errorMessage = result.payload as string || 'Unknown error occurred'
                    await openDialog<void>((close) => (
                        <ConfirmationDialog
                            title="Delete Failed"
                            message={`Failed to delete "${property.name}": ${errorMessage}`}
                            confirmLabel="OK"
                            onConfirm={() => close()}
                            onCancel={() => close()}
                            variant="destructive"
                        />
                    ))
                }
            } catch (error: any) {
                // Catch any unexpected errors
                await openDialog<void>((close) => (
                    <ConfirmationDialog
                        title="Delete Failed"
                        message={`An unexpected error occurred while deleting "${property.name}": ${error.message || 'Unknown error'}`}
                        confirmLabel="OK"
                        onConfirm={() => close()}
                        onCancel={() => close()}
                        variant="destructive"
                    />
                ))
            }
        }
    }

    // Handle property navigation
    const handleEditProperty = (property: Property, tab?: string) => {
        dispatch(setCurrentProperty(property))
        navigateTo('property-edit', {
            id: property.propertyId,
            ...(tab && {tab})
        })
    }

    const handleViewProperty = (property: Property) => {
        dispatch(setCurrentProperty(property))
        navigateTo('property-view', {id: property.propertyId})
    }

    const handleManageAvailability = (property: Property) => {
        dispatch(setCurrentProperty(property))
        navigateTo('availability', {propertyId: property.propertyId})
    }

    const renderPropertyCard = (property: Property) => (
        <Box
            key={property.propertyId}
            padding="0rem"
            paddingSm="1.5rem"
            backgroundColor="white"
            borderRadius="0px"
            borderRadiusSm="8px"
            boxShadow="0 0px 0px rgba(0,0,0,0)"
            boxShadowSm="0 0.1rem 0.5rem rgba(0,0,0,0.1)"
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
                    <IoIosPin size={48}/>
                </Box>
            )}

            {/* Property Info */}
            <Box marginBottom="1rem">
                <h3 style={{fontSize: '1.25rem', fontWeight: '600', margin: '0 0 0.5rem 0'}}>
                    {property.name}
                </h3>

                <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem" color="#666">
                    <IoIosPin/>
                    <span>{property.address?.city ? `${property.address.city}, ` : ''}{property.address?.countryOrRegion || 'Location not set'}</span>
                </Box>

                <Box display="flex" gap="1rem" marginBottom="1rem" color="#666" fontSize="0.875rem">
                    <Box display="flex" alignItems="center" gap="0.25rem">
                        <IoIosBed/>
                        <span>Max {property.maximumGuest} guests</span>
                    </Box>
                    <Box display="flex" alignItems="center" gap="0.25rem">
                        <IoIosWater/>
                        <span>{property.bathrooms} bathrooms</span>
                    </Box>
                </Box>

                {/* Pricing */}
                {property.pricing && (
                    <Box marginBottom="1rem">
            <span style={{fontSize: '1.125rem', fontWeight: '600', color: '#059669'}}>
              {property.pricing.currency} {Math.min(
                property.pricing.priceMonday,
                property.pricing.priceTuesday,
                property.pricing.priceWednesday,
                property.pricing.priceThursday,
                property.pricing.priceFriday,
                property.pricing.priceSaturday,
                property.pricing.priceSunday
              )}
            </span>
                        <span style={{fontSize: '0.875rem', color: '#666', marginLeft: '0.25rem'}}>
              from per night
            </span>
                    </Box>
                )}
            </Box>

            {/* Action Buttons */}
            <Box display="flex" gap="0.5rem" flexWrap={'wrap'}>
                <Button
                    label="View"
                    icon={<IoIosEye/>}
                    onClick={() => handleViewProperty(property)}
                    variant="normal"
                    size="small"
                />
                {canManageProperties && (
                    <>
                        <Button
                            label="Edit"
                            icon={<IoIosCreate/>}
                            onClick={() => handleEditProperty(property)}
                            variant="normal"
                            size="small"
                        />
                        <Button
                            label="Edit Photos"
                            icon={<IoIosCreate/>}
                            onClick={() => handleEditProperty(property, 'photos')}
                            variant="normal"
                            size="small"
                            style={{fontSize: '0.75rem'}}
                        />
                        <Button
                            label="Calendar"
                            icon={<IoIosCalendar/>}
                            onClick={() => handleManageAvailability(property)}
                            variant="normal"
                            size="small"
                        />
                        <Button
                            label=""
                            icon={<IoIosTrash/>}
                            onClick={() => handleDeleteProperty(property)}
                            variant="normal"
                            size="small"
                            style={{color: '#dc2626'}}
                        />
                    </>
                )}
            </Box>
        </Box>
    )

    if (loading) {
        return (
            <Box padding="2rem" maxWidth="1200px" margin="0 auto">
                <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                    <div>Loading properties...</div>
                </Box>
            </Box>
        )
    }

    return (
        <Box padding="2rem" maxWidth="1200px" margin="0 auto">
            {/* Header */}
            <Box display="flex" flexDirection={'column'} flexDirectionSm={'row'} justifyContent="space-between" gap={'1rem'} marginBottom="2rem">
                <Box>
                    <h1 style={{fontSize: '2rem', fontWeight: 'bold', margin: 0}}>
                        {!isAuthenticated ? 'Browse Properties' : (isReadOnlyMode ? 'Browse Properties' : 'My Properties')}
                    </h1>
                    <p style={{color: '#666', margin: '0.5rem 0 0 0'}}>
                        {!isAuthenticated 
                            ? 'Discover and explore available properties for your next stay'
                            : (isReadOnlyMode 
                                ? 'Discover and explore available properties for your next stay'
                                : 'Manage your property listings and track their performance')
                        }
                    </p>
                </Box>
                {canManageProperties && (
                    <Button
                        label="Add New Property"
                        icon={<IoIosAdd/>}
                        onClick={() => {
                            navigateTo('property-create', {})
                        }}
                        variant="promoted"
                    />
                )}
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
                backgroundColor="white"
                marginBottom="2rem"
            >
                <Box flex="1" minWidth="300px">
                    <Input
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
                    display="flex"
                    flexDirection={'column'}
                    alignItems={'center'}
                >
                    <Box color="#9ca3af" marginBottom="1rem">
                        <IoIosPin size={48}/>
                    </Box>
                    <h3 style={{margin: '0 0 1rem 0', color: '#4b5563'}}>
                        {properties.length === 0 ? 'No properties available' : 'No properties match your search'}
                    </h3>
                    <p style={{color: '#6b7280', marginBottom: '1.5rem'}}>
                        {properties.length === 0
                            ? (!isAuthenticated 
                                ? 'There are no properties available to browse at the moment'
                                : (isReadOnlyMode 
                                    ? 'There are no properties available to browse at the moment'
                                    : 'Start by adding your first property to begin managing your listings'))
                            : 'Try adjusting your search criteria'
                        }
                    </p>
                    {properties.length === 0 && canManageProperties && (
                        <Button
                            label="Add Your First Property"
                            icon={<IoIosAdd/>}
                            onClick={() => {
                                navigateTo('property-create', {})
                            }}
                            variant="promoted"
                        />
                    )}
                </Box>
            ) : (
                <Box
                    display="grid"
                    gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))"
                    gap="1.5rem"
                >
                    {filteredProperties.map(property => renderPropertyCard(property))}
                </Box>
            )}
        </Box>
    )
}

export default PropertiesList