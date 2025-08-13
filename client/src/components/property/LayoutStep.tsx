import React from 'react'
import { WizardFormData, Room, Bed } from '../../types/property'
import { Box } from '../Box'

interface LayoutStepProps {
  data: WizardFormData
  onChange: (updates: Partial<WizardFormData>) => void
  onNext: () => void
  onPrevious: () => void
  onSubmit: () => void
  loading: boolean
  isFirstStep: boolean
  isLastStep: boolean
}

const bedTypes = [
  'Single bed',
  'Double bed',
  'Queen bed', 
  'King bed',
  'Bunk bed',
  'Sofa bed',
  'Floor mattress'
]

const LayoutStep: React.FC<LayoutStepProps> = ({
  data,
  onChange,
  onNext,
  onPrevious,
  loading
}) => {
  const handleLayoutChange = (field: keyof typeof data.layout, value: any) => {
    onChange({
      layout: {
        ...data.layout,
        [field]: value
      }
    })
  }

  const handleRoomChange = (roomIndex: number, field: keyof Room, value: any) => {
    const rooms = [...(data.layout.rooms || [])]
    rooms[roomIndex] = { ...rooms[roomIndex], [field]: value }
    handleLayoutChange('rooms', rooms)
  }

  const handleBedChange = (roomIndex: number, bedIndex: number, field: keyof Bed, value: any) => {
    const rooms = [...(data.layout.rooms || [])]
    const beds = [...(rooms[roomIndex].beds || [])]
    beds[bedIndex] = { ...beds[bedIndex], [field]: value }
    rooms[roomIndex] = { ...rooms[roomIndex], beds }
    handleLayoutChange('rooms', rooms)
  }

  const addRoom = () => {
    const rooms = data.layout.rooms || []
    handleLayoutChange('rooms', [...rooms, { spaceName: '', beds: [] }])
  }

  const removeRoom = (index: number) => {
    const rooms = data.layout.rooms || []
    handleLayoutChange('rooms', rooms.filter((_, i) => i !== index))
  }

  const addBed = (roomIndex: number) => {
    const rooms = [...(data.layout.rooms || [])]
    const beds = rooms[roomIndex].beds || []
    rooms[roomIndex] = { ...rooms[roomIndex], beds: [...beds, { typeOfBed: 'Single bed', numberOfBed: 1 }] }
    handleLayoutChange('rooms', rooms)
  }

  const removeBed = (roomIndex: number, bedIndex: number) => {
    const rooms = [...(data.layout.rooms || [])]
    const beds = rooms[roomIndex].beds || []
    rooms[roomIndex] = { ...rooms[roomIndex], beds: beds.filter((_, i) => i !== bedIndex) }
    handleLayoutChange('rooms', rooms)
  }

  const isValid = data.layout.maximumGuest >= 1 && data.layout.bathrooms >= 1

  return (
    <Box padding="2rem">
      <Box marginBottom="2rem">
        <Box fontSize="1.5rem" fontWeight="600" color="#1a202c" marginBottom="0.5rem">
          Tell us about your space
        </Box>
        <Box color="#718096">
          Share some basic info about your place
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap="1.5rem">
        {/* Basic Numbers */}
        <Box display="grid" gridTemplateColumns={{ Sm: '1fr 1fr' }} gap="1rem">
          <Box>
            <Box
              as="label"
              display="block"
              fontSize="0.875rem"
              fontWeight="500"
              color="#374151"
              marginBottom="0.5rem"
            >
              Maximum Guests *
            </Box>
            <Box
              as="input"
              type="number"
              min="1"
              max="16"
              value={data.layout.maximumGuest}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                handleLayoutChange('maximumGuest', parseInt(e.target.value) || 1)
              }
              width="100%"
              padding="0.75rem"
              border="1px solid #d1d5db"
              borderRadius="0.375rem"
              fontSize="1rem"
              whileFocus={{ borderColor: '#3182ce', outline: 'none', boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)' }}
            />
          </Box>

          <Box>
            <Box
              as="label"
              display="block"
              fontSize="0.875rem"
              fontWeight="500"
              color="#374151"
              marginBottom="0.5rem"
            >
              Bathrooms *
            </Box>
            <Box
              as="input"
              type="number"
              min="1"
              max="10"
              value={data.layout.bathrooms}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                handleLayoutChange('bathrooms', parseInt(e.target.value) || 1)
              }
              width="100%"
              padding="0.75rem"
              border="1px solid #d1d5db"
              borderRadius="0.375rem"
              fontSize="1rem"
              whileFocus={{ borderColor: '#3182ce', outline: 'none', boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)' }}
            />
          </Box>
        </Box>

        {/* Property Size */}
        <Box>
          <Box
            as="label"
            display="block"
            fontSize="0.875rem"
            fontWeight="500"
            color="#374151"
            marginBottom="0.5rem"
          >
            Property Size (Square Meters) - Optional
          </Box>
          <Box
            as="input"
            type="number"
            min="0"
            value={data.layout.propertySizeSqMtr || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handleLayoutChange('propertySizeSqMtr', parseInt(e.target.value) || undefined)
            }
            placeholder="e.g., 120"
            width="100%"
            padding="0.75rem"
            border="1px solid #d1d5db"
            borderRadius="0.375rem"
            fontSize="1rem"
            whileFocus={{ borderColor: '#3182ce', outline: 'none', boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)' }}
          />
        </Box>

        {/* Children and Cribs */}
        <Box display="flex" flexDirection="column" gap="1rem">
          <Box display="flex" alignItems="center" gap="0.75rem">
            <Box
              as="input"
              type="checkbox"
              checked={data.layout.allowChildren}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                handleLayoutChange('allowChildren', e.target.checked)
              }
              accentColor="#3182ce"
            />
            <Box fontSize="0.875rem" color="#374151">
              Allow children (ages 2-12)
            </Box>
          </Box>

          {data.layout.allowChildren && (
            <Box display="flex" alignItems="center" gap="0.75rem" marginLeft="1.5rem">
              <Box
                as="input"
                type="checkbox"
                checked={data.layout.offerCribs}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleLayoutChange('offerCribs', e.target.checked)
                }
                accentColor="#3182ce"
              />
              <Box fontSize="0.875rem" color="#374151">
                Offer cribs for infants
              </Box>
            </Box>
          )}
        </Box>

        {/* Rooms and Beds */}
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="1rem">
            <Box fontSize="1rem" fontWeight="500" color="#374151">
              Rooms and Sleeping Arrangements (Optional)
            </Box>
            <Box
              as="button"
              onClick={addRoom}
              padding="0.5rem 1rem"
              backgroundColor="#3182ce"
              color="white"
              border="none"
              borderRadius="0.375rem"
              fontSize="0.875rem"
              cursor="pointer"
              whileHover={{ backgroundColor: '#2c5aa0' }}
            >
              Add Room
            </Box>
          </Box>

          {data.layout.rooms?.map((room, roomIndex) => (
            <Box
              key={roomIndex}
              border="1px solid #e5e7eb"
              borderRadius="0.5rem"
              padding="1rem"
              marginBottom="1rem"
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="1rem">
                <Box
                  as="input"
                  type="text"
                  value={room.spaceName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleRoomChange(roomIndex, 'spaceName', e.target.value)
                  }
                  placeholder={`Room ${roomIndex + 1} name (e.g., Master bedroom, Living room)`}
                  flex="1"
                  padding="0.5rem"
                  border="1px solid #d1d5db"
                  borderRadius="0.375rem"
                  fontSize="0.875rem"
                  whileFocus={{ borderColor: '#3182ce', outline: 'none' }}
                />
                <Box
                  as="button"
                  onClick={() => removeRoom(roomIndex)}
                  marginLeft="0.5rem"
                  padding="0.5rem"
                  backgroundColor="#dc2626"
                  color="white"
                  border="none"
                  borderRadius="0.375rem"
                  fontSize="0.75rem"
                  cursor="pointer"
                  whileHover={{ backgroundColor: '#b91c1c' }}
                >
                  Remove
                </Box>
              </Box>

              <Box marginBottom="0.5rem">
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box fontSize="0.875rem" fontWeight="500" color="#374151">
                    Beds in this room:
                  </Box>
                  <Box
                    as="button"
                    onClick={() => addBed(roomIndex)}
                    padding="0.25rem 0.5rem"
                    backgroundColor="#10b981"
                    color="white"
                    border="none"
                    borderRadius="0.25rem"
                    fontSize="0.75rem"
                    cursor="pointer"
                    whileHover={{ backgroundColor: '#059669' }}
                  >
                    Add Bed
                  </Box>
                </Box>
              </Box>

              {room.beds?.map((bed, bedIndex) => (
                <Box
                  key={bedIndex}
                  display="flex"
                  alignItems="center"
                  gap="0.5rem"
                  marginBottom="0.5rem"
                  padding="0.5rem"
                  backgroundColor="#f9fafb"
                  borderRadius="0.25rem"
                >
                  <Box
                    as="select"
                    value={bed.typeOfBed}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                      handleBedChange(roomIndex, bedIndex, 'typeOfBed', e.target.value)
                    }
                    flex="1"
                    padding="0.25rem"
                    border="1px solid #d1d5db"
                    borderRadius="0.25rem"
                    fontSize="0.75rem"
                  >
                    {bedTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </Box>
                  <Box
                    as="input"
                    type="number"
                    min="1"
                    max="4"
                    value={bed.numberOfBed}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleBedChange(roomIndex, bedIndex, 'numberOfBed', parseInt(e.target.value) || 1)
                    }
                    width="60px"
                    padding="0.25rem"
                    border="1px solid #d1d5db"
                    borderRadius="0.25rem"
                    fontSize="0.75rem"
                  />
                  <Box
                    as="button"
                    onClick={() => removeBed(roomIndex, bedIndex)}
                    padding="0.25rem"
                    backgroundColor="#dc2626"
                    color="white"
                    border="none"
                    borderRadius="0.25rem"
                    fontSize="0.75rem"
                    cursor="pointer"
                    whileHover={{ backgroundColor: '#b91c1c' }}
                  >
                    ×
                  </Box>
                </Box>
              ))}
            </Box>
          ))}
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
            disabled={!isValid || loading}
            padding="0.75rem 2rem"
            backgroundColor={isValid ? '#3182ce' : '#9ca3af'}
            color="white"
            border="none"
            borderRadius="0.375rem"
            fontSize="1rem"
            fontWeight="500"
            cursor={isValid ? 'pointer' : 'not-allowed'}
            whileHover={isValid ? { backgroundColor: '#2c5aa0' } : {}}
          >
            {loading ? 'Saving...' : 'Next'}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default LayoutStep