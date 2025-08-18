import { useState } from 'react'
import { Box } from '../components/Box'
import { Input } from '../components/Input'
import { 
  FaRuler,
  FaPalette,
  FaMouse,
  FaMobileAlt,
  FaEdit,
  FaUmbrellaBeach,
  FaBuilding,
  FaHome,
  FaCity,
  FaHeart,
  FaBars,
  FaBullseye,
  FaRocket,
  FaStar,
  FaPaintBrush,
  FaBolt,
  FaTheaterMasks,
  FaBell
} from 'react-icons/fa'
import { FiZap } from 'react-icons/fi'

/**
 * Comprehensive examples showcasing Box component capabilities
 */
export function BoxExamples() {
  const [activeTab, setActiveTab] = useState('layout')
  const [hoverStates, setHoverStates] = useState<Record<string, boolean>>({})

  const tabs = [
    { id: 'layout', label: 'Layout & Grid', icon: <FaRuler /> },
    { id: 'styling', label: 'Styling & Colors', icon: <FaPalette /> },
    { id: 'interactive', label: 'Interactive Elements', icon: <FaMouse /> },
    { id: 'responsive', label: 'Responsive Design', icon: <FaMobileAlt /> },
    { id: 'animations', label: 'Animations & Hover', icon: <FiZap /> },
    { id: 'forms', label: 'Form Elements', icon: <FaEdit /> }
  ]

  const colorPalette = [
    { name: 'Primary Blue', color: '#3182ce', text: 'white' },
    { name: 'Success Green', color: '#059669', text: 'white' },
    { name: 'Warning Orange', color: '#f59e0b', text: 'white' },
    { name: 'Error Red', color: '#dc2626', text: 'white' },
    { name: 'Purple', color: '#8b5cf6', text: 'white' },
    { name: 'Pink', color: '#ec4899', text: 'white' },
    { name: 'Teal', color: '#0891b2', text: 'white' },
    { name: 'Gray', color: '#6b7280', text: 'white' }
  ]

  const shadowExamples = [
    { name: 'Small', shadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
    { name: 'Medium', shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
    { name: 'Large', shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' },
    { name: 'Extra Large', shadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }
  ]

  const handleMouseEnter = (id: string) => {
    setHoverStates(prev => ({ ...prev, [id]: true }))
  }

  const handleMouseLeave = (id: string) => {
    setHoverStates(prev => ({ ...prev, [id]: false }))
  }

  return (
    <Box minHeight="100vh" backgroundColor="#f8fafc">
      {/* Header */}
      <Box backgroundColor="white" borderBottom="1px solid #e5e7eb" padding="2rem 0">
        <Box maxWidth="1400px" margin="0 auto" padding="0 2rem">
          <Box textAlign="center" marginBottom="2rem">
            <Box fontSize="3rem" fontWeight="bold" marginBottom="1rem" color="#1a202c">
              Box Component Examples
            </Box>
            <Box fontSize="1.25rem" color="#6b7280" maxWidth="800px" margin="0 auto">
              Explore the versatile Box component that serves as the foundation for all UI elements
              in your property rental application. See layout systems, styling options, and interactive behaviors.
            </Box>
          </Box>

          {/* Tab Navigation */}
          <Box display="flex" justifyContent="center" flexWrap="wrap" gap="0.5rem">
            {tabs.map((tab) => (
              <Box
                key={tab.id}
                as="button"
                onClick={() => setActiveTab(tab.id)}
                padding="0.75rem 1.5rem"
                backgroundColor={activeTab === tab.id ? '#3182ce' : 'transparent'}
                color={activeTab === tab.id ? 'white' : '#6b7280'}
                border={activeTab === tab.id ? 'none' : '1px solid #d1d5db'}
                borderRadius="0.5rem"
                cursor="pointer"
                fontSize="1rem"
                fontWeight="500"
                display="flex"
                alignItems="center"
                gap="0.5rem"
                whileHover={{
                  backgroundColor: activeTab === tab.id ? '#2563eb' : '#f9fafb'
                }}
              >
                <Box fontSize="1rem">{tab.icon}</Box>
                {tab.label}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Content Area */}
      <Box maxWidth="1400px" margin="0 auto" padding="2rem">
        {/* Layout & Grid Examples */}
        {activeTab === 'layout' && (
          <Box display="flex" flexDirection="column" gap="3rem">
            <Box>
              <Box fontSize="2rem" fontWeight="bold" marginBottom="1rem" color="#1a202c">
                Layout & Grid Systems
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="2rem">
                Demonstrate flexbox and grid layouts with property listing cards
              </Box>

              {/* Flexbox Layout */}
              <Box marginBottom="3rem">
                <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem" color="#374151">
                  Flexbox Property Cards
                </Box>
                <Box 
                  display="flex" 
                  gap="1.5rem" 
                  overflow="auto" 
                  padding="1rem 0"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <Box
                      key={i}
                      minWidth="300px"
                      backgroundColor="white"
                      borderRadius="1rem"
                      boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                      overflow="hidden"
                      whileHover={{ transform: 'translateY(-4px)' }}
                    >
                      <Box
                        height="200px"
                        backgroundColor={`hsl(${i * 60}, 70%, 85%)`}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="3rem"
                      >
                        <FaUmbrellaBeach />
                      </Box>
                      <Box padding="1.5rem">
                        <Box fontSize="1.125rem" fontWeight="600" marginBottom="0.5rem">
                          Villa Sunset {i + 1}
                        </Box>
                        <Box fontSize="1rem" color="#6b7280" marginBottom="1rem">
                          Dubai Marina, UAE
                        </Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box fontSize="1.25rem" fontWeight="bold" color="#059669">
                            AED {(1200 + i * 200)}/night
                          </Box>
                          <Box fontSize="1rem" color="#f59e0b">
                            ★ 4.{8 + i}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Grid Layout */}
              <Box marginBottom="3rem">
                <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem" color="#374151">
                  Grid Property Gallery
                </Box>
                <Box 
                  display="grid" 
                  gridTemplateColumns="repeat(auto-fill, minmax(280px, 1fr))" 
                  gap="1.5rem"
                >
                  {Array.from({ length: 6 }, (_, i) => (
                    <Box
                      key={i}
                      backgroundColor="white"
                      borderRadius="1rem"
                      boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
                      overflow="hidden"
                      position="relative"
                    >
                      <Box
                        height="180px"
                        backgroundColor={colorPalette[i % colorPalette.length].color}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="2.5rem"
                        color="white"
                      >
                        {[<FaUmbrellaBeach />, <FaBuilding />, <FaHome />, <FaCity />, <FaHome />, <FaBuilding />][i]}
                      </Box>
                      <Box
                        position="absolute"
                        top="1rem"
                        right="1rem"
                        backgroundColor="rgba(0, 0, 0, 0.7)"
                        color="white"
                        padding="0.25rem 0.75rem"
                        borderRadius="1rem"
                        fontSize="1rem"
                        fontWeight="600"
                      >
                        {['Villa', 'Apartment', 'Townhouse', 'Penthouse', 'House', 'Castle'][i]}
                      </Box>
                      <Box padding="1rem">
                        <Box fontSize="1rem" fontWeight="600" marginBottom="0.25rem">
                          Property {i + 1}
                        </Box>
                        <Box fontSize="1rem" color="#6b7280">
                          Location {i + 1}
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Complex Layout */}
              <Box>
                <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem" color="#374151">
                  Complex Dashboard Layout
                </Box>
                <Box 
                  display="grid" 
                  gridTemplateColumnsLg="2fr 1fr"
                  gridTemplateRows="auto auto 1fr"
                  gap="1.5rem"
                  height="400px"
                >
                  <Box 
                    gridColumn="1 / 3"
                    backgroundColor="white"
                    borderRadius="1rem"
                    padding="1.5rem"
                    boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box>
                      <Box fontSize="1.25rem" fontWeight="bold">Dashboard Header</Box>
                      <Box fontSize="1rem" color="#6b7280">Welcome back to your property management</Box>
                    </Box>
                    <Box 
                      padding="0.75rem 1.5rem"
                      backgroundColor="#3182ce"
                      color="white"
                      borderRadius="0.5rem"
                      fontSize="1rem"
                      fontWeight="600"
                    >
                      Add Property
                    </Box>
                  </Box>

                  <Box 
                    backgroundColor="white"
                    borderRadius="1rem"
                    padding="1.5rem"
                    boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
                  >
                    <Box fontSize="1.125rem" fontWeight="600" marginBottom="1rem">Main Content</Box>
                    <Box display="flex" flexDirection="column" gap="0.75rem">
                      {Array.from({ length: 3 }, (_, i) => (
                        <Box
                          key={i}
                          padding="0.75rem"
                          backgroundColor="#f9fafb"
                          borderRadius="0.5rem"
                          borderLeft={`4px solid ${colorPalette[i].color}`}
                        >
                          <Box fontWeight="500">Item {i + 1}</Box>
                          <Box fontSize="1rem" color="#6b7280">Content description</Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  <Box 
                    backgroundColor="white"
                    borderRadius="1rem"
                    padding="1.5rem"
                    boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
                  >
                    <Box fontSize="1.125rem" fontWeight="600" marginBottom="1rem">Sidebar</Box>
                    <Box display="flex" flexDirection="column" gap="0.5rem">
                      {['Recent Activity', 'Quick Stats', 'Notifications'].map((item, i) => (
                        <Box
                          key={i}
                          padding="0.5rem"
                          backgroundColor="#f3f4f6"
                          borderRadius="0.375rem"
                          fontSize="1rem"
                        >
                          {item}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* Styling & Colors Examples */}
        {activeTab === 'styling' && (
          <Box display="flex" flexDirection="column" gap="3rem">
            <Box>
              <Box fontSize="2rem" fontWeight="bold" marginBottom="1rem" color="#1a202c">
                Styling & Color System
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="2rem">
                Explore color palettes, shadows, borders, and visual styling options
              </Box>

              {/* Color Palette */}
              <Box marginBottom="3rem">
                <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem" color="#374151">
                  Color Palette
                </Box>
                <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap="1rem">
                  {colorPalette.map((item, i) => (
                    <Box
                      key={i}
                      backgroundColor={item.color}
                      color={item.text}
                      padding="1.5rem"
                      borderRadius="0.75rem"
                      textAlign="center"
                      boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                    >
                      <Box fontSize="1.125rem" fontWeight="bold" marginBottom="0.5rem">
                        {item.name}
                      </Box>
                      <Box fontSize="1rem" opacity={0.9}>
                        {item.color}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Shadow Examples */}
              <Box marginBottom="3rem">
                <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem" color="#374151">
                  Shadow Effects
                </Box>
                <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="2rem">
                  {shadowExamples.map((shadow, i) => (
                    <Box
                      key={i}
                      backgroundColor="white"
                      padding="2rem"
                      borderRadius="1rem"
                      boxShadow={shadow.shadow}
                      textAlign="center"
                    >
                      <Box fontSize="1.125rem" fontWeight="600" marginBottom="0.5rem">
                        {shadow.name} Shadow
                      </Box>
                      <Box fontSize="1rem" color="#6b7280">
                        Depth level {i + 1}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Border Examples */}
              <Box marginBottom="3rem">
                <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem" color="#374151">
                  Border Styles
                </Box>
                <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(180px, 1fr))" gap="1rem">
                  {[
                    { name: 'Solid', border: '2px solid #3182ce' },
                    { name: 'Dashed', border: '2px dashed #059669' },
                    { name: 'Dotted', border: '3px dotted #f59e0b' },
                    { name: 'Double', border: '4px double #8b5cf6' },
                    { name: 'Gradient', border: '3px solid transparent', background: 'linear-gradient(white, white) padding-box, linear-gradient(45deg, #3182ce, #8b5cf6) border-box' }
                  ].map((style, i) => (
                    <Box
                      key={i}
                      padding="1.5rem"
                      backgroundColor="white"
                      borderRadius="0.75rem"
                      border={style.border}
                      background={style.background}
                      textAlign="center"
                    >
                      <Box fontSize="1rem" fontWeight="600">
                        {style.name}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Gradient Examples */}
              <Box>
                <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem" color="#374151">
                  Gradient Backgrounds
                </Box>
                <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap="1rem">
                  {[
                    { name: 'Ocean Blue', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
                    { name: 'Sunset', bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
                    { name: 'Forest', bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
                    { name: 'Royal', bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }
                  ].map((gradient, i) => (
                    <Box
                      key={i}
                      height="120px"
                      background={gradient.bg}
                      borderRadius="1rem"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="white"
                      fontSize="1.125rem"
                      fontWeight="bold"
                      style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}
                    >
                      {gradient.name}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* Interactive Elements */}
        {activeTab === 'interactive' && (
          <Box display="flex" flexDirection="column" gap="3rem">
            <Box>
              <Box fontSize="2rem" fontWeight="bold" marginBottom="1rem" color="#1a202c">
                Interactive Elements
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="2rem">
                Buttons, cards, and interactive components with hover states and transitions
              </Box>

              {/* Button Variations */}
              <Box marginBottom="3rem">
                <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem" color="#374151">
                  Button Variations
                </Box>
                <Box display="flex" flexWrap="wrap" gap="1rem" alignItems="center">
                  {[
                    { variant: 'Primary', bg: '#3182ce', color: 'white' },
                    { variant: 'Success', bg: '#059669', color: 'white' },
                    { variant: 'Warning', bg: '#f59e0b', color: 'white' },
                    { variant: 'Danger', bg: '#dc2626', color: 'white' },
                    { variant: 'Outline', bg: 'transparent', color: '#3182ce', border: '2px solid #3182ce' },
                    { variant: 'Ghost', bg: '#f3f4f6', color: '#374151' }
                  ].map((button, i) => (
                    <Box
                      key={i}
                      as="button"
                      padding="0.75rem 1.5rem"
                      backgroundColor={button.bg}
                      color={button.color}
                      border={button.border || 'none'}
                      borderRadius="0.5rem"
                      fontSize="1rem"
                      fontWeight="600"
                      cursor="pointer"
                      whileHover={{
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
                      }}
                    >
                      {button.variant}
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Interactive Cards */}
              <Box marginBottom="3rem">
                <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem" color="#374151">
                  Interactive Property Cards
                </Box>
                <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap="1.5rem">
                  {Array.from({ length: 4 }, (_, i) => (
                    <Box
                      key={i}
                      backgroundColor="white"
                      borderRadius="1rem"
                      boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
                      overflow="hidden"
                      cursor="pointer"
                      onMouseEnter={() => handleMouseEnter(`card-${i}`)}
                      onMouseLeave={() => handleMouseLeave(`card-${i}`)}
                      whileHover={{
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 25px rgba(0, 0, 0, 0.15)'
                      }}
                    >
                      <Box position="relative">
                        <Box
                          height="200px"
                          backgroundColor={colorPalette[i].color}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontSize="3rem"
                          color="white"
                        >
                          <FaUmbrellaBeach />
                        </Box>
                        <Box
                          position="absolute"
                          top="1rem"
                          right="1rem"
                          backgroundColor="rgba(255, 255, 255, 0.9)"
                          borderRadius="50%"
                          width="2.5rem"
                          height="2.5rem"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontSize="1.25rem"
                          color={hoverStates[`card-${i}`] ? '#dc2626' : '#6b7280'}
                          cursor="pointer"
                        >
                          <FaHeart />
                        </Box>
                      </Box>
                      <Box padding="1.5rem">
                        <Box display="flex" justifyContent="space-between" alignItems="start" marginBottom="1rem">
                          <Box>
                            <Box fontSize="1.125rem" fontWeight="600" marginBottom="0.25rem">
                              Luxury Villa {i + 1}
                            </Box>
                            <Box fontSize="1rem" color="#6b7280">
                              Dubai Marina, UAE
                            </Box>
                          </Box>
                          <Box textAlign="right">
                            <Box fontSize="1rem" color="#f59e0b">★ 4.9</Box>
                            <Box fontSize="1rem" color="#6b7280">(127 reviews)</Box>
                          </Box>
                        </Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box fontSize="1.25rem" fontWeight="bold" color="#059669">
                            AED {(1200 + i * 300)}/night
                          </Box>
                          <Box
                            padding="0.5rem 1rem"
                            backgroundColor="#3182ce"
                            color="white"
                            borderRadius="0.375rem"
                            fontSize="1rem"
                            fontWeight="600"
                            opacity={hoverStates[`card-${i}`] ? 1 : 0.8}
                          >
                            Book Now
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Toggle and Switch Components */}
              <Box>
                <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem" color="#374151">
                  Toggle & Switch Components
                </Box>
                <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap="2rem">
                  {[
                    { label: 'WiFi Available', checked: true },
                    { label: 'Pet Friendly', checked: false },
                    { label: 'Instant Booking', checked: true },
                    { label: 'Free Cancellation', checked: false }
                  ].map((toggle, i) => (
                    <Box
                      key={i}
                      padding="1.5rem"
                      backgroundColor="white"
                      borderRadius="0.75rem"
                      boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Box fontSize="1rem" fontWeight="500">
                        {toggle.label}
                      </Box>
                      <Box
                        width="3rem"
                        height="1.5rem"
                        backgroundColor={toggle.checked ? '#059669' : '#d1d5db'}
                        borderRadius="0.75rem"
                        position="relative"
                        cursor="pointer"
                        display="flex"
                        alignItems="center"
                        padding="0.125rem"
                      >
                        <Box
                          width="1.25rem"
                          height="1.25rem"
                          backgroundColor="white"
                          borderRadius="50%"
                          boxShadow="0 2px 4px rgba(0, 0, 0, 0.2)"
                          transform={toggle.checked ? 'translateX(1.5rem)' : 'translateX(0)'}
                          transition="transform 0.2s ease"
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* Responsive Design */}
        {activeTab === 'responsive' && (
          <Box display="flex" flexDirection="column" gap="3rem">
            <Box>
              <Box fontSize="2rem" fontWeight="bold" marginBottom="1rem" color="#1a202c">
                Responsive Design
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="2rem">
                Demonstrating responsive layouts that work across different screen sizes
              </Box>

              {/* Responsive Grid */}
              <Box marginBottom="3rem">
                <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem" color="#374151">
                  Responsive Property Grid
                </Box>
                <Box 
                  display="grid" 
                  gridTemplateColumns={{
                    Sm: '1fr',
                    Md: 'repeat(2, 1fr)',
                    Lg: 'repeat(3, 1fr)',
                    Xl: 'repeat(4, 1fr)'
                  }}
                  gap="1rem"
                >
                  {Array.from({ length: 8 }, (_, i) => (
                    <Box
                      key={i}
                      backgroundColor="white"
                      borderRadius="0.75rem"
                      padding="1rem"
                      boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
                      textAlign="center"
                    >
                      <Box
                        width="100%"
                        height="120px"
                        backgroundColor={colorPalette[i % colorPalette.length].color}
                        borderRadius="0.5rem"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="2rem"
                        color="white"
                        marginBottom="1rem"
                      >
                        <FaHome />
                      </Box>
                      <Box fontSize="1rem" fontWeight="600" marginBottom="0.25rem">
                        Property {i + 1}
                      </Box>
                      <Box fontSize="1rem" color="#6b7280">
                        Responsive Item
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Responsive Navigation */}
              <Box marginBottom="3rem">
                <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem" color="#374151">
                  Responsive Navigation Bar
                </Box>
                <Box
                  backgroundColor="white"
                  borderRadius="0.75rem"
                  padding="1rem 1.5rem"
                  boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  flexWrap="wrap"
                  gap="1rem"
                >
                  <Box display="flex" alignItems="center" gap="1rem">
                    <Box fontSize="1.5rem"><FaHome /></Box>
                    <Box fontSize="1.25rem" fontWeight="bold" color="#1a202c">
                      Wezo.ae
                    </Box>
                  </Box>
                  
                  <Box 
                    display={'flex'}
                    alignItems="center"
                    gap="2rem"
                    fontSize="1rem"
                  >
                    {['Properties', 'Bookings', 'Analytics', 'Settings'].map((item) => (
                      <Box key={item} color="#6b7280" cursor="pointer" whileHover={{ color: '#3182ce' }}>
                        {item}
                      </Box>
                    ))}
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap="1rem">
                    <Box
                      display={'none'}
                      fontSize="1.25rem"
                      cursor="pointer"
                    >
                      <FaBars />
                    </Box>
                    <Box
                      padding="0.5rem 1rem"
                      backgroundColor="#3182ce"
                      color="white"
                      borderRadius="0.375rem"
                      fontSize="1rem"
                      fontWeight="600"
                      cursor="pointer"
                    >
                      Sign In
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Responsive Card Layout */}
              <Box>
                <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem" color="#374151">
                  Responsive Card Stacking
                </Box>
                <Box 
                  display="flex"
                  flexDirection="row"
                  gap="1.5rem"
                >
                  <Box
                    flex="2"
                    backgroundColor="white"
                    borderRadius="1rem"
                    padding="2rem"
                    boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                  >
                    <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem">
                      Main Content Area
                    </Box>
                    <Box fontSize="1rem" color="#6b7280" lineHeight="1.6">
                      This is the main content area that takes up more space on larger screens
                      but stacks vertically on mobile devices. The responsive design ensures
                      optimal viewing experience across all device sizes.
                    </Box>
                  </Box>
                  
                  <Box
                    flex="1"
                    backgroundColor="white"
                    borderRadius="1rem"
                    padding="1.5rem"
                    boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                  >
                    <Box fontSize="1.125rem" fontWeight="600" marginBottom="1rem">
                      Sidebar
                    </Box>
                    <Box display="flex" flexDirection="column" gap="0.75rem">
                      {['Quick Stats', 'Recent Activity', 'Shortcuts'].map((item, i) => (
                        <Box
                          key={i}
                          padding="0.75rem"
                          backgroundColor="#f9fafb"
                          borderRadius="0.5rem"
                          fontSize="1rem"
                          color="#6b7280"
                        >
                          {item}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* Animations & Hover */}
        {activeTab === 'animations' && (
          <Box display="flex" flexDirection="column" gap="3rem">
            <Box>
              <Box fontSize="2rem" fontWeight="bold" marginBottom="1rem" color="#1a202c">
                Animations & Hover Effects
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="2rem">
                Interactive animations and smooth transitions for enhanced user experience
              </Box>

              {/* Hover Cards */}
              <Box marginBottom="3rem">
                <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem" color="#374151">
                  Hover Animation Cards
                </Box>
                <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="1.5rem">
                  {Array.from({ length: 6 }, (_, i) => (
                    <Box
                      key={i}
                      backgroundColor="white"
                      borderRadius="1rem"
                      padding="1.5rem"
                      textAlign="center"
                      boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
                      cursor="pointer"
                      whileHover={{
                        transform: [
                          'scale(1.05)',
                          'rotateY(5deg)',
                          'translateY(-10px)',
                          'skew(2deg)',
                          'rotateZ(2deg)',
                          'scale(1.1) rotateZ(-2deg)'
                        ][i],
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                        backgroundColor: colorPalette[i].color,
                        color: 'white'
                      }}
                    >
                      <Box fontSize="2rem" marginBottom="0.5rem">
                        {[<FaBullseye />, <FaRocket />, <FaStar />, <FaPaintBrush />, <FaBolt />, <FaTheaterMasks />][i]}
                      </Box>
                      <Box fontSize="1rem" fontWeight="600" marginBottom="0.25rem">
                        {['Scale', 'Rotate Y', 'Translate', 'Skew', 'Rotate Z', 'Combined'][i]}
                      </Box>
                      <Box fontSize="1rem" opacity={0.8}>
                        Hover me!
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Loading States */}
              <Box marginBottom="3rem">
                <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem" color="#374151">
                  Loading & Progress States
                </Box>
                <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap="1.5rem">
                  {/* Spinner */}
                  <Box
                    backgroundColor="white"
                    borderRadius="1rem"
                    padding="2rem"
                    textAlign="center"
                    boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
                  >
                    <Box
                      width="2rem"
                      height="2rem"
                      border="3px solid #f3f4f6"
                      borderTop="3px solid #3182ce"
                      borderRadius="50%"
                      margin="0 auto 1rem"
                      animation="spin 1s linear infinite"
                      style={{
                        animation: 'spin 1s linear infinite'
                      }}
                    />
                    <Box fontSize="1rem" color="#6b7280">Loading...</Box>
                  </Box>

                  {/* Progress Bar */}
                  <Box
                    backgroundColor="white"
                    borderRadius="1rem"
                    padding="2rem"
                    boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
                  >
                    <Box fontSize="1rem" marginBottom="1rem" color="#374151">
                      Upload Progress: 67%
                    </Box>
                    <Box
                      width="100%"
                      height="0.5rem"
                      backgroundColor="#f3f4f6"
                      borderRadius="0.25rem"
                      overflow="hidden"
                    >
                      <Box
                        width="67%"
                        height="100%"
                        backgroundColor="#059669"
                        borderRadius="0.25rem"
                      />
                    </Box>
                  </Box>

                  {/* Pulse Effect */}
                  <Box
                    backgroundColor="white"
                    borderRadius="1rem"
                    padding="2rem"
                    textAlign="center"
                    boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
                  >
                    <Box
                      width="3rem"
                      height="3rem"
                      backgroundColor="#f59e0b"
                      borderRadius="50%"
                      margin="0 auto 1rem"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="1.5rem"
                      color="white"
                      animation="pulse 2s ease-in-out infinite"
                      style={{
                        animation: 'pulse 2s ease-in-out infinite'
                      }}
                    >
                      <FaBell />
                    </Box>
                    <Box fontSize="1rem" color="#6b7280">Notification</Box>
                  </Box>
                </Box>
              </Box>

              {/* Bouncing Elements */}
              <Box>
                <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem" color="#374151">
                  Interactive Bouncing Elements
                </Box>
                <Box
                  backgroundColor="white"
                  borderRadius="1rem"
                  padding="2rem"
                  boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  gap="1rem"
                  flexWrap="wrap"
                >
                  {colorPalette.slice(0, 5).map((color, i) => (
                    <Box
                      key={i}
                      width="3rem"
                      height="3rem"
                      backgroundColor={color.color}
                      borderRadius="50%"
                      cursor="pointer"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="white"
                      fontSize="1.25rem"
                      fontWeight="bold"
                      whileHover={{
                        transform: 'scale(1.2)',
                        animation: 'bounce 0.6s ease-in-out infinite'
                      }}
                      style={{
                        animationDelay: `${i * 0.1}s`
                      }}
                    >
                      {i + 1}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* Form Elements */}
        {activeTab === 'forms' && (
          <Box display="flex" flexDirection="column" gap="3rem">
            <Box>
              <Box fontSize="2rem" fontWeight="bold" marginBottom="1rem" color="#1a202c">
                Form Elements
              </Box>
              <Box fontSize="1rem" color="#6b7280" marginBottom="2rem">
                Property rental form components with various input types and layouts
              </Box>

              {/* Property Registration Form */}
              <Box
                backgroundColor="white"
                borderRadius="1rem"
                padding="2rem"
                boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                maxWidth="600px"
                margin="0 auto"
              >
                <Box fontSize="1.5rem" fontWeight="600" marginBottom="2rem" textAlign="center">
                  Property Registration Form
                </Box>
                
                <Box display="flex" flexDirection="column" gap="1.5rem">
                  {/* Text Input */}
                  <Input
                    label="Property Name *"
                    type="text"
                    placeholder="Enter property name"
                    fullWidth
                    variant="outlined"
                  />

                  {/* Select */}
                  <Box>
                    <Box as="label" fontSize="1rem" fontWeight="500" marginBottom="0.5rem" display="block">
                      Property Type *
                    </Box>
                    <Box
                      as="select"
                      width="100%"
                      padding="0.75rem"
                      border="2px solid #e5e7eb"
                      borderRadius="0.5rem"
                      fontSize="1rem"
                      backgroundColor="white"
                    >
                      <option>Select property type</option>
                      <option>Villa</option>
                      <option>Apartment</option>
                      <option>Penthouse</option>
                      <option>Townhouse</option>
                    </Box>
                  </Box>

                  {/* Grid Layout for Numbers */}
                  <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap="1rem">
                    <Input
                      label="Bedrooms"
                      type="number"
                      placeholder="0"
                      fullWidth
                      variant="outlined"
                    />
                    <Input
                      label="Bathrooms"
                      type="number"
                      placeholder="0"
                      fullWidth
                      variant="outlined"
                    />
                  </Box>

                  {/* Textarea */}
                  <Box>
                    <Box as="label" fontSize="1rem" fontWeight="500" marginBottom="0.5rem" display="block">
                      Description
                    </Box>
                    <Box
                      as="textarea"
                      placeholder="Describe your property..."
                      width="100%"
                      minHeight="100px"
                      padding="0.75rem"
                      border="2px solid #e5e7eb"
                      borderRadius="0.5rem"
                      fontSize="1rem"
                      resize="vertical"
                    />
                  </Box>

                  {/* Checkbox Group */}
                  <Box>
                    <Box fontSize="1rem" fontWeight="500" marginBottom="1rem">
                      Amenities
                    </Box>
                    <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap="0.75rem">
                      {['WiFi', 'Pool', 'Gym', 'Parking', 'Kitchen', 'Balcony'].map((amenity) => (
                        <Box key={amenity} display="flex" alignItems="center" gap="0.5rem">
                          <Box as="input" type="checkbox" />
                          <Box fontSize="1rem">{amenity}</Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* Radio Group */}
                  <Box>
                    <Box fontSize="1rem" fontWeight="500" marginBottom="1rem">
                      Booking Type
                    </Box>
                    <Box display="flex" flexDirection="column" gap="0.75rem">
                      {[
                        { value: 'instant', label: 'Instant Book', desc: 'Guests can book immediately' },
                        { value: 'request', label: 'Request to Book', desc: 'You approve each booking' }
                      ].map((option) => (
                        <Box
                          key={option.value}
                          padding="1rem"
                          border="2px solid #e5e7eb"
                          borderRadius="0.5rem"
                          cursor="pointer"
                          whileHover={{ borderColor: '#3182ce' }}
                        >
                          <Box display="flex" alignItems="center" gap="0.75rem">
                            <Box as="input" type="radio" name="bookingType" value={option.value} />
                            <Box>
                              <Box fontSize="1rem" fontWeight="500">{option.label}</Box>
                              <Box fontSize="1rem" color="#6b7280">{option.desc}</Box>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* Submit Button */}
                  <Box marginTop="1rem">
                    <Box
                      as="button"
                      width="100%"
                      padding="1rem"
                      backgroundColor="#3182ce"
                      color="white"
                      border="none"
                      borderRadius="0.5rem"
                      fontSize="1rem"
                      fontWeight="600"
                      cursor="pointer"
                      whileHover={{
                        backgroundColor: '#2563eb',
                        transform: 'translateY(-1px)'
                      }}
                    >
                      Register Property
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translate3d(0, 0, 0); }
          40%, 43% { transform: translate3d(0, -8px, 0); }
          70% { transform: translate3d(0, -4px, 0); }
          90% { transform: translate3d(0, -2px, 0); }
        }
      `}</style>
    </Box>
  )
}

export default BoxExamples