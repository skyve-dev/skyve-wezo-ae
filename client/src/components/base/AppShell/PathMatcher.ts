import { RouteMatch, BaseRoute } from './types.enhanced'

export interface CompiledPath {
  regex: RegExp
  keys: string[]
  pattern: string
}

export class PathMatcher {
  private cache: Map<string, CompiledPath> = new Map()
  private strict: boolean
  private caseSensitive: boolean

  constructor(options: { strict?: boolean; caseSensitive?: boolean } = {}) {
    this.strict = options.strict ?? false
    this.caseSensitive = options.caseSensitive ?? false
  }

  compile(pattern: string): CompiledPath {
    // Check cache
    const cacheKey = `${pattern}-${this.strict}-${this.caseSensitive}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    const keys: string[] = []
    let regexPattern = pattern

    // Handle wildcards
    if (pattern.endsWith('/*')) {
      regexPattern = pattern.slice(0, -2) + '(?:/(.*))?'
    } else if (pattern === '**' || pattern.endsWith('/**')) {
      regexPattern = pattern.replace('/**', '(?:/.*)?').replace('**', '.*')
    }

    // Extract and replace parameters
    regexPattern = regexPattern.replace(/:([^/]+)/g, (_, key) => {
      keys.push(key)
      return '([^/]+)'
    })

    // Handle optional parameters
    regexPattern = regexPattern.replace(/\?/g, '?')

    // Add start and end anchors
    if (this.strict) {
      regexPattern = `^${regexPattern}$`
    } else {
      regexPattern = `^${regexPattern}(?:/)?$`
    }

    const flags = this.caseSensitive ? '' : 'i'
    const regex = new RegExp(regexPattern, flags)

    const compiled = { regex, keys, pattern }
    this.cache.set(cacheKey, compiled)
    return compiled
  }

  match(path: string, route: BaseRoute): RouteMatch | null {
    const pattern = route.pathPattern || route.path
    const compiled = this.compile(pattern)
    const match = path.match(compiled.regex)

    if (!match) return null

    // Extract parameters
    const params: Record<string, string> = {}
    compiled.keys.forEach((key, index) => {
      params[key] = match[index + 1] || ''
    })

    // Validate parameters if schema is provided
    if (route.params) {
      for (const [key, schema] of Object.entries(route.params)) {
        const value = params[key]
        
        if (schema.required && !value) {
          return null
        }

        if (value && schema.validate && !schema.validate(value)) {
          return null
        }

        if (value && schema.transform) {
          params[key] = schema.transform(value)
        }
      }
    }

    // Calculate match score (for route precedence)
    let score = 0
    if (path === pattern) score = 1000 // Exact match
    else if (!pattern.includes(':') && !pattern.includes('*')) score = 900 // Static route
    else if (pattern.includes(':')) score = 800 - compiled.keys.length * 10 // Dynamic route
    else if (pattern.includes('*')) score = 700 // Wildcard route
    else score = 600

    return {
      route,
      params,
      score,
      path
    }
  }

  build(pattern: string, params: Record<string, any> = {}): string {
    let path = pattern

    // Replace parameters
    for (const [key, value] of Object.entries(params)) {
      path = path.replace(`:${key}`, String(value))
    }

    // Remove optional parameters that weren't provided
    path = path.replace(/\/:([^/]+)\?/g, (_, key) => {
      return params[key] ? `/${params[key]}` : ''
    })

    return path
  }

  parseQuery(search: string): Record<string, any> {
    const params = new URLSearchParams(search)
    const result: Record<string, any> = {}

    params.forEach((value, key) => {
      // Handle arrays (multiple values with same key)
      if (result[key]) {
        if (Array.isArray(result[key])) {
          result[key].push(value)
        } else {
          result[key] = [result[key], value]
        }
      } else {
        // Try to parse as JSON for complex values
        try {
          result[key] = JSON.parse(value)
        } catch {
          // Parse booleans and numbers
          if (value === 'true') result[key] = true
          else if (value === 'false') result[key] = false
          else if (!isNaN(Number(value)) && value !== '') result[key] = Number(value)
          else result[key] = value
        }
      }
    })

    return result
  }

  stringifyQuery(query: Record<string, any>): string {
    const params = new URLSearchParams()

    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue

      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, String(v)))
      } else if (typeof value === 'object') {
        params.append(key, JSON.stringify(value))
      } else {
        params.append(key, String(value))
      }
    }

    return params.toString()
  }

  // Match multiple routes and return the best match
  matchBest(path: string, routes: BaseRoute[]): RouteMatch | null {
    const matches: RouteMatch[] = []

    for (const route of routes) {
      const match = this.match(path, route)
      if (match) matches.push(match)
    }

    if (matches.length === 0) return null

    // Sort by score (highest first)
    matches.sort((a, b) => b.score - a.score)
    return matches[0]
  }

  // Extract all possible paths from nested routes
  flattenRoutes(routes: Record<string, BaseRoute>, parentPath = ''): BaseRoute[] {
    const flattened: BaseRoute[] = []

    for (const [, route] of Object.entries(routes)) {
      const fullPath = parentPath ? `${parentPath}/${route.path}` : route.path
      const processedRoute = {
        ...route,
        fullPath,
        pathPattern: fullPath
      }

      flattened.push(processedRoute)

      if (route.children) {
        flattened.push(...this.flattenRoutes(route.children, fullPath))
      }
    }

    return flattened
  }
}