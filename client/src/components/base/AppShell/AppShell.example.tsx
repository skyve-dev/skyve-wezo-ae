import React, { useState } from 'react'
import AppShell from './AppShell'
import { AppShellProvider, useAppShell, createRoutes, RouteLink } from './AppShellContext.tsx'
import { getBasePath } from './utils'
// import { GuardExecutor } from './GuardExecutor'
import { Box } from '../Box'
import { Button } from '../Button'
import { Input } from '../Input'
import {
  FaHome,
  FaUser,
  FaCog,
  FaChartBar,
  FaSearch,
  FaRocket,
  FaShieldAlt,
  FaLock,
  FaSignOutAlt
} from 'react-icons/fa'
import type { RouteGuard } from './types.enhanced'

// Simulated auth state
let isAuthenticated = false
let userRole = 'user'

// Authentication guard
const requireAuth: RouteGuard = (context) => {
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login')
    return {
      path: '/login',
      state: { returnTo: context.to.path }
    }
  }
  return true
}

// Role-based guard
const requireAdmin: RouteGuard = (context) => {
  if (userRole !== 'admin') {
    context.abort()
    alert('You need admin privileges to access this page')
    return false
  }
  return true
}

// Unsaved changes guard
const confirmLeave: RouteGuard = (context) => {
  if (context.from?.path.includes('settings')) {
    return window.confirm('Leave without saving changes?')
  }
  return true
}

// Login Page Component
const LoginPage: React.FC = () => {
  const { navigateTo, queryState } = useAppShell<typeof routes>()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    // Simulate login
    if (username && password) {
      isAuthenticated = true
      userRole = username === 'admin' ? 'admin' : 'user'
      
      // Navigate to return URL or home
      const returnTo = queryState.returnTo || '/home'
      await navigateTo(returnTo)
    }
  }

  return (
    <Box padding="2rem" maxWidth="400px" margin="0 auto">
      <Box backgroundColor="white" borderRadius="8px" padding="2rem" border="1px solid #e5e7eb">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>
          <FaLock style={{ marginRight: '0.5rem' }} />
          Login Required
        </h1>
        
        <Box display="flex" flexDirection="column" gap="1rem">
          <Box>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Username
            </label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username (use 'admin' for admin role)"
              width="100%"
            />
          </Box>
          
          <Box>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter any password"
              width="100%"
            />
          </Box>
          
          <Button
            label="Login"
            onClick={handleLogin}
            variant="promoted"
            width="100%"
          />
        </Box>
        
        <Box marginTop="1rem" textAlign="center" fontSize="0.875rem" color="#6b7280">
          Hint: Use "admin" as username for admin access
        </Box>
      </Box>
    </Box>
  )
}

// Home Page with URL sync demo
const HomePage: React.FC = () => {
  const { currentPath, canGoBack, goBack } = useAppShell<typeof routes>()

  return (
    <Box padding="2rem" maxWidth="800px" margin="0 auto">
      <Box marginBottom="2rem">
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          🏠 Enhanced AppShell with URL Routing
        </h1>
        <Box backgroundColor="#e0f2fe" padding="1rem" borderRadius="8px" marginBottom="1rem">
          <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
            Current URL Path: <code>{currentPath}</code>
          </p>
          <p style={{ fontSize: '0.875rem', color: '#0369a1' }}>
            Notice how the browser URL changes as you navigate! Try using browser back/forward buttons.
          </p>
        </Box>
        
        {canGoBack && (
          <Button
            label="← Browser Back"
            onClick={goBack}
            variant="normal"
            marginBottom="1rem"
          />
        )}
      </Box>

      <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap="1.5rem">
        <Box padding="1.5rem" backgroundColor="white" borderRadius="8px" border="1px solid #e5e7eb">
          <h3 style={{ fontWeight: '600', marginBottom: '1rem', color: '#3b82f6' }}>
            🔗 URL-based Routing
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
            Routes sync with browser URL. Try refreshing the page - you'll stay on the same route!
          </p>
          <RouteLink to="/profile/123">
            <Button label="Go to Profile #123" variant="normal" size="small" width="100%" />
          </RouteLink>
        </Box>

        <Box padding="1.5rem" backgroundColor="white" borderRadius="8px" border="1px solid #e5e7eb">
          <h3 style={{ fontWeight: '600', marginBottom: '1rem', color: '#10b981' }}>
            🛡️ Route Guards
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
            Protected routes with authentication and role checks.
          </p>
          <RouteLink to="/admin">
            <Button label="Try Admin Page" variant="normal" size="small" width="100%" />
          </RouteLink>
        </Box>

        <Box padding="1.5rem" backgroundColor="white" borderRadius="8px" border="1px solid #e5e7eb">
          <h3 style={{ fontWeight: '600', marginBottom: '1rem', color: '#f59e0b' }}>
            🎭 Transitions
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
            Smooth page transitions with configurable animations.
          </p>
          <RouteLink to="/dashboard">
            <Button label="See Transition" variant="normal" size="small" width="100%" />
          </RouteLink>
        </Box>
      </Box>
    </Box>
  )
}

