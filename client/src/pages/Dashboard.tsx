import React, { useState, useEffect } from 'react'
import {
    FaBuilding,
    FaClipboardList,
    FaDollarSign,
    FaChartLine,
    FaPlus,
    FaCalendarAlt,
    FaEnvelope,
    FaExclamationTriangle,
    FaArrowLeft,
} from 'react-icons/fa'
import { useSelector, useDispatch } from 'react-redux'
import { useAppShell, useNavigation, useTheme } from '@/components/base/AppShell'
import { SecuredPage } from '@/components/SecuredPage.tsx'
import { Box } from '@/components'
import Button from '@/components/base/Button.tsx'
import { RootState } from '@/store'
import { refreshDashboard } from '@/store/slices/dashboardSlice'

// Dashboard Component - Property Command Center
const Dashboard: React.FC = () => {
    const {navigateTo} = useAppShell()
    const { navigateBack, canNavigateBack } = useNavigation()
    const theme = useTheme()
    const dispatch = useDispatch()
    
    // Redux state
    const {
      stats,
      quickActions,
      loading,
      error
    } = useSelector((state: RootState) => state.dashboard)
    
    // KYC state
    const [kycStatus, setKycStatus] = useState<'pending' | 'submitted' | 'verified' | 'rejected'>('pending')

    useEffect(() => {
        // Fetch dashboard data
        dispatch(refreshDashboard() as any)
        
        // Fetch KYC status - in real implementation this would be an API call
        const fetchKycStatus = async () => {
            try {
                // await api.get('/api/users/me/kyc-status')
                // For demo, we'll simulate different statuses
                setKycStatus('pending') // Could be 'pending', 'submitted', 'verified', or 'rejected'
            } catch (error) {
                console.error('Failed to fetch KYC status:', error)
            }
        }
        fetchKycStatus()
    }, [dispatch])

    // KYC Banner component
    const KycBanner = () => {
        if (kycStatus === 'verified') return null
        
        const bannerConfig = {
            pending: {
                color: '#fef3c7',
                iconColor: '#f59e0b',
                textColor: '#92400e',
                message: 'Complete KYC verification to receive payouts',
                buttonText: 'Verify Now'
            },
            submitted: {
                color: '#dbeafe',
                iconColor: '#3b82f6',
                textColor: '#1e40af',
                message: 'Your KYC verification is under review',
                buttonText: 'Check Status'
            },
            rejected: {
                color: '#fee2e2',
                iconColor: '#ef4444',
                textColor: '#991b1b',
                message: 'KYC verification failed. Please resubmit documents',
                buttonText: 'Resubmit'
            }
        }
        
        const config = bannerConfig[kycStatus] || bannerConfig.pending
        
        return (
            <Box 
                padding="1rem" 
                paddingX="1.5rem"
                backgroundColor={config.color}
                borderRadius="8px"
                marginBottom="1.5rem"
            >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap="1rem">
                        <FaExclamationTriangle color={config.iconColor} size={20} />
                        <span style={{ color: config.textColor, fontWeight: '500' }}>
                            {config.message}
                        </span>
                    </Box>
                    <Button
                        label={config.buttonText}
                        size="small"
                        variant="promoted"
                        onClick={() => navigateTo('compliance/kyc-verification', {})}
                    />
                </Box>
            </Box>
        )
    }

    // Format currency helper
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-AE', {
            style: 'currency',
            currency: 'AED',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    // Loading state
    if (loading && !stats) {
        return (
            <SecuredPage>
                <Box padding="2rem" maxWidth="1200px" margin="0 auto">
                    <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                        <Box fontSize="1.125rem" color="#666">Loading dashboard...</Box>
                    </Box>
                </Box>
            </SecuredPage>
        )
    }

    return (
        <SecuredPage>
            <Box padding="2rem" maxWidth="1200px" margin="0 auto">
                {/* Error Message */}
                {error && (
                    <Box 
                        padding="1rem" 
                        backgroundColor="#fee2e2" 
                        border="1px solid #fecaca"
                        borderRadius="8px" 
                        marginBottom="2rem"
                    >
                        <p style={{ color: '#dc2626', fontWeight: '600', margin: 0 }}>
                            {error}
                        </p>
                    </Box>
                )}

                <Box marginBottom="2rem">
                    <h1 style={{fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0'}}>Property Command Center</h1>
                    <p style={{color: '#666'}}>Manage all your properties and bookings from one place</p>
                </Box>

                {/* KYC Banner */}
                <KycBanner />

                {/* Quick Stats */}
                <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="1.5rem" marginBottom="3rem">
                    <Box padding="1.5rem" backgroundColor="white" borderRadius="12px" boxShadow={`0 4px 20px ${theme.withOpacity(theme.primaryColor, 0.08)}`} border={`1px solid ${theme.withOpacity(theme.primaryColor, 0.05)}`}>
                        <Box display="flex" alignItems="center" marginBottom="0.5rem">
                            <Box padding="0.5rem" borderRadius="8px" background={theme.subtlePrimaryGradient} marginRight="0.75rem">
                                <FaBuilding style={{color: theme.primaryColor, fontSize: '1.25rem'}} />
                            </Box>
                            <span style={{fontWeight: '600', color: '#2d3748'}}>Active Properties</span>
                        </Box>
                        <p style={{fontSize: '2rem', fontWeight: 'bold', margin: 0}}>{stats?.properties?.active || 0}</p>
                    </Box>
                    <Box padding="1.5rem" backgroundColor="white" borderRadius="12px" boxShadow="0 4px 20px rgba(213, 33, 34, 0.08)" border="1px solid rgba(213, 33, 34, 0.05)">
                        <Box display="flex" alignItems="center" marginBottom="0.5rem">
                            <Box padding="0.5rem" borderRadius="8px" background="linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)" marginRight="0.75rem">
                                <FaClipboardList style={{color: '#10b981', fontSize: '1.25rem'}} />
                            </Box>
                            <span style={{fontWeight: '600', color: '#2d3748'}}>Total Reservations</span>
                        </Box>
                        <p style={{fontSize: '2rem', fontWeight: 'bold', margin: 0}}>{stats?.reservations?.total || 0}</p>
                    </Box>
                    <Box padding="1.5rem" backgroundColor="white" borderRadius="12px" boxShadow="0 4px 20px rgba(213, 33, 34, 0.08)" border="1px solid rgba(213, 33, 34, 0.05)">
                        <Box display="flex" alignItems="center" marginBottom="0.5rem">
                            <Box padding="0.5rem" borderRadius="8px" background="linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)" marginRight="0.75rem">
                                <FaDollarSign style={{color: '#f59e0b', fontSize: '1.25rem'}} />
                            </Box>
                            <span style={{fontWeight: '600', color: '#2d3748'}}>Monthly Earnings</span>
                        </Box>
                        <p style={{fontSize: '2rem', fontWeight: 'bold', margin: 0}}>
                            {stats?.financial?.thisMonth?.earnings ? formatCurrency(stats.financial.thisMonth.earnings) : 'AED 0'}
                        </p>
                    </Box>
                    <Box padding="1.5rem" backgroundColor="white" borderRadius="12px" boxShadow="0 4px 20px rgba(213, 33, 34, 0.08)" border="1px solid rgba(213, 33, 34, 0.05)">
                        <Box display="flex" alignItems="center" marginBottom="0.5rem">
                            <Box padding="0.5rem" borderRadius="8px" background="linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)" marginRight="0.75rem">
                                <FaChartLine style={{color: '#ef4444', fontSize: '1.25rem'}} />
                            </Box>
                            <span style={{fontWeight: '600', color: '#2d3748'}}>Occupancy Rate</span>
                        </Box>
                        <p style={{fontSize: '2rem', fontWeight: 'bold', margin: 0}}>
                            {stats?.occupancy?.currentOccupancyRate ? `${stats.occupancy.currentOccupancyRate}%` : '0%'}
                        </p>
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
                {((stats?.messages?.totalUnread || 0) > 0 || (stats?.reviews?.pendingResponses || 0) > 0) && (
                    <Box padding="1rem" backgroundColor="#fef3c7" borderRadius="8px" marginBottom="2rem">
                        <Box display="flex" alignItems="center">
                            <FaExclamationTriangle style={{color: '#f59e0b', marginRight: '0.5rem'}} />
                            <span>
                                {stats?.messages?.totalUnread ? `You have ${stats.messages.totalUnread} new messages` : ''}
                                {stats?.messages?.totalUnread && stats?.reviews?.pendingResponses ? ' and ' : ''}
                                {stats?.reviews?.pendingResponses ? `${stats.reviews.pendingResponses} pending reviews` : ''}
                            </span>
                        </Box>
                    </Box>
                )}

                {/* Recent Activity */}
                {quickActions && quickActions.length > 0 && (
                    <Box marginBottom="3rem">
                        <h2 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem'}}>Quick Actions</h2>
                        <Box display="grid" gap="1rem">
                            {quickActions.slice(0, 5).map((action) => (
                                <Box key={action.id} padding="1rem" backgroundColor="white" borderRadius="8px" boxShadow="0 2px 4px rgba(0,0,0,0.1)">
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <h3 style={{margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600', 
                                                color: action.type === 'urgent' ? '#ef4444' : action.type === 'important' ? '#f59e0b' : '#666'}}>
                                                {action.title}
                                            </h3>
                                            <p style={{margin: 0, color: '#666', fontSize: '0.875rem'}}>{action.description}</p>
                                        </Box>
                                        <Button 
                                            label={action.actionRequired} 
                                            variant={action.type === 'urgent' ? 'promoted' : 'normal'} 
                                            size="small"
                                            onClick={() => navigateTo(action.relatedEntity.id as any, {})}
                                        />
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}
            </Box>
        </SecuredPage>
    )
}

export default Dashboard