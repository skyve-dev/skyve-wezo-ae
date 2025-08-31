import {configureStore} from '@reduxjs/toolkit'
import availabilityReducer, {
  type AvailabilitySlot,
  blockDates,
  type BulkAvailabilityUpdate,
  type BulkPriceUpdate,
  bulkUpdateAvailability,
  bulkUpdatePrices,
  checkBookingAvailability,
  clearDateSelection,
  clearError,
  clearFilters,
  createRatePlan,
  deleteRatePlan,
  fetchAvailability,
  fetchPublicAvailability,
  fetchRatePlans,
  type RatePlan,
  selectDateRange,
  setCurrentMonth,
  setCurrentPropertyId,
  setCurrentRatePlan,
  setViewMode,
  syncExternalCalendar,
  toggleBulkOperation,
  toggleDateSelection,
  unblockDates,
  updateAvailability,
  updateFilters,
  updateRatePlan
} from '../availabilitySlice'
import {api} from '../../../utils/api'

// Mock API
jest.mock('../../../utils/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}))

const mockApi = api as jest.Mocked<typeof api>

describe('availabilitySlice', () => {
  let store = configureStore({
    reducer: {
      availability: availabilityReducer
    }
  })

  beforeEach(() => {
    store = configureStore({
      reducer: {
        availability: availabilityReducer
      }
    })
    jest.clearAllMocks()
  })

  const mockRatePlan: RatePlan = {
    id: 'rp-1',
    name: 'Standard Rate',
    type: 'flexible',
    description: 'Our standard flexible rate plan',
    cancellationPolicy: {
      daysBeforeFreeCancel: 7,
      refundPercentage: 100,
      noShowPolicy: 'no-refund'
    },
    bookingRestrictions: {
      minimumStay: 2,
      maximumStay: 14,
      advanceBookingDays: 30,
      cutoffHours: 24,
      checkInDays: [1, 2, 3, 4, 5], // Monday to Friday
      checkOutDays: [1, 2, 3, 4, 5, 6, 0] // Any day
    },
    inclusions: ['WiFi', 'Breakfast', 'Airport Transfer'],
    isActive: true,
    priority: 1,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  }

  const mockAvailabilitySlot: AvailabilitySlot = {
    id: 'slot-1',
    propertyId: 'prop-1',
    date: '2024-03-15',
    status: 'available',
    ratePlans: [{
      ratePlanId: 'rp-1',
      basePrice: 500,
      discountPercent: 10,
      finalPrice: 450,
      currency: 'AED',
      isAvailable: true
    }],
    minimumStay: 2,
    maximumStay: 14,
    availableUnits: 1,
    totalUnits: 1,
    lastUpdated: '2024-03-01T10:00:00Z'
  }
  //
  // const mockCalendarMonth: CalendarMonth = {
  //   year: 2024,
  //   month: 3,
  //   days: [mockAvailabilitySlot]
  // }

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().availability
      expect(state).toEqual({
        ratePlans: [],
        currentRatePlan: null,
        calendar: {},
        currentPropertyId: null,
        currentMonth: {
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1
        },
        viewMode: 'calendar',
        loading: false,
        error: null,
        filters: {
          status: null,
          ratePlanId: null,
          dateRange: {
            start: null,
            end: null
          }
        },
        bulkOperation: {
          isOpen: false,
          type: null,
          selectedDates: []
        }
      })
    })
  })

  describe('reducers', () => {
    it('should clear error', () => {
      store.dispatch(clearError())
      const state = store.getState().availability
      expect(state.error).toBeNull()
    })

    it('should set current rate plan', () => {
      store.dispatch(setCurrentRatePlan(mockRatePlan))
      const state = store.getState().availability
      expect(state.currentRatePlan).toEqual(mockRatePlan)
    })

    it('should set current property ID', () => {
      store.dispatch(setCurrentPropertyId('prop-1'))
      const state = store.getState().availability
      expect(state.currentPropertyId).toBe('prop-1')
      expect(state.calendar['prop-1']).toEqual([])
    })

    it('should set current month', () => {
      const newMonth = { year: 2024, month: 6 }
      store.dispatch(setCurrentMonth(newMonth))
      const state = store.getState().availability
      expect(state.currentMonth).toEqual(newMonth)
    })

    it('should set view mode', () => {
      store.dispatch(setViewMode('list'))
      const state = store.getState().availability
      expect(state.viewMode).toBe('list')
    })

    it('should update filters', () => {
      const newFilters = {
        status: 'available',
        ratePlanId: 'rp-1',
        dateRange: {
          start: '2024-03-01',
          end: '2024-03-31'
        }
      }

      store.dispatch(updateFilters(newFilters))
      const state = store.getState().availability
      expect(state.filters).toEqual(newFilters)
    })

    it('should clear filters', () => {
      // First set some filters
      store.dispatch(updateFilters({
        status: 'blocked',
        ratePlanId: 'rp-1'
      }))

      // Then clear them
      store.dispatch(clearFilters())

      const state = store.getState().availability
      expect(state.filters).toEqual({
        status: null,
        ratePlanId: null,
        dateRange: { start: null, end: null }
      })
    })

    it('should toggle bulk operation', () => {
      store.dispatch(toggleBulkOperation({ type: 'price', isOpen: true }))
      
      const state = store.getState().availability
      expect(state.bulkOperation.isOpen).toBe(true)
      expect(state.bulkOperation.type).toBe('price')
    })

    it('should toggle date selection', () => {
      const date = '2024-03-15'
      
      // Select date
      store.dispatch(toggleDateSelection(date))
      let state = store.getState().availability
      expect(state.bulkOperation.selectedDates).toContain(date)

      // Deselect date
      store.dispatch(toggleDateSelection(date))
      state = store.getState().availability
      expect(state.bulkOperation.selectedDates).not.toContain(date)
    })

    it('should clear date selection', () => {
      // First select some dates
      store.dispatch(toggleDateSelection('2024-03-15'))
      store.dispatch(toggleDateSelection('2024-03-16'))

      // Then clear selection
      store.dispatch(clearDateSelection())

      const state = store.getState().availability
      expect(state.bulkOperation.selectedDates).toEqual([])
    })

    it('should select date range', () => {
      const dateRange = { start: '2024-03-15', end: '2024-03-17' }
      store.dispatch(selectDateRange(dateRange))

      const state = store.getState().availability
      expect(state.bulkOperation.selectedDates).toEqual([
        '2024-03-15',
        '2024-03-16', 
        '2024-03-17'
      ])
    })
  })

  describe('fetchRatePlans async thunk', () => {
    it('should fetch rate plans successfully', async () => {
      const mockRatePlans = [mockRatePlan]
      mockApi.get.mockResolvedValue({ ratePlans: mockRatePlans })

      await store.dispatch(fetchRatePlans('prop-1'))

      const state = store.getState().availability
      expect(state.ratePlans).toEqual(mockRatePlans)
      expect(state.currentRatePlan).toEqual(mockRatePlan) // Should set first as current
      expect(state.loading).toBe(false)
    })

    it('should handle fetch rate plans error', async () => {
      const errorMessage = 'Failed to fetch rate plans'
      mockApi.get.mockRejectedValue({
        getUserMessage: () => errorMessage
      })

      await store.dispatch(fetchRatePlans('prop-1'))

      const state = store.getState().availability
      expect(state.loading).toBe(false)
      expect(state.error).toBe(errorMessage)
    })
  })

  describe('createRatePlan async thunk', () => {
    it('should create rate plan successfully', async () => {
      mockApi.post.mockResolvedValue({ ratePlan: mockRatePlan })

      await store.dispatch(createRatePlan({
        propertyId: 'prop-1',
        ratePlanData: {
          name: 'New Rate Plan',
          type: 'flexible',
          description: 'Test rate plan',
          cancellationPolicy: {
            daysBeforeFreeCancel: 7,
            refundPercentage: 100,
            noShowPolicy: 'no-refund'
          },
          bookingRestrictions: {
            minimumStay: 1,
            advanceBookingDays: 30,
            cutoffHours: 24,
            checkInDays: [1, 2, 3, 4, 5, 6, 0],
            checkOutDays: [1, 2, 3, 4, 5, 6, 0]
          },
          inclusions: [],
          isActive: true,
          priority: 1
        }
      }))

      const state = store.getState().availability
      expect(state.ratePlans).toContain(mockRatePlan)
      expect(state.loading).toBe(false)
    })
  })

  describe('updateRatePlan async thunk', () => {
    it('should update rate plan successfully', async () => {
      // Set initial state with rate plan
      store = configureStore({
        reducer: { availability: availabilityReducer },
        preloadedState: {
          availability: {
            ...store.getState().availability,
            ratePlans: [mockRatePlan],
            currentRatePlan: mockRatePlan
          }
        }
      })

      const updatedRatePlan = { ...mockRatePlan, name: 'Updated Rate Plan' }
      mockApi.patch.mockResolvedValue({ ratePlan: updatedRatePlan })

      await store.dispatch(updateRatePlan({
        propertyId: 'prop-1',
        ratePlanId: 'rp-1',
        updates: { name: 'Updated Rate Plan' }
      }))

      const state = store.getState().availability
      expect(state.ratePlans[0].name).toBe('Updated Rate Plan')
      expect(state.currentRatePlan?.name).toBe('Updated Rate Plan')
    })
  })

  describe('deleteRatePlan async thunk', () => {
    it('should delete rate plan successfully', async () => {
      const secondRatePlan = { ...mockRatePlan, id: 'rp-2', name: 'Second Rate Plan' }
      
      store = configureStore({
        reducer: { availability: availabilityReducer },
        preloadedState: {
          availability: {
            ...store.getState().availability,
            ratePlans: [mockRatePlan, secondRatePlan],
            currentRatePlan: mockRatePlan
          }
        }
      })

      mockApi.delete.mockResolvedValue({})

      await store.dispatch(deleteRatePlan({
        propertyId: 'prop-1',
        ratePlanId: 'rp-1'
      }))

      const state = store.getState().availability
      expect(state.ratePlans).not.toContain(mockRatePlan)
      expect(state.currentRatePlan).toEqual(secondRatePlan) // Should switch to remaining
    })
  })

  describe('fetchAvailability async thunk', () => {
    it('should fetch availability successfully', async () => {
      const mockBackendData = [{
        id: 'avail-1',
        propertyId: 'prop-1',
        date: '2024-03-15',
        isAvailable: true,
        createdAt: '2024-03-01T10:00:00Z',
        updatedAt: '2024-03-01T10:00:00Z'
      }]

      mockApi.get.mockResolvedValue({
        propertyId: 'prop-1',
        startDate: '2024-03-01',
        endDate: '2024-03-31',
        availability: mockBackendData
      })

      await store.dispatch(fetchAvailability({
        propertyId: 'prop-1',
        year: 2024,
        month: 3,
        months: 1
      }))

      const state = store.getState().availability
      expect(state.calendar['prop-1']).toBeDefined()
      expect(state.calendar['prop-1']).toHaveLength(1) // One month
      expect(state.loading).toBe(false)
    })

    it('should handle fetch availability error', async () => {
      const errorMessage = 'Failed to fetch availability'
      mockApi.get.mockRejectedValue({
        getUserMessage: () => errorMessage
      })

      await store.dispatch(fetchAvailability({
        propertyId: 'prop-1',
        year: 2024,
        month: 3
      }))

      const state = store.getState().availability
      expect(state.loading).toBe(false)
      expect(state.error).toBe(errorMessage)
    })
  })

  describe('fetchPublicAvailability async thunk', () => {
    it('should fetch public availability successfully', async () => {
      const mockPublicData = {
        propertyId: 'prop-1',
        startDate: '2024-03-01',
        endDate: '2024-03-31',
        availability: [
          { date: '2024-03-15', isAvailable: true },
          { date: '2024-03-16', isAvailable: false }
        ]
      }

      mockApi.get.mockResolvedValue(mockPublicData)

      await store.dispatch(fetchPublicAvailability({
        propertyId: 'prop-1',
        startDate: '2024-03-01',
        endDate: '2024-03-31'
      }))

      const state = store.getState().availability
      expect(state.loading).toBe(false)
    })
  })

  describe('checkBookingAvailability async thunk', () => {
    it('should check booking availability successfully', async () => {
      const mockResponse = {
        isAvailable: true,
        totalPrice: 900,
        currency: 'AED',
        breakdown: []
      }

      mockApi.post.mockResolvedValue(mockResponse)

      await store.dispatch(checkBookingAvailability({
        propertyId: 'prop-1',
        checkInDate: '2024-03-15',
        checkOutDate: '2024-03-17',
        numGuests: 4
      }))

      const state = store.getState().availability
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('updateAvailability async thunk', () => {
    it('should update availability slot successfully', async () => {
      const updatedSlot = { ...mockAvailabilitySlot, status: 'blocked' as const }
      mockApi.patch.mockResolvedValue({ availability: updatedSlot })

      await store.dispatch(updateAvailability({
        propertyId: 'prop-1',
        date: '2024-03-15',
        updates: { status: 'blocked' }
      }))

      const state = store.getState().availability
      expect(state.loading).toBe(false)
    })
  })

  describe('bulkUpdatePrices async thunk', () => {
    it('should bulk update prices successfully', async () => {
      const bulkUpdate: BulkPriceUpdate = {
        propertyId: 'prop-1',
        ratePlanId: 'rp-1',
        dateRange: {
          start: '2024-03-15',
          end: '2024-03-17'
        },
        priceChange: {
          type: 'percentage',
          amount: -20 // 20% discount
        }
      }

      const updatedSlots = [
        { ...mockAvailabilitySlot, date: '2024-03-15' },
        { ...mockAvailabilitySlot, date: '2024-03-16' },
        { ...mockAvailabilitySlot, date: '2024-03-17' }
      ]

      mockApi.post.mockResolvedValue({ updatedSlots })

      await store.dispatch(bulkUpdatePrices(bulkUpdate))

      const state = store.getState().availability
      expect(state.loading).toBe(false)
      expect(state.bulkOperation.selectedDates).toEqual([]) // Should be cleared
      expect(state.bulkOperation.isOpen).toBe(false)
    })
  })

  describe('bulkUpdateAvailability async thunk', () => {
    it('should bulk update availability successfully', async () => {
      const bulkUpdate: BulkAvailabilityUpdate = {
        propertyId: 'prop-1',
        dateRange: {
          start: '2024-03-15',
          end: '2024-03-17'
        },
        action: 'block',
        reason: 'Maintenance'
      }

      const updatedSlots = [
        { ...mockAvailabilitySlot, status: 'blocked' as const, blockReason: 'Maintenance' }
      ]

      mockApi.post.mockResolvedValue({ updatedSlots })

      await store.dispatch(bulkUpdateAvailability(bulkUpdate))

      const state = store.getState().availability
      expect(state.loading).toBe(false)
      expect(state.bulkOperation.selectedDates).toEqual([])
    })
  })

  describe('blockDates async thunk', () => {
    it('should block dates successfully', async () => {
      const dates = ['2024-03-15', '2024-03-16']
      const reason = 'Property maintenance'

      mockApi.put.mockResolvedValue({
        message: 'Dates blocked successfully',
        updated: 2,
        failed: []
      })

      await store.dispatch(blockDates({
        propertyId: 'prop-1',
        dates,
        reason
      }))

      const state = store.getState().availability
      expect(state.loading).toBe(false)
    })
  })

  describe('unblockDates async thunk', () => {
    it('should unblock dates successfully', async () => {
      const dates = ['2024-03-15', '2024-03-16']

      mockApi.put.mockResolvedValue({
        message: 'Dates unblocked successfully',
        updated: 2,
        failed: []
      })

      await store.dispatch(unblockDates({
        propertyId: 'prop-1',
        dates
      }))

      const state = store.getState().availability
      expect(state.loading).toBe(false)
    })
  })

  describe('syncExternalCalendar async thunk', () => {
    it('should sync external calendar successfully', async () => {
      const syncedSlots = [
        { ...mockAvailabilitySlot, status: 'blocked' as const, blockReason: 'External booking' }
      ]

      const syncStats = {
        totalProcessed: 30,
        blocked: 5,
        unblocked: 2,
        errors: 0
      }

      mockApi.post.mockResolvedValue({ syncedSlots, syncStats })

      await store.dispatch(syncExternalCalendar({
        propertyId: 'prop-1',
        calendarUrl: 'https://calendar.google.com/ical/xyz.ics'
      }))

      const state = store.getState().availability
      expect(state.loading).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle empty rate plans list', async () => {
      mockApi.get.mockResolvedValue({ ratePlans: [] })

      await store.dispatch(fetchRatePlans('prop-1'))

      const state = store.getState().availability
      expect(state.ratePlans).toEqual([])
      expect(state.currentRatePlan).toBeNull()
    })

    it('should handle network errors gracefully', async () => {
      mockApi.get.mockRejectedValue(new Error('Network error'))

      await store.dispatch(fetchRatePlans('prop-1'))

      const state = store.getState().availability
      expect(state.loading).toBe(false)
      expect(state.error).toBe('Network error') // Should match the actual error message
    })

    it('should handle calendar data transformation errors', async () => {
      // Mock malformed backend data
      mockApi.get.mockResolvedValue({
        propertyId: 'prop-1',
        availability: null // Invalid data
      })

      await store.dispatch(fetchAvailability({
        propertyId: 'prop-1',
        year: 2024,
        month: 3
      }))

      const state = store.getState().availability
      expect(state.loading).toBe(false)
    })

    it('should handle bulk operations with no selected dates', () => {
      store.dispatch(toggleBulkOperation({ isOpen: false }))
      
      const state = store.getState().availability
      expect(state.bulkOperation.selectedDates).toEqual([])
    })

    it('should handle date range selection with invalid dates', () => {
      const invalidRange = { start: '2024-03-20', end: '2024-03-15' } // End before start
      
      expect(() => {
        store.dispatch(selectDateRange(invalidRange))
      }).not.toThrow() // Should handle gracefully
    })

    it('should maintain calendar state when switching properties', () => {
      // Set calendar for first property
      store.dispatch(setCurrentPropertyId('prop-1'))
      
      // Switch to second property
      store.dispatch(setCurrentPropertyId('prop-2'))
      
      const state = store.getState().availability
      expect(state.calendar['prop-1']).toEqual([])
      expect(state.calendar['prop-2']).toEqual([])
    })
  })
})