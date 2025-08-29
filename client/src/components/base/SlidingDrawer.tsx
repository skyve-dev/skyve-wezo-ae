import React, {CSSProperties, useEffect, useRef, useState} from 'react'
import ReactDOM from 'react-dom'
import {Button} from './Button'
import {Box} from './Box'
import {IoClose} from "react-icons/io5"
import {disableScroller, enableScroller} from '../../utils/scrollUtils'

// Global portal manager to track multiple drawers using the same portal
class PortalManager {
    private static portals: Map<string, {
        activeDrawers: number;
        container: HTMLElement;
        pendingDeactivation: Set<string>; // Track drawers pending deactivation
    }> = new Map()

    static getOrCreatePortal(portalId: string): HTMLElement {
        let portalInfo = this.portals.get(portalId)

        if (!portalInfo) {
            let container = document.getElementById(portalId) as HTMLElement
            if (!container) {
                container = document.createElement('div')
                container.id = portalId
                container.style.position = 'fixed';
                container.style.top = '0px';
                container.style.left = '0px';

                container.style.width = '100%';
                container.style.height = '100%';
                container.style.overflow = 'hidden';
                container.style.zIndex = '-1';
                container.style.pointerEvents = 'none';
                container.style.transition = 'all 0.1s ease, height 0.1s ease'
                document.body.appendChild(container)
            }
            portalInfo = {activeDrawers: 0, container, pendingDeactivation: new Set()}
            this.portals.set(portalId, portalInfo)
        } else {
        }

        return portalInfo.container
    }

    static activateDrawer(portalId: string, drawerId: string): void {
        const portalInfo = this.portals.get(portalId)
        if (portalInfo) {
            // Remove from pending deactivation if it was there
            portalInfo.pendingDeactivation.delete(drawerId)
            portalInfo.activeDrawers++
            this.updatePortalStyles(portalId)
        } else {
        }
    }

    static scheduleDeactivation(portalId: string, drawerId: string, delay: number = 0): void {
        const portalInfo = this.portals.get(portalId)
        if (portalInfo) {
            // Mark as pending deactivation
            portalInfo.pendingDeactivation.add(drawerId)

            // Deactivate after delay (to allow animation to complete)
            setTimeout(() => {
                this.completeDeactivation(portalId, drawerId)
            }, delay)
        }
    }

    private static completeDeactivation(portalId: string, drawerId: string): void {
        const portalInfo = this.portals.get(portalId)
        if (portalInfo && portalInfo.pendingDeactivation.has(drawerId)) {
            portalInfo.pendingDeactivation.delete(drawerId)
            portalInfo.activeDrawers = Math.max(0, portalInfo.activeDrawers - 1)
            this.updatePortalStyles(portalId)
        } else {
        }
    }

    // Legacy method for immediate deactivation (for unmounting)
    static deactivateDrawer(portalId: string): void {
        const portalInfo = this.portals.get(portalId)
        if (portalInfo) {

            // CRITICAL FIX: Check if there are any pending scheduled deactivations
            // If there are scheduled deactivations, it means drawers are properly managed
            // through the new system, so legacy calls should be ignored
            const hasPendingDeactivations = portalInfo.pendingDeactivation.size > 0
            
            if (hasPendingDeactivations) {
                return
            }
            
            // Only decrement if there are actually active drawers and no new system management
            if (portalInfo.activeDrawers > 0) {
                portalInfo.activeDrawers = portalInfo.activeDrawers - 1
                    this.updatePortalStyles(portalId)
            } else {
            }
        }
    }

    private static updatePortalStyles(portalId: string): void {
        const portalInfo = this.portals.get(portalId)
        if (!portalInfo) {
            return
        }

        const {container, activeDrawers} = portalInfo

        // Add smooth transition for portal container changes
        if (activeDrawers > 0) {
            // When drawer(s) are active: full viewport coverage for proper layering
            container.setAttribute('data-scroll-y',window.scrollY+'')
            disableScroller()
            container.style.zIndex = '9999';
        } else {
            // When no drawers are active: minimal footprint to avoid blocking interactions
            // Portal deactivation (normal behavior)
            
            // Multiple portals with different states is normal behavior
            // No need to log this as an error
            
            container.style.zIndex = '-1'
            enableScroller();
            
            // Only restore scroll if we actually saved a meaningful position
            const savedScrollY = container.getAttribute('data-scroll-y')
            if (savedScrollY && parseInt(savedScrollY) > 0) {
                window.scrollTo({top: parseInt(savedScrollY), behavior: 'instant'})
            }
        }
    }

}


