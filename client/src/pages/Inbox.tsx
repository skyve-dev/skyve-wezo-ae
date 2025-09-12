import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { 
  fetchUnreadCount 
} from '@/store/slices/messageSlice'
import { SecuredPage } from '@/components/SecuredPage.tsx'
import { Box } from '@/components/base/Box'
import ConversationList from '@/components/messaging/ConversationList'
import ChatInterface from '@/components/messaging/ChatInterface'
import NewMessageDrawer from '@/components/messaging/NewMessageDrawer'

// Inbox Component
const Inbox: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>()
    
    const { selectedConversation } = useSelector((state: RootState) => state.messages)
    const isMobile = window.innerWidth < 768
    const showMessageView = selectedConversation !== null

    // Load unread count on mount
    useEffect(() => {
        dispatch(fetchUnreadCount())
    }, [dispatch])

    // const handleBackToList = () => {
    //     dispatch(setSelectedConversation(null))
    // }

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
                    <Box marginBottom="1rem">
                        <h1 style={{
                            fontSize: window.innerWidth < 768 ? '1.5rem' : '2rem', 
                            fontWeight: 'bold', 
                            margin: '0 0 0.5rem 0'
                        }}>
                            Messages
                        </h1>
                        <p style={{
                            color: '#666',
                            fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem'
                        }}>
                            Communicate with guests, hosts, and support
                        </p>
                    </Box>
                )}

                <Box 
                    height="calc(100vh - 200px)"
                    minHeight="600px"
                    display="grid" 
                    gridTemplateColumns="1fr"
                    gridTemplateColumnsMd={showMessageView ? "400px 1fr" : "1fr"}
                    gap="0"
                    borderRadius="12px"
                    overflow="hidden"
                    boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                    backgroundColor="white"
                >
                    {/* Conversation List - hide on mobile when viewing message */}
                    {(!isMobile || !showMessageView) && (
                        <ConversationList />
                    )}

                    {/* Chat Interface - show on desktop always, on mobile only when conversation selected */}
                    {(!isMobile || showMessageView) && (
                        <ChatInterface />
                    )}
                </Box>

                {/* New Message Drawer */}
                <NewMessageDrawer />
            </Box>
        </SecuredPage>
    )
}

export default Inbox