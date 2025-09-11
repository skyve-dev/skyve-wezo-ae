import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {api} from '@/utils/api'

interface BookingFormData {
  // Property and booking details
  propertyId: string
  ratePlanId?: string | null // Now optional for direct bookings
  checkInDate: string
  checkOutDate: string
  numGuests: number
  isHalfDay?: boolean
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
  
  // Booking creation
  bookingId?: string
  bookingExpiresAt?: string
  
  // Payment details
  paymentMethod?: string
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
}

// Booking options from server
interface BookingOptions {
  propertyId: string
  checkInDate: string
  checkOutDate: string
  nights: number
  guestCount: number
  isHalfDay: boolean
  baseTotal: number
  options: RatePlanOption[]
}

interface RatePlanOption {
  ratePlan: any | null
  name: string
  description?: string
  totalPrice: number
  pricePerNight: number
  savings: number
  features?: any
  cancellationPolicy?: any
  priceBreakdown: any
}

interface CancellationPreview {
  reservationId: string
  originalAmount: number
  refundAmount: number
  cancellationFee: number
  refundPercentage: number
  policyType: 'FullyFlexible' | 'Moderate' | 'NonRefundable'
  policyDetails: string
  daysBeforeCheckIn: number
  canCancel: boolean
}

interface BookingState {
  currentBooking: BookingFormData | null
  bookingOptions: BookingOptions | null // Available booking options (direct + rate plans)
  selectedRatePlanOption: RatePlanOption | null // Currently selected option
  calculatingOptions: boolean // Loading state for options calculation
  
  otpTimer: number
  isLoading: boolean
  isSaving: boolean
  error: string | null
  
  // Step tracking
  currentStep: 'details' | 'otp' | 'payment' | 'confirmation'
  
  // Auto-login data from email verification
  autoLoginData: any | null
  
  // User's bookings
  userBookings: any[]
  userBookingsLoading: boolean
  
  // Cancellation
  cancellationPreview: CancellationPreview | null
  cancellationLoading: boolean
  cancellationHistory: any[]
}

const initialState: BookingState = {
  currentBooking: null,
  bookingOptions: null,
  selectedRatePlanOption: null,
  calculatingOptions: false,
  otpTimer: 0,
  isLoading: false,
  isSaving: false,
  error: null,
  currentStep: 'details',
  autoLoginData: null,
  userBookings: [],
  userBookingsLoading: false,
  cancellationPreview: null,
  cancellationLoading: false,
  cancellationHistory: []
}

// Async thunks
export const calculateBookingOptions = createAsyncThunk(
  'booking/calculateOptions',
  async (criteria: {
    propertyId: string
    checkInDate: string
    checkOutDate: string
    guestCount?: number
    isHalfDay?: boolean
  }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/booking/calculate-options', criteria)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to calculate booking options')
    }
  }
)

export const initializeBooking = createAsyncThunk(
  'booking/initialize',
  async (bookingData: {
    propertyId: string
    ratePlanId?: string | null
    checkInDate: string
    checkOutDate: string
    numGuests: number
    isHalfDay?: boolean
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
  async ({ email, otpCode, bookingData }: { 
    email: string; 
    otpCode: string;
    bookingData?: Partial<BookingFormData>
  }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/booking/verify-otp', { 
        email, 
        otpCode,
        // Include booking details for automatic booking creation
        ...(bookingData ? {
          propertyId: bookingData.propertyId,
          ratePlanId: bookingData.ratePlanId,
          checkInDate: bookingData.checkInDate,
          checkOutDate: bookingData.checkOutDate,
          numGuests: bookingData.numGuests,
          guestName: bookingData.guestName,
          guestPhone: bookingData.guestPhone,
          specialRequests: bookingData.specialRequests,
          totalPrice: bookingData.totalPrice,
          isHalfDay: bookingData.isHalfDay || false
        } : {})
      })
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
      // Include isHalfDay in the booking data
      const response = await api.post('/api/booking/create', {
        ...bookingData,
        isHalfDay: bookingData.isHalfDay || false
      })
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

// Get cancellation preview
export const fetchCancellationPreview = createAsyncThunk(
  'booking/fetchCancellationPreview',
  async (reservationId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/reservations/${reservationId}/cancellation-preview`) as any
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cancellation preview')
    }
  }
)

// Process cancellation
export const cancelReservation = createAsyncThunk(
  'booking/cancelReservation',
  async (params: { reservationId: string; reason: string; reasonCategory: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/reservations/${params.reservationId}/cancel`, {
        reason: params.reason,
        reasonCategory: params.reasonCategory
      }) as any
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel reservation')
    }
  }
)

