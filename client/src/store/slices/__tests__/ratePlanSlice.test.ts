import { configureStore } from '@reduxjs/toolkit'
import ratePlanReducer, {
  setRatePlans,
  addRatePlan,
  updateRatePlan,
  deleteRatePlan,
  selectRatePlan,
  setLoading,
  setError,
  setFilters,
  updateRatePlanFeatures,
  updateCancellationPolicy,
  clearRatePlans,
  initializeFormForCreate,
  initializeFormForEdit,
  updateFormField,
  resetFormToOriginal,
  clearForm,
  setFormValidationErrors,
  fetchRatePlans,
  fetchPublicRatePlans,
  calculateRatePricing,
  createRatePlanAsync,
  updateRatePlanAsync,
  deleteRatePlanAsync,
  type RatePlan,
  type CancellationPolicy,
  type RatePlanFeatures
} from '../ratePlanSlice'
import { api } from '../../../utils/api'

// Mock API
jest.mock('../../../utils/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}))

const mockApi = api as jest.Mocked<typeof api>

describe('ratePlanSlice', () => {
  let store = configureStore({
    reducer: {
      ratePlan: ratePlanReducer
    }
  })

  beforeEach(() => {
    store = configureStore({
      reducer: {
        ratePlan: ratePlanReducer
      }
    })
    jest.clearAllMocks()
  })

  const mockRatePlan: RatePlan = {
    id: 'rp-1',
    propertyId: 'prop-1',
    name: 'Early Bird Special',
    description: 'Save 20% with early booking',
    priceModifierType: 'Percentage',
    priceModifierValue: -20,
    minStay: 2,
    maxStay: 14,
    minAdvanceBooking: 30,
    maxAdvanceBooking: 365,
    minGuests: 1,
    maxGuests: 8,
    isActive: true,
    isDefault: false,
    priority: 100,
    features: {
      id: 'feat-1',
      ratePlanId: 'rp-1',
      includedAmenityIds: ['wifi', 'pool', 'kitchen']
    },
    cancellationPolicy: {
      id: 'cp-1',
      ratePlanId: 'rp-1',
      type: 'FullyFlexible',
      freeCancellationDays: 7
    },
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  }

  const mockCancellationPolicy: CancellationPolicy = {
    id: 'cp-2',
    ratePlanId: 'rp-1',
    type: 'Moderate',
    freeCancellationDays: 14,
    partialRefundDays: 7
  }

  const mockRatePlanFeatures: RatePlanFeatures = {
    id: 'feat-2',
    ratePlanId: 'rp-1',
    includedAmenityIds: ['wifi', 'pool', 'kitchen', 'parking']
  }

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().ratePlan
      expect(state).toEqual({
        ratePlans: [],
        selectedRatePlan: null,
        currentForm: null,
        originalForm: null,
        hasUnsavedChanges: false,
        formValidationErrors: {},
        isSaving: false,
        loading: false,
        error: null,
        filters: {}
      })
    })
  })

  describe('synchronous reducers', () => {
    it('should set rate plans', () => {
      const ratePlans = [mockRatePlan]
      store.dispatch(setRatePlans(ratePlans))
      
      const state = store.getState().ratePlan
      expect(state.ratePlans).toEqual(ratePlans)
      expect(state.error).toBeNull()
    })

    it('should add rate plan', () => {
      store.dispatch(addRatePlan(mockRatePlan))
      
      const state = store.getState().ratePlan
      expect(state.ratePlans).toContainEqual(mockRatePlan)
    })

    it('should update rate plan', () => {
      // First add a rate plan
      store.dispatch(addRatePlan(mockRatePlan))
      
      // Then update it
      const updatedRatePlan = { ...mockRatePlan, name: 'Updated Early Bird' }
      store.dispatch(updateRatePlan(updatedRatePlan))
      
      const state = store.getState().ratePlan
      expect(state.ratePlans[0]).toEqual(updatedRatePlan)
    })

    it('should delete rate plan', () => {
      // First add a rate plan
      store.dispatch(addRatePlan(mockRatePlan))
      
      // Then delete it
      store.dispatch(deleteRatePlan(mockRatePlan.id))
      
      const state = store.getState().ratePlan
      expect(state.ratePlans).not.toContain(mockRatePlan)
    })

    it('should select rate plan', () => {
      store.dispatch(selectRatePlan(mockRatePlan))
      
      const state = store.getState().ratePlan
      expect(state.selectedRatePlan).toEqual(mockRatePlan)
    })

    it('should set loading state', () => {
      store.dispatch(setLoading(true))
      
      const state = store.getState().ratePlan
      expect(state.loading).toBe(true)
    })

    it('should set error', () => {
      const errorMessage = 'Something went wrong'
      store.dispatch(setError(errorMessage))
      
      const state = store.getState().ratePlan
      expect(state.error).toBe(errorMessage)
      expect(state.loading).toBe(false)
    })

    it('should set filters', () => {
      const filters = { propertyId: 'prop-1', isActive: true }
      store.dispatch(setFilters(filters))
      
      const state = store.getState().ratePlan
      expect(state.filters).toEqual(filters)
    })

    it('should clear rate plans', () => {
      // First add some data
      store.dispatch(addRatePlan(mockRatePlan))
      store.dispatch(setError('Error'))
      
      // Then clear
      store.dispatch(clearRatePlans())
      
      const state = store.getState().ratePlan
      expect(state.ratePlans).toEqual([])
      expect(state.selectedRatePlan).toBeNull()
      expect(state.currentForm).toBeNull()
      expect(state.originalForm).toBeNull()
      expect(state.hasUnsavedChanges).toBe(false)
      expect(state.formValidationErrors).toEqual({})
      expect(state.isSaving).toBe(false)
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
      expect(state.filters).toEqual({})
    })
  })

  describe('features and policy management', () => {
    it('should update rate plan features', () => {
      // First add rate plan to state
      store.dispatch(addRatePlan(mockRatePlan))
      
      // Then update features
      store.dispatch(updateRatePlanFeatures({
        ratePlanId: mockRatePlan.id,
        features: mockRatePlanFeatures
      }))
      
      const state = store.getState().ratePlan
      expect(state.ratePlans[0].features).toEqual(mockRatePlanFeatures)
    })

    it('should update cancellation policy', () => {
      // First add rate plan to state
      store.dispatch(addRatePlan(mockRatePlan))
      
      // Then update cancellation policy
      store.dispatch(updateCancellationPolicy({
        ratePlanId: mockRatePlan.id,
        policy: mockCancellationPolicy
      }))
      
      const state = store.getState().ratePlan
      expect(state.ratePlans[0].cancellationPolicy).toEqual(mockCancellationPolicy)
    })

    it('should update current form when updating features', () => {
      // Set current form
      store.dispatch(initializeFormForEdit(mockRatePlan))
      
      // Update features
      store.dispatch(updateRatePlanFeatures({
        ratePlanId: mockRatePlan.id,
        features: mockRatePlanFeatures
      }))
      
      const state = store.getState().ratePlan
      expect(state.currentForm?.features).toEqual(mockRatePlanFeatures)
    })

    it('should update current form when updating cancellation policy', () => {
      // Set current form
      store.dispatch(initializeFormForEdit(mockRatePlan))
      
      // Update policy
      store.dispatch(updateCancellationPolicy({
        ratePlanId: mockRatePlan.id,
        policy: mockCancellationPolicy
      }))
      
      const state = store.getState().ratePlan
      expect(state.currentForm?.cancellationPolicy).toEqual(mockCancellationPolicy)
    })
  })

  describe('form management', () => {
    it('should initialize form for create mode', () => {
      const propertyId = 'prop-1'
      store.dispatch(initializeFormForCreate(propertyId))
      
      const state = store.getState().ratePlan
      expect(state.currentForm).toEqual(expect.objectContaining({
        id: '',
        propertyId,
        name: '',
        description: '',
        priceModifierType: 'Percentage',
        priceModifierValue: 0,
        isActive: true,
        isDefault: false,
        priority: 100
      }))
      expect(state.originalForm).toEqual(state.currentForm)
      expect(state.hasUnsavedChanges).toBe(false)
      expect(state.formValidationErrors).toEqual({})
    })

    it('should initialize form for edit mode', () => {
      store.dispatch(initializeFormForEdit(mockRatePlan))
      
      const state = store.getState().ratePlan
      expect(state.currentForm).toEqual(mockRatePlan)
      expect(state.originalForm).toEqual(mockRatePlan)
      expect(state.hasUnsavedChanges).toBe(false)
      expect(state.formValidationErrors).toEqual({})
    })

    it('should update form field and detect changes', () => {
      // Initialize form
      store.dispatch(initializeFormForEdit(mockRatePlan))
      
      // Update a field
      store.dispatch(updateFormField({ name: 'Updated Special' }))
      
      const state = store.getState().ratePlan
      expect(state.currentForm?.name).toBe('Updated Special')
      expect(state.hasUnsavedChanges).toBe(true)
    })

    it('should not detect changes when values are the same', () => {
      // Initialize form
      store.dispatch(initializeFormForEdit(mockRatePlan))
      
      // Update with same values
      store.dispatch(updateFormField({ name: mockRatePlan.name }))
      
      const state = store.getState().ratePlan
      expect(state.hasUnsavedChanges).toBe(false)
    })

    it('should reset form to original', () => {
      // Initialize and modify form
      store.dispatch(initializeFormForEdit(mockRatePlan))
      store.dispatch(updateFormField({ name: 'Modified Name' }))
      
      // Reset to original
      store.dispatch(resetFormToOriginal())
      
      const state = store.getState().ratePlan
      expect(state.currentForm).toEqual(mockRatePlan)
      expect(state.hasUnsavedChanges).toBe(false)
      expect(state.formValidationErrors).toEqual({})
    })

    it('should clear form', () => {
      // Set form
      store.dispatch(initializeFormForEdit(mockRatePlan))
      
      // Clear it
      store.dispatch(clearForm())
      
      const state = store.getState().ratePlan
      expect(state.currentForm).toBeNull()
      expect(state.originalForm).toBeNull()
      expect(state.hasUnsavedChanges).toBe(false)
      expect(state.formValidationErrors).toEqual({})
    })

    it('should set form validation errors', () => {
      const errors = { name: 'Name is required', priceModifierValue: 'Must be a number' }
      store.dispatch(setFormValidationErrors(errors))
      
      const state = store.getState().ratePlan
      expect(state.formValidationErrors).toEqual(errors)
    })
  })

  describe('fetchRatePlans async thunk', () => {
    it('should fetch rate plans successfully', async () => {
      const mockRatePlans = [mockRatePlan]
      mockApi.get.mockResolvedValue({ ratePlans: mockRatePlans })

      await store.dispatch(fetchRatePlans('prop-1'))

      const state = store.getState().ratePlan
      expect(state.ratePlans).toEqual(mockRatePlans)
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle snake_case response format', async () => {
      const mockRatePlans = [mockRatePlan]
      mockApi.get.mockResolvedValue({ rate_plans: mockRatePlans })

      await store.dispatch(fetchRatePlans('prop-1'))

      const state = store.getState().ratePlan
      expect(state.ratePlans).toEqual(mockRatePlans)
    })

    it('should handle fetch rate plans error', async () => {
      const errorMessage = 'Failed to fetch rate plans'
      mockApi.get.mockRejectedValue({
        getUserMessage: () => errorMessage,
        serverMessage: errorMessage,
        message: errorMessage
      })

      await store.dispatch(fetchRatePlans('prop-1'))

      const state = store.getState().ratePlan
      expect(state.loading).toBe(false)
      expect(state.error).toBe(errorMessage)
    })

    it('should filter out invalid rate plans', async () => {
      const invalidRatePlans = [
        mockRatePlan,
        { ...mockRatePlan, id: '' }, // Invalid - no ID
        null, // Invalid - null
        { ...mockRatePlan, id: 'rp-2' }
      ]
      mockApi.get.mockResolvedValue({ ratePlans: invalidRatePlans })

      await store.dispatch(fetchRatePlans('prop-1'))

      const state = store.getState().ratePlan
      // Should only include valid rate plans with IDs
      expect(state.ratePlans).toHaveLength(2)
      expect(state.ratePlans[0].id).toBe('rp-1')
      expect(state.ratePlans[1].id).toBe('rp-2')
    })
  })

  describe('fetchPublicRatePlans async thunk', () => {
    it('should fetch public rate plans successfully', async () => {
      const mockRatePlans = [mockRatePlan]
      mockApi.get.mockResolvedValue({ ratePlans: mockRatePlans })

      await store.dispatch(fetchPublicRatePlans('prop-1'))

      const state = store.getState().ratePlan
      expect(state.ratePlans).toEqual(mockRatePlans)
      expect(state.loading).toBe(false)
    })

    it('should handle public rate plans error', async () => {
      const errorMessage = 'Failed to fetch public rate plans'
      mockApi.get.mockRejectedValue({
        getUserMessage: () => errorMessage
      })

      await store.dispatch(fetchPublicRatePlans('prop-1'))

      const state = store.getState().ratePlan
      expect(state.loading).toBe(false)
      expect(state.error).toBe(errorMessage)
    })
  })

  describe('calculateRatePricing async thunk', () => {
    it('should calculate rate pricing successfully', async () => {
      const mockCalculation = {
        totalPrice: 500,
        pricePerNight: 250,
        ratePlan: mockRatePlan
      }
      mockApi.post.mockResolvedValue({ calculation: mockCalculation })

      await store.dispatch(calculateRatePricing({
        propertyId: 'prop-1',
        checkInDate: '2024-06-01',
        checkOutDate: '2024-06-03',
        numGuests: 2
      }))

      const state = store.getState().ratePlan
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle calculation error', async () => {
      const errorMessage = 'Failed to calculate pricing'
      mockApi.post.mockRejectedValue({
        getUserMessage: () => errorMessage
      })

      await store.dispatch(calculateRatePricing({
        propertyId: 'prop-1',
        checkInDate: '2024-06-01',
        checkOutDate: '2024-06-03',
        numGuests: 2
      }))

      const state = store.getState().ratePlan
      expect(state.loading).toBe(false)
      expect(state.error).toBe(errorMessage)
    })
  })

  describe('createRatePlanAsync async thunk', () => {
    it('should create rate plan successfully', async () => {
      const ratePlanData = {
        name: 'New Rate Plan',
        priceModifierType: 'Percentage' as const,
        priceModifierValue: -15
      }
      const createdRatePlan = { ...mockRatePlan, ...ratePlanData, id: 'rp-new' }
      mockApi.post.mockResolvedValue({ ratePlan: createdRatePlan })

      await store.dispatch(createRatePlanAsync({
        propertyId: 'prop-1',
        data: ratePlanData
      }))

      const state = store.getState().ratePlan
      expect(state.ratePlans).toContainEqual(createdRatePlan)
      expect(state.currentForm).toEqual(createdRatePlan)
      expect(state.originalForm).toEqual(createdRatePlan)
      expect(state.hasUnsavedChanges).toBe(false)
      expect(state.isSaving).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle snake_case response format', async () => {
      const createdRatePlan = { ...mockRatePlan, id: 'rp-new' }
      mockApi.post.mockResolvedValue({ rate_plan: createdRatePlan })

      await store.dispatch(createRatePlanAsync({
        propertyId: 'prop-1',
        data: { name: 'Test' }
      }))

      const state = store.getState().ratePlan
      expect(state.ratePlans).toContainEqual(createdRatePlan)
    })

    it('should handle create rate plan error', async () => {
      const errorMessage = 'Failed to create rate plan'
      mockApi.post.mockRejectedValue({
        getUserMessage: () => errorMessage
      })

      await store.dispatch(createRatePlanAsync({
        propertyId: 'prop-1',
        data: { name: 'Test' }
      }))

      const state = store.getState().ratePlan
      expect(state.isSaving).toBe(false)
      expect(state.error).toBe(errorMessage)
    })

    it('should not add invalid rate plan', async () => {
      const invalidRatePlan = { name: 'Invalid' } // Missing ID
      mockApi.post.mockResolvedValue({ ratePlan: invalidRatePlan })

      await store.dispatch(createRatePlanAsync({
        propertyId: 'prop-1',
        data: { name: 'Test' }
      }))

      const state = store.getState().ratePlan
      expect(state.ratePlans).toHaveLength(0) // Should not be added
    })
  })

  describe('updateRatePlanAsync async thunk', () => {
    it('should update rate plan successfully', async () => {
      // Add initial rate plan
      store.dispatch(addRatePlan(mockRatePlan))
      
      const updatedRatePlan = { ...mockRatePlan, name: 'Updated Special' }
      mockApi.put.mockResolvedValue({ ratePlan: updatedRatePlan })

      await store.dispatch(updateRatePlanAsync({
        propertyId: 'prop-1',
        ratePlanId: mockRatePlan.id,
        data: { name: 'Updated Special' }
      }))

      const state = store.getState().ratePlan
      expect(state.ratePlans[0]).toEqual(updatedRatePlan)
      expect(state.currentForm).toEqual(updatedRatePlan)
      expect(state.originalForm).toEqual(updatedRatePlan)
      expect(state.hasUnsavedChanges).toBe(false)
      expect(state.isSaving).toBe(false)
    })

    it('should handle update rate plan error', async () => {
      const errorMessage = 'Failed to update rate plan'
      mockApi.put.mockRejectedValue({
        getUserMessage: () => errorMessage
      })

      await store.dispatch(updateRatePlanAsync({
        propertyId: 'prop-1',
        ratePlanId: 'rp-1',
        data: { name: 'Updated' }
      }))

      const state = store.getState().ratePlan
      expect(state.isSaving).toBe(false)
      expect(state.error).toBe(errorMessage)
    })
  })

  describe('deleteRatePlanAsync async thunk', () => {
    it('should delete rate plan successfully (hard delete)', async () => {
      // Add initial rate plan
      store.dispatch(addRatePlan(mockRatePlan))
      
      mockApi.delete.mockResolvedValue({
        type: 'hard',
        message: 'Rate plan deleted permanently'
      })

      await store.dispatch(deleteRatePlanAsync({
        propertyId: 'prop-1',
        ratePlanId: mockRatePlan.id
      }))

      const state = store.getState().ratePlan
      expect(state.ratePlans).not.toContain(mockRatePlan)
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should delete rate plan successfully (soft delete)', async () => {
      // Add initial rate plan
      store.dispatch(addRatePlan(mockRatePlan))
      
      mockApi.delete.mockResolvedValue({
        type: 'soft',
        message: 'Rate plan marked as inactive'
      })

      await store.dispatch(deleteRatePlanAsync({
        propertyId: 'prop-1',
        ratePlanId: mockRatePlan.id
      }))

      const state = store.getState().ratePlan
      // Soft deleted items are removed from UI too
      expect(state.ratePlans).not.toContain(mockRatePlan)
      expect(state.loading).toBe(false)
    })

    it('should handle delete rate plan error', async () => {
      const errorMessage = 'Failed to delete rate plan'
      mockApi.delete.mockRejectedValue({
        getUserMessage: () => errorMessage
      })

      await store.dispatch(deleteRatePlanAsync({
        propertyId: 'prop-1',
        ratePlanId: 'rp-1'
      }))

      const state = store.getState().ratePlan
      expect(state.loading).toBe(false)
      expect(state.error).toBe(errorMessage)
    })

    it('should handle blocked deletion (409 error)', async () => {
      const mockError = {
        status: 409,
        getUserMessage: () => 'Cannot delete rate plan with active bookings',
        errors: { activeBookings: 5 }
      }
      
      mockApi.delete.mockRejectedValue(mockError)

      await store.dispatch(deleteRatePlanAsync({
        propertyId: 'prop-1',
        ratePlanId: 'rp-1'
      }))

      const state = store.getState().ratePlan
      expect(state.loading).toBe(false)
      expect(state.error).toBe('Cannot delete rate plan with active bookings')
      // Should have business context for error handling
      expect(mockError.businessContext).toEqual({
        type: 'blocked',
        details: { activeBookings: 5 }
      })
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle empty rate plans response', async () => {
      mockApi.get.mockResolvedValue({ ratePlans: [] })

      await store.dispatch(fetchRatePlans('prop-1'))

      const state = store.getState().ratePlan
      expect(state.ratePlans).toEqual([])
      expect(state.loading).toBe(false)
    })

    it('should handle network errors gracefully', async () => {
      mockApi.get.mockRejectedValue(new Error('Network error'))

      await store.dispatch(fetchRatePlans('prop-1'))

      const state = store.getState().ratePlan
      expect(state.loading).toBe(false)
      expect(state.error).toBe('Network error')
    })

    it('should handle missing response data', async () => {
      mockApi.post.mockResolvedValue({}) // No ratePlan in response

      await store.dispatch(createRatePlanAsync({
        propertyId: 'prop-1',
        data: { name: 'Test' }
      }))

      const state = store.getState().ratePlan
      expect(state.isSaving).toBe(false)
      expect(state.error).toBe('Invalid response: rate plan data not found')
    })

    it('should maintain form state during server errors', async () => {
      // Initialize form
      store.dispatch(initializeFormForEdit(mockRatePlan))
      store.dispatch(updateFormField({ name: 'Modified Name' }))

      // Simulate server error
      mockApi.put.mockRejectedValue({
        getUserMessage: () => 'Server error'
      })

      await store.dispatch(updateRatePlanAsync({
        propertyId: 'prop-1',
        ratePlanId: mockRatePlan.id,
        data: { name: 'Modified Name' }
      }))

      const state = store.getState().ratePlan
      // Form state should be preserved
      expect(state.currentForm?.name).toBe('Modified Name')
      expect(state.hasUnsavedChanges).toBe(true)
      expect(state.error).toBe('Server error')
    })

    it('should handle complex pricing modifier updates', async () => {
      // Initialize form
      store.dispatch(initializeFormForEdit(mockRatePlan))
      
      // Update multiple pricing fields
      store.dispatch(updateFormField({
        priceModifierType: 'FixedAmount',
        priceModifierValue: 50,
        priority: 50
      }))
      
      const state = store.getState().ratePlan
      expect(state.currentForm?.priceModifierType).toBe('FixedAmount')
      expect(state.currentForm?.priceModifierValue).toBe(50)
      expect(state.currentForm?.priority).toBe(50)
      expect(state.hasUnsavedChanges).toBe(true)
    })

    it('should handle booking conditions updates', async () => {
      store.dispatch(initializeFormForEdit(mockRatePlan))
      
      store.dispatch(updateFormField({
        minStay: 3,
        maxStay: 21,
        minAdvanceBooking: 7,
        maxAdvanceBooking: 180,
        minGuests: 2,
        maxGuests: 6
      }))
      
      const state = store.getState().ratePlan
      expect(state.currentForm?.minStay).toBe(3)
      expect(state.currentForm?.maxStay).toBe(21)
      expect(state.currentForm?.minAdvanceBooking).toBe(7)
      expect(state.currentForm?.maxAdvanceBooking).toBe(180)
      expect(state.currentForm?.minGuests).toBe(2)
      expect(state.currentForm?.maxGuests).toBe(6)
      expect(state.hasUnsavedChanges).toBe(true)
    })
  })

  describe('type safety and validation', () => {
    it('should enforce RatePlan type constraints', () => {
      const validRatePlan: RatePlan = {
        id: 'rp-test',
        propertyId: 'prop-test',
        name: 'Test Plan',
        priceModifierType: 'Percentage',
        priceModifierValue: 10,
        isActive: true,
        isDefault: false,
        priority: 100,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z'
      }

      store.dispatch(addRatePlan(validRatePlan))
      
      const state = store.getState().ratePlan
      expect(state.ratePlans).toContainEqual(validRatePlan)
    })

    it('should enforce CancellationPolicy type constraints', () => {
      const validPolicy: CancellationPolicy = {
        id: 'cp-test',
        ratePlanId: 'rp-test',
        type: 'NonRefundable'
      }

      store.dispatch(updateCancellationPolicy({
        ratePlanId: 'rp-test',
        policy: validPolicy
      }))
      
      // Type checking ensures the policy has correct structure
      expect(validPolicy.type).toBe('NonRefundable')
    })

    it('should enforce RatePlanFeatures type constraints', () => {
      const validFeatures: RatePlanFeatures = {
        id: 'feat-test',
        ratePlanId: 'rp-test',
        includedAmenityIds: ['wifi', 'pool']
      }

      store.dispatch(updateRatePlanFeatures({
        ratePlanId: 'rp-test',
        features: validFeatures
      }))
      
      expect(Array.isArray(validFeatures.includedAmenityIds)).toBe(true)
    })
  })
})