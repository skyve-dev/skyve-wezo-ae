import { useState, FormEvent, useEffect } from 'react';
import { Box } from '../Box';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { register, clearError, selectIsLoading, selectError } from '@/store/slices/authSlice';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);
  const authError = useAppSelector(selectError);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    
    if (!validateForm()) return;

    dispatch(register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
    }));
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

  const inputStyle = (hasError: boolean) => ({
    padding: '12px 16px',
    fontSize: '16px',
    border: `1px solid ${hasError ? '#dc3545' : '#dee2e6'}`,
    borderRadius: '6px',
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%',
    boxSizing: 'border-box' as const,
  });

  const inputFocusHandler = (hasError: boolean) => ({
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.style.borderColor = hasError ? '#dc3545' : '#007bff';
      e.target.style.boxShadow = `0 0 0 3px ${hasError ? 'rgba(220, 53, 69, 0.1)' : 'rgba(0, 123, 255, 0.1)'}`;
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.style.borderColor = hasError ? '#dc3545' : '#dee2e6';
      e.target.style.boxShadow = 'none';
    },
  });

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
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>
            Create Account
          </h2>
          <p style={{ margin: 0, color: '#6c757d', fontSize: '16px' }}>
            Join Wezo today
          </p>
        </Box>

        {authError && (
          <Box
            padding={12}
            backgroundColor="#fef2f2"
            borderRadius={6}
            border="1px solid #fecaca"
          >
            <div style={{ fontSize: '14px', color: '#dc3545' }}>
              {authError}
            </div>
          </Box>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Box display="flex" flexDirection="column" gap={6}>
            <label htmlFor="username" style={{ fontSize: '14px', fontWeight: 500 }}>
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleInputChange('username')}
              disabled={isLoading}
              autoComplete="username"
              style={inputStyle(!!errors.username)}
              {...inputFocusHandler(!!errors.username)}
            />
            {errors.username && (
              <div style={{ fontSize: '14px', color: '#dc3545' }}>
                {errors.username}
              </div>
            )}
          </Box>

          <Box display="flex" flexDirection="column" gap={6}>
            <label htmlFor="email" style={{ fontSize: '14px', fontWeight: 500 }}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange('email')}
              disabled={isLoading}
              autoComplete="email"
              style={inputStyle(!!errors.email)}
              {...inputFocusHandler(!!errors.email)}
            />
            {errors.email && (
              <div style={{ fontSize: '14px', color: '#dc3545' }}>
                {errors.email}
              </div>
            )}
          </Box>

          <Box display="flex" flexDirection="column" gap={6}>
            <label htmlFor="password" style={{ fontSize: '14px', fontWeight: 500 }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleInputChange('password')}
              disabled={isLoading}
              autoComplete="new-password"
              style={inputStyle(!!errors.password)}
              {...inputFocusHandler(!!errors.password)}
            />
            {errors.password && (
              <div style={{ fontSize: '14px', color: '#dc3545' }}>
                {errors.password}
              </div>
            )}
          </Box>

          <Box display="flex" flexDirection="column" gap={6}>
            <label htmlFor="confirmPassword" style={{ fontSize: '14px', fontWeight: 500 }}>
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              disabled={isLoading}
              autoComplete="new-password"
              style={inputStyle(!!errors.confirmPassword)}
              {...inputFocusHandler(!!errors.confirmPassword)}
            />
            {errors.confirmPassword && (
              <div style={{ fontSize: '14px', color: '#dc3545' }}>
                {errors.confirmPassword}
              </div>
            )}
          </Box>

          <button
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
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#0056b3';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#007bff';
              }
            }}
          >
            {isLoading ? (
              <>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: '2px solid currentColor',
                    borderTopColor: 'transparent',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <Box textAlign="center" paddingTop={20} borderTop="1px solid #e9ecef">
          <p style={{ fontSize: '14px', color: '#6c757d', margin: 0 }}>
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                fontSize: '14px',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Sign in
            </button>
          </p>
        </Box>
      </Box>
    </Box>
  );
};