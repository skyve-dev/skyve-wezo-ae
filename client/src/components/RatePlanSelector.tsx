import React, { useEffect } from 'react'
import { 
  IoIosPricetags, 
  IoIosInformationCircle 
} from 'react-icons/io'
import { Box } from './base/Box'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchPublicRatePlans, type RatePlan } from '@/store/slices/ratePlanSlice'
import RatePlanCard from './RatePlanCard'

export interface BookingCriteria {
  checkInDate: Date | null
  checkOutDate: Date | null
  guestCount: number
  isHalfDay: boolean
}

export interface RatePlanSelectorProps {
  propertyId: string
  selectedRatePlan: RatePlan | null
  onRatePlanChange: (ratePlan: RatePlan | null) => void
  bookingCriteria: BookingCriteria
  basePrice?: number
  propertyStatus?: string // Added to determine if property is live or draft
}

const RatePlanSelector: React.FC<RatePlanSelectorProps> = ({
  propertyId,
  selectedRatePlan,
  onRatePlanChange,
  bookingCriteria,
  basePrice = 0,
  propertyStatus = 'Live'
}) => {
  const dispatch = useAppDispatch()
  const { ratePlans, loading, error } = useAppSelector((state) => state.ratePlan)
  
  // Load public rate plans for this property
  useEffect(() => {
    if (propertyId) {
      dispatch(fetchPublicRatePlans(propertyId))
    }
  }, [dispatch, propertyId])

  // Calculate nights for pricing
  const calculateNights = (): number => {
    if (!bookingCriteria.checkInDate || !bookingCriteria.checkOutDate) return 1
    if (bookingCriteria.isHalfDay) return 0.5
    
    const diffTime = bookingCriteria.checkOutDate.getTime() - bookingCriteria.checkInDate.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const nights = calculateNights()

  // Check if we have complete dates first
  const hasCompleteDates = bookingCriteria.isHalfDay 
    ? bookingCriteria.checkInDate
    : (bookingCriteria.checkInDate && bookingCriteria.checkOutDate)

  // Filter rate plans - only show qualified ones when dates are selected
  const availableRatePlans = (() => {
    if (!hasCompleteDates) {
      // No dates selected - don't show any rate plans
      return []
    }

    // Filter for qualified rate plans only
    return ratePlans
      .filter(plan => {
        if (!plan.isActive) return false
        
        // Check stay length
        const nights = bookingCriteria.isHalfDay ? 0.5 : 
          bookingCriteria.checkOutDate && bookingCriteria.checkInDate 
            ? Math.ceil((bookingCriteria.checkOutDate.getTime() - bookingCriteria.checkInDate.getTime()) / (1000 * 60 * 60 * 24))
            : 1
        if (plan.minStay && nights < plan.minStay) return false
        if (plan.maxStay && nights > plan.maxStay) return false
        
        // Check guest count
        if (plan.minGuests && bookingCriteria.guestCount < plan.minGuests) return false
        if (plan.maxGuests && bookingCriteria.guestCount > plan.maxGuests) return false
        
        // Check advance booking
        if (plan.minAdvanceBooking && bookingCriteria.checkInDate) {
          const daysAhead = Math.ceil((bookingCriteria.checkInDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          if (daysAhead < plan.minAdvanceBooking) return false
        }
        
        return true
      })
      .sort((a, b) => a.priority - b.priority)
  })()

  // Handle rate plan selection
  const handleRatePlanSelect = (ratePlan: RatePlan) => {
    if (selectedRatePlan?.id === ratePlan.id) {
      // Deselect if clicking the same rate plan
      onRatePlanChange(null)
    } else {
      onRatePlanChange(ratePlan)
    }
  }

  if (loading) {
    return (
      <Box 
        backgroundColor="white"
        borderRadius="12px"
        padding="1.5rem"
        marginBottom="2rem"
        border="1px solid #e2e8f0"
      >
        <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1.5rem">
          <IoIosPricetags style={{ color: '#3182ce', fontSize: '1.25rem' }} />
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: '#1a202c',
            margin: 0 
          }}>
            Choose Your Rate Plan
          </h3>
        </Box>
        
        {/* Loading skeleton */}
        <Box display="flex" flexDirection="column" gap="1rem">
          {[1, 2, 3].map(i => (
            <Box
              key={i}
              border="1px solid #e2e8f0"
              borderRadius="12px"
              padding="1.5rem"
              backgroundColor="#f9fafb"
            >
              <Box display="flex" justifyContent="space-between" marginBottom="1rem">
                <Box width="200px" height="20px" backgroundColor="#e2e8f0" borderRadius="4px" />
                <Box width="80px" height="32px" backgroundColor="#e2e8f0" borderRadius="8px" />
              </Box>
              <Box width="100%" height="60px" backgroundColor="#e2e8f0" borderRadius="8px" marginBottom="1rem" />
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem">
                <Box width="100%" height="40px" backgroundColor="#e2e8f0" borderRadius="4px" />
                <Box width="100%" height="40px" backgroundColor="#e2e8f0" borderRadius="4px" />
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    )
  }

  if (error) {
    return (
      <Box 
        backgroundColor="#fef2f2"
        borderRadius="12px"
        padding="1.5rem"
        marginBottom="2rem"
        border="1px solid #fecaca"
      >
        <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1rem">
          <IoIosInformationCircle style={{ color: '#dc2626', fontSize: '1.25rem' }} />
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            color: '#dc2626',
            margin: 0 
          }}>
            Unable to Load Rate Plans
          </h3>
        </Box>
        <p style={{ 
          color: '#7f1d1d', 
          fontSize: '0.875rem',
          margin: 0
        }}>
          {error}. Using standard pricing for your booking.
        </p>
      </Box>
    )
  }

  // If no available rate plans, return empty (no UI shown)
  if (availableRatePlans.length === 0) {
    return null
  }

  return (
    <Box marginBottom="1rem">
      <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.75rem">
        <IoIosPricetags style={{ color: '#3182ce', fontSize: '1rem' }} />
        <h3 style={{ 
          fontSize: '1rem', 
          fontWeight: '600', 
          color: '#1a202c',
          margin: 0 
        }}>
          {propertyStatus === 'Live' ? 'Choose Your Rate Plan' : 'Rate Plan Pricing Simulation'}
        </h3>
      </Box>
      
      {propertyStatus !== 'Live' && (
        <Box
          backgroundColor="#fef3cd"
          color="#92400e"
          padding="0.5rem 0.75rem"
          borderRadius="6px"
          fontSize="0.75rem"
          marginBottom="1rem"
          display="flex"
          alignItems="center"
          gap="0.375rem"
        >
          <span>🧮</span>
          <span>
            <strong>Pricing Simulation:</strong> This property is in draft status. 
            Rate plans show pricing calculations only.
          </span>
        </Box>
      )}
      
      {/* Rate Plan Cards */}
      <Box display="flex" flexWrap={'wrap'} flexDirection="row" gap="0.75rem">
        {availableRatePlans.map(ratePlan => (
          <RatePlanCard
            key={ratePlan.id}
            ratePlan={ratePlan}
            isSelected={selectedRatePlan?.id === ratePlan.id}
            onSelect={() => handleRatePlanSelect(ratePlan)}
            bookingCriteria={bookingCriteria}
            basePrice={basePrice}
            nights={nights}
          />
        ))}
      </Box>
    </Box>
  )
}

export default RatePlanSelector