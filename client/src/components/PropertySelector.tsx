import React, {useEffect, useState} from 'react'
import {FaBath, FaBed, FaBuilding, FaChevronDown, FaMapMarkerAlt} from 'react-icons/fa'
import {Box} from './base/Box'
import Button from './base/Button'
import SlidingDrawer from './base/SlidingDrawer'
import SelectionPicker from './base/SelectionPicker'
import {useAppDispatch, useAppSelector} from '@/store'
import {fetchMyProperties, setCurrentProperty} from '@/store/slices/propertySlice'
import {Property} from '@/types/property'
import {resolvePhotoUrl} from '@/utils/api'

interface PropertySelectorProps {
  /**
   * Optional callback when property selection changes
   */
  onPropertyChange?: (property: Property | null) => void
  
  /**
   * Optional custom button label when no property selected
   */
  placeholder?: string
  
  /**
   * Optional custom button variant
   */
  buttonVariant?: 'normal' | 'promoted' | 'plain'
  
  /**
   * Optional button size
   */
  buttonSize?: 'small' | 'medium' | 'large'
  
  /**
   * Optional flag to show property details in button
   */
  showDetails?: boolean
  
  /**
   * Optional label text above the selector
   */
  label?: string
  
  /**
   * Optional flag to show selected property status
   */
  showSelectedStatus?: boolean
}

