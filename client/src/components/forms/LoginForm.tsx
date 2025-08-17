import { useState, FormEvent, useEffect } from 'react';
import { Box } from '../Box';
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
          <Box as={'h2'} margin={'0px'} fontSize={'24px'} fontWeight={'600'} marginBottom={'8px'}>
            Welcome Back
          </Box>
          <Box as={'p'} margin={'0px'} color={'#6c757d'} fontSize={'16px'}>
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
            <Box fontSize={'14px'} color={'#dc3545'}>
              {authError}
            </Box>
          </Box>
        )}

        <Box as={'form'} onSubmit={handleSubmit} display={'flex'} flexDirection={'column'} gap={'20px'}>
          <Box display="flex" flexDirection="column" gap={6}>
            <Box as={'label'} htmlFor="username" fontSize={'14px'} fontWeight={'500'}>
              Username
            </Box>
            <Box as={'input'}
              id="username"
              type="text"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleInputChange('username')}
              disabled={isLoading}
              autoComplete="username"
              style={{
                padding: '10px 14px',
                fontSize: '16px',
                border: `1px solid ${errors.username ? '#dc3545' : '#dee2e6'}`,
                borderRadius: '6px',
                outline: 'none',
                transition: 'border-color 0.2s',
                width: '100%',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = errors.username ? '#dc3545' : '#007bff';
                e.target.style.boxShadow = `0 0 0 3px ${errors.username ? 'rgba(220, 53, 69, 0.1)' : 'rgba(0, 123, 255, 0.1)'}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.username ? '#dc3545' : '#dee2e6';
                e.target.style.boxShadow = 'none';
              }}
            />
            {errors.username && (
              <Box fontSize={14} color="#dc3545">
                {errors.username}
              </Box>
            )}
          </Box>

          <Box display="flex" flexDirection="column" gap={6}>
            <Box as="label" htmlFor="password" fontSize={14} fontWeight={500}>
              Password
            </Box>
            <Box as="input"
              id="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange('password')}
              disabled={isLoading}
              autoComplete="current-password"
              style={{
                padding: '10px 14px',
                fontSize: '16px',
                border: `1px solid ${errors.password ? '#dc3545' : '#dee2e6'}`,
                borderRadius: '6px',
                outline: 'none',
                transition: 'border-color 0.2s',
                width: '100%',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = errors.password ? '#dc3545' : '#007bff';
                e.target.style.boxShadow = `0 0 0 3px ${errors.password ? 'rgba(220, 53, 69, 0.1)' : 'rgba(0, 123, 255, 0.1)'}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.password ? '#dc3545' : '#dee2e6';
                e.target.style.boxShadow = 'none';
              }}
            />
            {errors.password && (
              <Box fontSize={14} color="#dc3545">
                {errors.password}
              </Box>
            )}
          </Box>

          <Box display="flex" justifyContent="flex-end">
            <Box as="button"
              type="button"
              onClick={onSwitchToForgotPassword}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                fontSize: '14px',
                cursor: 'pointer',
                padding: '4px 8px',
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
              padding: '12px 24px',
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
          <Box as="p" fontSize={14} color="#6c757d" margin={0}>
            Don't have an account?{' '}
            <Box as="button"
              onClick={onSwitchToRegister}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                fontSize: '14px',
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