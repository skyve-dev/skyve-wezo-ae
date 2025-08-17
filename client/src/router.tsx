import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

// Get base path from environment variable, remove trailing slash if present
const getBasePath = () => {
  const base = import.meta.env.VITE_APP_BASE || '/'
  return base === '/' ? undefined : base.replace(/\/$/, '')
}

export const router = createRouter({ 
  routeTree,
  defaultPreload: 'intent',
  basepath: getBasePath(),
})