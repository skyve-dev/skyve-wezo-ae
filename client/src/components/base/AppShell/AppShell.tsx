import React, {ReactNode, useCallback, useEffect, useState} from 'react'
import {Box} from '../Box'
import {Button} from '../Button'
import SlidingDrawer from '../SlidingDrawer'
import Tab, {TabItem} from '../Tab'
import Dialog from '../Dialog'
import AppShellContext from './AppShellContext'
import {
    AlertDialogOptions,
    AppShellConfig,
    AppShellContextType,
    BaseRoute,
    NavigateToFunction,
    OnAfterNavigateFunction,
    OnBeforeNavigateFunction,
    RouteDefinition,
    RouteInfo
} from './types'
import {FaBars, FaTimes} from 'react-icons/fa'
import {getCurrentPath, isSamePath, navigateToUrl, pathToRouteKeyWithParams, routeKeyToPath, parseQueryParams} from './urlUtils'

interface AppShellProps<T extends Record<string, BaseRoute>> {
    routes: RouteDefinition<T>
    config?: AppShellConfig
    className?: string
    style?: React.CSSProperties
    initialRoute?: keyof T
    onBeforeNavigate?: OnBeforeNavigateFunction<T>
    onAfterNavigate?: OnAfterNavigateFunction
    children?: ReactNode
}

// Global dialog state for the AppShell
let globalDialogState: {
    isOpen: boolean
    options: AlertDialogOptions | null
    resolver: ((value: void) => void) | null
    setDialog?: (state: any) => void
} = {
    isOpen: false,
    options: null,
    resolver: null
}

