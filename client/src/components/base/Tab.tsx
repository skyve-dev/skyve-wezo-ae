import React, { useEffect, useRef, useState } from 'react'
import { Box } from './Box'

export interface TabItem {
    /**
     * Unique identifier for the tab
     */
    id: string
    
    /**
     * Display label for the tab
     */
    label: string
    
    /**
     * Optional icon component
     */
    icon?: React.ReactNode
    
    /**
     * Content to display when tab is active (optional if using as tab bar only)
     */
    content?: React.ReactNode
    
    /**
     * Whether the tab is disabled
     */
    disabled?: boolean
    
    /**
     * Optional badge or notification indicator
     */
    badge?: string | number
}

export interface TabProps {
    /**
     * Array of tab items
     */
    items: TabItem[]
    
    /**
     * Currently active tab ID
     */
    activeTab: string
    
    /**
     * Callback when tab changes
     */
    onTabChange: (tabId: string) => void
    
    /**
     * Tab layout orientation
     */
    orientation?: 'horizontal' | 'vertical'
    
    /**
     * Tab size variant
     */
    size?: 'small' | 'medium' | 'large'
    
    /**
     * Tab style variant
     */
    variant?: 'default' | 'pills' | 'underline' | 'minimal'
    
    /**
     * Whether tabs should take full width
     */
    fullWidth?: boolean
    
    /**
     * Custom class name for the container
     */
    className?: string
    
    /**
     * Custom styles for the container
     */
    style?: React.CSSProperties
    
    /**
     * Animation duration for focus ring in milliseconds
     */
    animationDuration?: number
    
    /**
     * Whether to center tab labels
     */
    centered?: boolean
    
    /**
     * Background color for the tab container
     */
    backgroundColor?: string
    
    /**
     * Active tab color
     */
    activeColor?: string
    
    /**
     * Inactive tab color
     */
    inactiveColor?: string
    
    /**
     * Display only as tab bar without content area
     */
    tabBarOnly?: boolean
    
    /**
     * Layout for icon and label arrangement
     */
    iconLayout?: 'row' | 'column'
    
    /**
     * Custom icon size (takes priority over size config)
     */
    iconSize?: string
    
    /**
     * Custom styles for the tab bar navigation container
     */
    tabBarStyle?: React.CSSProperties
}

