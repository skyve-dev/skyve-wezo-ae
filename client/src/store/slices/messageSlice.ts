import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { api } from '../../utils/api'

// Types
export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderType: 'guest' | 'host' | 'support'
  recipientId: string
  recipientName: string
  recipientType: 'guest' | 'host' | 'support'
  subject: string
  content: string
  isRead: boolean
  isStarred: boolean
  attachments?: MessageAttachment[]
  translatedContent?: {
    language: string
    content: string
  }
  reservationId?: string
  propertyId?: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  createdAt: string
  updatedAt: string
  readAt?: string
}

export interface MessageAttachment {
  id: string
  filename: string
  url: string
  mimeType: string
  size: number
}

export interface Conversation {
  id: string
  participants: {
    id: string
    name: string
    type: 'guest' | 'host' | 'support'
    avatar?: string
  }[]
  subject: string
  lastMessage: Message
  unreadCount: number
  isArchived: boolean
  reservationId?: string
  propertyId?: string
  propertyName?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface MessageState {
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
  currentMessage: Message | null
  loading: boolean
  error: string | null
  stats: {
    totalUnread: number
    totalConversations: number
    totalMessages: number
    guestMessages: number
    supportMessages: number
  }
  filters: {
    type: 'all' | 'guest' | 'support' | 'unread' | 'starred'
    priority: string | null
    propertyId: string | null
    dateRange: {
      start: string | null
      end: string | null
    }
  }
  compose: {
    isOpen: boolean
    draft: {
      to: string
      subject: string
      content: string
      reservationId?: string
      propertyId?: string
    }
  }
}

const initialState: MessageState = {
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
}

// Helper function to calculate stats
const calculateStats = (conversations: Conversation[]): MessageState['stats'] => {
  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)
  const guestMessages = conversations.filter(conv => 
    conv.participants.some(p => p.type === 'guest')
  ).length
  const supportMessages = conversations.filter(conv => 
    conv.participants.some(p => p.type === 'support')
  ).length

  return {
    totalUnread,
    totalConversations: conversations.length,
    totalMessages: conversations.length, // Simplified count
    guestMessages,
    supportMessages
  }
}

// Async thunks
export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async (filters: { type?: string; propertyId?: string } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      if (filters?.type && filters.type !== 'all') {
        params.append('type', filters.type)
      }
      if (filters?.propertyId) {
        params.append('propertyId', filters.propertyId)
      }

      const response = await api.get<{ conversations: Conversation[] }>(`/api/messages/conversations?${params}`)
      return response.conversations
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch conversations')
    }
  }
)

export const fetchConversationMessages = createAsyncThunk(
  'messages/fetchConversationMessages',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const response = await api.get<{ messages: Message[]; conversation: Conversation }>(`/api/messages/conversations/${conversationId}`)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch conversation messages')
    }
  }
)

export const sendMessage = createAsyncThunk(
  'messages/send',
  async (params: { 
    conversationId?: string
    content: string
    attachments?: File[]
  } = { content: '' }, { getState, rejectWithValue }) => {
    const { conversationId, content, attachments } = params
    try {
      const state = getState() as { messages: MessageState }
      const { compose } = state.messages
      
      const formData = new FormData()
      formData.append('content', content)
      if (conversationId) {
        formData.append('conversationId', conversationId)
      } else {
        // New conversation
        formData.append('to', compose.draft.to)
        formData.append('subject', compose.draft.subject)
        if (compose.draft.reservationId) {
          formData.append('reservationId', compose.draft.reservationId)
        }
        if (compose.draft.propertyId) {
          formData.append('propertyId', compose.draft.propertyId)
        }
      }
      
      if (attachments) {
        attachments.forEach(file => {
          formData.append('attachments', file)
        })
      }

      const response = await api.post<{ message: Message; conversation: Conversation }>('/api/messages/send', formData)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to send message')
    }
  }
)

export const markAsRead = createAsyncThunk(
  'messages/markAsRead',
  async ({ messageId, conversationId }: { messageId?: string; conversationId?: string }, { rejectWithValue }) => {
    try {
      const endpoint = messageId 
        ? `/api/messages/${messageId}/read`
        : `/api/messages/conversations/${conversationId}/read`
      
      const response = await api.patch<{ success: boolean; updatedIds: string[] }>(endpoint)
      return { messageId, conversationId, updatedIds: response.updatedIds }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to mark as read')
    }
  }
)

export const markAsStarred = createAsyncThunk(
  'messages/markAsStarred',
  async ({ messageId, starred }: { messageId: string; starred: boolean }, { rejectWithValue }) => {
    try {
      const response = await api.patch<{ message: Message }>(`/api/messages/${messageId}/star`, { starred })
      return response.message
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update starred status')
    }
  }
)

export const archiveConversation = createAsyncThunk(
  'messages/archive',
  async ({ conversationId, archived }: { conversationId: string; archived: boolean }, { rejectWithValue }) => {
    try {
      const response = await api.patch<{ conversation: Conversation }>(`/api/messages/conversations/${conversationId}/archive`, { archived })
      return response.conversation
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to archive conversation')
    }
  }
)

