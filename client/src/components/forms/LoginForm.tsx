import { useState, FormEvent, useEffect } from 'react';
import { Box } from '../base/Box';
import { Input } from '../base/Input';
import { useAppDispatch, useAppSelector } from '@/store';
import { login, clearError, selectIsLoading, selectError } from '@/store/slices/authSlice';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToRegister,
  onSwitchToForgotPassword,
}) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);
  const authError = useAppSelector(selectError);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    
    if (!validateForm()) return;

    dispatch(login(formData));
  };

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Box
      backgroundColor="white"
      borderRadius={8}
      padding={32}
      boxShadow="0 2px 12px rgba(0,0,0,0.1)"
      maxWidth={400}
      width="100%"
      margin="0 auto"
    >
      <Box display="flex" flexDirection="column" gap={24}>
        <Box textAlign="center">
          <Box as={'h2'} margin={'0px'} fontSize={'1.5rem'} fontWeight={'600'} marginBottom={'8px'}>
            Welcome Back
          </Box>
          <Box as={'p'} margin={'0px'} color={'#6c757d'} fontSize={'1rem'}>
            Sign in to your account
          </Box>
        </Box>

        {authError && (
          <Box
            padding={12}
            backgroundColor="#fef2f2"
            borderRadius={6}
            border="1px solid #fecaca"
          >
            <Box fontSize={'1rem'} color={'#dc3545'}>
              {authError}
            </Box>
          </Box>
        )}

        <Box as={'form'} onSubmit={handleSubmit} display={'flex'} flexDirection={'column'} gap={'20px'}>
          <Input
            label="Username"
            id="username"
            type="text"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleInputChange('username')}
            disabled={isLoading}
            autoComplete="username"
            error={!!errors.username}
            helperText={errors.username}
            fullWidth
          />

          <Input
            label="Password"
            id="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange('password')}
            disabled={isLoading}
            autoComplete="current-password"
            error={!!errors.password}
            helperText={errors.password}
            fullWidth
          />

          <Box display="flex" justifyContent="flex-end">
            <Box as="button"
              type="button"
              onClick={onSwitchToForgotPassword}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                fontSize: '1rem',
                cursor: 'pointer',
                padding: '0.25rem 0.5rem',
                textDecoration: 'underline',
              }}
            >
              Forgot password?
            </Box>
          </Box>

          <Box as="button"
            type="submit"
            disabled={isLoading}
            style={{
              backgroundColor: isLoading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '0.75rem 1.5rem',
              fontSize: '16px',
              fontWeight: 500,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Box>
        </Box>

        <Box textAlign="center" paddingTop={20} borderTop="1px solid #e9ecef">
          <Box as="p" fontSize={'1rem'} color="#6c757d" margin={0}>
            Don't have an account?{' '}
            <Box as="button"
              onClick={onSwitchToRegister}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                fontSize: '1rem',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Create one
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};