import {
  BaseRoute,
  RouteMatch,
  NavigationOptions,
  RouterOptions,
  TransitionConfig,
  RouteGuard
} from './types.enhanced'
import { PathMatcher } from './PathMatcher'
import { HistoryManager } from './HistoryManager'
import { GuardExecutor } from './GuardExecutor'

export type RouteChangeListener = (match: RouteMatch | null) => void
export type TransitionListener = (phase: 'start' | 'end', config?: TransitionConfig) => void

export class Router<T extends Record<string, BaseRoute>> {
  private routes: Map<string, BaseRoute> = new Map()
  // private routeTree: RouteNode | null = null // Unused for now
  private flatRoutes: BaseRoute[] = []
  
  private matcher: PathMatcher
  private history: HistoryManager
  private guards: GuardExecutor
  
  private currentMatch: RouteMatch | null = null
  private previousMatch: RouteMatch | null = null
  private transitioning: boolean = false
  
  private routeChangeListeners: Set<RouteChangeListener> = new Set()
  private transitionListeners: Set<TransitionListener> = new Set()
  
  private options: RouterOptions

  constructor(routes: T, options: RouterOptions = {}) {
    this.options = {
      mode: 'history',
      syncWithUrl: true,
      scrollBehavior: 'auto',
      strict: false,
      caseSensitive: false,
      ...options
    }

    // Initialize components
    this.matcher = new PathMatcher({
      strict: this.options.strict,
      caseSensitive: this.options.caseSensitive
    })
    
    this.history = new HistoryManager(
      this.options.mode || 'history',
      this.options.baseUrl
    )
    
    this.guards = new GuardExecutor()

    // Process routes
    this.processRoutes(routes)
    
    // Future: Build route tree for nested route support

    // Setup history listener
    if (this.options.syncWithUrl) {
      this.history.subscribe((entry) => {
        this.handleHistoryChange(entry.path)
      })
    }

    // Initialize with current path
    this.initialize()
  }

  private processRoutes(routes: T): void {
    // Flatten routes for matching
    this.flatRoutes = this.matcher.flattenRoutes(routes as Record<string, BaseRoute>)
    
    // Store routes in map for quick access
    for (const [key, route] of Object.entries(routes)) {
      this.routes.set(key, route as BaseRoute)
      this.processRoute(key, route as BaseRoute)
    }
  }

  private processRoute(key: string, route: BaseRoute, parent?: BaseRoute): void {
    // Set full path pattern
    if (parent && parent.fullPath) {
      route.fullPath = `${parent.fullPath}/${route.path}`
    } else {
      route.fullPath = route.path.startsWith('/') ? route.path : `/${route.path}`
    }
    
    route.pathPattern = route.fullPath
    
    // Process children recursively
    if (route.children) {
      for (const [childKey, childRoute] of Object.entries(route.children)) {
        this.routes.set(`${key}.${childKey}`, childRoute)
        this.processRoute(`${key}.${childKey}`, childRoute, route)
      }
    }
  }


  private async initialize(): Promise<void> {
    const currentPath = this.history.getCurrentPath()
    await this.navigateToPath(currentPath, { skipHistory: true })
  }

  private async handleHistoryChange(path: string): Promise<void> {
    await this.navigateToPath(path, { skipHistory: true })
  }

  async navigate(
    path: string | keyof T,
    options: NavigationOptions = {}
  ): Promise<boolean> {
    // Convert route key to path if needed
    let targetPath: string
    if (this.routes.has(path as string)) {
      const route = this.routes.get(path as string)!
      targetPath = this.matcher.build(route.fullPath || route.path, options.state)
    } else {
      targetPath = path as string
    }

    return this.navigateToPath(targetPath, options)
  }

