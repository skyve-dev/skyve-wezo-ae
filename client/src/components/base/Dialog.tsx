import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { Button } from './Button'
import { Box } from './Box'
import { IoClose } from "react-icons/io5"

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

interface DialogProps {
    /**
     * Controlled prop that determines the dialog's visibility
     */
    isOpen: boolean

    /**
     * Callback function executed when the dialog should be closed
     */
    onClose: () => void

    /**
     * Content to be rendered inside the dialog
     */
    children: React.ReactNode

    /**
     * Optional dialog width (default: 'auto')
     */
    width?: string

    /**
     * Optional dialog height (default: 'auto')
     */
    height?: string

    /**
     * Optional maximum width (default: '90vw')
     */
    maxWidth?: string

    /**
     * Optional maximum height (default: '90vh')
     */
    maxHeight?: string

    /**
     * Optional z-index for the dialog (default: 9999)
     */
    zIndex?: number

    /**
     * Optional backdrop color (default: 'rgba(0, 0, 0, 0.5)')
     */
    backdropColor?: string

    /**
     * Optional dialog background color (default: 'white')
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
     * Optional custom class name for the dialog content
     */
    className?: string

    /**
     * Optional styles for the dialog content
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
     * Optional portal container ID (default: 'dialog-root')
     */
    portalId?: string
}

/**
 * A Dialog component that appears in the center of the screen with scale animations
 */
const Dialog: React.FC<DialogProps> = ({
    isOpen,
    onClose,
    children,
    width = 'auto',
    height = 'auto',
    maxWidth = '90vw',
    maxHeight = '90vh',
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
    portalId = 'dialog-root'
}) => {
    const [isAnimating, setIsAnimating] = useState(false)
    const [shouldRender, setShouldRender] = useState(false)
    const dialogRef = useRef<HTMLDivElement>(null)
    const previousFocusRef = useRef<HTMLElement | null>(null)

    // Get or create portal container
    const getOrCreatePortal = (): HTMLElement => {
        let container = document.getElementById(portalId) as HTMLElement
        if (!container) {
            container = document.createElement('div')
            container.id = portalId
            container.style.position = 'fixed'
            container.style.top = '0'
            container.style.left = '0'
            container.style.width = '100%'
            container.style.height = '100%'
            container.style.zIndex = zIndex.toString()
            container.style.pointerEvents = 'none'
            document.body.appendChild(container)
        }
        return container
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

            // Focus the dialog for accessibility
            if (dialogRef.current) {
                dialogRef.current.focus()
            }
        } else if (previousFocusRef.current) {
            // Restore focus when closing
            previousFocusRef.current.focus()
            previousFocusRef.current = null
        }
    }, [isOpen])

    // Handle animation and rendering
    useEffect(() => {
        if (isOpen) {
            // Opening sequence
            setShouldRender(true)
            disableScroller()

            // Start animation after render
            setTimeout(() => {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        setIsAnimating(true)
                    })
                })
            }, 0)

        } else {
            // Closing sequence: Animation first, then cleanup
            setIsAnimating(false)

            // Wait for animation to complete before unmounting
            const timer = setTimeout(() => {
                setShouldRender(false)
                enableScroller()
            }, animationDuration)
            return () => clearTimeout(timer)
        }
    }, [isOpen, animationDuration])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            enableScroller()
        }
    }, [])

    if (!shouldRender) {
        return null
    }

    const portalContainer = getOrCreatePortal()

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
            top="1rem"
            right="1rem"
            width="2rem"
            height="2rem"
            padding="0"
            borderRadius="50%"
            backgroundColor="transparent"
            border="none"
            fontSize="1.5rem"
            color="#6b7280"
            zIndex={zIndex + 2}
            aria-label="Close dialog"
            style={{
                minWidth: 'unset'
            }}
        />
    )

    const dialogContent = (
        <>
            {/* Backdrop */}
            <Box
                position="fixed"
                top={0}
                left={0}
                right={0}
                bottom={0}
                backgroundColor={backdropColor}
                zIndex={zIndex}
                opacity={isAnimating ? 1 : 0}
                transition={`opacity ${animationDuration}ms ease-in-out`}
                cursor={disableBackdropClick ? 'default' : 'pointer'}
                pointerEvents="auto"
                onClick={handleBackdropClick}
                aria-hidden="true"
            />

            {/* Dialog */}
            <Box
                ref={dialogRef}
                className={className}
                position="fixed"
                top="50%"
                left="50%"
                transform={`translate(-50%, -50%) scale(${isAnimating ? 1 : 0.8})`}
                width={width}
                height={height}
                maxWidth={maxWidth}
                maxHeight={maxHeight}
                backgroundColor={backgroundColor}
                borderRadius="8px"
                boxShadow="0 10px 25px rgba(0, 0, 0, 0.15)"
                zIndex={zIndex + 1}
                transition={`transform ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${animationDuration}ms ease-in-out`}
                opacity={isAnimating ? 1 : 0}
                pointerEvents="auto"
                overflow="auto"
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

    return ReactDOM.createPortal(dialogContent, portalContainer)
}

export default Dialog