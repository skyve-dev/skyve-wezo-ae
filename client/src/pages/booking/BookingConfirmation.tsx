import React, { useEffect, useState } from 'react'
import { useAppShell } from '@/components/base/AppShell'
import { useAppDispatch, useAppSelector } from '@/store'
import { 
  initializeBooking, 
  updateBookingField, 
  sendOtpCode, 
  verifyOtpCode,
  setOtpTimer,
  clearError,
  setCurrentStep
} from '@/store/slices/bookingSlice'
import { autoLogin } from '@/store/slices/authSlice'
import { fetchPropertyById } from '@/store/slices/propertySlice'
import { Box } from '@/components/base/Box'
import { Button } from '@/components/base/Button'
import { Input } from '@/components/base/Input'
import { 
  IoArrowBack,
  IoCheckmarkCircle,
  IoTime,
  IoMail,
  IoPerson
} from 'react-icons/io5'

const BookingConfirmation: React.FC = () => {
  const { navigateBack, navigateTo, currentParams, addToast } = useAppShell()
  const dispatch = useAppDispatch()
  
  // Get booking data from route params
  const params = currentParams as any
  
  const { 
    currentBooking, 
    currentStep, 
    otpTimer, 
    isLoading, 
    error 
  } = useAppSelector((state) => state.booking)
  
  const { currentProperty } = useAppSelector((state) => state.property)
  
  // OTP Timer countdown
  const [countdown, setCountdown] = useState(0)
  
  // Initialize booking when component mounts
  useEffect(() => {
    if (params?.propertyId && !currentBooking) {
      dispatch(initializeBooking({
        propertyId: params.propertyId,
        ratePlanId: params.ratePlanId,
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        numGuests: parseInt(params.numGuests),
        totalPrice: parseFloat(params.totalPrice),
        pricePerNight: parseFloat(params.pricePerNight)
      }))
      
      // Fetch property details if not already loaded
      if (!currentProperty || currentProperty.propertyId !== params.propertyId) {
        dispatch(fetchPropertyById(params.propertyId))
      }
    }
  }, [params, currentBooking, currentProperty, dispatch])
  
  // OTP countdown timer
  useEffect(() => {
    if (otpTimer > 0) {
      setCountdown(otpTimer)
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            dispatch(setOtpTimer(0))
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [otpTimer, dispatch])
  
  // Clear error when component mounts or step changes
  useEffect(() => {
    if (error) {
      addToast(error, { type: 'error', autoHide: true, duration: 4000 })
      dispatch(clearError())
    }
  }, [error, addToast, dispatch])
  
  const handleInputChange = (field: string, value: string) => {
    dispatch(updateBookingField({ [field]: value }))
  }
  
  const handleSendOtp = async () => {
    if (!currentBooking?.guestEmail) {
      addToast('Please enter your email address', { 
        type: 'warning', 
        autoHide: true, 
        duration: 4000 
      })
      return
    }
    
    if (!currentBooking?.guestName.trim()) {
      addToast('Please enter your full name', { 
        type: 'warning', 
        autoHide: true, 
        duration: 4000 
      })
      return
    }
    
    await dispatch(sendOtpCode(currentBooking.guestEmail))
  }
  
  const handleVerifyOtp = async () => {
    if (!currentBooking?.otpCode || currentBooking.otpCode.length !== 6) {
      addToast('Please enter the 6-digit verification code', { 
        type: 'warning', 
        autoHide: true, 
        duration: 4000 
      })
      return
    }
    
    const result = await dispatch(verifyOtpCode({
      email: currentBooking.guestEmail,
      otpCode: currentBooking.otpCode,
      bookingData: currentBooking // Pass full booking data for server-side booking creation
    }))
    
    if (result.meta.requestStatus === 'fulfilled') {
      // Check if account was auto-created and dispatch auto-login
      const response = (result.payload as any)?.data
      if (response?.user && response?.token) {
        // Dispatch auto-login to update auth state
        dispatch(autoLogin({ user: response.user, token: response.token }))
        
        if (response?.autoCreated) {
          addToast('Account created successfully! Email: ' + response.user.email + ' | Password: 123456', { 
            type: 'success', 
            autoHide: false, // Don't auto-hide so user can see credentials
            duration: 10000 
          })
        } else {
          addToast('Email verified and logged in! Proceeding to payment...', { 
            type: 'success', 
            autoHide: true, 
            duration: 3000 
          })
        }
      } else {
        addToast('Email verified successfully! Proceeding to payment...', { 
          type: 'success', 
          autoHide: true, 
          duration: 3000 
        })
      }
      
      // Check if booking was created successfully
      if (response?.bookingId) {
        addToast('Booking created! Proceeding to payment...', { 
          type: 'info', 
          autoHide: true, 
          duration: 2000 
        })
        
        // Navigate to payment with actual booking ID
        setTimeout(() => {
          navigateTo('booking-payment', {
            bookingId: response.bookingId,
            bookingExpiresAt: response.bookingExpiresAt,
            ...params
          })
        }, 1500)
      } else {
        // If booking wasn't created for some reason, show error
        addToast('Booking creation failed. Please try again.', { 
          type: 'error', 
          autoHide: true, 
          duration: 5000 
        })
      }
    }
  }
  
  const handleResendOtp = () => {
    if (currentBooking?.guestEmail) {
      dispatch(sendOtpCode(currentBooking.guestEmail))
    }
  }
  
  const handleBack = () => {
    if (currentStep === 'otp') {
      dispatch(setCurrentStep('details'))
    } else {
      navigateBack()
    }
  }
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  if (!currentBooking) {
    return (
      <Box padding="2rem" textAlign="center">
        <Box marginBottom="1rem">Loading booking details...</Box>
        <Button
          label="Back"
          icon={<IoArrowBack />}
          onClick={() => navigateBack()}
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
            onClick={handleBack}
            variant="normal"
            size="small"
            style={{ backgroundColor: 'transparent', border: 'none' }}
          />
          <Box marginLeft="1rem" flex="1">
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>
              {currentStep === 'details' ? 'Booking Details' : 'Verify Email'}
            </h1>
            <Box fontSize="0.875rem" color="#666">
              Step {currentStep === 'details' ? '1' : '2'} of 3
            </Box>
          </Box>
        </Box>
        
        {/* Property Summary */}
        {currentProperty && (
          <Box 
            backgroundColor="#f8fafc" 
            padding="1rem" 
            borderRadius="8px" 
            marginBottom="2rem"
          >
            <Box display="flex" alignItems="center" gap="1rem">
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
              <Box textAlign="right">
                <Box fontSize="1.25rem" fontWeight="bold" color="#059669">
                  AED {Math.round(currentBooking.totalPrice)}
                </Box>
              </Box>
            </Box>
          </Box>
        )}
        
        {/* Step 1: Guest Details */}
        {currentStep === 'details' && (
          <Box>
            <Box marginBottom="2rem">
              <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="1rem">
                <IoPerson color="#059669" />
                <h2 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
                  Guest Information
                </h2>
              </Box>
              
              <Box marginBottom="1rem">
                <Input
                  label="Full Name"
                  value={currentBooking.guestName}
                  onChange={(e) => handleInputChange('guestName', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </Box>
              
              <Box marginBottom="1rem">
                <Input
                  label="Email Address"
                  type="email"
                  value={currentBooking.guestEmail}
                  onChange={(e) => handleInputChange('guestEmail', e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
              </Box>
              
              <Box marginBottom="1rem">
                <Input
                  label="Phone Number (Optional)"
                  type="tel"
                  value={currentBooking.guestPhone || ''}
                  onChange={(e) => handleInputChange('guestPhone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </Box>
              
              <Box marginBottom="1rem">
                <Input
                  label="Special Requests (Optional)"
                  value={currentBooking.specialRequests || ''}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                  placeholder="Any special requests or notes"
                />
              </Box>
            </Box>
            
            <Button
              label={isLoading ? "Sending verification code..." : "Continue to Email Verification"}
              icon={<IoMail />}
              onClick={handleSendOtp}
              variant="promoted"
              size="large"
              disabled={isLoading || !currentBooking.guestName.trim() || !currentBooking.guestEmail.trim()}
              style={{ width: '100%' }}
            />
            
            <Box fontSize="0.75rem" color="#666" textAlign="center" marginTop="1rem">
              We'll send a verification code to your email to confirm your booking
            </Box>
          </Box>
        )}
        
        {/* Step 2: OTP Verification */}
        {currentStep === 'otp' && (
          <Box>
            <Box marginBottom="2rem">
              <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="1rem">
                <IoMail color="#059669" />
                <h2 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
                  Email Verification
                </h2>
              </Box>
              
              <Box 
                backgroundColor="#e6fffa" 
                padding="1rem" 
                borderRadius="8px" 
                marginBottom="1.5rem"
                border="1px solid #81e6d9"
              >
                <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
                  <IoCheckmarkCircle color="#059669" />
                  <Box fontWeight="600" color="#059669">Verification code sent!</Box>
                </Box>
                <Box fontSize="0.875rem" color="#2d3748">
                  We've sent a 6-digit verification code to:
                </Box>
                <Box fontSize="0.875rem" fontWeight="600" color="#2d3748">
                  {currentBooking.guestEmail}
                </Box>
              </Box>
              
              <Box marginBottom="1rem">
                <Input
                  label="Verification Code"
                  value={currentBooking.otpCode}
                  onChange={(e) => handleInputChange('otpCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.5rem' }}
                  required
                />
              </Box>
              
              {countdown > 0 && (
                <Box 
                  display="flex" 
                  alignItems="center" 
                  gap="0.5rem" 
                  fontSize="0.875rem" 
                  color="#666"
                  marginBottom="1rem"
                >
                  <IoTime />
                  Code expires in {formatTime(countdown)}
                </Box>
              )}
            </Box>
            
            <Box marginBottom="1rem">
              <Button
                label={isLoading ? "Verifying..." : "Verify & Continue"}
                icon={<IoCheckmarkCircle />}
                onClick={handleVerifyOtp}
                variant="promoted"
                size="large"
                disabled={isLoading || !currentBooking.otpCode || currentBooking.otpCode.length !== 6}
                style={{ width: '100%' }}
              />
            </Box>
            
            {countdown === 0 && (
              <Box textAlign="center">
                <Button
                  label="Resend Code"
                  onClick={handleResendOtp}
                  variant="normal"
                  disabled={isLoading}
                />
              </Box>
            )}
            
            <Box fontSize="0.75rem" color="#666" textAlign="center" marginTop="1rem">
              Didn't receive the code? Check your spam folder or click resend
            </Box>
          </Box>
        )}
      </Box>
    </>
  )
}

export default BookingConfirmation