import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { api } from '../../utils/api'

// Types
export interface Message {
  id: string
  senderId: string
  senderType: 'Tenant' | 'HomeOwner' | 'Manager'
  recipientId: string
  recipientType: 'Tenant' | 'HomeOwner' | 'Manager'
  content: string
  isRead: boolean
  attachments?: MessageAttachment[]
  reservationId?: string | null
  sentAt: string
  createdAt: string
  updatedAt: string
}

export interface MessageAttachment {
  id: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  uploadedAt: string
}

export interface ConversationSummary {
  id: string
  participants: {
    id: string
    name: string
    role: 'Tenant' | 'HomeOwner' | 'Manager'
  }[]
  reservationId: string | null
  propertyName?: string
  propertyId?: string
  checkInDate?: string
  checkOutDate?: string
  lastMessage: {
    id: string
    content: string
    sentAt: string
    senderId: string
    senderType: 'Tenant' | 'HomeOwner' | 'Manager'
  }
  unreadCount: number
  totalMessages: number
  type: 'reservation' | 'general' | 'support'
  createdAt: string
  updatedAt: string
}

export interface MessageFilters {
  type?: 'all' | 'unread' | 'reservations' | 'support'
  unreadOnly?: boolean
  conversationWith?: string
  reservationId?: string
}

export interface SendMessageParams {
  recipientId: string
  recipientType: 'Tenant' | 'HomeOwner' | 'Manager'
  content: string
  reservationId?: string | null
  attachments?: MessageAttachment[]
}

export interface StartConversationParams {
  recipientId: string
  recipientType: 'Tenant' | 'HomeOwner' | 'Manager'
  subject?: string
  content: string
  reservationId?: string | null
}

interface MessageState {
  // Conversations
  conversations: ConversationSummary[]
  conversationsLoading: boolean
  conversationsTotalCount: number
  
  // Current conversation
  selectedConversation: ConversationSummary | null
  messages: Message[]
  messagesLoading: boolean
  
  // Message composition
  isSending: boolean
  
  // Filters and search
  activeFilter: 'all' | 'unread' | 'reservations' | 'support'
  searchQuery: string
  searchResults: Message[]
  searchLoading: boolean
  
  // Unread count
  unreadCount: number
  
  // UI state
  selectedConversationId: string | null
  showNewMessageDrawer: boolean
  showAttachmentDrawer: boolean
  
  // Error handling
  error: string | null
}

const initialState: MessageState = {
  conversations: [],
  conversationsLoading: false,
  conversationsTotalCount: 0,
  selectedConversation: null,
  messages: [],
  messagesLoading: false,
  isSending: false,
  activeFilter: 'all',
  searchQuery: '',
  searchResults: [],
  searchLoading: false,
  unreadCount: 0,
  selectedConversationId: null,
  showNewMessageDrawer: false,
  showAttachmentDrawer: false,
  error: null
}

// Async thunks
export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async (params: { 
    page?: number
    limit?: number
    filters?: MessageFilters 
  } = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 20, filters = {} } = params
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters.type && { type: filters.type }),
        ...(filters.unreadOnly && { unreadOnly: 'true' }),
        ...(filters.conversationWith && { conversationWith: filters.conversationWith }),
        ...(filters.reservationId && { reservationId: filters.reservationId })
      })
      
      const response = await api.get(`/api/messages/conversations?${queryParams}`) as any
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversations')
    }
  }
)

export const fetchConversationMessages = createAsyncThunk(
  'messages/fetchConversationMessages',
  async (params: { 
    conversationId: string
    page?: number
    limit?: number 
  }, { rejectWithValue }) => {
    try {
      const { conversationId, page = 1, limit = 50 } = params
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      
      const response = await api.get(`/api/messages/conversations/${conversationId}?${queryParams}`) as any
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages')
    }
  }
)

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (params: SendMessageParams, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/messages', params) as any
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message')
    }
  }
)

export const startConversation = createAsyncThunk(
  'messages/startConversation',
  async (params: StartConversationParams, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/messages/conversations', params) as any
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start conversation')
    }
  }
)

export const markMessagesAsRead = createAsyncThunk(
  'messages/markAsRead',
  async (messageIds: string[], { rejectWithValue }) => {
    try {
      await api.put('/api/messages/mark-read', { messageIds }) as any
      return { messageIds }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark messages as read')
    }
  }
)

export const fetchUnreadCount = createAsyncThunk(
  'messages/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/messages/unread-count') as any
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count')
    }
  }
)

export const searchMessages = createAsyncThunk(
  'messages/searchMessages',
  async (params: {
    query: string
    page?: number
    limit?: number
    filters?: Pick<MessageFilters, 'type' | 'reservationId'>
  }, { rejectWithValue }) => {
    try {
      const { query, page = 1, limit = 20, filters = {} } = params
      const queryParams = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: limit.toString(),
        ...(filters.type && { type: filters.type }),
        ...(filters.reservationId && { reservationId: filters.reservationId })
      })
      
      const response = await api.get(`/api/messages/search?${queryParams}`) as any
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search messages')
    }
  }
)

