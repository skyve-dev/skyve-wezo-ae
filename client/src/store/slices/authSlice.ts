import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { User, LoginRequest, RegisterRequest, PasswordResetRequest } from '@/types/auth'
import { apiClient } from '@/utils/api'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
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

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      localStorage.removeItem('authToken')
      apiClient.setToken(null)
    },
    clearError: (state) => {
      state.error = null
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
  },
})

export const { logout, clearError } = authSlice.actions

// Selectors - memoized for performance
export const selectUser = (state: { auth: AuthState }) => state.auth.user
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading
export const selectError = (state: { auth: AuthState }) => state.auth.error
export const selectToken = (state: { auth: AuthState }) => state.auth.token

export default authSlice.reducer