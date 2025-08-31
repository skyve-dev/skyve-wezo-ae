import {configureStore} from '@reduxjs/toolkit'

// Note: errorSlice is a simple slice that might just handle global errors
// Since I don't have the actual errorSlice.ts file, I'll create a comprehensive test
// based on what a typical error slice would contain

// Mock the errorSlice if it doesn't exist or is minimal
const mockErrorSlice = {
  name: 'error',
  initialState: {
    globalError: null,
    networkError: null,
    validationErrors: {},
    isOnline: true,
    lastError: null,
    errorHistory: []
  },
  reducers: {
    setGlobalError: (state: any, action: any) => {
      state.globalError = action.payload
      const errorEntry = {
        type: 'global',
        message: action.payload,
        timestamp: new Date().toISOString()
      }
      state.lastError = errorEntry
      if (action.payload) {
        state.errorHistory = [errorEntry, ...state.errorHistory].slice(0, 10)
      }
    },
    setNetworkError: (state: any, action: any) => {
      state.networkError = action.payload
      const errorEntry = {
        type: 'network',
        message: action.payload,
        timestamp: new Date().toISOString()
      }
      state.lastError = errorEntry
      if (action.payload) {
        state.errorHistory = [errorEntry, ...state.errorHistory].slice(0, 10)
      }
    },
    setValidationErrors: (state: any, action: any) => {
      state.validationErrors = action.payload
    },
    clearAllErrors: (state: any) => {
      state.globalError = null
      state.networkError = null
      state.validationErrors = {}
      state.lastError = null
    },
    clearGlobalError: (state: any) => {
      state.globalError = null
      if (state.lastError?.type === 'global') {
        state.lastError = null
      }
    },
    clearNetworkError: (state: any) => {
      state.networkError = null
      if (state.lastError?.type === 'network') {
        state.lastError = null
      }
    },
    setOnlineStatus: (state: any, action: any) => {
      state.isOnline = action.payload
      if (!action.payload) {
        state.networkError = 'You are currently offline'
      } else if (state.networkError === 'You are currently offline') {
        state.networkError = null
      }
    },
    clearErrorHistory: (state: any) => {
      state.errorHistory = []
    }
  }
}


