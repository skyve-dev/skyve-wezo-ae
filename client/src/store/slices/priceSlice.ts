import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '@/utils/api'

interface PropertyPricing {
  id: string
  propertyId: string
  // Full day prices for each day of the week
  priceMonday: number
  priceTuesday: number
  priceWednesday: number
  priceThursday: number
  priceFriday: number
  priceSaturday: number
  priceSunday: number
  // Half day prices
  halfDayPriceMonday: number
  halfDayPriceTuesday: number
  halfDayPriceWednesday: number
  halfDayPriceThursday: number
  halfDayPriceFriday: number
  halfDayPriceSaturday: number
  halfDayPriceSunday: number
  currency: string
  createdAt: string
  updatedAt: string
}

interface DatePriceOverride {
  id: string
  propertyId: string
  date: string  // ISO date string
  price: number
  halfDayPrice?: number
  reason?: string
  createdAt: string
  updatedAt: string
}

interface PricingCalendarDay {
  date: string
  fullDayPrice: number
  halfDayPrice: number
  isOverride: boolean
  reason?: string
  dayOfWeek: string
}

interface PriceState {
  // Property base pricing (weekly rates)
  propertyPricing: PropertyPricing | null
  
  // Date-specific overrides for base pricing
  dateOverrides: DatePriceOverride[]
  
  // Pricing calendar data (combined weekly + overrides)
  pricingCalendar: PricingCalendarDay[]
  
  // Public pricing calendar data for display (date string as key)
  publicPricingCalendar: Record<string, {
    fullDayPrice: number
    halfDayPrice: number
    currency: string
    isOverride?: boolean
    hasDiscount?: boolean
    originalPrice?: number
    isAvailable?: boolean
  }>
  
  // Date override editing form
  dateOverrideForm: {
    isOpen: boolean
    date: string | null
    price: number
    halfDayPrice: number
    reason: string
    originalOverride: DatePriceOverride | null
    bulkMode: boolean
    selectedDates: string[]
  }
  
  // UI state for Calendar mode
  calendarMode: 'calendar' | 'dashboard'
  selectedDate: string | null
  selectedRatePlanIds: string[] // Keep for UI display purposes only
  
  // Date range filters
  dateRange: {
    startDate: string | null
    endDate: string | null
  }
  
  // Bulk operations
  bulkEditMode: boolean
  selectedDates: string[]
  
  // Loading states
  loading: boolean
  bulkOperationLoading: boolean
  error: string | null
}

