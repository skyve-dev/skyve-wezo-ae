import React, {useEffect, useState} from 'react'
import {Box} from '@/components'
import {FaBuilding, FaGlobe, FaLocationArrow, FaMapMarkerAlt, FaMapPin, FaSearchLocation} from 'react-icons/fa'
import Input from '@/components/base/Input.tsx'
import Button from '@/components/base/Button.tsx'
import {ValidationErrors, WizardFormData} from '@/types/property'
import {MapContainer, Marker, TileLayer, useMapEvents} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface LocationTabProps {
    formData: Partial<WizardFormData>
    updateFormData: (updates: Partial<WizardFormData>) => void
    validationErrors?: ValidationErrors | null
}

// Fix Leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Map click handler component
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click: (e) => {
            onLocationSelect(e.latlng.lat, e.latlng.lng)
        },
    })
    return null
}

const LocationTab: React.FC<LocationTabProps> = ({ formData, updateFormData, validationErrors }) => {
    const [searchAddress, setSearchAddress] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [locationDetected, setLocationDetected] = useState(false)
    const [isDetectingLocation, setIsDetectingLocation] = useState(false)
    
    // Default center (Dubai, UAE)
    const defaultCenter: [number, number] = [25.276987, 55.296249]
    
    // Current marker position - check if coordinates are set (not 0,0)
    const hasValidCoordinates = formData.address?.latLong?.latitude && 
                               formData.address?.latLong?.longitude &&
                               !(formData.address.latLong.latitude === 0 && formData.address.latLong.longitude === 0)
    
    const markerPosition: [number, number] = hasValidCoordinates ? [
        formData.address!.latLong!.latitude,
        formData.address!.latLong!.longitude
    ] : defaultCenter

    // Detect user's current location
    const detectCurrentLocation = (forceDetection = false) => {
        setIsDetectingLocation(true)
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude
                    const lng = position.coords.longitude
                    
                    // Set location if coordinates aren't already set or if forced
                    if (!hasValidCoordinates || forceDetection) {
                        handleMapClick(lat, lng)
                        setLocationDetected(true)
                    }
                    setIsDetectingLocation(false)
                },
                (error) => {
                    console.warn('Geolocation error:', error)
                    // If geolocation fails and no coordinates are set, use UAE default
                    if (!hasValidCoordinates || forceDetection) {
                        handleMapClick(defaultCenter[0], defaultCenter[1])
                    }
                    setIsDetectingLocation(false)
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            )
        } else {
            // Geolocation not supported, use UAE default
            if (!hasValidCoordinates || forceDetection) {
                handleMapClick(defaultCenter[0], defaultCenter[1])
            }
            setIsDetectingLocation(false)
        }
    }

    // Auto-detect location for new properties
    useEffect(() => {
        // Only auto-detect if this appears to be a new property (no valid coordinates set)
        if (!hasValidCoordinates && !locationDetected) {
            detectCurrentLocation()
        }
    }, []) // Run once on mount

    // Handle map click to set coordinates
    const handleMapClick = (lat: number, lng: number) => {
        updateFormData({
            address: {
                countryOrRegion: formData.address?.countryOrRegion || 'UAE',
                city: formData.address?.city || '',
                zipCode: formData.address?.zipCode || 0,
                apartmentOrFloorNumber: formData.address?.apartmentOrFloorNumber,
                latLong: {
                    latitude: lat,
                    longitude: lng
                }
            }
        })
    }

    // Search for address using Nominatim (OpenStreetMap's geocoding service)
    const handleSearchAddress = async () => {
        if (!searchAddress.trim()) return
        
        setIsSearching(true)
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchAddress)}&format=json&limit=1&addressdetails=1`
            )
            const data = await response.json()
            
            if (data && data.length > 0) {
                const result = data[0]
                const lat = parseFloat(result.lat)
                const lng = parseFloat(result.lon)
                
                // Update coordinates
                handleMapClick(lat, lng)
                
                // Update address fields if available
                const address = result.address || {}
                updateFormData({
                    address: {
                        countryOrRegion: address.country || formData.address?.countryOrRegion || 'UAE',
                        city: address.city || address.town || address.village || formData.address?.city || '',
                        zipCode: address.postcode ? parseInt(address.postcode, 10) : formData.address?.zipCode || 0,
                        apartmentOrFloorNumber: formData.address?.apartmentOrFloorNumber,
                        latLong: { latitude: lat, longitude: lng }
                    }
                })
            }
        } catch (error) {
            console.error('Geocoding error:', error)
        } finally {
            setIsSearching(false)
        }
    }

    return (
        <Box paddingX={'1.5rem'}>
            <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1.5rem">
                <FaMapMarkerAlt style={{color: '#374151', fontSize: '1.25rem'}} />
                <h3 style={{margin: 0, fontSize: '1.5rem', fontWeight: '600'}}>
                    Property Location
                </h3>
            </Box>
            <Box display="grid" gap="2.5rem">
                {/* Address Search */}
                <Box>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                        <Box display="flex" alignItems="center" gap="0.5rem">
                            <FaSearchLocation style={{color: '#374151', fontSize: '0.875rem'}} />
                            Search Address
                        </Box>
                    </label>
                    <Box display="flex" gap="0.5rem" alignItems="flex-end">
                        <Input
                            label=""
                            value={searchAddress}
                            onChange={(e) => setSearchAddress(e.target.value)}
                            placeholder="Enter address to search on map"
                            fullWidth={true}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleSearchAddress()
                                }
                            }}
                        />
                        <Button
                            label=""
                            icon={<FaSearchLocation />}
                            onClick={handleSearchAddress}
                            variant="promoted"
                            disabled={!searchAddress.trim() || isSearching}
                            style={{ marginBottom: '0.125rem' }}
                        />
                    </Box>
                    <Box marginTop="0.5rem" >
                        <Button
                            label={isDetectingLocation ? "Detecting Location..." : "Use My Current Location"}
                            icon={<FaLocationArrow />}
                            onClick={() => detectCurrentLocation(true)}
                            variant="normal"
                            size="small"
                            disabled={isDetectingLocation}
                            fullWidth={true}
                            style={{ fontSize: '0.875rem',maxWidth:500 }}
                        />
                    </Box>
                </Box>

                {/* Interactive Map */}
                <Box>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                        <Box display="flex" alignItems="center" gap="0.5rem">
                            <FaMapPin style={{color: '#374151', fontSize: '0.875rem'}} />
                            Property Location on Map
                        </Box>
                    </label>
                    <Box
                        height="400px"
                        border="1px solid #d1d5db"
                        borderRadius="0.5rem"
                        overflow="hidden"
                    >
                        <MapContainer
                            center={markerPosition}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                            key={`${markerPosition[0]}-${markerPosition[1]}`} // Force re-render when position changes
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={markerPosition} />
                            <MapClickHandler onLocationSelect={handleMapClick} />
                        </MapContainer>
                    </Box>
                    <Box
                        marginTop="0.5rem"
                        fontSize="0.75rem"
                        color="#666"
                        fontStyle="italic"
                    >
                        Click anywhere on the map to set your property's precise location
                    </Box>
                </Box>

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

                <Input
                    label="Zip Code"
                    type={'number'}
                    inputMode={'numeric'}
                    icon={FaMapPin}
                    value={formData.address?.zipCode}
                    onChange={(event) => updateFormData({
                        address: {
                            countryOrRegion: formData.address?.countryOrRegion || 'UAE',
                            city: formData.address?.city || '',
                            zipCode: parseInt(event.target.value),
                            apartmentOrFloorNumber: formData.address?.apartmentOrFloorNumber,
                            latLong: formData.address?.latLong
                        }
                    })}
                    placeholder="Enter zip code"
                    max={999999}
                    width="100%"
                    error={!!validationErrors?.zipCode}
                    helperText={validationErrors?.zipCode}
                />

            </Box>
            
            {/* Map Styles */}
            <style>{`
                .leaflet-container {
                    font-family: inherit;
                }
                .leaflet-popup-content-wrapper {
                    border-radius: 8px;
                }
                .leaflet-control-attribution {
                    font-size: 10px;
                }
            `}</style>
        </Box>
    )
}

export default LocationTab