import React from 'react'
import { AppShell, createRoutes, useAppShell } from '@/components/base/AppShell'
import { Box } from '@/components/base/Box'
import { Button } from '@/components/base/Button'
import { LoginForm } from '@/components/forms/LoginForm'
import { RegisterForm } from '@/components/forms/RegisterForm'
import { useAppSelector } from '@/store'
import { selectIsAuthenticated, logout } from '@/store/slices/authSlice'
import { useAppDispatch } from '@/store'
import { FaHome, FaSignInAlt, FaUserPlus, FaSignOutAlt } from 'react-icons/fa'
import type { OnBeforeNavigateFunction, OnAfterNavigateFunction } from '@/components/base/AppShell/types'

// Landing Page Component
const LandingPage: React.FC = () => {
  const { navigateTo } = useAppShell<typeof routes>()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const dispatch = useAppDispatch()

  const handleLogout = () => {
    dispatch(logout())
  }

  const handleSwitchToRegister = async () => {
    await navigateTo('register', {})
  }

  const handleSwitchToForgotPassword = () => {
    // TODO: Implement forgot password functionality
    console.log('Forgot password clicked')
  }
  return (
    <Box padding="2rem" textAlign="center" maxWidth="800px" margin="0 auto">
      <Box marginBottom="3rem">
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', margin: '0 0 1rem 0', color: '#1a202c' }}>
          Welcome to Wezo.ae
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#4a5568', margin: '0 0 2rem 0', lineHeight: '1.6' }}>
          Your premier destination for villa rentals in the UAE. Discover luxury accommodations 
          and unforgettable experiences across the Emirates.
        </p>
      </Box>

      {!isAuthenticated ? (
        <LoginForm onSwitchToRegister={handleSwitchToRegister} onSwitchToForgotPassword={handleSwitchToForgotPassword} />
      ) : (
        <Box display="flex" flexDirection="column" alignItems="center" gap="2rem">
          <Box padding="2rem" backgroundColor="#f0fdf4" borderRadius="8px" border="2px solid #22c55e">
            <p style={{ fontSize: '1.125rem', color: '#15803d', margin: 0, fontWeight: '600' }}>
              🎉 Welcome back! You're successfully signed in.
            </p>
          </Box>
          <Button
            label="Sign Out"
            icon={<FaSignOutAlt />}
            onClick={handleLogout}
            variant="normal"
            size="medium"
          />
        </Box>
      )}

      <Box marginTop="4rem" display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap="2rem">
        <Box padding="2rem" backgroundColor="white" borderRadius="8px" boxShadow="0 2px 8px rgba(0,0,0,0.1)">
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 1rem 0', color: '#1a202c' }}>
            Luxury Villas
          </h3>
          <p style={{ color: '#4a5568', margin: 0, lineHeight: '1.5' }}>
            Browse our collection of premium villas across Dubai, Abu Dhabi, and beyond.
          </p>
        </Box>
        <Box padding="2rem" backgroundColor="white" borderRadius="8px" boxShadow="0 2px 8px rgba(0,0,0,0.1)">
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 1rem 0', color: '#1a202c' }}>
            Easy Booking
          </h3>
          <p style={{ color: '#4a5568', margin: 0, lineHeight: '1.5' }}>
            Simple and secure booking process with instant confirmation and 24/7 support.
          </p>
        </Box>
        <Box padding="2rem" backgroundColor="white" borderRadius="8px" boxShadow="0 2px 8px rgba(0,0,0,0.1)">
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 1rem 0', color: '#1a202c' }}>
            Best Prices
          </h3>
          <p style={{ color: '#4a5568', margin: 0, lineHeight: '1.5' }}>
            Competitive rates and exclusive deals on the finest properties in the UAE.
          </p>
        </Box>
      </Box>
    </Box>
  )
}

// Login Page Component
const LoginPage: React.FC = () => {
  const { navigateTo } = useAppShell()

  const handleSwitchToRegister = async () => {
    await navigateTo('register', {})
  }

  const handleSwitchToForgotPassword = () => {
    // TODO: Implement forgot password functionality
    console.log('Forgot password clicked')
  }

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      backgroundColor="#f8fafc"
      padding="1rem"
    >
      <Box maxWidth="500px" width="100%">
        <LoginForm
          onSwitchToRegister={handleSwitchToRegister}
          onSwitchToForgotPassword={handleSwitchToForgotPassword}
        />
      </Box>
    </Box>
  )
}

// Register Page Component
const RegisterPage: React.FC = () => {
  const { navigateTo } = useAppShell()

  const handleSwitchToLogin = async () => {
    await navigateTo('login', {})
  }

  return (
    <Box 
      minHeight="100vh" 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
      backgroundColor="#f8fafc"
      padding="1rem"
    >
      <Box maxWidth="500px" width="100%">
        <RegisterForm onSwitchToLogin={handleSwitchToLogin} />
      </Box>
    </Box>
  )
}

// Create routes configuration
const routes = createRoutes({
  home: {
    component: LandingPage,
    icon: <FaHome />,
    label: 'Home',
    showInNav: true,
    showInHeader: true,
    showInFooter: true
  },
  login: {
    component: LoginPage,
    icon: <FaSignInAlt />,
    label: 'Sign In',
    showInNav: false,
    showInHeader: false,
    showInFooter: false
  },
  register: {
    component: RegisterPage,
    icon: <FaUserPlus />,
    label: 'Register',
    showInNav: false,
    showInHeader: false,
    showInFooter: false
  }
})

// Main AppContent Component
const AppContent: React.FC = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  // Authentication middleware for navigation control
  const handleBeforeNavigate: OnBeforeNavigateFunction<typeof routes> = async (next, target, source) => {
    console.log('Navigation:', { from: source.path, to: target.path, authenticated: isAuthenticated })

    // Prevent authenticated users from accessing login/register pages
    if (isAuthenticated && (target.path === '/login' || target.path === '/register')) {
      console.log('Redirecting authenticated user to home')
      next('home', {}) // Redirect to home instead
      return
    }

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
      initialRoute="home"
      onBeforeNavigate={handleBeforeNavigate}
      onAfterNavigate={handleAfterNavigate}
      config={{
        splash: {
          duration: 1500,
          logo: <FaHome />,
          text: 'Loading Wezo.ae...'
        },
        header: {
          title: 'Wezo.ae',
          logo: <FaHome />,
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

export default AppContent