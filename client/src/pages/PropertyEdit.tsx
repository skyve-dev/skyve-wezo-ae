import React, { useState } from 'react'
import { FaBuilding, FaBed, FaWifi, FaCamera, FaClipboardList } from 'react-icons/fa'
import { useAppShell } from '@/components/base/AppShell'
import { SecuredPage } from '@/components/SecuredPage.tsx'
import { Box } from '@/components'
import Button from '@/components/base/Button.tsx'

// Property Add/Edit Component
const PropertyEdit: React.FC = () => {
    const {navigateTo} = useAppShell()
    const [activeTab, setActiveTab] = useState('details')

    return (
        <SecuredPage>
            <Box padding="2rem" maxWidth="1200px" margin="0 auto">
                <Box marginBottom="2rem">
                    <h1 style={{fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0'}}>Property Details</h1>
                    <p style={{color: '#666'}}>Add or update your property information</p>
                </Box>

                {/* Tabs */}
                <Box display="flex" gap="1rem" marginBottom="2rem" borderBottom="2px solid #e5e7eb" paddingBottom="0">
                    {[
                        {id: 'details', label: 'Property Details', icon: <FaBuilding />},
                        {id: 'rooms', label: 'Rooms & Layout', icon: <FaBed />},
                        {id: 'facilities', label: 'Facilities', icon: <FaWifi />},
                        {id: 'photos', label: 'Photos', icon: <FaCamera />},
                        {id: 'policies', label: 'Policies', icon: <FaClipboardList />}
                    ].map(tab => (
                        <Box
                            key={tab.id}
                            padding="0.75rem 1.5rem"
                            marginBottom="-2px"
                            borderBottom={activeTab === tab.id ? '2px solid #6366f1' : 'none'}
                            cursor="pointer"
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                color: activeTab === tab.id ? '#6366f1' : '#666',
                                fontWeight: activeTab === tab.id ? '600' : 'normal'
                            }}
                        >
                            <Box display="flex" alignItems="center" gap="0.5rem">
                                {tab.icon}
                                <span>{tab.label}</span>
                            </Box>
                        </Box>
                    ))}
                </Box>

                {/* Tab Content */}
                <Box padding="2rem" backgroundColor="white" borderRadius="8px" boxShadow="0 2px 4px rgba(0,0,0,0.1)">
                    {activeTab === 'details' && (
                        <Box>
                            <h3 style={{marginBottom: '1.5rem'}}>Basic Information</h3>
                            <Box display="grid" gap="1rem">
                                <Box>
                                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>Property Name</label>
                                    <input type="text" placeholder="Enter property name" style={{width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px'}} />
                                </Box>
                                <Box>
                                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>Location</label>
                                    <input type="text" placeholder="Enter location" style={{width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px'}} />
                                </Box>
                                <Box>
                                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>Description</label>
                                    <textarea placeholder="Describe your property" rows={4} style={{width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px'}} />
                                </Box>
                            </Box>
                        </Box>
                    )}
                    {activeTab === 'photos' && (
                        <Box>
                            <h3 style={{marginBottom: '1rem'}}>Property Photos</h3>
                            <p style={{color: '#666', marginBottom: '1.5rem'}}>Upload at least 5 high-quality photos without watermarks</p>
                            <Button label="Upload Photos" icon={<FaCamera />} variant="promoted" />
                        </Box>
                    )}
                </Box>

                <Box display="flex" gap="1rem" marginTop="2rem">
                    <Button label="Save Changes" variant="promoted" />
                    <Button label="Cancel" onClick={() => navigateTo('properties', {})} variant="normal" />
                </Box>
            </Box>
        </SecuredPage>
    )
}

export default PropertyEdit