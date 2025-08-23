import React, { useState } from 'react'
import { AppShell, createRoutes, useAppShell } from './index'
import { Box } from '../Box'
import { Button } from '../Button'
import { FaHome, FaUser, FaCog, FaLock, FaExclamationTriangle } from 'react-icons/fa'
import {OnBeforeNavigateFunction, OnAfterNavigateFunction} from "@/components/base/AppShell/types.ts";

// Example Components for Different Routes
const HomePage: React.FC = () => {
  const { navigateTo } = useAppShell()

  return (
    <Box padding="2rem">
      <h1>Home Page</h1>
      <p>This is the home page. Try navigating to different routes to see the hooks in action.</p>
      
      <Box marginTop="2rem" display="flex" gap="1rem" flexWrap="wrap">
        <Button 
          label="Go to Profile" 
          onClick={async () => await navigateTo('profile', { userId: 'user123' })} 
          variant="promoted"
        />
        <Button 
          label="Go to Settings" 
          onClick={async () => await navigateTo('settings', {})} 
          variant="normal"
        />
        <Button 
          label="Try Blocked Route" 
          onClick={async () => await navigateTo('blocked', {})} 
          variant="normal"
        />
      </Box>

      <Box marginTop="2rem" padding="1rem" backgroundColor="#f9fafb" borderRadius="6px">
        <h3 style={{ margin: '0 0 0.5rem 0' }}>Navigation Hooks Demo</h3>
        <p style={{ margin: '0', fontSize: '0.875rem', color: '#6b7280' }}>
          • <strong>Profile route</strong>: Will be redirected to home if not authenticated<br/>
          • <strong>Settings route</strong>: Will show a confirmation dialog before navigating<br/>
          • <strong>Blocked route</strong>: Navigation will be completely blocked
        </p>
      </Box>
    </Box>
  )
}

const ProfilePage: React.FC<{ userId: string }> = ({ userId }) => {
  const { navigateTo } = useAppShell()

  return (
    <Box padding="2rem">
      <h1>Profile Page</h1>
      <p>Welcome to the profile page for user: <strong>{userId}</strong></p>
      <p>This page demonstrates successful navigation after authentication check.</p>
      
      <Box marginTop="2rem">
        <Button 
          label="Back to Home" 
          onClick={async () => await navigateTo('home', {})} 
          variant="normal"
        />
      </Box>
    </Box>
  )
}

const SettingsPage: React.FC = () => {
  const { navigateTo } = useAppShell()

  return (
    <Box padding="2rem">
      <h1>Settings Page</h1>
      <p>This page demonstrates the onBeforeNavigate confirmation dialog.</p>
      <p>You should have seen a confirmation dialog before arriving here.</p>
      
      <Box marginTop="2rem">
        <Button 
          label="Back to Home" 
          onClick={async () => await navigateTo('home', {})} 
          variant="normal"
        />
      </Box>
    </Box>
  )
}

const BlockedPage: React.FC = () => {
  return (
    <Box padding="2rem">
      <h1>Blocked Page</h1>
      <p>You should never see this page because navigation is blocked!</p>
    </Box>
  )
}

// Create routes
const routes = createRoutes({
  home: {
    component: HomePage,
    icon: <FaHome />,
    label: 'Home',
    showInNav: true,
    showInHeader: true,
    showInFooter: true
  },
  profile: {
    component: ProfilePage,
    icon: <FaUser />,
    label: 'Profile',
    showInNav: true,
    showInHeader: true,
    showInFooter: true
  },
  settings: {
    component: SettingsPage,
    icon: <FaCog />,
    label: 'Settings',
    showInNav: true,
    showInHeader: true,
    showInFooter: true
  },
  blocked: {
    component: BlockedPage,
    icon: <FaLock />,
    label: 'Blocked',
    showInNav: false,
    showInHeader: false,
    showInFooter: false
  }
})

