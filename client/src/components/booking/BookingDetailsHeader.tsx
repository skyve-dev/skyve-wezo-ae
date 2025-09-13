import React from 'react';
import { Box } from '@/components/base/Box';
import { Button } from '@/components/base/Button';
import { resolvePhotoUrl } from '@/utils/api';
import { 
  IoArrowBack, 
  IoCalendar, 
  IoCheckmarkCircle, 
  IoTime, 
  IoCloseCircle,
  IoWarning,
  IoBed,
  IoWater,
  IoPeople,
  IoLocation,
  IoHome,
  IoWifi,
  IoCar,
  IoCall,
  IoMail,
  IoKey
} from 'react-icons/io5';

interface BookingDetailsHeaderProps {
  booking: any;
  userRole: string;
  onBack: () => void;
}

const BookingDetailsHeader: React.FC<BookingDetailsHeaderProps> = ({ 
  booking, 
  userRole, 
  onBack 
}) => {
  // Helper function to format dates safely
  const formatDate = (dateString: string, options: Intl.DateTimeFormatOptions = {}) => {
    if (!dateString) return 'N/A';
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    // Handle both date-only strings and full datetime strings
    if (dateString.includes('T')) {
      // Full datetime string - safe to use Date constructor
      return new Date(dateString).toLocaleDateString('en-AE', { ...defaultOptions, ...options });
    } else {
      // Date-only string - parse manually to avoid timezone shift
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-AE', { ...defaultOptions, ...options });
    }
  };
  
  // Helper function to get amenity icons
  const getAmenityIcon = (amenityName: string) => {
    const name = amenityName.toLowerCase();
    if (name.includes('wifi') || name.includes('internet')) return <IoWifi size={14} color="#059669" />;
    if (name.includes('parking')) return <IoCar size={14} color="#059669" />;
    if (name.includes('pool')) return <IoWater size={14} color="#059669" />;
    return <IoHome size={14} color="#059669" />;
  };
  
  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return { 
          color: '#166534', 
          bg: '#dcfce7', 
          icon: <IoCheckmarkCircle size={20} /> 
        };
      case 'pending':
        return { 
          color: '#92400e', 
          bg: '#fef3c7', 
          icon: <IoTime size={20} /> 
        };
      case 'cancelled':
        return { 
          color: '#dc2626', 
          bg: '#fee2e2', 
          icon: <IoCloseCircle size={20} /> 
        };
      case 'completed':
        return { 
          color: '#3730a3', 
          bg: '#e0e7ff', 
          icon: <IoCheckmarkCircle size={20} /> 
        };
      case 'no-show':
        return { 
          color: '#dc2626', 
          bg: '#fee2e2', 
          icon: <IoWarning size={20} /> 
        };
      default:
        return { 
          color: '#374151', 
          bg: '#f3f4f6', 
          icon: <IoTime size={20} /> 
        };
    }
  };
  
  const statusConfig = getStatusConfig(booking.status);
  
  const getPageTitle = () => {
    switch (userRole) {
      case 'Tenant':
        return 'Booking Details';
      case 'HomeOwner':
        return 'Reservation Details';
      case 'Manager':
        return 'Reservation Management';
      default:
        return 'Booking Details';
    }
  };
  
  return (
    <Box marginBottom="2rem">
      {/* Navigation and Title */}
      <Box display="flex" alignItems="center" gap="1rem" marginBottom="1.5rem">
        <Button
          label=""
          icon={<IoArrowBack />}
          onClick={onBack}
          variant="normal"
          size="small"
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #d1d5db',
            color: '#374151'
          }}
          title="Back"
        />
        
        <Box>
          <h1 style={{ 
            fontSize: '1.75rem', 
            fontWeight: '600', 
            margin: 0, 
            color: '#111827' 
          }}>
            {getPageTitle()}
          </h1>
          <Box fontSize="0.875rem" color="#6b7280" marginTop="0.25rem">
            Booking ID: {booking.id}
          </Box>
        </Box>
      </Box>
      
      {/* Status and Overview Card */}
      <Box
        backgroundColor="white"
        borderRadius="12px"
        padding="1.5rem"
        border="1px solid #e5e7eb"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexDirection="column" flexDirectionMd="row" gap="1rem">
          {/* Enhanced Property Information */}
          <Box flex="1">
            {/* Property Photos */}
            {booking.property?.photos && booking.property.photos.length > 0 && (
              <Box display="flex" gap="0.5rem" marginBottom="1rem" height="80px">
                <Box
                  width="120px"
                  height="80px"
                  backgroundImage={`url(${resolvePhotoUrl(booking.property.photos[0]?.url || booking.property.photos[0])})`}
                  backgroundSize="cover"
                  backgroundPosition="center"
                  borderRadius="8px"
                />
                {booking.property.photos[1] && (
                  <Box
                    width="80px"
                    height="80px"
                    backgroundImage={`url(${resolvePhotoUrl(booking.property.photos[1]?.url || booking.property.photos[1])})`}
                    backgroundSize="cover"
                    backgroundPosition="center"
                    borderRadius="8px"
                  />
                )}
                {booking.property.photos[2] && (
                  <Box
                    width="80px"
                    height="80px"
                    backgroundImage={`url(${resolvePhotoUrl(booking.property.photos[2]?.url || booking.property.photos[2])})`}
                    backgroundSize="cover"
                    backgroundPosition="center"
                    borderRadius="8px"
                    position="relative"
                  >
                    {booking.property.photos.length > 3 && (
                      <Box
                        position="absolute"
                        bottom="0"
                        right="0"
                        backgroundColor="rgba(0,0,0,0.7)"
                        color="white"
                        padding="0.125rem 0.25rem"
                        fontSize="0.625rem"
                        borderRadius="4px"
                        margin="0.25rem"
                      >
                        +{booking.property.photos.length - 3}
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            )}

            {/* Property Name & Type */}
            <Box marginBottom="0.75rem">
              <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.25rem">
                <Box fontSize="1.25rem" fontWeight="600" color="#111827">
                  {booking.propertyName || booking.property?.name || 'Property Name'}
                </Box>
                {booking.property?.type && (
                  <Box
                    fontSize="0.75rem"
                    fontWeight="500"
                    color="#059669"
                    backgroundColor="#dcfce7"
                    padding="0.125rem 0.5rem"
                    borderRadius="12px"
                  >
                    {booking.property.type}
                  </Box>
                )}
              </Box>

              {/* Property Details Row */}
              <Box display="flex" alignItems="center" gap="1rem" flexWrap="wrap" fontSize="0.875rem" color="#6b7280">
                {booking.property?.bedrooms && (
                  <Box display="flex" alignItems="center" gap="0.25rem">
                    <IoBed size={14} />
                    {booking.property.bedrooms} bed{booking.property.bedrooms > 1 ? 's' : ''}
                  </Box>
                )}
                {booking.property?.bathrooms && (
                  <Box display="flex" alignItems="center" gap="0.25rem">
                    <IoWater size={14} />
                    {booking.property.bathrooms} bath{booking.property.bathrooms > 1 ? 's' : ''}
                  </Box>
                )}
                {booking.property?.maxGuests && (
                  <Box display="flex" alignItems="center" gap="0.25rem">
                    <IoPeople size={14} />
                    Up to {booking.property.maxGuests} guests
                  </Box>
                )}
                {booking.property?.area && (
                  <Box display="flex" alignItems="center" gap="0.25rem">
                    <IoHome size={14} />
                    {booking.property.area} sq ft
                  </Box>
                )}
              </Box>
            </Box>

            {/* Location Information */}
            <Box marginBottom="1rem">
              <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.25rem">
                <IoLocation color="#059669" size={14} />
                <Box fontSize="0.875rem" fontWeight="500" color="#374151">
                  {booking.property?.address ? 
                    `${booking.property.address.street}, ${booking.property.address.city}, ${booking.property.address.emirate}` :
                    (booking.propertyLocation || 'Location')
                  }
                </Box>
              </Box>
            </Box>

            {/* Key Amenities */}
            {booking.property?.amenities && booking.property.amenities.length > 0 && (
              <Box marginBottom="1rem">
                <Box display="flex" alignItems="center" gap="0.5rem" flexWrap="wrap">
                  {booking.property.amenities.slice(0, 4).map((amenity: any, index: number) => (
                    <Box key={index} display="flex" alignItems="center" gap="0.25rem" fontSize="0.75rem" color="#6b7280">
                      {getAmenityIcon(amenity?.name || amenity)}
                      {amenity?.name || amenity}
                    </Box>
                  ))}
                  {booking.property.amenities.length > 4 && (
                    <Box fontSize="0.75rem" color="#6b7280">
                      +{booking.property.amenities.length - 4} more
                    </Box>
                  )}
                </Box>
              </Box>
            )}
            
            {/* Booking Quick Info Row */}
            <Box display="flex" alignItems="center" gap="2rem" flexWrap="wrap" marginBottom="1rem">
              <Box display="flex" alignItems="center" gap="0.5rem">
                <IoCalendar color="#059669" size={16} />
                <Box fontSize="0.875rem" color="#374151">
                  {booking.checkInDate === booking.checkOutDate 
                    ? `Half day on ${formatDate(booking.checkInDate)}`
                    : `${formatDate(booking.checkInDate)} - ${formatDate(booking.checkOutDate)}`}
                </Box>
              </Box>
              
              <Box display="flex" alignItems="center" gap="0.5rem" fontSize="0.875rem" color="#374151">
                <IoPeople color="#059669" size={14} />
                <span style={{ fontWeight: '600' }}>{booking.numGuests || 1}</span> guest{(booking.numGuests || 1) > 1 ? 's' : ''}
              </Box>
              
              <Box fontSize="1rem" fontWeight="600" color="#059669">
                AED {Math.round(booking.totalPrice || 0)}
              </Box>
            </Box>

            {/* Host Contact Information */}
            {booking.property?.owner && (
              <Box padding="1rem" backgroundColor="#f0f9ff" borderRadius="8px" marginBottom="1rem">
                <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
                  <IoKey color="#3b82f6" size={14} />
                  <Box fontSize="0.875rem" fontWeight="600" color="#1e40af">
                    Host Contact
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap="1rem" flexWrap="wrap">
                  <Box display="flex" alignItems="center" gap="0.5rem" fontSize="0.75rem" color="#1e3a8a">
                    <IoMail size={12} />
                    {booking.property.owner.email}
                  </Box>
                  {booking.property.owner.phone && (
                    <Box display="flex" alignItems="center" gap="0.5rem" fontSize="0.75rem" color="#1e3a8a">
                      <IoCall size={12} />
                      {booking.property.owner.phone}
                    </Box>
                  )}
                </Box>
              </Box>
            )}
            
            {/* Guest Info for HomeOwner/Manager */}
            {(userRole === 'HomeOwner' || userRole === 'Manager') && booking.guest && (
              <Box padding="1rem" backgroundColor="#f9fafb" borderRadius="8px">
                <Box fontSize="0.875rem" fontWeight="600" color="#374151" marginBottom="0.25rem">
                  Guest Information
                </Box>
                <Box fontSize="0.875rem" color="#6b7280">
                  {booking.guest.name} • {booking.guest.email}
                </Box>
              </Box>
            )}
          </Box>
          
          {/* Status Badge */}
          <Box
            backgroundColor={statusConfig.bg}
            color={statusConfig.color}
            padding="0.75rem 1rem"
            borderRadius="8px"
            display="flex"
            alignItems="center"
            gap="0.5rem"
            fontWeight="600"
            fontSize="0.875rem"
            textTransform="capitalize"
            minWidth="140px"
            justifyContent="center"
          >
            {statusConfig.icon}
            {booking.status || 'Confirmed'}
          </Box>
        </Box>
        
        {/* Special Requests */}
        {booking.specialRequests && (
          <Box marginTop="1rem" padding="1rem" backgroundColor="#fef3c7" borderRadius="8px">
            <Box fontSize="0.875rem" fontWeight="600" color="#92400e" marginBottom="0.5rem">
              Special Requests
            </Box>
            <Box fontSize="0.875rem" color="#92400e">
              {booking.specialRequests}
            </Box>
          </Box>
        )}
        
        {/* Payment Status */}
        <Box marginTop="1rem" display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap="1rem">
          <Box>
            <Box fontSize="0.75rem" color="#6b7280" textTransform="uppercase" marginBottom="0.25rem">
              Payment Status
            </Box>
            <Box 
              fontSize="0.875rem" 
              fontWeight="600"
              color={booking.paymentStatus?.toLowerCase() === 'paid' ? '#059669' : '#dc2626'}
            >
              {booking.paymentStatus || 'Pending'}
            </Box>
          </Box>
          
          <Box>
            <Box fontSize="0.75rem" color="#6b7280" textTransform="uppercase" marginBottom="0.25rem">
              Booked On
            </Box>
            <Box fontSize="0.875rem" color="#374151">
              {formatDate(booking.createdAt || new Date().toISOString())}
            </Box>
          </Box>
          
          {booking.ratePlanName && (
            <Box>
              <Box fontSize="0.75rem" color="#6b7280" textTransform="uppercase" marginBottom="0.25rem">
                Rate Plan
              </Box>
              <Box fontSize="0.875rem" color="#374151">
                {booking.ratePlanName}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default BookingDetailsHeader;