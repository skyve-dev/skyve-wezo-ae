import React, {ReactNode, useCallback, useEffect, useRef, useState} from 'react'
import {Box} from '../Box'
import {Button} from '../Button'
import SlidingDrawer from '../SlidingDrawer'
import Tab, {TabItem} from '../Tab'
import Dialog from '../Dialog'
import ScrollbarOverlay from '../ScrollbarOverlay'
import AppShellContext from './AppShellContext'
import {
    AlertDialogOptions,
    AppShellConfig,
    AppShellContextType,
    AppShellVisibility,
    AppShellVisibilityOptions,
    BaseRoute,
    NavigateToFunction,
    OnAfterNavigateFunction,
    OnBeforeNavigateFunction,
    RouteDefinition,
    RouteInfo
} from './types'
import {FaBars} from 'react-icons/fa'
import {
    getCurrentPath,
    isSamePath,
    navigateToUrl,
    parseQueryParams,
    pathToRouteKeyWithParams,
    routeKeyToPath
} from './urlUtils'

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
        const {routeKey, params} = pathToRouteKeyWithParams(fullPath)

        // Check if the route key exists in our routes
        if (routes[routeKey]) {
            return {route: routeKey, params}
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
    const [navigationHistory, setNavigationHistory] = useState<Array<{route: string, params: Record<string, any>}>>([])    

    // UI state
    const [isSideNavOpen, setSideNavOpen] = useState(false)
    const [isLoading, setLoading] = useState(false)

    // Visibility control state
    const [visibility, setVisibilityState] = useState<AppShellVisibility>({
        header: true,
        sideNav: true,
        footer: true
    })

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
            const {routeKey, params} = pathToRouteKeyWithParams(fullPath)

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

        // Add to navigation history (but don't add duplicates of the same route)
        setNavigationHistory(prev => {
            const lastEntry = prev[prev.length - 1]
            if (!lastEntry || lastEntry.route !== routeKeyStr) {
                return [...prev, { route: routeKeyStr, params: routeParams }]
            }
            return prev
        })
    }, [routes, currentRoute, currentParams, onBeforeNavigate, onAfterNavigate])

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

    // Visibility control functions
    const setVisibility = useCallback((options: AppShellVisibilityOptions) => {
        setVisibilityState(prev => ({
            header: options.header !== undefined ? options.header : prev.header,
            sideNav: options.sideNav !== undefined ? options.sideNav : prev.sideNav,
            footer: options.footer !== undefined ? options.footer : prev.footer
        }))
    }, [])

    const resetVisibility = useCallback(() => {
        setVisibilityState({
            header: true,
            sideNav: true,
            footer: true
        })
    }, [])

    // Navigate back function
    const navigateBack = useCallback(() => {
        // Try browser history first
        if (window.history.length > 1) {
            window.history.back()
        } else if (navigationHistory.length > 1) {
            // Fallback to our navigation history
            const previousEntry = navigationHistory[navigationHistory.length - 2]
            if (previousEntry) {
                navigateTo(previousEntry.route as keyof T, previousEntry.params as any)
                // Remove the last entry from history to avoid loops
                setNavigationHistory(prev => prev.slice(0, -1))
            }
        } else {
            // Fallback to first route if no history
            const firstRoute = Object.keys(routes)[0]
            if (firstRoute && firstRoute !== currentRoute) {
                navigateTo(firstRoute as keyof T, {} as any)
            }
        }
    }, [navigationHistory, routes, currentRoute, navigateTo])

    // Check if we can navigate back
    const canNavigateBack = window.history.length > 1 || navigationHistory.length > 1

    // Configuration with defaults (moved up for theme access)
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

    const contextValue: AppShellContextType<T> = {
        navigateTo,
        navigateBack,
        canNavigateBack,
        currentRoute,
        currentParams,
        alertDialog,
        isLoading,
        setLoading,
        routes,
        // Expose dialog state for AppShell
        dialogState,
        closeDialog,
        // Visibility control
        visibility,
        setVisibility,
        resetVisibility,
        // Theme
        theme: {
            primaryColor: theme.primaryColor || '#D52122',
            backgroundColor: theme.backgroundColor || '#FAFAFA',
            navBackgroundColor: theme.navBackgroundColor || '#ffffff'
        }
    }

    // Content is always shown (splash screen removed)

    // Responsive state
    const [isMobile, setIsMobile] = useState(false)
    const [, setIsTablet] = useState(false)

    // Scroll-based header/footer visibility
    const [isHeaderVisible, setHeaderVisible] = useState(true)
    const [isFooterVisible, setFooterVisible] = useState(true)
    const lastScrollY = useRef(0)
    const scrollAccumulator = useRef(0)
    const headerRef = useRef<HTMLDivElement>(null)
    const footerRef = useRef<HTMLDivElement>(null)

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

    // Handle scroll-based header/footer visibility
    useEffect(() => {
        const SCROLL_THRESHOLD = 50 // Minimum scroll distance to trigger hide/show
        const ACCUMULATOR_THRESHOLD = 10 // Accumulated scroll for gentle movements

        const handleScroll = () => {
            const currentScrollY = window.scrollY
            const scrollDelta = currentScrollY - lastScrollY.current

            // Accumulate small scroll movements
            scrollAccumulator.current += scrollDelta

            // Only act if accumulated scroll exceeds threshold or single scroll is large
            if (Math.abs(scrollAccumulator.current) > ACCUMULATOR_THRESHOLD || Math.abs(scrollDelta) > SCROLL_THRESHOLD) {
                // Scrolling down - hide header and footer
                if (scrollAccumulator.current > 0 && currentScrollY > SCROLL_THRESHOLD) {
                    setHeaderVisible(false)
                    setFooterVisible(false)
                }
                // Scrolling up - show header and footer
                else if (scrollAccumulator.current < 0) {
                    setHeaderVisible(true)
                    setFooterVisible(true)
                }

                // Reset accumulator after action
                scrollAccumulator.current = 0
            }

            // Always show header/footer when at the top
            if (currentScrollY <= 10) {
                setHeaderVisible(true)
                setFooterVisible(true)
                scrollAccumulator.current = 0
            }

            lastScrollY.current = currentScrollY
        }

        // Add scroll listener with passive flag for better performance
        window.addEventListener('scroll', handleScroll, {passive: true})

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    // Splash screen removed - no effect needed

    // Get current route component
    const currentRouteData = routes[currentRoute as keyof T]
    const CurrentComponent = currentRouteData?.component

    // Get navigation items for side drawer (Tab format)
    const navTabItems: TabItem[] = Object.entries(routes)
        .filter(([_, route]) => route.showInNav !== false)
        .map(([path, route]) => ({
            id: path,
            label: route.label,
            icon: route.icon,
            content: <></> // Not needed for navigation tabs
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

    // Get footer nav items (mobile only) - formatted as TabItem[]
    const footerNavItems: TabItem[] = Object.entries(routes)
        .filter(([_, route]) => route.showInFooter !== false)
        .slice(0, footer.maxItems)
        .map(([path, route]) => ({
            id: path,
            label: route.label,
            icon: route.icon
            // content is optional since we're using tabBarOnly
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
                    {/* Custom Scrollbar Overlay */}
                    <ScrollbarOverlay 
                        thumbColor="rgba(0, 0, 0, 0.2)"
                        thumbHoverColor="rgba(0, 0, 0, 0.4)"
                        trackColor="transparent"
                        hideDelay={1500}
                        minHeight={40}
                    />
                    {/* Header */}
                    <Box
                        ref={headerRef}
                        position="fixed"
                        top="0"
                        left="0"
                        right="0"
                        zIndex="100"
                        backgroundColor={theme.primaryColor}
                        color={theme.backgroundColor}
                        //background="linear-gradient(135deg, #ffffff 0%, #FAFAFA 100%)"
                        borderBottom="1px solid rgba(213, 33, 34, 0.08)"
                        boxShadow="0 2px 20px rgba(213, 33, 34, 0.08)"
                        style={{
                            transform: (isHeaderVisible && visibility.header) ? 'translateY(0)' : 'translateY(-100%)',
                            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
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
                                        tabBarOnly={true}
                                        size="small"
                                        fullWidth
                                        centered
                                        activeColor={theme.backgroundColor}
                                        inactiveColor={'rgba(255,255,255,0.8)'}
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
                                icon={<FaBars fontSize={'1.2rem'}/>}
                                onClick={() => setSideNavOpen(true)}
                                variant="plain"
                                size="small"
                                border="1px solid #CCC"
                                borderRadius="8px"
                                aria-label="Open navigation menu"
                                style={{
                                    color:'white',
                                    padding : 0
                                }}
                                whileHover={{
                                    backgroundColor: 'rgba(213, 33, 34, 0.1)',
                                    borderColor: theme.primaryColor
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Main Content Area */}
                    <Box
                        flex="1"
                        paddingTop={visibility.header ? "4rem" : '0px'} // Account for fixed header
                        paddingBottom={isMobile && footer.showOnMobile && visibility.footer ? "4rem" : "0"}
                        minHeight="100%"
                    >
                        {children || (CurrentComponent && <CurrentComponent {...currentParams}/>)}
                    </Box>

                    {/* Footer (Mobile Only) */}
                    {isMobile && footer.showOnMobile && footerNavItems.length > 0 && (
                        <Box
                            ref={footerRef}
                            position="fixed"
                            bottom="0"
                            left="0"
                            right="0"
                            background="linear-gradient(180deg, #ffffff 0%, #FAFAFA 100%)"
                            borderTop="1px solid rgba(213, 33, 34, 0.08)"
                            zIndex="90"
                            boxShadow="0 -2px 10px rgba(0, 0, 0, 0.1)"
                            style={{
                                transform: (isFooterVisible && visibility.footer) ? 'translateY(0)' : 'translateY(100%)',
                                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            <Tab
                                items={footerNavItems}
                                activeTab={currentRoute}
                                onTabChange={(tabId) => navigateTo(tabId as keyof T, {} as any)}
                                variant="underline"
                                size="small"
                                fullWidth
                                centered
                                tabBarOnly
                                iconSize={'1.5rem'}
                                iconLayout={'column'}
                                activeColor={'rgba(255,255,255,1)'}

                                inactiveColor="rgba(255,255,255,0.5)"
                                tabBarStyle={{background:theme.primaryColor,borderRadius:0}}
                            />
                        </Box>
                    )}

                    {/* Side Navigation Drawer */}
                    <SlidingDrawer
                        isOpen={isSideNavOpen && visibility.sideNav}
                        onClose={() => setSideNavOpen(false)}
                        side="left"
                        width="280px"
                        background={'linear-gradient(135deg, #ffffff 0%, #FAFAFA 100%)'}
                    >
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
                                    {header.logo && (
                                        <Box fontSize="1.5rem" color={theme.primaryColor}>
                                            {header.logo}
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
                                background="linear-gradient(135deg, #ffffff 0%, #FAFAFA 100%)"
                                borderRadius="16px"
                                padding="2rem"
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                gap="1rem"
                                boxShadow="0 20px 60px rgba(213, 33, 34, 0.15)"
                                border="1px solid rgba(213, 33, 34, 0.08)"
                            >
                                <Box
                                    width="40px"
                                    height="40px"
                                    border="4px solid rgba(213, 33, 34, 0.1)"
                                    borderTop={`4px solid ${theme.primaryColor}`}
                                    borderRadius="50%"
                                    animation="spin 1s linear infinite"
                                    style={{
                                        animation: 'spin 1s linear infinite',
                                        boxShadow: '0 0 20px rgba(213, 33, 34, 0.2)'
                                    }}
                                />
                                <Box fontSize="1rem" color="#6b7280">
                                    Loading...
                                </Box>
                            </Box>
                        </Box>
                    )}
                </>

                {/* CSS Animations and Luxury Theme Styles */}
                <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Luxury gradient effects */
        .luxury-gradient {
          background: linear-gradient(135deg, #D52122 0%, #B51D1E 100%);
        }
        
        .luxury-gradient-hover {
          background: linear-gradient(135deg, #E53132 0%, #C52D2E 100%);
        }
        
        .subtle-gradient {
          background: linear-gradient(135deg, rgba(213, 33, 34, 0.05) 0%, rgba(213, 33, 34, 0.02) 100%);
        }
        
        /* Custom scrollbar styling */
        ::-webkit-scrollbar {
          width: 0px;
          height: 0px;
        }
        
        
        /* Tab active state with gradient */
        .tab-active {
          background: linear-gradient(135deg, #D52122 0%, #B51D1E 100%) !important;
          color: #ffffff !important;
          box-shadow: 0 4px 15px rgba(213, 33, 34, 0.25);
        }
        
        /* Premium box shadow effects */
        .luxury-shadow {
          box-shadow: 0 10px 40px rgba(213, 33, 34, 0.1);
        }
        
        .luxury-shadow-hover {
          box-shadow: 0 15px 60px rgba(213, 33, 34, 0.15);
        }
      `}</style>
            </>
        </AppShellContext.Provider>
    )
}

export default AppShell