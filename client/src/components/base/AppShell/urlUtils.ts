/**
 * URL utility functions for AppShell routing with base path support
 */

/**
 * Get the application's base path from environment variable
 */
export function getBasePath(): string {
  const base = import.meta.env.VITE_APP_BASE || '/'
  return base === '/' ? '' : base.replace(/\/$/, '')
}

/**
 * Get the current pathname without the base path
 */
export function getCurrentPath(): string {
  const basePath = getBasePath()
  const fullPath = window.location.pathname
  
  if (basePath && fullPath.startsWith(basePath)) {
    return fullPath.slice(basePath.length) || '/'
  }
  
  return fullPath
}

/**
 * Build a full URL with the base path prepended
 */
export function buildFullUrl(path: string): string {
  const basePath = getBasePath()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return basePath + cleanPath
}

/**
 * Extract route key from URL path
 * Converts '/path' or 'path' to route key
 */
export function pathToRouteKey(path: string): string {
  // Remove leading slash and use as route key
  const cleanPath = path.replace(/^\//, '')
  return cleanPath || 'home' // Default to 'home' if empty path
}

/**
 * Convert route key to URL path
 */
export function routeKeyToPath(routeKey: string): string {
  return routeKey === 'home' ? '/' : `/${routeKey}`
}

/**
 * Navigate to a URL using the History API
 */
export function navigateToUrl(path: string, replace: boolean = false): void {
  const fullUrl = buildFullUrl(path)
  
  if (replace) {
    window.history.replaceState(null, '', fullUrl)
  } else {
    window.history.pushState(null, '', fullUrl)
  }
}

/**
 * Check if two paths represent the same route
 */
export function isSamePath(path1: string, path2: string): boolean {
  const normalize = (p: string) => p.replace(/\/$/, '') || '/'
  return normalize(path1) === normalize(path2)
}