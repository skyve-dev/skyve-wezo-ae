import React from 'react'
import { Box } from './Box'
import {BoxProps} from "@/types/box.ts";

interface SelectionPickerProps<T> extends Omit<BoxProps<'div'>, 'onChange'>{
  /**
   * Array of objects representing the list of selectable items
   */
  data: T[]
  
  /**
   * Callback function that receives an item and returns its unique identifier
   */
  idAccessor: (item: T) => string | number
  
  /**
   * Currently selected value(s) - single ID for single selection, array of IDs for multiple
   */
  value: string | number | (string | number)[] | null | undefined
  
  /**
   * Callback function invoked when selection changes
   */
  onChange: (value: string | number | (string | number)[]) => void
  
  /**
   * Toggle between single and multiple selection modes
   */
  isMultiSelect?: boolean
  
  /**
   * Optional function to render custom content for each item
   */
  renderItem?: (item: T, isSelected: boolean) => React.ReactNode
  
  /**
   * Optional className for the container
   */
  containerClassName?: string
  
  /**
   * Optional className for each item
   */
  itemClassName?: string
  
  /**
   * Optional className for selected items
   */
  selectedItemClassName?: string
  
  /**
   * Optional styles for the container Box
   */
  containerStyles?: Record<string, any>
  
  /**
   * Optional styles for each item Box
   */
  itemStyles?: Record<string, any>
  
  /**
   * Optional styles for selected item Box
   */
  selectedItemStyles?: Record<string, any>
  
  /**
   * Optional label accessor for displaying item text
   */
  labelAccessor?: (item: T) => string
  
  /**
   * Optional disabled state for the entire picker
   */
  disabled?: boolean
  
  /**
   * Optional function to determine if an item should be disabled
   */
  isItemDisabled?: (item: T) => boolean
}

/**
 * A versatile selection picker component that handles both single and multiple selections
 */
function SelectionPicker<T>({
  data,
  idAccessor,
  value,
  onChange,
  isMultiSelect = false,
  renderItem,
  containerClassName,
  itemClassName,
  selectedItemClassName,
  containerStyles = {},
  itemStyles = {},
  selectedItemStyles = {},
  labelAccessor,
  disabled = false,
  isItemDisabled
}: SelectionPickerProps<T>) {
  
  // Normalize value to always work with an array internally
  const selectedIds = React.useMemo(() => {
    if (isMultiSelect) {
      return Array.isArray(value) ? value : []
    }
    return value !== undefined && value !== null ? [value] : []
  }, [value, isMultiSelect])
  
  // Check if an item is selected
  const isItemSelected = (itemId: string | number): boolean => {
    return selectedIds.includes(itemId)
  }
  
  // Handle item click
  const handleItemClick = (itemId: string | number, item: T) => {
    // Check if component or specific item is disabled
    if (disabled || (isItemDisabled && isItemDisabled(item))) {
      return
    }
    
    if (isMultiSelect) {
      // Multiple selection mode
      const currentSelection = Array.isArray(value) ? value : []
      let newSelection: (string | number)[]
      
      if (isItemSelected(itemId)) {
        // Deselect item
        newSelection = currentSelection.filter(id => id !== itemId)
      } else {
        // Select item
        newSelection = [...currentSelection, itemId]
      }
      
      onChange(newSelection)
    } else {
      // Single selection mode
      if (isItemSelected(itemId)) {
        // Optional: Allow deselection in single mode
        // onChange(null) // Uncomment if you want to allow deselection
        return // Comment this line if deselection is allowed
      }
      onChange(itemId)
    }
  }
  
  // Default item renderer
  const defaultRenderItem = (item: T, isSelected: boolean) => {
    const label = labelAccessor ? labelAccessor(item) : String(item)
    return (
      <>
        {isMultiSelect && (
          <Box
            as="span"
            marginRight="0.5rem"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            width="1.25rem"
            height="1.25rem"
            border={`2px solid ${isSelected ? '#3182ce' : '#d1d5db'}`}
            borderRadius={isMultiSelect ? '0.25rem' : '50%'}
            backgroundColor={isSelected ? '#3182ce' : 'transparent'}
            transition="all 0.2s"
          >
            {isSelected && (
              <Box
                as="span"
                color="white"
                fontSize="0.75rem"
                fontWeight="bold"
              >
                ✓
              </Box>
            )}
          </Box>
        )}
        {!isMultiSelect && (
          <Box
            as="span"
            marginRight="0.5rem"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            width="1.25rem"
            height="1.25rem"
            border={`2px solid ${isSelected ? '#3182ce' : '#d1d5db'}`}
            borderRadius="50%"
            backgroundColor={isSelected ? '#3182ce' : 'transparent'}
            transition="all 0.2s"
          >
            {isSelected && (
              <Box
                as="span"
                width="0.5rem"
                height="0.5rem"
                backgroundColor="white"
                borderRadius="50%"
              />
            )}
          </Box>
        )}
        <Box as="span" flex="1">
          {label}
        </Box>
      </>
    )
  }
  
  // Merge styles for selected items
  const getItemStyles = (itemId: string | number, item: T) => {
    const selected = isItemSelected(itemId)
    const itemDisabled = isItemDisabled && isItemDisabled(item)
    
    const baseStyles = {
      display: 'flex',
      alignItems: 'center',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      cursor: disabled || itemDisabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s',
      opacity: disabled || itemDisabled ? 0.5 : 1,
      border: '2px solid',
      borderColor: selected ? '#3182ce' : '#e5e7eb',
      backgroundColor: selected ? '#ebf8ff' : 'white',
      ...itemStyles
    }
    
    if (selected) {
      return {
        ...baseStyles,
        ...selectedItemStyles
      }
    }
    
    return baseStyles
  }
  
  return (
    <Box
      className={containerClassName}
      display="flex"
      flexDirection="column"
      gap="0.5rem"
      {...containerStyles}
    >
      {data.map((item) => {
        const itemId = idAccessor(item)
        const selected = isItemSelected(itemId)
        const itemDisabled = isItemDisabled && isItemDisabled(item)
        
        return (
          <Box
            key={itemId}
            className={`${itemClassName || ''} ${selected ? selectedItemClassName || '' : ''}`}
            onClick={() => handleItemClick(itemId, item)}
            whileHover={
              !disabled && !itemDisabled
                ? {
                    borderColor: selected ? '#2563eb' : '#9ca3af',
                    backgroundColor: selected ? '#dbeafe' : '#f9fafb'
                  }
                : {}
            }
            {...getItemStyles(itemId, item)}
            role={isMultiSelect ? 'checkbox' : 'radio'}
            aria-checked={selected}
            aria-disabled={disabled || itemDisabled}
            tabIndex={disabled || itemDisabled ? -1 : 0}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault()
                handleItemClick(itemId, item)
              }
            }}
          >
            {renderItem ? renderItem(item, selected) : defaultRenderItem(item, selected)}
          </Box>
        )
      })}
    </Box>
  )
}

export default SelectionPicker