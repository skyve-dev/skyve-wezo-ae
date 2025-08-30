import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { api } from '../../utils/api'

// Types
export interface RatePlan {
  id: string
  name: string
  type: 'flexible' | 'non-refundable' | 'advance-purchase' | 'last-minute'
  description: string
  cancellationPolicy: {
    daysBeforeFreeCancel: number
    refundPercentage: number
    noShowPolicy: 'no-refund' | 'partial-refund' | 'full-refund'
  }
  bookingRestrictions: {
    minimumStay: number
    maximumStay?: number
    advanceBookingDays: number
    cutoffHours: number
    checkInDays: number[] // 0=Sunday, 1=Monday, etc.
    checkOutDays: number[]
  }
  inclusions: string[]
  isActive: boolean
  priority: number
  createdAt: string
  updatedAt: string
}

export interface AvailabilitySlot {
  id: string
  propertyId: string
  date: string // YYYY-MM-DD format
  status: 'available' | 'blocked' | 'booked' | 'maintenance'
  blockReason?: string
  ratePlans: {
    ratePlanId: string
    basePrice: number
    discountPercent?: number
    finalPrice: number
    currency: string
    isAvailable: boolean
  }[]
  minimumStay: number
  maximumStay?: number
  availableUnits: number
  totalUnits: number
  lastUpdated: string
}

export interface CalendarMonth {
  year: number
  month: number // 1-based (1=January)
  days: AvailabilitySlot[]
}

export interface BulkPriceUpdate {
  propertyId?: string
  ratePlanId?: string
  dateRange: {
    start: string
    end: string
  }
  priceChange: {
    type: 'fixed' | 'percentage' | 'increase' | 'decrease'
    amount: number
  }
  applyToWeekends?: boolean
  applyToWeekdays?: boolean
  excludeDates?: string[]
}

export interface BulkAvailabilityUpdate {
  propertyId?: string
  dateRange: {
    start: string
    end: string
  }
  action: 'block' | 'unblock' | 'set-available'
  reason?: string
  affectedDays?: number[] // 0=Sunday, 1=Monday, etc.
  excludeDates?: string[]
}

export interface AvailabilityState {
  ratePlans: RatePlan[]
  currentRatePlan: RatePlan | null
  calendar: {
    [propertyId: string]: CalendarMonth[]
  }
  currentPropertyId: string | null
  currentMonth: { year: number; month: number }
  viewMode: 'calendar' | 'list'
  loading: boolean
  error: string | null
  filters: {
    status: string | null
    ratePlanId: string | null
    dateRange: {
      start: string | null
      end: string | null
    }
  }
  bulkOperation: {
    isOpen: boolean
    type: 'price' | 'availability' | null
    selectedDates: string[]
  }
}

const initialState: AvailabilityState = {
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
}

// Async thunks
export const fetchRatePlans = createAsyncThunk(
  'availability/fetchRatePlans',
  async (propertyId: string, { rejectWithValue }) => {
    try {
      const response = await api.get<{ ratePlans: RatePlan[] }>(`/api/properties/${propertyId}/rate-plans`)
      return response.ratePlans
    } catch (error: any) {
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to fetch rate plans'
      return rejectWithValue(errorMessage)
    }
  }
)

export const createRatePlan = createAsyncThunk(
  'availability/createRatePlan',
  async ({ propertyId, ratePlanData }: { propertyId: string; ratePlanData: Omit<RatePlan, 'id' | 'createdAt' | 'updatedAt'> }, { rejectWithValue }) => {
    try {
      const response = await api.post<{ ratePlan: RatePlan }>(`/api/properties/${propertyId}/rate-plans`, ratePlanData)
      return response.ratePlan
    } catch (error: any) {
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to create rate plan'
      return rejectWithValue(errorMessage)
    }
  }
)

export const updateRatePlan = createAsyncThunk(
  'availability/updateRatePlan',
  async ({ propertyId, ratePlanId, updates }: { propertyId: string; ratePlanId: string; updates: Partial<RatePlan> }, { rejectWithValue }) => {
    try {
      const response = await api.patch<{ ratePlan: RatePlan }>(`/api/properties/${propertyId}/rate-plans/${ratePlanId}`, updates)
      return response.ratePlan
    } catch (error: any) {
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to update rate plan'
      return rejectWithValue(errorMessage)
    }
  }
)

