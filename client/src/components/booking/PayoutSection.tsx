import React from 'react';
import { Box } from '@/components/base/Box';
import { Button } from '@/components/base/Button';
import { 
  IoCash,
  IoTime,
  IoCheckmarkCircle,
  IoWarning,
  IoAdd
} from 'react-icons/io5';

interface PayoutSectionProps {
  booking: any;
  userRole: string;
}

const PayoutSection: React.FC<PayoutSectionProps> = ({ booking, userRole: _userRole }) => {
  // Mock payout data - in real implementation this would come from the booking details
  const payout = booking.payout || null;
  const canCreatePayout = booking.status?.toLowerCase() === 'completed' && booking.paymentStatus?.toLowerCase() === 'paid' && !payout;
  
  const handleCreatePayout = () => {
    // TODO: Implement payout creation
    console.log('Create payout for booking:', booking.id);
  };
  
  const getPayoutStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { color: '#166534', bg: '#dcfce7', icon: <IoCheckmarkCircle size={16} /> };
      case 'processing':
        return { color: '#92400e', bg: '#fef3c7', icon: <IoTime size={16} /> };
      case 'failed':
        return { color: '#dc2626', bg: '#fee2e2', icon: <IoWarning size={16} /> };
      case 'pending':
      default:
        return { color: '#6b7280', bg: '#f3f4f6', icon: <IoTime size={16} /> };
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
        <Box display="flex" alignItems="center" gap="0.5rem">
          <IoCash color="#059669" size={16} />
          <Box fontSize="1.125rem" fontWeight="600" color="#111827">
            Payout Management
          </Box>
        </Box>
        
        {canCreatePayout && (
          <Button
            label="Create Payout"
            icon={<IoAdd />}
            onClick={handleCreatePayout}
            variant="promoted"
            size="small"
          />
        )}
      </Box>
      
      {payout ? (
        <Box>
          {/* Existing Payout Information */}
          <Box marginBottom="1.5rem">
            <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="1rem">
              <Box fontSize="0.875rem" fontWeight="600" color="#374151">
                Payout Details
              </Box>
              <Box
                display="flex"
                alignItems="center"
                gap="0.5rem"
                padding="0.375rem 0.75rem"
                borderRadius="16px"
                fontSize="0.75rem"
                fontWeight="600"
                {...getPayoutStatusConfig(payout.status)}
              >
                {getPayoutStatusConfig(payout.status).icon}
                {payout.status || 'Pending'}
              </Box>
            </Box>
            
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem" marginBottom="1rem">
              <Box>
                <Box fontSize="0.75rem" color="#6b7280" textTransform="uppercase" marginBottom="0.25rem">
                  Payout Amount
                </Box>
                <Box fontSize="1rem" fontWeight="600" color="#059669">
                  AED {Math.round(payout.amount || (booking.totalPrice * 0.85))}
                </Box>
              </Box>
              
              <Box>
                <Box fontSize="0.75rem" color="#6b7280" textTransform="uppercase" marginBottom="0.25rem">
                  Scheduled Date
                </Box>
                <Box fontSize="0.875rem" color="#374151">
                  {payout.scheduledDate 
                    ? new Date(payout.scheduledDate).toLocaleDateString('en-AE')
                    : 'Not scheduled'
                  }
                </Box>
              </Box>
            </Box>
            
            {payout.bankDetails && (
              <Box padding="1rem" backgroundColor="#f9fafb" borderRadius="8px" marginBottom="1rem">
                <Box fontSize="0.75rem" color="#6b7280" textTransform="uppercase" marginBottom="0.5rem">
                  Bank Details
                </Box>
                <Box fontSize="0.875rem" color="#374151">
                  {payout.bankDetails.accountName}<br />
                  {payout.bankDetails.bankName}<br />
                  Account: ***{payout.bankDetails.accountNumber?.slice(-4)}
                </Box>
              </Box>
            )}
            
            {payout.processedAt && (
              <Box fontSize="0.75rem" color="#6b7280">
                Processed on: {new Date(payout.processedAt).toLocaleDateString('en-AE', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Box>
            )}
          </Box>
        </Box>
      ) : (
        <Box>
          {/* No Payout Yet */}
          {booking.status?.toLowerCase() === 'completed' && booking.paymentStatus?.toLowerCase() === 'paid' ? (
            <Box textAlign="center" padding="2rem" backgroundColor="#f0fdf4" borderRadius="8px">
              <IoCash size={32} color="#059669" style={{ marginBottom: '1rem' }} />
              <Box fontSize="0.875rem" color="#166534" marginBottom="0.5rem" fontWeight="600">
                Ready for Payout
              </Box>
              <Box fontSize="0.75rem" color="#166534" marginBottom="1rem">
                This booking is eligible for host payout creation
              </Box>
              <Button
                label="Create Payout"
                icon={<IoAdd />}
                onClick={handleCreatePayout}
                variant="promoted"
                size="small"
              />
            </Box>
          ) : (
            <Box textAlign="center" padding="2rem" backgroundColor="#f9fafb" borderRadius="8px">
              <IoTime size={32} color="#6b7280" style={{ marginBottom: '1rem' }} />
              <Box fontSize="0.875rem" color="#6b7280" marginBottom="0.5rem">
                Payout Not Available
              </Box>
              <Box fontSize="0.75rem" color="#9ca3af">
                Payouts can only be created for completed bookings with confirmed payments
              </Box>
              
              <Box marginTop="1rem" padding="0.75rem" backgroundColor="#white" borderRadius="6px" border="1px solid #e5e7eb">
                <Box fontSize="0.75rem" color="#6b7280" marginBottom="0.5rem">
                  Current Status:
                </Box>
                <Box fontSize="0.875rem" color="#374151">
                  Booking: {booking.status || 'Pending'}<br />
                  Payment: {booking.paymentStatus || 'Pending'}
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      )}
      
      {/* Payout Information */}
      <Box marginTop="1.5rem" borderTop="1px solid #e5e7eb" paddingTop="1rem">
        <Box fontSize="0.875rem" fontWeight="600" color="#374151" marginBottom="0.75rem">
          Payout Information
        </Box>
        
        <Box fontSize="0.75rem" color="#6b7280" lineHeight="1.5">
          • Payouts are processed within 24-48 hours after booking completion<br />
          • Host receives 85% of the total booking amount<br />
          • 15% platform commission is automatically deducted<br />
          • All payouts require verified bank account information
        </Box>
      </Box>
    </Box>
  );
};

export default PayoutSection;