import React, { useState } from 'react'
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa'
import { SecuredPage } from '@/components/SecuredPage.tsx'
import { Box } from '@/components'
import Button from '@/components/base/Button.tsx'

// Inbox Component
const Inbox: React.FC = () => {
    const [selectedMessage, setSelectedMessage] = useState<any>(null)
    const [showMessageView, setShowMessageView] = useState(false)
    
    const messages = [
        {id: 1, from: "John Smith", subject: "Question about check-in", time: "2 hours ago", unread: true, body: "Hi, I wanted to confirm the check-in time for my upcoming reservation. Is early check-in available?"},
        {id: 2, from: "Wezo.ae Support", subject: "New feature available", time: "1 day ago", unread: true, body: "We're excited to announce new features that will help you manage your property more effectively."},
        {id: 3, from: "Sarah Johnson", subject: "Thank you for the stay", time: "3 days ago", unread: false, body: "Thank you for the wonderful stay at your property. Everything was perfect!"}
    ]

    const handleMessageSelect = (message: any) => {
        setSelectedMessage(message)
        setShowMessageView(true)
    }

    const handleBackToList = () => {
        setShowMessageView(false)
        setSelectedMessage(null)
    }

    const isMobile = window.innerWidth < 768

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
                {/* Header - only show when not viewing message on mobile */}
                {(!isMobile || !showMessageView) && (
                    <Box marginBottom="2rem">
                        <h1 style={{
                            fontSize: window.innerWidth < 768 ? '1.5rem' : '2rem', 
                            fontWeight: 'bold', 
                            margin: '0 0 0.5rem 0'
                        }}>
                            Inbox
                        </h1>
                        <p style={{
                            color: '#666',
                            fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem'
                        }}>
                            Communicate with guests and Wezo.ae support
                        </p>
                    </Box>
                )}

                <Box 
                    display="grid" 
                    gridTemplateColumns="1fr"
                    gridTemplateColumnsMd="1fr 2fr"
                    gap="0"
                    gapMd="2rem"
                >
                    {/* Message List - hide on mobile when viewing message */}
                    {(!isMobile || !showMessageView) && (
                        <Box>
                            <Box 
                                backgroundColor="white" 
                                borderRadius="8px" 
                                boxShadow="0 2px 4px rgba(0,0,0,0.1)" 
                                overflow="hidden"
                            >
                                {messages.map(message => (
                                    <Box 
                                        key={message.id} 
                                        padding="0.75rem"
                                        paddingMd="1rem"
                                        borderBottom="1px solid #e5e7eb"
                                        backgroundColor={message.unread ? '#f0f9ff' : 'white'}
                                        cursor="pointer"
                                        onClick={() => handleMessageSelect(message)}
                                        whileHover={{ backgroundColor: message.unread ? '#e0f2fe' : '#f9fafb' }}
                                    >
                                        <Box display="flex" justifyContent="space-between" marginBottom="0.25rem">
                                            <span style={{
                                                fontWeight: message.unread ? '600' : 'normal',
                                                fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem'
                                            }}>
                                                {message.from}
                                            </span>
                                            <small style={{
                                                color: '#666',
                                                fontSize: window.innerWidth < 768 ? '0.75rem' : '0.875rem'
                                            }}>
                                                {message.time}
                                            </small>
                                        </Box>
                                        <p style={{
                                            margin: 0, 
                                            fontSize: window.innerWidth < 768 ? '0.75rem' : '0.875rem', 
                                            color: '#666',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {message.subject}
                                        </p>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* Message View - show on desktop always, on mobile only when message selected */}
                    {(!isMobile || showMessageView) && (
                        <Box 
                            padding="1rem"
                            paddingMd="2rem"
                            backgroundColor="white" 
                            borderRadius="8px" 
                            boxShadow="0 2px 4px rgba(0,0,0,0.1)"
                        >
                            {/* Mobile back button */}
                            {isMobile && showMessageView && (
                                <Box marginBottom="1rem">
                                    <Button
                                        label="Back to Messages"
                                        icon={<FaArrowLeft />}
                                        variant="normal"
                                        size="small"
                                        onClick={handleBackToList}
                                    />
                                </Box>
                            )}
                            
                            {selectedMessage ? (
                                <>
                                    <h3 style={{
                                        marginBottom: '1rem',
                                        fontSize: window.innerWidth < 768 ? '1.125rem' : '1.25rem'
                                    }}>
                                        {selectedMessage.subject}
                                    </h3>
                                    <Box marginBottom="1rem">
                                        <strong style={{ fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem' }}>
                                            From:
                                        </strong>{' '}
                                        <span style={{ fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem' }}>
                                            {selectedMessage.from}
                                        </span>
                                    </Box>
                                    <Box 
                                        padding="1rem" 
                                        backgroundColor="#f9fafb" 
                                        borderRadius="4px" 
                                        marginBottom="1rem"
                                    >
                                        <p style={{
                                            margin: 0,
                                            fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem',
                                            lineHeight: '1.5'
                                        }}>
                                            {selectedMessage.body}
                                        </p>
                                    </Box>
                                    <textarea 
                                        placeholder="Type your reply..." 
                                        rows={window.innerWidth < 768 ? 3 : 4}
                                        style={{
                                            width: '100%', 
                                            padding: window.innerWidth < 768 ? '0.75rem' : '0.5rem', 
                                            border: '1px solid #d1d5db', 
                                            borderRadius: '4px', 
                                            marginBottom: '1rem',
                                            fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem',
                                            resize: 'vertical',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                    <Button 
                                        label="Send Reply" 
                                        icon={<FaEnvelope />} 
                                        variant="promoted"
                                        size={window.innerWidth < 768 ? "small" : "medium"}
                                        fullWidth={window.innerWidth < 640}
                                    />
                                </>
                            ) : (
                                <Box 
                                    display="flex" 
                                    alignItems="center" 
                                    justifyContent="center" 
                                    height="300px" 
                                    color="#9ca3af"
                                >
                                    <p style={{
                                        fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem'
                                    }}>
                                        Select a message to view
                                    </p>
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>
            </Box>
        </SecuredPage>
    )
}

export default Inbox