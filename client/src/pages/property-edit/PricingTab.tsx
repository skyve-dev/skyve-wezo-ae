import React, { useState } from 'react'
import {Box} from '@/components'
import NumberStepperInput from '@/components/base/NumberStepperInput.tsx'
import SelectionPicker from '@/components/base/SelectionPicker'
import {ValidationErrors, WizardFormData} from '@/types/property'
import {Currency, CurrencyLabels} from '@/constants/propertyEnums'
import MobileSelect from './MobileSelect'
import { FaInfoCircle } from 'react-icons/fa'

interface PricingTabProps {
    formData: Partial<WizardFormData>
    updateFormData: (updates: Partial<WizardFormData>) => void
    validationErrors?: ValidationErrors | null
}

const PricingTab: React.FC<PricingTabProps> = ({ formData, updateFormData, validationErrors: _validationErrors }) => {
    // Rate Plan state
    const [selectedRatePlans, setSelectedRatePlans] = useState<string[]>(['flexible'])
    const [ratePlanSettings, setRatePlanSettings] = useState<Record<string, any>>({})

    // Default rate plans
    const defaultRatePlans = [
        {
            id: 'flexible',
            name: 'Flexible Cancellation',
            type: 'FullyFlexible',
            discountPercentage: 0,
            cancellationDays: 1,
            description: 'Free cancellation up to 24 hours before check-in'
        },
        {
            id: 'non-refundable',
            name: 'Non-Refundable Rate',
            type: 'NonRefundable',
            discountPercentage: 15,
            cancellationDays: 0,
            description: 'Save 15% with our non-refundable rate'
        },
        {
            id: 'weekly',
            name: 'Weekly Stay Discount',
            type: 'Custom',
            discountPercentage: 20,
            cancellationDays: 7,
            description: 'Stay 7+ nights and save 20%'
        }
    ]

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
        <Box paddingX={'1.5rem'} paddingY={'1.5rem'}>
            <h3 style={{marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600'}}>
                Pricing & Policies
            </h3>
            
            <Box display="grid" gap="2.5rem">
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

                {/* Rate Plans Section */}
                <Box>
                    <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="1rem">
                        <h4 style={{ fontSize: '1.125rem', fontWeight: '500' }}>Rate Plans</h4>
                        <FaInfoCircle size={16} color="#9ca3af" />
                    </Box>
                    
                    <SelectionPicker
                        data={defaultRatePlans}
                        idAccessor={(plan) => plan.id}
                        value={selectedRatePlans}
                        onChange={(value) => setSelectedRatePlans(Array.isArray(value) ? value as string[] : [value as string])}
                        isMultiSelect={true}
                        renderItem={(plan, _isSelected) => (
                            <Box>
                                <Box fontWeight="500">{plan.name}</Box>
                                <Box fontSize="0.875rem" color="#6b7280">{plan.description}</Box>
                            </Box>
                        )}
                    />

                    {selectedRatePlans.includes('non-refundable') && (
                        <Box marginTop="1rem" padding="1rem" backgroundColor="#fef3c7" borderRadius="8px">
                            <Box display="flex" alignItems="center" gap="0.5rem">
                                <FaInfoCircle color="#f59e0b" />
                                <span style={{ fontSize: '0.875rem', color: '#92400e' }}>
                                    Non-refundable rate automatically applies 15% discount to base prices
                                </span>
                            </Box>
                        </Box>
                    )}

                    {selectedRatePlans.includes('weekly') && (
                        <Box marginTop="1rem">
                            <NumberStepperInput
                                label="Minimum Nights for Weekly Discount"
                                value={ratePlanSettings.weeklyMinNights || 7}
                                onChange={(value) => setRatePlanSettings(prev => ({
                                    ...prev,
                                    weeklyMinNights: value
                                }))}
                                min={5}
                                max={14}
                                helperText="Minimum consecutive nights to qualify for weekly discount"
                                width="200px"
                            />
                        </Box>
                    )}
                </Box>

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

                {/* Enhanced Rate Plan Policies */}
                <Box>
                    <h4 style={{marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '500'}}>
                        Rate Plan Policies
                    </h4>
                    
                    {selectedRatePlans.map(planId => {
                        const plan = defaultRatePlans.find(p => p.id === planId)
                        if (!plan) return null
                        
                        return (
                            <Box key={planId} marginBottom="1.5rem" padding="1rem" border="1px solid #e5e7eb" borderRadius="8px">
                                <h5 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{plan.name}</h5>
                                
                                {plan.type === 'FullyFlexible' && (
                                    <NumberStepperInput
                                        label="Free Cancellation (hours before check-in)"
                                        value={ratePlanSettings[`${planId}_cancellationHours`] || 24}
                                        onChange={(value) => setRatePlanSettings(prev => ({
                                            ...prev,
                                            [`${planId}_cancellationHours`]: value
                                        }))}
                                        min={0}
                                        max={72}
                                        step={12}
                                        format="integer"
                                        helperText="Hours before check-in when cancellation is free"
                                        width="250px"
                                    />
                                )}
                                
                                {plan.type === 'NonRefundable' && (
                                    <Box color="#6b7280" fontSize="0.875rem">
                                        No refunds allowed after booking confirmation
                                    </Box>
                                )}
                                
                                {plan.type === 'Custom' && (
                                    <Box>
                                        <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                                            Custom Cancellation Policy
                                        </label>
                                        <textarea
                                            value={ratePlanSettings[`${planId}_customPolicy`] || ''}
                                            onChange={(e) => setRatePlanSettings(prev => ({
                                                ...prev,
                                                [`${planId}_customPolicy`]: e.target.value
                                            }))}
                                            placeholder="Describe your cancellation policy"
                                            rows={3}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.875rem'
                                            }}
                                        />
                                    </Box>
                                )}
                            </Box>
                        )
                    })}
                </Box>
            </Box>
        </Box>
    )
}

export default PricingTab