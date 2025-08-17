import React from 'react'
import { WizardFormData } from '../../types/property'
import { Box } from '../Box'
import { BookingType, PaymentType } from '../../constants/propertyEnums'
import { resolvePhotoUrl } from '../../utils/api'
import { 
  FaHome, 
  FaMapMarkerAlt, 
  FaRulerCombined, 
  FaStar, 
  FaConciergeBell, 
  FaClipboardList, 
  FaDollarSign,
  FaImage
} from 'react-icons/fa'

interface ReviewStepProps {
  data: WizardFormData
  onChange: (updates: Partial<WizardFormData>) => void
  onNext: () => void
  onPrevious: () => void
  onSubmit: () => void
  loading: boolean
  isFirstStep: boolean
  isLastStep: boolean
  isEditMode?: boolean
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  data,
  onPrevious,
  onSubmit,
  loading,
  isEditMode
}) => {
  return (
    <Box paddingSm="1rem" paddingMd="2rem">
      <Box marginBottom="2rem">
        <Box fontSize="1.5rem" fontWeight="600" color="#1a202c" marginBottom="0.5rem">
          Review your property {isEditMode ? 'changes' : 'listing'}
        </Box>
        <Box color="#718096">
          Please review all the information before {isEditMode ? 'updating' : 'publishing'} your property
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap="2rem">
        {/* Basic Information */}
        <Box border="1px solid #e5e7eb" borderRadius="0.5rem" padding="1.5rem">
          <Box display="flex" alignItems="center" gap="0.5rem" fontSize="1.125rem" fontWeight="500" color="#374151" marginBottom="1rem">
            <FaHome color="#3182ce" />
            Basic Information
          </Box>
          <Box display="flex" flexDirection="column" gap="0.75rem" fontSize="0.875rem">
            <Box display="flex" justifyContent="space-between">
              <Box color="#6b7280">Property Name:</Box>
              <Box fontWeight="500" color="#374151">{data.name}</Box>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Box color="#6b7280">Booking Type:</Box>
              <Box fontWeight="500" color="#374151">{data.bookingType === BookingType.BookInstantly ? 'Instant Book' : 'Request to Book'}</Box>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Box color="#6b7280">Payment Type:</Box>
              <Box fontWeight="500" color="#374151">{data.paymentType === PaymentType.Online ? 'Online Payment' : 'Pay at Property'}</Box>
            </Box>
            {data.aboutTheProperty && (
              <Box>
                <Box color="#6b7280">About:</Box>
                <Box marginTop="0.25rem" color="#374151">{data.aboutTheProperty}</Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* Location */}
        <Box border="1px solid #e5e7eb" borderRadius="0.5rem" padding="1.5rem">
          <Box display="flex" alignItems="center" gap="0.5rem" fontSize="1.125rem" fontWeight="500" color="#374151" marginBottom="1rem">
            <FaMapMarkerAlt color="#3182ce" />
            Location
          </Box>
          <Box display="flex" flexDirection="column" gap="0.75rem" fontSize="0.875rem">
            <Box display="flex" justifyContent="space-between">
              <Box color="#6b7280">City:</Box>
              <Box fontWeight="500" color="#374151">{data.address.city}</Box>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Box color="#6b7280">Country:</Box>
              <Box fontWeight="500" color="#374151">{data.address.countryOrRegion}</Box>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Box color="#6b7280">ZIP Code:</Box>
              <Box fontWeight="500" color="#374151">{data.address.zipCode}</Box>
            </Box>
            {data.address.apartmentOrFloorNumber && (
              <Box display="flex" justifyContent="space-between">
                <Box color="#6b7280">Apartment/Floor:</Box>
                <Box fontWeight="500" color="#374151">{data.address.apartmentOrFloorNumber}</Box>
              </Box>
            )}
            {data.address.latLong && (
              <Box display="flex" justifyContent="space-between">
                <Box color="#6b7280">Coordinates:</Box>
                <Box fontWeight="500" color="#374151">
                  {data.address.latLong.latitude.toFixed(6)}, {data.address.latLong.longitude.toFixed(6)}
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* Layout */}
        <Box border="1px solid #e5e7eb" borderRadius="0.5rem" padding="1.5rem">
          <Box display="flex" alignItems="center" gap="0.5rem" fontSize="1.125rem" fontWeight="500" color="#374151" marginBottom="1rem">
            <FaRulerCombined color="#3182ce" />
            Layout
          </Box>
          <Box display="flex" flexDirection="column" gap="0.75rem" fontSize="0.875rem">
            <Box display="flex" justifyContent="space-between">
              <Box color="#6b7280">Maximum Guests:</Box>
              <Box fontWeight="500" color="#374151">{data.maximumGuest}</Box>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Box color="#6b7280">Bathrooms:</Box>
              <Box fontWeight="500" color="#374151">{data.bathrooms}</Box>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Box color="#6b7280">Children Allowed:</Box>
              <Box fontWeight="500" color="#374151">{data.allowChildren ? 'Yes' : 'No'}</Box>
            </Box>
            {data.allowChildren && (
              <Box display="flex" justifyContent="space-between">
                <Box color="#6b7280">Cribs Available:</Box>
                <Box fontWeight="500" color="#374151">{data.offerCribs ? 'Yes' : 'No'}</Box>
              </Box>
            )}
            {data.propertySizeSqMtr && (
              <Box display="flex" justifyContent="space-between">
                <Box color="#6b7280">Size:</Box>
                <Box fontWeight="500" color="#374151">{data.propertySizeSqMtr} sq m</Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* Amenities */}
        {data.amenities && data.amenities.length > 0 && (
          <Box border="1px solid #e5e7eb" borderRadius="0.5rem" padding="1.5rem">
            <Box display="flex" alignItems="center" gap="0.5rem" fontSize="1.125rem" fontWeight="500" color="#374151" marginBottom="1rem">
              <FaStar color="#3182ce" />
              Amenities ({data.amenities.length})
            </Box>
            <Box display="grid" gridTemplateColumnsSm="1fr 1fr" gridTemplateColumnsMd="1fr 1fr 1fr" gap="0.5rem">
              {data.amenities.map((amenity, index) => (
                <Box key={index} fontSize="0.875rem" color="#374151">
                  • {amenity.name}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Photos */}
        {data.photos && data.photos.length > 0 && (
          <Box border="1px solid #e5e7eb" borderRadius="0.5rem" padding="1.5rem">
            <Box display="flex" alignItems="center" gap="0.5rem" fontSize="1.125rem" fontWeight="500" color="#374151" marginBottom="1rem">
              <FaImage color="#3182ce" />
              Photos ({data.photos.length})
            </Box>
            <Box display="grid" gridTemplateColumnsSm="1fr 1fr 1fr" gridTemplateColumnsMd="1fr 1fr 1fr 1fr" gap="0.5rem">
              {data.photos.map((photo, index) => (
                <Box
                  key={index}
                  width="100%"
                  height="100px"
                  borderRadius="0.375rem"
                  overflow="hidden"
                >
                  <Box
                    as="img"
                    src={resolvePhotoUrl(photo.url)}
                    alt={photo.altText || `Photo ${index + 1}`}
                    width="100%"
                    height="100%"
                    objectFit="cover"
                  />
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Services */}
        <Box border="1px solid #e5e7eb" borderRadius="0.5rem" padding="1.5rem">
          <Box display="flex" alignItems="center" gap="0.5rem" fontSize="1.125rem" fontWeight="500" color="#374151" marginBottom="1rem">
            <FaConciergeBell color="#3182ce" />
            Services
          </Box>
          <Box display="flex" flexDirection="column" gap="0.75rem" fontSize="0.875rem">
            <Box display="flex" justifyContent="space-between">
              <Box color="#6b7280">Breakfast:</Box>
              <Box fontWeight="500" color="#374151">{data.serveBreakfast ? 'Available' : 'Not available'}</Box>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Box color="#6b7280">Parking:</Box>
              <Box fontWeight="500" color="#374151">{data.parking ? 'Free parking' : 'No parking'}</Box>
            </Box>
            {data.languages && data.languages.length > 0 && (
              <Box>
                <Box color="#6b7280">Languages:</Box>
                <Box marginTop="0.25rem" fontWeight="500" color="#374151">
                  {data.languages.join(', ')}
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* Rules */}
        <Box border="1px solid #e5e7eb" borderRadius="0.5rem" padding="1.5rem">
          <Box display="flex" alignItems="center" gap="0.5rem" fontSize="1.125rem" fontWeight="500" color="#374151" marginBottom="1rem">
            <FaClipboardList color="#3182ce" />
            House Rules
          </Box>
          <Box display="flex" flexDirection="column" gap="0.75rem" fontSize="0.875rem">
            <Box display="flex" justifyContent="space-between">
              <Box color="#6b7280">Smoking:</Box>
              <Box fontWeight="500" color="#374151">{data.smokingAllowed ? 'Allowed' : 'Not allowed'}</Box>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Box color="#6b7280">Parties/Events:</Box>
              <Box fontWeight="500" color="#374151">{data.partiesOrEventsAllowed ? 'Allowed' : 'Not allowed'}</Box>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Box color="#6b7280">Pets:</Box>
              <Box fontWeight="500" color="#374151">{data.petsAllowed ? 'Allowed' : 'Not allowed'}</Box>
            </Box>
            {data.checkInCheckout && (
              <Box>
                <Box color="#6b7280">Check-in/out times:</Box>
                <Box marginTop="0.25rem" fontWeight="500" color="#374151">
                  In: {data.checkInCheckout.checkInFrom} - {data.checkInCheckout.checkInUntil}
                  <br />
                  Out: {data.checkInCheckout.checkOutFrom} - {data.checkInCheckout.checkOutUntil}
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* Pricing */}
        {data.pricing && (
          <Box border="1px solid #e5e7eb" borderRadius="0.5rem" padding="1.5rem">
            <Box display="flex" alignItems="center" gap="0.5rem" fontSize="1.125rem" fontWeight="500" color="#374151" marginBottom="1rem">
              <FaDollarSign color="#3182ce" />
              Pricing
            </Box>
            <Box display="flex" flexDirection="column" gap="0.75rem" fontSize="0.875rem">
              <Box display="flex" justifyContent="space-between">
                <Box color="#6b7280">Base Rate:</Box>
                <Box fontWeight="500" color="#374151">{data.pricing.currency} {data.pricing.ratePerNight}/night</Box>
              </Box>
              {data.pricing.ratePerNightWeekend && (
                <Box display="flex" justifyContent="space-between">
                  <Box color="#6b7280">Weekend Rate:</Box>
                  <Box fontWeight="500" color="#374151">{data.pricing.currency} {data.pricing.ratePerNightWeekend}/night</Box>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* Navigation */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginTop="3rem"
        paddingTop="2rem"
        borderTop="1px solid #e5e7eb"
      >
        <Box>
          <Box
            as="button"
            onClick={onPrevious}
            padding="0.75rem 1.5rem"
            backgroundColor="transparent"
            color="#6b7280"
            border="1px solid #d1d5db"
            borderRadius="0.375rem"
            fontSize="1rem"
            cursor="pointer"
            whileHover={{ borderColor: '#9ca3af', backgroundColor: '#f9fafb' }}
          >
            Previous
          </Box>
        </Box>

        <Box>
          <Box
            as="button"
            onClick={onSubmit}
            disabled={loading}
            padding="0.75rem 2rem"
            backgroundColor="#10b981"
            color="white"
            border="none"
            borderRadius="0.375rem"
            fontSize="1rem"
            fontWeight="500"
            cursor="pointer"
            whileHover={{ backgroundColor: '#059669' }}
          >
            {loading ? (isEditMode ? 'Updating Property...' : 'Creating Property...') : (isEditMode ? 'Update Property' : 'Publish Property')}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default ReviewStep