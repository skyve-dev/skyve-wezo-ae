import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Property, PropertyState, WizardFormData, Photo } from '../../types/property'
import { api } from '../../utils/api'
import { BookingType, PaymentType, ParkingType, PetPolicy, Currency } from '../../constants/propertyEnums'

const WIZARD_STORAGE_KEY = 'property-wizard-data'

// Debug utility to help identify data structure mismatches
const debugServerDataStructure = (_serverData: any, _context: string = '') => {
  // Debug logging removed for cleaner devtools
}

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

// Transform flattened wizard data to nested server format
const transformPropertyDataForServer = (data: WizardFormData) => {
  // Prepare the transformed data with required structure
  const transformedData: any = {
    name: data.name,
    address: {
      apartmentOrFloorNumber: data.address.apartmentOrFloorNumber,
      countryOrRegion: data.address.countryOrRegion,
      city: data.address.city,
      zipCode: data.address.zipCode,
    },
    layout: {
      maximumGuest: data.maximumGuest,
      bathrooms: data.bathrooms,
      allowChildren: data.allowChildren,
      offerCribs: data.offerCribs,
    },
    amenities: data.amenities || [],
    services: {
      serveBreakfast: data.serveBreakfast,
      parking: data.parking,
      languages: data.languages || [],
    },
    rules: {
      smokingAllowed: data.smokingAllowed,
      partiesOrEventsAllowed: data.partiesOrEventsAllowed,
      petsAllowed: data.petsAllowed,
    },
    // Filter out blob URLs from photos and ensure proper structure
    photos: (data.photos || []).map(photo => ({
      id: photo.id, // Include photo ID for server-side linking
      url: photo.url.startsWith('blob:') ? '' : photo.url, // Skip blob URLs
      altText: photo.altText || '',
      description: photo.description || '',
      tags: photo.tags || []
    })).filter(photo => photo.url && photo.id), // Only include photos with valid URLs and IDs
    bookingType: data.bookingType,
    paymentType: data.paymentType,
    aboutTheProperty: data.aboutTheProperty,
    aboutTheNeighborhood: data.aboutTheNeighborhood,
  }

  // Add optional fields only if they exist
  if (data.address.latLong) {
    transformedData.address.latLong = {
      latitude: data.address.latLong.latitude,
      longitude: data.address.latLong.longitude,
    }
  }

  if (data.propertySizeSqMtr) {
    transformedData.layout.propertySizeSqMtr = data.propertySizeSqMtr
  }

  if (data.rooms && data.rooms.length > 0) {
    transformedData.layout.rooms = data.rooms
  }

  // Always include checkInCheckout in rules, with defaults if not provided
  transformedData.rules.checkInCheckout = data.checkInCheckout || {
    checkInFrom: '14:00',
    checkInUntil: '22:00',
    checkOutFrom: '08:00',
    checkOutUntil: '12:00'
  }

  if (data.pricing) {
    transformedData.pricing = data.pricing
  }

  // Always include cancellation with defaults if not provided
  transformedData.cancellation = data.cancellation || {
    daysBeforeArrivalFreeToCancel: 7,
    waiveCancellationFeeAccidentalBookings: true
  }

  if (data.firstDateGuestCanCheckIn) {
    transformedData.firstDateGuestCanCheckIn = data.firstDateGuestCanCheckIn
  }

  return transformedData
}

// Transform server property data to flattened client format
// Handles both nested (layout/services/rules objects) and flat server structures
// This ensures compatibility with different API response formats
const transformServerPropertyData = (serverData: any): Property => {
  debugServerDataStructure(serverData, '- transformServerPropertyData')
  
  return {
    propertyId: serverData.propertyId,
    name: serverData.name,
    address: serverData.address,
    
    // Flatten layout fields - handle both nested and flat server structures
    maximumGuest: serverData.layout?.maximumGuest ?? serverData.maximumGuest ?? 0,
    bathrooms: serverData.layout?.bathrooms ?? serverData.bathrooms ?? 0,
    allowChildren: serverData.layout?.allowChildren ?? serverData.allowChildren ?? false,
    offerCribs: serverData.layout?.offerCribs ?? serverData.offerCribs ?? false,
    propertySizeSqMtr: serverData.layout?.propertySizeSqMtr ?? serverData.propertySizeSqMtr,
    rooms: serverData.layout?.rooms ?? serverData.rooms,
    
    amenities: serverData.amenities,
    
    // Flatten services fields - handle both nested and flat server structures
    serveBreakfast: serverData.services?.serveBreakfast ?? serverData.serveBreakfast ?? false,
    parking: serverData.services?.parking ?? serverData.parking,
    languages: serverData.services?.languages ?? serverData.languages,
    
    // Flatten rules fields - handle both nested and flat server structures
    smokingAllowed: serverData.rules?.smokingAllowed ?? serverData.smokingAllowed ?? false,
    partiesOrEventsAllowed: serverData.rules?.partiesOrEventsAllowed ?? serverData.partiesOrEventsAllowed ?? false,
    petsAllowed: serverData.rules?.petsAllowed ?? serverData.petsAllowed,
    checkInCheckout: serverData.rules?.checkInCheckout ?? serverData.checkInCheckout,
    
    photos: serverData.photos,
    bookingType: serverData.bookingType,
    paymentType: serverData.paymentType,
    pricing: serverData.pricing,
    cancellation: serverData.cancellation,
    aboutTheProperty: serverData.aboutTheProperty,
    aboutTheNeighborhood: serverData.aboutTheNeighborhood,
    firstDateGuestCanCheckIn: serverData.firstDateGuestCanCheckIn,
    ownerId: serverData.ownerId,
    createdAt: serverData.createdAt,
    updatedAt: serverData.updatedAt,
  }
}

