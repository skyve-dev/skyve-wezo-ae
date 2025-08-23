import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { 
  AppShellContextType, 
  BaseRoute, 
  AlertDialogOptions, 
  NavigateToFunction,
  RouteDefinition
} from './types'

// Create the context with a default value
const AppShellContext = createContext<AppShellContextType | null>(null)

// Provider props interface
interface AppShellProviderProps<T extends Record<string, BaseRoute>> {
  children: ReactNode
  routes: RouteDefinition<T>
  initialRoute?: keyof T
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
  initialRoute
}: AppShellProviderProps<T>) {
  // Navigation state
  const [currentRoute, setCurrentRoute] = useState<string>(
    (initialRoute as string) || Object.keys(routes)[0] || ''
  )
  
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

  // Type-safe navigation function
  const navigateTo: NavigateToFunction<T> = useCallback((path: any, props?: any) => {
    const route = routes[path]
    if (route) {
      setCurrentRoute(path as string)
      setSideNavOpen(false) // Close side nav on navigation
      
      // Store props for the route if needed (you can expand this)
      if (props) {
        // You could store route props in a separate state or pass them through URL params
        console.log('Route props:', props)
      }
    } else {
      console.warn(`Route not found: ${path}`)
    }
  }, [routes])

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