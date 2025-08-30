import React from 'react'
import { FaEdit } from 'react-icons/fa'
import { SecuredPage } from '@/components/SecuredPage.tsx'
import { Box } from '@/components'
import Button from '@/components/base/Button.tsx'

// Finance Component  
const Finance: React.FC = () => {
    return (
        <SecuredPage>
            <Box padding="2rem" maxWidth="1200px" margin="0 auto">
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
                    <h1 style={{fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0'}}>Finance & Earnings</h1>
                    <p style={{color: '#666'}}>Monitor your earnings and manage financial operations</p>
                </Box>

                {/* Earnings Overview */}
                <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap="1.5rem" marginBottom="2rem">
                    <Box padding="1.5rem" backgroundColor="white" borderRadius="8px" boxShadow="0 2px 4px rgba(0,0,0,0.1)">
                        <h3 style={{fontSize: '1rem', margin: '0 0 0.5rem 0', color: '#666'}}>This Month</h3>
                        <p style={{fontSize: '2rem', fontWeight: 'bold', margin: 0}}>AED 45,320</p>
                        <small style={{color: '#10b981'}}>+12% from last month</small>
                    </Box>
                    <Box padding="1.5rem" backgroundColor="white" borderRadius="8px" boxShadow="0 2px 4px rgba(0,0,0,0.1)">
                        <h3 style={{fontSize: '1rem', margin: '0 0 0.5rem 0', color: '#666'}}>Year to Date</h3>
                        <p style={{fontSize: '2rem', fontWeight: 'bold', margin: 0}}>AED 523,450</p>
                        <small style={{color: '#10b981'}}>+28% from last year</small>
                    </Box>
                    <Box padding="1.5rem" backgroundColor="white" borderRadius="8px" boxShadow="0 2px 4px rgba(0,0,0,0.1)">
                        <h3 style={{fontSize: '1rem', margin: '0 0 0.5rem 0', color: '#666'}}>Pending Payout</h3>
                        <p style={{fontSize: '2rem', fontWeight: 'bold', margin: 0}}>AED 12,840</p>
                        <small style={{color: '#666'}}>Next payout: Jan 25</small>
                    </Box>
                </Box>

                {/* Bank Details */}
                <Box padding="2rem" backgroundColor="white" borderRadius="8px" boxShadow="0 2px 4px rgba(0,0,0,0.1)" marginBottom="2rem">
                    <h3 style={{marginBottom: '1.5rem'}}>Bank Account Details</h3>
                    <Box display="grid" gap="1rem">
                        <Box>
                            <label style={{display: 'block', marginBottom: '0.5rem', color: '#666', fontSize: '0.875rem'}}>Account Holder</label>
                            <p style={{margin: 0, fontWeight: '500'}}>John Doe</p>
                        </Box>
                        <Box>
                            <label style={{display: 'block', marginBottom: '0.5rem', color: '#666', fontSize: '0.875rem'}}>Bank Name</label>
                            <p style={{margin: 0, fontWeight: '500'}}>Emirates NBD</p>
                        </Box>
                        <Box>
                            <label style={{display: 'block', marginBottom: '0.5rem', color: '#666', fontSize: '0.875rem'}}>IBAN</label>
                            <p style={{margin: 0, fontWeight: '500'}}>AE12 0123 4567 8901 2345 678</p>
                        </Box>
                    </Box>
                    <Box marginTop="1.5rem">
                        <Button label="Update Bank Details" icon={<FaEdit />} variant="normal" />
                    </Box>
                </Box>

                {/* Recent Transactions */}
                <Box padding="2rem" backgroundColor="white" borderRadius="8px" boxShadow="0 2px 4px rgba(0,0,0,0.1)">
                    <h3 style={{marginBottom: '1.5rem'}}>Recent Transactions</h3>
                    <Box display="grid" gap="1rem">
                        {[
                            {date: "Jan 20, 2025", description: "Booking #1234 - John Smith", amount: "AED 4,500", status: "Completed"},
                            {date: "Jan 18, 2025", description: "Booking #1233 - Sarah Johnson", amount: "AED 7,200", status: "Pending"},
                            {date: "Jan 15, 2025", description: "Payout to bank", amount: "AED -32,100", status: "Completed"}
                        ].map((transaction, index) => (
                            <Box key={index} display="flex" justifyContent="space-between" padding="1rem" backgroundColor="#f9fafb" borderRadius="4px">
                                <Box>
                                    <p style={{margin: '0 0 0.25rem 0', fontWeight: '500'}}>{transaction.description}</p>
                                    <small style={{color: '#666'}}>{transaction.date}</small>
                                </Box>
                                <Box textAlign="right">
                                    <p style={{margin: '0 0 0.25rem 0', fontWeight: '600', color: transaction.amount.startsWith('-') ? '#ef4444' : '#10b981'}}>
                                        {transaction.amount}
                                    </p>
                                    <small style={{color: '#666'}}>{transaction.status}</small>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                    <Box marginTop="1.5rem">
                        <Button label="View All Transactions" variant="normal" />
                    </Box>
                </Box>
            </Box>
        </SecuredPage>
    )
}

export default Finance