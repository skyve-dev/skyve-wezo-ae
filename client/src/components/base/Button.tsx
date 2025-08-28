import React, {forwardRef} from 'react'
import {Box} from './Box'
import {BoxProps} from '@/types/box.ts'
import {useTheme} from '@/components/base/AppShell'

export interface ButtonProps extends Omit<BoxProps, 'onClick' | 'as' | 'size'> {
  // Core functionality
  label?: string
  icon?: React.ReactNode
  onClick?: (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void
  children?: React.ReactNode
  
  // Visual variants
  variant?: 'promoted' | 'normal' | 'plain' | 'text'
  size?: 'small' | 'medium' | 'large'
  
  // States
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  
  // Link behavior
  href?: string
  target?: string
  rel?: string
  
  // Form functionality
  type?: 'button' | 'submit' | 'reset'
  
  // Additional styling
  className?: string
}

// Loading spinner component
const LoadingSpinner: React.FC<{ size: 'small' | 'medium' | 'large' }> = ({ size }) => {
  const sizeMap = {
    small: '1rem',
    medium: '1.25rem',
    large: '1.5rem'
  }
  
  return (
    <Box
      width={sizeMap[size]}
      height={sizeMap[size]}
      border="2px solid"
      borderColor="currentColor"
      borderTopColor="transparent"
      borderRadius="50%"
      display="inline-block"
      animation="spin 1s linear infinite"
      style={{
        animation: 'spin 1s linear infinite'
      }}
    />
  )
}

/**
 * # Button Component
 * 
 * A comprehensive, accessible button component that can render as either a button or link element
 * while maintaining consistent styling and behavior. Built on top of the Box component with theme
 * integration and responsive design capabilities.
 * 
 * ## Key Features
 * - **Polymorphic**: Renders as button or anchor based on href prop
 * - **Flexible Content**: Supports both label/icon props and children for custom content
 * - **Theme Integration**: Uses app theme colors and utilities automatically  
 * - **Loading States**: Built-in spinner with size-aware animations
 * - **Accessibility**: Full keyboard navigation and ARIA support
 * - **Variants**: Multiple visual styles (promoted, normal, plain, text)
 * - **Interactive**: Hover, tap, and focus animations via Box motion props
 * - **Icon Support**: Flexible icon positioning with proper sizing
 * 
 * ## Basic Usage
 * ```tsx
 * // Simple button with label
 * <Button label="Click me" onClick={handleClick} />
 * 
 * // Button with children (takes precedence over label)
 * <Button onClick={handleClick}>
 *   <Box display="flex" alignItems="center" gap="0.5rem">
 *     <FaSave />
 *     <span>Save Document</span>
 *   </Box>
 * </Button>
 * 
 * // With icon and label
 * <Button 
 *   label="Save" 
 *   icon={<FaSave />} 
 *   onClick={handleSave}
 * />
 * 
 * // Link button
 * <Button 
 *   label="Visit page" 
 *   href="/dashboard"
 * />
 * ```
 * 
 * ## Variants and Styling
 * ### Visual Variants
 * ```tsx
 * // Promoted (primary action)
 * <Button 
 *   label="Book Now" 
 *   variant="promoted" 
 *   onClick={handleBooking}
 * />
 * 
 * // Normal (secondary action)  
 * <Button 
 *   label="Cancel" 
 *   variant="normal"
 *   onClick={handleCancel}
 * />
 * 
 * // Plain (minimal styling)
 * <Button 
 *   label="Skip" 
 *   variant="plain"
 *   onClick={handleSkip}
 * />
 * ```
 * 
 * ### Size Options
 * ```tsx
 * // Small button (36px height)
 * <Button label="Small" size="small" />
 * 
 * // Medium button (44px height) - default
 * <Button label="Medium" size="medium" />
 * 
 * // Large button (52px height)
 * <Button label="Large" size="large" />
 * ```
 * 
 * ## States and Interactions
 * ### Loading State
 * ```tsx
 * <Button 
 *   label="Saving..." 
 *   loading={isLoading}
 *   disabled={isLoading}
 *   onClick={handleSave}
 * />
 * ```
 * 
 * ### Disabled State
 * ```tsx
 * <Button 
 *   label="Submit" 
 *   disabled={!isValid}
 *   onClick={handleSubmit}
 * />
 * ```
 * 
 * ### Full Width
 * ```tsx
 * <Button 
 *   label="Continue" 
 *   fullWidth
 *   variant="promoted"
 *   onClick={handleContinue}
 * />
 * ```
 * 
 * ## Link Behavior
 * ### Internal Links
 * ```tsx
 * <Button 
 *   label="Go to Dashboard" 
 *   href="/dashboard"
 * />
 * ```
 * 
 * ### External Links
 * ```tsx
 * <Button 
 *   label="Visit Website" 
 *   href="https://example.com"
 *   target="_blank"
 *   rel="noopener noreferrer"
 * />
 * ```
 * 
 * ## Form Integration
 * ### Submit Button
 * ```tsx
 * <Button 
 *   label="Submit Form" 
 *   type="submit"
 *   variant="promoted"
 * />
 * ```
 * 
 * ### Reset Button
 * ```tsx
 * <Button 
 *   label="Reset" 
 *   type="reset"
 *   variant="normal"
 * />
 * ```
 * 
 * ## Advanced Examples
 * ### Property Booking Button
 * ```tsx
 * <Button
 *   label="Book Villa"
 *   icon={<FaCalendarAlt />}
 *   variant="promoted"
 *   size="large"
 *   fullWidth
 *   loading={isBooking}
 *   disabled={!isAvailable}
 *   onClick={handleBooking}
 * />
 * ```
 * 
 * ### Custom Content with Children
 * ```tsx
 * <Button variant="promoted" onClick={handleSubmit}>
 *   <Box display="flex" alignItems="center" gap="1rem">
 *     <FaBuilding size={20} />
 *     <Box>
 *       <div style={{ fontWeight: 'bold' }}>Luxury Villa Marina</div>
 *       <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>3 Beds • 2 Baths</div>
 *     </Box>
 *     <FaChevronRight style={{ marginLeft: 'auto' }} />
 *   </Box>
 * </Button>
 * ```
 * 
 * ### Navigation with Icon
 * ```tsx
 * <Button
 *   label="Back to Listings"
 *   icon={<FaArrowLeft />}
 *   variant="normal"
 *   href="/listings"
 * />
 * ```
 * 
 * ### Action Button Group
 * ```tsx
 * <Box display="flex" gap="1rem">
 *   <Button 
 *     label="Save Draft" 
 *     variant="normal"
 *     onClick={handleSaveDraft}
 *   />
 *   <Button 
 *     label="Publish" 
 *     variant="promoted"
 *     onClick={handlePublish}
 *   />
 * </Box>
 * ```
 * 
 * ## Accessibility Features
 * - **Keyboard Navigation**: Full tab navigation support
 * - **Screen Readers**: Proper ARIA labels and roles
 * - **Loading Announcements**: aria-busy for loading states  
 * - **Disabled States**: aria-disabled for proper state communication
 * - **Focus Management**: Visible focus rings and proper tabindex handling
 * 
 * ## Theme Integration
 * The component automatically uses theme colors:
 * - **Primary Color**: For promoted variant background and hover states
 * - **Primary Contrast**: For text color in promoted buttons
 * - **Color Utilities**: Automatic color manipulation (lighten, darken, opacity)
 * 
 * ## Performance Notes
 * - **Efficient Rendering**: Uses Box component's optimized CSS generation
 * - **Animation Optimization**: Hardware-accelerated transforms and opacity
 * - **Loading Spinner**: CSS-based animation with minimal JavaScript overhead
 * - **Conditional Event Handlers**: Only attached when needed to prevent unnecessary renders
 * 
 * ## Implementation Details
 * - Built on Box component for consistent styling API
 * - Polymorphic implementation supports both button and anchor elements
 * - Children prop takes precedence over label/icon for maximum flexibility
 * - Size configurations match Input component heights for form consistency
 * - Loading spinner automatically scales based on button size
 * - Theme colors are resolved at render time for dynamic theme switching
 * 
 * @example
 * // Complete property booking interface
 * <Box display="flex" flexDirection="column" gap="1rem">
 *   <Button
 *     label="Check Availability"
 *     icon={<FaCalendarCheck />}
 *     variant="normal"
 *     size="large"
 *     fullWidth
 *     onClick={handleCheckAvailability}
 *   />
 *   <Button
 *     label={isBooking ? "Processing..." : "Book Now"}
 *     icon={!isBooking && <FaCreditCard />}
 *     variant="promoted"
 *     size="large"
 *     fullWidth
 *     loading={isBooking}
 *     disabled={!isAvailable || isBooking}
 *     onClick={handleBookNow}
 *   />
 *   <Button
 *     label="View Similar Properties"
 *     variant="plain"
 *     href="/listings?similar=true"
 *   />
 * </Box>
 */
export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(({
  label,
  icon,
  onClick,
  children,
  variant = 'normal',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  href,
  target,
  rel,
  type = 'submit',
  className,
  ...props
}, ref) => {
  const theme = useTheme()
  
  // Size configurations that match Input component heights
  const sizeConfig = {
    small: {
      height: '36px',
      fontSize: '0.875rem',
      padding: '8px 12px',
      iconSize: '0.875rem',
      gap: '0.375rem'
    },
    medium: {
      height: '44px',
      fontSize: '1rem', 
      padding: '10px 16px',
      iconSize: '1rem',
      gap: '0.5rem'
    },
    large: {
      height: '52px',
      fontSize: '1.125rem',
      padding: '12px 20px',
      iconSize: '1.125rem',
      gap: '0.625rem'
    }
  }
  
  const config = sizeConfig[size]

  // Variant styles
  const getVariantStyles = () => {
    const baseStyles = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: config.gap,
      height: config.height,
      padding: config.padding,
      fontSize: config.fontSize,
      fontWeight: '500',
      lineHeight: '1',
      borderRadius: '0.375rem',
      border: 'none',
      cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
      textDecoration: 'none',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      opacity: (disabled || loading) ? '0.6' : '1',
      width: fullWidth ? '100%' : 'auto',
      minWidth: 'max-content'
    }
    
    if (variant === 'promoted') {
      return {
        ...baseStyles,
        backgroundColor: theme.primaryColor,
        color: theme.primaryContrast,
        boxShadow: `0 2px 8px ${theme.withOpacity(theme.primaryColor, 0.15)}`
      }
    }
    
    if (variant === 'plain') {
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        color: theme.primaryColor,
        border: 'none',
        boxShadow: 'none'
      }
    }

    if (variant === 'text') {
      return {
        ...baseStyles,
        padding:'0px',
        backgroundColor: 'transparent',
        color: theme.primaryColor,
        border: 'none',
        boxShadow: 'none'
      }
    }
    
    // Normal variant
    return {
      ...baseStyles,
      backgroundColor: '#ffffff',
      color: theme.darken(theme.primaryColor, 10),
      border: `1px solid ${theme.withOpacity(theme.primaryColor, 0.15)}`,
      boxShadow: `0 1px 2px ${theme.withOpacity(theme.primaryColor, 0.08)}`
    }
  }
  
