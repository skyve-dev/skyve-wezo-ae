import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { 
  fetchConversations, 
  setActiveFilter, 
  setSearchQuery, 
  setSelectedConversation,
  setShowNewMessageDrawer,
  clearError
} from '@/store/slices/messageSlice'
import { useAppShell } from '@/components/base/AppShell'
import { Box } from '@/components/base/Box'
import Button from '@/components/base/Button'
import Input from '@/components/base/Input'
import Tab from '@/components/base/Tab'
import { 
  IoAdd, 
  IoSearch, 
  IoMail, 
  IoHome, 
  IoHelpCircle, 
  IoPerson,
  IoTime 
} from 'react-icons/io5'
import type { ConversationSummary } from '@/store/slices/messageSlice'

interface ConversationItemProps {
  conversation: ConversationSummary
  isActive: boolean
  onClick: () => void
  currentUserId: string
}

const ConversationItem: React.FC<ConversationItemProps> = ({ 
  conversation, 
  isActive, 
  onClick,
  currentUserId 
}) => {
  const getContextIcon = () => {
    switch (conversation.type) {
      case 'reservation':
        return <IoHome color="#059669" size={16} />
      case 'support':
        return <IoHelpCircle color="#dc2626" size={16} />
      default:
        return <IoPerson color="#6b7280" size={16} />
    }
  }

  const getParticipantName = () => {
    const otherParticipant = conversation.participants.find(p => String(p.id) !== String(currentUserId))
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

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-AE', { month: 'short', day: 'numeric' })
    }
  }

  const formatDateRange = () => {
    if (!conversation.checkInDate || !conversation.checkOutDate) return ''
    
    const checkIn = new Date(conversation.checkInDate)
    const checkOut = new Date(conversation.checkOutDate)
    
    return `${checkIn.toLocaleDateString('en-AE', { month: 'short', day: 'numeric' })} - ${checkOut.toLocaleDateString('en-AE', { month: 'short', day: 'numeric' })}`
  }

  return (
    <Box
      padding="1rem"
      borderBottom="1px solid #f3f4f6"
      backgroundColor={isActive ? '#f0f9ff' : 'white'}
      cursor="pointer"
      onClick={onClick}
      style={{
        transition: 'background-color 0.2s'
      }}
    >
      {/* Conversation Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" marginBottom="0.5rem">
        <Box display="flex" alignItems="center" gap="0.75rem" flex="1">
          {/* Context Icon & Participant */}
          <Box display="flex" alignItems="center" gap="0.5rem">
            {getContextIcon()}
            <Box fontWeight="600" fontSize="0.875rem" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {getParticipantName()}
            </Box>
          </Box>
          
          {/* Unread Badge */}
          {conversation.unreadCount > 0 && (
            <Box
              backgroundColor="#dc2626"
              color="white"
              borderRadius="12px"
              padding="0.25rem 0.5rem"
              fontSize="0.75rem"
              fontWeight="600"
              minWidth="20px"
              textAlign="center"
            >
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </Box>
          )}
        </Box>
        
        {/* Timestamp */}
        <Box fontSize="0.75rem" color="#6b7280" flexShrink="0" marginLeft="0.5rem">
          {formatRelativeTime(conversation.lastMessage.sentAt)}
        </Box>
      </Box>
      
      {/* Reservation Context (if applicable) */}
      {conversation.reservationId && (
        <Box
          backgroundColor="#f0f9ff"
          padding="0.5rem"
          borderRadius="6px"
          marginBottom="0.5rem"
          fontSize="0.75rem"
          color="#1e40af"
        >
          🏠 {conversation.propertyName} • {formatDateRange()}
        </Box>
      )}
      
      {/* Last Message Preview */}
      <Box
        fontSize="0.875rem"
        color={conversation.unreadCount > 0 ? "#374151" : "#6b7280"}
        fontWeight={conversation.unreadCount > 0 ? "500" : "400"}
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {conversation.lastMessage.content}
      </Box>
    </Box>
  )
}

