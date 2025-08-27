import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '@/utils/api'

interface RatePlan {
  id: string
  propertyId: string
  name: string
  type: 'FullyFlexible' | 'NonRefundable' | 'Custom'
  description?: string
  cancellationPolicy: string
  includesBreakfast: boolean
  percentage: number
  restrictions?: Restriction[]
  prices?: Price[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Restriction {
  id: string
  type: 'MinLengthOfStay' | 'MaxLengthOfStay' | 'NoArrivals' | 'NoDepartures' | 
        'MinAdvancedReservation' | 'MaxAdvancedReservation'
  value: number
  startDate?: string
  endDate?: string
}

interface Price {
  id: string
  date: string
  amount: number
}

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
    
    // Restrictions
    addRestriction: (state, action: PayloadAction<{ ratePlanId: string; restriction: Restriction }>) => {
      const ratePlan = state.ratePlans.find(rp => rp.id === action.payload.ratePlanId)
      if (ratePlan) {
        if (!ratePlan.restrictions) {
          ratePlan.restrictions = []
        }
        ratePlan.restrictions.push(action.payload.restriction)
      }
    },
    
    updateRestriction: (state, action: PayloadAction<{ ratePlanId: string; restriction: Restriction }>) => {
      const ratePlan = state.ratePlans.find(rp => rp.id === action.payload.ratePlanId)
      if (ratePlan && ratePlan.restrictions) {
        const index = ratePlan.restrictions.findIndex(r => r.id === action.payload.restriction.id)
        if (index !== -1) {
          ratePlan.restrictions[index] = action.payload.restriction
        }
      }
    },
    
    deleteRestriction: (state, action: PayloadAction<{ ratePlanId: string; restrictionId: string }>) => {
      const ratePlan = state.ratePlans.find(rp => rp.id === action.payload.ratePlanId)
      if (ratePlan && ratePlan.restrictions) {
        ratePlan.restrictions = ratePlan.restrictions.filter(r => r.id !== action.payload.restrictionId)
      }
    },
    
    // Pricing
    setPrices: (state, action: PayloadAction<{ ratePlanId: string; prices: Price[] }>) => {
      const ratePlan = state.ratePlans.find(rp => rp.id === action.payload.ratePlanId)
      if (ratePlan) {
        ratePlan.prices = action.payload.prices
      }
    },
    
    updatePrice: (state, action: PayloadAction<{ ratePlanId: string; date: string; amount: number }>) => {
      const ratePlan = state.ratePlans.find(rp => rp.id === action.payload.ratePlanId)
      if (ratePlan) {
        if (!ratePlan.prices) {
          ratePlan.prices = []
        }
        const priceIndex = ratePlan.prices.findIndex(p => p.date === action.payload.date)
        if (priceIndex !== -1) {
          ratePlan.prices[priceIndex].amount = action.payload.amount
        } else {
          ratePlan.prices.push({
            id: `price_${Date.now()}`,
            date: action.payload.date,
            amount: action.payload.amount
          })
        }
      }
    },
    
    // Form management actions
    initializeFormForCreate: (state, action: PayloadAction<string>) => {
      const propertyId = action.payload
      state.currentForm = {
        id: '', // Will be generated on save
        propertyId,
        name: '',
        type: 'FullyFlexible',
        description: '',
        cancellationPolicy: '',
        includesBreakfast: false,
        percentage: 0,
        isActive: true,
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
        state.ratePlans = state.ratePlans.filter(plan => plan.id !== action.payload)
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
  addRestriction,
  updateRestriction,
  deleteRestriction,
  setPrices,
  updatePrice,
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
    try {
      const response = await api.get<{ ratePlans?: RatePlan[]; rate_plans?: RatePlan[] }>(`/api/properties/${propertyId}/rate-plans`)
      // Handle both camelCase and snake_case responses
      return response.ratePlans || response.rate_plans || []
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch rate plans')
    }
  }
)

export const createRatePlanAsync = createAsyncThunk(
  'ratePlan/create',
  async (params: { propertyId: string; data: Partial<RatePlan> }, { rejectWithValue }) => {
    try {
      const response = await api.post<{ ratePlan?: RatePlan; rate_plan?: RatePlan }>(`/api/properties/${params.propertyId}/rate-plans`, params.data)
      // Handle both camelCase and snake_case responses
      const ratePlan = response.ratePlan || response.rate_plan
      if (!ratePlan) {
        throw new Error('Invalid response: rate plan data not found')
      }
      return ratePlan
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create rate plan')
    }
  }
)

export const updateRatePlanAsync = createAsyncThunk(
  'ratePlan/update',
  async (params: { propertyId: string; ratePlanId: string; data: Partial<RatePlan> }, { rejectWithValue }) => {
    try {
      const response = await api.put<{ ratePlan?: RatePlan; rate_plan?: RatePlan }>(`/api/properties/${params.propertyId}/rate-plans/${params.ratePlanId}`, params.data)
      // Handle both camelCase and snake_case responses
      const ratePlan = response.ratePlan || response.rate_plan
      if (!ratePlan) {
        throw new Error('Invalid response: rate plan data not found')
      }
      return ratePlan
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update rate plan')
    }
  }
)

export const deleteRatePlanAsync = createAsyncThunk(
  'ratePlan/delete',
  async (params: { propertyId: string; ratePlanId: string }, { rejectWithValue }) => {
    try {
      await api.delete(`/api/properties/${params.propertyId}/rate-plans/${params.ratePlanId}`)
      return params.ratePlanId
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete rate plan')
    }
  }
)

// Legacy thunk for backward compatibility - will be replaced
export const createRatePlan = (propertyId: string, ratePlan: Partial<RatePlan>) => async (dispatch: any) => {
  return dispatch(createRatePlanAsync({ propertyId, data: ratePlan }))
}

export default ratePlanSlice.reducer