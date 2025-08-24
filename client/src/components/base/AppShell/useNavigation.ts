import { useContext } from 'react'
import AppShellContext from './AppShellContext'

export const useNavigation = () => {
    const context = useContext(AppShellContext)
    
    if (!context) {
        throw new Error('useNavigation must be used within an AppShell')
    }

    const { navigateTo, navigateBack, canNavigateBack, currentRoute, currentParams } = context

    return {
        navigateTo,
        navigateBack,
        canNavigateBack,
        currentRoute,
        currentParams,
        // Convenience method to go to a specific route or go back
        goBack: navigateBack,
        // Check if we're on a specific route
        isCurrentRoute: (route: string) => currentRoute === route
    }
}

export default useNavigation