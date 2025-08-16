import React from 'react'
import { WizardFormData, Room, Bed } from '../../types/property'
import { Box } from '../Box'
import { BedType, BedTypeLabels } from '../../constants/propertyEnums'
import SelectionPicker from '../SelectionPicker'
import { 
  FaUserFriends, 
  FaBath, 
  FaRulerCombined, 
  FaChild, 
  FaBaby, 
  FaBed, 
  FaPlus, 
  FaTrash,
  FaHome,
  FaTimes
} from 'react-icons/fa'

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

// Data for SelectionPicker components
const bedTypeOptions = Object.values(BedType).map(type => ({
  id: type,
  label: BedTypeLabels[type],
  value: type
}))

const bedNumberOptions = [
  { id: 1, label: '1', value: 1 },
  { id: 2, label: '2', value: 2 },
  { id: 3, label: '3', value: 3 },
  { id: 4, label: '4+', value: 4 }
]

const LayoutStep: React.FC<LayoutStepProps> = ({
  data,
  onChange,
  onNext,
  onPrevious,
  loading
}) => {
  const handleLayoutChange = (field: string, value: any) => {
    onChange({
      [field]: value
    })
  }

  const handleRoomChange = (roomIndex: number, field: keyof Room, value: any) => {
    const rooms = [...(data.rooms || [])]
    rooms[roomIndex] = { ...rooms[roomIndex], [field]: value }
    handleLayoutChange('rooms', rooms)
  }

  const handleBedChange = (roomIndex: number, bedIndex: number, field: keyof Bed, value: any) => {
    const rooms = [...(data.rooms || [])]
    const beds = [...(rooms[roomIndex].beds || [])]
    beds[bedIndex] = { ...beds[bedIndex], [field]: value }
    rooms[roomIndex] = { ...rooms[roomIndex], beds }
    handleLayoutChange('rooms', rooms)
  }

  const addRoom = () => {
    const rooms = data.rooms || []
    handleLayoutChange('rooms', [...rooms, { spaceName: '', beds: [] }])
  }

  const removeRoom = (index: number) => {
    const rooms = data.rooms || []
    handleLayoutChange('rooms', rooms.filter((_: any, i: number) => i !== index))
  }

  const addBed = (roomIndex: number) => {
    const rooms = [...(data.rooms || [])]
    const beds = rooms[roomIndex].beds || []
    rooms[roomIndex] = { ...rooms[roomIndex], beds: [...beds, { typeOfBed: BedType.TwinBed, numberOfBed: 1 }] }
    handleLayoutChange('rooms', rooms)
  }

  const removeBed = (roomIndex: number, bedIndex: number) => {
    const rooms = [...(data.rooms || [])]
    const beds = rooms[roomIndex].beds || []
    rooms[roomIndex] = { ...rooms[roomIndex], beds: beds.filter((_: any, i: number) => i !== bedIndex) }
    handleLayoutChange('rooms', rooms)
  }

  const isValid = data.maximumGuest >= 1 && data.bathrooms >= 1

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
        <Box display="grid" gridTemplateColumns={{ Sm: '1fr', Md: '1fr 1fr' }} gap="1.5rem">
          <Box>
            <Box
              as="label"
              display="flex"
              alignItems="center"
              gap="0.5rem"
              fontSize="0.875rem"
              fontWeight="500"
              color="#374151"
              marginBottom="0.75rem"
            >
              <FaUserFriends color="#3182ce" />
              Maximum Guests *
            </Box>
            <Box
              as="input"
              type="number"
              min="1"
              max="16"
              value={data.maximumGuest}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                handleLayoutChange('maximumGuest', parseInt(e.target.value) || 1)
              }
              width="100%"
              padding="1rem"
              border="2px solid #e5e7eb"
              borderRadius="0.5rem"
              fontSize="1rem"
              backgroundColor="white"
              whileFocus={{ 
                borderColor: '#3182ce', 
                outline: 'none', 
                boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)' 
              }}
            />
          </Box>

          <Box>
            <Box
              as="label"
              display="flex"
              alignItems="center"
              gap="0.5rem"
              fontSize="0.875rem"
              fontWeight="500"
              color="#374151"
              marginBottom="0.75rem"
            >
              <FaBath color="#3182ce" />
              Bathrooms *
            </Box>
            <Box
              as="input"
              type="number"
              min="1"
              max="10"
              value={data.bathrooms}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                handleLayoutChange('bathrooms', parseInt(e.target.value) || 1)
              }
              width="100%"
              padding="1rem"
              border="2px solid #e5e7eb"
              borderRadius="0.5rem"
              fontSize="1rem"
              backgroundColor="white"
              whileFocus={{ 
                borderColor: '#3182ce', 
                outline: 'none', 
                boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)' 
              }}
            />
          </Box>
        </Box>

        {/* Property Size */}
        <Box>
          <Box
            as="label"
            display="flex"
            alignItems="center"
            gap="0.5rem"
            fontSize="0.875rem"
            fontWeight="500"
            color="#374151"
            marginBottom="0.75rem"
          >
            <FaRulerCombined color="#3182ce" />
            Property Size (Square Meters) - Optional
          </Box>
          <Box
            as="input"
            type="number"
            min="0"
            value={data.propertySizeSqMtr || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handleLayoutChange('propertySizeSqMtr', parseInt(e.target.value) || undefined)
            }
            placeholder="e.g., 120"
            width="100%"
            padding="1rem"
            border="2px solid #e5e7eb"
            borderRadius="0.5rem"
            fontSize="1rem"
            backgroundColor="white"
            whileFocus={{ 
              borderColor: '#3182ce', 
              outline: 'none', 
              boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)' 
            }}
          />
        </Box>

        {/* Children and Cribs */}
        <Box 
          backgroundColor="#f8fafc"
          padding="1.5rem"
          borderRadius="0.5rem"
          border="2px solid #e2e8f0"
        >
          <Box fontSize="1rem" fontWeight="500" color="#374151" marginBottom="1rem">
            <Box display="flex" alignItems="center" gap="0.5rem">
              <FaChild color="#3182ce" />
              Guest Accommodations
            </Box>
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
                checked={data.allowChildren}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleLayoutChange('allowChildren', e.target.checked)
                }
                accentColor="#3182ce"
                width="1.25rem"
                height="1.25rem"
              />
              <Box fontSize="1rem" color="#374151" fontWeight="500">
                Allow children (ages 2-12)
              </Box>
            </Box>

            {data.allowChildren && (
              <Box 
                as="label"
                display="flex" 
                alignItems="center" 
                gap="1rem"
                marginLeft="1rem"
                padding="0.75rem"
                backgroundColor="white"
                borderRadius="0.375rem"
                cursor="pointer"
                whileHover={{ backgroundColor: '#f1f5f9' }}
              >
                <Box
                  as="input"
                  type="checkbox"
                  checked={data.offerCribs}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleLayoutChange('offerCribs', e.target.checked)
                  }
                  accentColor="#3182ce"
                  width="1.25rem"
                  height="1.25rem"
                />
                <Box display="flex" alignItems="center" gap="0.5rem">
                  <FaBaby color="#10b981" />
                  <Box fontSize="1rem" color="#374151" fontWeight="500">
                    Offer cribs for infants
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* Rooms and Beds */}
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="1.5rem">
            <Box display="flex" alignItems="center" gap="0.5rem">
              <FaHome color="#3182ce" />
              <Box fontSize="1.125rem" fontWeight="600" color="#374151">
                Rooms and Sleeping Arrangements (Optional)
              </Box>
            </Box>
            <Box
              as="button"
              onClick={addRoom}
              display="flex"
              alignItems="center"
              gap="0.5rem"
              padding="0.75rem 1.25rem"
              backgroundColor="#3182ce"
              color="white"
              border="none"
              borderRadius="0.5rem"
              fontSize="1rem"
              fontWeight="500"
              cursor="pointer"
              whileHover={{ backgroundColor: '#2c5aa0', transform: 'translateY(-1px)' }}
              boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
            >
              <FaPlus size="0.875rem" />
              Add Room
            </Box>
          </Box>

          {data.rooms?.map((room: any, roomIndex: number) => (
            <Box
              key={roomIndex}
              border="2px solid #e2e8f0"
              borderRadius="0.75rem"
              padding="1.5rem"
              marginBottom="1.5rem"
              backgroundColor="white"
              boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
            >
              <Box 
                display="flex" 
                flexDirection="column" 
                gap="1rem" 
                marginBottom="1.5rem"
              >
                <Box flex="1">
                  <Box
                    as="input"
                    type="text"
                    value={room.spaceName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleRoomChange(roomIndex, 'spaceName', e.target.value)
                    }
                    placeholder={`Room ${roomIndex + 1} name (e.g., Master bedroom, Living room)`}
                    width="100%"
                    padding="1rem"
                    border="2px solid #e5e7eb"
                    borderRadius="0.5rem"
                    fontSize="1rem"
                    backgroundColor="#f9fafb"
                    whileFocus={{ 
                      borderColor: '#3182ce', 
                      outline: 'none',
                      backgroundColor: 'white',
                      boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)' 
                    }}
                  />
                </Box>
                <Box
                  as="button"
                  onClick={() => removeRoom(roomIndex)}
                  display="flex"
                  alignItems="center"
                  gap="0.5rem"
                  padding="0.75rem 1rem"
                  backgroundColor="#dc2626"
                  color="white"
                  border="none"
                  borderRadius="0.5rem"
                  fontSize="0.875rem"
                  fontWeight="500"
                  cursor="pointer"
                  whileHover={{ backgroundColor: '#b91c1c', transform: 'translateY(-1px)' }}
                  boxShadow="0 2px 4px rgba(220, 38, 38, 0.2)"
                >
                  <FaTrash size="0.75rem" />
                  Remove Room
                </Box>
              </Box>

              <Box marginBottom="1rem">
                <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="1rem">
                  <Box display="flex" alignItems="center" gap="0.5rem">
                    <FaBed color="#10b981" />
                    <Box fontSize="1rem" fontWeight="600" color="#374151">
                      Beds in this room:
                    </Box>
                  </Box>
                  <Box
                    as="button"
                    onClick={() => addBed(roomIndex)}
                    display="flex"
                    alignItems="center"
                    gap="0.5rem"
                    padding="0.5rem 1rem"
                    backgroundColor="#10b981"
                    color="white"
                    border="none"
                    borderRadius="0.375rem"
                    fontSize="0.875rem"
                    fontWeight="500"
                    cursor="pointer"
                    whileHover={{ backgroundColor: '#059669', transform: 'translateY(-1px)' }}
                    boxShadow="0 2px 4px rgba(16, 185, 129, 0.2)"
                  >
                    <FaPlus size="0.75rem" />
                    Add Bed
                  </Box>
                </Box>
              </Box>

              {room.beds?.map((bed: any, bedIndex: number) => (
                <Box
                  key={bedIndex}
                  padding="1rem"
                  marginBottom="1rem"
                  backgroundColor="#f8fafc"
                  border="2px solid #e2e8f0"
                  borderRadius="0.5rem"
                >
                  <Box display="flex" flexDirection="column" gap="1rem">
                    {/* Bed Type Selection */}
                    <Box>
                      <Box fontSize="0.875rem" fontWeight="500" color="#374151" marginBottom="0.5rem">
                        Bed Type
                      </Box>
                      <SelectionPicker
                        data={bedTypeOptions}
                        containerStyles={{
                          display:'flex',
                          flexDirection:'row',
                          flexWrap:'wrap'
                        }}
                        flexDirection={'row'}
                        idAccessor={(item) => item.id}
                        value={bed.typeOfBed}
                        onChange={(value) => handleBedChange(roomIndex, bedIndex, 'typeOfBed', value)}
                        renderItem={(item, isSelected) => (
                          <Box
                            padding="0.75rem"
                            borderRadius="0.375rem"
                            backgroundColor={isSelected ? '#3182ce' : 'white'}
                            color={isSelected ? 'white' : '#374151'}
                            fontWeight={isSelected ? '500' : '400'}
                            border={isSelected ? 'none' : '1px solid #e5e7eb'}
                            cursor="pointer"
                            whileHover={{ 
                              backgroundColor: isSelected ? '#2c5aa0' : '#f1f5f9',
                              transform: 'translateY(-1px)'
                            }}
                          >
                            {item.label}
                          </Box>
                        )}
                        gap="0.5rem"
                        marginBottom="0.5rem"
                      />
                    </Box>

                    {/* Number of Beds Selection */}
                    <Box>
                      <Box fontSize="0.875rem" fontWeight="500" color="#374151" marginBottom="0.5rem">
                        Number of Beds
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <SelectionPicker
                          data={bedNumberOptions}
                          containerStyles={{
                            display:'flex',
                            flexDirection:'row'
                          }}
                          idAccessor={(item) => item.id}
                          value={bed.numberOfBed}
                          onChange={(value) => handleBedChange(roomIndex, bedIndex, 'numberOfBed', value)}
                          renderItem={(item, isSelected) => (
                            <Box
                              padding="0.75rem"
                              borderRadius="0.375rem"
                              backgroundColor={isSelected ? '#10b981' : 'white'}
                              color={isSelected ? 'white' : '#374151'}
                              fontWeight={isSelected ? '600' : '400'}
                              border={isSelected ? 'none' : '1px solid #e5e7eb'}
                              cursor="pointer"
                              textAlign="center"
                              whileHover={{ 
                                backgroundColor: isSelected ? '#059669' : '#f1f5f9',
                                transform: 'translateY(-1px)'
                              }}
                            >
                              {item.label}
                            </Box>
                          )}
                          gap="0.5rem"
                          flex="1"
                          marginRight="1rem"
                        />
                        
                        <Box
                          as="button"
                          onClick={() => removeBed(roomIndex, bedIndex)}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          width="2.5rem"
                          height="2.5rem"
                          backgroundColor="#dc2626"
                          color="white"
                          border="none"
                          borderRadius="50%"
                          cursor="pointer"
                          whileHover={{ backgroundColor: '#b91c1c', transform: 'scale(1.1)' }}
                          boxShadow="0 2px 4px rgba(220, 38, 38, 0.2)"
                        >
                          <FaTimes size="0.875rem" />
                        </Box>
                      </Box>
                    </Box>
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
        borderTop="2px solid #e2e8f0"
      >
        <Box>
          <Box
            as="button"
            onClick={onPrevious}
            padding="1rem 2rem"
            backgroundColor="transparent"
            color="#6b7280"
            border="2px solid #d1d5db"
            borderRadius="0.5rem"
            fontSize="1rem"
            fontWeight="500"
            cursor="pointer"
            whileHover={{ 
              borderColor: '#9ca3af', 
              backgroundColor: '#f9fafb',
              transform: 'translateY(-1px)'
            }}
            boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
          >
            Previous
          </Box>
        </Box>

        <Box>
          <Box
            as="button"
            onClick={onNext}
            disabled={!isValid || loading}
            padding="1rem 2rem"
            backgroundColor={isValid ? '#3182ce' : '#9ca3af'}
            color="white"
            border="none"
            borderRadius="0.5rem"
            fontSize="1rem"
            fontWeight="600"
            cursor={isValid ? 'pointer' : 'not-allowed'}
            whileHover={isValid ? { 
              backgroundColor: '#2c5aa0',
              transform: 'translateY(-1px)'
            } : {}}
            boxShadow={isValid ? '0 4px 8px rgba(49, 130, 206, 0.2)' : 'none'}
          >
            {loading ? 'Saving...' : 'Next'}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default LayoutStep