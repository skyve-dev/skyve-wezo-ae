import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '@/utils/api'

interface Price {
  id: string
  ratePlanId: string
  date: string  // ISO date string
  amount: number
  createdAt: string
  updatedAt: string
}

interface PriceStatistics {
  totalPrices: number
  averagePrice: number
  minPrice: number
  maxPrice: number
  priceRange: number
  weekendAveragePrice?: number
  weekdayAveragePrice?: number
  monthlyBreakdown?: Array<{
    month: string
    averagePrice: number
    priceCount: number
  }>
}

interface PriceGap {
  date: string
  dayOfWeek: string
}

interface BulkPriceUpdate {
  date: string
  amount: number
}

interface PriceState {
  // Price data organized by rate plan ID
  pricesByRatePlan: Record<string, Price[]>
  
  // Selected price for editing
  selectedPrice: Price | null
  
  // UI state for Calendar mode
  calendarMode: 'calendar' | 'dashboard'
  selectedDate: string | null
  selectedRatePlanIds: string[] // Multiple rate plans can be selected for comparison
  
  // Date range filters
  dateRange: {
    startDate: string | null
    endDate: string | null
  }
  
  // Form state for price editing
  priceEditForm: {
    isOpen: boolean
    date: string | null
    ratePlanId: string | null
    amount: number
    originalAmount: number
  }
  
  // Bulk operations
  bulkEditMode: boolean
  selectedDates: string[]
  bulkEditAmount: number
  
  // Statistics and insights
  statistics: Record<string, PriceStatistics>
  priceGaps: Record<string, PriceGap[]>
  
  // Loading states
  loading: boolean
  statisticsLoading: boolean
  bulkOperationLoading: boolean
  error: string | null
  
  // Copy operation state
  copyOperation: {
    isActive: boolean
    sourceStartDate: string | null
    sourceEndDate: string | null
    targetStartDate: string | null
  }
}

const initialState: PriceState = {
  pricesByRatePlan: {},
  selectedPrice: null,
  
  // UI state
  calendarMode: 'calendar',
  selectedDate: null,
  selectedRatePlanIds: [],
  
  // Date filters
  dateRange: {
    startDate: null,
    endDate: null
  },
  
  // Price editing form
  priceEditForm: {
    isOpen: false,
    date: null,
    ratePlanId: null,
    amount: 0,
    originalAmount: 0
  },
  
  // Bulk operations
  bulkEditMode: false,
  selectedDates: [],
  bulkEditAmount: 0,
  
  // Statistics
  statistics: {},
  priceGaps: {},
  
  // Loading states
  loading: false,
  statisticsLoading: false,
  bulkOperationLoading: false,
  error: null,
  
  // Copy operation
  copyOperation: {
    isActive: false,
    sourceStartDate: null,
    sourceEndDate: null,
    targetStartDate: null
  }
}

