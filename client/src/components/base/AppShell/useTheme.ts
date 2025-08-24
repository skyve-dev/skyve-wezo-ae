import { useContext } from 'react'
import AppShellContext from './AppShellContext'
import { AppShellTheme } from './types'
import {
    adjustBrightness,
    adjustSaturation,
    lighten,
    darken,
    withOpacity,
    createGradient,
    createSubtleGradient,
    getContrastTextColor,
    isLightColor
} from '@/utils/colorUtils'

export interface UseThemeReturn extends AppShellTheme {
    // Color manipulation utilities
    lighten: (color: string, amount?: number) => string
    darken: (color: string, amount?: number) => string
    withOpacity: (color: string, opacity: number) => string
    adjustBrightness: (color: string, amount: number) => string
    adjustSaturation: (color: string, amount: number) => string
    
    // Gradient utilities
    createGradient: (baseColor: string, direction?: string, lightenAmount?: number) => string
    createSubtleGradient: (baseColor: string, opacity1?: number, opacity2?: number) => string
    
    // Contrast utilities
    getContrastTextColor: (backgroundColor: string) => string
    isLightColor: (color: string) => boolean
    
    // Theme-specific gradients
    primaryGradient: string
    primaryGradientHover: string
    subtlePrimaryGradient: string
    backgroundGradient: string
    
    // Theme-specific colors with variations
    primaryLight: string
    primaryDark: string
    primarySubtle: string
    primaryContrast: string
}

export const useTheme = (): UseThemeReturn => {
    const context = useContext(AppShellContext)
    
    if (!context) {
        // Return default theme if not in AppShell context
        const defaultTheme: AppShellTheme = {
            primaryColor: '#D52122',
            backgroundColor: '#FAFAFA',
            navBackgroundColor: '#ffffff'
        }
        
        return {
            ...defaultTheme,
            // Color utilities
            lighten,
            darken,
            withOpacity,
            adjustBrightness,
            adjustSaturation,
            
            // Gradient utilities
            createGradient,
            createSubtleGradient,
            
            // Contrast utilities
            getContrastTextColor,
            isLightColor,
            
            // Theme-specific gradients
            primaryGradient: createGradient(defaultTheme.primaryColor, '135deg', 10),
            primaryGradientHover: createGradient(defaultTheme.primaryColor, '135deg', 5),
            subtlePrimaryGradient: createSubtleGradient(defaultTheme.primaryColor, 0.05, 0.02),
            backgroundGradient: `linear-gradient(135deg, ${defaultTheme.navBackgroundColor} 0%, ${defaultTheme.backgroundColor} 100%)`,
            
            // Theme-specific colors
            primaryLight: lighten(defaultTheme.primaryColor, 10),
            primaryDark: darken(defaultTheme.primaryColor, 10),
            primarySubtle: withOpacity(defaultTheme.primaryColor, 0.1),
            primaryContrast: getContrastTextColor(defaultTheme.primaryColor)
        }
    }
    
    const { theme } = context
    
    return {
        ...theme,
        
        // Color utilities
        lighten,
        darken,
        withOpacity,
        adjustBrightness,
        adjustSaturation,
        
        // Gradient utilities
        createGradient,
        createSubtleGradient,
        
        // Contrast utilities
        getContrastTextColor,
        isLightColor,
        
        // Theme-specific gradients
        primaryGradient: createGradient(theme.primaryColor, '135deg', 10),
        primaryGradientHover: createGradient(theme.primaryColor, '135deg', 5),
        subtlePrimaryGradient: createSubtleGradient(theme.primaryColor, 0.05, 0.02),
        backgroundGradient: `linear-gradient(135deg, ${theme.navBackgroundColor} 0%, ${theme.backgroundColor} 100%)`,
        
        // Theme-specific colors with variations
        primaryLight: lighten(theme.primaryColor, 10),
        primaryDark: darken(theme.primaryColor, 10),
        primarySubtle: withOpacity(theme.primaryColor, 0.1),
        primaryContrast: getContrastTextColor(theme.primaryColor)
    }
}

export default useTheme