const PropertySelector: React.FC<PropertySelectorProps> = ({
  onPropertyChange,
  placeholder = 'Choose a property to manage availability',
  buttonSize = 'medium',
  showDetails = true,
  label = 'Select Property',
  showSelectedStatus = true
}) => {
  const dispatch = useAppDispatch()
  const { properties, currentProperty, loading } = useAppSelector((state) => state.property)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  // Fetch properties on mount
  useEffect(() => {
    if (properties.length === 0) {
      dispatch(fetchMyProperties())
    }
  }, [dispatch, properties.length])

  // Handle property selection
  const handlePropertySelect = (value: string | number | (string | number)[]) => {
    const selectedId = value as string
    const selectedProperty = properties.find(p => p.propertyId === selectedId) || null
    

    

    dispatch(setCurrentProperty(selectedProperty))
    
    // Call callback if provided
    if (onPropertyChange) {

      onPropertyChange(selectedProperty)
    }
    
    // Close drawer
    setIsDrawerOpen(false)
  }
  
  // Custom render for property items in SelectionPicker
  const renderPropertyItem = (property: Property, isSelected: boolean) => {
    const photoUrl = property.photos?.[0] ? resolvePhotoUrl(property.photos[0].url) : null
    
    return (
      <Box
        display="flex"
        gap="1rem"
        padding="1rem"
        backgroundColor={isSelected ? '#f3f4f6' : 'transparent'}
        borderRadius="8px"
        cursor="pointer"
        transition="all 0.2s"
        whileHover={{ backgroundColor: '#f9fafb' }}
      >
        {/* Property Image */}
        {photoUrl ? (
          <Box
            width="80px"
            height="80px"
            borderRadius="6px"
            overflow="hidden"
            flexShrink="0"
          >
            <img
              src={photoUrl}
              alt={property.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </Box>
        ) : (
          <Box
            width="80px"
            height="80px"
            borderRadius="6px"
            backgroundColor="#e5e7eb"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink="0"
          >
            <FaBuilding size={24} color="#9ca3af" />
          </Box>
        )}
        
        {/* Property Details */}
        <Box flex="1">
          <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.25rem">
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              margin: 0
            }}>
              {property.name}
            </h3>
            {isSelected && (
              <Box
                padding="0.125rem 0.5rem"
                backgroundColor="#059669"
                color="white"
                borderRadius="4px"
                fontSize="0.75rem"
                fontWeight="600"
              >
                SELECTED
              </Box>
            )}
          </Box>
          
          <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
            <FaMapMarkerAlt size={12} color="#6b7280" />
            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              {property.address?.city || 'No location'}
            </span>
          </Box>
          
          <Box display="flex" gap="1rem">
            {property.maximumGuest && (
              <Box display="flex" alignItems="center" gap="0.25rem">
                <FaBed size={12} color="#6b7280" />
                <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                  {property.maximumGuest} guests
                </span>
              </Box>
            )}
            {property.bathrooms && (
              <Box display="flex" alignItems="center" gap="0.25rem">
                <FaBath size={12} color="#6b7280" />
                <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                  {property.bathrooms} bath
                </span>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    )
  }
  
  // Button content
  const buttonContent = () => {
    if (currentProperty && showDetails) {
      return (
        <Box display="flex" alignItems="center" gap="0.5rem">
          <FaBuilding />
          <span>{currentProperty.name}</span>
          <FaChevronDown style={{ marginLeft: 'auto' }} />
        </Box>
      )
    }
    
    return (
      <Box display="flex" alignItems="center" gap="0.5rem">
        <FaBuilding />
        <span>{currentProperty ? currentProperty.name : placeholder}</span>
        <FaChevronDown />
      </Box>
    )
  }
  
  return (
    <Box>
      {/* Label */}
      {label && (
        <Box marginBottom="0.5rem">
          <label style={{ fontWeight: '500', fontSize: '0.875rem', color: '#374151' }}>
            {label}
          </label>
        </Box>
      )}
      
      {/* Selected Status Display */}
      {showSelectedStatus && currentProperty && (
        <Box 
          marginBottom="0.75rem" 
          padding="0.5rem 0.75rem" 
          backgroundColor="#f0f9ff" 
          borderRadius="0.375rem"
          border="1px solid #e0f2fe"
        >
          <Box display="flex" alignItems="center" gap="0.5rem">
            <FaBuilding style={{ color: '#0369a1', fontSize: '0.875rem' }} />
            <span style={{ color: '#0369a1', fontSize: '0.875rem', fontWeight: '500' }}>
              Working with property: {currentProperty.name}
            </span>
            {currentProperty.address?.city && (
              <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                • {currentProperty.address.city}{currentProperty.address.countryOrRegion ? `, ${currentProperty.address.countryOrRegion}` : ''}
              </span>
            )}
          </Box>
        </Box>
      )}
      
      {/* Trigger Button */}
      <Button
        onClick={() => setIsDrawerOpen(true)}
        variant={'plain'}
        size={buttonSize}
        style={{
          minWidth: '200px',
          justifyContent: 'space-between'
        }}
      >
        {buttonContent()}
      </Button>
      
      {/* Property Selection Drawer */}
      <SlidingDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        side="bottom"
        height={window.innerWidth < 768 ? "70vh" : "60vh"}
        showCloseButton={true}
        backgroundColor="white"
        contentStyles={{
          borderRadius: '1rem 1rem 0 0',
          overflow: 'hidden'
        }}
      >
        <Box padding="1.5rem" height="100%" display="flex" flexDirection="column">
          {/* Header */}
          <Box marginBottom="1.5rem">
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              Select Property
            </h2>
            <p style={{
              color: '#6b7280',
              fontSize: '0.875rem'
            }}>
              Choose a property to work with
            </p>
          </Box>
          
          {/* Property List */}
          <Box flex="1" overflow="auto">
            {loading ? (
              <Box display="flex" justifyContent="center" padding="2rem">
                <span style={{ color: '#6b7280' }}>Loading properties...</span>
              </Box>
            ) : properties.length === 0 ? (
              <Box 
                textAlign="center" 
                padding="2rem"
                backgroundColor="#f9fafb"
                borderRadius="8px"
              >
                <FaBuilding size={48} color="#d1d5db" style={{ marginBottom: '1rem' }} />
                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                  No properties found
                </p>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                  Add your first property to get started
                </p>
              </Box>
            ) : (
              <SelectionPicker
                data={properties}
                idAccessor={(property) => property.propertyId!}
                value={currentProperty?.propertyId || null}
                onChange={handlePropertySelect}
                isMultiSelect={false}
                renderItem={renderPropertyItem}
                containerStyles={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              />
            )}
          </Box>
        </Box>
      </SlidingDrawer>
    </Box>
  )
}

export default PropertySelector