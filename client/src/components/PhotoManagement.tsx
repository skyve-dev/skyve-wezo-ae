import React, { useState, useEffect, useRef } from 'react';
import { Photo } from '@/types/property';
import { api, resolvePhotoUrl } from '@/utils/api';
import { Box } from './Box';

interface ExtendedPhoto extends Photo {
  id: string;
  propertyId?: string | null;
  createdAt?: string;
}

interface Property {
  propertyId: string;
  name: string;
}

const PhotoManagement: React.FC = () => {
  const [photos, setPhotos] = useState<ExtendedPhoto[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [filterType, setFilterType] = useState<'all' | 'attached' | 'unattached'>('all');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPhotos();
    fetchProperties();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await api.get<{ photos: ExtendedPhoto[] }>('/api/photos/unattached');
      const unattachedPhotos = response.photos;
      
      // Also fetch photos from properties
      const propertiesResponse = await api.get<{ properties: any[] }>('/api/properties/my-properties');
      const attachedPhotos: ExtendedPhoto[] = [];
      
      propertiesResponse.properties.forEach((property: any) => {
        if (property.photos) {
          property.photos.forEach((photo: ExtendedPhoto) => {
            attachedPhotos.push({
              ...photo,
              propertyId: property.propertyId,
            });
          });
        }
      });

      const allPhotos = [...unattachedPhotos, ...attachedPhotos];
      setPhotos(allPhotos);
    } catch (err: any) {
      setError('Failed to fetch photos');
      console.error('Error fetching photos:', err);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await api.get<{ properties: Property[] }>('/api/properties/my-properties');
      setProperties(response.properties);
    } catch (err: any) {
      console.error('Error fetching properties:', err);
    }
  };

  const resizeImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          // Calculate new dimensions - shorter side becomes 800px
          let newWidth: number;
          let newHeight: number;
          
          if (img.width < img.height) {
            // Width is the shorter side
            newWidth = 800;
            newHeight = Math.round((img.height / img.width) * 800);
          } else {
            // Height is the shorter side (or they're equal)
            newHeight = 800;
            newWidth = Math.round((img.width / img.height) * 800);
          }
          
          // Set canvas dimensions
          canvas.width = newWidth;
          canvas.height = newHeight;
          
          // Draw the resized image
          ctx.drawImage(img, 0, 0, newWidth, newHeight);
          
          // Convert to blob with JPEG compression for smaller file size
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to convert canvas to blob'));
              }
            },
            'image/jpeg',
            0.85 // 85% quality
          );
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    
    // Resize each image before uploading
    for (const file of Array.from(files)) {
      try {
        const resizedBlob = await resizeImage(file);
        // Create a new File object from the resized blob with the original name
        const resizedFile = new File(
          [resizedBlob], 
          file.name.replace(/\.[^/.]+$/, '.jpg'), // Change extension to .jpg
          { type: 'image/jpeg' }
        );
        formData.append('photos', resizedFile);
      } catch (resizeError) {
        console.error(`Failed to resize ${file.name}:`, resizeError);
        // If resizing fails, upload the original file
        formData.append('photos', file);
      }
    }

    try {
      const response = await api.post<{ photos: ExtendedPhoto[] }>(
        '/api/photos/upload',
        formData,
        {}
      );

      setPhotos(prev => [...response.photos, ...prev]);
      setSuccess(`Successfully uploaded ${response.photos.length} photo(s)`);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload photos');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;

    try {
      await api.delete(`/api/photos/${photoId}`);
      setPhotos(prev => prev.filter(p => p.id !== photoId));
      setSelectedPhotos(prev => {
        const newSet = new Set(prev);
        newSet.delete(photoId);
        return newSet;
      });
      setSuccess('Photo deleted successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to delete photo');
    }
  };

  const handleAttachToProperty = async () => {
    if (!selectedProperty) {
      setError('Please select a property');
      return;
    }

    if (selectedPhotos.size === 0) {
      setError('Please select at least one photo');
      return;
    }

    try {
      const photoIds = Array.from(selectedPhotos);
      await api.post(`/api/photos/attach/${selectedProperty}`, { photoIds });
      
      setPhotos(prev => prev.map(photo => 
        photoIds.includes(photo.id) 
          ? { ...photo, propertyId: selectedProperty }
          : photo
      ));
      
      setSelectedPhotos(new Set());
      setSuccess(`Successfully attached ${photoIds.length} photo(s) to property`);
    } catch (err: any) {
      setError(err.message || 'Failed to attach photos');
    }
  };

  const handleDetachFromProperty = async (photoId: string, propertyId: string) => {
    if (!window.confirm('Are you sure you want to detach this photo from the property?')) return;

    try {
      await api.delete(`/api/properties/${propertyId}/photos/${photoId}`);
      
      setPhotos(prev => prev.map(photo => 
        photo.id === photoId 
          ? { ...photo, propertyId: null }
          : photo
      ));
      
      setSuccess('Photo detached successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to detach photo');
    }
  };

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  };

  const getSortedAndFilteredPhotos = () => {
    let filtered = [...photos];

    // Apply filter
    if (filterType === 'attached') {
      filtered = filtered.filter(p => p.propertyId);
    } else if (filterType === 'unattached') {
      filtered = filtered.filter(p => !p.propertyId);
    }

    // Apply sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  };

  const getPropertyName = (propertyId: string) => {
    const property = properties.find(p => p.propertyId === propertyId);
    return property?.name || 'Unknown Property';
  };

  const displayedPhotos = getSortedAndFilteredPhotos();

  return (
    <Box padding={20} paddingMd={30}>
      <Box 
        as="h1" 
        fontSize={24}
        fontSizeMd={28}
        fontWeight={700}
        marginBottom={20}
      >
        Photo Management
      </Box>

      {error && (
        <Box 
          backgroundColor="#fee"
          color="#c00"
          padding={10}
          borderRadius={4}
          marginBottom={15}
        >
          {error}
        </Box>
      )}

      {success && (
        <Box 
          backgroundColor="#efe"
          color="#060"
          padding={10}
          borderRadius={4}
          marginBottom={15}
        >
          {success}
        </Box>
      )}

      {/* Upload Section */}
      <Box 
        marginBottom={30}
        padding={20}
        border="2px dashed #ddd"
        borderRadius={8}
        backgroundColor="#f9f9f9"
      >
        <Box 
          as="h2" 
          fontSize={18}
          fontWeight={600}
          marginBottom={15}
        >
          Upload New Photos
        </Box>
        
        <Box>
          <Box
            as="input"
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            marginBottom={10}
          />
        </Box>
        
        {isUploading && (
          <Box color="#666" fontSize={'1rem'}>
            Uploading...
          </Box>
        )}
      </Box>

      {/* Controls Section */}
      <Box 
        marginBottom={20}
        display="flex"
        gap={15}
        flexWrap="wrap"
        alignItems="center"
      >
        <Box display="flex" alignItems="center" gap={8}>
          <Box as="label" fontSize={'1rem'} fontWeight={500}>
            Sort by:
          </Box>
          <Box
            as="select"
            value={sortOrder}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
              setSortOrder(e.target.value as 'newest' | 'oldest')}
            padding={5}
            borderRadius={4}
            border="1px solid #ddd"
            fontSize={'1rem'}
          >
            <Box as="option" value="newest">Newest First</Box>
            <Box as="option" value="oldest">Oldest First</Box>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={8}>
          <Box as="label" fontSize={'1rem'} fontWeight={500}>
            Filter:
          </Box>
          <Box
            as="select"
            value={filterType}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
              setFilterType(e.target.value as 'all' | 'attached' | 'unattached')}
            padding={5}
            borderRadius={4}
            border="1px solid #ddd"
            fontSize={'1rem'}
          >
            <Box as="option" value="all">All Photos</Box>
            <Box as="option" value="attached">Attached to Property</Box>
            <Box as="option" value="unattached">Unattached</Box>
          </Box>
        </Box>

        {selectedPhotos.size > 0 && (
          <Box display="flex" gap={10} alignItems="center">
            <Box
              as="select"
              value={selectedProperty}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                setSelectedProperty(e.target.value)}
              padding={5}
              borderRadius={4}
              border="1px solid #ddd"
              fontSize={'1rem'}
            >
              <Box as="option" value="">Select a property</Box>
              {properties.map(property => (
                <Box as="option" key={property.propertyId} value={property.propertyId}>
                  {property.name}
                </Box>
              ))}
            </Box>
            
            <Box
              as="button"
              onClick={handleAttachToProperty}
              padding={8}
              paddingLeft={15}
              paddingRight={15}
              backgroundColor="#007bff"
              color="white"
              border="none"
              borderRadius={4}
              cursor="pointer"
              fontSize={'1rem'}
              fontWeight={500}
              transition="background-color 0.2s"
              whileHover={{ backgroundColor: '#0056b3' }}
            >
              Attach Selected ({selectedPhotos.size})
            </Box>
          </Box>
        )}
      </Box>

      {/* Photos Grid */}
      <Box 
        display="grid"
        gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))"
        gap={20}
      >
        {displayedPhotos.map(photo => (
          <Box
            key={photo.id}
            border="1px solid #ddd"
            borderRadius={8}
            overflow="hidden"
            backgroundColor="white"
            boxShadow={selectedPhotos.has(photo.id) ? '0 0 0 3px #007bff' : '0 2px 4px rgba(0,0,0,0.1)'}
            transition="box-shadow 0.2s"
          >
            <Box 
              position="relative"
              paddingBottom="75%"
              backgroundColor="#f0f0f0"
              cursor={!photo.propertyId ? 'pointer' : 'default'}
              onClick={() => !photo.propertyId && togglePhotoSelection(photo.id)}
            >
              <Box
                as="img"
                src={resolvePhotoUrl(photo.url)}
                alt={photo.altText || 'Property photo'}
                position="absolute"
                top={0}
                left={0}
                width="100%"
                height="100%"
                objectFit="cover"
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                }}
              />
              
              {!photo.propertyId && selectedPhotos.has(photo.id) && (
                <Box 
                  position="absolute"
                  top={10}
                  right={10}
                  backgroundColor="#007bff"
                  color="white"
                  borderRadius="50%"
                  width={30}
                  height={30}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize={18}
                  fontWeight={700}
                >
                  ✓
                </Box>
              )}
            </Box>
            
            <Box padding={15}>
              {photo.propertyId && (
                <Box 
                  fontSize={'1rem'}
                  color="#666"
                  marginBottom={10}
                  fontWeight={600}
                >
                  Property: {getPropertyName(photo.propertyId)}
                </Box>
              )}
              
              {photo.description && (
                <Box 
                  fontSize={'1rem'}
                  color="#333"
                  marginBottom={10}
                >
                  {photo.description}
                </Box>
              )}
              
              {photo.tags && photo.tags.length > 0 && (
                <Box 
                  display="flex"
                  flexWrap="wrap"
                  gap={5}
                  marginBottom={10}
                >
                  {photo.tags.map((tag, idx) => (
                    <Box 
                      key={idx}
                      fontSize={'1rem'}
                      backgroundColor="#e0e0e0"
                      padding={4}
                      paddingLeft={8}
                      paddingRight={8}
                      borderRadius={12}
                    >
                      {tag}
                    </Box>
                  ))}
                </Box>
              )}
              
              <Box display="flex" gap={10}>
                {photo.propertyId && (
                  <Box
                    as="button"
                    onClick={() => handleDetachFromProperty(photo.id, photo.propertyId!)}
                    padding={5}
                    paddingLeft={10}
                    paddingRight={10}
                    backgroundColor="#ffc107"
                    color="#000"
                    border="none"
                    borderRadius={4}
                    cursor="pointer"
                    fontSize={'1rem'}
                    fontWeight={500}
                    transition="background-color 0.2s"
                    whileHover={{ backgroundColor: '#e0a800' }}
                  >
                    Detach
                  </Box>
                )}
                
                <Box
                  as="button"
                  onClick={() => handleDeletePhoto(photo.id)}
                  padding={5}
                  paddingLeft={10}
                  paddingRight={10}
                  backgroundColor="#dc3545"
                  color="white"
                  border="none"
                  borderRadius={4}
                  cursor="pointer"
                  fontSize={'1rem'}
                  fontWeight={500}
                  transition="background-color 0.2s"
                  whileHover={{ backgroundColor: '#c82333' }}
                >
                  Delete
                </Box>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      {displayedPhotos.length === 0 && (
        <Box 
          textAlign="center"
          padding={40}
          color="#666"
        >
          <Box fontSize={'1rem'}>
            No photos found. Upload some photos to get started!
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PhotoManagement;