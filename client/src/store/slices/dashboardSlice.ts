import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { api } from '../../utils/api'

// Types
export interface DashboardStats {
  properties: {
    total: number
    active: number
    inactive: number
    pending: number
  }
  reservations: {
    total: number
    confirmed: number
    pending: number
    completed: number
    cancelled: number
    checkingInToday: number
    checkingOutToday: number
  }
  financial: {
    thisMonth: {
      earnings: number
      bookings: number
      averageBookingValue: number
      currency: string
    }
    yearToDate: {
      earnings: number
      bookings: number
      currency: string
    }
    pendingPayout: {
      amount: number
      currency: string
      nextPayoutDate: string
    }
  }
  reviews: {
    totalReviews: number
    averageRating: number
    pendingResponses: number
    recentReviews: {
      id: string
      guestName: string
      propertyName: string
      rating: number
      comment: string
      createdAt: string
      hasResponse: boolean
    }[]
  }
  messages: {
    totalUnread: number
    totalConversations: number
    recentMessages: {
      id: string
      senderName: string
      subject: string
      content: string
      createdAt: string
      isRead: boolean
      senderType: 'guest' | 'support'
    }[]
  }
  occupancy: {
    currentOccupancyRate: number
    averageOccupancyRate: number
    occupancyTrend: 'up' | 'down' | 'stable'
    occupancyByProperty: {
      propertyId: string
      propertyName: string
      occupancyRate: number
      bookedNights: number
      totalNights: number
    }[]
  }
  performance: {
    topPerformingProperties: {
      propertyId: string
      propertyName: string
      earnings: number
      bookingCount: number
      occupancyRate: number
      averageRating: number
    }[]
    monthlyTrends: {
      month: string
      earnings: number
      bookings: number
      occupancyRate: number
    }[]
    seasonalTrends: {
      season: 'spring' | 'summer' | 'autumn' | 'winter'
      averageBookings: number
      averageEarnings: number
      peakMonths: string[]
    }[]
  }
}

export interface QuickAction {
  id: string
  title: string
  description: string
  type: 'urgent' | 'important' | 'normal'
  category: 'property' | 'reservation' | 'review' | 'message' | 'finance'
  actionRequired: string
  relatedEntity: {
    id: string
    type: string
    name: string
  }
  dueDate?: string
  createdAt: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'warning' | 'error' | 'info'
  category: 'booking' | 'payment' | 'review' | 'message' | 'property' | 'system'
  isRead: boolean
  actionUrl?: string
  relatedEntity?: {
    id: string
    type: string
    name: string
  }
  createdAt: string
  expiresAt?: string
}

export interface DashboardWidget {
  id: string
  name: string
  type: 'stats' | 'chart' | 'list' | 'calendar' | 'recent-activity'
  position: { x: number; y: number }
  size: { width: number; height: number }
  isVisible: boolean
  settings: Record<string, any>
}

export interface DashboardState {
  stats: DashboardStats | null
  quickActions: QuickAction[]
  notifications: Notification[]
  widgets: DashboardWidget[]
  loading: boolean
  error: string | null
  lastUpdated: string | null
  refreshInterval: number // in seconds
  filters: {
    dateRange: {
      start: string | null
      end: string | null
    }
    propertyIds: string[]
    includeInactive: boolean
  }
}

const initialState: DashboardState = {
  stats: null,
  quickActions: [],
  notifications: [],
  widgets: [],
  loading: false,
  error: null,
  lastUpdated: null,
  refreshInterval: 300, // 5 minutes
  filters: {
    dateRange: {
      start: null,
      end: null
    },
    propertyIds: [],
    includeInactive: true
  }
}

// Default widget layout
const defaultWidgets: DashboardWidget[] = [
  {
    id: 'stats-overview',
    name: 'Stats Overview',
    type: 'stats',
    position: { x: 0, y: 0 },
    size: { width: 4, height: 2 },
    isVisible: true,
    settings: {}
  },
  {
    id: 'earnings-chart',
    name: 'Earnings Chart',
    type: 'chart',
    position: { x: 4, y: 0 },
    size: { width: 4, height: 2 },
    isVisible: true,
    settings: { chartType: 'line', period: 'month' }
  },
  {
    id: 'recent-reservations',
    name: 'Recent Reservations',
    type: 'list',
    position: { x: 0, y: 2 },
    size: { width: 4, height: 3 },
    isVisible: true,
    settings: { itemCount: 5 }
  },
  {
    id: 'occupancy-calendar',
    name: 'Occupancy Calendar',
    type: 'calendar',
    position: { x: 4, y: 2 },
    size: { width: 4, height: 3 },
    isVisible: true,
    settings: {}
  }
]

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (filters: {
    dateRange?: { start: string; end: string }
    propertyIds?: string[]
    includeInactive?: boolean
  } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      if (filters?.dateRange?.start) {
        params.append('startDate', filters.dateRange.start)
      }
      if (filters?.dateRange?.end) {
        params.append('endDate', filters.dateRange.end)
      }
      if (filters?.propertyIds && filters.propertyIds.length > 0) {
        params.append('propertyIds', filters.propertyIds.join(','))
      }
      if (filters?.includeInactive !== undefined) {
        params.append('includeInactive', filters.includeInactive.toString())
      }

      const response = await api.get<{ stats: DashboardStats }>(`/api/dashboard/stats?${params}`)
      return response.stats
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch dashboard stats')
    }
  }
)

export const fetchQuickActions = createAsyncThunk(
  'dashboard/fetchQuickActions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<{ quickActions: QuickAction[] }>('/api/dashboard/quick-actions')
      return response.quickActions
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch quick actions')
    }
  }
)