  // Hover and active styles
  const getInteractiveStyles = () => {
    if (disabled || loading) return {}
    
    if (variant === 'promoted') {
      return {
        whileHover: {
          backgroundColor: theme.primaryLight,
          boxShadow: `0 4px 12px ${theme.withOpacity(theme.primaryColor, 0.25)}`,
          transform: 'translateY(-1px)'
        },
        whileActive: {
          backgroundColor: theme.primaryDark,
          boxShadow: `0 1px 2px ${theme.withOpacity(theme.primaryColor, 0.15)}`,
          transform: 'translateY(0px)'
        }
      }
    }
    
    if (variant === 'plain') {
      return {
        whileHover: {
          backgroundColor: theme.withOpacity(theme.primaryColor, 0.05),
          color: theme.primaryDark
        },
        whileActive: {
          backgroundColor: theme.withOpacity(theme.primaryColor, 0.1),
          color: theme.primaryDark
        }
      }
    }
    
    // Normal variant
    return {
      whileHover: {
        backgroundColor: theme.subtlePrimaryGradient,
        borderColor: theme.withOpacity(theme.primaryColor, 0.3),
        boxShadow: `0 4px 8px ${theme.withOpacity(theme.primaryColor, 0.12)}`,
        transform: 'translateY(-1px)'
      },
      whileActive: {
        backgroundColor: theme.withOpacity(theme.primaryColor, 0.08),
        borderColor: theme.withOpacity(theme.primaryColor, 0.4),
        boxShadow: `0 1px 2px ${theme.withOpacity(theme.primaryColor, 0.1)}`,
        transform: 'translateY(0px)'
      }
    }
  }
  