  private async navigateToPath(
    path: string,
    options: NavigationOptions & { skipHistory?: boolean } = {}
  ): Promise<boolean> {
    // Parse path and query
    const url = new URL(path, window.location.origin)
    const cleanPath = url.pathname
    const query = this.matcher.parseQuery(url.search)

    // Find matching route
    const match = this.matcher.matchBest(cleanPath, this.flatRoutes)
    
    if (!match) {
      console.warn(`No route found for path: ${path}`)
      // Try to find fallback route
      const fallback = this.flatRoutes.find(r => r.fallback)
      if (fallback) {
        const fallbackMatch: RouteMatch = {
          route: fallback,
          params: {},
          score: 0,
          path: cleanPath,
          search: query
        }
        return this.performNavigation(fallbackMatch, options)
      }
      return false
    }

    // Add query to match
    match.search = query

    return this.performNavigation(match, options)
  }

  private async performNavigation(
    match: RouteMatch,
    options: NavigationOptions & { skipHistory?: boolean } = {}
  ): Promise<boolean> {
    // Check if already at this route
    if (this.currentMatch && this.isSameRoute(this.currentMatch, match) && !options.replace) {
      return true
    }

    // Execute leave guards for current route
    if (this.currentMatch && !options.skipGuards) {
      const leaveGuards = this.getLeaveGuards(this.currentMatch.route)
      const leaveResult = await this.guards.execute(leaveGuards, match, this.currentMatch)
      
      if (leaveResult === false) {
        return false
      }
      
      if (typeof leaveResult === 'object') {
        // Handle redirect from leave guard
        return this.navigate(leaveResult.path, { replace: true })
      }
    }

    // Execute enter guards for new route
    if (!options.skipGuards) {
      const enterGuards = this.getEnterGuards(match.route)
      const enterResult = await this.guards.execute(enterGuards, match, this.currentMatch)
      
      if (enterResult === false) {
        return false
      }
      
      if (typeof enterResult === 'object') {
        // Handle redirect from enter guard
        return this.navigate(enterResult.path, { replace: true })
      }
    }

    // Start transition
    const transitionConfig = options.transition || match.route.transition || this.options.defaultTransition
    if (transitionConfig) {
      await this.startTransition(transitionConfig)
    }

    // Update history
    if (!options.skipHistory && this.options.syncWithUrl) {
      const fullPath = this.history.buildFullUrl(match.path, match.search)
      const entry = {
        path: fullPath,
        state: options.state,
        title: this.getRouteTitle(match),
        timestamp: Date.now(),
        scrollPosition: { x: 0, y: 0 }
      }

      if (options.replace) {
        this.history.replace(entry)
      } else {
        this.history.push(entry)
      }
    }

    // Update current match
    this.previousMatch = this.currentMatch
    this.currentMatch = match

    // Handle scroll behavior
    this.handleScrollBehavior(options.scroll)

    // Update document title
    this.updateDocumentTitle(match)

    // Execute middleware
    if (match.route.middleware) {
      await this.guards.executeMiddleware(match.route.middleware, match, this.previousMatch)
    }

    // Notify listeners
    this.notifyRouteChange(match)

    // End transition
    if (transitionConfig) {
      await this.endTransition(transitionConfig)
    }

    return true
  }

  private isSameRoute(a: RouteMatch, b: RouteMatch): boolean {
    if (a.path !== b.path) return false
    
    // Check params
    const aParams = JSON.stringify(a.params)
    const bParams = JSON.stringify(b.params)
    if (aParams !== bParams) return false
    
    // Check query
    const aQuery = JSON.stringify(a.search || {})
    const bQuery = JSON.stringify(b.search || {})
    if (aQuery !== bQuery) return false
    
    return true
  }

  private getEnterGuards(route: BaseRoute): RouteGuard[] {
    const guards: RouteGuard[] = []
    
    if (route.beforeEnter) {
      if (Array.isArray(route.beforeEnter)) {
        guards.push(...route.beforeEnter)
      } else {
        guards.push(route.beforeEnter)
      }
    }
    
    return guards
  }

