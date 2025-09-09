import React from 'react';
import { Box } from '@/components/base/Box';
import { Button } from '@/components/base/Button';
import { 
  IoBusiness,
  IoLocation,
  IoBed,
  IoWater,
  IoPeople,
  IoOpenOutline,
  IoWifi,
  IoCar,
  IoWater as IoPool,
  IoCarSport
} from 'react-icons/io5';
import { useAppShell } from '@/components/base/AppShell';

interface PropertyInformationProps {
  booking: any;
  userRole: string;
}

const PropertyInformation: React.FC<PropertyInformationProps> = ({ booking, userRole }) => {
  const { navigateTo } = useAppShell();
  
  const property = booking.property || {};
  
  const handleViewProperty = () => {
    navigateTo('property-view', { id: booking.propertyId });
  };
  
  const getAmenityIcon = (amenityName: string | undefined) => {
    if (!amenityName || typeof amenityName !== 'string') return null;
    switch (amenityName.toLowerCase()) {
      case 'wifi':
      case 'internet':
        return <IoWifi size={14} />;
      case 'parking':
        return <IoCar size={14} />;
      case 'pool':
      case 'swimming pool':
        return <IoPool size={14} />;
      case 'transport':
      case 'car':
        return <IoCarSport size={14} />;
      default:
        return null;
    }
  };
  
  return (
    <Box
      backgroundColor="white"
      borderRadius="12px"
      padding="1.5rem"
      border="1px solid #e5e7eb"
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="1.5rem">
        <Box fontSize="1.125rem" fontWeight="600" color="#111827">
          Property Information
        </Box>
        <Button
          label="View Property"
          icon={<IoOpenOutline />}
          onClick={handleViewProperty}
          variant="normal"
          size="small"
        />
      </Box>
      
      {/* Property Photos */}
      {property.photos && property.photos.length > 0 && (
        <Box marginBottom="1.5rem">
          <Box 
            display="grid" 
            gridTemplateColumns="2fr 1fr 1fr" 
            gap="0.5rem" 
            height="200px"
            borderRadius="8px"
            overflow="hidden"
          >
            <Box
              backgroundImage={`url(${property.photos[0]?.url || property.photos[0]})`}
              backgroundSize="cover"
              backgroundPosition="center"
              borderRadius="8px"
            />
            {property.photos[1] && (
              <Box
                backgroundImage={`url(${property.photos[1]?.url || property.photos[1]})`}
                backgroundSize="cover"
                backgroundPosition="center"
                borderRadius="8px"
              />
            )}
            {property.photos[2] && (
              <Box
                backgroundImage={`url(${property.photos[2]?.url || property.photos[2]})`}
                backgroundSize="cover"
                backgroundPosition="center"
                borderRadius="8px"
                position="relative"
              >
                {property.photos.length > 3 && (
                  <Box
                    position="absolute"
                    bottom="0"
                    right="0"
                    backgroundColor="rgba(0,0,0,0.7)"
                    color="white"
                    padding="0.25rem 0.5rem"
                    fontSize="0.75rem"
                    borderRadius="4px"
                    margin="0.5rem"
                  >
                    +{property.photos.length - 3} more
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
      )}
      
      {/* Property Details */}
      <Box display="grid" gridTemplateColumns="1fr" gridTemplateColumnsMd="1fr 1fr" gap="1.5rem" marginBottom="1.5rem">
        {/* Basic Information */}
        <Box>
          <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="1rem">
            <IoBusiness color="#059669" size={16} />
            <Box fontSize="0.875rem" fontWeight="600" color="#374151">Property Details</Box>
          </Box>
          
          <Box marginLeft="1.5rem" display="flex" flexDirection="column" gap="0.75rem">
            <Box>
              <Box fontSize="1rem" fontWeight="600" color="#111827" marginBottom="0.25rem">
                {property.name || booking.propertyName}
              </Box>
              <Box display="flex" alignItems="center" gap="0.5rem" color="#6b7280">
                <IoLocation size={12} />
                <Box fontSize="0.875rem">
                  {property.address?.city || booking.propertyLocation}
                </Box>
              </Box>
            </Box>
            
            {property.address && (
              <Box>
                <Box fontSize="0.875rem" color="#6b7280">
                  {property.address.street}<br />
                  {property.address.city}, {property.address.emirate}<br />
                  {property.address.country}
                </Box>
              </Box>
            )}
            
            {property.type && (
              <Box>
                <Box fontSize="0.875rem" color="#6b7280">
                  Property Type: <span style={{ fontWeight: '500', color: '#111827' }}>{property.type}</span>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
        
        {/* Property Specifications */}
        <Box>
          <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="1rem">
            <IoBed color="#059669" size={16} />
            <Box fontSize="0.875rem" fontWeight="600" color="#374151">Specifications</Box>
          </Box>
          
          <Box marginLeft="1.5rem" display="grid" gridTemplateColumns="1fr 1fr" gap="0.75rem">
            {property.bedrooms && (
              <Box display="flex" alignItems="center" gap="0.5rem">
                <IoBed color="#6b7280" size={14} />
                <Box fontSize="0.875rem" color="#111827">
                  {property.bedrooms} bed{property.bedrooms > 1 ? 's' : ''}
                </Box>
              </Box>
            )}
            
            {property.bathrooms && (
              <Box display="flex" alignItems="center" gap="0.5rem">
                <IoWater color="#6b7280" size={14} />
                <Box fontSize="0.875rem" color="#111827">
                  {property.bathrooms} bath{property.bathrooms > 1 ? 's' : ''}
                </Box>
              </Box>
            )}
            
            {property.maxGuests && (
              <Box display="flex" alignItems="center" gap="0.5rem">
                <IoPeople color="#6b7280" size={14} />
                <Box fontSize="0.875rem" color="#111827">
                  {property.maxGuests} guests max
                </Box>
              </Box>
            )}
            
            {property.area && (
              <Box fontSize="0.875rem" color="#111827">
                {property.area} sq ft
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      
      {/* Amenities */}
      {property.amenities && property.amenities.length > 0 && (
        <Box marginBottom="1.5rem">
          <Box fontSize="0.875rem" fontWeight="600" color="#374151" marginBottom="0.75rem">
            Amenities
          </Box>
          <Box display="flex" flexWrap="wrap" gap="0.5rem">
            {property.amenities.slice(0, 8).map((amenity: any, index: number) => (
              <Box
                key={index}
                display="flex"
                alignItems="center"
                gap="0.25rem"
                padding="0.375rem 0.75rem"
                backgroundColor="#f3f4f6"
                borderRadius="6px"
                fontSize="0.75rem"
                color="#374151"
              >
                {getAmenityIcon(amenity?.name || amenity)}
                {amenity?.name || amenity}
              </Box>
            ))}
            {property.amenities.length > 8 && (
              <Box
                padding="0.375rem 0.75rem"
                backgroundColor="#e5e7eb"
                borderRadius="6px"
                fontSize="0.75rem"
                color="#6b7280"
              >
                +{property.amenities.length - 8} more
              </Box>
            )}
          </Box>
        </Box>
      )}
      
      {/* Property Owner Information - Manager View Only */}
      {userRole === 'Manager' && property.owner && (
        <Box borderTop="1px solid #e5e7eb" paddingTop="1.5rem">
          <Box fontSize="0.875rem" fontWeight="600" color="#374151" marginBottom="0.75rem">
            Property Owner
          </Box>
          
          <Box display="flex" alignItems="center" gap="1rem">
            <Box
              width="40px"
              height="40px"
              borderRadius="50%"
              backgroundColor="#f3f4f6"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="1rem"
              fontWeight="600"
              color="#6b7280"
            >
              {property.owner.name?.charAt(0) || 'O'}
            </Box>
            
            <Box>
              <Box fontSize="0.875rem" fontWeight="500" color="#111827">
                {property.owner.name}
              </Box>
              <Box fontSize="0.75rem" color="#6b7280">
                {property.owner.email}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
      
      {/* Property Description */}
      {property.description && (
        <Box marginTop="1.5rem" padding="1rem" backgroundColor="#f9fafb" borderRadius="8px">
          <Box fontSize="0.875rem" fontWeight="600" color="#374151" marginBottom="0.5rem">
            About This Property
          </Box>
          <Box fontSize="0.875rem" color="#6b7280" lineHeight="1.5">
            {property.description}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PropertyInformation;