const ConversationList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { addToast } = useAppShell()
  
  const {
    conversations,
    conversationsLoading,
    conversationsTotalCount,
    selectedConversation,
    activeFilter,
    searchQuery,
    error
  } = useSelector((state: RootState) => state.messages)
  
  const { user } = useSelector((state: RootState) => state.auth)
  const currentUserId = user?.id || ''

  const [localSearchQuery, setLocalSearchQuery] = useState('')

  // Filter options with counts
  const filterOptions = [
    { id: 'all', label: 'All', count: conversationsTotalCount },
    { id: 'unread', label: 'Unread', count: conversations.filter(c => c.unreadCount > 0).length },
    { id: 'reservations', label: 'Bookings', count: conversations.filter(c => c.type === 'reservation').length },
    { id: 'support', label: 'Support', count: conversations.filter(c => c.type === 'support').length }
  ]

  // Load conversations on mount and when filter changes
  useEffect(() => {
    const filters = {
      type: activeFilter === 'all' ? undefined : activeFilter,
      unreadOnly: activeFilter === 'unread'
    }
    
    dispatch(fetchConversations({ page: 1, limit: 50, filters }))
  }, [dispatch, activeFilter])

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(setSearchQuery(localSearchQuery))
      if (localSearchQuery.trim()) {
        // TODO: Implement search functionality
        // dispatch(searchMessages({ query: localSearchQuery }))
      } else {
        // Reload conversations when search is cleared
        const filters = {
          type: activeFilter === 'all' ? undefined : activeFilter,
          unreadOnly: activeFilter === 'unread'
        }
        dispatch(fetchConversations({ page: 1, limit: 50, filters }))
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [localSearchQuery, dispatch, activeFilter])

  // Handle errors
  useEffect(() => {
    if (error) {
      addToast(error, { type: 'error', autoHide: true, duration: 4000 })
      dispatch(clearError())
    }
  }, [error, addToast, dispatch])

  const handleFilterChange = (filterId: string) => {
    dispatch(setActiveFilter(filterId as 'all' | 'unread' | 'reservations' | 'support'))
  }

  const handleConversationSelect = (conversation: ConversationSummary) => {
    dispatch(setSelectedConversation(conversation))
  }

  const handleNewMessage = () => {
    dispatch(setShowNewMessageDrawer(true))
  }

  const handleRefresh = () => {
    const filters = {
      type: activeFilter === 'all' ? undefined : activeFilter,
      unreadOnly: activeFilter === 'unread'
    }
    dispatch(fetchConversations({ page: 1, limit: 50, filters }))
  }

  return (
    <Box
      backgroundColor="white"
      borderRight="1px solid #e5e7eb"
      display="flex"
      flexDirection="column"
      height="100%"
    >
      {/* Header with Search & New Chat */}
      <Box padding="1rem" borderBottom="1px solid #e5e7eb">
        <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="1rem">
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Messages</h2>
          
          <Box display="flex" gap="0.5rem">
            {/* Refresh Button */}
            <Button
              icon={<IoTime />}
              size="small"
              onClick={handleRefresh}
              disabled={conversationsLoading}
              title="Refresh conversations"
              style={{ opacity: conversationsLoading ? 0.5 : 1 }}
            />
            
            {/* New Message Button */}
            <Button
              icon={<IoAdd />}
              size="small"
              variant="promoted"
              onClick={handleNewMessage}
              title="Start new conversation"
            />
          </Box>
        </Box>
        
        {/* Search Bar */}
        <Input
          placeholder="Search conversations..."
          value={localSearchQuery}
          onChange={(e) => setLocalSearchQuery(e.target.value)}
          icon={IoSearch}
          style={{ marginBottom: '1rem' }}
        />
        
        {/* Filter Tabs */}
        <Tab
          items={filterOptions.map(option => ({
            id: option.id,
            label: `${option.label} (${option.count})`,
            badge: option.count > 0 ? option.count : undefined
          }))}
          activeTab={activeFilter}
          onTabChange={handleFilterChange}
        />
      </Box>

      {/* Conversations List - Scrollable */}
      <Box flex="1" overflowY="auto">
        {conversationsLoading ? (
          <Box padding="2rem" textAlign="center">
            <Box color="#6b7280">Loading conversations...</Box>
          </Box>
        ) : conversations.length === 0 ? (
          <Box padding="2rem" display="flex"
               flexDirection="column"
               alignItems="center" >
            <IoMail size={48} color="#9ca3af" style={{ marginBottom: '1rem' }} />
            <Box marginBottom="0.5rem" color="#6b7280" fontWeight="600">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </Box>
            <Box fontSize="0.875rem" color="#9ca3af" marginBottom="1.5rem">
              {searchQuery 
                ? 'Try different search terms'
                : 'Start your first conversation to connect with guests or support'
              }
            </Box>
            {!searchQuery && (
              <Button
                label="Start Conversation"
                icon={<IoAdd />}
                onClick={handleNewMessage}
                variant="promoted"
                size="small"
              />
            )}
          </Box>
        ) : (
          conversations.map(conversation => (
            <ConversationItem 
              key={conversation.id}
              conversation={conversation}
              isActive={selectedConversation?.id === conversation.id}
              onClick={() => handleConversationSelect(conversation)}
              currentUserId={String(currentUserId)}
            />
          ))
        )}
      </Box>
    </Box>
  )
}

export default ConversationList