// Profile Page with Dynamic Routes
const ProfilePage: React.FC = () => {
  const { params, navigateTo, updateSearchParams, queryState } = useAppShell<typeof routes>()
  const userId = params.id || 'unknown'
  const tab = queryState.tab || 'info'

  return (
    <Box padding="2rem" maxWidth="800px" margin="0 auto">
      <Box marginBottom="2rem">
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          👤 User Profile
        </h1>
        <Box backgroundColor="#fef3c7" padding="1rem" borderRadius="8px" marginBottom="1rem">
          <p style={{ fontWeight: '600' }}>
            Dynamic Route Parameter: User ID = <code>{userId}</code>
          </p>
          <p style={{ fontSize: '0.875rem', color: '#92400e', marginTop: '0.5rem' }}>
            This ID was extracted from the URL path: /profile/:id
          </p>
        </Box>
      </Box>

      <Box backgroundColor="white" borderRadius="8px" border="1px solid #e5e7eb" padding="2rem">
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
          Profile for User #{userId}
        </h2>
        
        <Box marginBottom="2rem">
          <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Query Parameters Demo</h3>
          <Box display="flex" gap="0.5rem" flexWrap="wrap">
            <Button
              label="Info Tab"
              onClick={() => updateSearchParams({ tab: 'info' })}
              variant={tab === 'info' ? 'promoted' : 'normal'}
              size="small"
            />
            <Button
              label="Settings Tab"
              onClick={() => updateSearchParams({ tab: 'settings' })}
              variant={tab === 'settings' ? 'promoted' : 'normal'}
              size="small"
            />
            <Button
              label="Activity Tab"
              onClick={() => updateSearchParams({ tab: 'activity' })}
              variant={tab === 'activity' ? 'promoted' : 'normal'}
              size="small"
            />
          </Box>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '1rem' }}>
            Current Tab (from query string): <code>{tab}</code>
          </p>
        </Box>

        <Box>
          <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Navigate to Other Users</h3>
          <Box display="flex" gap="0.5rem" flexWrap="wrap">
            <Button
              label="User #456"
              onClick={() => navigateTo('/profile/456')}
              variant="normal"
              size="small"
            />
            <Button
              label="User #789"
              onClick={() => navigateTo('/profile/789')}
              variant="normal"
              size="small"
            />
            <Button
              label="User #admin"
              onClick={() => navigateTo('/profile/admin')}
              variant="normal"
              size="small"
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

