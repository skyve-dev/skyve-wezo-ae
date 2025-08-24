import React from 'react'
import { Box } from '@/components'
import { FaMapMarkerAlt, FaGlobe, FaBuilding, FaMapPin } from 'react-icons/fa'
import Input from '@/components/base/Input.tsx'
import NumberStepperInput from '@/components/base/NumberStepperInput.tsx'
import { WizardFormData, ValidationErrors } from '@/types/property'

interface LocationTabProps {
    formData: Partial<WizardFormData>
    updateFormData: (updates: Partial<WizardFormData>) => void
    validationErrors?: ValidationErrors | null
}

const LocationTab: React.FC<LocationTabProps> = ({ formData, updateFormData, validationErrors }) => {
    return (
        <Box>
            <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1.5rem">
                <FaMapMarkerAlt style={{color: '#374151', fontSize: '1.25rem'}} />
                <h3 style={{margin: 0, fontSize: '1.5rem', fontWeight: '600'}}>
                    Property Location
                </h3>
            </Box>
            <Box display="grid" gap="1.5rem">
                <Input
                    label="Country/Region"
                    icon={FaGlobe}
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
                    icon={FaBuilding}
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
                    error={!!validationErrors?.city}
                    helperText={validationErrors?.city}
                />

                <Input
                    label="Apartment/Floor Number (Optional)"
                    icon={FaBuilding}
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
                    icon={FaMapPin}
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
                    error={!!validationErrors?.zipCode}
                    helperText={validationErrors?.zipCode}
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
                    <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
                        <FaMapMarkerAlt style={{color: '#0369a1', fontSize: '0.875rem'}} />
                        <h4 style={{margin: 0, color: '#0369a1', fontSize: '0.875rem', fontWeight: '600'}}>
                            Location Tips
                        </h4>
                    </Box>
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