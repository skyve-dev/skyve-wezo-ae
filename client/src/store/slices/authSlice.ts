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

// Client-side role switching (UI mode only, no API call)
export const switchUserRole = (role: 'Tenant' | 'HomeOwner' | 'Manager') => {
  return setCurrentRoleMode(role)
}

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
    // Auto-login action for booking flow
    autoLogin: (state, action) => {
      const { user, token } = action.payload
      state.user = user
      state.token = token
      state.isAuthenticated = true
      state.error = null
      state.currentRoleMode = user.role
      state.availableRoles = [user.role] // Guest users typically only have Tenant role
      apiClient.setToken(token)
    },
    initializeRoleMode: (state) => {
      if (state.user) {
        // Determine available roles based on user's highest capability (not current role)
        // This ensures availableRoles don't get lost when switching modes
        const availableRoles: ('Tenant' | 'HomeOwner' | 'Manager')[] = ['Tenant']
        
        // Use user's actual role capability to determine what they can switch to
        if (state.user.role === 'HomeOwner' || state.user.role === 'Manager') {
          availableRoles.push('HomeOwner')
        }
        
        if (state.user.role === 'Manager') {
          availableRoles.push('Manager')
        }
        
        // Only update availableRoles if not already set (preserve existing ones)
        if (state.availableRoles.length === 0) {
          state.availableRoles = availableRoles
        }
        
        // Set current role mode based on preference or user role
        const preference = localStorage.getItem('user_role_preference') as 'Tenant' | 'HomeOwner' | 'Manager' | null
        if (preference && state.availableRoles.includes(preference)) {
          state.currentRoleMode = preference
        } else if (!state.currentRoleMode) {
          // Only set default if no current role mode exists
          if (state.availableRoles.includes('Manager')) {
            state.currentRoleMode = 'Manager'
          } else if (state.availableRoles.includes('HomeOwner')) {
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
    
    // Role Switching is now handled by setCurrentRoleMode reducer (client-side only)
      
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
          // Update available roles after promotion (user can now switch between Tenant and HomeOwner)
          if (!state.availableRoles.includes('HomeOwner')) {
            state.availableRoles.push('HomeOwner')
          }
          // Switch to HomeOwner mode after promotion
          state.currentRoleMode = 'HomeOwner'
          localStorage.setItem('user_role_preference', 'HomeOwner')
        }
      })
      .addCase(promoteToHomeOwner.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string || 'Unable to promote to HomeOwner role.'
      })
  },
})

export const { logout, clearError, setCurrentRoleMode, updateAvailableRoles, initializeRoleMode, autoLogin } = authSlice.actions

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