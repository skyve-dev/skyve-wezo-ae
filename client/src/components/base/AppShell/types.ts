import React from 'react'

// Base route interface
export interface BaseRoute {
    component: React.FC<any>
    icon?: React.ReactNode
    label: string
    showInNav?: boolean
    showInHeader?: boolean
    showInFooter?: boolean
}

// Extract component props type
export type ComponentProps<T> = T extends React.FC<infer P> ? P : never

// Type-safe route definition with component props
export type RouteDefinition<T extends Record<string, BaseRoute>> = T

// Extract route paths
export type RoutePaths<T extends Record<string, BaseRoute>> = keyof T

// Type-safe navigation function
export type NavigateToFunction<T extends Record<string, BaseRoute>> = <K extends RoutePaths<T>>(
    path: K,
    props: ComponentProps<T[K]['component']>
) => Promise<void>

// Navigation route info
export interface RouteInfo {
    path: string
    params: Record<string, any>
}

// Navigation event hook types
export type NextFunction<T extends Record<string, BaseRoute>> = <K extends RoutePaths<T>>(
    path?: K,
    params?: ComponentProps<T[K]['component']>
) => void

export type OnBeforeNavigateFunction<T extends Record<string, BaseRoute>> = (
    next: NextFunction<T>,
    target: RouteInfo,
    source: RouteInfo
) => void | Promise<void>

export type OnAfterNavigateFunction = (
    target: RouteInfo,
    source: RouteInfo
) => void | Promise<void>


// New promise-based dialog system types
export type DialogCloseFunction<T = any> = (result: T) => void
export type DialogContentFunction<T = any> = (close: DialogCloseFunction<T>) => React.ReactNode
export type PromiseDialogFunction = <T = any>(content: DialogContentFunction<T>) => Promise<T>

// Dialog state for stacking support
export interface DialogState<T = any> {
    id: string
    content: React.ReactNode
    resolve: (value: T) => void
    reject: (reason?: any) => void
}

// Toast system types
export interface ToastOptions {
    autoHide?: boolean
    duration?: number
    type?: 'info' | 'success' | 'warning' | 'error'
    showCloseButton?: boolean
}

export interface ToastState {
    id: string
    content: React.ReactNode
    options: ToastOptions
    timestamp: number
}

export type ToastCloseFunction = () => void
export type ToastContentFunction = (close: ToastCloseFunction) => React.ReactNode
export type AddToastFunction = (content: React.ReactNode | ToastContentFunction, options?: ToastOptions) => string


// Visibility mode for mounted content
export type VisibilityMode = 'auto' | 'persistent' | 'disabled'

// Content options for mounting
export interface ContentOptions {
    visibility?: VisibilityMode
}

// Mounted content with options
export interface MountedContent {
    content: React.ReactNode
    options: ContentOptions
    id: string
}

// Mount function type for dynamic content
export type MountFunction = (content: React.ReactNode, options?: ContentOptions) => () => void

// Navigation guard types
export type NavigationGuardFunction = () => Promise<boolean>
export type GuardRegistrationFunction = (guard: NavigationGuardFunction) => () => void

// AppShell context interface
export interface AppShellContextType<T extends Record<string, BaseRoute> = Record<string, BaseRoute>> {
    // Navigation
    navigateTo: NavigateToFunction<T>
    navigateBack: () => void
    canNavigateBack: boolean
    currentRoute: string
    currentParams: Record<string, any>

    // Navigation guards
    registerNavigationGuard: GuardRegistrationFunction

    // Promise-based dialog system
    openDialog: PromiseDialogFunction

    // Toast notification system  
    addToast: AddToastFunction

    // Dynamic content mounting
    mountHeader: MountFunction
    mountSideNav: MountFunction
    mountFooter: MountFunction

    // Loading state
    isLoading: boolean
    setLoading: (loading: boolean) => void

    // Routes
    routes: T

    // Theme
    theme: AppShellTheme
}

// Splash screen functionality removed

// Responsive breakpoints
export interface BreakpointConfig {
    mobile: number
    tablet: number
    desktop: number
}

// Theme configuration
export interface AppShellTheme {
    primaryColor: string
    backgroundColor: string
    navBackgroundColor: string
}

// AppShell configuration
export interface AppShellConfig {
    breakpoints?: BreakpointConfig
    theme?: Partial<AppShellTheme>
}