// Async thunks
export const fetchMyProperties = createAsyncThunk(
  'property/fetchMyProperties',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<{ properties: any[] }>('/api/properties/my-properties')
      return response.properties.map(transformServerPropertyData)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch properties')
    }
  }
)

export const fetchPropertyById = createAsyncThunk(
  'property/fetchPropertyById',
  async (propertyId: string, { rejectWithValue }) => {
    try {
      const response = await api.get<{ property: any }>(`/api/properties/${propertyId}`)
      return transformServerPropertyData(response.property)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch property')
    }
  }
)

export const createProperty = createAsyncThunk(
  'property/createProperty',
  async (propertyData: WizardFormData, { rejectWithValue }) => {
    try {
      const transformedData = transformPropertyDataForServer(propertyData)
      const response = await api.post<{ property: any }>('/api/properties', transformedData)
      return transformServerPropertyData(response.property)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create property')
    }
  }
)

export const updateProperty = createAsyncThunk(
  'property/updateProperty',
  async ({ propertyId, data }: { propertyId: string; data: Partial<Property> | WizardFormData }, { rejectWithValue }) => {
    try {
      // Check if data is WizardFormData by checking for currentStep property
      const dataToSend = 'currentStep' in data 
        ? transformPropertyDataForServer(data as WizardFormData)
        : data
      
      const response = await api.put<{ property: any }>(`/api/properties/${propertyId}`, dataToSend)
      return transformServerPropertyData(response.property)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update property')
    }
  }
)

export const deleteProperty = createAsyncThunk(
  'property/deleteProperty',
  async (propertyId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/properties/${propertyId}`)
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

      const response = await api.post<{ photos: Photo[] }>(`/api/properties/${propertyId}/photos`, formData, {})
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
      await api.delete(`/api/properties/${propertyId}/photos/${photoId}`)
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
          zipCode: 0
        },
        // Layout fields (flattened)
        maximumGuest: 1,
        bathrooms: 1,
        allowChildren: false,
        offerCribs: false,
        rooms: [],
        // Services fields (flattened)
        serveBreakfast: false,
        parking: ParkingType.No,
        languages: [],
        // Rules fields (flattened)
        smokingAllowed: false,
        partiesOrEventsAllowed: false,
        petsAllowed: PetPolicy.No,
        amenities: [],
        photos: [],
        bookingType: BookingType.NeedToRequestBook,
        paymentType: PaymentType.Online,
        pricing: {
          currency: Currency.AED,
          ratePerNight: 0
        },
        currentStep: 1,
        isComplete: false,
        ...action.payload
      }
      
      state.wizardData = defaultWizardData
      saveWizardDataToStorage(defaultWizardData)
    },
    initializeWizardForEdit: (state, action: PayloadAction<{ property: Property, mode: 'edit' }>) => {
      const { property } = action.payload
      
      // Convert Property to WizardFormData format
      const wizardData: WizardFormData = {
        propertyId: property.propertyId,
        name: property.name || '',
        address: property.address || {
          countryOrRegion: 'UAE',
          city: '',
          zipCode: 0
        },
        // Layout fields (flattened)
        maximumGuest: property.maximumGuest || 1,
        bathrooms: property.bathrooms || 1,
        allowChildren: property.allowChildren || false,
        offerCribs: property.offerCribs || false,
        propertySizeSqMtr: property.propertySizeSqMtr,
        rooms: property.rooms || [],
        // Services fields (flattened)
        serveBreakfast: property.serveBreakfast || false,
        parking: property.parking || ParkingType.No,
        languages: property.languages || [],
        // Rules fields (flattened)
        smokingAllowed: property.smokingAllowed || false,
        partiesOrEventsAllowed: property.partiesOrEventsAllowed || false,
        petsAllowed: property.petsAllowed || PetPolicy.No,
        checkInCheckout: property.checkInCheckout,
        // Other fields
        amenities: property.amenities || [],
        photos: property.photos || [],
        bookingType: property.bookingType || BookingType.NeedToRequestBook,
        paymentType: property.paymentType || PaymentType.Online,
        pricing: property.pricing || {
          currency: Currency.AED,
          ratePerNight: 0
        },
        cancellation: property.cancellation,
        aboutTheProperty: property.aboutTheProperty,
        aboutTheNeighborhood: property.aboutTheNeighborhood,
        firstDateGuestCanCheckIn: property.firstDateGuestCanCheckIn,
        currentStep: 1,
        isComplete: true,
        mode: 'edit'
      }
      
      state.wizardData = wizardData
      saveWizardDataToStorage(wizardData)
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
  initializeWizardForEdit,
  updateWizardData,
  setWizardStep,
  clearWizardData,
  completeWizard
} = propertySlice.actions

export default propertySlice.reducer