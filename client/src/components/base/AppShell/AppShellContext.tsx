import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from 'react'
import { 
  BaseRoute,
  AlertDialogOptions,
  RouteMatch,
  NavigationOptions,
  TransitionConfig,
  RouterOptions,
  RouteGuard
} from './types.enhanced'
import { Router } from './Router'
import { AnimatePresence, motion } from 'framer-motion'

// Enhanced context type
interface AppShellContextType<T extends Record<string, BaseRoute>> {
  // Core routing
  routes: T
  router: Router<T>
  currentRoute: keyof T
  currentPath: string
  currentUrl: URL
  
  // Route matching
  activeMatch: RouteMatch | null
  activeRouteChain: RouteMatch[]
  params: Record<string, any>
  
  // Query parameters
  searchParams: URLSearchParams
  queryState: Record<string, any>
  
  // History
  canGoBack: boolean
  canGoForward: boolean
  historyLength: number
  
  // Navigation methods
  navigateTo: (path: string | keyof T, options?: NavigationOptions) => Promise<boolean>
  replaceRoute: (path: string | keyof T, options?: NavigationOptions) => Promise<boolean>
  goBack: () => boolean
  goForward: () => boolean
  go: (delta: number) => boolean
  
  // Query methods
  setSearchParams: (params: URLSearchParams | Record<string, any>) => void
  updateSearchParams: (updates: Record<string, any>) => void
  clearSearchParams: (keys?: string[]) => void
  
  // Guard execution
  canNavigate: (to: string) => Promise<boolean>
  addGlobalGuard: (guard: RouteGuard) => void
  
  // Transition control
  transitioning: boolean
  transitionConfig: TransitionConfig | null
  setTransition: (config: TransitionConfig) => void
  
  // Utility methods
  buildPath: (route: keyof T, params?: Record<string, any>) => string
  isActive: (route: keyof T | string, exact?: boolean) => boolean
  
  // UI state (existing)
  isSideNavOpen: boolean
  setSideNavOpen: (open: boolean) => void
  isLoading: boolean
  setLoading: (loading: boolean) => void
  
  // Dialog (existing)
  alertDialog: (options: AlertDialogOptions) => Promise<void>
  dialogState: {
    isOpen: boolean
    options: AlertDialogOptions | null
    resolver: ((value: void) => void) | null
  }
  closeDialog: () => void
  
  // Outlets for nested routes
  renderOutlet: (depth?: number) => ReactNode
}

// Create the context
const AppShellContext = createContext<AppShellContextType<any> | null>(null)

// Provider props
interface AppShellProviderProps<T extends Record<string, BaseRoute>> {
  children: ReactNode
  routes: T
  initialRoute?: keyof T
  routerOptions?: RouterOptions
}

