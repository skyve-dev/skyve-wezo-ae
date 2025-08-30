import {useCallback, useEffect, useRef, useState} from 'react'

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
  const [drawers, setDrawers] = useState<Record<string, DrawerState>>({})
  const nextZIndexRef = useRef(BASE_Z_INDEX)
  
  const openDrawer = useCallback((id: string) => {
    if (!id) {
      console.error('useDrawerManager: openDrawer called with empty or undefined ID')
      return
    }
    
    setDrawers(prev => {
      const currentDrawer = prev[id]
      const zIndex = nextZIndexRef.current
      nextZIndexRef.current += Z_INDEX_INCREMENT
      
      if (currentDrawer && currentDrawer.isOpen) {
        // Drawer is already open, bring it to front
        const newState = {
          ...prev,
          [id]: {
            ...currentDrawer,
            zIndex
          }
        }
        return newState
      } else {
        // Open new drawer or reopen closed drawer
        const newState = {
          ...prev,
          [id]: {
            id,
            isOpen: true,
            zIndex
          }
        }
        return newState
      }
    })
  }, [])
  
  const closeDrawer = useCallback((id: string) => {
    if (!id) {
      console.error('useDrawerManager: closeDrawer called with empty or undefined ID')
      return
    }
    
    setDrawers(prev => {
      const drawer = prev[id]
      
      if (drawer) {
        return {
          ...prev,
          [id]: {
            ...drawer,
            isOpen: false
          }
        }
      }
      
      return prev
    })
  }, [])
  
  const toggleDrawer = useCallback((id: string) => {
    if (!id) {
      console.error('useDrawerManager: toggleDrawer called with empty or undefined ID')
      return
    }
    
    setDrawers(prev => {
      const currentDrawer = prev[id]
      
      if (currentDrawer?.isOpen) {
        return {
          ...prev,
          [id]: {
            ...currentDrawer,
            isOpen: false
          }
        }
      } else {
        const zIndex = nextZIndexRef.current
        nextZIndexRef.current += Z_INDEX_INCREMENT
        
        return {
          ...prev,
          [id]: {
            id,
            isOpen: true,
            zIndex
          }
        }
      }
    })
  }, [])
  
  const closeAllDrawers = useCallback(() => {
    setDrawers(prev => {
      const newState: Record<string, DrawerState> = {}
      
      Object.keys(prev).forEach((id) => {
        newState[id] = {
          ...prev[id],
          isOpen: false
        }
      })
      
      return newState
    })
  }, [])
  
  const isDrawerOpen = useCallback((id: string): boolean => {
    if (!id) {
      console.error('useDrawerManager: isDrawerOpen called with empty or undefined ID')
      return false
    }
    return drawers[id]?.isOpen || false
  }, [drawers])
  
  const getDrawerZIndex = useCallback((id: string): number => {
    if (!id) {
      console.error('useDrawerManager: getDrawerZIndex called with empty or undefined ID')
      return BASE_Z_INDEX
    }
    return drawers[id]?.zIndex || BASE_Z_INDEX
  }, [drawers])
  
  // Calculate derived values
  const openDrawerIds = Object.values(drawers)
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