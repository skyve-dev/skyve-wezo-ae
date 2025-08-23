import React from 'react'
import {
    FaBuilding,
    FaClipboardList,
    FaDollarSign,
    FaChartLine,
    FaPlus,
    FaCalendarAlt,
    FaEnvelope,
    FaExclamationTriangle
} from 'react-icons/fa'
import { useAppShell } from '@/components/base/AppShell'
import { SecuredPage } from '@/components/SecuredPage.tsx'
import { Box } from '@/components'
import Button from '@/components/base/Button.tsx'

// Dashboard Component - Property Command Center
const Dashboard: React.FC = () => {
    const {navigateTo} = useAppShell()
    
    const stats = {
        activeProperties: 3,
        totalReservations: 12,
        pendingReviews: 4,
        monthlyEarnings: "AED 45,320",
        occupancyRate: "78%",
        newMessages: 2
    }

    return (
        <SecuredPage>
            <Box padding="2rem" maxWidth="1200px" margin="0 auto">
                <Box marginBottom="2rem">
                    <h1 style={{fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0'}}>Property Command Center</h1>
                    <p style={{color: '#666'}}>Manage all your properties and bookings from one place</p>
                </Box>

                {/* Quick Stats */}
                <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="1.5rem" marginBottom="3rem">
                    <Box padding="1.5rem" backgroundColor="white" borderRadius="8px" boxShadow="0 2px 4px rgba(0,0,0,0.1)">
                        <Box display="flex" alignItems="center" marginBottom="0.5rem">
                            <FaBuilding style={{color: '#6366f1', marginRight: '0.5rem'}} />
                            <span style={{fontWeight: '600'}}>Active Properties</span>
                        </Box>
                        <p style={{fontSize: '2rem', fontWeight: 'bold', margin: 0}}>{stats.activeProperties}</p>
                    </Box>
                    <Box padding="1.5rem" backgroundColor="white" borderRadius="8px" boxShadow="0 2px 4px rgba(0,0,0,0.1)">
                        <Box display="flex" alignItems="center" marginBottom="0.5rem">
                            <FaClipboardList style={{color: '#10b981', marginRight: '0.5rem'}} />
                            <span style={{fontWeight: '600'}}>Total Reservations</span>
                        </Box>
                        <p style={{fontSize: '2rem', fontWeight: 'bold', margin: 0}}>{stats.totalReservations}</p>
                    </Box>
                    <Box padding="1.5rem" backgroundColor="white" borderRadius="8px" boxShadow="0 2px 4px rgba(0,0,0,0.1)">
                        <Box display="flex" alignItems="center" marginBottom="0.5rem">
                            <FaDollarSign style={{color: '#f59e0b', marginRight: '0.5rem'}} />
                            <span style={{fontWeight: '600'}}>Monthly Earnings</span>
                        </Box>
                        <p style={{fontSize: '2rem', fontWeight: 'bold', margin: 0}}>{stats.monthlyEarnings}</p>
                    </Box>
                    <Box padding="1.5rem" backgroundColor="white" borderRadius="8px" boxShadow="0 2px 4px rgba(0,0,0,0.1)">
                        <Box display="flex" alignItems="center" marginBottom="0.5rem">
                            <FaChartLine style={{color: '#ef4444', marginRight: '0.5rem'}} />
                            <span style={{fontWeight: '600'}}>Occupancy Rate</span>
                        </Box>
                        <p style={{fontSize: '2rem', fontWeight: 'bold', margin: 0}}>{stats.occupancyRate}</p>
                    </Box>
                </Box>

                {/* Quick Actions */}
                <Box marginBottom="3rem">
                    <h2 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem'}}>Quick Actions</h2>
                    <Box display="flex" gap="1rem" flexWrap="wrap">
                        <Button label="Add Property" icon={<FaPlus />} onClick={() => navigateTo('property-add', {})} variant="promoted" />
                        <Button label="View Calendar" icon={<FaCalendarAlt />} onClick={() => navigateTo('availability', {})} variant="normal" />
                        <Button label="Check Messages" icon={<FaEnvelope />} onClick={() => navigateTo('inbox', {})} variant="normal" />
                        <Button label="View Reservations" icon={<FaClipboardList />} onClick={() => navigateTo('reservations', {})} variant="normal" />
                    </Box>
                </Box>

                {/* Notifications */}
                {stats.newMessages > 0 && (
                    <Box padding="1rem" backgroundColor="#fef3c7" borderRadius="8px" marginBottom="2rem">
                        <Box display="flex" alignItems="center">
                            <FaExclamationTriangle style={{color: '#f59e0b', marginRight: '0.5rem'}} />
                            <span>You have {stats.newMessages} new messages and {stats.pendingReviews} pending reviews</span>
                        </Box>
                    </Box>
                )}
            </Box>
        </SecuredPage>
    )
}

export default Dashboard