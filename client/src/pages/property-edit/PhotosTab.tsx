import React, {useRef, useState} from 'react'
import {FaCamera, FaSpinner, FaTrash, FaUpload} from 'react-icons/fa'
import {Box} from '@/components'
import Button from '@/components/base/Button'
import {Property, ValidationErrors, WizardFormData} from '@/types/property'
import {api, resolvePhotoUrl} from '@/utils/api'
import {useAppDispatch} from '@/store'
import {fetchPropertyById} from '@/store/slices/propertySlice'

interface PhotosTabProps {
    formData: Partial<WizardFormData>
    currentProperty?: Property | null
    updateFormData: (updates: Partial<WizardFormData>) => void
    validationErrors?: ValidationErrors | null
}

const PhotosTab: React.FC<PhotosTabProps> = ({ currentProperty }) => {
    const dispatch = useAppDispatch()
    const [isUploading, setIsUploading] = useState(false)
    const [isDeletingPhoto, setIsDeletingPhoto] = useState<string | null>(null)
    const [uploadError, setUploadError] = useState<string>('')
    const [uploadSuccess, setUploadSuccess] = useState<string>('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Clear upload messages when currentProperty changes (e.g., switching from edit to create)
    React.useEffect(() => {
        setUploadError('')
        setUploadSuccess('')
        setIsDeletingPhoto(null)
    }, [currentProperty?.propertyId])

    // Image resizing function - same as PhotoManagement
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
                    
                    // Calculate new dimensions - shorter side becomes 800px
                    let newWidth: number
                    let newHeight: number
                    
                    if (img.width < img.height) {
                        // Width is the shorter side
                        newWidth = 800
                        newHeight = Math.round((img.height / img.width) * 800)
                    } else {
                        // Height is the shorter side (or they're equal)
                        newHeight = 800
                        newWidth = Math.round((img.width / img.height) * 800)
                    }
                    
                    // Set canvas dimensions
                    canvas.width = newWidth
                    canvas.height = newHeight
                    
                    // Draw the resized image
                    ctx.drawImage(img, 0, 0, newWidth, newHeight)
                    
                    // Convert to blob with JPEG compression for smaller file size
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                resolve(blob)
                            } else {
                                reject(new Error('Failed to convert canvas to blob'))
                            }
                        },
                        'image/jpeg',
                        0.85 // 85% quality
                    )
                }
                
                img.onerror = () => {
                    reject(new Error('Failed to load image'))
                }
                
                img.src = e.target?.result as string
            }
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'))
            }
            
            reader.readAsDataURL(file)
        })
    }

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (!files || files.length === 0 || !currentProperty?.propertyId) return

        setIsUploading(true)
        setUploadError('')
        setUploadSuccess('')

        const formData = new FormData()
        
        // Resize each image before uploading
        for (const file of Array.from(files)) {
            try {
                const resizedBlob = await resizeImage(file)
                // Create a new File object from the resized blob with the original name
                const resizedFile = new File(
                    [resizedBlob], 
                    file.name.replace(/\.[^/.]+$/, '.jpg'), // Change extension to .jpg
                    { type: 'image/jpeg' }
                )
                formData.append('photos', resizedFile)
            } catch (resizeError) {
                console.error(`Failed to resize ${file.name}:`, resizeError)
                // If resizing fails, upload the original file
                formData.append('photos', file)
            }
        }

        try {
            await api.post(
                `/api/properties/${currentProperty.propertyId}/photos`,
                formData,
                {}
            )

            setUploadSuccess(`Successfully uploaded ${files.length} photo(s)`)
            
            // Refresh property data to show new photos
            dispatch(fetchPropertyById(currentProperty.propertyId))
            
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
        if (!currentProperty?.propertyId) return
        
        if (!window.confirm('Are you sure you want to delete this photo?')) return

        setIsDeletingPhoto(photoId)
        setUploadError('')
        setUploadSuccess('')

        try {
            await api.delete(`/api/properties/${currentProperty.propertyId}/photos/${photoId}`)
            
            setUploadSuccess('Photo deleted successfully')
            
            // Refresh property data to reflect deletion
            dispatch(fetchPropertyById(currentProperty.propertyId))
        } catch (err: any) {
            setUploadError(err.message || 'Failed to delete photo')
        } finally {
            setIsDeletingPhoto(null)
        }
    }

    const triggerFileUpload = () => {
        fileInputRef.current?.click()
    }

    return (
        <Box>
            <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1.5rem">
                <FaCamera style={{color: '#374151', fontSize: '1.25rem'}} />
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
                    style={{ display: 'none' }}
                />
                <Button
                    label={
                        !currentProperty?.propertyId 
                            ? "Save Property First" 
                            : isUploading 
                                ? "Uploading..." 
                                : "Upload Photos"
                    }
                    icon={isUploading ? <FaSpinner className="spin" /> : <FaUpload />}
                    onClick={currentProperty?.propertyId ? triggerFileUpload : undefined}
                    variant={currentProperty?.propertyId ? "promoted" : "normal"}
                    disabled={!currentProperty?.propertyId || isUploading}
                    fullWidth
                />
            </Box>

            {currentProperty?.propertyId && currentProperty?.photos && currentProperty.photos.length > 0 ? (
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
                            {currentProperty.photos.length} photos
                        </Box>
                    </Box>

                    <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(150px, 1fr))" gap="1rem" marginBottom="2rem">
                        {currentProperty.photos.map((photo: any, index: number) => (
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
                                        <FaSpinner className="spin" size={12} />
                                    ) : (
                                        <FaTrash size={12} />
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
                    <FaCamera size={48} style={{marginBottom: '1rem', color: '#9ca3af'}}/>
                    <h4 style={{margin: '0 0 0.5rem 0', color: '#4b5563'}}>No photos uploaded</h4>
                    <p style={{margin: 0,textAlign:'center'}}>
                        {currentProperty?.propertyId 
                            ? 'Click the upload button above to add photos'
                            : 'Save the property first to enable photo upload'}
                    </p>
                </Box>
            )}


            
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </Box>
    )
}

export default PhotosTab