import React, { useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { WizardFormData } from '../../types/property'
import { Box } from '../Box'

// Fix for default markers
import 'leaflet/dist/leaflet.css'

// Fix marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface LocationStepProps {
  data: WizardFormData
  onChange: (updates: Partial<WizardFormData>) => void
  onNext: () => void
  onPrevious: () => void
  onSubmit: () => void
  loading: boolean
  isFirstStep: boolean
  isLastStep: boolean
}

interface LocationPickerProps {
  center: [number, number]
  onLocationSelect: (lat: number, lng: number) => void
  marker?: [number, number]
}

// Component to handle map clicks
function LocationPicker({ onLocationSelect, marker }: LocationPickerProps) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })

  return marker ? <Marker position={marker} /> : null
}

const LocationStep: React.FC<LocationStepProps> = ({
  data,
  onChange,
  onNext,
  onPrevious,
  loading
}) => {
  // UAE centers around Dubai
  const [mapCenter, setMapCenter] = useState<[number, number]>([25.2048, 55.2708])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  
  const handleAddressChange = (field: keyof typeof data.address, value: string) => {
    onChange({
      address: {
        ...data.address,
        [field]: value
      }
    })
  }

  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    onChange({
      address: {
        ...data.address,
        latLong: {
          latitude: lat,
          longitude: lng
        }
      }
    })
  }, [data.address, onChange])

  // Search for location using Nominatim (OpenStreetMap)
  const searchLocation = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', UAE')}&limit=1&addressdetails=1`
      )
      const results = await response.json()
      
      if (results.length > 0) {
        const result = results[0]
        const lat = parseFloat(result.lat)
        const lng = parseFloat(result.lon)
        
        setMapCenter([lat, lng])
        handleLocationSelect(lat, lng)
        
        // Update address fields if available
        const addressDetails = result.address || {}
        if (addressDetails.city) {
          handleAddressChange('city', addressDetails.city)
        }
        if (addressDetails.postcode) {
          handleAddressChange('zipCode', addressDetails.postcode)
        }
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const isValid = data.address.city.trim().length > 0 && data.address.zipCode.trim().length > 0

  return (
    <Box padding="2rem">
      <Box marginBottom="2rem">
        <Box fontSize="1.5rem" fontWeight="600" color="#1a202c" marginBottom="0.5rem">
          Where is your property located?
        </Box>
        <Box color="#718096">
          Guests will only get your exact address once they book
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap="1.5rem">
        {/* Address Fields */}
        <Box display="grid" gridTemplateColumns={{ Sm: '1fr 1fr' }} gap="1rem">
          <Box>
            <Box
              as="label"
              display="block"
              fontSize="0.875rem"
              fontWeight="500"
              color="#374151"
              marginBottom="0.5rem"
            >
              City *
            </Box>
            <Box
              as="input"
              type="text"
              value={data.address.city}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                handleAddressChange('city', e.target.value)
              }
              placeholder="e.g., Dubai, Abu Dhabi, Sharjah"
              width="100%"
              padding="0.75rem"
              border="1px solid #d1d5db"
              borderRadius="0.375rem"
              fontSize="1rem"
              whileFocus={{ borderColor: '#3182ce', outline: 'none', boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)' }}
            />
          </Box>

          <Box>
            <Box
              as="label"
              display="block"
              fontSize="0.875rem"
              fontWeight="500"
              color="#374151"
              marginBottom="0.5rem"
            >
              ZIP/Postal Code *
            </Box>
            <Box
              as="input"
              type="text"
              value={data.address.zipCode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                handleAddressChange('zipCode', e.target.value)
              }
              placeholder="e.g., 12345"
              width="100%"
              padding="0.75rem"
              border="1px solid #d1d5db"
              borderRadius="0.375rem"
              fontSize="1rem"
              whileFocus={{ borderColor: '#3182ce', outline: 'none', boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)' }}
            />
          </Box>
        </Box>

        <Box>
          <Box
            as="label"
            display="block"
            fontSize="0.875rem"
            fontWeight="500"
            color="#374151"
            marginBottom="0.5rem"
          >
            Country/Region
          </Box>
          <Box
            as="select"
            value={data.address.countryOrRegion}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
              handleAddressChange('countryOrRegion', e.target.value)
            }
            width="100%"
            padding="0.75rem"
            border="1px solid #d1d5db"
            borderRadius="0.375rem"
            fontSize="1rem"
            backgroundColor="white"
            whileFocus={{ borderColor: '#3182ce', outline: 'none', boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)' }}
          >
            <option value="UAE">United Arab Emirates</option>
          </Box>
        </Box>

        <Box>
          <Box
            as="label"
            display="block"
            fontSize="0.875rem"
            fontWeight="500"
            color="#374151"
            marginBottom="0.5rem"
          >
            Apartment/Floor Number (Optional)
          </Box>
          <Box
            as="input"
            type="text"
            value={data.address.apartmentOrFloorNumber || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handleAddressChange('apartmentOrFloorNumber', e.target.value)
            }
            placeholder="e.g., Apt 4B, Floor 12"
            width="100%"
            padding="0.75rem"
            border="1px solid #d1d5db"
            borderRadius="0.375rem"
            fontSize="1rem"
            whileFocus={{ borderColor: '#3182ce', outline: 'none', boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)' }}
          />
        </Box>

        {/* Location Search */}
        <Box>
          <Box
            as="label"
            display="block"
            fontSize="0.875rem"
            fontWeight="500"
            color="#374151"
            marginBottom="0.5rem"
          >
            Search for Exact Location (Optional)
          </Box>
          <Box display="flex" gap="0.5rem">
            <Box
              as="input"
              type="text"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  searchLocation()
                }
              }}
              placeholder="e.g., Marina Walk, Dubai Marina"
              flex="1"
              padding="0.75rem"
              border="1px solid #d1d5db"
              borderRadius="0.375rem"
              fontSize="1rem"
              whileFocus={{ borderColor: '#3182ce', outline: 'none', boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)' }}
            />
            <Box
              as="button"
              onClick={searchLocation}
              disabled={isSearching || !searchQuery.trim()}
              padding="0.75rem 1rem"
              backgroundColor="#3182ce"
              color="white"
              border="none"
              borderRadius="0.375rem"
              fontSize="1rem"
              fontWeight="500"
              cursor={searchQuery.trim() ? 'pointer' : 'not-allowed'}
              opacity={searchQuery.trim() ? 1 : 0.5}
              whileHover={searchQuery.trim() ? { backgroundColor: '#2c5aa0' } : {}}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Box>
          </Box>
        </Box>

        {/* Map */}
        <Box>
          <Box
            as="label"
            display="block"
            fontSize="0.875rem"
            fontWeight="500"
            color="#374151"
            marginBottom="0.5rem"
          >
            Pin Your Exact Location (Optional)
          </Box>
          <Box fontSize="0.75rem" color="#6b7280" marginBottom="0.5rem">
            Click on the map to set your property's exact location
          </Box>
          <Box
            height="400px"
            borderRadius="0.375rem"
            overflow="hidden"
            border="1px solid #d1d5db"
          >
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              key={`${mapCenter[0]}-${mapCenter[1]}`}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationPicker
                center={mapCenter}
                onLocationSelect={handleLocationSelect}
                marker={data.address.latLong ? [data.address.latLong.latitude, data.address.latLong.longitude] : undefined}
              />
            </MapContainer>
          </Box>
          {data.address.latLong && (
            <Box fontSize="0.75rem" color="#059669" marginTop="0.5rem">
              ✓ Location set: {data.address.latLong.latitude.toFixed(6)}, {data.address.latLong.longitude.toFixed(6)}
            </Box>
          )}
        </Box>
      </Box>

      {/* Navigation */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginTop="3rem"
        paddingTop="2rem"
        borderTop="1px solid #e5e7eb"
      >
        <Box>
          <Box
            as="button"
            onClick={onPrevious}
            padding="0.75rem 1.5rem"
            backgroundColor="transparent"
            color="#6b7280"
            border="1px solid #d1d5db"
            borderRadius="0.375rem"
            fontSize="1rem"
            cursor="pointer"
            whileHover={{ borderColor: '#9ca3af', backgroundColor: '#f9fafb' }}
          >
            Previous
          </Box>
        </Box>

        <Box>
          <Box
            as="button"
            onClick={onNext}
            disabled={!isValid || loading}
            padding="0.75rem 2rem"
            backgroundColor={isValid ? '#3182ce' : '#9ca3af'}
            color="white"
            border="none"
            borderRadius="0.375rem"
            fontSize="1rem"
            fontWeight="500"
            cursor={isValid ? 'pointer' : 'not-allowed'}
            whileHover={isValid ? { backgroundColor: '#2c5aa0' } : {}}
          >
            {loading ? 'Saving...' : 'Next'}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default LocationStep