const priceSlice = createSlice({
  name: 'price',
  initialState,
  reducers: {
    // UI Mode Management
    setCalendarMode: (state, action: PayloadAction<'calendar' | 'dashboard'>) => {
      state.calendarMode = action.payload
    },
    
    // Date Selection
    setSelectedDate: (state, action: PayloadAction<string | null>) => {
      state.selectedDate = action.payload
    },
    
    setDateRange: (state, action: PayloadAction<{ startDate: string | null; endDate: string | null }>) => {
      state.dateRange = action.payload
    },
    
    // Rate Plan Selection (Multi-select for comparison)
    setSelectedRatePlans: (state, action: PayloadAction<string[]>) => {
      state.selectedRatePlanIds = action.payload
    },
    
    addSelectedRatePlan: (state, action: PayloadAction<string>) => {
      if (!state.selectedRatePlanIds.includes(action.payload)) {
        state.selectedRatePlanIds.push(action.payload)
      }
    },
    
    removeSelectedRatePlan: (state, action: PayloadAction<string>) => {
      state.selectedRatePlanIds = state.selectedRatePlanIds.filter(id => id !== action.payload)
    },
    
    toggleRatePlanSelection: (state, action: PayloadAction<string>) => {
      const ratePlanId = action.payload
      if (state.selectedRatePlanIds.includes(ratePlanId)) {
        state.selectedRatePlanIds = state.selectedRatePlanIds.filter(id => id !== ratePlanId)
      } else {
        state.selectedRatePlanIds.push(ratePlanId)
      }
    },
    
    // Price Management
    setPricesForRatePlan: (state, action: PayloadAction<{ ratePlanId: string; prices: Price[] }>) => {
      state.pricesByRatePlan[action.payload.ratePlanId] = action.payload.prices
    },
    
    addPrice: (state, action: PayloadAction<Price>) => {
      const price = action.payload
      if (!state.pricesByRatePlan[price.ratePlanId]) {
        state.pricesByRatePlan[price.ratePlanId] = []
      }
      
      // Replace existing price for the same date or add new one
      const existingIndex = state.pricesByRatePlan[price.ratePlanId].findIndex(p => p.date === price.date)
      if (existingIndex !== -1) {
        state.pricesByRatePlan[price.ratePlanId][existingIndex] = price
      } else {
        state.pricesByRatePlan[price.ratePlanId].push(price)
      }
    },
    
    updatePrice: (state, action: PayloadAction<Price>) => {
      const updatedPrice = action.payload
      const ratePlanPrices = state.pricesByRatePlan[updatedPrice.ratePlanId]
      
      if (ratePlanPrices) {
        const index = ratePlanPrices.findIndex(p => p.id === updatedPrice.id)
        if (index !== -1) {
          ratePlanPrices[index] = updatedPrice
        }
      }
    },
    
    deletePrice: (state, action: PayloadAction<{ ratePlanId: string; priceId: string }>) => {
      const { ratePlanId, priceId } = action.payload
      if (state.pricesByRatePlan[ratePlanId]) {
        state.pricesByRatePlan[ratePlanId] = state.pricesByRatePlan[ratePlanId].filter(p => p.id !== priceId)
      }
    },
    
    // Price Edit Form Management
    openPriceEditForm: (state, action: PayloadAction<{ date: string; ratePlanId: string; amount?: number }>) => {
      const { date, ratePlanId, amount = 0 } = action.payload
      state.priceEditForm = {
        isOpen: true,
        date,
        ratePlanId,
        amount,
        originalAmount: amount
      }
    },
    
    closePriceEditForm: (state) => {
      state.priceEditForm = {
        isOpen: false,
        date: null,
        ratePlanId: null,
        amount: 0,
        originalAmount: 0
      }
    },
    
    updatePriceEditAmount: (state, action: PayloadAction<number>) => {
      state.priceEditForm.amount = action.payload
    },
    
    // Bulk Operations
    toggleBulkEditMode: (state) => {
      state.bulkEditMode = !state.bulkEditMode
      if (!state.bulkEditMode) {
        state.selectedDates = []
        state.bulkEditAmount = 0
      }
    },
    
    toggleDateSelection: (state, action: PayloadAction<string>) => {
      const date = action.payload
      if (state.selectedDates.includes(date)) {
        state.selectedDates = state.selectedDates.filter(d => d !== date)
      } else {
        state.selectedDates.push(date)
      }
    },
    
    clearDateSelections: (state) => {
      state.selectedDates = []
    },
    
    setBulkEditAmount: (state, action: PayloadAction<number>) => {
      state.bulkEditAmount = action.payload
    },
    
    // Statistics Management
    setStatistics: (state, action: PayloadAction<{ ratePlanId: string; statistics: PriceStatistics }>) => {
      state.statistics[action.payload.ratePlanId] = action.payload.statistics
    },
    
    setPriceGaps: (state, action: PayloadAction<{ ratePlanId: string; gaps: PriceGap[] }>) => {
      state.priceGaps[action.payload.ratePlanId] = action.payload.gaps
    },
    
    // Copy Operation Management
    startCopyOperation: (state, action: PayloadAction<{ sourceStartDate: string; sourceEndDate: string }>) => {
      state.copyOperation = {
        isActive: true,
        sourceStartDate: action.payload.sourceStartDate,
        sourceEndDate: action.payload.sourceEndDate,
        targetStartDate: null
      }
    },
    
    setCopyTargetDate: (state, action: PayloadAction<string>) => {
      state.copyOperation.targetStartDate = action.payload
    },
    
    cancelCopyOperation: (state) => {
      state.copyOperation = {
        isActive: false,
        sourceStartDate: null,
        sourceEndDate: null,
        targetStartDate: null
      }
    },
    
    // Loading States
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    
    setStatisticsLoading: (state, action: PayloadAction<boolean>) => {
      state.statisticsLoading = action.payload
    },
    
    setBulkOperationLoading: (state, action: PayloadAction<boolean>) => {
      state.bulkOperationLoading = action.payload
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
      state.statisticsLoading = false
      state.bulkOperationLoading = false
    },
    
    // Clear State
    clearPrices: (state) => {
      state.pricesByRatePlan = {}
      state.statistics = {}
      state.priceGaps = {}
      state.error = null
    }
  },
  
  extraReducers: (builder) => {
    // Fetch Prices
    builder
      .addCase(fetchPricesForRatePlan.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPricesForRatePlan.fulfilled, (state, action) => {
        const { ratePlanId, prices } = action.payload
        state.pricesByRatePlan[ratePlanId] = prices
        state.loading = false
      })
      .addCase(fetchPricesForRatePlan.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Create/Update Price
      .addCase(createOrUpdatePrice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createOrUpdatePrice.fulfilled, (state, action) => {
        const price = action.payload
        if (!state.pricesByRatePlan[price.ratePlanId]) {
          state.pricesByRatePlan[price.ratePlanId] = []
        }
        
        const existingIndex = state.pricesByRatePlan[price.ratePlanId].findIndex(p => p.date === price.date)
        if (existingIndex !== -1) {
          state.pricesByRatePlan[price.ratePlanId][existingIndex] = price
        } else {
          state.pricesByRatePlan[price.ratePlanId].push(price)
        }
        
        state.loading = false
        // Close edit form on successful save
        if (state.priceEditForm.isOpen && 
            state.priceEditForm.date === price.date && 
            state.priceEditForm.ratePlanId === price.ratePlanId) {
          state.priceEditForm.isOpen = false
        }
      })
      .addCase(createOrUpdatePrice.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Bulk Update Prices
      .addCase(bulkUpdatePrices.pending, (state) => {
        state.bulkOperationLoading = true
        state.error = null
      })
      .addCase(bulkUpdatePrices.fulfilled, (state, action) => {
        const { ratePlanId, prices } = action.payload
        if (!state.pricesByRatePlan[ratePlanId]) {
          state.pricesByRatePlan[ratePlanId] = []
        }
        
        // Update or add each price
        prices.forEach(price => {
          const existingIndex = state.pricesByRatePlan[ratePlanId].findIndex(p => p.date === price.date)
          if (existingIndex !== -1) {
            state.pricesByRatePlan[ratePlanId][existingIndex] = price
          } else {
            state.pricesByRatePlan[ratePlanId].push(price)
          }
        })
        
        state.bulkOperationLoading = false
        // Clear bulk edit selections on success
        state.selectedDates = []
        state.bulkEditAmount = 0
      })
      .addCase(bulkUpdatePrices.rejected, (state, action) => {
        state.bulkOperationLoading = false
        state.error = action.payload as string
      })
      
      // Fetch Statistics
      .addCase(fetchPriceStatistics.pending, (state) => {
        state.statisticsLoading = true
      })
      .addCase(fetchPriceStatistics.fulfilled, (state, action) => {
        const { ratePlanId, statistics } = action.payload
        state.statistics[ratePlanId] = statistics
        state.statisticsLoading = false
      })
      .addCase(fetchPriceStatistics.rejected, (state, action) => {
        state.statisticsLoading = false
        state.error = action.payload as string
      })
      
      // Fetch Price Gaps
      .addCase(fetchPriceGaps.fulfilled, (state, action) => {
        const { ratePlanId, gaps } = action.payload
        state.priceGaps[ratePlanId] = gaps
      })
      
      // Copy Prices
      .addCase(copyPrices.pending, (state) => {
        state.bulkOperationLoading = true
        state.error = null
      })
      .addCase(copyPrices.fulfilled, (state, action) => {
        const { ratePlanId, copiedPrices } = action.payload
        
        // Update prices with copied data
        copiedPrices.forEach(price => {
          if (!state.pricesByRatePlan[ratePlanId]) {
            state.pricesByRatePlan[ratePlanId] = []
          }
          
          const existingIndex = state.pricesByRatePlan[ratePlanId].findIndex(p => p.date === price.date)
          if (existingIndex !== -1) {
            state.pricesByRatePlan[ratePlanId][existingIndex] = price
          } else {
            state.pricesByRatePlan[ratePlanId].push(price)
          }
        })
        
        state.bulkOperationLoading = false
        // Clear copy operation
        state.copyOperation = {
          isActive: false,
          sourceStartDate: null,
          sourceEndDate: null,
          targetStartDate: null
        }
      })
      .addCase(copyPrices.rejected, (state, action) => {
        state.bulkOperationLoading = false
        state.error = action.payload as string
      })
  }
})

// Export actions
export const {
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
  setLoading,
  setStatisticsLoading,
  setBulkOperationLoading,
  setError,
  clearPrices
} = priceSlice.actions

// Async Thunks with API Integration

// Fetch prices for a rate plan
export const fetchPricesForRatePlan = createAsyncThunk(
  'price/fetchPricesForRatePlan',
  async (params: { ratePlanId: string; startDate?: string; endDate?: string }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()
      if (params.startDate) queryParams.append('startDate', params.startDate)
      if (params.endDate) queryParams.append('endDate', params.endDate)
      
      const response = await api.get<{ prices: Price[] }>(`/api/rate-plans/${params.ratePlanId}/prices?${queryParams}`)
      
      return {
        ratePlanId: params.ratePlanId,
        prices: response.prices || []
      }
    } catch (error: any) {
      // Serialize the error for Redux state
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to perform operation'
      return rejectWithValue(errorMessage)
    }
  }
)

// Create or update a price
export const createOrUpdatePrice = createAsyncThunk(
  'price/createOrUpdatePrice',
  async (params: { ratePlanId: string; date: string; amount: number }, { rejectWithValue }) => {
    try {
      const response = await api.post<{ price: Price }>(`/api/rate-plans/${params.ratePlanId}/prices`, {
        date: params.date,
        amount: params.amount
      })
      
      return response.price
    } catch (error: any) {
      // Serialize the error for Redux state
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to update price'
      return rejectWithValue(errorMessage)
    }
  }
)

// Bulk update prices
export const bulkUpdatePrices = createAsyncThunk(
  'price/bulkUpdatePrices',
  async (params: { ratePlanId: string; updates: BulkPriceUpdate[] }, { rejectWithValue }) => {
    try {
      const response = await api.post<{ prices: Price[] }>(`/api/rate-plans/${params.ratePlanId}/prices/bulk`, {
        updates: params.updates
      })
      
      return {
        ratePlanId: params.ratePlanId,
        prices: response.prices || []
      }
    } catch (error: any) {
      // Serialize the error for Redux state
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to perform operation'
      return rejectWithValue(errorMessage)
    }
  }
)

// Fetch price statistics
export const fetchPriceStatistics = createAsyncThunk(
  'price/fetchStatistics',
  async (params: { ratePlanId: string; startDate?: string; endDate?: string }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()
      if (params.startDate) queryParams.append('startDate', params.startDate)
      if (params.endDate) queryParams.append('endDate', params.endDate)
      
      const response = await api.get<{ statistics: PriceStatistics }>(`/api/rate-plans/${params.ratePlanId}/prices/stats?${queryParams}`)
      
      return {
        ratePlanId: params.ratePlanId,
        statistics: response.statistics
      }
    } catch (error: any) {
      // Serialize the error for Redux state
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to perform operation'
      return rejectWithValue(errorMessage)
    }
  }
)

