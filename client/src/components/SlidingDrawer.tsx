import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { Box } from './Box'

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
   * Optional width for left/right drawers (default: '400px' for left/right, '100%' for top/bottom)
   */
  width?: string
  
  /**
   * Optional height for top/bottom drawers (default: '100%' for left/right, '400px' for top/bottom)
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
  
  // Determine dimensions based on side
  const getDrawerDimensions = () => {
    const isHorizontal = side === 'left' || side === 'right'
    return {
      width: width || (isHorizontal ? '400px' : '100%'),
      height: height || (isHorizontal ? '100%' : '400px')
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
  
  // Get positioning styles based on side
  const getPositionStyles = (): React.CSSProperties => {
    const { width: drawerWidth, height: drawerHeight } = getDrawerDimensions()
    const baseStyles: React.CSSProperties = {
      position: 'fixed',
      width: drawerWidth,
      height: drawerHeight,
      backgroundColor,
      zIndex: zIndex + 1,
      transition: `transform ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      boxShadow: '0 0 20px rgba(0, 0, 0, 0.15)',
      overflow: 'auto'
    }
    
    switch (side) {
      case 'left':
        return {
          ...baseStyles,
          top: 0,
          left: 0,
          bottom: 0
        }
      case 'right':
        return {
          ...baseStyles,
          top: 0,
          right: 0,
          bottom: 0
        }
      case 'top':
        return {
          ...baseStyles,
          top: 0,
          left: 0,
          right: 0
        }
      case 'bottom':
        return {
          ...baseStyles,
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
  
  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      // Small delay to trigger animation
      requestAnimationFrame(() => {
        setIsAnimating(true)
      })
    } else {
      setIsAnimating(false)
      // Wait for animation to complete before unmounting
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, animationDuration)
      return () => clearTimeout(timer)
    }
  }, [isOpen, animationDuration])
  
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
  
  // Create portal container if it doesn't exist
  useEffect(() => {
    let portalContainer = document.getElementById(portalId)
    if (!portalContainer) {
      portalContainer = document.createElement('div')
      portalContainer.id = portalId
      document.body.appendChild(portalContainer)
    }
  }, [portalId])
  
  if (!shouldRender) {
    return null
  }
  
  const portalContainer = document.getElementById(portalId)
  if (!portalContainer) {
    return null
  }
  
  const transformValues = getTransformValues()
  const drawerStyles: React.CSSProperties = {
    ...getPositionStyles(),
    ...contentStyles,
    transform: isAnimating ? transformValues.open : transformValues.closed
  }
  
  const backdropStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: backdropColor,
    zIndex,
    opacity: isAnimating ? 1 : 0,
    transition: `opacity ${animationDuration}ms ease-in-out`,
    cursor: disableBackdropClick ? 'default' : 'pointer'
  }
  
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (!disableBackdropClick && event.target === event.currentTarget) {
      onClose()
    }
  }
  
  const defaultCloseButton = (
    <Box
      as="button"
      position="absolute"
      top="1rem"
      right="1rem"
      width="2rem"
      height="2rem"
      display="flex"
      alignItems="center"
      justifyContent="center"
      backgroundColor="transparent"
      border="none"
      borderRadius="50%"
      cursor="pointer"
      fontSize="1.5rem"
      color="#6b7280"
      zIndex={zIndex + 2}
      whileHover={{
        backgroundColor: 'rgba(0, 0, 0, 0.1)'
      }}
      onClick={onClose}
      aria-label="Close drawer"
    >
      ×
    </Box>
  )
  
  const drawerContent = (
    <>
      {/* Backdrop */}
      <div
        style={backdropStyles}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <div
        ref={drawerRef}
        className={className}
        style={drawerStyles}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        {/* Close button */}
        {showCloseButton && (closeButton || defaultCloseButton)}
        
        {/* Content */}
        {children}
      </div>
    </>
  )
  
  return ReactDOM.createPortal(drawerContent, portalContainer)
}

export default SlidingDrawer