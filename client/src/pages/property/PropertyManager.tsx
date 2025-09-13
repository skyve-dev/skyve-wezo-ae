import React, {useEffect, useRef, useState} from 'react'
import {SecuredPage} from '@/components/SecuredPage'
import {Box} from '@/components'
import Input from '@/components/base/Input'
import SelectionPicker from '@/components/base/SelectionPicker'
import NumberStepperInput from '@/components/base/NumberStepperInput'
import Button from '@/components/base/Button'
import DatePicker from '@/components/base/DatePicker'
import TimePicker from '@/components/base/TimePicker'
import SlidingDrawer from '@/components/base/SlidingDrawer'
import {useAppShell} from '@/components/base/AppShell'
import {useAppDispatch, useAppSelector} from '@/store'
import {
    acknowledgeDraftRestored,
    clearDraft,
    clearForm,
    createPropertyWithPromotion,
    fetchPropertyById,
    initializeFormForCreate,
    initializeFormForEdit,
    PropertyStatus,
    resetFormToOriginal,
    updateFormField,
    updatePropertyAsync,
    updatePropertyStatusAsync
} from '@/store/slices/propertySlice'
import {api, ApiError, resolvePhotoUrl} from '@/utils/api'
import useErrorHandler from '@/hooks/useErrorHandler'
import { useDialogs } from '@/hooks/useDialogs'
import PropertyManagerHeader from './PropertyManagerHeader'
import PropertyManagerFooter from './PropertyManagerFooter'
import PropertyStatusWidget from '@/components/PropertyStatusWidget'
import {Address, Bed, PropertyPricing, Room} from '@/types/property'
import {
    BedType,
    BedTypeLabels,
    BookingType,
    BookingTypeLabels,
    ParkingType,
    ParkingTypeLabels,
    PaymentType,
    PaymentTypeLabels,
    PetPolicy,
    PetPolicyLabels
} from '@/constants/propertyEnums'
import {AVAILABLE_AMENITIES, getAmenitiesByCategory} from '@/constants/amenities.tsx'
import useDrawerManager from '@/hooks/useDrawerManager'
import MobileSelect from '@/components/base/MobileSelect'
import {MapContainer, Marker, TileLayer, useMapEvents} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
    IoIosAdd,
    IoIosBed,
    IoIosBuild,
    IoIosBusiness,
    IoIosCalendar,
    IoIosCall,
    IoIosCamera,
    IoIosCar,
    IoIosCard,
    IoIosCash,
    IoIosCheckmark,
    IoIosClose,
    IoIosCloseCircle,
    IoIosCloudUpload,
    IoIosDocument,
    IoIosFlash,
    IoIosGlobe,
    IoIosHand,
    IoIosHappy,
    IoIosHelp,
    IoIosHome,
    IoIosLeaf,
    IoIosLocate,
    IoIosPeople,
    IoIosPin,
    IoIosPin as IoIosMapPin,
    IoIosRefresh,
    IoIosRestaurant,
    IoIosSearch,
    IoIosShirt,
    IoIosStar,
    IoIosTime,
    IoIosTrash,
    IoIosWater,
    IoIosWater as IoIosSwimmer,
    IoIosWifi,
    IoIosWine
} from 'react-icons/io'

// Fix Leaflet markers
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface PropertyManagerProps {
    propertyId?: string  // 'new' for create mode, actual ID for edit mode
}

// Map click handler component
function MapClickHandler({onLocationSelect}: { onLocationSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click: (e) => {
            onLocationSelect(e.latlng.lat, e.latlng.lng)
        },
    })
    return null
}

