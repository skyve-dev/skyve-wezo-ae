import React, {forwardRef} from 'react'
import {Box} from './Box'
import {BoxProps} from '@/types/box.ts'

export interface ButtonProps extends Omit<BoxProps, 'onClick' | 'as' | 'size'> {
  // Core functionality
  label: string
  icon?: React.ReactNode
  onClick?: (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void
  
  // Visual variants
  variant?: 'promoted' | 'normal'
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
 * Button Component
 * 
 * A comprehensive, accessible button component that can render as either a button or link
 * while maintaining consistent styling and behavior across the property rental platform.
 */
export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(({
  label,
  icon,
  onClick,
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
        backgroundColor:  '#3b82f6',
        color: '#ffffff',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
      }
    }
    
    // Normal variant
    return {
      ...baseStyles,
      backgroundColor: '#ffffff',
      color: '#374151',
      border: '1px solid #d1d5db',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
    }
  }
  
  // Hover and active styles
  const getInteractiveStyles = () => {
    if (disabled || loading) return {}
    
    if (variant === 'promoted') {
      return {
        whileHover: {
          backgroundColor: '#2563eb',
          boxShadow: '0 4px 8px 0 rgba(59, 130, 246, 0.3)',
          transform: 'translateY(-1px)'
        },
        whileActive: {
          backgroundColor: '#1d4ed8',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
          transform: 'translateY(0px)'
        }
      }
    }
    
    // Normal variant
    return {
      whileHover: {
        backgroundColor: '#f9fafb',
        borderColor: '#9ca3af',
        boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.1)',
        transform: 'translateY(-1px)'
      },
      whileActive: {
        backgroundColor: '#f3f4f6',
        borderColor: '#6b7280',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
        transform: 'translateY(0px)'
      }
    }
  }
  
  // Content to render
  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner size={size} />
    }
    
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