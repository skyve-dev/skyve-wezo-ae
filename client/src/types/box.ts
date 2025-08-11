import { CSSProperties, ReactNode } from 'react';

// Breakpoint suffixes for responsive design
export type Breakpoint = 'Sm' | 'Md' | 'Lg' | 'Xl';

// Extract common CSS properties that we want to support
export type CSSPropertyValue = string | number;

// Base CSS properties interface
export interface BaseCSSProperties {
  // Layout
  display?: CSSProperties['display'];
  position?: CSSProperties['position'];
  top?: CSSPropertyValue;
  right?: CSSPropertyValue;
  bottom?: CSSPropertyValue;
  left?: CSSPropertyValue;
  zIndex?: CSSPropertyValue;
  
  // Box model
  width?: CSSPropertyValue;
  height?: CSSPropertyValue;
  minWidth?: CSSPropertyValue;
  maxWidth?: CSSPropertyValue;
  minHeight?: CSSPropertyValue;
  maxHeight?: CSSPropertyValue;
  
  // Spacing
  margin?: CSSPropertyValue;
  marginTop?: CSSPropertyValue;
  marginRight?: CSSPropertyValue;
  marginBottom?: CSSPropertyValue;
  marginLeft?: CSSPropertyValue;
  padding?: CSSPropertyValue;
  paddingTop?: CSSPropertyValue;
  paddingRight?: CSSPropertyValue;
  paddingBottom?: CSSPropertyValue;
  paddingLeft?: CSSPropertyValue;
  
  // Flexbox
  flex?: CSSProperties['flex'];
  flexDirection?: CSSProperties['flexDirection'];
  flexWrap?: CSSProperties['flexWrap'];
  justifyContent?: CSSProperties['justifyContent'];
  alignItems?: CSSProperties['alignItems'];
  alignSelf?: CSSProperties['alignSelf'];
  alignContent?: CSSProperties['alignContent'];
  flexGrow?: CSSPropertyValue;
  flexShrink?: CSSPropertyValue;
  flexBasis?: CSSPropertyValue;
  gap?: CSSPropertyValue;
  rowGap?: CSSPropertyValue;
  columnGap?: CSSPropertyValue;
  
  // Grid
  gridTemplate?: CSSProperties['gridTemplate'];
  gridTemplateColumns?: CSSProperties['gridTemplateColumns'];
  gridTemplateRows?: CSSProperties['gridTemplateRows'];
  gridTemplateAreas?: CSSProperties['gridTemplateAreas'];
  gridColumn?: CSSProperties['gridColumn'];
  gridRow?: CSSProperties['gridRow'];
  gridArea?: CSSProperties['gridArea'];
  
  // Border
  border?: CSSPropertyValue;
  borderTop?: CSSPropertyValue;
  borderRight?: CSSPropertyValue;
  borderBottom?: CSSPropertyValue;
  borderLeft?: CSSPropertyValue;
  borderWidth?: CSSPropertyValue;
  borderStyle?: CSSProperties['borderStyle'];
  borderColor?: CSSPropertyValue;
  borderRadius?: CSSPropertyValue;
  
  // Background
  background?: CSSPropertyValue;
  backgroundColor?: CSSPropertyValue;
  backgroundImage?: CSSPropertyValue;
  backgroundSize?: CSSProperties['backgroundSize'];
  backgroundPosition?: CSSProperties['backgroundPosition'];
  backgroundRepeat?: CSSProperties['backgroundRepeat'];
  
  // Text
  color?: CSSPropertyValue;
  fontSize?: CSSPropertyValue;
  fontWeight?: CSSProperties['fontWeight'];
  fontFamily?: CSSPropertyValue;
  lineHeight?: CSSPropertyValue;
  textAlign?: CSSProperties['textAlign'];
  textDecoration?: CSSProperties['textDecoration'];
  textTransform?: CSSProperties['textTransform'];
  
  // Effects
  opacity?: CSSPropertyValue;
  boxShadow?: CSSPropertyValue;
  transform?: CSSPropertyValue;
  transition?: CSSPropertyValue;
  
  // Overflow
  overflow?: CSSProperties['overflow'];
  overflowX?: CSSProperties['overflowX'];
  overflowY?: CSSProperties['overflowY'];
  
  // Cursor
  cursor?: CSSProperties['cursor'];
  pointerEvents?: CSSProperties['pointerEvents'];
  userSelect?: CSSProperties['userSelect'];
  
  // Visibility
  visibility?: CSSProperties['visibility'];
}

// Generate responsive property names
type ResponsiveKey<K extends keyof BaseCSSProperties> = 
  | K
  | `${K}${Breakpoint}`;

// Create responsive properties type
export type ResponsiveCSSProperties = {
  [K in keyof BaseCSSProperties as ResponsiveKey<K>]?: BaseCSSProperties[K];
};

// Box component props
export interface BoxProps extends ResponsiveCSSProperties {
  children?: ReactNode;
  className?: string;
  id?: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLDivElement>) => void;
  
  // Mobile touch events
  onTouchStart?: (event: React.TouchEvent<HTMLDivElement>) => void;
  onTouchEnd?: (event: React.TouchEvent<HTMLDivElement>) => void;
  onTouchMove?: (event: React.TouchEvent<HTMLDivElement>) => void;
  onTouchCancel?: (event: React.TouchEvent<HTMLDivElement>) => void;
  
  style?: CSSProperties; // Additional styles for edge cases
  
  // HTML attributes
  role?: string;
  'aria-label'?: string;
  'data-testid'?: string;
}

// Breakpoint configuration
export interface BreakpointConfig {
  phone: number;    // sm: Small phones
  tablet: number;   // md: Tablets
  laptop: number;   // lg: Laptops
  desktop: number;  // xl: Desktop and larger
}

export const defaultBreakpoints: BreakpointConfig = {
  phone: 640,   // 640px and up
  tablet: 768,  // 768px and up
  laptop: 1024, // 1024px and up
  desktop: 1280 // 1280px and up
};