  // Content to render
  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner size={size} />
    }
    
    // If children is provided, use it instead of label/icon
    if (children) {
      return children
    }
    
    // Otherwise use label and icon
    return (
      <>
        {icon && (
          <Box
            display="flex"
            alignItems="center"
            fontSize={config.iconSize}
            flexShrink="0"
          >
            {icon}
          </Box>
        )}
        {((!loading) && label) &&
        <Box as="span">
          {label}
        </Box>
        }
      </>
    )
  }
  
  const buttonStyles = getVariantStyles()
  const interactiveStyles = getInteractiveStyles()
  
  // Extract only style-related props that are safe for both button and anchor
  const { 
    // Exclude button/anchor specific props
    type: _type,
    style:_style,
    ...safeProps
  } = props as any
  
  const baseProps = {
    className: className,
    'aria-disabled': disabled || loading,
    'aria-busy': loading,
    ...interactiveStyles,
    ...safeProps,
    style: {...buttonStyles,..._style}
  }
  
  // Render as link if href is provided
  if (href) {
    return (
      <Box
        as="a"
        href={disabled || loading ? undefined : href}
        target={target}
        rel={rel}
        role="button"
        tabIndex={disabled || loading ? -1 : 0}
        onClick={(disabled || loading) ? undefined : onClick as any}
        ref={ref as React.Ref<HTMLAnchorElement>}
        {...baseProps}
      >
        {renderContent()}
      </Box>
    )
  }
  
  // Render as button
  return (
    <Box
      as="button"
      type={type}
      disabled={disabled || loading}
      onClick={(disabled || loading) ? undefined : onClick as any}
      ref={ref as React.Ref<HTMLButtonElement>}
      {...baseProps}
    >
      {renderContent()}
    </Box>
  )
})

Button.displayName = 'Button'

export default Button

// Add CSS keyframes for loading spinner
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `
  if (!document.querySelector('style[data-button-keyframes]')) {
    style.setAttribute('data-button-keyframes', 'true')
    document.head.appendChild(style)
  }
}