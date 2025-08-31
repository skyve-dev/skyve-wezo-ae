import {configureStore} from '@reduxjs/toolkit'
import messageReducer, {
  addMessage,
  archiveConversation,
  clearError,
  clearFilters,
  closeCompose,
  type Conversation,
  deleteMessage,
  fetchConversationMessages,
  fetchConversations,
  markAsRead,
  markAsStarred,
  type Message,
  openCompose,
  sendMessage,
  setCurrentConversation,
  setCurrentMessage,
  translateMessage,
  updateComposeDraft,
  updateFilters
} from '../messageSlice'
import {api} from '../../../utils/api'

// Mock API
jest.mock('../../../utils/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn()
  }
}))

const mockApi = api as jest.Mocked<typeof api>

describe('messageSlice', () => {
  let store = configureStore({
    reducer: {
      messages: messageReducer
    }
  })

  beforeEach(() => {
    store = configureStore({
      reducer: {
        messages: messageReducer
      }
    })
    jest.clearAllMocks()
  })

  const mockMessage: Message = {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'user-1',
    senderName: 'John Doe',
    senderType: 'guest',
    recipientId: 'user-2',
    recipientName: 'Jane Smith',
    recipientType: 'host',
    subject: 'Question about booking',
    content: 'Hi, I have a question about the check-in time.',
    isRead: false,
    isStarred: false,
    attachments: [],
    reservationId: 'res-1',
    propertyId: 'prop-1',
    priority: 'normal',
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z'
  }

  const mockConversation: Conversation = {
    id: 'conv-1',
    participants: [
      {
        id: 'user-1',
        name: 'John Doe',
        type: 'guest',
        avatar: '/avatars/john.jpg'
      },
      {
        id: 'user-2',
        name: 'Jane Smith',
        type: 'host'
      }
    ],
    subject: 'Question about booking',
    lastMessage: mockMessage,
    unreadCount: 1,
    isArchived: false,
    reservationId: 'res-1',
    propertyId: 'prop-1',
    propertyName: 'Dubai Villa',
    tags: ['booking', 'urgent'],
    createdAt: '2024-03-15T09:30:00Z',
    updatedAt: '2024-03-15T10:00:00Z'
  }

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().messages
      expect(state).toEqual({
        conversations: [],
        currentConversation: null,
        messages: [],
        currentMessage: null,
        loading: false,
        error: null,
        stats: {
          totalUnread: 0,
          totalConversations: 0,
          totalMessages: 0,
          guestMessages: 0,
          supportMessages: 0
        },
        filters: {
          type: 'all',
          priority: null,
          propertyId: null,
          dateRange: {
            start: null,
            end: null
          }
        },
        compose: {
          isOpen: false,
          draft: {
            to: '',
            subject: '',
            content: ''
          }
        }
      })
    })
  })

  describe('reducers', () => {
    it('should clear error', () => {
      store.dispatch(clearError())
      const state = store.getState().messages
      expect(state.error).toBeNull()
    })

    it('should set current conversation', () => {
      store.dispatch(setCurrentConversation(mockConversation))
      const state = store.getState().messages
      expect(state.currentConversation).toEqual(mockConversation)
    })

    it('should mark conversation as read when setting as current', () => {
      // First add conversation to state with unread count
      store = configureStore({
        reducer: { messages: messageReducer },
        preloadedState: {
          messages: {
            ...store.getState().messages,
            conversations: [{ ...mockConversation, unreadCount: 3 }]
          }
        }
      })

      store.dispatch(setCurrentConversation(mockConversation))
      
      const state = store.getState().messages
      expect(state.conversations[0].unreadCount).toBe(0)
    })

    it('should set current message', () => {
      store.dispatch(setCurrentMessage(mockMessage))
      const state = store.getState().messages
      expect(state.currentMessage).toEqual(mockMessage)
    })

    it('should update filters', () => {
      const newFilters = {
        type: 'guest' as const,
        priority: 'high',
        propertyId: 'prop-1',
        dateRange: {
          start: '2024-03-01',
          end: '2024-03-31'
        }
      }

      store.dispatch(updateFilters(newFilters))
      const state = store.getState().messages
      expect(state.filters).toEqual(newFilters)
    })

    it('should clear filters', () => {
      // First set some filters
      store.dispatch(updateFilters({
        type: 'support',
        priority: 'urgent'
      }))

      // Then clear them
      store.dispatch(clearFilters())

      const state = store.getState().messages
      expect(state.filters).toEqual({
        type: 'all',
        priority: null,
        propertyId: null,
        dateRange: { start: null, end: null }
      })
    })

    it('should open compose with draft data', () => {
      const draftData = {
        to: 'user-1',
        subject: 'Follow-up question',
        reservationId: 'res-1'
      }

      store.dispatch(openCompose(draftData))

      const state = store.getState().messages
      expect(state.compose.isOpen).toBe(true)
      expect(state.compose.draft).toEqual(expect.objectContaining(draftData))
    })

    it('should close compose and clear draft', () => {
      // First open compose with data
      store.dispatch(openCompose({
        to: 'user-1',
        subject: 'Test'
      }))

      // Then close it
      store.dispatch(closeCompose())

      const state = store.getState().messages
      expect(state.compose.isOpen).toBe(false)
      expect(state.compose.draft).toEqual({
        to: '',
        subject: '',
        content: ''
      })
    })

    it('should update compose draft', () => {
      store.dispatch(updateComposeDraft({
        content: 'This is my message content'
      }))

      const state = store.getState().messages
      expect(state.compose.draft.content).toBe('This is my message content')
    })

    it('should add message and update stats', () => {
      // First set up initial state with conversation
      store = configureStore({
        reducer: { messages: messageReducer },
        preloadedState: {
          messages: {
            ...store.getState().messages,
            conversations: [mockConversation],
            currentConversation: mockConversation
          }
        }
      })

      const newMessage = {
        ...mockMessage,
        id: 'msg-2',
        content: 'Thank you for your response',
        senderType: 'host' as const,
        isRead: false
      }

      store.dispatch(addMessage(newMessage))

      const state = store.getState().messages
      expect(state.messages).toContain(newMessage)
      expect(state.currentConversation?.lastMessage).toEqual(newMessage)
      expect(state.conversations[0].lastMessage).toEqual(newMessage)
    })
  })

  describe('fetchConversations async thunk', () => {
    it('should fetch conversations successfully', async () => {
      const mockConversations = [mockConversation]
      mockApi.get.mockResolvedValue({ conversations: mockConversations })

      await store.dispatch(fetchConversations({
        type: 'guest',
        propertyId: 'prop-1'
      }))

      const state = store.getState().messages
      expect(state.conversations).toEqual(mockConversations)
      expect(state.loading).toBe(false)
      expect(state.stats.totalConversations).toBe(1)
      expect(state.stats.guestMessages).toBe(1)
    })

    it('should handle fetch conversations error', async () => {
      const errorMessage = 'Failed to fetch conversations'
      mockApi.get.mockRejectedValue({
        response: { data: { error: errorMessage } }
      })

      await store.dispatch(fetchConversations({}))

      const state = store.getState().messages
      expect(state.loading).toBe(false)
      expect(state.error).toBe(errorMessage)
    })

    it('should construct query params correctly', async () => {
      mockApi.get.mockResolvedValue({ conversations: [] })

      await store.dispatch(fetchConversations({
        type: 'support',
        propertyId: 'prop-1'
      }))

      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('type=support')
      )
      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('propertyId=prop-1')
      )
    })
  })

  describe('fetchConversationMessages async thunk', () => {
    it('should fetch conversation messages successfully', async () => {
      const mockMessages = [mockMessage]
      const response = {
        messages: mockMessages,
        conversation: mockConversation
      }

      mockApi.get.mockResolvedValue(response)

      await store.dispatch(fetchConversationMessages('conv-1'))

      const state = store.getState().messages
      expect(state.messages).toEqual(mockMessages)
      expect(state.currentConversation).toEqual(mockConversation)
      expect(state.loading).toBe(false)
    })

    it('should update conversation in list when fetching messages', async () => {
      // Set initial state with conversation
      const initialConversation = { ...mockConversation, unreadCount: 5 }
      store = configureStore({
        reducer: { messages: messageReducer },
        preloadedState: {
          messages: {
            ...store.getState().messages,
            conversations: [initialConversation]
          }
        }
      })

      const updatedConversation = { ...mockConversation, unreadCount: 0 }
      mockApi.get.mockResolvedValue({
        messages: [mockMessage],
        conversation: updatedConversation
      })

      await store.dispatch(fetchConversationMessages('conv-1'))

      const state = store.getState().messages
      expect(state.conversations[0].unreadCount).toBe(0)
    })
  })

  describe('sendMessage async thunk', () => {
    it('should send message successfully', async () => {
      const newMessage = { ...mockMessage, id: 'msg-2', content: 'Reply message' }
      const updatedConversation = { ...mockConversation, lastMessage: newMessage }

      mockApi.post.mockResolvedValue({
        message: newMessage,
        conversation: updatedConversation
      })

      await store.dispatch(sendMessage({
        conversationId: 'conv-1',
        content: 'Reply message'
      }))

      const state = store.getState().messages
      expect(state.messages).toContain(newMessage)
      expect(state.currentConversation).toEqual(updatedConversation)
      expect(state.loading).toBe(false)
    })

    it('should send new conversation message with compose data', async () => {
      // Set compose draft first
      store.dispatch(openCompose({
        to: 'user-1',
        subject: 'New conversation',
        propertyId: 'prop-1'
      }))

      const newMessage = { ...mockMessage, id: 'msg-new' }
      const newConversation = { ...mockConversation, id: 'conv-new' }

      mockApi.post.mockResolvedValue({
        message: newMessage,
        conversation: newConversation
      })

      await store.dispatch(sendMessage({
        content: 'Hello, this is a new message'
      }))

      const state = store.getState().messages
      expect(state.conversations).toContain(newConversation)
      expect(state.compose.isOpen).toBe(false) // Should close compose
    })

    it('should handle send message with attachments', async () => {
      const mockFiles = [new File(['test'], 'test.pdf', { type: 'application/pdf' })]
      
      mockApi.post.mockResolvedValue({
        message: mockMessage,
        conversation: mockConversation
      })

      await store.dispatch(sendMessage({
        conversationId: 'conv-1',
        content: 'Message with attachment',
        attachments: mockFiles
      }))

      const state = store.getState().messages
      expect(state.loading).toBe(false)
    })
  })

  describe('markAsRead async thunk', () => {
    it('should mark single message as read', async () => {
      // Set initial state with unread message
      store = configureStore({
        reducer: { messages: messageReducer },
        preloadedState: {
          messages: {
            ...store.getState().messages,
            messages: [{ ...mockMessage, isRead: false }],
            conversations: [mockConversation]
          }
        }
      })

      mockApi.patch.mockResolvedValue({ 
        success: true, 
        updatedIds: ['msg-1'] 
      })

      await store.dispatch(markAsRead({
        messageId: 'msg-1'
      }))

      const state = store.getState().messages
      expect(state.messages[0].isRead).toBe(true)
      expect(state.messages[0].readAt).toBeDefined()
    })

    it('should mark all messages in conversation as read', async () => {
      const unreadMessages = [
        { ...mockMessage, id: 'msg-1', isRead: false },
        { ...mockMessage, id: 'msg-2', isRead: false }
      ]

      store = configureStore({
        reducer: { messages: messageReducer },
        preloadedState: {
          messages: {
            ...store.getState().messages,
            messages: unreadMessages,
            conversations: [{ ...mockConversation, unreadCount: 2 }]
          }
        }
      })

      mockApi.patch.mockResolvedValue({
        success: true,
        updatedIds: ['msg-1', 'msg-2']
      })

      await store.dispatch(markAsRead({
        conversationId: 'conv-1'
      }))

      const state = store.getState().messages
      expect(state.messages.every(m => m.isRead)).toBe(true)
      expect(state.conversations[0].unreadCount).toBe(0)
    })
  })

  describe('markAsStarred async thunk', () => {
    it('should mark message as starred', async () => {
      const starredMessage = { ...mockMessage, isStarred: true }
      mockApi.patch.mockResolvedValue({ message: starredMessage })

      // Set initial state with message
      store = configureStore({
        reducer: { messages: messageReducer },
        preloadedState: {
          messages: {
            ...store.getState().messages,
            messages: [mockMessage]
          }
        }
      })

      await store.dispatch(markAsStarred({
        messageId: 'msg-1',
        starred: true
      }))

      const state = store.getState().messages
      expect(state.messages[0].isStarred).toBe(true)
    })
  })

  describe('archiveConversation async thunk', () => {
    it('should archive conversation successfully', async () => {
      const archivedConversation = { ...mockConversation, isArchived: true }
      mockApi.patch.mockResolvedValue({ conversation: archivedConversation })

      // Set initial state with conversation
      store = configureStore({
        reducer: { messages: messageReducer },
        preloadedState: {
          messages: {
            ...store.getState().messages,
            conversations: [mockConversation]
          }
        }
      })

      await store.dispatch(archiveConversation({
        conversationId: 'conv-1',
        archived: true
      }))

      const state = store.getState().messages
      expect(state.conversations[0].isArchived).toBe(true)
    })
  })

  describe('deleteMessage async thunk', () => {
    it('should delete message successfully', async () => {
      // Set initial state with message
      store = configureStore({
        reducer: { messages: messageReducer },
        preloadedState: {
          messages: {
            ...store.getState().messages,
            messages: [mockMessage]
          }
        }
      })

      mockApi.delete.mockResolvedValue({})

      await store.dispatch(deleteMessage('msg-1'))

      const state = store.getState().messages
      expect(state.messages).toHaveLength(0)
    })
  })

  describe('translateMessage async thunk', () => {
    it('should translate message successfully', async () => {
      const translatedContent = 'مرحبا، لدي سؤال حول وقت تسجيل الوصول.'
      
      mockApi.post.mockResolvedValue({
        translatedContent
      })

      // Set initial state with message
      store = configureStore({
        reducer: { messages: messageReducer },
        preloadedState: {
          messages: {
            ...store.getState().messages,
            messages: [mockMessage]
          }
        }
      })

      await store.dispatch(translateMessage({
        messageId: 'msg-1',
        targetLanguage: 'ar'
      }))

      const state = store.getState().messages
      expect(state.messages[0].translatedContent).toEqual({
        language: 'ar',
        content: translatedContent
      })
    })
  })

  describe('stats calculation', () => {
    it('should calculate stats correctly with mixed conversation types', async () => {
      const conversations = [
        { ...mockConversation, participants: [{ id: '1', name: 'Guest', type: 'guest' as const }] },
        { ...mockConversation, id: 'conv-2', unreadCount: 0, participants: [{ id: '2', name: 'Support', type: 'support' as const }] },
        { ...mockConversation, id: 'conv-3', unreadCount: 3, participants: [{ id: '3', name: 'Guest2', type: 'guest' as const }] }
      ]

      mockApi.get.mockResolvedValue({ conversations })

      await store.dispatch(fetchConversations({}))

      const state = store.getState().messages
      expect(state.stats).toEqual({
        totalUnread: 4, // 1 + 0 + 3
        totalConversations: 3,
        totalMessages: 3,
        guestMessages: 2,
        supportMessages: 1
      })
    })
  })

  describe('edge cases', () => {
    it('should handle empty conversations list', async () => {
      mockApi.get.mockResolvedValue({ conversations: [] })

      await store.dispatch(fetchConversations({}))

      const state = store.getState().messages
      expect(state.conversations).toEqual([])
      expect(state.stats.totalConversations).toBe(0)
    })

    it('should handle network errors gracefully', async () => {
      mockApi.get.mockRejectedValue(new Error('Network error'))

      await store.dispatch(fetchConversations({}))

      const state = store.getState().messages
      expect(state.loading).toBe(false)
      expect(state.error).toBe('Failed to fetch conversations')
    })

    it('should handle malformed message data', () => {
      const malformedMessage = {
        ...mockMessage,
        senderType: 'invalid-type' as any
      }

      expect(() => {
        store.dispatch(addMessage(malformedMessage))
      }).not.toThrow() // Should handle gracefully
    })

    it('should handle conversation updates when conversation not in list', async () => {
      mockApi.post.mockResolvedValue({
        message: mockMessage,
        conversation: mockConversation
      })

      await store.dispatch(sendMessage({
        conversationId: 'non-existent-conv',
        content: 'Test'
      }))

      const state = store.getState().messages
      expect(state.conversations).toContain(mockConversation) // Should add to list
    })

    it('should handle marking non-existent message as read', async () => {
      mockApi.patch.mockResolvedValue({
        success: true,
        updatedIds: ['non-existent-msg']
      })

      await store.dispatch(markAsRead({
        messageId: 'non-existent-msg'
      }))

      const state = store.getState().messages
      expect(state.loading).toBe(false) // Should not crash
    })

    it('should maintain conversation order when adding messages', () => {
      const initialConversations = [
        { ...mockConversation, id: 'conv-1', updatedAt: '2024-03-15T09:00:00Z' },
        { ...mockConversation, id: 'conv-2', updatedAt: '2024-03-15T10:00:00Z' }
      ]

      store = configureStore({
        reducer: { messages: messageReducer },
        preloadedState: {
          messages: {
            ...store.getState().messages,
            conversations: initialConversations
          }
        }
      })

      const newMessage = {
        ...mockMessage,
        conversationId: 'conv-1',
        createdAt: '2024-03-15T11:00:00Z'
      }

      store.dispatch(addMessage(newMessage))

      const state = store.getState().messages
      // conv-1 should be updated but maintain position
      expect(state.conversations[0].id).toBe('conv-1')
    })
  })
})