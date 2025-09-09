import React, { useEffect } from 'react';
import { useAppShell } from '@/components/base/AppShell';
import { useAppDispatch, useAppSelector } from '@/store';
import { Box } from '@/components/base/Box';
import { Button } from '@/components/base/Button';
import { SecuredPage } from '@/components/SecuredPage';
import { 
  fetchBookingDetails, 
  clearBookingDetails,
  updateReservationStatus,
  reportNoShow,
  clearError
} from '@/store/slices/bookingDetailsSlice';
import BookingDetailsHeader from '@/components/booking/BookingDetailsHeader';
import BookingOverview from '@/components/booking/BookingOverview';
import GuestInformation from '@/components/booking/GuestInformation';
import PropertyInformation from '@/components/booking/PropertyInformation';
import RatePlanInformation from '@/components/booking/RatePlanInformation';
import MessagingSection from '@/components/booking/MessagingSection';
import FeeBreakdownSection from '@/components/booking/FeeBreakdownSection';
import AuditTrailSection from '@/components/booking/AuditTrailSection';
import PayoutSection from '@/components/booking/PayoutSection';
import PrivateNotesSection from '@/components/booking/PrivateNotesSection';
import BookingActionsSection from '@/components/booking/BookingActionsSection';
import { 
  IoArrowBack,
  IoWarning,
  IoReload
} from 'react-icons/io5';

interface BookingDetailsProps {
  bookingId?: string;
}

