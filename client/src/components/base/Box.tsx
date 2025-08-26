import React, {useEffect, useRef, useState} from 'react';
import {BoxProps, PolymorphicAs} from '@/types/box';
import {generateComponentId, responsiveManager} from '@/utils/responsive';

// Helper type to get the correct element type from JSX.IntrinsicElements
type ElementType<T extends PolymorphicAs> = T extends keyof JSX.IntrinsicElements
    ? JSX.IntrinsicElements[T] extends React.DetailedHTMLProps<any, infer E>
        ? E
        : HTMLElement
    : HTMLElement;

// Create a polymorphic Box component using forwardRef
interface BoxComponent {
    <T extends PolymorphicAs = 'div'>(
        props: BoxProps<T> & { ref?: React.Ref<ElementType<T>> }
    ): React.ReactElement | null;

    displayName?: string;
}

/**
 * # Box Component
 * 
 * A powerful, polymorphic layout component that serves as the foundation for building responsive UIs.
 * Box provides a consistent API for styling, responsive design, and motion interactions.
 * 
 * ## Key Features
 * - **Polymorphic**: Can render as any HTML element (div, span, section, etc.)
 * - **Responsive**: Mobile-first responsive design with breakpoint-specific properties
 * - **Motion States**: Interactive hover, tap, drag, focus, and scroll animations
 * - **Type-Safe**: Full TypeScript support with autocomplete for all CSS properties
 * - **Performance**: Efficient CSS generation and cleanup
 * 
 * ## Basic Usage
 * ```tsx
 * // Simple div with padding and background
 * <Box padding="1rem" backgroundColor="white">
 *   Content here
 * </Box>
 * 
 * // As a different element
 * <Box as="section" padding="2rem">
 *   <h1>Section content</h1>
 * </Box>
 * ```
 * 
 * ## Responsive Design (Mobile-First)
 * Use breakpoint suffixes: `Sm`, `Md`, `Lg`, `Xl`
 * - **Base**: Mobile (default, no suffix)
 * - **Sm**: 640px and up (Small tablets/large phones)
 * - **Md**: 768px and up (Tablets)
 * - **Lg**: 1024px and up (Laptops)
 * - **Xl**: 1280px and up (Desktop)
 * 
 * ```tsx
 * <Box
 *   padding="1rem"           // Mobile: 1rem padding
 *   paddingMd="2rem"         // Tablet+: 2rem padding
 *   flexDirection="column"   // Mobile: stack vertically
 *   flexDirectionMd="row"    // Tablet+: horizontal layout
 *   gridTemplateColumns="1fr"           // Mobile: single column
 *   gridTemplateColumnsMd="1fr 2fr"     // Tablet+: two columns
 * >
 *   Responsive content
 * </Box>
 * ```
 * 
 * ## Layout Properties
 * ### Flexbox
 * ```tsx
 * <Box 
 *   display="flex" 
 *   flexDirection="column" 
 *   justifyContent="center"
 *   alignItems="center"
 *   gap="1rem"
 * >
 *   Flex container
 * </Box>
 * ```
 * 
 * ### CSS Grid
 * ```tsx
 * <Box 
 *   display="grid" 
 *   gridTemplateColumns="repeat(3, 1fr)"
 *   gap="2rem"
 * >
 *   Grid container
 * </Box>
 * ```
 * 
 * ### Spacing (Margin & Padding)
 * ```tsx
 * <Box 
 *   margin="2rem"           // All sides
 *   paddingX="1rem"         // Horizontal (left + right)
 *   paddingY="0.5rem"       // Vertical (top + bottom)
 *   paddingTop="1rem"       // Specific side
 * >
 *   Spaced content
 * </Box>
 * ```
 * 
 * ## Motion & Interactions
 * ### Hover Effects
 * ```tsx
 * <Box 
 *   padding="1rem"
 *   backgroundColor="white"
 *   whileHover={{ 
 *     backgroundColor: '#f0f9ff', 
 *     transform: 'translateY(-2px)',
 *     boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
 *   }}
 * >
 *   Hover me!
 * </Box>
 * ```
 * 
 * ### Tap/Click Effects
 * ```tsx
 * <Box 
 *   as="button"
 *   padding="0.75rem 1.5rem"
 *   whileTap={{ 
 *     transform: 'scale(0.95)',
 *     backgroundColor: '#e0e7ff'
 *   }}
 * >
 *   Click me!
 * </Box>
 * ```
 * 
 * ### Focus States (Accessibility)
 * ```tsx
 * <Box 
 *   as="input"
 *   whileFocus={{
 *     outline: '2px solid #3b82f6',
 *     outlineOffset: '2px'
 *   }}
 * />
 * ```
 * 
 * ### Scroll-Based Animations
 * ```tsx
 * <Box 
 *   whileInView={{
 *     opacity: 1,
 *     transform: 'translateY(0px)',
 *     transition: 'all 0.6s ease-out'
 *   }}
 *   style={{ opacity: 0, transform: 'translateY(20px)' }}
 * >
 *   Animates when scrolled into view
 * </Box>
 * ```
 * 
 * ## Advanced Responsive Patterns
 * ### Card Layout
 * ```tsx
 * <Box
 *   padding="1rem"
 *   paddingMd="1.5rem"
 *   backgroundColor="white"
 *   borderRadius="8px"
 *   boxShadow="0 2px 4px rgba(0,0,0,0.1)"
 *   display="flex"
 *   flexDirection="column"
 *   flexDirectionSm="row"
 *   gap="1rem"
 *   whileHover={{ boxShadow: '0 4px 8px rgba(0,0,0,0.15)' }}
 * >
 *   Card content
 * </Box>
 * ```
 * 
 * ### Responsive Typography
 * ```tsx
 * <Box
 *   as="h1"
 *   fontSize="1.5rem"      // Mobile
 *   fontSizeMd="2rem"      // Tablet+
 *   fontSizeLg="2.5rem"    // Desktop+
 *   fontWeight="600"
 *   color="#1a202c"
 * >
 *   Responsive Heading
 * </Box>
 * ```
 * 
 * ## Polymorphic Usage
 * The `as` prop lets you render any HTML element while keeping Box styling:
 * ```tsx
 * // Navigation
 * <Box as="nav" display="flex" gap="1rem">
 *   <Box as="a" href="/" color="#3b82f6">Home</Box>
 *   <Box as="a" href="/about" color="#3b82f6">About</Box>
 * </Box>
 * 
 * // Article
 * <Box as="article" maxWidth="800px" margin="0 auto">
 *   <Box as="h1" fontSize="2rem" marginBottom="1rem">Title</Box>
 *   <Box as="p" lineHeight="1.6">Article content...</Box>
 * </Box>
 * ```
 * 
 * ## Performance Notes
 * - CSS is generated once per component and injected into document head
 * - Responsive CSS uses media queries for optimal performance  
 * - Motion states are handled via CSS classes and state management
 * - Cleanup happens automatically on component unmount
 * 
 * ## Accessibility
 * - All standard HTML attributes and ARIA props are supported
 * - Focus states can be customized via `whileFocus`
 * - Semantic HTML can be used via the `as` prop
 * - Motion respects user's `prefers-reduced-motion` settings
 * 
 * @example
 * // Responsive card component
 * <Box
 *   // Layout
 *   display="flex"
 *   flexDirection="column"
 *   flexDirectionMd="row"
 *   
 *   // Spacing
 *   padding="1rem"
 *   paddingLg="2rem" 
 *   gap="1rem"
 *   
 *   // Appearance  
 *   backgroundColor="white"
 *   borderRadius="12px"
 *   boxShadow="0 2px 8px rgba(0,0,0,0.1)"
 *   
 *   // Interactive
 *   whileHover={{
 *     transform: 'translateY(-4px)',
 *     boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
 *   }}
 * >
 *   Card content here
 * </Box>
 */
