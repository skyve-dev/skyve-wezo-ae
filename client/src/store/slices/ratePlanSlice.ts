import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '@/utils/api'

// Updated interface to match new backend schema exactly
interface RatePlan {
  id: string
  propertyId: string
  name: string
  description?: string
  
  // Price Modifier (applied to base PropertyPricing)
  priceModifierType: 'Percentage' | 'FixedAmount'
  priceModifierValue: number
  
  // Booking Conditions (integrated directly into RatePlan)
  minStay?: number
  maxStay?: number
  minAdvanceBooking?: number
  maxAdvanceBooking?: number
  minGuests?: number
  maxGuests?: number
  
  // Control and Display
  isActive: boolean
  isDefault: boolean
  priority: number
  
  // Relations
  features?: RatePlanFeatures
  cancellationPolicy?: CancellationPolicy
  
  createdAt: string
  updatedAt: string
}

// Simplified cancellation policy interface matching new schema
interface CancellationPolicy {
  id: string
  ratePlanId: string
  type: 'FullyFlexible' | 'Moderate' | 'NonRefundable'
  freeCancellationDays?: number
  partialRefundDays?: number
}

// New RatePlanFeatures interface for amenity management
interface RatePlanFeatures {
  id: string
  ratePlanId: string
  includedAmenityIds: string[]
}

// Removed RatePlanRestriction - now integrated directly into RatePlan
// Removed Price - pricing now handled through PropertyPricing + modifiers

interface RatePlanState {
  ratePlans: RatePlan[]
  selectedRatePlan: RatePlan | null
  
  // Form management (CRITICAL: No local formData - use Redux)
  currentForm: RatePlan | null
  originalForm: RatePlan | null  // For change detection
  hasUnsavedChanges: boolean
  formValidationErrors: Record<string, string>
  
  // Loading states
  isSaving: boolean
  loading: boolean
  error: string | null
  
  filters: {
    propertyId?: string
    isActive?: boolean
  }
}

const initialState: RatePlanState = {
  ratePlans: [],
  selectedRatePlan: null,
  
  // Form state
  currentForm: null,
  originalForm: null,
  hasUnsavedChanges: false,
  formValidationErrors: {},
  
  // Loading states
  isSaving: false,
  loading: false,
  error: null,
  
  filters: {}
}

