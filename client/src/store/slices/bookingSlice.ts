import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { api } from '@/utils/api'

interface BookingFormData {
  // Property and booking details
  propertyId: string
  ratePlanId: string
  checkInDate: string
  checkOutDate: string
  numGuests: number
  totalPrice: number
  pricePerNight: number
  
  // Guest details
  guestName: string
  guestEmail: string
  guestPhone?: string
  specialRequests?: string
  
  // OTP verification
  otpSent: boolean
  otpVerified: boolean
  otpCode: string
  
  // Payment details
  paymentMethod?: string
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
}

interface BookingState {
  currentBooking: BookingFormData | null
  otpTimer: number
  isLoading: boolean
  isSaving: boolean
  error: string | null
  
  // Step tracking
  currentStep: 'details' | 'otp' | 'payment' | 'confirmation'
  
  // User's bookings
  userBookings: any[]
  userBookingsLoading: boolean
}

const initialState: BookingState = {
  currentBooking: null,
  otpTimer: 0,
  isLoading: false,
  isSaving: false,
  error: null,
  currentStep: 'details',
  userBookings: [],
  userBookingsLoading: false
}

// Async thunks
export const initializeBooking = createAsyncThunk(
  'booking/initialize',
  async (bookingData: {
    propertyId: string
    ratePlanId: string
    checkInDate: string
    checkOutDate: string
    numGuests: number
    totalPrice: number
    pricePerNight: number
  }) => {
    return bookingData
  }
)

export const sendOtpCode = createAsyncThunk(
  'booking/sendOtp',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/booking/send-otp', { email })
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send OTP')
    }
  }
)

export const verifyOtpCode = createAsyncThunk(
  'booking/verifyOtp',
  async ({ email, otpCode }: { email: string; otpCode: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/booking/verify-otp', { email, otpCode })
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Invalid OTP code')
    }
  }
)

export const createBooking = createAsyncThunk(
  'booking/create',
  async (bookingData: Partial<BookingFormData>, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/booking/create', bookingData)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create booking')
    }
  }
)

export const processPayment = createAsyncThunk(
  'booking/processPayment',
  async ({ bookingId, paymentMethod }: { bookingId: string; paymentMethod: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/booking/payment', { bookingId, paymentMethod })
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Payment failed')
    }
  }
)

export const fetchUserBookings = createAsyncThunk(
  'booking/fetchUserBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/booking/my-bookings')
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings')
    }
  }
)

export const cancelBooking = createAsyncThunk(
  'booking/cancel',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/booking/${bookingId}/cancel`)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel booking')
    }
  }
)

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    updateBookingField: (state, action: PayloadAction<Partial<BookingFormData>>) => {
      if (state.currentBooking) {
        state.currentBooking = { ...state.currentBooking, ...action.payload }
      }
    },
    
    setCurrentStep: (state, action: PayloadAction<BookingState['currentStep']>) => {
      state.currentStep = action.payload
    },
    
    setOtpTimer: (state, action: PayloadAction<number>) => {
      state.otpTimer = action.payload
    },
    
    clearBooking: (state) => {
      state.currentBooking = null
      state.currentStep = 'details'
      state.otpTimer = 0
      state.error = null
    },
    
    clearError: (state) => {
      state.error = null
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Initialize booking
      .addCase(initializeBooking.fulfilled, (state, action) => {
        state.currentBooking = {
          ...action.payload,
          guestName: '',
          guestEmail: '',
          guestPhone: '',
          specialRequests: '',
          otpSent: false,
          otpVerified: false,
          otpCode: '',
          paymentStatus: 'pending'
        }
        state.currentStep = 'details'
        state.error = null
      })
      
      // Send OTP
      .addCase(sendOtpCode.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(sendOtpCode.fulfilled, (state) => {
        state.isLoading = false
        if (state.currentBooking) {
          state.currentBooking.otpSent = true
        }
        state.otpTimer = 300 // 5 minutes countdown
        state.currentStep = 'otp'
      })
      .addCase(sendOtpCode.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Verify OTP
      .addCase(verifyOtpCode.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(verifyOtpCode.fulfilled, (state) => {
        state.isLoading = false
        if (state.currentBooking) {
          state.currentBooking.otpVerified = true
        }
        state.currentStep = 'payment'
      })
      .addCase(verifyOtpCode.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Create booking
      .addCase(createBooking.pending, (state) => {
        state.isSaving = true
        state.error = null
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.isSaving = false
        // Update booking with server response
        if (state.currentBooking) {
          state.currentBooking = { ...state.currentBooking, ...(action.payload as any) }
        }
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isSaving = false
        state.error = action.payload as string
      })
      
      // Process payment
      .addCase(processPayment.pending, (state) => {
        state.isSaving = true
        if (state.currentBooking) {
          state.currentBooking.paymentStatus = 'processing'
        }
        state.error = null
      })
      .addCase(processPayment.fulfilled, (state) => {
        state.isSaving = false
        if (state.currentBooking) {
          state.currentBooking.paymentStatus = 'completed'
        }
        state.currentStep = 'confirmation'
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.isSaving = false
        if (state.currentBooking) {
          state.currentBooking.paymentStatus = 'failed'
        }
        state.error = action.payload as string
      })
      
      // Fetch user bookings
      .addCase(fetchUserBookings.pending, (state) => {
        state.userBookingsLoading = true
        state.error = null
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.userBookingsLoading = false
        state.userBookings = action.payload as any[]
      })
      .addCase(fetchUserBookings.rejected, (state, action) => {
        state.userBookingsLoading = false
        state.error = action.payload as string
      })
      
      // Cancel booking
      .addCase(cancelBooking.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.isLoading = false
        // Update the booking in userBookings array
        const bookingIndex = state.userBookings.findIndex(b => b.id === (action.payload as any).id)
        if (bookingIndex !== -1) {
          state.userBookings[bookingIndex] = action.payload as any
        }
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  }
})

export const { 
  updateBookingField, 
  setCurrentStep, 
  setOtpTimer, 
  clearBooking, 
  clearError 
} = bookingSlice.actions

export default bookingSlice.reducer