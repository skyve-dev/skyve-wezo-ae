import React, { useState } from 'react'
import { FaPlus, FaEye, FaEdit, FaCalendarAlt } from 'react-icons/fa'
import { useAppShell } from '@/components/base/AppShell'
import { SecuredPage } from '@/components/SecuredPage.tsx'
import { Box } from '@/components'
import Button from '@/components/base/Button.tsx'

// Properties List Component
const PropertiesList: React.FC = () => {
    const {navigateTo} = useAppShell()
    const [properties] = useState([
        {id: 1, name: "Luxury Villa Marina", location: "Dubai Marina", status: "Active", occupancy: 85},
        {id: 2, name: "Beach House JBR", location: "Jumeirah Beach", status: "Active", occupancy: 92},
        {id: 3, name: "Downtown Penthouse", location: "Downtown Dubai", status: "Inactive", occupancy: 0}
    ])

    return (
        <SecuredPage>
            <Box padding="2rem" maxWidth="1200px" margin="0 auto">
                <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="2rem">
                    <h1 style={{fontSize: '2rem', fontWeight: 'bold', margin: 0}}>My Properties</h1>
                    <Button label="Add Property" icon={<FaPlus />} onClick={() => navigateTo('property-add', {})} variant="promoted" />
                </Box>

                <Box display="grid" gap="1.5rem">
                    {properties.map(property => (
                        <Box key={property.id} padding="1.5rem" backgroundColor="white" borderRadius="8px" boxShadow="0 2px 4px rgba(0,0,0,0.1)">
                            <Box display="flex" justifyContent="space-between" alignItems="start">
                                <Box flex="1">
                                    <h3 style={{fontSize: '1.25rem', fontWeight: '600', margin: '0 0 0.5rem 0'}}>{property.name}</h3>
                                    <p style={{color: '#666', margin: '0 0 1rem 0'}}>{property.location}</p>
                                    <Box display="flex" gap="0.5rem" alignItems="center">
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '4px',
                                            fontSize: '0.875rem',
                                            backgroundColor: property.status === 'Active' ? '#d1fae5' : '#fee2e2',
                                            color: property.status === 'Active' ? '#065f46' : '#991b1b'
                                        }}>
                                            {property.status}
                                        </span>
                                        <span style={{color: '#666'}}>Occupancy: {property.occupancy}%</span>
                                    </Box>
                                </Box>
                                <Box display="flex" gap="0.5rem">
                                    <Button label="" icon={<FaEye />} onClick={() => navigateTo('property-edit', {})} variant="normal" size="small" />
                                    <Button label="" icon={<FaEdit />} onClick={() => navigateTo('property-edit', {})} variant="normal" size="small" />
                                    <Button label="" icon={<FaCalendarAlt />} onClick={() => navigateTo('availability', {})} variant="normal" size="small" />
                                </Box>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
        </SecuredPage>
    )
}

export default PropertiesList