// Fetch price gaps
export const fetchPriceGaps = createAsyncThunk(
  'price/fetchPriceGaps',
  async (params: { ratePlanId: string; startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      const response = await api.get<{ gaps: PriceGap[] }>(`/api/rate-plans/${params.ratePlanId}/prices/gaps?startDate=${params.startDate}&endDate=${params.endDate}`)
      
      return {
        ratePlanId: params.ratePlanId,
        gaps: response.gaps || []
      }
    } catch (error: any) {
      // Serialize the error for Redux state
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to perform operation'
      return rejectWithValue(errorMessage)
    }
  }
)

// Copy prices from one date range to another
export const copyPrices = createAsyncThunk(
  'price/copyPrices',
  async (params: { ratePlanId: string; sourceStartDate: string; sourceEndDate: string; targetStartDate: string }, { rejectWithValue }) => {
    try {
      const response = await api.post<{ copiedCount: number }>(`/api/rate-plans/${params.ratePlanId}/prices/copy`, {
        sourceStartDate: params.sourceStartDate,
        sourceEndDate: params.sourceEndDate,
        targetStartDate: params.targetStartDate
      })
      
      // Fetch updated prices after copy operation
      const updatedPricesResponse = await api.get<{ prices: Price[] }>(`/api/rate-plans/${params.ratePlanId}/prices`)
      
      return {
        ratePlanId: params.ratePlanId,
        copiedPrices: updatedPricesResponse.prices || [],
        copiedCount: response.copiedCount
      }
    } catch (error: any) {
      // Serialize the error for Redux state
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to perform operation'
      return rejectWithValue(errorMessage)
    }
  }
)

// Delete price
export const deletePriceAsync = createAsyncThunk(
  'price/deletePrice',
  async (params: { priceId: string; ratePlanId: string }, { rejectWithValue }) => {
    try {
      await api.delete(`/api/prices/${params.priceId}`)
      return params
    } catch (error: any) {
      // Serialize the error for Redux state
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to perform operation'
      return rejectWithValue(errorMessage)
    }
  }
)

// Export types
export type { Price, PriceStatistics, PriceGap, BulkPriceUpdate }

export default priceSlice.reducer