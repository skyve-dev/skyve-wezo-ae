import React from 'react'
import { FaHome, FaBuilding, FaCog } from 'react-icons/fa'
import { Box } from './Box'
import { SlidingDrawer } from './SlidingDrawer'
import { SelectionPicker } from './SelectionPicker'

interface UserInfo {
    firstName?: string
    lastName?: string
    email: string
    role: 'Tenant' | 'HomeOwner' | 'Manager'
}

interface RoleOption {
    id: 'Tenant' | 'HomeOwner' | 'Manager'
    displayName: string
    description: string
    icon: React.ReactNode
}

interface RoleSlidingDrawerProps {
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
     * Currently selected role in the picker
     */
    selectedRole?: 'Tenant' | 'HomeOwner' | 'Manager'
}

/**
 * Role Sliding Drawer Component
 * 
 * A bottom sliding drawer that shows user information and allows role selection.
 * Uses SelectionPicker for role options with icons and descriptions.
 * 
 * Features:
 * - User info display (name, email, current role)
 * - Role selection with icons and descriptions
 * - Only shows available roles for the user
 * - Slides from bottom with close button
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <RoleSlidingDrawer
 *   isOpen={isRoleDrawerOpen}
 *   onClose={() => setIsRoleDrawerOpen(false)}
 *   userInfo={{
 *     firstName: "John",
 *     lastName: "Doe", 
 *     email: "john@example.com",
 *     role: "HomeOwner"
 *   }}
 *   availableRoles={["Tenant", "HomeOwner"]}
 *   selectedRole={currentRole}
 *   onRoleSelect={handleRoleChange}
 * />
 * ```
 */
const RoleSlidingDrawer: React.FC<RoleSlidingDrawerProps> = ({
    isOpen,
    onClose,
    userInfo,
    availableRoles,
    selectedRole,
    onRoleSelect
}) => {
    // Define all possible role options
    const allRoleOptions: RoleOption[] = [
        {
            id: 'Tenant',
            displayName: 'Guest',
            description: 'Browse and book properties',
            icon: <FaHome style={{ fontSize: '1.5rem', color: '#2563eb' }} />
        },
        {
            id: 'HomeOwner', 
            displayName: 'Host',
            description: 'Manage your listings',
            icon: <FaBuilding style={{ fontSize: '1.5rem', color: '#059669' }} />
        },
        {
            id: 'Manager',
            displayName: 'Manager',
            description: 'Manage all properties', 
            icon: <FaCog style={{ fontSize: '1.5rem', color: '#dc2626' }} />
        }
    ]

    // Filter role options based on available roles
    const availableRoleOptions = allRoleOptions.filter(option => 
        availableRoles.includes(option.id)
    )

    // Get display name for current role
    const getCurrentRoleDisplayName = () => {
        const currentRoleOption = allRoleOptions.find(option => option.id === userInfo.role)
        return currentRoleOption?.displayName || userInfo.role
    }

    // Get user display name
    const getUserDisplayName = () => {
        if (userInfo.firstName) {
            return `${userInfo.firstName}${userInfo.lastName ? ` ${userInfo.lastName}` : ''}`
        }
        return userInfo.email.split('@')[0] // Fallback to email username
    }

    // Handle role selection
    const handleRoleChange = (value: string | number | (string | number)[]) => {
        if (typeof value === 'string') {
            onRoleSelect(value as 'Tenant' | 'HomeOwner' | 'Manager')
        }
    }

    // Custom render function for role options
    const renderRoleOption = (option: RoleOption, isSelected: boolean) => (
        <Box
            display="flex"
            alignItems="center"
            gap="1rem"
            padding="1rem"
            borderRadius="8px"
            backgroundColor={isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent'}
            border={isSelected ? '2px solid #3b82f6' : '2px solid transparent'}
            cursor="pointer"
            transition="all 0.2s ease"
            style={{
                ':hover': {
                    backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(0, 0, 0, 0.05)'
                }
            }}
        >
            {/* Role Icon */}
            <Box flexShrink={0}>
                {option.icon}
            </Box>

            {/* Role Info */}
            <Box flex="1">
                <Box
                    fontSize="1rem"
                    fontWeight="600"
                    color="#1f2937"
                    marginBottom="0.25rem"
                >
                    {option.displayName}
                </Box>
                <Box
                    fontSize="0.875rem"
                    color="#6b7280"
                    lineHeight="1.4"
                >
                    {option.description}
                </Box>
            </Box>

            {/* Selection Indicator */}
            {isSelected && (
                <Box
                    width="1.5rem"
                    height="1.5rem"
                    borderRadius="50%"
                    backgroundColor="#3b82f6"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                >
                    <Box
                        width="0.5rem"
                        height="0.5rem"
                        borderRadius="50%"
                        backgroundColor="white"
                    />
                </Box>
            )}
        </Box>
    )

    return (
        <SlidingDrawer
            isOpen={isOpen}
            onClose={onClose}
            side="bottom"
            height="auto"
            showCloseButton={true}
            backgroundColor="white"
            contentStyles={{
                maxHeight: '80vh',
                borderRadius: '1rem 1rem 0 0',
                overflow: 'auto'
            }}
        >
            <Box padding="1.5rem" paddingTop="1rem">
                {/* User Information Header */}
                <Box marginBottom="2rem">
                    {/* User Name */}
                    <Box
                        fontSize="1.25rem"
                        fontWeight="600"
                        color="#1f2937"
                        marginBottom="0.25rem"
                    >
                        Hi, {getUserDisplayName()}
                    </Box>

                    {/* User Email */}
                    <Box
                        fontSize="0.875rem"
                        color="#6b7280"
                        marginBottom="0.5rem"
                    >
                        {userInfo.email}
                    </Box>

                    {/* Current Role */}
                    <Box
                        fontSize="0.875rem"
                        color="#374151"
                        fontWeight="500"
                    >
                        Current: {getCurrentRoleDisplayName()} Mode
                    </Box>
                </Box>

                {/* Role Selection */}
                <Box>
                    <Box
                        fontSize="1rem"
                        fontWeight="600"
                        color="#1f2937"
                        marginBottom="1rem"
                    >
                        Switch Mode
                    </Box>

                    <SelectionPicker
                        data={availableRoleOptions}
                        idAccessor={(option) => option.id}
                        value={selectedRole || userInfo.role}
                        onChange={handleRoleChange}
                        isMultiSelect={false}
                        renderItem={renderRoleOption}
                        display="flex"
                        flexDirection="column"
                        gap="0.75rem"
                    />
                </Box>

                {/* Bottom Spacing for Mobile */}
                <Box height="1rem" />
            </Box>
        </SlidingDrawer>
    )
}

export default RoleSlidingDrawer