import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Box } from '@/components/Box'
import { LoginForm } from '@/components/forms/LoginForm'
import { useAppSelector } from '@/store'
import { selectIsAuthenticated } from '@/store/slices/authSlice'
import { useEffect } from 'react'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/dashboard' })
    }
  }, [isAuthenticated, navigate])

  return (
    <Box
      width="100%"
      minHeight="100vh"
      backgroundColor="#f8f9fa"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      padding={20}
    >
      <Box textAlign="center" marginBottom={32}>
        <Box as="h1" fontSize={42} fontWeight={700} margin={0} marginBottom={8}>
          Wezo
        </Box>
        <Box as="p" fontSize={18} color="#6c757d" margin={0}>
          Property Rental Platform
        </Box>
      </Box>

      <LoginForm
        onSwitchToRegister={() => navigate({ to: '/register' })}
        onSwitchToForgotPassword={() => {}}
      />

      <Box
        marginTop={32}
        textAlign="center"
        maxWidth={400}
        width="100%"
      >
        <Box as="p" fontSize={12} color="#6c757d" margin={0}>
          By using Wezo, you agree to our Terms of Service and Privacy Policy.
        </Box>
      </Box>
    </Box>
  )
}