const PropertyManager: React.FC<PropertyManagerProps> = ({propertyId}) => {
    const dispatch = useAppDispatch()
    const {showApiError, showSuccess} = useErrorHandler()
    const {currentParams} = useAppShell()
    const params = {propertyId, ...currentParams}

    // Mode detection following RatePlanManager pattern
    const isCreateMode = params.propertyId === 'new'
    const isEditMode = !isCreateMode && params.propertyId

    // Redux state (NO local formData - use Redux for everything)
    const {
        properties,
        currentForm,
        hasUnsavedChanges,
        formValidationErrors,
        isSaving,
        hasDraftRestored
    } = useAppSelector((state) => state.property)

    const {openDialog, navigateTo, mountHeader, mountFooter, registerNavigationGuard} = useAppShell()
    const dialogs = useDialogs()
    const [isLoading, setIsLoading] = useState(true)

    // Room management
    const [showAddRoom, setShowAddRoom] = useState(false)
    const [newRoomName, setNewRoomName] = useState('')
    const scrollPositionRef = useRef<number>(0)
    const shouldPreserveScrollRef = useRef<boolean>(false)

    // Amenities management
    const drawerManager = useDrawerManager()
    const amenitiesDrawerId = useRef(`amenities-drawer-${Math.random().toString(36).substr(2, 9)}`).current
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [tempSelectedAmenities, setTempSelectedAmenities] = useState<string[]>([])

    // Photo management
    const [isUploading, setIsUploading] = useState(false)
    const [isDeletingPhoto, setIsDeletingPhoto] = useState<string | null>(null)
    const [uploadError, setUploadError] = useState<string>('')
    const [uploadSuccess, setUploadSuccess] = useState<string>('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    // All localStorage functionality is now handled in Redux
    // Draft management is automatic through Redux actions

    // Location management
    const [searchAddress, setSearchAddress] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [locationDetected, setLocationDetected] = useState(false)
    const [isDetectingLocation, setIsDetectingLocation] = useState(false)

    // Services
    const [newLanguage, setNewLanguage] = useState('')

    // Initialize form based on mode (Redux now handles localStorage automatically)
    useEffect(() => {
        if (isCreateMode) {
            dispatch(initializeFormForCreate())
            setIsLoading(false)
        } else if (isEditMode && params.propertyId) {
            const existingProperty = properties.find(property => property.propertyId === params.propertyId)
            if (existingProperty) {
                dispatch(initializeFormForEdit(existingProperty))
                setIsLoading(false)
            } else {
                // Load property if not in store
                dispatch(fetchPropertyById(params.propertyId))
                    .then(() => setIsLoading(false))
                    .catch(() => setIsLoading(false))
            }
        }
    }, [isCreateMode, isEditMode, params.propertyId, properties, dispatch])

    // Show draft restoration notification
    useEffect(() => {
        if (hasDraftRestored) {
            showSuccess('Draft restored from your previous session')
            dispatch(acknowledgeDraftRestored())
        }
    }, [hasDraftRestored, dispatch, showSuccess])

    // Navigation guard for unsaved changes
    useEffect(() => {
        if (!hasUnsavedChanges) return

        const cleanup = registerNavigationGuard(async () => {
            const shouldLeave = await dialogs.confirmUnsavedChanges()

            if (shouldLeave) {
                // Clear draft when leaving with unsaved changes
                dispatch(clearDraft())
            }

            return shouldLeave
        })

        return cleanup
    }, [hasUnsavedChanges, registerNavigationGuard, dialogs])

    // Mount header and footer using AppShell (ENABLE IMMEDIATE SAVE/EDIT like RatePlanManager)
    useEffect(() => {
        const title = isCreateMode ? 'Create Property' : `Edit ${currentForm?.name || 'Property'}`

        const unmountHeader = mountHeader(
            <PropertyManagerHeader title={title} onBack={handleBack}/>,
            {visibility: 'persistent'}
        )

        // IMPORTANT: Always mount footer (no hasUnsavedChanges condition) like RatePlanManager
        const unmountFooter = mountFooter(
            <PropertyManagerFooter
                onSave={handleSave}
                onDiscard={handleDiscard}
                isSaving={isSaving}
                hasErrors={Object.keys(formValidationErrors).length > 0}
            />,
            {visibility: 'persistent'}
        )

        return () => {
            unmountHeader()
            unmountFooter()
        }
    }, [isSaving, formValidationErrors, currentForm, isCreateMode])

    // Removed debugging code - scroll issue fixed in SlidingDrawer

    // Unified save handler
    const handleSave = async () => {
        if (!currentForm) return

        try {
            if (isCreateMode) {
                // Use createPropertyWithPromotion to auto-promote Tenant to HomeOwner
                await dispatch(createPropertyWithPromotion(currentForm)).unwrap()
            } else if (isEditMode && params.propertyId) {
                await dispatch(updatePropertyAsync({
                    propertyId: params.propertyId,
                    data: currentForm
                })).unwrap()
            }

            // Clear the form immediately after successful save
            // This will trigger the useEffect to clean up the navigation guard
            dispatch(clearForm())

            // Show success dialog
            await showSuccess(`Property has been ${isCreateMode ? 'created' : 'updated'} successfully.`)

            // Navigate away
            navigateTo('properties', {})
        } catch (error: any) {
            // Handle different types of errors
            if (error instanceof ApiError) {
                await showApiError(error, `Property ${isCreateMode ? 'Creation' : 'Update'}`)
            } else if (typeof error === 'string') {
                await showApiError(new ApiError(error, 400, undefined, error), `Property ${isCreateMode ? 'Creation' : 'Update'}`)
            } else {
                await showApiError(
                    new ApiError('An unexpected error occurred', 500, undefined, `Failed to ${isCreateMode ? 'create' : 'update'} property`),
                    `Property ${isCreateMode ? 'Creation' : 'Update'}`
                )
            }
        }
    }

    // Smart back button
    const handleBack = async () => {
        if (hasUnsavedChanges) {
            const shouldSaveAndLeave = await dialogs.confirmSaveBeforeLeave()

            if (shouldSaveAndLeave) {
                await handleSave()
                return
            } else {
                // User chose to leave without saving - clear form to prevent navigation guard
                dispatch(clearForm())
            }
        }
        navigateTo('properties', {})
    }

    const handleDiscard = async () => {
        dispatch(resetFormToOriginal())
        // Draft is automatically cleared by Redux when discarding
    }

    // Handle property status changes
    const handleStatusChange = async (newStatus: PropertyStatus) => {
        if (!currentForm?.propertyId) return

        try {
            await dispatch(updatePropertyStatusAsync({
                propertyId: currentForm.propertyId,
                status: newStatus
            })).unwrap()

            await showSuccess(`Property status updated to ${newStatus} successfully.`)
        } catch (error: any) {
            if (error instanceof ApiError) {
                await showApiError(error, 'Status Update')
            } else if (typeof error === 'string') {
                await showApiError(new ApiError(error, 400, undefined, error), 'Status Update')
            } else {
                await showApiError(new ApiError('Failed to update property status', 500), 'Status Update')
            }
        }
    }

    // Handle form field changes
    const handleFieldChange = (field: string, value: any) => {
        dispatch(updateFormField({[field]: value}))

        // Auto-save is now handled automatically by Redux
    }

    // Handle address changes
    const handleAddressChange = (field: string, value: any) => {
        const currentAddress = currentForm?.address || {
            countryOrRegion: 'UAE',
            city: '',
            zipCode: 0
        }

        dispatch(updateFormField({
            address: {
                ...currentAddress,
                [field]: value
            } as Address
        }))
    }

    // Preserve scroll position after state updates (simplified since SlidingDrawer issue is fixed)
    useEffect(() => {
        if (shouldPreserveScrollRef.current) {
            requestAnimationFrame(() => {
                window.scrollTo({top: scrollPositionRef.current, behavior: 'instant'})
                shouldPreserveScrollRef.current = false
            })
        }
    })

    // Room Management Functions
    const addRoom = () => {
        if (newRoomName.trim()) {
            const newRoom: Room = {
                spaceName: newRoomName.trim(),
                beds: []
            }
            const currentRooms = currentForm?.rooms ? JSON.parse(JSON.stringify(currentForm.rooms)) : []
            const updatedRooms = [...currentRooms, newRoom]
            handleFieldChange('rooms', updatedRooms)
            setNewRoomName('')
            setShowAddRoom(false)
        }
    }

    const removeRoom = (roomIndex: number) => {
        scrollPositionRef.current = window.scrollY
        shouldPreserveScrollRef.current = true

        const currentRooms = currentForm?.rooms ? JSON.parse(JSON.stringify(currentForm.rooms)) : []
        const updatedRooms = currentRooms.filter((_: Room, index: number) => index !== roomIndex)
        handleFieldChange('rooms', updatedRooms)
    }

    const addBedToRoom = (roomIndex: number) => {
        if (!currentForm?.rooms) return

        scrollPositionRef.current = window.scrollY
        shouldPreserveScrollRef.current = true

        const updatedRooms = JSON.parse(JSON.stringify(currentForm.rooms))
        if (!updatedRooms[roomIndex].beds) {
            updatedRooms[roomIndex].beds = []
        }
        const newBed: Bed = {
            typeOfBed: BedType.QueenBed,
            numberOfBed: 1
        }
        updatedRooms[roomIndex].beds.push(newBed)
        handleFieldChange('rooms', updatedRooms)
    }

    const updateBed = (roomIndex: number, bedIndex: number, field: keyof Bed, value: any) => {
        if (!currentForm?.rooms) return
        const updatedRooms = JSON.parse(JSON.stringify(currentForm.rooms))
        if (updatedRooms[roomIndex].beds) {
            updatedRooms[roomIndex].beds[bedIndex] = {
                ...updatedRooms[roomIndex].beds[bedIndex],
                [field]: value
            }
            handleFieldChange('rooms', updatedRooms)
        }
    }

    const removeBedFromRoom = (roomIndex: number, bedIndex: number) => {
        if (!currentForm?.rooms) return

        scrollPositionRef.current = window.scrollY
        shouldPreserveScrollRef.current = true

        const updatedRooms = JSON.parse(JSON.stringify(currentForm.rooms))
        if (updatedRooms[roomIndex].beds) {
            updatedRooms[roomIndex].beds = updatedRooms[roomIndex].beds.filter((_: Bed, index: number) => index !== bedIndex)
            handleFieldChange('rooms', updatedRooms)
        }
    }

    // Amenities Management Functions
    const amenitiesByCategory = getAmenitiesByCategory()
    const categories = Object.keys(amenitiesByCategory).sort()

    // Category icon mapping
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Technology':
                return <IoIosWifi style={{color: '#3b82f6', fontSize: '1rem'}}/>
            case 'Kitchen & Dining':
                return <IoIosRestaurant style={{color: '#10b981', fontSize: '1rem'}}/>
            case 'Recreation':
                return <IoIosSwimmer style={{color: '#06b6d4', fontSize: '1rem'}}/>
            case 'Safety & Security':
                return <IoIosHelp style={{color: '#ef4444', fontSize: '1rem'}}/>
            case 'Family & Child-Friendly':
                return <IoIosHappy style={{color: '#f59e0b', fontSize: '1rem'}}/>
            case 'Outdoor & Garden':
                return <IoIosLeaf style={{color: '#22c55e', fontSize: '1rem'}}/>
            case 'Laundry & Cleaning':
                return <IoIosShirt style={{color: '#8b5cf6', fontSize: '1rem'}}/>
            case 'Transportation & Access':
                return <IoIosCar style={{color: '#6b7280', fontSize: '1rem'}}/>
            case 'Services & Amenities':
                return <IoIosCall style={{color: '#ec4899', fontSize: '1rem'}}/>
            default:
                return <IoIosStar style={{color: '#6b7280', fontSize: '1rem'}}/>
        }
    }

    const handleAddAmenities = () => {
        const currentAmenityIds = currentForm?.amenities?.map(amenity => {
            const found = AVAILABLE_AMENITIES.find(a => a.name === amenity.name)
            return found ? found.id : null
        }).filter(Boolean) as string[] || []

        setTempSelectedAmenities(currentAmenityIds)
        setSelectedCategory(categories[0] || '')
        drawerManager.openDrawer(amenitiesDrawerId)
    }

    const handleAmenitySelectionChange = (selectedIds: string | number | (string | number)[]) => {
        const ids = Array.isArray(selectedIds) ? selectedIds as string[] : []
        setTempSelectedAmenities(ids)
    }

    const handleSaveAmenities = () => {
        const selectedAmenities = AVAILABLE_AMENITIES.filter(amenity =>
            tempSelectedAmenities.includes(amenity.id)
        ).map(amenity => ({
            name: amenity.name,
            category: amenity.category
        }))

        handleFieldChange('amenities', selectedAmenities)
        drawerManager.closeDrawer(amenitiesDrawerId)
    }

    const handleCancelAmenities = () => {
        setTempSelectedAmenities([])
        setSelectedCategory('')
        drawerManager.closeDrawer(amenitiesDrawerId)
    }

    // Photo Management Functions
    const resizeImage = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()

            reader.onload = (e) => {
                const img = new Image()

                img.onload = () => {
                    const canvas = document.createElement('canvas')
                    const ctx = canvas.getContext('2d')

                    if (!ctx) {
                        reject(new Error('Could not get canvas context'))
                        return
                    }

                    let newWidth: number
                    let newHeight: number

                    if (img.width < img.height) {
                        newWidth = 800
                        newHeight = Math.round((img.height / img.width) * 800)
                    } else {
                        newHeight = 800
                        newWidth = Math.round((img.width / img.height) * 800)
                    }

                    canvas.width = newWidth
                    canvas.height = newHeight

                    ctx.drawImage(img, 0, 0, newWidth, newHeight)

                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                resolve(blob)
                            } else {
                                reject(new Error('Failed to convert canvas to blob'))
                            }
                        },
                        'image/jpeg',
                        0.85
                    )
                }

                img.onerror = () => reject(new Error('Failed to load image'))
                img.src = e.target?.result as string
            }

            reader.onerror = () => reject(new Error('Failed to read file'))
            reader.readAsDataURL(file)
        })
    }

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (!files || files.length === 0) return

        setIsUploading(true)
        setUploadError('')
        setUploadSuccess('')

        const formData = new FormData()

        for (const file of Array.from(files)) {
            try {
                const resizedBlob = await resizeImage(file)
                const resizedFile = new File(
                    [resizedBlob],
                    file.name.replace(/\.[^/.]+$/, '.jpg'),
                    {type: 'image/jpeg'}
                )
                formData.append('photos', resizedFile)
            } catch (resizeError) {
                console.error(`Failed to resize ${file.name}:`, resizeError)
                formData.append('photos', file)
            }
        }

        try {
            // Use independent photo upload API
            const response = await api.post('/api/photos/upload', formData, {})

            // API client returns data directly, not wrapped in response.data
            const uploadedPhotos = (response as any).photos || []

            // Update the photos array for immediate display
            const currentPhotos = currentForm?.photos || []
            const newPhotos = uploadedPhotos.map((photo: any) => ({
                id: photo.id,
                url: photo.url,
                altText: photo.altText,
                description: photo.description,
                tags: photo.tags
            }))
            const updatedPhotos = [...currentPhotos, ...newPhotos]

            handleFieldChange('photos', updatedPhotos)

            setUploadSuccess(`Successfully uploaded ${files.length} photo(s)`)

            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        } catch (err: any) {
            setUploadError(err.message || 'Failed to upload photos')
        } finally {
            setIsUploading(false)
        }
    }

    const handleDeletePhoto = async (photoId: string) => {
        const confirmed = await openDialog<boolean>((close) => (
            <Box padding="2rem" textAlign="center">
                <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#dc2626">
                    Delete Photo
                </Box>
                <Box marginBottom="2rem" color="#374151">
                    Are you sure you want to delete this photo? This action cannot be undone.
                </Box>
                <Box display="flex" gap="1rem" justifyContent="center">
                    <Button label="Cancel" onClick={() => close(false)}/>
                    <Button label="Delete" onClick={() => close(true)} variant="promoted"/>
                </Box>
            </Box>
        ))

        if (!confirmed) return

        setIsDeletingPhoto(photoId)
        setUploadError('')
        setUploadSuccess('')

        try {
            // Use independent photo delete API
            await api.delete(`/api/photos/${photoId}`)

            // Remove photo from photos array for immediate UI update
            const currentPhotos = currentForm?.photos || []
            const updatedPhotos = currentPhotos.filter(photo => photo.id !== photoId)
            handleFieldChange('photos', updatedPhotos)

            setUploadSuccess('Photo deleted successfully')
        } catch (err: any) {
            setUploadError(err.message || 'Failed to delete photo')
        } finally {
            setIsDeletingPhoto(null)
        }
    }

    // Location Management Functions
    const defaultCenter: [number, number] = [25.276987, 55.296249]

    const hasValidCoordinates = currentForm?.address?.latLong?.latitude &&
        currentForm?.address?.latLong?.longitude &&
        !(currentForm.address.latLong.latitude === 0 && currentForm.address.latLong.longitude === 0)

    const markerPosition: [number, number] = hasValidCoordinates ? [
        currentForm!.address!.latLong!.latitude,
        currentForm!.address!.latLong!.longitude
    ] : defaultCenter

    const detectCurrentLocation = (forceDetection = false) => {
        setIsDetectingLocation(true)

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude
                    const lng = position.coords.longitude

                    if (!hasValidCoordinates || forceDetection) {
                        handleMapClick(lat, lng)
                        setLocationDetected(true)
                    }
                    setIsDetectingLocation(false)
                },
                (error) => {
                    console.warn('Geolocation error:', error)
                    if (!hasValidCoordinates || forceDetection) {
                        handleMapClick(defaultCenter[0], defaultCenter[1])
                    }
                    setIsDetectingLocation(false)
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000
                }
            )
        } else {
            if (!hasValidCoordinates || forceDetection) {
                handleMapClick(defaultCenter[0], defaultCenter[1])
            }
            setIsDetectingLocation(false)
        }
    }

    const handleMapClick = (lat: number, lng: number) => {
        const currentAddress = currentForm?.address || {
            countryOrRegion: 'UAE',
            city: '',
            zipCode: 0
        }

        dispatch(updateFormField({
            address: {
                ...currentAddress,
                latLong: {
                    latitude: lat,
                    longitude: lng
                }
            }
        }))
    }

    const handleSearchAddress = async () => {
        if (!searchAddress.trim()) return

        setIsSearching(true)
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchAddress)}&format=json&limit=1&addressdetails=1`
            )
            const data = await response.json()

            if (data && data.length > 0) {
                const result = data[0]
                const lat = parseFloat(result.lat)
                const lng = parseFloat(result.lon)

                handleMapClick(lat, lng)

                const address = result.address || {}
                const currentAddress = currentForm?.address || {countryOrRegion: 'UAE', city: '', zipCode: 0}

                dispatch(updateFormField({
                    address: {
                        countryOrRegion: address.country || currentAddress.countryOrRegion || 'UAE',
                        city: address.city || address.town || address.village || currentAddress.city || '',
                        zipCode: address.postcode ? parseInt(address.postcode, 10) : currentAddress.zipCode || 0,
                        apartmentOrFloorNumber: currentAddress.apartmentOrFloorNumber,
                        latLong: {latitude: lat, longitude: lng}
                    }
                }))
            }
        } catch (error) {
            console.error('Geocoding error:', error)
        } finally {
            setIsSearching(false)
        }
    }

    // Services Functions
    const addLanguage = () => {
        if (newLanguage.trim() && !currentForm?.languages?.includes(newLanguage.trim())) {
            const currentLanguages = currentForm?.languages ? [...currentForm.languages] : []
            const updatedLanguages = [...currentLanguages, newLanguage.trim()]
            handleFieldChange('languages', updatedLanguages)
            setNewLanguage('')
        }
    }

    const removeLanguage = (languageToRemove: string) => {
        const currentLanguages = currentForm?.languages ? [...currentForm.languages] : []
        const updatedLanguages = currentLanguages.filter(lang => lang !== languageToRemove)
        handleFieldChange('languages', updatedLanguages)
    }

    // Check-in/out management
    const updateCheckInCheckout = (field: string, value: string) => {
        const currentCheckInOut = currentForm?.checkInCheckout || {
            checkInFrom: '15:00',
            checkInUntil: '22:00',
            checkOutFrom: '08:00',
            checkOutUntil: '11:00'
        }

        handleFieldChange('checkInCheckout', {
            ...currentCheckInOut,
            [field]: value
        })
    }

    // Pricing management
    const updatePricing = (field: keyof PropertyPricing, value: number) => {
        const currentPricing = currentForm?.pricing || {
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

        handleFieldChange('pricing', {
            ...currentPricing,
            [field]: value
        })
    }

    const getDayName = (day: string) => {
        const dayNames = {
            Monday: 'Mon',
            Tuesday: 'Tue',
            Wednesday: 'Wed',
            Thursday: 'Thu',
            Friday: 'Fri',
            Saturday: 'Sat',
            Sunday: 'Sun'
        }
        return dayNames[day as keyof typeof dayNames] || day
    }

    // Auto-detect location for new properties
    useEffect(() => {
        if (isCreateMode && !hasValidCoordinates && !locationDetected) {
            detectCurrentLocation()
        }
    }, [isCreateMode, hasValidCoordinates, locationDetected])

    if (isLoading) {
        return (
            <SecuredPage>
                <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                    <Box fontSize="1rem" color="#6b7280">Loading...</Box>
                </Box>
            </SecuredPage>
        )
    }

    if (isEditMode && !currentForm) {
        return (
            <SecuredPage>
                <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                    <Box fontSize="1rem" color="#dc2626">Property not found</Box>
                </Box>
            </SecuredPage>
        )
    }

    return (
        <SecuredPage>
            <Box padding="1rem" paddingMd="2rem" maxWidth="800px" margin="0 auto">
                <Box display="flex" flexDirection="column" gap="3rem">

                    {/* Property Status Widget - Only show in edit mode */}
                    {isEditMode && currentForm && (
                        <PropertyStatusWidget
                            property={currentForm}
                            onStatusChange={handleStatusChange}
                            isSaving={isSaving}
                            disabled={hasUnsavedChanges}
                        />
                    )}

                    {/* Basic Information Section */}
                    <Box>
                        <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1.5rem">
                            <IoIosHome style={{color: '#374151', fontSize: '1.25rem'}}/>
                            <h3 style={{margin: 0, fontSize: '1.5rem', fontWeight: '600'}}>
                                Basic Property Information
                            </h3>
                        </Box>
                        <Box display="grid" gap="2rem">
                            <Input
                                label="Property Name"
                                icon={IoIosHome}
                                value={currentForm?.name || ''}
                                onChange={(e) => handleFieldChange('name', e.target.value)}
                                placeholder="Enter a descriptive name for your property"
                                width="100%"
                            />

                            <Box>
                                <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
                                    <IoIosDocument style={{color: '#374151', fontSize: '0.875rem'}}/>
                                    <label style={{fontWeight: '500'}}>
                                        About Your Property
                                    </label>
                                </Box>
                                <textarea
                                    value={currentForm?.aboutTheProperty || ''}
                                    onChange={(e) => handleFieldChange('aboutTheProperty', e.target.value)}
                                    placeholder="Describe your property in detail..."
                                    rows={6}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        fontSize: '0.875rem',
                                        resize: 'vertical',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </Box>

                            <Box>
                                <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
                                    <IoIosPin style={{color: '#374151', fontSize: '0.875rem'}}/>
                                    <label style={{fontWeight: '500'}}>
                                        About the Neighborhood
                                    </label>
                                </Box>
                                <textarea
                                    value={currentForm?.aboutTheNeighborhood || ''}
                                    onChange={(e) => handleFieldChange('aboutTheNeighborhood', e.target.value)}
                                    placeholder="Describe the neighborhood and nearby attractions..."
                                    rows={4}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        fontSize: '0.875rem',
                                        resize: 'vertical',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </Box>

                            <Box display="grid" gridTemplateColumnsSm="1fr 1fr" gridTemplateColumns="1fr" gap="2rem">
                                {/* Booking Type */}
                                <Box>
                                    <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.75rem">
                                        <IoIosFlash style={{color: '#374151', fontSize: '0.875rem'}}/>
                                        <label style={{fontWeight: '500', fontSize: '0.875rem'}}>
                                            Booking Type
                                        </label>
                                    </Box>
                                    <SelectionPicker
                                        data={Object.values(BookingType).map(type => ({
                                            value: type,
                                            label: BookingTypeLabels[type],
                                            type
                                        }))}
                                        containerStyles={{display: 'flex', flexDirection: 'row'}}
                                        idAccessor={(item) => item.value}
                                        labelAccessor={(item) => item.label}
                                        value={currentForm?.bookingType || BookingType.BookInstantly}
                                        onChange={(value) => handleFieldChange('bookingType', value as BookingType)}
                                        renderItem={(item) => (
                                            <>
                                                <Box as="span">
                                                    {item.type === BookingType.BookInstantly ?
                                                        <IoIosFlash style={{color: '#f59e0b', fontSize: '1rem'}}/> :
                                                        <IoIosTime style={{color: '#6b7280', fontSize: '1rem'}}/>
                                                    }
                                                </Box>
                                                <Box as="span" flex="1">
                                                    {item.label}
                                                </Box>
                                            </>
                                        )}
                                    />
                                </Box>

                                {/* Payment Type */}
                                <Box>
                                    <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.75rem">
                                        <IoIosCard style={{color: '#374151', fontSize: '0.875rem'}}/>
                                        <label style={{fontWeight: '500', fontSize: '0.875rem'}}>
                                            Payment Type
                                        </label>
                                    </Box>
                                    <SelectionPicker
                                        data={Object.values(PaymentType).map(type => ({
                                            value: type,
                                            label: PaymentTypeLabels[type],
                                            type
                                        }))}
                                        containerStyles={{display: 'flex', flexDirection: 'row'}}
                                        itemStyles={{width: "50%"}}
                                        idAccessor={(item) => item.value}
                                        labelAccessor={(item) => item.label}
                                        value={currentForm?.paymentType || PaymentType.Online}
                                        onChange={(value) => handleFieldChange('paymentType', value as PaymentType)}
                                        renderItem={(item) => (
                                            <>
                                                <Box as="span">
                                                    {item.type === PaymentType.Online ?
                                                        <IoIosCard style={{color: '#10b981', fontSize: '1rem'}}/> :
                                                        <IoIosHand style={{color: '#8b5cf6', fontSize: '1rem'}}/>
                                                    }
                                                </Box>
                                                <Box as="span" flex="1">
                                                    {item.label}
                                                </Box>
                                            </>
                                        )}
                                    />
                                </Box>
                            </Box>

                            <DatePicker
                                label="First Date Guests Can Check In"
                                value={currentForm?.firstDateGuestCanCheckIn}
                                onChange={(value) => handleFieldChange('firstDateGuestCanCheckIn', value)}
                                placeholder="Select earliest check-in date"
                                minDate={new Date().toISOString()}
                            />
                        </Box>
                    </Box>

                    {/* Location Section */}
                    <Box>
                        <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1.5rem">
                            <IoIosPin style={{color: '#374151', fontSize: '1.25rem'}}/>
                            <h3 style={{margin: 0, fontSize: '1.5rem', fontWeight: '600'}}>
                                Property Location
                            </h3>
                        </Box>
                        <Box display="grid" gap="2rem">
                            {/* Address Search */}
                            <Box>
                                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                                    <Box display="flex" alignItems="center" gap="0.5rem">
                                        <IoIosSearch style={{color: '#374151', fontSize: '0.875rem'}}/>
                                        Search Address
                                    </Box>
                                </label>
                                <Box display="flex" gap="0.5rem" alignItems="flex-end">
                                    <Input
                                        label=""
                                        value={searchAddress}
                                        onChange={(e) => setSearchAddress(e.target.value)}
                                        placeholder="Enter address to search on map"
                                        fullWidth={true}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                handleSearchAddress()
                                            }
                                        }}
                                    />
                                    <Button
                                        label=""
                                        icon={<IoIosSearch/>}
                                        onClick={handleSearchAddress}
                                        variant="promoted"
                                        disabled={!searchAddress.trim() || isSearching}
                                        style={{marginBottom: '0.125rem'}}
                                    />
                                </Box>
                                <Box marginTop="0.5rem">
                                    <Button
                                        label={isDetectingLocation ? "Detecting Location..." : "Use My Current Location"}
                                        icon={<IoIosLocate/>}
                                        onClick={() => detectCurrentLocation(true)}
                                        variant="normal"
                                        size="small"
                                        disabled={isDetectingLocation}
                                        fullWidth={true}
                                        style={{fontSize: '0.875rem', maxWidth: 500}}
                                    />
                                </Box>
                            </Box>

                            {/* Interactive Map */}
                            <Box>
                                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                                    <Box display="flex" alignItems="center" gap="0.5rem">
                                        <IoIosMapPin style={{color: '#374151', fontSize: '0.875rem'}}/>
                                        Property Location on Map
                                    </Box>
                                </label>
                                <Box
                                    height="400px"
                                    border="1px solid #d1d5db"
                                    borderRadius="0.5rem"
                                    overflow="hidden"
                                >
                                    <MapContainer
                                        center={markerPosition}
                                        zoom={13}
                                        style={{height: '100%', width: '100%'}}
                                        key={`${markerPosition[0]}-${markerPosition[1]}`}
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <Marker position={markerPosition}/>
                                        <MapClickHandler onLocationSelect={handleMapClick}/>
                                    </MapContainer>
                                </Box>
                                <Box
                                    marginTop="0.5rem"
                                    fontSize="0.75rem"
                                    color="#666"
                                    fontStyle="italic"
                                >
                                    Click anywhere on the map to set your property's precise location
                                </Box>
                            </Box>

                            <Input
                                label="Country/Region"
                                icon={IoIosGlobe}
                                value={currentForm?.address?.countryOrRegion || 'UAE'}
                                onChange={(e) => handleAddressChange('countryOrRegion', e.target.value)}
                                placeholder="Enter country or region"
                                width="100%"
                            />

                            <Input
                                label="City"
                                icon={IoIosBuild}
                                value={currentForm?.address?.city || ''}
                                onChange={(e) => handleAddressChange('city', e.target.value)}
                                placeholder="Enter city name"
                                width="100%"
                            />

                            <Input
                                label="Apartment/Floor Number (Optional)"
                                icon={IoIosBuild}
                                value={currentForm?.address?.apartmentOrFloorNumber || ''}
                                onChange={(e) => handleAddressChange('apartmentOrFloorNumber', e.target.value)}
                                placeholder="e.g., Apt 5B, Floor 12"
                                width="100%"
                            />

                            <Input
                                label="Zip Code"
                                type={'number'}
                                inputMode={'numeric'}
                                icon={IoIosMapPin}
                                value={currentForm?.address?.zipCode}
                                onChange={(event) => handleAddressChange('zipCode', parseInt(event.target.value))}
                                placeholder="Enter zip code"
                                max={999999}
                                width="100%"
                            />
                        </Box>
                    </Box>

                    {/* Layout & Capacity Section */}
                    <Box>
                        <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1.5rem">
                            <IoIosBed style={{color: '#374151', fontSize: '1.25rem'}}/>
                            <h3 style={{margin: 0, fontSize: '1.5rem', fontWeight: '600'}}>
                                Layout & Capacity
                            </h3>
                        </Box>
                        <Box display="grid" gap="2rem">
                            <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem">
                                <NumberStepperInput
                                    label="Maximum Guests"
                                    icon={IoIosPeople}
                                    value={currentForm?.maximumGuest || 1}
                                    onChange={(value) => handleFieldChange('maximumGuest', value)}
                                    min={1}
                                    max={50}
                                    step={1}
                                    format="integer"
                                    size="medium"
                                    width="100%"
                                />

                                <NumberStepperInput
                                    label="Bathrooms"
                                    icon={IoIosWater}
                                    value={currentForm?.bathrooms || 1}
                                    onChange={(value) => handleFieldChange('bathrooms', value)}
                                    min={1}
                                    max={20}
                                    step={1}
                                    format="integer"
                                    size="medium"
                                    width="100%"
                                />
                            </Box>

                            <NumberStepperInput
                                label="Property Size (sq. meters)"
                                value={currentForm?.propertySizeSqMtr || 0}
                                onChange={(value) => handleFieldChange('propertySizeSqMtr', value || undefined)}
                                min={0}
                                max={10000}
                                step={10}
                                format="integer"
                                placeholder="Optional - enter property size"
                                width="100%"
                                helperText="Leave blank if not applicable"
                            />

                            {/* Child & Crib Options */}
                            <Box>
                                <h4 style={{marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '500'}}>
                                    Child Accommodations
                                </h4>
                                <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem">
                                    <Box>
                                        <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                                            Children Allowed
                                        </label>
                                        <Box display="flex" gap="1rem">
                                            <Box
                                                as="button"
                                                onClick={() => handleFieldChange('allowChildren', true)}
                                                padding="0.75rem 1.5rem"
                                                border={currentForm?.allowChildren ? '2px solid #3b82f6' : '1px solid #d1d5db'}
                                                backgroundColor={currentForm?.allowChildren ? '#eff6ff' : 'white'}
                                                borderRadius="0.5rem"
                                                cursor="pointer"
                                                fontWeight={currentForm?.allowChildren ? '600' : '400'}
                                                color={currentForm?.allowChildren ? '#1d4ed8' : '#374151'}
                                                width="50%"
                                                fontSize="0.875rem"
                                            >
                                                Yes
                                            </Box>
                                            <Box
                                                as="button"
                                                onClick={() => handleFieldChange('allowChildren', false)}
                                                padding="0.75rem 1.5rem"
                                                border={!currentForm?.allowChildren ? '2px solid #3b82f6' : '1px solid #d1d5db'}
                                                backgroundColor={!currentForm?.allowChildren ? '#eff6ff' : 'white'}
                                                borderRadius="0.5rem"
                                                cursor="pointer"
                                                fontWeight={!currentForm?.allowChildren ? '600' : '400'}
                                                color={!currentForm?.allowChildren ? '#1d4ed8' : '#374151'}
                                                width="50%"
                                                fontSize="0.875rem"
                                            >
                                                No
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Box>
                                        <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                                            Cribs Available
                                        </label>
                                        <Box display="flex" gap="1rem">
                                            <Box
                                                as="button"
                                                onClick={() => handleFieldChange('offerCribs', true)}
                                                padding="0.75rem 1.5rem"
                                                border={currentForm?.offerCribs ? '2px solid #3b82f6' : '1px solid #d1d5db'}
                                                backgroundColor={currentForm?.offerCribs ? '#eff6ff' : 'white'}
                                                borderRadius="0.5rem"
                                                cursor="pointer"
                                                fontWeight={currentForm?.offerCribs ? '600' : '400'}
                                                color={currentForm?.offerCribs ? '#1d4ed8' : '#374151'}
                                                width="50%"
                                                fontSize="0.875rem"
                                            >
                                                Yes
                                            </Box>
                                            <Box
                                                as="button"
                                                onClick={() => handleFieldChange('offerCribs', false)}
                                                padding="0.75rem 1.5rem"
                                                border={!currentForm?.offerCribs ? '2px solid #3b82f6' : '1px solid #d1d5db'}
                                                backgroundColor={!currentForm?.offerCribs ? '#eff6ff' : 'white'}
                                                borderRadius="0.5rem"
                                                cursor="pointer"
                                                fontWeight={!currentForm?.offerCribs ? '600' : '400'}
                                                color={!currentForm?.offerCribs ? '#1d4ed8' : '#374151'}
                                                width="50%"
                                                fontSize="0.875rem"
                                            >
                                                No
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Rooms Management */}
                            <Box>
                                <Box display="flex" alignItems="center" justifyContent="space-between"
                                     marginBottom="1rem">
                                    <h4 style={{margin: 0, fontSize: '1.125rem', fontWeight: '500'}}>
                                        Rooms & Beds ({currentForm?.rooms?.length || 0} rooms)
                                    </h4>
                                    <Button
                                        label="Add Room"
                                        icon={<IoIosAdd/>}
                                        onClick={() => setShowAddRoom(true)}
                                        variant="promoted"
                                        size="small"
                                    />
                                </Box>

                                {/* Add Room Form */}
                                {showAddRoom && (
                                    <Box
                                        padding="1rem"
                                        backgroundColor="#f8fafc"
                                        border="1px solid #e2e8f0"
                                        borderRadius="0.5rem"
                                        marginBottom="1rem"
                                    >
                                        <Box display="grid" gap="1rem">
                                            <Input
                                                label="Room Name"
                                                value={newRoomName}
                                                onChange={(e) => setNewRoomName(e.target.value)}
                                                placeholder="e.g., Master Bedroom, Living Room"
                                                width="100%"
                                            />
                                            <Box display="flex" gap="0.5rem">
                                                <Button
                                                    label="Add Room"
                                                    onClick={addRoom}
                                                    variant="promoted"
                                                    disabled={!newRoomName.trim()}
                                                    size="small"
                                                />
                                                <Button
                                                    label="Cancel"
                                                    onClick={() => {
                                                        setShowAddRoom(false)
                                                        setNewRoomName('')
                                                    }}
                                                    variant="normal"
                                                    size="small"
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                )}

                                {/* Existing Rooms */}
                                {currentForm?.rooms && currentForm.rooms.length > 0 ? (
                                    <Box display="grid" gap="1rem">
                                        {currentForm.rooms.map((room, roomIndex) => (
                                            <Box
                                                key={roomIndex}
                                                padding="1rem"
                                                border="1px solid #e5e7eb"
                                                borderRadius="0.5rem"
                                                backgroundColor="white"
                                            >
                                                <Box display="flex" alignItems="center" justifyContent="space-between"
                                                     marginBottom="1rem">
                                                    <Box display="flex" alignItems="center" gap="0.5rem">
                                                        <IoIosBed color="#6b7280"/>
                                                        <h5 style={{margin: 0, fontSize: '1rem', fontWeight: '500'}}>
                                                            {room.spaceName}
                                                        </h5>
                                                        <Box
                                                            display="inline-flex"
                                                            alignItems="center"
                                                            padding="0.25rem 0.5rem"
                                                            backgroundColor="#f3f4f6"
                                                            color="#374151"
                                                            borderRadius="0.75rem"
                                                            fontSize="0.75rem"
                                                            fontWeight="500"
                                                        >
                                                            {room.beds?.length || 0} beds
                                                        </Box>
                                                    </Box>
                                                    <Box display="flex" gap="0.5rem">
                                                        <Button
                                                            label=""
                                                            icon={<IoIosAdd/>}
                                                            onClick={() => addBedToRoom(roomIndex)}
                                                            variant="normal"
                                                            size="small"
                                                        />
                                                        <Button
                                                            label=""
                                                            icon={<IoIosTrash/>}
                                                            onClick={() => removeRoom(roomIndex)}
                                                            variant="normal"
                                                            size="small"
                                                        />
                                                    </Box>
                                                </Box>

                                                {/* Beds in this room */}
                                                {room.beds && room.beds.length > 0 && (
                                                    <Box display="grid" gap="0.75rem">
                                                        {room.beds.map((bed, bedIndex) => (
                                                            <Box
                                                                key={bedIndex}
                                                                display="grid"
                                                                gridTemplateColumns="1fr"
                                                                gridTemplateColumnsSm="2fr 1fr auto"
                                                                gap="0.75rem"
                                                                alignItems="end"
                                                                padding="0rem"
                                                                paddingSm="0.75rem"
                                                                backgroundColor="transparent"
                                                                backgroundColorSm="#f9fafb"
                                                                borderRadius="0.375rem"
                                                            >
                                                                <MobileSelect
                                                                    label="Bed Type"
                                                                    value={bed.typeOfBed}
                                                                    options={Object.values(BedType).map(type => ({
                                                                        value: type,
                                                                        label: BedTypeLabels[type]
                                                                    }))}
                                                                    onChange={(value) => updateBed(roomIndex, bedIndex, 'typeOfBed', value)}
                                                                    placeholder="Select bed type"
                                                                />
                                                                <NumberStepperInput
                                                                    label="Count"
                                                                    value={bed.numberOfBed}
                                                                    onChange={(value) => updateBed(roomIndex, bedIndex, 'numberOfBed', value)}
                                                                    min={1}
                                                                    max={10}
                                                                    format="integer"
                                                                    size="small"
                                                                    width="100%"
                                                                />
                                                                <Button
                                                                    label=""
                                                                    icon={<IoIosTrash/>}
                                                                    onClick={() => removeBedFromRoom(roomIndex, bedIndex)}
                                                                    variant="normal"
                                                                    size="small"
                                                                />
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                )}
                                            </Box>
                                        ))}
                                    </Box>
                                ) : (
                                    <Box
                                        padding="2rem"
                                        textAlign="center"
                                        display={'flex'}
                                        flexDirection={'column'}
                                        alignItems={'center'}
                                        border="2px dashed #d1d5db"
                                        borderRadius="8px"
                                        color="#666"
                                    >
                                        <IoIosBed size={'5rem'} style={{marginBottom: '1rem', color: '#9ca3af'}}/>
                                        <p style={{margin: 0, fontSize: '0.875rem'}}>
                                            No rooms added yet. Click "Add Room" to start defining your property layout.
                                        </p>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>

                    {/* Pricing Setup Section */}
                    <Box>
                        <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1.5rem">
                            <IoIosCash style={{color: '#374151', fontSize: '1.25rem'}}/>
                            <h3 style={{margin: 0, fontSize: '1.5rem', fontWeight: '600'}}>
                                Pricing Setup
                            </h3>
                        </Box>
                        <p style={{color: '#666', marginBottom: '2rem'}}>
                            Set your base pricing for each day of the week. You can offer both full-day and half-day
                            rates.
                        </p>

                        <Box display="grid" gap="2rem">
                            {/* Full Day Pricing */}
                            <Box>
                                <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="1rem">
                                    <IoIosCalendar style={{color: '#059669', fontSize: '1rem'}}/>
                                    <h4 style={{margin: 0, fontSize: '1.125rem', fontWeight: '500'}}>
                                        Full Day Pricing (AED per night)
                                    </h4>
                                </Box>
                                <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(140px, 1fr))"
                                     gap="1rem">
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                                        const priceField = `price${day}` as keyof PropertyPricing
                                        const currentPrice = Number(currentForm?.pricing?.[priceField]) || 0

                                        return (
                                            <Box
                                                key={day}
                                                backgroundColor={day === 'Friday' || day === 'Saturday' ? '#fef7ff' :
                                                    day === 'Sunday' ? '#f0f9ff' : 'white'}
                                                borderRadius="8px"
                                                padding="0.5rem"
                                            >
                                                <NumberStepperInput
                                                    label={getDayName(day)}
                                                    value={currentPrice}
                                                    onChange={(value) => updatePricing(priceField, value)}
                                                    min={0}
                                                    max={10000}
                                                    step={100}
                                                    format="currency"
                                                    currency="AED"
                                                    currencyPosition="suffix"
                                                    decimalPlaces={0}
                                                    size="small"
                                                    width="100%"
                                                    required
                                                />
                                                <Box fontSize="0.75rem" color="#666" textAlign="center"
                                                     marginTop="0.25rem">
                                                    {day === 'Friday' || day === 'Saturday' ? '🔥 Weekend' :
                                                        day === 'Sunday' ? '🌅 Premium' : '📅 Weekday'}
                                                </Box>
                                            </Box>
                                        )
                                    })}
                                </Box>
                            </Box>

                            {/* Half Day Pricing */}
                            <Box>
                                <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="1rem">
                                    <IoIosTime style={{color: '#f59e0b', fontSize: '1rem'}}/>
                                    <h4 style={{margin: 0, fontSize: '1.125rem', fontWeight: '500'}}>
                                        Half Day Pricing (AED for 4-6 hours)
                                    </h4>
                                </Box>
                                <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(140px, 1fr))"
                                     gap="1rem">
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                                        const priceField = `halfDayPrice${day}` as keyof PropertyPricing
                                        const currentPrice = Number(currentForm?.pricing?.[priceField]) || 0

                                        return (
                                            <Box
                                                key={day}
                                                backgroundColor={day === 'Friday' || day === 'Saturday' ? '#fef7ff' :
                                                    day === 'Sunday' ? '#f0f9ff' : 'white'}
                                                borderRadius="8px"
                                                padding="0.5rem"
                                            >
                                                <NumberStepperInput
                                                    label={getDayName(day)}
                                                    value={currentPrice}
                                                    onChange={(value) => updatePricing(priceField, value)}
                                                    min={0}
                                                    max={5000}
                                                    step={50}
                                                    format="currency"
                                                    currency="AED"
                                                    currencyPosition="suffix"
                                                    decimalPlaces={0}
                                                    size="small"
                                                    width="100%"
                                                />
                                            </Box>
                                        )
                                    })}
                                </Box>
                            </Box>

                            {/* Pricing Tips */}
                            <Box
                                padding="1rem"
                                backgroundColor="#f0f9ff"
                                border="1px solid #bfdbfe"
                                borderRadius="8px"
                            >
                                <Box fontSize="0.875rem" color="#1e40af" lineHeight="1.5">
                                    <Box fontWeight="600" marginBottom="0.5rem">💡 Pricing Tips:</Box>
                                    <ul style={{margin: 0, paddingLeft: '1.25rem'}}>
                                        <li>Weekend rates (Fri-Sat) are typically 30-50% higher than weekdays</li>
                                        <li>Half-day rates are usually 60-70% of full-day rates</li>
                                        <li>Consider local events and seasonality when setting base prices</li>
                                        <li>You can create rate plans later to offer discounts or premium packages</li>
                                    </ul>
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    {/* Amenities Section */}
                    <Box>
                        <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1.5rem">
                            <IoIosStar style={{color: '#374151', fontSize: '1.25rem'}}/>
                            <h3 style={{margin: 0, fontSize: '1.5rem', fontWeight: '600'}}>
                                Property Amenities
                            </h3>
                        </Box>
                        <p style={{color: '#666', marginBottom: '1.5rem'}}>
                            Select amenities that your property offers. These help guests find your property in search
                            results.
                        </p>

                        <Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="1rem">
                                <label style={{fontWeight: '500', fontSize: '1rem'}}>
                                    Selected Amenities ({currentForm?.amenities?.length || 0})
                                </label>
                                <Button
                                    label="Add Amenities"
                                    icon={<IoIosAdd/>}
                                    onClick={handleAddAmenities}
                                    variant="promoted"
                                    size="small"
                                />
                            </Box>

                            {currentForm?.amenities && currentForm.amenities.length > 0 ? (
                                <Box display="flex" flexWrap="wrap" gap="0.5rem" marginBottom="2rem">
                                    {currentForm.amenities.map((amenity, index) => (
                                        <Box
                                            key={index}
                                            display="inline-flex"
                                            alignItems="center"
                                            gap="0.5rem"
                                            padding="0.5rem 1rem"
                                            backgroundColor="#3b82f6"
                                            color="white"
                                            borderRadius="1.5rem"
                                            fontSize="0.875rem"
                                            fontWeight="500"
                                        >
                                            <span>{amenity.name}</span>
                                            <Box
                                                as="button"
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                                width="1.2rem"
                                                height="1.2rem"
                                                backgroundColor="rgba(255,255,255,0.2)"
                                                border="none"
                                                borderRadius="50%"
                                                color="white"
                                                cursor="pointer"
                                                fontSize="0.75rem"
                                                onClick={() => {
                                                    const currentAmenities = currentForm.amenities ? [...currentForm.amenities] : []
                                                    const updatedAmenities = currentAmenities.filter((_, i) => i !== index)
                                                    handleFieldChange('amenities', updatedAmenities)
                                                }}
                                                style={{
                                                    minWidth: '1.2rem',
                                                    minHeight: '1.2rem'
                                                }}
                                            >
                                                <IoIosClose/>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            ) : (
                                <Box
                                    padding="2rem"
                                    textAlign="center"
                                    border="2px dashed #d1d5db"
                                    borderRadius="8px"
                                    color="#666"
                                    marginBottom="2rem"
                                >
                                    <p style={{margin: '0 0 1rem 0', fontSize: '1rem'}}>
                                        No amenities selected yet
                                    </p>
                                    <p style={{margin: 0, fontSize: '0.875rem'}}>
                                        Tap "Add Amenities" to choose from over 80 popular amenities
                                    </p>
                                </Box>
                            )}
                        </Box>
                    </Box>

                    {/* Photos Section */}
                    <Box>
                        <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1.5rem">
                            <IoIosCamera style={{color: '#374151', fontSize: '1.25rem'}}/>
                            <h3 style={{margin: 0, fontSize: '1.5rem', fontWeight: '600'}}>
                                Property Photos
                            </h3>
                        </Box>
                        <p style={{color: '#666', marginBottom: '2rem'}}>
                            Upload high-quality photos to showcase your property. Minimum 5 photos recommended.
                        </p>

                        {/* Error/Success Messages */}
                        {uploadError && (
                            <Box
                                padding="1rem"
                                marginBottom="1rem"
                                backgroundColor="#fee2e2"
                                border="1px solid #fecaca"
                                borderRadius="0.5rem"
                                color="#dc2626"
                            >
                                {uploadError}
                            </Box>
                        )}

                        {uploadSuccess && (
                            <Box
                                padding="1rem"
                                marginBottom="1rem"
                                backgroundColor="#dcfce7"
                                border="1px solid #bbf7d0"
                                borderRadius="0.5rem"
                                color="#16a34a"
                            >
                                {uploadSuccess}
                            </Box>
                        )}

                        {/* Upload Section */}
                        <Box marginBottom="2rem">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileUpload}
                                style={{display: 'none'}}
                            />
                            <Button
                                label={isUploading ? "Uploading..." : "Upload Photos"}
                                icon={isUploading ? <IoIosRefresh className="spin"/> : <IoIosCloudUpload/>}
                                onClick={() => fileInputRef.current?.click()}
                                variant="promoted"
                                disabled={isUploading}
                                fullWidth
                            />
                        </Box>

                        {currentForm?.photos && currentForm.photos.length > 0 ? (
                            <Box>
                                <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="1rem">
                                    <label style={{fontWeight: '500'}}>
                                        Current Photos
                                    </label>
                                    <Box
                                        display="inline-flex"
                                        alignItems="center"
                                        padding="0.25rem 0.5rem"
                                        backgroundColor="#3b82f6"
                                        color="white"
                                        borderRadius="0.75rem"
                                        fontSize="0.75rem"
                                        fontWeight="500"
                                    >
                                        {currentForm.photos.length} photos
                                    </Box>
                                </Box>

                                <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(150px, 1fr))"
                                     gap="1rem" marginBottom="2rem">
                                    {currentForm.photos.map((photo: any, index: number) => (
                                        <Box
                                            key={photo.id || index}
                                            borderRadius="8px"
                                            overflow="hidden"
                                            height="150px"
                                            backgroundImage={`url(${resolvePhotoUrl(photo.url)})`}
                                            backgroundSize="cover"
                                            backgroundPosition="center"
                                            position="relative"
                                            boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                                        >
                                            {index === 0 && (
                                                <Box
                                                    position="absolute"
                                                    bottom="8px"
                                                    left="8px"
                                                    display="inline-flex"
                                                    alignItems="center"
                                                    padding="0.25rem 0.5rem"
                                                    backgroundColor="rgba(245, 158, 11, 0.9)"
                                                    color="white"
                                                    borderRadius="0.75rem"
                                                    fontSize="0.75rem"
                                                    fontWeight="500"
                                                >
                                                    Main Photo
                                                </Box>
                                            )}

                                            {/* Delete button */}
                                            <Box
                                                as="button"
                                                position="absolute"
                                                top="8px"
                                                right="8px"
                                                display="inline-flex"
                                                alignItems="center"
                                                justifyContent="center"
                                                width="2rem"
                                                height="2rem"
                                                backgroundColor="rgba(239, 68, 68, 0.9)"
                                                color="white"
                                                borderRadius="50%"
                                                border="none"
                                                cursor="pointer"
                                                onClick={() => handleDeletePhoto(photo.id)}
                                                disabled={isDeletingPhoto === photo.id}
                                                title="Delete photo"
                                            >
                                                {isDeletingPhoto === photo.id ? (
                                                    <IoIosRefresh className="spin" size={12}/>
                                                ) : (
                                                    <IoIosTrash size={12}/>
                                                )}
                                            </Box>

                                            {/* Photo index indicator */}
                                            <Box
                                                position="absolute"
                                                bottom="8px"
                                                right="8px"
                                                display="inline-flex"
                                                alignItems="center"
                                                justifyContent="center"
                                                width="1.5rem"
                                                height="1.5rem"
                                                backgroundColor="rgba(107, 114, 128, 0.9)"
                                                color="white"
                                                borderRadius="50%"
                                                fontSize="0.75rem"
                                                fontWeight="500"
                                            >
                                                {index + 1}
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        ) : (
                            <Box
                                display={'flex'}
                                flexDirection={'column'}
                                padding="4rem 2rem"
                                alignItems="center"
                                border="2px dashed #d1d5db"
                                borderRadius="8px"
                                color="#666"
                                marginBottom="2rem"
                            >
                                <IoIosCamera size={48} style={{marginBottom: '1rem', color: '#9ca3af'}}/>
                                <h4 style={{margin: '0 0 0.5rem 0', color: '#4b5563'}}>No photos uploaded</h4>
                                <p style={{margin: 0, textAlign: 'center'}}>
                                    Click the upload button above to add photos to your property
                                </p>
                            </Box>
                        )}
                    </Box>

                    {/* Services Section */}
                    <Box>
                        <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1.5rem">
                            <IoIosBusiness style={{color: '#374151', fontSize: '1.25rem'}}/>
                            <h3 style={{margin: 0, fontSize: '1.5rem', fontWeight: '600'}}>
                                Services & Amenities
                            </h3>
                        </Box>

                        <Box display="grid" gap="2rem">

                            {/* Parking */}
                            <Box>
                                <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
                                    <IoIosCar style={{color: '#374151', fontSize: '0.875rem'}}/>
                                    <label style={{fontWeight: '500'}}>
                                        Parking Availability
                                    </label>
                                </Box>
                                <MobileSelect<ParkingType>
                                    label=""
                                    value={currentForm?.parking || ParkingType.No}
                                    options={Object.values(ParkingType).map(type => ({
                                        value: type,
                                        label: ParkingTypeLabels[type]
                                    }))}
                                    onChange={(value) => handleFieldChange('parking', value)}
                                    placeholder="Select parking option"
                                    helperText="Choose the parking option that best describes your property"
                                />
                            </Box>

                            {/* Languages */}
                            <Box>
                                <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
                                    <IoIosGlobe style={{color: '#374151', fontSize: '0.875rem'}}/>
                                    <label style={{fontWeight: '500'}}>
                                        Languages Spoken ({currentForm?.languages?.length || 0})
                                    </label>
                                </Box>

                                {/* Current Languages */}
                                {currentForm?.languages && currentForm.languages.length > 0 && (
                                    <Box display="flex" flexWrap="wrap" gap="0.5rem" marginBottom="1rem">
                                        {currentForm.languages.map((language, index) => (
                                            <Box
                                                key={index}
                                                display="inline-flex"
                                                alignItems="center"
                                                gap="0.5rem"
                                                padding="0.5rem 1rem"
                                                backgroundColor="#10b981"
                                                color="white"
                                                borderRadius="1.5rem"
                                                fontSize="0.875rem"
                                                fontWeight="500"
                                            >
                                                <span>{language}</span>
                                                <Box
                                                    as="button"
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                    width="1.2rem"
                                                    height="1.2rem"
                                                    backgroundColor="rgba(255,255,255,0.2)"
                                                    border="none"
                                                    borderRadius="50%"
                                                    color="white"
                                                    cursor="pointer"
                                                    fontSize="0.75rem"
                                                    onClick={() => removeLanguage(language)}
                                                >
                                                    <IoIosTrash size={10}/>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                )}

                                {/* Add New Language */}
                                <Box display="flex" gap="0.5rem" alignItems="flex-end">
                                    <Input
                                        label="Add Language"
                                        icon={IoIosGlobe}
                                        value={newLanguage}
                                        onChange={(e) => setNewLanguage(e.target.value)}
                                        placeholder="e.g., English, Arabic, Hindi"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                addLanguage()
                                            }
                                        }}
                                        width="70%"
                                    />
                                    <Button
                                        label=""
                                        icon={<IoIosAdd/>}
                                        onClick={addLanguage}
                                        variant="promoted"
                                        disabled={!newLanguage.trim()}
                                        style={{marginBottom: '0.125rem'}}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    {/* House Rules Section */}
                    <Box>
                        <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1.5rem">
                            <IoIosDocument style={{color: '#374151', fontSize: '1.25rem'}}/>
                            <h3 style={{margin: 0, fontSize: '1.5rem', fontWeight: '600'}}>
                                House Rules & Policies
                            </h3>
                        </Box>

                        <Box display="grid" gap="2rem">
                            {/* Basic Rules */}
                            <Box>
                                <h4 style={{marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '500'}}>
                                    Basic Rules
                                </h4>
                                <Box display="grid" gap="1rem">
                                    {/* Smoking */}
                                    <Box>
                                        <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                                            <Box display="flex" alignItems="center" gap="0.5rem">
                                                <IoIosCloseCircle style={{color: '#374151', fontSize: '0.875rem'}}/>
                                                Smoking Policy
                                            </Box>
                                        </label>
                                        <Box display="flex" gap="1rem">
                                            <Box
                                                as="button"
                                                onClick={() => handleFieldChange('smokingAllowed', true)}
                                                padding="0.75rem 1.5rem"
                                                border={currentForm?.smokingAllowed ? '2px solid #3b82f6' : '1px solid #d1d5db'}
                                                backgroundColor={currentForm?.smokingAllowed ? '#eff6ff' : 'white'}
                                                borderRadius="0.5rem"
                                                cursor="pointer"
                                                fontWeight={currentForm?.smokingAllowed ? '600' : '400'}
                                                color={currentForm?.smokingAllowed ? '#1d4ed8' : '#374151'}
                                                width="50%"
                                            >
                                                Smoking Allowed
                                            </Box>
                                            <Box
                                                as="button"
                                                onClick={() => handleFieldChange('smokingAllowed', false)}
                                                padding="0.75rem 1.5rem"
                                                border={!currentForm?.smokingAllowed ? '2px solid #3b82f6' : '1px solid #d1d5db'}
                                                backgroundColor={!currentForm?.smokingAllowed ? '#eff6ff' : 'white'}
                                                borderRadius="0.5rem"
                                                cursor="pointer"
                                                fontWeight={!currentForm?.smokingAllowed ? '600' : '400'}
                                                color={!currentForm?.smokingAllowed ? '#1d4ed8' : '#374151'}
                                                width="50%"
                                            >
                                                No Smoking
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Parties/Events */}
                                    <Box>
                                        <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                                            <Box display="flex" alignItems="center" gap="0.5rem">
                                                <IoIosWine style={{color: '#374151', fontSize: '0.875rem'}}/>
                                                Parties & Events
                                            </Box>
                                        </label>
                                        <Box display="flex" gap="1rem">
                                            <Box
                                                as="button"
                                                onClick={() => handleFieldChange('partiesOrEventsAllowed', true)}
                                                padding="0.75rem 1.5rem"
                                                border={currentForm?.partiesOrEventsAllowed ? '2px solid #3b82f6' : '1px solid #d1d5db'}
                                                backgroundColor={currentForm?.partiesOrEventsAllowed ? '#eff6ff' : 'white'}
                                                borderRadius="0.5rem"
                                                cursor="pointer"
                                                fontWeight={currentForm?.partiesOrEventsAllowed ? '600' : '400'}
                                                color={currentForm?.partiesOrEventsAllowed ? '#1d4ed8' : '#374151'}
                                                width="50%"
                                            >
                                                Events Allowed
                                            </Box>
                                            <Box
                                                as="button"
                                                onClick={() => handleFieldChange('partiesOrEventsAllowed', false)}
                                                padding="0.75rem 1.5rem"
                                                border={!currentForm?.partiesOrEventsAllowed ? '2px solid #3b82f6' : '1px solid #d1d5db'}
                                                backgroundColor={!currentForm?.partiesOrEventsAllowed ? '#eff6ff' : 'white'}
                                                borderRadius="0.5rem"
                                                cursor="pointer"
                                                fontWeight={!currentForm?.partiesOrEventsAllowed ? '600' : '400'}
                                                color={!currentForm?.partiesOrEventsAllowed ? '#1d4ed8' : '#374151'}
                                                width="50%"
                                            >
                                                No Events
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Pets */}
                                    <MobileSelect<PetPolicy>
                                        label="Pet Policy"
                                        value={currentForm?.petsAllowed || PetPolicy.No}
                                        options={Object.values(PetPolicy).map(policy => ({
                                            value: policy,
                                            label: PetPolicyLabels[policy]
                                        }))}
                                        onChange={(value) => handleFieldChange('petsAllowed', value)}
                                        placeholder="Select pet policy"
                                        helperText="Choose your property's pet accommodation policy"
                                    />
                                </Box>
                            </Box>

                            {/* Check-in/Check-out Times */}
                            <Box>
                                <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="1rem">
                                    <IoIosTime style={{color: '#374151', fontSize: '0.875rem'}}/>
                                    <h4 style={{margin: 0, fontSize: '1.125rem', fontWeight: '500'}}>
                                        Check-in & Check-out Times
                                    </h4>
                                </Box>
                                <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem">
                                    <TimePicker
                                        label="Check-in From"
                                        value={currentForm?.checkInCheckout?.checkInFrom ? `2025-01-01T${currentForm.checkInCheckout.checkInFrom}:00` : '2025-01-01T15:00:00'}
                                        onChange={(value) => {
                                            const time = new Date(value).toTimeString().substring(0, 5)
                                            updateCheckInCheckout('checkInFrom', time)
                                        }}
                                        placeholder="Select check-in start time"
                                        interval={30}
                                        use12HourFormat={false}
                                    />
                                    <TimePicker
                                        label="Check-in Until"
                                        value={currentForm?.checkInCheckout?.checkInUntil ? `2025-01-01T${currentForm.checkInCheckout.checkInUntil}:00` : '2025-01-01T22:00:00'}
                                        onChange={(value) => {
                                            const time = new Date(value).toTimeString().substring(0, 5)
                                            updateCheckInCheckout('checkInUntil', time)
                                        }}
                                        placeholder="Select check-in end time"
                                        interval={30}
                                        use12HourFormat={false}
                                    />
                                    <TimePicker
                                        label="Check-out From"
                                        value={currentForm?.checkInCheckout?.checkOutFrom ? `2025-01-01T${currentForm.checkInCheckout.checkOutFrom}:00` : '2025-01-01T08:00:00'}
                                        onChange={(value) => {
                                            const time = new Date(value).toTimeString().substring(0, 5)
                                            updateCheckInCheckout('checkOutFrom', time)
                                        }}
                                        placeholder="Select check-out start time"
                                        interval={30}
                                        use12HourFormat={false}
                                    />
                                    <TimePicker
                                        label="Check-out Until"
                                        value={currentForm?.checkInCheckout?.checkOutUntil ? `2025-01-01T${currentForm.checkInCheckout.checkOutUntil}:00` : '2025-01-01T11:00:00'}
                                        onChange={(value) => {
                                            const time = new Date(value).toTimeString().substring(0, 5)
                                            updateCheckInCheckout('checkOutUntil', time)
                                        }}
                                        placeholder="Select check-out end time"
                                        interval={30}
                                        use12HourFormat={false}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Amenity Selection Drawer */}
            <SlidingDrawer
                isOpen={drawerManager.isDrawerOpen(amenitiesDrawerId)}
                onClose={handleCancelAmenities}
                side="bottom"
                height="100%"
                zIndex={drawerManager.getDrawerZIndex(amenitiesDrawerId)}
                contentStyles={{
                    maxWidth: 600,
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    borderTopLeftRadius: '1rem',
                    borderTopRightRadius: '1rem'
                }}
                showCloseButton
            >
                <Box padding="1.5rem" display="flex" flexDirection="column" height="100%" overflow="hidden">
                    {/* Header */}
                    <Box marginBottom="1rem">
                        <Box fontSize="1.25rem" fontWeight="600" marginBottom="0.5rem" textAlign="center"
                             color="#1a202c">
                            Select Amenities
                        </Box>
                        <Box fontSize="0.875rem" color="#6b7280" textAlign="center">
                            Choose all amenities your property offers
                        </Box>
                    </Box>

                    {/* Category Tabs */}
                    <Box display="flex" gap="0.5rem" flexWrap={'wrap'} marginBottom="1rem" overflowX="auto"
                         paddingBottom="0.5rem">
                        {categories.map((category) => (
                            <Button
                                key={category}
                                label={category}
                                icon={getCategoryIcon(category)}
                                variant={selectedCategory === category ? "promoted" : "normal"}
                                size="small"
                                onClick={() => setSelectedCategory(category)}
                                style={{
                                    minWidth: 'max-content',
                                    whiteSpace: 'nowrap',
                                    fontSize: '0.75rem'
                                }}
                            />
                        ))}
                    </Box>

                    {/* Amenities List */}
                    <Box flex="1" overflow="auto" marginBottom="1rem">
                        {selectedCategory && amenitiesByCategory[selectedCategory] && (
                            <SelectionPicker
                                data={amenitiesByCategory[selectedCategory]}
                                idAccessor={(item) => item.id}
                                value={tempSelectedAmenities}
                                onChange={handleAmenitySelectionChange}
                                isMultiSelect={true}
                                itemStyles={{paddingTop: '0.25rem', paddingBottom: '0.25rem'}}
                                renderItem={(amenity) => (
                                    <Box display="flex" alignItems="center" gap="0.75rem" width="100%">
                                        <Box fontSize="1.5rem">{amenity.icon}</Box>
                                        <Box flex="1">
                                            <Box fontWeight="500" fontSize="1rem">{amenity.name}</Box>
                                        </Box>
                                    </Box>
                                )}
                                containerStyles={{
                                    gap: '0.5rem'
                                }}
                            />
                        )}
                    </Box>

                    {/* Action Buttons */}
                    <Box display="flex" gap="1rem" paddingTop="1rem" borderTop="1px solid #e5e7eb">
                        <Button
                            label="Cancel"
                            variant="normal"
                            onClick={handleCancelAmenities}
                            style={{flex: 1}}
                        />
                        <Button
                            label={`Save (${tempSelectedAmenities.length} selected)`}
                            icon={<IoIosCheckmark/>}
                            variant="promoted"
                            onClick={handleSaveAmenities}
                            style={{flex: 1}}
                        />
                    </Box>
                </Box>
            </SlidingDrawer>

            {/* Map and Animation Styles */}
            <style>{`
        .leaflet-container {
          font-family: inherit;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
        .leaflet-control-attribution {
          font-size: 10px;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
        </SecuredPage>
    )
}

export default PropertyManager