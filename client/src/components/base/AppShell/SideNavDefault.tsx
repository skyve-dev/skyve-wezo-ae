import React from 'react'
import { Box } from '../Box'
import Tab, { TabItem } from '../Tab'
import { BaseRoute } from './types'

interface SideNavDefaultProps<T extends Record<string, BaseRoute>> {
    routes: T
    currentRoute: string
    navigateTo: (route: keyof T, params?: any) => void
    setSideNavOpen: (open: boolean) => void
    headerConfig?: {
        logo?: React.ReactNode
    }
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
    headerConfig,
    theme
}: SideNavDefaultProps<T>) => {
    // Get navigation items for side drawer (Tab format)
    const navTabItems: TabItem[] = Object.entries(routes)
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
                <Box display="flex" alignItems="center" gap="0.75rem">
                    {headerConfig?.logo && (
                        <Box fontSize="1.5rem" color={theme.primaryColor}>
                            {headerConfig.logo}
                        </Box>
                    )}
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
        </Box>
    )
}

export default SideNavDefault