import React from 'react'
import { FaEnvelope } from 'react-icons/fa'
import { SecuredPage } from '@/components/SecuredPage.tsx'
import { Box } from '@/components'
import Button from '@/components/base/Button.tsx'

// Inbox Component
const Inbox: React.FC = () => {
    const messages = [
        {id: 1, from: "John Smith", subject: "Question about check-in", time: "2 hours ago", unread: true},
        {id: 2, from: "Wezo.ae Support", subject: "New feature available", time: "1 day ago", unread: true},
        {id: 3, from: "Sarah Johnson", subject: "Thank you for the stay", time: "3 days ago", unread: false}
    ]

    return (
        <SecuredPage>
            <Box padding="2rem" maxWidth="1200px" margin="0 auto">
                <Box marginBottom="2rem">
                    <h1 style={{fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0'}}>Inbox</h1>
                    <p style={{color: '#666'}}>Communicate with guests and Wezo.ae support</p>
                </Box>

                <Box display="grid" gridTemplateColumns="1fr 2fr" gap="2rem">
                    {/* Message List */}
                    <Box>
                        <Box backgroundColor="white" borderRadius="8px" boxShadow="0 2px 4px rgba(0,0,0,0.1)" overflow="hidden">
                            {messages.map(message => (
                                <Box 
                                    key={message.id} 
                                    padding="1rem" 
                                    borderBottom="1px solid #e5e7eb"
                                    backgroundColor={message.unread ? '#f0f9ff' : 'white'}
                                    cursor="pointer"
                                >
                                    <Box display="flex" justifyContent="space-between" marginBottom="0.25rem">
                                        <span style={{fontWeight: message.unread ? '600' : 'normal'}}>{message.from}</span>
                                        <small style={{color: '#666'}}>{message.time}</small>
                                    </Box>
                                    <p style={{margin: 0, fontSize: '0.875rem', color: '#666'}}>{message.subject}</p>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* Message View */}
                    <Box padding="2rem" backgroundColor="white" borderRadius="8px" boxShadow="0 2px 4px rgba(0,0,0,0.1)">
                        <h3 style={{marginBottom: '1rem'}}>Question about check-in</h3>
                        <Box marginBottom="1rem">
                            <strong>From:</strong> John Smith
                        </Box>
                        <Box padding="1rem" backgroundColor="#f9fafb" borderRadius="4px" marginBottom="1rem">
                            <p style={{margin: 0}}>Hi, I wanted to confirm the check-in time for my upcoming reservation. Is early check-in available?</p>
                        </Box>
                        <textarea 
                            placeholder="Type your reply..." 
                            rows={4} 
                            style={{width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', marginBottom: '1rem'}}
                        />
                        <Button label="Send Reply" icon={<FaEnvelope />} variant="promoted" />
                    </Box>
                </Box>
            </Box>
        </SecuredPage>
    )
}

export default Inbox