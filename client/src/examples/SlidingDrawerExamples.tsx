import { useState } from 'react'
import SlidingDrawer from '../components/SlidingDrawer'
import SelectionPicker from '../components/SelectionPicker'
import { Box } from '../components/Box'
import useDrawerManager from '../hooks/useDrawerManager'
import { ParkingType, PetPolicy } from '../constants/propertyEnums'
import { 
  FaBars,
  FaHome,
  FaBuilding,
  FaCalendarAlt,
  FaUsers,
  FaChartLine,
  FaDollarSign,
  FaComments,
  FaCog,
  FaBell,
  FaWifi,
  FaSwimmingPool,
  FaDumbbell,
  FaSpa,
  FaParking,
  FaUmbrellaBeach,
  FaUtensils,
  FaHeart,
  FaUserFriends,
  FaBed,
  FaShower,
  FaWhatsapp,
  FaEnvelope,
  FaLink,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaPlus,
  FaCalendar,
  FaChartBar,
  FaLifeRing,
  FaDoorOpen,
  FaClipboardList,
  FaSearch,
  FaLightbulb,
  FaCity,
  FaBuilding as FaApartment
} from 'react-icons/fa'

interface PropertyFilter {
  amenities: string[]
  priceRange: [number, number]
  bedrooms: number | null
  bathrooms: number | null
  propertyTypes: string[]
  parking: ParkingType | null
  petPolicy: PetPolicy | null
}

/**
 * Comprehensive examples showcasing SlidingDrawer component capabilities
 */
