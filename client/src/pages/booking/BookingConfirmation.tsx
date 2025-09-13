import React, { useEffect, useState, useRef } from 'react'
import { useAppShell } from '@/components/base/AppShell'
import { useAppDispatch, useAppSelector } from '@/store'
import { 
  initializeBooking, 
  updateBookingField, 
  sendOtpCode, 
  verifyOtpCode,
  createAuthenticatedBooking,
  setOtpTimer,
  clearError,
  setCurrentStep
} from '@/store/slices/bookingSlice'
import { autoLogin } from '@/store/slices/authSlice'
import { fetchPropertyById } from '@/store/slices/propertySlice'
import { Box } from '@/components/base/Box'
import { Button } from '@/components/base/Button'
import { Input } from '@/components/base/Input'
import { resolvePhotoUrl } from '@/utils/api'
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
  const { user } = useAppSelector((state) => state.auth)
  
  // OTP Timer countdown
  const [countdown, setCountdown] = useState(0)
  
  // Ref to track if we've already auto-populated for this user/booking combination
  const autoPopulatedRef = useRef<string | null>(null)
  
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
  
  // Auto-populate guest information for logged-in users
  useEffect(() => {
    if (user && currentBooking) {
      const firstName = user.firstName?.trim() || ''
      const lastName = user.lastName?.trim() || ''
      
      // Create a unique key for this user/booking combination
      const autoPopulateKey = `${user.id}_${currentBooking.propertyId}_${currentBooking.checkInDate}_${currentBooking.checkOutDate}`
      
      // Only auto-populate once per user/booking combination and only if fields are truly empty
      if (autoPopulatedRef.current !== autoPopulateKey &&
          (!currentBooking.guestFirstName || !currentBooking.guestLastName || !currentBooking.guestEmail)) {
        
        autoPopulatedRef.current = autoPopulateKey
        
        dispatch(updateBookingField({
          guestFirstName: firstName,
          guestLastName: lastName,
          guestEmail: user.email,
          // Note: User interface doesn't have phoneNumber field, so only preserve existing value
          guestPhone: currentBooking.guestPhone || ''
        }))
      }
    }
  }, [user, currentBooking?.propertyId, currentBooking?.checkInDate, currentBooking?.checkOutDate, dispatch])
  
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
    
    if (!currentBooking?.guestFirstName.trim() || !currentBooking?.guestLastName.trim()) {
      addToast('Please enter your first and last name', { 
        type: 'warning', 
        autoHide: true, 
        duration: 4000 
      })
      return
    }
    
    // If user is logged in, skip OTP verification and proceed directly to booking creation
    if (user) {
      await handleDirectBookingForLoggedInUser()
    } else {
      // For guest users, continue with OTP verification
      await dispatch(sendOtpCode(currentBooking.guestEmail))
    }
  }
  
  const handleDirectBookingForLoggedInUser = async () => {
    if (!currentBooking) return
    
    try {
      // Create booking directly with authenticated user - no OTP needed
      const bookingData = {
        ...currentBooking,
        // Combine first and last name for backend compatibility
        guestName: `${currentBooking.guestFirstName.trim()} ${currentBooking.guestLastName.trim()}`.trim()
      }
      
      const result = await dispatch(createAuthenticatedBooking(bookingData))
      
      console.log('🔍 DEBUG: Full result object:', result)
      console.log('🔍 DEBUG: result.meta:', result.meta)
      console.log('🔍 DEBUG: result.payload:', result.payload)
      
      if (result.meta.requestStatus === 'fulfilled') {
        const response = (result.payload as any)
        
        console.log('🔍 DEBUG: Extracted response:', response)
        console.log('🔍 DEBUG: response.bookingId:', response?.bookingId)
        console.log('🔍 DEBUG: response.bookingExpiresAt:', response?.bookingExpiresAt)
        
        // Update user profile if names have changed
        if (user && (user.firstName !== currentBooking.guestFirstName.trim() || 
            user.lastName !== currentBooking.guestLastName.trim())) {
          addToast('Profile updated with your booking information', { 
            type: 'info', 
            autoHide: true, 
            duration: 3000 
          })
        }
        
        if (response?.bookingId) {
          addToast('Booking created successfully! Proceeding to payment...', { 
            type: 'success', 
            autoHide: true, 
            duration: 2000 
          })
          
          // Navigate to payment
          setTimeout(() => {
            navigateTo('booking-payment', {
              bookingId: response.bookingId,
              bookingExpiresAt: response.bookingExpiresAt,
              ...params
            })
          }, 1500)
        } else {
          addToast('Booking creation failed. Please try again.', { 
            type: 'error', 
            autoHide: true, 
            duration: 5000 
          })
        }
      }
    } catch (error) {
      addToast('Failed to create booking. Please try again.', { 
        type: 'error', 
        autoHide: true, 
        duration: 5000 
      })
    }
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
      // Debug: Log the full response


      
      // Check if account was auto-created and dispatch auto-login
      const response = (result.payload as any)?.data || (result.payload as any)


      
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
                  backgroundImage={`url(${resolvePhotoUrl(currentProperty.photos[0].url)})`}
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
              
              {/* Visual indicator when using account information */}
              {user && (
                <Box 
                  backgroundColor="#e6fffa" 
                  padding="0.75rem" 
                  borderRadius="8px" 
                  marginBottom="1rem"
                  border="1px solid #81e6d9"
                >
                  <Box display="flex" alignItems="center" gap="0.5rem" fontSize="0.875rem" color="#059669" fontWeight="600">
                    <IoCheckmarkCircle />
                    Using your account information
                  </Box>
                </Box>
              )}
              
              <Box marginBottom="1rem">
                <Input
                  label="First Name"
                  value={currentBooking.guestFirstName}
                  onChange={(e) => handleInputChange('guestFirstName', e.target.value)}
                  placeholder="Enter your first name"
                  required
                />
                {user && (
                  <Box fontSize="0.75rem" color="#6b7280" marginTop="0.25rem">
                    Auto-filled from your account • You can edit this if needed
                  </Box>
                )}
              </Box>
              
              <Box marginBottom="1rem">
                <Input
                  label="Last Name"
                  value={currentBooking.guestLastName}
                  onChange={(e) => handleInputChange('guestLastName', e.target.value)}
                  placeholder="Enter your last name"
                  required
                />
                {user && (
                  <Box fontSize="0.75rem" color="#6b7280" marginTop="0.25rem">
                    Auto-filled from your account • You can edit this if needed
                  </Box>
                )}
              </Box>
              
              <Box marginBottom="1rem">
                <Input
                  label="Email Address"
                  type="email"
                  value={currentBooking.guestEmail}
                  onChange={(e) => handleInputChange('guestEmail', e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={!!user}
                  style={user ? { 
                    backgroundColor: '#f3f4f6',
                    cursor: 'not-allowed'
                  } : undefined}
                />
                {user && (
                  <Box fontSize="0.75rem" color="#6b7280" marginTop="0.25rem">
                    This information is automatically filled from your account
                  </Box>
                )}
              </Box>
              
              <Box marginBottom="1rem">
                <Input
                  label="Phone Number (Optional)"
                  type="tel"
                  value={currentBooking.guestPhone || ''}
                  onChange={(e) => handleInputChange('guestPhone', e.target.value)}
                  placeholder={user ? "Enter your phone number" : "Enter your phone number"}
                />
                {user && (
                  <Box fontSize="0.75rem" color="#6b7280" marginTop="0.25rem">
                    You can add or update your phone number here
                  </Box>
                )}
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
              label={
                isLoading 
                  ? (user ? "Creating booking..." : "Sending verification code...") 
                  : (user ? "Proceed to Payment" : "Continue to Email Verification")
              }
              icon={user ? <IoCheckmarkCircle /> : <IoMail />}
              onClick={handleSendOtp}
              variant="promoted"
              size="large"
              disabled={isLoading || !currentBooking.guestFirstName.trim() || !currentBooking.guestLastName.trim() || !currentBooking.guestEmail.trim()}
              style={{ width: '100%' }}
            />
            
            <Box fontSize="0.75rem" color="#666" textAlign="center" marginTop="1rem">
              {user 
                ? "You're logged in, so we'll create your booking and proceed directly to payment"
                : "We'll send a verification code to your email to confirm your booking"
              }
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