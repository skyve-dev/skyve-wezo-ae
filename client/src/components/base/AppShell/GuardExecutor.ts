import {
  RouteGuard,
  GuardResult,
  GuardContext,
  NavigationRedirect,
  RouteMatch,
  Middleware,
  MiddlewareContext
} from './types.enhanced'

export class GuardExecutor {
  private globalGuards: RouteGuard[] = []
  private globalMiddleware: Middleware[] = []

  // Add global guards that run for all routes
  addGlobalGuard(guard: RouteGuard): void {
    this.globalGuards.push(guard)
  }

  // Add global middleware
  addGlobalMiddleware(middleware: Middleware): void {
    this.globalMiddleware.push(middleware)
  }

  // Execute guards for a route transition
  async execute(
    guards: RouteGuard[],
    to: RouteMatch,
    from: RouteMatch | null
  ): Promise<GuardResult> {
    // Combine global and route-specific guards
    const allGuards = [...this.globalGuards, ...guards]
    
    if (allGuards.length === 0) {
      return true
    }

    // Create guard context
    const context = this.createContext(to, from)
    
    // Execute guards in sequence
    for (const guard of allGuards) {
      const result = await this.executeGuard(guard, context)
      
      if (result === false) {
        return false
      }
      
      if (typeof result === 'object' && result !== null) {
        // Handle redirect
        return result as NavigationRedirect
      }
    }

    return true
  }

  // Execute a single guard
  private async executeGuard(
    guard: RouteGuard,
    context: GuardContext
  ): Promise<GuardResult> {
    return new Promise((resolve) => {
      let resolved = false
      
      // Create next function
      const next = (result?: GuardResult) => {
        if (resolved) return
        resolved = true
        resolve(result !== undefined ? result : true)
      }

      // Create abort function
      const abort = () => {
        if (resolved) return
        resolved = true
        resolve(false)
      }

      // Create redirect function
      const redirect = (path: string) => {
        if (resolved) return
        resolved = true
        resolve({ path, replace: true })
      }

      // Execute guard
      const guardContext: GuardContext = {
        ...context,
        next,
        abort,
        redirect
      }

      try {
        const result = guard(guardContext)
        
        // Handle async guards
        if (result instanceof Promise) {
          result.then(r => {
            if (!resolved) {
              resolved = true
              resolve(r)
            }
          }).catch(() => {
            if (!resolved) {
              resolved = true
              resolve(false)
            }
          })
        } else {
          // Handle sync guards
          if (!resolved) {
            resolved = true
            resolve(result)
          }
        }
      } catch (error) {
        console.error('Guard execution error:', error)
        if (!resolved) {
          resolved = true
          resolve(false)
        }
      }

      // Timeout fallback
      setTimeout(() => {
        if (!resolved) {
          console.warn('Guard timeout - auto-resolving to false')
          resolved = true
          resolve(false)
        }
      }, 5000)
    })
  }

  // Execute middleware
  async executeMiddleware(
    middleware: Middleware[],
    to: RouteMatch,
    from: RouteMatch | null
  ): Promise<void> {
    const allMiddleware = [...this.globalMiddleware, ...middleware]
    
    if (allMiddleware.length === 0) {
      return
    }

    const context = this.createMiddlewareContext(to, from)
    
    // Execute middleware in sequence
    for (const mw of allMiddleware) {
      await this.executeMiddlewareItem(mw, context)
    }
  }

  private async executeMiddlewareItem(
    middleware: Middleware,
    context: MiddlewareContext
  ): Promise<void> {
    return new Promise((resolve) => {
      const next = () => resolve()
      
      try {
        const result = middleware(context, next)
        
        if (result instanceof Promise) {
          result.then(() => resolve()).catch((error) => {
            console.error('Middleware error:', error)
            resolve()
          })
        }
      } catch (error) {
        console.error('Middleware execution error:', error)
        resolve()
      }
    })
  }

  // Create guard context
  private createContext(to: RouteMatch, from: RouteMatch | null): GuardContext {
    return {
      to,
      from,
      params: to.params,
      query: to.search || {},
      meta: to.route.meta || {},
      next: () => {},
      abort: () => {},
      redirect: () => {}
    }
  }

  // Create middleware context
  private createMiddlewareContext(
    to: RouteMatch,
    from: RouteMatch | null
  ): MiddlewareContext {
    const metaStore: Record<string, any> = {}
    
    return {
      ...this.createContext(to, from),
      setMeta: (key: string, value: any) => {
        metaStore[key] = value
      },
      getMeta: (key: string) => {
        return metaStore[key]
      }
    }
  }

  // Chain multiple guards into one
  chain(guards: RouteGuard[]): RouteGuard {
    return (context: GuardContext): GuardResult => {
      // For now, just return the first guard or true if none
      if (guards.length === 0) return true
      return guards[0](context)
    }
  }

  // Common guard factories
  static requireAuth(): RouteGuard {
    return (context: GuardContext): GuardResult => {
      const isAuthenticated = context.meta.isAuthenticated || false
      
      if (!isAuthenticated) {
        // Redirect to login with return URL
        return {
          path: '/login',
          state: { returnTo: context.to.path }
        }
      }
      
      return true
    }
  }

  static requireRole(roles: string[]): RouteGuard {
    return (context: GuardContext) => {
      const userRoles = context.meta.userRoles || []
      const hasRole = roles.some(role => userRoles.includes(role))
      
      if (!hasRole) {
        return false
      }
      
      return true
    }
  }

  static requirePermission(permissions: string[]): RouteGuard {
    return (context: GuardContext) => {
      const userPermissions = context.meta.userPermissions || []
      const hasPermission = permissions.some(perm => userPermissions.includes(perm))
      
      if (!hasPermission) {
        return false
      }
      
      return true
    }
  }

  static confirmLeave(message?: string): RouteGuard {
    return (/* context: GuardContext */) => {
      const msg = message || 'Are you sure you want to leave? You may have unsaved changes.'
      
      if (window.confirm(msg)) {
        return true
      }
      
      return false
    }
  }

  // Clear all guards and middleware
  clear(): void {
    this.globalGuards = []
    this.globalMiddleware = []
  }
}