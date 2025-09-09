import React from 'react';
import { Box } from '@/components/base/Box';
import { 
  IoCalendar,
  IoTime,
  IoPeople,
  IoCash,
  IoCard,
  IoPricetag,
  IoInformationCircle
} from 'react-icons/io5';

interface BookingOverviewProps {
  booking: any;
  userRole: string;
}

const BookingOverview: React.FC<BookingOverviewProps> = ({ booking, userRole: _userRole }) => {
  const getDurationText = () => {
    if (booking.checkInDate === booking.checkOutDate) {
      return 'Half Day';
    }
    
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-AE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <Box
      backgroundColor="white"
      borderRadius="12px"
      padding="1.5rem"
      border="1px solid #e5e7eb"
    >
      <Box fontSize="1.125rem" fontWeight="600" marginBottom="1.5rem" color="#111827">
        Booking Overview
      </Box>
      
      {/* Date and Duration Information */}
      <Box display="grid" gridTemplateColumns="1fr" gridTemplateColumnsMd="1fr 1fr" gap="1.5rem" marginBottom="1.5rem">
        <Box>
          <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.75rem">
            <IoCalendar color="#059669" size={16} />
            <Box fontSize="0.875rem" fontWeight="600" color="#374151">Check-in</Box>
          </Box>
          <Box marginLeft="1.5rem">
            <Box fontSize="0.875rem" color="#111827" marginBottom="0.25rem">
              {formatDate(booking.checkInDate)}
            </Box>
            <Box fontSize="0.75rem" color="#6b7280">
              {formatTime(booking.checkInDate)}
            </Box>
          </Box>
        </Box>
        
        <Box>
          <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.75rem">
            <IoCalendar color="#059669" size={16} />
            <Box fontSize="0.875rem" fontWeight="600" color="#374151">Check-out</Box>
          </Box>
          <Box marginLeft="1.5rem">
            <Box fontSize="0.875rem" color="#111827" marginBottom="0.25rem">
              {formatDate(booking.checkOutDate)}
            </Box>
            <Box fontSize="0.75rem" color="#6b7280">
              {formatTime(booking.checkOutDate)}
            </Box>
          </Box>
        </Box>
      </Box>
      
      {/* Additional Booking Details */}
      <Box display="grid" gridTemplateColumns="1fr" gridTemplateColumnsSm="1fr 1fr" gridTemplateColumnsMd="repeat(3, 1fr)" gap="1.5rem" marginBottom="1.5rem">
        <Box>
          <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
            <IoTime color="#059669" size={16} />
            <Box fontSize="0.875rem" fontWeight="600" color="#374151">Duration</Box>
          </Box>
          <Box fontSize="0.875rem" color="#111827" marginLeft="1.5rem">
            {getDurationText()}
          </Box>
        </Box>
        
        <Box>
          <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
            <IoPeople color="#059669" size={16} />
            <Box fontSize="0.875rem" fontWeight="600" color="#374151">Guests</Box>
          </Box>
          <Box fontSize="0.875rem" color="#111827" marginLeft="1.5rem">
            {booking.numGuests || 1} guest{(booking.numGuests || 1) > 1 ? 's' : ''}
          </Box>
        </Box>
        
        <Box>
          <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
            <IoCash color="#059669" size={16} />
            <Box fontSize="0.875rem" fontWeight="600" color="#374151">Total Amount</Box>
          </Box>
          <Box fontSize="1rem" fontWeight="bold" color="#059669" marginLeft="1.5rem">
            AED {Math.round(booking.totalPrice || 0)}
          </Box>
        </Box>
      </Box>
      
      {/* Payment and Rate Plan Information */}
      <Box display="grid" gridTemplateColumns="1fr" gridTemplateColumnsSm="1fr 1fr" gap="1.5rem" marginBottom="1.5rem">
        <Box>
          <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
            <IoCard color="#059669" size={16} />
            <Box fontSize="0.875rem" fontWeight="600" color="#374151">Payment Status</Box>
          </Box>
          <Box marginLeft="1.5rem">
            <Box 
              fontSize="0.875rem" 
              fontWeight="600"
              color={booking.paymentStatus?.toLowerCase() === 'paid' ? '#059669' : '#dc2626'}
              display="inline-block"
              backgroundColor={booking.paymentStatus?.toLowerCase() === 'paid' ? '#dcfce7' : '#fee2e2'}
              padding="0.25rem 0.5rem"
              borderRadius="4px"
            >
              {booking.paymentStatus || 'Pending'}
            </Box>
          </Box>
        </Box>
        
        {booking.ratePlanName && (
          <Box>
            <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
              <IoPricetag color="#059669" size={16} />
              <Box fontSize="0.875rem" fontWeight="600" color="#374151">Rate Plan</Box>
            </Box>
            <Box fontSize="0.875rem" color="#111827" marginLeft="1.5rem">
              {booking.ratePlanName}
            </Box>
          </Box>
        )}
      </Box>
      
      {/* Booking Timeline */}
      <Box borderTop="1px solid #e5e7eb" paddingTop="1.5rem">
        <Box fontSize="0.875rem" fontWeight="600" color="#374151" marginBottom="1rem">
          Booking Timeline
        </Box>
        
        <Box display="flex" flexDirection="column" gap="0.75rem">
          <Box display="flex" alignItems="center" gap="0.75rem">
            <Box 
              width="8px" 
              height="8px" 
              backgroundColor="#059669" 
              borderRadius="50%" 
            />
            <Box fontSize="0.75rem" color="#6b7280">
              Booking created on {new Date(booking.createdAt).toLocaleDateString('en-AE', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Box>
          </Box>
          
          {booking.updatedAt !== booking.createdAt && (
            <Box display="flex" alignItems="center" gap="0.75rem">
              <Box 
                width="8px" 
                height="8px" 
                backgroundColor="#3b82f6" 
                borderRadius="50%" 
              />
              <Box fontSize="0.75rem" color="#6b7280">
                Last updated on {new Date(booking.updatedAt).toLocaleDateString('en-AE', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Box>
            </Box>
          )}
          
          {booking.status?.toLowerCase() === 'confirmed' && (
            <Box display="flex" alignItems="center" gap="0.75rem">
              <Box 
                width="8px" 
                height="8px" 
                backgroundColor="#059669" 
                borderRadius="50%" 
              />
              <Box fontSize="0.75rem" color="#6b7280">
                Booking confirmed
              </Box>
            </Box>
          )}
        </Box>
      </Box>
      
      {/* Additional Information Alert */}
      {booking.specialRequests && (
        <Box
          marginTop="1.5rem"
          padding="1rem"
          backgroundColor="#eff6ff"
          borderRadius="8px"
          border="1px solid #bfdbfe"
        >
          <Box display="flex" alignItems="flex-start" gap="0.75rem">
            <IoInformationCircle color="#3b82f6" size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
            <Box>
              <Box fontSize="0.875rem" fontWeight="600" color="#1e40af" marginBottom="0.5rem">
                Special Requests
              </Box>
              <Box fontSize="0.875rem" color="#1e40af">
                {booking.specialRequests}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default BookingOverview;