// Dashboard with nested routes
const DashboardPage: React.FC = () => {
  const { navigateTo, isActive } = useAppShell<typeof routes>()

  return (
    <Box padding="2rem" maxWidth="1000px" margin="0 auto">
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        📊 Dashboard
      </h1>
      
      <Box display="grid" gridTemplateColumns="200px 1fr" gap="2rem">
        <Box>
          <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Sub-sections</h3>
          <Box display="flex" flexDirection="column" gap="0.5rem">
            <Button
              label="Overview"
              onClick={() => navigateTo('/dashboard/overview')}
              variant={isActive('/dashboard/overview') ? 'promoted' : 'normal'}
              size="small"
              width="100%"
            />
            <Button
              label="Analytics"
              onClick={() => navigateTo('/dashboard/analytics')}
              variant={isActive('/dashboard/analytics') ? 'promoted' : 'normal'}
              size="small"
              width="100%"
            />
            <Button
              label="Reports"
              onClick={() => navigateTo('/dashboard/reports')}
              variant={isActive('/dashboard/reports') ? 'promoted' : 'normal'}
              size="small"
              width="100%"
            />
          </Box>
        </Box>
        
        <Box backgroundColor="white" borderRadius="8px" border="1px solid #e5e7eb" padding="2rem">
          <p>Select a sub-section from the menu to see nested routing in action.</p>
        </Box>
      </Box>
    </Box>
  )
}

// Settings Page with leave guard
const SettingsPage: React.FC = () => {
  const [hasChanges, setHasChanges] = useState(false)

  return (
    <Box padding="2rem" maxWidth="800px" margin="0 auto">
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        ⚙️ Settings
      </h1>
      
      <Box backgroundColor="white" borderRadius="8px" border="1px solid #e5e7eb" padding="2rem">
        <Box backgroundColor="#fee2e2" padding="1rem" borderRadius="8px" marginBottom="1.5rem">
          <p style={{ fontWeight: '600', color: '#991b1b' }}>
            ⚠️ This page has a leave guard!
          </p>
          <p style={{ fontSize: '0.875rem', color: '#7f1d1d', marginTop: '0.5rem' }}>
            Try navigating away after making changes - you'll be prompted to confirm.
          </p>
        </Box>
        
        <Box>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Sample Setting
          </label>
          <Input
            type="text"
            placeholder="Type something to trigger unsaved changes"
            onChange={() => setHasChanges(true)}
            width="100%"
          />
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
            Status: {hasChanges ? '⚠️ Unsaved changes' : '✅ No changes'}
          </p>
        </Box>
      </Box>
    </Box>
  )
}

// Admin Page (protected)
const AdminPage: React.FC = () => {
  const { navigateTo } = useAppShell<typeof routes>()

  const handleLogout = () => {
    isAuthenticated = false
    userRole = 'user'
    navigateTo('/login')
  }

  return (
    <Box padding="2rem" maxWidth="800px" margin="0 auto">
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        🔐 Admin Dashboard
      </h1>
      
      <Box backgroundColor="white" borderRadius="8px" border="1px solid #e5e7eb" padding="2rem">
        <Box backgroundColor="#dcfce7" padding="1rem" borderRadius="8px" marginBottom="1.5rem">
          <p style={{ fontWeight: '600', color: '#166534' }}>
            ✅ You have admin access!
          </p>
          <p style={{ fontSize: '0.875rem', color: '#14532d', marginTop: '0.5rem' }}>
            This page is protected by role-based route guards.
          </p>
        </Box>
        
        <Button
          label="Logout"
          icon={<FaSignOutAlt />}
          onClick={handleLogout}
          variant="normal"
        />
      </Box>
    </Box>
  )
}

// 404 Fallback Page
const NotFoundPage: React.FC = () => {
  const { navigateTo, currentPath } = useAppShell<typeof routes>()

  return (
    <Box padding="2rem" maxWidth="600px" margin="0 auto" textAlign="center">
      <h1 style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '1rem' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Page Not Found</h2>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
        The path <code>{currentPath}</code> doesn't exist.
      </p>
      <Button
        label="Go Home"
        onClick={() => navigateTo('/home')}
        variant="promoted"
      />
    </Box>
  )
}

