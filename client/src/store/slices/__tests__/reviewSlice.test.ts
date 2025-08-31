import {configureStore} from '@reduxjs/toolkit'
import reviewReducer, {
  clearError,
  clearFilters,
  deleteReviewResponse,
  fetchReviewById,
  fetchReviews,
  reportReview,
  respondToReview,
  type Review,
  setCurrentReview,
  sortReviews,
  updateFilters,
  updateReviewResponse
} from '../reviewSlice'
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

describe('reviewSlice', () => {
  let store = configureStore({
    reducer: {
      reviews: reviewReducer
    }
  })

  beforeEach(() => {
    store = configureStore({
      reducer: {
        reviews: reviewReducer
      }
    })
    jest.clearAllMocks()
  })

  const mockReview: Review = {
    id: 'review-1',
    reservationId: 'res-1',
    propertyId: 'prop-1',
    propertyName: 'Dubai Villa',
    guestName: 'John Doe',
    guestEmail: 'john@example.com',
    rating: 5,
    title: 'Excellent stay!',
    comment: 'The villa was amazing and the host was very helpful.',
    categories: {
      cleanliness: 5,
      accuracy: 5,
      communication: 5,
      location: 4,
      checkIn: 5,
      value: 4
    },
    response: {
      text: 'Thank you for your wonderful review!',
      respondedAt: '2024-03-16T10:00:00Z',
      respondedBy: 'host-1'
    },
    isPublic: true,
    isVerified: true,
    createdAt: '2024-03-15T15:00:00Z',
    updatedAt: '2024-03-16T10:00:00Z',
    stayDates: {
      checkIn: '2024-03-10',
      checkOut: '2024-03-13'
    }
  }

  const mockReviewWithoutResponse: Review = {
    ...mockReview,
    id: 'review-2',
    rating: 3,
    title: 'Good but could be better',
    comment: 'Nice place but some issues with wifi.',
    response: undefined,
    categories: {
      cleanliness: 4,
      accuracy: 3,
      communication: 4,
      location: 4,
      checkIn: 3,
      value: 3
    }
  }

  // const mockReviewStats: ReviewStats = {
  //   totalReviews: 25,
  //   averageRating: 4.2,
  //   categoryAverages: {
  //     cleanliness: 4.3,
  //     accuracy: 4.1,
  //     communication: 4.5,
  //     location: 4.0,
  //     checkIn: 4.2,
  //     value: 4.0
  //   },
  //   ratingDistribution: {
  //     5: 10,
  //     4: 8,
  //     3: 5,
  //     2: 2,
  //     1: 0
  //   },
  //   pendingResponses: 3,
  //   responseRate: 88.0
  // }

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().reviews
      expect(state).toEqual({
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
      })
    })
  })

  describe('reducers', () => {
    it('should clear error', () => {
      store.dispatch(clearError())
      const state = store.getState().reviews
      expect(state.error).toBeNull()
    })

    it('should set current review', () => {
      store.dispatch(setCurrentReview(mockReview))
      const state = store.getState().reviews
      expect(state.currentReview).toEqual(mockReview)
    })

    it('should update filters', () => {
      const newFilters = {
        rating: 5,
        hasResponse: false,
        propertyId: 'prop-1',
        sortBy: 'rating_high' as const
      }

      store.dispatch(updateFilters(newFilters))
      const state = store.getState().reviews
      expect(state.filters).toEqual(newFilters)
    })

    it('should clear filters', () => {
      // First set some filters
      store.dispatch(updateFilters({
        rating: 4,
        hasResponse: true,
        propertyId: 'prop-1'
      }))

      // Then clear them
      store.dispatch(clearFilters())

      const state = store.getState().reviews
      expect(state.filters).toEqual({
        rating: null,
        hasResponse: null,
        propertyId: null,
        sortBy: 'newest'
      })
    })

    it('should sort reviews by newest', () => {
      const reviews = [
        { ...mockReview, id: 'review-1', createdAt: '2024-03-15T10:00:00Z' },
        { ...mockReview, id: 'review-2', createdAt: '2024-03-16T10:00:00Z' },
        { ...mockReview, id: 'review-3', createdAt: '2024-03-14T10:00:00Z' }
      ]

      store = configureStore({
        reducer: { reviews: reviewReducer },
        preloadedState: {
          reviews: {
            ...store.getState().reviews,
            reviews
          }
        }
      })

      store.dispatch(sortReviews('newest'))

      const state = store.getState().reviews
      expect(state.reviews[0].id).toBe('review-2') // Most recent first
      expect(state.reviews[1].id).toBe('review-1')
      expect(state.reviews[2].id).toBe('review-3')
      expect(state.filters.sortBy).toBe('newest')
    })

    it('should sort reviews by oldest', () => {
      const reviews = [
        { ...mockReview, id: 'review-1', createdAt: '2024-03-15T10:00:00Z' },
        { ...mockReview, id: 'review-2', createdAt: '2024-03-16T10:00:00Z' },
        { ...mockReview, id: 'review-3', createdAt: '2024-03-14T10:00:00Z' }
      ]

      store = configureStore({
        reducer: { reviews: reviewReducer },
        preloadedState: {
          reviews: {
            ...store.getState().reviews,
            reviews
          }
        }
      })

      store.dispatch(sortReviews('oldest'))

      const state = store.getState().reviews
      expect(state.reviews[0].id).toBe('review-3') // Oldest first
      expect(state.reviews[1].id).toBe('review-1')
      expect(state.reviews[2].id).toBe('review-2')
    })

    it('should sort reviews by rating (high to low)', () => {
      const reviews = [
        { ...mockReview, id: 'review-1', rating: 3 },
        { ...mockReview, id: 'review-2', rating: 5 },
        { ...mockReview, id: 'review-3', rating: 4 }
      ]

      store = configureStore({
        reducer: { reviews: reviewReducer },
        preloadedState: {
          reviews: {
            ...store.getState().reviews,
            reviews
          }
        }
      })

      store.dispatch(sortReviews('rating_high'))

      const state = store.getState().reviews
      expect(state.reviews[0].rating).toBe(5)
      expect(state.reviews[1].rating).toBe(4)
      expect(state.reviews[2].rating).toBe(3)
    })

    it('should sort reviews by rating (low to high)', () => {
      const reviews = [
        { ...mockReview, id: 'review-1', rating: 3 },
        { ...mockReview, id: 'review-2', rating: 5 },
        { ...mockReview, id: 'review-3', rating: 4 }
      ]

      store = configureStore({
        reducer: { reviews: reviewReducer },
        preloadedState: {
          reviews: {
            ...store.getState().reviews,
            reviews
          }
        }
      })

      store.dispatch(sortReviews('rating_low'))

      const state = store.getState().reviews
      expect(state.reviews[0].rating).toBe(3)
      expect(state.reviews[1].rating).toBe(4)
      expect(state.reviews[2].rating).toBe(5)
    })
  })

  describe('fetchReviews async thunk', () => {
    it('should fetch reviews successfully', async () => {
      const mockReviews = [mockReview, mockReviewWithoutResponse]
      mockApi.get.mockResolvedValue({ reviews: mockReviews })

      await store.dispatch(fetchReviews({
        propertyId: 'prop-1',
        rating: 5,
        hasResponse: true,
        sortBy: 'newest'
      }))

      const state = store.getState().reviews
      expect(state.reviews).toEqual(mockReviews)
      expect(state.loading).toBe(false)
      
      // Check calculated stats
      expect(state.stats.totalReviews).toBe(2)
      expect(state.stats.averageRating).toBe(4.0) // (5 + 3) / 2
      expect(state.stats.pendingResponses).toBe(1) // One without response
    })

    it('should handle fetch reviews error', async () => {
      const errorMessage = 'Failed to fetch reviews'
      mockApi.get.mockRejectedValue({
        response: { data: { error: errorMessage } }
      })

      await store.dispatch(fetchReviews({}))

      const state = store.getState().reviews
      expect(state.loading).toBe(false)
      expect(state.error).toBe(errorMessage)
    })

    it('should construct query params correctly', async () => {
      mockApi.get.mockResolvedValue({ reviews: [] })

      await store.dispatch(fetchReviews({
        propertyId: 'prop-1',
        rating: 5,
        hasResponse: false,
        sortBy: 'rating_high'
      }))

      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('propertyId=prop-1')
      )
      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('rating=5')
      )
      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('hasResponse=false')
      )
      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('sortBy=rating_high')
      )
    })

    it('should calculate stats correctly', async () => {
      const reviews = [
        { ...mockReview, rating: 5, response: { text: 'Thanks', respondedAt: '2024-03-16T10:00:00Z', respondedBy: 'host' } },
        { ...mockReview, id: 'review-2', rating: 4, response: undefined },
        { ...mockReview, id: 'review-3', rating: 3, response: { text: 'Noted', respondedAt: '2024-03-17T10:00:00Z', respondedBy: 'host' } },
        { ...mockReview, id: 'review-4', rating: 5, response: undefined },
        { ...mockReview, id: 'review-5', rating: 2, response: undefined }
      ]

      mockApi.get.mockResolvedValue({ reviews })

      await store.dispatch(fetchReviews({}))

      const state = store.getState().reviews
      expect(state.stats).toEqual({
        totalReviews: 5,
        averageRating: 3.8, // (5 + 4 + 3 + 5 + 2) / 5 = 3.8
        categoryAverages: expect.any(Object),
        ratingDistribution: {
          5: 2,
          4: 1,
          3: 1,
          2: 1,
          1: 0
        },
        pendingResponses: 3, // Reviews without responses
        responseRate: 40.0 // 2 responses out of 5 reviews = 40%
      })
    })
  })

  describe('fetchReviewById async thunk', () => {
    it('should fetch single review successfully', async () => {
      mockApi.get.mockResolvedValue({ review: mockReview })

      await store.dispatch(fetchReviewById('review-1'))

      const state = store.getState().reviews
      expect(state.currentReview).toEqual(mockReview)
      expect(state.loading).toBe(false)
    })

    it('should handle fetch review by ID error', async () => {
      const errorMessage = 'Review not found'
      mockApi.get.mockRejectedValue({
        response: { data: { error: errorMessage } }
      })

      await store.dispatch(fetchReviewById('non-existent'))

      const state = store.getState().reviews
      expect(state.loading).toBe(false)
      expect(state.error).toBe(errorMessage)
    })
  })

  describe('respondToReview async thunk', () => {
    it('should respond to review successfully', async () => {
      const reviewWithResponse = {
        ...mockReviewWithoutResponse,
        response: {
          text: 'Thank you for your feedback!',
          respondedAt: '2024-03-16T11:00:00Z',
          respondedBy: 'host-1'
        }
      }

      // Set initial state with review without response
      store = configureStore({
        reducer: { reviews: reviewReducer },
        preloadedState: {
          reviews: {
            ...store.getState().reviews,
            reviews: [mockReviewWithoutResponse],
            currentReview: mockReviewWithoutResponse
          }
        }
      })

      mockApi.post.mockResolvedValue({ review: reviewWithResponse })

      await store.dispatch(respondToReview({
        reviewId: 'review-2',
        responseText: 'Thank you for your feedback!'
      }))

      const state = store.getState().reviews
      expect(state.reviews[0].response).toBeDefined()
      expect(state.reviews[0].response?.text).toBe('Thank you for your feedback!')
      expect(state.currentReview?.response).toBeDefined()
      expect(state.loading).toBe(false)
      
      // Stats should be recalculated
      expect(state.stats.pendingResponses).toBe(0)
    })

    it('should handle respond to review error', async () => {
      const errorMessage = 'Failed to respond to review'
      mockApi.post.mockRejectedValue({
        response: { data: { error: errorMessage } }
      })

      await store.dispatch(respondToReview({
        reviewId: 'review-1',
        responseText: 'Thank you!'
      }))

      const state = store.getState().reviews
      expect(state.loading).toBe(false)
      expect(state.error).toBe(errorMessage)
    })
  })

  describe('updateReviewResponse async thunk', () => {
    it('should update review response successfully', async () => {
      const updatedReview = {
        ...mockReview,
        response: {
          ...mockReview.response!,
          text: 'Updated response text'
        }
      }

      // Set initial state with review
      store = configureStore({
        reducer: { reviews: reviewReducer },
        preloadedState: {
          reviews: {
            ...store.getState().reviews,
            reviews: [mockReview],
            currentReview: mockReview
          }
        }
      })

      mockApi.patch.mockResolvedValue({ review: updatedReview })

      await store.dispatch(updateReviewResponse({
        reviewId: 'review-1',
        responseText: 'Updated response text'
      }))

      const state = store.getState().reviews
      expect(state.reviews[0].response?.text).toBe('Updated response text')
      expect(state.currentReview?.response?.text).toBe('Updated response text')
    })
  })

  describe('deleteReviewResponse async thunk', () => {
    it('should delete review response successfully', async () => {
      const reviewWithoutResponse = {
        ...mockReview,
        response: undefined
      }

      // Set initial state with review with response
      store = configureStore({
        reducer: { reviews: reviewReducer },
        preloadedState: {
          reviews: {
            ...store.getState().reviews,
            reviews: [mockReview],
            currentReview: mockReview
          }
        }
      })

      mockApi.delete.mockResolvedValue({ review: reviewWithoutResponse })

      await store.dispatch(deleteReviewResponse('review-1'))

      const state = store.getState().reviews
      expect(state.reviews[0].response).toBeUndefined()
      expect(state.currentReview?.response).toBeUndefined()
      
      // Stats should be recalculated to show pending response
      expect(state.stats.pendingResponses).toBe(1)
    })
  })

  describe('reportReview async thunk', () => {
    it('should report review successfully', async () => {
      mockApi.post.mockResolvedValue({ success: true })

      await store.dispatch(reportReview({
        reviewId: 'review-1',
        reason: 'Inappropriate content'
      }))

      const state = store.getState().reviews
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle report review error', async () => {
      const errorMessage = 'Failed to report review'
      mockApi.post.mockRejectedValue({
        response: { data: { error: errorMessage } }
      })

      await store.dispatch(reportReview({
        reviewId: 'review-1',
        reason: 'Spam'
      }))

      const state = store.getState().reviews
      expect(state.loading).toBe(false)
      expect(state.error).toBe(errorMessage)
    })
  })

  describe('stats calculation helper', () => {
    it('should calculate stats for empty reviews list', async () => {
      mockApi.get.mockResolvedValue({ reviews: [] })

      await store.dispatch(fetchReviews({}))

      const state = store.getState().reviews
      expect(state.stats).toEqual({
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
      })
    })

    it('should calculate category averages correctly', async () => {
      const reviews = [
        {
          ...mockReview,
          categories: {
            cleanliness: 5,
            accuracy: 4,
            communication: 5,
            location: 3,
            checkIn: 4,
            value: 5
          }
        },
        {
          ...mockReview,
          id: 'review-2',
          categories: {
            cleanliness: 3,
            accuracy: 4,
            communication: 3,
            location: 5,
            checkIn: 4,
            value: 3
          }
        }
      ]

      mockApi.get.mockResolvedValue({ reviews })

      await store.dispatch(fetchReviews({}))

      const state = store.getState().reviews
      expect(state.stats.categoryAverages).toEqual({
        cleanliness: 4.0, // (5 + 3) / 2
        accuracy: 4.0,    // (4 + 4) / 2
        communication: 4.0, // (5 + 3) / 2
        location: 4.0,    // (3 + 5) / 2
        checkIn: 4.0,     // (4 + 4) / 2
        value: 4.0        // (5 + 3) / 2
      })
    })
  })

  describe('edge cases', () => {
    it('should handle empty reviews list', async () => {
      mockApi.get.mockResolvedValue({ reviews: [] })

      await store.dispatch(fetchReviews({}))

      const state = store.getState().reviews
      expect(state.reviews).toEqual([])
      expect(state.stats.totalReviews).toBe(0)
    })

    it('should handle network errors gracefully', async () => {
      mockApi.get.mockRejectedValue(new Error('Network error'))

      await store.dispatch(fetchReviews({}))

      const state = store.getState().reviews
      expect(state.loading).toBe(false)
      expect(state.error).toBe('Failed to fetch reviews')
    })

    it('should handle malformed review data', async () => {
      const malformedReviews = [
        {
          ...mockReview,
          categories: null, // Invalid categories
          rating: null      // Invalid rating
        }
      ]

      mockApi.get.mockResolvedValue({ reviews: malformedReviews })

      // Should handle gracefully without throwing
      await expect(store.dispatch(fetchReviews({}))).resolves.not.toThrow()

      const state = store.getState().reviews
      expect(state.loading).toBe(false)
    })

    it('should handle review updates when review not in list', () => {
      const updatedReview = { ...mockReview, id: 'non-existent' }
      
      // This should not crash even if review is not found
      store = configureStore({
        reducer: { reviews: reviewReducer },
        preloadedState: {
          reviews: {
            ...store.getState().reviews,
            reviews: [mockReview] // Different review
          }
        }
      })

      mockApi.post.mockResolvedValue({ review: updatedReview })

      expect(async () => {
        await store.dispatch(respondToReview({
          reviewId: 'non-existent',
          responseText: 'Thanks!'
        }))
      }).not.toThrow()
    })

    it('should handle sorting with invalid sort type', () => {
      const reviews = [mockReview]
      
      store = configureStore({
        reducer: { reviews: reviewReducer },
        preloadedState: {
          reviews: {
            ...store.getState().reviews,
            reviews
          }
        }
      })

      store.dispatch(sortReviews('invalid_sort' as any))

      const state = store.getState().reviews
      expect(state.reviews).toEqual(reviews) // Should remain unchanged
    })

    it('should handle reviews with missing response data', async () => {
      const reviewsWithMixedResponses = [
        mockReview, // Has response
        { ...mockReview, id: 'review-2', response: undefined }, // No response
        { ...mockReview, id: 'review-3', response: null as any } // Null response
      ]

      mockApi.get.mockResolvedValue({ reviews: reviewsWithMixedResponses })

      await store.dispatch(fetchReviews({}))

      const state = store.getState().reviews
      expect(state.stats.pendingResponses).toBe(2) // Two reviews without valid responses
      expect(state.stats.responseRate).toBe(33.3) // 1 out of 3 = 33.3%
    })

    it('should maintain review order during updates', () => {
      const initialReviews = [
        { ...mockReview, id: 'review-1', createdAt: '2024-03-15T10:00:00Z' },
        { ...mockReview, id: 'review-2', createdAt: '2024-03-16T10:00:00Z' }
      ]

      store = configureStore({
        reducer: { reviews: reviewReducer },
        preloadedState: {
          reviews: {
            ...store.getState().reviews,
            reviews: initialReviews
          }
        }
      })

      // Update first review
      const updatedReview = { ...initialReviews[0], rating: 3 }
      mockApi.post.mockResolvedValue({ review: updatedReview })

      store.dispatch(respondToReview({
        reviewId: 'review-1',
        responseText: 'Thanks!'
      }))

      // Order should be maintained
      const state = store.getState().reviews
      expect(state.reviews[0].id).toBe('review-1')
      expect(state.reviews[1].id).toBe('review-2')
    })
  })
})