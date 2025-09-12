import React from 'react';
import { Box } from '@/components/base/Box';
import { Button } from '@/components/base/Button';
import { 
  IoCheckmarkCircle,
  IoCloseCircle,
  IoWarning,
  IoDownload,
  IoPrint,
  IoCreate
} from 'react-icons/io5';

interface BookingActionsSectionProps {
  booking: any;
  userRole: string;
  onStatusChange: (status: string, reason?: string) => void;
  onNoShow: (reason: string, description?: string) => void;
}

const BookingActionsSection: React.FC<BookingActionsSectionProps> = ({ 
  booking, 
  userRole, 
  onStatusChange,
  onNoShow
}) => {
  const canConfirm = booking.status?.toLowerCase() === 'pending';
  const canCancel = ['pending', 'confirmed'].includes(booking.status?.toLowerCase());
  const canComplete = booking.status?.toLowerCase() === 'confirmed';
  const canReportNoShow = booking.status?.toLowerCase() === 'confirmed' && userRole !== 'Tenant';
  
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export booking data');
  };
  
  const handlePrint = () => {
    // TODO: Implement print functionality
    window.print();
  };
  
  const handleModify = () => {
    // TODO: Implement modify booking functionality
    console.log('Modify booking');
  };
  
  return (
    <Box
      backgroundColor="white"
      borderRadius="12px"
      padding="1.5rem"
      border="1px solid #e5e7eb"
    >
      <Box fontSize="1.125rem" fontWeight="600" marginBottom="1.5rem" color="#111827">
        Actions
      </Box>
      
      {/* Status Actions */}
      <Box marginBottom="1.5rem">
        <Box fontSize="0.875rem" fontWeight="600" color="#374151" marginBottom="0.75rem">
          Status Management
        </Box>
        
        <Box display="flex" flexDirection="column" gap="0.5rem">
          {canConfirm && userRole !== 'Tenant' && (
            <Button
              label="Confirm Booking"
              icon={<IoCheckmarkCircle />}
              onClick={() => onStatusChange('Confirmed')}
              variant="promoted"
              size="small"
              style={{ backgroundColor: '#059669' }}
            />
          )}
          
          {canComplete && userRole !== 'Tenant' && (
            <Button
              label="Mark as Completed"
              icon={<IoCheckmarkCircle />}
              onClick={() => onStatusChange('Completed')}
              variant="normal"
              size="small"
              style={{ 
                backgroundColor: '#e0e7ff',
                color: '#3730a3',
                border: '1px solid #c7d2fe'
              }}
            />
          )}
          
          {canCancel && (
            <Button
              label="Cancel Booking"
              icon={<IoCloseCircle />}
              onClick={() => onStatusChange('Cancelled', 'Cancelled by user')}
              variant="normal"
              size="small"
              style={{ 
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                border: '1px solid #fecaca'
              }}
            />
          )}
          
          {canReportNoShow && (
            <Button
              label="Report No-Show"
              icon={<IoWarning />}
              onClick={() => onNoShow('Guest did not show up', 'No-show reported by host')}
              variant="normal"
              size="small"
              style={{ 
                backgroundColor: '#fef3c7',
                color: '#92400e',
                border: '1px solid #fde68a'
              }}
            />
          )}
        </Box>
      </Box>
      
      {/* Booking Management - Non-Tenant Actions */}
      {userRole !== 'Tenant' && (
        <Box marginBottom="1.5rem">
          <Box fontSize="0.875rem" fontWeight="600" color="#374151" marginBottom="0.75rem">
            Booking Management
          </Box>
          
          <Box display="flex" flexDirection="column" gap="0.5rem">
            <Button
              label="Modify Booking"
              icon={<IoCreate />}
              onClick={handleModify}
              variant="normal"
              size="small"
              disabled={!['pending', 'confirmed'].includes(booking.status?.toLowerCase())}
            />
          </Box>
        </Box>
      )}
      
      {/* Export & Print Actions */}
      <Box>
        <Box fontSize="0.875rem" fontWeight="600" color="#374151" marginBottom="0.75rem">
          Export & Print
        </Box>
        
        <Box display="flex" flexDirection="column" gap="0.5rem">
          <Button
            label="Download Receipt"
            icon={<IoDownload />}
            onClick={handleExport}
            variant="normal"
            size="small"
          />
          
          <Button
            label="Print Details"
            icon={<IoPrint />}
            onClick={handlePrint}
            variant="normal"
            size="small"
          />
        </Box>
      </Box>
      
      {/* Booking Status Info */}
      <Box marginTop="1.5rem" padding="1rem" backgroundColor="#f9fafb" borderRadius="8px">
        <Box fontSize="0.875rem" fontWeight="600" color="#374151" marginBottom="0.5rem">
          Current Status
        </Box>
        <Box fontSize="0.875rem" color="#6b7280">
          This booking is currently <strong>{booking.status?.toLowerCase() || 'pending'}</strong>
          {booking.paymentStatus && (
            <span> with payment status: <strong>{booking.paymentStatus.toLowerCase()}</strong></span>
          )}
        </Box>
        
        {booking.status?.toLowerCase() === 'pending' && (
          <Box fontSize="0.75rem" color="#92400e" marginTop="0.5rem">
            ⚠️ Pending bookings may expire if not confirmed within 24 hours
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default BookingActionsSection;