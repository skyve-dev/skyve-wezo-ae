import {Box} from '../Box'
import Tab, {TabItem} from '../Tab'
import {Button} from '../Button'
import {BaseRoute} from './types'
import { filterRoutesByRole } from './roleUtils'
import { IoIosHome, IoIosCash } from 'react-icons/io'
import wezoAe from "@/assets/wezo-optimized.svg";

interface SideNavDefaultProps<T extends Record<string, BaseRoute>> {
    routes: T
    currentRoute: string
    navigateTo: (route: keyof T, params?: any) => void
    setSideNavOpen: (open: boolean) => void
    currentRole: 'Tenant' | 'HomeOwner' | 'Manager' | null
    isAuthenticated: boolean
    onStartHosting?: () => void
    theme: {
        primaryColor: string
        backgroundColor: string
        navBackgroundColor: string
    }
}

export const SideNavDefault = <T extends Record<string, BaseRoute>>({
    routes,
    currentRoute,
    navigateTo,
    setSideNavOpen,
    currentRole,
    isAuthenticated,
    onStartHosting,
    theme
}: SideNavDefaultProps<T>) => {
    // Filter routes based on current user role
    const accessibleRoutes = filterRoutesByRole(routes, currentRole, isAuthenticated)
    
    // Get navigation items for side drawer (Tab format)
    const navTabItems: TabItem[] = Object.entries(accessibleRoutes)
        .filter(([_, route]) => route.showInNav !== false)
        .map(([path, route]) => ({
            id: path,
            label: route.label,
            icon: route.icon,
            content: <></> // Not needed for navigation tabs
        }))

    return (
        <Box>
            {/* Drawer Header */}
            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                marginBottom="2rem"
                padding="1rem"
                borderBottom="1px solid rgba(0,0,0,0.1)"
                background={theme.primaryColor}
            >
                <Box display="flex" alignItems={'flex-end'}>
                    <img src={wezoAe} alt="Wezo AE" style={{ width:'2.25rem'}}/>
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
            </Box>

            {/* Navigation Items - Vertical Tab */}
            <Tab
                items={navTabItems}
                activeTab={currentRoute}
                onTabChange={(tabId) => {
                    navigateTo(tabId as keyof T, {} as any)
                    setSideNavOpen(false) // Close drawer after navigation
                }}
                orientation="vertical"
                variant="pills"
                size="medium"
                fullWidth
                tabBarOnly
                activeColor={theme.primaryColor}
                inactiveColor={'rgba(0,0,0,0.8)'}
                backgroundColor="transparent"
                iconSize="1.25rem"
                iconLayout="row"
                style={{
                    width: '100%'
                }}
                tabBarStyle={{
                    gap: '0.5rem',
                    paddingLeft : '1.5rem',
                    paddingRight : '1.5rem'
                }}
            />
            
            {/* Start Hosting CTA - Only show for Tenant users */}
            {isAuthenticated && currentRole === 'Tenant' && onStartHosting && (
                <Box 
                    padding="1rem 1.5rem"
                    marginTop="2rem"
                >
                    <Button
                        label="Start Hosting"
                        icon={<IoIosHome />}
                        onClick={onStartHosting}
                        variant="promoted"
                        size="medium"
                        fullWidth
                        style={{
                            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                            border: 'none',
                            fontWeight: '600',
                            fontSize: '0.9375rem',
                            boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)'
                        }}
                    />
                    
                    {/* Earning potential teaser */}
                    <Box 
                        marginTop="0.75rem"
                        textAlign="center"
                        fontSize="0.75rem"
                        color="rgba(0,0,0,0.6)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        gap="0.25rem"
                    >
                        <IoIosCash style={{ fontSize: '0.6875rem' }} />
                        Earn up to AED 15,000+ per month
                    </Box>
                </Box>
            )}
        </Box>
    )
}

export default SideNavDefault