const BookingDetails: React.FC<BookingDetailsProps> = ({ bookingId }) => {
  const { currentParams, navigateTo, addToast, canNavigateBack, navigateBack, openDialog } = useAppShell();
  const dispatch = useAppDispatch();
  
  const params = { bookingId, ...currentParams };
  const actualBookingId = params.bookingId || (params as any).id;
  
  const {
    currentBooking,
    loading,
    error,
    feeBreakdown,
    messages,
    auditTrail,
    statistics
  } = useAppSelector((state) => state.bookingDetails);
  
  const { user, currentRoleMode } = useAppSelector((state) => state.auth);
  const userRole = currentRoleMode || user?.role || 'Tenant';
  
  // Load booking details on mount
  useEffect(() => {
    if (actualBookingId && actualBookingId !== 'new') {
      dispatch(fetchBookingDetails({
        bookingId: actualBookingId,
        include: ['messages', 'auditTrail', 'feeBreakdown', 'statistics']
      }));
    }
    
    return () => {
      dispatch(clearBookingDetails());
    };
  }, [dispatch, actualBookingId]);
  
  // Handle errors
  useEffect(() => {
    if (error) {
      addToast(error, { type: 'error', autoHide: true, duration: 4000 });
      dispatch(clearError());
    }
  }, [error, addToast, dispatch]);
  
  const handleBack = () => {
    if (canNavigateBack) {
      navigateBack();
    } else {
      navigateTo('my-bookings', {});
    }
  };
  
  const handleStatusChange = async (newStatus: string, reason?: string) => {
    if (!currentBooking) return;
    
    const shouldUpdate = await openDialog<boolean>((close) => (
      <Box padding="2rem" textAlign="center">
        <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#f59e0b">
          Update Booking Status
        </Box>
        <Box marginBottom="2rem">
          Change booking status from "{currentBooking.status}" to "{newStatus}"?
          {reason && (
            <Box marginTop="1rem" fontSize="0.875rem" color="#666">
              Reason: {reason}
            </Box>
          )}
        </Box>
        <Box display="flex" gap="1rem" justifyContent="center">
          <Button onClick={() => close(false)}>Cancel</Button>
          <Button onClick={() => close(true)} variant="promoted">Update Status</Button>
        </Box>
      </Box>
    ));
    
    if (shouldUpdate) {
      try {
        await dispatch(updateReservationStatus({
          bookingId: currentBooking.id,
          status: newStatus,
          reason
        }));
        addToast('Booking status updated successfully', { type: 'success', autoHide: true });
      } catch (err) {
        // Error handled by Redux
      }
    }
  };
  
  const handleNoShow = async (reason: string, description?: string) => {
    if (!currentBooking) return;
    
    const shouldReport = await openDialog<boolean>((close) => (
      <Box padding="2rem" textAlign="center">
        <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#dc2626">
          Report Guest No-Show
        </Box>
        <Box marginBottom="2rem">
          This will mark the guest as a no-show and may waive commission fees.
          <Box marginTop="1rem" fontSize="0.875rem" color="#666">
            Reason: {reason}
            {description && <div>Description: {description}</div>}
          </Box>
        </Box>
        <Box display="flex" gap="1rem" justifyContent="center">
          <Button onClick={() => close(false)}>Cancel</Button>
          <Button onClick={() => close(true)} variant="promoted" 
                  style={{ backgroundColor: '#dc2626' }}>Report No-Show</Button>
        </Box>
      </Box>
    ));
    
    if (shouldReport) {
      try {
        await dispatch(reportNoShow({
          bookingId: currentBooking.id,
          reason,
          description
        }));
        addToast('No-show reported successfully', { type: 'success', autoHide: true });
      } catch (err) {
        // Error handled by Redux
      }
    }
  };
  
  // Loading state
  if (loading && !currentBooking) {
    return (
      <SecuredPage>
        <Box padding="2rem" textAlign="center">
          <IoReload className="spin" size={40} color="#3b82f6" style={{ marginBottom: '1rem' }} />
          <p style={{ color: '#6b7280', margin: 0 }}>Loading booking details...</p>
        </Box>
      </SecuredPage>
    );
  }
  
  // Error state
  if (error && !currentBooking) {
    return (
      <SecuredPage>
        <Box padding="2rem" textAlign="center">
          <IoWarning size={48} color="#dc2626" style={{ marginBottom: '1rem' }} />
          <Box fontSize="1.25rem" fontWeight="600" marginBottom="1rem" color="#dc2626">
            Booking Not Found
          </Box>
          <Box marginBottom="2rem" color="#666">
            The booking you're looking for doesn't exist or you don't have permission to view it.
          </Box>
          <Button
            label="Back to Bookings"
            icon={<IoArrowBack />}
            onClick={handleBack}
            variant="promoted"
          />
        </Box>
      </SecuredPage>
    );
  }
  
  if (!currentBooking) return null;
  
  return (
    <SecuredPage>
      <Box maxWidth="1200px" margin="0 auto" padding="1rem" paddingMd="2rem">
        {/* Header */}
        <BookingDetailsHeader 
          booking={currentBooking}
          userRole={userRole}
          onBack={handleBack}
        />
        
        {/* Main Content */}
        <Box display="grid" gridTemplateColumns="1fr" gridTemplateColumnsLg="2fr 1fr" gap="2rem">
          {/* Left Column - Main Details */}
          <Box display="flex" flexDirection="column" gap="2rem">
            {/* Booking Overview */}
            <BookingOverview 
              booking={currentBooking} 
              userRole={userRole}
            />
            
            {/* Guest Information - HomeOwner/Manager only */}
            {(userRole === 'HomeOwner' || userRole === 'Manager') && (
              <GuestInformation 
                booking={currentBooking}
                userRole={userRole}
              />
            )}
            
            {/* Property Information */}
            <PropertyInformation 
              booking={currentBooking}
              userRole={userRole}
            />
            
            {/* Rate Plan Information - Show if booking has rate plan */}
            <RatePlanInformation 
              booking={currentBooking}
              userRole={userRole}
            />
            
            {/* Messaging Section - All roles */}
            <MessagingSection 
              booking={currentBooking}
              userRole={userRole}
              messages={messages}
            />
            
            {/* Fee Breakdown - All roles see relevant parts */}
            <FeeBreakdownSection 
              booking={currentBooking}
              feeBreakdown={feeBreakdown}
              userRole={userRole}
            />
            
            {/* Audit Trail - HomeOwner/Manager only */}
            {(userRole === 'HomeOwner' || userRole === 'Manager') && (
              <AuditTrailSection 
                booking={currentBooking}
                auditTrail={auditTrail}
                userRole={userRole}
              />
            )}
          </Box>
          
          {/* Right Column - Actions & Secondary Info */}
          <Box display="flex" flexDirection="column" gap="2rem">
            {/* Action Buttons */}
            <BookingActionsSection 
              booking={currentBooking}
              userRole={userRole}
              onStatusChange={handleStatusChange}
              onNoShow={handleNoShow}
            />
            
            {/* Private Notes - HomeOwner/Manager only */}
            {(userRole === 'HomeOwner' || userRole === 'Manager') && (
              <PrivateNotesSection 
                booking={currentBooking}
                userRole={userRole}
              />
            )}
            
            {/* Payout Information - Manager only */}
            {userRole === 'Manager' && (
              <PayoutSection 
                booking={currentBooking}
                userRole={userRole}
              />
            )}
            
            {/* Statistics Summary */}
            {statistics && (userRole === 'HomeOwner' || userRole === 'Manager') && (
              <Box
                backgroundColor="white"
                borderRadius="12px"
                padding="1.5rem"
                border="1px solid #e5e7eb"
              >
                <Box fontSize="1.125rem" fontWeight="600" marginBottom="1rem">
                  Statistics
                </Box>
                <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem">
                  <Box textAlign="center">
                    <Box fontSize="1.5rem" fontWeight="bold" color="#059669">
                      {statistics.totalChanges}
                    </Box>
                    <Box fontSize="0.75rem" color="#666">Total Changes</Box>
                  </Box>
                  <Box textAlign="center">
                    <Box fontSize="1.5rem" fontWeight="bold" color="#3b82f6">
                      {statistics.messageCount || 0}
                    </Box>
                    <Box fontSize="0.75rem" color="#666">Messages</Box>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </SecuredPage>
  );
};

export default BookingDetails;