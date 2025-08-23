/**
 * Utility functions for AppShell routing
 */

/**
 * Get the base path from environment variable
 * Uses the same logic as TanStack router for consistency
 */
export const getBasePath = (): string => {
  const base = import.meta.env.VITE_APP_BASE || '/'
  return base === '/' ? '' : base.replace(/\/$/, '')
}

/**
 * Build a full URL with the base path included
 * @param path - The relative path (e.g., '/home', '/profile/123')
 * @returns Full path with base path prepended
 */
export const buildFullPath = (path: string): string => {
  const basePath = getBasePath()
  return basePath + path
}

/**
 * Strip the base path from a full path to get the relative path
 * @param fullPath - The full path including base path
 * @returns Relative path without base path
 */
export const stripBasePath = (fullPath: string): string => {
  const basePath = getBasePath()
  if (!basePath) return fullPath
  
  if (fullPath.startsWith(basePath)) {
    return fullPath.slice(basePath.length) || '/'
  }
  
  return fullPath
}

/**
 * Check if a path is external (starts with http/https)
 * @param path - The path to check
 * @returns true if external, false if internal
 */
export const isExternalPath = (path: string): boolean => {
  return path.startsWith('http://') || path.startsWith('https://')
}

/**
 * Check if a path is a hash link
 * @param path - The path to check
 * @returns true if hash link, false otherwise
 */
export const isHashPath = (path: string): boolean => {
  return path.startsWith('#')
}