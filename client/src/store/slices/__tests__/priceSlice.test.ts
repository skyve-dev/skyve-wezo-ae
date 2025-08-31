import { configureStore } from '@reduxjs/toolkit'
import priceReducer, {
  fetchPricesForRatePlan,
  createOrUpdatePrice,
  bulkUpdatePrices,
  fetchPriceStatistics,
  fetchPriceGaps,
  copyPrices,
  deletePriceAsync,
  setCalendarMode,
  setSelectedDate,
  setDateRange,
  setSelectedRatePlans,
  addSelectedRatePlan,
  removeSelectedRatePlan,
  toggleRatePlanSelection,
  setPricesForRatePlan,
  addPrice,
  updatePrice,
  deletePrice,
  openPriceEditForm,
  closePriceEditForm,
  updatePriceEditAmount,
  toggleBulkEditMode,
  toggleDateSelection,
  clearDateSelections,
  setBulkEditAmount,
  setStatistics,
  setPriceGaps,
  startCopyOperation,
  setCopyTargetDate,
  cancelCopyOperation,
  setError,
  clearPrices,
  clearRefreshTrigger,
  type Price,
  type PriceStatistics,
  type PriceGap,
  type BulkPriceUpdate
} from '../priceSlice'

// Mock API
jest.mock('@/utils/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn()
  }
}))

import { api } from '@/utils/api'

const mockApi = api as jest.Mocked<typeof api>

