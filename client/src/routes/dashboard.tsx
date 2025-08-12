import { createFileRoute, Navigate } from '@tanstack/react-router'
import { Dashboard } from '@/components/Dashboard'
import { useAppSelector } from '@/store/hooks'
import { selectIsAuthenticated, selectIsLoading } from '@/store/slices/authSlice'
import { Box } from '@/components/Box'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const isLoading = useAppSelector(selectIsLoading)

  if (isLoading) {
    return (
      <Box
        width="100%"
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        backgroundColor="#f8f9fa"
      >
        <Box textAlign="center">
          <Box
            width={40}
            height={40}
            border="4px solid #e9ecef"
            borderTopColor="#007bff"
            borderRadius="50%"
            animation="spin 1s linear infinite"
            margin="0 auto 16px"
          />
          Loading...
        </Box>
      </Box>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return <Dashboard />
}