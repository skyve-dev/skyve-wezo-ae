import { createRootRoute, Outlet } from '@tanstack/react-router'
import { useEffect } from 'react'
import { applyGlobalStyles } from '@/utils/globalStyles'

export const Route = createRootRoute({
  component: () => {
    useEffect(() => {
      applyGlobalStyles()
    }, [])

    return <Outlet />
  },
})