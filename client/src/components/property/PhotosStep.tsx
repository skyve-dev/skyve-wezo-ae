import React, { useState } from 'react'
import { WizardFormData, Photo } from '../../types/property'
import { Box } from '../base/Box'
import { Input } from '../base/Input'
import { api, resolvePhotoUrl } from '../../utils/api'
import { 
  FaCloudUploadAlt,
  FaSpinner
} from 'react-icons/fa'

interface PhotosStepProps {
  data: WizardFormData
  onChange: (updates: Partial<WizardFormData>) => void
  onNext: () => void
  onPrevious: () => void
  onSubmit: () => void
  loading: boolean
  isFirstStep: boolean
  isLastStep: boolean
}

const PhotosStep: React.FC<PhotosStepProps> = ({
  data,
  onChange,
  onNext,
  onPrevious,
  loading
}) => {
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const photos = data.photos || []

  // Add keyframes for spinner animation
  React.useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

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
          
          // Calculate new dimensions - shortest side becomes 800px
          const aspectRatio = img.width / img.height
          let newWidth: number
          let newHeight: number
          
          if (img.width < img.height) {
            // Width is shortest side
            newWidth = 800
            newHeight = Math.round(800 / aspectRatio)
          } else {
            // Height is shortest side (or square)
            newHeight = 800
            newWidth = Math.round(800 * aspectRatio)
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

  const handleFileUpload = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024 // 10MB limit
    )
    
    if (validFiles.length === 0) {
      alert('Please select valid image files (JPG, PNG, WebP) under 10MB')
      return
    }

    setUploading(true)
    
    try {
      const formData = new FormData()
      
      // Resize each image before uploading
      for (const file of validFiles) {
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
      
      const response = await api.post<{ photos: Array<{ id: string, url: string }> }>(
        '/api/photos/upload',
        formData
      )
      
      const newPhotos: Photo[] = response.photos.map(serverPhoto => ({
        id: serverPhoto.id,
        url: serverPhoto.url,
        altText: '',
        description: '',
        tags: []
      }))
      
      onChange({
        photos: [...photos, ...newPhotos]
      })
    } catch (error: any) {
      console.error('Photo upload failed:', error)
      alert('Failed to upload photos. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = async (index: number) => {
    const photoToRemove = photos[index]
    
    // If photo has an ID, it's been uploaded to server, so delete it
    if (photoToRemove.id) {
      try {
        await api.delete(`/api/photos/${photoToRemove.id}`)
      } catch (error) {
        console.error('Failed to delete photo from server:', error)
        // Continue with removal from client state even if server deletion fails
      }
    }
    
    onChange({
      photos: photos.filter((_, i) => i !== index)
    })
  }

  const updatePhoto = (index: number, field: keyof Photo, value: string) => {
    const updatedPhotos = [...photos]
    updatedPhotos[index] = { ...updatedPhotos[index], [field]: value }
    onChange({ photos: updatedPhotos })
  }

  return (
    <Box paddingSm="1rem" paddingMd="2rem">
      <Box marginBottom="2rem">
        <Box fontSize="1.5rem" fontWeight="600" color="#1a202c" marginBottom="0.5rem">
          Add photos of your place
        </Box>
        <Box color="#718096">
          Photos help guests imagine staying at your place. You can start with one and add more later.
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap="1.5rem">
        {/* Upload Area */}
        <Box>
          <Box
            as="label"
            display="block"
            padding="3rem"
            border="2px dashed #d1d5db"
            borderRadius="0.5rem"
            textAlign="center"
            cursor={uploading ? 'not-allowed' : 'pointer'}
            backgroundColor={dragOver ? '#f3f4f6' : '#fafafa'}
            opacity={uploading ? 0.7 : 1}
            whileHover={!uploading ? { backgroundColor: '#f3f4f6', borderColor: '#3182ce' } : undefined}
            onDragOver={(e: React.DragEvent) => {
              e.preventDefault()
              if (!uploading) setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e: React.DragEvent) => {
              e.preventDefault()
              setDragOver(false)
              if (!uploading) {
                handleFileUpload(e.dataTransfer.files)
              }
            }}
          >
            <Box
              as="input"
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              display={'none'}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (e.target.files) {
                  handleFileUpload(e.target.files)
                  // Clear the input so the same files can be selected again
                  e.target.value = ''
                }
              }}
            />
            <Box display="flex" flexDirection="column" alignItems="center" gap="1rem">
              {uploading ? (
                <Box display="flex" flexDirection="column" alignItems="center" gap="0.5rem">
                  <Box 
                    style={{ 
                      animation: 'spin 1s linear infinite',
                      transformOrigin: 'center'
                    }}
                  >
                    <FaSpinner size="3rem" color="#3182ce" />
                  </Box>
                  <Box fontSize="1rem" color="#3182ce" fontWeight="500">
                    Uploading photos...
                  </Box>
                </Box>
              ) : (
                <>
                  <FaCloudUploadAlt size="3rem" color={dragOver ? "#3182ce" : "#9ca3af"} />
                  <Box fontSize="1.125rem" color="#374151" fontWeight="500">
                    Drop photos here or click to browse
                  </Box>
                  <Box fontSize="1rem" color="#6b7280">
                    JPG, PNG, WebP up to 10MB each
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Box>

        {/* Photos Grid */}
        {photos.length > 0 && (
          <Box>
            <Box fontSize="1rem" fontWeight="500" color="#374151" marginBottom="1rem">
              Your Photos ({photos.length})
            </Box>
            <Box display="grid" gridTemplateColumnsSm="1fr" gridTemplateColumnsMd="1fr 1fr" gap="1rem">
              {photos.map((photo, index) => (
                <Box key={index} border="1px solid #e5e7eb" borderRadius="0.5rem" overflow="hidden">
                  <Box position="relative">
                    <Box
                      as="img"
                      src={resolvePhotoUrl(photo.url)}
                      alt={photo.altText || `Photo ${index + 1}`}
                      width="100%"
                      height="200px"
                      objectFit="cover"
                    />
                    <Box
                      as="button"
                      onClick={() => removePhoto(index)}
                      position="absolute"
                      top="0.5rem"
                      right="0.5rem"
                      width="2rem"
                      height="2rem"
                      backgroundColor="rgba(239, 68, 68, 0.9)"
                      color="white"
                      border="none"
                      borderRadius="50%"
                      cursor="pointer"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      whileHover={{ backgroundColor: 'rgba(220, 38, 38, 0.9)' }}
                    >
                      ×
                    </Box>
                  </Box>
                  <Box padding="1rem">
                    <Box marginBottom="0.5rem">
                      <Input
                        type="text"
                        placeholder="Alt text (for accessibility)"
                        value={photo.altText || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          updatePhoto(index, 'altText', e.target.value)
                        }
                        fullWidth={true}
                      />
                    </Box>
                    <Box
                      as="textarea"
                      placeholder="Photo description (optional)"
                      value={photo.description || ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                        updatePhoto(index, 'description', e.target.value)
                      }
                      width="100%"
                      minHeight="60px"
                      padding="0.5rem"
                      border="1px solid #d1d5db"
                      borderRadius="0.375rem"
                      fontSize="1rem"
                      resize="vertical"
                      whileFocus={{ borderColor: '#3182ce', outline: 'none' }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* Navigation */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginTop="3rem"
        paddingTop="2rem"
        borderTop="1px solid #e5e7eb"
      >
        <Box>
          <Box
            as="button"
            onClick={onPrevious}
            padding="0.75rem 1.5rem"
            backgroundColor="transparent"
            color="#6b7280"
            border="1px solid #d1d5db"
            borderRadius="0.375rem"
            fontSize="1rem"
            cursor="pointer"
            whileHover={{ borderColor: '#9ca3af', backgroundColor: '#f9fafb' }}
          >
            Previous
          </Box>
        </Box>

        <Box>
          <Box
            as="button"
            onClick={onNext}
            disabled={loading}
            padding="0.75rem 2rem"
            backgroundColor="#3182ce"
            color="white"
            border="none"
            borderRadius="0.375rem"
            fontSize="1rem"
            fontWeight="500"
            cursor="pointer"
            whileHover={{ backgroundColor: '#2c5aa0' }}
          >
            {loading ? 'Saving...' : 'Next'}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default PhotosStep