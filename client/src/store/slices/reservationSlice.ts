import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { api } from '../../utils/api'

// Types
export interface Reservation {
  id: string
  propertyId: string
  propertyName: string
  guestName: string
  guestEmail: string
  guestPhone?: string
  checkIn: string
  checkOut: string
  numberOfGuests: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show'
  totalAmount: number
  currency: string
  specialRequests?: string
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed'
  bookingReference: string
  createdAt: string
  updatedAt: string
}

export interface ReservationModification {
  reservationId: string
  newCheckIn?: string
  newCheckOut?: string
  newNumberOfGuests?: number
  newTotalAmount?: number
  reason?: string
}

export interface ReservationState {
  reservations: Reservation[]
  currentReservation: Reservation | null
  loading: boolean
  error: string | null
  stats: {
    total: number
    confirmed: number
    pending: number
    completed: number
    cancelled: number
  }
  filters: {
    status: string
    dateRange: {
      start: string | null
      end: string | null
    }
    propertyId: string | null
  }
}

const initialState: ReservationState = {
  reservations: [],
  currentReservation: null,
  loading: false,
  error: null,
  stats: {
    total: 0,
    confirmed: 0,
    pending: 0,
    completed: 0,
    cancelled: 0
  },
  filters: {
    status: 'all',
    dateRange: {
      start: null,
      end: null
    },
    propertyId: null
  }
}

// Async thunks
export const fetchReservations = createAsyncThunk(
  'reservations/fetchReservations',
  async (filters: { status?: string; propertyId?: string; dateRange?: { start: string; end: string } } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      if (filters?.status && filters.status !== 'all') {
        params.append('status', filters.status)
      }
      if (filters?.propertyId) {
        params.append('propertyId', filters.propertyId)
      }
      if (filters?.dateRange?.start) {
        params.append('startDate', filters.dateRange.start)
      }
      if (filters?.dateRange?.end) {
        params.append('endDate', filters.dateRange.end)
      }

      const response = await api.get<{ reservations: Reservation[]; stats: any }>(`/api/reservations?${params}`)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch reservations')
    }
  }
)

export const fetchReservationById = createAsyncThunk(
  'reservations/fetchReservationById',
  async (reservationId: string, { rejectWithValue }) => {
    try {
      const response = await api.get<{ reservation: Reservation }>(`/api/reservations/${reservationId}`)
      return response.reservation
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch reservation')
    }
  }
)

export const updateReservationStatus = createAsyncThunk(
  'reservations/updateStatus',
  async ({ reservationId, status, reason }: { reservationId: string; status: string; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await api.patch<{ reservation: Reservation }>(`/api/reservations/${reservationId}/status`, {
        status,
        reason
      })
      return response.reservation
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update reservation status')
    }
  }
)

export const modifyReservation = createAsyncThunk(
  'reservations/modify',
  async (modification: ReservationModification, { rejectWithValue }) => {
    try {
      const response = await api.patch<{ reservation: Reservation }>(`/api/reservations/${modification.reservationId}/modify`, modification)
      return response.reservation
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to modify reservation')
    }
  }
)

export const reportNoShow = createAsyncThunk(
  'reservations/reportNoShow',
  async ({ reservationId, reason }: { reservationId: string; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post<{ reservation: Reservation }>(`/api/reservations/${reservationId}/no-show`, {
        reason,
        reportedAt: new Date().toISOString()
      })
      return response.reservation
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to report no-show')
    }
  }
)

export const cancelReservation = createAsyncThunk(
  'reservations/cancel',
  async ({ reservationId, reason }: { reservationId: string; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await api.patch<{ reservation: Reservation }>(`/api/reservations/${reservationId}/cancel`, {
        reason,
        cancelledAt: new Date().toISOString()
      })
      return response.reservation
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to cancel reservation')
    }
  }
)

const reservationSlice = createSlice({
  name: 'reservations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentReservation: (state, action: PayloadAction<Reservation | null>) => {
      state.currentReservation = action.payload
    },
    updateFilters: (state, action: PayloadAction<Partial<ReservationState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        status: 'all',
        dateRange: { start: null, end: null },
        propertyId: null
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch reservations
      .addCase(fetchReservations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchReservations.fulfilled, (state, action) => {
        state.loading = false
        state.reservations = action.payload.reservations
        state.stats = {
          total: action.payload.reservations.length,
          confirmed: action.payload.reservations.filter(r => r.status === 'confirmed').length,
          pending: action.payload.reservations.filter(r => r.status === 'pending').length,
          completed: action.payload.reservations.filter(r => r.status === 'completed').length,
          cancelled: action.payload.reservations.filter(r => r.status === 'cancelled').length
        }
      })
      .addCase(fetchReservations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Fetch reservation by ID
      .addCase(fetchReservationById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchReservationById.fulfilled, (state, action) => {
        state.loading = false
        state.currentReservation = action.payload
      })
      .addCase(fetchReservationById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Update reservation status
      .addCase(updateReservationStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateReservationStatus.fulfilled, (state, action) => {
        state.loading = false
        const index = state.reservations.findIndex(r => r.id === action.payload.id)
        if (index !== -1) {
          state.reservations[index] = action.payload
        }
        if (state.currentReservation?.id === action.payload.id) {
          state.currentReservation = action.payload
        }
      })
      .addCase(updateReservationStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Modify reservation
      .addCase(modifyReservation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(modifyReservation.fulfilled, (state, action) => {
        state.loading = false
        const index = state.reservations.findIndex(r => r.id === action.payload.id)
        if (index !== -1) {
          state.reservations[index] = action.payload
        }
        if (state.currentReservation?.id === action.payload.id) {
          state.currentReservation = action.payload
        }
      })
      .addCase(modifyReservation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Report no-show
      .addCase(reportNoShow.fulfilled, (state, action) => {
        const index = state.reservations.findIndex(r => r.id === action.payload.id)
        if (index !== -1) {
          state.reservations[index] = action.payload
        }
        if (state.currentReservation?.id === action.payload.id) {
          state.currentReservation = action.payload
        }
      })
      
      // Cancel reservation
      .addCase(cancelReservation.fulfilled, (state, action) => {
        const index = state.reservations.findIndex(r => r.id === action.payload.id)
        if (index !== -1) {
          state.reservations[index] = action.payload
        }
        if (state.currentReservation?.id === action.payload.id) {
          state.currentReservation = action.payload
        }
      })
  }
})

export const {
  clearError,
  setCurrentReservation,
  updateFilters,
  clearFilters
} = reservationSlice.actions

export default reservationSlice.reducer