export const fetchNotifications = createAsyncThunk(
  'dashboard/fetchNotifications',
  async (filters: { unreadOnly?: boolean; category?: string; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      if (filters?.unreadOnly) {
        params.append('unreadOnly', 'true')
      }
      if (filters?.category) {
        params.append('category', filters.category)
      }
      if (filters?.limit) {
        params.append('limit', filters.limit.toString())
      }

      const response = await api.get<{ notifications: Notification[] }>(`/api/dashboard/notifications?${params}`)
      return response.notifications
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch notifications')
    }
  }
)

export const markNotificationAsRead = createAsyncThunk(
  'dashboard/markNotificationAsRead',
  async ({ notificationId, markAllRead = false }: { notificationId?: string; markAllRead?: boolean }, { rejectWithValue }) => {
    try {
      const endpoint = markAllRead 
        ? '/api/dashboard/notifications/mark-all-read'
        : `/api/dashboard/notifications/${notificationId}/read`
      
      const response = await api.patch<{ updatedIds: string[] }>(endpoint)
      return response.updatedIds
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to mark notification as read')
    }
  }
)

export const dismissQuickAction = createAsyncThunk(
  'dashboard/dismissQuickAction',
  async (actionId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/dashboard/quick-actions/${actionId}`)
      return actionId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to dismiss quick action')
    }
  }
)

export const updateWidgetLayout = createAsyncThunk(
  'dashboard/updateWidgetLayout',
  async (widgets: DashboardWidget[], { rejectWithValue }) => {
    try {
      const response = await api.patch<{ widgets: DashboardWidget[] }>('/api/dashboard/widget-layout', {
        widgets
      })
      return response.widgets
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update widget layout')
    }
  }
)

export const refreshDashboard = createAsyncThunk(
  'dashboard/refresh',
  async (_, { dispatch, getState }) => {
    const state = getState() as { dashboard: DashboardState }
    const { filters } = state.dashboard

    // Clean filters for API call
    const cleanFilters = {
      ...filters,
      dateRange: filters.dateRange.start && filters.dateRange.end ? {
        start: filters.dateRange.start,
        end: filters.dateRange.end
      } : undefined
    }

    // Fetch all dashboard data in parallel
    const promises = [
      dispatch(fetchDashboardStats(cleanFilters)),
      dispatch(fetchQuickActions()),
      dispatch(fetchNotifications({ limit: 10 }))
    ]

    await Promise.all(promises)
    return new Date().toISOString()
  }
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    ...initialState,
    widgets: defaultWidgets
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    updateFilters: (state, action: PayloadAction<Partial<DashboardState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        dateRange: { start: null, end: null },
        propertyIds: [],
        includeInactive: true
      }
    },
    setRefreshInterval: (state, action: PayloadAction<number>) => {
      state.refreshInterval = action.payload
    },
    toggleWidget: (state, action: PayloadAction<string>) => {
      const widget = state.widgets.find(w => w.id === action.payload)
      if (widget) {
        widget.isVisible = !widget.isVisible
      }
    },
    updateWidget: (state, action: PayloadAction<{ id: string; updates: Partial<DashboardWidget> }>) => {
      const { id, updates } = action.payload
      const widget = state.widgets.find(w => w.id === id)
      if (widget) {
        Object.assign(widget, updates)
      }
    },
    addWidget: (state, action: PayloadAction<DashboardWidget>) => {
      state.widgets.push(action.payload)
    },
    removeWidget: (state, action: PayloadAction<string>) => {
      state.widgets = state.widgets.filter(w => w.id !== action.payload)
    },
    resetWidgetLayout: (state) => {
      state.widgets = defaultWidgets
    },
    markLocalNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification) {
        notification.isRead = true
      }
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      // Add new notification to the top of the list
      state.notifications.unshift(action.payload)
      // Keep only the latest 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50)
      }
    },
    removeExpiredNotifications: (state) => {
      const now = new Date().toISOString()
      state.notifications = state.notifications.filter(n => !n.expiresAt || n.expiresAt > now)
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Fetch quick actions
      .addCase(fetchQuickActions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchQuickActions.fulfilled, (state, action) => {
        state.loading = false
        state.quickActions = action.payload
      })
      .addCase(fetchQuickActions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = action.payload
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Mark notification as read
      .addCase(markNotificationAsRead.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.loading = false
        action.payload.forEach((notificationId: string) => {
          const notification = state.notifications.find(n => n.id === notificationId)
          if (notification) {
            notification.isRead = true
          }
        })
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Dismiss quick action
      .addCase(dismissQuickAction.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(dismissQuickAction.fulfilled, (state, action) => {
        state.loading = false
        state.quickActions = state.quickActions.filter(qa => qa.id !== action.payload)
      })
      .addCase(dismissQuickAction.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Update widget layout
      .addCase(updateWidgetLayout.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateWidgetLayout.fulfilled, (state, action) => {
        state.loading = false
        state.widgets = action.payload
      })
      .addCase(updateWidgetLayout.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Refresh dashboard
      .addCase(refreshDashboard.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(refreshDashboard.fulfilled, (state, action) => {
        state.loading = false
        state.lastUpdated = action.payload
      })
      .addCase(refreshDashboard.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const {
  clearError,
  updateFilters,
  clearFilters,
  setRefreshInterval,
  toggleWidget,
  updateWidget,
  addWidget,
  removeWidget,
  resetWidgetLayout,
  markLocalNotificationAsRead,
  addNotification,
  removeExpiredNotifications
} = dashboardSlice.actions

export default dashboardSlice.reducer