describe('priceSlice', () => {
  let store = configureStore({
    reducer: {
      price: priceReducer
    }
  });

  beforeEach(() => {
    store = configureStore({
      reducer: {
        price: priceReducer
      }
    })
    jest.clearAllMocks()
  })

  const mockPrice: Price = {
    id: 'price-1',
    ratePlanId: 'rp-1',
    date: '2024-03-15',
    amount: 500,
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z'
  }

  const mockPriceStatistics: PriceStatistics = {
    totalPrices: 30,
    averagePrice: 450,
    minPrice: 300,
    maxPrice: 800,
    priceRange: 500,
    weekendAveragePrice: 520,
    weekdayAveragePrice: 420,
    monthlyBreakdown: [
      {
        month: '2024-03',
        averagePrice: 460,
        priceCount: 15
      }
    ]
  }

  const mockPriceGap: PriceGap = {
    date: '2024-03-20',
    dayOfWeek: 'Friday'
  }

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().price
      expect(state).toEqual({
        pricesByRatePlan: {},
        selectedPrice: null,
        calendarMode: 'calendar',
        selectedDate: null,
        selectedRatePlanIds: [],
        dateRange: {
          startDate: null,
          endDate: null
        },
        priceEditForm: {
          isOpen: false,
          date: null,
          ratePlanId: null,
          amount: 0,
          originalAmount: 0
        },
        bulkEditMode: false,
        selectedDates: [],
        bulkEditAmount: 0,
        statistics: {},
        priceGaps: {},
        loading: false,
        statisticsLoading: false,
        bulkOperationLoading: false,
        error: null,
        copyOperation: {
          isActive: false,
          sourceStartDate: null,
          sourceEndDate: null,
          targetStartDate: null
        },
        needsRefresh: null
      })
    })
  })

  describe('reducers', () => {
    it('should set calendar mode', () => {
      store.dispatch(setCalendarMode('dashboard'))
      const state = store.getState().price
      expect(state.calendarMode).toBe('dashboard')
    })

    it('should set selected date', () => {
      store.dispatch(setSelectedDate('2024-03-15'))
      const state = store.getState().price
      expect(state.selectedDate).toBe('2024-03-15')
    })

    it('should set date range', () => {
      const dateRange = {
        startDate: '2024-03-01',
        endDate: '2024-03-31'
      }
      store.dispatch(setDateRange(dateRange))
      const state = store.getState().price
      expect(state.dateRange).toEqual(dateRange)
    })

    it('should set selected rate plans', () => {
      const ratePlanIds = ['rp-1', 'rp-2']
      store.dispatch(setSelectedRatePlans(ratePlanIds))
      const state = store.getState().price
      expect(state.selectedRatePlanIds).toEqual(ratePlanIds)
    })

    it('should add selected rate plan', () => {
      store.dispatch(addSelectedRatePlan('rp-1'))
      store.dispatch(addSelectedRatePlan('rp-2'))
      const state = store.getState().price
      expect(state.selectedRatePlanIds).toEqual(['rp-1', 'rp-2'])
    })

    it('should not add duplicate rate plan', () => {
      store.dispatch(addSelectedRatePlan('rp-1'))
      store.dispatch(addSelectedRatePlan('rp-1')) // Duplicate
      const state = store.getState().price
      expect(state.selectedRatePlanIds).toEqual(['rp-1'])
    })

    it('should remove selected rate plan', () => {
      store.dispatch(setSelectedRatePlans(['rp-1', 'rp-2']))
      store.dispatch(removeSelectedRatePlan('rp-1'))
      const state = store.getState().price
      expect(state.selectedRatePlanIds).toEqual(['rp-2'])
    })

    it('should toggle rate plan selection', () => {
      // Add rate plan
      store.dispatch(toggleRatePlanSelection('rp-1'))
      let state = store.getState().price
      expect(state.selectedRatePlanIds).toContain('rp-1')

      // Remove rate plan
      store.dispatch(toggleRatePlanSelection('rp-1'))
      state = store.getState().price
      expect(state.selectedRatePlanIds).not.toContain('rp-1')
    })

    it('should set prices for rate plan', () => {
      const prices = [mockPrice]
      store.dispatch(setPricesForRatePlan({ ratePlanId: 'rp-1', prices }))
      const state = store.getState().price
      expect(state.pricesByRatePlan['rp-1']).toEqual(prices)
    })

    it('should add price to rate plan', () => {
      store.dispatch(addPrice(mockPrice))
      const state = store.getState().price
      expect(state.pricesByRatePlan['rp-1']).toContain(mockPrice)
    })

    it('should replace existing price for same date', () => {
      const originalPrice = { ...mockPrice, amount: 400 }
      const updatedPrice = { ...mockPrice, amount: 600 }

      store.dispatch(addPrice(originalPrice))
      store.dispatch(addPrice(updatedPrice))

      const state = store.getState().price
      expect(state.pricesByRatePlan['rp-1']).toHaveLength(1)
      expect(state.pricesByRatePlan['rp-1'][0].amount).toBe(600)
    })

    it('should update existing price', () => {
      // First add price
      store.dispatch(addPrice(mockPrice))

      const updatedPrice = { ...mockPrice, amount: 700 }
      store.dispatch(updatePrice(updatedPrice))

      const state = store.getState().price
      expect(state.pricesByRatePlan['rp-1'][0].amount).toBe(700)
    })

    it('should delete price', () => {
      // First add price
      store.dispatch(addPrice(mockPrice))

      store.dispatch(deletePrice({ ratePlanId: 'rp-1', priceId: 'price-1' }))

      const state = store.getState().price
      expect(state.pricesByRatePlan['rp-1']).toHaveLength(0)
    })

    it('should open price edit form', () => {
      store.dispatch(openPriceEditForm({
        date: '2024-03-15',
        ratePlanId: 'rp-1',
        amount: 500
      }))

      const state = store.getState().price
      expect(state.priceEditForm).toEqual({
        isOpen: true,
        date: '2024-03-15',
        ratePlanId: 'rp-1',
        amount: 500,
        originalAmount: 500
      })
    })

    it('should close price edit form', () => {
      // First open form
      store.dispatch(openPriceEditForm({
        date: '2024-03-15',
        ratePlanId: 'rp-1'
      }))

      // Then close it
      store.dispatch(closePriceEditForm())

      const state = store.getState().price
      expect(state.priceEditForm).toEqual({
        isOpen: false,
        date: null,
        ratePlanId: null,
        amount: 0,
        originalAmount: 0
      })
    })

    it('should update price edit amount', () => {
      store.dispatch(openPriceEditForm({
        date: '2024-03-15',
        ratePlanId: 'rp-1',
        amount: 500
      }))

      store.dispatch(updatePriceEditAmount(600))

      const state = store.getState().price
      expect(state.priceEditForm.amount).toBe(600)
      expect(state.priceEditForm.originalAmount).toBe(500) // Should remain unchanged
    })

    it('should toggle bulk edit mode', () => {
      store.dispatch(toggleBulkEditMode())
      let state = store.getState().price
      expect(state.bulkEditMode).toBe(true)

      store.dispatch(toggleBulkEditMode())
      state = store.getState().price
      expect(state.bulkEditMode).toBe(false)
      expect(state.selectedDates).toEqual([])
      expect(state.bulkEditAmount).toBe(0)
    })

    it('should toggle date selection', () => {
      const date = '2024-03-15'

      // Select date
      store.dispatch(toggleDateSelection(date))
      let state = store.getState().price
      expect(state.selectedDates).toContain(date)

      // Deselect date
      store.dispatch(toggleDateSelection(date))
      state = store.getState().price
      expect(state.selectedDates).not.toContain(date)
    })

    it('should clear date selections', () => {
      store.dispatch(toggleDateSelection('2024-03-15'))
      store.dispatch(toggleDateSelection('2024-03-16'))

      store.dispatch(clearDateSelections())

      const state = store.getState().price
      expect(state.selectedDates).toEqual([])
    })

    it('should set bulk edit amount', () => {
      store.dispatch(setBulkEditAmount(550))
      const state = store.getState().price
      expect(state.bulkEditAmount).toBe(550)
    })

    it('should set statistics', () => {
      store.dispatch(setStatistics({
        ratePlanId: 'rp-1',
        statistics: mockPriceStatistics
      }))

      const state = store.getState().price
      expect(state.statistics['rp-1']).toEqual(mockPriceStatistics)
    })

    it('should set price gaps', () => {
      const gaps = [mockPriceGap]
      store.dispatch(setPriceGaps({
        ratePlanId: 'rp-1',
        gaps
      }))

      const state = store.getState().price
      expect(state.priceGaps['rp-1']).toEqual(gaps)
    })

    it('should start copy operation', () => {
      store.dispatch(startCopyOperation({
        sourceStartDate: '2024-03-01',
        sourceEndDate: '2024-03-07'
      }))

      const state = store.getState().price
      expect(state.copyOperation).toEqual({
        isActive: true,
        sourceStartDate: '2024-03-01',
        sourceEndDate: '2024-03-07',
        targetStartDate: null
      })
    })

    it('should set copy target date', () => {
      store.dispatch(startCopyOperation({
        sourceStartDate: '2024-03-01',
        sourceEndDate: '2024-03-07'
      }))

      store.dispatch(setCopyTargetDate('2024-03-15'))

      const state = store.getState().price
      expect(state.copyOperation.targetStartDate).toBe('2024-03-15')
    })

    it('should cancel copy operation', () => {
      store.dispatch(startCopyOperation({
        sourceStartDate: '2024-03-01',
        sourceEndDate: '2024-03-07'
      }))

      store.dispatch(cancelCopyOperation())

      const state = store.getState().price
      expect(state.copyOperation).toEqual({
        isActive: false,
        sourceStartDate: null,
        sourceEndDate: null,
        targetStartDate: null
      })
    })

    it('should set error and reset loading states', () => {
      store.dispatch(setError('Test error'))

      const state = store.getState().price
      expect(state.error).toBe('Test error')
      expect(state.loading).toBe(false)
      expect(state.statisticsLoading).toBe(false)
      expect(state.bulkOperationLoading).toBe(false)
    })

    it('should clear prices', () => {
      // First add some data
      store.dispatch(addPrice(mockPrice))
      store.dispatch(setStatistics({ ratePlanId: 'rp-1', statistics: mockPriceStatistics }))

      // Then clear
      store.dispatch(clearPrices())

      const state = store.getState().price
      expect(state.pricesByRatePlan).toEqual({})
      expect(state.statistics).toEqual({})
      expect(state.priceGaps).toEqual({})
      expect(state.error).toBeNull()
    })

    it('should clear refresh trigger', async () => {
      // Set refresh trigger first by simulating a successful createOrUpdatePrice
      const mockPrice = { 
        id: 'price-1', 
        ratePlanId: 'rp-1', 
        date: '2024-03-15', 
        amount: 500 
      }
      mockApi.post.mockResolvedValue({ price: mockPrice })
      
      // This will set the needsRefresh state
      await store.dispatch(createOrUpdatePrice(mockPrice))

      // Verify refresh trigger was set
      let state = store.getState().price
      expect(state.needsRefresh).not.toBeNull()

      // Clear it
      store.dispatch(clearRefreshTrigger())

      const newState = store.getState().price
      expect(newState.needsRefresh).toBeNull()
    })
  })

  describe('fetchPricesForRatePlan async thunk', () => {
    it('should fetch prices successfully', async () => {
      const mockPrices = [mockPrice]
      mockApi.get.mockResolvedValue({ prices: mockPrices })

      await store.dispatch(fetchPricesForRatePlan({
        ratePlanId: 'rp-1',
        startDate: '2024-03-01',
        endDate: '2024-03-31'
      }))

      const state = store.getState().price
      expect(state.pricesByRatePlan['rp-1']).toEqual(mockPrices)
      expect(state.loading).toBe(false)
    })

    it('should handle fetch prices error', async () => {
      const errorMessage = 'Failed to fetch prices'
      mockApi.get.mockRejectedValue({
        getUserMessage: () => errorMessage
      })

      await store.dispatch(fetchPricesForRatePlan({
        ratePlanId: 'rp-1'
      }))

      const state = store.getState().price
      expect(state.loading).toBe(false)
      expect(state.error).toBe(errorMessage)
    })

    it('should construct query params correctly', async () => {
      mockApi.get.mockResolvedValue({ prices: [] })

      await store.dispatch(fetchPricesForRatePlan({
        ratePlanId: 'rp-1',
        startDate: '2024-03-01',
        endDate: '2024-03-31'
      }))

      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/rate-plans/rp-1/prices')
      )
      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('startDate=2024-03-01')
      )
      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('endDate=2024-03-31')
      )
    })
  })

  describe('createOrUpdatePrice async thunk', () => {
    it('should create/update price successfully', async () => {
      mockApi.post.mockResolvedValue({ price: mockPrice })

      await store.dispatch(createOrUpdatePrice({
        ratePlanId: 'rp-1',
        date: '2024-03-15',
        amount: 500
      }))

      const state = store.getState().price
      expect(state.pricesByRatePlan['rp-1']).toContain(mockPrice)
      expect(state.loading).toBe(false)
    })

    it('should close edit form on successful save', async () => {
      // First open edit form
      store.dispatch(openPriceEditForm({
        date: '2024-03-15',
        ratePlanId: 'rp-1',
        amount: 500
      }))

      mockApi.post.mockResolvedValue({ price: mockPrice })

      await store.dispatch(createOrUpdatePrice({
        ratePlanId: 'rp-1',
        date: '2024-03-15',
        amount: 500
      }))

      const state = store.getState().price
      expect(state.priceEditForm.isOpen).toBe(false)
    })

    it('should set refresh trigger on successful save', async () => {
      mockApi.post.mockResolvedValue({ price: mockPrice })

      await store.dispatch(createOrUpdatePrice({
        ratePlanId: 'rp-1',
        date: '2024-03-15',
        amount: 500
      }))

      const state = store.getState().price
      expect(state.needsRefresh).toEqual({
        ratePlanId: 'rp-1',
        timestamp: expect.any(Number)
      })
    })
  })

  describe('bulkUpdatePrices async thunk', () => {
    it('should bulk update prices successfully', async () => {
      const bulkUpdates: BulkPriceUpdate[] = [
        { date: '2024-03-15', amount: 500 },
        { date: '2024-03-16', amount: 520 }
      ]

      const updatedPrices = [
        { ...mockPrice, date: '2024-03-15', amount: 500 },
        { ...mockPrice, id: 'price-2', date: '2024-03-16', amount: 520 }
      ]

      mockApi.post.mockResolvedValue({ prices: updatedPrices })

      // Set up selected dates
      store.dispatch(toggleDateSelection('2024-03-15'))
      store.dispatch(toggleDateSelection('2024-03-16'))

      await store.dispatch(bulkUpdatePrices({
        ratePlanId: 'rp-1',
        updates: bulkUpdates
      }))

      const state = store.getState().price
      expect(state.pricesByRatePlan['rp-1']).toEqual(updatedPrices)
      expect(state.selectedDates).toEqual([]) // Should be cleared
      expect(state.bulkEditAmount).toBe(0)
      expect(state.bulkOperationLoading).toBe(false)
    })
  })

  describe('fetchPriceStatistics async thunk', () => {
    it('should fetch price statistics successfully', async () => {
      mockApi.get.mockResolvedValue({ statistics: mockPriceStatistics })

      await store.dispatch(fetchPriceStatistics({
        ratePlanId: 'rp-1',
        startDate: '2024-03-01',
        endDate: '2024-03-31'
      }))

      const state = store.getState().price
      expect(state.statistics['rp-1']).toEqual(mockPriceStatistics)
      expect(state.statisticsLoading).toBe(false)
    })
  })

  describe('fetchPriceGaps async thunk', () => {
    it('should fetch price gaps successfully', async () => {
      const gaps = [mockPriceGap]
      mockApi.get.mockResolvedValue({ gaps })

      await store.dispatch(fetchPriceGaps({
        ratePlanId: 'rp-1',
        startDate: '2024-03-01',
        endDate: '2024-03-31'
      }))

      const state = store.getState().price
      expect(state.priceGaps['rp-1']).toEqual(gaps)
    })
  })

  describe('copyPrices async thunk', () => {
    it('should copy prices successfully', async () => {
      const copiedPrices = [
        { ...mockPrice, id: 'price-copy-1', date: '2024-03-22' },
        { ...mockPrice, id: 'price-copy-2', date: '2024-03-23' }
      ]

      mockApi.post.mockResolvedValue({ copiedCount: 2 })
      mockApi.get.mockResolvedValue({ prices: copiedPrices })

      // Set up copy operation
      store.dispatch(startCopyOperation({
        sourceStartDate: '2024-03-15',
        sourceEndDate: '2024-03-16'
      }))

      await store.dispatch(copyPrices({
        ratePlanId: 'rp-1',
        sourceStartDate: '2024-03-15',
        sourceEndDate: '2024-03-16',
        targetStartDate: '2024-03-22'
      }))

      const state = store.getState().price
      expect(state.pricesByRatePlan['rp-1']).toEqual(copiedPrices)
      expect(state.copyOperation.isActive).toBe(false) // Should be cleared
      expect(state.bulkOperationLoading).toBe(false)
    })
  })

  describe('deletePriceAsync async thunk', () => {
    it('should delete price successfully', async () => {
      mockApi.delete.mockResolvedValue({})

      await store.dispatch(deletePriceAsync({
        priceId: 'price-1',
        ratePlanId: 'rp-1'
      }))

      const state = store.getState().price
      expect(state.loading).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle empty price list', async () => {
      mockApi.get.mockResolvedValue({ prices: [] })

      await store.dispatch(fetchPricesForRatePlan({
        ratePlanId: 'rp-1'
      }))

      const state = store.getState().price
      expect(state.pricesByRatePlan['rp-1']).toEqual([])
    })

    it('should handle network errors gracefully', async () => {
      mockApi.get.mockRejectedValue(new Error('Network error'))

      await store.dispatch(fetchPricesForRatePlan({
        ratePlanId: 'rp-1'
      }))

      const state = store.getState().price
      expect(state.loading).toBe(false)
      expect(state.error).toBe('Network error')
    })

    it('should handle bulk edit mode with no selected dates', () => {
      store.dispatch(toggleBulkEditMode())
      store.dispatch(toggleBulkEditMode()) // Turn off

      const state = store.getState().price
      expect(state.selectedDates).toEqual([])
      expect(state.bulkEditAmount).toBe(0)
    })

    it('should handle adding price to non-existent rate plan', () => {
      store.dispatch(addPrice({ ...mockPrice, ratePlanId: 'new-rp' }))

      const state = store.getState().price
      expect(state.pricesByRatePlan['new-rp']).toBeDefined()
      expect(state.pricesByRatePlan['new-rp']).toContainEqual(expect.objectContaining({ ratePlanId: 'new-rp' }))
    })

    it('should handle updating non-existent price', () => {
      const nonExistentPrice = { ...mockPrice, id: 'non-existent' }
      
      expect(() => {
        store.dispatch(updatePrice(nonExistentPrice))
      }).not.toThrow() // Should handle gracefully
    })

    it('should handle malformed API responses', async () => {
      mockApi.get.mockResolvedValue({}) // Missing prices field

      await store.dispatch(fetchPricesForRatePlan({
        ratePlanId: 'rp-1'
      }))

      const state = store.getState().price
      expect(state.pricesByRatePlan['rp-1']).toEqual([]) // Should default to empty array
    })

    it('should handle date range selection edge cases', () => {
      const invalidRange = {
        startDate: '2024-03-31',
        endDate: '2024-03-01' // End before start
      }

      store.dispatch(setDateRange(invalidRange))

      const state = store.getState().price
      expect(state.dateRange).toEqual(invalidRange) // Should accept any values
    })

    it('should handle concurrent async operations', async () => {
      const promise1 = store.dispatch(fetchPricesForRatePlan({ ratePlanId: 'rp-1' }))
      const promise2 = store.dispatch(fetchPriceStatistics({ ratePlanId: 'rp-1', startDate: '2024-03-01', endDate: '2024-03-31' }))

      mockApi.get.mockResolvedValue({ prices: [] })
      mockApi.get.mockResolvedValue({ statistics: mockPriceStatistics })

      await Promise.all([promise1, promise2])

      const state = store.getState().price
      expect(state.loading).toBe(false)
      expect(state.statisticsLoading).toBe(false)
    })
  })
})