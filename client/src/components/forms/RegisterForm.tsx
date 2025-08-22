import { useState, FormEvent, useEffect } from 'react';
import { Box } from '../base/Box';
import { Input } from '../base/Input';
import { useAppDispatch, useAppSelector } from '@/store';
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
          <Box as="h2" margin={0} fontSize={24} fontWeight={600} marginBottom={8}>
            Create Account
          </Box>
          <Box as="p" margin={0} color="#6c757d" fontSize={16}>
            Join Wezo today
          </Box>
        </Box>

        {authError && (
          <Box
            padding={12}
            backgroundColor="#fef2f2"
            borderRadius={6}
            border="1px solid #fecaca"
          >
            <Box fontSize={16} color="#dc3545">
              {authError}
            </Box>
          </Box>
        )}

        <Box as="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={20}>
          <Input
            label="Username"
            id="username"
            type="text"
            placeholder="Choose a username"
            value={formData.username}
            onChange={handleInputChange('username')}
            disabled={isLoading}
            autoComplete="username"
            error={!!errors.username}
            helperText={errors.username}
            fullWidth
          />

          <Input
            label="Email Address"
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange('email')}
            disabled={isLoading}
            autoComplete="email"
            error={!!errors.email}
            helperText={errors.email}
            fullWidth
          />

          <Input
            label="Password"
            id="password"
            type="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleInputChange('password')}
            disabled={isLoading}
            autoComplete="new-password"
            error={!!errors.password}
            helperText={errors.password}
            fullWidth
          />

          <Input
            label="Confirm Password"
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            disabled={isLoading}
            autoComplete="new-password"
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            fullWidth
          />

          <Box as="button"
            type="submit"
            disabled={isLoading}
            style={{
              backgroundColor: isLoading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
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
                <Box
                  width={16}
                  height={16}
                  borderRadius="50%"
                  border="2px solid currentColor"
                  style={{
                    borderTopColor: 'transparent',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Box>
        </Box>

        <Box textAlign="center" paddingTop={20} borderTop="1px solid #e9ecef" >
          <Box as="p" fontSize={16} color="#6c757d" margin={0} >
            Already have an account?{' '}
            <Box as="button"
              onClick={onSwitchToLogin}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                fontSize: '1rem',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Sign in
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};