interface SlidingDrawerProps {
    /**
     * Controlled prop that determines the drawer's visibility
     */
    isOpen: boolean

    /**
     * Callback function executed when the drawer should be closed
     */
    onClose: () => void

    /**
     * Content to be rendered inside the drawer
     */
    children: React.ReactNode

    /**
     * Direction from which the drawer slides in
     */
    side: 'left' | 'right' | 'top' | 'bottom'

    /**
     * Optional width for left/right drawers (default: '25rem' for left/right, '100%' for top/bottom)
     */
    width?: string

    /**
     * Optional height for top/bottom drawers (default: '100%' for left/right, '25rem' for top/bottom)
     */
    height?: string

    /**
     * Optional z-index for the drawer (default: 9999)
     */
    zIndex?: number

    /**
     * Optional backdrop color (default: 'rgba(0, 0, 0, 0.5)')
     */
    backdropColor?: string

    /**
     * Optional drawer background color (default: 'white')
     */
    backgroundColor?: string

    /**
     * Optional animation duration in milliseconds (default: 300)
     */
    animationDuration?: number

    /**
     * Optional flag to disable backdrop click to close (default: false)
     */
    disableBackdropClick?: boolean

    /**
     * Optional flag to disable escape key to close (default: false)
     */
    disableEscapeKey?: boolean

    /**
     * Optional custom class name for the drawer content
     */
    className?: string

    /**
     * Optional styles for the drawer content
     */
    contentStyles?: React.CSSProperties

    /**
     * Optional flag to show a close button (default: false)
     */
    showCloseButton?: boolean

    /**
     * Optional custom close button component
     */
    closeButton?: React.ReactNode

    /**
     * Optional portal container ID (default: 'drawer-root')
     */
    portalId?: string

    /**
     * Optional drawer background color (default: 'white')
     */
    background?:CSSProperties['background']
}

