import React from 'react';
import { Box } from '@/components/base/Box';
import { Button } from '@/components/base/Button';
import { 
  IoPerson,
  IoMail,
  IoCall,
  IoCalendar
} from 'react-icons/io5';

interface GuestInformationProps {
  booking: any;
  userRole: string;
}

const GuestInformation: React.FC<GuestInformationProps> = ({ booking, userRole: _userRole }) => {
  if (!booking.guest) return null;
  
  return (
    <Box
      backgroundColor="white"
      borderRadius="12px"
      padding="1.5rem"
      border="1px solid #e5e7eb"
    >
      <Box marginBottom="1.5rem">
        <Box fontSize="1.125rem" fontWeight="600" color="#111827">
          Guest Information
        </Box>
      </Box>
      
      <Box display="grid" gridTemplateColumns="1fr" gridTemplateColumnsMd="1fr 1fr" gap="1.5rem">
        {/* Basic Guest Details */}
        <Box>
          <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="1rem">
            <IoPerson color="#059669" size={16} />
            <Box fontSize="0.875rem" fontWeight="600" color="#374151">Contact Details</Box>
          </Box>
          
          <Box marginLeft="1.5rem" display="flex" flexDirection="column" gap="0.75rem">
            <Box>
              <Box fontSize="0.875rem" fontWeight="500" color="#111827">
                {booking.guest.name}
              </Box>
            </Box>
            
            <Box display="flex" alignItems="center" gap="0.5rem">
              <IoMail color="#6b7280" size={14} />
              <Box fontSize="0.875rem" color="#6b7280">
                {booking.guest.email}
              </Box>
            </Box>
            
            {booking.guest.phone && (
              <Box display="flex" alignItems="center" gap="0.5rem">
                <IoCall color="#6b7280" size={14} />
                <Box fontSize="0.875rem" color="#6b7280">
                  {booking.guest.phone}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
        
        {/* Guest Booking History */}
        <Box>
          <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="1rem">
            <IoCalendar color="#059669" size={16} />
            <Box fontSize="0.875rem" fontWeight="600" color="#374151">Booking History</Box>
          </Box>
          
          <Box marginLeft="1.5rem" display="flex" flexDirection="column" gap="0.75rem">
            <Box display="flex" justifyContent="space-between">
              <Box fontSize="0.875rem" color="#6b7280">Total Bookings:</Box>
              <Box fontSize="0.875rem" fontWeight="500" color="#111827">
                {booking.guest.totalBookings || 1}
              </Box>
            </Box>
            
            <Box display="flex" justifyContent="space-between">
              <Box fontSize="0.875rem" color="#6b7280">Member Since:</Box>
              <Box fontSize="0.875rem" fontWeight="500" color="#111827">
                {booking.guest.memberSince 
                  ? (() => {
                      const dateString = booking.guest.memberSince;
                      if (dateString.includes('T')) {
                        // Full datetime string
                        return new Date(dateString).toLocaleDateString('en-AE', {
                          month: 'short',
                          year: 'numeric'
                        });
                      } else {
                        // Date-only string - parse manually to avoid timezone shift
                        const [year, month] = dateString.split('-').map(Number);
                        const date = new Date(year, month - 1, 1);
                        return date.toLocaleDateString('en-AE', {
                          month: 'short',
                          year: 'numeric'
                        });
                      }
                    })()
                  : 'N/A'
                }
              </Box>
            </Box>
            
            <Box display="flex" justifyContent="space-between">
              <Box fontSize="0.875rem" color="#6b7280">Guest Rating:</Box>
              <Box fontSize="0.875rem" fontWeight="500" color="#111827">
                {booking.guest.rating 
                  ? `${booking.guest.rating}/5 ⭐` 
                  : 'No rating yet'
                }
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      
      {/* Guest Preferences/Notes */}
      {booking.guest.preferences && (
        <Box marginTop="1.5rem" padding="1rem" backgroundColor="#f9fafb" borderRadius="8px">
          <Box fontSize="0.875rem" fontWeight="600" color="#374151" marginBottom="0.5rem">
            Guest Preferences
          </Box>
          <Box fontSize="0.875rem" color="#6b7280">
            {booking.guest.preferences}
          </Box>
        </Box>
      )}
      
      {/* Guest Verification Status */}
      <Box marginTop="1.5rem" borderTop="1px solid #e5e7eb" paddingTop="1rem">
        <Box fontSize="0.875rem" fontWeight="600" color="#374151" marginBottom="0.75rem">
          Verification Status
        </Box>
        
        <Box display="flex" flexWrap="wrap" gap="0.75rem">
          <Box
            display="inline-flex"
            alignItems="center"
            gap="0.25rem"
            padding="0.25rem 0.5rem"
            backgroundColor={booking.guest.emailVerified ? '#dcfce7' : '#fee2e2'}
            color={booking.guest.emailVerified ? '#166534' : '#dc2626'}
            borderRadius="12px"
            fontSize="0.75rem"
            fontWeight="500"
          >
            <Box 
              width="6px" 
              height="6px" 
              backgroundColor="currentColor" 
              borderRadius="50%" 
            />
            Email {booking.guest.emailVerified ? 'Verified' : 'Unverified'}
          </Box>
          
          <Box
            display="inline-flex"
            alignItems="center"
            gap="0.25rem"
            padding="0.25rem 0.5rem"
            backgroundColor={booking.guest.phoneVerified ? '#dcfce7' : '#fee2e2'}
            color={booking.guest.phoneVerified ? '#166534' : '#dc2626'}
            borderRadius="12px"
            fontSize="0.75rem"
            fontWeight="500"
          >
            <Box 
              width="6px" 
              height="6px" 
              backgroundColor="currentColor" 
              borderRadius="50%" 
            />
            Phone {booking.guest.phoneVerified ? 'Verified' : 'Unverified'}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default GuestInformation;