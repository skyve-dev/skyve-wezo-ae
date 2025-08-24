import React from 'react'
import { FaCamera } from 'react-icons/fa'
import { Box } from '@/components'
import { WizardFormData } from '@/types/property'
import { resolvePhotoUrl } from '@/utils/api'

interface PhotosTabProps {
    formData: Partial<WizardFormData>
    currentProperty?: any // Replace with proper type
    updateFormData: (updates: Partial<WizardFormData>) => void
}

const PhotosTab: React.FC<PhotosTabProps> = ({ currentProperty }) => {
    return (
        <Box>
            <h3 style={{marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600'}}>
                Property Photos
            </h3>
            <p style={{color: '#666', marginBottom: '2rem'}}>
                Upload high-quality photos to showcase your property. Minimum 5 photos recommended.
            </p>

            {currentProperty?.photos && currentProperty.photos.length > 0 ? (
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
                                
                                {/* Mobile-friendly photo index indicator */}
                                <Box
                                    position="absolute"
                                    top="8px"
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
                    padding="4rem 2rem"
                    textAlign="center"
                    border="2px dashed #d1d5db"
                    borderRadius="8px"
                    color="#666"
                    marginBottom="2rem"
                >
                    <FaCamera size={48} style={{marginBottom: '1rem', color: '#9ca3af'}}/>
                    <h4 style={{margin: '0 0 0.5rem 0', color: '#4b5563'}}>No photos uploaded</h4>
                    <p style={{margin: 0}}>Photos can be uploaded using the property creation wizard</p>
                </Box>
            )}

            <Box
                padding="1rem"
                backgroundColor="#f0f9ff"
                borderRadius="0.5rem"
                border="1px solid #bae6fd"
            >
                <h4 style={{margin: '0 0 0.5rem 0', color: '#0369a1', fontSize: '0.875rem', fontWeight: '600'}}>
                    📸 Photo Management Tips
                </h4>
                <ul style={{
                    margin: 0,
                    paddingLeft: '1rem',
                    fontSize: '0.875rem',
                    color: '#0c4a6e',
                    lineHeight: '1.5'
                }}>
                    <li>Use the property wizard for mobile-optimized photo upload</li>
                    <li>First photo automatically becomes the main photo</li>
                    <li>Tap photos to view full size on mobile devices</li>
                    <li>Photos are numbered for easy reference</li>
                </ul>
            </Box>
        </Box>
    )
}

export default PhotosTab