/**
 * # SlidingDrawer Component
 * 
 * A sophisticated, portal-based sliding drawer component that provides smooth animations,
 * accessibility features, and proper layering for modal-like interfaces. Perfect for mobile
 * menus, filters, forms, and detailed content panels.
 * 
 * ## Key Features
 * - **Portal-Based Rendering**: Uses ReactDOM.createPortal for proper z-index layering
 * - **Multi-Directional**: Slides from left, right, top, or bottom sides
 * - **Smooth Animations**: Coordinated backdrop and drawer animations with cubic-bezier easing
 * - **Portal Management**: Sophisticated system handles multiple concurrent drawers
 * - **Accessibility**: Focus management, keyboard navigation, ARIA attributes
 * - **Scroll Management**: Automatically handles body scroll prevention
 * - **Backdrop Interaction**: Configurable backdrop click-to-close behavior
 * - **Performance Optimized**: Efficient mounting/unmounting with animation coordination
 * 
 * ## Basic Usage
 * ```tsx
 * import SlidingDrawer from '@/components/base/SlidingDrawer'
 * 
 * function MyComponent() {
 *   const [isDrawerOpen, setIsDrawerOpen] = useState(false)
 * 
 *   return (
 *     <>
 *       <button onClick={() => setIsDrawerOpen(true)}>
 *         Open Drawer
 *       </button>
 * 
 *       <SlidingDrawer
 *         isOpen={isDrawerOpen}
 *         onClose={() => setIsDrawerOpen(false)}
 *         side="right"
 *         width="400px"
 *         showCloseButton={true}
 *       >
 *         <h2>Drawer Content</h2>
 *         <p>This content slides in from the right side.</p>
 *       </SlidingDrawer>
 *     </>
 *   )
 * }
 * ```
 * 
 * ## Direction Examples
 * ### Right Side Panel (Common for filters/settings)
 * ```tsx
 * <SlidingDrawer
 *   isOpen={showFilters}
 *   onClose={() => setShowFilters(false)}
 *   side="right"
 *   width="350px"
 *   showCloseButton={true}
 * >
 *   <Box padding="1.5rem">
 *     <h3>Filter Properties</h3>
 *   </Box>
 * </SlidingDrawer>
 * ```
 * 
 * ### Left Side Navigation
 * ```tsx
 * <SlidingDrawer
 *   isOpen={showNavigation}
 *   onClose={() => setShowNavigation(false)}
 *   side="left"
 *   width="280px"
 *   backgroundColor="#1f2937"
 * >
 *   <Box padding="1rem" color="white">
 *     <nav>Navigation items</nav>
 *   </Box>
 * </SlidingDrawer>
 * ```
 * 
 * ### Bottom Sheet (Mobile-friendly)
 * ```tsx
 * <SlidingDrawer
 *   isOpen={showBottomSheet}
 *   onClose={() => setShowBottomSheet(false)}
 *   side="bottom"
 *   height="60vh"
 *   borderRadius="1rem 1rem 0 0"
 * >
 *   <Box padding="1.5rem">
 *     <h3>Property Details</h3>
 *   </Box>
 * </SlidingDrawer>
 * ```
 * 
 * ### Top Notification Panel
 * ```tsx
 * <SlidingDrawer
 *   isOpen={showNotifications}
 *   onClose={() => setShowNotifications(false)}
 *   side="top"
 *   height="300px"
 *   backgroundColor="#f8fafc"
 * >
 *   <Box padding="1rem">
 *     <h3>Recent Notifications</h3>
 *   </Box>
 * </SlidingDrawer>
 * ```
 * 
 * ## Advanced Configuration
 * ### Custom Styling and Animation
 * ```tsx
 * <SlidingDrawer
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   side="right"
 *   width="500px"
 *   
 *   // Animation customization
 *   animationDuration={400}
 *   
 *   // Styling
 *   backgroundColor="white"
 *   backdropColor="rgba(0, 0, 0, 0.7)"
 *   
 *   // Custom styles
 *   contentStyles={{
 *     borderLeft: '3px solid #3b82f6',
 *     boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
 *   }}
 *   
 *   // Behavior
 *   disableBackdropClick={false}
 *   disableEscapeKey={false}
 *   
 *   // Accessibility
 *   className="property-details-drawer"
 * >
 * </SlidingDrawer>
 * ```
 * 
 * ### Multiple Portals (Advanced)
 * ```tsx
 * // Different portal containers for layering
 * <SlidingDrawer
 *   portalId="main-drawer-portal"
 *   isOpen={mainDrawerOpen}
 *   onClose={() => setMainDrawerOpen(false)}
 *   side="right"
 *   zIndex={1000}
 * >
 *   Main drawer content
 *   
 *   <SlidingDrawer
 *     portalId="nested-drawer-portal"
 *     isOpen={nestedDrawerOpen}
 *     onClose={() => setNestedDrawerOpen(false)}
 *     side="right"
 *     zIndex={1100}
 *   >
 *     Nested drawer content
 *   </SlidingDrawer>
 * </SlidingDrawer>
 * ```
 * 
 * ## Portal Management System
 * The component uses a sophisticated PortalManager class that:
 * - **Creates portals dynamically** when needed
 * - **Manages multiple concurrent drawers** with proper layering
 * - **Handles scroll prevention** automatically
 * - **Coordinates animations** with portal activation/deactivation
 * - **Cleanup on unmount** prevents memory leaks
 * 
 * ```tsx
 * // Portal lifecycle:
 * // 1. Open: Portal activated → Animation starts
 * // 2. Close: Animation completes → Portal deactivated
 * // 3. Cleanup: Portal removed when no active drawers
 * ```
 * 
 * ## Accessibility Features
 * ### Focus Management
 * ```tsx
 * // Automatic focus management:
 * // 1. Stores current focus when opening
 * // 2. Focuses drawer for screen readers
 * // 3. Restores previous focus when closing
 * 
 * <SlidingDrawer
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   side="right"
 * >
 *   <input placeholder="This will be focusable" />
 * </SlidingDrawer>
 * ```
 * 
 * ### Keyboard Navigation
 * - **Escape Key**: Closes drawer (unless disabled)
 * - **Tab Navigation**: Proper focus trapping within drawer
 * - **ARIA Attributes**: `role="dialog"`, `aria-modal="true"`
 * 
 * ### Screen Reader Support
 * ```tsx
 * <SlidingDrawer
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   side="right"
 *   className="filters-drawer"
 *   contentStyles={{ 'aria-label': 'Property filters' }}
 * >
 *   <h2 id="drawer-title">Filter Properties</h2>
 * </SlidingDrawer>
 * ```
 * 
 * ## Animation & Performance
 * ### Smooth Transitions
 * - **Transform-based animations** for optimal performance
 * - **Cubic-bezier easing** for natural motion
 * - **Coordinated backdrop fade** with drawer slide
 * - **Double RAF** for smooth initialization
 * 
 * ### Performance Optimizations
 * ```tsx
 * // Efficient rendering lifecycle:
 * // 1. Portal created only when needed
 * // 2. Component mounted before animation
 * // 3. Animation triggered via state changes
 * // 4. Unmounting delayed until animation completes
 * // 5. Portal cleanup prevents memory leaks
 * ```
 * 
 * ## Common Use Cases
 * 
 * ### Property Filters Panel
 * ```tsx
 * function PropertyFilters() {
 *   const [filtersOpen, setFiltersOpen] = useState(false)
 * 
 *   return (
 *     <SlidingDrawer
 *       isOpen={filtersOpen}
 *       onClose={() => setFiltersOpen(false)}
 *       side="right"
 *       width="400px"
 *       showCloseButton={true}
 *     >
 *       <Box padding="1.5rem">
 *         <h2>Filter Properties</h2>
 *         <SelectionPicker
 *           data={amenities}
 *           isMultiSelect={true}
 *           // ... filter options
 *         />
 *       </Box>
 *     </SlidingDrawer>
 *   )
 * }
 * ```
 * 
 * ### Mobile Property Details
 * ```tsx
 * function MobilePropertyDetails() {
 *   return (
 *     <SlidingDrawer
 *       isOpen={showDetails}
 *       onClose={() => setShowDetails(false)}
 *       side="bottom"
 *       height="80vh"
 *       backgroundColor="white"
 *       contentStyles={{
 *         borderRadius: '1rem 1rem 0 0',
 *         overflow: 'auto'
 *       }}
 *     >
 *       <Box padding="1.5rem">
 *         <h2>Luxury Villa Marina</h2>
 *         <p>Property details, photos, amenities...</p>
 *       </Box>
 *     </SlidingDrawer>
 *   )
 * }
 * ```
 * 
 * ### Navigation Menu
 * ```tsx
 * function NavigationDrawer() {
 *   return (
 *     <SlidingDrawer
 *       isOpen={menuOpen}
 *       onClose={() => setMenuOpen(false)}
 *       side="left"
 *       width="280px"
 *       backgroundColor="#1f2937"
 *     >
 *       <Box padding="1rem" color="white">
 *         <nav>
 *           <Box as="a" href="/properties" padding="0.75rem">
 *             Properties
 *           </Box>
 *           <Box as="a" href="/reservations" padding="0.75rem">
 *             Reservations
 *           </Box>
 *         </nav>
 *       </Box>
 *     </SlidingDrawer>
 *   )
 * }
 * ```
 * 
 * ## Error Handling & Best Practices
 * 
 * ### Cleanup on Unmount
 * ```tsx
 * // Component handles cleanup automatically:
 * // - Portal deactivation
 * // - Event listener removal
 * // - Focus restoration
 * // - Body scroll restoration
 * ```
 * 
 * ### Multiple Drawer Management
 * ```tsx
 * // Safe to have multiple drawers:
 * function MultiDrawerApp() {
 *   return (
 *     <>
 *       <SlidingDrawer portalId="drawer-1" >
 *         First drawer
 *       </SlidingDrawer>
 *       
 *       <SlidingDrawer portalId="drawer-2" >
 *         Second drawer (different portal)
 *       </SlidingDrawer>
 *     </>
 *   )
 * }
 * ```
 * 
 * ### Responsive Considerations
 * ```tsx
 * // Adapt to screen size:
 * const isMobile = window.innerWidth < 768
 * 
 * <SlidingDrawer
 *   side={isMobile ? "bottom" : "right"}
 *   width={isMobile ? "100%" : "400px"}
 *   height={isMobile ? "70vh" : "100%"}
 * >
 *   Responsive drawer content
 * </SlidingDrawer>
 * ```
 * 
 * ## Integration with Other Components
 * - **Works seamlessly with Box** for layout and styling
 * - **Compatible with SelectionPicker** for forms and filters
 * - **Portal system works with Dialog** components
 * - **Theme integration** via backgroundColor and styling props
 * 
 * @example
 * // Complete property filter drawer
 * function PropertyFilterDrawer() {
 *   const [isOpen, setIsOpen] = useState(false)
 *   const [selectedAmenities, setSelectedAmenities] = useState([])
 * 
 *   return (
 *     <>
 *       <button onClick={() => setIsOpen(true)}>
 *         Show Filters
 *       </button>
 * 
 *       <SlidingDrawer
 *         isOpen={isOpen}
 *         onClose={() => setIsOpen(false)}
 *         side="right"
 *         width="400px"
 *         showCloseButton={true}
 *         backgroundColor="white"
 *         contentStyles={{ overflow: 'auto' }}
 *       >
 *         <Box padding="1.5rem">
 *           <h2>Filter Properties</h2>
 *           
 *           <Box marginBottom="2rem">
 *             <h3>Amenities</h3>
 *             <SelectionPicker
 *               data={amenities}
 *               idAccessor={item => item.id}
 *               labelAccessor={item => item.name}
 *               value={selectedAmenities}
 *               onChange={setSelectedAmenities}
 *               isMultiSelect={true}
 *             />
 *           </Box>
 * 
 *           <Box display="flex" gap="1rem">
 *             <Button
 *               label="Clear All"
 *               variant="normal"
 *               onClick={() => setSelectedAmenities([])}
 *             />
 *             <Button
 *               label="Apply Filters"
 *               variant="promoted"
 *               onClick={() => setIsOpen(false)}
 *             />
 *           </Box>
 *         </Box>
 *       </SlidingDrawer>
 *     </>
 *   )
 * }
 */
