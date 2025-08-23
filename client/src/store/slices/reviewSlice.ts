import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { api } from '../../utils/api'

// Types
export interface Review {
  id: string
  reservationId: string
  propertyId: string
  propertyName: string
  guestName: string
  guestEmail: string
  rating: number
  title: string
  comment: string
  categories: {
    cleanliness: number
    accuracy: number
    communication: number
    location: number
    checkIn: number
    value: number
  }
  response?: {
    text: string
    respondedAt: string
    respondedBy: string
  }
  isPublic: boolean
  isVerified: boolean
  createdAt: string
  updatedAt: string
  stayDates: {
    checkIn: string
    checkOut: string
  }
}

export interface ReviewResponse {
  reviewId: string
  responseText: string
}

export interface ReviewStats {
  totalReviews: number
  averageRating: number
  categoryAverages: {
    cleanliness: number
    accuracy: number
    communication: number
    location: number
    checkIn: number
    value: number
  }
  ratingDistribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  pendingResponses: number
  responseRate: number
}

export interface ReviewState {
  reviews: Review[]
  currentReview: Review | null
  stats: ReviewStats
  loading: boolean
  error: string | null
  filters: {
    rating: number | null
    hasResponse: boolean | null
    propertyId: string | null
    sortBy: 'newest' | 'oldest' | 'rating_high' | 'rating_low'
  }
}

const initialState: ReviewState = {
  reviews: [],
  currentReview: null,
  stats: {
    totalReviews: 0,
    averageRating: 0,
    categoryAverages: {
      cleanliness: 0,
      accuracy: 0,
      communication: 0,
      location: 0,
      checkIn: 0,
      value: 0
    },
    ratingDistribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    },
    pendingResponses: 0,
    responseRate: 0
  },
  loading: false,
  error: null,
  filters: {
    rating: null,
    hasResponse: null,
    propertyId: null,
    sortBy: 'newest'
  }
}

// Helper function to calculate stats
const calculateStats = (reviews: Review[]): ReviewStats => {
  if (reviews.length === 0) {
    return initialState.stats
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
  const averageRating = totalRating / reviews.length

  const categoryAverages = {
    cleanliness: reviews.reduce((sum, r) => sum + r.categories.cleanliness, 0) / reviews.length,
    accuracy: reviews.reduce((sum, r) => sum + r.categories.accuracy, 0) / reviews.length,
    communication: reviews.reduce((sum, r) => sum + r.categories.communication, 0) / reviews.length,
    location: reviews.reduce((sum, r) => sum + r.categories.location, 0) / reviews.length,
    checkIn: reviews.reduce((sum, r) => sum + r.categories.checkIn, 0) / reviews.length,
    value: reviews.reduce((sum, r) => sum + r.categories.value, 0) / reviews.length
  }

  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length
  }

  const reviewsWithResponses = reviews.filter(r => r.response).length
  const responseRate = (reviewsWithResponses / reviews.length) * 100

  return {
    totalReviews: reviews.length,
    averageRating: Math.round(averageRating * 10) / 10,
    categoryAverages,
    ratingDistribution,
    pendingResponses: reviews.filter(r => !r.response).length,
    responseRate: Math.round(responseRate * 10) / 10
  }
}

// Async thunks
export const fetchReviews = createAsyncThunk(
  'reviews/fetchReviews',
  async (filters: { propertyId?: string; rating?: number; hasResponse?: boolean; sortBy?: string } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      if (filters?.propertyId) {
        params.append('propertyId', filters.propertyId)
      }
      if (filters?.rating) {
        params.append('rating', filters.rating.toString())
      }
      if (filters?.hasResponse !== undefined) {
        params.append('hasResponse', filters.hasResponse.toString())
      }
      if (filters?.sortBy) {
        params.append('sortBy', filters.sortBy)
      }

      const response = await api.get<{ reviews: Review[] }>(`/api/reviews?${params}`)
      return response.reviews
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch reviews')
    }
  }
)

