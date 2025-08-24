import { CSSProperties } from 'react'

/**
 * Converts a hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        }
        : null
}

/**
 * Converts RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255
    g /= 255
    b /= 255
    
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        
        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6
                break
            case g:
                h = ((b - r) / d + 2) / 6
                break
            case b:
                h = ((r - g) / d + 4) / 6
                break
        }
    }

    return { h: h * 360, s: s * 100, l: l * 100 }
}

/**
 * Converts HSL to RGB
 */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    h /= 360
    s /= 100
    l /= 100
    
    let r, g, b

    if (s === 0) {
        r = g = b = l // achromatic
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1
            if (t > 1) t -= 1
            if (t < 1/6) return p + (q - p) * 6 * t
            if (t < 1/2) return q
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
            return p
        }

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q
        r = hue2rgb(p, q, h + 1/3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1/3)
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    }
}

/**
 * Converts RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

/**
 * Adjusts the brightness of a color
 * @param color - CSS color string (hex, rgb, or named color)
 * @param amount - Amount to adjust (-100 to 100)
 */
export function adjustBrightness(color: CSSProperties['color'], amount: number): string {
    if (!color) return color as string
    
    const colorStr = color.toString()
    
    // Handle hex colors
    if (colorStr.startsWith('#')) {
        const rgb = hexToRgb(colorStr)
        if (!rgb) return colorStr
        
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
        hsl.l = Math.max(0, Math.min(100, hsl.l + amount))
        
        const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l)
        return rgbToHex(newRgb.r, newRgb.g, newRgb.b)
    }
    
    // Handle rgb/rgba colors
    const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/)
    if (rgbMatch) {
        const r = parseInt(rgbMatch[1])
        const g = parseInt(rgbMatch[2])
        const b = parseInt(rgbMatch[3])
        
        const hsl = rgbToHsl(r, g, b)
        hsl.l = Math.max(0, Math.min(100, hsl.l + amount))
        
        const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l)
        
        // Preserve alpha if present
        const alphaMatch = colorStr.match(/rgba?\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/)
        if (alphaMatch) {
            return `rgba(${newRgb.r}, ${newRgb.g}, ${newRgb.b}, ${alphaMatch[1]})`
        }
        return `rgb(${newRgb.r}, ${newRgb.g}, ${newRgb.b})`
    }
    
    return colorStr
}

/**
 * Adjusts the saturation of a color
 * @param color - CSS color string
 * @param amount - Amount to adjust (-100 to 100)
 */
export function adjustSaturation(color: CSSProperties['color'], amount: number): string {
    if (!color) return color as string
    
    const colorStr = color.toString()
    
    // Handle hex colors
    if (colorStr.startsWith('#')) {
        const rgb = hexToRgb(colorStr)
        if (!rgb) return colorStr
        
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
        hsl.s = Math.max(0, Math.min(100, hsl.s + amount))
        
        const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l)
        return rgbToHex(newRgb.r, newRgb.g, newRgb.b)
    }
    
    return colorStr
}

/**
 * Creates a lighter version of a color
 */
export function lighten(color: CSSProperties['color'], amount: number = 10): string {
    return adjustBrightness(color, Math.abs(amount))
}

/**
 * Creates a darker version of a color
 */
export function darken(color: CSSProperties['color'], amount: number = 10): string {
    return adjustBrightness(color, -Math.abs(amount))
}

/**
 * Creates a color with adjusted opacity
 */
export function withOpacity(color: CSSProperties['color'], opacity: number): string {
    if (!color) return color as string
    
    const colorStr = color.toString()
    
    // Handle hex colors
    if (colorStr.startsWith('#')) {
        const rgb = hexToRgb(colorStr)
        if (!rgb) return colorStr
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
    }
    
    // Handle rgb colors
    const rgbMatch = colorStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (rgbMatch) {
        return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${opacity})`
    }
    
    // Handle rgba colors (replace existing opacity)
    const rgbaMatch = colorStr.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/)
    if (rgbaMatch) {
        return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${opacity})`
    }
    
    return colorStr
}

/**
 * Gets the contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
    const rgb1 = hexToRgb(color1)
    const rgb2 = hexToRgb(color2)
    
    if (!rgb1 || !rgb2) return 1
    
    const luminance = (r: number, g: number, b: number) => {
        const [rs, gs, bs] = [r, g, b].map(c => {
            c /= 255
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
        })
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    }
    
    const l1 = luminance(rgb1.r, rgb1.g, rgb1.b)
    const l2 = luminance(rgb2.r, rgb2.g, rgb2.b)
    
    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)
    
    return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Determines if a color is light or dark
 */
export function isLightColor(color: CSSProperties['color']): boolean {
    if (!color) return true
    
    const colorStr = color.toString()
    const rgb = colorStr.startsWith('#') ? hexToRgb(colorStr) : null
    
    if (!rgb) return true
    
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    return hsl.l > 50
}

/**
 * Gets the best text color (black or white) for a background
 */
export function getContrastTextColor(backgroundColor: CSSProperties['color']): string {
    return isLightColor(backgroundColor) ? '#000000' : '#ffffff'
}

/**
 * Creates a gradient from a base color
 */
export function createGradient(
    baseColor: CSSProperties['color'],
    direction: string = '135deg',
    lightenAmount: number = 10
): string {
    if (!baseColor) return ''
    
    const color1 = baseColor.toString()
    const color2 = darken(color1, lightenAmount)
    
    return `linear-gradient(${direction}, ${color1} 0%, ${color2} 100%)`
}

/**
 * Creates a subtle background gradient
 */
export function createSubtleGradient(
    baseColor: CSSProperties['color'],
    opacity1: number = 0.05,
    opacity2: number = 0.02
): string {
    if (!baseColor) return ''
    
    const color1 = withOpacity(baseColor, opacity1)
    const color2 = withOpacity(baseColor, opacity2)
    
    return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`
}