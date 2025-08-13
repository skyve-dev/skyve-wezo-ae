import React, { useState } from 'react'
import { WizardFormData, Photo } from '../../types/property'
import { Box } from '../Box'

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
  const photos = data.photos || []

  const handleFileUpload = (files: FileList | File[]) => {
    const newPhotos: Photo[] = []
    
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file)
        newPhotos.push({
          url,
          altText: '',
          description: '',
          tags: []
        })
      }
    })
    
    onChange({
      photos: [...photos, ...newPhotos]
    })
  }

  const removePhoto = (index: number) => {
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
    <Box padding="2rem">
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
            cursor="pointer"
            backgroundColor={dragOver ? '#f3f4f6' : '#fafafa'}
            whileHover={{ backgroundColor: '#f3f4f6', borderColor: '#3182ce' }}
            onDragOver={(e: React.DragEvent) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e: React.DragEvent) => {
              e.preventDefault()
              setDragOver(false)
              handleFileUpload(e.dataTransfer.files)
            }}
          >
            <Box
              as="input"
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (e.target.files) {
                  handleFileUpload(e.target.files)
                }
              }}
            />
            <Box fontSize="1.125rem" color="#374151" marginBottom="0.5rem">
              Drop photos here or click to browse
            </Box>
            <Box fontSize="0.875rem" color="#6b7280">
              JPG, PNG, WebP up to 10MB each
            </Box>
          </Box>
        </Box>

        {/* Photos Grid */}
        {photos.length > 0 && (
          <Box>
            <Box fontSize="1rem" fontWeight="500" color="#374151" marginBottom="1rem">
              Your Photos ({photos.length})
            </Box>
            <Box display="grid" gridTemplateColumns={{ Sm: '1fr', Md: '1fr 1fr' }} gap="1rem">
              {photos.map((photo, index) => (
                <Box key={index} border="1px solid #e5e7eb" borderRadius="0.5rem" overflow="hidden">
                  <Box position="relative">
                    <Box
                      as="img"
                      src={photo.url}
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
                      <Box
                        as="input"
                        type="text"
                        placeholder="Alt text (for accessibility)"
                        value={photo.altText || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          updatePhoto(index, 'altText', e.target.value)
                        }
                        width="100%"
                        padding="0.5rem"
                        border="1px solid #d1d5db"
                        borderRadius="0.375rem"
                        fontSize="0.875rem"
                        whileFocus={{ borderColor: '#3182ce', outline: 'none' }}
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
                      fontSize="0.875rem"
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