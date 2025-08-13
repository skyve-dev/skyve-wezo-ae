import React, { useEffect, useRef } from 'react';
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
  ({ as = 'div', children, style: customStyle, className: externalClassName, ...restProps }, ref) => {
    const componentIdRef = useRef<string>();
    const styleElementRef = useRef<HTMLStyleElement>();
    
    // Generate unique component ID on first render
    if (!componentIdRef.current) {
      componentIdRef.current = generateComponentId();
    }
    
    const componentId = componentIdRef.current;
    
    // Extract layout props from all props
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
    
    // Inject responsive CSS into document head
    useEffect(() => {
      if (responsiveCSS) {
        // Remove previous style element if it exists
        if (styleElementRef.current && document.head.contains(styleElementRef.current)) {
          document.head.removeChild(styleElementRef.current);
        }
        
        // Create new style element
        const styleElement = document.createElement('style');
        styleElement.textContent = responsiveCSS;
        styleElement.setAttribute('data-layout-id', componentId);
        document.head.appendChild(styleElement);
        styleElementRef.current = styleElement;
      }
      
      // Cleanup on unmount
      return () => {
        if (styleElementRef.current && document.head.contains(styleElementRef.current)) {
          document.head.removeChild(styleElementRef.current);
        }
      };
    }, [responsiveCSS, componentId]);
    
    // Combine base styles with custom styles
    const finalStyles: React.CSSProperties = {
      // Ensure box-sizing is always border-box
      boxSizing: 'border-box',
      ...baseStyles,
      ...customStyle
    };
    
    // Combine classNames
    const finalClassName = [externalClassName, className].filter(Boolean).join(' ');
    
    const Element = as as keyof JSX.IntrinsicElements;
    
    return React.createElement(
      Element,
      {
        ref,
        className: finalClassName,
        style: finalStyles,
        ...otherProps,
      },
      children
    );
  }
) as BoxComponent;

Box.displayName = 'Box';