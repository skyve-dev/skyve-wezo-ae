import { useState, useCallback, useRef, useEffect } from 'react'

interface DrawerState {
  id: string
  isOpen: boolean
  zIndex: number
}

interface UseDrawerManagerReturn {
  /**
   * Open a drawer with a specific ID
   */
  openDrawer: (id: string) => void
  
  /**
   * Close a drawer with a specific ID
   */
  closeDrawer: (id: string) => void
  
  /**
   * Toggle a drawer's open/closed state
   */
  toggleDrawer: (id: string) => void
  
  /**
   * Close all open drawers
   */
  closeAllDrawers: () => void
  
  /**
   * Check if a specific drawer is open
   */
  isDrawerOpen: (id: string) => boolean
  
  /**
   * Get the z-index for a specific drawer
   */
  getDrawerZIndex: (id: string) => number
  
  /**
   * Get the number of currently open drawers
   */
  openDrawerCount: number
  
  /**
   * Get all open drawer IDs
   */
  openDrawerIds: string[]
}

const BASE_Z_INDEX = 9999
const Z_INDEX_INCREMENT = 10

/**
 * Hook to manage multiple sliding drawers with proper z-index stacking
 */
export function useDrawerManager(): UseDrawerManagerReturn {
  const [drawers, setDrawers] = useState<Map<string, DrawerState>>(new Map())
  const nextZIndexRef = useRef(BASE_Z_INDEX)
  
  const openDrawer = useCallback((id: string) => {
    setDrawers(prev => {
      const newMap = new Map(prev)
      const currentDrawer = newMap.get(id)
      
      if (currentDrawer && currentDrawer.isOpen) {
        // Drawer is already open, bring it to front
        newMap.set(id, {
          ...currentDrawer,
          zIndex: nextZIndexRef.current
        })
        nextZIndexRef.current += Z_INDEX_INCREMENT
      } else {
        // Open new drawer or reopen closed drawer
        newMap.set(id, {
          id,
          isOpen: true,
          zIndex: nextZIndexRef.current
        })
        nextZIndexRef.current += Z_INDEX_INCREMENT
      }
      
      return newMap
    })
  }, [])
  
  const closeDrawer = useCallback((id: string) => {
    setDrawers(prev => {
      const newMap = new Map(prev)
      const drawer = newMap.get(id)
      
      if (drawer) {
        newMap.set(id, {
          ...drawer,
          isOpen: false
        })
      }
      
      return newMap
    })
  }, [])
  
  const toggleDrawer = useCallback((id: string) => {
    setDrawers(prev => {
      const newMap = new Map(prev)
      const currentDrawer = newMap.get(id)
      
      if (currentDrawer?.isOpen) {
        newMap.set(id, {
          ...currentDrawer,
          isOpen: false
        })
      } else {
        newMap.set(id, {
          id,
          isOpen: true,
          zIndex: nextZIndexRef.current
        })
        nextZIndexRef.current += Z_INDEX_INCREMENT
      }
      
      return newMap
    })
  }, [])
  
  const closeAllDrawers = useCallback(() => {
    setDrawers(prev => {
      const newMap = new Map()
      
      prev.forEach((drawer, id) => {
        newMap.set(id, {
          ...drawer,
          isOpen: false
        })
      })
      
      return newMap
    })
  }, [])
  
  const isDrawerOpen = useCallback((id: string): boolean => {
    const drawer = drawers.get(id)
    return drawer?.isOpen || false
  }, [drawers])
  
  const getDrawerZIndex = useCallback((id: string): number => {
    const drawer = drawers.get(id)
    return drawer?.zIndex || BASE_Z_INDEX
  }, [drawers])
  
  // Calculate derived values
  const openDrawerIds = Array.from(drawers.values())
    .filter(drawer => drawer.isOpen)
    .map(drawer => drawer.id)
  
  const openDrawerCount = openDrawerIds.length
  
  // Reset z-index counter when all drawers are closed
  useEffect(() => {
    if (openDrawerCount === 0) {
      nextZIndexRef.current = BASE_Z_INDEX
    }
  }, [openDrawerCount])
  
  return {
    openDrawer,
    closeDrawer,
    toggleDrawer,
    closeAllDrawers,
    isDrawerOpen,
    getDrawerZIndex,
    openDrawerCount,
    openDrawerIds
  }
}

export default useDrawerManager