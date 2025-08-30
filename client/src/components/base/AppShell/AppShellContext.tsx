import {createContext, useContext} from 'react'
import {AppShellContextType, BaseRoute, RouteDefinition} from './types'

/**
 * AppShell Context - Provides application-wide navigation, dialog management, 
 * and UI component mounting functionality.
 * 
 * This context serves as the central hub for:
 * - Type-safe client-side routing with parameter validation
 * - Promise-based modal dialog system with stacking support
 * - Dynamic header/sidebar/footer content mounting
 * - Navigation guards for protecting routes with unsaved changes
 * - Loading state management
 * - Theme configuration
 * 
 * @example
 * ```typescript
 * // Define your routes with type safety
 * const routes = createRoutes({
 *   'dashboard': { component: Dashboard, label: 'Dashboard', showInNav: true },
 *   'profile-edit': { component: ProfileEdit, label: 'Edit Profile', showInNav: false }
 * })
 * 
 * // In components, use the hook for navigation, dialogs, and toasts
 * const { navigateTo, openDialog, addToast, registerNavigationGuard } = useAppShell()
 * 
 * // Navigate with type-safe parameters
 * navigateTo('profile-edit', { userId: '123' })
 * 
 * // Show promise-based dialogs
 * const confirmed = await openDialog<boolean>((close) => (
 *   <ConfirmDialog onConfirm={() => close(true)} onCancel={() => close(false)} />
 * ))
 * 
 * // Show toast notifications
 * addToast("Switching to Host mode...", { type: 'info', autoHide: true, duration: 3000 })
 * addToast(<Box>Custom toast content</Box>, { type: 'success' })
 * ```
 */
const AppShellContext = createContext<AppShellContextType | null>(null)

/**
 * Hook to access AppShell functionality throughout your application.
 * 
 * Provides type-safe access to:
 * - Navigation functions (navigateTo, navigateBack)
 * - Dialog management (openDialog)
 * - Toast notifications (addToast)
 * - Content mounting (mountHeader, mountSideNav, mountFooter)
 * - Navigation guards (registerNavigationGuard)
 * - Loading state (isLoading, setLoading)
 * - Current route information (currentRoute, currentParams)
 * 
 * @template T - Route definitions type for type-safe navigation
 * @returns {AppShellContextType<T>} The AppShell context with all navigation and UI functions
 * @throws {Error} If used outside of AppShellProvider
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const { navigateTo, openDialog, addToast } = useAppShell()
 * 
 * // With type-safe routes
 * const { navigateTo } = useAppShell<typeof routes>()
 * navigateTo('user-profile', { id: userId }) // Type-checked parameters
 * 
 * // Navigation with confirmation dialog
 * const handleNavigation = async () => {
 *   const shouldLeave = await openDialog<boolean>((close) => (
 *     <Box>
 *       <p>Unsaved changes will be lost. Continue?</p>
 *       <Button onClick={() => close(true)}>Yes, Leave</Button>
 *       <Button onClick={() => close(false)}>Stay</Button>
 *     </Box>
 *   ))
 *   
 *   if (shouldLeave) {
 *     navigateTo('dashboard', {})
 *   }
 * }
 * 
 * // Toast notifications
 * const handleSave = async () => {
 *   addToast("Saving changes...", { type: 'info', duration: 2000 })
 *   
 *   try {
 *     await saveData()
 *     addToast("Changes saved successfully!", { type: 'success' })
 *   } catch (error) {
 *     addToast("Failed to save changes", { type: 'error', autoHide: false })
 *   }
 * }
 * ```
 */
export function useAppShell<T extends Record<string, BaseRoute> = Record<string, BaseRoute>>(): AppShellContextType<T> {
  const context = useContext(AppShellContext)
  if (!context) {
    throw new Error('useAppShell must be used within an AppShellProvider')
  }
  return context as AppShellContextType<T>
}

/**
 * Creates a type-safe route definition object for use with AppShell.
 * 
 * Each route must specify:
 * - component: React component to render
 * - label: Human-readable name for navigation menus
 * - showInNav/showInHeader/showInFooter: Visibility in different UI sections
 * - icon: Optional icon for navigation display
 * 
 * @template T - Route record type
 * @param {T} routes - Object mapping route keys to route configurations
 * @returns {RouteDefinition<T>} Type-safe route definition
 * 
 * @example
 * ```typescript
 * // Define application routes
 * export const routes = createRoutes({
 *   'home': {
 *     component: HomePage,
 *     icon: <FaHome />,
 *     label: 'Home',
 *     showInNav: true,
 *     showInHeader: true,
 *     showInFooter: true
 *   },
 *   'user-profile': {
 *     component: UserProfile, // Expects props: { userId: string }
 *     icon: <FaUser />,
 *     label: 'Profile',
 *     showInNav: false,
 *     showInHeader: false,
 *     showInFooter: false
 *   },
 *   'settings': {
 *     component: Settings,
 *     icon: <FaCog />,
 *     label: 'Settings',
 *     showInNav: true,
 *     showInHeader: true,
 *     showInFooter: false
 *   }
 * })
 * 
 * // Usage with type-safe navigation
 * const { navigateTo } = useAppShell<typeof routes>()
 * navigateTo('user-profile', { userId: '123' }) // ✅ Type-safe
 * navigateTo('user-profile', {}) // ❌ TypeScript error - missing userId
 * ```
 */
export function createRoutes<T extends Record<string, BaseRoute>>(routes: T): RouteDefinition<T> {
  return routes
}

/**
 * Advanced helper for creating a complete type-safe AppShell configuration.
 * 
 * This function binds your route definitions to a typed useAppShell hook,
 * providing full type safety across your entire application.
 * 
 * @template T - Route record type
 * @param {T} routes - Route definitions created with createRoutes
 * @returns Object with routes and typed useAppShell hook
 * 
 * @example
 * ```typescript
 * // Create typed AppShell configuration
 * const { routes, useAppShell: useTypedAppShell } = createAppShell(routes)
 * 
 * // In components, use the typed hook
 * const MyComponent = () => {
 *   const { navigateTo } = useTypedAppShell() // Fully typed for your routes
 *   
 *   const handleClick = () => {
 *     // All routes and parameters are type-checked
 *     navigateTo('user-profile', { userId: currentUser.id })
 *   }
 * }
 * ```
 */
export function createAppShell<T extends Record<string, BaseRoute>>(routes: T) {
  return {
    routes,
    useAppShell: () => useAppShell<T>()
  }
}

export default AppShellContext