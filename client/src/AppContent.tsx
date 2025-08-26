import React from 'react'
import {AppShell} from '@/components/base/AppShell'
import type {OnAfterNavigateFunction, OnBeforeNavigateFunction} from '@/components/base/AppShell/types'
import {routes} from "@/Routes.tsx";

// Main AppContent Component
const AppContent: React.FC = () => {
    // Authentication middleware for navigation control
    const handleBeforeNavigate: OnBeforeNavigateFunction<typeof routes> = async (next) => {
        // Allow all other navigation
        next()
    }

    // Post-navigation analytics and setup
    const handleAfterNavigate: OnAfterNavigateFunction = async (target) => {


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
                theme: {
                    primaryColor: '#D52122',
                    backgroundColor: '#FAFAFA',
                    navBackgroundColor: '#ffffff'
                }
            }}
        />
    )
}

export default AppContent;