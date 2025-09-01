import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ApiError } from '../../utils/api'

export interface ErrorInfo {
  message: string
  serverMessage?: string
  status?: number
  context?: string
  endpoint?: string
  timestamp: number
}

export interface ErrorState {
  // Current error being displayed
  currentError: ErrorInfo | null
  
  // Error history for debugging
  errorHistory: ErrorInfo[]
  
  // Loading states for different operations
  loadingStates: Record<string, boolean>
  
  // Context-specific errors (e.g., form validation errors)
  contextErrors: Record<string, string>
}

const initialState: ErrorState = {
  currentError: null,
  errorHistory: [],
  loadingStates: {},
  contextErrors: {}
}

const errorSlice = createSlice({
  name: 'error',
  initialState,
  reducers: {
    /**
     * Set an error from serializable error data
     */
    setApiError: (state, action: PayloadAction<{ error: { message: string; serverMessage?: string; status?: number; endpoint?: string } | ApiError; context?: string }>) => {
      const { error, context } = action.payload
      
      // Handle both serialized error data and ApiError objects
      const errorInfo: ErrorInfo = {
        message: typeof error === 'object' && 'getUserMessage' in error ? error.message : error.message,
        serverMessage: typeof error === 'object' && 'getUserMessage' in error ? error.getUserMessage() : error.serverMessage,
        status: typeof error === 'object' && 'status' in error ? error.status : error.status,
        context,
        endpoint: typeof error === 'object' && 'endpoint' in error ? error.endpoint : error.endpoint,
        timestamp: Date.now()
      }
      
      state.currentError = errorInfo
      state.errorHistory.push(errorInfo)
      
      // Keep only last 10 errors in history
      if (state.errorHistory.length > 10) {
        state.errorHistory = state.errorHistory.slice(-10)
      }
    },
    
    /**
     * Set a generic error message
     */
    setError: (state, action: PayloadAction<{ message: string; context?: string }>) => {
      const { message, context } = action.payload
      
      const errorInfo: ErrorInfo = {
        message,
        context,
        timestamp: Date.now()
      }
      
      state.currentError = errorInfo
      state.errorHistory.push(errorInfo)
      
      if (state.errorHistory.length > 10) {
        state.errorHistory = state.errorHistory.slice(-10)
      }
    },
    
    /**
     * Clear the current error
     */
    clearCurrentError: (state) => {
      state.currentError = null
    },
    
    /**
     * Clear all errors
     */
    clearAllErrors: (state) => {
      state.currentError = null
      state.errorHistory = []
      state.contextErrors = {}
    },
    
    /**
     * Set loading state for a specific operation
     */
    setLoading: (state, action: PayloadAction<{ key: string; isLoading: boolean }>) => {
      const { key, isLoading } = action.payload
      
      if (isLoading) {
        state.loadingStates[key] = true
      } else {
        delete state.loadingStates[key]
      }
    },
    
    /**
     * Set context-specific error (e.g., form field validation)
     */
    setContextError: (state, action: PayloadAction<{ context: string; message: string }>) => {
      const { context, message } = action.payload
      state.contextErrors[context] = message
    },
    
    /**
     * Clear context-specific error
     */
    clearContextError: (state, action: PayloadAction<string>) => {
      const context = action.payload
      delete state.contextErrors[context]
    },
    
    /**
     * Clear all context errors
     */
    clearAllContextErrors: (state) => {
      state.contextErrors = {}
    }
  }
})

export const {
  setApiError,
  setError,
  clearCurrentError,
  clearAllErrors,
  setLoading,
  setContextError,
  clearContextError,
  clearAllContextErrors
} = errorSlice.actions

export default errorSlice.reducer

// Selectors
export const selectCurrentError = (state: { error: ErrorState }) => state.error.currentError
export const selectErrorHistory = (state: { error: ErrorState }) => state.error.errorHistory
export const selectIsLoading = (key: string) => (state: { error: ErrorState }) => 
  state.error.loadingStates[key] || false
export const selectContextError = (context: string) => (state: { error: ErrorState }) => 
  state.error.contextErrors[context]
export const selectHasAnyLoading = (state: { error: ErrorState }) => 
  Object.keys(state.error.loadingStates).length > 0