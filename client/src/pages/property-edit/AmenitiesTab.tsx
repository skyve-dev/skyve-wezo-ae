import React, {useRef, useState} from 'react'
import {Box} from '@/components'
import {ValidationErrors, WizardFormData} from '@/types/property'
import Button from '@/components/base/Button'
import SlidingDrawer from '@/components/base/SlidingDrawer'
import SelectionPicker from '@/components/base/SelectionPicker'
import useDrawerManager from '@/hooks/useDrawerManager'
import {AVAILABLE_AMENITIES, getAmenitiesByCategory} from '@/constants/amenities'
import {FaCheck, FaCheckCircle, FaPlus, FaStar, FaTimes} from 'react-icons/fa'

interface AmenitiesTabProps {
    formData: Partial<WizardFormData>
    updateFormData: (updates: Partial<WizardFormData>) => void
    validationErrors?: ValidationErrors | null
}

const AmenitiesTab: React.FC<AmenitiesTabProps> = ({ formData, updateFormData, validationErrors: _validationErrors }) => {
    const drawerManager = useDrawerManager()
    const drawerId = useRef(`amenities-drawer-${Math.random().toString(36).substr(2, 9)}`).current
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [tempSelectedAmenities, setTempSelectedAmenities] = useState<string[]>([])
    
    const amenitiesByCategory = getAmenitiesByCategory()
    const categories = Object.keys(amenitiesByCategory).sort()
    
    // Get currently selected amenity IDs by matching names
    const currentAmenityIds = formData.amenities?.map(amenity => {
        const found = AVAILABLE_AMENITIES.find(a => a.name === amenity.name)
        return found ? found.id : null
    }).filter(Boolean) as string[] || []
    
    // Open amenity selection drawer
    const handleAddAmenities = () => {
        setTempSelectedAmenities(currentAmenityIds)
        setSelectedCategory(categories[0] || '')
        drawerManager.openDrawer(drawerId)
    }
    
    // Handle amenity selection change
    const handleAmenitySelectionChange = (selectedIds: string | number | (string | number)[]) => {
        const ids = Array.isArray(selectedIds) ? selectedIds as string[] : []
        setTempSelectedAmenities(ids)
    }
    
    // Save selected amenities
    const handleSaveAmenities = () => {
        const selectedAmenities = AVAILABLE_AMENITIES.filter(amenity => 
            tempSelectedAmenities.includes(amenity.id)
        ).map(amenity => ({
            name: amenity.name,
            category: amenity.category
        }))
        
        updateFormData({ amenities: selectedAmenities })
        drawerManager.closeDrawer(drawerId)
    }
    
    // Cancel amenity selection
    const handleCancel = () => {
        setTempSelectedAmenities([])
        setSelectedCategory('')
        drawerManager.closeDrawer(drawerId)
    }
    return (
        <Box paddingX={'1.5rem'} paddingY={'1.5rem'}>
            <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1.5rem">
                <FaStar style={{color: '#374151', fontSize: '1.25rem'}} />
                <h3 style={{margin: 0, fontSize: '1.5rem', fontWeight: '600'}}>
                    Property Amenities
                </h3>
            </Box>
            <p style={{color: '#666', marginBottom: '1.5rem'}}>
                Select amenities that your property offers. These help guests find your property in search results.
            </p>

            <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="1rem">
                    <label style={{fontWeight: '500', fontSize: '1rem'}}>
                        Selected Amenities ({formData.amenities?.length || 0})
                    </label>
                    <Button
                        label="Add Amenities"
                        icon={<FaPlus />}
                        onClick={handleAddAmenities}
                        variant="promoted"
                        size="small"
                    />
                </Box>

                {formData.amenities && formData.amenities.length > 0 ? (
                    <Box display="flex" flexWrap="wrap" gap="0.5rem" marginBottom="2rem">
                        {formData.amenities.map((amenity, index) => (
                            <Box
                                key={index}
                                display="inline-flex"
                                alignItems="center"
                                gap="0.5rem"
                                padding="0.5rem 1rem"
                                backgroundColor="#3b82f6"
                                color="white"
                                borderRadius="1.5rem"
                                fontSize="0.875rem"
                                fontWeight="500"
                            >
                                <span>{amenity.name}</span>
                                <Box
                                    as="button"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    width="1.2rem"
                                    height="1.2rem"
                                    backgroundColor="rgba(255,255,255,0.2)"
                                    border="none"
                                    borderRadius="50%"
                                    color="white"
                                    cursor="pointer"
                                    fontSize="0.75rem"
                                    onClick={() => {
                                        const currentAmenities = formData.amenities ? [...formData.amenities] : []
                                        const updatedAmenities = currentAmenities.filter((_, i) => i !== index)
                                        updateFormData({ amenities: updatedAmenities })
                                    }}
                                    style={{
                                        minWidth: '1.2rem',
                                        minHeight: '1.2rem'
                                    }}
                                >
                                    <FaTimes />
                                </Box>
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <Box
                        padding="2rem"
                        textAlign="center"
                        border="2px dashed #d1d5db"
                        borderRadius="8px"
                        color="#666"
                        marginBottom="2rem"
                    >
                        <p style={{margin: '0 0 1rem 0', fontSize: '1rem'}}>
                            No amenities selected yet
                        </p>
                        <p style={{margin: 0, fontSize: '0.875rem'}}>
                            Tap "Add Amenities" to choose from over 80 popular amenities
                        </p>
                    </Box>
                )}

            </Box>

            {/* Amenity Selection Drawer */}
            <SlidingDrawer
                isOpen={drawerManager.isDrawerOpen(drawerId)}
                onClose={handleCancel}
                side="bottom"
                height="100%"
                zIndex={drawerManager.getDrawerZIndex(drawerId)}
                contentStyles={{
                    maxWidth: 600,
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    borderTopLeftRadius: '0rem',
                    borderTopRightRadius: '0rem'
                }}
                showCloseButton
            >
                <Box padding="1.5rem" display="flex" flexDirection="column" height="100%" overflow="hidden">
                    {/* Header */}
                    <Box marginBottom="1rem">
                        <Box fontSize="1.25rem" fontWeight="600" marginBottom="0.5rem" textAlign="center" color="#1a202c">
                            Select Amenities
                        </Box>
                        <Box fontSize="0.875rem" color="#6b7280" textAlign="center">
                            Choose all amenities your property offers
                        </Box>
                    </Box>

                    {/* Category Tabs */}
                    <Box display="flex" gap="0.5rem" flexWrap={'wrap'} marginBottom="1rem" overflowX="auto" paddingBottom="0.5rem">
                        {categories.map((category) => (
                            <Button
                                key={category}
                                label={category}
                                variant={selectedCategory === category ? "promoted" : "normal"}
                                size="small"
                                onClick={() => setSelectedCategory(category)}
                                style={{
                                    minWidth: 'max-content',
                                    whiteSpace: 'nowrap',
                                    fontSize: '0.75rem'
                                }}
                            />
                        ))}
                    </Box>

                    {/* Amenities List */}
                    <Box flex="1" overflow="auto" marginBottom="1rem">
                        {selectedCategory && amenitiesByCategory[selectedCategory] && (
                            <SelectionPicker
                                data={amenitiesByCategory[selectedCategory]}
                                idAccessor={(item) => item.id}
                                value={tempSelectedAmenities}
                                onChange={handleAmenitySelectionChange}
                                isMultiSelect={true}
                                itemStyles={{paddingTop:'0.25rem',paddingBottom:'0.25rem'}}
                                renderItem={(amenity, isSelected) => (
                                    <Box display="flex" alignItems="center" gap="0.75rem" width="100%">
                                        <Box
                                            display="inline-flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            width="1.25rem"
                                            height="1.25rem"
                                            border={`2px solid ${isSelected ? '#3182ce' : '#d1d5db'}`}
                                            borderRadius="0.25rem"
                                            backgroundColor={isSelected ? '#3182ce' : 'transparent'}
                                            transition="all 0.2s"
                                        >
                                            {isSelected && (
                                                <FaCheckCircle style={{color: 'white', fontSize: '0.75rem'}} />
                                            )}
                                        </Box>
                                        <Box fontSize="1.5rem">{amenity.icon}</Box>
                                        <Box flex="1">
                                            <Box fontWeight="500" fontSize="1rem">{amenity.name}</Box>
                                        </Box>
                                    </Box>
                                )}
                                containerStyles={{
                                    gap: '0.5rem'
                                }}
                            />
                        )}
                    </Box>

                    {/* Action Buttons */}
                    <Box display="flex" gap="1rem" paddingTop="1rem" borderTop="1px solid #e5e7eb">
                        <Button
                            label="Cancel"
                            variant="normal"
                            onClick={handleCancel}
                            style={{ flex: 1 }}
                        />
                        <Button
                            label={`Save (${tempSelectedAmenities.length} selected)`}
                            icon={<FaCheck />}
                            variant="promoted"
                            onClick={handleSaveAmenities}
                            style={{ flex: 1 }}
                        />
                    </Box>
                </Box>
            </SlidingDrawer>
        </Box>
    )
}

export default AmenitiesTab