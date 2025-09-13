import React, { useState } from 'react'
import { IoIosMail, IoIosCheckmarkCircle, IoIosCloseCircle, IoIosWarning } from 'react-icons/io'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/store'
import { setShowNewMessageDrawer } from '@/store/slices/messageSlice'
import { SecuredPage } from '@/components/SecuredPage.tsx'
import { Box } from '@/components'
import Button from '@/components/base/Button.tsx'
import { useAppShell } from '@/components/base/AppShell'
import NewMessageDrawer from '@/components/messaging/NewMessageDrawer'

// Reservations Component
const Reservations: React.FC = () => {
    const [filter, setFilter] = useState('all')
    const { openDialog, navigateTo } = useAppShell()
    const dispatch = useDispatch<AppDispatch>()
    const [reservations, setReservations] = useState([
        {id: 1, guest: "John Smith", property: "Luxury Villa Marina", checkIn: "Jan 15, 2025", checkOut: "Jan 20, 2025", status: "Confirmed", amount: "AED 4,500", isNoShowReported: false},
        {id: 2, guest: "Sarah Johnson", property: "Beach House JBR", checkIn: "Jan 18, 2025", checkOut: "Jan 25, 2025", status: "Pending", amount: "AED 7,200", isNoShowReported: false},
        {id: 3, guest: "Ahmed Ali", property: "Luxury Villa Marina", checkIn: "Jan 10, 2025", checkOut: "Jan 12, 2025", status: "Completed", amount: "AED 1,800", isNoShowReported: false}
    ])

    // Add utility function
    const isWithin48Hours = (checkInDate: string): boolean => {
        const checkIn = new Date(checkInDate)
        const now = new Date()
        const hoursDiff = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60)
        return hoursDiff <= 48 && hoursDiff >= -48
    }

    // Add no-show handler with openDialog
    const handleReportNoShow = async (reservationId: number) => {
        const confirmed = await openDialog<boolean>((close) => (
            <Box padding="2rem" textAlign="center">
                <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#dc2626">
                    Report No-Show
                </Box>
                <Box marginBottom="2rem" color="#374151">
                    Are you sure the guest did not show up? This will allow you to 
                    request commission waiver within the 48-hour window.
                </Box>
                <Box display="flex" gap="1rem" justifyContent="center">
                    <Button 
                        label="Cancel"
                        onClick={() => close(false)}
                        variant="normal"
                        fullWidth
                    />
                    <Button 
                        label="Confirm No-Show"
                        onClick={() => close(true)}
                        variant="promoted"
                        fullWidth
                    />
                </Box>
            </Box>
        ))

        if (confirmed) {
            try {
                // In real implementation, this would be:
                // await api.post(`/api/reservations/${reservationId}/no-show`)
                
                // Update local state for demo
                setReservations(prev => 
                    prev.map(res => 
                        res.id === reservationId 
                            ? { ...res, status: 'NoShow', isNoShowReported: true }
                            : res
                    )
                )
                
                // Show success message
                await openDialog<void>((close) => (
                    <Box padding="2rem" textAlign="center">
                        <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#059669">
                            Success!
                        </Box>
                        <Box marginBottom="2rem" color="#374151">
                            No-show has been reported successfully. You can now request commission waiver.
                        </Box>
                        <Button 
                            label="Continue"
                            onClick={() => close()}
                            variant="promoted"
                        />
                    </Box>
                ))
            } catch (error) {
                console.error('Failed to report no-show:', error)
                
                // Show error message
                await openDialog<void>((close) => (
                    <Box padding="2rem" textAlign="center">
                        <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem" color="#dc2626">
                            Error
                        </Box>
                        <Box marginBottom="2rem" color="#374151">
                            Failed to report no-show. Please try again later.
                        </Box>
                        <Button 
                            label="Close"
                            onClick={() => close()}
                            variant="normal"
                        />
                    </Box>
                ))
            }
        }
    }

    const handleMessageGuest = (_reservation: any) => {
        // Navigate to inbox with new message drawer open for this reservation
        navigateTo('inbox', {})
        
        // Open the new message drawer
        // Note: In a real app, we'd pre-populate the reservation and guest info
        dispatch(setShowNewMessageDrawer(true))
    }

    return (
        <SecuredPage>
            <Box 
                padding="1rem" 
                paddingX="1rem"
                paddingXMd="2rem"
                paddingY="1rem"
                paddingYMd="2rem"
                maxWidth="1200px" 
                margin="0 auto"
            >
                {/* Demo Page Notice */}
                <Box 
                    padding="1rem" 
                    backgroundColor="#fef3c7" 
                    border="1px solid #fde68a"
                    borderRadius="8px" 
                    marginBottom="2rem"
                >
                    <p style={{ color: '#92400e', fontWeight: '600', margin: 0 }}>
                        This page is a demo page
                    </p>
                </Box>

                <Box marginBottom="2rem">
                    <h1 style={{
                        fontSize: window.innerWidth < 768 ? '1.5rem' : '2rem', 
                        fontWeight: 'bold', 
                        margin: '0 0 0.5rem 0'
                    }}>
                        Reservations
                    </h1>
                    <p style={{
                        color: '#666', 
                        fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem'
                    }}>
                        View and manage all your property reservations
                    </p>
                </Box>

                {/* Filters - Responsive wrapping */}
                <Box 
                    display="flex" 
                    flexWrap="wrap"
                    gap="0.5rem" 
                    marginBottom="2rem"
                >
                    {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map(status => (
                        <Button
                            key={status}
                            label={status.charAt(0).toUpperCase() + status.slice(1)}
                            onClick={() => setFilter(status)}
                            variant={filter === status ? 'promoted' : 'normal'}
                            size="small"
                            style={{
                                minWidth: window.innerWidth < 640 ? '80px' : 'auto',
                                fontSize: window.innerWidth < 640 ? '0.75rem' : '0.875rem'
                            }}
                        />
                    ))}
                </Box>

                {/* Reservations List */}
                <Box display="grid" gap="1rem">
                    {reservations.map(reservation => (
                        <Box 
                            key={reservation.id} 
                            padding="1rem"
                            paddingMd="1.5rem"
                            backgroundColor="white" 
                            borderRadius="8px" 
                            boxShadow="0 2px 4px rgba(0,0,0,0.1)"
                        >
                            {/* Responsive card layout - stack on mobile */}
                            <Box 
                                display="flex" 
                                flexDirection="column"
                                flexDirectionSm="row"
                                justifyContent="space-between" 
                                alignItems="flex-start"
                                alignItemsSm="start"
                                gap="1rem"
                                gapSm="0"
                            >
                                <Box flex="1">
                                    <h3 style={{
                                        fontSize: window.innerWidth < 768 ? '1rem' : '1.125rem', 
                                        fontWeight: '600', 
                                        margin: '0 0 0.5rem 0'
                                    }}>
                                        {reservation.guest}
                                    </h3>
                                    <p style={{
                                        color: '#666', 
                                        margin: '0 0 0.5rem 0',
                                        fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem'
                                    }}>
                                        {reservation.property}
                                    </p>
                                    
                                    {/* Responsive date layout */}
                                    <Box 
                                        display="flex" 
                                        flexDirection="column"
                                        flexDirectionSm="row"
                                        gap="0.25rem"
                                        gapSm="1rem"
                                        fontSize="0.875rem" 
                                        color="#666"
                                    >
                                        <span>Check-in: {reservation.checkIn}</span>
                                        <span>Check-out: {reservation.checkOut}</span>
                                    </Box>
                                </Box>
                                
                                {/* Amount and status - right aligned on desktop, left on mobile */}
                                <Box 
                                    textAlign="left"
                                    textAlignSm="right"
                                    minWidth="auto"
                                    minWidthSm="120px"
                                >
                                    <p style={{
                                        fontSize: window.innerWidth < 768 ? '1.125rem' : '1.25rem', 
                                        fontWeight: '600', 
                                        margin: '0 0 0.5rem 0'
                                    }}>
                                        {reservation.amount}
                                    </p>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '4px',
                                        fontSize: window.innerWidth < 640 ? '0.75rem' : '0.875rem',
                                        backgroundColor: 
                                            reservation.status === 'Confirmed' ? '#d1fae5' : 
                                            reservation.status === 'Pending' ? '#fef3c7' :
                                            reservation.status === 'Completed' ? '#e0e7ff' : '#fee2e2',
                                        color: 
                                            reservation.status === 'Confirmed' ? '#065f46' : 
                                            reservation.status === 'Pending' ? '#92400e' :
                                            reservation.status === 'Completed' ? '#3730a3' : '#991b1b'
                                    }}>
                                        {reservation.status}
                                    </span>
                                </Box>
                            </Box>
                            
                            {/* Responsive action buttons */}
                            <Box 
                                display="flex" 
                                flexWrap="wrap"
                                gap="0.5rem" 
                                marginTop="1rem"
                            >
                                <Button 
                                    label={window.innerWidth < 640 ? "Details" : "View Details"} 
                                    size="small" 
                                    variant="normal"
                                    style={{ flex: window.innerWidth < 640 ? '1' : 'unset' }}
                                />
                                <Button 
                                    label={window.innerWidth < 640 ? "Message" : "Message Guest"} 
                                    icon={<IoIosMail />} 
                                    size="small" 
                                    variant="normal"
                                    onClick={() => handleMessageGuest(reservation)}
                                    style={{ flex: window.innerWidth < 640 ? '1' : 'unset' }}
                                />
                                {reservation.status === 'Confirmed' && 
                                 isWithin48Hours(reservation.checkIn) && 
                                 !reservation.isNoShowReported && (
                                    <Button 
                                        label="Report No-Show" 
                                        icon={<IoIosWarning />}
                                        onClick={() => handleReportNoShow(reservation.id)}
                                        variant="normal"
                                        size="small"
                                        style={{ 
                                            backgroundColor: '#fef3c7',
                                            color: '#92400e',
                                            flex: window.innerWidth < 640 ? '1' : 'unset'
                                        }}
                                    />
                                )}
                                {reservation.status === 'Pending' && (
                                    <>
                                        <Button 
                                            label="Confirm" 
                                            icon={<IoIosCheckmarkCircle />} 
                                            size="small" 
                                            variant="promoted"
                                            style={{ flex: window.innerWidth < 640 ? '1' : 'unset' }}
                                        />
                                        <Button 
                                            label="Decline" 
                                            icon={<IoIosCloseCircle />} 
                                            size="small" 
                                            variant="normal"
                                            style={{ flex: window.innerWidth < 640 ? '1' : 'unset' }}
                                        />
                                    </>
                                )}
                            </Box>
                        </Box>
                    ))}
                </Box>

                {/* New Message Drawer for guest messaging */}
                <NewMessageDrawer />
            </Box>
        </SecuredPage>
    )
}

export default Reservations