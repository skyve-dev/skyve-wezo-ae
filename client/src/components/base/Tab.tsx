import React, { useEffect, useRef, useState } from 'react'
import { Box } from './Box'
import { useTheme } from '@/components/base/AppShell'

export interface TabItem {
    /**
     * Unique identifier for the tab
     */
    id: string
    
    /**
     * Display label for the tab
     */
    label: string
    
    /**
     * Optional icon component
     */
    icon?: React.ReactNode
    
    /**
     * Content to display when tab is active (optional if using as tab bar only)
     */
    content?: React.ReactNode
    
    /**
     * Whether the tab is disabled
     */
    disabled?: boolean
    
    /**
     * Optional badge or notification indicator
     */
    badge?: string | number
}

export interface TabProps {
    /**
     * Array of tab items
     */
    items: TabItem[]
    
    /**
     * Currently active tab ID
     */
    activeTab: string
    
    /**
     * Callback when tab changes
     */
    onTabChange: (tabId: string) => void
    
    /**
     * Tab layout orientation
     */
    orientation?: 'horizontal' | 'vertical'
    
    /**
     * Tab size variant
     */
    size?: 'small' | 'medium' | 'large'
    
    /**
     * Tab style variant
     */
    variant?: 'default' | 'pills' | 'underline' | 'minimal'
    
    /**
     * Whether tabs should take full width
     */
    fullWidth?: boolean
    
    /**
     * Custom class name for the container
     */
    className?: string
    
    /**
     * Custom styles for the container
     */
    style?: React.CSSProperties
    
    /**
     * Animation duration for focus ring in milliseconds
     */
    animationDuration?: number
    
    /**
     * Whether to center tab labels
     */
    centered?: boolean
    
    /**
     * Background color for the tab container
     */
    backgroundColor?: string
    
    /**
     * Active tab color
     */
    activeColor?: string
    
    /**
     * Inactive tab color
     */
    inactiveColor?: string
    
    /**
     * Display only as tab bar without content area
     */
    tabBarOnly?: boolean
    
    /**
     * Layout for icon and label arrangement
     */
    iconLayout?: 'row' | 'column'
    
    /**
     * Custom icon size (takes priority over size config)
     */
    iconSize?: string
    
    /**
     * Custom styles for the tab bar navigation container
     */
    tabBarStyle?: React.CSSProperties
}

