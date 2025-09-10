import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Property, PropertyState, WizardFormData, Photo } from '../../types/property'
import { api } from '../../utils/api'
import { BookingType, PaymentType, ParkingType, PetPolicy } from '../../constants/propertyEnums'
import { promoteToHomeOwner } from './authSlice'

// New enums to match Prisma schema
export enum PropertyStatus {
  Draft = 'Draft',    // Initial state - not yet live
  Live = 'Live',      // Active, visible for bookings
  Closed = 'Closed'   // Temporarily/permanently unavailable
}

const WIZARD_STORAGE_KEY = 'property-wizard-data'
const DRAFT_STORAGE_PREFIX = 'property-draft-'

// LocalStorage keys for PropertyManager drafts
const getDraftStorageKey = (mode: 'create' | 'edit', propertyId?: string): string => {
  if (mode === 'create') return `${DRAFT_STORAGE_PREFIX}new`
  if (mode === 'edit' && propertyId) return `${DRAFT_STORAGE_PREFIX}${propertyId}`
  throw new Error('PropertyId required for edit mode')
}

// Save PropertyManager draft to localStorage
const saveDraftToStorage = (data: Property, mode: 'create' | 'edit', propertyId?: string) => {
  try {
    const key = getDraftStorageKey(mode, propertyId)
    const draftData = {
      data,
      timestamp: new Date().toISOString(),
      mode,
      propertyId: propertyId || null
    }
    localStorage.setItem(key, JSON.stringify(draftData))
  } catch (error) {
    console.error('Failed to save draft to localStorage:', error)
  }
}

// Load PropertyManager draft from localStorage
const loadDraftFromStorage = (mode: 'create' | 'edit', propertyId?: string): Property | null => {
  try {
    const key = getDraftStorageKey(mode, propertyId)
    const stored = localStorage.getItem(key)
    if (stored) {
      const { data, timestamp, mode: storedMode, propertyId: storedPropertyId } = JSON.parse(stored)
      
      // Verify mode and property match
      if (storedMode === mode && (mode === 'create' || storedPropertyId === propertyId)) {
        // Check if data is not too old (24 hours)
        const age = Date.now() - new Date(timestamp).getTime()
        const maxAge = 24 * 60 * 60 * 1000 // 24 hours
        
        if (age < maxAge) {
          return data
        } else {
          // Clear old draft
          clearDraftFromStorage(mode, propertyId)
        }
      } else {
        // Clear mismatched draft
        clearDraftFromStorage(mode, propertyId)
      }
    }
  } catch (error) {
    console.error('Failed to load draft from localStorage:', error)
    clearDraftFromStorage(mode, propertyId)
  }
  return null
}

// Clear PropertyManager draft from localStorage
const clearDraftFromStorage = (mode: 'create' | 'edit', propertyId?: string) => {
  try {
    const key = getDraftStorageKey(mode, propertyId)
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Failed to clear draft from localStorage:', error)
  }
}

// Clear all other property drafts (for property switching)
const clearOtherDrafts = (currentMode: 'create' | 'edit', currentPropertyId?: string) => {
  try {
    const currentKey = getDraftStorageKey(currentMode, currentPropertyId)
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(DRAFT_STORAGE_PREFIX) && key !== currentKey) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.error('Failed to clear other drafts:', error)
  }
}

// Debug utility to help identify data structure mismatches
const debugServerDataStructure = (_serverData: any, _context: string = '') => {
  // Debug logging removed for cleaner devtools
}

