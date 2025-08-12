import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { AuthState, User, LoginRequest, RegisterRequest, PasswordResetRequest } from '@/types/auth';
import { apiClient, ApiError } from '@/utils/api';

interface AuthContextValue extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  requestPasswordReset: (data: PasswordResetRequest) => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: User };

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (credentials: LoginRequest) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await apiClient.login(credentials);
      apiClient.setToken(response.token);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: response.user, token: response.token },
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  };

  const register = async (userData: RegisterRequest) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await apiClient.register(userData);
      apiClient.setToken(response.token);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: response.user, token: response.token },
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  };

  const logout = () => {
    apiClient.setToken(null);
    dispatch({ type: 'LOGOUT' });
  };

  const requestPasswordReset = async (data: PasswordResetRequest) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await apiClient.requestPasswordReset(data);
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Password reset request failed';
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const checkAuthStatus = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        apiClient.setToken(token);
        const user = await apiClient.getProfile();
        dispatch({ type: 'SET_USER', payload: user });
      } catch (error) {
        // Token is invalid, remove it
        apiClient.setToken(null);
        dispatch({ type: 'LOGOUT' });
      }
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    requestPasswordReset,
    clearError,
    checkAuth: checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};