// Provider component
export function AppShellProvider<T extends Record<string, BaseRoute>>({
  children,
  routes,
  initialRoute,
  routerOptions = {}
}: AppShellProviderProps<T>) {
  // Router instance
  const routerRef = useRef<Router<T>>()
  if (!routerRef.current) {
    routerRef.current = new Router<T>(routes, {
      syncWithUrl: true,
      scrollBehavior: 'auto',
      ...routerOptions
    })
  }
  const router = routerRef.current

  // Route state
  const [currentMatch, setCurrentMatch] = useState<RouteMatch | null>(null)
  const [currentRoute, setCurrentRoute] = useState<string>(
    (initialRoute as string) || Object.keys(routes)[0] || ''
  )
  const [currentPath, setCurrentPath] = useState<string>('/')
  const [params, setParams] = useState<Record<string, any>>({})
  const [queryState, setQueryState] = useState<Record<string, any>>({})
  const [searchParams, setSearchParamsState] = useState<URLSearchParams>(new URLSearchParams())
  
  // History state
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)
  const [historyLength, setHistoryLength] = useState(1)
  
  // Transition state
  const [transitioning, setTransitioning] = useState(false)
  const [transitionConfig, setTransitionConfig] = useState<TransitionConfig | null>(null)
  
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

  // Setup route change listener
  useEffect(() => {
    const unsubscribe = router.onRouteChange((match) => {
      if (match) {
        setCurrentMatch(match)
        setCurrentPath(match.path)
        setParams(match.params)
        setQueryState(match.search || {})
        setSearchParamsState(new URLSearchParams(router.getCurrentUrl().search))
        
        // Find route key from match
        const routeKey = Object.keys(routes).find(key => {
          const route = routes[key]
          return route.fullPath === match.route.fullPath || 
                 route.path === match.route.path
        })
        if (routeKey) {
          setCurrentRoute(routeKey)
        }
      }
      
      // Update history state
      setCanGoBack(router.canGoBack())
      setCanGoForward(router.canGoForward())
      setHistoryLength(router['history'].getLength())
    })

    return unsubscribe
  }, [router, routes])

  // Setup transition listener
  useEffect(() => {
    const unsubscribe = router.onTransition((phase, config) => {
      setTransitioning(phase === 'start')
      setTransitionConfig(phase === 'start' ? config || null : null)
    })

    return unsubscribe
  }, [router])

  // Navigation methods
  const navigateTo = useCallback(async (
    path: string | keyof T,
    options?: NavigationOptions
  ): Promise<boolean> => {
    setSideNavOpen(false) // Close side nav on navigation
    return router.navigate(path as string, options)
  }, [router])

  const replaceRoute = useCallback(async (
    path: string | keyof T,
    options?: NavigationOptions
  ): Promise<boolean> => {
    return router.navigate(path as string, { ...options, replace: true })
  }, [router])

  const goBack = useCallback(() => {
    return router.back()
  }, [router])

  const goForward = useCallback(() => {
    return router.forward()
  }, [router])

  const go = useCallback((delta: number) => {
    return router.go(delta)
  }, [router])

  // Query parameter methods
  const setSearchParams = useCallback((params: URLSearchParams | Record<string, any>) => {
    const newParams = params instanceof URLSearchParams 
      ? params 
      : new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))
    
    const currentPath = router.getCurrentPath()
    const basePath = currentPath.split('?')[0]
    const newPath = `${basePath}?${newParams.toString()}`
    
    router.navigate(newPath, { replace: true })
  }, [router])

  const updateSearchParams = useCallback((updates: Record<string, any>) => {
    const current = new URLSearchParams(router.getCurrentUrl().search)
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        current.delete(key)
      } else {
        current.set(key, String(value))
      }
    })
    
    setSearchParams(current)
  }, [router, setSearchParams])

  const clearSearchParams = useCallback((keys?: string[]) => {
    if (!keys) {
      setSearchParams(new URLSearchParams())
    } else {
      const current = new URLSearchParams(router.getCurrentUrl().search)
      keys.forEach(key => current.delete(key))
      setSearchParams(current)
    }
  }, [router, setSearchParams])

  // Guard methods
  const canNavigate = useCallback(async (to: string): Promise<boolean> => {
    // Test navigation without actually navigating
    try {
      const result = await router.navigate(to, { skipGuards: false })
      return result
    } catch {
      return false
    }
  }, [router])

  const addGlobalGuard = useCallback((guard: RouteGuard) => {
    router.addGlobalGuard(guard)
  }, [router])

  // Utility methods
  const buildPath = useCallback((route: keyof T, params?: Record<string, any>): string => {
    return router.buildPath(route as string, params)
  }, [router])

  const isActive = useCallback((route: keyof T | string, exact = false): boolean => {
    return router.isActive(route as string, exact)
  }, [router])

  // Alert dialog function
  const alertDialog = useCallback((options: AlertDialogOptions): Promise<void> => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        options: {
          ...options,
          buttons: options.buttons.map(button => ({
            ...button,
            onClick: async () => {
              try {
                await button.onClick()
                setDialogState({ isOpen: false, options: null, resolver: null })
                resolve()
              } catch (error) {
                console.error('Dialog button error:', error)
                setDialogState({ isOpen: false, options: null, resolver: null })
                resolve()
              }
            }
          }))
        },
        resolver: resolve
      })
    })
  }, [])

  const closeDialog = useCallback(() => {
    if (dialogState.resolver) {
      dialogState.resolver()
    }
    setDialogState({ isOpen: false, options: null, resolver: null })
  }, [dialogState.resolver])

  // Render outlet for nested routes
  const renderOutlet = useCallback((depth: number = 0): ReactNode => {
    if (!currentMatch) return null
    
    // Get the route chain to the current depth
    let route = currentMatch.route
    let currentDepth = 0
    
    // Navigate to the correct depth
    while (currentDepth < depth && route.children) {
      const childKey = Object.keys(route.children)[0]
      if (childKey) {
        route = route.children[childKey]
        currentDepth++
      } else {
        break
      }
    }
    
    const Component = route.component
    
    // Wrap in transition if configured
    if (transitionConfig && transitionConfig.type !== 'none') {
      return (
        <AnimatePresence mode="wait">
          <motion.div
            key={route.path}
            initial={transitionConfig.custom?.enter?.initial || { opacity: 0 }}
            animate={transitionConfig.custom?.enter?.animate || { opacity: 1 }}
            exit={transitionConfig.custom?.exit?.exit || { opacity: 0 }}
            transition={{
              duration: (transitionConfig.duration || 300) / 1000,
              ease: transitionConfig.easing as any || 'easeInOut'
            }}
          >
            <Component {...params} />
          </motion.div>
        </AnimatePresence>
      )
    }
    
    return <Component {...params} />
  }, [currentMatch, params, transitionConfig])

  const contextValue: AppShellContextType<T> = {
    // Core routing
    routes,
    router,
    currentRoute: currentRoute as keyof T,
    currentPath,
    currentUrl: router.getCurrentUrl(),
    
    // Route matching
    activeMatch: currentMatch,
    activeRouteChain: currentMatch ? [currentMatch] : [],
    params,
    
    // Query parameters
    searchParams,
    queryState,
    
    // History
    canGoBack,
    canGoForward,
    historyLength,
    
    // Navigation methods
    navigateTo,
    replaceRoute,
    goBack,
    goForward,
    go,
    
    // Query methods
    setSearchParams,
    updateSearchParams,
    clearSearchParams,
    
    // Guard execution
    canNavigate,
    addGlobalGuard,
    
    // Transition control
    transitioning,
    transitionConfig,
    setTransition: setTransitionConfig,
    
    // Utility methods
    buildPath,
    isActive,
    
    // UI state
    isSideNavOpen,
    setSideNavOpen,
    isLoading,
    setLoading,
    
    // Dialog
    alertDialog,
    dialogState,
    closeDialog,
    
    // Outlets
    renderOutlet
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      router.destroy()
    }
  }, [router])

  return (
    <AppShellContext.Provider value={contextValue}>
      {children}
    </AppShellContext.Provider>
  )
}

