import React, { useEffect, useState } from 'react'
import { useAppShell } from '@/components/base/AppShell'
import { useAppDispatch, useAppSelector } from '@/store'
import { processPayment, clearError } from '@/store/slices/bookingSlice'
import { Box } from '@/components/base/Box'
import { Button } from '@/components/base/Button'
import { ToggleButton } from '@/components'
import { 
  IoArrowBack,
  IoCard,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoTime,
  IoShieldCheckmark
} from 'react-icons/io5'

const BookingPayment: React.FC = () => {
  const { navigateBack, navigateTo, addToast, openDialog } = useAppShell()
  const dispatch = useAppDispatch()
  
  const { 
    currentBooking, 
    error 
  } = useAppSelector((state) => state.booking)
  
  const { currentProperty } = useAppSelector((state) => state.property)
  
  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<'credit-card' | 'mock-success' | 'mock-fail'>('mock-success')
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Mock payment simulation state
  const [paymentStep, setPaymentStep] = useState<'select' | 'processing' | 'completed' | 'failed'>('select')
  
  useEffect(() => {
    if (error) {
      addToast(error, { type: 'error', autoHide: true, duration: 4000 })
      dispatch(clearError())
    }
  }, [error, addToast, dispatch])
  
  const handlePayment = async () => {
    if (!currentBooking) return
    
    setIsProcessing(true)
    setPaymentStep('processing')
    
    // Simulate payment processing time
    setTimeout(async () => {
      if (paymentMethod === 'mock-fail') {
        // Simulate payment failure
        setPaymentStep('failed')
        setIsProcessing(false)
        addToast('Payment failed. Please try again with a different payment method.', { 
          type: 'error', 
          autoHide: true, 
          duration: 5000 
        })
      } else {
        // Simulate successful payment
        try {
          await dispatch(processPayment({ 
            bookingId: 'temp-booking-id', 
            paymentMethod 
          }))
          
          setPaymentStep('completed')
          setIsProcessing(false)
          
          // Show success and navigate to confirmation
          await openDialog<void>((close) => (
            <Box padding="2rem" textAlign="center" alignItems={'center'}>
              <Box display="flex" justifyContent="center" marginBottom="1rem">
                <IoCheckmarkCircle color="#059669" size={48} />
              </Box>
              <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#059669">
                Payment Successful!
              </Box>
              <Box marginBottom="2rem">
                Your booking has been confirmed and you will receive a confirmation email shortly.
              </Box>
              <Button 
                onClick={() => close()} 
                variant="promoted"
                label="Continue"
              />
            </Box>
          ))
          
          // Navigate to My Bookings
          navigateTo('my-bookings', {})
          
        } catch (err) {
          setPaymentStep('failed')
          setIsProcessing(false)
        }
      }
    }, 3000) // 3 second delay to simulate processing
  }
  
  const handleTryAgain = () => {
    setPaymentStep('select')
    setPaymentMethod('mock-success')
  }
  
  if (!currentBooking) {
    return (
      <Box padding="2rem" textAlign="center">
        <Box marginBottom="1rem">Booking not found</Box>
        <Button
          label="Back to Properties"
          icon={<IoArrowBack />}
          onClick={() => navigateTo('properties', {})}
          variant="normal"
        />
      </Box>
    )
  }
  
  return (
    <>
      <Box maxWidth="600px" margin="0 auto" padding="1rem" paddingMd="2rem">
        {/* Header */}
        <Box 
          display="flex" 
          alignItems="center" 
          marginBottom="2rem" 
          paddingBottom="1rem"
          borderBottom="1px solid #e5e7eb"
        >
          <Button
            label=""
            icon={<IoArrowBack />}
            onClick={() => navigateBack()}
            variant="normal"
            size="small"
            style={{ backgroundColor: 'transparent', border: 'none' }}
            disabled={isProcessing}
          />
          <Box marginLeft="1rem" flex="1">
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>
              {paymentStep === 'processing' ? 'Processing Payment' : 
               paymentStep === 'completed' ? 'Payment Complete' :
               paymentStep === 'failed' ? 'Payment Failed' :
               'Payment Details'}
            </h1>
            <Box fontSize="0.875rem" color="#666">
              Step 3 of 3
            </Box>
          </Box>
        </Box>
        
        {/* Booking Summary */}
        {currentProperty && (
          <Box 
            backgroundColor="#f8fafc" 
            padding="1rem" 
            borderRadius="8px" 
            marginBottom="2rem"
          >
            <Box display="flex" alignItems="center" gap="1rem" marginBottom="1rem">
              {currentProperty.photos?.[0] && (
                <Box
                  width="60px"
                  height="60px"
                  backgroundColor="#e5e7eb"
                  borderRadius="8px"
                  backgroundImage={`url(${currentProperty.photos[0].url})`}
                  backgroundSize="cover"
                  backgroundPosition="center"
                />
              )}
              <Box flex="1">
                <Box fontWeight="600" marginBottom="0.25rem">
                  {currentProperty.name}
                </Box>
                <Box fontSize="0.875rem" color="#666" marginBottom="0.25rem">
                  {currentBooking.checkInDate === currentBooking.checkOutDate 
                    ? `Half day on ${currentBooking.checkInDate}`
                    : `${currentBooking.checkInDate} - ${currentBooking.checkOutDate}`}
                </Box>
                <Box fontSize="0.875rem" color="#666">
                  {currentBooking.numGuests} guest{currentBooking.numGuests > 1 ? 's' : ''}
                </Box>
              </Box>
            </Box>
            
            {/* Price breakdown */}
            <Box 
              borderTop="1px solid #e5e7eb" 
              paddingTop="1rem" 
              display="flex" 
              justifyContent="space-between"
            >
              <Box fontWeight="600">Total Amount</Box>
              <Box fontSize="1.25rem" fontWeight="bold" color="#059669">
                AED {Math.round(currentBooking.totalPrice)}
              </Box>
            </Box>
            
            {/* Guest details */}
            <Box 
              borderTop="1px solid #e5e7eb" 
              paddingTop="1rem" 
              marginTop="1rem"
              fontSize="0.875rem" 
              color="#666"
            >
              <Box marginBottom="0.25rem">
                <strong>Guest:</strong> {currentBooking.guestName}
              </Box>
              <Box marginBottom="0.25rem">
                <strong>Email:</strong> {currentBooking.guestEmail}
              </Box>
              {currentBooking.guestPhone && (
                <Box marginBottom="0.25rem">
                  <strong>Phone:</strong> {currentBooking.guestPhone}
                </Box>
              )}
            </Box>
          </Box>
        )}
        
        {/* Payment Step: Selection */}
        {paymentStep === 'select' && (
          <Box>
            <Box marginBottom="2rem">
              <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="1rem">
                <IoCard color="#059669" />
                <h2 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
                  Payment Method
                </h2>
              </Box>
              
              <Box marginBottom="1rem">
                <ToggleButton
                  options={[
                    {
                      value: 'mock-success',
                      label: '✅ Mock Success',
                      icon: <IoCheckmarkCircle />
                    },
                    {
                      value: 'mock-fail',
                      label: '❌ Mock Failure',
                      icon: <IoCloseCircle />
                    }
                  ]}
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                  variant="segmented"
                  fullWidth
                />
              </Box>
              
              <Box 
                backgroundColor="#fffbeb" 
                padding="1rem" 
                borderRadius="8px" 
                border="1px solid #fde68a"
                marginBottom="1.5rem"
              >
                <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
                  <IoShieldCheckmark color="#d97706" />
                  <Box fontWeight="600" color="#92400e">Mock Payment System</Box>
                </Box>
                <Box fontSize="0.875rem" color="#92400e">
                  {paymentMethod === 'mock-success' 
                    ? 'This will simulate a successful payment and create your booking.'
                    : 'This will simulate a payment failure for testing purposes.'
                  }
                </Box>
              </Box>
            </Box>
            
            <Button
              label={`Pay AED ${Math.round(currentBooking.totalPrice)}`}
              icon={<IoCard />}
              onClick={handlePayment}
              variant="promoted"
              size="large"
              disabled={isProcessing}
              style={{ width: '100%' }}
            />
            
            <Box fontSize="0.75rem" color="#666" textAlign="center" marginTop="1rem">
              Your booking will be confirmed after successful payment
            </Box>
          </Box>
        )}
        
        {/* Payment Step: Processing */}
        {paymentStep === 'processing' && (
          <Box textAlign="center">
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center" 
              marginBottom="2rem"
            >
              <Box
                width="60px"
                height="60px"
                border="4px solid #e5e7eb"
                borderTop="4px solid #059669"
                borderRadius="50%"
                style={{ animation: 'spin 1s linear infinite' }}
              />
            </Box>
            
            <Box fontSize="1.125rem" fontWeight="600" marginBottom="1rem">
              Processing Your Payment
            </Box>
            
            <Box fontSize="0.875rem" color="#666" marginBottom="2rem">
              Please wait while we process your payment. This may take a few seconds.
            </Box>
            
            <Box display="flex" alignItems="center" gap="0.5rem" justifyContent="center" color="#d97706">
              <IoTime />
              <span>Processing...</span>
            </Box>
          </Box>
        )}
        
        {/* Payment Step: Failed */}
        {paymentStep === 'failed' && (
          <Box textAlign="center">
            <Box display="flex" justifyContent="center" marginBottom="2rem">
              <IoCloseCircle color="#dc2626" size={60} />
            </Box>
            
            <Box fontSize="1.125rem" fontWeight="600" marginBottom="1rem" color="#dc2626">
              Payment Failed
            </Box>
            
            <Box fontSize="0.875rem" color="#666" marginBottom="2rem">
              We couldn't process your payment. Please check your payment details and try again.
            </Box>
            
            <Box display="flex" gap="1rem" justifyContent="center" flexDirection="column" flexDirectionSm="row">
              <Button
                label="Try Again"
                onClick={handleTryAgain}
                variant="promoted"
              />
              <Button
                label="Back to Booking"
                onClick={() => navigateBack()}
                variant="normal"
              />
            </Box>
          </Box>
        )}
        
        {/* Payment Step: Completed */}
        {paymentStep === 'completed' && (
          <Box textAlign="center">
            <Box display="flex" justifyContent="center" marginBottom="2rem">
              <IoCheckmarkCircle color="#059669" size={60} />
            </Box>
            
            <Box fontSize="1.125rem" fontWeight="600" marginBottom="1rem" color="#059669">
              Payment Successful!
            </Box>
            
            <Box fontSize="0.875rem" color="#666" marginBottom="2rem">
              Your booking has been confirmed. You will receive a confirmation email shortly.
            </Box>
            
            {/* Optional Account Creation Suggestion */}
            <Box 
              backgroundColor="#f0fdf4" 
              border="1px solid #bbf7d0" 
              borderRadius="8px" 
              padding="1.5rem" 
              marginBottom="2rem"
            >
              <Box fontSize="0.9375rem" fontWeight="600" marginBottom="0.75rem" color="#065f46">
                💡 Create an account to manage your bookings
              </Box>
              <Box fontSize="0.875rem" color="#166534" marginBottom="1rem" lineHeight="1.4">
                Save time on future bookings and easily track your reservation history by creating a free account.
              </Box>
              <Box display="flex" gap="0.75rem" justifyContent="center">
                <Button
                  label="Create Account"
                  onClick={() => navigateTo('register', {})}
                  variant="normal"
                  size="medium"
                />
                <Button
                  label="Skip for Now"
                  onClick={() => navigateTo('home', {})}
                  variant="plain"
                  size="medium"
                />
              </Box>
            </Box>
            
            <Button
              label="View My Bookings"
              onClick={() => navigateTo('my-bookings', {})}
              variant="promoted"
              size="large"
            />
          </Box>
        )}
      </Box>
      
      {/* Custom CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}

export default BookingPayment