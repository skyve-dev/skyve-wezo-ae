import React from 'react'
import {Box} from '@/components'
import TimePicker from '@/components/base/TimePicker.tsx'
import {ValidationErrors, WizardFormData} from '@/types/property'
import {PetPolicy, PetPolicyLabels} from '@/constants/propertyEnums'
import {FaClock, FaCocktail, FaGavel, FaSmokingBan} from 'react-icons/fa'
import MobileSelect from './MobileSelect'

interface RulesTabProps {
    formData: Partial<WizardFormData>
    updateFormData: (updates: Partial<WizardFormData>) => void
    validationErrors?: ValidationErrors | null
}

const RulesTab: React.FC<RulesTabProps> = ({ formData, updateFormData, validationErrors: _validationErrors }) => {
    const updateCheckInCheckout = (field: string, value: string) => {
        updateFormData({
            checkInCheckout: {
                checkInFrom: '15:00',
                checkInUntil: '22:00',
                checkOutFrom: '08:00',
                checkOutUntil: '11:00',
                ...formData.checkInCheckout,
                [field]: value
            }
        })
    }

    return (
        <Box paddingX={'1.5rem'} paddingY={'1.5rem'}>
            <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1.5rem">
                <FaGavel style={{color: '#374151', fontSize: '1.25rem'}} />
                <h3 style={{margin: 0, fontSize: '1.5rem', fontWeight: '600'}}>
                    House Rules & Policies
                </h3>
            </Box>
            
            <Box display="grid" gap="2.5rem">
                {/* Basic Rules */}
                <Box>
                    <h4 style={{marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '500'}}>
                        Basic Rules
                    </h4>
                    <Box display="grid" gap="1rem">
                        {/* Smoking */}
                        <Box>
                            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                                <Box display="flex" alignItems="center" gap="0.5rem">
                                    <FaSmokingBan style={{color: '#374151', fontSize: '0.875rem'}} />
                                    Smoking Policy
                                </Box>
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
                                <Box display="flex" alignItems="center" gap="0.5rem">
                                    <FaCocktail style={{color: '#374151', fontSize: '0.875rem'}} />
                                    Parties & Events
                                </Box>
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
                    <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="1rem">
                        <FaClock style={{color: '#374151', fontSize: '0.875rem'}} />
                        <h4 style={{margin: 0, fontSize: '1.125rem', fontWeight: '500'}}>
                            Check-in & Check-out Times
                        </h4>
                    </Box>
                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem">
                        <TimePicker
                            label="Check-in From"
                            value={formData.checkInCheckout?.checkInFrom ? `2025-01-01T${formData.checkInCheckout.checkInFrom}:00` : '2025-01-01T15:00:00'}
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
                            value={formData.checkInCheckout?.checkInUntil ? `2025-01-01T${formData.checkInCheckout.checkInUntil}:00` : '2025-01-01T22:00:00'}
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
                            value={formData.checkInCheckout?.checkOutFrom ? `2025-01-01T${formData.checkInCheckout.checkOutFrom}:00` : '2025-01-01T08:00:00'}
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
                            value={formData.checkInCheckout?.checkOutUntil ? `2025-01-01T${formData.checkInCheckout.checkOutUntil}:00` : '2025-01-01T11:00:00'}
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
            </Box>
        </Box>
    )
}

export default RulesTab