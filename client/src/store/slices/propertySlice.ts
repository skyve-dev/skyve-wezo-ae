import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Property, PropertyState, WizardFormData, Photo } from '../../types/property'
import { api } from '../../utils/api'

const WIZARD_STORAGE_KEY = 'property-wizard-data'

const initialState: PropertyState = {
  properties: [],
  currentProperty: null,
  wizardData: null,
  loading: false,
  error: null
}

// Load wizard data from localStorage
const loadWizardDataFromStorage = (): WizardFormData | null => {
  try {
    const stored = localStorage.getItem(WIZARD_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error('Error loading wizard data from localStorage:', error)
    return null
  }
}

// Save wizard data to localStorage
const saveWizardDataToStorage = (data: WizardFormData | null) => {
  try {
    if (data) {
      localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify({
        ...data,
        lastSaved: new Date().toISOString()
      }))
    } else {
      localStorage.removeItem(WIZARD_STORAGE_KEY)
    }
  } catch (error) {
    console.error('Error saving wizard data to localStorage:', error)
  }
}

// Async thunks
export const fetchMyProperties = createAsyncThunk(
  'property/fetchMyProperties',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<{ properties: Property[] }>('/api/property/my-properties')
      return response.properties
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch properties')
    }
  }
)

export const fetchPropertyById = createAsyncThunk(
  'property/fetchPropertyById',
  async (propertyId: string, { rejectWithValue }) => {
    try {
      const response = await api.get<{ property: Property }>(`/api/property/${propertyId}`)
      return response.property
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch property')
    }
  }
)

export const createProperty = createAsyncThunk(
  'property/createProperty',
  async (propertyData: Property, { rejectWithValue }) => {
    try {
      const response = await api.post<{ property: Property }>('/api/property', propertyData)
      return response.property
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create property')
    }
  }
)

export const updateProperty = createAsyncThunk(
  'property/updateProperty',
  async ({ propertyId, data }: { propertyId: string; data: Partial<Property> }, { rejectWithValue }) => {
    try {
      const response = await api.put<{ property: Property }>(`/api/property/${propertyId}`, data)
      return response.property
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update property')
    }
  }
)

export const deleteProperty = createAsyncThunk(
  'property/deleteProperty',
  async (propertyId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/property/${propertyId}`)
      return propertyId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete property')
    }
  }
)

export const uploadPropertyPhotos = createAsyncThunk(
  'property/uploadPropertyPhotos',
  async ({ propertyId, files }: { propertyId: string; files: File[] }, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('photos', file)
      })

      const response = await api.post<{ photos: Photo[] }>(`/api/property/${propertyId}/photos`, formData, {})
      return response.photos
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to upload photos')
    }
  }
)

export const deletePropertyPhoto = createAsyncThunk(
  'property/deletePropertyPhoto',
  async ({ propertyId, photoId }: { propertyId: string; photoId: string }, { rejectWithValue }) => {
    try {
      await api.delete(`/api/property/${propertyId}/photos/${photoId}`)
      return photoId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete photo')
    }
  }
)

const propertySlice = createSlice({
  name: 'property',
  initialState: {
    ...initialState,
    wizardData: loadWizardDataFromStorage()
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentProperty: (state, action: PayloadAction<Property | null>) => {
      state.currentProperty = action.payload
    },
    initializeWizard: (state, action: PayloadAction<Partial<WizardFormData>>) => {
      const defaultWizardData: WizardFormData = {
        name: '',
        address: {
          countryOrRegion: 'UAE',
          city: '',
          zipCode: ''
        },
        layout: {
          maximumGuest: 1,
          bathrooms: 1,
          allowChildren: false,
          offerCribs: false
        },
        services: {
          serveBreakfast: false,
          parking: false,
          languages: []
        },
        rules: {
          smokingAllowed: false,
          partiesOrEventsAllowed: false,
          petsAllowed: false
        },
        bookingType: 'REQUEST',
        paymentType: 'FULL',
        currentStep: 1,
        isComplete: false,
        ...action.payload
      }
      
      state.wizardData = defaultWizardData
      saveWizardDataToStorage(defaultWizardData)
    },
    updateWizardData: (state, action: PayloadAction<Partial<WizardFormData>>) => {
      if (state.wizardData) {
        state.wizardData = { ...state.wizardData, ...action.payload }
        saveWizardDataToStorage(state.wizardData)
      }
    },
    setWizardStep: (state, action: PayloadAction<number>) => {
      if (state.wizardData) {
        state.wizardData.currentStep = action.payload
        saveWizardDataToStorage(state.wizardData)
      }
    },
    clearWizardData: (state) => {
      state.wizardData = null
      saveWizardDataToStorage(null)
    },
    completeWizard: (state) => {
      if (state.wizardData) {
        state.wizardData.isComplete = true
        saveWizardDataToStorage(state.wizardData)
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch my properties
      .addCase(fetchMyProperties.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMyProperties.fulfilled, (state, action) => {
        state.loading = false
        state.properties = action.payload
      })
      .addCase(fetchMyProperties.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Fetch property by ID
      .addCase(fetchPropertyById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPropertyById.fulfilled, (state, action) => {
        state.loading = false
        state.currentProperty = action.payload
      })
      .addCase(fetchPropertyById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Create property
      .addCase(createProperty.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        state.loading = false
        state.properties.push(action.payload)
        state.currentProperty = action.payload
        // Clear wizard data on successful creation
        state.wizardData = null
        saveWizardDataToStorage(null)
      })
      .addCase(createProperty.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Update property
      .addCase(updateProperty.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        state.loading = false
        const index = state.properties.findIndex(p => p.propertyId === action.payload.propertyId)
        if (index !== -1) {
          state.properties[index] = action.payload
        }
        if (state.currentProperty?.propertyId === action.payload.propertyId) {
          state.currentProperty = action.payload
        }
      })
      .addCase(updateProperty.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Delete property
      .addCase(deleteProperty.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.loading = false
        state.properties = state.properties.filter(p => p.propertyId !== action.payload)
        if (state.currentProperty?.propertyId === action.payload) {
          state.currentProperty = null
        }
      })
      .addCase(deleteProperty.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Upload property photos
      .addCase(uploadPropertyPhotos.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(uploadPropertyPhotos.fulfilled, (state, action) => {
        state.loading = false
        if (state.currentProperty) {
          state.currentProperty.photos = [
            ...(state.currentProperty.photos || []),
            ...action.payload
          ]
        }
      })
      .addCase(uploadPropertyPhotos.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Delete property photo
      .addCase(deletePropertyPhoto.fulfilled, (state, action) => {
        if (state.currentProperty?.photos) {
          state.currentProperty.photos = state.currentProperty.photos.filter(
            photo => photo.id !== action.payload
          )
        }
        // Update wizard data if photo was deleted during wizard
        if (state.wizardData?.photos) {
          state.wizardData.photos = state.wizardData.photos.filter(
            photo => photo.id !== action.payload
          )
          saveWizardDataToStorage(state.wizardData)
        }
      })
  }
})

export const {
  clearError,
  setCurrentProperty,
  initializeWizard,
  updateWizardData,
  setWizardStep,
  clearWizardData,
  completeWizard
} = propertySlice.actions

export default propertySlice.reducer