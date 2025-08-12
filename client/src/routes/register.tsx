import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Box } from '@/components/Box'
import { RegisterForm } from '@/components/forms/RegisterForm'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

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
        <h1 style={{ fontSize: '42px', fontWeight: 700, margin: 0, marginBottom: '8px' }}>
          Wezo
        </h1>
        <p style={{ fontSize: '18px', color: '#6c757d', margin: 0 }}>
          Property Rental Platform
        </p>
      </Box>

      <RegisterForm
        onSwitchToLogin={() => navigate({ to: '/login' })}
      />

      <Box
        marginTop={32}
        textAlign="center"
        maxWidth={400}
        width="100%"
      >
        <p style={{ fontSize: '12px', color: '#6c757d', margin: 0 }}>
          By using Wezo, you agree to our Terms of Service and Privacy Policy.
        </p>
      </Box>
    </Box>
  )
}