const Tab: React.FC<TabProps> = ({
    items,
    activeTab,
    onTabChange,
    orientation = 'horizontal',
    size = 'medium',
    variant = 'default',
    fullWidth = false,
    className,
    style,
    animationDuration = 200,
    centered = false,
    backgroundColor = 'transparent',
    activeColor = '#3b82f6',
    inactiveColor = '#6b7280',
    tabBarOnly = false,
    iconLayout = 'row',
    iconSize,
    tabBarStyle
}) => {
    const tabsRef = useRef<(HTMLButtonElement | null)[]>([])
    const containerRef = useRef<HTMLDivElement>(null)
    const focusRingRef = useRef<HTMLDivElement>(null)
    const [focusRingStyle, setFocusRingStyle] = useState<React.CSSProperties>({})

    // Size configurations
    const sizeConfig = {
        small: {
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            minHeight: '2rem',
            iconSize: '1rem',
            gap: '0.5rem'
        },
        medium: {
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            minHeight: '2.5rem',
            iconSize: '1.25rem',
            gap: '0.75rem'
        },
        large: {
            padding: '1rem 2rem',
            fontSize: '1.125rem',
            minHeight: '3rem',
            iconSize: '1.5rem',
            gap: '1rem'
        }
    }

    const currentSize = sizeConfig[size]

    // Update focus ring position when active tab changes
    useEffect(() => {
        const activeIndex = items.findIndex(item => item.id === activeTab)
        const activeTabElement = tabsRef.current[activeIndex]
        
        if (activeTabElement && focusRingRef.current && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect()
            const tabRect = activeTabElement.getBoundingClientRect()
            
            // Calculate both X and Y positions relative to container
            const translateX = tabRect.left - containerRect.left
            const translateY = tabRect.top - containerRect.top
            setFocusRingStyle({
                width: `${tabRect.width}px`,
                height: `${tabRect.height}px`,
                transform: `translate(${translateX}px, ${translateY}px)`,
                transition: `all ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
            })
        }
    }, [activeTab, items, orientation, variant, animationDuration])

    // Handle keyboard navigation
    const handleKeyDown = (event: React.KeyboardEvent, tabId: string) => {
        const currentIndex = items.findIndex(item => item.id === tabId)
        let nextIndex = currentIndex

        switch (event.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                event.preventDefault()
                do {
                    nextIndex = nextIndex > 0 ? nextIndex - 1 : items.length - 1
                } while (items[nextIndex]?.disabled && nextIndex !== currentIndex)
                break
            case 'ArrowRight':
            case 'ArrowDown':
                event.preventDefault()
                do {
                    nextIndex = nextIndex < items.length - 1 ? nextIndex + 1 : 0
                } while (items[nextIndex]?.disabled && nextIndex !== currentIndex)
                break
            case 'Home':
                event.preventDefault()
                nextIndex = 0
                while (items[nextIndex]?.disabled && nextIndex < items.length - 1) {
                    nextIndex++
                }
                break
            case 'End':
                event.preventDefault()
                nextIndex = items.length - 1
                while (items[nextIndex]?.disabled && nextIndex > 0) {
                    nextIndex--
                }
                break
            case 'Enter':
            case ' ':
                event.preventDefault()
                if (!items[currentIndex]?.disabled) {
                    onTabChange(tabId)
                }
                return
            default:
                return
        }

        if (nextIndex !== currentIndex && !items[nextIndex]?.disabled) {
            tabsRef.current[nextIndex]?.focus()
            onTabChange(items[nextIndex].id)
        }
    }

    // Get variant-specific styles
    const getVariantStyles = (isActive: boolean, disabled: boolean) => {
        const baseStyles = {
            position: 'relative' as const,
            display: 'flex',
            flexDirection: iconLayout as 'row' | 'column',
            alignItems: 'center',
            justifyContent: centered ? 'center' : 'flex-start',
            gap: iconLayout === 'column' ? '0.25rem' : currentSize.gap,
            padding: currentSize.padding,
            fontSize: currentSize.fontSize,
            fontWeight: isActive ? '600' : '500',
            minHeight: currentSize.minHeight,
            border: 'none',
            background: 'transparent',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            transition: `all ${animationDuration}ms ease`,
            outline: 'none',
            textDecoration: 'none',
            color: disabled ? '#9ca3af' : (isActive ? activeColor : inactiveColor),
            zIndex: 1
        }

        switch (variant) {
            case 'pills':
                return {
                    ...baseStyles,
                    borderRadius: '9999px',
                    backgroundColor: isActive ? activeColor : 'transparent',
                    color: isActive ? 'white' : inactiveColor
                }
            case 'underline':
                return {
                    ...baseStyles,
                    // borderBottom: isActive && orientation === 'horizontal' ? `2px solid ${activeColor}` : '2px solid transparent',
                    // borderLeft: isActive && orientation === 'vertical' ? `2px solid ${activeColor}` : '2px solid transparent'
                }
            case 'minimal':
                return {
                    ...baseStyles,
                    padding: '0.5rem',
                    fontWeight: isActive ? '600' : '400'
                }
            default:
                return {
                    ...baseStyles,
                    backgroundColor: isActive ? `${activeColor}10` : 'transparent',
                    borderRadius: '6px'
                }
        }
    }

    // Get focus ring styles based on variant
    const getFocusRingStyles = () => {
        const baseStyles = {
            position: 'absolute' as const,
            pointerEvents: 'none' as const,
            zIndex: 0,
            ...focusRingStyle
        }

        switch (variant) {
            case 'pills':
                return {
                    ...baseStyles,
                    backgroundColor: activeColor,
                    borderRadius: '9999px'
                }
            case 'underline':
                return {
                    ...baseStyles,
                    //backgroundColor: activeColor,
                    borderRadius: 0,
                    borderBottom : orientation === 'horizontal' ? `2px solid ${activeColor}` : `2px solid transparent`,
                    borderLeft : orientation === 'vertical' ? `2px solid ${activeColor}` : `2px solid transparent`,
                }
            case 'minimal':
                return {
                    ...baseStyles,
                    backgroundColor: `${activeColor}20`,
                    borderRadius: '4px'
                }
            default:
                return {
                    ...baseStyles,
                    backgroundColor: `${activeColor}15`,
                    borderRadius: '6px',
                    border: `1px solid ${activeColor}30`
                }
        }
    }

    const activeItem = items.find(item => item.id === activeTab)

    return (
        <Box className={className} display={'flex'} flexDirection={'column'} style={style}>
            {/* Tab Navigation */}
            <Box
                ref={containerRef}
                display="flex"
                flexDirection={orientation === 'vertical' ? 'column' : 'row'}
                position="relative"
                backgroundColor={backgroundColor}
                flexWrap="wrap"
                borderRadius="8px"
                //padding={variant === 'underline' ? '0' : '0.25rem'}
                width={fullWidth ? '100%' : 'auto'}
                role="tablist"
                aria-orientation={orientation}
                style={tabBarStyle}
            >
                {/* Animated Focus Ring */}
                {variant !== 'pills' && (
                    <Box
                        ref={focusRingRef}
                        style={getFocusRingStyles()}
                    />
                )}

                {/* Tab Buttons */}
                {items.map((item, index) => {
                    const isActive = item.id === activeTab
                    
                    return (
                        <Box
                            key={item.id}
                            as="button"
                            ref={(el: HTMLButtonElement | null) => (tabsRef.current[index] = el as any)}
                            role="tab"
                            aria-selected={isActive}
                            aria-controls={`tabpanel-${item.id}`}
                            aria-disabled={item.disabled}
                            tabIndex={isActive ? 0 : -1}
                            onClick={() => !item.disabled && onTabChange(item.id)}
                            onKeyDown={(e) => handleKeyDown(e, item.id)}
                            style={getVariantStyles(isActive, !!item.disabled)}
                            flex={fullWidth ? 1 : 'none'}
                            whileHover={!item.disabled ? {
                                backgroundColor: variant === 'pills' 
                                    ? (isActive ? activeColor : `${activeColor}10`)
                                    : `${activeColor}08`
                            } : undefined}
                            whileFocus={{
                                outlineOffset: '2px'
                            }}
                        >
                            {/* Icon */}
                            {item.icon && (
                                <Box 
                                    fontSize={iconSize || currentSize.iconSize}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    {item.icon}
                                </Box>
                            )}

                            {/* Label */}
                            <Box as="span">
                                {item.label}
                            </Box>

                            {/* Badge */}
                            {item.badge && (
                                <Box
                                    as="span"
                                    fontSize="0.75rem"
                                    fontWeight="700"
                                    backgroundColor={isActive ? 'rgba(255,255,255,0.3)' : activeColor}
                                    color={isActive && variant === 'pills' ? 'white' : 'white'}
                                    borderRadius="9999px"
                                    padding="0.125rem 0.375rem"
                                    minWidth="1.25rem"
                                    height="1.25rem"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    {item.badge}
                                </Box>
                            )}
                        </Box>
                    )
                })}
            </Box>

            {/* Tab Content */}
            {!tabBarOnly && activeItem?.content && (
                <Box
                    id={`tabpanel-${activeTab}`}
                    role="tabpanel"
                    aria-labelledby={`tab-${activeTab}`}
                >
                    {activeItem.content}
                </Box>
            )}
        </Box>
    )
}

export default Tab