import React from 'react'
import {Box} from '@/components'
import {FaFileAlt, FaHome, FaMapMarkerAlt, FaBolt, FaClock, FaCreditCard, FaHandshake} from 'react-icons/fa'
import Input from '@/components/base/Input.tsx'
import DatePicker from '@/components/base/DatePicker.tsx'
import SelectionPicker from '@/components/base/SelectionPicker.tsx'
import {ValidationErrors, WizardFormData} from '@/types/property'
import {BookingType, BookingTypeLabels, PaymentType, PaymentTypeLabels} from '@/constants/propertyEnums'

interface DetailsTabProps {
    formData: Partial<WizardFormData>
    updateFormData: (updates: Partial<WizardFormData>) => void
    validationErrors?: ValidationErrors | null
}

const DetailsTab: React.FC<DetailsTabProps> = ({ formData, updateFormData, validationErrors }) => {
    // Icon mapping for booking types
    const getBookingTypeIcon = (bookingType: BookingType) => {
        switch (bookingType) {
            case BookingType.BookInstantly:
                return <FaBolt style={{ color: '#f59e0b', fontSize: '1rem' }} />
            case BookingType.NeedToRequestBook:
                return <FaClock style={{ color: '#6b7280', fontSize: '1rem' }} />
            default:
                return <FaClock style={{ color: '#6b7280', fontSize: '1rem' }} />
        }
    }

    // Icon mapping for payment types
    const getPaymentTypeIcon = (paymentType: PaymentType) => {
        switch (paymentType) {
            case PaymentType.Online:
                return <FaCreditCard style={{ color: '#10b981', fontSize: '1rem' }} />
            case PaymentType.ByCreditCardAtProperty:
                return <FaHandshake style={{ color: '#8b5cf6', fontSize: '1rem' }} />
            default:
                return <FaCreditCard style={{ color: '#10b981', fontSize: '1rem' }} />
        }
    }

    return (
        <Box paddingX={'1.5rem'}>
            <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1.5rem">
                <FaHome style={{color: '#374151', fontSize: '1.25rem'}} />
                <h3 style={{margin: 0, fontSize: '1.5rem', fontWeight: '600'}}>
                    Basic Property Information
                </h3>
            </Box>
            <Box display="grid" gap="2.5rem">
                <Input
                    label="Property Name"
                    icon={FaHome}
                    value={formData.name || ''}
                    onChange={(e) => {
                        console.log('🏠 DetailsTab: Property name changed to:', e.target.value)
                        updateFormData({name: e.target.value})
                    }}
                    placeholder="Enter a descriptive name for your property"
                    width="100%"
                />

                <Box>
                    <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
                        <FaFileAlt style={{color: '#374151', fontSize: '0.875rem'}} />
                        <label style={{fontWeight: '500'}}>
                            About Your Property
                        </label>
                    </Box>
                    <textarea
                        value={formData.aboutTheProperty || ''}
                        onChange={(e) => updateFormData({aboutTheProperty: e.target.value})}
                        placeholder="Describe your property in detail..."
                        rows={6}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '0.875rem',
                            resize: 'vertical',
                            fontFamily: 'inherit'
                        }}
                    />
                </Box>

                <Box>
                    <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
                        <FaMapMarkerAlt style={{color: '#374151', fontSize: '0.875rem'}} />
                        <label style={{fontWeight: '500'}}>
                            About the Neighborhood
                        </label>
                    </Box>
                    <textarea
                        value={formData.aboutTheNeighborhood || ''}
                        onChange={(e) => updateFormData({aboutTheNeighborhood: e.target.value})}
                        placeholder="Describe the neighborhood and nearby attractions..."
                        rows={4}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '0.875rem',
                            resize: 'vertical',
                            fontFamily: 'inherit'
                        }}
                    />
                </Box>

                <Box display="grid" gridTemplateColumnsSm="1fr 1fr" gridTemplateColumns="1fr" gap="2rem">
                    {/* Booking Type Selection */}
                    <Box>
                        <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.75rem">
                            <FaBolt style={{color: '#374151', fontSize: '0.875rem'}} />
                            <label style={{fontWeight: '500', fontSize: '0.875rem'}}>
                                Booking Type
                            </label>
                        </Box>
                        <SelectionPicker
                            data={Object.values(BookingType).map(type => ({
                                value: type,
                                label: BookingTypeLabels[type],
                                type
                            }))}
                            containerStyles={{display:'flex',flexDirection:'row'}}
                            idAccessor={(item) => item.value}
                            labelAccessor={(item) => item.label}
                            value={formData.bookingType || BookingType.BookInstantly}
                            onChange={(value) => updateFormData({bookingType: value as BookingType})}
                            renderItem={(item) => (
                                <>
                                    <Box as="span" >
                                        {getBookingTypeIcon(item.type)}
                                    </Box>
                                    <Box as="span" flex="1">
                                        {item.label}
                                    </Box>
                                </>
                            )}
                        />
                    </Box>

                    {/* Payment Type Selection */}
                    <Box>
                        <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.75rem">
                            <FaCreditCard style={{color: '#374151', fontSize: '0.875rem'}} />
                            <label style={{fontWeight: '500', fontSize: '0.875rem'}}>
                                Payment Type
                            </label>
                        </Box>
                        <SelectionPicker
                            data={Object.values(PaymentType).map(type => ({
                                value: type,
                                label: PaymentTypeLabels[type],
                                type
                            }))}
                            containerStyles={{display:'flex',flexDirection:'row'}}
                            itemStyles={{width:"50%"}}
                            idAccessor={(item) => item.value}
                            labelAccessor={(item) => item.label}
                            value={formData.paymentType || PaymentType.Online}
                            onChange={(value) => updateFormData({paymentType: value as PaymentType})}
                            renderItem={(item) => (
                                <>
                                    <Box as="span" >
                                        {getPaymentTypeIcon(item.type)}
                                    </Box>
                                    <Box as="span" flex="1">
                                        {item.label}
                                    </Box>
                                </>
                            )}
                        />
                    </Box>
                </Box>

                <DatePicker
                    label="First Date Guests Can Check In"
                    value={formData.firstDateGuestCanCheckIn}
                    onChange={(value) => updateFormData({firstDateGuestCanCheckIn: value})}
                    placeholder="Select earliest check-in date"
                    minDate={new Date().toISOString()}
                    error={!!validationErrors?.firstDateGuestCanCheckIn}
                    helperText={validationErrors?.firstDateGuestCanCheckIn}
                />
            </Box>
        </Box>
    )
}

export default DetailsTab