import React, { useState } from 'react'
import {Box} from '../Box'
import {Button} from '../Button'
import Tab, {TabItem} from '../Tab'
import {IoIosMenu, IoIosLogIn, IoIosPersonAdd, IoIosPerson, IoIosLogOut} from 'react-icons/io'
import {BaseRoute} from './types'
import { filterRoutesByRole } from './roleUtils'
import RoleToggleButton from '../RoleToggleButton'
import RoleSlidingDrawer from '../RoleSlidingDrawer'
import wezoAe from "../../../assets/wezo-optimized.svg"
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '../../../store'
import { switchUserRole, selectAvailableRoles, logout } from '../../../store/slices/authSlice'

interface HeaderDefaultProps<T extends Record<string, BaseRoute>> {
    routes: T
    currentRoute: string
    navigateTo: (route: keyof T, params?: any) => void
    setSideNavOpen: (open: boolean) => void
    isMobile: boolean
    currentRole: 'Tenant' | 'HomeOwner' | 'Manager' | null
    isAuthenticated: boolean
    openDialog: <T>(content: (close: (result: T) => void) => React.ReactNode) => Promise<T>
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
                                                                       openDialog,
                                                                       theme
                                                                   }: HeaderDefaultProps<T>) => {
    
    // State for role switching drawer
    const [isRoleDrawerOpen, setIsRoleDrawerOpen] = useState(false)
    const dispatch = useDispatch<AppDispatch>()
    
    // Get available roles from Redux
    const availableRoles = useSelector(selectAvailableRoles)
    // Handle role switching (client-side only)
    const handleRoleSelect = (role: 'Tenant' | 'HomeOwner' | 'Manager') => {
        dispatch(switchUserRole(role))
        setIsRoleDrawerOpen(false)
    }

    // Authentication navigation handlers
    const handleLogin = () => {
        navigateTo('login' as keyof T, {})
    }

    const handleRegister = () => {
        navigateTo('register' as keyof T, {})
    }

    const handleLogout = () => {
        dispatch(logout())
    }

    const handleUserMenu = async () => {
        await openDialog((close) => (
            <Box padding="2rem" backgroundColor="white" borderRadius="8px" minWidth="300px">
                <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1.5rem" textAlign="center">
                    Account Menu
                </Box>
                
                {/* User info */}
                <Box marginBottom="2rem" padding="1rem" backgroundColor="#f8f9fa" borderRadius="8px">
                    <Box fontSize="0.875rem" color="#666" marginBottom="0.25rem">Welcome back</Box>
                    <Box fontSize="1rem" fontWeight="600">Admin User</Box>
                    <Box fontSize="0.875rem" color="#666">admin@wezo.ae</Box>
                    <Box fontSize="0.875rem" color="#059669" fontWeight="500" marginTop="0.5rem">
                        Current Role: {currentRole}
                    </Box>
                </Box>

                {/* Menu options */}
                <Box display="flex" flexDirection="column" gap="0.5rem" marginBottom="1.5rem">
                    <Button
                        label="My Properties"
                        onClick={() => {
                            close(null)
                            navigateTo('properties', {})
                        }}
                        variant="normal"
                        size="small"
                        style={{ justifyContent: 'flex-start' }}
                    />
                    <Button
                        label="My Bookings"
                        onClick={() => {
                            close(null)
                            navigateTo('my-bookings', {})
                        }}
                        variant="normal"
                        size="small"
                        style={{ justifyContent: 'flex-start' }}
                    />
                </Box>

                {/* Actions */}
                <Box display="flex" gap="0.5rem" justifyContent="center">
                    <Button
                        label="Logout"
                        icon={<IoIosLogOut/>}
                        onClick={() => {
                            close(null)
                            handleLogout()
                        }}
                        variant="normal"
                        size="small"
                        style={{ color: '#dc2626' }}
                    />
                    <Button
                        label="Close"
                        onClick={() => close(null)}
                        variant="normal"
                        size="small"
                    />
                </Box>
            </Box>
        ))
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

            {/* Right: Authentication Controls + Menu Button */}
            <Box display="flex" alignItems="center" gap="0.5rem">
                {!isAuthenticated ? (
                    // Anonymous user: Show Login/Register buttons
                    <>
                        <Button
                            label="Login"
                            icon={<IoIosLogIn/>}
                            onClick={handleLogin}
                            variant="plain"
                            size="small"
                            style={{
                                color: 'white',
                                fontSize: '0.875rem'
                            }}
                        />
                        <Button
                            label="Register"
                            icon={<IoIosPersonAdd/>}
                            onClick={handleRegister}
                            variant="promoted"
                            size="small"
                            style={{
                                fontSize: '0.875rem'
                            }}
                        />
                    </>
                ) : (
                    // Authenticated user: Show user menu and role toggle
                    <>
                        {/* Role Toggle Button - only show for users with multiple roles */}
                        {currentRole && availableRoles.length > 1 && (
                            <RoleToggleButton
                                currentRole={currentRole}
                                onClick={() => setIsRoleDrawerOpen(true)}
                            />
                        )}
                        
                        {/* User menu button */}
                        <Button
                            label=""
                            icon={<IoIosPerson/>}
                            onClick={handleUserMenu}
                            variant="plain"
                            size="small"
                            style={{
                                color: 'white'
                            }}
                            title="User Menu"
                        />
                    </>
                )}

                {/* Menu Button */}
                <Button
                    label=""
                    icon={<IoIosMenu fontSize={'1.2rem'}/>}
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