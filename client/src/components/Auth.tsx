import { useState } from 'react';
import { Box } from './Box';
import { LoginForm } from './forms/LoginForm';
import { RegisterForm } from './forms/RegisterForm';

type AuthView = 'login' | 'register' | 'forgot-password';

export const Auth: React.FC = () => {
  const [currentView, setCurrentView] = useState<AuthView>('login');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return (
          <LoginForm
            onSwitchToRegister={() => setCurrentView('register')}
            onSwitchToForgotPassword={() => setCurrentView('forgot-password')}
          />
        );
      case 'register':
        return (
          <RegisterForm
            onSwitchToLogin={() => setCurrentView('login')}
          />
        );
      case 'forgot-password':
        return (
          <Box textAlign="center" padding={32}>
            <h2>Password Reset (Coming Soon)</h2>
            <button
              onClick={() => setCurrentView('login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                fontSize: '16px',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Back to Login
            </button>
          </Box>
        );
      default:
        return null;
    }
  };

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

      {renderCurrentView()}

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
  );
};