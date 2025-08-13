import React from 'react'
import { WizardFormData } from '../../types/property'
import { Box } from '../Box'
import { PetPolicy, PetPolicyLabels } from '../../constants/propertyEnums'

interface RulesStepProps {
  data: WizardFormData
  onChange: (updates: Partial<WizardFormData>) => void
  onNext: () => void
  onPrevious: () => void
  onSubmit: () => void
  loading: boolean
  isFirstStep: boolean
  isLastStep: boolean
}

const RulesStep: React.FC<RulesStepProps> = ({
  data,
  onChange,
  onNext,
  onPrevious,
  loading
}) => {
  const handleRuleChange = (field: string, value: any) => {
    onChange({
      [field]: value
    })
  }

  const handleCheckInOutChange = (field: string, value: string) => {
    onChange({
      checkInCheckout: {
        ...data.checkInCheckout,
        checkInFrom: data.checkInCheckout?.checkInFrom || '15:00',
        checkInUntil: data.checkInCheckout?.checkInUntil || '20:00',
        checkOutFrom: data.checkInCheckout?.checkOutFrom || '08:00',
        checkOutUntil: data.checkInCheckout?.checkOutUntil || '11:00',
        [field]: value
      }
    })
  }

  return (
    <Box padding="2rem">
      <Box marginBottom="2rem">
        <Box fontSize="1.5rem" fontWeight="600" color="#1a202c" marginBottom="0.5rem">
          Set your house rules
        </Box>
        <Box color="#718096">
          These help set expectations for your guests
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap="2rem">
        {/* Basic Rules */}
        <Box>
          <Box fontSize="1rem" fontWeight="500" color="#374151" marginBottom="1rem">
            General Rules
          </Box>
          <Box display="flex" flexDirection="column" gap="1rem">
            <Box display="flex" alignItems="center" gap="0.75rem">
              <Box
                as="input"
                type="checkbox"
                checked={data.smokingAllowed}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleRuleChange('smokingAllowed', e.target.checked)
                }
                accentColor="#3182ce"
              />
              <Box>
                <Box fontSize="0.875rem" color="#374151" fontWeight="500">
                  Smoking allowed
                </Box>
                <Box fontSize="0.75rem" color="#6b7280">
                  Guests are permitted to smoke in the property
                </Box>
              </Box>
            </Box>

            <Box display="flex" alignItems="center" gap="0.75rem">
              <Box
                as="input"
                type="checkbox"
                checked={data.partiesOrEventsAllowed}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleRuleChange('partiesOrEventsAllowed', e.target.checked)
                }
                accentColor="#3182ce"
              />
              <Box>
                <Box fontSize="0.875rem" color="#374151" fontWeight="500">
                  Parties and events allowed
                </Box>
                <Box fontSize="0.75rem" color="#6b7280">
                  Guests can organize parties or events at the property
                </Box>
              </Box>
            </Box>

            {/* Pet Policy Options */}
            <Box>
              <Box fontSize="0.875rem" fontWeight="500" color="#374151" marginBottom="0.75rem">
                Pet Policy
              </Box>
              <Box display="flex" flexDirection="column" gap="0.5rem">
                {Object.values(PetPolicy).map((policy) => (
                  <Box
                    key={policy}
                    as="label"
                    display="flex"
                    alignItems="flex-start"
                    gap="0.75rem"
                    padding="0.75rem"
                    border="2px solid"
                    borderColor={data.petsAllowed === policy ? '#3182ce' : '#e5e7eb'}
                    borderRadius="0.375rem"
                    cursor="pointer"
                    whileHover={{ borderColor: '#3182ce' }}
                  >
                    <Box
                      as="input"
                      type="radio"
                      name="petsAllowed"
                      value={policy}
                      checked={data.petsAllowed === policy}
                      onChange={() => handleRuleChange('petsAllowed', policy)}
                      accentColor="#3182ce"
                    />
                    <Box>
                      <Box fontSize="0.875rem" color="#374151" fontWeight="500">
                        {PetPolicyLabels[policy]}
                      </Box>
                      <Box fontSize="0.75rem" color="#6b7280">
                        {policy === PetPolicy.Yes && 'Guests can bring their pets (additional fees may apply)'}
                        {policy === PetPolicy.No && 'Pets are not allowed at this property'}
                        {policy === PetPolicy.UponRequest && 'Pet approval required - guests must ask permission'}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Check-in/Check-out Times */}
        <Box>
          <Box fontSize="1rem" fontWeight="500" color="#374151" marginBottom="1rem">
            Check-in and Check-out Times
          </Box>
          <Box display="grid" gridTemplateColumns={{ Sm: '1fr', Md: '1fr 1fr' }} gap="1rem">
            <Box>
              <Box fontSize="0.875rem" fontWeight="500" color="#374151" marginBottom="0.5rem">
                Check-in
              </Box>
              <Box display="flex" alignItems="center" gap="0.5rem">
                <Box flex="1">
                  <Box fontSize="0.75rem" color="#6b7280" marginBottom="0.25rem">
                    From
                  </Box>
                  <Box
                    as="input"
                    type="time"
                    value={data.checkInCheckout?.checkInFrom || '15:00'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleCheckInOutChange('checkInFrom', e.target.value)
                    }
                    width="100%"
                    padding="0.5rem"
                    border="1px solid #d1d5db"
                    borderRadius="0.375rem"
                    fontSize="0.875rem"
                    whileFocus={{ borderColor: '#3182ce', outline: 'none' }}
                  />
                </Box>
                <Box flex="1">
                  <Box fontSize="0.75rem" color="#6b7280" marginBottom="0.25rem">
                    Until
                  </Box>
                  <Box
                    as="input"
                    type="time"
                    value={data.checkInCheckout?.checkInUntil || '20:00'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleCheckInOutChange('checkInUntil', e.target.value)
                    }
                    width="100%"
                    padding="0.5rem"
                    border="1px solid #d1d5db"
                    borderRadius="0.375rem"
                    fontSize="0.875rem"
                    whileFocus={{ borderColor: '#3182ce', outline: 'none' }}
                  />
                </Box>
              </Box>
            </Box>

            <Box>
              <Box fontSize="0.875rem" fontWeight="500" color="#374151" marginBottom="0.5rem">
                Check-out
              </Box>
              <Box display="flex" alignItems="center" gap="0.5rem">
                <Box flex="1">
                  <Box fontSize="0.75rem" color="#6b7280" marginBottom="0.25rem">
                    From
                  </Box>
                  <Box
                    as="input"
                    type="time"
                    value={data.checkInCheckout?.checkOutFrom || '08:00'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleCheckInOutChange('checkOutFrom', e.target.value)
                    }
                    width="100%"
                    padding="0.5rem"
                    border="1px solid #d1d5db"
                    borderRadius="0.375rem"
                    fontSize="0.875rem"
                    whileFocus={{ borderColor: '#3182ce', outline: 'none' }}
                  />
                </Box>
                <Box flex="1">
                  <Box fontSize="0.75rem" color="#6b7280" marginBottom="0.25rem">
                    Until
                  </Box>
                  <Box
                    as="input"
                    type="time"
                    value={data.checkInCheckout?.checkOutUntil || '11:00'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleCheckInOutChange('checkOutUntil', e.target.value)
                    }
                    width="100%"
                    padding="0.5rem"
                    border="1px solid #d1d5db"
                    borderRadius="0.375rem"
                    fontSize="0.875rem"
                    whileFocus={{ borderColor: '#3182ce', outline: 'none' }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
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
            onClick={onNext}
            disabled={loading}
            padding="0.75rem 2rem"
            backgroundColor="#3182ce"
            color="white"
            border="none"
            borderRadius="0.375rem"
            fontSize="1rem"
            fontWeight="500"
            cursor="pointer"
            whileHover={{ backgroundColor: '#2c5aa0' }}
          >
            {loading ? 'Saving...' : 'Next'}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default RulesStep