export const Box: BoxComponent = React.forwardRef<any, BoxProps<any>>(
    ({
         as = 'div',
         children,
         style: customStyle,
         className: externalClassName,
         whileTap,
         whileDrag,
         whileFocus,
         whileInView,
         whileHover,
         ...restProps
     }, ref) => {
        const componentIdRef = useRef<string>();
        const styleElementRef = useRef<HTMLStyleElement>();
        const elementRef = useRef<HTMLElement | null>(null);
        const intersectionObserverRef = useRef<IntersectionObserver | null>(null);

        // Motion states
        const [isTapped, setIsTapped] = useState(false);
        const [isDragging, setIsDragging] = useState(false);
        const [isInView, setIsInView] = useState(false);

        // Generate unique component ID on first render
        if (!componentIdRef.current) {
            componentIdRef.current = generateComponentId();
        }

        const componentId = componentIdRef.current;

        // Extract layout props and motion props from all props
        const layoutProps: any = {};
        const otherProps: any = {};

        // Define non-CSS props that should be passed to the DOM element
        const domProps = new Set([
            'autoCapitalize', 'autoComplete', 'autoCorrect', 'autoFocus', 'autoPlay',
            'checked', 'className', 'contentEditable', 'dir', 'disabled', 'hidden',
            'href', 'htmlFor', 'id', 'lang', 'name', 'placeholder', 'readOnly',
            'required', 'role', 'src', 'tabIndex', 'target', 'title', 'type', 'value',
            'onBlur', 'onChange', 'onClick', 'onFocus', 'onInput', 'onKeyDown',
            'onKeyPress', 'onKeyUp', 'onMouseDown', 'onMouseEnter', 'onMouseLeave',
            'onMouseOver', 'onMouseUp', 'onSubmit', 'onTouchCancel', 'onTouchEnd',
            'onTouchMove', 'onTouchStart'
        ]);

        // Props that start with 'aria-' or 'data-' should also be passed to DOM
        Object.entries(restProps).forEach(([key, value]) => {
            if (domProps.has(key) || key.startsWith('aria-') || key.startsWith('data-')) {
                otherProps[key] = value;
            } else {
                // Everything else is treated as a CSS property
                layoutProps[key] = value;
            }
        });

        // Process layout props to generate styles
        const {baseStyles, responsiveCSS, className} = responsiveManager.processBoxProps(
            layoutProps,
            componentId
        );

        // Generate motion-based CSS
        let motionCSS = '';
        if (whileHover) {
            motionCSS += responsiveManager.generateMotionCSS(whileHover, componentId, ':hover');
        }
        if (whileFocus) {
            motionCSS += responsiveManager.generateMotionCSS(whileFocus, componentId, ':focus');
        }
        if (whileTap && isTapped) {
            motionCSS += responsiveManager.generateMotionCSS(whileTap, componentId, '.tapped');
        }
        if (whileDrag && isDragging) {
            motionCSS += responsiveManager.generateMotionCSS(whileDrag, componentId, '.dragging');
        }
        if (whileInView && isInView) {
            motionCSS += responsiveManager.generateMotionCSS(whileInView, componentId, '.in-view');
        }

        // Combined CSS
        const combinedCSS = responsiveCSS + motionCSS;

        // Set up intersection observer for whileInView
        useEffect(() => {
            if (whileInView && elementRef.current) {
                intersectionObserverRef.current = new IntersectionObserver(
                    ([entry]) => {
                        setIsInView(entry.isIntersecting);
                    },
                    {threshold: 0.1}
                );

                intersectionObserverRef.current.observe(elementRef.current);

                return () => {
                    if (intersectionObserverRef.current) {
                        intersectionObserverRef.current.disconnect();
                    }
                };
            }
        }, [whileInView]);

        // Inject responsive and motion CSS into document head
        useEffect(() => {
            if (combinedCSS) {
                // Remove previous style element if it exists
                if (styleElementRef.current && document.head.contains(styleElementRef.current)) {
                    document.head.removeChild(styleElementRef.current);
                }

                // Create new style element
                const styleElement = document.createElement('style');
                styleElement.textContent = combinedCSS;
                styleElement.setAttribute('data-layout-id', componentId);
                document.head.appendChild(styleElement);
                styleElementRef.current = styleElement;
            }

            // Cleanup on unmount
            return () => {
                if (styleElementRef.current && document.head.contains(styleElementRef.current)) {
                    document.head.removeChild(styleElementRef.current);
                }
                if (intersectionObserverRef.current) {
                    intersectionObserverRef.current.disconnect();
                }
            };
        }, [combinedCSS, componentId]);

        // Enhanced event handlers for motion states
        const enhancedProps: any = {
            ...otherProps,
            ref: (node: HTMLElement | null) => {
                if (elementRef.current !== node) {
                    elementRef.current = node;
                }
                if (typeof ref === 'function') {
                    ref(node);
                } else if (ref && 'current' in ref) {
                    (ref as React.MutableRefObject<any>).current = node;
                }
            }
        };

        // Add motion-specific event handlers
        if (whileTap) {
            const originalOnMouseDown = enhancedProps.onMouseDown;
            const originalOnMouseUp = enhancedProps.onMouseUp;
            const originalOnTouchStart = enhancedProps.onTouchStart;
            const originalOnTouchEnd = enhancedProps.onTouchEnd;

            enhancedProps.onMouseDown = (e: any) => {
                setIsTapped(true);
                if (originalOnMouseDown) originalOnMouseDown(e);
            };

            enhancedProps.onMouseUp = (e: any) => {
                setIsTapped(false);
                if (originalOnMouseUp) originalOnMouseUp(e);
            };

            enhancedProps.onTouchStart = (e: any) => {
                setIsTapped(true);
                if (originalOnTouchStart) originalOnTouchStart(e);
            };

            enhancedProps.onTouchEnd = (e: any) => {
                setIsTapped(false);
                if (originalOnTouchEnd) originalOnTouchEnd(e);
            };
        }

        if (whileDrag) {
            enhancedProps.draggable = true;
            const originalOnDragStart = enhancedProps.onDragStart;
            const originalOnDragEnd = enhancedProps.onDragEnd;

            enhancedProps.onDragStart = (e: any) => {
                setIsDragging(true);
                if (originalOnDragStart) originalOnDragStart(e);
            };

            enhancedProps.onDragEnd = (e: any) => {
                setIsDragging(false);
                if (originalOnDragEnd) originalOnDragEnd(e);
            };
        }

        // Combine base styles with custom styles
        const finalStyles: React.CSSProperties = {
            // Ensure box-sizing is always border-box
            boxSizing: 'border-box',
            ...baseStyles,
            ...customStyle
        };

        // Combine classNames with motion state classes
        let finalClassName = [externalClassName, className].filter(Boolean).join(' ');
        if (isTapped) finalClassName += ' tapped';
        if (isDragging) finalClassName += ' dragging';
        if (isInView) finalClassName += ' in-view';

        const Element = as as keyof JSX.IntrinsicElements;
        return React.createElement(
            Element,
            {
                ...enhancedProps,
                className: finalClassName,
                style: finalStyles,
            },
            children
        );
    }
) as BoxComponent;

Box.displayName = 'Box';