import React from 'react';
import { Box } from '@/components/base/Box';
import { Button } from '@/components/base/Button';
import { 
  IoArrowBack, 
  IoCalendar, 
  IoCheckmarkCircle, 
  IoTime, 
  IoCloseCircle,
  IoWarning
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
          {/* Property Information */}
          <Box flex="1">
            <Box fontSize="1.25rem" fontWeight="600" marginBottom="0.5rem" color="#111827">
              {booking.propertyName || 'Property Name'}
            </Box>
            <Box fontSize="0.875rem" color="#6b7280" marginBottom="1rem">
              {booking.propertyLocation || 'Location'}
            </Box>
            
            {/* Quick Info Row */}
            <Box display="flex" alignItems="center" gap="2rem" flexWrap="wrap">
              <Box display="flex" alignItems="center" gap="0.5rem">
                <IoCalendar color="#059669" size={16} />
                <Box fontSize="0.875rem" color="#374151">
                  {booking.checkInDate === booking.checkOutDate 
                    ? `Half day on ${booking.checkInDate}`
                    : `${booking.checkInDate} - ${booking.checkOutDate}`}
                </Box>
              </Box>
              
              <Box fontSize="0.875rem" color="#374151">
                <span style={{ fontWeight: '600' }}>{booking.numGuests || 1}</span> guest{(booking.numGuests || 1) > 1 ? 's' : ''}
              </Box>
              
              <Box fontSize="1rem" fontWeight="600" color="#059669">
                AED {Math.round(booking.totalPrice || 0)}
              </Box>
            </Box>
            
            {/* Guest Info for HomeOwner/Manager */}
            {(userRole === 'HomeOwner' || userRole === 'Manager') && booking.guest && (
              <Box marginTop="1rem" padding="1rem" backgroundColor="#f9fafb" borderRadius="8px">
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
              {new Date(booking.createdAt || Date.now()).toLocaleDateString('en-AE', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
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