// Hook to use AppShell context
export function useAppShell<T extends Record<string, BaseRoute> = Record<string, BaseRoute>>(): AppShellContextType<T> {
  const context = useContext(AppShellContext)
  if (!context) {
    throw new Error('useAppShell must be used within an AppShellProvider')
  }
  return context as AppShellContextType<T>
}

// Helper function to create type-safe routes
export function createRoutes<T extends Record<string, BaseRoute>>(routes: T): T {
  return routes
}

// Route link component
interface RouteLinkProps<T extends Record<string, BaseRoute>> {
  to: keyof T | string
  params?: Record<string, any>
  children: ReactNode
  className?: string
  activeClassName?: string
  exact?: boolean
  replace?: boolean
  onClick?: (e: React.MouseEvent) => void
}

export function RouteLink<T extends Record<string, BaseRoute>>({
  to,
  params,
  children,
  className = '',
  activeClassName = 'active',
  exact = false,
  replace = false,
  onClick
}: RouteLinkProps<T>) {
  const { navigateTo, buildPath, isActive } = useAppShell<T>()
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (onClick) onClick(e)
    navigateTo(to, { replace, state: params })
  }
  
  const href = buildPath(to as keyof T, params)
  const active = isActive(to, exact)
  const finalClassName = `${className} ${active ? activeClassName : ''}`.trim()
  
  return (
    <a href={href} onClick={handleClick} className={finalClassName}>
      {children}
    </a>
  )
}

export default AppShellContext