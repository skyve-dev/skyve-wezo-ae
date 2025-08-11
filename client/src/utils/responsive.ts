import { CSSProperties } from 'react';
import { BoxProps, defaultBreakpoints, BreakpointConfig, Breakpoint } from '@/types/box';

/**
 * Utility class for handling responsive styles
 */
export class ResponsiveStyleManager {
  private breakpoints: BreakpointConfig;
  
  constructor(breakpoints: BreakpointConfig = defaultBreakpoints) {
    this.breakpoints = breakpoints;
  }
  
  /**
   * Convert a CSS property value to a string suitable for CSS
   */
  private formatCSSValue(value: string | number): string {
    if (typeof value === 'number') {
      // For properties that typically use pixels, add 'px' suffix
      return `${value}px`;
    }
    return value;
  }
  
  /**
   * Check if a property name is responsive (ends with Sm, Md, Lg, or Xl)
   */
  private isResponsiveProperty(key: string): { isResponsive: boolean; breakpoint?: Breakpoint; baseProp?: string } {
    const breakpointSuffixes: Breakpoint[] = ['Sm', 'Md', 'Lg', 'Xl'];
    
    for (const suffix of breakpointSuffixes) {
      if (key.endsWith(suffix)) {
        return {
          isResponsive: true,
          breakpoint: suffix,
          baseProp: key.slice(0, -suffix.length)
        };
      }
    }
    
    return { isResponsive: false };
  }
  
  /**
   * Convert camelCase to kebab-case for CSS properties
   */
  private camelToKebab(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  }
  
  /**
   * Generate base styles (non-responsive properties)
   */
  private generateBaseStyles(props: BoxProps): CSSProperties {
    const baseStyles: CSSProperties = {};
    
    Object.entries(props).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      
      const { isResponsive } = this.isResponsiveProperty(key);
      
      // Only process non-responsive properties for base styles
      if (!isResponsive && this.isCSSProperty(key)) {
        // For React style objects, keep camelCase property names
        (baseStyles as any)[key] = this.formatCSSValue(value);
      }
    });
    
    return baseStyles;
  }
  
  /**
   * Check if a property is a valid CSS property we support
   */
  private isCSSProperty(key: string): boolean {
    // List of properties we don't want to pass to CSS
    const nonCSSProps = [
      'children', 'className', 'id', 'onClick', 'onMouseEnter', 
      'onMouseLeave', 'style', 'role', 'aria-label', 'data-testid'
    ];
    
    return !nonCSSProps.includes(key);
  }
  
  /**
   * Generate responsive CSS rules as a string
   */
  private generateResponsiveCSS(props: BoxProps, componentId: string): string {
    const responsiveRules: { [key: string]: string[] } = {
      Sm: [],
      Md: [],
      Lg: [],
      Xl: []
    };
    
    Object.entries(props).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      
      const { isResponsive, breakpoint, baseProp } = this.isResponsiveProperty(key);
      
      if (isResponsive && breakpoint && baseProp && this.isCSSProperty(baseProp)) {
        const cssProperty = this.camelToKebab(baseProp);
        const cssValue = this.formatCSSValue(value);
        responsiveRules[breakpoint].push(`${cssProperty}: ${cssValue} !important;`);
      }
    });
    
    let css = '';
    
    // Generate media queries
    if (responsiveRules.Sm.length > 0) {
      css += `@media (min-width: ${this.breakpoints.phone}px) {
        .${componentId} { ${responsiveRules.Sm.join(' ')} }
      }`;
    }
    
    if (responsiveRules.Md.length > 0) {
      css += `@media (min-width: ${this.breakpoints.tablet}px) {
        .${componentId} { ${responsiveRules.Md.join(' ')} }
      }`;
    }
    
    if (responsiveRules.Lg.length > 0) {
      css += `@media (min-width: ${this.breakpoints.laptop}px) {
        .${componentId} { ${responsiveRules.Lg.join(' ')} }
      }`;
    }
    
    if (responsiveRules.Xl.length > 0) {
      css += `@media (min-width: ${this.breakpoints.desktop}px) {
        .${componentId} { ${responsiveRules.Xl.join(' ')} }
      }`;
    }
    
    return css;
  }
  
  /**
   * Main method to process layout props and return styles + CSS
   */
  public processBoxProps(props: BoxProps, componentId: string): {
    baseStyles: CSSProperties;
    responsiveCSS: string;
    className: string;
  } {
    const baseStyles = this.generateBaseStyles(props);
    const responsiveCSS = this.generateResponsiveCSS(props, componentId);
    
    // Combine existing className with our generated className
    const className = [props.className, componentId].filter(Boolean).join(' ');
    
    return {
      baseStyles,
      responsiveCSS,
      className
    };
  }
}

// Create a singleton instance
export const responsiveManager = new ResponsiveStyleManager();

/**
 * Hook for generating unique component IDs
 */
let componentCounter = 0;
export const generateComponentId = (): string => {
  return `layout-${++componentCounter}`;
};