import React from 'react'
import { Box } from '@/components/base/Box'
import SelectionPicker from '@/components/base/SelectionPicker'
import Tab from '@/components/base/Tab'
import { useAppSelector, useAppDispatch } from '@/store'
import { selectRatePlanOption } from '@/store/slices/bookingSlice'
import { IoIosCheckmark, IoIosPricetag, IoIosInformationCircle } from 'react-icons/io'

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

  // Render individual rate plan option
  const renderRatePlanCard = (option: any, isSelected: boolean) => (
    <Box 
      padding="1rem"
      position="relative"
    >
      {/* Header with name and savings */}
      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="0.5rem">
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
      
      {/* Features */}
      {option.features && (
        <Box display="flex" flexWrap="wrap" gap="0.5rem" marginBottom="0.75rem" fontSize="0.875rem" color="#666">
          {option.features.includedAmenityIds?.length > 0 && (
            <Box display="flex" alignItems="center" gap="0.25rem">
              <IoIosCheckmark color="#059669" size="16px" />
              Premium amenities
            </Box>
          )}
          {option.features.includesBreakfast && (
            <Box display="flex" alignItems="center" gap="0.25rem">
              <IoIosCheckmark color="#059669" size="16px" />
              Breakfast included
            </Box>
          )}
          {option.features.includesParking && (
            <Box display="flex" alignItems="center" gap="0.25rem">
              <IoIosCheckmark color="#059669" size="16px" />
              Free parking
            </Box>
          )}
        </Box>
      )}
      
      {/* Pricing */}
      <Box>
        <Box fontSize="1.5rem" fontWeight="bold" color="#059669">
          AED {option.totalPrice.toFixed(2)}
        </Box>
        <Box fontSize="0.875rem" color="#666">
          AED {option.pricePerNight.toFixed(2)} per night
        </Box>
      </Box>
      
      {/* Cancellation policy badge */}
      {option.cancellationPolicy && (
        <Box 
          position="absolute"
          top="0.5rem"
          right="0.5rem"
          fontSize="0.75rem"
          color="#666"
          backgroundColor="#f3f4f6"
          padding="0.25rem 0.5rem"
          borderRadius="4px"
        >
          {option.cancellationPolicy.type === 'NonRefundable' && 'Non-Refundable'}
          {option.cancellationPolicy.type === 'FullyFlexible' && 'Flexible'}
          {option.cancellationPolicy.type === 'Moderate' && 'Moderate'}
          {option.cancellationPolicy.description && !option.ratePlan && 'Flexible'}
        </Box>
      )}
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