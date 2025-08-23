// Export the enhanced AppShell with full routing
export { default as AppShell } from './AppShell'

// Export enhanced context and hooks
export { 
  AppShellProvider, 
  useAppShell, 
  createRoutes,
  RouteLink
} from './AppShellContext.tsx'

// Export routing utilities
export { Router } from './Router'
export { PathMatcher } from './PathMatcher'
export { HistoryManager } from './HistoryManager'
export { GuardExecutor } from './GuardExecutor'
export * from './utils'

// Export all enhanced types
export type {
  // Core route types
  BaseRoute,
  ParamSchema,
  SearchSchema,
  RouteMeta,
  SEOMetadata,
  RouteMatch,
  NavigationOptions,
  ScrollPosition,
  HistoryEntry,
  
  // Guard types
  RouteGuard,
  GuardResult,
  GuardContext,
  Middleware,
  MiddlewareContext,
  NavigationRedirect,
  
  // Transition types
  TransitionConfig,
  
  // Router types
  RouteNode,
  RouterOptions,
  
  // UI types (existing)
  AlertDialogOptions,
  AlertDialogButton,
  DialogState,
  SplashPhase,
  AppShellConfig
} from './types.enhanced'