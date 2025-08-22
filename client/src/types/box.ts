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
  paddingX?: CSSPropertyValue;
  paddingY?: CSSPropertyValue;
  
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
  borderTopColor?: CSSPropertyValue;
  borderRightColor?: CSSPropertyValue;
  borderBottomColor?: CSSPropertyValue;
  borderLeftColor?: CSSPropertyValue;
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
  fontStyle?: CSSProperties['fontStyle'];
  lineHeight?: CSSPropertyValue;
  textAlign?: CSSProperties['textAlign'];
  textDecoration?: CSSProperties['textDecoration'];
  textTransform?: CSSProperties['textTransform'];
  
  // Effects
  opacity?: CSSPropertyValue;
  boxShadow?: CSSPropertyValue;
  transform?: CSSPropertyValue;
  transition?: CSSPropertyValue;
  animation?: CSSPropertyValue;
  
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
  
  // Misc
  resize?: CSSProperties['resize'];
  
  // Image properties
  objectFit?: CSSProperties['objectFit'];
  
  // Form properties  
  accentColor?: CSSProperties['accentColor'];
}

// Generate responsive property names
type ResponsiveKey<K extends keyof BaseCSSProperties> = 
  | K
  | `${K}${Breakpoint}`;

// Create responsive properties type
export type ResponsiveCSSProperties = {
  [K in keyof BaseCSSProperties as ResponsiveKey<K>]?: BaseCSSProperties[K];
};

// Polymorphic Box component types
export type PolymorphicAs = keyof JSX.IntrinsicElements;

// Base Box props without element-specific attributes
export interface BaseBoxProps extends ResponsiveCSSProperties, MotionProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties; // Additional styles for edge cases
}

// Polymorphic Box component props
export type BoxProps<T extends PolymorphicAs = 'div'> = BaseBoxProps & {
  as?: T;
} & Omit<JSX.IntrinsicElements[T], keyof BaseBoxProps>;

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

// Motion-based responsive styles (mobile-first approach)
export interface ResponsiveMotionStyles {
  // Base styles (mobile-first, applies to all sizes)
  [key: string]: CSSPropertyValue | CSSProperties[keyof CSSProperties] | Partial<ResponsiveMotionStyles> | undefined;
  
  // Responsive breakpoint styles
  Sm?: Partial<ResponsiveMotionStyles>;
  Md?: Partial<ResponsiveMotionStyles>;
  Lg?: Partial<ResponsiveMotionStyles>;
  Xl?: Partial<ResponsiveMotionStyles>;
}

// Motion-based styling props
export interface MotionProps {
  whileTap?: ResponsiveMotionStyles;
  whileDrag?: ResponsiveMotionStyles;
  whileFocus?: ResponsiveMotionStyles;
  whileInView?: ResponsiveMotionStyles;
  whileHover?: ResponsiveMotionStyles;
}