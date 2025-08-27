import { createSlice, PayloadAction } from '@reduxjs/toolkit'
// import { api } from '@/utils/api' // Uncomment when API is available

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
    
    // Clear state
    clearRatePlans: () => {
      return initialState
    }
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
  clearRatePlans
} = ratePlanSlice.actions

// Thunks for async operations
export const fetchRatePlans = (propertyId: string) => async (dispatch: any) => {
  dispatch(setLoading(true))
  try {
    // For demo purposes, we'll use mock data
    const mockRatePlans: RatePlan[] = [
      {
        id: 'rp1',
        propertyId,
        name: 'Flexible Cancellation',
        type: 'FullyFlexible',
        description: 'Free cancellation up to 24 hours before check-in',
        cancellationPolicy: 'Free cancellation until 24 hours before check-in',
        includesBreakfast: false,
        percentage: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'rp2',
        propertyId,
        name: 'Non-Refundable Rate',
        type: 'NonRefundable',
        description: 'Save 15% with our non-refundable rate',
        cancellationPolicy: 'No refunds after booking confirmation',
        includesBreakfast: false,
        percentage: 15,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    
    // Simulate API delay
    setTimeout(() => {
      dispatch(setRatePlans(mockRatePlans))
    }, 500)
    
    // Real implementation:
    // const response = await api.get(`/api/properties/${propertyId}/rate-plans`)
    // dispatch(setRatePlans(response.data))
  } catch (error: any) {
    dispatch(setError(error.message || 'Failed to fetch rate plans'))
  }
}

export const createRatePlan = (propertyId: string, ratePlan: Partial<RatePlan>) => async (dispatch: any) => {
  dispatch(setLoading(true))
  try {
    // Mock creation
    const newRatePlan: RatePlan = {
      id: `rp_${Date.now()}`,
      propertyId,
      name: ratePlan.name || '',
      type: ratePlan.type || 'FullyFlexible',
      description: ratePlan.description,
      cancellationPolicy: ratePlan.cancellationPolicy || '',
      includesBreakfast: ratePlan.includesBreakfast || false,
      percentage: ratePlan.percentage || 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    setTimeout(() => {
      dispatch(addRatePlan(newRatePlan))
    }, 500)
    
    return newRatePlan
    
    // Real implementation:
    // const response = await api.post(`/api/properties/${propertyId}/rate-plans`, ratePlan)
    // dispatch(addRatePlan(response.data))
    // return response.data
  } catch (error: any) {
    dispatch(setError(error.message || 'Failed to create rate plan'))
    throw error
  }
}

export const updateRatePlanAsync = (ratePlanId: string, updates: Partial<RatePlan>) => async (dispatch: any) => {
  dispatch(setLoading(true))
  try {
    // Mock update
    const updatedRatePlan = {
      ...updates,
      id: ratePlanId,
      updatedAt: new Date().toISOString()
    } as RatePlan
    
    setTimeout(() => {
      dispatch(updateRatePlan(updatedRatePlan))
    }, 300)
    
    return updatedRatePlan
    
    // Real implementation:
    // const response = await api.put(`/api/rate-plans/${ratePlanId}`, updates)
    // dispatch(updateRatePlan(response.data))
    // return response.data
  } catch (error: any) {
    dispatch(setError(error.message || 'Failed to update rate plan'))
    throw error
  }
}

export const deleteRatePlanAsync = (ratePlanId: string) => async (dispatch: any) => {
  dispatch(setLoading(true))
  try {
    // Mock deletion
    setTimeout(() => {
      dispatch(deleteRatePlan(ratePlanId))
    }, 300)
    
    // Real implementation:
    // await api.delete(`/api/rate-plans/${ratePlanId}`)
    // dispatch(deleteRatePlan(ratePlanId))
  } catch (error: any) {
    dispatch(setError(error.message || 'Failed to delete rate plan'))
    throw error
  }
}

export default ratePlanSlice.reducer