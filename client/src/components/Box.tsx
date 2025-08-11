import React, { useEffect, useRef, forwardRef } from 'react';
import { BoxProps } from '@/types/box';
import { responsiveManager, generateComponentId } from '@/utils/responsive';

/**
 * Box component with declarative styling and responsive design support
 * 
 * Features:
 * - Direct CSS property props (width, height, margin, padding, etc.)
 * - Responsive variants (widthSm, widthMd, widthLg, widthXl)
 * - Global box-sizing: border-box
 * - TypeScript support for all CSS properties
 * 
 * @example
 * <Box 
 *   width={100} 
 *   widthLg={300}
 *   display="flex" 
 *   displayLg="none"
 *   padding={16}
 *   paddingMd={24}
 * >
 *   Content here
 * </Box>
 */
export const Box = forwardRef<HTMLDivElement, BoxProps>(({
  children,
  style: customStyle,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  onTouchMove,
  onTouchCancel,
  id,
  role,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
  ...layoutProps
}, ref) => {
  const componentIdRef = useRef<string>();
  const styleElementRef = useRef<HTMLStyleElement>();
  
  // Generate unique component ID on first render
  if (!componentIdRef.current) {
    componentIdRef.current = generateComponentId();
  }
  
  const componentId = componentIdRef.current;
  
  // Process layout props to generate styles
  const { baseStyles, responsiveCSS, className } = responsiveManager.processBoxProps(
    layoutProps as BoxProps,
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
  
  return (
    <div
      ref={ref}
      id={id}
      className={className}
      style={finalStyles}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchMove={onTouchMove}
      onTouchCancel={onTouchCancel}
      role={role}
      aria-label={ariaLabel}
      data-testid={dataTestId}
    >
      {children}
    </div>
  );
});

Box.displayName = 'Box';