export const deleteMessage = createAsyncThunk(
  'messages/delete',
  async (messageId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/messages/${messageId}`)
      return messageId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete message')
    }
  }
)

export const translateMessage = createAsyncThunk(
  'messages/translate',
  async ({ messageId, targetLanguage }: { messageId: string; targetLanguage: string }, { rejectWithValue }) => {
    try {
      const response = await api.post<{ translatedContent: string }>(`/api/messages/${messageId}/translate`, {
        targetLanguage
      })
      return { messageId, translatedContent: response.translatedContent, targetLanguage }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to translate message')
    }
  }
)

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentConversation: (state, action: PayloadAction<Conversation | null>) => {
      state.currentConversation = action.payload
      if (action.payload) {
        // Mark conversation as read when opened
        const conversation = state.conversations.find(c => c.id === action.payload!.id)
        if (conversation) {
          conversation.unreadCount = 0
        }
      }
    },
    setCurrentMessage: (state, action: PayloadAction<Message | null>) => {
      state.currentMessage = action.payload
    },
    updateFilters: (state, action: PayloadAction<Partial<MessageState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        type: 'all',
        priority: null,
        propertyId: null,
        dateRange: { start: null, end: null }
      }
    },
    openCompose: (state, action: PayloadAction<Partial<MessageState['compose']['draft']>>) => {
      state.compose.isOpen = true
      state.compose.draft = { ...state.compose.draft, ...action.payload }
    },
    closeCompose: (state) => {
      state.compose.isOpen = false
      state.compose.draft = {
        to: '',
        subject: '',
        content: ''
      }
    },
    updateComposeDraft: (state, action: PayloadAction<Partial<MessageState['compose']['draft']>>) => {
      state.compose.draft = { ...state.compose.draft, ...action.payload }
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      // Add new message to current conversation
      state.messages.push(action.payload)
      
      // Update conversation last message
      if (state.currentConversation && state.currentConversation.id === action.payload.conversationId) {
        state.currentConversation.lastMessage = action.payload
      }
      
      // Update conversation in list
      const convIndex = state.conversations.findIndex(c => c.id === action.payload.conversationId)
      if (convIndex !== -1) {
        state.conversations[convIndex].lastMessage = action.payload
        if (!action.payload.isRead && action.payload.senderType !== 'host') {
          state.conversations[convIndex].unreadCount += 1
        }
      }
      
      // Recalculate stats
      state.stats = calculateStats(state.conversations)
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch conversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false
        state.conversations = action.payload
        state.stats = calculateStats(action.payload)
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Fetch conversation messages
      .addCase(fetchConversationMessages.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchConversationMessages.fulfilled, (state, action) => {
        state.loading = false
        state.messages = action.payload.messages
        state.currentConversation = action.payload.conversation
        
        // Update conversation in list
        const convIndex = state.conversations.findIndex(c => c.id === action.payload.conversation.id)
        if (convIndex !== -1) {
          state.conversations[convIndex] = action.payload.conversation
        }
      })
      .addCase(fetchConversationMessages.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false
        state.messages.push(action.payload.message)
        
        // Update or add conversation
        const convIndex = state.conversations.findIndex(c => c.id === action.payload.conversation.id)
        if (convIndex !== -1) {
          state.conversations[convIndex] = action.payload.conversation
        } else {
          state.conversations.unshift(action.payload.conversation)
        }
        
        // Close compose if it was a new conversation
        if (!state.currentConversation) {
          state.compose.isOpen = false
          state.compose.draft = { to: '', subject: '', content: '' }
        }
        
        state.currentConversation = action.payload.conversation
        state.stats = calculateStats(state.conversations)
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const { conversationId, updatedIds } = action.payload
        
        // Update messages
        updatedIds.forEach(id => {
          const message = state.messages.find(m => m.id === id)
          if (message) {
            message.isRead = true
            message.readAt = new Date().toISOString()
          }
        })
        
        // Update conversation unread count
        if (conversationId) {
          const conversation = state.conversations.find(c => c.id === conversationId)
          if (conversation) {
            conversation.unreadCount = 0
          }
        }
        
        state.stats = calculateStats(state.conversations)
      })
      
      // Mark as starred
      .addCase(markAsStarred.fulfilled, (state, action) => {
        const index = state.messages.findIndex(m => m.id === action.payload.id)
        if (index !== -1) {
          state.messages[index] = action.payload
        }
      })
      
      // Archive conversation
      .addCase(archiveConversation.fulfilled, (state, action) => {
        const index = state.conversations.findIndex(c => c.id === action.payload.id)
        if (index !== -1) {
          state.conversations[index] = action.payload
        }
      })
      
      // Delete message
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.messages = state.messages.filter(m => m.id !== action.payload)
      })
      
      // Translate message
      .addCase(translateMessage.fulfilled, (state, action) => {
        const { messageId, translatedContent, targetLanguage } = action.payload
        const message = state.messages.find(m => m.id === messageId)
        if (message) {
          message.translatedContent = {
            language: targetLanguage,
            content: translatedContent
          }
        }
      })
  }
})

export const {
  clearError,
  setCurrentConversation,
  setCurrentMessage,
  updateFilters,
  clearFilters,
  openCompose,
  closeCompose,
  updateComposeDraft,
  addMessage
} = messageSlice.actions

export default messageSlice.reducer