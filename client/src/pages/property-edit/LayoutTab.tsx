import React, {useState} from 'react'
import {Box} from '@/components'
import NumberStepperInput from '@/components/base/NumberStepperInput.tsx'
import Input from '@/components/base/Input.tsx'
import Button from '@/components/base/Button.tsx'
import {Bed, Room, ValidationErrors, WizardFormData} from '@/types/property'
import {BedType, BedTypeLabels} from '@/constants/propertyEnums'
import {FaBath, FaBed, FaPlus, FaTrash, FaUsers} from 'react-icons/fa'
import MobileSelect from './MobileSelect'

interface LayoutTabProps {
    formData: Partial<WizardFormData>
    updateFormData: (updates: Partial<WizardFormData>) => void
    validationErrors?: ValidationErrors | null
}

const LayoutTab: React.FC<LayoutTabProps> = ({formData, updateFormData, validationErrors: _validationErrors}) => {
    const [showAddRoom, setShowAddRoom] = useState(false)
    const [newRoomName, setNewRoomName] = useState('')
    const addRoom = () => {
        if (newRoomName.trim()) {
            const newRoom: Room = {
                spaceName: newRoomName.trim(),
                beds: []
            }
            // Create a completely new array to avoid mutating Redux state
            const currentRooms = formData.rooms ? JSON.parse(JSON.stringify(formData.rooms)) : []
            const updatedRooms = [...currentRooms, newRoom]
            updateFormData({rooms: updatedRooms})
            setNewRoomName('')
            setShowAddRoom(false)
        }
    }

    const removeRoom = (roomIndex: number) => {
        // Create a deep copy to avoid mutating Redux state
        const currentRooms = formData.rooms ? JSON.parse(JSON.stringify(formData.rooms)) : []
        const updatedRooms = currentRooms.filter((_: Room, index: number) => index !== roomIndex)
        updateFormData({rooms: updatedRooms})
    }

    const addBedToRoom = (roomIndex: number) => {
        if (!formData.rooms) return
        // Create a deep copy to avoid mutating Redux state
        const updatedRooms = JSON.parse(JSON.stringify(formData.rooms))
        if (!updatedRooms[roomIndex].beds) {
            updatedRooms[roomIndex].beds = []
        }
        const newBed: Bed = {
            typeOfBed: BedType.QueenBed,
            numberOfBed: 1
        }
        updatedRooms[roomIndex].beds.push(newBed)
        updateFormData({rooms: updatedRooms})
    }

    const updateBed = (roomIndex: number, bedIndex: number, field: keyof Bed, value: any) => {
        if (!formData.rooms) return
        // Create a deep copy to avoid mutating Redux state
        const updatedRooms = JSON.parse(JSON.stringify(formData.rooms))
        if (updatedRooms[roomIndex].beds) {
            updatedRooms[roomIndex].beds[bedIndex] = {
                ...updatedRooms[roomIndex].beds[bedIndex],
                [field]: value
            }
            updateFormData({rooms: updatedRooms})
        }
    }

    const removeBedFromRoom = (roomIndex: number, bedIndex: number) => {
        if (!formData.rooms) return
        // Create a deep copy to avoid mutating Redux state
        const updatedRooms = JSON.parse(JSON.stringify(formData.rooms))
        if (updatedRooms[roomIndex].beds) {
            updatedRooms[roomIndex].beds = updatedRooms[roomIndex].beds.filter((_: Bed, index: number) => index !== bedIndex)
            updateFormData({rooms: updatedRooms})
        }
    }

    return (
        <Box>
            <Box display="flex" alignItems="center" gap="0.75rem" marginBottom="1.5rem">
                <FaBed style={{color: '#374151', fontSize: '1.25rem'}}/>
                <h3 style={{margin: 0, fontSize: '1.5rem', fontWeight: '600'}}>
                    Layout & Capacity
                </h3>
            </Box>
            <Box display="grid" gap="2.5rem">
                <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem">
                    <NumberStepperInput
                        label="Maximum Guests"
                        icon={FaUsers}
                        value={formData.maximumGuest || 1}
                        onChange={(value) => updateFormData({maximumGuest: value})}
                        min={1}
                        max={50}
                        step={1}
                        format="integer"
                        size="medium"
                        width="100%"
                    />

                    <NumberStepperInput
                        label="Bathrooms"
                        icon={FaBath}
                        value={formData.bathrooms || 1}
                        onChange={(value) => updateFormData({bathrooms: value})}
                        min={1}
                        max={20}
                        step={1}
                        format="integer"
                        size="medium"
                        width="100%"
                    />
                </Box>

                <NumberStepperInput
                    label="Property Size (sq. meters)"
                    value={formData.propertySizeSqMtr || 0}
                    onChange={(value) => updateFormData({propertySizeSqMtr: value || undefined})}
                    min={0}
                    max={10000}
                    step={10}
                    format="integer"
                    placeholder="Optional - enter property size"
                    width="100%"
                    helperText="Leave blank if not applicable"
                />

                {/* Child & Crib Options */}
                <Box>
                    <h4 style={{marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '500'}}>
                        Child Accommodations
                    </h4>
                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem">
                        <Box>
                            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                                Children Allowed
                            </label>
                            <Box display="flex" gap="1rem">
                                <Box
                                    as="button"
                                    onClick={() => updateFormData({allowChildren: true})}
                                    padding="0.75rem 1.5rem"
                                    border={formData.allowChildren ? '2px solid #3b82f6' : '1px solid #d1d5db'}
                                    backgroundColor={formData.allowChildren ? '#eff6ff' : 'white'}
                                    borderRadius="0.5rem"
                                    cursor="pointer"
                                    fontWeight={formData.allowChildren ? '600' : '400'}
                                    color={formData.allowChildren ? '#1d4ed8' : '#374151'}
                                    width="50%"
                                    fontSize="0.875rem"
                                >
                                    Yes
                                </Box>
                                <Box
                                    as="button"
                                    onClick={() => updateFormData({allowChildren: false})}
                                    padding="0.75rem 1.5rem"
                                    border={!formData.allowChildren ? '2px solid #3b82f6' : '1px solid #d1d5db'}
                                    backgroundColor={!formData.allowChildren ? '#eff6ff' : 'white'}
                                    borderRadius="0.5rem"
                                    cursor="pointer"
                                    fontWeight={!formData.allowChildren ? '600' : '400'}
                                    color={!formData.allowChildren ? '#1d4ed8' : '#374151'}
                                    width="50%"
                                    fontSize="0.875rem"
                                >
                                    No
                                </Box>
                            </Box>
                        </Box>

                        <Box>
                            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                                Cribs Available
                            </label>
                            <Box display="flex" gap="1rem">
                                <Box
                                    as="button"
                                    onClick={() => updateFormData({offerCribs: true})}
                                    padding="0.75rem 1.5rem"
                                    border={formData.offerCribs ? '2px solid #3b82f6' : '1px solid #d1d5db'}
                                    backgroundColor={formData.offerCribs ? '#eff6ff' : 'white'}
                                    borderRadius="0.5rem"
                                    cursor="pointer"
                                    fontWeight={formData.offerCribs ? '600' : '400'}
                                    color={formData.offerCribs ? '#1d4ed8' : '#374151'}
                                    width="50%"
                                    fontSize="0.875rem"
                                >
                                    Yes
                                </Box>
                                <Box
                                    as="button"
                                    onClick={() => updateFormData({offerCribs: false})}
                                    padding="0.75rem 1.5rem"
                                    border={!formData.offerCribs ? '2px solid #3b82f6' : '1px solid #d1d5db'}
                                    backgroundColor={!formData.offerCribs ? '#eff6ff' : 'white'}
                                    borderRadius="0.5rem"
                                    cursor="pointer"
                                    fontWeight={!formData.offerCribs ? '600' : '400'}
                                    color={!formData.offerCribs ? '#1d4ed8' : '#374151'}
                                    width="50%"
                                    fontSize="0.875rem"
                                >
                                    No
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* Rooms Management */}
                <Box>
                    <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom="1rem">
                        <h4 style={{margin: 0, fontSize: '1.125rem', fontWeight: '500'}}>
                            Rooms & Beds ({formData.rooms?.length || 0} rooms)
                        </h4>
                        <Button
                            label="Add Room"
                            icon={<FaPlus/>}
                            onClick={() => setShowAddRoom(true)}
                            variant="promoted"
                            size="small"
                        />
                    </Box>

                    {/* Add Room Form */}
                    {showAddRoom && (
                        <Box
                            padding="1rem"
                            backgroundColor="#f8fafc"
                            border="1px solid #e2e8f0"
                            borderRadius="0.5rem"
                            marginBottom="1rem"
                        >
                            <Box display="grid" gap="1rem">
                                <Input
                                    label="Room Name"
                                    value={newRoomName}
                                    onChange={(e) => setNewRoomName(e.target.value)}
                                    placeholder="e.g., Master Bedroom, Living Room"
                                    width="100%"
                                />
                                <Box display="flex" gap="0.5rem">
                                    <Button
                                        label="Add Room"
                                        onClick={addRoom}
                                        variant="promoted"
                                        disabled={!newRoomName.trim()}
                                        size="small"
                                    />
                                    <Button
                                        label="Cancel"
                                        onClick={() => {
                                            setShowAddRoom(false)
                                            setNewRoomName('')
                                        }}
                                        variant="normal"
                                        size="small"
                                    />
                                </Box>
                            </Box>
                        </Box>
                    )}

                    {/* Existing Rooms */}
                    {formData.rooms && formData.rooms.length > 0 ? (
                        <Box display="grid" gap="1rem">
                            {formData.rooms.map((room, roomIndex) => (
                                <Box
                                    key={roomIndex}
                                    padding="1rem"
                                    border="1px solid #e5e7eb"
                                    borderRadius="0.5rem"
                                    backgroundColor="white"
                                >
                                    <Box display="flex" alignItems="center" justifyContent="space-between"
                                         marginBottom="1rem">
                                        <Box display="flex" alignItems="center" gap="0.5rem">
                                            <FaBed color="#6b7280"/>
                                            <h5 style={{margin: 0, fontSize: '1rem', fontWeight: '500'}}>
                                                {room.spaceName}
                                            </h5>
                                            <Box
                                                display="inline-flex"
                                                alignItems="center"
                                                padding="0.25rem 0.5rem"
                                                backgroundColor="#f3f4f6"
                                                color="#374151"
                                                borderRadius="0.75rem"
                                                fontSize="0.75rem"
                                                fontWeight="500"
                                            >
                                                {room.beds?.length || 0} beds
                                            </Box>
                                        </Box>
                                        <Box display="flex" gap="0.5rem">
                                            <Button
                                                label=""
                                                icon={<FaPlus/>}
                                                onClick={() => addBedToRoom(roomIndex)}
                                                variant="normal"
                                                size="small"
                                            />
                                            <Button
                                                label=""
                                                icon={<FaTrash/>}
                                                onClick={() => removeRoom(roomIndex)}
                                                variant="normal"
                                                size="small"
                                            />
                                        </Box>
                                    </Box>

                                    {/* Beds in this room */}
                                    {room.beds && room.beds.length > 0 && (
                                        <Box display="grid" gap="0.75rem">
                                            {room.beds.map((bed, bedIndex) => (
                                                <Box
                                                    key={bedIndex}
                                                    display="grid"
                                                    gridTemplateColumns="1fr"
                                                    gridTemplateColumnsSm="2fr 1fr auto"
                                                    gap="0.75rem"
                                                    alignItems="end"
                                                    padding="0rem"
                                                    paddingSm="0.75rem"
                                                    backgroundColor="transparent"
                                                    backgroundColorSm="#f9fafb"
                                                    borderRadius="0.375rem"
                                                >
                                                    <MobileSelect

                                                        label="Bed Type"
                                                        value={bed.typeOfBed}
                                                        options={Object.values(BedType).map(type => ({
                                                            value: type,
                                                            label: BedTypeLabels[type]
                                                        }))}
                                                        onChange={(value) => updateBed(roomIndex, bedIndex, 'typeOfBed', value)}
                                                        placeholder="Select bed type"
                                                    />
                                                    <NumberStepperInput
                                                        label="Count"
                                                        value={bed.numberOfBed}
                                                        onChange={(value) => updateBed(roomIndex, bedIndex, 'numberOfBed', value)}
                                                        min={1}
                                                        max={10}
                                                        format="integer"
                                                        size="small"
                                                        width="100%"
                                                    />
                                                    <Button
                                                        label=""
                                                        icon={<FaTrash/>}
                                                        onClick={() => removeBedFromRoom(roomIndex, bedIndex)}
                                                        variant="normal"
                                                        size="small"
                                                    />
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Box
                            padding="2rem"
                            textAlign="center"
                            display={'flex'}
                            flexDirection={'column'}
                            alignItems={'center'}
                            border="2px dashed #d1d5db"
                            borderRadius="8px"
                            color="#666"
                        >
                            <FaBed size={'5rem'} style={{marginBottom: '1rem', color: '#9ca3af'}}/>
                            <p style={{margin: 0, fontSize: '0.875rem'}}>
                                No rooms added yet. Click "Add Room" to start defining your property layout.
                            </p>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    )
}

export default LayoutTab