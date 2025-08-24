import React from 'react'
import { Box } from '@/components'
import { WizardFormData } from '@/types/property'

interface AmenitiesTabProps {
    formData: Partial<WizardFormData>
    updateFormData: (updates: Partial<WizardFormData>) => void
}

const AmenitiesTab: React.FC<AmenitiesTabProps> = ({ formData, updateFormData }) => {
    return (
        <Box>
            <h3 style={{marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600'}}>
                Property Amenities
            </h3>
            <p style={{color: '#666', marginBottom: '2rem'}}>
                Tap amenities to toggle them. These help guests find your property in search results.
            </p>

            <Box>
                <label style={{display: 'block', marginBottom: '1rem', fontWeight: '500'}}>
                    Selected Amenities ({formData.amenities?.length || 0})
                </label>

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
                                        // Create a new array to avoid mutating Redux state
                                        const currentAmenities = formData.amenities ? [...formData.amenities] : []
                                        const updatedAmenities = currentAmenities.filter((_, i) => i !== index)
                                        updateFormData({ amenities: updatedAmenities })
                                    }}
                                    style={{
                                        minWidth: '1.2rem',
                                        minHeight: '1.2rem'
                                    }}
                                >
                                    ×
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
                        <p style={{margin: 0}}>
                            No amenities selected. Amenities can be configured in the property creation wizard.
                        </p>
                    </Box>
                )}

                <Box
                    padding="1rem"
                    backgroundColor="#f8fafc"
                    borderRadius="0.5rem"
                    border="1px solid #e2e8f0"
                >
                    <p style={{
                        margin: 0,
                        fontSize: '0.875rem',
                        color: '#64748b',
                        fontStyle: 'italic'
                    }}>
                        📱 Mobile-optimized: Amenities are managed through tap-friendly selection screens in the property wizard. 
                        Here you can only remove existing amenities by tapping the × button on each tag.
                    </p>
                </Box>
            </Box>
        </Box>
    )
}

export default AmenitiesTab