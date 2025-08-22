import React, {useState} from 'react'
import {Box} from './Box'
import SlidingDrawer from './SlidingDrawer'
import SelectionPicker from './SelectionPicker'
import Input from './Input'
import {
    FaBars,
    FaCog,
    FaComments,
    FaFilter,
    FaHome,
    FaImages,
    FaMapMarkerAlt,
    FaSearch,
    FaSignOutAlt,
    FaStar,
    FaUser
} from 'react-icons/fa'

// Example data interfaces
interface Property {
  id: string
  name: string
  location: string
  price: number
  image: string
  rating: number
  amenities: string[]
  description: string
}

interface FilterOption {
  id: string
  name: string
  category: string
}

interface ChatMessage {
  id: string
  sender: 'guest' | 'host'
  message: string
  timestamp: string
}

const SlidingDrawerExample: React.FC = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState('basic')

  // Drawer states for different examples
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [propertyDrawerOpen, setPropertyDrawerOpen] = useState(false)
  const [navigationDrawerOpen, setNavigationDrawerOpen] = useState(false)
  const [galleryDrawerOpen, setGalleryDrawerOpen] = useState(false)
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false)
  const [comparisonDrawerOpen, setComparisonDrawerOpen] = useState(false)

  // States for drawer content
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [filters, setFilters] = useState({
    priceMin: '',
    priceMax: '',
    propertyType: '',
    amenities: [] as string[]
  })
  const [compareProperties, setCompareProperties] = useState<Property[]>([])

  // Example data
  const properties: Property[] = [
    {
      id: '1',
      name: 'Luxury Villa Marina',
      location: 'Dubai Marina',
      price: 750,
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400',
      rating: 4.8,
      amenities: ['Pool', 'WiFi', 'Parking', 'AC'],
      description: 'Stunning waterfront villa with panoramic marina views'
    },
    {
      id: '2',
      name: 'Desert Oasis Resort',
      location: 'Al Maha Desert',
      price: 1200,
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
      rating: 4.9,
      amenities: ['Spa', 'Pool', 'Restaurant', 'Safari'],
      description: 'Exclusive desert retreat with luxury amenities'
    },
    {
      id: '3',
      name: 'Downtown Apartment',
      location: 'Downtown Dubai',
      price: 450,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
      rating: 4.6,
      amenities: ['WiFi', 'Gym', 'Parking'],
      description: 'Modern apartment in the heart of the city'
    }
  ]

  const filterOptions: FilterOption[] = [
    { id: 'villa', name: 'Villa', category: 'type' },
    { id: 'apartment', name: 'Apartment', category: 'type' },
    { id: 'resort', name: 'Resort', category: 'type' },
    { id: 'wifi', name: 'WiFi', category: 'amenity' },
    { id: 'pool', name: 'Swimming Pool', category: 'amenity' },
    { id: 'parking', name: 'Parking', category: 'amenity' },
    { id: 'ac', name: 'Air Conditioning', category: 'amenity' }
  ]

  const propertyImages = [
    { url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', caption: 'Main View' },
    { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', caption: 'Living Room' },
    { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', caption: 'Bedroom' },
    { url: 'https://images.unsplash.com/photo-1584622781564-1d987ac5309b?w=800', caption: 'Kitchen' }
  ]

  const chatMessages: ChatMessage[] = [
    { id: '1', sender: 'host', message: 'Welcome to Villa Marina! How can I help you?', timestamp: '10:00 AM' },
    { id: '2', sender: 'guest', message: 'Hi! What time is check-in?', timestamp: '10:05 AM' },
    { id: '3', sender: 'host', message: 'Check-in is from 3:00 PM. Early check-in may be available upon request.', timestamp: '10:07 AM' },
    { id: '4', sender: 'guest', message: 'Great! Is the pool heated?', timestamp: '10:10 AM' },
    { id: '5', sender: 'host', message: 'Yes, the pool is heated year-round for your comfort.', timestamp: '10:12 AM' }
  ]

  const navigationItems = [
    { icon: FaHome, label: 'Home', path: '/' },
    { icon: FaSearch, label: 'Search Properties', path: '/search' },
    { icon: FaUser, label: 'Profile', path: '/profile' },
    { icon: FaCog, label: 'Settings', path: '/settings' }
  ]

  const openPropertyDrawer = (property: Property) => {
    setSelectedProperty(property)
    setPropertyDrawerOpen(true)
  }

  const addToComparison = (property: Property) => {
    if (compareProperties.length < 3 && !compareProperties.find(p => p.id === property.id)) {
      setCompareProperties([...compareProperties, property])
    }
  }

  const tabs = [
    { id: 'basic', name: 'Basic Drawers' },
    { id: 'directions', name: 'All Directions' },
    { id: 'advanced', name: 'Advanced Features' },
    { id: 'responsive', name: 'Responsive Design' }
  ]

  return (
    <Box padding="2rem" maxWidth="1200px" margin="0 auto">
      <Box marginBottom="2rem">
        <Box fontSize="2rem" fontWeight="700" color="#111827" marginBottom="0.5rem">
          SlidingDrawer Component Examples
        </Box>
        <Box fontSize="1.125rem" color="#6b7280">
          Robust sliding drawer implementation with multi-directional support and portal management
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
            {/* Property Filter Drawer */}
            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                Property Filter Drawer
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Left-sliding drawer for filtering property listings with form controls.
              </Box>
              
              <Box display="flex" gap="1rem" alignItems="center" marginBottom="1.5rem">
                <Box
                  as="button"
                  display="flex"
                  alignItems="center"
                  gap="0.5rem"
                  padding="0.75rem 1rem"
                  backgroundColor="#3b82f6"
                  color="white"
                  border="none"
                  borderRadius="0.5rem"
                  cursor="pointer"
                  onClick={() => setFilterDrawerOpen(true)}
                >
                  <FaFilter />
                  Open Filters
                </Box>
                
                <Box fontSize="0.875rem" color="#6b7280">
                  Click to open the filter drawer from the left side
                </Box>
              </Box>
              
              {/* Mock property grid */}
              <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap="1rem">
                {properties.map(property => (
                  <Box
                    key={property.id}
                    border="1px solid #e5e7eb"
                    borderRadius="0.5rem"
                    overflow="hidden"
                    backgroundColor="white"
                    cursor="pointer"
                    onClick={() => openPropertyDrawer(property)}
                  >
                    <Box
                      height="200px"
                      backgroundImage={`url(${property.image})`}
                      backgroundSize="cover"
                      backgroundPosition="center"
                    />
                    <Box padding="1rem">
                      <Box fontSize="1.125rem" fontWeight="600" marginBottom="0.25rem">
                        {property.name}
                      </Box>
                      <Box display="flex" alignItems="center" gap="0.25rem" marginBottom="0.5rem" color="#6b7280">
                        <FaMapMarkerAlt size="0.875rem" />
                        <Box fontSize="0.875rem">{property.location}</Box>
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box fontSize="1.25rem" fontWeight="600" color="#059669">
                          AED {property.price}/night
                        </Box>
                        <Box display="flex" alignItems="center" gap="0.25rem">
                          <FaStar color="#f59e0b" size="0.875rem" />
                          <Box fontSize="0.875rem">{property.rating}</Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Navigation Menu Drawer */}
            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                Mobile Navigation Menu
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Left-sliding navigation drawer with menu items and user actions.
              </Box>
              
              <Box
                as="button"
                display="flex"
                alignItems="center"
                gap="0.5rem"
                padding="0.75rem 1rem"
                backgroundColor="#059669"
                color="white"
                border="none"
                borderRadius="0.5rem"
                cursor="pointer"
                onClick={() => setNavigationDrawerOpen(true)}
              >
                <FaBars />
                Open Navigation
              </Box>
            </Box>
          </Box>
        )}

        {activeTab === 'directions' && (
          <Box display="grid" gap="3rem">
            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                All Slide Directions
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Drawers can slide in from any side of the screen with appropriate sizing.
              </Box>
              
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem" marginBottom="2rem">
                <Box
                  as="button"
                  padding="1rem"
                  backgroundColor="#3b82f6"
                  color="white"
                  border="none"
                  borderRadius="0.5rem"
                  cursor="pointer"
                  onClick={() => setFilterDrawerOpen(true)}
                >
                  Left Drawer (Filters)
                </Box>
                
                <Box
                  as="button"
                  padding="1rem"
                  backgroundColor="#059669"
                  color="white"
                  border="none"
                  borderRadius="0.5rem"
                  cursor="pointer"
                  onClick={() => setPropertyDrawerOpen(true)}
                >
                  Right Drawer (Details)
                </Box>
                
                <Box
                  as="button"
                  padding="1rem"
                  backgroundColor="#7c3aed"
                  color="white"
                  border="none"
                  borderRadius="0.5rem"
                  cursor="pointer"
                  onClick={() => setNavigationDrawerOpen(true)}
                >
                  Top Drawer (Notifications)
                </Box>
                
                <Box
                  as="button"
                  padding="1rem"
                  backgroundColor="#dc2626"
                  color="white"
                  border="none"
                  borderRadius="0.5rem"
                  cursor="pointer"
                  onClick={() => setGalleryDrawerOpen(true)}
                >
                  Bottom Drawer (Gallery)
                </Box>
              </Box>
              
              <Box fontSize="0.875rem" color="#6b7280" fontStyle="italic">
                Each direction has optimal default dimensions: left/right = 25rem width, top/bottom = 25rem height
              </Box>
            </Box>
          </Box>
        )}

        {activeTab === 'advanced' && (
          <Box display="grid" gap="3rem">
            {/* Property Image Gallery */}
            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                Property Image Gallery
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Full-screen bottom drawer for browsing property images with navigation.
              </Box>
              
              <Box
                as="button"
                display="flex"
                alignItems="center"
                gap="0.5rem"
                padding="0.75rem 1rem"
                backgroundColor="#7c3aed"
                color="white"
                border="none"
                borderRadius="0.5rem"
                cursor="pointer"
                onClick={() => setGalleryDrawerOpen(true)}
              >
                <FaImages />
                View Gallery
              </Box>
            </Box>

            {/* Host Communication */}
            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                Host Communication Center
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Right-sliding chat interface for guest-host communication.
              </Box>
              
              <Box
                as="button"
                display="flex"
                alignItems="center"
                gap="0.5rem"
                padding="0.75rem 1rem"
                backgroundColor="#059669"
                color="white"
                border="none"
                borderRadius="0.5rem"
                cursor="pointer"
                onClick={() => setChatDrawerOpen(true)}
              >
                <FaComments />
                Open Chat
              </Box>
            </Box>

            {/* Property Comparison */}
            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                Property Comparison
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Bottom drawer for comparing multiple properties side-by-side.
              </Box>
              
              <Box display="flex" gap="1rem" alignItems="center" marginBottom="1rem">
                <Box
                  as="button"
                  padding="0.5rem 0.75rem"
                  backgroundColor="#f3f4f6"
                  border="1px solid #d1d5db"
                  borderRadius="0.375rem"
                  cursor="pointer"
                  onClick={() => addToComparison(properties[0])}
                >
                  Add Villa Marina
                </Box>
                <Box
                  as="button"
                  padding="0.5rem 0.75rem"
                  backgroundColor="#f3f4f6"
                  border="1px solid #d1d5db"
                  borderRadius="0.375rem"
                  cursor="pointer"
                  onClick={() => addToComparison(properties[1])}
                >
                  Add Desert Oasis
                </Box>
                <Box
                  as="button"
                  display="flex"
                  alignItems="center"
                  gap="0.5rem"
                  padding="0.5rem 0.75rem"
                  backgroundColor="#f59e0b"
                  color="white"
                  border="none"
                  borderRadius="0.375rem"
                  cursor="pointer"
                  onClick={() => setComparisonDrawerOpen(true)}
                  disabled={compareProperties.length === 0}
                >
                  Compare ({compareProperties.length})
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {activeTab === 'responsive' && (
          <Box display="grid" gap="3rem">
            <Box>
              <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
                Responsive Design Demo
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="1.5rem">
                Drawers adapt to different screen sizes with appropriate dimensions and positions.
              </Box>
              
              <Box display="grid" gap="2rem">
                {/* Mobile Simulation */}
                <Box>
                  <Box fontSize="1.125rem" fontWeight="500" marginBottom="0.75rem">
                    Mobile Layout (375px width)
                  </Box>
                  <Box 
                    width="375px"
                    height="600px"
                    border="3px solid #374151"
                    borderRadius="1rem"
                    backgroundColor="#f9fafb"
                    position="relative"
                    overflow="hidden"
                    margin="0 auto"
                  >
                    <Box 
                      padding="1rem"
                      backgroundColor="white"
                      borderBottom="1px solid #e5e7eb"
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box fontWeight="600">Wezo.ae Mobile</Box>
                      <Box
                        as="button"
                        padding="0.5rem"
                        backgroundColor="transparent"
                        border="none"
                        cursor="pointer"
                        onClick={() => setNavigationDrawerOpen(true)}
                      >
                        <FaBars />
                      </Box>
                    </Box>
                    
                    <Box padding="1rem">
                      <Box fontSize="0.875rem" color="#6b7280" marginBottom="1rem">
                        On mobile, drawers typically slide from bottom or left to maximize usable space.
                      </Box>
                      
                      <Box
                        as="button"
                        width="100%"
                        padding="0.75rem"
                        backgroundColor="#3b82f6"
                        color="white"
                        border="none"
                        borderRadius="0.5rem"
                        cursor="pointer"
                        marginBottom="0.5rem"
                        onClick={() => setFilterDrawerOpen(true)}
                      >
                        Filters (Left Drawer)
                      </Box>
                      
                      <Box
                        as="button"
                        width="100%"
                        padding="0.75rem"
                        backgroundColor="#059669"
                        color="white"
                        border="none"
                        borderRadius="0.5rem"
                        cursor="pointer"
                        onClick={() => setGalleryDrawerOpen(true)}
                      >
                        Gallery (Bottom Drawer)
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Desktop Features */}
                <Box>
                  <Box fontSize="1.125rem" fontWeight="500" marginBottom="0.75rem">
                    Desktop Features
                  </Box>
                  <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem">
                    <Box
                      padding="1rem"
                      border="1px solid #d1d5db"
                      borderRadius="0.5rem"
                      backgroundColor="white"
                    >
                      <Box fontWeight="600" marginBottom="0.5rem">
                        Right Panel Details
                      </Box>
                      <Box fontSize="0.875rem" color="#6b7280" marginBottom="1rem">
                        Right drawers work well for detailed views and forms on larger screens.
                      </Box>
                      <Box
                        as="button"
                        padding="0.5rem 0.75rem"
                        backgroundColor="#059669"
                        color="white"
                        border="none"
                        borderRadius="0.375rem"
                        cursor="pointer"
                        onClick={() => setPropertyDrawerOpen(true)}
                      >
                        View Details
                      </Box>
                    </Box>
                    
                    <Box
                      padding="1rem"
                      border="1px solid #d1d5db"
                      borderRadius="0.5rem"
                      backgroundColor="white"
                    >
                      <Box fontWeight="600" marginBottom="0.5rem">
                        Full Screen Media
                      </Box>
                      <Box fontSize="0.875rem" color="#6b7280" marginBottom="1rem">
                        Bottom drawers are perfect for immersive content like image galleries.
                      </Box>
                      <Box
                        as="button"
                        padding="0.5rem 0.75rem"
                        backgroundColor="#7c3aed"
                        color="white"
                        border="none"
                        borderRadius="0.375rem"
                        cursor="pointer"
                        onClick={() => setGalleryDrawerOpen(true)}
                      >
                        Full Gallery
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* Property Filter Drawer */}
      <SlidingDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        side="left"
        width="320px"
        showCloseButton={true}
      >
        <Box padding="1.5rem" display="flex" flexDirection="column" gap="1.5rem">
          <Box fontSize="1.25rem" fontWeight="600">
            Filter Properties
          </Box>
          
          <Box>
            <Box fontSize="1rem" fontWeight="500" marginBottom="0.75rem">
              Price Range (AED/night)
            </Box>
            <Box display="flex" gap="0.5rem">
              <Input
                placeholder="Min price"
                type="number"
                value={filters.priceMin}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFilters({...filters, priceMin: e.target.value})
                }
                size="small"
              />
              <Input
                placeholder="Max price"
                type="number"
                value={filters.priceMax}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFilters({...filters, priceMax: e.target.value})
                }
                size="small"
              />
            </Box>
          </Box>

          <Box>
            <Box fontSize="1rem" fontWeight="500" marginBottom="0.75rem">
              Property Type
            </Box>
            <SelectionPicker
              data={filterOptions.filter(opt => opt.category === 'type')}
              idAccessor={(option) => option.id}
              labelAccessor={(option) => option.name}
              value={filters.propertyType}
              onChange={(value) => setFilters({...filters, propertyType: value as string})}
              isMultiSelect={false}
              gap="0.5rem"
            />
          </Box>

          <Box>
            <Box fontSize="1rem" fontWeight="500" marginBottom="0.75rem">
              Amenities
            </Box>
            <SelectionPicker
              data={filterOptions.filter(opt => opt.category === 'amenity')}
              idAccessor={(option) => option.id}
              labelAccessor={(option) => option.name}
              value={filters.amenities}
              onChange={(value) => setFilters({...filters, amenities: value as string[]})}
              isMultiSelect={true}
              gap="0.5rem"
            />
          </Box>

          <Box
            as="button"
            padding="0.75rem"
            backgroundColor="#059669"
            color="white"
            border="none"
            borderRadius="0.5rem"
            fontSize="1rem"
            fontWeight="500"
            cursor="pointer"
            marginTop="1rem"
            onClick={() => setFilterDrawerOpen(false)}
          >
            Apply Filters
          </Box>
        </Box>
      </SlidingDrawer>

      {/* Property Details Drawer */}
      <SlidingDrawer
        isOpen={propertyDrawerOpen}
        onClose={() => setPropertyDrawerOpen(false)}
        side="right"
        width="450px"
        showCloseButton={true}
        backgroundColor="#f9fafb"
      >
        {selectedProperty && (
          <Box padding="1.5rem" display="flex" flexDirection="column" gap="1.5rem">
            <Box>
              <Box fontSize="1.5rem" fontWeight="700" color="#111827" marginBottom="0.5rem">
                {selectedProperty.name}
              </Box>
              <Box display="flex" alignItems="center" gap="0.25rem" color="#6b7280">
                <FaMapMarkerAlt size="0.875rem" />
                <Box fontSize="0.875rem">{selectedProperty.location}</Box>
              </Box>
            </Box>

            <Box
              width="100%"
              height="200px"
              backgroundColor="#e5e7eb"
              borderRadius="0.5rem"
              backgroundImage={`url(${selectedProperty.image})`}
              backgroundSize="cover"
              backgroundPosition="center"
            />

            <Box padding="1rem" backgroundColor="white" borderRadius="0.5rem" border="1px solid #e5e7eb">
              <Box fontSize="1.125rem" fontWeight="600" marginBottom="1rem">
                Booking Details
              </Box>
              
              <Box display="flex" justifyContent="space-between" marginBottom="0.5rem">
                <Box color="#6b7280">Check-in:</Box>
                <Box fontWeight="500">Mar 15, 2024</Box>
              </Box>
              
              <Box display="flex" justifyContent="space-between" marginBottom="0.5rem">
                <Box color="#6b7280">Check-out:</Box>
                <Box fontWeight="500">Mar 18, 2024</Box>
              </Box>
              
              <Box display="flex" justifyContent="space-between" marginBottom="0.5rem">
                <Box color="#6b7280">Guests:</Box>
                <Box fontWeight="500">4 adults</Box>
              </Box>
              
              <Box borderTop="1px solid #e5e7eb" paddingTop="0.75rem" marginTop="0.75rem">
                <Box display="flex" justifyContent="space-between" fontSize="1.125rem" fontWeight="600">
                  <Box>Total (3 nights):</Box>
                  <Box color="#059669">AED {selectedProperty.price * 3}</Box>
                </Box>
              </Box>
            </Box>

            <Box display="flex" flexDirection="column" gap="0.75rem">
              <Box
                as="button"
                padding="0.75rem"
                backgroundColor="#3b82f6"
                color="white"
                border="none"
                borderRadius="0.5rem"
                fontSize="1rem"
                fontWeight="500"
                cursor="pointer"
              >
                Book Now
              </Box>
              <Box
                as="button"
                padding="0.75rem"
                backgroundColor="transparent"
                color="#6b7280"
                border="1px solid #d1d5db"
                borderRadius="0.5rem"
                fontSize="1rem"
                cursor="pointer"
              >
                Save to Wishlist
              </Box>
            </Box>
          </Box>
        )}
      </SlidingDrawer>

      {/* Navigation Drawer */}
      <SlidingDrawer
        isOpen={navigationDrawerOpen}
        onClose={() => setNavigationDrawerOpen(false)}
        side="left"
        width="280px"
        backgroundColor="white"
        animationDuration={250}
      >
        <Box display="flex" flexDirection="column" height="100%">
          <Box padding="1.5rem" backgroundColor="#3b82f6" color="white">
            <Box fontSize="1.25rem" fontWeight="600">
              Wezo.ae
            </Box>
            <Box fontSize="0.875rem" opacity="0.9">
              Property Rentals
            </Box>
          </Box>

          <Box flex="1" padding="1rem">
            {navigationItems.map((item) => {
              const IconComponent = item.icon
              return (
                <Box
                  key={item.label}
                  display="flex"
                  alignItems="center"
                  gap="0.75rem"
                  padding="0.75rem"
                  borderRadius="0.5rem"
                  cursor="pointer"
                  whileHover={{ backgroundColor: '#f3f4f6' }}
                  onClick={() => setNavigationDrawerOpen(false)}
                >
                  <IconComponent size="1.25rem" color="#6b7280" />
                  <Box fontSize="1rem" color="#111827">
                    {item.label}
                  </Box>
                </Box>
              )
            })}
          </Box>

          <Box padding="1rem" borderTop="1px solid #e5e7eb">
            <Box
              display="flex"
              alignItems="center"
              gap="0.75rem"
              padding="0.75rem"
              borderRadius="0.5rem"
              cursor="pointer"
              whileHover={{ backgroundColor: '#fef2f2' }}
            >
              <FaSignOutAlt size="1.25rem" color="#dc2626" />
              <Box fontSize="1rem" color="#dc2626">
                Sign Out
              </Box>
            </Box>
          </Box>
        </Box>
      </SlidingDrawer>

      {/* Image Gallery Drawer */}
      <SlidingDrawer
        isOpen={galleryDrawerOpen}
        onClose={() => setGalleryDrawerOpen(false)}
        side="bottom"
        height="80vh"
        backgroundColor="#000000"
        backdropColor="rgba(0, 0, 0, 0.9)"
        showCloseButton={true}
      >
        <Box display="flex" flexDirection="column" height="100%" color="white">
          <Box flex="1" display="flex" alignItems="center" justifyContent="center" position="relative">
            <Box
              width="90%"
              height="90%"
              backgroundImage={`url(${propertyImages[selectedImageIndex].url})`}
              backgroundSize="contain"
              backgroundPosition="center"
              backgroundRepeat="no-repeat"
            />
            
            <Box
              as="button"
              position="absolute"
              left="2rem"
              padding="1rem"
              backgroundColor="rgba(255, 255, 255, 0.2)"
              color="white"
              border="none"
              borderRadius="50%"
              cursor="pointer"
              onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
              disabled={selectedImageIndex === 0}
            >
              ←
            </Box>
            
            <Box
              as="button"
              position="absolute"
              right="2rem"
              padding="1rem"
              backgroundColor="rgba(255, 255, 255, 0.2)"
              color="white"
              border="none"
              borderRadius="50%"
              cursor="pointer"
              onClick={() => setSelectedImageIndex(Math.min(propertyImages.length - 1, selectedImageIndex + 1))}
              disabled={selectedImageIndex === propertyImages.length - 1}
            >
              →
            </Box>
          </Box>

          <Box padding="1rem" backgroundColor="rgba(0, 0, 0, 0.5)">
            <Box display="flex" gap="0.5rem" justifyContent="center" overflowX="auto">
              {propertyImages.map((image, index) => (
                <Box
                  key={index}
                  width="80px"
                  height="60px"
                  backgroundImage={`url(${image.url})`}
                  backgroundSize="cover"
                  backgroundPosition="center"
                  borderRadius="0.25rem"
                  cursor="pointer"
                  border={selectedImageIndex === index ? '2px solid #3b82f6' : '2px solid transparent'}
                  opacity={selectedImageIndex === index ? 1 : 0.7}
                  onClick={() => setSelectedImageIndex(index)}
                />
              ))}
            </Box>
            
            <Box textAlign="center" marginTop="0.5rem" fontSize="0.875rem" color="rgba(255, 255, 255, 0.8)">
              {propertyImages[selectedImageIndex].caption} ({selectedImageIndex + 1} of {propertyImages.length})
            </Box>
          </Box>
        </Box>
      </SlidingDrawer>

      {/* Chat Drawer */}
      <SlidingDrawer
        isOpen={chatDrawerOpen}
        onClose={() => setChatDrawerOpen(false)}
        side="right"
        width="400px"
        backgroundColor="#f9fafb"
      >
        <Box display="flex" flexDirection="column" height="100%">
          <Box padding="1rem" backgroundColor="white" borderBottom="1px solid #e5e7eb">
            <Box fontSize="1.125rem" fontWeight="600">Host Communication</Box>
            <Box fontSize="0.875rem" color="#6b7280">Villa Marina - Dubai</Box>
          </Box>
          
          <Box flex="1" padding="1rem" overflowY="auto" display="flex" flexDirection="column" gap="0.75rem">
            {chatMessages.map(message => (
              <Box
                key={message.id}
                display="flex"
                justifyContent={message.sender === 'guest' ? 'flex-end' : 'flex-start'}
              >
                <Box
                  maxWidth="80%"
                  padding="0.75rem 1rem"
                  backgroundColor={message.sender === 'guest' ? '#3b82f6' : 'white'}
                  color={message.sender === 'guest' ? 'white' : '#111827'}
                  borderRadius="1rem"
                  border={message.sender === 'host' ? '1px solid #e5e7eb' : 'none'}
                >
                  <Box fontSize="0.875rem">{message.message}</Box>
                  <Box fontSize="0.75rem" opacity="0.7" marginTop="0.25rem">
                    {message.timestamp}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
          
          <Box padding="1rem" backgroundColor="white" borderTop="1px solid #e5e7eb">
            <Box display="flex" gap="0.5rem">
              <Input
                placeholder="Type your message..."
                size="small"
                width="100%"
              />
              <Box
                as="button"
                padding="0.75rem 1rem"
                backgroundColor="#3b82f6"
                color="white"
                border="none"
                borderRadius="0.375rem"
                cursor="pointer"
                style={{ whiteSpace: 'nowrap' }}
              >
                Send
              </Box>
            </Box>
          </Box>
        </Box>
      </SlidingDrawer>

      {/* Property Comparison Drawer */}
      <SlidingDrawer
        isOpen={comparisonDrawerOpen}
        onClose={() => setComparisonDrawerOpen(false)}
        side="bottom"
        height="60vh"
        backgroundColor="white"
      >
        <Box padding="1.5rem">
          <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="1.5rem">
            <Box fontSize="1.25rem" fontWeight="600">
              Compare Properties ({compareProperties.length})
            </Box>
            <Box
              as="button"
              padding="0.5rem 0.75rem"
              backgroundColor="#f3f4f6"
              border="1px solid #d1d5db"
              borderRadius="0.375rem"
              cursor="pointer"
              onClick={() => setCompareProperties([])}
            >
              Clear All
            </Box>
          </Box>
          
          <Box display="grid" gridTemplateColumns={`repeat(${compareProperties.length}, 1fr)`} gap="1rem" overflowX="auto">
            {compareProperties.map(property => (
              <Box key={property.id} border="1px solid #e5e7eb" borderRadius="0.5rem" padding="1rem">
                <Box
                  height="120px"
                  backgroundImage={`url(${property.image})`}
                  backgroundSize="cover"
                  backgroundPosition="center"
                  borderRadius="0.375rem"
                  marginBottom="1rem"
                />
                <Box fontSize="1rem" fontWeight="600" marginBottom="0.5rem">
                  {property.name}
                </Box>
                <Box fontSize="0.875rem" color="#6b7280" marginBottom="0.5rem">
                  {property.location}
                </Box>
                <Box fontSize="1.125rem" fontWeight="600" color="#059669" marginBottom="0.75rem">
                  AED {property.price}/night
                </Box>
                <Box display="flex" alignItems="center" gap="0.25rem" marginBottom="0.5rem">
                  <FaStar color="#f59e0b" size="0.875rem" />
                  <Box fontSize="0.875rem">{property.rating}</Box>
                </Box>
                <Box display="flex" flexWrap="wrap" gap="0.25rem">
                  {property.amenities.slice(0, 3).map(amenity => (
                    <Box
                      key={amenity}
                      fontSize="0.75rem"
                      backgroundColor="#f3f4f6"
                      color="#374151"
                      padding="0.125rem 0.375rem"
                      borderRadius="0.25rem"
                    >
                      {amenity}
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </SlidingDrawer>
    </Box>
  )
}

export default SlidingDrawerExample