const initialState: PropertyState = {
  properties: [],
  currentProperty: null,
  wizardData: null,
  originalWizardData: null, // Baseline data for change detection
  
  // Form management (following RatePlanManager pattern)
  currentForm: null,
  originalForm: null,
  hasUnsavedChanges: false,
  formValidationErrors: {},
  isSaving: false,
  
  // Draft management state
  draftMode: null, // 'create' | 'edit' | null
  draftPropertyId: null, // propertyId for edit mode
  hasDraftRestored: false, // flag to show draft restoration notification
  
  // Rate plan selection for PropertyDetail page
  selectedRatePlan: null,
  
  loading: false,
  error: null,
  validationErrors: null
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
      apartmentOrFloorNumber: data.address?.apartmentOrFloorNumber || '',
      countryOrRegion: data.address?.countryOrRegion || 'UAE',
      city: data.address?.city || '',
      zipCode: data.address?.zipCode || 0,
    },
    layout: {
      maximumGuest: data.maximumGuest || 1,
      bathrooms: data.bathrooms || 1,
      allowChildren: data.allowChildren || false,
      offerCribs: data.offerCribs || false,
    },
    amenities: data.amenities || [],
    services: {
      parking: data.parking || 'No',
      languages: data.languages || [],
    },
    rules: {
      smokingAllowed: data.smokingAllowed || false,
      partiesOrEventsAllowed: data.partiesOrEventsAllowed || false,
      petsAllowed: data.petsAllowed || 'No',
    },
    // Photos are already uploaded server objects with valid IDs and URLs
    photos: data.photos || [],
    bookingType: data.bookingType || 'NeedToRequestBook',
    paymentType: data.paymentType || 'Online',
    aboutTheProperty: data.aboutTheProperty || '',
    aboutTheNeighborhood: data.aboutTheNeighborhood || '',
  }

  // Add optional fields only if they exist
  if (data.address?.latLong) {
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

  // IMPORTANT: Pricing and cancellation are now managed through RatePlan model, not directly on Property
  // These fields have been removed from the backend Property schema
  // PropertyStatus controls visibility and bookability
  transformedData.status = data.status || PropertyStatus.Draft

  if (data.firstDateGuestCanCheckIn) {
    transformedData.firstDateGuestCanCheckIn = data.firstDateGuestCanCheckIn
  }

  // Handle PropertyPricing data (for new PropertyManager pattern)
  if (data.pricing) {
    transformedData.pricing = data.pricing
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
    // New PropertyStatus field from schema
    status: serverData.status || PropertyStatus.Draft,
    
    // Flatten layout fields - handle both nested and flat server structures
    maximumGuest: serverData.layout?.maximumGuest ?? serverData.maximumGuest ?? 0,
    bathrooms: serverData.layout?.bathrooms ?? serverData.bathrooms ?? 0,
    allowChildren: serverData.layout?.allowChildren ?? serverData.allowChildren ?? false,
    offerCribs: serverData.layout?.offerCribs ?? serverData.offerCribs ?? false,
    propertySizeSqMtr: serverData.layout?.propertySizeSqMtr ?? serverData.propertySizeSqMtr,
    rooms: serverData.layout?.rooms ?? serverData.rooms,
    
    amenities: serverData.amenities,
    
    // Flatten services fields - handle both nested and flat server structures
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
    // PropertyPricing data (new weekly pricing setup)
    pricing: serverData.pricing,
    // New relationships from schema
    ratePlans: serverData.ratePlans || [],  // Associated rate plans
    propertyGroupId: serverData.propertyGroupId, // Optional property group
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
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to fetch properties'
      return rejectWithValue(errorMessage)
    }
  }
)

export const fetchPublicProperties = createAsyncThunk(
  'property/fetchPublicProperties',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<{ properties: any[] }>('/api/properties/public')
      return response.properties.map(transformServerPropertyData)
    } catch (error: any) {
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to fetch public properties'
      return rejectWithValue(errorMessage)
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
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to fetch property'
      return rejectWithValue(errorMessage)
    }
  }
)

export const fetchPublicPropertyById = createAsyncThunk(
  'property/fetchPublicPropertyById',
  async (propertyId: string, { rejectWithValue }) => {
    try {
      const response = await api.get<{ property: any }>(`/api/properties/${propertyId}/public`)
      return transformServerPropertyData(response.property)
    } catch (error: any) {
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to fetch property details'
      return rejectWithValue(errorMessage)
    }
  }
)

