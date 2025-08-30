import React from 'react'
import { FaUserCircle } from 'react-icons/fa'
import { Box } from './Box'
import { Button } from './Button'

interface RoleToggleButtonProps {
    /**
     * Current user role to display
     */
    currentRole: 'Tenant' | 'HomeOwner' | 'Manager'
    
    /**
     * User's name to show in tooltip
     */
    userName?: string
    
    /**
     * Callback when button is clicked to open role selection
     */
    onClick: () => void
    
    /**
     * Whether the button is disabled
     */
    disabled?: boolean
}

/**
 * Role Toggle Button Component
 * 
 * Displays current user role with colored indicator and opens role selection drawer.
 * Positioned in the top-right of AppShell header.
 * 
 * Features:
 * - Role-specific colors (Blue=Guest, Green=Host, Red=Manager)
 * - FaUserCircle icon with role text
 * - Tooltip showing current role
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <RoleToggleButton
 *   currentRole="HomeOwner"
 *   userName="John Doe"
 *   onClick={() => setRoleDrawerOpen(true)}
 * />
 * ```
 */
const RoleToggleButton: React.FC<RoleToggleButtonProps> = ({
    currentRole,
    userName,
    onClick,
    disabled = false
}) => {
    // Get role-specific configuration
    const getRoleConfig = () => {
        switch (currentRole) {
            case 'HomeOwner':
                return {
                    displayName: 'Host',
                    color: '#059669', // Green
                    backgroundColor: 'rgba(5, 150, 105, 0.1)',
                    hoverBackgroundColor: 'rgba(5, 150, 105, 0.15)'
                }
            case 'Manager':
                return {
                    displayName: 'Manager', 
                    color: '#dc2626', // Red
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    hoverBackgroundColor: 'rgba(220, 38, 38, 0.15)'
                }
            default: // Tenant
                return {
                    displayName: 'Guest',
                    color: '#2563eb', // Blue
                    backgroundColor: 'rgba(37, 99, 235, 0.1)', 
                    hoverBackgroundColor: 'rgba(37, 99, 235, 0.15)'
                }
        }
    }

    const config = getRoleConfig()

    // Create tooltip text
    const tooltipText = userName 
        ? `${userName} - Current: ${config.displayName} Mode`
        : `Current: ${config.displayName} Mode`

    return (
        <Button
            label=""
            onClick={onClick}
            disabled={disabled}
            variant="normal"
            size="medium"
            title={tooltipText}
            display="flex"
            alignItems="center"
            gap="0.5rem"
            padding="0.5rem 0.75rem"
            backgroundColor={config.backgroundColor}
            color={config.color}
            border="1px solid transparent"
            borderRadius="8px"
            style={{
                minWidth: 'unset',
                transition: 'all 0.2s ease',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                ':hover': disabled ? {} : {
                    backgroundColor: config.hoverBackgroundColor,
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }
            }}
        >
            {/* Role Icon */}
            <FaUserCircle 
                style={{ 
                    fontSize: '1.25rem',
                    color: config.color
                }} 
            />
            
            {/* Role Text */}
            <Box
                fontSize="0.875rem"
                fontWeight="600" 
                color={config.color}
                whiteSpace="nowrap"
                display={{
                    base: 'none',  // Hide on mobile
                    sm: 'block'    // Show on desktop
                }}
            >
                {config.displayName}
            </Box>
        </Button>
    )
}

export default RoleToggleButton