export function SlidingDrawerExamples() {
  const drawerManager = useDrawerManager()
  
  // Form states
  const [propertyForm, setPropertyForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    location: '',
    amenities: [] as string[]
  })
  
  // Filter states for mobile example
  const [filters, setFilters] = useState<PropertyFilter>({
    amenities: [],
    priceRange: [100, 2000],
    bedrooms: null,
    bathrooms: null,
    propertyTypes: [],
    parking: null,
    petPolicy: null
  })
  
  // Notification state
  const [notifications] = useState([
    { id: '1', title: 'New Booking Request', message: 'Ahmed Al-Rashid wants to book your villa for 5 nights', time: '2 min ago', type: 'booking' },
    { id: '2', title: 'Payment Received', message: 'AED 2,400 payment confirmed for Villa Sunrise', time: '1 hour ago', type: 'payment' },
    { id: '3', title: 'Review Posted', message: 'New 5-star review for your Dubai Marina apartment', time: '3 hours ago', type: 'review' },
    { id: '4', title: 'Calendar Updated', message: 'Availability updated for next month', time: '1 day ago', type: 'calendar' }
  ])

  // Example data
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaChartLine />, badge: null },
    { id: 'properties', label: 'My Properties', icon: <FaHome />, badge: '12' },
    { id: 'bookings', label: 'Bookings', icon: <FaCalendarAlt />, badge: '3' },
    { id: 'guests', label: 'Guests', icon: <FaUsers />, badge: null },
    { id: 'analytics', label: 'Analytics', icon: <FaChartLine />, badge: null },
    { id: 'earnings', label: 'Earnings', icon: <FaDollarSign />, badge: 'New' },
    { id: 'messages', label: 'Messages', icon: <FaComments />, badge: '5' },
    { id: 'settings', label: 'Settings', icon: <FaCog />, badge: null }
  ]

  const amenityOptions = [
    { id: 'wifi', name: 'High-Speed WiFi', icon: <FaWifi />, category: 'Essential' },
    { id: 'pool', name: 'Swimming Pool', icon: <FaSwimmingPool />, category: 'Luxury' },
    { id: 'gym', name: 'Fitness Center', icon: <FaDumbbell />, category: 'Fitness' },
    { id: 'spa', name: 'Spa & Wellness', icon: <FaSpa />, category: 'Luxury' },
    { id: 'parking', name: 'Free Parking', icon: <FaParking />, category: 'Convenience' },
    { id: 'beach', name: 'Beach Access', icon: <FaUmbrellaBeach />, category: 'Location' },
    { id: 'restaurant', name: 'Restaurant', icon: <FaUtensils />, category: 'Dining' },
    { id: 'concierge', name: '24/7 Concierge', icon: <FaBell />, category: 'Service' }
  ]

  const propertyTypes = [
    { id: 'villa', name: 'Villa', icon: <FaHome />, count: 145 },
    { id: 'apartment', name: 'Apartment', icon: <FaApartment />, count: 289 },
    { id: 'penthouse', name: 'Penthouse', icon: <FaCity />, count: 67 },
    { id: 'townhouse', name: 'Townhouse', icon: <FaBuilding />, count: 123 }
  ]

  const shareOptions = [
    { id: 'whatsapp', label: 'WhatsApp', icon: <FaWhatsapp />, color: '#25D366' },
    { id: 'email', label: 'Email', icon: <FaEnvelope />, color: '#3182ce' },
    { id: 'copy', label: 'Copy Link', icon: <FaLink />, color: '#6b7280' },
    { id: 'facebook', label: 'Facebook', icon: <FaFacebookF />, color: '#1877F2' },
    { id: 'twitter', label: 'Twitter', icon: <FaTwitter />, color: '#1DA1F2' },
    { id: 'linkedin', label: 'LinkedIn', icon: <FaLinkedinIn />, color: '#0A66C2' }
  ]

  const quickActions = [
    { id: 'add-property', label: 'Add Property', icon: <FaPlus />, color: '#059669' },
    { id: 'calendar', label: 'Calendar', icon: <FaCalendar />, color: '#3182ce' },
    { id: 'analytics', label: 'Analytics', icon: <FaChartBar />, color: '#8b5cf6' },
    { id: 'support', label: 'Support', icon: <FaLifeRing />, color: '#f59e0b' }
  ]

  const handleFormSubmit = () => {
    console.log('Form submitted:', propertyForm)
    setPropertyForm({
      name: '',
      description: '',
      category: '',
      price: '',
      location: '',
      amenities: []
    })
    drawerManager.closeAllDrawers()
  }

  const updateFilters = (updates: Partial<PropertyFilter>) => {
    setFilters(prev => ({ ...prev, ...updates }))
  }

  const clearFilters = () => {
    setFilters({
      amenities: [],
      priceRange: [100, 2000],
      bedrooms: null,
      bathrooms: null,
      propertyTypes: [],
      parking: null,
      petPolicy: null
    })
  }

  return (
    <Box minHeight="100vh" backgroundColor="#f8fafc" padding="2rem">
      <Box maxWidth="1400px" margin="0 auto">
        {/* Header */}
        <Box marginBottom="3rem" textAlign="center">
          <Box fontSize="3rem" fontWeight="bold" marginBottom="1rem" color="#1a202c">
            SlidingDrawer Examples
          </Box>
          <Box fontSize="1.25rem" color="#718096" maxWidth="700px" margin="0 auto">
            Explore comprehensive examples of the SlidingDrawer component with various configurations,
            directions, and real-world use cases for property rental applications.
          </Box>
        </Box>

        {/* Overview Cards */}
        <Box 
          display="grid" 
          gridTemplateColumns="repeat(auto-fit, minmax(280px, 1fr))" 
          gap="1.5rem" 
          marginBottom="3rem"
        >
          {[
            { title: 'Navigation Menu', desc: 'Left-side navigation with menu items', side: 'Left', color: '#3182ce' },
            { title: 'Property Details', desc: 'Right panel with detailed information', side: 'Right', color: '#059669' },
            { title: 'Notifications', desc: 'Top sliding notification center', side: 'Top', color: '#f59e0b' },
            { title: 'Mobile Filters', desc: 'Bottom sheet for mobile filtering', side: 'Bottom', color: '#8b5cf6' }
          ].map((item, index) => (
            <Box
              key={index}
              backgroundColor="white"
              borderRadius="1rem"
              padding="1.5rem"
              boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              border="1px solid #e5e7eb"
            >
              <Box
                width="3rem"
                height="3rem"
                borderRadius="0.75rem"
                backgroundColor={item.color}
                marginBottom="1rem"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontSize="1.25rem"
                fontWeight="bold"
              >
                {item.side[0]}
              </Box>
              <Box fontSize="1.125rem" fontWeight="600" color="#1a202c" marginBottom="0.5rem">
                {item.title}
              </Box>
              <Box fontSize="0.875rem" color="#6b7280">
                {item.desc}
              </Box>
            </Box>
          ))}
        </Box>

        {/* Action Buttons Grid */}
        <Box backgroundColor="white" borderRadius="1rem" padding="2rem" marginBottom="3rem" boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)">
          <Box fontSize="1.75rem" fontWeight="600" color="#1a202c" marginBottom="2rem" textAlign="center">
            Interactive Examples
          </Box>
          
          <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap="1.5rem">
            {/* Left Navigation */}
            <Box
              as="button"
              onClick={() => drawerManager.openDrawer('navigation')}
              padding="1.5rem"
              backgroundColor="#dbeafe"
              borderRadius="0.75rem"
              border="2px solid #3182ce"
              cursor="pointer"
              textAlign="center"
              whileHover={{ backgroundColor: '#bfdbfe' }}
            >
              <Box fontSize="2rem" marginBottom="0.5rem"><FaBars /></Box>
              <Box fontSize="1rem" fontWeight="600" color="#1e40af">
                Navigation Menu
              </Box>
              <Box fontSize="0.75rem" color="#3730a3">
                Left sliding menu
              </Box>
            </Box>

            {/* Right Details Panel */}
            <Box
              as="button"
              onClick={() => drawerManager.openDrawer('details')}
              padding="1.5rem"
              backgroundColor="#dcfce7"
              borderRadius="0.75rem"
              border="2px solid #059669"
              cursor="pointer"
              textAlign="center"
              whileHover={{ backgroundColor: '#bbf7d0' }}
            >
              <Box fontSize="2rem" marginBottom="0.5rem"><FaClipboardList /></Box>
              <Box fontSize="1rem" fontWeight="600" color="#065f46">
                Property Details
              </Box>
              <Box fontSize="0.75rem" color="#047857">
                Right details panel
              </Box>
            </Box>

            {/* Top Notifications */}
            <Box
              as="button"
              onClick={() => drawerManager.openDrawer('notifications')}
              padding="1.5rem"
              backgroundColor="#fef3c7"
              borderRadius="0.75rem"
              border="2px solid #f59e0b"
              cursor="pointer"
              textAlign="center"
              whileHover={{ backgroundColor: '#fde68a' }}
            >
              <Box fontSize="2rem" marginBottom="0.5rem"><FaBell /></Box>
              <Box fontSize="1rem" fontWeight="600" color="#92400e">
                Notifications
              </Box>
              <Box fontSize="0.75rem" color="#b45309">
                Top notification bar
              </Box>
            </Box>

            {/* Bottom Mobile Filters */}
            <Box
              as="button"
              onClick={() => drawerManager.openDrawer('mobile-filters')}
              padding="1.5rem"
              backgroundColor="#ede9fe"
              borderRadius="0.75rem"
              border="2px solid #8b5cf6"
              cursor="pointer"
              textAlign="center"
              whileHover={{ backgroundColor: '#ddd6fe' }}
            >
              <Box fontSize="2rem" marginBottom="0.5rem"><FaSearch /></Box>
              <Box fontSize="1rem" fontWeight="600" color="#5b21b6">
                Mobile Filters
              </Box>
              <Box fontSize="0.75rem" color="#6d28d9">
                Bottom sheet filters
              </Box>
            </Box>

            {/* Bottom Share Sheet */}
            <Box
              as="button"
              onClick={() => drawerManager.openDrawer('share')}
              padding="1.5rem"
              backgroundColor="#fce7f3"
              borderRadius="0.75rem"
              border="2px solid #ec4899"
              cursor="pointer"
              textAlign="center"
              whileHover={{ backgroundColor: '#fbcfe8' }}
            >
              <Box fontSize="2rem" marginBottom="0.5rem"><FaEnvelope /></Box>
              <Box fontSize="1rem" fontWeight="600" color="#be185d">
                Share Property
              </Box>
              <Box fontSize="0.75rem" color="#db2777">
                Bottom share sheet
              </Box>
            </Box>

            {/* Property Form */}
            <Box
              as="button"
              onClick={() => drawerManager.openDrawer('property-form')}
              padding="1.5rem"
              backgroundColor="#e0f2fe"
              borderRadius="0.75rem"
              border="2px solid #0891b2"
              cursor="pointer"
              textAlign="center"
              whileHover={{ backgroundColor: '#bae6fd' }}
            >
              <Box fontSize="2rem" marginBottom="0.5rem"><FaClipboardList /></Box>
              <Box fontSize="1rem" fontWeight="600" color="#0e7490">
                Property Form
              </Box>
              <Box fontSize="0.75rem" color="#0891b2">
                Right form drawer
              </Box>
            </Box>

            {/* Quick Actions */}
            <Box
              as="button"
              onClick={() => drawerManager.openDrawer('quick-actions')}
              padding="1.5rem"
              backgroundColor="#f0fdf4"
              borderRadius="0.75rem"
              border="2px solid #22c55e"
              cursor="pointer"
              textAlign="center"
              whileHover={{ backgroundColor: '#dcfce7' }}
            >
              <Box fontSize="2rem" marginBottom="0.5rem"><FaLightbulb /></Box>
              <Box fontSize="1rem" fontWeight="600" color="#15803d">
                Quick Actions
              </Box>
              <Box fontSize="0.75rem" color="#16a34a">
                Bottom action sheet
              </Box>
            </Box>

            {/* Multi-Drawer Test */}
            <Box
              as="button"
              onClick={() => {
                drawerManager.openDrawer('navigation')
                setTimeout(() => drawerManager.openDrawer('details'), 500)
              }}
              padding="1.5rem"
              backgroundColor="#f5f3ff"
              borderRadius="0.75rem"
              border="2px solid #a855f7"
              cursor="pointer"
              textAlign="center"
              whileHover={{ backgroundColor: '#ede9fe' }}
            >
              <Box fontSize="2rem" marginBottom="0.5rem"><FaLink /></Box>
              <Box fontSize="1rem" fontWeight="600" color="#7c3aed">
                Multi-Drawer
              </Box>
              <Box fontSize="0.75rem" color="#8b5cf6">
                Test z-index stacking
              </Box>
            </Box>
          </Box>

          {/* Active Drawers Info */}
          {drawerManager.openDrawerCount > 0 && (
            <Box 
              marginTop="2rem" 
              padding="1rem" 
              backgroundColor="#fef3c7" 
              borderRadius="0.5rem"
              textAlign="center"
            >
              <Box fontSize="0.875rem" fontWeight="600" color="#92400e">
                Active Drawers: {drawerManager.openDrawerCount}
              </Box>
              <Box fontSize="0.75rem" color="#b45309" marginTop="0.25rem">
                IDs: {drawerManager.openDrawerIds.join(', ')}
              </Box>
              <Box
                as="button"
                onClick={drawerManager.closeAllDrawers}
                marginTop="0.5rem"
                padding="0.25rem 0.75rem"
                fontSize="0.75rem"
                backgroundColor="#f59e0b"
                color="white"
                border="none"
                borderRadius="0.25rem"
                cursor="pointer"
              >
                Close All
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Navigation Drawer - Left */}
      <SlidingDrawer
        isOpen={drawerManager.isDrawerOpen('navigation')}
        onClose={() => drawerManager.closeDrawer('navigation')}
        side="left"
        width="300px"
        zIndex={drawerManager.getDrawerZIndex('navigation')}
        showCloseButton
      >
        <Box padding="1.5rem">
          <Box display="flex" alignItems="center" gap="1rem" marginBottom="2rem">
            <Box
              width="3rem"
              height="3rem"
              backgroundColor="#3182ce"
              borderRadius="0.75rem"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="1.5rem"
            >
              <FaHome />
            </Box>
            <Box>
              <Box fontSize="1.25rem" fontWeight="bold" color="#1a202c">
                Wezo.ae
              </Box>
              <Box fontSize="0.75rem" color="#6b7280">
                Property Management
              </Box>
            </Box>
          </Box>

          <Box display="flex" flexDirection="column" gap="0.25rem">
            {menuItems.map((item) => (
              <Box
                key={item.id}
                as="button"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap="1rem"
                padding="0.75rem"
                backgroundColor="transparent"
                border="none"
                borderRadius="0.5rem"
                cursor="pointer"
                width="100%"
                textAlign="left"
                whileHover={{ backgroundColor: '#f3f4f6' }}
                onClick={() => {
                  console.log(`Navigating to ${item.label}`)
                  drawerManager.closeDrawer('navigation')
                }}
              >
                <Box display="flex" alignItems="center" gap="0.75rem">
                  <Box fontSize="1.25rem">{item.icon}</Box>
                  <Box fontSize="0.875rem" color="#374151" fontWeight="500">
                    {item.label}
                  </Box>
                </Box>
                {item.badge && (
                  <Box
                    fontSize="0.625rem"
                    fontWeight="700"
                    color="white"
                    backgroundColor={item.badge === 'New' ? '#f59e0b' : '#3182ce'}
                    padding="0.125rem 0.375rem"
                    borderRadius="0.75rem"
                    minWidth="1.25rem"
                    textAlign="center"
                  >
                    {item.badge}
                  </Box>
                )}
              </Box>
            ))}
          </Box>

          <Box marginTop="2rem" paddingTop="1rem" borderTop="1px solid #e5e7eb">
            <Box
              as="button"
              display="flex"
              alignItems="center"
              gap="0.75rem"
              padding="0.75rem"
              backgroundColor="#fef2f2"
              border="1px solid #fecaca"
              borderRadius="0.5rem"
              cursor="pointer"
              width="100%"
              textAlign="left"
            >
              <Box fontSize="1.25rem"><FaDoorOpen /></Box>
              <Box fontSize="0.875rem" color="#dc2626" fontWeight="500">
                Sign Out
              </Box>
            </Box>
          </Box>
        </Box>
      </SlidingDrawer>

      {/* Property Details Drawer - Right */}
      <SlidingDrawer
        isOpen={drawerManager.isDrawerOpen('details')}
        onClose={() => drawerManager.closeDrawer('details')}
        side="right"
        width="400px"
        zIndex={drawerManager.getDrawerZIndex('details')}
        showCloseButton
      >
        <Box padding="2rem">
          <Box fontSize="1.5rem" fontWeight="bold" marginBottom="1.5rem" color="#1a202c">
            Villa Sunrise - Dubai Marina
          </Box>

          <Box marginBottom="2rem">
            <Box
              width="100%"
              height="200px"
              backgroundColor="#f3f4f6"
              borderRadius="0.75rem"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="4rem"
              marginBottom="1rem"
            >
              <FaUmbrellaBeach />
            </Box>
            
            <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="1rem">
              <Box fontSize="2rem" fontWeight="bold" color="#059669">
                AED 1,500/night
              </Box>
              <Box display="flex" alignItems="center" gap="0.25rem">
                <Box color="#f59e0b" fontSize="1.25rem">★★★★★</Box>
                <Box fontSize="0.875rem" color="#6b7280">(4.9)</Box>
              </Box>
            </Box>
          </Box>

          <Box display="flex" flexDirection="column" gap="1.5rem">
            <Box>
              <Box fontSize="0.75rem" color="#6b7280" marginBottom="0.25rem">
                LOCATION
              </Box>
              <Box fontSize="0.875rem" fontWeight="500" color="#374151">
                Dubai Marina, UAE
              </Box>
            </Box>

            <Box>
              <Box fontSize="0.75rem" color="#6b7280" marginBottom="0.25rem">
                CAPACITY
              </Box>
              <Box display="flex" gap="1rem" fontSize="0.875rem" color="#374151">
                <Box display="flex" alignItems="center" gap="0.25rem"><FaUserFriends /> 8 guests</Box>
                <Box display="flex" alignItems="center" gap="0.25rem"><FaBed /> 4 bedrooms</Box>
                <Box display="flex" alignItems="center" gap="0.25rem"><FaShower /> 3 bathrooms</Box>
              </Box>
            </Box>

            <Box>
              <Box fontSize="0.75rem" color="#6b7280" marginBottom="0.5rem">
                AMENITIES
              </Box>
              <Box display="flex" flexWrap="wrap" gap="0.5rem">
                {['WiFi', 'Pool', 'Beach', 'Parking', 'Kitchen', 'Gym'].map((amenity) => (
                  <Box
                    key={amenity}
                    padding="0.25rem 0.5rem"
                    backgroundColor="#e0f2fe"
                    color="#0891b2"
                    borderRadius="0.25rem"
                    fontSize="0.75rem"
                    fontWeight="500"
                  >
                    {amenity}
                  </Box>
                ))}
              </Box>
            </Box>

            <Box>
              <Box fontSize="0.75rem" color="#6b7280" marginBottom="0.5rem">
                DESCRIPTION
              </Box>
              <Box fontSize="0.875rem" color="#374151" lineHeight="1.5">
                Stunning oceanfront villa with panoramic views of Dubai Marina. 
                Features private beach access, infinity pool, and world-class amenities. 
                Perfect for luxury getaways and special occasions.
              </Box>
            </Box>
          </Box>

          <Box marginTop="2rem" display="flex" gap="1rem">
            <Box
              as="button"
              flex="1"
              padding="0.75rem"
              backgroundColor="#3182ce"
              color="white"
              border="none"
              borderRadius="0.5rem"
              fontSize="0.875rem"
              fontWeight="600"
              cursor="pointer"
            >
              Book Now
            </Box>
            <Box
              as="button"
              padding="0.75rem"
              backgroundColor="#f3f4f6"
              color="#374151"
              border="none"
              borderRadius="0.5rem"
              fontSize="1.25rem"
              cursor="pointer"
            >
              <FaHeart />
            </Box>
          </Box>
        </Box>
      </SlidingDrawer>

      {/* Notifications Drawer - Top */}
      <SlidingDrawer
        isOpen={drawerManager.isDrawerOpen('notifications')}
        onClose={() => drawerManager.closeDrawer('notifications')}
        side="top"
        height="auto"
        zIndex={drawerManager.getDrawerZIndex('notifications')}
        showCloseButton
        backgroundColor="#fefcfb"
      >
        <Box padding="2rem">
          <Box fontSize="1.5rem" fontWeight="bold" marginBottom="1.5rem" color="#1a202c">
            Notifications Center
          </Box>
          
          <Box display="flex" flexDirection="column" gap="1rem" maxHeight="60vh" overflow="auto">
            {notifications.map((notification) => {
              const typeColors = {
                booking: { bg: '#dbeafe', text: '#1e40af', icon: '📅' },
                payment: { bg: '#dcfce7', text: '#166534', icon: '💰' },
                review: { bg: '#fef3c7', text: '#92400e', icon: '⭐' },
                calendar: { bg: '#ede9fe', text: '#5b21b6', icon: '📆' }
              }
              const colors = typeColors[notification.type as keyof typeof typeColors]
              
              return (
                <Box
                  key={notification.id}
                  padding="1rem"
                  backgroundColor="white"
                  borderRadius="0.5rem"
                  border="1px solid #e5e7eb"
                  display="flex"
                  gap="1rem"
                  alignItems="flex-start"
                >
                  <Box
                    fontSize="1.5rem"
                    padding="0.5rem"
                    backgroundColor={colors.bg}
                    borderRadius="0.5rem"
                  >
                    {colors.icon}
                  </Box>
                  <Box flex="1">
                    <Box fontSize="0.875rem" fontWeight="600" color="#1a202c" marginBottom="0.25rem">
                      {notification.title}
                    </Box>
                    <Box fontSize="0.75rem" color="#6b7280" marginBottom="0.5rem">
                      {notification.message}
                    </Box>
                    <Box fontSize="0.625rem" color={colors.text} fontWeight="500">
                      {notification.time}
                    </Box>
                  </Box>
                </Box>
              )
            })}
          </Box>

          <Box marginTop="1.5rem" textAlign="center">
            <Box
              as="button"
              padding="0.5rem 1rem"
              backgroundColor="#3182ce"
              color="white"
              border="none"
              borderRadius="0.375rem"
              fontSize="0.875rem"
              cursor="pointer"
            >
              Mark All as Read
            </Box>
          </Box>
        </Box>
      </SlidingDrawer>

      {/* Mobile Filters Drawer - Bottom */}
      <SlidingDrawer
        isOpen={drawerManager.isDrawerOpen('mobile-filters')}
        onClose={() => drawerManager.closeDrawer('mobile-filters')}
        side="bottom"
        height="80vh"
        zIndex={drawerManager.getDrawerZIndex('mobile-filters')}
        showCloseButton
      >
        <Box padding="1.5rem">
          <Box fontSize="1.5rem" fontWeight="bold" marginBottom="0.5rem" color="#1a202c">
            Filter Properties
          </Box>
          <Box fontSize="0.875rem" color="#6b7280" marginBottom="2rem">
            Find your perfect property with advanced filters
          </Box>

          <Box display="flex" flexDirection="column" gap="2rem" maxHeight="60vh" overflow="auto">
            {/* Property Types */}
            <Box>
              <Box fontSize="1rem" fontWeight="600" marginBottom="1rem" color="#374151">
                Property Type
              </Box>
              <SelectionPicker
                data={propertyTypes}
                idAccessor={(type) => type.id}
                value={filters.propertyTypes}
                onChange={(value) => updateFilters({ propertyTypes: value as string[] })}
                isMultiSelect={true}
                renderItem={(type, isSelected) => (
                  <Box display="flex" alignItems="center" gap="0.75rem">
                    <Box fontSize="1.5rem">{type.icon}</Box>
                    <Box flex="1">
                      <Box fontWeight={isSelected ? '600' : '400'}>{type.name}</Box>
                      <Box fontSize="0.75rem" color="#6b7280">{type.count} available</Box>
                    </Box>
                  </Box>
                )}
                containerStyles={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.5rem'
                }}
              />
            </Box>

            {/* Amenities */}
            <Box>
              <Box fontSize="1rem" fontWeight="600" marginBottom="1rem" color="#374151">
                Amenities
              </Box>
              <SelectionPicker
                data={amenityOptions}
                idAccessor={(amenity) => amenity.id}
                value={filters.amenities}
                onChange={(value) => updateFilters({ amenities: value as string[] })}
                isMultiSelect={true}
                renderItem={(amenity, isSelected) => (
                  <Box display="flex" alignItems="center" gap="0.75rem">
                    <Box fontSize="1.25rem">{amenity.icon}</Box>
                    <Box flex="1">
                      <Box fontWeight={isSelected ? '600' : '400'}>{amenity.name}</Box>
                      <Box fontSize="0.75rem" color="#6b7280">{amenity.category}</Box>
                    </Box>
                  </Box>
                )}
                containerStyles={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.5rem',
                  maxHeight: '200px',
                  overflow: 'auto'
                }}
              />
            </Box>
          </Box>

          {/* Filter Actions */}
          <Box
            display="flex"
            gap="1rem"
            marginTop="2rem"
            paddingTop="1rem"
            borderTop="1px solid #e5e7eb"
          >
            <Box
              as="button"
              flex="1"
              padding="0.75rem"
              backgroundColor="#f3f4f6"
              color="#374151"
              border="none"
              borderRadius="0.5rem"
              cursor="pointer"
              onClick={clearFilters}
            >
              Clear All
            </Box>
            <Box
              as="button"
              flex="2"
              padding="0.75rem"
              backgroundColor="#8b5cf6"
              color="white"
              border="none"
              borderRadius="0.5rem"
              cursor="pointer"
              onClick={() => drawerManager.closeDrawer('mobile-filters')}
            >
              Show {Math.floor(Math.random() * 50) + 10} Properties
            </Box>
          </Box>
        </Box>
      </SlidingDrawer>

      {/* Share Sheet Drawer - Bottom */}
      <SlidingDrawer
        isOpen={drawerManager.isDrawerOpen('share')}
        onClose={() => drawerManager.closeDrawer('share')}
        side="bottom"
        height="auto"
        zIndex={drawerManager.getDrawerZIndex('share')}
        showCloseButton
      >
        <Box padding="2rem">
          <Box fontSize="1.5rem" fontWeight="bold" marginBottom="1.5rem" textAlign="center" color="#1a202c">
            Share Property
          </Box>
          
          <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap="1.5rem" marginBottom="2rem">
            {shareOptions.map((option) => (
              <Box
                key={option.id}
                as="button"
                display="flex"
                flexDirection="column"
                alignItems="center"
                gap="0.5rem"
                padding="1rem"
                backgroundColor="#f9fafb"
                border="none"
                borderRadius="0.75rem"
                cursor="pointer"
                whileHover={{ backgroundColor: '#f3f4f6' }}
                onClick={() => {
                  console.log(`Share via ${option.label}`)
                  drawerManager.closeDrawer('share')
                }}
              >
                <Box fontSize="2rem">{option.icon}</Box>
                <Box fontSize="0.75rem" color="#374151" fontWeight="500">
                  {option.label}
                </Box>
              </Box>
            ))}
          </Box>

          <Box
            padding="1rem"
            backgroundColor="#f3f4f6"
            borderRadius="0.5rem"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box fontSize="0.75rem" color="#6b7280" flex="1" marginRight="1rem">
              https://wezo.ae/property/villa-sunrise-dubai-marina-12345
            </Box>
            <Box
              as="button"
              padding="0.5rem 1rem"
              backgroundColor="#3182ce"
              color="white"
              border="none"
              borderRadius="0.375rem"
              fontSize="0.75rem"
              cursor="pointer"
            >
              Copy
            </Box>
          </Box>
        </Box>
      </SlidingDrawer>

      {/* Property Form Drawer - Right */}
      <SlidingDrawer
        isOpen={drawerManager.isDrawerOpen('property-form')}
        onClose={() => drawerManager.closeDrawer('property-form')}
        side="right"
        width="500px"
        zIndex={drawerManager.getDrawerZIndex('property-form')}
        showCloseButton
        disableBackdropClick
      >
        <Box padding="2rem">
          <Box fontSize="1.5rem" fontWeight="bold" marginBottom="2rem" color="#1a202c">
            Add New Property
          </Box>
          
          <Box as="form" display="flex" flexDirection="column" gap="1.5rem">
            <Box>
              <Box as="label" fontSize="0.875rem" fontWeight="500" marginBottom="0.5rem" display="block" color="#374151">
                Property Name *
              </Box>
              <Box
                as="input"
                type="text"
                value={propertyForm.name}
                onChange={(e: any) => setPropertyForm({ ...propertyForm, name: e.target.value })}
                placeholder="e.g., Luxury Villa with Ocean View"
                width="100%"
                padding="0.75rem"
                border="1px solid #d1d5db"
                borderRadius="0.5rem"
                fontSize="0.875rem"
              />
            </Box>
            
            <Box>
              <Box as="label" fontSize="0.875rem" fontWeight="500" marginBottom="0.5rem" display="block" color="#374151">
                Description
              </Box>
              <Box
                as="textarea"
                value={propertyForm.description}
                onChange={(e: any) => setPropertyForm({ ...propertyForm, description: e.target.value })}
                placeholder="Describe your property..."
                width="100%"
                minHeight="100px"
                padding="0.75rem"
                border="1px solid #d1d5db"
                borderRadius="0.5rem"
                fontSize="0.875rem"
                resize="vertical"
              />
            </Box>

            <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap="1rem">
              <Box>
                <Box as="label" fontSize="0.875rem" fontWeight="500" marginBottom="0.5rem" display="block" color="#374151">
                  Category
                </Box>
                <Box
                  as="select"
                  value={propertyForm.category}
                  onChange={(e: any) => setPropertyForm({ ...propertyForm, category: e.target.value })}
                  width="100%"
                  padding="0.75rem"
                  border="1px solid #d1d5db"
                  borderRadius="0.5rem"
                  fontSize="0.875rem"
                >
                  <option value="">Select category</option>
                  <option value="villa">Villa</option>
                  <option value="apartment">Apartment</option>
                  <option value="penthouse">Penthouse</option>
                </Box>
              </Box>

              <Box>
                <Box as="label" fontSize="0.875rem" fontWeight="500" marginBottom="0.5rem" display="block" color="#374151">
                  Price (AED/night)
                </Box>
                <Box
                  as="input"
                  type="number"
                  value={propertyForm.price}
                  onChange={(e: any) => setPropertyForm({ ...propertyForm, price: e.target.value })}
                  placeholder="1500"
                  width="100%"
                  padding="0.75rem"
                  border="1px solid #d1d5db"
                  borderRadius="0.5rem"
                  fontSize="0.875rem"
                />
              </Box>
            </Box>

            <Box>
              <Box as="label" fontSize="0.875rem" fontWeight="500" marginBottom="0.5rem" display="block" color="#374151">
                Location
              </Box>
              <Box
                as="input"
                type="text"
                value={propertyForm.location}
                onChange={(e: any) => setPropertyForm({ ...propertyForm, location: e.target.value })}
                placeholder="Dubai Marina, UAE"
                width="100%"
                padding="0.75rem"
                border="1px solid #d1d5db"
                borderRadius="0.5rem"
                fontSize="0.875rem"
              />
            </Box>

            <Box>
              <Box fontSize="0.875rem" fontWeight="500" marginBottom="1rem" color="#374151">
                Amenities
              </Box>
              <SelectionPicker
                data={amenityOptions.slice(0, 4)}
                idAccessor={(amenity) => amenity.id}
                value={propertyForm.amenities}
                onChange={(value) => setPropertyForm({ ...propertyForm, amenities: value as string[] })}
                isMultiSelect={true}
                renderItem={(amenity, isSelected) => (
                  <Box display="flex" alignItems="center" gap="0.5rem">
                    <Box fontSize="1rem">{amenity.icon}</Box>
                    <Box fontSize="0.75rem" fontWeight={isSelected ? '600' : '400'}>
                      {amenity.name}
                    </Box>
                  </Box>
                )}
                containerStyles={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.5rem'
                }}
                itemStyles={{
                  padding: '0.5rem'
                }}
              />
            </Box>
            
            <Box
              display="flex"
              gap="1rem"
              marginTop="2rem"
              paddingTop="1rem"
              borderTop="1px solid #e5e7eb"
            >
              <Box
                as="button"
                type="button"
                flex="1"
                padding="0.75rem"
                backgroundColor="#f3f4f6"
                color="#374151"
                border="none"
                borderRadius="0.5rem"
                fontSize="0.875rem"
                cursor="pointer"
                onClick={() => drawerManager.closeDrawer('property-form')}
              >
                Cancel
              </Box>
              <Box
                as="button"
                type="button"
                flex="1"
                padding="0.75rem"
                backgroundColor="#059669"
                color="white"
                border="none"
                borderRadius="0.5rem"
                fontSize="0.875rem"
                cursor="pointer"
                onClick={handleFormSubmit}
              >
                Create Property
              </Box>
            </Box>
          </Box>
        </Box>
      </SlidingDrawer>

      {/* Quick Actions Drawer - Bottom */}
      <SlidingDrawer
        isOpen={drawerManager.isDrawerOpen('quick-actions')}
        onClose={() => drawerManager.closeDrawer('quick-actions')}
        side="bottom"
        height="auto"
        zIndex={drawerManager.getDrawerZIndex('quick-actions')}
        showCloseButton
      >
        <Box padding="2rem">
          <Box fontSize="1.5rem" fontWeight="bold" marginBottom="1.5rem" textAlign="center" color="#1a202c">
            Quick Actions
          </Box>
          
          <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap="1rem">
            {quickActions.map((action) => (
              <Box
                key={action.id}
                as="button"
                display="flex"
                flexDirection="column"
                alignItems="center"
                gap="0.75rem"
                padding="1.5rem"
                backgroundColor="white"
                border={`2px solid ${action.color}`}
                borderRadius="1rem"
                cursor="pointer"
                whileHover={{ 
                  backgroundColor: action.color,
                  color: 'white'
                }}
                onClick={() => {
                  console.log(`Quick action: ${action.label}`)
                  drawerManager.closeDrawer('quick-actions')
                }}
              >
                <Box fontSize="2rem">{action.icon}</Box>
                <Box fontSize="0.875rem" fontWeight="600">
                  {action.label}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </SlidingDrawer>
    </Box>
  )
}

export default SlidingDrawerExamples