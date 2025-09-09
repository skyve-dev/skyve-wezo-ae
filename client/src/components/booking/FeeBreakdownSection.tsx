import React from 'react';
import { Box } from '@/components/base/Box';
import { 
  IoCash,
  IoReceipt,
  IoTrendingUp,
  IoInformationCircle
} from 'react-icons/io5';

interface FeeBreakdownSectionProps {
  booking: any;
  feeBreakdown: any;
  userRole: string;
}

const FeeBreakdownSection: React.FC<FeeBreakdownSectionProps> = ({ 
  booking, 
  feeBreakdown, 
  userRole 
}) => {
  // Default breakdown if not provided
  const breakdown = feeBreakdown || {
    subtotal: booking.totalPrice * 0.85,
    serviceFee: booking.totalPrice * 0.1,
    taxes: booking.totalPrice * 0.05,
    total: booking.totalPrice,
    commission: userRole === 'Manager' ? booking.totalPrice * 0.15 : undefined,
    homeownerPayout: userRole !== 'Tenant' ? booking.totalPrice * 0.85 : undefined
  };
  
  return (
    <Box
      backgroundColor="white"
      borderRadius="12px"
      padding="1.5rem"
      border="1px solid #e5e7eb"
    >
      <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="1.5rem">
        <IoReceipt color="#059669" size={16} />
        <Box fontSize="1.125rem" fontWeight="600" color="#111827">
          Fee Breakdown
        </Box>
      </Box>
      
      {/* Main Breakdown */}
      <Box marginBottom="1.5rem">
        <Box display="flex" flexDirection="column" gap="0.75rem">
          <Box display="flex" justifyContent="space-between">
            <Box fontSize="0.875rem" color="#374151">Subtotal</Box>
            <Box fontSize="0.875rem" fontWeight="500" color="#111827">
              AED {Math.round(breakdown.subtotal)}
            </Box>
          </Box>
          
          <Box display="flex" justifyContent="space-between">
            <Box fontSize="0.875rem" color="#374151">Service Fee</Box>
            <Box fontSize="0.875rem" fontWeight="500" color="#111827">
              AED {Math.round(breakdown.serviceFee)}
            </Box>
          </Box>
          
          <Box display="flex" justifyContent="space-between">
            <Box fontSize="0.875rem" color="#374151">Taxes & Fees</Box>
            <Box fontSize="0.875rem" fontWeight="500" color="#111827">
              AED {Math.round(breakdown.taxes)}
            </Box>
          </Box>
          
          <Box borderTop="1px solid #e5e7eb" paddingTop="0.75rem">
            <Box display="flex" justifyContent="space-between">
              <Box fontSize="1rem" fontWeight="600" color="#111827">Total Amount</Box>
              <Box fontSize="1rem" fontWeight="600" color="#059669">
                AED {Math.round(breakdown.total)}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      
      {/* Commission and Payout Info - Non-Tenant Roles */}
      {userRole !== 'Tenant' && (
        <Box borderTop="1px solid #e5e7eb" paddingTop="1.5rem" marginBottom="1.5rem">
          <Box fontSize="0.875rem" fontWeight="600" color="#374151" marginBottom="1rem">
            Revenue Split
          </Box>
          
          <Box display="flex" flexDirection="column" gap="0.75rem">
            {breakdown.commission !== undefined && (
              <Box display="flex" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap="0.5rem">
                  <IoTrendingUp color="#6b7280" size={12} />
                  <Box fontSize="0.875rem" color="#374151">Platform Commission (15%)</Box>
                </Box>
                <Box fontSize="0.875rem" fontWeight="500" color="#dc2626">
                  -AED {Math.round(breakdown.commission)}
                </Box>
              </Box>
            )}
            
            {breakdown.homeownerPayout !== undefined && (
              <Box display="flex" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap="0.5rem">
                  <IoCash color="#6b7280" size={12} />
                  <Box fontSize="0.875rem" color="#374151">Host Payout</Box>
                </Box>
                <Box fontSize="0.875rem" fontWeight="600" color="#059669">
                  AED {Math.round(breakdown.homeownerPayout)}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      )}
      
      {/* Payment Status */}
      <Box 
        padding="1rem" 
        backgroundColor={booking.paymentStatus?.toLowerCase() === 'paid' ? '#dcfce7' : '#fef3c7'} 
        borderRadius="8px"
      >
        <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
          <IoInformationCircle 
            color={booking.paymentStatus?.toLowerCase() === 'paid' ? '#166534' : '#92400e'} 
            size={14} 
          />
          <Box 
            fontSize="0.875rem" 
            fontWeight="600" 
            color={booking.paymentStatus?.toLowerCase() === 'paid' ? '#166534' : '#92400e'}
          >
            Payment Status
          </Box>
        </Box>
        
        <Box 
          fontSize="0.875rem" 
          color={booking.paymentStatus?.toLowerCase() === 'paid' ? '#166534' : '#92400e'}
        >
          {booking.paymentStatus?.toLowerCase() === 'paid' 
            ? 'Payment has been processed successfully.'
            : 'Payment is pending. Funds will be released after check-in.'
          }
        </Box>
        
        {booking.paymentStatus?.toLowerCase() === 'paid' && userRole !== 'Tenant' && (
          <Box fontSize="0.75rem" color="#6b7280" marginTop="0.5rem">
            Host payout will be processed within 24-48 hours after guest check-out.
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default FeeBreakdownSection;