export const fetchReviewById = createAsyncThunk(
  'reviews/fetchReviewById',
  async (reviewId: string, { rejectWithValue }) => {
    try {
      const response = await api.get<{ review: Review }>(`/api/reviews/${reviewId}`)
      return response.review
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch review')
    }
  }
)

export const respondToReview = createAsyncThunk(
  'reviews/respond',
  async ({ reviewId, responseText }: ReviewResponse, { rejectWithValue }) => {
    try {
      const response = await api.post<{ review: Review }>(`/api/reviews/${reviewId}/respond`, {
        responseText,
        respondedAt: new Date().toISOString()
      })
      return response.review
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to respond to review')
    }
  }
)

export const updateReviewResponse = createAsyncThunk(
  'reviews/updateResponse',
  async ({ reviewId, responseText }: ReviewResponse, { rejectWithValue }) => {
    try {
      const response = await api.patch<{ review: Review }>(`/api/reviews/${reviewId}/response`, {
        responseText,
        updatedAt: new Date().toISOString()
      })
      return response.review
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update review response')
    }
  }
)

export const deleteReviewResponse = createAsyncThunk(
  'reviews/deleteResponse',
  async (reviewId: string, { rejectWithValue }) => {
    try {
      const response = await api.delete<{ review: Review }>(`/api/reviews/${reviewId}/response`)
      return response.review
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete review response')
    }
  }
)

export const reportReview = createAsyncThunk(
  'reviews/report',
  async ({ reviewId, reason }: { reviewId: string; reason: string }, { rejectWithValue }) => {
    try {
      const response = await api.post<{ success: boolean }>(`/api/reviews/${reviewId}/report`, {
        reason,
        reportedAt: new Date().toISOString()
      })
      return { reviewId, success: response.success }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to report review')
    }
  }
)

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentReview: (state, action: PayloadAction<Review | null>) => {
      state.currentReview = action.payload
    },
    updateFilters: (state, action: PayloadAction<Partial<ReviewState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        rating: null,
        hasResponse: null,
        propertyId: null,
        sortBy: 'newest'
      }
    },
    sortReviews: (state, action: PayloadAction<'newest' | 'oldest' | 'rating_high' | 'rating_low'>) => {
      const sortBy = action.payload
      state.filters.sortBy = sortBy
      
      state.reviews.sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          case 'rating_high':
            return b.rating - a.rating
          case 'rating_low':
            return a.rating - b.rating
          default:
            return 0
        }
      })
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch reviews
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false
        state.reviews = action.payload
        state.stats = calculateStats(action.payload)
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Fetch review by ID
      .addCase(fetchReviewById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchReviewById.fulfilled, (state, action) => {
        state.loading = false
        state.currentReview = action.payload
      })
      .addCase(fetchReviewById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Respond to review
      .addCase(respondToReview.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(respondToReview.fulfilled, (state, action) => {
        state.loading = false
        const index = state.reviews.findIndex(r => r.id === action.payload.id)
        if (index !== -1) {
          state.reviews[index] = action.payload
        }
        if (state.currentReview?.id === action.payload.id) {
          state.currentReview = action.payload
        }
        // Recalculate stats
        state.stats = calculateStats(state.reviews)
      })
      .addCase(respondToReview.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Update review response
      .addCase(updateReviewResponse.fulfilled, (state, action) => {
        const index = state.reviews.findIndex(r => r.id === action.payload.id)
        if (index !== -1) {
          state.reviews[index] = action.payload
        }
        if (state.currentReview?.id === action.payload.id) {
          state.currentReview = action.payload
        }
      })
      
      // Delete review response
      .addCase(deleteReviewResponse.fulfilled, (state, action) => {
        const index = state.reviews.findIndex(r => r.id === action.payload.id)
        if (index !== -1) {
          state.reviews[index] = action.payload
        }
        if (state.currentReview?.id === action.payload.id) {
          state.currentReview = action.payload
        }
        // Recalculate stats
        state.stats = calculateStats(state.reviews)
      })
  }
})

export const {
  clearError,
  setCurrentReview,
  updateFilters,
  clearFilters,
  sortReviews
} = reviewSlice.actions

export default reviewSlice.reducer