export const createProperty = createAsyncThunk(
  'property/createProperty',
  async (propertyData: WizardFormData, { rejectWithValue }) => {
    try {
      const transformedData = transformPropertyDataForServer(propertyData)
      const response = await api.post<{ property: any }>('/api/properties', transformedData)
      const serverProperty = transformServerPropertyData(response.property)
      return serverProperty
    } catch (error: any) {
      // Handle validation errors specially
      if (error.errors && Object.keys(error.errors).length > 0) {
        return rejectWithValue({
          type: 'validation',
          errors: error.errors,
          message: error.getUserMessage ? error.getUserMessage() : 'Please fix the following validation errors:'
        })
      }
      
      // Handle other errors
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to create property'
      return rejectWithValue(errorMessage)
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
      // Enhance ApiError with validation context for property updates
      if (error.errors && Object.keys(error.errors).length > 0) {
        error.validationContext = {
          type: 'validation',
          message: 'Please fix the following validation errors:'
        }
      }
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to update property'
      return rejectWithValue(errorMessage)
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
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to delete property'
      return rejectWithValue(errorMessage)
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
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to upload photos'
      return rejectWithValue(errorMessage)
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
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to delete photo'
      return rejectWithValue(errorMessage)
    }
  }
)

// New async thunks for PropertyManager pattern (following RatePlanManager)
export const createPropertyAsync = createAsyncThunk(
  'property/createPropertyAsync',
  async (data: Partial<Property>, { rejectWithValue }) => {
    try {
      // Transform data to server format
      const transformedData = transformPropertyDataForServer(data as WizardFormData)
      const response = await api.post<{ property: any }>('/api/properties', transformedData)
      return transformServerPropertyData(response.property)
    } catch (error: any) {
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to create property'
      return rejectWithValue(errorMessage)
    }
  }
)

// Enhanced property creation that includes auto-promotion logic
export const createPropertyWithPromotion = createAsyncThunk(
  'property/createPropertyWithPromotion',
  async (data: Partial<Property>, { dispatch, getState, rejectWithValue }) => {
    try {
      // First create the property
      const propertyResult = await dispatch(createPropertyAsync(data))
      
      if (createPropertyAsync.fulfilled.match(propertyResult)) {
        // Check if user is Tenant and should be promoted
        const state = getState() as any
        const currentRole = state.auth.currentRoleMode
        
        if (currentRole === 'Tenant') {
          // Auto-promote to HomeOwner
          await dispatch(promoteToHomeOwner())
        }
        
        return propertyResult.payload
      } else {
        return rejectWithValue(propertyResult.payload)
      }
    } catch (error: any) {
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to create property'
      return rejectWithValue(errorMessage)
    }
  }
)

export const updatePropertyAsync = createAsyncThunk(
  'property/updatePropertyAsync',
  async (params: { propertyId: string; data: Partial<Property> }, { rejectWithValue }) => {
    try {
      // Transform data to server format
      const transformedData = transformPropertyDataForServer(params.data as WizardFormData)
      const response = await api.put<{ property: any }>(`/api/properties/${params.propertyId}`, transformedData)
      return transformServerPropertyData(response.property)
    } catch (error: any) {
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to update property'
      return rejectWithValue(errorMessage)
    }
  }
)