const initialState: PriceState = {
  propertyPricing: null,
  dateOverrides: [],
  pricingCalendar: [],
  publicPricingCalendar: {},
  
  // Date override form
  dateOverrideForm: {
    isOpen: false,
    date: null,
    price: 0,
    halfDayPrice: 0,
    reason: '',
    originalOverride: null,
    bulkMode: false,
    selectedDates: []
  },
  
  // UI state
  calendarMode: 'calendar',
  selectedDate: null,
  selectedRatePlanIds: [],
  
  // Date filters
  dateRange: {
    startDate: null,
    endDate: null
  },
  
  // Bulk operations
  bulkEditMode: false,
  selectedDates: [],
  
  // Loading states
  loading: false,
  bulkOperationLoading: false,
  error: null
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
    
    // Rate Plan Selection (for UI display only - no pricing functionality)
    setSelectedRatePlans: (state, action: PayloadAction<string[]>) => {
      state.selectedRatePlanIds = action.payload
    },
    
    // Bulk Operations
    toggleBulkEditMode: (state) => {
      state.bulkEditMode = !state.bulkEditMode
      if (!state.bulkEditMode) {
        state.selectedDates = []
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
    
    // Loading States
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    
    setBulkOperationLoading: (state, action: PayloadAction<boolean>) => {
      state.bulkOperationLoading = action.payload
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
      state.bulkOperationLoading = false
    },
    
    // Clear State
    clearPrices: (state) => {
      state.dateOverrides = []
      state.pricingCalendar = []
      state.error = null
    },
    
    clearRefreshTrigger: () => {
      // No longer needed - removed needsRefresh state
    },
    
    // Date Override Management
    openDateOverrideForm: (state, action: PayloadAction<{ 
      date: string; 
      existingOverride?: DatePriceOverride; 
      bulkMode?: boolean;
      selectedDates?: string[];
    }>) => {
      const { date, existingOverride, bulkMode = false, selectedDates = [] } = action.payload
      
      if (existingOverride) {
        // Edit existing override
        state.dateOverrideForm = {
          isOpen: true,
          date,
          price: existingOverride.price,
          halfDayPrice: existingOverride.halfDayPrice || 0,
          reason: existingOverride.reason || '',
          originalOverride: existingOverride,
          bulkMode,
          selectedDates
        }
      } else {
        // Create new override - use weekly pricing as default
        const dayOfWeek = new Date(date).getDay()
        const dayMap = {
          0: 'Sunday',
          1: 'Monday', 
          2: 'Tuesday',
          3: 'Wednesday',
          4: 'Thursday',
          5: 'Friday',
          6: 'Saturday'
        }
        
        let defaultPrice = 0
        let defaultHalfDayPrice = 0
        
        if (state.propertyPricing) {
          const dayName = dayMap[dayOfWeek as keyof typeof dayMap]
          defaultPrice = state.propertyPricing[`price${dayName}` as keyof PropertyPricing] as number || 0
          defaultHalfDayPrice = state.propertyPricing[`halfDayPrice${dayName}` as keyof PropertyPricing] as number || 0
        }
        
        state.dateOverrideForm = {
          isOpen: true,
          date,
          price: defaultPrice,
          halfDayPrice: defaultHalfDayPrice,
          reason: '',
          originalOverride: null,
          bulkMode,
          selectedDates
        }
      }
    },
    
    closeDateOverrideForm: (state) => {
      state.dateOverrideForm = {
        isOpen: false,
        date: null,
        price: 0,
        halfDayPrice: 0,
        reason: '',
        originalOverride: null,
        bulkMode: false,
        selectedDates: []
      }
    },
    
    updateDateOverrideForm: (state, action: PayloadAction<Partial<{ price: number; halfDayPrice: number; reason: string }>>) => {
      state.dateOverrideForm = {
        ...state.dateOverrideForm,
        ...action.payload
      }
    },
    
    setDateOverrides: (state, action: PayloadAction<DatePriceOverride[]>) => {
      state.dateOverrides = action.payload
    },
    
    setPricingCalendar: (state, action: PayloadAction<PricingCalendarDay[]>) => {
      state.pricingCalendar = action.payload
    }
  },
  
  extraReducers: (builder) => {
    // Fetch PropertyPricing
    builder
      .addCase(fetchPropertyPricing.pending, (state) => {
        console.log('🔷 priceSlice - fetchPropertyPricing.pending')
        state.loading = true
        state.error = null
      })
      .addCase(fetchPropertyPricing.fulfilled, (state, action) => {
        console.log('🔷 priceSlice - fetchPropertyPricing.fulfilled with payload:', action.payload)
        state.loading = false
        state.propertyPricing = action.payload
        state.error = null
      })
      .addCase(fetchPropertyPricing.rejected, (state, action) => {
        console.log('🔷 priceSlice - fetchPropertyPricing.rejected:', action.payload)
        state.loading = false
        state.propertyPricing = null
        state.error = action.payload as string
      })
      
      // Fetch Pricing Calendar
      .addCase(fetchPricingCalendar.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPricingCalendar.fulfilled, (state, action) => {
        state.pricingCalendar = action.payload
        state.loading = false
      })
      .addCase(fetchPricingCalendar.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Save Date Override
      .addCase(saveDateOverride.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(saveDateOverride.fulfilled, (state, action) => {
        // Update local overrides with the saved data
        const savedOverrides = action.payload
        if (savedOverrides.length > 0) {
          const savedOverride = savedOverrides[0]
          const existingIndex = state.dateOverrides.findIndex(o => o.date === savedOverride.date)
          
          if (existingIndex !== -1) {
            state.dateOverrides[existingIndex] = savedOverride
          } else {
            state.dateOverrides.push(savedOverride)
          }
        }
        
        // Close the form
        state.dateOverrideForm.isOpen = false
        state.loading = false
      })
      .addCase(saveDateOverride.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Delete Date Overrides
      .addCase(deleteDateOverrides.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteDateOverrides.fulfilled, (state, action) => {
        // Remove deleted dates from local overrides
        const deletedDates = action.payload
        state.dateOverrides = state.dateOverrides.filter(
          override => !deletedDates.includes(override.date)
        )
        state.loading = false
      })
      .addCase(deleteDateOverrides.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Fetch Public Pricing Calendar
      .addCase(fetchPublicPricingCalendar.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPublicPricingCalendar.fulfilled, (state, action) => {
        state.publicPricingCalendar = action.payload
        state.loading = false
      })
      .addCase(fetchPublicPricingCalendar.rejected, (state, action) => {
        state.loading = false
        state.publicPricingCalendar = {}
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
  toggleBulkEditMode,
  toggleDateSelection,
  clearDateSelections,
  setLoading,
  setBulkOperationLoading,
  setError,
  clearPrices,
  clearRefreshTrigger,
  openDateOverrideForm,
  closeDateOverrideForm,
  updateDateOverrideForm,
  setDateOverrides,
  setPricingCalendar
} = priceSlice.actions

// Async Thunks with API Integration

// Fetch PropertyPricing base weekly rates for a property
export const fetchPropertyPricing = createAsyncThunk(
  'price/fetchPropertyPricing',
  async (propertyId: string, { rejectWithValue }) => {
    console.log('🔷 fetchPropertyPricing THUNK called for propertyId:', propertyId)
    try {
      const response = await api.get<{ pricing: any }>(`/api/properties/${propertyId}/pricing/weekly`)
      console.log('🔷 fetchPropertyPricing API RESPONSE:', response)
      
      // Transform server format to client format
      const serverPricing = response.pricing
      if (!serverPricing || !serverPricing.fullDay) {
        throw new Error('Invalid pricing data structure from server')
      }
      
      const transformedPricing: PropertyPricing = {
        id: serverPricing.id,
        propertyId: serverPricing.propertyId,
        priceMonday: serverPricing.fullDay.monday,
        priceTuesday: serverPricing.fullDay.tuesday,
        priceWednesday: serverPricing.fullDay.wednesday,
        priceThursday: serverPricing.fullDay.thursday,
        priceFriday: serverPricing.fullDay.friday,
        priceSaturday: serverPricing.fullDay.saturday,
        priceSunday: serverPricing.fullDay.sunday,
        halfDayPriceMonday: serverPricing.halfDay?.monday || 0,
        halfDayPriceTuesday: serverPricing.halfDay?.tuesday || 0,
        halfDayPriceWednesday: serverPricing.halfDay?.wednesday || 0,
        halfDayPriceThursday: serverPricing.halfDay?.thursday || 0,
        halfDayPriceFriday: serverPricing.halfDay?.friday || 0,
        halfDayPriceSaturday: serverPricing.halfDay?.saturday || 0,
        halfDayPriceSunday: serverPricing.halfDay?.sunday || 0,
        currency: serverPricing.currency || 'AED',
        createdAt: serverPricing.createdAt || '',
        updatedAt: serverPricing.updatedAt || ''
      }
      
      console.log('🔷 fetchPropertyPricing TRANSFORMED pricing:', transformedPricing)
      
      return transformedPricing
    } catch (error: any) {
      console.log('🔷 fetchPropertyPricing ERROR:', error)
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to fetch property pricing'
      return rejectWithValue(errorMessage)
    }
  }
)

// Fetch pricing calendar with date overrides
export const fetchPricingCalendar = createAsyncThunk(
  'price/fetchPricingCalendar',
  async (params: { propertyId: string; startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        startDate: params.startDate,
        endDate: params.endDate
      })
      
      const response = await api.get<{ calendar: PricingCalendarDay[] }>(
        `/api/properties/${params.propertyId}/pricing/calendar?${queryParams}`
      )
      
      return response.calendar || []
    } catch (error: any) {
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to fetch pricing calendar'
      return rejectWithValue(errorMessage)
    }
  }
)

// Create or update date override
export const saveDateOverride = createAsyncThunk(
  'price/saveDateOverride',
  async (params: { propertyId: string; override: { date: string; price: number; halfDayPrice?: number; reason?: string } }, { rejectWithValue }) => {
    try {
      const response = await api.post<{ overrides: DatePriceOverride[] }>(
        `/api/properties/${params.propertyId}/pricing/overrides`,
        {
          overrides: [{
            date: params.override.date,
            price: params.override.price,
            halfDayPrice: params.override.halfDayPrice,
            reason: params.override.reason
          }]
        }
      )
      
      return response.overrides || []
    } catch (error: any) {
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to save date override'
      return rejectWithValue(errorMessage)
    }
  }
)

// Delete date overrides
export const deleteDateOverrides = createAsyncThunk(
  'price/deleteDateOverrides',
  async (params: { propertyId: string; dates: string[] }, { rejectWithValue }) => {
    try {
      await api.delete(`/api/properties/${params.propertyId}/pricing/overrides`, { dates: params.dates })
      
      return params.dates
    } catch (error: any) {
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to delete date overrides'
      return rejectWithValue(errorMessage)
    }
  }
)

// Fetch public pricing calendar (no authentication required)
export const fetchPublicPricingCalendar = createAsyncThunk(
  'price/fetchPublicPricingCalendar',
  async (params: { propertyId: string; startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        startDate: params.startDate,
        endDate: params.endDate
      })
      
      const response = await api.get<{ 
        calendar: Record<string, {
          fullDayPrice: number
          halfDayPrice: number
          currency: string
          isOverride?: boolean
          hasDiscount?: boolean
          originalPrice?: number
          isAvailable?: boolean
        }>
      }>(
        `/api/properties/${params.propertyId}/pricing/public-calendar?${queryParams}`
      )
      
      // Transform the calendar object to match our PriceInfo interface
      return response.calendar || {}
    } catch (error: any) {
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to fetch public pricing calendar'
      return rejectWithValue(errorMessage)
    }
  }
)

// NOTE: Removed all rate plan pricing related thunks:
// - fetchPricesForRatePlan
// - createOrUpdatePrice
// - bulkUpdatePrices
// - fetchPriceStatistics
// - fetchPriceGaps
// - copyPrices
// - deletePriceAsync

// Export types
export type { DatePriceOverride, PricingCalendarDay }

export default priceSlice.reducer