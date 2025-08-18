import {CSSProperties} from 'react';
import {BoxProps, Breakpoint, BreakpointConfig, defaultBreakpoints, ResponsiveMotionStyles} from '@/types/box';

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

        return {isResponsive: false};
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

            const {isResponsive} = this.isResponsiveProperty(key);

            // Only process non-responsive properties for base styles
            if (!isResponsive && this.isCSSProperty(key)) {
                // Handle special shorthand properties
                if (key === 'paddingX') {
                    (baseStyles as any).paddingLeft = this.formatCSSValue(value);
                    (baseStyles as any).paddingRight = this.formatCSSValue(value);
                } else if (key === 'paddingY') {
                    (baseStyles as any).paddingTop = this.formatCSSValue(value);
                    (baseStyles as any).paddingBottom = this.formatCSSValue(value);
                }else if (key === 'zIndex') {
                    (baseStyles as any).zIndex = value+'';
                } else {
                    // For React style objects, keep camelCase property names
                    (baseStyles as any)[key] = this.formatCSSValue(value);
                }
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
            'onMouseLeave', 'style', 'role', 'aria-label', 'data-testid',
            'whileTap', 'whileDrag', 'whileFocus', 'whileInView', 'whileHover'
        ];

        return !nonCSSProps.includes(key);
    }

    /**
     * Process responsive motion styles into CSS rules
     */
    private processMotionStyles(motionStyles: ResponsiveMotionStyles): {
        baseStyles: CSSProperties;
        responsiveRules: { [key: string]: string[] };
    } {
        const baseStyles: CSSProperties = {};
        const responsiveRules: { [key: string]: string[] } = {
            Sm: [],
            Md: [],
            Lg: [],
            Xl: []
        };

        Object.entries(motionStyles).forEach(([key, value]) => {
            if (key === 'Sm' || key === 'Md' || key === 'Lg' || key === 'Xl') {
                // Handle breakpoint-specific styles
                if (value && typeof value === 'object') {
                    const breakpointStyles = this.processMotionStyles(value as ResponsiveMotionStyles);
                    responsiveRules[key].push(...Object.entries(breakpointStyles.baseStyles).map(([prop, val]) =>
                        `${this.camelToKebab(prop)}: ${this.formatCSSValue(val as string | number)} !important;`
                    ));
                }
            } else {
                // Handle base styles
                if (value !== undefined && value !== null) {
                    // Handle special shorthand properties
                    if (key === 'paddingX') {
                        (baseStyles as any).paddingLeft = this.formatCSSValue(value as string | number);
                        (baseStyles as any).paddingRight = this.formatCSSValue(value as string | number);
                    } else if (key === 'paddingY') {
                        (baseStyles as any).paddingTop = this.formatCSSValue(value as string | number);
                        (baseStyles as any).paddingBottom = this.formatCSSValue(value as string | number);
                    } else {
                        (baseStyles as any)[key] = this.formatCSSValue(value as string | number);
                    }
                }
            }
        });

        return {baseStyles, responsiveRules};
    }

    /**
     * Generate motion-based CSS for a specific state
     */
    public generateMotionCSS(
        motionStyles: ResponsiveMotionStyles | undefined,
        componentId: string,
        pseudoSelector: string
    ): string {
        if (!motionStyles) return '';

        const {baseStyles, responsiveRules} = this.processMotionStyles(motionStyles);
        let css = '';

        // Base styles for the motion state
        const baseCSS = Object.entries(baseStyles)
            .map(([prop, value]) => `${this.camelToKebab(prop)}: ${value} !important;`)
            .join(' ');

        if (baseCSS) {
            css += `.${componentId}${pseudoSelector} { ${baseCSS} }`;
        }

        // Responsive styles for the motion state
        if (responsiveRules.Sm.length > 0) {
            css += `@media (min-width: ${this.breakpoints.phone}px) {
        .${componentId}${pseudoSelector} { ${responsiveRules.Sm.join(' ')} }
      }`;
        }

        if (responsiveRules.Md.length > 0) {
            css += `@media (min-width: ${this.breakpoints.tablet}px) {
        .${componentId}${pseudoSelector} { ${responsiveRules.Md.join(' ')} }
      }`;
        }

        if (responsiveRules.Lg.length > 0) {
            css += `@media (min-width: ${this.breakpoints.laptop}px) {
        .${componentId}${pseudoSelector} { ${responsiveRules.Lg.join(' ')} }
      }`;
        }

        if (responsiveRules.Xl.length > 0) {
            css += `@media (min-width: ${this.breakpoints.desktop}px) {
        .${componentId}${pseudoSelector} { ${responsiveRules.Xl.join(' ')} }
      }`;
        }

        return css;
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

            const {isResponsive, breakpoint, baseProp} = this.isResponsiveProperty(key);

            if (isResponsive && breakpoint && baseProp && this.isCSSProperty(baseProp)) {
                // Handle special shorthand properties
                if (baseProp === 'paddingX') {
                    const cssValue = this.formatCSSValue(value);
                    responsiveRules[breakpoint].push(`padding-left: ${cssValue} !important;`);
                    responsiveRules[breakpoint].push(`padding-right: ${cssValue} !important;`);
                } else if (baseProp === 'paddingY') {
                    const cssValue = this.formatCSSValue(value);
                    responsiveRules[breakpoint].push(`padding-top: ${cssValue} !important;`);
                    responsiveRules[breakpoint].push(`padding-bottom: ${cssValue} !important;`);
                } else if (baseProp === 'zIndex') {
                    const cssProperty = this.camelToKebab(baseProp);
                    const cssValue = value + ''
                    responsiveRules[breakpoint].push(`${cssProperty}: ${cssValue} !important;`);
                } else {
                    const cssProperty = this.camelToKebab(baseProp);
                    const cssValue = this.formatCSSValue(value);
                    responsiveRules[breakpoint].push(`${cssProperty}: ${cssValue} !important;`);
                }
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