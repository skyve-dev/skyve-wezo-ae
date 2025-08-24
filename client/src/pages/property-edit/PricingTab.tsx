import React from 'react'
import { Box } from '@/components'
import NumberStepperInput from '@/components/base/NumberStepperInput.tsx'
import { WizardFormData } from '@/types/property'
import { Currency, CurrencyLabels } from '@/constants/propertyEnums'
import MobileSelect from './MobileSelect'

interface PricingTabProps {
    formData: Partial<WizardFormData>
    updateFormData: (updates: Partial<WizardFormData>) => void
}

const PricingTab: React.FC<PricingTabProps> = ({ formData, updateFormData }) => {
    const updatePricing = (field: string, value: any) => {
        updateFormData({
            pricing: {
                currency: formData.pricing?.currency || Currency.AED,
                ratePerNight: formData.pricing?.ratePerNight || 0,
                ...formData.pricing,
                [field]: value
            }
        })
    }

    const updateCancellation = (field: string, value: any) => {
        updateFormData({
            cancellation: {
                daysBeforeArrivalFreeToCancel: formData.cancellation?.daysBeforeArrivalFreeToCancel || 7,
                waiveCancellationFeeAccidentalBookings: formData.cancellation?.waiveCancellationFeeAccidentalBookings || false,
                ...formData.cancellation,
                [field]: value
            }
        })
    }

    return (
        <Box>
            <h3 style={{marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600'}}>
                Pricing & Policies
            </h3>
            
            <Box display="grid" gap="1.5rem">
                {/* Currency Selection */}
                <MobileSelect<Currency>
                    label="Currency"
                    value={formData.pricing?.currency || Currency.AED}
                    options={Object.values(Currency).map(currency => ({
                        value: currency,
                        label: CurrencyLabels[currency]
                    }))}
                    onChange={(value) => updatePricing('currency', value)}
                    placeholder="Select currency"
                    helperText="Choose the currency for pricing your property"
                />

                {/* Base Pricing */}
                <Box>
                    <h4 style={{marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '500'}}>
                        Base Pricing
                    </h4>
                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem">
                        <NumberStepperInput
                            label="Rate Per Night (Weekdays)"
                            value={formData.pricing?.ratePerNight || 0}
                            onChange={(value) => updatePricing('ratePerNight', value)}
                            min={1}
                            max={50000}
                            format="decimal"
                            step={10}
                            width="100%"
                        />
                        <NumberStepperInput
                            label="Rate Per Night (Weekends)"
                            value={formData.pricing?.ratePerNightWeekend || formData.pricing?.ratePerNight || 0}
                            onChange={(value) => updatePricing('ratePerNightWeekend', value)}
                            min={1}
                            max={50000}
                            format="decimal"
                            step={10}
                            width="100%"
                        />
                    </Box>
                </Box>

                {/* Discount Policies */}
                <Box>
                    <h4 style={{marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '500'}}>
                        Discount Policies
                    </h4>
                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem">
                        <NumberStepperInput
                            label="Non-Refundable Rate Discount (%)"
                            value={formData.pricing?.discountPercentageForNonRefundableRatePlan || 0}
                            onChange={(value) => updatePricing('discountPercentageForNonRefundableRatePlan', value)}
                            min={0}
                            max={50}
                            format="integer"
                            step={1}
                            width="100%"
                            helperText="Discount for non-refundable bookings"
                        />
                        
                        <NumberStepperInput
                            label="Weekly Rate Discount (%)"
                            value={formData.pricing?.discountPercentageForWeeklyRatePlan || 0}
                            onChange={(value) => updatePricing('discountPercentageForWeeklyRatePlan', value)}
                            min={0}
                            max={50}
                            format="integer"
                            step={1}
                            width="100%"
                            helperText="Discount for 7+ night stays"
                        />
                    </Box>
                </Box>

                {/* Cancellation Policy */}
                <Box>
                    <h4 style={{marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '500'}}>
                        Cancellation Policy
                    </h4>
                    <Box display="grid" gap="1rem">
                        <NumberStepperInput
                            label="Free Cancellation (days before arrival)"
                            value={formData.cancellation?.daysBeforeArrivalFreeToCancel || 7}
                            onChange={(value) => updateCancellation('daysBeforeArrivalFreeToCancel', value)}
                            min={0}
                            max={30}
                            format="integer"
                            step={1}
                            width="100%"
                            helperText="Number of days before arrival when guests can cancel for free"
                        />
                        
                        <Box>
                            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                                Waive Cancellation Fee for Accidental Bookings
                            </label>
                            <Box display="flex" gap="1rem">
                                <Box
                                    as="button"
                                    onClick={() => updateCancellation('waiveCancellationFeeAccidentalBookings', true)}
                                    padding="0.75rem 1.5rem"
                                    border={formData.cancellation?.waiveCancellationFeeAccidentalBookings ? '2px solid #3b82f6' : '1px solid #d1d5db'}
                                    backgroundColor={formData.cancellation?.waiveCancellationFeeAccidentalBookings ? '#eff6ff' : 'white'}
                                    borderRadius="0.5rem"
                                    cursor="pointer"
                                    fontWeight={formData.cancellation?.waiveCancellationFeeAccidentalBookings ? '600' : '400'}
                                    color={formData.cancellation?.waiveCancellationFeeAccidentalBookings ? '#1d4ed8' : '#374151'}
                                    width="50%"
                                    fontSize="0.875rem"
                                >
                                    Yes, Waive Fee
                                </Box>
                                <Box
                                    as="button"
                                    onClick={() => updateCancellation('waiveCancellationFeeAccidentalBookings', false)}
                                    padding="0.75rem 1.5rem"
                                    border={!formData.cancellation?.waiveCancellationFeeAccidentalBookings ? '2px solid #3b82f6' : '1px solid #d1d5db'}
                                    backgroundColor={!formData.cancellation?.waiveCancellationFeeAccidentalBookings ? '#eff6ff' : 'white'}
                                    borderRadius="0.5rem"
                                    cursor="pointer"
                                    fontWeight={!formData.cancellation?.waiveCancellationFeeAccidentalBookings ? '600' : '400'}
                                    color={!formData.cancellation?.waiveCancellationFeeAccidentalBookings ? '#1d4ed8' : '#374151'}
                                    width="50%"
                                    fontSize="0.875rem"
                                >
                                    No, Charge Fee
                                </Box>
                            </Box>
                            <p style={{fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem'}}>
                                Allow free cancellation within 24 hours if booking was made by mistake
                            </p>
                        </Box>
                    </Box>
                </Box>

                <Box
                    padding="1rem"
                    backgroundColor="#f0f9ff"
                    borderRadius="0.5rem"
                    border="1px solid #bae6fd"
                >
                    <h4 style={{margin: '0 0 0.5rem 0', color: '#0369a1', fontSize: '0.875rem', fontWeight: '600'}}>
                        💰 Pricing Tips
                    </h4>
                    <ul style={{
                        margin: 0,
                        paddingLeft: '1rem',
                        fontSize: '0.875rem',
                        color: '#0c4a6e',
                        lineHeight: '1.5'
                    }}>
                        <li>Weekend rates can be 20-30% higher than weekday rates</li>
                        <li>Weekly discounts encourage longer bookings</li>
                        <li>Non-refundable rates can help secure bookings</li>
                        <li>Flexible cancellation policies attract more bookings</li>
                        <li>Use stepper controls for precise pricing on mobile</li>
                    </ul>
                </Box>
            </Box>
        </Box>
    )
}

export default PricingTab