// Fetch cancellation history
export const fetchCancellationHistory = createAsyncThunk(
  'booking/fetchCancellationHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/cancellations/history') as any
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cancellation history')
    }
  }
)

// Legacy - keeping for backward compatibility
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
    
    selectRatePlanOption: (state, action: PayloadAction<RatePlanOption>) => {
      state.selectedRatePlanOption = action.payload
      // Update current booking with selected option
      if (state.currentBooking) {
        state.currentBooking = {
          ...state.currentBooking,
          ratePlanId: action.payload.ratePlan?.id || null,
          totalPrice: action.payload.totalPrice,
          pricePerNight: action.payload.pricePerNight
        }
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
      state.bookingOptions = null
      state.selectedRatePlanOption = null
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
      // Calculate booking options
      .addCase(calculateBookingOptions.pending, (state) => {
        state.calculatingOptions = true
        state.error = null
      })
      .addCase(calculateBookingOptions.fulfilled, (state, action) => {
        state.calculatingOptions = false
        state.bookingOptions = action.payload as BookingOptions
        // Auto-select the first option (cheapest)
        if ((action.payload as BookingOptions).options.length > 0) {
          state.selectedRatePlanOption = (action.payload as BookingOptions).options[0]
        }
      })
      .addCase(calculateBookingOptions.rejected, (state, action) => {
        state.calculatingOptions = false
        state.error = action.payload as string
      })
      
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
      .addCase(verifyOtpCode.fulfilled, (state, action) => {
        state.isLoading = false
        if (state.currentBooking) {
          state.currentBooking.otpVerified = true
          
          // Store booking ID from the server response
          // Handle both response.data and direct response structure
          const response = (action.payload as any)?.data || (action.payload as any)
          if (response?.bookingId) {
            state.currentBooking.bookingId = response.bookingId
            state.currentBooking.bookingExpiresAt = response.bookingExpiresAt
          }
        }
        
        // Store user data if account was auto-created
        // Handle both response.data and direct response structure
        const response = (action.payload as any)?.data || (action.payload as any)
        if (response?.user && response?.token) {
          // Store token in localStorage for auto-login
          localStorage.setItem('authToken', response.token)
          localStorage.setItem('user', JSON.stringify(response.user))
          
          if (response.autoCreated) {
            console.log('✅ User auto-created and logged in:', response.user.email)
          }
          
          // Set flag to trigger auth update (will be handled by extraReducers)
          state.autoLoginData = response
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
      
      // Cancel booking (legacy)
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
      
      // Fetch cancellation preview
      .addCase(fetchCancellationPreview.pending, (state) => {
        state.cancellationLoading = true
        state.error = null
      })
      .addCase(fetchCancellationPreview.fulfilled, (state, action) => {
        state.cancellationLoading = false
        state.cancellationPreview = action.payload.data
      })
      .addCase(fetchCancellationPreview.rejected, (state, action) => {
        state.cancellationLoading = false
        state.error = action.payload as string
      })
      
      // Cancel reservation
      .addCase(cancelReservation.pending, (state) => {
        state.cancellationLoading = true
        state.error = null
      })
      .addCase(cancelReservation.fulfilled, (state, action) => {
        state.cancellationLoading = false
        // Update the booking in userBookings array if it exists
        const reservationId = action.payload.data?.reservation?.id
        if (reservationId) {
          const bookingIndex = state.userBookings.findIndex(b => b.id === reservationId)
          if (bookingIndex !== -1) {
            state.userBookings[bookingIndex] = {
              ...state.userBookings[bookingIndex],
              status: 'Cancelled'
            }
          }
        }
        // Clear the preview after successful cancellation
        state.cancellationPreview = null
      })
      .addCase(cancelReservation.rejected, (state, action) => {
        state.cancellationLoading = false
        state.error = action.payload as string
      })
      
      // Fetch cancellation history
      .addCase(fetchCancellationHistory.pending, (state) => {
        state.cancellationLoading = true
        state.error = null
      })
      .addCase(fetchCancellationHistory.fulfilled, (state, action) => {
        state.cancellationLoading = false
        state.cancellationHistory = action.payload.data || []
      })
      .addCase(fetchCancellationHistory.rejected, (state, action) => {
        state.cancellationLoading = false
        state.error = action.payload as string
      })
  }
})

export const { 
  updateBookingField, 
  selectRatePlanOption,
  setCurrentStep, 
  setOtpTimer, 
  clearBooking, 
  clearError 
} = bookingSlice.actions

export default bookingSlice.reducer