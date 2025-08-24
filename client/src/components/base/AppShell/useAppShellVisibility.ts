import { useContext, useCallback } from 'react'
import AppShellContext from './AppShellContext'
import { AppShellVisibilityOptions } from './types'

export const useAppShellVisibility = () => {
    const context = useContext(AppShellContext)
    
    if (!context) {
        throw new Error('useAppShellVisibility must be used within an AppShell')
    }

    const { visibility, setVisibility, resetVisibility } = context

    const hideHeader = useCallback(() => {
        setVisibility({ header: false })
    }, [setVisibility])

    const showHeader = useCallback(() => {
        setVisibility({ header: true })
    }, [setVisibility])

    const hideSideNav = useCallback(() => {
        setVisibility({ sideNav: false })
    }, [setVisibility])

    const showSideNav = useCallback(() => {
        setVisibility({ sideNav: true })
    }, [setVisibility])

    const hideFooter = useCallback(() => {
        setVisibility({ footer: false })
    }, [setVisibility])

    const showFooter = useCallback(() => {
        setVisibility({ footer: true })
    }, [setVisibility])

    const hideAll = useCallback(() => {
        setVisibility({ header: false, sideNav: false, footer: false })
    }, [setVisibility])

    const showAll = useCallback(() => {
        setVisibility({ header: true, sideNav: true, footer: true })
    }, [setVisibility])

    const setCustomVisibility = useCallback((options: AppShellVisibilityOptions) => {
        setVisibility(options)
    }, [setVisibility])

    return {
        visibility,
        hideHeader,
        showHeader,
        hideSideNav,
        showSideNav,
        hideFooter,
        showFooter,
        hideAll,
        showAll,
        setVisibility: setCustomVisibility,
        resetVisibility
    }
}

export default useAppShellVisibility