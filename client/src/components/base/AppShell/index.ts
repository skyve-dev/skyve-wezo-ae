export { default as AppShell } from './AppShell'
export { 
  useAppShell, 
  createRoutes, 
  createAppShell 
} from './AppShellContext'
export { useNavigation } from './useNavigation'
export { useTheme } from './useTheme'
export {
  getBasePath,
  getCurrentPath,
  getCurrentUrl,
  buildFullUrl,
  pathToRouteKey,
  pathToRouteKeyWithParams,
  routeKeyToPath,
  parseQueryParams,
  serializeQueryParams
} from './urlUtils'
export type {
  BaseRoute,
  RouteDefinition,
  AppShellConfig,
  AppShellTheme,
  AppShellContextType,
  NavigateToFunction,
  ComponentProps,
  // Promise-based dialog types
  DialogCloseFunction,
  DialogContentFunction,
  PromiseDialogFunction,
  DialogState,
  // Dynamic content mounting
  MountFunction,
  // Navigation guard types
  NavigationGuardFunction,
  GuardRegistrationFunction
} from './types'