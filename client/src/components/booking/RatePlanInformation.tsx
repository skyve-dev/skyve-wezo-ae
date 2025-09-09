import React from 'react';
import { Box } from '@/components/base/Box';
import { 
  IoIosPricetag,
  IoIosCheckmark,
  IoIosClose,
  IoIosTime,
  IoIosCalendar,
  IoIosClock,
  IoIosCard,
  IoIosWarning,
  IoIosInformationCircle,
  IoIosRestaurant,
  IoIosCar,
  IoIosWifi,
  IoIosHome,
  IoIosWater,
  IoIosFitness
} from 'react-icons/io';

interface RatePlanInformationProps {
  booking: any;
  userRole: string;
}

const RatePlanInformation: React.FC<RatePlanInformationProps> = ({ booking, userRole: _userRole }) => {
  // If no rate plan or it's a direct booking, don't show this component
  if (!booking.ratePlan) {
    return null;
  }
  
  const ratePlan = booking.ratePlan;
  
  // Helper function to get amenity icon
  const getAmenityIcon = (amenityName: string) => {
    const name = amenityName.toLowerCase();
    if (name.includes('wifi') || name.includes('internet')) return <IoIosWifi size={14} color="#059669" />;
    if (name.includes('parking')) return <IoIosCar size={14} color="#059669" />;
    if (name.includes('pool') || name.includes('swimming')) return <IoIosWater size={14} color="#059669" />;
    if (name.includes('gym') || name.includes('fitness')) return <IoIosFitness size={14} color="#059669" />;
    if (name.includes('breakfast') || name.includes('restaurant')) return <IoIosRestaurant size={14} color="#059669" />;
    return <IoIosHome size={14} color="#059669" />;
  };

  return (
    <Box
      backgroundColor="white"
      borderRadius="12px"
      padding="1.5rem"
      border="1px solid #e5e7eb"
    >
      {/* Header */}
      <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1.5rem">
        <IoIosPricetag color="#059669" size={20} />
        <Box fontSize="1.125rem" fontWeight="600" color="#111827">
          Rate Plan Details
        </Box>
      </Box>
      
      {/* Rate Plan Name & Description */}
      <Box marginBottom="1.5rem">
        <Box fontSize="1rem" fontWeight="600" color="#1f2937" marginBottom="0.5rem">
          {ratePlan.name}
        </Box>
        {ratePlan.description && (
          <Box fontSize="0.875rem" color="#6b7280" lineHeight="1.5">
            {ratePlan.description}
          </Box>
        )}
      </Box>

      {/* Cancellation Policy */}
      {ratePlan.cancellationPolicy && (
        <Box marginBottom="1.5rem" padding="1rem" backgroundColor="#f8fafc" borderRadius="8px" border="1px solid #e2e8f0">
          <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.75rem">
            <IoIosCalendar color="#3b82f6" size={16} />
            <Box fontSize="0.875rem" fontWeight="600" color="#374151">
              Cancellation Policy
            </Box>
            <Box 
              fontSize="0.75rem"
              color="white"
              backgroundColor={
                ratePlan.cancellationPolicy.type === 'NonRefundable' ? '#ef4444' :
                ratePlan.cancellationPolicy.type === 'FullyFlexible' ? '#059669' : '#f59e0b'
              }
              padding="0.125rem 0.5rem"
              borderRadius="10px"
              fontWeight="500"
            >
              {ratePlan.cancellationPolicy.type === 'NonRefundable' && 'Non-Refundable'}
              {ratePlan.cancellationPolicy.type === 'FullyFlexible' && 'Flexible'}
              {ratePlan.cancellationPolicy.type === 'Moderate' && 'Moderate'}
            </Box>
          </Box>
          
          <Box fontSize="0.8125rem" color="#6b7280" lineHeight="1.4">
            {ratePlan.cancellationPolicy.type === 'NonRefundable' && (
              <Box display="flex" alignItems="center" gap="0.5rem">
                <IoIosClose color="#ef4444" size={14} />
                No refund available for cancellations
              </Box>
            )}
            {ratePlan.cancellationPolicy.type === 'FullyFlexible' && (
              <Box display="flex" alignItems="center" gap="0.5rem">
                <IoIosCheckmark color="#059669" size={14} />
                Free cancellation until check-in
              </Box>
            )}
            {ratePlan.cancellationPolicy.type === 'Moderate' && (
              <Box display="flex" alignItems="center" gap="0.5rem">
                <IoIosTime color="#f59e0b" size={14} />
                Free cancellation up to 48 hours before check-in
              </Box>
            )}
            {ratePlan.cancellationPolicy.description && (
              <Box marginTop="0.5rem" display="flex" alignItems="flex-start" gap="0.5rem">
                <IoIosInformationCircle color="#6b7280" size={14} style={{ marginTop: '1px', flexShrink: 0 }} />
                <Box flex="1">{ratePlan.cancellationPolicy.description}</Box>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Rate Plan Benefits & Features */}
      {ratePlan.features && (
        <Box marginBottom="1.5rem">
          <Box fontSize="0.875rem" fontWeight="600" color="#374151" marginBottom="0.75rem" display="flex" alignItems="center" gap="0.5rem">
            <IoIosCheckmark color="#059669" size={16} />
            Plan Benefits
          </Box>
          
          <Box display="flex" flexDirection="column" gap="0.5rem" fontSize="0.8125rem">
            {ratePlan.features.includesBreakfast && (
              <Box display="flex" alignItems="center" gap="0.5rem" color="#059669">
                <IoIosRestaurant size={14} />
                Complimentary breakfast for all guests
              </Box>
            )}
            {ratePlan.features.includesParking && (
              <Box display="flex" alignItems="center" gap="0.5rem" color="#059669">
                <IoIosCar size={14} />
                Free parking included
              </Box>
            )}
            {ratePlan.features.includedAmenityIds?.length > 0 && (
              <Box display="flex" alignItems="center" gap="0.5rem" color="#059669">
                <IoIosHome size={14} />
                Access to {ratePlan.features.includedAmenityIds.length} premium amenities
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Included Amenities */}
      {ratePlan.amenities && ratePlan.amenities.length > 0 && (
        <Box marginBottom="1.5rem">
          <Box fontSize="0.875rem" fontWeight="600" color="#374151" marginBottom="0.75rem" display="flex" alignItems="center" gap="0.5rem">
            <IoIosHome color="#059669" size={16} />
            Included Amenities ({ratePlan.amenities.length})
          </Box>
          
          <Box display="flex" flexDirection="column" gap="0.375rem" fontSize="0.8125rem">
            {ratePlan.amenities.slice(0, 6).map((amenity: any, index: number) => (
              <Box key={index} display="flex" alignItems="center" gap="0.5rem" color="#6b7280">
                {getAmenityIcon(amenity.name)}
                {amenity.name}
              </Box>
            ))}
            
            {ratePlan.amenities.length > 6 && (
              <Box fontSize="0.75rem" color="#9ca3af" marginLeft="1.25rem">
                +{ratePlan.amenities.length - 6} more amenities included
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Booking Terms & Conditions */}
      <Box padding="0.75rem" backgroundColor="#fefce8" borderRadius="8px" border="1px solid #fde047">
        <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.75rem">
          <IoIosCard color="#ca8a04" size={16} />
          <Box fontSize="0.875rem" fontWeight="600" color="#713f12">
            Booking Terms
          </Box>
        </Box>
        
        <Box display="flex" flexDirection="column" gap="0.375rem" fontSize="0.8125rem" color="#854d0e">
          {ratePlan.minStayNights && (
            <Box display="flex" alignItems="center" gap="0.5rem">
              <IoIosTime size={14} />
              Minimum stay: {ratePlan.minStayNights} night{ratePlan.minStayNights > 1 ? 's' : ''}
            </Box>
          )}
          
          {ratePlan.maxStayNights && (
            <Box display="flex" alignItems="center" gap="0.5rem">
              <IoIosTime size={14} />
              Maximum stay: {ratePlan.maxStayNights} night{ratePlan.maxStayNights > 1 ? 's' : ''}
            </Box>
          )}
          
          {ratePlan.minAdvanceBooking && (
            <Box display="flex" alignItems="center" gap="0.5rem">
              <IoIosClock size={14} />
              Book at least {ratePlan.minAdvanceBooking} days in advance
            </Box>
          )}
          
          {ratePlan.requiresDeposit && (
            <Box display="flex" alignItems="center" gap="0.5rem">
              <IoIosWarning size={14} />
              Security deposit required
            </Box>
          )}
        </Box>
      </Box>

      {/* Rate Plan Pricing Info */}
      {ratePlan.modifierValue && (
        <Box marginTop="1rem" padding="0.75rem" backgroundColor="#f0f9ff" borderRadius="8px" border="1px solid #bfdbfe">
          <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
            <IoIosPricetag color="#3b82f6" size={16} />
            <Box fontSize="0.875rem" fontWeight="600" color="#1e40af">
              Rate Adjustment
            </Box>
          </Box>
          
          <Box fontSize="0.8125rem" color="#1e3a8a">
            {ratePlan.modifierType === 'Percentage' && (
              <Box>
                {ratePlan.modifierValue > 0 ? '+' : ''}{ratePlan.modifierValue}% {ratePlan.modifierValue > 0 ? 'premium' : 'discount'} applied
              </Box>
            )}
            {ratePlan.modifierType === 'Fixed' && (
              <Box>
                {ratePlan.modifierValue > 0 ? '+' : ''}AED {Math.abs(ratePlan.modifierValue)} per night {ratePlan.modifierValue > 0 ? 'premium' : 'discount'}
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default RatePlanInformation;