  private getLeaveGuards(route: BaseRoute): RouteGuard[] {
    const guards: RouteGuard[] = []
    
    if (route.beforeLeave) {
      if (Array.isArray(route.beforeLeave)) {
        guards.push(...route.beforeLeave)
      } else {
        guards.push(route.beforeLeave)
      }
    }
    
    return guards
  }

  private getRouteTitle(match: RouteMatch): string {
    const route = match.route
    
    if (typeof route.title === 'function') {
      return route.title(match.params)
    }
    
    return route.title || route.label || document.title
  }

  private updateDocumentTitle(match: RouteMatch): void {
    document.title = this.getRouteTitle(match)
  }

  private handleScrollBehavior(scroll?: boolean | { x: number; y: number }): void {
    if (scroll === false) return
    
    if (typeof scroll === 'object') {
      window.scrollTo(scroll.x, scroll.y)
    } else if (this.options.scrollBehavior === 'auto' || scroll === true) {
      window.scrollTo(0, 0)
    }
  }

  private async startTransition(config: TransitionConfig): Promise<void> {
    this.transitioning = true
    this.notifyTransition('start', config)
    
    // Wait for exit animation
    const duration = config.duration || 0
    if (duration > 0) {
      await new Promise(resolve => setTimeout(resolve, duration / 2))
    }
  }

  private async endTransition(config: TransitionConfig): Promise<void> {
    // Wait for enter animation
    const duration = config.duration || 0
    if (duration > 0) {
      await new Promise(resolve => setTimeout(resolve, duration / 2))
    }
    
    this.transitioning = false
    this.notifyTransition('end', config)
  }

  // Public API
  getCurrentMatch(): RouteMatch | null {
    return this.currentMatch
  }

  getPreviousMatch(): RouteMatch | null {
    return this.previousMatch
  }

  getCurrentPath(): string {
    return this.history.getCurrentPath()
  }

  getCurrentUrl(): URL {
    return this.history.getCurrentUrl()
  }

  getParams(): Record<string, string> {
    return this.currentMatch?.params || {}
  }

  getQuery(): Record<string, any> {
    return this.currentMatch?.search || {}
  }

  isTransitioning(): boolean {
    return this.transitioning
  }

  back(): boolean {
    return this.history.back()
  }

  forward(): boolean {
    return this.history.forward()
  }

  go(delta: number): boolean {
    return this.history.go(delta)
  }

  canGoBack(): boolean {
    return this.history.canGoBack()
  }

  canGoForward(): boolean {
    return this.history.canGoForward()
  }

  buildPath(route: keyof T | string, params?: Record<string, any>): string {
    const routeObj = this.routes.get(route as string)
    if (!routeObj) return '/'
    
    return this.matcher.build(routeObj.fullPath || routeObj.path, params)
  }

  isActive(route: keyof T | string, exact: boolean = false): boolean {
    if (!this.currentMatch) return false
    
    const routeObj = this.routes.get(route as string)
    if (!routeObj) return false
    
    const routePath = routeObj.fullPath || routeObj.path
    const currentPath = this.currentMatch.path
    
    if (exact) {
      return routePath === currentPath
    }
    
    return currentPath.startsWith(routePath)
  }

  // Listener management
  onRouteChange(listener: RouteChangeListener): () => void {
    this.routeChangeListeners.add(listener)
    return () => this.routeChangeListeners.delete(listener)
  }

  onTransition(listener: TransitionListener): () => void {
    this.transitionListeners.add(listener)
    return () => this.transitionListeners.delete(listener)
  }

  private notifyRouteChange(match: RouteMatch | null): void {
    this.routeChangeListeners.forEach(listener => listener(match))
  }

  private notifyTransition(phase: 'start' | 'end', config?: TransitionConfig): void {
    this.transitionListeners.forEach(listener => listener(phase, config))
  }

  // Global guards
  addGlobalGuard(guard: RouteGuard): void {
    this.guards.addGlobalGuard(guard)
  }

  // Clean up
  destroy(): void {
    this.history.destroy()
    this.guards.clear()
    this.routeChangeListeners.clear()
    this.transitionListeners.clear()
  }
}