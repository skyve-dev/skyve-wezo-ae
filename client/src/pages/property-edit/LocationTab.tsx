import React from 'react'
import { Box } from '@/components'
import Input from '@/components/base/Input.tsx'
import NumberStepperInput from '@/components/base/NumberStepperInput.tsx'
import { WizardFormData } from '@/types/property'

interface LocationTabProps {
    formData: Partial<WizardFormData>
    updateFormData: (updates: Partial<WizardFormData>) => void
}

const LocationTab: React.FC<LocationTabProps> = ({ formData, updateFormData }) => {
    return (
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
                            zipCode: formData.address?.zipCode || 0,
                            apartmentOrFloorNumber: formData.address?.apartmentOrFloorNumber,
                            latLong: formData.address?.latLong
                        }
                    })}
                    placeholder="Enter country or region"
                    width="100%"
                />

                <Input
                    label="City"
                    value={formData.address?.city || ''}
                    onChange={(e) => updateFormData({
                        address: {
                            countryOrRegion: formData.address?.countryOrRegion || 'UAE',
                            city: e.target.value,
                            zipCode: formData.address?.zipCode || 0,
                            apartmentOrFloorNumber: formData.address?.apartmentOrFloorNumber,
                            latLong: formData.address?.latLong
                        }
                    })}
                    placeholder="Enter city name"
                    width="100%"
                />

                <Input
                    label="Apartment/Floor Number (Optional)"
                    value={formData.address?.apartmentOrFloorNumber || ''}
                    onChange={(e) => updateFormData({
                        address: {
                            countryOrRegion: formData.address?.countryOrRegion || 'UAE',
                            city: formData.address?.city || '',
                            zipCode: formData.address?.zipCode || 0,
                            apartmentOrFloorNumber: e.target.value,
                            latLong: formData.address?.latLong
                        }
                    })}
                    placeholder="e.g., Apt 5B, Floor 12"
                    width="100%"
                />

                <NumberStepperInput
                    label="Zip Code"
                    value={formData.address?.zipCode || 0}
                    onChange={(value) => updateFormData({
                        address: {
                            countryOrRegion: formData.address?.countryOrRegion || 'UAE',
                            city: formData.address?.city || '',
                            zipCode: value,
                            apartmentOrFloorNumber: formData.address?.apartmentOrFloorNumber,
                            latLong: formData.address?.latLong
                        }
                    })}
                    placeholder="Enter zip code"
                    min={0}
                    max={999999}
                    format="integer"
                    width="100%"
                />

                <Box>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                        GPS Coordinates (Optional)
                    </label>
                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem">
                        <NumberStepperInput
                            label="Latitude"
                            value={formData.address?.latLong?.latitude || 0}
                            onChange={(value) => updateFormData({
                                address: {
                                    countryOrRegion: formData.address?.countryOrRegion || 'UAE',
                                    city: formData.address?.city || '',
                                    zipCode: formData.address?.zipCode || 0,
                                    apartmentOrFloorNumber: formData.address?.apartmentOrFloorNumber,
                                    latLong: {
                                        latitude: value,
                                        longitude: formData.address?.latLong?.longitude || 0
                                    }
                                }
                            })}
                            placeholder="25.276987"
                            min={-90}
                            max={90}
                            format="decimal"
                            step={0.000001}
                            width="100%"
                        />
                        <NumberStepperInput
                            label="Longitude"
                            value={formData.address?.latLong?.longitude || 0}
                            onChange={(value) => updateFormData({
                                address: {
                                    countryOrRegion: formData.address?.countryOrRegion || 'UAE',
                                    city: formData.address?.city || '',
                                    zipCode: formData.address?.zipCode || 0,
                                    apartmentOrFloorNumber: formData.address?.apartmentOrFloorNumber,
                                    latLong: {
                                        latitude: formData.address?.latLong?.latitude || 0,
                                        longitude: value
                                    }
                                }
                            })}
                            placeholder="55.296249"
                            min={-180}
                            max={180}
                            format="decimal"
                            step={0.000001}
                            width="100%"
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
                        📍 Location Tips
                    </h4>
                    <ul style={{
                        margin: 0,
                        paddingLeft: '1rem',
                        fontSize: '0.875rem',
                        color: '#0c4a6e',
                        lineHeight: '1.5'
                    }}>
                        <li>GPS coordinates help guests find your property easily</li>
                        <li>Use mobile-friendly stepper controls for precise coordinates</li>
                        <li>Apartment/floor details improve guest experience</li>
                        <li>Dubai coordinates example: 25.276987, 55.296249</li>
                    </ul>
                </Box>
            </Box>
        </Box>
    )
}

export default LocationTab