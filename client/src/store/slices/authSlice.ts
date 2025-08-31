import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { User, LoginRequest, RegisterRequest, PasswordResetRequest } from '@/types/auth'
import { apiClient } from '@/utils/api'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  // Role management
  currentRoleMode: 'Tenant' | 'HomeOwner' | 'Manager' | null  // Current UI mode
  availableRoles: ('Tenant' | 'HomeOwner' | 'Manager')[]  // Roles user can switch to
  rolePreference: string | null  // Persisted role preference
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  // Role management
  currentRoleMode: null,
  availableRoles: [],
  rolePreference: localStorage.getItem('user_role_preference'),
}

// Async thunks for API calls
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await apiClient.login(credentials)
      apiClient.setToken(response.token)
      localStorage.setItem('authToken', response.token)
      return response
    } catch (error: any) {
      // Pass the user-friendly message from the server
      return rejectWithValue(error.getUserMessage ? error.getUserMessage() : 'Unable to sign in. Please check your credentials and try again.')
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await apiClient.register(userData)
      apiClient.setToken(response.token)
      localStorage.setItem('authToken', response.token)
      return response
    } catch (error: any) {
      // Pass the user-friendly message from the server
      return rejectWithValue(error.getUserMessage ? error.getUserMessage() : 'Unable to create your account. Please try again.')
    }
  }
)

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      return rejectWithValue('No token found')
    }
    
    try {
      apiClient.setToken(token)
      const user = await apiClient.getProfile()
      return { user, token }
    } catch (error: any) {
      localStorage.removeItem('authToken')
      apiClient.setToken(null)
      // For token validation, a simple message is appropriate
      return rejectWithValue(error.getUserMessage ? error.getUserMessage() : 'Invalid token')
    }
  }
)

export const requestPasswordReset = createAsyncThunk(
  'auth/requestPasswordReset',
  async (data: PasswordResetRequest, { rejectWithValue }) => {
    try {
      await apiClient.requestPasswordReset(data)
      return { success: true }
    } catch (error: any) {
      // Pass the user-friendly message from the server
      return rejectWithValue(error.getUserMessage ? error.getUserMessage() : 'Unable to process password reset request. Please try again.')
    }
  }
)

// Role management async thunks
export const switchUserRole = createAsyncThunk(
  'auth/switchRole',
  async (role: 'Tenant' | 'HomeOwner' | 'Manager', { rejectWithValue }) => {
    try {
      const response = await apiClient.updateUserRole(role)
      apiClient.setToken(response.token)
      localStorage.setItem('authToken', response.token)
      localStorage.setItem('user_role_preference', role)
      return response
    } catch (error: any) {
      return rejectWithValue(error.getUserMessage ? error.getUserMessage() : 'Unable to switch role. Please try again.')
    }
  }
)

// Auto-promote Tenant to HomeOwner after first property creation
export const promoteToHomeOwner = createAsyncThunk(
  'auth/promoteToHomeOwner',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any
      const currentRole = state.auth.currentRoleMode
      
      // Only promote if current role is Tenant
      if (currentRole !== 'Tenant') {
        return null // No promotion needed
      }
      
      const response = await apiClient.updateUserRole('HomeOwner')
      apiClient.setToken(response.token)
      localStorage.setItem('authToken', response.token)
      localStorage.setItem('user_role_preference', 'HomeOwner')
      return response
    } catch (error: any) {
      return rejectWithValue(error.getUserMessage ? error.getUserMessage() : 'Unable to promote to HomeOwner role.')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      state.currentRoleMode = null
      state.availableRoles = []
      localStorage.removeItem('authToken')
      localStorage.removeItem('user_role_preference')
      apiClient.setToken(null)
    },
    clearError: (state) => {
      state.error = null
    },
    setCurrentRoleMode: (state, action) => {
      state.currentRoleMode = action.payload
      localStorage.setItem('user_role_preference', action.payload)
    },
    updateAvailableRoles: (state, action) => {
      state.availableRoles = action.payload
    },
    initializeRoleMode: (state) => {
      if (state.user) {
        // Determine available roles based on user
        const availableRoles: ('Tenant' | 'HomeOwner' | 'Manager')[] = ['Tenant']
        
        if (state.user.role === 'HomeOwner' || state.user.role === 'Manager') {
          availableRoles.push('HomeOwner')
        }
        
        if (state.user.role === 'Manager') {
          availableRoles.push('Manager')
        }
        
        state.availableRoles = availableRoles
        
        // Set current role mode based on preference or user role
        const preference = localStorage.getItem('user_role_preference') as 'Tenant' | 'HomeOwner' | 'Manager' | null
        if (preference && availableRoles.includes(preference)) {
          state.currentRoleMode = preference
        } else {
          // Default to highest available role
          if (state.user.role === 'Manager') {
            state.currentRoleMode = 'Manager'
          } else if (state.user.role === 'HomeOwner') {
            state.currentRoleMode = 'HomeOwner'
          } else {
            state.currentRoleMode = 'Tenant'
          }
          localStorage.setItem('user_role_preference', state.currentRoleMode)
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
        // Initialize role mode after successful login
        authSlice.caseReducers.initializeRoleMode(state)
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string || 'Unable to sign in. Please check your credentials and try again.'
        state.isAuthenticated = false
      })
    
    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
        // Initialize role mode after successful registration
        authSlice.caseReducers.initializeRoleMode(state)
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string || 'Unable to create your account. Please try again.'
        state.isAuthenticated = false
      })
    
    // Check Auth
    builder
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
        // Initialize role mode after successful auth check
        authSlice.caseReducers.initializeRoleMode(state)
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false
        state.user = null
        state.token = null
        state.isAuthenticated = false
      })
    
    // Password Reset
    builder
      .addCase(requestPasswordReset.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string || 'Unable to process password reset request. Please try again.'
      })
    
    // Role Switching
    builder
      .addCase(switchUserRole.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(switchUserRole.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.error = null
        // Reinitialize role mode after role switch to update available roles
        authSlice.caseReducers.initializeRoleMode(state)
      })
      .addCase(switchUserRole.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string || 'Unable to switch role. Please try again.'
      })
      
    // Auto-promotion to HomeOwner
    builder
      .addCase(promoteToHomeOwner.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(promoteToHomeOwner.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload) {
          state.user = action.payload.user
          state.token = action.payload.token
          state.error = null
          // Reinitialize role mode after promotion to update available roles
          authSlice.caseReducers.initializeRoleMode(state)
        }
      })
      .addCase(promoteToHomeOwner.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string || 'Unable to promote to HomeOwner role.'
      })
  },
})

export const { logout, clearError, setCurrentRoleMode, updateAvailableRoles, initializeRoleMode } = authSlice.actions

// Selectors - memoized for performance
export const selectUser = (state: { auth: AuthState }) => state.auth.user
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading
export const selectError = (state: { auth: AuthState }) => state.auth.error
export const selectToken = (state: { auth: AuthState }) => state.auth.token

// Role management selectors
export const selectCurrentRoleMode = (state: { auth: AuthState }) => state.auth.currentRoleMode
export const selectAvailableRoles = (state: { auth: AuthState }) => state.auth.availableRoles
export const selectRolePreference = (state: { auth: AuthState }) => state.auth.rolePreference

export default authSlice.reducer