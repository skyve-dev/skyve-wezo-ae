import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { 
  fetchConversationMessages, 
  sendMessage, 
  markMessagesAsRead,
  addMessageOptimistic,
  markConversationAsRead
} from '@/store/slices/messageSlice'
import { useAppShell } from '@/components/base/AppShell'
import { Box } from '@/components/base/Box'
import Button from '@/components/base/Button'
import Input from '@/components/base/Input'
import { 
  IoSend, 
  IoArrowBack, 
  IoHome, 
  IoHelpCircle, 
  IoPerson,
  IoAttach,
  IoCall,
  IoVideocam
} from 'react-icons/io5'
import type { Message, ConversationSummary } from '@/store/slices/messageSlice'

interface MessageBubbleProps {
  message: Message
  isCurrentUser: boolean
  showAvatar?: boolean
  previousMessage?: Message
  nextMessage?: Message
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isCurrentUser, 
  showAvatar = true,
  previousMessage
}) => {
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const isYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() === date.toDateString()
    
    if (isToday) {
      return date.toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit' })
    } else if (isYesterday) {
      return `Yesterday ${date.toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return date.toLocaleDateString('en-AE', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const shouldShowTimestamp = () => {
    if (!previousMessage) return true
    const timeDiff = new Date(message.sentAt).getTime() - new Date(previousMessage.sentAt).getTime()
    return timeDiff > 5 * 60 * 1000 // Show if more than 5 minutes apart
  }

  const isGrouped = previousMessage && 
    previousMessage.senderId === message.senderId && 
    !shouldShowTimestamp()

  return (
    <Box marginBottom={isGrouped ? "0.25rem" : "1rem"}>
      {shouldShowTimestamp() && (
        <Box textAlign="center" marginBottom="0.5rem">
          <Box 
            display="inline-block" 
            backgroundColor="#f3f4f6" 
            padding="0.25rem 0.75rem" 
            borderRadius="12px" 
            fontSize="0.75rem" 
            color="#6b7280"
          >
            {formatMessageTime(message.sentAt)}
          </Box>
        </Box>
      )}

      <Box 
        display="flex" 
        justifyContent={isCurrentUser ? "flex-end" : "flex-start"}
        alignItems="flex-end"
        gap="0.5rem"
      >
        {/* Avatar for non-current user */}
        {!isCurrentUser && showAvatar && !isGrouped && (
          <Box
            width="32px"
            height="32px"
            borderRadius="50%"
            backgroundColor="#e5e7eb"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink="0"
          >
            <IoPerson size={16} color="#6b7280" />
          </Box>
        )}
        
        {!isCurrentUser && showAvatar && isGrouped && (
          <Box width="32px" flexShrink="0" />
        )}

        {/* Message bubble */}
        <Box
          backgroundColor={isCurrentUser ? "#D52122" : "#f3f4f6"}
          color={isCurrentUser ? "white" : "#1f2937"}
          padding="0.75rem 1rem"
          borderRadius="18px"
          maxWidth="70%"
          style={{
            borderBottomRightRadius: isCurrentUser && !isGrouped ? "6px" : "18px",
            borderBottomLeftRadius: !isCurrentUser && !isGrouped ? "6px" : "18px"
          }}
        >
          <Box fontSize="0.875rem" lineHeight="1.4">
            {message.content}
          </Box>
          
          {/* Read status for current user */}
          {isCurrentUser && (
            <Box display="flex" justifyContent="flex-end" marginTop="0.25rem">
              <Box fontSize="0.75rem" opacity="0.7">
                {message.isRead ? '✓✓' : '✓'}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}

interface ChatHeaderProps {
  conversation: ConversationSummary
  onBack: () => void
  currentUserId: string
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ conversation, onBack, currentUserId }) => {
  const getContextIcon = () => {
    switch (conversation.type) {
      case 'reservation':
        return <IoHome color="white" size={20} />
      case 'support':
        return <IoHelpCircle color="white" size={20} />
      default:
        return <IoPerson color="white" size={20} />
    }
  }

  const getParticipantName = () => {
    const otherParticipant = conversation.participants.find(p => p.id !== currentUserId)
    if (!otherParticipant) return 'Unknown User'
    
    switch (otherParticipant.role) {
      case 'Manager':
        return 'Wezo Support'
      case 'HomeOwner':
        return otherParticipant.name + ' (Host)'
      case 'Tenant':
        return otherParticipant.name + ' (Guest)'
      default:
        return otherParticipant.name
    }
  }

  return (
    <Box
      backgroundColor="#D52122"
      padding="1rem 1.5rem"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      borderBottom="1px solid rgba(255,255,255,0.1)"
    >
      {/* Left side - Back button and participant info */}
      <Box display="flex" alignItems="center" gap="1rem" flex="1">
        <Button
          icon={<IoArrowBack />}
          onClick={onBack}
          size="small"
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: 'white'
          }}
          title="Back to conversations"
        />
        
        <Box display="flex" alignItems="center" gap="0.75rem">
          {getContextIcon()}
          <Box>
            <Box fontWeight="600" fontSize="1rem" color="white">
              {getParticipantName()}
            </Box>
            {conversation.reservationId && (
              <Box fontSize="0.75rem" color="rgba(255,255,255,0.8)">
                🏠 {conversation.propertyName}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Right side - Action buttons */}
      <Box display="flex" alignItems="center" gap="0.5rem">
        <Button
          icon={<IoCall />}
          size="small"
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: 'white'
          }}
          title="Voice call"
        />
        <Button
          icon={<IoVideocam />}
          size="small"
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: 'white'
          }}
          title="Video call"
        />
      </Box>
    </Box>
  )
}

interface MessageComposerProps {
  onSendMessage: (content: string) => void
  disabled?: boolean
}

const MessageComposer: React.FC<MessageComposerProps> = ({ onSendMessage, disabled = false }) => {
  const [messageText, setMessageText] = useState('')

  const handleSend = () => {
    if (messageText.trim() && !disabled) {
      onSendMessage(messageText.trim())
      setMessageText('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Box 
      padding="1rem"
      backgroundColor="white"
      borderTop="1px solid #e5e7eb"
      display="flex"
      alignItems="flex-end"
      gap="0.75rem"
    >
      {/* Attachment button */}
      <Button
        icon={<IoAttach />}
        size="small"
        style={{
          backgroundColor: 'transparent',
          color: '#6b7280'
        }}
        title="Attach file"
        disabled={disabled}
      />

      {/* Message input */}
      <Box flex="1">
        <Input
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          style={{
            borderRadius: '20px',
            padding: '0.75rem 1rem',
            border: '1px solid #e5e7eb',
            fontSize: '0.875rem',
            minHeight: '44px',
            resize: 'none'
          }}
        />
      </Box>

      {/* Send button */}
      <Button
        icon={<IoSend />}
        onClick={handleSend}
        disabled={disabled || !messageText.trim()}
        variant={messageText.trim() ? "promoted" : "normal"}
        size="small"
        style={{
          borderRadius: '20px',
          minWidth: '44px',
          height: '44px'
        }}
        title="Send message"
      />
    </Box>
  )
}

const ChatInterface: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { addToast } = useAppShell()
  
  const {
    selectedConversation,
    messages,
    messagesLoading,
    isSending,
    error
  } = useSelector((state: RootState) => state.messages)
  
  const { user } = useSelector((state: RootState) => state.auth)
  const currentUserId = user?.id || ''

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation?.id) {
      dispatch(fetchConversationMessages({ 
        conversationId: selectedConversation.id, 
        page: 1, 
        limit: 100 
      }))
    }
  }, [dispatch, selectedConversation?.id])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0 && !hasScrolledToBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      setHasScrolledToBottom(true)
    }
  }, [messages, hasScrolledToBottom])

  // Mark messages as read when conversation is viewed
  useEffect(() => {
    if (selectedConversation && messages.length > 0) {
      const unreadMessages = messages.filter(m => 
        !m.isRead && m.senderId !== currentUserId
      )
      
      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map(m => m.id)
        dispatch(markMessagesAsRead(messageIds))
        dispatch(markConversationAsRead(selectedConversation.id))
      }
    }
  }, [selectedConversation, messages, currentUserId, dispatch])

  // Handle errors
  useEffect(() => {
    if (error) {
      addToast(error, { type: 'error', autoHide: true, duration: 4000 })
    }
  }, [error, addToast])

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation || !currentUserId) return

    const otherParticipant = selectedConversation.participants.find(
      p => String(p.id) !== String(currentUserId)
    )
    if (!otherParticipant) return

    // Create optimistic message
    const optimisticMessage: Message = {
      id: `temp_${Date.now()}`,
      senderId: String(currentUserId),
      senderType: user?.role || 'Tenant',
      recipientId: String(otherParticipant.id),
      recipientType: otherParticipant.role,
      content,
      isRead: false,
      reservationId: selectedConversation.reservationId,
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Add optimistic message
    dispatch(addMessageOptimistic(optimisticMessage))

    // Send actual message
    try {
      await dispatch(sendMessage({
        recipientId: String(otherParticipant.id),
        recipientType: otherParticipant.role,
        content,
        reservationId: selectedConversation.reservationId
      }))

      // Scroll to bottom after sending
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (error) {
      addToast('Failed to send message', { type: 'error', autoHide: true, duration: 4000 })
    }
  }

  const handleBackToList = () => {
    // Clear selected conversation to go back to list view
    // This will be handled by the parent Inbox component
  }

  if (!selectedConversation) {
    return (
      <Box 
        height="100%" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        backgroundColor="#f9fafb"
      >
        <Box textAlign="center" color="#6b7280">
          <IoPerson size={64} color="#d1d5db" style={{ marginBottom: '1rem' }} />
          <Box fontSize="1.125rem" fontWeight="600" marginBottom="0.5rem">
            No conversation selected
          </Box>
          <Box fontSize="0.875rem">
            Choose a conversation from the list to start messaging
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box 
      height="100%" 
      display="flex" 
      flexDirection="column" 
      backgroundColor="white"
    >
      {/* Chat Header */}
      <ChatHeader 
        conversation={selectedConversation}
        onBack={handleBackToList}
        currentUserId={String(currentUserId)}
      />

      {/* Reservation Context Banner */}
      {selectedConversation.reservationId && (
        <Box
          backgroundColor="#f0f9ff"
          padding="0.75rem 1.5rem"
          borderBottom="1px solid #e0f2fe"
        >
          <Box display="flex" alignItems="center" gap="0.5rem" fontSize="0.875rem" color="#1e40af">
            <IoHome size={16} />
            <Box fontWeight="500">
              Booking: {selectedConversation.propertyName}
            </Box>
            {selectedConversation.checkInDate && selectedConversation.checkOutDate && (
              <Box>
                • {new Date(selectedConversation.checkInDate).toLocaleDateString('en-AE', { 
                  month: 'short', 
                  day: 'numeric' 
                })} - {new Date(selectedConversation.checkOutDate).toLocaleDateString('en-AE', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Messages Area */}
      <Box flex="1" overflowY="auto" padding="1rem">
        {messagesLoading && messages.length === 0 ? (
          <Box textAlign="center" padding="2rem" color="#6b7280">
            Loading messages...
          </Box>
        ) : messages.length === 0 ? (
          <Box textAlign="center" padding="2rem" color="#6b7280">
            <IoPerson size={48} color="#d1d5db" style={{ marginBottom: '1rem' }} />
            <Box fontWeight="600" marginBottom="0.5rem">
              No messages yet
            </Box>
            <Box fontSize="0.875rem">
              Start the conversation by sending your first message
            </Box>
          </Box>
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isCurrentUser={message.senderId === currentUserId}
                previousMessage={index > 0 ? messages[index - 1] : undefined}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* Message Composer */}
      <MessageComposer
        onSendMessage={handleSendMessage}
        disabled={isSending || messagesLoading}
      />
    </Box>
  )
}

export default ChatInterface