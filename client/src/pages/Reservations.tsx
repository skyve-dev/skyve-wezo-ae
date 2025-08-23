import React, { useState } from 'react'
import { FaEnvelope, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import { SecuredPage } from '@/components/SecuredPage.tsx'
import { Box } from '@/components'
import Button from '@/components/base/Button.tsx'

// Reservations Component
const Reservations: React.FC = () => {
    const [filter, setFilter] = useState('all')
    const reservations = [
        {id: 1, guest: "John Smith", property: "Luxury Villa Marina", checkIn: "Jan 15, 2025", checkOut: "Jan 20, 2025", status: "Confirmed", amount: "AED 4,500"},
        {id: 2, guest: "Sarah Johnson", property: "Beach House JBR", checkIn: "Jan 18, 2025", checkOut: "Jan 25, 2025", status: "Pending", amount: "AED 7,200"},
        {id: 3, guest: "Ahmed Ali", property: "Luxury Villa Marina", checkIn: "Jan 10, 2025", checkOut: "Jan 12, 2025", status: "Completed", amount: "AED 1,800"}
    ]

    return (
        <SecuredPage>
            <Box padding="2rem" maxWidth="1200px" margin="0 auto">
                <Box marginBottom="2rem">
                    <h1 style={{fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0'}}>Reservations</h1>
                    <p style={{color: '#666'}}>View and manage all your property reservations</p>
                </Box>

                {/* Filters */}
                <Box display="flex" gap="0.5rem" marginBottom="2rem">
                    {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map(status => (
                        <Button
                            key={status}
                            label={status.charAt(0).toUpperCase() + status.slice(1)}
                            onClick={() => setFilter(status)}
                            variant={filter === status ? 'promoted' : 'normal'}
                            size="small"
                        />
                    ))}
                </Box>

                {/* Reservations List */}
                <Box display="grid" gap="1rem">
                    {reservations.map(reservation => (
                        <Box key={reservation.id} padding="1.5rem" backgroundColor="white" borderRadius="8px" boxShadow="0 2px 4px rgba(0,0,0,0.1)">
                            <Box display="flex" justifyContent="space-between" alignItems="start">
                                <Box>
                                    <h3 style={{fontSize: '1.125rem', fontWeight: '600', margin: '0 0 0.5rem 0'}}>{reservation.guest}</h3>
                                    <p style={{color: '#666', margin: '0 0 0.5rem 0'}}>{reservation.property}</p>
                                    <Box display="flex" gap="1rem" fontSize="0.875rem" color="#666">
                                        <span>Check-in: {reservation.checkIn}</span>
                                        <span>Check-out: {reservation.checkOut}</span>
                                    </Box>
                                </Box>
                                <Box textAlign="right">
                                    <p style={{fontSize: '1.25rem', fontWeight: '600', margin: '0 0 0.5rem 0'}}>{reservation.amount}</p>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '4px',
                                        fontSize: '0.875rem',
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
                            <Box display="flex" gap="0.5rem" marginTop="1rem">
                                <Button label="View Details" size="small" variant="normal" />
                                <Button label="Message Guest" icon={<FaEnvelope />} size="small" variant="normal" />
                                {reservation.status === 'Pending' && (
                                    <>
                                        <Button label="Confirm" icon={<FaCheckCircle />} size="small" variant="promoted" />
                                        <Button label="Decline" icon={<FaTimesCircle />} size="small" variant="normal" />
                                    </>
                                )}
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
        </SecuredPage>
    )
}

export default Reservations