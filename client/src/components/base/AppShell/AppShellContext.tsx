import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { 
  AppShellContextType, 
  BaseRoute, 
  AlertDialogOptions, 
  NavigateToFunction,
  RouteDefinition,
  OnBeforeNavigateFunction,
  OnAfterNavigateFunction,
  RouteInfo
} from './types'
import {
  getCurrentPath,
  pathToRouteKey,
  routeKeyToPath,
  navigateToUrl,
  isSamePath
} from './urlUtils'

// Create the context with a default value
const AppShellContext = createContext<AppShellContextType | null>(null)

// Provider props interface
interface AppShellProviderProps<T extends Record<string, BaseRoute>> {
  children: ReactNode
  routes: RouteDefinition<T>
  initialRoute?: keyof T
  onBeforeNavigate?: OnBeforeNavigateFunction<T>
  onAfterNavigate?: OnAfterNavigateFunction
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

// Provider component
export function AppShellProvider<T extends Record<string, BaseRoute>>({
  children,
  routes,
  initialRoute,
  onBeforeNavigate,
  onAfterNavigate
}: AppShellProviderProps<T>) {
  
  // Helper function to get initial route from URL
  const getInitialRoute = useCallback((): string => {
    if (typeof window === 'undefined') {
      return (initialRoute as string) || Object.keys(routes)[0] || ''
    }
    
    const currentPath = getCurrentPath()
    const routeKey = pathToRouteKey(currentPath)
    
    // Check if the route key exists in our routes
    if (routes[routeKey]) {
      return routeKey
    }
    
    // Fallback to initialRoute or first route
    return (initialRoute as string) || Object.keys(routes)[0] || ''
  }, [routes, initialRoute])
  
  // Navigation state - initialize from URL
  const [currentRoute, setCurrentRoute] = useState<string>(getInitialRoute())
  
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
      const currentPath = getCurrentPath()
      const routeKey = pathToRouteKey(currentPath)
      
      // Check if the route key exists in our routes
      if (routes[routeKey]) {
        setCurrentRoute(routeKey)
      } else {
        // If route doesn't exist, navigate to first available route
        const fallbackRoute = Object.keys(routes)[0]
        if (fallbackRoute) {
          const fallbackPath = routeKeyToPath(fallbackRoute)
          navigateToUrl(fallbackPath, {}, true) // Replace current URL
          setCurrentRoute(fallbackRoute)
        }
      }
    }

    // Listen for browser back/forward navigation
    window.addEventListener('popstate', handlePopState)

    // Initial URL sync - ensure URL matches current route
    const currentPath = getCurrentPath()
    const expectedPath = routeKeyToPath(currentRoute)
    
    if (!isSamePath(currentPath, expectedPath)) {
      // URL doesn't match current route, update URL to match
      navigateToUrl(expectedPath, {}, true)
    }

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [routes, currentRoute])

  // Sync URL when current route changes programmatically
  useEffect(() => {
    const currentPath = getCurrentPath()
    const expectedPath = routeKeyToPath(currentRoute)
    
    if (!isSamePath(currentPath, expectedPath)) {
      navigateToUrl(expectedPath, {}, true)
    }
  }, [currentRoute])

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
      params: {} // You could store and retrieve current route params if needed
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
    
    // Update browser URL
    navigateToUrl(urlPath, {})
    
    // Update internal state
    setCurrentRoute(routeKeyStr)
    setSideNavOpen(false) // Close side nav on navigation
    
    // Store props for the route if needed (you can expand this)
    if (finalProps) {
      // You could store route props in a separate state or pass them through URL params
      console.log('Route props:', finalProps)
    }

    // Create final target route info (in case of redirect)
    const finalTargetRouteInfo: RouteInfo = {
      path: urlPath,
      params: finalProps || {}
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
                setDialogState({ isOpen: false, options: null, resolver: null })
                // Update global state
                globalDialogState.isOpen = false
                globalDialogState.options = null
                globalDialogState.resolver = null
                resolve()
              } catch (error) {
                console.error('Dialog button error:', error)
                // Still resolve to close dialog
                setDialogState({ isOpen: false, options: null, resolver: null })
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
    setDialogState({ isOpen: false, options: null, resolver: null })
  }, [dialogState.resolver])

  const contextValue: AppShellContextType<T> = {
    navigateTo,
    currentRoute,
    currentParams: {},
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

  return (
    <AppShellContext.Provider value={contextValue as AppShellContextType}>
      {children}
    </AppShellContext.Provider>
  )
}

// Export global dialog state for AppShell to access
export function getGlobalDialogState() {
  return globalDialogState
}

// Hook to access dialog state from AppShell
export function useDialogState() {
  const [dialogState, setDialogState] = useState(globalDialogState)
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (globalDialogState.isOpen !== dialogState.isOpen ||
          globalDialogState.options !== dialogState.options) {
        setDialogState({ ...globalDialogState })
      }
    }, 100)
    
    return () => clearInterval(interval)
  }, [dialogState])
  
  return dialogState
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
export function createRoutes<T extends Record<string, BaseRoute>>(routes: T): RouteDefinition<T> {
  return routes
}

// Helper function to infer route types
export function createAppShell<T extends Record<string, BaseRoute>>(routes: T) {
  return {
    routes,
    Provider: (props: Omit<AppShellProviderProps<T>, 'routes'>) => 
      AppShellProvider({ ...props, routes }),
    useAppShell: () => useAppShell<T>()
  }
}

export default AppShellContext