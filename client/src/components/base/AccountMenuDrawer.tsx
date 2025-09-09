import React from 'react'
import { IoIosHome, IoIosBuild, IoIosCog, IoIosLogOut } from 'react-icons/io'
import { Box } from './Box'
import { Button } from './Button'
import SlidingDrawer from './SlidingDrawer'

interface UserInfo {
    firstName?: string
    lastName?: string
    email: string
    role: 'Tenant' | 'HomeOwner' | 'Manager'
}

interface AccountMenuDrawerProps {
    /**
     * Whether the drawer is open
     */
    isOpen: boolean
    
    /**
     * Callback when drawer should close
     */
    onClose: () => void
    
    /**
     * Current user information
     */
    userInfo: UserInfo
    
    /**
     * Available roles for this user
     */
    availableRoles: ('Tenant' | 'HomeOwner' | 'Manager')[]
    
    /**
     * Callback when user selects a new role
     */
    onRoleSelect: (role: 'Tenant' | 'HomeOwner' | 'Manager') => void
    
    /**
     * Navigation handlers
     */
    onNavigateToProperties: () => void
    onNavigateToBookings: () => void
    onLogout: () => void
}

/**
 * Unified Account Menu Drawer Component
 * 
 * A bottom sliding drawer that combines user account management:
 * - User info display 
 * - Navigation to My Properties/Bookings
 * - Role switching (if available)
 * - Account actions (logout)
 */
const AccountMenuDrawer: React.FC<AccountMenuDrawerProps> = ({
    isOpen,
    onClose,
    userInfo,
    availableRoles,
    onRoleSelect,
    onNavigateToProperties,
    onNavigateToBookings,
    onLogout
}) => {
    // Get role display configuration
    const getRoleConfig = (role: 'Tenant' | 'HomeOwner' | 'Manager') => {
        switch (role) {
            case 'HomeOwner':
                return {
                    displayName: 'Host',
                    color: '#059669',
                    icon: <IoIosBuild />,
                    description: 'Manage properties and bookings'
                }
            case 'Manager':
                return {
                    displayName: 'Manager', 
                    color: '#dc2626',
                    icon: <IoIosCog />,
                    description: 'Full system management access'
                }
            default: // Tenant
                return {
                    displayName: 'Guest',
                    color: '#2563eb',
                    icon: <IoIosHome />,
                    description: 'Browse and book properties'
                }
        }
    }

    const currentRoleConfig = getRoleConfig(userInfo.role)
    const canSwitchRoles = availableRoles.length > 1

    // Get user display name
    const displayName = userInfo.firstName && userInfo.lastName 
        ? `${userInfo.firstName} ${userInfo.lastName}`
        : userInfo.email.split('@')[0]

    return (
        <SlidingDrawer isOpen={isOpen} onClose={onClose} side="bottom">
            <Box padding="1.5rem" paddingBottom="2rem">
                
                {/* Title */}
                <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1.5rem" textAlign="center">
                    Account
                </Box>
                
                {/* User Info Section */}
                <Box marginBottom="2rem" padding="1rem" backgroundColor="#f8f9fa" borderRadius="8px">
                    <Box fontSize="0.875rem" color="#666" marginBottom="0.25rem">Welcome back</Box>
                    <Box fontSize="1rem" fontWeight="600" marginBottom="0.25rem">{displayName}</Box>
                    <Box fontSize="0.875rem" color="#666" marginBottom="0.75rem">{userInfo.email}</Box>
                    
                    {/* Current Role Display */}
                    <Box display="flex" alignItems="center" gap="0.5rem">
                        <Box color={currentRoleConfig.color}>
                            {currentRoleConfig.icon}
                        </Box>
                        <Box fontSize="0.875rem" fontWeight="500" color={currentRoleConfig.color}>
                            Current: {currentRoleConfig.displayName}
                        </Box>
                    </Box>
                </Box>

                {/* Navigation Section */}
                <Box marginBottom="2rem">
                    <Box fontSize="0.875rem" fontWeight="600" color="#374151" marginBottom="1rem">
                        Quick Actions
                    </Box>
                    <Box display="flex" flexDirection="column" gap="0.5rem">
                        <Button
                            label="My Properties"
                            icon={<IoIosBuild />}
                            onClick={() => {
                                onClose()
                                onNavigateToProperties()
                            }}
                            variant="normal"
                            size="medium"
                            style={{ justifyContent: 'flex-start' }}
                        />
                        <Button
                            label="My Bookings"
                            icon={<IoIosHome />}
                            onClick={() => {
                                onClose()
                                onNavigateToBookings()
                            }}
                            variant="normal"
                            size="medium"
                            style={{ justifyContent: 'flex-start' }}
                        />
                    </Box>
                </Box>

                {/* Role Switching Section (only if user can switch roles) */}
                {canSwitchRoles && (
                    <Box marginBottom="2rem">
                        <Box fontSize="0.875rem" fontWeight="600" color="#374151" marginBottom="1rem">
                            Switch Role
                        </Box>
                        <Box display="flex" flexDirection="column" gap="0.5rem">
                            {availableRoles
                                .filter(role => role !== userInfo.role) // Don't show current role
                                .map(role => {
                                    const roleConfig = getRoleConfig(role)
                                    return (
                                        <Button
                                            key={role}
                                            label={`Switch to ${roleConfig.displayName}`}
                                            icon={roleConfig.icon}
                                            onClick={() => {
                                                onRoleSelect(role)
                                                onClose()
                                            }}
                                            variant="normal"
                                            size="medium"
                                            style={{ 
                                                justifyContent: 'flex-start',
                                                color: roleConfig.color,
                                                borderColor: roleConfig.color + '33'
                                            }}
                                        />
                                    )
                                })}
                        </Box>
                        <Box fontSize="0.75rem" color="#6b7280" marginTop="0.5rem" textAlign="center">
                            Your role affects what features you can access
                        </Box>
                    </Box>
                )}

                {/* Account Actions */}
                <Box>
                    <Box fontSize="0.875rem" fontWeight="600" color="#374151" marginBottom="1rem">
                        Account
                    </Box>
                    <Button
                        label="Logout"
                        icon={<IoIosLogOut />}
                        onClick={() => {
                            onClose()
                            onLogout()
                        }}
                        variant="normal"
                        size="medium"
                        style={{ 
                            justifyContent: 'flex-start',
                            color: '#dc2626',
                            width: '100%'
                        }}
                    />
                </Box>
            </Box>
        </SlidingDrawer>
    )
}

export default AccountMenuDrawer