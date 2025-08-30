import { BaseRoute } from './types'

/**
 * Filter routes based on current user role
 * @param routes - All available routes
 * @param currentRole - Current user role (null for unauthenticated users)
 * @param isAuthenticated - Whether user is authenticated
 * @returns Filtered routes that the user has access to
 */
export const filterRoutesByRole = <T extends Record<string, BaseRoute>>(
  routes: T,
  currentRole: 'Tenant' | 'HomeOwner' | 'Manager' | null,
  isAuthenticated: boolean
): T => {
  const filteredRoutes = {} as T

  Object.entries(routes).forEach(([key, route]) => {
    // If route has no role restrictions, it's public (accessible to everyone)
    if (!route.roles || route.roles.length === 0) {
      filteredRoutes[key as keyof T] = route as T[keyof T]
      return
    }

    // If user is not authenticated, only show public routes (handled above)
    if (!isAuthenticated || !currentRole) {
      return
    }

    // If user's current role is in the allowed roles, show the route
    if (route.roles.includes(currentRole)) {
      filteredRoutes[key as keyof T] = route as T[keyof T]
    }
  })

  return filteredRoutes
}

/**
 * Check if user has access to a specific route
 * @param route - Route to check
 * @param currentRole - Current user role
 * @param isAuthenticated - Whether user is authenticated
 * @returns True if user can access the route
 */
export const hasRouteAccess = (
  route: BaseRoute,
  currentRole: 'Tenant' | 'HomeOwner' | 'Manager' | null,
  isAuthenticated: boolean
): boolean => {
  // Public routes (no role restrictions)
  if (!route.roles || route.roles.length === 0) {
    return true
  }

  // Authenticated users with matching role
  if (isAuthenticated && currentRole && route.roles.includes(currentRole)) {
    return true
  }

  return false
}

/**
 * Get available roles for a user based on their base role
 * @param userRole - User's base role from database
 * @returns Array of roles user can switch to
 */
export const getAvailableRoles = (userRole: 'Tenant' | 'HomeOwner' | 'Manager'): ('Tenant' | 'HomeOwner' | 'Manager')[] => {
  const availableRoles: ('Tenant' | 'HomeOwner' | 'Manager')[] = ['Tenant']

  if (userRole === 'HomeOwner' || userRole === 'Manager') {
    availableRoles.push('HomeOwner')
  }

  if (userRole === 'Manager') {
    availableRoles.push('Manager')
  }

  return availableRoles
}