import React, {CSSProperties, useEffect, useRef, useState} from 'react'
import ReactDOM from 'react-dom'
import {Button} from './Button'
import {Box} from './Box'
import {IoClose} from "react-icons/io5";

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
        }
    }

    // Legacy method for immediate deactivation (for unmounting)
    static deactivateDrawer(portalId: string): void {
        const portalInfo = this.portals.get(portalId)
        if (portalInfo) {
            portalInfo.activeDrawers = Math.max(0, portalInfo.activeDrawers - 1)
            this.updatePortalStyles(portalId)
        }
    }

    private static updatePortalStyles(portalId: string): void {
        const portalInfo = this.portals.get(portalId)
        if (!portalInfo) return

        const {container, activeDrawers} = portalInfo

        // Add smooth transition for portal container changes
        if (activeDrawers > 0) {
            // When drawer(s) are active: full viewport coverage for proper layering
            container.setAttribute('data-scroll-y',window.scrollY+'')
            disableScroller()
            container.style.zIndex = '9999';
        } else {
            // When no drawers are active: minimal footprint to avoid blocking interactions
            container.style.zIndex = '-1'
            enableScroller();
            window.scrollTo({top:parseInt(container.getAttribute('data-scroll-y') ?? '0'),behavior:'instant'})
        }
    }
}

const disableStyleId = 'disable-scroll-style'

function disableScroller() {
    const style = document.createElement('style');
    style.id = disableStyleId;
    style.innerText = `html,body,#root{height:100%;overflow:hidden}`;
    document.head.append(style);
}


function enableScroller() {
    const style = document.getElementById(disableStyleId);
    if(style){
        style.remove();
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
 * A robust sliding drawer component that uses React Portal for proper layering
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