export interface User {
  id: number;
  username: string;
  email: string;
  role: 'Tenant' | 'HomeOwner' | 'Manager';  // Fixed: Match server enum exactly
  isAdmin: boolean;
  firstName?: string;  // Added for user display
  lastName?: string;   // Added for user display
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}