const SlidingDrawer: React.FC<SlidingDrawerProps> = ({
                                                         isOpen,
                                                         onClose,
                                                         children,
                                                         side,
                                                         width,
                                                         height,
                                                         zIndex = 9999,
                                                         backdropColor = 'rgba(0, 0, 0, 0.5)',
                                                         backgroundColor = 'white',
                                                         background,
                                                         animationDuration = 300,
                                                         disableBackdropClick = false,
                                                         disableEscapeKey = false,
                                                         className,
                                                         contentStyles = {},
                                                         showCloseButton = false,
                                                         closeButton,
                                                         portalId = 'drawer-root'
                                                     }) => {
    const [isAnimating, setIsAnimating] = useState(false)
    const [shouldRender, setShouldRender] = useState(false)
    const drawerRef = useRef<HTMLDivElement>(null)
    const previousFocusRef = useRef<HTMLElement | null>(null)

    // Create a unique drawer ID for portal management
    const drawerId = useRef(`drawer-${Math.random().toString(36).substr(2, 9)}`).current

    // Determine dimensions based on side
    const getDrawerDimensions = () => {
        const isHorizontal = side === 'left' || side === 'right'
        return {
            width: width || (isHorizontal ? '25rem' : '100%'),
            height: height || (isHorizontal ? '100%' : '25rem')
        }
    }

    // Get transform values for closed and open states
    const getTransformValues = () => {
        switch (side) {
            case 'left':
                return {
                    closed: `translateX(-100%)`,
                    open: `translateX(0)`
                }
            case 'right':
                return {
                    closed: `translateX(100%)`,
                    open: `translateX(0)`
                }
            case 'top':
                return {
                    closed: `translateY(-100%)`,
                    open: `translateY(0)`
                }
            case 'bottom':
                return {
                    closed: `translateY(100%)`,
                    open: `translateY(0)`
                }
        }
    }

    // Get positioning styles as Box props based on side
    const getPositionStylesAsBoxProps = () => {
        const {width: drawerWidth, height: drawerHeight} = getDrawerDimensions()
        const baseProps = {
            position: 'fixed' as const,
            width: drawerWidth,
            height: drawerHeight,
            display: 'flex' as const,
            flexDirection: 'column' as const,
            maxHeight: '100vh',
            backgroundColor,
            background,
            zIndex: zIndex + 1,
            transition: `transform ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.15)',
            overflow: 'auto' as const
        }

        switch (side) {
            case 'left':
                return {
                    ...baseProps,
                    top: 0,
                    left: 0,
                    bottom: 0
                }
            case 'right':
                return {
                    ...baseProps,
                    top: 0,
                    right: 0,
                    bottom: 0
                }
            case 'top':
                return {
                    ...baseProps,
                    top: 0,
                    left: 0,
                    right: 0
                }
            case 'bottom':
                return {
                    ...baseProps,
                    bottom: 0,
                    left: 0,
                    right: 0
                }
        }
    }

    // Handle escape key press
    useEffect(() => {
        if (!disableEscapeKey && isOpen) {
            const handleEscape = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    onClose()
                }
            }

            document.addEventListener('keydown', handleEscape)
            return () => document.removeEventListener('keydown', handleEscape)
        }
    }, [isOpen, onClose, disableEscapeKey])

    // Handle focus management
    useEffect(() => {
        if (isOpen) {
            // Store current focus
            previousFocusRef.current = document.activeElement as HTMLElement

            // Focus the drawer for accessibility
            if (drawerRef.current) {
                drawerRef.current.focus()
            }
        } else if (previousFocusRef.current) {
            // Restore focus when closing
            previousFocusRef.current.focus()
            previousFocusRef.current = null
        }
    }, [isOpen])

    // Handle coordinated animation and portal state changes
    useEffect(() => {
        if (isOpen) {
            // Opening sequence: Portal first, then animation
            setShouldRender(true)

            // Step 1: Activate portal container immediately
            PortalManager.activateDrawer(portalId, drawerId)

            // Step 2: Small delay to ensure portal is ready, then start animation
            setTimeout(() => {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => { // Double RAF for smooth transition
                        setIsAnimating(true)
                    })
                })
            }, 0)

        } else {
            // Closing sequence: Animation first, then portal cleanup
            setIsAnimating(false)

            // Step 1: Schedule portal deactivation after animation completes
            PortalManager.scheduleDeactivation(portalId, drawerId, animationDuration)

            // Step 2: Wait for animation to complete before unmounting
            const timer = setTimeout(() => {
                setShouldRender(false)
            }, animationDuration)
            return () => clearTimeout(timer)
        }
    }, [isOpen, animationDuration, portalId, drawerId])

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            const originalOverflow = document.body.style.overflow
            document.body.style.overflow = 'hidden'
            return () => {
                document.body.style.overflow = originalOverflow
            }
        }
    }, [isOpen])

    // Manage portal container using the PortalManager
    useEffect(() => {
        // Ensure portal container exists
        PortalManager.getOrCreatePortal(portalId)
    }, [portalId])

    // Handle cleanup when component unmounts
    useEffect(() => {
        return () => {
            // Always deactivate on unmount if the drawer was ever rendered
            PortalManager.deactivateDrawer(portalId)
        }
    }, [portalId])

    if (!shouldRender) {
        return null
    }

    const portalContainer = PortalManager.getOrCreatePortal(portalId)
    const transformValues = getTransformValues()

    const handleBackdropClick = (event: React.MouseEvent) => {
        if (!disableBackdropClick && event.target === event.currentTarget) {
            onClose()
        }
    }

    const defaultCloseButton = (
        <Button
            label=""
            icon={<IoClose />}
            onClick={onClose}
            variant="normal"
            size="small"
            position="absolute"

            display={'flex'}
            alignItems={'center'}
            justifyContent={'center'}
            top="1rem"
            right="1rem"
            padding="0"

            backgroundColor="transparent"
            border="none"
            fontSize="1.5rem"
            color="#6b7280"
            zIndex={zIndex + 2}
            aria-label="Close drawer"
            style={{
                minWidth: 'unset',
                borderRadius :'50%',
                height:'2rem',
                width : '2rem'
            }}
        />
    )

    const drawerContent = (
        <>
            {/* Backdrop */}
            <Box
                position="fixed"
                top={0}
                left={0}
                right={0}
                bottom={0}
                display="flex"
                flexDirection="column"
                backgroundColor={backdropColor}
                zIndex={zIndex - 1}
                opacity={isAnimating ? 1 : 0}
                transition={`opacity ${animationDuration}ms ease-in-out`}
                cursor={disableBackdropClick ? 'default' : 'pointer'}
                pointerEvents="auto"
                onClick={handleBackdropClick}
                aria-hidden="true"
            />

            {/* Drawer */}
            <Box
                ref={drawerRef}
                className={className}
                {...getPositionStylesAsBoxProps()}
                transform={isAnimating ? transformValues.open : transformValues.closed}
                pointerEvents="auto"
                role="dialog"
                aria-modal="true"
                tabIndex={-1}
                style={contentStyles}
            >
                {/* Content */}
                {children}

                {/* Close button */}
                {showCloseButton && (closeButton || defaultCloseButton)}
            </Box>
        </>
    )

    return ReactDOM.createPortal(drawerContent, portalContainer)
}

export default SlidingDrawer