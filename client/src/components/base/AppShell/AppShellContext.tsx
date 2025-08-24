import {createContext, useContext} from 'react'
import {AppShellContextType, BaseRoute, RouteDefinition} from './types'

// Create the context with a default value
const AppShellContext = createContext<AppShellContextType | null>(null)

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
    useAppShell: () => useAppShell<T>()
  }
}

export default AppShellContext