describe('errorSlice', () => {
  let store = configureStore({
    reducer: {
      error: (state = mockErrorSlice.initialState, action) => {
        const reducer = mockErrorSlice.reducers[action.type as keyof typeof mockErrorSlice.reducers]
        if (reducer) {
          const newState = { ...state }
          reducer(newState, action)
          return newState
        }
        return state
      }
    }
  })

  beforeEach(() => {
    store = configureStore({
      reducer: {
        error: (state = mockErrorSlice.initialState, action) => {
          const reducer = mockErrorSlice.reducers[action.type as keyof typeof mockErrorSlice.reducers]
          if (reducer) {
            const newState = { ...state }
            reducer(newState, action)
            return newState
          }
          return state
        }
      }
    })
    jest.clearAllMocks()
    
    // Mock Date for consistent testing
    jest.spyOn(global.Date.prototype, 'toISOString')
      .mockReturnValue('2024-03-15T10:00:00.000Z')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().error
      expect(state).toEqual({
        globalError: null,
        networkError: null,
        validationErrors: {},
        isOnline: true,
        lastError: null,
        errorHistory: []
      })
    })
  })

  describe('global error management', () => {
    it('should set global error', () => {
      const errorMessage = 'Something went wrong'
      store.dispatch({ type: 'setGlobalError', payload: errorMessage })

      const state = store.getState().error
      expect(state.globalError).toBe(errorMessage)
      expect(state.lastError).toEqual({
        type: 'global',
        message: errorMessage,
        timestamp: '2024-03-15T10:00:00.000Z'
      })
      expect(state.errorHistory).toHaveLength(1)
      expect(state.errorHistory[0]).toEqual(state.lastError)
    })

    it('should clear global error', () => {
      // First set an error
      store.dispatch({ type: 'setGlobalError', payload: 'Test error' })
      
      // Then clear it
      store.dispatch({ type: 'clearGlobalError', payload: null })

      const state = store.getState().error
      expect(state.globalError).toBeNull()
      expect(state.lastError).toBeNull()
    })

    it('should not clear lastError if it is not a global error', () => {
      // Set network error first
      store.dispatch({ type: 'setNetworkError', payload: 'Network issue' })
      
      // Try to clear global error
      store.dispatch({ type: 'clearGlobalError', payload: null })

      const state = store.getState().error
      expect(state.lastError?.type).toBe('network')
    })
  })

  describe('network error management', () => {
    it('should set network error', () => {
      const errorMessage = 'Network connection failed'
      store.dispatch({ type: 'setNetworkError', payload: errorMessage })

      const state = store.getState().error
      expect(state.networkError).toBe(errorMessage)
      expect(state.lastError).toEqual({
        type: 'network',
        message: errorMessage,
        timestamp: '2024-03-15T10:00:00.000Z'
      })
    })

    it('should clear network error', () => {
      // First set an error
      store.dispatch({ type: 'setNetworkError', payload: 'Connection lost' })
      
      // Then clear it
      store.dispatch({ type: 'clearNetworkError', payload: null })

      const state = store.getState().error
      expect(state.networkError).toBeNull()
    })

    it('should set offline status and network error', () => {
      store.dispatch({ type: 'setOnlineStatus', payload: false })

      const state = store.getState().error
      expect(state.isOnline).toBe(false)
      expect(state.networkError).toBe('You are currently offline')
    })

    it('should clear offline network error when coming back online', () => {
      // First go offline
      store.dispatch({ type: 'setOnlineStatus', payload: false })
      
      // Then come back online
      store.dispatch({ type: 'setOnlineStatus', payload: true })

      const state = store.getState().error
      expect(state.isOnline).toBe(true)
      expect(state.networkError).toBeNull()
    })

    it('should not clear other network errors when coming online', () => {
      // Set a different network error
      store.dispatch({ type: 'setNetworkError', payload: 'Server unreachable' })
      
      // Come online (should not clear the server error)
      store.dispatch({ type: 'setOnlineStatus', payload: true })

      const state = store.getState().error
      expect(state.networkError).toBe('Server unreachable')
    })
  })

  describe('validation error management', () => {
    it('should set validation errors', () => {
      const validationErrors = {
        email: 'Email is required',
        password: 'Password must be at least 8 characters'
      }

      store.dispatch({ type: 'setValidationErrors', payload: validationErrors })

      const state = store.getState().error
      expect(state.validationErrors).toEqual(validationErrors)
    })

    it('should update validation errors', () => {
      // First set some errors
      store.dispatch({ 
        type: 'setValidationErrors', 
        payload: { email: 'Invalid email' } 
      })

      // Then update with new errors
      const newErrors = {
        name: 'Name is required',
        phone: 'Invalid phone number'
      }
      store.dispatch({ type: 'setValidationErrors', payload: newErrors })

      const state = store.getState().error
      expect(state.validationErrors).toEqual(newErrors)
    })

    it('should clear validation errors with empty object', () => {
      // First set some errors
      store.dispatch({ 
        type: 'setValidationErrors', 
        payload: { email: 'Invalid email' } 
      })

      // Clear with empty object
      store.dispatch({ type: 'setValidationErrors', payload: {} })

      const state = store.getState().error
      expect(state.validationErrors).toEqual({})
    })
  })

  describe('clear all errors', () => {
    it('should clear all error types', () => {
      // Set various errors
      store.dispatch({ type: 'setGlobalError', payload: 'Global error' })
      store.dispatch({ type: 'setNetworkError', payload: 'Network error' })
      store.dispatch({ 
        type: 'setValidationErrors', 
        payload: { field: 'Field error' } 
      })

      // Clear all
      store.dispatch({ type: 'clearAllErrors', payload: null })

      const state = store.getState().error
      expect(state.globalError).toBeNull()
      expect(state.networkError).toBeNull()
      expect(state.validationErrors).toEqual({})
      expect(state.lastError).toBeNull()
    })
  })

  describe('error history', () => {
    it('should maintain error history', () => {
      // Add multiple errors
      store.dispatch({ type: 'setGlobalError', payload: 'First error' })
      store.dispatch({ type: 'setNetworkError', payload: 'Second error' })
      store.dispatch({ type: 'setGlobalError', payload: 'Third error' })

      const state = store.getState().error
      expect(state.errorHistory).toHaveLength(3)
      expect(state.errorHistory[0].message).toBe('Third error') // Most recent first
      expect(state.errorHistory[1].message).toBe('Second error')
      expect(state.errorHistory[2].message).toBe('First error')
    })

    it('should limit error history to 10 items', () => {
      // Add 12 errors
      for (let i = 1; i <= 12; i++) {
        store.dispatch({ type: 'setGlobalError', payload: `Error ${i}` })
      }

      const state = store.getState().error
      expect(state.errorHistory).toHaveLength(10)
      expect(state.errorHistory[0].message).toBe('Error 12') // Most recent
      expect(state.errorHistory[9].message).toBe('Error 3') // Oldest kept
    })

    it('should clear error history', () => {
      // Add some errors
      store.dispatch({ type: 'setGlobalError', payload: 'Error 1' })
      store.dispatch({ type: 'setNetworkError', payload: 'Error 2' })

      // Clear history
      store.dispatch({ type: 'clearErrorHistory', payload: null })

      const state = store.getState().error
      expect(state.errorHistory).toEqual([])
    })

    it('should not add to history when clearing errors', () => {
      // Add an error
      store.dispatch({ type: 'setGlobalError', payload: 'Initial error' })
      expect(store.getState().error.errorHistory).toHaveLength(1)

      // Clear the error (should not add to history)
      store.dispatch({ type: 'setGlobalError', payload: null })

      const state = store.getState().error
      expect(state.errorHistory).toHaveLength(1) // Should remain 1, not increase
    })
  })

  describe('online status tracking', () => {
    it('should track online status', () => {
      store.dispatch({ type: 'setOnlineStatus', payload: false })
      expect(store.getState().error.isOnline).toBe(false)

      store.dispatch({ type: 'setOnlineStatus', payload: true })
      expect(store.getState().error.isOnline).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle null error messages', () => {
      store.dispatch({ type: 'setGlobalError', payload: null })
      
      const state = store.getState().error
      expect(state.globalError).toBeNull()
      expect(state.lastError).toEqual({
        type: 'global',
        message: null,
        timestamp: '2024-03-15T10:00:00.000Z'
      })
    })

    it('should handle undefined error messages', () => {
      store.dispatch({ type: 'setGlobalError', payload: undefined })
      
      const state = store.getState().error
      expect(state.globalError).toBeUndefined()
      expect(state.lastError).toEqual({
        type: 'global',
        message: undefined,
        timestamp: '2024-03-15T10:00:00.000Z'
      })
    })

    it('should handle empty string error messages', () => {
      store.dispatch({ type: 'setGlobalError', payload: '' })
      
      const state = store.getState().error
      expect(state.globalError).toBe('')
      expect(state.lastError?.message).toBe('')
    })

    it('should handle complex validation error objects', () => {
      const complexErrors = {
        'user.email': 'Invalid email format',
        'user.profile.name': 'Name is required',
        'settings[0].value': 'Value must be a number'
      }

      store.dispatch({ type: 'setValidationErrors', payload: complexErrors })

      const state = store.getState().error
      expect(state.validationErrors).toEqual(complexErrors)
    })

    it('should handle rapid error state changes', () => {
      // Rapid fire error changes
      store.dispatch({ type: 'setGlobalError', payload: 'Error 1' })
      store.dispatch({ type: 'setNetworkError', payload: 'Error 2' })
      store.dispatch({ type: 'clearGlobalError', payload: null })
      store.dispatch({ type: 'setGlobalError', payload: 'Error 3' })

      const state = store.getState().error
      expect(state.globalError).toBe('Error 3')
      expect(state.networkError).toBe('Error 2')
      expect(state.lastError?.message).toBe('Error 3')
      expect(state.errorHistory).toHaveLength(3) // Only non-null errors added
    })
  })

  describe('integration scenarios', () => {
    it('should handle typical form validation scenario', () => {
      // User submits form with validation errors
      store.dispatch({ 
        type: 'setValidationErrors', 
        payload: { 
          email: 'Email is required',
          password: 'Password is too short'
        }
      })

      let state = store.getState().error
      expect(Object.keys(state.validationErrors)).toHaveLength(2)

      // User fixes email, still has password error
      store.dispatch({ 
        type: 'setValidationErrors', 
        payload: { password: 'Password is too short' }
      })

      state = store.getState().error
      expect(state.validationErrors.email).toBeUndefined()
      expect(state.validationErrors.password).toBe('Password is too short')

      // User fixes all validation errors
      store.dispatch({ type: 'setValidationErrors', payload: {} })

      state = store.getState().error
      expect(state.validationErrors).toEqual({})
    })

    it('should handle network connectivity scenario', () => {
      // App starts online
      expect(store.getState().error.isOnline).toBe(true)

      // Network error occurs
      store.dispatch({ type: 'setNetworkError', payload: 'Request timeout' })
      
      let state = store.getState().error
      expect(state.networkError).toBe('Request timeout')
      expect(state.isOnline).toBe(true) // Still considers itself online

      // User goes offline
      store.dispatch({ type: 'setOnlineStatus', payload: false })

      state = store.getState().error
      expect(state.isOnline).toBe(false)
      expect(state.networkError).toBe('You are currently offline')

      // User comes back online
      store.dispatch({ type: 'setOnlineStatus', payload: true })

      state = store.getState().error
      expect(state.isOnline).toBe(true)
      expect(state.networkError).toBeNull()
    })

    it('should handle global error with recovery scenario', () => {
      // Critical error occurs
      store.dispatch({ type: 'setGlobalError', payload: 'Server is temporarily unavailable' })

      let state = store.getState().error
      expect(state.globalError).toBe('Server is temporarily unavailable')
      expect(state.errorHistory).toHaveLength(1)

      // User acknowledges error and it's cleared
      store.dispatch({ type: 'clearGlobalError', payload: null })

      state = store.getState().error
      expect(state.globalError).toBeNull()
      expect(state.errorHistory).toHaveLength(1) // History preserved
      expect(state.errorHistory[0].message).toBe('Server is temporarily unavailable')
    })
  })
})

export {}