export const updatePropertyStatusAsync = createAsyncThunk(
  'property/updatePropertyStatusAsync',
  async (params: { propertyId: string; status: PropertyStatus }, { rejectWithValue }) => {
    try {
      const response = await api.put<{ property: any }>(`/api/properties/${params.propertyId}/status`, {
        status: params.status
      })
      return transformServerPropertyData(response.property)
    } catch (error: any) {
      const errorMessage = error.getUserMessage ? error.getUserMessage() : 
                          error.serverMessage || error.message || 'Failed to update property status'
      return rejectWithValue(errorMessage)
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
      state.validationErrors = null
    },
    clearValidationErrors: (state) => {
      state.validationErrors = null
    },
    setCurrentProperty: (state, action: PayloadAction<Property | null>) => {
      state.currentProperty = action.payload
    },
    setSelectedRatePlan: (state, action: PayloadAction<any | null>) => {
      state.selectedRatePlan = action.payload
    },
    initializeWizard: (state, action: PayloadAction<Partial<WizardFormData>>) => {
      const defaultWizardData: WizardFormData = {
        status: PropertyStatus.Draft,
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
        // NOTE: pricing is now managed through RatePlan model, not directly on Property
        // pricing: { currency: Currency.AED, ratePerNight: 0 }, // REMOVED
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
        status: property.status,
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
        // NOTE: pricing and cancellation are now managed through RatePlan model
        // pricing: property.pricing || { currency: Currency.AED, ratePerNight: 0 }, // REMOVED
        // cancellation: property.cancellation, // REMOVED
        aboutTheProperty: property.aboutTheProperty,
        aboutTheNeighborhood: property.aboutTheNeighborhood,
        firstDateGuestCanCheckIn: property.firstDateGuestCanCheckIn,
        currentStep: 1,
        isComplete: true,
        mode: 'edit'
      }
      
      state.wizardData = wizardData
      state.originalWizardData = { ...wizardData } // Set baseline for change detection
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
    },
    // Actions for managing original data baseline (for change detection)
    setOriginalWizardData: (state, action: PayloadAction<WizardFormData | null>) => {
      state.originalWizardData = action.payload
    },
    resetToOriginalWizardData: (state) => {
      // Discard changes - reset wizardData to original state
      if (state.originalWizardData) {
        state.wizardData = { ...state.originalWizardData }
        saveWizardDataToStorage(state.wizardData)
      }
    },
    
    // Form management actions (following RatePlanManager pattern)
    initializeFormForCreate: (state, _action: PayloadAction<{ propertyId?: string } | void>) => {
      // const _propertyId = _action.payload?.propertyId
      
      // Set draft mode
      state.draftMode = 'create'
      state.draftPropertyId = null
      
      // Clear other drafts when switching to create mode
      clearOtherDrafts('create')
      state.currentForm = {
        status: PropertyStatus.Draft,
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
        // New PropertyPricing with default weekly pricing
        pricing: {
          priceMonday: 0,
          priceTuesday: 0,
          priceWednesday: 0,
          priceThursday: 0,
          priceFriday: 0,
          priceSaturday: 0,
          priceSunday: 0,
          halfDayPriceMonday: 0,
          halfDayPriceTuesday: 0,
          halfDayPriceWednesday: 0,
          halfDayPriceThursday: 0,
          halfDayPriceFriday: 0,
          halfDayPriceSaturday: 0,
          halfDayPriceSunday: 0,
          currency: 'AED' as any
        },
      } as Property
      state.originalForm = { ...state.currentForm }
      state.hasUnsavedChanges = false
      state.formValidationErrors = {}
      
      // Try to restore draft from localStorage
      const restoredDraft = loadDraftFromStorage('create')
      if (restoredDraft) {
        state.currentForm = restoredDraft
        state.hasUnsavedChanges = true
        state.hasDraftRestored = true
      }
    },
    
    initializeFormForEdit: (state, action: PayloadAction<Property>) => {
      const property = action.payload
      
      // Set draft mode
      state.draftMode = 'edit'
      state.draftPropertyId = property.propertyId!
      
      // Clear other drafts when switching to this property
      clearOtherDrafts('edit', property.propertyId!)
      
      // Ensure pricing defaults exist
      const defaultPricing = {
        priceMonday: 0,
        priceTuesday: 0,
        priceWednesday: 0,
        priceThursday: 0,
        priceFriday: 0,
        priceSaturday: 0,
        priceSunday: 0,
        halfDayPriceMonday: 0,
        halfDayPriceTuesday: 0,
        halfDayPriceWednesday: 0,
        halfDayPriceThursday: 0,
        halfDayPriceFriday: 0,
        halfDayPriceSaturday: 0,
        halfDayPriceSunday: 0,
        currency: 'AED' as any
      }
      
      state.currentForm = {
        ...property,
        pricing: property.pricing || defaultPricing
      }
      state.originalForm = { ...state.currentForm }
      state.hasUnsavedChanges = false
      state.formValidationErrors = {}
      
      // Try to restore draft from localStorage
      const restoredDraft = loadDraftFromStorage('edit', property.propertyId!)
      if (restoredDraft) {
        state.currentForm = restoredDraft
        state.hasUnsavedChanges = true
        state.hasDraftRestored = true
      }
    },
    
    updateFormField: (state, action: PayloadAction<Partial<Property>>) => {
      if (state.currentForm) {
        state.currentForm = { ...state.currentForm, ...action.payload }
        // Detect changes
        state.hasUnsavedChanges = JSON.stringify(state.currentForm) !== JSON.stringify(state.originalForm)
        
        // Auto-save to localStorage
        if (state.draftMode && state.hasUnsavedChanges) {
          saveDraftToStorage(state.currentForm, state.draftMode, state.draftPropertyId || undefined)
        }
      }
    },
    
    resetFormToOriginal: (state) => {
      if (state.originalForm) {
        state.currentForm = { ...state.originalForm }
        state.hasUnsavedChanges = false
        state.formValidationErrors = {}
        
        // Clear draft from localStorage when discarding changes
        if (state.draftMode) {
          clearDraftFromStorage(state.draftMode, state.draftPropertyId || undefined)
        }
      }
    },
    
    clearForm: (state) => {
      // Clear draft from localStorage before clearing form
      if (state.draftMode) {
        clearDraftFromStorage(state.draftMode, state.draftPropertyId || undefined)
      }
      
      state.currentForm = null
      state.originalForm = null
      state.hasUnsavedChanges = false
      state.formValidationErrors = {}
      state.draftMode = null
      state.draftPropertyId = null
      state.hasDraftRestored = false
    },
    
    setFormValidationErrors: (state, action: PayloadAction<Record<string, string>>) => {
      state.formValidationErrors = action.payload
    },
    
    // Draft management actions
    clearDraft: (state) => {
      if (state.draftMode) {
        clearDraftFromStorage(state.draftMode, state.draftPropertyId || undefined)
      }
      state.hasDraftRestored = false
    },
    
    acknowledgeDraftRestored: (state) => {
      state.hasDraftRestored = false
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
      
      // Fetch public properties
      .addCase(fetchPublicProperties.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPublicProperties.fulfilled, (state, action) => {
        state.loading = false
        state.properties = action.payload
      })
      .addCase(fetchPublicProperties.rejected, (state, action) => {
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
      
      // Fetch public property by ID
      .addCase(fetchPublicPropertyById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPublicPropertyById.fulfilled, (state, action) => {
        state.loading = false
        state.currentProperty = action.payload
      })
      .addCase(fetchPublicPropertyById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Create property
      .addCase(createProperty.pending, (state) => {
        state.loading = true
        state.isSaving = true
        state.error = null
        state.validationErrors = null
        state.formValidationErrors = {}
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        state.loading = false
        state.isSaving = false
        state.properties.push(action.payload)
        state.currentProperty = action.payload
        state.currentForm = action.payload
        state.originalForm = { ...action.payload }
        state.hasUnsavedChanges = false
        // Clear wizard data on successful creation
        state.wizardData = null
        state.validationErrors = null
        state.formValidationErrors = {}
        state.error = null
        saveWizardDataToStorage(null)
      })
      .addCase(createProperty.rejected, (state, action) => {
        state.loading = false
        state.isSaving = false
        const payload = action.payload as any
        if (payload?.type === 'validation') {
          state.validationErrors = payload.errors
          state.formValidationErrors = payload.errors || {}
          state.error = payload.message
        } else {
          state.error = payload?.message || payload || 'Failed to create property'
          state.validationErrors = null
          state.formValidationErrors = {}
        }
      })
      
      // Update property
      .addCase(updateProperty.pending, (state) => {
        state.loading = true
        state.isSaving = true
        state.error = null
        state.validationErrors = null
        state.formValidationErrors = {}
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        state.loading = false
        state.isSaving = false
        const index = state.properties.findIndex(p => p.propertyId === action.payload.propertyId)
        if (index !== -1) {
          state.properties[index] = action.payload
        }
        if (state.currentProperty?.propertyId === action.payload.propertyId) {
          state.currentProperty = action.payload;
        }
        state.currentForm = action.payload
        state.originalForm = { ...action.payload }
        state.hasUnsavedChanges = false
        // Reset originalWizardData to match current wizardData after successful save
        if (state.wizardData) {
          state.originalWizardData = { ...state.wizardData }
        }
        state.validationErrors = null
        state.formValidationErrors = {}
        state.error = null
      })
      .addCase(updateProperty.rejected, (state, action) => {
        state.loading = false
        state.isSaving = false
        const payload = action.payload as any
        if (payload?.type === 'validation') {
          state.validationErrors = payload.errors
          state.formValidationErrors = payload.errors || {}
          state.error = payload.message
        } else {
          state.error = payload?.message || payload || 'Failed to update property'
          state.validationErrors = null
          state.formValidationErrors = {}
        }
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
      
      // New async thunks for PropertyManager pattern
      .addCase(createPropertyAsync.pending, (state) => {
        state.isSaving = true
        state.error = null
        state.formValidationErrors = {}
      })
      .addCase(createPropertyAsync.fulfilled, (state, action) => {
        state.isSaving = false
        state.properties.push(action.payload)
        state.currentProperty = action.payload
        state.currentForm = action.payload
        state.originalForm = { ...action.payload }
        state.hasUnsavedChanges = false
        state.formValidationErrors = {}
        state.error = null
      })
      .addCase(createPropertyAsync.rejected, (state, action) => {
        state.isSaving = false
        state.error = action.payload as string
      })
      
      // Create property with promotion
      .addCase(createPropertyWithPromotion.pending, (state) => {
        state.isSaving = true
        state.error = null
        state.formValidationErrors = {}
      })
      .addCase(createPropertyWithPromotion.fulfilled, (state, action) => {
        state.isSaving = false
        state.properties.push(action.payload)
        state.currentProperty = action.payload
        state.currentForm = action.payload
        state.originalForm = { ...action.payload }
        state.hasUnsavedChanges = false
        state.formValidationErrors = {}
        state.error = null
        
        // Clear draft from localStorage after successful save
        if (state.draftMode) {
          clearDraftFromStorage(state.draftMode, state.draftPropertyId || undefined)
          state.draftMode = null
          state.draftPropertyId = null
        }
      })
      .addCase(createPropertyWithPromotion.rejected, (state, action) => {
        state.isSaving = false
        state.error = action.payload as string
      })
      
      .addCase(updatePropertyAsync.pending, (state) => {
        state.isSaving = true
        state.error = null
        state.formValidationErrors = {}
      })
      .addCase(updatePropertyAsync.fulfilled, (state, action) => {
        state.isSaving = false
        const index = state.properties.findIndex(p => p.propertyId === action.payload.propertyId)
        if (index !== -1) {
          state.properties[index] = action.payload
        }
        if (state.currentProperty?.propertyId === action.payload.propertyId) {
          state.currentProperty = action.payload
        }
        state.currentForm = action.payload
        state.originalForm = { ...action.payload }
        state.hasUnsavedChanges = false
        state.formValidationErrors = {}
        state.error = null
        
        // Clear draft from localStorage after successful save
        if (state.draftMode) {
          clearDraftFromStorage(state.draftMode, state.draftPropertyId || undefined)
          state.draftMode = null
          state.draftPropertyId = null
        }
      })
      .addCase(updatePropertyAsync.rejected, (state, action) => {
        state.isSaving = false
        state.error = action.payload as string
      })
      
      // Update property status
      .addCase(updatePropertyStatusAsync.pending, (state) => {
        state.isSaving = true
        state.error = null
      })
      .addCase(updatePropertyStatusAsync.fulfilled, (state, action) => {
        state.isSaving = false
        const index = state.properties.findIndex(p => p.propertyId === action.payload.propertyId)
        if (index !== -1) {
          state.properties[index] = action.payload
        }
        // Update currentForm if it matches the updated property
        if (state.currentForm?.propertyId === action.payload.propertyId) {
          state.currentForm = action.payload
          state.originalForm = { ...action.payload }
          state.hasUnsavedChanges = false
        }
        // Update currentProperty if it matches
        if (state.currentProperty?.propertyId === action.payload.propertyId) {
          state.currentProperty = action.payload
        }
      })
      .addCase(updatePropertyStatusAsync.rejected, (state, action) => {
        state.isSaving = false
        state.error = action.payload as string
      })
  }
})

export const {
  clearError,
  clearValidationErrors,
  setCurrentProperty,
  setSelectedRatePlan,
  initializeWizard,
  initializeWizardForEdit,
  updateWizardData,
  setWizardStep,
  clearWizardData,
  completeWizard,
  setOriginalWizardData,
  resetToOriginalWizardData,
  // Form management actions (following RatePlanManager pattern)
  initializeFormForCreate,
  initializeFormForEdit,
  updateFormField,
  resetFormToOriginal,
  clearForm,
  setFormValidationErrors,
  // Draft management actions
  clearDraft,
  acknowledgeDraftRestored
} = propertySlice.actions

// New async thunks are exported above in their declarations

export default propertySlice.reducer