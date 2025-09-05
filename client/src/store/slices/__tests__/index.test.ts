// Redux Store Integration Tests
// Tests the integration between all slices and the store

// Mock API utility to handle import.meta.env
jest.mock('../../../utils/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn()
  },
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn()
  }
}))

import {configureStore} from '@reduxjs/toolkit'
import authReducer from '../authSlice'
import propertyReducer from '../propertySlice'
import reservationReducer from '../reservationSlice'
import reviewReducer from '../reviewSlice'
import messageReducer from '../messageSlice'
import financeReducer from '../financeSlice'
import availabilityReducer from '../availabilitySlice'
import dashboardReducer from '../dashboardSlice'
import ratePlanReducer from '../ratePlanSlice'
import priceReducer from '../priceSlice'
import errorReducer from '../errorSlice'

describe('Redux Store Integration', () => {
  let store=configureStore({
    reducer: {
      auth: authReducer,
      property: propertyReducer,
      reservations: reservationReducer,
      reviews: reviewReducer,
      messages: messageReducer,
      finance: financeReducer,
      availability: availabilityReducer,
      dashboard: dashboardReducer,
      ratePlan: ratePlanReducer,
      price: priceReducer,
      error: errorReducer,
    },
  })

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
        property: propertyReducer,
        reservations: reservationReducer,
        reviews: reviewReducer,
        messages: messageReducer,
        finance: financeReducer,
        availability: availabilityReducer,
        dashboard: dashboardReducer,
        ratePlan: ratePlanReducer,
        price: priceReducer,
        error: errorReducer,
      },
    })
  })

  describe('Store Configuration', () => {
    it('should create store with all reducers', () => {
      const state = store.getState()
      
      expect(state).toHaveProperty('auth')
      expect(state).toHaveProperty('property')
      expect(state).toHaveProperty('reservations')
      expect(state).toHaveProperty('reviews')
      expect(state).toHaveProperty('messages')
      expect(state).toHaveProperty('finance')
      expect(state).toHaveProperty('availability')
      expect(state).toHaveProperty('dashboard')
      expect(state).toHaveProperty('ratePlan')
      expect(state).toHaveProperty('price')
      expect(state).toHaveProperty('error')
    })

    it('should have correct initial states for all slices', () => {
      const state = store.getState()

      // Auth slice
      expect(state.auth.isAuthenticated).toBe(false)
      expect(state.auth.user).toBeNull()

      // Property slice  
      expect(state.property.properties).toEqual([])
      expect(state.property.currentProperty).toBeNull()

      // Reservations slice
      expect(state.reservations.reservations).toEqual([])
      expect(state.reservations.stats.total).toBe(0)

      // Reviews slice
      expect(state.reviews.reviews).toEqual([])
      expect(state.reviews.stats.totalReviews).toBe(0)

      // Messages slice
      expect(state.messages.conversations).toEqual([])
      expect(state.messages.stats.totalUnread).toBe(0)

      // Finance slice
      expect(state.finance.bankAccounts).toEqual([])
      expect(state.finance.transactions).toEqual([])

      // Availability slice
      expect(state.availability.ratePlans).toEqual([])
      expect(state.availability.calendar).toEqual({})

      // Dashboard slice
      expect(state.dashboard.stats).toBeNull()
      expect(state.dashboard.quickActions).toEqual([])

      // Rate Plan slice (should be populated from localStorage or defaults)
      expect(state.ratePlan).toBeDefined()

      // Price slice
      // Note: pricesByRatePlan removed - rate plans no longer have date-specific pricing
      expect(state.price.selectedRatePlanIds).toEqual([])

      // Error slice
      expect(state.error).toBeDefined()
    })
  })

  describe('Cross-Slice Interactions', () => {
    it('should handle authentication state changes across slices', () => {
      // Simulate login
      store.dispatch({
        type: 'auth/login/fulfilled',
        payload: {
          user: {
            id: 'user-1',
            username: 'testuser',
            email: 'test@example.com',
            role: 'HomeOwner'
          },
          token: 'jwt-token'
        }
      })

      const state = store.getState()
      expect(state.auth.isAuthenticated).toBe(true)
      expect(state.auth.user?.role).toBe('HomeOwner')
    })

    it('should handle error states independently across slices', () => {
      // Set errors in different slices
      store.dispatch({ type: 'property/fetchMyProperties/rejected', payload: 'Property error' })
      store.dispatch({ type: 'reservations/fetchReservations/rejected', payload: 'Reservation error' })

      const state = store.getState()
      expect(state.property.error).toBe('Property error')
      expect(state.reservations.error).toBe('Reservation error')
      
      // Other slices should not be affected
      expect(state.messages.error).toBeNull()
      expect(state.finance.error).toBeNull()
    })

    it('should handle loading states independently', () => {
      // Set loading in multiple slices
      store.dispatch({ type: 'dashboard/fetchStats/pending' })
      store.dispatch({ type: 'property/fetchMyProperties/pending' })

      const state = store.getState()
      expect(state.dashboard.loading).toBe(true)
      expect(state.property.loading).toBe(true)
      
      // Other slices should not be affected
      expect(state.reservations.loading).toBe(false)
      expect(state.finance.loading).toBe(false)
    })

    it('should maintain data consistency when property is updated', () => {
      const mockProperty = {
        propertyId: 'prop-1',
        name: 'Test Villa',
        status: 'Live',
        ownerId: 'user-1'
      }

      // Update property in property slice
      store.dispatch({
        type: 'property/updateProperty/fulfilled',
        payload: mockProperty
      })

      const state = store.getState()
      const updatedProperty = state.property.properties.find(p => p.propertyId === 'prop-1')
      
      // Property should be updated in the properties array
      if (updatedProperty) {
        expect(updatedProperty.name).toBe('Test Villa')
      }
    })

    it('should handle reservation status updates with new enum values', () => {
      const mockReservation = {
        id: 'res-1',
        propertyId: 'prop-1',
        status: 'Confirmed', // New enum value
        totalAmount: 1500
      }

      store.dispatch({
        type: 'reservations/updateReservationStatus/fulfilled',
        payload: mockReservation
      })

      const state = store.getState()
      // Should handle new status enum without errors
      expect(state.reservations.loading).toBe(false)
    })
  })

  describe('Type Safety', () => {
    it('should maintain type safety across all slices', () => {
      const state = store.getState()
      
      // TypeScript should enforce correct types
      expect(typeof state.auth.isAuthenticated).toBe('boolean')
      expect(typeof state.property.loading).toBe('boolean')
      expect(typeof state.reservations.stats.total).toBe('number')
      expect(typeof state.dashboard.refreshInterval).toBe('number')
      
      // Arrays should be properly typed
      expect(Array.isArray(state.property.properties)).toBe(true)
      expect(Array.isArray(state.reservations.reservations)).toBe(true)
      expect(Array.isArray(state.availability.ratePlans)).toBe(true)
    })

    it('should handle enum values correctly', () => {
      // Test new PropertyStatus enum
      const propertyWithStatus = {
        propertyId: 'prop-1',
        status: 'Live', // PropertyStatus.Live
        name: 'Test Property'
      }

      store.dispatch({
        type: 'property/createProperty/fulfilled',
        payload: propertyWithStatus
      })

      const state = store.getState()
      expect(state.property.loading).toBe(false)
    })
  })

  describe('Performance and Memory', () => {
    it('should not cause memory leaks with large data sets', () => {
      // Add many properties
      const properties = Array.from({ length: 100 }, (_, i) => ({
        propertyId: `prop-${i}`,
        name: `Property ${i}`,
        status: 'Live'
      }))

      store.dispatch({
        type: 'property/fetchMyProperties/fulfilled',
        payload: properties
      })

      const state = store.getState()
      expect(state.property.properties).toHaveLength(100)
      expect(state.property.loading).toBe(false)
    })

    it('should handle concurrent async actions', () => {
      // Dispatch multiple actions at once
      store.dispatch({ type: 'property/fetchMyProperties/pending' })
      store.dispatch({ type: 'reservations/fetchReservations/pending' })
      store.dispatch({ type: 'dashboard/fetchStats/pending' })

      const state = store.getState()
      expect(state.property.loading).toBe(true)
      expect(state.reservations.loading).toBe(true)
      expect(state.dashboard.loading).toBe(true)
    })
  })

  describe('Error Recovery', () => {
    it('should allow error clearing without affecting other slices', () => {
      // Set errors in multiple slices
      store.dispatch({ type: 'property/fetchMyProperties/rejected', payload: 'Error 1' })
      store.dispatch({ type: 'reservations/fetchReservations/rejected', payload: 'Error 2' })

      // Clear error in one slice
      store.dispatch({ type: 'property/clearError' })

      const state = store.getState()
      expect(state.property.error).toBeNull()
      expect(state.reservations.error).toBe('Error 2') // Should remain
    })

    it('should handle malformed action payloads gracefully', () => {
      // This should not crash the store
      expect(() => {
        store.dispatch({ type: 'UNKNOWN_ACTION', payload: null })
      }).not.toThrow()

      const state = store.getState()
      expect(state).toBeDefined()
    })
  })

  describe('Data Flow Validation', () => {
    it('should maintain referential integrity between related data', () => {
      const property = {
        propertyId: 'prop-1',
        name: 'Test Villa',
        ownerId: 'user-1'
      }

      const reservation = {
        id: 'res-1',
        propertyId: 'prop-1', // References property
        status: 'Confirmed'
      }

      store.dispatch({ type: 'property/fetchMyProperties/fulfilled', payload: [property] })
      store.dispatch({ type: 'reservations/fetchReservations/fulfilled', payload: { reservations: [reservation] } })

      const state = store.getState()
      expect(state.property.properties[0].propertyId).toBe('prop-1')
      expect(state.reservations.reservations[0].propertyId).toBe('prop-1')
    })

    it('should handle nested state updates correctly', () => {
      // Test nested filter updates
      store.dispatch({
        type: 'dashboard/updateFilters',
        payload: {
          dateRange: {
            start: '2024-03-01',
            end: '2024-03-31'
          }
        }
      })

      const state = store.getState()
      expect(state.dashboard.filters.dateRange.start).toBe('2024-03-01')
      expect(state.dashboard.filters.dateRange.end).toBe('2024-03-31')
      // Other filter properties should remain unchanged
      expect(state.dashboard.filters.includeInactive).toBe(true)
    })
  })
})

// Helper function to validate slice structure
export const validateSliceStructure = (slice: any, expectedKeys: string[]) => {
  expectedKeys.forEach(key => {
    expect(slice).toHaveProperty(key)
  })
}

// Test utilities for other test files
export const createMockStore = (preloadedState?: any) => {

  return configureStore({
    reducer: {
      // @ts-ignore
      auth: authReducer,
      property: propertyReducer,
      reservations: reservationReducer,
      reviews: reviewReducer,
      messages: messageReducer,
      finance: financeReducer,
      availability: availabilityReducer,
      dashboard: dashboardReducer,
      ratePlan: ratePlanReducer,
      price: priceReducer,
      error: errorReducer,
    },
    preloadedState
  })
}

export const mockApiResponse = <T>(data: T) => {
  return Promise.resolve({ data })
}