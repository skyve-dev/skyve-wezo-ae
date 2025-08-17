import React, { useState } from 'react'
import { WizardFormData, Room, Bed } from '../../types/property'
import { Box } from '../Box'
import { BedType, BedTypeLabels, RoomSpaceType, RoomSpaceTypeLabels } from '../../constants/propertyEnums'
import SelectionPicker from '../SelectionPicker'
import SlidingDrawer from '../SlidingDrawer'
import useDrawerManager from '../../hooks/useDrawerManager'
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
  FaTimes,
  FaDoorOpen
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

// Room type options for SelectionPicker
const roomTypeOptions = Object.values(RoomSpaceType).map(type => ({
  id: type,
  label: RoomSpaceTypeLabels[type],
  value: type
}))

const LayoutStep: React.FC<LayoutStepProps> = ({
  data,
  onChange,
  onNext,
  onPrevious,
  loading
}) => {
  const [currentRoomIndex, setCurrentRoomIndex] = useState<number | null>(null)
  const [currentBedIndex, setCurrentBedIndex] = useState<number | null>(null)
  const [bedSelectionType, setBedSelectionType] = useState<'type' | 'number' | null>(null)
  const drawerManager = useDrawerManager()
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
    const newRoomIndex = rooms.length
    handleLayoutChange('rooms', [...rooms, { spaceName: '', beds: [] }])
    
    // Open the drawer for room type selection
    setCurrentRoomIndex(newRoomIndex)
    drawerManager.openDrawer('room-type-selection')
  }
  
  const handleRoomTypeSelection = (roomType: RoomSpaceType) => {
    if (currentRoomIndex !== null) {
      handleRoomChange(currentRoomIndex, 'spaceName', RoomSpaceTypeLabels[roomType])
      drawerManager.closeDrawer('room-type-selection')
      setCurrentRoomIndex(null)
    }
  }
  
  const openRoomTypeEditor = (roomIndex: number) => {
    setCurrentRoomIndex(roomIndex)
    drawerManager.openDrawer('room-type-selection')
  }
  
  const openBedTypeSelection = (roomIndex: number, bedIndex: number) => {
    setCurrentRoomIndex(roomIndex)
    setCurrentBedIndex(bedIndex)
    setBedSelectionType('type')
    drawerManager.openDrawer('bed-selection')
  }
  
  const openBedNumberSelection = (roomIndex: number, bedIndex: number) => {
    setCurrentRoomIndex(roomIndex)
    setCurrentBedIndex(bedIndex)
    setBedSelectionType('number')
    drawerManager.openDrawer('bed-selection')
  }
  
  const handleBedSelection = (value: BedType | number) => {
    if (currentRoomIndex !== null && currentBedIndex !== null && bedSelectionType) {
      const field = bedSelectionType === 'type' ? 'typeOfBed' : 'numberOfBed'
      handleBedChange(currentRoomIndex, currentBedIndex, field as keyof Bed, value)
      drawerManager.closeDrawer('bed-selection')
      setCurrentRoomIndex(null)
      setCurrentBedIndex(null)
      setBedSelectionType(null)
    }
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

  // Updated validation to include mandatory rooms and beds
  const hasRoomsWithBeds = () => {
    const rooms = data.rooms || []
    if (rooms.length === 0) return false
    
    // Check if at least one room has at least one bed
    return rooms.some((room: any) => room.beds && room.beds.length > 0)
  }
  
  const isValid = data.maximumGuest >= 1 && data.bathrooms >= 1 && hasRoomsWithBeds()

  return (
    <Box paddingSm="1rem" paddingMd="2rem">
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
        <Box display="grid" gridTemplateColumnsSm="1fr" gridTemplateColumnsMd="1fr 1fr" gap="1.5rem">
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
            <Box>
              <Box display="flex" alignItems="center" gap="0.5rem">
                <FaHome color="#3182ce" />
                <Box fontSize="1.125rem" fontWeight="600" color="#374151">
                  Rooms and Sleeping Arrangements *
                </Box>
              </Box>
              <Box fontSize="0.875rem" color="#6b7280" marginTop="0.25rem">
                Add at least one room with one bed to continue
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
              <Box fontSize={'12px'} fontSizeMd={'inherit'}>
                Add Room
              </Box>

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
                flexDirection="row"
                alignItems={'flex-end'}
                gap="1rem" 
                marginBottom="1.5rem"
              >
                <Box flex="1">
                  <Box fontSize="0.875rem" fontWeight="500" color="#374151" marginBottom="0.5rem">
                    Room Type *
                  </Box>
                  <Box
                    as="button"
                    onClick={() => openRoomTypeEditor(roomIndex)}
                    width="100%"
                    padding="1rem"
                    border="2px solid #e5e7eb"
                    borderRadius="0.5rem"
                    fontSize="1rem"
                    backgroundColor={room.spaceName ? "white" : "#f9fafb"}
                    cursor="pointer"
                    textAlign="left"
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    whileHover={{ 
                      borderColor: '#3182ce',
                      backgroundColor: '#f8fafc'
                    }}
                  >
                    <Box display="flex" alignItems="center" gap="0.75rem">
                      <FaDoorOpen color={room.spaceName ? "#3182ce" : "#9ca3af"} />
                      <Box color={room.spaceName ? "#374151" : "#9ca3af"}>
                        {room.spaceName || `Select room type for Room ${roomIndex + 1}`}
                      </Box>
                    </Box>
                    <Box color="#6b7280" fontSize="0.875rem">
                      {room.spaceName ? 'Change' : 'Select'}
                    </Box>
                  </Box>
                </Box>
                <Box
                  as="button"
                  onClick={() => removeRoom(roomIndex)}
                  display="flex"
                  alignItems="center"
                  gap="0.5rem"
                  padding="1.15rem 1rem"
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
                  <Box display={'none'} displayMd={'flex'}>
                  Remove Room
                  </Box>
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
                    padding="1.15rem 1rem"
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
                    <Box display={'none'} displayMd={'flex'}>
                    Add Bed
                    </Box>
                  </Box>
                </Box>
              </Box>

              {room.beds?.map((bed: any, bedIndex: number) => (
                <Box
                  key={bedIndex}
                  paddingMd="1rem"
                  marginBottom="1rem"
                  backgroundColorMd="#f8fafc"
                  borderMd="2px solid #e2e8f0"
                  borderRadius="0.5rem"
                >
                  <Box display="flex" flexDirection="row" gap="1rem">
                    {/* Bed Type Selection */}
                    <Box flexGrow={'1'}>
                      <Box fontSize="0.875rem" fontWeight="500" color="#374151" marginBottom="0.5rem">
                        Bed Type *
                      </Box>
                      <Box
                        as="button"
                        onClick={() => openBedTypeSelection(roomIndex, bedIndex)}
                        width="100%"
                        padding="0.75rem"
                        border="2px solid #e5e7eb"
                        borderRadius="0.375rem"
                        fontSize="0.875rem"
                        backgroundColor={bed.typeOfBed ? "white" : "#f9fafb"}
                        cursor="pointer"
                        textAlign="left"
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        whileHover={{ 
                          borderColor: '#3182ce',
                          backgroundColor: '#f8fafc'
                        }}
                      >
                        <Box display="flex" alignItems="center" gap="0.5rem">
                          <FaBed color={bed.typeOfBed ? "#3182ce" : "#9ca3af"} />
                          <Box color={bed.typeOfBed ? "#374151" : "#9ca3af"}>
                            {bed.typeOfBed ? BedTypeLabels[bed.typeOfBed as BedType] : 'Select bed type'}
                          </Box>
                        </Box>
                        <Box display={'none'} displayMd={'flex'} color="#6b7280" fontSize="0.75rem">
                          {bed.typeOfBed ? 'Change' : 'Select'}
                        </Box>
                      </Box>
                    </Box>

                    {/* Number of Beds Selection */}
                    <Box>
                      <Box fontSize="0.875rem" fontWeight="500" color="#374151" marginBottom="0.5rem">
                        Number of Beds *
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box
                          as="button"
                          onClick={() => openBedNumberSelection(roomIndex, bedIndex)}
                          flex="1"
                          gap={'0.5rem'}
                          padding="0.75rem"
                          border="2px solid #e5e7eb"
                          borderRadius="0.375rem"
                          fontSize="0.875rem"
                          backgroundColor={bed.numberOfBed ? "white" : "#f9fafb"}
                          cursor="pointer"
                          textAlign="left"
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                          marginRight="1rem"
                          whileHover={{ 
                            borderColor: '#3182ce',
                            backgroundColor: '#f8fafc'
                          }}
                        >
                          <Box display="flex" alignItems="center" gap="0.5rem">
                            <Box 
                              fontSize="1rem" 
                              fontWeight="600" 
                              color={bed.numberOfBed ? "#10b981" : "#9ca3af"}
                            >
                              {bed.numberOfBed || '#'}
                            </Box>
                            {/*<Box color={bed.numberOfBed ? "#374151" : "#9ca3af"}>*/}
                            {/*  {bed.numberOfBed ? `${bed.numberOfBed === 4 ? '4+' : bed.numberOfBed} bed${bed.numberOfBed > 1 ? 's' : ''}` : 'Select quantity'}*/}
                            {/*</Box>*/}
                          </Box>
                          <Box color="#6b7280" fontSize="0.75rem" display={'none'} displayMd={'flex'}>
                            {bed.numberOfBed ? 'Change' : 'Select'}
                          </Box>
                        </Box>
                        
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
          
          {/* Room Type Selection Drawer */}
          <SlidingDrawer
            isOpen={drawerManager.isDrawerOpen('room-type-selection')}
            onClose={() => {
              drawerManager.closeDrawer('room-type-selection')
              setCurrentRoomIndex(null)
            }}
            side="bottom"
            height="auto"
            zIndex={drawerManager.getDrawerZIndex('room-type-selection')}
            showCloseButton
          >
            <Box padding="1.5rem" display="flex" flexDirection="column">
              <Box fontSize="1.25rem" fontWeight="600" marginBottom="0.5rem" textAlign="center">
                Select Room Type
              </Box>
              <Box fontSize="0.875rem" color="#6b7280" marginBottom="1.5rem" textAlign="center">
                Choose the type of room you're adding
              </Box>
              
              <SelectionPicker
                data={roomTypeOptions}
                idAccessor={(room) => room.id}
                value=""
                onChange={(value) => handleRoomTypeSelection(value as RoomSpaceType)}
                isMultiSelect={false}
                renderItem={(room) => (
                  <Box display="flex" alignItems="center" gap="0.75rem" width="100%">
                    <FaDoorOpen color="#3182ce" size="1.25rem" />
                    <Box fontSize="0.875rem" fontWeight="500" color="#374151">
                      {room.label}
                    </Box>
                  </Box>
                )}
                containerStyles={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.75rem'
                }}
                selectedItemStyles={{
                  borderColor: '#3182ce',
                  backgroundColor: '#eff6ff'
                }}
              />
            </Box>
          </SlidingDrawer>
          
          {/* Bed Selection Drawer */}
          <SlidingDrawer
            isOpen={drawerManager.isDrawerOpen('bed-selection')}
            onClose={() => {
              drawerManager.closeDrawer('bed-selection')
              setCurrentRoomIndex(null)
              setCurrentBedIndex(null)
              setBedSelectionType(null)
            }}
            side="bottom"
            height="auto"
            zIndex={drawerManager.getDrawerZIndex('bed-selection')}
            showCloseButton
          >
            <Box padding="1.5rem" display="flex" flexDirection="column">
              <Box fontSize="1.25rem" fontWeight="600" marginBottom="0.5rem" textAlign="center">
                {bedSelectionType === 'type' ? 'Select Bed Type' : 'Select Number of Beds'}
              </Box>
              <Box fontSize="0.875rem" color="#6b7280" marginBottom="1.5rem" textAlign="center">
                {bedSelectionType === 'type' 
                  ? 'Choose the type of bed for this room'
                  : 'How many beds of this type?'
                }
              </Box>
              
              {bedSelectionType === 'type' ? (
                <SelectionPicker
                  data={bedTypeOptions}
                  idAccessor={(item) => item.id}
                  value=""
                  onChange={(value) => handleBedSelection(value as BedType)}
                  isMultiSelect={false}
                  renderItem={(item) => (
                    <Box display="flex" alignItems="center" gap="0.75rem" width="100%">
                      <FaBed color="#3182ce" size="1.25rem" />
                      <Box fontSize="0.875rem" fontWeight="500" color="#374151">
                        {item.label}
                      </Box>
                    </Box>
                  )}
                  containerStyles={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '0.75rem'
                  }}
                  selectedItemStyles={{
                    borderColor: '#3182ce',
                    backgroundColor: '#eff6ff'
                  }}
                />
              ) : (
                <SelectionPicker
                  data={bedNumberOptions}
                  idAccessor={(item) => item.id}
                  value=""
                  onChange={(value) => handleBedSelection(value as number)}
                  isMultiSelect={false}
                  renderItem={(item) => (
                    <Box display="flex" alignItems="center" gap="0.75rem" width="100%">
                      <FaBed color="#10b981" size="1.25rem" />
                      <Box fontSize="0.875rem" fontWeight="500" color="#374151">
                        {item.label}
                      </Box>
                    </Box>
                  )}
                  containerStyles={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '0.75rem'
                  }}
                  selectedItemStyles={{
                    borderColor: '#10b981',
                    backgroundColor: '#ecfdf5'
                  }}
                />
              )}
            </Box>
          </SlidingDrawer>
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