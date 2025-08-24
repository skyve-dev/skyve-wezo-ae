import React, { useState } from 'react'
import {
    FaBuilding,
    FaClipboardList,
    FaDollarSign,
    FaChartLine,
    FaPlus,
    FaCalendarAlt,
    FaEnvelope,
    FaExclamationTriangle,
    FaEye,
    FaEyeSlash,
    FaArrowLeft
} from 'react-icons/fa'
import { useAppShell, useAppShellVisibility, useNavigation, useTheme } from '@/components/base/AppShell'
import { SecuredPage } from '@/components/SecuredPage.tsx'
import { Box } from '@/components'
import Button from '@/components/base/Button.tsx'

// Dashboard Component - Property Command Center
const Dashboard: React.FC = () => {
    const {navigateTo} = useAppShell()
    const { navigateBack, canNavigateBack } = useNavigation()
    const {
        visibility,
        hideHeader,
        showHeader,
        hideSideNav,
        showSideNav,
        hideFooter,
        showFooter,
        hideAll,
        showAll,
        setVisibility
    } = useAppShellVisibility()
    const theme = useTheme()
    
    const [fullscreenMode, setFullscreenMode] = useState(false)
    
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
                    <Box padding="1.5rem" backgroundColor="white" borderRadius="12px" boxShadow={`0 4px 20px ${theme.withOpacity(theme.primaryColor, 0.08)}`} border={`1px solid ${theme.withOpacity(theme.primaryColor, 0.05)}`}>
                        <Box display="flex" alignItems="center" marginBottom="0.5rem">
                            <Box padding="0.5rem" borderRadius="8px" background={theme.subtlePrimaryGradient} marginRight="0.75rem">
                                <FaBuilding style={{color: theme.primaryColor, fontSize: '1.25rem'}} />
                            </Box>
                            <span style={{fontWeight: '600', color: '#2d3748'}}>Active Properties</span>
                        </Box>
                        <p style={{fontSize: '2rem', fontWeight: 'bold', margin: 0}}>{stats.activeProperties}</p>
                    </Box>
                    <Box padding="1.5rem" backgroundColor="white" borderRadius="12px" boxShadow="0 4px 20px rgba(213, 33, 34, 0.08)" border="1px solid rgba(213, 33, 34, 0.05)">
                        <Box display="flex" alignItems="center" marginBottom="0.5rem">
                            <Box padding="0.5rem" borderRadius="8px" background="linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)" marginRight="0.75rem">
                                <FaClipboardList style={{color: '#10b981', fontSize: '1.25rem'}} />
                            </Box>
                            <span style={{fontWeight: '600', color: '#2d3748'}}>Total Reservations</span>
                        </Box>
                        <p style={{fontSize: '2rem', fontWeight: 'bold', margin: 0}}>{stats.totalReservations}</p>
                    </Box>
                    <Box padding="1.5rem" backgroundColor="white" borderRadius="12px" boxShadow="0 4px 20px rgba(213, 33, 34, 0.08)" border="1px solid rgba(213, 33, 34, 0.05)">
                        <Box display="flex" alignItems="center" marginBottom="0.5rem">
                            <Box padding="0.5rem" borderRadius="8px" background="linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)" marginRight="0.75rem">
                                <FaDollarSign style={{color: '#f59e0b', fontSize: '1.25rem'}} />
                            </Box>
                            <span style={{fontWeight: '600', color: '#2d3748'}}>Monthly Earnings</span>
                        </Box>
                        <p style={{fontSize: '2rem', fontWeight: 'bold', margin: 0}}>{stats.monthlyEarnings}</p>
                    </Box>
                    <Box padding="1.5rem" backgroundColor="white" borderRadius="12px" boxShadow="0 4px 20px rgba(213, 33, 34, 0.08)" border="1px solid rgba(213, 33, 34, 0.05)">
                        <Box display="flex" alignItems="center" marginBottom="0.5rem">
                            <Box padding="0.5rem" borderRadius="8px" background="linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)" marginRight="0.75rem">
                                <FaChartLine style={{color: '#ef4444', fontSize: '1.25rem'}} />
                            </Box>
                            <span style={{fontWeight: '600', color: '#2d3748'}}>Occupancy Rate</span>
                        </Box>
                        <p style={{fontSize: '2rem', fontWeight: 'bold', margin: 0}}>{stats.occupancyRate}</p>
                    </Box>
                </Box>

                {/* Visibility Control Demo */}
                <Box marginBottom="3rem" padding="1.5rem" background="linear-gradient(135deg, rgba(213, 33, 34, 0.03) 0%, rgba(213, 33, 34, 0.01) 100%)" borderRadius="12px" border="1px solid rgba(213, 33, 34, 0.08)">
                    <h2 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem'}}>AppShell Visibility Controls (Demo)</h2>
                    <Box display="flex" gap="1rem" flexWrap="wrap" marginBottom="1rem">
                        <Button 
                            label={visibility.header ? "Hide Header" : "Show Header"} 
                            icon={visibility.header ? <FaEyeSlash /> : <FaEye />} 
                            onClick={() => visibility.header ? hideHeader() : showHeader()} 
                            variant="normal" 
                        />
                        <Button 
                            label={visibility.footer ? "Hide Footer" : "Show Footer"} 
                            icon={visibility.footer ? <FaEyeSlash /> : <FaEye />} 
                            onClick={() => visibility.footer ? hideFooter() : showFooter()} 
                            variant="normal" 
                        />
                        <Button 
                            label={fullscreenMode ? "Exit Fullscreen" : "Fullscreen Mode"} 
                            icon={fullscreenMode ? <FaEye /> : <FaEyeSlash />} 
                            onClick={() => {
                                if (fullscreenMode) {
                                    showAll()
                                    setFullscreenMode(false)
                                } else {
                                    hideAll()
                                    setFullscreenMode(true)
                                }
                            }} 
                            variant="promoted" 
                        />
                        <Button 
                            label="Custom (Header Only)" 
                            onClick={() => setVisibility({ header: true, footer: false, sideNav: false })} 
                            variant="normal" 
                        />
                        <Button 
                            label="Reset All" 
                            onClick={() => {
                                showAll()
                                setFullscreenMode(false)
                            }} 
                            variant="normal" 
                        />
                    </Box>
                    <Box fontSize="0.875rem" color="#4b5563">
                        Current visibility: Header: {visibility.header ? 'Visible' : 'Hidden'}, 
                        Footer: {visibility.footer ? 'Visible' : 'Hidden'}, 
                        SideNav: {visibility.sideNav ? 'Available' : 'Disabled'}
                    </Box>
                </Box>

                {/* Quick Actions */}
                <Box marginBottom="3rem">
                    <h2 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem'}}>Quick Actions</h2>
                    <Box display="flex" gap="1rem" flexWrap="wrap">
                        {canNavigateBack && (
                            <Button 
                                label="Go Back" 
                                icon={<FaArrowLeft />} 
                                onClick={navigateBack} 
                                variant="normal" 
                            />
                        )}
                        <Button 
                            label="Add Property" 
                            icon={<FaPlus />} 
                            onClick={() => navigateTo('property-add', {})} 
                            variant="promoted" 
                            background={theme.primaryGradient}
                            color={theme.primaryContrast}
                            border="none"
                            boxShadow={`0 4px 15px ${theme.withOpacity(theme.primaryColor, 0.25)}`}
                            whileHover={{
                                background: theme.primaryGradientHover,
                                boxShadow: `0 6px 20px ${theme.withOpacity(theme.primaryColor, 0.35)}`
                            }}
                        />
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