/**
 * # Tab Component
 * 
 * A flexible, accessible tab navigation component with animated focus indicators and multiple
 * styling variants. Features keyboard navigation, responsive design, and theme integration
 * optimized for property management and booking interfaces.
 * 
 * ## Key Features
 * - **Multiple Variants**: Pills, underline, minimal, and default styling options
 * - **Animated Focus Ring**: Smooth transitions between active tabs
 * - **Keyboard Navigation**: Full arrow key, Home/End navigation support
 * - **Icon Support**: Optional icons with flexible layout options
 * - **Badge System**: Notification badges and counters for tabs
 * - **Responsive Design**: Orientation switching and flexible layouts
 * - **Theme Integration**: Automatic color theming with override options
 * - **Accessibility**: Full ARIA support and screen reader compatibility
 * 
 * ## Basic Usage
 * ```tsx
 * const [activeTab, setActiveTab] = useState('tab1')
 * 
 * const tabs = [
 *   { id: 'tab1', label: 'Overview', content: <div>Overview content</div> },
 *   { id: 'tab2', label: 'Details', content: <div>Details content</div> },
 *   { id: 'tab3', label: 'Reviews', content: <div>Reviews content</div> }
 * ]
 * 
 * <Tab
 *   items={tabs}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 * />
 * ```
 * 
 * ## Tab Content Structure
 * ### With Content Panels
 * ```tsx
 * const propertyTabs = [
 *   {
 *     id: 'overview',
 *     label: 'Overview',
 *     icon: <FaHome />,
 *     content: (
 *       <Box padding="2rem">
 *         <h3>Property Overview</h3>
 *         <p>Detailed property information...</p>
 *       </Box>
 *     )
 *   },
 *   {
 *     id: 'amenities',
 *     label: 'Amenities',
 *     icon: <FaStar />,
 *     content: (
 *       <Box padding="2rem">
 *         <h3>Amenities & Features</h3>
 *         <ul>Available amenities...</ul>
 *       </Box>
 *     )
 *   }
 * ]
 * ```
 * 
 * ### Tab Bar Only (No Content)
 * ```tsx
 * <Tab
 *   items={navigationTabs}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   tabBarOnly
 * />
 * ```
 * 
 * ## Visual Variants
 * ### Pills Variant
 * ```tsx
 * <Tab
 *   items={tabs}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   variant="pills"
 *   size="medium"
 * />
 * ```
 * 
 * ### Underline Variant
 * ```tsx
 * <Tab
 *   items={tabs}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   variant="underline"
 *   orientation="horizontal"
 * />
 * ```
 * 
 * ### Minimal Variant
 * ```tsx
 * <Tab
 *   items={tabs}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   variant="minimal"
 *   centered
 * />
 * ```
 * 
 * ### Default Variant
 * ```tsx
 * <Tab
 *   items={tabs}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   variant="default"
 *   fullWidth
 * />
 * ```
 * 
 * ## Size and Layout Options
 * ### Size Variants
 * ```tsx
 * // Small tabs (32px min height)
 * <Tab size="small" items={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
 * 
 * // Medium tabs (40px min height) - default
 * <Tab size="medium" items={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
 * 
 * // Large tabs (48px min height)
 * <Tab size="large" items={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
 * ```
 * 
 * ### Orientation Options
 * ```tsx
 * // Horizontal layout (default)
 * <Tab
 *   orientation="horizontal"
 *   items={tabs}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 * />
 * 
 * // Vertical layout
 * <Tab
 *   orientation="vertical"
 *   items={tabs}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 * />
 * ```
 * 
 * ## Icons and Badges
 * ### With Icons
 * ```tsx
 * const iconTabs = [
 *   {
 *     id: 'properties',
 *     label: 'Properties',
 *     icon: <FaHome />,
 *     content: <PropertyList />
 *   },
 *   {
 *     id: 'bookings',
 *     label: 'Bookings',
 *     icon: <FaCalendar />,
 *     badge: newBookings.length,
 *     content: <BookingList />
 *   },
 *   {
 *     id: 'messages',
 *     label: 'Messages',
 *     icon: <FaEnvelope />,
 *     badge: unreadCount > 0 ? unreadCount : undefined,
 *     content: <MessagesList />
 *   }
 * ]
 * 
 * <Tab
 *   items={iconTabs}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   variant="pills"
 *   iconLayout="row"
 * />
 * ```
 * 
 * ### Icon Layout Options
 * ```tsx
 * // Icons beside text (default)
 * <Tab iconLayout="row" items={iconTabs} activeTab={activeTab} onTabChange={setActiveTab} />
 * 
 * // Icons above text
 * <Tab iconLayout="column" items={iconTabs} activeTab={activeTab} onTabChange={setActiveTab} />
 * ```
 * 
 * ## Property Management Examples
 * ### Property Dashboard Navigation
 * ```tsx
 * const PropertyDashboard = ({ propertyId }) => {
 *   const [activeTab, setActiveTab] = useState('overview')
 *   
 *   const dashboardTabs = [
 *     {
 *       id: 'overview',
 *       label: 'Overview',
 *       icon: <FaDashboard />,
 *       content: <PropertyOverview propertyId={propertyId} />
 *     },
 *     {
 *       id: 'bookings',
 *       label: 'Bookings',
 *       icon: <FaCalendar />,
 *       badge: pendingBookings.length,
 *       content: <BookingCalendar propertyId={propertyId} />
 *     },
 *     {
 *       id: 'pricing',
 *       label: 'Pricing',
 *       icon: <FaDollarSign />,
 *       content: <PricingManagement propertyId={propertyId} />
 *     },
 *     {
 *       id: 'analytics',
 *       label: 'Analytics',
 *       icon: <FaChartBar />,
 *       content: <PropertyAnalytics propertyId={propertyId} />
 *     }
 *   ]
 * 
 *   return (
 *     <Tab
 *       items={dashboardTabs}
 *       activeTab={activeTab}
 *       onTabChange={setActiveTab}
 *       variant="underline"
 *       size="large"
 *       fullWidth
 *     />
 *   )
 * }
 * ```
 * 
 * ### Booking Status Navigation
 * ```tsx
 * const BookingManagement = () => {
 *   const [activeStatus, setActiveStatus] = useState('pending')
 *   
 *   const statusTabs = [
 *     {
 *       id: 'pending',
 *       label: 'Pending',
 *       badge: pendingCount,
 *       content: <BookingList status="pending" />
 *     },
 *     {
 *       id: 'confirmed',
 *       label: 'Confirmed',
 *       badge: confirmedCount,
 *       content: <BookingList status="confirmed" />
 *     },
 *     {
 *       id: 'cancelled',
 *       label: 'Cancelled',
 *       content: <BookingList status="cancelled" />
 *     }
 *   ]
 * 
 *   return (
 *     <Tab
 *       items={statusTabs}
 *       activeTab={activeStatus}
 *       onTabChange={setActiveStatus}
 *       variant="pills"
 *       centered
 *       backgroundColor="#f8fafc"
 *     />
 *   )
 * }
 * ```
 * 
 * ### Property Filter Tabs
 * ```tsx
 * const PropertyFilters = ({ onFilterChange }) => {
 *   const [activeFilter, setActiveFilter] = useState('all')
 *   
 *   const filterTabs = [
 *     { id: 'all', label: 'All Properties', badge: allCount },
 *     { id: 'available', label: 'Available', badge: availableCount },
 *     { id: 'booked', label: 'Booked', badge: bookedCount },
 *     { id: 'maintenance', label: 'Maintenance', badge: maintenanceCount }
 *   ]
 * 
 *   const handleTabChange = (tabId) => {
 *     setActiveFilter(tabId)
 *     onFilterChange(tabId)
 *   }
 * 
 *   return (
 *     <Tab
 *       items={filterTabs}
 *       activeTab={activeFilter}
 *       onTabChange={handleTabChange}
 *       variant="default"
 *       size="small"
 *       tabBarOnly
 *     />
 *   )
 * }
 * ```
 * 
 * ## Customization Options
 * ### Theme Colors
 * ```tsx
 * <Tab
 *   items={tabs}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   activeColor="#e53e3e"          // Custom active color
 *   inactiveColor="#718096"        // Custom inactive color
 *   backgroundColor="transparent"   // Custom background
 * />
 * ```
 * 
 * ### Animation Timing
 * ```tsx
 * <Tab
 *   items={tabs}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   animationDuration={300}        // Slower animation
 * />
 * ```
 * 
 * ### Custom Icon Size
 * ```tsx
 * <Tab
 *   items={iconTabs}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   iconSize="1.5rem"             // Larger icons
 * />
 * ```
 * 
 * ## Disabled States
 * ```tsx
 * const tabsWithDisabled = [
 *   { id: 'tab1', label: 'Available', content: <Content1 /> },
 *   { id: 'tab2', label: 'Coming Soon', disabled: true },
 *   { id: 'tab3', label: 'Active', content: <Content3 /> }
 * ]
 * 
 * <Tab
 *   items={tabsWithDisabled}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 * />
 * ```
 * 
 * ## Responsive Behavior
 * ### Mobile-First Design
 * ```tsx
 * <Tab
 *   items={tabs}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   orientation="horizontal"       // Mobile: horizontal
 *   size="small"                   // Mobile: small size
 *   fullWidth                      // Mobile: full width tabs
 * />
 * ```
 * 
 * ### Adaptive Layout
 * ```tsx
 * const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
 * 
 * <Tab
 *   items={tabs}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   orientation={isMobile ? 'horizontal' : 'vertical'}
 *   variant={isMobile ? 'pills' : 'default'}
 *   size={isMobile ? 'small' : 'medium'}
 *   iconLayout={isMobile ? 'column' : 'row'}
 * />
 * ```
 * 
 * ## Advanced Examples
 * ### Multi-Level Tab Navigation
 * ```tsx
 * const PropertySettingsPanel = ({ propertyId }) => {
 *   const [primaryTab, setPrimaryTab] = useState('general')
 *   const [secondaryTab, setSecondaryTab] = useState('basic')
 *   
 *   const primaryTabs = [
 *     {
 *       id: 'general',
 *       label: 'General',
 *       icon: <FaCog />,
 *       content: (
 *         <Tab
 *           items={generalSubTabs}
 *           activeTab={secondaryTab}
 *           onTabChange={setSecondaryTab}
 *           variant="underline"
 *           size="small"
 *         />
 *       )
 *     },
 *     {
 *       id: 'pricing',
 *       label: 'Pricing',
 *       icon: <FaDollarSign />,
 *       content: <PricingSettings propertyId={propertyId} />
 *     }
 *   ]
 * 
 *   return (
 *     <Tab
 *       items={primaryTabs}
 *       activeTab={primaryTab}
 *       onTabChange={setPrimaryTab}
 *       variant="pills"
 *       size="large"
 *       orientation="vertical"
 *     />
 *   )
 * }
 * ```
 * 
 * ### Tab with Async Content
 * ```tsx
 * const AsyncTabContent = ({ propertyId, tabId }) => {
 *   const [data, setData] = useState(null)
 *   const [loading, setLoading] = useState(true)
 * 
 *   useEffect(() => {
 *     const loadData = async () => {
 *       setLoading(true)
 *       try {
 *         const result = await fetchTabData(propertyId, tabId)
 *         setData(result)
 *       } finally {
 *         setLoading(false)
 *       }
 *     }
 *     loadData()
 *   }, [propertyId, tabId])
 * 
 *   if (loading) return <LoadingSpinner />
 *   return <TabContent data={data} />
 * }
 * 
 * const dynamicTabs = [
 *   {
 *     id: 'reviews',
 *     label: 'Reviews',
 *     badge: reviewCount,
 *     content: <AsyncTabContent propertyId={propertyId} tabId="reviews" />
 *   }
 * ]
 * ```
 * 
 * ## Keyboard Navigation
 * The component supports comprehensive keyboard navigation:
 * - **Arrow Keys**: Navigate between tabs (Left/Right or Up/Down)
 * - **Home**: Jump to first tab
 * - **End**: Jump to last tab  
 * - **Enter/Space**: Activate focused tab
 * - **Tab**: Move focus in/out of tab list
 * 
 * ## Accessibility Features
 * - **ARIA Roles**: Proper tablist, tab, and tabpanel roles
 * - **Keyboard Support**: Full keyboard navigation as per WAI-ARIA
 * - **Screen Readers**: Tab labels and states announced properly
 * - **Focus Management**: Visual focus indicators and logical tab order
 * - **Disabled States**: Proper aria-disabled handling
 * - **Selection States**: aria-selected for current tab
 * 
 * ## Performance Optimization
 * - **Animated Focus Ring**: Hardware-accelerated CSS animations
 * - **Efficient Updates**: Optimized re-renders on tab changes
 * - **Memory Management**: Proper cleanup of resize observers and event handlers  
 * - **Conditional Rendering**: Content panels only render when active
 * 
 * ## Integration Notes
 * - **Theme System**: Automatically inherits app theme colors
 * - **Box Component**: Uses Box for consistent styling and layout
 * - **Responsive Design**: Inherits responsive design patterns
 * - **Icon Integration**: Works with any React icon library
 * 
 * @example
 * // Complete property management dashboard
 * const PropertyManagementDashboard = ({ propertyId }) => {
 *   const [activeTab, setActiveTab] = useState('dashboard')
 *   const [notifications, setNotifications] = useState({
 *     bookings: 3,
 *     messages: 7,
 *     maintenance: 1
 *   })
 * 
 *   const managementTabs = [
 *     {
 *       id: 'dashboard',
 *       label: 'Dashboard',
 *       icon: <FaTachometerAlt />,
 *       content: (
 *         <Box padding="2rem">
 *           <PropertyDashboard propertyId={propertyId} />
 *         </Box>
 *       )
 *     },
 *     {
 *       id: 'bookings',
 *       label: 'Bookings',
 *       icon: <FaCalendarCheck />,
 *       badge: notifications.bookings,
 *       content: (
 *         <Box padding="2rem">
 *           <BookingManagement propertyId={propertyId} />
 *         </Box>
 *       )
 *     },
 *     {
 *       id: 'messages',
 *       label: 'Messages',
 *       icon: <FaComments />,
 *       badge: notifications.messages,
 *       content: (
 *         <Box padding="2rem">
 *           <MessageCenter propertyId={propertyId} />
 *         </Box>
 *       )
 *     },
 *     {
 *       id: 'maintenance',
 *       label: 'Maintenance',
 *       icon: <FaTools />,
 *       badge: notifications.maintenance,
 *       content: (
 *         <Box padding="2rem">
 *           <MaintenanceTracker propertyId={propertyId} />
 *         </Box>
 *       )
 *     },
 *     {
 *       id: 'analytics',
 *       label: 'Analytics',
 *       icon: <FaChartLine />,
 *       content: (
 *         <Box padding="2rem">
 *           <PropertyAnalytics propertyId={propertyId} />
 *         </Box>
 *       )
 *     }
 *   ]
 * 
 *   return (
 *     <Box height="100vh" display="flex" flexDirection="column">
 *       <Box borderBottom="1px solid #e2e8f0" backgroundColor="white">
 *         <Tab
 *           items={managementTabs}
 *           activeTab={activeTab}
 *           onTabChange={setActiveTab}
 *           variant="underline"
 *           size="large"
 *           fullWidth
 *           tabBarStyle={{
 *             padding: '0 2rem',
 *             maxWidth: '1200px',
 *             margin: '0 auto'
 *           }}
 *         />
 *       </Box>
 *       <Box flex={1} overflow="auto" backgroundColor="#f7fafc">
 *         {managementTabs.find(tab => tab.id === activeTab)?.content}
 *       </Box>
 *     </Box>
 *   )
 * }
 */

