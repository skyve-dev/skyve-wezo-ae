import React from 'react'
import {Box} from '@/components'
import {FaFileAlt, FaHome, FaMapMarkerAlt} from 'react-icons/fa'
import Input from '@/components/base/Input.tsx'
import DatePicker from '@/components/base/DatePicker.tsx'
import {ValidationErrors, WizardFormData} from '@/types/property'
import {BookingType, BookingTypeLabels, PaymentType, PaymentTypeLabels} from '@/constants/propertyEnums'
import MobileSelect from './MobileSelect'

interface DetailsTabProps {
    formData: Partial<WizardFormData>
    updateFormData: (updates: Partial<WizardFormData>) => void
    validationErrors?: ValidationErrors | null
}

const DetailsTab: React.FC<DetailsTabProps> = ({ formData, updateFormData, validationErrors }) => {
    return (
        <Box>
            <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1.5rem">
                <FaHome style={{color: '#374151', fontSize: '1.25rem'}} />
                <h3 style={{margin: 0, fontSize: '1.5rem', fontWeight: '600'}}>
                    Basic Property Information
                </h3>
            </Box>
            <Box display="grid" gap="1.5rem">
                <Input
                    label="Property Name"
                    icon={FaHome}
                    value={formData.name || ''}
                    onChange={(e) => updateFormData({name: e.target.value})}
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

                <Box display="grid" gridTemplateColumnsSm="1fr 1fr" gridTemplateColumns="1fr" gap="1rem">
                    <MobileSelect<BookingType>
                        label="Booking Type"
                        value={formData.bookingType || BookingType.BookInstantly}
                        options={Object.values(BookingType).map(type => ({
                            value: type,
                            label: BookingTypeLabels[type]
                        }))}
                        onChange={(value) => updateFormData({bookingType: value})}
                        placeholder="Select booking type"
                    />

                    <MobileSelect<PaymentType>
                        label="Payment Type"
                        value={formData.paymentType || PaymentType.Online}
                        options={Object.values(PaymentType).map(type => ({
                            value: type,
                            label: PaymentTypeLabels[type]
                        }))}
                        onChange={(value) => updateFormData({paymentType: value})}
                        placeholder="Select payment type"
                    />
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