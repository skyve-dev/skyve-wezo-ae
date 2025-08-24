import React, { useState } from 'react'
import { Box } from '@/components'
import Input from '@/components/base/Input.tsx'
import Button from '@/components/base/Button.tsx'
import { WizardFormData } from '@/types/property'
import { ParkingType, ParkingTypeLabels } from '@/constants/propertyEnums'
import { FaPlus, FaTrash } from 'react-icons/fa'
import MobileSelect from './MobileSelect'

interface ServicesTabProps {
    formData: Partial<WizardFormData>
    updateFormData: (updates: Partial<WizardFormData>) => void
}

const ServicesTab: React.FC<ServicesTabProps> = ({ formData, updateFormData }) => {
    const [newLanguage, setNewLanguage] = useState('')

    const addLanguage = () => {
        if (newLanguage.trim() && !formData.languages?.includes(newLanguage.trim())) {
            // Create a new array to avoid mutating Redux state
            const currentLanguages = formData.languages ? [...formData.languages] : []
            const updatedLanguages = [...currentLanguages, newLanguage.trim()]
            updateFormData({ languages: updatedLanguages })
            setNewLanguage('')
        }
    }

    const removeLanguage = (languageToRemove: string) => {
        // Create a new array to avoid mutating Redux state
        const currentLanguages = formData.languages ? [...formData.languages] : []
        const updatedLanguages = currentLanguages.filter(lang => lang !== languageToRemove)
        updateFormData({ languages: updatedLanguages })
    }

    return (
        <Box>
            <h3 style={{marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600'}}>
                Services & Amenities
            </h3>
            
            <Box display="grid" gap="1.5rem">
                {/* Breakfast Service */}
                <Box>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                        Breakfast Service
                    </label>
                    <Box display="flex" gap="1rem">
                        <Box
                            as="button"
                            onClick={() => updateFormData({ serveBreakfast: true })}
                            padding="0.75rem 1.5rem"
                            border={formData.serveBreakfast ? '2px solid #3b82f6' : '1px solid #d1d5db'}
                            backgroundColor={formData.serveBreakfast ? '#eff6ff' : 'white'}
                            borderRadius="0.5rem"
                            cursor="pointer"
                            fontWeight={formData.serveBreakfast ? '600' : '400'}
                            color={formData.serveBreakfast ? '#1d4ed8' : '#374151'}
                        >
                            Yes, we serve breakfast
                        </Box>
                        <Box
                            as="button"
                            onClick={() => updateFormData({ serveBreakfast: false })}
                            padding="0.75rem 1.5rem"
                            border={!formData.serveBreakfast ? '2px solid #3b82f6' : '1px solid #d1d5db'}
                            backgroundColor={!formData.serveBreakfast ? '#eff6ff' : 'white'}
                            borderRadius="0.5rem"
                            cursor="pointer"
                            fontWeight={!formData.serveBreakfast ? '600' : '400'}
                            color={!formData.serveBreakfast ? '#1d4ed8' : '#374151'}
                        >
                            No breakfast service
                        </Box>
                    </Box>
                </Box>

                {/* Parking */}
                <MobileSelect<ParkingType>
                    label="Parking Availability"
                    value={formData.parking || ParkingType.No}
                    options={Object.values(ParkingType).map(type => ({
                        value: type,
                        label: ParkingTypeLabels[type]
                    }))}
                    onChange={(value) => updateFormData({parking: value})}
                    placeholder="Select parking option"
                    helperText="Choose the parking option that best describes your property"
                />

                {/* Languages */}
                <Box>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                        Languages Spoken ({formData.languages?.length || 0})
                    </label>
                    
                    {/* Current Languages */}
                    {formData.languages && formData.languages.length > 0 && (
                        <Box display="flex" flexWrap="wrap" gap="0.5rem" marginBottom="1rem">
                            {formData.languages.map((language, index) => (
                                <Box
                                    key={index}
                                    display="inline-flex"
                                    alignItems="center"
                                    gap="0.5rem"
                                    padding="0.5rem 1rem"
                                    backgroundColor="#10b981"
                                    color="white"
                                    borderRadius="1.5rem"
                                    fontSize="0.875rem"
                                    fontWeight="500"
                                >
                                    <span>{language}</span>
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
                                        onClick={() => removeLanguage(language)}
                                    >
                                        <FaTrash size={10} />
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    )}

                    {/* Add New Language */}
                    <Box display="flex" gap="0.5rem" alignItems="flex-end">
                        <Input
                            label="Add Language"
                            value={newLanguage}
                            onChange={(e) => setNewLanguage(e.target.value)}
                            placeholder="e.g., English, Arabic, Hindi"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    addLanguage()
                                }
                            }}
                            width="70%"
                        />
                        <Button
                            label=""
                            icon={<FaPlus />}
                            onClick={addLanguage}
                            variant="promoted"
                            disabled={!newLanguage.trim()}
                            style={{ marginBottom: '0.125rem' }}
                        />
                    </Box>
                </Box>

                <Box
                    padding="1rem"
                    backgroundColor="#f0f9ff"
                    borderRadius="0.5rem"
                    border="1px solid #bae6fd"
                >
                    <h4 style={{margin: '0 0 0.5rem 0', color: '#0369a1', fontSize: '0.875rem', fontWeight: '600'}}>
                        🛎️ Services Tips
                    </h4>
                    <ul style={{
                        margin: 0,
                        paddingLeft: '1rem',
                        fontSize: '0.875rem',
                        color: '#0c4a6e',
                        lineHeight: '1.5'
                    }}>
                        <li>Breakfast service can increase bookings and revenue</li>
                        <li>Free parking is a major advantage in UAE cities</li>
                        <li>Multiple languages help international guests feel welcome</li>
                        <li>Tap language tags to remove them easily</li>
                    </ul>
                </Box>
            </Box>
        </Box>
    )
}

export default ServicesTab