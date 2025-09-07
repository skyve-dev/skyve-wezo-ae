import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Box } from '@/components/base/Box'
import { LoginForm } from '@/components/forms/LoginForm'
import { RootState } from '@/store'
import { useAppShell } from '@/components/base/AppShell'

const LoginPage: React.FC = () => {
  const { navigateTo } = useAppShell()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  // Redirect to properties if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigateTo('properties', {})
    }
  }, [isAuthenticated, navigateTo])

  const handleSwitchToRegister = () => {
    navigateTo('register', {})
  }

  const handleSwitchToForgotPassword = () => {
    // TODO: Implement forgot password page
    console.log('Forgot password feature coming soon')
  }

  return (
    <Box 
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
      minHeight="calc(100vh - 8rem)"
      padding="2rem"
      backgroundColor="#f8f9fa"
    >
      <Box
        width="100%"
        maxWidth="420px"
      >
        {/* Logo/Brand */}
        <Box textAlign="center" marginBottom="2rem">
          <Box fontSize="2rem" fontWeight="bold" color="#D52122">
            Wezo.ae
          </Box>
          <Box fontSize="0.9rem" color="#666" marginTop="0.5rem">
            Welcome back to your property management platform
          </Box>
        </Box>

        {/* Reuse LoginForm component */}
        <LoginForm 
          onSwitchToRegister={handleSwitchToRegister}
          onSwitchToForgotPassword={handleSwitchToForgotPassword}
        />
      </Box>
    </Box>
  )
}

export default LoginPage