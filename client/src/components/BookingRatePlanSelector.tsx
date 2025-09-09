import React from 'react'
import { Box } from '@/components/base/Box'
import SelectionPicker from '@/components/base/SelectionPicker'
import Tab from '@/components/base/Tab'
import { useAppSelector, useAppDispatch } from '@/store'
import { selectRatePlanOption } from '@/store/slices/bookingSlice'
import { 
  IoIosCheckmark, 
  IoIosPricetag, 
  IoIosInformationCircle, 
  IoIosClose,
  IoIosTime,
  IoIosHome,
  IoIosRestaurant,
  IoIosCar,
  IoIosWifi,
  IoIosWater,
  IoIosFitness,
  IoIosCalendar,
  IoIosClock,
  IoIosCard,
  IoIosWarning
} from 'react-icons/io'

interface BookingRatePlanSelectorProps {
  loading?: boolean
  onSelectionChange?: () => void
}

const BookingRatePlanSelector: React.FC<BookingRatePlanSelectorProps> = ({ 
  loading = false,
  onSelectionChange 
}) => {
  const dispatch = useAppDispatch()
  const { bookingOptions, selectedRatePlanOption, calculatingOptions } = useAppSelector(
    (state: any) => state.booking
  )
  
  const [activeTab, setActiveTab] = React.useState('overview')

  // Handle rate plan selection
  const handleRatePlanSelection = (value: string | number | (string | number)[]) => {
    if (!bookingOptions) return
    
    // Handle single selection only (array case shouldn't happen for rate plans)
    const ratePlanOptionId = Array.isArray(value) ? value[0] : value
    
    const selectedOption = bookingOptions.options.find((option: any) => 
      option.ratePlan?.id === ratePlanOptionId || 
      (!option.ratePlan && ratePlanOptionId === 'direct')
    )
    
    if (selectedOption) {
      dispatch(selectRatePlanOption(selectedOption))
      onSelectionChange?.()
    }
  }

  // Helper function to get amenity icon
  const getAmenityIcon = (amenityName: string) => {
    const name = amenityName.toLowerCase()
    if (name.includes('wifi') || name.includes('internet')) return <IoIosWifi size={14} color="#059669" />
    if (name.includes('parking')) return <IoIosCar size={14} color="#059669" />
    if (name.includes('pool') || name.includes('swimming')) return <IoIosWater size={14} color="#059669" />
    if (name.includes('gym') || name.includes('fitness')) return <IoIosFitness size={14} color="#059669" />
    if (name.includes('breakfast') || name.includes('restaurant')) return <IoIosRestaurant size={14} color="#059669" />
    return <IoIosHome size={14} color="#059669" />
  }

  // Render individual rate plan option
  const renderRatePlanCard = (option: any, _isSelected: boolean) => (
    <Box 
      padding="1rem"
      position="relative"
    >
      {/* Header with name and savings */}
      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="0.75rem">
        <Box fontWeight="600" color="#1a202c" fontSize="1rem">
          {option.name}
        </Box>
        {option.savings !== 0 && (
          <Box 
            backgroundColor={option.savings > 0 ? '#059669' : '#f59e0b'} 
            color="white" 
            padding="0.125rem 0.5rem" 
            borderRadius="12px" 
            fontSize="0.75rem"
            fontWeight="600"
          >
            {option.savings > 0 ? `Save AED ${option.savings.toFixed(2)}` : `+AED ${Math.abs(option.savings).toFixed(2)}`}
          </Box>
        )}
      </Box>
      
      {/* Description */}
      {option.description && (
        <Box fontSize="0.875rem" color="#666" marginBottom="0.75rem">
          {option.description}
        </Box>
      )}

      {/* Detailed Cancellation Policy */}
      {option.cancellationPolicy && (
        <Box marginBottom="1rem" padding="0.75rem" backgroundColor="#f8fafc" borderRadius="6px" border="1px solid #e2e8f0">
          <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
            <IoIosCalendar color="#3b82f6" size={16} />
            <Box fontSize="0.875rem" fontWeight="600" color="#374151">
              Cancellation Policy
            </Box>
            <Box 
              fontSize="0.75rem"
              color="white"
              backgroundColor={
                option.cancellationPolicy.type === 'NonRefundable' ? '#ef4444' :
                option.cancellationPolicy.type === 'FullyFlexible' ? '#059669' : '#f59e0b'
              }
              padding="0.125rem 0.5rem"
              borderRadius="10px"
              fontWeight="500"
            >
              {option.cancellationPolicy.type === 'NonRefundable' && 'Non-Refundable'}
              {option.cancellationPolicy.type === 'FullyFlexible' && 'Flexible'}
              {option.cancellationPolicy.type === 'Moderate' && 'Moderate'}
              {option.cancellationPolicy.description && !option.ratePlan && 'Flexible'}
            </Box>
          </Box>
          
          {/* Cancellation details */}
          <Box fontSize="0.8125rem" color="#6b7280" lineHeight="1.4">
            {option.cancellationPolicy.type === 'NonRefundable' && (
              <Box display="flex" alignItems="center" gap="0.5rem">
                <IoIosClose color="#ef4444" size={14} />
                No refund available for cancellations
              </Box>
            )}
            {option.cancellationPolicy.type === 'FullyFlexible' && (
              <Box display="flex" alignItems="center" gap="0.5rem">
                <IoIosCheckmark color="#059669" size={14} />
                Free cancellation until check-in
              </Box>
            )}
            {option.cancellationPolicy.type === 'Moderate' && (
              <Box display="flex" alignItems="center" gap="0.5rem">
                <IoIosTime color="#f59e0b" size={14} />
                Free cancellation up to 48 hours before check-in
              </Box>
            )}
            {option.cancellationPolicy.description && (
              <Box marginTop="0.25rem" display="flex" alignItems="flex-start" gap="0.5rem">
                <IoIosInformationCircle color="#6b7280" size={14} style={{ marginTop: '1px', flexShrink: 0 }} />
                <Box flex="1">{option.cancellationPolicy.description}</Box>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Enhanced Features & Amenities */}
      {option.features && (
        <Box marginBottom="1rem">
          <Box fontSize="0.875rem" fontWeight="600" color="#374151" marginBottom="0.5rem" display="flex" alignItems="center" gap="0.5rem">
            <IoIosCheckmark color="#059669" size={16} />
            What's Included
          </Box>
          
          <Box display="flex" flexDirection="column" gap="0.375rem" fontSize="0.8125rem">
            {option.features.includesBreakfast && (
              <Box display="flex" alignItems="center" gap="0.5rem" color="#059669">
                <IoIosRestaurant size={14} />
                Breakfast included for all guests
              </Box>
            )}
            {option.features.includesParking && (
              <Box display="flex" alignItems="center" gap="0.5rem" color="#059669">
                <IoIosCar size={14} />
                Free parking available
              </Box>
            )}
            {option.features.includedAmenityIds?.length > 0 && (
              <Box display="flex" alignItems="center" gap="0.5rem" color="#059669">
                <IoIosHome size={14} />
                Access to {option.features.includedAmenityIds.length} premium amenities
              </Box>
            )}
            
            {/* Specific amenities if available */}
            {option.ratePlan?.amenities?.slice(0, 3).map((amenity: any, index: number) => (
              <Box key={index} display="flex" alignItems="center" gap="0.5rem" color="#6b7280">
                {getAmenityIcon(amenity.name)}
                {amenity.name}
              </Box>
            ))}
            
            {option.ratePlan?.amenities?.length > 3 && (
              <Box fontSize="0.75rem" color="#9ca3af" marginLeft="1.25rem">
                +{option.ratePlan.amenities.length - 3} more amenities
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Booking Conditions */}
      <Box marginBottom="1rem" padding="0.75rem" backgroundColor="#fefce8" borderRadius="6px" border="1px solid #fde047">
        <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
          <IoIosCard color="#ca8a04" size={16} />
          <Box fontSize="0.875rem" fontWeight="600" color="#713f12">
            Booking Conditions
          </Box>
        </Box>
        
        <Box display="flex" flexDirection="column" gap="0.375rem" fontSize="0.8125rem" color="#854d0e">
          <Box display="flex" alignItems="center" gap="0.5rem">
            <IoIosTime size={14} />
            Minimum stay: {option.minStayNights || 1} night{(option.minStayNights || 1) > 1 ? 's' : ''}
          </Box>
          
          <Box display="flex" alignItems="center" gap="0.5rem">
            <IoIosClock size={14} />
            Check-in: 3:00 PM - 10:00 PM
          </Box>
          
          <Box display="flex" alignItems="center" gap="0.5rem">
            <IoIosClock size={14} />
            Check-out: Before 12:00 PM
          </Box>
          
          {option.requiresDeposit && (
            <Box display="flex" alignItems="center" gap="0.5rem">
              <IoIosWarning size={14} />
              Security deposit may be required
            </Box>
          )}
        </Box>
      </Box>
      
      {/* Pricing */}
      <Box>
        <Box fontSize="1.5rem" fontWeight="bold" color="#059669">
          AED {option.totalPrice.toFixed(2)}
        </Box>
        <Box fontSize="0.875rem" color="#666" marginBottom="0.25rem">
          AED {option.pricePerNight.toFixed(2)} per night
        </Box>
        
        {/* Tax information */}
        <Box fontSize="0.75rem" color="#9ca3af">
          <Box display="flex" alignItems="center" gap="0.25rem">
            <IoIosInformationCircle size={12} />
            Includes all taxes and fees
          </Box>
        </Box>
      </Box>
    </Box>
  )

  // Render price breakdown details
  const renderPriceBreakdown = () => {
    if (!selectedRatePlanOption) return null

    const breakdown = selectedRatePlanOption.priceBreakdown
    
    return (
      <Box padding="1rem" backgroundColor="#f9fafb" borderRadius="8px">
        <Box fontSize="1rem" fontWeight="600" color="#1a202c" marginBottom="1rem" display="flex" alignItems="center" gap="0.5rem">
          <IoIosInformationCircle color="#3b82f6" />
          Price Breakdown
        </Box>
        
        {/* Daily breakdown */}
        <Box marginBottom="1rem">
          <Box fontSize="0.875rem" color="#666" marginBottom="0.5rem">Daily Prices:</Box>
          {breakdown.nightlyPrices.map((night: any, index: number) => {
            const date = new Date(night.date)
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
            const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            
            return (
              <Box key={index} display="flex" justifyContent="space-between" marginBottom="0.25rem" fontSize="0.875rem">
                <Box>
                  {monthDay} ({dayName})
                  {night.isOverride && night.reason && (
                    <Box as="span" color="#f59e0b" fontSize="0.75rem" marginLeft="0.5rem">
                      {night.reason}
                    </Box>
                  )}
                </Box>
                <Box>
                  {selectedRatePlanOption.ratePlan ? (
                    <>
                      <Box as="span" color="#666" textDecoration="line-through" marginRight="0.5rem">
                        AED {night.basePrice.toFixed(2)}
                      </Box>
                      AED {night.finalPrice.toFixed(2)}
                    </>
                  ) : (
                    `AED ${night.basePrice.toFixed(2)}`
                  )}
                </Box>
              </Box>
            )
          })}
        </Box>
        
        {/* Total breakdown */}
        <Box borderTop="1px solid #e5e7eb" paddingTop="0.75rem" fontSize="0.875rem">
          <Box display="flex" justifyContent="space-between" marginBottom="0.25rem">
            <Box color="#666">Subtotal ({breakdown.nights} nights):</Box>
            <Box>AED {breakdown.baseTotal.toFixed(2)}</Box>
          </Box>
          
          {breakdown.ratePlanModifier && (
            <Box display="flex" justifyContent="space-between" marginBottom="0.25rem" color={breakdown.ratePlanModifier.value < 0 ? '#059669' : '#f59e0b'}>
              <Box>{breakdown.ratePlanModifier.description}:</Box>
              <Box>
                {breakdown.ratePlanModifier.value < 0 ? '-' : '+'}AED {Math.abs(breakdown.finalTotal - breakdown.baseTotal).toFixed(2)}
              </Box>
            </Box>
          )}
          
          <Box display="flex" justifyContent="space-between" fontSize="1rem" fontWeight="600" color="#1a202c" borderTop="1px solid #e5e7eb" paddingTop="0.5rem">
            <Box>Total:</Box>
            <Box>AED {breakdown.finalTotal.toFixed(2)}</Box>
          </Box>
        </Box>
      </Box>
    )
  }

  // Loading state
  if (calculatingOptions || loading) {
    return (
      <Box padding="2rem" textAlign="center">
        <Box fontSize="1rem" color="#666">Calculating pricing options...</Box>
      </Box>
    )
  }

  // No options available
  if (!bookingOptions || bookingOptions.options.length === 0) {
    return (
      <Box padding="2rem" textAlign="center">
        <Box fontSize="1rem" color="#666">No pricing options available for selected dates.</Box>
      </Box>
    )
  }

  const tabs = [
    {
      id: 'overview',
      label: 'Rate Options',
      content: (
        <Box>
          <Box marginBottom="1rem" display="flex" alignItems="center" gap="0.5rem">
            <IoIosPricetag color="#3b82f6" />
            <Box fontSize="1rem" fontWeight="600" color="#1a202c">
              Choose Your Rate ({bookingOptions.options.length} available)
            </Box>
          </Box>
          
          <SelectionPicker
            data={bookingOptions.options}
            idAccessor={(option: any) => option.ratePlan?.id || 'direct'}
            value={selectedRatePlanOption?.ratePlan?.id || 'direct'}
            onChange={handleRatePlanSelection}
            renderItem={renderRatePlanCard}
            containerStyles={{ gap: '0.75rem' }}
          />
        </Box>
      )
    },
    {
      id: 'breakdown',
      label: 'Price Details',
      content: renderPriceBreakdown()
    }
  ]

  return (
    <Box>
      <Tab
        items={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </Box>
  )
}

export default BookingRatePlanSelector