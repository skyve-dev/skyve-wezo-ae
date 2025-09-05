import React from 'react'
import { 
  IoIosCheckmarkCircle,
  IoIosGift,
  IoIosStar
} from 'react-icons/io'
import { Box } from './base/Box'
import { type RatePlan } from '@/store/slices/ratePlanSlice'
import { type BookingCriteria } from './RatePlanSelector'


interface RatePlanCardProps {
  ratePlan: RatePlan
  isSelected: boolean
  onSelect: () => void
  bookingCriteria: BookingCriteria
  basePrice: number
  nights: number
}

const RatePlanCard: React.FC<RatePlanCardProps> = ({
  ratePlan,
  isSelected,
  onSelect,
  bookingCriteria: _bookingCriteria,
  basePrice,
  nights
}) => {

  // Since only qualified rate plans are shown, we don't need eligibility checking
  // All rate plans shown are eligible

  // Calculate pricing with rate plan modifier
  const calculatePricing = () => {
    // basePrice is now the actual total from calendar (not per-night)
    const totalBasePrice = basePrice
    let modifiedPrice = totalBasePrice
    let discount = 0

    if (ratePlan.priceModifierType === 'Percentage') {
      discount = (totalBasePrice * Math.abs(ratePlan.priceModifierValue)) / 100
      modifiedPrice = totalBasePrice * (1 + ratePlan.priceModifierValue / 100)
    } else if (ratePlan.priceModifierType === 'FixedAmount') {
      discount = Math.abs(ratePlan.priceModifierValue) * nights
      modifiedPrice = totalBasePrice + (ratePlan.priceModifierValue * nights)
    }

    const savings = ratePlan.priceModifierValue < 0 ? discount : 0
    const surcharge = ratePlan.priceModifierValue > 0 ? discount : 0

    return {
      totalBasePrice,
      modifiedPrice,
      savings,
      surcharge,
      discount
    }
  }

  // Format price modifier display
  const formatPriceModifier = () => {
    if (ratePlan.priceModifierType === 'Percentage') {
      return `${Math.abs(ratePlan.priceModifierValue)}%`
    } else {
      return `AED ${Math.abs(ratePlan.priceModifierValue)}`
    }
  }

  // Get cancellation policy description
  const getCancellationDescription = () => {
    if (!ratePlan.cancellationPolicy) return 'Standard policy'
    
    const policy = ratePlan.cancellationPolicy
    switch (policy.type) {
      case 'FullyFlexible':
        return `Free cancellation up to ${policy.freeCancellationDays} days before`
      case 'Moderate':
        return `Flexible - ${policy.partialRefundDays} day partial refund`
      case 'NonRefundable':
        return 'Non-refundable (best price)'
      default:
        return 'Standard policy'
    }
  }

  // Since only qualified rate plans are shown, all cards are eligible and clickable
  const isEligible = true
  const pricing = calculatePricing()
  const hasDiscount = ratePlan.priceModifierValue < 0

  return (
    <Box
      border={isSelected ? "2px solid #3182ce" : "1px solid #e2e8f0"}
      borderRadius="6px"
      padding="0.75rem"
      backgroundColor="white"
      cursor={isEligible ? "pointer" : "not-allowed"}
      transition="all 0.2s"
      position="relative"
      onClick={isEligible ? onSelect : undefined}
      style={{
        flexGrow : 1,
        boxShadow: isSelected ? '0 2px 8px rgba(49, 130, 206, 0.15)' : 'none',
        opacity: isEligible ? 1 : 0.6
      }}
    >
      {/* Selection Badge */}
      {isSelected && (
        <Box
          position="absolute"
          top="-1px"
          right="8px"
          backgroundColor="#3182ce"
          color="white"
          padding="0.125rem 0.5rem"
          borderRadius="0 0 6px 6px"
          fontSize="0.625rem"
          fontWeight="600"
          display="flex"
          alignItems="center"
          gap="0.125rem"
        >
          <IoIosCheckmarkCircle size={12} />
          SELECTED
        </Box>
      )}

      {/* No "Almost There" badge needed since only qualified plans are shown */}

      {/* Main Content */}
      <Box>
        {/* Header with Title and Value Proposition */}
        <Box marginBottom="0.75rem">
          <Box display="flex" alignItems="start" justifyContent="space-between" marginBottom="0.375rem">
            <Box flex="1">
              <h4 style={{ 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                color: '#1a202c',
                margin: '0 0 0.125rem 0'
              }}>
                {ratePlan.name}
              </h4>
              {ratePlan.description && (
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '0.75rem',
                  margin: 0,
                  lineHeight: '1.3'
                }}>
                  {ratePlan.description}
                </p>
              )}
            </Box>
            
            {/* Compact Savings/Surcharge Display */}
            {ratePlan.priceModifierValue !== 0 && (
              <Box 
                textAlign="center"
                backgroundColor={hasDiscount ? "#dcfdf7" : "#fef3cd"}
                padding="0.25rem 0.375rem"
                borderRadius="4px"
                minWidth="60px"
              >
                <Box 
                  fontSize="0.875rem" 
                  fontWeight="600" 
                  color={hasDiscount ? "#059669" : "#d97706"} 
                  marginBottom="0.0625rem"
                >
                  {formatPriceModifier()} {hasDiscount ? 'OFF' : 'PREMIUM'}
                </Box>
                {(pricing.savings > 0 || pricing.surcharge > 0) && (
                  <Box fontSize="0.625rem" fontWeight="600" color={hasDiscount ? "#047857" : "#92400e"}>
                    {hasDiscount ? 'Save' : 'Extra'} AED {Math.round(hasDiscount ? pricing.savings : pricing.surcharge)}
                  </Box>
                )}
              </Box>
            )}
          </Box>

          {/* Benefits Row */}
          <Box display="flex" flexWrap="wrap" gap="0.25rem">
            {hasDiscount && (
              <Box
                display="flex"
                alignItems="center"
                gap="0.125rem"
                backgroundColor="#fef3c7"
                color="#92400e"
                padding="0.0625rem 0.375rem"
                borderRadius="8px"
                fontSize="0.625rem"
                fontWeight="600"
              >
                <IoIosStar size={10} />
                Best Value
              </Box>
            )}
            
            {ratePlan.cancellationPolicy?.type === 'FullyFlexible' && (
              <Box
                display="flex"
                alignItems="center"
                gap="0.125rem"
                backgroundColor="#dbeafe"
                color="#1e40af"
                padding="0.0625rem 0.375rem"
                borderRadius="8px"
                fontSize="0.625rem"
                fontWeight="600"
              >
                <IoIosCheckmarkCircle size={10} />
                Flexible
              </Box>
            )}
            
            {ratePlan.features?.includedAmenityIds && ratePlan.features.includedAmenityIds.length > 0 && (
              <Box
                display="flex"
                alignItems="center"
                gap="0.125rem"
                backgroundColor="#f3e8ff"
                color="#6b21a8"
                padding="0.0625rem 0.375rem"
                borderRadius="8px"
                fontSize="0.625rem"
                fontWeight="600"
              >
                <IoIosGift size={10} />
                {ratePlan.features.includedAmenityIds.length} Perks
              </Box>
            )}
          </Box>
        </Box>

        {/* All shown rate plans are qualified - show eligible state */}
        <Box>
          {/* Price Breakdown */}
          <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="0.5rem">
            <Box>
              <Box fontSize="0.625rem" color="#6b7280">
                Standard Rate
              </Box>
              <Box fontSize="0.75rem" color="#9ca3af" style={{ textDecoration: 'line-through' }}>
                AED {Math.round(pricing.totalBasePrice)}
              </Box>
            </Box>
            <Box textAlign="right">
              <Box fontSize="0.625rem" color="#059669" fontWeight="600">
                Your Price
              </Box>
              <Box fontSize="1.125rem" fontWeight="700" color="#059669">
                AED {Math.round(pricing.modifiedPrice)}
              </Box>
            </Box>
          </Box>
          
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="center"
            backgroundColor="#f0fdf4"
            padding="0.375rem"
            borderRadius="4px"
            gap="0.25rem"
            marginBottom="0.5rem"
          >
            <IoIosCheckmarkCircle style={{ color: '#059669', fontSize: '14px' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#059669' }}>
              You qualify for this rate!
            </span>
          </Box>

          {/* What's Included */}
          <Box fontSize="0.625rem" color="#6b7280" marginBottom="0.25rem">
            Includes:
          </Box>
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap="0.125rem">
            <Box display="flex" alignItems="center" gap="0.25rem">
              <IoIosCheckmarkCircle style={{ color: '#10b981', fontSize: '12px' }} />
              <span style={{ fontSize: '0.625rem', color: '#374151' }}>
                {getCancellationDescription()}
              </span>
            </Box>
            {ratePlan.minStay && (
              <Box display="flex" alignItems="center" gap="0.25rem">
                <IoIosCheckmarkCircle style={{ color: '#10b981', fontSize: '12px' }} />
                <span style={{ fontSize: '0.625rem', color: '#374151' }}>
                  Perfect for {ratePlan.minStay}+ nights
                </span>
              </Box>
            )}
            {ratePlan.minAdvanceBooking && (
              <Box display="flex" alignItems="center" gap="0.25rem">
                <IoIosCheckmarkCircle style={{ color: '#10b981', fontSize: '12px' }} />
                <span style={{ fontSize: '0.625rem', color: '#374151' }}>
                  Early bird rewards
                </span>
              </Box>
            )}
            {ratePlan.features?.includedAmenityIds && ratePlan.features.includedAmenityIds.length > 0 && (
              <Box display="flex" alignItems="center" gap="0.25rem">
                <IoIosCheckmarkCircle style={{ color: '#10b981', fontSize: '12px' }} />
                <span style={{ fontSize: '0.625rem', color: '#374151' }}>
                  {ratePlan.features.includedAmenityIds.length} amenities
                </span>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default RatePlanCard