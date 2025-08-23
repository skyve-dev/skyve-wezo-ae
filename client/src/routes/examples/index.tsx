import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Box } from '../../components/base/Box'
import Tab, { TabItem } from '../../components/base/Tab'
import { 
  FaCheckSquare, 
  FaMobileAlt, 
  FaBox, 
  FaHome, 
  FaChartBar, 
  FaBook, 
  FaArrowUp,
  FaSearch,
  FaCalendarAlt,
  FaClock,
  FaSort,
  FaKeyboard,
  FaHandPointer,
  FaComment,
  FaFolderOpen,
  FaCode,
  FaCalendar,
  FaShieldAlt
} from 'react-icons/fa'

export const Route = createFileRoute('/examples/')({
  component: ExamplesIndex,
})

/**
 * Main examples index page showcasing all available component examples
 */
function ExamplesIndex() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const examples = [
    {
      id: 'input',
      title: 'Input',
      description: 'Versatile text input component with icons, validation, and multiple variants',
      icon: <FaKeyboard />,
      color: '#6366f1',
      features: ['Icon Support', 'Size Variants', 'Style Variants', 'Native HTML Attributes'],
      complexity: 'Beginner',
      path: '/examples/input'
    },
    {
      id: 'number-stepper',
      title: 'NumberStepperInput',
      description: 'Mobile-friendly numeric input with increment/decrement buttons and formatting',
      icon: <FaSort />,
      color: '#10b981',
      features: ['Currency Formatting', 'Custom Step Values', 'Min/Max Boundaries', 'Mobile Optimized'],
      complexity: 'Intermediate',
      path: '/examples/number-stepper'
    },
    {
      id: 'selection-picker',
      title: 'SelectionPicker',
      description: 'Versatile selection component for single and multiple choices',
      icon: <FaCheckSquare />,
      color: '#3182ce',
      features: ['Single & Multiple Selection', 'Custom Rendering', 'TypeScript Support', 'Accessibility'],
      complexity: 'Intermediate',
      path: '/examples/selection-picker'
    },
    {
      id: 'sliding-drawer',
      title: 'SlidingDrawer',
      description: 'Full-screen overlay drawers with portal rendering',
      icon: <FaMobileAlt />,
      color: '#059669',
      features: ['Four Slide Directions', 'React Portal', 'Mobile-Friendly', 'Z-Index Management'],
      complexity: 'Advanced',
      path: '/examples/sliding-drawer'
    },
    {
      id: 'date-picker',
      title: 'DatePicker',
      description: 'Calendar-based date selection with validation and constraints',
      icon: <FaCalendarAlt />,
      color: '#8b5cf6',
      features: ['Calendar Interface', 'Date Validation', 'Min/Max Constraints', 'Mobile Drawer'],
      complexity: 'Intermediate',
      path: '/examples/date-picker'
    },
    {
      id: 'time-picker',
      title: 'TimePicker',
      description: 'Intuitive time selection with 12/24-hour formats',
      icon: <FaClock />,
      color: '#ef4444',
      features: ['12/24 Hour Format', 'Custom Intervals', 'Real-time Preview', 'Touch Optimized'],
      complexity: 'Intermediate',
      path: '/examples/time-picker'
    },
    {
      id: 'button',
      title: 'Button',
      description: 'Comprehensive button component with variants, states, and link behavior',
      icon: <FaHandPointer />,
      color: '#dc2626',
      features: ['Multiple Variants', 'Loading States', 'Icon Support', 'Link Behavior'],
      complexity: 'Beginner',
      path: '/examples/button'
    },
    {
      id: 'box',
      title: 'Box Component',
      description: 'Foundation component for layouts, styling, and interactions',
      icon: <FaBox />,
      color: '#f59e0b',
      features: ['Flexbox & Grid', 'Responsive Design', 'Animations', 'Form Elements'],
      complexity: 'Beginner',
      category: 'layout',
      path: '/examples/box'
    },
    {
      id: 'dialog',
      title: 'Dialog',
      description: 'Modal dialog component with animated transitions and accessibility',
      icon: <FaComment />,
      color: '#8b5cf6',
      features: ['Animated Overlays', 'Focus Management', 'Backdrop Controls', 'Portal Rendering'],
      complexity: 'Intermediate',
      category: 'overlay',
      path: '/examples/dialog'
    },
    {
      id: 'tab',
      title: 'Tab',
      description: 'Tabbed interface with animated focus ring and multiple variants',
      icon: <FaFolderOpen />,
      color: '#06b6d4',
      features: ['Animated Focus Ring', 'Multiple Variants', 'Keyboard Navigation', 'Icon Support'],
      complexity: 'Intermediate',
      category: 'navigation',
      path: '/examples/tab'
    },
    {
      id: 'app-shell',
      title: 'AppShell',
      description: 'Complete application shell with navigation, routing, and dialog system',
      icon: <FaShieldAlt />,
      color: '#7c3aed',
      features: ['Type-Safe Routing', 'Responsive Navigation', 'Async Dialogs', 'Splash Screen'],
      complexity: 'Advanced',
      category: 'layout',
      path: '/examples/app-shell'
    }
  ]

  // Add category to existing examples
  const categorizedExamples = examples.map(example => ({
    ...example,
    category: example.category || (
      ['input', 'number-stepper', 'button'].includes(example.id) ? 'form' :
      ['selection-picker', 'date-picker', 'time-picker'].includes(example.id) ? 'input' :
      ['sliding-drawer'].includes(example.id) ? 'overlay' :
      'layout'
    )
  }))

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Beginner': return '#059669'
      case 'Intermediate': return '#f59e0b'
      case 'Advanced': return '#dc2626'
      default: return '#6b7280'
    }
  }

  const filteredExamples = categorizedExamples.filter(example =>
    example.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    example.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    example.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getExamplesByCategory = (category: string) => {
    if (category === 'all') return filteredExamples
    return filteredExamples.filter(example => example.category === category)
  }

  const categoryTabs: TabItem[] = [
    {
      id: 'all',
      label: 'All Components',
      icon: <FaCode />,
      content: (
        <ExampleGrid examples={getExamplesByCategory('all')} navigate={navigate} getComplexityColor={getComplexityColor} />
      )
    },
    {
      id: 'form',
      label: 'Form Controls',
      icon: <FaKeyboard />,
      content: (
        <ExampleGrid examples={getExamplesByCategory('form')} navigate={navigate} getComplexityColor={getComplexityColor} />
      )
    },
    {
      id: 'input',
      label: 'Input Components',
      icon: <FaCalendar />,
      content: (
        <ExampleGrid examples={getExamplesByCategory('input')} navigate={navigate} getComplexityColor={getComplexityColor} />
      )
    },
    {
      id: 'navigation',
      label: 'Navigation',
      icon: <FaFolderOpen />,
      content: (
        <ExampleGrid examples={getExamplesByCategory('navigation')} navigate={navigate} getComplexityColor={getComplexityColor} />
      )
    },
    {
      id: 'overlay',
      label: 'Overlays',
      icon: <FaComment />,
      content: (
        <ExampleGrid examples={getExamplesByCategory('overlay')} navigate={navigate} getComplexityColor={getComplexityColor} />
      )
    },
    {
      id: 'layout',
      label: 'Layout',
      icon: <FaBox />,
      content: (
        <ExampleGrid examples={getExamplesByCategory('layout')} navigate={navigate} getComplexityColor={getComplexityColor} />
      )
    }
  ]

  return (
    <Box minHeight="100vh" backgroundColor="#f8fafc">
      {/* Header */}
      <Box backgroundColor="white" borderBottom="1px solid #e5e7eb" padding="3rem 0">
        <Box maxWidth="1200px" margin="0 auto" padding="0 2rem" textAlign="center">
          <Box fontSize="3.5rem" fontWeight="bold" marginBottom="1rem" color="#1a202c">
            Component Examples
          </Box>
          <Box fontSize="1.25rem" color="#6b7280" marginBottom="2rem" maxWidth="700px" margin="0 auto">
            Explore comprehensive examples of reusable React components designed for property rental applications.
            Each example showcases real-world usage patterns and best practices.
          </Box>
          
          {/* Search */}
          <Box maxWidth="400px" margin="0 auto" position="relative">
            <Box
              as="input"
              type="text"
              placeholder="Search examples..."
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
              width="100%"
              padding="1rem 1rem 1rem 3rem"
              border="2px solid #e5e7eb"
              borderRadius="3rem"
              fontSize="1rem"
              backgroundColor="white"
              whileFocus={{
                borderColor: '#3182ce',
                outline: 'none',
                boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)'
              }}
            />
            <Box
              position="absolute"
              left="1rem"
              top="50%"
              transform="translateY(-50%)"
              fontSize="1.25rem"
              color="#6b7280"
            >
              <FaSearch />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box maxWidth="1200px" margin="0 auto" padding="3rem 2rem">
        {/* Stats */}
        <Box 
          display="grid" 
          gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" 
          gap="1rem" 
          marginBottom="3rem"
        >
          <Box
            backgroundColor="white"
            borderRadius="1rem"
            padding="1.5rem"
            textAlign="center"
            boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
          >
            <Box fontSize="2rem" fontWeight="bold" color="#3182ce" marginBottom="0.5rem">
              {examples.length}
            </Box>
            <Box fontSize="1rem" color="#6b7280">
              Components
            </Box>
          </Box>
          
          <Box
            backgroundColor="white"
            borderRadius="1rem"
            padding="1.5rem"
            textAlign="center"
            boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
          >
            <Box fontSize="2rem" fontWeight="bold" color="#059669" marginBottom="0.5rem">
              20+
            </Box>
            <Box fontSize="1rem" color="#6b7280">
              Use Cases
            </Box>
          </Box>
          
          <Box
            backgroundColor="white"
            borderRadius="1rem"
            padding="1.5rem"
            textAlign="center"
            boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
          >
            <Box fontSize="2rem" fontWeight="bold" color="#f59e0b" marginBottom="0.5rem">
              100%
            </Box>
            <Box fontSize="1rem" color="#6b7280">
              TypeScript
            </Box>
          </Box>
          
          <Box
            backgroundColor="white"
            borderRadius="1rem"
            padding="1.5rem"
            textAlign="center"
            boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
          >
            <Box fontSize="2rem" fontWeight="bold" color="#8b5cf6" marginBottom="0.5rem">
              A11Y
            </Box>
            <Box fontSize="1rem" color="#6b7280">
              Accessible
            </Box>
          </Box>
        </Box>

        {/* Examples Tabs */}
        <Box>
          <Box fontSize="2rem" fontWeight="bold" marginBottom="2rem" color="#1a202c">
            Available Examples
          </Box>
          
          {searchTerm ? (
            // Show filtered results when searching
            filteredExamples.length === 0 ? (
              <Box
                backgroundColor="white"
                borderRadius="1rem"
                padding="3rem"
                textAlign="center"
                boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
              >
                <Box fontSize="3rem" marginBottom="1rem">
                  <FaSearch />
                </Box>
                <Box fontSize="1.25rem" fontWeight="600" marginBottom="0.5rem" color="#374151">
                  No examples found
                </Box>
                <Box fontSize="1rem" color="#6b7280">
                  Try searching for different keywords or browse all examples
                </Box>
              </Box>
            ) : (
              <ExampleGrid examples={filteredExamples} navigate={navigate} getComplexityColor={getComplexityColor} />
            )
          ) : (
            // Show categorized tabs when not searching
            <Tab
              items={categoryTabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              variant="underline"
              size="medium"
              fullWidth
              animationDuration={250}
            />
          )}
        </Box>

        {/* Quick Navigation */}
        <Box marginTop="4rem">
          <Box fontSize="1.5rem" fontWeight="bold" marginBottom="1.5rem" color="#1a202c">
            Quick Navigation
          </Box>
          <Box 
            display="grid" 
            gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" 
            gap="1rem"
          >
            <Link
              to="/register-property"
              style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '1.5rem',
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                textDecoration: 'none',
                color: 'inherit',
                display: 'block'
              }}
            >
              <Box>
                <Box fontSize="2rem" marginBottom="0.5rem">
                  <FaHome />
                </Box>
                <Box fontSize="1rem" fontWeight="600" marginBottom="0.25rem">
                  Property Registration
                </Box>
                <Box fontSize="1rem" color="#6b7280">
                  Try the wizard
                </Box>
              </Box>
            </Link>

            <Link
              to="/dashboard/my-properties"
              style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '1.5rem',
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                textDecoration: 'none',
                color: 'inherit',
                display: 'block'
              }}
            >
              <Box>
                <Box fontSize="2rem" marginBottom="0.5rem">
                  <FaChartBar />
                </Box>
                <Box fontSize="1rem" fontWeight="600" marginBottom="0.25rem">
                  Dashboard
                </Box>
                <Box fontSize="1rem" color="#6b7280">
                  View properties
                </Box>
              </Box>
            </Link>

            <Box
              as="button"
              onClick={() => window.open('https://github.com/anthropics/claude-code', '_blank')}
              backgroundColor="white"
              borderRadius="1rem"
              padding="1.5rem"
              textAlign="center"
              boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
              border="none"
              cursor="pointer"
              whileHover={{
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
              }}
            >
              <Box fontSize="2rem" marginBottom="0.5rem">
                <FaBook />
              </Box>
              <Box fontSize="1rem" fontWeight="600" marginBottom="0.25rem">
                Documentation
              </Box>
              <Box fontSize="1rem" color="#6b7280">
                Learn more
              </Box>
            </Box>

            <Box
              as="button"
              onClick={() => {
                setSearchTerm('')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              backgroundColor="white"
              borderRadius="1rem"
              padding="1.5rem"
              textAlign="center"
              boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
              border="none"
              cursor="pointer"
              whileHover={{
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
              }}
            >
              <Box fontSize="2rem" marginBottom="0.5rem">
                <FaArrowUp />
              </Box>
              <Box fontSize="1rem" fontWeight="600" marginBottom="0.25rem">
                Back to Top
              </Box>
              <Box fontSize="1rem" color="#6b7280">
                Scroll up
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Footer */}
        <Box marginTop="4rem" textAlign="center" padding="2rem 0" borderTop="1px solid #e5e7eb">
          <Box fontSize="1rem" color="#6b7280" marginBottom="1rem">
            Built with React, TypeScript, and the Box component system
          </Box>
          <Box display="flex" justifyContent="center" gap="2rem" fontSize="1rem">
            <Link to="/" style={{ color: '#3182ce', textDecoration: 'none' }}>
              Home
            </Link>
            <Link to="/register-property" style={{ color: '#3182ce', textDecoration: 'none' }}>
              Register Property
            </Link>
            <Link to="/dashboard" style={{ color: '#3182ce', textDecoration: 'none' }}>
              Dashboard
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

// Extracted ExampleGrid component for reusability
function ExampleGrid({ examples, navigate, getComplexityColor }: {
  examples: any[],
  navigate: any,
  getComplexityColor: (complexity: string) => string
}) {
  return (
    <Box 
      display="grid" 
      gridTemplateColumns="repeat(auto-fit, minmax(350px, 1fr))" 
      gap="2rem"
      marginTop="2rem"
    >
      {examples.map((example) => (
        <Box
          key={example.id}
          backgroundColor="white"
          borderRadius="1.5rem"
          overflow="hidden"
          boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
          cursor="pointer"
          whileHover={{
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 25px rgba(0, 0, 0, 0.15)'
          }}
          onClick={() => navigate({ to: example.path })}
        >
          {/* Header */}
          <Box
            padding="2rem 2rem 1rem"
            background={`linear-gradient(135deg, ${example.color} 0%, ${example.color}dd 100%)`}
            color="white"
            position="relative"
          >
            <Box
              position="absolute"
              top="1rem"
              right="1rem"
              padding="0.25rem 0.75rem"
              backgroundColor="white"
              borderRadius="1rem"
              fontSize="1rem"
              fontWeight="600"
              color={getComplexityColor(example.complexity)}
            >
              {example.complexity}
            </Box>
            
            <Box fontSize="3rem" marginBottom="1rem">
              {example.icon}
            </Box>
            <Box fontSize="1.5rem" fontWeight="bold" marginBottom="0.5rem">
              {example.title}
            </Box>
            <Box fontSize="1rem" opacity={0.9}>
              {example.description}
            </Box>
          </Box>

          {/* Content */}
          <Box padding="2rem">
            <Box fontSize="1rem" fontWeight="600" marginBottom="1rem" color="#374151">
              Key Features
            </Box>
            <Box display="flex" flexDirection="column" gap="0.5rem" marginBottom="2rem">
              {example.features.map((feature: string, i: number) => (
                <Box key={i} display="flex" alignItems="center" gap="0.5rem" fontSize="1rem" color="#6b7280">
                  <Box color={example.color}>✓</Box>
                  {feature}
                </Box>
              ))}
            </Box>

            <Link
              to={example.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: example.color,
                color: 'white',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              View Examples
              <span style={{ fontSize: '1rem' }}>→</span>
            </Link>
          </Box>
        </Box>
      ))}
    </Box>
  )
}

export default ExamplesIndex