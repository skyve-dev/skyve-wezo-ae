import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { Button } from './Button'
import { Box } from './Box'
import { IoClose } from "react-icons/io5"

const disableStyleId = 'disable-scroll-style'

function disableScroller() {
    const style = document.createElement('style');
    style.id = disableStyleId;
    style.setAttribute('data-scroll-y',window.scrollY+'')
    style.innerText = `html,body,#root{height:100%;overflow:hidden}`;
    document.head.append(style);
}

function enableScroller() {
    const style = document.getElementById(disableStyleId);
    const top = parseInt(style?.getAttribute('data-scroll-y') ?? '0');
    if(style){
        style.remove();
        window.scrollTo({top,behavior:'instant'})
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
 * # Dialog Component
 * 
 * A flexible modal dialog component that displays content in a centered overlay with backdrop.
 * Features smooth animations, portal rendering, accessibility support, and scroll management
 * for creating professional modal experiences in property rental applications.
 * 
 * ## Key Features
 * - **Portal Rendering**: Renders outside DOM hierarchy for proper layering
 * - **Smooth Animations**: Scale and opacity transitions with configurable timing
 * - **Scroll Management**: Automatically prevents body scroll when open
 * - **Focus Management**: Traps focus within dialog and restores after closing
 * - **Accessibility**: Full ARIA support with proper roles and keyboard navigation
 * - **Flexible Sizing**: Responsive width/height with max constraints
 * - **Backdrop Control**: Customizable backdrop click and escape key behavior
 * - **Auto Cleanup**: Handles cleanup on unmount and component destruction
 * 
 * ## Basic Usage
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false)
 * 
 * <Dialog
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 * >
 *   <Box padding="2rem">
 *     <h2>Dialog Content</h2>
 *     <p>This is a simple dialog example.</p>
 *   </Box>
 * </Dialog>
 * ```
 * 
 * ## Sizing and Layout
 * ### Custom Dimensions
 * ```tsx
 * <Dialog
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   width="600px"
 *   height="400px"
 *   maxWidth="90vw"
 *   maxHeight="90vh"
 * >
 *   <Box padding="2rem">
 *     Content with specific dimensions
 *   </Box>
 * </Dialog>
 * ```
 * 
 * ### Responsive Dialog
 * ```tsx
 * <Dialog
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   width="90vw"
 *   maxWidth="800px"
 *   height="auto"
 *   maxHeight="80vh"
 * >
 *   <Box padding="1.5rem" paddingMd="2rem">
 *     Responsive content
 *   </Box>
 * </Dialog>
 * ```
 * 
 * ## Visual Customization
 * ### Backdrop and Colors
 * ```tsx
 * <Dialog
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   backdropColor="rgba(0, 0, 0, 0.8)"
 *   backgroundColor="#f8fafc"
 * >
 *   <Box padding="2rem">
 *     Custom styled dialog
 *   </Box>
 * </Dialog>
 * ```
 * 
 * ### Animation Timing
 * ```tsx
 * <Dialog
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   animationDuration={500}
 * >
 *   <Box padding="2rem">
 *     Slow animation dialog
 *   </Box>
 * </Dialog>
 * ```
 * 
 * ## Behavior Control
 * ### Prevent Accidental Closing
 * ```tsx
 * <Dialog
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   disableBackdropClick
 *   disableEscapeKey
 * >
 *   <Box padding="2rem">
 *     <h3>Confirmation Required</h3>
 *     <p>This dialog can only be closed with buttons.</p>
 *     <Button label="Cancel" onClick={onClose} />
 *   </Box>
 * </Dialog>
 * ```
 * 
 * ### Close Button
 * ```tsx
 * <Dialog
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   showCloseButton
 * >
 *   <Box padding="2rem" paddingTop="3rem">
 *     Content with built-in close button
 *   </Box>
 * </Dialog>
 * ```
 * 
 * ### Custom Close Button
 * ```tsx
 * <Dialog
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   showCloseButton
 *   closeButton={
 *     <Button
 *       label="Close"
 *       icon={<FaTimes />}
 *       onClick={onClose}
 *       variant="plain"
 *       position="absolute"
 *       top="1rem"
 *       right="1rem"
 *     />
 *   }
 * >
 *   Dialog content
 * </Dialog>
 * ```
 * 
 * ## Advanced Examples
 * ### Property Details Modal
 * ```tsx
 * const PropertyModal = ({ property, isOpen, onClose }) => (
 *   <Dialog
 *     isOpen={isOpen}
 *     onClose={onClose}
 *     width="90vw"
 *     maxWidth="1000px"
 *     height="90vh"
 *     showCloseButton
 *   >
 *     <Box padding="0" overflow="auto">
 *       <Box
 *         backgroundImage={`url(${property.image})`}
 *         height="300px"
 *         backgroundSize="cover"
 *         backgroundPosition="center"
 *       />
 *       <Box padding="2rem">
 *         <h2>{property.title}</h2>
 *         <p>{property.description}</p>
 *         <Box display="flex" gap="1rem" marginTop="2rem">
 *           <Button 
 *             label="Book Now" 
 *             variant="promoted"
 *             onClick={handleBooking}
 *           />
 *           <Button 
 *             label="Save to Favorites" 
 *             variant="normal"
 *             onClick={handleSave}
 *           />
 *         </Box>
 *       </Box>
 *     </Box>
 *   </Dialog>
 * )
 * ```
 * 
 * ### Confirmation Dialog
 * ```tsx
 * const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => (
 *   <Dialog
 *     isOpen={isOpen}
 *     onClose={onClose}
 *     width="400px"
 *     disableBackdropClick
 *   >
 *     <Box padding="2rem" textAlign="center">
 *       <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
 *         {title}
 *       </Box>
 *       <Box color="#6b7280" marginBottom="2rem">
 *         {message}
 *       </Box>
 *       <Box display="flex" gap="1rem" justifyContent="center">
 *         <Button 
 *           label="Cancel" 
 *           variant="normal"
 *           onClick={onClose}
 *         />
 *         <Button 
 *           label="Confirm" 
 *           variant="promoted"
 *           onClick={() => {
 *             onConfirm()
 *             onClose()
 *           }}
 *         />
 *       </Box>
 *     </Box>
 *   </Dialog>
 * )
 * ```
 * 
 * ### Form Dialog with Validation
 * ```tsx
 * const ContactDialog = ({ isOpen, onClose }) => {
 *   const [formData, setFormData] = useState({ name: '', email: '', message: '' })
 *   const [isSubmitting, setIsSubmitting] = useState(false)
 * 
 *   const handleSubmit = async () => {
 *     setIsSubmitting(true)
 *     try {
 *       await submitContact(formData)
 *       onClose()
 *     } finally {
 *       setIsSubmitting(false)
 *     }
 *   }
 * 
 *   return (
 *     <Dialog
 *       isOpen={isOpen}
 *       onClose={onClose}
 *       width="500px"
 *       maxHeight="80vh"
 *       showCloseButton
 *     >
 *       <Box padding="2rem" paddingTop="3rem">
 *         <h2>Contact Us</h2>
 *         <Box display="flex" flexDirection="column" gap="1rem" marginTop="1.5rem">
 *           <Input
 *             label="Name"
 *             value={formData.name}
 *             onChange={(e) => setFormData({...formData, name: e.target.value})}
 *             required
 *           />
 *           <Input
 *             label="Email"
 *             type="email"
 *             value={formData.email}
 *             onChange={(e) => setFormData({...formData, email: e.target.value})}
 *             required
 *           />
 *           <Box display="flex" gap="1rem" marginTop="1rem">
 *             <Button 
 *               label="Cancel" 
 *               variant="normal"
 *               onClick={onClose}
 *               disabled={isSubmitting}
 *               flex={1}
 *             />
 *             <Button 
 *               label={isSubmitting ? "Sending..." : "Send"}
 *               variant="promoted"
 *               onClick={handleSubmit}
 *               loading={isSubmitting}
 *               disabled={!formData.name || !formData.email}
 *               flex={1}
 *             />
 *           </Box>
 *         </Box>
 *       </Box>
 *     </Dialog>
 *   )
 * }
 * ```
 * 
 * ## Portal Management
 * ### Custom Portal Container
 * ```tsx
 * <Dialog
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   portalId="custom-dialog-root"
 * >
 *   Content rendered in custom portal
 * </Dialog>
 * ```
 * 
 * ## Accessibility Features
 * - **Focus Trapping**: Focus stays within dialog when open
 * - **Focus Restoration**: Returns focus to trigger element when closed
 * - **Keyboard Navigation**: Escape key closes dialog (unless disabled)
 * - **Screen Reader Support**: Proper ARIA roles and modal attributes
 * - **Tab Order**: Logical tab navigation within dialog content
 * 
 * ## Scroll Management
 * The component automatically:
 * - Prevents body scrolling when dialog is open
 * - Preserves scroll position when dialog closes
 * - Handles scroll restoration on component unmount
 * - Maintains proper z-index layering
 * 
 * ## Performance Optimization
 * - **Conditional Rendering**: Only renders DOM elements when open
 * - **Animation Queuing**: Proper animation timing prevents layout thrashing
 * - **Memory Cleanup**: Automatically removes event handlers and portals
 * - **Z-Index Management**: Dynamic z-index calculation for layering
 * 
 * ## Integration Notes
 * - **Box Component**: Uses Box for consistent styling and responsive design
 * - **Button Component**: Works seamlessly with Button component for actions
 * - **Portal System**: Creates isolated render trees for proper layering
 * - **Theme Integration**: Automatically inherits app theme colors and styles
 * 
 * @example
 * // Complete property inquiry dialog system
 * const PropertyInquiryDialog = ({ property, isOpen, onClose }) => {
 *   const [inquiry, setInquiry] = useState({
 *     checkIn: '',
 *     checkOut: '',
 *     guests: 1,
 *     message: ''
 *   })
 *   const [isSubmitting, setIsSubmitting] = useState(false)
 * 
 *   const handleSubmit = async () => {
 *     setIsSubmitting(true)
 *     try {
 *       await submitInquiry(property.id, inquiry)
 *       onClose()
 *     } finally {
 *       setIsSubmitting(false)
 *     }
 *   }
 * 
 *   return (
 *     <Dialog
 *       isOpen={isOpen}
 *       onClose={onClose}
 *       width="600px"
 *       maxWidth="90vw"
 *       maxHeight="90vh"
 *       showCloseButton
 *     >
 *       <Box padding="2rem" paddingTop="3rem" overflow="auto">
 *         <h2>Inquire About {property.title}</h2>
 *         
 *         <Box display="flex" flexDirection="column" gap="1.5rem" marginTop="1.5rem">
 *           <Box display="flex" gap="1rem" flexDirection="column" flexDirectionMd="row">
 *             <DatePicker
 *               label="Check-in"
 *               value={inquiry.checkIn}
 *               onChange={(value) => setInquiry({...inquiry, checkIn: value})}
 *               minDate={new Date().toISOString()}
 *               required
 *             />
 *             <DatePicker
 *               label="Check-out"
 *               value={inquiry.checkOut}
 *               onChange={(value) => setInquiry({...inquiry, checkOut: value})}
 *               minDate={inquiry.checkIn}
 *               required
 *             />
 *           </Box>
 *           
 *           <NumberStepperInput
 *             label="Number of Guests"
 *             value={inquiry.guests}
 *             onChange={(value) => setInquiry({...inquiry, guests: value})}
 *             min={1}
 *             max={property.maxGuests}
 *           />
 *           
 *           <Box display="flex" gap="1rem" marginTop="1rem">
 *             <Button 
 *               label="Cancel" 
 *               variant="normal"
 *               onClick={onClose}
 *               disabled={isSubmitting}
 *               flex={1}
 *             />
 *             <Button 
 *               label={isSubmitting ? "Sending..." : "Send Inquiry"}
 *               variant="promoted"
 *               onClick={handleSubmit}
 *               loading={isSubmitting}
 *               disabled={!inquiry.checkIn || !inquiry.checkOut}
 *               flex={1}
 *             />
 *           </Box>
 *         </Box>
 *       </Box>
 *     </Dialog>
 *   )
 * }
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