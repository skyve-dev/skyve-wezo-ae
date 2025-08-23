import React, { useState } from 'react'
import { FaCalendarAlt, FaClipboardList, FaBan, FaDollarSign, FaClock } from 'react-icons/fa'
import { SecuredPage } from '@/components/SecuredPage.tsx'
import { Box } from '@/components'
import Button from '@/components/base/Button.tsx'

// Availability & Rates Component
const Availability: React.FC = () => {
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
    
    return (
        <SecuredPage>
            <Box padding="2rem" maxWidth="1200px" margin="0 auto">
                <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="2rem">
                    <Box>
                        <h1 style={{fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0'}}>Availability & Rates</h1>
                        <p style={{color: '#666'}}>Manage your property availability and pricing</p>
                    </Box>
                    <Box display="flex" gap="0.5rem">
                        <Button 
                            label="Calendar" 
                            icon={<FaCalendarAlt />} 
                            onClick={() => setViewMode('calendar')} 
                            variant={viewMode === 'calendar' ? 'promoted' : 'normal'} 
                        />
                        <Button 
                            label="List" 
                            icon={<FaClipboardList />} 
                            onClick={() => setViewMode('list')} 
                            variant={viewMode === 'list' ? 'promoted' : 'normal'} 
                        />
                    </Box>
                </Box>

                {viewMode === 'calendar' ? (
                    <Box padding="2rem" backgroundColor="white" borderRadius="8px" boxShadow="0 2px 4px rgba(0,0,0,0.1)">
                        <h3 style={{marginBottom: '1.5rem'}}>Calendar View</h3>
                        <Box textAlign="center" padding="4rem" backgroundColor="#f9fafb" borderRadius="4px">
                            <FaCalendarAlt style={{fontSize: '3rem', color: '#9ca3af', marginBottom: '1rem'}} />
                            <p style={{color: '#666'}}>Calendar view showing availability up to 16 months in advance</p>
                        </Box>
                    </Box>
                ) : (
                    <Box>
                        <Box display="grid" gap="1rem">
                            {['January 2025', 'February 2025', 'March 2025'].map(month => (
                                <Box key={month} padding="1.5rem" backgroundColor="white" borderRadius="8px" boxShadow="0 2px 4px rgba(0,0,0,0.1)">
                                    <h4 style={{marginBottom: '1rem'}}>{month}</h4>
                                    <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" gap="0.5rem">
                                        {[...Array(7)].map((_, i) => (
                                            <Box key={i} padding="0.5rem" textAlign="center" backgroundColor="#f3f4f6" borderRadius="4px">
                                                <small>{i + 1}</small>
                                                <p style={{margin: '0.25rem 0', fontSize: '0.875rem', fontWeight: '600'}}>AED 450</p>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}

                {/* Quick Actions */}
                <Box marginTop="2rem" display="flex" gap="1rem">
                    <Button label="Block Dates" icon={<FaBan />} variant="normal" />
                    <Button label="Set Rates" icon={<FaDollarSign />} variant="normal" />
                    <Button label="Set Restrictions" icon={<FaClock />} variant="normal" />
                </Box>
            </Box>
        </SecuredPage>
    )
}

export default Availability