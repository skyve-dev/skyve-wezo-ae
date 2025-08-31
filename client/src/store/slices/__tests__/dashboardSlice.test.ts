import {configureStore} from '@reduxjs/toolkit'
import dashboardReducer, {
  addNotification,
  clearError,
  clearFilters,
  type DashboardStats,
  type DashboardWidget,
  dismissQuickAction,
  fetchDashboardStats,
  fetchNotifications,
  fetchQuickActions,
  markNotificationAsRead,
  type Notification,
  type QuickAction,
  refreshDashboard,
  removeExpiredNotifications,
  setRefreshInterval,
  toggleWidget,
  updateFilters,
  updateWidget,
  updateWidgetLayout
} from '../dashboardSlice'
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

describe('dashboardSlice', () => {
  let store = configureStore({
    reducer: {
      dashboard: dashboardReducer
    }
  })

  beforeEach(() => {
    store = configureStore({
      reducer: {
        dashboard: dashboardReducer
      }
    })
    jest.clearAllMocks()
  })

  const mockStats: DashboardStats = {
    properties: {
      total: 5,
      active: 4,
      inactive: 1,
      pending: 0
    },
    reservations: {
      total: 25,
      confirmed: 15,
      pending: 3,
      completed: 5,
      cancelled: 2,
      checkingInToday: 2,
      checkingOutToday: 1
    },
    financial: {
      thisMonth: {
        earnings: 15000,
        bookings: 8,
        averageBookingValue: 1875,
        currency: 'AED'
      },
      yearToDate: {
        earnings: 75000,
        bookings: 45,
        currency: 'AED'
      },
      pendingPayout: {
        amount: 12750,
        currency: 'AED',
        nextPayoutDate: '2024-03-15'
      }
    },
    reviews: {
      totalReviews: 35,
      averageRating: 4.7,
      pendingResponses: 3,
      recentReviews: []
    },
    messages: {
      totalUnread: 5,
      totalConversations: 12,
      recentMessages: []
    },
    occupancy: {
      currentOccupancyRate: 78.5,
      averageOccupancyRate: 72.3,
      occupancyTrend: 'up',
      occupancyByProperty: []
    },
    performance: {
      topPerformingProperties: [],
      monthlyTrends: [],
      seasonalTrends: []
    }
  }

  const mockQuickAction: QuickAction = {
    id: 'qa-1',
    title: 'Respond to Review',
    description: 'New 5-star review from Jane Smith needs a response',
    type: 'important',
    category: 'review',
    actionRequired: 'Respond to guest review',
    relatedEntity: {
      id: 'review-1',
      type: 'review',
      name: 'Dubai Villa Review'
    },
    dueDate: '2024-03-20',
    createdAt: '2024-03-15T10:00:00Z'
  }

  const mockNotification: Notification = {
    id: 'notif-1',
    title: 'New Booking Confirmed',
    message: 'Your Dubai Villa has been booked for March 25-30, 2024',
    type: 'success',
    category: 'booking',
    isRead: false,
    actionUrl: '/reservations/res-1',
    relatedEntity: {
      id: 'res-1',
      type: 'reservation',
      name: 'WZ-2024-001'
    },
    createdAt: '2024-03-15T09:00:00Z'
  }

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().dashboard
      expect(state).toEqual(expect.objectContaining({
        stats: null,
        quickActions: [],
        notifications: [],
        loading: false,
        error: null,
        lastUpdated: null,
        refreshInterval: 300,
        filters: {
          dateRange: { start: null, end: null },
          propertyIds: [],
          includeInactive: true
        }
      }))
      expect(state.widgets).toHaveLength(4) // Default widgets
    })

    it('should have default widgets configured', () => {
      const state = store.getState().dashboard
      const widgetIds = state.widgets.map(w => w.id)
      expect(widgetIds).toContain('stats-overview')
      expect(widgetIds).toContain('earnings-chart')
      expect(widgetIds).toContain('recent-reservations')
      expect(widgetIds).toContain('occupancy-calendar')
    })
  })

  describe('reducers', () => {
    it('should clear error', () => {
      store.dispatch(clearError())
      const state = store.getState().dashboard
      expect(state.error).toBeNull()
    })

    it('should update filters', () => {
      const newFilters = {
        dateRange: {
          start: '2024-03-01',
          end: '2024-03-31'
        },
        propertyIds: ['prop-1', 'prop-2'],
        includeInactive: false
      }

      store.dispatch(updateFilters(newFilters))

      const state = store.getState().dashboard
      expect(state.filters).toEqual(newFilters)
    })

    it('should clear filters', () => {
      // First set some filters
      store.dispatch(updateFilters({
        propertyIds: ['prop-1'],
        includeInactive: false
      }))

      // Then clear them
      store.dispatch(clearFilters())

      const state = store.getState().dashboard
      expect(state.filters).toEqual({
        dateRange: { start: null, end: null },
        propertyIds: [],
        includeInactive: true
      })
    })

    it('should set refresh interval', () => {
      store.dispatch(setRefreshInterval(600)) // 10 minutes

      const state = store.getState().dashboard
      expect(state.refreshInterval).toBe(600)
    })

    it('should toggle widget visibility', () => {
      const initialState = store.getState().dashboard
      const widget = initialState.widgets[0]
      const initialVisibility = widget.isVisible

      store.dispatch(toggleWidget(widget.id))

      const state = store.getState().dashboard
      const updatedWidget = state.widgets.find(w => w.id === widget.id)
      expect(updatedWidget?.isVisible).toBe(!initialVisibility)
    })

    it('should update widget properties', () => {
      const widgetId = 'stats-overview'
      const updates = {
        position: { x: 2, y: 2 },
        size: { width: 6, height: 3 }
      }

      store.dispatch(updateWidget({ id: widgetId, updates }))

      const state = store.getState().dashboard
      const updatedWidget = state.widgets.find(w => w.id === widgetId)
      expect(updatedWidget?.position).toEqual(updates.position)
      expect(updatedWidget?.size).toEqual(updates.size)
    })

    it('should add notification', () => {
      store.dispatch(addNotification(mockNotification))

      const state = store.getState().dashboard
      expect(state.notifications).toHaveLength(1)
      expect(state.notifications[0]).toEqual(mockNotification)
    })

    it('should limit notifications to 50', () => {
      // Add 51 notifications
      for (let i = 0; i < 51; i++) {
        store.dispatch(addNotification({
          ...mockNotification,
          id: `notif-${i}`,
          title: `Notification ${i}`
        }))
      }

      const state = store.getState().dashboard
      expect(state.notifications).toHaveLength(50)
      expect(state.notifications[0].title).toBe('Notification 50') // Latest first
    })

    it('should remove expired notifications', () => {
      const expiredNotification = {
        ...mockNotification,
        id: 'expired-1',
        expiresAt: '2024-01-01T00:00:00Z' // Past date
      }
      const validNotification = {
        ...mockNotification,
        id: 'valid-1',
        expiresAt: '2026-01-01T00:00:00Z' // Future date
      }

      store.dispatch(addNotification(expiredNotification))
      store.dispatch(addNotification(validNotification))

      store.dispatch(removeExpiredNotifications())

      const state = store.getState().dashboard
      expect(state.notifications).toHaveLength(1)
      expect(state.notifications[0].id).toBe('valid-1')
    })
  })

  describe('fetchDashboardStats async thunk', () => {
    it('should fetch dashboard stats successfully', async () => {
      mockApi.get.mockResolvedValue({ stats: mockStats })

      await store.dispatch(fetchDashboardStats({
        dateRange: {
          start: '2024-03-01',
          end: '2024-03-31'
        }
      }))

      const state = store.getState().dashboard
      expect(state.stats).toEqual(mockStats)
      expect(state.loading).toBe(false)
      expect(state.lastUpdated).toBeDefined()
    })

    it('should handle fetch stats error', async () => {
      const errorMessage = 'Failed to fetch dashboard stats'
      mockApi.get.mockRejectedValue({
        response: { data: { error: errorMessage } }
      })
      await store.dispatch(fetchDashboardStats({}))

      const state = store.getState().dashboard
      expect(state.loading).toBe(false)
      expect(state.error).toBe(errorMessage)
    })

    it('should construct query params correctly', async () => {
      mockApi.get.mockResolvedValue({ stats: mockStats })

      await store.dispatch(fetchDashboardStats({
        dateRange: {
          start: '2024-03-01',
          end: '2024-03-31'
        },
        propertyIds: ['prop-1', 'prop-2'],
        includeInactive: false
      }))

      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('startDate=2024-03-01')
      )
      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('endDate=2024-03-31')
      )
      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('propertyIds=prop-1%2Cprop-2')
      )
      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('includeInactive=false')
      )
    })
  })

  describe('fetchQuickActions async thunk', () => {
    it('should fetch quick actions successfully', async () => {
      const mockActions = [mockQuickAction]
      mockApi.get.mockResolvedValue({ quickActions: mockActions })

      await store.dispatch(fetchQuickActions())

      const state = store.getState().dashboard
      expect(state.quickActions).toEqual(mockActions)
    })
  })

  describe('fetchNotifications async thunk', () => {
    it('should fetch notifications successfully', async () => {
      const mockNotifications = [mockNotification]
      mockApi.get.mockResolvedValue({ notifications: mockNotifications })

      await store.dispatch(fetchNotifications({
        unreadOnly: true,
        category: 'booking',
        limit: 10
      }))

      const state = store.getState().dashboard
      expect(state.notifications).toEqual(mockNotifications)
    })
  })

  describe('markNotificationAsRead async thunk', () => {
    it('should mark single notification as read', async () => {
      // Set initial state with unread notification
      store = configureStore({
        reducer: { dashboard: dashboardReducer },
        preloadedState: {
          dashboard: {
            ...store.getState().dashboard,
            notifications: [mockNotification]
          }
        }
      })

      mockApi.patch.mockResolvedValue({ updatedIds: ['notif-1'] })

      await store.dispatch(markNotificationAsRead({
        notificationId: 'notif-1'
      }))

      const state = store.getState().dashboard
      expect(state.notifications[0].isRead).toBe(true)
    })

    it('should mark all notifications as read', async () => {
      const unreadNotifications = [
        { ...mockNotification, id: 'notif-1' },
        { ...mockNotification, id: 'notif-2' }
      ]

      store = configureStore({
        reducer: { dashboard: dashboardReducer },
        preloadedState: {
          dashboard: {
            ...store.getState().dashboard,
            notifications: unreadNotifications
          }
        }
      })

      mockApi.patch.mockResolvedValue({ updatedIds: ['notif-1', 'notif-2'] })

      await store.dispatch(markNotificationAsRead({
        markAllRead: true
      }))

      const state = store.getState().dashboard
      expect(state.notifications.every(n => n.isRead)).toBe(true)
    })
  })

  describe('dismissQuickAction async thunk', () => {
    it('should dismiss quick action successfully', async () => {
      // Set initial state with quick action
      store = configureStore({
        reducer: { dashboard: dashboardReducer },
        preloadedState: {
          dashboard: {
            ...store.getState().dashboard,
            quickActions: [mockQuickAction]
          }
        }
      })

      mockApi.delete.mockResolvedValue({})

      await store.dispatch(dismissQuickAction('qa-1'))

      const state = store.getState().dashboard
      expect(state.quickActions).toHaveLength(0)
    })
  })

  describe('updateWidgetLayout async thunk', () => {
    it('should update widget layout successfully', async () => {
      const updatedWidgets: DashboardWidget[] = [{
        id: 'custom-widget',
        name: 'Custom Widget',
        type: 'stats',
        position: { x: 0, y: 0 },
        size: { width: 4, height: 2 },
        isVisible: true,
        settings: {}
      }]

      mockApi.patch.mockResolvedValue({ widgets: updatedWidgets })

      await store.dispatch(updateWidgetLayout(updatedWidgets))

      const state = store.getState().dashboard
      expect(state.widgets).toEqual(updatedWidgets)
      expect(state.loading).toBe(false)
    })
  })

  describe('refreshDashboard async thunk', () => {
    it('should refresh all dashboard data', async () => {
      mockApi.get
        .mockResolvedValueOnce({ stats: mockStats })
        .mockResolvedValueOnce({ quickActions: [mockQuickAction] })
        .mockResolvedValueOnce({ notifications: [mockNotification] })

      await store.dispatch(refreshDashboard())

      const state = store.getState().dashboard
      expect(state.loading).toBe(false)
      expect(state.lastUpdated).toBeDefined()

      // Should have called all three endpoints
      expect(mockApi.get).toHaveBeenCalledTimes(3)
      expect(mockApi.get).toHaveBeenCalledWith(expect.stringContaining('/api/dashboard/stats'))
      expect(mockApi.get).toHaveBeenCalledWith('/api/dashboard/quick-actions')
      expect(mockApi.get).toHaveBeenCalledWith(expect.stringContaining('/api/dashboard/notifications'))
    })

    it('should use current filters for refresh', async () => {
      // Set some filters first
      store.dispatch(updateFilters({
        dateRange: {
          start: '2024-03-01',
          end: '2024-03-31'
        },
        propertyIds: ['prop-1']
      }))

      mockApi.get
        .mockResolvedValueOnce({ stats: mockStats })
        .mockResolvedValueOnce({ quickActions: [] })
        .mockResolvedValueOnce({ notifications: [] })

      await store.dispatch(refreshDashboard())

      // Verify filters were applied to stats call
      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('startDate=2024-03-01')
      )
    })
  })

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      mockApi.get.mockRejectedValue(new Error('Network error'))

      await store.dispatch(fetchDashboardStats({}))

      const state = store.getState().dashboard
      expect(state.loading).toBe(false)
      expect(state.error).toBe('Failed to fetch dashboard stats')
    })

    it('should handle API errors with custom messages', async () => {
      const customError = 'Custom API error'
      mockApi.get.mockRejectedValue({
        response: { data: { error: customError } }
      })

      await store.dispatch(fetchQuickActions())

      const state = store.getState().dashboard
      expect(state.error).toBe(customError)
    })
  })

  describe('edge cases', () => {
    it('should handle empty data responses', async () => {
      mockApi.get.mockResolvedValue({ quickActions: [] })

      await store.dispatch(fetchQuickActions())

      const state = store.getState().dashboard
      expect(state.quickActions).toEqual([])
    })

    it('should handle undefined widget updates', () => {
      store.dispatch(toggleWidget('non-existent-widget'))

      const state = store.getState().dashboard
      // Should not crash, state should remain unchanged
      expect(state.widgets).toHaveLength(4)
    })

    it('should handle notifications without expiry date', () => {
      const notificationWithoutExpiry = {
        ...mockNotification,
        expiresAt: undefined
      }

      store.dispatch(addNotification(notificationWithoutExpiry))
      store.dispatch(removeExpiredNotifications())

      const state = store.getState().dashboard
      expect(state.notifications).toHaveLength(1) // Should not be removed
    })
  })
})