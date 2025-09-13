import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { 
  fetchCancellationPreview, 
  cancelReservation 
} from '@/store/slices/bookingSlice'
import { useAppShell } from '@/components/base/AppShell'
import { Box } from '@/components/base/Box'
import Button from '@/components/base/Button'
import SelectionPicker from '@/components/base/SelectionPicker'
import { SecuredPage } from '@/components/SecuredPage'
import { IoArrowBack, IoWarning, IoCheckmarkCircle, IoCloseCircle, IoInformationCircle } from 'react-icons/io5'

interface CancellationPageProps {
  reservationId: string
}

const CancellationPage: React.FC<CancellationPageProps> = ({ reservationId }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { navigateTo, navigateBack, openDialog, mountHeader } = useAppShell()
  
  const { 
    cancellationPreview, 
    cancellationLoading, 
    error 
  } = useSelector((state: RootState) => state.booking)
  
  const [reasonCategory, setReasonCategory] = useState('')
  const [reasonText, setReasonText] = useState('')
  const [isConfirming, setIsConfirming] = useState(false)

  const reasonCategories = [
    { value: 'PLANS_CHANGED', label: 'My plans have changed' },
    { value: 'EMERGENCY', label: 'Emergency or illness' },
    { value: 'FOUND_BETTER_OPTION', label: 'Found a better option' },
    { value: 'NO_LONGER_NEEDED', label: 'No longer need accommodation' },
    { value: 'OTHER', label: 'Other reason' }
  ]

  // Fetch cancellation preview on mount
  useEffect(() => {
    if (reservationId && reservationId !== 'new') {
      dispatch(fetchCancellationPreview(reservationId))
    }
  }, [reservationId, dispatch])

  // Mount custom header
  useEffect(() => {
    const unmountHeader = mountHeader(
      <Box
        display="flex"
        alignItems="center"
        padding="1rem 1.5rem"
        backgroundColor="#D52122"
        height="4rem"
      >
        <Box display="flex" alignItems="center" gap="1rem" flex="1">
          <Button
            label=""
            icon={<IoArrowBack />}
            onClick={handleBack}
            variant="normal"
            size="small"
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white'
            }}
            title="Back"
          />
          <Box display="flex" alignItems="center" gap="0.75rem">
            <IoCloseCircle color="white" size={20} />
            <h2 style={{
              margin: 0,
              fontSize: '1.125rem',
              fontWeight: '600',
              color: 'white'
            }}>
              Cancel Reservation
            </h2>
          </Box>
        </Box>
      </Box>
    )

    return unmountHeader
  }, [mountHeader])

  const handleBack = () => {
    if (navigateBack) {
      navigateBack()
    } else {
      navigateTo('bookings', {})
    }
  }

  const getPolicyIcon = () => {
    if (!cancellationPreview) return null
    
    switch (cancellationPreview.policyType) {
      case 'FullyFlexible':
        return <IoCheckmarkCircle color="#059669" size={24} />
      case 'Moderate':
        return <IoInformationCircle color="#f59e0b" size={24} />
      case 'NonRefundable':
        return <IoCloseCircle color="#dc2626" size={24} />
      default:
        return null
    }
  }

  const handleCancellation = async () => {
    if (!reasonCategory || !reasonText.trim()) {
      await openDialog<void>((close) => (
        <Box padding="2rem" textAlign="center">
          <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#dc2626">
            Missing Information
          </Box>
          <Box marginBottom="2rem">
            Please select a reason category and provide a description for the cancellation.
          </Box>
          <Box display="flex" gap="1rem" justifyContent="center">
            <Button onClick={() => close()} variant="promoted">OK</Button>
          </Box>
        </Box>
      ))
      return
    }

    // Show confirmation dialog
    const confirmed = await openDialog<boolean>((close) => (
      <Box padding="2rem" textAlign="center">
        <Box display={'flex'} flexDirection={'column'} alignItems={'center'} fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#f59e0b">
          <IoWarning size={30} style={{ marginBottom: '0.5rem' }} />
          <div>Confirm Cancellation</div>
        </Box>
        <Box marginBottom="1rem">
          Are you sure you want to cancel this reservation?
        </Box>
        {cancellationPreview && (
          <Box 
            backgroundColor="#f3f4f6" 
            padding="1rem" 
            borderRadius="0.5rem" 
            marginBottom="1.5rem"
            textAlign="left"
          >
            <Box fontWeight="bold" marginBottom="0.5rem">Refund Details:</Box>
            <Box display="flex" justifyContent="space-between" marginBottom="0.25rem">
              <span>Original Amount:</span>
              <span>AED {cancellationPreview.originalAmount.toFixed(2)}</span>
            </Box>
            <Box display="flex" justifyContent="space-between" marginBottom="0.25rem">
              <span>Cancellation Fee:</span>
              <span style={{ color: '#dc2626' }}>- AED {cancellationPreview.cancellationFee.toFixed(2)}</span>
            </Box>
            <Box 
              display="flex" 
              justifyContent="space-between" 
              fontWeight="bold"
              borderTop="1px solid #d1d5db"
              paddingTop="0.5rem"
              marginTop="0.5rem"
            >
              <span>Refund Amount:</span>
              <span style={{ color: '#059669' }}>AED {cancellationPreview.refundAmount.toFixed(2)}</span>
            </Box>
          </Box>
        )}
        <Box color="#6b7280" fontSize="0.875rem" marginBottom="1.5rem">
          This action cannot be undone.
        </Box>
        <Box display="flex" gap="1rem" justifyContent="center">
          <Button onClick={() => close(false)}>Keep Reservation</Button>
          <Button 
            onClick={() => close(true)} 
            variant="promoted"
            style={{ backgroundColor: '#dc2626' }}
          >
            Yes, Cancel Reservation
          </Button>
        </Box>
      </Box>
    ))

    if (!confirmed) return

    setIsConfirming(true)
    
    try {
      await dispatch(cancelReservation({
        reservationId,
        reason: reasonText,
        reasonCategory
      })).unwrap()

      // Show success dialog
      await openDialog<void>((close) => (
        <Box display={'flex'} flexDirection={'column'} alignItems={'center'} padding="2rem" textAlign="center">
          <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#059669">
            <IoCheckmarkCircle size={40} style={{ marginBottom: '0.5rem' }} />
            <div>Reservation Cancelled</div>
          </Box>
          <Box marginBottom="1rem">
            Your reservation has been successfully cancelled.
          </Box>
          {cancellationPreview && cancellationPreview.refundAmount > 0 && (
            <Box 
              backgroundColor="#f0fdf4" 
              padding="1rem" 
              borderRadius="0.5rem" 
              marginBottom="1.5rem"
              color="#059669"
            >
              A refund of AED {cancellationPreview.refundAmount.toFixed(2)} will be processed 
              to your original payment method within 3-5 business days.
            </Box>
          )}
          <Button onClick={() => close()} variant="promoted">Continue</Button>
        </Box>
      ))

      // Navigate back to bookings
      navigateTo('bookings', {})
    } catch (err) {
      // Show error dialog
      await openDialog<void>((close) => (
        <Box padding="2rem" textAlign="center">
          <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#dc2626">
            Cancellation Failed
          </Box>
          <Box marginBottom="2rem">
            {error || 'An error occurred while cancelling your reservation. Please try again.'}
          </Box>
          <Button onClick={() => close()} variant="promoted">OK</Button>
        </Box>
      ))
    } finally {
      setIsConfirming(false)
    }
  }

  if (cancellationLoading && !cancellationPreview) {
    return (
      <SecuredPage>
        <Box padding="2rem" textAlign="center">
          <Box fontSize="1.125rem">Loading cancellation details...</Box>
        </Box>
      </SecuredPage>
    )
  }

  if (!cancellationPreview) {
    return (
      <SecuredPage>
        <Box padding="2rem" textAlign="center">
          <Box fontSize="1.125rem" color="#dc2626">
            Unable to load cancellation details. Please try again.
          </Box>
        </Box>
      </SecuredPage>
    )
  }

  if (!cancellationPreview.canCancel) {
    return (
      <SecuredPage>
        <Box padding="1rem" paddingMd="2rem" maxWidth="800px" margin="0 auto">
          <Box 
            backgroundColor="#fef2f2" 
            padding="1.5rem" 
            borderRadius="0.5rem"
            border="1px solid #fecaca"
          >
            <Box display="flex" alignItems="center" gap="1rem" marginBottom="1rem">
              <IoCloseCircle color="#dc2626" size={32} />
              <Box fontSize="1.25rem" fontWeight="bold" color="#dc2626">
                Cannot Cancel Reservation
              </Box>
            </Box>
            <Box color="#7f1d1d">
              This reservation cannot be cancelled. This may be due to the cancellation policy 
              or because the check-in date has already passed.
            </Box>
          </Box>
        </Box>
      </SecuredPage>
    )
  }

  return (
    <SecuredPage>
      <Box padding="1rem" paddingMd="2rem" maxWidth="800px" margin="0 auto">
        {/* Cancellation Policy Info */}
        <Box 
          backgroundColor="#f9fafb" 
          padding="1.5rem" 
          borderRadius="0.5rem"
          marginBottom="2rem"
          border="1px solid #e5e7eb"
        >
          <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1rem">
            {getPolicyIcon()}
            <Box fontSize="1.125rem" fontWeight="bold">
              Cancellation Policy: {cancellationPreview.policyType.replace(/([A-Z])/g, ' $1').trim()}
            </Box>
          </Box>
          <Box color="#6b7280" marginBottom="1rem">
            {cancellationPreview.policyDetails}
          </Box>
          <Box fontSize="0.875rem" color="#6b7280">
            Days before check-in: {cancellationPreview.daysBeforeCheckIn}
          </Box>
        </Box>

        {/* Refund Calculation */}
        <Box 
          backgroundColor="white" 
          padding="1.5rem" 
          borderRadius="0.5rem"
          marginBottom="2rem"
          border="1px solid #e5e7eb"
        >
          <Box fontSize="1.125rem" fontWeight="bold" marginBottom="1rem">
            Refund Calculation
          </Box>
          
          <Box display="flex" flexDirection="column" gap="0.75rem">
            <Box display="flex" justifyContent="space-between">
              <span>Original Booking Amount:</span>
              <span style={{ fontWeight: '600' }}>AED {cancellationPreview.originalAmount.toFixed(2)}</span>
            </Box>
            
            <Box display="flex" justifyContent="space-between">
              <span>Refund Percentage:</span>
              <span style={{ fontWeight: '600' }}>{cancellationPreview.refundPercentage}%</span>
            </Box>
            
            <Box display="flex" justifyContent="space-between">
              <span>Cancellation Fee:</span>
              <span style={{ fontWeight: '600', color: '#dc2626' }}>
                - AED {cancellationPreview.cancellationFee.toFixed(2)}
              </span>
            </Box>
            
            <Box 
              display="flex" 
              justifyContent="space-between"
              paddingTop="0.75rem"
              borderTop="2px solid #e5e7eb"
              fontSize="1.125rem"
              fontWeight="bold"
            >
              <span>Total Refund:</span>
              <span color="#059669">AED {cancellationPreview.refundAmount.toFixed(2)}</span>
            </Box>
          </Box>
        </Box>

        {/* Cancellation Reason */}
        <Box 
          backgroundColor="white" 
          padding="1.5rem" 
          borderRadius="0.5rem"
          marginBottom="2rem"
          border="1px solid #e5e7eb"
        >
          <Box fontSize="1.125rem" fontWeight="bold" marginBottom="1rem">
            Reason for Cancellation
          </Box>
          
          <Box marginBottom="1.5rem">
            <Box marginBottom="0.5rem" fontSize="0.875rem" fontWeight="500">
              Select a reason
            </Box>
            <SelectionPicker
              data={reasonCategories}
              idAccessor={(item) => item.value}
              labelAccessor={(item) => item.label}
              value={reasonCategory}
              onChange={(value) => setReasonCategory(value as string)}
              containerStyles={{
                minHeight: '2.5rem',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem'
              }}
            />
          </Box>
          
          <Box>
            <Box marginBottom="0.5rem" fontSize="0.875rem" fontWeight="500">
              Additional details
            </Box>
            <textarea
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              rows={4}
              placeholder="Please provide more details about your cancellation..."
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                resize: 'vertical'
              }}
            />
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box display="flex" gap="1rem" justifyContent="center">
          <Button 
            label="Keep Reservation"
            onClick={handleBack}
            size="large"
          />
          <Button 
            label={isConfirming ? "Processing..." : "Cancel Reservation"}
            onClick={handleCancellation}
            variant="promoted"
            size="large"
            disabled={isConfirming || !reasonCategory || !reasonText.trim()}
            style={{ 
              backgroundColor: '#dc2626',
              opacity: (isConfirming || !reasonCategory || !reasonText.trim()) ? 0.5 : 1
            }}
          />
        </Box>

        {/* Warning Message */}
        <Box 
          textAlign="center" 
          marginTop="1.5rem" 
          color="#6b7280" 
          fontSize="0.875rem"
        >
          <IoWarning style={{ marginRight: '0.5rem' }} />
          Please note that cancellations are final and cannot be reversed.
        </Box>
      </Box>
    </SecuredPage>
  )
}

export default CancellationPage