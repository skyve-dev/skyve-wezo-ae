import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Box } from '@/components/base/Box'
import { RegisterForm } from '@/components/forms/RegisterForm'
import { RootState } from '@/store'
import { useAppShell } from '@/components/base/AppShell'

const RegisterPage: React.FC = () => {
  const { navigateTo } = useAppShell()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  // Redirect to properties if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigateTo('properties', {})
    }
  }, [isAuthenticated, navigateTo])

  const handleSwitchToLogin = () => {
    navigateTo('login', {})
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
            Join our property management platform
          </Box>
        </Box>

        {/* Reuse RegisterForm component */}
        <RegisterForm 
          onSwitchToLogin={handleSwitchToLogin}
        />

        {/* Terms */}
        <Box textAlign="center" fontSize="0.75rem" color="#999" marginTop="2rem">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </Box>
      </Box>
    </Box>
  )
}

export default RegisterPage