export const deleteRatePlan = createAsyncThunk(
  'availability/deleteRatePlan',
  async ({ propertyId, ratePlanId }: { propertyId: string; ratePlanId: string }, { rejectWithValue }) => {
    try {
      await api.delete(`/api/properties/${propertyId}/rate-plans/${ratePlanId}`)
      return ratePlanId
    } catch (error: any) {
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to delete rate plan'
      return rejectWithValue(errorMessage)
    }
  }
)

export const fetchAvailability = createAsyncThunk(
  'availability/fetchAvailability',
  async ({ propertyId, year, month, months = 3 }: { propertyId: string; year: number; month: number; months?: number }, { rejectWithValue }) => {
    try {
      // Convert year/month/months to startDate/endDate format for API
      const startDate = new Date(year, month - 1, 1) // month is 1-based, Date constructor expects 0-based
      const endDate = new Date(year, month - 1 + months, 0) // Get last day of the end month
      
      const params = new URLSearchParams()
      params.append('startDate', startDate.toISOString().split('T')[0])
      params.append('endDate', endDate.toISOString().split('T')[0])
      
      
      // API returns { propertyId, startDate, endDate, availability: Availability[] }
      const response = await api.get<{ 
        propertyId: string
        startDate: string 
        endDate: string
        availability: Array<{
          id: string
          propertyId: string
          date: string
          isAvailable: boolean
          createdAt: string
          updatedAt: string
        }>
      }>(`/api/properties/${propertyId}/availability?${params}`)
      
      
      // Transform backend data to frontend structure
      const transformedData = transformAvailabilityData(response.availability, year, month, months, propertyId)
      
      return { propertyId, availability: transformedData }
    } catch (error: any) {
      console.error('❌ Redux - fetchAvailability error:', error)
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to fetch availability'
      return rejectWithValue(errorMessage)
    }
  }
)

export const fetchPublicAvailability = createAsyncThunk(
  'availability/fetchPublicAvailability',
  async ({ propertyId, startDate, endDate }: { propertyId: string; startDate?: string; endDate?: string }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      
      const response = await api.get<{ 
        propertyId: string
        startDate: string 
        endDate: string
        availability: Array<{
          date: string
          isAvailable: boolean
        }>
      }>(`/api/properties/${propertyId}/availability/public${params.toString() ? `?${params}` : ''}`)
      
      return { propertyId, availability: response.availability }
    } catch (error: any) {
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to fetch public availability'
      return rejectWithValue(errorMessage)
    }
  }
)