// Navigation hooks example component
const HooksExample: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // onBeforeNavigate hook - handles authentication and confirmations
  const handleBeforeNavigate:OnBeforeNavigateFunction<typeof routes> = async (next, target, source) => {
    console.log('🚀 onBeforeNavigate called')
    console.log('📍 Source:', source)
    console.log('🎯 Target:', target)

    // Now we have access to the actual target and source routes
    // Check if navigating to profile route without authentication
    if (target.path === '/profile' && !isAuthenticated) {
      console.log('❌ Not authenticated, redirecting to home')
      next('home', {}) // Redirect to home
      return
    }

    // Check if navigating to settings route - show confirmation
    if (target.path === '/settings') {
      const confirmed = window.confirm('Are you sure you want to navigate to Settings?')
      if (!confirmed) {
        console.log('❌ User cancelled navigation')
        return // Don't call next() - this blocks navigation
      }
    }

    // Block the blocked route
    if (target.path === '/blocked') {
      console.log('🚫 Navigation blocked by policy')
      alert('This route is blocked by security policy')
      return // Don't call next() - this blocks navigation
    }

    // Log route params if any
    if (Object.keys(target.params).length > 0) {
      console.log('📦 Route params:', target.params)
    }

    console.log('✅ Navigation approved')
    next() // Continue with original navigation
  }

  // onAfterNavigate hook - handles post-navigation logic
  const handleAfterNavigate: OnAfterNavigateFunction = async (target, source) => {
    console.log('🎯 onAfterNavigate called - navigation completed')
    console.log('📍 Navigated from:', source)
    console.log('✅ Navigated to:', target)
    
    // Simulate analytics tracking with route info
    console.log('📊 Tracking navigation event:', {
      from: source.path,
      to: target.path,
      params: target.params,
      timestamp: Date.now()
    })
    
    // Simulate cleanup or setup tasks based on route
    if (target.path === '/profile') {
      console.log('👤 Loading user profile data...')
    }
    
    if (source.path === '/settings') {
      console.log('💾 Saving settings before leaving...')
    }
    
    // Update page title based on target route
    console.log(`📄 Updating page title for ${target.path}`)
    
    // You could also trigger other side effects here
    // - Update user activity
    // - Load additional data
    // - Update breadcrumbs
    // - etc.
  }

  return (
    <Box>
      {/* Authentication toggle for demo */}
      <Box padding="1rem" backgroundColor="#fef3cd" borderRadius="6px" marginBottom="1rem">
        <Box display="flex" alignItems="center" gap="1rem">
          <span style={{ fontWeight: '500' }}>Demo Authentication:</span>
          <Button
            label={isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            onClick={() => setIsAuthenticated(!isAuthenticated)}
            variant={isAuthenticated ? 'promoted' : 'normal'}
            size="small"
          />
          <span style={{ fontSize: '0.875rem', color: '#92400e' }}>
            (Toggle to test authentication redirects)
          </span>
        </Box>
      </Box>

      <AppShell 
        routes={routes}
        initialRoute="home"
        onBeforeNavigate={handleBeforeNavigate}
        onAfterNavigate={handleAfterNavigate}
        config={{
          header: {
            title: 'Navigation Hooks Demo',
            logo: <FaExclamationTriangle />
          }
        }}
      />

      {/* Instructions */}
      <Box
        position="fixed"
        bottom="1rem"
        right="1rem"
        backgroundColor="white"
        borderRadius="8px"
        padding="1rem"
        boxShadow="0 10px 25px rgba(0, 0, 0, 0.15)"
        border="1px solid #e5e7eb"
        maxWidth="350px"
        zIndex="50"
      >
        <h4 style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
          🎮 Navigation Hooks Demo
        </h4>
        <ul style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, paddingLeft: '1rem' }}>
          <li>Open browser console to see hook execution logs</li>
          <li>Try navigating between routes multiple times</li>
          <li>Toggle authentication status and test profile access</li>
          <li>Some routes may show confirmation dialogs</li>
          <li>Some navigation attempts may be blocked</li>
        </ul>
      </Box>
    </Box>
  )
}

export default HooksExample