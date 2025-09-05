import React from 'react'
import { Box } from './Box'
import { BoxProps } from '@/types/box.ts'

interface ToggleOption<T = string> {
  value: T
  label: string
  icon?: React.ReactNode
  disabled?: boolean
}

export interface ToggleButtonProps<T = string> extends Omit<BoxProps, 'onChange'> {
  /**
   * Array of toggle options
   */
  options: ToggleOption<T>[]
  
  /**
   * Currently selected value
   */
  value: T
  
  /**
   * Callback when selection changes
   */
  onChange: (value: T) => void
  
  /**
   * Visual variant
   * - segmented: Connected segments (default)
   * - pills: Separate pill buttons
   * - buttons: Separate button styling
   */
  variant?: 'segmented' | 'pills' | 'buttons'
  
  /**
   * Size variant
   */
  size?: 'small' | 'medium' | 'large'
  
  /**
   * Whether the entire toggle is disabled
   */
  disabled?: boolean
  
  /**
   * Whether to take full width
   */
  fullWidth?: boolean
  
  /**
   * Whether to allow deselection (no option selected)
   */
  allowDeselect?: boolean
}

/**
 * Generic Toggle Button Component
 * 
 * A flexible toggle button component that can be used for switching between multiple options.
 * Supports icons, different visual variants, and is fully type-safe with generics.
 * 
 * Features:
 * - Multiple visual variants (segmented, pills, buttons)
 * - Icon support with react-icons
 * - Type-safe with TypeScript generics
 * - Disabled state support
 * - Responsive design
 * - Consistent with design system
 * 
 * @example
 * ```tsx
 * // Booking type toggle
 * <ToggleButton
 *   options={[
 *     { value: 'half-day', label: 'Half Day', icon: <IoIosTime /> },
 *     { value: 'full-stay', label: 'Full Stay', icon: <IoIosCalendar /> }
 *   ]}
 *   value={bookingType}
 *   onChange={setBookingType}
 *   variant="segmented"
 * />
 * 
 * // View mode toggle  
 * <ToggleButton
 *   options={[
 *     { value: 'list', label: 'List', icon: <IoIosList /> },
 *     { value: 'grid', label: 'Grid', icon: <IoIosGrid /> }
 *   ]}
 *   value={viewMode}
 *   onChange={setViewMode}
 *   variant="pills"
 * />
 * ```
 */
const ToggleButton = <T extends string | number = string>({
  options,
  value,
  onChange,
  variant = 'segmented',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  allowDeselect = false,
  ...boxProps
}: ToggleButtonProps<T>) => {
  
  // Size configurations
  const sizeConfig = {
    small: {
      padding: '0.375rem 0.75rem',
      fontSize: '0.75rem',
      iconSize: '0.875rem',
      gap: '0.375rem'
    },
    medium: {
      padding: '0.5rem 1rem',
      fontSize: '0.875rem', 
      iconSize: '1rem',
      gap: '0.5rem'
    },
    large: {
      padding: '0.75rem 1.25rem',
      fontSize: '1rem',
      iconSize: '1.125rem',
      gap: '0.625rem'
    }
  }[size]
  
  // Handle option click
  const handleOptionClick = (optionValue: T) => {
    if (disabled) return
    
    // Check if option is disabled
    const option = options.find(opt => opt.value === optionValue)
    if (option?.disabled) return
    
    // Handle deselection if allowed
    if (allowDeselect && value === optionValue) {
      // Note: This would require onChange to accept undefined, 
      // but keeping it simple for now
      return
    }
    
    onChange(optionValue)
  }
  
  // Base styles for options
  const getOptionStyles = (optionValue: T, option: ToggleOption<T>): React.CSSProperties => {
    const isSelected = value === optionValue
    const isDisabled = disabled || option.disabled
    
    // Base styles
    let styles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: sizeConfig.gap,
      padding: sizeConfig.padding,
      fontSize: sizeConfig.fontSize,
      fontWeight: isSelected ? '600' : '500',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.5 : 1,
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap',
      userSelect: 'none'
    }
    
    // Variant-specific styles
    if (variant === 'segmented') {
      styles = {
        ...styles,
        flex: '1',
        backgroundColor: isSelected ? '#3182ce' : 'white',
        color: isSelected ? 'white' : '#6b7280',
        border: '1px solid #d1d5db',
        borderRadius: '0',
      }
    } else if (variant === 'pills') {
      styles = {
        ...styles,
        backgroundColor: isSelected ? '#3182ce' : '#f3f4f6',
        color: isSelected ? 'white' : '#6b7280',
        border: '1px solid transparent',
        borderRadius: '9999px',
      }
    } else { // buttons
      styles = {
        ...styles,
        backgroundColor: isSelected ? '#3182ce' : 'white',
        color: isSelected ? 'white' : '#6b7280', 
        border: '1px solid #d1d5db',
        borderRadius: '6px',
      }
    }
    
    return styles
  }
  
  return (
    <Box 
      {...(boxProps as any)} 
      display="flex" 
      gap={variant === 'segmented' ? '0' : '0.5rem'} 
      width={fullWidth ? '100%' : 'auto'} 
      borderRadius={variant === 'segmented' ? '6px' : '0'} 
      overflow="hidden"
    >
      {options.map((option, index) => {
        const isFirst = index === 0
        const isLast = index === options.length - 1
        
        let itemStyles = getOptionStyles(option.value, option)
        
        // Handle segmented border radius
        if (variant === 'segmented') {
          if (isFirst && isLast) {
            itemStyles.borderRadius = '6px'
          } else if (isFirst) {
            itemStyles.borderRadius = '6px 0 0 6px'
            itemStyles.borderRight = 'none'
          } else if (isLast) {
            itemStyles.borderRadius = '0 6px 6px 0'
          } else {
            itemStyles.borderRight = 'none'
          }
        }
        
        return (
          <Box
            key={String(option.value)}
            onClick={() => handleOptionClick(option.value)}
            style={itemStyles}
          >
            {/* Icon */}
            {option.icon && (
              <Box
                style={{
                  fontSize: sizeConfig.iconSize,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {option.icon}
              </Box>
            )}
            
            {/* Label */}
            <span>{option.label}</span>
          </Box>
        )
      })}
    </Box>
  )
}

export default ToggleButton