// Define routes with all enhanced features
const routes = createRoutes({
  login: {
    path: '/login',
    component: LoginPage,
    icon: <FaLock />,
    label: 'Login',
    showInNav: false,
    title: 'Login - AppShell Demo'
  },
  home: {
    path: '/home',
    component: HomePage,
    icon: <FaHome />,
    label: 'Home',
    showInNav: true,
    showInHeader: true,
    showInFooter: true,
    title: 'Home - AppShell Demo',
    transition: {
      type: 'fade',
      duration: 300
    }
  },
  profile: {
    path: '/profile/:id',
    component: ProfilePage,
    icon: <FaUser />,
    label: 'Profile',
    showInNav: true,
    showInHeader: true,
    showInFooter: true,
    params: {
      id: {
        type: 'string',
        required: true
      }
    },
    title: (params) => `Profile #${params.id} - AppShell Demo`,
    beforeEnter: requireAuth,
    transition: {
      type: 'slide',
      direction: 'left',
      duration: 400
    }
  },
  dashboard: {
    path: '/dashboard',
    component: DashboardPage,
    icon: <FaChartBar />,
    label: 'Dashboard',
    showInNav: true,
    showInHeader: true,
    showInFooter: true,
    title: 'Dashboard - AppShell Demo',
    beforeEnter: requireAuth,
    transition: {
      type: 'scale',
      duration: 350
    }
  },
  settings: {
    path: '/settings',
    component: SettingsPage,
    icon: <FaCog />,
    label: 'Settings',
    showInNav: true,
    showInHeader: false,
    showInFooter: true,
    title: 'Settings - AppShell Demo',
    beforeEnter: requireAuth,
    beforeLeave: confirmLeave
  },
  admin: {
    path: '/admin',
    component: AdminPage,
    icon: <FaShieldAlt />,
    label: 'Admin',
    showInNav: true,
    showInHeader: false,
    showInFooter: false,
    title: 'Admin - AppShell Demo',
    beforeEnter: [requireAuth, requireAdmin],
    meta: {
      requiresAuth: true,
      roles: ['admin']
    }
  },
  notFound: {
    path: '/**',
    component: NotFoundPage,
    label: '404',
    showInNav: false,
    fallback: true,
    title: '404 - Page Not Found'
  }
})

// Main Example Component
const EnhancedAppShellExample: React.FC = () => {
  return (
    <Box minHeight="100vh" backgroundColor="#f8fafc">
      <AppShellProvider 
        routes={routes} 
        initialRoute="home"
        routerOptions={{
          mode: 'history',
          syncWithUrl: true,
          scrollBehavior: 'auto',
          baseUrl: getBasePath(),
          defaultTransition: {
            type: 'fade',
            duration: 200
          }
        }}
      >
        <AppShell 
          routes={routes}
          config={{
            splash: {
              duration: 1000,
              logo: <FaRocket />,
              text: 'Loading Enhanced AppShell...'
            },
            header: {
              title: 'Enhanced AppShell',
              logo: <FaShieldAlt />,
              showQuickNav: true,
              actions: [
                <Button
                  key="search"
                  label=""
                  icon={<FaSearch />}
                  onClick={() => console.log('Search clicked')}
                  variant="normal"
                  size="small"
                  backgroundColor="transparent"
                  border="none"
                  color="#6b7280"
                  aria-label="Search"
                />
              ]
            },
            footer: {
              showOnMobile: true,
              maxItems: 4
            },
            theme: {
              primaryColor: '#3b82f6',
              backgroundColor: '#f8fafc',
              navBackgroundColor: '#ffffff'
            }
          }}
        />
      </AppShellProvider>
      
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
        displaySm="none"
      >
        <h4 style={{ fontWeight: '600', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
          🚀 Enhanced Features to Try:
        </h4>
        <ul style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, paddingLeft: '1rem' }}>
          <li>URL changes with navigation - try refresh!</li>
          <li>Browser back/forward buttons work</li>
          <li>Dynamic routes: /profile/123, /profile/456</li>
          <li>Query params: Add ?tab=settings to URL</li>
          <li>Protected routes require login</li>
          <li>Admin page needs admin role</li>
          <li>Settings page warns on leave</li>
          <li>404 fallback for unknown routes</li>
          <li>Smooth page transitions</li>
        </ul>
      </Box>
    </Box>
  )
}

export default EnhancedAppShellExample