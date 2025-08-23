import { ReactNode, ComponentType } from 'react'
import { MotionProps } from 'framer-motion'

// Core route types
export interface BaseRoute {
  path: string
  component: ComponentType<any>
  icon?: ReactNode
  label: string
  
  // Visibility flags
  showInNav?: boolean
  showInHeader?: boolean
  showInFooter?: boolean
  disabled?: boolean
  
  // Nested routes
  children?: Record<string, BaseRoute>
  layout?: ComponentType<any>
  outlet?: boolean
  parent?: string
  
  // Path handling
  fullPath?: string
  pathSegments?: string[]
  pathPattern?: string // e.g., "/user/:id/posts/:postId"
  pathRegex?: RegExp
  paramKeys?: string[]
  
  // Dynamic segments
  params?: ParamSchema
  
  // Query parameters
  search?: SearchSchema
  parseSearch?: (params: URLSearchParams) => any
  stringifySearch?: (query: any) => URLSearchParams
  
  // Wildcards
  wildcard?: boolean
  catchAll?: boolean
  priority?: number
  fallback?: boolean
  
  // Guards
  beforeEnter?: RouteGuard | RouteGuard[]
  beforeLeave?: RouteGuard | RouteGuard[]
  beforeResolve?: RouteGuard | RouteGuard[]
  middleware?: Middleware[]
  
  // Metadata
  meta?: RouteMeta
  title?: string | ((params: any) => string)
  description?: string
  tags?: string[]
  seo?: SEOMetadata
  custom?: Record<string, any>
  
  // Transitions
  transition?: TransitionConfig
  exitTransition?: TransitionConfig
  enterTransition?: TransitionConfig
}

// Parameter schema
export interface ParamSchema {
  [key: string]: {
    type?: 'string' | 'number' | 'uuid'
    required?: boolean
    validate?: (value: any) => boolean
    transform?: (value: string) => any
  }
}

// Search/Query schema
export interface SearchSchema {
  [key: string]: {
    type?: 'string' | 'number' | 'boolean' | 'array'
    default?: any
    validate?: (value: any) => boolean
  }
}

// Route metadata
export interface RouteMeta {
  requiresAuth?: boolean
  roles?: string[]
  permissions?: string[]
  layout?: string
  theme?: string
  [key: string]: any
}

// SEO metadata
export interface SEOMetadata {
  title?: string
  description?: string
  keywords?: string[]
  og?: Record<string, string>
  twitter?: Record<string, string>
}

// Route matching
export interface RouteMatch {
  route: BaseRoute
  params: Record<string, string>
  score: number
  path: string
  search?: Record<string, any>
}

// Navigation options
export interface NavigationOptions {
  replace?: boolean
  state?: any
  scroll?: boolean | ScrollPosition
  transition?: TransitionConfig
  skipGuards?: boolean
}

// Scroll position
export interface ScrollPosition {
  x: number
  y: number
}

// History entry
export interface HistoryEntry {
  path: string
  state: any
  title?: string
  timestamp: number
  scrollPosition?: ScrollPosition
  routeKey?: string
}

// Guard types
export type RouteGuard = (context: GuardContext) => GuardResult
export type GuardResult = boolean | Promise<boolean> | NavigationRedirect
export type Middleware = (context: MiddlewareContext, next: () => void) => void | Promise<void>

export interface GuardContext {
  to: RouteMatch
  from: RouteMatch | null
  next: (result?: GuardResult) => void
  abort: () => void
  redirect: (path: string) => void
  params: Record<string, any>
  query: Record<string, any>
  meta: Record<string, any>
}

export interface MiddlewareContext extends GuardContext {
  setMeta: (key: string, value: any) => void
  getMeta: (key: string) => any
}

export interface NavigationRedirect {
  path: string
  replace?: boolean
  state?: any
}

// Transition configuration
export interface TransitionConfig {
  type: 'fade' | 'slide' | 'scale' | 'custom' | 'none'
  duration?: number
  easing?: string
  direction?: 'left' | 'right' | 'up' | 'down'
  custom?: {
    enter?: MotionProps
    exit?: MotionProps
  }
}

// Route node for tree structure
export interface RouteNode {
  route: BaseRoute
  children: Map<string, RouteNode>
  parent?: RouteNode
  depth: number
}

// Router options
export interface RouterOptions {
  baseUrl?: string
  mode?: 'history' | 'hash' | 'memory'
  syncWithUrl?: boolean
  scrollBehavior?: 'auto' | 'smooth' | 'none'
  defaultTransition?: TransitionConfig
  strict?: boolean // Strict path matching
  caseSensitive?: boolean
}

// Alert dialog options (existing)
export interface AlertDialogOptions {
  icon?: ReactNode
  title: string
  text: string
  buttons: AlertDialogButton[]
}

export interface AlertDialogButton {
  label: string
  onClick: () => Promise<void>
  variant?: 'normal' | 'promoted' | 'danger'
}

// Dialog state (existing)
export interface DialogState {
  isOpen: boolean
  options: AlertDialogOptions | null
  resolver: ((value: void) => void) | null
}

// Splash phase (existing)
export type SplashPhase = 'loading' | 'expanding' | 'complete'

// AppShell configuration
export interface AppShellConfig {
  splash?: {
    duration?: number
    logo?: ReactNode
    text?: string
  }
  header?: {
    title?: string
    logo?: ReactNode
    showQuickNav?: boolean
    actions?: ReactNode[]
  }
  footer?: {
    showOnMobile?: boolean
    maxItems?: number
  }
  theme?: {
    primaryColor?: string
    backgroundColor?: string
    navBackgroundColor?: string
  }
  breakpoints?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  router?: RouterOptions
}