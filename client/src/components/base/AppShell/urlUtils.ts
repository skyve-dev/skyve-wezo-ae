/**
 * URL utility functions for AppShell routing with base path and query parameter support
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
 * Parse query parameters from URL search string
 */
export function parseQueryParams(search?: string): Record<string, any> {
  const searchString = search || window.location.search
  const params: Record<string, any> = {}
  
  if (!searchString) return params
  
  // Remove leading '?' if present
  const cleanSearch = searchString.startsWith('?') ? searchString.slice(1) : searchString
  
  if (!cleanSearch) return params
  
  // Parse each parameter
  cleanSearch.split('&').forEach(param => {
    const [key, value] = param.split('=')
    if (key) {
      const decodedKey = decodeURIComponent(key)
      const decodedValue = value ? decodeURIComponent(value) : ''
      
      // Try to parse as JSON for complex objects, fallback to string
      try {
        // Check if it looks like JSON (starts with { or [)
        if (decodedValue.startsWith('{') || decodedValue.startsWith('[')) {
          params[decodedKey] = JSON.parse(decodedValue)
        } else if (decodedValue === 'true') {
          params[decodedKey] = true
        } else if (decodedValue === 'false') {
          params[decodedKey] = false
        } else if (!isNaN(Number(decodedValue)) && decodedValue !== '') {
          params[decodedKey] = Number(decodedValue)
        } else {
          params[decodedKey] = decodedValue
        }
      } catch {
        // If JSON parsing fails, keep as string
        params[decodedKey] = decodedValue
      }
    }
  })
  
  return params
}

/**
 * Serialize parameters into URL query string
 */
export function serializeQueryParams(params: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) {
    return ''
  }
  
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      let serializedValue: string
      
      if (typeof value === 'object') {
        // Serialize objects/arrays as JSON
        serializedValue = JSON.stringify(value)
      } else {
        // Convert primitives to strings
        serializedValue = String(value)
      }
      
      searchParams.append(key, serializedValue)
    }
  })
  
  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

/**
 * Get current URL with both path and query parameters
 */
export function getCurrentUrl(): { path: string; params: Record<string, any> } {
  return {
    path: getCurrentPath(),
    params: parseQueryParams()
  }
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
 * Navigate to a URL using the History API with optional query parameters
 */
export function navigateToUrl(path: string, params?: Record<string, any>, replace: boolean = false): void {
  const queryString = params ? serializeQueryParams(params) : ''
  const fullPath = path + queryString
  const fullUrl = buildFullUrl(fullPath)
  
  if (replace) {
    window.history.replaceState(null, '', fullUrl)
  } else {
    window.history.pushState(null, '', fullUrl)
  }
}

/**
 * Check if two paths represent the same route (ignoring query parameters)
 */
export function isSamePath(path1: string, path2: string): boolean {
  const normalize = (p: string) => {
    // Remove query parameters and trailing slashes
    const pathOnly = p.split('?')[0]
    return pathOnly.replace(/\/$/, '') || '/'
  }
  return normalize(path1) === normalize(path2)
}

/**
 * Extract route key from URL path (ignoring query parameters)
 */
export function pathToRouteKeyWithParams(fullPath: string): { routeKey: string; params: Record<string, any> } {
  const [path, search] = fullPath.split('?')
  const routeKey = pathToRouteKey(path)
  const params = search ? parseQueryParams(`?${search}`) : {}
  
  return { routeKey, params }
}