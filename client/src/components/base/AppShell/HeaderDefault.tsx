import React, { useState } from 'react'
import {Box} from '../Box'
import {Button} from '../Button'
import Tab, {TabItem} from '../Tab'
import {FaBars} from 'react-icons/fa'
import {BaseRoute} from './types'
import { filterRoutesByRole } from './roleUtils'
import RoleToggleButton from '../RoleToggleButton'
import RoleSlidingDrawer from '../RoleSlidingDrawer'
import wezoAe from "../../../assets/wezo-optimized.svg"
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '../../../store'
import { switchUserRole, selectAvailableRoles } from '../../../store/slices/authSlice'

interface HeaderDefaultProps<T extends Record<string, BaseRoute>> {
    routes: T
    currentRoute: string
    navigateTo: (route: keyof T, params?: any) => void
    setSideNavOpen: (open: boolean) => void
    isMobile: boolean
    currentRole: 'Tenant' | 'HomeOwner' | 'Manager' | null
    isAuthenticated: boolean
    headerConfig?: {
        title?: string
        logo?: React.ReactNode
        showQuickNav?: boolean
        actions?: React.ReactNode[]
    }
    theme: {
        primaryColor: string
        backgroundColor: string
        navBackgroundColor: string
    }
}

export const HeaderDefault = <T extends Record<string, BaseRoute>>({
                                                                       routes,
                                                                       currentRoute,
                                                                       navigateTo,
                                                                       setSideNavOpen,
                                                                       isMobile,
                                                                       currentRole,
                                                                       isAuthenticated,
                                                                       theme
                                                                   }: HeaderDefaultProps<T>) => {
    
    // State for role switching drawer
    const [isRoleDrawerOpen, setIsRoleDrawerOpen] = useState(false)
    const dispatch = useDispatch<AppDispatch>()
    
    // Get available roles from Redux
    const availableRoles = useSelector(selectAvailableRoles)

    // Handle role switching
    const handleRoleSelect = async (role: 'Tenant' | 'HomeOwner' | 'Manager') => {
        try {
            await dispatch(switchUserRole(role)).unwrap()
            setIsRoleDrawerOpen(false)
        } catch (error: any) {
            console.error('Role switch failed:', error)
            // Show error message to user
            const errorMessage = error.message || error || 'Failed to switch role'
            alert(`Role switch failed: ${errorMessage}`)
        }
    }

    // Filter routes based on current user role
    const accessibleRoutes = filterRoutesByRole(routes, currentRole, isAuthenticated)

    // Get header quick nav items
    const headerNavItems: TabItem[] = Object.entries(accessibleRoutes)
        .filter(([_, route]) => route.showInHeader !== false && (!isMobile || route.showInFooter !== false))
        .slice(0, isMobile ? 4 : undefined)
        .map(([path, route]) => ({
            id: path,
            label: route.label,
            icon: route.icon,
            content: <></>
        }))

    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent={'center'}
            padding="1rem 1.5rem"
            maxWidth="1200px"
            margin="0 auto"
        >
            {/* Left: Menu Button + Logo/Title */}
            <Box display="flex" alignItems={'flex-end'}>
                <img src={wezoAe} alt="Wezo AE" style={{ width:'2rem'}}/>
                <Box
                    fontSize="1.2rem"
                    fontWeight="bold"
                    marginLeft={'0rem'}
                    color="white"
                    marginBottom={'0.25rem'}
                >
                    ezo.ae
                </Box>
            </Box>

            {/* Center: Quick Navigation (Desktop/Tablet) */}
            <Box display={'flex'} justifyContent={'flex-end'} paddingX={'1rem'} flexGrow={1}>
                {!isMobile && headerNavItems.length > 0 && (
                    <Tab
                        items={headerNavItems}
                        activeTab={currentRoute}
                        onTabChange={(tabId) => navigateTo(tabId as keyof T, {} as any)}
                        variant="minimal"
                        tabBarOnly={true}
                        tabButtonMinWidth={'7rem'}
                        size="small"
                        fullWidth
                        centered
                        activeColor={theme.backgroundColor}
                        inactiveColor={'rgba(255,255,255,0.8)'}

                    />
                )}
            </Box>

            {/* Right: Role Toggle + Menu Button */}
            <Box display="flex" alignItems="center" gap="0.5rem">
                {/* Role Toggle Button - only show for authenticated users with multiple roles */}
                {isAuthenticated && currentRole && availableRoles.length > 1 && (
                    <RoleToggleButton
                        currentRole={currentRole}
                        onClick={() => setIsRoleDrawerOpen(true)}
                    />
                )}

                <Button
                    label=""
                    icon={<FaBars fontSize={'1.2rem'}/>}
                    onClick={() => setSideNavOpen(true)}
                    variant="plain"
                    size="small"
                    border="1px solid #CCC"
                    borderRadius="8px"
                    aria-label="Open navigation menu"
                    style={{
                        color: 'white',
                        padding: 0
                    }}
                    whileHover={{
                        backgroundColor: 'rgba(213, 33, 34, 0.1)',
                        borderColor: theme.primaryColor
                    }}
                />
            </Box>

            {/* Role Switching Drawer */}
            <RoleSlidingDrawer
                isOpen={isRoleDrawerOpen}
                onClose={() => setIsRoleDrawerOpen(false)}
                userInfo={{
                    firstName: 'Admin',
                    lastName: 'User', 
                    email: 'admin@wezo.ae',
                    role: currentRole || 'Tenant'
                }}
                availableRoles={availableRoles}
                onRoleSelect={handleRoleSelect}
            />
        </Box>
    )
}

export default HeaderDefault