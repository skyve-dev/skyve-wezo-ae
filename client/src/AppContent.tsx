import React from 'react'
import {AppShell} from '@/components/base/AppShell'
import {useAppSelector} from '@/store'
import {selectIsAuthenticated} from '@/store/slices/authSlice'
import {FaHome} from 'react-icons/fa'
import type {OnAfterNavigateFunction, OnBeforeNavigateFunction} from '@/components/base/AppShell/types'
import {routes} from "@/Routes.tsx";


// Main AppContent Component
const AppContent: React.FC = () => {
    const isAuthenticated = useAppSelector(selectIsAuthenticated)

    // Authentication middleware for navigation control
    const handleBeforeNavigate: OnBeforeNavigateFunction<typeof routes> = async (next, target, source) => {
        console.log('Navigation:', {from: source.path, to: target.path, authenticated: isAuthenticated})
        // Allow all other navigation
        next()
    }

    // Post-navigation analytics and setup
    const handleAfterNavigate: OnAfterNavigateFunction = async (target, source) => {
        console.log('Navigation completed:', {
            from: source.path,
            to: target.path,
            authenticated: isAuthenticated
        })

        // Update document title based on route
        const titles = {
            '/': 'Wezo.ae - Premium Villa Rentals in UAE',
            '/login': 'Sign In - Wezo.ae',
            '/register': 'Create Account - Wezo.ae'
        }
        document.title = titles[target.path as keyof typeof titles] || 'Wezo.ae'
    }

    return (
        <AppShell
            routes={routes}
            initialRoute="dashboard"
            onBeforeNavigate={handleBeforeNavigate}
            onAfterNavigate={handleAfterNavigate}
            config={{
                splash: {
                    duration: 0,
                    logo: <FaHome/>,
                    text: 'Loading Wezo.ae...'
                },
                header: {
                    title: 'Wezo.ae',
                    logo: <FaHome/>,
                    showQuickNav: true
                },
                footer: {
                    showOnMobile: true,
                    maxItems: 3
                },
                theme: {
                    primaryColor: '#6366f1',
                    backgroundColor: '#f8fafc',
                    navBackgroundColor: '#ffffff'
                }
            }}
        />
    )
}

export default AppContent;