const ratePlanSlice = createSlice({
  name: 'ratePlan',
  initialState,
  reducers: {
    // Basic CRUD operations
    setRatePlans: (state, action: PayloadAction<RatePlan[]>) => {
      state.ratePlans = action.payload
      state.error = null
    },
    
    addRatePlan: (state, action: PayloadAction<RatePlan>) => {
      state.ratePlans.push(action.payload)
    },
    
    updateRatePlan: (state, action: PayloadAction<RatePlan>) => {
      const index = state.ratePlans.findIndex(rp => rp.id === action.payload.id)
      if (index !== -1) {
        state.ratePlans[index] = action.payload
      }
    },
    
    deleteRatePlan: (state, action: PayloadAction<string>) => {
      state.ratePlans = state.ratePlans.filter(rp => rp.id !== action.payload)
    },
    
    // Selection
    selectRatePlan: (state, action: PayloadAction<RatePlan | null>) => {
      state.selectedRatePlan = action.payload
    },
    
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
    
    // Filters
    setFilters: (state, action: PayloadAction<Partial<RatePlanState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    
    // RatePlanFeatures management
    updateRatePlanFeatures: (state, action: PayloadAction<{ ratePlanId: string; features: RatePlanFeatures }>) => {
      const ratePlan = state.ratePlans.find(rp => rp.id === action.payload.ratePlanId)
      if (ratePlan) {
        ratePlan.features = action.payload.features
      }
      // Also update currentForm if it matches
      if (state.currentForm && state.currentForm.id === action.payload.ratePlanId) {
        state.currentForm.features = action.payload.features
      }
    },
    
    // Cancellation Policy management
    updateCancellationPolicy: (state, action: PayloadAction<{ ratePlanId: string; policy: CancellationPolicy }>) => {
      const ratePlan = state.ratePlans.find(rp => rp.id === action.payload.ratePlanId)
      if (ratePlan) {
        ratePlan.cancellationPolicy = action.payload.policy
      }
      // Also update currentForm if it matches
      if (state.currentForm && state.currentForm.id === action.payload.ratePlanId) {
        state.currentForm.cancellationPolicy = action.payload.policy
      }
    },
    
    // Form management actions - Updated for new backend schema
    initializeFormForCreate: (state, action: PayloadAction<string>) => {
      const propertyId = action.payload
      state.currentForm = {
        id: '', // Will be generated on save
        propertyId,
        name: '',
        description: '',
        
        // Price Modifier (applied to base PropertyPricing)
        priceModifierType: 'Percentage',
        priceModifierValue: 0,
        
        // Booking Conditions (all optional)
        minStay: undefined,
        maxStay: undefined,
        minAdvanceBooking: undefined,
        maxAdvanceBooking: undefined,
        minGuests: undefined,
        maxGuests: undefined,
        
        // Control and Display
        isActive: true,
        isDefault: false,
        priority: 100,
        
        // Relations
        features: undefined,
        cancellationPolicy: undefined,
        
        createdAt: '',
        updatedAt: ''
      }
      state.originalForm = { ...state.currentForm }
      state.hasUnsavedChanges = false
      state.formValidationErrors = {}
    },
    
    initializeFormForEdit: (state, action: PayloadAction<RatePlan>) => {
      state.currentForm = { ...action.payload }
      state.originalForm = { ...action.payload }
      state.hasUnsavedChanges = false
      state.formValidationErrors = {}
    },
    
    updateFormField: (state, action: PayloadAction<Partial<RatePlan>>) => {
      if (state.currentForm) {
        state.currentForm = { ...state.currentForm, ...action.payload }
        // Detect changes
        state.hasUnsavedChanges = JSON.stringify(state.currentForm) !== JSON.stringify(state.originalForm)
      }
    },
    
    resetFormToOriginal: (state) => {
      if (state.originalForm) {
        state.currentForm = { ...state.originalForm }
        state.hasUnsavedChanges = false
        state.formValidationErrors = {}
      }
    },
    
    clearForm: (state) => {
      state.currentForm = null
      state.originalForm = null
      state.hasUnsavedChanges = false
      state.formValidationErrors = {}
    },
    
    setFormValidationErrors: (state, action: PayloadAction<Record<string, string>>) => {
      state.formValidationErrors = action.payload
    },

    // Clear state
    clearRatePlans: () => {
      return initialState
    }
  },
  
  extraReducers: (builder) => {
    // Handle async thunk results
    builder
      // Fetch rate plans
      .addCase(fetchRatePlans.pending, (state) => {
        console.log('🟣 ratePlanSlice - fetchRatePlans.pending')
        state.loading = true
        state.error = null
      })
      .addCase(fetchRatePlans.fulfilled, (state, action) => {

        // Filter out invalid rate plans to prevent UI errors
        state.ratePlans = (action.payload || []).filter(plan => plan && plan.id)
        state.loading = false
        state.error = null
      })
      .addCase(fetchRatePlans.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Fetch public rate plans
      .addCase(fetchPublicRatePlans.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPublicRatePlans.fulfilled, (state, action) => {
        state.ratePlans = (action.payload || []).filter(plan => plan && plan.id)
        state.loading = false
        state.error = null
      })
      .addCase(fetchPublicRatePlans.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Calculate rate pricing
      .addCase(calculateRatePricing.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(calculateRatePricing.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(calculateRatePricing.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Create rate plan
      .addCase(createRatePlanAsync.pending, (state) => {
        state.isSaving = true
        state.error = null
      })
      .addCase(createRatePlanAsync.fulfilled, (state, action) => {
        // Only add valid rate plans to prevent UI errors
        if (action.payload && action.payload.id) {
          state.ratePlans.push(action.payload)
          state.currentForm = action.payload
          state.originalForm = { ...action.payload }
        }
        state.hasUnsavedChanges = false
        state.isSaving = false
        state.error = null
      })
      .addCase(createRatePlanAsync.rejected, (state, action) => {
        state.isSaving = false
        state.error = action.payload as string
      })
      
      // Update rate plan
      .addCase(updateRatePlanAsync.pending, (state) => {
        state.isSaving = true
        state.error = null
      })
      .addCase(updateRatePlanAsync.fulfilled, (state, action) => {
        // Only update valid rate plans to prevent UI errors
        if (action.payload && action.payload.id) {
          const index = state.ratePlans.findIndex(plan => plan.id === action.payload.id)
          if (index !== -1) {
            state.ratePlans[index] = action.payload
          }
          state.currentForm = action.payload
          state.originalForm = { ...action.payload }
        }
        state.hasUnsavedChanges = false
        state.isSaving = false
        state.error = null
      })
      .addCase(updateRatePlanAsync.rejected, (state, action) => {
        state.isSaving = false
        state.error = action.payload as string
      })
      
      // Delete rate plan
      .addCase(deleteRatePlanAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteRatePlanAsync.fulfilled, (state, action) => {
        const { ratePlanId } = action.payload
        
        // For both hard and soft delete, remove from UI (soft deleted items are inactive anyway)
        state.ratePlans = state.ratePlans.filter(plan => plan.id !== ratePlanId)
        state.loading = false
        state.error = null
      })
      .addCase(deleteRatePlanAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

// Export actions
export const {
  setRatePlans,
  addRatePlan,
  updateRatePlan,
  deleteRatePlan,
  selectRatePlan,
  setLoading,
  setError,
  setFilters,
  // Updated feature and policy actions
  updateRatePlanFeatures,
  updateCancellationPolicy,
  clearRatePlans,
  // Form management actions
  initializeFormForCreate,
  initializeFormForEdit,
  updateFormField,
  resetFormToOriginal,
  clearForm,
  setFormValidationErrors
} = ratePlanSlice.actions

// Async thunks with proper API integration
export const fetchRatePlans = createAsyncThunk(
  'ratePlan/fetchRatePlans',
  async (propertyId: string, { rejectWithValue }) => {
    console.log('🟣 fetchRatePlans THUNK called for propertyId:', propertyId)
    try {
      const response = await api.get<{ ratePlans?: RatePlan[]; rate_plans?: RatePlan[] }>(`/api/properties/${propertyId}/rate-plans`)
      // Handle both camelCase and snake_case responses
      const result = response.ratePlans || response.rate_plans || []

      return result
    } catch (error: any) {
      console.log('🟣 fetchRatePlans ERROR:', error)
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to fetch rate plans'
      return rejectWithValue(errorMessage)
    }
  }
)

export const fetchPublicRatePlans = createAsyncThunk(
  'ratePlan/fetchPublicRatePlans',
  async (propertyId: string, { rejectWithValue }) => {
    try {
      const response = await api.get<{ ratePlans?: RatePlan[]; rate_plans?: RatePlan[] }>(`/api/properties/${propertyId}/rate-plans/public`)
      const result = response.ratePlans || response.rate_plans || []
      return result
    } catch (error: any) {
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to fetch public rate plans'
      return rejectWithValue(errorMessage)
    }
  }
)

export const calculateRatePricing = createAsyncThunk(
  'ratePlan/calculatePricing',
  async (params: { propertyId: string; checkInDate: string; checkOutDate: string; numGuests: number }, { rejectWithValue }) => {
    try {
      const response = await api.post<{ calculation: any }>(`/api/properties/${params.propertyId}/rate-plans/calculate`, {
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        numGuests: params.numGuests
      })
      return response.calculation
    } catch (error: any) {
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to calculate pricing'
      return rejectWithValue(errorMessage)
    }
  }
)

// Helper function to clean rate plan data before sending to API
// Converts null values to undefined for optional numeric fields and removes read-only fields
const cleanRatePlanData = (data: Partial<RatePlan>): Partial<RatePlan> => {
  const cleaned = { ...data }
  
  // Remove fields that should never be sent in create/update requests
  const fieldsToRemove = [
    'id',           // ID should only be in the URL/where clause, not in data
    'propertyId',   // Property ID is in the URL
    'stats',        // Read-only calculated field
    'createdAt',    // Managed by database
    'updatedAt',    // Managed by database
  ] as const
  
  fieldsToRemove.forEach(field => {
    delete cleaned[field]
  })
  
  // Clean nested objects
  if (cleaned.features) {
    // Remove id and ratePlanId from features as they're set by the backend
    const { id, ratePlanId, ...featuresWithoutIds } = cleaned.features as any
    cleaned.features = featuresWithoutIds
  }
  
  if (cleaned.cancellationPolicy) {
    // Remove id and ratePlanId from cancellation policy
    const { id, ratePlanId, ...policyWithoutIds } = cleaned.cancellationPolicy as any
    cleaned.cancellationPolicy = policyWithoutIds
  }
  
  // List of optional numeric fields that should not be null
  const optionalNumericFields = [
    'minStay',
    'maxStay',
    'minAdvanceBooking',
    'maxAdvanceBooking',
    'minGuests',
    'maxGuests'
  ] as const
  
  // Convert null to undefined for these fields
  optionalNumericFields.forEach(field => {
    if (cleaned[field] === null) {
      cleaned[field] = undefined
    }
  })
  
  return cleaned
}

export const createRatePlanAsync = createAsyncThunk(
  'ratePlan/create',
  async (params: { propertyId: string; data: Partial<RatePlan> }, { rejectWithValue }) => {
    try {
      // Clean the data before sending to API
      const cleanedData = cleanRatePlanData(params.data)
      
      const response = await api.post<{ ratePlan?: RatePlan; rate_plan?: RatePlan }>(`/api/properties/${params.propertyId}/rate-plans`, cleanedData)
      // Handle both camelCase and snake_case responses
      const ratePlan = response.ratePlan || response.rate_plan
      if (!ratePlan) {
        throw new Error('Invalid response: rate plan data not found')
      }
      return ratePlan
    } catch (error: any) {
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to create rate plan'
      return rejectWithValue(errorMessage)
    }
  }
)

export const updateRatePlanAsync = createAsyncThunk(
  'ratePlan/update',
  async (params: { propertyId: string; ratePlanId: string; data: Partial<RatePlan> }, { rejectWithValue }) => {
    try {
      // Clean the data before sending to API
      const cleanedData = cleanRatePlanData(params.data)
      
      const response = await api.put<{ ratePlan?: RatePlan; rate_plan?: RatePlan }>(`/api/properties/${params.propertyId}/rate-plans/${params.ratePlanId}`, cleanedData)
      // Handle both camelCase and snake_case responses
      const ratePlan = response.ratePlan || response.rate_plan
      if (!ratePlan) {
        throw new Error('Invalid response: rate plan data not found')
      }
      return ratePlan
    } catch (error: any) {
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to update rate plan'
      return rejectWithValue(errorMessage)
    }
  }
)

export const deleteRatePlanAsync = createAsyncThunk(
  'ratePlan/delete',
  async (params: { propertyId: string; ratePlanId: string }, { rejectWithValue }) => {
    try {
      const response = await api.delete<{ type: 'hard' | 'soft'; message: string; details?: any }>(`/api/properties/${params.propertyId}/rate-plans/${params.ratePlanId}`)
      
      // For successful deletion (hard or soft), return the response data
      return {
        ratePlanId: params.ratePlanId,
        ...response
      }
    } catch (error: any) {
      // For delete operations, we need to preserve special business logic
      // but still pass the full ApiError for proper error dialog handling
      if (error.status === 409) {
        // Create enhanced error with business context for blocked deletions
        error.businessContext = {
          type: 'blocked',
          details: error.errors || {}
        }
      }
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to delete rate plan'
      return rejectWithValue(errorMessage)
    }
  }
)

// Legacy thunk for backward compatibility - will be replaced
export const createRatePlan = (propertyId: string, ratePlan: Partial<RatePlan>) => async (dispatch: any) => {
  return dispatch(createRatePlanAsync({ propertyId, data: ratePlan }))
}

// Export types for use in components
export type { RatePlan, CancellationPolicy, RatePlanFeatures }

export default ratePlanSlice.reducer