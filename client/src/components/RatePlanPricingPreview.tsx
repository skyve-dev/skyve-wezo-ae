import React from 'react'
import { IoIosCalculator, IoIosTrendingUp, IoIosTrendingDown, IoIosCash, IoIosInformationCircle } from 'react-icons/io'
import { Box } from './base/Box'
import type { RatePlan } from '@/store/slices/ratePlanSlice'
import type { Property } from '@/types/property'

interface RatePlanPricingPreviewProps {
  /**
   * Current rate plan form data
   */
  ratePlan: RatePlan | null
  
  /**
   * Property with base pricing
   */
  property: Property | null
}

/**
 * RatePlan Pricing Preview Component
 * 
 * Shows calculated final prices based on property's base PropertyPricing
 * and rate plan's price modifiers (Percentage or FixedAmount).
 * 
 * Features:
 * - Weekly price breakdown with modifiers applied
 * - Visual indication of price changes (increase/decrease)
 * - Currency formatting with AED
 * - Savings/surcharge calculations
 * - Missing base pricing warning
 * 
 * @example
 * ```tsx
 * <RatePlanPricingPreview
 *   ratePlan={currentForm}
 *   property={currentProperty}
 * />
 * ```
 */
const RatePlanPricingPreview: React.FC<RatePlanPricingPreviewProps> = ({
  ratePlan,
  property
}) => {
  // Get base pricing from property
  const basePricing = property?.pricing
  
  if (!ratePlan || !property) {
    return (
      <Box
        padding="1.5rem"
        backgroundColor="#f9fafb"
        borderRadius="12px"
        border="1px solid #e5e7eb"
        textAlign="center"
      >
        <Box
          fontSize="0.9375rem"
          color="#6b7280"
        >
          Select a property and configure the rate plan to see pricing preview
        </Box>
      </Box>
    )
  }
  
  if (!basePricing) {
    return (
      <Box
        padding="1.5rem"
        backgroundColor="#fef3c7"
        borderRadius="12px"
        border="1px solid #fbbf24"
      >
        <Box display="flex" alignItems="start" gap="0.75rem">
          <IoIosInformationCircle 
            color="#f59e0b" 
            style={{ fontSize: '1.25rem', flexShrink: 0, marginTop: '0.125rem' }} 
          />
          <Box>
            <Box
              fontSize="0.9375rem"
              fontWeight="600"
              color="#92400e"
              marginBottom="0.5rem"
            >
              No Base Pricing Configured
            </Box>
            <Box
              fontSize="0.875rem"
              color="#a16207"
              lineHeight="1.4"
            >
              This property doesn't have base weekly pricing set up. 
              Configure the property's pricing first to see the rate plan preview.
            </Box>
          </Box>
        </Box>
      </Box>
    )
  }
  
  // Calculate modified prices for each day
  const calculateModifiedPrice = (basePrice: number): number => {
    if (ratePlan.priceModifierType === 'Percentage') {
      return basePrice + (basePrice * ratePlan.priceModifierValue / 100)
    } else if (ratePlan.priceModifierType === 'FixedAmount') {
      return basePrice + ratePlan.priceModifierValue
    }
    return basePrice
  }
  
  // Days of the week with base prices
  const weeklyPrices = [
    { day: 'Sunday', basePrice: parseFloat(basePricing.priceSunday.toString()) },
    { day: 'Monday', basePrice: parseFloat(basePricing.priceMonday.toString()) },
    { day: 'Tuesday', basePrice: parseFloat(basePricing.priceTuesday.toString()) },
    { day: 'Wednesday', basePrice: parseFloat(basePricing.priceWednesday.toString()) },
    { day: 'Thursday', basePrice: parseFloat(basePricing.priceThursday.toString()) },
    { day: 'Friday', basePrice: parseFloat(basePricing.priceFriday.toString()) },
    { day: 'Saturday', basePrice: parseFloat(basePricing.priceSaturday.toString()) }
  ]
  
  // Calculate modified prices and totals
  const modifiedPrices = weeklyPrices.map(({ day, basePrice }) => {
    const modifiedPrice = calculateModifiedPrice(basePrice)
    const difference = modifiedPrice - basePrice
    
    return {
      day,
      basePrice,
      modifiedPrice,
      difference,
      isIncrease: difference > 0,
      isDecrease: difference < 0
    }
  })
  
  const totalBasePrices = weeklyPrices.reduce((sum, { basePrice }) => sum + basePrice, 0)
  const totalModifiedPrices = modifiedPrices.reduce((sum, { modifiedPrice }) => sum + modifiedPrice, 0)
  const totalDifference = totalModifiedPrices - totalBasePrices
  
  // Format currency
  const formatPrice = (price: number): string => {
    return `AED ${price.toLocaleString('en-AE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }
  
  // Get modifier description
  const getModifierDescription = (): string => {
    if (ratePlan.priceModifierType === 'Percentage') {
      const sign = ratePlan.priceModifierValue >= 0 ? '+' : ''
      return `${sign}${ratePlan.priceModifierValue}% modifier`
    } else if (ratePlan.priceModifierType === 'FixedAmount') {
      const sign = ratePlan.priceModifierValue >= 0 ? '+' : ''
      return `${sign}${formatPrice(ratePlan.priceModifierValue)} modifier`
    }
    return 'No modifier'
  }
  
  return (
    <Box display="flex" flexDirection="column" gap="1.5rem">
      {/* Header */}
      <Box>
        <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="0.5rem">
          <IoIosCalculator color="#059669" style={{ fontSize: '1.25rem' }} />
          <Box
            fontSize="1rem"
            fontWeight="600"
            color="#374151"
          >
            Pricing Preview
          </Box>
        </Box>
        
        <Box
          fontSize="0.875rem"
          color="#6b7280"
        >
          Final guest prices with {getModifierDescription()} applied to base property pricing
        </Box>
      </Box>
      
      {/* Weekly Price Breakdown */}
      <Box
        padding="1.5rem"
        backgroundColor="white"
        borderRadius="12px"
        border="1px solid #e5e7eb"
        boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
      >
        <Box
          fontSize="0.9375rem"
          fontWeight="600"
          color="#374151"
          marginBottom="1rem"
        >
          Weekly Price Breakdown
        </Box>
        
        <Box display="flex" flexDirection="column" gap="0.75rem">
          {modifiedPrices.map(({ day, basePrice, modifiedPrice, difference, isIncrease, isDecrease }) => (
            <Box
              key={day}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              padding="0.75rem"
              backgroundColor={isIncrease ? '#fef3f2' : isDecrease ? '#f0fdf4' : '#f9fafb'}
              borderRadius="8px"
              border={`1px solid ${isIncrease ? '#fecaca' : isDecrease ? '#bbf7d0' : '#e5e7eb'}`}
            >
              {/* Day name */}
              <Box
                fontSize="0.875rem"
                fontWeight="500"
                color="#374151"
                minWidth="80px"
              >
                {day}
              </Box>
              
              {/* Base price */}
              <Box display="flex" alignItems="center" gap="0.5rem" fontSize="0.8125rem" color="#6b7280">
                <span>Base:</span>
                <span>{formatPrice(basePrice)}</span>
              </Box>
              
              {/* Arrow and difference */}
              {difference !== 0 && (
                <Box display="flex" alignItems="center" gap="0.25rem">
                  {isIncrease ? (
                    <IoIosTrendingUp color="#dc2626" style={{ fontSize: '1rem' }} />
                  ) : (
                    <IoIosTrendingDown color="#059669" style={{ fontSize: '1rem' }} />
                  )}
                  <Box
                    fontSize="0.75rem"
                    fontWeight="500"
                    color={isIncrease ? '#dc2626' : '#059669'}
                  >
                    {isIncrease ? '+' : ''}{formatPrice(Math.abs(difference))}
                  </Box>
                </Box>
              )}
              
              {/* Final price */}
              <Box
                fontSize="0.9375rem"
                fontWeight="600"
                color={isIncrease ? '#dc2626' : isDecrease ? '#059669' : '#374151'}
                minWidth="100px"
                textAlign="right"
              >
                {formatPrice(modifiedPrice)}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
      
      {/* Total Summary */}
      <Box
        padding="1.5rem"
        backgroundColor={totalDifference > 0 ? '#fef2f2' : totalDifference < 0 ? '#f0fdf4' : '#f9fafb'}
        borderRadius="12px"
        border={`2px solid ${totalDifference > 0 ? '#fecaca' : totalDifference < 0 ? '#bbf7d0' : '#e5e7eb'}`}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom="1rem">
          <Box display="flex" alignItems="center" gap="0.75rem">
            <IoIosCash 
              color={totalDifference > 0 ? '#dc2626' : totalDifference < 0 ? '#059669' : '#6b7280'} 
              style={{ fontSize: '1.25rem' }} 
            />
            <Box
              fontSize="1rem"
              fontWeight="600"
              color="#374151"
            >
              Weekly Total
            </Box>
          </Box>
          
          {totalDifference !== 0 && (
            <Box display="flex" alignItems="center" gap="0.5rem">
              {totalDifference > 0 ? (
                <IoIosTrendingUp color="#dc2626" style={{ fontSize: '1.125rem' }} />
              ) : (
                <IoIosTrendingDown color="#059669" style={{ fontSize: '1.125rem' }} />
              )}
              <Box
                fontSize="0.875rem"
                fontWeight="600"
                color={totalDifference > 0 ? '#dc2626' : '#059669'}
              >
                {totalDifference > 0 ? 'Surcharge' : 'Savings'}: {formatPrice(Math.abs(totalDifference))}
              </Box>
            </Box>
          )}
        </Box>
        
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="baseline" gap="0.5rem">
            <Box fontSize="0.875rem" color="#6b7280">Base weekly total:</Box>
            <Box fontSize="0.875rem" fontWeight="500" color="#374151">
              {formatPrice(totalBasePrices)}
            </Box>
          </Box>
          
          <Box display="flex" alignItems="baseline" gap="0.5rem">
            <Box fontSize="0.875rem" color="#6b7280">Rate plan total:</Box>
            <Box
              fontSize="1.125rem"
              fontWeight="700"
              color={totalDifference > 0 ? '#dc2626' : totalDifference < 0 ? '#059669' : '#374151'}
            >
              {formatPrice(totalModifiedPrices)}
            </Box>
          </Box>
        </Box>
      </Box>
      
      {/* Help Text */}
      <Box
        padding="1rem"
        backgroundColor="#eff6ff"
        borderRadius="8px"
        border="1px solid #bfdbfe"
      >
        <Box
          fontSize="0.875rem"
          color="#1e40af"
          lineHeight="1.4"
        >
          <Box fontWeight="600" marginBottom="0.25rem">💡 Pricing Tips:</Box>
          • These are the final prices guests will see during booking<br/>
          • Percentage modifiers adjust each day proportionally to its base price<br/>
          • Fixed amount modifiers add/subtract the same amount to all days<br/>
          • Consider market rates and competitor pricing when setting modifiers
        </Box>
      </Box>
    </Box>
  )
}

export default RatePlanPricingPreview