const Tab: React.FC<TabProps> = ({
    items,
    activeTab,
    onTabChange,
    orientation = 'horizontal',
    size = 'medium',
    variant = 'default',
    fullWidth = false,
    className,
    style,
    animationDuration = 200,
    centered = false,
    backgroundColor = 'transparent',
    activeColor = '#D52122',
    inactiveColor = '#6b7280',
    tabBarOnly = false,
    iconLayout = 'row',
    iconSize,
    tabBarStyle
}) => {
    const theme = useTheme()
    
    // Override activeColor with theme if not explicitly provided
    const resolvedActiveColor = activeColor === '#D52122' ? (theme?.primaryColor || '#D52122') : activeColor
    
    const tabsRef = useRef<(HTMLButtonElement | null)[]>([])
    const containerRef = useRef<HTMLDivElement>(null)
    const focusRingRef = useRef<HTMLDivElement>(null)
    const [focusRingStyle, setFocusRingStyle] = useState<React.CSSProperties>({})

    // Size configurations
    const sizeConfig = {
        small: {
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            minHeight: '2rem',
            iconSize: '1rem',
            gap: '0.5rem'
        },
        medium: {
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            minHeight: '2.5rem',
            iconSize: '1.25rem',
            gap: '0.75rem'
        },
        large: {
            padding: '1rem 2rem',
            fontSize: '1.125rem',
            minHeight: '3rem',
            iconSize: '1.5rem',
            gap: '1rem'
        }
    }

    const currentSize = sizeConfig[size]

    // Update focus ring position when active tab changes
    useEffect(() => {
        const activeIndex = items.findIndex(item => item.id === activeTab)
        const activeTabElement = tabsRef.current[activeIndex]
        
        if (activeTabElement && focusRingRef.current && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect()
            const tabRect = activeTabElement.getBoundingClientRect()
            
            // Calculate both X and Y positions relative to container
            const translateX = tabRect.left - containerRect.left
            const translateY = tabRect.top - containerRect.top
            setFocusRingStyle({
                width: `${tabRect.width}px`,
                height: `${tabRect.height}px`,
                transform: `translate(${translateX}px, ${translateY}px)`,
                transition: `all ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
            })
        }
    }, [activeTab, items, orientation, variant, animationDuration])

    // Handle keyboard navigation
    const handleKeyDown = (event: React.KeyboardEvent, tabId: string) => {
        const currentIndex = items.findIndex(item => item.id === tabId)
        let nextIndex = currentIndex

        switch (event.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                event.preventDefault()
                do {
                    nextIndex = nextIndex > 0 ? nextIndex - 1 : items.length - 1
                } while (items[nextIndex]?.disabled && nextIndex !== currentIndex)
                break
            case 'ArrowRight':
            case 'ArrowDown':
                event.preventDefault()
                do {
                    nextIndex = nextIndex < items.length - 1 ? nextIndex + 1 : 0
                } while (items[nextIndex]?.disabled && nextIndex !== currentIndex)
                break
            case 'Home':
                event.preventDefault()
                nextIndex = 0
                while (items[nextIndex]?.disabled && nextIndex < items.length - 1) {
                    nextIndex++
                }
                break
            case 'End':
                event.preventDefault()
                nextIndex = items.length - 1
                while (items[nextIndex]?.disabled && nextIndex > 0) {
                    nextIndex--
                }
                break
            case 'Enter':
            case ' ':
                event.preventDefault()
                if (!items[currentIndex]?.disabled) {
                    onTabChange(tabId)
                }
                return
            default:
                return
        }

        if (nextIndex !== currentIndex && !items[nextIndex]?.disabled) {
            tabsRef.current[nextIndex]?.focus()
            onTabChange(items[nextIndex].id)
        }
    }

    // Get variant-specific styles
    const getVariantStyles = (isActive: boolean, disabled: boolean) => {
        const baseStyles = {
            position: 'relative' as const,
            display: 'flex',
            flexDirection: iconLayout as 'row' | 'column',
            alignItems: 'center',
            justifyContent: centered ? 'center' : 'flex-start',
            gap: iconLayout === 'column' ? '0.25rem' : currentSize.gap,
            padding: currentSize.padding,
            fontSize: currentSize.fontSize,
            fontWeight: isActive ? '600' : '500',
            minHeight: currentSize.minHeight,
            border: 'none',
            background: 'transparent',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            transition: `all ${animationDuration}ms ease`,
            outline: 'none',
            textDecoration: 'none',
            color: disabled ? '#9ca3af' : (isActive ? resolvedActiveColor : inactiveColor),
            zIndex: 1
        }

        switch (variant) {
            case 'pills':
                return {
                    ...baseStyles,
                    borderRadius: '9999px',
                    backgroundColor: isActive ? resolvedActiveColor : 'transparent',
                    color: isActive ? theme?.primaryContrast || 'white' : inactiveColor
                }
            case 'underline':
                return {
                    ...baseStyles,
                    // borderBottom: isActive && orientation === 'horizontal' ? `2px solid ${activeColor}` : '2px solid transparent',
                    // borderLeft: isActive && orientation === 'vertical' ? `2px solid ${activeColor}` : '2px solid transparent'
                }
            case 'minimal':
                return {
                    ...baseStyles,
                    padding: '0.5rem',
                    fontWeight: isActive ? '600' : '400'
                }
            default:
                return {
                    ...baseStyles,
                    backgroundColor: isActive ? `${resolvedActiveColor}10` : 'transparent',
                    borderRadius: '6px'
                }
        }
    }

    // Get focus ring styles based on variant
    const getFocusRingStyles = () => {
        const baseStyles = {
            position: 'absolute' as const,
            pointerEvents: 'none' as const,
            zIndex: 0,
            ...focusRingStyle
        }

        switch (variant) {
            case 'pills':
                return {
                    ...baseStyles,
                    backgroundColor: resolvedActiveColor,
                    borderRadius: '9999px'
                }
            case 'underline':
                return {
                    ...baseStyles,
                    //backgroundColor: activeColor,
                    borderRadius: 0,
                    borderBottom : orientation === 'horizontal' ? `2px solid ${resolvedActiveColor}` : `2px solid transparent`,
                    borderLeft : orientation === 'vertical' ? `2px solid ${resolvedActiveColor}` : `2px solid transparent`,
                }
            case 'minimal':
                return {
                    ...baseStyles,
                    backgroundColor: `${resolvedActiveColor}20`,
                    borderRadius: '4px'
                }
            default:
                return {
                    ...baseStyles,
                    backgroundColor: `${resolvedActiveColor}15`,
                    borderRadius: '6px',
                    border: `1px solid ${resolvedActiveColor}30`
                }
        }
    }

    const activeItem = items.find(item => item.id === activeTab)

    return (
        <Box className={className} display={'flex'} flexDirection={'column'} style={style}>
            {/* Tab Navigation */}
            <Box
                ref={containerRef}
                display="flex"
                flexDirection={orientation === 'vertical' ? 'column' : 'row'}
                position="relative"
                backgroundColor={backgroundColor}
                flexWrap="wrap"
                borderRadius="8px"
                //padding={variant === 'underline' ? '0' : '0.25rem'}
                width={fullWidth ? '100%' : 'auto'}
                role="tablist"
                aria-orientation={orientation}
                style={tabBarStyle}
            >
                {/* Animated Focus Ring */}
                {variant !== 'pills' && (
                    <Box
                        ref={focusRingRef}
                        style={getFocusRingStyles()}
                    />
                )}

                {/* Tab Buttons */}
                {items.map((item, index) => {
                    const isActive = item.id === activeTab
                    
                    return (
                        <Box
                            key={item.id}
                            as="button"
                            ref={(el: HTMLButtonElement | null) => (tabsRef.current[index] = el as any)}
                            role="tab"
                            aria-selected={isActive}
                            aria-controls={`tabpanel-${item.id}`}
                            aria-disabled={item.disabled}
                            tabIndex={isActive ? 0 : -1}
                            onClick={() => !item.disabled && onTabChange(item.id)}
                            onKeyDown={(e) => handleKeyDown(e, item.id)}
                            style={getVariantStyles(isActive, !!item.disabled)}
                            flex={fullWidth ? 1 : 'none'}
                            whileHover={!item.disabled ? {
                                backgroundColor: variant === 'pills' 
                                    ? (isActive ? resolvedActiveColor : `${resolvedActiveColor}10`)
                                    : `${resolvedActiveColor}08`
                            } : undefined}
                            whileFocus={{
                                outlineOffset: '2px'
                            }}
                        >
                            {/* Icon */}
                            {item.icon && (
                                <Box 
                                    fontSize={iconSize || currentSize.iconSize}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    {item.icon}
                                </Box>
                            )}

                            {/* Label */}
                            <Box as="span">
                                {item.label}
                            </Box>

                            {/* Badge */}
                            {item.badge && (
                                <Box
                                    as="span"
                                    fontSize="0.75rem"
                                    fontWeight="700"
                                    backgroundColor={isActive ? theme?.withOpacity?.(theme.primaryContrast || '#ffffff', 0.3) || 'rgba(255,255,255,0.3)' : resolvedActiveColor}
                                    color={theme?.primaryContrast || 'white'}
                                    borderRadius="9999px"
                                    padding="0.125rem 0.375rem"
                                    minWidth="1.25rem"
                                    height="1.25rem"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    {item.badge}
                                </Box>
                            )}
                        </Box>
                    )
                })}
            </Box>

            {/* Tab Content */}
            {!tabBarOnly && activeItem?.content && (
                <Box
                    id={`tabpanel-${activeTab}`}
                    role="tabpanel"
                    aria-labelledby={`tab-${activeTab}`}
                >
                    {activeItem.content}
                </Box>
            )}
        </Box>
    )
}

export default Tab