export const checkBookingAvailability = createAsyncThunk(
  'availability/checkBookingAvailability',
  async (params: { propertyId: string; checkInDate: string; checkOutDate: string; numGuests: number }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/properties/${params.propertyId}/availability/check`, {
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        numGuests: params.numGuests
      })
      return response
    } catch (error: any) {
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to check booking availability'
      return rejectWithValue(errorMessage)
    }
  }
)

export const updateAvailability = createAsyncThunk(
  'availability/updateAvailability',
  async ({ 
    propertyId, 
    date, 
    updates 
  }: { 
    propertyId: string
    date: string
    updates: Partial<AvailabilitySlot> 
  }, { rejectWithValue }) => {
    try {
      const response = await api.patch<{ availability: AvailabilitySlot }>(`/api/properties/${propertyId}/availability/${date}`, updates)
      return { propertyId, availability: response.availability }
    } catch (error: any) {
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to update availability'
      return rejectWithValue(errorMessage)
    }
  }
)

export const bulkUpdatePrices = createAsyncThunk(
  'availability/bulkUpdatePrices',
  async (bulkUpdate: BulkPriceUpdate, { rejectWithValue }) => {
    try {
      const response = await api.post<{ updatedSlots: AvailabilitySlot[] }>('/api/availability/bulk-update-prices', bulkUpdate)
      return { propertyId: bulkUpdate.propertyId, updatedSlots: response.updatedSlots }
    } catch (error: any) {
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to bulk update prices'
      return rejectWithValue(errorMessage)
    }
  }
)

export const bulkUpdateAvailability = createAsyncThunk(
  'availability/bulkUpdateAvailability',
  async (bulkUpdate: BulkAvailabilityUpdate, { rejectWithValue }) => {
    try {
      const response = await api.post<{ updatedSlots: AvailabilitySlot[] }>('/api/availability/bulk-update-availability', bulkUpdate)
      return { propertyId: bulkUpdate.propertyId, updatedSlots: response.updatedSlots }
    } catch (error: any) {
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to bulk update availability'
      return rejectWithValue(errorMessage)
    }
  }
)

export const blockDates = createAsyncThunk(
  'availability/blockDates',
  async ({ 
    propertyId, 
    dates, 
    reason 
  }: { 
    propertyId: string
    dates: string[]
    reason?: string 
  }, { rejectWithValue }) => {
    try {
      
      // Use bulk update API to set isAvailable: false
      const updates = dates.map(date => ({
        date,
        isAvailable: false,
        reason: reason || 'Blocked by host'
      }))
      
      await api.put<{ 
        message: string
        updated: number
        failed: any[]
      }>(`/api/properties/${propertyId}/availability/bulk`, {
        updates
      })
      
      
      // Transform successful updates back to AvailabilitySlot format for state update
      const updatedSlots: AvailabilitySlot[] = dates.map(date => ({
        id: `blocked-${date}`,
        propertyId,
        date,
        status: 'blocked' as const,
        blockReason: reason || 'Blocked by host',
        ratePlans: [],
        minimumStay: 1,
        availableUnits: 0,
        totalUnits: 1,
        lastUpdated: new Date().toISOString()
      }))
      
      return { propertyId, updatedSlots }
    } catch (error: any) {
      console.error('❌ Redux - blockDates error:', error)
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to block dates'
      return rejectWithValue(errorMessage)
    }
  }
)

export const unblockDates = createAsyncThunk(
  'availability/unblockDates',
  async ({ propertyId, dates }: { propertyId: string; dates: string[] }, { rejectWithValue }) => {
    try {
      
      // Use bulk update API to set isAvailable: true
      const updates = dates.map(date => ({
        date,
        isAvailable: true
      }))
      
      await api.put<{ 
        message: string
        updated: number
        failed: any[]
      }>(`/api/properties/${propertyId}/availability/bulk`, {
        updates
      })
      
      
      // Transform successful updates back to AvailabilitySlot format for state update
      const updatedSlots: AvailabilitySlot[] = dates.map(date => ({
        id: `available-${date}`,
        propertyId,
        date,
        status: 'available' as const,
        blockReason: undefined,
        ratePlans: [],
        minimumStay: 1,
        availableUnits: 1,
        totalUnits: 1,
        lastUpdated: new Date().toISOString()
      }))
      
      return { propertyId, updatedSlots }
    } catch (error: any) {
      console.error('❌ Redux - unblockDates error:', error)
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to unblock dates'
      return rejectWithValue(errorMessage)
    }
  }
)

export const syncExternalCalendar = createAsyncThunk(
  'availability/syncExternalCalendar',
  async ({ propertyId, calendarUrl }: { propertyId: string; calendarUrl: string }, { rejectWithValue }) => {
    try {
      const response = await api.post<{ syncedSlots: AvailabilitySlot[]; syncStats: any }>(`/api/properties/${propertyId}/availability/sync-external`, {
        calendarUrl
      })
      return { propertyId, syncedSlots: response.syncedSlots, syncStats: response.syncStats }
    } catch (error: any) {
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to sync external calendar'
      return rejectWithValue(errorMessage)
    }
  }
)

// Transform backend Availability data to frontend CalendarMonth structure
const transformAvailabilityData = (
  backendData: Array<{
    id: string
    propertyId: string
    date: string
    isAvailable: boolean
    createdAt: string
    updatedAt: string
  }>, 
  year: number, 
  month: number, 
  months: number,
  fallbackPropertyId?: string
): CalendarMonth[] => {
  
  const calendarMonths: CalendarMonth[] = []
  
  // Get propertyId from first backend item or use fallback
  const propertyId = backendData.length > 0 ? backendData[0].propertyId : (fallbackPropertyId || '')
  
  // Generate all months needed
  for (let monthOffset = 0; monthOffset < months; monthOffset++) {
    const currentDate = new Date(year, month - 1 + monthOffset, 1)
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1
    
    // Get all dates in this month
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
    const days: AvailabilitySlot[] = []
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      
      // Find backend data for this date
      const backendAvailability = backendData.find(item => 
        item.date.startsWith(dateString) || item.date === dateString
      )
      
      // Transform to frontend format
      const availabilitySlot: AvailabilitySlot = {
        id: backendAvailability?.id || `temp-${dateString}`,
        propertyId: propertyId, // Always ensure propertyId is set
        date: dateString,
        status: backendAvailability?.isAvailable !== false ? 'available' : 'blocked',
        blockReason: backendAvailability?.isAvailable === false ? 'Blocked by host' : undefined,
        ratePlans: [], // Empty for now, can be populated later if needed
        minimumStay: 1,
        maximumStay: undefined,
        availableUnits: 1,
        totalUnits: 1,
        lastUpdated: backendAvailability?.updatedAt || new Date().toISOString()
      }
      
      days.push(availabilitySlot)
    }
    
    calendarMonths.push({
      year: currentYear,
      month: currentMonth,
      days
    })
  }
  
  
  return calendarMonths
}

// Helper function to update calendar data
const updateCalendarSlots = (calendar: CalendarMonth[], updatedSlots: AvailabilitySlot[]) => {
  return calendar.map(month => ({
    ...month,
    days: month.days.map(day => {
      const updatedSlot = updatedSlots.find(slot => slot.date === day.date)
      return updatedSlot || day
    })
  }))
}

const availabilitySlice = createSlice({
  name: 'availability',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentRatePlan: (state, action: PayloadAction<RatePlan | null>) => {
      state.currentRatePlan = action.payload
    },
    setCurrentPropertyId: (state, action: PayloadAction<string | null>) => {
      state.currentPropertyId = action.payload
      // Clear calendar when switching properties
      if (action.payload && !state.calendar[action.payload]) {
        state.calendar[action.payload] = []
      }
    },
    setCurrentMonth: (state, action: PayloadAction<{ year: number; month: number }>) => {
      state.currentMonth = action.payload
    },
    setViewMode: (state, action: PayloadAction<'calendar' | 'list'>) => {
      state.viewMode = action.payload
    },
    updateFilters: (state, action: PayloadAction<Partial<AvailabilityState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        status: null,
        ratePlanId: null,
        dateRange: { start: null, end: null }
      }
    },
    toggleBulkOperation: (state, action: PayloadAction<{ type?: 'price' | 'availability'; isOpen: boolean }>) => {
      state.bulkOperation = {
        ...state.bulkOperation,
        ...action.payload,
        selectedDates: action.payload.isOpen ? state.bulkOperation.selectedDates : []
      }
    },
    toggleDateSelection: (state, action: PayloadAction<string>) => {
      const date = action.payload
      const index = state.bulkOperation.selectedDates.indexOf(date)
      
      if (index === -1) {
        state.bulkOperation.selectedDates.push(date)
      } else {
        state.bulkOperation.selectedDates.splice(index, 1)
      }
    },
    clearDateSelection: (state) => {
      state.bulkOperation.selectedDates = []
    },
    selectDateRange: (state, action: PayloadAction<{ start: string; end: string }>) => {
      const { start, end } = action.payload
      const startDate = new Date(start)
      const endDate = new Date(end)
      const dates: string[] = []
      
      const currentDate = new Date(startDate)
      while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().split('T')[0])
        currentDate.setDate(currentDate.getDate() + 1)
      }
      
      state.bulkOperation.selectedDates = dates
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch rate plans
      .addCase(fetchRatePlans.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRatePlans.fulfilled, (state, action) => {
        state.loading = false
        state.ratePlans = action.payload
        // Set first rate plan as current if none selected
        if (!state.currentRatePlan && action.payload.length > 0) {
          state.currentRatePlan = action.payload[0]
        }
      })
      .addCase(fetchRatePlans.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Create rate plan
      .addCase(createRatePlan.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createRatePlan.fulfilled, (state, action) => {
        state.loading = false
        state.ratePlans.push(action.payload)
      })
      .addCase(createRatePlan.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Update rate plan
      .addCase(updateRatePlan.fulfilled, (state, action) => {
        const index = state.ratePlans.findIndex(rp => rp.id === action.payload.id)
        if (index !== -1) {
          state.ratePlans[index] = action.payload
        }
        if (state.currentRatePlan?.id === action.payload.id) {
          state.currentRatePlan = action.payload
        }
      })
      
      // Delete rate plan
      .addCase(deleteRatePlan.fulfilled, (state, action) => {
        state.ratePlans = state.ratePlans.filter(rp => rp.id !== action.payload)
        if (state.currentRatePlan?.id === action.payload) {
          state.currentRatePlan = state.ratePlans[0] || null
        }
      })
      
      // Fetch availability
      .addCase(fetchAvailability.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAvailability.fulfilled, (state, action) => {
        state.loading = false
        const { propertyId, availability } = action.payload
        state.calendar[propertyId] = availability
      })
      .addCase(fetchAvailability.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Fetch public availability
      .addCase(fetchPublicAvailability.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPublicAvailability.fulfilled, (state, action) => {
        state.loading = false
        const { propertyId } = action.payload
        // For public availability, we'll store the raw data since we don't need the full calendar transformation
        state.calendar[propertyId] = state.calendar[propertyId] || []
      })
      .addCase(fetchPublicAvailability.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Check booking availability
      .addCase(checkBookingAvailability.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(checkBookingAvailability.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(checkBookingAvailability.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Update availability
      .addCase(updateAvailability.fulfilled, (state, action) => {
        const { propertyId, availability } = action.payload
        if (state.calendar[propertyId]) {
          state.calendar[propertyId] = updateCalendarSlots(state.calendar[propertyId], [availability])
        }
      })
      
      // Bulk update prices
      .addCase(bulkUpdatePrices.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(bulkUpdatePrices.fulfilled, (state, action) => {
        state.loading = false
        const { propertyId, updatedSlots } = action.payload
        if (propertyId && state.calendar[propertyId]) {
          state.calendar[propertyId] = updateCalendarSlots(state.calendar[propertyId], updatedSlots)
        }
        // Clear selection after successful bulk operation
        state.bulkOperation.selectedDates = []
        state.bulkOperation.isOpen = false
      })
      .addCase(bulkUpdatePrices.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Bulk update availability
      .addCase(bulkUpdateAvailability.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(bulkUpdateAvailability.fulfilled, (state, action) => {
        state.loading = false
        const { propertyId, updatedSlots } = action.payload
        if (propertyId && state.calendar[propertyId]) {
          state.calendar[propertyId] = updateCalendarSlots(state.calendar[propertyId], updatedSlots)
        }
        // Clear selection after successful bulk operation
        state.bulkOperation.selectedDates = []
        state.bulkOperation.isOpen = false
      })
      .addCase(bulkUpdateAvailability.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Block dates
      .addCase(blockDates.fulfilled, (state, action) => {
        const { propertyId, updatedSlots } = action.payload
        if (state.calendar[propertyId]) {
          state.calendar[propertyId] = updateCalendarSlots(state.calendar[propertyId], updatedSlots)
        }
      })
      
      // Unblock dates
      .addCase(unblockDates.fulfilled, (state, action) => {
        const { propertyId, updatedSlots } = action.payload
        if (state.calendar[propertyId]) {
          state.calendar[propertyId] = updateCalendarSlots(state.calendar[propertyId], updatedSlots)
        }
      })
      
      // Sync external calendar
      .addCase(syncExternalCalendar.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(syncExternalCalendar.fulfilled, (state, action) => {
        state.loading = false
        const { propertyId, syncedSlots } = action.payload
        if (state.calendar[propertyId]) {
          state.calendar[propertyId] = updateCalendarSlots(state.calendar[propertyId], syncedSlots)
        }
      })
      .addCase(syncExternalCalendar.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const {
  clearError,
  setCurrentRatePlan,
  setCurrentPropertyId,
  setCurrentMonth,
  setViewMode,
  updateFilters,
  clearFilters,
  toggleBulkOperation,
  toggleDateSelection,
  clearDateSelection,
  selectDateRange
} = availabilitySlice.actions

export default availabilitySlice.reducer