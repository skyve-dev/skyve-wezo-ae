import {useState} from 'react'
import {Box} from './Box'
import SelectionPicker from './SelectionPicker'
import {
  FaBed,
  FaCar,
  FaCouch,
  FaGamepad,
  FaHome,
  FaSnowflake,
  FaStar,
  FaSwimmingPool,
  FaUtensils,
  FaWifi
} from 'react-icons/fa'

// Example data types
interface Amenity {
  id: string
  name: string
  icon: React.ComponentType
  category: string
  popular: boolean
}

interface RoomType {
  id: string
  name: string
  description: string
  capacity: number
  pricePerNight: number
  available: boolean
  features: string[]
}

interface PropertyType {
  id: string
  name: string
  category: 'villa' | 'apartment' | 'hotel'
  minGuests: number
  maxGuests: number
  features: string[]
  priceRange: string
}

interface GuestPreference {
  id: string
  name: string
  category: 'location' | 'amenity' | 'style'
  description: string
}

const SelectionPickerExample: React.FC = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState('basic')

  // Basic selection states
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [selectedRoomType, setSelectedRoomType] = useState<string | null>(null)

  // Advanced selection states
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([])
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([])

  // Filter states (used in responsive demo)
  // const [guestCount, setGuestCount] = useState<number>(2)
  // const [priceRange, setPriceRange] = useState<string>('')

  // Example data
  const amenities: Amenity[] = [
    { id: 'wifi', name: 'Free Wi-Fi', icon: FaWifi, category: 'connectivity', popular: true },
    { id: 'pool', name: 'Swimming Pool', icon: FaSwimmingPool, category: 'recreation', popular: true },
    { id: 'parking', name: 'Free Parking', icon: FaCar, category: 'convenience', popular: false },
    { id: 'ac', name: 'Air Conditioning', icon: FaSnowflake, category: 'comfort', popular: true },
    { id: 'kitchen', name: 'Full Kitchen', icon: FaUtensils, category: 'convenience', popular: false },
    { id: 'gaming', name: 'Gaming Console', icon: FaGamepad, category: 'entertainment', popular: false }
  ]

  const roomTypes: RoomType[] = [
    {
      id: 'master',
      name: 'Master Suite',
      description: 'Spacious room with private bathroom, walk-in closet, and balcony overlooking the garden',
      capacity: 2,
      pricePerNight: 350,
      available: true,
      features: ['King Bed', 'Private Bathroom', 'Balcony', 'Walk-in Closet']
    },
    {
      id: 'guest',
      name: 'Guest Room',
      description: 'Comfortable room with shared bathroom access and garden views',
      capacity: 2,
      pricePerNight: 200,
      available: true,
      features: ['Queen Bed', 'Shared Bathroom', 'Garden View']
    },
    {
      id: 'family',
      name: 'Family Room',
      description: 'Large room with multiple beds, perfect for families with children',
      capacity: 4,
      pricePerNight: 280,
      available: true,
      features: ['2 Queen Beds', 'Private Bathroom', 'Extra Space']
    },
    {
      id: 'studio',
      name: 'Studio Apartment',
      description: 'Self-contained unit with kitchenette and living area',
      capacity: 3,
      pricePerNight: 320,
      available: false,
      features: ['Murphy Bed', 'Kitchenette', 'Living Area', 'Private Entrance']
    }
  ]

  const propertyTypes: PropertyType[] = [
    {
      id: 'luxury-villa',
      name: 'Luxury Villa',
      category: 'villa',
      minGuests: 6,
      maxGuests: 12,
      features: ['Private Pool', 'Garden', 'Multiple Bedrooms', 'Chef Kitchen'],
      priceRange: '500-2000 AED/night'
    },
    {
      id: 'beach-villa',
      name: 'Beachfront Villa',
      category: 'villa',
      minGuests: 4,
      maxGuests: 8,
      features: ['Beach Access', 'Ocean View', 'BBQ Area', 'Water Sports'],
      priceRange: '800-3000 AED/night'
    },
    {
      id: 'city-apartment',
      name: 'City Apartment',
      category: 'apartment',
      minGuests: 2,
      maxGuests: 4,
      features: ['Downtown Location', 'Modern Amenities', 'Metro Access'],
      priceRange: '200-800 AED/night'
    },
    {
      id: 'desert-resort',
      name: 'Desert Resort Villa',
      category: 'villa',
      minGuests: 8,
      maxGuests: 16,
      features: ['Desert Views', 'Spa Services', 'Camel Rides', 'Stargazing Deck'],
      priceRange: '1200-4000 AED/night'
    },
    {
      id: 'hotel-suite',
      name: 'Hotel Suite',
      category: 'hotel',
      minGuests: 2,
      maxGuests: 6,
      features: ['Room Service', 'Concierge', 'Daily Housekeeping', 'Hotel Amenities'],
      priceRange: '300-1500 AED/night'
    }
  ]

  const guestPreferences: GuestPreference[] = [
    { id: 'quiet-area', name: 'Quiet Area', category: 'location', description: 'Away from busy streets and nightlife' },
    { id: 'city-center', name: 'City Center', category: 'location', description: 'Close to shopping and business district' },
    { id: 'beach-nearby', name: 'Beach Access', category: 'location', description: 'Walking distance to beach' },
    { id: 'family-friendly', name: 'Family Friendly', category: 'amenity', description: 'Safe environment for children' },
    { id: 'pet-friendly', name: 'Pet Friendly', category: 'amenity', description: 'Pets are welcome' },
    { id: 'modern-style', name: 'Modern Design', category: 'style', description: 'Contemporary furniture and decor' },
    { id: 'traditional-style', name: 'Traditional Style', category: 'style', description: 'Classic architecture and furnishing' },
    { id: 'eco-friendly', name: 'Eco-Friendly', category: 'amenity', description: 'Sustainable and green practices' }
  ]

  // Custom renderers
  const renderAmenity = (amenity: Amenity, isSelected: boolean) => {
    const IconComponent = amenity.icon
    return (
      <Box display="flex" alignItems="center" width="100%">
        <Box marginRight="0.75rem" fontSize="1.25rem" color={isSelected ? '#3182ce' : '#6b7280'}>
          <IconComponent />
        </Box>
        <Box flex="1">
          <Box fontWeight={isSelected ? '600' : '400'} color={isSelected ? '#1e40af' : '#111827'}>
            {amenity.name}
          </Box>
          {amenity.popular && (
            <Box display="flex" alignItems="center" marginTop="0.125rem">
              <FaStar size="0.75rem" color="#f59e0b" />
              <Box fontSize="0.75rem" color="#f59e0b" marginLeft="0.25rem" fontWeight="500">
                Popular
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    )
  }

  const renderRoomType = (room: RoomType, isSelected: boolean) => (
    <Box display="flex" alignItems="center" width="100%">
      <Box marginRight="1rem" fontSize="1.5rem" color={isSelected ? '#3182ce' : '#6b7280'}>
        {room.id === 'master' && <FaBed />}
        {room.id === 'guest' && <FaCouch />}
        {room.id === 'family' && <FaBed />}
        {room.id === 'studio' && <FaHome />}
      </Box>
      
      <Box flex="1">
        <Box 
          fontSize="1.125rem" 
          fontWeight="600" 
          color={isSelected ? '#1e40af' : '#111827'}
          marginBottom="0.25rem"
        >
          {room.name}
        </Box>
        <Box fontSize="0.875rem" color="#6b7280" marginBottom="0.5rem">
          {room.description}
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="0.5rem">
          <Box fontSize="0.875rem" color="#374151">
            Up to {room.capacity} guests
          </Box>
          <Box 
            fontSize="1rem" 
            fontWeight="600" 
            color={room.available ? '#059669' : '#dc2626'}
          >
            {room.available ? `AED ${room.pricePerNight}/night` : 'Unavailable'}
          </Box>
        </Box>
        <Box display="flex" flexWrap="wrap" gap="0.25rem">
          {room.features.map((feature) => (
            <Box
              key={feature}
              fontSize="0.75rem"
              backgroundColor="#f3f4f6"
              color="#374151"
              padding="0.125rem 0.375rem"
              borderRadius="0.25rem"
            >
              {feature}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )

  const renderPropertyType = (property: PropertyType, isSelected: boolean) => (
    <Box display="flex" alignItems="start" width="100%">
      <Box flex="1">
        <Box display="flex" alignItems="center" marginBottom="0.5rem">
          <Box 
            fontSize="1.125rem" 
            fontWeight="600" 
            color={isSelected ? '#1e40af' : '#111827'}
            marginRight="0.5rem"
          >
            {property.name}
          </Box>
          <Box
            fontSize="0.75rem"
            backgroundColor={
              property.category === 'villa' ? '#fef3c7' : 
              property.category === 'apartment' ? '#dbeafe' : '#f3e8ff'
            }
            color={
              property.category === 'villa' ? '#92400e' : 
              property.category === 'apartment' ? '#1e40af' : '#6b21a8'
            }
            padding="0.25rem 0.5rem"
            borderRadius="0.375rem"
            textTransform="uppercase"
            fontWeight="600"
          >
            {property.category}
          </Box>
        </Box>
        
        <Box fontSize="0.875rem" color="#6b7280" marginBottom="0.5rem">
          Accommodates {property.minGuests}-{property.maxGuests} guests • {property.priceRange}
        </Box>
        
        <Box display="flex" flexWrap="wrap" gap="0.25rem">
          {property.features.map((feature) => (
            <Box
              key={feature}
              fontSize="0.75rem"
              backgroundColor="#f3f4f6"
              color="#374151"
              padding="0.125rem 0.375rem"
              borderRadius="0.25rem"
            >
              {feature}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )

  const renderPreference = (preference: GuestPreference, isSelected: boolean) => (
    <Box display="flex" flexDirection="column" width="100%">
      <Box display="flex" alignItems="center" marginBottom="0.25rem">
        <Box 
          fontSize="1rem" 
          fontWeight="600" 
          color={isSelected ? '#1e40af' : '#111827'}
          flex="1"
        >
          {preference.name}
        </Box>
        <Box
          fontSize="0.75rem"
          backgroundColor={
            preference.category === 'location' ? '#dcfce7' : 
            preference.category === 'amenity' ? '#fef3c7' : '#e0e7ff'
          }
          color={
            preference.category === 'location' ? '#166534' : 
            preference.category === 'amenity' ? '#92400e' : '#3730a3'
          }
          padding="0.125rem 0.375rem"
          borderRadius="0.25rem"
          textTransform="uppercase"
          fontWeight="500"
        >
          {preference.category}
        </Box>
      </Box>
      <Box fontSize="0.875rem" color="#6b7280">
        {preference.description}
      </Box>
    </Box>
  )

  const tabs = [
    { id: 'basic', name: 'Basic Selection' },
    { id: 'custom', name: 'Custom Rendering' },
    { id: 'advanced', name: 'Advanced Features' },
    { id: 'responsive', name: 'Responsive Design' }
  ]

  return (
    <Box padding="2rem" maxWidth="1200px" margin="0 auto">
      <Box marginBottom="2rem">
        <Box fontSize="2rem" fontWeight="700" color="#111827" marginBottom="0.5rem">
          SelectionPicker Component Examples
        </Box>
        <Box fontSize="1.125rem" color="#6b7280">
          Versatile selection interface for single and multiple item selection
        </Box>
      </Box>

      {/* Tab Navigation */}
      <Box 
        display="flex" 
        borderBottom="2px solid #e5e7eb"
        marginBottom="2rem"
        overflowX="auto"
        gap="0.5rem"
      >
        {tabs.map((tab) => (
          <Box
            key={tab.id}
            as="button"
            padding="0.75rem 1rem"
            fontSize="1rem"
            fontWeight="500"
            color={activeTab === tab.id ? '#3b82f6' : '#6b7280'}
            backgroundColor="transparent"
            border="none"
            borderBottom={activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent'}
            cursor="pointer"
            style={{ whiteSpace: 'nowrap' }}
            transition="all 0.2s"
            whileHover={{ color: '#3b82f6' }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.name}
          </Box>
        ))}
      </Box>

      {/* Tab Content */}
      <Box>
        {activeTab === 'basic' && (
          <Box display="grid" gap="3rem">
            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                Basic Multi-Select Amenities
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Select multiple amenities for your property. Popular items are marked with a star.
              </Box>
              <SelectionPicker
                data={amenities}
                idAccessor={(amenity) => amenity.id}
                labelAccessor={(amenity) => amenity.name}
                value={selectedAmenities}
                onChange={(value) => setSelectedAmenities(value as string[])}
                isMultiSelect={true}
                width="100%"
                maxWidth="600px"
                gap="0.75rem"
              />
              <Box marginTop="1rem" fontSize="0.875rem" color="#6b7280">
                Selected: {selectedAmenities.length > 0 ? selectedAmenities.join(', ') : 'None'}
              </Box>
            </Box>

            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                Single-Select Room Type
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Choose one room type for your booking. Some rooms may be unavailable.
              </Box>
              <SelectionPicker
                data={roomTypes}
                idAccessor={(room) => room.id}
                labelAccessor={(room) => room.name}
                value={selectedRoomType}
                onChange={(value) => setSelectedRoomType(value as string)}
                isItemDisabled={(room) => !room.available}
                isMultiSelect={false}
                width="100%"
                maxWidth="600px"
                gap="0.75rem"
              />
              <Box marginTop="1rem" fontSize="0.875rem" color="#6b7280">
                Selected: {selectedRoomType || 'None'}
              </Box>
            </Box>
          </Box>
        )}

        {activeTab === 'custom' && (
          <Box display="grid" gap="3rem">
            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                Custom Rendered Amenities with Icons
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Enhanced amenity selection with custom icons and popularity indicators.
              </Box>
              <SelectionPicker
                data={amenities}
                idAccessor={(amenity) => amenity.id}
                value={selectedAmenities}
                onChange={(value) => setSelectedAmenities(value as string[])}
                renderItem={renderAmenity}
                isMultiSelect={true}
                width="100%"
                maxWidth="600px"
                itemStyles={{ padding: '1rem' }}
                gap="0.5rem"
              />
            </Box>

            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                Detailed Room Type Selection
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Rich room type selection with descriptions, pricing, and feature lists.
              </Box>
              <SelectionPicker
                data={roomTypes}
                idAccessor={(room) => room.id}
                value={selectedRoomType}
                onChange={(value) => setSelectedRoomType(value as string)}
                renderItem={renderRoomType}
                isItemDisabled={(room) => !room.available}
                isMultiSelect={false}
                width="100%"
                itemStyles={{ 
                  padding: '1.5rem',
                  minHeight: '140px'
                }}
                gap="1rem"
              />
            </Box>
          </Box>
        )}

        {activeTab === 'advanced' && (
          <Box display="grid" gap="3rem">
            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                Property Type Selection
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Select property types with detailed information and categorization.
              </Box>
              <SelectionPicker
                data={propertyTypes}
                idAccessor={(property) => property.id}
                value={selectedPropertyTypes}
                onChange={(value) => setSelectedPropertyTypes(value as string[])}
                renderItem={renderPropertyType}
                isMultiSelect={true}
                width="100%"
                itemStyles={{ 
                  padding: '1.5rem',
                  minHeight: '120px'
                }}
                selectedItemStyles={{
                  borderColor: '#059669',
                  backgroundColor: '#ecfdf5'
                }}
                gap="1rem"
              />
              <Box marginTop="1rem" fontSize="0.875rem" color="#6b7280">
                Selected Types: {selectedPropertyTypes.length > 0 ? selectedPropertyTypes.join(', ') : 'None'}
              </Box>
            </Box>

            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                Guest Preferences
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Choose preferences for your stay with category indicators and descriptions.
              </Box>
              <SelectionPicker
                data={guestPreferences}
                idAccessor={(pref) => pref.id}
                value={selectedPreferences}
                onChange={(value) => setSelectedPreferences(value as string[])}
                renderItem={renderPreference}
                isMultiSelect={true}
                width="100%"
                maxWidth="700px"
                itemStyles={{ padding: '1.25rem' }}
                selectedItemStyles={{
                  borderColor: '#7c3aed',
                  backgroundColor: '#f3e8ff'
                }}
                gap="0.75rem"
              />
              <Box marginTop="1rem" fontSize="0.875rem" color="#6b7280">
                Selected: {selectedPreferences.length} preference{selectedPreferences.length !== 1 ? 's' : ''}
              </Box>
            </Box>
          </Box>
        )}

        {activeTab === 'responsive' && (
          <Box display="grid" gap="3rem">
            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                Responsive Layout Demo
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Selection picker adapts to different screen sizes and containers.
              </Box>
              
              {/* Mobile Layout Simulation */}
              <Box marginBottom="2rem">
                <Box fontSize="1.125rem" fontWeight="500" marginBottom="0.75rem">
                  Mobile View (Full Width)
                </Box>
                <Box 
                  maxWidth="375px"
                  border="1px solid #d1d5db"
                  borderRadius="0.5rem"
                  padding="1rem"
                  backgroundColor="#f9fafb"
                >
                  <SelectionPicker
                    data={amenities.slice(0, 4)}
                    idAccessor={(amenity) => amenity.id}
                    labelAccessor={(amenity) => amenity.name}
                    value={selectedAmenities}
                    onChange={(value) => setSelectedAmenities(value as string[])}
                    isMultiSelect={true}
                    width="100%"
                    gap="0.5rem"
                    itemStyles={{ padding: '0.75rem' }}
                  />
                </Box>
              </Box>

              {/* Tablet Layout Simulation */}
              <Box marginBottom="2rem">
                <Box fontSize="1.125rem" fontWeight="500" marginBottom="0.75rem">
                  Tablet View (Constrained Width)
                </Box>
                <Box 
                  maxWidth="600px"
                  border="1px solid #d1d5db"
                  borderRadius="0.5rem"
                  padding="1.5rem"
                  backgroundColor="#f9fafb"
                >
                  <SelectionPicker
                    data={propertyTypes.slice(0, 3)}
                    idAccessor={(property) => property.id}
                    value={selectedPropertyTypes}
                    onChange={(value) => setSelectedPropertyTypes(value as string[])}
                    renderItem={renderPropertyType}
                    isMultiSelect={true}
                    width="100%"
                    itemStyles={{ 
                      padding: '1.25rem',
                      minHeight: '100px'
                    }}
                    gap="0.75rem"
                  />
                </Box>
              </Box>

              {/* Desktop Layout with Responsive Properties */}
              <Box>
                <Box fontSize="1.125rem" fontWeight="500" marginBottom="0.75rem">
                  Desktop View (Responsive Properties)
                </Box>
                <SelectionPicker
                  data={guestPreferences.slice(0, 6)}
                  idAccessor={(pref) => pref.id}
                  value={selectedPreferences}
                  onChange={(value) => setSelectedPreferences(value as string[])}
                  renderItem={renderPreference}
                  isMultiSelect={true}
                  // Responsive width properties
                  width="100%"
                  widthSm="400px"
                  widthMd="500px"
                  widthLg="600px"
                  maxWidth="800px"
                  // Responsive padding
                  padding="0.75rem"
                  paddingMd="1rem"
                  paddingLg="1.25rem"
                  itemStyles={{ 
                    padding: '1rem',
                  }}
                  gap="0.5rem"
                />
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default SelectionPickerExample