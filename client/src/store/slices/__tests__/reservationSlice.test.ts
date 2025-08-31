import {configureStore} from '@reduxjs/toolkit'
import reservationReducer, {
  cancelReservation,
  clearError,
  clearFilters,
  fetchReservationById,
  fetchReservations,
  modifyReservation,
  reportNoShow,
  type Reservation,
  setCurrentReservation,
  updateFilters,
  updateReservationStatus
} from '../reservationSlice'
import {api} from '../../../utils/api'

// Mock API
jest.mock('../../../utils/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn()
  }
}))

const mockApi = api as jest.Mocked<typeof api>

describe('reservationSlice', () => {
  let store = configureStore({
    reducer: {
      reservations: reservationReducer
    }
  })

  beforeEach(() => {
    store = configureStore({
      reducer: {
        reservations: reservationReducer
      }
    })
    jest.clearAllMocks()
  })

  const mockReservation: Reservation = {
    id: 'res-1',
    propertyId: 'prop-1',
    propertyName: 'Test Villa',
    guestName: 'John Doe',
    guestEmail: 'john@example.com',
    guestPhone: '+971501234567',
    checkIn: '2024-03-15',
    checkOut: '2024-03-20',
    numberOfGuests: 4,
    status: 'Confirmed',
    totalAmount: 1500,
    currency: 'AED',
    specialRequests: 'Late check-in',
    paymentStatus: 'paid',
    bookingReference: 'WZ-2024-001',
    ratePlanId: 'rp-1',
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z'
  }

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().reservations
      expect(state).toEqual({
        reservations: [],
        currentReservation: null,
        loading: false,
        error: null,
        stats: {
          total: 0,
          confirmed: 0,
          pending: 0,
          modified: 0,
          completed: 0,
          cancelled: 0,
          noShow: 0
        },
        filters: {
          status: 'all',
          dateRange: {
            start: null,
            end: null
          },
          propertyId: null
        }
      })
    })
  })

  describe('reducers', () => {
    it('should clear error', () => {
      // First set an error
      store.dispatch({ type: 'reservations/setError', payload: 'Test error' })
      
      // Then clear it
      store.dispatch(clearError())
      
      const state = store.getState().reservations
      expect(state.error).toBeNull()
    })

    it('should set current reservation', () => {
      store.dispatch(setCurrentReservation(mockReservation))
      
      const state = store.getState().reservations
      expect(state.currentReservation).toEqual(mockReservation)
    })

    it('should update filters', () => {
      const newFilters = {
        status: 'Confirmed',
        dateRange: {
          start: '2024-03-01',
          end: '2024-03-31'
        }
      }
      
      store.dispatch(updateFilters(newFilters))
      
      const state = store.getState().reservations
      expect(state.filters).toEqual({
        ...state.filters,
        ...newFilters
      })
    })

    it('should clear filters', () => {
      // First set some filters
      store.dispatch(updateFilters({
        status: 'Confirmed',
        propertyId: 'prop-1'
      }))
      
      // Then clear them
      store.dispatch(clearFilters())
      
      const state = store.getState().reservations
      expect(state.filters).toEqual({
        status: 'all',
        dateRange: { start: null, end: null },
        propertyId: null
      })
    })
  })

  describe('fetchReservations async thunk', () => {
    it('should fetch reservations successfully', async () => {
      const mockReservations = [mockReservation]
      mockApi.get.mockResolvedValue({ reservations: mockReservations, stats: {} })

      await store.dispatch(fetchReservations({ status: 'Confirmed' }))

      const state = store.getState().reservations
      expect(state.reservations).toEqual(mockReservations)
      expect(state.loading).toBe(false)
      expect(state.stats.confirmed).toBe(1)
      expect(state.stats.total).toBe(1)
    })

    it('should handle fetch reservations error', async () => {
      const errorMessage = 'Failed to fetch reservations'
      mockApi.get.mockRejectedValue({
        response: { data: { error: errorMessage } }
      })

      await store.dispatch(fetchReservations({}))

      const state = store.getState().reservations
      expect(state.loading).toBe(false)
      expect(state.error).toBe(errorMessage)
      expect(state.reservations).toEqual([])
    })

    it('should calculate stats correctly for all statuses', async () => {
      const mockReservations = [
        { ...mockReservation, status: 'Confirmed' },
        { ...mockReservation, id: 'res-2', status: 'Pending' },
        { ...mockReservation, id: 'res-3', status: 'Modified' },
        { ...mockReservation, id: 'res-4', status: 'Completed' },
        { ...mockReservation, id: 'res-5', status: 'Cancelled' },
        { ...mockReservation, id: 'res-6', status: 'NoShow' }
      ]
      mockApi.get.mockResolvedValue({ reservations: mockReservations, stats: {} })

      await store.dispatch(fetchReservations({}))

      const state = store.getState().reservations
      expect(state.stats).toEqual({
        total: 6,
        confirmed: 1,
        pending: 1,
        modified: 1,
        completed: 1,
        cancelled: 1,
        noShow: 1
      })
    })
  })

  describe('fetchReservationById async thunk', () => {
    it('should fetch single reservation successfully', async () => {
      mockApi.get.mockResolvedValue({ reservation: mockReservation })

      await store.dispatch(fetchReservationById('res-1'))

      const state = store.getState().reservations
      expect(state.currentReservation).toEqual(mockReservation)
      expect(state.loading).toBe(false)
    })

    it('should handle fetch single reservation error', async () => {
      const errorMessage = 'Reservation not found'
      mockApi.get.mockRejectedValue({
        response: { data: { error: errorMessage } }
      })

      await store.dispatch(fetchReservationById('res-1'))

      const state = store.getState().reservations
      expect(state.loading).toBe(false)
      expect(state.error).toBe(errorMessage)
    })
  })

  describe('updateReservationStatus async thunk', () => {
    it('should update reservation status successfully', async () => {
      const updatedReservation = { ...mockReservation, status: 'Modified' as const }
      mockApi.patch.mockResolvedValue({ reservation: updatedReservation })
      
      // First add reservation to state
      store.dispatch(setCurrentReservation(mockReservation))

      await store.dispatch(updateReservationStatus({
        reservationId: 'res-1',
        status: 'Modified',
        reason: 'Guest requested date change'
      }))

      const state = store.getState().reservations
      expect(state.loading).toBe(false)
      expect(state.currentReservation?.status).toBe('Modified')
    })

    it('should handle update status error', async () => {
      const errorMessage = 'Failed to update status'
      mockApi.patch.mockRejectedValue({
        response: { data: { error: errorMessage } }
      })

      await store.dispatch(updateReservationStatus({
        reservationId: 'res-1',
        status: 'Cancelled'
      }))

      const state = store.getState().reservations
      expect(state.loading).toBe(false)
      expect(state.error).toBe(errorMessage)
    })
  })

  describe('modifyReservation async thunk', () => {
    it('should modify reservation successfully', async () => {
      const modifiedReservation = {
        ...mockReservation,
        status: 'Modified' as const,
        checkOut: '2024-03-22',
        totalAmount: 1800
      }
      mockApi.patch.mockResolvedValue({ reservation: modifiedReservation })

      await store.dispatch(modifyReservation({
        reservationId: 'res-1',
        newCheckOut: '2024-03-22',
        newTotalAmount: 1800,
        reason: 'Extended stay requested'
      }))

      const state = store.getState().reservations
      expect(state.loading).toBe(false)
    })
  })

  describe('reportNoShow async thunk', () => {
    it('should report no-show successfully', async () => {
      const noShowReservation = { ...mockReservation, status: 'NoShow' as const }
      mockApi.post.mockResolvedValue({ reservation: noShowReservation })

      await store.dispatch(reportNoShow({
        reservationId: 'res-1',
        reason: 'Guest did not arrive within 2 hours of check-in'
      }))

      const state = store.getState().reservations
      expect(state.loading).toBe(false)
    })
  })

  describe('cancelReservation async thunk', () => {
    it('should cancel reservation successfully', async () => {
      const cancelledReservation = { ...mockReservation, status: 'Cancelled' as const }
      mockApi.patch.mockResolvedValue({ reservation: cancelledReservation })

      await store.dispatch(cancelReservation({
        reservationId: 'res-1',
        reason: 'Guest cancelled due to travel restrictions'
      }))

      const state = store.getState().reservations
      expect(state.loading).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle empty reservations array', async () => {
      mockApi.get.mockResolvedValue({ reservations: [], stats: {} })

      await store.dispatch(fetchReservations({}))

      const state = store.getState().reservations
      expect(state.reservations).toEqual([])
      expect(state.stats.total).toBe(0)
    })

    it('should handle network errors', async () => {
      mockApi.get.mockRejectedValue(new Error('Network error'))

      await store.dispatch(fetchReservations({}))

      const state = store.getState().reservations
      expect(state.loading).toBe(false)
      expect(state.error).toBe('Failed to fetch reservations')
    })

    it('should update reservation in list when current reservation is updated', async () => {
      const updatedReservation = { ...mockReservation, status: 'Completed' as const }
      
      // Set initial state with reservation in list and as current
      store = configureStore({
        reducer: {
          reservations: reservationReducer
        },
        preloadedState: {
          reservations: {
            reservations: [mockReservation],
            currentReservation: mockReservation,
            loading: false,
            error: null,
            stats: {
              total: 1,
              confirmed: 1,
              pending: 0,
              modified: 0,
              completed: 0,
              cancelled: 0,
              noShow: 0
            },
            filters: {
              status: 'all',
              dateRange: { start: null, end: null },
              propertyId: null
            }
          }
        }
      })

      mockApi.patch.mockResolvedValue({ reservation: updatedReservation })

      await store.dispatch(updateReservationStatus({
        reservationId: 'res-1',
        status: 'Completed'
      }))

      const state = store.getState().reservations
      expect(state.reservations[0].status).toBe('Completed')
      expect(state.currentReservation?.status).toBe('Completed')
    })
  })
})