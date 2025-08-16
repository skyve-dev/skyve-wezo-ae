import React, { useEffect, useRef, useState } from 'react';
import { BoxProps, PolymorphicAs } from '@/types/box';
import { responsiveManager, generateComponentId } from '@/utils/responsive';

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
    const { baseStyles, responsiveCSS, className } = responsiveManager.processBoxProps(
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
          { threshold: 0.1 }
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