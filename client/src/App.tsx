import { useEffect } from 'react';
import { Box } from '@/components/Box';
import { Auth } from '@/components/Auth';
import { Dashboard } from '@/components/Dashboard';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { applyGlobalStyles } from '@/utils/globalStyles';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

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
    );
  }

  return isAuthenticated && user ? <Dashboard /> : <Auth />;
};

function App() {
  // Apply global styles on mount
  useEffect(() => {
    applyGlobalStyles();
  }, []);

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;