const AppShell = <T extends Record<string, BaseRoute>>({
                                                           routes,
                                                           config,
                                                           initialRoute,
                                                           onBeforeNavigate,
                                                           onAfterNavigate,
                                                           children
                                                       }: AppShellProps<T>) => {
    // Helper function to get initial route and params from URL
    const getInitialRouteAndParams = useCallback((): { route: string; params: Record<string, any> } => {
        if (typeof window === 'undefined') {
            return {
                route: (initialRoute as string) || Object.keys(routes)[0] || '',
                params: {}
            }
        }

        const fullPath = getCurrentPath() + window.location.search
        const { routeKey, params } = pathToRouteKeyWithParams(fullPath)

        // Check if the route key exists in our routes
        if (routes[routeKey]) {
            return { route: routeKey, params }
        }

        // Fallback to initialRoute or first route
        return {
            route: (initialRoute as string) || Object.keys(routes)[0] || '',
            params: {}
        }
    }, [routes, initialRoute])

    // Navigation state - initialize from URL
    const initialRouteData = getInitialRouteAndParams()
    const [currentRoute, setCurrentRoute] = useState<string>(initialRouteData.route)
    const [currentParams, setCurrentParams] = useState<Record<string, any>>(initialRouteData.params)

    // UI state
    const [isSideNavOpen, setSideNavOpen] = useState(false)
    const [isLoading, setLoading] = useState(false)

    // Dialog state
    const [dialogState, setDialogState] = useState<{
        isOpen: boolean
        options: AlertDialogOptions | null
        resolver: ((value: void) => void) | null
    }>({
        isOpen: false,
        options: null,
        resolver: null
    })

    // Set up global dialog state
    React.useEffect(() => {
        globalDialogState.setDialog = setDialogState
    }, [])

    // Handle URL changes and popstate events (back/forward navigation)
    useEffect(() => {
        const handlePopState = () => {
            const fullPath = getCurrentPath() + window.location.search
            const { routeKey, params } = pathToRouteKeyWithParams(fullPath)

            // Check if the route key exists in our routes
            if (routes[routeKey]) {
                setCurrentRoute(routeKey)
                setCurrentParams(params)
            } else {
                // If route doesn't exist, navigate to first available route
                const fallbackRoute = Object.keys(routes)[0]
                if (fallbackRoute) {
                    const fallbackPath = routeKeyToPath(fallbackRoute)
                    navigateToUrl(fallbackPath, {}, true) // Replace current URL
                    setCurrentRoute(fallbackRoute)
                    setCurrentParams({})
                }
            }
        }

        // Listen for browser back/forward navigation
        window.addEventListener('popstate', handlePopState)

        // Initial URL sync - ensure URL matches current route and params
        const currentPath = getCurrentPath()
        const expectedPath = routeKeyToPath(currentRoute)
        const currentQueryParams = parseQueryParams()
        
        // Check if path or params are different
        const pathChanged = !isSamePath(currentPath, expectedPath)
        const paramsChanged = JSON.stringify(currentQueryParams) !== JSON.stringify(currentParams)

        if (pathChanged || paramsChanged) {
            // URL doesn't match current route/params, update URL to match
            navigateToUrl(expectedPath, currentParams, true)
        }

        return () => {
            window.removeEventListener('popstate', handlePopState)
        }
    }, [routes, currentRoute, currentParams])

    // Sync URL when current route or params change programmatically
    useEffect(() => {
        const currentPath = getCurrentPath()
        const expectedPath = routeKeyToPath(currentRoute)
        const currentQueryParams = parseQueryParams()
        
        const pathChanged = !isSamePath(currentPath, expectedPath)
        const paramsChanged = JSON.stringify(currentQueryParams) !== JSON.stringify(currentParams)

        if (pathChanged || paramsChanged) {
            navigateToUrl(expectedPath, currentParams, true)
        }
    }, [currentRoute, currentParams])

    // Type-safe navigation function with URL synchronization and event hooks
    const navigateTo: NavigateToFunction<T> = useCallback(async (routeKey: any, props?: any) => {
        const route = routes[routeKey]
        if (!route) {
            console.warn(`Route not found: ${routeKey}`)
            return
        }

        // Create source route info (current route before navigation)
        const sourceRouteInfo: RouteInfo = {
            path: routeKeyToPath(currentRoute),
            params: currentParams
        }

        // Create target route info (where we're trying to navigate)
        const targetRouteInfo: RouteInfo = {
            path: routeKeyToPath(routeKey as string),
            params: props || {}
        }

        // Track original navigation intent
        let finalRouteKey = routeKey
        let finalProps = props

        // Execute onBeforeNavigate hook if provided
        if (onBeforeNavigate) {
            let shouldContinue = false
            let redirectRequested = false

            // Create the next function that the hook will call
            const next = (newRouteKey?: any, newParams?: any) => {
                if (newRouteKey !== undefined) {
                    // Redirect to different route
                    finalRouteKey = newRouteKey
                    finalProps = newParams
                    redirectRequested = true
                }
                shouldContinue = true
            }

            try {
                await onBeforeNavigate(next, targetRouteInfo, sourceRouteInfo)
            } catch (error) {
                console.error('onBeforeNavigate error:', error)
                return // Abort navigation on error
            }

            // If next() was never called, abort navigation
            if (!shouldContinue) {
                return
            }

            // If redirect was requested, validate the new route and update target info
            if (redirectRequested) {
                if (!routes[finalRouteKey]) {
                    console.warn(`Redirect route not found: ${finalRouteKey}`)
                    return
                }
                // Update target route info for the redirect
                targetRouteInfo.path = routeKeyToPath(finalRouteKey as string)
                targetRouteInfo.params = finalProps || {}
            }
        }

        // Proceed with navigation (original or redirected)
        const routeKeyStr = finalRouteKey as string
        const urlPath = routeKeyToPath(routeKeyStr)
        const routeParams = finalProps || {}

        // Update browser URL with query parameters
        navigateToUrl(urlPath, routeParams)

        // Update internal state
        setCurrentRoute(routeKeyStr)
        setCurrentParams(routeParams)
        setSideNavOpen(false) // Close side nav on navigation

        // Create final target route info (in case of redirect)
        const finalTargetRouteInfo: RouteInfo = {
            path: urlPath,
            params: routeParams
        }

        // Execute onAfterNavigate hook if provided
        if (onAfterNavigate) {
            try {
                await onAfterNavigate(finalTargetRouteInfo, sourceRouteInfo)
            } catch (error) {
                console.error('onAfterNavigate error:', error)
                // Don't abort navigation, just log error
            }
        }
    }, [routes, currentRoute, onBeforeNavigate, onAfterNavigate])

    // Alert dialog function
    const alertDialog = useCallback((options: AlertDialogOptions): Promise<void> => {
        return new Promise((resolve) => {
            const dialogState = {
                isOpen: true,
                options: {
                    ...options,
                    buttons: options.buttons.map(button => ({
                        ...button,
                        onClick: async () => {
                            try {
                                await button.onClick()
                                setDialogState({isOpen: false, options: null, resolver: null})
                                // Update global state
                                globalDialogState.isOpen = false
                                globalDialogState.options = null
                                globalDialogState.resolver = null
                                resolve()
                            } catch (error) {
                                console.error('Dialog button error:', error)
                                // Still resolve to close dialog
                                setDialogState({isOpen: false, options: null, resolver: null})
                                globalDialogState.isOpen = false
                                globalDialogState.options = null
                                globalDialogState.resolver = null
                                resolve()
                            }
                        }
                    }))
                },
                resolver: resolve
            }

            setDialogState(dialogState)
            // Update global state for AppShell to access
            globalDialogState.isOpen = true
            globalDialogState.options = dialogState.options
            globalDialogState.resolver = resolve
        })
    }, [])

    // Close dialog helper
    const closeDialog = useCallback(() => {
        if (dialogState.resolver) {
            dialogState.resolver()
        }
        setDialogState({isOpen: false, options: null, resolver: null})
    }, [dialogState.resolver])

    const contextValue: AppShellContextType<T> = {
        navigateTo,
        currentRoute,
        currentParams,
        isSideNavOpen,
        setSideNavOpen,
        alertDialog,
        isLoading,
        setLoading,
        routes,
        // Expose dialog state for AppShell
        dialogState,
        closeDialog
    }

    // Content is always shown (splash screen removed)

    // Responsive state
    const [isMobile, setIsMobile] = useState(false)
    const [, setIsTablet] = useState(false)

    // Refs removed - splash screen functionality eliminated

    // Configuration with defaults
    const {
        header = {
            title: 'App',
            showQuickNav: true
        },
        footer = {
            showOnMobile: true,
            maxItems: 4
        },
        breakpoints = {
            mobile: 768,
            tablet: 1024,
            desktop: 1200
        },
        theme = {
            primaryColor: '#3b82f6',
            backgroundColor: '#f8fafc',
            navBackgroundColor: '#ffffff'
        }
    } = config || {}

    // Handle responsive breakpoints
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth
            setIsMobile(width < breakpoints.mobile)
            setIsTablet(width >= breakpoints.mobile && width < breakpoints.desktop)
        }

        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [breakpoints])

    // Splash screen removed - no effect needed

    // Get current route component
    const currentRouteData = routes[currentRoute as keyof T]
    const CurrentComponent = currentRouteData?.component

    // Get navigation items
    const navItems = Object.entries(routes)
        .filter(([_, route]) => route.showInNav !== false)
        .map(([path, route]) => ({
            id: path,
            label: route.label,
            icon: route.icon,
            onClick: () => navigateTo(path as keyof T, {} as any)
        }))

    // Get header quick nav items
    const headerNavItems: TabItem[] = Object.entries(routes)
        .filter(([_, route]) => route.showInHeader !== false && (!isMobile || route.showInFooter !== false))
        .slice(0, isMobile ? footer.maxItems : undefined)
        .map(([path, route]) => ({
            id: path,
            label: route.label,
            icon: route.icon,
            content: <></>
        }))

    // Get footer nav items (mobile only)
    const footerNavItems = Object.entries(routes)
        .filter(([_, route]) => route.showInFooter !== false)
        .slice(0, footer.maxItems)
        .map(([path, route]) => ({
            id: path,
            label: route.label,
            icon: route.icon,
            onClick: () => navigateTo(path as keyof T, {} as any)
        }))

    // Handle dialog button clicks
    const handleDialogButton = async (onClick: () => Promise<void>) => {
        try {
            await onClick()
            if (closeDialog) {
                closeDialog()
            }
        } catch (error) {
            console.error('Dialog button error:', error)
            // Still close dialog on error
            if (closeDialog) {
                closeDialog()
            }
        }
    }

    return (
        <AppShellContext.Provider value={contextValue as AppShellContextType}>
            <>
                    <>
                        {/* Header */}
                        <Box
                            position="sticky"
                            top="0"
                            zIndex="100"
                            backgroundColor={theme.navBackgroundColor}
                            borderBottom="1px solid #e5e7eb"
                            boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
                        >
                            <Box
                                display="flex"
                                alignItems="center"
                                justifyContent={'center'}
                                padding="1rem 1.5rem"
                                maxWidth="1200px"
                                margin="0 auto"
                            >
                                {/* Left: Menu Button + Logo/Title */}
                                <Box display="flex" alignItems="center" gap="1rem">

                                    {header.logo && (
                                        <Box fontSize="1.5rem" color={theme.primaryColor}>
                                            {header.logo}
                                        </Box>
                                    )}

                                    {header.title && (
                                        <Box
                                            fontSize="1.25rem"
                                            fontWeight="bold"
                                            color="#1a202c"
                                        >
                                            {header.title}
                                        </Box>
                                    )}


                                </Box>

                                {/* Center: Quick Navigation (Desktop/Tablet) */}
                                <Box display={'flex'} justifyContent={'flex-end'} paddingX={'1rem'} flexGrow={1}>
                                {header.showQuickNav && !isMobile && headerNavItems.length > 0 && (

                                        <Tab
                                            items={headerNavItems}
                                            activeTab={currentRoute}
                                            onTabChange={(tabId) => navigateTo(tabId as keyof T, {} as any)}
                                            variant="minimal"
                                            size="small"
                                            fullWidth
                                            centered
                                        />
                                )}
                                </Box>

                                {/* Right: Actions */}
                                {header.actions && (
                                    <Box display="flex" alignItems="center" gap="0.5rem">
                                        {header.actions}
                                    </Box>
                                )}
                                <Button
                                    label=""
                                    icon={<FaBars/>}
                                    onClick={() => setSideNavOpen(true)}
                                    variant="normal"
                                    size="small"
                                    backgroundColor="transparent"
                                    border="none"
                                    color={theme.primaryColor}
                                    aria-label="Open navigation menu"
                                />
                            </Box>
                        </Box>

                        {/* Main Content Area */}
                        <Box
                            flex="1"
                            paddingBottom={isMobile && footer.showOnMobile ? "4rem" : "0"}
                            minHeight="calc(100vh - 4rem)"
                        >
                            {children || (CurrentComponent && <CurrentComponent {...currentParams}/>)}
                        </Box>

                        {/* Footer (Mobile Only) */}
                        {isMobile && footer.showOnMobile && footerNavItems.length > 0 && (
                            <Box
                                position="sticky"
                                bottom="0"
                                left="0"
                                right="0"
                                backgroundColor={theme.navBackgroundColor}
                                borderTop="1px solid #e5e7eb"
                                zIndex="90"
                                paddingY="0.5rem"
                                boxShadow="0 -2px 10px rgba(0, 0, 0, 0.1)"
                            >
                                <Box
                                    display="flex"
                                    justifyContent="space-around"
                                    alignItems="center"
                                    maxWidth="100%"
                                    margin="0 auto"
                                    paddingX="1rem"
                                >
                                    {footerNavItems.map((item) => (
                                        <Button
                                            key={item.id}
                                            label={item.label}
                                            icon={item.icon}
                                            onClick={item.onClick}
                                            variant="normal"
                                            size="small"
                                            backgroundColor="transparent"
                                            border="none"
                                            color={currentRoute === item.id ? theme.primaryColor : '#6b7280'}
                                            fontWeight={currentRoute === item.id ? '600' : '400'}
                                            fontSize="0.75rem"

                                            flexDirection="column"
                                            gap="0.25rem"
                                            padding="0.5rem"
                                            style={{
                                                minWidth: 'auto',
                                                flex: 1
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* Side Navigation Drawer */}
                        <SlidingDrawer
                            isOpen={isSideNavOpen}
                            onClose={() => setSideNavOpen(false)}
                            side="left"
                            width="280px"
                            backgroundColor={theme.navBackgroundColor}
                        >
                            <Box padding="1.5rem">
                                {/* Drawer Header */}
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    marginBottom="2rem"
                                    paddingBottom="1rem"
                                    borderBottom="1px solid #e5e7eb"
                                >
                                    <Box display="flex" alignItems="center" gap="0.75rem">
                                        {header.logo && (
                                            <Box fontSize="1.5rem" color={theme.primaryColor}>
                                                {header.logo}
                                            </Box>
                                        )}
                                        <Box fontSize="1.25rem" fontWeight="bold" color="#1a202c">
                                            {header.title || 'Navigation'}
                                        </Box>
                                    </Box>

                                    <Button
                                        label=""
                                        icon={<FaTimes/>}
                                        onClick={() => setSideNavOpen(false)}
                                        variant="normal"
                                        size="small"
                                        backgroundColor="transparent"
                                        border="none"
                                        color="#6b7280"
                                        aria-label="Close navigation menu"
                                    />
                                </Box>

                                {/* Navigation Items */}
                                <Box display="flex" flexDirection="column" gap="0.5rem">
                                    {navItems.map((item) => (
                                        <Button
                                            key={item.id}
                                            label={item.label}
                                            icon={item.icon}
                                            onClick={item.onClick}
                                            variant="normal"
                                            size="medium"
                                            backgroundColor={currentRoute === item.id ? `${theme.primaryColor}15` : 'transparent'}
                                            border="none"
                                            color={currentRoute === item.id ? theme.primaryColor : '#374151'}
                                            fontWeight={currentRoute === item.id ? '600' : '500'}
                                            justifyContent="flex-start"
                                            width="100%"
                                            borderRadius="8px"
                                            padding="0.75rem 1rem"
                                            textAlign="left"
                                            whileHover={{
                                                backgroundColor: currentRoute === item.id
                                                    ? `${theme.primaryColor}20`
                                                    : `${theme.primaryColor}08`
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        </SlidingDrawer>

                        {/* Alert Dialog */}
                        {dialogState?.isOpen && dialogState.options && (
                            <Dialog
                                isOpen={true}
                                onClose={() => {
                                    if (closeDialog) {
                                        closeDialog()
                                    }
                                }}
                                width="400px"
                                disableBackdropClick
                            >
                                <Box padding="2rem" textAlign="center">
                                    {/* Icon */}
                                    {dialogState.options.icon && (
                                        <Box
                                            fontSize="3rem"
                                            marginBottom="1rem"
                                            color={theme.primaryColor}
                                        >
                                            {dialogState.options.icon}
                                        </Box>
                                    )}

                                    {/* Title */}
                                    <Box
                                        fontSize="1.5rem"
                                        fontWeight="600"
                                        marginBottom="1rem"
                                        color="#1a202c"
                                    >
                                        {dialogState.options.title}
                                    </Box>

                                    {/* Text */}
                                    <Box
                                        fontSize="1rem"
                                        color="#6b7280"
                                        marginBottom="2rem"
                                        lineHeight="1.5"
                                    >
                                        {dialogState.options.text}
                                    </Box>

                                    {/* Buttons */}
                                    <Box
                                        display="flex"
                                        gap="1rem"
                                        justifyContent="center"
                                        flexWrap="wrap"
                                    >
                                        {dialogState.options.buttons.map((button, index) => (
                                            <Button
                                                key={index}
                                                label={button.label}
                                                onClick={() => handleDialogButton(button.onClick)}
                                                variant={button.variant === 'primary' ? 'promoted' : button.variant === 'danger' ? 'normal' : button.variant || 'normal'}
                                                size="medium"
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            </Dialog>
                        )}

                        {/* Loading Overlay */}
                        {isLoading && (
                            <Box
                                position="fixed"
                                top="0"
                                left="0"
                                width="100%"
                                height="100%"
                                backgroundColor="rgba(0, 0, 0, 0.5)"
                                zIndex="9998"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <Box
                                    backgroundColor="white"
                                    borderRadius="8px"
                                    padding="2rem"
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="center"
                                    gap="1rem"
                                >
                                    <Box
                                        width="40px"
                                        height="40px"
                                        border="4px solid #f3f4f6"
                                        borderTop={`4px solid ${theme.primaryColor}`}
                                        borderRadius="50%"
                                        animation="spin 1s linear infinite"
                                        style={{
                                            animation: 'spin 1s linear infinite'
                                        }}
                                    />
                                    <Box fontSize="1rem" color="#6b7280">
                                        Loading...
                                    </Box>
                                </Box>
                            </Box>
                        )}
                    </>

                {/* CSS Animations */}
                <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
            </>
        </AppShellContext.Provider>
    )
}

export default AppShell