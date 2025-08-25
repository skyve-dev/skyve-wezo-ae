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

// Visibility control interface
export interface AppShellVisibility {
    header: boolean
    sideNav: boolean
    footer: boolean
}

// Visibility control options for programmatic control (partial updates)
export type AppShellVisibilityOptions = Partial<AppShellVisibility>

// AppShell context interface
export interface AppShellContextType<T extends Record<string, BaseRoute> = Record<string, BaseRoute>> {
    // Navigation
    navigateTo: NavigateToFunction<T>
    navigateBack: () => void
    canNavigateBack: boolean
    currentRoute: string
    currentParams: Record<string, any>

    // Promise-based dialog system
    openDialog: PromiseDialogFunction

    // Loading state
    isLoading: boolean
    setLoading: (loading: boolean) => void

    // Routes
    routes: T

    // Visibility control
    visibility: AppShellVisibility
    setVisibility: (options: AppShellVisibilityOptions) => void
    resetVisibility: () => void

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

// Header configuration
export interface HeaderConfig {
    title?: string
    logo?: React.ReactNode
    showQuickNav?: boolean
    actions?: React.ReactNode[]
}

// Footer configuration
export interface FooterConfig {
    showOnMobile?: boolean
    maxItems?: number
}

// Theme configuration
export interface AppShellTheme {
    primaryColor: string
    backgroundColor: string
    navBackgroundColor: string
}

// AppShell configuration
export interface AppShellConfig {
    header?: HeaderConfig
    footer?: FooterConfig
    breakpoints?: BreakpointConfig
    theme?: Partial<AppShellTheme>
}