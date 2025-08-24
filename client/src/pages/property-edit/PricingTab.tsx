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

                {/* Additional Fees */}
                <Box>
                    <h4 style={{marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '500'}}>
                        Additional Fees
                    </h4>
                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem">
                        <NumberStepperInput
                            label="Cleaning Fee"
                            value={formData.cleaningFee || 0}
                            onChange={(value) => updateFormData({cleaningFee: value})}
                            min={0}
                            max={5000}
                            format="decimal"
                            step={5}
                            width="100%"
                        />
                        <NumberStepperInput
                            label="Security Deposit"
                            value={formData.securityDepositAmount || 0}
                            onChange={(value) => updateFormData({securityDepositAmount: value})}
                            min={0}
                            max={10000}
                            format="decimal"
                            step={50}
                            width="100%"
                        />
                    </Box>
                    
                    {/* Extra Guest Fees */}
                    <Box marginTop="1rem">
                        <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                            Extra Guest Fees
                        </label>
                        <Box display="flex" gap="1rem" marginBottom="1rem">
                            <Box
                                as="button"
                                onClick={() => updateFormData({ chargeExtraGuests: true })}
                                padding="0.75rem 1.5rem"
                                border={formData.chargeExtraGuests ? '2px solid #3b82f6' : '1px solid #d1d5db'}
                                backgroundColor={formData.chargeExtraGuests ? '#eff6ff' : 'white'}
                                borderRadius="0.5rem"
                                cursor="pointer"
                                fontWeight={formData.chargeExtraGuests ? '600' : '400'}
                                color={formData.chargeExtraGuests ? '#1d4ed8' : '#374151'}
                                width="50%"
                            >
                                Charge Extra Guests
                            </Box>
                            <Box
                                as="button"
                                onClick={() => updateFormData({ chargeExtraGuests: false })}
                                padding="0.75rem 1.5rem"
                                border={!formData.chargeExtraGuests ? '2px solid #3b82f6' : '1px solid #d1d5db'}
                                backgroundColor={!formData.chargeExtraGuests ? '#eff6ff' : 'white'}
                                borderRadius="0.5rem"
                                cursor="pointer"
                                fontWeight={!formData.chargeExtraGuests ? '600' : '400'}
                                color={!formData.chargeExtraGuests ? '#1d4ed8' : '#374151'}
                                width="50%"
                            >
                                No Extra Charges
                            </Box>
                        </Box>
                        {formData.chargeExtraGuests && (
                            <NumberStepperInput
                                label="Extra Guest Fee (per person/night)"
                                value={formData.extraGuestFee || 0}
                                onChange={(value) => updateFormData({extraGuestFee: value})}
                                min={0}
                                max={500}
                                format="decimal"
                                step={5}
                                    width="100%"
                            />
                        )}
                    </Box>
                </Box>

                {/* Discounts */}
                <Box>
                    <h4 style={{marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '500'}}>
                        Discount Policies
                    </h4>
                    <Box display="grid" gap="1rem">
                        <NumberStepperInput
                            label="Non-Refundable Rate Discount (%)"
                            value={formData.pricing?.discountPercentageForNonRefundableRatePlan || 0}
                            onChange={(value) => updatePricing('discountPercentageForNonRefundableRatePlan', value)}
                            min={0}
                            max={50}
                            format="integer"
                            step={1}
                            width="100%"
                        />
                        
                        <Box display="grid" gridTemplateColumns="1fr auto 1fr auto" gap="1rem" alignItems="end">
                            <Box>
                                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                                    Weekly Discount
                                </label>
                                <Box display="flex" gap="0.5rem">
                                    <Box
                                        as="button"
                                        onClick={() => updateFormData({ offerWeeklyDiscount: true })}
                                        padding="0.5rem 1rem"
                                        border={formData.offerWeeklyDiscount ? '2px solid #10b981' : '1px solid #d1d5db'}
                                        backgroundColor={formData.offerWeeklyDiscount ? '#ecfdf5' : 'white'}
                                        borderRadius="0.375rem"
                                        cursor="pointer"
                                        fontSize="0.875rem"
                                        fontWeight={formData.offerWeeklyDiscount ? '600' : '400'}
                                        color={formData.offerWeeklyDiscount ? '#047857' : '#374151'}
                                    >
                                        Enable
                                    </Box>
                                </Box>
                            </Box>
                            {formData.offerWeeklyDiscount && (
                                <NumberStepperInput
                                    label="Percentage"
                                    value={formData.weeklyDiscountPercent || 0}
                                    onChange={(value) => updateFormData({weeklyDiscountPercent: value})}
                                    min={0}
                                    max={50}
                                    format="integer"
                                    step={1}
                                    width="80px"
                                />
                            )}
                            <Box>
                                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                                    Monthly Discount
                                </label>
                                <Box display="flex" gap="0.5rem">
                                    <Box
                                        as="button"
                                        onClick={() => updateFormData({ offerMonthlyDiscount: true })}
                                        padding="0.5rem 1rem"
                                        border={formData.offerMonthlyDiscount ? '2px solid #10b981' : '1px solid #d1d5db'}
                                        backgroundColor={formData.offerMonthlyDiscount ? '#ecfdf5' : 'white'}
                                        borderRadius="0.375rem"
                                        cursor="pointer"
                                        fontSize="0.875rem"
                                        fontWeight={formData.offerMonthlyDiscount ? '600' : '400'}
                                        color={formData.offerMonthlyDiscount ? '#047857' : '#374151'}
                                    >
                                        Enable
                                    </Box>
                                </Box>
                            </Box>
                            {formData.offerMonthlyDiscount && (
                                <NumberStepperInput
                                    label="Percentage"
                                    value={formData.monthlyDiscountPercent || 0}
                                    onChange={(value) => updateFormData({monthlyDiscountPercent: value})}
                                    min={0}
                                    max={50}
                                    format="integer"
                                    step={1}
                                    width="80px"
                                />
                            )}
                        </Box>
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
                                >
                                    No, Charge Fee
                                </Box>
                            </Box>
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
                        <li>Weekly/monthly discounts encourage longer bookings</li>
                        <li>Security deposits protect against property damage</li>
                        <li>Flexible cancellation policies attract more bookings</li>
                        <li>Use stepper controls for precise pricing on mobile</li>
                    </ul>
                </Box>
            </Box>
        </Box>
    )
}

export default PricingTab