export const deleteConversation = createAsyncThunk(
  'messages/deleteConversation',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/messages/conversations/${conversationId}`)
      return { conversationId }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete conversation')
    }
  }
)

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    // UI state management
    setActiveFilter: (state, action: PayloadAction<'all' | 'unread' | 'reservations' | 'support'>) => {
      state.activeFilter = action.payload
    },
    
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    
    setSelectedConversation: (state, action: PayloadAction<ConversationSummary | null>) => {
      state.selectedConversation = action.payload
      state.selectedConversationId = action.payload?.id || null
      if (action.payload) {
        state.messages = [] // Clear previous messages
      }
    },
    
    setShowNewMessageDrawer: (state, action: PayloadAction<boolean>) => {
      state.showNewMessageDrawer = action.payload
    },
    
    setShowAttachmentDrawer: (state, action: PayloadAction<boolean>) => {
      state.showAttachmentDrawer = action.payload
    },
    
    clearError: (state) => {
      state.error = null
    },
    
    // Optimistic updates
    addMessageOptimistic: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload)
      
      // Update conversation last message
      if (state.selectedConversation) {
        state.selectedConversation.lastMessage = {
          id: action.payload.id,
          content: action.payload.content,
          sentAt: action.payload.sentAt,
          senderId: action.payload.senderId,
          senderType: action.payload.senderType
        }
        state.selectedConversation.updatedAt = action.payload.sentAt
      }
      
      // Update conversation in list
      const conversationIndex = state.conversations.findIndex(
        conv => conv.id === state.selectedConversationId
      )
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].lastMessage = {
          id: action.payload.id,
          content: action.payload.content,
          sentAt: action.payload.sentAt,
          senderId: action.payload.senderId,
          senderType: action.payload.senderType
        }
        state.conversations[conversationIndex].updatedAt = action.payload.sentAt
      }
    },
    
    markConversationAsRead: (state, action: PayloadAction<string>) => {
      const conversationIndex = state.conversations.findIndex(
        conv => conv.id === action.payload
      )
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].unreadCount = 0
      }
      
      // Mark messages as read
      state.messages.forEach(message => {
        if (!message.isRead) {
          message.isRead = true
        }
      })
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch conversations
      .addCase(fetchConversations.pending, (state) => {
        state.conversationsLoading = true
        state.error = null
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversationsLoading = false
        state.conversations = (action.payload as any).conversations
        state.conversationsTotalCount = (action.payload as any).totalCount
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.conversationsLoading = false
        state.error = action.payload as string
      })
      
      // Fetch conversation messages
      .addCase(fetchConversationMessages.pending, (state) => {
        state.messagesLoading = true
        state.error = null
      })
      .addCase(fetchConversationMessages.fulfilled, (state, action) => {
        state.messagesLoading = false
        state.messages = action.payload as Message[]
      })
      .addCase(fetchConversationMessages.rejected, (state, action) => {
        state.messagesLoading = false
        state.error = action.payload as string
      })
      
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.isSending = true
        state.error = null
      })
      .addCase(sendMessage.fulfilled, (state) => {
        state.isSending = false
        // Message will be added via addMessageOptimistic
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSending = false
        state.error = action.payload as string
      })
      
      // Start conversation
      .addCase(startConversation.pending, (state) => {
        state.isSending = true
        state.error = null
      })
      .addCase(startConversation.fulfilled, (state) => {
        state.isSending = false
        state.showNewMessageDrawer = false
        // Will trigger conversation refetch
      })
      .addCase(startConversation.rejected, (state, action) => {
        state.isSending = false
        state.error = action.payload as string
      })
      
      // Mark as read
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        const messageIds = (action.payload as any).messageIds
        state.messages.forEach(message => {
          if (messageIds.includes(message.id)) {
            message.isRead = true
          }
        })
      })
      
      // Fetch unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = (action.payload as any).count
      })
      
      // Search messages
      .addCase(searchMessages.pending, (state) => {
        state.searchLoading = true
        state.error = null
      })
      .addCase(searchMessages.fulfilled, (state, action) => {
        state.searchLoading = false
        state.searchResults = action.payload as Message[]
      })
      .addCase(searchMessages.rejected, (state, action) => {
        state.searchLoading = false
        state.error = action.payload as string
      })
      
      // Delete conversation
      .addCase(deleteConversation.fulfilled, (state, action) => {
        const conversationId = (action.payload as any).conversationId
        state.conversations = state.conversations.filter(conv => conv.id !== conversationId)
        if (state.selectedConversationId === conversationId) {
          state.selectedConversation = null
          state.selectedConversationId = null
          state.messages = []
        }
      })
  }
})

export const {
  setActiveFilter,
  setSearchQuery,
  setSelectedConversation,
  setShowNewMessageDrawer,
  setShowAttachmentDrawer,
  clearError,
  addMessageOptimistic,
  markConversationAsRead
} = messageSlice.actions

export default messageSlice.reducer