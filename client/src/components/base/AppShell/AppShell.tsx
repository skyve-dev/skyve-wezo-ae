import React, {ReactNode, useCallback, useEffect, useRef, useState} from 'react'
import {Box} from '../Box'
import SlidingDrawer from '../SlidingDrawer'
import ScrollbarOverlay from '../ScrollbarOverlay'
import AppShellContext from './AppShellContext'
import {PromiseDialogProvider, usePromiseDialog} from './PromiseDialogProvider'
import {DynamicContentProvider, useDynamicContent} from './DynamicContentProvider'
import HeaderDefault from './HeaderDefault'
import SideNavDefault from './SideNavDefault'
import FooterDefault from './FooterDefault'
import { useSelector } from 'react-redux'
import { selectCurrentRoleMode, selectIsAuthenticated } from '@/store/slices/authSlice'
import {
    AppShellConfig,
    AppShellContextType,
    BaseRoute,
    GuardRegistrationFunction,
    NavigateToFunction,
    NavigationGuardFunction,
    OnAfterNavigateFunction,
    OnBeforeNavigateFunction,
    RouteDefinition,
    RouteInfo
} from './types'
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


// Internal AppShell component that uses the promise dialog context
const AppShellInternal = <T extends Record<string, BaseRoute>>({
                                                                   routes,
                                                                   config,
                                                                   initialRoute,
                                                                   onBeforeNavigate,
                                                                   onAfterNavigate,
                                                                   children
                                                               }: AppShellProps<T>) => {
    const {openDialog, addToast} = usePromiseDialog();
    const {content, visibility, mountHeader, mountSideNav, mountFooter} = useDynamicContent();
    
    // Get current role and authentication state from Redux
    const currentRole = useSelector(selectCurrentRoleMode)
    const isAuthenticated = useSelector(selectIsAuthenticated)
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
    const [navigationHistory, setNavigationHistory] = useState<Array<{
        route: string,
        params: Record<string, any>
    }>>([])

    // UI state
    const [isSideNavOpen, setSideNavOpen] = useState(false)
    const [isLoading, setLoading] = useState(false)

    // Navigation guards state
    const navigationGuards = useRef<Set<NavigationGuardFunction>>(new Set())

    // Guard registration function
    const registerNavigationGuard: GuardRegistrationFunction = useCallback((guard: NavigationGuardFunction) => {
        navigationGuards.current.add(guard)

        return () => {
            navigationGuards.current.delete(guard)
        }
    }, [])

    // Check all navigation guards
    const checkNavigationGuards = useCallback(async (): Promise<boolean> => {
        const guards = Array.from(navigationGuards.current)

        for (const guard of guards) {
            try {
                const canNavigate = await guard()
                if (!canNavigate) {
                    return false
                }
            } catch (error) {
                console.error('Navigation guard error:', error)
                return false
            }
        }

        return true
    }, [])

    // Handle URL changes and popstate events (back/forward navigation)
    useEffect(() => {
        const handlePopState = async () => {
            // Check navigation guards first
            const canNavigate = await checkNavigationGuards()
            if (!canNavigate) {
                // Guards blocked navigation - restore previous URL
                const currentPath = routeKeyToPath(currentRoute)
                navigateToUrl(currentPath, currentParams, true)
                return
            }

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

        // Handle beforeunload for page unload attempts
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (navigationGuards.current.size > 0) {
                event.preventDefault()
                event.returnValue = '' // Show browser confirmation dialog
                return ''
            }
        }

        // Listen for browser back/forward navigation
        window.addEventListener('popstate', handlePopState)
        // Listen for page unload attempts (closing tab, refresh, etc.)
        window.addEventListener('beforeunload', handleBeforeUnload)

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
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [routes, currentRoute, currentParams, checkNavigationGuards])

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
        // Check navigation guards first
        const canNavigate = await checkNavigationGuards()
        if (!canNavigate) {
            return // Guards blocked navigation
        }

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
                return [...prev, {route: routeKeyStr, params: routeParams}]
            }
            return prev
        })
    }, [routes, currentRoute, currentParams, onBeforeNavigate, onAfterNavigate, checkNavigationGuards])


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
        // Navigation guards
        registerNavigationGuard,
        isLoading,
        setLoading,
        routes,
        // Promise-based dialog system
        openDialog,
        // Toast notification system
        addToast,
        // Dynamic content mounting
        mountHeader,
        mountSideNav,
        mountFooter,
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
                // Scrolling down - hide header and footer (but respect visibility settings)
                if (scrollAccumulator.current > 0 && currentScrollY > SCROLL_THRESHOLD) {
                    // Only auto-hide if visibility is 'auto'
                    if (visibility.header === 'auto') setHeaderVisible(false)
                    if (visibility.footer === 'auto') setFooterVisible(false)
                }
                // Scrolling up - show header and footer (but respect visibility settings)
                else if (scrollAccumulator.current < 0) {
                    // Only auto-show if visibility is 'auto'
                    if (visibility.header === 'auto') setHeaderVisible(true)
                    if (visibility.footer === 'auto') setFooterVisible(true)
                }

                // Reset accumulator after action
                scrollAccumulator.current = 0
            }

            // Always show header/footer when at the top (but respect visibility settings)
            if (currentScrollY <= 10) {
                if (visibility.header === 'auto') setHeaderVisible(true)
                if (visibility.footer === 'auto') setFooterVisible(true)
                scrollAccumulator.current = 0
            }

            lastScrollY.current = currentScrollY
        }

        // Add scroll listener with passive flag for better performance
        window.addEventListener('scroll', handleScroll, {passive: true})

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [visibility])

    // Apply visibility settings for persistent and disabled modes
    useEffect(() => {
        // Handle header visibility
        if (visibility.header === 'persistent') {
            setHeaderVisible(true)
        } else if (visibility.header === 'disabled') {
            setHeaderVisible(false)
        }
        
        // Handle footer visibility
        if (visibility.footer === 'persistent') {
            setFooterVisible(true)
        } else if (visibility.footer === 'disabled') {
            setFooterVisible(false)
        }
    }, [visibility])

    // Splash screen removed - no effect needed

    // Get current route component
    const currentRouteData = routes[currentRoute as keyof T]
    const CurrentComponent = currentRouteData?.component


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
                        zIndex="1000"
                        backgroundColor={theme.primaryColor}
                        color={theme.backgroundColor}
                        borderBottom="1px solid rgba(213, 33, 34, 0.08)"
                        boxShadow="0 2px 20px rgba(213, 33, 34, 0.08)"
                        style={{
                            transform: isHeaderVisible ? 'translateY(0)' : 'translateY(-100%)',
                            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        {content.header || (
                            <HeaderDefault
                                routes={routes}
                                currentRoute={currentRoute}
                                navigateTo={navigateTo}
                                setSideNavOpen={setSideNavOpen}
                                isMobile={isMobile}
                                currentRole={currentRole}
                                isAuthenticated={isAuthenticated}
                                theme={{
                                    primaryColor: theme.primaryColor || '#D52122',
                                    backgroundColor: theme.backgroundColor || '#FAFAFA',
                                    navBackgroundColor: theme.navBackgroundColor || '#ffffff'
                                }}
                            />
                        )}
                    </Box>

                    {/* Main Content Area */}
                    <Box
                        flex="1"
                        paddingTop="4rem" // Always account for fixed header
                        paddingBottom="4rem"
                        minHeight="100%"
                    >
                        {children || (CurrentComponent && <CurrentComponent {...currentParams}/>)}
                    </Box>

                    {/* Footer */}
                    <Box
                        ref={footerRef}
                        position="fixed"
                        bottom="0"
                        bottomSm={'1rem'}
                        borderRadius={'0px'}
                        borderRadiusSm={'2rem'}
                        overflow={'hidden'}
                        left="0"
                        right="0"
                        maxWidth={'100%'}
                        maxWidthSm={320}
                        margin={'auto'}
                        zIndex="1000"
                        boxShadow="0 5px 10px rgba(0, 0, 0, 0.1)"
                        style={{
                            transform: isFooterVisible ? 'translateY(0)' : 'translateY(200%)',
                            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        {content.footer || (
                            <FooterDefault
                                routes={routes}
                                currentRoute={currentRoute}
                                navigateTo={navigateTo}
                                currentRole={currentRole}
                                isAuthenticated={isAuthenticated}
                                theme={{
                                    primaryColor: theme.primaryColor || '#D52122',
                                    backgroundColor: theme.backgroundColor || '#FAFAFA',
                                    navBackgroundColor: theme.navBackgroundColor || '#ffffff'
                                }}
                            />
                        )}
                    </Box>

                    {/* Side Navigation Drawer */}
                    <SlidingDrawer
                        isOpen={isSideNavOpen}
                        onClose={() => setSideNavOpen(false)}
                        side="left"
                        width="280px"
                        background={'linear-gradient(135deg, #ffffff 0%, #FAFAFA 100%)'}
                    >
                        {content.sideNav || (
                            <SideNavDefault
                                routes={routes}
                                currentRoute={currentRoute}
                                navigateTo={navigateTo}
                                setSideNavOpen={setSideNavOpen}
                                currentRole={currentRole}
                                isAuthenticated={isAuthenticated}
                                theme={{
                                    primaryColor: theme.primaryColor || '#D52122',
                                    backgroundColor: theme.backgroundColor || '#FAFAFA',
                                    navBackgroundColor: theme.navBackgroundColor || '#ffffff'
                                }}
                            />
                        )}
                    </SlidingDrawer>


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

// Main AppShell component that provides both promise dialog and dynamic content contexts
const AppShell = <T extends Record<string, BaseRoute>>(props: AppShellProps<T>) => {
    return (
        <DynamicContentProvider>
            <PromiseDialogProvider>
                <AppShellInternal {...props} />
            </PromiseDialogProvider>
        </DynamicContentProvider>
    );
};

export default AppShell