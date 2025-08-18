import React from 'react'
import { WizardFormData } from '../../types/property'
import { Box } from '../Box'
import TimePicker from '../TimePicker'
import { PetPolicy, PetPolicyLabels } from '../../constants/propertyEnums'
import { 
  FaSmokingBan, 
  FaSmoking, 
  FaGlassCheers, 
  FaBan, 
  FaPaw, 
  FaQuestionCircle,
  FaClock,
  FaSignInAlt,
  FaSignOutAlt
} from 'react-icons/fa'

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
    // Extract time from ISO string if needed
    const timeValue = value.includes('T') ? new Date(value).toTimeString().slice(0, 5) : value
    
    onChange({
      checkInCheckout: {
        ...data.checkInCheckout,
        checkInFrom: data.checkInCheckout?.checkInFrom || '15:00',
        checkInUntil: data.checkInCheckout?.checkInUntil || '20:00',
        checkOutFrom: data.checkInCheckout?.checkOutFrom || '08:00',
        checkOutUntil: data.checkInCheckout?.checkOutUntil || '11:00',
        [field]: timeValue
      }
    })
  }
  
  // Helper to convert time string to ISO date for TimePicker
  const timeToISO = (timeStr: string) => {
    if (!timeStr) return undefined
    const today = new Date()
    const [hours, minutes] = timeStr.split(':').map(Number)
    today.setHours(hours, minutes, 0, 0)
    return today.toISOString()
  }

  return (
    <Box paddingSm="1rem" paddingMd="2rem">
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
            <Box 
              as="label"
              display="flex" 
              alignItems="center" 
              gap="1rem"
              padding="0.75rem"
              backgroundColor="white"
              borderRadius="0.375rem"
              cursor="pointer"
              whileHover={{ backgroundColor: '#f1f5f9' }}
            >
              <Box
                as="input"
                type="checkbox"
                checked={data.smokingAllowed}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleRuleChange('smokingAllowed', e.target.checked)
                }
                accentColor="#3182ce"
                width="1.25rem"
                height="1.25rem"
              />
              <Box display="flex" alignItems="center" gap="0.5rem">
                {data.smokingAllowed ? (
                  <FaSmoking color="#f59e0b" size="1.25rem" />
                ) : (
                  <FaSmokingBan color="#ef4444" size="1.25rem" />
                )}
                <Box>
                  <Box fontSize="1rem" color="#374151" fontWeight="500">
                    {data.smokingAllowed ? 'Smoking allowed' : 'No smoking'}
                  </Box>
                  <Box fontSize="1rem" color="#6b7280">
                    {data.smokingAllowed 
                      ? 'Guests are permitted to smoke in the property'
                      : 'Smoking is not allowed in the property'
                    }
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box 
              as="label"
              display="flex" 
              alignItems="center" 
              gap="1rem"
              padding="0.75rem"
              backgroundColor="white"
              borderRadius="0.375rem"
              cursor="pointer"
              whileHover={{ backgroundColor: '#f1f5f9' }}
            >
              <Box
                as="input"
                type="checkbox"
                checked={data.partiesOrEventsAllowed}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleRuleChange('partiesOrEventsAllowed', e.target.checked)
                }
                accentColor="#3182ce"
                width="1.25rem"
                height="1.25rem"
              />
              <Box display="flex" alignItems="center" gap="0.5rem">
                {data.partiesOrEventsAllowed ? (
                  <FaGlassCheers color="#10b981" size="1.25rem" />
                ) : (
                  <FaBan color="#ef4444" size="1.25rem" />
                )}
                <Box>
                  <Box fontSize="1rem" color="#374151" fontWeight="500">
                    {data.partiesOrEventsAllowed ? 'Parties and events allowed' : 'No parties or events'}
                  </Box>
                  <Box fontSize="1rem" color="#6b7280">
                    {data.partiesOrEventsAllowed 
                      ? 'Guests can organize parties or events at the property'
                      : 'Parties and events are not allowed at the property'
                    }
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Pet Policy Options */}
            <Box>
              <Box fontSize="1rem" fontWeight="500" color="#374151" marginBottom="0.75rem">
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
                      <Box display="flex" alignItems="center" gap="0.5rem" fontSize="1rem" color="#374151" fontWeight="500">
                        {policy === PetPolicy.Yes && <FaPaw color="#10b981" />}
                        {policy === PetPolicy.No && <FaBan color="#ef4444" />}
                        {policy === PetPolicy.UponRequest && <FaQuestionCircle color="#f59e0b" />}
                        {PetPolicyLabels[policy]}
                      </Box>
                      <Box fontSize="1rem" color="#6b7280">
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
          <Box display="flex" alignItems="center" gap="0.5rem" fontSize="1rem" fontWeight="500" color="#374151" marginBottom="1rem">
            <FaClock color="#3182ce" />
            Check-in and Check-out Times
          </Box>
          <Box display="grid" gridTemplateColumnsSm="1fr" gridTemplateColumnsMd="1fr 1fr" gap="1rem">
            <Box>
              <Box display="flex" alignItems="center" gap="0.5rem" fontSize="1rem" fontWeight="500" color="#374151" marginBottom="0.5rem">
                <FaSignInAlt color="#10b981" />
                Check-in
              </Box>
              <Box display="flex" alignItems="center" gap="0.5rem">
                <Box flex="1">
                  <TimePicker
                    label="From"
                    value={timeToISO(data.checkInCheckout?.checkInFrom || '15:00')}
                    onChange={(value) => handleCheckInOutChange('checkInFrom', value)}
                    placeholder="Select time"
                    interval={30}
                  />
                </Box>
                <Box flex="1">
                  <TimePicker
                    label="Until"
                    value={timeToISO(data.checkInCheckout?.checkInUntil || '20:00')}
                    onChange={(value) => handleCheckInOutChange('checkInUntil', value)}
                    placeholder="Select time"
                    interval={30}
                  />
                </Box>
              </Box>
            </Box>

            <Box>
              <Box display="flex" alignItems="center" gap="0.5rem" fontSize="1rem" fontWeight="500" color="#374151" marginBottom="0.5rem">
                <FaSignOutAlt color="#ef4444" />
                Check-out
              </Box>
              <Box display="flex" alignItems="center" gap="0.5rem">
                <Box flex="1">
                  <TimePicker
                    label="From"
                    value={timeToISO(data.checkInCheckout?.checkOutFrom || '08:00')}
                    onChange={(value) => handleCheckInOutChange('checkOutFrom', value)}
                    placeholder="Select time"
                    interval={30}
                  />
                </Box>
                <Box flex="1">
                  <TimePicker
                    label="Until"
                    value={timeToISO(data.checkInCheckout?.checkOutUntil || '11:00')}
                    onChange={(value) => handleCheckInOutChange('checkOutUntil', value)}
                    placeholder="Select time"
                    interval={30}
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