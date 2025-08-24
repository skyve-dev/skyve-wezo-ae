import React from 'react'
import { Box } from '@/components'
import NumberStepperInput from '@/components/base/NumberStepperInput.tsx'
import TimePicker from '@/components/base/TimePicker.tsx'
import { WizardFormData } from '@/types/property'
import { PetPolicy, PetPolicyLabels } from '@/constants/propertyEnums'
import MobileSelect from './MobileSelect'

interface RulesTabProps {
    formData: Partial<WizardFormData>
    updateFormData: (updates: Partial<WizardFormData>) => void
}

const RulesTab: React.FC<RulesTabProps> = ({ formData, updateFormData }) => {
    const updateCheckInCheckout = (field: string, value: string) => {
        updateFormData({
            checkInCheckout: {
                checkInFrom: formData.checkInCheckout?.checkInFrom || '15:00',
                checkInUntil: formData.checkInCheckout?.checkInUntil || '22:00',
                checkOutFrom: formData.checkInCheckout?.checkOutFrom || '08:00',
                checkOutUntil: formData.checkInCheckout?.checkOutUntil || '11:00',
                ...formData.checkInCheckout,
                [field]: value
            }
        })
    }

    return (
        <Box>
            <h3 style={{marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600'}}>
                House Rules & Policies
            </h3>
            
            <Box display="grid" gap="1.5rem">
                {/* Basic Rules */}
                <Box>
                    <h4 style={{marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '500'}}>
                        Basic Rules
                    </h4>
                    <Box display="grid" gap="1rem">
                        {/* Smoking */}
                        <Box>
                            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                                Smoking Policy
                            </label>
                            <Box display="flex" gap="1rem">
                                <Box
                                    as="button"
                                    onClick={() => updateFormData({ smokingAllowed: true })}
                                    padding="0.75rem 1.5rem"
                                    border={formData.smokingAllowed ? '2px solid #3b82f6' : '1px solid #d1d5db'}
                                    backgroundColor={formData.smokingAllowed ? '#eff6ff' : 'white'}
                                    borderRadius="0.5rem"
                                    cursor="pointer"
                                    fontWeight={formData.smokingAllowed ? '600' : '400'}
                                    color={formData.smokingAllowed ? '#1d4ed8' : '#374151'}
                                    width="50%"
                                >
                                    Smoking Allowed
                                </Box>
                                <Box
                                    as="button"
                                    onClick={() => updateFormData({ smokingAllowed: false })}
                                    padding="0.75rem 1.5rem"
                                    border={!formData.smokingAllowed ? '2px solid #3b82f6' : '1px solid #d1d5db'}
                                    backgroundColor={!formData.smokingAllowed ? '#eff6ff' : 'white'}
                                    borderRadius="0.5rem"
                                    cursor="pointer"
                                    fontWeight={!formData.smokingAllowed ? '600' : '400'}
                                    color={!formData.smokingAllowed ? '#1d4ed8' : '#374151'}
                                    width="50%"
                                >
                                    No Smoking
                                </Box>
                            </Box>
                        </Box>

                        {/* Parties/Events */}
                        <Box>
                            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                                Parties & Events
                            </label>
                            <Box display="flex" gap="1rem">
                                <Box
                                    as="button"
                                    onClick={() => updateFormData({ partiesOrEventsAllowed: true })}
                                    padding="0.75rem 1.5rem"
                                    border={formData.partiesOrEventsAllowed ? '2px solid #3b82f6' : '1px solid #d1d5db'}
                                    backgroundColor={formData.partiesOrEventsAllowed ? '#eff6ff' : 'white'}
                                    borderRadius="0.5rem"
                                    cursor="pointer"
                                    fontWeight={formData.partiesOrEventsAllowed ? '600' : '400'}
                                    color={formData.partiesOrEventsAllowed ? '#1d4ed8' : '#374151'}
                                    width="50%"
                                >
                                    Events Allowed
                                </Box>
                                <Box
                                    as="button"
                                    onClick={() => updateFormData({ partiesOrEventsAllowed: false })}
                                    padding="0.75rem 1.5rem"
                                    border={!formData.partiesOrEventsAllowed ? '2px solid #3b82f6' : '1px solid #d1d5db'}
                                    backgroundColor={!formData.partiesOrEventsAllowed ? '#eff6ff' : 'white'}
                                    borderRadius="0.5rem"
                                    cursor="pointer"
                                    fontWeight={!formData.partiesOrEventsAllowed ? '600' : '400'}
                                    color={!formData.partiesOrEventsAllowed ? '#1d4ed8' : '#374151'}
                                    width="50%"
                                >
                                    No Events
                                </Box>
                            </Box>
                        </Box>

                        {/* Pets */}
                        <MobileSelect<PetPolicy>
                            label="Pet Policy"
                            value={formData.petsAllowed || PetPolicy.No}
                            options={Object.values(PetPolicy).map(policy => ({
                                value: policy,
                                label: PetPolicyLabels[policy]
                            }))}
                            onChange={(value) => updateFormData({petsAllowed: value})}
                            placeholder="Select pet policy"
                            helperText="Choose your property's pet accommodation policy"
                        />
                    </Box>
                </Box>

                {/* Check-in/Check-out Times */}
                <Box>
                    <h4 style={{marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '500'}}>
                        Check-in & Check-out Times
                    </h4>
                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem">
                        <TimePicker
                            label="Check-in From"
                            value={formData.checkInCheckout?.checkInFrom ? `2025-01-01T${formData.checkInCheckout.checkInFrom}:00.000Z` : '2025-01-01T15:00:00.000Z'}
                            onChange={(value) => {
                                const time = new Date(value).toTimeString().substring(0, 5)
                                updateCheckInCheckout('checkInFrom', time)
                            }}
                            placeholder="Select check-in start time"
                            interval={30}
                            use12HourFormat={false}
                        />
                        <TimePicker
                            label="Check-in Until"
                            value={formData.checkInCheckout?.checkInUntil ? `2025-01-01T${formData.checkInCheckout.checkInUntil}:00.000Z` : '2025-01-01T22:00:00.000Z'}
                            onChange={(value) => {
                                const time = new Date(value).toTimeString().substring(0, 5)
                                updateCheckInCheckout('checkInUntil', time)
                            }}
                            placeholder="Select check-in end time"
                            interval={30}
                            use12HourFormat={false}
                        />
                        <TimePicker
                            label="Check-out From"
                            value={formData.checkInCheckout?.checkOutFrom ? `2025-01-01T${formData.checkInCheckout.checkOutFrom}:00.000Z` : '2025-01-01T08:00:00.000Z'}
                            onChange={(value) => {
                                const time = new Date(value).toTimeString().substring(0, 5)
                                updateCheckInCheckout('checkOutFrom', time)
                            }}
                            placeholder="Select check-out start time"
                            interval={30}
                            use12HourFormat={false}
                        />
                        <TimePicker
                            label="Check-out Until"
                            value={formData.checkInCheckout?.checkOutUntil ? `2025-01-01T${formData.checkInCheckout.checkOutUntil}:00.000Z` : '2025-01-01T11:00:00.000Z'}
                            onChange={(value) => {
                                const time = new Date(value).toTimeString().substring(0, 5)
                                updateCheckInCheckout('checkOutUntil', time)
                            }}
                            placeholder="Select check-out end time"
                            interval={30}
                            use12HourFormat={false}
                        />
                    </Box>
                </Box>

                {/* Booking Restrictions */}
                <Box>
                    <h4 style={{marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '500'}}>
                        Booking Restrictions
                    </h4>
                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem">
                        <NumberStepperInput
                            label="Minimum Nights"
                            value={formData.minimumNights || 1}
                            onChange={(value) => updateFormData({minimumNights: value})}
                            min={1}
                            max={365}
                            format="integer"
                            width="100%"
                        />
                        <NumberStepperInput
                            label="Maximum Nights"
                            value={formData.maximumNights || 365}
                            onChange={(value) => updateFormData({maximumNights: value})}
                            min={1}
                            max={365}
                            format="integer"
                            width="100%"
                        />
                    </Box>
                </Box>

                {/* Additional Policies */}
                <Box>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                        House Rules & Additional Policies
                    </label>
                    <textarea
                        value={formData.additionalRules || ''}
                        onChange={(e) => updateFormData({additionalRules: e.target.value})}
                        placeholder="Enter any additional house rules, policies, or important information for guests..."
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

                <Box
                    padding="1rem"
                    backgroundColor="#f0f9ff"
                    borderRadius="0.5rem"
                    border="1px solid #bae6fd"
                >
                    <h4 style={{margin: '0 0 0.5rem 0', color: '#0369a1', fontSize: '0.875rem', fontWeight: '600'}}>
                        📋 Rules & Policies Tips
                    </h4>
                    <ul style={{
                        margin: 0,
                        paddingLeft: '1rem',
                        fontSize: '0.875rem',
                        color: '#0c4a6e',
                        lineHeight: '1.5'
                    }}>
                        <li>Clear rules prevent misunderstandings with guests</li>
                        <li>Standard check-in: 3:00 PM, check-out: 11:00 AM</li>
                        <li>Minimum nights can improve booking value</li>
                        <li>Use mobile-friendly time pickers for accurate scheduling</li>
                    </ul>
                </Box>
            </Box>
        </Box>
    )
}

export default RulesTab